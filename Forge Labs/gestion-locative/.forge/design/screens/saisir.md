---
type: screen
slug: saisir
title: Saisir un fait
module: saisir
status: draft
generated_at: 2026-09-30
derived_from:
  - .forge/prd.md
  - .forge/design/design-system.md
rule_ids: [B1, B2, B4, B7, B8, B15, B16, B17, B18, C2, C4, C8, C9, N1, N3, N4, N5]
edge_case_ids: [E1, E4, E6, E7, E11, E12]
flow: boucle-quotidienne
---

# Écran — Saisir un fait

> Ce document est la **source de vérité** pour qu'une IA génère l'interface de cet écran.
> Il est généré depuis le gabarit, jamais recopié. Aucun `{{PLACEHOLDER}}` ne doit subsister.

---

## 1. Rôle de l'écran

| | |
|---|---|
| **Archétype d'app** | `mobile_field_ops` (principal) |
| **Module** | `saisir` — rang 2 dans la navigation, **porté par la `BarreAction`**, pas par un onglet |
| **Route** | `/saisir` — en modification : `/saisir?fait=:faitId` |
| **Type** | feuille (`Feuille` variante `bas`) |
| **Utilisateurs** | Le propriétaire, seul utilisateur (C3) |
| **User stories servies** | US-1 |
| **Règles métier** | B1, B2, B4, B7, B8, B15, B16, B17, B18, C2, C4, C8, C9, N1, N3, N4, N5 |
| **Edge cases** | E1, E4, E6, E7, E11, E12 |

**Une phrase** : cet écran permet au propriétaire de consigner un fait daté **dans un
sous-sol, d'une main, sans réseau**, en lui obligant à dire si ce qu'il écrit est ce qu'il
a observé ou ce qu'il en pense.

**Pourquoi il est au rang 2 de la navigation** : sa fréquence est de 5 et sa centralité de
5 — c'est le geste de la boucle principale, fait plusieurs fois par jour, et la seule
slice que le propriétaire utilise tous les jours sans exception (R1). L'organigramme du
domaine la classerait sixième, derrière les locataires, les logements et les baux. C'est
exactement l'erreur que la priorisation des modules interdit.

**Il est rendu par la `BarreAction`, pas par un onglet.** C'est la seule entorse à « la
navigation se lit de gauche à droite », et elle va **dans le sens** de la contrainte de
portée : l'action la plus fréquente du produit mérite un composant fait pour elle, pas une
place dans une barre de navigation où elle disparaît dès qu'on l'a utilisée.

---

## 2. Direction visuelle de cet écran

| | |
|---|---|
| **Mood** | opérationnelle, parlante, sans alarme |
| **Densité** | **dense** — la feuille est à 85 % de la hauteur de l'écran, donc il reste **au plus 8 lignes visibles** au-dessus du clavier. Le formulaire est donc court par construction : trois champs, pas dix |
| **Niveau de contraste** | **fort** — la phrase du `GroupeSegmenté` porte la règle de B7, et une règle qu'on ne lit pas n'est pas une règle |
| **Traitement photographique** | `thumbnail` — la rangée de `VignettePhoto` en bas du formulaire, 72 × 72 pt, avec l'état d'envoi de chacune |
| **Référence** | la feuille de note rapide d'un carnet de terrain : trois champs, une photo, un bouton. Et **la moitié du formulaire est une question**, parce que c'est ce que B8 impose |

**Les valeurs portées par cet écran**

| Rôle | Token | Valeur |
|---|---|---|
| Fond de la feuille | `--color-background` | `#101319` |
| Surface de la feuille | `--color-surface` | `#171B22` |
| Barre d'action de la feuille, segment choisi | `--color-surface-raised` | `#212630` |
| Champ de saisie, segment non choisi | `--color-surface-sunken` | `#0A0C10` |
| Encre de lecture | `--color-texte-principal` | `#E8ECF3` |
| Encre secondaire, conséquence d'export | `--color-texte-secondaire` | `#A6B0C0` |
| Ambre — « sur cet appareil » | `--color-primaire-600` | `#E0A23A` |
| Terre cuite — impossible | `--color-alerte-600` | `#F09286` |
| Sauge — ce qui sort en export | `--color-confirme-600` | `#7FB08C` |
| Contour de champ | `--color-bordure-champ` | `#7C8695` |

| | |
|---|---|
| **Surface** | `--color-surface` `#171B22` sur un voile `--color-voile` `#05070A` à 72 % |
| **Accent utilisé** | `--color-primaire-600` `#E0A23A` — le segment choisi du `GroupeSegmenté`, l'étiquette du champ focalisé, le bouton `Enregistrer`. **C'est la couleur de l'appareil, donc la couleur de tout ce que cette feuille écrit localement** |

