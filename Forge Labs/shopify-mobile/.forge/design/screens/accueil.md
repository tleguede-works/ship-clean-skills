---
type: screen
slug: accueil
title: Accueil
module: accueil
status: draft
generated_at: 2026-09-30
derived_from:
  - .forge/prd.md
  - .forge/design/design-system.md
rule_ids: [B1, B6, B8, B9, B19, B23]
edge_case_ids: [E4, E6]
flow: acquisition
---

# Écran — Accueil

> Ce document est la **source de vérité** pour qu'une IA génère l'interface de cet écran.
> Il est généré depuis ce gabarit, jamais recopié. Aucun `{{PLACEHOLDER}}` ne doit subsister.

---

## 1. Rôle de l'écran

| | |
|---|---|
| **Archétype d'app** | `mobile_consumer` — téléphone seul, iOS et Android, un seul marché (C10) |
| **Module** | `accueil` — rang 1 dans la navigation |
| **Route** | `/` |
| **Type** | page — pile racine, aucun parent |
| **Utilisateurs** | Les trois personas sans distinction : c'est le seul écran qui n'exige rien d'eux (B1) |
| **User stories servies** | US-1 |
| **Règles métier** | B1, B6, B8, B9, B19, B23 |
| **Edge cases** | E4, E6 |

**Une phrase** : cet écran permet à n'importe quel visiteur, sans compte et en deux secondes, de voir ce que la boutique propose **et, s'il a un compte confirmé, ce qu'il y a déjà acheté ici** — afin de décider s'il reste ou s'il repart.

**Pourquoi il est au rang 1 de la navigation** : fréquence 5, centralité 4 (design system §4). C'est le seul écran atteignable sans identification et le seul où B9 garantit du contenu quelles que soient les données du marchand ; il ouvre donc la boucle pour le client qui n'a jamais commandé comme pour celui qui en a trois.

**Ce que cet écran n'est pas** : un sommaire de rubriques. Le PRD §1.2 interdit la lecture « menu » ; un accueil qui liste « Nos catégories / Notre histoire » n'ouvre aucune boucle. Les trois rails sont le catalogue sous trois coupeures, et la fiche du client est la seule chose que l'application sait et que le site ne peut pas montrer.

---

## 2. Direction visuelle de cet écran

Repris du design system — **valeurs concrètes, jamais « à définir »**.

| | |
|---|---|
| **Mood** | « chaleureux, dense, sans emphase » — les trois mots du design system §0, repris tels quels |
| **Densité** | **dense** — le client fidèle ouvre pour « ai-je commandé cette veste l'hiver dernier ? » : il compare des dates et des références. Un écran aéré lui fait perdre la comparaison avant qu'il l'ait faite |
| **Niveau de contraste** | **fort** entre l'encre et le papier, **faible** entre les surfaces — `--color-background #F1EDE5` et `--color-surface #FBF8F2` sont proches par choix, donc la séparation se fait au filet `--color-secondaire #D9D2C4` et à l'espace, jamais à l'ombre |
| **Surface** | `--color-surface #FBF8F2` sur `--color-background #F1EDE5` — la feuille ne sert qu'aux blocs qui doivent réellement se détacher ; les rails sont posés directement sur le papier |
| **Accent utilisé** | **aucun chroma au premier rendu.** La couleur d'action est `--color-encre-700 #1B2220` (design system §0 : « le prix s'affiche en encre, jamais dans la couleur du bouton »). Le chroma n'apparaît qu'en `Pastille de statut` sur la photo — `--color-succes #2A6349` « Réapprovisionné », `--color-erreur #A03427` « Épuisé » — et en bandeau `--color-info #2A5470` quand la copie est rejouée hors ligne |
| **Traitement photographique** | photo du marchand, ratio 1:1, recadrée par le conteneur et **jamais retouchée** (B23). Cadre de substitution `--color-encre-200 #B4BEBB` — « trame d'illustration vide », sur laquelle aucun texte n'est posé |
| **Référence** | Back Market pour le fond papier et la tuile sans carte ni ombre ; Apple Wallet pour la donnée rejouée qui affiche son âge au lieu de prétendre être fraîche |

### 2.1 Anti-générique — obligatoire

Cet écran ne doit ressembler **à aucun** de ces défauts :

