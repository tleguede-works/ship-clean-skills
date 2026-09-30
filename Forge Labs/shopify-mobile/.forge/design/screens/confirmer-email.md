---
type: screen
slug: confirmer-email
title: Confirmation d'e-mail
module: compte
status: draft
generated_at: 2026-09-30
derived_from:
  - .forge/prd.md
  - .forge/design/design-system.md
rule_ids: [B2]
edge_case_ids: [E3]
flow: confirmation-compte
---

# Écran — Confirmation d'e-mail

> Ce document est la **source de vérité** pour qu'une IA génère l'interface de cet écran.
> Il est généré depuis ce gabarit, jamais recopié. Aucun `{{PLACEHOLDER}}` ne doit subsister.

---

## 1. Rôle de l'écran

| | |
|---|---|
| **Archétype d'app** | `mobile_consumer` — téléphone seul, iOS et Android, un seul marché (C10) |
| **Module** | `compte` — **sous-écran à entrée externe**, atteint par le lien de l'e-mail de confirmation et par le retour de l'application |
| **Route** | `/confirmer-email` — lien profond porteur du jeton, ouvert depuis la messagerie |
| **Type** | page — point d'entrée depuis une application externe, **hors de la pile d'onglets** |
| **Utilisateurs** | Le client qui vient de créer un compte et qui ouvre le lien de son e-mail. Il peut ne jamais avoir ouvert l'application avant |
| **User stories servies** | US-4 |
| **Règles métier** | B2 |
| **Edge cases** | E3 |

**Une phrase** : cet écran est l'instant unique où un compte devient accès à l'historique — il confirme l'adresse, tente le rapprochement **une seule fois**, et dit au client ce qui a été trouvé, afin qu'il sache immédiatement s'il peut retrouver ce qu'il a acheté.

**C'est le seul écran de l'application qui s'ouvre depuis l'extérieur, et cela change tout son rendu.** Il n'y a ni barre d'onglets, ni historique de navigation, ni référence visuelle à autre chose que le nom de la boutique. Le client peut ouvrir le lien dans un navigateur qui ne connaît pas l'application, ou dans un message sans avoir jamais lancé l'application. Donc : **la première phrase de l'écran dit où il est**, et c'est la seule fois dans toute l'application où cette information est nécessaire.

**Deux décisions de navigation, et ce sont les plus importantes de l'écran.**

**Décision 1 — la destination dépend du résultat, et le résultat négatif ne mène nulle part.** Si la correspondance réussit, l'écran affiche le résultat et propose « Voir mes commandes » vers `/commandes`. **Si elle échoue, l'écran reste** : il affiche « Aucune commande trouvée à cette adresse », propose « Vérifier une autre adresse » si le compteur le permet, et « Voir mes commandes sur la boutique ». Il **ne redirige pas vers `/commandes`**, parce qu'un onglet Commandes rendu vide après un échec fait exactement ce que C7 interdit : il transforme un résultat définitif en affichage vide, et il apprend au client que cet onglet ne sert à rien. Le catalogue, lui, reste à un geste, toujours.

**Décision 2 — c'est le seul moment de l'application où le catalogue n'est pas la destination.** Le lien d'irmation mène à cet écran, pas à `/`. Renvoyer le client vers l'accueil après avoir confirmé son compte reviendrait à lui faire parcourir le catalogue alors que ce qu'il est venu chercher est derrière lui. **C'est cette décision qui rend le rang 3 de Commandes défendable** sans modifier le nombre d'onglets : après la seule action irréversible de l'application (B3), la destination est l'historique. Elle ne vient pas d'un classement de frequentation ; elle vient de l'intention du client.

**B3 rend cet écran définitif, et donc nécessairement unidirectionnel.** Une seconde ouverture du même lien ne refait rien : elle affiche le résultat déjà décidé. C'est l'état « Lecture seule » de cet écran, et c'est la manifestation la plus nette de la règle dans toute l'application.

---

## 2. Direction visuelle de cet écran

Repris du design system — **valeurs concrètes, jamais « à définir »**.