### 2.1 Anti-générique — obligatoire

- [x] **Pas de fond blanc pur `#FFFFFF`.** Fond `#101319` pour la feuille, voile `#05070A` à
      72 % derrière elle.
- [x] **Pas de carte ombrée pour tout.** Aucun bloc du formulaire n'a de fond propre. Les
      deux cartes du `GroupeSegmenté` sont des **surfaces de choix**, pas des cartes
      décoratives : elles ont une fonction, donc un contour `1` pt et un rayon `--radius-sm`.
- [x] **Pas d'uniformité.** Trois échelles dans une feuille de 200 pt : le sur-titre
      `CE QUE TU ÉCRIS` en 13 px 600 interlettré, la question du groupe en 17 px 600, la
      conséquence d'export en 14 px. Le rapport 13 / 14 / 17 est petit mais **la question est
      en 600 et la conséquence en 400**, donc le poids porte la hiérarchie aussi bien que
      la taille.
- [x] **Pas de gris neutre générique.** La conséquence « ne sortira jamais d'un export »
      est en `--color-texte-secondaire` `#A6B0C0` et le segment choisi en
      `--color-primaire-600`. La frontière constaté / apprécié est donc lisible **en gris
      clair contre gris soutenu**, sans qu'aucune teinte ne soit nécessaire pour
      l'exprimer.
- [x] **Pas de mise en page centrée symétrique.** Formulaire aligné à gauche, pleine
      largeur de l'écran moins `--space-xl` de chaque côté. Le `GroupeSegmenté` est
      traversant.
- [x] **Pas d'illustration d'appoint générique.** Aucun glyphe en cercle décoratif, aucune
      icône d'image générique dans un cadre vide. Si la photo n'a pas pu être écrite, le
      slot est **vide** et une phrase le dit — pas un cadre avec une icône d'image.
- [x] **Pas d'une seule famille de police.** `--font-chasse` pour la date et l'heure du
      fait, qui sont alignées à droite dans une colonne de 72 pt.

**Choix assumé et non neutre** : **le formulaire n'a pas de champ « Type » ni de champ
« Notes ». Il a une question, et elle est bloquante.** Les deux options portent chacune
leur conséquence d'export, en clair, sous leur titre : « Part dans l'export du dossier » et
« Ne sortira jamais d'un export ». Le bouton `Enregistrer` est inactif tant qu'aucune n'est
choisie, et son aide porte la raison. C'est la matérialisation exacte de B8 — le défaut ne
peut pas être « ce que j'ai lu quelque part », donc **il n'y a pas de défaut** — et c'est la
seule question bloquante de tout le produit, parce que c'est la seule dont la réponse
change où atterrit la donnée. Une question bloquante qui a un coût, on la pose.

---

## 3. Anatomie

```
Feuille  variante `bas`                       85 % de la hauteur, rayon --radius-lg
├─ [poignee] 4 × 40 pt, zone 44 pt
├─ [titre] "Saisir un fait"                    --text-h4
├─ [aide] "Resté sur cet appareil jusqu'à confirmation."
│
├─ [contenu]
│   ├─ LigneDonnée × 3                            (44 pt)
│   │   ├─ ChampTexte  variante `classe_obligatoire`
│   │   │    "Ce que tu écris"  —  ZoneTexte, 132 pt minimum
│   │   ├─ ChampDate   variante `source`  "Dossier"  → 07, Courges 3e  (pré-sélectionné)
│   │   └─ ChampDate   variante `source`  "Quand"   → 12/09 · 18 h 04  (heure appareil)
│   │
│   ├─ GroupeSegmenté  variante `classe_de_donnee`   64 pt, AUCUN choix au départ
│   │   ├─ [intitule]   "Ce que tu écris"
│   │   ├─ [options]    Carte 1  "Ce que j'ai observé"
│   │   │                  [consequence] "Part dans l'export du dossier."
│   │   ├─ [options]    Carte 2  "Ce que j'en pense"
│   │   │                  [consequence] "Ne sortira jamais d'un export."
│   │   └─ [aide]       "Choisis ce que tu écris : ce que tu as observé,
│   │                     ou ce que tu en penses."
│   │
│   ├─ ListePlate  variante `liste`               rangée de VignettePhoto
│   │   ├─ VignettePhoto × n                       état `a_confirmer` par défaut
│   │   └─ Bouton secondaire "Prendre une photo"   52 pt
│   │
│   └─ BandeauAlerte  variante `impossible`       CONDITIONNEL
│        "Pas de place sur cet appareil : 0 Mo libres.
│         La photo n'a pas pu être écrite."
│
└─ [action] Barre d'action de la feuille, 88 pt
     ├─ Bouton lg "Enregistrer"
     └─ [aide] "Choisis la classe avant d'enregistrer."   CONDITIONNEL
```

