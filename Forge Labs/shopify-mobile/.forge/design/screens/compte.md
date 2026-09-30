---
type: screen
slug: compte
title: Compte et consentements
module: compte
status: draft
generated_at: 2026-09-30
derived_from:
  - .forge/prd.md
  - .forge/design/design-system.md
rule_ids: [B2, B16]
edge_case_ids: [E5, E10]
flow: acces-et-consentements
---

# Écran — Compte et consentements

> Ce document est la **source de vérité** pour qu'une IA génère l'interface de cet écran.
> Il est généré depuis ce gabarit, jamais recopié. Aucun `{{PLACEHOLDER}}` ne doit subsister.

---

## 1. Rôle de l'écran

| | |
|---|---|
| **Archétype d'app** | `mobile_consumer` — téléphone seul, iOS et Android, un seul marché (C10) |
| **Module** | `compte` — rang **4** dans la navigation |
| **Route** | `/compte` |
| **Type** | page — onglet racine du module Compte |
| **Utilisateurs** | Les trois personas. Le visiteur non connecté est un **cas normal** de cet écran, pas une erreur : c'est la porte de la création de compte |
| **User stories servies** | US-4 |
| **Règles métier** | B2, B16 |
| **Edge cases** | E5, E10 |

> **E5 est ajouté ici par rapport au découpage initial.** Le roadmap §2.1 place la suppression du compte dans le MVP et signale en §2.5 que c'est sa propre décision (Q-E). Or la suppression a une seule porte possible : c'est cet écran. La laisser sans écran serait laisser une obligation légale sans surface, donc E5 figure en §9 de ce document. **C13 est également traité ici** — non parce qu'elle est propre à la création, mais parce qu'un client déjà inscrit doit pouvoir relire les deux entités qui détiennent ses données et retirer son consentement : c'est le versant RGPD de la création, et il est raté si la lecture n'existe que le jour de l'inscription.

**Une phrase** : cet écran permet de savoir quelle adresse e-mail porte cet historique, ce que l'application mesure sur le client, et comment tout arrêter — afin que rien ne soit collecté ni conservé sans une décision explicite et révocable.

**Pourquoi il est au rang 4 de la navigation** : fréquence 2, centralité 1 (design system §4). Il ne porte aucune boucle, mais c'est **la seule porte d'entrée de la création de compte, du consentement révocable et de la suppression**. C'est un écran d'accès, pas un écran de configuration : le placer plus haut le ferait ressembler à une fonction qu'il n'a pas.

**Ce que cet écran est au MVP.** Trois blocs, et trois seulement : **l'identité du compte**, **un unique consentement**, **la suppression du compte**. Ce qui n'y est pas, et pourquoi :

- **Aucun interrupteur de notification.** US-8 est hors du MVP (roadmap §2.2), et le push exige une publication native (C11). Un interrupteur de notification dans une version qui n'envoie rien serait un consentement demandé pour une capacité absente — exactement ce que C9 interdit.
- **Aucun accès aux favoris.** US-7 hors MVP ; un bloc vide serait un onglet vide en premier écran, que B10 interdit en principe.
- **Aucun accès aux adresses.** US-10 hors MVP ; C3 envoie le paiement chez le marchand, qui se souvient déjà de l'adresse. Mémoriser une adresse ici serait demander au client de faire une chose dont il n'a pas besoin.
- **Aucun changement d'adresse e-mail.** B3 rend le rapprochement unique et définitif, et E9 interdit tout rejeu. Offrir un champ pour changer d'adresse sur un compte dont la correspondance est scellée créerait une promesse que l'application ne peut pas tenir. **C'est un coût assumé**, et il est écrit ici : un client qui a mal saisi son adresse ne peut pas se corriger. La seule voie est de créer un autre compte, ce que E9 prévoit.

---

## 2. Direction visuelle de cet écran

Repris du design system — **valeurs concrètes, jamais « à définir »**.

