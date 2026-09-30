---
type: screen
slug: fait-detail
title: Fiche d'un fait
module: saisir
status: draft
generated_at: 2026-09-30
derived_from:
  - .forge/prd.md
  - .forge/design/design-system.md
rule_ids: [B1, B2, B4, B7, B8, B10, B11, B16, B17, C2, C6, C8, C9, N1, N3, N4, N5]
edge_case_ids: [E1, E2, E5, E6, E7, E12]
flow: boucle-quotidienne
---

# Écran — Fiche d'un fait

> Ce document est la **source de vérité** pour qu'une IA génère l'interface de cet écran.
> Il est généré depuis le gabarit, jamais recopié. Aucun `{{PLACEHOLDER}}` ne doit subsister.

---

## 1. Rôle de l'écran

| | |
|---|---|
| **Archétype d'app** | `mobile_field_ops` (principal) |
| **Module** | `saisir` — rang 2, sous-écran |
| **Route** | `/faits/:faitId` |
| **Type** | page |
| **Utilisateurs** | Le propriétaire, seul utilisateur (C3) |
| **User stories servies** | US-1, US-2 |
| **Règles métier** | B1, B2, B4, B7, B8, B10, B11, B16, B17, C2, C6, C8, C9, N1, N3, N4, N5 |
| **Edge cases** | E1, E2, E5, E6, E7, E12 |

**Une phrase** : cet écran permet au propriétaire de relire, corriger et **dater** un fait,
et de voir — en un seul endroit — **où il en est**, ce qu'il a écrit, et où ça part.

**Pourquoi il est au rang 2 de la navigation** : c'est la lecture de l'objet que la boucle
quotidienne produit. US-1 dit que le propriétaire veut « que l'historique d'un appartement
existe à la fin de l'année, et pas seulement dans ma mémoire » : **cette fiche, c'est
l'historique**. Elle est donc consultée en relisant, souvent longtemps après l'écriture.

**Ce que cette fiche est aussi** : le seul endroit du produit où la **classe** d'un fait est
visible en permanence, et où elle est **expliquée**. `Ce que j'ai observé · Part dans
l'export du dossier` et `Ce que j'en pense · Ne sortira jamais d'un export`. C'est ce qui
permet au propriétaire de se souvenir de la règle six mois plus tard, au moment où il
relit.

---

## 2. Direction visuelle de cet écran

| | |
|---|---|
| **Mood** | opérationnelle, parlante, sans alarme |
| **Densité** | **normale** — la fiche est lue, pas balayée. Lignes de 44 pt, vignettes de 72 pt, et le bloc de classe en 72 pt parce qu'il porte deux lignes |
| **Niveau de contraste** | **fort** — la date et l'état d'envoi sont lus avant le texte, donc ils doivent être les plus nets |
| **Traitement photographique** | `thumbnail` en rangée, et **plein écran** à l'ouverture. Une photo de fait est une **preuve**, donc aucun filtre, aucun recadrage, aucune compression agressive |
| **Référence** | la fiche d'un constat sur un bon de travaux papier : date, auteur, description, photos, et la mention de ce qui part où |

**Les valeurs portées par cet écran**

| Rôle | Token | Valeur |
|---|---|---|
| Fond de l'application | `--color-background` | `#101319` |
| Surface de la fiche | `--color-surface` | `#171B22` |
| Creux : bloc d'appréciation, champ de modification | `--color-surface-sunken` | `#0A0C10` |
| Barre d'action | `--color-surface-raised` | `#212630` |
| Encre de lecture | `--color-texte-principal` | `#E8ECF3` |
| Encre du texte apprécié | `--color-texte-secondaire` | `#A6B0C0` |
| Encre tertiaire, horodatage | `--color-texte-tertiaire` | `#8B95A5` |
| Ambre — « sur cet appareil » | `--color-primaire-600` | `#E0A23A` |
| Sauge — « confirmé par le serveur », ce qui sort en export | `--color-confirme-600` | `#7FB08C` |
| Terre cuite — storage plein | `--color-alerte-600` | `#F09286` |

