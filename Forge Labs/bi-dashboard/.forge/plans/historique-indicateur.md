---
type: implementation-plan
slice: historique-indicateur
module: indicateurs
status: identified
generated_at: 2026-09-30
derived_from:
  - .forge/architecture.md
  - .forge/prd.md
  - .forge/design/design-system.md
  - .forge/design/screens/indicateur-detail.md
conventions_ref: .forge/conventions.md
---

# Plan d'implémentation — `historique-indicateur`

> **Vocation de ce document.** Produit en Phase 4 à partir de l'architecture. La Phase 5
> l'approfondit et le valide slice par slice : statut `identified`, pas `planned`.

## Sources

- **PRD** : `.forge/prd.md` — US-17 · B22, B24 (B18 **retiré**, PRD § 9) · E3, E8, E19
- **Architecture** : § 3.3, § 4.6, § 4.8, § 4.14, § 5.6, ADR-8
- **Design** : `indicateur-detail.md` — layout split screen, panneau d'historique 4 colonnes

## 1. Résumé de la slice

Montrer les versions signées d'un indicateur avec, pour chacune, sa valeur, sa date de
calcul **prise dans la source**, sa date de signature et son signataire — puis formuler
en langue métier l'écart entre deux versions. C'est la réponse à « pourquoi on m'a
annoncé 94,8 % et pas 96 % ? ».

**User stories** : US-17 (Voir pourquoi mon chiffre a changé)
**Règles** : B22, B24 · **Edge cases** : E3, E8, E19

## 2. Contrats de données (code)

### 2.1 Schémas de validation

```ts
// src/shared/schemas/history.schema.ts
import { z } from 'zod';

export const historyQuerySchema = z.object({
  teams: z.string().transform(s => s.split(',').filter(Boolean))
                  .pipe(z.array(z.string().regex(/^[A-Z0-9][A-Z0-9-]{1,15}$/)).min(1).max(50)),
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  grain: z.enum(['day', 'week', 'month'])
}).strict().refine(q => q.from <= q.to, { message: '`from` doit précéder `to`', path: ['to'] });
```

### 2.2 Types et interfaces

```ts
// src/features/indicators/historique/history.types.ts
export interface SignedVersionRow {
  readonly versionId: string;
  readonly versionLabel: string;        // « v3 »
  readonly signedAt: string;            // date de signature
  readonly signerName: string;          // signataire nommé, jamais l'auteur
  readonly authorName: string;
  readonly value: number | null;        // null si la source n'a pas la valeur
  readonly unit: string;
  readonly computedAt: string | null;   // date de calcul DE LA SOURCE (B5)
  readonly sourceRef: string;
  readonly changeNote: string;          // langue métier, pas un diff de formule
}

export interface VersionDiff {
  readonly from: string;                // « v2 »
  readonly to: string;                  // « v3 »
  readonly delta: number | null;
  readonly deltaPct: number | null;
  readonly explanation: string;         // changeNote de la version cible
  /** E19 : la valeur n'a pas bougé ; la cause est ailleurs. */
  readonly unchangedReason: 'definition_changed' | 'source_scope_moved' | null;
}
```

### 2.3 Contrats API

- `GET /api/v1/indicators/:slug/history` — architecture § 5.6

## 3. Algorithmes critiques

### 3.1 `readSignedHistory` (couvre B22, B24, B5, E19)

