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

### INC-009 — FastTrack Phase 4 : BLOCK, et deux causes racines
- **Origine** : Forge
- **Constat** : première exécution réelle de la boucle FastTrack (`references/fast-track.md`) sur l'architecture. Trois validateurs en parallèle : `quality-analyst` **BLOCK** (1 critique, 10 majeures, 7 mineures), `red-team` **BLOCK** (2 critiques, 12 majeures, 8 mineures), `plan-validator` **REVISE** (2 majeures, 3 mineures). **45 findings**, dont **3 critiques**. Verdict consolidé = **BLOCK** (étape 5 : on prend le plus grave).
- **Les deux causes racines critiques, confirmées à la main** :
  - **(A) Le cycle de vie d'une version n'a aucun écrivain.** `definition_version.status` accepte `in_review` (§4.6), `POST /definitions/:versionId/signature` refuse tout ce qui n'est pas `in_review` (§5.8 → 409), et **aucun des 19 endpoints n'écrit `in_review`** : §5.5 crée en `draft`, et les dix écritures sont déclarer / version / signer / révoquer / dashboard / partager / partager- / export / export-journal. **La signature est inatteignable** — donc US-2, B2, ADR-1, B4, B22, B26 et le jalon `T_première signature` de la roadmap. Deux validateurs ont trouvé ça indépendamment.
  - **(B) B11 casse à la frontière de lecture.** `definition_threshold` (§4.7) porte bien `comparison`, `threshold_value`, `defined_at` — mais aucun endpoint ne renvoie de seuil, et `IndicatorTileProps` n'a pas de slot `threshold`. Le design system approuvé rend cette ligne **obligatoire au MVP** et interdit qu'elle soit rognée.
