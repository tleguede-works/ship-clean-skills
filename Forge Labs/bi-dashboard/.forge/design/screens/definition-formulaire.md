---
type: screen
slug: definition-formulaire
title: "Déclarer une définition d'indicateur"
module: definitions
status: approved
generated_at: 2026-09-30
derived_from:
  - .forge/prd.md
  - .forge/design/design-system.md
rule_ids:
  - B1
  - B2
  - B3
  - B14
  - B18
  - B22
  - B26
edge_case_ids:
  - E4
  - E15
flow: declaration-definition
---

# Écran — Déclarer une définition d'indicateur

> Ce document est la **source de vérité** pour qu'une IA génère l'interface de cet écran.
> Il est généré depuis ce gabarit, jamais recopié. Aucun placeholder ne doit subsister.

---

## 1. Rôle de l'écran

| | |
|---|---|
| **Archétype d'app** | `dashboard` (archétype produit) ; surface d'écriture conforme aux standards `admin_crud` — `DataTable` variante `reference`, actions groupées, densité `md` |
| **Module** | `definitions` — rang **3** dans la navigation (`state.json → index.nav`) |
| **Route** | `/definitions/[slug]` — création : `/definitions/nouvelle` |
| **Type** | `page` (pleine largeur, rail droit permanent) |
| **Utilisateurs** | Contrôleur de gestion (auteur de la version) — seul profil en écriture. Toute autre personne nommée qui ouvre la route passe en lecture seule, sans que l'existence du mode d'écriture lui soit cachée. |
| **User stories servies** | US-1, US-11 |
| **Règles métier** | B1, B2, B3, B14, B18, B22, B26 |
| **Edge cases** | E4, E15 |

**Une phrase** : cet écran permet au contrôleur de gestion de **fixer par écrit ce que compte un chiffre et qui en répond**, afin qu'il cesse d'exister deux versions du même chiffre.

**Pourquoi il est au rang 3 de la navigation** : centralité 5, fréquence 2. `definitions` porte B1 et B2, donc c'est le cœur du produit ; mais seul le contrôleur de gestion l'ouvre, une fois par semaine. Le placer au rang 1 aurait mis l'outil du rare au-dessus de la lecture quotidienne des indicateurs (rang 1, fréquence 5), et aurait changé à chaque version la lecture de la hiérarchie. Il est donc 3ᵉ : assez haut pour être trouvé sans passer par le graphe, assez bas pour ne pas concurrencer « Indicateurs ».

> **Écart de coherence consigné, non tranché ici** : `design-system.md` § 3.2 décrit un plateau de **5** entrées avec `explorer` au rang 3 et `definitions` au rang 4 ; `state.json → index.nav` (autorité du gate) n'en retient que **4** et place `definitions` au rang 3. Ce pantalla suit `state.json`. L'arbitrage appartient au gate de design, pas à un écran.

---

## 2. Direction visuelle de cet écran

Repris du design system — **valeurs concrètes, jamais « à définir »**.

| | |
|---|---|
| **Mood** | dense, sourcée, non décorative — « la fiche d'une nomenclature dans le système documentaire de l'entreprise » |
| **Densité** | **dense** — le formulaire est rempli une fois par semaine mais relu à chaque contestation en comité : le rail droit porte trois informations qu'il faut voir au même écran que les champs, sinon le contrôleur enregistre sans les avoir lues. Espacement `--space-md` (8 px) entre champs d'un même bloc, `--space-2xl` (24 px) entre les trois blocs (identité / formule / gouvernance) — l'espace **regroupe**, il n'est pas uniforme. |
| **Niveau de contraste** | **fort** — ce formulaire est un acte de gouvernance : le propriétaire et le signataire doivent être lus sans ambiguïté à l'écran comme en impression de comité. Aucune information portée par la seule couleur. |
| **Surface** | `--color-surface` `#E9EDEB` (blocs) sur `--color-background` `#F2F4F3` ; champs de saisie en `--color-surface-sunken` `#DEE3E1` ; panneau d'aide en `--color-surface-raised` `#F7F9F8`. Séparation par `--color-border` `#C9D0CD`, **jamais par une ombre**. |
| **Accent utilisé** | `--color-accent` `#0F5C57` — bouton d'enregistrement, focus, badge « version officielle », et liseré de 3 px à gauche du bloc « auteur » (le champ qui rend l'auto-signature impossible). `--color-accent-subtle` `#D3E4E2` en fond du bandeau de conséquence. |
| **Traitement photographique** | **AUCUN** — pas d'image, pas d'icône décorative, pas de dégradé. La seule icône employée est celle d'un état (hors cible, inconnu, refus), au sens de l'exigence 7.3 du PRD. |
| **Référence** | la fiche article d'un référentiel normatif (une ligne par champ, un bloc de gouvernance à part) — pas un « wizard » d'inscription SaaS, pas un formulaire à étapes avec barre de progression. |

### 2.1 Anti-générique — obligatoire

