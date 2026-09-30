---
type: implementation-plan
slice: restriction-lignes
module: acces
status: identified
generated_at: 2026-09-30
derived_from:
  - .forge/architecture.md
  - .forge/prd.md
  - .forge/design/design-system.md
  - .forge/design/screens/indicateurs.md
  - .forge/design/screens/tableau-de-bord.md
conventions_ref: .forge/conventions.md
---

# Plan d'implémentation — `restriction-lignes`

> **Vocation de ce document.** Produit en Phase 4 à partir de l'architecture. La Phase 5
> l'approfondit et le valide slice par slice : statut `identified`, pas `planned`.
>
> **Cette slice a un statut particulier** : elle n'a pas d'écran propre. Son livrable est
> une **preuve** — le test E2E de `conventions.md` sur l'entrepôt de test seedé — et sans
> cette fixture (constat `F-002`) elle ne peut pas être déclarée terminée. Ce n'est pas
> inconfortable : c'est non démontré.

## Sources

- **PRD** : `.forge/prd.md` — US-7 · B7, B8 · E5, E10
- **Architecture** : § 3.6, § 2.1, § 2.2, § 4.15, § 5.11, ADR-2, ADR-7
- **Design** : `IndicatorTile` — `permission_denied` **n'est pas un état**

## 1. Résumé de la slice

Garantir qu'aucun lecteur n'obtient par aucun chemin une ligne qu'il n'a pas le droit de
voir : écran, drill-down, export, API, cache. La restriction est appliquée **dans la
requête**, par construction, et vérifiée par une seconde passe côté serveur.