| | |
|---|---|
| **Mood** | « chaleureux, dense, sans emphase » — repris du design system §0 |
| **Densité** | **normale**, et c'est le seul écran qui le peut sans argument : il n'a **qu'une seule information à donner**. Une densité forte ici serait de l'artificialité ; une aération complète serait de l'inattention. Un bloc de résultat, deux ou trois actions, et la sortie permanente vers la boutique |
| **Niveau de contraste** | **fort** — le résultat du rapprochement est la phrase la plus importante de l'application et elle est en `--text-texte-principal`, la taille la plus grande. Un client qui ouvre un lien dans un train bruyant doit comprendre le résultat en une fixation |
| **Surface** | `--color-background #F1EDE5` ; `--color-surface #FBF8F2` pour la carte de résultat, **la seule carte de l'application**, parce qu'elle est l'unique objet de l'écran ; `--color-attention-doux #F6EBD2` pour le compteur de tentatives restantes, `--color-info-doux #E3EDF3` pour le bandeau hors ligne |
| **Accent utilisé** | `--color-encre-700 #1B2220` pour le bouton « Voir mes commandes », qui est la seule action primaire de l'écran et qui ne l'est **qu'en cas de succès** ; `--color-attention #7A5A0C` sur `--color-attention-doux` pour « {n} tentatives sur 3 » ; `--color-info #2A5470` sur `--color-info-doux` pour l'âge du cache et l'écran hors ligne. **En cas d'échec, il n'y a aucun bouton primaire** : l'écran propose des actions de second rang, parce qu'aucune n'est le bon chemin |
| **Traitement photographique** | **aucune image.** Le résultat d'un rapprochement n'est pas une récompense à applaudir, et une illustration de réussite serait exactement l'émoji décoratif que le design system exclut |
| **Référence** | Apple Wallet pour la confirmation d'une opération en une seule phrase ; le panneau d'état du design system pour la structure d'un résultat sans illustration |

### 2.1 Anti-générique — obligatoire

- [x] Pas de fond **blanc pur** — papier `#F1EDE5`, carte de résultat `#FBF8F2`.
- [x] **Pas de carte ombrée pour tout** — **une seule carte sur cet écran**, et elle porte l'unique information de l'écran. Elle est posée sur le papier avec un filet, sans ombre. Les actions sont sous la carte, sur le papier.
- [x] **Pas d'uniformité** : le nom de la boutique en `--text-overline 12/16 +0.8px` tout en haut, parce que c'est le point d'ancrage visuel quand on entre par un lien externe ; le résultat en `--text-display 30/36` ; les actions en `--text-body 17/25` ; le compteur de tentatives en `--text-caption 14/19`.
- [x] **Pas de gris neutre générique** — le compteur de tentatives est en `--color-attention`, pas en gris : il dit une limite qui se rapproche.
- [x] **Pas de mise en page centrée symétrique** — la carte est calée à gauche sur `--space-lg 24px`, sa largeur est la largeur utile, et le compteur de tentatives est aligné sur le bord droit de la carte : un compteur centré ressemblerait à une note de bas de page décorative.
- [x] **Pas d'illustration d'appoint générique** — **aucune illustration, aucun emoji de coche, aucun gros pictogramme de coche.** Le design system §5 l'écrit : les panneaux d'état « portent une phrase, parce qu'un dessin ne peut pas dire "vos commandes n'ont pas été effacées" ». Un succès qui se félicite par un emoji est un affichage vide de la même famille — une réaction, pas une information.
- [x] **Pas d'une seule famille de police** — le compteur de tentatives et l'horodatage de la copie locale passent en SF Mono / Roboto Mono ; le nom de la boutique et le résultat restent en police proportionnelle. L'œil distingue ainsi le texte qu'on a écrit et la donnée qu'on a mesurée.

**Choix assumé et non neutre** : **l'écran ne félicite pas.** Il n'y a ni « Votre compte est prêt ! », ni « Bienvenue ! », ni coche verte, ni animation de réussite. Le texte du succès est écrit en informations : « Adresse confirmée. Vos commandes sont rattachées à ce compte. » UneCongratulation après un rapprochement réussi est une micro-copy vide au sens de `design-quality` §3, et elle est ici doublement fausse : le client n'a pas créé un compte, il a retrouvé une chose qui existait déjà. L'application n'a rien fait de nouveau ; elle a rendu visible ce qui était là. L'écran le dit.

