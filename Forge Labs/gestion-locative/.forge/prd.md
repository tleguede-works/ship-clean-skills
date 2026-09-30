---
type: prd
status: approved
generated_at: 2026-09-30
derived_from:
  - .forge/conventions.md
---

# Product Requirements Document — Bailly

> Ce document décrit **CE QUE** le produit fait, **POUR QUI**, et **POURQUOI**.
> Il ne dit pas comment. Chaque règle porte un identifiant `B*` ; les contraintes `C*`
> viennent de `conventions.md` ; les cas limites `E*` sont des situations réelles, pas
> desodels.

---

## 1. Résumé exécutif

**Bailly** aide un propriétaire de 14 appartements à Lyon à **saisir ce qui s'est
passé, encaisser son loyer, et débloquer ce qui attend**. Rien d'autre.

Ce n'est pas un logiciel de gestion locative. C'est un **outil de saisie fiable pour
une personne qui est son propre grating de données**, et dont le métier ne survit pas
à une saisie oubliée.

**La promesse, et elle est unique :** *ce que j'ai signé est parti.* Pas « ce que
j'ai signé est dans mon téléphone ». La différence entre ces deux phrases est le
produit entier.

**Le produit se juge sur une seule chose :** le propriétaire saisit-il le jour même,
depuis le téléphone, dans un endroit sans réseau, et sait-il à tout moment si ce qu'il
a écrit est parti ou non.

### Les trois tâches du commanditaire

Le commanditaire a nommé ce qu'il fait **chaque semaine, sans exception** — pas ce
qu'il voudrait avoir :

1. **Saisir ce qui s'est passé**, le jour même, sans exception.
2. **Suivre l'encaissement du mois et relancer.** Qui a payé, qui n'a pas payé, qui a
   payé en retard, et il appelle les trois.
3. **Débloquer les demandes en attente.** Messages, devis d'artisan, rendez-vous,
   travaux.

**Et il a contesté sa propre formulation**, ce qui est la partie la plus utile de ce
document : ces trois tâches **aplatissent trois rythmes distinctes** — le quotidien,
le mensuel, et le déclenché par un impayé. Mélangés dans une liste, ils font **paraître
le quotidien optionnel**. Et « saisir ce qui s'est passé » recouvre en réalité **trois
objets** : un fait daté, une somme due, et une pièce jointe.

### Ce que ce document refuse de faire

C'est une liste, et elle est courte : quittance de loyer, régularisation des charges,
révision annuelle du loyer, fiscalité. Le commanditaire les exclut **explicitement**,
avec une raison : « une fois par an ou une fois par mois, et je les fais encore à la
main sans que ça devienne ingérable. Je préfère trois trucs parfaits et utilisés tous
les jours qu'une liste de quatorze écrans. »

---

## 2. Utilisateurs et personas

**Un seul persona.** Ce n'est pas un raccourci : Bailly n'a **qu'un utilisateur**, et
c'est le commanditaire. Il est aussi le décideur, le seul opérateur, et la seule
personne qui paie.

| Persona | Rôle | Contexte | Niveau technique | Besoin principal | Fréquence d'usage |
|---|---|---|---|---|---|
| **Le propriétaire** | exploitant unique | sur son téléphone, un appartement à la fois ; parfois au bureau | **bon sur un téléphone, et c'est tout** — il n'a pas de temps d'apprendre un logiciel | ne rien avoir à ressaisir et ne jamais mentir sur ce qui est enregistré | quotidienne, et **le premier jour d'un mois** pour l'encaissement |

**Ce que ce persona implique, et qui n'est pas négociable :**

- **Aucune connexion, aucun mot de passe à retenir.** Il n'a qu'un secret, et il doit
  pouvoir l'oublier entre deux utilisations. Un mot de passe qu'on oublie le coûte
  plus cher qu'une clé qu'on n'a pas.
