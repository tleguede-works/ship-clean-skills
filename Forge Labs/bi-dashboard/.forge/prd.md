---
type: prd
status: approved
generated_at: 2026-09-30
version: 1
---

# Product Requirements Document — Amberline

> Ce document décrit CE QUE le produit fait, POUR QUI, et POURQUOI.
> Il ne décrit PAS comment il sera implémenté (technologie, architecture, design visuel).
>
> Toute règle métier, edge case et contrainte porte un identifiant stable (B*, E*, C*)
> qui servira de colonne vertébrale à toute la traçabilité du projet.

---

## 1. Résumé exécutif

### 1.1 Problème

Trois équipes surveillent les mêmes chiffres avec des définitions différentes, et personne n'a jamais écrit ces définitions. Quand un chiffre est contesté — au comité de direction, le plus souvent — il n'y a rien à montrer : on le recalcule à la main, on aboutit à deux versions, et la direction tranche à l'oral en séance. Le tableur partagé, avec un onglet par personne, est aujourd'hui le seul endroit où un chiffre se trouve.

### 1.2 Solution

Amberline donne à chaque chiffre d'entreprise une définition écrite, un propriétaire nommé, une date de calcul, et une seule valeur officielle. À partir de cette base, chacun compose la vue qu'il lui faut et la partage — sans SQL, sans installation, sans que deux personnes puisse regarder honnêtement deux chiffres différents.

### 1.3 Utilisateurs cibles

| Persona | Rôle | Contexte | Besoin principal | Fréquence |
|---|---|---|---|---|
| DG / comité | Porteur du chiffre devant la direction | Réunion mensuelle, une salle, un écran projeté | Une valeur unique, datée, dont il peut répondre de la provenance | 1×/mois, en séance |
| Manager d'équipe | Commercial, production, support | Bureau, début de journée | Savoir si un indicateur est hors cible, sans rouvrir un tableur | Quotidienne |
| Contrôleur de gestion | Tenue des définitions | Bureau, travail fin | Écrire, versionner et faire signer les définitions | Hebdomadaire |
| Analyste | Exploration et préparation de comité | Bureau | Explorer vite, et publier seulement ce qui est signé | 2 à 3×/semaine |
| Lecteur | Support, encadrement, équipes | Poste de travail | Consulter ce à quoi il a droit, savoir à quelle date | Hebdomadaire |

### 1.4 Différenciation

Metabase et Power BI sont déjà présents et déjà payés ; personne n'y construit rien, et personne n'ose. Ils rendent un visuel constructions, pas un chiffre opposable. Amberline ne rend pas la construction plus facile que Metabase : il rend **le chiffre contestable**. La provenance affichée ne vaut que si la définition qui la porte est signée, datée et attribuée — c'est ce qu'aucun des deux outils existants ne propose aujourd'hui de façon fiable.

---

## 2. Utilisateurs et personas

| Persona | Rôle | Contexte | Niveau technique | Besoin principal | Fréquence d'usage |
|---|---|---|---|---|---|
| Directeur général | Sponsor | Comité mensuel, écran projeté | Non technique | Un chiffre, une date, une provenance | Mensuelle |
| Manager commercial | Utilisateur principal | Réunion d'équipe matinale, café | Non technique | CA par client et taux de transformation, avec la cible | Quotidienne |
| Manager production | Utilisateur principal | Point quotidien de production | Non technique | Taux de service, retards, charge | Quotidienne |
| Responsable support | Utilisateur secondaire | Triage quotidien | Non technique | Backlog et délai de traitement | Quotidienne |
| Contrôleur de gestion | Auteur des définitions | Travail d/month | Expert tableur, pas en code | Écrire une définition et la faire signer | Hebdomadaire |
| Analyste CDD | Préparation de comité | 2 demi-journées par mois | Habitué aux requêtes | Explorer sans publier | Ponctuelle |
| Directeur du site | Validateur | Créneau de signature | Non technique | Signer ou refuser une définition | Mensuelle |

---

## 3. User stories

<!-- Priorité : P1 (doit avoir), P2 (devrait avoir), P3 (pourrait avoir), P4 (pas maintenant) -->

### US-1 : Déclarer un indicateur

- **En tant que** contrôleur de gestion
- **Je veux** écrire la définition d'un indicateur — ce qu'il compte, sur quel périmètre, avec quelle formule, et qui en répond
- **Afin de** qu'il existe une seule version écrite de chaque chiffre d'entreprise

**Priorité** : P1
**Dépendances** : aucune