Cet écran ne doit ressembler **à aucun** de ces défauts :

- [x] **Pas de fond blanc pur `#FFFFFF` par défaut.** — Le fond de page est `--color-background` `#F2F4F3`, gris-vert désaturé ; les blocs sont `#E9EDEB` et les champs `#DEE3E1`. Trois valeurs distinctes : la profondeur vient de la valeur, pas d'une ombre.
- [x] **Pas de carte ombrée pour tout.** — Aucune ombre sur la page. `--shadow-none` partout, séparation par filet `#C9D0CD` et par différence de fond. `--shadow-sm` est réservé à la liste déroulante de l'annuaire, `--shadow-lg` à l'export en cours.
- [x] **Pas d'uniformité** : la hiérarchie vient d'un rapport d'échelles typographiques, pas d'un espacement constant. — `FormField` libellé en `--text-overline` 11 px / 600, valeur en `--text-body` 14 px, formule en mono 14 px sur 6 lignes, titres de bloc en `--text-h2` 18 px, nom de l'indicateur en `--text-h1` 24 px. Rapport 11 → 18 → 24 → 40 px ; l'écart le plus large reste réservé au chiffre d'une tuile, cet écran n'en porte pas.
- [x] **Pas de gris neutre générique `#6B7280` par défaut.** — Aucun `#6B7280` dans l'écran. Secondaire `--color-text-secondary` `#4F5C57` (gris-vert choisi), tertiaire `#7E8A85`, alerte de contour `#7A6A3C`, indisponible `#5B5B63`. Quatre gris, quatre significations.
- [x] **Pas de mise en page centrée symétrique par défaut.** — Grille 12 colonnes : formulaire en 7 colonnes aligné à gauche, rail de conséquences en 5 colonnes à filet vertical. Contenu jamais centré, jamais de largeur `max-width: 720px` centrée comme un formulaire de contact.
- [x] **Pas d'illustration d'appoint générique** à la place d'une vraie hiérarchie. — L'état « vide — jamais visité » affiche les cinq champs obligatoires nommés, pas une icône dans un cercle ni un dégradé. Aucune mascotte, aucun emoji (interdit par les anti-références du design system).
- [x] **Pas d'une seule famille de police** si la hiérarchie demande du contraste. — Deux familles assumées : `Inter Variable` pour le texte et `--font-mono` (chasse fixe) pour **toute** valeur chiffrée, identifiant de source, numéro de version et formule. C'est ce qui rend deux versions comparables en colonne.

**Choix assumé et non neutre** : cet écran refuse d'être un formulaire. Il porte un **rail de conséquences non dismissible** à droite, qui affiche en permanence ce qui **reste attaché à la version précédente** quand on enregistre une nouvelle version (les tableaux de bord partagés, les exports déjà produits, la dernière valeur publiée et sa date de calcul), et **l'auteur de la version est un champ `readonly` affiché comme une constante** : il n'est pas « pré-rempli », il est affiché dans un bloc à liseré `--color-accent` avec la mention « vous ne pouvez pas être le signataire de ce que vous écrivez (B2) ». Un écran générique proposerait un champ « Signataire » avec une liste déroulante et laisserait l'auteur s'y trouver ; ici l'auto-signature n'est pas interdite par une règle, elle est **absente de l'espace des choix**. Le rail se remplit de vide, et ce vide est un avertissement.

---

## 3. Anatomie

```
AppShell                                    design-system §3.1
├── SideNav                                 design-system §3.1 — « Définitions » actif (rang 3)
├── Breadcrumb                              design-system §3.3 — Indicateurs › CA par client › Définition
├── PageHeader
│   ├── Text[h1]   « CA par client »
│   ├── Text[caption] slug monospace  ca-par-client
│   └── VersionBadge                        v3 · brouillon · non officielle
├── AlertBand                               E4 — 2 tableaux de bord partagés restent sur v2
│   └── Text[body-sm] + lien « voir la liste »
└── SplitLayout  7 col / 5 col
    ├── FormColumn                          grid 12 col, aligné à gauche, jamais centré
    │   ├── FormField[text]        Intitulé de l'indicateur            — requis
    │   ├── FormField[text]        Unité d'affichage (€, %, %)         — requis
    │   ├── FormField[formula]     Formule de définition  (mono, 6 lignes)
    │   │   └── HelpInline          aides syntaxiques inline, pas de pop-up
    │   ├── FormField[formula]     Cible de l'indicateur  — B14, champ de la formule
    │   └── ScopeResolver          B14 + E15
    │       ├── FormField[select]  Périmètre
    │       └── ResolutionBadge    « 1 284 lignes » ou « périmètre résolu vide » — E15
    ├── GovernanceBlock                    bord gauche 3 px --color-accent
    │   ├── FormField[owner-picker] Propriétaire        — B3, annuaire, sans saisie libre
    │   ├── FormField[owner-picker] Signataire désigné  — B2, auteur exclu de la liste
    │   │   └── ExcludedNotice     « l'auteur de cette version n'est pas proposé »
    │   └── AuthorConstant        auteur + date          — readonly, pas un champ
    ├── VersionDiff                        B1, B22 —.langue métier, 2 colonnes avant/après
    └── ActionsRow
        ├── Button[secondary]  Annuler
        └── Button[primary]    Enregistrer la version 3
    └── RailColumn                         5 col, filet vertical --color-border
        ├── DataTable[reference]           Versions antérieures — B1, lectures seules
        ├── StickyConsequences             B22 — reste rattaché à v2
        │   ├── DataTable[reference]       2 tableaux de bord partagés
        │   ├── Text[caption]              14 exports produits le …
        │   └── IndicatorTile[official] sm dernière valeur publiée + date de calcul — B5
        └── SignatureBar[draft|in_review|revocable]  lecture seule — B26
    └── ProvenanceStrip                    B5 — source · période · date de calcul · version
```