| | |
|---|---|
| **Mood** | « chaleureux, dense, sans emphase » — repris du design system §0 |
| **Densité** | **aérée** — c'est le **seul** écran aéré de l'application, et c'est délibéré : il n'y a rien à comparer et rien à retrouver d'un coup d'œil. Un écran aéré signale au client qu'il est arrivé au bout d'un parcours, pas au milieu d'une recherche. La justification est fonctionnelle, pas ornementale : c'est l'écran où l'on décide qu'une donnée sera collectée, et une page dense apprend au client à ne pas lire |
| **Niveau de contraste** | **fort** — le texte des deux entités responsables, en `--color-texte-principal #161A19` sur le papier, est le texte le plus important de l'application après celui d'un montant : c'est la seule page où l'on écrit à quelqu'un ce que d'autres organisations font de lui. Il n'est ni en gris d'appoint ni en petit corps |
| **Surface** | `--color-background #F1EDE5` ; `--color-surface-sunken #E7E2D7` pour la ligne de l'interrupteur, seul élément posé sur une surface enfoncée de tout le produit — un interrupteur qui se fond dans le fond n'est pas un interrupteur qu'on voit avant de le basculer |
| **Accent utilisé** | `--color-encre-700 #1B2220` pour l'état « accordé » de l'interrupteur et pour le bouton de création de compte ; `--color-erreur #A03427` sur `--color-erreur-doux #F7E4E0` pour le bouton `danger` de suppression, dans une `Feuille modale · confirmation` et **seulement dans cette feuille** ; `--color-attention #7A5A0C` pour la ligne de consentement révoqué — le seul état d'un interrupteur qui porte une couleur sémantique, parce que seul il porte une conséquence |
| **Traitement photographique** | **aucune image.** Ni avatar, ni logo, ni illustration : le design system §5 exclut explicitement l'avatar, et une illustration sur cet écran serait une décoration devant un formulaire |
| **Référence** | Apple Wallet pour un panneau de réglages dense en valeurs et sobre ; le réglage système iOS pour la posture de l'interrupteur, dont on reprend la logique — libellé, état, description — sans copier son rendu |

### 2.1 Anti-générique — obligatoire

- [x] Pas de fond **blanc pur** — papier `#F1EDE5`, ligne d'interrupteur sur `#E7E2D7`.
- [x] **Pas de carte ombrée pour tout** — **aucune carte sur cet écran.** Les blocs sont séparés par des filets `#D9D2C4` et de l'espace `--space-xl 32px`, pas par des conteneurs. La ligne d'interrupteur est la seule surface enfoncie, parce qu'elle est le seul contrôle.
- [x] **Pas d'uniformité** : `--text-display 30/36` pour le titre d'écran, `--text-h3 20/26` pour les titres de bloc, `--text-body 17/25` pour le libellé de l'interrupteur et sa description, `--text-body-sm 16/23` pour les noms d'entité, `--text-caption 14/19` pour l'adresse e-mail et la date de confirmation.
- [x] **Pas de gris neutre générique** — la ligne de consentement révoqué est en `--color-attention`, pas en gris : révoquer un consentement n'est pas un état neutre, c'est un acte.
- [x] **Pas de mise en page centrée symétrique** — tout est calé à gauche sur `--space-lg 24px`, y compris les deux entités responsables ; un paragraphe de protection des données centré est un paragraphe qu'on fait défiler pour éviter de lire.
- [x] **Pas d'illustration d'appoint générique** — pas d'icône dans un cercle, pas de cadenas décoratif, pas d'icône de bouclier. Le nom des deux entités est écrit en toutes lettres.
- [x] **Pas d'une seule famille de police** — l'adresse e-mail du compte et la date de confirmation sont en SF Mono / Roboto Mono : une adresse e-mail lue caractère par caractère est un nom d'hôte, et une erreur d'un caractère suffit à perdre un historique.

**Choix assumé et non neutre** : **la révocation est un geste vers le haut de l'interrupteur, et le résultat est visible immédiatement, sans bouton de validation et sans délai.** L'état `revocable` du design system §5 n'est pas utilisé : E10 et le rappel du design system disent que l'état « révocable en attente » n'existe pas, parce qu'un interrupteur qui promet un report est une promesse que le client ne pourra pas vérifier. Concrètement : le client baisse l'interrupteur, la ligne passe en `--color-attention` et un `Encart · info` d'une ligne apparaît **sous la ligne, pas en toast** — « Mesure d'audience désactivée. Aucun événement n'est envoyé à partir de maintenant. » Un toast disparaît en trois secondes ; un encart reste et se relit.

