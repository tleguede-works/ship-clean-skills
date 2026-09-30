---
type: architecture
status: stale
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
| Hiérarchie KPI → signal → détail | oui | `seuil-et-etat` produit l'**état** → `consultation-indicateur` rend la `IndicatorTile` → `drill-down` rend la décomposition |
| Le dashboard montre des anomalies, pas des métriques décoratives | oui | B11 : la couleur sémantique dérive de la comparaison à la cible, jamais d'un réglage d'apparence |
| Chaque visuel est cliquable vers son détail | oui | Chaque tuile ouvre la décomposition (B15) |
| Seuils et couleurs sémantiques | oui | B11 porte l'**état** ; B12 (alerte par passage) est V1 avec le canal mail |
| Plages temporelles pilotables | oui | La période vit dans l'URL (`conventions.md`, « URL comme état ») |
| Module « configuration » | écart assumé | `benchmarks.md` § 5 écart 2 : les seuils sont écrits avec la définition, pas dans un écran de réglages |
| Module « alertes » | **partiellement au MVP — l'écart est le canal, pas l'alerte** | Ce qui est **présent au MVP**, c'est l'**état rendu** : la ligne de seuil obligatoire et non rognable (§ 2.3), la couleur sémantique et la mention « hors cible » (B11), et `semantic_state` dans § 5.2, § 5.3 et § 5.13. Ce qui manque — l'**alerte automatique** et son **canal** — part en V1 (`roadmap.md` § 2.2) |
| « alertes ignorées » (piège) | traité | Aucun canal au MVP : il n'y a rien à ignorer, donc rien à prétendre mesurer. B12 (alerte une fois par passage, réarmement) arrive **avec** le canal, mesuré |

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
| `design-primitives` | Les six composants du design system, sans appel réseau | — | `definition-declarer`, `seuil-et-etat`, `consultation-indicateur` |
| `access-log` | Journal append-only, purgé à un an, **filtré selon les droits du lecteur** (B25) | — | `historique-indicateur`, `journal-acces` |
| `error-handling` | Enum fermée d'`error_code` partagée, correspondance code → statut HTTP, états distincts (vide ≠ erreur ≠ refus) | — | `consultation-indicateur` |

> `export-provenance` consomme le worker (contrat `ExportJobPort` déclaré dans § 5.17)
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

/**
 * La ligne de seuil — B11. LA FORME EST FIXÉE ICI, UNE SEULE FOIS.
 * § 5.2, § 5.3 et § 5.13 la renvoient telle quelle à l'identique ; § 5.4 l'écrit
 * avec les mêmes noms de champs, sans `definedAt` parce que la base l'horodate à
 * l'écriture (`now()`, § 4.7) et qu'un client n'a rien à y mettre.
 *
 * Les trois faits sont ceux de `definition_threshold` (§ 4.7) et ils sont tous
 * obligatoires au MVP : la valeur, le SENS, et sa date. Une cible absente est
 * `null`, jamais `0` — et un indicateur sans seuil n'est pas un indicateur
 * tronqué : c'est `threshold: null` et rien ne s'affiche (E16 côté cible,
 * `not_applicable` côté rendu, `design-system.md` § 2.1).
 */
export interface IndicatorThreshold {
  readonly comparison: 'below' | 'above';   // le SENS : « en dessous de » / « au-dessus de »
  readonly thresholdValue: number;          // la VALEUR de bascule
  readonly label: string;                   // libellé non technique, 1..120 car.
  readonly definedAt: string;               // la DATE — § 4.7 `defined_at`, la source
}

/**
 * L'état sémantique, produit par la slice `seuil-et-etat` (§ 3.3) et **seulement**
 * par elle : c'est elle qui implémente `resolveSemanticState()`, fonction testée
 * sur ses deux côtés (§ 3.7). `consultation-indicateur` ne la calcule pas, elle ne
 * fait que la transporter dans la réponse et la donner au composant.
 */
export type SemanticState = 'in_target' | 'out_of_band' | 'target_missing' | 'not_applicable';