**Critères d'acceptation** :
- [ ] Une définition contient au minimum un intitulé, une formule, un périmètre, un propriétaire nommé et un signataire désigné.
- [ ] Une définition ne peut pas être enregistrée sans propriétaire nommé **et** sans signataire désigné.
- [ ] Le signataire désigné est distinct de l'auteur de la version (B2). L'interface de déclaration ne propose pas l'auteur comme signataire par défaut.
- [ ] Une définition modifiée après signature crée une nouvelle version ; la version précédente reste consultable intacte.

---

### US-2 : Faire signer une définition

- **En tant que** signataire désigné
- **Je veux** signer une définition qui m'est présentée, en étant distinct de son auteur
- **Afin de** que sa valeur ait un statut opposable

**Priorité** : P1
**Dépendances** : US-1

**Critères d'acceptation** :
- [ ] Une définition n'est affichée comme officielle qu'après une signature horodatée d'un **signataire désigné, distinct de l'auteur de la version** (B2).
- [ ] Une personne ne peut pas signer une version dont elle est l'auteur : l'action lui est refusée, et le refus est expliqué en clair — pas seulement désactivée.
- [ ] Une signature est journalisée : qui, quand, sur quelle version.
- [ ] Une définition peut être refusée avec un motif ; elle reste alors en projet.
- [ ] La signature est révocable par l'auteur tant que la version n'a pas été publiée ; au-delà, elle ne se reprend plus (B26).

---

### US-3 : Consulter un indicateur officiel

- **En tant que** manager d'équipe
- **Je veux** voir la valeur d'un indicateur avec sa cible, sa date de calcul et sa source
- **Afin de** décider sans rouvrir l'entrepôt

**Priorité** : P1
**Dépendances** : US-1, US-2

**Critères d'acceptation** :
- [ ] Chaque valeur affichée porte sa date de calcul issue de la source et l'identification de cette source.
- [ ] Un indicateur sans définition signée est visible de son auteur mais porte la mention « non officiel ».
- [ ] La cible de l'indicateur est affichée à côté de la valeur quand elle existe.

---

### US-4 : Détecter une anomalie

- **En tant que** manager d'équipe
- **Je veux** être signalé quand un indicateur sort du seuil écrit à côté de sa définition
- **Afin de** ne pas avoir à le surveiller moi-même

**Priorité** : P1
**Dépendances** : US-2

**Critères d'acceptation** :
- [ ] Un seuil ne peut être posé que sur un indicateur signé.
- [ ] Le franchissement produit une alerte une seule fois par passage.
- [ ] Le retour dans la zone normale réarme le seuil sans nouvelle alerte.

---

### US-5 : Investiguer

- **En tant que** manager d'équipe
- **Je veux** descendre d'un indicateur vers les lignes qui le composent
- **Afin de** localiser l'anomalie sans redemander un retraitement

**Priorité** : P1
**Dépendances** : US-3, US-7

**Critères d'acceptation** :
- [ ] Depuis une valeur, on peut atteindre les lignes qui la composent, avec le même périmètre et les mêmes droits que l'écran d'origine.
- [ ] Un indicateur à plus de deux niveaux de décomposition indique le chemin parcouru pour revenir en arrière.

---

### US-6 : Publier et partager un dashboard officiel

- **En tant que** contrôleur de gestion
- **Je veux**Composer un dashboard à partir d'indicateurs officiels et le partager à des personnes nommées
- **Afin de** que le comité ouvre la même chose que moi

**Priorité** : P1
**Dépendances** : US-2, US-3

**Critères d'acceptation** :
- [ ] Un dashboard ne peut être partagé qu'à des personnes nommées ou à des groupes définis dans l'annuaire.
- [ ] Aucun accès public n'existe : une adresse de dashboard n'est pas un droit.
- [ ] Le lecteur voit exactement le périmètre et la période qu'il a été autorisé à voir, et peut les changer sans changer ses droits.

---

### US-7 : Ne pas voir ce à quoi on n'a pas droit

- **En tant que** lecteur
- **Je veux** que les lignes qui ne me concernent pas soient absentes, et pas seulement masquées
- **Afin de** qu'une restriction de visibilité tienne réellement

**Priorité** : P1
**Dépendances** : aucune

**Critères d'acceptation** :
- [ ] Un lecteur ne peut pas obtenir par aucun chemin une ligne qu'il n'a pas le droit de voir.
- [ ] Un export produit exactement les mêmes lignes que l'écran.
- [ ] Un dashboard partagé qui contient un indicateur interdit à un lecteur est renvoyé sans cet indicateur, et l'exclusion est journalisée.

