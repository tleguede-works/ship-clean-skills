---
type: design-system
status: approved
generated_at: 2026-09-30
derived_from: .forge/prd.md
---

# Design System — Amberline

> Ce document définit les fondations visuelles et les patterns d'interaction du produit.
> Tous les écrans et composants y font référence. Modifier un token ici impacte tout le produit.

---

## 0. Direction visuelle

| Ancre | Contenu |
|---|---|
| **Références** | Le tableur de production (un onglet par personne, des chiffres partout), les écrans de supervision d'un atelier, et le rapport PDF que le comité a déjà sous les yeux. Pas les dashboards SaaS : ils sont jolis et illisibles à trois mètres. |
| **Ambiance** | dense, sourcée, non décorative |
| **Anti-références** | Pas de carte à ombre portée pour tout — la séparation se fait par un filet, pas par une ombre. Pas de dégradé, nulle part. Pas d'illustration ni de mascotte. Pas de couleur sans signifié : une couleur qui ne dit pas « hors cible » ou « refus » n'existe pas. Pas de chiffre sans sa date à côté. |

**Archétype d'application** : `dashboard` — cf. `references/archetypes.md` § 4
**Plateforme** : web
**Boucle de travail** : consulter les indicateurs du jour → voir lesquels sont hors cible → descendre d'un indicateur jusqu'aux lignes qui le composent

**Densité retenue** : **dense** — le produit est lu deux fois par jour en début de journée, et projété à trois mètres en comité. La densité n'est pas un choix esthétique : à 3 mètres, une page aérée ne montre que deux indicateurs, et le comité compare des chiffres qu'il n'a pas le temps de faire défiler.

**Skill de design** : aucun skill de design n'est disponible dans cet environnement. Application des interdits de `references/design-quality.md` § 3, dont l'absence est consignée dans `.forge/audit/issues.md`.

---

## 1. Design tokens

### 1.1 Couleurs

La palette est construite autour d'un **fond gris-vert très désaturé** : le produit est ouvert en permanence dans un onglet, et un blanc pur `#FFFFFF` en fond de page fatigue en séance comme à l'écran toute la journée.

| Token | Valeur | Usage |
|---|---|---|
| `--color-ink-50` | `#F2F4F3` | Fond de page en thème clair, fond de zone survolée |
| `--color-ink-100` | `#E4E8E6` | Fond de surface secondaire, lignes de tableau alternées |
| `--color-ink-400` | `#7E8A85` | Filet de champ et bordure de tableau dense — 3,24:1 (WCAG 1.4.11) |
| `--color-ink-500` | `#4A5651` | Texte courant |
| `--color-ink-700` | `#2C3633` | Texte principal |
| `--color-ink-900` | `#161D1B` | Fond en thème sombre, texte en thème clair inversé |

| Token | Valeur | Usage |
|---|---|---|
| `--color-background` | `#F2F4F3` | Fond de page. **Jamais `#FFFFFF`** : la valeur porte le gris-vert de l'atelier, pas celui d'un tableur. |
| `--color-surface` | `#E9EDEB` | Fond de carte, panneau, en-tête de tableau |
| `--color-surface-raised` | `#F7F9F8` | Menus, infobulles, surfaces au-dessus du contenu |
| `--color-surface-sunken` | `#DEE3E1` | Creux : champ de saisie, cellule en lecture seule |
| `--color-text-primary` | `#2C3633` | Chiffres, intitulés |
| `--color-text-secondary` | `#4F5C57` | Labels, **dates de calcul**, sources, placeholders de champ. 5,32:1 sur la surface la plus claire (`--color-surface-raised`), 4,70:1 sur la moins claire |
| `--color-text-disabled` | `#9BA6A2` | Action impossible — 2,27:1. Exempté de 1.4.3 (texte inactif) ; ne porte **jamais** d'information unique |
| `--color-border` | `#C9D0CD` | Filet de séparation, bordure de surface |
| `--color-border-strong` | `#7E8A85` | Filet d'un tableau en lecture dense — 3,24:1 (WCAG 1.4.11) |
| `--color-border-focus` | `#0F5C57` | Anneau de focus, 2 px, jamais supprimé |

| Token | Valeur | Usage | Rapport sur fond |
|---|---|---|---|
| `--color-accent` | `#0F5C57` | Action principale, lien, indicateur dans la cible | 7,07:1 sur `--color-background` |
| `--color-accent-hover` | `#0B4743` | Survol | — |
| `--color-accent-subtle` | `#D3E4E2` | Fond de badge « officiel », en-tête de groupe | — |
| `--color-out-of-band` | `#B23A2E` | **Hors cible**, refus, anomalie. Jamais utilisé pour autre chose. | 5,37:1 sur `--color-background` |
| `--color-out-of-band-subtle` | `#F6E1DE` | Fond de la tuile hors cible | — |
| `--color-unknown` | `#7A6A3C` | Fraîcheur inconnue, cible à reconfirmer. Volontairement **ni rouge ni neutre** : ni bon ni mauvais, on ne sait pas. | 4,81:1 |
| `--color-stale` | `#746A5E` | Document non officiel, valeur figée | 4,79:1 |
| `--color-source-unavailable` | `#5B5B63` | Source indisponible — un gris froid, distinct des gris de l'atelier, pour que la panne ne passe pas pour un état normal | 6,09:1 |

> **Le gris `--color-unknown` est le choix le plus important de cette palette.** Un
> état « on ne sait pas » rendu en gris neutre est lu comme un état normal. Le
> choisir chaud et distinct rend l'incertitude visible sans la dramatiser — c'est
> exactement le discours du produit (B5, B6).

#### Aucune couleur n'est ajoutée pour les états de franchissement et de périmètre

Trois significations ont été ajoutées après la rédaction initiale de cette
palette : le **franchissement d'un seuil** (B11, B12, US-4), son **réarmement**
(B12) et le **périmètre résolu vide** (E15). **Aucune couleur n'a été créée pour
elles, et c'est un choix, pas une omission.**

| Signification | Token porté | Pourquoi ce token-là suffit |
|---|---|---|
| franchissement, alerte en cours, franchi et déjà signalé | `--color-out-of-band` `#B23A2E` + `--color-out-of-band-subtle` `#F6E1DE` | Un franchissement de seuil **est** un dépassement de cible. Lui donner un second rouge créerait deux rouges qui se disputent la même idée, dont un qui n'aurait pas de synonymie française. |
| seuil réarmé, retour dans la zone normale | le **badge** « dans la cible » : `--color-accent-subtle` `#D3E4E2` + `--color-accent` `#0F5C57` (5,94:1) ; la **ligne de seuil** qui date le réarmement reste en `--color-text-secondary`, comme toutes les dates | Un réarmement **est** un retour dans la zone normale : c'est le fond et la couleur des états « dans la cible », déjà posés. Un vert « récupéré » serait une couleur d'émotion, pas une information. Le réarmement **ne colore rien de neuf** : il n'ajoute qu'une date à un état déjà rendu |
| périmètre résolu vide | `--color-unknown` `#7A6A3C` sur `--color-surface-raised` `#F7F9F8` (5,02:1) | Un périmètre vide est une **absence**, pas une valeur : ni bon ni mauvais, on ne sait pas. C'est exactement la définition de `--color-unknown`, et c'est le rendu déjà employé par `definitions.md` § 4.1 — le même mot et le même ratio, pour que les écrans frères ne divergent pas. |