- **Aucune administration.** Pas de rôles, pas d'utilisateurs, pas de permissions à
  grain. Un logiciel de gestion locative qui demande de gérer des utilisateurs est un
  logiciel de gestion locative pour un cabinet, pas pour un propriétaire.
- **L'écran principal doit tenir dans un pouce**, parce qu'il l'utilise debout dans un
  couloir.
- **Il ne lira pas une notice.** Toute feature dont l'usage n'est pas évident en une
  occurrence est une feature qu'il n'utilisera pas.

---

## 3. User stories

### 3.1 Saisir — le quotidien

| ID | En tant que | Je veux | Afin de | Priorité |
|---|---|---|---|---|
| **US-1** | propriétaire | consigner un **fait daté** (un échange, une visite, un dégât signalé) | que l'historique d'un appartement existe à la fin de l'année, et pas seulement dans ma mémoire | **P1** |
| **US-2** | propriétaire | **joindre une photo** à un fait, horodatée et datée par le lieu | que le dégât soit contestable six mois plus tard | **P1** |
| **US-3** | propriétaire | **enregistrer une somme due** (loyer, charges, arriéré, acompte) | que l'encaissement du mois soit un calcul et non un souvenir | **P1** |

**L'objet « pièce jointe » est la partie difficile**, et le commanditaire l'a dit
lui-même : « mon risque réel n'est pas d'avoir mal saisi, c'est d'avoir une photo
restée sur le téléphone que je crois partie ».

### 3.2 Le bail — la source des dates

| ID | En tant que | Je veux | Afin de | Priorité |
|---|---|---|---|---|
| **US-4** | propriétaire | **créer le dossier d'un locataire et son bail** avec ses dates | que les cinq échéances que je ne dois pas louper soient **dérivées** du bail et non tapées | **P1** |

**C'est la user story qui rend le garde-fou possible.** Le commanditaire l'a reformulé
et sa formulation est meilleure que la mienne : *« le bail est le seul endroit qui sait
les dates. Tes cinq échéances, si tu ne les dérives pas de lui, tu les tapes à la main
— et dans un mois elles mentent, sans que personne les ait corrigées. »*

Un prérequis que l'on traite comme une donnée saisie, c'est une donnée saisie.

### 3.3 Encaisser — le mensuel

| ID | En tant que | Je veux | Afin de | Priorité |
|---|---|---|---|---|
| **US-5** | propriétaire | voir **qui a payé, qui n'a pas payé, qui a payé en retard** pour le mois en cours | d'appeler **les trois**, et pas de les chercher | **P1** |
| **US-6** | propriétaire | **conserver une preuve d'envoi** quand je relance | que la relance soit datée et opposable | **P1** |

### 3.4 Débloquer — le flux

| ID | En tant que | Je veux | Afin de | Priorité |
|---|---|---|---|---|
| **US-7** | propriétaire | **qui doit agir** sur chaque demande en attente | que la moitié de ma liste ne soit pas des lignes que je ne peux pas traiter | **P1** |

**Une seule slice, pas deux**, et la donnée est obligatoire : « un devis reçu attend
ma décision ; un rendez-vous à prendre attend mon geste. Même objet, horloges
opposées. Sans cette info, la moitié de la liste est des lignes que je ne peux pas
traiter, et je cesse de l'ouvrir. »

### 3.5 Le garde-fou — la propriété transverse

| ID | En tant que | Je veux | Afin de | Priorité |
|---|---|---|---|---|
| **US-8** | propriétaire | **que toute échéance manquée remonte une fois** puis se classe | de ne pas avoir un écran de rappels que j'ouvre quand j'ai déjà oublié | **P1** |

**Ce n'est pas une fonctionnalité, c'est une property** — et c'est un arbitrage, pas
un détail d'implémentation : un écran de rappels s'ouvre quand on a déjà oublié, donc
trop tard.

