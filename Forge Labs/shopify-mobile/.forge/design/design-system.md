---
type: design-system
status: draft
generated_at: 2026-09-30
derived_from: .forge/prd.md
---

# Design system — Onduleur

> Les valeurs sont **écrites en hexadécimal**, et **aucun ratio n'est écrit à côté**.
> Un ratio rédigé à côté d'un hex est un nombre fabriqué : sur un autre projet de ce
> banc d'essai, cinq ratios annoncés étaient faux, et aucun n'était visible à la
> relecture. La mesure est produite par `design-check contrast`, et **le seuil de
> décision lui appartient** — pas à ce document.

## 0.0 Déclaration des classes

<!-- forge:token-classes
text     --color-texte-principal --color-texte-secondaire --color-texte-desactive --color-lien
          --color-succes-fort --color-attention-fort --color-erreur-fort --color-info-fort
on       --color-texte-inverse = --color-encre-700 --color-encre-800
          --color-succes --color-attention --color-erreur --color-info
surface  --color-background --color-surface --color-surface-raised --color-surface-sunken
          --color-succes-doux --color-attention-doux --color-erreur-doux --color-info-doux
nontext  --color-encre-400 --color-encre-500 --color-encre-600 --color-encre-700 --color-encre-800
          --color-bordure-champ --color-bordure-focus
          --color-succes --color-attention --color-erreur --color-info
exempt   --color-encre-50 = teinte de survol, aucun texte n'y est posé
exempt   --color-encre-100 = teinte de survol, aucun texte n'y est posé
exempt   --color-encre-200 = trame d'illustration vide, aucun texte n'y est posé
exempt   --color-encre-300 = icône inerte, jamais seule
exempt   --color-secondaire = filet décoratif, ne porte aucune information
exempt   --color-encre-900 = réservé, non rendu en v1
-->

**Pourquoi cette section existe.** Un contrôle qui devine la classe d'une couleur à
partir de son nom ne fonctionne que dans la langue de ce nom. Les trois signaux
historiques de `design-check` sont des littéraux **anglais** (`--color-text-*`,
`--color-ink-50`, `*-subtle`) : sur un document dont les tokens sont nommés en
français, **tout** tombait sur « composant non textuel » et se jugeait à 3:1. Un
token de texte à 3,80:1 passait alors, et le défaut que le script existe pour
trouver revenait **dans le document qu'il venait de mesurer**.

Le document déclare donc ses classes une fois, et le script mesure. `on:` dit sur
quels fonds un texte est réellement posé — sans quoi un texte inversé, jamais posé
que sur de l'encre, serait mesuré contre le papier et échouerait par construction.
`exempt:` porte une **raison** : une teinte décorative n'est pas un composant
d'interface, et la WCAG 1.4.11 ne s'applique pas à un état de survol.

**Ce que la déclaration engage.** `nontext` doit atteindre 3:1 contre le fond ;
`text` doit atteindre 4,5:1 contre chaque `surface`, et contre chaque fond de son
`on:`. Un token de couleur absent des six listes est signalé : l'engagement est
écrit, donc l'omettre est un choix.

---

## 0. Les trois ancres

| Ancre | Contenu |
|---|---|
| **Références** | **Back Market** — le fond « papier » gris chaud, la tuile produit sans ombre ni bordure, la photo du marchand comme seule image. **Zalando mobile** — la densité de la grille, le prix en chiffres tabulaires qui ne bouge pas, la fiche produit qui tient en un écran. **Apple Wallet** — l'historique comme cœur de l'application, et l'idée d'une donnée rejouée qui **affiche son âge** au lieu de prétendre être fraîche. |
| **Ambiance** | **Chaleureux, dense, sans emphase.** |
| **Anti-références** | **Pas de monochromie teintée de marque** — un fond bleuté et un liseré de la même famille que le bouton d'action feraient d'un produit de réassurance un produit de communication commerciale. **Pas de dégradé sur un composant du premier rendu** — un dégradé est une seconde chose à décoder pendant que l'utilisateur attend, et il est décoratif. **Pas de carte blanche ombrée par produit** — un catalogue de quelques centaines de références en grille de tuiles ombrées n'a aucune hiérarchie. **Pas d'illustration d'appoint** — la fiche montre la photo du marchand ; une illustration de notre main falsifierait une donnée que B6 et B23 nous interdisent de toucher. **Pas de bandeau promotionnel** — la seule information sans origine que nous poussons est un changement d'état de commande ; un bandeau « -20 % » ferait passer une donnée inexistante pour une information. |

