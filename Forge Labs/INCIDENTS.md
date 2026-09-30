# Journal des problèmes — Forge Labs

> Test grandeur nature du skill `forge`, exécuté sur trois projets.
> Chaque entrée suit la forme : **symptôme → cause → correction → preuve**.
> Une entrée n'est écrite que lorsque la correction est **vérifiée** — pas
> lorsqu'elle est seulement décidée.

État des séries :

| Série | PR | Contenu | Release | État |
|---|---|---|---|---|
| 1 | #8 | `derived_from`, chemins de scripts, cases bloquantes | v1.1.7 | mergée |
| 2 | #9 | transition de phase, prémisses non déclarées, CI CHANGELOG | v1.1.8 | mergée |
| 2b | #10 | acquittement lu sur un extrait tronqué | v1.1.9 | mergée |
| 5 | #11 | snapshot de release, versionnement en un seul endroit | v1.2.0 | mergée |
| 3 | #12 | gates 3 et 6 infranchissables, contrastes, tokens | — | mergée |
| 3b | #13 | `id:` dupliqué — workflow rejeté en entier | v1.2.0 (reprise) | mergée |

---

## Série 1 — projet 1, Phases 0-1

### F-01 · Aucune commande du skill n'était exécutable depuis un projet
- **Symptôme** : `node scripts/state.js start`, écrit tel quel dans `SKILL.md`,
  échoue sur `Cannot find module '.../bi-dashboard/scripts/state.js'`. Le projet
  n'a pas de `scripts/`. Les messages d'erreur des scripts reprenaient la forme
  cassée — donc les `hint` copiés au moment de l'échec étaient inexécutables.
- **Cause** : la documentation donnait des chemins relatifs au projet alors que
  les scripts sont installés avec le skill, et ne disait nulle part quel doit être
  le répertoire de travail.
