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

## F-40 — Phase 3 (Onduleur) : le contrôle ne savait pas nommer un texte

Le premier design system **français** passé dans `design-check contrast` a rendu
`pass: false` avec **huit** signalements. Six semblaient être de vraies corrections.
Un ne l'était pas — et sous eux il y en avait un **`vrai` que le contrôle ne pouvait
pas voir**.

### Le mécanisme

`design-check` classe chaque couleur pour lui appliquer le bon seuil : **4,5:1**
pour du texte (WCAG 1.4.3), **3:1** pour un composant d'interface (1.4.11), rien
pour une teinte décorative. Pour cela il lisait **le nom du token**, et ses trois
signaux étaient des littéraux **anglais** :

```
--color-text-*                                → texte
--color-ink-50/100/200, *-subtle, --color-surface*  → surface
le reste                                      → composant non textuel
```

Ils ont été écrits contre le design system d'**Amberline**, dont les tokens sont
nommés en anglais.

Or **tout ce que ce skill produit est en français** : `SKILL.md`, les gabarits, les
agents, et jusqu'à l'exemple canonique d'ambiance de `design-quality.md`, dont la
ligne dit « Trois mots, pas davantage » et donne « dense, opérationnel, calme ». Un
vocabulaire de tokens français n'est pas un cas limite : c'est **le cas attendu**.

Sur Onduleur, aucun nom ne correspondait. **Tout** est tombé sur « composant non
textuel », donc sur 3:1.

### Les deux directions, dont une silencieuse

**Six faux positifs**, prévisibles :

- `--color-texte-inverse` — qui est du texte, et n'est jamais posé que sur l'encre
  et les quatre teintes sémantiques — mesuré à **1,10:1** contre le papier, où il
  n'est jamais posé ;
- les quatre premières teintes de la rampe d'encre, qui sont des **teintes de survol**
  et des trames d'illustration, exigées à 3:1 contre le fond alors que la 1.4.11 ne
  parle pas d'un état décoratif.

**Et un faux négatif, dans le dossier que le script venait de mesurer.**

`--color-texte-desactive` est un **token de texte**. Il vaut **3,80:1** sur
`--color-surface-sunken` : **sous le seuil de texte**. Classé composant, il était
jugé contre 3:1 — donc **conforme**. Il est apparu dans `measured`, avec son ratio,
son `against`, son `required`, et **jamais** dans `offenders`.

La sortie disait `pass: false` pour six mauvaises raisons, et ne disait rien de la
bonne.

C'est exactement le défaut que ce script a été écrit pour trouver :
`--color-text-secondary` à **4,17:1** sur Amberline, portant les **dates de calcul**,
c'est-à-dire la provenance — l'information sur laquelle repose tout le produit. Il
l'a reproduit, à 0,30 du seuil, dans le document sous ses yeux.

**Septième** mécanisme de la même famille, et le premier qui échoue **en silence**.
Les six autres produisaient du bruit visible ; celui-ci produisait un vert.

### Le correctif : le document déclare, le script mesure

Ajouter `--color-texte-*` à côté de `--color-text-*` aurait été le correctif
évident, et il est faux : il faudrait réécrire la liste à chaque vocabulaire, et le
contrôle continuerait à **deviner**. Le principe tenu depuis cinq échecs dans ce
dossier est l'inverse — *un contrôle qui marche résout un pointeur déclaré ; une
tentative d'inférence produit du bruit*.

Le design system déclare donc ses classes une fois, dans un bloc
`<!-- forge:token-classes -->` : `text`, `surface`, `nontext`, `on`, `exempt`.
Résolution dans cet ordre : **déclaration, puis `EXEMPT`, puis heuristiques** —
Amberline est donc inchangé, et ses tests existants sont toujours verts. C'est la
preuve que la correction n'a rien cassé en chemin.

Trois conséquences que la déclaration rend possibles :

- **`on:`** dit sur quels fonds un texte est **réellement** posé. Un texte est
  mesuré contre toute surface du document : c'est juste pour de l'encre et faux
  pour un texte inversé, jamais posé que sur des fonds sombres. Sans `on:`, il est
  mesuré contre le papier et échoue **par construction** — un faux positif par
  palette, c'est-à-dire presque toutes.
- **Les tokens exigés ne sont plus une liste de noms anglais.** Exiger
  `--color-text-primary` d'un document français l'obligerait à déclarer un token
  qu'il n'a pas, ou à renommer sa palette pour satisfaire un script. L'exigence
  devient **structurelle** — « il y a au moins un texte, et un fond » — ce qui est ce
  que la liste en dur cherchait réellement à garantir.
- **Un token de couleur absent des six listes est signalé.** La déclaration est un
  engagement, donc l'omettre est un choix, pas un oubli qu'un nom puisse rattraper.

### Trois défauts trouvés en corrigeant le premier

Chacun par un test **négatif** — un défaut observable, pas une intention.

**Un composant déclaré n'entre PAS dans les surfaces.** Ma première version faisait
entrer tout `nontext` dans les surfaces, « parce qu'un bouton porte son libellé ».
C'est exact pour le bouton et faux pour tout le reste : un texte courant n'est pas
posé sur un filet, et le mesureur retient le **pire** couple. Résultat — du texte de
corps signalé à 2,16:1 sur le fond d'un bouton où il ne sera jamais écrit. **Un
contrôle plus strict que la réalité n'est pas plus prudent, il est faux.** C'est le
motif exact des sept échecs, et je l'ai reproduit en corrigeant le précédent.

**Le rapport d'échec nommait le token au lieu de la surface.** La mesure était juste,
l'attribution ne l'était pas : l'entrée disait `against: --color-texte-inverse` pour un
texte mesuré sur l'encre. Un rapport qui nomme la mauvaise surface envoie corriger la
mauvaise couleur — c'est pire qu'aucun rapport, parce qu'il est crédible.

**Le parseur perdait les lignes de continuation.** Une liste sur plusieurs lignes
n'en retenait que la première. La déclaration **paraissait** complète — `seen: true`,
cinq directives, aucune erreur — et ne l'était qu'à moitié ; les tokens oubliés
retombaient silencieusement sur le classement par défaut. Un parseur qui perd une
partie de son entrée doit en signaler une autre : c'est ce qui a été ajouté.

### Le défaut du projet, séparément

Une fois le contrôle capable de voir, il a vu. `--color-texte-desactive` descendu de
`#78705F` à `#665E4E` : **3,80:1 → 4,96:1** sur la surface la moins favorable. **Par
la valeur, pas par une exemption** — une exemption aurait rendu le problème invisible
au lieu de le résoudre, et c'est la tentation quand on vient d'ajouter une mécanique
qui excuse.

Et un second trou, trouvé **en remplissant la déclaration** : le document **annonçait**
au script de mesurer « pastille de statut (fond teinté + texte forte) pour les quatre
teintes », alors qu'il ne déclarait **aucun fond teinté**. La vérification promise
n'était pas seulement absente — elle était **impossible**. Les quatre paires
`-doux` / `-fort` ont été ajoutées, et les deux encre `-fort` qui manquaient pour
l'attention et l'information. C'est la **troisième** fois dans ce dossier qu'un
document annonce une vérification qu'il n'a pas rendue possible, et la réponse n'est
pas de retirer l'annonce : c'est d'ajouter ce qui la rend vérifiable.

