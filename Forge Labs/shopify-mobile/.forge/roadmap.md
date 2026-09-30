---
type: roadmap
status: draft
generated_at: 2026-09-30
derived_from: .forge/prd.md
version: 1
---

# Roadmap — Onduleur

> Ce document définit CE QUI sera livré et QUAND.
> Inspiré du PRD (`.forge/prd.md`). Chaque règle métier citée référence son ID source (B*).
>
> La roadmap est vivante — elle évolue avec les retours utilisateurs et les découvertes techniques.

---

## 1. Vision par version

| Version | Thème / Promesse | Critère de succès principal | Cible |
|---|---|---|---|
| **MVP** | « Une publication, cinq chiffres, zéro travail pour le marchand » | Les cinq nombres de la §8 du PRD sont produits sur la fenêtre de trois mois, et la règle d'arrêt est applicable sans débat préalable | T1 2027 |
| **V1** | « Le P1 complet, et la preuve écrite des trois contraintes qu'aucun test automatique ne couvre » | Les vérifications manuelles obligatoires (C6, B21/E3, B17) sont écrites dans des pull requests, et le P1 est livré sans exception | T4 2027 |
| **V2** | « Un canal proactif, parce que la mesure l'aura justifié » | Le canal produit des ouvertures spontanées attribuables ; sinon il est retiré | T1–T2 2028, **conditionnel** |

Les questions que le PRD date « Avant la conception » (Q1, Q2, Q3) commandent la date de publication : elle est une **conséquence de leur réponse**, pas un choix de l'équipe. T1 2027 suppose une réponse fin 2026 ; un trimestre de glissement décale la date d'autant, et rien d'autre.

---

## 2. MVP — Minimum Viable Product

> Le plus petit ensemble qui résout le problème principal **et** qui rend la règle d'arrêt applicable. Ces deux exigences ne sont pas la même, et c'est la seconde qui décide du découpage.

### 2.1 Périmètre

| Élément | IDs du PRD | Justification de l'inclusion |
|---|---|---|
| **US-4** Créer un compte et le rattacher à mon historique | B2, B3, B4, B5, C13, E1, E9 | C'est le **dénominateur** de toutes les mesures de la §8 : sans compte créé, il n'y a ni les « 10 % des comptes créés » de la règle d'arrêt, ni les « 25 % en 30 jours » du critère de garde. B3 rend le rapprochement unique et définitif : la fenêtre où il est observable ne s'ouvrira **qu'une fois**, à la publication. |
| **US-2** Retrouver ce que j'ai déjà acheté | B2, B4, B7, B13 | C'est le **numérateur** de la règle d'arrêt. Aucun écran existant ne rend cette liste : le lien d'e-mail est précisément le problème décrit au PRD §1.1, donc il n'y a pas de substitut. |
| **US-1** au minimum : trois rails, listes de produits, fiche produit, lien profond, lecture hors ligne avec son âge | B1, B8, B19, E6, C4, C8 | B1 et C4 interdisent toute rétention : l'application doit être utile déconnectée, donc le catalogue y est. Il est au **minimum**, parce que la bascule d'onglets compare Recherche à Commandes : si le catalogue n'offrait aucun autre chemin vers un produit que la recherche, ce seuil mesurerait notre propre appauvrissement et non l'habitude du client. |
| **Les trois rails automatiques de l'accueil** | B9, E4, R5 | B9 promet trois rails quelles que soient les données éditoriales, et E4 décide que l'étiquetage sort du périmètre. L'accueil est donc alimenté par une source qui se **lit** et ne s'écrit pas — ce qui le fait passer sous C14, qui refuse tout travail d'ingestion récurrent. **C'est du travail de v1**, chiffré en §6. |
| **US-5** Rechercher un produit | B10, B11 | Elle reste au MVP pour une raison qui n'est pas l'usage : elle est le **groupe de comparaison** de la bascule écrite d'avance. Une version sans Recherche n'a pas de contre-mesure, et le critère des 12 % devient inapplicable. |
| **US-6** Préparer un achat | B12, C3, E11 | Elle porte le seul critère principal : 8 % des sessions terminées par une sortie vers le paiement. C'est un tunnel que nous possédons entièrement, de la fiche produit à la sortie : sans panier construit chez nous, on mesurerait un clic vers le site, qui n'est ni mesurable de la même façon ni attribuable à l'application. |
| **E5** La suppression du compte | C9, B14 | E5 n'a ni user story ni priorité dans le PRD, mais C9 est de plein droit et E5 donne le comportement attendu. **On ne publie pas une application qui ne sait pas effacer un compte.** Décision de roadmap, signalée comme telle en §2.5. |
| Le récit « historique vide » et le recours écrit | E1, B5, R2, B7 | L'état « aucune commande trouvée à cette adresse » doit être permanent, formulé en mots, et ne pas appeler de réessai au-delà de trois tentatives. Il ne doit jamais se présenter comme une panne, et il doit offrir le lien « mes commandes sont sur le site » : le client repart avec une réponse, pas avec une file d'attente. |
| **Instrumentation de la §8** : cinq entonnoirs, deux compteurs horodatés | C9, B3, R1, R2, R6 | L'outil d'audit doit être branché **avant** la publication, parce qu'un entonnoir posé après coup se définit après coup. C9 interdit toute donnée personnelle dans un événement, donc la jointure « compte créé / Commandes ouverte » **ne peut pas** se faire dans l'outil d'audit : elle se compte côté serveur. Voir §2.5, question Q-C. |
| Les trois vérifications manuelles obligatoires et la mesure du plafond d'hébergement | C6, R8, B21, E3, B17, C16, E12, C1 | Ce ne sont pas des fonctionnalités, ce sont des slices. C6 exige le chiffre des deux secondes écrit dans la pull request, E3 un lecteur d'écran sur un téléphone réel, B17 un passage en pic saisonnier, la §8 le plafond consommé à six mois. **Aucune n'a de scénario automatisé** : une contrainte qu'on ne mesure pas est une contrainte qu'on a perdue. |

