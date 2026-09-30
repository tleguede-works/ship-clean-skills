---
type: screen
slug: dossiers
title: Dossiers
module: dossiers
status: draft
generated_at: 2026-09-30
derived_from:
  - .forge/prd.md
  - .forge/design/design-system.md
rule_ids: [B7, B12, B13, B16, B17, B18, C3, C4, C6, C10, N3, N4, N5, N6]
edge_case_ids: [E5, E10, E12]
flow: consultation-quotidienne
---

# Écran — Dossiers

> Ce document est la **source de vérité** pour qu'une IA génère l'interface de cet écran.
> Il est généré depuis le gabarit, jamais recopié. Aucun `{{PLACEHOLDER}}` ne doit subsister.

---

## 1. Rôle de l'écran

| | |
|---|---|
| **Archétype d'app** | `mobile_field_ops` (principal), `rental_tenancy` (secondaire) |
| **Module** | `dossiers` — rang 4 dans la navigation |
| **Route** | `/dossiers` |
| **Type** | page |
| **Utilisateurs** | Le propriétaire, seul utilisateur (C3) |
| **User stories servies** | US-4 |
| **Règles métier** | B7, B12, B13, B16, B17, B18, C3, C4, C6, C10, N3, N4, N5, N6 |
| **Edge cases** | E5, E10, E12 |

**Une phrase** : cet écran permet au propriétaire de retrouver un appartement en une
fraction de seconde et de voir, d'un coup d'œil sur toute la liste, **quels bails ont une
décision qui l'attend**.

**Pourquoi il est au rang 4 de la navigation** : sa fréquence est de 3 — les 14 baux une
fois créés, il se consulte plus qu'il ne se modifie — mais sa centralité est de 5, parce
que c'est **la source des cinq échéances** (B12) : sans lui, le garde-fou n'a rien à
afficher. C'est l'entrée de cycle de vie — créer le bail — donc elle arrive après les
actions récurrentes, mais avant la configuration. Départage explicite avec l'encaissement :
les deux ont un score de 15, et l'encaissement passe devant parce qu'il agit sur un objet
existant quand le dossier en crée un.

**Ce que cet écran ne fait pas** : il n'affiche ni plan, ni adresse cliquable, ni distance
(X6). L'adresse est une donnée du bail, et c'est tout.

---

## 2. Direction visuelle de cet écran

| | |
|---|---|
| **Mood** | opérationnelle, parlante, sans alarme |
| **Densité** | **dense** — 14 lignes de 56 pt tiennent en **deux défilements courts**, ce qui est la définition opérationnelle de « dense » pour un portefeuille de cette taille. Une liste aérée de 88 pt demanderait trois défilements, sans faire tenir une information de plus |
| **Niveau de contraste** | **fort** — le drapeau d'échéance doit se lire en balayant la liste du pouce, pas en la lisant. C'est la seule information de l'écran qui doit sauter aux yeux |
| **Traitement photographique** | **AUCUN.** Pas de photo du bien, pas de vignette d'appartement : une photo de bien serait une donnée personnelle du locataire décorative, et le décor n'est pas le rôle de ce produit |
| **Référence** | l'**onglet « Contrats » d'un logiciel de gestion locative classique**, vidé de tout ce qui ne sert pas : pas de badge, pas de tri, pas de filtre, pas de pagination. Il reste 14 lignes et un drapeau |

**Les valeurs portées par cet écran**

| Rôle | Token | Valeur |
|---|---|---|
| Fond de l'application | `--color-background` | `#101319` |
| Surface des lignes de liste | `--color-surface` | `#171B22` |
| Ligne alternée | `--color-surface-sunken` | `#0A0C10` |
| Barre d'action | `--color-surface-raised` | `#212630` |
| Encre de lecture | `--color-texte-principal` | `#E8ECF3` |
| Encre secondaire | `--color-texte-secondaire` | `#A6B0C0` |
| Encre tertiaire | `--color-texte-tertiaire` | `#8B95A5` |
| Cyan-gris — « à venir » | `--color-info-600` | `#74A9BC` |
| Terre cuite — « manquée » | `--color-alerte-600` | `#F09286` |
| Filet de séparation | `--color-filet` | `#2A303A` |