| # | Composant | Rôle | Source |
|---|---|---|---|
| 1 | `Feuille` | Le seul conteneur modal du produit, monté du bas | design-system § 3.15 |
| 2 | `LigneDonnée` | Rendre un champ comme une ligne de fiche, avec son étiquette en sur-titre | design-system § 3.22 |
| 3 | `ZoneTexte` | Porter le texte libre, **subordonné à la classe** | design-system § 3.10 |
| 4 | `GroupeSegmenté` | Demander la classe, sans défaut (B8) | design-system § 3.13 |
| 5 | `ChampDate` | Saisir le dossier et la date du fait | design-system § 3.12 |
| 6 | `VignettePhoto` | Montrer les pièces jointes et dire où elles en sont | design-system § 3.27 |
| 7 | `Bouton` | Porter `Enregistrer` et `Prendre une photo` | design-system § 3.8 |
| 8 | `BandeauAlerte` | Dire l'impossibilité d'écrire un fichier (E12) | design-system § 3.24 |
| 9 | `MessageBref` | Confirmer l'écriture, ou refuser, en une phrase de 4 s | design-system § 3.25 |
| 10 | `Invite` | Porter la conséquence d'export en permanence sous la question | design-system § 3.30 |

---

## 4. États — tous, sans exception

| État | Déclencheur | Rendu | Feedback utilisateur |
|---|---|---|---|
| **Chargement** | Ouverture de la feuille, résolution du dossier courant et de l'heure | La zone de texte est focalisée **immédiatement**, clavier monté, et rien n'est chargé : **cette feuille n'a pas d'état de chargement**, parce que tous ses champs sont des saisies locales. La seule donnée résolue est la liste des 14 dossiers, déjà en cache | Aucun. Si la liste des dossiers n'est pas en cache, la liste déroulante rend `Vide` variante `erreur` et le dossier reste **vide, avec la phrase** — jamais un dossier pré-choisi au hasard |
| **Rempli** | Dossier, date, texte et classe sont remplis | Le formulaire entier, l'aide du `GroupeSegmenté` **changée** selon la classe, et le bouton `Enregistrer` actif | Le mot d'état n'apparaît qu'**après** l'enregistrement, dans le `MessageBref` et le bandeau |
| **Vide — jamais visité** | Le propriétaire n'a jamais saisi de fait | La feuille s'ouvre sur la zone de texte vide et focalisée, le dossier **pré-sélectionné** si le propriétaire arrive d'une visite, et le `GroupeSegmenté` **sans choix**. Le vide est ici le **comportement par défaut** de la feuille, pas un état d'erreur | Le bouton `Enregistrer` est `impossible` avec son aide. La zone de texte est vide, et c'est normal : c'est un formulaire |
| **Vide — aucune donnée** | Le dossier est ouvert sans qu'aucun fait n'existe — cas de la modification | Le formulaire est vide, et la `ListePlate` de photos rend `Vide` variante `aucune_donnee` : « Aucune photo. Un fait sans photo se conteste difficilement six mois plus tard. » | Aucun bouton dans le vide de photos. Le geste est le bouton `Prendre une photo` de la rangée, qui est déjà là |
| **Erreur de chargement** | Le cache des dossiers est illisible au moment de l'ouverture | Le champ « Dossier » rend `Vide` variante `erreur` : « Impossible de lire la liste des baux depuis cet appareil. » **Le reste du formulaire reste utilisable** : un fait peut être écrit sans que la liste des dossiers soit lisible, il sera rattaché à un dossier dès que la liste reviendra | Aucun bouton « Réessayer ». Un `BandeauAlerte` en variante `information` : « La liste des baux reviendra toute seule. Le fait que tu écris maintenant ne la perd pas. » |
| **Erreur de soumission** | Le texte est vide, ou la classe n'est pas choisie | Erreur **au champ**, jamais dans un message bref. Le `GroupeSegmenté` passe en état `requis_non_choisi` : contour 2 px `--color-alerte-800`, et le bouton `Enregistrer` bascule en `impossible` avec l'aide « Choisis la classe avant d'enregistrer. ». **Aucun dialogue modal n'interrompt la saisie** | Le focus **ne se déplace pas** et la feuille ne saute pas. Une feuille qui saute pendant qu'on écrit dans un sous-sol perd le mot qu'on était en train de taper |
| **Succès** | Le fait est écrit localement et classé | `MessageBref` variante `fait` : « Saisi sur cet appareil. **Pas encore confirmé** — tu le sauras quand le bandeau le dira. » La feuille se ferme, et le `LigneFait` apparaît en haut de l'écran `aujourdhui` avec le mot d state's `a_envoyer` | Le mot du téléphone est dans le message, pas dans le bandeau seul. **Le message ne dit jamais « enregistré »** |
| **Hors-ligne / permissions** | Mode avion, sous-sol, 4G absente | **Rien ne change.** La feuille est identique hors-ligne, le bouton `Enregistrer` est actif, et `Prendre une photo` est actif. Un `BandeauAlerte` en variante `information` apparaît sous la rangée de photos : « Hors-ligne. Ce que tu écris ici reste sur cet appareil et partira seul dès que le réseau revient. » **La saisie hors-ligne est le cas normal, pas un mode dégradé** | Le mot d'état `a_envoyer` est réservé au moment de l'écriture. Avant, il n'y a rien à dire, donc rien n'est dit |
| **Lecture seule** | Écran verrouillé, ou modification d'un fait déjà **confirmé par le serveur** | Le formulaire entier passe en lecture : zone de texte non modifiable, `GroupeSegmenté` non pressable, champs de date en variante `lecture`, bouton `Enregistrer` en `impossible`. **La classe choisie reste affichée** et la conséquence aussi : « Ce que tu as écrit ici part dans l'export du dossier. » | Le bouton porte l'aide « Ce fait est confirmé par le serveur. Pour le corriger, demande la rectification du dossier. » **C'est le seul cas où l'écran renvoie à une procédure** — la rectification RGPD, en application de C6 |

