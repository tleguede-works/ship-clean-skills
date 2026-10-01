---
type: roadmap
status: approved
generated_at: 2026-10-01
derived_from: .forge/prd.md
version: 1
---

# Roadmap — Atelier

> Ce document définit CE QUI sera livré et QUAND.
> Inspiré du PRD (`.forge/prd.md`). Chaque règle métier citée référence son ID source (B*),
> et chaque cas limite son ID (E*), chaque contrainte son ID (C*).
>
> La roadmap est vivante — elle évolue avec les retours utilisateurs et les découvertes techniques.
>
> **Périmètre de lecture.** Ce document a été écrit à partir de `.forge/contract.md`, `.forge/prd.md`,
> `.forge/state.json`, `AGENTS.md` et `DECISIONS.md`. Aucun écran, aucune règle d'architecture,
> aucun plan d'implémentation et aucun code n'ont été lus : ce sont des décisions prises après le
> découpage, pas des entrées du découpage. `.forge/benchmarks.md` **n'existe pas** dans ce projet ;
> il n'a donc rien pu arbitrer ici, et il n'est pas produit par cette phase.

---

## 1. Vision par version

| Version | Thème / Promesse | Critère de succès principal | Cible |
|---|---|---|---|
| MVP | **« Le devis sort du chantier, signé, et Jean-Luc sait où il en est. »** — Devis, Signature, Envoi, Suivi, Dossier | Jean-Luc fait un devis complet devant un vrai client, sur un chantier, sans ordinateur, sans stylo et sans réseau, de la première ligne à la signature (PRD § 10) | T4 2026 |
| V1 | **« Le devis devient facture, et l'argent rentre. »** — Facture, Relance | Chaque facture émise porte l'intégralité des mentions obligatoires, vérifié document par document, et aucune facture n'existe sans numéro unique jamais réutilisé (PRD § 10) | T2 2027, au plus tard avant le 30 septembre 2027 |
| V2 | **« Ce que Forge n'a pas proposé et que Jean-Luc demande. »** — rien d'autre | Aucun élément de V2 n'entre en périmètre sans une demande écrite de Jean-Luc (contrat § 2) | **Non datée, et c'est volontaire** : le contrat dit « plus tard, si Jean-Luc le demande — rien n'est acquis ». Une date sur cette ligne en ferait une promesse. |

**Pourquoi la cible de V1 est bornée par une date et pas par un trimestre seul.** Le prix de
l'hébergement est garanti jusqu'au 30 septembre 2027 (contrat § 3). Passé cette date, Forge prévient
60 jours avant toute nouvelle valeur. Une V1 livrée après cette échéance ferait entrer Jean-Luc dans
la fenêtre de révision de prix pour une fonctionnalité qui était déjà promise par le contrat § 1.
La V1 se referme donc avant le 30 septembre 2027.

---

## 2. MVP — Minimum Viable Product

> Le plus petit ensemble qui résout le problème principal et peut être utilisé par de vrais utilisateurs.

### 2.0 Où s'arrête le MVP, et pourquoi

**Le MVP livre cinq des sept tranches du contrat § 1. Les deux tranches écartées sont Facture et
Relance, parce que ce sont les deux seules dont la livraison dépend d'une information que Forge ne
possède pas — cinq champs d'identité `[à compléter]` et une réponse fiscale — et parce qu'une facture
à moitié délivrée n'est pas une fonctionnalité manquante, c'est une facture illegalement incomplète (C4).**

Cinq arguments, un par raison :

1. **Devis, Signature et Envoi ne se séparent pas.** B9 interdit qu'un devis non signé sorte ;
   donc US-3 et US-4 sont impossibles sans US-2. Ces trois tranches forment un bloc indissociable,
   et c'est le bloc qui répond au problème principal du PRD § 1.1.
2. **Suivi entre dans le MVP pour une raison de contrat, pas d'usage.** La durée de validité est
   fixée **avant le premier envoi** (B12, contrat § 5, échéance « Avant le premier devis envoyé »).
   L'horloge naît donc avec le premier devis, et US-7 (B25, B26) affiche la validité qui approche
   ou est dépassée : la tranche Suivi ne peut pas arriver plus tard que le premier devis envoyé.
