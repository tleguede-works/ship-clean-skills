---
type: prd
status: approved
generated_at: 2026-10-01
version: 1
---

# Product Requirements Document — Atelier

> Ce document décrit CE QUE le produit fait, POUR QUI, et POURQUOI.
> Il ne décrit PAS comment il sera implémenté (technologie, architecture, design visuel).
>
> Toute règle métier, edge case et contrainte porte un identifiant stable (B*, E*, C*)
> qui servira de colonne vertébrale à toute la traçabilité du projet.

---

## 1. Résumé exécutif

### 1.1 Problème

Jean-Luc est menuisier, travaille seul, et n'a ni ordinateur ni bureau : il a un téléphone
et une tablette, et il passe une semaine sur deux sur un chantier. Or un devis se fait
devant le client, au moment où il le demande, dans une pièce qui n'a souvent pas de réseau
— une cave, un local technique, un porche. Aujourd'hui, il n'a pas d'outil : il écrit,
il note, il reporte, et il faut un stylo et un support. Un devis écrit à la main sur un
chantier se perd, se recopie, et se transforme en facture par ressaisie — donc en facture
fausse.

### 1.2 Solution

Atelier permet de faire un devis complet sur le téléphone, devant le client, sans réseau
et sans stylo ; de le faire signer au doigt sur l'écran ; de l'envoyer au client ; puis
d'émettre une facture depuis ce devis signé et de relancer une fois si elle n'est pas
réglée. Un devis est écrit sur l'appareil d'abord, et l'envoi est un acte distinct qui a
son propre état visible : rien ne laisse croire qu'un devis est parti quand il est resté
sur le téléphone.

### 1.3 Utilisateurs cibles

Un seul utilisateur : Jean-Luc, 58 ans, menuisier, seul, non spécialiste de l'informatique,
avec un téléphone et une tablette. Il est sur un chantier la moitié de la semaine, souvent
dans un local sans réseau, parfois avec des gants, en lumière faible.

Deux autres figures apparaissent sans être des comptes : le **client**, qui pose sa
signature sur l'écran de Jean-Luc et qui ne doit voir que le devis qu'il signe ; et
**Forge**, seul interlocuteur en cas de panne, qui n'a aucun accès au produit.

### 1.4 Différenciation

Trois différences, chacune opposable à ce qui existe déjà.

- **Le devis se fait sans réseau et se signe au doigt.** Les outils de facturation du
  marché supposent une connexion et un ordinateur : ils commencent par l'écran de connexion.
- **L'écriture et l'envoi sont deux actes séparés, et l'écran le dit.** Aucun autre outil
  ne distingue « enregistré » de « parti », parce que pour lui la distinction n'existe pas.
- **Il n'y a rien à retenir.** Pas de mot de passe, pas de compte, pas de « oublié votre
  mot de passe », pas de reconnexion. Le verrou de l'appareil est le seul verrou.

---

## 2. Utilisateurs et personas

| Persona | Rôle | Contexte | Niveau technique | Besoin principal | Fréquence d'usage |
|---|---|---|---|---|---|
| Jean-Luc | Menuisier, seul, artisan | Chantier la moitié de la semaine ; téléphone en main, devant le client ; locaux sans réseau | Utilisateur everyday, pas spécialiste | Un devis juste devant le client, sans réseau et sans stylo, qui parte et qui se facture | 30 devis par an (hypothèse du contrat § 3) |
| Le client | Signataire, occasionnel | Chez lui ou sur le chantier, devant Jean-Luc ; il ne connaît pas l'application | Aucun | Signer vite, voir le prix, repartir avec un document | Une fois par devis |
| Forge | Support en cas de panne | Par téléphone, sept jours sur sept ; aucun accès au produit | — | Que Jean-Luc ait un seul numéro à appeler et un interlocuteur | Rare |

**Ce que « un seul utilisateur » veut dire ici.** Jean-Luc est le seul lecteur de ses
documents. Il n'y a ni compte à créer pour un tiers, ni rôle, ni permission, ni partage
de dossier. Un client qui pose sa signature n'hérite d'aucun accès : ce qu'il voit est
borné au devis à signer (E5).

---

## 3. User stories

<!-- Priorité : P1 (doit avoir), P2 (devrait avoir), P3 (pourrait avoir), P4 (pas maintenant) -->

**Sur les priorités.** Les sept tranches du contrat § 1 sont livrées. `P1` signifie « avant
que la première tranche ne soit utilisable », `P2` signifie « après ». Aucune story n'est
`P3` ou `P4` : le contrat a déjà tranché, et retirer une tranche promise serait une
contradiction, pas une priorisation.

### US-1 : Faire un devis devant le client, sans réseau ni stylo

- **En tant que** Jean-Luc, menuisier, sur un chantier
- **Je veux** faire un devis sur mon téléphone, devant le client, dans un local sans réseau
- **Afin de** que le client reparte avec un prix écrit pendant qu'il est encore là

**Priorité** : P1
**Dépendances** : aucune

**Critères d'acceptation** :
- [ ] Un devis complet (client, une ligne de travaux, total) se saisit et s'affiche intégralement avec le mode avion actif.
- [ ] Aucune action de la création n'affiche d'erreur causée par l'absence de réseau.
- [ ] Le devis porte un identifiant unique, une date, le nom du client et un total.
- [ ] Après fermeture et réouverture, le devis retrouvé est identique, ligne pour ligne et au total près.

### US-2 : Faire signer le devis sur l'écran, sans stylo

- **En tant que** Jean-Luc
- **Je veux** que le client signe le devis au doigt, sur l'écran, en ma présence
- **Afin de** n'avoir ni papier à reporter, ni stylo à porter

