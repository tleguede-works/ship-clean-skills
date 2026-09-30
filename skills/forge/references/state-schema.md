# `.forge/state.json` — schéma v2

`state.json` est un **fichier d'état**, pas un document. Il contient uniquement ce qui est nécessaire au fonctionnement du processus : des métadonnées, des identifiants, des chemins, des statuts, des empreintes.

**Le contenu d'un document ne vit jamais ici.** Le PRD est `.forge/prd.md`. Le plan d'une slice est `.forge/plans/<slice>.md`. point mais il n'y a jamais une ligne de PRD dans `state.json`.

Cet invariant est vérifié mécaniquement par `forge-guard.js state` (clés forbidden + détection de blocs de texte volumineux).

---

## Les trois règles d'or

### 1. `state.json` fait foi pour le statut. Le front matter est un miroir.

Le front matter YAML d'un livrable contient un champ `status:`. C'est une **copie**, jamais la source.

```
state.json  =  AUTORITÉ      ──►  écrit par  state.js set-status
front matter =  MIROIR       ──►  réécrit par le même appel, dans la même opération
```

**Interdit** : éditer `status:` à la main dans un `.md`. Le seul écrivain est `state.js set-status`.

**Conséquence** : `state.json` dit `implemented`, le `.md` dit `draft` — cette situation est *impossible* à maintenir et immédiatement détectée :

```bash
node "$FORGE/scripts/forge-guard.js" sync .        # détecte, exit 1
node "$FORGE/scripts/forge-guard.js" sync . --fix  # réaligne le miroir sur l'autorité
```

### 2. `content_hash` porte sur le corps, jamais sur le front matter.

`contentHash()` hache le document **hors front matter**. Changer un statut ne modifie donc pas le hash. Un plan reste « frais » après un simple `draft → approved`.

Un hash qui ne match plus signifie une **édition hors bande** : quelqu'un a modifié le corps du document sans passer par `state.js hash`. Le plan est alors `stale` (`check-stale`).

### 3. Le chemin est canonique, et il est dans `.forge`.

`CANONICAL_LAYOUT` (dans `scripts/lib/forge-lib.js`) fixe le chemin de chaque livrable. `state.js register` et `forge-guard.js paths` refusent tout autre chemin. Rien ne s'écrit dans un dossier temporaire, ni hors de `<anchor>/.forge/`.

---

## Structure complète

