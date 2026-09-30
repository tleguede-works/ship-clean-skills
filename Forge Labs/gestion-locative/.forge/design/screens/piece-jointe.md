---
type: screen
slug: piece-jointe
title: Pièces jointes d'un fait
module: piece-jointe
status: draft
generated_at: 2026-09-30
derived_from:
  - .forge/prd.md
  - .forge/design/design-system.md
rule_ids: [B1, B2, B3, B4, B6, B8, C2, C8, C9, N1, N2, N3, N4, N5]
edge_case_ids: [E1, E4, E12]
flow: boucle-quotidienne
---

# Écran — Pièces jointes d'un fait

> Ce document est la **source de vérité** pour qu'une IA génère l'interface de cet écran.
> Il est généré depuis le gabarit, jamais recopié. Aucun `{{PLACEHOLDER}}` ne doit subsister.

---

## 1. Rôle de l'écran

| | |
|---|---|
| **Archétype d'app** | `mobile_field_ops` (principal) |
| **Module** | `piece-jointe` — **pas de rang de navigation** : c'est un sous-écran de `saisir` et de `fait-detail` |
| **Route** | `/faits/:faitId/photos` |
| **Type** | feuille (`Feuille` variante `bas`) |
| **Utilisateurs** | Le propriétaire, seul utilisateur (C3) |
| **User stories servies** | US-2 |
| **Règles métier** | B1, B2, B3, B4, B6, B8, C2, C8, C9, N1, N2, N3, N4, N5 |
| **Edge cases** | E1, E4, E12 |

**Une phrase** : cet écran permet au propriétaire de vérifier, **avant de quitter la pièce**,
que chaque photo d'un dégât est bien **sur son appareil**, et de savoir lesquelles le
serveur a confirmées.

**Pourquoi il est dans le périmètre du MVP** : c'est la seule slice dont l'échec vient de
**l'environnement** et non de la logique. Fusionnée dans `saisie`, elle se testerait en 4G
et se découvrirait en métro. C'est le risque n°2 du produit : « une photo restée sur le
téléphone que je crois partie ». Donc cet écran existe **pour que la preuve soit séparée**,
et son § 4 « Hors-ligne » est la moitié de sa raison d'exister.

**Ce que cet écran ne fait pas** : il ne compare rien, ne recadre rien, ne compresse pas
avec un réglage caché. Il montre un fichier et il dit où il en est.

---

## 2. Direction visuelle de cet écran

| | |
|---|---|
| **Mood** | opérationnelle, parlante, sans alarme |
| **Densité** | **normale** — la grille de vignettes est à 72 × 72 pt, ce qui fait trois vignettes par rangée sur 360 px de large. La densité ici est une question d'échelle de vignette, pas de hauteur de ligne : **une vignette de 48 pt serait illisible dans le noir, une de 96 pt ne tiendrait pas trois par rangée** |
| **Niveau de contraste** | **fort** — l'état d'envoi est écrit sous chaque vignette, donc il doit se lire sans zoom |
| **Traitement photographique** | `thumbnail` en grille, et **plein écran** à l'ouverture d'une photo. Le traitement est **aucun** : pas de filtre, pas de correction, pas de recadrage automatique. Une photo de dégât est une **preuve**, et une preuve que Bailly a retouchée n'est plus la photo |
| **Référence** | la galerie de l'appareil photo, **sans la grille de sélection et sans le bouton de partage** — parce qu'aucun des deux n'est une action de Bailly |

**Les valeurs portées par cet écran**

| Rôle | Token | Valeur |
|---|---|---|
| Fond de la feuille | `--color-background` | `#101319` |
| Surface de la feuille | `--color-surface` | `#171B22` |
| Vignette, état `sur_appareil` | `--color-surface-sunken` | `#0A0C10` |
| Barre d'action de la feuille | `--color-surface-raised` | `#212630` |
| Encre de lecture | `--color-texte-principal` | `#E8ECF3` |
| Encre de l'état d'envoi | `--color-texte-secondaire` | `#A6B0C0` |
| Ambre — « sur cet appareil », contour 2 px | `--color-primaire-600` | `#E0A23A` |
| Sauge — « confirmée », contour 1 px | `--color-confirme-800` | `#4F7F5F` |
| Terre cuite — écriture impossible | `--color-alerte-600` | `#F09286` |

