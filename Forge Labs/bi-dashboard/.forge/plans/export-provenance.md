---
type: implementation-plan
slice: export-provenance
module: tableau-de-bord
status: identified
generated_at: 2026-09-30
derived_from:
  - .forge/architecture.md
  - .forge/prd.md
  - .forge/design/design-system.md
  - .forge/design/screens/tableau-de-bord.md
  - .forge/design/screens/indicateur-detail.md
conventions_ref: .forge/conventions.md
---

# Plan d'implémentation — `export-provenance`

> **Vocation de ce document.** Produit en Phase 4 à partir de l'architecture. La Phase 5
> l'approfondit et le valide slice par slice : statut `identified`, pas `planned`.

## Sources

- **PRD** : `.forge/prd.md` — US-9 · B8, B27, B22, B7 · E6, E13
- **Architecture** : § 3.4, § 4.12, § 4.13, § 5.15 à § 5.17, ADR-5, ADR-8
- **Design** : `ExportPanel` — états `idle`, `queued`, `running`, `ready`, `failed`, `forbidden_scope`

## 1. Résumé de la slice

Produire en **tâche de fond** un PDF ou un CSV portant exactement le périmètre, la
période, la version de définition, la date de signature, la date de calcul et la source
de l'écran d'origine. Un support qui circule en réunion ne doit pas pouvoir être
déconnecté du chiffre qu'il affirme.

**User stories** : US-9 (Exporter une vue pour une réunion)
**Règles** : B8, B27, B22, B7 · **Edge cases** : E6, E13

## 2. Contrats de données (code)

### 2.1 Schémas de validation

```ts
// src/shared/schemas/export.schema.ts
import { z } from 'zod';
import { scopeSchema } from './scope.schema';

export const createExportSchema = z.object({
  source_kind: z.enum(['dashboard', 'indicator', 'history']),
  source_id: z.string().uuid(),
  format: z.enum(['pdf', 'csv']),
  scope: scopeSchema
}).strict();
export type CreateExportInput = z.infer<typeof createExportSchema>;
```

### 2.2 Types et interfaces

```ts
// src/features/dashboards/export/export.types.ts
import type { Scope } from '@/shared/schemas/scope.schema';

export type ExportState = 'idle' | 'queued' | 'running' | 'ready' | 'failed' | 'forbidden_scope';

export interface ExportJob {
  readonly exportJobId: string;
  readonly requestedByActorId: string;
  readonly sourceKind: 'dashboard' | 'indicator' | 'history';
  readonly sourceId: string;
  readonly format: 'pdf' | 'csv';
  /** PHOTOGRAPHIE du périmètre au moment de la demande — jamais une référence (B8). */
  readonly scopeSnapshot: Scope;
  /** Versions figées au moment de la demande (B22, B27). */
  readonly versionPins: readonly string[];
  readonly idempotencyKey: string;
  readonly state: 'queued' | 'running' | 'ready' | 'failed' | 'refused';
  readonly errorCode: string | null;
  readonly requestedAt: string;
  readonly startedAt: string | null;
  readonly finishedAt: string | null;
}

export interface ExportProvenanceHeader {
  readonly definitionVersionId: string;
  readonly definitionSignedAt: string | null;
  readonly computedAt: string | null;   // date de calcul DE LA SOURCE (B27)
  readonly sourceRef: string;
  readonly exportedBy: string;
  readonly exportedAt: string;
}

export interface ExportJobPort {
  enqueue(input: { kind: 'view' | 'journal'; payload: unknown; idempotencyKey: string }): Promise<string>;
  claim(): Promise<ExportJob | null>;
  complete(jobId: string, provenance: ExportProvenanceHeader, size: number, rows: number | null): Promise<void>;
  fail(jobId: string, errorCode: string): Promise<void>;
  heartbeat(jobId: string): Promise<void>;
}
```

### 2.3 Contrats API

