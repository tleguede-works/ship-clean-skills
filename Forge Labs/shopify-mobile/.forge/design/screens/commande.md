---
type: screen
slug: commande
title: Détail d'une commande
module: commandes
status: draft
generated_at: 2026-09-30
derived_from:
  - .forge/prd.md
  - .forge/design/design-system.md
rule_ids: [B5, B13, B14]
edge_case_ids: [E2, E5]
flow: historique
---

# Écran — Détail d'une commande

> Ce document est la **source de vérité** pour qu'une IA génère l'interface de cet écran.
> Il est généré depuis ce gabarit, jamais recopié. Aucun `{{PLACEHOLDER}}` ne doit subsister.

---

## 1. Rôle de l'écran

| | |
|---|---|
| **Archétype d'app** | `mobile_consumer` — téléphone seul, iOS et Android, un seul marché (C10) |
| **Module** | `commandes` — **sous-écran**, au rang 3 du module parent |
| **Route** | `/commande/[id]` |
| **Type** | page — sous-écran empilé sur `/commandes` |
| **Utilisateurs** | Le client fidèle, **et seulement lui** : un compte sans correspondance confirmée, ou dont la commande n'appartient pas, n'atteint pas cet écran |
| **User stories servies** | US-2 |
| **Règles métier** | B5, B13, B14 |
| **Edge cases** | E2, E5 |

**Une phrase** : cet écran permet au client de relire le contenu d'une commande — articles, quantités, prix de ligne, total, état — et les deux dates qui fondent sa décision, afin de savoir ce qu'il a payé et jusqu'où il peut encore agir.

**Ce que cet écran n'est pas** : **ce n'est pas l'écran de suivi de US-3.** US-3 est hors du MVP (roadmap §2.2) et l'écart est explicite : « L'écran de suivi n'ouvre aucune donnée que la liste ne montre déjà. » Donc cet écran **n'affiche ni frise d'avancement, ni date estimée d'arrivée, ni numéro de transporteur, ni bouton de suivi de colis.** Ce qui n'est pas écrit ici est un choix : l'application ne montre pas une progression qu'elle ne sait pas mesurer, parce qu'une progression affichée sans source est une affirmation commerciale fabriquée.

Il n'affiche pas non plus de demande de retour (US-9 hors MVP) : la date limite est là, la demande ne l'est pas, et le client passe par le site — ce que le roadmap assume explicitement.

**La différence entre « illisible » et « introuvable » est la décision structurante de cet écran.** `Panneau d'état · indisponible` propose « Réessayer ». `Panneau d'état · introuvable` propose « Retour à mes commandes ». Ce n'est pas une nuance de libellé : **« Réessayer » sur une commande qui n'existe plus serait un mensonge d'interface** — il promet une opération qui aboutira au même résultat, et il transforme une absence définitive en panne qui fatigue le client. L'écran distingue donc les deux à la source, et cette distinction est écrite dans le design system §5 et reprise ici telle quelle.

**La règle de B5 s'applique ici aussi.** Un lien profond vers `/commande/[id]` ne peut pas servir à sonder l'existence de commandes : c'est le même `correspondance-echouee` que sur l'onglet, avec le même compteur, et au-delà de trois tentatives le compteur **et** le lien disparaissent.

---

## 2. Direction visuelle de cet écran

Repris du design system — **valeurs concrètes, jamais « à définir »**.