| | |
|---|---|
| **Surface** | `--color-surface` `#171B22` sur un voile `--color-voile` `#05070A` à 72 % |
| **Accent utilisé** | `--color-primaire-600` `#E0A23A` — **le contour 2 px de la photo qui est sur l'appareil**. C'est le seul accent de l'écran, et il dit la seule chose qu'il y a à dire : ce fichier n'est pas encore parti |

### 2.1 Anti-générique — obligatoire

- [x] **Pas de fond blanc pur `#FFFFFF`.** Feuille `#101319`, vignettes sur `#0A0C10`.
- [x] **Pas de carte ombrée pour tout.** Les vignettes sont **des images**, pas des cartes :
      pas de rayon arrondi de 14 pt, pas d'ombre, pas de fond blanc de galerie. Le seul rayon
      est `--radius-sm` 6 px, et le seul fond est le creusé sous l'image.
- [x] **Pas d'uniformité.** Trois lignes sous la vignette : l'état en 14 px 400, l'horodatage
      de prise en 14 px en chasse fixe, et la taille en 14 px en tertiaire. Le **contour**
      varie d'épaisseur — 2 px ambre pour « sur cet appareil », 1 px vert-gris pour
      « confirmée » — donc la gravité se lit à la fois par la forme et par le mot.
- [x] **Pas de gris neutre générique.** Le mot « Sur cet appareil » est en ambre et le mot
      « Confirmée » en sauge, donc les deux états ne sont pas deux nuances de gris.
- [x] **Pas de mise en page centrée symétrique.** Grille alignée à gauche, trois vignettes
      par rangée, gouttière `--space-sm`. Le bouton `Prendre une photo` est pleine largeur
      sous la grille, pas centré dans un cercle.
- [x] **Pas d'illustration d'appoint générique.** **Il n'y a pas d'icône d'image générique
      dans un cadre vide.** Si un fichier ne s'affiche pas, l'emplacement porte l'état
      `illisible` et le fichier reste compté ; si le stockage est plein, l'emplacement
      n'existe pas du tout et une phrase le dit. Un cadre vide avec une icône d'image
      ressemble à une photo manquante, et c'est exactement le malentendu que ce produit
      combat.
- [x] **Pas d'une seule famille de police.** `--font-chasse` pour les deux horodatages et
      la taille, ce qui aligne les trois lignes de toutes les vignettes sur une même grille
      verticale.

**Choix assumé et non neutre** : **la vignette porte son état, pas son image seule.** La
grille d'une galerie classique montre l'image et rien d'autre, et c'est ce qui produit
l'erreur que le commanditaire a nommée : une photo affichée dans une galerie paraît partie.
Ici, la photo est **bordée d'ambre 2 px** tant qu'elle est sur l'appareil, et la ligne
« Sur cet appareil · 12/09 · 18 h 04 · 2,4 Mo » est écrite sous chaque vignette. La photo
reste visible — on doit pouvoir juger le dégât — mais elle **ne peut pas être confondue avec
une photo confirmée**, parce que sa bordure est différente et son mot est différent.

---

## 3. Anatomie

