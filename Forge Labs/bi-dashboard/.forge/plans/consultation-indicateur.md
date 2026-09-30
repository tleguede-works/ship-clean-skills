---
type: implementation-plan
slice: consultation-indicateur
module: indicateurs
status: identified
generated_at: 2026-09-30
derived_from:
  - .forge/architecture.md
  - .forge/prd.md
  - .forge/design/design-system.md
  - .forge/design/screens/indicateurs.md
  - .forge/design/screens/indicateur-detail.md
conventions_ref: .forge/conventions.md
---

# Plan d'implémentation — `consultation-indicateur`

> **Vocation de ce document.** Produit en Phase 4 à partir de l'architecture. La Phase 5
> l'approfondit et le valide slice par slice : statut `identified`, pas `planned`.

## Sources

- **PRD** : `.forge/prd.md` — US-3 · B4, B5, B6, B13, B17 · E1, E2, E3, E8, E15
- **Architecture** : § 3.3, § 2.2, § 2.5, § 4.5, § 4.15, § 4.16, § 4.17, § 5.2, § 5.3, § 5.20
- **Design** : `indicateurs.md`, `indicateur-detail.md` — `IndicatorTile`, `ProvenanceStrip`

## 1. Résumé de la slice

Afficher la valeur officielle d'un indicateur avec sa cible, sa date de calcul **prise
dans la source**, l'identifiant de cette source et sa mention de statut officiel. C'est
l'écran le plus lu du produit : il ouvre la boucle *surveiller → détecter → investiguer*.

**User stories** : US-3 (Consulter un indicateur officiel)
**Règles** : B4, B5, B6, B13, B17 · **Edge cases** : E1, E2, E3, E8, E15

## 2. Contrats de données (code)

### 2.1 Schémas de validation

```ts
// src/shared/schemas/indicator-read.schema.ts
import { z } from 'zod';
import { teamCodeSchema } from './scope.schema';

export const indicatorReadQuerySchema = z.object({
  teams: z.string().transform(s => s.split(',').filter(Boolean))
                  .pipe(z.array(teamCodeSchema).min(1).max(50)),
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  grain: z.enum(['day', 'week', 'month']),
  version: z.string().uuid().optional()
}).strict()
.refine(q => q.from <= q.to, { message: '`from` doit précéder `to`', path: ['to'] });

export const warehouseValueSchema = z.object({
  value: z.number(),
  unit: z.string().min(1).max(16),
  computedAt: z.string().datetime().nullable(),   // null ⇒ « fraîcheur inconnue » (B6)
  sourceRef: z.string().min(1).max(120),
  resolvedScope: z.object({ teams: z.array(z.string()), period: z.object({}).passthrough(), segment: z.record(z.string()) })
});
export type WarehouseValueDTO = z.infer<typeof warehouseValueSchema>;
```

### 2.2 Types et interfaces

```ts
// src/features/indicators/consultation/indicator-read.types.ts
import type { ErrorCode } from '@/server/errors/contracts';
import type { Scope } from '@/server/auth/contracts';

export type Officiality = 'official' | 'provisional' | 'stale_owner' | 'target_missing';

export type IndicatorReadOutcome =
  | { status: 'value';  value: WarehouseValueDTO; officiality: Officiality }
  | { status: 'empty';  reason: 'no_row_in_period' | 'resolved_scope_empty' }
  | { status: 'source_unavailable'; lastKnown: WarehouseValueDTO | null }
  | { status: 'too_slow';          lastKnown: WarehouseValueDTO | null };

/** Union discriminée : `[]` et « échec » sont deux membres distincts. */
export type IndicatorListOutcome<T> =
  | { status: 'ok';    items: readonly T[]; total: number; excluded: ExcludedIndicator[] }
  | { status: 'empty'; reason: 'no_row_in_period' | 'resolved_scope_empty' | 'filtered_to_zero' }
  | { status: 'error'; code: Extract<ErrorCode, 'SOURCE_UNREACHABLE' | 'QUERY_TIMEOUT' | 'COMPUTATION_TOO_LONG'>; retryable: boolean };

export interface ExcludedIndicator {
  readonly slug: string;
  readonly reason: 'SCOPE_DENIED';
  readonly missingTeamCodes: readonly string[];
}
```

### 2.3 Contrats API