**Second choix, contestable** : **la sortie vers la boutique est permanente et figure sur tous les états, y compris le succès.** Un client dont la commande est de 2024 et qui découvre qu'il n'y en a qu'une se voit proposer d'aller sur le site. C'est ce que la roadmap §2.4 appelle « rendre la main au site, qui est gratuit et qui fonctionne », et c'est un renoncement que la plupart des applications ne font jamais. Le prix est qu'une partie du trafic repartira vers le site — et c'est **le résultat voulu**, pas une fuite : le critère de garde du PRD §8 est que la conversion du site ne baisse pas.

---

## 3. Anatomie

```
Écran "/confirmer-email" — entrée externe, hors pile d'onglets

├─ En-tête de contexte — nom de la boutique en --text-overline
│    "Vous avez ouvert le lien de confirmation envoyé par {boutique}."
├─ Carte de résultat — feuille --color-surface, filet, sans ombre
│    ├─ Succès  : "Adresse confirmée. Vos commandes sont rattachées à ce compte."
│    ├─ Échec   : Panneau d'état correspondance-echouee
│    │            "Aucune commande trouvée à cette adresse."
│    │            détail — "{n} tentatives sur 3", aligné à droite
│    │            action  — "Vérifier une autre adresse" (absente au-delà de 3)
│    └─ Indisponible / introuvable : libellés écrits du design system §5
├─ Actions
│    ├─ Succès : Bouton primaire lg 56 px "Voir mes commandes" → "/commandes"
│    ├─ Échec  : "Vérifier une autre adresse"  (second rang)
│    │           "Voir mes commandes sur la boutique" (second rang)
│    └─ Lien permanent — "Voir mes commandes sur la boutique"
├─ Encart d'erreur — rendu seulement si la résolution échoue
└─ Lien de sortie — "Parcourir le catalogue" → "/", TOUJOURS présent
```

| # | Composant | Rôle | Source |
|---|---|---|---|
| 1 | Panneau d'état | Les six variantes de résultat — `aucune-donnee`, `indisponible`, `hors-ligne`, `acces-refuse`, `correspondance-echouee`, `introuvable` — rendues avec leurs libellés écrits | design-system §5 |
| 2 | Bouton primaire | « Voir mes commandes » — présent **uniquement** en cas de succès | design-system §5 |
| 3 | Lien textuel | « Voir mes commandes sur la boutique » — permanent, sur tous les états | design-system §5 |
| 4 | Encart | Message d'erreur technique avec son action de reprise | design-system §5 |
| 5 | Carte de résultat | Le seul conteneur de l'application, parce qu'il porte l'unique information | slice-local, sur design-system §1 |

**Ce qui n'est pas dans cette anatomie** et ne doit pas y apparaître : un bouton « Retour à l'accueil » en position primaire, un « Suivant » générique, un parcours de démonstration du produit, un bandeau « Pourquoi vous aimerez », une étape de choix de préférences, un écran d'onboarding de deux pages. Le client a cliqué un lien dans un e-mail ; il ne veut pas faire une démonstration.

---

## 4. États — tous, sans exception

