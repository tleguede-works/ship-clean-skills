---
type: screen
slug: demande-detail
title: Fiche d'une demande
module: demandes
status: draft
generated_at: 2026-09-30
derived_from:
  - .forge/prd.md
  - .forge/design/design-system.md
rule_ids: [B1, B2, B6, B7, B8, B14, B15, B16, B17, B18, C2, C4, C6, C9, N1, N3, N4, N5]
edge_case_ids: [E8, E11]
flow: debloquer-le-flux
---

# Écran — Fiche d'une demande

> Ce document est la **source de vérité** pour qu'une IA génère l'interface de cet écran.
> Il est généré depuis le gabarit, jamais recopié. Aucun `{{PLACEHOLDER}}` ne doit subsister.

---

## 1. Rôle de l'écran

| | |
|---|---|
| **Archétype d'app** | `mobile_field_ops` (principal) |
| **Module** | `demandes` — rang 5, sous-écran |
| **Route** | `/demandes/:demandeId` |
| **Type** | page |
| **Utilisateurs** | Le propriétaire, seul utilisateur (C3) |
| **User stories servies** | US-7 |
| **Règles métier** | B1, B2, B6, B7, B8, B14, B15, B16, B17, B18, C2, C4, C6, C9, N1, N3, N4, N5 |
| **Edge cases** | E8, E11 |

**Une phrase** : cet écran permet au propriétaire de **décider** sur une demande, de
**rendre son porteur explicite** quand il n'y en a pas, et de voir la pièce qui a été
produite pour la traiter.

**Pourquoi il est au rang 5 de la navigation** : c'est l'acte sur la demande, donc
l'équivalent de `/encaissement/:mois/:dossierId` pour les loyers — un sous-écran, jamais une
entrée de navigation.

**Le point de conception central de cet écran** : **traiter une demande, ce n'est pas cocher
une case.** Un devis attend une décision, un rendez-vous attend un geste, un courrier
attend une réponse — et dans les trois cas, le traitement **produit une pièce** : une
décision écrite, une date posée, un fait daté. C'est pourquoi cette fiche ne contient
**aucun bouton « marquer comme traitée »**, et pourquoi le bloc `CE QUE CETTE DEMANDE A
PRODUIT` est aussi important que le bloc `CE QUI MANQUE`.

---

## 2. Direction visuelle de cet écran