> **Ce qui distingue ces états des états voisins n'est pas une teinte, c'est une
> date.** Un franchissement sans sa date, un réarmement sans sa date et une alerte
> sans sa date sont trois phrases qui ne veulent rien dire. Le produit a donc
> choisi d'ajouter un **slot** (`threshold`) et un **état** (`perimeter_empty`),
> pas une couleur. C'est la seule façon de tenir la règle « pas de couleur sans
> signifié » quand le signifié nouveau est *temporel* et non *chromatique*.

### 1.2 Typographie

| Token | Font family | Taille | Graisse | Line-height | Usage |
|---|---|---|---|---|---|
| `--font-sans` | `Inter Variable`, `system-ui`, sans-serif | — | — | — | Texte courant, intitulés |
| `--font-mono` | `ui-monospace`, `SFMono-Regular`, `Menlo`, monospace | — | — | — | **Toute valeur chiffrée**, identifiant de source, version |
| `--text-display` | inherit | `40px` | 600 | 1.05 | Chiffre d'une tuile d'indicateur |
| `--text-h1` | inherit | `24px` | 600 | 1.2 | Titre de page |
| `--text-h2` | inherit | `18px` | 600 | 1.25 | Titre de section |
| `--text-h3` | inherit | `15px` | 600 | 1.35 | Titre de carte, libellé d'indicateur |
| `--text-body` | inherit | `14px` | 400 | 1.5 | Texte courant |
| `--text-body-sm` | inherit | `13px` | 400 | 1.45 | Secondaire |
| `--text-caption` | inherit | `12px` | 400 | 1.4 | **Date de calcul**, source, version |
| `--text-overline` | inherit | `11px` | 600 | 1.3 | Label de champ, badge, en-tête de colonne |

> **Ratio d'échelle** : 1.2 → 1.33 → 1.5 → 1.6 → 1.67. Pas uniforme : l'écart
> `--text-display` → `--text-h1` (40 → 24) est le plus large de l'échelle, parce que
> c'est le seul saut qui doit porter la lecture à trois mètres.

> **Toute valeur chiffrée est en `--font-mono`, à chasse fixe.** C'est ce qui rend
> deux nombres de largeurs différentes alignables en colonne — donc comparables.
> Une valeur en chasse proportionnelle n'est pas comparable, elle est seulement
> lisible.

### 1.3 Espacements

| Token | Valeur | Usage |
|---|---|---|
| `--space-xs` | `2px` | Ajustement de badge, retrait d'unité |
| `--space-sm` | `4px` | Gap interne d'un chip |
| `--space-md` | `8px` | Gap standard entre champs d'une même ligne |
| `--space-lg` | `12px` | Gap entre lignes d'une tuile |
| `--space-xl` | `16px` | Padding de carte |
| `--space-2xl` | `24px` | Padding de panneau, gap entre sections |
| `--space-3xl` | `32px` | Marge de page |

### 1.4 Ombres

| Token | Valeur | Usage |
|---|---|---|
| `--shadow-none` | `none` | **Défaut.** Toute surface est séparée par `--color-border`, jamais par une ombre. |
| `--shadow-sm` | `0 1px 2px rgba(22, 29, 27, 0.10)` | Uniquement un élément qui **flotte au-dessus du contenu** : menu, infobulle. |
| `--shadow-md` | `0 4px 12px rgba(22, 29, 27, 0.14)` | Uniquement tiroir ou modale qui masque la page. |
| `--shadow-lg` | `0 12px 32px rgba(22, 29, 27, 0.18)` | Uniquement export en cours de génération. |

### 1.5 Bordures

| Token | Valeur | Usage |
|---|---|---|
| `--radius-none` | `0` | — |
| `--radius-sm` | `3px` | Champ de saisie, badge, cellule |
| `--radius-md` | `6px` | Tuile d'indicateur, bouton |
| `--radius-lg` | `10px` | Panneau, tiroir |
| `--radius-full` | `9999px` | Chip de statut, pastille |

### 1.6 Animations

| Token | Valeur | Usage |
|---|---|---|
| `--duration-fast` | `90ms` | Survol, focus |
| `--duration-normal` | `160ms` | Ouverture de menu, changement d'état d'une tuile |
| `--duration-slow` | `240ms` | Entrée de page, apparition d'un panneau |
| `--ease-default` | `cubic-bezier(0.2, 0, 0.2, 1)` | Transitions standard |
| `--ease-in` | `cubic-bezier(0.4, 0, 1, 1)` | Apparition |
| `--ease-out` | `cubic-bezier(0, 0, 0.2, 1)` | Disparition |

> Une valeur chiffrée **ne bouge jamais**. Aucune animation de compteur, aucun
> « count-up » : une valeur qui défile est une valeur qu'on ne peut pas lire en
> comité. Le seul mouvement autorisé sur une donnée est le changement de couleur
> sémantique, en `--duration-normal`.

### 1.7 Breakpoints

| Token | Valeur | Usage |
|---|---|---|
| `--bp-mobile` | `≤ 640px` | Téléphone — lecture seule (US-15 est en V2, hors MVP) |
| `--bp-tablet` | `641px → 1024px` | Tablette, salle de réunion |
| `--bp-desktop` | `1025px → 1600px` | Écran de travail |
| `--bp-wide` | `≥ 1601px` | Écran projeté en comité |

---

## 2. Composants primitifs

### IndicatorTile

**Rôle** : afficher une valeur d'indicateur avec sa cible, sa date de calcul, sa source et son état sémantique. C'est le composant le plus lu du produit.

**Variantes** :

| Variante | Apparence | Usage |
|---|---|---|
| `official` | Filet `--color-accent` à gauche de 3 px, badge « officiel » | Indicateur signé (B2) |
| `provisional` | Filet `--color-stale`, badge « non officiel » | Définition non signée (B13) — visible, jamais partageable |
| `stale-owner` | Filet `--color-stale`, badge « propriétaire inactif » | B17 |
| `target-missing` | Badge `--color-unknown` « cible à reconfirmer » | E16 |

**Tailles** :

| Taille | Dimensions | Usage |
|---|---|---|
| `sm` | Chiffre `24px`, hauteur 96 px | Panneau latéral, liste d'indicateurs |
| `md` | Chiffre `40px`, hauteur **172 px** | **Grille de dashboard** |
| `lg` | Chiffre `56px`, hauteur 220 px | Écran projeté en comité (`--bp-wide`) |

> **`md` fait 172 px, et non 148 px.** C'est un arbitrage du commanditaire, rendu
> dans **cette** table et pas dans un écran. Son critère, écrit tel quel : *si la
> complétude de la machine dépend du format d'écran, le même composant a deux
> rendus* — c'est-à-dire exactement le défaut qu'il venait de refuser par ailleurs.
> Le fait qui le déclenche est écrit dans `tableau-de-bord.md` § 9.2 point 3 : à
> 148 px, les sept slots ne tenaient pas avec les gaps `--space-lg`, et le rendu
> dépendait donc de la taille — ligne de seuil complète en `lg`, amputée en `md`.
> 172 px est la hauteur qui fait tenir les sept slots, donc la seule qui rende la
> ligne de seuil **identique en `md` et en `lg`**.
>
> **Effet sur la grille, vérifié.** Le nombre de tuiles par ligne **ne change
> pas** : une tuile occupe des colonnes, pas des pixels de hauteur. Ce qui change
> est le nombre de rangées visibles sans défilement. Sur une grille à **4 par
> ligne** de tuiles `md` portant six tuiles (4 + 2), la hauteur passe de
> 2 × 148 = **296 px** à 2 × 172 = **344 px**, soit **48 px** de plus. Sur la même
> grille rendue en `lg`, rien ne change : 2 × 220 = **440 px** dans les deux cas.
> Le format projeté **n'a donc rien perdu** et reste le seul où la page tient sans
> défilement vertical (`tableau-de-bord.md` § 6). Les grilles à 4 par ligne de
> `sm` (96 px) — dont celle de `indicateurs` sur `--bp-desktop` — ne sont **pas**
> concernées : `sm` ne change pas.