**Archétype** : `mobile_consumer`. **Plateforme** : iOS et Android, téléphone seul.
**Boucle** : ouvrir sans compte, retrouver ce que l'on cherche ou ce que l'on a déjà acheté, puis sortir vers le paiement de la boutique.
**Densité** : **dense**. Un client qui ouvre l'application pour « ai-je commandé cette veste l'hiver dernier ? » ne parcourt pas un écran aéré : il compare des dates, des références et des prix.

**Trois choix assumés et contestables** :

1. Une commande livrée depuis plus de 30 jours **n'a aucun bouton d'action**. Un produit sans action occupe une cible tactile et vole le geste au suivant.
2. La progression d'une commande **ne change pas de couleur, elle change de remplissage**. Un arc-en-ciel d'états serait l'élément le plus bruyant d'un écran lu en moins de deux secondes.
3. Le prix s'affiche **en encre, jamais dans la couleur du bouton**. Le prix est une donnée du marchand (B6) ; le colorer comme un argument serait dire au client qu'on le pousse à acheter.

---

## 1. Direction de la couleur

**L'encre est la couleur principale, et le chroma est réservé à l'état.** Une boutique de 2 000 clients gérée par deux personnes n'a pas de charte identifiée derrière laquelle s'abriter ; une couleur d'action saturée ne ferait qu'affirmer une identité inexistente, tout en transformant une donnée du marchand en argument d'achat.

Quatre teintes sémantiques, dépensées uniquement là où elles portent un sens.

### Encre — famille principale

| Token | Valeur | Usage |
|---|---|---|
| `--color-encre-50` | `#EEF1F0` | Fond des pastilles, teinte de survol froide |
| `--color-encre-100` | `#D8DEDC` | Zone de survol sur fond clair |
| `--color-encre-200` | `#B4BEBB` | Trame d'illustration vide, filet de zone inerte |
| `--color-encre-300` | `#8A9895` | Icône inactive (jamais seule) |
| `--color-encre-400` | `#5E706C` | Texte d'appoint sur fond teinté |
| `--color-encre-500` | `#3A4B48` | Icône secondaire, bordure de champ survolée |
| `--color-encre-600` | `#26322F` | Bordure de champ pressée |
| `--color-encre-700` | `#1B2220` | **Bouton d'action, texte inversé, anneau de focus** |
| `--color-encre-800` | `#0F1615` | État pressé du bouton d'action |
| `--color-encre-900` | `#080C0C` | Réservé |

### Surfaces — papier chaud, jamais blanc pur

| Token | Valeur | Usage |
|---|---|---|
| `--color-background` | `#F1EDE5` | Papier de page : le ton chaud sépare la photo du marchand de l'interface |
| `--color-surface` | `#FBF8F2` | Feuille produit, feuille modale, barre flottante |
| `--color-surface-raised` | `#FFFDF8` | Bottom sheet, seul niveau réellement surélevé |
| `--color-surface-sunken` | `#E7E2D7` | Champ de saisie, zone enfoncée |

### Texte

| Token | Valeur | Usage |
|---|---|---|
| `--color-texte-principal` | `#161A19` | Tout texte que l'utilisateur doit lire pour agir |
| `--color-texte-secondaire` | `#5A544A` | Légendes, dates, quantités |
| `--color-texte-desactive` | `#665E4E` | **Usage restreint** : sur `--color-background` ou `--color-surface` uniquement, jamais sur un fond rempli |
| `--color-texte-inverse` | `#FBF8F2` | Sur encre et sur les quatre teintes sémantiques |
| `--color-lien` | `#1E4A45` | Lien textuel, identifiable par le soulignement, jamais par la couleur seule |