3. **Dossier entre dans le MVP parce que le contrat § 3 l'a déjà promis.** B24 garantit le
   téléchargement de tous les devis et de toutes les factures en un seul fichier, à tout moment,
   sans rien payer. Le contrat § 3 est le bloc qui rend la promesse de non-interruption vraie. Un
   MVP où Jean-Luc paie 5,99 € par mois et ne peut pas sortir ses documents rend ce bloc faux.
   US-12 dépend de US-11 (PRD § 3), donc Dossier et export entrent ensemble.
4. **US-13 et US-14 sont classées P2 par le PRD mais ne sont pas des fonctions dAGRÉMENT.** B2 traite
   explicitement un devis de douze lignes comme un devis ordinaire, pas comme un cas particulier, et
   la § 7.1 impose une saisie sur téléphone tenu d'une main sans aucun défilement horizontal. Livrer
   la tranche Devis sans US-13 revient à livrer un formulaire qui défile sur le seul appareil que
   Jean-Luc possède. US-14 est le dernier critère d'acceptation de US-2 (B9, E5) : c'est la même
   exigence énoncée deux fois, pas une tranche.
5. **US-8 (la validité) ne peut pas attendre V1**, pour la même raison que Suivi : B12 fixe la durée
   avant le premier envoi. Fractionner B12 et B13 entre deux versions reviendrait à inventer une
   moitié de règle qui n'existe pas au PRD — la roadmap le prend donc en entier dans le MVP.

**Ce que le MVP n'est pas.** Il n'est pas « tout ce qui est dans le PRD » : il en retire deux tranches
sur sept et deux histoires sur quatorze. Il n'est pas un backend sans interface : chaque tranche du
MVP a un critère de démonstration sur un appareil réel. Et il ne commence pas par les tranches
secondaires : il commence par la première ligne du contrat § 1, celle que le contrat lui-même
nomme « la seule qui compte vraiment ».

### 2.1 Périmètre

| User story (PRD) | Règles métier (B*) et cas (E*) | Justification de l'inclusion |
|---|---|---|
| US-5 : ouvrir sans mot de passe | B22, C2 | Une contrainte de la première tranche, pas une fonction d'accès : un seul utilisateur, le verrou de l'appareil est le seul verrou. |
| US-14 : tendre l'appareil sans ouvrir les dossiers | B9, E5 | Le dernier critère de US-2 énoncé séparément ; traiter l'un sans l'autre laisserait un écart. |
| US-1 : faire un devis devant le client | B1, B2, B3, B4, C1, E1, E2 | La première ligne du contrat § 1 et le problème du PRD § 1.1 : un devis écrit hors réseau ne se perd pas. |
| US-13 : devis de douze lignes, une main | B2, § 7.1 | B2 déclare le devis long ordinaire ; c'est une exigence de saisie, pas un agrément. |
| US-2 : faire signer au doigt | B9, B10, B11, C3, E6, E17 | B9 rend US-3 et US-4 impossibles sans US-2 : la signature n'est pas une tranche séparée, c'est la clé de la sortie. |
| US-3 : envoyer et savoir si c'est parti | B5, B6, B7, E3, E4 | L'écrit et le parti sont deux états distincts (PRD § 1.4) : c'est la différenciation du produit. |
| US-4 : partager en PDF sans réseau | B8 | La moitié des chantiers n'a pas de couverture (C1) ; sans PDF, un devis signé reste sur l'appareil et le client repart sans. |
| US-6 : voir ce qui n'est pas sorti | B23, E10 | Le compteur permanent est la seule mesure de la perte possible quand un appareil disparaît. |
| US-7 : suivre sans ouvrir un par un | B25, B26 | Sans la liste des états, Jean-Luc ne sait pas ce qu'il a déjà envoyé — le risque le plus probable du produit. |
| US-8 : être prévenu avant l'expiration | B12, B13, E8, E15 | La durée est choisie avant le premier envoi (B12, contrat § 5) et Suivi (B25) affiche déjà son terme : l'horloge naît avec le premier devis. |
| US-11 : dossier client par son nom | B21, E12, E14 | Le dossier est le réceptacle du bloc Dossier, dont l'export (B24) est la raison d'être dans le MVP. |
| US-12 : tout télécharger à tout moment | B24, C6 | Engagement contractuel § 3 déjà signé : c'est lui qui rend crédible la promesse de pouvoir partir. |

