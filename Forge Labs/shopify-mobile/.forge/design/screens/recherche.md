---
type: screen
slug: recherche
title: Recherche
module: recherche
status: draft
generated_at: 2026-09-30
derived_from:
  - .forge/prd.md
  - .forge/design/design-system.md
rule_ids: [B10, B11]
edge_case_ids: []
flow: recherche-reference
---

# Écran — Recherche

> Ce document est la **source de vérité** pour qu'une IA génère l'interface de cet écran.
> Il est généré depuis ce gabarit, jamais recopié. Aucun `{{PLACEHOLDER}}` ne doit subsister.

---

## 1. Rôle de l'écran

| | |
|---|---|
| **Archétype d'app** | `mobile_consumer` — téléphone seul, iOS et Android, un seul marché (C10) |
| **Module** | `recherche` — rang 2 dans la navigation |
| **Route** | `/recherche` |
| **Type** | page — onglet racine du module Recherche |
| **Utilisateurs** | Les trois personas, sans compte : la recherche ne demande aucune identification (B1, C4) |
| **User stories servies** | US-5 |
| **Règles métier** | B10, B11 |
| **Edge cases** | aucun dans le MVP |

**Une phrase** : cet écran permet au client de retrouver une référence précise par son nom, en partant d'une page qui lui montre déjà quelque chose, afin de ne jamais arriver devant un champ vide et rebrousser chemin.

**Pourquoi il est au rang 2 de la navigation** : fréquence 4, centralité 3 (design system §4). Retrouver une référence est le besoin décisif du client fidèle, mais le catalogue reste atteignable par les rails de l'accueil : elle ne conditionne aucune autre tâche. Son rang est provisoire et **mesurable** — le PRD §8 a écrit d'avance que, si moins de 12 % des sessions commencent par une saisie pendant quatre semaines, Recherche passe derrière Commandes ou disparaît au profit d'un accès depuis l'accueil.

**Ce que ce rang provisoire oblige à faire à l'écran** : un onglet au rang 2 doit se distinguer d'un onglet au rang 4. Il ne se distingue pas par une couleur, il se distingue parce qu'il **a un contenu avant d'avoir une fonction**.

---

## 2. Direction visuelle de cet écran

Repris du design system — **valeurs concrètes, jamais « à définir »**.

| | |
|---|---|
| **Mood** | « chaleureux, dense, sans emphase » — repris du design system §0 |
| **Densité** | **dense** — c'est l'écran de comparaison : deux ou trois résultats se jugent d'un coup d'œil sur le nom, la disponibilité et le prix. Un résultat qui occupe un demi-écran supprime la comparaison |
| **Niveau de contraste** | **fort** — le champ de saisie est le seul élément interactif de premier rendu sur cet écran, et il doit être trouvé sans chercher ; son fond `--color-surface-sunken` se détache du papier sans bordure ni ombre |
| **Surface** | `--color-surface-sunken #E7E2D7` pour le champ, `--color-background #F1EDE5` pour tout le reste — aucun bloc de cet écran ne mérite une feuille : les résultats sont posés sur le papier, séparés par le filet `--color-secondaire #D9D2C4` |
| **Accent utilisé** | `--color-encre-700 #1B2220` sur le bouton `primaire` du clavier et sur l'icône de la loupe active. **Aucune teinte sémantique** tant que le client n'a rien saisi : le seul chroma possible est la `Pastille de statut` de réassort ou de rupture sur la photo d'un résultat |
| **Traitement photographique** | photo du marchand en vignette carrée de 72 px dans les résultats, et 1:1 de 128 px dans le rail d'ouverture ; jamais retouchée (B23) |
| **Référence** | Zalando mobile pour la densité d'une liste de résultats et le prix en chiffres tabulaires ; l'entrée plein écran de la barre de recherche système, dont on reprend la posture mais pas le composant |

### 2.1 Anti-générique — obligatoire

