---
type: screen
slug: commandes
title: Liste des commandes
module: commandes
status: draft
generated_at: 2026-09-30
derived_from:
  - .forge/prd.md
  - .forge/design/design-system.md
rule_ids: [B2, B4, B7, B13]
edge_case_ids: [E1]
flow: historique
---

# Écran — Liste des commandes

> Ce document est la **source de vérité** pour qu'une IA génère l'interface de cet écran.
> Il est généré depuis ce gabarit, jamais recopié. Aucun `{{PLACEHOLDER}}` ne doit subsister.

---

## 1. Rôle de l'écran

| | |
|---|---|
| **Archétype d'app** | `mobile_consumer` — téléphone seul, iOS et Android, un seul marché (C10) |
| **Module** | `commandes` — rang **3** dans la navigation, **borne basse déclarée** |
| **Route** | `/commandes` |
| **Type** | page — onglet racine du module Commandes |
| **Utilisateurs** | Le client fidèle et le client occasionnel qui a un compte. Un compte créé sans correspondance confirmée voit un écran d'accès refusé, **jamais** une liste |
| **User stories servies** | US-2 |
| **Règles métier** | B2, B4, B7, B13 |
| **Edge cases** | E1 |

**Une phrase** : cet écran permet au client de relire ce qu'il a acheté chez ce marchand, avec ses dates, afin de savoir s'il a déjà payé pour un article et jusqu'où il peut encore le rendre.

**Pourquoi il est au rang 3 de la navigation, et pourquoi c'est un problème que l'écran doit porter.** Le design system §4 le classe fréquence 2, centralité 5, et écrit noir sur blanc que ce rang 3 est une **borne basse déclarée**, pas une mesure : sa note vient de R6, « fréquence d'achat annuelle moyenne par client », que le PRD déclare lui-même non mesurée. La règle dit aussi que le PRD n'a écrit la bascule que dans un seul sens — Recherche passe derrière Commandes si les 12 % ne sont pas atteints — et que la bascule Accueil ↔ Commandes est **un trou du PRD**, à remonter au `product-analyst`. Le design ne tranche pas ce trou et ne prétend pas le mesurer.

Ce que le design **peut** faire, c'est ne pas laisser le rang se lire à l'écran. Trois décisions, et elles portent la contradiction jusqu'au bout :

1. **L'onglet affiche un compte, une date et une somme.** « Commandes » avec un badge « 2 » serait un onglet d'inventaire ; c'est un onglet qui montre ce que la personne a payé.
2. **Le premier rendu est une liste dense de 56 pt, pas un en-tête de compte.** Les quatre onglets n'ont pas le même poids visuel, parce que les trois autres ne portent pas de données personnelles.
3. **Le lien d'entrée principal vers cet écran n'est pas la barre d'onglets.** La `Fiche du client` de `/` y mène, et **la confirmation d'e-mail y mène en cas de correspondance réussie** : le seul moment où un compte est créé, le destination est l'historique. C'est la seule manière, sans changer le nombre d'onglets — décision d'architecture, pas de design (PRD §8) — de faire du rang 3 le point d'arrivée du parcours le plus rare et le plus décisif.

**Ce que cet écran n'est pas** : un suivi de commande. US-3 est hors du MVP (roadmap §2.2), donc il n'y a **ni frise d'avancement, ni date estimée, ni suivi de colis**. La ligne porte l'état renvoyé par la source et les deux dates de B13, rien de plus.

---

## 2. Direction visuelle de cet écran

Repris du design system — **valeurs concrètes, jamais « à définir »**.