**Second choix, contestable** : **la suppression du compte est le dernier élément de l'écran, en `fantome`, et elle exige une `Feuille modale · confirmation` qui nomme les deux conséquences — ce que l'application efface, et ce qu'elle n'efface pas.** « Vos données applicatives seront supprimées. Vos commandes restent enregistrées chez {boutique}. » Une confirmation qui ne dit que « Êtes-vous sûr ? » est un formulaire vide : elle demande une décision sans fournir les informations pour la prendre. Et la conséquence à énoncer est précisément celle qui rassure : **ce que le client a payé chez le marchand n'est pas une donnée que cette application possède.**

---

## 3. Anatomie

```
Écran "/compte" — onglet
│  (état non connecté)
├─ Titre d'écran — "Votre compte" --text-display 30/36
├─ Bloc identité
│    ├─ Ligne "Adresse e-mail" — --text-body-sm, valeur en mono ou "Aucune"
│    ├─ Ligne "Confirmation" — "Confirmée le {date}" ou "À confirmer" (--color-attention)
│    ├─ Ligne "Historique" — "{n} commande" | "Aucune commande confirmée"
│    └─ Bouton primaire "Créer mon compte" — lien vers "/compte/creer"
├─ Paragraphe des deux entités — texte de C13, relu après inscription
└─ [Catalogue — un geste vers "/"]

│  (état connecté, non confirmé)
├─ Bloc identité + Bouton primaire "Confirmer mon adresse"
└─ Catalogue

│  (état connecté, confirmé)
├─ Bloc identité — valeur en mono, date de confirmation, lien "Voir mes commandes"
├─ Bloc « Vos données »
│    ├─ Interrupteur — libellé + description + trait
│    │     · "Mesure d'audience" / "Nous sert à savoir si l'application est utilisée.
│    │                           Aucune donnée personnelle n'y est envoyée."
│    ├─ Encart d'état de la ligne, sous la ligne, jamais en toast
│    └─ Encart "Les deux entités qui détiennent vos données" — texte de C13
├─ Bloc « Votre historique »
│    ├─ Ligne "Commandes" — compte rattaché, retrouvé sur un autre appareil
│    ├─ Ligne "Favoris" — absente au MVP, sans ligne vide
│    └─ Ligne "Adresses" — absente au MVP, sans ligne vide
└─ Bloc "Fermer" — Bouton fantome "Se déconnecter"
    + Bouton fantome en --color-erreur-fort "Supprimer mon compte" → Feuille modale
```

| # | Composant | Rôle | Source |
|---|---|---|---|
| 1 | Interrupteur | Le seul consentement du MVP ; révocable et immédiat | design-system §5 |
| 2 | Encart | Porter la conséquence d'une révocation, et le texte des deux entités | design-system §5 |
| 3 | Feuille modale | Confirmation de suppression, avec les deux conséquences nommées | design-system §5 |
| 4 | Bouton (primaire / fantome / danger) | Création, confirmation, déconnexion, suppression | design-system §5 |
| 5 | Ligne de valeur | Libellé à gauche en `--text-body-sm`, valeur à droite en mono | slice-local |

**Ce qui n'est pas dans cette anatomie** et ne doit pas y apparaître : un interrupteur de notification, une section favoris vide, une section adresses vide, un champ de changement d'adresse e-mail, un numéro de commande dans une liste de contrôle, un « profil », un avatar, un bouton de « déconnexion » qui ne révoque pas le jeton serveur.

---

## 4. États — tous, sans exception