- [x] Pas de fond **blanc pur** `#FFFFFF` par défaut — le fond est `--color-background #F1EDE5`, un papier chaud choisi précisément pour que la photo du marchand ne se confonde pas avec l'interface.
- [x] **Pas de carte ombrée pour tout.** La `Tuile produit` n'a ni fond, ni bordure, ni ombre : la gouttière `--space-md 16px` est la séparation, et `--shadow-none` est le seul état au repos.
- [x] **Pas d'uniformité** : `--text-display 30/36` ne sert qu'au titre d'écran et `--text-h2 24/30` aux titres de rail, `--text-h3 20/26` au nom de produit, `--text-caption 14/19` aux dates — les pas de tête sont larges et le bas de l'échelle se resserre, donc aucun niveau n'est confondu avec un autre.
- [x] **Pas de gris neutre générique** `#6B7280` par défaut — la famille `--color-encre-*` est une inks verte froide choisie, et les quatre teintes sémantiques ne sont pas la palette par défaut.
- [x] **Pas de mise en page centrée symétrique** par défaut — la grille produit est calée à gauche sur une marge de `--space-lg 24px` ; les rails défilent horizontalement et le bord droit du contenu n'est jamais symétrique du gauche.
- [x] **Pas d'illustration d'appoint générique** — la seule image est la photo du marchand ; le cadre vide est une trame de valeur, pas un dessin.
- [x] **Pas d'une seule famille de police si la hiérarchie demande du contraste** — la hiérarchie est portée par le rapport d'échelle, et les données numériques (prix, quantités, âge du cache) passent en SF Mono / Roboto Mono pour que les chiffres ne bougent pas d'une tuile à l'autre.

**Choix assumé et non neutre** : **le premier bloc de l'écran après la recherche n'est pas le catalogue, c'est l'historique du client.** La `Fiche du client` est un bandeau dense d'une seule ligne placé avant le premier rail ; il ne montre un compte, une commande et une date que si la correspondance est confirmée (B2, B4), et sinon il se réduit à une ligne d'invitation qui n'a rien à voir avec un catalogue. Un écran d'accueil qui commence par du catalogue reviendrait à faire du site un second écran, et c'est exactement la raison pour laquelle ce projet existe (PRD §1.1).

**Second choix, contestable** : le lien de la fiche du client mène à `/commandes` **l'onglet lui-même**, et non à la commande la plus récente. Le raccourcir vers une commande gonflerait le critère de garde « 25 % des comptes qui ouvrent Commandes » avec une ouverture que le client n'a pas lui-même faite.

---

## 3. Anatomie

```
Écran "/" — pile racine
├─ Barre de recherche  (pleine largeur, hauteur 56 px, à 24 px du haut)   ← B11
│    └─ Surface --color-surface-sunken, loupe à droite, étiquette "Rechercher un produit"
│       → tap = navigation vers "/recherche" (le champ y reçoit le focus)
├─ Fiche du client     (bandeau dense, 2 rendus selon la correspondance)
│    ├─ "confirmé"  → 1 ligne : nombre de commandes + date de la dernière  → "/commandes"
│    └─ "non confirmé" → 1 ligne d'invitation, --text-body-sm           → "/compte"
├─ Rail 1 — "Nouveautés"        --text-h2, défilement horizontal        ← B9, E4 niveau 1
│    └─ Tuile produit 128 px  (photo 128×128, nom --text-h3, prix en encre)
├─ Rail 2 — "De retour en stock"  --text-h2, défilement horizontal      ← E4 niveau 2
│    └─ Tuile produit 128 px, pastille --color-succes
├─ Rail 3 — source Q-F routée vers la slice, chaîne de repli écrite   ← B9 : trois emplacements
│    └─ Tuile produit 128 px
├─ Filet --color-secondaire (séparation du groupe bas)
└─ Barre d'onglets (4 items, accueil actif) + Barre de panier au-dessus
```

| # | Composant | Rôle | Source |
|---|---|---|---|
| 1 | Barre de recherche | Entrée plein écran vers la recherche, sans défilement | slice-local, sur `Champ de saisie` (design-system §5) |
| 2 | Fiche du client | Porter l'historique avant le catalogue | slice-local, sur `Encart` et `Tuile produit` |
| 3 | Tuile produit | Référence, prix et disponibilité du marchand, sans carte | design-system §5 |
| 4 | Rail horizontal | Défilement de tuiles, aucun contenu masqué | slice-local, sur `Tuile produit` |
| 5 | Barre de panier | Tunnel vers le paiement, pousse le contenu | design-system §5 |
| 6 | Barre d'onglets | Navigation entre les quatre modules | design-system §5 |