**Et « visible partout » tuerait l'effet.** Le commanditaire l'a formulé avant que je
le propose : « trop de rouge finit par être invisible ». Donc **un seul drapeau**,
faite/pas faite, calculé une seule fois, et une échéance manquée qui **remonte une
fois** puis se classe — *faite tard*, *faite avec accord* — au lieu de répéter tous
les jours.

### 3.6 Ce que je n'ai pas dans les user stories, et pourquoi

- **Aucune gestion multi-locataire au-delà du dossier.** US-4 crée un dossier, et
  l'historique s'y rattache. Pas de « famille », pas de « colocataire », pas de bail
  groupé : 14 appartements, un bail chacun.
- **Aucun inventaire.** Un bien s'usent, et l'inventaire est une corvée qui devient
  une corvée. **Hors scope**, et ce n'est pas un oubli.
- **Aucune carte, aucun plan, aucun itinéraire.** L'adresse est une **donnée du
  bail**, et c'est tout. L'application ne calcule pas de trajet, ne localise pas le
  locataire, et ne sait pas qu'un appartement est « loin ».

---

## 4. Règles métier

| ID | Règle | Justification |
|---|---|---|
| **B1** | **Une écriture n'est jamais annoncée comme enregistrée avant d'avoir été confirmée par le serveur.** | La règle qui domine tout le produit. Le commanditaire : « si je signe un état des lieux dans un sous-sol et que l'application me dit enregistré alors que ce n'est pas parti, ce n'est pas un bug, c'est un contentieux. » |
| **B2** | **Trois mots, jamais deux.** L'interface distingue : *signé ici, pas encore envoyé* · *synchronisé* · *échéance à venir ou manquée*. | « La règle de vocabulaire qui rend le geste possible » : le commanditaire signe sans réseau, sort du sous-sol, et l'envoi se réessaie seul. Si signer exigeait d'attendre une barre, le problème serait **déplacé**, pas résolu. |
| **B3** | **La photo est sur l'appareil avant toute tentative réseau.** Jamais l'inverse. | Dans un sous-sol, la photo d'un dégât est la donnée la plus fragile et la plus irremplaçable du dossier. |
| **B4** | **Une écriture non synchronisée reste lisible et modifiable** jusqu'à sa confirmation. | Le sous-sol dure. Un enregistrement qui disparaît parce que le réseau est tombé est une perte de données, pas un confort perdu. |
| **B5** | **La signature d'un état des lieux n'est valide qu'à la confirmation serveur.** Tant qu'elle n'est pas partie, elle est *signée ici, pas encore envoyée* — et **ne peut pas être présentée comme signée**. | Le commanditaire a tranché entre les deux postures : « (b) est mort : l'appareil n'est pas une preuve, il est volable. » |
| **B6** | **Le compteur de synchronisation est permanent et visible.** Il ne se masque pas quand tout est à jour. | « Un état « pas encore synchronisé » visible en permanence vaut mieux qu'un silence. » |
| **B7** | **Ce qui est constaté est une donnée sur la personne ; ce qui est apprécié est une opinion de travail.** L'appréciation **ne sort d'aucun export, jamais** ; le constaté est exportable et **non effaçable**. | Imposé par le commanditaire comme une **contrainte**, pas une préférence : « si l'outil ne m'oblige pas à trancher entre les deux à l'écriture, je ne veux pas qu'il écrive des notes à ma place. » |
| **B8** | **Toute saisie en texte libre demande sa classe** — constaté ou apprécié — et le défaut ne peut pas être « ce que j'ai lu quelque part ». | Un champ de texte libre est, par construction, un champ où un fait et un jugement se mélangent. Le tri par souvenir est le tri le plus tardif et le plus faux. |
| **B9** | **Trois états de traitement des données, jamais deux :** effacer · anonymiser · conserver pour obligation légale jusqu'à une **date de fin écrite**. | « Si tu me conçois un bouton tout effacer, tu me mets en infraction. » Les baux, quittances et pièces comptables ont une durée légale de conservation. |
| **B10** | **L'export du dossier d'un locataire est produit à la demande, sans qu'on ait à la réclamer, et il est lisible.** | « La demande arrivera pendant un litige, donc au moment où je suis occupé et fais des erreurs, et il y a un délai légal pour répondre. » |
| **B11** | **L'export complet est lisible sans Bailly.** CSV ou Markdown, jamais un format propriétaire. | « Si l'hébergeur meurt demain, je dois pouvoir récupérer mes 14 baux en une journée. » Un export que seul Bailly sait lire n'est pas une sauvegarde : c'est une raison de plus de ne jamais quitter Bailly. |
| **B12** | **Les cinq échéances sont dérivées du bail**, jamais saisies à côté. | La reformulation du commanditaire, qui est meilleure que la mienne : sans ça « dans un mois elles mentent, sans que personne les ait corrigées ». |
| **B13** | **Une échéance manquée remonte une fois, puis se classe** (*faite tard*, *faite avec accord*). Elle ne répète pas tous les jours. | « Trop de rouge finit par être invisible. » Un rappel répété finit par être un bruit, et un bruit est un rappel ignoré. |
| **B14** | **Une demande en attente porte toujours une seule information : qui doit agir.** | Sans elle, « la moitié de la liste est des lignes que je ne peux pas traiter, et je cesse de l'ouvrir ». |
| **B15** | **Ce qui exige une preuve d'envoi — relance, mise en demeure, convocation, accusé — n'est produit qu'en ligne.** Sans réseau, on ne l'envoie pas, et on le verra demain matin. | Acceptable et dit : ce n'est pas un défaut à corriger. C'est la seule chose que l'application ne sait pas faire hors ligne, et elle le dit. |
| **B16** | **Aucune quantité d'argent n'est calculée par l'application.** Elle enregistre ce qui est dû et ce qui a été reçu ; le total est une somme affichée, pas un calcul métier. | Le calcul des charges est hors scope, donc un total calculé par l'application serait un calcul qu'on n'a pas validé. Elle affiche, elle ne décide pas. |
| **B17** | **Aucune donnée d'un locataire n'est pré-remplie depuis une source extérieure.** Tout est saisi ou importé par le bail. | Le bail est **la** source. Une source de plus est une source qui peut diverger, et personne ne saura laquelle. |
| **B18** | **La suppression d'un dossier n'efface pas ce qui relève d'une obligation légale**, et elle ne propose jamais d'effacer l'ensemble. | Conséquence directe de B9 : le bouton n'existe pas, parce que les trois états ne se déclenchent pas au même moment. |