---

### US-8 : Justifier ce que j'ai consulté

- **En tant que** lecteur
- **Je veux** savoir qui a consulté quoi, et pouvoir le prouver
- **Afin de** répondre à une demande de contrôle

**Priorité** : P1
**Dépendances** : US-7

**Critères d'acceptation** :
- [ ] Chaque consultation d'un indicateur est journalisée avec l'identité, l'indicateur, le périmètre, la période et l'issue.
- [ ] Le journal est consultable par les personnes habilitées, et une demande d'export du journal est possible.

---

### US-9 : Exporter une vue pour une réunion

- **En tant que** utilisateur
- **Je veux** exporter en PDF ou en CSV ce que je vois
- **Afin de** coller un support de réunion

**Priorité** : P1
**Dépendances** : US-3, US-7

**Critères d'acceptation** :
- [ ] L'export porte exactement le périmètre, la période et les restrictions de l'écran d'origine.
- [ ] Un export en cours n'est pas interrompu par la navigation : il est produit en tâche de fond et notifié.
- [ ] L'export porte la version de la définition, la date de sa signature, la date de calcul, la source, son auteur et sa date d'export (B27). Un support qui circule en réunion ne peut pas être déconnecté du chiffre qu'il affirme.
- [ ] L'export reste rattaché à la version qui l'a produit, même après une signature plus récente (B22).

---

### US-10 : Explorer sans publier

- **En tant qu'**analyste
- **Je veux** composer une vue libre à partir des indicateurs existants, sans en créer de nouvelles
- **Afin de** préparer un comité sans attendre une signature

**Priorité** : P2
**Dépendances** : US-3

**Critères d'acceptation** :
- [ ] Une vue composée librement ne peut pas être partagée tant qu'elle contient un indicateur non officiel.
- [ ] Une vue composée librement applique les mêmes restrictions de lignes que les vues officielles.

---

### US-11 : Comparer à une cible

- **En tant que** manager d'équipe
- **Je veux** une cible sur mes indicateurs, pas seulement une valeur
- **Afin de** savoir si ma situation est bonne ou mauvaise

**Priorité** : P1
**Dépendances** : US-3

> **Priorité relevée de P2 à P1 au gate de la Phase 2.** La couleur sémantique
> (B11) et la cible (B14) sont le même objet vu de deux côtés : le MVP livre la
> première sans la référence qui la justifie. La cible est un **champ de la forme
> de définition**, versionné avec elle — l'écran de gestion des cibles est un objet
> de V2.

**Critères d'acceptation** :
- [ ] Une cible est déclarée avec la définition qu'elle accompagne et suit sa version.
- [ ] La cible est saisie dans la forme de définition, pas dans un écran séparé.
- [ ] La couleur sémantique d'un indicateur dérive de la comparaison à sa cible (B14) ; un indicateur sans cible est neutre et le dit.
- [ ] La couleur sémantique de l'indicateur dérive de la comparaison à la cible, pas d'un réglage d'apparence.

---

### US-12 : Recevoir une alerte par mail

- **En tant que** manager d'équipe
- **Je veux** recevoir un mail quand un indicateur sort de sa cible
- **Afin de** ne pas avoir à ouvrir l'outil pour le savoir

**Priorité** : P2
**Dépendances** : US-4

**Critères d'acceptation** :
- [ ] Le destinataire d'une alerte est soit le propriétaire de l'indicateur, soit une liste nommée avec lui.
- [ ] Le mail reprend la valeur, la cible, la date de calcul et la provenance.

---

### US-13 : Commenter un indicateur

- **En tant que** utilisateur
- **Je veux** laisser un commentaire expliquant un écart, visible de mon équipe
- **Afin de** que le « pourquoi » accompagne le chiffre

**Priorité** : P3
**Dépendances** : US-3

**Critères d'acceptation** :
- [ ] Un commentaire est rattaché à un indicateur et à la version de sa définition, pas à un point d'un graphique.
- [ ] Un commentaire antérieur à un changement de version indique qu'il porte sur la version précédente.

---

### US-14 : Lire une valeur par programme

- **En tant qu'**intégrateur
- **Je veux** récupérer la valeur officielle d'un indicateur par une interface de lecture
- **Afin de** de la réinjecter ailleurs sans copier-coller

**Priorité** : P3
**Dépendances** : US-3

**Critères d'acceptation** :
- [ ] L'interface de lecture ne renvoie que des indicateurs officiels.
- [ ] Elle applique les mêmes restrictions de lignes que l'interface.