- `GET /api/v1/indicators` — architecture § 5.2
- `GET /api/v1/indicators/:slug` — architecture § 5.3
- `GET /api/v1/me` — architecture § 5.1 (droits affichables)

## 3. Algorithmes critiques

### 3.1 `readOfficialIndicator` (couvre B4, B5, B6, B13, B17, E1, E2, E3, E15)

```
ENTRÉES : slug, query indicatorReadQuerySchema, actor SessionActor
1  decision = auth.resolveIndicatorAccess(actor, slug, scope demandé)
   decision.allowed = false ET missingTeamCodes non vide
     → journaliser (ressource 'indicator', outcome 'refused', code SCOPE_DENIED)
     → 403 « Vous n'avez pas accès à l'équipe {missing}… »
2  version = query.version OU indicator.current_signed_version_id
   slug inconnu OU indicateur d'un tiers sans définition signée (B13) → 404
3  journaliser la tentative AVANT la lecture (une panne ne doit pas effacer la trace)
4  outcome = queryEngine.readIndicatorValue({ indicatorKey, definitionVersionId: version,
                                             scope: decision.scope }, signal)
5  SELON outcome.state :
   'value'                → réponse 200, computed_at = outcome.value.computedAt
   'empty'                → réponse 200 status='empty', reason
                            E2 : « aucune donnée sur la période » + commande d'élargissement
                            E15 : reason = 'resolved_scope_empty' ⇒ « périmètre résolu vide »
   'source_unavailable'   → 503 + lastKnown depuis query_cache si disponible (E1, E3)
   'too_slow'             → 504 + lastKnown (E11) ; JAMAIS de valeur partielle
6  officiality = dériver(indicator) :
     propriétaire inactif            → 'stale_owner'      (B17)
     current_signed_version_id NULL  → 'provisional'      (B13)
     target_confirmed_at NULL       → 'target_missing'   (E16)
     sinon                           → 'official'
7  SI outcome.state = 'value' ET officiality = 'stale_owner'
     → la valeur reste affichée, porte la mention « propriétaire inactif » (B17)
8  renvoyer la réponse
```

### 3.2 `listReadableIndicators` (couvre B13, E5, B25)

```
1  decision = auth.resolveIndicatorAccess(...) sur le scope demandé
2  indicateurs = SELECT … WHERE officiality <> 'stale_owner' OU propriétaire = actor
3  POUR CHAQUE indicateur : decision = auth.resolveIndicatorAccess(indicateur)
   refus → pushing dans `excluded` (jamais dans `items`) et journalisation (B25)
     E5 : la tuile n'est pas rendue ; pas de placeholder « accès refusé »
4  résultat vide ET périmètre non vide → status='empty' reason='no_row_in_period' (E2)
5  filtre utilisateur qui ne renvoie rien → reason='filtered_to_zero'
   (état DISTINCT de 'no_row_in_period' : l'un se répare par un bouton,
    l'autre par une période plus large)
```

## 4. Plan composants

### 4.1 Arbre de composants

```
IndicatorsPage (server)
├── PeriodBar (scope dans l'URL : teams, from, to, grain)
├── IndicatorGrid
│   └── IndicatorTile × n
│       ├── valeur        (--font-mono, --text-display)
│       ├── target        (delta + confirmation)
│       ├── computed_at   (--text-caption, --text-secondary)
│       ├── source_ref    (mono, caption)
│       └── status badge  (officiel / non officiel / propriétaire inactif)
└── (état vide)  « aucune donnée sur la période » + commande d'élargissement

IndicatorDetailPage (server)
├── IndicatorTile size="lg"
├── ProvenanceStrip        (permanent, pas un tooltip)
├── SignetDefinition { label, versionLabel, signedAt, signerName, authorName }
└── TargetComparison      (state seulement — la couleur est `seuil-et-etat`)
```

### 4.2 Composants

| Composant | Type | Fichier cible | Props | State | Événements |
|---|---|---|---|---|---|
| `IndicatorsPage` | Server | `src/app/(dashboard)/indicateurs/page.tsx` | `{ searchParams }` | — | — |
| `IndicatorTile` | Server | `src/components/indicator-tile.tsx` | architecture § 2.3 | — | `onClick` → drill-down |
| `ProvenanceStrip` | Server | `src/components/provenance-strip.tsx` | architecture § 2.3 | — | — |
| `PeriodBar` | Client | `src/components/period-bar.tsx` | `{ value: Scope }` | `{ pending: boolean }` | push URL |

