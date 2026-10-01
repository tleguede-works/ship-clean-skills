---
type: contract
status: draft
generated_at: 2026-10-01
derived_from:
  - .forge/prd.md
  - .forge/roadmap.md
  - .forge/conventions.md
  - .forge/architecture.md
---

# Contrat de projet — Onduleur

> **Contrat de migration.** Ce document a été dérivé des décisions déjà prises dans
> `.forge/`, après coup. Il n'a pas été signé par un commanditaire, et ne constitue
> pas un engagement de sa part. Les points marqués « non décidé » sont réellement
> ouverts.

Document rédigé le 2026-10-01 à partir de quatre documents datés du 2026-09-30 :
`prd.md` (version 1), `roadmap.md` (version 1), `conventions.md`,
`architecture.md`. La date de publication visée au premier trimestre 2027 est une
conséquence des réponses du marchand aux questions du § 5, pas un engagement de Forge.

---

## Les quatre raisons pour lesquelles ce document existe

| Bloc | Ce qu'il évite |
|---|---|
| Ce qui sera livré | un périmètre qu'on découvre à la livraison |
| Ce qui ne sera pas livré | une exclusion non dite, découverte à la livraison |
| Ce qui est irréversible | un engagement acheté sans que personne ne l'ait vu |
| Ce que Forge décidera seul | quatre-vingt questions techniques par phase |

---

## 1. Ce qui sera livré

Le périmètre ci-dessous est celui du MVP : quinze tranches, dont neuf fonctionnelles et
six d'obligation transverse. **Les six fondations techniques ne sont pas des
livrables** : ce sont des pièces internes, listées au § 4.

| Slice | Ce que le client aura | Pour qui |
|---|---|---|
| `compte-creation` | La création d'un compte par adresse électronique, avec un écran de confirmation, et le nom des deux entités qui détiennent des données personnelles avant la validation. | Client occasionnel, client fidèle |
| `rapprochement-compte` | Le rattachement du compte à l'historique du marchand, tenté une seule fois à la confirmation, et dont le résultat est définitif. | Client fidèle |
| `echec-historique-narratif` | Une réponse formulée en mots quand aucun historique n'est trouvé — jamais l'apparence d'une panne — avec trois tentatives au maximum et un lien vers le site du marchand. | Client fidèle |
| `suppression-compte` | La suppression du compte, de ses données et de son jeton de notification, sans toucher aux commandes qui restent chez le marchand. | Client |
| `commandes-liste` | La liste des commandes rattachées au compte, avec les articles, leur état, la date de livraison et la date limite de retour — les deux ensemble ou aucune. | Client fidèle |
| `accueil-trois-rails` | Un écran d'accueil qui affiche toujours trois rails de produits, quelles que soient les données écrites par le marchand, et qui est utile en moins de deux secondes sur réseau 4G. | Tous |
| `catalogue-produit` | L'ouverture d'une fiche produit depuis un lien partagé, sans compte et sans réseau, avec l'âge de ce qui est affiché. | Nouveau client, client partageur |
| `recherche` | Une recherche atteignable sans défilement depuis l'accueil, qui s'ouvre sur un contenu plutôt que sur un champ vide. | Tous |
| `panier-sortie-paiement` | Un panier construit dans l'application, cédé au paiement de la boutique pour ce panier précis, sans que l'application ne voie jamais de numéro de carte. | Client |
| `mesure-instrumentation` | Les nombres qui commandent la décision d'arrêt du projet, comptés côté serveur, dont aucun ne contient de donnée personnelle. | Le marchand, et Forge pour la décision |
| `verification-rendu-2s` | Le chronométrage de l'accueil et de la fiche produit sur un téléphone réel en 4G bridée, écrit dans chaque revue de code. | Forge, et le marchand à la revue |
| `verification-accessibilite` | Le parcours des écrans nominaux et des états d'échec par un lecteur d'écran, texte agrandi, sur un téléphone réel, avec ce qui a été corrigé d'écrit. | Forge, et le marchand à la revue |
| `verification-pic-et-plafond` | Une vérification en pic saisonnier et un relevé de la consommation d'hébergement, pour attester les deux critères de garde plutôt que les supposer. Une seule fois, pas à chaque version. | Forge, et le marchand à la revue |
| `mecanisme-renvoi-paiement` | Une réponse écrite sur la faisabilité du renvoi vers le paiement de la boutique pour le panier construit par l'application : soit un mécanisme constaté et testé, soit la preuve écrite qu'il n'existe pas. | Forge, et le marchand pour la réponse |
| `fenetre-et-frontiere-gel` | Une fenêtre d'observation figée par écrit avant la publication, et une frontière écrite sur ce qui peut être corrigé pendant cette fenêtre. | Forge |