**Trois rails, pas deux (B9, et la question Q-F laissée ouverte par le roadmap §2.5).**
Les deux premiers niveaux sont écrits par E4 et sont donc fermés : *nouveautés et modifications récentes*, puis *réassorts et articles réapprovisionnés*. Le troisième emplacement n'a pas de source nommée dans le PRD, et Q-F demande qu'elle soit non vide **sans compte et sans travail marchand**. La chaîne de repli est donc écrite ici :

1. **source du troisième niveau** — tranchée par la slice `accueil-trois-rails`, qui pose sa propre condition d'échec : le candidat déjà nommé par le PRD est « derniers consultés », et il **échoue** à la condition « sans compte » parce qu'il suppose un historique local ; si le droit d'inventaire n'est pas accordé, la réponse ne revient pas au rail mais au PRD (Q-F reste ouverte **chez le commanditaire**) ;
2. **repli 1** — la suite du rail 2 (les éléments suivants du même flux de réassorts), le titre du rail devient « De retour en stock — suite » ;
3. **repli 2** — si la chaîne entière est vide, l'emplacement rend un `Panneau d'état · aucune-donnee` sur une ligne, sans illustration et sans « Réessayer » : ce n'est pas une panne, c'est un catalogue sans article, et C7 interdit de le présenter comme un échec.

Aucun de ces trois cas ne peut produire un emplacement vide : c'est la seule manière de tenir B9 sans inventer une source marchande.

---

## 4. États — tous, sans exception

| État | Déclencheur | Rendu | Feedback utilisateur |
|---|---|---|---|
| **Chargement** | Ouverture à froid, ou refresh, aucune copie locale lisible | **Aucun squelette pleine page (B8).** Le titre de l'écran, la barre de recherche et les trois titres de rails sont du texte local : ils s'affichent immédiatement. Chaque rail remplit ses tuiles au fur et à mesure ; une tuile dont la photo manque garde son nom et son prix, seuls le cadre `--color-encre-200` et la zone cliquable attendent | Aucun indicateur global. Le titre d'un rail encore vide reste en `--color-texte-secondaire`, lisible, et non en fantôme : un titre fantôme fait croire à une absence de données |
| **Rempli** | La source répond | Trois rails remplis, fiche du client dans son rendu « confirmé » si la correspondance existe, barre de panier dans son état `remplie` si un panier existe | Aucun toast : l'écran est déjà son propre feedback |
| **Vide — jamais visité** | Aucune visite, aucun compte, aucun panier | Les rails tournent sans compte et sans consentement : c'est le cas ordinaire d'un premier lancement (B9, E4). La fiche du client rend sa ligne d'invitation « Vous avez commandé ici ? Retrouvez vos commandes. » avec un lien vers `/compte` | Aucun. Aucun bandeau de bienvenue, aucun coach-mark : ce sont des micro-copies vides au sens de `design-quality` §3 |
| **Vide — aucune donnée** | La source répond avec un catalogue sans aucun article — aucun rail ne peut alors être rempli | Le rail concerné rend `Panneau d'état · aucune-donnee` sur une ligne, sans illustration, action « Voir mes commandes sur la boutique » reprise du design system §5. **Un compteur à 0, la mention « 0 article » et un bouton « Réessayer » sont tous deux interdits** : ce n'est pas une panne | L'événement d'instrumentation compte l'emplacement de repli atteint, pour que la rupture du rail 3 soit visible sans l'expliquer dans le texte |
| **Erreur de chargement** | La source catalogue ne répond pas **et** aucune copie locale n'est lisible | `Panneau d'état · indisponible` **dans l'emplacement du rail concerné**, jamais en plein écran : la barre de recherche et les rails déjà remplis restent en place. Libellé du design system §5, sujet catalogue : « Indisponible pour le moment. Le catalogue n'a pas été effacé. » | Action « Réessayer » (B7). Le champ de recherche reste utilisable : un client qui cherche une référence ne doit pas être bloqué par un rail mort |
| **Erreur de soumission** | Aucun formulaire sur cet écran. Le seul acte d'écriture possible est l'ajout au panier depuis la barre de panier | `Barre de panier` passe à l'état `indisponible` et remplit son slot `raison-indisponibilite` : « Panier non enregistre. Réessayer avant de payer. » | La barre de panier reste visible et son action reste atteignable en `primaire` : l'échec est une propriété de l'opération, jamais du bouton (design system §5 Bouton) |
| **Succès** | Un ajout au panier depuis la barre de panier aboutit | La barre passe de `absente` à `remplie` et **pousse** le contenu vers le haut ; la tuile du produit ajouté n'est pas injectée dans un rail | La barre s'anime en `--duration-normal 200ms`, easing standard. Aucun toast : le résultat est visible sur place |
| **Hors-ligne / permissions** | Réseau perdu, ou copie locale absente de cet appareil | Les rails qui ont une copie locale la rendent, chacun avec son bandeau `--color-info` « Affiché hors ligne — il y a X h » sur la tuile. La fiche du client, si elle est en cache applicatif, porte le même âge et se dégrade en texte seul | **Aucune action d'écriture n'est proposée** (B19, E6). L'action de paiement de la barre de panier passe en `desactive` avec la raison écrite en clair à côté — jamais un simple gris |
| **Lecture seule** | Hors-ligne, ou compte créé mais correspondance non confirmée | Le catalogue est rendu **en entier et sans restriction**. Aucun `Panneau d'état · acces-refuse` n'est posé sur cet écran : B1 et C4 interdisent que la lecture du catalogue dépende d'un compte. Le seul élément qui change est la fiche du client, qui passe de sa forme dense à sa ligne d'invitation | Aucun. L'écran ne signale jamais au visiteur qu'il lui manque quelque chose pour voir ce qu'il voit déjà |