> **Règle permanente du composant : aucune date de seuil n'est rognée, quelle que
> soit la taille.** La ligne `threshold` ne se tronque jamais — ni en `sm`, ni en
> `md`, ni en `lg`, ni sur le format le plus étroit. Ce n'est pas un pansement du
> format `md` : c'est une règle du composant, parce que la ligne porte des faits
> dont **aucun** n'est optionnel — la valeur du seuil, son sens et sa date (B11) —
> et qu'une date tronquée est une affirmation invérifiable devant un journal
> (B5). Quand la place manque, la ligne se **replie sur deux lignes** ; elle ne se
> coupe pas. Une hauteur de tuile qui ne permet pas de tenir la ligne est un défaut
> de la hauteur, pas une permission de perdre la date.

**États** — rendus par l'union `IndicatorDisplayState`, sauf `hover`, `active`, `focus` (états d'interaction : aucun rendu piloté par la donnée), et `permission_denied` (**tuile non rendue** : ce n'est pas un état à afficher, c'est une absence — l Shui rendu piloté par la donnée, ils ne sont pas dans l'union), `out_of_band_alerting`, `out_of_band_alerted`, `threshold_latched`, `threshold_armed` (V1 — § 2.1, hors MVP) et `permission_denied` (E5 : la tuile n'est pas rendue) :

| État | Déclencheur | Apparence |
|---|---|---|
| default | valeur disponible | Chiffre `--text-display` en mono, date de calcul en `--text-caption` |
| hover | survol | `--color-surface` légèrement relevé, bordure `--color-border-strong` |
| active | clic en cours | Pression 1 px, retour immédiat |
| focus | navigation clavier | Anneau `--color-border-focus` 2 px, jamais supprimé |
| loading | calcul en cours | Skeleton **de la forme du chiffre**, hauteur conservée, plus une ligne pour la date |
| `out_of_band` | hors cible, **sans seuil déclaré** — la comparaison à la cible suffit (B11, B14) | Chiffre `--color-out-of-band`, fond `--color-out-of-band-subtle`, icône + texte « hors cible de 1,2 pt ». Si un seuil existe, la ligne `threshold` le porte — voir § 2.1 |
| `out_of_band_alerting` | **franchissement en cours, première fois** : la valeur vient de quitter la zone normale depuis un seuil armé (B12, US-4) | Même chiffre, même fond et même `triangle-alert` que `out_of_band` — c'est le même dépassement — mais badge `bell-ring` + « hors cible de 1,2 pt · alerte de ce passage ». La ligne `threshold` date le franchissement **par la date de calcul du snapshot**, jamais par l'heure du poste |
| `out_of_band_alerted` | **franchi, alerte déjà émise** : le seuil est désarmé et le reste tant que la valeur ne revient pas dans la zone normale (B12) | Même chiffre, même fond, même `triangle-alert`, badge `bell-ring` + « hors cible · déjà signalé », ligne `threshold` : « signalé le JJ/MM/AAAA HH:MM · aucune nouvelle alerte tant que la valeur reste hors zone ». C'est cet état, et lui seul, qui distingue une valeur revenue dans la zone puis repartie d'une simple oscillation |
| `threshold_latched` | **refranchi sans être repassé dans la zone** : la valeur est repartie hors zone pendant que le seuil était encore désarmé (B12) | Rendu de `out_of_band_alerted`, plus le compteur de passages dans la ligne `threshold` : « hors zone depuis le 2ᵉ passage · aucune nouvelle alerte ». **La couleur ne change pas** : un second franchissement n'est pas un fait plus grave, c'est le même fait deux fois |
| `threshold_armed` | la valeur est **revenue dans la zone normale** après un franchissement : le seuil est réarmé (B12, US-4, critère 3) | Apparence de `default` — la valeur est dans la cible, elle n'est pas colorée — plus la ligne `threshold` : « seuil réarmé le JJ/MM/AAAA HH:MM ». **Aucune alerte de « bon », aucun toast, aucune animation** : le réarmement est silencieux, il se constate |
| `unknown_freshness` | date de calcul absente de la source (B6) | Chiffre `--color-unknown`, mention « fraîcheur inconnue » — **jamais** l'heure du poste |
| `source_unavailable` | source injoignable (E1) | Chiffre de la dernière valeur connue, `--color-source-unavailable`, mention « source indisponible » |
| `no_data` | aucune ligne sur la période (E2) | **Aucun chiffre affiché.** Message « aucune donnée sur la période » + action d'élargir |
| `perimeter_empty` | le périmètre de la définition ne résout aucune ligne (E15) | **Aucun chiffre affiché**, jamais un `0 %`. Badge `--color-unknown` `#7A6A3C` sur fond épinglé `--color-surface-raised` `#F7F9F8` (**5,02:1**), icône `circle-help` + mention « périmètre résolu vide », action « Ouvrir la définition ». Rendu identique à l'état de ligne n° 7 de **§ 2.7** — mot, token, fond et ratio compris |
| `permission_denied` | indicateur non visible pour ce lecteur (E5) | La tuile n'est **pas** rendue. Aucune trace, aucun placeholder. |
| `computation_too_long` | au-delà du délai (E11) | Dernière valeur connue datée + mention « calcul en cours, trop long ». Jamais de valeur partielle. |

> `no_data` et `perimeter_empty` sont deux états, pas un. « Aucune donnée sur la
> période » se répare en **élargissant la période** ; « périmètre résolu vide » ne
> se répare **pas** comme ça — une période plus large sur un périmètre qui ne
> résout rien reste un périmètre vide. Réutiliser `no_data` avec un autre message
> ferait afficher une commande qui ne répare pas ce qu'elle annonce, et
> `--color-unknown` sur la tuile serait alors justifié par un état qui n'existe
> pas. `no_data` est rendu en `--color-surface` avec un message neutre ;
> `perimeter_empty` est rendu en `--color-unknown` sur fond de badge épinglé
> (**§ 2.7**, contrat du composant), pour qu'un lecteur qui voit « périmètre
> résolu vide » sur un écran le reconnaisse immédiatement sur l'autre.

**Slots** :

| Slot | Requis | Contenu |
|---|---|---|
| `label` | oui | Intitulé de l'indicateur, `--text-h3` |
| `value` | oui | La valeur, en mono |
| `target` | non | Cible et écart, ou badge « cible à reconfirmer » |
| `threshold` | non | La ligne de seuil : valeur du seuil, **sens**, **date du seuil** (B11) et, quand la machine à états le sait, la date du franchissement, de l'alerte et du réarmement (B12). Jamais un horodatage pris chez nous (B5) |
| `computed_at` | oui | Date de calcul **prise dans la source** (B5) |
| `source_ref` | oui | Identifiant de la matérialisation, en mono, `--text-caption` |
| `status` | oui | Badge sémantique |

> `permission_denied` est le seul état où le composant **disparaît**. Un
> placeholder « accès refusé » confirme l'existence de l'indicateur — et E5
> demande l'inverse.