| | |
|---|---|
| **Mood** | « chaleureux, dense, sans emphase » — repris du design system §0 |
| **Densité** | **dense**, avec le seul point aéré de l'application : la **`Pastille de statut` de l'état de commande**, isolée en haut, seule respiration. Elle est aérée parce qu'elle est le seul élément qui décrit un temps, alors que tout le reste décrit des montants |
| **Niveau de contraste** | **fort** — contenu sur le papier `#F1EDE5`, aucun conteneur de carte. Le récapitulatif de la commande est posé sur une feuille `#FBF8F2` avec un filet, sans ombre : c'est le seul conteneur, et il correspond à celui du panier, parce que ce sont les deux seules fois où l'on additionne des sommes fournies par la source |
| **Surface** | `--color-background #F1EDE5` pour l'en-tête, les articles et les deux dates ; `--color-surface #FBF8F2` pour le récapitulatif et pour les `Panneau d'état` |
| **Accent utilisé** | `--color-encre-700 #1B2220` pour la référence de commande en `--text-display`, pour les bordures de focus et pour le bouton d'action ; `Pastille de statut` dans la teinte de l'état (`commandee` contour, `preparation` teinte, `expediee` pleine, `livree` pleine) ; `--color-attention #7A5A0C` sur `--color-attention-doux #F6EBD2` **uniquement** quand la date limite de retour approche de moins de sept jours — le seul endroit de l'application où le chroma porte une **échéance** |
| **Traitement photographique** | vignette 56 px par article, sur `--color-background`, sans carte ni bordure. Elle sert à reconnaître l'objet acheté trois mois plus tard, ce que le seul libellé ne permet pas toujours |
| **Référence** | Zalando mobile pour la ligne article à deux niveaux ; Apple Wallet pour l'historique qui affiche son âge |

### 2.1 Anti-générique — obligatoire

- [x] Pas de fond **blanc pur** — papier `#F1EDE5` et feuille `#FBF8F2`.
- [x] **Pas de carte ombrée pour tout** — les articles sont des **lignes** séparées par un filet `#D9D2C4`, sans fond, sans coins arrondis, sans ombre. Le récapitulatif est le seul bloc posé sur une feuille.
- [x] **Pas d'uniformité** : référence `--text-display 30/36 700` mono, nom d'article `--text-body 17/25`, prix unitaire `--text-body-sm 16/23` mono, quantité `--text-caption 14/19`, total `--text-h3 20/26 700` mono, dates `--text-caption`. Six niveaux sur un écran, dont deux en chiffres tabulaires.
- [x] **Pas de gris neutre générique** — la teinte de l'état de commande vient des quatre tons sémantiques ; l'échéance de retour vient de `--color-attention`, qui n'est pas un gris.
- [x] **Pas de mise en page centrée symétrique** — la ligne d'article est une grille à deux colonnes (photo + nom à gauche, quantité et prix de ligne à droite) ; le bloc des deux dates est aligné à gauche sur le filet, pas centré sous la commande.
- [x] **Pas d'illustration d'appoint générique** — aucun état de cet écran n'a d'illustration, y compris quand le produit n'a pas de photo : trame `--color-encre-200`, et la ligne reste complète avec son nom et ses prix.
- [x] **Pas d'une seule famille de police** — référence, quantités, prix unitaires, prix de ligne, dates et total sont tous en SF Mono / Roboto Mono, chiffres tabulaires. La référence de commande doit être lisible caractère par caractère : c'est elle que le client note sur un papier.

**Choix assumé et non neutre** : **les deux dates de B13 sont rendues dans un bloc encadré d'un filet, jamais en fin de liste.** Le bloc est composé de deux lignes exactement de même poids, et il porte une règle écrite en toutes lettres : « Retours acceptés jusqu'au {date}. » / « Livraison le {date}. ». La disposition dit deux choses qu'une liste de métadonnées ne dirait pas : que ces deux dates sont **une seule information** (une limite affichée sans la date qui la fonde est un mensonge juridique), et qu'elles sont **la seule chose de cet écran qui expire**. C'est pourquoi c'est le seul encadré de la fiche, et c'est pourquoi il ne se trouve ni dans un pied de page ni parmi les autres lignes.

**Second choix, contestable** : **aucun bouton de retour n'est rendu tant que la date limite de retour n'est pas passée**, et **aucun bouton d'action n'est rendu sur une commande livrée depuis plus de trente jours**. Une cible tactile vide occupe de l'espace, vole le geste au suivant et laisse croire qu'une action existe (design system §0, choix assumé n° 1). Le prix de ce choix : la fiche se termine par des données, sans rien à presser. C'est la bonne forme pour un écran que l'on ouvre pour lire.

---

## 3. Anatomie