| État | Déclencheur | Rendu | Feedback utilisateur |
|---|---|---|---|
| **Chargement** | Ouverture du lien, jeton en cours de résolution | **Aucun squelette pleine page (B8).** Le nom de la boutique et l'en-tête de contexte sont du texte local et s'affichent immédiatement. **Une seule ligne squelettée de 48 px** à la place du résultat, de la hauteur exacte de la carte finale — la page ne saute donc pas à l'arrivée du résultat | Aucun indicateur global. La carte a déjà sa place |
| **Rempli** | **Correspondance réussie** — le seul état où la carte porte un résultat positif | Carte : « Adresse confirmée. Vos commandes sont rattachées à ce compte. » Bouton primaire `lg` « Voir mes commandes » → `/commandes`. **Le nombre de commandes trouvées n'est pas affiché en chiffre dans la carte** : il est dans la liste, et afficher « 3 commandes » puis afficher une liste est la même information deux fois — sur un écran où un compteur à 0 est interdit, la cohérence veut qu'on n'en mette aucun | Aucun. La carte **est** le retour. Aucune animation de réussite, aucune félicitation |
| **Vide — jamais visité** | Le client ouvre l'application par lui-même et tombe sur cette route, sans jeton | Carte avec `Panneau d'état · introuvable`, dont le libellé écrit au design system §5 est reformulé pour son objet propre : « Ce lien de confirmation n'est pas valide. » Action « Recommencer » vers `/compte/creer`. Le lien « Voir mes commandes sur la boutique » et le lien « Parcourir le catalogue » restent présents | Aucun. **L'écran ne montre aucune erreur de réseau, aucune barre de chargement**, parce que rien n'a échoué : il n'y avait pas de lien à confirmer |
| **Vide — aucune donnée** | Confirmation valide, **rapprochement échoué** | `Panneau d'état · correspondance-echouee`, libellé écrit du design system §5 : « Aucune commande trouvée à cette adresse. » avec le détail « {n} tentatives sur 3 ». Action « Vérifier une autre adresse ». **Au-delà de trois tentatives, le compteur et le lien disparaissent tous les deux** (B5). Les actions proposées sont toutes de second rang : « Vérifier une autre adresse », « Voir mes commandes sur la boutique ». **Aucun bouton primaire** | Aucun. **Ni « Réessayer », ni spinner, ni animation d'attente.** B3 rend le résultat définitif : proposer une nouvelle tentative promettrait une opération que la règle interdit, et C7 interdit de présenter un résultat comme une panne |
| **Erreur de chargement** | Trois cas distincts, **et la distinction est le cœur de cet état** | **Réseau absent** → `Panneau d'état · hors-ligne`, libellé écrit : « Affiché hors ligne. Dernière mise à jour il y a X h. », action « Réessayer ». **Lien expiré** → `Encart · erreur` « Ce lien de confirmation a expiré. » action **« Renvoyer le lien de confirmation »** — et **jamais** « Réessayer », parce que réessayer le même jeton échouera encore. **Lien déjà utilisé** → `Encart · info` « Ce lien a déjà été utilisé. » et l'écran rend **directement le résultat déjà enregistré** : c'est l'état « Lecture seule » ci-dessous | « Réessayer » n'apparaît **que** dans le cas réseau. Un lien expiré a sa propre action, qui est d'en obtenir un neuf ; c'est la seule chose qui peut faire avancer le client |
| **Erreur de soumission** | Le renvoi du lien de confirmation est refusé | `Encart · erreur` sous les actions, motif en clair, la saisie du compte conservée. Le bouton de renvoi passe en `chargement` puis revient actif | Aucun toast. Le motif est écrit dans l'écran, à l'endroit du geste |
| **Succès** | Confirmation traitée et rapprochement réussi, ou lien de confirmation renvoyé | **Succès de rapprochement** → l'état « Rempli » ci-dessus. **Succès de renvoi** → `Encart · info` « E-mail de confirmation renvoyé. Vérifiez votre boîte de réception. » avec l'adresse de destination en toutes lettres | Aucun. Le résultat est dans la carte ou dans l'encart, jamais dans une notification flottante |
| **Hors-ligne / permissions** | Ouverture du lien sans réseau | `Panneau d'état · hors-ligne` avec le libellé écrit et son âge de dernière mise à jour. **Le lien « Voir mes commandes sur la boutique » et le lien « Parcourir le catalogue » restent actifs** — hors ligne, ce sont les deux seules actions qui;mènent quelque part, et rendre un écran entièrement mort hors ligne revient à fermer l'application | Le client n'est jamais bloqué sans issue |
| **Lecture seule** | **Le même lien est ouvert une seconde fois** — B3 rend le résultat **définitif** | La carte rend **le résultat déjà enregistré**, tel quel, avec la même formulation. **Aucun rapprochement n'est rejoué**, aucun compteur n'est incrémenté, aucune action « Vérifier une autre adresse » si les trois tentatives sont déjà parties. La seule action est « Voir mes commandes » si le résultat est positif, et « Voir mes commandes sur la boutique » si le résultat est négatif | Un `Encart · info` d'une ligne le dit explicitement : « Ce lien a déjà été utilisé. Votre historique n'a pas changé. » Le client qui ouvre un lien deux fois — ce qui arrive quand on cherche un e-mail et qu'on appuie deux fois — ne doit pas croire qu'il a triggered une nouvelle tentative |