---

## 5. Contraintes

| ID | Contrainte | Origine |
|---|---|---|
| **C1** | **Donnée de référence chez un hébergeur**, jamais sur l'appareil du propriétaire. | « Les sauvegardes deviennent mon boulot, et je ne ferai pas les sauvegardes. » |
| **C2** | **Écriture locale d'abord**, vérifiée, envoyée après. L'inverse est interdit. | B3, C1 |
| **C3** | **Aucun rôle, aucun utilisateur multiple, aucun écran d'administration.** | Un seul utilisateur, par construction |
| **C4** | **L'écran principal doit être utilisable debout**, d'une main, sur un écran de téléphone. | « Je suis dans le sous-sol avec le locataire et on fait l'état des lieux. » |
| **C5** | **Aucun mot de passe à retenir entre deux utilisations.** Un seul secret, saisissable vite. | Le coût d'une clé oubliée dépasse celui d'une clé en plus |
| **C6** | **Les données du locataire sont des données personnelles** : accès, rectification, effacement, portabilité. Le RGPD s'applique intégralement. | B9, B10, B11 |
| **C7** | **L'export complet est lisible sans le logiciel.** | B11 |
| **C8** | **Aucune photo n'est envoyée sans la confirmation qu'elle est partie.** | B1, B3 |
| **C9** | **L'application fonctionne sans réseau pour tout ce qui n'exige pas de preuve d'envoi**, et **le dit** quand ce n'est pas le cas. | B15 |
| **C10** | **Une seule langue, le français.** Une seule monetary, l'euro. | Un propriétaire de 14 appartements à Lyon n'a pas de devises, et pas besoin de traduction |
| **C11** | **L'export porte l'horodatage de sa production**, et l'application le dit. | Un export daté est opposable ; un export non daté est un document sans valeur |