```
Écran "/commande/[id]" — sous-écran
├─ Barre système — retour vers "/commandes" avec la position de défilement
├─ Bandeau d'âge hors ligne — rendu seulement hors ligne, --color-info
├─ En-tête de commande
│    ├─ Référence --text-display 30/36 mono + date de commande --text-body-sm
│    └─ Pastille de statut — état de la source, teinte de statut, isolée
├─ Bloc des deux dates — filet --color-secondaire, deux lignes de même poids
│    ├─ "Livraison le {date}."
│    └─ "Retours acceptés jusqu'au {date}."   (teinte --color-attention si < 7 jours)
├─ Articles — une ligne par article, vignette 56 px
│    └─ Ligne d'article
│         ├─ Vignette 56×56 + nom --text-body + prix unitaire --text-body-sm
│         ├─ Quantité --text-caption mono
│         └─ Prix de ligne --text-body mono aligné à droite
├─ Récapitulatif — feuille --color-surface, filet, sans ombre
│    ├─ Lignes de la source marchande --text-caption, une par ligne, jamais fusionnées
│    └─ Total --text-h3 700 mono
├─ Bloc d'action — conditionnel, absent par défaut
│    ├─ Bouton primaire "Retours" — rendu seulement dans la limite affichée, et US-9 étant hors MVP, NON rendu au MVP
│    └─ Encart "Aucune commande de retour possible depuis le {date}." au-delà
└─ Encart d'information sur le propriétaire des données (E5)
```

| # | Composant | Rôle | Source |
|---|---|---|---|
| 1 | En-tête de commande | Référence, date, état — l'identité de la commande | slice-local, sur design-system §5 |
| 2 | Pastille de statut | État de la commande, libellé de la source | design-system §5 |
| 3 | Bloc des deux dates | La livraison et la limite de retour, ensemble ou aucune | slice-local, filet de design-system §1 |
| 4 | Ligne d'article | Photo, nom, quantité, prix unitaire, prix de ligne | slice-local, sur design-system §5 |
| 5 | Récapitulatif | Lignes de total fournies par la source, puis le total | slice-local, identique au panier |
| 6 | Encart | Porteur de la raison d'une action absente ou impossible | design-system §5 |
| 7 | Panneau d'état | `indisponible`, `introuvable`, `acces-refuse`, `correspondance-echouee`, `hors-ligne` | design-system §5 |

**Ce qui n'est pas dans cette anatomie** et ne doit pas y apparaître : une frise d'avancement, un numéro de transporteur, une date estimée d'arrivée, un bouton de suivi, un bouton de demande de retour (US-9 hors MVP), un interrupteur de notification (US-8 hors MVP), un bouton de suppression de commande, un partage de la commande.

---

## 4. États — tous, sans exception