---

## 5. Interactions

| Élément | Événement | Comportement | Feedback visuel | État résultant | ID |
|---|---|---|---|---|---|
| Ouverture de la feuille | tap sur `Saisir` | Le dossier est pré-sélectionné si un contexte de visite a été transmis, sinon la liste des 14 dossiers. **Jamais un champ vide à remplir, jamais un dossier deviné** | La feuille monte en `--duration-normal`, clavier monté | Feuille ouverte, zone de texte focalisée | B17 |
| `ZoneTexte`, frappe | saisie | Le compteur de caractères **reste désactivé** : il n'y a pas de limite. La hauteur croît avec le texte, jusqu'à 60 % de la feuille, puis défile | Aucune animation de hauteur au-delà de 132 pt — le redimensionnement est immédiat, parce qu'une zone qui glisse sous le doigt pendant la frappe est une zone qui perd le focus | Texte saisi | B8 |
| `GroupeSegmenté`, choix d'un segment | tap | Le segment se remplit en `--color-primaire-600`, le texte passe en `--color-texte-inverse`, et **l'aide du champ change** : « Ce que tu écris ici part dans l'export du dossier. » ou « Ce que tu écris ici ne sortira jamais d'un export. » | Le segment bascule en 200 ms, `--ease-default` | `GroupeSegmenté` état `choisi`, bouton `Enregistrer` actif | B7, B8 |
| `GroupeSegmenté`, aucun choix + frappe au-delà de 5 caractères | saisie | Le groupe passe en état `requis_non_choisi` **et** le bouton bascule en `impossible`, **sans dialogue, sans toast et sans déplacement du focus** | Contour 2 px sur le groupe, aide du bouton écrite | Formulaire non enregistrable | E6 |
| `GroupeSegmenté`, bascule entre les deux options après avoir tapé | tap | Le texte est **conservé**, il ne s'efface pas. Changer d'avis sur la classe d'un fait est un geste normal et il ne doit pas coûter le mot | Le segment bascule | Texte conservé, classe changée | E6, E11 |
| `Bouton secondaire "Prendre une photo"` | tap | Ouvre l'appareil photo. **La photo est écrite sur l'appareil avant toute tentative réseau** (B3) : le retour de l'appareil photo suffit à faire exister le fichier, et la vignette apparaît **dans l'état `a_confirmer` par défaut** | L'obturateur natif, puis la vignette apparaît avec la mention `Sur cet appareil` et l'état `Pas encore envoyée` | Fichier local, envoi en attente | B3, C8 |
| `Bouton secondaire "Prendre une photo"`, stockage plein | tap | **L'écran le dit avant de prétendre photographier** : le bouton bascule en `impossible` et un `BandeauAlerte` en variante `impossible` apparaît — « Pas de place sur cet appareil : 0 Mo libres. La photo n'a pas pu être écrite. » **L'appareil photo n'est pas ouvert** | Bouton non pressable, bandeau en terre cuite | Aucun fichier créé | E12 |
| `VignettePhoto`, appui long | appui long | Ouvre la `Feuille` de la photo : les deux horodatages distingués (prise, confirmation), la taille, et trois actions — `Reprendre la photo`, `Envoyer maintenant`, `Voir`. **Aucune action d'effacement** du fichier : une photo est la donnée la plus irremplaçable du dossier (B3) | La feuille monte en 200 ms | Feuille de photo | B3, B18 |
| `VignettePhoto`, état `a_confirmer`, appui sur `Envoyer maintenant` | tap | Force une tentative d'envoi, sans rien changer au mécanisme automatique. Le mot est `Tenter maintenant`, **jamais** `Envoyer` : la reprise est automatique et « Envoyer » dirait qu'elle ne l'est pas | La vignette passe en état `en_cours` — le libellé ne change pas, un `ProgressBar` de 2 pt passe au-dessus | Retour en `a_confirmer` ou `envoyee` | B1, C2 |
| `Bouton lg "Enregistrer"` | tap | Écrit localement **d'abord**, avec sa classe, puis envoie. **Rien n'attend le réseau** | `MessageBref` 4 s, feuille qui se ferme | Fait local, mot d'état `a_envoyer` | B1, C2, N1 |
| `Bouton lg "Enregistrer"`, classe `apprecie` | tap | **Aucun avertissement supplémentaire.** La classe a été demandée une fois, c'est la réponse du propriétaire, et lui redemander si « c'est vraiment une appréciation » serait exactement le jugement qu'il a déjà porté | Idem | Fait local, classé `apprecie` | B7 |
| Glissement vers le bas de la feuille | gesture | Ferme la feuille. **Le texte saisi est conservé** dans l'écran parent et dans la base locale, et la reprise le rend avec tous ses champs remplis | La feuille descend en `--ease-out` | Saisie conservée, non enregistrée | E11 |
| Retour arrière système | retour | Même comportement que le glissement : conservation de la saisie, aucun dialogue de confirmation, aucun dialogue de perte | Aucun | Saisie conservée | E11 |
| `Bouton lg "Enregistrer"` en modification d'un fait `non_confirme` | tap | La correction **est elle-même une écriture** : le fait porte alors l'état `modifie` et le mot `En cours de correction`. Un fait localmodifiable jusqu'à sa confirmation (B4) | `MessageBref` variante `info` : « Correction enregistrée sur cet appareil. » | Fait local modifié | B4 |