---

## 6. Edge cases

| ID | Situation | Comportement attendu |
|---|---|---|
| **E1** | **Le réseau tombe pendant l'envoi d'une photo.** | L'application ne dit pas « enregistré ». Elle dit *pas encore envoyée*, et **réessaie seule**. La photo reste lisible et modifiable (B4). |
| **E2** | **Le téléphone est volé alors que des écritures ne sont pas parties.** | Les écritures non parties **meurent avec l'appareil**, et l'application le sait : elle ne les a jamais annoncées comme sauvegardées (B1). Aucune donnée ne prétend le contraire. |
| **E3** | **Signature faite, confirmation jamais reçue parce que le réseau ne revient pas.** | L'état reste *signée ici, pas encore envoyée* (B5). Le propriétaire **ne peut pas** la présenter comme signée, et le document le dit à l'écran — pas dans une note. |
| **E4** | **Le propriétaire signe sans réseau et sort du sous-sol.** | Le geste est **possible et complet**. L'envoi se réessaie seul dès que le réseau passe. C'est le cas que B2 existe pour rendre supportable. |
| **E5** | **Un locataire part et demande ses données.** | L'export est produit **à la demande**, lisible, daté, au nom de la personne, et ne contient **que du constaté** (B7, B10). Le bail et les pièces comptables sont **conservés** jusqu'à leur date de fin (B9). |
| **E6** | **Le propriétaire écrit une appréciation et un fait dans le même champ.** | B8 : l'application **demande la classe** avant d'accepter. Il n'y a pas de champ « note » qui mélange les deux. |
| **E7** | **Le propriétaire saisit l appreciated d'un locataire par megarde comme un fait.** | B7 : l'appréciation **n'est jamais exportée**, même par erreur de saisie. Le fait, si. C'est pourquoi la frontière est une property du schéma, pas une discipline. |
| **E8** | **Deux demands de la même personne arrivent le même jour.** | Une seule demande, deux horodatages. Il n'y a pas de doublon parce que rien n'est dédupliqué automatiquement. |
| **E9** | **Un écart de paiement : le locataire a payé, Bailly ne l'a pas enregistré.** | Bailly **ne rapproche rien tout seul** : ce n'est pas une fonction du produit. L'écart est une ligne à traiter, pas une anomalie système. |
| **E10** | **Le propriétaire veut supprimer un dossier pour « faire le ménage ».** | Il n'y a pas de bouton. Les trois états existent (B9), et B18 interdit l'effacement d'ensemble. |
| **E11** | **L'encaissement d'un mois est saisi à moitié, puis abandonné.** | La saisie partielle reste saisissable : elle n'est pas un brouillon caché, c'est du payable saisi. Reprendre le mois est un geste normal, pas une reprise sur incident. |
| **E12** | **Une photo est prise mais la.write échoue (stock plein).** | L'application **le dit avant** de prétendre photographier. Un état des lieux sans photo est un état des lieux **incomplet**, et l'écran le dit. |

---

## 7. Exigences non-fonctionnelles

