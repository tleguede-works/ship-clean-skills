# Frontière entre Forge et project-rules-architect

Deux skills qui ne se connaissent pas produisent deux systèmes de mémoire concurrents, sans règle de priorité. C'est le défaut structurel derrière la plupart des pannes de suivi de projet.

Ce document est le contrat. Il est lu par les deux.

---

## Qui possède quoi

| Le skill | Possède | Le fichier |
|---|---|---|
| **Forge** | Ce qu'on construit et où on en est | `.forge/` |
| **project-rules-architect** | Ce qu'il faut suivre, et pourquoi on l'a décidé | `AGENTS.md`, `.opencode/rules/*.md` |

```
Forge (planification)              project-rules-architect (règles + mémoire)
─────────────────────              ─────────────────────────────────────────
.forge/prd.md                      AGENTS.md              → entry file, DoD, priorités
.forge/roadmap.md                  .opencode/rules/*.md   → les règles
.forge/architecture.md             DECISIONS.md           → pourquoi (ADR)
.forge/plans/<slice>.md            LEARNINGS.md           → ce qui a cassé
.forge/design/…                    SESSION_LOG.md         → ce qui s'est passé
.forge/state.json                  manifestes (pubspec, package-lock…)
.forge/audit/                      analysis_options.yaml
```

**Frontière : les faits produit et les faits techniques vivent chez `project-rules-architect`. Forge n'en possède aucun.**

---

## La règle unique

> **Un fait métier ou technique vit dans un fichier possédé par `project-rules-architect`. `state.json` n'en contient qu'un pointeur.**

L'inverse est un bug, et il est détecté : `forge-guard.js state` rejette toute valeur de plus de 2 000 caractères et toute clé hors `ALLOWED_STATE_KEYS`.

Un `state.json` qui contient de la prose n'est pas un fichier d'état, c'est un document déguisé — et il ne sera ni triable, ni indexable, ni fiable.

---

## Ce que Forge lit de la mémoire du projet

Au début de chaque session, **en plus** de `.forge/state.json` :

```bash
node "$FORGE/scripts/state.js" start <anchor>
```

Cette commande assemble l'état réel : phase, gates, slices **avec présence réelle du plan et du test**, documents `stale`, constats ouverts **non promus**, et l'état de la mémoire du projet (`AGENTS.md` §Definition of Done, entrées `DECISIONS.md` non fermées, volume de `LEARNINGS.md`).

Lire `state.json` seul donne un état partiel — et c'est ainsi qu'un suivi de projet finit par dire faux sans aucun signal.

---

## Tracer une décision

| Le cas | Où va la décision |
|---|---|
| Choix produit (périmètre, priorité, archétype) | `DECISIONS.md` — c'est une décision projet durable |
| Choix technique (lib, pattern, convention) | `DECISIONS.md` |
| Décision **de la vie de Forge** (statut de slice, gate, ordre) | `state.json` |

Un slice n'est pas une décision : c'est un statut. Une règle métier n'est pas un statut : c'est une décision.

---

## Constat, et sa promotion

Un constat se route, il ne s'empile pas.

```bash
node "$FORGE/scripts/state.js" finding <anchor> --domain=<règle visée> --severity=<majeur|mineur> --origin=<forge|projet|environnement> "<fait>" "<correction>"
```

**Le champ `--domain` est obligatoire.** Il n'est pas cosmétique : c'est la cible de promotion. Un constat sans domaine n'a nulle part où aller, donc il ne change rien — il devient un journal de plus, en concurrence avec les règles qu'il était censé informer.

Règles de routage :

| Le constat concerne… | `--domain` |
|---|---|
| Le money/la comptabilité | `data-and-state.md` |
| Les tests | `testing.md` |
| Le cycle de vie d'un écran | `ui-components.md` ou `errors-and-loading-states.md` |
| Le langage / le framework | `flutter-dart.md`, `typescript-javascript.md`… |
| Un contrat externe | `external-system-contracts.md` |
| **Rien de tout ça** | ce n'est pas un constat de règle, c'est un audit → `.forge/audit/issues.md` |

> **Un constat qui n'atteint jamais un fichier de règles n'a rien changé.**

Quand un constat a été promu, on le marque :

```bash
node "$FORGE/scripts/state.js" finding <anchor> --resolve <id> --promoted-to=<règle visée>
```

`audit-report.js` signale tout constat resté non promu au-delà de N sessions : c'est le seul signal qui distingue un skill qui apprend d'un skill qui accumule.

---

## Quand `project-rules-architect` est invoqué

| Moment | Rôle | Entrée |
|---|---|---|
| **Phase 0** | Bootstrap des règles | Stack, manifeste, conventions implicites |
| **Fin de jalon Phase 7** | **Promotion** | Constats non promus, avec domaine |
| **Phase 8** (obligatoire) | **Réécriture** | Bilan complet, métriques, scénarios |

Les sessions 6 à 8 n'ont pas les mêmes informations disponibles que la session 0 : un constat sur le comportement réel d'une API n'existe pas avant d'avoir implémenté contre cette API.

**Forge déclenche les sessions 6 et 8** quand le seuil de constats non promus est dépassé. Sans déclencheur, la promotion reste une intention.

---

## Ce que Forge n'écrit jamais

| ❌ Jamais | ✅ À la place |
|---|---|
| Une version de dépendance dans `state.json` | Le manifeste, et un pointeur |
| Une règle (« toujours utiliser X ») dans un plan | Un constat typé, promu en règle |
| Un journal de session dans `.forge/` | `SESSION_LOG.md` — il a un format et des déclencheurs |
| Une décision et sa raison dans un commentaire de plan | Une entrée `DECISIONS.md` |
| Le nom d'une IA, d'un modèle ou d'un script temporaire | La commande reproductible |

**Une affirmation sans commande derrière elle n'est pas une règle, c'est une préférence.** Et une préférence non appliquée est une décoration — c'est établi, et c'est mesuré : 13 violations sur 26 dans un seul projet.
