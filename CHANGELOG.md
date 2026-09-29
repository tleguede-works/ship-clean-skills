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