- `POST /api/v1/exports` — § 5.15
- `GET /api/v1/exports/:exportId` — § 5.16
- `GET /api/v1/exports/:exportId/artifact` — § 5.17

## 3. Algorithmes critiques

### 3.1 `requestExport` (couvre B8, E6, ADR-5)

```
ENTRÉES : CreateExportInput, actor, Idempotency-Key
1  parser → 422
2  clé d'idempotence déjà vue ? → renvoyer le job existant (409 si en file)
3  charger la ressource ; inaccessible ou non partagée → 403 / 404
4  originScope = scope de l'écran d'origine (dérivé de la ressource, pas du client)
5  assertNotWidened(requested, originScope)   ← `restriction-lignes`
     échec → 403 EXPORT_SCOPE_DENIED avec le périmètre autorisé nommément (E6)
6  versionPins = versions ÉPINGLÉES / signées de la ressource, figées MAINTENANT
7  INSERT export_job (state = 'queued', scope_snapshot = requested, version_pins)
8  INSERT access_log (ressource 'export', outcome 'granted')
9  renvoyer 202 avec export_job_id
   → L'export ne part JAMAIS dans le cycle de la requête HTTP (ADR-5)
```

### 3.2 `produceArtifact` — worker (couvre B8, B27, B22, B7, E13)

```
ENTRÉES : job ExportJob
1  job = claim() ; heartbeat toutes les 30 s ; state = 'running'
2  rejouer la résolution de droits pour l'auteur du job
     droits perdus entre-temps → fail(EXPORT_SCOPE_DENIED)   (B7)
3  LIRE les données avec scope = job.scope_snapshot
   — jamais le scope courant : l'export reproduit l'écran d'origine (B8)
4  PRODUIRE le fichier dans le stockage objet
     entête de provenance, TOUJOURS présent :
       version de définition · date de sa signature · date de calcul (source) ·
       source · auteur de l'export · date de l'export            (B27)
5  INSERT export_artifact (definition_version_id = job.versionPins[0])
   — figé : le support reste rattaché à la version qui l'a produit, même après
     une signature plus récente                                           (B22)
6  complete() : state = 'ready', expires_at = now() + 7 j
   ÉCHEC À N'IMPORTE QUEL ÉTAPE :
     rollback du stockage objet, fail(errorCode)
     JAMAIS de fichier partiel proposé (E13) ; `export_artifact` reste NULL
7  journaliser la production
```

### 3.3 `renderProvenanceHeader` (couvre B27, ADR-3)

```
champs, dans cet ordre, en tête du PDF et en première ligne de commentaire du CSV :
  1. definition_version_id + version_label
  2. definition_signed_at            (date de la SIGNATURE)
  3. computed_at                     (date de CALCUL, prise dans la source)
  4. source_ref                      (identifiant de la matérialisation, tel quel)
  5. exported_by                     (nom, pas d'identifiant technique)
  6. exported_at
  7. scope : équipes + période, exactement le scope de l'écran d'origine
computed_at NULL → la chaîne « fraîcheur inconnue » est écrite telle quelle,
et l'heure de l'export n'occupe JAMAIS cette place (B5, B6).
```

## 4. Plan composants

### 4.1 Arbre de composants

```
DashboardPage
└── ExportPanel state={idle|queued|running|ready|failed|forbidden_scope}
    ├── FormatSelect   pdf | csv
    ├── ScopeSummary   « périmètre exact qui sera exporté »
    ├── JobProgress    identifiant de tâche + progression
    ├── DownloadLink   lien + date d'expiration
    ├── FailureNotice  « aucun fichier partiel » + Reprendre    (E13)
    └── ScopeRefusal   périmètre autorisé nommé + commande      (E6)
```

### 4.2 Composants

