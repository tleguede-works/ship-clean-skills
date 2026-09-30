---
type: roadmap
status: approved
generated_at: 2026-09-30
derived_from:
  - .forge/prd.md
---

# Roadmap — Bailly

> Ce document définit **CE QUI sera livré** et **QUAND**.
> Inspiré du PRD (`.forge/prd.md`). Chaque règle métier citée référence son ID source (B*).
>
> La roadmap est vivante — elle évolue avec les retours utilisateurs et les découvertes techniques.

---

## 1. Vision par version

| Version | Thème / Promesse | Critère de succès principal | Cible |
|---|---|---|---|
| **MVP** | « Ce que j'ai signé est parti. » | Le propriétaire répond au téléphone « c'est confirmé » ou « pas encore confirmé » **sans regarder l'application**, et saisit ses faits le jour même | T2 2027 |
| **V1** | « Le bail tient ses promesses. » | Les cinq échéances sont **dérivées** et démontrées avec l'horloge du bail, pas avec des dates de démonstration | T4 2027 |
| **V2** | « Le dossier sort de Bailly. » | L'export complet des 14 baux a été produit, lu, et **rejoué sans Bailly** | T1 2028, conditionnel |

**Le MVP ne promet pas de gérer la location. Il promet de ne pas mentir.** C'est la
seule promesse que ce produit peut tenir avec un utilisateur, et c'est celle que le
commanditaire a formulée le premier.

---

## 2. MVP — Minimum Viable Product

> Le plus petit ensemble qui permet au propriétaire de **saisir, encaisser et ne pas
> mentir sur ce qui est parti**. Ces deux exigences ne sont pas la même, et c'est la
> seconde qui décide du découpage.

### 2.1 Périmètre

| # | Slice | US | B* | E* | Justification de l'inclusion |
|---|---|---|---|---|---|
| 1 | **`socle-synchronisation`** | — | B1, B2, B3, B4, B6 | E1, E2, E3 | **Le premier test du produit, pas le quatrième.** Un compteur honnête et une reprise automatique sans lesquels aucune autre slice n'est vérifiable : B1 est la règle qui domine tout, et une règle qui s'applique à toutes les autres doit exister avant elles. |
| 2 | **`dossier-bail`** | US-4 | B12, B17 | E5 | **La source des dates.** Les cinq échéances en dérivent (B12), donc sans elle le garde-fou n'a rien à afficher et chaque slice de date lira ses propres dates à la main. Un prérequis traité comme une donnée saisie est une donnée saisie. |
| 3 | **`saisie`** | US-1, US-3 | B1, B2, B16 | E11 | Le quotidien, et c'est la seule slice que le propriétaire utilise tous les jours (R1). |
| 4 | **`piece-jointe`** | US-2 | B3, B8 | E1, E12 | **Séparée, et c'est un arbitrage.** C'est la seule dont l'échec vient de **l'environnement** et non de la logique : fusionnée dans `saisie`, elle se teste en 4G et se découvre en métro. Son risque est le risque n°2 du produit (R2). |
| 5 | **`encaissement`** | US-5, US-6 | B15, B16 | E9, E11 | Qui a payé, qui n'a pas payé, qui en retard — et la relance **avec sa preuve d'envoi**, qui est la seule chose que l'application ne sait pas faire hors ligne (B15). La relance **n'a pas d'état propre** : c'est un acte sur l'encaissement, donc elle vit dedans. |
| 6 | **`demandes`** | US-7 | B14 | E8 | Une seule slice, avec **qui doit agir** obligatoire (B14) — sans elle la moitié de la liste est untraitable et le propriétaire cesse de l'ouvrir. |
| 7 | **`garde-fou`** | US-8 | B13, B12 | — | Le garde-fou d'échéances. **Une property, pas une fonctionnalité** : un écran de rappels s'ouvre quand on a déjà oublié, donc trop tard. |
| 8 | **`donnees-personnelles`** | — | B7, B8, B9, B10, B11, B18 | E5, E6, E7, E10 | **Ce qui manquait, et je ne l'avais pas vu comme une slice.** B9 (trois états RGPD) et B11 (export lisible sans Bailly) ne sont portés par aucune autre slice. Assignés explicitement, ou ils n'existent pas — et B11 est **la condition de survie du produit** (R8). |