```
ENTRÉES : slug, query, actor
1  decision = auth.resolveIndicatorAccess(actor, indicateur, scope)
   refus → journaliser 'refused' + 403 avec les équipes manquantes
2  journaliser la consultation AVANT la lecture :
   ressource 'history', outcomegranté/refusé, scope, request_id
   → c'est une CONSULTATION, pas une administration (B24)
3  versions = SELECT … FROM definition_version
               JOIN signature_event ON act = 'sign' AND non révoquée
               WHERE indicator_id = ? AND status IN ('signed','published')
               ORDER BY version_no DESC
   aucune → 404 « Historique introuvable. »
4  POUR CHAQUE version :
     outcome = queryEngine.readSignedSeries({ indicatorKey, versionIds, scope })
       'value' → value + computedAt + sourceRef
       'empty' → value = null ; la LIGNE EST MALGRÈ TOUT AFFICHÉE (B5)
       'source_unavailable' → value = null, computedAt = dernier connu
5  diff = computeDiff(rows[1], rows[0]) :
     delta     = rows[0].value - rows[1].value
     deltaPct  = rows[1].value ? (delta / rows[1].value) * 100 : null
     explanation = rows[0].changeNote
     SI delta = 0 OU rows[0].value IS NULL
       → unchangedReason :
            si la définition a changé   → 'definition_changed'
            si le périmètre source a bougé → 'source_scope_moved'
            sinon                        → null
       et l'indicateur CONSERVE son statut officiel (E19 : aucune correction
       automatique n'est appliquée ; le constat est remonté au propriétaire)
6  renvoyer { versions, diff }
```

## 4. Plan composants

### 4.1 Arbre de composants

```
IndicatorDetailPage (server, split screen)
├── contenu 8 col : IndicatorTile + drill-down
└── panneau 4 col : HistoryPanel
    ├── HistoryRow × n
    │   ├── versionLabel   (« v3 », mono)
    │   ├── value          (mono, TOUJOURS accompagné de computedAt)
    │   ├── computedAt     (caption)   ← jamais absent
    │   ├── signedAt + signerName
    │   └── changeNote
    └── DiffSummary
        ├── delta / deltaPct
        ├── explanation     (langue métier)
        └── UnchangedNote   (E19)
```

### 4.2 Composants

| Composant | Type | Fichier cible | Props | State | Événements |
|---|---|---|---|---|---|
| `HistoryPanel` | Server | `src/features/indicateurs/historique/history-panel.tsx` | `{ rows: SignedVersionRow[]; diff: VersionDiff \| null; state: TableState }` | — | `onSelectVersion` |
| `DiffSummary` | Server | `src/features/indicateurs/historique/diff-summary.tsx` | `{ diff: VersionDiff }` | — | — |
| `ProvenanceStrip` | Server | `src/components/provenance-strip.tsx` | architecture § 2.3 | — | — |

### 4.3 États par écran

#### Écran : `indicateur-detail` (panneau historique)

| État | Condition | Composants affichés | Données |
|---|---|---|---|
| vide | Aucune version signée | `DataTable: empty_no_data` « aucune version signée » | — |
| chargement | Série en cours de lecture | Skeleton de ligne, `computedAt` réservé | — |
| rempli | Au moins une version signée | `HistoryRow` × n + `DiffSummary` | `SignedVersionRow[]` |
| erreur | Entrepôt injoignable | `DataTable: error` ; **les signatures restent affichées** | `error_code` |
| vide-données | Version signée sans valeur sur la période | Ligne présente, valeur absente, date de calcul `null` ⇒ « fraîcheur inconnue » | B6 |
| propriétaire inactif | B17, E8 | Mention « propriétaire inactif » ; l'historique reste consultable | E8 |

### 4.4 Formulaires

Aucun.

## 5. Gestion d'état

| Donnée | Portée | Stockage | Initialisation | Mise à jour |
|---|---|---|---|---|
| Versions signées | serveur | `definition_version` + `signature_event` | Rendu serveur | Aucune : append-only |
| Valeurs par version | serveur | `query_cache` (24 h) par version | Rendu serveur | Revalidation intervalle unique |
| Période | URL | query params | Lien | Navigation |
| Version comparée | composant | `useState` (paire de versions) | Les deux plus récentes | Clic sur une ligne |

## 6. Traçabilité des règles

| ID | Règle (PRD) | Implémentée où | Approche |
|---|---|---|---|
| B22 | Les valeurs restent rattachées à la version qui les a produites | § 3.1 étape 3-4, ADR-8 | `versionIds` figés dans la requête ; aucune réécriture |
| B24 | L'historique est journalisé comme une consultation | § 3.1 étape 2, `resource_kind = 'history'` | Journalisation avant lecture |
| B5 | Chaque valeur porte sa date de calcul de la source | § 3.1 étape 4 | `computedAt` par ligne, `null` ⇒ « inconnu » |
| B18 | Partage par lien public | **Retiré** (PRD § 9) | Aucun jeton dans l'URL d'historique |