**Priorité** : P1
**Dépendances** : US-1

**Critères d'acceptation** :
- [ ] La signature se trace au doigt et s'enregistre avec la date, l'heure et l'empreinte du texte exact du devis.
- [ ] Un devis signé ne peut plus être envoyé sans être resigné.
- [ ] Un devis non signé ne peut pas être envoyé ni partagé en PDF.
- [ ] L'écran de signature ne donne accès à aucun autre document.

### US-3 : Envoyer le devis, et savoir s'il est vraiment parti

- **En tant que** Jean-Luc
- **Je veux** envoyer le devis au client par courriel et savoir, sans l'ouvrir, s'il est parti
- **Afin de** ne pas croire qu'un client a reçu un devis resté sur mon téléphone

**Priorité** : P1
**Dépendances** : US-2

**Critères d'acceptation** :
- [ ] Un devis enregistré affiche l'état `écrit ici, pas encore envoyé`.
- [ ] L'état `envoyé par courriel` n'apparaît qu'après confirmation de l'envoi par le service de courriel.
- [ ] Un échec d'envoi laisse le devis à `écrit ici, pas encore envoyé` et propose de réessayer.
- [ ] Deux appuis sur l'action d'envoi ne produisent qu'un courriel.

### US-4 : Partager le devis en PDF quand le chantier n'a pas de réseau

- **En tant que** Jean-Luc
- **Je veux** partager le devis signé en PDF quand aucun réseau n'est disponible
- **Afin de** que le client ait le document sans que je revienne au bureau

**Priorité** : P1
**Dépendances** : US-2

**Critères d'acceptation** :
- [ ] Le partage produit un PDF du devis signé, complet et lisible hors ligne.
- [ ] Le devis passe à `parti en PDF partagé`, avec la date déclarée par Jean-Luc, et l'écran dit que cette date n'est pas confirmée.
- [ ] Un devis partagé en PDF n'est jamais affiché `envoyé par courriel`.

### US-5 : Ouvrir l'application sans mot de passe

- **En tant que** Jean-Luc
- **Je veux** ouvrir l'application sans saisir de mot de passe
- **Afin de** ne pas avoir un secret à retenir sur un chantier

**Priorité** : P1
**Dépendances** : aucune

**Critères d'acceptation** :
- [ ] Aucune action de l'application ne demande un mot de passe, un code ni une réponse à une question secrète.
- [ ] Après déverrouillage de l'appareil, l'application s'ouvre sur l'écran d'accueil.
- [ ] Il n'existe aucun écran de gestion de compte ni de mot de passe oublié.

### US-6 : Voir ce qui n'est pas encore sorti

- **En tant que** Jean-Luc
- **Je veux** voir d'un coup d'œil combien de devis sont écrits et pas encore envoyés
- **Afin de** ne pas perdre un devis dans la pile de ceux que je n'ai pas envoyés

**Priorité** : P1
**Dépendances** : US-1

**Critères d'acceptation** :
- [ ] L'écran d'accueil affiche le nombre exact de devis écrits ici et pas encore envoyés.
- [ ] Ce nombre baisse immédiatement après l'envoi confirmé d'un devis.
- [ ] Jean-Luc peut partager en un geste l'ensemble des devis écrits et non envoyés.

### US-7 : Suivre les devis sans les ouvrir un par un

- **En tant que** Jean-Luc
- **Je veux** voir d'un regard quels devis sont partis, lesquels sont signés et lesquels expirent
- **Afin de** savoir où j'en suis sans perdre de temps

**Priorité** : P1
**Dépendances** : US-1

**Critères d'acceptation** :
- [ ] La liste affiche l'état de sortie et l'état de signature de chaque devis, sans sélection.
- [ ] Jean-Luc voit séparément les devis partis, les devis signés, et ceux dont la validité approche ou est dépassée.

### US-8 : Être prévenu avant qu'un devis n'expire, et décider quoi faire

- **En tant que** Jean-Luc
- **Je veux** être prévenu à la fin de la validité d'un devis et choisir quoi faire
- **Afin de** qu'aucun prix ne soit prolongé ou modifié à ma place

**Priorité** : P2
**Dépendances** : US-7

**Critères d'acceptation** :
- [ ] La durée de validité est choisie avant le premier envoi : 15, 30 ou 60 jours, 30 jours par défaut.
- [ ] Au terme de la durée, le devis passe à `expiré` et l'application propose prolonger, faire ressigner ou refuser.
- [ ] Aucune des trois issues n'est appliquée seule : aucun prix n'est modifié, aucune signature n'est produite.
- [ ] Un changement de durée ne s'applique qu'aux devis écrits après le changement.

### US-9 : Émettre une facture depuis un devis signé

- **En tant que** Jean-Luc
- **Je veux** émettre une facture à partir d'un devis déjà signé
- **Afin de** ne pas ressaisir un travail déjà fait et déjà vendu

**Priorité** : P2
**Dépendances** : US-2

**Critères d'acceptation** :
- [ ] La facture reprend le client, les lignes et le total du devis sans modification.
- [ ] Le numéro de la facture est unique et n'est jamais réutilisé, pas même par une facture annulée.
- [ ] La facture porte l'intégralité des mentions obligatoires, sans que Jean-Luc les saisisse.
- [ ] Aucune facture ne peut être émise tant que la question « assujetti à la TVA » n'est pas tranchée.

### US-10 : Relancer une facture, une seule fois

- **En tant que** Jean-Luc
- **Je veux** qu'une facture non réglée à son échéance déclenche une relance
- **Afin de** être payé sans relancer moi-même et sans insister

