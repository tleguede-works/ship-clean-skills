---
type: screen
slug: produit
title: Fiche produit
module: catalogue
status: draft
generated_at: 2026-09-30
derived_from:
  - .forge/prd.md
  - .forge/design/design-system.md
rule_ids: [B1, B12, B19, B23]
edge_case_ids: [E6, E11]
flow: achat
---

# Écran — Fiche produit

> Ce document est la **source de vérité** pour qu'une IA génère l'interface de cet écran.
> Il est généré depuis ce gabarit, jamais recopié. Aucun `{{PLACEHOLDER}}` ne doit subsister.

---

## 1. Rôle de l'écran

| | |
|---|---|
| **Archétype d'app** | `mobile_consumer` — téléphone seul, iOS et Android, un seul marché (C10) |
| **Module** | `catalogue` — **sous-écran**, sans rang d'onglet : on y entre depuis un rail, un résultat de recherche, une commande ou un lien partagé |
| **Route** | `/produit/[handle]`, et `/produit/[handle]/[variant]` pour une variante désignée par lien profond |
| **Type** | page — sous-écran du catalogue, empilé sur la source d'arrivée |
| **Utilisateurs** | Les trois personas. C'est la page d'acquisition : elle doit s'ouvrir sans compte, hors ligne, depuis un lien de messagerie |
| **User stories servies** | US-1, US-6 |
| **Règles métier** | B1, B12, B19, B23 |
| **Edge cases** | E6, E11 |

**Une phrase** : cet écran permet à quiconque, sans compte et depuis un lien, de voir ce que vaut exactement un produit et de le mettre dans un panier, afin de décider ici et de payer chez le marchand.

**Pourquoi il est un sous-écran et non un onglet** : la navigation du design system §4 borne à quatre onglets et le PRD §7 exclut explicitement un onglet Explorer. Une fiche produit n'a pas de place dans la barre : elle est la destination d'un geste, pas un lieu. Elle partage d'ailleurs le module `catalogue` avec l'accueil et la recherche, dont elle est le point d'arrivée commun.

**Le lien partagé est le chemin d'acquisition principal, donc l'écran doit tenir sans contexte** : il s'ouvre en plein écran depuis une messagerie, sans barre d'onglets visible, et il doit rester lisible et complet même sans réseau. C'est le sens littéral de E6 et de C4.

**Ce que cet écran ne fait pas du MVP** : il n'affiche ni galerie, ni matrice de variantes, ni produits liés, ni facettes (roadmap §2.2). Il montre **une seule photo** et **la variante que la source désigne par défaut**. Les autres variantes restent adressables par lien profond `/produit/[handle]/[variant]` ; il n'y a pas de sélecteur. Un sélecteur qui nofferait que la variante affichée serait un mensonge d'interface.

---

## 2. Direction visuelle de cet écran

Repris du design system — **valeurs concrètes, jamais « à définir »**.

| | |
|---|---|
| **Mood** | « chaleureux, dense, sans emphase » — repris du design system §0 |
| **Densité** | **normale en haut, dense en bas** — c'est la seule répartition de densité qu'onduleur s'autorise : la photo, le nom et le prix ont droit à de l'air parce qu'ils sont lus en une seconde, tandis que les dates, quantités et totaux du panier sont posés en lignes serrées. La densité change **au sein de l'écran**, ce qui est le seul endroit où ce choix a du sens |
| **Niveau de contraste** | **fort sur le bloc produit, faible sur les méta** — le nom et le prix sont en `--color-texte-principal` sur le papier ; les libellés de la source et les quantités sont en `--color-texte-secondaire`. Le prix ne reçoit aucune couleur particulière (design system §0, choix assumé n° 3) |
| **Surface** | `--color-background #F1EDE5` — le contenu est posé sur le papier, sans feuille. Seuls le bouton d'action en `primaire` et la barre de panier sortent du papier, parce que ce sont les deux seules choses qui doivent être pressées |
| **Accent utilisé** | `--color-encre-700 #1B2220` sur le bouton « Ajouter au panier ». Le chroma n'apparaît qu'en `Pastille de statut` — `--color-erreur #A03427` « Épuisé », `--color-succes #2A6349` « Réapprovisionné », `--color-attention #7A5A0C` « Stock bas », sur les fonds `-doux` correspondants — et en `--color-info #2A5470` pour le bandeau d'âge hors ligne. **Aucune couleur sémantique ne touche un prix** |
| **Traitement photographique** | **la photo du marchand en 1:1, aussi grande que possible, jamais retouchée ni recadrée par l'application au-delà du recadrage du conteneur.** Le cadre vide est `--color-encre-200 #B4BEBB` (design system §0 : « trame d'illustration vide ») |
| **Référence** | Back Market pour la tuile sans carte ; Zalando mobile pour la fiche qui tient en un écran sans dégrader le prix en pagination de détails |

