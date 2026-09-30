---
type: implementation-plan
slice: seuil-et-etat
module: indicateurs
status: identified
generated_at: 2026-09-30
derived_from:
  - .forge/architecture.md
  - .forge/prd.md
  - .forge/design/design-system.md
  - .forge/design/screens/indicateur-detail.md
  - .forge/design/screens/indicateurs.md
conventions_ref: .forge/conventions.md
---

# Plan d'implémentation — `seuil-et-etat`

> **Vocation de ce document.** Produit en Phase 4 à partir de l'architecture. La Phase 5
> l'approfondit et le valide slice par slice : statut `identified`, pas `planned`.

## Sources

- **PRD** : `.forge/prd.md` — US-4, US-11 · B11, B14 · E16
- **Architecture** : § 3.3, § 4.6, § 4.7, § 5.3, § 5.20
- **Design** : `IndicatorTile` état `out_of_band`, variante `target_missing`

## 1. Résumé de la slice

Dériver l'état sémantique d'un indicateur — dans la cible, hors cible, cible absente —
de la comparaison entre sa valeur et la **cible versionnée de sa définition**. La slice
ne colorie pas : elle produit un état. La couleur, l'icône et le texte sont le rendu de
cet état par `design-primitives`.

**User stories** : US-4 (Détecter une anomalie), US-11 (Comparer à une cible)
**Règles** : B11, B14

> **Ce qui n'est pas dans cette slice** : B12 (alerte une seule fois par passage,
> réarmement au retour dans la zone) et le canal mail. `roadmap.md` § 2.2 les renvoie en
> V1 : une alerte suppose un *événement* envoyable, un état se dérive sans coût.

## 2. Contrats de données (code)

### 2.1 Schémas de validation

```ts
// src/shared/schemas/threshold.schema.ts
import { z } from 'zod';

export const thresholdComparisonSchema = z.enum(['below', 'above']);

/** Une cible absente est un état, pas un zéro : d'où `null` et non `0`. */
export const targetSchema = z.object({
  value: z.number(),
  delta: z.number(),
  confirmed: z.boolean()      // false ⇒ E16 « cible à reconfirmer »
}).strict();
```

### 2.2 Types et interfaces

```ts
// src/features/indicators/seuil/semantic-state.ts
export type SemanticState =
  | 'in_target'        // valeur conforme à la cible
  | 'out_of_band'      // valeur hors cible (B11)
  | 'no_target'        // aucun seuil écrit : état neutre, et il le dit
  | 'target_unconfirmed' // E16 : la cible existait sur une version antérieure
  | 'not_official';    // B13 : jamais d'état sémantique sur un indicateur non signé

export interface SemanticInput {
  readonly value: number | null;
  readonly targetValue: number | null;
  readonly targetConfirmedAt: string | null;
  readonly threshold: { comparison: 'below' | 'above'; thresholdValue: number } | null;
  readonly officiality: 'official' | 'provisional' | 'stale_owner';
}

export interface SemanticDecision {
  readonly state: SemanticState;
  readonly delta: number | null;
  readonly deltaPct: number | null;
  /** Motif en langue métier, jamais un code : il est lu tel quel à l'écran. */
  readonly reason: string;
}
```

### 2.3 Contrats API

Aucun endpoint propre : `semantic_state` est renvoyé par `GET /api/v1/indicators/:slug`
(§ 5.3) et par `GET /api/v1/dashboards/:slug` (§ 5.11). Le seuil se pose **avec** la
définition, via `POST /api/v1/indicators` (§ 5.4) : il n'y a pas d'écran de seuils
(`benchmarks.md` § 5 écart 2).

## 3. Algorithmes critiques

### 3.1 `resolveSemanticState` (couvre B11, B14, E16, B13)