| | |
|---|---|
| **Mood** | « chaleureux, dense, sans emphase » — repris du design system §0 |
| **Densité** | **la plus dense de l'application** — c'est l'écran du besoin décisif : « ai-je commandé cette veste l'hiver dernier ? ». La réponse se lit en comparant des **dates**, des **références** et des **prix**. Une ligne de commande fait 56 pt ; à 320 px de large, six à sept lignes tiennent dans un écran, et c'est exactement ce qu'il faut pour juger « l'hiver dernier » |
| **Niveau de contraste** | **fort** — la liste est posée directement sur le papier `#F1EDE5`, sans carte, sans ombre, sans fond de ligne. Le seul changement de fond est celui des lignes dont l'état de commande est actif (`Ligne de commande` : `preparation` et `expediee` portent un fond de teinte de statut) — et il porte un sens, il n'est pas décoratif |
| **Surface** | `--color-background #F1EDE5` pour la liste ; `--color-surface #FBF8F2` pour l'en-tête d'une ligne à `--text-h3` ; `--color-surface #FBF8F2` aussi pour le `Panneau d'état` d'accès refusé, qui est la seule exception de cet écran |
| **Accent utilisé** | `--color-encre-700 #1B2220` au fil gauche de la ligne focalisée et au texte de la référence de commande ; **`Pastille de statut`** en teinte de commande — `commandee` en contour, `preparation` en teinte, `expediee` pleine, `livree` pleine sans action (design system §5 Ligne de commande). Le prix reste **en encre**, jamais dans la couleur du bouton (design system §0, choix assumé n° 3) |
| **Traitement photographique** | **aucune photographie sur cet écran.** Les vignettes d'articles d'une commande prennent une place et une requête pour une information que la référence et le prix donnent déjà. La ligne est une ligne de données |
| **Référence** | Apple Wallet pour l'historique comme cœur de l'application ; Zalando mobile pour la densité de ligne à deux niveaux |

### 2.1 Anti-générique — obligatoire