| ID | Exigence | Pourquoi cette valeur |
|---|---|---|
| **N1** | **Aucune écriture n'est annoncée avant confirmation** — latence cible de l'indicateur de synchronisation < 1 s quand en ligne. | C'est la promesse du produit. Un indicateur lent est un indicateur qu'on ne regarde plus. |
| **N2** | **Le catalogue et la liste s'affichent sans réseau** si les écritures locales existent. | Le sous-sol |
| **N3** | **Targetes tactiles ≥ 44 pt**, utilisables d'une main. | C4 |
| **N4** | **Contraste conforme WCAG AA** sur tout le texte, sans exception ni dérogation. | Un propriétaire de 58 ans qui lit des chiffres à la tombée du jour |
| **N5** | **Taille de police système**, jamais de taille fixe. Le texte suit le réglage. | C4 |
| **N6** | **L'export complet des 14 baux est produit en moins d'une minute.** | B11 : « récupérer mes 14 baux en une journée ». Une minute, c'est mieux ; une journée, c'est le plafond. |
| **N7** | **La reprise après incident part d'une sauvegarde de moins de 24 h**, et l'export complet est rejouable sans le logiciel. | C1 : on ne fait pas les sauvegardes, donc le service les fait, et on doit pouvoir s'en passer. |
| **N8** | **Aucun envoi de donnée personnelle à un service tiers** — pas de analytics, pas de crash reporter tiers, pas de CDN qui journalise. | C6 : l'hébergeur voit déjà les données ; ajouter un tiers n'est pas un choix neutre. |

---

## 8. Risques et inconnues

| ID | Risque | Probabilité | Impact | Signal | Réponse |
|---|---|---|---|---|---|
| **R1** | **Le propriétaire saisit moins qu'il ne le fait aujourd'hui**, parce que l'application est plus lente que sa mémoire. | haute | **le produit entier** | Le nombre de faits saisis par semaine, comparé à la semaine d'avant Bailly | Le MVP est **trois tâches**, pas quatorze écrans. Un écran inutilisé est un écran en moins. |
| **R2** | **Les photos restent sur l'appareil** et le propriétaire le croit parti. | moyenne | **élevée** — un dégât non contestable | Le compteur de synchronisation, et le nombre de photos « pas encore envoyée » après 24 h | B1, B3, C8. Le compteur est **permanent** et l'écran d'accueil dit le nombre. |
| **R3** | **Le propriétaire ne lit pas la différence entre « signé ici » et « synchronisé »** et présente le premier comme le second. | moyenne | **élevée** — contentieux | Un appel d'un locataire sur un état des lieux « signé » | B2, B5 : la distinction est **vocabulaire**, pas icône. « Signé chez moi, pas encore confirmé » est une phrase qu'il peut **répéter au téléphone**. |
| **R4** | **L'hébergeur perd les données.** | faible | **catastrophique** | — | C1, N7, B11 : export rejouable sans le logiciel, sauvegarde de moins de 24 h, et le commanditaire **teste** la reprise avant de lui faire confiance. |
| **R5** | **Le bail est saisi de travers** (dates fausses) et **toutes** les échéances en héritent. | moyenne | **moyenne** | Échéance manquée absente alors qu'elle existe | B12 : les échéances sont dérivées, donc une seule saisie. Le risque est **concentré** sur la saisie du bail, et c'est là qu'il doit être vérifié. |
| **R6** | **Le garde-fou devient un bruit** et le propriétaire cesse de le regarder. | moyenne | **moyenne** | Le nombre de rappels repeated par jour augmente | B13 : une fois, puis classement. Un rappel répété est un rappel ignoré. |
| **R7** | **L'appréciation et le fait se mélangent** malgré B7/B8, parce que le propriétaire écrit ce qu'il pense dans un champ de constaté. | **haute** | **moyenne** — un jugement exporté comme un fait | Un export contenant un jugement | B8 demande la classe à l'écriture. Le risque reste : c'est le comportement humain, pas un défaut du logiciel. |
| **R8** | **Le produit ne survit pas au commanditaire.** | **certaine** à terme | **fort** | — | B11, C7, N6 : l'export complet est **lisible sans Bailly**. Ce n'est pas une fonction de confort, c'est le produit qui survit. |
| **R9** | **Un mot de passe est oublié** et 14 baux deviennent inaccessibles. | faible | **fort** | — | C5 : un seul secret, saisissable vite, et **la reprise passe par l'hébergeur**, pas par un e-mail que le propriétaire n'a pas configuré. |