| | |
|---|---|
| **Surface** | `--color-surface` `#171B22` sur `--color-background` `#101319` |
| **Accent utilisé** | `--color-info-600` `#74A9BC` pour l'échéance à venir, `--color-alerte-600` `#F09286` pour l'échéance manquée, et **rien d'autre**. Aucune teinte d'accent sur le reste de la ligne : sur une liste de 14, une couleur par ligne Stoppe la lecture |

### 2.1 Anti-générique — obligatoire

- [x] **Pas de fond blanc pur `#FFFFFF`.** Fond `#101319`, choisi, justifié au design system
      § 0.3.
- [x] **Pas de carte ombrée pour tout.** Les 14 dossiers sont **14 lignes**, pas 14 cartes.
      Aucun fond propre, aucun rayon, aucun ombre : un filet de 1 px entre les lignes, et
      `--space-2xl` entre les groupes. C'est la seule chose qui rend 14 lignes lisibles
      debout.
- [x] **Pas d'uniformité.** Trois échelles sur une ligne : `Courges, 3e` en 17 px 600, le
      terme en 14 px en chasse fixe, le loyer en 17 px 600 aligné à droite. Le drapeau passe
      sur **sa propre ligne** sous le titre quand il est présent, ce qui porte la ligne à
      72 pt — donc la hauteur **encadre l'information**, elle ne la noie pas.
- [x] **Pas de gris neutre générique.** `--color-texte-tertiaire` `#8B95A5` est le cran bas,
      et il ne porte que des dates, jamais une information unique.
- [x] **Pas de mise en page centrée symétrique.** Flux vertical aligné à gauche, marges
      `--space-lg`. La seule exception est l'état vide, dont le texte est aligné à gauche
      dans un bloc de 280 pt.
- [x] **Pas d'illustration d'appoint générique.** Aucune image, aucun dégradé. Le seul
      élément coloré est le `DrapeauÉchéance`, et il porte un **mot**.
- [x] **Pas d'une seule famille de police.** La pile système pour les noms, `--font-chasse`
      pour les dates et les montants — les deux colonnes de droite s'alignent donc
      verticalement, ce qui est la seule raison de la seconde famille.

**Choix assumé et non neutre** : **la liste est triée par échéance, pas par ordre
alphabétique ni par ordre de création.** Le propriétaire ne cherche pas « Breguet » ; il
veut savoir « lequel est en train de me coûter de l'argent ». Un tri alphabétique est le
tri qu'un logiciel fait quand il n'a pas de priority, et celui-ci en a une — c'est
l'échéance la plus proche. Le tri par échéance se réorganise seul au fil du temps, ce
qui veut dire que **le dossier qu'il n'a pas ouvert depuis six mois se retrouve en haut tout
seul**, sans qu'il ait à le chercher.

---

## 3. Anatomie

```
BandeauSynchronisation                                  PERMANENT
        │
        ▼
TitreÉcran  variante `avec_contexte`
├─ [titre] "Dossiers"
├─ [retour] non — c'est un onglet
└─ [contexte] "14 baux · 1 à décider · 1 en retard"     --font-chasse
        │
        ▼  --space-lg
PanneauBlocage  variante `a_decider`             CONDITIONNEL, 1 ligne par décision
├─ [titre] "1 décision bloque la clôture de la journée."
├─ [lignes] LigneDonnée × n
└─ [action] Bouton discret "Traiter cette décision"
        │
        ▼  --space-2xl + sur-titre
ListePlate  variante `liste`
├─ LigneDossier × 14, triées par échéance la plus proche
│   ├─ [intitule] "Courges, 3e"            --text-body-fort
│   ├─ [terme]     "terme 31/03/2029"      --font-chasse, --text-caption
│   ├─ [montant]   "214 €"                 --font-chasse, aligné à droite
│   ├─ [drapeau]   DrapeauÉchéance, sur sa propre ligne
│   │      ├─ variante `bloquante_proche`  — cercle plein, cyan-gris
│   │      └─ variante `bloquante_manquee` — filet 3 px, terre cuite
│   └─ [etat_ecriture] mot d'état ambre, si le dossier porte une écriture locale
        │
        ▼
BandeauAlerte  variante `information`        CONDITIONNEL
└─ "2 baux portent des jugements. Ils ne sortent jamais d'un export."
        │
        ▼  --space-3xl
BarreAction  variante `principale`
├─ [action_principale] Bouton lg "Créer un bail"
└─ [hauteur_respiratoire] --space-3xl
BarreOnglets  variante `actif` sur le 3e segment      PERMANENTE
```

