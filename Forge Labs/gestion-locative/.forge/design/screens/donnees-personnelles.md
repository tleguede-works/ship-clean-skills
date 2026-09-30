---
type: screen
slug: donnees-personnelles
title: Données personnelles
module: donnees-personnelles
status: draft
generated_at: 2026-09-30
derived_from:
  - .forge/prd.md
  - .forge/design/design-system.md
rule_ids: [B6, B7, B8, B9, B10, B11, B17, B18, C3, C6, C9, C11, N3, N4, N5, N6, N7, N8]
edge_case_ids: [E5, E6, E7, E10]
flow: portabilite
---

# Écran — Données personnelles

> Ce document est la **source de vérité** pour qu'une IA génère l'interface de cet écran.
> Il est généré depuis le gabarit, jamais recopié. Aucun `{{PLACEHOLDER}}` ne doit subsister.

---

## 1. Rôle de l'écran

| | |
|---|---|
| **Archétype d'app** | `mobile_field_ops` (principal), `rental_tenancy` (secondaire) |
| **Module** | `donnees-personnelles` — **hors barre principale**, accessible depuis `Plus` et depuis la fiche d'un dossier |
| **Route** | `/donnees-personnelles` |
| **Type** | page |
| **Utilisateurs** | Le propriétaire, seul utilisateur (C3) |
| **User stories servies** | — (portée par B9, B10, B11) |
| **Règles métier** | B6, B7, B8, B9, B10, B11, B17, B18, C3, C6, C9, C11, N3, N4, N5, N6, N7, N8 |
| **Edge cases** | E5, E6, E7, E10 |

**Une phrase** : cet écran montre, **pièce par pièce**, dans quel état de traitement se
trouve chaque catégorie de données d'un locataire — `effacer` · `anonymiser` · `conserver
jusqu'à une date de fin` — et **il ne contient aucun bouton pour les déclencher**.

**Pourquoi il est hors de la barre principale** : B10 dit que l'export est produit **à la
demande**, et une destination permanente dirait qu'on y va chercher quelque chose en
attendant. C'est aussi la seule façon d'éviter qu'un écran de conformité soit ouvert par
habitude : **il ne s'ouvre que lorsqu'un dossier part, un litige arrive, ou un locataire le
demande.**

**La forme de cet écran est la fonctionnalité** : il n'y a pas de bouton « tout effacer »,
parce que **B9 a trois états et B18 interdit de déclencher les trois d'un coup**. Ce qui
est affiché, ce n'est pas un formulaire de traitement : c'est **l'état de chaque catégorie**,
et chaque ligne se comporte comme une **fiche d'explication**. Une ligne ne se modifie pas,
elle **s'explique**. Le seul endroit où l'on agit, c'est quand le moment de l'action est
arrivé pour **une** catégorie.

---

## 2. Direction visuelle de cet écran

| | |
|---|---|
| **Mood** | opérationnelle, parlante, sans alarme |
| **Densité** | **normale** — lignes de 64 pt, une par catégorie de données, avec la date de fin. C'est l'écran le plus lent du produit à lire, et c'est voulu : c'est un écran qu'on ouvre une fois par dossier, pas dix fois par jour |
| **Niveau de contraste** | **fort** — une date de fin de conservation est une **contrainte de droit**, donc elle doit être lisible du premier coup |
| **Traitement photographique** | **thumbnail** pour l'illustration d'un export produit, et `AUCUN` pour le reste. Aucune photo de locataire, aucune photo de pièce d'identité : ce sont des documents, pas des images à regarder |
| **Référence** | la **page « vos données » d'un service public** — et, plus précisément, une **table de rétention** : une ligne par catégorie, un état par ligne, une date par ligne. Aucune de ces trois colonnes n'est un champ de formulaire |

**Les valeurs portées par cet écran**

| Rôle | Token | Valeur |
|---|---|---|
| Fond de l'application | `--color-background` | `#101319` |
| Surface des lignes d'état | `--color-surface` | `#171B22` |
| Creux : l'état `conserver` et l'aperçu d'export | `--color-surface-sunken` | `#0A0C10` |
| Barre d'action | `--color-surface-raised` | `#212630` |
| Encre de lecture, nom de la catégorie | `--color-texte-principal` | `#E8ECF3` |
| Encre secondaire, l'état et sa conséquence | `--color-texte-secondaire` | `#A6B0C0` |
| Encre tertiaire, la date de fin | `--color-texte-tertiaire` | `#8B95A5` |
| Ambre — `à décider`, date de fin inconnue | `--color-primaire-600` | `#E0A23A` |
| Sauge — `conservé jusqu'à une date écrite` | `--color-confirme-600` | `#7FB08C` |
| Terre cuite — `effaçable au départ`, action arrivée | `--color-alerte-600` | `#F09286` |