> Un état non décrit est un état non implémenté. Aucun de ces neuf ne propose « Réessayer » quand le problème n'est pas le réseau (C7), et aucun ne présente l'échec du rapprochement comme une panne.

---

## 5. Interactions

| Élément | Événement | Comportement | Feedback visuel | État résultant | ID |
|---|---|---|---|---|---|
| Ouverture du lien | automatique | Résolution du jeton, confirmation de l'adresse, **rapprochement tenté une seule fois**, enregistrement du résultat | Barre de progression native non interceptée ; la ligne squelettée à hauteur de la carte finale | Rempli, Vide — aucune donnée, ou Erreur de chargement | B2, B3 |
| Bouton « Voir mes commandes » | tap | Navigation vers `/commandes` — **l'onglet, pas la commande la plus récente** : le critère de garde des 25 % se lit sur l'ouverture de cet onglet par le client lui-même, et un raccourci l'inflaterait | Pressé 120 ms | Commandes | B2 |
| Action « Vérifier une autre adresse » | tap | Navigation vers `/compte/creer`, champ d'adresse vidé et focalisé, **compteur de tentatives incrémenté**. Absente au-delà de trois (B5) | Le champ reçoit le focus au montage | Création de compte | B5 |
| Action « Renvoyer le lien de confirmation » | tap | Émission d'un nouveau lien vers l'adresse du compte | `chargement` sur le bouton, puis `Encart · info` | Succès ou Erreur de soumission | E3 |
| Action « Réessayer » | tap | Relance la résolution du jeton. **Présent uniquement dans le cas réseau** | `chargement` sur l'action | Rempli ou Erreur de chargement | — |
| Lien « Voir mes commandes sur la boutique » | tap | Ouverture de l'URL de la boutique, section commandes | Aucun | Sortie de l'application | E1 |
| Lien « Parcourir le catalogue » | tap | Navigation vers `/` | Aucun | Accueil | C4 |
| Action « Recommencer » | tap | Navigation vers `/compte/creer` | Aucun | Création de compte | — |
| Barre système / retour | geste | Rend `/` — jamais vers une liste d'historique qui n'a pas d'élément précédent | `--duration-slow 320ms` | Accueil | C4 |

- **Focus / clavier** : ordre de tabulation égal à l'ordre de lecture — contexte, carte, actions, liens de sortie. **Le lien « Voir mes commandes sur la boutique » est le dernier du parcours de tabulation** : c'est la sortie de secours, et elle doit être la dernière qu'on rencontre en tabulant, pas la première.
- **Gestes** : **aucun geste n'a d'effet.** Pas de défilement caché, pas de balayage, pas de double-tap. Cet écran tient en un écran et le client n'a rien à faire déplier ; la seule exception admise est le geste système de retour.
- **Animations** : `--duration-fast 120ms` sur les pressés ; `--duration-slow 320ms` au retour arrière et au retour à `/`. **Aucune animation de résolution** : ni compte à rebours, ni barre qui progresse, ni coche qui se dessine. Une animation de rapprochement qui dure laisse croire qu'il y a un calcul en cours alors que B3 interdit qu'on en rejoue un ; et une animation de durée indéterminée est la forme exacte du mensonge que C7 combat.
- **Retour arrière** : rend `/`, avec la barre d'onglets visible. **Le retour arrière ne revient jamais vers une carte de résultat déjà traitée**, et il ne déclenche aucune action : revenir en arrière est un geste d'exploration, pas une seconde tentative.

---

## 6. Responsive