**Toute ligne qui ne peut pas se relire sans glossaire est mal écrite.** Un client
non technique ne valide pas un plan ; il valide un résultat.

## 2. Ce qui ne sera pas livré

Le bloc le plus volumineux et le plus souvent omis. **Une exclusion non écrite est une
trahison future** : elle ne se découvre qu'à la livraison, quand il est trop tard
pour en discuter.

| Exclu | Pourquoi | Réexamen |
|---|---|---|
| Le paiement dans l'application | Risque de fraude et de conformité disproportionnés pour 2 000 clients, alors que le paiement du marchand fonctionne. Verrouillé par la contrainte C3. | V3, seulement si le critère principal est atteint et le critère de garde tombe |
| Suivre l'avancement d'une commande en cours | L'écran n'ouvre aucune donnée que la liste des commandes ne montre déjà. Le MVP répond « qu'ai-je commandé », pas « où en est ». | V1, au quatrième trimestre 2027 |
| La profondeur du catalogue : facettes, matrice complète de variantes, produits liés, galerie | Le catalogue n'est pas la valeur du produit, et la ressource rare est le temps de deux personnes. | V1, au quatrième trimestre 2027 |
| Enregistrer un produit en favori | Personne n'a de favori au moment de la publication ; un onglet vide en premier écran est interdit. | V1 — conditionné à la lecture de la bascule des onglets, mesurée sur quatre semaines |
| Enregistrer mes adresses de livraison | Le paiement se fait chez le marchand, qui se souvient déjà de l'adresse. | V1, au quatrième trimestre 2027 |
| Demander un retour depuis l'application | La question de savoir qui porte la décision de retour est sans réponse, et c'est une décision marchand. La date limite de retour reste affichée. | V2 — conditionné à une réponse du marchand et à un porteur nommé |
| Être prévenu d'un changement d'état de commande | La notification exige une partie native de l'application, donc une publication revue, incompatible avec une mise à jour à chaud pendant la fenêtre de mesure. | V2 — conditionné à la règle d'arrêt franchie et à un nombre mesuré de commandes par compte |
| Un onglet Notifications, un onglet Explorer | Un onglet serait vide la plupart du temps ; la découverte est portée par l'accueil. Changer le nombre d'onglets est une décision d'architecture. | V2, sous conditions écrites dans la roadmap |
| Le module qui permet au marchand d'étiqueter les rails d'accueil | Le marchand n'écrira pas d'étiquettes dans sa pratique. Les rails automatiques tiennent la promesse des trois rails sans travail de sa part. | V2, trente jours après la publication |
| La tablette et la version web | Un seul marché, format téléphone. Un écran adaptatif livré en version 1 est du travail jeté. | V3, si la part des sessions sur tablette dépasse un seuil écrit avant publication |
| Un second marché, une autre langue | La ressource rare est le temps de deux personnes ; le deuxième marché déclenche la décision. | non décidé — le seuil de retour est renvoyé à une règle à écrire avant publication, elle n'existe pas dans les documents |
| La recommandation par algoritmo | Quelques centaines de références et 2 000 clients ne donnent aucune matière exploitable, et personne pour l'exploiter ensuite. | V3, et seulement si le catalogue grandit et si quelqu'un peut l'exploiter |
| La création de contenu : avis, photos, fils de discussion | Impose une modération et une file d'attente, c'est-à-dire un service permanent, pour une base de 2 000 clients. | V3, quand l'effectif dépasse deux personnes |
| Un programme de fidélité ou de points | On n'a pas inventorié ce que la boutique propose déjà sur son site. Dupliquer une fonctionnalité existante est du travail jeté. | V3, après inventaire écrit |
| Écrire quelque chose hors ligne | Le cache hors ligne est en lecture seule, et affiche son âge. Toute écriture hors ligne est exclue en version 1. | Jamais en version 1 |
| Un index de recherche ou une base vectorielle tenu par Forge | La recherche s'appuie sur la recherche du marchand. Si elle est jugée insuffisante, la réponse est une décision, pas un ajout. | V1, par décision explicite |
| Un portail de fusion automatique et un parc d'appareils de test | La promotion vers la production est une étape manuelle distincte, et une modification native met plusieurs jours à atteindre les appareils. Quatre scénarios de bout en bout s'exécutent en local, avant l'ouverture de la revue de code. | non décidé — la question d'une équipe de plus de quatre personnes est renvoyée à une décision explicite, non datée |
| Une capacité nouvelle pendant les trois mois qui suivent la publication | La frontière est écrite : corriger ce qui restaure le comportement prévu est permis, ajouter ce qui manque est interdit. | Trois mois après la publication, lecture de la règle d'arrêt |
| La version 2 si la règle d'arrêt n'est pas franchie | Moins de 10 % des comptes créés ouvrent l'onglet Commandes trois mois après la publication : le site est gardé et la version 2 n'est pas ouverte. | Règle écrite avant publication, lue trois mois après |