- [x] Pas de fond **blanc pur** — le papier `#F1EDE5`, la feuille `#FBF8F2` pour l'état d'accès refusé. Aucun blanc nulle part.
- [x] **Pas de carte ombrée pour tout** — c'est la contrainte la plus facile à violer sur cet écran, parce que « liste de commandes » appelle la carte. Ici : **aucune carte, aucune ombre, aucun fond de ligne**. La séparation est un filet `--color-secondaire #D9D2C4`, la hiérarchie vient d'un rapport de `--text-h3 20/26` à `--text-caption 14/19` à l'intérieur de la même ligne de 56 pt.
- [x] **Pas d'uniformité** : référence en `--text-h3 700`, date et montant en `--text-body-sm`, statut en pastille `--text-caption 700`, les deux dates de B13 en `--text-caption`. Le pas 20 → 16 → 14 sur une seule ligne est plus serré qu'ailleurs dans l'application, et c'est ce qui permet de tenir 56 pt sans sacrifier la lisibilité.
- [x] **Pas de gris neutre générique** — la teinte de statut d'une commande est un des quatre tons sémantiques du design system, pas un gris : `commandee` en contour neutre, `preparation` en teinte d'attention ou de succès, `expediee` pleine, `livree` pleine. Aucune commande n'est rendue en gris neutre générique.
- [x] **Pas de mise en page centrée symétrique** — une ligne de commande est **une grille à trois colonnes** : référence et statut à gauche, dates au centre, montant à droite. Le montant est aligné à droite en chiffres tabulaires, les dates alignées à gauche : l'œil suit deux axes et un seul est monetario.
- [x] **Pas d'illustration d'appoint générique** — aucun état de cet écran n'a d'illustration, et le design system l'interdit pour le `Panneau d'état` : « un dessin ne peut pas dire "vos commandes n'ont pas été effacées" ». L'accès refusé est une phrase et une action.
- [x] **Pas d'une seule famille de police** — références de commande, montants et les deux dates passent en SF Mono / Roboto Mono, chiffres tabulaires. C'est la seule garantie qu'une référence de commande soit lisible caractère par caractère au téléphone, et qu'une colonne de montants soit alignée.

**Choix assumé et non neutre** : **la commande la plus récente n'est ni développée, ni mise en avant, ni colorée.** Toutes les lignes font 56 pt, strictement identiques. La raison est le besoin lui-même : le client compare « l'hiver dernier » avec « l'année dernière », et une ligne mise en avant crée un point de fixation qui l'empêche de comparer. La hiérarchie de cet écran se construit par la **densité** et non par l'accentuation — c'est l'inverse de la règle habituelle, et c'est ce qui rend la liste comparable. La seule ligne qui a un fond de teinte est celle dont l'état de commande est actif, et sa teinte porte une information, pas une position.

**Second choix, contestable** : **le titre de l'écran ne porte aucun compteur.** Ni « Commandes (2) », ni « 2 commandes », ni « Aucune » dans le titre. Le compteur est dans la liste, et `aucune-donnee` l'interdit à zéro (C7). Le titre est `--text-display 30/36` et il est suivi d'une seule ligne de contexte : l'adresse e-mail confirmée, en `--text-caption`, qui est la preuve visible que l'écran n'est ouvert que parce que la confirmation a eu lieu (B2).

---

## 3. Anatomie

```
Écran "/commandes" — onglet
├─ Titre d'écran — "Commandes" --text-display 30/36
├─ Ligne de contexte — adresse e-mail confirmée, --text-caption  (preuve de B2)
├─ Séparateur --color-secondaire
├─ Liste des commandes — une Ligne de commande par commande, 56 pt
│    └─ Ligne de commande
│         ├─ Colonne gauche  — référence --text-h3 mono · Pastille de statut (libellé de la source)
│         ├─ Colonne centre  — date de commande --text-body-sm
│         │                   + les DEUX dates de B13, ensemble ou aucune
│         └─ Colonne droite  — montant --text-body mono aligné à droite
│                              + bouton d'action, ou rien si livrée depuis plus de 30 jours
├─ Encart d'indisponibilité — affiché au-dessus d'une ligne, pas à la place d'une liste
└─ Barre d'onglets (4 items, commandes actif) — cloche de notification à gauche du titre
```

| # | Composant | Rôle | Source |
|---|---|---|---|
| 1 | Ligne de commande | Une commande entière sur 56 pt, y compris les deux dates de B13 | design-system §5 |
| 2 | Pastille de statut | État de la commande, libellé de la source, teinte de statut selon l'état | design-system §5 |
| 3 | Panneau d'état | Les six variantes : `aucune-donnee`, `indisponible`, `hors-ligne`, `acces-refuse`, `correspondance-echouee`, `introuvable` | design-system §5 |
| 4 | Encart | Porter la raison d'une ligne qui n'a pas pu être relue, sans remplacer les autres | design-system §5 |
| 5 | Barre d'onglets | Navigation ; son emplacement accueille la cloche, qui n'est pas un onglet | design-system §5 |
| 6 | Ligne de contexte | L'adresse confirmée, preuve que l'historique est ouvert | slice-local |

**La cloche** : le design system §4 la place dans l'en-tête de Commandes. Au MVP, US-8 est hors périmètre (roadmap §2.2) : **la cloche n'est donc pas rendue**. Elle reviendra avec la publication native de V2, où elle ouvrira une commande. Rendre une cloche qui n'ouvre rien serait un écran vide et un cul-de-sac — exactement l'écart que le PRD §7 assume.

---

## 4. États — tous, sans exception

| État | Déclencheur | Rendu | Feedback utilisateur |
|---|---|---|---|
| **Chargement** | Ouverture de l'onglet, liste en cours de lecture | **Jamais une page de squelettes (B8).** Le titre, la ligne de contexte et les séparateurs sont du texte local. **Trois à cinq lignes de commande squelettées à hauteur fixe de 56 pt**, puis les vraies lignes remplacent les squelettes au fil de l'arrivée, sans saut de hauteur. Le titre d'un état vide ne clignote pas | Aucun indicateur global. L'en-tête reste stable pendant que le corps se remplit : un titre qui bouge pendant le chargement fait perdre la ligne qu'on était en train de lire |
| **Rempli** | Au moins une commande, correspondance confirmée | Liste triée par date décroissante, lignes de 56 pt identiques | Aucun. La ligne elle-même est le retour |
| **Vide — jamais visité** | Aucun compte, aucune session | `Panneau d'état · acces-refuse`, sur la feuille `--color-surface`, avec le libellé écrit du design system §5 : « Confirmez l'adresse e-mail de votre compte pour voir vos commandes. » Action « Confirmer mon adresse ». **Le catalogue reste une destination à un geste** : un lien secondaire « Parcourir le catalogue » vers `/` | Aucun bandeau de connexion, aucun champ e-mail posé sur cet écran. B2 impose que rien ne s'affiche avant la confirmation, donc **aucune donnée de commande n'est même demandée** — ni nom, ni code postal, ni montant, ni date (B4) |
| **Vide — aucune donnée** | Correspondance confirmée, **aucune commande trouvée** | `Panneau d'état · aucune-donnee` avec le libellé écrit du design system §5 : « Aucune commande pour le moment. Dès que vous commandez, elle apparaîtra ici. » Action « Voir mes commandes sur la boutique ». **Aucun compteur à 0, aucun mot « Réessayer », aucune icône, aucun dessin** | Aucun. C'est un fait, pas une panne, et il est formulé en mots parce qu'un état vide présenté comme un zéro est le défaut le plus coûteux d'une application grand public (C7) |
| **Erreur de chargement** | La lecture des commandes échoue, **ou** une seule ligne échoue | **Écran entier** : `Panneau d'état · indisponible` avec le libellé écrit : « Indisponible pour le moment. Vos commandes n'ont pas été effacées. » Action « Réessayer ». **Ligne isolée** : `Encart · erreur` au-dessus de la ligne concernée, motif en clair, les autres lignes restant lisibles — **jamais la ligne remplacée par un vide, jamais la liste entière remplacée par « 0 commande »** | Action « Réessayer » sur l'écran, action « Réessayer » sur la ligne. Le geste relance **la seule** lecture qui a échoué, pas l'écran entier |
| **Erreur de soumission** | Aucun formulaire sur cet écran. La seule écriture possible est le bouton d'action d'une ligne en cours | L'action d'une ligne passe en `chargement`, puis `desactive` avec la raison écrite à côté. L'échec est porté par `Encart · erreur` sous la ligne, **jamais** par le bouton repeint : une erreur est une propriété de l'opération, pas du bouton (design system §5) | Aucun toast. Le client doit voir l'échec à l'endroit exact où il a agi |
| **Succès** | Une ligne a été relue après une action réussie | La ligne passe de son squelette à son état rendu, et l'état de commande mis à jour change sa teinte — `commandee` en contour, `preparation` en teinte, `expediee` pleine | Aucun. La teinte qui change **est** le feedback ; un toast « commande mise à jour » serait une information que la ligne porte déjà |
| **Hors-ligne / permissions** | Réseau absent | **La liste est rendue en entier** depuis la copie locale, avec un bandeau `--color-info #2A5470` en tête : « Affiché hors ligne. Dernière mise à jour il y a X h. », action « Réessayer ». Les deux dates de B13 restent affichées ensemble, **avec leur âge** | Les boutons d'action des lignes passent en `desactive` avec la raison écrite : hors ligne, on n'agit pas sur une commande qu'on n'a pas relue. Aucun lien de suivi, aucune écriture |
| **Lecture seule** | **Compte créé mais correspondance non confirmée** — l'état le plus important de cet écran | `Panneau d'état · acces-refuse`, avec le libellé écrit et l'action « Confirmer mon adresse ». Le catalogue reste atteignable d'un geste. **Rien d'autre n'est rendu** : ni le nombre de commandes, ni un nom, ni une date, ni un code postal, ni un montant, ni un « vous avez 0 commande » (B2, B4) — l'accès est fermé, un défaut de correspondance est un refus, jamais un accès accordé par défaut | Aucun. L'écran ne laisse pas croire qu'il y a quelque chose derrière le mur : il dit ce qui manque, pas ce qu'il protègent |

> Un état non décrit est un état non implémenté. Aucun de ces neuf ne présente de compteur à 0, et « Réessayer » n'apparaît que là où une lecture a réellement échoué (C7).

---

## 5. Interactions

| Élément | Événement | Comportement | Feedback visuel | État résultant | ID |
|---|---|---|---|---|---|
| Ligne de commande | tap | Navigation vers `/commande/[id]` | Pressé 120 ms ou fond `--color-surface-sunken` au clavier ; filet gauche de 3 px en `--color-encre-700` au focus | Fiche de commande | B13 |
| Bouton d'action d'une ligne | tap | Relecture de la commande, puis action chez le marchand — dans le MVP, c'est la **consultation** de la commande chez la boutique, jamais un retour (US-9 hors périmètre) | `chargement` (largeur inchangée), puis `desactive` avec la raison écrite en cas d'échec | Rempli ou Erreur de soumission | B7 |
| Bouton d'action d'une ligne, commande `livree` depuis plus de 30 jours | **absent** | **Le bouton n'est pas rendu.** Une commande livrée depuis plus de 30 jours n'a aucune action : une cible tactile vide vole le geste au suivant (design system §0, choix assumé n° 1) | Aucun — il n'y a rien à presser | Rempli | B13 |
| Action « Confirmer mon adresse » | tap | Navigation vers `/compte`, puis vers la création ou la confirmation | Pressé 120 ms | Compte | B2 |
| Action « Voir mes commandes sur la boutique » | tap | Ouverture de l'URL de la boutique, section commandes | Aucun | Sortie de l'application | E1 |
| Action « Parcourir le catalogue » | tap | Navigation vers `/` | Aucun | Accueil | C4 |
| Action « Réessayer » | tap | Relance la lecture des commandes | `chargement` sur le bouton | Rempli ou Erreur de chargement | B7 |
| Barre d'onglets | tap | Changement d'onglet, pile propre à chaque onglet | Fond pressé `--color-surface-sunken`, 120 ms | onglet correspondant | — |

- **Focus / clavier** : ordre de tabulation égal à l'ordre de lecture — titre, contexte, puis les lignes dans l'ordre chronologique inverse, puis l'état d'action de chaque ligne, puis la barre d'onglets. **Le montant et les deux dates ne sont jamais des cibles** : ce sont des données, et une donnée qui devient une cible tactile vole le geste (design system §0). Toute la ligne est une cible unique ; les boutons d'action sont des cibles séparées, atteignables sans traverser la ligne.
- **Gestes** : défilement vertical natif, pull-to-refresh. **Aucun swipe n'a d'effet** — ni pour archiver une commande, ni pour la supprimer, ni pour commander un retour (US-9 hors périmètre). Une commande supprimée par inadvertance est le pire défaut possible sur l'écran qui porte la raison de venir, et le geste qui la supprime est invisible pour un client qui agrandit son texte.
- **Animations** : `--duration-fast 120ms` sur les pressés et le focus ; **aucune animation sur l'apparition d'une ligne** qui remplace son squelette, à hauteur identique : la ligne apparaît à sa place, elle ne glisse pas. `--duration-slow 320ms` au retour arrière seulement.
- **Retour arrière** : depuis une fiche de commande, le retour rend cette liste **avec sa position de défilement exacte**, parce que le client a choisi une commande dans une liste et doit la retrouver à la même ligne. C'est la seule garantie de confort que cet écran doit fournir.

---

## 6. Responsive

| Breakpoint | Comportement | Ce qui se replie / disparaît |
|---|---|---|
| **Mobile** | **Seul format livré et seul format de référence** : `--format-320 320 × 568`. Marge `--space-lg 24px`, zone utile 272 px, ligne de commande de 56 pt. À 272 px, la grille à trois colonnes donne : référence et statut 118 px, dates 92 px, montant 62 px — **le montant ne rogne jamais**, il passe sous la référence en piles si la référence est longue | Rien ne disparaît. Ce qui se replie, c'est la **référence** d'une commande au format long du marchand : elle passe sur deux lignes et la ligne grandit |
| **Tablet** | **Hors périmètre en v1** — C10 exclut tablette et web ; le roadmap §4.2 conditionne leur retour à une part de sessions tablette mesurée pendant la fenêtre, au-dessus d'un seuil écrit avant publication. Une liste de commandes sur tablette serait la seule chose de l'application qui s'en tirerait mieux, et c'est précisément la raison de ne pas la concevoir | Non conçu. Aucune grille à deux colonnes, aucun panneau latéral |
| **Desktop** | **Hors périmètre en v1**, même raison, même seuil. Le format de référence unique est `--format-320` | Non conçu |

- **Cible tactile** : ligne de commande entière, 56 pt de haut et 272 px de large, largement au-delà de 44 pt ; bouton d'action d'une ligne, 44 px de hauteur ; actions des `Panneau d'état` et des `Encart`, 44 px de hauteur de ligne ; barre d'onglets, 56 px par entrée.
- **Débordement** : garanti sans débordement à tout réglage de police — la référence de commande (`--text-h3` mono, retour à la ligne autorisé, jamais tronquée : une référence tronquée est une référence fausse) ; le libellé de statut (deux lignes maximum) ; **les deux dates de B13 ensemble, en toutes lettres, jamais abrégées en « 12/03 »** — une date sans année sur un historique bisannuel est une date qui ne prouve rien ; le montant (chiffres tabulaires, colonne conservée, jamais rogné) ; le nom du produit s'il est affiché en troisième ligne.
- **Réglage de police** : la ligne de commande **grandit** au réglage de police et **ne rétrécit jamais** ; les deux dates de B13 restent solidaires l'une de l'autre, jamais l'une orpheline ; les actions des états restent atteignables. C'est la vérification manuelle de E3 (conventions, § tests) : lecteur d'écran sur un téléphone réel, pas sur un émulateur.