> **`threshold` est le seul slot qui porte un temps qui n'est pas une date de
> calcul.** Il ne l'est pas parce qu'il est moins important : `computed_at` dit
> *quand la source a calculé*, `threshold` dit *quand le franchissement a eu lieu
> et quand on a été prévenu* — trois horodatages distincts, jamais permutables.
> Sans ce slot, « déjà signalé » serait une affirmation non datée, donc invérifiable
> devant un journal, ce qui est exactement la faute que B5 interdit ailleurs.
>
> **Ce que le slot porte au MVP, et ce qu'il attend.** Au MVP, la ligne `threshold`
> porte **la valeur du seuil, son sens et la date du seuil** (B11) : ce sont trois
> faits de la version signée, ils ne dépendent pas de la machine, et ils sont donc
> au MVP. Les trois horodatages de franchissement, d'alerte et de réarmement
> (B12) sont **V1** — ils n'existent que si la machine existe, et elle arrive en V1
> (`roadmap.md` § 2.1, § 2.2, § 3.1 ; voir § 2.1). Un même slot, deux contenus
> selon la version, et c'est écrit ici pour qu'aucun écran ne croie rendre au MVP
> une ligne de seuil à six faits.

#### 2.1 `ThresholdMachine` — la machine à états du franchissement (B11, B12, US-4)