> **La valeur de `--color-texte-desactive` a été descendue après mesure.** Elle était à
> 3,80:1 sur `--color-surface-sunken`, donc **sous le seuil de texte**, et le contrôle
> ne l'avait pas vu : il classait ce token `non_text` et le jugeait à 3:1. C'est
> exactement le défaut que le contrôle a été écrit pour trouver — `--color-text-secondary`
> à 4,17:1 sur Amberline — reproduit dans le document qu'il venait de mesurer.
> Un contraste à 0,30 du seuil n'est pas un défaut mineur : c'est du texte illisible.
> Il est corrigé par la **valeur**, pas par une exemption, qui l'aurait rendu
> invisible au lieu de le résoudre.
>
> Un contrôle désactivé n'est donc **jamais** rendu par un texte éclairci : il perd
> son remplissage et passe en `--color-texte-secondaire`, et **la raison de
> l'indisponibilité est écrite à côté en clair**. Un utilisateur qui grossit sa
> police doit pouvoir comprendre *pourquoi* un bouton est mort.

### Sémantique — quatre teintes, quatre sens

| Token | Valeur | Usage |
|---|---|---|
| `--color-succes` | `#2A6349` | Réassort disponible (E4 : une alerte de stock n'est pas une information que quelqu'un écrit) |
| `--color-succes-doux` | `#E2EEE7` | Fond teinté de pastille |
| `--color-succes-fort` | `#1E4A36` | Libellé de pastille, posé sur fond clair |
| `--color-attention` | `#7A5A0C` | Date limite de retour qui approche, stock bas, consentement à révoquer |
| `--color-attention-doux` | `#F6EBD2` | Fond teinté de pastille |
| `--color-attention-fort` | `#6B4E08` | Libellé de pastille, posé sur fond clair |
| `--color-erreur` | `#A03427` | Rupture de stock, échec de saisie, action refusée |
| `--color-erreur-doux` | `#F7E4E0` | Fond teinté de pastille |
| `--color-erreur-fort` | `#8E2B1F` | Libellé de pastille, posé sur fond clair |
| `--color-info` | `#2A5470` | **Réservé au système** : âge du cache, « indisponible pour le moment », correspondance échouée |
| `--color-info-doux` | `#E3EDF3` | Fond teinté de pastille |
| `--color-info-fort` | `#24455C` | Libellé de pastille, posé sur fond clair |

> **`--color-info` ne sert qu'aux messages du système.** Il n'habille jamais un produit, jamais un prix, jamais un rail. C'est la garantie mécanique qu'un client ne confondra jamais « votre commande a changé d'état » avec une promotion.
>
> **Les quatre paires `-doux` / `-fort` étaient annoncées et n'existaient pas.** La
> section « paires que le script doit mesurer » promettait « pastille de statut
> (fond teinté + texte forte) pour les quatre teintes » : le contrôle ne l'aurait
> pas pu, faute de fond teinté dans le document. C'est la troisième fois dans ce
> dossier qu'un document **annonce une vérification qu'il n'a pas rendue possible**,
> et la réponse n'est pas de retirer l'annonce — c'est d'ajouter ce qui la rend
> vérifiable.

### Secondaire, bordures, ombres

| Token | Valeur | Raison |
|---|---|---|
| `--color-secondaire` | `#D9D2C4` | Le séparateur du système est un **filet**, pas une carte et pas une ombre. Il ne porte aucune information. |
| `--color-bordure-champ` | `#847C6B` | Seul filet tenu au seuil des éléments non textuels. |
| `--color-bordure-focus` | `#1B2220` | Anneau de focus, **jamais** un changement de couleur de bordure : invisible sur un fond rempli. |
| `--shadow-none` | `none` | Le défaut. Un élément au repos n'a pas d'ombre. |
| `--shadow-flottant` | `0 -1px 0 #16141214, 0 8px 24px #1614121F` | **La seule ombre au repos du système.** |

### Paires que le script doit mesurer, dans cet ordre

Texte principal sur `background` / `surface` / `surface-raised` / `surface-sunken` · texte secondaire sur les quatre · texte désactivé sur `background` et `surface` seulement · texte inversé sur `encre-700`, `encre-800`, `succes`, `attention`, `erreur`, `info` · lien sur `background`, `surface`, `surface-sunken` · `bordure-champ` sur `background` au seuil non textuel · `bordure-focus` sur `background` et `surface-sunken` · pastille de statut (fond teinté + texte forte) pour les quatre teintes.

**Le seuil de décision et le verdict sont rendus par le script, pas par ce document.**