### 2.2 Ce qui n'est PAS dans le MVP

| Élément | Raison de l'exclusion | Ce que le produit perd | Version cible |
|---|---|---|---|
| **US-3** Suivre une commande en cours | B13 impose qu'une limite de retour s'affiche avec la date qui la fonde ; cette règle est tenue dès le MVP dans la liste (US-2). L'écran de suivi n'ouvre aucune donnée que la liste ne montre déjà. | La réponse à « où en est ma commande » — le seul besoin que l'e-mail et le site couvrent déjà. **Le MVP répond « qu'ai-je commandé », pas « où en est ».** C'est aussi un biais **favorable à l'échec** : moins de raisons d'ouvrir Commandes, donc une règle d'arrêt plus difficile à franchir, donc un franchissement plus probant. | V1 |
| **US-1** en profondeur : facettes, matrice de variantes complète, produits liés, galerie | Le catalogue n'est pas la valeur (PRD §1.2) et C14 refuse tout travail récurrent. Le minimum conservé suffit à garder la bascule des 12 % non biaisée. | Le client occasionnel obtient une navigation moins bonne que celle du site gratuit, et R1 s'aggrave : une raison de moins d'installer l'application. | V1 |
| **US-7** Enregistrer un produit (P2) | B16 attache le favori au compte, donc à US-4. À la publication, personne n'a de favori : l'onglet serait vide en premier écran, ce que B10 interdit en principe. | Le client n'a **aucune raison de retour qu'il ait lui-même fabriquée**. C'est la seule source de ré-engagement volontaire du PRD, et elle manque : le MVP repose entièrement sur la fréquence d'achat, c'est-à-dire sur R6. | V1 |
| **US-8** Être prévenu d'un changement d'état (P2) | Le push exige du natif, donc C11 en fait une **publication revue**, pas une mise à jour à chaud. Le publier pendant la fenêtre de mesure changerait le produit sous le compteur. R3 doute déjà de sa valeur. | Le MVP perd la seule proactivité prévue : le client doit ouvrir l'application pour savoir. Le PRD lui-même doute que ce canal vaille d'être construit (R3, R4). | V2 |
| **US-10** Gérer mes adresses (P2) | C3 envoie le paiement chez le marchand, qui se souvient déjà de l'adresse : l'application n'est pas l'endroit où mémoriser cela. | Presque rien : le client ressaisit son adresse chez le marchand, exactement comme aujourd'hui. | V1 |
| **US-9** Demander un retour (P3) | Q1 — qui porte la décision de retour — n'a pas de réponse, et c'est une décision marchand. Le MVP affiche déjà la date limite (B13) ; il ne fait que la demande. | Le client passe par le site ou l'e-mail pour demander un retour. La date qui la fonde est déjà dans l'application, donc il n'y a pas d'angle mort. | V2 |
| Module d'étiquetage des rails (E4) | E4 le sort explicitement du périmètre, B6 interdit que le marchand devienne un collaborateur, et Q5 est daté à trente jours après publication. | L'accueil montre des rails que le marchand n'a pas choisis : un taux de clic qui ne reflète pas son catalogue, et un accueil qu'il ne reconnaîtrait pas. | V2 |
| Paiement, recommandation algorithmique, création de contenu, onglets Explorer et Notifications, tablette et web, programme de fidélité | PRD §7 les exclut de la version 1 ; C3 verrouille le paiement, C10 le format, C14 refuse ce qui demande une ingestion récurrent. | Le MVP perd la profondeur du catalogue, la découverte, la fidélité et le web. **Il garde l'essentiel : l'historique et le tunnel vers le paiement.** | V2 / V3+ |

