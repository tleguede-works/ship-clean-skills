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

### fix(state) — une slice de Phase 4 se croyait avoir un plan

`register` écrivait `plan_path = relPath` pour toute slice ou fondation. Les slices
d'une architecture sont enregistrées **contre le document d'architecture** — c'est
leur lieu de description — donc `plan_path` valait `.forge/architecture.md`, et deux
contrôles divergeaient sur le même enregistrement, chacun avec une lecture
défendable :

- `no_premature_artifacts` lisait `entry.plan_path`, en déduisait un plan, et
  signalait les 15 slices « plan écrit avant la phase 5 » ;
- le même enregistrement donnait à la slice le `content_hash` de l'architecture, et
  `slice_plan_exists` en déduisait qu'un plan avait été écrit puis **disparu** — donc
  qu'il fallait le réécrire avant d'avancer.

Le garde-fou n'était pas faux dans les deux cas. **L'entrée mentait**, et elle mentait
de deux façons incompatibles. `plan_path` n'est donc plus écrit que si le chemin
enregistré est un **chemin de plan** — `.forge/plans/…` ou `*.plan.md` — décision
prise par `isPlanPath`, un seul endroit.

Une slice déclarée en Phase 4 est **décrite**, pas implémentée : c'est la forme
normale, et c'est le travail de la Phase 5 que d'écrire le plan. La distinction ne
peut pas se faire sur le contenu — il n'y en a pas encore — ni sur le nom de la
slice, identique dans les deux cas. Elle se fait sur le chemin, seule chose que
l'enregistrement connaisse.

### fix(consistency) — la preuve qu'un plan a été écrit est `plan_hash`, pas `content_hash`

`content_hash` prouve qu'un fichier **existant** a changé hors bande. Il ne prouve
rien sur un fichier absent — et une slice de Phase 4 en porte un, celui du document
d'architecture. Lire ce hash comme une preuve de plan revient à dire « l'architecture
a été écrite, donc chaque slice a un plan ».

`register` écrit donc **`plan_hash`**, et uniquement quand le chemin enregistré est un
chemin de plan. `slice_plan_exists` exige un plan si la Phase 5 est franchie **ou** si
`plan_hash` existe — c'est-à-dire si un fichier de plan a réellement été écrit et
puis a disparu, qui est une dérive et non un travail à faire.

Un seul prédicat pour les deux contrôles : sans lui, les deux lectures divergent à
nouveau, sur le même enregistrement, et c'est exactement ce qu'on vient de corriger.

**195 tests** (+ 2), dont un négatif et son contre-témoin : une slice de Phase 4 n'a
pas de `plan_path` et n'est pas signalée ; une slice enregistrée **avec** son fichier
de plan le conserve.

## [1.9.2] - 2026-09-30

### fix(release) — la protection par tag interrogeait le mauvais dépôt

`release.js` résout `VERSION` et `CHANGELOG.md` depuis `__dirname`, mais
interrogeait `git tag --list` **depuis le répertoire courant**. Le bac à sable est
un dépôt à part ; la commande partait donc d'un **autre dépôt** que celui que la
promotion allait modifier.

Constat : le test du refus passait **dans le dépôt** et échouait **dans l'archive
extraite**. Dans le dépôt, le CWD et le dépôt protégé désignaient la même chose, et
la protection s'exerçait **par accident**. Dans l'archive, le CWD n'était pas le
dépôt du bac, la liste de tags était vide, et le refus n'existait pas.

`git` est donc appelé dans `ROOT`, comme tout le reste. Les tests lancent
désormais `release.js` **depuis un répertoire qui n'est pas le bac** : un test qui
lance le script depuis le bac *peut* passer alors que le script est faux, donc la
suite lance comme le bot.

Vérifié en réintroduisant le défaut à la main : le test échoue, et il repasse avec
le correctif. C'est la seule preuve qu'un test négatif sur un contrôle de release
vaut quelque chose — et c'est la **quatrième fois** que l'archive publiée trouve ce
que la suite locale laisse passer.

### test(release) — un test qui passait au vert sans avoir exercé le contrôle

Le test du refus par tag ne testait rien. `gitSandbox` faisait `git init` puis
`git tag v1.8.0`, **en avalant les erreurs** — or `git tag` sur un dépôt sans HEAD
échoue en `Failed to resolve 'HEAD' as a valid ref`, il faut un commit avant de
taguer. Le bac ressortait **sans tag**, la protection ne s'exerçait jamais, et
`bump` promuait 1.8.0 **comme si de rien n'était** : exactement le défaut que le
test prétendait interdire.

`gitSandbox` lève désormais si le tag demandé n'est pas celui qu'on liste ensuite,
et un témoin vérifie le bac **avant** le test qui s'y fie.

Même famille que `component-parity` : un contrôle — ici, un test — qui s'exerce sur
un périmètre qui ne contient pas ce qu'il croit contenir, et déclare donc sa
réussite. Un témoin sur l'instrument précède tout test qui s'y fie.

## [1.9.1] - 2026-09-30

### test(release) — un test qui passait au vert sans avoir exercé le contrôle

Le test du refus par tag ne testait rien. `gitSandbox` faisait `git init` puis
`git tag v1.8.0`, **en avalant les erreurs** — or `git tag` sur un dépôt sans HEAD
échoue en `Failed to resolve 'HEAD' as a valid ref`, il faut un commit avant de
taguer. Le bac à sable ressortait donc **sans tag**, la protection ne s'exerçait
jamais, et `bump` promuait 1.8.0 **comme si de rien n'était** — exactement le
défaut que le test prétendait interdire.

Il passait dans le dépôt et **échouait dans l'archive extraite** : deux
environnements, deux résultats, un seul test. C'est la quatrième fois que l'archive
publiée trouve ce que la suite locale laisse passer, et la **première fois que la
cause est le test et non le script**.

`gitSandbox` lève désormais si le tag demandé n'est pas celui qu'on liste ensuite,
et un témoin vérifie le bac **avant** le test qui s'y fie.

C'est la même famille que `component-parity` : un contrôle — ici, un test — qui
s'exerce sur un périmètre qui ne contient pas ce qu'il croit contenir, et déclare
donc sa réussite. Un témoin sur l'instrument précède tout test qui s'y fie.

## [1.9.0] - 2026-09-30

### fix(tokens-used) — une citation en prose passait, et rien ne vérifiait l'absence

`tokens-used` compare ce que chaque écran écrit à ce que le design system définit.
C'est la seule chose qui relie un écran à ses tokens, et c'est ce qui a attrapé le
défaut qu'il était écrit pour attraper : cinq écrans sur neuf continuaient de citer
les **valeurs anciennes** après correction de trois tokens.

Mais il ne lisait qu'**une** des écritures d'une citation :

```js
/(--[a-z0-9-]+)`?\s+`(#[0-9a-fA-F]{6})`|.../
```

C'est-à-dire le jeton et sa valeur **séparés par des backticks**. Or les écrans
écrivent aussi :

- `--color-background #F1EDE5` en prose, **sans backticks** — la forme la plus
  fréquente, dans les sections « Direction visuelle » et « Accessibilité » ;
- `| \`--color-xxx\` | \`#ABCDEF\` |` en cellule de tableau.

Mesuré sur Onduleur, neuf écrans écrits : **34 citations retenues sur plusieurs
centaines**. Et un défaut injecté à la main — un écran citant
`--color-background #7A5A0C` au lieu de `#F1EDE5` — est passé **au vert**.

**Le contrôle avait raison de son périmètre, et son périmètre ne contenait pas ce
que les écrans écrivent.** C'est le neuvième mécanisme du dossier, le **troisième**
consacré à une forme d'écriture plutôt qu'à une valeur, et le premier où la forme
manquante est la plus **banale** des trois.

Les trois écritures sont lues, et les positions des cellules sont mises de côté
avant les deux autres : une citation en cellule est *aussi* une citation en
adjacence, donc sans exclusion chaque défaut serait compté deux fois — et un
compteur qui ment est pire qu'un compteur absent.

La forme en cellule doit être la cellule **entière**, pipe à pipe. Un motif plus
lâche covering les deux colonnes attrapait aussi une cellule à une colonne, où le
texte de la cellule est lui-même une citation en prose — et **une substitution faite
pour couvrir plus de formes a supprimé la moitié des citations** au lieu d'en
ajouter. Le motif doit dire *quand* deux cellules forment une paire, pas deviner que
deux jetons voisins en forment une.

### fix(tokens-used) — un écran qui ne cite aucun token rendait « conforme »

La non-vacuité, appliquée à ce contrôle aussi. Un design system sans écrans, ou des
écrans qui ne nomment aucun token, rendaient `pass: true` : même vide, même
dangereux que `component-parity`, même règle.

Le test qui le ferme porte le piège : le design system **lui-même** contient des
citations — chaque ligne de sa table de jetons est un couple jeton/valeur. Le
compter comme une source vérifiée rendrait cette non-vacuité **verte**, puisque le
design system en produit toujours. Le compteur porte donc sur les **écrans seuls**,
et `citations` est le nombre que la sortie affiche.

### fix(component-parity) — un contrôle qui n'a rien vérifié rendait « conforme »

`component-parity` découvrait les composants par la **forme de leur nom** —
`^### PascalCase$` — puis n'en retenait que ceux dont le libellé de contrat
s'écrivait exactement `**États** :`.

Or tout ce que ce skill produit est en français. Sur Onduleur, premier design
system français à passer par ici, la mesure est celle-ci :

```
pass: true
components: [ { component: "Bouton", slots: 3, states: 0 } ]
```

**Un composant lu sur sept. Zéro état lu sur celui-là. Zéro exigence portée sur
aucun écran. Et `pass: true`.**

`### Tuile produit`, `### Champ de saisie`, `### Ligne de commande`,
`### Panneau d'état` sont invisibles : la forme du nom ne correspond pas. Et
`Bouton` est trouvé, mais son libellé s'écrit `**États** —` là où le lecteur
attendait `**États** :`, donc ses six états n'existent pas pour le contrôle. Le
pire n'est pas le faux positif : c'est un contrôle dont **le périmètre vide se
déclare conforme**.