| État | Déclencheur | Rendu | Feedback utilisateur |
|---|---|---|---|
| **Chargement** | Ouverture depuis la liste, ou ouverture directe par lien profond | **Aucun squelette pleine page (B8).** La référence de commande et la date s'affichent dès leur arrivée, en `--text-display`. Les lignes d'articles sont squelettées **à hauteur fixe** et la ligne de commande venue de `/commandes` conserve sa place en haut de pile, donc le retour arrière restaure la position | Le bouton d'action éventuel est rendu en `chargement` dès l'ouverture. Aucun indicateur global |
| **Rempli** | La commande est relue et lisible | En-tête, deux dates de B13, articles, récapitulatif. La commande livrée depuis plus de 30 jours a **une hauteur de ligne réduite et aucun bouton** | Aucun. La teinte de la pastille et la présence ou l'absence de bouton portent déjà toute l'information |
| **Vide — jamais visité** | Aucun accès à cet écran : lien profond sans compte, compte créé sans confirmation | `Panneau d'état · acces-refuse` avec le libellé écrit du design system §5 : « Confirmez l'adresse e-mail de votre compte pour voir vos commandes. » Action « Confirmer mon adresse ». **Aucune donnée de commande n'est demandée** — ni existence, ni référence, ni montant, ni date (B4) | Aucun. Le lien profond ne dit pas si la commande existe : il dit ce qu'il faut confirmer, ce qui est la seule réponse honnête |
| **Vide — aucune donnée** | Correspondance non aboutie, **ou** commande sans article exploitable | `Panneau d'état · correspondance-echouee` avec le libellé écrit : « Aucune commande trouvée à cette adresse. » et le détail « {n} tentatives sur 3 ». Action « Vérifier une autre adresse ». **Au-delà de trois tentatives, le compteur et le lien disparaissent tous les deux** et il ne reste que la phrase et le lien « Voir mes commandes sur la boutique » (B5) | Aucun. Le compteur est une donnée de diagnostic, pas une sanction : il disparaît au moment où il n'a plus d'action à offrir |
| **Erreur de chargement** | La commande ne peut pas être relue : réseau, source indisponible | `Panneau d'état · indisponible` avec le libellé écrit du design system §5, sujet commande : « Indisponible pour le moment. Cette commande n'a pas été effacée. » Action **« Réessayer »**. **Jamais** un statut d'avancement par défaut, **jamais** une liste vide, **jamais** un squelette qui s'installe (E2) | Le bouton « Réessayer » relance **cette seule** commande. Le reste de l'application reste navigable |
| **Erreur de soumission** | Le bouton d'action de la commande échoue — au MVP, il n'y en a pas d'écrivant, mais l'encart E2 compte | `Encart · erreur` à l'emplacement de l'action, motif en clair. L'action passe en `desactive` avec la raison écrite à côté | Aucun toast |
| **Succès** | La commande est relue après un réessai réussi, ou son état a changé | L'écran passe de l'état d'indisponibilité au contenu complet. **La distinction avec l'état précédent est portée par la teinte de la pastille**, pas par un toast « commande chargée » | Aucun |
| **Hors-ligne / permissions** | Ouverture sans réseau, ou cache locale illisible | **Copie locale rendue en entier**, avec un bandeau `--color-info #2A5470` en tête : « Affiché hors ligne. Dernière mise à jour il y a X h. », action « Réessayer ». Les deux dates de B13 s'affichent **ensemble**, avec l'âge du cache — la date limite affichée est celle de la copie, donc elle est datée | Aucune action d'écriture n'est proposée. Aucune action d'œil n'est proposée non plus, ce qui est cohérent : hors ligne, on ne consulte rien de neuf |
| **Lecture seule** | **Compte sans correspondance confirmée**, ou compte supprimé | `Panneau d'état · acces-refuse` / `correspondance-echouee` selon le cas, avec la chaîne de compteurs de B5. Et le cas propre à E5 : **après la suppression du compte, ce lien rend l'accès refusé et jamais la commande** | Encart d'information en pied d'écran, présent dans tous les états lisibles : « Ces commandes sont enregistrées chez {boutique}. Supprimer votre compte dans l'application ne les efface pas. » |

> Un état non décrit est un état non implémenté. Aucun de ces neuf n'affiche un état de commande par défaut, et « Réessayer » n'apparaît que là où une lecture a réellement échoué (C7).

---

## 5. Interactions

| Élément | Événement | Comportement | Feedback visuel | État résultant | ID |
|---|---|---|---|---|---|
| Ligne d'article (photo ou nom) | tap | Navigation vers `/produit/[handle]` — le catalogue reste consultable sans compte, y compris depuis l'historique (C4) | Pressé 120 ms | Fiche produit | C4 |
| Action « Réessayer » | tap | Relance **la seule** lecture de cette commande | `chargement`, largeur inchangée, libellé conservé en accessibilité | Rempli, ou Erreur de chargement à nouveau | E2 |
| Action « Vérifier une autre adresse » | tap | Navigation vers `/compte` puis la création, dans la limite des trois tentatives | Pressé 120 ms | Compte | B5 |
| Action « Retour à mes commandes » | tap | Navigation vers `/commandes` | Aucun | Liste des commandes | E2 |
| Action « Confirmer mon adresse » | tap | Navigation vers `/compte` | Aucun | Compte | B2 |
| Lien « Voir mes commandes sur la boutique » | tap | Ouverture de l'URL de la boutique | Aucun | Sortie de l'application | E1 |
| Bloc des deux dates | tap | **Aucune action.** Ce bloc n'est pas une cible : il n'ouvre rien, et un client qui le presse doit découvrir qu'il n'y a rien derrière | Aucun — il n'y a pas de cible tactile morte | Rempli | B13 |
| Retour système | geste | Retour vers `/commandes` avec la position de défilement exacte | Transition `--duration-slow 320ms` | Liste des commandes | — |