```
Feuille  variante `bas`                        85 % de la hauteur
├─ [poignee] 4 × 40 pt, zone 44 pt
├─ [titre] "Photos · 12 septembre"
├─ [aide] "Chaque photo est sur cet appareil avant d'être envoyée."
│
├─ [contenu]
│   ├─ BandeauSynchronisation  variante `a_envoyer`  INTÉGRÉ, 72 pt
│   │    "1 photo pas encore envoyée. Elle part dès que le réseau revient."
│   │         — le bandeau est ici, pas seulement sur l'écran d'accueil (B6)
│   │
│   ├─ ListePlate  variante `liste`        grille de 3 colonnes, 72 × 72 pt
│   │   ├─ VignettePhoto × n
│   │   │   ├─ [image]       72 × 72 pt, sur --color-surface-sunken
│   │   │   ├─ [etat]        "Pas encore envoyée"  --text-caption
│   │   │   ├─ [horodatage]  "prise 18 h 04" + "confirmée 18 h 11" si elle est partie
│   │   │   └─ [taille]      "2,4 Mo"
│   │   └─ [lignes] Vide variante `aucune_donnee`   si aucune photo
│   │
│   ├─ Bouton lg "Prendre une photo"          60 pt, pleine largeur
│   │      etat `impossible` + bandeau si le stockage est plein
│   │
│   └─ BandeauAlerte  variante `impossible`   CONDITIONNEL (E12)
│        "Pas de place sur cet appareil : 0 Mo libres.
│         Aucune photo n'a pu être écrite."
│
└─ [action] Barre d'action de la feuille, 88 pt
     ├─ Bouton lg "Fermer"
     └─ Bouton secondaire "Tenter l'envoi maintenant"   si ≥ 1 photo en attente
```

| # | Composant | Rôle | Source |
|---|---|---|---|
| 1 | `Feuille` | Le conteneur modal monté du bas | design-system § 3.15 |
| 2 | `BandeauSynchronisation` | Dire où en sont les photos, **sur cet écran aussi** (B6) | design-system § 3.1 |
| 3 | `ListePlate` | Contenir la grille sans carte | design-system § 3.23 |
| 4 | `VignettePhoto` | Montrer un fichier et dire où il en est, avec ses deux horodatages | design-system § 3.27 |
| 5 | `Bouton` | Porter `Prendre une photo` et `Tenter l'envoi maintenant` | design-system § 3.8 |
| 6 | `BandeauAlerte` | Dire l'impossibilité d'écrire un fichier (E12) | design-system § 3.24 |
| 7 | `Vide` | Rendre l'absence de photo avec son libellé écrit | design-system § 3.26 |
| 8 | `MessageBref` | Confirmer la prise d'une photo, en disant où elle est | design-system § 3.25 → `MessageBref` |
| 9 | `Invite` | Rappeler la règle B3 la première fois, et **une seule fois** | design-system § 3.30 |

---

## 4. États — tous, sans exception