| Composant | Type | Fichier cible | Props | State | Événements |
|---|---|---|---|---|---|
| `ExportPanel` | Client | `src/features/dashboards/export/export-panel.tsx` | `{ source, scope, state, job? }` | `{ submitting: boolean }` | `onRequest(format)`, `onRetry()` |
| `ExportWorker` | Node | `src/server/worker/export-worker.ts` | — | — | boucle `claim()` |
| `ProvenanceHeader` | Server | `src/features/dashboards/export/provenance-header.ts` | `{ header: ExportProvenanceHeader }` | — | — |

### 4.3 États par écran

| État | Condition | Composants affichés | Données |
|---|---|---|---|
| vide | Aucune demande en cours | `ExportPanel: idle` avec le format | — |
| chargement | Job `queued` ou `running` | `ExportPanel: queued` / `running` avec identifiant de tâche | `ExportJob` |
| rempli | Job `ready` | `ExportPanel: ready` : lien + expiration datée | `ExportJob` + provenance |
| erreur | Job `failed` | `ExportPanel: failed` : aucun fichier partiel, reprise possible | `error_code` (E13) |
| périmètre refusé | Élargissement demandé (E6) | `ExportPanel: forbidden_scope` : périmètre autorisé nommé | `details` |

### 4.4 Formulaires

| Formulaire | Bibliothèque | Schéma | Soumission | Gestion d'erreur |
|---|---|---|---|---|
| Demande d'export | React Hook Form | `createExportSchema` | Server Action → `enqueue` | Erreur au champ ; `forbidden_scope` rendu dans le panneau |

## 5. Gestion d'état

| Donnée | Portée | Stockage | Initialisation | Mise à jour |
|---|---|---|---|---|
| Scope d'origine | URL | query params | Hérité de l'écran | Inchangé |
| Demande d'export | composant | `useState` | `idle` | `queued` → interrogation `GET /api/v1/exports/:id` |
| Job et artefact | serveur | `export_job`, `export_artifact` | Polling 3 s, arrêt sur état terminal | Worker |
| Fichier produit | stockage objet | `storage_key` | Production | Purge à 7 j après téléchargement |

> L'interrogation d'état est le **seul** client qui interroge périodiquement, avec un
> seul intervalle et un seul point d'entrée (`conventions.md`).

## 6. Traçabilité des règles

| ID | Règle (PRD) | Implémentée où | Approche |
|---|---|---|---|
| B8 | L'export porte exactement périmètre, période et restrictions de l'écran | § 3.1 étape 5, § 3.2 étape 3 | `scope_snapshot` figé + `assertNotWidened` |
| B27 | Version, date de signature, date de calcul, source, auteur, date d'export | § 3.3 | En-tête de provenance obligatoire, `artifact` figé |
| B22 | Le support reste rattaché à sa version, même après une signature plus récente | § 3.2 étape 5 | `export_artifact.definition_version_id` non modifiable |
| B7 | L'export ne peut pas élargir le périmètre | § 3.1 étape 5 | Filtre `withScope()` sur le scope figé |
| B5 | La date affichée est celle de la source | § 3.3 | Jamais l'heure de l'export |

| ID | Edge case | Approche | Où |
|---|---|---|---|
| E6 | Export sur une période plus large que le tableau | § 3.1 étape 5 | Refus nommant le périmètre autorisé |
| E13 | Export échoué en cours de production | § 3.2 étape 6 | Rollback, `artifact` NULL, reprise proposée |
| E11 | Calcul source trop long | § 3.2 | `fail(COMPUTATION_TOO_LONG)`, jamais de partiel |

| ID | Contrainte | Comment elle est respectée |
|---|---|
| C1 | L'entrepôt n'est jamais écrit | Le worker ne lit que |
| C6 | Trois mois | Un worker séquentiel, pas de bus de messages |
| C8 | L'outil ne remplace pas l'ERP | Un export est une **lecture** rendue, jamais un retour |
| 7.1 | Export en tâche de fond | L'utilisateur n'attend pas le fichier |

## 7. Pièges à éviter

