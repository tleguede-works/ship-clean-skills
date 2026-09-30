---
type: conventions
status: draft
generated_at: 2026-09-30
derived_from: []
---

# Conventions — Bailly

> Ce document est **vivant** : il démarre avec ce qui est connu en Phase 0, s'enrichit
> en Phase 4, et toute modification ultérieure **invalide les plans qui en dépendent**
> (`state.js check-stale` après chaque amendement).
>
> Une section marquée `À DÉCIDER EN PHASE 4` est une **case vide honnête**, pas un
> oubli. `no_undecided_slots` refuse qu'elle survive à une architecture approuvée.

---

## 1. Ce que ce projet est, et ce qu'il n'est pas

**Bailly** est un logiciel de **gestion locative** pour **un propriétaire de 14
appartements à Lyon**, qui est à la fois l'utilisateur, le décideur et le seul
opérateur.

Trois traits le séparent des deux autres projets de ce banc d'essai, et chacun a une
conséquence technique :

| trait | conséquence |
|---|---|
| **Un seul utilisateur, pas une équipe** | Pas de rôles, pas de permissions à grain, pas de « l'admin voit tout ». Mais un secret existe : un ordinateur partagé ou volé donne accès à 14 baux. |
| **Aucun fournisseur tiers** | Pas d'API externe. **La donnée est saisie**, donc l'erreur de saisie est le risque principal — pas l'indisponibilité réseau. |
| **Données personnelles à grande étendue** | Baux, loyers, dépôts, coordonnées, états des lieux, photos de dommages. Le RGPD s'applique pleinement, et le droit d'accès porte sur **le dossier du locataire**, pas sur le logiciel. |

**La donnée de référence vit chez un hébergeur, pas sur les machines du
propriétaire.** Raison donnée : si elle vit sur le téléphone, les sauvegardes
deviennent le boulot du propriétaire — et il ne les fera pas. « Je ne ferai pas les
sauvegardes » est une contrainte d'architecture, pas une préférence.

**L'appareil prioritaire est le téléphone**, parce que c'est là que la donnée se
**crée** : état des lieux dans un sous-sol, relevé d'un compteur, photo d'une chasse
d'eau, signature. Le portable sert au travail de fond : encaissement, écritures,
récapitulatifs.

---

## 2. Stack technique

| Domaine | Choix | Version | Justification |
|---|---|---|---|
| Langage | TypeScript, mode `strict` | 7.0.2 | Aucune contrainte de l'existant — le dossier est vide. `strict` dès la première ligne : un logiciel qui doit tenir 5 ans sans auteur disponible ne peut pas accumuler de `any`. |
| Cible mobile | **React Native**, pas Expo Go | à trancher en Phase 4 | Le téléphone est la cible prioritaire, et l'application doit **écrire hors ligne** et **signer**. Le mode de build décide du stockage chiffré, donc c'est une décision d'architecture. |
| Cible fond de travail | **Web**, ouvert depuis un navigateur | — | Le portable sert au travail de fond ; il ne justifie pas un second produit natif. |
| Base de données | **PostgreSQL** managé, région UE | 16 ou supérieur | Un seul éditeur, une seule sauvegarde, et le **SQL** permet d'écrire des contraintes qui tiennent — pas seulement des intentions. Le détail est en Phase 4. |
| Hébergement | Un petit hébergeur mutualisé ou un VPS, **chiffré au repos**, sauvegardé par l'hébergeur **et** exporté par Bailly | à trancher en Phase 4 | La sauvegarde ne peut pas reposer sur l'hébergeur seul : c'est le seul acteur dont la panne fait tout perdre. |
| Authentification | **Un secret unique, ressaisi à chaque ouverture**, jamais de session persistante | — | Un seul utilisateur, mais le secret doit exister. Un secret qu'on oublie entre deux utilisations est **le** coût acceptable ; une session à gérer est un coût quotidien. La reprise passe par la réinitialisation à l'hébergeur (R9), pas par un e-mail que le propriétaire n'a pas configuré. |
| Écriture hors ligne | **Obligatoire, et locale d'abord** | — | Non négociable, ci-dessous. |
| Signature | **Pas de signature électronique qualifiée (X12)** ; une signature tracée localement, valide **à la confirmation serveur** | — | B5 : une signature n'est valide qu'à la confirmation. Le composant `Signature` existe au design system mais **aucune slice du MVP ne le réclame**, donc il n'est branché nulle part — et B5 n'a pour l'instant qu'une existence de vocabulaire, pas un écran. **Dit** : ce n'est pas un oubli. |
| Validation | **Zod**, un schéma par entité, généré depuis la même source que les `CHECK` du DDL | — | Une valeur acceptée par Zod et refusée par PostgreSQL est un bug de **génération**, et il se voit parce que les deux listes sont côte à côte. |
| State management | **Zustand** | — | L'état global du produit est un compteur, une connectivité et une horloge. Un magasin unique lisible hors de React est la seule forme qui permette de **piloter l'interface depuis un test avec une horloge simulée** — donc ce choix découle de la décision d'horloge, il ne la précède pas. |
| Tests unitaires | **Vitest** + **fast-check** | — | Le garde-fou est une **property** (US-8) : sans générateur de propriétés, une property n'est pas testée, elle est affirmée. C'est la seule dépendance de test que la roadmap rend obligatoire. |
| Tests E2E | **Detox** + `adb` pour le mode avion | — | Les trois démonstrations sont au niveau appareil : le 6 du mois, le 11e mois du terme, le mode avion. `adb shell svc wifi disable` donne un mode avion **au niveau du système**, reproductible — c'est la seule façon de ne pas dépendre d'un réglage du développeur. |
| Lint / format | **ESLint 9** (config plate) + Prettier | — | Le plugin n'est pas le sujet : la règle qui compte est `no-restricted-syntax` sur `Date.now`, `new Date`, `Date.parse` **en dehors du paquet `horloge`**. C'est l'application mécanique de la décision d'horloge simulée, pas une préférence de style. |