**Le MVP a huit slices**, pas neuf : le garde-fou est une property attachée aux écrans
qui portent une échéance, et non un écran.

### 2.2 Ce qui n'est PAS dans le MVP

| Élément | Raison | Ce que le produit perd | Version cible |
|---|---|---|---|
| **Relance en slice séparée** | « La relance n'a pas d'état propre : c'est un acte sur l'encaissement. Son caractère en-ligne-obligatoire est une règle écrite dans une slice, pas un motif de découpage — sinon je découpe tout. » | Rien : la preuve d'envoi reste une trace serveur, donc de l'infra. | — |
| **Somme due** hors loyer et provisions | « Régularisation des charges » est exclu, « somme due » non : **la frontière est exactement là où ça va mentir.** Alors on la pose explicitement. | Rien pour l'instant. Le calcul des charges reste hors scope, et B16 interdit tout calcul par l'application. | V1, à condition que la formule soit validée |
| **Les deux échéances longues** (diagnostics, assurance) | Leur échéance est **une marge, pas une alarme** : 6 ans, annuel. Ce n'est pas la même famille que les trois autres (voir § 2.3). | Le propriétaire ne voit pas venir une échéance à 6 ans. Il le voit à 6 mois. | V1 |
| **Signature électronique qualifiée (eIDAS)** | B5 définit ce que « signé » signifie ici. Une signature qualifiée est un autre produit, avec un autre niveau de preuve et un autre coût. **Dit** : ce n'est pas un oubli. | Une signature sans valeur de signature électronique qualifiée — ce qui est **exactement** ce que B5 promet, et B5 est la règle. | hors dossier |
| **Notifications poussées** | Le compteur de synchronisation est permanent (B6) et le garde-fou est une property (US-8). Une notification est un canal de plus à maintenir, pour dire la même chose. | être prévenu sans ouvrir. Un canal de plus, pour une information déjà visible en permanence. | V2, conditionnel |
| **Multilingue, multi-devises, multi-pays** | C10. Un propriétaire de 14 appartements à Lyon n'a pas de devises, et n'a pas besoin de traduction. | Rien. | — |

### 2.3 Les cinq échéances, et pourquoi deux ne sont pas des rappels

Le commanditaire les a nommées, et il les a **classées lui-même** — ce qui est la partie
utile. Elles ne se ressemblent pas.

| # | Échéance | Rappel à | Délai | Ratée, ça coûte | Famille |
|---|---|---|---|---|---|
| 1 | **Fin de terme du bail** (opposition à la reconduction tacite) | moi | 3 mois avant — **6 en meublé** | reconduction tacite de 3 ans, relogement perdu | **bloquante** |
| 2 | **Bascule en créance exigible** | moi, puis relance au locataire | 6e jour | plus de base légale pour agir ; une relance hors délai ne vaut rien | **bloquante** |
| 3 | **Restitution du dépôt de garantie** | moi | 1 mois — **21 jours si aucune retenue** | intérêts et pénalités, quand le dossier est le plus fragile | **bloquante** |
| 4 | **Validité des diagnostics** (DPE, électricité, gaz, amiante, plomb) | moi | 6 ans — **10 ans** pour un DPE antérieur à 1948 | dossier qui ne tient pas, nullité possible, pénalité | **marge** |
| 5 | **Assurance propriétaire (PNO)** | moi | annuel | la square est à découvert | **marge** |

**Les trois premières méritent un blocage, les deux autres une alerte longue et
silencieuse.** Et la raison est celle que le commanditaire a donnée : les trois
premières sont une **alarme**, les deux autres une **marge**. C'est la première fois
dans ce projet qu'une property se décompose en deux comportements distincts — et ça
n'est pas un détail d'implémentation, c'est la forme du garde-fou.

**Le compromis, écrit** : quittance annuelle, régularisation des charges et révision du
loyer sont **exclues du produit, réelles en droit, tenues par le calendrier du
commanditaire.** Le produit ne les rappelle pas, donc le rappel est un calendrier
externe. C'est un défaut connu et accepté, pas un oubli.

### 2.4 Risques spécifiques au MVP