| État | Déclencheur | Rendu | Feedback utilisateur |
|---|---|---|---|
| **Chargement** | Ouverture de la feuille, lecture des fichiers locaux | 6 vignettes en ossature de 72 × 72 pt, **avec les lignes d'état en ossature de 14 px en dessous**, pour que la grille ne saute pas à l'arrivée des fichiers. Le `BandeauSynchronisation` rend son état `a_envoyer` local pendant ce temps, **jamais un compte fantôme** | Aucun texte d'attente. Les vignettes locales existent avant tout appel réseau, donc il n'y a rien à attendre du serveur ici |
| **Rempli** | Au moins une photo est attachée au fait | La grille, chaque vignette avec son état, ses horodatages et sa taille | Le bandeau porte le compte des photos en attente |
| **Vide — jamais visité** | Le fait vient d'être créé et n'a aucune photo | `Vide` variante `aucune_donnee` : « Aucune photo. Un fait sans photo se conteste difficilement six mois plus tard. » + le bouton `Prendre une photo`, **déjà présent juste en dessous** | Le bouton est dans le vide **et** dans la barre d'action de la feuille : deux points d'entrée pour un geste unique, parce que c'est le geste le plus important de cet écran |
| **Vide — aucune donnée** | Le fait a existé et toutes ses photos ont été confirmées | La grille est vide et le bandeau rend `rien_a_confirmer`. **Le vide est alors l'état normal et attendu**, donc aucun message de congratulation n'apparaît | Aucun. Rien à annoncer |
| **Erreur de chargement** | La base locale des fichiers est illisible | `Vide` variante `erreur` + `BandeauAlerte` en variante `impossible` : « Impossible de lire les photos de ce fait. Rien n'est affiché — et ce n'est pas vide : on ne sait pas encore. » | **Aucun bouton « Réessayer »** : la reprise est automatique. Le seul geste offert est un `BandeauAlerte` en variante `information` — « La lecture se fera seule dès que le réseau revient. » **L'écart est critique ici** : afficher une grille vide quand la base locale est illisible ferait croire que les photos sont parties |
| **Erreur de soumission** | L'espace disque est insuffisant, ou la photo exceeds une limite de taille | Le bouton passe en `impossible` **avant** l'ouverture de l'appareil photo, et un `BandeauAlerte` en variante `impossible` s'affiche : « Pas de place sur cet appareil : 0 Mo libres. La photo n'a pas pu être écrite. » **Aucun dialogue modal, aucune secousse** | Aucun retour élastique. L'appareil photo **n'est pas ouvert** : on ne fait pas ouvrir un appareil photo pour découvrir ensuite qu'on ne peut rien écrire |
| **Succès** | Une photo est prise, ou le serveur en confirme une | Pour la prise : `MessageBref` variante `fait` — « Photo sur cet appareil, 12/09 · 18 h 04. Pas encore envoyée. » Pour la confirmation : **pas de message bref** — la vignette change d'état d'elle-même et le bandeau se recompose. Une confirmation serveur n'a pas besoin d'être annoncée, elle a besoin d'être **visible** | La vignette passe de `a_confirmer` à `envoyee` : contour ambre 2 px → contour vert-gris 1 px, et la ligne d'état remplace « Sur cet appareil » par « Confirmée le 12 · 18 h 11 ». **Le changement est visible sans être animés au-delà de `--duration-fast`**, parce qu'un changement d'état qui attire l'œil est un changement d'état qu'on remarque |
| **Hors-ligne / permissions** | Mode avion, sous-sol, 4G absente | **La grille s'affiche entièrement depuis l'appareil**, toutes les vignettes en `a_confirm`, et le bandeau rend `hors_ligne` : « Hors-ligne. Tes photos restent sur cet appareil et elles partent seules. » `Prendre une photo` reste **actif** : prendre une photo hors-ligne est le cas normal, pas un mode dégradé | Le mot d'état `a_confirmer` est le seul rendu des photos. **Aucun message d'erreur, aucun bouton désactivé** : il n'y a rien qui ne va pas, il n'y a juste pas encore de réseau |
| **Lecture seule** | Écran verrouillé, ou fait confirmé par le serveur et rectifiable uniquement par procédure | La grille s'affiche en lecture, chaque vignette perd sa zone pressable, et le bouton `Prendre une photo` passe en `impossible` avec l'aide « Ce fait est confirmé par le serveur. Une photo ne peut plus être ajoutée ; demande la rectification du dossier. » | La barre d'action reste présente avec `Fermer` actif. **Seule l'action d'écriture disparaît**, jamais la barre |

---

## 5. Interactions