### 2.3 Risques spécifiques au MVP

| Risque | Probabilité | Impact | Mitigation |
|---|---|---|---|
| **R1** — les clients ne créent pas de compte, et le dénominateur de la règle d'arrêt reste trop petit pour décider quoi que ce soit | HIGH | Le plus élevé | La règle d'arrêt n'a pas de dénominateur minimum dans le PRD (§2.5, Q-A). Le MVP n'invente pas ce seuil, il l'expose : **aucune publication tant qu'il n'est pas écrit.** Le PRD ne contient pas non plus de plan d'acquisition, alors qu'il est la seule variable qui fixe ce dénominateur. |
| La règle d'arrêt peut être franchie par la curiosité : un compte créé, un onglet ouvert le jour même, jamais revenu — le test passe alors que le produit a échoué | HIGH | Le test ne prouve rien | Le MVP produit **l'ouverture à 24 h et l'ouverture à 7 j séparément**. La règle écrite en avance ne dit pas laquelle lire ; c'est un trou du PRD (§2.5, Q-B). C'est exactement la faute que ce dossier a déjà commise : **une preuve qui ne prouve pas.** |
| **R2** — un taux de correspondances nul génère un volume de support que personne n'a prévu, et dont aucun porteur n'est désigné | HIGH | HIGH | B6 dit que le marchand est une source, pas un collaborateur — et la §8 lui demande déjà de surveiller son taux de conversion. Le MVP rend l'échec **visible et compté** plutôt que subi (E1, R2), et le porteur du support reste à désigner (§2.5, Q-D). |
| Le mécanisme de renvoi vers le paiement « pour ce panier précis » (B12) n'est posé nulle part, et Q2 est sans réponse | MEDIUM | Le critère principal devient inatteignable | Le PRD pose l'exigence sans la poser comme question. Tant que ce mécanisme et Q2 ne sont pas tranchés avant la conception, US-6 est le seul slice du MVP dont la faisabilité repose sur une hypothèse non écrite. |
| **R8 / C6** — la contrainte des deux secondes n'est couverte par aucun test | CERTAIN | La contrainte se perd au premier écran lent | La vérification manuelle est une slice du MVP, avec le chiffre écrit dans chaque pull request, comme C6 l'exige. |
| **B17 / C16 / E12** — pic saisonnier : l'application dégrade le site au moment où tout le monde achète | MEDIUM | Le critère de garde de la §8 tombe | Toutes les lectures catalogue passent par la source du marchand et la base applicative n'est pas sur le chemin de lecture. À vérifier une fois en pic, pas en développement. |
| Le gel de périmètre n'est pas tenu — une mise à jour à chaud « évidente » modifie le produit sous le compteur | MEDIUM | La mesure est invalidée | Frontière **écrite** : toute correction qui **restaure** le comportement prévu est permise, toute capacité nouvelle est interdite jusqu'à la lecture de la règle d'arrêt. La décision n'est pas laissée au jugement de celui qui code. |

### 2.4 Le contrat de mesure du MVP

> *Section ajoutée : le gabarit n'a pas d'endroit où dire ce que le MVP doit rendre mesurable, et c'est la moitié de la décision de découpage. **Un MVP qui ne peut pas trancher la règle d'arrêt ne teste rien.***