---

## 7. Accessibilité

- [x] **Contraste du texte courant** — `--color-texte-principal #161A19` sur `--color-background #F1EDE5` pour les références de commande et les montants ; `--color-texte-secondaire #5A544A` sur `--color-background` pour les dates de commande et les deux dates de B13 ; `--color-texte-secondaire #5A544A` sur `--color-surface #FBF8F2` pour la ligne de contexte ; `--color-texte-principal #161A19` sur `--color-surface #FBF8F2` pour le libellé d'un `Panneau d'état`. Le seuil appartient à `design-check contrast`.
- [x] **Contraste des grands textes** — le titre `--text-display 30/36` est posé sur `--color-background` uniquement. **Le point délicat de cet écran** : une `Ligne de commande` en état `preparation` ou `expediee` porte un fond de teinte de statut — le texte de la ligne doit donc rester en `--color-texte-principal` et **non** passer en `--color-texte-inverse`, parce que `--color-texte-inverse` est posé sur `--color-encre-700` et sur les quatre teintes **sombres**, alors que le fond de la ligne est une teinte **douce**. Le libellé de la pastille, lui, est posé sur le fond doux avec le token `-fort` correspondant, comme écrit au design system §0.
- [x] **Navigation clavier complète** — sur matériel, ordre de tabulation égal à l'ordre de lecture ; chaque ligne est annoncée comme un groupe dont le nom accessible est « commande {référence}, {date}, {montant}, {statut} », ce qui permet de se déplacer de ligne en ligne sans lire chaque champ ; les deux dates de B13 sont dans le nom accessible, donc un client qui parcourt la liste au lecteur d'écran entend la date limite de retour sans entrer dans la commande.
- [x] **Focus visible** — anneau de 2 px en décalage de 2 px, couleur `--color-bordure-focus #1B2220`, et filet gauche de 3 px en `--color-encre-700` sur la ligne focalisée, conformément au design system §5 Ligne de commande.
- [x] **ARIA** — la liste est un `list` ; chaque entrée est un `button` dont le nom accessible est composé comme ci-dessus ; la `Pastille de statut` est annoncée par son libellé complet et non par sa teinte — « Commande en préparation », « Expédiée », « Livrée », et les libellés exacts de la source quand ils diffèrent ; les `Panneau d'état` sont des `region` étiquetées, jamais des `alert` silencieux ; le bandeau hors-ligne est un `status` ; le compteur est **absent**, donc aucune région vivante n'annonce un nombre à l'ouverture.
- [x] **Alternatives textuelles** — **cet écran n'a aucune image.** La vignette d'article est volontairement absente (§2), donc il n'y a rien à décrire et rien à manquer. Les glyphes de la barre d'onglets sont décoratifs avec un nom accessible porté par l'étiquette de l'onglet.
- [x] **Langue et direction de lecture** — `lang="fr"`, `dir="ltr"`, **dates au format français long et non ambigu** — « 14 mars 2026 » et non « 14/03/26 » ni « 03/14/26 », sur un historique qui traverse les années ; une seule langue, aucune couche d'internationalisation (C5, B20).