| | |
|---|---|
| **Surface** | `--color-surface` `#171B22` sur `--color-background` `#101319` |
| **Accent utilisé** | `--color-primaire-600` `#E0A23A` — **uniquement** sur la ligne dont la date de fin est inconnue. Cette teinte dit une chose très précise : *il manque une information de droit*. Elle n'est pas employée pour « Attention », elle est employée pour « incomplet » |

### 2.1 Anti-générique — obligatoire

- [x] **Pas de fond blanc pur `#FFFFFF`.** Fond `#101319`, choisi, justifié.
- [x] **Pas de carte ombrée pour tout.** Six lignes de 64 pt séparées par un filet de 1 px,
      **aucune n'a de fond propre, aucun rayon, aucune ombre**. La seule surface en creux est
      l'état `conserver` et l'aperçu d'export, qui portent une information plus longue que
      les autres.
- [x] **Pas d'uniformité.** Le nom de la catégorie est en 17 px 600, l'état en 17 px **600
      en teinte d'état**, la conséquence en 14 px, la date de fin en 14 px en **chasse
      fixe**. **L'état est donc en 600 et la date en chasse fixe**, et les deux sont
      visuellement distincts : l'un se lit, l'autre se compare.
- [x] **Pas de gris neutre générique.** `#8B95A5` ne porte que des dates. Les trois états
      ont chacun une teinte et **chacune avec une raison** : `effacer` en terre cuite
      parce que c'est une action qui arrive, `conserver` en sauge parce que c'est une
      protection en place, `à décider` en ambre parce qu'il manque une information de
      droit.
- [x] **Pas de mise en page centrée symétrique.** Lignes alignées à gauche, marges
      `--space-lg`, valeurs alignées à droite sur 128 pt.
- [x] **Pas d'illustration d'appoint générique.** Aucun cadenas dans un cercle, aucun
      bouclier, aucune icône RGPD. Les trois états sont **trois mots écrits**, et une icône
      ne dit pas `anonymiser`.
- [x] **Pas d'une seule famille de police.** `--font-chasse` pour les dates de fin, en
      alignement à droite, donc deux dates voisines se comparent d'un coup d'œil — ce qui est
      exactement le travail de cet écran.

**Choix assumé et non neutre** : **la colonne de gauche est une catégorie de données, pas
une catégorie de personnes.** `Coordonnées` · `Photos et journal de saisie` · `Jugements`
· `Bail et pièces comptables` · `Correspondance de gestion` · `Preuves d'envoi`. Un écran
RGPD générique affiche « Identité », « Usage », « Destinataires » — des catégories de
**traitement**, écrites du point de vue de l'application. Les nôtres sont écrites du point de
vue de **la pièce**, parce que ce sont les pièces qui se conservent ou s'effacent, et
parce qu'une catégorie de traitement n'a pas de date de fin : un traitement est
indéfini, une pièce ne l'est pas.

---

## 3. Anatomie