- [x] Pas de fond **blanc pur** `#FFFFFF` — le fond est `--color-background #F1EDE5` ; le champ est `--color-surface-sunken #E7E2D7`, une surface enfoncée, pas un rectangle blanc posé sur du blanc.
- [x] **Pas de carte ombrée pour tout** — un résultat est une ligne de 96 px sur le papier avec un filet de séparation ; pas de fond, pas d'ombre, pas de coins arrondis.
- [x] **Pas d'uniformité** : le rail d'ouverture est en `--text-h2`, le champ en `--text-body 17/25`, le nom d'un résultat en `--text-h3 20/26`, sa disponibilité en `--text-caption 14/19`, le prix en chiffres tabulaires à `--text-h3`. Le rapport 24 → 17 → 20 → 14 porte la hiérarchie ; l'espacement, lui, est volontairement irrégulier : `--space-lg` entre le rail et le champ, `--space-sm` entre le nom et le prix.
- [x] **Pas de gris neutre générique** — l'encre est une famille verte froide choisie, et le texte d'appoint est `#5A544A`, un brun chaud qui appartient à la même terre que le fond papier.
- [x] **Pas de mise en page centrée symétrique** — le champ et les résultats sont calés à gauche sur `--space-lg 24px`, la liste occupe la largeur entière, et le rail d'ouverture défile horizontalement avec sa tuile suivante débordant à droite.
- [x] **Pas d'illustration d'appoint générique** — un résultat sans résultat n'affiche ni icône dans un cercle, ni dégradé, ni emoji : il affiche une phrase et une action.
- [x] **Pas d'une seule famille de police** — les prix et les quantités passent en SF Mono / Roboto Mono, ce qui aligne les chiffres en colonne et évite qu'un passage à trois chiffres décale chaque ligne.

**Choix assumé et non neutre** : **le contenu est au-dessus du champ.** B10 l'impose (« il présente d'abord un contenu, le champ ensuite ») et US-5 le redit dans son critère d'acceptation. C'est un choix contre-intuitif — un écran de recherche sans champ en tête est illisible — et c'est justement ce qui distingue cet onglet d'une barre de recherche déplacée. Le rail d'ouverture est donc **un rail bas et unique**, de 128 px de hauteur avec son titre, qui tient entièrement au-dessus du champ à `--format-320` ; le champ est immédiatement dessous, à portée du pouce, et le reste de la page ne s'atteint qu'après le champ. Le double bénéfice est réel : l'onglet n'est jamais vide (B10), et le client qui tape voit tout de suite où il tape.

**Second choix, contestable** : la recherche ne propose ni historique de saisie, ni suggestion de correction, ni résultat « populaire ». Un historique de saisie est une donnée personnelle et C9 n'autorise aucun consentement d'audience avant la première session : l'afficher avant que le client ait consenti serait précisément l'écart que C9 interdit. Les suggestions viennent donc **du marchand**, pas de nous.

---

## 3. Anatomie

```
Écran "/recherche" — onglet
├─ Rail d'ouverture — "De retour en stock"                     ← B10 : contenu avant le champ
│    └─ Rail horizontal, tuiles 128 px, au moins 40 px de la suivante visibles
├─ Champ de saisie — pleine largeur, hauteur 56 px, focus au montage
│    └─ Loupe à gauche, bouton "Effacer" à droite quand la saisie n'est pas vide
├─ Zone basse — deux rendus selon l'état
│    ├─ "sans saisie"  → Rail "Nouveautés" + Rail "Revus récemment" (si le compte en a)
│    └─ "avec saisie"  → Liste de résultats (photo 72 px, nom, disponibilité, prix)
└─ Barre d'onglets (4 items, recherche active)
```

| # | Composant | Rôle | Source |
|---|---|---|---|
| 1 | Rail horizontal | Le contenu qui rend l'onglet non vide en premier écran | design-system §5 (Tuile produit) |
| 2 | Champ de saisie | Saisie du nom de produit, plein format, focus au montage | design-system §5 |
| 3 | Ligne de résultat | Variante compacte de la tuile, 96 px, alignée sur une grille de lecture | slice-local, sur design-system §5 |
| 4 | Pastille de statut | Réassort ou rupture, sur la photo du résultat | design-system §5 |
| 5 | Panneau d'état | Zéro résultat — une seule fois, sans « Réessayer » | design-system §5 |
| 6 | Barre d'onglets | Navigation entre les quatre modules | design-system §5 |

**Grille de lecture du résultat.** Photo 72 × 72 px à gauche, gouttière `--space-md 16px`, puis une colonne de texte qui occupe le reste : nom en `--text-h3` sur deux lignes au maximum, disponibilité en `--text-caption`, prix en chiffres tabulaires aligné à droite sur la même ligne que la disponibilité. Ligne entière cliquable, hauteur 96 px, cibles largement au-dessus de 44 pt.

---

## 4. États — tous, sans exception

