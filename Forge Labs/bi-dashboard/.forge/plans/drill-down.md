---
type: implementation-plan
slice: drill-down
module: indicateurs
status: identified
generated_at: 2026-09-30
derived_from:
  - .forge/architecture.md
  - .forge/prd.md
  - .forge/design/design-system.md
  - .forge/design/screens/decomposition.md
conventions_ref: .forge/conventions.md
---

# Plan d'implémentation — `drill-down`

> **Vocation de ce document.** Produit en Phase 4 à partir de l'architecture. La Phase 5
> l'approfondit et le valide slice par slice : statut `identified`, pas `planned`.

## Sources

- **PRD** : `.forge/prd.md` — US-5 · B15, B7 · E2, E10
- **Architecture** : § 3.3, § 2.2, § 4.18, § 5.7, ADR-2
- **Design** : `decomposition.md` — `DataTable` variante `drill`

## 1. Résumé de la slice

Ouvrir, depuis une valeur, les lignes qui la composent — sous **le même périmètre** et
**les mêmes droits** que l'écran d'origine. C'est la troisième étape de la boucle
*surveiller → détecter → investiguer* : sans elle, l'alerte ne sert qu'à constater qu'il
y a un problème.

**User stories** : US-5 (Investiger)
**Règles** : B15, B7 · **Edge cases** : E2, E10

## 2. Contrats de données (code)

### 2.1 Schémas de validation

```ts
// src/shared/schemas/decomposition.schema.ts
import { z } from 'zod';
import { teamCodeSchema } from './scope.schema';

export const decompositionQuerySchema = z.object({
  teams: z.string().transform(s => s.split(',').filter(Boolean))
                  .pipe(z.array(teamCodeSchema).min(1).max(50)),
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  grain: z.enum(['day', 'week', 'month']),
  depth: z.coerce.number().int().min(1).max(3).default(1),
  parent: z.string().max(120).optional(),
  sort: z.enum(['contribution_desc', 'label_asc']).default('contribution_desc'),
  limit: z.coerce.number().int().min(1).max(500).default(100),
  cursor: z.string().max(200).optional()
}).strict();
```

### 2.2 Types et interfaces

```ts
// src/features/indicators/drill-down/decomposition.types.ts
import type { Scope } from '@/server/auth/contracts';

export interface DrillPathStep { readonly key: string; readonly label: string }

export interface DrillLine {
  readonly key: string;          // `line_key` : critère de départage TOTAL du tri
  readonly label: string;
  readonly value: number;
  readonly share: number;        // 0..1
  readonly teamCode: string;     // sert à re-vérifier le scope côté serveur
}

export type DecompositionOutcome =
  | { status: 'lines';  lines: readonly DrillLine[]; path: readonly DrillPathStep[];
      totalShown: number; totalAvailable: number; computedAt: string | null; sourceRef: string }
  | { status: 'empty';  reason: 'no_row_in_period' | 'resolved_scope_empty' }
  | { status: 'source_unavailable'; lastKnown: readonly DrillLine[] }
  | { status: 'too_slow';           lastKnown: readonly DrillLine[] };
```

### 2.3 Contrats API

- `GET /api/v1/indicators/:slug/decomposition` — architecture § 5.7

## 3. Algorithmes critiques

### 3.1 `readDecomposition` (couvre B15, B7, E10)

```
ENTRÉES : slug, query, actor, scopeDorigine
1  ASSERT query.teams = scopeDorigine.teams (comparaison ensembliste)
   écart → 422 « Paramètres de décomposition invalides. »
   Le drill-down ne peut pas élargir le périmètre : il ne fait qu'hériter (B15).
2  decision = auth.resolveIndicatorAccess(actor, slug, scopeDorigine)
   refus → 403 « Cette ligne n'appartient pas à votre périmètre. » + journalisation
3  SI query.parent fourni :
     ligne = lire la ligne parente dans l'entrepôt
     ligne absente        → 404
     ligne.teamCode ∉ decision.scope.teams → 403 + journalisation (E10)
4  outcome = queryEngine.readIndicatorLines({ indicatorKey, definitionVersionId,
                                              scope: decision.scope, depth, parent,
                                              sortBy, limit, offset }, signal)
   — le scope est celui de l'étape 2, PAS celui du client
5  RE-VÉRIFICATION serveur, obligatoire :
   POUR CHAQUE ligne : SI ligne.teamCode ∉ decision.scope.teams → RETIRER
   (défense en profondeur : si le filtre SQL a été contourné, la ligne ne sort pas)
6  totalAvailable = totalShown après retrait
   → il n'existe pas de total qui compte plus de lignes que le lecteur n'a le
     droit d'en voir (E10)
7  journaliser 'indicator' avec le scope Résolu
8  SELON outcome.state : value / empty (E2) / source_unavailable (E1) / too_slow (E11)
```