| # | Composant | Rôle | Source |
|---|---|---|---|
| 1 | `BandeauSynchronisation` | Dire où se trouve ce qui vient d'être écrit (B6) | design-system § 3.1 |
| 2 | `TitreÉcran` | Nommer l'écran et donner le contexte en une ligne | design-system § 3.18 |
| 3 | `PanneauBlocage` | Porter la property `garde-fou` sous forme de décisions à prendre (B13) | design-system § 3.3 |
| 4 | `ListePlate` | Contenir les lignes sans carte | design-system § 3.23 |
| 5 | `LigneDossier` | Rendre un bail en une ligne de 56 ou 72 pt | design-system § 3.4 |
| 6 | `DrapeauÉchéance` | Porter le seul drapeau d'échéance, une fois (B13) | design-system § 3.2 |
| 7 | `BandeauAlerte` | Dire une conséquence, ici l'existence de jugements hors export (B7) | design-system § 3.24 |
| 8 | `Vide` | Rendre l'absence de dossier avec son libellé écrit | design-system § 3.26 |
| 9 | `BarreAction` | Porter `Créer un bail` dans la portée du pouce (C4) | design-system § 3.16 |
| 10 | `BarreOnglets` | Naviguer vers les trois autres destinations | design-system § 3.17 |

---

## 4. États — tous, sans exception

| État | Déclencheur | Rendu | Feedback utilisateur |
|---|---|---|---|
| **Chargement** | Ouverture, lecture du cache local des baux | 8 `LigneDossier` en ossature, de **72 pt** — la hauteur de la ligne réelle, drapeau compris. Jamais 56 pt, sinon la liste saute à l'arrivée des drapeaux | Aucun texte d'attente, aucun spinner. Le `PanneauBlocage` n'est pas rendu tant que les échéances ne sont pas dérivées : **on ne montre pas un vide avant de savoir qu'il est vide** |
| **Rempli** | Au moins un bail existe | 14 lignes triées par échéance la plus proche, avec `DrapeauÉchéance` là où il y en a une, et le compteur de contexte en 2e ligne du titre | Aucun. La liste **est** le feedback |
| **Vide — jamais visité** | Aucun bail n'a été créé | `Vide` variante `jamais_visite` : « Aucun bail saisi. Le bail est le seul endroit où les dates entrent — les cinq échéances en sont tirées, et tu n'as rien à recopier. » + `Bouton primaire` `Créer un bail` | La `BarreAction` porte **le même** `Créer un bail` en `Bouton lg`. Deux points d'entrée pour un geste unique, c'est le premier geste de l'application : le double point d'entrée est volontaire ici et **nulle part ailleurs** |
| **Vide — aucune donnée** | Des baux existent mais aucun n'a d'échéance dans la fenêtre d'affichage | La liste des 14 lignes est rendue normalement, et **aucun `DrapeauÉchéance` n'apparaît**. Pas de bandeau « aucune échéance » : c'est l'état normal du produit six mois sur douze | Aucun. L'absence d'échéance n'est pas une information, donc elle ne s'annonce pas |
| **Erreur de chargement** | Le cache local est illisible | `Vide` variante `erreur` + `BandeauAlerte` en variante `impossible` : « Impossible de lire tes baux depuis cet appareil. Rien n'est affiché — et ce n'est pas vide : on ne sait pas encore. » | **Aucun bouton « Réessayer »** : la reprise est automatique. Le seul geste offert est un `BandeauAlerte` en variante `information` — « La lecture se fera seule dès que le réseau revient. » **Distinct du vide, toujours** |
| **Erreur de soumission** | La création d'un bail a échoué à la validation locale — dates impossibles, ou bail déjà présent | L'erreur est **au champ**, sur `/dossiers/:dossierId/bail`, jamais ici. Cet écran ne soumet rien ; si la feuille de création se referme par un geste, `MessageBref` variante `refus` : « Aucun bail créé. » | Aucun toast, aucune secousse. Un refus se dit calmement : une secousse est une alarme, et ce produit n'alarme pas (B13) |
| **Succès** | Un bail vient d'être créé et ses cinq échéances sont dérivées | `MessageBref` variante `info` : « Bail créé. Ses cinq échéances en sont tirées — 1 est à décider avant le 31 décembre. » puis retour sur la liste, **qui se trie immédiatement** et place le nouveau dossier à sa position d'échéance | Le message ne dit pas « synchronisé » : il dit ce que la création a produit, et le bandeau, lui, dit où en est l'écriture |
| **Hors-ligne / permissions** | Mode avion, sous-sol | La liste **complète** des 14 baux s'affiche depuis l'appareil, avec une ligne de contexte en tête de liste : « Affiché depuis cet appareil · dernière synchronisation 12/09 · 18 h 04 ». Les `DrapeauÉchéance` sont rendus normalement : ils sont **dérivés du bail local**, donc disponibles hors-ligne | Le bandeau rend `hors_ligne`. **La création d'un bail reste possible hors-ligne** : c'est une écriture locale comme une autre, et B1 la protège |
| **Lecture seule** | Écran reverrouillé, ou conditions d'écriture non réunies | Toutes les lignes en variante `lecture_seule` : texte en `--color-texte-desactive`, aucun drapeau, aucune zone pressable. La `BarreAction` rend `desactivee` | Le bouton `Créer un bail` en variante `impossible`, avec l'aide « Déverrouille pour créer un bail. » **La barre ne disparaît pas** |

