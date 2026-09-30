---
type: prd
status: draft
generated_at: 2026-09-30
version: 1
---

# Product Requirements Document — Onduleur

> Ce document décrit CE QUE le produit fait, POUR QUI, et POURQUOI.
> Il ne décrit PAS comment il sera implémenté (technologie, architecture, design visuel).
>
> Toute règle métier, edge case et contrainte porte un identifiant stable (B*, E*, C*)
> qui servira de colonne vertébrale à toute la traçabilité du projet.

---

## 1. Résumé exécutif

### 1.1 Problème

Les clients d'une boutique Shopify française d'environ 2 000 clients n'ont que deux portes vers elle : un site web mobile et un e-mail. Trois problèmes concrets en découlent.

**Aucun ré-engagement hors e-mail.** Un client qui a commandé une fois ne revient que s'il reçoit un message ou se souvient de l'adresse. Il n'existe aucune surface où il puisse, spontanément, se rappeler que la boutique existe.

**L'historique d'achat est introuvable.** Le suivi de commande passe par un lien d'e-mail que l'on ne retrouve pas trois mois plus tard. Les commandes passées en tant qu'invité n'ont aucune trace accessible.

**La sortie est à chaque fois vers le site.** Il n'y a nulle part où revenir.

Pourquoi maintenant : l'accès programmé au catalogue Shopify est mature et inclus dans le forfait que la boutique paie déjà, donc le coût marginal d'une application est structurellement plus faible qu'il y a trois ans — pendant que le coût d'acquisition d'une audience uniquement par e-mail augmente. La question n'est plus « peut-on » mais « avec quel budget ».

### 1.2 Solution

**Onduleur donne au client, en deux gestes, l'accès à ce qu'il a déjà acheté chez ce marchand — sans avoir à rouvrir le site.**

La nuance qui commande tout le reste : la valeur n'est pas le catalogue. Le site le fait déjà, correctement, et avec le paiement. Le catalogue n'est dans l'application que parce qu'il doit être consultable sans compte et partageable par lien ; l'**historique tient la raison de venir**.

Conséquence directe : l'accueil n'est pas un sommaire de rubriques. Un écran d'accueil qui liste « Nos catégories / Notre histoire / Nos conditions » est un menu, et un menu n'ouvre pas une boucle.

### 1.3 Utilisateurs cibles

| Persona | Rôle | Contexte | Niveau technique | Besoin principal | Fréquence |
|---|---|---|---|---|---|
| **Le client fidèle** | Client ayant déjà commandé plusieurs fois | Téléphone, 4G plafonné, sessions courtes | Grand public | Retrouver **une référence précise** — « ai-je commandé cette veste l'hiver dernier ? » — suivre une commande, retrouver une adresse | Rares, mais décisives |
| **Le client occasionnel** | Regarde, achète une fois, ne revient pas | Idem | Grand public | Ne pas avoir à **s'identifier** pour regarder | Très rares |
| **Le nouveau ou le partageur** | Arrive par un lien, éventuellement hors connexion | Idem, souvent appareil d'entrée de gamme | Grand public | Voir **la fiche du produit partagé** sans compte et sans réseau | Ponctuelles |

**La donnée la plus importante de cette section : la majorité des 2 000 clients n'a pas de compte.** Tout l'ordre des onglets en découle, et c'est un arbitrage, pas une évidence.

Une part réelle d'utilisateurs de lecteurs d'écran et de texte agrandi existe : l'accessibilité est une contrainte d'usage, pas une politesse.

### 1.4 Différenciation

**Nous ne demandons pas au client d'apprendre une nouvelle marque : il retrouve, dans la boutique qu'il connaît déjà, ce qu'il y a a acheté.**

Comparaison honnête, du plus gênant au moins gênant :

