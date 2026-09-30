---
type: implementation-plan
slice: design-primitives
module: foundations
status: identified
generated_at: 2026-09-30
derived_from:
  - .forge/architecture.md
  - .forge/prd.md
  - .forge/design/design-system.md
conventions_ref: .forge/conventions.md
---

# Plan d'implémentation — fondation `design-primitives`

> **Vocation de ce document.** Produit en Phase 4 à partir de l'architecture § 2.3. La
> Phase 5 l'approfondit et le valide : statut `identified`, pas `planned`.
> Les props et les états sont définis dans `.forge/design/design-system.md` § 2 ; ce plan
> décrit **comment** les obtenir, pas ce qu'ils contiennent.

## 1. Résumé

Les six composants du design system : `IndicatorTile`, `DataTable`, `FormField`,
`SignatureBar`, `ProvenanceStrip`, `ExportPanel`. Un composant = un rendu + ses états. La
logique de données vit dans `features/`, **jamais** dans le composant, et un composant ne
fait **jamais** d'appel réseau : il reçoit ses données.

**Règles** : B5, B6, B11, B17 · **Edge cases** : E1, E2, E3, E11, E16, E17
**Contraintes** : 7.3 (accessibilité), 7.4 (français seul)

## 2. Contrats de données

Contrats : architecture § 2.3 (`IndicatorTileProps`, `DataTableProps`, `FormFieldProps`,
`SignatureBarProps`, `ProvenanceStripProps`, `ExportPanelProps`, et les unions d'états
`IndicatorDisplayState`, `TableState`, `SignatureState`, `ExportState`).

Tokens : `.forge/design/design-system.md` § 1. Ces variables CSS sont la **seule** source
de couleur, de typographie et d'espacement dans les composants.

## 3. Algorithmes critiques

### 3.1 `IndicatorTile` — l'état est une donnée, pas une déduction (couvre E1, E2, E11)

```
ENTRÉES : IndicatorTileProps
1  ASSERT displayState ∈ IndicatorDisplayState
2  SELON displayState :
   'default' | 'out_of_band'  → rendu du chiffre, de computed_at, de source_ref
   'out_of_band'               → chiffre --color-out-of-band + fond out_of_band_subtle
                                 + ICÔNE + TEXTE « hors cible » (jamais la couleur seule)
   'unknown_freshness'         → chiffre --color-unknown + mention « fraîcheur inconnue »
                                 computed_at est null : l'heure du poste n'occupe
                                 JAMAIS cette place (B6)
   'source_unavailable'        → dernière valeur connue + --color-source-unavailable
                                 + mention « source indisponible » + sa date (E1)
   'no_data'                   → AUCUN chiffre. Message « aucune donnée sur la période »
                                 + commande d'élargissement (E2)
   'computation_too_long'      → dernière valeur connue + sa date + « calcul en cours,
                                 trop long ». JAMAIS de valeur partielle (E11)
   'loading'                   → skeleton DE LA FORME DU CHIFFRE, hauteur conservée,
                                 plus une ligne pour la date
3  permission_denied N'EST PAS UN ÉTAT : le composant ne le connaît pas.
   Un placeholder « accès refusé » confirmerait l'existence de l'indicateur (E5).
4  une valeur chiffrée ne bouge JAMAIS : pas d'animation de compteur, pas de count-up
```

### 3.2 `DataTable` — quatre états vides distincts (couvre E2)

```
'loading'               skeleton ligne par ligne, hauteur conservée
'filled'                tableau
'empty-never-visited'   CTA de création
'empty-no-data'         « aucune donnée sur la période » + élargissement   (E2)
'filtered-to-zero'      « 0 ligne pour ces filtres » + remise à zéro
'error'                 message + « Réessayer »
'offline'               dernier résultat affiché, DATÉ
```

> `filtered-to-zero` et `empty-no-data` ne sont pas le même état : « aucun résultat pour
> vos filtres » se répare par un bouton, « aucune donnée sur la période » par une période
> plus large. Les confondre rend l'un des deux traitements inopérant.

### 3.3 Accessibilité, non négociable (7.3)

```
1  chaque état sémantique porte TROIS signaux : couleur + icône + texte
2  le focus n'est jamais supprimé : anneau --color-border-focus 2 px
3  IndicatorTile size="lg" et --bp-wide sont le cas committee : lisibilité à 3 m
4  toute action (tuile cliquable, tri, chemin de drill-down) est atteignable au clavier
5  un texte à 2,27:1 (--color-text-disabled) ne porte JAMAIS une information unique
```

## 4. Plan de composants

| Composant | Fichier | Consommé par |
|---|---|---|
| `IndicatorTile` | `src/components/indicator-tile.tsx` | `consultation-indicateur`, `seuil-et-etat`, `partage-dashboard`, `export-provenance` |
| `DataTable` | `src/components/data-table.tsx` | `definition-declarer`, `drill-down`, `historique-indicateur`, `journal-acces` |
| `FormField` | `src/components/form-field.tsx` | `definition-declarer` |
| `SignatureBar` | `src/components/signature-bar.tsx` | `definition-signer` |
| `ProvenanceStrip` | `src/components/provenance-strip.tsx` | `consultation-indicateur`, `historique-indicateur`, `export-provenance` |
| `ExportPanel` | `src/components/export-panel.tsx` | `export-provenance` |

Chacun rend ses états par props ; aucun ne connaît une URL, une requête ou un store.

## 5. Gestion d'état