**Pourquoi une machine à états et pas un booléen.** « Est-il hors cible ? » est un
booléen, et un booléen ne sait rien dire d'un **passage**. Or B12 porte sur le
passage : « une alerte une seule fois par passage, et réarmement au retour dans
la zone normale ». Un booléen `out_of_band` ne distingue pas une valeur qui
oscille autour du seuil (94,9 / 95,1 / 94,8 autour d'une cible à 96) d'une valeur
qui y est entrée puis en est ressortie une heure plus tard. Les deux portent le
même `true`, et deux implémentations produiront alors deux comportements — au
moment précis où le produit cesse d'être tranquille. L'état de la tuile doit donc
porter **le franchissement**, pas seulement le dépassement.

Deux axes, un seul couple **rendu** à l'écran :

- **`zone`** — `in_zone` | `out_of_zone`. C'est ce que la **valeur** dit. Il se
  recalcule à chaque lecture, sans mémoire.
- **`arm`** — `not_applicable` | `armed` | `disarmed`. C'est ce que la
  **machine** retient. Il ne change qu'à un franchissement et qu'au retour dans
  la zone normale. **`not_applicable` signifie « pas de machine »** : aucun
  seuil n'est déclaré sur la version signée qui porte la valeur (B11), ou la
  machine est suspendue par l'une des trois règles de la table des suspensions
  ci-dessous. C'est la seule valeur de l'enum `threshold_state` qui ne produit
  aucun état rendu — un indicateur sans seuil a un **écart**, pas une alerte.

**Les quatre états de la machine, plus deux valeurs nommées qui n'en sont pas** :

| État nommé | `zone` | `arm` | Ce que la tuile affiche | Ce qui l'a produit |
|---|---|---|---|---|
| `threshold_armed` | `in_zone` | `armed` | la valeur, sa cible, l'écart, badge « dans la cible », ligne `threshold` : « seuil réarmé le JJ/MM/AAAA HH:MM » | le **retour** dans la zone normale, daté par le `computed_at` du snapshot qui l'a constaté |
| `out_of_band_alerting` | `out_of_zone` | `disarmed`, alerte **en cours d'émission** | chiffre `--color-out-of-band` sur `--color-out-of-band-subtle`, `triangle-alert` + « hors cible de 1,2 pt », badge `bell-ring` « alerte de ce passage », ligne `threshold` : « franchi le JJ/MM/AAAA HH:MM » | le **franchissement** d'un seuil armé, daté par le `computed_at` du snapshot |
| `out_of_band_alerted` | `out_of_zone` | `disarmed`, alerte **déjà émise** | mêmes couleur, fond et `triangle-alert` ; badge `bell-ring` « hors cible · déjà signalé », ligne `threshold` : « signalé le JJ/MM/AAAA HH:MM · aucune nouvelle alerte tant que la valeur reste hors zone » | la confirmation de l'alerte du passage courant |
| `threshold_latched` | `out_of_zone` | `disarmed`, alerte **déjà émise sur un passage antérieur** | rendu de `out_of_band_alerted` avec en plus le compteur de passages : « hors zone depuis le 2ᵉ passage » | une valeur qui **refranchit** le seuil sans être repassée dans la zone entre-temps |
| `out_of_band` | `out_of_zone` | — (pas de machine) | chiffre hors cible, `triangle-alert` + « hors cible », **aucune ligne d'alerte** | un dépassement de cible **sans seuil déclaré**, ou la machine **suspendue** (voir ci-dessous) |
| `not_applicable` | — (aucune comparaison de seuil) | `not_applicable` | **le franchissement n'est pas rendu du tout** : pas de ligne `threshold`, pas de badge `bell-ring`, pas de compteur. Ce qui s'affiche reste l'état du **fait** constaté — `out_of_band` si la valeur est hors cible, `default` si elle est dans la cible | **aucun seuil déclaré** sur la version signée qui porte la valeur (B11), ou machine **suspendue** (table des suspensions ci-dessous) |

> **`not_applicable` est la sixième valeur nommée de l'enum `threshold_state`, et
> la seule qui ne produise aucun état rendu.** C'est une valeur de l'axe `arm` —
> « pas de machine » — et non un état de tuile : quand elle vaut `not_applicable`,
> le franchissement **n'est pas rendu**, et ce qui s'affiche est l'état du fait
> lui-même. Elle est écrite ici, et pas laissée comme une valeur orpheline dans un
> écran : « pas de machine » est un état légitime de la machine — celui où il n'y a
> rien à constater — et le nommer vaut mieux que de le déduire d'un
> `threshold: null`. Un écran qui reçoit `threshold_state: not_applicable` **ne
> dessine rien** sur le franchissement ; il n'a pas à le décider, et il ne peut pas
> le décider autrement qu'en violant B11.

**Les transitions, et seulement celles-ci** :

| Depuis | Événement, toujours daté par la source | Vers | Effet |
|---|---|---|---|
| `threshold_armed` | la valeur **quitte** la zone normale (comparaison à la cible de la version signée) | `out_of_band_alerting` | **une** alerte, horodatée au `computed_at` du snapshot qui a produit la valeur. Jamais à l'heure du poste, jamais à l'heure de la requête |
| `out_of_band_alerting` | l'alerte du passage est confirmée | `out_of_band_alerted` | rien de nouveau à l'écran : la confirmation d'un envoi n'est pas une information pour le lecteur |
| `out_of_band_alerted` | la valeur **revient** dans la zone normale | `threshold_armed` | **silencieux.** Aucune alerte de « bon », aucun toast, aucun bandeau de félicitation. Le réarmement se constate dans la ligne `threshold`, daté |
| `out_of_band_alerted` | la valeur **oscille** sans quitter la zone | `out_of_band_alerted` | **aucune nouvelle alerte.** C'est la ligne entière de B12, et c'est le seul endroit du produit où « ne rien faire » est le comportement correct |
| `out_of_band_alerted` | la valeur **franchit de nouveau** le seuil | `threshold_latched` | **aucune nouvelle alerte.** Le compteur de passages s'incrémente, l'alerte ne repart pas |
| `threshold_latched` | la valeur **revient** dans la zone normale | `threshold_armed` | **silencieux.** Le compteur de passages repart à zéro, la date de réarmement est mise à jour |
| n'importe quel | l'indicateur perd son statut officiel (B13, B17) ou son propriétaire est inactif (E8) | `out_of_band` | la machine est **suspendue** : B13 interdit qu'un indicateur sans définition signée déclenche une alerte. Le dépassement reste affiché, il n'émet plus rien |
| n'importe quel | `target: null` ou `target_version ≠ definition_version` (E16) | `out_of_band` | la comparaison sémantique est suspendue, donc aucun franchissement ne peut être constaté. Le même refus de conclure que la précédence des états |
| n'importe quel | la date de calcul est absente de la source : `computed_at` est `null` (B6) | `out_of_band` | la machine est **suspendue** : on ne date pas un franchissement sur un snapshot dont on ignore la date. Le dépassement reste affiché, il n'émet plus rien — la même raison qui fait qu'une tuile en `unknown_freshness` ne porte ni badge ni date |

> **Trois règles suspendent la machine, et les trois ont la même conséquence :
> le dépassement reste affiché, il n'émet plus rien.** Ce sont B13 / B17 / E8
> (« pas de statut officiel »), E16 (« pas de cible certaine ») et B6 (« pas de
> date de calcul »). Elles sont ici, au niveau du composant, parce qu'elles sont
> une propriété de la **machine**, pas d'un écran : `indicateur-detail.md` § 4.2
> applique déjà B6 en retirant son bloc de franchissement — le comportement était
> bon, l'autorité était au mauvais endroit. Une règle d'écran qui se fait passer
> pour une règle de design system finit par n'être appliquée que là où quelqu'un a
> pensé à la recopier.

**Trois règles qui rendent la machine vérifiable devant un journal** :

1. **Les horodatages viennent de la source.** `threshold_crossed_at`,
   `threshold_alerted_at` et `threshold_rearmed_at` sont des `computed_at` de
   snapshot, jamais `Date.now()`. Une machine à états qui s'horodate elle-même
   produit un journal que personne ne peut reconstituer.
2. **Un seul passage à la fois.** Le franchissement est daté **une fois** par
   passage ; toutes les lectures suivantes du même passage relisent le même
   horodatage. Le nombre de franchissements d'une journée est donc un entier,
   jamais une estimation.
3. **Aucune alerte par oscillation, aucun toast.** Un toast rejoué à chaque
   franchissement est l'exact contraire de B12 : il transforme une règle
   (« une fois par passage ») en volume d'alertes. Le compteur de passages
   existe pour que le *silence* soit lisible — on peut vérifier qu'une seconde
   alerte n'est pas partie parce que l'écran dit qu'elle ne partira pas.

**Ce que la machine décrit, et à quelle version chaque rendu arrive.** Cette
section décrit **le produit**, pas son calendrier : la machine, ses états, ses
transitions et ses horodatages sont écrits intégralement ici, y compris ceux qui
n'arrivent qu'en V1, parce qu'un design system qui omet ce qu'il n'a pas encore
livré devient un document à corriger à chaque version.

Le calendrier, lui, est ailleurs et il est net :

| Rendu | Version | Autorité |
|---|---|---|
| l'état « hors cible / dans la zone », avec sa date de calcul (B11, B14) | **MVP** | `roadmap.md` § 2.1 : « Le MVP livre **l'état** […] dérivé de la valeur » |
| les quatre états de la machine, leurs trois horodatages, le compteur de passages, le badge `bell-ring`, le bloc de franchissement du détail et la surface de franchissement de la liste | **V1** | `roadmap.md` § 2.1 : « **sans machine à états** ni tâche de fond. **B12 […] part entièrement en V1** » ; `roadmap.md` § 2.2, sous « Ce qui n'est **PAS** dans le MVP » : B12 → **V1** ; `roadmap.md` § 3.1 : « La machine à états […] et le canal mail arrivent ensemble » |
| le canal sortant (mail) | **V1** | `roadmap.md` § 2.2 et § 3.1 (US-12 → V1) |

Trois occurrences concordantes, donc aucune interprétation à faire. Quand la
notification par mail arrive (**US-12**, en **V1**), elle ne pose rien de neuf : elle
s'abonne au même couple (`zone`, `arm`) et n'émet que sur la transition
`threshold_armed → out_of_band_alerting`. C'est pour cela que B12 cite US-4
**et** US-12 : la règle d'armement est écrite une fois, au niveau de la machine,
et le canal est un lecteur de la machine, jamais son propriétaire. Une
implémentation qui implémente le mail en réémettant sur chaque franchissement
violerait B12 deux fois — une fois dans le canal, une fois dans le compteur.

> Un gate ne tranche pas ce qu'il n'a pas examiné, et un document de conception ne
> peut pas attribuer à un gate une décision qu'il n'a pas prise. Si le calendrier
> ci-dessus est un jour modifié, c'est `roadmap.md` qui fait foi — jamais une
> phrase de gate écrite dans une section d'écran.

#### 2.2 Précédence des états sur une même tuile

Les deux couleurs sémantiques du produit (`--color-out-of-band`,
`--color-unknown`) peuvent toucher **la même tuile**, et le franchissement ajoute
des états qui partagent la couleur du dépassement. Sans règle écrite au niveau du
composant, deux implémentations donnent deux rendus — et il suffit qu'un écran
réécrive la table pour qu'il la contredise. La précédence est donc écrite ici,
**une seule fois**, et les écrans y font référence au lieu de la redéfinir.

Précédence, du plus fort au plus faible :

| Rang | Condition | Chiffre | Fond | Mention portée |
|---|---|---|---|---|
| 0 | **aucune valeur à comparer** : `no_data` (E2), `perimeter_empty` (E15) | **aucun chiffre affiché** | `--color-surface` | « aucune donnée sur la période » **ou** « périmètre résolu vide » (E15 : badge `--color-unknown` sur `--color-surface-raised`) |
| 1 | la valeur n'est pas lisible : `source_unavailable`, `computation_too_long` | dernière valeur connue en `--color-source-unavailable` | `--color-surface` | « source indisponible » / « calcul en cours, trop long » |
| 2 | incertitude de la **cible** : `target-missing` (E16) | `--color-unknown` | `--color-surface` | « cible à reconfirmer » |
| 3 | incertitude de la **fraîcheur** : `unknown_freshness` (B6, E3) | `--color-unknown` | `--color-surface` | « fraîcheur inconnue » + la date si elle existe |
| 4 | hors cible : `out_of_band` (B11, B14) | `--color-out-of-band` | `--color-out-of-band-subtle` | icône + « hors cible de 1,2 pt » |
| 4 bis | hors cible **avec machine à états** : `out_of_band_alerting`, `out_of_band_alerted`, `threshold_latched` (B12, US-4, E9) | `--color-out-of-band` — **identique au rang 4** | `--color-out-of-band-subtle` — **identique au rang 4** | `bell-ring` + « hors cible · alerte de ce passage » / « déjà signalé » / « hors zone depuis le 2ᵉ passage », **avec la date du franchissement dans la ligne `threshold`** |
| 5 | dans la cible | `--color-text-primary` | `--color-surface` | badge « dans la cible » en `--color-accent-subtle` |
| 5 bis | dans la cible **et seuil armé** : `threshold_armed` (B12, US-4) | `--color-text-primary` — **identique au rang 5** | `--color-surface` — **identique au rang 5** | badge « dans la cible » **+** ligne `threshold` « seuil réarmé le JJ/MM/AAAA HH:MM » |
| 6 | ni cible, ni comparaison possible (B14 : cible absente) | `--color-text-primary` | `--color-surface` | « pas de cible déclarée » — **neutre et dit**, jamais une couleur de bon ou de mauvais |

> **Un état `not_applicable` ne figure pas dans cette table, et c'est
> volontaire** : il ne produit aucun rendu de tuile, donc il n'est en conflit avec
> aucun autre état. Il n'est pas « plus faible » que le rang 6 — il n'est pas un
> rendu. Ce qui le remplace à l'écran est l'état que l'indicateur a réellement :
> `out_of_band` si la valeur est hors cible sans machine, `default` si elle est
> dans la cible.

**Cette table est l'autorité.** `indicateurs.md` § 4.1 et
`indicateur-detail.md` § 4.2 la référencent et n'y ajoutent que ce qui leur est
propre : l'écran peut suspendre le franchissement à ses propres conditions (§ 4.2
de `indicateur-detail.md`), il ne peut pas réordonner les rangs.