**Une ligne de la forme « ce qui n'a pas été demandé » est une exclusion déguisée en
place vide.** Ce qui n'est pas écrit ici est implicitement inclus.

## 3. Ce qui est irréversible

**C'est le bloc qui rend la promesse de non-interruption vraie.** Tout ce qui engage
un achat, un abonnement, une licence ou une donnée personnelle fige ici.

Chaque ligne porte un **prix ou une durée**. Un engagement sans prix n'est pas un
engagement annoncé, c'est un engagement subi.

| Engagement | Choix | Prix / durée | Réversible ? |
|---|---|---|---|
| Source d'identité | Supabase Auth, adresse électronique et mot de passe avec confirmation | prix non chiffré dans le projet | NON — la confirmation par courriel est ce qui conditionne l'accès à l'historique |
| Base de données applicative | PostgreSQL managé, région de l'Union européenne | prix non chiffré dans le projet · plafond : une cinquantaine d'euros par mois | OUI — un export complet est rejouable, et le catalogue n'y est pas copié |
| Rapport de crash | Sentry | prix non chiffré dans le projet | NON — suspendu, il faut le remplacer |
| Mesure d'audience | PostHog, hébergé dans l'Union européenne | prix non chiffré dans le projet | NON — suspendu, la mesure d'arrêt du projet disparaît |
| Chaîne de publication | Builds et mises à jour à chaud de l'application | prix non chiffré dans le projet | NON — c'est le seul moyen de livrer une modification sans passer par les magasins |
| Envoi des notifications | Service de notification de l'Expo, appelé par une fonction réveillée par un webhook de la boutique | prix non chiffré dans le projet · à partir de la version 2 | OUI — couper le service suffit |
| Jeu d'icônes | lucide-react-native — le seul achat graphique du projet | prix non chiffré dans le projet | OUI — remplaçable sans toucher un écran |
| Accès au catalogue de la boutique | Accès programmé inclus dans l forfait déjà payé | inclus dans l'abonnement en cours | NON — sans lui, le catalogue n'est plus une porte d'entrée |
| Droit de lecture des niveaux de stock | Interface d'administration du marchand ; le droit n'est pas confirmé sur l'offre payée | prix non chiffré dans le projet | NON — s'il n'est pas accordé, la source du troisième rail d'accueil change |
| Boutique de démonstration et projet de recette | Paliers gratuits des fournisseurs déjà retenus | palier gratuit | OUI |
| Conservation des données de mesure | Tables de mesure et de session dans la base applicative | prix non chiffré dans le projet · durée de conservation : non décidée dans les documents | non décidé — la rétention doit être écrite avant publication, elle ne l'est pas |

> **Trois points ouverts dans `.forge/`** : le droit de lecture des niveaux de stock,
> la durée de conservation des données de mesure, et le mécanisme de renvoi vers le
> paiement de la boutique. Le troisième n'est pas un achat mais il commande le critère
> de succès principal ; la tranche qui le tranche produit soit un mécanisme constaté,
> soit la preuve écrite qu'il n'existe pas. Il est au § 5.

## 4. Ce que Forge décidera seul

Le bloc qui supprime l'essentiel des questions. **Énumérer ce qui est réversible et
gratuit, c'est ce qui rend le silence légitime** — parce qu'on sait qu'il n'a rien
à dire.

| Décision | Pourquoi Forge peut la prendre seule |
|---|---|
| Structure de code, découpage des écrans, nommage des fichiers et des routes | réversible, gratuit — les règles sont écrites dans `conventions.md` |
| Bibliothèque d'implémentation : client réseau, validation des formulaires, gestionnaire d'état | réversible, gratuit |
| Format de stockage des données applicatives et schéma de la base | réversible si le schéma est portable |
| Bibliothèque de tests : tests unitaires, tests de composants, quatre scénarios de bout en bout exécutés en local | réversible, gratuit |
| Outillage de lint et de format | réversible, gratuit |
| Primitives d'interface et application des couleurs | réversible, gratuit — aucune bibliothèque d'interface n'est introduite |
| Ce que l'application mémorise du catalogue : ni prix, ni libellé, ni photographie | réversible, gratuit — le catalogue reste la source du marchand |
| Où vit le panier : sur l'appareil, et non dans la base du projet | réversible, gratuit |
| La façon dont le comptage des sessions est écrit, en un seul endroit | réversible, gratuit |
| L'empreinte des adresses essayées lors du rapprochement du compte, qui n'est pas conservée | réversible, gratuit |
| L'ordre des vagues d'implémentation et le parallélisme entre tranches | réversible, gratuit |