### 4.3 États par écran

#### Écran : `indicateurs`

| État | Condition | Composants affichés | Données |
|---|---|---|---|
| vide | Aucune définition, lecteur sans indicateur | `DataTable: empty_never_visited` | — |
| chargement | Lecture en cours | `IndicatorTile: loading` (skeleton de la forme du chiffre) | — |
| rempli | Au moins un indicateur lisible | Grille de `IndicatorTile` | `IndicatorListOutcome` |
| erreur | `status = 'error'` ou 503 | `IndicatorTile: source_unavailable` + dernière date | `error_code` |
| vide-données | `status = 'empty'`, `no_row_in_period` | Message E2 + commande « élargir la période » | — |

#### Écran : `indicateur-detail`

| État | Condition | Composants affichés | Données |
|---|---|---|---|
| rempli | Valeur lue | Tuile `lg` + `ProvenanceStrip` | `IndicatorReadOutcome` |
| hors cible | `semantic_state = 'out_of_band'` | Tuile `out_of_band` (calculé par `seuil-et-etat`) | — |
| fraîcheur inconnue | `computed_at = null` (B6) | Tuile `unknown_freshness` | `computed_at: null` |
| source indisponible | E1 / E3 | Tuile `source_unavailable` + `source_ref` | `lastKnown` |
| périmètre résolu vide | E15 | Mention « périmètre résolu vide » | `resolvedScope` |
| non officiel | B13 | Tuile `provisional` + mention « non officiel » | `officiality` |

> `permission_denied` n'est **pas** un état : l'indicateur n'est pas rendu (E5).

### 4.4 Formulaires

Aucun formulaire : C2 interdit toute saisie de données métier. Seuls le sélecteur de
période et le sélecteur d'équipes vivent dans l'URL.

## 5. Gestion d'état

| Donnée | Portée | Stockage | Initialisation | Mise à jour |
|---|---|---|---|---|
| Scope (équipes, période, grain) | URL | query params | Lien partagé, ou valeurs par défaut | Navigation (`router.push`) |
| Valeurs lues | serveur | `query_cache` + rendu SSR | Rendu serveur | Revalidation à intervalle unique |
| Droits de l'appelant | serveur | `session.rights_snapshot` réévalué à chaque requête | `GET /api/v1/me` | Jamais en cache client |

> Le rafraîchissement affiche le `computed_at` **de la source**, jamais l'heure du
> dernier fetch : c'est la seule information qui distingue « la donnée est de ce matin »
> de « nous avons relu à l'instant ».

## 6. Traçabilité des règles

| ID | Règle (PRD) | Implémentée où | Approche |
|---|---|---|---|
| B4 | La valeur publiée est celle de la dernière version signée | § 3.1 étape 2 | `current_signed_version_id` |
| B5 | Date de calcul **prise dans la source** | § 3.1 étape 5, ADR-3 | Colonne `computed_at` de la matérialisation, jamais `now()` |
| B6 | Fraîcheur absente ⇒ « inconnue », jamais l'heure du poste | Type `computedAt: string \| null` | `null` est un état du type, pas une valeur vide |
| B13 | Non signé : visible de son auteur, jamais partagé | § 3.1 étape 2, § 3.2 | `include_provisional` réservé à l'auteur |
| B17 | Propriétaire inactif ⇒ perte du statut officiel | § 3.1 étape 6 | `officiality` **dérivé**, recalculé à la lecture |

| ID | Edge case | Approche | Où |
|---|---|---|---|
| E1 | Source indisponible | 503 + `lastKnown` depuis le cache, **avec sa date** | `readOfficialIndicator` |
| E2 | Aucune ligne sur la période | `status = 'empty'`, distinct d'un zéro | Étape 5 |
| E3 | Matérialisation pas rafraîchie | `computed_at: null` ou 503 `SCHEMA_UNKNOWN` | Étape 5 |
| E8 | Propriétaire en congé longue durée | Tuile `stale_owner` + 409 à l'écriture | Étape 6 |
| E15 | Périmètre devenu vide | `reason = 'resolved_scope_empty'` | Étape 5 |