### 3.2 `buildDrillPath` (archétype § 4 — chemin de retour)

```
ENTRÉES : depth, parent, lignes lues
1  SI depth = 1 → path = [] (l'écran d'origine est la racine)
2  SINON → remonter la chaîne `parent_line_key` jusqu'à la racine
   chaque étape = { key, label } ; le dernier élément est la ligne courante
3  Rendre le chemin comme une pile de boutons, avec un ordre de retour stable
```

## 4. Plan composants

### 4.1 Arbre de composants

```
DecompositionPage (server)
├── Breadcrumb  Indicateurs › CA par client › Détail
├── DrillPath        (si depth > 1) : Boutons de retour, du plus proche au plus haut
└── DataTable variant="drill" state={loading|filled|empty_no_data|error|offline}
    ├── colonnes : ligne | valeur (mono) | part (mono, barre) | équipe
    ├── tri par contribution, critère de départage total sur `line_key`
    └── pagination par curseur (500 max par page)
```

### 4.2 Composants

| Composant | Type | Fichier cible | Props | State | Événements |
|---|---|---|---|---|---|
| `DecompositionPage` | Server | `src/app/(dashboard)/indicateurs/[slug]/decomposition/page.tsx` | `{ params, searchParams }` | — | — |
| `DrillPath` | Server | `src/features/indicateurs/drill-down/drill-path.tsx` | `{ path: DrillPathStep[] }` | — | navigation |
| `DataTable` | Server | `src/components/data-table.tsx` | architecture § 2.3 | — | tri, page suivante |
| `ContributionCell` | Server | `src/features/indicateurs/drill-down/contribution-cell.tsx` | `{ share: number }` | — | — |

### 4.3 États par écran

#### Écran : `decomposition`

| État | Condition | Composants affichés | Données |
|---|---|---|---|
| vide | Aucune décomposition demandée | — | — |
| chargement | Requête source au-delà du délai | `DataTable: loading` + dernière valeur connue et sa date (E11) | `lastKnown` |
| rempli | Lignes disponibles | Tableau `drill` + `DrillPath` si profondeur > 1 | `DecompositionOutcome` |
| erreur | Source indisponible | `DataTable: error` + « Réessayer » | `error_code` |
| vide-données | Aucune ligne sur la période | `DataTable: empty_no_data` « aucune donnée sur la période » + élargissement | E2 |
| hors-ligne | Perte de liaison en cours de session | `DataTable: offline` : dernier résultat affiché, **daté** | `lastKnown` |

### 4.4 Formulaires

Aucun. Le sélecteur de période et d'équipes est **partagé** avec l'écran d'origine : il
vit dans l'URL et n'est pas réinitialisé à l'arrivée sur la décomposition.

## 5. Gestion d'état

| Donnée | Portée | Stockage | Initialisation | Mise à jour |
|---|---|---|---|---|
| Scope | URL, **hérité** de l'écran d'origine | query params | Navigation depuis la tuile | Inchangé |
| Profondeur et parent | URL | `depth`, `parent` | Navigation | Clic sur le chemin |
| Lignes | serveur | `query_cache` par `(requête, périmètre)` | Rendu serveur | Revalidation |
| Tri et page | URL | `sort`, `cursor` | Défauts du design system | Clic sur colonne |

## 6. Traçabilité des règles

