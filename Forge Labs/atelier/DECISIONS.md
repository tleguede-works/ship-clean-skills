# DECISIONS.md — Atelier

## Règle

Ce projet couvre plusieurs sessions avec un contexte qui repart de zéro. Sans ce
fichier respecté, une session sans mémoire repropose périodiquement des alternatives
déjà écartées — perdant ce qu'on construit et en refaisant le débat.

**Ce fichier est un registre de décisions FERMÉES.** Une décision consignée ici est
close : elle ne doit être ni reproposée, ni retournée silencieusement, même si elle
paraît sous-optimale pour la tâche en cours.

Si une décision fermée est **actuellement fausse** : le dire explicitement, nommer la
décision et l'endroit où elle est consignée, expliquer en quoi elle ne tient plus ici,
et **s'arrêter pour demander** avant de procéder autrement. Ne pas simplement
construire l'alternative.

Ce fichier est **append-only**. Ne jamais supprimer ni réécrire une entrée : si une
décision change, on ajoute une entrée qui la supersède et on renvoie à l'ancienne par
`Statut: Supersédé par ADR-<NNN>`.

Une décision appartient ici quand elle devrait sinon être **re-discutée à chaque
session**. Si elle devait être répétée ou redébatée dans chaque tranche qui la touche,
c'est ici qu'elle appartient.

## Questions ouvertes

### Q-004 — Entre le devis accepté et la facture, qu'est-ce qui peut changer ?

- **Ce qui n'est pas connu** : si le prix du devis est ferme, ou s'il bouge après la
  signature — et donc si une facture peut être émise depuis un devis tel quel, ou
  seulement après une reprise du devis.
- **Ce que la réponse détermine** : si le montant de la facture peut différer du
  montant signé. C'est la garantie juridique centrale du produit : une facture qui ne
  correspond pas au devis signé n'est pas une facture, c'est une autre offre.
- **Se ferme quand** : Jean-Luc répond, **ou** la première facture doit être émise —
  parce qu'à ce moment la question ne peut plus rester une question.
- **Statut** : Open
- **Bloque** : la tranche S18 `emission-facture`, qui n'a pas de plan.

### Q-005 — Où vivent les devis de Jean-Luc, et qui d'autre peut les ouvrir ?

- **Ce qui n'est pas connu** : si Jean-Luc est le seul lecteur, ou s'il y a un
  composant, une autre personne de l'atelier, un comptable ; et ce que devient un
  dossier client si son téléphone ou sa tablette est perdu.
- **Ce que la réponse détermine** : combien de personnes un document doit
  reconnaître comme lecteur, et si perdre un appareil est un incident ou une fin de
  dossier client.
- **Se ferme quand** : Jean-Luc répond, **ou** le premier dossier client doit être
  affiché à quelqu'un d'autre que lui.
- **Statut** : Open
- **Note** : le contrat § 3 dit déjà que Jean-Luc est le seul lecteur, et
  l'architecture pose le jeton d'appareil comme seule identité technique. Ce qui reste
  ouvert n'est donc pas *qui* lit, mais *que faire* quand l'appareil est perdu.

### Q-006 — Quelles mentions doit porter une facture de menuiserie en France ?

- **Ce qui n'est pas connu** : le taux de TVA applicable à Jean-Luc — assujetti, ou
  sous le seuil avec la mention « non assujetti à la TVA ».
- **Ce que la réponse détermine** : la ligne de TVA de chaque facture, et donc si
  `F9 identite-emetteur` peut être construite.
- **Se ferme quand** : Jean-Luc répond à **une seule question** — est-il assujetti à la
  TVA ? C'est la seule question de tout le projet qui engage sa fiscalité.
- **Statut** : Open
- **Bloque** : S15 `question-fiscale`, S16 `mentions-facture`, S18 `emission-facture`.

### Q-007 — À quel jour part la relance ?

- **Ce qui n'est pas connu** : le nombre de jours entre l'échéance et la relance. Le
  contrat dit « une relance par échéance manquée », et ne dit pas à quel jour.
- **Ce que la réponse détermine** : `configuration.delai_relance_jours`, absent **par
  construction** dans l'architecture.
- **Se ferme quand** : Jean-Luc répond, **ou** la première facture doit être relancée.
- **Statut** : Open
- **Bloque** : S20 `relance`.
- **Pourquoi ce n'est pas une règle** : 15 et 30 sont déjà dans la tête de l'agent. Une
  règle « relancer 15 jours après » se lirait comme une règle alors qu'elle serait un
  choix — et les deux tranches qui l'appliqueraient ne le feraient pas pareil.

## Questions tranchées

Une question fermée quitte cette section **et devient une ADR**, qui porte la décision,
la date et l'alternative écartée. Q-001, Q-002 et Q-003 sont fermées : elles sont
devenues ADR-001, ADR-002 et ADR-003.

## Journal des décisions

---

## ADR-001 : Le devis se fait au téléphone, et c'est la seule tranche qui compte

- **Date** : 2026-10-01
- **Statut** : Actif
- **Contexte** : Q-001 demandait sur quel appareil le devis se fait devant le client.
  Jean-Luc n'a ni ordinateur portable ni bureau, et il est sur un chantier une bonne
  partie de la semaine.
- **Décision** : le devis se fait **sur le téléphone**, d'une main, debout, **hors
  réseau**. Une cave et un local technique n'ont pas de réseau, et c'est là que le
  devis se fait.