| # | Composant | Rôle | Source |
|---|---|---|---|
| 1 | `AppShell` + `SideNav` + `Breadcrumb` | Chrome, position dans la hiérarchie, module actif | design-system §3.1, §3.3 |
| 2 | `FormField[text]` | Intitulé et unité — étiquette visible, validation au blur | design-system §2 `FormField` |
| 3 | `FormField[formula]` | Formule de définition — mono, aide syntaxique inline, multi-ligne | design-system §2 `FormField` |
| 4 | `ScopeResolver` | Resout le périmètre choisi et **annonce** le nombre de lignes ; porte E15 | slice-local |
| 5 | `ResolutionBadge` | « périmètre résolu vide » en `--color-unknown`, jamais un zéro | slice-local |
| 6 | `FormField[owner-picker]` | Propriétaire **et** signataire désigné — annuaire, personnes nommées (B3) | design-system §2 `FormField`, variante `owner-picker` |
| 7 | `AuthorConstant` | L'auteur de la version, constant affichée, non saisissable (B2) | slice-local |
| 8 | `ExcludedNotice` | Explication de l'exclusion de l'auteur dans la liste des signataires (B2) | slice-local |
| 9 | `VersionDiff` | Écart avec la version précédente, **en langue métier** — US-17 critère 2 | slice-local |
| 10 | `DataTable[reference]` | Versions antérieures intactes (B1) + consequences de la sauvegarde (B22) | design-system §2 `DataTable`, variante `reference` |
| 11 | `IndicatorTile` (`official`, taille `sm`) | Dernière valeur publiée et sa date de calcul, pour montrer ce qui ne bougera pas | design-system §2 `IndicatorTile` |
| 12 | `SignatureBar` | État de signature de la version courante et condition de révocabilité (B26) | design-system §2 `SignatureBar` |
| 13 | `ProvenanceStrip` | Source · période · date de calcul · version, permanente sous le formulaire | design-system §2 `ProvenanceStrip` |
| 14 | `AlertBand` | Conséquence E4 : les dashboards partagés restent sur la version signée | slice-local |

---

## 4. States — tous, sans exception