| ID | Règle (PRD) | Implémentée où | Approche |
|---|---|---|---|
| B15 | Le drill-down applique le même périmètre et les mêmes restrictions | § 3.1 étapes 1, 2, 4 | Le scope est hérité, jamais resaisi ; assertion d'égalité |
| B7 | Une ligne interdite n'est ni lisible, ni recalculable, ni exportable | § 3.1 étapes 4, 5 | Filtre dans le SQL **et** re-vérification serveur |

| ID | Edge case | Approche | Où |
|---|---|---|---|
| E2 | Aucune ligne sur la période | `status = 'empty'` | Étape 8 |
| E10 | Lecteur autorisé sur un client, pas sur un autre | Étapes 2, 3, 5, 6 | `403` sur la ligne parente ; retrait des lignes hors périmètre |

| ID | Contrainte | Comment elle est respectée |
|---|---|
| C1 | L'entrepôt n'est jamais écrit | Lecture seule via `withScope()` |
| 7.1 | Drill-down < 3 s | Pagination 500, cache 24 h, `limit` borné |
| 7.3 | Navigation clavier y compris pour le drill-down | `DrillPath` et tri sont des éléments focusables |

## 7. Pièges à éviter

- **Un sélecteur de période réinitialisé sur la décomposition** — ⚠️ Ne pas repartir d'une période
  par défaut. Le drill-down **hérite** du scope d'origine ; le changer ici romprait B15 et
  produirait un total incohérent avec l'écran précédent (E10).
- **Un total calculé avant le filtre de lignes** — ⚠️ Ne pas afficher un total agrégé puis des
  lignes filtrées. Les deux sont produits **après** application du scope, donc ils sont égaux par
  construction. Un total et un visible qui divergent sont le symptôme exact d'un filtre d'interface.
- **Une ligne parente accessible hors périmètre** — ⚠️ Ne pas se contenter de vérifier l'indicateur.
  La ligne parente porte son `team_code` : il est vérifié explicitement, sinon un lecteur descend
  vers une ligne d'un client qu'il n'a pas le droit de voir (E10).
- **Des valeurs de détail dans un dashboard** — ⚠️ Ne pas pré-afficher un échantillon de lignes dans
  une tuile. `benchmarks.md` § 5 écart 3 : un échantillon filtré n'est pas « représentatif », et le
  lecteur ne peut pas savoir lequel.

## 8. Dépendances

| Dépend de | Nature | Statut | Fallback si absent |
|---|---|---|---|
| `query-engine` | `readIndicatorLines`, `withScope` | vague 0 | Mock à la frontière de `server/query` |
| `consultation-indicateur` | `IndicatorTile` cliquable, scope d'origine | vague 2 | Aucun : le drill-down commence par une valeur |

## 9. Checklist de tâches

- [ ] Schéma Zod § 2.1 (bornes `depth`, `limit`)
- [ ] `readDecomposition` avec assertion de scope et re-vérification serveur (§ 3)
- [ ] `buildDrillPath` et le rendu du chemin de retour
- [ ] `DataTable` variante `drill` : tri par contribution, critère de départage total
- [ ] Test E2E E10 : deux profils, aucun client non autorisé visible
- [ ] Test : `total_shown === total_available` sur un scope restreint

## 10. Critères d'acceptation

- [ ] B15 : le scope de la décomposition est identique à celui de l'écran d'origine
- [ ] B7 : aucune ligne hors périmètre n'apparaît, à aucune profondeur
- [ ] E10 : le total affiché reste cohérent avec les lignes visibles
- [ ] US-5 : au-delà de deux niveaux, le chemin parcouru est affiché et permet le retour
- [ ] 7.1 : la décomposition s'affiche en moins de 3 secondes

## 11. Plan de tests

| Cible | Scénarios | IDs couverts |
|---|---|---|
| `readDecomposition` | scope hérité · scope élargi refusé · parent hors périmètre · profondeur 3 · pagination | B15, B7, E10 |
| `buildDrillPath` | profondeur 1 (chemin vide) · profondeur 3 (pile de 2 ancêtres) | US-5 |
| `DataTable` variante `drill` | `filled` · `empty_no_data` · `error` · `offline` daté | E1, E2 |
| E2E | profil « sans droit » sur le même indicateur qu'un profil « équipe » | B7, E10 |

**Statut** : `identified` — à approfondir et valider en Phase 5.