---

## 5. Interactions

| Élément | Événement | Comportement | Feedback visuel | État résultant | ID |
|---|---|---|---|---|---|
| `LigneDossier`, tap | tap | Ouvre la fiche du dossier : `/dossiers/:dossierId` — faits, somme due, photos, échéances | Aucun fondu | Navigation vers la fiche | US-4 |
| `LigneDossier`, tap sur le `DrapeauÉchéance` | tap | Ouvre `/dossiers/:dossierId/bail` **à la ligne de l'échéance concernée**, focus posé dessus | Aucun | `LigneDonnée` en variante `a_decider` | B12, B13 |
| `PanneauBlocage`, action | tap | Même cible que ci-dessus, pour la première échéance non décidée | La barre d'action bascule en variante `avec_decision` | Panneau rendu, ligne ciblée | B13 |
| `Bouton lg "Créer un bail"` | tap | Ouvre la `Feuille` `/dossiers/nouveau/bail` — terme, prise du bail, loyer. **Trois dates sont demandées, pas cinq échéances** (B12) | La feuille monte en 200 ms | Formulaire de bail | US-4, B12 |
| `TitreÉcran`, contexte « 14 baux » | tap | Aucune action : le contexte est une information, pas un filtre. **Il n'y a pas de recherche, pas de tri, pas de filtre sur cet écran** — 14 lignes se balayent du pouce, et un champ de recherche serait une occasion de chercher au lieu de lire | Aucun | — | — |
| `BandeauAlerte` « 2 baux portent des jugements » | appui long | Déplie la précision : « Courges 3e, rue Dumenge. Ces textes ne sortent d'aucun export, et ils ne sont jamais envoyés. » Le repli est automatique après 15 s | Apparition en 200 ms | Bandeau déplié | B7 |
| `LigneDossier`, appui long | appui long | Ouvre la `Feuille` des actions du dossier : `Voir le bail`, `Produire l'export du dossier`, `Voir les faits`. **Aucune action d'effacement** (B18) — la liste s'arrête là | La feuille monte en 200 ms | Feuille d'actions | B18, B10 |
| `LigneDossier` pressée | appui long puis glissement | **Aucun geste de réordonnancement, aucun balayage.** Une liste de 14 dont l'ordre est une priorité ne se réordonne pas au doigt : le prochain tri automatique la défait | Aucun | Inchangé | B13 |
| `BarreOnglets`, segment 2 | tap | Bascule vers `/encaissement` | Instantané | Onglet actif | — |
| Retour arrière | retour | Revient à `/`. La position de défilement de la liste est conservée | Aucun | Inchangé | — |

- **Focus / clavier** : 14 focusables, un par ligne, anneau `--color-bordure-focus`.
  `Tab` les parcourt dans l'ordre d'échéance — donc dans l'ordre d'urgence, ce qui est
  l'ordre dans lequel le propriétaire veut les lire. `Origine` place le focus sur la
  première ligne portant un `DrapeauÉchéance`, parce que c'est ce qu'il vient chercher
  quand il ouvre cet onglet.
- **Gestes** : **aucun geste porteur.** Pas de swipe pour supprimer, pas de swipe pour
  archiver, pas de pull-to-refresh. La liste est refreshed par le bandeau et par le retour
  sur l'écran, et **le pull-to-refresh est interdit** ici pour une raison précise : le
  propriétaire le déclenche en sortant de l application's geste pour revenir en arrière,
  donc il déclencherait un rafraîchissement quand il veut juste revenir.