| État | Déclencheur | Rendu | Feedback utilisateur |
|---|---|---|---|
| **Chargement** | Ouverture de `/definitions/[slug]` — définition courante, versions antérieures, résolution du périmètre | Skeleton **de la forme** : rectangles à la hauteur de chaque champ, le champ formule garde ses 6 lignes, le rail droit montre 5 lignes + une `IndicatorTile` à 96 px de haut. Aucun spinner central. | Le titre et le `VersionBadge` s'affichent en premier, le formulaire se remplit ensuite : la position de lecture est stable, il n'y a pas de saut de mise en page au remplissage. |
| **Rempli** | Définition existante ouverte en écriture | Champs pré-remplis avec les valeurs de la version précédente, en-tête `v3 · brouillon`. Le champ auteur est une constante grisée (`--color-surface-sunken`, `--color-text-disabled`) avec liseré `--color-accent`. | Bandeau d'entrée `--color-accent-subtle` : « vous modifiez la version 2, signée et publiée le 14/03 par M. Ravel. L'enregistrement créera la version 3, qui ne sera pas officielle tant qu'elle ne sera pas signée. » |
| **Vide — jamais visité** | `/definitions/nouvelle`, ou référentiel sans aucune définition écrite | Formulaire vide, les cinq champs obligatoires **nommés** en tête de colonne (intitulé, formule, périmètre, propriétaire, signataire), bouton primaire « Déclarer la version 1 ». Aucune illustration. | Le bouton primaire est visible mais inactif ; son infobulle nomme les champs manquants un par un au lieu d'un « veuillez compléter le formulaire ». |
| **Vide — aucune donnée** | Version 1 en cours : aucune version antérieure à comparer ; et **périmètre qui ne résout aucune ligne** | Deux rendus distincts : (a) `VersionDiff` affiche « version 1 — il n'y a pas d'écart possible », pas un diff vide ; (b) le champ périmètre porte le badge `--color-unknown` « **périmètre résolu vide** — l'organisation sélectionnée ne contient plus aucune entité », avec la commande de revoir le périmètre. **Jamais** la valeur 0 affichée comme un résultat. | E15 : le badge reste affiché tant que le périmètre est vide ; il ne devient pas une erreur bloquante mais il empêche de présenter une définition comme mesurable. |
| **Erreur de chargement** | Annuaire des personnes injoignable au moment de résoudre le `owner-picker` | Champ propriétaire et champ signataire passent en `--color-source-unavailable` `#5B5B63` avec mention « annuaire indisponible ». **Aucun repli en saisie libre** : la saisie libre est la seule chose qui ferait.screen ressembler à B3. | Message « Impossible de choisir un propriétaire tant que l'annuaire n'est pas revenu — B3 n'accepte pas un nom tapé au clavier », bouton `Réessayer` dans le champ. |
| **Erreur de soumission** | Enregistrement refusé, ou validation cliente | **Au champ, jamais en toast seul.** (a) propriétaire absent → « un propriétaire nommé est requis » sous le champ ; (b) formule invalide → ligne fautive soulignée en `--color-out-of-band` + numéro de ligne, focus déplacé à la ligne ; (c) si le serveur renvoie malgré tout un refus B2 → bandeau global `--color-out-of-band` « le signataire désigné ne peut pas être l'auteur de la version ». | Le focus va au premier champ fautif, l'erreur est lue par un lecteur d'écran (`aria-describedby`, `role="alert"`). Un toast qui disparaît ne peut pas porter une erreur de saisie. |
| **Succès** | Version enregistrée | Bandeau `--color-accent-subtle` en tête : « version 3 enregistrée en projet — en attente de signature de M. Ravel ». Le `VersionBadge` passe à `non officielle`, la `SignatureBar` passe à `in_review`. | Retour au référentiel avec la ligne de la v3 sélectionnée et `aria-live="polite"` annonçant le nouveau numéro de version. L'écran ne congratule pas, il nomme l'état et la prochaine personne. |
| **Hors-ligne / permissions** | Perte de liaison en cours de saisie ; ou utilisateur qui n'est ni propriétaire ni contrôleur de gestion | (a) hors-ligne : le formulaire **reste éditable**, le bouton d'enregistrement passe en « non enregistré — liaison perdue » et le `ProvenanceStrip` affiche « brouillon local du 30/09 à 09:14, non enregistré » ; (b) permissions : tous les champs en `FormField[readonly]`, rail droit conservé, **aucun** bouton d'enregistrement, bandeau « lecture seule — vous n'êtes pas l'auteur de cette version ». | (a) aucune modification n'est perdue (brouillon en `localStorage`, clé `draft/definitions/<slug>`) ; (b) l'écran se lit intégralement — refuser l'écriture n'a pas pour effet de cacher l'existence de la règle. |
| **Lecture seule** | Consultation par un tiers, ou version signée consultée hors mode édition | Tous les champs en `FormField[readonly]` (fond `--color-surface-sunken`, valeur `--color-text-primary`, pas de focus de saisie), `SignatureBar` en état `signed` ou `locked`, `DataTable` des versions navigable. | Aucun élément désactivé n'est indiqué comme désactivé : le mode lecture est déduit de l'absence de commandes, ce qui évite l'invention de boutons grisés que l'utilisateur essaie quand même. |

---

## 5. Interactions