| | |
|---|---|
| **Surface** | `--color-surface` `#171B22` sur `--color-background` `#101319` |
| **Accent utilisé** | `--color-primaire-600` `#E0A23A` et `--color-confirme-600` `#7FB08C` — les deux seuls accents, et ils correspondent aux deux seuls états possibles du fait. **La couleur de cet écran est l'état d'envoi** |

### 2.1 Anti-générique — obligatoire

- [x] **Pas de fond blanc pur `#FFFFFF`.** Fond `#101319`, choisi, justifié.
- [x] **Pas de carte ombrée pour tout.** Deux blocs : identité et classe d'un côté, photos
      de l'autre. Aucun n'a de fond propre, sauf **le texte d'appréciation**, qui est sur
      `--color-surface-sunken` avec un retrait de `--space-lg` — et ce n'est pas une carte,
      c'est un **bloc en retrait** qui dit « ceci n'est pas de la même nature que ce qui est
      au-dessus ».
- [x] **Pas d'uniformité.** Le texte du fait est en `--text-body` 17 px 400 ; le préfixe
      `Mon appréciation :` est en 17 px **600** ; la date est en 14 px en chasse fixe ; le
      bloc de classe est en 13 px 600 interlettré. Un fait constaté est un texte nu ; un
      fait apprécié est **un retrait, un fond creusé, un préfixe en gras et une couleur
      d'encre différente** : quatre différences, dont **aucune n'est la couleur seule**.
- [x] **Pas de gris neutre générique.** `#8B95A5` est le cran bas et il ne porte que des
      horodatages. Le texte apprécié est en `#A6B0C0` et le constaté en `#E8ECF3` : deux
      valeurs de la même rampe, ce qui est une **hiérarchie**, pas une teintage.
- [x] **Pas de mise en page centrée symétrique.** Fiche alignée à gauche, pleine largeur.
- [x] **Pas d'illustration d'appoint générique.** Aucune icône d'image dans un cadre vide ;
      un fichier illisible porte l'état `illisible` et reste compté.
- [x] **Pas d'une seule famille de police.** `--font-chasse` pour les deux horodatages
      distincts — prise et confirmation — alignés sur une même colonne de 88 pt.

**Choix assumé et non neutre** : **les deux horodatages sont affichés côte à côte, toujours,
même quand ils sont identiques.** « Écrit sur cet appareil · 12/09 · 18 h 04 » à gauche,
« Confirmé par le serveur · 12/09 · 18 h 11 » à droite. Quand le second est absent, sa
colonne porte la place réservée et le mot `Pas encore confirmé` — **pas un tiret**. La
place vide d'un timestamp est un fait : elle dit que le serveur n'a rien confirmé, et c'est
la moitié de B1.

---

## 3. Anatomie

```
TitreÉcran  variante `feuille`
├─ [retour] Bouton 44 pt
├─ [titre] "Fait du 12 septembre"
└─ [etat_ecriture] "Pas encore envoyé" en ambre, écrit
        │
        ▼
ListePlate  variante `groupee`
├─ [sur_titre] "CE QUE J'AI OBSERVÉ"  OU  "CE QUE J'EN PENSE"
├─ LigneDonnée × 2
│   ├─ "Dossier"   → "Courges, 3e"
│   └─ "Quand"     → "12/09/2026 · 18 h 04"   prise, horloge de l'appareil
├─ LigneDonnée  (Horodatage, variante `source`, DEUX colonnes)
│   ├─ "Sur cet appareil"      12/09 · 18 h 04
│   └─ "Confirmé par le serveur" 12/09 · 18 h 11   ou "Pas encore confirmé"
│
├─ BLOC DE CLASSE, 72 pt, filet gauche 3 px
│   ├─ "Ce que j'ai observé"
│   ├─ [consequence] "Part dans l'export du dossier."   en --color-confirme-600
│   └─ OU
│   ├─ "Ce que j'en pense"
│   └─ [consequence] "Ne sortira jamais d'un export."   en --color-texte-secondaire
│
├─ [sur_titre] "LE TEXTE"
├─ ZoneTexte variante `lecture`  (ou `avec_classe` en modification)
│   ├─ constate : nu, en --color-texte-principal
│   └─ apprecie : retrait --space-lg, fond --color-surface-sunken,
│                 préfixe écrit "Mon appréciation :", texte en --color-texte-secondaire
│
├─ [sur_titre] "LES PHOTOS · 3"
├─ ListePlate  variante `liste`
│   └─ VignettePhoto × n   72 × 72 pt, état d'envoi, deux horodatages
├─ Bouton secondaire "Ajouter une photo"   → /faits/:faitId/photos
│
└─ [sur_titre] "CE QUE CE FAIT PRODUIT"     CONDITIONNEL
    └─ LigneDonnée × n
         ├─ "Exporté le"  → "30/09 · 19 h 12"   (B10, C11)
         └─ "Rectifié le"  → "—" ou la date
        │
        ▼  --space-3xl
BarreAction  variante `secondaire`
├─ [action_principale] Bouton lg "Corriger"     (état `modifie` si en cours)
└─ [action_secondaire] Bouton md "Voir le dossier"
```

