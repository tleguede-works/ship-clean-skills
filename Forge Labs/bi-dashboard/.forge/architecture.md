---
type: architecture
status: draft
generated_at: 2026-09-30
derived_from: .forge/prd.md
---

# Architecture — Amberline

> Ce document définit COMMENT le produit est structuré techniquement.
> Il transforme les besoins du PRD en modules, slices, fondations, modèles de données et contrats d'API.
>
> **Règle de granularité** : toute entité, tout champ, tout endpoint est documenté — pas résumé, pas échantillonné.

**Sources lues** : `.forge/prd.md`, `.forge/roadmap.md`, `.forge/conventions.md`,
`.forge/design/design-system.md`, `.forge/benchmarks.md`, `.forge/state.json`,
`skills/forge/references/archetypes.md` § 4 et § 9.

---

## 1. Vue d'ensemble

Amberline ne calcule aucun chiffre. Il **gouverne** des chiffres déjà calculés par un
entrepôt en lecture seule : une définition écrite et versionnée, une signature par une
personne distincte de l'auteur, une seule valeur officielle, et une date de calcul
**prise dans la source**. Toute l'architecture découle de cette phrase.

Trois invariants structurent le reste du document :

1. **La donnée métier n'est pas modifiable par l'outil** (C1). PostgreSQL ne porte que
   des métadonnées, le journal des accès et la file d'export. Les valeurs restent dans
   l'entrepôt, et l'entrepôt n'est lu que par un point d'entrée unique.
2. **Une restriction porte sur la donnée, pas sur l'affichage** (B7). Le filtre est
   injecté dans la requête, jamais appliqué après coup.
3. **Un état absent n'est jamais un état faux** (`archetypes.md` § 9, « une absence
   présentée comme un zéro »). Vide, erreur, refus et hors cible sont quatre membres
   distincts d'une union, jamais une valeur nulle et un booléen.

### 1.1 Stack technique

| Domaine | Choix | Version | Justification |
|---|---|---|---|
| Langage | TypeScript | 5.6 | Contrats de données partagés entre le moteur de requêtes et l'UI, sans duplication |
| Framework | Next.js (App Router, SSR) | 15.x | Rendu serveur pour un dashboard partagé à une liste nominative, ouvert sans installation |
| Base de données | PostgreSQL | 16 | Métadonnées produit, journal des accès, file d'export ; l'entrepôt reste la source des chiffres |
| ORM / Query builder | Drizzle ORM | 0.31 | Schéma typé, migrations versionnées, pas de couche d'abstraction qui masque le SQL |
| State management | État serveur (App Router) + état local React + URL comme état de scope | — | Le scope doit survivre au partage à une liste nominative (B9), donc il vit dans l'URL |
| Validation | Zod | 3.23 | Une seule grammaire pour les filtres, les définitions et les contrats d'API |
| HTTP client | fetch natif + intercepteur maison | — | Le client parle à l'API interne ; le moteur de requête parle au driver d'entrepôt |
| Styling | CSS Modules + variables CSS | — | Les design tokens sont des variables CSS : aucune dépendance de styling à maintenir |
| Composants UI | Headless (radix-ui) + primitives maison | 1.0 | Tableaux et tuiles en densité haute exigent des composants que le design system contrôle |
| Icônes | lucide-react | 0.441 | Trame unique, tree-shakeable |
| Tests unitaires | Vitest | 1.6 | Même transformation que le build Next, pas de config supplémentaire |
| Tests composants | Testing Library + Vitest | — | Assertions sur le comportement rendu, pas sur l'implémentation |
| Tests E2E | Playwright | 1.46 | Seul parcours qui démontre B7 sur des lignes réelles (E5, E10) |
| Lint / Format | ESLint 8.57 · Prettier 3.3 | 8.57 / 3.3 | Config flat + règles Next ; aucun conflit de format dans les PR |
| Package manager | pnpm | 9.7 | Installation déterministe, lockfile unique |
| Identity provider | OIDC (fournisseur d'identité de l'entreprise) | — | 40 personnes, usage interne. Fournisseur **non nommé** : bloquant, cf. § 8 |
| Exécution de fond | Worker Node + table de jobs en PostgreSQL | — | Un export de plusieurs millions de lignes est un job long, pas une requête HTTP |

> Aucune version n'est écrite ici qui ne le soit déjà dans `.forge/conventions.md` :
> les versions se résolvent depuis le manifeste (`forge-guard facts`), elles ne se
> recopient pas dans un deuxième fichier.

### 1.2 Structure de dossiers cible

```
amberline/
  src/
    app/                          # routes Next (App Router)
      (dashboard)/                # groupe authentifié
        d/[slug]/                 # un dashboard partagé (US-6)
        indicateurs/[slug]/       # lecture d'un indicateur (US-3) + détail (US-17)
        definitions/[slug]/       # référentiel des définitions (US-1)
      api/v1/                     # surface HTTP décrite au § 5
    components/                   # primitives du design system (design-primitives)
      indicator-tile.tsx          # IndicatorTile
      data-table.tsx              # DataTable
      form-field.tsx              # FormField
      signature-bar.tsx           # SignatureBar
      provenance-strip.tsx        # ProvenanceStrip
      export-panel.tsx            # ExportPanel
    features/
      indicators/                 # module « indicateurs »
        consultation/             # slice consultation-indicateur
        seuil/                    # slice seuil-et-etat
        historique/               # slice historique-indicateur
        drill-down/               # slice drill-down
      dashboards/                 # module « tableau-de-bord »
        compose/                  # slice partage-dashboard
        export/                   # slice export-provenance
      definitions/                # module « definitions »
        declarer/                 # slice definition-declarer
        signer/                   # slice definition-signer
      access/                     # module « acces »
        scope/                    # slice restriction-lignes
        journal/                  # slice journal-acces
    server/
      db/                         # schéma Drizzle, migrations (métadonnées)
      query/                      # moteur de requête vers l'entrepôt (query-engine)
        driver.ts                 # SEUL fichier autorisé à ouvrir une connexion
        with-scope.ts             # SEUL point d'entrée vers le driver
        query-planner.ts          # buildKpiQuery() — SQL stable, testable hors base
      auth/                       # OIDC, session 8 h, résolution des droits
      access-log/                 # journal append-only filtré (B25)
      errors/                     # enum fermée d'error_code, états distincts
      worker/                     # worker Node : production des exports
    shared/
      schemas/                    # schémas Zod importés tels quels par le client (§ 2)
    lib/                          # utilitaires transverses
  test/
    unit/
    components/
    e2e/
      fixtures/seed.sql           # fixture entrepôt seedée — accord data team requis (F-002)
```

> `src/server/query/driver.ts` est le seul fichier permitted à importer le pilote
> PostgreSQL de l'entrepôt. Une règle ESLint `no-restricted-imports` le verrouille :
> c'est le mécanisme mécanique derrière B7, pas une convention à respecter de mémoire.

### 1.3 Conformité aux standards d'archétype

| Standard `archetypes.md` § 4 | Adopté | Où |
|---|---|---|
| Sidebar, densité haute | oui | `design-system.md` § 3.2 ; 4 entrées dans `state.json → index.nav` |
| Hiérarchie KPI → signal → détail | oui | `IndicatorTile` → `seuil-et-etat` → `drill-down` |
| Le dashboard montre des anomalies, pas des métriques décoratives | oui | B11 : la couleur sémantique dérive de la comparaison à la cible, jamais d'un réglage d'apparence |
| Chaque visuel est cliquable vers son détail | oui | Chaque tuile ouvre la décomposition (B15) |
| Seuils et couleurs sémantiques | oui | B11 porte l'**état** ; B12 (alerte par passage) est V1 avec le canal mail |
| Plages temporelles pilotables | oui | La période vit dans l'URL (`conventions.md`, « URL comme état ») |
| Module « configuration » | écart assumé | `benchmarks.md` § 5 écart 2 : les seuils sont écrits avec la définition, pas dans un écran de réglages |
| Module « alertes » | écart assumé | `roadmap.md` § 2.2 : l'état est dans le MVP, l'alerte mail part en V1 |
| « alertes ignorées » (piège) | traité | Aucune alerte automatique au MVP : il n'y a pas de canal à ignorer. B12 arrive avec le canal, mesuré |

> Conformité de la grille `benchmarks.md` § 3 : **PASS**. Les écarts 1 à 3 (pas de
> composeur libre, seuils dans la définition, pas de valeurs de détail dans les vues)
> sont des décisions de roadmap, pas des trous d'architecture.

---

## 2. Fondations

> Implémentées en premier. **Aucune fondation ne dépend d'une autre** : les cinq
> sont en vague 0 et peuvent être construites en parallèle.

| Fondation | Responsabilité | Dépend de | Dépendue par |
|---|---|---|---|
| `auth` | OIDC, session 8 h, résolution des droits **fail-closed** et rate limit par session | — | `definition-declarer`, `definition-signer`, `consultation-indicateur`, `restriction-lignes`, `partage-dashboard`, `journal-acces` |
| `query-engine` | Accès **lecture seule** à l'entrepôt, `scope` injecté par un seul point d'entrée, `computed_at` lu dans la source | — | `consultation-indicateur`, `historique-indicateur`, `drill-down`, `restriction-lignes`, `export-provenance` |
| `design-primitives` | Les six composants du design system, sans appel réseau | — | `definition-declarer`, `consultation-indicateur` |
| `access-log` | Journal append-only, purgé à un an, **filtré selon les droits du lecteur** (B25) | — | `historique-indicateur`, `journal-acces` |
| `error-handling` | Enum fermée d'`error_code` partagée, correspondance code → statut HTTP, états distincts (vide ≠ erreur ≠ refus) | — | `consultation-indicateur` |

> `export-provenance` consomme le worker (contrat `ExportJobPort` déclaré dans § 5.15)
> sans dépendre de la fondation `error-handling` : le job porte son propre statut
> d'échec, il ne propage pas d'`error_code` HTTP.

### 2.1 `auth`