- **Pourquoi aucun script ne l'a vu** : `consistency-check` vérifie que les IDs sont tracés, pas que chaque valeur légale d'un enum a un **écrivain**. Le motif est partout le même — une règle énoncée avec le mécanisme manquant : B17 sans endpoint de réaffectation, le miroir d'annuaire sans réconciliation, `export_job` sans membre `journal` alors que §5.19 en crée un, ADR-8 interdisant `UPDATE` sur une table dont `status` est une colonne de cycle de vie.
- **Contournement** : aucun. Mais **deux corrections exigent de toucher un livrable `approved`** — `roadmap.md` (E16 est construit alors que la roadmap dit « sort du MVP ») et `benchmarks.md` (l'architecture et le registre se contredisent sur le module « alertes » **dans les deux sens**). Les réécrire en silence serait exactement INC-008.
- **Action corrective** : **escalade humaine**, comme le prescrit FastTrack sur un `BLOCK`. Rien n'avance en Phase 5.
- **Statut** : ouvert, en attente d'arbitrage

### INC-010 — L'architecture dérive d'une roadmap approuvée, une troisième fois
- **Origine** : Forge
- **Constat** : `architecture.md` construit E16 de bout en bout — colonne `target_confirmed_at` (§4.6), props de tuile, réponses §5.3 et §5.11, rendu « cible à reconfirmer » — alors que `roadmap.md:57` écrit : « Effet : E16 (cible à reconconfirm**er**) sort du MVP. » L'occurrence est unique dans la roadmap : il n'y a pas d'ambiguïté à lever, c'est une divergence.
- **Récurrence** : INC-008 était le même motif en Phase 3, dans l'autre sens. Trois fois en quatre passages, ce n'est plus un incident : c'est la règle qui manque. `consistency-check` ne joint aucun livrable aux tableaux de jalon de la roadmap.
- **Action corrective** : écart assumé **ou** correction de la roadmap, **avec re-validation**. Jamais en silence.
- **Statut** : ouvert, en attente d'arbitrage

### INC-011 — Corriger l'architecture a cassé 17 renvois dans 8 plans
- **Origine** : Forge
- **Constat** : l'amendement des deux causes racines critiques (INC-009) a **inséré deux endpoints** en § 5.9 et § 5.10, ce qui a décalé toute la numérotation § 5.11 → § 5.13 … § 5.20 → § 5.22. Dix-sept renvois de la forme `§ 5.15`, `§ 5.18`, `§ 5.20` dans **huit plans** pointent maintenant vers la mauvaise section : `error-handling` (4), `restriction-lignes` (3), `journal-acces` (4), `export-provenance` (4), `seuil-et-etat`, `partage-dashboard`. Aucune de ces lignes ne signale qu'elle est périmée.
- **Pourquoi rien ne l'a vu** : un renvoi de section est un **pointeur** — exactement la forme que le skill sait déjà traiter (`derived_from`, `content_hash`, `state_frontmatter_in_sync`, la parité de surface, la citation verbatim). Mais aucun contrôle ne le résout : rien n'extrait les `§ X.Y` d'un artefact et ne vérifie que la cible existe.
- **Aggravant, et c'est la leçon** : **insérer dans l'ordre renumérote tout le reste.** Le correctif sans risque aurait été d'ajouter les deux endpoints **en fin de § 5** (§ 5.21, § 5.22) et de ne toucher à aucun numéro existant. Un document que d'autres artefacts citent par numéro ne doit pas être renuméroté — il doit être étendu.
- **Contournement** : aucun. Le lot est journalisé ; il sera résorbé à la Phase 5, où les plans sont de toute façon à reprendre contre l'architecture amendée.
- **Action corrective** : jamais les plans (Phase 5). Le contrôle à construire est la **troisième famille de pointeurs** : `exigée → produite`, `produite → rendue`, et `citée → résolue`. Zéro inférence — on extrait la cible déclarée et on vérifie qu'elle existe, comme `derived_from`.
- **Statut** : ouvert, hors périmètre de la Phase 4

### INC-012 — Le correctif a introduit trois défauts, dont un qui rend le précédent inerte
- **Origine** : Forge
- **Constat** : seconde boucle FastTrack, `red-team` = **BLOCK** avec **6 critiques** (contre 2 à la première passe). **Trois sont introduits par mon propre amendement.**
- **(i) La garde `published_at` est du code mort.** `lifecycle_needs_an_act()` commence par `IF NEW.status = OLD.status THEN RETURN NEW`, **avant** la seule vérification de `published_at`. Donc `UPDATE definition_version SET published_at = NULL` sur une version `published` — `status` inchangé — sort au premier `RETURN` et **délève silencieusement le verrou B26**. Le trigger est bien `BEFORE UPDATE OF status, published_at` : il se déclenche, puis ne fait rien. Le document affirme à deux endroits que ce refus a lieu « en base ».
- **(ii) La garde B2 ne peut pas être créée.** `ALTER TABLE signature_event ADD CONSTRAINT signer_is_not_author CHECK (… actor_id <> (SELECT author_actor_id FROM definition_version …))`. **PostgreSQL refuse une sous-requête dans un `CHECK`** : la migration échoue à la création, et ADR-1 — dont c'est le seul producteur en base pour une version dont l'auteur est un tiers — perd sa porte. Il faut un `CREATE CONSTRAINT TRIGGER … DEFERRABLE`.
- **(iii) « signable » n'est défini nulle part.** Le mot apparaît **deux fois, défini zéro fois**. Il est sur le **seul** chemin d'écriture du seuil (§5.4, corps de requête) alors que §5.4 et §5.5 créent toujours une version `draft`. Les deux lectures ont des conséquences opposées : si « signable » = « signée », `definition_threshold` n'est jamais remplie et **le `threshold` que je viens d'ajouter à tous les contrats de lecture vaut `null` en permanence** ; si « signable » = « assez complète pour être signée », le 409 `DEFINITION_NOT_SIGNED` de §5.22 est inatteignable. Le document ne dit pas lequel.
- **Les trois autres critiques sont les absences d'écrivain d'origine, inchangées** : `actor.is_active` n'a ni endpoint ni tâche ni membre de contrat — donc les `200 officiality: "stale_owner"` que je viens d'ajouter lisent une colonne que personne ne met à `false`, et la remédiation B17 reste inerte ; aucun endpoint n'écrit `indicator.owner_actor_id`, alors que trois `409` prescrivent « nommez un propriétaire » ; le test « un acte de ce nom existe » ne teste ni l'annulation ni la matrice de transitions, donc `refused`/`revoked`/`published` ne sont pas terminaux.
- **Leçon, et c'est la plus importante du dossier** : **corriger un écrivain manquant en écrivant le contrat du lecteur laisse l'écrivain manquant.** J'ai rendu le seuil lisible ; rien ne l'a rendu inscriptible. C'est exactement le même piège, et cela valide la reformulation du commanditaire — « une exigence sans producteur » : mon correctif portait sur le mauvais bout de la chaîne, et le fait qu'il rende le document plus cohérent en apparence est précisément ce qui l'a laissé passer.
- **Statut** : ouvert, escalade

---

## Récurrences

| Signature | Occurrences | Lecture |
|---|---|---|
| « une règle est écrite mais ses dépendants ne le sont pas » | 2 (INC-002, INC-006) | La révision d'un ID doit aller jusqu'aux user stories et au glossaire. Vérification manuelle, à chaque révision de règle. |
| « une citation est vérifiée comme un souvenir, pas comme une mesure » | 3 (V2, « le gate tranche », B27) — `Forge Labs/INCIDENTS.md` § F-26 | Un pointeur ne coûte rien à écrire ni à vérifier, donc c'est l'endroit le moins cher où cacher une invention. Vérification par jointure : citation mot pour mot contre le texte de la règle. |
| « l'ordre des phases n'était appliqué par rien » | 1 (INC-007), 2 effets (INC-007, INC-008) | Une règle énoncée sans garde-fou n'est pas une règle. Le contrôle a dû être ajouté avant que la règle cesse d'être respectée — et il a été écrit parce qu'un humain l'a demandé. |
| « corriger le lecteur, laisser l'écrivain » | 1 (INC-012 iii) | Rendre lisible une valeur qu'aucun chemin n'écrit produit un document plus cohérent en apparence et toujours inerte. C'est le pire échec possible : il **ressemble** à une correction. |
| « un pointeur que rien ne résout » | 4 (INC-009 ×3, INC-011) | Une exigence sans producteur, un rendu jamais produit, un job non stockable, un renvoi périmé : quatre formes du même trou. **Un contrôle qui marche est une résolution de pointeur, jamais une interprétation** — c'est ce qui les distingue des deux contrôles qui ont bruyé (parité de surface « tout énumérer », « valeur légale sans écrivain »). |
| « une valeur légale sans écrivain » | 9 (INC-009) | 45 findings, dont `in_review`, `published_at`, `perimeter_empty`, la réaffectation B17, la réconciliation d'annuaire, `source_kind: journal`. Le motif dominant n'est pas l'oubli : c'est un enum ou une colonne sans producteur. Un contrôle qui demande « **qui écrit cette valeur ?** » aurait attrapé les deux causes racines critiques. |
| « un livrable dérive d'un artefact approuvé » | 3 (INC-008, INC-010, + `benchmarks.md` en Phase 4) | Trois fois en quatre phases. La jointure contre les tableaux de jalon de la roadmap et contre le registre d'écarts de `benchmarks.md` est l'opérateur qui manque. |

---

## Constats routés vers `project-rules-architect`

| ID | Domaine | Gravité | Fait | Correction attendue |
|---|---|---|---|---|
| `F-001` | `architecture.md` | majeur | Aucun titulaire du rôle signataire : B2 et US-2 inapplicables, tout le MVP tombe | Nommer les titulaires avant la première signature ; la règle `signer ≠ auteur` est déjà tranchée |
| `F-002` | `security.md` | critique | B7 exige de **démontrer** l'isolation par ligne sur des lignes réelles (E5, E10) ; sans entrepôt de test seedé, le critère de sécurité n'est pas vérifié | Obtenir l'accord d'infrastructure avec l'équipe data avant la Phase 4 |