| Nombre à produire | Décision qu'il commande | Ce que le MVP doit contenir pour qu'il existe |
|---|---|---|
| Comptes créés — le dénominateur | Règle d'arrêt §8, critère de garde 25 % / 30 j | US-4 avec confirmation par e-mail (B2) et un compteur sans donnée personnelle (C9) |
| Comptes ayant ouvert Commandes, à 24 h, 7 j, 30 j et 90 j | Règle d'arrêt (10 % à 3 mois) et critère de garde (25 % à 30 j) | US-2, et un compteur horodaté qui **sépare la curiosité de l'usage** |
| Taux de correspondances réussies, définitivement | Q3 et R2 : le marchand sait-il retrouver ses commandes d'invité ? | US-4 avec un rapprochement unique et définitif (B3), et la ligne « correspondance échouée » conservée après l'échec (B5) |
| Commandes par compte rapproché, sur la fenêtre | Q4 et R6 : la fréquence d'achat — sur la seule population qui compte | US-2 et la fenêtre de publication |
| Sessions terminées par une sortie vers le paiement, en % | Critère principal, 8 % | US-1 au minimum, US-6, et la définition de « session » écrite avant publication |
| Sessions commençant par une saisie, sur quatre semaines | Bascule d'ordre des onglets, 12 % | US-1 avec rails et listes, US-5, et le taux de sortie par onglet |

**Ces deux nombres — correspondances réussies, Commandes ouvertes — sont choisis pour que les deux réponses attendues deviennent un diagnostic et non une attente.**

| | Commandes ouvertes bas | Commandes ouvertes élevé |
|---|---|---|
| **Correspondances réussies bas** | Ce n'est pas la fréquence qui manque, c'est la donnée du marchand (Q3) | L'historique n'est pas là pour être trouvé (Q3, R2) |
| **Correspondances réussies élevé** | L'historique est là et ne sert à rien, parce qu'il n'y a rien de nouveau à venir (Q4) | L'hypothèse du PRD tient |

C'est aussi pourquoi **le MVP ne scopingue pas en attendant Q3 et Q4.** Leurs réponses portent sur la moyenne de **tous** les clients, alors que la seule population qui ouvrira l'onglet Commandes est celle des comptes rapprochés — et cette population n'existe qu'après la publication, une seule fois, à cause de B3. Attendre coûte un délai sur la mauvaise population **et** une fenêtre de publication pendant laquelle la population de réussites est consommée.