```
BandeauSynchronisation                                  PERMANENT
        │
        ▼
TitreÉcran  variante `avec_contexte`
├─ [titre] "Données de Karim Breguet"
├─ [retour] non — depuis « Plus » ou depuis la fiche d'un dossier
└─ [contexte] "logement au 4e · bail du 01/09/2024 · 4 état(x) en jeu"  --font-chasse
        │
        ▼
BandeauAlerte  variante `information`             PERSISTANT, tant que la date manque
└─ "Une durée légale de conservation n'est pas encore écrite dans Bailly.
    Tant qu'elle ne l'est pas, ce dossier ne peut pas être déclaré effaçable :
    Bailly ne suppose pas un délai."
        │
        ▼  --space-2xl
ListePlate  variante `liste`                       6 lignes de 64 pt
│
├─ LigneDonnée  état `effacer_arrive`
│   ├─ [intitule] "Coordonnées"                    --text-body-fort
│   ├─ [valeur]   "Effacer au départ du locataire" --color-alerte-600, 600
│   ├─ [consequence] "Adresses, téléphone, courriel. Elles servent à la gestion
│   │                 du bail et disparaissent avec lui."
│   └─ [action]   Bouton secondaire 52 pt  "Effacer"     ← SEUL bouton de l'écran
│                   actif seulement si le locataire est PARTI et l'action est arrivée
│
├─ LigneDonnée  état `effacer_arrive`
│   ├─ "Photos et journal de saisie"
│   ├─ "Effacer au départ du locataire"           --color-alerte-600
│   ├─ "Ce que tu as observé. Exportable avec le dossier, jamais effaçable
│   │   avant la fin de l'obligation légale."
│   └─ [action]   "Effacer"    52 pt
│
├─ LigneDonnée  état `jamais_exporte`
│   ├─ "Jugements"
│   ├─ "Ne sort d'aucun export"                    --color-texte-secondaire, 600
│   ├─ "Ce que tu en penses. C'est une opinion de travail, pas une donnée sur
│   │   la personne : effaçable, et jamais exporté — même par erreur de saisie."
│   └─ [action]   AUCUNE. Jamais. Pas de bouton, même inactif.
│
├─ LigneDonnée  état `conserver`   sur --color-surface-sunken
│   ├─ "Bail et pièces comptables"
│   ├─ "Conservé jusqu'à une date écrite"         --color-confirme-600, 600
│   ├─ "Bail, quittances, écritures de paiement. Ne s'effacent pas avant la
│   │   fin de l'obligation légale."
│   ├─ [derivation] "Fin de conservation : — date de fin à confirmer —"
│   └─ [action]   AUCUNE. Non effaçable, donc rien à déclencher.
│
├─ LigneDonnée  état `anonymiser`
│   ├─ "Correspondance de gestion"
│   ├─ "Anonymiser au départ du locataire"         --color-texte-secondaire, 600
│   ├─ "Ce qui a servi à décider mais n'identifie plus personne : le fait
│   │   reste, l'identifiant part. Deux dates distinctes du reste."
│   └─ [action]   "Anonymiser"   52 pt
│
└─ LigneDonnée  état `conserver`
    ├─ "Preuves d'envoi"
    ├─ "Conservé jusqu'à une date écrite"         --color-confirme-600
    └─ [action]   AUCUNE.
        │
        ▼  --space-2xl
BandeauAlerte  variante `impossible`              CONDITIONNEL, E10
└─ "Bailly n'a pas de bouton « tout effacer ».
    Les trois états ne tombent pas au même moment : un est arrivé,
    les deux autres attendent une date qui n'est pas encore écrite."
        │
        ▼  --space-lg
ListePlate  variante `groupee`
├─ [sur_titre] "CE QUI EST SORTI DE CE DOSSIER"
├─ LigneDonnée × n
│   ├─ "Export du dossier"   → "12/09 · 19 h 12"   Horodatage serveur, C11
│   └─ "Lecture"             → "Rectifié le 03/10"  trace de procédure
└─ LigneDonnée × 1  Vide variante `aucune_donnee`
     "Rien n'est sorti de ce dossier. Aucun export n'a été produit."
        │
        ▼  --space-3xl
BarreAction  variante `principale`
├─ [action_principale] Bouton lg "Produire l'export de ce dossier"  → /donnees-personnelles/export
└─ [hauteur_respiratoire] --space-3xl
```

| # | Composant | Rôle | Source |
|---|---|---|---|
| 1 | `BandeauSynchronisation` | Dire où en sont les écritures de l'écran (B6) | design-system § 3.1 |
| 2 | `TitreÉcran` | Nommer le locataire et son logement | design-system § 3.18 |
| 3 | `BandeauAlerte` | Dire que la durée légale n'est pas écrite — **persistant**, et `impossible` pour l'absence de bouton (B9, B18) | design-system § 3.24 |
| 4 | `ListePlate` | Contenir les six lignes d'état sans carte | design-system § 3.23 |
| 5 | `LigneDonnée` | Rendre une catégorie, son état, sa conséquence, et **le seul bouton qu'elle porte** | design-system § 3.22 |
| 6 | `Bouton` | Porter `Effacer` et `Anonymiser` — **jamais** un bouton global, **jamais** une variante destructive (B18) | design-system § 3.8 |
| 7 | `Horodatage` | Porter l'horodatage serveur d'un export produit (C11) | design-system § 3.21 |
| 8 | `Vide` | Écrire « rien n'est sorti de ce dossier » | design-system § 3.26 |
| 9 | `BarreAction` | Porter `Produire l'export de ce dossier` dans la portée du pouce | design-system § 3.16 |

---

## 4. États — tous, sans exception

