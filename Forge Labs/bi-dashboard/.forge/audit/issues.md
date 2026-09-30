---
type: audit-issues
status: open
generated_at: 2026-09-30
---

# Journal d'incidents — Amberline

> Ce fichier est le **journal de bord des problèmes rencontrés pendant l'exécution de Forge**.
> Il est destiné à être lu, pas juste archivé.
>
> **L'origine est le champ le plus important.** C'est lui qui distingue « Forge a mal
> guidé » de « le PRD était ambigu ». Un skill qui s'améliore est un skill qui sait
> compter ses propres échecs.

---

## Convention

| Champ | Valeurs |
|---|---|
| **Gravité** | `bloquant` (a empêché d'avancer) · `majeur` (a coûté du temps ou du contournement) · `mineur` |
| **Origine** | `forge` (faiblesse du skill) · `projet` (spécification insuffisante) · `environnement` |
| **Phase** | `0` … `8` |

---

## Incidents

### INC-004 — Le contrôle de contrat de phase a hurlé sur une phase jamais commencée

- **Date** : 2026-09-30T09:05:00Z
- **Gravité** : majeur
- **Origine** : forge
- **Phase** : 1 → 2
- **Symptôme** : immédiatement après `complete-phase 1_prd`, `forge-guard all` passe en rouge : `current_phase_has_deliverables`, `roadmap : aucun livrable enregistré pour cette phase`. Le roadmap n'avait pas encore été écrit.
- **Cause racine** : `complete-phase` avance `current_phase` à la phase suivante dès qu'il approuve. Cette phase est donc « courante » alors qu'elle est au statut `not_started`. Le commentaire du contrôle affirmait au contraire qu'il ne jugeait pas les phases futures.
- **Contournement** : aucun — **on n'a pas contourné**. Le projet a été arrêté, le skill corrigé (série 2, PR #9), corrigé, et la transition rejouée. `skip` avec raison nommée.
- **Coût** : le temps d'arrêter le projet au milieu d'une phase pour un défaut du skill, et le risque réel de « ne plus lire la sortie ».
- **Action corrective** : ne juger que les phases commencées. **Fait**, v1.1.8.
- **Statut** : corrigé

### INC-003 — La trace des sources d'un artefact a disparu au premier changement de statut

- **Date** : 2026-09-30T08:18:00Z
- **Gravité** : bloquant
- **Origine** : forge
- **Phase** : 1
- **Symptôme** : `derived_from:` de `benchmarks.md` (liste YAML de deux sources) est devenu `derived_from:` vide au premier `set-status`. `forge-guard all` et `consistency-check all` sont restés au vert.
- **Cause racine** : le lecteur de front matter n'implémentait qu'un YAML plat ; une séquence en bloc était lue comme une chaîne vide, puis réécrite vide par `set-status`.
- **Contournement** : aucun. `derived_from` est le contrat de lecture d'un validateur Fast Track : le laisser vide aurait rendu les validations ultérieures non probantes. Le skill a été corrigé (série 1, PR #8), puis le document réparé à la main — **une correction du script ne répare pas la donnée perdue**.
- **Coût** : ~1 h (correction, tests, PR, merge, release, réparation du document), plus un risque de faux vert sur toutes les validations à venir.
- **Action corrective** : lecteur block-sequence + idempotence + contrôle `derived_from_non_empty`. **Fait**, v1.1.7.
- **Statut** : corrigé

### INC-002 — Un constat de gate que rien ne pouvait voir

- **Date** : 2026-09-30T08:40:00Z
- **Gravité** : majeur
- **Origine** : forge
- **Phase** : 1
- **Symptôme** : `conventions.md`, approuvé en Phase 0, justifiait cinq décisions par « le partage par lien », exigence retirée en Phase 1. `consistency-check premises` : `retired: []`, `pass: true`.
- **Cause racine** : le contrôle ne lit que `state.deliverables[*].requires`, liste saisie à la main. La déclaration est vraie mais fausse par omission, et la justification elle-même est en prose.
- **Contournement** : aucun. Constaté par le demandeur à la gate, pas par un script.
- **Coût** : le risque que tout le socle technique repose sur une prémisse abandonnée — le motif le plus coûteux d'un projet, celui que le skill prétend précisément couvrir.
- **Action corrective** : remontée des citations d'ID retiré dans le corps d'un livrable approuvé + liste des prémisses non déclarées dans `state.js start`. **Fait**, v1.1.8 et 1.1.9.
- **Statut** : corrigé

### INC-001 — La première commande du workflow est impossible à exécuter

- **Date** : 2026-09-30T07:52:00Z
- **Gravité** : bloquant
- **Origine** : forge
- **Phase** : 0
- **Symptôme** : `node scripts/state.js start` — première commande de l'Étape 0 — échoue sur `Cannot find module '<projet>/scripts/state.js'`. Le projet n'a pas de dossier `scripts/`.
- **Cause racine** : la documentation donnait des chemins relatifs au projet alors que les scripts sont installés avec le skill. Les messages d'erreur des scripts, eux, reprenaient la forme cassée.
- **Contournement** :l'introduction d'un `FORGE` — c'est-à-dire une correction du skill, faite avant de continuer.
- **Coût** : la première commande du skill ne marche pas. Qui lit la documentation à la lettre ne peut démarrer aucun projet.
- **Action corrective** : `$FORGE` défini et documenté, toutes les commandes réécrites, test de non-régression. **Fait**, v1.1.7.
- **Statut** : corrigé

---

## Incidents d'origine `projet` — le PRD était incomplet

### INC-005 — Trois rôles absents du PRD, dont un qui bloque tout le MVP

- **Date** : 2026-09-30T08:20:00Z
- **Gravité** : bloquant
- **Origine** : projet
- **Phase** : 1
- **Symptôme** : personne n'est désigné comme signataire des définitions chez ce client. B2 et US-2 sont donc inapplicables, et **tout le MVP tombe**. Deux autres bloquants existaient dans `conventions.md` sans remonter au PRD : le fournisseur d'identité non nommé, et l'entrepôt de test seedé non obtenu — ce dernier étant la **preuve** du critère de sécurité B7, pas du confort de test.
- **Cause racine** : l'interview a demandé « qui utilise » et « quelles fonctionnalités », pas « qui décide ». Un produit dont la valeur est un **arbitrage** a une exigence d'organisation aussi dure qu'une exigence de fonctionnalité.
- **Contournement** : le `premise-challenger` a bloqué la phase sur ce point, ce qui a empêché l'architecturer dessus. La moitié structurelle a été tranchée au gate (signataire distinct de l'auteur) ; les noms restent ouverts et sont portés par le constat `F-001`.
- **Coût** : ~2 h d'aller-retour, dont une reprise complète de B2, du glossaire, d'US-1 et d'US-2.
- **Action corrective** : côté projet, § 12 restructuré en trois bloquants datés. **Côté skill, il n'y a rien à corriger** : le blocage par `premise-challenger` a fonctionné comme prévu, et c'est le PRD qui était incomplet, pas la méthode.
- **Statut** : ouvert (les noms)