| État | Déclencheur | Rendu | Feedback utilisateur |
|---|---|---|---|
| **Chargement** | Ouverture de l'onglet, état de session en cours de résolution | Le titre et les titres de blocs sont du texte local. **Un seul squelette de ligne de 44 pt** sous le titre. Aucun squelette pleine page : le nombre de blocs dépend de l'état de session, donc un squelette complet afficherait des sections qui n'existent pas | Aucun indicateur global. **Aucun rendu de valeur avant que la session soit résolue** : afficher « Aucune » pendant le chargement serait mentir sur un compte qui a un historique |
| **Rempli** | Compte connecté et correspondance confirmée | Trois blocs : identité (adresse en mono, date de confirmation, lien vers `/commandes`), données (un interrupteur + le texte des deux entités), historique (rattachement au compte), fermeture (déconnexion, suppression) | Aucun toast. Le retour d'une action est **dans le bloc concerné**, jamais en bandeau flottant |
| **Vide — jamais visité** | **Aucun compte, aucune session** — le cas ordinaire d'un visiteur qui n'a jamais commandé | Bloc identité avec valeurs « Aucune » et « À confirmer », et le bouton primaire « Créer mon compte ». Le paragraphe des deux entités **est déjà là**, avant toute saisie : C13 impose que les deux entités soient nommées **avant** validation, donc les montrer plus tard serait les montrer trop tard | Aucun bandeau d'accueil, aucun texte de bienvenue. Le paragraphe de conformité n'est pas une politesse : c'est le texte que la loi impose de faire lire avant de cocher |
| **Vide — aucune donnée** | Compte connecté, **correspondance non aboutie** — l'échec définitif de B3 | `Panneau d'état · correspondance-echouee` dans le bloc historique, libellé écrit du design system §5 : « Aucune commande trouvée à cette adresse. » avec le détail « {n} tentatives sur 3 ». **Au-delà de trois tentatives, le compteur et le lien « Vérifier une autre adresse » disparaissent tous les deux** (B5) et il ne reste que la phrase et le lien « Voir mes commandes sur la boutique » (E1) | Aucun. **Aucun compteur de commandes à 0**, aucun mot « Réessayer », aucun état d'échec : ce n'est pas une panne, c'est un résultat définitif, et l'écrire comme une panne ferait croire qu'une nouvelle tentative pourrait le changer. Or B3 interdit précisément cela |
| **Erreur de chargement** | L'état de session ou la correspondance ne peut pas être relu | `Panneau d'état · indisponible` pour le bloc concerné, libellé écrit du design system §5 : « Indisponible pour le moment. Vos données n'ont pas été effacées. » Action « Réessayer ». **Les blocs déjà résolus restent affichés** : si l'historique est illisible mais pas l'identité, l'identité reste visible | Le catalogue reste atteignable d'un geste. Un écran de compte qui plante ne doit pas fermer l'application (C4) |
| **Erreur de soumission** | La révocation du consentement, la déconnexion ou la suppression sont refusées par le serveur | **Révocation** : l'interrupteur **revient à son état précédent** et un `Encart · erreur` s'affiche sous la ligne avec le motif en clair : « Consentement non enregistré. L'état affiché est le dernier état connu. » — l'interface ne montre jamais un état qu'elle n'a pas enregistré (C9). **Suppression** : la `Feuille modale` reste ouverte en état `erreur`, avec le motif | Aucun toast. Le client doit voir l'échec **à l'endroit où il a agi**, et voir l'état réel plutôt que l'état souhaité |
| **Succès** | Consentement révoqué, compte déconnecté, compte supprimé | **Révocation** : l'interrupteur passe en `desaccorde`, la ligne prend `--color-attention`, et un `Encart · info` **sous la ligne** confirme la prise d'effet immédiat. **Déconnexion** : retour à l'état « vide — jamais visité », sans animation. **Suppression** : retour à l'état « vide — jamais visité », avec un `Encart · info` « Votre compte a été supprimé. Vos commandes restent enregistrées chez {boutique}. » | Aucun toast : les trois résultats sont **visibles dans le bloc qui a changé**, et l'encart de suppression reste parce qu'il porte une conséquence que le client doit pouvoir relire |
| **Hors-ligne / permissions** | Réseau absent au moment d'une action | Les valeurs déjà connues sont rendues, **avec leur âge** sous la forme d'un bandeau `--color-info` en tête : « Affiché hors ligne. Dernière mise à jour il y a X h. ». L'interrupteur passe en `desactive` avec la raison écrite à côté — « Impossible hors ligne. » La révocation en attente n'est pas proposée, donc **aucun état intermédiaire n'existe** | Le client ne peut pas révoquer hors ligne et le sait immédiatement, avec la raison. Lui proposer « révoquer plus tard » serait promettre un état que E10 exclut |
| **Lecture seule** | **Compte non confirmé**, ou session expirée | Le bloc historique rend `Panneau d'état · acces-refuse` avec le libellé écrit du design system §5 : « Confirmez l'adresse e-mail de votre compte pour voir vos commandes. » Action « Confirmer mon adresse ». **Le catalogue reste entièrement consultable d'un geste** et l'écran ne devient jamais un mur (C4, B1) | Aucun. L'écran dit ce qui manque, pas ce qu'il protège |