1. **Le site mobile de la boutique, plus l'e-mail.** C'est le vrai concurrent : déjà dans le navigateur, avec le paiement, une URL en favori, et gratuit. Toute proposition de valeur doit survivre à cette comparaison.
2. **Les applications de marchands Shopify.** Elles font honnêtement 80 % de ce que nous faisons, et elles sont déjà déployées sur des milliers de boutiques. Ce qui nous manque, c'est leur justification économique : ce sont des produits génériques, multilingues, avec des options qu'une boutique de 2 000 clients n'utilisera jamais. **Notre différenciation n'est pas la capacité, c'est le coût et l'adéquation au catalogue réel.**
3. **Les applications de fidélité et de cashback.** Le comparatif le plus honnête, parce que c'est ce que le client a déjà dans sa poche. Elles ont un avantage structurel que nous ne pouvons pas rivaliser : le client les ouvre au moment où il a la carte en main. Elles n'ont en revanche pas accès à l'historique client de la boutique — elles savent qu'il a payé, pas ce qu'il a payé.

**L'aveu qui doit être fait : si l'application n'améliore pas la fréquence d'ouverture, le site gagne**, parce qu'il est déjà là, à une adresse que l'on sait retrouver. C'est le risque central du projet, et il n'est pas technique.

---

## 2. Utilisateurs et personas

| Persona | Rôle | Contexte | Niveau technique | Besoin principal | Fréquence d'usage |
|---|---|---|---|---|---|
| Le client fidèle | Client récurrent | Commandes tôt le matin ou en soirée, téléphone en main | Grand public | Retrouver un achat passé, suivre une commande en cours | 2 fois par an, plus à chaque commande |
| Le client occasionnel | Acheteur d'une fois | Découverte par lien ou par e-mail | Grand public | Consulter sans s'identifier | 1 fois |
| Le nouveau ou le partageur | Arrivé par un lien de produit | Souvent hors connexion, appareil d'entrée de gamme | Grand public | Ouvrir la fiche du produit partagé | 1 fois |
| Le marchand | Propriétaire de la boutique | Configure le catalogue, les rails, les collections | Non technique | Ne rien avoir à intégrer ni à maintenir | Jamais — c'est le point |

---

## 3. User stories

<!-- Priorité : P1 (doit avoir), P2 (devrait avoir), P3 (pourrait avoir), P4 (pas maintenant) -->

### US-1 : Consulter le catalogue sans compte

- **En tant que** client occasionnel ou nouveau
- **Je veux** parcourir le catalogue et lire une fiche produit sans créer de compte
- **Afin de** regarder ce qui m'intéresse sans m'engager

**Priorité** : P1
**Dépendances** : aucune

**Critères d'acceptation** :
- [ ] Le catalogue et les fiches produit sont accessibles sans aucune identification.
- [ ] Aucune action de consultation n'exige un compte, y compris depuis un lien partagé.
- [ ] Une fiche produit partagée s'ouvre hors connexion, avec l'âge de ce qui est affiché.

### US-2 : Retrouver ce que j'ai déjà acheté

- **En tant que** client fidèle
- **Je veux** retrouver mes commandes et leurs produits
- **Afin de** savoir ce que j'ai acheté, sans rouvrir le site

**Priorité** : P1
**Dépendances** : US-4

**Critères d'acceptation** :
- [ ] La liste des commandes n'est visible qu'après confirmation de l'adresse e-mail du compte.
- [ ] Chaque commande affiche ses articles, son état, sa date de livraison et la date limite de retour calculée.
- [ ] Un compte sans correspondance confirmée affiche « aucune commande pour le moment », formulé en mots, sans laisser croire à une panne.

### US-3 : Suivre une commande en cours

- **En tant que** client
- **Je veux** suivre l'avancement d'une commande depuis la liste
- **Afin de** savoir quand elle arrive

**Priorité** : P1
**Dépendances** : US-2

**Critères d'acceptation** :
- [ ] La liste des commandes mène au suivi de chaque commande.
- [ ] Si la commande ne peut pas être relue, l'écran dit « indisponible pour le moment » et propose un réessai — il ne montre jamais une liste vide.
- [ ] La date de livraison et la date limite de retour sont affichées ensemble, ou aucune des deux ne l'est.

### US-4 : Créer un compte et le rattacher à mon historique

- **En tant que** client fidèle
- **Je veux** créer un compte et voir si mes commandes existantes s'y rattachent
- **Afin de** ne pas repartir de zéro

**Priorité** : P1
**Dépendances** : aucune