| # | Composant | Rôle | Source |
|---|---|---|---|
| 1 | `TitreÉcran` | Nommer le fait et porter le mot d'état d'écriture | design-system § 3.18 |
| 2 | `ListePlate` | Contenir les blocs sans carte | design-system § 3.23 |
| 3 | `LigneDonnée` | Rendre dossier, date, horodatages et traçabilité | design-system § 3.22 |
| 4 | `Horodatage` | Afficher **deux horodatages distingués** : prise et confirmation | design-system § 3.21 |
| 5 | `ZoneTexte` | Afficher le texte, et le modifier **dans sa classe d'origine** | design-system § 3.10 |
| 6 | `GroupeSegmenté` | Porter la classe et sa conséquence, en lecture ou en modification | design-system § 3.13 |
| 7 | `VignettePhoto` | Montrer chaque pièce jointe et dire où elle en est | design-system § 3.27 |
| 8 | `Bouton` | Porter `Corriger`, `Ajouter une photo`, `Voir le dossier` | design-system § 3.8 |
| 9 | `BandeauSynchronisation` | Dire où en est l'écriture de ce fait | design-system § 3.1 |
| 10 | `MessageBref` | Confirmer une correction, ou refuser | design-system § 3.25 |
| 11 | `BarreAction` | Porter `Corriger` dans la portée du pouce | design-system § 3.16 |

---

## 4. États — tous, sans exception