> Un état non décrit est un état non implémenté. Aucun de ces neuf ne montre de compteur à 0, et l'état `revocable en attente` n'existe nulle part (E10).

---

## 5. Interactions

| Élément | Événement | Comportement | Feedback visuel | État résultant | ID |
|---|---|---|---|---|---|
| Interrupteur « Mesure d'audience » | bascule vers « accordé » | Enregistrement du consentement ; le suivi d'audience ne démarre qu'à la confirmation du serveur | Le trait glisse en `--duration-normal 200ms`, l'état passe à `accorde`, un `Encart · info` apparaît **sous la ligne** | Rempli | C9 |
| Interrupteur « Mesure d'audience » | bascule vers « révoqué » | **Suppression immédiate de la ligne d'enregistrement** ; aucun report, aucun état intermédiaire, aucune file d'attente | Le trait glisse, la ligne prend `--color-attention`, `Encart · info` « Mesure d'audience désactivée. Aucun événement n'est envoyé à partir de maintenant. » | Rempli, état révoqué | E10 |
| Bouton « Créer mon compte » | tap | Navigation vers `/compte/creer` | Pressé 120 ms | Création de compte | B2 |
| Bouton « Confirmer mon adresse » | tap | Renvoi du lien de confirmation, puis retour à `/compte/creer` en attente | `Encart · info` « E-mail de confirmation envoyé. » avec l'adresse de destination en toutes lettres | Rempli | B2 |
| Bouton « Se déconnecter » | tap | Révocation du jeton de rafraîchissement **côté serveur**, puis retour à l'état « vide — jamais visité » — l'écran ne se contente pas d'oublier la session locale | Aucune animation ; l'état du bloc change immédiatement | Vide — jamais visité | — |
| Bouton « Supprimer mon compte » | tap | Ouverture de la `Feuille modale · confirmation` nommant les deux conséquences ; confirmation seulement après la seconde action | Feuille en `--duration-normal 200ms`, sur `--color-surface-raised #FFFDF8` | Feuille modale, puis Succès ou Erreur de soumission | E5 |
| Bouton « Voir mes commandes sur la boutique » | tap | Ouverture de l'URL de la boutique | Aucun | Sortie de l'application | E1 |
| Encart des deux entités | tap | **Aucune action.** Ce n'est pas un lien dépliable : le texte doit être lisible sans geste, parce qu'un texte de conformité caché derrière un « En savoir plus » est un texte que personne ne lit avant de cocher | Aucun — il n'y a pas de cible tactile morte | Rempli | C13 |

- **Focus / clavier** : ordre de tabulation égal à l'ordre de lecture — identité, données, historique, fermeture. **L'interrupteur est une seule cible** : ni la ligne entière ni son trait ne sont des cibles séparées, sinon un client au lecteur d'écran actionnerait le trait sans comprendre qu'il s'agit du consentement. L'état « accordé » ou « révoqué » est annoncé par `aria-checked` et par le texte visible de la ligne, jamais par la seule position du trait.
- **Gestes** : défilement vertical natif. **Aucun geste n'a d'effet** — pas de balayage pour se déconnecter, pas de balayage pour supprimer. La suppression d'un compte est irréversible et un geste horizontal l'invoquerait par accident, exactement le défaut qu'un réglage de police agrandi rend systématique.
- **Animations** : `--duration-normal 200ms` sur le glissement du trait de l'interrupteur, seul mouvement de l'écran ; `--duration-fast 120ms` sur les pressés ; `--duration-slow 320ms` à la fermeture de la feuille de confirmation et au retour arrière. Aucune animation de fond — le contenu ne bouge pas pendant une révocation.
- **Retour arrière** : rend l'onglet précédent avec sa position. Depuis la `Feuille modale · confirmation`, une feuille annulée par geste rend l'écran **sans aucune conséquence** : rien n'est supprimé tant que la confirmation n'a pas été donnée.