**Effort relatif de ce périmètre** : XL. 16 tranches de travail sur une échelle où L va de 8 à 12.
C'est le prix d'un contrat qui a signé sept tranches, pas d'une ambition de roadmap.

### 2.2 Ce qui n'est PAS dans le MVP

| Élément | Raison de l'exclusion | Risque de l'exclusion | Version cible |
|---|---|---|---|
| US-9 : émettre une facture depuis un devis signé | B16 exige cinq mentions que l'application ne peut ni inventer ni déduire, et cinq champs sont `[à compléter]` dans le contrat § 3 ; B17 et C5 bloquent l'émission tant que la question de la TVA n'est pas tranchée par Jean-Luc, jamais par défaut (E16). Aucun de ces deux blocages n'est levée par du code. | Jean-Luc continue de facturer à la main ou sur un tableur pendant toute la durée du MVP. Il peut chiffrer, signer et envoyer un devis — mais il ne peut pas encore se faire payer par l'outil. Le risque commercial est nul ; le risque de non-conformité d'une facture émise est réel (C4). | V1 |
| US-10 : relancer une facture non réglée | Dépend de US-9, donc de deux blocages qui ne sont pas encore levés. En outre le jour de la relance n'est fixé nulle part (PRD § 12) : B20 dit « au plus une relance par échéance manquée » sans dire quand elle part, et le contrat § 1 dit « à l'échéance », ce qui enverrait une relance le jour où le client n'a pas encore eu l'occasion de payer. | Jean-Luc relance lui-même, à la main, comme aujourd'hui. Il perd le bénéfice d'un oubli qui n'est plus un oubli, mais rien de ce que le MVP promet n'est rompu. | V1 |

**Ce que ces deux exclusions ne coûtent pas.** Elles ne coûtent rien à la promesse centrale : le
contrat § 1 dit que la première ligne est la seule qui compte vraiment, et le MVP la livre
entièrement, avec la signature et l'envoi. Elles ne coûtent rien non plus à l'engagement financier :
le devis part et le client signe, ce qui est déjà la moitié de la valeur perçue par Jean-Luc.

### 2.3 Risques spécifiques au MVP

| Risque | Probabilité | Impact | Mitigation |
|---|---|---|---|
| L'appareil disparaît avec des devis écrits et non envoyés (E10, critique) : ces devis sont perdus, et le produit ne peut pas le promettre. | MEDIUM | HIGH | Le compteur permanent et exact (B23, US-6) et le partage en un geste. Aucune sauvegarde ne remplace un appareil perdu : la réponse est la visibilité, pas la promesse. |
| La liste de Suivi ne tient pas la promesse de « trois groupes toujours affichés » (B26) sur un écran de téléphone | MEDIUM | MEDIUM | Une liste vide ne doit pas ressembler à une panne : les trois groupes existent dans le MVP, y compris vides, sinon B26 est perdu dès la première livraison. |
| L'écran de signature laisse fuir un autre document (E5) | MEDIUM | HIGH | C'est une exigence de conception du parcours de signature (B9, E5, US-14), pas une préférence : à traiter comme un critère bloquant, pas comme un ajustement. |
| L'export du MVP ne contient que des devis, alors que B24 promet « tous ses devis et toutes ses factures » | HIGH | LOW | Aucune facture n'existe au MVP : l'ensemble des factures est vide, donc l'export est complet au sens de B24. La promesse redevient contraignante à la V1, et c'est le premier critère de la tranche Facture. |
| Le client signe sur l'appareil de Jean-Luc ou Jean-Luc dessine lui-même après un accord oral (Q-002, PRD § 8) | MEDIUM | MEDIUM | Le geste n'est pas tranché par C3 et B10, qui ne fixent que le mode. Le MVP suppose le geste décrit par US-2 et E5. Si la réponse de Jean-Luc est l'autre, US-2 change de forme — voir la question posée en § 8. |

---

## 3. V1 — Première version complète

> Le MVP plus les deux tranches qui ferment la boucle de l'argent. Le produit cesse d'être un outil de
> chiffrage et devient un outil de facturation.

### 3.1 Ajouts par rapport au MVP