**La correction de fond est la non-vacuité.** Un composant est désormais
reconnu par la **présence de son contrat** — `**États**` ou `**Slots**` — et non
par la forme de son nom. Le nom redevient ce qu'il est : une étiquette, lisible,
avec ses espaces et son apostrophe. Et si le design system ne déclare la surface
d'aucun composant, le contrôle **refuse** et rend les titres qu'il a lus, pour
qu'on sache quoi écrire. Un contrôle qui n'a rien vérifié ne dit plus
« conforme ».

Le séparateur du libellé est lu des deux côtés (`:` ou tiret cadratin), et **ce
qui suit le libellé décide de la forme** — tableau ou prose. Un document écrit
volontiers `**États** — rendus par X :` suivi d'un tableau ; déduire la forme de
ce qui vient après le séparateur envoyait lire l'en-tête du tableau comme une
prose inline, et déclarait zéro état.

**Et le cinquième mécanisme du dossier, reproduit en corrigeant le sixième.**
Ajouter `[ \t]*` après le séparateur suffisait ; j'ai écrit `\s*`, qui franchit le
retour à la ligne : il avalait la ligne vide et l'en-tête du tableau, `(.*)` lisait
`| État | Déclencheur |` comme une prose, ne trouvait aucun backtick, et déclarait
zéro état. C'est le motif exact de la borne de 600 caractères et du
`^\s*` qui traversait les lignes — le **deuxième** contrôle à rejouer le même
schéma en corrigeant le précédent.

`skipped_headings` est désormais dans la sortie : un composant absent de la liste
des lus est **visible**, au lieu d'être une absence.

### fix(design-check) — un texte français à 3,80:1 passait, parce que le contrôle ne savait pas le nommer

`design-check` classait chaque couleur d'après son **nom**, et ses trois signaux
étaient des littéraux anglais : `--color-text-*`, `--color-ink-50/100/200`,
`*-subtle`. Ils ont été écrits contre le design system d'« Amberline », dont les
tokens sont nommés en anglais.

Or tout ce que ce skill produit est en français — `SKILL.md`, les gabarits, les
agents, et jusqu'à l'exemple canonique d'ambiance de `design-quality.md ». Sur
« Onduleur », premier design system français passé ici, **tout** est tombé sur
« composant non textuel » et s'est trouvé jugé à 3:1. Les deux directions sont
mortes, et la seconde est la grave :

- **faux positifs** — un texte inversé, jamais posé que sur de l'encre, mesuré à
  1,10:1 sur le papier ; quatre teintes d'état, qui sont des teintes de survol et
  des trames, exigées à 3:1 alors que la WCAG 1.4.11 ne s'applique pas à un état
  décoratif ;
- **faux négatif, et il est dans le dossier mesuré** — `--color-texte-desactive`
  est un token de texte, mesuré à **3,80:1** sur `--color-surface-sunken`. Classé
  composant, il était jugé contre 3:1, donc **conforme**, et il est apparu dans
  `measured` sans jamais apparaître dans `offenders`. C'est exactement le défaut
  que ce script a été écrit pour trouver — `--color-text-secondary` à 4,17:1 sur
  Amberline — reproduit dans le document qu'il venait de mesurer.

C'est le **septième** mécanisme de la même famille, et le premier qui échoue en
silence : les six autres produisaient du bruit visible, celui-ci produisait un
vert.

### feat(design-check) — le document déclare ses classes, le script mesure

Ajouter `--color-texte-*` à côté de `--color-text-*` n'aurait fait que déplacer le
problème : il faudrait réécrire la liste à chaque vocabulaire, et le contrôle
continuerait à **deviner**. Le principe tenu depuis cinq échecs est l'inverse — un
contrôle qui marche **résout un pointeur déclaré**.

Le design system déclare donc ses classes une fois, dans un bloc
`<!-- forge:token-classes -->` : `text`, `surface`, `nontext`, `on`, `exempt`. La
résolution passe par la déclaration, puis par `EXEMPT`, puis par les heuristiques
historiques — ce qui laisse inchangés les design systems déjà écrits, dont Amberline
et ses 184 tests.

`on:` est ce qui manquait le plus. Un texte est mesuré contre **toute** surface du
document, ce qui est juste pour de l'encre et faux pour un texte inversé : sans
`on:`, il est mesuré contre le papier, où il n'est jamais posé, et échoue par
construction. Un faux positif par palette, c'est-à-dire presque toutes. `on:` dit
sur quels fonds ce texte est réellement posé, et la mesure porte enfin sur
l'endroit où l'on lit.

`exempt:` porte une **raison** obligatoire, comme `EXEMPT` en portait une. Une
teinte décorative n'est pas un composant d'interface, et l'exempter sans dire
pourquoi serait exactement le contrôle qui s'ignore.

Les tokens exigés ne sont plus une liste de **noms anglais** quand le document
déclare ses classes : exiger `--color-text-primary` d'un document français
l'obligerait à déclarer un token qu'il n'a pas, ou à renommer sa palette pour
satisfaire un script. L'exigence devient structurelle — « il y a au moins un
texte, et un fond » — ce qui est ce que la liste en dur cherchait réellement à
garantir. Un token de couleur absent des six listes est signalé : la déclaration
est un engagement, donc l'omettre est un choix, pas un oubli qu'un nom puisse
rattraper.

**Deux défauts trouvés en corrigeant le premier.** Un composant déclaré
n'`entre` pas dans les surfaces : la mesure retain le pire couple, et du texte de
corps se retrouvait signalé à 2,16:1 sur le fond d'un bouton où il ne sera jamais
écrit. Un contrôle plus strict que la réalité n'est pas plus prudent, il est faux.
Et le rapport d'échec nommait le **token** au lieu de la **surface** : la mesure
était juste, l'attribution ne l'était pas — ce qui envoie corriger la mauvaise
couleur. Plus une ligne de continuation de liste, que le parseur perdait : la
déclaration paraissait complète et ne l'était qu'à moitié.

### feat(design-system) — le gabarit déclare ses classes, et explique pourquoi

Le gabarit pose la déclaration avant la section 1, avec les cinq directives, leurs
seuils, et la raison de `on:`. Un design system rédigé en suivant le gabarit est
donc mesuré correctement **sans avoir lu le code du contrôle** — ce qui est le
seul moyen que la règle tienne pour quelqu'un qui écrit en français.

## [1.8.0] - 2026-09-30

### fix(component-parity) — un contrôle qui n'a rien vérifié rendait « conforme »

`component-parity` découvrait les composants par la **forme de leur nom** —
`^### PascalCase$` — puis n'en retenait que ceux dont le libellé de contrat
s'écrivait exactement `**États** :`.

Or tout ce que ce skill produit est en français. Sur Onduleur, premier design
system français à passer par ici, la mesure est celle-ci :

```
pass: true
components: [ { component: "Bouton", slots: 3, states: 0 } ]
```

**Un composant lu sur sept. Zéro état lu sur celui-là. Zéro exigence portée sur
aucun écran. Et `pass: true`.**

`### Tuile produit`, `### Champ de saisie`, `### Ligne de commande`,
`### Panneau d'état` sont invisibles : la forme du nom ne correspond pas. Et
`Bouton` est trouvé, mais son libellé s'écrit `**États** —` là où le lecteur
attendait `**États** :`, donc ses six états n'existent pas pour le contrôle. Le
pire n'est pas le faux positif : c'est un contrôle dont **le périmètre vide se
déclare conforme**.

**La correction de fond est la non-vacuité.** Un composant est désormais
reconnu par la **présence de son contrat** — `**États**` ou `**Slots**` — et non
par la forme de son nom. Le nom redevient ce qu'il est : une étiquette, lisible,
avec ses espaces et son apostrophe. Et si le design system ne déclare la surface
d'aucun composant, le contrôle **refuse** et rend les titres qu'il a lus, pour
qu'on sache quoi écrire. Un contrôle qui n'a rien vérifié ne dit plus
« conforme ».

Le séparateur du libellé est lu des deux côtés (`:` ou tiret cadratin), et **ce
qui suit le libellé décide de la forme** — tableau ou prose. Un document écrit
volontiers `**États** — rendus par X :` suivi d'un tableau ; déduire la forme de
ce qui vient après le séparateur envoyait lire l'en-tête du tableau comme une
prose inline, et déclarait zéro état.

**Et le cinquième mécanisme du dossier, reproduit en corrigeant le sixième.**
Ajouter `[ \t]*` après le séparateur suffisait ; j'ai écrit `\s*`, qui franchit le
retour à la ligne : il avalait la ligne vide et l'en-tête du tableau, `(.*)` lisait
`| État | Déclencheur |` comme une prose, ne trouvait aucun backtick, et déclarait
zéro état. C'est le motif exact de la borne de 600 caractères et du
`^\s*` qui traversait les lignes — le **deuxième** contrôle à rejouer le même
schéma en corrigeant le précédent.

`skipped_headings` est désormais dans la sortie : un composant absent de la liste
des lus est **visible**, au lieu d'être une absence.

### fix(design-check) — un texte français à 3,80:1 passait, parce que le contrôle ne savait pas le nommer

`design-check` classait chaque couleur d'après son **nom**, et ses trois signaux
étaient des littéraux anglais : `--color-text-*`, `--color-ink-50/100/200`,
`*-subtle`. Ils ont été écrits contre le design system d'« Amberline », dont les
tokens sont nommés en anglais.

Or tout ce que ce skill produit est en français — `SKILL.md`, les gabarits, les
agents, et jusqu'à l'exemple canonique d'ambiance de `design-quality.md ». Sur
« Onduleur », premier design system français passé ici, **tout** est tombé sur
« composant non textuel » et s'est trouvé jugé à 3:1. Les deux directions sont
mortes, et la seconde est la grave :

- **faux positifs** — un texte inversé, jamais posé que sur de l'encre, mesuré à
  1,10:1 sur le papier ; quatre teintes d'état, qui sont des teintes de survol et
  des trames, exigées à 3:1 alors que la WCAG 1.4.11 ne s'applique pas à un état
  décoratif ;