| Élément | Événement | Comportement | Feedback visuel | État résultant | ID |
|---|---|---|---|---|---|
| `Bouton lg "Prendre une photo"` | tap | Ouvre l'appareil photo. Au retour, le fichier est **écrit sur l'appareil** et la vignette apparaît en `a_confirm`. **L'envoi est tenté ensuite, en arrière-plan, et son résultat ne change rien à ce que l'écran montre** | L'obturateur natif, puis la vignette apparaît **sans animation** avec la mention `Sur cet appareil` | Fichier local, `a_confirmer` | B3, C8 |
| `Bouton lg "Prendre une photo"`, stockage plein | tap | Le bouton est déjà en `impossible` **avant** le tap, avec le bandeau affiché. Le tap ne déclenche rien : il n'y a pas de dialogue d'erreur à afficher parce que l'erreur est déjà à l'écran | Aucun | Aucun fichier créé | E12 |
| `VignettePhoto`, tap | tap | Ouvre l'aperçu **plein écran**, avec les deux horodatages en grand, l'état en mot, et trois actions en barre du bas | Aucun fondu : l'aperçu remplace la feuille, et le retour rend la grille à la position du défilement | Aperçu | B3 |
| `VignettePhoto`, appui long | appui long | Ouvre la `Feuille` de la photo : horodatages, taille, chemin local, et `Reprendre la photo`. **Aucune action d'effacement du fichier** | La feuille monte en 200 ms | Feuille de photo | B18 |
| `Bouton secondaire "Tenter l'envoi maintenant"` | tap | Force une tentative. Le mot est `Tenter`, **jamais** `Envoyer` : la reprise est automatique et « Envoyer » dirait qu'elle ne l'est pas | Les vignettes passent en état `en_cours` — un `ProgressBar` de 2 pt au-dessus, **le libellé ne change pas** | Retour en `a_confirmer` ou `envoyee` | B1, C2 |
| `BandeauSynchronisation` de cette feuille, lien `Voir` | tap | Aucune action : il n'y a rien d'autre à voir, **tout est déjà sur l'écran**. Le lien n'est donc pas rendu ici, et le bandeau rend sa variante `a_envoyer` **sans** le slot `lien_voir` — c'est le seul endroit du produit où ce slot est vide, et c'est justifié | Aucun | — | B6 |
| Grille, défilement | scroll | Défilement natif à trois colonnes. **Pas de pull-to-refresh** : le même motif tactile sert à revenir en arrière, donc le déclencher par accident ferait oublier d'où l'on vient | Défilement natif | Inchangé | — |
| `Bouton lg "Fermer"` | tap | Ferme la feuille. Le fait et ses photos restent, et le bandeau de l'écran parent affiche le compte si une photo est en attente | La feuille descend en 200 ms | Retour au fait ou à la saisie | — |
| Retour arrière système | retour | Ferme la feuille, **sans rien demander et sans rien perdre** | Aucun | Retour | E11 |
| Photo confirmée par le serveur pendant que l'écran est ouvert | réception | La vignette change d'état **sans animation au-delà de 120 ms** et le bandeau se recompose. **Aucun message bref, aucune notification** : l'état est visible, donc il n'a pas besoin d'être annoncé | Contour 1 px vert-gris, ligne d'état remplacée | `envoyee` | B6, X10 |

- **Focus / clavier** : chaque vignette est un focusable unique de 72 × 72 pt, avec un
  `aria-label` qui porte l'état **avant** la date, parce que c'est la première information
  utile. `Tab` parcourt la grille ligne par ligne. `Origine` va à la première photo en
  attente, si elle existe. La barre d'action est la dernière étape de tabulation.
- **Gestes** : **aucun geste porteur.** Pas de swipe pour supprimer une photo, pas de
  long-press pour partager, pas de pincer pour zoomer dans la grille. Le glissement de
  feuille ne fait que fermer. Une photo de dégât qu'un geste involontire supprime est
  irremplaçable, donc le geste de suppression **n'existe pas** (B18) et aucun autre geste
  ne peut l'imiter par accident.
- **Animations** : l'apparition d'une vignette est **instantanée** — une vignette qui glisse
  sous le doigt peut être prise pour un balayage. Le changement d'état d'envoi est en
  `--duration-fast` `--ease-default`, et **rien n'est animé au-delà**, parce que l'état doit
  être lisible pendant qu'il change. `prefers-reduced-motion` met tout à 0 ms.
- **Retour arrière** : ferme la feuille, ne demande rien, ne perd rien.

---

## 6. Responsive

| Breakpoint | Comportement | Ce qui se replie / disparaît |
|---|---|---|
| **Mobile** (0–479 px) | Le layout de référence. Grille de **3 colonnes de 72 × 72 pt**, gouttière `--space-sm`, marges `--space-lg` ; barre d'action de feuille de 88 pt au-dessus du clavier | Rien. À 320 px de large, la grille passe à 3 colonnes de 88 pt et la ligne d'état sous la vignette passe sur **deux lignes** — jamais tronquée |
| **Tablet** (480–899 px) | Grille de **5 colonnes de 96 × 96 pt**, feuille centrée sur 560 pt. L'aperçu plein écran reste identique | Rien. **Le nombre de colonnes est le seul changement** : les vignettes, leurs états et leurs mots sont identiques |
| **Desktop** (900 px et au-delà) | **Aucun rendu distinct.** Grille de 6 colonnes dans une feuille centrée de 720 pt, navigation en bas. X11 exclut la version navigateur de bureau | Rien |