| État | Déclencheur | Rendu | Feedback utilisateur |
|---|---|---|---|
| **Chargement** | Ouverture de l'onglet, rail d'ouverture et zone basse en cours de lecture | **Aucun squelette pleine page (B8).** Le champ de saisie s'affiche immédiatement avec le focus, le titre du rail aussi. Le rail se remplit tuile par tuile ; chaque tuile peut afficher son nom et son prix avant sa photo (§ B8 côté tuile). La liste de résultats affiche des lignes de 96 px à hauteur fixe en squelette, **six au maximum** | Le focus est déjà dans le champ : le client peut taper avant que quoi que ce soit soit chargé. Aucun indicateur global |
| **Rempli** | Des résultats existent pour la saisie | Liste de résultats sous le champ ; le rail d'ouverture reste **visible au-dessus**, donc l'écran ne perd jamais son contenu de premier rendu | Aucune. Le résultat qui correspond le mieux est le premier, celui du marchand ; l'application ne le réordonne pas (B23) |
| **Vide — jamais visité** | Premier lancement, aucune saisie, aucun historique de recherche | Le rail d'ouverture est plein, le champ est vide et focalisé, le rail « Nouveautés » est dessous. Le rail « Revus récemment » est simplement absent s'il n'y a rien : il n'y a pas de place à remplir | Aucun. Aucun texte d'accueil (« Que cherchez-vous ? »), aucun bandeau |
| **Vide — aucune donnée** | Saisie au moins de deux caractères, **zéro résultat** renvoyé par la source | `Panneau d'état · aucune-donnee` sur une ligne, **sans illustration**, avec le terme recherché cité entre guillemets : « Aucun produit ne correspond à « laine mérinos ». ». Action : « Voir les nouveautés », qui retire la saisie et rend les deux rails. Le champ reste éditable, la saisie conservée | **Ni compteur à 0, ni la mention « 0 résultat », ni « Réessayer »** : une recherche qui ne trouve rien n'a pas échoué, elle a répondu (C7). Le rail d'ouverture reste en haut, donc l'écran n'est pas vide |
| **Erreur de chargement** | La source ne répond pas, aucune copie locale des résultats | `Panneau d'état · indisponible` dans la zone basse seulement. Libellé du design system §5, sujet catalogue : « Indisponible pour le moment. Le catalogue n'a pas été effacé. » Action « Réessayer » | Le champ reste **entièrement utilisable pendant l'erreur** : on peut retaper, et la nouvelle saisie remplace l'erreur. Le rail d'ouverture reste rendu si sa copie est lisible |
| **Erreur de soumission** | La saisie est refusée avant tout appel — moins de deux caractères, ou espaces seuls | Aucun appel réseau. Le champ passe en état `erreur` : filet `--color-erreur #A03427` de 2 px, message d'action en dessous « Deux caractères au moins. » en `--color-erreur-fort #8E2B1F`. **La saisie n'est jamais effacée** | Le focus reste dans le champ, le curseur en place, la zone basse montre son état « jamais visité ». Jamais de toast, jamais de perte du contenu |
| **Succès** | La saisie a produit des résultats | La liste remplace les deux rails du bas, le rail d'ouverture reste. La ligne qui a été ouverte depuis les résultats est mémorisée localement pour le rail « Revus récemment » | Aucun toast : le résultat est visible sur place. L'événement d'instrumentation de saisie part ici |
| **Hors-ligne / permissions** | Réseau absent au moment de la saisie | La copie locale des produits est cherchée localement et, **seulement si elle existe**, les correspondances sont affichées avec un bandeau `--color-info` par ligne « Affiché hors ligne — il y a X h ». Si aucune copie ne peut être cherchée : `Panneau d'état · hors-ligne` « Affiché hors ligne. Dernière mise à jour il y a X h. » avec action « Réessayer » | La saisie reste possible et conservée. **Aucune promesse de résultat hors ligne** : l'application ne laisse pas croire qu'elle va chercher dans le vide |
| **Lecture seule** | Hors-ligne, ou compte sans correspondance confirmée | La recherche est rendue en entier. Aucun `Panneau d'état · acces-refuse` n'est posé sur cet écran : la recherche est une fonction catalogue, donc sans compte. Le rail « Revus récemment » dépend du compte et disparaît silencieusement ; il ne laisse ni vide ni explication | Aucun. La perte d'un rail dépendant du compte ne peut pas ressembler à un échec de lecture |

