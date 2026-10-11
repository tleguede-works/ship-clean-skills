# Frontière entre Forge et project-rules-architect

Deux skills qui ne se connaissent pas produisent deux systèmes de mémoire concurrents, sans règle de priorité. Le défaut structurel derrière la plupart des pannes de suivi de projet.

Ce document est le contrat. Il est lu par les deux.

---

## Qui possède quoi

| Le skill | Possède | Le fichier |
|---|---|---|
| **Forge** | Ce qu'on construit, et où on en est | `.forge/` |
| **project-rules-architect** | Ce qu'il faut suivre | `AGENTS.md`, `.opencode/rules/*.md` |
| **l'agent** | Ce qui s'est passé entre deux sessions | `AGENTS.md`, `SESSION_LOG.md`, `DECISIONS.md`, `LEARNINGS.md` |

```
Forge (planification)              project-rules-architect (règles)
─────────────────────              ─────────────────────────
.forge/                            AGENTS.md        → le contexte d'abord
  prd.md                            SESSION_LOG.md  → ce qui s'est passé
  roadmap.md                        DECISIONS.md    → ce qui a été décidé
  architecture.md                   LEARNINGS.md    → ce qui a été appris
  plans/<slice>.md
  design/…
  state.json
  audit/
                                   AGENTS.md         → entry file, DoD, priorités
                                   .opencode/rules/  → les règles
                                   opencode.json     → le câblage
```

**Frontière : les faits produit restent chez Forge, les instructions chez
`project-rules-architect`, et l'historique chez l'agent. Forge n'en écrit aucun
des deux derniers.**

---

## Les deux appels

La synergie tient en deux appels. **Forge est l'appelant, deux fois. Il n'est
jamais l'appelé.**

| Appel | Quand | Forge transmet | Forge récupère |
|---|---|---|---|
| **1 — le socle de contexte** | au démarrage, avant le plan | le nom du produit, ce dont on sait déjà | les quatre fichiers de mémoire, en place |
| **2 — le jeu de règles** | après la stack et le sujet | la stack décidée, les conventions retenues, le périmètre | `AGENTS.md` + les règles, câblées sur l'outil cible |

### Pourquoi l'appel 1 ne peut pas attendre, et ne peut pas être devancé

Le socle doit exister **avant** la première session de code, sinon la première
décision, le premier correctif et la première question ouverte sont écrits
dans une mémoire qui n'existe pas — donc dans le fil de la session, donc perdus.

Et il ne peut pas être posé par Forge : Forge ne sait pas encore à quel endroit
l'agent va chercher, ni sous quel format. Deux calls à des moments différents
ne sont pas redondants, ils répondent à deux questions que personne d'autre ne
peut répondre.

### Pourquoi l'appel 2 ne peut pas être anticipé

Les règles se génèrent **contre** la stack. Les produire avant que la stack soit
décidée, c'est deviner — et une règle devinée a l'autorité d'une règle et la
fiabilité d'une supposition, donc l'agent l'applique.

C'est aussi pourquoi l'appel 1 ne produit **aucune** règle : entre les deux
appels, le projet a une mémoire et pas de règles. Ce n'est pas un jeu de règles
à moitié fait, c'est l'état normal.

### Le moment de l'appel 2

`architecture` est `approved`. C'est le premier instant où la stack est décidée
et datée. Avant, c'est une case `À DÉCIDER` ; après, c'est un choix qu'on peut
câbler dans un fichier de règles.

### Et la porte qui le déclenche

**Un moment déclaré n'est pas un déclencheur.** L'appel 2 était écrit, daté et
conditionné dans trois documents — tous d'accord entre eux — et rien ne le
déclenchait : l'agent lisait la phrase et continuait.

```bash
node "$FORGE/scripts/forge-guard.js" rules-present <anchor>
```

La porte échoue quand l'architecture est close et qu'il n'y a **pas de jeu de
règles chargé** : répertoire absent, répertoire vide, ou répertoire rempli sans
`opencode.json` qui le pointe. Le troisième cas est celui qui compte — un jeu de
règles écrit et non câblé est le livrable le plus trompeur possible, parce
qu'il est complet en apparence.

Avant l'approbation, la porte passe et le dit : les règles se génèrent *contre*
la stack, donc leur absence avant ce moment est l'ordre normal.

**Mesuré** : cinq projets de laboratoire au même avancement, un seul avec un jeu
de règles. Quatre avaient approuvé leur architecture. Rien ne le signalait.

### Ce que Forge transmet à l'appel 2

Des **extraits structurés**, pas les fichiers entiers. `architecture.md` et
`conventions.md` peuvent faire plusieurs milliers de lignes, et la partie qui
décide d'une règle est une fraction de l'ensemble — la table de stack, les choix
de bibliothèques, les questions ouvertes. Un fait transmis est une ligne, pas un
chapitre. Un résumé structuré est à la fois plus petit et plus fiable qu'un
fichier lu en diagonale.

---

## La règle unique

> **Un fait vit dans un fichier possédé. Un `state.json` n'en contient qu'un pointeur.**

L'inverse est un bug, et il est détecté : `forge-guard.js state` rejette toute
valeur de plus de 2 000 caractères et toute clé hors `ALLOWED_STATE_KEYS`.

Un `state.json` qui contient de la prose n'est pas un fichier d'état, c'est un
document déguisé — et il ne sera ni triable, ni indexable, ni fiable.

---

## Ce que Forge lit de la mémoire du projet

Au début de chaque session, **en plus** de `.forge/state.json` :

```bash
node "$FORGE/scripts/state.js" start <anchor>
```

Cette commande assemble l'état réel : phase, gates, slices **avec présence réelle
du plan et du test**, documents `stale`, constats ouverts, et l'état de la
mémoire du projet (`AGENTS.md` §Definition of Done, entrées `DECISIONS.md` non
fermées, volume de `LEARNINGS.md`).

Lire `state.json` seul donne un état partiel — et c'est ainsi qu'un suivi de
projet finit par dire faux sans aucun signal.

> **Note de version.** Cette lecture existait avant que la mémoire ne soit posée
> par quiconque : elle rendait `project_memory.present: false` sur les trois
> projets de laboratoire, et rien ne l'a jamais remarqué. C'est une observation
> aujourd'hui, pas une obligation. **Forge lit ; Forge n'écrit jamais.**

---

## Ce que Forge n'écrit jamais

| ❌ Jamais | ✅ À la place |
|---|---|
| Une version de dépendance dans `state.json` | Le manifeste, et un pointeur |
| Une règle (« toujours utiliser X ») dans un plan | Un fait de stack, transmis à l'appel 2 |
| Un journal de session, une décision, un apprentissage dans `.forge/` | Les quatre fichiers de mémoire, tenus par l'agent |
| Une édition dans `AGENTS.md`, `SESSION_LOG.md`, `DECISIONS.md`, `LEARNINGS.md` | Rien — c'est la mémoire de l'agent, pas la sienne |
| Un `AGENTS.md` ou un `.opencode/rules/` de sa main | Le jeu de règles, produit par l'appel 2 |
| Le nom d'une IA, d'un modèle ou d'un script temporaire | La commande reproductible |

**Une affirmation sans commande derrière elle n'est pas une règle, c'est une
préférence.** Et une préférence non appliquée est une décoration.

**Et une règle écrite dans un plan, sans passer par l'appel 2, n'est pas une
règle du projet** : c'est une phrase que le slice suivant ne lira pas, et que
l'agent ne verra jamais.