**Priorité** : P2
**Dépendances** : US-9

**Critères d'acceptation** :
- [ ] Une facture dont le délai de paiement est dépassé déclenche au plus une relance par courriel.
- [ ] La même facture n'est pas relancée deux fois pour la même échéance.
- [ ] La relance cite le numéro de la facture et le montant dû.

### US-11 : Retrouver le dossier d'un client par son nom

- **En tant que** Jean-Luc
- **Je veux** retrouver tous les devis et toutes les factures d'un client à partir de son nom
- **Afin de** répondre à sa question en deux minutes, devant lui

**Priorité** : P2
**Dépendances** : US-7

**Critères d'acceptation** :
- [ ] Une recherche par nom ouvre un dossier contenant tous les devis et toutes les factures de ce client.
- [ ] Deux clients qui portent le même nom ne sont pas confondus : l'application demande lequel.
- [ ] Le dossier distingue ce qui est parti de ce qui n'est pas sorti.

### US-12 : Tout télécharger, à tout moment, sans rien payer

- **En tant que** Jean-Luc
- **Je veux** télécharger tous mes devis et toutes mes factures en un seul fichier
- **Afin de** ne jamais être enfermé dans une application, quel qu'en soit le prix

**Priorité** : P2
**Dépendances** : US-11

**Critères d'acceptation** :
- [ ] L'export est disponible en permanence, sans frais et sans abonnement.
- [ ] Le fichier contient les factures avec leurs mentions complètes, lisibles hors ligne.

### US-13 : Faire un devis long sur un écran de téléphone

- **En tant que** Jean-Luc
- **Je veux** saisir un devis de douze lignes sur mon téléphone, d'une seule main
- **Afin de** chiffrer une cuisine ou une salle de bain sans changer d'appareil

**Priorité** : P2
**Dépendances** : US-1

**Critères d'acceptation** :
- [ ] La saisie d'un devis de douze lignes ne demande aucun défilement horizontal.
- [ ] Le total reste visible pendant la saisie d'une ligne.
- [ ] Un appel entrant au milieu de la saisie ne fait pas perdre ce qui est déjà saisi.

### US-14 : Tendre la tablette au client sans lui ouvrir les dossiers

- **En tant que** Jean-Luc
- **Je veux** que le client puisse signer sans voir mes autres clients
- **Afin de** de ne pas exposer mes devis devant lui

**Priorité** : P2
**Dépendances** : US-2

**Critères d'acceptation** :
- [ ] L'écran de signature n'ouvre aucun autre document et ne donne pas accès à la liste des devis.
- [ ] Aucune navigation ne permet au client de revenir vers un dossier.

---

## 4. Règles métier

<!-- Une ligne par règle. IDs B1, B2, B3... jamais réutilisés. -->

### 4.1 Ce qu'est un devis

| ID | Règle | User story liée | Notes |
|---|---|---|---|
| B1 | Un devis porte un identifiant unique, une date, le nom du client et au moins une ligne de travaux. Un devis sans ces quatre éléments ne peut pas être enregistré. | US-1 | L'identifiant est définitif : il n'est ni réattribué ni réutilisé. |
| B2 | Chaque ligne porte une quantité, un prix unitaire et un montant. Le total du devis est la somme des lignes, en euros, à deux décimales au plus. | US-1, US-13 | Une ligne à prix zéro est conservée (E13). Un devis de douze lignes est un devis ordinaire, pas un cas particulier (US-13). |
| B3 | Le total affiché, le total imprimé et le total couvert par la signature sont le même nombre. Aucun autre total n'est montré à côté. | US-1, US-2 | Un total différent du total signé est un document qui ment sur son prix. |

### 4.2 L'écriture locale d'abord, et la sortie

| ID | Règle | User story liée | Notes |
|---|---|---|---|
| B4 | Un devis, une signature et une facture sont écrits sur l'appareil avant toute action vers l'extérieur. Une coupure de réseau pendant la saisie ne perd aucune donnée déjà saisie. | US-1 | C1. C'est la règle qui permet à US-1 de tenir dans une cave. |
| B5 | Un devis porte un état de sortie qui est l'un de : `écrit ici, pas encore envoyé`, `envoyé par courriel`, `parti en PDF partagé`. L'état ne change que sur une action explicite de Jean-Luc. | US-3, US-4 | Le temps qui passe ne change pas l'état. |
| B6 | L'état `envoyé par courriel` ne s'affiche qu'après confirmation de l'envoi par le service de courriel. Un envoi échoué laisse le devis à `écrit ici, pas encore envoyé`. | US-3 | **La règle centrale du produit.** L'écran ne dit jamais « envoyé » avant la confirmation. |
| B7 | Un devis n'est envoyé qu'une fois par action : un second appui n'envoie pas un second courriel et ne crée pas de doublon. | US-3 | E4. Un doublon chez un client se corrige mal. |
| B8 | Le partage en PDF est une sortie distincte de l'envoi par courriel. Il porte la date que Jean-Luc déclare, et l'écran dit que cette date est déclarée et non confirmée. | US-4 | Un partage en PDF passe à `parti en PDF partagé` et jamais à `envoyé par courriel` : rien ne confirme un partage. |

### 4.3 La signature

| ID | Règle | User story liée | Notes |
|---|---|---|---|
| B9 | Un devis est signé avant de sortir : un devis non signé ne peut être ni envoyé ni partagé en PDF. | US-2, US-4 | Ordre du contrat § 1 : devis, signature, envoi. |
| B10 | La signature est tracée au doigt sur l'appareil, en présence du client. Elle enregistre la date, l'heure et l'empreinte du texte exact du devis. | US-2 | C3. Coût 0 € ; une signature qualifiée coûterait 1 à 3 € par devis. |
| B11 | Modifier le devis après sa signature annule la signature : le devis repasse à non signé et ne peut pas ressortir tant qu'il n'est pas resigné. L'écran le dit dès la première modification. | US-2, US-14 | E6, E17. Sans cela, la signature ne prouve plus rien : elle prouverait qu'un autre texte a été signé. |