| Breakpoint | Comportement | Ce qui se replie / disparaît |
|---|---|---|
| **Mobile** | **Seul format livré et seul format de référence** : `--format-320 320 × 568`. Marge `--space-lg 24px`, carte de largeur utile 272 px, bouton primaire `lg` 56 px pleine largeur, liens de sortie en `--text-body` avec hauteur de ligne 44 px. **Le clavier système n'a rien à faire apparaître** : cet écran ne contient aucun champ de saisie, ce qui est un avantage réel pour un client qui ouvre un lien depuis une messagerie | Rien ne disparaît. Au réglage maximal, le résultat en `--text-display` passe sur trois lignes et la carte grandit |
| **Tablet** | **Hors périmètre en v1** — C10 exclut tablette et web ; le roadmap §4.2 conditionne leur retour à une part de sessions tablette mesurée pendant la fenêtre, au-dessus d'un seuil écrit avant publication. Un écran de confirmation de lien ouvert depuis une messagerie est le cas où le hors-périmètre coûte le moins | Non conçu. Aucune carte centrée dans une colonne large |
| **Desktop** | **Hors périmètre en v1**, même raison, même seuil. Le format de référence unique est `--format-320` | Non conçu |

- **Cible tactile** : bouton primaire `lg` 56 px ; actions secondaires 44 px de hauteur ; liens de sortie 44 px de hauteur de ligne, avec le lien de recours vers la boutique et le lien vers le catalogue **séparés par au moins `--space-md 16px`** pour que deux liens de 44 pt côte à côte ne soient jamais confondus à un doigt.
- **Débordement** : garanti sans débordement à tout réglage de police — le nom de la boutique en `--text-overline` (retour à la ligne autorisé) ; le texte de contexte ; **le résultat en `--text-display 30/36`, retour à la ligne autorisé, jamais tronqué** — un résultat tronqué (« Aucune commande trouv… ») se lit comme un bug ; le détail « {n} tentatives sur 3 » ; chaque libellé de `Panneau d'état` ; les libellés de boutons, jamais raccourcis en icône.
- **Réglage de police** : aucun conteneur n'a de hauteur fixe ; la carte **grandit** et le squelette de chargement a été dimensionné à sa hauteur finale pour qu'aucun saut ne se produise quand le résultat arrive ; les liens de sortie restent séparés et entièrement atteignables au réglage maximal. **C'est ici que E3 est le plusrospection dur** : le client ouvre ce lien au doigt, souvent dans un contexte inconfortable, parfois avec une police déjà agrandie par le système — l'écran doit rester lisible sans zoom et sans horizontal.

---

## 7. Accessibilité

- [x] **Contraste du texte courant** — `--color-texte-principal #161A19` sur `--color-surface #FBF8F2` pour le résultat et pour les libellés des panneaux d'état ; `--color-texte-secondaire #5A544A` sur `--color-background #F1EDE5` pour le nom de la boutique et le texte de contexte ; `--color-attention-fort #6B4E08` sur `--color-attention-doux #F6EBD2` pour « {n} tentatives sur 3 » ; `--color-info-fort #24455C` sur `--color-info-doux #E3EDF3` pour l'âge de la copie locale ; `--color-texte-inverse #FBF8F2` sur `--color-encre-700 #1B2220` pour le bouton primaire. Le seuil appartient à `design-check contrast`.
- [x] **Contraste des grands textes** — le résultat en `--text-display 30/36` est posé sur `--color-surface` uniquement ; le nom de la boutique en `--text-overline` est posé sur `--color-background`. **Aucune information n'est confiée au seul `--text-overline`** : il porte le nom de la boutique comme ancre visuelle, et le nom est répété dans le texte de contexte en corps normal — donc si l'overline est illisible, l'information est déjà donnée ailleurs.
- [x] **Navigation clavier complète** — sur matériel, ordre de tabulation égal à l'ordre de lecture ; l'écran est une `region` titrée par le nom de la boutique, donc un client qui arrive par un lien sait immédiatement où il est dans son parcours ; la carte de résultat est annoncée en premier, avant toute action, parce que c'est la seule information.
- [x] **Focus visible** — anneau de 2 px en décalage de 2 px, couleur `--color-bordure-focus #1B2220`, sur le bouton primaire, les actions secondaires et les deux liens de sortie.
- [x] **ARIA** — l'écran est un titre `h1` portant le nom de la boutique ; la carte de résultat est une `region` étiquetée « Résultat de la confirmation », annoncée une fois ; **le résultat est un `status` poliment** et non un `alert` : il n'y a pas d'urgence et un `alert` interromprait le client alors qu'il est en train de lire ; les `Panneau d'état` sont des `region` étiquetées ; les `Encart` d'erreur sont des `alert` — une erreur technique, elle, mérite d'être interrompante ; le compteur de tentatives est **rattaché au panneau par `aria-describedby`**, pour qu'un client au lecteur d'écran entende « Aucune commande trouvée » et « 2 tentatives sur 3 » dans la même annonce.
- [x] **Alternatives textuelles** — **aucune image, aucun pictogramme, aucune illustration de réussite ni d'échec.** Il n'y a donc rien à décrire : un état de cet écran est annoncé par sa phrase entière, ce qui est la meilleure alternative textuelle possible.
- [x] **Langue et direction de lecture** — `lang="fr"`, `dir="ltr"`, horodatage de l'échéance du lien au format français long ; une seule langue, aucune couche d'internationalisation (C5, B20).