- **faux négatif, et il est dans le dossier mesuré** — `--color-texte-desactive`
  est un token de texte, mesuré à **3,80:1** sur `--color-surface-sunken`. Classé
  composant, il était jugé contre 3:1, donc **conforme**, et il est apparu dans
  `measured` sans jamais apparaître dans `offenders`. C'est exactement le défaut
  que ce script a été écrit pour trouver — `--color-text-secondary` à 4,17:1 sur
  Amberline — reproduit dans le document qu'il venait de mesurer.

C'est le **septième** mécanisme de la même famille, et le premier qui échoue en
silence : les six autres produisaient du bruit visible, celui-ci produisait un
vert.

### feat(design-check) — le document déclare ses classes, le script mesure

Ajouter `--color-texte-*` à côté de `--color-text-*` n'aurait fait que déplacer le
problème : il faudrait réécrire la liste à chaque vocabulaire, et le contrôle
continuerait à **deviner**. Le principe tenu depuis cinq échecs est l'inverse — un
contrôle qui marche **résout un pointeur déclaré**.

Le design system déclare donc ses classes une fois, dans un bloc
`<!-- forge:token-classes -->` : `text`, `surface`, `nontext`, `on`, `exempt`. La
résolution passe par la déclaration, puis par `EXEMPT`, puis par les heuristiques
historiques — ce qui laisse inchangés les design systems déjà écrits, dont Amberline
et ses 184 tests.

`on:` est ce qui manquait le plus. Un texte est mesuré contre **toute** surface du
document, ce qui est juste pour de l'encre et faux pour un texte inversé : sans
`on:`, il est mesuré contre le papier, où il n'est jamais posé, et échoue par
construction. Un faux positif par palette, c'est-à-dire presque toutes. `on:` dit
sur quels fonds ce texte est réellement posé, et la mesure porte enfin sur
l'endroit où l'on lit.

`exempt:` porte une **raison** obligatoire, comme `EXEMPT` en portait une. Une
teinte décorative n'est pas un composant d'interface, et l'exempter sans dire
pourquoi serait exactement le contrôle qui s'ignore.

Les tokens exigés ne sont plus une liste de **noms anglais** quand le document
déclare ses classes : exiger `--color-text-primary` d'un document français
l'obligerait à déclarer un token qu'il n'a pas, ou à renommer sa palette pour
satisfaire un script. L'exigence devient structurelle — « il y a au moins un
texte, et un fond » — ce qui est ce que la liste en dur cherchait réellement à
garantir. Un token de couleur absent des six listes est signalé : la déclaration
est un engagement, donc l'omettre est un choix, pas un oubli qu'un nom puisse
rattraper.

**Deux défauts trouvés en corrigeant le premier.** Un composant déclaré
n'`entre` pas dans les surfaces : la mesure retain le pire couple, et du texte de
corps se retrouvait signalé à 2,16:1 sur le fond d'un bouton où il ne sera jamais
écrit. Un contrôle plus strict que la réalité n'est pas plus prudent, il est faux.
Et le rapport d'échec nommait le **token** au lieu de la **surface** : la mesure
était juste, l'attribution ne l'était pas — ce qui envoie corriger la mauvaise
couleur. Plus une ligne de continuation de liste, que le parseur perdait : la
déclaration paraissait complète et ne l'était qu'à moitié.

### feat(design-system) — le gabarit déclare ses classes, et explique pourquoi

Le gabarit pose la déclaration avant la section 1, avec les cinq directives, leurs
seuils, et la raison de `on:`. Un design system rédigé en suivant le gabarit est
donc mesuré correctement **sans avoir lu le code du contrôle** — ce qui est le
seul moyen que la règle tienne pour quelqu'un qui écrit en français.

## [1.7.0] - 2026-09-30

### fix(design-check) — un texte français à 3,80:1 passait, parce que le contrôle ne savait pas le nommer

`design-check` classait chaque couleur d'après son **nom**, et ses trois signaux
étaient des littéraux **anglais** : `--color-text-*`, `--color-ink-50/100/200`,
`*-subtle`. Écrits contre Amberline, alors que tout ce que ce skill produit est en
français.

Sur le premier design system français, **tout** tombait sur « composant non
textuel », donc sur 3:1. Six faux positifs, dont un texte inversé mesuré à 1,10:1
sur le papier où il n'est jamais posé — et **un faux négatif** : `--color-texte-desactive`,
token de texte à **3,80:1** sur la surface enfoncée, classé composant, donc jugé
conforme, apparu dans `measured` et **jamais** dans `offenders`.

Septième mécanisme de la même famille, et le premier **silencieux**.

### feat(design-check) — le document déclare ses classes, le script mesure

Le design system déclare `text`, `surface`, `nontext`, `on`, `exempt` dans un bloc
`forge:token-classes`. Ajouter `--color-texte-*` à côté de `--color-text-*` aurait
été le correctif évident, et faux : il faudrait réécrire la liste à chaque
vocabulaire. Résolution : déclaration, puis `EXEMPT`, puis heuristiques — Amberline
et ses tests restent verts.

`on:` dit sur quels fonds un texte est **réellement** posé, sans quoi un texte
inversé est mesuré contre le papier et échoue par construction.

### feat(design-system) — le gabarit déclare ses classes, et explique pourquoi

Le gabarit pose la déclaration avant la section 1, avec les cinq directives et
leurs seuils. Un design system rédigé en suivant le gabarit est donc mesuré
correctement **sans avoir lu le code du contrôle**.

---

## [1.6.3] - 2026-09-30

### fix(forge) — `state-parity` : une union documentée doit rester lisible

La lecture d'une union était bornée à **600 caractères**. Cette borne était une
commodité, pas une règle : une union **documentée** — celle-là même où chaque membre
porte *pourquoi il existe* — dépasse 600 caractères, donc la borne la faisait
disparaître et le contrôle rendait `union_introuvable_dans_l_architecture` sur un
document parfaitement correct.

Constaté en complétant l'union `IndicatorDisplayState` du projet de test, qui
portait cinq états documentés de plus que les sept qu'elle portait.

Le vrai terminateur est ailleurs et il est bon : `;` **en fin de ligne**. La borne
n'est plus qu'une garde-fou contre un document pathologique — elle peut être large
sans rien laisser passer.

C'est la **même famille** que la fenêtre d'adjacence de 140 caractères du contrôle
précédent, et la même leçon : **un motif plus étroit que ce que les documents
écrivent n'est pas plus prudent, il est faux.**

+1 test (175 → 176), avec un témoin : une union **courte** reste lisible aussi.

## [1.6.2] - 2026-09-30

### fix(forge) — `state.js amend` : le miroir part avec l'autorité

`state.json` est l'autorité, le front matter est le miroir. `amend` écrivait
l'autorité et s'arrêtait là : le fichier gardait `draft`, l'état disait `stale`, et
`forge-guard sync` signalait `status_mismatch` sur l'architecture.

Un contrôle qui se déclenche parce que la commande qui l'évite n'a pas été
terminée, c'est du travail évitable — et c'est la même famille que le défaut que
`derived_from` a corrigé (v1.4.2) : une divergence d'état et de miroir que personne
ne regarde parce que personne ne regarde.

`amend` écrit donc les deux, recalcule le `content_hash` après écriture, et
**échoue explicitement** si le miroir n'a pas pu être écrit — plutôt que de laisser
l'autorité dire `stale` pendant que le fichier dit autre chose.

+1 test (173 → 174), qui vérifie les trois : l'autorité, le miroir, et le verdict de
`forge-guard sync`.

## [1.6.1] - 2026-09-30

### fix(forge) — `ddl-exec` : quatre bugs trouvés en corrigeant un vrai document

`ddl-exec` a été construit sur des cas d'école. Corriger les trois décisions
arbitrées de l'architecture du projet de test a suffi à en trouver **quatre**, dont
un qui rendait le contrôle incapable de conclure.

## 1. `guards` exécutait un bloc entier, et s'arrêtait à la première faute

Le plus grave. `db.exec(b.body)` exécute le bloc d'un trait et **s'arrête à la
première instruction en échec** ; tout ce qui suit dans le même bloc n'est pas
exécuté.

Sur le projet de test, un bloc contient quatre `GRANT` échouant sur un rôle
absent, **suivis des deux `CREATE TRIGGER` qui font vivre le cycle de vie**. Le
bloc s'arrêtait au `GRANT`, les deux triggers n'étaient **jamais créés** — et le
contrôle annonçait quand même « quatre gardes déclarées, **toutes inertes** ».

Le verdict portait donc sur un schéma qui n'existait pas. Pire : une porte
déclarée « inerte » parce qu'aucun trigger n'a été créé, c'est le faux verdict le
plus coûteux du lot — il accuse le document d'un défaut qu'il n'a pas.

`guards` exécute désormais **instruction par instruction**, comme `execute` le
faisait déjà. Et il rend `prerequisites` pour les rôles absents, au lieu de les
compter comme des erreurs de DDL.

## 2. `execute` comptait une porte qui fonctionne comme une erreur

Un bloc `forge:ddl-refuse` **doit** échouer. `execute` le comptait comme une
erreur : les quatre portes du projet de test étaient correctes, et il les
rapportait comme quatre erreurs — `execute` échouait alors que le document était
correct.

Ces blocs sont maintenant comptés (`guard_blocks_left_to_guards`) et laissés à
`guards`, qui sait ce qu'il cherche.

## 3. `declaredTables` perdait les défauts SQL entre apostrophes

Un défaut est une **fonction** (`now()`, `gen_random_uuid()`) **ou un littéral** —
et un littéral est très souvent `'quoted'` : `'draft'`, `'provisional'`, `'below'`.
Seules les fonctions étaient acceptées, donc chaque colonne `NOT NULL` portant un
défaut textuel perdait son défaut, et la pose échouait sur
`null value in column "officiality" … violates not-null constraint`.

Même famille que le motif qui ne lisait ni `text[]` ni `**\`computed_at\`**` : une
restriction plus étroite que ce que les documents écrivent. **Un motif trop étroit
ne rend pas un contrôle moins bruyant, il le rend incapable.**