| | |
|---|---|
| **Mood** | opérationnelle, parlante, sans alarme |
| **Densité** | **normale** — lignes de 44 pt, bloc de porteur de 64 pt, bloc de production de 64 pt. La fiche se lit ligne par ligne, parce qu'une décision se relit avant d'être prise |
| **Niveau de contraste** | **fort** — le porteur et l'horloge opposée sont lus avant le contenu |
| **Traitement photographique** | `thumbnail` pour les pièces jointes à la demande (un devis d'artisan se prouve par un document) et `AUCUN` sinon. **Aucun rendu du devis lui-même** : Bailly n'ouvre pas de PDF, il montre qu'il y a une pièce et où elle en est |
| **Référence** | une fiche de dossier papier avec une case à cocher — **dont la case a été remplacée par un bloc qui dit ce qui manque**, parce qu'une case vide ne dit pas pourquoi elle est vide |

**Les valeurs portées par cet écran**

| Rôle | Token | Valeur |
|---|---|---|
| Fond de l'application | `--color-background` | `#101319` |
| Surface des lignes | `--color-surface` | `#171B22` |
| Bloc de porteur, champ non modifiable | `--color-surface-sunken` | `#0A0C10` |
| Barre d'action | `--color-surface-raised` | `#212630` |
| Encre de lecture, intitulé | `--color-texte-principal` | `#E8ECF3` |
| Encre secondaire, aide | `--color-texte-secondaire` | `#A6B0C0` |
| Encre tertiaire, horloge | `--color-texte-tertiaire` | `#8B95A5` |
| Ambre — `À moi`, « sur cet appareil » | `--color-primaire-600` | `#E0A23A` |
| Sauge — traité, confirmée | `--color-confirme-600` | `#7FB08C` |
| Cyan-gris — « au locataire », horloge future | `--color-info-600` | `#74A9BC` |
| Terre cuite — sans porteur | `--color-alerte-600` | `#F09286` |

| | |
|---|---|
| **Surface** | `--color-surface` `#171B22` sur `--color-background` `#101319` |
| **Accent utilisé** | `--color-primaire-600` `#E0A23A` pour la pastille `À moi` et le mot d'état d'écriture, et `--color-info-600` `#74A9BC` pour la pastille `Au locataire`. **Les deux porteurs ont chacun une teinte** : c'est la seule exception au principe « un porteur est un porteur », et elle est justifiée — les deux sont des actions à mener, de nature opposée, et le propriétaire les reconnaît par la couleur avant de lire le mot |

### 2.1 Anti-générique — obligatoire

- [x] **Pas de fond blanc pur `#FFFFFF`.** Fond `#101319`, choisi, justifié.
- [x] **Pas de carte ombrée pour tout.** Quatre blocs : porteur, reçu, contenu, produit. Aucun n'a de fond propre ni de rayon, sauf le **bloc de porteur**, qui est sur `--color-surface-sunken` et qui est le **seul** élément de la fiche à avoir un fond : c'est l'information première, donc c'est la seule qui mérite d'être en creux.
- [x] **Pas d'uniformité.** L'intitulé est en `--text-h4` 20 px 600 — le seul `--text-h4` de l'écran, parce que c'est le seul titre de la fiche. L'horloge est en 14 px en chasse fixe, la catégorie en 13 px 600 interlettré, le contenu en 17 px 400.
- [x] **Pas de gris neutre générique.** `#8B95A5` ne porte que des horodatages. La pastille `À moi` est ambre pleine, `Au locataire` cyan-gris à contour, et une demande sans porteur est en **terre cuite** — la seule fois que cette teinte apparaît sur une demande, donc elle ne sert qu'à cet état.
- [x] **Pas de mise en page centrée symétrique.** Blocs alignés à gauche, pleine largeur moins `--space-lg` de chaque côté.
- [x] **Pas d'illustration d'appoint générique.** **Aucun glyphe de type de demande dans un cercle**, aucune icône de devis, de calendrier ou d'enveloppe. La catégorie est un mot en `Pastille`, l'horloge est un mot.
- [x] **Pas d'une seule famille de police.** `--font-chasse` pour les horodatages de réception, la date attendue et l'horodatage de production, alignés sur une même colonne de 128 pt.

**Choix assumé et non neutre** : **il n'y a pas de case à cocher.** Une fiche de demande
avec une case « traitée » est la forme que tout le monde attend, et c'est la forme qui
échoue : cocher une case ne produit aucune pièce, et une demande cochée n'est opposable à
rien. Cette fiche remplace la case par le bloc **`CE QUE CETTE DEMANDE A PRODUIT`**, qui
liste ce qui a été produit pour la traiter — une décision, un rendez-vous posé, un fait
daté — et qui est **vide tant que rien n'a été produit**, avec la phrase : « Rien encore.
Traiter cette demande, ce n'est pas cocher une case : c'est produire une pièce, et cette
pièce sera dans le dossier. » **Un cocher une case est un souvenir ; produire une pièce est
un fait.**

---

## 3. Anatomie

```
TitreÉcran  variante `feuille`
├─ [retour] Bouton 44 pt
├─ [titre] "Devis de remplacement de la chasse d'eau"   --text-h4
└─ [etat_ecriture] mot d'état ambre si écriture locale non confirmée
        │
        ▼
ListePlate  variante `groupee`
├─ BLOC PORTEUR, 64 pt, fond --color-surface-sunken
│   ├─ [sur_titre] "QUI DOIT AGIR"
│   ├─ LigneDemande variante `moi` — réduite au bloc porteur
│   │   Pastille PLEINE ambre  "À moi"
│   │   "attends depuis le 12 septembre"
│   │   variante `sans_porteur` : terre cuite + "Aucun porteur. Choisis qui doit agir."
│   └─ GroupeSegmenté  variante `choix_simple`   CONDITIONNEL, si sans porteur
│        [options] "À moi" · "Au locataire"  — jamais de défaut (B14)
│        [aide] "Bailly ne le devine pas."
│
├─ [sur_titre] "CE QUI A ARRIVÉ"
├─ LigneDonnée × 2
│   ├─ "Reçue le"   → 12/09 · 9 h 12      --font-chasse
│   │   E8 : si reçue deux fois, DEUX LIGNES, jamais fusionnées
│   └─ "Catégorie"  → Pastille "Devis"
├─ LigneDonnée
│   └─ "Bien"       → "Courges, 3e"
├─ ListePlate  variante `liste`
│   └─ VignettePhoto × n   72 pt, devis joint, état d'envoi
│
├─ [sur_titre] "CE QUI MANQUE"             CONDITIONNEL, dépends de la catégorie
├─ LigneDonnée × n
│   ├─ "Décision"   → ChampTexte, classe obligatoire
│   ├─ "Rendez-vous" → ChampDate + ChampTexte
│   └─ "Réponse"    → ZoneTexte, classe obligatoire
│
├─ [sur_titre] "CE QUE CETTE DEMANDE A PRODUIT"
├─ LigneDonnée × n        VIDE tant que rien n'est produit
│   ├─ "Décision"  → 12/09 · 18 h 04 + Horodatage source
│   ├─ "Rendez-vous posé" → 18/09 · 14 h 00
│   └─ OU Vide variante `aucune_donnee` :
│        "Rien encore. Traiter cette demande, ce n'est pas cocher une case :
│         c'est produire une pièce, et cette pièce sera dans le dossier."
│
└─ [sur_titre] "DANS LE DOSSIER"
    └─ Bouton secondaire "Voir le dossier de Courges, 3e"  → /dossiers/:id
        │
        ▼  --space-3xl
BarreAction  variante `principale`
└─ [action_principale] Bouton lg "Produire la décision"   CONDITIONNEL
   ou "Poser le rendez-vous"  ou "Enregistrer la réponse"
   etat `impossible` si la décision exige une preuve d'envoi et qu'il n'y a pas de réseau
```

| # | Composant | Rôle | Source |
|---|---|---|---|
| 1 | `TitreÉcran` | Nommer la demande, en `--text-h4` | design-system § 3.18 |
| 2 | `LigneDonnée` | Rendre le reçu, le bien, les champs manquants et les pièces produites | design-system § 3.22 |
| 3 | `GroupeSegmenté` | Rendre `qui doit agir` **modifiable seulement quand il manque** (B14) | design-system § 3.13 |
| 4 | `Pastille` | Porter la catégorie `Devis` · `Rendez-vous` · `Courrier` | design-system § 3.19 |
| 5 | `Horodatage` | Rendre **deux horodatages distincts** si la demande est arrivée deux fois (E8) | design-system § 3.21 |
| 6 | `ZoneTexte` | Saisir une réponse ou une décision, **avec la classe** (B8) | design-system § 3.10 |
| 7 | `ChampDate` | Poser un rendez-vous | design-system § 3.12 |
| 8 | `VignettePhoto` | Montrer la pièce jointe et dire où elle en est | design-system § 3.27 |
| 9 | `Vide` | Écrire pourquoi le bloc de production est vide | design-system § 3.26 |
| 10 | `Bouton` | Porter l'action de **production**, jamais « marquer comme traitée » | design-system § 3.8 |
| 11 | `BarreAction` | Porter l'action de production dans la portée du pouce | design-system § 3.16 |

---

## 4. États — tous, sans exception

| État | Déclencheur | Rendu | Feedback utilisateur |
|---|---|---|---|
| **Chargement** | Ouverture, lecture de la demande et de ses pièces | Les onze lignes en ossature à leur hauteur exacte — 44 pt pour l'identité, 64 pt pour le bloc de porteur, 64 pt pour une pièce produite, 72 pt pour une vignette. **Le bloc de porteur garde sa place** : un bloc qui saute sous le pouce au pire moment est le pire endroit pour le faire sauter | Aucun texte d'attente. Le titre porte déjà l'intitulé de la demande |
| **Rempli** | La demande existe et n'est pas traitée | Les quatre blocs rendus, le bloc de porteur en tête, le bloc « ce qui manque » rempli selon la catégorie, et le bloc de production **vide avec sa phrase** | Aucun. La fiche **est** le feedback |
| **Vide — jamais visité** | Route ouverte pour une demande inexistante | `Vide` variante `erreur` : « Cette demande n'existe pas. Elle a peut-être été créée sur un appareil qui n'a plus ces données. » **Ce n'est pas un vide, c'est une absence** | Aucun bouton `Réessayer`. Le seul geste est `Voir mes demandes`, dans la barre d'action conservée. **La barre ne disparaît pas** |
| **Vide — aucune donnée** | La demande existe, n'a **aucune pièce jointe** et **aucun champ à remplir** — un courrier dont il n'y a rien à répondre | Le bloc des pièces rend `Vide` variante `aucune_donnee` : « Aucune pièce jointe. Un devis reçu sans sa photo n'est opposable à rien six mois plus tard. » Le bloc « ce qui manque » rend le même vide pour sa catégorie | Aucun bouton dans le vide. Le geste est `Ajouter une pièce`, juste en dessous |
| **Erreur de chargement** | La demande est illisible localement | `Vide` variante `erreur` + `BandeauAlerte` en variante `impossible` : « Impossible de lire cette demande. Rien n'est affiché — et ce n'est pas vide : on ne sait pas encore. » | **Aucun bouton « Réessayer »** : la reprise est automatique. Un `BandeauAlerte` en variante `information` — « La lecture se fera seule dès que le réseau revient. » **Afficher le bloc de production vide laisserait croire que rien n'a jamais été produit** — donc la fiche entière disparaît, pas juste une partie |
| **Erreur de soumission** | Le champ de la catégorie est vide, ou la classe n'est pas choisie, ou la date de rendez-vous est passée | Erreur **au champ**, jamais dans un message bref global. Pour la classe : le `GroupeSegmenté` passe en `requis_non_choisi` et le bouton de production bascule en `impossible` avec l'aide « Choisis la classe avant d'enregistrer. » **Aucun dialogue modal, aucun déplacement du focus** | Le focus reste sur le champ fautif. Le texte déjà tapé est conservé |
| **Succès** | Une pièce est produite | `MessageBref` variante `fait` : « Décision enregistrée **sur cet appareil**. Pas encore confirmée. » Le bloc `CE QUE CETTE DEMANDE A PRODUIT` **reçoit une ligne** avec l'horodatage de la prise et celui de la confirmation serveur, **les deux distingués**. Le bloc `CE QUI MANQUE` disparaît, et la demande quitte la liste des demandes | Aucun toast. **Le message dit ce qui a été produit**, pas « demande traitée » — parce que ce n'est pas un traitement, c'est une pièce |
| **Hors-ligne / permissions** | Mode avion, sous-sol | La fiche s'affiche **entièrement** depuis l'appareil, et **la production d'une pièce reste possible** : décider, poser un rendez-vous, répondre à un courrier, c'est une écriture locale. Le bloc de porteur reste modifiable s'il manque. **Seule** une décision qui exige une preuve d'envoi passe en `impossible` | Le `BandeauSynchronisation` rend `hors_ligne`. Si la décision exige une preuve d'envoi, le bouton passe en `impossible` avec la phrase de B15, **et la fiche reste lisible et modifiable** |
| **Lecture seule** | Écran verrouillé, ou demande déjà traitée et confirmée par le serveur | La fiche est rendue en entier, en lecture. Le bloc de production reste visible, et son horodatage de confirmation **reste affiché** : une pièce produite et confirmée est une trace. Le bouton de production passe en `impossible` avec l'aide « Cette demande a déjà produit sa pièce le 12/09. » **Le bouton ne disparaît pas** | La barre d'action reste présente. **La seule action qui disparaît est l'écriture, jamais la barre ni la lecture** |

---

## 5. Interactions

| Élément | Événement | Comportement | Feedback visuel | État résultant | ID |
|---|---|---|---|---|---|
| `Bouton lg "Produire la décision"` | tap | Ouvre la `Feuille` de production : un `ZoneTexte` **avec classe obligatoire**, et rien d'autre. **Aucun champ de date** : la date est celle de l'appareil, et elle est **affichée après coup** dans le bloc de production, parce qu'une date saisie serait une date fausse | La feuille monte en 200 ms | Décision en cours de saisie | B8 |
| `Bouton lg "Poser le rendez-vous"` | tap | Ouvre la `Feuille` : un `ChampDate` et un `ZoneTexte` de motif, **avec classe**. La date est saisissable ici — un rendez-vous se pose à une date choisie | La feuille monte en 200 ms | Rendez-vous en cours de saisie | — |
| `Bouton lg "Enregistrer la réponse"` | tap | Ouvre la `Feuille` : un `ZoneTexte` **avec classe obligatoire**. La réponse part au locataire par le canal que le propriétaire choisit, **hors de Bailly** : Bailly n'est pas une messagerie | La feuille monte en 200 ms | Réponse en cours de saisie | X6 |
| `Bouton lg`, décision exigeant une preuve d'envoi, hors-ligne | tap | **Rien.** Le bouton passe en `impossible` et porte sous lui : « Cette décision produit une preuve d'envoi, donc elle a besoin du réseau. Sans réseau, elle n'est pas envoyée, et tu la verras demain matin. » **C'est exactement le traitement de la relance (B15), appliqué à une décision** | Aucun retour élastique, aucune secousse | Aucune décision envoyée | B15 |
| `GroupeSegmenté` du bloc de porteur | tap | **Rendu seulement quand le porteur manque.** Dès qu'un porteur est désigné, le `GroupeSegmenté` **disparaît** et la `Pastille` le remplace : un porteur désigné ne se redésigne pas par inadvertance, parce que changer de porteur sans s'en apercevoir fait disparaître une demande de la liste qu'on regarde | La pastille remplace le segment en `--duration-fast` | Porteur désigné | B14 |
| `GroupeSegmenté` du bloc de porteur, aucun choix | — | Le bouton de production reste **actif** : Bailly laisse le propriétaire décider **avant** de désigner un porteur, parce qu'un rendez-vous à prendre attend son geste et ce geste existe indépendamment de qui l'a engagé. **Seule** la demande sans porteur ne peut pas être traitée sans en désigner un | Aucune | Décision possible sans porteur | B14 |
| `VignettePhoto` d'un devis, tap | tap | Ouvre l'aperçu plein écran avec les deux horodatages | Aucun fondu | Aperçu | C8 |
| `VignettePhoto`, appui long | appui long | Ouvre la `Feuille` de la pièce : horodatages, taille, `Reprendre la photo`. **Aucune action d'effacement** (B18) | La feuille monte en 200 ms | Feuille de pièce | B18 |
| Bloc `CE QUE CETTE DEMANDE A PRODUIT`, ligne de pièce | tap | Ouvre la pièce produite : un fait daté pour une décision, un rendez-vous pour un rendez-vous. **Une pièce produite est un fait du dossier**, donc elle s'ouvre depuis là et pas depuis `/faits/:id` en direct — c'est le même objet avec deux chemins d'accès | Aucun fondu | Pièce produite | US-1 |
| `Bouton secondaire "Voir le dossier"` | tap | Ouvre `/dossiers/:dossierId`, à la section des demandes | Aucun fondu | Fiche du dossier | — |
| `Pastille` de catégorie | tap | Aucune action : une catégorie est une étiquette, pas un filtre | Aucun | — | — |
| Retour arrière | retour | Conserve toute saisie non enregistrée et la rend visible par le mot d'état. **Ne demande rien** | Aucun | Saisie conservée | E11 |

- **Focus / clavier** : sept focusables dans l'état le plus chargé — le `GroupeSegmenté` du
  porteur, le champ de la catégorie manquante, chaque champ du bloc « ce qui manque », chaque
  vignette, chaque ligne de pièce produite, le bouton de production. `Origine` va au champ
  du bloc « ce qui manque », parce que c'est ce qu'il est venu faire. Le clavier numérique
  ne comporte pas de touche d'envoi et le clavier matériel n'est pas intercepté : une faute
  de frappe sur `Entrée` ne doit pas produire une décision.
- **Gestes** : **aucun geste porteur.** Pas de swipe pour traiter une demande, pas de swipe
  pour l'archiver, pas de long-press pour la supprimer. Une pièce produite est un acte
  juridique, donc elle ne se déclenche pas au doigt. Le glissement de `Feuille` ne fait que
  fermer.
- **Animations** : l'apparition d'une ligne dans le bloc de production est en
  `--duration-normal` `--ease-out` — c'est le seul moment où une animation se justifie,
  parce que c'est le **résultat** du geste et qu'il faut le voir arriver. La
  disparition du bloc « ce qui manque » est en `--duration-fast`. **Les horodatages ne sont
  jamais animés** : un horodatage qui glisse est un horodatage qu'on lit de travers.
  `prefers-reduced-motion` met tout à 0 ms.
- **Retour arrière** : conserve la saisie, ne demande rien.

---

## 6. Responsive

| Breakpoint | Comportement | Ce qui se replie / disparaît |
|---|---|---|
| **Mobile** (0–479 px) | Le layout de référence. Titre en `--text-h4` sur deux lignes maximum, blocs alignés à gauche, montants et horodatages alignés à droite sur 128 pt, barre d'action de 88 pt **au-dessus du clavier** | Sous 360 pt, l'intitulé du titre passe sur **trois lignes** et le titre passe de 44 à 64 pt. Le bloc de porteur ne se rétrécit jamais : c'est l'information première |
| **Tablet** (480–899 px) | Deux colonnes : porteur et reçu à gauche sur 320 pt, « ce qui manque » et « ce que cette demande a produit » à droite. La navigation devient un rail vertical de 88 pt | Le bloc « ce qui manque » passe à droite : c'est ce qu'on vient traiter, donc il doit être **en haut de colonne**, pas en bas de page |
| **Desktop** (900 px et au-delà) | **Aucun rendu distinct.** Colonne centrée de 720 pt, navigation en bas. X11 exclut la version navigateur de bureau | Rien |

- **Cible tactile** : **64 pt** pour le bloc de porteur, 52 pt pour les champs et les boutons,
  44 pt pour le retour, **72 × 72 pt** pour chaque vignette.
- **Débordement** : (1) L'intitulé du titre est sur **deux lignes** maximum en mobile et
      **trois** sous 360 pt, avec troncature au deuxième point et points de suite au-delà.
      (2) Le libellé du bouton de production passe sur **deux lignes** plutôt que de
      s'abréviar : le mot compte, et « Produire la décision » dit ce qui va se passer.
      (3) Les deux horodatages d'une demande reçue deux fois passent sur **deux lignes**
      sous 360 pt, jamais fusionnés.
- **Ce qui ne déborde jamais** : la phrase du bloc de production vide. Elle est le seul
      endroit de l'écran qui explique **pourquoi** il n'y a rien, donc elle est lisible en
      entier à toutes les largeurs, quitte à allonger la fiche.

---

## 7. Accessibilité

- [ ] **Contraste du texte courant** — mesuré par `design-check contrast`, qui applique
      4,5:1 à chaque encre contre les huit surfaces de son `on:`, dont
      `--color-surface-sunken` (le bloc de porteur, qui porte `--color-texte-principal`) et
      `--color-surface-raised` (la barre d'action, en `--color-texte-inverse` pour la
      pastille `À moi`). **Aucun ratio n'est écrit ici.**
- [ ] **Contraste des grands textes** — le titre est en `--text-h4` 20 px 600, classé `text`
      et mesuré à 4,5:1. Il n'utilise pas l'exception des grands caractères : **un intitulé
      de demande lu de travers est une demande qu'on traite pour la mauvaise raison.**
- [ ] **Navigation clavier complète** — sur clavier externe et sur tous les breakpoints.
      `Origine` va au champ du bloc « ce qui manque ». Le `GroupeSegmenté` du porteur est un
      `role="radiogroup"` traversé aux flèches, et il **disparaît du parcours de tabulation**
      dès qu'un porteur est désigné — un champ désactivé dans le parcours de tabulation est
      moins bruyant pour un utilisateur de technologies d'assistance qu'un champ.focusable
      et inerte.
- [ ] **Focus visible** — anneau `--color-bordure-focus` de 2 px avec 2 px de fond entre
      l'anneau et le composant. **La pastille de porteur ne change pas au focus** : elle
      porte l'information, pas la position.
- [ ] **ARIA** — la fiche est un `role="article"` dont le `aria-label` est composé : « Demande
      de devis, attended par le propriétaire, reçue le 12 septembre à 9 h 12, Courges 3e. »
      **Le porteur est en premier dans le nom accessible**, parce que c'est la première
      information de la fiche et celle qui décide si on peut agir. Le bloc « ce qui manque »
      est un `role="region"` avec `aria-label` « Ce qui manque pour traiter cette demande ».
      Le bloc de production est un `role="log"` : quand une pièce y entre, elle est annoncée
      **sans interrompre** la lecture.
- [ ] **Alternative textuelle** — une `VignettePhoto` de devis porte un `alt` décrivant
      **l'état et non l'image** : « Devis du plombier, page 1, sur cet appareil, pas encore
      envoyé. » Bailly **n'ouvre pas le devis** : il montre qu'il y a une pièce et où elle en
      est, donc un `alt` qui résumerait le devis serait une donnée que Bailly n'a pas.
- [ ] **Langue et direction de lecture** — `lang="fr-FR"`, gauche à droite, horodatages
      `JJ/MM · HH h mm` en chasse fixe. Le mois n'apparaît pas sur cette fiche. **La pastille
      dit `À moi` et non `Moi`**, pour la même raison que sur la liste : la préposition porte
      le sens.

---

## 8. Données

| Champ | Type | Origine | Requis | Erreur possible |
|---|---|---|---|---|
| `qui_doit_agir` | énumération `proprietaire` / `locataire` | **obligatoire**, saisissable **seulement quand elle manque** (B14) | oui | Absente : le `GroupeSegmenté` est rendu, la pastille est en terre cuite, et le bouton de production **reste actif** — on peut décider avant de désigner un porteur |
| `intitule` | chaîne, 6 mots maximum | **dérivée du type de l'objet déposé**, jamais de son contenu | oui | Contenu libre refusé : un contenu demanderait sa classe (B8), et un intitulé en est le résumé |
| `categorie` | `devis` / `rendez_vous` / `courrier` | choisie, en `Pastille` | oui | Inconnue : refusée à la création. **Une catégorie n'est pas un état** et ne porte donc aucune teinte sémantique |
| `horodatages_reception` | liste, **jamais dédupliquée** (E8) | local, à chaque réception | oui | Deux horodatages : **deux `LigneDonnée` distinctes**, chacune avec sa date et son heure. Aucun rapprochement, aucun mot « doublon » |
| `objet` | identifiant du bien | choisi, jamais déduit (X6) | oui | Sans objet : tiret, et la fiche reste affichable |
| `champs_manquants` | liste, **dépendante de la catégorie** | dérivée | oui | Une catégorie sans champ : la liste est vide et la fiche le dit. **Bailly n'invente pas ce qu'il faut faire** |
| `contenu_champ` | chaîne, **classe obligatoire** (B8) | saisie locale | oui | Classe absente : `GroupeSegmenté` en `requis_non_choisi`, bouton en `impossible`. Le texte tapé est conservé |
| `pieces_produites` | liste de références | **une décision et un rendez-vous sont des faits datés du dossier** | non | Vide : le bloc rend `Vide` variante `aucune_donnee` avec la phrase « Rien encore. Traiter cette demande, ce n'est pas cocher une case. » |
| `date_production` | horodatage de l'appareil | non saisissable | oui | — |
| `exige_preuve_envoi` | booléen | dérivée de la catégorie et de la configuration | oui | Vrai hors-ligne : le bouton passe en `impossible` avec la phrase de B15. **Bailly ne l'invente pas pour une simple réponse** |
| `etat_envoi` | `a_envoyer` / `rien_a_confirmer` | local d'abord (C2) | oui | Échec : aucun bouton « Réessayer », la reprise est automatique |

- **Chargement** : tout d'un bloc, sans pagination. Une demande est un objet unique, avec au
  plus quelques pièces jointe.
- **Cache / hors-ligne** : la fiche s'affiche **entièrement** hors-ligne (N2, C9), et la
  production d'une pièce reste possible : décider, poser un rendez-vous, répondre, ce sont
  des écritures locales. **Seule** une décision qui exige une preuve d'envoi change d'état
  — le même traitement que la relance (B15), et pour la même raison.
- **Données sensibles** : l'intitulé, la catégorie, le contenu des champs et les pièces
  produites sont des **données personnelles au sens de C6** : exportables avec le dossier du
  locataire, et **non effaçables** pour ce qui relève d'une pièce comptable. **Le contenu
  des champs demande sa classe** (B8), donc une appréciation écrite dans une réponse n'est
  **jamais exportée** (B7). Rien n'est journalisé, rien n'est envoyé à un tiers (N8), et
  **Bailly n'est pas une messagerie** : la réponse part par le canal que le propriétaire
  choisit, hors de Bailly, et c'est écrit dans l'aide du champ.

---

## 9. Traçabilité

| ID | Origine | Manifestation sur cet écran |
|---|---|---|
| **B1** | PRD | Toute pièce produite est une écriture locale d'abord, et porte `Pas encore confirmé` tant que le serveur n'a rien confirmé. Les deux horodatages, prise et confirmation, sont distingués dans le bloc de production |
| **B2** | PRD | Le `MessageBref` porte le mot du téléphone : « Pas encore confirmée. » Et **le message dit ce qui a été produit**, pas « demande traitée » : traiter ce n'est pas cocher une case |
| **B6** | PRD | Le `BandeauSynchronisation` est présent sur cette fiche, et ne se masque pas quand la demande est produite |
| **B7** | PRD | Tous les champs de contenu de cette fiche demandent leur classe. Il n'y a pas un seul champ de texte libre non classé, donc il n'y a pas un seul endroit où un jugement peut devenir un fait |
| **B8** | PRD | Le `GroupeSegmenté` de classe est `requis_non_choisi` tant qu'aucune classe n'est choisie, et le bouton de production bascule en `impossible` avec l'aide. **Le défaut ne peut pas être « ce que j'ai lu quelque part »**, donc il n'y a pas de défaut |
| **B14** | PRD | `qui_doit_agir` est obligatoire et **modifiable seulement quand il manque** : dès qu'il est désigné, le sélecteur disparaît. Sans porteur, la pastille est en terre cuite et le `BandeauAlerte` de la liste l'explique |
| **B15** | PRD | Une décision qui exige une preuve d'envoi passe en `impossible` hors-ligne, **sans disparaître**, avec la phrase de B15. **C'est le seul endroit du produit où une décision est refusée**, et c'est pourquoi la phrase est écrite mot pour mot |
| **B16** | PRD | Aucun montant sur cette fiche. **Aucun champ de date sur une décision** : la date est celle de l'appareil, affichée après coup, parce qu'une date saisie serait une date fausse. La date n'est saisie que pour un rendez-vous, où c'est un choix |
| **B17** | PRD | Le bien est choisi, jamais déduit. L'intitulé est **dérivé du type de l'objet déposé**, jamais de son contenu |
| **B18** | PRD | Aucune action d'effacement, et **aucun bouton « marquer comme traitée »** dans aucune variante. Traiter, c'est produire une pièce, et la pièce est dans le dossier |
| **C2** | PRD | La production d'une pièce est une écriture locale d'abord, envoyée ensuite. L'ordre n'est jamais inversé, et l'interface ne fait pas attendre le réseau |
| **C4** | PRD | Barre d'action de 88 pt au-dessus du clavier, boutons à 52 pt, bloc de porteur à 64 pt — tout dans la zone du pouce |
| **C6** | PRD | Le contenu des champs demande sa classe, donc un jugement n'est pas exporté comme un fait. Rien n'est journalisé, rien n'est envoyé à un tiers |
| **C9** | PRD | Hors-ligne, **tout fonctionne sauf une décision qui exige une preuve d'envoi**. La fiche reste lisible et modifiable dans tous les cas |
| **N1** | PRD | Le rendu est local donc instantané ; l'apparition d'une pièce dans le bloc de production est en 200 ms, parce que c'est le **résultat** du geste et qu'il faut le voir arriver |
| **N3** | PRD | 64 pt pour le bloc de porteur, 52 pt pour les champs et les boutons, 72 × 72 pt pour les vignettes |
| **N4** | PRD | Titre en `--text-h4`, corps à 17 px, horodatages à 14 px, sur-titres à 13 px 600. Aucun texte sous 14 px |
| **N5** | PRD | Tailles en `rem` suivant le réglage du téléphone, plafonné à ×1,3 : à ×1,3 le titre passe sur trois lignes et la fiche s'allonge, **sans jamais tronquer un intitulé** |
| **E8** | PRD | Deux demandes de la même personne le même jour : **deux `LigneDonnée` distinctes** dans le bloc « ce qui a arrivé », chacune avec sa date et son heure. Aucune déduplication, donc aucun risque de dédoublement, et **aucun mot « doublon »** |
| **E11** | PRD | Une production commencée puis abandonnée reste saisissable, et le retour arrière conserve la saisie sans rien demander. La fiche ne perd rien |

---

## 10. Checklist de gate

- [x] Les 9 états sont décrits avec un rendu concret et des **libellés écrits** — y compris
      celui du bloc de production vide.
- [x] **Aucun bouton « marquer comme traitée »**, dans aucune variante. Le traitement
      produit une pièce, et la pièce est dans le dossier.
- [x] Le porteur est modifiable **seulement quand il manque** : dès qu'il est désigné, le
      sélecteur disparaît, pour qu'une demande ne puisse pas disparaître d'une liste par
      inadvertance.
- [x] Un vide n'est jamais un zéro ; l'erreur a un rendu distinct et **la fiche entière
      disparaît** plutôt qu'une partie, pour ne pas laisser croire que rien n'a été produit.
- [x] Aucun « Réessayer ».
- [x] Chaque élément interactif a un comportement, un feedback et un état résultant.
- [x] Le responsive est défini aux trois breakpoints, avec la règle « la fiche s'allonge
      plutôt que de tronquer un intitulé » explicite.
- [x] La section Anti-générique est cochée et justifiée avec les valeurs réelles.
- [x] Aucune valeur de design n'est laissée à « à définir ».
- [x] **Aucun ratio de contraste écrit à côté d'une valeur.**
- [x] Chaque ID `B*`, `E*`, `C*` et `N*` de l'écran apparaît en § 9.
- [x] `node "$FORGE/scripts/forge-guard.js" placeholders <anchor>` ne signale rien ici.
- [x] L'écran reste cohérent avec `.forge/design/design-system.md`.