**Critères d'acceptation** :
- [ ] La création de compte exige une confirmation par e-mail.
- [ ] Le rapprochement est tenté **une seule fois**, à la confirmation, et son résultat est définitif.
- [ ] L'écran de création de compte nomme les deux entités qui détiennent des données personnelles, et le consentement se coche explicitement.
- [ ] En cas d'échec, l'application dit « aucune commande trouvée à cette adresse » et propose « vérifier une autre adresse », trois tentatives au maximum.

### US-5 : Rechercher un produit

- **En tant que** client
- **Je veux** rechercher un produit par nom
- **Afin de** retrouver une référence précise

**Priorité** : P1
**Dépendances** : aucune

**Critères d'acceptation** :
- [ ] La recherche est atteignable sans défilement depuis l'écran d'accueil.
- [ ] L'onglet de recherche affiche toujours un contenu — réassorts, nouveautés, derniers consultés — avant le champ de saisie.
- [ ] Un onglet ne présente jamais un état vide en premier écran.

### US-6 : Préparer un achat

- **En tant que** client
- **Je veux** constituer un panier dans l'application et le finaliser sur la boutique
- **Afin de** commander sans multiplier les allers-retours

**Priorité** : P1
**Dépendances** : US-1

**Critères d'acceptation** :
- [ ] Le panier se construit dans l'application et la sortie mène au paiement de la boutique pour ce panier précis.
- [ ] L'application ne demande et n'affiche jamais de numéro de carte.
- [ ] Si le panier ne peut pas être relu, l'écran le dit et propose un réessai.

### US-7 : Enregistrer un produit

- **En tant que** client fidèle
- **Je veux** mettre un produit en favori
- **Afin de** le retrouver

**Priorité** : P2
**Dépendances** : US-4

**Critères d'acceptation** :
- [ ] Un favori est attaché au compte, donc retrouvé sur un autre appareil.
- [ ] Retirer un favori le supprime réellement.

### US-8 : Être prévenu d'un changement d'état de commande

- **En tant que** client
- **Je veux** recevoir une seule notification quand ma commande change d'état
- **Afin de** ne pas avoir à vérifier

**Priorité** : P2
**Dépendances** : US-4

**Critères d'acceptation** :
- [ ] Aucune notification n'est envoyée sans consentement explicite.
- [ ] Le consentement est révocable, et sa révocation supprime réellement le jeton.
- [ ] Le même changement d'état reçu deux fois n'envoie qu'une notification.

### US-9 : Demander un retour

- **En tant que** client
- **Je veux** demander le retour d'un article
- **Afin de** ne pas dépendre d'un e-mail

**Priorité** : P3
**Dépendances** : US-3

**Critères d'acceptation** :
- [ ] La demande part de la fiche de commande.
- [ ] Elle n'est possible que dans la limite affichée, ou refusée avec la date qui la fonde.

### US-10 : Gérer mes adresses

- **En tant que** client fidèle
- **Je veux** enregistrer mes adresses de livraison
- **Afin de** ne pas les ressaisir

**Priorité** : P2
**Dépendances** : US-4

**Critères d'acceptation** :
- [ ] Les adresses sont rattachées au compte.
- [ ] Aucune adresse n'est affichée sans correspondance confirmée.

---

## 4. Règles métier

