---
type: roadmap
status: approved
generated_at: 2026-09-30
derived_from: .forge/prd.md
version: 1
---

# Roadmap — Amberline

> Ce document définit CE QUI sera livré et QUAND.
> Chaque règle métier citée référence son ID source dans `.forge/prd.md`.

---

## 1. Vision par version

| Version | Thème / Promesse | Critère de succès principal | Cible |
|---|---|---|---|
| MVP | **Un chiffre, une définition, une signature.** Trois indicateurs définis et signés, un dashboard officiel partagé à une liste nominative, restriction de lignes prouvée sur des données réelles. | Le comité de direction ouvre le dashboard, ne trouve aucune valeur sans date de calcul, et personne ne recalcule un chiffre à la main pendant la séance. | T_livraison : 3 mois (C6, date du comité — contrainte externe, pas une estimation) |

### 1.1 Les trois jalons du MVP, et pourquoi ils ne se confondent pas

| Jalon | Nature | Ce qu'il protège |
|---|---|---|
| **T_noms** — nommer les titulaires du rôle de signataire (`F-001`) | amont, hors chemin de build, faisable demain | Le MVP. C'est **le seul** jalon actionnable. |
| **T_première signature** | validation, plus basse que la livraison | Le statut « officiel ». Ne peut pas arriver avant le build : elle ne se prévient pas, elle se constate. |
| **T_livraison** — 3 mois | engagement de livraison | La date du comité. |

**On peut livrer à temps et rater le MVP.** Sans indicateur signé, le dashboard
n'est pas officiel et la séance du comité refait exactement le problème que le
projet devait supprimer. C'est pourquoi les deux dates coexistent au lieu de se
remplacer : `T_noms` est daté avant `T_première signature`, qui est antérieure à
`T_livraison`.

> Aucun garde-fou n'attrape cela : ils vérifient les identifiants, pas les dates.
> Un jalon non écrit dans la roadmap est un jalon qui n'existe pas.
| V1 | **Chacun sa vue.** Le composeur libre arrive, avec les seuils et les alertes dès que les indicateurs le permettent. | 3 des 5 managers d'équipe ont composé au moins une vue libre sans aide. | 6 mois |
| V2 | **Automatiser la surveillance.** Commentaires d'indicateur, intégration par API bornée, lecture sur téléphone. | Une demande faite au comité est livrée en moins d'une journée. | 12 mois |

---

## 2. MVP — Minimum Viable Product

> Le plus petit ensemble qui résout le problème principal et peut être utilisé par
> des utilisateurs réels. Ici, « problème principal » n'est pas « voir des chiffres » :
> c'est « ne pas produire deux versions d'un même chiffre ».

### 2.1 Périmètre

| User story (PRD) | Règles métier | Justification de l'inclusion |
|---|---|---|
| US-1 : Déclarer un indicateur | B1, B3, B22 | Sans définition versionnée il n'y a pas de chiffre à contester. C'est le cœur du problème. |
| US-2 : Faire signer une définition | B2, B26 | Sans signature, la définition reste un avis. C'est la réponse directe au risque « la direction tranche à l'oral ». |
| US-3 : Consulter un indicateur officiel | B4, B5, B6, B14, B17 | La lecture est le livrable visible. Sans date de calcul prise dans la source (B5), elle reproduit le problème : un chiffre faux mais bien daté. |
| US-4 : Détecter une anomalie | B11 | Le standard de l'archétype « seuil et couleurs sémantiques » est structurellement dans le MVP. Le MVP livre **l'état** — hors seuil ou dans la zone, avec sa date de calcul — dérivé de la valeur, sans machine à états ni tâche de fond. **B12 (une alerte par passage, réarmement) part entièrement en V1** avec le canal mail : ces deux règles n'ont de sens que pour un *événement* envoyable, et un état se dérive sans coût. |
| US-11 : Comparer à une cible | B14 | La cible est un **champ de la forme de définition**, versionné avec elle (B14). Sans elle, la couleur sémantique de US-4 n'a pas la référence qui la justifie. L'écran de gestion des cibles est un objet de V2 — à trois indicateurs, ce serait une liste de trois champs. Effet : E16 (« cible à reconfirmer ») sort du MVP. |
| US-5 : Investiguer | B15, B7 | C'est la troisième étape de la boucle `dashboard` (surveiller → détecter → investiguer). Sans elle, l'alerte ne sert qu'à constater qu'il y a un problème. |
| US-6 : Publier et partager un dashboard officiel | B9, B16, B8 | C'est la séance de comité (C6). Le partage est nominatif : le lien public est retiré en § 9 du PRD. **Périmètre strict, fixé au gate de la Phase 2** : assemblage **fixe** d'indicateurs officiels — aucune liberté de placement, aucun filtre libre en dehors de ceux écrits dans la définition. Toute composition libre est US-10, en V1. Sans cette borne, le MVP livre la moitié de US-10 sous un autre nom. |
| US-7 : Ne pas voir ce à quoi on n'a pas droit | B7, B8 | C'est une exigence de sécurité (C10) doublée d'une exigence métier : la production ne doit pas voir le CA par client. Elle est démontrable, donc elle est dans le MVP. |
| US-8 : Justifier ce que j'ai consulté | B10, B23, B25 | C4 est une contrainte légale. Elle ne peut pas être un « nice to have » : une contrainte légale non tenue est une contrainte non tenue. |
| US-9 : Exporter une vue pour une réunion | B27, B22 | Un export sans provenance reproduit exactement le problème, hors de l'outil : le support de juin circule encore en octobre. |
| US-17 : Voir pourquoi mon chiffre a changé | B22, B24 | Le cas « 94,8 % puis 96,2 % » est le problème résolu à moitié : sans historique, l'outil tranche sans montrer sur quoi il tranche. |