---

## 6. Responsive

| Breakpoint | Comportement | Ce qui se replie / disparaît |
|---|---|---|
| **Mobile** | **Seul format livré et seul format de référence** : `--format-320 320 × 568`. Marge `--space-lg 24px`, ligne d'interrupteur d'une hauteur de 44 pt minimum qui **grandit** quand la description passe à plusieurs lignes, bloc des deux entités en `--text-body-sm` pleine largeur | Rien ne disparaît. Ce qui se replie, c'est le paragraphe des deux entités, qui passe de six à dix lignes au réglage maximal — et il reste **entièrement lisible**, jamais tronqué, jamais « voir plus » |
| **Tablet** | **Hors périmètre en v1** — C10 exclut tablette et web ; le roadmap §4.2 conditionne leur retour à une part de sessions tablette mesurée pendant la fenêtre, au-dessus d'un seuil écrit avant publication. Un écran de consentements est le dernier endroit où un rendu non conçu serait dangereux | Non conçu. Aucune mise en colonne de la feuille de confirmation |
| **Desktop** | **Hors périmètre en v1**, même raison, même seuil. Le format de référence unique est `--format-320` | Non conçu |

- **Cible tactile** : interrupteur et sa ligne, **44 pt de haut au minimum**, la ligne entière étant la cible ; boutons `md` 48 px et `primaire` `lg` 56 px pour « Créer mon compte » ; bouton fantome de suppression 44 px de hauteur ; actions de la feuille de confirmation 48 px ; liens textuels 44 px de hauteur de ligne.
- **Débordement** : garanti sans débordement à tout réglage de police — le paragraphe des deux entités (bloc de texte libre, aucun conteneur de hauteur fixe, retour à la ligne autorisé) ; le libellé de l'interrupteur (retour à la ligne autorisé) ; sa description (idem) ; l'adresse e-mail en mono (**retour à la ligne autorisé, jamais rognée** : une adresse tronquée ne peut pas être vérifiée) ; le libellé de la feuille de confirmation ; le bouton « Supprimer mon compte », dont le libellé ne se raccourcit jamais en « Supprimer ».
- **Réglage de police** : aucun conteneur de texte n'a de hauteur fixe ; la ligne d'interrupteur **grandit** et ne rétrécit jamais (B21, E3) ; les deux boutons de la feuille de confirmation passent sur deux lignes l'un au-dessus de l'autre au réglage maximal, et **restent tous les deux entièrement atteignables** — un client qui grossit sa police ne doit jamais perdre le bouton d'annulation.

---

## 7. Accessibilité