> **Un rang décrit le produit ; il ne dit pas à quelle version l'écran le rend.**
> Les rangs `4 bis` et `5 bis` existent ici pour que le franchissement ait un
> rendu écrit **une fois**. Le MVP de chaque écran est une autre question, posée
> dans l'écran qui la pose : au MVP, seul le rang 4 (`out_of_band`, avec la ligne
> de seuil portant la valeur, le sens et la date du seuil — B11, B14) est rendu,
> et les rangs `4 bis` et `5 bis` arrivent en V1 (`roadmap.md` § 2.1, § 2.2,
> § 3.1 ; voir § 2.1 et le § 9.2 des écrans concernés). C'est cette séparation —
> le composant dit ce que l'état est, l'écran dit ce qu'il rend **maintenant** —
> qui évite qu'une version livre la moitié d'un état.

### DataTable

**Rôle** : afficher les lignes d'une décomposition ou un référentiel, avec l'état de ligne visible sans clic (standard `admin_crud`).

**Variantes** :

| Variante | Apparence | Usage |
|---|---|---|
| `drill` | Densité `sm`, tri par colonne de contribution, colonne « part » | Décomposition d'un indicateur (US-5) |
| `reference` | Densité `md`, actions groupées, sélection multiple | Référentiel des définitions (US-1) |

**États** — rendus par l'union `TableState` `loading` (skeleton ligne par ligne, hauteur conservée) · `filled` · `empty-never-visited` (CTA de création) · `empty-no-data` (« aucune donnée sur la période », E2) · `error` (message + `Réessayer`) · `filtered-to-zero` (« 0 ligne pour ces filtres », avec le bouton de remise à zéro — distinct de `empty-no-data`) · `offline` (dernier résultat affiché, daté).

> `filtered-to-zero` et `empty-no-data` sont deux états, pas un. « Aucun résultat
> pour vos filtres » et « aucune donnée sur la période » ne se réparent pas de la
> même façon : le premier par un bouton, le second par une période plus large.

**Fond de badge épinglé — règle du composant, écrite ici une seule fois.** Un badge
d'état posé dans une ligne de tableau a **son propre fond**, qui ne dépend **jamais**
de la parité de la ligne. Trois fonds sont admis, et trois seulement :
`--color-surface-raised` `#F7F9F8` pour un état neutre ou d'incertitude,
`--color-accent-subtle` `#D3E4E2` pour l'état officiel, `--color-out-of-band-subtle`
`#F6E1DE` pour un refus. Aucun autre.

Le calcul qui impose cette règle, mesuré avec la formule de luminance relative de
WCAG 2.1. Si le badge prenait le fond de la ligne — donc `#E4E8E6` sur les lignes
alternées, que `--color-ink-100` réserve à cet usage — on obtiendrait :

| Texte du badge | Sur la ligne alternée `#E4E8E6` | Sur le fond épinglé `#F7F9F8` |
|---|---|---|
| `--color-unknown` `#7A6A3C` | **4,30:1** — sous 4,5:1 | **5,02:1** — conforme |
| `--color-stale` `#746A5E` | **4,28:1** — sous 4,5:1 | **5,01:1** — conforme |

Les deux sont sous le seuil, et le texte d'un badge est en `--text-overline` 11 px :
ce n'est pas un grand texte au sens WCAG, donc 4,5:1 s'applique sans exception. Un
badge dont le contraste change avec la parité de la ligne est un badge **parfois**
illisible, et « parfois » ne se spécifie pas : il n'y a pas de version réduite d'une
règle de contraste, seulement un défaut intermittent. Le badge est donc une
**surface**, pas une teinte de cellule : il a sa propre valeur, comme un chip d'état
sur un fond de tuile.

**Aucun écran ne recalcule ce fond.** Les écrans qui rendent un badge d'état —
`definitions.md`, `definition-formulaire.md`, `definition-signature.md` — le
réfèrent. Une implémentation qui prendrait le fond de la ligne réintroduirait le
défaut que ce paragraphe vient de supprimer, et le ferait silencieusement.

#### 2.7 États de ligne d'un référentiel

**Rôle du contrat** : décrire les **états d'une ligne** d'un tableau de gestion —
pas ceux de la table, qui sont au-dessus, et pas ceux d'une tuile de valeur. Le
standard `admin_crud` les exige (« états de ligne : actif / inactif / en attente /
erreur — visibles sans clic ») ; un référentiel de gouvernance en a trois de plus,
qu'imposent B17 (propriétaire inactif), E4 (version modifiée en attente) et E15
(périmètre résolu vide). Ils sont écrits **ici** parce qu'ils sont une propriété du
composant : les écrans du module `definitions` les rendent et s'y alignent, et une
table recopiée dans chaque écran est une table qui divergera.

**Les sept états, et leur rendu** :

| # | État | Couleur du texte | Fond du badge | Texte | Icône |
|---|---|---|---|---|---|
| 1 | `signed` — signée, officielle | `--color-accent` `#0F5C57` | `--color-accent-subtle` `#D3E4E2` | « signée · v3 · 14/03 · M. Ravel » | `badge-check` |
| 2 | `in_review` — en attente de signature | `--color-unknown` `#7A6A3C` | `--color-surface-raised` `#F7F9F8` | « en attente de M. Ravel · 6 j » | `clock` |
| 3 | `draft` — projet, jamais présentée | `--color-stale` `#746A5E` | `--color-surface-raised` `#F7F9F8` | « projet — jamais présentée » | `pencil-line` |
| 4 | `refused` — refusée, avec motif | `--color-out-of-band` `#B23A2E` | `--color-out-of-band-subtle` `#F6E1DE` | « refusée le 21/09 · motif ci-dessous » | `circle-x` |
| 5 | `stale-owner` — propriétaire inactif (B17, E8) | `--color-stale` `#746A5E` | `--color-surface-raised` `#F7F9F8` | « propriétaire inactif · statut officiel perdu » | `user-round-x` |
| 6 | E4 — version modifiée, signature en attente | `--color-unknown` `#7A6A3C` **+** liseré `--color-accent` 3 px | `--color-surface-raised` `#F7F9F8` | « v2 signée · v3 en attente depuis le 21/09 », puis en 12 px « 2 tableaux de bord restent sur v2 » | `clock` + `git-branch` |
| 7 | E15 — périmètre résolu vide | `--color-unknown` `#7A6A3C` | `--color-surface-raised` `#F7F9F8` | « périmètre résolu vide » | `circle-help` |