---

## 2. Typographie

**Police système, et c'est un choix de performance** : une police web est une requête réseau sur le chemin critique d'un rendu sous deux secondes (C6), et elle n'est pas disponible hors connexion alors que la fiche produit doit s'ouvrir hors ligne avec son âge (B19). iOS : SF Pro. Android : Roboto. Données non proportionnelles : SF Mono / Roboto Mono.

| Token | Taille / line-height | Graisse | Usage |
|---|---|---|---|
| `--text-display` | `30 / 36` | `700`, interlettrage `-0.4px` | Titre d'écran, nombre de commande |
| `--text-h2` | `24 / 30` | `700` | Titre de rail, de feuille |
| `--text-h3` | `20 / 26` | `700` | Titre de groupe, nom de produit |
| `--text-h4` | `18 / 24` | `700` | Sous-titre de fiche |
| `--text-body` | `17 / 25` | `400` | **Plancher du texte courant** |
| `--text-body-sm` | `16 / 23` | `400` | Secondaire lisible, description de fiche |
| `--text-caption` | `14 / 19` | `500` | **Plancher absolu** : dates, quantités, âge du cache |
| `--text-overline` | `12 / 16` | `700`, interlettrage `+0.8px` | Étiquette de catégorie **uniquement** |

> **L'échelle n'est pas uniforme, et c'est délibéré.** Les pas de tête (`30 → 24 → 20`) sont larges, pour qu'un titre d'écran ne puisse pas être confondu avec un titre de section ; le bas de l'échelle se resserre (`17 → 16 → 14 → 12`), parce qu'un pas de 1,5 pt sur du 12 pt est illisible. Le 12 px est réservé à une étiquette non informative : **aucune information ne lui est confiée seule.**

> **Le réglage système est une contrainte de conception, pas une préférence.** Aucun conteneur de texte n'a de hauteur fixe. Aucun composant ne désactive le redimensionnement de la police. Les cibles tactiles ne rétrécissent pas quand la police grandit : elles grandissent. C'est le sens littéral de E3.

---

## 3. Espacements, durées, formats

| Token | Valeur | Usage |
|---|---|---|
| `--space-2xs` | `2px` | Ajustement d'alignement interne |
| `--space-xs` | `4px` | Icône et texte dans une pastille |
| `--space-sm` | `8px` | Écart dans un bouton, entre deux métadonnées |
| `--space-md` | `16px` | **Gouttière de la grille produit**, padding de ligne de liste |
| `--space-lg` | `24px` | Entre deux rails, padding de feuille |
| `--space-xl` | `32px` | Séparation de groupe dans un écran long |
| `--space-2xl` | `48px` | Marge basse, avant la barre d'onglets |
| `--duration-fast` | `120ms` | Survol, focus, appui |
| `--duration-normal` | `200ms` | Ouverture de feuille, apparition de barre de panier |
| `--duration-slow` | `320ms` | **Réservé aux transitions de retour arrière** |
| `--format-320` | `320 × 568` | **Seul format de référence en largeur** (C10 exclut tablette et web) |

> **Aucune animation ne précède la première donnée utile.** `--duration-slow` n'est jamais appliqué au contenu du premier rendu : sur une 4G bridée, un fondu de 320 ms est une seconde d'écran vide. Les rails **se remplissent**, ils n'apparaissent pas. Et toute durée tombe à zéro si le système demande une réduction des animations.

---

## 4. Navigation

| Module | Fréquence | Centralité | Rang | Justification |
|---|---|---|---|---|
| Accueil | 5 | 4 | 1 | Seul écran atteignable sans compte, et B9 y garantit trois rails : le seul qui ouvre la boucle pour un client qui n'a jamais commandé. |
| Recherche | 4 | 3 | 2 | Retrouver une référence précise est le besoin décisif du client fidèle, mais le catalogue reste atteignable par les rails : elle ne conditionne aucune autre tâche. |
| Commandes | 2 | 5 | 3 | C'est la raison de venir et elle bloque US-2, US-3, US-7, US-9 et US-10, mais sa fréquence est bisannuelle et **non mesurée** (R6) : le rang 3 est une **borne basse déclarée**, pas une mesure. |
| Compte | 2 | 1 | 4 | Elle ne porte aucune boucle mais c'est la seule porte d'entrée de la création de compte, du consentement révocable (C9) et de la suppression (E5) : c'est de l'accès, pas de la configuration. |