### INC-006 — Une user story contredisait la règle métier qu'elle porte

- **Date** : 2026-09-30T09:10:00Z
- **Gravité** : majeur
- **Origine** : projet
- **Phase** : 1
- **Symptôme** : après la réécriture de B2 (« signataire distinct de l'auteur de la version »), le critère d'acceptation d'US-2 disait toujours « signature horodatée d'un propriétaire désigné », et le glossaire disait les deux choses à la fois. Un implémenteur écrivant son test depuis US-2 livre l'auto-signature que la règle interdit.
- **Cause racine** : la règle a été corrigée sans que ses **dépendants** le soient. Changer un ID de règle ne déclenche aucune révision des user stories qui le citent.
- **Contournement** : trouvé à la gate, pas par un script — aucune contrôle ne sait que « propriétaire désigné » et « signataire distinct de l'auteur » sont contradictoires.
- **Coût** : faible en temps, **potentiellement grave en production** : c'est la règle qui porte toute la promesse du produit (« le chiffre contestable »).
- **Action corrective** : projet, US-1/US-2 et glossaire réécrits. Le skill n'a pas de contrôle sur ce couple — voir `Forge Labs/INCIDENTS.md` § O-01.
- **Statut** : corrigé

### INC-007 — L'architecture et les plans ont été produits avant le gate du design
- **Origine** : Forge
- **Constat** : `architecture.md` (1838 lignes) et quinze plans se sont écrits et
  enregistrés pendant que le design portait `status: draft`. `state.json` disait
  `current_phase: 3` et `4_architecture: not_started`.
- **Pourquoi rien ne l'a vu** : `current_phase_has_deliverables` ne juge que la
  phase **courante**. Il n'existait nulle part la notion de phase d'un artefact,
  donc un livrable produit en avance n'existait pour aucun des douze contrôles.
  C'est le **demandeur simulé** qui l'a trouvé, au gate, en relisant `state.json`.
- **Contournement** : aucun. Le défaut était dans le skill, pas dans le projet.
- **Action corrective** : `PHASE_ARTIFACT_OWNERS` + refus de `state.js register`
  + `forge-guard no_premature_artifacts` — PR #16, v1.3.1. Voir
  `Forge Labs/INCIDENTS.md` § F-21.
- **Statut** : corrigé

### INC-008 — Le design s'est écarté d'une décision de Phase 2 approuvée
- **Origine** : Forge
- **Constat** : le design plaçait la machine de franchissement (US-4, B12) dans
  le MVP. `roadmap.md` § 2.1, § 2.2 et § 3.1 disent le contraire, trois fois :
  « sans machine à états ni tâche de fond. B12 part entièrement en V1 ».
  `architecture.md`, écrit **plus tôt**, portait déjà le bon périmètre mot pour
  mot — c'est le design qui s'en était écarté, alors qu'il avait l'artefact
  approuvé sous les yeux, dans le même dossier.
- **Pourquoi rien ne l'a vu** : `consistency-check` ne joint pas les livrables
  aux tableaux de jalon de la roadmap. Aucune obligation n'est vérifiée : une
  règle du PRD citée à l'appui d'une conclusion peut ne pas dire cela.
- **Contournement** : la Phase 4 avait produit `architecture.md` **avant** que
  le design ne soit approuvé — c'est-à-dire que l'ordre des phases ne protège
  pas seulement la propreté, il empêche un livrable tardif de diverger d'un
  artefact antérieur approuvé. INC-007 et INC-008 sont le même défaut, lu deux
  fois.
- **Action corrective** : arbitrage rendu au gate de la Phase 3 — la machine
  sort du MVP, l'artefact de design system la conserve comme contrat V1. Les
  trois fabrications qui l'accompagnaient sont en `Forge Labs/INCIDENTS.md` § F-26.
- **Statut** : corrigé au gate

---

## Récurrences

| Signature | Occurrences | Lecture |
|---|---|---|
| « une règle est écrite mais ses dépendants ne le sont pas » | 2 (INC-002, INC-006) | La révision d'un ID doit aller jusqu'aux user stories et au glossaire. Vérification manuelle, à chaque révision de règle. |
| « une citation est vérifiée comme un souvenir, pas comme une mesure » | 3 (V2, « le gate tranche », B27) — `Forge Labs/INCIDENTS.md` § F-26 | Un pointeur ne coûte rien à écrire ni à vérifier, donc c'est l'endroit le moins cher où cacher une invention. Vérification par jointure : citation mot pour mot contre le texte de la règle. |
| « l'ordre des phases n'était appliqué par rien » | 1 (INC-007), 2 effets (INC-007, INC-008) | Une règle énoncée sans garde-fou n'est pas une règle. Le contrôle a dû être ajouté avant que la règle cesse d'être respectée — et il a été écrit parce qu'un humain l'a demandé. |

---

## Constats routés vers `project-rules-architect`

| ID | Domaine | Gravité | Fait | Correction attendue |
|---|---|---|---|---|
| `F-001` | `architecture.md` | majeur | Aucun titulaire du rôle signataire : B2 et US-2 inapplicables, tout le MVP tombe | Nommer les titulaires avant la première signature ; la règle `signer ≠ auteur` est déjà tranchée |
| `F-002` | `security.md` | critique | B7 exige de **démontrer** l'isolation par ligne sur des lignes réelles (E5, E10) ; sans entrepôt de test seedé, le critère de sécurité n'est pas vérifié | Obtenir l'accord d'infrastructure avec l'équipe data avant la Phase 4 |