- **Focus / clavier** : ordre de tabulation égal à l'ordre de lecture — retour système, puis les lignes d'articles (dont chacune est un `button` nommé « {nom}, {quantité}, {prix de ligne} »), puis le récapitulatif, puis les actions d'état. **La référence de commande, les dates et les prix ne sont jamais des cibles** : ce sont des données.
- **Gestes** : défilement vertical natif, pull-to-refresh. **Aucun swipe n'a d'effet.** Aucun geste ne déclenche de demande de retour, aucune demande n'existe au MVP.
- **Animations** : `--duration-fast 120ms` sur les pressés ; **aucune animation de révélation de l'état de commande** — la teinte qui change d'un état à l'autre est instantanée, parce qu'un fondu sur une teinte sémantique fait croire à un changement d'état progressif ; `--duration-slow 320ms` au retour arrière seulement.
- **Retour arrière** : rend `/commandes` **avec sa position de défilement exacte**. C'est la seule garantie que cet écran doit au client, et c'est la raison pour laquelle il ne possède pas de barre d'onglets : la liste est son contexte.

---

## 6. Responsive

| Breakpoint | Comportement | Ce qui se replie / disparaît |
|---|---|---|
| **Mobile** | **Seul format livré et seul format de référence** : `--format-320 320 × 568`. Marge `--space-lg 24px`, zone utile 272 px. Vignette d'article 56 px + gouttière `--space-md 16px` + colonne de texte ; quantité et prix de ligne sur la colonne de droite en chiffres tabulaires, ce qui donne 120 px au nom de l'article sur deux lignes | Rien ne disparaît. Ce qui se replie, c'est le nom d'un article au libellé long du marchand : il passe sur trois lignes et la ligne grandit |
| **Tablet** | **Hors périmètre en v1** — C10 exclut tablette et web ; le roadmap §4.2 conditionne leur retour à une part de sessions tablette mesurée pendant la fenêtre, au-dessus d'un seuil écrit avant publication | Non conçu. Aucune mise en page à deux colonnes article/récapitulatif |
| **Desktop** | **Hors périmètre en v1**, même raison, même seuil. Le format de référence unique est `--format-320` | Non conçu |

