---
type: implementation-plan
slice: error-handling
module: foundations
status: identified
generated_at: 2026-09-30
derived_from:
  - .forge/architecture.md
  - .forge/prd.md
  - .forge/conventions.md
conventions_ref: .forge/conventions.md
---

# Plan d'implémentation — fondation `error-handling`

> **Vocation de ce document.** Produit en Phase 4 à partir de l'architecture § 2.5. La
> Phase 5 l'approfondit et le valide : statut `identified`, pas `planned`.

## 1. Résumé

Enum **fermée** d'`error_code` partagée entre le client et le serveur, correspondance
`code → statut HTTP` en une seule maison, et distinction explicite entre **vide**,
**erreur** et **refus**. Ne dépend d'aucune autre fondation.

**Règles** : B5, B6, B7, B10 · **Edge cases** : E1, E2, E3, E11, E13, E15
**Contraintes** : 7.2

## 2. Contrats de données

Contrats : architecture § 2.5 (`ERROR_CODES`, `ErrorCode`, `ERROR_HTTP_STATUS`,
`ApiErrorBody`, `ApiError`, `ListOutcome`) et § 5.20 (table de correspondance complète,
avec la colonne « état d'UI »).

Fichier : `src/server/errors/contracts.ts` + `src/shared/schemas/error.schema.ts`
(même source, importée par le client).

## 3. Algorithmes critiques

### 3.1 La table est fermée et totale (couvre 7.2, `conventions.md`)

```
1  ERROR_CODES est un tuple `as const` : ajouter un code est une modification
   volontairement visible, pas un ajout de chaîne dans un appel.
2  ERROR_HTTP_STATUS est un Record<ErrorCode, number> EXHAUSTIF :
   TypeScript refuse de compiler si un code n'a pas de statut.
   → impossible d'ajouter un code sans décider de son statut HTTP.
3  toErrorBody(code) lit la SEULE table. Aucun endpoint n'écrit `res.status(403)`
   à la main : sinon chaque endpoint invente son libellé et l'UI ne sait plus
   quoi proposer (`conventions.md`, « Gestion d'erreur standard »).
```

### 3.2 vide ≠ erreur ≠ refus

```
ListOutcome<T> =
  | { status: 'ok';    items; total }
  | { status: 'empty'; reason: 'no_row_in_period' | 'resolved_scope_empty' | 'filtered_to_zero' }
  | { status: 'error'; code; retryable }

ReadOutcome (dans query-engine) ne contient PAS de cas 'error' :
  les pannes de source sont des ÉTATS (`source_unavailable`, `too_slow`),
  pas des erreurs HTTP — sauf pour le transport, qui renvoie 503/504.

Règle de rendu :
  ok    + items = []  → impossible : `ok` exige total > 0
  empty               → rendu « aucune donnée » + commande de réparation
  error / 503 / 504   → rendu d'échec + dernière valeur connue et SA DATE
  403 / 404           → refus (tuile non rendue) ou ressource absente
```

> Un `[]` et « échec » sont deux états distincts : les confondre transforme une panne
> réseau en affirmation commerciale (`archetypes.md` § 9, « une absence présentée
> comme un zéro »). C'est la pathologie la plus coûteuse de ce produit, parce qu'elle
> touche l'écran le plus lu.

### 3.3 Journalisation technique vs journal d'accès (couvre B10, C10)

```
DANS access_log :
  ✓ actor_id, resource_kind, resource_slug, outcome, error_code, request_id, occurred_at
DANS le journal technique :
  ✓ request_id, error_code, message technique
  ✗ JAMAIS la payload brute (données clients, RGPD)
  ✗ JAMAIS `source_ref` d'une vue : c'est un identifiant métier, il va dans
    access_log, pas dans une ligne d'erreur technique
```

### 3.4 `ApiError` et 404 indistinguable ≠ journalisation indistinguable

```
1  ressource inexistente OU invisible pour l'appelant → MÊME réponse 404,
   MÊME message. L'existence d'une ressource n'est pas divulguée à quelqu'un
   qui n'y a pas droit.
2  MAIS le refus est journalisé CÔTÉ SERVEUR avec l'identité résolue, la ressource
   visée et le motif. Sans cela, l'obscurité demandée au client détruit exactement
   la piste que le journal doit conserver.
3  403 signifie « le refus est connu » : le droit est calculé et la réponse nomme
   ce qui manque. Un 403 dit « à qui il faut demander », un 404 ne le dit pas.
```

## 4. Plan de composants

Aucun composant d'interface. La fondation est serveur, plus un module client qui
expose `ERROR_HTTP_STATUS` et les messages d'affichage (jamais les messages serveur,
qui sont des messages d'API).

## 5. Gestion d'état

| Donnée | Portée | Stockage | Initialisation | Mise à jour |
|---|---|---|---|---|
| `ERROR_CODES` | compilée dans le bundle | `src/server/errors/contracts.ts` | Au build | Jamais à l'exécution |
| État d'une liste | composant serveur | `ListOutcome` | Par requête | Revalidation |
| Dernière valeur connue | serveur | `query_cache` (24 h) | Après une lecture réussie | Purge à 24 h |

## 6. Traçabilité des règles

| ID | Règle | Implémentée où | Approche |
|---|---|---|---|
| B5 | Date de calcul issue de la source | Table § 5.20 + `unknown_freshness` | Aucun code n'est levé pour « pas de date » : c'est un état |
| B6 | Fraîcheur absente ⇒ « inconnue » | Idem | `computed_at: null` n'est pas une erreur |
| B7 | La restriction est connue quand elle est calculée | § 3.4 étape 3 | `SCOPE_DENIED` 403 avec la liste des équipes manquantes |
| B10 | Les refus sont journalisés | § 3.4 étape 2 | 404 indistinguable au client, refusal distingué au journal |
| E2 | Aucune donnée ≠ zéro | § 3.2 | `ListOutcome` : `empty` avec une raison |
| E11 | Calcul trop long ≠ partiel | § 3.2 | État `too_slow` + dernière valeur datée |
| E13 | Échec d'export ≠ fichier partiel | Table § 5.20 | `state = 'failed'` avec `error_code`, `artifact = null` |
| E15 | Périmètre résolu vide ≠ zéro | § 3.2 | `empty` / `resolved_scope_empty` |

| ID | Contrainte | Comment elle est respectée |
|---|---|
| 7.2 | Toute erreur 5xx journalisée avec `request_id` et `error_code`, jamais la payload | § 3.3 |
| 7.2 | Le journal d'accès est en écriture seule | Traité par `access-log` |

## 7. Pièges à éviter

- **Un `error_code` libre dans une réponse** — ⚠️ Ne jamais écrire `error_code: 'SOMETHING_FAILED'`.
  L'interface décide retry, message et contact admin sur le **code** ; une chaîne libre oblige
  chaque écran à la deviner.
- **Un `res.status(403)` écrit en dur** — ⚠️ Ne pas court-circuiter `ERROR_HTTP_STATUS`. La
  correspondance est en un seul endroit, exhaustivement typée ; un statut écrit à la main finit par
  diverger du `error_code` qu'il accompanye.
- **`Err() => []` ou `Err() => { status: 'ok', items: [] }`** — ⚠️ Ne jamais produire `ok` avec une
  liste vide pour une panne. C'est la pathologie « une absence présentée comme un zéro » : la panne
  devient une affirmation commerciale.
- **Un 403 pour une ressource dont on ignore l'existence** — ⚠️ Ne pas distinguer. La réponse est
  `404` dans les deux cas ; le refus est journalisé côté serveur.
- **Un `computed_at` manquant traité comme une erreur** — ⚠️ Ne pas lever un code. B6 : c'est un
  état, « fraîcheur inconnue ». Le faire casserait un indicateur par ailleurs parfaitement valide.
- **La payload brute dans une erreur 500** — ⚠️ Ne jamais. Données clients, RGPD : seul
  `request_id` et `error_code` sortent.

## 8. Dépendances

Aucune. Consommée par `consultation-indicateur` en vague 2. C'est une fondation, et non
une slice, précisément parce que `consultation-indicateur` est la slice la plus couplée du
graphe : sans enum partagée, elle écrirait ses propres libellés et les autres slices
inventeraient les leurs.

## 9. Checklist de tâches

- [ ] `ERROR_CODES` en `as const`, importé par le client **et** le serveur
- [ ] `ERROR_HTTP_STATUS` exhaustif (le compilateur le vérifie)
- [ ] `ApiError` + `toBody(requestId)`
- [ ] `ListOutcome` et ses rendus par état dans les composants concernés
- [ ] Table des messages d'UI par `error_code` (§ 5.20)
- [ ] Test : `ERROR_CODES` sans code orphelin dans `ERROR_HTTP_STATUS`, et réciproquement
- [ ] Test : une panne ne produit jamais `ok` avec une liste vide

## 10. Critères d'acceptation

- [ ] Ajouter un `error_code` sans statut HTTP ne compile pas
- [ ] Aucun endpoint n'écrit un statut HTTP en dur
- [ ] vide, erreur et refus sont trois rendus distincts et non interchangeables
- [ ] 404 indistinguable au client, refus journalisé côté serveur
- [ ] Aucune erreur 5xx ne contient de payload

## 11. Plan de tests

| Cible | Scénarios | IDs couverts |
|---|---|---|
| `ERROR_HTTP_STATUS` | exhaustivité dans les deux sens | — |
| `ListOutcome` | `ok` avec items · `empty` × 3 raisons · `error` | E2, E15 |
| `toErrorBody` | message rédigé par code · `request_id` présent · pas de payload | 7.2 |
| Rendu | 503 → tuile `source_unavailable` datée · 504 → `computation_too_long` | E1, E11 |

**Statut** : `identified` — à approfondir et valider en Phase 5.