### 4.4 La validité du devis

| ID | Règle | User story liée | Notes |
|---|---|---|---|
| B12 | Un devis porte une durée de validité choisie par Jean-Luc parmi 15, 30 et 60 jours, 30 jours par défaut, fixée avant le premier envoi. Elle court à compter de la date écrite sur le devis ; cette date ne change pas si le devis sort plus tard. Un changement de durée ne s'applique qu'aux devis écrits après le changement. | US-8 | Contrat § 5. La date portée sur le document est celle qui compte : la faire bouger au moment de l'envoi rendrait la validité invérifiable. |
| B13 | Au terme de la durée, le devis passe à `expiré` et l'application demande à Jean-Luc de choisir : prolonger, faire ressigner, refuser. Elle ne prolonge pas seule, ne modifie aucun prix et ne signe rien à la place de Jean-Luc. | US-8 | Contrat § 5 : « elle ne signe rien à sa place et ne change aucun prix seule ». |

### 4.5 La facture

| ID | Règle | User story liée | Notes |
|---|---|---|---|
| B14 | Une facture est créée depuis un devis signé et reprend le client, les lignes et le total du devis sans modification. Un montant qui change exige un nouveau devis, à signer. | US-9 | **Choix à confirmer** — § 12. Q-004 est ouverte : le contrat dit la source de la facture, pas l'égalité des montants. |
| B15 | Chaque facture porte un numéro unique, jamais réutilisé, pas même par une facture annulée. | US-9 | Contrat § 5 : « numéro de facture qui ne se répète jamais ». |
| B16 | L'application écrit seule les mentions obligatoires de la facture : nom, adresse et SIRET de Jean-Luc ; numéro de TVA, ou la mention « non assujetti à la TVA » ; date ; numéro de facture ; détail en quantité et prix unitaire ; TVA et total ; au-delà du délai de paiement, la date limite, le taux d'intérêt et les 40 € de frais de recouvrement. Jean-Luc n'a rien à saisir pour ces mentions. | US-9, US-12 | C4. Sans ces mentions, Jean-Luc ne peut pas faire payer un client qui refuse. Cinq champs sont encore `[à compléter]` dans le contrat : sans eux, l'émission est bloquée. |
| B17 | La fiscalité se règle par une seule question, posée avant la première facture : Jean-Luc est-il assujetti à la TVA ? La réponse vaut pour tous les documents et n'est jamais déduite d'un document existant. | US-9 | C5. Une réponse déduite d'un devis est une réponse inventée, et elle engage toute la facturation. |
| B18 | Le délai de paiement est saisi par Jean-Luc sur la facture et figure sur la facture. | US-9, US-10 | C4 dépend de cette valeur : c'est lui qui sépare « facture exigible » de « facture en retard ». |
| B19 | Une facture émise n'est ni modifiée ni supprimée. Une correction est une nouvelle facture, qui cite le numéro de la facture qu'elle corrige. | US-9 | Une facture corrigée sur place ne prouve plus ce qu'elle prouvait le jour de l'envoi. |

### 4.6 La relance

| ID | Règle | User story liée | Notes |
|---|---|---|---|
| B20 | Une facture non réglée au terme de son délai de paiement fait l'objet d'au plus une relance par courriel, et une seule fois par échéance manquée. La même facture n'est pas relancée deux fois pour la même échéance. | US-10 | Contrat § 1. Le jour de la relance n'est pas fixé par le contrat — § 12. |

### 4.7 Le dossier, l'accès, la sortie de secours

| ID | Règle | User story liée | Notes |
|---|---|---|---|
| B21 | Un dossier client regroupe tous les devis et toutes les factures de ce client, trouvables par le nom du client. | US-11 | Contrat § 1, tranche Dossier. |
| B22 | Aucune action de l'application ne demande un mot de passe, un code, ni une réponse à une question secrète. L'application s'ouvre après déverrouillage de l'appareil, et rien d'autre. Il n'existe ni gestion de compte, ni « mot de passe oublié ». | US-5 | C2. Une contrainte, pas une absence d'ambition : un homme seul, un téléphone. |
| B23 | Le nombre de devis écrits ici et pas encore envoyés est affiché en permanence à l'écran d'accueil, et il est exact. | US-6 | C1. Ce compteur est la seule mesure de la perte possible : un devis non envoyé n'existe que sur l'appareil (E10). |
| B24 | Jean-Luc peut télécharger tous ses devis et toutes ses factures en un seul fichier, à tout moment, sans rien payer. | US-12 | Engagement du contrat § 3 : c'est ce qui rend la promesse de pouvoir partir crédible. |

### 4.8 Le suivi

| ID | Règle | User story liée | Notes |
|---|---|---|---|
| B25 | Sans ouvrir un devis, Jean-Luc voit son état de sortie, son état de signature et, si sa validité est dépassée, l'indication que cette validité est finie. | US-7 | Contrat § 1, tranche Suivi : « Jean-Luc voit quels devis sont partis, lesquels sont signés, lesquels expirent ». |
| B26 | Jean-Luc voit séparément les devis partis, les devis signés, et ceux dont la validité approche ou est dépassée. | US-7 | Les trois groupes sont toujours affichés, y compris quand ils sont vides : une liste vide ne doit pas ressembler à une panne. |