**Périmètre** : échange OIDC, création et rotation du cookie de session (8 h),
résolution d'un `SessionActor` depuis l'annuaire, résolution des droits de ligne,
résolution des droits sur un indicateur et sur un dashboard, refus d'auto-signature,
rate limit par session. Hors périmètre : la gestion des rôles (l'annuaire de l'entreprise
fait foi) et le partage (c'est `partage-dashboard`).

**Contrats** :

```ts
// src/server/auth/contracts.ts
import { z } from 'zod';

export type IndicatorId = string & { __brand: 'IndicatorId' };
export type DashboardId = string & { __brand: 'DashboardId' };
export type DefinitionVersionId = string & { __brand: 'DefinitionVersionId' };

/** Un code d'équipe est une valeur fermée du référentiel, jamais une saisie libre. */
export const teamCodeSchema = z.string().regex(/^[A-Z0-9][A-Z0-9-]{1,15}$/);

export const periodSchema = z.object({
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  grain: z.enum(['day', 'week', 'month'])
}).strict();

export const scopeSchema = z.object({
  teams: z.array(teamCodeSchema).min(1).max(50),
  period: periodSchema,
  segment: z.record(z.string().max(64), z.string().max(64)).default({})
}).strict();

export type Scope = z.infer<typeof scopeSchema>;
export type Role = 'controleur' | 'signataire' | 'auditeur' | 'manager';

export interface SessionActor {
  readonly actorId: string;            // `sub` OIDC — l'identité qui sera journalisée
  readonly displayName: string;
  readonly email: string;
  readonly isDirectoryEntry: boolean;  // nommé dans l'annuaire (B3) : pas de texte libre
  readonly isActive: boolean;         // false → B17 : l'indicateur perd son statut officiel
  readonly groupCodes: readonly string[];
  readonly grantedTeamCodes: readonly string[]; // droits de ligne résolus, fail-closed
  readonly roles: readonly Role[];
  readonly sessionExpiresAt: string;  // created_at + 8 h, rotée à chaque élévation de droit
}

export type AccessDecision =
  | { readonly allowed: true;  readonly scope: Scope; readonly reason: 'granted' }
  | { readonly allowed: false; readonly reason: 'not_granted' | 'owner_inactive' | 'unknown_actor';
      readonly missingTeamCodes: readonly string[] };

export interface AuthFoundation {
  resolveSession(headers: Headers): Promise<SessionActor | null>;
  resolveIndicatorAccess(actor: SessionActor, indicatorId: IndicatorId, requested: Scope): Promise<AccessDecision>;
  resolveDashboardAccess(actor: SessionActor, dashboardId: DashboardId): Promise<AccessDecision>;
  /** Lève ApiError('SIGNER_IS_AUTHOR') — jamais un booléen silencieux. */
  assertCanSign(actor: SessionActor, versionId: DefinitionVersionId): Promise<void>;
  consumeRateLimit(actor: SessionActor, bucket: RateLimitBucket): Promise<void>;
}

export type RateLimitBucket = 'indicator_read' | 'decomposition' | 'export_create' | 'journal_read';
```

> **Fail-closed est une propriété du type, pas une convention.** `AccessDecision` n'a
> pas de troisième cas « inconnu » : toute situation non résolue tombe dans
> `allowed: false`. Il n'existe aucun chemin par lequel une panne de l'annuaire
> produise un droit (`archetypes.md` § 9, « Fail-open sur une autorisation »).

### 2.2 `query-engine`

**Périmètre** : construction du SQL de lecture d'un indicateur, d'une décomposition et
d'une série signée ; application **obligatoire** du scope ; lecture de `computed_at` et
de `source_ref` dans la source ; traduction des pannes en `ReadOutcome` ; cache court
24 h. Hors périmètre : toute écriture (C1) et toute écriture de SQL hors de
`query-planner.ts`.

**Contrats** :

```ts
// src/server/query/contracts.ts
import type { Scope, IndicatorId, DefinitionVersionId } from '@/server/auth/contracts';
import type { ErrorCode } from '@/server/errors/contracts';

export interface ValueQuery {
  readonly indicatorKey: string;            // clé de l'indicateur dans l'entrepôt
  readonly definitionVersionId: DefinitionVersionId; // fige la formule, pas seulement la période
  readonly scope: Scope;                    // OBLIGATOIRE : sans scope, pas de type
}

export interface LineQuery extends ValueQuery {
  readonly depth: 1 | 2 | 3;
  readonly sortBy: 'contribution_desc' | 'label_asc';
  readonly limit: number;                   // 1..500
  readonly offset: number;                  // pagination par curseur
}

export interface SeriesQuery {
  readonly indicatorKey: string;
  readonly versionIds: readonly DefinitionVersionId[]; // toutes les versions signées (B22)
  readonly scope: Scope;
}

/** `computed_at` vient de la source. `null` signifie « la source ne l'expose pas » (B6). */
export interface WarehouseValue {
  readonly value: number;
  readonly unit: string;
  readonly computedAt: string | null;       // jamais notre horloge
  readonly sourceRef: string;               // identifiant de la matérialisation
  readonly resolvedScope: Scope;            // le périmètre réellement résolu (E15)
}

export interface WarehouseLine {
  readonly key: string;
  readonly label: string;
  readonly value: number;
  readonly share: number;                   // part de la valeur, 0..1
  readonly teamCode: string;                // sert à re-vérifier le scope côté serveur
}

export type ReadOutcome =
  | { readonly state: 'value';              readonly value: WarehouseValue }
  | { readonly state: 'empty';              readonly reason: 'no_row_in_period' | 'resolved_scope_empty' }
  | { readonly state: 'source_unavailable'; readonly lastKnown: WarehouseValue | null }
  | { readonly state: 'too_slow';           readonly lastKnown: WarehouseValue | null };

export type LineOutcome =
  | { readonly state: 'lines';  readonly lines: readonly WarehouseLine[]; readonly computedAt: string | null; readonly sourceRef: string }
  | { readonly state: 'empty';  readonly reason: 'no_row_in_period' | 'resolved_scope_empty' }
  | { readonly state: 'source_unavailable'; readonly lastKnown: readonly WarehouseLine[] }
  | { readonly state: 'too_slow';           readonly lastKnown: readonly WarehouseLine[] };

export interface QueryError {
  readonly code: Extract<ErrorCode, 'SOURCE_UNREACHABLE' | 'QUERY_TIMEOUT' | 'SCHEMA_UNKNOWN' | 'COMPUTATION_TOO_LONG'>;
  readonly retryable: boolean;
  readonly detail: string;                  // jamais la payload brute (données clients)
  readonly requestId: string;
}

export interface QueryEngine {
  readIndicatorValue(q: ValueQuery, signal: AbortSignal): Promise<ReadOutcome>;
  readIndicatorLines(q: LineQuery, signal: AbortSignal): Promise<LineOutcome>;
  readSignedSeries(q: SeriesQuery, signal: AbortSignal): Promise<ReadOutcome>;
  /** SQL stable produit hors base : c'est ce que testent les tests unitaires. */
  explain(q: ValueQuery): string;
  purgeCacheOlderThan(instant: string): Promise<number>;
}
```

> **`ReadOutcome` n'a pas de cas « zéro » et pas de cas « erreur ».** Une valeur nulle
> n'existe pas dans ce type : il y a `value`, `empty`, `source_unavailable`, `too_slow`.
> Le refus (B7) n'est pas ici non plus — il est décidé par `auth` **avant** l'appel, et
> la requête ne part pas. Une restriction qui s'applique après coup est une
> restriction d'interface, et elle ne tient pas.

```ts
// src/server/query/with-scope.ts — le SEUL point d'entrée vers le driver
export const TIMEOUT_READ_MS = 30_000;

export async function withScope<R>(
  scope: Scope,
  plan: (scoped: ScopedWhere) => { text: string; params: readonly unknown[] },
  opts: { timeoutMs?: number; cacheable?: boolean },
): Promise<R>;
```

### 2.3 `design-primitives`

**Périmètre** : les six composants du design system, rendus par état, **sans aucun
appel réseau** (`conventions.md`, « Les composants de `components/` ne font jamais
d'appel réseau »). Hors périmètre : la logique de données et le fetch.

**Contrats** :

```ts
// src/components/indicator-tile.tsx
export type IndicatorDisplayState =
  | 'default' | 'out_of_band' | 'unknown_freshness'
  | 'source_unavailable' | 'no_data' | 'computation_too_long' | 'loading';

export interface IndicatorTileProps {
  readonly label: string;
  readonly displayState: IndicatorDisplayState;
  readonly value?: number;              // requis si displayState === 'default' | 'out_of_band'
  readonly unit?: string;
  readonly target?: { readonly value: number; readonly delta: number; readonly confirmed: boolean };
  readonly computedAt: string | null;   // null → « fraîcheur inconnue » (B6)
  readonly sourceRef: string;
  readonly officiality: 'official' | 'provisional' | 'stale_owner' | 'target_missing';
  readonly size: 'sm' | 'md' | 'lg';
  readonly href?: string;               // ouvre la décomposition (archétype § 4)
}
// `permission_denied` n'est PAS un état : l'indicateur n'est pas rendu (E5).
// Un placeholder « accès refusé » confirmerait son existence — l'inverse de E5.

// src/components/provenance-strip.tsx
export interface ProvenanceStripProps {
  readonly computedAt: string | null;   // B5 : la source, jamais l'heure de la requête
  readonly sourceRef: string;
  readonly versionLabel: string;        // ex. « v3 »
  readonly signedBy?: { readonly name: string; readonly at: string };
}

// src/components/signature-bar.tsx
export type SignatureState = 'draft' | 'in_review' | 'signed' | 'refused' | 'revocable' | 'locked';
export interface SignatureBarProps {
  readonly state: SignatureState;       // `revocable` et `locked` sont deux rendus distincts (B26)
  readonly authorName: string;
  readonly signerName?: string;         // jamais l'auteur : la règle est structurelle
  readonly signedAt?: string;
  readonly refusalReason?: string;
  readonly onSign?: () => Promise<void>;
  readonly onRefuse?: (reason: string) => Promise<void>;
}

// src/components/data-table.tsx
export type TableState = 'loading' | 'filled' | 'empty_never_visited' | 'empty_no_data'
                       | 'filtered_to_zero' | 'error' | 'offline';  // 4 états vides distincts
export interface DataTableProps { readonly variant: 'drill' | 'reference'; readonly state: TableState; /* … */ }

// src/components/form-field.tsx
export type FormFieldVariant = 'text' | 'formula' | 'select' | 'owner_picker' | 'readonly';
// `owner_picker` n'accepte pas la saisie libre : B3 exige une personne nommée.

// src/components/export-panel.tsx
export type ExportState = 'idle' | 'queued' | 'running' | 'ready' | 'failed' | 'forbidden_scope';
export interface ExportPanelProps { readonly state: ExportState; readonly jobId?: string; /* … */ }
```

### 2.4 `access-log`

**Périmètre** : écriture append-only de toute consultation (y compris les refus, B10),
lecture **filtrée selon les droits du lecteur** (B25), purge automatique à un an (C4),
interdiction applicative de modifier une ligne. Hors périmètre : la décision de quoi
logger (c'est la slice qui écrit), et la conservation légale elle-même.

**Contrats** :

```ts
// src/server/access-log/contracts.ts
import type { SessionActor } from '@/server/auth/contracts';
import type { ErrorCode } from '@/server/errors/contracts';

export type ResourceKind = 'indicator' | 'dashboard' | 'definition' | 'history' | 'export' | 'journal';
export type AccessOutcome = 'granted' | 'refused' | 'not_found' | 'error';

/** B25 : un refus journalise la RESSOURCE visée, jamais le détail des lignes. */
export interface AccessLogEntry {
  readonly actorId: string;
  readonly resourceKind: ResourceKind;
  readonly resourceSlug: string;          // l'indicateur ou le dashboard visé, même en cas de refus
  readonly scope: { readonly teams: readonly string[]; readonly period: string } | null;
  readonly outcome: AccessOutcome;
  readonly errorCode: ErrorCode | null;
  readonly requestId: string;
  readonly occurredAt: string;            // horloge serveur, ici seulement
}

export interface JournalFilter {
  readonly from: string; readonly to: string;
  readonly actorId?: string; readonly resourceKind?: ResourceKind; readonly resourceSlug?: string;
  readonly outcome?: AccessOutcome;
  readonly limit: number; readonly cursor?: string;
}

/** La liste renvoyée ne contient que des lignes que le lecteur a le droit de voir. */
export interface JournalPage { readonly entries: readonly AccessLogEntry[]; readonly nextCursor: string | null; readonly totalVisible: number }

export interface AccessLogFoundation {
  append(entry: AccessLogEntry): Promise<void>;   // INSERT seul : le rôle SQL n'a ni UPDATE ni DELETE
  list(filter: JournalFilter, viewer: SessionActor): Promise<JournalPage>;
  purgeExpired(now: string): Promise<number>;    // job planifié : 365 j (B10, C4)
}
```

> Le rôle PostgreSQL dédié au journal reçoit `INSERT` et `SELECT`, **pas** `UPDATE`
> ni `DELETE`. La purge passe par un rôle distinct, journalisé. C'est ce qui rend
> C4 vérifiable par un test d'intégration et pas seulement par une intention.

### 2.5 `error-handling`

**Périmètre** : enum fermée d'`error_code` partagée client et serveur, correspondance
`error_code` → statut HTTP, mapping vers les états d'affichage du design system,
distinction vide / erreur / refus. Hors périmètre : les messages métier (ils vivent
dans l'UI et sont derivados du `code`, jamais d'une chaîne libre).

**Contrats** :

```ts
// src/server/errors/contracts.ts
export const ERROR_CODES = [
  'UNAUTHENTICATED', 'SESSION_EXPIRED',
  'FORBIDDEN', 'SCOPE_DENIED', 'EXPORT_SCOPE_DENIED', 'JOURNAL_FORBIDDEN',
  'NOT_FOUND',
  'VALIDATION_FAILED', 'PLAN_INVALID',
  'OWNER_REQUIRED', 'SIGNER_IS_AUTHOR', 'SIGNER_UNKNOWN', 'SIGNED_VERSION_IMMUTABLE',
  'DEFINITION_NOT_SIGNED', 'SLUG_TAKEN', 'CONCURRENT_MODIFICATION', 'OWNER_INACTIVE',
  'RATE_LIMITED',
  'SOURCE_UNREACHABLE', 'QUERY_TIMEOUT', 'COMPUTATION_TOO_LONG', 'SCHEMA_UNKNOWN',
  'INTERNAL_ERROR'
] as const;

export type ErrorCode = (typeof ERROR_CODES)[number];

/** Une seule maison pour la correspondance code → statut. */
export const ERROR_HTTP_STATUS: Readonly<Record<ErrorCode, number>> = {
  UNAUTHENTICATED: 401, SESSION_EXPIRED: 401,
  FORBIDDEN: 403, SCOPE_DENIED: 403, EXPORT_SCOPE_DENIED: 403, JOURNAL_FORBIDDEN: 403,
  NOT_FOUND: 404,
  VALIDATION_FAILED: 422, PLAN_INVALID: 422, SIGNER_UNKNOWN: 422,
  OWNER_REQUIRED: 409, SIGNER_IS_AUTHOR: 409, SIGNED_VERSION_IMMUTABLE: 409,
  DEFINITION_NOT_SIGNED: 409, SLUG_TAKEN: 409, CONCURRENT_MODIFICATION: 409, OWNER_INACTIVE: 409,
  RATE_LIMITED: 429,
  SOURCE_UNREACHABLE: 503, QUERY_TIMEOUT: 504, COMPUTATION_TOO_LONG: 503, SCHEMA_UNKNOWN: 503,
  INTERNAL_ERROR: 500
};

export interface ApiErrorBody {
  readonly error_code: ErrorCode;
  readonly message: string;        // message complet, rédigé — jamais « Forbidden » nu
  readonly details?: Readonly<Record<string, unknown>>;
  readonly request_id: string;
}

export class ApiError extends Error {
  constructor(readonly code: ErrorCode, message: string, readonly details?: Record<string, unknown>);
  toBody(requestId: string): ApiErrorBody;
}

/** vide ≠ erreur ≠ refus : trois membres, jamais un `[]`. */
export type ListOutcome<T> =
  | { readonly status: 'ok';      readonly items: readonly T[]; readonly total: number }
  | { readonly status: 'empty';   readonly reason: 'no_row_in_period' | 'resolved_scope_empty' | 'filtered_to_zero' }
  | { readonly status: 'error';   readonly code: ErrorCode; readonly retryable: boolean };
```

---

## 3. Modules et slices

### 3.1 Modules priorisés

> L'ordre suit `references/module-prioritization.md` : la **fréquence de la boucle de
> travail**, jamais l'organigramme du domaine. `state.json → index.nav` fait foi ;
> ce tableau en est la lecture, module par module.

| Rang | Module | Fréquence (1-5) | Libellé | Rationnel |
|---|---|---|---|---|
| 1 | `indicateurs` | 5 | **quotidien** | Le manager ouvre le produit pour lire une valeur chaque matin. C'est la première étape de la boucle surveiller → détecter → investiguer, et la seule qui revient tous les jours. |
| 2 | `tableau-de-bord` | 4 | **hebdomadaire** | On lit un indicateur tous les jours, on consulte un tableau de bord à l'approche d'une réunion. Fréquent, mais un cran en dessous de la lecture. |
| 3 | `definitions` | 2 | **mensuel** | Centralité maximale (B1, B2), fréquence minimale : c'est le contrôleur de gestion qui l'utilise, et lui seul. Le mettre en tête aurait placé l'outil du rare au-dessus de la boucle quotidienne. |
| 4 | `acces` | 1 | **occasionnel** (contrôle) | Préoccupation de conformité, pas boucle de travail. Dernier rang malgré une centralité 4. |

### 3.2 Inventaire

| Module | Slice | User stories (PRD) | Règles métier (B*) | Écrans |
|---|---|---|---|---|
| `definitions` | `definition-declarer` | US-1, US-11 | B1, B3, B14, B22, **B18 (retiré, PRD § 9)** | `definition-formulaire`, `definitions` |
| `definitions` | `definition-signer` | US-2 | B2, B26 | `definition-signature` |
| `indicateurs` | `consultation-indicateur` | US-3 | B4, B5, B6, B13, B17 | `indicateurs`, `indicateur-detail` |
| `indicateurs` | `seuil-et-etat` | US-4 | B11 | `indicateur-detail`, `indicateurs` |
| `indicateurs` | `historique-indicateur` | US-17 | B22, B24, **B18 (retiré, PRD § 9)** | `indicateur-detail` (split screen) |
| `indicateurs` | `drill-down` | US-5 | B15, B7 | `decomposition` |
| `acces` | `restriction-lignes` | US-7 | B7 | *aucun écran propre* — agit sur `indicateurs` et `tableau-de-bord` |
| `tableau-de-bord` | `partage-dashboard` | US-6 | B9, B16 | `tableau-de-bord`, `tableau-de-bord-composition` |
| `tableau-de-bord` | `export-provenance` | US-9 | B8, B22, B27 | `tableau-de-bord`, `indicateur-detail` |
| `acces` | `journal-acces` | US-8 | B10, B23, B25 | `acces-journal` |

> **B18 est retiré du périmètre depuis le 2026-09-30** (PRD § 9 : le partage par lien
> public est incompatible avec le journal d'accès et avec le secret commercial). Il
> n'est cité ici que pour **acter son absence** : aucune slice du MVP n'implémente un
> partage par lien, et `partage-dashboard` ne produit aucun jeton d'accès partageable
> dans l'URL. Ce n'est pas une règle à implémenter, c'est une règle à ne pas réintroduire.
> B12 (alerte par passage, réarmement) et US-10 (composeur libre) sont hors MVP —
> `roadmap.md` § 2.2.

### 3.3 Module `indicateurs` — rang 1, fréquence 5 (quotidien)

#### Slice : `consultation-indicateur`

- **Phrase** : Afficher la valeur officielle d'un indicateur avec sa cible, sa date de
  calcul **prise dans la source**, son identifiant de source et sa mention de statut
  officiel, sans que le lecteur ait à rouvrir l'entrepôt.
- **User stories** : US-3
- **Règles métier** : B4, B5, B6, B13, B17
- **Dépend de** : `query-engine`, `auth`, `design-primitives`, `definition-declarer`, `error-handling`
- **Dépendue par** : `seuil-et-etat`, `drill-down`, `export-provenance`
- **Écrans** : `indicateurs`, `indicateur-detail`
- **Peut être parallélisée avec** : `definition-signer`, `partage-dashboard` (vague 2)
- **Ce qu'elle ne fait pas** : elle ne colourie pas la valeur. La comparaison à la cible
  est `seuil-et-etat` ; garder les deux séparées évite d'avoir la règle B11 écrite à deux
  endroits.

#### Slice : `seuil-et-etat`

- **Phrase** : Dériver l'état sémantique d'un indicateur (dans la cible / hors cible /
  cible absente) de la comparaison entre sa valeur et la cible versionnée de sa définition.
- **User stories** : US-4
- **Règles métier** : B11
- **Dépend de** : `consultation-indicateur`
- **Dépendue par** : *aucune* (feuille du graphe)
- **Écrans** : `indicateur-detail`, `indicateurs`
- **Peut être parallélisée avec** : `historique-indicateur`, `drill-down`, `export-provenance` (vague 3)
- **Périmètre MVP** : l'**état** dérivé de la valeur, avec sa date de calcul. Pas de
  machine à états, pas de tâche de fond, pas d'alerte : B12 part en V1 avec le canal
  mail (`roadmap.md` § 2.2). Un seuil posé sur une définition non signée est refusé.

#### Slice : `historique-indicateur`

- **Phrase** : Montrer les versions signées d'un indicateur avec, pour chacune, sa
  valeur, sa date de calcul issue de la source, sa date de signature et son signataire,
  et formuler en langue métier l'écart entre deux versions.
- **User stories** : US-17
- **Règles métier** : B22, B24 (B18 cité comme retiré)
- **Dépend de** : `query-engine`, `definition-signer`, `access-log`
- **Dépendue par** : *aucune*
- **Écrans** : `indicateur-detail` (split screen, historique)
- **Peut être parallélisée avec** : `seuil-et-etat`, `drill-down`, `export-provenance` (vague 3)
- **Journalisation** : la consultation de l'historique est elle-même journalisée comme
  une consultation (B24), via `access-log`. Ce n'est pas une vue d'administration.

#### Slice : `drill-down`

- **Phrase** : Ouvrir, depuis une valeur, les lignes qui la composent, sous le même
  périmètre et les mêmes droits que l'écran d'origine.
- **User stories** : US-5
- **Règles métier** : B15, B7
- **Dépend de** : `query-engine`, `consultation-indicateur`
- **Dépendue par** : *aucune*
- **Écrans** : `decomposition`
- **Peut être parallélisée avec** : `seuil-et-etat`, `historique-indicateur`, `export-provenance` (vague 3)

### 3.4 Module `tableau-de-bord` — rang 2, fréquence 4 (hebdomadaire)

#### Slice : `partage-dashboard`

- **Phrase** : Composer un tableau de bord par assemblage **fixe** d'indicateurs
  officiels et le partager à une liste nominative ou à un groupe de l'annuaire.
- **User stories** : US-6
- **Règles métier** : B9, B16
- **Dépend de** : `auth`, `definition-declarer`
- **Dépendue par** : *aucune*
- **Écrans** : `tableau-de-bord`, `tableau-de-bord-composition`
- **Peut être parallélisée avec** : `definition-signer`, `consultation-indicateur` (vague 2)
- **Borne de périmètre** : assemblage fixe, aucune liberté de placement, aucun filtre
  libre hors ceux écrits dans la définition. US-10 (composeur libre) est en V1.

#### Slice : `export-provenance`

- **Phrase** : Produire en tâche de fond un PDF ou un CSV portant exactement le
  périmètre, la période, la version de définition, la date de signature, la date de
  calcul et la source de l'écran d'origine.
- **User stories** : US-9
- **Règles métier** : B8, B27, B22
- **Dépend de** : `query-engine`, `restriction-lignes`, `consultation-indicateur`
- **Dépendue par** : *aucune*
- **Écrans** : `tableau-de-bord`, `indicateur-detail`
- **Peut être parallélisée avec** : `seuil-et-etat`, `historique-indicateur`, `drill-down` (vague 3)
- **Nota** : c'est la seule slice qui consomme le worker de fond. Elle consomme le
  **contrat** `ExportJobPort` (§ 5.15), pas la fondation.

### 3.5 Module `definitions` — rang 3, fréquence 2 (mensuel)

#### Slice : `definition-declarer`

- **Phrase** : Écrire la définition versionnée d'un indicateur — intitulé, formule,
  périmètre, propriétaire **nommé**, signataire désigné — et y porter la cible.
- **User stories** : US-1, US-11
- **Règles métier** : B1, B3, B14, B22 (B18 cité comme retiré)
- **Dépend de** : `auth`, `design-primitives`
- **Dépendue par** : `definition-signer`, `consultation-indicateur`, `partage-dashboard`
- **Écrans** : `definition-formulaire`, `definitions`
- **Peut être parallélisée avec** : `restriction-lignes`, `journal-acces` (vague 1)
- **Porte de sortie** : le `owner-picker` de `FormField` n'accepte pas la saisie libre
  et la case signataire ne propose **pas** l'auteur. Le refus d'enregistrer sans
  propriétaire nommé **et** sans signataire désigné est une contrainte de base, pas un
  message de formulaire.

#### Slice : `definition-signer`

- **Phrase** : Signer, refuser avec motif, ou révoquer avant publication une version de
  définition dont on n'est pas l'auteur, chaque acte étant journalisé.
- **User stories** : US-2
- **Règles métier** : B2, B26
- **Dépend de** : `auth`, `definition-declarer`
- **Dépendue par** : `historique-indicateur`
- **Écrans** : `definition-signature`
- **Peut être parallélisée avec** : `consultation-indicateur`, `partage-dashboard` (vague 2)
- **Verrou structurel** : `signer_id ≠ author_id` est une contrainte d'intégrité en
  base, pas un garde d'interface (ADR-1).

### 3.6 Module `acces` — rang 4, fréquence 1 (occasionnel)

#### Slice : `restriction-lignes`

- **Phrase** : Garantir qu'aucun lecteur n'obtient par aucun chemin une ligne qu'il
  n'a pas le droit de voir — écran, drill-down, export ou API.
- **User stories** : US-7
- **Règles métier** : B7
- **Dépend de** : `auth`, `query-engine`
- **Dépendue par** : `export-provenance`
- **Écrans** : *aucun écran propre.* La slice modifie `indicateurs` et `tableau-de-bord` :
  un indicateur interdit n'est pas rendu (E5) et son exclusion est journalisée.
- **Peut être parallélisée avec** : `definition-declarer`, `journal-acces` (vague 1)
- **Critère de fin** : le test E2E de `conventions.md` — un profil « équipe » et un
  profil « sans droit » sur le **même** dashboard partagé, sur l'entrepôt de test
  seedé. Sans la fixture (F-002), cette slice ne peut pas être déclarée terminée :
  elle est vérifiable, pas seulement écrite.

#### Slice : `journal-acces`

- **Phrase** : Permettre à une personne nommée de consulter le journal des accès,
  filtré selon ses propres droits, et d'en demander un export.
- **User stories** : US-8
- **Règles métier** : B10, B23, B25
- **Dépend de** : `auth`, `access-log`
- **Dépendue par** : *aucune*
- **Écrans** : `acces-journal`
- **Peut être parallélisée avec** : `definition-declarer`, `restriction-lignes` (vague 1)

### 3.7 Pathologies de l'archétype, traitées ou non

`archetypes.md` § 9 — pour chacune, la porte qui la ferme, pas l'intention :

| Pathologie | Traitement | Porte mécanique |
|---|---|---|
| Un fait, deux représentations | La valeur, la cible et le seuil vivent sur la **version de définition**, jamais recalculés | `definition_version` est `immutable` ; les colonnes `target_*` et la table `definition_threshold` sont écrites une fois |
| Une absence présentée comme un zéro | `ReadOutcome` / `ListOutcome` sont des unions discriminées ; `[]` et « échec » sont deux membres distincts | Type : il n'existe pas de chemin produisant `{ value: 0 }` depuis une panne |
| Fail-open sur une autorisation | `AccessDecision` n'a pas de cas « inconnu » ; le rôle SQL du journal n'a pas `UPDATE`/`DELETE` | Type + test d'intégration sur les droits SQL |
| Un booléen qui tranche seul | `resolveSemanticState()` est une fonction nommée, testée sur ses deux côtés | Test unitaire sur la fonction, pas sur le rendu |
| Un calcul dupliqué | Le scope, le périmètre résolu et le format de la date de calcul ont **une** implémentation | `withScope()` est le seul point d'entrée ; ESLint interdit l'import direct du driver |
| Une caractéristique instable | Le tri de la décomposition a un critère de départage total (`contribution` puis `key`) | Le plan de requête porte `ORDER BY contribution DESC, line_key ASC` |

---

## 4. Modèles de données

### 4.1 Où vit quoi, et pourquoi

| Classe de donnée | Stockage | Écrit par Amberline | Rétention | Fondement |
|---|---|---|---|---|
| Valeurs d'indicateurs, dates de calcul, identifiants de source | **Entrepôt** | **Jamais** (C1) | Inchangée, pilotée par l'équipe data | `query-engine` |
| Lignes de décomposition | **Entrepôt** | **Jamais** (C1) | Inchangée | `query-engine` |
| Définitions, versions, signatures, seuils, cibles | PostgreSQL | Oui | Durable | `definition-declarer` / `definition-signer` |
| Tableaux de bord et partages nominatifs | PostgreSQL | Oui | Durable | `partage-dashboard` |
| Journal des accès | PostgreSQL, **append-only** | Insertion seule | 1 an, purgée (B10, C4) | `access-log` |
| File et artefacts d'export | PostgreSQL | Oui | 7 j après téléchargement | `export-provenance` |
| Cache court des lectures | PostgreSQL | Oui | 24 h | `query-engine` |
| Identités et groupes | Miroir local de l'annuaire OIDC | Oui (réconciliation) | Durable, désactivation propagée | `auth` |

**Pourquoi les valeurs restent dans l'entrepôt.** C1 est une contrainte, pas une
préférence : l'entreprise a déjà une chaîne de calcul qui produit ces chiffres, et elle
est gouvernée par l'équipe data. Amberline n'écrit jamais dans l'entrepôt, donc :

- une valeur affichée est **la** valeur de l'entreprise, pas une recopie (B4) ;
- la date de calcul est lue **dans la source** (B5) et ne peut pas être re-stampée par
  notre horloge : un champ de fraîcheur calculé chez nous décrirait notre lecture, pas
  la donnée (B6) ;
- il n'existe aucun moyen de « corriger » une valeur depuis l'outil. La seule correction
  est une nouvelle version de définition, puis une nouvelle signature (B1, B2, ADR-8).

**Pourquoi PostgreSQL ne porte que ça.** Le journal des accès contient des données
personnelles (identité, périmètre consulté) : le sortir de l'entrepôt permet le
chiffrement au repos, l'isolation par ligne, la restauration à un instant et la purge
à un an exigés par C4 et C10, sans négocier avec l'équipe data. La file d'export y vit
parce qu'un job long a besoin d'un état durable et reprenable, pas parce qu'elle est
prolongée.

**Ce que l'entrepôt doit exposer (contrat, pas propriété).** Amberline ne possède pas
le schéma de l'entrepôt et n'écrit aucune migration dessus. Les deux entités § 4.16 et
§ 4.17 sont donc un **contrat de lecture imposé** : un test d'intégration vérifie que
les colonnes et les jointures attendues existent, et échoue bruyamment si l'équipe data
les renomme. C'est un prérequis de démarrage, pas une vérification optionnelle.

### 4.2 `actor` — personne nommée de l'annuaire *(PostgreSQL)*

Miroir local du fournisseur d'identité. Il existe parce que B3 exige une **personne
nommée** et que B17 doit pouvoir constater qu'un propriétaire est inactif ; ces deux
questions ne peuvent pas être résolues par un appel OIDC à chaque rendu.

| Champ | Type | Nullable | Défaut | Contraintes | Description | Exemple |
|---|---|---|---|---|---|---|
| `actor_id` | `text` (PK) | non | — | `sub` OIDC, 1..255 car. | Identité stable, source de vérité du journal | `00u8f3ac21` |
| `display_name` | `text` | non | — | 1..120 car. | Nom affiché ; jamais une chaîne de rôle | `Camille Roux` |
| `email` | `text` | non | — | motif adresse, ≤ 254 car. | Contact, non utilisé comme identifiant | `camille.roux@exemple.fr` |
| `is_directory_entry` | `boolean` | non | `true` | — | Vrai si la personne existe dans l'annuaire | `true` |
| `is_active` | `boolean` | non | `true` | — | Faux si la personne a quitté l'entreprise (B17) | `true` |
| `is_signer` | `boolean` | non | `false` | — | La personne peut hold le rôle de signataire (B2) | `true` |
| `directory_synced_at` | `timestamptz` | non | — | — | Dernière réconciliation avec l'annuaire | `2026-09-30T06:00:00Z` |
| `created_at` | `timestamptz` | non | `now()` | — | Création du miroir local | `2026-09-12T09:14:02Z` |
| `updated_at` | `timestamptz` | non | `now()` | — | Dernière écriture | `2026-09-28T11:02:41Z` |

### 4.3 `actor_group` — groupe d'annuaire *(PostgreSQL)*

| Champ | Type | Nullable | Défaut | Contraintes | Description | Exemple |
|---|---|---|---|---|---|---|
| `group_code` | `text` (PK) | non | — | `^[A-Z0-9][A-Z0-9-]{1,15}$` | Code de groupe, référencé par les partages | `COMMERCIAL` |
| `display_name` | `text` | non | — | 1..80 car. | Libellé affiché | `Équipe commerciale` |
| `is_active` | `boolean` | non | `true` | — | Groupe dissous | `true` |
| `updated_at` | `timestamptz` | non | `now()` | — | Dernière synchronisation | `2026-09-28T11:02:41Z` |

### 4.4 `actor_group_member` — appartenance *(PostgreSQL)*

| Champ | Type | Nullable | Défaut | Contraintes | Description | Exemple |
|---|---|---|---|---|---|---|
| `group_code` | `text` (FK) | non | — | → `actor_group.group_code` | Groupe | `COMMERCIAL` |
| `actor_id` | `text` (FK) | non | — | → `actor.actor_id` | Membre | `00u8f3ac21` |
| `valid_from` | `timestamptz` | non | `now()` | — | Début de validité (E14) | `2026-01-05T08:00:00Z` |
| `valid_to` | `timestamptz` | **oui** | `NULL` | `> valid_from` | Fin de validité ; `NULL` = membre courant | `NULL` |

Clé primaire composite `(group_code, actor_id, valid_from)`. Une ligne n'est jamais
mise à jour : une sortie de groupe se matérialise par `valid_to` (E14, « la nouvelle
composition s'applique à la prochaine lecture »).

### 4.5 `indicator` — l'indicateur *(PostgreSQL)*

L'identité stable et le propriétaire. Le reste — formule, périmètre, cible, seuil —
vit sur les versions, jamais ici : les modifier ne doit pas réécrire l'historique (B1).

| Champ | Type | Nullable | Défaut | Contraintes | Description | Exemple |
|---|---|---|---|---|---|---|
| `indicator_id` | `uuid` (PK) | non | `gen_random_uuid()` | — | Identifiant interne, jamais exposé en URL | `3f1c…` |
| `slug` | `text` | non | — | `^[a-z0-9][a-z0-9-]{2,63}$`, unique | Identifiant d'URL, jamais d'identifiant technique | `ca-par-client` |
| `label` | `text` | non | — | 1..120 car. | Intitulé courant, dénormalisé depuis la version signée | `CA par client` |
| `warehouse_key` | `text` | non | — | `^[a-z0-9_.]{2,64}$`, unique | Clé de l'indicateur **dans l'entrepôt** | `sales.customer_revenue` |
| `owner_actor_id` | `text` (FK) | non | — | → `actor.actor_id` ; l'acteur doit être `is_directory_entry` | Propriétaire **nommé** (B3) | `00u91ab77c` |
| `designated_signer_actor_id` | `text` (FK) | non | — | → `actor.actor_id` ; **≠ `owner_actor_id`** | Signataire désigné ; l'auteur ne peut pas se désigner (B2) | `00u77cd1fe` |
| `current_signed_version_id` | `uuid` (FK) | **oui** | `NULL` | → `definition_version.definition_version_id` | Version qui porte la valeur publiée (B4) | `9b2e…` |
| `officiality` | `text` | non | `'provisional'` | `official` \| `provisional` \| `stale_owner` | Statut affiché ; `stale_owner` si propriétaire inactif (B17) | `official` |
| `created_at` | `timestamptz` | non | `now()` | — | Création | `2026-09-12T09:20:00Z` |
| `updated_at` | `timestamptz` | non | `now()` | — | Dernière écriture | `2026-09-25T16:41:12Z` |

> `officiality` est **dérivé** et recalculé à la lecture : un indicateur dont le
> propriétaire devient inactif passe à `stale_owner` **sans aucune écriture** (B17).
> Le champ est donc une commodité de requête, jamais la source de vérité.

### 4.6 `definition_version` — version figée *(PostgreSQL)*

Le dépôt (ADR-8). Chaque ligne est immuable : ni `UPDATE` ni `DELETE` ne sont accordés
au rôle applicatif sur cette table.

| Champ | Type | Nullable | Défaut | Contraintes | Description | Exemple |
|---|---|---|---|---|---|---|
| `definition_version_id` | `uuid` (PK) | non | `gen_random_uuid()` | — | Identifiant de version | `9b2e…` |
| `indicator_id` | `uuid` (FK) | non | — | → `indicator.indicator_id`, `ON DELETE RESTRICT` | Indicateur concerné | `3f1c…` |
| `version_no` | `integer` | non | — | ≥ 1 ; unique `(indicator_id, version_no)` | Rang de la version, croissant, jamais réattribué | `3` |
| `status` | `text` | non | `'draft'` | `draft` \| `in_review` \| `signed` \| `refused` \| `published` \| `revoked` | Cycle de vie de la version | `signed` |
| `author_actor_id` | `text` (FK) | non | — | → `actor.actor_id` | Auteur de **cette** version | `00u91ab77c` |
| `label` | `text` | non | — | 1..120 car. | Intitulé porté par la version | `CA par client` |
| `formula` | `text` | non | — | 1..2000 car., SQL vérifié par `query-planner` | Formule, figée pour toujours | `sum(sales.net_amount)` |
| `scope_expr` | `text` | non | — | 1..2000 car. | Périmètre écrit ; **jamais** de filtre libre à l'exécution | `region = 'FR'` |
| `grain` | `text` | non | `'month'` | `day` \| `week` \| `month` | Granularité du calcul | `month` |
| `unit` | `text` | non | — | 1..16 car. | Unité d'affichage | `EUR` |
| `target_value` | `numeric(18,6)` | **oui** | `NULL` | — | Cible versionnée avec la définition (B14) | `1250000.00` |
| `target_unit` | `text` | **oui** | `NULL` | cohérent avec `unit` si présent | Unité de la cible | `EUR` |
| `target_confirmed_at` | `timestamptz` | **oui** | `NULL` | — | Date d'écriture de la cible sur **cette** version ; `NULL` ⇒ E16 « cible à reconfirmer » | `2026-09-20T14:00:00Z` |
| `change_note` | `text` | non | — | 1..500 car. | Explication **en langue métier** de ce qui change (US-17) | `les lignes sous-traitées ne sont plus comptées` |
| `created_at` | `timestamptz` | non | `now()` | — | Création de la version | `2026-09-24T10:12:00Z` |
| `published_at` | `timestamptz` | **oui** | `NULL` | ≥ `created_at` | Première publication : rend la signature non révocable (B26) | `2026-09-26T08:30:00Z` |

> `target_confirmed_at` est la clé du cas E16 : une cible **ne suit pas**
> automatiquement la version. Si la version change sans cible réécrite, la comparaison
> sémantique est suspendue et la tuile affiche « cible à reconfirmer ».

### 4.7 `definition_threshold` — seuil versionné *(PostgreSQL)*

Un seuil appartient à la version qu'il accompagne et se signe avec elle (B11) : le
déplacer plus tard serait changer une version signée.

| Champ | Type | Nullable | Défaut | Contraintes | Description | Exemple |
|---|---|---|---|---|---|---|
| `definition_threshold_id` | `uuid` (PK) | non | `gen_random_uuid()` | — | Identifiant | `c7d0…` |
| `definition_version_id` | `uuid` (FK) | non | — | → `definition_version`, `ON DELETE CASCADE`, **unique** | Version porteuse ; 1 seuil par version au MVP | `9b2e…` |
| `comparison` | `text` | non | — | `below` \| `above` | Sens du seuil (B11) | `below` |
| `threshold_value` | `numeric(18,6)` | non | — | — | Valeur de bascule | `0.95` |
| `label` | `text` | non | — | 1..120 car. | Libellé affiché, non technique | `Taux de service hors cible` |
| `defined_at` | `timestamptz` | non | `now()` | — | Date d'écriture du seuil (B11 « porte sa date ») | `2026-09-24T10:13:00Z` |

> La contrainte `UNIQUE(definition_version_id)` est ce qui interdit à une version signée
> de voir son seuil changer : la modifier, c'est créer une version.

### 4.8 `signature_event` — actes de signature *(PostgreSQL, append-only)*

Un seul journal pour signer, refuser et révoquer. `revoke` **référence** l'acte qu'il
annule au lieu de le modifier : la trace reste complète (B26).

| Champ | Type | Nullable | Défaut | Contraintes | Description | Exemple |
|---|---|---|---|---|---|---|
| `signature_event_id` | `uuid` (PK) | non | `gen_random_uuid()` | — | Identifiant de l'acte | `4a11…` |
| `definition_version_id` | `uuid` (FK) | non | — | → `definition_version`, `ON DELETE RESTRICT` | Version visée | `9b2e…` |
| `actor_id` | `text` (FK) | non | — | → `actor.actor_id` | Acteur | `00u77cd1fe` |
| `act` | `text` | non | — | `sign` \| `refuse` \| `revoke` | Nature de l'acte | `sign` |
| `revokes_event_id` | `uuid` (FK) | **oui** | `NULL` | → `signature_event` ; requis si `act = 'revoke'` | Acte révoqué | `4a10…` |
| `reason` | `text` | **oui** | `NULL` | requis si `act = 'refuse'` ; 1..500 car. | Motif du refus ou de la révocation | `périmètre à préciser` |
| `occurred_at` | `timestamptz` | non | `now()` | — | Horodatage de l'acte (B2 « signature horodatée ») | `2026-09-26T08:12:44Z` |

**Contraintes d'intégrité, en base et non en application** (ADR-1) :

```sql
-- 1. L'auto-signature est impossible, y compris en cas de bug d'interface.
ALTER TABLE signature_event ADD CONSTRAINT signer_is_not_author CHECK (
  actor_id <> (SELECT author_actor_id FROM definition_version
               WHERE definition_version_id = signature_event.definition_version_id)
);
-- 2. Le motif est obligatoire pour un refus.
ALTER TABLE signature_event ADD CONSTRAINT refusal_has_reason CHECK (
  act <> 'refuse' OR (reason IS NOT NULL AND length(btrim(reason)) > 0)
);
-- 3. Un revoke référence un sign, pas un refuse.
ALTER TABLE signature_event ADD CONSTRAINT revoke_targets_signature CHECK (
  act <> 'revoke' OR revokes_event_id IS NOT NULL
);
-- 4. Au plus une signature active par version et par signataire.
CREATE UNIQUE INDEX one_active_signature_per_signer
  ON signature_event (definition_version_id, actor_id)
  WHERE act = 'sign' AND revokes_event_id IS NULL;
```

### 4.9 `dashboard` — tableau de bord *(PostgreSQL)*

| Champ | Type | Nullable | Défaut | Contraintes | Description | Exemple |
|---|---|---|---|---|---|---|
| `dashboard_id` | `uuid` (PK) | non | `gen_random_uuid()` | — | Identifiant interne | `5c0e…` |
| `slug` | `text` | non | — | `^[a-z0-9][a-z0-9-]{2,63}$`, unique | Segment d'URL `/d/[slug]` | `ca-mensuel-commercial` |
| `label` | `text` | non | — | 1..120 car. | Titre du tableau | `Comité mensuel — commercial` |
| `author_actor_id` | `text` (FK) | non | — | → `actor.actor_id` | Compositeur | `00u91ab77c` |
| `scope_expr_version_id` | `uuid` (FK) | non | — | → `definition_version` | Version de définition dont hérite le périmètre de lecture | `9b2e…` |
| `is_official` | `boolean` | non | `true` | — | Faux si un indicateur servant a perdu son statut officiel (B17, E17) | `true` |
| `created_at` | `timestamptz` | non | `now()` | — | Création | `2026-09-26T09:00:00Z` |
| `updated_at` | `timestamptz` | non | `now()` | — | Dernière écriture | `2026-09-28T17:12:00Z` |

> Le tableau **reste consultable** quand un indicateur perd son statut officiel : le
> retirer effacerait ce que le lecteur attendait (E17). Il perd seulement son caractère
> officiel, et chaque tuile concernée porte la mention.

### 4.10 `dashboard_indicator` — assemblage fixe *(PostgreSQL)*

La table est **ordonnée et figée** dans sa forme : `position` est un `smallint` dense
et l'unicité `(dashboard_id, position)` interdit toutplacement libre (ADR-4).

| Champ | Type | Nullable | Défaut | Contraintes | Description | Exemple |
|---|---|---|---|---|---|---|
| `dashboard_id` | `uuid` (FK, PK₁) | non | — | → `dashboard`, `ON DELETE CASCADE` | Tableau de bord | `5c0e…` |
| `position` | `smallint` (PK₂) | non | — | 0..99 ; unique `(dashboard_id, position)` | Rang dans la grille | `0` |
| `indicator_id` | `uuid` (FK) | non | — | → `indicator` ; unique `(dashboard_id, indicator_id)` | Indicateur affiché | `3f1c…` |
| `pinned_version_id` | `uuid` (FK) | non | — | → `definition_version` | **Version** à afficher, pas seulement l'indicateur | `9b2e…` |
| `tile_size` | `text` | non | `'md'` | `sm` \| `md` \| `lg` | Taille de tuile ; seul levier de présentation au MVP | `md` |
| `added_at` | `timestamptz` | non | `now()` | — | Ajout au tableau | `2026-09-26T09:01:12Z` |

> `pinned_version_id` est la matérialisation de B16 : tant que la nouvelle version n'est
> pas signée, le tableau affiche **celle qui l'est**. C'est une donnée, pas un calcul
> à l'affichage.

### 4.11 `dashboard_grant` — partage nominatif *(PostgreSQL)*

| Champ | Type | Nullable | Défaut | Contraintes | Description | Exemple |
|---|---|---|---|---|---|---|
| `grant_id` | `uuid` (PK) | non | `gen_random_uuid()` | — | Identifiant du partage | `8a71…` |
| `dashboard_id` | `uuid` (FK) | non | — | → `dashboard`, `ON DELETE CASCADE` | Tableau partagé | `5c0e…` |
| `grantee_kind` | `text` | non | — | `actor` \| `group` | Nature du bénéficiaire (B9) | `group` |
| `grantee_id` | `text` | non | — | `actor` → `actor.actor_id` ; `group` → `actor_group.group_code` | Bénéficiaire nommé | `COMMERCIAL` |
| `granted_by_actor_id` | `text` (FK) | non | — | → `actor.actor_id` | Qui a partagé | `00u91ab77c` |
| `granted_at` | `timestamptz` | non | `now()` | — | Date du partage | `2026-09-26T09:20:00Z` |
| `expires_at` | `timestamptz` | **oui** | `NULL` | `> granted_at` | Fin de validité ; `NULL` = sans terme | `NULL` |

> Il n'existe **aucun** `grant_token` et aucune colonne « public ». B18 est retiré :
> une adresse de dashboard restitue un état, elle ne constitue jamais un droit (B9).

### 4.12 `export_job` — file d'export *(PostgreSQL)*

| Champ | Type | Nullable | Défaut | Contraintes | Description | Exemple |
|---|---|---|---|---|---|---|
| `export_job_id` | `uuid` (PK) | non | `gen_random_uuid()` | — | Identifiant du job, renvoyé à l'UI | `e14b…` |
| `requested_by_actor_id` | `text` (FK) | non | — | → `actor.actor_id` | Auteur de l'export (B27) | `00u2ab90f4` |
| `source_kind` | `text` | non | — | `dashboard` \| `indicator` \| `history` | Ressource exportée | `dashboard` |
| `source_id` | `uuid` ( FK) | non | — | `dashboard_id` ou `indicator_id` | Ressource | `5c0e…` |
| `format` | `text` | non | — | `pdf` \| `csv` | Format demandé | `pdf` |
| `scope_snapshot` | `jsonb` | non | — | schéma Zod `scopeSchema` | **Photographie** du périmètre au moment de la demande (B8) | `{"teams":["COMMERCIAL"],"period":{…}}` |
| `version_pins` | `jsonb` | non | `[]` | tableau d'`uuid` de `definition_version` | Versions fixées au moment de la demande (B22, B27) | `["9b2e…","7c11…"]` |
| `idempotency_key` | `text` | non | — | unique ; 1..80 car. | Dédoublonnage du double-clic | `9f2c-1click` |
| `state` | `text` | non | `'queued'` | `queued` \| `running` \| `ready` \| `failed` \| `refused` | État du job | `queued` |
| `error_code` | `text` | **oui** | `NULL` | valeur de `ERROR_CODES` ; requis si `state = 'failed'` | Cause d'un échec (E13) | `EXPORT_SCOPE_DENIED` |
| `requested_at` | `timestamptz` | non | `now()` | — | Demande | `2026-09-29T07:41:00Z` |
| `started_at` | `timestamptz` | **oui** | `NULL` | ≥ `requested_at` | Début d'exécution | `2026-09-29T07:41:04Z` |
| `finished_at` | `timestamptz` | **oui** | `NULL` | ≥ `started_at` | Fin, succès ou échec | `2026-09-29T07:42:30Z` |

> `scope_snapshot` est une **photographie**, pas une référence. L'export ne réévalue pas
> le périmètre au moment de la production : il reproduit celui de l'écran d'origine,
> ce qui est exactement ce qu'exige B8. Le job est aussi protégé par
> `unique(idempotency_key)`.

### 4.13 `export_artifact` — fichier produit *(PostgreSQL)*

| Champ | Type | Nullable | Défaut | Contraintes | Description | Exemple |
|---|---|---|---|---|---|---|
| `export_artifact_id` | `uuid` (PK) | non | `gen_random_uuid()` | — | Identifiant du fichier | `f0a2…` |
| `export_job_id` | `uuid` (FK) | non | — | → `export_job`, `ON DELETE CASCADE`, unique | Job producteur | `e14b…` |
| `storage_key` | `text` | non | — | 1..300 car. | Clé de l'objet, hors PostgreSQL | `exports/2026/09/e14b…pdf` |
| `byte_size` | `bigint` | non | — | ≥ 0 | Taille, pour l'affichage | `184320` |
| `row_count` | `integer` | **oui** | `NULL` | ≥ 0 | Lignes exportées ; `NULL` pour un PDF | `18420` |
| `definition_version_id` | `uuid` (FK) | non | — | → `definition_version`, `ON DELETE RESTRICT` | Version à laquelle le support reste rattaché (B22, B27) | `9b2e…` |
| `definition_signed_at` | `timestamptz` | **oui** | `NULL` | — | Date de signature recopiée dans le support (B27) | `2026-09-26T08:12:44Z` |
| `computed_at` | `timestamptz` | **oui** | `NULL` | — | Date de calcul **de la source**, recopiée dans le support (B27) | `2026-09-29T05:00:00Z` |
| `source_ref` | `text` | non | — | 1..120 car. | Identifiant de la matérialisation, imprimé tel quel | `marts_sales_v42` |
| `created_at` | `timestamptz` | non | `now()` | — | Production | `2026-09-29T07:42:30Z` |
| `expires_at` | `timestamptz` | non | `now() + 7 j` | — | Purge 7 j après téléchargement (`conventions.md`) | `2026-10-06T07:42:30Z` |

### 4.14 `access_log` — journal des accès *(PostgreSQL, append-only)*

| Champ | Type | Nullable | Défaut | Contraintes | Description | Exemple |
|---|---|---|---|---|---|---|
| `access_log_id` | `bigint` (PK, identity) | non | — | — | Ordre d'insertion ; un journal sans ordre n'est pas un journal | `884213` |
| `actor_id` | `text` (FK) | non | — | → `actor.actor_id` | Qui a consulté (B10) | `00u2ab90f4` |
| `resource_kind` | `text` | non | — | `indicator` \| `dashboard` \| `definition` \| `history` \| `export` \| `journal` | Nature de la ressource | `indicator` |
| `resource_slug` | `text` | non | — | 1..120 car. | Ressource visée — **journalisée même en cas de refus** (B25) | `ca-par-client` |
| `scope_teams` | `text[]` | **oui** | `NULL` | ≤ 50 éléments | Équipes de la demande | `{COMMERCIAL}` |
| `scope_period` | `text` | **oui** | `NULL` | `YYYY-MM-DD..YYYY-MM-DD` | Période demandée | `2026-09-01..2026-09-30` |
| `outcome` | `text` | non | — | `granted` \| `refused` \| `not_found` \| `error` | Issue, **y compris pour un refus** (B10) | `refused` |
| `error_code` | `text` | **oui** | `NULL` | valeur de `ERROR_CODES` | Cause du refus | `SCOPE_DENIED` |
| `request_id` | `text` | non | — | 1..64 car. | Corrélation technique ; jamais la payload brute (RGPD) | `req_01J8Z…` |
| `occurred_at` | `timestamptz` | non | `now()` | — | Horodatage ; **seul** endroit où notre horloge a un sens | `2026-09-29T07:41:02Z` |
| `expires_at` | `timestamptz` | non | `occurred_at + 365 j` | — | Purge à un an (B10, C4) | `2027-09-29T07:41:02Z` |

> **Aucune ligne, aucun `filter` applicatif, aucun `computed_at` dans cette table** :
> B25 impose de journaliser la ressource visée, jamais le détail des lignes. Une
> colonne « nombre de lignes renvoyées » serait déjà une fuite de périmètre.

Index : `(actor_id, occurred_at DESC)`, `(resource_slug, occurred_at DESC)`,
`(occurred_at DESC)`. Rôle SQL applicatif : `INSERT` + `SELECT` uniquement. La purge
passe par un rôle distinct, journalisé (C4).

### 4.15 `query_cache` — cache court *(PostgreSQL)*

| Champ | Type | Nullable | Défaut | Contraintes | Description | Exemple |
|---|---|---|---|---|---|---|
| `query_hash` | `text` (PK₁) | non | — | `sha256(indicatorKey + versionId + scope canonique)`, 64 car. | Clé de requête | `a91f…` |
| `actor_scope_hash` | `text` (PK₂) | non | — | `sha256(équipes accordées)`, 64 car. | **Partie de la clé** : deux périmètres différents n'échangent jamais de résultat | `4c02…` |
| `payload` | `jsonb` | non | — | schéma `WarehouseValue` | Résultat mis en cache | `{…}` |
| `computed_at_source` | `timestamptz` | **oui** | `NULL` | — | `computed_at` **de la source**, recopié ; sert à ne pas servir une valeur périmée comme fraîche | `2026-09-29T05:00:00Z` |
| `source_ref` | `text` | non | — | 1..120 car. | Matérialisation interrogée | `marts_sales_v42` |
| `stored_at` | `timestamptz` | non | `now()` | — | Écriture | `2026-09-29T07:41:01Z` |
| `expires_at` | `timestamptz` | non | `now() + 24 h` | — | Purge 24 h (`conventions.md`) | `2026-09-30T07:41:01Z` |

> Le cache **inclut le périmètre dans sa clé**. C'est la seule chose qui rend le cache
> compatible avec B7 : un cache global transformerait une restriction de ligne en fuite
> entre deux lecteurs.

### 4.16 `session` — session applicative *(PostgreSQL)*

| Champ | Type | Nullable | Défaut | Contraintes | Description | Exemple |
|---|---|---|---|---|---|---|
| `session_id` | `uuid` (PK) | non | `gen_random_uuid()` | — | Identifiant de session | `2f81…` |
| `actor_id` | `text` (FK) | non | — | → `actor.actor_id` | Identité de la session | `00u2ab90f4` |
| `oidc_iss` | `text` | non | — | 1..200 car. | Émetteur du jeton, vérifié à chaque requête | `https://idp.exemple.fr` |
| `rights_snapshot` | `text[]` | non | `[]` | — | Équipes accordées au moment de l'émission ; **réévaluées** à chaque lecture | `{COMMERCIAL}` |
| `created_at` | `timestamptz` | non | `now()` | — | Émission | `2026-09-29T07:00:00Z` |
| `expires_at` | `timestamptz` | non | `created_at + 8 h` | > `created_at` | Fin de session (8 h, `conventions.md`) | `2026-09-29T15:00:00Z` |
| `rotated_at` | `timestamptz` | **oui** | `NULL` | — | Dernière rotation, à chaque élévation de droit | `2026-09-29T12:14:00Z` |
| `revoked_at` | `timestamptz` | **oui** | `NULL` | — | Révocation : la perte d'accès est immédiate (E14) | `NULL` |

> Le cookie ne contient qu'un identifiant opaque de session. Ni équipe, ni droit, ni
> nom de personne dans le cookie : une perte d'accès doit s'appliquer **à la lecture
> suivante** (E14), donc la résolution est faite à chaque requête, pas à l'émission.

### 4.17 `warehouse_indicator_value` — valeur officielle *(entrepôt, lecture seule, contrat imposé)*

**Ce n'est pas une table d'Amberline.** C'est le contrat que l'entrepôt doit exposer.
Aucune migration n'est écrite dessus (C1). Un test d'intégration échoue si une colonne
attendue disparaît.

| Champ | Type | Nullable | Défaut | Contraintes | Description | Exemple |
|---|---|---|---|---|---|---|
| `indicator_key` | `text` | non | — | jointure `warehouse_key` de `indicator` | Clé de l'indicateur | `sales.customer_revenue` |
| `scope_fingerprint` | `text` | non | — | empreinte canonique du périmètre résolu | Empêche de lire une valeur calculée sur un autre périmètre | `sha256:…` |
| `period_start` | `date` | non | — | début de la période demandée | Borne basse | `2026-09-01` |
| `period_end` | `date` | non | — | ≥ `period_start` | Borne haute | `2026-09-30` |
| `metric_value` | `numeric(18,6)` | non | — | — | Valeur publiée | `1184320.55` |
| `metric_unit` | `text` | non | — | 1..16 car. | Unité | `EUR` |
| **`computed_at`** | `timestamptz` | **oui** | — | — | **Horodatage du snapshot dans l'entrepôt** (B5). `NULL` ⇒ fraîcheur inconnue (B6) | `2026-09-29T05:00:00Z` |
| `source_ref` | `text` | non | — | 1..120 car. | Identifiant de la matérialisation | `marts_sales_v42` |
| `resolved_scope` | `jsonb` | non | — | objet périmètre | Périmètre **effectivement** résolu ; sert à détecter E15 (périmètre vide) | `{"teams":["COMMERCIAL"]}` |

> `computed_at` nullable est une **décision de conception** : B6 exige que l'absence
> d'horodatage dans la source soit affichée « inconnue » plutôt que comblée. Si la
> colonne n'existait pas du tout, l'information serait perdue avant d'arriver à l'UI.

### 4.18 `warehouse_indicator_line` — lignes de décomposition *(entrepôt, lecture seule, contrat imposé)*

| Champ | Type | Nullable | Défaut | Contraintes | Description | Exemple |
|---|---|---|---|---|---|---|
| `indicator_key` | `text` | non | — | — | Clé de l'indicateur | `sales.service_rate` |
| `line_key` | `text` | non | — | **critère de départage total** du tri (`archetypes.md` § 9) | Identifiant stable de la ligne | `LIG-0004821` |
| `line_label` | `text` | non | — | 1..120 car. | Libellé lisible | `Ligne 4821 — sous-traitée` |
| `team_code` | `text` | non | — | code d'équipe | **Sert à re-vérifier le scope côté serveur** : une ligne hors périmètre ne doit pas sortir | `PRODUCTION` |
| `period_start` / `period_end` | `date` | non | — | — | Période de la ligne | `2026-09-01` / `2026-09-30` |
| `line_value` | `numeric(18,6)` | non | — | — | Valeur de la ligne | `0.912` |
| `line_share` | `numeric(9,6)` | non | — | 0..1 | Part de la ligne dans le total | `0.0214` |
| `computed_at` | `timestamptz` | **oui** | `NULL` | — | Même origine que la valeur (B5) | `2026-09-29T05:00:00Z` |
| `parent_line_key` | `text` | **oui** | `NULL` | profondeur 1..3 (archétype § 4) | Ligne parente : c'est le chemin de retour du drill-down | `NUE-0001` |

### 4.19 Relations

| Entité A | Relation | Entité B | Clé étrangère | Cascade |
|---|---|---|---|---|
| `indicator` | N-1 | `actor` | `owner_actor_id` | `RESTRICT` — on ne supprime pas une personne ayant un indicateur |
| `indicator` | N-1 | `actor` | `designated_signer_actor_id` | `RESTRICT` |
| `definition_version` | N-1 | `indicator` | `indicator_id` | `RESTRICT` |
| `definition_threshold` | 1-1 | `definition_version` | `definition_version_id` | `CASCADE` (la version emporte son seuil) |
| `signature_event` | N-1 | `definition_version` | `definition_version_id` | `RESTRICT` |
| `signature_event` | N-1 | `signature_event` | `revokes_event_id` | `RESTRICT` (append-only) |
| `dashboard` | N-1 | `actor` | `author_actor_id` | `RESTRICT` |
| `dashboard_indicator` | N-1 | `dashboard` | `dashboard_id` | `CASCADE` |
| `dashboard_indicator` | N-1 | `indicator` | `indicator_id` | `RESTRICT` |
| `dashboard_indicator` | N-1 | `definition_version` | `pinned_version_id` | `RESTRICT` (B16) |
| `dashboard_grant` | N-1 | `dashboard` | `dashboard_id` | `CASCADE` |
| `export_job` | 1-1 | `export_artifact` | `export_artifact.export_job_id` | `CASCADE` |
| `export_artifact` | N-1 | `definition_version` | `definition_version_id` | `RESTRICT` (B22) |
| `access_log` | N-1 | `actor` | `actor_id` | `RESTRICT` (le journal survit à la personne) |
| `query_cache` | — | — | — |-table cléComposite, purgée par `expires_at` |
| `session` | N-1 | `actor` | `actor_id` | `CASCADE` |
| `actor_group_member` | N-N | `actor_group` / `actor` | `group_code`, `actor_id` | `CASCADE` / `RESTRICT` |

> **Aucune cascade ne supprime une trace de gouvernance.** `definition_version`,
> `signature_event`, `access_log` et `export_artifact` sont en `RESTRICT` : B1, B22, B10
> et B27 exigent qu'un support de réunion reste rattaché à ce qui l'a produit, même
> quand la version qui suit est signée.

### 4.20 Contraintes transverses

```sql
-- Un indicateur a exactement une version publiée qui porte la valeur affichée (B4).
-- `current_signed_version_id` pointe toujours vers une version `signed`/`published`
-- de CET indicateur : invariant vérifié par un test, pas par une cascade.

-- Un dashboard ne référence que des indicateurs officiels au moment du partage.
-- Vérifié à l'écriture ET à la lecture (E17) : un indicateur qui perd son statut
-- officiel ne déclenche aucun retrait (E17), seulement une perte de caractère officiel.

-- Le `owner_picker` et le `designated_signer` référencent toujours `actor`
-- (jamais un texte libre) : d'où les deux FK et non deux `text`.
-- Et `designated_signer_actor_id <> owner_actor_id` est un CHECK sur `indicator` :
-- l'auteur ne peut pas se désigner lui-même comme signataire.
```

---

## 5. Contrats API

**Conventions transverses, valables pour les 19 endpoints** :

- **Auth** : cookie de session `amberline_session` (HttpOnly, Secure, SameSite=Lax).
  Aucun jeton dans l'URL, aucun jeton dans un corps de requête : B18 est retiré, une
  adresse ne constitue jamais un droit (B9).
- **Version** : préfixe `/api/v1`. La version d'API est dans le chemin, pas dans un
  en-tête.
- **Réponse** : `Content-Type: application/json; charset=utf-8`, `Cache-Control: no-store`
  sur toute réponse portant une valeur, `X-Request-Id` sur toute réponse.
- **Corps d'erreur** : `{ "error_code": …, "message": …, "details": …, "request_id": … }`
  — § 2.5. `message` est **rédigé**, jamais un code HTTP nu.
- **404 vs 403** : `404` quand la ressource n'existe pas *ou* n'est pas visible par
  l'appelant (même réponse dans les deux cas) ; `403` quand le refus est **connu**, avec
  la liste des équipes manquantes. Le refus reste journalisé côté serveur dans les deux cas.
- **Idempotence** : `Idempotency-Key` requis sur `POST /indicators`, `/versions`,
  `/signature`, `/exports`, `/dashboards`.
- **Journaux** : toute lecture de valeur journalise une entrée `access_log`, y compris
  quand la réponse est `403`, `404` ou `empty` (B10).

### 5.1 `GET /api/v1/me` — identité et droits résolus

- **Méthode** : GET · **Path** : `/api/v1/me` · **Auth** : session
- **Rate limit** : 60 req/min par session

**Requête** — aucun paramètre.

**Réponse (succès)** :
```json
{
  "actor_id": "00u2ab90f4",
  "display_name": "Sofia Marchand",
  "is_directory_entry": true,
  "roles": ["manager"],
  "granted_team_codes": ["COMMERCIAL"],
  "session_expires_at": "2026-09-29T15:00:00Z"
}
```

| Code | Condition | Message |
|---|---|---|
| 400 | — | *sans objet : aucune entrée à valider* |
| 401 | Aucun cookie, cookie expiré, ou `session.revoked_at` renseigné | `"Session absente ou expirée. Reconnectez-vous via le fournisseur d'identité."` |
| 403 | Session valide, droits partiels : la réponse 200 ne contient alors que les droits réellement accordés | `"Droits partiels : le périmètre demandé excède vos droits accordés."` |
| 404 | — | *sans objet : la ressource n'est pas nommée* |
| 409 | — | *sans objet* |
| 422 | — | *sans objet* |
| 429 | Dépassement du quota de session | `"Trop de requêtes. Réessayez dans quelques secondes."` |
| 500 | Panne interne | `"Erreur interne. Réessayez ; si le problème persiste, contactez l'administrateur."` |

### 5.2 `GET /api/v1/indicators` — liste lisible par l'appelant

- **Méthode** : GET · **Path** : `/api/v1/indicators` · **Auth** : session
- **Rate limit** : 120 req/min par session (`indicator_read`)

**Requête** — query params :

| Paramètre | Type | Requis | Description |
|---|---|---|---|
| `teams` | `string` (CSV de `teamCodeSchema`) | oui | Équipes demandées, ≤ 50 |
| `from` / `to` | `date` ISO | oui | Période demandée |
| `grain` | `day` \| `week` \| `month` | oui | Granularité |
| `include_provisional` | `boolean` | non | Défaut `true` : les indicateurs non signés sont visibles **de leur seul auteur** (B13) |

**Réponse (succès)** :
```json
{
  "status": "ok",
  "scope": { "teams": ["COMMERCIAL"], "period": { "from": "2026-09-01", "to": "2026-09-30", "grain": "month" }, "segment": {} },
  "items": [
    { "slug": "ca-par-client", "label": "CA par client", "officiality": "official",
      "value": 1184320.55, "unit": "EUR",
      "target": { "value": 1250000, "delta": -65679.45, "confirmed": true },
      "computed_at": "2026-09-29T05:00:00Z", "source_ref": "marts_sales_v42",
      "version_label": "v3" }
  ],
  "excluded": []
}
```

| Code | Condition | Message |
|---|---|---|
| 400 | `grain` absent ou période incohérente (`from > to`) | `"Période ou granularité incohérente : `from` doit précéder `to`."` |
| 401 | Session absente ou expirée | `"Session absente ou expirée. Reconnectez-vous via le fournisseur d'identité."` |
| 403 | Aucune équipe demandée n'est accordée | `"Aucune des équipes demandées ne vous est accessible : demandez un accès à un responsable."` |
| 404 | — | *sans objet : la liste n'est pas une ressource nommée* |
| 409 | — | *sans objet* |
| 422 | `teams` vide, > 50 valeurs, ou code d'équipe inconnu du référentiel | `"Liste d'équipes invalide : 1 à 50 codes connus du référentiel sont attendus."` |
| 429 | Quota `indicator_read` dépassé | `"Trop de consultations. Réessayez dans un instant."` |
| 500 | Panne interne | `"Erreur interne. Réessayez ; si le problème persiste, contactez l'administrateur."` |
| 503 | Entrepôt injoignable : la dernière valeur connue est renvoyée avec `computed_at` de la source | `"Source indisponible. Les dernières valeurs connues restent affichées, datées."` |

> `status` vaut `ok`, `empty` ou `error` — jamais `[]` pour une panne
> (`archetypes.md` § 9). `excluded` porte les slugs retirés du périmètre de la liste,
> et chaque exclusion est journalisée (B25).

### 5.3 `GET /api/v1/indicators/:slug` — valeur officielle

- **Méthode** : GET · **Path** : `/api/v1/indicators/:slug` · **Auth** : session
- **Rate limit** : 120 req/min par session (`indicator_read`)

**Requête** — path param `slug` ; query params identiques à § 5.2, plus :

| Paramètre | Type | Requis | Description |
|---|---|---|---|
| `version` | `uuid` | non | Force une version précise ; sinon la version signée courante (B4) |

**Réponse (succès)** — l'union de § 2.2, sérialisée :
```json
{
  "status": "value",
  "slug": "ca-par-client",
  "officiality": "official",
  "definition": { "version_id": "9b2e…", "version_label": "v3", "author": "Camille Roux",
                  "signed_at": "2026-09-26T08:12:44Z", "signer": "Marc Delaunay" },
  "value": 1184320.55, "unit": "EUR",
  "target": { "value": 1250000, "delta": -65679.45, "confirmed": true },
  "semantic_state": "in_target",
  "computed_at": "2026-09-29T05:00:00Z",
  "source_ref": "marts_sales_v42",
  "resolved_scope": { "teams": ["COMMERCIAL"], "period": { "from": "2026-09-01", "to": "2026-09-30", "grain": "month" }, "segment": {} }
}
```

| Code | Condition | Message |
|---|---|---|
| 400 | Période incohérente | `"Période incohérente : `from` doit précéder `to`."` |
| 401 | Session absente ou expirée | `"Session absente ou expirée. Reconnectez-vous via le fournisseur d'identité."` |
| 403 | Indicateur connu mais hors périmètre : refus **connu** | `"Vous n'avez pas accès à l'équipe {missing}. Demandez l'accès à un responsable."` |
| 404 | Slug inexistant **ou** indicateur non officiel d'un tiers (B13 : invisible pour les autres) | `"Indicateur introuvable."` |
| 409 | Propriétaire inactif : l'indicateur perd son statut officiel (B17) | `"Le propriétaire de cet indicateur est inactif : le chiffre n'est plus officiel tant qu'un propriétaire n'est pas nommé."` |
| 422 | `version` inconnu pour cet indicateur, ou `teams` invalide | `"Version inconnue pour cet indicateur."` |
| 429 | Quota dépassé | `"Trop de consultations. Réessayez dans un instant."` |
| 500 | Panne interne | `"Erreur interne. Réessayez ; si le problème persiste, contactez l'administrateur."` |
| 503 | Entrepôt injoignable (E1) — `status: source_unavailable`, `last_known` renseigné si le cache a la valeur | `"Source indisponible. Dernière valeur connue affichée avec sa date de calcul."` |
| 504 | Dépassement du délai de 30 s sans réponse (E11) — `status: too_slow` | `"Calcul trop long. Dernière valeur connue affichée avec sa date de calcul."` |

> `computed_at: null` → l'interface affiche « fraîcheur inconnue » (B6). Le champ
> n'est **jamais** remplacé par l'heure de la requête.

### 5.4 `POST /api/v1/indicators` — déclarer un indicateur (US-1, US-11)

- **Méthode** : POST · **Path** : `/api/v1/indicators` · **Auth** : session + rôle `controleur`
- **Rate limit** : 30 req/min par session · **Idempotence** : `Idempotency-Key` requise

**Requête** (body) :
```json
{
  "slug": "ca-par-client",
  "label": "CA par client",
  "warehouse_key": "sales.customer_revenue",
  "owner_actor_id": "00u91ab77c",
  "designated_signer_actor_id": "00u77cd1fe",
  "formula": "sum(sales.net_amount)",
  "scope_expr": "region = 'FR'",
  "grain": "month",
  "unit": "EUR",
  "target_value": 1250000,
  "target_unit": "EUR",
  "change_note": " première version de la définition",
  "threshold": { "comparison": "below", "threshold_value": 0.95, "label": "Taux de service hors cible" }
}
```

| Paramètre | Type | Requis | Description |
|---|---|---|---|
| `slug` | `slugSchema` | oui | Identifiant d'URL, 3..64 car. |
| `label` | `string` | oui | 1..120 car. |
| `warehouse_key` | `string` | oui | Clé de l'indicateur dans l'entrepôt (C1) |
| `owner_actor_id` | `actorId` | oui | **Personne nommée** de l'annuaire (B3) |
| `designated_signer_actor_id` | `actorId` | oui | ≠ `owner_actor_id` (B2) |
| `formula` / `scope_expr` | `string` | oui | 1..2000 car. ; `scope_expr` est **une restriction**, jamais un élargissement |
| `grain` / `unit` | enum / `string` | oui | — |
| `target_value` / `target_unit` | `number` / `string` | non | Cible versionnée avec la version (B14) |
| `change_note` | `string` | oui | 1..500 car., en langue métier |
| `threshold` | objet | non | Rejeté si la version n'est pas signable : le seuil se signe avec elle (B11) |

| Code | Condition | Message |
|---|---|---|
| 400 | Corps illisible ou `Content-Type` absent | `"Corps de requête illisible : JSON attendu."` |
| 401 | Session absente ou expirée | `"Session absente ou expirée. Reconnectez-vous via le fournisseur d'identité."` |
| 403 | Rôle `controleur` absent | `"Seul un contrôleur de gestion peut déclarer un indicateur."` |
| 404 | `owner_actor_id` ou `designated_signer_actor_id` absent de l'annuaire | `"Personne introuvable dans l'annuaire."` |
| 409 | `slug` déjà pris | `"Un indicateur porte déjà ce nom. Choisissez un autre identifiant."` |
| 409 | `designated_signer_actor_id` = `owner_actor_id` | `"Le signataire désigné doit être distinct de l'auteur : l'auto-signature est interdite."` |
| 409 | Propriétaire `is_directory_entry = false` | `"Le propriétaire doit être une personne nommée de l'annuaire, pas un rôle collectif."` |
| 422 | Échec de `indicatorDefinitionSchema` : la liste des chemins fautifs est renvoyée dans `details` | `"Définition invalide. Corrigez les champs signalés."` |
| 429 | Quota dépassé | `"Trop de déclarations. Réessayez dans un instant."` |
| 500 | Panne interne | `"Erreur interne. Votre définition n'a pas été enregistrée ; réessayez."` |
| 503 | Entrepôt injoignable au moment de valider `warehouse_key` | `"Source indisponible : la clé d'indicateur n'a pas pu être vérifiée."` |

### 5.5 `POST /api/v1/indicators/:slug/versions` — nouvelle version (B1)

- **Méthode** : POST · **Path** : `/api/v1/indicators/:slug/versions` · **Auth** : session + rôle `controleur`
- **Rate limit** : 30 req/min par session · **Idempotence** : `Idempotency-Key` requise

**Requête** — path param `slug` ; body : même forme que § 5.4 **sans** `slug`,
`warehouse_key`, `owner_actor_id`, `designated_signer_actor_id` (ils sont inherited de
l'indicateur), plus :

| Paramètre | Type | Requis | Description |
|---|---|---|---|
| `based_on_version_id` | `uuid` | oui | Version sur laquelle cette version se fonde (B1) |
| `expected_version_no` | `integer` | oui | Contrôle de concurrence (B1) |

**Réponse (succès)** :
```json
{ "status": "created", "definition_version_id": "9b2e…", "version_no": 4, "status": "draft",
  "created_at": "2026-09-30T08:00:00Z" }
```

| Code | Condition | Message |
|---|---|---|
| 400 | Corps illisible | `"Corps de requête illisible : JSON attendu."` |
| 401 | Session absente ou expirée | `"Session absente ou expirée. Reconnectez-vous via le fournisseur d'identité."` |
| 403 | Rôle `controleur` absent, ou l'appelant n'est ni auteur ni propriétaire | `"Seul le propriétaire ou un contrôleur de gestion peut créer une version."` |
| 404 | Slug inconnu ou invisible | `"Indicateur introuvable."` |
| 409 | Une version portant ce `version_no` existe déjà | `"Une version a été créée entre-temps. Rechargez la définition."` |
| 409 | Tentative de modification d'une version `published` | `"Une version publiée ne se modifie pas : créez une nouvelle version."` |
| 422 | `based_on_version_id` inconnue, ou champs invalides | `"Définition invalide. Corrigez les champs signalés."` |
| 429 | Quota dépassé | `"Trop de déclarations. Réessayez dans un instant."` |
| 500 | Panne interne | `"Erreur interne. La version n'a pas été créée ; réessayez."` |

> La version précédente reste consultable intacte : aucune clause `UPDATE` ne porte sur
> une version signée ou publiée (ADR-8, B22).

### 5.6 `GET /api/v1/indicators/:slug/history` — historique signé (US-17)

- **Méthode** : GET · **Path** : `/api/v1/indicators/:slug/history` · **Auth** : session
- **Rate limit** : 60 req/min par session

**Requête** — path param `slug` ; query params `teams`, `from`, `to`, `grain`
(same shape que § 5.2).

**Réponse (succès)** :
```json
{
  "status": "ok",
  "versions": [
    { "version_label": "v3", "version_id": "9b2e…", "signed_at": "2026-09-26T08:12:44Z",
      "signer": "Marc Delaunay", "value": 1184320.55, "unit": "EUR",
      "computed_at": "2026-09-29T05:00:00Z", "source_ref": "marts_sales_v42",
      "change_note": "les lignes sous-traitées ne sont plus comptées" },
    { "version_label": "v2", "version_id": "7c11…", "signed_at": "2026-08-14T09:02:00Z",
      "signer": "Marc Delaunay", "value": 1204510.00, "unit": "EUR",
      "computed_at": "2026-09-29T05:00:00Z", "source_ref": "marts_sales_v42",
      "change_note": "périmètre élargi à l'Europe" }
  ],
  "diff": { "from": "v2", "to": "v3", "delta": -20189.45, "delta_pct": -1.68,
            "explanation": "les lignes sous-traitées ne sont plus comptées" }
}
```

| Code | Condition | Message |
|---|---|---|
| 400 | Période incohérente | `"Période incohérente : `from` doit précéder `to`."` |
| 401 | Session absente ou expirée | `"Session absente ou expirée. Reconnectez-vous via le fournisseur d'identité."` |
| 403 | Lecteur autorisé sur la valeur courante mais pas sur l'historique demandé | `"L'historique demandé excède votre périmètre."` |
| 404 | Slug inconnu ou non signé | `"Historique introuvable."` |
| 409 | Propriétaire inactif (B17) | `"Le propriétaire est inactif : l'historique reste consultable, l'indicateur n'est plus officiel."` |
| 422 | `teams` invalide | `"Liste d'équipes invalide : 1 à 50 codes connus du référentiel sont attendus."` |
| 429 | Quota dépassé | `"Trop de consultations. Réessayez dans un instant."` |
| 500 | Panne interne | `"Erreur interne. Réessayez ; si le problème persiste, contactez l'administrateur."` |
| 503 | Entrepôt injoignable | `"Source indisponible. L'historique des signatures reste affiché ; les valeurs ne sont pas rafraîchies."` |
| 504 | Calcul trop long | `"Calcul trop long sur l'historique. Réessayez sur une période plus courte."` |

> Chaque ligne porte **sa** date de calcul issue de la source (B5). Un historique qui
> affiche un nombre sans sa date est pire que pas d'historique. La consultation est
> journalisée comme une consultation (B24), jamais comme une administration.
> Si la valeur n'a pas bougé alors que la définition ou le périmètre ont bougé, la
> réponse porte `diff.unchanged_reason` (E19).

### 5.7 `GET /api/v1/indicators/:slug/decomposition` — drill-down (US-5)

- **Méthode** : GET · **Path** : `/api/v1/indicators/:slug/decomposition` · **Auth** : session
- **Rate limit** : 20 req/min par session (`decomposition`)

**Requête** — path param `slug` ; query params :

| Paramètre | Type | Requis | Description |
|---|---|---|---|
| `teams`, `from`, `to`, `grain` | idem § 5.2 | oui | **Le même scope que l'écran d'origine** (B15) |
| `depth` | `1` \| `2` \| `3` | non | Défaut `1` ; au-delà, `path` renvoie le chemin parcouru |
| `parent` | `string` | non | Clé de la ligne parente (navigation de retour) |
| `sort` | `contribution_desc` \| `label_asc` | non | Défaut `contribution_desc` |
| `limit` / `cursor` | `integer` / `string` | non | 1..500 ; pagination par curseur |

**Réponse (succès)** :
```json
{
  "status": "lines",
  "computed_at": "2026-09-29T05:00:00Z",
  "source_ref": "marts_sales_v42",
  "path": [{ "key": "NUE-0001", "label": "Nuance" }, { "key": "LIG-0004821", "label": "Ligne 4821" }],
  "lines": [ { "key": "LIG-0004821", "label": "Ligne 4821 — sous-traitée", "value": 0.912, "share": 0.0214, "team_code": "PRODUCTION" } ],
  "total_shown": 1, "total_available": 1
}
```

| Code | Condition | Message |
|---|---|---|
| 400 | `depth` hors 1..3, `limit` hors 1..500 | `"Paramètres de décomposition invalides : profondeur 1 à 3, 1 à 500 lignes."` |
| 401 | Session absente ou expirée | `"Session absente ou expirée. Reconnectez-vous via le fournisseur d'identité."` |
| 403 | Ligne parente hors périmètre (E10) | `"Cette ligne n'appartient pas à votre périmètre."` |
| 404 | Slug inconnu ou ligne parente inexistante | `"Décomposition introuvable."` |
| 409 | Propriétaire inactif | `"Le propriétaire est inactif : la décomposition reste consultable, l'indicateur n'est plus officiel."` |
| 422 | `parent` mal formé, ou `teams` invalide | `"Paramètres de décomposition invalides."` |
| 429 | Quota `decomposition` dépassé | `"Trop de décompositions. Réessayez dans un instant."` |
| 500 | Panne interne | `"Erreur interne. Réessayez ; si le problème persiste, contactez l'administrateur."` |
| 503 | Entrepôt injoignable (E1) | `"Source indisponible. Les dernières lignes connues restent affichées, datées."` |
| 504 | Délai dépassé (E11) | `"Décomposition trop longue. Réessayez sur une période plus courte."` |

> `total_shown` et `total_available` sont égaux par construction : le scope étant
> injecté dans la requête, il n'existe pas de total qui compterait plus de lignes que
> le lecteur n'a le droit d'en voir. Le total affiché reste cohérent avec ce qui est
> visible (E10).

### 5.8 `POST /api/v1/definitions/:versionId/signature` — signer, refuser (US-2)

- **Méthode** : POST · **Path** : `/api/v1/definitions/:versionId/signature` · **Auth** : session
- **Rate limit** : 20 req/min par session · **Idempotence** : `Idempotency-Key` requise

**Requête** — path param `versionId` (`uuid`) ; body :

| Paramètre | Type | Requis | Description |
|---|---|---|---|
| `act` | `sign` \| `refuse` | oui | Nature de l'acte |
| `reason` | `string` | si `act = refuse` | 1..500 car. — obligatoire, sinon `422` |

**Réponse (succès)** :
```json
{ "signature_event_id": "4a11…", "act": "sign", "definition_version_id": "9b2e…",
  "signed_at": "2026-09-26T08:12:44Z", "officiality": "official", "state": "locked" }
```

| Code | Condition | Message |
|---|---|---|
| 400 | Corps illisible | `"Corps de requête illisible : JSON attendu."` |
| 401 | Session absente ou expirée | `"Session absente ou expirée. Reconnectez-vous via le fournisseur d'identité."` |
| 403 | L'appelant n'est pas le signataire désigné | `"Seul le signataire désigné peut signer cette version."` |
| 404 | `versionId` inconnu ou invisible | `"Version de définition introuvable."` |
| 409 | L'appelant est l'auteur de la version (B2) | `"Vous êtes l'auteur de cette version : l'auto-signature est interdite (règle B2). La version revient en projet."` |
| 409 | La version porte déjà une signature active de cet acteur | `"Cette version est déjà signée par vous."` |
| 409 | La version n'est pas en `in_review` (signée, refusée ou révoquée) | `"Cette version n'est pas en attente de signature."` |
| 409 | Propriétaire inactif : la version ne peut plus être signée (B17) | `"Le propriétaire est inactif : nommez un propriétaire avant toute nouvelle signature."` |
| 422 | `act` absent, `reason` manquant sur un refus, ou identifiant mal formé | `"Acte invalide : `reason` est obligatoire pour un refus."` |
| 429 | Quota dépassé | `"Trop de tentatives de signature. Réessayez dans un instant."` |
| 500 | Panne interne | `"Erreur interne. L'acte n'a pas été enregistré ; réessayez."` |

> Le refus d'auto-signature est renvoyé en `409 SIGNER_IS_AUTHOR` avec un message
> explicite : l'action n'est pas seulement désactivée dans l'interface, elle est
> refusée et **expliquée** (US-2).

### 5.9 `POST /api/v1/definitions/:versionId/signature/revocation` — révocation (B26)

- **Méthode** : POST · **Path** : `/api/v1/definitions/:versionId/signature/revocation` · **Auth** : session
- **Rate limit** : 20 req/min par session · **Idempotence** : `Idempotency-Key` requise

**Requête** — path param `versionId` ; body `{ "reason": "périmètre à préciser" }`.

**Réponse (succès)** :
```json
{ "signature_event_id": "4a20…", "act": "revoke", "revokes_event_id": "4a11…",
  "occurred_at": "2026-09-27T09:00:00Z", "state": "revocable" }
```

| Code | Condition | Message |
|---|---|---|
| 400 | Corps illisible | `"Corps de requête illisible : JSON attendu."` |
| 401 | Session absente ou expirée | `"Session absente ou expirée. Reconnectez-vous via le fournisseur d'identité."` |
| 403 | L'appelant n'est ni l'auteur ni le propriétaire | `"Seul l'auteur de la version peut demander la révocation de sa signature."` |
| 404 | `versionId` inconnu ou invisible | `"Version de définition introuvable."` |
| 409 | La version est déjà publiée : la signature ne se reprend plus | `"Cette version est publiée : sa signature n'est plus révocable. Créez une nouvelle version puis faites-la signer."` |
| 409 | Aucune signature active à révoquer | `"Cette version n'a pas de signature active."` |
| 422 | `reason` absent ou trop long | `"Motif de révocation obligatoire (1 à 500 caractères)."` |
| 429 | Quota dépassé | `"Trop de tentatives. Réessayez dans un instant."` |
| 500 | Panne interne | `"Erreur interne. La révocation n'a pas été enregistrée ; réessayez."` |

### 5.10 `GET /api/v1/dashboards` — tableaux de bord accessibles

- **Méthode** : GET · **Path** : `/api/v1/dashboards` · **Auth** : session
- **Rate limit** : 60 req/min par session

**Requête** — aucun paramètre.

**Réponse (succès)** :
```json
{ "status": "ok", "items": [ { "slug": "ca-mensuel-commercial", "label": "Comité mensuel — commercial", "is_official": true, "indicator_count": 6, "granted_via": "group:COMMERCIAL" } ] }
```

| Code | Condition | Message |
|---|---|---|
| 400 | — | *sans objet* |
| 401 | Session absente ou expirée | `"Session absente ou expirée. Reconnectez-vous via le fournisseur d'identité."` |
| 403 | — | *sans objet : un tableau non partagé n'est pas listé, il n'est pas « refusé »* |
| 404 | — | *sans objet* |
| 409 | — | *sans objet* |
| 422 | — | *sans objet* |
| 429 | Quota dépassé | `"Trop de requêtes. Réessayez dans un instant."` |
| 500 | Panne interne | `"Erreur interne. Réessayez ; si le problème persiste, contactez l'administrateur."` |

### 5.11 `GET /api/v1/dashboards/:slug` — tableau de bord partagé (US-6)

- **Méthode** : GET · **Path** : `/api/v1/dashboards/:slug` · **Auth** : session **+ partage existant**
- **Rate limit** : 120 req/min par session (`indicator_read`)

**Requête** — path param `slug` ; query params `teams`, `from`, `to`, `grain`.

**Réponse (succès)** :
```json
{
  "status": "ok",
  "dashboard": { "slug": "ca-mensuel-commercial", "label": "Comité mensuel — commercial", "is_official": true, "version": 3 },
  "scope": { "teams": ["COMMERCIAL"], "period": { "from": "2026-09-01", "to": "2026-09-30", "grain": "month" }, "segment": {} },
  "tiles": [
    { "position": 0, "slug": "ca-par-client", "version_label": "v3", "officiality": "official",
      "state": "value", "value": 1184320.55, "unit": "EUR",
      "target": { "value": 1250000, "delta": -65679.45, "confirmed": true },
      "semantic_state": "in_target",
      "computed_at": "2026-09-29T05:00:00Z", "source_ref": "marts_sales_v42" }
  ],
  "excluded": [ { "slug": "ca-marge-brute", "reason": "SCOPE_DENIED", "missing_team_codes": ["FINANCE"] } ],
  "computed_at": "2026-09-29T05:00:00Z"
}
```

| Code | Condition | Message |
|---|---|---|
| 400 | Période incohérente | `"Période incohérente : `from` doit précéder `to`."` |
| 401 | Session absente ou expirée | `"Session absente ou expirée. Reconnectez-vous via le fournisseur d'identité."` |
| 403 | L'appelant figure dans la liste de partage mais son périmètre est vide après application du scope | `"Aucune des équipes demandées ne vous est accessible sur ce tableau."` |
| 404 | Slug inexistant **ou** tableau non partagé avec l'appelant (même réponse) | `"Tableau de bord introuvable."` |
| 409 | Au moins un indicateur a perdu son statut officiel (B17, E17) — le tableau reste consultable | `"Ce tableau n'est plus officiel : un de ses indicateurs n'a plus de propriétaire actif."` |
| 422 | `teams` invalide | `"Liste d'équipes invalide : 1 à 50 codes connus du référentiel sont attendus."` |
| 429 | Quota dépassé | `"Trop de consultations. Réessayez dans un instant."` |
| 500 | Panne interne | `"Erreur interne. Réessayez ; si le problème persiste, contactez l'administrateur."` |
| 503 | Entrepôt injoignable (E1) — la dernière date de calcul connue est conservée | `"Source indisponible. Les dernières valeurs connues restent affichées, datées."` |
| 504 | Délai dépassé (E11) | `"Calcul trop long. Dernières valeurs connues affichées, datées."` |

> **E5** : un indicateur interdit n'apparaît pas dans `tiles`, la **liste des
> indicateurs reste complète** via `excluded`, et chaque exclusion est journalisée avec
> l'identité et la ressource visée. Le design system est cohérent : la tuile
> `permission_denied` **n'est pas rendue** (pas de placeholder « accès refusé »).

### 5.12 `POST /api/v1/dashboards` — composer un tableau de bord

- **Méthode** : POST · **Path** : `/api/v1/dashboards` · **Auth** : session + rôle `controleur`
- **Rate limit** : 20 req/min par session · **Idempotence** : `Idempotency-Key` requise

**Requête** (body) :
```json
{
  "slug": "ca-mensuel-commercial",
  "label": "Comité mensuel — commercial",
  "scope_expr_version_id": "9b2e…",
  "indicators": [ { "indicator_id": "3f1c…", "pinned_version_id": "9b2e…", "tile_size": "md" } ]
}
```

| Paramètre | Type | Requis | Description |
|---|---|---|---|
| `slug` | `slugSchema` | oui | 3..64 car. |
| `label` | `string` | oui | 1..120 car. |
| `scope_expr_version_id` | `uuid` | oui | Version dont hérite le périmètre de lecture |
| `indicators` | tableau, 1..24 | oui | **Assemblage fixe** : l'ordre du tableau est l'ordre d'affichage ; `tile_size` ∈ `sm`/`md`/`lg` (ADR-4) |

| Code | Condition | Message |
|---|---|---|
| 400 | Corps illisible | `"Corps de requête illisible : JSON attendu."` |
| 401 | Session absente ou expirée | `"Session absente ou expirée. Reconnectez-vous via le fournisseur d'identité."` |
| 403 | Rôle `controleur` absent | `"Seul un contrôleur de gestion peut composer un tableau de bord."` |
| 404 | `indicator_id` ou `pinned_version_id` inconnu | `"Indicateur ou version introuvable."` |
| 409 | `slug` déjà pris | `"Un tableau de bord porte déjà ce nom."` |
| 409 | Un indicateur du tableau n'est pas officiel (B13) | `"Un indicateur non officiel ne peut pas entrer dans un tableau de bord officiel."` |
| 422 | Plus de 24 indicateurs, `tile_size` invalide, ou tableau vide | `"Tableau invalide : 1 à 24 indicateurs, tailles `sm`, `md` ou `lg`."` |
| 429 | Quota dépassé | `"Trop de créations. Réessayez dans un instant."` |
| 500 | Panne interne | `"Erreur interne. Le tableau n'a pas été créé ; réessayez."` |

### 5.13 `POST /api/v1/dashboards/:slug/grants` — partager (B9)

- **Méthode** : POST · **Path** : `/api/v1/dashboards/:slug/grants` · **Auth** : session + rôle `controleur`
- **Rate limit** : 20 req/min par session · **Idempotence** : `Idempotency-Key` requise

**Requête** (body) :
```json
{ "grantee_kind": "group", "grantee_id": "COMMERCIAL", "expires_at": null }
```

| Paramètre | Type | Requis | Description |
|---|---|---|---|
| `grantee_kind` | `actor` \| `group` | oui | Personne nommée ou groupe de l'annuaire (B9) |
| `grantee_id` | `actorId` \| `groupCode` | oui | Jamais une adresse, jamais un lien |
| `expires_at` | `timestamptz` | non | `NULL` = sans terme |

| Code | Condition | Message |
|---|---|---|
| 400 | Corps illisible | `"Corps de requête illisible : JSON attendu."` |
| 401 | Session absente ou expirée | `"Session absente ou expirée. Reconnectez-vous via le fournisseur d'identité."` |
| 403 | Rôle `controleur` absent | `"Seul un contrôleur de gestion peut partager un tableau de bord."` |
| 404 | Slug, groupe ou acteur inconnu | `"Tableau de bord, groupe ou personne introuvable."` |
| 409 | Partage déjà existant | `"Ce partage existe déjà."` |
| 422 | `expires_at` antérieur à maintenant, ou beneficiary d'un type invalide | `"Partage invalide : une date de fin doit être future."` |
| 429 | Quota dépassé | `"Trop de partages. Réessayez dans un instant."` |
| 500 | Panne interne | `"Erreur interne. Le partage n'a pas été enregistré ; réessayez."` |

> **Aucun paramètre de lien public n'existe dans ce contrat.** B18 est retiré : il n'y
> a pas de `token`, pas de `public: true`, et l'adresse du tableau restitue un état,
> jamais un droit (B9).

### 5.14 `DELETE /api/v1/dashboards/:slug/grants/:grantId` — retirer un partage

- **Méthode** : DELETE · **Path** : `/api/v1/dashboards/:slug/grants/:grantId` · **Auth** : session + rôle `controleur`
- **Rate limit** : 20 req/min par session · **Idempotence** : naturally idempotent

**Requête** — path params `slug`, `grantId` (`uuid`).

**Réponse (succès)** : `204 No Content`.

| Code | Condition | Message |
|---|---|---|
| 400 | — | *sans objet* |
| 401 | Session absente ou expirée | `"Session absente ou expirée. Reconnectez-vous via le fournisseur d'identité."` |
| 403 | Rôle `controleur` absent, ou l'appelant n'a pas composé le tableau | `"Seul l'auteur du tableau de bord peut retirer un partage."` |
| 404 | Slug ou `grantId` inconnu | `"Partage introuvable."` |
| 409 | — | *sans objet* |
| 422 | `grantId` mal formé | `"Identifiant de partage invalide."` |
| 429 | Quota dépassé | `"Trop de requêtes. Réessayez dans un instant."` |
| 500 | Panne interne | `"Erreur interne. Réessayez ; si le problème persiste, contactez l'administrateur."` |

### 5.15 `POST /api/v1/exports` — demander un export (US-9)

- **Méthode** : POST · **Path** : `/api/v1/exports` · **Auth** : session
- **Rate limit** : 5 req/min par acteur (`export_create`) · **Idempotence** : `Idempotency-Key` requise

**Requête** (body) :
```json
{
  "source_kind": "dashboard",
  "source_id": "5c0e…",
  "format": "pdf",
  "scope": { "teams": ["COMMERCIAL"], "period": { "from": "2026-09-01", "to": "2026-09-30", "grain": "month" }, "segment": {} }
}
```

| Paramètre | Type | Requis | Description |
|---|---|---|---|
| `source_kind` | `dashboard` \| `indicator` \| `history` | oui | Ressource exportée |
| `source_id` | `uuid` | oui | Ressource |
| `format` | `pdf` \| `csv` | oui | — |
| `scope` | `scopeSchema` | oui | **Doit être identique** au scope de l'écran d'origine ; il ne peut pas l'élargir (B8) |

**Réponse (succès)** — `202 Accepted` : le job démarre en tâche de fond.
```json
{ "export_job_id": "e14b…", "state": "queued", "format": "pdf", "requested_at": "2026-09-29T07:41:00Z" }
```

| Code | Condition | Message |
|---|---|---|
| 400 | Corps illisible | `"Corps de requête illisible : JSON attendu."` |
| 401 | Session absente ou expirée | `"Session absente ou expirée. Reconnectez-vous via le fournisseur d'identité."` |
| 403 | Ressource non partagée / hors périmètre | `"Cette ressource n'est pas accessible pour un export."` |
| 403 | Le `scope` demandé **élargit** le périmètre de l'écran d'origine (E6) | `"Export refusé : le périmètre demandé dépasse celui de l'écran. Périmètre autorisé : équipes {…}, période {…}."` |
| 404 | Ressource inexistante ou invisible | `"Ressource à exporter introuvable."` |
| 409 | Un export identique (`Idempotency-Key`) est déjà en file | `"Un export identique est déjà en cours."` |
| 422 | `scope` invalide, `format` inconnu, ou `source_kind`/`source_id` incohérents | `"Demande d'export invalide : vérifiez le périmètre, la période et le format."` |
| 429 | Quota `export_create` dépassé | `"Trop d'exports demandés. Réessayez dans quelques minutes."` |
| 500 | Panne interne | `"Erreur interne. L'export n'a pas été mis en file ; réessayez."` |

> E6 : le refus d'élargissement **nomme le périmètre qui serait autorisé** et la
> commande pour le demander explicitement. E13 : un échec ne produit aucun fichier
> partiel — `state: failed` avec `error_code`, sans `export_artifact`.

### 5.16 `GET /api/v1/exports/:exportId` — état d'un export

- **Méthode** : GET · **Path** : `/api/v1/exports/:exportId` · **Auth** : session + auteur du job
- **Rate limit** : 60 req/min par session

**Requête** — path param `exportId` (`uuid`).

**Réponse (succès)** :
```json
{ "export_job_id": "e14b…", "state": "ready", "format": "pdf", "progress": 1,
  "artifact": { "byte_size": 184320, "row_count": null, "created_at": "2026-09-29T07:42:30Z", "expires_at": "2026-10-06T07:42:30Z" },
  "provenance": { "definition_version_id": "9b2e…", "definition_signed_at": "2026-09-26T08:12:44Z",
                  "computed_at": "2026-09-29T05:00:00Z", "source_ref": "marts_sales_v42",
                  "exported_by": "Sofia Marchand", "exported_at": "2026-09-29T07:41:00Z" } }
```

| Code | Condition | Message |
|---|---|---|
| 400 | — | *sans objet* |
| 401 | Session absente ou expirée | `"Session absente ou expirée. Reconnectez-vous via le fournisseur d'identité."` |
| 403 | Le job appartient à un autre acteur | `"Cet export ne vous appartient pas."` |
| 404 | `exportId` inconnu | `"Export introuvable."` |
| 409 | — | *sans objet* |
| 422 | `exportId` mal formé | `"Identifiant d'export invalide."` |
| 429 | Quota dépassé | `"Trop de requêtes. Réessayez dans un instant."` |
| 500 | Panne interne | `"Erreur interne. Réessayez ; si le problème persiste, contactez l'administrateur."` |

> `state: failed` est une réponse `200` avec `error_code` renseigné : un échec est un
> état du job, pas une panne HTTP. E13 : `artifact` est alors `null` — jamais un
> fichier partiel proposé.

### 5.17 `GET /api/v1/exports/:exportId/artifact` — télécharger le support

- **Méthode** : GET · **Path** : `/api/v1/exports/:exportId/artifact` · **Auth** : session + auteur du job
- **Rate limit** : 20 req/min par session

**Requête** — path param `exportId`.

**Réponse (succès)** : `200` · `Content-Type: application/pdf` ou `text/csv` ·
`Content-Disposition: attachment; filename="ca-mensuel-commercial-2026-09-29.pdf"`.
Le corps porte l'en-tête de provenance en tête de document (PDF) ou en ligne de
commentaire (CSV) : version, date de signature, date de calcul, source, auteur, date
d'export (B27).

| Code | Condition | Message |
|---|---|---|
| 400 | — | *sans objet* |
| 401 | Session absente ou expirée | `"Session absente ou expirée. Reconnectez-vous via le fournisseur d'identité."` |
| 403 | Le job appartient à un autre acteur | `"Cet export ne vous appartient pas."` |
| 404 | `exportId` inconnu, job non `ready`, ou artefact expiré | `"Fichier indisponible : l'export n'est pas prêt ou a expiré."` |
| 409 | — | *sans objet* |
| 422 | `exportId` mal formé | `"Identifiant d'export invalide."` |
| 429 | Quota dépassé | `"Trop de téléchargements. Réessayez dans un instant."` |
| 500 | Panne interne | `"Erreur interne. Réessayez ; si le problème persiste, contactez l'administrateur."` |
| 503 | Le stockage objet est momentanément indisponible | `"Stockage temporairement indisponible. Réessayez dans un instant."` |

> Le fichier reste rattaché à la version qui l'a produit, **même après une signature
> plus récente** (B22, B27) : `export_artifact.definition_version_id` est figé et le
> support le porte.

### 5.18 `GET /api/v1/access-log` — journal filtré (US-8, B25)

- **Méthode** : GET · **Path** : `/api/v1/access-log` · **Auth** : session + habilitation `auditeur` (personne nommée, B23)
- **Rate limit** : 30 req/min par session (`journal_read`)

**Requête** — query params :

| Paramètre | Type | Requis | Description |
|---|---|---|---|
| `from` / `to` | `date` ISO | oui | Fenêtre, ≤ 31 jours |
| `actor_id` | `actorId` | non | Filtre sur l'identité consultée |
| `resource_kind` | enum | non | Nature de ressource |
| `resource_slug` | `slug` | non | Ressource précise |
| `outcome` | `granted` \| `refused` \| `not_found` \| `error` | non | Issue |
| `limit` / `cursor` | `integer` 1..200 / `string` | non | Pagination par curseur |

**Réponse (succès)** :
```json
{ "status": "ok", "entries": [ { "occurred_at": "2026-09-29T07:41:02Z", "actor_id": "00u2ab90f4",
    "actor_name": "Sofia Marchand", "resource_kind": "indicator", "resource_slug": "ca-par-client",
    "scope_teams": ["COMMERCIAL"], "scope_period": "2026-09-01..2026-09-30",
    "outcome": "refused", "error_code": "SCOPE_DENIED", "request_id": "req_01J8Z…" } ],
  "next_cursor": "cur_9f2", "total_visible": 1284, "redacted_count": 37 }
```

| Code | Condition | Message |
|---|---|---|
| 400 | Fenêtre incohérente ou > 31 jours | `"Fenêtre invalide : 1 à 31 jours, `from` avant `to`."` |
| 401 | Session absente ou expirée | `"Session absente ou expirée. Reconnectez-vous via le fournisseur d'identité."` |
| 403 | L'appelant n'est pas habilité (B23) | `"Seules les personnes habilitées peuvent consulter le journal des accès."` |
| 404 | — | *sans objet : le journal est global, filtré, pas nommé* |
| 409 | — | *sans objet* |
| 422 | `outcome` inconnu, `limit` hors 1..200 | `"Filtre invalide : limite 1 à 200, issue attendue."` |
| 429 | Quota `journal_read` dépassé | `"Trop de consultations du journal. Réessayez dans un instant."` |
| 500 | Panne interne | `"Erreur interne. Réessayez ; si le problème persiste, contactez l'administrateur."` |

> **`redacted_count` n'est pas décoratif** : il dit combien d'entrées existent mais ne
> sont pas visibles pour ce lecteur. C'est B25 rendu observable, plutôt qu'un journal
> silencieusement amputé que l'utilisateur prendrait pour un journal complet. Le refus
> journalise la ressource visée, jamais le détail des lignes.

### 5.19 `POST /api/v1/access-log/exports` — exporter le journal (US-8)

- **Méthode** : POST · **Path** : `/api/v1/access-log/exports` · **Auth** : session + habilitation `auditeur`
- **Rate limit** : 2 req/min par acteur · **Idempotence** : `Idempotency-Key` requise

**Requête** (body) : `{ "from": "2026-09-01", "to": "2026-09-30", "format": "csv" }`.

**Réponse (succès)** — `202 Accepted`, comme § 5.15 (même file de jobs) :
```json
{ "export_job_id": "f02a…", "state": "queued", "requested_at": "2026-09-29T08:00:00Z" }
```

| Code | Condition | Message |
|---|---|---|
| 400 | Corps illisible | `"Corps de requête illisible : JSON attendu."` |
| 401 | Session absente ou expirée | `"Session absente ou expirée. Reconnectez-vous via le fournisseur d'identité."` |
| 403 | L'appelant n'est pas habilité (B23) | `"Seules les personnes habilitées peuvent exporter le journal des accès."` |
| 404 | — | *sans objet* |
| 409 | Export identique déjà en file | `"Un export identique est déjà en cours."` |
| 422 | Fenêtre > 31 jours, `format` invalide | `"Demande invalide : fenêtre de 1 à 31 jours, format `csv` ou `pdf`."` |
| 429 | Quota dépassé | `"Trop d'exports du journal. Réessayez dans quelques minutes."` |
| 500 | Panne interne | `"Erreur interne. La demande n'a pas été mise en file ; réessayez."` |

> L'export du journal est lui-même journalisé (B23) et passe par le **même** filtre que
> la lecture à l'écran : un export ne peut pas devenir le chemin qui contourne B25.

### 5.20 Correspondance `error_code` → statut HTTP

| `error_code` | Statut | Retenu quand | État d'UI |
|---|---|---|---|
| `UNAUTHENTICATED` | 401 | Aucun cookie / cookie invalide | Redirection vers l'IdP |
| `SESSION_EXPIRED` | 401 | Session dépassée ou révoquée (E14) | Idem, avec message explicite |
| `FORBIDDEN` | 403 | Rôle insuffisant | Bandeau « accès refusé » |
| `SCOPE_DENIED` | 403 | Périmètre calculé et connu | Tuile **non rendue** (E5) + journalisation |
| `EXPORT_SCOPE_DENIED` | 403 | Élargissement de périmètre (E6) | `ExportPanel: forbidden_scope` |
| `JOURNAL_FORBIDDEN` | 403 | Non habilité au journal (B23) | Panneau d'explication |
| `NOT_FOUND` | 404 | Ressource inexistante ou invisible | `DataTable: error` |
| `VALIDATION_FAILED` | 422 | Zod à la frontière, chemins fautifs | Erreur **au champ** |
| `PLAN_INVALID` | 422 | Plan de requête invalide (vient du client) | Erreur au champ |
| `SIGNER_UNKNOWN` | 422 | Signataire hors annuaire | Erreur au champ |
| `OWNER_REQUIRED` | 409 | Enregistrement sans propriétaire nommé (B3) | Erreur au champ |
| `SIGNER_IS_AUTHOR` | 409 | Auto-signature (B2) | Message explicite, action expliquée |
| `SIGNED_VERSION_IMMUTABLE` | 409 | Modification d'une version publiée (B1) | Message expliquant de créer une version |
| `DEFINITION_NOT_SIGNED` | 409 | Seuil posé sur une version non signée (B11) | Erreur au champ |
| `SLUG_TAKEN` | 409 | Collision d'identifiant d'URL | Erreur au champ |
| `CONCURRENT_MODIFICATION` | 409 | `expected_version_no` dépassé | Rechargement de la définition |
| `OWNER_INACTIVE` | 409 | Propriétaire inactif (B17) | Tuile `stale_owner` |
| `RATE_LIMITED` | 429 | Quota de session dépassé | Message transitoire |
| `SOURCE_UNREACHABLE` | 503 | Entrepôt injoignable (E1) | Tuile `source_unavailable` + dernière date connue |
| `COMPUTATION_TOO_LONG` | 503 | Calcul au-delà du délai (E11) | Tuile `computation_too_long`, jamais de partiel |
| `SCHEMA_UNKNOWN` | 503 | Matérialisation absente ou renommée | Tuile `source_unavailable` + message « la source n'a pas été rafraîchie » (E3) |
| `QUERY_TIMEOUT` | 504 | Dépassement du délai de 30 s | Idem E11 |
| `INTERNAL_ERROR` | 500 | Panne interne | Message générique + `request_id` |

> Cette table est la **seule** correspondance `code → statut`. L'UI décide retry,
> message et contact admin sur le `code`, jamais sur une chaîne libre : sinon chaque
> endpoint invente son libellé et l'interface ne sait plus quoi proposer.

---

## 6. Graphe de dépendances

Graphe déclaré avec `state.js dep` (15 nœuds, 24 arêtes) puis recalculé par
`dependency-check.js check . --write`, qui persiste `depends_on`, `depended_on_by` et
`impl_wave`. Le plan ci-dessous **est** le résultat du calcul : aucune séquence
d'ordonnancement plus fine n'est annoncée, donc aucun `impl_waves` n'est déclaré dans
le front matter — il n'y a pas d'écart à justifier.

### 6.1 Ordre d'implémentation topologique

```
Vague 0 (fondations, aucune ne dépend d'une autre) :
  ├── auth                 (session 8 h, droits fail-closed, rate limit)
  ├── query-engine         (withScope(), computed_at de la source, ReadOutcome)
  ├── design-primitives    (IndicatorTile, DataTable, FormField, SignatureBar,
  │                         ProvenanceStrip, ExportPanel)
  ├── access-log           (append-only, filtre B25, purge 1 an)
  └── error-handling       (enum fermée error_code, ListOutcome/ReadOutcome)

Vague 1 (dépend uniquement de fondations) :
  ├── definition-declarer  (auth, design-primitives)
  ├── restriction-lignes   (auth, query-engine)
  └── journal-acces        (auth, access-log)

Vague 2 (dépend de la vague 1) :
  ├── definition-signer    (auth, definition-declarer)
  ├── consultation-indicateur (query-engine, auth, design-primitives,
  │                          definition-declarer, error-handling)
  └── partage-dashboard    (auth, definition-declarer)

Vague 3 (dépend de la vague 2) :
  ├── seuil-et-etat        (consultation-indicateur)
  ├── historique-indicateur (query-engine, definition-signer, access-log)
  ├── drill-down           (query-engine, consultation-indicateur)
  └── export-provenance    (query-engine, restriction-lignes, consultation-indicateur)
```

**4 vagues** (V0 → V3). `state.json → index.impl_waves` porte le même découpage.

### 6.2 Parallélisme possible

| Vague | Slices parallélisables | Ce qui peut être construit en même temps sans collision |
|---|---|---|
| 0 | les 5 fondations | `auth` touche la session, `query-engine` touche le SQL : aucun fichier commun |
| 1 | `definition-declarer`, `restriction-lignes`, `journal-acces` | `restriction-lignes` ne fait que résoudre un scope déjà résolu par `auth` ; `journal-acces` n'écrit que dans `access_log` |
| 2 | `definition-signer`, `consultation-indicateur`, `partage-dashboard` | `partage-dashboard` ne fait qu'écrire des FK vers `indicator` ; `consultation-indicateur` les lit |
| 3 | `seuil-et-etat`, `historique-indicateur`, `drill-down`, `export-provenance` | `seuil-et-etat` est une fonction pure testée seule ; `export-provenance` écrit dans `export_job`, jamais dans les tables des autres |

> Un seul resserrement mérite d'être signalé : la vague 2 concentre trois slices, et
> `consultation-indicateur` est celle qui lit le plus de surface. Ce n'est pas un
> défaut de graphe — c'est le point où le projet a le plus de chances de glisser, et il
> est visible dans le plan sans avoir besoin d'un plan de vagues plus fin.

### 6.3 Cycles

Aucun cycle de dépendances détecté. `state.js dep` refuse une dépendance vers une slice
inexistante, l'auto-référence et toute dépendance qui fermerait un cycle ; le graphe
complet a été déclaré sous ces trois refus, puis vérifié par `dependency-check`
(`cycles: []`, `missing_dependencies: []`, `orphans: []`).

### 6.4 Points de contention et couplage

| Nœud | Dépend de | Dépendu par | Lecture |
|---|---|---|---|
| `auth` | 0 | **6** | Point de contention maximal : toute slice non foundations passe par la session. C'est voulu — une seule implémentation du fail-closed vaut mieux que six. |
| `query-engine` | 0 | **5** | Idem pour l'accès à l'entrepôt. Le coût est compensé par l'absence d'alternative : deux moteurs de requête produiraient deux définitions de la fraîcheur. |
| `definition-declarer` | 2 | **3** | Le seul slice métier dont dépendent trois autres. C'est la conséquence directe de B1 : sans version figée, il n'y a pas de valeur publiée. |
| `consultation-indicateur` | **5** | **3** | Slice la plus couplée du graphe. Elle justifie à elle seule que `error-handling` soit une fondation et non une slice : sans enum fermée, elle inventerait ses propres libellés d'erreur. |
| `design-primitives` | 0 | 2 | Utilisé par peu de slices parce que le design system n'a que six composants, tous déjà spécifiés en Phase 3. |
| `access-log` | 0 | 2 | Isolé : `restriction-lignes` et `historique-indicateur` écrivent dans le journal mais n'en dépendent pas pour fonctionner. |
| Feuilles (`seuil-et-etat`, `historique-indicateur`, `drill-down`, `partage-dashboard`, `export-provenance`, `journal-acces`) | 1 à 3 | 0 | Aucune de ces slices ne peut faire échouer une autre par son API. |

**Signalement de risque** : `definition-declarer` et `consultation-indicateur` sont sur
le chemin critique de **toutes** les slices du MVP. Un retard sur l'une décale la vague 3
entière. Le seul moyen de réduire ce risque sans deepening le graphe est de traiter
`definition-declarer` comme la première slice finance la plus rapide possible — ce que
fait la vague 1, où elle est seule à dépendre de `design-primitives`.

---

## 7. Décisions d'architecture (ADR)

| ID | Décision | Contexte | Options considérées | Choix | Justification | Conséquences |
|---|---|---|---|---|---|---|
| ADR-1 | `signer_id ≠ author_id` est une **contrainte d'intégrité en base**, pas un garde d'interface | B2 interdit l'auto-signature ; un contrôle d'interface se contourne par un appel API direct, un script de reprise, ou un import de données | (a) garde d'UI : l'auteur n'apparaît pas dans la liste des signataires ; (b) garde de service dans le cas d'usage ; (c) `CHECK` en base + index unique | **(c)** | La règle est structurelle : elle doit tenir même quand personne ne respecte l'interface. Le PRD la classe comme contrainte d'intégrité, pas comme ergonomie | Un `INSERT` manuel qui viole B2 échoue. Le message d'erreur est technique côté base, donc l'API le traduit en `SIGNER_IS_AUTHOR` avec une explication en clair (§ 5.8) |
| ADR-2 | La restriction de lignes est appliquée **dans la requête SQL**, pas dans l'interface | B7 : une ligne interdite n'est ni lisible, ni recalculable, ni exportable « par aucun chemin » | (a) filtrer les lignes à l'affichage ; (b) filtrer dans la couche service après requête ; (c) `AND team_code = ANY($1)` injecté dans le SQL par `withScope()` | **(c)** | Un filtrage d'interface ne tient pas : l'export, le drill-down, le cache et l'appel direct au service contournent tous l'écran. Le filtre doit être **sous** la seule porte de sortie possible | Le total et le visible ne peuvent plus diverger (§ 5.7). Coût : la requête n'est plus « lisible à l'œil » sans lire le scope, d'où `explain()` testé hors base |
| ADR-3 | `computed_at` est lu **dans la source**, jamais à l'heure de la requête | B5, B6 : la date de calcul est une information de contrôle ; un champ de fraîcheur calculé chez nous décrit notre lecture, pas la donnée | (a) `now()` au moment du SELECT ; (b) métadonnée de table de l'entrepôt ; (c) colonne `computed_at` de la matérialisation, `NULL` si absente | **(c)** | (a) ment sur le cas qui compte : une vue de la nuit précédente affichée « fraîche ». (b) décrit le chargement, pas le calcul. (c) est la seule qui survit à une panne de l'entrepôt | `computed_at` est nullable et reste `null` : l'UI affiche « fraîcheur inconnue » (B6) et ne comble jamais. E1 et E3 sont des états, pas des erreurs |
| ADR-4 | L'assemblage d'un tableau de bord est **fixe** ; US-10 (composeur libre) est en V1 | Le PRD autoriserait un composeur ; `roadmap.md` § 2.1 le retire explicitement du MVP, `benchmarks.md` § 5 écart 1 l'assume | (a) grille libre avec placement ; (b) assemblage fixe ordonné, `position` dense et `UNIQUE` ; (c) sans tableau de bord, partage d'indicateurs isolés | **(b)** | Le besoin du comité est « la même chose que moi », pas « composer ». Sans la borne, le MVP livre la moitié de US-10 sous un autre nom — et le critère « 3 managers publient sans aide » mesurerait la mauvaise chose | L'ordre d'écriture est l'ordre d'affichage ; `tile_size` est le seul levier de présentation. La réversibilité est facile (c'est une fonctionnalité absente, pas une donnée créée) |
| ADR-5 | L'export est un **job de fond** dans une table PostgreSQL, pas une requête HTTP | 7.1 : « un export est produit en tâche de fond » ; plusieurs millions de lignes dépassent tout délai HTTP, et un export interrompu par la navigation perd le travail | (a) requête HTTP synchrone avec streaming ; (b) job en base + worker Node ; (c) service asynchrone séparé (file externe) | **(b)** | La file doit être **durable** : si le worker tombe, le job reprend. Une file externe serait une dépendance de plus à héberger pour un besoin à trois indicateurs. `conventions.md` a tranché en Phase 0 | Un service de plus à héberger et à surveiller. En contrepartie : aucun fichier partiel (E13), reprise possible, et l'export reste rattaché à sa version (B22, ADR-8) |
| ADR-6 | Le journal des accès est **filtré selon les droits de son lecteur** (B25), et le filtre est une propriété de la fondation `access-log` | Le journal nomme qui a consulté quel indicateur : il reproduit la restriction de visibilité sous une **autre forme**. C'est le seul endroit du système où cette restriction pourrait être contournée | (a) journal non filtré, accès réservé à quelques personnes ; (b) filtrage par ressource, dans la couche service ; (c) filtrage dans `access-log`, avec `redacted_count` rendu visible | **(c)** | (a) n'est pas une protection : un journal complet dit précisément **quels** indicateurs existent, ce que l'écran nie. (b) laisse la règle dans chaque slice appelante, donc oubliable. (c) en fait une porte unique, testable, et rend l'omission visible au lieu de silencieuse | Une entrée de refus journalise la ressource visée et **jamais** le détail des lignes : le journal ne peut pas devenir un canal de fuite de périmètre. `redacted_count` dit à l'utilisateur que le journal est filtré |
| ADR-7 | PostgreSQL ne porte **que** des métadonnées, le journal et la file d'export ; l'entrepôt n'est jamais écrit et son schéma n'est pas possédé | C1 (l'entrepôt est la source, jamais écrit) ; C4 et C10 imposent chiffrement, isolation par ligne, PITR et rétention sur des données personnelles | (a) calculer les indicateurs dans PostgreSQL ; (b) tout garder dans l'entrepôt, journal compris ; (c) séparation stricte, avec un **contrat de lecture** testé | **(c)** | (a) contredit C1 et B5 : la valeur affichée serait la nôtre, pas celle de l'entreprise. (b) rend C4 et C10 dépendants des plans de purge et de RLS de l'équipe data. (c) rend le périmètre du journal indépendant | L'entrepôt devient une **dépendance contractuelle** : un test d'intégration échoue si une colonne attendue est renommée. Le prix est explicite — renommer une colonne devient un travail conjoint, pas un correctif interne |
| ADR-8 | Une version de définition est un **dépôt**, pas une branche : append-only, signature en événements append-only | B1 (une modification crée une version, ne réécrit pas les précédentes), B22, B26 (révocable jusqu'à la publication) | (a) tableau de versions avec `UPDATE` du statut ; (b) append-only + `signature_event` qui référence l'acte qu'il révoque ; (c) table d'historique de diffs séparée | **(b)** | (a) permet de réécrire le passé : la réécriture d'un statut est exactement ce que la réécriture d'une définition ferait. (b) garde une trace complète — y compris une signature annulée, qui doit rester visible. (c) scinde la vérité en deux endroits | Aucune mise à jour n'est possible sur `definition_version` et `signature_event` : une correction passe par une nouvelle version et une nouvelle signature. Le refus et la révocation restent consultables, ce qui est une obligation de traçabilité, pas une commodité |

### 7.1 Détail des décisions

**ADR-1 — `signer_id ≠ author_id`, et que se passe-t-il si une délégation existe.**

B2 est tranchée : l'auteur ne signe jamais sa propre version, le signataire est une
personne nommée désignée par le propriétaire. L'architecture ne modélise **aucune
délégation**, et c'est délibéré.

- La contrainte est un `CHECK` en base, plus un index unique « une seule signature
  active par version et par signataire » (§ 4.8). Un garde d'interface est contournable ;
  une contrainte ne l'est pas.
- **Si une délégation apparaît** — un directeur qui signe pour son manager en congé,
  par exemple — elle n'est pas représentable dans ce schéma, et c'est le but. Il n'existe
  pas de colonne `delegated_to` à activer, ni de drapeau `allow_delegation` : ajouter une
  délégation demanderait une **migration et une nouvelle ADR**, parce que la règle elle-même
  changerait de nature (elle deviendrait « signer pour autrui », pas « ne pas signer
  soi-même »).
- Le chemin correct, si le besoin apparaît, n'est pas de contourner la règle : c'est de
  nommer un autre signataire désigné sur une **nouvelle version** (B1), puis de la faire
  signer. L'historique montre alors les deux actes, avec leurs auteurs respectifs.
- Le cas E8 (propriétaire en congé longue durée) montre pourquoi la délégation serait
  la mauvaise réponse : elle déplace le problème sans le résoudre, puisque la définition
  resterait sans propriétaire **vivant** et donc sans statut officiel (B17).
- Tant que le rôle n'est pas pourvu (`F-001`), la règle n'est pas un blocage technique :
  `indicator.designated_signer_actor_id` est non nul, donc aucun indicateur ne peut
  être créé. C'est le comportement voulu — un indicateur sans signataire désigné
  n'est pas signable, donc pas officiel, donc pas publiable.

**ADR-2 — pourquoi une restriction d'interface ne tient pas.**

L'argument tient en une phrase : *l'interface est l'un des cinq chemins d'accès, pas le
seul*. Les quatre autres sont l'export (B8 exige qu'il porte exactement les mêmes
lignes), le drill-down (B15), l'API de programme (V2, mais C11 la bornera quand même),
et le cache. Un filtre appliqué après la requête laisse dans le cache, dans la file
d'export et dans les journaux d'exécution la ligne qu'il prétend avoir retirée. Pire,
un filtre d'interface est *silencieusement* contourné : l'utilisateur voit un tableau
juste, l'export contient la ligne interdite, et le contrôle a posteriori est impossible.

D'où trois conséquences structurelles, pas seulement une règle :
1. le filtre est écrit par `withScope()` et par personne d'autre — règle ESLint à l'appui ;
2. le filtre est **composé** avec la restriction d'écriture de la définition, jamais
   remplacé par elle : `scope_expr` réduit, `granted_team_codes` intersecte, et le
   résultat est le périmètre résolu, renvoyé dans la réponse pour être affichable ;
3. le cache porte le périmètre dans sa clé (§ 4.15), donc deux lecteurs de périmètres
   différents n'échangent jamais de résultat. C'est le seul moyen de garder le cache
   compatible avec B7.

**ADR-6 — pourquoi le journal est la faille la plus probable.**

Toutes les autres surfaces appliquent la restriction par construction : elles passent par
`auth` puis `query-engine`. Le journal, lui, ne lit pas l'entrepôt : il **nomme** des
ressources. Or `resource_slug` est, en soi, une divulgation. Un lecteur qui n'a pas droit à
`ca-marge-brute` apprendrait son existence, son propriétaire et sa fréquence de
consultation depuis un journal non filtré — ce que l'écran nie délibérément (E5 : la
tuile n'est pas rendue, sans placeholder, parce qu'un « accès refusé » confirme
l'existence).

Le contournement n'est pas théorique non plus : l'export du journal, l'API de
programme en V2, et le support PDF d'un comité qui circule. D'où trois décisions
défensives, toutes dans la fondation :
- le filtre est dans `access-log`, pas dans la slice appelante ;
- `redacted_count` est retourné : l'interface dit qu'elle filtre, au lieu de laisser
  l'utilisateur croire à un journal complet ;
- l'export du journal passe par le **même** filtre que la lecture à l'écran (§ 5.19) ;
  un export ne peut pas être le chemin qui contourne ce que la lecture applique.

**ADR-4 — ce que « assemblage fixe » interdit exactement.**

Interdit : le placement libre, le redimensionnement, l'ajout d'un filtre libre hors de
ceux écrits dans la définition, l'ajout d'un indicateur non officiel, l'export d'une
sous-selection personalized. Autorisé : l'**ordre** d'ajout des indicateurs officiels,
et la taille de tuile parmi trois valeurs. C'est un objet, pas un éditeur — et la
réversibilité est réelle, parce qu'il n'a pas été créé de données : un placement libre
ajouterait des positions arbitraires qu'aucun autre écran ne sait interpréter.

**ADR-7 — ce que « contrat de lecture » signifie en pratique.**

Amberline n'écrit aucune migration sur l'entrepôt. Il pose donc des **exigences** que
l'équipe data doit satisfaire, et un test d'intégration les vérifie : présence des colonnes
`indicator_key`, `computed_at`, `source_ref`, `scope_fingerprint`, `team_code` ;
`computed_at` nullable ; `line_key` unique par indicator et période. Si l'équipe data
renomme une colonne, le test échoue en CI avec le nom manquant — ce qui transforme une
dépendance invisible en dépendance **annoncée**. C'est le prix assumé de C1 : on ne peut
pas corriger seul, mais on ne peut plus être surpris.

---

## 8. Risques architecturaux

| Risque | Probabilité | Impact | Mitigation |
|---|---|---|---|
| **Le comité n'a toujours pas ses chiffres à trois mois** (C6) — 4 vagues, 15 nœuds, un worker de fond, un fournisseur d'identité non nommé, une fixture d'entrepôt à obtenir | HIGH | HIGH | Le découpage tient compte du délai : `seuil-et-etat` ne livre que l'**état** dérivé (pas de machine à états, pas d'alerte), `partage-dashboard` ne livre que l'assemblage fixe, et le composeur libre est V1. Les fondations sont en vague 0 et parallélisables. Le vrai facteur de risque n'est pas le code : ce sont F-001 et F-002, tous deux hors chemin de build |
| **F-002 — l'accord d'infrastructure sur l'entrepôt de test seedé n'aboutit pas** (criticité : **critique**) | MEDIUM | HIGH | Sans fixture seedée, B7 n'est pas **démontrable** : E5 et E10 ne peuvent pas être exercés, et le critère de sécurité du MVP reste non vérifié — ce qui n'est pas la même chose qu'inconfortable. Mitigation : l'accord est demandé **avant** la Phase 4 ; à défaut, `restriction-lignes` et `export-provenance` ne peuvent pas être déclarées terminées, et le jalon n'est pas `T_livraison` mais « B7 démontré ». Escalade vers l'équipe data, pas contournement par un jeu de données synthétique : un jeu synthétique ne prouve rien sur les lignes réelles |
| **F-001 — le porteur de projet n'est pas habilité à trancher l'arbitrage métier** : le rôle de signataire n'est pas pourvu, et l'arbitrage « 95 % ou 96 % pour le taux de service » appartient à la production et au commercial, pas à lui | HIGH | HIGH | La règle `signer_id ≠ author_id` est **tranchée** et appliquée en base (ADR-1) : elle n'attend personne. Ce qui attend, ce sont les **noms**. Tant qu'ils manquent, `indicator.designated_signer_actor_id` est non nul et aucun indicateur ne peut être créé : le blocage est structurel et visible, pas diffus. Conséquence d'architecture à assumer : l'architecture ne doit **pas** tenter de contourner ce blocage (ni signer d'office, ni accepter un signataire générique). `T_noms` est le seul jalon actionnable du MVP, et il est faisable sans écrire une ligne de code |
| Le fournisseur d'identité OIDC n'est pas nommé (PRD § 12.1 point 2) | HIGH | HIGH | `auth` est écrit fail-closed dès le premier jour : sans fournisseur nommé, `resolveSession()` renvoie `null` et tout est refusé, ce qui est le comportement attendu. Le produit ne démarre pas, mais il ne démarre pas **ouvert** non plus. Escalade avant la Phase 5 |
| Un propriétaire d'indicateur devient inactif : l'indicateur perd son statut officiel, les dashboards le servant perdent leur caractère officiel, et E17 demande de ne **pas** retirer le tableau | MEDIUM | HIGH | `officiality` est **dérivé** et recalculé à la lecture (§ 4.5) : le passage à `stale_owner` ne demande aucune écriture et ne peut pas être oublié. `dashboard.is_official` est recalculé de la même manière. Le retrait d'un tableau est explicitement interdit par E17 : le retirer effacerait ce que le lecteur attendait |
| Deux définitions signées de deux indicateurs différents produisent la même valeur (E18) | MEDIUM | MEDIUM | Aucune correction automatique n'est appliquée, par conception : corriger l'un des deux silencieusement serait pire que le conflit. Le constat est détectable (deux `definition_version` signées, même `value`, même `scope_fingerprint`) et remonté aux deux propriétaires. Le journal rend le conflit visible sans le trancher |
| PostgreSQL porte des données personnelles sans les prérequis légaux (C10) : chiffrement au repos, PITR, isolation par ligne, accord de traitement | MEDIUM | HIGH | Ces quatre éléments sont des prérequis de mise en production, pas des améliorations : ils sont dans la scope dès la fondation `access-log` (rôle SQL sans `UPDATE`/`DELETE`, `expires_at` par ligne) et dans le runbook d'hébergement. Tant qu'ils ne sont pas en place, le MVP se déploie en recette seulement |
| Le fournisseur OIDC ou l'entrepôt tombent en séance de comité | LOW | HIGH | E1 et E7 : la dernière valeur connue reste affichée **avec sa date de calcul**, prise dans la source. Aucun écran ne rend un zéro ni une liste vide sur une panne (`ListOutcome` rend `error`, jamais `ok` + `[]`) |
| La course entre deux lecteurs autour d'un rafraîchissement (E7) | MEDIUM | MEDIUM | Les deux réponses portent leur `computed_at` de source ; le cache est indexé sur `(query_hash, actor_scope_hash, computed_at_source)` et sert la valeur la plus fraîche connue. La différence entre deux lectures est donc annotée, jamais ambiguë |
| Un export de plusieurs millions de lignes sature l'entrepôt pendant une séance | MEDIUM | MEDIUM | Le worker est séquentiel par source et s'exécute **hors** du chemin de lecture interactive ; les lectures de l'écran ne partagent pas la même file. Le `scope_snapshot` figé évite un recalcul de périmètre au moment de la production, qui doublerait la charge |
| Le `change_note` en langue devient une formule que personne ne relit (US-17) | MEDIUM | MEDIUM | `change_note` est obligatoire (1..500 car.) et alimente directement l'historique. Un test de revue exige qu'il ne soit pas un diff de formule : c'est une contrainte de contenu, pas de schéma, donc elle est portée par la checklist de revue de la slice `definition-declarer` |
| 15 nœuds pour trois indicateurs : le coût d'architecture dépasse le produit | LOW | MEDIUM | Les 5 fondations sont transverses et réutilisables ; 4 des 10 slices (seuil, historique, drill-down, export) sont des extensions directes de `consultation-indicateur`. Le surcoût réel est la fondation `access-log`, et il est justifié par C4, qui est une contrainte légale et non un souhait |

---

## Check list de gate

- [x] Chaque user story du PRD a une slice correspondante — US-1, US-2, US-3, US-4, US-5,
      US-6, US-7, US-8, US-9, US-11 et US-17 couvrent le périmètre MVP de `roadmap.md`
      § 2.1. US-10, US-12 à US-16 sont hors MVP par décision de roadmap tracée.
- [x] Chaque slice a une responsabilité claire et nommable en une phrase (§ 3.3 à § 3.6).
- [x] Les fondations sont identifiées et isolées des slices métier — cinq fondations,
      aucune dépendance entre elles, chacune avec un contrat TypeScript consommateur.
- [x] Les modules portent un rang, un score de fréquence et une justification (§ 3.1).
- [x] Tous les modèles de données sont définis champ par champ — 17 entités, § 4.2 à § 4.18.
- [x] La frontière PostgreSQL / entrepôt est explicite et justifiée par C1 et B5 (§ 4.1).
- [x] Tous les endpoints API listent leurs codes d'erreur de manière exhaustive — 19
      endpoints, § 5.1 à § 5.19, avec la table de correspondance § 5.20.
- [x] Le graphe de dépendances est sans cycle — `dependency-check` : `cycles: []`.
- [x] L'ordre d'implémentation est cohérent avec les dépendances — 4 vagues, persistées
      par `dependency-check --write` dans `state.json → index.impl_waves`.
- [x] Les décisions d'architecture non triviales sont documentées en ADR — 8 décisions,
      § 7 (table) et § 7.1 (détail), dont les six imposées par le cadrage : `signer_id ≠ author_id`
      et sa non-délégabilité, la restriction appliquée dans la requête, `computed_at` de la source,
      l'assemblage fixe, l'export en tâche de fond, et le journal filtré selon les droits du lecteur.
- [x] La structure de dossiers cible est définie (§ 1.2).
- [x] La conformité aux standards de `.forge/benchmarks.md` est vérifiée (§ 1.3).
- [x] Les pathologies de `archetypes.md` § 9 sont traitées avec leur porte mécanique (§ 3.7).
- [x] Aucun `{{PLACEHOLDER}}` résiduel.

**Points ouverts signalés à l'orchestrateur** : `F-001` (rôle de signataire non
pourvu) et `F-002` (entrepôt de test seedé non obtenu) ne sont pas des livrables de la
Phase 4 et ne peuvent pas être résolus ici. `F-002` bloque la **démonstration** de B7,
donc la clôture de `restriction-lignes` et de `export-provenance`.

**Statut** : `draft` → en attente de validation.
