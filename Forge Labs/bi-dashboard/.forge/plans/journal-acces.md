---
type: implementation-plan
slice: journal-acces
module: acces
status: identified
generated_at: 2026-09-30
derived_from:
  - .forge/architecture.md
  - .forge/prd.md
  - .forge/design/design-system.md
  - .forge/design/screens/acces-journal.md
conventions_ref: .forge/conventions.md
---

# Plan d'implémentation — `journal-acces`

> **Vocation de ce document.** Produit en Phase 4 à partir de l'architecture. La Phase 5
> l'approfondit et le valide slice par slice : statut `identified`, pas `planned`.

## Sources

- **PRD** : `.forge/prd.md` — US-8 · B10, B23, B25 · E14
- **Architecture** : § 3.6, § 2.4, § 4.14, § 5.18, § 5.19, ADR-6
- **Design** : `acces-journal.md`

## 1. Résumé de la slice

Permettre à une personne **nommée** de consulter le journal des accès — filtré selon ses
propres droits — et d'en demander un export. La consultation du journal est elle-même
journalisée. C'est une contrainte légale (C4), donc non négociable.

**User stories** : US-8 (Justifier ce que j'ai consulté)
**Règles** : B10, B23, B25 · **Edge cases** : E14

## 2. Contrats de données (code)

### 2.1 Schémas de validation

```ts
// src/shared/schemas/journal.schema.ts
import { z } from 'zod';

export const journalFilterSchema = z.object({
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  actor_id: z.string().max(255).optional(),
  resource_kind: z.enum(['indicator', 'dashboard', 'definition', 'history', 'export', 'journal']).optional(),
  resource_slug: z.string().max(120).optional(),
  outcome: z.enum(['granted', 'refused', 'not_found', 'error']).optional(),
  limit: z.coerce.number().int().min(1).max(200).default(100),
  cursor: z.string().max(200).optional()
}).strict()
.refine(f => f.from <= f.to, { message: '`from` doit précéder `to`', path: ['to'] })
.refine(f => daysBetween(f.from, f.to) <= 31, { message: 'Fenêtre maximale : 31 jours', path: ['to'] });

export const journalExportSchema = z.object({
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  format: z.enum(['csv', 'pdf'])
}).strict();
```

### 2.2 Types et interfaces

```ts
// src/features/access/journal/journal.types.ts
export interface JournalEntry {
  readonly accessLogId: string;
  readonly occurredAt: string;
  readonly actorId: string;
  readonly actorName: string;
  readonly resourceKind: 'indicator' | 'dashboard' | 'definition' | 'history' | 'export' | 'journal';
  readonly resourceSlug: string;      // journalisé MÊME en cas de refus (B25)
  readonly scopeTeams: readonly string[] | null;
  readonly scopePeriod: string | null;
  readonly outcome: 'granted' | 'refused' | 'not_found' | 'error';
  readonly errorCode: string | null;
  readonly requestId: string;
  /** JAMAIS de détail de ligne : B25. Aucune colonne ici ne peut en contenir. */
}

export interface JournalPage {
  readonly entries: readonly JournalEntry[];
  readonly nextCursor: string | null;
  readonly totalVisible: number;
  /** Nombre d'entrées existantes mais non visibles pour ce lecteur (B25). */
  readonly redactedCount: number;
}
```

### 2.3 Contrats API

- `GET /api/v1/access-log` — § 5.18
- `POST /api/v1/access-log/exports` — § 5.19

## 3. Algorithmes critiques

### 3.1 `writeAccessLog` (couvre B10)

```
ENTRÉES : AccessLogEntry
1  INSERT access_log (occurred_at = now(), expires_at = now() + 365 j)
2  RIEN D'AUTRE. Le rôle applicatif n'a ni UPDATE ni DELETE
   — « une lecture ne peut pas le modifier ni le purger » (7.2)
3  ÉCHEC D'INSERT :
     le journal est sur le chemin critique de la preuve.
     On ne masque PAS l'échec : l'entrée est retentée en file d'attente et
     l'échec est remonté dans la réponse technique. Une consultation non
     journalisée est une consultation qui n'a pas eu lieu.
```

### 3.2 `readJournal` (couvre B23, B25, ADR-6)

```
ENTRÉES : journalFilterSchema, viewer SessionActor
1  habilitation : viewer.roles contient 'auditeur' ET viewer est une personne nommée
   (is_directory_entry = true, is_active = true) → sinon 403 JOURNAL_FORBIDDEN
2  filtre = filtre demandé ∩ filtre des droits du lecteur
   selected_resources = ressources que le lecteur PEUT voir
     indicateurs : resolveIndicatorAccess(indicateur) sur chacun
     dashboards  : resolveDashboardAccess(dashboard)
     Les ressources résolues une fois, en cache de requête (≤ 200 par page)
3  totalAll     = COUNT(*) sur le filtre demandé           ← le VRAI total
   totalVisible = COUNT(*) sur le filtre ∩ droits
   redactedCount = totalAll - totalVisible                 ← RENDU À L'UI (B25)
4  SELECT … WHERE filtre ∩ droits ORDER BY occurred_at DESC LIMIT …
5  journaliser la consultation elle-même : ressource 'journal' (B23)
6  renvoyer JournalPage
```

> Un journal non filtré n'est pas une protection : il dit précisément **quels**
> indicateurs existent, ce que l'écran nie délibérément (E5). Un journal filtré et
> muet serait pire qu'un journal absent, parce qu'il passerait pour complet.

### 3.3 `exportJournal` (couvre B23, B25, E14)

```
1  même habilitation que readJournal → 403 sinon
2  même filtre que readJournal : l'EXPORT passe par le MÊME filtre que l'écran
   → un export ne peut pas devenir le chemin qui contourne B25
3  enqueue un job `kind = 'journal'` (worker de `export-provenance`)
4  journaliser la demande d'export du journal
5  renvoyer 202
```

## 4. Plan composants

### 4.1 Arbre de composants

```
AccessLogPage (server)
├── JournalFilterBar    période, acteur, ressource, issue (dans l'URL)
├── RedactionNotice     « 37 entrées hors de votre périmètre ne sont pas affichées »
├── DataTable variant="reference"
│   ├── colonnes : horodatage | identité | ressource | périmètre | issue | request_id
│   ├── outcome 'refused' rendu en --color-out-of-band + libellé textuel
│   └── pagination par curseur
└── ExportButton        demande d'export du journal

JournalForbidden (état)
└── explication : « Seules les personnes habilitées peuvent consulter le journal
    des accès. Votre demande est journalisée. »
```

### 4.2 Composants

| Composant | Type | Fichier cible | Props | State | Événements |
|---|---|---|---|---|---|
| `AccessLogPage` | Server | `src/app/(dashboard)/acces/journal/page.tsx` | `{ searchParams }` | — | — |
| `JournalFilterBar` | Client | `src/features/access/journal/journal-filter-bar.tsx` | `{ value: JournalFilter }` | `{ pending: boolean }` | push URL |
| `RedactionNotice` | Server | `src/features/access/journal/redaction-notice.tsx` | `{ redactedCount: number }` | — | — |
| `DataTable` | Server | `src/components/data-table.tsx` | architecture § 2.3 | — | tri, page |

### 4.3 États par écran

#### Écran : `acces-journal`

| État | Condition | Composants affichés | Données |
|---|---|---|---|
| vide | Aucune entrée sur la fenêtre | `DataTable: empty_no_data` + commande de fenêtrage | — |
| chargement | Requête en cours | `DataTable: loading` | — |
| rempli | Entrées visibles | Tableau + `RedactionNotice` si `redactedCount > 0` | `JournalPage` |
| erreur | Panne interne | `DataTable: error` + `Réessayer` | `error_code` |
| hors périmètre | Rôle non habilité | `JournalForbidden` — explication en clair | — |
| accès journalisé | Chaque consultation | Mention « votre consultation est journalisée » | B23 |

### 4.4 Formulaires

| Formulaire | Bibliothèque | Schéma | Soumission | Gestion d'erreur |
|---|---|---|---|---|
| Filtres du journal | React Hook Form + URL | `journalFilterSchema` | Navigation (`router.push`) | Erreur au champ : fenêtre > 31 jours |
| Demande d'export | React Hook Form | `journalExportSchema` | Server Action | Erreur au champ |

## 5. Gestion d'état

| Donnée | Portée | Stockage | Initialisation | Mise à jour |
|---|---|---|---|---|
| Filtres | URL | query params | Lien de contrôle | Navigation |
| Entrées | serveur | `access_log` + filtre de droits | Rendu serveur | Curseur suivant |
| Compteur de rédaction | serveur | `COUNT(*)` de la requête | Rendu serveur | — |
| Purge | job planifié | `expires_at` | Quotidien | Automatique à 365 j |

## 6. Traçabilité des règles

| ID | Règle (PRD) | Implémentée où | Approche |
|---|---|---|---|
| B10 | Toute consultation est journalisée, y compris les refus ; conservé un an | § 3.1 | INSERT sur le chemin critique + `expires_at = +365 j` |
| B23 | Seules des personnes nommées consultent le journal, et cette consultation est journalisée | § 3.2 étapes 1, 5 | Habilitation `auditeur` + entrée `resource_kind = 'journal'` |
| B25 | Le journal est filtré selon les droits du lecteur ; un refus journalise la ressource, jamais les lignes | § 3.2 étape 3, § 3.3 étape 2 | Filtre dans `access-log` + `redactedCount` rendu visible |

| ID | Edge case | Approche | Où |
|---|---|---|---|
| E14 | Groupe d'accès modifié | Nouvelle composition à la lecture suivante, journalisée avec elle | `actor_group_member.valid_to` |
| E5 | Ressource interdite visée par une autre personne | Entrée journalisée avec la ressource visée ; **invisible** pour un lecteur non habilité | `readJournal` étape 2 |

| ID | Contrainte | Comment elle est respectée |
|---|---|
| C4 | Journal conservé un an, purgé automatiquement, consultable | `expires_at` par ligne + rôle de purge distinct, journalisé |
| C10 | Chiffrement au repos, isolation par ligne, PITR | Le journal est dans PostgreSQL, pas dans l'entrepôt ; rôle applicatif sans `UPDATE`/`DELETE` |
| 7.2 | Le journal est en écriture seule | Contrainte de droits SQL, vérifiable par un test d'intégration |

## 7. Pièges à éviter

- **Un journal non filtré « réservé à quelques personnes »** — ⚠️ Ne pas faire. Le journal nomme
  `resource_slug` : dire qu'un indicateur existe, qui l'a consulté et à quelle fréquence est une
  divulgation que l'écran nie (E5, ADR-6).
- **Un filtre silencieux** — ⚠️ Ne pas renvoyer la page amputée sans rien dire. `redactedCount` est
  rendu à l'interface : un journal filtré et muet passerait pour un journal complet.
- **Un `export` du journal par un chemin distinct** — ⚠️ Ne pas réutiliser un endpoint d'export
  générique qui ignorerait le filtre. `POST /api/v1/access-log/exports` applique **le même** filtre
  que la lecture.
- **Une colonne « nombre de lignes renvoyées »** — ⚠️ Ne pas l'ajouter. Même agrégée, elle fuite le
  périmètre : 0 ligne et 12 lignes sur un client interdit sont deux réponses différentes.
- **Autoriser la suppression d'une entrée** — ⚠️ Ne pas offrir de purge manuelle. La purge est
  automatique à un an et passe par un rôle distinct, journalisé (C4, 7.2).
- **Journaliser après coup** — ⚠️ Ne pas journaliser en `finally` après le rendu. L'entrée est
  écrite **avant** la lecture : si la source tombe, la tentative doit rester prouvable.

## 8. Dépendances

| Dépend de | Nature | Statut | Fallback si absent |
|---|---|---|---|
| `auth` | Habilitation `auditeur`, résolution des droits pour le filtre (B25) | vague 0 | Aucun : fail-closed ⇒ 403 |
| `access-log` | `append`, `list` filtré, `purgeExpired` | vague 0 | Buffer mémoire en test unitaire, jamais en production |

## 9. Checklist de tâches

- [ ] Schémas Zod § 2.1 (fenêtre ≤ 31 jours, `limit` ≤ 200)
- [ ] `writeAccessLog`, `readJournal`, `exportJournal` (§ 3)
- [ ] Rôle SQL applicatif : `INSERT` + `SELECT` **uniquement** ; rôle de purge distinct
- [ ] Job de purge quotidienne sur `expires_at`
- [ ] Écran `acces-journal` : filtre, `RedactionNotice`, `JournalForbidden`
- [ ] Test d'intégration : le rôle applicatif ne peut ni `UPDATE` ni `DELETE`
- [ ] Test : l'export du journal contient exactement les mêmes entrées que l'écran

## 10. Critères d'acceptation

- [ ] B10 : toute consultation est journalisée, refus compris ; la purge à un an est automatique
- [ ] B23 : seule une personne nommée et habilitée accède au journal, et sa consultation est journalisée
- [ ] B25 : le journal renvoyé ne contient aucune entrée hors des droits du lecteur
- [ ] B25 : une entrée de refus porte la ressource visée, jamais le détail des lignes
- [ ] `redactedCount` rend visible le fait que le journal est filtré
- [ ] 7.2 : le journal est en écriture seule pour l'application

## 11. Plan de tests

| Cible | Scénarios | IDs couverts |
|---|---|---|
| `writeAccessLog` | consultation accordée · refus · source indisponible (entrée conservée) · purge à 365 j | B10, C4 |
| `readJournal` | lecteur non habilité · entrées hors périmètre filtrées · `redactedCount` exact | B23, B25 |
| `readJournal` | refus journalisé avec la ressource, sans détail de lignes | B25 |
| `exportJournal` | même filtre que la lecture · consultation journalisée | B23, B25 |
| Intégration SQL | `UPDATE` et `DELETE` refusés au rôle applicatif | 7.2, C4 |

**Statut** : `identified` — à approfondir et valider en Phase 5.