**Ce que vaut le MVP dans le cas défavorable.** Si les réponses à Q3 et Q4 sont mauvaises — le marchand ne retrouve pas ses commandes d'invité, et un client achète une fois par an — l'application n'a alors **aucune valeur propre** : c'est une boutique mobile moins bonne que le site gratuit, et le PRD le dit lui-même (« si l'application n'améliore pas la fréquence d'ouverture, le site gagne »). Ce qu'elle produit, c'est une **décision**, déjà écrite avant d'avoir les chiffres, donc non discutable après. Et elle coûte quinze slices au lieu de vingt-trois.

La seule garantie que le MVP doive tenir pour être juste dans les deux cas est **ne jamais mentir**. D'où trois décisions, pas trois fonctionnalités : l'état « aucune commande trouvée à cette adresse » est permanent et formulé en mots (B5, E1) ; il ne se présente jamais comme une panne et n'appelle pas de réessai au-delà de trois tentatives (B7) ; il offre le lien « mes commandes sont sur le site » (E1). **L'application rend la main au site, qui est gratuit et qui fonctionne.**

### 2.5 Questions que cette roadmap pose au PRD

> *Section ajoutée : le PRD a des trous que le découpage ne peut pas combler sans le réécrire. Ils sont posés ici et **laissés au PRD** — une roadmap ne réécrit pas son PRD.*

| # | Question | Pourquoi elle bloque |
|---|---|---|
| **Q-A** | La règle d'arrêt a-t-elle un dénominateur minimum en dessous duquel elle n'est pas une décision ? | Sans lui, la règle se tranche sur cinq personnes, et R1 devient un coup de dés |
| **Q-B** | L'ouverture comptée par la règle d'arrêt est-elle celle du jour de la création, ou une ouverture ultérieure ? | Le PRD ne le dit pas, et les deux lectures donnent des verdicts opposés. Le MVP produit les deux chiffres ; c'est la règle, pas le MVP, qui doit dire lequel compte |
| **Q-C** | Où se fait la jointure « compte créé / Commandes ouverte », si C9 interdit tout identifiant de personne dans un événement ? | L'outil d'audit fait ce lien par un identifiant pseudo-aléatoire, qui reste un identifiant de personne. La seule lecture conforme est un comptage côté serveur, dans la base applicative — qui contient déjà quatre choses énumérées et en aurait alors cinq |
| **Q-D** | Quelles sont les deux demandes ponctuelles au marchand — surveiller son taux de conversion (critère de garde §8) et répondre au support des comptes sans historique (R2) — et sont-elles compatibles avec B6 ? | Le seul critère qui protège de la cannibalisation n'est pas mesurable de notre côté, et R2 prévoit un support majeur dont personne n'est le porteur |
| **Q-E** | E5 (suppression du compte) est-il bien P1 ? | E5 a un comportement attendu mais ni user story ni priorité. Cette roadmap le met dans le MVP pour cause de C9, et **le signale plutôt que de le décider** |
| **Q-F** | B9 promet trois niveaux de repli, E4 n'en nomme que deux. Le troisième doit être non vide **sans compte et sans travail marchand** | La contrainte sur la réponse est fixée ici ; la réponse appartient au PRD |

---

## 3. V1 — Première version complète

### 3.1 Ajouts par rapport au MVP

| Élément | IDs du PRD | Justification |
|---|---|---|
| **US-3** Suivre une commande en cours | B13, B7, E2 | Le MVP prouve qu'on **vient** ; il ne prouve pas qu'on **reste**. Entre deux commandes, la seule raison d'ouvrir l'application est une commande en mouvement — c'est exactement le manque que le MVP s'est permis. Elle sort de la fenêtre de mesure avant d'être ajoutée : la règle d'arrêt se lit sur un produit stable. |
| **US-1** en profondeur : facettes, matrice de variantes complète, produits liés | B6, B23, B7 | La profondeur doit venir de la source et jamais de nous, parce que B23 interdit de corriger le catalogue. C'est aussi ce qui retire à l'application l'argument « moins bonne que le site », qui pèse sur R1. |
| **US-7** Enregistrer un produit | B16, B2, B10 | Seule raison de retour que le client fabrique lui-même, donc la seule qui ne dépende pas de R6. **Conditionnée à la lecture de la bascule à quatre semaines** : sinon on crée un onglet vide en premier écran, ce que B10 interdit. |
| **US-10** Gérer mes adresses | B2, B16, C3 | Une fois le client identifié, l'adresse cesse d'être ressaisie chez le marchand. C3 fait que l'application sert de moins en moins de mémoire au client — donc celle-ci doit être **explicitement demandée**, pas héritée. |
| Les quatre vérifications manuelles, **closes** | C6, R8, B21, E3, B17, C16, E12, C1 | Le MVP livre l'**instrumentation** ; la V1 livre la **preuve**. C6 exige le chiffre dans la pull request, E3 un lecteur d'écran sur un téléphone réel, B17 un passage en pic, la §8 le plafond d'hébergement consommé à six mois. **Aucune n'a de scénario automatisé** : sans elles, la V1 est livrée sans savoir si elle respecte ses propres contraintes. |

### 3.2 Ce qui est repoussé en V2+

| Élément | Raison | Risque |
|---|---|---|
| **US-8** (notification) | Le push est natif, donc C11 en fait une publication revue : incompatible avec le gel de la fenêtre de mesure | Le client n'est pas prévenu ; R3 doute que le stimulus soit assez espacé pour justifier un canal |
| **US-9** (retour) | Q1 n'a pas de réponse, et c'est une décision marchand | Le retour se fait ailleurs, comme aujourd'hui |
| Étiquetage des rails (E4) | B6 et Q5 : le marchand n'écrira pas d'étiquettes dans sa pratique | Des rails « justes mais pas les siens », donc un accueil que le marchand ne reconnaîtrait pas |
| Onglet Notifications, onglet Explorer | PRD §7 : un onglet serait vide la plupart du temps ; et la §8 rappelle que changer le **nombre** d'onglets est une décision d'architecture, pas de produit | Pas d'emplacement disponible, et rien à y mettre |

### 3.3 Risques spécifiques à la V1

| Risque | Probabilité | Impact | Mitigation |
|---|---|---|---|
| La V1 arrive après la fenêtre : la règle d'arrêt a déjà tranché, et il est possible qu'elle ait tranché sur un produit amputé de US-3 | MEDIUM | Le projet s'arrête à tort | Le seul contre-correctif est le taux de correspondances réussies : un taux élevé avec une ouverture basse dit que le produit est bon et le rendez-vous trop espacé. **Sans lui, un échec est inexplicable.** D'où sa place au MVP. |
| US-7 crée un onglet vide si la bascule n'a pas été lue | MEDIUM | Un onglet vide en premier écran, interdit par B10 | US-7 est conditionné à la lecture de la bascule à quatre semaines |
| Les vérifications manuelles demandent du temps qu'un planning ne montre pas | HIGH | Une contrainte qu'on ne mesure pas est une contrainte qu'on a perdue (C6) | Elles sont dans le critère de succès de la version (§1) et dans les pull requests, pas dans une boîte « plus tard » |
| C11 : la première version contenant du natif ne peut pas être une mise à jour à chaud | CERTAIN | Le gel et la publication ne se mélangent pas | V1 n'en contient pas. US-8 en contient : c'est précisément ce qui la repousse en V2 |

### 3.4 Dépendances inter-versions

| La V1 dépend de | Nature | Critique ? |
|---|---|---|
| La lecture de la règle d'arrêt et de la bascule à quatre semaines (PRD §8) | produit | **oui** — sans elle, US-7 est un onglet vide et la V1 n'a pas son ordre |
| Le gel du périmètre pendant la fenêtre de trois mois | produit | **oui** |
| Un mécanisme de panier établi (B12) | produit / technique | **oui** |
| La publication de la V1 elle-même, sans natif (C11) | technique | non |

---

## 4. V2 et au-delà

### 4.1 Backlog V2

> *Colonne ajoutée : « quand on aura le temps » n'est pas une condition. Chaque élément porte **le fait qui le fait revenir**.*

| Élément | Priorité PRD | Raison d'être en V2 | **Condition de retour — le fait qui la déclenche** |
|---|---|---|---|
| **US-8** Être prévenu d'un changement d'état | P2 | Le seul stimulus proactif possible, et il est natif : il ne peut pas entrer pendant la fenêtre de mesure | La règle d'arrêt franchie **ET** un nombre mesuré de commandes par compte rapproché sur la fenêtre qui justifie une chaîne de notification — c'est-à-dire **R3 mesuré, pas R3 supposé** |
| **US-9** Demander un retour | P3 | B13 impose déjà la date ; seule la demande manque | Q1 répondue par le marchand **ET** un porteur de la décision de retour nommé |
| Module d'étiquetage des rails (E4) | — | Le marchand n'écrira pas d'étiquettes : les rails automatiques sont ce qui tient B9 sans travail (C14) | Q5 a une réponse qui **nomme une personne** (le PRD date Q5 à trente jours) **ET** la mesure de R5 à trente jours montre que les rails automatiques portent moins de clics que les deux autres entrées vers un produit |
| Onglet Notifications | — | PRD §7 : une notification ouvre une commande, donc une destination ; un onglet serait vide la plupart du temps | L'onglet Recherche a été supprimé au profit d'un accès depuis l'accueil — la bascule libère alors un emplacement — **ET** les ouvertures spontanées attribuées au push dépassent un seuil écrit avant la publication |
| Onglet Explorer | — | PRD §7 : un cinquième onglet pour un catalogue de quelques centaines de références | La recherche échoue plus souvent que les rails : recherches sans résultat ou sans ouverture de fiche au-delà d'un seuil écrit avant la publication |

### 4.2 Idées pour le futur (V3+)

- **Paiement dans l'application** (C3) — revient si le critère principal est franchi **et** que le critère de garde tombe : le site perd en conversion et que l'application n'est qu'un trafic. *Un paiement refusé en v1 pour un risque de fraude disproportionné ne se redécide pas sur une opinion, il se redécide sur un chiffre.*
- **Recommandation algorithmique** — revient quand le catalogue dépasse quelques centaines de références **et** qu'à taille de catalogue constante, le taux de clic des rails automatiques passe sous celui des autres entrées. C14 reste le vrai frein : il faut quelqu'un pour l'exploiter ensuite, et personne ne l'est.
- **Création de contenu** (avis, photos, fils) — revient quand l'effectif passe au-delà de deux personnes et qu'une personne peut tenir une modération sans être prise ailleurs. Le PRD l'a refusée **pour cette raison**, pas pour la quantité.
- **Programme de fidélité ou de points** — revient quand un inventaire écrit de ce que la boutique propose déjà sur son site existe. Tant qu'il n'existe pas, le doublon est du travail jeté.
- **Tablette et version web** (C10) — revient quand la part des sessions sur tablette, **mesurée pendant la fenêtre**, dépasse un seuil écrit avant la publication. C'est le seul endroit où cette donnée sera gratuite : la fenêtre de mesure la produit.
- **Deuxième marché, autre langue** (C5) — même règle : le seuil se fixe avant d'avoir les chiffres, sinon on ne le respecte pas.

---

## 5. Compromis assumés

| Compromis | Ce qu'on perd | Ce qu'on gagne | Risque à long terme |
|---|---|---|---|
| **Retirer US-3 du MVP** | La réponse à « où en est ma commande », et la seule raison d'ouvrir l'application entre deux commandes | Un MVP de 15 slices au lieu de 23, et un test d'arrêt **plus difficile** à franchir : le franchir signifiera davantage | Tuer un produit viable en l'ayant mesuré avec une version amputée. Le contre-correctif n'est pas de rouvrir US-3 : c'est le taux de correspondances réussies, qui distingue « l'historique ne sert pas » de « il n'y en a pas » |
| **Ne pas attendre Q3 ni Q4 avant de concevoir** (§2.4) | Le confort d'un délai, et le droit de dire que l'on avait prévu | Un diagnostic sur la seule population qui ouvrira Commandes, une publication plus tôt, et un coût de déception plus faible : 15 slices contre 23 | Si Q4 vaut 1,5 achat par an, le produit n'a pas de valeur propre et la seule sortie est la règle d'arrêt. **Ce risque était certain ; il est maintenant mesuré** |
| **Ne livrer que le minimum du catalogue** | Un parcours de découverte moins bon que celui du site gratuit | Le seuil des 12 % reste interprétable : il mesure l'habitude du client, pas notre appauvrissement | R1 s'aggrave — moins de raisons d'installer une application qui fait moins que le site. Ce risque n'a pas d'autre contre-mesure que R1 lui-même |
| **Geler le périmètre trois mois après la publication** | La capacité à livrer ce qui manque à l'évidence pendant la fenêtre | Un instrument de mesure qui n'a pas bougé : une seule version, cinq chiffres, une décision | Un défaut qui fausse la mesure ne sera pas corrigé. La frontière écrite (§2.3) permet de corriger ce qui casse, et interdit seulement d'ajouter ce qui manque |
| **Mettre les rails automatiques dans le MVP** (B9, E4) | Deux à trois slices qui ne servent personne en tant que telles : personne ne les a demandées | B9 tenu sans une seule demande du marchand — l'application est juste **avant** toute intervention de sa part, ce qu'E4 exige — et l'ensemble tient sous C14, parce que les rails se lisent et ne s'écrivent pas | Les rails sont « justes mais pas les siens » : un taux de clic qui ne reflète pas son catalogue. Le retour est conditionné à Q5 |
| **Retirer US-7 et US-10 du MVP** | La commodité de ne pas ressaisir une adresse, et la seule raison de retour fabriquée par le client | Le MVP tient dans le gel de trois mois, et sa perte est mesurable plutôt que supposée | US-7 est précisément ce qui répond à R6. Le repousser signifie que, si Q4 est mauvais, **la V1 n'apporte rien de neuf à la raison de revenir**. C'est le compromis le plus discutable du dossier, et il est assumé |

---

## 6. Effort relatif par version

| Version | Slices estimées | Taille relative | Facteurs de risque |
|---|---|---|---|
| **Fondations** | 5 — identité et session sécurisée, chaîne de publication (ce qui part par mise à jour à chaud, ce qui exige une publication revue, C11), boutique de démonstration et projet de recette (R7), outillage de test, revue sur appareil physique avec le chiffre écrit | M | R7 : l'infrastructure de données de test est du **temps calendaire**, pas du code. Bloque tout. |
| **MVP** | 15, dont 9 fonctionnelles et 6 d'obligation transverse | XL | R1, R6, C9 (la jointure des compteurs), Q-B (le dénominateur), faisabilité de B12 |
| **V1** | 27 — le MVP plus US-3, la profondeur du catalogue, US-7, US-10, et la clôture des quatre vérifications manuelles | XL (1,80 × MVP) | C11 si quoi que ce soit de natif s'y glisse ; B21/E3 sur appareil réel, qui n'est pas automatisable |
| **V2** | 13 — US-8, US-9, étiquetage des rails, onglets Notifications et Explorer | XL (0,87 × MVP) | C11 : US-8 est du natif, donc une publication revue, jamais une mise à jour à chaud. Et chaque élément est conditionnel : sans la règle d'arrêt franchie, V2 vaut zéro |

*Les tailles sont relatives au projet, pas absolues. S = 1-3 slices simples, M = 4-7 slices, L = 8-12 slices, XL = 13+ slices ou slices complexes.*

**Comparaison directe, dans la même unité : MVP = 1,00 · V1 = 1,80 · V2 = 0,87.** Le P1 complet du PRD représente **23 slices, soit 1,53 × le MVP** : le MVP n'est donc pas le P1, il en est **65 %**.

Deux lectures en découlent. Le MVP est **XL en soi**, et c'est le signal utile : c'est la seule version qu'on ne pourra pas faire glisser, donc c'est celle qu'il faut geler dès la publication. Et une version plus petite que le P1 ne l'est pas par la priorité affichée des user stories, mais par le volume : ce sont US-3 et la profondeur du catalogue qui sortent, et ils sortent **parce qu'aucun des cinq chiffres de la §8 n'en dépend**.

---

## 7. Dépendances externes

| Dépendance | Impacte quelle version | Statut | Risque si indisponible |
|---|---|---|---|
| L'accès programmé au catalogue Shopify | MVP, V1 | disponible — inclus dans le forfait déjà payé (PRD §1.1) | Le catalogue n'est plus une porte d'entrée : B1 et C4 tombent et il ne reste que l'historique |
| Un mécanisme de panier qui renvoie vers le paiement de la boutique « pour ce panier précis » (B12) | MVP | **inconnu** — le PRD pose l'exigence sans la poser comme question | Le critère principal de la §8 devient inatteignable, et US-6 devient le seul slice à hypothèse non écrite |
| Q3 et Q4 — réponses du marchand | MVP | **en attente** | Le MVP n'en dépend pas pour être juste (§2.4) ; il n'en dépend que pour être **prévu**, et le diagnostic post-publication n'est possible que si les seuils sont écrits avant |
| Q2 — survie du panier avant paiement | MVP | **en attente** | Elle touche US-6, donc le MVP lui-même |
| La boutique de démonstration et l'environnement de recette (R7) | MVP | à créer | Aucun scénario de bout en bout ne tourne ; l'effort est **calendaire**, pas technique |
| Le taux de conversion du paiement du site, chez le marchand | MVP — critère de garde §8 | à demander | Le seul critère qui protège de la cannibalisation n'est pas mesurable de notre côté, et il dépend de quelqu'un que B6 décrit comme n'étant pas un collaborateur |
| iOS : la première notification n'arrive pas quand on l'attend (R4) | V2 | connu, non contournable | US-8 ne verrait sa valeur que plus tard que supposé, ce qui, **le long de R3**, le rend encore moins probable |

---

## Checklist de gate

- [ ] Chaque version a un critère de succès **mesurable**, pas une intention.
- [ ] Chaque élément repoussé porte une **condition de retour** — un fait, pas une date.
- [ ] Chaque functionality est rattachée à des **IDs du PRD** (`B*`, `C*`, `E*`, `US-*`).
- [ ] Les exclusions listent **ce que le produit perd**, pas seulement pourquoi.
- [ ] Les risques par version ont une mitigation, ou sont nommés comme non mitigables.
- [ ] Les questions que la roadmap pose au PRD sont **laissées au PRD**, pas tranchées ici.
- [ ] L'effort est **relatif** et comparable d'une version à l'autre.

**Statut** : `draft` → en attente de validation.