### 2.2 Ce qui n'est PAS dans le MVP

| Élément | Raison de l'exclusion | Risque de l'exclusion | Version cible |
|---|---|---|---|
| B12 — alerte et réarmement | Une alerte par passage suppose un **événement** et un canal. L'état (hors seuil / dans la zone, daté) est dans le MVP, il se dérive de la valeur et ne coûte rien. | Une dérive n'est pas signalée pendant une absence. Acceptable : le manager voit l'indicateur chaque matin, fréquence déclarée au PRD. | V1 |
| US-10 : Explorer sans publier | `premise-challenger` : `already_solved` (Metabase et Power BI le font, déjà payés), et l'effort placé ici aurait produit une capacité déjà possédée deux fois sur un problème de **définition**. | Le temps gagné sur le MVP est réinvesti dans les trois définitions signées. Le critère « construire sa vue » est donc mesuré à 6 mois, pas à 3. | V1 |
| US-11 — **écran** de gestion des cibles | Le champ existe dans le MVP (B14). Un écran dédié n'a de sens qu'au-delà de quelques dizaines d'indicateurs. | Les cibles sont saisies dans la forme de définition. Gênant à trois indicateurs, assumé. | V2 |
| US-12 : Recevoir une alerte par mail | Dépend de l'adoption de US-4. Une alerte mail vers quelqu'un qui n'a pas encore l'outil dans ses habitudes est du bruit. | Aucun. L'alerte est réactivable par un réglage dans le produit. | V1 |
| US-13 : Commenter un indicateur | `premise-challenger` : un commentaire ancré à un point de graphique est une donnée qu'on ne peut plus effacer proprement, et dont le sens dépend d'une version de calcul. Il sera ancré sur l'indicateur versionné. | Le « pourquoi » reste dans les réunions et les mails, comme aujourd'hui. | V2 |
| US-14 : Lire une valeur par programme | C11 : bornée aux indicateurs officiels. Une intégration non bornée contourne la gouvernance, qui est le produit. | Le comité qui veut un chiffre se le fait encore une fois par screenshare. | V2 |
| US-15 : Consulter en déplacement | P4 au PRD, et le téléphone est le dernier endroit où un comité de direction ne regarde pas de chiffres. | Aucun — personne ne l'a demandé en meeting. | V2 |
| US-16 : Détecter une anomalie sans seuil | Retiré du PRD (§ 9, B19) : le vrai défaut est l'absence de seuil écrit, pas l'absence d'algorithme. | Aucun. | V2 |

### 2.3 Risques spécifiques au MVP