### 2.1 Anti-générique — obligatoire

- [x] Pas de fond **blanc pur** — fond `#F1EDE5`, et la zone photo ne pose **aucun texte** dessus, ce qui évite d'avoir besoin d'un voile blanc sur l'image.
- [x] **Pas de carte ombrée pour tout** — aucune carte sur cet écran. Le bloc de description est posé sur le papier, séparé par un filet `--color-secondaire #D9D2C4`, pas par une ombre. La seule ombre du système, `--shadow-flottant`, appartient à la barre de panier, parce qu'elle flotte au-dessus du contenu.
- [x] **Pas d'uniformité** : `--text-h2 24/30` pour le nom du produit, `--text-h3 20/26 700` pour le prix, `--text-overline 12/16 +0.8px` pour la collection, `--text-body 17/25` pour la description, `--text-caption 14/19` pour les méta. Cinq niveaux sur un seul écran, avec un rapport de 24 → 17 → 14 serré en bas.
- [x] **Pas de gris neutre générique** — la palette vient de l'encre verte froide et du papier chaud ; les gris du merchant n'apparaissent nulle part.
- [x] **Pas de mise en page centrée symétrique** — tout est calé à gauche sur `--space-lg 24px`, y compris le prix ; l'alignement à gauche d'un prix est plus lisible qu'un prix centré sous un nom centré, et c'est ce que fait la grille réelle des tuiles.
- [x] **Pas d'illustration d'appoint générique** — si le marchand n'a pas de photo, c'est une trame de valeur et un état d'une ligne. Aucune icône dans un cercle, aucun dégradé.
- [x] **Pas d'une seule famille de police** — le prix et les quantités passent en SF Mono / Roboto Mono, chiffres tabulaires, pour que le prix s'aligne et ne bouge pas quand le client compare deux produits.

**Choix assumé et non neutre** : **la photo occupe la largeur utile entière, sur toute la hauteur du carré, et rien ne flotte dessus.** Pas de badge de promotion, pas de « -20 % », pas de pastille de prix barré, pas de compteur de vues. Le PRD §7 refuse le bandeau promotionnel et le design system §0 refuse les badges ; plus profond, B6 dit que le marchand est une source : une promotion affichée par notre main serait une donnée que nous inversons sur une autre. Ce qui remplace la promotion, c'est la `Pastille de statut` du marchand et, quand elle existe, la date de réassort — une information d'inventaire que personne n'a à écrire (E4).

**Second choix, contestable** : **le bouton d'action reste en bas de l'écran, au-dessus de la barre de panier, et ne remonte jamais en sticky au défilement.** La fiche produit ne fait pas de fetch au défilement (B18, C6) et le client sait ce qu'il cherche ; un bouton qui suit le doigt pendant qu'il parcourt 200 lignes de description retire l'information qu'il était venu chercher. Le prix et la disponibilité sont en haut, accessibles sans défiler — donc l'information nécessaire est déjà là.

---

## 3. Anatomie

```
Écran "/produit/[handle]" — sous-écran
├─ Barre système — retour arrière + titre = nom de la boutique (côté source)
├─ Zone photo — 1:1, largeur utile 272 px à --format-320, rien par-dessus
├─ Bloc d'identité
│    ├─ Collection — --text-overline, texte de la source
│    ├─ Nom du produit — --text-h2, retour à la ligne libre
│    ├─ Ligne de prix — --text-h3 700, chiffres tabulaires, encre
│    └─ Ligne de disponibilité — Pastille de statut, libellé de la source
├─ Bloc description — --text-body-sm, texte brut de la source, séparé par un filet
├─ Bloc livraison — ce que la source déclare, rien de plus
└─ Action
     ├─ Bouton primaire "Ajouter au panier" — lg 56 px, largeur utile
     ├─ ou Encart quand l'action est impossible, avec la raison écrite
     └─ Barre de panier — pousse le contenu, ne le recouvre pas
```