- **Focus / clavier** : la zone de texte est focalisée à l'ouverture, **avant** toute animation —
  le clavier monte pendant que la feuille monte, pas après. `Tab` parcourt zone de texte →
  dossier → date → segments → photos → bouton. Les deux segments sont un **groupe radio** :
  les flèches gauche et droite changent la sélection, `Espace` la pose. Le clavier matériel
  ne déclenche pas `Enregistrer` : une faute de frappe sur la touche entrée dans un
  sous-sol ne doit pas écrire un fait.
- **Gestes** : **le seul geste est le glissement de feuille vers le bas.** Pas de swipe pour
  joindre une photo, pas de long-press pour enregistrer, pas de double-tap : un geste
  involontire dans un sous-sol coûte plus cher que le temps qu'il fait gagner. Le
  glisser-déposer du clavier est désactivé sur la zone de texte, pour la même raison.
- **Animations** : ouverture de feuille en `--duration-normal` `--ease-in` ; bascule de
  segment en 200 ms `--ease-default` ; **aucune animation sur l'apparition d'une
  vignette** — elle apparaît, parce qu'une vignette qui glisse sous le doigt peut être
  prise pour un glissement. Le message bref entre par le bas en 200 ms et disparaît au bout
  de 4 s. `prefers-reduced-motion` met tout à 0 ms.
- **Retour arrière** : conserve la saisie, ne demande rien, et ne la perd jamais.

---

## 6. Responsive