| User story (PRD) | Règles métier (B*) et cas (E*) | Justification |
|---|---|---|
| US-9 : émettre une facture depuis un devis signé | B14, B15, B16, B17, B18, B19, C4, C5, E16, E18 | La seconde moitié du problème du PRD § 1.1 : ressaisir un devis en facture est ce qui produit une facture fausse. B15 (numéro jamais réutilisé) et B19 (facture émise ni modifiée ni supprimée) sont des exigences de probabilité, pas d'esthétique. |
| US-10 : relancer une facture, une seule fois | B20, E9 | La relance ne sert qu'à une chose : déclencher une action de Jean-Luc au moment où la facture est en retard. Elle dépend entièrement de US-9 et de l'échéance que fixe B18. |

**Le point dur de la V1 n'est pas la facture : c'est B17.** Une seule question engage toute la
facturation — Jean-Luc est-il assujetti à la TVA ? — et sa réponse n'est jamais déduite d'un
document existant, parce qu'une réponse déduite d'un devis est une réponse inventée (PRD § 4.5).
E16 rend le blocage explicite plutôt que silencieux. Tant que cette question n'est pas tranchée, la
tranche Facture existe dans le code et pas dans le produit.

### 3.2 Ce qui est repoussé en V2+

| Élément | Raison | Risque |
|---|---|---|
| Une application de comptabilité (C7) | Le contrat § 2 dit « Plus tard, si Jean-Luc le demande — rien n'est acquis ». La roadmap peut la porter au backlog ; elle ne peut pas la dater. | Aucun risque : elle ne répond à aucun des cas du PRD § 6 et Jean-Luc n'a ni compte ni expert en la matière. Le logiciel lui fabriquerait un travail qu'il n'a pas demandé. |
| Le stock de fournitures (C7) | C'est un métier de négoce, pas de menuiserie (contrat § 2). Le contrat lui donne V2 comme réexamen, en écrivant « jamais promis ». | Aucun risque produit. Risque de promesse : l'écrire dans le backlog sans la marque « jamais promis » la ferait lire comme un engagement. |
| L'encaissement par carte (C8) | Exclu par défaut, rouvert uniquement sur demande écrite de Jean-Luc, avant la première facture, au prix annoncé de 1,8 % + 0,25 € par facture. Aucun jour de V2 ne lui est réservé. | 2 708 € par an sur 30 factures de 5 000 €, soit vingt-huit fois le reste du contrat. C'est un engagement sur le chiffre d'affaires, pas un coût fixe. |
| Le geste de signature : Jean-Luc dessine lui-même après un accord oral (Q-002) | Le mode est tranché (C3, B10) ; le geste ne l'est pas (PRD § 8). Aucune règle du PRD ne le décrit, donc aucune tranche ne peut le livrer. | Si ce geste est réellement courant chez Jean-Luc, US-2 sous-estime le produit. Voir la question posée en § 8. |

### 3.3 Risques spécifiques à la V1

| Risque | Probabilité | Impact | Mitigation |
|---|---|---|---|
| Les cinq champs `[à compléter]` du contrat § 3 ne sont pas fournis à temps | MEDIUM | HIGH | C'est le point client C-001, déjà enregistré dans l'état du projet : **sans réponse, l'émission de facture reste bloquée et le reste du produit continue**. Le MVP n'en dépend pas ; la V1 en dépend entièrement. |
| La question « assujetti à la TVA » traîne (C5, E16) | MEDIUM | HIGH | Elle est bloquante et explicite, jamais tranchée par défaut. Le contrat § 5 la fixe à échéance et le contrat dit que le silence vaut permission de choix par défaut — Forge applique donc l'option recommandée et l'écrit à Jean-Luc. |
| B14 : un montant facturé peut-il s'écarter du montant signé ? Q-004 est ouverte (PRD § 12) | HIGH | HIGH | Le PRD retient l'égalité stricte — un écart exige un nouveau devis à signer — parce que c'est la seule forme qui n'ajoute rien au document. L'alternative crédible existe. **À trancher avant la Phase 4** : le choix change la forme de la facture, pas son code. |
| Q-006 : le taux de TVA applicable aux travaux de menuiserie | MEDIUM | MEDIUM | B17 règle « assujetti ou non », pas le taux. Un taux absent bloque la mention obligatoire de la facture (B16, C4). Le PRD le signale comme inconnue, pas comme règle : c'est une question avant d'être une donnée. |
| Le jour de la relance (B20, PRD § 12) | HIGH | MEDIUM | Le contrat § 1 dit « à l'échéance » et le PRD § 12 observe qu'une relance le jour de l'échéance part avant que le paiement ne soit passé. Un nombre qui n'est écrit nulle part sera implémenté deux fois différemment. **À trancher avant la Phase 4.** |
| L'envoi des relances consomme le quota de courriels (contrat § 3) | LOW | MEDIUM | Sur la base de 30 devis par an, le contrat compte 60 à 90 envois pour une limite de 3 000. Les relances ajoutent 30 envois au plus : la marge reste entière. Elle disparaît si le volume réel dépasse l'hypothèse — voir Q-003. |