**Fragilité signalée, pas contournée.** Le rang 3 de Commandes repose sur une note qui vient de R6, déclarée non mesurée. Si Q4 révèle plus de deux achats par an, Commandes passe au rang 2. **Le PRD n'a écrit la bascule que dans un sens** (Recherche passe derrière Commandes) : la bascule Accueil ↔ Commandes est un **trou du PRD**, à remonter au `product-analyst`, pas à trancher ici.

**Ce qui n'occupe pas d'onglet** : le Panier (barre persistante au-dessus de la barre d'onglets), les Notifications (cloche dans l'en-tête de Commandes), les Favoris (fiche produit + section du Compte), les Adresses et le Retour (Compte et fiche de commande).

**Écarts assumés vis-à-vis de `mobile_consumer`** : la **création** est écartée (PRD § 7, aucun contenu créé par le client) et les **notifications** sont écartées **comme onglet** (PRD § 7, portées par une cloche).

---

## 5. Composants primitifs

> Le nom de l'union qui rend ces états est `À DÉCIDER EN PHASE 4` : c'est du vocabulaire d'architecture, et l'écrire ici inventerait une frontière. Ce que ce document fixe, c'est qu'**aucun de ces états ne peut résulter en « ne rien rendre »**.

### Bouton

Déclenche une action immédiate dont le résultat est visible sur place. Tailles : `sm` hauteur `40px` · `md` `48px` · `lg` `56px`. **Aucune zone tactile inférieure à 44 pt.**

| Variante | Fond | Texte |
|---|---|---|
| `primaire` | `--color-encre-700` | `--color-texte-inverse` |
| `secondaire` | `--color-surface` + filet `--color-encre-500` | `--color-texte-principal` |
| `fantome` | transparent | `--color-texte-principal` |
| `danger` | `--color-erreur` | `--color-texte-inverse` |

**États** — rendus par l'union `À DÉCIDER EN PHASE 4`, sauf `hover`, `active` et `focus` qui sont des états d'interaction :

| État | Rendu |
|---|---|
| `defaut` | Comme la variante |
| `hover` | `--color-encre-600` · `secondaire` : fond `--color-encre-50` · `fantome` : fond `--color-surface-sunken` |
| `active` | `--color-encre-800` · `secondaire` et `fantome` : fond `--color-surface-sunken` |
| `focus` | **Anneau de 2 px en décalage de 2 px**, couleur `--color-bordure-focus`, sur les quatre variantes — jamais un changement de couleur de bordure |
| `desactive` | Fond `--color-surface-sunken`, texte `--color-texte-secondaire`, aucune ombre, et **la raison écrite à côté en clair** |
| `chargement` | Libellé remplacé par un indicateur, **largeur du bouton inchangée**, libellé conservé en accessibilité |

**Slots** : `icone-gauche` (option) · `libelle` (requis) · `icone-droite` (option, réservée à « Payer sur la boutique » qui nomme sa destination).

**`erreur` n'existe pas sur le bouton.** Une erreur est une propriété de l'opération, pas du bouton : elle se rend par l'encart d'état, jamais en repeignant le bouton.

### Champ de saisie

| État | Rendu |
|---|---|
| `defaut` | Fond `--color-surface-sunken`, filet `--color-bordure-champ`, étiquette en `--text-caption` |
| `hover` | Filet `--color-encre-500` |
| `active` / `focus` | Filet `--color-encre-600` + anneau `--color-bordure-focus` de 2 px, hauteur inchangée |
| `desactive` | Fond `--color-surface-sunken`, texte `--color-texte-secondaire`, étiquette conservée |
| `chargement` | Champ gelé, indicateur à droite, **saisie conservée** |
| `erreur` | Filet `--color-erreur` de 2 px, message d'action en dessous : ce que vous avez tapé, pourquoi c'est refusé, comment corriger. **Jamais la couleur seule.** |

Validation au blur, pas au submit. Un champ qui perd son contenu à l'erreur est interdit.

### Tuile produit

La primitive la plus utilisée de l'application, donc celle qui décide de sa densité. **Sans carte** : la gouttière de 16 px est la séparation.