---

### US-17 : Voir pourquoi mon chiffre a changé

- **En tant que** lecteur
- **Je veux** voir les versions signées d'un indicateur, leur valeur, leur date de calcul, et ce qui a changé entre deux versions
- **Afin de** pouvoir répondre à « pourquoi on m'a annoncé 94,8 % et pas 96 % ? »

**Priorité** : P1
**Dépendances** : US-1, US-2, US-3

**Critères d'acceptation** :
- [ ] L'historique liste chaque version signée avec sa valeur, sa date de calcul issue de la source (B5), sa date de signature et son signataire.
- [ ] L'écart entre deux versions est écrit en langue métier, lisible par quelqu'un qui n'écrit pas de requête : « les lignes sous-traitées ne sont plus comptées », pas un diff de formule.
- [ ] Chaque ligne de l'historique porte sa propre date de calcul. Un historique qui affiche un nombre sans sa date est pire que pas d'historique.
- [ ] Quiconque peut lire la valeur courante peut lire l'historique, sans être l'auteur.
- [ ] La consultation de l'historique est journalisée (B24).

---

### US-15 : Consulter en déplacement

- **En tant que** utilisateur
- **Je veux** lire mes indicateurs depuis un téléphone
- **Afin de** vérifier un chiffre chez un client

**Priorité** : P4
**Dépendances** : US-3

**Critères d'acceptation** :
- [ ] La lecture fonctionne sur téléphone, en lecture seule, avec le même filtrage.
- [ ] Aucune saisie ni modification n'est possible sur téléphone.

---

### US-16 : Détecter une anomalie sans seuil déclaré

- **En tant que** utilisateur
- **Je veux** qu'une anomalie soit signalée même quand aucun seuil n'a été écrit
- **Afin de** ne pas dépendre d'un seuil que personne n'a posé

**Priorité** : P4
**Dépendances** : US-4

**Critères d'acceptation** :
- [ ] Une anomalie détectée sans seuil est signalée comme telle et ne se confond jamais avec un franchissement de seuil.
- [ ] Elle n'est jamais utilisée pour déclencher une alerte automatique.

---

## 4. Règles métier

| ID | Règle | User story liée | Notes |
|---|---|---|---|
| B1 | Un indicateur a exactement une définition ; toute modification crée une nouvelle version et ne réécrit pas les versions précédentes. | US-1 | Historique immuable |
| B2 | Une définition n'a le statut « officielle » qu'après signature horodatée d'un **signataire nommé, distinct de l'auteur de la version qu'il signe**. L'auto-signature est interdite. | US-2 | |
| B3 | Le propriétaire d'un indicateur est une personne nommée, jamais une équipe ni un rôle collectif. | US-1 | |
| B4 | La valeur publiée est celle de la dernière version signée ; modifier une version signée sans re-signer ne change pas la valeur publiée. | US-3 | |
| B5 | Toute valeur affichée porte la date de calcul **issue de la source** et l'identification de la source. | US-3 | Jamais l'heure de la requête |
| B6 | Si la date de calcul est absente de la source, la fraîcheur s'affiche « inconnue ». L'heure du poste ne remplace jamais cette information. | US-3 | |
| B7 | La restriction de visibilité porte sur la donnée : une ligne interdite n'est ni lisible, ni recalculable, ni exportable par aucun chemin. | US-7 | Masquage d'interface insuffisant |
| B8 | Un export porte exactement le périmètre, la période et les restrictions de l'écran d'origine ; il ne peut pas élargir le périmètre. | US-9 | |
| B9 | Aucun accès public n'existe : l'accès est une liste nominative ou un groupe d'annuaire. | US-6 | |
| B10 | Toute consultation d'un indicateur est journalisée, y compris les refus. Le journal est conservé un an. | US-8 | |
| B11 | Un seuil n'existe que sur un indicateur signé ; il porte sa valeur, son sens et sa date. | US-4 | |
| B12 | Le franchissement d'un seuil produit une alerte une seule fois par passage, et se réarme au retour dans la zone normale. | US-4, US-12 | |
| B13 | Un indicateur sans définition signée peut être exploré en privé ; il n'apparaît dans aucun dashboard partagé et ne déclenche aucune alerte. | US-3, US-10 | |
| B14 | La cible d'un indicateur est versionnée avec sa définition. | US-11 | |
| B15 | Un drill-down depuis un indicateur applique le même périmètre et les mêmes restrictions que l'écran d'origine. | US-5 | |
| B16 | Une modification de définition laisse les dashboards partagés qui la référencent sur la version signée jusqu'à signature de la nouvelle version. | US-6 | |
| B17 | Un indicateur dont le propriétaire n'est plus actif perd le statut officiel et ne peut plus être re-signé tant qu'un propriétaire n'est pas nommé. | US-3, US-8 | |
| B22 | Les valeurs déjà publiées restent rattachées à la version qui les a produites. Une nouvelle version ne réécrit pas l'historique des valeurs. | US-1, US-3 | |
| B23 | Seules des personnes nommées peuvent consulter le journal des accès, et cette consultation est elle-même journalisée. | US-8 | |
| B24 | L'historique des versions d'un indicateur est une vue de **consultation**, pas d'administration : il est journalisé comme une consultation. | US-17 | |
| B25 | Le journal des accès est filtré selon les droits de celui qui le consulte. Un refus journalise la ressource visée (indicateur, dashboard) **jamais** le détail des lignes. | US-8 | |
| B26 | La signature est révocable par l'auteur de la version jusqu'à sa première publication. Au-delà, elle ne se reprend plus : seule une nouvelle version, puis une nouvelle signature, peut la remplacer. | US-2, B4 | |
| B27 | Un export porte la version de la définition, la date de sa signature, la date de calcul et la source, ainsi que son auteur et sa date d'export. Il reste rattaché à la version qui l'a produit, même après une signature plus récente. | US-9, B22 | |