```
ENTRÉES : SemanticInput
1  SI officiality <> 'official'
     → { state: 'not_official', delta: null, deltaPct: null,
         reason: 'Cet indicateur n'est pas officiel : pas de comparaison sémantique.' }
2  SI value IS NULL
     → { state: 'no_target', delta: null, deltaPct: null,
         reason: 'Aucune valeur sur la période : rien à comparer.' }   (E2)
3  SI threshold IS NULL ET targetValue IS NULL
     → { state: 'no_target', reason: 'Aucune cible ni seuil écrit : état neutre.' }
4  SI targetValue IS NOT NULL ET targetConfirmedAt IS NULL
     → { state: 'target_unconfirmed', delta: null, deltaPct: null,
         reason: 'Cible à reconfirmer : la cible n'a pas été réécrite sur cette version.' } (E16)
5  SI threshold IS NOT NULL :
5a   SI comparison = 'below' ET value < threshold.thresholdValue → out_of_band
5b   SI comparison = 'above' ET value > threshold.thresholdValue → out_of_band
5c   sinon → in_target
6  SINON (cible seule, sans seuil) :
6a   delta = value - targetValue
       |delta| > 0 ⇒ out_of_band avec delta ; sinon in_target
6b   deltaPct = targetValue = 0 ? null : (delta / targetValue) * 100
7  raison par défaut :
     out_of_band    → « Valeur hors de la cible écrite avec la définition »
     in_target      → « Valeur dans la cible »
     no_target      → « Aucune cible écrite avec la définition »
8  renvoyer SemanticDecision
```

> Cette fonction est **nommée et testée sur ses deux côtés**. Un booléen
> `isOutOfBand` calculé à trois endroits diverge au premier changement
> (`archetypes.md` § 9, « un booléen qui tranche seul »).

### 3.2 `assertThresholdWritable` (couvre B11)

```
1  charger la definition_version ciblée
2  SI status <> 'draft' ET status <> 'in_review'
     → 409 DEFINITION_NOT_SIGNED / SIGNED_VERSION_IMMUTABLE
     « Un seuil ne se pose que sur une version signable : il se signe avec elle. »
3  SI threshold fourni ET version déjà signée
     → 409 : modifier le seuil d'une version signée, c'est créer une version
```

## 4. Plan composants

### 4.1 Arbre de composants

```
IndicatorDetailPage (server)
├── IndicatorTile
│   ├── valeur
│   ├── TargetComparison state={in_target|out_of_band|no_target|target_unconfirmed}
│   │   ├── icône + texte   (l'information n'est jamais portée par la couleur seule)
│   │   └── delta           (--font-mono)
│   └── status badge
└── ThresholdNote   (seuil écrit avec la définition, sa valeur, son sens, sa date)
```

### 4.2 Composants

| Composant | Type | Fichier cible | Props | State | Événements |
|---|---|---|---|---|---|
| `TargetComparison` | Server | `src/features/indicateurs/seuil/target-comparison.tsx` | `{ decision: SemanticDecision }` | — | — |
| `ThresholdNote` | Server | `src/features/indicateurs/seuil/threshold-note.tsx` | `{ threshold: DefinitionThreshold }` | — | — |
| `IndicatorTile` | Server | `src/components/indicator-tile.tsx` | architecture § 2.3 | — | — |

### 4.3 États par écran

#### Écran : `indicateur-detail`

| État | Condition | Composants affichés | Données |
|---|---|---|---|
| rempli | `in_target` | Delta neutre, icône « dans la cible », texte | `SemanticDecision` |
| hors cible | `out_of_band` | `--color-out-of-band`, fond `out_of_band_subtle`, icône + texte « hors cible » | `SemanticDecision` |
| vide | `no_target` | Mention « aucune cible écrite avec la définition », **neutre** | `SemanticDecision` |
| vide-données | `value IS NULL` | Aucune comparaison affichée | E2 |
| cible à reconfirmer | `target_unconfirmed` | Badge `--color-unknown` « cible à reconfirmer » | E16 |
| non officiel | `not_official` | Mention « non officiel », `--color-stale` | B13 |

### 4.4 Formulaires

Aucun : le seuil et la cible sont des champs de la forme de définition
(`definition-declarer`, US-11), pas d'un écran séparé.

## 5. Gestion d'état

| Donnée | Portée | Stockage | Initialisation | Mise à jour |
|---|---|---|---|---|
| `SemanticInput` | serveur | Dérivé de `definition_version` + `WarehouseValue` | Rendu serveur | Aucun état client |
| Cible et seuil | PostgreSQL | Colonnes `target_*`, table `definition_threshold` | — | Nouvelle version uniquement |
| Période | URL | query params | Lien | Navigation |