**Un client qui lit cette liste et ne la conteste pas a délégué ces décisions.** Un
silence ici est une délégation, parce que le prix de la corriger est nul.

## 5. Ce qui reviendra au client

Les décisions qui lui appartiennent — et **chacune avec une échéance**. Une décision
sans date est prise par le plus proche, et le plus proche c'est Forge.

| Décision | Options | Échéance | Prix selon l'option |
|---|---|---|---|
| Le retour produit se fait-il dans l'application ou sur le site, et qui porte la décision | Dans l'application, avec un porteur nommé, ou sur le site comme aujourd'hui | Avant la conception | aucun coût direct |
| Le panier survit-il à une fermeture de l'application avant le paiement | Il survit, avec revalidation chez le marchand à la reprise, ou il ne survit pas et la session est perdue | Avant la conception | aucun coût direct |
| Le marchand peut-il retrouver depuis la boutique les commandes d'invité rattachées à une adresse, et quel taux de commandes enregistre-t-il comme client | Oui, ou non — la réponse change la valeur de l'onglet Commandes et l'hypothèse du projet | Avant la conception | aucun coût direct |
| Quelle est la fréquence d'achat annuelle moyenne par client | Un chiffre, ou l'aveu qu'il est inconnu — le PRD le déclare non mesuré et en fait le paramètre décisif | Avant la conception | aucun coût direct |
| Le marchand veut-il écrire des étiquettes de rails, et qui le fera dans sa pratique | Oui, avec une personne nommée, ou non, et l'accueil garde ses rails automatiques | Trente jours après la publication | aucun coût direct |
| Le seuil en dessous duquel la règle d'arrêt n'est pas une décision | Écrire un dénominateur minimum, ou publier sans lui — le PRD ne contient pas ce seuil | Avant la publication ; en son absence, aucune publication | aucun coût direct |
| Quelle ouverture compte pour la règle d'arrêt : celle du jour de la création, ou une ouverture ultérieure | La première, ou la suivante — les deux lectures donnent des verdicts opposés | Avant la publication ; le MVP produit les deux chiffres | aucun coût direct |
| Qui porte le support des comptes sans historique, et qui surveille le taux de conversion du site | Désigner un porteur pour chaque demande, ou les laisser sans porteur | Avant la publication | aucun coût direct |
| Le troisième niveau de repli des rails d'accueil, quand aucune source ne fournit de rail | Choisir une source qui ne demande aucun travail au marchand, ou rouvrir la question au PRD | Avant la tranche d'accueil ; la source retenue provisoirement n'est pas confirmée | prix non chiffré dans le projet |
| La suppression du compte est-elle bien une obligation de première version | La confirmer au PRD, ou la retirer du périmètre | non datée dans les documents | aucun coût direct |
| Le droit de lecture des niveaux de stock est-il accordé sur l'offre payée | Demander le droit, ou changer la source du troisième rail | Avant la tranche d'accueil | prix non chiffré dans le projet |

> **Passé l'échéance sans réponse, Forge applique l'option par défaut** et le signale
> dans le bilan d'écart. Le silence n'est pas une approbation.

---

## Ce que ce contrat ne dit pas

- Il ne décrit pas la stack ligne par ligne. Le client n'a pas à la choisir, et les
  noms de bibliothèques ne l'intéressent pas — le **prix** l'intéresse, et il est au
  § 3.
- Il ne contient pas de règle de code. Ça appartient aux conventions techniques.
- Il n'est pas un rapport d'avancement. Il ne bouge pas d'une phase à l'autre ; seul
  § 3 se remplit, quand un engagement est découvert.
- Il ne chiffre aucun fournisseur, alors que le plafond d'hébergement est une
  contrainte et non un budget connu. Le plafond est écrit ; le montant dépensé ne
  l'est pas.

## Signature

| Élément | Valeur |
|---|---|
| Client | non décidé — aucun commanditaire n'est nommé dans les documents du projet |
| Date | non signé — la date de signature n'est pas décidée |
| Forge | Forge Labs |