**États** — rendus par l'union `À DÉCIDER EN PHASE 4`, sauf `hover` et `focus` :

| État | Rendu |
|---|---|
| `defaut` | Photo 1:1 sur `--color-background`, titre `--text-h3`, prix en encre, chiffres tabulaires. Aucune bordure, aucune ombre, aucun fond de carte. |
| `focus` | Anneau de 2 px sur le pourtour de la **photo**, pas de la tuile entière |
| `chargement` | La photo seule a un squelette ; **titre et prix s'affichent dès qu'ils sont là** (B8) |
| `rupture` | Pastille `--color-erreur` sur la photo, libellé « Épuisé », **la tuile reste navigable** |
| `reassort` | Pastille `--color-succes` « Réapprovisionné », libellé seul, sans date |
| `hors-ligne` | Photo et texte conservés, bandeau `--color-info` « Affiché hors ligne — il y a X h », **aucune action d'écriture proposée** (B19, E6) |
| `indisponible` | Pastille `--color-info` « Indisponible pour le moment » + action de réessai (C7) |

**`desactive` n'existe pas** : un produit n'est pas désactivable. Un produit en rupture reste tappable — il informe.

### Ligne de commande

Une commande entière sur une seule ligne dense de 56 pt : référence, date, articles, statut, et les deux dates de B13.

**États** — rendus par l'union `À DÉCIDER EN PHASE 4`, sauf `hover` et `focus` :

| État | Rendu |
|---|---|
| `defaut` | Bloc continu sur `--color-background`, séparé par un filet `--color-secondaire`. **Le prix est en encre, jamais dans la couleur du bouton** (B6). |
| `focus` | Fond `--color-surface-sunken` + filet gauche de 3 px en `--color-encre-700` |
| `chargement` | Squelette de la ligne entière, hauteur fixe 56 pt, **jamais une page de squelettes** |
| `erreur` | Ligne remplacée par l'élément de liste en état `indisponible` |
| `commandee` | Contour seul, teinte de statut |
| `preparation` | Fond teinté, teinte de statut |
| `expediee` | Fond plein, teinte de statut |
| `livree` | Fond plein, teinte de statut, **aucun bouton** : hauteur réduite, aucune cible tactile morte |

> **B13, non négociable** : la date de livraison et la date limite de retour s'affichent **ensemble, ou aucune des deux**. Le composant n'a pas d'état « une date seulement ».

### Panneau d'état

**La primitive la plus importante du produit.** C7 et B10 en font une obligation. Chaque variante est un composant distinct, pas un message à paramétrer. **Aucun ne porte d'illustration** : ils portent une phrase, parce qu'un dessin ne peut pas dire « vos commandes n'ont pas été effacées ».

| Variante | Contenu — libellés écrits | Action |
|---|---|---|
| `aucune-donnee` | « Aucune commande pour le moment. Dès que vous commandez, elle apparaîtra ici. » | « Voir mes commandes sur la boutique » — **jamais** « Réessayer », jamais un compteur à 0 |
| `indisponible` | « Indisponible pour le moment. Vos commandes n'ont pas été effacées. » | « Réessayer » (B7) |
| `hors-ligne` | « Affiché hors ligne. Dernière mise à jour il y a X h. » | « Réessayer » |
| `acces-refuse` | « Confirmez l'adresse e-mail de votre compte pour voir vos commandes. » | « Confirmer mon adresse » — **fail-closed** |
| `correspondance-echouee` | « Aucune commande trouvée à cette adresse. » + « 2 tentatives sur 3 » | « Vérifier une autre adresse » — au-delà de 3, le compteur **et** le lien disparaissent (B5) |
| `introuvable` | « Cette commande n'est plus disponible. » | « Retour à mes commandes » |

**États de rendu** — `defaut` et `focus` (focus : filet gauche de 3 px en `--color-encre-700`).

### Barre d'onglets, barre de panier, pastille, encart, feuille, squelette