- **Cible tactile** : **72 × 72 pt** pour chaque vignette, ce qui est au-dessus de N3 de
  plus du double. Le bouton `Prendre une photo` fait 60 pt, et l'action de la barre d'action
  52 pt. Le bouton de fermeture de l'aperçu fait 44 pt.
- **Débordement** : (1) La ligne d'état sous une vignette est sur **une ou deux lignes**,
      jamais tronquée : « Sur cet appareil » et « Confirmée le 12 · 18 h 11 » doivent se lire
      en entier. (2) La taille du fichier passe sur une deuxième ligne sous 320 pt. (3) Le
      nom du fichier **n'est jamais affiché** : il peut contenir des espaces, des
      caractères accentués et une longueur arbitraire, et il n'apporte rien que l'image et
      l'état ne disent déjà.
- **Ce qui ne déborde jamais** : la grille elle-même. Le nombre de colonnes est calculé à
  partir de la largeur disponible et de 72 pt, jamais l'inverse — donc aucune vignette n'est
  comprimée pour tenir dans un nombre de colonnes fixe.

---

## 7. Accessibilité

- [ ] **Contraste du texte courant** — mesuré par `design-check contrast`, qui applique
      4,5:1 à chaque encre contre les huit surfaces de son `on:`, dont
      `--color-surface-sunken` sous la vignette et `--color-surface-raised` pour la barre
      d'action. **Aucun ratio n'est écrit ici.**
- [ ] **Contraste des grands textes** — l'aperçu plein écran affiche les horodatages en
      `--text-h4`, classé `text` et mesuré à 4,5:1. Il est donc **au-dessus** du seuil des
      grands caractères et ne s'appuie pas sur l'exception : un horodatage approximatif est
      une preuve approximative.
- [ ] **Navigation clavier complète** — sur clavier externe et sur tous les breakpoints. La
      grille est parcourue ligne par ligne, et la barre d'action est la dernière étape. Le
      bouton en état `impossible` reste **focusable** avec `aria-disabled="true"` : un
      bouton désactivé qu'on ne peut pas atteindre ne peut pas être lu, donc on ne sait pas
      pourquoi il est désactivé.
- [ ] **Focus visible** — anneau `--color-bordure-focus` de 2 px avec 2 px de fond entre
      l'anneau et la vignette. L'anneau est **externe** et ne se confond pas avec le contour
      d'état ambre ou vert-gris : le focus et l'état d'envoi sont deux choses différentes et
      ne doivent pas se ressembler.
- [ ] **ARIA** — la grille est un `role="list"` de vignettes `role="listitem"`. Chaque
      vignette porte un `aria-label` dont **le premier mot est l'état** : « Pas encore
      envoyée, photo du 12 septembre, prise à 18 h 04, sur cet appareil, 2,4 mégaoctets. »
      Le bandeau de cette feuille est `role="status" aria-live="polite"` : il annonce le
      changement d'état des photos **sans interrompre** la lecture.
- [ ] **Alternative textuelle** — l'`alt` d'une vignette **décrit l'état, pas l'image**. Un
      `alt` de type « photo d'une chasse d'eau qui fuit » serait une description, et c'est
      exactement ce que la description visuelle est censée faire pour l'utilisateur qui voit
      l'image ; ce que l'utilisateur de technologies d'assistance n'a pas, c'est
      **l'information que la photo n'est pas partie**. L'`alt` est donc
      « Photo du 12 septembre, sur cet appareil, pas encore envoyée. » L'image **est** en
      outre présentée comme un contenu non textuel accessible au toucher, pour qu'un
      utilisateur qui la voit puisse l'ouvrir.
- [ ] **Langue et direction de lecture** — `lang="fr-FR"`, gauche à droite, heures
      `HH h mm`, tailles en mégaoctets avec une virgule décimale. **Le nom du fichier
      original n'est jamais affiché ni annoncé** : il peut contenir des caractères que la
      voix de synthèse prononce mal, et il n'est lisible que par la personne qui l'a écrit.

---

## 8. Données