| Donnée | Portée | Stockage | Initialisation | Mise à jour |
|---|---|---|---|---|
| État d'affichage | composant | Props | Par le parent | Recalcul par le parent |
| Champs de formulaire | composant | `useState` local | Props `defaultValue` | `onChange`, validation au `onBlur` |
| Aucune donnée dans le composant | — | — | — | — |

## 6. Traçabilité des règles

| ID | Règle | Implémentée où | Approche |
|---|---|---|---|
| B5 | Date de calcul issue de la source | § 3.1 état `default` | `computed_at` en prop, rendu en `--text-caption` |
| B6 | Fraîcheur absente ⇒ « inconnue » | § 3.1 `unknown_freshness` | `--color-unknown`, gris chaud volontaire |
| B11 | La couleur dérive de la comparaison à la cible | § 3.1 `out_of_band` | Reçoit `displayState`, ne le **calcule** pas |
| B17 | Propriétaire inactif | Variante `stale-owner` du design system | Badge `--color-stale` « propriétaire inactif » |

| ID | Edge case | Approche | Où |
|---|---|---|---|
| E1 | Source indisponible | § 3.1 `source_unavailable` | Tuile conservée avec sa date |
| E2 | Aucune donnée sur la période | § 3.1 `no_data`, § 3.2 `empty-no-data` | Aucun chiffre rendu |
| E3 | Matérialisation pas rafraîchie | `unknown_freshness` ou `source_unavailable` selon `computed_at` | Mention explicite |
| E11 | Calcul trop long | § 3.1 `computation_too_long` | Jamais de partiel |
| E16 | Cible à reconfirmer | Variante `target-missing`, badge `--color-unknown` | Couleur neutre, pas rouge |
| E17 | Tableau non officiel | Prop `officiality` du parent | La tuile porte la mention, elle n'est pas retirée |

| ID | Contrainte | Comment elle est respectée |
|---|---|
| 7.3 | Accessibilité | § 3.3 : couleur + icône + texte, focus jamais supprimé |
| 7.4 | Français seul | Tous les libellés en dur dans le composant ; le vocabulaire métier n'est pas traduit |
| C7 | Autonomie en une demi-journée | Une couleur ne porte jamais seule une information |

## 7. Pièges à éviter

- **Un état qui calcule lui-même sa couleur** — ⚠️ Ne pas écrire `if (value < target) color = red`
  dans le composant. La comparaison à la cible est une règle métier (`seuil-et-etat`) ; le composant
  reçoit un `displayState`. S'il calcule, la règle existe à deux endroits.
- **Un composant qui appelle l'API** — ⚠️ Ne pas passer un `useEffect` + `fetch` dans `components/`.
  Il reçoit ses données ; sinon la même tuile ne peut pas être rendue par le serveur et par un test.
- **Une animation de compteur** — ⚠️ Ne pas faire de `count-up`. Une valeur qui défile est une valeur
  qu'on ne peut pas lire en comité, et « les données ne bougent jamais » est une règle du design
  system.
- **Un placeholder « accès refusé »** — ⚠️ Ne pas créer cet état. `permission_denied` n'existe pas
  dans l'union : il confirmerait l'existence de l'indicateur, et E5 demande l'inverse.
- **Un rouge pour un document non officiel** — ⚠️ `--color-out-of-band` est réservé à « hors cible »,
  « refus » et « anomalie ». Un document non officiel utilise `--color-stale`.
- **Un gris neutre pour « fraîcheur inconnue »** — ⚠️ `--color-unknown` est **chaud** et distinct :
  ni bon ni mauvais, on ne sait pas. Rendu en gris neutre, l'incertitude devient un état normal.

## 8. Dépendances

Aucune. Consommée par deux slices seulement, parce que le design system n'a que six
composants, tous spécifiés en Phase 3.

## 9. Checklist de tâches

- [ ] Les six composants, un fichier chacun, `Props` suffixées
- [ ] Variables CSS du design system, aucun littéral de couleur dans les composants
- [ ] Tests de composants **par état** (pas par implémentation) : rendu vide, chargement,
      rempli, erreur, hors-ligne
- [ ] Test d'accessibilité : chaque état sémantique porte icône + texte
- [ ] Test : `permission_denied` n'existe pas dans le type
- [ ] Test : aucune requête réseau depuis `src/components/`

## 10. Critères d'acceptation

- [ ] Aucun composant de `components/` n'effectue d'appel réseau
- [ ] 7.3 : aucune information n'est portée par la couleur seule ; le focus n'est jamais supprimé
- [ ] E1, E2, E11 : chaque état d'échec a un rendu distinct et daté
- [ ] B6 : `computed_at` nul rend « fraîcheur inconnue », jamais l'heure du poste
- [ ] Les valeurs chiffrées sont en `--font-mono` à chasse fixe

## 11. Plan de tests

| Cible | Scénarios | IDs couverts |
|---|---|---|
| `IndicatorTile` | 8 états rendus distinctement · `permission_denied` absent du type | B5, B6, B11, B17, E1, E2, E11 |
| `DataTable` | 7 états, dont `filtered-to-zero` ≠ `empty-no-data` | E2 |
| `FormField` | `owner_picker` sans saisie libre · validation au `onBlur` | B3 |
| `SignatureBar` | `revocable` ≠ `locked` | B26 |
| `ExportPanel` | 6 états, dont `forbidden_scope` | E6, E13 |
| Accessibilité | icône + texte sur chaque état sémantique | 7.3 |

**Statut** : `identified` — à approfondir et valider en Phase 5.