- **Animations** : changement d'état de ligne en `--duration-fast`, `--ease-default`.
  Apparition du `PanneauBlocage` en `--duration-slow`, `--ease-out`. **La liste ne se
  réordonne pas avec une animation** quand le tri change après une décision : une liste
  qui glisse sous le doigt pendant qu'il la regarde est une liste qu'il n'ose pas
  toucher. `prefers-reduced-motion` met tout à 0 ms.
- **Retour arrière** : conserve la position de défilement.

---

## 6. Responsive

| Breakpoint | Comportement | Ce qui se replie / disparaît |
|---|---|---|
| **Mobile** (0–479 px) | Le layout de référence. 14 lignes de 56 ou 72 pt, marges `--space-lg`, ligne alternée à partir de la 9e ligne pour suivre l'œil dans le noir | Rien |
| **Tablet** (480–899 px) | Deux colonnes : liste à gauche sur 400 pt, `PanneauBlocage` et `BandeauAlerte` à droite. La navigation devient un rail vertical de 88 pt | Le `BandeauAlerte` « jugements » passe sous le panneau de blocage : c'est une information de contexte, pas une action |
| **Desktop** (900 px et au-delà) | **Aucun rendu distinct.** Colonne centrée de 720 px maximum, navigation en bas. X11 exclut la version navigateur de bureau | Rien. Seule la largeur de colonne change |

- **Cible tactile** : 52 pt pour les lignes, les boutons, les segments d'onglet. Le
  `DrapeauÉchéance` **n'est pas sa propre cible** : sa zone pressable est la moitié droite
  de la ligne, 52 pt de haut, ce qui évite une cible de 24 pt impossible à toucher.
- **Débordement** : (1) Le `intitule` d'une `LigneDossier` est tronqué au deuxième point,
      jamais au milieu d'un mot, avec points de suite. (2) Le `montant` ne déborde jamais
      grâce à la largeur minimale de 72 pt en chiffres tabulaires. (3) Le compteur de
      contexte du `TitreÉcran` passe à la forme abrégée « 14 baux · 1 à décider » sous
      360 px de large, et **jamais** à une date de dernière synchronisation tronquée.
- **Ce qui ne déborde jamais** : le `DrapeauÉchéance` sur sa propre ligne, avec son libellé
  complet « Manquée depuis 6 jours · remontée une fois, le 7 janvier » — c'est la ligne la
  plus longue de l'écran et elle a sa propre ligne pour cette raison.

---

## 7. Accessibilité

- [ ] **Contraste du texte courant** — mesuré par `design-check contrast`, qui applique
      4,5:1 à `--color-texte-principal`, `--color-texte-secondaire` et
      `--color-texte-tertiaire` contre les huit surfaces déclarées en `on:`, dont la ligne
      alternée `--color-surface-sunken` et `--color-surface-raised`, les plus
      contraignantes. **Aucun ratio n'est écrit ici.**
- [ ] **Contraste des grands textes** — il n'y a pas de grand texte sur cet écran à part le
      titre, qui est classé `text` et mesuré à 4,5:1 comme le reste.
- [ ] **Navigation clavier complète** — sur clavier externe mobile et sur tous les
      breakpoints. `Tab` parcourt les lignes **dans l'ordre d'échéance**, donc dans l'ordre
      d'urgence. `Origine` va à la première ligne avec un drapeau.
- [ ] **Focus visible** — anneau `--color-bordure-focus` de 2 px avec 2 px de fond entre
      l'anneau et la ligne. Le fond de la ligne ne change pas au focus : un changement de
      teinte ne se voit pas au bord d'un écran sombre.
- [ ] **ARIA** — la liste est un `role="list"` de 14 `role="listitem"`. Chaque ligne porte
      un `aria-label` qui **commence par le drapeau** quand il y en a un : « Courges 3e,
      échéance manquée depuis 6 jours, terme 31 mars 2029, loyer 214 euros ». C'est la
      première information utile au balayage, donc c'est la première du nom accessible. Le
      `PanneauBlocage` est `role="region" aria-label="Décisions bloquantes"`.