> Un état non décrit est un état non implémenté. Aucun de ces neuf ne laisse une colonne vide, et aucun ne propose « Réessayer » là où rien n'a échoué (C7).

---

## 5. Interactions

| Élément | Événement | Comportement | Feedback visuel | État résultant | ID |
|---|---|---|---|---|---|
| Barre de recherche | tap | Navigation vers `/recherche`, qui place le focus dans le champ au montage | Aucun état pressé long : la navigation est immédiate, la barre ne reste pas « enfoncée » pendant un aller-retour | Recherche — écran `recherche` | B11 |
| Fiche du client (rendu « confirmé ») | tap | Navigation vers `/commandes` — l'onglet, pas la dernière commande | `--color-encre-50` au pressé, 120 ms | Commandes | C7 |
| Fiche du client (rendu « non confirmé ») | tap | Navigation vers `/compte` | idem | Compte | B2 |
| Tuile produit | tap | Navigation vers `/produit/[handle]` | Anneau de focus sur la **photo** au clavier ; au doigt, aucun feedback de 120 ms — le tactile n'a pas de survol | Produit | B1 |
| Tuile produit | appui long | **Aucun.** Pas de menu contextuel, pas d'action rapide : le menu contextuel est le seul endroit où une application mobile inventerait une capacité qu'aucune règle ne décrit | Aucun | — | B10 |
| Rail horizontal | défilement horizontal | Défilement natif, inertie système, retour à `--duration-normal 200ms` | Aucun indicateur de position : à `--format-320`, 24 px de la tuile suivante restent visibles, ce qui annonce le défilement sans chrome supplémentaire | — | C6 |
| Barre de panier — action « Payer sur la boutique » | tap | Relecture du panier ; si elle réussit, ouverture de l'URL de checkout de la boutique pour **ce** panier ; si elle échoue, rien ne s'ouvre | Le bouton passe en `chargement` (libellé conservé en accessibilité, largeur inchangée) puis en `desactive` avec la raison écrite | Panier — écran `panier`, état `indisponible` | B12, E11 |
| Barre d'onglets | tap | Changement d'onglet, la pile de chaque onglet est conservée séparément | Fond de l'onglet pressé `--color-surface-sunken`, 120 ms | onglet correspondant | — |
| Retour arrière (Android, geste) | geste | Revient au rail précédent dans l'historique de défilement du même onglet ; au-delà, quitte l'application | — | — | — |