| Risque | Prob. | Impact | Mitigation |
|---|---|---|---|
| **R1** — le propriétaire saisit moins qu'avant, parce que l'application est plus lente que sa mémoire | haute | **le produit entier** | Huit slices, pas quatorze écrans. Le MVP est testable par « est-ce que je saisis plus qu'avant ? », pas par « est-ce que c'est complet ? » |
| **R2** — une photo reste sur l'appareil et il le croit partie | moyenne | élevée | `piece-jointe` est une **slice séparée**, donc sa preuve est séparée. B3 : la photo est sur l'appareil **avant** la tentative réseau. Le compteur de l'écran d'accueil (B6) dit le nombre, en permanence. |
| **R3** — il ne voit pas la différence entre « signé ici » et « synchronisé » | moyenne | élevée | B2 : trois mots, et le critère de succès n°1 est **qu'il puisse le dire sans regarder l'application** |
| **R4** — l'hébergeur perd les données | faible | catastrophique | `donnees-personnelles` au MVP, pas en V1 : l'export lisible sans Bailly (B11) est ce qui rend le produit récupérable |
| **R7** — un jugement écrit dans un champ de constaté finit exporté comme un fait | **haute** | moyenne | B8 : la saisie libre **demande** sa classe. Le risque reste, c'est le comportement humain — donc le contrôle est sur l'**écran**, pas sur l'intention |
| **R10** — **le MVP ne peut pas être démontré** parce qu'aucune slice ne comporte d'horloge | **certaine** | **bloquant** | voir § 2.5 |

### 2.5 Le défaut de structure, et la règle qu'il impose

> *« Ma roadmap n'a pas d'horloge. Une slice est finie quand elle marche une fois. Or
> « en retard » n'existe qu'au 6e jour, la reconduction tacite qu'au 36e mois, le dépôt
> qu'après le départ. Conséquence : le garde-fou en position 8 ne sera pas
> démontrable, et les autres auront été bâtis sur des dates inventées pour la démo. »*

C'est le reproche le plus utile reçu sur ce projet, et il porte sur la **méthode**, pas
sur le périmètre.

**Une slice de ce produit n'est pas finie quand elle marche une fois. Elle est finie
quand elle marche à une date simulée, en mode avion.** Trois cas :

| Slice | Sa date |
|---|---|
| `encaissement` | le **6 du mois** — c'est là que « en retard » existe, et pas avant |
| `garde-fou` | le **11e mois du terme** — c'est là que la reconduction tacite devient visible |
| `socle-synchronisation` | **n'importe quelle date, mode avion** — parce que c'est la seule dont l'échec ne dépend pas du moment |

**La règle qui en sort** : une slice dont le comportement dépend d'une date ne peut pas
être démontrée par « ça marche ». Elle se démontre par **une horloge simulée**, et
l'horloge est **de l'infrastructure de test**, pas un réglage du développeur. C'est la
même famille que la boutique de démonstration d'Onduleur (R7) : du temps calendaire
qu'on ne voit pas sur une branche.

Et c'est **le même test manquant** que dans les deux erreurs précédentes du projet —
la signature hors ligne validée parce qu'elle marche au bureau, la journée de saisie
jugée unique parce qu'elle marche un lundi avec du réseau :

> **Le test manquant est identique dans les deux cas : le 6 du mois, le 11e mois du
> terme, en sous-sol, sans réseau.** Une slice non démontrable avec une date simulée et
> un mode avion n'est pas finie.

### 2.6 Questions que cette roadmap pose au PRD

| # | Question | Pourquoi elle bloque |
|---|---|---|
| **Q-A** | La **durée légale de conservation**, par catégorie de pièce. | **B9 n'est pas applicable** : « jusqu'à une date de fin écrite » n'a pas de contenu tant qu'on ne sait pas jusqu'à quand. `donnees-personnelles` ne peut pas être démontrée. |
| **Q-B** | Le **formulaire de la somme due** : loyer + provisions, et rien d'autre ? | Le commanditaire l'a demandé explicitement. C'est la frontière entre « somme due » (au MVP) et « régularisation des charges » (hors scope), et c'est exactement là que ça va mentir. |
| **Q-C** | L'**identité du document** de bail, et les annexes. | US-4 : la pièce jointe du dossier bail est un champ obligatoire ou non. |

Ces trois trous sont **laissés au PRD**. Une roadmap qui réécrit son PRD cesse d'être une
roadmap.

---

## 3. V1 — Première version complète

### 3.1 Ajouts par rapport au MVP

