# Forge

Plateforme de conception, planification et spécification de nouveaux produits logiciels. Transforme une idée initiale — même floue — en un plan exhaustif, sans ambiguïté, suffisamment précis pour être exécuté par une IA même peu performante.

## Principe fondateur

**Un modèle même peu performant doit pouvoir prendre un plan d'implémentation généré par Forge et implémenter une slice sans ambiguïté.**

## Inspiration

Forge hérite de la philosophie de [Corpus](https://github.com/anomalyco/corpus) — *méthodologie open source tierce, pas un skill de cette collection* — avec son système d'identifiants stables, ses gates humains non négociables, son exhaustivité obligatoire, sa vérification mécanique par scripts. Mais là où Corpus documente un projet legacy pour le migrer, Forge part d'une page blanche et transforme une idée en plan.

## Les six niveaux de documents

| Niveau | Nom | Question | Phase |
|---|---|---|---|
| 0 | Intent (PRD) | *Pourquoi ce produit existe ?* | 1 |
| 1 | Scope (Roadmap) | *Quoi et quand ?* | 2 |
| 2 | Design (UI/UX) | *À quoi ça ressemble ?* | 3 |
| 3 | Architecture | *Comment c'est structuré ?* | 4 |
| 4 | Plan (Implémentation) | *Comment implémenter chaque slice ?* | 5 |
| 5 | Validation (Tests) | *Comment vérifier que tout fonctionne ?* | 6 |

## Quatre garanties

Ce qui distingue Forge d'une simple checklist de planification.

### 1. Les livrables ne peuvent pas se perdre

Tout document produit par Forge vit dans `<projet>/.forge/`, sur un chemin canonique. Un livrable dans un dossier temporaire est détecté et signalé.

```bash
node scripts/forge-guard.js strays <anchor>        # détecte
node scripts/forge-guard.js strays <anchor> --relocate   # range
```

### 2. L'état et les documents ne peuvent pas diverger

`state.json` fait foi pour le statut ; le champ `status:` du front matter est un miroir, écrit par le même appel. `state.json` ne contient **jamais** de contenu de document — le PRD est un fichier Markdown séparé.

```bash
node scripts/forge-guard.js sync <anchor>          # détecte l'écart
node scripts/forge-guard.js sync <anchor> --fix    # le corrige
```

### 3. Le projet courant est résolu avant toute écriture

Un projet Legacy accessible depuis la session ne peut pas devenir l'anchor. C'est le bug le plus coûteux : analyser l'ancien, écrire dans l'ancien.

```bash
node scripts/state.js anchor
```

### 4. Forge s'améliore à partir de ses propres exécutions

Chaque run journalise ses incidents. Après plusieurs projets, l'analyse croisée fait apparaître ce qui échoue **dans le skill** plutôt que dans les projets.

```bash
node scripts/audit-report.js <dossier-des-projets> --out reports/
```

## Les deux modes

| | **Guided** (défaut) | **Fast Track** |
|---|---|---|
| Gates | Un par phase | **Un seul**, à la sortie de la Phase 5 |
| Phases 4-5 | Manuelles, slice par slice | Automatisées |
| Validateurs | Rotation de posture en session | `quality-analyst` + `red-team` + `plan-validator` en parallèle |
| Activation | Toujours | PRD + conventions + design + écrans + benchmarks approuvés |

Fast Track ne supprime pas la validation : il supprime la répétition. Détail dans `references/fast-track.md`.

## Installation

```bash
cp -r forge .opencode/skills/forge
```

## Démarrage rapide

```
1. Inviter le skill Forge dans OpenCode
2. "J'ai une idée de produit : [décris ton idée]"
3. Forge résout l'anchor, puis démarre l'interview (Phase 1)
4. Le processus continue phase par phase, avec validation humaine
5. Phase 3 : standards, direction visuelle, navigation priorisée, écrans
6. Phase 4-5 : architecture puis plans, slice par slice
   → activer Fast Track pour éviter 15 validations manuelles
7. Phase 6 : stratégie de tests
8. Phase 7 : implémentation slice par slice
```

## Workflow complet

```
anchor → Interview → PRD → Roadmap → Standards + Direction + Navigation + Design
  → Architecture → Plans d'implémentation → Plan de tests
  → Implémentation → Validation finale
```

Avec, tout au long : gates humains (ou Fast Track), analyse d'impact, multi-perspective, identifiants stables (B\*, E\*, C\*), garde-fous déterministes, audit.

## Agents

Chaque agent est un **contrat** : rôle, inputs, procédure, format de sortie, hors-scope.

| Agent | Phase | Modes | Rôle |
|---|---|---|---|
| `product-analyst` | 1, 2 | produce, review | Discovery, interviews, PRD, user stories |
| `scope-architect` | 2 | produce, review | Roadmap, MVP, versions, compromis |
| `ux-designer` | 3 | produce, review | Standards, direction visuelle, navigation, écrans |
| `systems-architect` | 4 | produce, review | Architecture, slices, données, API, dépendances |
| `quality-analyst` | 1–8 | produce, **validate** | Exhaustivité, edge cases, tests |
| `red-team` | 1–8 | **validate** | Contradictions, angles morts |
| `plan-validator` | 4, 5 | **validate** | Conformité aux standards de l'archétype |
| `forge-implementer` | 7, 8 | produce | Implémentation, TDD, validation |

## Structure

```
forge/
├── SKILL.md                          # Définition du skill et workflow complet
├── agents/                           # 8 contrats d'agents
│   ├── product-analyst.md
│   ├── scope-architect.md
│   ├── ux-designer.md
│   ├── systems-architect.md
│   ├── quality-analyst.md
│   ├── red-team.md
│   ├── plan-validator.md
│   └── forge-implementer.md
├── templates/                        # 9 gabarits de documents
│   ├── conventions.md.tmpl
│   ├── prd.md.tmpl
│   ├── roadmap.md.tmpl
│   ├── benchmarks.md.tmpl
│   ├── design-system.md.tmpl
│   ├── screen.md.tmpl
│   ├── architecture.md.tmpl
│   ├── implementation-plan.md.tmpl
│   ├── test-plan.md.tmpl
│   └── audit-issues.md.tmpl
├── references/                       # 7 protocoles et schémas
│   ├── state-schema.md               # format de state.json (v2), qui fait foi
│   ├── module-prioritization.md      # ordre des modules et de la navigation
│   ├── design-quality.md             #Direction visuelle, interdits anti-générique
│   ├── archetypes.md                 # standards par type d'application
│   ├── fast-track.md                 # validation automatique des plans
│   ├── impact-protocol.md            # analyse d'impact
│   └── review-checklists.md          # checklists de gate
├── scripts/                          # 6 scripts déterministes (Node.js, zéro deps)
│   ├── lib/forge-lib.js              # bibliothèque partagée
│   ├── state.js                      # état, statuts, synchronisation, anchor
│   ├── forge-guard.js                # garde-fous (chemins, état, sync, placeholders)
│   ├── coverage-check.js             # couverture d'un plan de slice
│   ├── dependency-check.js           # graphe de dépendances, ordre topologique
│   ├── audit-report.js               # analyse croisée de plusieurs projets
│   └── selftest.js                   # tests du skill lui-même
└── README.md
```

## Sortie dans un projet

```
<projet>/
└── .forge/
    ├── state.json                    # état du projet (métadonnées uniquement)
    ├── conventions.md
    ├── prd.md
    ├── roadmap.md
    ├── benchmarks.md
    ├── architecture.md
    ├── test-plan.md
    ├── design/
    │   ├── design-system.md
    │   └── screens/<écran>.md
    ├── plans/<slice>.md
    └── audit/
        ├── run-log.jsonl
        ├── issues.md
        └── metrics.json
```

## Commandes

```bash
# Résoudre le projet courant
node scripts/state.js anchor

# Initialiser
node scripts/state.js init <anchor> "<Nom>" --reference /chemin/vers/Legacy

# Statuts (écrit l'état ET le front matter)
node scripts/state.js set-status <anchor> deliverable prd approved
node scripts/state.js sync <anchor> --fix
node scripts/state.js check-stale <anchor> <slice>
node scripts/state.js migrate <anchor>          # v1 → v2

# Navigation priorisée
node scripts/state.js set-nav <anchor> '{ "archetype": "...", "items": [...] }'

# Garde-fous
node scripts/forge-guard.js all <anchor>

# Vérifications
node scripts/coverage-check.js slice <anchor> <slice>
node scripts/dependency-check.js check <anchor> --write

# Audit inter-projets
node scripts/audit-report.js <dossier> --out reports/
```

## Tests

```bash
node scripts/selftest.js
```