Le **fond** de chaque ligne est celui du contrat `DataTable` ci-dessus : épinglé,
jamais celui de la cellule. Cette table ne le recalcule pas.

**Un état est porté par un mot, jamais par une couleur seule** (PRD § 7.3). Les
sept portent **un texte et une icône**, la couleur n'étant que le troisième
porteur, jamais le seul. Trois conséquences, non négociables : aucun de ces états ne
se rend par une pastille, un liseré ou un point sans mot ; le tri par état se fait
sur le **texte** du filtre, jamais sur une teinte ; et un état dont le texte
disparaît n'est pas un état, c'est un défaut.

**Précédence, quand plusieurs causes convergent sur une ligne** — un même champ
d'état ne porte qu'un seul des rendus 1 à 4, et les causes ne s'annulent pas, elles
se répartissent :

| Rang | Condition | Rendu retenu | Pourquoi |
|---|---|---|---|
| 1 | la version courante a été **refusée** avec motif | rendu 4, et **seulement** lui | Un refus motivé est le dernier acte sur cette version : afficher « projet » effacerait le motif, afficher « en attente » serait faux — elle n'est chez personne. |
| 2 | le propriétaire est **inactif** (B17) | rendu inchangé dans le champ d'état **+** rendu 5 à côté du propriétaire | B17 retire le statut officiel sans annuler la signature : la signature est un fait passé et intact. Les deux informations sont vraies simultanément, donc elles cohabitent. |
| 3 | E4 — une version plus récente est en attente | rendu 6, composé, qui **contient** le rendu 1 ou 2 | E4 est une relation entre deux versions, pas un état d'une version. Le seul rendu qui ne ment sur aucune des deux. |
| 4 | la version est **signée** et le propriétaire est actif | rendu 1 | Cas nominal. |
| 5 | la version est **en attente** | rendu 2 | — |
| 6 | la version n'a **jamais** été présentée | rendu 3 | — |

**Pourquoi le rendu 5 porte `--color-stale` et pas un gris de panne.** Un
propriétaire inactif n'est **ni un refus** (l'auteur n'a rien fait de mal, la version
reste signée) **ni un projet** (elle a déjà été signée et publiée) : c'est une
défaillance de gouvernance. Le gris chaud `--color-stale` recouvre donc `projet` et
`propriétaire inactif`, et c'est le **seul** recouvrement autorisé — les deux disent
la même chose au fond, *personne n'est responsable de ce chiffre en ce moment*. Ils
ne se confondent pas en pratique parce qu'ils ne sont pas dans le même champ : la
question « y a-t-il quelqu'un qui répond ? » se pose par propriétaire, pas par état
de signature. Le gris froid `--color-source-unavailable` `#5B5B63` reste réservé à
la panne de source : une ligne de référentiel n'a pas de source, et lui emprunter sa
couleur reviendrait à dire « le système est en panne » quand le fait est « plus
personne ne répond de ce chiffre ».

### FormField

**Rôle** : un champ de saisie avec validation au blur, étiquette visible et message d'erreur au champ.

**Variants** : `text` · `formula` (mono, aide syntaxique inline) · `select` · `owner-picker` (annuaire, personne nommée — jamais un texte libre) · `readonly` (valeur d'une version signée, non modifiable).

> `owner-picker` n'accepte pas la saisie libre. B3 exige une personne nommée ; un
> champ texte qui accepte « l'équipe production » produit une règle sans
> propriétaire, donc non signable.

### SignatureBar

**Rôle** : présenter l'état de signature d'une version de définition et l'action de signer ou de refuser.

**États** — rendus par l'union `SignatureState` `draft` · `in_review` (signataire désigné, en attente) · `signed` (horodatage, identité du signataire, version) · `refused` (motif obligatoire) · `revocable` (signé mais non publié → révocable par l'auteur, B26) · `locked` (signé et publié → non révocable).

> `revocable` et `locked` sont deux rendus du même composant. Les confondre
> ferait croire qu'une signature publiée peut être reprise en un clic, ce que B26
> interdit.

### ProvenanceStrip

**Rôle** : la bande « calculé le · source · version · signé par » affichée sous toute valeur. Ce n'est pas un tooltip : c'est permanent.

> Un tooltip est un état caché. B5 et B10 portent sur une information de
> contrôle : elle doit exister sans qu'on aille la chercher.

### ExportPanel

**Rôle** : déclencher un export et afficher son état.

**États** — rendus par l'union `ExportState` `idle` · `queued` (tâche de fond, avec identifiant) · `running` (progression) · `ready` (lien, expiration datée) · `failed` (aucun fichier partiel proposé, E13) · `forbidden_scope` (E6 — refuser, et nommer le périmètre qui serait autorisé).

---

## 3. Patterns de navigation

### 3.1 Structure

```
┌──────────┬─────────────────────────────────────────────────┐
│          │  fil d'ariane : Indicateurs › CA par client     │
│ sidebar  ├─────────────────────────────────────────────────┤
│  5       │                                                 │
│ entrées  │   zone de contenu (grille 12 colonnes)          │
│  240px   │                                                 │
│          │                                                 │
│          ├─────────────────────────────────────────────────┤
│          │  ProvenanceStrip : fixe en bas de page          │
└──────────┴─────────────────────────────────────────────────┘
```

### 3.2 Navigation principale

- **Type** : sidebar gauche, persistante sur `--bp-desktop` et `--bp-wide`. Sur `--bp-mobile` et `--bp-tablet`, elle devient un tiroir — mais le MVP est **lecture seule sur téléphone** (US-15 en V2), donc le tiroir n'existe pas au MVP.
- **Plateau** : 5 items.

| Rang | Module | Libellé | Fréq. (1-5) | Centralité (1-5) | Justification |
|---|---|---|---|---|---|
| 1 | `indicateurs` | Indicateurs | 5 | 5 | La boucle commence là : le manager ouvre le produit pour lire une valeur, chaque matin (fréquence déclarée au PRD). |
| 2 | `tableau-de-bord` | Tableaux de bord | 4 | 4 | L'ensemble à partager au comité. Fréquent mais **moins** que l'indicateur : on lit un indicateur tous les jours, on consulte un tableau de bord à l'approche d'une réunion. |
| 3 | `definitions` | Définitions | 2 | 5 | **Centralité maximale, fréquence minimale** : c'est le cœur du produit (B1, B2) et c'est le contrôleur de gestion qui l'utilise. Fréquence 2 le place en 3e, pas en 1er : le placer en tête aurait mis l'outil du rare au-dessus de la boucle quotidienne. |
| 4 | `acces` | Accès et journal | 1 | 4 | Usage mensuel ou lors d'un contrôle. Préoccupation de conformité, pas une boucle : dernier rang malgré une centralité 4. |

> **« Indicateurs » est premier parce qu'il ouvre la boucle**, pas par défaut. La
> « défense » d'un produit BI n'est pas la définition : c'est la lecture du jour.

**Overflow** : aucun. 4 items, aucun de plus. `Alertes` (US-12, **V1** —
`roadmap.md` § 2.2) et `Paramètres` n'existent pas au MVP ; quand US-12 arrive
en V1, cette entrée entre en overflow et l'un des quatre sort.

> **Aucune entrée n'est réservée à un module futur.** Ce document en prévoyait
> cinq, avec `Explorer` (US-10, hors MVP) au rang 3, pour que les rangs ne bougent
> pas à l'arrivée de la V1. La garde `nav_items_have_screens` l'a refusé : « un
> slot sans écran est un module vide », et elle a raison. Un module qui n'existe
> pas dans la version courante ne figure pas dans la navigation.
>
> `state.json → index.nav` fait foi. À l'arrivée de US-10 en V1, `explorer` entre
> au rang 3 et `definitions` glisse au rang 4.