| ID | Règle | User story liée | Notes |
|---|---|---|---|
| B1 | Le catalogue et les fiches produit sont consultables sans compte, y compris depuis un lien partagé et hors connexion. | US-1 | Aucune rétention ne peut être posée sur l'authentification. |
| B2 | L'historique de commandes, les adresses et les favoris n'apparaissent qu'après confirmation par e-mail de l'adresse du compte. | US-2, US-4, US-7, US-10 | Accès fermé : un défaut de correspondance est un refus. |
| B3 | Le rapprochement entre le compte et le client enregistré est tenté **une seule fois**, à la confirmation du compte, et son résultat — positif ou négatif — est définitif. | US-4 | Réessayer à chaque ouverture serait une tentative continue de rapprochement d'identité. |
| B4 | **Aucune donnée de commande n'est affichée sur la base d'un élément autre que la confirmation de l'adresse e-mail du compte.** Ni nom, ni code postal, ni montant, ni date. | US-2, US-4 | C'est la seule chose qui ressemblerait à une divulgation. |
| B5 | Un client dont le rapprochement échoue peut vérifier une autre adresse, **trois tentatives au maximum**. | US-4 | Au-delà, l'historique est vide et le dit. |
| B6 | **Le marchand est une source, pas un collaborateur.** Aucun écran ne corrige, n'arrondit ni ne complète une donnée boutique. | US-1, US-6 | Si le marchand se trompe, l'application montre l'erreur telle quelle. Une application qui affiche un prix différent du site perd le client deux fois. |
| B7 | **Un affichage vide n'est jamais un zéro.** Si une lecture échoue, l'écran dit « indisponible pour le moment » et propose un réessai. | US-1, US-3, US-6 | Une panne réseau transformée en affirmation commerciale est le défaut le plus coûteux. |
| B8 | Chaque écran a un état de chargement **partiel** : il rend ce qu'il a avant de tout attendre. | US-1, US-3 | Jamais un squelette unique pleine page. |
| B9 | L'accueil affiche toujours **trois rails**, quelles que soient les données éditoriales disponibles. | US-1 | Trois niveaux de repli, jamais aucun vide — voir E4. |
| B10 | **Un onglet ne présente jamais un état vide en premier écran** : il présente d'abord un contenu, le champ ensuite. | US-5 | Un onglet réduit à un champ est une barre de recherche déplacée, pas un onglet. |
| B11 | La recherche est atteignable sans défilement depuis l'accueil, en pleine largeur. | US-5 | Un champ minuscule en en-tête est la faute que l'archétype signale chez les autres. |
| B12 | Le panier se construit dans l'application et la sortie mène au paiement de la boutique pour ce panier précis. | US-6 | L'application ne voit jamais de numéro de carte. |
| B13 | La fiche de commande affiche la date de livraison **et** la date limite de retour calculée, ou aucune des deux. | US-3, US-9 | Une limite affichée sans la date qui la fonde est un mensonge juridique. |
| B14 | Aucune notification n part sans consentement explicite, révocable, et dont la révocation supprime réellement la ligne. | US-8 | |
| B15 | Le même changement d'état de commande reçu deux fois n'entraîne qu'une seule notification. | US-8 | |
| B16 | Les favoris et l'historique sont rattachés au compte, donc retrouvés sur un autre appareil. | US-7, US-10 | |
| B17 | Toute action de l'application ne doit ni ralentir ni dégrader le site au moment où tout le monde achète. | US-1, US-6 | Saisonnalité : les pics de la boutique sont les pics de l'application. |
| B18 | En moins de deux secondes sur 4G, un écran affiche sa structure et sa première donnée utile ; le reste remplit ensuite. | US-1, US-5 | Aucun écran ne bloque son rendu sur une donnée secondaire. |
| B19 | Les données affichées hors connexion portent **leur âge**, et la copie hors connexion est en lecture seule. | US-1 | Une écriture hors connexion est exclue. |
| B20 | L'interface est en français, une seule langue. | toutes | |
| B21 | Les cibles tactiles font au moins 44 points, le contraste est conforme, et le texte suit le réglage du téléphone sans être tronqué. | toutes | Un utilisateur qui grossit la police ne doit pas perdre le bouton d'achat. |
| B22 | Les notifications d'un même type ne sont envoyées qu'après consentement, et une seule fois par changement d'état réel. | US-8 | Redondante avec B15 par construction ; conservée parce que le double comptage est le défaut typique. |
| B23 | Le catalogue n'est **jamais** corrigé, complété ni mis en forme par l'application : la donnée affichée est celle du marchand. | US-1, US-5 | Conséquence de B6, isolée parce que c'est la règle qu'on enfreint en premier. |

---

## 5. Edge cases

