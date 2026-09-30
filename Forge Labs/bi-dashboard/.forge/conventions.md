---
type: conventions
status: approved
generated_at: 2026-09-30
---

# Conventions techniques — Amberline

> Document unique. Tous les plans d'implémentation (Phase 5) y font référence plutôt que de reformuler ces règles.
> Ce document démarre en Phase 0 avec ce qui est connu, s'enrichit en Phase 4, et peut être amendé à tout moment.
> Toute règle vague (« gestion d'erreur cohérente ») doit être reformulée en règle concrète avant validation.
> Les sections marquées `À DÉCIDER EN PHASE 4` seront complétées lors de la conception de l'architecture.

---

## Stack technique cible

| Domaine | Choix | Version | Justification |
|---|---|---|---|
| Langage | TypeScript | 5.6 | Contrats de données partagés entre le moteur de requêtes et l'UI, sans duplication |
| Framework | Next.js (App Router, SSR) | 15.x | Rendu serveur pour un dashboard partagé **à une liste nominative**, ouvert sans installation par quelqu'un qui n'a pas d'accès à l'application installée. 15.x et non 14.x parce qu'un interne à 3 ans ne doit pas démarrer sur une branche qui a déjà 2 ans de migration. |
| Base de données | PostgreSQL | 16 | Métadonnées produit (vues, dashboards, permissions) ; l'entrepôt reste la source des chiffres |
| ORM / Query builder | Drizzle ORM | 0.31 | Schéma typé, migrations versionnées, pas de couche d'abstraction qui masque le SQL |
| State management | État serveur (App Router) + état local React + URL comme état de scope | — | Décidé en Phase 0 : le scope doit survivre au partage à une liste nominative (B9), donc il vit dans l'URL et pas dans un store |
| Formulaires | React Hook Form + Zod partagé | — | Décidé en Phase 0 : le schéma importé est celui de l'API, jamais une copie locale |
| Validation | Zod | 3.23 | Une seule grammaire pour les filtres, les définitions de vue et les contrats d'API |
| HTTP client | fetch natif + intercepteur maison | — | Le client parle à l'API interne ; le moteur de requête parle au driver d'entrepôt |
| Styling | CSS Modules + variables CSS | — | Les design tokens sont des variables CSS : aucune dépendance de styling à maintenir |
| Composants UI | Headless (radix-ui) + primitives maison | 1.0 | Tableaux et graphs densité haute exigent des composants que le design system contrôle |
| Icônes | lucide-react | 0.441 | Trame unique, tree-shakeable |
| Tests unitaires | Vitest | 1.6 | Même transformation que le build Next, pas de config supplémentaire |
| Tests composants | Testing Library + Vitest | — | Assertions sur le comportement rendu, pas sur l'implémentation |
| Tests E2E | Playwright | 1.46 | Le parcours qui ne peut pas être testé autrement est « un dashboard officiel partagé à une liste nominative, ouvert par quelqu'un qui n'a pas les droits sur une partie des lignes » — c'est le seul quidemontre B7 (E5, E10). Le choix est figé en Phase 0 : il décide de l'image CI (navigateurs, sharding) et impose une **fixture seedée dans l'entrepôt**, donc un accord d'infrastructure avec l'équipe data. |
| Identity provider | OIDC (fournisseur d'identité de l'entreprise) | — | 40 personnes, usage interne. **Bloquant en Phase 0** : sans fournisseur nommé, « fail-closed » n'est pas implémentable — il n'y a pas de source d'identité à qui refuser. |
| Stratégie de session | Cookie de session serveur, durée 8 h, rotation à chaque élévation de droit | — | Une session longue mais pas persistante au-delà de la journée de travail. Le partage ne passe **jamais** par un jeton dans l'URL : il n'y a pas de partage par lien (PRD § 9, B18 retiré), l'accès est une liste nominative ou un groupe d'annuaire (B9). |
| Exécution de fond | Worker Node + table de jobs en PostgreSQL | — | Un export de plusieurs millions de lignes est un job long, pas une requête HTTP. Décision de Phase 0 parce qu'elle introduit **un service de plus à héberger**. |
| Lint | ESLint | 8.57 | Config flat + règles Next |
| Format | Prettier | 3.3 | Aucun conflit de format dans les PR |
| Package manager | pnpm | 9.7 | Installation déterministe, lockfile unique |

---

## Structure de dossiers cible

```
amberline/
  src/
    app/                    # routes Next (App Router)
      (dashboard)/          # groupe authentifié
        d/[slug]/           # un dashboard
        v/[slug]/           # une vue
        compose/[slug]/     # composeur de vue
    components/             # primitives du design system
    features/
      views/                # module « vues »
      dashboards/           # module « dashboards »
      sharing/              # module « partage »
      freshness/            # module « fraîcheur »
    server/
      db/                   # schéma Drizzle, migrations
      query/                # moteur de requête vers l'entrepôt
      auth/                 # SSO, session, résolution des droits
    lib/                    # utilitaires transverses
  test/
    unit/
    components/
    e2e/
```

---

## Conventions de nommage

| Élément | Règle | Exemple |
|---|---|---|
| Fichier composant | kebab-case | `kpi-tile.tsx` |
| Fichier service/utilitaire | kebab-case | `query-planner.ts` |
| Fichier de validation | `<entité>.schema.ts` | `view-definition.schema.ts` |
| Fichier de type | `<entité>.types.ts` | `dashboard.types.ts` |
| Fichier de test | `<sujet>.test.ts` | `filter-scope.test.ts` |
| Routes / URLs | slug kebab-case, jamais d'identifiant technique | `/d/ca-mensuel-commercial` |
| Props de composant | `interface` suffixée `Props`, jamais `type` | `KpiTileProps` |
| Fonctions | verbe + objet ; un verbe = une responsabilité | `resolveDashboardAccess()` |
| Constantes | SCREAMING_SNAKE_CASE | `DEFAULT_TIME_RANGE` |

---

## Conventions de code

### Typage

- `strict: true`, `noUncheckedIndexedAccess: true`. Un `any` explicite est interdit sans commentaire le justifiant.
- Les identifiants métier sont des **types nominalisés** (`type ViewId = string & { __brand: 'ViewId' }`) : un slug de vue passé là où une dashboard est attendue doit être une erreur de compilation.
- Les montants et les durées ne sont jamais des `number` nus quand l'unité change selon le contexte (voir §Erreurs).

### Composants

- Un composant = un rendu + ses états. La logique de données vit dans `features/`, pas dans le composant.
- Les composants de `components/` ne font **jamais** d'appel réseau : ils reçoivent leurs données.

### State management

- **Lecture** : état serveur. Next.js App Router, composants serveur par défaut. Un client qui reçoit des chiffres reçoit un composant rendu ; il n'a pas de cache de données.
- **Écriture / composeur de vue** : état local React, avec Server Actions pour les mutations. Pas de store global : aucune donnée de produit n'est partagée entre deux arbres de composants.
- **URL comme état** : le scope sélectionné (équipe, période, segmentation) vit dans les query params. Un dashboard partagé à une liste nominative doit ouvrir exactement la vue que le destinataire a autorisée — donc l'état affichable est dans l'URL, jamais dans un store. Une adresse de dashboard restitue un état ; elle ne constitue jamais un droit (B9, et le partage par lien retiré en B18).
- **Polling** : un seul client, un seul intervalle, un seul point d'entrée. Le rafraîchissement affiche le `computed_at` de la source, pas l'heure du dernier fetch.

### Formulaires

- **React Hook Form + Zod**. Le schéma importé est celui de l'API (`shared/schemas/`), jamais une copie locale.
- Validation au `onBlur`, pas seulement au submit.
- Une erreur de validation est affichée **au champ**, avec un libellé d'action, et jamais dans un toast qui disparaît.

### Data fetching

- Toute lecture de chiffres passe par `server/query/`. Aucun composant n'exécute de SQL ni de requête ad hoc.
- **Le scope est injecté par un seul point d'entrée**, pas par une convention par fichier. Une règle du type « chaque requête filtre » est une règle qu'on oublie au moins une fois ; le filtre obligatoire est appliqué par `withScope()`, seul point où l'entrepôt est appelé. Un appel direct au driver est interdit et vérifié par lint.
- Toute réponse porte `computed_at` et `source_ref` :
  - `computed_at` est **l'horodatage du snapshot dans l'entrepôt**, jamais l'heure de notre requête. Un champ de fraîcheur calculé chez nous décrit notre lecture, pas la donnée : il mentirait exactement sur le cas qui compte, une vue de la nuit précédente.
  - Si l'entrepôt n'expose pas cet horodatage, le champ est `null` et l'interface affiche « fraîcheur inconnue ». On ne comble pas avec notre propre horloge.
  - `source_ref` est l'identifiant de la matérialisation interrogée, displayed tel quel.

---

## Emplacement des données

| Donnée | Stockage | Rétention | Conséquence |
|---|---|---|---|
| Chiffres métier | Entrepôt, **lecture seule** | Inchangé | Amberline n'écrit jamais dans l'entrepôt |
| Vues, dashboards, partage, droits | PostgreSQL | Durable | Métadonnées produit |
| Journal d'accès et d'export | PostgreSQL, table append-only | 1 an, purgée par job | Hors entrepôt : l'entrepôt n'a pas de RLS et sesPurgeplans peuvent être discutés par l'équipe data |
| File d'export | PostgreSQL, table de jobs | 7 jours après téléchargement | Un export est un job long |
| Cache court des résultats | PostgreSQL, indexé sur (hash de requête, `computed_at`, scope) | 24 h | Évite de marteler l'entrepôt |

> **PostgreSQL porte donc des données personnelles**, et pas seulement des métadonnées : chiffrement au repos, isolation par ligne sur le journal d'accès, PITR, politique de rétention et accord de traitement des données avec le sous-traitant d'hébergement sont des prérequis de mise en production, pas des improvements.

---

## Gestion d'erreur standard

### Erreurs réseau

```
Toute lecture de données passe par server/query/query-engine.ts, via withScope().
1. Timeout explicite : 30 s, configurable par type de requête.
2. Échec → QueryError { code, retryable, detail }.
3. retryable === false : aucun retry. La réponse remonte un état d'erreur visible.
4. retryable === true : 2 tentatives, backoff 500 ms puis 2 s.
5. Une erreur n'est JAMAIS rendue comme une liste vide : `[]` et « échec » sont deux états distincts
   (cf. archetypes.md §9 « une absence présentée comme un zéro »).
6. Toute réponse d'API porte un `error_code` issu d'une enum fermée partagée client/serveur
   (QUERY_TIMEOUT, WAREHOUSE_UNREACHABLE, SCHEMA_UNKNOWN, SCOPE_DENIED, PLAN_INVALID…).
   L'interface décide retry / message / contact admin sur le code, jamais sur une chaîne libre :
   sinon chaque endpoint invente son libellé et l'UI ne sait plus quoi proposer.
```

### Erreurs de validation

```
Zod à la frontière : parse de la requête entrante, parse de la réponse de l'entrepôt.
Un échec de validation du plan de requête est un 422 avec la liste des chemins fautifs,
pas un 500 : le plan vient du client.
Les schémas Zod de l'API sont la seule source de validation : aucune règle n'est dupliquée
côté client. Le client importe le schéma, il ne le réécrit pas.
```

### Erreurs serveur

```
- 404 : slug de vue ou de dashboard inexistant, ou invisible pour l'appelant. Même réponse
  dans les deux cas — l'existence d'une ressource n'est pas divulguée à quelqu'un qui n'y a pas droit.
- 403 : le droit est calculé, et le refus est connu : `SCOPE_DENIED`, avec la liste des équipes
  manquantes. Un 403 dit « à qui il faut demander », un 404 ne le dit pas.
- 404 indistinguable ≠ journalisation indistinguable : un 404 est renvoyé au client, mais **le refus
  est journalisé côté serveur** avec l'identité résolue, la ressource visée et le motif. Sans cela,
  l'obscurité demandée au client détruit exactement la piste que le journal doit conserver.
- 409 : collision de slug, ou modification concurrente détectée par version.
- 422 : définition de vue invalide (schéma de vue).
- 503 : entrepôt injoignable. Distingué de 500 : c'est transitoire et l'interface doit le dire.
- Toute erreur 5xx est journalisée avec l'identifiant de requête et le `error_code`, **jamais** avec
  la payload brute (données clients, RGPD). Le `source_ref` d'une vue est un identifiant métier :
  il est journalisé dans le journal d'accès, pas dans la ligne d'erreur technique.
```

---

## Stratégie de tests

### Tests unitaires

- Framework : Vitest
- Pattern : arrange / act / assert, une fonction métier par cas
- Emplacement : `test/unit/<domain>/<sujet>.test.ts`, le chemin du test suit celui du source
- Commande : `pnpm test:unit`

### Tests de composants

- Framework : Testing Library
- Pattern : rendu par état (vide, chargement, rempli, erreur) — pas par implémentation interne
- Mocking : `server/query` mocké au niveau de sa frontière publique, jamais en interne
- Emplacement : `test/components/<composant>.test.tsx`
- Commande : `pnpm test:components`

### Tests E2E

- Framework : Playwright 1.46
- Pattern : parcours utilisateur complet sur l'API réelle + entrepôt de test seedé. Deux profils au minimum : un utilisateur d'équipe, un utilisateur sans droit.
- Emplacement : `test/e2e/<parcours>.spec.ts`
- Commande : `pnpm test:e2e`
- **Prérequis d'infrastructure** : l'entrepôt de test est seedé par un script versionné (`test/e2e/fixtures/seed.sql`). Cet accord avec l'équipe data est à obtenir **avant** la Phase 4. Il ne s'agit pas de confort de test : B7 exige de **démontrer** l'isolation par ligne sur des lignes réelles (E5, E10). Sans lui, le critère de sécurité n'est pas vérifié — il n'est pas inconfortable, il est non démontré. Voir `prd.md` § 12.1, point 3.

---

## Patterns retenus

| Pattern | Quand l'utiliser | Exemple |
|---|---|---|
| Requête nommée + CTE | Toute lecture de chiffres | `buildKpiQuery(scope)` produit un SQL stable et testable hors base |
| Freshness stamp | Toute réponse contenant des chiffres | `computed_at` + `source_ref` affichés à l'écran |
| Slug + version | Toute ressource partageable | `/d/ca-mensuel?v=3` — une adresse de dashboard restitue un état précis, **sans jamais constituer un droit** (B9, et le partage par lien retiré en B18) |
| Deny by default | Toute résolution de droit | `resolveDashboardAccess()` refuse par défaut, n'accorde jamais par défaut |
| État d'erreur distinct de l'état vide | Toute liste | `status: 'error'` et `status: 'empty'` sont deux membres d'une union |

---

## Commandes

```bash
pnpm dev
pnpm build
pnpm lint
pnpm typecheck
pnpm test
pnpm test:e2e
```

---

## Ce qui n'appartient PAS à ce document

Toute règle spécifique à une seule slice va dans le plan d'implémentation de cette slice, signalée comme déviation dans la section « Déviations par rapport à conventions.md ».

---

## Checklist de gate

- [ ] Toute décision (nommage, structure, gestion d'erreur, tests) est actionnable.
- [ ] La stack cible est entièrement spécifiée (framework, state, forms, HTTP, styling, tests).
- [ ] Le document ne contient aucune règle spécifique à une seule slice.
- [ ] Les commandes (dev, build, lint, test) sont documentées et fonctionnelles.
- [ ] Aucune section marquée `À DÉCIDER EN PHASE 4` ne subsiste après la Phase 4.

**Statut** : `draft` → enrichi à chaque phase, verrouillé en Phase 4.