- [x] **Contraste du texte courant** — `--color-texte-principal #161A19` sur `--color-background #F1EDE5` pour le texte des deux entités, le libellé et la description de l'interrupteur, et les libellés de ligne ; `--color-texte-secondaire #5A544A` sur `--color-background` pour les étiquettes de valeur et l'adresse ; `--color-texte-inverse #FBF8F2` sur `--color-encre-700 #1B2220` pour le bouton primaire ; `--color-erreur-fort #8E2B1F` sur `--color-background` pour l'action de suppression ; `--color-attention-fort #6B4E08` sur `--color-attention-doux #F6EBD2` pour l'état révoqué ; `--color-info-fort #24455C` sur `--color-info-doux #E3EDF3` pour le bandeau hors ligne. Le seuil appartient à `design-check contrast`.
- [x] **Contraste des grands textes** — `--text-display 30/36` et `--text-h3 20/26` posés sur `--color-background` uniquement.
- [x] **Navigation clavier complète** — sur matériel, ordre de tabulation égal à l'ordre de lecture ; l'interrupteur est un `switch` accessible au clavier et son état est annoncé par `aria-checked`, le trait n'étant jamais le seul porteur du sens ; la feuille de confirmation piège le focus à l'intérieur et le rend au bouton d'annulation à la fermeture, jamais au bouton de suppression.
- [x] **Focus visible** — anneau de 2 px en décalage de 2 px, couleur `--color-bordure-focus #1B2220`, présent sur l'interrupteur, les boutons et les liens, y compris sur l'interrupteur `desactive` — un contrôle mort qu'on ne peut pas atteindre ne peut pas être compris.
- [x] **ARIA** — l'interrupteur est un `switch` avec `aria-checked`, son `description` étant reliée par `aria-describedby` ; le paragraphe des deux entités est du texte ordinaire, **pas** un `alert` et **pas** une région vivante : un texte de conformité qui s'annonce tout seul à l'ouverture est agressif et il est lu avant d'être choisi ; la feuille de confirmation est un `dialog` avec `aria-modal`, un titre et une description ; chaque `Encart` de conséquence est un `status` poliment annoncé à son apparition, parce qu'il porte une conséquence que le client doit avoir entendue.
- [x] **Alternatives textuelles** — **cet écran n'a aucune image et aucun pictogramme décoratif.** L'icône de l'interrupteur, si elle existe, porte une alternative vide et son sens est porté par l'état annoncé et par le texte de la ligne. Rien à décrire, donc rien à manquer.
- [x] **Langue et direction de lecture** — `lang="fr"`, `dir="ltr"`, dates au format français long — « confirmée le 14 mars 2026 » ; une seule langue, aucune couche d'internationalisation (C5, B20).

---

## 8. Données

| Champ | Type | Origine | Requis | Erreur possible |
|---|---|---|---|---|
| Session active | objet session | Source d'identité, secure store (jamais `AsyncStorage`) | non | Absente → état « vide — jamais visité » |
| Adresse e-mail du compte | texte | Base applicative | oui si session | Absente → « Aucune » rendu à sa place, jamais une adresse devinée |
| Date de confirmation | date | Base applicative | oui si confirmation | Absente → « À confirmer » en `--color-attention`, jamais « Confirmée » sans date |
| Résultat du rapprochement | énumération `reussi \| echoue \| non_abouti` | Base applicative, **définitif** (B3) | oui si confirmation | Incohérent avec le résultat affiché → l'affichage suit le résultat **enregistré**, jamais le résultat calculé de nouveau |
| Nombre de tentatives | entier | Base applicative | non | ≥ 3 → compteur et lien de nouvelle tentative supprimés (B5) |
| Nombre de commandes | entier | Base applicative, jointure confirmée | non | Requête échouée → état d'indisponibilité du bloc, **jamais « 0 »** (C7) |
| Consentement d'audience | booléen | Base applicative | oui | Refus du serveur → l'interface revient à l'état enregistré et l'écrit (C9) |
| Date de suppression | date | Base applicative | non | Absente → le compte n'est pas supprimé et l'écran ne l'annonce pas |
| Âge de la copie locale | horodatage | Cache local, affiché tel quel | oui si hors-ligne | Jamais absent : une donnée rejouée sans âge n'est pas rendue (B19) |