| ID | Cas | Règle applicable | Comportement attendu |
|---|---|---|---|
| E1 | Le client achète sur le site **sans compte**, puis s'inscrit dans l'application. | B2, B3, B4 | Si l'adresse correspond, l'historique apparaît. Sinon : « aucune commande trouvée à cette adresse », trois tentatives, puis historique vide formulé en mots. **Cas non résoluble en v1** si le client ne se souvient pas de l'adresse utilisée : un lien « mes commandes sont sur le site » est proposé. |
| E2 | La commande en cours ne peut pas être relue (réseau, source indisponible). | B7, B8 | « Indisponible pour le moment » + réessai. **Jamais** une liste vide, jamais un statut d'avancement par défaut. |
| E3 | Le client grossit fortement la police ou utilise un lecteur d'écran. | B21 | L'information et les actions restent accessibles ; le texte n'est pas tronqué. Vérifiable, donc testé. |
| E4 | Le marchand n'a écrit **aucune** étiquette de rails. | B9 | L'accueil bascule sur les rails automatiques : nouveautés et modifications récentes, puis réassorts et articles réapprovisionnés. Le module d'étiquetage sort du périmètre de la version 2. **Une alerte de stock est une information que personne n'a à écrire.** |
| E5 | Le client supprime son compte. | B14, B16 | Ses données applicatives et son jeton de notification sont supprimés. Les commandes restent chez le marchand — l'application n'en est pas propriétaire. |
| E6 | La fiche produit est ouverte hors connexion. | B19 | La copie locale s'affiche **avec son âge**. Aucune action d'écriture n'est proposée. |
| E7 | Le marchand change un prix après que le client l'a vu. | B6 | La prochaine lecture montre le prix du marchand. L'application ne mémorise pas de prix. |
| E8 | Le client achète dans l'application puis achète une nouvelle fois sur le site. | B2, B16 | Les deux commandes apparaissent, rattachées au même compte. |
| E9 | Le rapprochement de compte réussit puis le client change d'adresse e-mail. | B3 | Le résultat est **définitif** : rien n'est rejoué. Le client qui veut voir un autre historique crée un autre compte. |
| E10 | Une notification arrive alors que le client a révoqué son consentement. | B14 | Aucune notification. Le retrait est effectif, pas différé. |
| E11 | Le panier n'est pas relu au moment de la sortie vers le paiement. | B7, B12 | L'application le dit et propose un réessai ; elle ne procède pas avec un panier qu'elle n'a pas relu. |
| E12 | Le marchand ferme la boutique pendant une maintenance. | B7, B17 | Les écrans disaient l'indisponibilité. L'application ne dégrade pas le site. |

---

## 6. Contraintes

| ID | Contrainte | Nature | Portée |
|---|---|---|---|
| C1 | L'hébergement est plafonné à une cinquantaine d'euros par mois. | Budget | Non négociable. Une proposition qui dépasse revient avec une conception moins chère, pas avec une facture plus haute. |
| C2 | La donnée client est hébergée en région européenne. | Légal | Héberger ailleurs n'est pas un arbitrage technique, c'est une décision CNIL. |
| C3 | **Aucun paiement dans l'application en version 1.** | Produit | Le panier se construit chez nous, la main est tendue au paiement de la boutique. L'application ne voit jamais un numéro de carte. |
| C4 | Le catalogue reste consultable sans compte. | Produit | Le premier écran doit être utile déconnecté. |
| C5 | Interface en français, une seule langue, sans couche d'internationalisation. | Produit | Le deuxième marché déclenche la décision, pas avant. |
| C6 | Fiche produit et accueil utiles en moins de deux secondes sur 4G. | Performance | Voir B18. **Le test de rendu n'est couvert par aucun scénario automatisé** : c'est une vérification manuelle obligatoire à chaque version, sur un vrai téléphone en 4G bridée, avec le chiffre écrit dans la pull request. Une contrainte qu'on ne mesure pas est une contrainte qu'on a perdue. |
| C7 | Un affichage vide n'est jamais un zéro. | Produit | Voir B7. |
| C8 | Cache hors ligne en lecture seule, affichant son âge. | Produit | Toute écriture hors ligne est exclue en version 1. |
| C9 | RGPD de plein droit : consentement explicite et révocable avant toute mesure d'audience et avant toute notification ; **aucune donnée personnelle dans les événements analytiques**. | Légal | Ni e-mail, ni identifiant de commande, ni identifiant client dans un événement. La désinscription supprime réellement la ligne. |
| C10 | Téléphone uniquement, iOS et Android, un seul marché. | Produit | Tablette et version web exclus. Un écran « responsive » livré en version 1 est du travail jeté. |
| C11 | Toute modification livrable sans revue native part par mise à jour à chaud ; toute modification native est une publication revue. | Technique | C'est la contrainte d'architecture la plus structurante : une fonctionnalité qui exige du natif est une sortie planifiée, pas un correctif d'urgence. |
| C12 | Accessibilité non négociable. | Produit | Voir B21, E3. |
| C13 | **Deux entités détiennent des données personnelles** : la boutique et le fournisseur d'identité. L'écran de création de compte les nomme tous les deux avant validation, et le consentement se coche explicitement. | Légal | Pas d'accord tacite. |
| C14 | **La ressource rare n'est pas l'argent, c'est le temps de deux personnes.** Toute fonctionnalité exigeant un travail d'ingestion récurrent est refusée en version 1, quelle que soit sa valeur marchande. | Produit | C'est cette contrainte qui a refusé le paiement, la recommandation algorithmique et la création de contenu. |
| C15 | Le marchand est une source, pas un collaborateur : aucune donnée n'est corrigée par l'application. | Produit | Voir B6, B23. |
| C16 | La saisonnalité de la boutique est aussi celle de l'application. L'application n'est **jamais** sur le chemin critique du paiement du site. | Performance | Voir B17. |