### 3.4 Dépendances inter-versions

| La V1 dépend de | Nature | Critique ? |
|---|---|---|
| US-2 (B9) — un devis signé existe, donc une facture a une source | produit | oui |
| US-11 (B21) — un dossier client existe, donc un client est identifiable sans ressaisie | produit | oui |
| B12 — la durée de validité du devis est connue, donc l'échéance d'une facture issue de ce devis est calculable | produit | oui |
| Cinq champs d'identité `[à compléter]` : SIRET de Jean-Luc, raison sociale et adresse de Forge, téléphone et courriel | externe | oui |
| La réponse à « Jean-Luc est-il assujetti à la TVA ? » (B17, C5) | externe | oui |
| Un taux de TVA applicable (Q-006) et un taux d'intérêt de retard (B16) | externe | oui |
| Une décision sur l'égalité des montants entre devis signé et facture (Q-004, B14) | produit | oui |
| Le service d'envoi de courriels et son quota (contrat § 3) | externe | non — il est déjà nécessaire au MVP pour US-3 |

---

## 4. V2 et au-delà

### 4.1 Backlog V2

**Ce tableau ne contient que des éléments reportables.** Le contrat § 2 leur a donné un moment ; il
n'a donné de moment à rien d'autre. Aucun de ces éléments n'a de date, et le V2 lui-même n'a pas de
date : un backlog daté est une promesse, et le contrat dit « rien n'est acquis ».

| User story (PRD) | Priorité | Raison d'être en V2 | Dépend de |
|---|---|---|---|
| Une application de comptabilité (C7) | P2 — **jamais promis** | Le contrat § 2 autorise Forge à la proposer « plus tard, si Jean-Luc le demande », et précise que rien n'est acquis. Elle entre au backlog à la demande, pas au calendrier. | Une demande écrite de Jean-Luc |
| Le stock de fournitures (C7) | P2 — **jamais promis** | Le contrat § 2 nomme V2 comme réexamen, tout en écrivant « jamais promis ». Le réexamen existe, la promesse non. | Une demande écrite de Jean-Luc |
| L'encaissement par carte dans l'application (C8) | P2 — **fermé par défaut** | Rouvert uniquement sur demande écrite de Jean-Luc, avant la première facture, et uniquement si le coût en euros est annoncé sur chaque facture plutôt qu'en note de bas de page. Forge n'installe aucun prestataire de paiement jamais d'office. | Une demande écrite de Jean-Luc, et le prix affiché |

### 4.2 Idées pour le futur (V3+)

- **Mesurer le volume réel de devis**, et la part du travail faite sans réseau (Q-003, PRD § 8). Le
  contrat § 3 calcule l'hébergement, le quota de courriels, le budget et le nombre de relances sur
  30 devis par an, et personne ne l'a mesuré. Au-delà, la limite gratuite de 3 000 envois est atteinte
  en trois ans et le surplus coûte 20 €/mois : c'est la seule mesure du projet qui puisse un jour
  rendre une décision d'architecture nécessaire.
- **Rendre le geste de signature flexible** (Q-002) si Jean-Luc fait réellement signer après un
  accord oral plutôt que devant lui. Le mode est déjà tranché par C3 et B10 ; seul le geste est ouvert.
- **Un second moyen d'accès de retour aux documents** (Q-005, E11) si le lien reçu à l'adresse ne
  suffit pas en pratique. Le PRD a retenu l'accès de retour par lien, sans mot de passe, et a laissé
  la partie « un devis écrit et non envoyé n'existe que sur l'appareil » à la confirmation de Jean-Luc.