| Breakpoint | Comportement | Ce qui se replie / disparaît |
|---|---|---|
| **Mobile** (0–479 px) | Le layout de référence. Feuille à 85 % de la hauteur, contenu défilant, barre d'action de feuille de 88 pt **collée en bas, au-dessus du clavier**. Le clavier réduit la zone visible à environ 8 lignes, donc le contenu défile et la barre d'action reste visible | Le `GroupeSegmenté` passe sur **deux cartes de 72 pt** au lieu de deux segments de 48 pt, parce que chaque carte porte deux lignes — son titre et sa conséquence. En dessous de 320 pt de large, la conséquence passe sur deux lignes et la carte fait 88 pt |
| **Tablet** (480–899 px) | La feuille devient centrée, largeur 560 pt, hauteur automatique plafonnée à 85 %. Le clavier matériel ne masque plus le formulaire, donc tout est visible sans défilement | Rien. **Le contenu ne change pas** : les mêmes champs, le même ordre, les mêmes mots |
| **Desktop** (900 px et au-delà) | **Aucun rendu distinct.** La feuille est centrée dans la fenêtre, la navigation reste en bas. X11 exclut la version navigateur de bureau | Rien |

- **Cible tactile** : 52 pt pour la zone de texte, les champs de date, chaque carte du
  `GroupeSegmenté`, `Prendre une photo` et `Enregistrer`. Les cartes de classe sont de
  **72 pt** de haut, donc largement au-dessus de N3.
- **Débordement** : (1) La zone de texte **grandit** jusqu'à 60 % de la feuille puis
      défile : elle ne tronque jamais un mot en cours de frappe. (2) La conséquence
      d'export d'une carte passe sur **deux lignes** sous 320 pt de large, et la carte
      grandit de 72 à 88 pt : **le texte de la règle ne se tronque jamais**, parce qu'une
      règle tronquée est une règle qui n'a pas été lue. (3) La barre d'action de feuille
      reste visible au-dessus du clavier à toutes les largeurs.
- **Ce qui ne déborde jamais** : la date et l'heure du fait, en 14 px en chasse fixe,
      alignées à droite sur 72 pt. Et la barre d'action, qui **ne monte jamais** au-dessus
      de 88 pt, même au réglage ×1,3 : le libellé `Enregistrer` est court par choix.

---

## 7. Accessibilité

- [ ] **Contraste du texte courant** — mesuré par `design-check contrast`, qui applique
      4,5:1 à chaque encre contre les huit surfaces de son `on:`, dont
      `--color-surface-sunken` (le champ, le segment non choisi) et
      `--color-surface-raised` (le segment choisi, en `--color-texte-inverse`). **Aucun ratio
      n'est écrit ici.**
- [ ] **Contraste des grands textes** — le titre de feuille est classé `text` et mesuré à
      4,5:1. Le `GroupeSegmenté` n'emploie aucun texte de grande taille : un segment choisi
      en 17 px 600 sur un fond plein ambre n'a pas besoin de l'exception, il est au-dessus
      du seuil.
- [ ] **Navigation clavier complète** — sur clavier externe et sur tous les breakpoints. La
      zone de texte est focalisée à l'ouverture. Le `GroupeSegmenté` est un `role="radiogroup"`
      et les deux cartes sont des `role="radio"` : les flèches les parcourent, `Espace` pose
      le choix, et `Origine` va au groupe.
- [ ] **Focus visible** — anneau `--color-bordure-focus` de 2 px avec 2 px de fond entre
      l'anneau et le composant. Sur une carte de classe, l'anneau est **externe** à la carte
      et ne se confond pas avec le contour de la carte sélectionnée : le focus et la
      sélection sont deux choses différentes et ne doivent pas se ressembler.
- [ ] **ARIA** — le `GroupeSegmenté` porte un `aria-label` de question
      « Ce que tu écris, c'est ce que tu as observé, ou ce que tu en penses ? » et chaque
      carte porte sa conséquence dans son `aria-describedby`. Le bouton `Enregistrer` en
      état `impossible` porte `aria-disabled="true"` et son `aria-describedby` pointe vers
      l'aide qui dit pourquoi. La zone de texte porte `aria-required="true"`.
- [ ] **Alternative textuelle** — chaque `VignettePhoto` porte un `alt` décrivant **l'état
      et non l'image** : « Photo du 12 septembre, prise à 18 h 04, sur cet appareil, pas
      encore envoyée ». Un `alt` de description visuelle n'apporterait rien ici : ce qui
      compte pour un utilisateur de technologies d'assistance, c'est **où en est le
      fichier**, pas ce qu'il montre.
- [ ] **Langue et direction de lecture** — `lang="fr-FR"`, gauche à droite, dates
      `JJ/MM/AAAA`, heures `HH h mm`. Le tutoiement du premier personne est conservé dans
      tous les libellés : l'écran parle comme le commanditaire parle, et c'est cohérent avec
      le reste du produit.

---

## 8. Données