| Champ | Type | Origine | Requis | Erreur possible |
|---|---|---|---|---|
| `fichier_id` | identifiant local | créé **à la prise**, avant tout envoi (B3) | oui | Fichier non lisible : `VignettePhoto` en état `illisible`, **compté et envoyé quand même**. Un fichier qu'on ne sait pas afficher n'est pas un fichier absent |
| `etat_envoi` | `a_confirmer` / `envoyee` | local d'abord, confirmé ensuite (C2) | oui | L'état ne peut pas mentir : il est écrit sous la vignette et **jamais déduit de l'existence de l'image** |
| `horodatage_prise` | `JJ/MM · HH h mm` | **horloge de l'appareil**, non modifiable | oui | — |
| `horodatage_confirmation` | `JJ/MM · HH h mm` | **horloge du serveur**, non modifiable | non | Absent tant que non confirmée, et **son absence est l'information**. C'est le seul écart possible entre les deux horodatages, et il est le cœur de B1 |
| `taille` | octets | métadonnée du fichier local | non | Fichier tronqué à l'écriture : l'écriture échoue **entièrement**, aucun fichier partiel n'est créé |
| `fait_id` | identifiant | parent de l'écran | oui | Fait supprimé pendant que la feuille est ouverte : la feuille se ferme, et le `MessageBref` dit « Ce fait n'existe plus. Aucune photo n'a été écrite. » **Aucune photo n'est orpheline** |
| `espace_libre` | octets | état du stockage | oui | Insuffisant : le bouton passe en `impossible` **avant** l'ouverture de l'appareil photo, et le `BandeauAlerte` porte la phrase |
| `tentatives` | entier | local | oui | Trois échecs : l'état `echec_envoi` du bandeau. **Aucun compteur d'échecs n'est affiché à l'utilisateur** — il n'y a pas de bouton de reprise, donc le compte n'appelle à rien |
| `tache_reprise` | booléen | file de reprise automatique (C2) | oui | La tâche est morte avec l'appareil : les écritures non parties meurent avec lui, et l'écran ne prétend jamais le contraire (E2) |

- **Chargement** : **aucun appel réseau au rendu.** Les vignettes sont sur l'appareil, donc
  la grille s'affiche en moins d'une seconde et sans barre de progression. Le seul skeleton
  possible est celui de la lecture de la base locale des fichiers.
- **Cache / hors-ligne** : **c'est le cas normal de cet écran** (N2, C9, E4). La grille
  s'affiche entièrement hors-ligne, les photos restent lisibles et modifiables, et la
  reprise est automatique. Le seul élément qui change hors-ligne est le mot du bandeau.