## 5. Contraintes

| ID | Contrainte | Type | Impact |
|---|---|---|---|
| C1 | L'entrepôt est la source des chiffres et n'est jamais écrit par Amberline. | technique | Aucun indicateur ne peut être calculé ailleurs que dans l'entrepôt. |
| C2 | L'interface ne comporte aucune saisie de données métier. | métier | Un dashboard n'est pas un formulaire ; la modification passe par une nouvelle version de définition. |
| C3 | Authentification unique, hébergement dans l'Union européenne. | légale | Pas de mot de passe stocké par l'outil ; pas d'hébergement hors UE. |
| C4 | Le journal des accès est conservé un an, purgé automatiquement et consultable. | légale | Impose un stockage propre à l'outil, avec chiffrement au repos et restauration à un instant. |
| C5 | Budget de quelques dizaines de milliers d'euros sur l'année. | budget | Hors recruitment d'une équipe BI dédiée. |
| C6 | Le premier dashboard officiel est présenté au comité dans trois mois. | temps | Tranche le MVP : ce qui n'est pas nécessaire à la séance de comité n'y est pas. |
| C7 | Un utilisateur métier doit être autonome en moins d'une demi-journée de formation. | temps | Contraint le nombre de concepts nouveaux, pas la puissance de l'outil. |
| C8 | L'outil ne remplace pas l'ERP et n'écrit aucune donnée opérationnelle dans l'ERP. | métier | Pas de workflow de gestion, pas de saisie, pas de retour. |
| C9 | Le tableur partagé reste accessible à tous ; réduire son usage est un résultat, pas une coupure imposée. | métier | Le produit doit gagner l'usage de l'intérieur, sans interdire l'existant. |
| C10 | Le stockage de l'outil contient des données personnelles : chiffrement au repos, isolation par ligne, restauration à un instant, politique de rétention et accord de traitement des données sont des prérequis de mise en production. | légale | Bloque la mise en production tant qu'ils ne sont pas en place. |
| C11 | L'interface de lecture par programme (US-14) est un usage d'intégration secondaire ; elle ne doit pas devenir le chemin principal d'accès aux chiffres. | métier | Une intégration non bornée contourne la gouvernance des définitions. |

## 6. Edge cases