**User stories** : US-7 (Ne pas voir ce à quoi on n'a pas droit)
**Règles** : B7, B8 · **Edge cases** : E5, E10

## 2. Contrats de données (code)

### 2.1 Schémas de validation

```ts
// src/shared/schemas/scope.schema.ts
import { z } from 'zod';

export const teamCodeSchema = z.string().regex(/^[A-Z0-9][A-Z0-9-]{1,15}$/);

export const scopeSchema = z.object({
  teams: z.array(teamCodeSchema).min(1).max(50),
  period: z.object({
    from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    grain: z.enum(['day', 'week', 'month'])
  }).strict(),
  segment: z.record(z.string().max(64), z.string().max(64)).default({})
}).strict();
export type Scope = z.infer<typeof scopeSchema>;
```

### 2.2 Types et interfaces

```ts
// src/features/access/scope/scope.types.ts
import type { Scope } from '@/shared/schemas/scope.schema';

export interface ResolvedScope {
  readonly effective: Scope;      // scope_résolvé ET intersecté avec les droits
  readonly requested: Scope;      // ce que le client a demandé
  readonly removedTeamCodes: readonly string[];  // retraités par la restriction
  readonly narrowedByDefinition: boolean;        // scope_expr plus restrictif que le demandé
}

export interface ExcludedResource {
  readonly slug: string;
  readonly reason: 'SCOPE_DENIED';
  readonly missingTeamCodes: readonly string[];
}

/** La seule clé de cache compatible avec B7 : le périmètre fait partie de l'identité. */
export interface CacheKey {
  readonly queryHash: string;       // sha256(indicatorKey + versionId + scope canonique)
  readonly actorScopeHash: string;  // sha256(équipes accordées)
}

export interface ScopeEnforcer {
  resolve(requested: Scope, grantedTeamCodes: readonly string[]): ResolvedScope;
  assertNotWidened(resolved: ResolvedScope, origin: Scope): void;  // lève 422 si élargi
  isVisible(teamCode: string, resolved: ResolvedScope): boolean;    // re-vérification
}
```

### 2.3 Contrats API

Aucun endpoint propre. La restriction est appliquée dans :

| Surface | Point d'application |
|---|---|
| `GET /api/v1/indicators` (§ 5.2) | Filtrage des items + tableau `excluded` journalisé (E5) |
| `GET /api/v1/indicators/:slug` (§ 5.3) | `403 SCOPE_DENIED` avec la liste des équipes manquantes |
| `GET /api/v1/indicators/:slug/decomposition` (§ 5.7) | Scope hérité + re-vérification par ligne (E10) |
| `GET /api/v1/dashboards/:slug` (§ 5.11) | Tuiles interdites **absentes**, exclusions journalisées |
| `POST /api/v1/exports` (§ 5.15) | `403 EXPORT_SCOPE_DENIED` si le scope élargit (E6, B8) |
| `GET /api/v1/access-log` (§ 5.18) | `redacted_count` rendu visible (B25) |

## 3. Algorithmes critiques

### 3.1 `withScope` — l'unique porte de sortie (couvre B7, ADR-2)

```
ENTRÉES : scope ResolvedScope, plan (scoped) → { text, params }
1  REFUSER un scope vide : `teams.length = 0` → AccessDecision.allowed = false
   (fail-closed : un défaut de droit est un refus, jamais un accord)
2  APPENDRE le prédicat obligatoire :
     text   = text + ' AND <team_column> = ANY($scope::text[])'
     params = [...params, scope.effective.teams]
   → AUCUNE clause WHERE ne peut être écrite sans celle-ci : le plan est
     construit par une fonction qui reçoit la clause, pas une chaîne libre
3  GARDER scope_résolvé dans la réponse (`resolvedScope`) pour qu'il soit affichable
4  exécuter avec timeout 30 s, 2 tentatives si retryable
5  ÉCRIRE dans query_cache avec la clé (queryHash, actorScopeHash)
```

### 3.2 `enforceOnRows` — seconde passe, obligatoire (couvre E10)

```
ENTRÉES : lignes, resolved ResolvedScope
1  POUR CHAQUE ligne : SI !isVisible(ligne.teamCode, resolved) → RETIRER
2  totalAvailable := totalShown APRÈS retrait
3  journaliser une entrée par ressource retirée : identité + ressource visée,
   JAMAIS le détail des lignes (B25)
4  renvoyer les lignes filtrées
```

### 3.3 `assertNotWidened` (couvre B8, E6)

```
1  SI origin.teams ⊄ requested.teams OU origin.période ⊋ requested.période
     → 403 EXPORT_SCOPE_DENIED
     message : « Export refusé : le périmètre demandé dépasse celui de l'écran.
                Périmètre autorisé : équipes {…}, période {…}. »   (E6)
2  SINON → accepter, et FROISSER le scope dans export_job.scope_snapshot
```

### 3.4 Porte mécanique (pas une intention)

| Porte | Mécanisme |
|---|---|
| Un seul chemin vers l'entrepôt | Règle ESLint `no-restricted-imports` : `server/query/driver.ts` est le seul fichier autorisé à importer le pilote |
| Le filtre ne peut pas être oublié | `withScope()` construit le SQL ; aucun appelant n'écrit de `WHERE` |
| Le cache ne mélange pas deux périmètres | Clé composite `(query_hash, actor_scope_hash)` |
| L'accès ne s'élargit pas | Résolution des droits recalculée **à chaque requête**, jamais lue depuis le cookie |
| Une perte d'accès est immédiate | `session.revoked_at` + réévaluation des groupes (E14) |

## 4. Plan composants

### 4.1 Arbre de composants

Aucun composant nouveau. La slice modifie le comportement de deux écrans :

```
IndicatorsPage        → items filtrés + excluded[]
DashboardPage         → tiles interdites ABSENTES, excluded[] rendu dans un panneau
                       discret « 1 indicateur non consultable sur ce tableau »
IndicatorTile         → l'état `permission_denied` N'EST PAS RENDU
```

### 4.3 États par écran

| Écran | État | Condition | Rendu |
|---|---|---|---|
| `indicateurs` | rempli | Tous les indicateurs lisibles | Grille de tuiles |
| `indicateurs` | rempli | Au moins un indicateur exclu | Grille + mention « 1 indicateur non consultable » |
| `tableau-de-bord` | rempli | Au moins un indicateur exclu (E5) | Tuiles autorisées + `excluded` listé, journalisé |
| `tableau-de-bord` | vide | Aucun indicateur lisible | « aucune donnée sur la période » — **pas** « accès refusé » |
| `indicateur-detail` | 403 | Accès direct par URL à un indicateur interdit | Message « Vous n'avez pas accès à l'équipe {…} » (le refus est connu) |

## 5. Gestion d'état

| Donnée | Portée | Stockage | Initialisation | Mise à jour |
|---|---|---|---|---|
| Droits accordés | serveur | `session` + résolution à chaque requête | Par requête | Jamais en cache client |
| Scope résolu | serveur | `ResolvedScope` dans la réponse | Par requête | — |
| Clé de cache | serveur | `(query_hash, actor_scope_hash)` | Par requête | Purge à 24 h |

> Le cookie ne contient **que** un identifiant opaque de session. Ni équipe, ni droit, ni nom :
> une perte d'accès doit s'appliquer à la lecture suivante, sans intervention (E14).

## 6. Traçabilité des règles

| ID | Règle (PRD) | Implémentée où | Approche |
|---|---|---|---|
| B7 | La restriction porte sur la donnée, pas sur l'affichage | § 3.1, § 3.2, ADR-2 | Filtre SQL obligatoire + re-vérification |
| B8 | L'export ne peut pas élargir le périmètre | § 3.3 | `assertNotWidened` + `scope_snapshot` figé |
| B25 | Le journal est filtré selon les droits de son lecteur | § 5.18 `redacted_count` | Filtre dans `access-log`, hors de la slice |
| B9 | Aucun accès public | `dashboard_grant` sans `token` ni `public` | Absence structurelle |

| ID | Edge case | Approche | Où |
|---|---|---|---|
| E5 | Lecteur ouvrant un dashboard avec un indicateur interdit | Tuile absente, `excluded` complet, exclusion journalisée | `listReadableIndicators` |
| E10 | Lecteur autorisé sur un client, pas sur un autre | Lignes hors périmètre retirées avant réponse, total recalculé | `enforceOnRows` |
| E14 | Groupe d'accès modifié | Nouvelle composition à la prochaine lecture, journalisée | `actor_group_member.valid_to` |

| ID | Contrainte | Comment elle est respectée |
|---|---|
| C1 | L'entrepôt n'est jamais écrit | Connexion de lecture seule ; filtre pushed down |
| C10 | Données personnelles : isolation par ligne | Le périmètre est une condition de la requête, pas une clause `WHERE` applicative |
| C6 | Trois mois | Aucune nouvelle dépendance : la slice ne fait que câbler deux fondations |

## 7. Pièges à éviter

- **Un filtre d'interface** — ⚠️ Ne pas filtrer les lignes après la requête « pour gagner du temps ».
  L'export, le drill-down, le cache et l'API contournent tous l'écran ; un filtre d'interface
  laisse la ligne interdite dans la file d'export et dans le cache (ADR-2).
- **Un cache indexé par `indicator_key` seul** — ⚠️ Ne pas mutualiser les résultats entre périmètres
  différents. Le périmètre est dans la clé de cache ; sans cela, la restriction devient une fuite.
- **Un `403` sur un indicateur dont on ne connaît pas l'existence** — ⚠️ Ne pas distinguer « existe
  mais interdit » de « n'existe pas » : la réponse est `404` dans les deux cas, et le refus est
  journalisé côté serveur. Un `403` divulgue ce qu'un `404` cache.
- **Un placeholder « accès refusé »** — ⚠️ Ne pas rendre une tuile grisée : elle confirme
  l'existence de l'indicateur, et E5 demande l'inverse.
- **Un export qui réévalue le périmètre** — ⚠️ Ne pas recalculer les droits au moment de la
  production. Le `scope_snapshot` est figé à la demande : c'est ce qui fait que l'export porte
  exactement le périmètre de l'écran d'origine (B8).
- **Déclarer la slice terminée sans la fixture seedée** — ⚠️ Ne pas valider sur un jeu de données
  synthétique. Un jeu synthétique ne prouve rien sur les lignes réelles ; B7 exige une
  **démonstration** (constat `F-002`).

## 8. Dépendances

| Dépend de | Nature | Statut | Fallback si absent |
|---|---|---|---|
| `auth` | `resolveIndicatorAccess`, `AccessDecision` fail-closed, réévaluation par requête | vague 0 | Aucun : fail-closed signifie « tout refusé », pas « tout permis » |
| `query-engine` | `withScope()`, `query_cache` à clé composite | vague 0 | Aucun : sans filtre pushed down, la règle n'est pas appliquée |

## 9. Checklist de tâches

- [ ] Règle ESLint interdisant l'import du pilote hors de `driver.ts`
- [ ] `withScope()` : prédicat obligatoire, `resolvedScope` renvoyé
- [ ] Clé de cache composite `(query_hash, actor_scope_hash)`
- [ ] `enforceOnRows` sur la décomposition, sur l'export et sur le journal
- [ ] `assertNotWidened` sur `POST /api/v1/exports`
- [ ] `excluded[]` + journalisation sur la liste et sur le dashboard (E5)
- [ ] **Test E2E** : deux profils, même dashboard, entrepôt de test seedé
- [ ] Test d'intégration : perte d'accès ⇒ lecture suivante refusée (E14)

## 10. Critères d'acceptation

- [ ] B7 : aucune ligne interdite n'est lisible par l'écran, le drill-down, l'export ni l'API
- [ ] B8 : un export ne peut pas élargir le périmètre ; le refus nomme le périmètre autorisé
- [ ] E5 : un indicateur interdit n'est pas rendu, et son exclusion est journalisée
- [ ] E10 : le total affiché reste cohérent avec les lignes visibles
- [ ] E14 : un compte qui perd son accès cesse d'accéder à la lecture suivante
- [ ] Le cache ne sert jamais un résultat calculé pour un autre périmètre

## 11. Plan de tests

| Cible | Scénarios | IDs couverts |
|---|---|---|
| `withScope` | scope vide refusé · prédicat présent dans le SQL · `resolvedScope` renvoyé | B7 |
| `enforceOnRows` | ligne hors périmètre retirée · total recalculé · journal sans détail de lignes | B7, B25, E10 |
| `assertNotWidened` | élargissement d'équipes refusé · élargissement de période refusé | B8, E6 |
| `query_cache` | deux périmètres différents n'échangent aucun résultat | B7 |
| **E2E (bloquent)** | profil « équipe » et profil « sans droit » sur le même dashboard partagé | **B7, E5, E10** |

**Statut** : `identified` — non clôturable avant l'accord sur l'entrepôt de test seedé (`F-002`).

**Déviation par rapport à `conventions.md`** : aucune. La règle « le scope est injecté par
un seul point d'entrée » est appliquée ici et vérifiée par lint, sans ajout de convention.