---

## 7. Hors périmètre en version 1

| Écart | Raison |
|---|---|
| Paiement dans l'application | Risque de fraude et conformité disproportionnés pour 2 000 clients, alors que le paiement du marchand fonctionne. Verrouillé par C3. |
| Recommandation algorithmique | Quelques centaines de références et 2 000 clients ne donnent aucune matière exploitable, et surtout personne pour l'exploiter ensuite. Des règles écrites par le marchand suffisent. |
| Création de contenu (avis, photos, fils) | Écart assumé avec l'archétype : cela impose une modération et une file d'attente, c'est-à-dire un service permanent, pour une base de 2 000 clients. Il n'y a personne pour le tenir (C14). |
| Onglet notifications | Écart assumé : une notification ouvre une commande, donc une destination. Un onglet serait un écran vide la plupart du temps, et un cul-de-sac quand il ne l'est pas. |
| Onglet Explorer / flux de découverte | Écart assumé : un cinquième onglet pour un contenu qu'un catalogue de quelques centaines de références ne justifie pas. La découverte est portée par l'accueil. |
| Tablette et version web | Un seul marché, format téléphone (C10). |
| Programme de fidélité ou points | Tant qu'on n'a pas inventorié ce que la boutique propose déjà sur son site. Dupliquer une fonctionnalité existante est du travail jeté. |

---

## 8. Mesure du succès

**Critère principal, à 6 mois : 8 % des sessions de l'application se terminent par une sortie vers le paiement.** C'est le seul tunnel que nous possédons entièrement, de la fiche produit à la sortie. Mesurable, attribuable, non ambigu.

**Critères de garde** — ils ne valent pas succès, mais leur échec compte comme un échec :

| Critère | Seuil | Pourquoi celui-là |
|---|---|---|
| Comptes créés qui ouvrent l'onglet Commandes dans les 30 jours | **25 %** | La preuve que l'historique sert. Sans lui, l'application est un navigateur de plus. |
| Taux de conversion du paiement du site | **ne doit pas baisser** pendant la campagne de lancement | Si l'application cannibalise sans rien ajouter, c'est un échec, même si le critère principal est atteint. |
| Plafond d'hébergement consommé à 6 mois | **90 %** | Auto-vérification : à 20 %, on a soit de la marge pour la version 2, soit une dépense mal calibrée. |

**Règle d'arrêt, écrite maintenant :** si trois mois après la publication moins de 10 % des comptes créés ont ouvert l'onglet Commandes, **on n'ouvre pas de version 2 et on garde le site.** Ce n'est pas un espoir, c'est une décision de séquencement déjà prise.