| État | Déclencheur | Rendu | Feedback utilisateur |
|---|---|---|---|
| **Chargement** | Ouverture, lecture du dossier et de l'historique d'export | Les six lignes en ossature de 64 pt, et le `BandeauAlerte` de la date de fin **réservé en advance** : s'il apparaît après les lignes, la page saute et l'information la plus importante est celle qu'on voit arriver en dernier | Aucun texte d'attente. Le titre porte déjà le nom du locataire |
| **Rempli** | Le dossier existe | Les six lignes avec leur état, leur conséquence et leur date, plus l'historique de ce qui est sorti | Aucun. La page **est** le feedback |
| **Vide — jamais visité** | Un dossier est ouvert alors qu'il n'existe pas | `Vide` variante `erreur` : « Ce dossier n'existe pas. » **Ce n'est pas un vide, c'est une absence** | Aucun bouton `Réessayer`. Le seul geste est `Voir mes dossiers`, dans la barre d'action conservée. **La barre ne disparaît pas** |
| **Vide — aucune donnée** | Le dossier existe mais n'a **jamais produit d'export** | Les six lignes sont rendues en entier, et le bloc `CE QUI EST SORTI DE CE DOSSIER` rend `Vide` variante `aucune_donnee` : « Rien n'est sorti de ce dossier. Aucun export n'a été produit, et aucun n'a été demandé. » | Aucun bouton dans le vide. Le geste est `Produire l'export de ce dossier`, dans la barre d'action |
| **Erreur de chargement** | Le dossier est illisible localement | `Vide` variante `erreur` + `BandeauAlerte` en variante `impossible` : « Impossible de lire les données de ce dossier. Rien n'est affiché — et ce n'est pas vide : on ne sait pas encore. » | **Aucun bouton « Réessayer »** : la reprise est automatique. Le seul geste offert est un `BandeauAlerte` en variante `information` — « La lecture se fera seule dès que le réseau revient. » **Afficher les six lignes avec leur état par défaut serait la pire erreur de cet écran** : afficher « à effacer au départ » quand on ne sait pas si le locataire est parti, c'est afficher un fait qui n'existe pas |
| **Erreur de soumission** | `Effacer` ou `Anonymiser` est déclenché alors qu'une condition n'est pas remplie | Erreur **au dos de la ligne** : « Le locataire n'est pas encore parti : son départ n'est pas enregistré. Cette action n'est disponible qu'à ce moment-là. » **Aucun dialogue modal, aucune confirmation en deux temps** : l'action est déjà un acte rare et daté, un second dialogue serait un troisième écran | Le bouton de la ligne concernée passe en `impossible` avec l'aide. **Les cinq autres lignes ne bougent pas** |
| **Succès** | Une action d'état a été prise, ou un export a été produit | `MessageBref` variante `fait` : « Coordonnées **effacées sur cet appareil**. Pas encore confirmées. » La ligne passe en état `fait` et **le bouton disparaît** de cette ligne — **parce qu'une action faite ne se refait pas**, et un bouton encore là serait une invitation à refaire | Le `BandeauSynchronisation` bascule quand le serveur confirme. **Aucun bouton global ne change d'état**, parce qu'il n'y en a pas |
| **Hors-ligne / permissions** | Mode avion, sous-sol | Les six lignes s'affichent **entièrement** depuis l'appareil, avec leurs états et leurs dates. `Effacer` et `Anonymiser` restent **actifs** : ce sont des écritures locales, et B1 les protège comme les autres. `Produire l'export de ce dossier` reste **actif** aussi — l'export se compose localement | Le `BandeauSynchronisation` rend `hors_ligne`. **Aucun bouton de l'écran ne passe en `impossible` hors-ligne**, et c'est la différence avec la relance : un export n'exige pas de preuve d'envoi |
| **Lecture seule** | Écran verrouillé | Les six lignes sont rendues en lecture, **états et conséquences lisibles**, et les trois boutons de ligne passent en `impossible` avec l'aide « Déverrouille pour agir sur les données de ce dossier. » **Les boutons restent visibles** | La barre d'action rend `desactivee`, `Produire l'export de ce dossier` en `impossible`. **La barre ne disparaît pas** |

---

## 5. Interactions