- **Données sensibles** : une photo de dégât est **une donnée personnelle au sens de C6** :
  exportable avec le dossier du locataire, non effaçable. **Rien n'est journalisé, rien
  n'est envoyé à un tiers** (N8) — pas d'analyse d'image, pas de reconnaissance, pas de
  géolocalisation ajoutée : la photo est **datée par le lieu** parce que l'appareil la date,
  pas parce que Bailly la géolocalise (X6, et l'absence de tout service tiers est N8).

---

## 9. Traçabilité

| ID | Origine | Manifestation sur cet écran |
|---|---|---|
| **B1** | PRD | Les deux horodatages sont **distingués et tous deux affichés** : celui de la prise, celui de la confirmation. Tant que le second est absent, la photo est en `a_confirmer` et l'écran ne dit jamais qu'elle est partie |
| **B2** | PRD | Le bandeau de cette feuille rend `a_envoyer` avec la phrase « 1 photo pas encore envoyée », qui contient le mot du téléphone. Le `MessageBref` de prise dit « Sur cet appareil, 12/09 · 18 h 04. Pas encore envoyée. » |
| **B3** | PRD | Le fichier est **écrit sur l'appareil avant toute tentative réseau**. L'ouverture de l'appareil photo suffit à faire exister le fichier, et la vignette apparaît en `a_confirmer` sans attendre quoi que ce soit. C'est la règle qui justifie l'existence de cette slice comme slice séparée |
| **B4** | PRD | `Reprendre la photo` est disponible tant que le fait est `a_envoyer` : une photo non partie est modifiable. Une photo **confirmée** ne l'est plus, et l'écran le dit en renvoyant à la procédure de rectification |
| **B6** | PRD | Le `BandeauSynchronisation` est **intégré à cet écran**, et non seulement sur l'écran d'accueil. Le compteur de synchronisation est permanent, donc il est permanent partout où des écritures sont en jeu. **C'est le seul écran où le slot `lien_voir` est vide**, et c'est justifié : il n'y a rien d'autre à voir |
| **C2** | PRD | L'ordre est : écriture locale, vérification, envoi. L'interface ne fait **jamais** l'inverse, et ne montre jamais une vignette avant que le fichier soit écrit |
| **C8** | PRD | Aucun envoi n'est annoncé sans confirmation. La vignette ne passe à `envoyee` que sur confirmation serveur, et l'horodatage de confirmation est celui du serveur, pas celui de l'appareil |
| **C9** | PRD | Hors-ligne, l'écran est **identique** : la grille s'affiche, `Prendre une photo` est actif, et le seul mot qui change est celui du bandeau. C'est le cas normal |
| **N1** | PRD | Le rendu de la grille est **local**, donc instantané. Le seul délai de l'écran est celui de l'envoi, et il n'est **jamais** aguardé à l'écran |
| **N2** | PRD | La grille s'affiche sans réseau dès que les fichiers sont sur l'appareil |
| **N3** | PRD | 72 × 72 pt par vignette, 60 pt pour `Prendre une photo`, 52 pt pour les actions de barre, 44 pt pour la fermeture de l'aperçu |
| **N4** | PRD | Aucun texte sous 14 px — les lignes d'état sont **exactement** au plancher du produit, parce que ce sont les lignes qui portent l'information la plus critique |
| **N5** | PRD | Tailles en `rem` suivant le réglage du téléphone, plafonné à ×1,3 : à ×1,3 la ligne d'état passe sur deux lignes et la vignette **grandit**, elle n'est pas rognée |
| **E1** | PRD | Le réseau tombe pendant l'envoi : la vignette **reste** en `a_confirmer`, la reprise est automatique, et **aucun bouton « Réessayer »** n'apparaît. Le seul geste manuel s'appelle `Tenter l'envoi maintenant`, ce qui ne prétend pas que l'automatique est en panne |
| **E4** | PRD | Le propriétaire photographie dans le sous-sol, sort, et l'envoi se réessaie seul. **Rien sur cet écran ne demande d'attendre** : il n'y a pas de barre de progression, pas de compte à rebours, pas d'écran d'attente |
| **E12** | PRD | Le stockage plein est détecté **avant** l'ouverture de l'appareil photo, le bouton passe en `impossible` et la phrase est écrite : « Pas de place sur cet appareil : 0 Mo libres. La photo n'a pas pu être écrite. » **Aucun fichier partiel n'est créé** |

---

## 10. Checklist de gate

- [x] Les 9 états sont décrits avec un rendu concret et des **libellés écrits**.
- [x] L'écran ne montre **jamais** une vignette avant que le fichier soit écrit sur
      l'appareil, et ne montre **jamais** un cadre vide qui pourrait passer pour une photo.
- [x] Un vide n'est jamais un zéro ; l'erreur de lecture locale a un rendu distinct et un
      libellé qui dit explicitement « ce n'est pas vide ».
- [x] Aucun « Réessayer » : la reprise est automatique, et le seul geste manuel est
      `Tenter l'envoi maintenant`.
- [x] Chaque élément interactif a un comportement, un feedback et un état résultant.
- [x] Le responsive est défini aux trois breakpoints, avec le **nombre de colonnes** comme
      seule variable.
- [x] La section Anti-générique est cochée et justifiée avec les valeurs réelles.
- [x] Aucune valeur de design n'est laissée à « à définir ».
- [x] **Aucun ratio de contraste écrit à côté d'une valeur.**
- [x] Chaque ID `B*`, `E*`, `C*` et `N*` de l'écran apparaît en § 9.
- [x] `node "$FORGE/scripts/forge-guard.js" placeholders <anchor>` ne signale rien ici.
- [x] L'écran reste cohérent avec `.forge/design/design-system.md` : le seul écart par
      rapport aux autres écrans est le slot `lien_voir` vide, et il est justifié en § 5.