---

## 5. Contraintes

<!-- Une ligne par contrainte. IDs C1, C2, C3... -->

| ID | Contrainte | Type | Impact |
|---|---|---|---|
| C1 | La première tranche se fait sans réseau. Une cave, un local technique et un porche n'ont pas de couverture, et le client attend. | métier | Aucune action de la boucle principale — saisir, chiffrer, signer, enregistrer, consulter — ne suppose la connexion. Seule la sortie du devis en dépend. |
| C2 | Un seul utilisateur, un seul secret : pas de mot de passe, pas de compte, pas de récupération, pas de rôle, pas de permission, pas d'équipe. | métier | Pas d'écran de connexion, pas d'inscription, pas de partage. Le planning, la main d'œuvre et les équipes sont hors périmètre : un outil à plusieurs utilisateurs est un produit pour quelqu'un d'autre. |
| C3 | La signature du devis est tracée, au doigt sur l'appareil, avec la date, l'heure et l'empreinte du document. La signature qualifiée est exclue. | métier | Coût 0 € par devis. La signature qualifiée coûterait 1 à 3 € par devis, soit 30 à 90 € par an pour 30 devis, et elle n'est pas exigée pour un devis. |
| C4 | Les mentions obligatoires de la facture sont imposées par la loi et l'application les écrit seule : nom, adresse, SIRET ; numéro de TVA ou mention « non assujetti à la TVA » ; date ; numéro unique ; détail en quantité et prix unitaire ; TVA et total ; au-delà du délai de paiement, date limite, taux d'intérêt et 40 € de frais de recouvrement. | légale | Sans elles, Jean-Luc ne peut pas faire payer un client qui refuse. Elles ne sont pas saisies par Jean-Luc, donc elles ne peuvent pas manquer. |
| C5 | Une seule question engage la fiscalité : Jean-Luc est-il assujetti à la TVA ? Forge la vérifie avec lui avant la première facture. | légale | Aucune facture ne peut être émise avant la réponse. L'application ne choisit pas, et ne déduit rien d'un document existant. |
| C6 | Les factures sont conservées 10 ans, les devis 2 ans, les sauvegardes 30 jours. L'export de tout est possible en permanence, sans frais. | légale | Le produit ne peut pas proposer de « nettoyer » les factures, et ne peut pas rendre l'export payant. |
| C7 | Hors périmètre métier : ni comptabilité, ni stock de fournitures, ni catalogue produits. | métier | Le logiciel lui fabriquerait un travail qu'il n'a pas demandé. Le stock n'a qu'une source de vérité utile : ce que le devis a dit. |
| C8 | Aucun encaissement par carte et aucun prestataire de paiement, jamais d'office. | budget | Un prestataire coûte 1,8 % + 0,25 € **sur chaque facture** : environ 2 708 € par an sur 30 factures de 5 000 €, contre 95,88 € pour tout le reste du contrat. L'exclusion ne se rouvre que sur demande écrite de Jean-Luc, et le coût est alors annoncé en euros. |
| C9 | Ni envoi de SMS, ni gestion des appels clients. | budget | Le courriel suffit, et le prix du devis est envoyé une fois. Le SMS coûte par message ; un téléphone ne se gère pas depuis une application. |
| C10 | Le budget est plafonné et le départ doit rester possible : 95,88 € la première année, 71,88 € les suivantes, prélevés le 5 de chaque mois ; rien d'autre à payer tant que Jean-Luc reste en virement et en signature tracée. Préavis de fermeture de 30 jours, pas de renouvellement automatique. | budget | Toute fonction qui ajoute un coût récurrent par document est hors périmètre : c'est la raison pour laquelle C8 et C9 ne se rouvrent pas d'office. |
| C11 | Hébergement en France ou dans l'Union européenne, chez l'hébergeur de Forge, et expéditeur de courriels : deux acteurs, pas un de plus. | technique | Ni régie publicitaire, ni mesure d'audience tierce, ni partage à un réseau social, ni envoi de données à un tiers. Le nom de domaine en `.fr` est l'adresse que les clients ont dans leurs courriels et ne change pas si Forge change de service. |

---

## 6. Edge cases

<!-- Une ligne par edge case. IDs E1, E2, E3... -->