| Champ | Type | Origine | Requis | Erreur possible |
|---|---|---|---|---|
| `texte` | chaîne, champ libre | saisie locale | oui | Vide : `Erreur de soumission` au champ. **Aucun compteur de caractères et aucune limite** |
| `classe` | énumération `constate` / `apprecie` | **obligatoire, sans défaut** (B8) | oui | Absente : le formulaire n'est pas enregistrable. **Une classe manquante sur un fait déjà enregistré déclenche la `FeuilleClasse`, jamais un choix par défaut** (E7) |
| `dossier_id` | identifiant | **sélectionné**, jamais deviné (B17) | oui | Liste des dossiers illisible : le champ rend `Vide` variante `erreur` et **le fait reste saisissable** — il sera rattaché au retour |
| `date` | date `JJ/MM/AAAA` | saisie, par défaut **aujourd'hui** | oui | Une date future sur un fait constaté : refusée au champ, « Un fait daté ne peut pas être postérieur à aujourd'hui. » |
| `heure` | `HH h mm` | **celle de l'appareil**, non saisissable | oui | — |
| `photos` | liste de fichiers | **écrits localement avant toute tentative réseau** (B3) | non | Écriture impossible (E12) : **le fichier n'est pas créé**, le bouton se met en `impossible`, et le bandeau porte la phrase. Une photo à moitié écrite serait une photo perdue |
| `etat_saisie` | `jamais_visite` / `a_venir` / `modifie` | local | oui | Un fait modifié hors-ligne sans réseau : l'état `modifie` est affiché, parce que la correction est elle-même une écriture et doit être visible |
| `etat_envoi` | `a_envoyer` / `rien_a_confirmer` / `echec_envoi` | local d'abord (C2) | oui | Échec d'envoi : `MessageBref` variante `refus` **et** bandeau `echec_envoi`. **Aucun bouton « Réessayer »** |
| `exportabilite` | booléen | dérivée de `classe`, **jamais stockée** | oui | Elle n'est pas stockée, donc **elle ne peut pas diverger de la classe** — c'est la propriété de schéma que B7 exige |

- **Chargement** : **aucun.** Le formulaire n'a pas d'état de chargement, et c'est un choix :
  tous ses champs sont des saisies locales, et afficher un chargement devant un formulaire
  vide donnerait l'impression d'attendre quelque chose.
- **Cache / hors-ligne** : la feuille est **identique** hors-ligne. Le dossier vient du
  cache local, la date vient de l'horloge de l'appareil, la photo est écrite localement
  avant tout envoi. Aucune de ces trois données n'a besoin du réseau pour exister.
- **Données sensibles** : un fait constaté est **une donnée sur la personne** : exportable,
  non effaçable. Un fait apprécié est **une opinion de travail** : jamais exportée,
  effaçable. **Le composant de saisie ne reçoit jamais la classe** dans ses propriétés de
  rendu autres que l'affichage de la conséquence : il ne peut donc pas l'apprendre par
  association, et une image d/learned model ne peut pas la réintroduire dans un export.
  **Aucun texte saisi n'est journalisé** (N8) et rien n'est envoyé à un tiers.

---

## 9. Traçabilité