- **Alternatives considérées** : responsive web, où chaque changement d'écran est un
  rechargement à lire sous le regard du client qui attend ; et tablette en première
  position, écartée parce qu'elle n'est pas toujours dans la poche.
- **Conséquences** : l'écriture locale d'abord devient une contrainte d'architecture,
  pas une préférence. La file d'envoi est ordonnée par rang monotone. Les trois
  démonstrations attendues sont toutes au niveau appareil.
- **Ferme** : Q-001

---

## ADR-002 : La signature est tracée, et la signature qualifiée est hors périmètre

- **Date** : 2026-10-01
- **Statut** : Actif
- **Contexte** : Q-002 demandait comment un devis devient signé. Deux réponses
  possibles : Jean-Luc signe seul de sa main sur l'appareil, ou un client signe sans sa
  présence.
- **Décision** : **signature tracée** — dessin au doigt, avec la date, l'heure et
  l'empreinte exacte du texte du devis. Coût **0 €**.
- **Alternatives considérées** : signature **qualifiée**, 1 à 3 € par devis signé, soit
  entre 30 € et 90 € par an pour 30 devis. Elle n'est pas légalement exigée pour un
  devis : la tracée est admissible, et la différence de garantie n'a de sens que pour
  des actes beaucoup plus importants qu'un devis de menuiserie.
- **Conséquences** : aucun prestataire de signature à acheter, aucune donnée de plus à
  conserver. Mais l'empreinte doit être calculée **avant** l'envoi et revérifiée à la
  réception, et une modification du texte après signature **annule** la signature
  au lieu de désigner autre chose.
- **Source** : contrat § 3 et § 5, tranchée par le client avant la Phase 1.
- **Ferme** : Q-002

---

## ADR-003 : 30 devis par an, dont la moitié hors réseau

- **Date** : 2026-10-01
- **Statut** : Actif
- **Contexte** : Q-003 demandait le volume et la part de travail sans réseau. Sans
  chiffres, l'offre gratuite d'envoi de courriels ne pouvait pas être vérifiée et le
  coût du paiement par carte ne pouvait pas être annoncé.
- **Décision** : **30 devis par an**, environ 2 à 3 courriels par devis — donc **60 à 90
  envois par an** pour une limite de 3 000.
- **Alternatives considérées** : 10 devis par an, qui ferait passer l'hébergement de
  5,99 €/mois pour trois artisans seulement ; et 100 devis par an, qui ferait sortir de
  l'offre gratuite et coûterait 20 €/mois. Le nombre est un ordre de grandeur vérifié
  par Jean-Luc, pas une estimation de l'agent.
- **Conséquences** : l'offre gratuite d'envoi tient très large — **ce qui est
  aujourd'hui gratuit ne l'est pas demain**, et c'est écrit au contrat § 3. Le coût du
  paiement par carte devient chiffrable : sur 30 factures de 5 000 €, 1,8 % + 0,25 €
  font **2 708 € par an**, soit vingt-huit fois le reste du contrat.
- **Ferme** : Q-003

---

## ADR-004 : Écriture locale d'abord, et la file est ordonnée par rang

- **Date** : 2026-10-01
- **Statut** : Actif
- **Contexte** : ADR-001 impose le hors-réseau. Reste à dire dans quel ordre les devis
  partent, et ce qui se passe quand le même devis est modifié pendant qu'il attend.
- **Décision** : la file est ordonnée par un **rang monotone du magasin**, pas par
  l'heure. La seule version envoyable est celle dont l'empreinte est encore celle du
  devis, parce que la signature est annulée à la première modification.
- **Alternatives considérées** : tri par `tente_le`, qui paraît naturel et qui produit
  exactement l'inverse de l'ordre dans lequel Jean-Luc a fait ses devis. Le rang est
  monotone par construction ; un horodatage ne l'est pas.
- **Conséquences** : l'invalidation se produit **à l'écriture**, pas au départ. Le test
  qui prend cette implémentation doit comparer l'ordre de sortie à `rang`
  explicitement, parce que `tente_le` *est* un horodatage et qu'un test qui compare
  « l'ordre » à « l'heure » passerait sur la mauvaise implémentation.
- **Écrit** dans `.opencode/rules/20-ecriture-locale.md`.

---

## ADR-005 : Un jeton d'appareil est la seule identité technique

- **Date** : 2026-10-01
- **Statut** : Actif
- **Contexte** : C2 pose un seul secret — pas de mot de passe, pas de gestion de
  compte, pas de « oublié votre mot de passe ». Mais le serveur doit savoir qui appelle.
- **Décision** : l'identité technique est un **jeton d'appareil**, stocké sur l'appareil
  et non saisi. Il n'y a pas de mot de passe à retenir.
- **Alternatives considérées** : compte avec mot de passe, écarté — Jean-Luc est sur un
  chantier et ne retiendra pas un mot de passe ; et le jeton remis en main propre par
  Forge, qui suppose une rencontre et un papier.
- **Conséquences** : **c'est la seule décision du projet qui dépende d'une action
  humaine et non d'une ligne de code.** Si Jean-Luc perd le lien reçu par courriel *et*
  que Forge ne peut pas le lui renvoyer, l'accès de retour disparaît — et le cas limite
  E11 n'a alors aucun chemin. La parade écrite repose sur une personne, pas sur un
  mécanisme. **Une procédure de réémission testée, ou une seconde voie d'accès, est
  requise avant la première tranche.**
- **Point ouvert, non résolu** : cette procédure n'existe pas encore. Elle n'est ni une
  question ni une décision — c'est du travail, et il est nommé.