| ID | Cas | Déclencheur | Comportement attendu | Sévérité |
|---|---|---|---|---|
| E1 | Le devis se fait dans une cave, sans réseau | Absence de couverture au moment où le client demande son prix | La saisie, le total et la signature se font entièrement. La seule sortie reste en attente, à l'état `écrit ici, pas encore envoyé`. Rien n'est perdu. | critical |
| E2 | Le réseau tombe au milieu de la saisie | Coupure pendant que Jean-Luc écrit une ligne | Les données déjà saisies restent affichées et le devis est retrouvable à l'identique après réouverture. | high |
| E3 | Le réseau tombe après l'envoi, avant la confirmation | Coupure entre l'envoi et la confirmation du service de courriel | Le devis reste à `écrit ici, pas encore envoyé`. L'écran ne dit jamais « envoyé ». Un nouvel essai n'envoie pas de second courriel au client. | critical |
| E4 | Jean-Luc appuie deux fois sur envoyer | Appui répété, ou doubt après le premier appui | Un seul courriel part. Le second appui ne fait rien et ne crée pas de second envoi. | high |
| E5 | Le client regarde l'écran pendant qu'il signe | Jean-Luc tend sa tablette ou son téléphone au client | Le client ne voit que le devis à signer : ni la liste des devis, ni le dossier d'un autre client, ni aucun autre document. | high |
| E6 | Jean-Luc reprend une ligne après la signature pour corriger un prix | Erreur de saisie découverte après la signature du client | La signature est annulée immédiatement, l'écran indique « à resigner », et le devis ne peut pas ressortir avant une nouvelle signature. | high |
| E7 | Le client refuse de signer | Le client ne veut pas ou ne peut pas signer devant Jean-Luc | Le devis reste à la fois `écrit ici, pas encore envoyé` et non signé. Il n'est envoyé à personne et rien n'est signé. | medium |
| E8 | La validité se termine et Jean-Luc ne répond pas | Ouverture de l'application après le terme de la durée | Le devis reste `expiré`, l'application le dit à chaque ouverture et repose la question. Elle ne le prolonge pas, ne modifie aucun prix et ne signe rien. | high |
| E9 | Une facture passe son délai de paiement sans être réglée | Échéance dépassée | La facture affiche la date limite, le taux d'intérêt et les 40 € de frais de recouvrement, et une relance a été envoyée une seule fois. | high |
| E10 | L'appareil est perdu ou volé avec des devis écrits et non envoyés | Perte physique avant envoi | Ces devis sont perdus avec l'appareil : il n'existe aucun second exemplaire. Le produit ne peut pas le promettre, donc il affiche en permanence le nombre de devis écrits et non envoyés (B23) et permet de les partager en un geste. | critical |
| E11 | Jean-Luc change d'appareil | Nouveau téléphone ou nouvelle tablette | Les documents déjà sortis et toutes les factures sont retrouvés par un lien reçu à son adresse, sans mot de passe. Les devis écrits ici et non envoyés restent sur l'ancien appareil et ne sont pas transférés. | high |
| E12 | Le client change d'adresse entre le devis et la facture | Le client a déménagé ou changé de numéro | L'adresse de facturation est celle du dossier client. Jean-Luc la modifie une fois dans le dossier, et les documents suivants utilisent la version à jour, sans ressaisie. | medium |
| E13 | Une ligne est à prix zéro | Déplacement offert, main d'œuvre incluse, garantie | La ligne est conservée, affichée dans le détail et ne fausse pas le total. | low |
| E14 | Deux devis pour le même client le même jour | Deux visites, deux demandes | Les deux existent, avec deux identifiants distincts. Le dossier du client les regroupe et ne les confond pas. | medium |
| E15 | Un devis est écrit puis jamais envoyé, et Jean-Luc le retrouve trois semaines plus tard | Devis laissé à l'état `écrit ici, pas encore envoyé` | Il est dans la liste, à son état exact, avec sa date. S'il est envoyé plus tard, sa durée de validité court toujours depuis la date écrite sur le devis. | medium |
| E16 | La question « assujetti à la TVA » n'est pas tranchée | Avant la première facture | Aucune facture ne peut être émise. L'application ne choisit pas à la place de Jean-Luc et ne se sert pas d'un devis existant pour décider. Le blocage est explicite. | critical |
| E17 | L'écran de signature est interrompu | Appel entrant, batterie vide, application fermée | La signature commencée n'est pas enregistrée comme signée. Le devis reste non signé et rien n'est envoyé. | high |
| E18 | Une facture émise depuis plus de 30 jours doit être corrigée | Erreur sur une facture déjà partie | La facture d'origine reste émise et inchangée. La correction est une nouvelle facture, avec son propre numéro, qui cite le numéro corrigé. | medium |

---

## 7. Exigences non-fonctionnelles

### 7.1 Performance et ergonomie

- La boucle complète, de la première ligne à la signature, se fait sur un téléphone tenu d'une main, sans aucun défilement horizontal. Le contrat § 1 dit « sur le téléphone » : la tablette n'est pas requise pour la première tranche.
- Le total du devis reste visible pendant la saisie d'une ligne.
- Un devis écrit hors réseau s'ouvre et s'affiche sans attendre le réseau.
- Un devis écrit hors réseau peut être envoyé sans être ressaisi ni rouvert, dès que le réseau est disponible.
- Une action principale ne demande jamais plus de trois gestes depuis l'écran d'accueil.

### 7.2 Sécurité et confidentialité

- Le seul verrou est celui de l'appareil (B22, C2). Le produit n'ajoute pas de deuxième serrure.
- Les devis et les factures sont hébergés en France ou dans l'Union européenne, et ne sortent pas de l'hébergeur de Forge et de l'expéditeur de courriels (C11).
- Les données écrites sur l'appareil ne peuvent pas être effacées par le système sans que Jean-Luc en soit informé : un magasin que le système peut vider à sa guise ne tient pas un devis.
- Un devis signé est conservé avec l'empreinte de son texte : la signature reste rattachée à ce texte, et non à une image détachée.
- Les factures sont conservées 10 ans et ne sont jamais purgées ; les devis, 2 ans ; les sauvegardes, 30 jours. L'export est permanent et gratuit (C6, B24).

### 7.3 Accessibilité

Jean-Luc a 58 ans, travaille parfois avec des gants, en pleine lumière du jour ou dans un local sombre. Ces exigences sont mesurables.

- Le texte et les montants restent lisibles en plein soleil comme en pénombre.
- Les zones tactiles principales font au moins 48 pixels de côté, utilisables avec un gant.
- Aucune action n'est accessible par un seul geste sans bouton visible.
- L'application suit la taille de texte réglée par le système sans tronquer un montant ni masquer le total.
- La signature se trace au doigt, sans curseur de précision à viser.

### 7.4 Internationalisation

- Le produit est français : interface, documents, montants en euros, dates au format français.
- Aucun autre pays, aucune autre langue, aucune autre devise. Ce n'est pas un défaut d'ambition : c'est la taille du marché, et une langue de plus ne serait pas utilisée par Jean-Luc.