---

## 8. Données

| Champ | Type | Origine | Requis | Erreur possible |
|---|---|---|---|---|
| Jeton de confirmation | texte | **Route** — porteur du lien de l'e-mail | oui | Absent → état « Vide — jamais visité », **pas** une erreur réseau ; invalide ou expiré → `Encart` avec action « Renvoyer », **jamais** « Réessayer » ; déjà consommé → état « Lecture seule » |
| Adresse confirmée | texte | Base applicative | oui si succès | Absente → l'écran n'affiche pas de résultat positif ; aucune adresse n'est devinée |
| Résultat du rapprochement | énumération `reussi \| echoue` | Base applicative, **définitif** (B3) | oui | **Jamais recalculé** : ouvrir l'écran ne relance rien |
| Nombre de commandes | entier | Base applicative, jointure confirmée | non | Requête échouée → **non affiché** ; un chiffre incertain ne s'affiche pas. Et s'il est nul, il n'est pas affiché non plus (C7) |
| Nombre de tentatives | entier | Base applicative | non | ≥ 3 → compteur et lien de nouvelle tentative supprimés tous les deux (B5) |
| Date d'expiration du lien | horodatage | Source d'identité | non | Absente → pas d'échéance affichée, pas d'échéance inventée |
| Date de la dernière valeur connue | horodatage | Cache local, affiché tel quel | oui si hors-ligne | Jamais absent : une donnée rejouée sans âge n'est pas rendue (B19) |
| Identité du prestataire | texte | Convention technique, figée | oui si le paragraphe de conformité est repris ici | Jamais affichée si elle n'est pas nommée |

- **Chargement** : **un seul bloc, une seule requête.** La résolution du jeton est la seule requête de l'écran, et elle est déclenchée une fois au montage. Le squelette de chargement est dimensionné à la hauteur exacte de la carte finale, ce qui interdit le saut de mise en page quand le résultat arrive.
- **Cache / hors-ligne** : **aucun cache applicatif sur cet écran.** Le résultat du rapprochement est une donnée personnelle : il n'est pas rejouable hors ligne, et hors ligne l'écran rend son état et propose les deux liens de sortie. C'est le seul point où l'application refuse de montrer quelque chose qu'elle sait déjà, et c'est délibéré : un cache local de « vos commandes sont rattachées » persisterait après la suppression d'un compte (E5) et après le changement d'appareil (B16), et afficherait un accès à un historique qui n'existe plus.
- **Données sensibles** : **c'est l'écran où la jointure se fait**, et c'est aussi le seul endroit où elle doit se faire côté serveur. Aucune adresse, aucun identifiant de compte, aucune référence de commande, aucun compteur de commandes ne transite dans un événement d'audit (C9) ; le compteur `compteRapproche` est envoyé comme **catégorie de résultat**, jamais comme donnée.
- **Instrumentation (PRD §8, C9)** : `confirmationEmailOuverture` (présence du jeton : booléen ; **jamais le jeton lui-même**) ; `rapprochementResultat` (`reussi` ou `echoue`, catégorie) ; `confirmationLienExpire`, `confirmationLienUtilise` (motivations). Le **taux de correspondances réussies définitivement** est l'un des six chiffres du contrat de mesure du roadmap §2.4 : il ne se lit sur aucune autre écran, donc cet écran doit l'émettre même quand son résultat est négatif. C'est aussi la réponse que l'application donnera à Q3 — « le marchand sait-il retrouver ses commandes d'invité ? » — et à R2.