---

## 3. La règle qui domine toutes les autres : ne jamais mentir sur la sauvegarde

> *« Si je signe un état des lieux dans un sous-sol et que l'application me dit
> « enregistré » alors que ce n'est pas parti, ce n'est pas un bug, c'est un
> contentieux. »* — le commanditaire, Phase 0

**Trois exigences, dans cet ordre** :

1. **L'application ne doit jamais laisser croire que c'est sauvegardé si ce ne l'est
   pas.** Un état « pas encore synchronisé », visible en permanence, vaut mieux qu'un
   silence. C'est une exigence d'**interface** autant que de synchronisation.
2. **Photo et signature sont sur l'appareil avant toute tentative réseau.** Jamais
   l'inverse : la photo d'un dégât dans un sous-sol est la donnée la plus fragile et
   la plus irremplaçable du dossier.
3. **Ce qui exige une preuve d'envoi** — mise en demeure, convocation, accusé — **ne
   peut pas être produit hors ligne.** Sans réseau, on n'envoie pas, et on le verra
   demain matin. C'est **acceptable** et c'est dit : ce n'est pas un défaut à corriger.

**Et « écrit localement d'abord » signifie écrit localement *durablement*.** Un
donnée non synchronisée qui vit dans la mémoire d'une application tuée par le
système est une donnée perdue. C'est un choix de Phase 4, et c'est le plus structurant
du projet.

---

## 4. La frontière donnée de fait / appréciation — imposée par la donnée, pas par l'usage

Le commanditaire a formulé une exigence, et l'a formulée comme une **contrainte** :

> *« Si l'outil ne m'oblige pas à trancher entre les deux à l'écriture, je ne veux pas
> qu'il écrive des notes à ma place. »*

| classe | définition | sort d'un export ? | effaçable ? |
|---|---|---|---|
| **Constaté** | ce que le propriétaire a observé : payé en retard en mars, la chasse d'eau fuyait le 12, ne répond pas au courrier | **oui** | non — c'est une donnée sur la personne |
| **Apprécié** | son opinion de travail : fiable, pas fiable, pénible à vivre avec | **jamais, aucun export** | oui — c'est une opinion, pas une donnée |

**Le piège que le commanditaire a nommé** : un espace « notes » où tout se mélange,
où un jugement devient un fait parce qu'il est stocké dans le même champ. La
frontière ne peut pas être une **convention d'écriture** — elle doit être un **choix de
schéma** : deux champs distincts, deux destinations d'export distinctes, et aucun
chemin de l'un vers l'autre.

**Et une exigence de plus, que le commanditaire n'avait pas formulée** : un champ de
texte libre est, par construction, un champ où un fait et une appréciation se
mélangent. Donc la saisie libre doit **demander la classe**, et le défaut ne peut pas
être « ce que j'ai lu quelque part » — ce serait laisser le tri se faire par
souvenir.

---

## 5. RGPD : trois états, pas deux

Le commanditaire a corrigé la question :

> *« On m'a présenté « effacer », mais ce n'est pas binaire. Les baux, quittances et
> pièces comptables ont une durée légale de conservation — on ne peut pas promettre la
> la suppression de tout. Si tu me conçois un « bouton tout effacer », tu me mets en
> infraction. »*