| ID | Origine | Manifestation sur cet écran |
|---|---|---|
| **B1** | PRD | Le message de succès dit « Saisi **sur cet appareil**. Pas encore confirmé. » Jamais « enregistré ». Et le mot `Synchronisé` n'apparaît qu'après confirmation serveur, jamais à l'écriture |
| **B2** | PRD | Le `MessageBref` contient littéralement le mot du téléphone : « Pas encore confirmé. » C'est la seule fois où le produit dit ce mot autrement que dans le bandeau, et c'est volontaire : c'est le moment où le propriétaire vient de faire le geste et où il a besoin de la phrase pour la répéter |
| **B4** | PRD | Un fait `a_envoyer` est modifiable par appui long, et la correction est elle-même une écriture visible (`modifie`). Un fait `rien_a_confirmer` n'est plus modifiable et **le dit** en renvoyant à la procédure de rectification |
| **B7** | PRD | Les deux cartes portent leur conséquence d'export, en clair. `apprecie` n'est jamais exportable, et la conséquence est écrite **avant** le choix, pas après |
| **B8** | PRD | Le `GroupeSegmenté` est obligatoire **et sans valeur par défaut**. Le bouton `Enregistrer` est `impossible` tant qu'aucun segment n'est choisi, et son aide écrit la question. **Il n'existe aucun chemin par lequel une classe est déduite du texte** |
| **B15** | PRD | Cette feuille n'exige aucune preuve d'envoi, donc elle **fonctionne entièrement hors-ligne**. C'est le critère de distinction avec l'encaissement, et l'écran le porte en affichant un bandeau d'information et non une erreur |
| **B16** | PRD | Cette feuille ne saisit **aucun montant**. La somme due est un objet séparé, sur `/dossiers/:dossierId/somme-due`, parce que « fait daté » et « somme due » sont deux objets et pas un formulaire |
| **B17** | PRD | Le dossier est **sélectionné**, jamais pré-rempli depuis une source extérieure, jamais deviné. Un seul contexte possible : la visite en cours |
| **B18** | PRD | Aucune action d'effacement sur une photo. Une photo est la donnée la plus irremplaçable du dossier, et « Réessayer la photo » est une action plus utile qu'« effacer la photo » |
| **C2** | PRD | Écriture locale d'abord, vérifiée, envoyée après. L'écran ne fait **jamais** attendre le réseau avant d'écrire, et l'ordre est inverse de l'interdit |
| **C4** | PRD | La barre d'action de la feuille est collée en bas, **au-dessus du clavier**, 88 pt, et ne bouge jamais |
| **C8** | PRD | La photo est **écrite sur l'appareil avant toute tentative réseau**, et la vignette est en état `a_confirmer` par défaut. Aucun envoi n'est annoncé sans confirmation |
| **C9** | PRD | Hors-ligne, la feuille est identique. Le bandeau le dit, et il ne le dit pas comme une erreur |
| **N1** | PRD | L'écriture est locale et instantanée : le `MessageBref` paraît en moins d'une seconde, sans attendre le réseau. C'est la latence de l'indicateur qui est visée, et elle est tenue par construction |
| **N3** | PRD | 52 pt sur tous les éléments pressables, 72 pt sur les cartes de classe |
| **N4** | PRD | Corps à 17 px, plancher à 14 px pour la conséquence d'export, contrastes mesurés par le script |
| **N5** | PRD | Tailles en `rem` suivant le réglage du téléphone, plafonné à ×1,3. La conséquence d'export passe sur deux lignes à ×1,3 et la carte grandit |
| **E1** | PRD | Si l'envoi de la photo échoue, la vignette reste en `a_confirmer` et **le fait reste enregistrable** : la photo est jointe au fait local, pas bloquée derrière le réseau |
| **E4** | PRD | Le propriétaire écrit dans le sous-sol, sort, et l'écriture est **complète au moment où il a fini de taper**. Rien n'attend le réseau, donc rien ne le retient |
| **E6** | PRD | Le groupe bascule en `requis_non_choisi` **sans dialogue, sans toast et sans déplacer le focus**, et le texte saisi est conservé si le propriétaire change d'avis |
| **E7** | PRD | Un fait `apprecie` ne peut pas finir exporté : la classe est une propriété du schéma, jamais une convention d'écriture, et `exportabilite` en est dérivée sans être stockée |
| **E11** | PRD | Le glissement et le retour arrière **conservent la saisie** et ne demandent rien. Un fait abandonné n'est pas un brouillon caché : il reste saisissable, et il porte son mot d'état |
| **E12** | PRD | Le stockage plein est dit **avant** d'ouvrir l'appareil photo, le bouton passe en `impossible` et la phrase est écrite. Un état des lieux sans photo est signalé comme incomplet |

---

## 10. Checklist de gate

- [x] Les 9 états sont décrits avec un rendu concret et des **libellés écrits**.
- [x] Le vide de cette feuille est un **comportement par défaut**, pas un état d'erreur, et
      il est décrit comme tel.
- [x] Un vide n'est jamais un zéro ; l'erreur a un rendu distinct — et ici, **le formulaire
      reste utilisable**, ce qui est la seule réponse honnête à « la liste des dossiers est
      illisible ».
- [x] Aucun « Réessayer » : la reprise d'envoi est automatique, et le seul geste manuel
      s'appelle `Tenter maintenant`, jamais `Envoyer`.
- [x] Chaque élément interactif a un comportement, un feedback et un état résultant.
- [x] Le responsive est défini aux trois breakpoints, avec le comportement sous clavier
      explicité — c'est le cas d'usage principal.
- [x] La section Anti-générique est cochée et justifiée avec les valeurs réelles.
- [x] Aucune valeur de design n'est laissée à « à définir ».
- [x] **Aucun ratio de contraste écrit à côté d'une valeur.**
- [x] Chaque ID `B*`, `E*`, `C*` et `N*` de l'écran apparaît en § 9.
- [x] `node "$FORGE/scripts/forge-guard.js" placeholders <anchor>` ne signale rien ici.
- [x] L'écran reste cohérent avec `.forge/design/design-system.md` : aucun composant, aucune
      valeur et aucun mot d'état n'est inventé hors du design system.