| ID | Cas | Déclencheur | Comportement attendu | Sévérité |
|---|---|---|---|---|
| E1 | Source indisponible au moment du rendu | Panne ou perte de liaison avec l'entrepôt | L'écran affiche « source indisponible » avec la dernière date de calcul connue. Jamais un zéro, jamais une liste vide. | critical |
| E2 | Indicateur sans aucune ligne sur la période demandée | Filtre qui ne renvoie rien | État « aucune donnée sur la période », distinct d'une valeur à zéro, avec la commande pour élargir la période. | high |
| E3 | Matérialisation source pas encore rafraîchie | Premier jour, ou chaîne de rafraîchissement en retard | Fraîcheur « inconnue » et mention que la source n'a pas été rafraîchie depuis sa dernière date connue. | high |
| E4 | Définition modifiée alors qu'un dashboard partagé la référence | US-1 après US-6 | Le dashboard partagé reste sur la version signée jusqu'à signature de la nouvelle version. | critical |
| E5 | Lecteur ouvrant un dashboard partagé contenant un indicateur interdit | US-6 et US-7 | L'indicateur n'apparaît pas ; la liste des indicateurs est complète ; l'exclusion est journalisée avec l'identité et la ressource visée. | critical |
| E6 | Export demandé sur une période plus large que celle du dashboard | US-9 | Export refusé, avec le périmètre exact qui serait autorisé et la commande pour le demander explicitement. | medium |
| E7 | Deux lecteurs autour d'un rafraîchissement | Deux consultations à quelques secondes d'intervalle | Les deux valeurs affichent leur date de calcul ; une différence entre les deux lectures est visible et non ambiguë. | medium |
| E8 | Propriétaire d'un indicateur en congé longue durée ou parti | B17 | L'indicateur perd le statut officiel, les dashboards le servant perdent leur caractère officiel, et un remplacement est demandé nommément. | high |
| E9 | Seuil franchi puis retour dans la zone normale dans la même journée | B12 | Une seule alerte, puis réarmement silencieux. | medium |
| E10 | Lecteur autorisé sur un client et non sur un autre, qui creuse un indicateur | B15 et B7 | La décomposition ne laisse apparaître aucune ligne du client non autorisé, et le total affiché reste cohérent avec ce qui est visible. | critical |
| E11 | Calcul d'indicateur trop long pour être rendu | Requête source au-delà du délai maximal | L'écran affiche un état « calcul en cours, trop long » avec la dernière valeur connue et sa date. Jamais de valeur partielle présentée comme complète. | high |
| E12 | Commentaire posté puis définition modifiée | US-13 et E4 | Le commentaire reste rattaché à sa version et signale qu'il porte sur une version antérieure. | low |
| E13 | Export échoué en cours de production | US-9 | Aucun fichier partiel n'est proposé ; l'écran indique l'échec et la reprise possible. | medium |
| E14 | Composition d'un groupe d'accès modifié | B9 et B10 | La nouvelle composition s'applique à la prochaine lecture, et celle-ci est journalisée avec la nouvelle composition. | medium |
| E15 | Indicateur dont la définition référence un périmètre devenu vide (organisation modifiée) | B1 et US-3 | L'indicateur est signalé « périmètre résolu vide » plutôt que de renvoyer zéro. | high |
| E16 | Un indicateur change de version alors que sa cible existait sur la version précédente | B14 et B22 | La cible ne suit pas automatiquement : l'indicateur est affiché sans comparaison sémantique, avec la mention « cible à reconfirmer », jusqu'à ce qu'une cible soit écrite sur la version courante. | medium |
| E17 | Un tableau de bord partagé référence un indicateur devenu non officiel (B17 : propriétaire inactif) | B17 et B16 | Le tableau reste consultable, chaque indicateur concerné porte la mention « non officiel », et le tableau perd son caractère officiel. Il n'est pas retiré des accès en cours : le retirer effacerait ce que le lecteur attendait. | high |
| E19 | La définition a changé sans que la valeur bouge, ou le périmètre a bougé dans la source sans que la définition change | US-17 et B22 | L'historique affiche « inchangé » alors que la cause est ailleurs. L'écart est remonté au propriétaire comme constat ; aucune correction automatique n'est appliquée, et l'indicateur conserve son statut officiel. | high |
| E18 | Deux définitions signées de deux indicateurs différents produisent la même valeur sur la même période | B2 | Aucune correction automatique. Les deux restent officielles et visibles ; l'anomalie est remontée au propriétaire de chacune comme constat à traiter. Corriger le calcul de l'indicateur le plus récent ne réécrit pas l'autre. | critical |

## 7. Exigences non-fonctionnelles

### 7.1 Performance

- Un dashboard officiel s'affiche en moins de 2 secondes sur le périmètre usual d'une équipe, source comprise.
- Un drill-down d'un indicateur s'affiche en moins de 3 secondes.
- Un export est produit en tâche de fond : l'utilisateur n'attend pas le fichier.
- Aucun calcul partiel n'est présenté comme un résultat complet (cf. E11).

### 7.2 Sécurité

- Authentification unique, session gérée par l'outil, jamais de mot de passe stocké (C3).
- La restriction de visibilité est appliquée à la donnée, pas à l'affichage (B7).
- Le journal des accès est en écriture seule pour l'application : une lecture ne peut pas le modifier ni le purger (C4).
- Un compte qui perd son accès cesse d'accéder à ses dashboards partagés à la lecture suivante, sans intervention (E14).