| Composant | États notables | Règle |
|---|---|---|
| **Barre d'onglets** (4 items) | `defaut` texte `--color-texte-secondaire` · `actif` texte `--color-texte-principal` + **soulignement de 3 px en encre-700**, 44 pt de haut | Séparée du contenu par un **filet**, pas par une ombre au repos |
| **Barre de panier** | `vide` absente · `remplie` fond `--color-surface` + filet · `indisponible` texte `--color-info`, sortie vers le paiement désactivée **avec raison écrite** (E11) | Elle **pousse** le contenu, elle ne le recouvre pas : un bouton masqué viole E3 |
| **Pastille de statut** | `contour` · `teinte` · `pleine` | Jamais de couleur seule : **pastille + libellé**, toujours |
| **Encart** | `info` · `attention` · `erreur` · `hors-ligne` | Fond teinté + filet gauche de 3 px + icône + phrase + action, **sous** le contenu qu'il concerne, jamais en bandeau pleine page |
| **Feuille modale** | `ferme` · `ouvert` `--color-surface-raised` · `glissement` · `confirmation` (récapitulatif avant la sortie vers le paiement) · `erreur` (panier non relu, E11) | Retour arrière ferme la feuille. Aucun piège tactile. |
| **Squelette** | `photo` · `texte` · `ligne` | **Jamais de squelette pleine page** (B8). Hauteur réelle, durée bornée. |
| **Puce / filtre** (V1) | `defaut` · `selectionnee` · `pressee` | 44 pt de haut, état sélectionné porté par le fond **et** un crochet |
| **Interrupteur** (consentements, C9) | `accorde` · `revocable` · `desaccorde` | La révocation prend effet **immédiatement** ; l'état « révocable en attente » n'existe pas (E10) |

### Ce qui n'existe pas, et pourquoi

Pas d'avatar, pas de fil, pas de carte produit ombrée, pas d'illustration d'état, pas de thème sombre. Le thème sombre est **exclu de la v1** : c'est une seconde palette à vérifier contraste par contraste, et C14 dit que la ressource rare est le temps de deux personnes. Une seule palette, vérifiée une fois, vaut mieux que deux dont une est approximative.

---

## 6. Points à décider en Phase 4

| # | Point | Pourquoi ce n'est pas ici |
|---|---|---|
| 1 | **Nom de l'union des états de lecture** qui rend les états listés ci-dessus | Vocabulaire d'architecture. Sans lui, aucun contrôle ne peut dire si un état déclaré ici a un rendu, et un contrôle qui le devinerait produirait des signalements impossibles à fermer. |
| 2 | **Le système de styles** qui porte ces tokens | Aucun impact sur les valeurs : un changement de bibliothèque ne déplace pas un hex. |
| 3 | **La bibliothèque de composants UI** et le jeu d'icônes | Ce qui est fixé ici est le *contrat* : trait de 1,5 px, icône de 20 px dans une zone de 44 pt, **aucun contrôle sans libellé**. Le jeu est un achat. |
| 4 | **Substitution de `--color-encre-*` par la couleur de marque** | La règle est prête (elle ne remplace que cette famille, jamais les quatre teintes sémantiques) mais la charte n'existe pas : personne ne l'a demandée au marchand. |
| 5 | **Survie du panier avant la sortie vers le paiement (Q2)** | Le composant a les deux rendus, mais lequel s'affiche dépend de la réponse du marchand. |
| 6 | **Rendu du retour produit (Q1)** et formulation exacte de la limite (B13) | Le libellé et la procédure relèvent du marchand. |
| 7 | **La bascule Accueil ↔ Commandes** que le PRD n'a pas écrite | Ce n'est pas une question de Phase 4 : c'est un **trou du PRD** (§ 8 n'écrit la bascule que dans un sens). |

---

## Checklist de gate

- [ ] Toute décision de design est actionnable et justifiée.
- [ ] Les trois ancres sont fixées.
- [ ] L'ordre de navigation est justifié par fréquence × centralité, et son point fragile est signalé.
- [ ] Les tokens ont des **valeurs concrètes** — aucun « à définir plus tard ».
- [ ] **Aucun ratio de contraste n'est écrit** : la mesure vient du script.
- [ ] Chaque composant a ses états vides et d'erreur (C7, B10).
- [ ] Les cibles tactiles font au moins 44 pt, et ne rétrécissent pas quand la police grandit.
- [ ] Les écarts à l'archétype sont **écrits** avec leur raison.

**Statut** : `draft` → en attente de validation.