| # | Composant | Rôle | Source |
|---|---|---|---|
| 1 | Zone image | Photo du marchand, 1:1, cadre de substitution | slice-local, sur design-system §5 (trame) |
| 2 | Bloc d'identité | Collection, nom, prix, disponibilité — le bloc que le client juge | slice-local |
| 3 | Pastille de statut | Réassort, rupture ou stock bas, libellé de la source | design-system §5 |
| 4 | Bloc description | Texte du marchand, rendu brut | slice-local |
| 5 | Bouton primaire | Ajouter au panier | design-system §5 |
| 6 | Encart | Porter la raison d'une action impossible — hors ligne, rupture, panier non relu | design-system §5 |
| 7 | Barre de panier | Tunnel vers le paiement et sommaire de ce qui est déjà dedans | design-system §5 |
| 8 | Feuille modale | Confirmation de sortie vers le paiement — uniquement depuis la barre de panier, jamais depuis ce bouton | design-system §5 |

**Ce qui n'est pas dans cette anatomie** et ne doit pas y apparaître : un sélecteur de variantes, une galerie, des produits liés, des facettes, un bouton « Acheter », un champ de quantité, un numéro de carte, un bouton de favori (US-7 hors MVP). L'absence est une décision : ces éléments n'ont pas de règle métier qui les décrit dans le périmètre du MVP, et les ajouter serait ouvrir une capacité que le gel de périmètre interdit.

---

## 4. États — tous, sans exception

| État | Déclencheur | Rendu | Feedback utilisateur |
|---|---|---|---|
| **Chargement** | Ouverture à froid, lien partagé sans copie locale, réseau lent | **Aucun squelette pleine page (B8).** Le nom, la collection et le prix s'affichent dès qu'ils arrivent ; seul le carré photo porte un `Squelette · photo`. Le bouton d'action est rendu en `chargement` — libellé remplacé par un indicateur, **largeur inchangée**, libellé conservé en accessibilité | Aucune animation sur le contenu. Un fondu de `--duration-slow` sur le premier rendu coûterait une seconde d'écran vide sur une 4G bridée (design system §3) |
| **Rempli** | Le produit et sa variante par défaut sont relus | Le bloc d'identité et la description sont rendus ; le bouton « Ajouter au panier » est actif si le produit n'est pas en rupture | Aucun. Le bouton est la seule action et son état dit tout |
| **Vide — jamais visité** | C'est la première et unique visite de ce produit ; aucun historique, aucun panier, aucune connexion | Aucune trace du client sur l'écran : **pas de bandeau de bienvenue, pas de « connectez-vous pour voir vos commandes », pas de crema** « vu 12 fois ». L'écran est exactement le même pour un client fidèle et pour un lien reçu dans une messagerie | Aucun. L'absence de personnalisation est ici une règle : une fiche produit ne dispose pas d'une surface personnelle pour la porter |
| **Vide — aucune donnée** | La source renvoie une fiche sans texte descriptif | Le bloc description n'est pas rendu du tout, **pas de « Description bientôt disponible » ni de filet orphelin**. Le reste de l'écran est complet | Aucun. Une chaîne d'attente pour une donnée marchande invente une promesse que le marchand n'a pas faite |
| **Erreur de chargement** | La source ne répond pas et aucune copie locale n'est lisible | `Panneau d'état · indisponible` centré dans la zone produit, libellé du design system §5, sujet catalogue : « Indisponible pour le moment. La fiche n'a pas été effacée. » Action « Réessayer » | Le bouton d'action **disparaît** plutôt que de se rendre inerte : un bouton « Ajouter au panier » sous une fiche morte promet une action qu'on ne peut pas tenir |
| **Erreur de soumission** | L'ajout au panier échoue, ou le panier ne peut pas être relu | `Barre de panier` à l'état `indisponible`, slot `raison-indisponibilite` rempli : « Panier non relu. Réessayer avant de payer. ». Le bouton d'ajout repasse en `primaire` avec son libellé, et l'échec est porté par la barre, pas par le bouton (design system §5 Bouton) | Un `Encart · erreur` d'une ligne s'affiche au-dessus du bouton avec le texte de l'action à faire. **Aucun toast** : un toast disparaît, et un panier qu'on croit enregistré ne disparaît pas |
| **Succès** | L'ajout au panier aboutit | La barre de panier bascule de `absente` à `remplie` et **pousse** la fiche vers le haut ; le bouton d'ajout revient à son état reposé avec un `feedback` de 1,2 s sur son libellé — « Ajouté ✓ » — puis son libellé d'origine | Aucune notification, aucun toast, aucune animation d'entrée d'image : le résultat est visible sur place dans la barre |
| **Hors-ligne / permissions** | Ouverture sans réseau (particulièrement : lien de messagerie reçu en hors-ligne) | La copie locale rend la fiche **entière**, avec son âge : bandeau `--color-info #2A5470` en tête, texte du design system §5 « Affiché hors ligne — il y a X h. ». Le prix affiché est **celui de la copie**, et il est daté : c'est ce qui empêche la fraîcheur prétendue (B19) | **Aucune action d'écriture n'est proposée** (E6, C8) : le bouton « Ajouter au panier » est **remplacé** par un `Encart · hors-ligne` « Hors ligne — l'ajout au panier est impossible. » avec la raison écrite. Il n'est ni grisé ni caché sans explication. Les autres fiches restent navigables depuis les autres écrans |
| **Lecture seule** | Hors-ligne, ou compte créé sans correspondance confirmée | La fiche est rendue **en entier**. Aucun `Panneau d'état · acces-refuse` n'est posé ici : B1 et C4 interdisent que la lecture d'un produit dépende d'un compte. Le seul élément conditionné est l'action d'ajout au panier, qui dépend d'une écriture réseau | Aucun. L'écran ne signale jamais au visiteur qu'il lui manque quelque chose pour voir ce qu'il voit déjà |