```json
{
  "version": 2,
  "forge_skill_version": "2.0.0",

  "product": {
    "name": "GestionLocative",
    "created_at": "2026-09-27T10:00:00Z",
    "description": "Une phrase — ce que fait le produit",
    "archetype": "mobile_field_ops"
  },

  "project": {
    "path": "/chemin/vers/projet",
    "anchor_source": "project_marker",
    "stack": { "language": "typescript", "framework": "expo", "styling": "nativewind" },
    "package_manager": "pnpm",
    "testing": { "unit": "vitest", "components": "jest", "e2e": "detox" }
  },

  "reference_projects": [
    {
      "name": "Legacy",
      "path": "/chemin/vers/legacy",
      "role": "reference",
      "read_only": true,
      "granted_at": "2026-09-27T10:00:00Z"
    }
  ],

  "run": {
    "id": "run-m1x2y3z",
    "started_at": "2026-09-27T10:00:00Z",
    "mode": "guided",
    "fast_track": {
      "enabled": false,
      "entered_at": null,
      "current_artifact": null,
      "attempts": {},
      "checkpoint_reached": false
    }
  },

  "current_phase": "4",

  "phases": {
    "0_bootstrap":               { "status": "approved", "completed_at": "2026-09-27T10:15:00Z" },
    "1_prd":                     { "status": "approved", "completed_at": "2026-09-27T11:00:00Z" },
    "2_roadmap":                 { "status": "approved", "completed_at": "2026-09-27T11:30:00Z" },
    "3_design":                  { "status": "approved", "completed_at": "2026-09-27T12:00:00Z" },
    "4_architecture":            { "status": "in_progress" },
    "5_implementation_plan":     { "status": "not_started" },
    "6_validation":              { "status": "not_started" },
    "7_implementation":          { "status": "not_started" },
    "8_final_validation":        { "status": "not_started" }
  },

  "deliverables": {
    "conventions":   { "path": ".forge/conventions.md",            "type": "conventions",   "status": "approved", "content_hash": "sha256:aaa111", "updated_at": "..." },
    "prd":           { "path": ".forge/prd.md",                    "type": "prd",           "status": "approved", "content_hash": "sha256:bbb222", "version": 1,
                       "rule_ids": ["B1","B2","B3"], "edge_case_ids": ["E1","E2"], "constraint_ids": ["C1"] },
    "roadmap":       { "path": ".forge/roadmap.md",                "type": "roadmap",       "status": "approved", "content_hash": "sha256:ccc333" },
    "benchmarks":    { "path": ".forge/benchmarks.md",             "type": "benchmarks",    "status": "approved", "content_hash": "sha256:ddd444" },
    "design_system": { "path": ".forge/design/design-system.md",   "type": "design-system", "status": "approved", "content_hash": "sha256:eee555" },
    "architecture":  { "path": ".forge/architecture.md",           "type": "architecture",  "status": "draft",     "content_hash": "sha256:fff666" },
    "test_plan":     { "path": ".forge/test-plan.md",              "type": "test-plan",     "status": "not_started", "content_hash": null }
  },

  "index": {
    "nav": {
      "archetype": "mobile_field_ops",
      "platform": "ios,android",
      "core_loop": "consulter l'état du portefeuille, saisir une entrée/sortie, agir sur un contrat",
      "items": [
        { "key": "accueil",   "label": "Accueil",   "rank": 1, "frequency": "quotidien",  "task_criticality": 5, "rationale": "..." },
        { "key": "finance",   "label": "Finance",   "rank": 2, "frequency": "quotidien",  "task_criticality": 4, "rationale": "..." },
        { "key": "contrats",  "label": "Contrats",  "rank": 3, "frequency": "hebdomadaire","task_criticality": 4, "rationale": "..." }
      ],
      "primary_count": 3,
      "overflow_count": 2,
      "rationale": "...",
      "updated_at": "..."
    },
    "impl_waves": [ { "wave": 0, "nodes": ["design-system","auth"] } ]
  },

  "screens": {
    "accueil":   { "path": ".forge/design/screens/accueil.md",  "status": "approved", "rule_ids": ["B1"], "content_hash": "sha256:111aaa" }
  },

  "foundations": {
    "auth": { "status": "planned", "plan_path": null, "depends_on": [], "depended_on_by": ["slice-login"], "impl_wave": 0 }
  },

  "modules": {
    "finance": { "label": "Finance", "rank": 2, "nav_slot": 2, "frequency": "quotidien", "slices": ["slice-entree","slice-sortie"] }
  },

  "slices": {
    "slice-entree": {
      "module": "finance",
      "status": "planned",
      "rule_ids": ["B1","B2"],
      "edge_case_ids": ["E1"],
      "plan_path": ".forge/plans/slice-entree.md",
      "plan_hash": "sha256:222bbb",
      "depends_on": ["auth"],
      "depended_on_by": ["slice-bilan"],
      "impl_wave": 1
    }
  },

  "gates_pending": [
    { "phase": "4_architecture", "artifact": ".forge/architecture.md", "opened_at": "...", "reason": "gate humain" }
  ],

  "audit": {
    "log": ".forge/audit/run-log.jsonl",
    "issues": ".forge/audit/issues.md",
    "metrics": ".forge/audit/metrics.json",
    "counts": { "init": 1, "status_change": 12, "sync": 3 }
  },

  "divergences": [
    { "ts": "...", "kind": "deliverable", "key": "prd", "path": ".forge/prd.md",
      "state_status": "approved", "file_status": "draft", "reason": "status_mismatch", "resolved": false }
  ]
}
```

---

## Vocabulaire de statuts

| Portée | Valeurs autorisées |
|---|---|
| Phase | `not_started` → `in_progress` → `approved` |
| Document / écran | `not_started` → `draft` → `in_review` → `approved` → `stale` → `deprecated` |
| Slice / Fondation | `identified` → `planned` → `in_progress` → `implemented` → `validated` |