| Élément | Événement | Comportement | Feedback visuel | État résultant | ID |
|---|---|---|---|---|---|
| `FormField[formula]` | typing | Aide syntaxique inline sous la ligne concernée, jamais de pop-up ; la formule ne se réécrit pas toute seule | `--color-unknown` sur le mot-clé inconnu, message sous la ligne | formule valide → aide disparaît à la sortie du champ | B14 |
| `FormField[formula]` (cible) | blur | La cible est un **champ de la formule de définition**, versionné avec elle. Il n'existe **aucun** écran de cibles : ce serait créer une cible hors de la version qui la porte, donc orpheline | Le champ porte le suffixe « versionné avec la définition » | Cible vide → indicateur neutre + badge `target-missing` « cible à reconfirmer » | B14 |
| `FormField[select]` (périmètre) | select | Résolution immédiate, affichage du nombre de lignes dans `ResolutionBadge` | `--color-surface-raised` + `--shadow-sm` sous le champ pendant la résolution (≤ 1 s) | `périmètre résolu vide` si 0 ligne | E15 |
| `FormField[owner-picker]` (propriétaire) | click → typing | Liste de l'annuaire, `--shadow-sm`, filtrage sur nom et direction ; **pas de saisie libre** | Options en `--text-body`, rôle `option`, sélection en `--color-accent-subtle` | Propriétaire choisi → le champ `signataire désigné` se recalcule | B3 |
| `FormField[owner-picker]` (signataire) | open | La liste **exclut** l'auteur de la version. L'exclusion est visible : l'entrée y est présente mais grisée, avec `aria-disabled="true"` et le motif au survol / au focus | `ExcludedNotice` sous le champ, permanent, pas seulement au survol | Si aucune personne ne reste éligible → le champ refuse la validation et **nomme la cause** au lieu d'ouvrir une voie de contournement | B2 |
| `AuthorConstant` | — | Ce n'est pas un champ : il n'a pas de curseur, pas de focus de saisie, pas de `autocomplete`. L'auto-signature est impossible **par construction d'interface**, pas seulement interdite par une règle serveur | Liseré `--color-accent` 3 px à gauche du bloc | constant | B2 |
| `DataTable[reference]` (versions) | row click | Ouvre le détail de la version en lecture seule ; aucune commande d'édition ni de suppression n'existe sur une version antérieure | Le focus revient à la ligne d'origine à la fermeture | inchangé — B1 : aucune version antérieure n'est réécrite | B1 |
| `Button[primary]` | submit | Enregistre la version ; refuse l'envoi tant qu'un des cinq champs obligatoires est vide, en nommant le champ | Bouton `loading` (spinner interne, largeur conservée), bandeau de résultat en tête | `Succès` → retour au référentiel | B1, B3 |
| `Button[primary]` | submit (v2 signée → v3) | Affiche d'abord la liste des 2 tableaux de bord partagés qui resteront sur `v2` tant que `v3` n'est pas signée, puis confirme | Panneau de confirmation, bouton secondaire « annuler » | La `v3` n'est pas officielle : `VersionBadge` = `non officielle` | E4, B22 |
| `SignatureBar` (`revocable`) | render | Affiche « signée le 14/03, non publiée — révocable par l'auteur ». Le bouton de révocation est ici **absent** : la révocation se décide sur l'écran de signature, où l'auteur est autorisé à agir sur sa propre version sans jamais la signer | — | inchangé | B26 |
| `FormField` (ensemble) | blur | Validation au blur, message au champ, jamais de toast seul | `--color-out-of-band` sur le filet du champ + message sous le champ | `Erreur de soumission` si inchangé au submit | B3 |
| `SignatureBar` | hover/click | Ouvre `/definitions/<slug>/signature`. Depuis le formulaire, le signataire ne vient pas signer : c'est le propriétaire qui le notifie | — | navigation | B2 |
| Export / partage | — | **Aucune commande.** Ni bouton « partager », ni champ lien, ni vignette partageable sur cet écran | Le rail nomme les tableaux de bord existants et leurs personnes nommées | — | B18 |
| `window` | beforeunload | Confirmation native si le formulaire est modifié et non enregistré ; après enregistrement, aucune confirmation | — | — | B1 |