> Un état non décrit est un état non implémenté. Aucun de ces neuf ne présente un compteur, et l'action « Réessayer » n'apparaît que là où une lecture a réellement échoué (C7).

---

## 5. Interactions

| Élément | Événement | Comportement | Feedback visuel | État résultant | ID |
|---|---|---|---|---|---|
| Bouton « Ajouter au panier » | tap | Lecture du panier, ajout de la variante affichée, réécriture du panier chez la source | Bouton en `chargement` (largeur inchangée), puis libellé « Ajouté » pendant 1,2 s, puis retour au repos | Barre de panier `absente` → `remplie` | B12 |
| Bouton « Ajouter au panier » | tap sur produit en rupture | **Le bouton n'est pas rendu.** Un `Encart · erreur` occupe sa place avec le libellé de rupture du marchand | Aucun : il n'y a pas de cible tactile morte sur cette fiche | Rempli, sans action | B6 |
| Barre de panier — « Payer sur la boutique » | tap | Relecture du panier ; si elle réussit, ouverture de l'URL de checkout de la boutique **pour ce panier précis** ; si elle échoue, **rien ne s'ouvre** et rien ne part vers le paiement | Bouton `chargement`, puis `desactive` avec la raison écrite à côté | Panier — état `indisponible` | E11, B12 |
| Barre de panier — libellé produit | tap | Navigation vers `/panier` | Pressé 120 ms | Panier | B12 |
| Retour système (iOS) / geste (Android) | geste | Retour à l'écran d'origine, rail de recherche ou commande comprise, sans refetch | Transition `--duration-slow 320ms`, seule durée qui s'applique au retour arrière | écran d'origine | — |
| Lien profond vers une variante | ouverture | `/produit/[handle]/[variant]` rend la variante désignée avec le même gabarit ; une variante inconnue rend `Panneau d'état · introuvable` | Aucun | Hors-ligne ou Erreur de chargement selon la source | B1 |