| État | Déclencheur | Rendu | Feedback utilisateur |
|---|---|---|---|
| **Chargement** | Ouverture, lecture du fait local | Les sept lignes en ossature, à leur hauteur exacte — 44 pt pour l'identité, 72 pt pour le bloc de classe, 72 pt pour la vignette. **Le bloc de classe garde sa place** : un texte qui passe de nu à en retrait fait sauter toute la fiche | Aucun texte d'attente. Le titre porte déjà le fait, donc l'écran n'est pas vide |
| **Rempli** | Le fait existe | La fiche entière, avec la classe visible et expliquée, les deux horodatages côte à côte, et les photos | Aucun. La fiche **est** le feedback |
| **Vide — jamais visité** | Route ouverte pour un fait qui n'existe pas | `Vide` variante `erreur` : « Ce fait n'existe pas. Il a peut-être été écrit sur un appareil qui n'a plus ces données. » **Ce n'est pas un vide, c'est une absence, et le libellé le dit** | Aucun bouton `Réessayer`. Le seul geste est `Saisir un fait`, dans la barre d'action conservée : **la barre ne disparaît pas** |
| **Vide — aucune donnée** | Le fait existe, mais n'a **aucune photo** | La fiche est rendue en entier, et le bloc photos rend `Vide` variante `aucune_donnee` : « Aucune photo. Un fait sans photo se conteste difficilement six mois plus tard. » + `Bouton secondaire` `Ajouter une photo` | Aucun bouton dans le vide de photos. Le geste est le bouton juste en dessous |
| **Erreur de chargement** | Le fait local est illisible | `Vide` variante `erreur` + `BandeauAlerte` en variante `impossible` : « Impossible de lire ce fait. Rien n'est affiché — et ce n'est pas vide : on ne sait pas encore. » | Aucun bouton « Réessayer ». Un `BandeauAlerte` en variante `information` : « La lecture se fera seule dès que le réseau revient. » **Afficher une fiche partielle serait pire qu'une fiche absente** : elle laisserait croire que le fait est complet |
| **Erreur de soumission** | Correction : le texte est vidé, ou la classe a été changée sans l'être explicitement | Erreur **au champ**. Le `GroupeSegmenté` passe en `requis_non_choisi` et le bouton `Corriger` bascule en `impossible` avec l'aide « Choisis la classe avant d'enregistrer. » **Le texte déjà saisi est conservé** | Aucun dialogue modal, aucun déplacement du focus. Une fiche qui saute pendant qu'on la relit est une fiche qui perd le mot qu'on cherchait |
| **Succès** | Le fait est écrit ou corrigé localement | `MessageBref` variante `fait` : « Fait **sur cet appareil**. Pas encore confirmé. » ou, en correction : « Correction **sur cet appareil**. Pas encore confirmée. » **Le mot `Synchronisé` n'apparaît qu'après confirmation serveur** | La ligne du bloc classe se met à jour immédiatement si la classe a changé, et le mot d'état du titre passe à `a_envoyer` |
| **Hors-ligne / permissions** | Mode avion, sous-sol | La fiche s'affiche **entièrement** depuis l'appareil. `Corriger` reste **actif** : une écriture locale non confirmée est modifiable (B4), et c'est le cas le plus fréquent sur cette fiche. La barre d'action reste en variante `secondaire` | Un `BandeauAlerte` en variante `information` : « Hors-ligne. Ce fait est sur cet appareil ; sa correction partira avec le reste. » |
| **Lecture seule** | Écran verrouillé, **ou fait confirmé par le serveur** | La fiche est rendue en entier, en lecture. Le bouton `Corriger` passe en `impossible` avec l'aide : « Ce fait est confirmé par le serveur. Pour le corriger, demande la rectification du dossier — le demandeur aura la trace. » **Le bouton ne disparaît pas** : il explique pourquoi il ne peut pas, et l'explication est la procédure elle-même | La barre d'action reste présente. **La seule action qui disparaît est l'écriture, jamais la barre ni la lecture** |

---

## 5. Interactions