- **Focus / clavier** : ordre de tabulation = ordre de lecture, de la barre de recherche vers le dernier rail ; chaque tuile est un nœud unique étiqueté par « nom du produit, prix, disponibilité », l'anneau de focus est posé sur la photo et non sur la tuile entière (design system §5 Tuile produit). Aucune tuile n'est atteignable au clavier sans l'être au doigt.
- **Gestes** : défilement vertical natif, défilement horizontal sur les rails, pull-to-refresh sur toute la page. **Aucun swipe n'a d'action** — en particulier, aucun swipe sur tuile ne supprime, ne met en favori et ne réordonne : ces gestes sont invisibles à l'utilisateur qui agrandit son texte et les perdent au premier appui long.
- **Animations** : `--duration-fast 120ms` sur les pressés et les focus, `--duration-normal 200ms` sur la barre de panier et le changement d'onglet, `--duration-slow 320ms` **uniquement** sur le retour arrière. Aucune animation ne précède la première donnée utile et toutes tombent à zéro si le système demande une réduction des animations (design system §3).
- **Retour arrière** : c'est l'écran de la pile racine. Un retour arrière depuis un onglet différent ne détruit pas la position de défilement de l'accueil ; depuis un lien profond produit, le retour arrière rend `/` au même rail qu'avant la navigation.

---

## 6. Responsive

| Breakpoint | Comportement | Ce qui se replie / disparaît |
|---|---|---|
| **Mobile** | **Seul format livré et seul format de référence** : `--format-320 320 × 568`. Marge de page `--space-lg 24px`, gouttière de grille `--space-md 16px`, donc **tuile produit de 128 px** (320 − 48 − 16) ÷ 2 et photo 1:1 de 128 × 128. Barre de recherche sur toute la largeur, jamais dans un en-tête réduit | Rien ne disparaît. À 320 px, le rail 2 perd sa troisième tuile visible, pas son contenu : le défilement prend le relais |
| **Tablet** | **Hors périmètre en v1.** C10 exclut tablette et web de la version 1, et le roadmap §4.2 conditionne leur retour à une part de sessions tablette mesurée pendant la fenêtre et dépassant un seuil écrit avant publication | Non conçu. Aucun gabarit tablette n'existe : en écrire un serait du travail jeté (C10) |
| **Desktop** | **Hors périmètre en v1**, même raison et même seuil de retour que Tablet. La navigation `--format-320` est le format de référence unique | Non conçu. Aucune barre latérale, aucune grille à trois colonnes |

- **Cible tactile** : tuile produit **128 × 128 px** pour l'image et 128 px de hauteur totale ; barre de recherche 56 px de haut ; barre d'onglets **56 px** par entrée, taille `lg` du bouton — c'est la seule taille du design system dont la hauteur dépasse 44 pt une fois l'icône de 20 px posée. La zone système est respectée par les safe areas natives de la plateforme : aucune hauteur de barre n'est inventée ici.
- **Débordement** : garanti sans débordement, à tout réglage de police — la barre de recherche (pleine largeur, une seule ligne, `numberOfLines` illimité) ; la `Fiche du client` (une ligne qui peut se replier sur deux, jamais tronquée) ; le titre de rail (une ligne, `--text-h2`, autorise le retour à la ligne) ; le nom de produit dans la tuile (`--text-h3`, trois lignes au maximum puis `…`, jamais de largeur fixe) ; l'âge du cache en `--text-caption` ; **le prix ne déborde jamais** : les chiffres tabulaires et le passage en SF Mono / Roboto Mono garantissent qu'une hausse de prix ne pousse pas la mise en page.
- **Réglage de police** : aucun conteneur de texte n'a de hauteur fixe ; les cibles tactiles **grandissent** avec le texte et ne rétrécissent jamais (B21, E3). Au réglage maximal, la barre de recherche passe à deux lignes, les rails restent à une tuile pleine et la barre de panier conserve son action.

---

## 7. Accessibilité