- **Focus / clavier** : ordre de tabulation égal à l'ordre de lecture — bloc d'identité, puis bloc livraison, puis bouton d'action, puis barre de panier. Le bouton de retour système est le premier nœud focalisable. Aucune cible n'est atteignable au clavier sans l'être au doigt, et aucun geste n'est la seule voie d'une action.
- **Gestes** : défilement vertical natif, pull-to-refresh. **Aucun swipe n'a d'effet** sur cette fiche, et en particulier le swipe horizontal ne change pas de variante : au MVP il n'y a pas de matrice de variantes, donc un swipe qui en change une serait une promesse tenue par le geste et pas par la donnée.
- **Animations** : `--duration-fast 120ms` sur les pressés ; `--duration-normal 200ms` à l'apparition de la barre de panier ; `--duration-slow 320ms` au retour arrière seulement. Aucune animation ne précède la première donnée utile, et toutes tombent à zéro si le système demande une réduction des animations.
- **Retour arrière** : retour vers l'écran d'origine avec sa position de défilement. Depuis un lien profond de messagerie, le retour arrière **ne quitte pas l'application vers la messagerie** sans geste explicite : la navigation interne d'Expo Router gère la pile, et le client qui veut répondre à son message utilise le geste système.

---

## 6. Responsive

| Breakpoint | Comportement | Ce qui se replie / disparaît |
|---|---|---|
| **Mobile** | **Seul format livré et seul format de référence** : `--format-320 320 × 568`. Marge `--space-lg 24px`, zone utile 272 px ; la photo est un carré de 272 × 272 px qui occupe le tiers supérieur de l'écran ; le bloc d'identité tient en haut sans défilement sur un nom de deux lignes, et le bouton d'action reste au-dessus de la barre de panier sans jamais être masqué | Rien ne disparaît. La seule chose qui rétrécit est la hauteur visible de la description, qui se parcourt |
| **Tablet** | **Hors périmètre en v1** — C10 exclut tablette et web ; le roadmap §4.2 conditionne leur retour à une part de sessions tablette mesurée pendant la fenêtre, au-dessus d'un seuil écrit avant publication | Non conçu. Aucun centrage de la fiche dans une colonne large, aucune photo à deux colonnes |
| **Desktop** | **Hors périmètre en v1**, même raison, même seuil. Le format de référence unique est `--format-320` | Non conçu |

- **Cible tactile** : bouton d'action `lg` **56 px** ; bouton de retour système 44 × 44 px ; barre de panier, action de paiement 48 px ; liens textuels de la description 44 px de hauteur de ligne.
- **Débordement** : garanti sans débordement à tout réglage de police — le nom du produit (`--text-h2`, retour à la ligne libre, jamais tronqué) ; la collection (`--text-overline`, retour à la ligne autorisé, jamais tronquée) ; le prix (chiffres tabulaires, `flex-wrap` autorisé pour les montants longs, jamais rogné) ; le libellé de disponibilité de la source (`Pastille de statut`, deux lignes au maximum puis retour à la ligne, jamais coupé) ; la description (bloc de texte libre, aucun conteneur de hauteur fixe) ; **le bouton d'action ne perd jamais son libellé** au réglage de police maximal (E3, C12).
- **Réglage de police** : aucun conteneur de texte n'a de hauteur fixe ; la barre de panier **grandit** avec le texte et repousse le contenu vers le haut au lieu de le recouvrir (design system §5 Barre de panier). Au réglage maximal, le bouton d'action passe à deux lignes et reste entièrement atteignable.

---

## 7. Accessibilité