| Élément | Événement | Comportement | Feedback visuel | État résultant | ID |
|---|---|---|---|---|---|
| `LigneDonnée`, tap | tap | Ouvre une `Feuille` d'**explication**, pas d'édition : pourquoi cette catégorie est dans cet état, ce qui la déclenche, quand, et si elle peut changer. **La feuille n'a aucun bouton d'action** — c'est une fiche | La feuille monte en 200 ms | Feuille d'explication | B9 |
| `LigneDonnée` « Jugements », tap | tap | La même feuille, et sa phrase est différente : « Tes appréciations ne sortent d'aucun export, jamais, même si tu les écris dans un champ de constaté. Ce n'est pas une règle d'écriture, c'est la façon dont la donnée est rangée. » | La feuille monte en 200 ms | Feuille d'explication | B7 |
| `Bouton secondaire "Effacer"` | tap | Exécute l'effacement de **cette seule catégorie**, journalise le fait, et passe la ligne en état `fait`. **Aucun dialogue de confirmation supplémentaire** : le bouton est déjà le geste, il est daté, et il est journalisé | La ligne change d'état en `--duration-fast`, le bouton disparaît de cette ligne | Catégorie effacée localement | B9 |
| `Bouton secondaire "Anonymiser"` | tap | Exécute l'anonymisation de **cette seule catégorie** : le fait reste, l'identifiant part. **L'anonymisation n'est pas un effacement déguisé** et la feuille le dit : « Le fait reste. C'est ce qui a servi à décider, et ce n'est plus relié à personne. » | Idem | Catégorie anonymisée localement | B9 |
| `Bouton secondaire "Effacer"`, conditions non réunies | tap | **Rien.** Le bouton est en variante `impossible`, son aide porte la raison, et le tap ne produit ni dialogue, ni toast, ni vibration | Aucun retour élastique | Aucune action | B9 |
| `Bouton lg "Produire l'export de ce dossier"` | tap | Ouvre `/donnees-personnelles/export`, avec le dossier pré-sélectionné. **Le dossier n'est jamais choisi à la main** : l'export porte le nom du locataire, donc le contexte vient d'ici | Aucun fondu | Formulaire d'export | B10, B11 |
| `BandeauAlerte` de la date de fin, appui long | appui long | Ouvre une `Feuille` d'explication : « Tant que la durée légale de conservation n'est pas écrite, Bailly ne peut pas dire quand ce document pourra être effacé. Il ne l'invente pas : une durée de conservation inventée est une infraction. » | La feuille monte en 200 ms | Explication de l'absence | B9, Q2 du PRD |
| `BandeauAlerte` « pas de bouton tout effacer » | appui long | Ouvre la même feuille d'explication, redite ici dans l'interface et non dans une note : « Les trois états ne tombent pas au même moment. Un est arrivé, les deux autres attendent une date qui n'est pas encore écrite. Aucun geste unique ne peut les déclencher tous les trois, donc il n'y a pas de bouton. » | La feuille monte en 200 ms | Explication de l'absence | B18, E10 |
| Bloc `CE QUI EST SORTI`, ligne `Export du dossier` | tap | Ouvre l'aperçu de l'export produit, en Markdown, avec son horodatage de production | Aucune animation d'ouverture | Aperçu de l'export | B11, C11 |
| Bloc `CE QUI EST SORTI`, ligne `Rectifié le` | tap | **Aucune action** : c'est une trace de procédure, pas un document. Elle dit qu'une rectification a eu lieu et quand | Aucun | — | C6 |
| `BarreOnglets`, retour vers `Plus` | tap | Revient au menu « Plus », qui conserve sa position | Aucun | Retour | — |
| Retour arrière | retour | Revient à l'écran précédent, dossier **non mémorisé** : c'est une question de vie privée, donc l'écran suivant n'a pas à savoir qui était consulté | Aucun | Retour | C6 |
| Défilement | scroll | Défilement natif, 16 pt de respiration sous la dernière ligne. **Pas de pull-to-refresh** : le même geste sert à revenir en arrière | Défilement natif | Inchangé | — |

- **Focus / clavier** : sept focusables — les six lignes de catégorie, plus le bouton
  d'export. `Origine` va à la **ligne dont la date de fin manque**, parce que c'est
  l'information incomplète et c'est donc la première chose à traiter. `Tab` parcourt les six
  lignes dans un ordre qui est **l'ordre de déclenchement** : ce qui est arrivé, ce qui
  attend une action, ce qui attend une date.
- **Gestes** : **aucun geste porteur.** Pas de swipe pour effacer, pas de swipe pour
  anonymiser, pas de long-press pour « tout faire ». **Une catégorie ne se balaie pas** :
  c'est une décision de droit datée, elle se prend avec le bouton et elle se journalise. Le
  glissement de `Feuille` ne fait que fermer.
- **Animations** : le changement d'état d'une ligne est en `--duration-fast`, et c'est la
  seule animation. **Un état qui glisse est un état qu'on a raté**, et un état raté est un
  état sur lequel on a cliqué par erreur. `prefers-reduced-motion` met tout à 0 ms.
- **Retour arrière** : **ne mémorise pas le dossier consulté.** Un écran qui se souvient de
  la dernière personne consultée affiche son nom à quelqu'un d'autre au prochain
  déverrouillage, et ce n'est pas une donnée qu'on a le droit d'exposer ainsi.

---

## 6. Responsive

| Breakpoint | Comportement | Ce qui se replie / disparaît |
|---|---|---|
| **Mobile** (0–479 px) | Le layout de référence. Lignes de 64 pt, nom de catégorie et état sur la **première ligne**, conséquence sur les deux suivantes, date de fin alignée à droite sur 128 pt, barre d'action de 88 pt | Sous 360 pt de large, la conséquence passe sur **quatre lignes** et la ligne passe de 64 à 88 pt. **La conséquence n'est jamais tronquée** : c'est la phrase qui dit ce qui arrive à la donnée, donc c'est la partie la plus importante de la ligne |
| **Tablet** (480–899 px) | Deux colonnes : les six lignes d'état à gauche sur 420 pt, les deux `BandeauAlerte` et le bloc « ce qui est sorti » à droite. Le menu « Plus » devient un rail vertical de 88 pt | Le bloc « ce qui est sorti » passe à droite : c'est une **trace**, donc elle se consulte moins souvent qu'un état |
| **Desktop** (900 px et au-delà) | **Aucun rendu distinct.** Colonne centrée de 720 pt, navigation en bas. X11 exclut la version navigateur de bureau | Rien |