`stale` est volontaire : un document dont le `content_hash` ne match plus, ou dont une source amont a dérivé, est marqué `stale` — pas silencieusement considéré à jour.

---

## Clés autorisées et interdites

**Racine autorisée** (`ALLOWED_STATE_KEYS`) : `version`, `forge_skill_version`, `product`, `project`, `reference_projects`, `run`, `current_phase`, `phases`, `deliverables`, `index`, `screens`, `foundations`, `modules`, `slices`, `gates_pending`, `audit`, `divergences`.

**Clés interdites à tout niveau** (`FORBIDDEN_STATE_KEYS`) : `content`, `body`, `markdown`, `text`, `html`, `sections`, `prose`, `document_content`, `raw`, `summary_text`.

---

## Layout canonique des livrables

| Clé | Chemin | Phase |
|---|---|---|
| `conventions` | `.forge/conventions.md` | 0 |
| `prd` | `.forge/prd.md` | 1 |
| `roadmap` | `.forge/roadmap.md` | 2 |
| `benchmarks` | `.forge/benchmarks.md` | 3 |
| `design_system` | `.forge/design/design-system.md` | 3 |
| `architecture` | `.forge/architecture.md` | 4 |
| `test_plan` | `.forge/test-plan.md` | 6 |
| `screens/<nom>` | `.forge/design/screens/<nom>.md` | 3 |
| `plans/<slice>` | `.forge/plans/<slice>.md` | 5 |

Dossiers hors livrables : `.forge/audit/`, `.forge/.tmp/`.

---

## Provenance des champs

| Champ | Écrit par |
|---|---|
| `project.*`, `reference_projects` | Phase 0 (`state.js init`) |
| `product.*`, `run.*` | Phase 0 / 1 |
| `phases.*` | `state.js complete-phase` |
| `deliverables.*.status` | `state.js set-status` (autorité) |
| `deliverables.*.content_hash` | `state.js hash`, `register`, `set-status` |
| `index.nav` | `state.js set-nav` (cf. `references/module-prioritization.md`) |
| `index.impl_waves`, `*.depends_on`, `*.depended_on_by`, `*.impl_wave` | `dependency-check.js --write` |
| `screens.*`, `slices.*`, `foundations.*`, `modules.*` | Phase 3 / 4 |
| `divergences` | `forge-guard.js sync`, `state.js sync` |
| `audit.counts` | tout appel scripté |

---

## Règles d'écriture

1. **Ne jamais éditer `state.json` à la main.** Passer par `scripts/state.js`.
2. **Ne jamais relire `state.json` juste avant d'écrire pour le préserver** — c'est le rôle de `writeState`. Lire l'état courant à chaque commande.
3. **Un `state.json` en v1 est refusé**, pas migré silencieusement : `node "$FORGE/scripts/state.js" migrate <anchor>`.
4. **Aucun contenu de document.** Si l'information ne tient pas dans une métadonnée, elle appartient dans un livrable.

## Commandes

```bash
node "$FORGE/scripts/state.js" anchor [start]                          # résout l'anchor, refuse un projet de référence
node "$FORGE/scripts/state.js" init <root> <nom> [--reference <p>]    # crée .forge/ + state.json v2
node "$FORGE/scripts/state.js" register <root> <kind> <clé> <chemin>   # valide le chemin canonique
node "$FORGE/scripts/state.js" set-status <root> <kind> <clé> <statut> # ÉCRIT l'autorité + le miroir
node "$FORGE/scripts/state.js" set-phase <root> <phase> <statut>
node "$FORGE/scripts/state.js" complete-phase <root> <phase>
node "$FORGE/scripts/state.js" hash <root> <livrable>
node "$FORGE/scripts/state.js" sync <root> [--fix]
node "$FORGE/scripts/state.js" check-stale <root> <slice>
node "$FORGE/scripts/state.js" set-nav <root> <json>
node "$FORGE/scripts/state.js" migrate <root>                          # v1 → v2
node "$FORGE/scripts/state.js" status <root>
node "$FORGE/scripts/state.js" log <root> <type> <message> [k=v ...]  # journaliser un incident
```