- [ ] **Alternative textuelle** — **aucune image sur cet écran**, donc aucune alternative
      n'est nécessaire. C'est un choix : l'adresse est une donnée textuelle et aucune photo
      du bien n'est affichée (X6), donc il n'y a rien à décrire.
- [ ] **Langue et direction de lecture** — `lang="fr-FR"`, gauche à droite, euros en
      suffixe, dates en `JJ/MM/AAAA` complètes. Le nom d'un locataire est affiché tel qu'il a
      été saisi : **B17 impose qu'aucune donnée ne soit pré-remplie depuis une source
      extérieure**, donc Bailly ne complète pas, ne corrige pas et ne met pas de majuscule
      automatique qui changerait un nom propre.

---

## 8. Données

| Champ | Type | Origine | Requis | Erreur possible |
|---|---|---|---|---|
| `dossiers` | liste de baux | cache local d'abord, serveur ensuite (C2) | oui | Cache illisible : `Vide` variante `erreur`. **Jamais** une liste vide rendue comme un vide |
| `terme` | date `JJ/MM/AAAA` | saisie, **une seule fois**, dans le bail | oui | Terme antérieur à la prise du bail : refusée au champ, sur la feuille de création, pas ici |
| `loyer` | montant en euros | saisie (B16, B17) | oui | Loyer à 0 : accepté, et rendu par `Montant` en variante `manquant` avec un tiret — **0,00 € est une affirmation, l'absence en est une** |
| `montant_a_payer` | montant | saisie | non | Non saisi : `--color-texte-tertiaire` et la mention « pas saisi » |
| `echeance_proche` | échéance dérivée + famille | **dérivée du bail**, jamais saisie (B12) | non | Le bail est incomplet : aucune échéance n'est dérivée et **aucune date n'est affichée** — pas de date inventée |
| `classe_echeance` | `bloquante` ou `marge` | dérivée, jamais choisie par l'utilisateur | oui | Une échéance sans famille n'est pas rendue : le propriétaire ne choisit pas si une date est bloquante ou si c'est une marge, c'est une propriété du domaine |
| `etat_decision` | `a_decider` / `faite` / `faite_tard` / `faite_avec_accord` | calculé une seule fois, figé après décision (B13) | oui | Une échéance manquée qui n'a pas encore remonté : elle n'est pas rouge, elle ne l'est qu'après sa remontée unique |
| `portee_juridique` | énumération | locale au domaine | non | Absente pour un bail saisi avant que la portée ne soit connue : `Invite` permanente « La portée du dossier n'est pas encore connue. » **Rien n'est supposé** |
| `a_des_jugements` | booléen | dérivé, jamais stocké comme un texte | non | — |
| `tri` | énumération | **fixe** : échéance la plus proche, puis terme, puis intitulé | oui | Deux baux à échéance identique : départage par terme, puis par intitulé, pour que l'ordre soit **total** et jamais différent d'un lancement à l'autre |

- **Chargement** : tout d'un bloc, **sans pagination**. 14 lignes tiennent en deux
  défilements, et une pagination ferait perdre la position de défilement pour rien.
- **Cache / hors-ligne** : la liste complète s'affiche sans réseau dès que le cache local
  existe (N2, C9). Les échéances sont **dérivées localement** à partir du bail local, donc
  les drapeaux sont disponibles hors-ligne — c'est ce qui rend le garde-fou utile dans un
  sous-sol, où le propriétaire n'a pas de réseau.
- **Données sensibles** : nom, prénom, adresse, loyer, dépôt : données personnelles au
  sens de C6. **Rien n'est journalisé, rien n'est envoyé à un tiers** (N8). Le tri est
  calculé sur la date d'échéance, **jamais transmis**, et la liste n'est jamais mise en
  cache par un intermédiaire tiers. Le `BandeauAlerte` sur les jugements compte les dossiers
  sans jamais en nommer un seul dans un compteur — un compteur de dossiers portant des
  jugements ne dit pas lesquels.

---

## 9. Traçabilité