**Les inconnues, et elles ne sont pas des risques :** elles ne peuvent pas être
mitigées, seulement **rendues visibles**.

| ID | Inconnue | Qui peut répondre |
|---|---|---|
| **Q1** | Les **cinq échéances** qu'il ne doit pas louper. Il les connaît, il ne les a pas nommées. | Le commanditaire |
| **Q2** | La **durée légale de conservation** de chaque catégorie de pièce (bail, quittance, pièce comptable, correspondance). | Le commanditaire, ou un conseil juridique |
| **Q3** | Le **palier d'hébergement** et ce qu'il garantit comme engagement de sauvegarde. | Le commanditaire, après comparaison |
| **Q4** | Le **rythme réel** de l'encaissement :Est-il mensuel pour tous, ou décalé selon les contrats ? | Le commanditaire |

---

## 9. Hors scope (explicitement)

| ID | Exclu | Raison |
|---|---|---|
| **X1** | **Quittance de loyer** | « Une fois par mois, et je la fais encore à la main sans que ça devienne ingérable. » |
| **X2** | **Régularisation des charges** | Annuelle. Et B16 : l'application n'a pas de calcul métier validé. |
| **X3** | **Révision annuelle du loyer** | Annuelle. |
| **X4** | **Fiscalité** | Annuelle, et hors du champ d'un propriétaire particulier. |
| **X5** | **Gestion multi-utilisateurs, rôles, permissions** | Un seul utilisateur, par construction (C3). |
| **X6** | **Plan, carte, itinéraire, géolocalisation** | L'adresse est une donnée du bail, et c'est tout. |
| **X7** | **Inventaire des biens** | Une corvée qui devient une corvée. |
| **X8** | **Comptabilité générale, écritures, plans d'amortissement** | Ni demandé, ni validé, et B16 forbids toute calcul. |
| **X9** | **Assurance, statistics de sinistre, déclaration de sinistre** | Non demandé. |
| **X10** | **Notifications poussées** | Le compteur de synchronisation est permanent (B6) ; une notification est un canal de plus à maintenir, et le rappel d'échéance est une property (US-8), pas un push. |
| **X11** | **Version web de bureau** | C4 : le téléphone d'abord. Le portable sert au travail de fond, et c'est la même application. |
| **X12** | **Signature électronique qualifiée (eIDAS)** | B5 définit ce que « signé » signifie ici. Une signature qualifiée est un autre produit, avec un autre niveau de preuve et un autre coût. **Dit** : ce n'est pas un oubli. |

---

## 10. Critères de succès

**Un seul critère détermine si ce produit existe :**

> **Au bout d'un mois, le propriétaire saisit ses faits le jour même, depuis son
> téléphone, et sait dire si ce qu'il a écrit est parti ou non.**

Il est mesurable sans aucun panneau de bord :

| # | Ce qu'on regarde | Où |
|---|---|---|
| 1 | **Des faits saisis, jour après jour**, pas le même jour en rattrapage | dans Bailly |
| 2 | **Zéro photo « pas encore envoyée » après 24 h** | dans Bailly, l'écran d'accueil |
| 3 | **Le propriétaire peut répondre au téléphone** « c'est saisi chez moi, pas encore confirmé » ou « c'est confirmé », **sans regarder l'application** | en lui demandant, une fois par semaine |
| 4 | **L'encaissement du mois est fait** sans feuille de calcul | en lui demandant |
| 5 | **Un export complet a été produit et lu** par le commanditaire, au moins une fois | en lui demandant |

**Le critère 3 est le plus important et le moins évident.** Il teste B2 directement : si
la distinction « signé ici » / « synchronisé » est dans le **vocabulaire** du
propriétaire et pas seulement dans l'application, la règle tient. Sinon elle n'existe
pas.