> Un état non décrit est un état non implémenté. Aucun de ces neuf ne propose « Réessayer » sur un état qui n'a pas échoué : c'est la seule contrainte que cet écran doive retenir du panneau d'état (C7).

---

## 5. Interactions

| Élément | Événement | Comportement | Feedback visuel | État résultant | ID |
|---|---|---|---|---|---|
| Champ de saisie | focus au montage | Le champ reçoit le focus dès que l'écran s'affiche ; le clavier s'ouvre | Anneau `--color-bordure-focus` 2 px, curseur clignotant | Rempli / saisie vide | B11 |
| Champ de saisie | saisie d'au moins 2 caractères | Appel à la recherche de la source après 250 ms d'inactivité ; chaque frappe annule la précédente | Aucune animation de chargement pendant la frappe : la liste se remplace quand la réponse arrive, sans shimmer | Rempli ou Vide — aucune donnée | B10 |
| Bouton « Effacer » | tap | Vide le champ, rend les deux rails du bas | Le bouton disparaît dès que le champ est vide, sans animation de sortie | Vide — jamais visité | B10 |
| Ligne de résultat | tap | Navigation vers `/produit/[handle]` | Aucun pressé long de 120 ms ; la transition est immédiate | Produit | B1 |
| Tuile du rail d'ouverture | tap | Navigation vers `/produit/[handle]` | idem | Produit | B1 |
| Action « Voir les nouveautés » (zéro résultat) | tap | Vide la saisie, rend les deux rails | Retour immédiat à l'état de premier rendu | Vide — jamais visité | C7 |
| Action « Réessayer » (erreur de chargement) | tap | Relance **la seule** requête qui a échoué, pas l'écran entier | Le bouton passe en `chargement`, largeur inchangée, libellé conservé en accessibilité | Rempli ou Erreur de chargement | B7 |
| Barre d'onglets | tap | Changement d'onglet, pile propre à chaque onglet | Fond pressé `--color-surface-sunken`, 120 ms | onglet correspondant | — |

- **Focus / clavier** : le focus est posé dans le champ au montage, ce qui est la seule exception à l'ordre de tabulation du reste de l'écran ; ensuite l'ordre suit la lecture, rail d'ouverture puis zone basse puis barre d'onglets. Le clavier matériel (barre d'espace, tabulation) n'est pas piloté comme un clavier de bureau : les touches de tabulation ne sont pas interceptées, et aucune touche ne supprime un caractère sans passer par le champ.
- **Gestes** : défilement vertical natif, défilement horizontal sur le rail d'ouverture, pull-to-refresh. **Effacer le champ par geste balayé est interdit** : à 200 % de police, le curseur et le clavier système se disputent déjà la zone, et un effacement accidentel détruit une saisie que le client a dû composer au doigt. L'effacement est un bouton de 44 pt, toujours visible, jamais une gesture.
- **Animations** : `--duration-fast 120ms` pour le pressé et l'apparition du bouton « Effacer » ; **aucune animation sur la liste de résultats** — remplacer une liste sous le curseur pendant qu'il tape est le pire endroit du produit pour un fondu de 320 ms ; `--duration-slow 320ms` réservé au retour arrière.
- **Retour arrière** : depuis un résultat, le retour rend cette écran **avec la saisie et la liste telles qu'elles étaient**, pas dans son état de premier rendu : on ne fait pas recharger une recherche que le client vient de faire. Depuis une saisie ouverte puis quittée, le retour rend l'écran de premier rendu.

---

## 6. Responsive

| Breakpoint | Comportement | Ce qui se replie / disparaît |
|---|---|---|
| **Mobile** | **Seul format livré et seul format de référence** : `--format-320 320 × 568`. Marge `--space-lg 24px`, champ de 56 px sur toute la largeur, rail d'ouverture de 128 px de hauteur ; le champ reste entièrement visible sous le rail, sans défilement. Ligne de résultat : photo 72 px + gouttière 16 px + colonne de texte de 208 px | Rien ne disparaît. Au réglage de police le plus élevé, le champ passe à deux lignes et le rail reste entièrement au-dessus : c'est la seule contrainte que la densité ne peut pas faire sauter |
| **Tablet** | **Hors périmètre en v1** — C10 exclut tablette et web de la version 1 ; le roadmap §4.2 subordonne leur retour à une part de sessions tablette mesurée pendant la fenêtre de mesure, au-dessus d'un seuil écrit avant publication | Non conçu. Aucun champ à largeur max, aucune grille à trois colonnes |
| **Desktop** | **Hors périmètre en v1**, même raison, même seuil de retour. Le format de référence unique est `--format-320` | Non conçu. Le clavier matériel du bureau n'est pas une cible : la saisie se fait au clavier système |