- [x] **Contraste du texte courant** — `--color-texte-principal #161A19` sur `--color-background #F1EDE5` pour le nom, le prix et la description ; `--color-texte-secondaire #5A544A` sur `--color-background` pour les libellés de la source et la livraison ; `--color-texte-inverse #FBF8F2` sur `--color-encre-700 #1B2220` pour le libellé du bouton d'action ; `--color-texte-inverse` également sur `--color-erreur #A03427` et `--color-succes #2A6349` pour les pastilles pleines. Le seuil appartient à `design-check contrast`.
- [x] **Contraste des grands textes** — `--text-h2 24/30` et `--text-h3 20/26 700` posés sur `--color-background` uniquement, jamais sur une teinte sémantique ; les libellés de pastille sont posés sur les fonds `--color-succes-doux`, `--color-attention-doux`, `--color-erreur-doux` et `--color-info-doux` avec les tokens `--color-*-fort` correspondants.
- [x] **Navigation clavier complète** — sur matériel, ordre de tabulation égal à l'ordre de lecture, le bouton de retour système en premier. La zone photo est **hors du parcours de tabulation** : une image n'est pas une cible.
- [x] **Focus visible** — anneau de 2 px en décalage de 2 px, couleur `--color-bordure-focus #1B2220`, présent sur le bouton d'action, le retour système et les liens de la description, jamais un simple changement de couleur de bordure.
- [x] **ARIA** — l'écran est titré par le nom du produit, donc le nom accessible du nœud racine est ce nom et non « Fiche produit » ; le bouton d'action a un nom accessible qui **inclut le nom et le prix** (« Ajouter Manteau laine mérinos, 189,00 € au panier ») pour qu'un lecteur d'écran n'ait pas à revenir au bloc d'identité ; la `Pastille de statut` est annoncée par son libellé complet et non par sa couleur ; la barre de panier est une `region` étiquetée « Panier » ; l'`Encart` qui remplace une action impossible est annoncé par `aria-live="polite"` quand il apparaît après un appui ; le bandeau d'âge hors ligne est un `status`, pas un `alert`.
- [x] **Alternatives textuelles** — la photo porte le texte alternatif du marchand ou, à défaut, « Photo de {nom du produit} » ; le cadre vide porte une alternative vide et `aria-hidden`, car une trame ne décrit rien ; la zone photo entière est annoncée une seule fois, pas comme une zone d'image décorative et une zone de texte.
- [x] **Langue et direction de lecture** — `lang="fr"`, `dir="ltr"`, une seule langue, aucune couche d'internationalisation (C5, B20).

---

## 8. Données