| Élément | US | B* | Justification |
|---|---|---|---|
| **Les deux échéances de marge** (diagnostics, assurance) | US-8 | B12, B13 | Elles existent en droit et ne sont pas dans le MVP. Leur affichage est une **marge** — un avertissement qui ne bloque pas — et c'est ce qui les distingue des trois autres. |
| **Somme due complète** | US-3 | B16 | Si Q-B est tranchée dans le sens « loyer + provisions et rien d'autre », la formule est validée et l'application peut l'afficher. Sinon elle reste hors scope. |
| **L'annexe de bail** | US-4 | B17 | Dépend de Q-C. |

### 3.2 Ce qui est repoussé en V2+

| Élément | Raison | Risque |
|---|---|---|
| **Notification poussée** | Le compteur est permanent (B6). Un canal de plus pour dire la même chose. | que l'échéance manquée soit vue plus tard qu'elle n'aurait dû |
| **Import de l'historique existant** (14 baux sont déjà en cours) | On ne sait pas dans quel format, ni s'il en existe un lisible. **À questionner, pas à supposer.** | Saisir 14 baux à la main est un obstacle d'adoption, et c'est le risque R1 le plus probable |

### 3.3 Risques spécifiques à la V1

| Risque | Prob. | Impact | Mitigation |
|---|---|---|---|
| **R11** — la V1 arrive après que le bail d'un appartement est déjà parti en reconduction tacite | moyenne | fort | Le MVP porte déjà les trois échéances bloquantes, donc le cas est couvert **avant** la V1. C'est la V1 qui rend les deux autres visibles, pas qui évite la perte. |
| **R12** — l'import d'historique est demandé et non fait, et le propriétaire abandonne | moyenne | fort | La question doit être posée au **MVP**, pas à la V1 : c'est un obstacle d'adoption, pas une fonctionnalité. |

### 3.4 Dépendances inter-versions

| La V1 dépend de | Nature | Critique ? |
|---|---|---|
| Le gel du périmètre pendant la validation du MVP | produit | oui |
| Q-A et Q-B tranchées | produit | oui — sans elles la V1 n'a pas de contenu |
| Une horloge simulée en infrastructure de test | technique | oui — voir § 2.5 |

---

## 4. V2 et au-delà

### 4.1 Backlog V2

> *Colonne ajoutée : « quand on aura le temps » n'est pas une condition. Chaque élément porte **le fait qui le fait revenir**.*

| Élément | Priorité | Raison d'être en V2 | **Condition de retour — le fait qui la déclenche** |
|---|---|---|---|
| **Notification poussée** | — | B6 rend le compteur permanent, donc la notification est un doublon | Le propriétaire **ouvre l'application moins d'une fois par semaine** sur une période de deux mois — mesuré, pas supposé |
| **Import d'historique** | — | 14 baux sont en cours | Une **demande explicite** du commanditaire, **et** un format source lisible identifié |
| **Somme due élargie** (au-delà de loyer + provisions) | — | hors scope tant que la formule n'est pas validée | Q-B tranchée **dans le sens large**, **et** la formule de régularisation validée par écrit |
| **Recherche dans l'historique** | — | 14 appartements, ça tient en listes | Le propriétaire **cherche** un fait et ne le trouve pas — signalé, pas observé |

### 4.2 Idées pour le futur (V3+)