- **Chargement** : tout d'un bloc, sans pagination. Le nombre de blocs dépendant de l'état de session, **aucun squelette complet n'est rendu** : afficher la structure entière avant de connaître l'état afficherait des sections d'interrupteur sur un compte qui n'a pas de session.
- **Cache / hors-ligne** : copie **en lecture seule** de l'identité du compte, de la date de confirmation et du résultat du rapprochement, rattachée au compte (B16). **Aucune écriture hors ligne**, donc aucune révocation, aucune déconnexion, aucune suppression en mode dégradé.
- **Données sensibles** : **c'est l'écran où la donnée personnelle est la donnée affichée.** L'adresse e-mail du client lui-même est rendue, elle est la sienne et elle est la preuve que la confirmation a eu lieu (B2). Aucune donnée de commande n'est ici : ni référence, ni montant, ni date de commande (B4). Ni l'adresse, ni l'identifiant de compte, ni l'état du consentement ne sont envoyés dans un événement d'audit (C9).
- **Instrumentation (PRD §8, C9)** : `compteOuvert` (booléen, aucune valeur d'identité), `consentementModifie` (sens : accordé ou révoqué, **jamais** l'état précédent complet ni d'identifiant), `compteSupprime` (booléen). La jointure « compte créé / Commandes ouverte » du critère de garde des 25 % se fait **côté serveur** (roadmap §2.5, Q-C) : C9 interdit de transporter un identifiant de personne dans un événement, donc cet outil ne peut pas la faire.

---

## 9. Traçabilité

| ID | Origine | Manifestation sur cet écran |
|---|---|---|
| **B2** | PRD | L'historique n'est ouvert que si la correspondance est confirmée, et l'écran **le montre** : la ligne « Confirmation » porte la date réelle, ou « À confirmer » en teinte d'attention. Tant qu'elle n'est pas confirmée, le bloc historique rend `acces-refuse` avec le libellé écrit du design system §5 |
| **B16** | PRD | Le bloc « Votre historique » écrit en toutes lettres que l'historique est **rattaché au compte** et non à l'appareil — « Votre historique suit cette adresse e-mail : il vous attend sur un autre appareil. » C'est l'information que le client retient, et elle est donc écrite plutôt que sous-entendue. US-7 et US-10 étant hors MVP, le bloc ne présente **aucune ligne vide** pour des sections absentes |
| **E5** | PRD | La suppression est accessible, confirmée par une feuille qui nomme **les deux conséquences** — « Vos données applicatives seront supprimées » et « Vos commandes restent enregistrées chez {boutique} » — et le résultat est redit après coup dans un `Encart · info` qui reste à l'écran |
| **E10** | PRD | La révocation **prend effet immédiatement** : pas de bouton de validation, pas d'état « en attente », pas de date de bascule. L'état `revocable` du design system §5 n'est pas utilisé, et la ligne porte la conséquence par écrit |
| **C9** | PRD | Un seul consentement existe — la mesure d'audience — parce que c'est la seule mesure que le MVP fait. Il est explicite, révocable, sa révocation **supprime réellement la ligne**, et aucun événement ne transporte d'adresse, d'identifiant de compte, de commande ni d'état de consentement. Si le serveur refuse, l'interface revient à l'état enregistré et l'écrit : afficher un état non enregistré serait la pire des deux erreurs |
| **C12** | PRD | Accessibilité de cet écran : cible d'interrupteur de 44 pt minimum qui grandit avec le texte, libellé relié à sa description par `aria-describedby`, état annoncé par `aria-checked` et par le texte visible, paragraphe de conformité jamais tronqué et jamais caché derrière un lien, et les deux boutons de la feuille de confirmation tous deux atteignables au réglage de police maximal |
| **C13** | PRD | Le paragraphe des deux entités est **présent sur cet écran, y compris avant toute création**, et il nomme nommément la boutique et le fournisseur d'identité. Il est réécrit ici parce qu'un client déjà inscrit doit pouvoir relire qui détient ses données : le versant RGPD de la création est raté si la lecture n'existe que le jour de l'inscription |
| **C4** | PRD | Le catalogue reste consultable sans compte et reste **atteignable depuis cet écran d'un geste**, dans tous les états y compris l'état d'erreur et l'état d'accès refusé. Un écran de compte n'est jamais un mur qui fermerait l'application |

---

## 10. Checklist de gate

- [x] Les 9 états sont décrits avec un rendu concret.
- [x] Chaque élément interactif a un comportement et un feedback.
- [x] Le responsive est défini à **chaque** breakpoint du design system — Mobile livré, Tablet et Desktop **écrits comme hors périmètre** avec leur condition de retour.
- [x] La section Anti-générique est cochée et justifiée.
- [x] Aucune valeur de design n'est laissée à « à définir ».
- [x] Chaque ID B*/E*/C* de l'écran apparaît en section 9. **E5 et C13 ont été ajoutés** par rapport au découpage initial, et la raison est écrite en tête de document : E5 n'a pas d'autre porte possible, et C13 n'est respectée que si la relecture existe après l'inscription.
- [x] `node "$FORGE/scripts/forge-guard.js" placeholders <anchor>` ne signale rien ici.
- [x] L'écran reste cohérent avec `.forge/design/design-system.md`.