- **Cible tactile** : champ 56 px de haut et pleine largeur ; bouton « Effacer » 44 × 44 px ; ligne de résultat 96 px de haut ; tuile du rail 128 px ; barre d'onglets 56 px par entrée (taille `lg` du bouton, seule taille dont la hauteur dépasse 44 pt avec une icône de 20 px).
- **Débordement** : garanti sans débordement à tout réglage de police — le champ (pleine largeur, retour à la ligne autorisé, jamais tronqué) ; le nom d'un résultat (`--text-h3`, deux lignes puis `…`) ; le terme cité dans le message « Aucun produit ne correspond à « … » » (retour à la ligne autorisé, jamais tronqué — tronquer le terme ferait croire à une faute de frappe qui n'existe pas) ; le prix (chiffres tabulaires, aligné à droite, jamais rogné) ; le titre du rail (`--text-h2`, retour à la ligne autorisé).
- **Réglage de police** : aucun conteneur de texte n'a de hauteur fixe, et la ligne de résultat **grandit** au lieu de tronquer. C'est la vérification manuelle de E3, qui se fait sur un téléphone réel avec un lecteur d'écran et non sur un émulateur (conventions § tests).

---

## 7. Accessibilité

- [x] **Contraste du texte courant** — `--color-texte-principal #161A19` pour le nom d'un résultat, le terme de recherche et le titre du rail, posé sur `--color-background #F1EDE5` ; `--color-texte-secondaire #5A544A` pour la disponibilité et le message d'erreur de saisie, posé sur le fond **enfoncé** `--color-surface-sunken #E7E2D7` ; `--color-texte-inverse #FBF8F2` sur `--color-encre-700 #1B2220` pour l'icône de la loupe active. Le seuil appartient à `design-check contrast`, il n'est pas écrit ici.
- [x] **Contraste des grands textes** — `--text-h2 24/30` sur `--color-background` uniquement ; les libellés de `Pastille de statut` sont posés sur les fonds `--color-succes-doux` et `--color-erreur-doux` avec `--color-succes-fort` et `--color-erreur-fort` respectivement, et le libellé porte le sens, jamais la couleur seule.
- [x] **Navigation clavier complète** — sur matériel : focus posé dans le champ au montage, ordre de tabulation ensuite strictement égal à l'ordre de lecture, rail d'ouverture annoncé comme groupe avec son titre, chaque ligne de résultat annoncée par « nom du produit, prix, disponibilité ».
- [x] **Focus visible** — anneau de 2 px en décalage de 2 px, couleur `--color-bordure-focus #1B2220`, sur le champ comme sur les lignes et les tuiles ; jamais un simple changement de couleur de bordure, invisible sur un fond rempli.
- [x] **ARIA** — le champ est `role="search"` avec `aria-label` ; la zone basse est une `region` étiquetée « Résultats de recherche » et passe d'un `list` à un `role="status"` avec `aria-live="polite"` **uniquement** au moment où le nombre de résultats change, de façon à ce qu'un lecteur d'écran annonce « 3 produits trouvés » sans annoncer chaque frappe ; la ligne de résultat est un `button` ; le bouton « Effacer » a un `aria-label` « Effacer la recherche » ; le message d'erreur est relié au champ par `aria-describedby` et annoncé par `aria-live="assertive"`.
- [x] **Alternatives textuelles** — la photo du marchand porte le texte alternatif du marchand, ou à défaut « Photo de {nom du produit} » ; une photo absente rend une trame décorative à alternative vide. La loupe et la corbeille du champ sont **décoratives** : leur sens est porté par le nom accessible du bouton, jamais par leur dessin.
- [x] **Langue et direction de lecture** — `lang="fr"`, `dir="ltr"`, une seule langue et aucune couche d'internationalisation (C5, B20).

---

## 8. Données