| ID | Edge case | Approche | Où |
|---|---|---|---|
| E3 | Matérialisation pas rafraîchie | Ligne affichée, `computedAt` de la dernière lecture connue | Étape 4 |
| E8 | Propriétaire inactif | Historique consultable, mention « non officiel » | `readSignedHistory` |
| E19 | Définition ou périmètre changé sans que la valeur bouge | `unchangedReason` + constat remonté, **statut officiel conservé** | Étape 5 |

| ID | Contrainte | Comment elle est respectée |
|---|---|---|
| C4 | Journal conservé un an | La consultation d'historique entre dans `access_log`, purgée à 365 j |
| C2 | Aucune saisie | Panneau de lecture seule |

## 7. Pièges à éviter

- **Un diff de formule** — ⚠️ Ne pas composer l'explication par différence de `formula` ou de
  `scope_expr`. US-17 demande « les lignes sous-traitées ne sont plus comptées » ; l'explication vient
  de `change_note`, écrit par un humain.
- **Une ligne d'historique sans date de calcul** — ⚠️ Ne pas afficher une valeur sans `computedAt`.
  « Chaque ligne de l'historique porte sa propre date de calcul » : un historique qui montre un
  nombre sans sa date est pire que pas d'historique.
- **Une seule date calculée pour toutes les versions** — ⚠️ Ne pas réutiliser le `computed_at` de la
  version courante. Chaque version a sa propre lecture : c'est ce qui rend l'historique interpretable.
- **Un histogramme de valeurs** — ⚠️ Ne pas tracer une courbe sans dates. Chaque point est une paire
  (valeur, `computed_at`) et rien d'autre.
- **Une correction automatique en E19** — ⚠️ Ne pas « corriger » une incohérence détectée. Le constat
  remonte au propriétaire ; l'indicateur garde son statut officiel (roadmap § 5, E19).

## 8. Dépendances

| Dépend de | Nature | Statut | Fallback si absent |
|---|---|---|---|
| `query-engine` | `readSignedSeries`, `computed_at` par version | vague 0 | Mock à la frontière de `server/query` |
| `definition-signer` | `signature_event` (actes signés, non révoqués) | vague 2 | Jeu de données en test d'intégration |
| `access-log` | Journalisation de la consultation (B24) | vague 0 | Buffer mémoire en test unitaire |

## 9. Checklist de tâches

- [ ] Schéma Zod § 2.1
- [ ] `readSignedHistory`, `computeDiff` (§ 3)
- [ ] `HistoryPanel` en split screen, panneau 4 colonnes
- [ ] Journalisation `resource_kind = 'history'` **avant** la lecture
- [ ] Rendu E19 : `UnchangedNote`
- [ ] Test : toute ligne affichée porte un `computedAt` (ou la mention « inconnue »)

## 10. Critères d'acceptation

- [ ] B5 : chaque ligne porte sa propre date de calcul issue de la source
- [ ] B22 : une nouvelle version signée ne réécrit pas les valeurs précédentes
- [ ] B24 : la consultation de l'historique apparaît dans le journal comme une consultation
- [ ] US-17 : l'écart est formulé en langue métier, pas en diff de formule
- [ ] E19 : un écart inexpliqué est signalé sans correction automatique
- [ ] Quiconque peut lire la valeur courante peut lire l'historique, sans être l'auteur

## 11. Plan de tests

| Cible | Scénarios | IDs couverts |
|---|---|---|
| `readSignedHistory` | deux versions signées · version révoquée exclue · propriétaire inactif · source indisponible | B22, B24, E1, E8 |
| `computeDiff` | delta calculé · cible nulle · valeur inchangée avec définition changée | E19 |
| `HistoryPanel` | ligne sans `computedAt` ⇒ « fraîcheur inconnue » · ligne sans valeur conservée | B5, B6 |
| Intégration | la consultation est journalisée avec `resource_kind = 'history'` | B24 |

**Statut** : `identified` — à approfondir et valider en Phase 5.