**Bascule d'ordre des onglets, écrite avant d'avoir les données.** Pendant quatre semaines après la publication, on mesure le nombre de sessions qui **commencent** par une saisie dans le champ de recherche, et le taux de sortie par onglet. Ce seuil est lu chaque semaine dans l'outil d'audit produit, pas estimé. **Si moins de 12 % des sessions commencent par une saisie pendant quatre semaines, Recherche passe derrière Commandes, ou disparaît au profit d'un accès depuis l'accueil.** Le critère est écrit avant d'avoir les chiffres, sinon on ne le respecte pas. Changer la *position* est une décision produit ; changer le *nombre* d'onglets est une décision d'architecture.

---

## 9. Risques

| ID | Risque | Gravité | Ce qu'on en sait |
|---|---|---|---|
| R1 | **Les clients ne créent pas de compte.** Sans compte, l'application n'est qu'un site de plus, avec moins de fonctions. | Le plus élevé | Non mesurable avant la publication. C'est le risque numéro un. |
| R2 | **Le rapprochement compte ↔ client échoue.** Adresse différente, commande en invité, e-mail changé. L'accès est alors refusé — c'est voulu — et le client qui a fait l'effort repart sans rien. | Élevé | Risque de support majeur. Le quatrième cas de E1 est irrécupérable en version 1. |
| R3 | **Un stimulus trop rare pour créer une habitude.** La seule notification prévue est un changement d'état de commande. | Élevé | Si la fréquence d'achat annuelle est de deux fois, on aurait construit une chaîne de notification pour un stimulus trop espacé. |
| R4 | **Sur iOS, la première notification n'arrive pas quand on l'attend.** | Moyen | L'utilisateur doit avoir déjà ouvert l'application, et les premières notifications sont mal présentées par le système. Le délai réel avant la première notification utile est plus long que supposé. |
| R5 | **Le marchand n'écrit aucune étiquette de rails.** | Moyen | Traité par conception (E4), pas par confiance. Le basculement définitif est mesuré à 30 jours. |
| R6 | **Inconnu non mesuré : la fréquence d'achat annuelle moyenne par client.** | Le plus élevé, et non mesuré | Si elle est très basse, l'onglet Commandes est la seule chose qui distingue l'application du site, et il ne se consulte que deux fois par an. **C'est le paramètre qui décide de la valeur de tout le projet, et il n'est pas dans nos chiffres.** |
| R7 | **Les données de test ne sont pas prêtes.** Les scénarios de bout en bout dépendent d'une boutique de démonstration et d'un environnement de recette remplis par un script versionné. | Moyen | C'est cette infrastructure-là, et non le runner, qui demande du temps calendaire. |
| R8 | **Le test de rendu en moins de deux secondes n'est mesuré par aucun automate.** | Moyen | D'où la vérification manuelle obligatoire (C6). Une contrainte qu'on ne mesure pas est une contrainte qu'on a perdue. |

---

## 10. Points à clarifier

| # | Question | Qui peut répondre | Quand |
|---|---|---|---|
| Q1 | Le retour produit se fait-il dans l'application ou sur le site ? Si c'est dans l'application, qui porte la décision ? | Le marchand | Avant la conception |
| Q2 | Le panier survit-il à une fermeture de l'application avant le paiement ? | Le marchand | Avant la conception |
| Q3 | **Le marchand peut-il retrouver, depuis la boutique, les commandes d'invité rattachées à une adresse ?** Si non, quel taux de commandes enregistre-t-il réellement comme client ? | Le marchand | **Avant la conception** — de la réponse dépend l'utilité de l'onglet Commandes, donc R1 et R6 |
| Q4 | Quelle est la fréquence d'achat annuelle moyenne par client ? | Le marchand | **Avant la conception** — c'est R6, et il décide de la valeur du projet |
| Q5 | Le marchand veut-il écrire des étiquettes de rails, et qui le fera dans sa pratique ? | Le marchand | 30 jours après la publication |

---

## Checklist de gate

- [ ] Chaque règle métier porte un identifiant stable et une user story liée.
- [ ] Chaque edge case porte un comportement **attendu**, pas une description.
- [ ] Chaque contrainte est **produit**, pas technique — la technique est dans `conventions.md`.
- [ ] Le document ne contient aucun choix de framework, de base ou de bibliothèque.
- [ ] Le critère de succès est un **ratio mesurable**, pas une intention.
- [ ] Les points à clarifier ont un **qui** et un **quand**.

**Statut** : `draft` → en attente de validation.