### 7.3 Accessibilité

- Le produit est utilisé en séance de comité sur un écran projeté, souvent de loin : tailles de texte et contrastes doivent rester lisibles à 3 mètres.
- Navigation complète au clavier, y compris pour le drill-down.
- Aucune information portée uniquement par la couleur : l'état d'un indicateur est aussi porté par un texte et par une icône.

### 7.4 Internationalisation

- Interface en français uniquement dans la version initiale ; le vocabulaire métier (marge, taux de service) est celui de l'entreprise et n'est pas traduit.
- Les identifiants de sources et les noms propres ne sont pas traduits.

### 7.5 Disponibilité / Résilience

- L'indisponibilité de la source ne doit pas rendre l'outil illisible : la dernière valeur connue reste affichée, datée (E1).
- Une perte de liaison pendant une session ne doit pas provoquer de perte de travail en cours.

---

## 8. Risques et inconnues

| Risque | Probabilité | Impact | Mitigation |
|---|---|---|---|
| Le comité n'a toujours pas ses chiffres à trois mois | MEDIUM | HIGH | Le MVP ne contient que ce qui sert la séance : aucun travail sur ce qui ne la sert pas. |
| Les trois indicateurs ne sont jamais signés faute de propriétaire désigné | HIGH | HIGH | La désignation du propriétaire est un livrable du projet, pas une hypothèse (cf. § 12). |
| Le tableur reste le lieu de calcul réel et les dashboards restent une façade | MEDIUM | HIGH | C9 assume que le tableur reste ouvert ; le critère de succès est l'usage, mesuré (cf. § 10). |
| La réduction de l'usage de Metabase et Power BI se fait mais libère un besoin plutôt qu'elle n'apporte un bénéfice | MEDIUM | MEDIUM | Le besoin couvert est le chiffre opposable, pas la construction de vues ; si l'arbitrage est faux, il faut le dire avant la Phase 4. |
| Une intégration contourne la gouvernance et publie un chiffre non signé par un autre canal | MEDIUM | HIGH | C11 borne l'interface de lecture aux indicateurs officiels. |

### Inconnues

- ⚠️ Le seuil du taux de service (95 % ou 96 % pour les lignes sous-traitées) n'est pas tranché : la production et le commercial le contestent séparément. Il sera écrit **par le propriétaire au moment de la signature**, pas par l'outil.
- ⚠️ Le nombre de personnes réellement concernées au-delà des 30 connues n'est pas mesuré ; il conditionne le dimensionnement du journal des accès.

---

## 9. Hors scope (explicitement)

<!-- Une exigence retirée garde son ID. Cf. consistency-check premises. -->

- **B18** — Partage d'un dashboard par lien public, sans liste nominative — raison : incompatible avec le journal des accès (C4) et avec le secret commercial. Le partage se fait par liste de personnes ou de groupes (B9). Décision prise le 2026-09-30 après mise en cause de la prémisse : « un lien n'est pas un droit ».
- **B19** — Détection d'anomalie sans seuil déclaré, en version automatique — raison : elle déplace l'arbitrage vers une boîte noire alors que le vrai défaut est l'absence de seuil écrit. Elle est maintenue en US-16, priorité P4, et ne déclenchera jamais d'alerte.
- **B20** — Modification d'une définition signée sans nouvelle signature — raison : rendrait la version publiée non reproductible et le journal sans valeur. Toute modification passe par une nouvelle version (B1) et une nouvelle signature (B2).
- **B21** — Recalcul d'un indicateur hors de la source de données de l'entreprise — raison : contradictoire avec C1 et avec B5. Un indicateur est calculé par l'entrepôt ou il n'existe pas.

---

## 10. Critères de succès