---

## 8. Données

| Champ | Type | Origine | Requis | Erreur possible |
|---|---|---|---|---|
| Confirmation de la correspondance | booléen | Base applicative | **oui, gate** | Absente ou fausse → état « Lecture seule » ; **aucune requête de commande n'est émise** (B2) |
| Commandes | tableau de commandes | Base applicative, jointure confirmée | oui | Tableau vide → `aucune-donnee` ; réponse en erreur → `indisponible` avec « Réessayer », **jamais un tableau vide** (B7) |
| Référence de commande | texte | Source marchand | oui | Absente → rendue vide à sa hauteur, jamais complétée ni reconstituée (B23) |
| Date de commande | date | Source marchand | oui | Absente → la date de commande n'est pas rendue, et **le tri reste celui de la source** |
| Articles de la commande | tableau de libellés et quantités | Source marchand | non | Absents → aucun résumé d'articles, pas de ligne « 0 article » |
| Montant | texte, tel que fourni | Source marchand | oui | Absent → ligne de montant vide à sa hauteur, **jamais un 0,00 € reconstitué** |
| État de commande | libellé de la source | Source marchand | oui | Absent → la pastille n'est pas rendue et **aucun état par défaut n'est inventé** : surtout pas « en cours », qui serait une progression affirmée sans source (E2) |
| Date de livraison | date | Source marchand | non | Absente → **la date limite de retour ne s'affiche pas non plus** (B13) |
| Date limite de retour | date, calculée | Source marchand, calculée par la source | non | Absente → **la date de livraison ne s'affiche pas non plus** (B13) |
| Date de livraison prévue | date | Source marchand | non | Absente → aucune date n'est **devinée** : c'est US-3, hors MVP |
| Âge de la copie locale | horodatage | Cache local, affiché tel quel | oui si hors-ligne | Jamais absent : une donnée rejouée sans âge n'est pas rendue (B19) |