### 4.3 Ce qui n'est dans aucune version

**Le contrat § 2 distingue deux exclusions, et elles ne se traitent pas de la même façon.**
Une exclusion **reportable** a un moment : elle porte une ligne de backlog, avec sa condition
d'entrée. Une exclusion **refusée** n'a pas de moment : elle ne reçoit ni ligne de backlog, ni date,
ni colonne « version cible », parce qu'une ligne de backlog est une promesse et que le contrat la
refuse. Ces éléments sont listés ici pour une seule raison : qu'un agent qui les rencontre plus tard
sache qu'il ne doit pas les rouvrir en les retrouvant dans un document.

**Refusés — aucun moment, aucune version, aucun réexamen (contrat § 2 et PRD § 9) :**

| Exclu | Raison | Origine |
|---|---|---|
| Le planning, la main d'œuvre, les équipes | Jean-Luc est seul. Un outil à plusieurs utilisateurs est un produit pour quelqu'un d'autre. | C2, contrat § 2 — « Jamais » |
| Le catalogue produits de Jean-Luc | Un menuisier ne vend pas un catalogue, il fait un devis au client, en face, avec le lieu. | C7, contrat § 2 — « Jamais » |
| La gestion des appels clients | Un téléphone ne se gère pas depuis une application. | C9, contrat § 2 — « Jamais » |
| L'envoi de SMS | Le courriel suffit et le prix du devis est envoyé une fois ; le SMS coûte par message. | C9, contrat § 2 — « Jamais » |
| La signature qualifiée du devis | 1 à 3 € par devis signé, soit 30 à 90 € par an pour 30 devis, et elle n'est pas exigée pour un devis. | C3, PRD § 9 — « Jamais pour un devis » |
| La régie publicitaire, la mesure d'audience tierce, le partage à un réseau social | Aucune donnée de Jean-Luc ne part chez un tiers en dehors de l'hébergeur et de l'expéditeur de courriels. | C11, PRD § 9 — « Jamais » |

**Le refus le plus discutable du document est le paiement intégré.** Il est écrit pour être
discuté : le contrat § 2 dit « Forge ne le fera pas », puis ajoute que si Jean-Luc veut encaisser par
carte l'exclusion saute. Les deux phrases ne peuvent pas être vraies en même temps, et le contrat § 5
tranche le conflit en donnant à Jean-Luc, et non à Forge, la décision. Cette roadmap applique donc
la lecture du § 5 : l'exclusion est **fermée par défaut**, et s'ouvre sur demande écrite. Elle n'est
pas pour autant un élément de V2 : une ligne datée serait une promesse, et le coût est un
engagement sur le chiffre d'affaires.

---

## 5. Compromis assumés

| Compromis | Ce qu'on perd | Ce qu'on gagne | Risque à long terme |
|---|---|---|---|
| **Écarter la tranche Facture du MVP** (US-9) | La fin du problème énoncé au PRD § 1.1 : pendant toute la durée du MVP, la facture se fait encore à la main, et Jean-Luc ne peut pas se faire payer par l'outil. | Aucun risque de facture illegalement incomplète (C4) et aucun blocage de la V1 par une information manquante : les deux blocages sont externes et se résolvent en parallèle du développement du MVP. | Si le MVP dure plus d'un trimestre, Jean-Luc a un excellent outil de devis et toujours une facturation manuelle. Le risque n'est pas la non-conformité, c'est le sentiment d'inachèvement. |
| **Écarter la tranche Relance du MVP** (US-10) | L'automatisation de la relance. Jean-Luc relance lui-même, comme aujourd'hui, et peut encore envoyer une relance à tort. | Le jour de la relance (PRD § 12) et le taux d'intérêt de retard seront tranchés avant d'exister dans le code, plutôt que discovered dans un envoi réel. | Faible. US-10 ne répond à aucun cas critique du PRD § 6 et n'est nécessaire à aucune des six premières tranches. |
| **Découper le MVP en cinq tranches et non en trois** (Suivi et Dossier dans le MVP) | Un MVP plus gros de deux tranches, côté effort : XL au lieu de L. | La promesse de non-interruption du contrat § 3 devient vraie dès le MVP : Jean-Luc peut partir avec ses documents le premier jour où il paie. | Le MVP prend plus de temps, donc le risque est calendaire et non de périmètre. C'est le seul risque que le découpage n'a pas pu déplacer. |
| **Ne pas fusionner les trois durées en un délai unique** | Une règle unique serait plus simple à implémenter et à se souvenir. | Les trois durées répondent à trois questions différentes — jusqu'à quand le prix tient, quand la facture est due, quand relancer — et les confondre produirait soit des devis expirés avant leur échéance, soit des relances envoyées avant que la facture soit due. | Une simplification future qui reintroduirait un délai unique casserait silencieusement B12, B18 et B20 en même temps, et les tests de critère de succès du PRD § 10 ne les couvrent pas séparément. |
| **Ne pas dater V2** | Une roadmap entièrement datée est plus satisfaisante à lire et paraît plus maîtrisée. | Le contrat § 2 dit « rien n'est acquis » pour la comptabilité et « jamais promis » pour le stock. Une date serait une promesse que le contrat a explicitement refusée de faire. | Un backlog non daté peut dériver. Il faut le rouvrir quand Jean-Luc demande, et non le faire vivre tout seul. |