- Au 3ᵉ mois : 15 personnes ouvrent au moins un dashboard par semaine.
- Au 3ᵉ mois : 3 des 5 managers d'équipe publient leur tableau de bord officiel **sans aide**, et leur tableau mis à jour sans intervention de l'équipe technique. *(On ne mesure pas ici la construction d'une vue libre : elle est hors MVP, cf. US-10 et `benchmarks.md` § 5 écart 1. Elle est mesurée au 6ᵉ mois.)*
- Au 3ᵉ mois : 3 définitions signées, chacune avec un propriétaire nommé et une date.
- Au 3ᵉ mois : zéro retraitement manuel d'un chiffre pendant une séance de comité.
- Au 6ᵉ mois : 3 des 5 managers d'équipe ont composé au moins une vue libre sans aide.
- Au 6ᵉ mois : le support perd au moins la moitié de ses tickets « je ne sais pas où est la donnée ».
- Une nouvelle demande faite au comité est livrée en moins d'une journée, sans intervention de la direction.

---

## 11. Glossaire

| Terme | Définition |
|---|---|
| Indicateur | Un chiffre d'entreprise, calculé par la source, doté d'une définition écrite |
| Définition | Ce que compte un indicateur, sur quel périmètre, avec quelle formule |
| Version de définition | Un état figé et daté d'une définition ; une modification en crée un nouveau |
| Signature | L'acte par lequel un signataire **nommé, distinct de l'auteur de la version**, rend un indicateur comme officiel. L'auto-signature est interdite. |
| Propriétaire | La personne nommée qui répond d'une définition, en désigne le signataire, et ne peut pas être ce signataire pour la version qu'elle propose |
| Officiel | Un indicateur dont la définition courante est signée |
| Seuil | La valeur et le sens au-delà desquels un indicateur est signalé |
| Cible | La valeur attendue d'un indicateur, versionnée avec sa définition |
| Dashboard officiel | Un dashboard dont tous les indicateurs sont officiels |
| Vue libre | Une composition personnelle, non partageable si elle contient un indicateur non officiel |
| Périmètre | L'ensemble des lignes qu'un indicateur agrège |
| Fraîcheur | La date de calcul de la valeur, prise dans la source |

---

## 12. Points à clarifier

Trois points sont **bloquants avant la Phase 4**. Aucun ne se décide dans ce
document : ce sont des décisions qui engagent une personne, un accord
d'infrastructure ou un contrat, pas une ligne de spécification.

### 12.1 Bloquants — l'architecture dépend de leur résolution

| # | Point | Pourquoi il bloque l'architecture | Ce qu'il faut, et quand |
|---|---|---|---|
| 1 | **Titulaires du rôle de signataire** | B2 impose `signer_id ≠ author_id`. La règle elle-même est **tranchée** (gate du 2026-09-30) : l'auteur ne signe jamais sa propre version ; le signataire est une personne nommée, désignée par le propriétaire. Ce qui reste est le **nom des titulaires** : sans au moins un nom, US-2 n'a aucun acteur et le MVP ne démarre pas. | Les noms, avant la **première signature**. Comme aucun tableau ne partira en phase 4 sans production, le jalon réel est la première signature — voir § 12.3. |
| 2 | **Fournisseur d'identité nommé** | `conventions.md` le déclare bloquant en Phase 0 : sans source d'identité nommée, « fail-closed » n'est pas implémentable, donc B7 et B23 ne sont pas constructibles. | Un nom d'IdP, avant la Phase 4. |
| 3 | **Entrepôt de test seedé** | B7 exige de **démontrer** l'isolation par ligne sur des lignes réelles (E5, E10). Sans données de test, le critère de sécurité n'est pas vérifiable — il n'est pas « inconfortable », il est non démontré. Déclare dans `conventions.md` comme accord d'infrastructure avec l'équipe data. | L'accord, avant la Phase 4. |

### 12.2 Non bloquant

- ⚠️ **Quel périmètre exact pour le taux de service ?** 95 % ou 96 % selon que les lignes sous-traitées sont incluses. La production et le commercial le contestent séparément. Ce n'est **pas** une question d'architecture : c'est une valeur écrite par le propriétaire au moment de la signature, et elle reste ouverte sans coût jusque-là.

### 12.3 La sortie du point 1

Ce qui a été tranché au gate du 2026-09-30, parce que c'était une contrainte
structurelle et non un arbitrage de gouvernance, est enregistré en `F-001` :
tant que le nom n'est pas donné, le rôle reste décrit mais non pourvu.

---

## Checklist de gate

- [x] Le problème est défini de manière concrète, pas en jargon.
- [x] Tous les types d'utilisateurs sont identifiés (y compris admin, support...).
- [x] Chaque user story a des critères d'acceptation vérifiables.
- [x] Chaque règle métier a un ID stable (B*).
- [x] Chaque edge case identifié a un ID stable (E*).
- [x] Chaque contrainte a un ID stable (C*).
- [x] Les exigences non-fonctionnelles couvrent performance, sécurité et accessibilité.
- [x] Les risques et inconnues sont listés.
- [x] Le hors scope est explicite, avec les ID conservés.
- [x] Aucune règle ou contrainte n'est laissée implicite.

**Statut** : `draft` → en attente de validation.