## 4. « Ce bloc contient un `INSERT` » n'est pas « ce bloc déclare des données »

`completeness` doit ignorer les blocs de pose : poser trois lignes de fixture ne
peut pas faire dire que `widget` n'est pas créée en SQL — c'est une tautologie.

La première correction a produit le **faux négatif** inverse. Tester
`/^\s*(INSERT|SELECT|…)/im` sur tout le bloc : `\s` mange les retours à la ligne,
donc le motif reconnaissait un `SELECT` au milieu d'un corps PL/pgSQL et écartait
le bloc **entier** — DDL compris. Résultat : `tables_touched: 0`, et le contrôle ne
regardait plus rien du tout.

On regarde désormais la **première instruction réelle** du bloc.

## Le contrôle a trouvé un cinquième défaut, dans le document

En corrigeant le projet de test, la déclaration des quatre portes (§ 4.21) a
révélé que `revoke_target_is_legal` était déclaré `AFTER INSERT ON signature_event`
**sans clause `WHEN`**, alors que sa fonction exige que `revokes_event_id` pointe
un acte `sign` ou `submit`. Or cette colonne est `NULL` pour tout acte qui n'est
pas un `revoke`.

Le trigger s'exécutait donc sur les **cinq** actes et rejetait les quatre autres :
`submit`, `sign`, `refuse` et `publish` étaient **impossibles à écrire**. Donc
`in_review` n'avait pas de producteur, la signature ne pouvait pas exister,
`published_at` ne pouvait pas être posé — tout le cycle de vie était inatteignable.

Le commentaire juste au-dessus annonçait la règle (*« la cible est `sign` ou
`submit`, jamais `refuse`, jamais `publish` »*) : l'intention était écrite, juste
pas appliquée au bon ensemble. Trouvé en **déclarant les gardes**, pas en
relisant.

## Tests

+4 (169 → 173), chacun avec le défaut qu'il attrape et son témoin propre. Le
quatrième est le test le plus important du lot : il pose un `GRANT` cassé **avant**
le `CREATE TRIGGER`, et exige que la garde soit constatée **active** — donc que le
trigger ait été créé malgré l'échec qui le précédait.

Deux des quatre tests ont d'abord échoué pour une raison qui n'était pas la leur :
j'avais écrit `CREATE TRIGGER` **avant** `CREATE FUNCTION`, que PostgreSQL refuse à
juste titre. Le contrôle disait vrai ; c'est la fixture qui était fausse.

## [1.6.0] - 2026-09-30

### feat(forge) — Le contrat d'amendement : étendre, jamais renuméroter

Un amendement n'est plus une édition : c'est une commande, et elle **refuse** le
renumérotage.

## Le motif

Un document que d'autres artefacts citent **par numéro** ne doit pas être
renuméroté : il doit être **étendu**. Insérer en § 5.9 décale § 5.10, § 5.11, tout
le reste — et chaque renvoi pointe alors vers une section **qui existe encore**,
donc vers la **mauvaise**. C'est la pire forme de dérive : elle **résout**, un
contrôle la juge saine, et rien ne la signale.

INC-011, mesuré : l'amendement de deux causes racines critiques a inséré deux
endpoints en § 5.9 et § 5.10. **Dix-sept renvois** dans huit plans sont devenus
faux — `error-handling` (4), `restriction-lignes` (3), `journal-acces` (4),
`export-provenance` (4) — et pas une seule ligne ne le disait. Le correctif sans
risque était d'ajouter les deux endpoints **en fin de § 5**.

## `state.js amend`

```bash
state.js amend <anchor> <clé> --reason "<pourquoi>" [--changes <f>]
```

| | |
|---|---|
| `--reason` obligatoire | un amendement sans raison est une édition ordinaire. Le dire est ce qui le distingue. |
| carte des titres | capturée à l'**approbation** — la version que les autres artefacts citent. Sans elle, le premier amendement pourrait renuméroter librement : rien ne saurait dire ce qui a changé. |
| renumérotage → **refus** | un numéro qui porte un autre sujet, ou qui disparaît, refuse la commande et nomme la dérive **dans l'ordre**. |
| `--allow-renumber` | n'est pas un interrupteur : il exige `--renumber-reason <texte>`, qui reste **dans l'état**, à côté des numéros cassés. |
| statut → `stale` | un artefact amendé n'est plus celui qui a été approuvé. `stale` et non `draft` : c'est le trajet déjà décrit pour un document vivant. |

**Pourquoi un refus et non un avertissement** : l'avertissement se contourne. Le
refus oblige à écrire, et cette raison se lit six mois plus tard, dans l'état, à
côté du numéro cassé. C'est la seule trace qui reste.

## `consistency-check references` — la troisième famille de pointeurs

Après `exigée → produite` et `produite → rendue`, voici **`citée → résolue`**.
Deux verdicts, parce que ce sont deux défauts de nature différente :

- **pointeur cassé** — cible nommée, section absente → **échec**. C'est la dérive
  de numérotation. Sur le projet de test : **0**.
- **cible non déclarée** — renvoi nu (`§ 5.15` sans nommer le document) →
  **compté**, jamais échec. Sur le projet de test : **276**.

Les faire tous échouer produirait un contrôle qu'on éteint au bout d'une semaine
— ce qui est arrivé **quatre fois** dans ce dossier. Les 276 ont donc une **voie de
sortie écrite dans la sortie du contrôle** : nommer le fichier, et le compte tombe.

## Cinq échecs de cette mesure, tous de la même famille

Cinquième série de contrôles à devoir **déduire** plutôt que résoudre. Le compte :

| conception | cassés | faux positifs |
|---|---|---|
| fenêtre 140 car. après un nom de fichier | **539** | tous |
| fenêtre 60 car. | 13 | tous |
| fenêtre 30 car. | 5 | tous |
| fenêtre 20 car. | 3 | tous |
| **fenêtre 12 car.** | **1** | 0 |

Un nom de fichier et un numéro de section ne sont pas voisins en prose. Un
document nomme `design-system.md` une fois, puis cite `§ 2.3` quarante caractères
plus loin, dans un autre paragraphe. Une fenêtre large attribue au premier nom
trouvé tout ce qui suit dans le document.

Puis **quatre formes de titre numéroté**, parce qu'un motif trop étroit est aussi
un motif faux :

| forme | d'où |
|---|---|
| `## 5.15 Titre` | gabarits du skill |
| `## §5 — Titre` | `references/archetypes.md` |
| `## §5.15 Titre` | mélange des deux |
| `## Étape 3 — Titre` | `references/design-quality.md`, qui écrit « le §3 » de sa propre prose |

N'en lire qu'une produisait **dix-neuf faux positifs** — dont dix-huit vers
`archetypes.md § 4` et `§ 9`, qui existent. Et `[Ee]tape` ne matchait pas
`## **É**tape 3` : l'accentué de `Étape` est un `É` majuscule (U+00C9). Même
famille que la corruption `U+BC95`/`U+C5D0` d'un écran approuvé : **l'annotation
typographique fait partie de la donnée**.

## Tests

+10 (159 → 169) : cinq pour les renvois, cinq pour l'amendement. Chacun **vu
échouer** avant d'être corrigé, chacun avec son témoin propre.

Le plus important des deux côtés est le témoin : sans « un renvoi valide est
résolu » on ne sait pas si le contrôle distingue un renvoi cassé d'un renvoi
valide ; sans « étendre en fin passe » on ne sait pas si `amend` refuse *tout*, y
compris ce qu'il faut laisser passer.

## [1.5.0] - 2026-09-30

### feat(forge) — `ddl-exec` : le DDL s'exécute, ou n'est pas écrit

`node "$FORGE/scripts/ddl-exec.js" all <anchor>` rend l'architecture à
PostgreSQL et rend compte de ce qu'il en dit.

## Le motif

Un DDL écrit dans un document n'est **ni compilé, ni typé, ni exécuté** : il est
seulement relu. On ne voit donc ses défauts qu'au moment de l'écrire, quand on est
son auteur et qu'on relit ce qu'on vient d'écrire.

Trois défauts de ce dossier ont survécu à **trois gates** sans qu'aucun ne se voie
à la relecture :

| défaut | ce que PostgreSQL dit |
|---|---|
| `CHECK` contenant une sous-requête | `cannot use subquery in check constraint` — **refusé à la création**, donc la contrainte n'existe pas |
| `IF NEW.statut = OLD.statut THEN RETURN NEW` en tête d'un trigger | rien : la syntaxe est valide. Un `UPDATE` qui écrit une autre colonne passe **au travers** |
| `published_at` exigé par le trigger, produit par personne | rien : rien ne l'exécute |

Le premier est une erreur de syntaxe SQL que seule l'exécution révèle. Le
second est un défaut **sémantique** : la porte est écrite, commentée, justifiée —
et inerte. Le troisième n'a pas de signature du tout.

## Trois verdicts, de trois natures

| commande | ce qu'elle vérifie | moteur |
|---|---|---|
| `completeness` | chaque table que le DDL modifie est créée, ou décrite en tableau de colonnes | aucun |
| `execute` | PostgreSQL **accepte** chaque instruction | `pglite` |
| `guards` | chaque garde que le document **déclare** refuse l'opération interdite | `pglite` |

`completeness` est une **résolution de pointeur** : le document écrit ses tables,
le script compare deux listes de noms. Il ne demande rien à un modèle de langage,
donc il ne peut pas se tromper. Il a trouvé sur le projet de test **zéro**
référence dans le vide, et deux tables modifiées sans être créées en SQL — c'est
-à-dire que ce DDL **n'avait jamais pu être exécuté**, ce qui explique pourquoi
ses défauts n'avaient jamais été vus.

`execute` et `guards` ont une dépendance **optionnelle** : `@electric-sql/pglite`,
PostgreSQL compilé en WebAssembly. C'est une dépendance de **développement du
dépôt**, jamais du skill distribué.

## Déclare tes gardes