| Risque | Probabilité | Impact | Mitigation |
|---|---|---|---|
| Les trois indicateurs ne sont jamais signés faute de titulaire du rôle signataire (`prd.md` § 12.1) | HIGH | HIGH | Le rôle est **tranché** (B2 : signataire distinct de l'auteur) ; il ne manque que les noms. Constat `F-001`. Le jalon réel du MVP est la **première signature**, pas la fin des trois mois. |
| L'accord d'infrastructure sur l'entrepôt de test seedé n'aboutit pas | MEDIUM | HIGH | Constat `F-002`. Sans lui, B7 n'est pas **démontrable** (E5, E10) : le critère de sécurité reste non vérifié, ce qui n'est pas la même chose qu'inconfortable. Escalade avant la Phase 4. |
| Le produit est livré sans jamais être utilisé en séance | MEDIUM | HIGH | C9 : le tableur reste ouvert, donc rien ne force l'usage. Le critère de succès est mesuré à 3 mois, pas promis. |
| La direction ouvre le dashboard et découvre que « taux de service » a deux définitions signées | MEDIUM | HIGH | E18 le couvre : aucune correction automatique, les deux restent officielles, et le conflit est remonté au propriétaire de chacune. C'est délibéré — corriger l'un des deux silencieusement aurait été pire. |

---

## 3. V1 — Première version complète

### 3.1 Ajouts par rapport au MVP

| User story (PRD) | Règles métier | Justification |
|---|---|---|
| US-10 : Explorer sans publier | B13, B7 | Le composeur arrive une fois les trois définitions signées et l'usage mesuré. Un indicateur non officiel y reste visible mais non partageable. |
| US-12 + US-4 (notification) : alerte par mail | B12 | La machine à états (alerte unique par passage, réarmement) et le canal mail arrivent ensemble : le canal devient pertinent quand il y a des seuils signés sur des indicateurs que le destinataire regarde déjà. |
| US-16 : Détecter une anomalie sans seuil | B19 (retiré) | Reste P4 tant que les seuils ne sont pas posés. |

### 3.2 Ce qui est repoussé en V2+

| Élément | Raison | Risque |
|---|---|---|
| US-13 : Commentaires | Donnée non effaçable, ancrée sur une version. V2. | Le contexte reste hors outil. |
| US-14 : API de lecture | C11 : ne doit pas devenir le chemin principal. V2, bornée. | L'intégration manuelle continue. |
| US-15 : Téléphone | P4, aucune demande réelle. V2. | Aucun. |

### 3.3 Risques spécifiques à la V1

| Risque | Probabilité | Impact | Mitigation |
|---|---|---|---|
| Le composeur libre reproduit le problème qu'il est censé résoudre : 40 définitions officieuses | MEDIUM | HIGH | B13 : un indicateur sans définition signée ne peut pas être partagé. Le composeur ne crée pas de droit de publication. |
| Les alertes mail se font ignorer (piège d'archétype : « alertes ignorées ») | MEDIUM | MEDIUM | B12 : une alerte par passage seulement, et réarmement au retour dans la zone. On mesure le taux d'ouverture et le retour au silence avant d'élargir. |

### 3.4 Dépendances inter-versions

| La V1 dépend de | Nature | Critique ? |
|---|---|---|
| Trois définitions signées (MVP) | produit | oui — sans indicateur officiel, un composeur n'a rien à composer |
| `F-001` et `F-002` levés | organisation / infrastructure | oui |
| Volume d'indicateurs au-delà de ~50 | produit | non — le composeur libre devient nécessaire à ce point |

---

## 4. V2 et au-delà

### 4.1 Backlog V2

| User story (PRD) | Priorité | Raison d'être en V2 | Dépend de |
|---|---|---|---|
| US-13 : Commenter un indicateur | P3 | Le « pourquoi » d'un trou est aujourd'hui dans les mails, hors journal et hors audit. | Un indicateur versionné signé (MVP) |
| US-14 : Lire une valeur par programme | P3 | Automatiser le comité. | C11 — bornée aux indicateurs officiels |
| US-15 : Consulter en déplacement | P4 | Aucune demande réelle à ce jour. | MVP |
| US-16 : Détecter une anomalie sans seuil | P4 | Décision d'arbitrage : ce n'est pas le défaut à traiter. Reste P4 tant que les seuils ne sont pas posés. | US-4 (V1) |

### 4.2 Idées pour le futur (V3+)

- **Rapprochement avec l'ERP** — explicitement hors périmètre par C8. Ne le rouvrir que si l'ERP expose des écritures en lecture.
- **Détection d'anomalie sans seuil, revisitée** — seulement après mesure du taux d'alertes ignorées sur la V1.

---

## 5. Compromis assumés

<!-- La section la plus importante. Chaque exclusion est un compromis conscient. -->

| Compromis | Ce qu'on perd | Ce qu'on gagne | Risque à long terme |
|---|---|---|---|
| **Pas de constructeur de vues dans le MVP** | L'autonomie de composition, qui est le besoin de surface. | Trois mois pour faire ce que Metabase fait déjà et que personne n'utilise ; et les trois définitions signées qui, elles, n'existent nulle part. | Si la demande de composition devient le frein n°1, on l'a mesuré à 6 mois, pas deviné. |
| **Seuil dans le MVP, notification mail en V1** | La détection automatique pendant une absence. | Aucun bruit envoyé à personne avant que les seuils soient signés et les habitudes installées. | Une dérive non vue coûte au maximum une journée, mesurée sur l'intervalle de lecture des managers. |
| **Le tableur reste ouvert (C9)** | La possibilité d'imposer la migration. | L'adoption réelle : on gagne l'usage de l'intérieur. Le tableur est le standard de facto et il gagne toujours, parce qu'il est le plus rapide et le seul sans contrôle. | Le tableur reste le lieu de calcul réel. Le critère de succès est l'usage mesuré ; si le tableur gagne encore au 6ᵉ mois, le produit n'a pas résolu le problème — il faut le dire, pas le cacher. |
| **Aucune correction automatique en cas de conflit (E18)** | La résolution automatique d'un désaccord. | Les deux définitions restent visibles et tracées ; le conflit remonte à un humain qui a le mandat de trancher. | Un conflit non tranché reste un conflit. Le journal rend visible le fait qu'il y en a un. |
| **Pas de mode hors-ligne ni de mobile** | La consultation en déplacement. | — | Aucun risque identifié. |

---

## 6. Effort relatif par version

| Version | Slices estimées | Taille relative | Facteurs de risque |
|---|---|---|---|
| Fondations | 5 | M | Transverse, bloque tout. La fondation « rights » porte B7 et doit être démontrée. |
| MVP | 9 | L | La signature et la versioning des définitions sont le cœur ; le journal d'accès est une contrainte légale, donc non négociable. |
| V1 | 4 | M | Le composeur est le plus gros morceau, et c'est celui dont le besoin est le moins prouvé en interne. |
| V2 | 4 | S | Chacune est indépendante. |

*Les tailles sont relatives au projet, pas absolues.*

---

## 7. Dépendances externes

| Dépendance | Impacte quelle version | Statut | Risque si indisponible |
|---|---|---|---|
| Entrepôt de données (lecture seule) | MVP | disponible | Le produit n'existe pas sans source. |
| Fournisseur d'identité OIDC de l'entreprise | MVP | **à nommer** (`prd.md` § 12.1 point 2) | « Fail-closed » inapplicable : B7, B10 et B23 ne sont pas constructibles. |
| Entrepôt de test seedé (équipe data) | MVP | **accord non obtenu** (`prd.md` § 12.1 point 3) | B7 n'est pas démontrable ; le critère de sécurité n'est pas vérifié. |
| Hébergement UE | MVP | à contractualiser | C3 est une contrainte légale. |
| Metabase (déjà auto-hébergé) | V1 | disponible | Extinction prévue à la première validation, par le porteur du projet. |
| Power BI (via M365) | V1 | indissociable | La licence ne peut pas être récupérée : le produit doit rendre le service obsolète, pas le supprimer. |

---

## Checklist de gate

- [x] Le MVP résout le problème principal du PRD.
- [x] Chaque exclusion est justifiée (pas juste « pas le temps »).
- [x] Les risques par version sont identifiés.
- [x] Les dépendances externes sont listées avec leur statut.
- [x] L'effort relatif est cohérent entre versions.
- [x] Aucune fonctionnalité P1 n'est en V2 sans justification exceptionnelle.
- [x] Le document ne contient pas de jargon d'implémentation.

**Statut** : `draft` → en attente de validation.