- **Un export synchrone avec streaming** — ⚠️ Ne pas produire le fichier pendant la requête HTTP.
  Several millions de lignes dépassent tout délai utile, et la navigation interrompt le
  téléchargement (ADR-5). Le job est en base, donc durable et reprenable.
- **Réévaluer le périmètre au moment de la production** — ⚠️ Ne pas recalculer les droits dans le
  worker à partir de l'état courant. `scope_snapshot` est une photographie : c'est exactement ce qui
  fait que l'export reproduit l'écran (B8). La seule réévaluation faite est un **refus** si les
  droits ont disparu entre-temps.
- **Laisser un fichier partiel après un échec** — ⚠️ Ne pas proposer un téléchargement partiel. Le
  stockage objet est annulé et `export_artifact` reste `NULL` (E13).
- **Écrire l'heure de l'export dans la colonne « date de calcul »** — ⚠️ Ne pas confondre les deux
  dates sont distinctes et toutes deux présentes : `computed_at` vient de la source, `exported_at`
  de notre horloge (B5, B27).
- **Rattacher le support à la version courante au moment du téléchargement** — ⚠️ Ne pas recalculer.
  `export_artifact.definition_version_id` est figé à la production : le support reste rattaché à ce
  qui l'a produit (B22).
- **Un `refused` represented as a 403 that looks like a bug** — ⚠️ Ne pas renvoyer un 403 nu. E6
  exige de nommer le périmètre qui serait autorisé et la commande pour le demander.

## 8. Dépendances

| Dépend de | Nature | Statut | Fallback si absent |
|---|---|---|---|
| `query-engine` | Lecture des lignes sous le scope figé | vague 0 | Aucun : l'export sans filtre viole B7 |
| `restriction-lignes` | `assertNotWidened`, `withScope` | vague 1 | Aucun : c'est le garde-fou E6/B8 |
| `consultation-indicateur` | Tuiles, cibles, `semantic_state` du tableau | vague 2 | Re-calcul par le worker, dans la même version |

## 9. Checklist de tâches

- [ ] Schémas Zod § 2.1, `ExportJobPort` § 2.2
- [ ] `requestExport`, `produceArtifact`, `renderProvenanceHeader` (§ 3)
- [ ] Migration Drizzle : `export_job`, `export_artifact` (purge 7 j)
- [ ] Worker Node : `claim()` séquentiel, heartbeat, rollback sur échec
- [ ] `ExportPanel` et ses 6 états, dont `forbidden_scope`
- [ ] Test : un export échoué ne laisse aucun artefact
- [ ] Test : le support reste rattaché à sa version après une signature plus récente

## 10. Critères d'acceptation

- [ ] B8 : l'export ne peut pas élargir le périmètre ; le refus nomme le périmètre autorisé
- [ ] B27 : le support porte version, date de signature, date de calcul, source, auteur, date d'export
- [ ] B22 : le support reste rattaché à sa version après une signature plus récente
- [ ] E13 : aucun fichier partiel n'est proposé après un échec
- [ ] 7.1 : l'export est produit en tâche de fond et notifié

## 11. Plan de tests

| Cible | Scénarios | IDs couverts |
|---|---|---|
| `requestExport` | périmètre élargi refusé · idempotence · ressource non partagée | B8, E6, B9 |
| `produceArtifact` | succès · échec en cours de route (rollback) · droits perdus entre-temps | B7, E13, B22 |
| `renderProvenanceHeader` | `computed_at` présent · `computed_at` null ⇒ « fraîcheur inconnue » | B5, B6, B27 |
| `ExportPanel` | `queued` → `running` → `ready` · `failed` sans lien · `forbidden_scope` | E6, E13 |
| E2E | export d'un dashboard partagé par un lecteur restreint = mêmes lignes que l'écran | B7, B8 |

**Statut** : `identified` — à approfondir et valider en Phase 5.