Un bloc `sql` dont la première ligne est `-- forge:ddl-refuse` contient une
instruction qui doit être **rejetée**. Le nom de l'opération interdite n'est pas
deviné par le contrôle : **le document le nomme**. C'est la différence entre un
contrôle qui fonctionne et un contrôle qui devine — et tout contrôle qui doit
déduire produit du bruit.

## Sans moteur, le script ne simule rien

`execute` et `guards` rendent `skipped`, avec ce qu'elles n'ont pas fait et la
ligne à installer. Elles ne rendent **jamais** `pass` sans avoir exécuté. Un
contrôle qui prétend avoir exécuté sans avoir exécuté est le pire des contrôles,
parce qu'il donne un vert.

Un test vérifie ce contrat, pour qu'un jour quelqu'un ne le casse pas.

## Mesuré sur le projet de test

`execute` a trouvé **une** vraie erreur et **zéro** faux positif :

```
ERREUR   ligne 1077 : cannot use subquery in check constraint
PRÉREQUIS ligne 1348 : role "amberline_app" does not exist   (×4)
```

Les quatre `role does not exist` sont classés **préalable**, pas erreur : le
provisionnement d'un rôle appartient au déploiement, pas à l'architecture. Les
compter comme des erreurs de DDL aurait été faux — et les faire disparaître
serait pire : le document envoie ses privilèges à un rôle dont personne ne peut
dire qu'il existe.

## Cinq bugs de ce contrôle, trouvés par ses propres tests

Lesquels sont tous de la même famille : **un motif ancré au début de ligne, ou
une découpe à l'aveugle, qui ne voit pas ce que le document écrit vraiment.**

1. les motifs étaient appliqués **ligne à ligne** : un
   `CREATE TRIGGER … BEFORE UPDATE OF a, b ON table` s'écrit sur trois lignes, et
   le contrôle ne voyait jamais son `ON` — 2 `ALTER TABLE` trouvés, 2 triggers et
   3 index manqués ;
2. il lisait les **commentaires** : sept tables inexistantes nommées `sur`, `qui`,
   `old`, `on`, `of`, `target` et `amberline_app` — sept mots du texte ;
3. `INTO target` est une **variable PL/pgSQL** déclarée par `DECLARE target text`
   six lignes plus haut ; `FROM amberline_app` dans un `REVOKE` est un **rôle** ;
   `UPDATE OF … ON …` se lisait comme deux tables. Trois pièges, trois résolutions
   **par déclaration** ;
4. le découpage `body.split(/;/)` coupait **dans les corps de fonction** : sur
   trois blocs, il n'exécutait que trois instructions, dont aucune fonction, et
   rapportait deux erreurs de trigger **qui n'existaient pas dans le document** ;
5. il ne lisait ni `text[]`, ni `**\`computed_at\`**` — le gras des tableaux de
   colonnes.

Le cinquième est de la même famille que la corruption `U+BC95`/`U+C5D0` trouvée
dans un écran **approuvé** de ce projet : l'annotation typographique fait partie
de la donnée.

## Tests

+6 (153 → 159), chacun **vu échouer** avant d'être corrigé, et chacun avec son
témoin propre :

- un `CHECK` à sous-requête est refusé par PostgreSQL — **et** un DDL valide passe ;
- une garde déclarée qui ne tient pas est dite **inerte** — **et** une garde qui
  tient est confirmée **refusée**, pas supposée ;
- une table modifiée sans être créée est signalée — **et** un DDL autonome ne
  signale rien ;
- sans moteur, le contrôle **dit** qu'il n'a rien exécuté.

Le test « une garde qui tient » est celui qui compte : sans lui, on ne sait pas
si `guards` sait distinguer une garde inerte d'une garde qui refuse. Il rendrait
« inerte » dans tous les cas, et le contrôle qui a l'air de travailler ne
travaillerait pas.

Le harnais de tests est passé en file séquentielle : `ddl-exec` a besoin d'un
moteur asynchrone, et un test asynchrone dans l'ancien harnais aurait été
**jeté par terre et compté comme passé**.

## [1.4.3] - 2026-09-30

### fix(forge) — Les citations : une file d'examen honnête, et l'échec documenté

`consistency-check citations` ne demande plus « l'ID existe-t-il ? » mais
« **la règle dit-elle ce que le document affirme ?** » — la distinction que deux
projets ont faite, dont un avec 8 fausses citations sur 22.

**Mais la version lexicale ne fonctionne pas, et le lot le dit.** Sur le projet de
test elle produit 283 suspects, et les six plus solides ont été lus à la main :
**six paraphrases ou citations légitimes, zéro fausse**. Deux exemples vérifiés —
`C4` (domaine « légale ») cité pour « C4 est une contrainte légale », et `B11`
(seuil signé, valeur/sens/date) cité pour « les seuils sont écrits à côté de la
définition ». Une première lecture les comptait comme fausses ; ils ne l'étaient
pas.

Aucune mesure lexicale ne sépare « l'entrepôt est injoignable » de « source
indisponible ». Le contrôle rend donc une **file d'examen** avec sa précision
mesurée écrite dans la sortie, et il ne fait **jamais** échouer. Il est **piloté**,
hors de `all` : une obligation de gate sur 283 lignes serait une obligation que
personne ne tiendrait.

Deux bugs du parseur, trouvés par les tests :
- l'unité était la **cellule**, alors que le format dominant (`| B11 | PRD §4 |
  § 3 : … |`) met l'ID dans une cellule et l'affirmation dans la suivante : le
  contrôle était aveugle au cas le plus fréquent ;
- une cellule citant **plusieurs** règles (`B7, E9, E10`) était comparée à
  chacune : un faux positif garanti par règle non concernée. 3 des 6 suspects.

**La seule version sans faux positif est l'obligation de citer la règle mot pour
mot** — une convention de gabarit, pas un contrôle. Elle sera traitée séparément :
elle demande une migration des documents existants, pas un correctif.

+4 tests (149 → 153), dont un qui vérifie qu'une paraphrase totalement reformulée
atterrit en file **sans faire échouer** — la limite est écrite comme test, parce
que c'est elle qui motive le pilotage.

## [1.4.2] - 2026-09-30

### fix(forge) — Le périmètre d'un validateur, le caractère parasite, et la règle de l'auto-test

Trois corrections, dont deux confirmées par un **second** projet grandeur nature
(`Forge Labs/bi-dashboard-platform.zip`, skill v2.0.0) qui les avait déjà
rencontrées.

**1. Trois fichiers, trois périmètres de validateur incompatibles.**
`fast-track.md` disait « l'artefact + son `derived_from` » ; `quality-analyst.md`
interdisait le PRD jusqu'en Phase 6 ; `red-team.md` l'autorisait pour les seuls
IDs. Un validateur applique la règle la plus étroite qu'il connaît — donc se
prive du document dont il a le plus besoin — **et ne le signale pas**. Les deux
rendaient un verdict en déclarant dans `unreadable_without` le PRD, l'architecture
et les conventions. Aggravant : `state.json → slices.<clé>` ne portait **aucun**
`derived_from`, donc « son `derived_from` » n'était pas mécaniquement
découvrable — il fallait ouvrir le document à valider pour connaître son
propre périmètre.

La règle est maintenant posée une seule fois, et :
- `state.js register` **et** `state.js sync` recopient `derived_from` dans
  l'autorité, en chemins résolus. `sync` remplit aussi les entrées
  enregistrées avant que la propagation existe (28/30 sur le projet de test) ;
- `unreadable_without` non vide **⇒ `BLOCK`** (règle éprouvée sur un artefact
  réel du second projet) ;
- `severity: info` + `prior_critical_resolved`, pour qu'un constat résolu ne
  re-BLOQUE pas le tour suivant ;
- un test vérifie que les trois fichiers disent la même chose, et qu'un second
  vérifie que les deux **contrats de sortie JSON sont identiques** — ils ne
  doivent pas rediverger.

**2. `forge-guard no_stray_characters`.** Deux faux verts successifs avaient été
constatés sur le second projet : un scan PowerShell qui ne matchait rien, puis un
scan « CJK only » qui a laissé passer `U+1EE1` dans `_USERNAMEOục`. Le contrôle
est une **liste blanche** — ASCII, Latin-1, Latin Extended-A, ponctuation,
symboles, emoji, plus la typographie de la langue du dépôt. Sur le projet de
test il a trouvé **un vrai parasite** : `méthode` écrit avec un caractère grec et
un caractère hébreu à la place de `é`, dans un écran **approuvé**, invisible à
trois gates. Marqueur `unicode-scan:ignore` pour citer un défaut sans se
déclencher soi-même.

**3. « Un contrôle jamais vu échouer n'est pas validé, il est inconnu. »**
Règle écrite dans SKILL.md, et appliquée immédiatement à `component-parity` et
`state-parity`, les deux contrôles ajoutés après sa formulation — ils n'avaient
été validés que sur des cas positifs. `state-parity` a mis quatre essais à
devenir honnête : 22 signalements dont 19 faux, dus à trois heuristiques
successives (jointure sur les noms, jointure d'un calcul sur un rendu, regex qui
avalait la terminaison d'une union). Seul le **pointeur déclaré** par l'auteur
— `**États** — rendus par l'union \`IndicatorDisplayState\`, sauf …` — tient sans
faux positif, parce qu'il ne devine rien.

## [1.4.1] - 2026-09-30

### docs(forge) — Journal du test grandeur nature : Phase 3 approuvée après trois refus

`Forge Labs/` passe de non suivi à suivi. Ce n'est pas un livrable du produit :
c'est le **journal** d'un test d'intégration grandeur nature du skill sur un
projet réel, et il n'a de valeur que parce qu'il compte les échecs du skill.

Le gate de la Phase 3 a été refusé trois fois, et chaque refus a changé le
produit : une user story P1 sans aucune surface de design ; un état
`no_data` surchargé pour deux faits distincts ; un composant rendu de deux
façons dans trois écrans sur six.