- **Comparaison inter-appartements** : *« trois loyers n'ont pas bougé en deux ans, deux ont augmenté de 3 % »*. Revient quand le propriétaire a **plus de 30 appartements**, parce qu'en dessous de 14 appartements le tableau se lit de mémoire. *(le reste du raisonnement est dans la même phrase : c'est un gain, pas une nécessité)*
- **Assistant de relance** (modèle, propose un SMS) : *revient quand le propriétaire dit « j'en ai marre de relancer »* — pas avant. Une relance assistée par une IA sur une créance exigible est un risque juridique, et il n'a aucune raison d'exister tant que la relance est un acte manuel de dix secondes.
- **Mode «Inspection »** : checklist de visite dérivée du bail, avec photo obligatoire par poste. Revient quand le propriétaire fait **plus de dix états des lieux par an** et commence à en oublier un poste.

---

## 5. Compromis assumés

| Compromis | Ce qu'on perd | Ce qu'on gagne | Risque à long terme |
|---|---|---|---|
| **Aucune slice pour la relance** | Une frontière de découpage lisible | La relance est un acte sur l'encaissement, pas un objet ; la découper aurait produit deux écrans pour dix secondes de travail | Qu'on rattache un jour la relance à autre chose qu'à un encaissement — ce qui n'a aucune raison d'arriver |
| **Les deux échéances de marge hors MVP** | Le propriétaire voit venir à 6 mois une échéance à 6 ans | Les trois échéances **à alarme** sont couvertes, et les trois cas où l'on perd de l'argent ou du droit le sont **avant** | Qu'un diagnostic expire sans que personne l'ait vu. C'est le risque réel, et il est **accepté** pour une V1 d'un produit à un utilisateur |
| **La somme due limitée à loyer + provisions** | La régularisation reste à la main | La frontière avec le hors-scope est **écrite**, donc elle ne bouge pas | Qu'un jour une somme ne rentre dans aucune des deux cases. Le produit **refusera** de la saisir, ce qui est la bonne failure |
| **Pas de signature électronique qualifiée** | Une signature sans valeur eIDAS | B5 est la règle qui tient, et elle est **explicite** sur ce qu'elle vaut | Une contestation sur la valeur de la signature. La réponse est B5, et elle est écrite |
| **Aucune agrégation, aucun indicateur** | Le propriétaire ne voit pas « mon taux de retard » | Le PRD dit qu'il **appelle les trois** ; un indicateur serait une chose qu'il consulte au lieu d'appeler | Rien. C'est un produit de saisie, pas un tableau de bord |

---

## 6. Effort relatif par version

| Version | Slices | Taille | Facteurs de risque |
|---|---|---|---|
| **MVP** | **8** | **L** | R1 (le propriétaire saisit moins qu'avant), R2 (photo restée sur l'appareil), R10 (**le MVP n'a pas d'horloge**, voir § 2.5) |
| **V1** | 11 | M | Q-A non tranchée → B9 non applicable ; import d'historique demandé et non fait |
| **V2** | 4 | S | conditionnel : rien ne revient sans un **fait** mesuré |

*Les tailles sont relatives au projet, pas absolues. S = 1-3 slices simples, M = 4-7 slices, L = 8-12 slices.*

**Comparaison directe, dans la même unité : MVP = 1,00 · V1 = 1,38 · V2 = 0,50.**

**Le MVP est L, et c'est le signal utile.** C'est le seul qui ne pourra pas glisser — parce
que c'est le seul dont la démonstration dépend d'une **date simulée**, donc le planning
est contraint par le temps calendaire, pas par le nombre de slices.

---

## 7. Dépendances externes

| Dépendance | Impacte quelle version | Statut | Risque si indisponible |
|---|---|---|---|
| Un hébergeur managé avec engagement de sauvegarde écrit | MVP, V1, V2 | **à confirmer** (Q-3 du PRD) | C1 tient : la donnée vit là, donc « moins de 24 h » est une exigence sans fournisseur. Sans engagement écrit, la reprise se fait par l'export. |
| Un conseil juridique, pour la durée de conservation | MVP | **non sollicité** | **B9 n'est pas applicable.** Le bouton « tout effacer » reste interdit, et les trois états existent sans date de fin. C'est un défaut assumé, pas un contournement. |
| Le format source de l'historique des 14 baux existants | V2 | **inconnu** | L'import ne se fait pas. Le propriétaire saisit. Risque d'adoption (R12). |
| Aucune service tiers pour les données personnelles | MVP, V1, V2 | **tenu** (N8) | Si l'hébergeur journalise, c'est déjà le cas — mais Bailly n'y ajoute rien. |

---

## Checklist de gate

- [x] Chaque version a un critère de succès **mesurable**, pas une intention.
- [x] Chaque élément repoussé porte une **condition de retour** — un fait, pas une date.
- [x] Chaque fonctionnalité est rattachée à des **IDs du PRD** (`B*`, `C*`, `E*`, `US-*`).
- [x] Les exclusions listent **ce que le produit perd**, pas seulement pourquoi.
- [x] Les risques par version ont une mitigation, ou sont nommés comme non mitigables.
- [x] Les questions que la roadmap pose au PRD sont **laissées au PRD**, pas tranchées ici.
- [x] L'effort est **relatif** et comparable d'une version à l'autre.
- [x] **Une slice dont le comportement dépend d'une date est démontrée par une horloge simulée**, pas par « ça marche une fois ».

**Statut** : `draft` → en attente de validation.