**Ce qui n'est pas un critère de succès** : le nombre de fonctionnalités livrées, le
nombre d'écrans, la couverture du catalogue de référence.

---

## 11. Glossaire

| Terme | Définition | Ce que ce n'est **pas** |
|---|---|---|
| **Synchronisé** | L'écriture est **partie** et le serveur l'a confirmée. | Ce n'est pas « enregistré sur l'appareil ». |
| **Signé ici, pas encore envoyé** | L'acte est fait, il n'est **pas** confirmé. Ce n'est **pas** une signature valide (B5). | Ce n'est pas un brouillon : c'est un acte non transmis. |
| **Constaté** | Ce que le propriétaire a observé : payé en retard en mars, la chasse fuyait le 12. | Ce n'est **pas** une appréciation, même écrit dans un champ de constaté. |
| **Apprécié** | L'opinion de travail : fiable, pénible. **Ne sort d'aucun export.** | Ce n'est **pas** une donnée sur la personne. |
| **Échéance** | Une date **dérivée du bail** (B12), jamais saisie à côté. | Ce n'est **pas** un rappel tapé. |
| **Demande** | Une chose qui attend, avec **qui doit agir** (B14). | Ce n'est **pas** un message : un devis et un rendez-vous ont des horloges opposées. |
| **Faits /payer / pièce jointe** | Les **trois** objets que recouvre « saisir ce qui s'est passé ». | Ce n'est **pas** une seule tâche. |

---

## 12. Points à clarifier

| # | Question | Qui peut répondre | Ce qui est bloqué |
|---|---|---|---|
| **Q1** | **Les cinq échéances.** Le commanditaire a dit « un simple rappel pour les cinq échéances que je suis censé ne pas louper », sans les nommer. | le commanditaire | **La slice du garde-fou est le périmètre exact** : on ne sait pas quelles dates afficher |
| **Q2** | **La durée légale de conservation**, par catégorie de pièce. | commanditaire, ou conseil juridique | **B9 n'est pas applicable** : on ne sait pas jusqu'à quand conserver, donc la « date de fin écrite » n'a pas de contenu |
| **Q3** | **Le palier d'hébergement** et son engagement de sauvegarde réel. | commanditaire | **C1, N7** : « moins de 24 h » est une exigence, pas une promesse |
| **Q4** | **Le rythme réel de l'encaissement** : mensuel pour tous, ou décalé selon les contrats ? | commanditaire | **US-5** : l'écran d'encaissement dépend de savoir ce qu'un « mois » recouvre |
| **Q5** | **L.identity document** : un numéro de police, un bail signé par un tiers ? Le bail a-t-il des annexes ? | commanditaire | **US-4** : la pièce jointe du dossier bail est un champ obligatoire ou non |

**Cinq questions, quatre au commanditaire, une peut-être à un juriste.** Aucune ne
remet en cause le périmètre ; toutes le **précisent**. Le PRD est complet sans elles, et
les livrables correspondants ne le sont pas.

---

## Checklist de gate

- [x] Chaque fonctionnalité a une priorité et une justification.
- [x] Les règles métier sont **numérotées** et citables (`B*`).
- [x] Les contraintes sont numérotées et sourcées (`C*`).
- [x] Chaque cas limite a un **comportement attendu**, pas une description (`E*`).
- [x] Les exclusions sont **explicites** et motivées, avec l'identifiant retiré (`X*`).
- [x] Les risques ont un **signal observable**, pas une probabilité fantaisiste.
- [x] Les questions ouvertes ont un **qui peut répondre**.
- [x] Un seul critère de succès principal, mesurable sans tableau de bord.
- [x] Aucun `{{PLACEHOLDER}}` résiduel.
- [x] Le vocabulaire distingue ce qui ressemble à la même chose et ne l'est pas.