| Champ | Type | Origine | Requis | Erreur possible |
|---|---|---|---|---|
| Handle | texte | Route — le handle Shopify fait foi (conventions, nommage) | oui | Handle absent de la route → l'onglet n'ouvre pas l'écran ; handle inconnu → `Panneau d'état · introuvable` |
| Variante affichée | objet variante | Source marchand — **la variante que la source désigne par défaut**, ou celle du paramètre `[variant]` | oui | Absente → la fiche rend ce que la source fournit, sans variante inventée |
| Nom | texte | Source marchand | oui | Absent → `--text-h2` rendu vide à sa hauteur, jamais complété (B23) |
| Collection / fournisseur | texte | Source marchand | non | Absent → la ligne d'overline n'est pas rendue |
| Photo | URL d'image | Source marchand | non | Absente → trame `--color-encre-200`, le reste de la fiche intact |
| Prix | texte, tel que fourni | Source marchand | oui | Absent → ligne de prix **vide à sa hauteur**, jamais recalculée ni complétée ; l'application ne mémorise aucun prix (E7) |
| Disponibilité | libellé du marchand | Source marchand | non | Absent → **aucune pastille** : l'application n'écrit jamais « En stock » ni « Épuisé » de sa propre initiative (B6) |
| Date de réassort | date | Source marchand | non | Absente → aucune pastille de réassort, jamais une estimation |
| Description | texte brut | Source marchand | non | Absente → bloc non rendu, pas de message d'attente |
| Lignes du panier | tableau | Source marchand | non | Non relu → `Barre de panier` en `indisponible` (E11) |
| Âge de la copie locale | horodatage | Cache local, affiché tel quel | oui si hors-ligne | Jamais absent : une donnée rejouée sans âge n'est pas rendue (B19) |

- **Chargement** : **pas de pagination et pas de chargement différé au défilement.** Toute la fiche tient dans une seule réponse : c'est la condition mécanique de C6, et la raison pour laquelle la galerie et les produits liés sont hors du MVP — deux requêtes de plus sur le chemin critique seraient deux occasions de dépasser les deux secondes.
- **Cache / hors-ligne** : copie **en lecture seule** du produit et de sa variante, rattachée au compte pour la liste des produits récemment vus (B16). Aucune écriture hors ligne : l'ajout au panier n'existe pas hors ligne (C8, E6).
- **Données sensibles** : aucune donnée personnelle n'est nécessaire pour rendre cet écran, donc aucune n'y est demandée. Le produit vu est écrit dans la base applicative rattachée au compte, **jamais dans un événement d'audit** : l'identifiant produit peut être envoyé, l'identité du client non (C9).
- **Instrumentation (PRD §8, C9)** : `ficheProduitOuverte` (handle produit, source d'arrivée : rail, recherche, commande ou lien profond — jamais d'identifiant de personne), `ajoutPanier` (handle, variante, résultat), `sortiePaiementLancee` (nombre de lignes, montant total — **jamais d'identifiant de commande ni d'adresse**). Le critère principal du PRD §8 — 8 % de sessions terminées par une sortie vers le paiement — se lit sur `sortiePaiementLancee` rapporté aux sessions.

---

## 9. Traçabilité

| ID | Origine | Manifestation sur cet écran |
|---|---|---|
| **B1** | PRD | Aucune rétention, aucun mur d'accès, aucun `acces-refuse`. La fiche s'ouvre depuis un lien de messagerie sans compte, et son contenu ne dépend d'aucune identification. C'est le chemin d'acquisition principal de l'application |
| **B12** | PRD | Le panier se construit ici ; la sortie vers le paiement passe par la barre de panier, qui **relit le panier** avant d'ouvrir l'URL de checkout de la boutique. L'application ne voit jamais de numéro de carte (C3) |
| **B19** | PRD | Hors ligne, la fiche porte son âge dans un bandeau `--color-info` en tête de l'écran, et le prix affiché est celui **de la copie datée** : aucune fraîcheur n'est simulée. L'écran devient intégralement en lecture |
| **B23** | PRD | Le catalogue n'est ni corrigé, ni complété, ni mis en forme : photo non retouchée, prix rendu brut et vide conservé à sa hauteur, description rendue **en texte brut** — le balisage éventuel du marchand est affiché littéralement, jamais interprété, parce que l'interpréter serait une mise en forme de notre main et une requête réseau de plus sur le chemin critique |
| **E6** | PRD | Fiche ouverte hors connexion : copie complète affichée avec son âge, **aucune action d'écriture proposée** — le bouton d'ajout au panier est remplacé par un encart qui donne la raison, pas rendu inerte en silence |
| **E11** | PRD | La sortie vers le paiement exige une **relecture** du panier. En cas d'échec, rien ne s'ouvre, la barre passe en `indisponible` avec sa raison écrite et l'action « Réessayer » apparaît. L'application ne procède jamais avec un panier qu'elle n'a pas relu |
| **C3** | PRD | Aucun champ de saisie de paiement, aucun numéro de carte, aucun montant de frais calculé par l'application. Le bouton de la barre de panier **nomme sa destination** et porte une icône droite réservée à cet usage (design system §5 Bouton) |
| **C4** | PRD | Le produit est consultable sans compte, y compris depuis un lien partagé et hors ligne. Le premier écran doit être utile déconnecté : ici, il l'est entièrement, à l'exception de l'ajout au panier |
| **C8** | PRD | Cache produit **en lecture seule**, portant son âge. Toute écriture hors ligne est exclue, y compris l'ajout au panier, qui n'est pas proposé du tout hors ligne |
| **C6** | PRD | Fiche utile en moins de deux secondes sur 4G : **une seule requête**, aucun chargement différé au défilement, texte affiché avant la photo, aucun appel réseau déclenché par le geste. La vérification manuelle du chiffre est une slice du MVP (roadmap §2.1) |

---

## 10. Checklist de gate

- [x] Les 9 états sont décrits avec un rendu concret.
- [x] Chaque élément interactif a un comportement et un feedback.
- [x] Le responsive est défini à **chaque** breakpoint du design system — Mobile livré, Tablet et Desktop **écrits comme hors périmètre** avec leur condition de retour.
- [x] La section Anti-générique est cochée et justifiée.
- [x] Aucune valeur de design n'est laissée à « à définir ».
- [x] Chaque ID B*/E*/C* de l'écran apparaît en section 9.
- [x] `node "$FORGE/scripts/forge-guard.js" placeholders <anchor>` ne signale rien ici.
- [x] L'écran reste cohérent avec `.forge/design/design-system.md`.