# Changelog

Toutes les modifications notables de ce dépôt. Le format suit
[Keep a Changelog](https://keepachangelog.com/fr/1.1.0/) et le versionnement
suit [SemVer](https://semver.org/lang/fr/).

**Un seul numéro de version pour le dépôt**, pas un par skill. `forge` référence
`project-rules-architect` dans sa frontière de propriété, et l'inverse : deux
versions indépendantes laisseraient ce contrat dériver en silence, ce qu'aucun
test ne détecte. Le présent fichier indique quel skill a bougé.

## Format des entrées

Une ligne par changement, sous la section de version :

```markdown
### <type>(<scope>) — <résumé en une ligne>

<paragraphe : pourquoi, pas quoi. Le quoi est dans le diff.>
```

Types reconnus : `breaking`, `feat`, `fix`, `docs`, `chore`, `test`, `perf`.

Une section `[Unreleased]` sans entrée n'est pas publiable : `release.js bump`
refuse de bumper, et la CI échoue. Une release vide est pire qu'aucune release,
parce qu'elle consomme un numéro.

## [Unreleased]

### fix(forge) — Un livrable approuvé pouvait reposer sur une exigence retirée

`consistency-check` est l'outil qui existe pour voir les écarts ENTRE artefacts.
Au premier test grandeur nature, il a répondu `pass: true` sur le cas même
qu'il est censé attraper.

`conventions.md`, approuvé en Phase 0, justifiait PostgreSQL par « la réponse à
l'exigence multi-tenant strict, premier critère d'audit ». Le PRD, écrit
ensuite, a mis le multi-tenant **hors scope** — aucun second client n'existe —
et l'a remplacé par l'isolation par ligne entre magasins et régions. Les deux
documents ne peuvent pas rester vrais ensemble, et rien ne le disait.

Pourquoi aucun contrôle ne le voyait : **tous** les contrôles de
`consistency-check` exigeaient un artefact *postérieur* — une slice, un plan,
un écran, un `DECISIONS.md`. À la fin de la Phase 1, aucun n'existait. Les six
contrôles passaient en `skip`, et `pass: true` ne distinguait pas « tout est
cohérent » de « il n'y a rien à comparer ».

**Le contrôle ajouté** — `consistency-check premises` :

- un livrable approuvé **déclare** ses prémisses :
  `state.js register … --requires=B11,C1,C2`
- toute prémisse déclarée que le PRD a retirée est signalée, avec le livrable
  et l'ID fautifs
- un livrable approuvé sans prémisse déclarée est un **avertissement**, pas un
  échec : la dépendance non déclarée doit être visible sans rendre le contrôle
  irritant, donc désactivable
- une exigence retirée **sans son ID en tête d'entrée** est un échec : retirer
  une exigence en lui ôtant son identifiant la rend introuvable, donc la
  contradiction redevient indétectable
- un ID cité dans la raison d'une entrée ne compte pas : il décrit une autre
  exigence, pas celle qui est retirée
- un **même ID défini dans deux sections** est une collision et échoue

Cette dernière n'était pas théorique : en corrigeant le projet de test, j'ai
donné `C1` à « multi-tenant strict » en hors scope alors que `C1` valait déjà
« un seul serveur » en contraintes. Le contrôle l'a vu immédiatement, et
accusait déjà le mauvais livrable. Les exigences retirées sont maintenant
numérotées `B1xx` / `C1xx`, hors de la plage des ID vivants.

**Le conflit a été résolu, pas contourné** : `conventions.md` a été réamendé
(PostgreSQL reste, mais pour porter `store_id` / `region_id` et non
`tenant_id`), repassé `stale` puis `approved`, et `consistency-check all` est
 repassé au vert. Le gabarit `prd.md.tmpl` exige désormais qu'une exigence
retirée garde son ID.

### fix(forge) — Les refus étaient écrits sur stdout, donc perduables

`forge-lib` envoyait **aussi** les erreurs sur stdout. Les scripts sont
conçus pour être enchaînés, donc c'était délibéré pour la lisibilité — mais
conséquence : `node state.js finding … > /dev/null` avalait l'échec exactement
comme il avale une sortie normale.

Perdu de cette façon, en une seule commande : **sept constats d'affilée** ont
été enregistrés avec un domaine de règle inexistant, les sept ont échoué, et
aucun n'a laissé de trace. Le compte de ce qui est réellement dans l'état
était faux — et c'est précisément le compte qu'un agent fait pour savoir s'il a
avancé.

`fail()` écrit désormais sur stderr, **et** sur stdout pour la lisibilité en
chaîne. Un succès n'écrit rien sur stderr.

### fix(forge) — 9 tests ajoutés (78 → 87)

Couverture : prémisse retirée sous livrable approuvé, prémisse non déclarée
(avertissement), retrait sans ID, mention en prose, collision d'ID, prémisse
saine, absence de PRD, refus sur stderr, succès sans stderr.

Un de ces tests a d'abord échoué **à tort**, et c'est le test qui avait tort :
il exigeait qu'une entrée MENANT par `**C103**` mais dont la raison évoque
`C102` soit signalée comme retrait non traçable. Non : elle est traçable, par
C103. La propriété à vérifier est l'inverse — que `C102` ne soit **pas** traitée
comme retirée. Corrigé, parce que c'est le contrôle qui avait la bonne lecture.

## [1.1.4] - 2026-09-29

### fix(forge) — Une phase s'approuvait sans avoir rien produit

`complete-phase` approuvait la phase quoi qu'il arrive, et `set-phase …
approved` faisait de même par le raccourci. `forge-guard` ne pouvait pas
compenser : ses contrôles boucle sur les livrables **déclarés**, donc zéro
déclaration donne zéro vérification, et le rapport affiche un vert.

Constaté sur le premier test grandeur nature du skill : `state.js init`, puis
directement `set-phase 1_prd in_progress` et `complete-phase 0_bootstrap`. La
Phase 0 s'est approuvée avec `deliverables: {}` et aucun `conventions.md` sur
le disque. Toute la chaîne pouvait s'enchaîner sur une base absente, et aucun
contrôle n'avait rien à dire.

`PHASE_REQUIREMENTS` déclare ce que chaque phase doit produire :

| Phase | Exigé |
|---|---|
| 0 bootstrap | `conventions` |
| 1 prd | `prd` |
| 2 roadmap | `roadmap` |
| 3 design | `design-system` + au moins un écran |
| 4 architecture | `architecture` |
| 5 plans | au moins un plan |
| 6 validation | `test-plan` |

Trois points d'entrée appliquent le contrat : `complete-phase`,
`set-phase … approved`, et le nouveau contrôle `forge-guard
current_phase_has_deliverables` — ce dernier avant le gate, pour que le manque
se voie pendant qu'on peut encore le corriger. Le refus nomme le livrable
absent et donne la commande qui le crée.

Le contrat vit dans `forge-lib` : contrôle et gate lisent la même règle, sinon
ils peuvent diverger — et c'est le contrôle qui précède le désaccord.

### fix(forge) — Le contrôle que je venais d'ajouter ne contrôlait rien

`checkPhaseRequirements` testait `L.phaseRequirements`, un export qui
n'existait pas, et faisait `return` si absent. Le contrôle disparaissait donc
du rapport en laissant `pass: true` — exactement la panne qu'il corrigeait, dans
le correctif lui-même.

Il échoue désormais bruyamment si la lib n'expose pas le contrat, et un test le
vérifie en retirant l'export de la lib pour de vrai. Le test crée son projet
**avant** de casser la lib : `state.js init` lit aussi `PHASE_KEYS`, donc le
créer pendant la fenêtre cassée aurait testé autre chose.

6 tests ajoutés (72 → 78), dont le refus des deux commandes d'approbation, le
contrôle de `forge-guard`, le chemin heureux, et la non-disparition du contrôle.

## [1.1.3] - 2026-09-29

### docs(contributing) — Le circuit de release, décrit

Comment une modification devient une version : une entrée dans `[Unreleased]`,
puis le workflow fait le reste. Aucune n'est publiée si la section est vide.
Les règles qu'une pull request doit respecter sur `VERSION` et le CHANGELOG sont
écrites avec leur raison — le workflow committant ces deux fichiers sur `main`,
toute PR qui les touche entre en conflit au merge.

## [1.1.2] - 2026-09-29

### fix(ci) — Les notes de release ne se lisaient plus, et le garde-fou accusait le CHANGELOG

Le premier correctif a bien fonctionné : le tag vide n'a plus été publié, et le
run a **échoué** au lieu de mensonger. Mais il échouait pour la mauvaise
raison — les notes étaient vides.

L'extraction vivait dans le workflow, en JavaScript enchâssé dans une chaîne
bash. Deux niveaux d'échappement plus tard, `\\[` produisait `\[` dans la
regex : un antislash littéral devant le crochet. La section n'était jamais
trouvée.

Le pire n'était pas l'échec : c'était le message. « notes de release vides »
sur un CHANGELOG parfaitement valide renvoie vers le mauvais fichier. On
aurait passé une heure à relire un CHANGELOG correct.

`release.js notes` fait l'extraction dans le script, donc dans un test. Deux
tests ajoutés, dont un qui échoue sur une version absente en nommant les
versions présentes — ce qui, sur le bug ci-dessus, affiche `1.1.1` dans la
liste tout en disant qu'elle est absente. La contradiction est visible ;
l'échec seul ne l'était pas.

## [1.1.1] - 2026-09-29

### fix(ci) — La release a publié un tag vide, en annonçant « success »

`release.js` écrit son JSON sur stdout. Rien ne le recopiait dans
`$GITHUB_OUTPUT`, donc `steps.bump.outputs.to` était vide en aval : le tag
devenait `v`, le message de commit devenait vide, `git commit` refusait, et le
`|| exit 0` avalait l'échec. Le run rapportait **success** après avoir publié
une release au tag `v` et au corps vide — deux fois, dont une après un
force-push, ce qui a rendu le cycle vicieux visible.

C'est exactement le « mécanisme arbitraire » que le release est censé éviter.
Trois garde-fous : stdout recopié et validé non vide ; tag sémantique **et**
égal à `VERSION` ; notes non vides. Un run en échec vaut mieux qu'une release
illisible. `release-smoke.js` exécute le vrai script dans une copie jetable,
ce qu'aucun test statique n'aurait vu.

### fix(ci) — Le workflow rendait conflictuelle toute pull request future

Le workflow commite `VERSION` et `CHANGELOG.md` directement sur `main`. La
moindre PR ouverte touchant ces deux fichiers entre donc en conflit au merge —
constaté en ratant le merge de la présente correction. Le conflit ne se voit
pas avant d'essayer de merger.

`changelog-policy.js` rend la règle opposable : on n'ajoute que dans
`[Unreleased]`, on ne touche pas `VERSION`, on ne réécrit pas une version déjà
publiée. Corriger une sortie se fait par une entrée nouvelle.

Premier essai du contrôle : il rejetait **toutes** les PR valides. Le helper
`git show` faisait un `trim()`, et une version lue sur disque garde son saut
de ligne final pendant que la sortie de `git` l'a perdu — donc `1.0.0` était
comparé à `1.0.0\n`. Un contrôle qui refuse tout est aussi cassé qu'un contrôle
qui ne refuse rien : la suite logique, c'est de le désactiver. Cinq cas testés à
la main avant de merger, dont le cas légitime.

## [1.1.0] - 2026-09-29

### feat(repo) — Versionnement, CHANGELOG et release automatisée

Un seul numéro de version pour le dépôt. Forge référence project-rules-architect
dans sa frontière de propriété, et l'inverse : deux versions indépendantes
laisseraient ce contrat dériver en silence, ce qu'aucun test ne détecte. Le
CHANGELOG dit quel skill a bougé.

`release.js bump` refuse de publier une section `[Unreleased]` vide. Publier
quand même consommerait un numéro pour un changement invisible, et l'historique
des versions cesserait de rien signifier.

### fix(repo) — validate-repo.js ne contrôlait pas sa propre syntaxe

Le contrôle de syntaxe ne portait que sur `skills/**/*.js`. Le script qui
vérifie tout le reste — lui-même — n'était contrôlé par personne. Le défaut a
été trouvé parce qu'un `package.json` corrompu faisait échouer `node --check`
avant même que la validation ne commence.

### feat(ci) — Vérifier la syntaxe YAML des workflows eux-mêmes

Une action de release mal écrite ne se voit qu'au moment de publier.

## [1.0.0] - 2026-09-29

### feat(forge) — Plateforme de conception complète, de l'idée au plan exécutable

Premier jet. Forge transforme une idée floue en plan d'implémentation
suffisamment précis pour qu'une IA peu performante exécute une slice sans
ambiguïté : PRD, roadmap, standards de référence, design, architecture, plans par
slice, plan de tests, analyse d'impact, et exécution.

Les garanties sont outillées, pas déclaratives : un livrable ne peut pas sortir
de `.forge/`, l'état ne peut pas contenir de document, et l'état et le front
matter ne peuvent pas diverger — parce que chacune de ces trois invites a été
observée en production d'abord.

### feat(forge) — Deux niveaux d'autonomie pour l'implémentation

`milestone` par défaut, `full` au choix. Le mode complet existe parce que c'est
une décision de l'utilisateur ; il signale en fin de course ce qui n'a pas été
vérifié mécaniquement. Le mode par jalon est le défaut parce que l'autonomie
totale, sur un projet réel, a produit 20 constats jamais corrigés et 14 slices
approuvées sans aucun test.

### feat(project-rules-architect) — Gabarits de règles issus de trois projets réels

Synthèse de profils Flutter, Next.js et d'un projet réel, avec un registre de
provenance qui note aussi ce qui a été **retiré** — une affirmation fausse dans un
gabarit est plus nuisible qu'une absence.

### fix(project-rules-architect) — Sept corrections issues d'un audit de projet

Chaque règle livre maintenant la commande qui la vérifie ; un seul store
d'apprentissages ; champ domaine obligatoire sur les corrections ; bloc versions
marqué généré ; arbitrage grep/commentaire ; gotchas Dart (tri instable,
espace fine insécable, `sealed`, horloge injectée) ; et un postmortem sur le
chemin de promotion qui existe, est correct, et n'a jamais été déclenché.