| Élément | Événement | Comportement | Feedback visuel | État résultant | ID |
|---|---|---|---|---|---|
| `Bouton lg "Corriger"` | tap | Ouvre la `Feuille` de modification, dans la **classe d'origine** du fait. Un fait `constate` se modifie dans un champ de constaté, un fait `apprecie` dans un champ d'appréciation. **Changer de classe est impossible ici** : c'est une opération distincte, et elle demande une raison | La feuille monte en 200 ms | Édition, champ pré-rempli | B7, B8 |
| `Feuille` de modification, tentative de changer de classe | — | **Aucun segment de classe n'est rendu en modification.** Changer la classe d'un fait existant demanderait de réécrire ce qui a été constaté, et c'est un jugement que seul le propriétaire peut porter — mais pas en corrigeant une faute de frappe. La classe ne se change que par le retrait d'un constat remplacé, qui est un **fait nouveau** | Aucun contrôle de changement de classe | Classe inchangée | B7, B8 |
| `Bouton lg "Corriger"`, puis enregistrement | tap | La correction est **elle-même une écriture** : le mot d'état passe à `modifie` puis `a_envoyer`, et les deux horodatages affichent la nouvelle prise. L'ancien texte est conservé dans l'historique append-only, jamais écrasé | `MessageBref` variante `info` : « Correction **sur cet appareil**. Pas encore confirmée. » | Fait local modifié | B4 |
| `Bouton secondaire "Ajouter une photo"` | tap | Ouvre `/faits/:faitId/photos`. Le fichier est écrit localement **avant** toute tentative réseau (B3) | La feuille de photos s'ouvre | Photos locales, `a_confirmer` | B3, C8 |
| `VignettePhoto`, tap | tap | Ouvre l'aperçu plein écran avec les deux horodatages en grand | Aucun fondu | Aperçu | C8 |
| `VignettePhoto`, appui long | appui long | Ouvre la `Feuille` de la photo : horodatages, taille, `Reprendre la photo`. **Aucune action d'effacement** (B18) | La feuille monte en 200 ms | Feuille de photo | B18 |
| Bloc de classe, appui long | appui long | Ouvre la `FeuilleClasse` en variante `rappel` : les trois mots du vocabulaire de B2, pour que le propriétaire puisse relire la règle en relisant son fait | La feuille monte en 200 ms | Rappel du vocabulaire | B2 |
| Bloc « ce que ce fait produit », ligne `Exporté le` | tap | Aucune action : la ligne est **une trace, pas un bouton**. Elle dit quand le dossier a été exporté et où, parce que C11 impose que l'export porte son horodatage et que l'application le dise | Aucun | — | B10, C11 |
| `Bouton md "Voir le dossier"` | tap | Ouvre `/dossiers/:dossierId`, à la section des faits | Aucun fondu | Fiche du dossier | US-1 |
| Retour arrière | retour | Conserve toute correction non enregistrée et la rend visible par le mot d'état | Aucun | Saisie conservée | E11 |
| Confirmation serveur reçue pendant que la fiche est ouverte | réception | La colonne « Confirmé par le serveur » se remplit **sans animation au-delà de 120 ms** et le mot d'état du titre passe à `rien_a_confirmer`. **Aucun message bref, aucune notification** : l'état est visible, donc il n'a pas besoin d'être annoncé (X10) | Remplissage de la colonne, mot d'état changé | `rien_a_confirmer` | B6 |

- **Focus / clavier** : sept focusables — les deux horodatages, le bloc de classe, le texte,
  chaque vignette, les trois boutons. `Origine` va au bloc de classe, parce que c'est
  l'information la moins prévisible d'une relecture. L'anneau de focus est externe au bloc
  de classe et ne se confond pas avec son filet gauche de 3 px.
- **Gestes** : **aucun geste porteur.** Pas de swipe pour supprimer un fait, pas de
  long-press pour archiver, pas de pull-to-refresh. Un fait est un historique, et un
  historique ne se balaie pas. Le glissement de `Feuille` ne fait que fermer.
- **Animations** : **le remplissage de la colonne de confirmation est en `--duration-fast`**
  et rien d'autre n'est animé. Un fait qui glisse à l'écran pendant qu'on le relit est un
  fait qu'on relit mal. `prefers-reduced-motion` met tout à 0 ms.
- **Retour arrière** : conserve la correction non enregistrée, ne demande rien.

---

## 6. Responsive

| Breakpoint | Comportement | Ce qui se replie / disparaît |
|---|---|---|
| **Mobile** (0–479 px) | Le layout de référence. Fiche alignée à gauche, deux horodatages en **deux lignes** — « Sur cet appareil » puis sa valeur, puis « Confirmé par le serveur » puis sa valeur — parce que deux colonnes de 88 pt ne tiennent pas dans 320 px | Rien. Sous 360 px, le bloc de classe passe son `consequence` sur deux lignes et la hauteur passe de 72 à 88 pt |
| **Tablet** (480–899 px) | Les deux horodatages passent en **deux colonnes** côte à côte, côte à 200 pt chacune. Le bloc de classe et les photos passent en colonnes séparées : classe à gauche, photos à droite | Rien. **Les mots, les valeurs et les horodatages sont identiques** |
| **Desktop** (900 px et au-delà) | **Aucun rendu distinct.** Colonne centrée de 720 pt, navigation en bas. X11 exclut la version navigateur de bureau | Rien |

- **Cible tactile** : 52 pt pour les boutons, 44 pt pour le retour, et **72 × 72 pt** pour
  chaque vignette. Le bloc de classe est focusable sur toute sa hauteur de 72 pt.
