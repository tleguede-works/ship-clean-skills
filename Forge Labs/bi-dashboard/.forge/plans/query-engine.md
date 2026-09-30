---
type: implementation-plan
slice: query-engine
module: foundations
status: identified
generated_at: 2026-09-30
derived_from:
  - .forge/architecture.md
  - .forge/prd.md
  - .forge/conventions.md
conventions_ref: .forge/conventions.md
---

# Plan d'implémentation — fondation `query-engine`

> **Vocation de ce document.** Produit en Phase 4 à partir de l'architecture § 2.2. La
> Phase 5 l'approfondit et le valide : statut `identified`, pas `planned`.

## 1. Résumé

Accès **lecture seule** à l'entrepôt : construction du SQL, injection **obligatoire** du
scope, lecture de `computed_at` et `source_ref` **dans la source**, traduction des pannes
en états distincts, cache court à clé composite. Ne dépend d'aucune autre fondation.

**Règles** : B5, B6, B7 · **Edge cases** : E1, E2, E3, E6, E10, E11, E15
**Contraintes** : C1

## 2. Contrats de données

Contrats : architecture § 2.2 (`ValueQuery`, `LineQuery`, `SeriesQuery`,
`WarehouseValue`, `ReadOutcome`, `LineOutcome`, `QueryError`, `QueryEngine`,
`withScope`). Schémas Zod : `warehouseValueSchema` (parse de la réponse de l'entrepôt).

Entités **non possédées** : architecture § 4.17 et § 4.18 (contrat de lecture imposé à
l'entrepôt). Entité possédée : `query_cache` (§ 4.15).

## 3. Algorithmes critiques

### 3.1 `buildKpiQuery(scope)` (couvre C1, B5, B7)

```
ENTRÉES : ValueQuery { indicatorKey, definitionVersionId, scope }
1  lire `definition_version` (formula, scope_expr, grain, unit)
2  construire :
     SELECT metric_value, metric_unit, computed_at, source_ref,
            resolved_scope
     FROM   <matérialisation de l'indicateur>
     WHERE  period_start >= $from AND period_end <= $to
       AND  <scope_expr de la définition>          -- restriction ÉCRITE par le propriétaire
       AND  <team_column> = ANY($teams::text[])     -- restriction de LECTEUR, non négociable
3  paramétrer : jamais de concaténation de valeurs dans le texte SQL
4  explain() retourne ce texte pour être testé HORS base
```

### 3.2 `withScope` (porte unique)

```
1  refuser un scope vide → QueryError SCOPE_DENIED (fail-closed)
2  appendre le prédicat obligatoire (voir § 3.1 étape 2)
3  timeout explicite : 30 s (TIMEOUT_READ_MS)
4  en cas d'échec :
     retryable = false → aucun retry, état d'erreur visible
     retryable = true  → 2 tentatives, backoff 500 ms puis 2 s
5  écrire dans `query_cache` avec la clé (query_hash, actor_scope_hash)
6  UNE FOIS l'appel direct au driver est interdit : règle ESLint
   `no-restricted-imports` sur `server/query/driver.ts`
```

### 3.3 `readIndicatorValue` (couvre B5, B6, E1, E2, E3, E11, E15)

```
1  exécuter via withScope
2  parser la ligne par warehouseValueSchema
     échec de parse → QueryError SCHEMA_UNKNOWN, retryable = false
3  SELON le résultat :
     0 ligne ET resolved_scope vide  → { state: 'empty', reason: 'resolved_scope_empty' } (E15)
     0 ligne ET scope non vide       → { state: 'empty', reason: 'no_row_in_period' }   (E2)
     1 ligne ET computed_at IS NULL  → valeur RENDUE, computed_at = null                 (B6)
     1 ligne                        → { state: 'value', value }
4  source injoignable   → { state: 'source_unavailable', lastKnown: cache si frais < 24 h } (E1)
   délai dépassé (504)  → { state: 'too_slow', lastKnown: cache si frais < 24 h }         (E11)
5  JAMAIS de conversion d'un échec en { value: 0 } ni en [] :
   « une absence présentée comme un zéro » (archetypes.md § 9)
```

### 3.4 `purgeCacheOlderThan` — le cache compatible avec B7

```
1  DELETE FROM query_cache WHERE expires_at < now()
2  NE PAS purger par indicateur : la clé porte le périmètre, donc deux périmètres
   différents n'échangent jamais de résultat
```

## 4. Plan de composants

Aucun composant d'interface. La fondation expose `withScope`, `QueryEngine` et
`query-planner`. `explain()` est la surface testable sans base : c'est elle qui permet de
vérifier que le prédicat de scope est **présent** dans le SQL produit.

## 5. Gestion d'état

| Donnée | Portée | Stockage | Initialisation | Mise à jour |
|---|---|---|---|---|
| Résultat de lecture | serveur | `query_cache` (24 h) | Après chaque lecture réussie | Purge planifiée |
| Clé de cache | serveur | `(query_hash, actor_scope_hash)` | Par requête | — |
| Plan SQL | serveur | `query-planner.ts` | Par version de définition | Uniquement au changement de version |

## 6. Traçabilité des règles

| ID | Règle | Implémentée où | Approche |
|---|---|---|---|
| B5 | Date de calcul **issue de la source** | § 3.1, § 3.3 étape 3 | Colonne `computed_at` de la matérialisation ; ADR-3 |
| B6 | Fraîcheur absente ⇒ « inconnue », jamais notre horloge | § 3.3 étape 3 | `computedAt: string \| null` : `null` est un état du type |
| B7 | Une ligne interdite n'est ni lisible ni recalculable ni exportable | § 3.1 étape 2, § 3.2 | Prédicat obligatoire appendre par `withScope` ; ESLint |
| B4 | La valeur publiée est celle de la version signée | `definitionVersionId` dans la requête | La formule et le périmètre de la version sont figés dans le SQL |

| ID | Edge case | Approche | Où |
|---|---|---|---|
| E1 | Source indisponible | `source_unavailable` + `lastKnown` daté | § 3.3 étape 4 |
| E2 | Aucune ligne sur la période | `empty` / `no_row_in_period` | § 3.3 étape 3 |
| E3 | Matérialisation pas rafraîchie | `computed_at` ancien ou `null` | § 3.3 |
| E11 | Calcul trop long | `too_slow` + `lastKnown` ; **jamais** de partiel | § 3.3 étape 4 |
| E15 | Périmètre résolu vide | `empty` / `resolved_scope_empty` | § 3.3 étape 3 |

| ID | Contrainte | Comment elle est respectée |
|---|---|---|
| C1 | L'entrepôt n'est jamais écrit | Connexion de lecture seule ; aucune clause DML dans `query-planner.ts` |
| C11 | L'interface de programme ne doit pas devenir le chemin principal | `withScope` n'est pas exposé hors du serveur |

## 7. Pièges à éviter

- **Un `computed_at` calculé chez nous** — ⚠️ Ne pas faire `now()` pour « dater » une valeur. Un
  champ de fraîcheur calculé chez nous décrit **notre lecture**, pas la donnée : il ment exactement
  sur la vue de la nuit précédente (ADR-3, B5).
- **Combler un `computed_at` null par l'heure du poste** — ⚠️ Ne pas le faire. B6 impose
  « fraîcheur inconnue ». Combler rend un état d'incertitude indiscernable d'un état normal.
- **`Err() => []` ou `Err() => 0`** — ⚠️ Ne jamais convertir un échec en liste vide ou en zéro. Ce
  sont deux memberships distincts de `ReadOutcome` : l'un se répare, l'autre aussi, mais l'utilisateur
  ne peut pas les distinguer s'ils sont confondus (`archetypes.md` § 9).
- **Un `ORDER BY contribution DESC` sans second critère** — ⚠️ Ne pas laisser un tri instable. Le
  SQL porte `ORDER BY contribution DESC, line_key ASC` : le résultat est reproductible.
- **Un cache par `indicator_key`** — ⚠️ Ne pas le faire. Le périmètre est dans la clé ; sans cela, la
  restriction de ligne devient une fuite entre deux lecteurs (B7).
- **Un accès direct au driver depuis une slice** — ⚠️ Ne pas écrire de `pool.query()` dans une
  feature. C'est ce qui a permis à des équipes de « juste cette fois » contourner le filtre ; la
  règle ESLint le rend impossible, pas découragé.

## 8. Dépendances

Aucune. Dépendue par cinq slices — le second point de contention du graphe
(architecture § 6.4), compensé par l'absence d'alternative : deux moteurs de requête
produiraient deux définitions de la fraîcheur.

## 9. Checklist de tâches

- [ ] `driver.ts` : pool de connexion **lecture seule**, timeout, redémarrage
- [ ] `query-planner.ts` : `buildKpiQuery`, `buildLineQuery`, `buildSeriesQuery`
- [ ] `withScope` : prédicat obligatoire, `resolvedScope` renvoyé, timeout, retry
- [ ] Règle ESLint interdisant l'import du pilote hors de `driver.ts`
- [ ] `query_cache` : clé composite, purge à 24 h
- [ ] **Test de contrat entrepôt** : colonnes `indicator_key`, `computed_at`, `source_ref`,
      `scope_fingerprint`, `team_code`, `line_key` présentes ; `computed_at` nullable
- [ ] Test unitaire sur `explain()` : le prédicat de scope est présent dans le SQL produit

## 10. Critères d'acceptation

- [ ] C1 : aucune écriture vers l'entrepôt n'est possible depuis le code applicatif
- [ ] B5 : la date retournée est celle de la source, pas celle de la requête
- [ ] B6 : `computed_at` absent ⇒ état « fraîcheur inconnue », jamais comblé
- [ ] B7 : le SQL produit contient toujours le prédicat de scope
- [ ] E2 : « aucune donnée sur la période » n'est pas une valeur à zéro
- [ ] E11 : un calcul trop long ne produit jamais de valeur partielle

## 11. Plan de tests

| Cible | Scénarios | IDs couverts |
|---|---|---|
| `buildKpiQuery` | prédicat de scope présent · scope vide refusé · `explain()` stable | B7, C1 |
| `readIndicatorValue` | valeur · `computed_at` null · périmètre vide · source injoignable · délai dépassé · schéma inconnu | B5, B6, E1, E2, E11, E15 |
| `query_cache` | deux périmètres différents n'échangent rien · purge à 24 h | B7 |
| Contrat entrepôt | colonne manquante ⇒ échec **bruyant** nommant la colonne | ADR-7 |

**Statut** : `identified` — le test de contrat entrepôt dépend de l'accès à l'entrepôt et
du **catalogue de l'entrepôt de test** (constat `F-002`).