- **Chargement** : **tout d'un bloc, sans pagination.** Un historique client de 2 000 clients n'a pas de listes infinies ; la liste est rendue entièrement, cinq lignes squelettées au départ pour que la hauteur de la page soit stable, puis remplacées au fil de l'arrivée.
- **Cache / hors-ligne** : copie **en lecture seule** de la liste des commandes, rattachée au compte et donc retrouvée sur un autre appareil (B16). Aucune écriture hors ligne. La copie ne contient que des commandes déjà confirmées : elle ne peut pas devenir un chemin de contournement de B2.
- **Données sensibles** : **la jointure d'affichage la plus sensible de l'application.** Aucune commande n'est demandée, aucun nom, aucun code postal, aucun montant et aucune date ne transitent tant que la correspondance n'est pas confirmée (B2, B4). L'adresse e-mail affichée en ligne de contexte est **celle du client lui-même, la sienne** ; elle n'est pas une donnée de commande. Dans l'audit : aucun identifiant de commande, aucun identifiant client, aucune adresse dans un événement (C9).
- **Instrumentation (PRD §8, C9)** : `commandesOuvertes` (booléen et nombre de commandes, **jamais de référence**), `commandeOuverte` (position dans la liste et âge en jours, jamais l'identifiant), `compteRapproche` (résultat du rapprochement unique et définitif). Le critère de garde « 25 % des comptes créés qui ouvrent Commandes dans les 30 jours » se lit sur `commandesOuvertes` ; la jointure avec « compte créé » se fait **côté serveur** (roadmap §2.5, Q-C), jamais dans l'outil d'audit, parce qu'un identifiant de personne dans un événement est ce que C9 interdit.

---

## 9. Traçabilité

| ID | Origine | Manifestation sur cet écran |
|---|---|---|
| **B2** | PRD | L'historique n'apparaît qu'après confirmation par e-mail. L'état « Lecture seule » rend `acces-refuse` avec le libellé écrit et l'action « Confirmer mon adresse » ; **aucune donnée de commande n'est même demandée** avant confirmation. L'accès est fermé, pas ouvert par défaut |
| **B4** | PRD | Ni nom, ni code postal, ni montant, ni date, ni compteur ne sont rendus avant confirmation. La ligne de contexte affiche l'adresse e-mail **du client lui-même**, qui n'est pas une donnée de commande. Après confirmation sans correspondance, l'écran ne montre toujours aucun de ces éléments |
| **B7** | PRD | Un affichage vide n'est jamais un zéro. Panne d'écran entier → `indisponible` avec « Réessayer » et la phrase « Vos commandes n'ont pas été effacées. » ; panne d'une seule ligne → `Encart · erreur` au-dessus d'elle, les autres restant lisibles. **Jamais** une liste vide substituée à une panne, **jamais** « 0 commande », **jamais** « Réessayer » sur `aucune-donnee` |
| **B13** | PRD | La date de livraison et la date limite de retour sont rendues **ensemble ou aucune des deux**, dans la `Ligne de commande` comme dans la fiche de commande. Le composant `Ligne de commande` du design system §5 n'a pas d'état « une date seulement », et l'écran ne peut pas en composer un |
| **E1** | PRD | Le client qui a acheté sans compte et ne se souvient pas de l'adresse utilisée trouve, dans l'état `aucune-donnee`, le lien « Voir mes commandes sur la boutique » — rendu permanent, formulé en mots, jamais présenté comme une panne. Le quatrième cas d'E1 est signalé **avant** l'effort sur l'écran de création de compte, pas ici |
| **C4** | PRD | Le catalogue reste consultable sans compte, y compris depuis cet écran : l'état d'accès refusé propose « Parcourir le catalogue » d'un geste. L'onglet Commandes ne devient jamais un mur qui fermerait l'application |

**Règles du PRD citées sans être opposables à cet écran** : **B6 et B23** sont respectées par construction — référence, montant, état et libellés viennent de la source et sont rendus tels quels, sans arrondi, sans fusion, sans état par défaut. **B19** s'applique par le bandeau d'âge hors ligne, écrit en §4 et en §8.

---

## 10. Checklist de gate

- [x] Les 9 états sont décrits avec un rendu concret.
- [x] Chaque élément interactif a un comportement et un feedback.
- [x] Le responsive est défini à **chaque** breakpoint du design system — Mobile livré, Tablet et Desktop **écrits comme hors périmètre** avec leur condition de retour, et la raison de leur absence est donnée : c'est le seul écran qui s'en tirerait mieux, ce qui est la raison de ne pas le concevoir.
- [x] La section Anti-générique est cochée et justifiée.
- [x] Aucune valeur de design n'est laissée à « à définir ».
- [x] Chaque ID B*/E*/C* de l'écran apparaît en section 9, et les règles citées sans être opposables sont nommées comme telles.
- [x] `node "$FORGE/scripts/forge-guard.js" placeholders <anchor>` ne signale rien ici.
- [x] L'écran reste cohérent avec `.forge/design/design-system.md`, y compris sa borne basse déclarée au rang 3, dont la fragilité est signalée par le design system lui-même et non dissimulée ici.