- **Débordement** : (1) Le texte du fait est sur une largeur de mesure de **66 caractères**
      maximum, quel que soit l'écran : au-delà, une ligne de texte devient impossible à
      relire dans le noir, et la fiche passe sur plus de lignes. (2) Le préfixe
      `Mon appréciation :` ne se coupe jamais et reste collé au texte qu'il introduit. (3) Le
      bloc « ce que ce fait produit » passe **après** la barre d'action en pied de page
      quand la hauteur manque, parce que c'est une trace de lecture, pas une action.
- **Ce qui ne déborde jamais** : les deux horodatages. Chacun occupe sa colonne de 88 pt en
      chasse fixe, et **un horodatage n'est jamais abrégé** en « 18 h » : une heure sans sa
      date est une heure qui pourrait être celle d'un autre jour.

---

## 7. Accessibilité

- [ ] **Contraste du texte courant** — mesuré par `design-check contrast`, qui applique
      4,5:1 à chaque encre contre les huit surfaces de son `on:`, dont
      `--color-surface-sunken` (le texte apprécié, le champ de modification) et
      `--color-surface-raised` (la barre d'action). **Aucun ratio n'est écrit ici.**
- [ ] **Contraste des grands textes** — le titre est classé `text` et mesuré à 4,5:1. Le
      texte du fait est en `--text-body` : il n'utilise pas l'exception des grands
      caractères, parce qu'un fait approximativement lu est un fait contesté
      approximativement.
- [ ] **Navigation clavier complète** — sur clavier externe et sur tous les breakpoints. Le
      bloc de classe est un focusable unique portant toute l'information ; il n'est pas
      découpé en deux focusables, parce qu'un lecteur d'écran qui lit « Ce que j'ai
      observé » puis « Part dans l'export du dossier » dans deux arrêts séparés perd le lien
      entre les deux.
- [ ] **Focus visible** — anneau `--color-bordure-focus` de 2 px avec 2 px de fond entre
      l'anneau et le composant, **externe** au bloc de classe pour ne pas se confondre avec
      son filet gauche de 3 px.
- [ ] **ARIA** — la fiche est un `role="article"` dont le `aria-label` est composé : « Fait du
      12 septembre 2026 sur Courges 3e, constaté, pas encore confirmé. » **L'état et la
      classe sont dans le nom accessible**, parce que ce sont les deux informations qu'un
      utilisateur de technologies d'assistance ne peut pas déduire de la mise en forme. Le
      bloc de classe est un `role="note"` avec `aria-label` « Classe de cette saisie ».
- [ ] **Alternative textuelle** — chaque `VignettePhoto` porte un `alt` décrivant **l'état
      et non l'image** : « Photo du 12 septembre, sur cet appareil, pas encore envoyée. »
      L'image est **en outre** présentée comme un contenu accessible au toucher, pour qu'un
      utilisateur qui la voit puisse l'ouvrir. Un fichier illisible porte un `alt`
      explicite et reste compté.
- [ ] **Langue et direction de lecture** — `lang="fr-FR"`, gauche à droite, dates
      `JJ/MM/AAAA`, heures `HH h mm`. **Les deux horodatages sont annoncés dans l'ordre
      prise puis confirmation**, et non dans l'ordre visuel, pour qu'un utilisateur de
      technologies d'assistance entende l'antériorité.

---

## 8. Données

| Champ | Type | Origine | Requis | Erreur possible |
|---|---|---|---|---|
| `texte` | chaîne | saisie locale, **immuable après correction** — une correction écrit un fait nouveau et conserve l'ancien (append-only) | oui | Vide en modification : erreur au champ, ancienne valeur conservée |
| `classe` | énumération `constate` / `apprecie` | **propriété du schéma**, demandée à l'écriture, **non modifiable en correction** | oui | Absente sur un fait antérieur : la `FeuilleClasse` s'ouvre, et **le fait n'est pas exportable tant qu'elle manque** (E7) |
| `consequence` | chaîne | dérivée de `classe`, **jamais stockée** | oui | Elle ne peut pas diverger de la classe, parce qu'elle en est dérivée sans être stockée |
| `dossier_id` | identifiant | saisi à la création, jamais deviné | oui | Dossier supprimé : la fiche rend `Vide` variante `erreur` avec un libellé qui dit pourquoi |
| `horodatage_prise` | `JJ/MM/AAAA · HH h mm` | horloge de l'appareil, non modifiable | oui | — |
| `horodatage_confirmation` | `JJ/MM/AAAA · HH h mm` | horloge du serveur, non modifiable | **non** | Son absence **est** l'information : la colonne porte `Pas encore confirmé`, pas un tiret |
| `photos` | liste de fichiers | écrits localement avant tout envoi (B3) | non | Fichier illisible : `VignettePhoto` en état `illisible`, compté. Fichier non écrit (E12) : le `BandeauAlerte` le dit, et le fichier n'existe pas |
| `historique_corrections` | liste d'anciennes versions | **append-only**, jamais écrasée | oui | Une version à trous : la liste se rend telle quelle avec sa date, sans reconstruction |
| `exportable` | booléen | dérivée de `classe`, **jamais stockée** | oui | Idem : dérivée sans être stockée, donc incapable de diverger |
| `exporte_le` | horodatage de production d'un export | local, écrit par l'export (C11) | non | Jamais produit : la ligne porte un tiret et « pas encore exporté » |
| `rectifie_le` | horodatage | local | non | Jamais demandée : idem |

- **Chargement** : tout d'un bloc, sans pagination. Un fait est un objet unique.
- **Cache / hors-ligne** : la fiche s'affiche **entièrement** hors-ligne (N2, C9), et
  `Corriger` reste actif tant que le fait n'est pas confirmé par le serveur — c'est la
  manifestation directe de B4, et c'est le cas le plus fréquent de cette fiche.
- **Données sensibles** : un fait constaté est **une donnée sur la personne** : exportable,
  **non effaçable**, conservé jusqu'à sa date de fin au sens de B9. Un fait apprécié est
  **une opinion de travail** : **jamais exporté**, effaçable. Les deux partagent la même
  fiche, donc **la classe est affichée en permanence** : c'est le seul endroit du produit
  où il faut la voir, parce que c'est le seul endroit où on exporte. Rien n'est journalisé,
  rien n'est envoyé à un tiers (N8), et le `rectifie_le` est la trace d'une procédure RGPD
  (C6), donc elle est conservée au titre de l'obligation légale.

---

## 9. Traçabilité

| ID | Origine | Manifestation sur cet écran |
|---|---|---|
| **B1** | PRD | Les deux horodatages sont **distingués et toujours présents**. L'absence du second porte le mot `Pas encore confirmé`, jamais un tiret : la place vide d'un horodatage est un fait |
| **B2** | PRD | Un appui long sur le bloc de classe ouvre `CarteVocabulaire` : les trois mots de B2 avec leurs phrases et le mot du téléphone. Le propriétaire relit sa règle en relisant son fait |
| **B4** | PRD | `Corriger` est actif tant que le fait est `a_envoyer`, et la correction est **elle-même une écriture** avec ses propres horodatages. L'ancien texte est conservé, jamais écrasé |
| **B7** | PRD | Le bloc de classe est **visible en permanence** et porte sa conséquence d'export. Un fait apprécié est un retrait, un fond creusé, un préfixe écrit en gras et une encre différente : quatre différences, dont aucune n'est la couleur seule |
| **B8** | PRD | La classe est demandée à l'écriture et **non modifiable en correction**. Un fait sans classe déclenche `FeuilleClasse` et n'est pas exportable tant qu'elle manque |
| **B10** | PRD | Le bloc « ce que ce fait produit » trace `Exporté le`, avec la date et l'heure de production, parce que l'export arrive toujours pendant un litige |
| **B11** | PRD | La conséquence « Part dans l'export du dossier » est **écrite sur la fiche** du fait, donc le propriétaire sait où va son texte sans ouvrir l'export |
| **B16** | PRD | Cette fiche ne comporte **aucun montant**. Les sommes sont un objet séparé, sur `/dossiers/:dossierId/somme-due`, et il n'y a donc aucun calcul ici |
| **B17** | PRD | Le dossier vient de la saisie, jamais d'une source extérieure, et il est affiché en premier dans l'identité du fait |
| **C2** | PRD | La fiche se rend depuis le cache local avant tout appel réseau, donc elle s'ouvre instantanément dans un sous-sol |
| **C6** | PRD | La ligne `Rectifié le` est la trace de la procédure RGPD, et elle est **conservée** au titre de l'obligation légale. C'est la seule chose de cette fiche qui ne s'efface jamais |
| **C8** | PRD | Chaque vignette porte son état d'envoi et les deux horodatages. Aucun envoi n'est annoncé sans confirmation |
| **C9** | PRD | Hors-ligne, la fiche est complète et `Corriger` est actif. Un `BandeauAlerte` d'information le dit, sans le présenter comme une erreur |
| **N1** | PRD | Le rendu est local donc instantané ; le seul délai est celui de la confirmation, et il n'est **jamais** aguardé à l'écran |
| **N3** | PRD | 52 pt pour les boutons, 44 pt pour le retour, 72 × 72 pt pour les vignettes |
| **N4** | PRD | Corps à 17 px, horodatages à 14 px, ligne de mesure de 66 caractères maximum. Aucun texte sous 14 px |
| **N5** | PRD | Tailles en `rem` suivant le réglage du téléphone, plafonné à ×1,3 : le texte passe à 22 px et **la fiche s'allonge** au lieu de comprimer la ligne de mesure |
| **E1** | PRD | Le réseau tombe pendant l'envoi d'une photo : la vignette reste en `a_confirmer`, la fiche reste lisible et modifiable, et aucun bouton « Réessayer » n'apparaît |
| **E2** | PRD | Le téléphone est volé avec des écritures non parties : elles meurent avec l'appareil, et **cette fiche ne prétend jamais le contraire** — la colonne « Confirmé par le serveur » est vide, et c'est dit |
| **E5** | PRD | Un locataire part et demande ses données : le fait constaté part dans l'export du dossier au nom de la personne, le fait apprécié n'y est pas, et cette distinction est **visible sur la fiche avant l'export** |
| **E6** | PRD | Modifier un fait sans classe déclenche `FeuilleClasse`, sans dialogue modal ni déplacement du focus, et **le texte saisi est conservé** |
| **E7** | PRD | Un fait apprécié ne peut pas finir exporté : `exportable` est dérivée de `classe` et **jamais stockée**, donc elle ne peut pas diverger d'un export |
| **E12** | PRD | Si le stockage est plein, aucune photo n'est écrite et le `BandeauAlerte` le dit. Le fait reste lisible, et la fiche **reste complète quant à son texte** : il n'y a pas de trou silencieux |

---

## 10. Checklist de gate

- [x] Les 9 états sont décrits avec un rendu concret et des **libellés écrits**.
- [x] La place vide de l'horodatage de confirmation porte un **mot**, pas un tiret : c'est la
      moitié de B1.
- [x] Un fait sans photo a un vide **écrit et expliqué**, et un fait illisible a une
      erreur **distincte** de l'absence.
- [x] Aucun « Réessayer ».
- [x] Chaque élément interactif a un comportement, un feedback et un état résultant.
- [x] Le responsive est défini aux trois breakpoints, avec la ligne de mesure du texte
      explicitée.
- [x] La section Anti-générique est cochée et justifiée avec les valeurs réelles.
- [x] Aucune valeur de design n'est laissée à « à définir ».
- [x] **Aucun ratio de contraste écrit à côté d'une valeur.**
- [x] Chaque ID `B*`, `E*`, `C*` et `N*` de l'écran apparaît en § 9.
- [x] `node "$FORGE/scripts/forge-guard.js" placeholders <anchor>` ne signale rien ici.
- [x] L'écran reste cohérent avec `.forge/design/design-system.md`.