- **Focus / clavier** : ordre de tabulation = ordre de lecture (intitulé → unité → formule → cible → périmètre → propriétaire → signataire → actions), le rail droit est atteint après les actions. `owner-picker` est un `combobox` avec `aria-expanded`, `aria-controls`, `aria-activedescendant` ; `↑`/`↓` naviguent, `Entrée` sélectionne, `Échap` ferme **sans sélectionner**. Anneau `--color-border-focus` 2 px, jamais `outline: none`. `Ctrl`+`Entrée` enregistre depuis n'importe quel champ texte.
- **Gestes** : aucun. Pas de swipe, pas de pull-to-refresh, pas de long-press : c'est un écran de saisie, les gestes ambigus y sont un risque de perte de travail.
- **Animations** : apparition du rail droit `--duration-slow` (240 ms) `--ease-in`, une seule fois à l'arrivée sur l'écran ; apparition / disparition d'un message de champ `--duration-normal` (160 ms) `--ease-out` ; changement d'état d'un badge `--duration-fast` (90 ms) `--ease-default`. **Aucune valeur chiffrée ne bouge** : pas de count-up, pas de défilement de texte ; le champ formule ne se réécrit pas pendant la frappe.
- **Retour arrière** : confirmation native si des modifications non enregistrées existent ; sinon retour au référentiel des définitions **avec les filtres conservés** (ils sont dans l'URL). La navigation arrière ne perd jamais le brouillon local.

---

## 6. Responsive

| Breakpoint | Comportement | Ce qui se replie / disparaît |
|---|---|---|
| **Mobile** `≤ 640px` | **Non livré au MVP.** Le design system pose la lecture seule sur téléphone (US-15 est en V2) : la route rend la version courante en lecture seule, avec le bandeau « l'écriture d'une définition n'est pas disponible sur téléphone ». **Jamais** un formulaire amputé, **jamais** une erreur 403. | Disparaissent : les deux colonnes de saisie, les boutons d'action, le `owner-picker`. Reste : le titre, le `VersionBadge`, la version en `FormField[readonly]`, la `SignatureBar`. |
| **Tablet** `641 – 1024px` | Une seule colonne. Le formulaire occupe la largeur, le rail descend sous le formulaire et devient une pile de blocs `DataTable` pleine largeur. Barre d'actions collante en bas, sur 56 px, pour éviter que « Enregistrer » parte hors écran au clavier virtuel | Se replient : les colonnes du `VersionDiff` (avant/après deviennent deux lignes empilées par entrée) ; les colonnes secondaires du `DataTable` des versions (`auteur`, `date de signature`) passent sous le libellé au format liste |
| **Desktop** `1025 – 1600px` | Grille 12 colonnes : formulaire 7 col / rail 5 col, aligné à gauche. Champ formule sur 6 lignes. Marges `--space-3xl` (32 px). | Rien ne disparaît. Le rail est en `position: sticky` sous l'en-tête : les conséquences restent visibles pendant qu'on descend dans le formulaire. |
| **Wide** `≥ 1601px` | Même découpage, conteneur centré sur 1440 px de contenu utile : formulaire 7 col / rail 5 col. Le champ formule passe à 8 lignes. Le rail passe en `DataTable[reference]` avec colonnes actions visibles | Rien de plus à cacher — mais la largeur ne grandit pas indéfiniment : au-delà de 1440 px, les lignes de formule s'allongent d'abord, parce qu'une formule de 140 caractères sur une ligne de 2400 px est moins lisible que sur deux lignes |

- **Cible tactile** : `--bp-tablet` et `--bp-desktop` — hauteur minimale des champs **32 px** (`dense` assumé : c'est un produit de bureau dense, pas un produit tactile) ; les deux boutons d'action **40 px** sur `≤ 1024px` ; `ProvenanceStrip` cliquable **≥ 44 × 44** sur tous les breakpoints, y compris dense.
- **Débordement** : garanti de ne jamais déborder — (a) la formule **défile horizontalement** dans son champ (`overflow-x: auto`, mono, `white-space: pre`) au lieu de passer à la ligne : une formule repliée n'est plus la formule affichée, et l'écran ment ; (b) le `DataTable` des versions défile horizontalement avec colonne nº de version en `position: sticky` ; (c) `ProvenanceStrip` est positionné en bas de page et **jamais** par-dessus une ligne de tableau — il prend sa propre rangée, sinon il masque une signature ; (d) `overflow-wrap: anywhere` sur les libellés d'indicateur longs, jamais sur les identifiants de source, qui restent en mono et peuvent défiler.

---

## 7. Accessibility

- [x] Contraste **11,3:1** pour le texte courant : `--color-text-primary` `#2C3633` sur `--color-background` `#F2F4F3`. Tous les champs obligatoires, le propriétaire et le signataire sont rendus dans cette couleur.
- [x] Contraste **7,1:1** pour le texte d'accent : `--color-accent` `#0F5C57` — bouton primaire, liens, badge « officielle ».
- [x] Contraste **5,4:1** pour l'alerte de contour : `--color-out-of-band` `#B23A2E` sur `--color-background` `#F2F4F3`, et **4,6:1** sur le fond creux `#DEE3E1` du champ fautif — messages d'erreur au champ et filet du champ fautif. Au-dessus de 4,5:1 dans les deux cas.
- [x] Contraste **4,8:1** pour l'incertitude : `--color-unknown` `#7A6A3C` sur le fond, **5,0:1** sur le fond épinglé du badge « périmètre résolu vide » (E15), `--color-surface-raised` `#F7F9F8` — règle déjà écrite dans `definitions.md` § 7.1, cet écran s'y aligne. Elle porte aussi un libellé en toutes lettres, pas seulement une teinte : un état « on ne sait pas » ne doit jamais pouvoir être confondu avec un état normal.
- [x] **Contraste 6,33:1 pour `--color-text-secondary` `#4F5C57`**, recalculé sur la valeur du design system §1.1 : **6,33:1** sur `--color-background` `#F2F4F3`, **5,9:1** sur `--color-surface` `#E9EDEB`, **6,6:1** sur `--color-surface-raised` `#F7F9F8`, **5,4:1** sur la surface creuse `#DEE3E1` des champs. **Conforme sur les quatre fonds de cet écran** : le secondaire porte donc les `source_ref`, les dates d'écriture, les aides de champ et les messages de validation sans réserve. La restriction qui le réservait aux seuls libellés `--text-overline` non essentiels est **supprimée** — elle mesurait 4,2:1 sur un couple couleur/fond qui n'existe pas dans le design system ; le token étant conforme, écarter le secondaire des informations de contrôle n'aurait dégradé l'écran sans corriger aucun défaut.
- [x] Navigation clavier complète sur `--bp-desktop` : aucun élément de la barre d'actions n'est atteignable uniquement à la souris, `Ctrl`+`Entrée` enregistre, le rail est atteignable et focusable.
- [x] Focus visible (tokens `--focus-ring` = `--color-border-focus` 2 px) sur chaque champ, chaque bouton, chaque ligne de `DataTable` et chaque option d'`owner-picker`. Jamais supprimé, y compris pour les champs `readonly`.
- [x] ARIA : `role="combobox"` + `aria-expanded` + `aria-activedescendant` + `listbox`/`option` sur `owner-picker` ; `aria-required="true"` + `aria-invalid` + `aria-describedby` sur les champs obligatoires ; `role="alert"` sur les messages d'erreur ; `role="status"` sur le bandeau de succès ; `aria-live="polite"` sur le `ResolutionBadge` (E15) pour que le lecteur d'écran entende le passage à « périmètre résolu vide » ; `aria-current="page"` sur l'entrée `Définitions` de la `SideNav`.
- [x] Alternatives textuelles : aucune image à alternative. Les états portent **toujours** un texte (`officielle`, `brouillon`, `périmètre résolu vide`, `propriétaire inactif`) en plus de la couleur et de l'icône — exigence 7.3 du PRD.
- [x] Langue et direction de lecture correctes : `lang="fr"`, `dir="ltr"`. Le vocabulaire métier (marge, taux de service, CA) n'est pas traduit (7.4) ; les noms propres et identifiants de source ne sont pas traduits non plus, d'où le mono.
- [x] Taille de texte : corps **14 px** minimum sur cet écran. L'exigence « pas de corps sous 16 px sur mobile » (design-quality §3) est satisfaite par construction : **l'écran n'existe pas sur mobile au MVP**.

---

## 8. Données

| Champ | Type | Origine | Requis | Erreur possible |
|---|---|---|---|---|
| `intitulé` | texte, 120 car. | saisie, API `definitions` | oui | vide ; doublon d'intitulé avec une autre définition (avertissement, pas blocage : deux indicateurs peuvent porter le même nom commercial) |
| `unité` | énumération (`€`, `%`, `jours`, `unités`) | saisie | oui | absente |
| `formule` | texte multi-ligne, mono | saisie, validée par la source (C1) | oui | syntaxe invalide, ligne fautive nommée ; jamais recalculée hors de la source |
| `cible` | nombre + unité, dans la formule de définition | saisie, versionnée (B14) | non | vide → indicateur neutre + badge `target-missing` ; **pas d'écran de cibles** (objet de V2) |
| `perimetre` | énumération issue de l'entrepôt (C1) | saisie, résolu par `ScopeResolver` | oui | ne résout aucune ligne → **E15**, badge « périmètre résolu vide », **pas** de 0 |
| `proprietaire_id` | identifiant de personne | **annuaire** — `owner-picker`, jamais du texte | oui | personne inactif à la date d'enregistrement ; annuaire injoignable ; **B3** : aucun nom libre accepté |
| `signataire_id` | identifiant de personne | **annuaire** — `owner-picker`, auteur exclu de la liste | oui | **B2** : égal à l'auteur → refus,Listé comme exclu, pas proposé ; propriétaire de la version → exclu également (glossaire PRD § 11) |
| `auteur_id` | identifiant de personne | **session** — readonly, jamais saisi | oui | l'utilisateur n'est plus actif → enregistrement refusé, réattribution requise |
| `version` | entier + horodatage | serveur | oui | conflit : la version a changé entre-temps → rechargement demandé |
| `statut_signature` | `draft` / `in_review` / `signed` / `refused` / `revocable` / `locked` | serveur | oui | incohérence serveur → `Erreur de chargement`, aucun enregistrement partiel |

- **Chargement** : **un seul bloc**, pas de pagination sur le formulaire. Le `DataTable` des versions pagine par 10 lignes ; au-delà de 3 versions, le `VersionDiff` compare par défaut la version courante à la dernière version **signée**, pas à la précédente dans le temps.
- **Cache / hors-ligne** : brouillon de saisie en `localStorage` sous `draft/definitions/<slug>`, réhydraté au retour avec bandeau « brouillon local du <date>, non enregistré ». Purge à l'enregistrement réussi et à l'abandon explicite. Aucun brouillon n'est écrit sur le serveur tant que le formulaire n'est pas envoyé.
- **Données sensibles** : le brouillon local ne contient **aucune ligne de données** et aucun identifiant de source autre que le `source_ref` affiché ; il ne contient que les champs de définition saisis. La résolution du périmètre n'est jamais conservée côté client au-delà du décompte affiché. Conformité C10 : chiffrement au repos et isolation par ligne sont des prérequis hors de cet écran, mais l'écran ne doit produire aucune copie non chiffrée.

---

## 9. Traçabilité

| ID | Origine | Manifestation sur cet écran |
|---|---|---|
| **B1** | PRD §4 | En-tête `VersionBadge` « v3 · brouillon » ; bandeau d'entrée nommant la version modifiée ; `DataTable[reference]` des versions antérieures en lecture seule, sans commande d'édition ni de suppression. Enregistrer crée une version, **jamais** une réécriture. |
| **B2** | PRD §4 | `AuthorConstant` : l'auteur est une constante affichée, liseré `--color-accent`. `owner-picker` du signataire **exclut** l'auteur de la liste avec `ExcludedNotice` visible en permanence et `aria-disabled` sur l'entrée. Le propriétaire est également exclu (glossaire § 11). Si la liste éligible est vide, le champ **nomme la cause** au lieu d'ouvrir un contournement. Visible avant tout enregistrement, donc impossible en amont. |
| **B3** | PRD §4 | `FormField[owner-picker]` sur propriétaire **et** signataire : recherche dans l'annuaire, aucune saisie libre, aucune étiquette de groupe (« équipe production ») acceptée. Justification écrite à l'écran : *« un champ qui accepte « l'équipe production » produit une règle sans propriétaire — donc non signable, puisque B2 exige une personne nommée et une signature. »* En cas d'indisponibilité de l'annuaire : pas de repli en texte (état `Erreur de chargement`). |
| **B14** | PRD §4 | La cible est un **second champ `FormField[formula]`** dans le bloc « Formule de définition », avec le suffixe « versionnée avec la définition ». **Aucun lien, aucun bouton, aucun écran de cibles** nulle part sur cette page, et la mention explicite que l'écran de cibles est un objet de V2. Champ vide → `IndicatorTile` en variante `target-missing`, « cible à reconfirmer ». |
| **B18** | PRD §9 (hors scope) | **L'absence est la manifestation.** Aucun bouton « partager », aucun champ lien, aucune vignette partageable, aucune URL sur cette page. Le rail nomme les tableaux de bord existants par leur titre et par leurs personnes nommées. Le partage par lien public ne peut pas réapparaître parce qu'il n'existe aucune surface où l'ajouter. |
| **B22** | PRD §4 | `StickyConsequences` dans le rail, visible **avant** l'enregistrement : « reste rattaché à la version 2 » — 2 tableaux de bord partagés, 14 exports produits, et la dernière valeur publiée avec sa date de calcul (`IndicatorTile` `official` taille `sm`). Le panneau de confirmation d'enregistrement liste ces trois éléments et dit que la version 3 ne les déplace pas. |
| **B26** | PRD §4 | `SignatureBar` en état `revocable` : « signée le 14/03, non publiée — révocable par l'auteur », avec le bouton de révocation **absent de cet écran** et un renvoi explicite vers `/definitions/<slug>/signature`, où l'auteur agit sans jamais signer. Bandeau d'entrée sur v2 publiée : les modifications créent une v3 qui ne reprend rien de la valeur publiée. |
| **E4** | PRD §6 | `AlertBand` en tête, au-dessus du formulaire, non dismissible : « 2 tableaux de bord partagés référencent cette définition ; ils resteront sur la version 2 tant que la version 3 n'est pas signée », avec la liste nominative des tableaux de bord concernés. Le même fait est repris dans le panneau de confirmation d'enregistrement. |
| **E15** | PRD §6 | `ResolutionBadge` en `--color-unknown` : « **périmètre résolu vide** — l'organisation sélectionnée ne contient plus aucune entité ». Aucune valeur `0` n'est affichée nulle part sur cette page, la résolution n'est pas un champ de formule, et le badge est annoncé par `aria-live`. La commande associée est « revoir le périmètre », pas « accepter ». |
| **US-1** | PRD §3 | Écran entier. Les cinq champs obligatoires correspondent aux cinq critères d'acceptation ; le refus d'enregistrement sans propriétaire **et** sans signataire est implémenté au `Button[primary]`. |
| **US-11** | PRD §3 | Le champ `cible` est **dans** le formulaire (critère « saisie dans la forme de définition, pas dans un écran séparé ») et il est versionné avec la définition. |
| **C2** | PRD §5 | Aucune saisie de données métier : on écrit une **définition**, jamais des chiffres. La formule est une règle de calcul, pas une valeur ; la seule valeur affichée est `readonly` dans le rail. |
| **C7** | PRD §5 | Cinq champs obligatoires, aucun assistant multi-étapes, aucune notion nouvelle hors « version » et « signataire ». La formation d'une demi-journée tient dans l'écran. |
| **C9** | PRD §5 | Aucune coupure du tableur : le formulaire accepte la formule telle qu'elle est écrite dans l'onglet existant, l'aide syntaxique étant inline et non bloquante. |

---

## 10. Checklist de gate

- [x] Les 9 états sont décrits avec un rendu concret.
- [x] Chaque élément interactif a un comportement et un feedback.
- [x] Le responsive est défini à **chaque** breakpoint du design system (`≤640`, `641–1024`, `1025–1600`, `≥1601`).
- [x] La section Anti-générique est cochée et justifiée (7 cases + un choix assumé).
- [x] Aucune valeur de design n'est laissée à « à définir ».
- [x] Chaque ID B*/E*/C* de l'écran apparaît en section 9 : B1, B2, B3, B14, B18, B22, B26, E4, E15, US-1, US-11, C2, C7, C9.
- [x] `node "$FORGE/scripts/forge-guard.js" placeholders <anchor>` ne signale rien ici.
- [x] L'écran reste cohérent avec `.forge/design/design-system.md` : tokens, composants nommés, `owner-picker` sans saisie libre, `ProvenanceStrip` permanente, `--shadow-none` par défaut.