---

## 9. Traçabilité

| ID | Origine | Manifestation sur cet écran |
|---|---|---|
| **B2** | PRD | Cet écran est **le point de bascule unique** entre un compte qui n'ouvre rien et un compte qui ouvre l'historique. La correspondance n'est écrite qu'après confirmation ; en cas d'échec, l'historique ne s'ouvre pas et l'écran le dit sans le laisser croire disponible. Aucune donnée de commande n'est affichée dans un état d'échec |
| **E3** | PRD | Le client qui grossit fortement la police ou utilise un lecteur d'écran arrive ici **par un lien externe, sans contexte de navigation**. L'écran nomme la boutique dès la première ligne, la carte de résultat est annoncée avant toute action, le compteur de tentatives est rattaché au panneau par `aria-describedby` pour être entendu dans la même annonce, et **tous les conteneurs ont une hauteur non fixe** : la carte grandit au lieu de tronquer un résultat, et le squelette est dimensionné à sa hauteur finale pour qu'aucun saut ne se produise |
| **C4** | PRD | Le lien « Parcourir le catalogue » vers `/` est présent dans **tous les états, y compris hors ligne et en cas d'échec du rapprochement**. Confirmer un compte n'est jamais une condition pour regarder le catalogue, et cet écran ne ferme pas l'application |
| **C9** | PRD | Aucune donnée personnelle n'est émise dans l'instrumentation de cet écran : le jeton, l'adresse et la référence de commande ne sortent jamais vers l'outil d'audit. Le résultat du rapprochement est envoyé comme catégorie, et la jointure « compte créé / Commandes ouverte » se fait côté serveur |
| **C7** | PRD | L'échec du rapprochement n'est **jamais** présenté comme une panne : ni « Réessayer », ni spinner, ni message d'erreur de serveur, ni compteur à 0. Le compteur affiché est celui des **tentatives**, pas celui des commandes — et au-delà de trois, il disparaît avec le lien |
| **E5** | PRD | Un compte supprimé ne peut pas rouvrir un historique par ce lien : la route rend l'accès refusé ou le lien déjà utilisé, jamais les commandes. C'est la raison pour laquelle cet écran **ne met aucun cache local** du résultat |

**Règles du PRD citées sans être opposables à cet écran** : **B3** et **E9** sont appliquées mécaniquement — le rapprochement est tenté une seule fois, ici, et son résultat est définitif ; une seconde ouverture affiche le résultat enregistré et l'écrit. **B7**, cité par E2, se traduit par la distinction entre « lien expiré » et « réseau absent » : seul le second reçoit « Réessayer ». **B5** est rendue par le compteur de tentatives et sa disparition au-delà de trois.

---

## 10. Checklist de gate

- [x] Les 9 états sont décrits avec un rendu concret.
- [x] Chaque élément interactif a un comportement et un feedback.
- [x] Le responsive est défini à **chaque** breakpoint du design system — Mobile livré, Tablet et Desktop **écrits comme hors périmètre** avec leur condition de retour.
- [x] La section Anti-générique est cochée et justifiée.
- [x] Aucune valeur de design n'est laissée à « à définir ».
- [x] Chaque ID B*/E*/C* de l'écran apparaît en section 9, et les règles citées sans être opposables sont nommées comme telles.
- [x] `node "$FORGE/scripts/forge-guard.js" placeholders <anchor>` ne signale rien ici.
- [x] L'écran reste cohérent avec `.forge/design/design-system.md`.