| Champ | Type | Origine | Requis | Erreur possible |
|---|---|---|---|---|
| Terme saisi | texte | Saisie du client, conservé en mémoire d'écran | oui | Moins de deux caractères → validation locale, aucun appel réseau ; les espaces seuls sont normalisés avant envoi |
| Résultats | tableau de produits | Recherche de la source marchande, jamais indexée chez nous | oui | Tableau vide → état « aucune donnée » de la ligne ; réponse en erreur → état d'indisponibilité, jamais un tableau vide |
| Photo d'un résultat | URL d'image | Source marchand | non | Absence → trame `--color-encre-200`, nom et prix conservés |
| Prix | texte, tel que fourni | Source marchand | oui | Valeur absente → ligne de prix rendue **vide à sa hauteur**, jamais complétée ni recalculée (B23) |
| Disponibilité | libellé du marchand | Source marchand | oui | Absente → aucune pastille, aucun libellé inventé |
| Produits récemment consultés | tableau de produits | Base applicative, rattaché au compte (B16) | non | Absent ou vide → le rail « Revus récemment » n'est pas rendu, sans explication |
| Âge de la copie locale | horodatage | Cache local, affiché tel quel | oui si hors-ligne | Jamais absent : une donnée rejouée sans âge n'est pas rendue (B19) |

- **Chargement** : **pas de pagination** — la source renvoie un nombre borné de résultats et l'application affiche exactement ce qu'elle reçoit, sans page suivante ni défilement infini. Une liste de résultats qui se prolonge indéfiniment est le seul endroit où l'utilisateur perd le compte de ce qu'il a déjà vu.
- **Cache / hors-ligne** : copie en **lecture seule** du catalogue, ce qui permet la recherche locale ci-dessus. Aucune écriture hors ligne (C8).
- **Données sensibles** : **le terme saisi n'est jamais envoyé à l'outil d'audit sous forme de texte.** Seuls le fait qu'une saisie a eu lieu et le nombre de résultats sont comptés (C9). Le terme est une donnée personnelle potentielle : il peut contenir un nom, une marque dont le client préfère que personne ne sache qu'il cherche.
- **Instrumentation (PRD §8, C9)** : `sessionDebutSaisie` (émis depuis l'accueil, comme là où la mesure est la plus honnête), `rechercheSaisie` (booléen et nombre de résultats, jamais le terme), `resultatOuvert` (rang du résultat et identifiant produit, aucun identifiant de personne). Le seuil de 12 % du PRD §8 se lit sur `sessionDebutSaisie` rapporté aux sessions : c'est la mesure qui décide du sort de cet onglet.

---

## 9. Traçabilité

| ID | Origine | Manifestation sur cet écran |
|---|---|---|
| **B10** | PRD | Le contenu précède le champ : rail d'ouverture en haut, champ ensuite, deux rails de plus dessous. À la première ouverture, l'écran est déjà plein. Aucun onglet de l'application ne présente un état vide en premier écran |
| **B11** | PRD | Le champ fait **toute la largeur utile** de l'écran, à 24 px des bords, et il est atteint depuis `/` sans aucun défilement grâce à la barre de recherche plein format de l'accueil. Aucun champ n'est réduit à une icône dans un en-tête |
| **C4** | PRD | La recherche est consultable sans compte : aucun `acces-refuse`, aucune demande d'identification. Le rail « Revus récemment » est la seule partie dépendante du compte, et son absence est silencieuse |
| **C7** | PRD | Le zéro résultat ne montre ni « 0 », ni « Réessayer » : c'est une réponse, pas une panne. C'est le seul endroit de l'application où une liste legitimement vide apparaît, et elle reste dans un panneau qui cite le terme au lieu d'afficher un décompte |

**Règles du PRD citées sans être opposables à cet écran** : B7 et B23 sont respectées mécaniquement — la panne de source rend l'état `indisponible` avec « Réessayer », et les résultats sont rendus tels que la source les renvoie, sans réordonnancement ni recalcul de prix. B1 est respectée par absence de mur d'accès.

---

## 10. Checklist de gate

- [x] Les 9 états sont décrits avec un rendu concret.
- [x] Chaque élément interactif a un comportement et un feedback.
- [x] Le responsive est défini à **chaque** breakpoint du design system — Mobile livré, Tablet et Desktop **écrits comme hors périmètre** avec leur condition de retour.
- [x] La section Anti-générique est cochée et justifiée.
- [x] Aucune valeur de design n'est laissée à « à définir ».
- [x] Chaque ID B*/E*/C* de l'écran apparaît en section 9, et les règles du PRD qui s'appliquent sans être opposables sont nommées comme telles.
- [x] `node "$FORGE/scripts/forge-guard.js" placeholders <anchor>` ne signale rien ici.
- [x] L'écran reste cohérent avec `.forge/design/design-system.md`.