**Résultat** : `pass: true`, 0 signalement, 8 surfaces mesurées, 9 tokens de texte
au-dessus de 4,5:1, 11 composants au-dessus de 3:1, 6 exemptions **chacune avec sa
raison**.

### Un second défaut, dans la manière de livrer

J'ai promu `[Unreleased]` en `1.7.0` **à la main**, dans le commit de contenu. Le
workflow a donc trouvé une section vide et a refusé de publier — à raison :
`decide` dit qu'un niveau demandé à la main ne crée pas de contenu, et publier aurait
consommé un numéro pour un changement invisible.

`release.js bump` laisse aussi derrière lui l'ancien en-tête vide, d'où **deux**
`## [Unreleased]` et `entries: 0`. Les deux ont été remis droit dans un PR séparé
(#36) : la promotion appartient au `chore(release)` du bot, qui l'avait déjà faite
trois fois sans incident.

Ce n'est pas un défaut du skill — c'est un défaut de **qui** fait quoi, et il ne
pouvait apparaître que parce que la version avait été réellement publiée puis
vérifiée par l'archive. Un test qui n'aurait vérifié que `VERSION` et le nombre de
sections l'aurait laissé passer.

### Ce que cela ajoute au dossier

Le compteur d'heuriques qui ont produit du bruit passe à **sept**, dont une
silencieuse. Et la règle qui en sort est plus forte que les six précédentes :

> Un contrôle qui **devine** échoue dans le sens silencieux quand le motif est absent,
> et dans le sens bruyant quand il est présent. Les deux sont des défauts, et le
> deuxième se voit tout de suite — c'est pour cela qu'il reçoit toute l'attention.

Un motif absent ne produit pas une absence de contrôle. Il produit **le contrôle le
plus large qui reste**, ici 3:1 pour tout, ce qui est précisément le seuil qui
laisse passer le pire cas.

**v1.7.0** : PR #35 et #36, archive téléchargée, `snapshot verify` → `pass: true`,
96 fichiers, 0 différence, et la suite complète rejouée **dans l'archive extraite**
(177 passés + 7 non exécutés faute de pglite, comptés à part).

## F-41 — Phase 3.4 (Onduleur) : le contrôle le plus dangereux est un contrôle vide

`component-parity` rendait `pass: true` sur un design system dans lequel il avait
lu **un composant sur sept, à zéro état**.

```
pass: true
components: [ { component: "Bouton", slots: 3, states: 0 } ]
offenders:  []
```

Zéro exigence portée sur aucun écran. Et **rien à signaler**, parce qu'il n'y avait
rien à comparer.

### Deux hypothèses, toutes deux anglaises

**La découverte du composant** :

```js
/^###\s+([A-Z][A-Za-z0-9]*)\s*$/gm
```

Une forme de nom. Un design system français écrit `### Tuile produit`. Donc
invisibles : `Tuile produit`, `Champ de saisie`, `Ligne de commande`,
`Panneau d'état`. Et `### Barre d'onglets, barre de panier, pastille, encart,
feuille, squelette` — un titre qui **énumère** sept composants, donc que la
donnée ne peut pas rendre.

**Le libellé du contrat** : `**États** :` exactement. Or le document écrit
`**États** — rendus par l'union …`. Donc `Bouton` est trouvé, et ses **six** états
n'existent pas pour le contrôle.

Le contrôle lit deux formes, et chacune dans une seule langue. C'est la **deuxième
fois en deux jours** que le même défaut apparaît — d'abord les couleurs
(`design-check`, F-40), maintenant les composants. Le motif est désormais assez
répété pour mériter sa propre règle.

### Ce qui rend ce défaut pire que les six précédents

Les six autres produisaient du **bruit** : trop de signalements, dont des faux.
Celui-ci produit un **vide**.

Un faux positif s'ouvre, se corrige, et laisse une trace. Un contrôle qui ne
vérifie rien **ne s'ouvre jamais**. Un contrôle vide ne se voit pas à la relecture,
ne se voit pas dans la sortie — la sortie dit `pass: true` — et ne se voit pas dans
les tests, puisque les testsverts n'échouent pas.

> **Un contrôle qui n'a rien vérifié ne doit pas dire « conforme ». Il doit dire
> qu'il n'a rien vérifié.**

C'est la règle de fond de ce correctif, et elle ne dépend d'aucun nom, d'aucune
langue, d'aucun format de titre.

### Le correctif : un composant est déclaré par son contrat

Le nom d'un composant n'est plus une **forme**, c'est une **étiquette** — lisible,
avec ses espaces et son apostrophe. Ce qui déclare un composant, c'est la présence
de son contrat :

> **Un composant est une section qui porte `**États**` ou `**Slots**`.**

Et si le design system ne déclare la surface d'aucun composant, le contrôle
**refuse**, en rendant les titres qu'il a lus, pour qu'on sache quoi écrire :

```json
{ "problem": "aucune_surface_declaree",
  "read_headings": ["Tuile produit", "Champ de saisie"],
  "why": "Ce contrôle ne peut alors rien exiger des écrans : il ne rend pas « conforme », il rend « rien vérifié »." }
```

`skipped_headings` est désormais dans la sortie. Un composant absent de la liste
des lus est **visible**, au lieu d'être une absence.

Sur Onduleur, après le correctif :

```
Bouton            slots=3  etats=6
Tuile produit     slots=0  etats=7
Ligne de commande slots=0  etats=8
```

Trois composants lus, et **trois autres visibles comme non lus** — parce que le
document ne déclare pas leur surface. C'est un **défaut du document**, désormais
visible, et non un silence.

### Le cinquième mécanisme, reproduit en corrigeant le sixième

Il suffisait d'écrire `[ \t]*` après le séparateur du libellé. J'ai écrit
`\s*`.

`\s` franchit le retour à la ligne. Le `\s*` avalait la ligne vide **et** l'en-tête
du tableau ; `(.*)` lisait `| État | Déclencheur |` comme une prose inline, ne
trouvait aucun backtick, et déclarait **zéro** état. Silencieusement, sur un
composant par ailleurs correctement détecté — donc un symptôme (`states: 0`) qui
ressemble à un problème de forme de nom, et m'a fait chercher au mauvais endroit.

C'est le motif exact de la **borne de 600 caractères** et du `^\s*` qui traversait
les lignes. Le **deuxième** contrôle à rejouer le schéma en corrigeant le
précédent, et le troisième **`\s` qui franchit la ligne** du dossier.

La correction est `[ \t]*`, et **ce qui suit le libellé décide de la forme** —
tableau ou prose. Un document écrit volontiers `**États** — rendus par X :` suivi
d'un tableau ; déduire la forme de ce qui vient après le séparateur lisait
l'en-tête du tableau comme une prose.

### Un test négatif, parce qu'élargir peut produire un vert faux

Corriger la découverte pouvait transformer un vert vide en vert **faux** — c'est le
risque réel de tout élargissement. Le test le vérifie : un écran qui propage
`2 états : defaut, rupture` quand le design system en déclare trois est signalé,
et le composant nommé est le bon.

### Le bump local, et ce qu'il a coûté la deuxième fois

J'ai promu `[Unreleased]` en 1.8.0 à la main. Le workflow a refusé — à raison, et
comme la fois d'avant. Mais cette fois le refus avait laissé une trace grave :
**j'ai écrasé la section `1.7.0`**, qui contenait le correctif `design-check`. Le
CHANGELOG mergé ne racontait plus que `1.6.3` comme dernière version, alors que le
tag `v1.7.0` existait et avait ses notes.

`check` l'a vu : `VERSION (1.7.0) ne correspond pas à la dernière version du
CHANGELOG (1.6.3)`.

| | ce que le bump local a cassé |
|---|---|
| 1re fois | un `## [Unreleased]` **vide** devant la section promue |
| 2e fois | une release **déjà publiée**, supprimée du CHANGELOG |

Les deux sont le même geste au mauvais endroit. La promotion est une opération du
bot, et elle n'est pas réversible à la main : la première fois elle ajoute une
ligne, la deuxième elle en retire une qu'on ne peut pas récupérer.

Le contrôle a tenu — `check` a refusé de valider un CHANGELOG incohérent avec le
tag. C'est exactement sa raison d'être, et c'est la première fois qu'il **bloque
quelque chose que j'avais fait**.

### La règle qui reste, et qui est la neuvième du même genre

Sept contrôles ont déjà rejoué un motif plus étroit que ce que les documents
écrivent. Deux d'entre eux — la **couleur** et le **composant** — lisaient une
**forme de nom**, et un nom est écrit dans la langue du document. Les deux
échouaient **en silence**.

> Un motif absent ne produit pas une absence de contrôle. Il produit **le contrôle
> le plus large qui reste** : pour la couleur, 3:1 pour tout ; pour le composant,
> zéro exigence pour tous. Le second est pire que le premier, parce qu'il ne produit
> même pas d'erreur à examiner.

La règle générale, celle qui tient pour les deux :

> **Fais déclarer, puis mesure.** Un contrôle qui déduit d'une forme lit une
> langue ; un contrôle qui résout un pointeur déclaré lit un document.

## F-42 — Phase 3.4 (Onduleur) : neuf écrans, et trois contrôles qui ne les voyaient pas

Neuf écrans écrits, ~29 Ko chacun, 10 sections, 9 états rendus, aucun ratio écrit,
aucun `{{PLACEHOLDER}}` résiduel. Puis les contrôles, sur le résultat.

### Ce que neuf écrans change

Le produit a une propriété que la plupart des applications n'ont pas : **le
catalogue n'est pas la valeur, l'historique d'achat est la raison de venir.** Et le
PRD a écrit d'avance une règle d'arrêt à trois mois, une bascule d'onglets à 12 %, et
cinq questions ouvertes.

Un design system juste ne suffit pas quand le produit se juge sur une **mesure** :
l'accueil doit poser la fiche du client **avant** le premier rail, parce qu'un accueil
qui commence par du catalogue reviendrait à faire du site un second écran. Et la
navigation a un rang 3 « borne basse déclarée » (R6 non mesuré) : le document le dit
plutôt que de le masquer.

**Les 9 états ont tous un rendu.** L'état « vide — aucune donnée » de la recherche
rend « Aucun produit ne correspond à « laine mérinos ». » avec le terme cité, **ni
compteur à 0 ni « Réessayer »** : une recherche qui ne trouve rien n'a pas échoué,
elle a répondu (C7).

Et la fiche produit **ne fait pas de fetch au défilement** et son bouton **ne remonte
pas en sticky** : le client sait ce qu'il cherche, et un bouton qui suit le doigt
pendant qu'il parcourt 200 lignes retire l'information qu'il était venu chercher.

### Défaut 1 — le design system ne déclarait pas ses composants

`component-parity` (F-41) lisait 3 composants sur 13. Trois défauts de mon document :

- `### Champ de saisie` n'avait **aucun** libellé `**États**` — juste un tableau ;
- `### Panneau d'état` écrivait `**États de rendu**` — le lecteur attendait `**États**` ;
- `### Barre d'onglets, barre de panier, pastille, encart, feuille, squelette` — un
  titre qui **énumère sept composants**, forme qu'aucune donnée ne peut rendre.

Le troisième est le plus instructif : la donnée est sur la ligne suivante, dans une
**table**, et le titre promettait sept objets là où la structure en permet un. Le
document a été scindé en sept sections, chacune avec ses `**États**` et ses `**Slots**`.

Résultat : **13 composants lus**, `Puce de filtre` et `Interrupteur` inclus, avec
leurs 3 états chacun. `component-parity` est devenu un contrôle qui **exige** quelque
chose — donc qui peut le manquer.

### Défaut 2 — `tokens-used` ne lisait qu'une forme de citation, sur ~150 citations

`tokens-used` est **le seul** lien entre un écran et ses tokens. Il ne lisait que le
jeton et sa valeur **séparés par des backticks** :

```js
/(--[a-z0-9-]+)`?\s+`(#[0-9a-fA-F]{6})`|…/
```

Or les écrans écrivent `--color-background #F1EDE5` **en prose, sans backticks** —
la forme la plus fréquente, dans « Direction visuelle » et « Accessibilité ».

**Mesuré** : **34 citations retenues sur plusieurs centaines**, sur neuf écrans. Et un
défaut injecté à la main — un écran citant `--color-background #7A5A0C` au lieu de
`#F1EDE5` — est passé **au vert**.

C'est le neuvième mécanisme, le troisième sur une forme d'écriture, et le premier où
la forme manquante est la plus **banale**.

### Défaut 3 — mon correctif a supprimé la moitié des citations

Le premier correctif élargissait le motif de cellule. Résultat : **34 → 9**.

La forme en tableau attrapait aussi une cellule **à une colonne**, où le texte de la
cellule est lui-même une citation en prose — et **ma table de jetons, 55 lignes,
était de cette forme**. J'ai supprimé la moitié des citations en voulant en couvrir
une de plus.

Un motif doit dire *quand* deux cellules forment une paire, pas deviner que deux
jetons voisins en forment une. C'est exactement ce que je viens de reprocher aux six
autres ; je l'ai refait immédiatement, dans l'autre sens, et **le compteur l'a
montré avant moi**.

### Défaut 4 — le compteur lui-même, et la non-vacuité

Une citation en cellule est **aussi** une citation en adjacence. Sans exclusion des
positions, chaque défaut est compté **deux fois** — et un compteur qui ment est pire
qu'un compteur absent, parce qu'on s'en sert pour décider qu'on a vérifié.

Et un écran ne citant aucun token rendait `pass: true`. Même vide, même dangereux que
`component-parity`. J'ai écrit le test de cette non-vacuité **avec l'erreur
inverse** : compter le design system comme une source vérifiable — alors que ses
55 lignes sont des citations — l'aurait rendue **verte**, puisque le design system en
produit toujours. L'assertion sur le compteur l'a attrapé avant le commit.

### La méthode qui a marché, et qui n'est pas la mienne

Les deux corrections ont été vérifiées **à la main sur un vrai écran d'Onduleur**, pas
seulement sur mes fixtures :

| injection | forme | détecté |
|---|---|---|
| `--color-background #7A5A0C` | prose sans backticks | oui, avec la valeur du design system |
| `` `--color-encre-200 #000000` `` | prose dans une cellule | oui, ligne et token nommés |

Un contrôle corrigé sur un fixture peut être faux sur un vrai document. Il faut
l'essayer sur ce que l'agent a réellement écrit, sinon on ne teste que sa propre idée
de la forme.

### Résultat

`contrast` PASS · `tokens` PASS · `tokens-used` PASS, **148 citations**, 9 écrans ·
`component-parity` PASS, **13 composants** · `forge-guard all` PASS ·
`consistency all` PASS.

**v1.9.0** : PR #41, `snapshot verify` sur l'archive publiée, suite rejouée dans
l'archive extraite.

## F-43 — La chaîne de publication : deux échappatoires dans le harnais de test

Le défaut le plus important du dossier n'est pas dans un contrôle de contenu. Il
est dans **la chaîne qui publie**, et il a été trouvé par la méthode de bout en
bout : `snapshot verify` puis exécution de la suite **dans l'archive extraite**.

### 1. Le test du refus par tag ne testait rien

`release.js bump` refuse désormais de promouvoir une version dont le tag existe
(la section publiée serait écrasée). Le test de ce refus :

```js
git('init', '-q');
git('config', 'user.email', 'test@example.invalid');
git('config', 'user.name', 'test');
git('tag', t);            // ← erreurs avalées
```

`git tag` sur un dépôt **sans HEAD** échoue en `Failed to resolve 'HEAD' as a valid
ref` : il faut un commit avant de taguer. Les erreurs étant avalées, le bac
ressortait **sans tag**, la protection ne s'exerçait jamais, et `bump` promuait
1.8.0 **comme si de rien n'était** — exactement le défaut que le test prétendait
interdire.

C'est la **quatrième fois** que l'archive publiée trouve ce que la suite locale
laisse passer, et la première fois que la cause est le **test** et non le script.

### 2. `git tag --list` partait du mauvais dépôt

`release.js` résout `VERSION` et `CHANGELOG.md` depuis `__dirname`, mais
interrogeait `git` **depuis le répertoire courant**. Le bac à sable est un dépôt à
part : la commande partait d'un **autre dépôt** que celui que la promotion allait
modifier.

| | dépôt local | archive extraite |
|---|---|---|
| CWD | le dépôt lui-même | le répertoire d'extraction |
| dépôt interrogé | **le bon, par accident** | un dépôt sans tags |
| `publishedTags()` | `['1.6.0' … '1.8.0']` | `[]` |
| refus par tag | exercé | **inexistant** |

Dans le dépôt, la protection fonctionnait **par coïncidence**. Dans l'archive —
le seul endroit où la suite doit tourner en conditions réelles — elle n'existait
pas.

**Le harnais est corrigé dans l'autre sens** : les tests lancent `release.js`
**depuis un répertoire qui n'est pas le bac**. Un test qui lance le script depuis le
bac *peut* passer alors que le script est faux. Un test doit se placer dans les
conditions d'échec qu'il prétend couvrir.

### 3. La vérification qui manquait

J'ai **réintroduit le défaut à la main** — supprimé le `cwd: ROOT` — et vérifié que
le test **échoue**, puis qu'il repasse avec le correctif.

C'est la seule preuve qu'un test négatif sur un contrôle de release vaut
quelque chose, et elle manquait.

> **Un test vert sur un script faux est la forme exacte du défaut qu'on cherche à
> attraper.** Donc : faire échouer le test en réintroduisant le défaut, avant de
> croire le test.

### Le bump local : trois fois, et la protection Finally tient

| | ce que le bump local a cassé |
|---|---|
| 1re fois | un `## [Unreleased]` **vide** devant la section promue |
| 2e fois | la section `1.7.0` **supprimée** — le CHANGELOG ne connaissait plus qu'une version |
| 3e fois | la section `1.8.0` **supprimée**, en promuant sur une branche antérieure au `chore(release)` |

Les trois sont le même geste au mauvais endroit. `bump` **refuse maintenant** si la
version à écrire correspond à un tag existant, ou si elle est antérieure à la
dernière section datée — et il nomme la version en cause.

Il reste une règle que le script ne peut pas appliquer : **rejouer `git pull` avant
de bumper**. Le geste est au bot, et les changements aussi.

### Le compte, et ce qu'il dit

Quatre échappatoires, dont deux dans le harnais :

1. `component-parity` lisait **un composant sur sept** et rendait `pass: true` ;
2. `tokens-used` lisait **une forme de citation sur trois** et laissait passer un
   défaut injecté ;
3. le bac à sable **n'avait pas ses tags** — `git tag` échoue sans commit ;
4. `git tag --list` partait du **mauvais dépôt**.

Les quatre ont la même cause : **un contrôle ou un test qui s'exerce sur un
périmètre qui ne contient pas ce qu'il croit contenir, et déclare donc sa
réussite.** Les deux premiers sont des contrôles de contenu ; les deux derniers
sont **la chaîne qui publie**.

D'où la règle générale, qui vaut pour les dix contrôles et pour les tests :

> Un contrôle qui **déduit d'une forme** lit une langue. Un contrôle qui
> **interroge un périmètre différent** du sien lit un autre dépôt. Et un test qui
> s'exerce ailleurs que là où le défaut apparaît ne couvre rien. Dans les trois cas,
> il rend `pass: true` — et c'est la seule chose qu'il rend.

### La règle, et sa preuve

Les tests d'archives sont restés verts pendant que l'archive échouait, **quatre
fois**. La règle qui en sort :

> **La publication n'est pas vérifiée quand la suite est verte. Elle est vérifiée
> quand l'archive est extraite, non modifiée, et rejouée.** Le seul environnement qui
> diffère du dépôt est le seul qui ment.

Et pour les tests eux-mêmes :

> **Faire échouer le test** en réintroduisant le défaut, avant de croire le test.
> Un test qu'on n'a jamais vu échouer n'est pas un test : c'est un commentaire.

**v1.9.1 et v1.9.2** : PR #44 et #45, `snapshot verify` → `pass: true`, 96 fichiers,
0 différence, et la suite rejouée dans l'archive extraite — **14 tests de fumée
verts**, contre 1 échec en v1.9.1.

## F-44 — Phase 4 (Onduleur) : l'architecture, et deux contrôles qui divergeaient sur la même entrée

1 573 lignes, 15 slices, 6 fondations, 10 `CREATE TABLE`, 10 gardes DDL, 7 vagues
topologiques, zéro cycle. Dix gates verts. Et **deux contrôles qui ne se
contredisaient pas** : ils lisaient deux champs différents de la même entrée, et
chacun en tirait une conclusion défendable.

### Le compte de slices est exact, et vérifiable

Le roadmap annonçait **15 slices** : 9 fonctionnelles et 6 d'obligation transverse.
L'architecture en déclare 15, nommées, avec pour chacune dépendances, parallèle
possible, données et ce qu'elle **ne fait pas**. Le compte n'est pas approché — il
est **compté**, et c'est la première fois que le compte du roadmap et celui de
l'architecture coïncident sans que personne ait dû choisir le plus petit des deux.

Trois décisions qui ont porté l'essentiel :

**La base passe de quatre choses à cinq.** C9 interdit tout identifiant de personne
dans un événement d'audit, et l'outil d'audit fait la jointure « compte créé /
Commandes ouverte » par un identifiant pseudo-aléatoire — qui reste un identifiant
de personne. Donc la jointure se fait chez nous. C'est la question Q-C du roadmap,
et elle a une réponse architecturale, pas un « à demander ».

**`fenetre_mesure` est une ligne, pas une configuration.** B3 rend le rapprochement
unique et définitif, donc la fenêtre d'observation **ne s'ouvre qu'une fois**. Un
trigger refuse toute mise à jour, et ce refus est écrit comme garde DDL — donc
exécuté, pas affirmé.

**`session_mesure` n'a aucune clé étrangère vers `compte`.** C'est la garantie
mécanique de C9 : il n'existe pas de chemin dans le schéma qui relie une session à
une personne. Une garde le vérifie. C'est le genre de contrainte qui tient quand
personne n'y pense, et qui cède dès que quelqu'un ajoute une colonne.

### Défaut 1 — une slice de Phase 4 se croyait avoir un plan

`register` écrivait `plan_path = relPath`. Les slices sont enregistrées **contre le
document d'architecture** — c'est leur lieu de description — donc `plan_path` valait
`.forge/architecture.md`. Deux contrôles divergeaient :

| contrôle | lit | conclut |
|---|---|---|
| `no_premature_artifacts` | `plan_path` | un plan existe → « plan écrit avant la phase 5 » |
| `slice_plan_exists` | `content_hash` | un plan a été écrit → il a **disparu** → réécris-le |

Le premier signalait les **15 slices**. Le second en exigeait **15 plans**, dont
personne n'avait écrit le nom, sur une phase où les écrire est le travail de la
phase **suivante**.

**Le garde-fou n'était pas faux dans les deux cas. L'entrée mentait**, et de deux
façons incompatibles.

La correction est un prédicat unique, `isPlanPath`, qui décide sur le **chemin** —
la seule chose que l'enregistrement connaisse. Le contenu n'existe pas encore, et le
nom de la slice est identique dans les deux cas. Sans un endroit unique, les deux
lectures divergent à nouveau : c'est ce que j'ai d'abord fait, et le test l'a vu
avant moi.

Et `content_hash` ne prouve **rien** sur un fichier absent. `plan_hash` le remplace,
écrit seulement pour un chemin de plan.

### Défaut 2 — la même entrée ne peut pas avoir deux propriétaires

En appliquant le correctif, un second écart est apparu, de la même famille : une
slice de Phase 4 et le document d'architecture sont **le même fichier**. Donc
`state_frontmatter_in_sync` comparait le statut de 15 slices au `status:` d'un seul
front matter, et en concluait 15 divergences — dont il ne pouvait y en avoir qu'une.

Les 15 slices sont désormais des **entrées sans statut propre** : leur statut est
`identified`, et le statut du fichier appartient au document. C'est plus cohérent,
et c'est la seule forme qui ne ment pas.

### Le contrôle `no_undecided_slots` a fait son travail, et il avait raison

Architecture approuvée, donc **plus aucun « À DÉCIDER » ne doit survivre**. Il en
restait 16. Le contrôle bloquait, et il avait raison : les huit cases de
`conventions.md` étaient des cases vides **réellement** vides — l'ORM, le state
management, le HTTP client, la validation, le styling, la bibliothèque de
composants, les icônes, les formulaires. Aucune n'avait été remplie, et le tableau
avait été approuvé tel quel.

Elles sont maintenant tranchées, chacune avec sa raison :

- **Drizzle** et non un ORM qui génère son DDL : le § 4.10 écrit du SQL exécutable,
  donc la preuve doit porter sur le SQL exécuté, pas sur un schéma dérivé d'objets
  JavaScript ;
- **`fetch` natif** et non une couche : elle coûterait des kilo-octets sur le chemin
  critique de C6 pour des fonctions que TanStack Query fait déjà ;
- **aucune bibliothèque de composants** : elle apporterait une deuxième source de
  vérité pour exactement les valeurs qui viennent d'être mesurées contraste par
  contraste.

Et les points du design system, eux, ne sont pas tous des décisions à prendre —
c'est ce que la section 6 réécrite dit. Le point 4 (charte de marque) n'est **pas**
un trou : la règle est prête, le point de substitution est écrit, et ce qui manque
c'est une **demande** que personne n'a faite. B6 décrit le marchand comme une
source, pas comme un commanditaire.

### Un défaut que je n'ai pas cherché

En relisant la sortie de `no_undecided_slots`, une de ses propres lignes de règle
apparaissait dans le document que j'avais écrit — le contrôle qui interdit « À
DÉCIDER » citait son propre motif dans le design system, et se signalait lui-même.

C'est une classe de défaut que je n'avais jamais rencontrée : **un contrôle qui
porte sur son propre vocabulaire se déclenche sur la documentation du contrôle**.
Le motif a été reformulé, et le contrôle a raison de tout de même — les 15 autres
cas étaient réels.

### Résultat

| gate | |
|---|---|
| `forge-guard all` | **PASS** — 15 contrôles |
| `consistency all` | **PASS** — 8 contrôles, 3 skips attendus |
| `design-check contrast` / `tokens` / `tokens-used` / `component-parity` | **PASS** ×4 |
| `ddl-exec completeness` / `execute` / `guards` | **PASS** ×3 — 8 tables, 10 gardes, 0 morte |
| `dependency-check` | **PASS** — 7 vagues, 0 cycle, 0 orphelin |

**v1.9.3** : PR #47, `snapshot verify` → `pass: true`, 96 fichiers, 0 différence,
188 tests + 7 non exécutés dans l'archive extraite, 14 tests de fumée verts.

## F-45 — Bailly, projet 3 : le premier artefact n'a personne à qui emprunter une source

Troisième projet du banc d'essai, et le premier où le **dossier de départ est vide**.
C'est ce détail qui a produit le défaut : les deux projets précédents avaient un
`derived_from` omis, ce qui est invisible. Ici l'agent a écrit `derived_from: []` —
une **déclaration de vérité** — et le contrôle l'a refusée.

### Le commanditaire a reformulé la question, et il avait raison

J'ai demandé « où tourne le logiciel ? ». La réponse :

> *« Ta question est mal posée, et c'est important. Tu me demandes une seule chose,
> mais il y en a deux : **où vit la donnée de référence**, et **sur quels appareils je
> la touche**. Ces deux réponses sont différentes et j'ai des réponses différentes. »*

Donnée de référence **chez un hébergeur**, pas sur ses machines. Raison : « si elle
vit sur mon téléphone, les sauvegardes deviennent *mon* boulot, et je ne ferai pas les
sauvegardes ». Appareils : **téléphone d'abord** — parce que c'est là que la donnée se
*crée* — portable ensuite pour le travail de fond.

**Le sous-entendu « application mobile » a été contesté**, et c'est la contestation
la plus utile de la phase : si le téléphone n'est qu'un client qui affiche ce qui est
sur le serveur, alors **le sous-sol sans réseau ne marche pas** — et c'est le moment
où la donnée est la plus précieuse. C'est écrit dans `conventions.md` § 3 comme une
contrainte de structure, pas comme un souhait.

### La règle qui domine le projet

> *« Si je signe un état des lieux dans un sous-sol et que l'application me dit
> « enregistré » alors que ce n'est pas parti, ce n'est pas un bug, c'est un
> contentieux. »*

Trois exigences, dans cet'ordre : **ne jamais mentir sur la sauvegarde** ; **photo et
signature sur l'appareil avant toute tentative réseau** ; et **ce qui exige une
preuve d'envoi ne peut pas être produit hors ligne** — ce dernier point est
**acceptable**, et c'est dit, donc ce n'est pas un défaut à corriger plus tard.

La troisième est celle qui distingue ce projet des deux autres : elle interdit
d'ajouter une fonctionnalité pour « être complet », parce que la preuve d'envoi est
hors de portée du hors-ligne par nature.

### Trois données de fait, trois appréciations — et pas de bouton « tout effacer »

Le commanditaire a corrigé ma question sur l'effacement :

> *« On m'a présenté « effacer », mais ce n'est pas binaire. Les baux, quittances et
> pièces comptables ont une durée légale de conservation. Si tu me conçois un « bouton
> tout effacer », tu me mets en infraction. »*

**Trois états**, donc : effacer · anonymiser · conserver pour obligation légale
**jusqu'à une date de fin écrite**. Et le bouton est interdit **par construction** —
pas par convention : chaque ligne a son état, et les trois ne se déclenchent pas au
même moment.

Et la frontière **constaté / apprécié** est une **contrainte de schéma**, pas une
convention d'écriture : deux champs distincts, deux destinations d'export distinctes,
aucun chemin de l'un vers l'autre. Le piège qu'il a nommé — « un espace notes où tout
se mélange, où un jugement devient un fait parce qu'il est dans le même champ » — est
la raison pour laquelle la saisie libre doit **demander la classe**, et ne peut pas
avoir « ce que j'ai lu quelque part » pour défaut.

### L'export est un produit du MVP, pas une fonction

> *« Si l'hébergeur meurt demain, je dois pouvoir récupérer mes 14 baux en une
> journée. »*

**Trois formes, trois destinataires** : dossier locataire (lisible, daté, au nom de
la personne — « constaté » seul) · reprise complète (**lisible sans Bailly**) ·
comptes. La deuxième est la plus dure : « un export que seul Bailly sait lire n'est
pas une sauvegarde, c'est une raison de plus de ne jamais quitter Bailly ».

### Il a contesté sa propre fréquence, et c'est la partie la plus utile

Ses trois tâches hebdomadaires sont réelles. Mais il a ajouté :

> *« « Hebdomadaire » est un bon proxy de fréquence, pas de risque. Il y a des
> obligations mensuelles ou annuelles que je peux rater, et quand je les rate ça coûte
> de l'argent ou ça me bloque juridiquement. »*

Sa demande n'est pas de les calculer — c'est de **ne pas le laisser les oublier**. Un
simple rappel de date pour cinq échéances, « rien de plus ». C'est donc un MVP de
**3 tâches + 1 garde-fou**, et le garde-fou n'est pas une fonctionnalité : c'est
l'obligation de dire, à l'écran, **ce qui n'a pas été fait**.

### Le défaut du contrôle

`derived_from_non_empty` refuse une liste vide. Juste en général — mais
`conventions.md` est le **premier** document du projet, il dérive d'un **entretien**,
et écrire `derived_from: []` y est une **déclaration de vérité**.

Le contrôle confondait « j'ai déclaré que je n'ai pas de source » et « j'ai oublié de
dire d'où ça vient ». Il a raison de la forme et tort du fond.

**Un contre-test a rejeté ma première correction.** J'avais écrit « si personne
d'autre ne déclare de source, c'est le premier » — ce qui accepte un **écran seul**
dans un projet vide. Faux : un écran sans conception n'est pas le premier, il est
**en avance**. Un contrôle assoupli jusqu'à ne plus rien voir n'est pas un contrôle
assoupli, c'est un contrôle supprimé — et c'est le **dixième** encounter de cette
famille.

Et `current_phase` est un **nombre**, pas une clé de phase : je l'ai comparé à
`PHASE_KEYS.indexOf(...)`, qui renvoie `-1` en phase 0. Le premier artefact était donc
refusé **pour la raison inverse** de celle que je corrigeais. **Deux bugs dans le même
correctif, tous deux invisibles sans le contre-test** — dont un que j'ai introduit en
corrigeant l'autre.

### La règle qui reste, et qui est la onzième du même genre

Les dix échappatoires déjà relevées portaient toutes sur un motif lu, un périmètre
interrogé, ou un test exercé ailleurs que là où le défaut apparaît. Celui-ci est un
**sens** : le contrôle confondait deux intentions opposées qui s'écrivent de la même façon.

> **Une valeur vide a toujours deux lectures.** « Je n'ai pas de source » et « j'ai
> oublié de dire d'où ça vient » s'écrivent `[]`. Ce qui les sépare n'est pas la
> valeur : c'est **la position de l'artefact dans la chaîne**. Donc le contrôle doit
> lire la position, jamais la valeur.

Et le corollaire, qui vaut pour toutes les corrections de ce dossier :

> **Un correctif doit avoir son contre-test, et le contre-test doit pouvoir le
> rejeter.** Le premier correctif d'`isPlanPath`, celui de `derived_from`, celui de la
> sélection de l'état de session — tous les trois ont été rejetés par un test
> existant. Aucun n'a été accepté du premier coup, et c'est le meilleur indicateur
> qu'on ait sur la santé d'une suite.

**v1.9.4** : PR #49, 197 tests.

## F-46 — Amberline Phase 4 : les quatre signalements bloquants, en un lot

Quatre défauts accumulation depuis des semaines, traités comme **un seul lot** parce
qu'ils se tiennent : deux portes qui ne tenaient pas, un index qui interdisait ce que
la correction approuvée venait d'ouvrir, et une porte qui passait **pour la mauvaise
raison**. Résultat : **7 portes déclarées, 7 actives, 0 morte.**

### Défaut 1 — la garde de cycle de vie n'avait pas d'états terminaux

La garde demandait « quel acte justifie cet état » (un `CASE NEW.status`), sans
jamais demander « cet état avait-il le droit d'exister ». Donc `published` et
`refused` **n'étaient pas terminaux** : on pouvait en sortir.

Le tableau de transitions est maintenant explicite, et il dit les deux choses à la
fois — la transition autorisée **et** l'acte qui la justifie. Un couple absent est
refusé sans qu'on ait à consulter `signature_event`, et `published` / `refused`
n'ont plus de couple sortant : **B26 est enfin dans la base**, et non dans une
phrase.

**Et j'ai maladroitement reproduit le défaut en corrigeant** : ma première table
contenait `('draft', 'in_review')` deux fois et **oubliait `signed -> published`**.
Le moteur l'a refusée, et il avait raison — sans `publish` dans la table, aucun
document ne pouvait jamais publier.

### Défaut 2 — aucune porte d'entrée, donc le cycle était contournable par le bas

Les quatre portes étaient **toutes** des `UPDATE`. Aucune n'essayait l'`INSERT` :
rien n'empêchait d'écrire directement une version `published` avec son
`published_at`, c'est-à-dire de **publier sans passer par un acte**.

Une porte qui ne couvre qu'un côté d'une opération n'est pas une porte, c'est une
moitié — et cette moitié-là est la plus facile à contourner, parce qu'elle demande
moins de travail. **Porte 3 ter** l'essaie, et elle est refusée.

**Et le premier correctif était un mur, pas une porte.** J'ai écrit
`CHECK (status = 'draft')` en pensant fermer l'entrée. Or un `CHECK` ne dit pas
« à l'insertion seulement » : il empêche **toute mise à jour** qui change le
statut. La version devenait donc figée en `draft` pour toujours, et **le cycle de
vie entier était inatteignable**. C'est un défaut que j'ai introduit en corrigeant le
défaut, et que seul le `execute` du projet a vu.

La correction est un **`BEFORE INSERT`**, dont la portée est exactement celle qu'on
veut fermer. Et un `CHECK` reste justifié pour l'invariant qui, lui, ne dépend pas du
moment : `published_at` n'a de sens qu'avec le statut qui la justifie.

### Défaut 3 — l'index interdisait ce que la correction approuvée venait d'ouvrir

`one_active_signature_per_signer` portait `WHERE act = 'sign'` — donc « au plus une
signature **pour toute la vie de l'indicateur** ». Or la correction #2 de § 4.6.0
ouvre explicitement la **re-signature**.

**Et l'index ne pouvait pas le dire** : un prédicat d'index n'exécute pas de
jointure, et « ce `sign` est-il ciblé par un `revoke` ? » porte sur **une autre
ligne**. C'est une limite du SQL, pas une faute de rédaction — et c'est exactement
la limite que l'ADR avait rencontrée sans la nommer.

L'index porte donc sur une **colonne dénormalisée**, `revoked_at`, posée par le
trigger de révocation. Le prédicat redevient une question sur **la même ligne**.

Et une dénormalisation sans contrainte croisée est une **seconde vérité** : un
`UPDATE signature_event SET revoked_at = now()` suffisait à libérer la signature et
à rouvrir la re-signature par la fenêtre que la porte venait de fermer. **Porte 6**
l'essaie, et elle est refusée. `revoked_at` n'est donc pas une donnée : c'est la
**projection** de l'acte, au même titre que `status` est la projection du cycle.

**Et `designated_signer_actor_id` n'était jamais mis à jour** — une valeur figée pour
toute la vie de l'indicateur, donc un chemin de re-signature que rien n'atteignait.
Il est mis à jour maintenant, **et le changement exige qu'aucune signature active ne
porte sur la version courante** : désigner quelqu'un d'autre pendant qu'une
signature est en cours laisserait un indicateur désigné vers un tiers.

### Défaut 4 — la porte 3 passait pour la mauvaise raison

C'est le pire des quatre, et c'est celui qui a demandé le plus de travail.

La porte 3 essayait `published -> draft`. Elle était refusée — donc « verte ». Mais
**aucun acte `revoke` n'existait dans les données de pose** : la version v2 n'avait
jamais été révoquée. La porte passait donc non parce qu'elle jugeait juste, mais
parce que **l'opération interdite n'était pas produitible**.

Une porte qui passe pour la mauvaise raison ne prouve rien.

Le correctif est **v3** : soumise, signée, puis révoquée par un acte nommé, qui
reste en `draft`. Porte 3 est maintenant essayée sur une version où le `revoke`
**existe**, donc elle est réellement exercée.

**Et cette fois j'ai fait l'erreur inverse.** Ma porte 5 devait, selon mon
commentaire, « échouer parce que v3 porte une signature active » — mais la
signature de v3 **avait été révoquée**, donc la ré-signation y est *légitimement*
possible. La la garde a reporté `refused: false` et **m'a signalé que mon intention
était fausse**. Une garde morte est un contrôle qui fonctionne.

La porte a été réécrite sur v1 (signature **active**), et le **témoin positif** — la
même insertion sur v3, qui **doit réussir** — est dans les données de pose. Parce
qu'une porte qui refuse les deux ne distingue pas « j'ai corrigé le prédicat » de
« j'ai tout interdit ».

### Le cinquième défaut, trouvé en route : deux commandes, deux schémas

`execute` PASS pendant que `guards` annonçait « 2 gardes inertes ». Les deux
commandes synthétisaient le schéma **différemment** : `execute` ignorait les
`CREATE TABLE` du document, `guards` les ignorait aussi — donc `revoked_at`
n'existait pas et la garde échouait sur une **colonne fantôme**.

Un contrôle qui n'a pas exécuté ce qu'il croit avoir exécuté ne peut rien conclure —
ni « inerte », ni « active ». Les deux commandes construisent maintenant le schéma de
la **même** façon, et l'ordre est celui du document.

Et un sixième, plus petit : **`DECLARE v_id uuid; v_status text;` — le séparateur
PL/pgSQL est le point-virgule, pas la virgule.** Le parseur découpait sur `,`, donc
`v_status` n'était pas « déclaré », et `SELECT status INTO v_status FROM
definition_version` était lu comme une lecture de la **table** `v_status`.
`dangling_references: ['v_status']` sur une fonction parfaitement valide — un
contrôle qui accuse une table inexistante apprend à être ignoré.

### Ce que l'exécution a réellement trouvé

Aucune de ces corrections n'a été validée à la relecture. Le moteur a trouvé, dans
l'ordre : le nom de fonction incohérent entre `CREATE FUNCTION` et le trigger ; la
contrainte `nait_en_draft` qui interdisait tout `UPDATE` de statut ; les `UPDATE`
qui sautaient `draft -> signed` ; la table de transitions qui oubliait
`signed -> published` ; `target_unit` et `target_value` absents du `CREATE TABLE`
alors que § 4.6 les déclare ; et trois objets que j'avais posés **deux fois** — en
`CREATE TABLE` **et** en `ALTER TABLE`.

**Sept erreurs, six écrites par moi.** Le « le DDL s'exécute, ou n'est pas écrit »
n'est pas une métaphore : c'est la seule chose qui les a trouvées.

### Amberline : la base applicative n'existait pas dans le document

`ddl-exec completeness` disait `tables_created_in_ddl: 0` pour
`tables_declared_in_prose: 17`. Les trois tables que tout le DDL contraint —
`indicator`, `definition_version`, `signature_event` — étaient **déclarées en
tableau de colonnes et jamais créées**.

Et `execute` les **synthétisait** avant de jouer le DDL, ce qui cachait le problème :
une porte ne s'exerçait sur un schéma que le script venait d'inventer.

Les `CREATE TABLE` sont maintenant dans le document, alignés **champ par champ** sur
les tableaux de § 4.5 à § 4.8 — et `execute` ne fabrique plus rien derrière le dos
du document. C'est l'action #2 de F-33, ouverte depuis le début du dossier.

### Les deux constats restent non promus, et c'est la bonne décision

`findings_promoted` est en **`warn`**, jamais en `pass`, tant que F-001 et F-002 ne
sont pas promus. C'est le comportement voulu : un constat non promu qui rend le gate
vert serait pire que rouge.

Leur **porteur** et leur **échéance** sont maintenant écrits dans l'état :

| constat | pourquoi il ne se promeut pas |
|---|---|
| **F-001** — aucun titulaire du rôle signataire nommé | B2 est **déjà tranché**. Ce qui manque est un **nom**, pas une règle. Promouvoir un constat dont la correction est « nommer quelqu'un » inscrirait dans un fichier de règles une obligation **sans titulaire**. |
| **F-002** — B7 exige une démonstration sur des lignes réelles | La correction dépend d'un **accord externe** (équipe data, fixture seedée), pas d'une décision d'architecture. La promouvoir transformerait un blocage externe en obligation documentaire. |

Un `warn` qui **nomme** les deux constats, leur porteur et leur échéance est
infiniment plus utile qu'un `pass` silencieux.

### Le dernier échec, classé « correct, pas un défaut »

`no_premature_artifacts` signale les **15 plans de la Phase 5** écrits à la Phase 4.
C'est le résultat attendu, classé tel depuis le début du dossier, et le commanditaire
a **refusé leur suppression** parce que l'approbation des plans les légitime. Il n'est
ni contourné ni « corrigé » : il reste, et il est dit.

### Résultat

| gate | |
|---|---|
| `ddl-exec completeness` | **PASS** — 4 tables créées, 0 prose-only, 0 dangling |
| `ddl-exec execute` | **PASS** — 47 instructions, 0 erreur |
| `ddl-exec guards` | **PASS** — 7 déclarées, 7 actives, **0 morte** |
| `consistency all` | **PASS** — 9 contrôles, 1 skip attendu |
| `forge-guard all` | 1 échec, `no_premature_artifacts`, **classé correct** |

## F-47 — Bailly Phase 2 : la roadmap n'avait pas d'horloge

Le commanditaire a fait le reproche le plus utile de tout le dossier, et il ne porte
ni sur le périmètre ni sur un écran : il porte sur **la méthode**.

> *« Ma roadmap n'a pas d'horloge. Une slice est finie quand elle marche une fois. Or
> « en retard » n'existe qu'au 6e jour, la reconduction tacite qu'au 36e mois, le dépôt
> qu'après le départ. Conséquence : le garde-fou en position 8 ne sera pas
> démontrable, et les autres auront été bâtis sur des dates inventées pour la démo. »*

C'est **exact**, et j'avais le défaut sous les yeux sans le voir : le produit entier
est une gestion de délais, et j'avais découpé comme un produit de saisie.

### Les cinq échéances, et pourquoi deux ne sont pas des rappels

Le commanditaire les a nommées **et les a classées lui-même** — et le classement est la
partie utile.

| # | Échéance | Délai | Ratée, ça coûte | Famille |
|---|---|---|---|---|
| 1 | Fin de terme (opposition à la reconduction tacite) | 3 mois avant — **6 en meublé** | reconduction tacite de 3 ans, relogement perdu | **bloquante** |
| 2 | Bascule en créance exigible | **6e jour** | plus de base légale ; une relance hors délai ne vaut rien | **bloquante** |
| 3 | Restitution du dépôt de garantie | 1 mois — **21 jours sans retenue** | intérêts et pénalités, quand le dossier est le plus fragile | **bloquante** |
| 4 | Validité des diagnostics (DPE, gaz, amiante…) | 6 ans — **10 ans** pour un DPE antérieur à 1948 | dossier qui ne tient pas, nullité possible | **marge** |
| 5 | Assurance propriétaire (PNO) | annuel | la square est à découvert | **marge** |

**Les trois premières bloquent, les deux autres alertent longuement et silencieusement.**
Et sa raison est celle qui compte : *« leur échéance est une marge, pas une alarme »*.

C'est la première fois qu'une property se **décompose en deux comportements
distincts**, et ce n'est pas un détail d'implémentation : c'est la forme du garde-fou.
Un produit de rappels n'aurait qu'un comportement ; celui-ci en a deux, et les confondre
produirait soit un mur sur une échéance à 6 ans, soit un silence sur une créance
exigible.

**Le compromis est écrit** : quittance annuelle, régularisation des charges et
révision du loyer sont exclues du produit, **réelles en droit**, tenues par un
calendrier externe. C'est un défaut connu et accepté, pas un oubli.

### Quatre arbitrages que j'avais mal pris

**La relance n'est pas une slice.** Je l'avais découpée seule, en arguant que c'est
« la seule chose que l'application ne sait pas faire hors ligne ». Sa réponse :
*« la relance n'a pas d'état propre : c'est un acte sur l'encaissement. Son caractère
en-ligne-obligatoire est une règle écrite dans une slice, pas un motif de découpage —
sinon je découpe tout. »* **Un comportement spécial est une règle, pas une frontière.**

**La synchronisation n'est pas une slice, c'est un invariant.** *« Personne ne voit "la
file d'attente", on voit "3 en attente". Le compteur honnête et la reprise automatique
doivent être le premier test du produit, pas le quatrième. »* C'est vrai, et j'en avais
fait la quatrième.

**Le garde-fou n'est pas la huitième slice, c'est la troisième.** Parce que
l'encaissement, la relance et les demandes consomment **toutes** des dates : construites
en dernier, elles réinventeraient chacune leurs dates à la main. **Deux sources de
vérité.**

**Et il manquait deux slices entières.** Ni B9 (les trois états RGPD) ni B11 (l'export
lisible sans Bailly) n'étaient portés par aucune autre. *« Assignés explicitement, ou
ils n'existent pas »* — et B11 est **la condition de survie du produit**, pas une
fonction de confort.

Sur `piece-jointe`, en revanche, il m'a donné raison : *« c'est la seule dont l'échec
vient de l'environnement et non de la logique. Fusionnée dans saisie, elle se teste en
4G et se découvre en métro. »*

### La règle qui sort de là, et qui est d'ordre général

> **Une slice dont le comportement dépend d'une date ne peut pas être démontrée par
> « ça marche ». Elle se démontre par une horloge simulée**, et l'horloge est de
> **l'infrastructure de test**, pas un réglage du développeur.

Les trois cas, écrits dans la roadmap :

| Slice | Sa date |
|---|---|
| `encaissement` | le **6 du mois** — c'est là que « en retard » existe |
| `garde-fou` | le **11e mois du terme** — c'est là que la reconduction tacite devient visible |
| `socle-synchronisation` | n'importe quelle date, **mode avion** — la seule dont l'échec ne dépend pas du moment |

C'est la même famille que la boutique de démonstration d'Onduleur (R7) : du **temps
calendaire** qu'on ne voit pas sur une branche. Et c'est **le même test manquant** que
dans les deux erreurs précédentes du projet — la signature hors ligne validée parce
qu'elle marche au bureau, la journée de saisie jugée unique parce qu'elle marche un
lundi avec du réseau :

> **Le 6 du mois, le 11e mois du terme, en sous-sol, sans réseau.** Une slice non
> démontrable avec une date simulée et un mode avion n'est pas finie.

### Un défaut du skill, trouvé par ce reproche

`derived_from_non_empty` : la correction de F-45 (autoriser une liste vide pour le
premier artefact) exigeait en plus que le projet soit **encore en phase 0 ou 1**. Donc
`conventions.md` a été refusé **dès la phase 2**, parce qu'un PRD en dérive — donc
« plus personne ne déclare de source », donc le premier n'était plus premier.

Un doublon partiel de `no_premature_artifacts`, qui répond déjà à la bonne question. Le
prédicat est réduit à **« l'artefact appartient-il à la phase 0 ? »** — le seul fait
qui décide, et qui ne change pas avec l'avancement.

Constaté sur Bailly **juste après** la roadmap : le genre de défaut qui n'apparaît qu'au
moment où le projet fait sa deuxième chose. Un test l'aurait laissé passer pour toujours.

### Résultat

8 slices au MVP, 11 en V1, 4 en V2 · 18 règles, 11 cas limites, 9 risques ·
`forge-guard all` **PASS** · `consistency all` **PASS**.

**v1.9.6** : PR #54, `snapshot verify` → `pass: true`, 96 fichiers, 0 différence,
192 tests + 7 non exécutés dans l'archive extraite, 14 tests de fumée verts.
199 tests en local (+ 1).