## 6. Traçabilité des règles

| ID | Règle (PRD) | Implémentée où | Approche |
|---|---|---|---|
| B11 | Un seuil n'existe que sur un indicateur signé ; il porte valeur, sens et date | § 3.2, `definition_threshold.defined_at` | Seuil lié à la **version**, donc signé avec elle |
| B14 | La cible est versionnée avec sa définition | Colonnes `target_*` de `definition_version` | `target_confirmed_at` porte la date d'écriture sur la version |
| B13 | Un indicateur non signé n'apparaît dans aucun dashboard partagé | § 3.1 étape 1 | État `not_official`, jamais de couleur sémantique |
| B12 | Alerte unique par passage et réarmement | **Hors MVP** | V1 avec le canal mail (`roadmap.md` § 2.2) |

| ID | Edge case | Approche | Où |
|---|---|---|---|
| E16 | La cible existait sur la version précédente | § 3.1 étape 4 | `target_confirmed_at IS NULL` |
| E2 | Aucune valeur sur la période | § 3.1 étape 2 | Aucune comparaison affichée |

| ID | Contrainte | Comment elle est respectée |
|---|---|---|
| C7 | Autonomie en une demi-journée | Pas d'écran de seuils : la comparaison est lisible sans explication |
| 7.3 | Aucune information par la couleur seule | Icône + texte + couleur, toujours les trois |

## 7. Pièges à éviter

- **Une couleur sémantique réglable dans les préférences** — ⚠️ Ne pas offrir de réglage
  d'apparence. US-11 impose que la couleur **dérive de la comparaison à la cible** ; un réglage
  rendrait l'alerte décorative, ce qu'est exactement ce que l'archétype refuse.
- **Reporter `target_value` sur la version suivante** — ⚠️ Ne pas recopier la cible. E16 impose la
  suspension de la comparaison et la mention « cible à reconfirmer » jusqu'à réécriture.
- **Un écran de gestion des seuils** — ⚠️ Ne pas en créer un. `benchmarks.md` § 5 écart 2 : les seuils
  vivent avec la définition, et les déplacer plus tard serait changer une version signée.
- **Ajouter une machine à états et un réarmement** — ⚠️ Ne pas anticiper B12 ici. Un état se dérive
  de la valeur ; une alerte par passage suppose un événement et un canal, qui arrivent en V1.

## 8. Dépendances

| Dépend de | Nature | Statut | Fallback si absent |
|---|---|---|---|
| `consultation-indicateur` | `SemanticInput` complet, cible et seuil lus | vague 2 | Aucun : la slice est une fonction de la précédente |

## 9. Checklist de tâches

- [ ] `resolveSemanticState` + `assertThresholdWritable` (§ 3)
- [ ] `TargetComparison` et `ThresholdNote`
- [ ] `semantic_state` présent dans les réponses § 5.3 et § 5.11
- [ ] Tests unitaires **sur les deux côtés** de chaque branche (in/out)
- [ ] Test de rendu : hors cible porte icône + texte + couleur

## 10. Critères d'acceptation

- [ ] B11 : un seuil posé sur une version non signable est refusé
- [ ] B11 : le seuil affiché porte sa valeur, son sens et sa date
- [ ] B14 : une cible ne suit pas automatiquement la version
- [ ] US-11 : un indicateur sans cible est neutre **et le dit**
- [ ] 7.3 : aucun état n'est porté par la couleur seule

## 11. Plan de tests

| Cible | Scénarios | IDs couverts |
|---|---|---|
| `resolveSemanticState` | valeur nulle · pas de cible · cible non confirmée · `below` franchi · `above` franchi · pile dans la cible · cible zéro | B11, B14, E16, E2 |
| `assertThresholdWritable` | version `draft` OK · version `signed` refusée | B11 |
| `TargetComparison` | rendu `out_of_band` avec icône + texte ; `target_unconfirmed` en gris chaud | B11, E16, 7.3 |

**Statut** : `identified` — à approfondir et valider en Phase 5.