### 7.5 Disponibilité et résilience

- Trente jours de préavis avant toute fermeture, et l'application reste utilisable un mois après la fin du préavis.
- Pendant ce mois, Jean-Luc peut tout télécharger. Après, il ne perd pas ses documents : il ne les a plus sous la main.
- Après la première année, résiliable en un mois, sans renouvellement automatique.
- Aucune écriture ne dépend du réseau : une coupure ne perd rien.
- L'envoi est le seul acte qui dépend du réseau, et son échec est visible sans masquer la donnée ni la faire disparaître.

---

## 8. Risques et inconnues

| Risque | Probabilité | Impact | Mitigation |
|---|---|---|---|
| L'identité légale de l'émetteur est inconnue : le contrat porte `[à compléter]` pour le SIRET de Jean-Luc, la raison sociale de Forge, son adresse, son téléphone et son courriel | HIGH | HIGH | Aucune facture n'est émise tant que ces cinq champs manquent ; le blocage porte sur l'émission, pas sur le fonctionnement (B16, E16). À lever avant la première facture. |
| Le téléphone est perdu ou volé avec des devis écrits et non envoyés | MEDIUM | HIGH | Le compteur permanent (B23) et le partage en un geste (US-6). Aucune sauvegarde ne remplace un appareil perdu : le dire ne suffit pas, il faut le compteur. |
| Le client tendu à la signature parcourt les dossiers de Jean-Luc | MEDIUM | HIGH | L'écran de signature n'ouvre aucun autre document (B9, E5). C'est une exigence de conception, pas une préférence. |
| La question sur la TVA traîne, et Jean-Luc ne peut plus facturer | MEDIUM | HIGH | La question est bloquante et explicite avant la première facture (C5, E16), jamais tranchée par défaut. |
| Le volume réel dépasse les 30 devis par an sur lesquels le contrat calcule tout (quota courriel à 3 000 envois, budget, nombre de relances) | LOW | MEDIUM | À 30 devis par mois, la limite gratuite est atteinte en trois ans et le surplus coûte 20 €/mois. Le volume est une inconnue à mesurer pendant la première année, avant qu'elle ne se termine. |
| La signature tracée laisse à Jean-Luc la charge de prouver qu'il s'agit bien de son client le jour d'un litige | MEDIUM | MEDIUM | Le contrat l'écrit et chiffre la qualifiée à 1 à 3 € par devis. L'empreinte du texte exact est conservée : la signature est liée au devis, pas à une image seule. |
| Jean-Luc ne répond pas à l'une des cinq décisions du contrat dans les délais | LOW | MEDIUM | Le contrat applique l'option recommandée et l'écrit. L'option recommandée sur la signature est tracée, à 0 € : le risque financier est nul. |
| Les envois s'accumulent sur un chantier sans réseau et Jean-Luc oublie de les envoyer | HIGH | MEDIUM | Le compteur permanent (B23) et la liste qui affiche l'état exact de chaque devis (B25) : un devis non envoyé est visible comme tel, pas noyé dans une liste. |

### Inconnues

- ⚠️ Le volume réel de devis par mois et au pire moment de l'année (Q-003). Le contrat calcule l'hébergement, le quota de courriels, le budget et le nombre de relances sur 30 devis par an. Personne ne l'a mesuré.
- ⚠️ Le taux de TVA applicable aux travaux de menuiserie si Jean-Luc est assujetti (Q-006), et l'existence de travaux à taux réduit dans son activité. La règle B17 règle la question « assujetti ou non », pas le taux.
- ⚠️ Si Jean-Luc fait signer le client sur son appareil, ou s'il dessine lui-même après un accord oral (Q-002). Le mode de signature est tranché par C3 et B10 ; le geste ne l'est pas.
- ⚠️ Le délai de paiement que Jean-Luc accorde à ses clients. B18 le rend obligatoire sur chaque facture, mais aucune valeur n'est proposée : c'est une donnée de Jean-Luc, pas une décision de Forge.

---

## 9. Hors scope (explicitement)

- Multi-utilisateur, rôles, permissions, partage de dossier, planning, main d'œuvre, équipes — raison : Jean-Luc est seul. Un outil à plusieurs utilisateurs est un produit pour quelqu'un d'autre. Réexamen : jamais.
- Comptabilité, stock de fournitures, catalogue produits — raison : le logiciel lui fabriquerait un travail qu'il n'a pas demandé, et le stock n'a qu'une source de vérité utile, ce que le devis a dit. Réexamen : la comptabilité, plus tard et seulement si Jean-Luc le demande, rien n'est acquis ; le stock et le catalogue, jamais.
- Encaissement par carte et prestataire de paiement — raison : 1,8 % + 0,25 € sur **chaque** facture, soit environ 2 708 € par an sur 30 factures de 5 000 €, vingt-huit fois le reste du contrat. Forge n'installe aucun prestataire sans accord écrit de Jean-Luc, jamais d'office. Réexamen : sur demande écrite, et le coût est annoncé en euros sur chaque facture, pas dans une note de bas de page.
- Signature qualifiée — raison : 1 à 3 € par devis signé, soit 30 à 90 € par an pour 30 devis, et elle n'est pas exigée pour un devis. La signature tracée suffit et coûte 0 €. Réexamen : jamais pour un devis.
- Envoi de SMS et gestion des appels clients — raison : le courriel suffit, le prix du devis est envoyé une fois, le SMS coûte par message, et un téléphone ne se gère pas depuis une application. Réexamen : jamais.
- Régie publicitaire, mesure d'audience tierce, partage à un réseau social — raison : aucune donnée de Jean-Luc ne part chez un tiers en dehors de l'hébergeur et de l'expéditeur de courriels. Réexamen : jamais.