- **Correction** : section « Comment exécuter les scripts » définissant `$FORGE`,
  forme exécutable dans les 11 fichiers concernés, et deux règles ajoutées (le
  répertoire courant est le projet ; l'anchor se passe explicitement).
- **Preuve** : 2 tests, dont un qui parcourt tout le skill et échoue sur toute
  occurrence résiduelle de `node scripts/`.
- **Série** : #8 → v1.1.7.

### F-02 · `set-status` détruisait la trace des sources de l'artefact
- **Symptôme** : `derived_from` est écrit en **liste** sur quatre gabarits. Le
  lecteur de front matter le réduisait à une chaîne vide, et `set-status` — la
  seule opération qui réécrit le front matter — réécrivait cette chaîne vide.
  Constaté pour de vrai sur `benchmarks.md` : deux sources disparues, au premier
  `set-status`, avec `forge-guard` et `consistency-check` au vert.
- **Cause** : `forge-lib` n'implémentait qu'un YAML plat. `derived_from` est le
  **contrat de lecture d'un validateur Fast Track** : il disparaissait au moment
  précis où la traçabilité commence à compter.
- **Correction** : séquences en bloc et blocs pliés lus et réécrits dans la forme
  que le lecteur sait relire ; réécriture idempotence, `content_hash` stable ;
  nouveau contrôle `derived_from_non_empty`.
- **Preuve** : 4 tests + reproduction manuelle de l'état vide sur le projet
  (garde-fou en `exit 1` avec le fichier nommé, puis vert après réparation).
- **Série** : #8 → v1.1.7.

---

## Série 2 — projet 1, Phases 1-2

### F-05 · Une exigence retirée pouvait rester active sous un livrable approuvé
- **Symptôme** : `conventions.md`, approuvé en Phase 0, justifiait **cinq
  décisions** par « le partage par lien », exigence retirée en Phase 1.
  `consistency-check premises` : `retired: []`, `pass: true`.
- **Cause** : le contrôle ne lit que `state.deliverables[*].requires`, liste
  **saisie à la main** — vraie, mais fausse par omission, et rien ne la contredit.
  La justification était de surcroît en **prose**.
- **Correction** : remontée des citations d'ID retiré dans le corps d'un
  livrable approuvé, avec leur ligne, distinguées de la citation qui **annonce**
  le retrait ; liste des livrables approuvés sans prémisse déclarée dans
  `state.js start` (l'Étape 0).
- **Preuve** : 3 tests. Le contrôle a attrapé **deux vraies erreurs de citation**
  dans la roadmap, écrite à l'instant.
- **Série** : #9 → v1.1.8.

### F-06 · La règle d'attribution des ID se contredisait
- **Symptôme** : « une exigence retirée garde son ID » et « numérote les retirées
  en plage à part (B1xx) » ne peuvent pas être vraies ensemble.
- **Cause** : deux formulations ajoutées à des moments différents.
- **Correction** : règle unique — numéroter à partir du plus haut numéro utilisé,
  **ne jamais réattribuer un numéro libéré** ; le renumérotage est explicitement
  écarté, avec sa raison.
- **Preuve** : test dédié. Attrapé pour de vrai : en ajoutant deux règles au PRD,
  j'ai réutilisé `B18` et `B19`, déjà retirées — le contrôle de collision a
  refusé les deux.
- **Série** : #9 → v1.1.8.

### F-07 · Le garde-fou hurlait sur chaque transition de phase
- **Symptôme** : juste après `complete-phase 1_prd`, `forge-guard all` passait en
  rouge : « `roadmap` : aucun livrable enregistré pour cette phase ». Le roadmap
  n'existait pas encore.
- **Cause** : `complete-phase` avance `current_phase` à la phase suivante, qui
  devient « courante » alors qu'elle est `not_started`. Le commentaire du
  contrôle affirmait l'inverse de ce qu'il faisait.
- **Correction** : le contrat ne s'applique qu'aux phases **commencées** ;
  `skip` ajouté à `forge-guard` pour que « non applicable » ne se confonde jamais
  avec « passé ».
- **Preuve** : 2 tests.
- **Série** : #9 → v1.1.8.

### F-08 · La politique CHANGELOG ne tournait pas avec sa base
- **Symptôme** : `ci.yml` lançait `changelog-policy.js` **sans `--base main`**.
  Les deux contrôles qui portent le sens n'existaient donc pas en CI.
- **Correction** : `ci.yml` passe `--base main` ; `CONTRIBUTING.md` rectifié.
- **Preuve** : attrapé immédiatement — mes cinq entrées étaient allées dans la
  section **déjà publiée** `[1.1.7]`. Sans la base, la CI serait passée.
- **Série** : #9 → v1.1.8.

### F-09 · Un acquittement se lisait sur un extrait tronqué
- **Symptôme** : le contrôle des citations lisait la mention de retrait sur un
  extrait de ligne **tronqué à 120 caractères**. Les trois citations de `B18`
  dans `conventions.md` — qui annoncent toutes le retrait — étaient signalées
  comme non acquittées.
- **Cause** : le même extrait servait à l'affichage **et** à la décision.
- **Correction** : acquittement sur la ligne entière ; seules les citations non
  acquittées avertissent.
- **Preuve** : 2 tests, dont un qui place la mention à 160 caractères.
- **Série** : #10 → v1.1.9.

---

## Série 5 — le circuit de release

### F-03 · Une release ne contenait que des notes Markdown
- **Symptôme** : `gh release view v1.1.6` ne renvoyait **qu'un seul asset**,
  `notes.md`, 3 893 octets — le fichier de notes lui-même. Idem sur v1.1.7 et
  v1.1.8.
- **Cause** : le skill n'est pas compilé, donc rien ne produit d'exécutable à
  attacher, et le tag ne dit rien du contenu.
- **Correction** : `scripts/snapshot.js` construit
  `ship-clean-skills-v<version>.tar.gz` — `skills/`, `scripts/`, `README`,
  `LICENSE`, `VERSION`, `CHANGELOG`, `package.json`, hors outillage du dépôt —
  avec `MANIFEST.json` en **premier** membre (SHA-256 de chaque fichier, version,
  commit). Archive déterministe : deux constructions de la même version sont
  identiques octet pour octet.
- **Preuve** : `snapshot-smoke.js`, **11 tests dont quatre négatifs**. Le
  workflow vérifie l'archive contre le checkout avant de publier, puis
  **re-télécharge la release et l'extrait** après.
- **Vérification en conditions réelles** : v1.2.0 téléchargée depuis GitHub,
  extraite, `snapshot.js verify --against <extrait>` → `pass: true`, 93 fichiers,
  **0 différence**. Dans l'archive extraite, `validate-repo.js` passe et les
  **112 tests du skill** passent : le snapshot est utilisable hors du dépôt.
- **Série** : #11 → v1.2.0.

### F-04 · Le niveau de publication manuel était un plafond, la doc disait un plancher
- **Symptôme** : `CONTRIBUTING.md` annonçait un plancher ; le workflow
  court-circuitait avant l'analyse, donc le niveau demandé plafonnait.
- **Correction** : `release.js decide` porte toute la règle dans un fichier
  testable — `breaking` → major, `feat` → minor, sinon patch ; le niveau demandé
  est un plancher et **ne crée pas de contenu**.
- **Preuve** : 4 tests, dont « le niveau forcé est un PLANCHER, pas un plafond ».
- **Série** : #11 → v1.2.0.

### F-14 · Une release pouvait rester bloquée POUR TOUJOURS
- **Symptôme** : premier run réel du nouveau workflow : échec **entre
  `git push origin "$TAG"` et `gh release create`**. Résultat : `v1.2.0` taggé,
  `VERSION` à 1.2.0, `gh release view v1.2.0` → *release not found*. Et le job
  disait « le tag existe déjà — rien à créer », sortait en **0**.
- **Cause** : deux défauts distincts. (a) les assets passaient par une liste
  reconstruite par word-splitting puis expansion de motifs ; (b) un tag existant
  était traité comme un travail terminé, alors qu'un tag sans release est un
  travail **interrompu**.
- **Correction** : assets passés comme chemins entre guillemets ; étape « Reprise »
  qui détecte « tag sans release » et republie **depuis le commit du tag**, sans
  nouveau bump. Sortir en 0 sur un état incomplet transformait une panne en
  état permanent.
- **Preuve** : v1.2.0 republiée par ce chemin, avec ses deux assets, puis
  téléchargée et vérifiée.
- **Série** : #11, #13.

### F-15 · Un `id:` d'étape dupliqué faisait rejeter le workflow ENTIER
- **Symptôme** : le run de release de #13 a échoué en **0 seconde**, aucun job,
  aucun log, message `This run likely failed because of a workflow file issue`.
- **Cause** : le job `publish` contenait deux étapes `id: bump` — un patch
  appliqué deux fois avait laissé l'ancienne et la nouvelle. GitHub rejette un
  `id` dupliqué : **aucun job ne démarre**, et le message ne dit pas lequel.
- **Correction** : doublon supprimé ; `check-workflows.py` vérifie désormais
  l'unicité des `id` par job.
- **Note** : troisième refus de workflow en deux jours, après un `run:` bash
  invalide et une liste d'assets mal passée. Les trois avaient passé les
  contrôles en place. Le contrôle ne s'appelle pas « validité YAML » : il
  vérifie **ce que GitHub refuse réellement**.
- **Série** : #13.

---

## Série 3 — projet 1, Phase 3 (Design)

### F-10 · Le contrôle des placeholders signalait sa propre checklist
- **Symptôme** : un livrable qui écrit « aucun `{{PLACEHOLDER}}` résiduel » — donc
  qui **documente** la convention — était signalé comme portant un placeholder
  non rendu.
- **Cause** : même défaut que les cases `À DÉCIDER`, qui signalaient la phrase du
  gabarit qui les définit. Un contrôle qui hurle quand il n'a rien à dire est un
  contrôle qu'on n'écoute plus.
- **Correction** : les fragments entre guillemets sont retirés avant la recherche.
- **Preuve** : test qui vérifie qu'un placeholder cité est acquitté **et** qu'un
  placeholder hors guillemets reste signalé.
- **Série** : #12.

### F-11 · Les contrastes étaient rédigés, pas mesurés
- **Symptôme** : la checklist demande « contraste N:1 », le gabarit d'écran
  demande « contraste {{ratio}} », et **aucun contrôle ne calculait rien**. Sur le
  design system du projet — que j'avais écrit et relu — cinq défauts :

| Token | Mesuré | Seuil | Portée |
|---|---|---|---|
| `--color-text-secondary` | 4,17:1 | 4,5 | les **dates de calcul**, donc la provenance (B5) |
| `--color-stale` | 3,55:1 | 4,5 | document non officiel |
| `--color-border-strong` | 2,80:1 | 3 | filet d'un tableau dense |
| `--color-text-secondary` sur ligne alternée | 4,44:1 | 4,5 | le texte, là où on lit le plus |
| `--color-ink-200` et `--color-border` | identiques | — | la même couleur sous deux noms |

  Les ratios **annoncés** étaient aussi faux : 7,1 pour 7,07, 5,6 pour 5,37,
  5,0 pour 4,81. J'avais écrit des nombres que je n'avais pas calculés.
- **Correction** : `design-check.js` mesure 1.4.3 (4,5:1 contre **toute**
  surface du document) et 1.4.11 (3:1), **affiche la classe de chaque token**,
  n'exempte que par **nom** (exempter `--color-border*` exempterait l'anneau de
  focus, qui doit justement atteindre 3:1), et compare sur la valeur **brute** —
  `4,4958:1` arrondi à `4,50` passerait le seuil.
- **Preuve** : 10 tests, dont « un arrondi ne doit jamais créer un VERT ». Deux
  preuves négatives jouées sur le projet réel.
- **Série** : #12.

### F-12 · Les gates des phases 3 et 6 étaient infranchissables
- **Symptôme** : `PHASE_REQUIREMENTS` exigeait `design-system` et `test-plan` —
  **avec un tiret** — alors que les livrables s'enregistrent avec un souligné. Le
  `type:` du gabarit porte un tiret, la clé d'état un autre.
- **Cause** : aucune commande ne pouvait produire la clé exigée. Le gate
  échouait **en nommant une clé qui ressemble à une clé existante** — donc avec un
  refus inexplicable, et un contournement qui aurait cassé `forge-guard paths`.
- **Correction** : clés alignées ; test qui vérifie que **toute** clé exigée par
  un contrat de phase est enregistrable.
- **Preuve** : le test a trouvé **les deux instances** à sa première exécution.
- **Série** : #12.

### F-13 · Aucun contrôle ne reliait les écrans à leurs tokens
- **Symptôme** : après la correction des contrastes, **cinq écrans sur neuf**
  continuaient de citer les valeurs anciennes et en tiraient des **règles
  d'usage fausses** : « les dates ne doivent pas utiliser le secondaire », «
  `stale` ne sert qu'au filet ». Ces règles sont nées d'un couple couleur/fond qui
  n'existe plus. Un lecteur qui les aurait appliquées aurait **dégradé**
  l'interface pour corriger un problème inexistant.
- **Cause** : rien ne relie un écran aux tokens qu'il cite. Modifier un token
  après avoir écrit les écrans n'est pas une mise à jour, c'est une **rupture de
  contrat silencieuse**.
- **Correction** : `design-check.js tokens-used` compare chaque couple
  token/valeur cité par un écran à ce que le design system définit.
- **Preuve** : **onze divergences réelles** sur dix écrans.
- **Série** : #12.

### F-16 · La navigation déclarait une entrée sans écran — et le manque était réel
- **Constat** : `nav_items_have_screens` a refusé l'entrée `definitions`. La garde
  avait raison : il existait un formulaire de déclaration et une modale de
  signature, mais **aucun écran pour trouver une définition**. Le contrôleur de
  gestion ne pouvait pas atteindre les définitions qu'il avait lui-même écrites —
  donc la signature, cœur du produit, n'avait pas d'entrée.
- **Décision** : écran `definitions` écrit (référentiel, états de ligne visibles
  sans clic, signer en lot explicitement **non rendu** avec sa raison).
- **Pourquoi ce n'est pas un défaut du skill** : le garde a fait exactement son
  travail. C'est le « trou de la décomposition » qu'il existe pour attraper.

### F-17 · Un hash enregistré et jamais relu n'était pas une protection
Déjà corrigé dans le repo (#14) : `content_hashes_current` ne lisait que
`state.deliverables`, alors que `register` enregistre aussi un hash pour les
écrans et les plans de slice. Huit écrans ont été réécrits après leur
enregistrement (ratios recalculés, règles d'usage levées) et le contrôle est
resté au vert. Le hash enregistré était périmé — donc faux, et personne ne le
savait.

### F-18 · Des contrôles tournaient hors de la phase qui les concerne
Déjà corrigé (#14) : `no_undecided_slots` jugeait toutes les phases, donc
annonçait « case ouverte » pour des questions déjà tranchées en Phase 1.

### F-19 · `plan_path` n'était écrit nulle part
Déjà corrigé (#14) : la commande qui écrit le chemin d'un plan n'existait pas,
donc les quinze plans ne s'attachaient à aucune slice. Une slice sans
`plan_path` est une slice sans plan, et rien ne le distingue d'une slice
simplement non planifiée.

### F-20 · La reprise de release se déclenchait à chaque run
Déjà corrigé (#15) : `GH_TOKEN` absent du job de reprise → le workflow
échouait, et relançait la release. Une release qui se relance est une release
dont on ne sait plus ce qu'elle contient.

### F-21 · L'ordre des phases n'était qu'une consigne — corrigé dans #16 (v1.3.1)
- **Constat** : au gate de la Phase 3, le demandeur simulé a refusé le design
  en pointing R3 : `architecture.md` (1838 lignes) et les quinze plans
  s'étaient écrits **pendant que le design portait `draft`**. Vérifié sur
  `state.json` : `current_phase: 3`, `4_architecture: not_started`, et
  `deliverables.architecture` présent en `draft`, dix slices et cinq
  fondations enregistrées avec `plan_path`.
- **Gravité** : c'est la règle que SKILL.md présente comme *la plus importante
  du skill*, et elle n'avait aucun moyen d'être appliquée. Il n'existait nulle
  part la notion de phase d'un artefact : `current_phase_has_deliverables` ne
  juge que la phase **courante**, donc un livrable produit en avance
  n'existait pour aucun des douze contrôles. Tous au vert.
- **Le défaut était dans le skill, pas dans le projet** : je n'avais pas
  « oublié » de respecter l'ordre, personne ne pouvait le constater.
- **Correctif** : `PHASE_ARTIFACT_OWNERS` (qui possède quoi), refus de
  `state.js register` (la source, seul endroit non contournable), et
  `forge-guard no_premature_artifacts` (la copie, pour ce qui est déjà écrit).
- **Deux pièges rencontrés en écrivant le contrôle**, tous deux donnaient
  l'impression que la règle fonctionnait :
  1. la table possédait `deliverables`/`screens`/… (noms de seaux de
     `state.json`) alors que la fonction reçoit les `kind` **singuliers** de
     `register` — deux vocabulaires qui ne se distinguent que d'un `s`. Le
     contrôle ne déclenchait que les plans, via leur cas particulier ;
  2. la propriété exigeait que l'artefat soit **déjà** dans son seau, or
     `register` le crée : le refus ne se déclenchait jamais à l'écriture, et
     seul `forge-guard`, qui voyait un état peuplé, concluait que la règle
     fonctionnait.
- **Effet de bord utile** : le refus a cassé **six** tests existants en une
  fois. Leurs fixtures enregistraient `prd` dans un projet fraîchement
  initialisé, donc en phase 0 : elles n'étaient jamais entrées dans la phase de
  leur livrable. Le skill entier ne modélisait pas l'ordre des phases.

### F-22 · Un texte corrompu était publié dans v1.3.0
Deux caractères chinois (`始终`) au milieu d'une phrase française, dans le
commentaire de `hashTargets` — le commentaire qui explique *pourquoi* le
contrôle existe. Aucun contrôle ne l'attrape : le fichier se parse, le test
passe, et le défaut est purement textuel. Corrigé dans #16. À noter parce
qu'il est dans la release **publiée** : c'est le genre de défaut que seule la
lecture de l'archive peut montrer, et que la CI ne voit jamais.

### F-26 · Trois faits inventés dans des documents de gate — Phase 3
Le gate de la Phase 3 a été refusé **trois fois**. Au troisième refus, le
demandeur simulé a trouvé trois affirmations écrites dans des documents de gate
comme si elles étaient vraies, et aucune n'avait été fabricate par le
sous-agent qui écrivait le design : elles sont entrées parce que le contexte
leur donnait l'air légitime.

1. **« le gate tranche que la détection est dans le MVP (roadmap § 2.1) »** —
   `indicateurs.md` § 9.2 point 2. Le gate n'avait jamais rendu cette décision,
   et `roadmap.md` § 2.1 dit l'inverse. **Un gate qui n'a pas tranché ne peut
   pas être cité comme ayant tranché** : le prochain lecteur, ou la Phase 4,
   aurait considéré le jalon comme réglé.
2. **« B27 l'exige […] la ligne `threshold` et ses horodatages doivent être à
   l'écran d'abord »** — `tableau-de-bord.md` § 9.2 point 2, argument (b). B27
   énumère version, date de signature, date de calcul, source, auteur, date
   d'export. **Le mot « seuil » n'y apparaît pas.**
3. **« alertes mail en V2 »** — écrit deux fois par moi, dont une fois dans
   l'ordre au sous-agent. La roadmap approuvée dit **V1**.

Le point 2 était dans la colonne « Arbitrage attendu » : la colonne censée
dire **où le gate doit trancher**. J'ai donc placé une assertion fausse
exactement là où la relecture allait regarder.

**Ce que ça dit du skill** : une citation de PRD et une attribution à un gate
sont, par construction, des affirmations qu'un agent trouve crédibles, et
aucun contrôle ne les vérifie. Même famille que F-21 et le contrôle de parité
de surface : une règle énoncée, aucun moyen de l'exécuter.

**Ce que ça dit de moi** : le taux de fabrication est monté 0 → 1 → 3 à mesure
que le travail devenait meilleur. Ce n'est pas un paradoxe. La sophistication
d'un document, c'est sa **densité de pointeurs** ; un pointeur ne coûte rien à
écrire et rien à vérifier, donc c'est l'endroit le moins cher où cacher une
invention. Les deux premiers refus portaient sur des **omissions** — un slot
manquant, une section inversée — et une omission se voit. Au quatrième
passage, le défaut est une **invention**, qui se déguise en document.

**Voie que le commanditaire a proposée, et qui est praticable avec
l'infrastructure existante** :
- *attribution au gate* : jointure contre `audit/run-log.jsonl`, qui enregistre
  déjà `gate_revise` / `gate_approved` avec phase, message et décompte. Dans ce
  projet, l'entrée de la Phase 2 dit « **B12 renvoye en V1** » — l'inverse exact
  de la phrase fabriquée. La jointure l'aurait attrapée sans lire la roadmap.
- *placement de jalon* : jointure contre les tableaux de la roadmap où la
  version est une colonne (§ 2.1, § 2.2, § 3.1). Purement lexical.
- *obligation fabriquée* : exiger la citation **mot pour mot** de la règle, et
  vérifier que le fragment cité est un sous-ensemble du texte de la règle. Les
  règles du PRD sont des cellules de tableau uniques, donc triviales à parser.
  Le précédent existe : depuis #12, le design system exige « contraste N:1 »
  **mesuré** et non écrit. Une citation est la mesure d'une source.

**Limite, dite franchement** : une citation exacte de la bonne règle, employée
pour appuyer une conclusion fausse, passe les trois contrôles. C'est le travail
du gate. Ce que les contrôles achètent, c'est un rétrécissement de la classe de
faute : non plus « affirmer n'importe quoi de plausible », mais « citer juste,
puis raisonner ».

---

## Observations — ce qui n'est pas un défaut du skill

### O-01 · Le multi-perspective a fait son travail, et il a attrapé l'agent
Deux défauts réels trouvés par la relecture de gate du demandeur simulé, et
**aucun** par un script :

1. `US-2` continuait de dire « propriétaire désigné » alors que `B2` venait d'être
   réécrite en « signataire distinct de l'auteur ». Le critère d'acceptation
   d'US-2 **contredisait** la règle métier — un implémenteur aurait écrit son
   test depuis US-2 et livré précisément l'auto-signature interdite.
2. `E16` citait `B18` (partage par lien, retiré) au lieu de `B14` (cible
   versionnée).

Aucun contrôle ne peut distinguer « B14 » de « B18 » : les deux existent. C'est
la relecture qui sait que la citation ne parle pas du bon sujet.

**Sur le point 1, j'ai affirmé avoir corrigé sans l'avoir fait.** Le demandeur
l'a vu. C'est la règle 1 de la « Discipline de vérification » du skill qui
s'est appliquée à l'agent lui-même, et elle a fonctionné.

### O-03 · L'architecture était plus fidèle à la roadmap approuvée que le design qui l'a suivie
En cherchant si `architecture.md` — écrit **avant** l'approbation du design —
était devenu faux, il s'est révélé exact sur le point le plus contesté. Sa slice
`seuil-et-etat` porte, mot pour mot, l'arbitrage que le commanditaire a rendu
trois refus plus tard :

> **Périmètre MVP** : l'**état** dérivé de la valeur, avec sa date de calcul.
> Pas de machine à états, pas de tâche de fond, pas d'alerte : B12 part en V1
> avec le canal mail (`roadmap.md` § 2.2).

C'est-à-dire que le design s'était **écarté** d'une décision de Phase 2
approuvée, et qu'aucun contrôle ne l'a vu : `consistency-check` ne joint pas
les livrables aux tableaux de jalon de la roadmap. L'agent qui écrivait le
design n'a pas consulted l'artefact approuvé que la Phase 4 avait produit
plus tôt — alors même qu'il était dans le même dossier.

Deux enseignements. D'abord, l'ordre des phases que #16 vient d'imposer n'a pas
que des effets de propreté : il empêche un livrable tardif de **diverger** d'un
artefact antérieur approuvé, parce que le livrable antérieur n'est plus
accessible à sa lecture au moment où il écrit. Ensuite, `consistency-check`
possède déjà l'opérateur qu'il faut — une jointure — et ne l'applique pas aux
jalons.

### O-02 · Un `id` de slice n'a pas de préfixe imposé, et le graphe reste vérifiable
Les noms de slices (`definition-declarer`, `restriction-lignes`) ne sont pas
préfixés par leur module. Le skill laisse le nommage libre ; ce n'est pas un
défaut, mais un choix à assume : la lisibilité du graphe repose alors sur le nom
lui-même, pas sur une convention.

---

## Défauts encore ouverts

| ID | Sujet | Statut |
|---|---|---|
| F-24 | US-4 (`réarmement`) et B12 absents du design — gate Phase 3 **refusé**, retouche demandée | en cours, série 3 |
| F-25 | `perimeter_empty` à ajouter à `IndicatorTile` (E15) — gate Phase 3 **refusé** | en cours, série 3 |
| F-001 | Signataire non nommé — **non promu** en règle, à la décision du commanditaire | routé, en attente |
| F-002 | Entrepôt de test non seedé — **non promu**, il lui faut un titulaire et une date | routé, en attente |
| F-27 | Aucune vérification des **citations** : un livrable peut faire dire à une règle approuvée ce qu'elle ne dit pas, ou attribuer une décision à un gate qui ne l'a pas prise | ouvert, voie proposée par le commanditaire |
| F-28 | **Aucune résolution de pointeur.** Quatre formes du même trou, vues en Phase 4 : une exigence sans producteur (`in_review`, `published_at`, `perimeter_empty`), un rendu jamais produit, un job non stockable (`export_job` sans membre `journal`), un **renvoi périmé** (17 renvois `§ 5.x` cassés par une renumérotation) | **partiellement traité** — `declared_state_parity` (pointeur déclaré) et `no_stray_characters` sont en place |
| F-29 | **`méthode` écrit avec un caractère grec et un caractère hébreu** à la place de `é`, dans `design/screens/definitions.md` — un écran **approuvé**, invisible à trois gates et à tous les contrôles existants | **corrigé** — `forge-guard no_stray_characters`, v1.4.2 |
| F-30 | **`state.json` ne portait pas `derived_from`** : « son `derived_from` » n'était pas mécaniquement découvrable, et les deux validateurs se privaient donc du PRD sans le dire | **corrigé** — propagé par `register` et `sync`, v1.4.2 |
| — | Phase 4 : la seconde boucle FastTrack est en cours | en cours |
| — | Phase 4 : 24 majeures restantes à traiter **par blocs**, chaque bloc contenant un choix produit revenant au commanditaire | à faire |
| — | Phase 5 : les 15 plans sont `premature_artifact` tant que la phase 5 n'est pas atteinte — **c'est correct**, pas un défaut | attendu |
| — | FastTrack (Phases 4-5 automatisées) jamais exécuté | critère de fin non satisfait |
| — | Projets 2 et 3 | à faire avec le skill amélioré |

**F-001 et F-002 ne sont pas des défauts du skill**, et le commanditaire a
décidé de ne pas les promouvoir en `project-rules` : les promouvoir aurait
éteint `findings_promoted` alors que le MVP reste non démarrable. Un avertissement
vert qui cache un MVP non démarrable est pire qu'un rouge. Ils demandent un
**enregistrement de décision avec titulaire et date** (`DECISIONS.md`, absent
du livrable), pas une règle de plus.
---

## F-33 — Le DDL n'a jamais été exécuté, et il ne pouvait pas l'être

**Signalé par** `ddl-exec` (skill v1.5.0), sur `.forge/architecture.md` de « Amberline ».

Trois verdicts, un seul vrai défaut, **zéro faux positif**.

### 1. `execute` — une erreur, et c'est une porte qui n'existe pas

```
ligne 1077 : cannot use subquery in check constraint
```

```sql
ALTER TABLE signature_event ADD CONSTRAINT signer_is_not_author CHECK (
  act NOT IN ('sign','refuse') OR actor_id <> (
    SELECT author_actor_id FROM definition_version
     WHERE definition_version_id = signature_event.definition_version_id)
);
```

Un `CHECK` doit être évaluable sur la **ligne seule**. PostgreSQL refuse celui-ci à
la création : **la contrainte n'existe pas**. Or c'est la contrainte qui porte
`B2` — l'auto-signature est impossible, *y compris en cas de bug d'interface*
(ADR-1). La porte est écrite, commentée, justifiée par une décision
d'architecture — et elle n'est pas là.

C'est le premier des trois défauts d'exécution du dossier, et le seul des trois
qui soit une **erreur** : les deux autres sont des défauts sémantiques, qu'aucune
relecture ne voit.

### 2. `completeness` — deux tables modifiées sans être créées

`tables_created_in_ddl: 0`, `tables_declared_in_prose: 17`.

L'architecture ne contient **aucun `CREATE TABLE`**. Elle décrit ses tables comme
tableaux de colonnes (`| Champ | Type | Nullable | Défaut |`) et écrit ensuite un
DDL qui les `ALTER` :

| table | touchée | décrite |
|---|---|---|
| `signature_event` | ligne 1082 (`ALTER TABLE`) | ligne 1035 |
| `definition_version` | ligne 1084 | ligne 927 |

Le DML suppose donc un schéma préexistant dont le document ne tient pas la source.
**C'est la raison pour laquelle ses défauts n'ont jamais été vus** : il n'y a rien
à exécuter. Aucune référence dans le vide, en revanche — `dangling_references: 0`.

### 3. `execute` — un prérequis, pas une erreur

```
ligne 1348, 1351, 1352, 1353 : role "amberline_app" does not exist
```

Classés **préalable**, pas erreur : le provisionnement d'un rôle appartient au
déploiement, pas à l'architecture. Compter ces quatre instructions comme des
erreurs de DDL serait faux. Les faire disparaître serait pire : le document
envoie ses privilèges à un rôle dont **personne ne peut dire qu'il existe**.

### 4. `guards` — zéro garde déclarée

```
guards_declared: 0
```

`.forge/architecture.md` **ne déclare aucune garde**. Les deux triggers du
document — `lifecycle_needs_an_act` et `definition_content_is_frozen` — sont
précisément des portes, et aucune n'est essayée. Le contrôle rend `pass` et le
dit dans la même phrase : *« Une porte non écrite n'est pas testée : ni par un
script, ni par un relecteur, ni par elle-même. »*

C'est le troisième défaut, celui qui n'a **aucune signature** : rien ne le
signale, dans aucun rapport, et `forge-guard all` est vert.

### Ce qui reste à faire dans le document

| # | action | où |
|---|---|---|
| 1 | réécrire `signer_is_not_author` sans sous-requête — un `NOT EXISTS` dans un **trigger**, ou un `CHECK` sur des colonnes de la même ligne | § 4.8, ligne 1077 |
| 2 | porter les `CREATE TABLE` dans le document, ou pointer la migration qui les porte | § 4.2 à § 4.18 |
| 3 | déclarer le rôle `amberline_app` comme prérequis nommé | § 4.19, ligne 1346 |
| 4 | **déclarer les gardes** : `-- forge:ddl-refuse` pour la publication sans signature, pour la réécriture de `published_at`, pour la modification du contenu d'une version signée | § 4.6 et § 4.8 |

Le point 4 est celui qui compte. Il est le seul des quatre qui transforme une
porte **écrite** en porte **vérifiée**, et il est le seul qui aurait attrapé le
défaut de la ligne 1388 (`IF NEW.status = OLD.status THEN RETURN NEW`) : cette
garde n'est atteinte que sur une transition de statut, donc un `UPDATE` qui écrit
`published_at` en ne changeant pas le statut passe **au travers**. Elle est
écrite, commentée, et inerte.

---

## F-34 — Le skill n'avait aucune règle d'amendement, et l'amendement a cassé 17 renvois

**Signalé par** INC-011, **corrigé par** `state.js amend` et
`consistency-check references` (skill v1.6.0).

### Ce que le skill disait

Deux phrases, en tout et pour tout : « `conventions.md` est un document vivant »
et « peut être amendé à tout moment ». **Aucun contrat.** Rien ne disait ce qu'un
amendement doit préserver, ni ce qu'il ne doit pas faire.

### Ce que l'amendement a fait

L'amendement des deux causes racines critiques a **inséré** deux endpoints en
§ 5.9 et § 5.10, ce qui a décalé § 5.11 → § 5.13 … § 5.20 → § 5.22. Dix-sept
renvois dans huit plans pointent vers la mauvaise section, et **aucune ligne ne le
signale** : ils pointent vers quelque chose, donc ils résolvent.

Le refus de `state.js amend` nomme la dérive dans l'ordre, ce qui rend le mécanisme
visible :

```
5.10  était « Publier »      →  « NOUVEAU inséré en plein milieu »
5.11  était « Partager »    →  « Publier »
5.12  était « Journaliser »  →  « Partager »
```

Le correctif sans risque : ajouter les deux endpoints **en fin de § 5**, sans
toucher à un numéro existant.

### F-34-b — 276 renvois qui ne nomment pas leur cible

`consistency-check references` sur « Amberline » : **1 073 renvois résolus**,
**0 pointeur cassé**, **0 cible inconnue**, **276 renvois nus**.

| classe | compte | verdict |
|---|---|---|
| résolus | 1 073 | — |
| **pointeur cassé** | **0** | échec |
| cible inconnue | 0 | échec |
| **cible non déclarée** | **276** | **compté** |

Les 276 sont la classe d'INC-011 : `§ 5.15` seul ne dit pas de quel document il
parle. Les nommer est un chantier ; les faire échouer produirait un contrôle
éteint en une semaine. Le compte a donc une **voie de sortie écrite dans la sortie
du contrôle** : écrire `` `architecture.md` § 5.15 ``, et il tombe.

Les plus chargés :

| fichier | renvois nus |
|---|---|
| `design/screens/definitions.md` | 42 |
| `design/screens/indicateurs.md` | 26 |
| `design/screens/indicateur-detail.md` | 22 |
| `design/screens/tableau-de-bord.md` | 20 |
| `design/screens/tableau-de-bord-composition.md` | 15 |

**Zéro faux positif** sur 1 349 renvois. C'est le premier contrôle de cette famille
qui y parvienne, et il y est parvenu en **cinq** essais — dont quatre qui
produisaient 539, 13, 5 et 3 faux positifs. La forme qui tient est la plus étroite :
**le nom du fichier et son numéro doivent être écrits l'un à côté de l'autre.**
Au-delà de douze caractères, le contrôle refuse de deviner et compte.

### Ce qui reste à faire dans le projet

| # | action |
|---|---|
| 1 | nommer la cible des 276 renvois nus, en commençant par les 15 plans (les cibles d'INC-011) |
| 2 | ne plus éditer un artefact approuvé : passer par `state.js amend --reason` |
| 3 | reprendre les 17 renvois d'INC-011 contre l'architecture amendée, en Phase 5 |

---

## F-35 — Les trois décisions arbitrées appliquées, et un cinquième défaut trouvé en les appliquant

**Levé par** `state.js amend` (v1.6.0) et vérifié par `ddl-exec` (v1.5.0, v1.6.1).

Les trois décisions arbitrées étaient justes, et aucune n'était appliquée. Une
quatrième est apparue **pendant** leur application — donc avant même la
vérification.

### 1. « signable » : deux fois dans le document, défini zéro fois

| occurrence | sens | ce qu'il advient si on lit l'autre |
|---|---|---|
| § 5.5, sur le corps de `POST /versions` | « assez complète pour être signée » | le `threshold` de **tous** les contrats de lecture vaut `null` en permanence |
| ADR-7 révisé, sur le signataire | « il existe quelqu'un pour la signer » | le `409 DEFINITION_NOT_SIGNED` de § 5.10 est **inatteignable** |

Défini en **§ 4.6.0**, une fois : *une version est signable quand elle est
`in_review` **et** que son indicateur a un signataire désigné nommé, distinct de
l'auteur*. C'est un **prédicat dérivé**, pas un statut de plus — un statut sans
producteur est exactement le défaut que `revoked` avait.

Trois conséquences, chacune ferme un trou :

1. `POST /versions` accepte **toujours** un `threshold`. Il est versionné *avec* la
   définition (B14) et ne devient un seuil qu'à la signature (B11) ; le rejeter
   sur une version `draft` — donc jamais signable — rendait le seuil perdu à
   l'écriture.
2. Le `409 DEFINITION_NOT_SIGNED` reste **atteignable** : publier exige `signed`,
   condition plus forte que signable.
3. Un signataire non nommé est un blocage portant sur l'**indicateur** (`F-001`),
   pas une ambiguïté de vocabulaire.

### 2. `revoked` quitte le domaine — la révocation est un acte, pas un état

| | avant | après |
|---|---|---|
| domaine de `definition_version.status` | `draft, in_review, signed, refused, published, revoked` | `draft, in_review, signed, refused, published` |
| `signed` → ? | `revoked` (terminal) | **`draft`** (re-soumissible) |
| terminalité | `refused` **et** `revoked` | `refused` seul, et c'est une conséquence du gel |

**Pourquoi.** B26, qui est la règle **approuvée**, dit : *« La signature est
révocable par l'auteur de la version jusqu'à sa première publication. »* Elle
parle d'un **droit de retrait**, pas d'un état du cycle de vie. L'architecture
avait ajouté une terminalité que le PRD n'avait jamais demandée.

Et le prix annoncé — *« l'historique porterait deux signatures contradictoires »* —
était **imaginaire** : B22 porte sur les **valeurs** (*« une nouvelle version ne
réécrit pas l'historique des valeurs »*), pas sur les signatures. Le journal est
**append-only** : il conserve `sign`, puis `revoke`, puis `sign`. Rien n'est
réécrit, donc rien n'est contradictoire — la trace montre une **séquence**, ce
qu'un journal doit montrer. Une version non re-signable perdait la seule chose
qu'un audit d'une décision de gestion demande : **la suite**.

Touché aussi : le diagramme de § 5.0, la table des transitions, les quatre
messages `409`, les deux exemples de réponse, et le champ
`versions[].status` de l'historique (où `revoked` devient un **acte** du journal,
pas un statut). `session.revoked_at` est **conservé** : c'est une autre entité.

### 3. La garde de `published_at` passe en première du trigger

```sql
-- avant : inatteignable
IF NEW.status = OLD.status THEN RETURN NEW; END IF;   -- la garde ci-dessous est morte
… IF NEW.status = 'published' THEN … published_at …

-- après : première, et ne dépend que de `published_at`
IF NEW.published_at IS DISTINCT FROM OLD.published_at THEN
  IF OLD.published_at IS NOT NULL THEN RAISE EXCEPTION '… B26 verrouille …'; END IF;
  …
END IF;
```

Le trigger est `BEFORE UPDATE OF status, published_at` : il se déclenchait, puis ne
faisait rien pour une requête qui ne touche que `published_at`.
`UPDATE definition_version SET published_at = NULL` sur une version `published`
déliait **silencieusement** le verrou B26 — et le document affirmait à deux
endroits que ce refus a lieu « en base ».

**Une garde qui en protège une autre n'est pas une garde** : c'est une instruction
placée au mauvais endroit.

### 4. ADR-1 : le `CHECK` que PostgreSQL refusait à la création

`ADD CONSTRAINT signer_is_not_author CHECK (… actor_id <> (SELECT author_actor_id
FROM definition_version WHERE …))` — **un `CHECK` doit être évaluable sur la ligne
seule**. La migration échouait, donc la porte d'ADR-1 n'existait pas.

Remplacé par un `CREATE CONSTRAINT TRIGGER … DEFERRABLE INITIALLY DEFERRED`, qui
est la forme que PostgreSQL accepte et qui va avec l'ordre d'écriture réel.

### 5. Le défaut trouvé **pendant** l'application — le plus grave des cinq

`revoke_target_is_legal` était déclaré :

```sql
CREATE CONSTRAINT TRIGGER revoke_target_is_legal
  AFTER INSERT ON signature_event DEFERRABLE INITIALLY DEFERRED
  FOR EACH ROW EXECUTE FUNCTION revoke_targets_a_legal_act();
```

**sans clause `WHEN`**, alors que la fonction exige que `revokes_event_id` pointe
un acte `sign` ou `submit`. Or cette colonne est `NULL` pour tout acte qui n'est
pas un `revoke` — c'est la règle de la colonne elle-même. Le trigger
s'exécutait donc sur les **cinq** actes et rejetait les quatre autres :

| acte | `revokes_event_id` | résultat |
|---|---|---|
| `submit` | `NULL` | **rejeté** |
| `sign` | `NULL` | **rejeté** |
| `refuse` | `NULL` | **rejeté** |
| `publish` | `NULL` | **rejeté** |
| `revoke` | un `sign` ou `submit` | accepté |

Donc `in_review` n'avait pas de producteur, la signature ne pouvait pas exister,
`published_at` ne pouvait pas être posé : **tout le cycle de vie était
inatteignable**. Le commentaire juste au-dessus annonçait pourtant la règle (*« la
cible est `sign` ou `submit`, jamais `refuse`, jamais `publish` »*) : l'intention
était écrite, juste pas appliquée au bon ensemble.

**Trouvé en déclarant les gardes de § 4.21, pas en relisant.** Il a fallu que le
contrôle exécute une tentative pour qu'il sorte.

### 6. § 4.21 — quatre portes, déclarées et essayées

```sql
-- forge:ddl-refuse
```

| porte | ce qu'elle interdit | refusée par |
|---|---|---|
| 1 | l'auteur atteste sa propre version | `signer_is_not_author` |
| 2 | réécrire `published_at` | `definition_version_lifecycle_needs_an_act` |
| 3 | rouvrir une version `published` | idem, garde de transition |
| 4 | publier sans acte `publish` | idem |

`ddl-exec guards` : **4 déclarées, 4 actives, 0 inertes.**

### Ce que ça a coûté au skill

Quatre bugs de `ddl-exec` trouvés en corrigeant ce document — dont un qui rendait le
contrôle **incapable de conclure** : `guards` exécutait un bloc entier et s'arrêtait
à la première faute, donc les `CREATE TRIGGER` **suivants** un `GRANT` cassé
n'étaient jamais créés, et les quatre portes étaient annoncées « inertes » sur un
schéma inexistant. Corrigé en v1.6.1.

Et un cinquième, dans `state.js amend` : il écrivait l'autorité sans le miroir
(v1.6.2).

### État du gate

| contrôle | avant | après |
|---|---|---|
| `ddl-exec execute` | **1 erreur** (`cannot use subquery in check constraint`) | **0** |
| `ddl-exec guards` | 0 déclaré | **4 déclarés, 4 actifs** |
| `ddl-exec completeness` | 0 orpheline, 2 en prose seule | **inchangé** — voir ci-dessous |
| `forge-guard all` | 2 échecs | **1 échec** : `no_premature_artifacts` |
| `consistency all` | PASS | PASS |
| `dependency-check` | PASS | PASS |

`no_premature_artifacts` est **le résultat attendu** : les 15 plans de la Phase 5
existent alors que la phase courante est 4. Ce n'est pas un défaut.

`completeness` reste à **2 tables en prose seulement** (`signature_event`,
`definition_version`) : l'architecture décrit son schéma en tableaux de colonnes et
n'écrit aucun `CREATE TABLE`. Le contrôle a raison — ce DDL ne peut pas être
exécuté seul. C'est F-33, action n° 2, et c'est un choix de forme à trancher, pas
un défaut à corriger en douce.

---

## F-36 — FastTrack exécuté pour la première fois. Les deux validateurs disent BLOCK, et ils ont raison.

**Première exécution réelle de la boucle FastTrack** sur ce projet, après
quatre phases. Journalisée dans `run-log.jsonl` comme l'exige
`references/fast-track.md`.

### Conditions d'entrée — satisfaites, pour la première fois

| condition | avant | maintenant |
|---|---|---|
| `prd` `approved` | oui | oui |
| `conventions` `approved` | oui | oui |
| `design_system` `approved` | **non** (`draft`, F-24/F-25) | **oui** |
| les 9 écrans `approved` | **non** (`definitions` `draft`) | **oui** |
| `benchmarks` `approved` | oui | oui |

Le déblocage a demandé la **réconciliation de l'union** `IndicatorDisplayState` :
le design déclarait 16 états pour `IndicatorTile` et l'union n'en portait que 7.
Cinq états rendus manquaient — dont `perimeter_empty`, le F-25 — et
`permission_denied` (qui veut dire *tuile non rendue*) va désormais dans le
`sauf` du design, comme le prévoit la convention.

`state-parity` : **4 composants, 4 unions résolues, 0 écart.** Le contrôle
piloté est validé sur un vrai document, sans faux positif.

### Étape 2 — les scripts d'abord, toujours

| script | avant | maintenant |
|---|---|---|
| `ddl-exec execute` | 1 erreur | **0** |
| `ddl-exec guards` | 0 déclaré | **4 déclarés, 4 actifs** |
| `ddl-exec completeness` | 2 en prose seulement | inchangé |
| `dependency-check` | PASS | PASS |
| `consistency-check all` | PASS | PASS |
| `forge-guard all` | 3 échecs | **1** : `no_premature_artifacts` |

`no_premature_artifacts` (les 15 plans de la Phase 5 écrits à la Phase 4) reste
**le seul** échec. Il est classé « correct, pas un défaut » depuis le début, et le
commanditaire a refusé de supprimer les artefacts. Il n'a pas été contourné.

### Étape 3 — les deux validateurs : **BLOCK, tous les deux**

Et surtout : **ils ont convergé**, depuis deux angles opposés, sur les mêmes
défauts. C'est la convergence la plus forte du dossier — la deuxième fois
seulement (la première était le défaut du cycle de vie de version, trouvé
indépendamment par les deux).

#### Défaut 1 — la garde du cycle de vie ne lit jamais `OLD.status`

```sql
required_act := CASE NEW.status … END;
IF NOT EXISTS (SELECT 1 FROM signature_event WHERE … AND act = required_act) THEN RAISE
```

La garde prouve qu'un acte de ce nom **existe** pour la version. Elle ne prouve
**jamais** que la transition a eu lieu — `OLD.status` n'apparaît que dans le
texte d'erreur.

Conséquence : **ni `published` ni `refused` ne sont terminaux en base.** Toute
version publiée porte nécessairement un acte `submit`, donc
`UPDATE … SET status='in_review'` sur une version `published` **passe**. La garde
`published_at` ne se déclenche pas, puisque `published_at` ne bouge pas. La
version repasse `in_review`, est re-signée, et la révocation s'ouvre — pendant que
`published_at` reste écrit.

Le document affirme pourtant le contraire à quatre endroits : « `published` est
terminal et verrouille », « une ligne ne peut pas dire `signed` sans qu'un acte
`sign` existe », « le verrou de révocation est en base ».

#### Défaut 2 — `one_active_signature_per_signer` interdit la re-signature

```sql
CREATE UNIQUE INDEX one_active_signature_per_signer
  ON signature_event (definition_version_id, actor_id) WHERE act = 'sign';
```

Le prédicat est `act='sign'`, pas « signature active ». Le `sign` révoqué reste
dans l'index — le journal est append-only. Donc `sign → revoke → sign` viole
l'unicité.

Aggravant, et c'est ce que je n'avais pas vu : `designated_signer_actor_id` est une
colonne **unique** écrite **une seule fois** à la création, et aucun endpoint ne la
remet à jour. Le signataire d'un indicateur est donc le même pour toutes ses
versions, pour toujours : l'index n'autorise qu'**un seul** acte `sign` par
indicateur sur toute la vie du produit. Après une première révocation, **plus
aucune version de cet indicateur ne peut être signée.**

C'est exactement ce que le document nie : « elle la rend `draft`, donc
re-soumissible puis **re-signable** ».

**Ma correction n° 2 a ouvert un chemin que la contrainte n° 4 du § 4.8 ferme.**
Les deux défauts se tiennent : corriger l'un sans l'autre rend l'exploit possible.

#### Défaut 3 — aucun trigger `BEFORE INSERT`

La garde n'est déclarée que sur `BEFORE UPDATE OF status, published_at`. Un `INSERT`
direct avec `status='published'` et `published_at` renseigné passe — et le rôle
applicatif a `GRANT INSERT` sur cette table.

**La fixture de § 4.21 fait exactement cela** : elle insère v2 en `published` avec
son `published_at`, et n'insère les actes qu'ensuite. La section qui prétend
prouver les portes **contourne** la porte qu'elle teste.

#### Défaut 4 — la Porte 3 passait pour la mauvaise raison

La Porte 3 (`published → draft` doit être refusé) tient. Mais **par coïncidence de
fixture** : la version v2 de la fixture ne contient aucun acte `revoke`, donc la
garde refuse faute d'acte. Ce n'est pas la propriété « `published` est terminal » qui
la fait tenir — c'est l'absence d'acte dans la fixture.

Si la fixture avait d'abord posé un `revoke` — ce que § 5.9 produit — la Porte 3
serait passée. **Une preuve qui ne prouve pas.**

C'est le défaut le plus dangereux du lot, et il est de la même famille que les
trois portes inertes déjà trouvées : non pas une porte absente, mais une porte
**dont la démonstration est une coïncidence**.

#### Défaut 5 — une porte écrite dans un commentaire SQL

```sql
--   Jamais DELETE, jamais UPDATE sur le contenu.GRANT INSERT  ON definition_version TO amberline_app;
```

L'instruction est **entièrement sur une ligne `--`** : ce n'est pas une
instruction. Le résultat mesuré est « 0 erreur, 22 instructions acceptées » — et il
serait **identique** si la ligne était exécutée ou commentée.

Même famille que « la porte d'ADR-1 n'existe pas » : une porte écrite dans un
endroit où elle n'existe pas.

### Ce que cette exécution prouve sur la boucle

1. **L'entrée refusait, et elle avait raison** de refuser tant que `design_system`
   et `definitions` étaient en `draft`. La condition n'est pas décorative.
2. **Les scripts passent avant les agents** — et ils ont suffi à trouver le
   cinquième défaut du document (`revoke_target_is_legal` sans clause `WHEN`).
3. **Les deux validateurs ont convergé** sur deux défauts, depuis deux angles
   opposés, dont aucun n'avait été trouvé par un script.
4. **Un `BLOCK` n'a pas été contourné.** La Phase 4 n'est pas approuvée.

### Ce que la boucle ne peut pas faire

Les deux validateurs signalent tous deux `unreadable_without` hors périmètre :
`roadmap.md`, `conventions.md`, `design-system.md`, `benchmarks.md`. Le
`red-team` en tire une conclusion qu'il faut écrire : `C2` et `C5` n'ont **aucune
trace** dans l'architecture alors qu'elles sont au PRD, et le hors-MVP de
`US-10` à `US-16` n'est affirmé que par la roadmap — donc **non certifiable**.

Ce n'est pas un défaut de la boucle : c'est la mesure de sa limite. Elle rend
visible ce qu'elle ne peut pas voir, au lieu de le supposer couvert.

---

## F-37 — Projet 2 (Onduleur) : le skill n'est PAS sur-entraîné sur Amberline

**But de ce lancement.** Amberline a servi à construire les contrôles. Le risque
qu'un skill ainsi construit soit **accordé sur un seul projet** est réel : il
produirait des contrôles qui ne marchent que sur la chose qui les a vue naître. On
a donc ouvert un **deuxième projet**, archétype `mobile_consumer`, pile de
techniques opposée, et lancé Phase 0 avec le skill inchangé.

### Ce que le skill a fait, sans rien changer

| étape | résultat |
|---|---|
| `state.js anchor` puis `init` | anchor résolu sur le `cwd`, projet créé sans incident |
| `state.js register` | `conventions` enregistrée, `derived_from: None` — correct, elle n'a pas d'amont |
| `forge-guard all` | **16 contrôles, 0 échec** |
| `consistency-check all` | PASS (les contrôles inapplicables en Phase 0 rendent `skip`, pas `fail`) |

**Le contrôle a bloqué, et il avait raison de bloquer.** `no_undecided_slots` a
refusé la sortie de gate sur un marqueur `À DÉCIDER AVANT LA PHASE 1` — le runner
de tests bout-en-bout. Le commanditaire avait lui-même écrit que ce choix engage
une infrastructure qu'on ne reprend pas, et qu'il devait être tranché **avant la
Phase 1**. Il était en Phase 0.

C'est exactement la distinction que le gabarit explique et que le contrôle
applique : un choix différable écrit en bloquant est **indiscernable** d'un choix
bloquant écrit en différable, et on ne le voit qu'au moment où il est trop tard.
Sur Amberline, cette distinction n'avait jamais été exercée : le projet n'avait
jamais eu de case bloquante. **Un contrôle jamais vu bloquer est un contrôle
inconnu** — celui-ci a bloqué du premier coup, sur un projet neuf.

### La décision que le contrôle a forcée

Le commanditaire a tranché : **Maestro, en local, sur le development build, sans
runner en intégration continue** — pour une raison qui tient à C11 : la promotion
vers le canal de production est une étape manuelle distincte, donc un test qui vise
un build publié ne peut pas être un portail de fusion. Un émulateur Android sur
runner partagé n'est pas l'appareil.

Et il a nommé ce que la décision **ne couvre pas** : notifications push, démarrage
à froid, hors-ligne et âge du cache, le rendu en 2 s, l'appareil réel. Cinq trous,
écrits. C'est la forme que le skill exige partout ailleurs — *un trou nommé vaut
mieux qu'un trou absent* — appliquée ici par la main qui tranche, et non par un
script.

### Le défaut trouvé : la corruption est dans la **prose de l'agent**, avant tout document

Trois fragments, dans la sortie de l'agent qui joue le commanditaire, sur deux
invocations distinctes :

| fragment | ce qu'il devrait être |
|---|---|
| `首屏 occupy la place de tout le reste` | « occupe la place » |
| `mes collections underneath` | « dessous » |
| `une découverte/docscover…` | phrase tronquée |
| `Leganthropetype est mobile_consumer` | « L'archétype » |
| `sans jamais en tirer l advantage` | « l'avantage » |

C'est **la même famille** que F-29 (`méthode` écrit avec un caractère grec et un
caractère hébreu dans un écran approuvé) et que l'INC-002 du projet de référence
(caractère CJK injecté). Mais le contrôle `no_stray_characters` **ne l'a pas vu**,
et il ne pouvait pas : il inspecte les **documents livrés**, or ici la corruption
n'a jamais atteint un document — elle est dans la **prose de l'agent**, en amont.

**C'est un trou du skill, et il est de la bonne famille** : le contrôle existe,
il est testé, il a attrapé un vrai cas — mais son **périmètre** commence après le
point où le défaut apparaît. Un contrôle ne peut pas juger ce qu'on ne lui montre
pas : ici, le texte de l'agent n'est écrit nulle part, il n'existe que dans la
réponse de la sous-commande.

Ce n'est pas corrigible par un script de plus. C'est corrigible par une **convention
de transcription** : ce qui entre dans un livrable depuis une sortie d'agent est
relu, parce que la corruption naît au point d'entrée. C'est à trancher avec le
commanditaire.

---

## F-38 — Phase 1 (Onduleur) : deux contrôles ont bloqué, et j'ai failli accuser un innocent

### 1. `premature_artifact` a refusé, et il avait raison

J'ai écrit `.forge/prd.md` **en Phase 0**, puis enregistré. Le garde-fou a refusé :

```
premature_artifact : enregistré avant la phase 1
fix : state.js set-phase . 1_prd in_progress
```

Il a nommé la phase d'appartenance de l'artefact, et la commande qui débloque. C'est
le comportement attendu, et il n'a rien laissé passer.

### 2. `no_stray_characters` a trouvé trois caractères CJK que j'avais laissés passer

Une fois le PRD enregistré, le contrôle a scané **2** fichiers au lieu de 1, et a
rapporté :

```
OutOfContext:U+770B  prd.md:263   E9  …veut看看 un autre historique…
OutOfContext:U+7EF4  prd.md:266   E12 …pendant une维护.
OutOfContext:U+62A4  prd.md:266   E12
```

Trois caractères, deux lignes, dans les cases E9 et E12. Ils venaient de la sortie de
l'agent qui joue le commanditaire, comme F-37. **Le contrôle fait son travail.**

### 3. J'ai failli déclarer un faux négatif, et j'avais tort

Entre l'écriture et l'enregistrement, j'ai lu `no_stray_characters: pass` alors que
le PRD contenait ces caractères, et j'ai conclu : *« défaut grave dans un contrôle que
j'ai livré en v1.4.2 »*.

**C'était faux, et l'erreur était la mienne.** Le contrôle scannait **un** fichier,
parce que le PRD n'était pas enregistré : l'enregistrement avait échoué sur
`premature_artifact`, et j'avais lu par-dessus l'échec. Le contrôle avait rendu un
verdict exact sur ce qu'on lui avait donné.

C'est la **cinquième** fois dans ce dossier que je lis mal la sortie d'un contrôle —
après les 283 « fausses » citations du contrôle de citations, les sept tables
imaginaires de `completeness`, les 539 renvois, la borne de 600 caractères, et les
deux tests dont la fixture était fausse. Le motif est stable : **un contrôle est
juste sur son périmètre, et j'ai tendance à lui demander plus que son périmètre.**

Le contrôle dit ce qu'il a regardé. Il faut le **lire** avant de le contredire.

### 4. La limite réelle du contrôle, qu'il a lui-même montrée

En plus des trois caractères CJK, le PRD contenait :

| fragment | forme |
|---|---|
| `Le client a bought dans l'application` | **anglais dans une phrase française** |
| `elle ne proceed pas` | idem |
| `rattachtées` | faute de frappe |

`no_stray_characters` ne les a **pas** signalés — et il ne pouvait pas. Ce sont des
caractères latins parfaitement valides qui forment un mot faux. Un scan de
caractères ne voit pas un mot incorrect.

**La corruption générative a donc deux formes, et le contrôle n'en couvre qu'une :**

| forme | exemple | couvert ? |
|---|---|---|
| caractère d'une autre écriture | `维护`, `首屏`, `旁` | **oui** — liste blanche |
| mot anglais dans une phrase française | `a bought`, `proceed`, `underneath` | **non** — impossible par construction |

F-29 (`méthode` en grec et en hébreu) et l'INC-002 du projet de référence sont de la
première forme. La seconde est **invisible à tout contrôle de caractères**, et elle
est aussi fréquente dans la sortie des agents : `underneath`, `purely e-mail`,
`l advantage`, `Chronométrer`, `malpresented` sont tous apparus dans les réponses du
commanditaire de ce lancement, dans des documents **valides** du point de vue du
scan.

Ce n'est pas corrigeable par un script de plus : **une liste blanche de caractères ne
peut pas détecter un mot étranger écrit en caractères légitimes.** Ce qui peut le
faire, c'est une relecture humaine du texte qui entre dans un livrable — donc une
règle de processus, pas un contrôle.

### 5. Ce que le contrôle a coûté, et ce qu'il a rapporté

Sur ce seul document : **5 corrections**, dont 3 trouvées par le contrôle et 2 par la
relecture du diff. Le rapport est bon, et il ne dit pas la même chose que
l'autre moitié.

---

## F-39 — Phase 2 (Onduleur) : la roadmap refuse d'attendre deux réponses, et le dit

### Le découpage

| version | slices | taille | part |
|---|---|---|---|
| Fondations | 5 | M | — |
| **MVP** | **15** | XL | **65 % du P1** |
| V1 | 27 | XL | 1,80 × MVP |
| V2 | 13 | XL | 0,87 × MVP |

Le P1 du PRD représente **23 slices**. Le MVP n'est donc **pas** le P1 : il en est
les deux tiers, et ce ne sont **pas** les user stories les moins prioritaires qui
sortent. Ce sont **US-3** (suivre une commande en cours) et la **profondeur du
catalogue** — parce qu'aucun des cinq chiffres de la §8 n'en dépend.

**Le MVP retire donc la seule raison d'ouvrir l'application entre deux commandes.**
C'est assumé, et c'est même un **biais favorable à l'échec** : moins de raisons
d'ouvrir l'onglet Commandes, donc une règle d'arrêt plus difficile à franchir, donc
un franchissement plus probant. Un test plus dur à tricher est un meilleur test.

Sortent aussi du MVP : US-7 (favoris), US-8 (notification, native donc C11), US-10
(adresses), US-9 (retour, Q1 sans réponse), l'étiquetage des rails, et les six
écarts déjà assumés au PRD §7.

### La décision la plus interesting : ne pas attendre Q3 et Q4

Le PRD demandait si le roadmap pouvait être written avant deux réponses du
marchand — Q3 (peut-il retrouver les commandes d'invité ?) et Q4 (fréquence
d'achat annuelle) — **et disait lui-même que ces deux réponses décident de la valeur
du projet**.

La réponse est **non, et pour une raison que le PRD n'avait pas vue** : ces réponses
portent sur la moyenne de **tous** les clients, alors que la seule population qui
ouvrira l'onglet Commandes est celle des **comptes rapprochés** — et cette
population n'existe qu'après la publication, **une seule fois**, à cause de B3 qui
rend le rapprochement définitif.

Attendre coûterait un délai sur **la mauvaise population**, *et* une fenêtre de
publication pendant laquelle la population de réussites est consommée. Le bitmap ne
se rouvre pas.

Le MVP produit donc les deux nombres qui transforment l'attente en **diagnostic** :

| | Commandes ouvertes bas | Commandes ouvertes élevé |
|---|---|---|
| **Correspondances réussies bas** | ce n'est pas la fréquence qui manque, c'est la donnée du marchand (Q3) | l'historique n'est pas là pour être trouvé (Q3) |
| **Correspondances réussies élevé** | l'historique est là et ne sert à rien : il n'y a rien de nouveau à venir (Q4) | l'hypothèse du PRD tient |

**Ce que vaut le MVP dans le cas défavorable :** si Q3 et Q4 sont mauvaises,
l'application n'a aucune valeur propre — c'est une boutique mobile moins bonne que
le site gratuit, et le PRD le dit lui-même. Ce qu'elle produit, c'est une
**décision**, écrite avant d'avoir les chiffres, donc non discutable après. La seule
garantie qu'elle doive tenir pour être juste dans les deux cas est **ne jamais
mentir** : d'où trois décisions et non trois fonctionnalités — l'état « aucune
commande trouvée » est permanent et formulé en mots, il ne se présente jamais comme
une panne, et il rend la main au site.

### Six questions que la roadmap pose au PRD, et ne tranche pas

| # | question |
|---|---|
| **Q-A** | La règle d'arrêt a-t-elle un **dénominateur minimum** en dessous duquel elle n'est pas une décision ? Sans lui, elle se tranche sur cinq personnes. |
| **Q-B** | L'ouverture comptée est-elle celle du **jour de la création**, ou une ouverture ultérieure ? Les deux lectures donnent des verdicts opposés. Le MVP produit les deux chiffres ; c'est la règle qui doit dire lequel compte. |
| **Q-C** | Où se fait la jointure « compte créé / Commandes ouverte », si C9 interdit tout identifiant de personne dans un événement ? L'outil d'audit la fait par un identifiant pseudo-aléatoire, qui reste un identifiant de personne. **La seule lecture conforme est un comptage côté serveur** — donc la base applicative passe de quatre choses énumérées à cinq. |
| **Q-D** | Les deux demandes au marchand (surveiller son taux de conversion, porter le support des comptes sans historique) sont-elles compatibles avec B6 ? |
| **Q-E** | E5 (suppression du compte) est-il bien P1 ? La roadmap le met dans le MVP pour cause de C9, et **le signale plutôt que de le décider**. |
| **Q-F** | B9 promet **trois** niveaux de repli, E4 n'en nomme que deux. Le troisième doit être non vide **sans compte et sans travail marchand**. |

Une roadmap qui réécrit son PRD n'est plus une roadmap. Ces six trous sont **laissés
au PRD**.

### Le gel de périmètre est écrit, pas laissé au jugement

Risque du MVP : une mise à jour à chaud « évidente » modifie le produit sous le
compteur, et la mesure est invalidée. La frontière est donc **écrite** :

> Toute correction qui **restaure** le comportement prévu est permise. Toute capacité
> nouvelle est interdite jusqu'à la lecture de la règle d'arrêt.

La décision n'est pas laissée au jugement de celui qui code — sinon elle sera
prise, un soir, par quelqu'un qui ne connaît pas la fenêtre de mesure.

### La sixième lecture fausse d'un contrôle

`register` a affiché `derived_from: None` sur la roadmap. J'ai lu « la provenance
n'a pas été propagée » et j'ai commencé à chercher un défaut dans la propagation
découverte en v1.4.2.

**Il n'y avait pas de défaut.** Le champ `derived_from` n'était pas **présent** dans
la sortie — mon `.get()` renvoyait `None` par absence de clé, pas par valeur nulle.
L'état contenait bien `['.forge/prd.md']`.

C'est la **sixième** fois dans ce dossier que je lis mal la sortie d'un outil, après
les 283 fausses citations, les sept tables imaginaires, les 539 renvois, la borne de
600 caractères, le `no_stray_characters` innocent, et les deux fixtures de test
fausses. Le motif ne change pas : **un contrôle est juste sur son périmètre**, et je
lui demande plus que son périmètre au lieu de lire ce qu'il a réellement dit.

La conséquence est la même à chaque fois — du travail perdu, et un faux défaut
annoncé. Ce n'est pas un défaut du skill. C'est une habitude, et elle est à changer
côté lecteur, pas côté script.