- **Cible tactile** : **64 pt par ligne**, 52 pt pour les trois boutons de ligne et le bouton
  d'export, 44 pt pour le retour. La zone pressable d'une ligne **inclut son bouton** : on
  tape sur la ligne pour l'expliquer, sur le bouton pour agir, et les deux zones sont
  distinguées par la position, pas par la taille.
- **Débordement** : (1) La date de fin ne déborde jamais : largeur de 128 pt en chasse
      fixe, et à ×1,3 le format passe de `JJ/MM/AAAA` à `JJ/MM/AAAA` **inchangé** — c'est
      une date, pas un nombre, et elle ne s'abrège pas. (2) La conséquence passe sur plus de
      lignes plutôt que d'être tronquée. (3) Le nom du locataire dans le titre passe sur
      **deux lignes** sous 360 pt, jamais abrégé à une initiale : un dossier sans nom complet
      est un dossier qu'on peut confondre avec un autre.
- **Ce qui ne déborde jamais** : le `BandeauAlerte` « pas de bouton tout effacer ». C'est la
      seule phrase de l'écran qui répond à la demande la plus dangereuse, donc elle est
      lisible en entier à toutes les largeurs.

---

## 7. Accessibilité

- [ ] **Contraste du texte courant** — mesuré par `design-check contrast`, qui applique
      4,5:1 à chaque encre contre les huit surfaces de son `on:`, dont
      `--color-surface-sunken` (l'état `conserver` et l'aperçu d'export) et
      `--color-surface-raised` (la barre d'action). **Aucun ratio n'est écrit ici.**
- [ ] **Contraste des grands textes** — il n'y a pas de grand texte sur cet écran. Les
      états sont en `--text-body-fort` 17 px 600, donc mesurés à 4,5:1. **Un état de
      traitement de données lu de travers est un état appliqué à la mauvaise catégorie**, et
      une catégorie mal traitée est une infraction — donc ces mots n'utilisent pas
      l'exception des grands caractères.
- [ ] **Navigation clavier complète** — sur clavier externe et sur tous les breakpoints.
      `Origine` va à la ligne dont la date de fin manque. `Tab` parcourt les six lignes dans
      l'ordre de déclenchement. Les trois boutons de ligne sont focusables **même quand ils
      sont `impossible`**, avec `aria-disabled="true"` : un bouton désactivé qu'on ne peut pas
      atteindre ne peut pas être lu, donc on ne sait pas pourquoi il ne marche pas — et ici
      la raison est une **contrainte de droit**, qu'il faut pouvoir lire.
- [ ] **Focus visible** — anneau `--color-bordure-focus` de 2 px avec 2 px de fond entre
      l'anneau et la ligne. **La teinte d'état ne change pas au focus** : elle porte
      l'information, pas la position.
- [ ] **ARIA** — les six lignes sont une `role="list"` de `role="listitem"`, chacune portant
      un `aria-label` composé : « Bail et pièces comptables, conservé jusqu'à une date écrite,
      fin de conservation non renseignée. » **L'état ET la date de fin sont dans le nom
      accessible**, parce qu'un utilisateur de technologies d'assistance ne peut pas les
      déduire d'une teinte. Le `BandeauAlerte` de la date manquante est un `role="status"` :
      il est annoncé une fois, et il **persiste** tant qu'il est vrai, donc il ne clignote
      pas dans un `aria-live`.
- [ ] **Alternative textuelle** — **aucune image sur cet écran**, hormis l'illustration
      optionnelle d'un export produit, dont l'`alt` décrit **l'état et non l'image** :
      « Export du dossier produit le 12 septembre à 19 h 12, lisible sans Bailly. » Aucune
      pièce d'identité n'est affichée et **aucun document n'est rendu en image** : c'est un
      dossier, pas une galerie.
- [ ] **Langue et direction de lecture** — `lang="fr-FR"`, gauche à droite, dates
      `JJ/MM/AAAA` en chasse fixe alignées à droite. **Les trois états sont écrits en toutes
      lettres** : `Effacer` · `Anonymiser` · `Conservé`, parce qu'un cadenas ou une poubelle
      ne se dit pas au téléphone, et que ce sont des décisions de droit.

---

## 8. Données

| Champ | Type | Origine | Requis | Erreur possible |
|---|---|---|---|---|
| `categories` | liste de 6 catégories de **pièces** | dérivée du schéma, **jamais choisie par le propriétaire** | oui | Une catégorie inconnue : elle n'est pas affichée, et l'écran ne l'invente pas |
| `etat_traitement` | `effacer` / `anonymiser` / `conserver` **par catégorie** | **propriété du schéma**, jamais d'un bouton global | oui | Deux catégories dans le même état : c'est **normal**, et c'est pourquoi il n'y a pas de bouton global |
| `declencheur` | `depart_locataire` / `date_de_fin_ecolée` / `—` | dérivée | oui | Déclencheur absent : la ligne est rendue, et l'absence **est** l'information |
| `date_fin_conservation` | date, **vide tant que Q2 du PRD n'est pas tranchée** | **non renseignable** par l'écran | **non, et c'est le sujet** | Champ `inconnu` : un tiret et la phrase « Tant que cette date n'est pas écrite, Bailly ne peut pas dire quand ce document pourra être effacé. » **Jamais une durée inventée** |
| `jugements` | liste de textes `apprecie` | local | non | Elle n'est **jamais** exportée, jamais demandée, et **jamais affichée en clair sur cet écran** : l'écran montre qu'il y en a, pas ce qu'ils disent |
| `historique_actions` | liste d'actions **append-only** | local, horodatée | oui | Une action à trous : la liste se rend telle quelle, sans reconstruction |
| `exports` | liste d'exports produits, avec horodatage **serveur** | local (C11) | non | Jamais produit : le bloc rend `Vide` avec la phrase « Rien n'est sorti de ce dossier. » |
| `procedures` | liste de rectifications demandées et traitées | local, **conservée au titre de l'obligation légale** (C6) | non | — |
| `locataire_parti` | booléen | saisie explicitement par le propriétaire | oui | Faux : les boutons `Effacer` et `Anonymiser` sont `impossible` avec la raison. **Bailly ne déduit pas un départ d'une absence de contact** |
| `etat_envoi` | `a_envoyer` / `rien_a_confirmer` | local d'abord (C2) | oui | Échec : aucun bouton « Réessayer » |

- **Chargement** : tout d'un bloc, **sans pagination**. Six lignes et un historique d'export
  court.
- **Cache / hors-ligne** : l'écran s'affiche **entièrement** hors-ligne (N2, C9), et **tous
  ses boutons restent actifs** — `Effacer`, `Anonymiser` et `Produire l'export` compris.
  C'est la différence avec l'encaissement : **aucune action RGPD n'exige de preuve
  d'envoi**, donc aucune n'est refusée hors-ligne. L'export se compose localement et part
  quand le réseau revient.
- **Données sensibles** : cet écran **est** l'écran des données personnelles (C6). Il
  n'affiche **aucun texte d'appréciation** — seulement le fait qu'il y en a. Il **ne
  mémorise pas** le dossier consulté au retour arrière. Il **n'envoie rien à un tiers**
  (N8) et n'appelle aucun service tiers, pas de crash reporter, pas d'analytics, pas de CDN
  qui journalise : l'hébergeur voit déjà les données, et ajouter un tiers n'est pas un
  choix neutre. Les traces d'export et de rectification sont **conservées** au titre de
  l'obligation légale, donc **non effaçables** — c'est cohérent avec le fait qu'un export
  est, par construction, une copie.

---

## 9. Traçabilité

| ID | Origine | Manifestation sur cet écran |
|---|---|---|
| **B6** | PRD | Le `BandeauSynchronisation` est présent et ne se masque pas. Une action d'état y est une écriture locale comme une autre, donc elle a le même bandeau |
| **B7** | PRD | La ligne `Jugements` porte l'état `Ne sort d'aucun export`, et **son texte n'est jamais affiché sur cet écran**. La feuille d'explication dit pourquoi : ce n'est pas une règle d'écriture, c'est la façon dont la donnée est rangée. **C'est la seule ligne de l'écran sans bouton, jamais** |
| **B8** | PRD | Cet écran n'a **aucun** champ de texte libre : c'est une table d'états, pas un formulaire. La classe a été demandée à l'écriture, dans les autres écrans, donc il n'y a rien à demander ici |
| **B9** | PRD | **Les trois états sont affichés, un par ligne, chacun avec sa conséquence et son déclencheur.** Le `BandeauAlerte` persistant dit que la durée légale n'est pas encore écrite, et **le champ est vide avec un tiret** — jamais une date inventée. Une durée de conservation inventée serait une infraction |
| **B10** | PRD | L'export est **produit à la demande**, depuis la barre d'action, avec le dossier déjà sélectionné. Il n'y a rien à réclamer et rien à attendre |
| **B11** | PRD | L'aperçu d'un export produit est en **Markdown lisible**, et la ligne d'export porte son horodatage. Bailly n'a pas de format propriétaire |
| **B17** | PRD | Le nom du locataire vient du bail, affiché en toutes lettres. **Le retour arrière ne mémorise pas le dossier consulté** : un écran qui s'en souvient affiche son nom à quelqu'un d'autre |
| **B18** | PRD | **Il n'y a aucun bouton global, dans aucune variante.** Le `BandeauAlerte` « pas de bouton tout effacer » est **dans l'interface et non dans une note**, et sa feuille d'explication dit pourquoi : les trois états ne tombent pas au même moment, donc aucun geste unique ne peut les déclencher tous |
| **C3** | PRD | Aucun écran d'administration, aucun sélecteur d'utilisateur, aucun rôle. Le dossier consulté est un dossier, pas un compte |
| **C6** | PRD | Le droit d'accès porte sur le **dossier du locataire**, donc l'écran est par dossier. Les traces d'export et de rectification sont conservées au titre de l'obligation légale. Le bloc `Jugements` n'affiche **aucun texte**, seulement le fait qu'il y en a |
| **C9** | PRD | Hors-ligne, **tous les boutons restent actifs** : aucune action RGPD n'exige de preuve d'envoi. C'est la différence avec l'encaissement, et c'est écrite dans le design |
| **C11** | PRD | Chaque export produit porte son **horodatage de production, celui du serveur**, affiché en `JJ/MM · HH h mm` complet. L'application le dit, et ne l'affiche jamais abrégé |
| **N3** | PRD | 64 pt par ligne, 52 pt pour les trois boutons de ligne et le bouton d'export |
| **N4** | PRD | Corps à 17 px, conséquences en 14 px, dates en 14 px en chasse fixe. Aucun texte sous 14 px |
| **N5** | PRD | Tailles en `rem` suivant le réglage du téléphone, plafonné à ×1,3 : les conséquences passent sur plus de lignes et les lignes s'allongent, **sans jamais tronquer une conséquence**, parce que c'est la phrase qui dit ce qui arrive à la donnée |
| **N6** | PRD | L'export complet des 14 dossiers est produit en moins d'une minute ; cet écran **n'en produit qu'un** et renvoie à l'écran d'export pour les trois formes |
| **N7** | PRD | Les traces d'export sont conservées **localement**, donc elles meurent avec l'appareil si celui-ci est volé. L'écran ne prétend pas le contraire : c'est pourquoi l'export est rejouable sans le logiciel (B11) |
| **N8** | PRD | Aucun analytics, aucun crash reporter tiers, aucun CDN qui journalise. L'écran ne déclenche aucun appel sortant autre que la production d'un export |
| **E5** | PRD | Un locataire part et demande ses données : l'export est produit **à la demande**, lisible, daté, au nom de la personne, et ne contient **que du constaté**. Le bail et les pièces comptables restent **conservés** jusqu'à leur date de fin — et cette date est **vide et le dit**, parce que Q2 du PRD n'est pas tranchée |
| **E6** | PRD | Aucun champ de texte libre ici, donc rien à classer. La frontière constaté / apprécié est **déjà** posée à l'écriture, dans les écrans de saisie |
| **E7** | PRD | Les jugements **ne sont pas exportables, même par erreur de saisie** : c'est une propriété du schéma, et cet écran est l'endroit où elle est rendue visible à son propriétaire |
| **E10** | PRD | « Supprimer un dossier pour faire le ménage » : **il n'y a pas de bouton**, et l'écran le dit, et sa feuille d'explication dit pourquoi. Ce n'est pas un oubli d'implémentation, c'est la forme de l'écran |

---

## 10. Checklist de gate

- [x] Les 9 états sont décrits avec un rendu concret et des **libellés écrits** — y compris
      la raison pour laquelle les boutons d'une ligne sont indisponibles.
- [x] **Aucun bouton « tout effacer »**, dans aucune variante, et l'absence est **écrite dans
      l'interface** avec sa raison.
- [x] **La ligne `Jugements` n'a aucun bouton, même inactif.** Pas d'effacement, pas
      d'« anonymiser », pas de case à cocher : c'est une opinion de travail, et elle n'est
      pas une donnée personnelle.
- [x] La durée de conservation est **vide et le dit** — aucun jour, aucun mois, aucune
      durée inventée. Le champ est en état `inconnu` avec un tiret.
- [x] Hors-ligne, **tous les boutons restent actifs** : aucune action RGPD n'exige de preuve
      d'envoi, et c'est la différence avec l'encaissement.
- [x] Aucun « Réessayer ».
- [x] Chaque élément interactif a un comportement, un feedback et un état résultant.
- [x] Le responsive est défini aux trois breakpoints, avec la règle « la conséquence
      s'allonge plutôt que d'être tronquée » explicite.
- [x] La section Anti-générique est cochée et justifiée avec les valeurs réelles.
- [x] Aucune valeur de design n'est laissée à « à définir ».
- [x] **Aucun ratio de contraste écrit à côté d'une valeur.**
- [x] Chaque ID `B*`, `E*`, `C*` et `N*` de l'écran apparaît en § 9.
- [x] `node "$FORGE/scripts/forge-guard.js" placeholders <anchor>` ne signale rien ici.
- [x] L'écran reste cohérent avec `.forge/design/design-system.md` : les trois états sont des
      **états de lignes**, pas des boutons, et c'est la seule façon de rendre B9 exécutable.