<!-- Ces six exclusions répètent, en polarité opposée, des contraintes déjà vives en § 5 : C2, C3, C7, C8, C9 et C11. Elles sont donc écrites **sans ID** — un ID ne vit qu'à un seul endroit, sinon tout ce qui le cite devient ambigu. -->

---

## 10. Critères de succès

Comment saura-t-on que le produit a atteint son but. Chaque critère est vérifiable par un test ou par un document, pas par une impression.

- Aucun devis écrit n'est perdu : une coupure de réseau en pleine saisie ne fait pas disparaître le devis, et la démonstration se fait sur un appareil réel en mode hors ligne.
- Aucun devis n'est affiché « envoyé » sans confirmation du service de courriel : le test échoue si ce défaut est réintroduit.
- Aucun devis ne sort sans signature tracée, horodatée et liée à l'empreinte de son texte.
- Chaque facture émise porte l'intégralité des mentions obligatoires, vérifié document par document.
- Aucune facture n'existe sans numéro unique, et aucun numéro n'est réutilisé, y compris par une facture annulée.
- Jean-Luc fait un devis complet devant un vrai client, sur un chantier, sans ordinateur, sans stylo et sans réseau, de la première ligne à la signature.
- Le compte de Jean-Luc reste à 95,88 € la première année et 71,88 € les suivantes, tant qu'il reste en virement et en signature tracée.
- Jean-Luc peut arrêter quand il veut : 30 jours de préavis, un mois d'usage, un fichier contenant tous ses documents, sans frais.

---

## 11. Glossaire

| Terme | Définition |
|---|---|
| Devis | Document chiffré proposé au client, daté, avec un identifiant unique, qui porte un total et une durée de validité. |
| Facture | Document chiffré émis depuis un devis signé, portant les mentions imposées par la loi et un numéro unique. |
| Écrit ici, pas encore envoyé | État d'un devis enregistré sur l'appareil et sorti de celui-ci par aucune action. C'est le seul état qu'un devis peut avoir sans action de Jean-Luc. |
| Sortie | Passage d'un devis de l'état `écrit ici, pas encore envoyé` vers `envoyé par courriel` ou `parti en PDF partagé`. |
| Signature tracée | Dessin fait au doigt sur l'écran, conservé avec la date, l'heure et l'empreinte du texte du devis. |
| Empreinte | Représentation figée du texte exact d'un devis au moment de sa signature. Toute modification du devis après signature annule la signature (B11). |
| Expiration | terme de la durée de validité d'un devis. Le produit le constate et le dit ; il ne décide rien (B13). |
| Échéance | Date à laquelle une facture facturée devient exigible, date qui dépend du délai de paiement (B18). |
| Relance | Courriel unique consécutif au dépassement d'une échéance, au plus une par échéance manquée (B20). |
| Assujetti à la TVA | Réponse à la seule question fiscale du produit ; elle engage toute la facturation et n'est jamais déduite d'un document (B17). |
| Dossier client | Ensemble des devis et des factures d'un même client, trouvable par son nom (B21). |
| Export | Fichier unique contenant tous les devis et toutes les factures, disponible en permanence et sans frais (B24). |
| Forge | L'interlocuteur de Jean-Luc en cas de panne. Il n'a aucun accès au produit ; il a un numéro de téléphone. |

---

## 12. Points à clarifier

- ⚠️ **B14 — un montant facturé peut-il s'écarter du montant signé ?** Le contrat § 1 dit « une facture depuis un devis signé » : il désigne la source, il ne dit pas que les montants sont égaux. Q-004 est ouverte, et c'est une question de menuisier avant d'être une question de logiciel : un imprévu découvert chantier ouvert est une réalité du métier. J'ai retenu l'égalité stricte — un écart exige un nouveau devis à signer — parce qu'elle est la seule qui n'ajoute rien au document et qu'elle évite une facture qui ne correspond plus à ce que le client a signé. L'alternative crédible : un écart saisi comme ligne distincte, avec le montant signé et le montant facturé affichés côte à côte sur la facture. **À trancher avant la Phase 4**, parce que le choix change la forme du document, pas son code.
- ⚠️ **B22, E10 et E11 — comment Jean-Luc revient sur ses documents sans mot de passe, et ce que devient un devis non envoyé si l'appareil disparaît.** Le contrat ne dit rien de l'accès de retour (Q-005) et ne traite la perte de l'appareil que dans le cas de la fermeture après préavis, où les documents sont conservés. Il ne dit rien des devis écrits ici et pas encore envoyés : ceux-là n'ont jamais quitté l'appareil. J'ai retenu que le verrou de l'appareil est le seul verrou et que l'accès de retour passe par un lien reçu à son adresse. La partie qui doit être confirmée par Jean-Luc, et non par Forge : **un devis écrit et non envoyé n'existe que sur son appareil, et il est perdu avec lui.** À valider avant la Phase 4.
- ⚠️ **B20 — le jour de la relance.** Le contrat dit « une relance envoyée à l'échéance, une seule fois par échéance manquée » : il ne dit pas à quel jour après l'échéance elle part. Une relance le jour même de l'échéance part avant que le paiement ne soit passé. Le jour est un nombre, et un nombre qui n'est écrit nulle part ne sera pas implémenté deux fois de la même façon. À trancher avant la Phase 4.

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
- [x] Le hors scope est explicite, et chaque exclusion garde l'identifiant de la contrainte qui l'interdit.
- [x] Aucune règle ou contrainte n'est laissée implicite.

**Statut** : `draft` → en attente de validation.