- [x] **Contraste du texte courant** — les tokens qui portent le texte de cet écran sont `--color-texte-principal #161A19` sur `--color-background #F1EDE5` (titre d'écran, nom de produit) et sur `--color-surface #FBF8F2` (bandeau de la fiche du client) ; `--color-texte-secondaire #5A544A` sur les deux mêmes surfaces pour les dates, quantités et l'âge du cache ; `--color-lien #1E4A45` sur `--color-background` pour le lien d'invitation, identifiable par son soulignement. Le seuil n'est pas écrit ici : il appartient à `design-check contrast`.
- [x] **Contraste des grands textes** — `--text-display 30/36` et `--text-h2 24/30` sont posés sur `--color-background` uniquement, jamais sur une teinte sémantique ; les libellés de `Pastille de statut` sont posés sur les fonds `--color-succes-doux`, `--color-attention-doux`, `--color-erreur-doux` et `--color-info-doux` avec les tokens `--color-*-fort` correspondants.
- [x] **Navigation clavier complète** — sur matériel et non sur desktop, qui est hors périmètre (C10) : l'ordre de tabulation suit l'ordre de lecture, chaque rail est un groupe annonces une fois avec son titre, et la barre d'onglets expose son état actif dans son nom accessible.
- [x] **Focus visible** — anneau de 2 px en décalage de 2 px, couleur `--color-bordure-focus #1B2220`, jamais un changement de couleur de bordure. Le focus d'une tuile est posé sur la photo.
- [x] **ARIA** — `Tuile produit` est un `button` au sein d'un groupe de rôle `list` ; le rail a un `aria-labelledby` sur son titre ; la barre de recherche est un `button` étiqueté « Rechercher un produit » et non un champ inerte ; la barre de panier est une `region` étiquetée « Panier » ; chaque état de lecture est une `region` étiquetée par le `Panneau d'état` qui la rend, jamais un `alert` silencieux.
- [x] **Alternatives textuelles** — la photo du marchand porte un texte alternatif écrit par le marchand, ou à défaut « Photo de {nom du produit} » ; une photo manquante rend la trame `--color-encre-200` **décorative**, avec une alternative vide, parce qu'une trame ne décrit rien. La `Fiche du client` n'a pas d'image.
- [x] **Langue et direction de lecture** — `lang="fr"` sur l'élément racine, `dir="ltr"`, une seule langue et aucune couche d'internationalisation (C5, B20).

---

## 8. Données

| Champ | Type | Origine | Requis | Erreur possible |
|---|---|---|---|---|
| Nom de la boutique | texte | Source marchand | oui | Source injoignable → l'en-tête reste, sans nom ; l'application ne le devine pas (B6) |
| Produits d'un rail | tableau de produits | Source marchand, jamais copiée | oui | Réponse vide → état « aucune donnée » de la ligne |
| Photo d'un produit | URL d'image | Source marchand | non | Absence → trame `--color-encre-200`, nom et prix conservés |
| Prix | texte, tel que fourni | Source marchand | oui | Valeur absente → ligne rendue **vide à sa hauteur**, jamais complétée, jamais mise en forme (B23) ; l'absence ne doit pas se lire comme une gratuité, donc l'interligne `--text-h3` est conservé |
| Disponibilité | libellé du marchand | Source marchand | oui | Absente → aucune pastille ; l'application n'invente ni « En stock » ni « Épuisé » (B6) |
| Date de dernière visite produit | date | Base applicative, rattachée au compte | non | Absente → le rail concerné n'est pas rendu |
| Nombre de commandes, date de la dernière | nombre, date | Base applicative, **uniquement si la correspondance est confirmée** | non | Jamais requête sans confirmation : ni le nombre, ni le nom, ni la date ne sont demandés (B2, B4) |
| Présence d'un panier | booléen + lignes | Source marchand | non | Panier non relu → `Barre de panier` en `indisponible` (E11) |
| Âge de la copie locale | horodatage | Cache local, affiché tel quel | oui si hors-ligne | Jamais absent : une donnée rejouée sans âge n'est pas rendue (B19) |

- **Chargement** : pas de pagination sur l'accueil — trois blocscontents, trois requêtes **parallèles et non chaînées**, jamais séquentielles sur le premier rendu (C6). Chaque rail est indépendant : un rail en échec n'empêche pas les deux autres de s'afficher.
- **Cache / hors-ligne** : copie en **lecture seule** du catalogue et des produits récemment vus, rattachée au compte (B16). Aucune écriture hors ligne n'est proposée, en particulier l'ajout au panier, qui n'existe pas hors ligne (C8, E6).
- **Données sensibles** : ni l'adresse e-mail, ni le nom du client, ni un identifiant de commande ne sont affichés tant que la correspondance n'est pas confirmée (B4). Le nom du client n'apparaît nulle part sur cet écran, même après confirmation : l'écran parle de « vos commandes », pas de « Jean ».
- **Instrumentation (PRD §8, C9)** : trois événements au maximum sur cet écran — `railVu`, `ficheClientOuverte`, `sessionDebutSaisie`. Noms en français, **aucune donnée personnelle dans la charge utile** : ni e-mail, ni identifiant de commande, ni identifiant client, ni prix (C9). Le décompte « session commençant par une saisie » se fait sur cet événement, et il est **écrit** parce qu'il commande la bascule des 12 % du PRD §8.

---

## 9. Traçabilité

| ID | Origine | Manifestation sur cet écran |
|---|---|---|
| **B1** | PRD | Aucun compte, aucune rétention, aucun mur d'accès : le catalogue et les rails sont rendus en entier pour un visiteur non connecté. Aucun `Panneau d'état · acces-refuse` n'existe sur cet écran (§4, état « Lecture seule ») |
| **B6** | PRD | Le marchand est une source : nom de boutique, prix, disponibilité et libellés de rail sont rendus tels qu'ils arrivent. Aucun arrondi, aucun préfixe, aucune traduction. Le prix est en encre et jamais dans la couleur du bouton (design system §0) |
| **B8** | PRD | Aucune animation ne précède la première donnée utile : titres et barre de recherche s'affichent sans réseau, chaque rail se remplit indépendamment, une tuile sans photo garde son texte (§4 « Chargement ») |
| **B9** | PRD | Trois emplacements de rail, toujours occupés. La chaîne de repli du rail 3 est écrite en §3 et son dernier maillon est un `Panneau d'état` d'une ligne — jamais un emplacement vide |
| **B19** | PRD | Bandeau `--color-info` « Affiché hors ligne — il y a X h » sur chaque rail rejoué, âge issu de l'horodatage de cache. Hors ligne, **aucune action d'écriture n'est proposée** et le bouton de paiement passe en `desactive` avec sa raison écrite |
| **B23** | PRD | Le catalogue n'est ni corrigé, ni complété, ni mis en forme : photo non retouchée, prix rendu brut, vide conservé à sa hauteur, description jamais réinterprétée |
| **E4** | PRD | Rails automatiques sans aucun travail marchand : rail 1 « Nouveautés », rail 2 « De retour en stock », rail 3 par chaîne de repli. Aucun module d'étiquetage n'existe et aucun n'est proposé |
| **E6** | PRD | La copie hors ligne s'affiche avec son âge et reste sans action d'écriture, sur les rails comme sur la `Tuile produit` (état `hors-ligne` du design system §5) |
| **C4** | PRD | Le catalogue reste consultable sans compte : c'est le contenu de premier rendu de cet écran, et il n'est jamais conditionné à une identification |
| **C8** | PRD | Cache hors-ligne **en lecture seule**, portant son âge. Aucune écriture n'est proposée hors ligne, y compris l'ajout au panier |
| **C14** | PRD | La ressource rare est le temps de deux personnes : les rails sont **lus** dans une source existante et ne demandent aucun travail d'ingestion récurrent, aucun contenu créé, aucune modération. Aucun travail n'est demandé au marchand — c'est ce qui rend E4 tenable |
| **C6** | PRD | Trois requêtes parallèles, aucun enchaînement séquentiel sur le premier rendu, texte local affiché avant tout réseau. La vérification manuelle des deux secondes est une slice du MVP (roadmap §2.1) : le chiffre se lit, il ne s'estime pas |

---

## 10. Checklist de gate

- [x] Les 9 états sont décrits avec un rendu concret.
- [x] Chaque élément interactif a un comportement et un feedback.
- [x] Le responsive est défini à **chaque** breakpoint du design system — Mobile livré, Tablet et Desktop **écrits comme hors périmètre** avec leur condition de retour.
- [x] La section Anti-générique est cochée et justifiée.
- [x] Aucune valeur de design n'est laissée à « à définir ». Le seul point ouvert est la source du rail 3, **Q-F du roadmap §2.5**, dont la chaîne de repli est écrite ici pour que l'écran tienne B9 sans elle.
- [x] Chaque ID B*/E*/C* de l'écran apparaît en section 9.
- [x] `node "$FORGE/scripts/forge-guard.js" placeholders <anchor>` ne signale rien ici.
- [x] L'écran reste cohérent avec `.forge/design/design-system.md`.