L'ordre retenu est vérifiable — `state.json → index.nav` est l'autorité, ce
tableau en est la lecture :

```bash
node "$FORGE/scripts/state.js" set-nav <anchor> '{ "archetype": "...", "items": [ ... ] }'
```

### 3.3 Breadcrumbs

- **Visibilité** : toujours, sur tous les breakpoints.
- **Format** : `Indicateurs › CA par client › Détail`

### 3.4 Transitions entre pages

- **Type** : pas de transition d'entrée. Le contenu se remplace en place.
- **Durée** : `--duration-fast` sur le changement de contenu, `--duration-normal` sur l'ouverture d'un panneau.

---

## 4. Grille et layout

### 4.1 Grille de base

12 colonnes, gap `--space-md` (8 px), conteneur max `--bp-wide`. Une tuile
d'indicateur occupe 3 colonnes (4 par ligne sur `--bp-desktop`), 4 sur
`--bp-tablet` (3 par ligne), 12 sur `--bp-mobile`.

> **La hauteur d'une tuile ne change pas le nombre de tuiles par ligne.** Une tuile
> occupe des colonnes, pas des pixels de hauteur : le passage de `md` à **172 px**
> (voir § 2, Tailles) ajoute de la hauteur, pas de la largeur. Le seul effet sur la
> grille est le nombre de rangées visibles sans défilement, et il est écrit dans
> chaque écran qui rend une grille de tuiles — parce qu'une page qui tient sans
> défilement en séance est une **exigence de lecture** (PRD § 7.3), pas un
> détail de mise en page.

### 4.2 Layouts type

| Layout | Structure | Usage |
|---|---|---|
| Page standard | Sidebar + contenu 12 col | Liste d'indicateurs, référentiel des définitions |
| Page dashboard | Sidebar + grille de tuiles + barre de périmètre | Tableau de bord (US-6) |
| Page projetée | Sidebar masquée, grille 4 tuiles par ligne, `--text-display` à 56 px | Séance de comité (`--bp-wide`) |
| Split screen | Contenu 8 col + panneau d'historique 4 col | Détail d'un indicateur (US-17) |
| Plein écran | Modale centrée, fond assombri à 40 % | Signature d'une définition (US-2) |

---

## Checklist de gate

**Direction**
- [x] Les trois ancres sont écrites : références, ambiance, anti-références.
- [x] L'archétype est identifié et justifié.
- [x] La densité est choisie consciement et justifiée.
- [x] Un skill de design a été utilisé, ou son absence est justifiée dans l'audit.

**Tokens**
- [x] Tous les design tokens ont une valeur concrète.
- [x] Aucun `{{PLACEHOLDER}}` résiduel.
- [x] La palette couvre tous les états (default, hover, active, disabled, error, source indisponible, fraîcheur inconnue).
- [x] La palette n'est pas une palette par défaut : ni `#3B82F6`, ni `#6B7280` en neutre choisi, ni `#EF4446` en rouge d'erreur.
- [x] Le fond n'est pas du blanc pur : `#F2F4F3`.
- [x] L'échelle typographique a un ratio réel entre ses niveaux, et l'écart le plus large est placé là où il sert (lecture à 3 m).
- [x] **Les états ajoutés après coup n'ont introduit aucune couleur** (§ 1.1) : franchissement, réarmement et périmètre vide réutilisent des tokens existants, et ce qui les distingue est une **date** dans le slot `threshold`, pas une teinte.

**Composants**
- [x] Les composants primitifs couvrent le périmètre du MVP.
- [x] Chaque composant a ses états documentés, y compris les états d'échec du domaine (`unknown_freshness`, `source_unavailable`, `no_data`, `perimeter_empty`, `permission_denied`).
- [x] L'ombre n'est pas le séparateur par défaut : `--shadow-none` est la valeur par défaut, l'ombre est réservée au flottant.
- [x] **Le franchissement d'un seuil est une machine à états nommée, pas un booléen** (§ 2.1) : `threshold_armed`, `out_of_band_alerting`, `out_of_band_alerted`, `threshold_latched`. « Franchi, alerte déjà émise » et « en train de franchir pour la première fois » sont deux états distincts, et une oscillation autour du seuil ne produit pas de nouvelle alerte (B12, E9).
- [x] **`not_applicable` est une valeur nommée de l'enum `threshold_state`**, pas une valeur orpheline d'écran : c'est « pas de machine » — aucun seuil déclaré (B11) ou machine suspendue — et la seule qui ne produise aucun état rendu.
- [x] **Les trois suspensions de la machine sont au niveau du composant** (§ 2.1) : B13 / B17 / E8, E16, **et B6** (« date de calcul absente de la source »), qui était une règle d'écran appliquée sans autorité.
- [x] **La précédence des états est écrite au niveau du composant** (§ 2.2), rangs `4 bis` et `5 bis` compris : `indicateurs.md` § 4.1 et `indicateur-detail.md` § 4.2 la référencent, aucun écran ne la redéfinit.
- [x] **Aucune alerte par oscillation n'a de rendu** : pas de toast, pas de bandeau de félicitation au réarmement. Le réarmement est silencieux et se constate dans le slot `threshold` (B12, US-4).
- [x] **La taille `md` est de 172 px, et la règle « aucune date de seuil n'est rognée, quelle que soit la taille » est dans le contrat du composant** (§ 2, Tailles) : la complétude de la ligne `threshold` ne dépend plus du format d'écran, donc le même composant n'a plus deux rendus.
- [x] **Le calendrier de la machine est écrit, et il est celui de la roadmap** (§ 2.1) : l'état « hors cible / dans la zone » avec sa date au MVP, la machine à états et ses horodatages en V1 (`roadmap.md` § 2.1, § 2.2, § 3.1). Aucun arbitrage n'est attribué à un gate qui ne l'a pas pris.
- [x] **Les états de ligne d'un référentiel sont un contrat du composant** (§ 2.7) : les sept états, leur précédence, et la règle « un état est porté par un mot, jamais par une couleur seule » (PRD § 7.3). `definitions.md` § 4.1 les référence et ne les recopie pas.
- [x] **Le fond de badge épinglé est écrit une seule fois, dans le contrat `DataTable`**, avec le calcul qui l'impose (`#E4E8E6` : 4,30:1 et 4,28:1, sous 4,5:1). Aucun écran ne le recalcule.

**Navigation**
- [x] La navigation est définie pour desktop et mobile (mobile : lecture seule, tiroir non implémenté au MVP).
- [x] L'ordre est justifié par la fréquence, avec un score et une raison par item.
- [x] La barre principale ne dépasse pas 5 items ; aucun overflow, et **aucune entrée réservée à un module futur**.
- [x] « Indicateurs » est premier pour une raison : il ouvre la boucle quotidienne.
- [x] L'ordre de ce document est identique à `state.json → index.nav`, qui fait foi — réconcilié après `set-nav`.
- [x] L'ordre est enregistré via `state.js set-nav`.

**Layout**
- [x] La grille couvre le cas projeté, qui est le cas d'usage principal du comité.
- [x] Les animations sont nommées, et les données ne bougent jamais.
- [x] Au moins un choix visuel est assumé et contestable : le gris `--color-unknown`, un état d'incertitude rendu ni en rouge ni en neutre.

**Statut** : `draft` → en attente de validation.