Le refus le plus important n'était pas technique. Trois affirmations figuraient
dans des documents de gate comme si elles étaient vraies — dont « le gate
tranche que la détection est dans le MVP », alors que le gate ne l'avait pas dit
et que la roadmap approuvée dit l'inverse. **Un gate qui n'a pas tranché ne
peut pas être cité comme ayant tranché.** Le taux de fabrication est monté
0 → 1 → 3 à mesure que le travail devenait meilleur : la sophistication d'un
document, c'est sa densité de pointeurs, et un pointeur ne coûte rien à écrire
ni à vérifier.

Voir `Forge Labs/INCIDENTS.md` (F-01 → F-27) et
`Forge Labs/bi-dashboard/.forge/audit/issues.md` (INC-001 → INC-008).

## [1.4.0] - 2026-09-30

### feat(forge) — Un composant ne peut plus avoir deux rendus

`design-check tokens-used` vérifie qu'un écran ne cite que des tokens qui
existent. Il ne vérifie pas l'autre moitié du contrat : qu'un écran qui rend un
composant connaisse la **surface** de ce composant. Un composant peut donc
gagner un slot ou un état, et les écrans qui le rendent continuent d'en produire
une version sans lui — sans qu'aucun contrôle bronche.

Constaté sur le projet de test, au gate de la Phase 3 : `IndicatorTile` passe
de 6 à 7 slots et gagne cinq états pour la machine de franchissement. **Deux
écrans propagent, trois ne propagent pas** — dont un dont le § 4 s'intitule
« États — tous, sans exception ». Le « 6 slots » y est écrit deux fois, et
`tokens-used` est au vert : il a raison de l'être, il ne demande pas cette
question.

`design-check component-parity` vérifie qu'un écran **n'affirme pas une surface
périmée**. Le contrôle ne demande pas à chaque écran d'énumérer tous les états
d'un composant : beaucoup ne s'appliquent nulle part, et une telle exigence
produirait des dizaines d'exemptions, donc un contrôle qu'on contourne. Il vise
la forme que prend vraiment l'ignorance — une affirmation fausse — et laisse
écrire l'omission quand elle est un choix : `` `Tile` — exempt: `offline` (…) ``.

Trois pièges rencontrés en l'écrivant, tous deux couverts par un test :

- le contrat d'un composant s'écrit de **deux** façons dans ce design system
  (tableau markdown pour `IndicatorTile`, prose `·` pour `DataTable`,
  `SignatureBar`, `ProvenanceStrip`, `ExportPanel`). Ne lire que le tableau
  déclarait la moitié des composants sans état — donc sans aucune exigence ;
- `String.search` rend l'index du premier `#`, donc `slice(start + 1)` laissait
  `## Tile` en tête de section, qui ressortait comme « titre suivant » à
  l'offset 0. Le composant était déclaré sans état, sans aucune erreur ;
- rattacher une énumération au dernier composant nommé avant elle accuse le
  mauvais composant : une ligne de tableau cite `ExportPanel` puis dit « chaque
  tuile porte ses 6 slots », ce qui parle de la tuile. L'attribution se fait
  donc par **preuve** — le composant dont la surface contient tous les noms cités.

+5 tests (135 → 140).

## [1.3.1] - 2026-09-30

### fix(forge) — L'ordre des phases est appliqué, il n'est plus seulement énoncé

« Ne jamais entamer la phase suivante sans un approuvé clair » est présenté
comme la règle la plus importante du skill, et rien ne la vérifiait : il
n'existait nulle part la notion de phase d'un artefact. Un `architecture.md` de
1838 lignes et quinze plans se sont écrits pendant que le design portait encore
`draft`, et les douze contrôles passaient au vert.