export interface IndicatorTileProps {
  readonly label: string;
  readonly displayState: IndicatorDisplayState;
  readonly value?: number;              // requis si displayState === 'default' | 'out_of_band'
  readonly unit?: string;
  readonly target?: { readonly value: number; readonly delta: number; readonly confirmed: boolean };
  readonly semanticState?: SemanticState; // produit par `seuil-et-etat`, jamais recalculé ici
  readonly threshold?: IndicatorThreshold; // absent ⇔ la version signée ne porte aucun seuil
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
  readonly onSubmit?: () => Promise<void>;   // `submit` (in_review) puis `sign` : deux actes distincts
  readonly onWithdraw?: () => Promise<void>;
  readonly onPublish?: () => Promise<void>; // l'acte `publish` qui pose le verrou B26
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

> **Le slot `threshold` est obligatoire au MVP, et il ne se tronque pas.** Le design
> system approuvé (`design-system.md` § 2, ligne « Tailles ») fait de la ligne de
> seuil un contenu non négociable : **la valeur du seuil, son sens et sa date**, dont
> **aucun** n'est optionnel. La règle est donc écrite **dans le contrat du composant**,
> pas dans un écran — parce qu'un écran qui l'ampute serait un écran correct parmi
> d'autres, et qu'un seul écran fautif suffit à rendre la règle fausse.
>
> Trois conséquences, toutes dans la fondation :
> 1. `threshold` est `IndicatorThreshold | undefined`, et `undefined` ne veut dire
>    qu'une chose : **aucun seuil n'est déclaré sur la version signée qui porte la
>    valeur** (B11). Il n'y a pas de troisième cas « seuil présent mais incomplet ».
> 2. **Aucune taille ne rogne la ligne de seuil** — pas `sm`, pas `md`, pas `lg`, pas
>    le format le plus étroit. Quand la place manque, la ligne **se replie sur deux
>    lignes** ; elle ne se coupe pas. Une hauteur de tuile qui ne tient pas la ligne
>    est un défaut de la hauteur, pas une permission de perdre une date.
> 3. `definedAt` vient de `definition_threshold.defined_at` — la source, donc l'acte
>    d'écriture du seuil — et **jamais de l'heure du poste** (B5). Une date de
>    seuil tronquée ou re-stampée serait une affirmation invérifiable devant un
>    journal, ce qui est exactement la faute que B5 interdit pour `computed_at`.
>
> C'est pourquoi § 5.2, § 5.3 et § 5.13 — les trois réponses qui rendent une tuile —
> renvoient `threshold` : une tuile sans ce champ ne peut pas rendre un slot
> obligatoire, et le design system § 2 l'a rendu obligatoire au MVP précisément
> parce que B12 est hors périmètre, donc qu'il ne reste que ces trois faits.

> `SignatureBar` porte `draft` et `in_review` depuis le début, et recevait
> `onSign` / `onRefuse` sans aucun moyen d'y arriver : `in_review` était donc un
> état **non atteignable** par l'interface. Les trois callbacks d'acte
> (`onSubmit`, `onWithdraw`, `onPublish`) ferment ce chemin, et ils sont dans le
> contrat du composant pour la même raison que le slot `threshold` : une action sans
> point d'entrée dans le composant est une action que l'écran réimplémentera
> différemment.

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
  'DEFINITION_NOT_DRAFT', 'DEFINITION_NOT_IN_REVIEW', 'DEFINITION_NOT_SIGNED',
  'ALREADY_SIGNED_BY_ACTOR', 'NO_ACTIVE_SIGNATURE',
  'SLUG_TAKEN', 'CONCURRENT_MODIFICATION', 'OWNER_INACTIVE',
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
  DEFINITION_NOT_DRAFT: 409, DEFINITION_NOT_IN_REVIEW: 409, DEFINITION_NOT_SIGNED: 409,
  ALREADY_SIGNED_BY_ACTOR: 409, NO_ACTIVE_SIGNATURE: 409,
  // `OWNER_INACTIVE` est un code d'ÉCRITURE, et c'est deliberément le seul :
  // une LECTURE ne le lève jamais. Un propriétaire inactif n'empêche pas de
  // répondre — il change ce qu'on répond : `officiality: "stale_owner"` dans un
  // `200` (§ 5.3, § 5.6, § 5.7, § 5.13). Il n'est levé que par un acte d'écriture
  // sur une version de cet indicateur : soumission, publication, signature, refus.
  SLUG_TAKEN: 409, CONCURRENT_MODIFICATION: 409, OWNER_INACTIVE: 409,
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

- **Phrase** : Afficher la valeur officielle d'un indicateur avec sa cible, son seuil,
  sa date de calcul **prise dans la source**, son identifiant de source et sa mention
  de statut officiel, sans que le lecteur ait à rouvrir l'entrepôt.
- **User stories** : US-3
- **Règles métier** : B4, B5, B6, B13, B17, **B11 (transport du seuil)**
- **Dépend de** : `query-engine`, `auth`, `design-primitives`, `definition-declarer`,
  `error-handling`, **`seuil-et-etat`**
- **Dépendue par** : `drill-down`, `export-provenance`
- **Écrans** : `indicateurs`, `indicateur-detail`
- **Peut être parallélisée avec** : `definition-signer`, `partage-dashboard` (vague 2)
- **Ce qu'elle ne fait pas** : elle ne **calcule** pas la comparaison à la cible.
  `semantic_state` vient de `seuil-et-etat` (§ 3.3, décision d'arbitrage) et
  `threshold` vient de `definition_threshold` (§ 4.7) — elle ne fait que les
  transporter dans la réponse et les donner à `IndicatorTile`. Garder les deux
  séparées évite d'avoir la règle B11 écrite à deux endroits.

#### Slice : `seuil-et-etat`

- **Phrase** : Dériver l'état sémantique d'un indicateur (dans la cible / hors cible /
  cible absente) de la comparaison entre sa valeur et la cible versionnée de sa
  définition, et le traduire dans l' état d'affichage de `IndicatorTile`.
- **User stories** : US-4
- **Règles métier** : B11
- **Dépend de** : `design-primitives` — **et c'est tout**
- **Dépendue par** : `consultation-indicateur`
- **Écrans** : `indicateur-detail`, `indicateurs`
- **Peut être parallélisée avec** : `definition-declarer`, `restriction-lignes`,
  `journal-acces` (vague 1)
- **Périmètre MVP** : l'**état** dérivé de la valeur, avec sa date de calcul. Pas de
  machine à états, pas de tâche de fond, pas d'alerte : B12 part en V1 avec le canal
  mail (`roadmap.md` § 2.2). Un seuil posé sur une définition non signée est refusé.

> **Décision d'arbitrage : qui porte le calcul de la comparaison à la cible ?**
> **`seuil-et-etat`, seule, sans exception.** Ce n'était pas écrit, et les deux
> documents qui dépendaient de la réponse se contredisaient : § 5.3 et § 5.13
> promettaient un `semantic_state` dans la réponse, donc une comparaison calculée
> **par `consultation-indicateur`**, tandis que la slice porte précisément
> « elle ne colourie pas la valeur […] la comparaison à la cible est `seuil-et-etat` »
> — donc un calcul **par `seuil-et-etat`**. Les deux ne peuvent pas être vrais, et il
> ne s'agit pas d'une nuance de rédaction : la réponse de § 5.3 est produite par
> `consultation-indicateur`, donc la comparaison devait être calculée **avant** elle,
> en vague 3 — ce qui est impossible.
>
> Trois raisons, dont une est un fait et deux sont des choix :
> 1. **Un fait déjà posé.** `design-system.md` § 2.1 fait de la machine à états du
>    franchissement l'objet de la slice `seuil-et-etat`, avec des états nommés
>    (`threshold_armed`, `out_of_band_alerting`, …). Si la comparaison était
>    ailleurs, la machine à états serait coupée en deux : quelqu'un déciderait
>    `out_of_zone`, et quelqu'un d'autre déciderait que c'est « la première fois ».
> 2. **Règle écrite à un seul endroit.** B11 (« la valeur du seuil, son sens et sa
>    date ») est une règle de **définition**, pas de rendu : elle appartient à la
>    slice qui connaît la définition, pas à celle qui la dessine.
> 3. **Le calcul est une fonction pure, donc l'ordre des vagues n'a pas à la suivre.**
>    `resolveSemanticState(value, target, threshold) → SemanticState` ne lit rien,
>    n'écrit rien, ne fait aucun appel réseau. Elle n'a besoin que du type
>    `IndicatorDisplayState` de `design-primitives` pour dire quel état de tuile en
>    découle. Elle est donc constructible en **vague 1**, sans attendre que
>    `consultation-indicateur` existe — et c'est ce qui supprime le cycle
>    au lieu de le déplacer.
>
> **Conséquence sur le graphe, répercutée.** `consultation-indicateur` dépend
> désormais de `seuil-et-etat`, et `seuil-et-etat` ne dépend plus de
> `consultation-indicateur` : la flèche s'inverse. C'est la seule inversion du
> document, et elle est dans § 6.1, § 6.2, § 6.4, § 2 et § 3.3. Elle ne crée
> **aucun cycle** : `seuil-et-etat` ne lit rien de `consultation-indicateur`,
> c'est l'appelant qui lui passe `(value, target, threshold)`.

#### Slice : `historique-indicateur`

- **Phrase** : Montrer les versions signées d'un indicateur avec, pour chacune, sa
  valeur, sa date de calcul issue de la source, sa date de signature et son signataire,
  et formuler en langue métier l'écart entre deux versions.
- **User stories** : US-17
- **Règles métier** : B22, B24 (B18 cité comme retiré)
- **Dépend de** : `query-engine`, `definition-signer`, `access-log`
- **Dépendue par** : *aucune*
- **Écrans** : `indicateur-detail` (split screen, historique)
- **Peut être parallélisée avec** : `drill-down`, `export-provenance` (vague 3)
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
- **Peut être parallélisée avec** : `historique-indicateur`, `export-provenance` (vague 3)

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
- **Peut être parallélisée avec** : `historique-indicateur`, `drill-down` (vague 3)
- **Nota** : c'est la seule slice qui consomme le worker de fond. Elle consomme le
  **contrat** `ExportJobPort` (§ 5.17), pas la fondation.

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

- **Phrase** : Porter le cycle de vie complet d'une version de définition — la soumettre
  à signature, la retirer de la file, la signer ou la refuser avec motif, la publier,
  la révoquer avant publication — chaque acte étant journalisé et aucun n'étant
  déclenché par un tiers.
- **User stories** : US-2 (et US-1 pour la soumission)
- **Règles métier** : B2, B26, **B4 (la publication porte la valeur officielle)**,
  **B17 (un propriétaire inactif bloque l'écriture)**
- **Dépend de** : `auth`, `definition-declarer`
- **Dépendue par** : `historique-indicateur` — et **pas** `consultation-indicateur`,
  pour une raison qui vaut d'être écrite : `consultation-indicateur` rend bien
  `status` et `published_at` (§ 5.3, § 5.6), mais elle les lit dans le **schéma**
  (§ 4.6), pas dans le code de cette slice. Déclarer la dépendance au seul motif que
  « les données viennent de là » ferait passer `consultation-indicateur` en vague 3,
  donc `drill-down` et `export-provenance` en vague 4, pour une dépendance de code
  qui n'existe pas. Le cycle de vie est garanti autrement, et plus fortement : par la
  porte SQL de § 4.20, où un `UPDATE` sans acte correspondant est refusé **en base**.
  `historique-indicateur` est, lui, une vraie dépendance de code : il projette les
  actes eux-mêmes (signataire, date, motif), pas seulement deux colonnes.
- **Écrans** : `definition-signature`
- **Peut être parallélisée avec** : `consultation-indicateur`, `partage-dashboard` (vague 2)
- **Verrou structurel** : `signer_id ≠ author_id` est une contrainte d'intégrité en
  base, pas un garde d'interface (ADR-1).
- **Écrivains du cycle de vie** : cette slice est le **seul** producteur des cinq
  actes de `signature_event` (§ 4.8) et le seul à écrire `definition_version.status`
  et `definition_version.published_at` (§ 4.6). Aucun endpoint ne les modifie, aucune
  tâche de fond ne les modifie : la seule voie est `POST /definitions/:versionId/…`
  (§ 5.8, § 5.9, § 5.10, § 5.11), et chaque route passe par la porte SQL de § 4.20.

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
| Un booléen qui tranche seul | `resolveSemanticState()` est une fonction nommée de `seuil-et-etat`, testée sur ses deux côtés, et elle est la **seule** à la porter (§ 3.3) | Test unitaire sur la fonction, pas sur le rendu |
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

Le dépôt (ADR-8). **Le contenu d'une ligne est immuable** : ni `UPDATE` ni `DELETE` ne
sont accordés au rôle applicatif sur les colonnes de définition.

> **Deux colonnes font exception, et c'est une décision écrite, pas un oubli**
> (ADR-8 révisé, § 7) : `status` et `published_at`. Elles portent le **cycle de vie**,
> pas la définition, et elles ne peuvent pas faire autrement : le journal
> `signature_event` (§ 4.8) est append-only, donc il ne peut pas réécrire la ligne
> qu'il décrit. Sans ces deux colonnes, le cycle de vie n'existerait nulle part — et
> alors `in_review`, `signed` et `published` seraient des états sans producteur, ce
> qui rendrait `POST /definitions/:versionId/signature` (§ 5.8) incapable de jamais
> produire une première signature. Le rôle applicatif ne reçoit donc `UPDATE`
> **que** sur ce couple de
> colonnes ; `DELETE` ne l'est jamais. La projection est **adossée à un acte** : un
> `UPDATE` de `status` sans acte correspondant dans `signature_event` est refusé en
> base (§ 4.20, SQL). `status` et `published_at` sont donc une **projection du
> journal**, pas une deuxième vérité — et le journal garde la main.

| Champ | Type | Nullable | Défaut | Contraintes | Description | Exemple |
|---|---|---|---|---|---|---|
| `definition_version_id` | `uuid` (PK) | non | `gen_random_uuid()` | — | Identifiant de version | `9b2e…` |
| `indicator_id` | `uuid` (FK) | non | — | → `indicator.indicator_id`, `ON DELETE RESTRICT` | Indicateur concerné | `3f1c…` |
| `version_no` | `integer` | non | — | ≥ 1 ; unique `(indicator_id, version_no)` | Rang de la version, croissant, jamais réattribué | `3` |
| `status` | `text` | non | `'draft'` | `draft` \| `in_review` \| `signed` \| `refused` \| `published` — **dérivé**, jamais écrit sans acte (§ 4.20) | Cycle de vie de la version ; **projection** de `signature_event` | `signed` |
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
| `published_at` | `timestamptz` | **oui** | `NULL` | ≥ `created_at` ; écrit **une seule fois**, jamais réécrit | Première publication : rend la signature non révocable (B26). Valeur = `occurred_at` de l'acte `publish` (§ 4.8) | `2026-09-26T08:30:00Z` |

> **`status` et `published_at` sont dérivés, au sens où `officiality` l'est (§ 4.5).**
> Ce ne sont pas des colonnes de commodité de lecture : ce sont les **seules** deux
> colonnes par lesquelles la projection du journal atterrit en base, parce que
> l'immuabilité d'ADR-8 porte sur le **contenu** de la version et que la base ne sait
> pas indexer une jointure sur un journal append-only aussi efficacement qu'une
> colonne. Elles sont donc l'unique exception nommée à ADR-8, et l'exception est
> **bornée, nommée et adossée à un acte** (§ 4.20). Le journal reste la source de
> vérité : une ligne ne peut pas dire `signed` sans qu'un acte `sign` existe.

#### 4.6.0 « Signable », défini une fois

Le mot **apparaissait deux fois dans ce document et n'y était défini nulle part**,
dont sur le **seul** chemin d'écriture du seuil. Les deux occurrences ne voulaient
pas dire la même chose :

- § 5.5, sur le corps de `POST /versions` : *« Rejeté si la version n'est pas
  signable »* — donc « assez complète pour être signée » ;
- ADR-7 révisé, sur le signataire : *« un indicateur sans signataire désigné n'est
  pas signable »* — donc « il existe quelqu'un pour la signer ».

Les deux lectures ont des conséquences **opposées**. Si « signable » veut dire
« signée », alors `definition_threshold` n'est **jamais** remplie — car § 5.4 et
§ 5.5 créent toujours une version `draft` — et le `threshold` que tous les contrats
de lecture rendent vaut `null` en permanence. Si « signable » veut dire « assez
complète pour être signée », alors le `409 DEFINITION_NOT_SIGNED` de § 5.10 est
**inatteignable** : la version est par définition prête à être signée.

**Définition, et elle est dérivée, pas un statut de plus :**

> Une version est **signable** quand elle est `in_review` **et** que son
> indicateur a un `designated_signer_actor_id` nommé dans l'annuaire, distinct de
> l'auteur de la version.

Trois conséquences, et chacune ferme un trou au lieu d'en ouvrir un :

1. **`POST /versions` accepte toujours un `threshold`.** La version qu'il crée est
   `draft`, donc jamais signable — et si le champ était rejeté sur ce critère, le
   seuil serait **perdu à l'écriture** alors qu'il est versionné *avec* la
   définition (B14) et ne devient un seuil qu'à la signature (B11). Rejeter ici
   rendait le `threshold` de tous les contrats de lecture `null` en permanence.
2. **Le `409 DEFINITION_NOT_SIGNED` de § 5.10 reste atteignable** : publier exige
   `signed`, ce qui est une condition **plus forte** que signable. Signable n'est
   pas signé, et l'inverse non plus.
3. **Un signataire non nommé est un blocage, pas une rejection de champ.** Il
   porte sur l'indicateur, pas sur la version : `F-001`, un défaut connu et non
   promu, pas une ambiguïté de vocabulaire.

« Signable » ne s'applique **qu'ici**. Ailleurs, le document dit `in_review`,
`signé` ou `publié` — des états, donc vérifiables.

#### 4.6.1 Le cycle de vie d'une version, et qui l'écrit

Chaque flèche a **un acte nommé** dans `signature_event` et **un endpoint** dans § 5.
Il n'existe aucun chemin qui change `status` autrement.

| # | Transition | Acte (`signature_event.act`) | Qui | Écriture de `published_at` | Endpoint |
|---|---|---|---|---|---|
| 1 | `draft` → `in_review` | `submit` | l'**auteur de la version** ou le **propriétaire** de l'indicateur | — | § 5.9 |
| 2 | `in_review` → `draft` (retrait de la soumission) | `revoke` référençant l'acte `submit` | l'auteur de la version ou le propriétaire | — | § 5.9 |
| 3 | `in_review` → `signed` | `sign` | le **signataire désigné**, `≠` l'auteur (ADR-1) | — | § 5.8 |
| 4 | `in_review` → `refused` | `refuse` | le signataire désigné, motif obligatoire | — | § 5.8 |
| 5 | `signed` → `published` | `publish` | le **propriétaire** de l'indicateur | **oui** — `= occurred_at` de l'acte | § 5.10 |
| 6 | `signed` → `draft` (retrait de la signature) | `revoke` référençant l'acte `sign` | l'auteur de la version ou le propriétaire | **non** — conservée telle quelle | § 5.11 |

Trois règles, et elles sont toutes des conséquences, pas des choix :

- **Aucun contenu n'est modifiable, à aucun statut.** Même en `draft`. Une correction
  passe par une nouvelle version (B1, ADR-8). Le retour de `in_review` à `draft` ne
  rend donc **pas** la version éditable : il la rend re-soumissible, ce qui est tout
  autre chose.
- **`refused` est terminal** pour cette version, et c'est une conséquence du gel :
  le signataire a refusé cette formule, or le contenu ne peut plus changer (B1,
  ci-dessus). Il n'y a donc rien à corriger sur place — il faut une nouvelle version.
  En revanche **une signature révoquée ne rend pas la version terminale** : elle la
  rend `draft`, donc re-soumissible puis re-signable.
- **`published` est terminal et verrouille.** C'est là que B26 mord : tant que
  `published_at IS NULL`, la signature reste révocable (§ 5.11) ; dès qu'il est écrit,
  elle ne l'est plus et l'API le dit. La publication écrit aussi
  `indicator.current_signed_version_id` (§ 4.5) — **dans la même transaction**, sinon
  il existerait un instant où une version est publiée et ne porte pas la valeur (B4).

> **Pourquoi la révocation ramène à `draft` et non à un état `revoked`.** B26, qui
> est la règle approuvée, dit *« La signature est révocable par l'auteur de la
> version jusqu'à sa première publication »*. Elle parle d'un **droit de
> retrait**, pas d'un état du cycle de vie. Une version qui se nomme d'état
> `revoked` ajoute une terminalité que le PRD n'a jamais demandée, et cette
> terminalité a un prix concret : l'historique d'une formule porte deux signatures
> — la révoquée puis la nouvelle — et la règle « un état terminal ne se rejoue
> pas » les rend contradictoires.
>
> Ce prix est **imaginaire**, et c'est B22 qui le démonte : B22 porte sur les
> **valeurs** (« une nouvelle version ne réécrit pas l'historique des valeurs »),
> pas sur les signatures. Or le journal est **append-only** (§ 4.8) : il conserve
> `sign`, puis `revoke`, puis `sign`. Rien n'est réécrit, donc rien n'est
> contradictoire — la trace montre une **séquence**, ce qui est exactement ce
> qu'un journal doit montrer. Une version qui ne peut pas être re-signée perd donc
> la seule chose que l'audit d'une décision de gestion demande : **la suite**.

> **Pourquoi la publication est un acte et non une dérivation.** On pourrait dériver
> `published` de « il existe un acte `sign` et `indicator.current_signed_version_id`
> pointe dessus ». Ce serait une erreur, et B26 la nomme : le verrou porte sur
> `published_at`, donc sur un **horodatage**, et un horodatage ne peut pas être une
> fonction du temps courant. Dérivé de `current_signed_version_id`, il changerait
> **à chaque déplacement du pointeur** : révoquer une version, en publier une autre,
> réécrirait rétroactivement la date de publication de la première et
> **débloquerait** une signature que B26 veut verrouillée. Un acte a un auteur, une
> date, et ne se réécrit pas : c'est le seul des deux candidats qui peut porter un
> verrou.

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

### 4.8 `signature_event` — le journal du cycle de vie *(PostgreSQL, append-only)*

Le nom de la table dit `signature` parce que c'est **la signature** qui est
l'enjeu ; le contenu, lui, couvre tout le cycle de vie, parce qu'un seul journal
append-only est la seule façon de garder `status` et `published_at` (§ 4.6) adossés
à un acte, et donc contestables. `revoke` **référence** l'acte qu'il annule au lieu
de le modifier : la trace reste complète (B26).

Cinq actes, et **chacun a un producteur nommé** — c'est la table qui ferme le trou
« un état sans écrivain » :

| Acte | Porté par | Pourquoi il existe | Écrit `published_at` |
|---|---|---|---|
| `submit` | l'auteur de la version ou le propriétaire | sans lui, `in_review` n'a pas de producteur et § 5.8 répond `409` pour toujours | non |
| `sign` | le signataire désigné | la signature (B2, ADR-1) | non |
| `refuse` | le signataire désigné | le refus motivé est une trace, pas un silence | non |
| `revoke` | l'auteur ou le propriétaire | retire **un `submit`** (retour à `draft`) ou **un `sign`** (retour à `draft`) | non — et **jamais** réécrire un `published_at` déjà posé |
| `publish` | le propriétaire de l'indicateur | pose `published_at`, donc **pose le verrou B26** | **oui** |

> **`revoke` a deux cibles, pas deux verbes.** Retirer une soumission et révoquer
> une signature sont le même geste — « on retire ce qui avait été accordé » — et
> servent la même mécanique : un acte append-only qui référence l'acte annulé. Un
> cinquième verbe (`withdraw`) aurait ajouté une colonne (`withdraws_event_id`),
> un deuxième chemin de retraction, et une deuxième arête dans le graphe des
> contradictions possibles. Un seul verbe, deux cibles autorisées, une seule
> contrainte : l'acte visé est `sign` ou `submit`, **jamais** `refuse`, **jamais**
> `publish`, **jamais** un autre `revoke`.

| Champ | Type | Nullable | Défaut | Contraintes | Description | Exemple |
|---|---|---|---|---|---|---|
| `signature_event_id` | `uuid` (PK) | non | `gen_random_uuid()` | — | Identifiant de l'acte | `4a11…` |
| `definition_version_id` | `uuid` (FK) | non | — | → `definition_version`, `ON DELETE RESTRICT` | Version visée | `9b2e…` |
| `actor_id` | `text` (FK) | non | — | → `actor.actor_id` | Acteur | `00u77cd1fe` |
| `act` | `text` | non | — | `submit` \| `sign` \| `refuse` \| `revoke` \| `publish` | Nature de l'acte | `sign` |
| `revokes_event_id` | `uuid` (FK) | **oui** | `NULL` | → `signature_event` ; requis si et seulement si `act = 'revoke'` ; la cible est `sign` ou `submit` | Acte retiré | `4a10…` |
| `reason` | `text` | **oui** | `NULL` | requis si `act ∈ {refuse, revoke}` ; 1..500 car. | Motif du refus, du retrait ou de la révocation | `périmètre à préciser` |
| `occurred_at` | `timestamptz` | non | `now()` | — | Horodatage de l'acte (B2 « signature horodatée ») ; **source** de `published_at` pour `publish` | `2026-09-26T08:12:44Z` |

**Contraintes d'intégrité, en base et non en application** (ADR-1) :

```sql
-- 1. L'auto-signature est impossible, y compris en cas de bug d'interface.
--    La règle porte sur les actes d'ATTESTATION (sign, refuse) : c'est là que
--    l'auteur ne peut pas se mettre en face de lui-même. Elle ne porte pas sur
--    `submit` ni sur `publish`, que l'auteur et le propriétaire font par nature
--    (B2 : l'auteur ne signe pas, il ne soumet ni ne publie).
--
--    **Pourquoi un trigger et pas un `CHECK`.** Cette version était écrite
--    `ADD CONSTRAINT signer_is_not_author CHECK (… actor_id <> (SELECT
--    author_actor_id FROM definition_version WHERE …))`. **PostgreSQL refuse une
--    sous-requête dans un `CHECK`** : la contrainte doit être évaluable sur la
--    ligne seule, sans lire une autre table. La migration échouait donc à la
--    création, et la porte d'ADR-1 n'existait pas.
--
--    Ce n'était pas visible à la relecture : la contrainte était écrite,
--    commentée, numérotée, et justifiée par une décision d'architecture. Elle
--    n'a été vue que le jour où `ddl-exec` l'a **exécutée**.
--
--    `DEFERRABLE INITIALLY DEFERRED` parce que l'acte et la ligne qu'il vise
--    sont écrits dans la même transaction, dans un ordre que le trigger ne
--    contrôle pas.
CREATE OR REPLACE FUNCTION signature_is_not_the_author() RETURNS trigger AS $guard$
DECLARE author_id text;
BEGIN
  IF NEW.act NOT IN ('sign','refuse') THEN RETURN NULL; END IF;
  SELECT author_actor_id INTO author_id
    FROM definition_version WHERE definition_version_id = NEW.definition_version_id;
  IF author_id IS NOT NULL AND NEW.actor_id = author_id THEN
    RAISE EXCEPTION 'auto-signature : l''auteur % ne peut pas attester sa propre version', NEW.actor_id
      USING ERRCODE = 'check_violation';
  END IF;
  RETURN NULL;
END $guard$ LANGUAGE plpgsql;

CREATE CONSTRAINT TRIGGER signer_is_not_author
  AFTER INSERT OR UPDATE ON signature_event
  DEFERRABLE INITIALLY DEFERRED
  FOR EACH ROW EXECUTE FUNCTION signature_is_not_the_author();
-- 2. Le motif est obligatoire pour un refus, et pour un retrait.
ALTER TABLE signature_event ADD CONSTRAINT refusal_has_reason CHECK (
  act NOT IN ('refuse','revoke') OR (reason IS NOT NULL AND length(btrim(reason)) > 0)
);
-- 3. Un `revoke` référence un `sign` ou un `submit` — jamais un refus, jamais
--    une publication, jamais un autre `revoke`. C'est ce qui rend le cycle
--    de vie de § 4.6.1 non cyclable en base, pas seulement dans le code.
--    **La clause `WHEN` n'est pas un détail, c'est toute la correction.** Ce trigger
--    était déclaré `AFTER INSERT ON signature_event` **sans `WHEN`**, alors que la
--    fonction exige que `revokes_event_id` pointe un acte `sign` ou `submit`. Or
--    `revokes_event_id` est `NULL` pour tout acte qui n'est pas un `revoke` — c'est
--    la règle de la colonne elle-même. Le trigger s'exécutait s'exécutait sur les
--    **cinq** actes et rejetait les quatre autres : `submit`, `sign`, `refuse` et
--    `publish` étaient **impossibles à écrire**.
--
--    Donc `in_review` n'avait pas de producteur, la signature ne pouvait pas
--    exister, `published_at` ne pouvait pas être posé : tout le cycle de vie était
--    inatteignable. Et le commentaire juste au-dessus annonçait la règle
--    (*« la cible est `sign` ou `submit`, jamais `refuse`, jamais `publish` »*) —
--    l'intention était écrite, juste pas appliquée au bon ensemble.
--
--    Trouvé en déclarant les quatre gardes de § 4.21, pas en relisant : le trigger
--    était correct en apparence, commenté, numéroté, et justifié.
CREATE FUNCTION revoke_targets_a_legal_act() RETURNS trigger AS $$
DECLARE target text;
BEGIN
  SELECT act INTO target FROM signature_event WHERE signature_event_id = NEW.revokes_event_id;
  IF target IS DISTINCT FROM 'sign' AND target IS DISTINCT FROM 'submit' THEN
    RAISE EXCEPTION 'revoke ne peut viser que sign ou submit, pas %', coalesce(target,'<inconnu>');
  END IF;
  RETURN NEW;
END $$ LANGUAGE plpgsql;
CREATE CONSTRAINT TRIGGER revoke_target_is_legal
  AFTER INSERT ON signature_event DEFERRABLE INITIALLY DEFERRED
  FOR EACH ROW WHEN (NEW.act = 'revoke')
  EXECUTE FUNCTION revoke_targets_a_legal_act();
-- 4. Au plus une signature active par version et par signataire.
CREATE UNIQUE INDEX one_active_signature_per_signer
  ON signature_event (definition_version_id, actor_id)
  WHERE act = 'sign';
-- 5. Une version ne peut être publiée qu'une fois : c'est B26 sous forme de contrainte.
CREATE UNIQUE INDEX one_publish_per_version
  ON signature_event (definition_version_id) WHERE act = 'publish';
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
-- C'est l'acte `publish` de § 4.8 qui déplace ce pointeur, dans la MÊME transaction
-- que l'écriture de `published_at` : jamais l'un sans l'autre.

-- Un dashboard ne référence que des indicateurs officiels au moment du partage.
-- Vérifié à l'écriture ET à la lecture (E17) : un indicateur qui perd son statut
-- officiel ne déclenche aucun retrait (E17), seulement une perte de caractère officiel.

-- Le `owner_picker` et le `designated_signer` référencent toujours `actor`
-- (jamais un texte libre) : d'où les deux FK et non deux `text`.
-- Et `designated_signer_actor_id <> owner_actor_id` est un CHECK sur `indicator` :
-- l'auteur ne peut pas se désigner lui-même comme signataire.
```

**ADR-8 révisé — l'exception, bornée et contrôlée.** C'est le SQL qui rend la
décision du § 4.6 et de l'ADR-8 une propriété vérifiable, pas une intention. Trois
portes, et une seule porte qui s'ouvre :

```sql
-- PORTE 1 — les droits accordés au rôle applicatif.
--   INSERT sur la version (elle est créée), et UPDATE sur DEUX colonnes.
--   Jamais DELETE, jamais UPDATE sur le contenu.GRANT INSERT                        ON definition_version TO amberline_app;
GRANT UPDATE (status, published_at) ON definition_version TO amberline_app;
REVOKE DELETE                       ON definition_version FROM amberline_app;
GRANT INSERT                        ON signature_event   TO amberline_app;  -- append-only
REVOKE UPDATE, DELETE               ON signature_event   FROM amberline_app;

-- PORTE 2 — un UPDATE qui déborde le couple de cycle de vie est refusé en base.
--   La porte 1 rend l'accès étroite ; celle-ci rend la dérive impossible, y
--   compris par un script de reprise ou un `SET ROLE` bien intentionné.
CREATE FUNCTION definition_content_is_frozen() RETURNS trigger AS $$
BEGIN
  IF NEW.formula             IS DISTINCT FROM OLD.formula
  OR NEW.scope_expr          IS DISTINCT FROM OLD.scope_expr
  OR NEW.label               IS DISTINCT FROM OLD.label
  OR NEW.grain               IS DISTINCT FROM OLD.grain
  OR NEW.unit                IS DISTINCT FROM OLD.unit
  OR NEW.target_value        IS DISTINCT FROM OLD.target_value
  OR NEW.target_unit         IS DISTINCT FROM OLD.target_unit
  OR NEW.target_confirmed_at IS DISTINCT FROM OLD.target_confirmed_at
  OR NEW.change_note         IS DISTINCT FROM OLD.change_note
  OR NEW.author_actor_id     IS DISTINCT FROM OLD.author_actor_id
  OR NEW.indicator_id        IS DISTINCT FROM OLD.indicator_id
  OR NEW.version_no          IS DISTINCT FROM OLD.version_no
  OR NEW.created_at          IS DISTINCT FROM OLD.created_at THEN
    RAISE EXCEPTION 'definition_version est un dépôt (ADR-8) : le contenu est immuable';
  END IF;
  RETURN NEW;
END $$ LANGUAGE plpgsql;
CREATE TRIGGER definition_version_content_frozen
  BEFORE UPDATE ON definition_version
  FOR EACH ROW EXECUTE FUNCTION definition_content_is_frozen();

-- PORTE 3 — le cycle de vie n'existe que s'il est adossé à un acte.
--   `status` et `published_at` ne sont donc PAS une deuxième vérité : ils sont
--   la projection de `signature_event`, et cette projection est refusée
--   dès qu'aucun acte ne la justifie.
CREATE FUNCTION lifecycle_needs_an_act() RETURNS trigger AS $$
DECLARE required_act text;
BEGIN
  -- **Les deux gardes sont independantes, et c'est le point.**
  --
  -- Une version precedente commencait par `IF NEW.status = OLD.status THEN
  -- RETURN NEW` : la garde `published_at` etait ecrite plus bas, donc
  -- **inatteignable** pour toute requete qui ne changeait pas `status`. Or le
  -- trigger est `BEFORE UPDATE OF status, published_at` : il se declenchait, puis
  -- ne faisait rien. `UPDATE definition_version SET published_at = NULL` sur une
  -- version `published` -- `status` inchange -- sortait au premier `RETURN` et
  -- **deliait silencieusement le verrou B26**. Le document affirmait a deux
  -- endroits que ce refus a lieu « en base ».
  --
  -- La garde de `published_at` est donc **la premiere**, et elle ne depend que de
  -- `published_at` -- jamais du statut. Une garde qui en protege une autre n'est
  -- pas une garde : c'est une instruction placee au mauvais endroit.
  IF NEW.published_at IS DISTINCT FROM OLD.published_at THEN
    IF OLD.published_at IS NOT NULL THEN
      RAISE EXCEPTION 'published_at ne se reecrit pas : B26 verrouille a la premiere publication';
    END IF;
    IF NEW.published_at IS NULL OR NEW.status <> 'published' THEN
      RAISE EXCEPTION 'published_at ne se pose que par un acte publish, et ne se repose jamais';
    END IF;
    IF NEW.published_at IS DISTINCT FROM (
         SELECT occurred_at FROM signature_event
          WHERE definition_version_id = NEW.definition_version_id AND act = 'publish') THEN
      RAISE EXCEPTION 'published_at doit etre l''occurred_at de l''acte publish';
    END IF;
  END IF;

  -- Ensuite, et seulement ensuite, la transition : une transition de statut doit
  -- s'adosser a un acte nomme. `revoked` n'est pas un statut : la revocation est
  -- un acte, et elle ramene la version en `draft` (4.6.1).
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    required_act := CASE NEW.status
      WHEN 'in_review' THEN 'submit'  WHEN 'signed'   THEN 'sign'
      WHEN 'refused'    THEN 'refuse'  WHEN 'published' THEN 'publish'
      WHEN 'draft'      THEN 'revoke'  -- retrait de soumission ou de signature
    END;                                          -- 'draft' n'a pas d'acte :
                                                  -- porte 2 l'interdit de toute facon
    IF NOT EXISTS (SELECT 1 FROM signature_event
                    WHERE definition_version_id = NEW.definition_version_id
                      AND act = required_act) THEN
      RAISE EXCEPTION '% -> % sans acte % dans signature_event',
        OLD.status, NEW.status, coalesce(required_act, '<inconnu>');
    END IF;
  END IF;
  RETURN NEW;
END $$ LANGUAGE plpgsql;
CREATE TRIGGER definition_version_lifecycle_needs_an_act
  BEFORE UPDATE OF status, published_at ON definition_version
  FOR EACH ROW EXECUTE FUNCTION lifecycle_needs_an_act();

ALTER TABLE definition_version ADD CONSTRAINT definition_status_domain CHECK (
  status IN ('draft','in_review','signed','refused','published')
);
```


### 4.21 Preuves que les portes tiennent

**Une porte ne se relit pas, elle s'essaie.** Les quatre déclencheurs de ce document
sont des portes, et aucune n'était essayée : `ddl-exec guards` rendait `pass` avec
`guards_declared: 0` et le disait dans la même phrase. Une porte non écrite n'est
pas testée — ni par un script, ni par un relecteur, ni par elle-même.

Chacune des quatre tentatives ci-dessous **doit être refusée**. Si l'une passe, la
porte n'est pas une porte. Le contrôle les exécute :

```bash
node "$FORGE/scripts/ddl-exec.js" guards <anchor>
```

*(`published_at` est un `timestamptz` ; on le pose avec `occurred_at` pour que la
garde « `published_at` = `occurred_at` de l'acte `publish` » soit satisfaite par
elle-même, et non par une coïncidence d'horloge.)*

**Données de pose** — deux versions et quatre actes, posés dans l'ordre du cycle :

```sql
INSERT INTO actor (actor_id, display_name, email, is_signer, directory_synced_at)
VALUES ('a1', 'Auteur', 'a@example.test', false, '2026-09-01T00:00:00Z'),
       ('a2', 'Signataire', 's@example.test', true, '2026-09-01T00:00:00Z'),
       ('a3', 'Propriétaire', 'p@example.test', false, '2026-09-01T00:00:00Z');

INSERT INTO indicator (indicator_id, slug, label, warehouse_key,
                       owner_actor_id, designated_signer_actor_id)
VALUES ('11111111-1111-1111-1111-111111111111', 'taux-service',
        'Taux de service', 'kpi.taux', 'a3', 'a2');

-- v1 : signée, non publiée
INSERT INTO definition_version (definition_version_id, indicator_id, version_no,
       status, author_actor_id, label, formula, scope_expr, grain, unit, change_note)
VALUES ('20000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 1,
        'signed', 'a1', 'v1', 'sum(x)', 'teams = ALL', 'month', 'EUR', 'premiere version');

INSERT INTO signature_event (signature_event_id, definition_version_id, actor_id, act, occurred_at)
VALUES ('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'a1', 'submit', '2026-09-20T09:00:00Z'),
       ('30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', 'a2', 'sign',   '2026-09-21T09:00:00Z');

-- v2 : publiée, donc verrouillée (B26)
INSERT INTO definition_version (definition_version_id, indicator_id, version_no,
       status, author_actor_id, label, formula, scope_expr, grain, unit, change_note, published_at)
VALUES ('20000000-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 2,
        'published', 'a1', 'v2', 'sum(y)', 'teams = ALL', 'month', 'EUR', 'seuil ajoute', '2026-09-22T09:00:00Z');

INSERT INTO signature_event (signature_event_id, definition_version_id, actor_id, act, occurred_at)
VALUES ('30000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000002', 'a1', 'submit', '2026-09-21T10:00:00Z'),
       ('30000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000002', 'a2', 'sign',   '2026-09-21T11:00:00Z'),
       ('30000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000002', 'a3', 'publish','2026-09-22T09:00:00Z');
```

**Porte 1 — l'auto-signature est impossible, y compris par un script** (ADR-1) :

```sql
-- forge:ddl-refuse
-- L'auteur de la version ne peut pas l'attester lui-même. Le porte tournait au
-- début sur un `CHECK` à sous-requête, que PostgreSQL refuse **à la création** :
-- la contrainte n'existait pas. Elle est désormais un `CONSTRAINT TRIGGER`
-- différable, et cette tentative doit être refusée.
INSERT INTO signature_event (definition_version_id, actor_id, act)
VALUES ('20000000-0000-0000-0000-000000000001', 'a1', 'sign');
```

**Porte 2 — `published_at` ne se réécrit pas** (B26, le verrou) :

```sql
-- forge:ddl-refuse
-- C'est le défaut que la boucle FastTrack n'a pas vu. Le trigger commençait par
-- `IF NEW.status = OLD.status THEN RETURN NEW`, donc cette requête — qui ne touche
-- QUE `published_at` — sortait au premier RETURN et **déliait le verrou**. Elle
-- passe désormais par la garde, qui est la première et ne dépend que de
-- `published_at`.
UPDATE definition_version SET published_at = NULL
 WHERE definition_version_id = '20000000-0000-0000-0000-000000000002';
```

**Porte 3 — une signature n'est révocable qu'avant la première publication** (B26) :

```sql
-- forge:ddl-refuse
-- Rouvrir une version `published` est impossible : B26 ne permet le retrait que
-- jusqu'à la première publication. Au-delà, seule une nouvelle version puis une
-- nouvelle signature peut remplacer la formule.
UPDATE definition_version SET status = 'draft'
 WHERE definition_version_id = '20000000-0000-0000-0000-000000000002';
```

**Porte 4 — `status` ne bouge pas sans acte nommé** (§ 4.6.1) :

```sql
-- forge:ddl-refuse
-- Aucun endpoint ne change `status` implicitement : la transition doit s'adosser
-- à un acte dans `signature_event`. v1 est `signed` et porte un acte `sign`, mais
-- **aucun acte `publish`** : la publication ne peut donc pas se déduire du fait
-- que la version est signée. C'est exactement le piège que le cycle de vie refuse
-- — et il faut l'avoir essayé pour le savoir.
UPDATE definition_version SET status = 'published'
 WHERE definition_version_id = '20000000-0000-0000-0000-000000000001';
```

> **Ce que ces quatre tentatives valent.** Elles ne prouvent pas que le modèle est
> bon : elles prouvent que **les portes que ce document écrit refusent ce qu'il
> dit qu'elles refusent**. C'est exactement la propriété qui manquait, et elle
> n'est vérifiable que par exécution — les trois défauts de ce document étaient
> invisibles à la relecture, et le quatrieme ne l'est plus.



---

## 5. Contrats API

**Conventions transverses, valables pour les 21 endpoints** :

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
  `/submission`, `/publication`, `/signature`, `/exports`, `/dashboards`.
- **Journaux** : toute lecture de valeur journalise une entrée `access_log`, y compris
  quand la réponse est `403`, `404` ou `empty` (B10).

### 5.0 Le cycle de vie d'une version, en un coup d'œil

`status` et `published_at` (§ 4.6) ne sont écrits par aucun endpoint implicitement :
**chaque transition a un acte nommé et un endpoint nommé**. C'est la table qui rend
le cycle complet ; les sections la détaillent. Sans elle, `in_review` serait un état
sans producteur et § 5.8 ne pourrait jamais produire une première signature.

```
   § 5.5            § 5.9                § 5.8                 § 5.10
  draft ──────submit──────▶ in_review ───sign/refuse─────▶ signed ──publish──▶ published
    ▲                          │              │                                 │
    ├────── revoke (submit) ───┘              │                                 │
    └────── revoke (sign) ◀───────────────────┘                                 │
                (re-soumissible : le gel ne dépend pas du statut)                │
                                                                       B26 : verrou
                                                                       de révocation
                                                                       au-delà, une
                                                                       nouvelle version
```

`revoked` **n'est pas un statut** : la révocation est un **acte**, journalisé, qui
ramène la version en `draft`. Le diagramme n'a donc pas de terme mort — il n'y a
que `draft`, `in_review`, `signed`, `refused` et `published`, et le seul état
irréversible est `published` (B26). Voir § 4.6.1 pour pourquoi une signature
révoquée ne rend pas la version terminale.

| Transition | Acte journalisé | Endpoint | Qui |
|---|---|---|---|
| `draft` → `in_review` | `submit` | § 5.9 | auteur de la version **ou** propriétaire |
| `in_review` → `draft` | `revoke` sur le `submit` | § 5.9 | auteur **ou** propriétaire |
| `in_review` → `signed` | `sign` | § 5.8 | signataire désigné, `≠` auteur (ADR-1) |
| `in_review` → `refused` | `refuse` | § 5.8 | signataire désigné, motif obligatoire |
| `signed` → `published` | `publish` | § 5.10 | propriétaire de l'indicateur |
| `signed` → `draft` | `revoke` sur le `sign` | § 5.11 | auteur **ou** propriétaire |

> **409 est réservé à ce qui empêche réellement de répondre.** Un propriétaire inactif
> (B17, E17) ne l'est pas : c'est un **état rendu** dans un `200`, avec
> `officiality: "stale_owner"`, sur § 5.3, § 5.6, § 5.7 et § 5.13. Il reste `409` sur
> les **actes d'écriture** — § 5.8, § 5.9, § 5.10 — parce qu'y écrire serait
> faire hériter un nouveau dossier d'un propriétaire qui n'existe plus. Voir § 5.22.

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
      "semantic_state": "in_target",
      "threshold": { "comparison": "below", "threshold_value": 1250000,
                     "label": "CA par client hors cible", "defined_at": "2026-09-24T10:13:00Z" },
      "computed_at": "2026-09-29T05:00:00Z", "source_ref": "marts_sales_v42",
      "version_label": "v3" }
  ],
  "excluded": []
}
```

| Champ de `items[]` | Type | Nullable | Origine | Description |
|---|---|---|---|---|
| `officiality` | `official` \| `provisional` \| `stale_owner` \| `target_missing` | non | **dérivé** à la lecture (§ 4.5) | `stale_owner` si le propriétaire est inactif (B17) — c'est un `200`, pas un refus |
| `target` | `{ value, delta, confirmed }` | oui | `definition_version.target_*` | `null` ⇒ E16 « cible à reconfirmer » |
| `semantic_state` | `SemanticState` (§ 2.3) | non | **calculé par `seuil-et-etat`** (§ 3.3) | `in_target` \| `out_of_band` \| `target_missing` \| `not_applicable` |
| `threshold` | `IndicatorThreshold` (§ 2.3) | **oui** | `definition_threshold` de la **version signée** qui porte la valeur | `null` ⇔ cette version ne porte aucun seuil. Jamais un objet partiel (B11) |
| `computed_at` | ISO 8601 | **oui** | `warehouse_indicator_value.computed_at` | `null` ⇒ « fraîcheur inconnue » (B6) — jamais l'heure de la requête |
| `source_ref` | `string` | non | `warehouse_indicator_value.source_ref` | Identifiant de la matérialisation, imprimé tel quel |

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
  "threshold": { "comparison": "below", "threshold_value": 1250000,
                 "label": "CA par client hors cible", "defined_at": "2026-09-24T10:13:00Z" },
  "computed_at": "2026-09-29T05:00:00Z",
  "source_ref": "marts_sales_v42",
  "resolved_scope": { "teams": ["COMMERCIAL"], "period": { "from": "2026-09-01", "to": "2026-09-30", "grain": "month" }, "segment": {} }
}
```

`threshold` est ici la forme `IndicatorThreshold` de § 2.3, à l'identique de § 5.2 et
§ 5.13 : **la valeur, le sens, la date**. `null` quand la version visée ne porte aucun
seuil — et `null` veut dire *« cette version ne déclare pas de seuil »*, pas *« le
seuil est inconnu »*. La ligne `threshold` du design system est obligatoire au MVP et
**interdite à la troncature** : c'est la raison d'être du champ. `defined_at` vient de
la source (§ 4.7), **jamais** de l'heure du poste (B5).

| Code | Condition | Message |
|---|---|---|
| 400 | Période incohérente | `"Période incohérente : `from` doit précéder `to`."` |
| 401 | Session absente ou expirée | `"Session absente ou expirée. Reconnectez-vous via le fournisseur d'identité."` |
| 403 | Indicateur connu mais hors périmètre : refus **connu** | `"Vous n'avez pas accès à l'équipe {missing}. Demandez l'accès à un responsable."` |
| 404 | Slug inexistant **ou** indicateur non officiel d'un tiers (B13 : invisible pour les autres) | `"Indicateur introuvable."` |
| 409 | — | *sans objet : un propriétaire inactif est un **état rendu**, pas un refus — voir la note ci-dessous. `409` reste réservé à ce qui empêche de répondre* |
| 422 | `version` inconnu pour cet indicateur, ou `teams` invalide | `"Version inconnue pour cet indicateur."` |
| 429 | Quota dépassé | `"Trop de consultations. Réessayez dans un instant."` |
| 500 | Panne interne | `"Erreur interne. Réessayez ; si le problème persiste, contactez l'administrateur."` |
| 503 | Entrepôt injoignable (E1) — `status: source_unavailable`, `last_known` renseigné si le cache a la valeur | `"Source indisponible. Dernière valeur connue affichée avec sa date de calcul."` |
| 504 | Dépassement du délai de 30 s sans réponse (E11) — `status: too_slow` | `"Calcul trop long. Dernière valeur connue affichée avec sa date de calcul."` |

> `computed_at: null` → l'interface affiche « fraîcheur inconnue » (B6). Le champ
> n'est **jamais** remplacé par l'heure de la requête.

> **B17 est un `200`, pas un `409`.** Un propriétaire qui a quitté l'entreprise
> n'empêche pas de **répondre** : il change ce qu'on répond. La réponse est donc
> `200`, avec `"officiality": "stale_owner"` et la valeur, sa date de calcul et son
> seuil comme si de rien n'était. Un `409` ici dirait au lecteur « ce que tu
> regardais n'existe pas », alors que le design system exige précisément le
> contraire : la tuile porte `stale_owner` et la mention « propriétaire inactif »
> (E17, `design-system.md` § 2). Le mot **consultable** est donc la spécification,
> pas une excuse dans un message d'erreur. `OWNER_INACTIVE` reste un `409` — et
> garde ce statut dans `ERROR_HTTP_STATUS` — mais **uniquement** sur les actes
> d'écriture des § 5.8, § 5.9 et § 5.10 (§ 5.22).

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
| `threshold` | objet | non | **Toujours accepté.** Il est versionné *avec* la définition (B14) et ne devient un seuil qu'à la signature (B11) — donc il ne se rejette pas sur une version `draft`, qui n'est d'ailleurs jamais signable (§ 4.6.0). Forme : `{ comparison, threshold_value, label }` |

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
{ "state": "created", "definition_version_id": "9b2e…", "version_no": 4,
  "status": "draft", "created_at": "2026-09-30T08:00:00Z" }
```

> `status: "draft"` est l'état **initial**, et ce § 5.5 est son **unique** producteur :
> une version naît en `draft` et nulle part ailleurs. Créer une version n'est pas la
> soumettre — la soumission est un acte distinct, avec son auteur, sa date et son
> endpoint (§ 5.9). Sans cette séparation, un contrôleur créerait un brouillon et le
> signataire le verrait apparaître sans qu'aucun des deux ait décidé de l'exposer.

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

> La version précédente reste consultable intacte : le contenu d'une version n'est
> jamais réécrit, à aucun statut (ADR-8 révisé, § 4.20). Une correction passe par une
> nouvelle version (B1, B22), y compris sur une version en `draft`.

### 5.6 `GET /api/v1/indicators/:slug/history` — historique signé (US-17)

- **Méthode** : GET · **Path** : `/api/v1/indicators/:slug/history` · **Auth** : session
- **Rate limit** : 60 req/min par session

**Requête** — path param `slug` ; query params `teams`, `from`, `to`, `grain`
(same shape que § 5.2).

**Réponse (succès)** :
```json
{
  "status": "ok",
  "officiality": "official",
  "versions": [
    { "version_label": "v3", "version_id": "9b2e…", "status": "published",
      "signed_at": "2026-09-26T08:12:44Z", "published_at": "2026-09-26T08:30:00Z",
      "signer": "Marc Delaunay", "value": 1184320.55, "unit": "EUR",
      "threshold": { "comparison": "below", "threshold_value": 1250000,
                     "label": "CA par client hors cible", "defined_at": "2026-09-24T10:13:00Z" },
      "computed_at": "2026-09-29T05:00:00Z", "source_ref": "marts_sales_v42",
      "change_note": "les lignes sous-traitées ne sont plus comptées" },
    { "version_label": "v2", "version_id": "7c11…", "status": "draft",
      "signed_at": "2026-08-14T09:02:00Z", "published_at": null,
      "signer": "Marc Delaunay", "value": 1204510.00, "unit": "EUR",
      "threshold": null,
      "computed_at": "2026-09-29T05:00:00Z", "source_ref": "marts_sales_v42",
      "change_note": "périmètre élargi à l'Europe" }
  ],
  "diff": { "from": "v2", "to": "v3", "delta": -20189.45, "delta_pct": -1.68,
            "explanation": "les lignes sous-traitées ne sont plus comptées" }
}
```

| Champ | Type | Nullable | Origine | Description |
|---|---|---|---|---|
| `officiality` | `official` \| `provisional` \| `stale_owner` \| `target_missing` | non | **dérivé** à la lecture (§ 4.5) | `stale_owner` si le propriétaire est inactif (B17) — c'est un `200` |
| `versions[].status` | domaine `definition_version.status` | non | § 4.6 | `published` \| `signed` \| `refused` : ce que l'historique **montre** de la version, pas ce qu'il en pense (B22). Un `revoke` est un **acte** du journal, pas un statut : il se lit dans `events[]`, pas ici |
| `versions[].published_at` | ISO 8601 | **oui** | `definition_version.published_at` | `null` ⇒ la signature était **révocable** à l'époque ; renseigné ⇒ verrou B26. C'est la seule chose qui distingue une signature révoquée d'une signature jamais publiée |
| `versions[].threshold` | `IndicatorThreshold` (§ 2.3) | **oui** | `definition_threshold` **de cette version** | Chaque version signée porte **son** seuil (B11) ; `null` si cette version n'en déclare pas |

| Code | Condition | Message |
|---|---|---|
| 400 | Période incohérente | `"Période incohérente : `from` doit précéder `to`."` |
| 401 | Session absente ou expirée | `"Session absente ou expirée. Reconnectez-vous via le fournisseur d'identité."` |
| 403 | Lecteur autorisé sur la valeur courante mais pas sur l'historique demandé | `"L'historique demandé excède votre périmètre."` |
| 404 | Slug inconnu ou non signé | `"Historique introuvable."` |
| 409 | — | *sans objet : propriétaire inactif = `200` avec `officiality: "stale_owner"` (B17, E17). L'historique d'une signature **révoquée** reste intégralement lisible, pour la même raison* |
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
>
> **B17 est un état rendu ici aussi**, et il est d'autant moins discutable sur cet
> écran que sur les autres : un historique de signatures dont on refuse l'affichage
> parce que le propriétaire est parti serait la négation de B10 et de B22. `200`,
> `officiality: "stale_owner"`, et toutes les versions — signées, révoquées, refusées —
> restent là, avec leur signataire et leur date.

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
  "officiality": "official",
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
| 409 | — | *sans objet : propriétaire inactif = `200` avec `officiality: "stale_owner"` (B17). B15 exige que le drill-down serve le **même** périmètre et les mêmes droits que l'écran d'origine : il ne peut pas être plus restrictif* |
| 422 | `parent` mal formé, ou `teams` invalide | `"Paramètres de décomposition invalides."` |
| 429 | Quota `decomposition` dépassé | `"Trop de décompositions. Réessayez dans un instant."` |
| 500 | Panne interne | `"Erreur interne. Réessayez ; si le problème persiste, contactez l'administrateur."` |
| 503 | Entrepôt injoignable (E1) | `"Source indisponible. Les dernières lignes connues restent affichées, datées."` |
| 504 | Délai dépassé (E11) | `"Décomposition trop longue. Réessayez sur une période plus courte."` |

> `total_shown` et `total_available` sont égaux par construction : le scope étant
> injecté dans la requête, il n'existe pas de total qui compterait plus de lignes que
> le lecteur n'a le droit d'en voir. Le total affiché reste cohérent avec ce qui est
> visible (E10).
>
> `officiality` est là pour que le drill-down **n'invente pas** son propre statut
> officiel : il transporte celui que § 5.3 a dérivé. Le drill-down ne recolorie
> rien (B15 rend les lignes, pas un état) — mais il doit pouvoir dire « ce que tu
> descends n'est plus officiel », sinon B17 s'arrêterait à l'écran précédent.

### 5.8 `POST /api/v1/definitions/:versionId/signature` — signer, refuser (US-2)

- **Méthode** : POST · **Path** : `/api/v1/definitions/:versionId/signature` · **Auth** : session
- **Rate limit** : 20 req/min par session · **Idempotence** : `Idempotency-Key` requise

**Requête** — path param `versionId` (`uuid`) ; body :

| Paramètre | Type | Requis | Description |
|---|---|---|---|
| `act` | `sign` \| `refuse` | oui | Nature de l'acte. Les deux exigent une version **`in_review`** : c'est la seule façon d'entrer |
| `reason` | `string` | si `act = refuse` | 1..500 car. — obligatoire, sinon `422` |

**Précondition, et elle est désormais vérifiable** : la version doit être en `in_review`.
Ce statut est produit **exclusivement** par `POST /definitions/:versionId/submission`
(§ 5.9, acte `submit`) et n'a aucun autre producteur. Sans § 5.9, ce `409` serait la
seule réponse possible de ce endpoint, et le MVP ne produirait jamais sa première
signature — donc ni US-2, ni B2, ni ADR-1, ni B26, ni le jalon `T_première signature`
de `roadmap.md` § 1.1 (les trois jalons du MVP).

**Réponse (succès)** :
```json
{ "signature_event_id": "4a11…", "act": "sign", "definition_version_id": "9b2e…",
  "signed_at": "2026-09-26T08:12:44Z", "status": "signed", "published_at": null,
  "officiality": "provisional", "state": "revocable" }
```

> `state: "revocable"` et non `"locked"` au moment de la signature : la version vient
> d'être signée, `published_at` est `null`, donc B26 **laisse encore** la signature
> reprenable (§ 5.11). Elle ne devient `locked` qu'à la publication (§ 5.10). Un `sign`
> qui renvoyait `locked` affirmerait un verrou que la base n'a pas posé, et
> `SignatureBar` (`design-primitives`, § 2.3) rend `revocable` et `locked` comme deux
> états distincts précisément pour cela.
>
> `officiality: "provisional"` juste après la signature : `indicator.current_signed_version_id`
> n'est encore déplacé par personne (§ 5.10). La signature a existé, la valeur publiée
> pas encore. Les deux faits sont distincts et B4 ne permet pas de les confondre.

| Code | Condition | Message |
|---|---|---|
| 400 | Corps illisible | `"Corps de requête illisible : JSON attendu."` |
| 401 | Session absente ou expirée | `"Session absente ou expirée. Reconnectez-vous via le fournisseur d'identité."` |
| 403 | L'appelant n'est pas le signataire désigné | `"Seul le signataire désigné peut signer cette version."` |
| 404 | `versionId` inconnu ou invisible | `"Version de définition introuvable."` |
| 409 `SIGNER_IS_AUTHOR` | L'appelant est l'auteur de la version (B2) | `"Vous êtes l'auteur de cette version : l'auto-signature est interdite (règle B2). La version revient en projet."` |
| 409 `ALREADY_SIGNED_BY_ACTOR` | La version porte déjà une signature active de cet acteur | `"Cette version est déjà signée par vous."` |
| 409 `DEFINITION_NOT_IN_REVIEW` | La version n'est pas en `in_review` : elle est `draft` (jamais soumise, ou soumission ou signature retirée), `signed`, `refused` ou `published` | `"Cette version n'est pas en attente de signature."` |
| 409 `OWNER_INACTIVE` | Propriétaire inactif : la version ne peut plus être signée (B17). **Acte d'écriture** — ici le `409` est justifié | `"Le propriétaire est inactif : nommez un propriétaire avant toute nouvelle signature."` |
| 422 | `act` absent ou inconnu, `reason` manquant sur un refus, ou identifiant mal formé | `"Acte invalide : `reason` est obligatoire pour un refus."` |
| 429 | Quota dépassé | `"Trop de tentatives de signature. Réessayez dans un instant."` |
| 500 | Panne interne | `"Erreur interne. L'acte n'a pas été enregistré ; réessayez."` |

> Le refus d'auto-signature est renvoyé en `409 SIGNER_IS_AUTHOR` avec un message
> explicite : l'action n'est pas seulement désactivée dans l'interface, elle est
> refusée et **expliquée** (US-2). Chaque `409` porte son `error_code` : sans lui, deux
> refus de nature opposée — « tu es l'auteur » et « ce n'est pas à signer » —produiraient
> le même statut et le même écran d'erreur, et l'appelant ne pourrait pas distinguer
> un bug d'une règle.

### 5.9 `POST /api/v1/definitions/:versionId/submission` — soumettre, retirer (US-1, US-2)

- **Méthode** : POST · **Path** : `/api/v1/definitions/:versionId/submission` · **Auth** : session
- **Rate limit** : 20 req/min par session · **Idempotence** : `Idempotency-Key` requise

C'est l'endpoint qui donne un producteur à `in_review` (acte `submit`, § 4.8), et donc
à § 5.8. Sans lui, le cycle de vie a un état sans écrivain et le MVP ne peut pas
signer.

**Requête** — path param `versionId` (`uuid`) ; body :

| Paramètre | Type | Requis | Description |
|---|---|---|---|
| `act` | `submit` \| `withdraw` | oui | `submit` porte `draft → in_review`. `withdraw` retire la soumission et ramène à `draft` |
| `reason` | `string` | si `act = withdraw` | 1..500 car. — obligatoire, sinon `422` : un retrait est une trace, pas un silence |

**Qui peut soumettre.** L'**auteur de la version** (`definition_version.author_actor_id`)
ou le **propriétaire** de l'indicateur (`indicator.owner_actor_id`) — exactement le
même cercle que la création d'une version (§ 5.5) et que sa révocation (§ 5.11). Ni le
signataire, ni un tiers : soumettre, c'est exposer une définition à un jugement, et
c'est le rôle de celui qui la porte. Le rôle `controleur` est requis, comme sur § 5.4
et § 5.5, parce que ces trois personnes en ont un.

**La soumission est révocable, et c'est écrit ici pourquoi.** Tant que la version est
`in_review`, **rien n'est attesté** : aucun signataire n'a apposé sa signature, aucun
support d'export ne s'y rattache, aucun tableau de bord ne l'épingle. Une soumission
qu'on ne pourrait pas retirer laisserait un signataire face à une offre qu'il n'a
aucun moyen de décliner, et l'auteur devant l'unique issue de créer une nouvelle
version — donc un doublon permanent dans l'historique pour une faute de frappe. Le
retrait écrit un acte `revoke` qui **référence** l'acte `submit` (§ 4.8) : la trace
montre qu'une soumission a eu lieu puis a été retirée, ce qui est exact, et ce qui
interdit qu'un tiers passe par une autre voie. `draft` est l'unique retour possible, et
c'est le bon : c'est le seul état depuis lequel on peut soumettre à nouveau.

> Le retrait **ne rend pas la version modifiable.** Le contenu reste figé (ADR-8
> révisé, § 4.20) : une correction, à n'importe quel statut, passe par une nouvelle
> version (B1). Revenir en `draft` rend la version **re-soumissible**, ce qui est
> exactement ce qu'un retrait doit faire, et rien de plus.

**Réponse (succès)** :
```json
{ "signature_event_id": "4a05…", "act": "submit", "definition_version_id": "9b2e…",
  "status": "in_review", "submitted_at": "2026-09-26T07:55:10Z",
  "submitted_by": "Camille Roux", "state": "in_review" }
```

| Code | Condition | Message |
|---|---|---|
| 400 | Corps illisible | `"Corps de requête illisible : JSON attendu."` |
| 401 | Session absente ou expirée | `"Session absente ou expirée. Reconnectez-vous via le fournisseur d'identité."` |
| 403 | Rôle `controleur` absent, **ou** l'appelant n'est ni l'auteur de la version ni le propriétaire de l'indicateur | `"Seul l'auteur de la version ou son propriétaire peut la soumettre ou retirer sa soumission."` |
| 404 | `versionId` inconnu ou invisible | `"Version de définition introuvable."` |
| 409 `DEFINITION_NOT_DRAFT` | `act: submit` et la version n'est pas en `draft` — déjà `in_review`, `signed`, `refused` ou `published` | `"Cette version n'est pas en projet : elle ne peut pas être soumise une seconde fois. Créez une nouvelle version."` |
| 409 `DEFINITION_NOT_IN_REVIEW` | `act: withdraw` et la version n'est pas en `in_review` | `"Cette version n'est pas en attente de signature : il n'y a rien à retirer."` |
| 409 `SIGNED_VERSION_IMMUTABLE` | Retrait demandé alors que la version est déjà `signed` — le refus de signer (§ 5.8) est un acte, pas un retrait de soumission | `"Cette version est signée : une signature se révoque (§ 5.11), elle ne se retire pas."` |
| 409 `OWNER_INACTIVE` | Propriétaire inactif (B17). **Acte d'écriture** : soumettre reviendrait à demander un jugement sur un dossier sans propriétaire vivant | `"Le propriétaire est inactif : nommez un propriétaire avant de soumettre cette version."` |
| 422 | `act` absent ou inconnu, `reason` manquant sur un retrait, ou identifiant mal formé | `"Acte invalide : `reason` est obligatoire pour un retrait de soumission."` |
| 429 | Quota dépassé | `"Trop de soumissions. Réessayez dans un instant."` |
| 500 | Panne interne | `"Erreur interne. L'acte n'a pas été enregistré ; réessayez."` |

> Un `withdraw` sur une version `signed` est **refusé**, pas traité comme une
> révocation : ce sont deux traces de natures différentes. Une révocation dit « la
> signature a été annulée » et reste consultable comme telle (B26, § 5.11) ; un
> retrait dit « personne n'avait encore apposé de signature ». Confondre les deux
> ferait apparaître une signature annulée dans un historique où il n'y en a jamais
> eu.

### 5.10 `POST /api/v1/definitions/:versionId/publication` — publier (B4, B16, B26)

- **Méthode** : POST · **Path** : `/api/v1/definitions/:versionId/publication` · **Auth** : session
- **Rate limit** : 20 req/min par session · **Idempotence** : `Idempotency-Key` requise

C'est l'endpoint qui donne un producteur à `published` et à `published_at` (acte
`publish`, § 4.8), donc à la cible déterministe de § 5.11 et au verrou B26.

**Qui publie.** Le **propriétaire** de l'indicateur (`indicator.owner_actor_id`), pas
l'auteur de la version et pas le signataire. Publier, c'est décider quelle version
porte la valeur officielle affichée (B4) et laquelle reste épinglée dans les tableaux
de bord déjà partagés (B16) : c'est une décision de **portée produit**, et elle
appartient à la personne nommée qui en répond (B3). Le signataire a attesté la
définition ; il n'a pas à choisir laquelle devient celle que le comité regarde.

**Requête** — path param `versionId` (`uuid`) ; body : **vide**. Une publication ne
porte ni motif ni périmètre : elle est un acte nu, horodaté, et rien d'autre. Le
`Idempotency-Key` protège le double-clic.

**Réponse (succès)** :
```json
{ "signature_event_id": "4a30…", "act": "publish", "definition_version_id": "9b2e…",
  "status": "published", "published_at": "2026-09-26T08:30:00Z",
  "published_by": "Camille Roux", "officiality": "official",
  "current_signed_version_id": "9b2e…", "state": "locked" }
```

| Code | Condition | Message |
|---|---|---|
| 400 | Corps illisible, ou corps non vide alors qu'aucun champ n'est attendu | `"Corps de requête illisible : JSON attendu, corps vide pour une publication."` |
| 401 | Session absente ou expirée | `"Session absente ou expirée. Reconnectez-vous via le fournisseur d'identité."` |
| 403 | L'appelant n'est pas le propriétaire de l'indicateur | `"Seul le propriétaire de l'indicateur peut publier une version comme valeur officielle."` |
| 404 | `versionId` inconnu ou invisible | `"Version de définition introuvable."` |
| 409 `DEFINITION_NOT_SIGNED` | La version n'est pas `signed` : elle est `draft` (jamais soumise, ou signature retirée), `in_review`, `refused` ou déjà `published` | `"Seule une version signée peut être publiée. Faites-la signer d'abord."` |
| 409 `SIGNED_VERSION_IMMUTABLE` | La version est déjà publiée : `published_at` ne se réécrit pas (B26), et `CREATE UNIQUE INDEX one_publish_per_version` (§ 4.8) refuse un second acte `publish` | `"Cette version est déjà publiée."` |
| 409 `OWNER_INACTIVE` | Propriétaire inactif (B17) — ici, l'appelant **est** le propriétaire, donc le cas est celui d'une désactivation survenue depuis l'ouverture de la session. **Acte d'écriture** | `"Le propriétaire est inactif : nommez un propriétaire actif avant toute publication."` |
| 422 | `versionId` mal formé | `"Identifiant de version invalide."` |
| 429 | Quota dépassé | `"Trop de publications. Réessayez dans un instant."` |
| 500 | Panne interne | `"Erreur interne. L'acte n'a pas été enregistré ; réessayez."` |

> **Une transaction, deux écritures.** L'acte `publish`, l'écriture de
> `definition_version.published_at` et le déplacement de
> `indicator.current_signed_version_id` sont **atomiques** (§ 4.20, porte 3). Dans
> l'autre sens, il existerait un instant — vérifiable par une lecture concurrente —
> où une version serait `published` sans porter la valeur (B4), ou porterait la valeur
> sans être `published` (donc révocable, § 5.11). Les deux sont interdits, et c'est
> pourquoi `published_at` ne peut pas être une valeur dérivée : seul un acte
> horodaté permet d'y accrocher le pointeur dans le même instant.

### 5.11 `POST /api/v1/definitions/:versionId/signature/revocation` — révocation (B26)

- **Méthode** : POST · **Path** : `/api/v1/definitions/:versionId/signature/revocation` · **Auth** : session
- **Rate limit** : 20 req/min par session · **Idempotence** : `Idempotency-Key` requise

**Requête** — path param `versionId` ; body `{ "reason": "périmètre à préciser" }`.

**La cible est déterministe, et elle l'est maintenant par construction.** L'acte
révoqué est identifié sans que l'appelant ait à le choisir : c'est **l'unique acte
`sign` non déjà révoqué** de cette version — garanti unique par l'index
`one_active_signature_per_signer` (§ 4.8). Avant que `sign` et `revoke` existent
dans le journal (§ 4.8), cette cible n'était qu'une convention : rien n'interdisait
qu'une version ait deux signatures actives, ni qu'un appelant en révoque une autre
que celle qu'il croit viser. Le contrat est donc explicite : `revokes_event_id` est
**résolu par le serveur**, jamais fourni par le client, et il est echoed dans la
réponse pour que la trace soit vérifiable. Une version qui n'est pas `signed` n'a
rien à révoquer : c'est `409 NO_ACTIVE_SIGNATURE`, et le retrait d'une soumission
relève de § 5.9, pas d'ici.

**Réponse (succès)** :
```json
{ "signature_event_id": "4a20…", "act": "revoke", "revokes_event_id": "4a11…",
  "definition_version_id": "9b2e…", "status": "draft",
  "occurred_at": "2026-09-27T09:00:00Z", "state": "revocable" }
```

| Code | Condition | Message |
|---|---|---|
| 400 | Corps illisible | `"Corps de requête illisible : JSON attendu."` |
| 401 | Session absente ou expirée | `"Session absente ou expirée. Reconnectez-vous via le fournisseur d'identité."` |
| 403 | L'appelant n'est ni l'auteur ni le propriétaire | `"Seul l'auteur de la version ou son propriétaire peut demander la révocation de sa signature."` |
| 404 | `versionId` inconnu ou invisible | `"Version de définition introuvable."` |
| 409 `SIGNED_VERSION_IMMUTABLE` | La version est `published` : `published_at` est écrit, donc B26 verrouille. Le message **nomme** la sortie | `"Cette version est publiée : sa signature n'est plus révocable. Créez une nouvelle version puis faites-la signer."` |
| 409 `NO_ACTIVE_SIGNATURE` | Aucune signature active à révoquer : la version est `draft`, `in_review` ou `refused`, ou sa signature a déjà été révoquée | `"Cette version n'a pas de signature active à révoquer."` |
| 422 | `reason` absent ou trop long | `"Motif de révocation obligatoire (1 à 500 caractères)."` |
| 429 | Quota dépassé | `"Trop de tentatives. Réessayez dans un instant."` |
| 500 | Panne interne | `"Erreur interne. La révocation n'a pas été enregistrée ; réessayez."` |

> `published_at` n'est **jamais** réécrit par cet endpoint, ni par aucun autre
> (§ 4.20, porte 3) : c'est le seul moyen de garantir que le verrou B26 ne se
> relâche pas. Une version révoquée reste **consultable** dans l'historique (§ 5.6),
> avec son signataire, sa date et son motif : « on a annulé » est un fait de
> gouvernance à conserver, pas une ligne à effacer (B10, B22).

### 5.12 `GET /api/v1/dashboards` — tableaux de bord accessibles

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

### 5.13 `GET /api/v1/dashboards/:slug` — tableau de bord partagé (US-6)

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
      "threshold": { "comparison": "below", "threshold_value": 1250000,
                     "label": "CA par client hors cible", "defined_at": "2026-09-24T10:13:00Z" },
      "computed_at": "2026-09-29T05:00:00Z", "source_ref": "marts_sales_v42" },
    { "position": 1, "slug": "ca-marge-brute", "version_label": "v2", "officiality": "stale_owner",
      "state": "value", "value": 214300.00, "unit": "EUR",
      "target": null, "semantic_state": "target_missing",
      "threshold": null,
      "computed_at": "2026-09-29T05:00:00Z", "source_ref": "marts_sales_v42" }
  ],
  "excluded": [ { "slug": "ca-marge-nette", "reason": "SCOPE_DENIED", "missing_team_codes": ["FINANCE"] } ],
  "computed_at": "2026-09-29T05:00:00Z"
}
```

| Champ de `tiles[]` | Type | Nullable | Origine | Description |
|---|---|---|---|---|
| `version_label` | `string` | non | `dashboard_indicator.pinned_version_id` | La version **épinglée** (B16) : tant que la version suivante n'est pas publiée, c'est celle-ci qui est rendue, pas la dernière |
| `officiality` | `official` \| `provisional` \| `stale_owner` \| `target_missing` | non | **dérivé** à la lecture (§ 4.5) | `stale_owner` si le propriétaire est inactif (B17) — la tuile est rendue, pas retirée (E17) |
| `target` | `{ value, delta, confirmed }` | **oui** | `definition_version.target_*` de la version épinglée | `null` ⇒ E16 « cible à reconfirmer », rendu par `semantic_state: "target_missing"` |
| `semantic_state` | `SemanticState` (§ 2.3) | non | **calculé par `seuil-et-etat`** (§ 3.3) | Transporté, jamais recalculé ici |
| `threshold` | `IndicatorThreshold` (§ 2.3) | **oui** | `definition_threshold` de la **version épinglée** | `null` ⇔ cette version ne déclare aucun seuil. Jamais un objet partiel (B11) |

> **Chaque tuile porte son seuil, et c'est non négociable.** Le design system approuvé
> (`design-system.md` § 2) fait de la ligne de seuil un contenu **obligatoire au MVP**
> dont **aucun** fait n'est rognable, et interdit qu'elle dépende du format d'écran.
> Une tuile sans `threshold` ne peut donc pas rendre ce slot : elle ne peut rendre
> qu'un `out_of_band` **sans** ligne de seuil, c'est-à-dire le cas `not_applicable`
> du § 2.1 — qui est un état nommé, pas une tuile amputée. C'est pourquoi § 5.2,
> § 5.3 et § 5.13 renvoient tous les trois le champ, avec la même forme, et que la
> forme est fixée **une seule fois**, en § 2.3. `defined_at` vient de la source
> (§ 4.7), **jamais** de l'heure du poste (B5).

| Code | Condition | Message |
|---|---|---|
| 400 | Période incohérente | `"Période incohérente : `from` doit précéder `to`."` |
| 401 | Session absente ou expirée | `"Session absente ou expirée. Reconnectez-vous via le fournisseur d'identité."` |
| 403 | L'appelant figure dans la liste de partage mais son périmètre est vide après application du scope | `"Aucune des équipes demandées ne vous est accessible sur ce tableau."` |
| 404 | Slug inexistant **ou** tableau non partagé avec l'appelant (même réponse) | `"Tableau de bord introuvable."` |
| 409 | — | *sans objet : E17 est un **état rendu**, pas un refus. Un ou plusieurs indicateurs `stale_owner` donnent un `200` avec `dashboard.is_official: false`, la liste des `tiles` **inchangée**, et la mention par tuile. Le tableau ne se retire pas* |
| 422 | `teams` invalide | `"Liste d'équipes invalide : 1 à 50 codes connus du référentiel sont attendus."` |
| 429 | Quota dépassé | `"Trop de consultations. Réessayez dans un instant."` |
| 500 | Panne interne | `"Erreur interne. Réessayez ; si le problème persiste, contactez l'administrateur."` |
| 503 | Entrepôt injoignable (E1) — la dernière date de calcul connue est conservée | `"Source indisponible. Les dernières valeurs connues restent affichées, datées."` |
| 504 | Délai dépassé (E11) | `"Calcul trop long. Dernières valeurs connues affichées, datées."` |

> **E5** : un indicateur interdit n'apparaît pas dans `tiles`, la **liste des
> indicateurs reste complète** via `excluded`, et chaque exclusion est journalisée avec
> l'identité et la ressource visée. Le design system est cohérent : la tuile
> `permission_denied` **n'est pas rendue** (pas de placeholder « accès refusé »).

### 5.14 `POST /api/v1/dashboards` — composer un tableau de bord

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

### 5.15 `POST /api/v1/dashboards/:slug/grants` — partager (B9)

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

### 5.16 `DELETE /api/v1/dashboards/:slug/grants/:grantId` — retirer un partage

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

### 5.17 `POST /api/v1/exports` — demander un export (US-9)

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

### 5.18 `GET /api/v1/exports/:exportId` — état d'un export

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

### 5.19 `GET /api/v1/exports/:exportId/artifact` — télécharger le support

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

### 5.20 `GET /api/v1/access-log` — journal filtré (US-8, B25)

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

### 5.21 `POST /api/v1/access-log/exports` — exporter le journal (US-8)

- **Méthode** : POST · **Path** : `/api/v1/access-log/exports` · **Auth** : session + habilitation `auditeur`
- **Rate limit** : 2 req/min par acteur · **Idempotence** : `Idempotency-Key` requise

**Requête** (body) : `{ "from": "2026-09-01", "to": "2026-09-30", "format": "csv" }`.

**Réponse (succès)** — `202 Accepted`, comme § 5.17 (même file de jobs) :
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

### 5.22 Correspondance `error_code` → statut HTTP

| `error_code` | Statut | Retenu quand | État d'UI |
|---|---|---|---|
| `UNAUTHENTICATED` | 401 | Aucun cookie / cookie invalide | Redirection vers l'IdP |
| `SESSION_EXPIRED` | 401 | Session dépassée ou révoquée (E14) | Idem, avec message explicite |
| `FORBIDDEN` | 403 | Rôle insuffisant, ou l'appelant n'est ni auteur ni propriétaire de la version | Bandeau « accès refusé » |
| `SCOPE_DENIED` | 403 | Périmètre calculé et connu | Tuile **non rendue** (E5) + journalisation |
| `EXPORT_SCOPE_DENIED` | 403 | Élargissement de périmètre (E6) | `ExportPanel: forbidden_scope` |
| `JOURNAL_FORBIDDEN` | 403 | Non habilité au journal (B23) | Panneau d'explication |
| `NOT_FOUND` | 404 | Ressource inexistante ou invisible | `DataTable: error` |
| `VALIDATION_FAILED` | 422 | Zod à la frontière, chemins fautifs | Erreur **au champ** |
| `PLAN_INVALID` | 422 | Plan de requête invalide (vient du client) | Erreur au champ |
| `SIGNER_UNKNOWN` | 422 | Signataire hors annuaire | Erreur au champ |
| `OWNER_REQUIRED` | 409 | Enregistrement sans propriétaire nommé (B3) | Erreur au champ |
| `SIGNER_IS_AUTHOR` | 409 | Auto-signature (B2) — actes `sign` / `refuse` seulement | Message explicite, action expliquée |
| `SIGNED_VERSION_IMMUTABLE` | 409 | Modification d'une version `published` (B1), **retrait de soumission sur une version `signed`** (§ 5.9), **seconde publication** (§ 5.10), **révocation d'une version publiée** (§ 5.11, B26) | Message expliquant de créer une version, ou que le verrou B26 est posé |
| `DEFINITION_NOT_DRAFT` | 409 | Soumission d'une version qui n'est pas en `draft` (§ 5.9) | Message expliquant l'état courant, action : créer une version |
| `DEFINITION_NOT_IN_REVIEW` | 409 | `sign` / `refuse` sur une version qui n'est pas `in_review` (§ 5.8) ; retrait d'une soumission absente (§ 5.9) | Message expliquant l'état courant |
| `DEFINITION_NOT_SIGNED` | 409 | Seuil posé sur une version non signée (B11) ; **publication d'une version qui n'est pas `signed`** (§ 5.10) | Erreur au champ, ou message « faites-la signer d'abord » |
| `ALREADY_SIGNED_BY_ACTOR` | 409 | Cet acteur a déjà une signature active sur cette version (§ 5.8) | Message « déjà signée par vous » |
| `NO_ACTIVE_SIGNATURE` | 409 | Révocation demandée alors qu'aucune signature n'est active (§ 5.11) | Message « rien à révoquer », action : retirer la soumission (§ 5.9) |
| `SLUG_TAKEN` | 409 | Collision d'identifiant d'URL | Erreur au champ |
| `CONCURRENT_MODIFICATION` | 409 | `expected_version_no` dépassé | Rechargement de la définition |
| `OWNER_INACTIVE` | 409 | **Acte d'écriture seulement** : soumission (§ 5.9), publication (§ 5.10), signature ou refus (§ 5.8). **Jamais sur une lecture** | Sur un acte d'écriture : message bloquant nommant le propriétaire à nommer. **Sur une lecture : aucun état d'erreur** — c'est `officiality: "stale_owner"` dans un `200` (§ 5.3, § 5.6, § 5.7, § 5.13) |
| `RATE_LIMITED` | 429 | Quota de session dépassé | Message transitoire |
| `SOURCE_UNREACHABLE` | 503 | Entrepôt injoignable (E1) | Tuile `source_unavailable` + dernière date connue |
| `COMPUTATION_TOO_LONG` | 503 | Calcul au-delà du délai (E11) | Tuile `computation_too_long`, jamais de partiel |
| `SCHEMA_UNKNOWN` | 503 | Matérialisation absente ou renommée | Tuile `source_unavailable` + message « la source n'a pas été rafraîchie » (E3) |
| `QUERY_TIMEOUT` | 504 | Dépassement du délai de 30 s | Idem E11 |
| `INTERNAL_ERROR` | 500 | Panne interne | Message générique + `request_id` |

> Cette table est la **seule** correspondance `code → statut`. L'UI décide retry,
> message et contact admin sur le `code`, jamais sur une chaîne libre : sinon chaque
> endpoint invente son libellé et l'interface ne sait plus quoi proposer.

> **`OWNER_INACTIVE` : un `409`, et pourtant jamais sur une lecture.** C'est le
> point où cette table et le catalogue de § 2.5 se contredisaient : la colonne
> « État d'UI » disait « Tuile `stale_owner` », ce qui est un **rendu** — donc un
> `200` — alors que la colonne « Statut » disait `409`. Les deux ne peuvent pas être vrais, et
> l'erreur n'est pas cosmétique : un `409` sur § 5.3, § 5.6, § 5.7 ou § 5.13
> empêcherait de rendre un indicateur que le lecteur a le droit de voir, ce que
> E17 et E5 interdisent l'un comme l'autre.
>
> La règle tient en une phrase, et elle est appliquée aux **quatre** lectures :
> **un `409` signifie « je ne peux pas répondre », jamais « la réponse que vous
> attendez a changé ».** Un propriétaire inactif ne nous empêche pas de répondre —
> il change la réponse. Le `409` reste donc dans `ERROR_HTTP_STATUS`, où il a sa
> place, et il est **levé** uniquement par un acte d'écriture : écrire une nouvelle
> signature, une nouvelle soumission ou une nouvelle publication sous un
> propriétaire qui n'existe plus, c'est faire hériter un dossier d'un absent.
> `stale_owner` reste dans le design system, au même rang de précédence que les autres
> états rendus (`design-system.md` § 2), et il est **atteint** par le `200`.

---

## 6. Graphe de dépendances

Graphe déclaré avec `state.js dep` (15 nœuds) puis recalculé par
`dependency-check.js check . --write`, qui persiste `depends_on`, `depended_on_by` et
`impl_wave`. Le plan ci-dessous **est** le résultat du calcul : aucune séquence
d'ordonnancement plus fine n'est annoncée, donc aucun `impl_waves` n'est déclaré dans
le front matter — il n'y a pas d'écart à justifier.

> **Deux arêtes ont changé depuis le dernier `--write`, et le graphe est passé de 24 à
> 25 arêtes.** `seuil-et-etat → consultation-indicateur` n'existe plus ;
> `consultation-indicateur → seuil-et-etat` a été ajoutée (§ 3.3, décision d'arbitrage) ;
> et `seuil-et-etat → design-primitives` a été ajoutée pour que la fonction pure ait
> une dépendance réelle. Ce n'est donc pas une inversion 1:1, c'est **une arête
> retargetée plus une arête ajoutée** : d'où 25 et non 24. Ce qui **ne change pas**,
> et c'est le point, c'est le nombre de nœuds (15) et le nombre de vagues (4).
> `state.json → index.impl_waves`, `depends_on` et `depended_on_by` portent encore
> l'ancien graphe : ils doivent être régénérés par `dependency-check check . --write`
> à la reprise de la Phase 4. **Ce n'est pas une divergence de conception, c'est un
> `state.json` à rejouer** — et c'est le seul artefact, hors de ce document, qui soit
> désormais en retard sur lui.

### 6.1 Ordre d'implémentation topologique

```
Vague 0 (fondations, aucune ne dépend d'une autre) :
  ├── auth                 (session 8 h, droits fail-closed, rate limit)
  ├── query-engine         (withScope(), computed_at de la source, ReadOutcome)
  ├── design-primitives    (IndicatorTile + slot threshold et sa règle de
  │                         non-troncature, DataTable, FormField, SignatureBar,
  │                         ProvenanceStrip, ExportPanel)
  ├── access-log           (append-only, filtre B25, purge 1 an)
  └── error-handling       (enum fermée error_code, ListOutcome/ReadOutcome)

Vague 1 (dépend uniquement de fondations) :
  ├── definition-declarer  (auth, design-primitives)
  ├── restriction-lignes   (auth, query-engine)
  ├── journal-acces        (auth, access-log)
  └── seuil-et-etat        (design-primitives) — fonction pure, elle ne lit rien,
                            donc elle n'attend personne

Vague 2 (dépend de la vague 1) :
  ├── definition-signer    (auth, definition-declarer)
  ├── consultation-indicateur (query-engine, auth, design-primitives,
  │                          definition-declarer, error-handling, seuil-et-etat)
  └── partage-dashboard    (auth, definition-declarer)

Vague 3 (dépend de la vague 2) :
  ├── historique-indicateur (query-engine, definition-signer, access-log)
  ├── drill-down           (query-engine, consultation-indicateur)
  └── export-provenance    (query-engine, restriction-lignes, consultation-indicateur)
```

**4 vagues** (V0 → V3), toujours — l'inversion de l'arête n'a pas ajouté de vague,
elle a **déplacé `seuil-et-etat` de la vague 3 à la vague 1** et **libéré la place**
d'un côté et supprimé un nœud orphelin de l'autre. C'est le résultat recherché : la
fonction pure est désormais là où elle peut être, et non là où l'on pourrait l'attendre.
`state.json → index.impl_waves` doit porter le même découpage après
`dependency-check --write` (voir la note ci-dessus).

### 6.2 Parallélisme possible

| Vague | Slices parallélisables | Ce qui peut être construit en même temps sans collision |
|---|---|---|
| 0 | les 5 fondations | `auth` touche la session, `query-engine` touche le SQL : aucun fichier commun |
| 1 | `definition-declarer`, `restriction-lignes`, `journal-acces`, `seuil-et-etat` | `restriction-lignes` ne fait que résoudre un scope déjà résolu par `auth` ; `journal-acces` n'écrit que dans `access_log` ; **`seuil-et-etat` n'écrit rien du tout** — c'est une fonction pure, le seul fichier qu'elle touche est son test unitaire |
| 2 | `definition-signer`, `consultation-indicateur`, `partage-dashboard` | `partage-dashboard` ne fait qu'écrire des FK vers `indicator` ; `consultation-indicateur` les lit et appelle `resolveSemanticState()`, déjà en vague 1 |
| 3 | `historique-indicateur`, `drill-down`, `export-provenance` | `export-provenance` écrit dans `export_job`, jamais dans les tables des autres ; `historique-indicateur` est le seul lecteur de `signature_event` |

> Un seul resserrement mérite d'être signalé : `consultation-indicateur` est la slice
> la plus couplée du graphe — six dépendances, dont `seuil-et-etat` désormais. Ce n'est pas un
> défaut de graphe — c'est le point où le projet a le plus de chances de glisser, et il
> est visible dans le plan sans avoir besoin d'un plan de vagues plus fin.

### 6.3 Cycles

Aucun cycle de dépendances détecté. `state.js dep` refuse une dépendance vers une slice
inexistante, l'auto-référence et toute dépendance qui fermerait un cycle ; le graphe
complet a été déclaré sous ces trois refus, puis vérifié par `dependency-check`
(`cycles: []`, `missing_dependencies: []`, `orphans: []`).

> **L'inversion de l'arête de § 3.3 ne referme pas un cycle, et c'est vérifiable.**
> `seuil-et-etat` ne dépend plus que de `design-primitives`, et
> `design-primitives` ne dépend de rien : le chemin `seuil-et-etat` →
> `consultation-indicateur` → … → `seuil-et-etat` est donc coupé à sa racine, pas
> seulement déplacé. Si l'inversion s'était contentée d'échanger deux dépendances
> mutuelles, `state.js dep` l'aurait refusée ; le fait qu'elle passe est le contrôle.
> Aucun nœud n'est devenu orphelin : `seuil-et-etat` a un dépendant
> (`consultation-indicateur`), donc `orphans: []` reste vrai.

### 6.4 Points de contention et couplage

| Nœud | Dépend de | Dépendu par | Lecture |
|---|---|---|---|
| `auth` | 0 | **6** | Point de contention maximal : toute slice non foundations passe par la session. C'est voulu — une seule implémentation du fail-closed vaut mieux que six. |
| `query-engine` | 0 | **5** | Idem pour l'accès à l'entrepôt. Le coût est compensé par l'absence d'alternative : deux moteurs de requête produiraient deux définitions de la fraîcheur. |
| `definition-declarer` | 2 | **3** | Le seul slice métier dont dépendent trois autres. C'est la conséquence directe de B1 : sans version figée, il n'y a pas de valeur publiée. |
| `definition-signer` | 2 | **1** | Écrivain unique des cinq actes de `signature_event` et des deux colonnes de cycle de vie (§ 4.6, § 4.8). Seul `historique-indicateur` en dépend, en tant que dépendance de **code** : `consultation-indicateur` lit les mêmes colonnes mais dans le **schéma**, donc aucune arête — et c'est délibéré, voir § 3.5. |
| `consultation-indicateur` | **6** | **2** | Slice la plus couplée du graphe. Elle justifie à elle seule que `error-handling` soit une fondation et non une slice : sans enum fermée, elle inventerait ses propres libellés d'erreur. |
| `design-primitives` | 0 | 3 | Utilisé par peu de slices parce que le design system n'a que six composants, tous déjà spécifiés en Phase 3. Le slot `threshold` et sa règle de non-troncature (§ 2.3) en font le contrat que `seuil-et-etat` consomme en vague 1. |
| `access-log` | 0 | 2 | Isolé : `restriction-lignes` et `historique-indicateur` écrivent dans le journal mais n'en dépendent pas pour fonctionner. |
| `seuil-et-etat` | 1 | 1 | Nœud le moins couplé du graphe : une dépendance, un dépendant. C'est la mesure de la décision d'arbitrage de § 3.3 — une fonction pure n'a pas besoin d'un graphe autour d'elle. |
| Feuilles (`historique-indicateur`, `drill-down`, `partage-dashboard`, `export-provenance`, `journal-acces`) | 1 à 3 | 0 | Aucune de ces slices ne peut faire échouer une autre par son API. `seuil-et-etat` n'y est plus : elle a désormais `consultation-indicateur` pour dépendant. |

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
| ADR-8 | Le **contenu** d'une version de définition est un **dépôt**, pas une branche. L'immuabilité est levée sur **deux colonnes nommées**, `status` et `published_at`, et sur aucune autre | B1 (une modification crée une version), B22, B26. Contradiction à trancher : ADR-8 interdisait tout `UPDATE` alors que `status` et `published_at` y vivent — donc soit la règle est fausse, soit ces deux colonnes n'ont pas de producteur | (a) `UPDATE` libre du statut, immuabilité déclarative seulement ; (b) contenu figé + `UPDATE` **restreint à deux colonnes** par les droits SQL, un trigger de rejet du reste, et un trigger qui exige un acte correspondant ; (c) `status` et `published_at` purement dérivés, lus par **vue**, sans colonne | **(b)** | (a) rend l'immuabilité une promesse : un `UPDATE` du `change_note` passe aussi par la même porte, et rien ne l'interdit. (c) est cohérent mais coûte cher : la publication doit ensuite agréger un journal pour chaque lecture du cycle de vie, et — decisive — B26 compare `published_at` à une décision. Une **vue** ne peut pas être la source d'un verrou de façon fiable ; il faut un instant **écrit**. (b) garde la règle forte là où elle compte, et la rend **bornée** là où elle doit céder | Le rôle applicatif reçoit `INSERT` sur la version et `UPDATE` **uniquement** sur `(status, published_at)` ; jamais `DELETE`, jamais `UPDATE` sur le contenu (§ 4.20, portes 1 à 3). Un `status` sans acte correspondant, ou un `published_at` qui diffère de l'`occurred_at` de l'acte `publish`, sont refusés **en base**. Le journal reste la source de vérité ; les deux colonnes en sont la projection indexable. Une correction de définition, à n'importe quel statut, passe par une nouvelle version |
| ADR-9 | Le cycle de vie d'une version est un **journal d'actes** (`submit`, `sign`, `refuse`, `revoke`, `publish`), pas des `UPDATE` de statut | Sans producteur nommé, `in_review` n'existait pas et `POST /definitions/:versionId/signature` répondait `409` pour toujours : US-2, B2, ADR-1, B4, B22, B26 et le jalon `T_première signature` devenaient inatteignables | (a) l'immuabilité stricte, sans aucun état intermédiaire ; (b) `UPDATE` de `status` par la couche service ; (c) cinq actes append-only, `status` et `published_at` en étant la projection | **(c)** | (a) supprime le problème en supprimant ce qui est demandé : sans `in_review`, il n'y a ni file d'attente, ni retrait possible, ni séparation entre « écrit » et « à signer ». (b) reproduit la réécriture d'historique qu'ADR-8 refuse. (c) garde une trace **nominative** : chaque flèche a un auteur, une date et un endpoint, donc un état sans état précédent est impossible à produire | `signature_event.act` passe de 3 à 5 valeurs. `revoke` a deux cibles (`submit`, `sign`) au lieu d'un cinquième verbe. `status` devient dérivable : `UPDATE` de cycle de vie refusé sans acte (§ 4.20). Coût assumé : deux endpoints de plus (§ 5.9, § 5.10) et quatre `error_code` nommés pour des refus qui étaient des `409` sans code |
| ADR-10 | **Qui porte le calcul de la comparaison à la cible** : `seuil-et-etat`, seule, et `consultation-indicateur` en dépend | `consultation-indicateur` est en vague 2 et renvoie `semantic_state` (§ 5.2, § 5.3, § 5.13) ; `seuil-et-etat` était en vague 3. L'état dont la réponse a besoin était donc produit **après** elle — une dépendance non déclarée, et le § 3.3 affirmait déjà que la comparaison était à `seuil-et-etat` | (a) `consultation-indicateur` calcule la comparaison ; (b) `seuil-et-etat` calcule et `consultation-indicateur` en dépend ; (c) les deux calculent, avec un test d'égalité | **(b)** | (a) respecte les vagues mais réécrit la règle B11 dans la slice qui **rend**, ce qui est la pire des deux places : la règle de définition finirait dans la couche de présentation, et `design-system.md` § 2.1 (machine à états du franchissement, dans la slice `seuil-et-etat`) aurait un propriétaire différent de l'exécutant. (c) est le pire des deux mondes : deux implémentations d'une comparaison numérique sont divergentes par construction. (b) est la seule qui tienne : **la règle vit dans la slice de la règle**, et comme le calcul est une fonction **pure**, la slice n'a besoin de rien d'autre que des types de `design-primitives` | `consultation-indicateur` gagne une dépendance (`seuil-et-etat`, vague 1) ; `seuil-et-etat` perd la sienne et gagne une dépendance sur `design-primitives`, ce qui la rend constructible dès la vague 1. Résultat : **15 nœuds, 25 arêtes, 4 vagues, `cycles: []`** — une arête de plus qu'avant, et **pas une vague de plus**. Le calcul est testable seul, sur ses deux côtés (§ 3.7) |

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
  n'est pas signable (§ 4.6.0), donc pas officiel, donc pas publiable.
- « Signable » est défini en § 4.6.0 et **n'est pas un statut** : c'est un prédicat
  dérivé (`in_review` ∧ signataire nommé ∧ signataire ≠ auteur). Le créer comme
  sixième statut aurait exactement le défaut que `revoked` avait — une valeur
  qu'aucun endpoint n'écrit, donc un état que rien ne produit.

**ADR-8 révisé — l'immuabilité est levée où elle doit l'être, et seulement là.**

La version d'origine d'ADR-8 disait : *« aucune mise à jour n'est possible sur
`definition_version` et `signature_event` »*. C'était faux, et pas légèrement : la même
version déclarait `status` et `published_at` sur `definition_version`, donc une
`UPDATE` que la règle interdisait. Deux issues, et une seule paresse.

**L'immuabilité porte sur le CONTENU.** Une version de définition est un dépôt de
**définition** — formule, périmètre, cible, grain, unité, `change_note`, auteur, rang,
`created_at`. Aucun de ces champs ne bouge, à **aucun** statut, y compris en `draft` :
une correction passe par une nouvelle version (B1). C'est ce que la règle protégeait
réellement, et c'est ce qu'elle protégeait bien.

**L'exception est deux colonnes, nommées, et elle est contrôlée trois fois** (§ 4.20) :

| Question | Réponse |
|---|---|
| Quelles colonnes ? | `status` et `published_at`. Pas une troisième. `definition_threshold` reste `INSERT`-seul (un seuil se pose une fois, B11) et `signature_event` reste `INSERT`-seul |
| Qui les écrit ? | `definition-signer` **seule** (§ 3.5), via `POST /definitions/:versionId/submission` (§ 5.9), `/signature` (§ 5.8), `/publication` (§ 5.10), `/signature/revocation` (§ 5.11). Ni tâche de fond, ni script de reprise, ni endpoint d'administration |
| Qu'est-ce qui l'autorise en base ? | Trois portes : `GRANT UPDATE (status, published_at)` et rien d'autre ; un trigger qui **rejette** tout `UPDATE` débordant sur le contenu, y compris par un `SET ROLE` ; un trigger qui **exige** un acte `signature_event` correspondant, et qui refuse un `published_at` différent de l'`occurred_at` de l'acte `publish` |

`status` et `published_at` sont donc **dérivés**, dans le sens exact où § 4.5 dit que
`officiality` en est un : une commodité de requête, jamais la source de vérité. La
source de vérité, c'est `signature_event`. Une lecture concurrente ne peut donc pas
voir `status = 'signed'` sans qu'un acte `sign` existe dans la même transaction — et
c'est vérifiable par un test d'intégration, pas seulement par une intention.

**Ce que l'exception ne fait pas.** Elle n'ouvre pas la voie à une correction
silencieuse : un `UPDATE` de `status` sans acte est **refusé en base**, donc un
développeur qui contournerait l'API ne pourrait pas non plus réécrire le passé, il
obtiendrait une exception. C'est la différence entre une exception à une règle et
l'abandon de la règle.

**ADR-9 — pourquoi `submit` et `publish` sont des actes, et pas des champs calculés.**

Le défaut que ces deux actes corrigent n'est pas élégance de modèle : sans eux,
`in_review` n'a **aucun producteur**, et `POST /definitions/:versionId/signature`
répond `409 DEFINITION_NOT_IN_REVIEW` pour toute version existent. Le MVP ne produirait
donc jamais sa première signature, et avec elle tombent US-2, B2, ADR-1, B4, B22, B26
et le jalon `T_première signature` de `roadmap.md` § 1.1 (les trois jalons du MVP). Un état sans écrivain n'est
pas un état : c'est un `409` permanent.

- **`submit` (`draft → in_review`)** distingue « j'ai écrit une version » de « je la
  soumets à un jugement ». Les confondre, c'est exposer au signataire un brouillon sans
  que personne n'ait décidé de l'exposer. C'est aussi ce qui rend le **retrait**
  possible (§ 5.9) : sans acte de soumission, il n'y a rien à retirer, et l'unique issue
  pour l'auteur deviendrait de créer une seconde version — donc un doublon éternel dans
  l'historique pour une faute de frappe.
- **`publish` (`signed → published`)** est le seul événement qui peut poser un
  **verrou**. B26 dit qu'une signature est révoquable *jusqu'à la première publication* :
  la règle porte donc sur un instant, et un instant ne peut pas être une fonction du
  temps courant. Dérivé de `indicator.current_signed_version_id`, `published_at`
  changerait à chaque déplacement du pointeur — donc publier v3 **débloquerait** la
  signature de v2 que B26 veut verrouiller. Un acte horodaté ne se réécrit pas : c'est
  le seul des deux candidats qui tient.
- **La publication est un acte du propriétaire, pas du signataire.** Le signataire a
  attesté la définition ; choisir laquelle devient la valeur que le comité regarde est
  une décision de portée produit, et elle appartient à la personne nommée qui en répond
  (B3). C'est aussi ce qui rend la règle B17-actionnable : un propriétaire inactif ne
  peut ni publier, ni soumettre, ni signer (§ 5.8, § 5.9, § 5.10) — même si, sur une
  **lecture**, son absence ne fait que changer le rendu (§ 5.22).
- **`revoke` a deux cibles plutôt qu'un cinquième verbe.** Retirer une soumission et
  révoquer une signature sont le même geste, servent la même mécanique append-only, et
  un verbe de plus aurait apporté une colonne (`withdraws_event_id`), un second chemin
  de retraction, et une seconde arête dans le graphe des contradictions possibles. La
  contrainte qui compte est donc une seule, et elle est en base : un `revoke` ne peut
  viser qu'un `sign` ou un `submit` (§ 4.8).

**ADR-10 — pourquoi l'inversion d'arête ne coûte pas une vague.**

Le problème : `consultation-indicateur` (vague 2) renvoie `semantic_state`, mais la
slice qui sait le calculer était déclarée en vague 3. Deux corrections possibles, et
elles ne se valent pas.

- Faire calculer la comparaison par `consultation-indicateur` respecte les vagues, mais
  écrit la règle B11 dans la couche qui **rend**. Or `design-system.md` § 2.1 place la
  machine à états du franchissement dans la slice `seuil-et-etat`, avec des états
  nommés : on aurait alors un propriétaire pour l'état et un autre pour l'exécutant, ce
  qui est la forme exacte du « un fait, deux représentations » que § 3.7 prétend traiter.
- Faire calculer par `seuil-et-etat` **et** lui retirer sa dépendance à
  `consultation-indicateur` est la seule option qui tienne, et l'observation qui la
  rend possible est simple : `resolveSemanticState(value, target, threshold)` est une
  **fonction pure**. Elle ne lit rien de `consultation-indicateur` ; c'est
  l'appelant qui lui passe les trois entrées. Sa seule dépendance est le **type**
  `IndicatorDisplayState` de `design-primitives`, pour dire quel état de tuile en
  découle — donc elle est constructible dès la vague 1.

D'où le résultat : `seuil-et-etat` passe de la vague 3 à la vague 1, et
`consultation-indicateur` gagne une dépendance. Le graphe compte **15 nœuds, 25
arêtes, 4 vagues** : une arête de plus qu'avant (24) et **pas une vague de plus**,
parce que le nœud qui libère une place en vague 3 en prend une en vague 1. Le cycle
qui aurait été créé en échangeant les deux dépendances n'existe pas : la flèche est
coupée à sa racine, `design-primitives` ne dépendant de rien.

Ce que cela coûte, et c'est à dire : `seuil-et-etat` devient un **prérequis** de la
vague 2, donc un retard sur elle décale `consultation-indicateur` — donc `drill-down` et
`export-provenance`. Le risque était déjà entièrement porté par
`consultation-indicateur`, qui reste le nœud le plus couplé du graphe (§ 6.4) ; on n'a
pas ajouté un chemin critique, on a rendu le existant honnête. Le plan de
`seuil-et-etat` (Phase 5) et sa ligne « calculé par `seuil-et-etat` » dans le plan de
`consultation-indicateur` disent déjà la même chose : **c'est l'architecture qui était
en retard, pas les plans.**

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
- l'export du journal passe par le **même** filtre que la lecture à l'écran (§ 5.21) ;
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
| 15 nœuds pour trois indicateurs : le coût d'architecture dépasse le produit | LOW | MEDIUM | Les 5 fondations sont transverses et réutilisables ; 3 des 10 slices (historique, drill-down, export) sont des extensions directes de `consultation-indicateur`, et `seuil-et-etat` en est un **prérequis** de vague 1 — une fonction pure, pas un nœud de plus (ADR-10). Le surcoût réel est la fondation `access-log`, et il est justifié par C4, qui est une contrainte légale et non un souhait |

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
- [x] Tous les endpoints API listent leurs codes d'erreur de manière exhaustive — 21
      endpoints, § 5.1 à § 5.21, avec la table de correspondance § 5.22.
- [x] **Chaque état du cycle de vie d'une version a un producteur nommé** — `draft`
      (§ 5.5), `in_review` (§ 5.9, acte `submit`), `signed` / `refused` (§ 5.8),
      `published` + `published_at` (§ 5.10, acte `publish`). Aucun
      des 21 endpoints n'écrit `status` ou `published_at` par un autre chemin (§ 4.6.1,
      § 5.0, ADR-9).
- [x] **Chaque réponse qui rend une tuile rend son seuil** — `threshold` est présent
      dans § 5.2, § 5.3 et § 5.13, dans la forme fixée une seule fois en § 2.3, avec
      `defined_at` comme unique horodatage (B5) et sans objet partiel possible. La
      règle « aucune date de seuil n'est rognée » est dans le **contrat du composant**
      (§ 2.3), pas dans un écran.
- [x] Le graphe de dépendances est sans cycle — `dependency-check` : `cycles: []`.
- [x] L'ordre d'implémentation est cohérent avec les dépendances — 4 vagues, persistées
      par `dependency-check --write` dans `state.json → index.impl_waves`. **Une arête
      a été inversée depuis le dernier `--write`** (§ 6, ADR-10) : `state.json` doit être
      rejoué, le document est à jour.
- [x] Les décisions d'architecture non triviales sont documentées en ADR — 10 décisions,
      § 7 (table) et § 7.1 (détail), dont les six imposées par le cadrage : `signer_id ≠ author_id`
      et sa non-délégabilité, la restriction appliquée dans la requête, `computed_at` de la source,
      l'assemblage fixe, l'export en tâche de fond, et le journal filtré selon les droits du lecteur.
- [x] **Aucun `error_code` n'est levé sur une lecture** — B17 / E17 sont des **états
      rendus** : `OWNER_INACTIVE` reste `409` dans `ERROR_HTTP_STATUS` et dans § 5.22,
      mais n'est levé que par un acte d'écriture. Les quatre lectures (§ 5.3, § 5.6,
      § 5.7, § 5.13) répondent `200` avec `officiality: "stale_owner"`, et la colonne
      « État d'UI » de § 5.22 ne présente plus un rendu comme le résultat d'un `409`.
- [x] La structure de dossiers cible est définie (§ 1.2).
- [x] La conformité aux standards de `.forge/benchmarks.md` est vérifiée (§ 1.3).
- [x] Les pathologies de `archetypes.md` § 9 sont traitées avec leur porte mécanique (§ 3.7).
- [x] Aucun `{{PLACEHOLDER}}` résiduel.

**Points ouverts signalés à l'orchestrateur** : `F-001` (rôle de signataire non
pourvu) et `F-002` (entrepôt de test seedé non obtenu) ne sont pas des livrables de la
Phase 4 et ne peuvent pas être résolus ici. `F-002` bloque la **démonstration** de B7,
donc la clôture de `restriction-lignes` et de `export-provenance`.

**Statut** : `draft` → en attente de validation.