---

## 6. Effort relatif par version

| Version | Slices estimées | Taille relative | Facteurs de risque |
|---|---|---|---|
| Fondations | 5 | M | Transverse, bloque tout : identité de l'émetteur et mentions obligatoires (B16), persistance locale sans perte (B4, E2), sortie PDF lisible hors ligne (US-4), envoi de courriel avec confirmation (B6, E3), horloge des documents (B12, B18). |
| MVP | 16 | XL | Hors réseau de bout en bout (C1) ; trois états de sortie distincts (B5, B6, B8) ; empreinte du texte lié à la signature (B10, B11) ; compteur exact et permanent (B23) ; export complet et gratuit (B24). |
| V1 | 9 | L | Blocage externe sur cinq champs `[à compléter]` ; question fiscale bloquante (B17, E16) ; numéro de facture jamais réutilisé (B15) ; facture émise immuable (B19, E18) ; jour de la relance non tranché (B20). |
| V2 | 2 | S | Rien n'est daté. Les deux éléments ne deviennent des tranches que sur demande de Jean-Luc, et l'un des deux est chiffré à 2 708 € par an. |

*Les tailles sont relatives au projet, pas absolues. S = 1-3 slices simples, M = 4-7 slices, L = 8-12 slices, XL = 13+ slices ou slices complexes.*

**Le MVP est XL et il faut le dire.** Sur l'échelle ci-dessus, il dépasse le seuil haut. La raison
n'est pas l'ambition du découpage : c'est que le contrat § 1 a signé sept tranches, que B9 rend les
trois premières indissociables, que B12 fait naître l'horloge de validité avant le premier envoi, et
que B24 engage l'export dès la première facture payée. Le seul arbitrage réellement disponible
portait sur deux tranches, et il a été fait. Si ce MVP doit rétrécir, le rétrécissement doit venir de
Jean-Luc — c'est un écart au contrat, pas un choix de roadmap.

---

## 7. Dépendances externes

| Dépendance | Impacte quelle version | Statut | Risque si indisponible |
|---|---|---|---|
| L'hébergeur de Forge, en France ou dans l'Union européenne (contrat § 3, C11) | MVP | disponible | Perte totale des documents sortis. Atténué par le préavis de 30 jours et l'export permanent (B24), qui sont eux-mêmes dans le MVP. |
| La boîte courriel à Jean-Luc seul, limite de 3 000 envois (contrat § 3) | MVP et V1 | disponible | Sans confirmation du service de courriel, B6 interdit d'afficher « envoyé par courriel » : la tranche Envoi perd sa différenciation et le devis reste à « écrit ici, pas encore envoyé ». Aucun doublon possible, donc aucune perte de donnée, mais l'état du produit devient inutilisable pour son usage principal. |
| Le nom de domaine en `.fr` (contrat § 3, C11) | MVP | en attente | C'est l'adresse que les clients ont dans leurs courriels. Changer de service ne doit pas casser les envois déjà reçus ; c'est une exigence d'architecture, pas une dépendance de calendrier. |
| Les cinq champs d'identité `[à compléter]` : SIRET de Jean-Luc, raison sociale, adresse, téléphone et courriel de Forge (B16) | V1 | en attente | Aucune facture ne peut être émise. Le blocage porte sur l'émission, pas sur le fonctionnement : c'est le point client C-001, déjà enregistré. |
| La réponse à la question TVA de Jean-Luc (B17, C5) | V1 | en attente | Aucune facture ne peut être émise, et le blocage doit rester explicite (E16). L'application ne choisit pas et ne déduit rien d'un document existant. |
| Un taux de TVA applicable et un taux d'intérêt de retard (B16, C4, Q-006) | V1 | incertain | Une mention obligatoire manquante rend la facture non opposable à un client qui refuse de payer (C4). |
| Le nom de domaine choisi par Jean-Luc (contrat § 5) | avant l'ouverture du compte d'hébergement | en attente | Trois noms préparés par Forge, ou le sien imposé. Sans cela, l'ouverture du compte ne peut pas se faire. |