| ID | Contrainte | Comment elle est respectée |
|---|---|---|
| C1 | L'entrepôt n'est jamais écrit | Aucune clause `INSERT`/`UPDATE` dans `query-planner.ts` |
| C2 | Aucune saisie de données métier | Scope dans l'URL, aucun formulaire de valeur |
| C7 | Autonomie en moins d'une demi-journée | Un écran, quatre badges, une barre de période |

## 7. Pièges à éviter

- **Un `computed_at` calculé à l'affichage** — ⚠️ Ne pas faire `new Date()` côté composant pour
  « rafraîchir » la date. Un champ de fraîcheur calculé chez nous décrit **notre lecture**, pas la
  donnée : il ment exactement sur la vue de la nuit précédente (ADR-3, B5).
- **Rendre `0` quand la requête ne renvoie rien** — ⚠️ Ne pas mapper « aucune ligne » sur la valeur
  `0`. `ReadOutcome` rend `empty` avec un `reason`, et l'UI affiche « aucune donnée sur la période »
  (E2, `archetypes.md` § 9).
- **Un placeholder « accès refusé »** — ⚠️ Ne pas rendre une tuile grisée pour un indicateur interdit :
  elle confirme son existence, et E5 demande l'inverse.
- **Un badge « non officiel » coloré en rouge** — ⚠️ Ne pas utiliser `--color-out-of-band` pour un
  document non officiel : le rouge est réservé à « hors cible » et « refus ». Utiliser
  `--color-stale`.
- **Un cache global des valeurs** — ⚠️ Ne pas mettre en cache par `indicator_key` seul : deux lecteurs
  de périmètres différents seraient alors servis le même résultat. Le périmètre est dans
  la clé (§ 4.15).

## 8. Dépendances

| Dépend de | Nature | Statut | Fallback si absent |
|---|---|---|---|
| `query-engine` | `withScope()`, `ReadOutcome`, `computed_at` | vague 0 | Mock à la frontière publique de `server/query` |
| `auth` | `SessionActor`, `resolveIndicatorAccess` | vague 0 | Aucun : sans identité, aucun droit |
| `design-primitives` | `IndicatorTile`, `ProvenanceStrip` | vague 0 | Mock en test de composant |
| `definition-declarer` | `indicator`, `definition_version`, `current_signed_version_id` | vague 1 | Jeu de données en test d'intégration |
| `error-handling` | `ERROR_CODES`, `ListOutcome` | vague 0 | Aucun : chaque endpoint inventerait son libellé |

## 9. Checklist de tâches

- [ ] Schémas Zod § 2.1 (partagés client/serveur, jamais recopiés)
- [ ] `readOfficialIndicator`, `listReadableIndicators` (§ 3)
- [ ] Cache `query_cache` indexé sur `(query_hash, actor_scope_hash, computed_at_source)`
- [ ] Écrans `indicateurs` et `indicateur-detail`, 9 états chacun
- [ ] Tests de composants sur **tous** les états de tuile du design system
- [ ] Test E2E : deux lectures à quelques secondes d'intervalle, deux `computed_at` lisibles (E7)

## 10. Critères d'acceptation

- [ ] B5 : la date affichée est celle de la source, vérifiable sur la réponse brute
- [ ] B6 : `computed_at = null` affiche « fraîcheur inconnue », jamais l'heure du poste
- [ ] B4 : modifier une définition sans re-signer ne change pas la valeur publiée
- [ ] B13 : un indicateur non signé est invisible pour un tiers
- [ ] B17 : un propriétaire inactif fait perdre le statut officiel sans aucune écriture
- [ ] E2 : « aucune donnée sur la période » est distinct d'une valeur à zéro

## 11. Plan de tests

| Cible | Scénarios | IDs couverts |
|---|---|---|
| `readOfficialIndicator` | valeur · `computed_at` null · périmètre vide · source injoignable · délai dépassé · propriétaire inactif | B5, B6, B17, E1, E15, E11 |
| `listReadableIndicators` | indicateur interdit exclu et journalisé · filtre à zéro distinct d'aucune donnée | B13, E5, E2 |
| `IndicatorTile` | `out_of_band` · `unknown_freshness` · `source_unavailable` · `no_data` · `permission_denied` **non rendu** | B6, B11, E1, E2, E5 |
| Intégration | deux lectures autour d'un rafraîchissement portent deux dates distinctes | E7 |

**Statut** : `identified` — à approfondir et valider en Phase 5.