- **Cible tactile** : ligne d'article entière, 56 px de haut ; retour système 44 × 44 px ; actions des `Panneau d'état` et des `Encart`, 44 px de hauteur de ligne ; bloc des deux dates, **hors parcours de tabulation** car il n'a aucune action.
- **Débordement** : garanti sans débordement à tout réglage de police — la référence (`--text-display` mono, retour à la ligne autorisé, **jamais tronquée** : une référence tronquée est une référence fausse) ; le nom d'article (`--text-body`, trois lignes puis `…`) ; **les deux dates de B13 en toutes lettres, jamais abrégées ni rognées** — une date limite dont le jour est coupé n'a aucune valeur juridique ; le prix unitaire et le prix de ligne (chiffres tabulaires, colonne conservée, jamais rognés) ; le total (`--text-h3 700` mono, `flex-wrap` autorisé).
- **Réglage de police** : aucun conteneur de texte n'a de hauteur fixe ; les lignes d'articles **grandissent** au réglage maximal et les vignettes restent alignées en haut de ligne, jamais centrées verticalement, ce qui ferait mentir la grille de lecture ; les deux dates de B13 **restent solidaires** et ne se séparent jamais.

---

## 7. Accessibilité

- [x] **Contraste du texte courant** — `--color-texte-principal #161A19` sur `--color-background #F1EDE5` pour la référence, les noms d'articles et les prix de ligne ; `--color-texte-secondaire #5A544A` sur `--color-background` pour les quantités, le prix unitaire et les deux dates ; `--color-texte-principal #161A19` sur `--color-surface #FBF8F2` pour le total et les libellés d'état. Le seuil appartient à `design-check contrast`.
- [x] **Contraste des grands textes** — la référence en `--text-display 30/36` est posée sur `--color-background` ; le total en `--text-h3` est posé sur `--color-surface`. **Le libellé de la `Pastille de statut` est posé sur le fond doux de sa teinte avec le token `-fort` correspondant**, jamais sur la teinte pleine avec du texte courant — sauf pour les états `expediee` et `livree`, où le fond est plein et le texte est `--color-texte-inverse` (design system §0 : `--color-texte-inverse` est posé sur encre et sur les quatre teintes).
- [x] **Navigation clavier complète** — sur matériel, ordre de tabulation égal à l'ordre de lecture ; la commande entière est annoncée par son nom accessible complet — « commande {référence}, {état}, livrée le {date}, retours acceptés jusqu'au {date}, {montant} » — en un seul nœud, de sorte qu'un client au lecteur d'écran entende les deux dates de B13 **sans avoir à entrer dans l'écran**. C'est la raison de construire ce nom en §7 plutôt que de laisser les champs s'annoncer un par un.
- [x] **Focus visible** — anneau de 2 px en décalage de 2 px, couleur `--color-bordure-focus #1B2220`, sur le retour système, les lignes d'articles et les actions ; les éléments sans action n'ont pas d'anneau, ce qui est cohérent avec leur absence de cible.
- [x] **ARIA** — l'écran est titré par « Commande {référence} » ; les articles sont un `list` dont chaque entrée est un `button` ; la `Pastille de statut` est annoncée par son libellé complet et non par sa teinte ; le bloc des deux dates est une `region` étiquetée « Livraison et retours », annoncée une fois et **non** deux fois ; l'`Encart` E5 est un `note` persistant ; les `Panneau d'état` sont des `region` étiquetées, jamais des `alert` silencieux ; le bandeau hors-ligne est un `status`.
- [x] **Alternatives textuelles** — chaque vignette porte le texte alternatif du marchand ou, à défaut, « Photo de {nom de l'article} » ; une photo absente rend une trame décorative à alternative vide, et la ligne reste complète avec son nom et ses prix ; le pictogramme de la `Pastille de statut` est décoratif et son sens est porté par le libellé en toutes lettres.
- [x] **Langue et direction de lecture** — `lang="fr"`, `dir="ltr"`, dates au format français long et non ambigu — « 14 mars 2026 », jamais « 14/03/26 » ; une seule langue, aucune couche d'internationalisation (C5, B20).

---

## 8. Données

| Champ | Type | Origine | Requis | Erreur possible |
|---|---|---|---|---|
| Identifiant de commande | texte | Route `/commande/[id]` | oui | Inconnu ou non lisible → `Panneau d'état · introuvable`, action « Retour à mes commandes », **sans « Réessayer »** : une commande qui n'existe plus ne se réessaie pas |
| Confirmation de la correspondance | booléen | Base applicative | **oui, gate** | Absente ou fausse → `acces-refuse` ; **aucune requête de commande n'est émise** (B2) |
| Nombre de tentatives de rapprochement | entier | Base applicative | non | ≥ 3 → **le compteur et le lien « Vérifier une autre adresse » disparaissent tous les deux** (B5) |
| Référence de commande | texte | Source marchand | oui | Absente → rendue vide à sa hauteur, jamais reconstituée (B23) |
| Date de commande | date | Source marchand | oui | Absente → date non rendue |
| État de commande | libellé de la source | Source marchand | oui | Absent → **aucune pastille, aucun état par défaut** : surtout pas « en cours », qui serait une progression affirmée sans source (E2) |
| Articles | tableau d'articles | Source marchand | oui | Tableau vide → **le bloc articles n'est pas rendu**, pas de « 0 article » ; la commande reste affichable avec ses deux dates |
| Photo d'article | URL d'image | Source marchand | non | Absente → trame `--color-encre-200`, ligne complète |
| Nom d'article, prix unitaire, prix de ligne, quantité | texte, entier | Source marchand | oui / oui / oui / oui | Absents → rendus vides à leur hauteur, jamais recalculés (B23) |
| Lignes de récapitulatif | tableau de libellés et montants | **Source marchand, jamais calculées** | oui | Absentes → récapitulatif non rendu et **aucun total reconstitué** |
| Total | texte, tel que fourni | Source marchand | oui | Absent → total non rendu, la commande reste lisible |
| Date de livraison | date | Source marchand | non | Absente → **la date limite de retour n'est pas affichée non plus** (B13) |
| Date limite de retour | date | Source marchand | non | Absente → **la date de livraison n'est pas affichée non plus** (B13) |
| Âge de la copie locale | horodatage | Cache local, affiché tel quel | oui si hors-ligne | Jamais absent : une commande rejouée sans âge n'est pas rendue (B19) |

- **Chargement** : **un seul bloc, sans pagination.** Une commande est un objet fermé : elle ne se pagine pas et ne se recharge pas au défilement. La lecture est déclenchée à l'ouverture et relancée au tap sur « Réessayer ».
- **Cache / hors-ligne** : copie **en lecture seule** de la commande, rattachée au compte (B16), contenant son horodatage. Aucune écriture hors ligne. La copie ne peut pas devenir un contournement de B2 : elle n'existe que pour une commande déjà confirmée.
- **Données sensibles** : référence, montant, nom d'article et dates **ne transitent jamais avant confirmation de la correspondance** (B2, B4). L'identifiant présent dans la route n'est pas une donnée de commande affichée, mais il ne doit apparaître dans **aucun** événement d'audit : la jointure se fait côté serveur (roadmap §2.5, Q-C, et C9).
- **Instrumentation (PRD §8, C9)** : `commandeOuverte` (âge de la commande en jours, état de commande comme catégorie, **jamais l'identifiant ni la référence**) ; `commandeIndisponible` (motif : réseau, source, identifiant inconnu) ; `produitOuvertDepuisCommande` (handle produit). Un client qui ouvre une commande et la referme sans autre geste est le profil qu'il faut mesurer, et il se mesure sans écrire une seule donnée personnelle.

---

## 9. Traçabilité

| ID | Origine | Manifestation sur cet écran |
|---|---|---|
| **B5** | PRD | Le lien profond vers une commande échoue sur `correspondance-echouee` avec le compteur de tentatives, exactement comme l'onglet. **Au-delà de trois tentatives, le compteur et le lien « Vérifier une autre adresse » disparaissent tous les deux**, et il ne reste que la phrase et le lien vers la boutique |
| **B13** | PRD | La date de livraison et la date limite de retour sont rendues **ensemble, dans un bloc unique, ou aucune des deux**. Le composant n'a pas d'état « une date seulement » : si la source ne fournit pas l'une, l'autre n'est pas affichée, et l'écran ne comble pas le vide |
| **B14** | PRD | **Aucune notification n'est demandée sur cet écran.** US-8 est hors du MVP, donc cet écran ne contient aucun interrupteur, aucune case, aucune demande de permission système. La seule surface de consentement de l'application est `/compte`, ce qui rend la règle vérifiable d'un coup d'œil : il n'existe qu'un endroit où l'on peut consentir |
| **E2** | PRD | Commande en cours illisible → « Indisponible pour le moment » + « Réessayer », libellé du design system §5. **Jamais une liste vide, jamais un statut d'avancement par défaut, jamais une date estimée inventée** — et l'absence de « Réessayer » sur `introuvable` est la contrepartie obligatoire |
| **E5** | PRD | Après la suppression du compte, ce lien rend un panneau d'accès refusé et **jamais la commande**. Un `Encart · info` en pied d'écran nomme en toutes lettres le propriétaire des données : « Ces commandes sont enregistrées chez {boutique}. Supprimer votre compte dans l'application ne les efface pas. » Il n'y a aucun bouton de suppression de commande ici : la suppression est dans `/compte` et elle ne porte pas sur les commandes |
| **C4** | PRD | Chaque article de la commande ouvre la fiche produit, qui reste consultable **sans compte et hors ligne avec son âge**. Le catalogue n'est jamais fermé à la porte de l'historique |

**Règles du PRD citées sans être opposables à cet écran** : **B7**, cité par E2, est respectée mécaniquement — panne et absence sont deux panneaux distincts, et l'absence n'a pas d'action de réessai. **B6 et B23** sont respectées par construction : aucun montant n'est calculé, aucun état n'est inventé, aucune date n'est estimée.

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