| état | ce qui | déclenche | durée de conservation |
|---|---|---|---|
| **Effacer** | coordonnées, photos, journal de saisie, avis | départ du locataire | aucune |
| **Anonymiser** | ce qui a servi à décider mais n'identifie plus personne | départ du locataire | conserve le **fait**, retire l'identifiant. **La date de fin est inconnue tant que Q2 n'est pas tranchée** : le schéma le sait et ne l'invente pas. |
| **Conserver pour obligation légale** | bail, quittance, pièce comptable, correspondance de gestion | — | **jusqu'à une date de fin écrite**, affichée |

**Le « bouton tout effacer » est donc interdit par construction**, et pas seulement
par convention : il n'y a pas de bouton, parce que chaque ligne a son état et que les
trois états ne se déclenchent pas au même moment.

**L'export est toujours produit, sans qu'on le demande.** Raison donnée : la demande
arrivera pendant un litige, donc au moment où le propriétaire est occupé et fait des
erreurs, et il y a un délai légal pour répondre. **Le format n'est pas négociable** : un
document lisible, daté, au nom d'un locataire — pas un vidage de base, pas du JSON.

---

## 6. Portabilité : l'export est un produit, pas une fonction

> *« Si l'hébergeur meurt demain, je dois pouvoir récupérer mes 14 baux en une
> journée. »*

L'export complet et lisible **fait partie du MVP**, pas plus tard. Trois formes, trois
destinataires :

| forme | pour qui | exigence |
|---|---|---|
| **dossier locataire** | le locataire, son avocat, un tribunal | lisible, daté, au nom de la personne — « constaté » seulement |
| **reprise complète** | le propriétaire, le jour où l'hébergeur meurt | **lisible sans Bailly** — CSV ou Markdown, pas un export propriétaire |
| **comptes** | le comptable | doit correspondre à ce que la fiscalité attend |

**La deuxième est la plus dure et la plus urgente.** Un export que seul Bailly sait
lire n'est pas une sauvegarde : c'est une raison de plus de ne jamais quitter Bailly.
C'est pourquoi elle est au MVP, et non « plus tard, si le temps le permet ».

---

## 7. Périmètre : ce que le commanditaire exclut, et ce qu'il refuse qu'on oublie

**Exclu explicitement du MVP**, par le commanditaire :

- la quittance de loyer — mensuelle, il la fait encore à la main
- la régularisation des charges — annuelle
- la révision annuelle du loyer — annuelle
- la fiscalité — annuelle

> *« Je préfère trois trucs parfaits et utilisés tous les jours qu'une liste de
> quatorze écrans. »*

**Mais il a contesté sa propre fréquence** — et c'est la partie la plus utile de la
Phase 0 :

> *« « Hebdomadaire » est un bon proxy de fréquence, pas de risque. Il y a des
> obligations mensuelles ou annuelles que je peux rater, et quand je les rate ça coûte
> de l'argent ou ça me bloque juridiquement. »*

Sa demande n'est pas de les calculer — c'est de **ne pas le laisser les oublier** :
« un simple rappel de date pour les cinq échéances que je suis censé ne pas louper,
rien de plus ».

C'est donc un **MVP de 3 tâches + 1 garde-fou**, et le garde-fou n'est pas une
fonctionnalité : c'est l'obligation de dire, à l'écran, **ce qui n'a pas été fait**.

---

## 8. Les trois questions que le commanditaire me renvoie

Il a demandé une réponse argumentée, pas une option. Elles sont traitées au PRD
(Phase 1) et à l'architecture (Phase 4), et **les trois sont des décisions de
structure, pas d'interface** :

1. **Où est tracée la frontière constat / appréciation** dans le modèle, et comment
   l'écriture l'impose. → § 4 ci-dessus pose la contrainte ; le schéma est Phase 4.
2. **Comment les trois états RGPD se distinguent dans la donnée et dans l'interface**,
   sans que le propriétaire ait à s'en souvenir. → § 5 pose la contrainte ; l'interface
   est Phase 3.
3. **Ce qui se passe si l'hébergeur disparaît**, et à quel rythme on récupère un
   état cohérent. → § 6 pose la contrainte ; le mécanisme est Phase 4.

---

## Checklist de gate

- [x] La stack est établie, ou sa case vide est nommée.
- [x] Les traits du projet qui changent l'architecture sont écrits.
- [x] La règle de sauvegarde est écrite **avant** toute fonctionnalité.
- [x] Les exclusions du MVP viennent du commanditaire, pas de moi.
- [x] Les trois questions renvoyées ont une réponse argumentée, pas un renvoi.