`PHASE_ARTIFACT_OWNERS` déclare la phase qui possède chaque artefact (les
clés y sont les `kind` singuliers de `register`, pas les noms de seaux de
`state.json` — les deux vocabulaires ne se distinguent que d'un `s`). Sur cette
base, `state.js register` **refuse** d'enregistrer un artefact produit avant sa
phase : le refus au moment d'écrire est le seul endroit où la règle devient
impossible à contourner. `forge-guard` constate en plus ce qui est déjà sur
disque (`no_premature_artifacts`).

La comparaison se fait sur `current_phase`, pas sur le statut de la phase
propriétaire : `complete-phase` avance `current_phase` en approuvant, donc la
phase suivante est « courante » tout en étant `not_started`. Juger sur le statut
refuserait d'enregistrer le tout premier livrable de chaque phase — un garde-fou
qui bloque le travail légitime s'apprend à contourner.

Corrige aussi un texte corrompu dans `hashTargets`, publié tel quel dans
v1.3.0 : deux caractères chinois au milieu d'une phrase française.

## [1.3.0] - 2026-09-30
### feat(forge) — Les contrastes se mesurent, ils ne s'écrivent pas

La checklist de gate du design system demande « contraste N:1 », et
`screen.md.tmpl` demande « contraste {{ratio}} ». Aucun contrôle ne calculait quoi
que ce soit : les ratios étaient **rédigés** par l'auteur, pas mesurés.

`scripts/design-check.js` mesure WCAG 1.4.3 (4,5:1) et 1.4.11 (3:1). Deux choses
qu'il attrape et que la relecture ne voit pas : un ratio **annoncé** qui ne
correspond pas au mesuré — une assurance que rien ne soutient — et un texte
lisible sur le fond mais trop clair sur **une autre surface** : ligne alternée de
tableau, panneau creusé. C'est souvent là que l'échec se trouve.

Sur le projet de test, il a trouvé cinq défauts dans un design system que j'avais
écrit et relu : `--color-text-secondary` a 4,17:1 — ce token porte les **dates de
calcul**, donc la provenance sur laquelle repose tout le produit (B5) ;
`--color-stale` a 3,55:1 ; `--color-border-strong` a 2,80:1 ; le même texte est a
4,44:1 sur la ligne alternée ; et deux tokens identiques portent deux noms.

Trois décisions de conception du contrôle, apprises en l'écrivant : la classe de
chaque token est **affichée** dans la sortie (un contrôle qui ne montre pas pourquoi
il a classé un token ne peut pas être contesté) ; le texte est mesure contre
**toute** surface du document, pas contre une liste en dur — la liste en dur
manquait la ligne alternée ; et **une exemption est nommée, jamais par préfixe**,
parce qu'exempter `--color-border*` exempterait l'anneau de focus, c'est-à-dire le
composant qui doit justement atteindre 3:1.

L'arrondi ne crée jamais un vert : `#7A6A3C` sur `#E9EDEB` vaut 4,4958:1, ce qui
arrondi à 4,50 passe le seuil. La comparaison se fait sur la valeur brute.

### fix(forge) — Les gates des phases 3 et 6 étaient infranchissables

`PHASE_REQUIREMENTS` exigeait `design-system` et `test-plan` — avec un tiret —
alors que les livrables s'enregistrent sous `design_system` et `test_plan`. Le
`type:` du gabarit porte un tiret, la clé d'état un autre.

Aucune commande ne pouvait donc produire la clé exigée : `complete-phase 3_design`
et `complete-phase 6_validation` échouaient avec « aucun livrable enregistré pour
cette phase », en nommant une clé qui **ressemble** à une clé existante. Le refus
était donc inexplicable, et le seul contournement visible aurait été d'enregistrer
un livrable bidon sous le nom à tiret — ce qui casse ensuite `forge-guard paths`.

Le test qui verrouille la classe a trouvé les **deux** instances dès sa première
exécution.

### feat(forge) — Aucun contrôle ne reliait les écrans à leurs tokens

Après avoir corrigé trois tokens de couleur du design system — parce que leurs
contrastes échouaient — **cinq écrans sur neuf continuaient de citer les valeurs
anciennes**, avec les ratios anciens, et en tiraient des règles d'usage : « les
dates ne doivent pas utiliser le secondaire », « `stale` ne sert qu'au filet ».

Ces règles sont nées d'un couple couleur/fond qui n'existe plus dans le design
system. Elles étaient donc **fausses**, et un lecteur qui les aurait appliquées
aurait dégradé l'interface pour corriger un problème inexistant.

`forge-guard` était vert. Rien ne relie un écran aux tokens qu'il cite : modifier
un token après avoir écrit les écrans n'est pas une mise à jour, c'est une
**rupture de contrat silencieuse**.

`design-check.js tokens-used` compare chaque couple `` `token` `valeur` `` cité
par un écran à ce que le design system définit. Onze divergences sur dix écrans,
toutes réelles.

### fix(repo) — Un `id:` duplique faisait rejeter le workflow ENTIER

Premier run du nouveau workflow : échec en 0 seconde, aucun job, aucun log, et
GitHub qui affiche « This run likely failed because of a workflow file issue ».

Le job `publish` contenait deux étapes `id: bump` — un patch appliqué deux fois
avait laissé l'ancien et le nouveau. GitHub rejette un `id` dupliqué dans un job,
donc **aucun job ne démarre**. Le message ne dit pas quel identifiant est en
double, et le YAML est parfaitement valide : `ci.yml` ne le voyait pas, et
`check-workflows.py` non plus puisqu'il ne vérifiait que le bash.

`check-workflows.py` vérifie maintenant l'unicité des `id:` par job. Le contrôle
ne s'appelle pas « validité YAML » : il vérifie ce que GitHub rejette réellement,
et cette suite de merges l'a démontré trois fois en deux jours — YAML valide, bash
valide, et workflow refusé.

### fix(forge) — Les hashs des écrans et des plans n'étaient jamais relus

`state.js register` enregistre un `content_hash` pour les écrans et pour les
plans de slice comme pour les livrables — mais `forge-guard` ne lisait que
`deliverables`. Un écran pouvait donc être réécrit après son enregistrement, ligne
par ligne, **sans qu'aucun garde-fou ne le voie**.

Constaté sur le projet de test : neuf écrans réécrits après leur enregistrement
(ratios recalculés, règles d'usage levées), et `content_hashes_current` au vert.
Le hash enregistré était périmé — donc faux, et personne ne le savait.

Le contrôle porte maintenant sur tout ce qui porte un hash : livrables, écrans,
slices, fondations. Et `state.js hash` accepte ces quatre genres : sans cela, la
seule façon de remettre un hash d'écran à jour était de réenregistrer, ce qui
n'était pas la commande documentée.

### fix(forge) — `consistency-check` échouait au gate de la Phase 4

Au gate de l'architecture, `consistency-check all` sortait en échec sur les dix
plans de slice qui n'existaient pas encore, et sur trois écrans sans slice liée —
pour la raison exacte qu'on était en train de faire ce qu'on fait dans l'ordre
prévu.

Même famille que la transition de phase : un contrôle qui échoue pour une
information qu'on n'a pas encore à produire apprend à être ignoré. Les deux
contrôles sont désormais **conditionnés à la phase** :

- `slice_plan_exists` n'exige les plans qu'une fois la Phase 5 franchie ; avant,
  seule une **dérive** compte — un plan écrit (donc un hash enregistré) et disparu ;
- `screens_have_slices` saute tant qu'aucun plan n'existe.

### fix(forge) — Le hash d'un écran est vérifié, pas seulement celui d'un livrable
### fix(forge) — `register` écrivait `path` là où tout le reste lit `plan_path`

Pour une slice et une fondation, `register` n'écrivait que `path`, alors que
`set-status`, `collectStatusFiles`, `start`, `consistency` et `forge-guard paths`
lisent `plan_path`. Conséquence : `set-status` sur une slice ne trouvait pas de
chemin, n'écrivait aucun front matter — et **n'enregistrait pas de divergence**,
puisque rien ne manquait à ses yeux. Le statut vivait dans l'état, le `.md` disait
`draft`, et le contrôle de synchronisation ne le voyait pas parce qu'il regardait le
même champ vide.

### fix(forge) — Le contrôle des placeholders signalait sa propre checklist

Un livrable qui écrit « aucun `{{PLACEHOLDER}}` résiduel » — donc qui **documente**
la convention — était signalé comme portant un placeholder non rendu. Même défaut
que les cases `À DÉCIDER`, qui signalaient la phrase du gabarit qui les définit.

Un contrôle qui hurle quand il n'a rien à dire est un contrôle qu'on n'écoute plus :
il faut alors choisir entre le désactiver et le mal regarder.

### fix(repo) — Une release pouvait rester bloquée POUR TOUJOURS

Le job de publication disait « le tag existe déjà — rien à créer » et sortait en 0.
Mais un tag peut exister **sans** que la release existe : c'est l'état produit
quand le job échoue après `git push origin "$TAG"` et avant `gh release create`.
Le dépôt restait alors bloqué indéfiniment, avec VERSION et CHANGELOG avancés et
un tag orphelin.

Sortir en 0 sur un état incomplet transforme une panne en état permanent. Le job
détecte maintenant « tag sans release » et reprend la publication **depuis le
commit du tag**, sans nouveau bump.

### fix(repo) — Les assets de release passaient par un découpage de mots

La commande `gh release create` recevait ses assets par
`$(cat /tmp/assets.txt | sed … | tr …)` : une liste reconstruite par word-splitting
puis expansion de motifs. Sur le runner, un élément a été interprété comme un motif
non apparié et le job est mort **entre** la création du tag et celle de la release.

Un chemin est maintenant passé comme chemin, entre guillemets, sans détour.

### test(forge) — 12 tests ajoutés (112 -> 124)

Palette conforme, texte sous AA, texte trop clair sur une surface non-fond, ratio
annoncé faux, anneau de focus non exempté, exemption nommée et visible, arrondi
ne créant pas de vert, token sans valeur, design system absent, placeholder cité
entre guillemets, clé de contrat enregistrable, `design-check` branché au gate de
la Phase 3, tokens cités par un écran.

## [1.2.0] - 2026-09-30

### feat(repo) — Chaque release porte le snapshot complet du skill

Une release ne contenait que `notes.md` — le fichier de notes lui-même. Vérifié
sur v1.1.6, v1.1.7 et v1.1.8 : **un seul asset**, de quelques kilo-octets. Le
skill n'est pas compilé, donc rien ne produit d'exécutable à joindre, et le tag ne
dit rien du contenu : impossible de retrouver la version publiée.

`scripts/snapshot.js` construit `ship-clean-skills-v<version>.tar.gz` contenant
`skills/`, `scripts/`, `README.md`, `LICENSE`, `VERSION`, `CHANGELOG.md` et
`package.json` — tout ce qui rend le skill utilisable hors du dépôt, rien de ce
qui sert à maintenir le dépôt. `MANIFEST.json` est le **premier** membre de
l'archive : SHA-256 de chaque fichier, version, commit publié.

L'archive est **déterministe** : ordre trié, mtimes figés, uid/gid nuls, gzip sans
en-tête variable. Deux constructions de la même version sont identiques octet pour
octet — sans quoi « l'archive reproduit la version » n'a aucun sens.

Le workflow vérifie l'archive contre le checkout **avant** de publier, puis
**re-télécharge la release et l'extrait** après. Il ne fait pas confiance à ce
qu'il vient d'envoyer.

### fix(repo) — La version publiée était décidée à trois endroits, dont aucun testable

La décision « faut-il publier, et à quel niveau ? » vivait dans le workflow, en
`node -e` échappé dans un heredoc bash, **dupliquée trois fois**. Deux conséquences
réelles : elle n'était testable que **par une publication**, et `workflow_dispatch`
court-circuitait **avant** l'analyse — donc le niveau demandé agissait comme un
**plafond**, alors que `CONTRIBUTING.md` annonçait un plancher depuis le début.
Une demande de `patch` sur une section contenant un `feat` publiait un patch.

`release.js decide` porte maintenant toute la règle, dans un fichier testable :
`breaking` → major, `feat` → minor, sinon patch. Le niveau demandé est un
**plancher**, le niveau publié est le plus grand des deux, et un niveau forcé ne
crée pas de contenu — une section vide reste non publiable, à la main comme
automatiquement.

### test(repo) — L'archive est testée par ses **négatifs**

`scripts/snapshot-smoke.js` construit l'archive, vérifie qu'elle reproduit le
checkout, exige deux constructions identiques, puis **altère l'archive et exige
que la vérification échoue**. Un contrôle qui ne peut pas échouer ne prouve rien.

Ce sont les négatifs qui ont trouvé deux vrais défauts pendant l'écriture du test :

- `verify <archive>` **sans** `--against` comparait l'archive à elle-même
  (`rest[0]` devenait la référence), et sortait « 93 différences » sur une archive
  parfaitement saine — un diagnostic qui accuse l'archive d'être fausse parce
  qu'elle ne se compare pas à elle-même ;
- une archive construite avec `--version 9.9.9` **passait** la vérification contre
  un checkout en 1.1.9 : seul `MANIFEST.json` différait, et il n'est pas dans la
  liste des fichiers comparés. L'archive annonçait donc une version fausse en
  étant déclarée fidèle — exactement le défaut qu'un manifeste doit attraper. La
  `VERSION` est désormais comparée elle aussi.

### feat(repo) — La version de release se décide par un mécanisme, plus à la main

`release.js decide` et `snapshot.js` sont couverts par la CI. 11 tests de snapshot
(construction, reproduction du checkout, reproductibilité, fichier altéré, version
fausse, archive illisible, manifeste absent, périmètre inclus/exclu, position du
manifeste) et 4 tests de `decide` (section vide, niveau déduit, plancher, niveau
inconnu), en plus des 10 existants.

## [1.1.9] - 2026-09-30

### fix(forge) — Un acquittement de retrait se lisait sur un extrait tronqué

`retired_cited_in_body`, ajouté dans la série précédente, lisait la mention de
retrait sur un extrait de ligne **tronqué à 120 caractères**. Une mention
« (B18 retiré) » placée en fin de ligne tombait hors de la fenêtre, et une
citation explicitement acquittée était remontée comme un défaut.

Attrapé sur le projet de test, à la première exécution : les trois citations de
`B18` dans `conventions.md` — qui annoncent toutes explicitement le retrait —
étaient signalées comme non acquittées. Un contrôle qui signale un défaut
inexistant apprend à être ignoré : c'est le pire sens possible, et le seul qui
puisse faire retirer le contrôle.

L'acquittement se lit maintenant sur la **ligne entière**, et seules les citations
non acquittées produisent un avertissement — une citation qui annonce le retrait
est légitime, et même attendue.

Dans le même passage, le contrôle a détecté **deux vraies erreurs de citation**
dans la roadmap du projet : `B18` y était cité pour « les valeurs restent
rattachées à la version qui les a produites », alors que `B18` est le partage par
lien public, retiré en Phase 1. Le même défaut que la gate avait trouvé à la main
sur `E16`, attrapé cette fois mécaniquement, sur un document écrit à l'instant.

### test(forge) — 8 tests ajoutés (104 → 112)

Citation d'un ID retiré dans un livrable approuvé, acquittement d'une citation qui
annonce le retrait, acquittement en fin de ligne, citation non acquittée,
remontée des prémisses non déclarées dans `state.js start`, transition de phase,
phase commencée sans livrable, règle d'attribution des ID.

## [1.1.8] - 2026-09-30

### fix(forge) — Le garde-fou hurlait sur chaque transition de phase

`complete-phase` avance `current_phase` à la phase **suivante** dès qu'il
approuve. Cette phase est alors « courante », et `current_phase_has_deliverables`
lui demandait ses livrables — dont le roadmap, que personne n'avait encore
commencé à écrire. Le signal arrivait donc à l'instant exact où il n'y avait rien
à signaler, et après chaque gate.

Le commentaire du contrôle affirmait l'inverse de ce qu'il faisait. Un contrôle
qui produit un défaut systématique au moment où l'on n'a rien à faire s'apprend à
ignorer : c'est la seule façon de « passer », et c'est ce qui arrive.

Le contrat ne s'applique plus qu'aux phases **commencées**. Une phase au statut
`not_started` produit un `skip` nommé — un `skip` n'est pas un `pass`, et la
sortie dit ce qu'elle n'a pas couvert.

### fix(forge) — Une exigence retirée pouvait rester active sous un livrable approuvé

`consistency-check premises` ne lit que `state.deliverables[*].requires`, une liste
**saisie à la main**. Un livrable approuvé peut donc justifier ses décisions par une
exigence retirée sans que l'ID soit déclaré : la déclaration reste vraie, elle est
simplement fausse par omission, et rien ne la contredit.

Constaté sur le projet de test BI : `conventions.md`, approuvé en Phase 0,
justifiait cinq décisions — Next.js SSR, URL-as-state, Playwright, stratégie de
session, slug+version — par « le partage par lien », exigence retirée en Phase 1.
Sortie : `retired: []`, `pass: true`.

La justification était en **prose**, donc aucune comparaison d'IDs ne pouvait la
voir. Ce que l'outil peut voir, en revanche, c'est la citation textuelle de l'ID
retiré dans le corps d'un livrable approuvé : elle est désormais remontée, avec la
ligne exacte, et distinguée de la citation qui **annonce** le retrait — laquelle est
légitime et même attendue.

Et `state.js start`, l'Étape 0, affiche désormais la liste des livrables approuvés
**sans prémisse déclarée**, avec la commande pour la déclarer. Une prémisse non
déclarée est une prémisse non vérifiable ; l'Étape 0 est la seule commande que tout
le monde lance.

### fix(forge) — La règle d'attribution des ID se contredisait

Le skill disait à la fois « une exigence retirée garde son ID » et « numérote les
exigences retirées dans une plage à part (B1xx, C1xx) ». La seconde consigne casse
la première : renommer `B18` en `B118` fait disparaître le lien entre un livrable
approuvé et l'exigence qui le justifiait — et le contrôle de collision, qui doit
accuser le bon livrable, accuse alors un ID que personne n'a jamais écrit.

La règle est maintenant unique et applicable : **on numérote les exigences retirées
à partir du plus haut numéro déjà utilisé, et on ne réattribue jamais un numéro
libéré.** Un trou se voit, une collision ne se voit pas avant d'avoir produit un
diagnostic faux.

### fix(ci) — La politique CHANGELOG ne tournait pas avec sa base

`ci.yml` lançait `node scripts/changelog-policy.js` **sans `--base main`**. Dans
cette forme, le script ne vérifie que la *forme* du fichier : les deux contrôles qui
portent le sens — la partie publiée n'a pas été réécrite, `[Unreleased]` a vraiment
été modifié — n'existaient pas en CI. Ils sont documentés dans `CONTRIBUTING.md`
comme exécutés, donc la documentation et la CI divergeaient.

Attrapé en conditions réelles sur ce dépôt : des entrées ont été écrites dans la
section déjà publiée `[1.1.7]` au lieu de `[Unreleased]`. Sans la base, la CI
serait passée.

### test(forge) — 6 tests ajoutés (104 → 110)

Citation d'un ID retiré dans un livrable approuvé, acquittement d'une citation qui
annonce le retrait, remontée des prémisses non déclarées dans `state.js start`,
transition de phase, phase commencée sans livrable, règle d'attribution des ID.

## [1.1.7] - 2026-09-30

### fix(forge) — Un changement de statut détruisait la trace des sources

`derived_from` est écrit en liste sur quatre gabarits : `benchmarks`,
`implementation-plan`, `screen`, `scenario`. Le lecteur de front matter ne
gérait pas les séquences en bloc : il lisait `derived_from:` suivi de deux
lignes `  - …` comme une chaîne vide. Puis `set-status` — la seule opération qui
réécrit le front matter, donc celle qui est appelée à **chaque** changement de
statut — réécrivait cette chaîne vide.

La trace disparaissait donc au premier `set-status`, sans erreur, sans journal,
et avec `forge-guard all` comme `consistency-check all` au vert. C'est le contrat
de lecture d'un validateur Fast Track qui s'évaporait : l'agent lisait un artefact
sans ses sources, et son verdict ne portait plus sur le document.

Constaté en lançant le projet de test BI du dépôt : `benchmarks.md` a perdu ses
deux sources au premier `set-status`, en entier, et rien ne l'a signalé.

Le lecteur gère maintenant les séquences en bloc et les blocs pliés, et les
écrit dans la forme qu'il sait relire. `forge-guard` vérifie en plus qu'un
`derived_from` déclaré n'est jamais vide : un contrôle qui prouve qu'un fichier a
été modifié ne peut pas prouver que ce qu'il contenait est encore là.

### fix(forge) — Aucune commande du skill n'était exécutable depuis un projet

`SKILL.md` donnait ses commandes sous la forme `node scripts/state.js start`.
Les scripts ne sont pas dans le projet : ils sont installés avec le skill, dans
`~/.agents/skills/forge/scripts/` ou `.opencode/skills/forge/scripts/`. La
première commande du workflow échouait donc sur `Cannot find module
'<projet>/scripts/state.js'`.

Pire : les messages d'erreur des scripts eux-mêmes — donc les `hint` copiés au
moment où l'on vient d'échouer — reprenaient la forme cassée.

Le skill définit maintenant `$FORGE`, donne la forme exécutable, et précise que
le répertoire courant est le projet : lancés depuis le dossier du skill, les
scripts résolvent l'anchor sur le dépôt des skills, c'est-à-dire sur le mauvais
projet, sans rien dire.

### fix(forge) — Une décision bloquante était indiscernable d'une décision différable

Le gabarit `conventions.md` marquait uniformément ses cases non tranchées
`À DÉCIDER EN PHASE 4`. Or certaines de ces décisions ne peuvent pas attendre la
Phase 4 : le fournisseur d'identité, le mode d'hébergement, l'exécution de fond.
Elles changent ce qu'on achète et ce qu'on héberge, pas seulement le code — et
sans fournisseur d'identité nommé, « fail-closed » n'est pas implémentable.

Le gabarit distingue maintenant `À DÉCIDER EN PHASE 4` de `À DÉCIDER AVANT LA
PHASE 1`, porte une ligne pour l'identité, la session et l'exécution de fond,
et `forge-guard state` échoue sur une case bloquante encore ouverte. Après la
Phase 4, toute case ouverte devient un échec : un document verrouillé qui
contient une case vide a une case invisible.

Cinq contrôles et une distinction de gabarit, pour un défaut trouvé en une
phrase du demandeur : « E2E n'est pas différable, ça décide de l'image CI et
demande un accord d'infrastructure ».

## [1.1.6] - 2026-09-30

### fix(forge) — Le graphe de dépendances n'était déclarable par aucune commande

La Phase 4 est la phase qui **produit** le découpage en slices. Son étape 3
consiste à « vérifier le graphe et persister `depends_on` ». Il n'y avait aucun
moyen de le faire : `state-schema.md` affirme que `dependency-check --write`
écrit ce champ, mais cette commande ne fait que le **calculer**. Le champ était
donc censé apparaître tout seul.

Un graphe vide est un graphe valide : `dependency-check` rapportait donc
`pass: true`, et `dependency-check --write` calculait huit vagues à partir de
rien. La seule voie restante — éditer `state.json` à la main — contredit la règle
du skill qui fait de l'état une autorité machine.

`state.js dep <anchor> <slice|fondation> <a,b,c>` déclare le graphe. Il refuse
une dépendance vers une slice inexistante (un graphe faux, pas incomplet : elle
ne sera jamais satisfaite et rien ne le signalera), l'auto-dépendance, et tout
ce qui fermerait un cycle.

### fix(forge) — Un plan de vagues était écrasé en silence

`writeBack` réécrit `impl_wave` par le calcul topologique. Si l'architecture
annonce un plan différent, l'écart disparaît sans bruit : l'outil rapporte
`pass: true`, et deux documents de la Phase 4 se contredisent avec la CI verte.

Constaté sur le projet de test : l'architecture annonçait **13 vagues** (V0 à
V12), le graphe se réduit à **8**. Les deux sont vrais et ne mesurent pas la même
chose — 8 est ce que la contrainte permet, 13 est ce que l'équipe de quatre
permet, parce que F4 (politique RLS) et F9 (formule d'écart) ne doivent pas être
portées par la même personne.

`dependency-check` lit désormais la déclaration du front matter de
l'architecture et signale l'écart :

- **non déclaré** → échec. Deux documents se contredisent et rien ne le dit.
- **déclaré sans raison** → échec. Un plan non justifié ne se distingue pas d'une
  erreur de comptage.
- **déclaré et justifié** (`impl_waves` + `impl_waves_rationale`) →
  avertissement visible, l'écart reste dans la sortie.

Un écart assumé ne doit pas être confondu avec une erreur : sinon la seule façon
de faire disparaître l'avertissement est de corriger le document, donc de
mentir sur le plan réel.

### fix(forge) — Une justification pliée n'était pas lue

La raison d'un écart est longue, donc écrite en bloc plié YAML. Le lecteur
renvoyait l'indicateur `>-` au lieu du texte — donc une justification présente
passait pour absente. C'est le défaut qu'un contrôle ne doit pas commettre :
confondre « il n'a pas expliqué » avec « il a expliqué, mal lu ».

### fix(forge) — Un contrôle de design échouait pour une information de Phase 4

`consistency-check screens_have_slices` exigeait que chaque écran soit lié à
une slice, **au gate de la Phase 3** — où aucune slice n'est encore déclarée.
Constaté sur le projet de test : 9 écrans parfaitement conformes, le contrôle
échouait sur les 9. La seule façon de « passer » était de ne plus lire la
sortie.

Le contrôle saute désormais tant qu'aucune slice n'existe, et s'applique dès
qu'il y en a une — donc au bon moment, qui est la Phase 4. La navigation, elle,
se vérifie immédiatement : elle est déclarée dans le même document que les
écrans. Et elle a détecté un vrai trou : l'entrée `Vues` de la navigation ne
renvoyait à aucun écran, parce que l'analyste pouvait éditer une vue sans
jamais pouvoir la retrouver — son cas dominant étant la republication.

### fix(forge) — 7 tests ajoutés (87 → 94)

`state.js dep` : déclaration, dépendance inconnue, auto-dépendance, cycle. Plan
de vagues : non déclaré, déclaré sans raison, déclaré et justifié, raison pliée.

## [1.1.5] - 2026-09-29

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