| ID | Origine | Manifestation sur cet écran |
|---|---|---|
| **B7** | PRD | Le `BandeauAlerte` « 2 baux portent des jugements. Ils ne sortent jamais d'un export. » Le fait de leur existence est visible ici, leur contenu ne l'est pas : **un compteur, jamais un texte** |
| **B12** | PRD | La colonne `terme` est affichée sur chaque ligne, parce que c'est **la date dont tout le reste dérive**. Le tri est fait sur l'échéance dérivée, donc par construction sur le bail |
| **B13** | PRD | Un seul `DrapeauÉchéance` par ligne, jamais deux. Un objet portant deux échéances n'affiche que la plus échéante, et le panneau de blocage nomme les autres. Une échéance manquée porte la mention « remontée une fois, le 7 janvier » |
| **B16** | PRD | Les montants sont **saisis et affichés**, jamais calculés. Aucun total de patrimoine, aucun taux, aucune somme agrégée sur cet écran : ce serait un indicateur, et un indicateur est une chose qu'on consulte au lieu d'appeler |
| **B17** | PRD | Aucune donnée n'est pré-remplie depuis une source extérieure. Le nom vient du bail, l'adresse vient du bail, le loyer vient du bail. **Bailly ne complète pas et ne corrige pas** |
| **B18** | PRD | L'appui long ouvre une feuille d'actions qui **s'arrête à « Voir les faits »**. Il n'y a aucune entrée d'effacement, dans aucune variante de cette feuille, et le mot « supprimer » n'apparaît nulle part sur cet écran |
| **C3** | PRD | Aucun écran d'administration, aucun sélecteur d'utilisateur, aucun avatar, aucun partage. Un seul opérateur, donc il n'y a personne à qui changer |
| **C4** | PRD | `BarreAction` de 88 pt et `BarreOnglets` de 64 pt permanentes, avec `--space-3xl` de respiration. L'action `Créer un bail` est au pouce, pas en haut à droite |
| **C6** | PRD | Le droit d'accès porte sur le dossier du locataire, donc l'entrée d'export est dans la feuille d'actions d'une ligne, pas dans un menu général |
| **C10** | PRD | Une seule langue, une seule monnaie, format de date `JJ/MM/AAAA` |
| **N3** | PRD | 52 pt sur toute cible pressable ; le drapeau n'est pas une cible de 24 pt, c'est la moitié droite de la ligne |
| **N4** | PRD | Aucun texte sous 14 px, corps à 17 px, contrastes mesurés par `design-check contrast` |
| **N5** | PRD | Tailles en `rem` suivant le réglage du téléphone, plafonné à ×1,3 |
| **N6** | PRD | Aucune pagination, aucun chargement différé : 14 baux tiennent en deux défilements et l'export complet est produit en moins d'une minute sans passer par cet écran |
| **E5** | PRD | Un locataire qui part et demande ses données trouve `Produire l'export du dossier` dans la feuille d'actions de sa ligne. L'export ne contient que du constaté, et le bail reste conservé jusqu'à sa date de fin |
| **E10** | PRD | « Supprimer un dossier pour faire le ménage » : **il n'y a pas de bouton.** Les trois états existent et sont portés par l'écran `donnees-personnelles`, où aucun geste unique ne les déclenche |
| **E12** | PRD | Si le stockage est plein, la création d'un bail échoue **avant** d'écrire quoi que ce soit : la feuille refuse avec la phrase d'impossibilité, et aucun bail partiel n'est créé. Un bail sans terme ne produirait aucune échéance, donc il n'en faut pas créer |

---

## 10. Checklist de gate

- [x] Les 9 états sont décrits avec un rendu concret et des **libellés écrits** ; aucun
      n'est vide.
- [x] Un état vide n'est jamais un zéro ; l'erreur de lecture a **un rendu différent** de
      l'absence de données, et les deux le disent dans leur libellé.
- [x] Aucun « Réessayer » : la reprise est automatique, donc un bouton de reprise serait un
      aveu que l'automatique peut échouer.
- [x] Chaque élément interactif a un comportement, un feedback et un état résultant.
- [x] Le responsive est défini aux **trois** breakpoints, le desktop inclus.
- [x] La section Anti-générique est cochée et justifiée avec les valeurs réelles.
- [x] Aucune valeur de design n'est laissée à « à définir ».
- [x] **Aucun ratio de contraste écrit à côté d'une valeur** ; la mesure revient à
      `design-check contrast`.
- [x] Chaque ID `B*`, `E*`, `C*` et `N*` de l'écran apparaît en § 9 avec sa manifestation
      visuelle.
- [x] `node "$FORGE/scripts/forge-guard.js" placeholders <anchor>` ne signale rien ici.
- [x] L'écran reste cohérent avec `.forge/design/design-system.md` : aucune variante de
      composant, aucune valeur et aucun mot d'état n'est inventé hors du design system.