---

## 8. Questions que cette roadmap pose et ne tranche pas

Ces quatre points n'ont pas de règle dans le PRD. Ils sont écrits comme des questions parce que les
inventer produirait une règle fausse, et parce que trois d'entre eux changent la forme d'un document
plutôt que son code. Aucun n'est bloquant pour le MVP.

1. **Le jour de la relance** (B20, PRD § 12). Le contrat § 1 dit « à l'échéance » ; le PRD observe
   qu'une relance le jour de l'échéance part avant que le client n'ait pu payer. Quelle valeur, en
   jours ? À trancher avant la Phase 4.
2. **L'égalité des montants entre devis signé et facture** (B14, Q-004, PRD § 12). Le PRD retient
   l'égalité stricte et nomme l'alternative — un écart saisi comme ligne distincte, les deux
   montants affichés côte à côte. Est-ce le geste d'un menuisier ou une décision de logiciel ?
   À trancher avant la Phase 4.
3. **Le geste de signature** (Q-002, PRD § 8). Le mode est tranché par C3 et B10 ; le geste ne l'est
   pas. Le client signe-t-il sur l'appareil de Jean-Luc, ou Jean-Luc dessine-t-il lui-même après un
   accord oral ? Cette roadmap suppose le premier, parce que c'est ce que décrivent US-2, US-14 et E5.
4. **La confirmation par Jean-Luc qu'un devis écrit et non envoyé est perdu avec l'appareil**
   (B22, E10, E11, PRD § 12). Le PRD a retenu que le verrou de l'appareil est le seul verrou et que
   l'accès de retour passe par un lien reçu à l'adresse ; il a laissé à Jean-Luc, et non à Forge, la
   partie qui dit qu'un devis non envoyé n'existe que sur l'appareil. C'est une confirmation, pas une
   règle : elle est attendue de lui.

---

## Checklist de gate

- [x] Le MVP résout le problème principal du PRD — un devis complet se fait, se signe et se sort
      devant un client, hors réseau, sans stylo (C1, B9, B10, US-1, US-2, US-3).
- [x] Chaque exclusion est justifiée — les deux exclusions du MVP le sont par un blocage externe nommé
      et par une exigence légale (B16, B17, C4), pas par « pas le temps ».
- [x] Aucun identifiant n'est inventé — tout identifiant cité provient du PRD ou du contrat, et les
      quatre manques sont posés en questions au § 8.
- [x] Les risques par version sont identifiés, séparément pour le MVP et pour la V1.
- [x] Les dépendances externes sont listées avec leur statut et la version qu'elles impactent.
- [x] L'effort relatif est cohérent entre versions, et le MVP est annoncé XL sans arrondi.
- [x] Aucune fonctionnalité P1 n'est en V2 : les sept histoires P1 sont dans le MVP, et les six
      repoussées au-delà du MVP sont toutes P2.
- [x] Les deux catégories d'exclusion sont traitées différemment — les exclusions reportables ont une
      ligne de backlog avec leur condition d'entrée, les exclusions refusées n'ont ni ligne ni date.
- [x] Les trois durées — validité du devis, délai de paiement, relance — restent distinctes et ne
      sont jamais fusionnées en un délai unique.
- [x] Le document ne contient pas de jargon d'implémentation.

**Statut** : `draft` → en attente de validation.