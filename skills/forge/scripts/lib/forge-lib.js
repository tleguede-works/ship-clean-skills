/**
 * forge-lib — helpers partagés par les scripts déterministes de Forge.
 *
 * Zéro dépendance. Tout ce qui touche au disque, au front matter YAML, au
 * hachage et à l'audit passe par ici, pour que les scripts ne puissent pas
 * diverger entre eux.
 *
 * Règle structurante : les scripts n'écrivent JAMAIS hors de <racine>/.forge/.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const FORGE_DIR = '.forge';
const STATE_PATH = '.forge/state.json';
const STATE_VERSION = 2;

const AUDIT_PATHS = {
  log: '.forge/audit/run-log.jsonl',
  issues: '.forge/audit/issues.md',
  metrics: '.forge/audit/metrics.json'
};

/** Sous-dossiers de .forge qui ne sont pas des livrables. */
const NON_DELIVERABLE_DIRS = ['audit', '.tmp', 'node_modules'];

/** Livrables livrés avec le layout canonique. kind -> chemin relatif attendu. */
const CANONICAL_LAYOUT = {
  conventions: '.forge/conventions.md',
  prd: '.forge/prd.md',
  roadmap: '.forge/roadmap.md',
  benchmarks: '.forge/benchmarks.md',
  design_system: '.forge/design/design-system.md',
  architecture: '.forge/architecture.md',
  test_plan: '.forge/test-plan.md'
};

const STATUS_VOCAB = {
  phase: ['not_started', 'in_progress', 'approved'],
  document: ['draft', 'in_review', 'approved', 'stale', 'deprecated'],
  slice: ['identified', 'planned', 'in_progress', 'implemented', 'validated']
};

/** Ordre des phases. Source unique : state.js et forge-guard.js lisent ici. */
const PHASE_KEYS = [
  '0_bootstrap', '1_prd', '2_roadmap', '3_design', '4_architecture',
  '5_implementation_plan', '6_validation', '7_implementation', '8_final_validation'
];

/**
 * Ce que chaque phase doit avoir produit pour pouvoir être approuvée.
 *
 * Sans ce contrat, une phase s'approuve sur sa seule parole : les contrôles
 * valident les livrables *déclarés*, donc zéro déclaration donne zéro
 * vérification, et tout passe au vert. Constaté sur un test grandeur nature —
 * Phase 0 approuvée avec `deliverables: {}` et aucun `conventions.md`, puis
 * toute la chaîne enchaînée sur cette base absente.
 *
 * `required` : livrables sans lesquels la phase n'a pas eu lieu.
 * `atLeastOneOf` : phases dont la quantité suit le découpage, pas un compte fixe.
 */
const PHASE_REQUIREMENTS = {
  '0_bootstrap': { required: ['conventions'] },
  '1_prd': { required: ['prd'] },
  '2_roadmap': { required: ['roadmap'] },
  '3_design': { required: ['design-system'], atLeastOneOf: [['screen']] },
  '4_architecture': { required: ['architecture'] },
  '5_implementation_plan': { atLeastOneOf: [['plan']] },
  '6_validation': { required: ['test-plan'] },
  '7_implementation': {},
  '8_final_validation': {}
};

/** Ce qui manque à une phase pour être complète. Liste vide = complète. */
function missingPhaseRequirements(state, phaseKey) {
  const spec = PHASE_REQUIREMENTS[phaseKey];
  if (!spec) return [];

  const missing = [];
  for (const key of spec.required || []) {
    const entry = (state.deliverables || {})[key];
    if (!entry) missing.push({ key, why: 'aucun livrable enregistré pour cette phase' });
    else if (!entry.path) missing.push({ key, why: 'enregistré sans chemin de fichier' });
  }

  // Un plan de slice est enregistré comme slice avec un plan, ou comme
  // livrable selon la version — on accepte les deux formes plutôt que d'imposer
  // une topologie que le skill ne contrôle pas ailleurs.
  const bucketFor = kind => {
    if (kind === 'plan') {
      const asDeliverable = Object.keys(state.deliverables || {})
        .filter(k => /^plan[-_/]/.test(k));
      const asSlice = Object.values(state.slices || {}).filter(s => s.plan_path || s.plan);
      return asDeliverable.length + asSlice.length;
    }
    const bucket = state[kind === 'screen' ? 'screens' : kind === 'slice' ? 'slices'
      : kind === 'foundation' ? 'foundations' : 'deliverables'] || {};
    return Object.keys(bucket).length;
  };

  for (const group of spec.atLeastOneOf || []) {
    if (!group.some(kind => bucketFor(kind) > 0)) {
      missing.push({
        key: group.join('|'),
        why: `aucun élément de type ${group.join(' ou ')} — la phase n'a rien produit`
      });
    }
  }
  return missing;
}

/** Clés de state.json autorisées (schema strict, cf. guard state-schema). */
const ALLOWED_STATE_KEYS = [
  'version', 'forge_skill_version', 'product', 'project', 'reference_projects',
  'run', 'current_phase', 'phases', 'deliverables', 'index', 'screens',
  'foundations', 'modules', 'slices', 'gates_pending', 'audit', 'divergences',
  'findings'
];

/**
 * Domaines de constat = fichiers de règles vers lesquels un constat est promu.
 *
 * Ce n'est pas une liste arbitraire : c'est le routage. Un constat sans
 * domaine n'a nulle part où aller, donc il ne change rien — il devient un
 * journal de plus, en concurrence avec les règles qu'il devait informer.
 *
 * Ces noms correspondent aux gabarits de project-rules-architect. Un constat
 * dont le domaine n'est pas dans cette liste n'est pas routable : il doit
 * aller dans .forge/audit/issues.md (incident), pas dans state.json.
 */
const FINDING_DOMAINS = [
  'entry-file.md', 'workflow.md', 'architecture.md', 'coding-standards.md', 'security.md',
  'data-and-state.md', 'testing.md', 'ui-components.md', 'forms.md',
  'errors-and-loading-states.md', 'external-system-contracts.md',
  'accessibility.md', 'design-system.md', 'i18n.md', 'performance.md',
  'flutter-dart.md', 'typescript-javascript.md', 'react.md', 'react-native-expo.md',
  'nextjs.md', 'node-nestjs.md', 'java-spring.md'
];

/** Sous-clés interdites dans state.json : le contenu des documents vit ailleurs. */
const FORBIDDEN_STATE_KEYS = [
  'content', 'body', 'markdown', 'text', 'html', 'sections', 'prose',
  'document_content', 'raw', 'summary_text'
];

/* ------------------------------------------------------------------ *
 * Utilitaires terminal
 * ------------------------------------------------------------------ */

function out(obj) {
  process.stdout.write(JSON.stringify(obj, null, 2) + '\n');
}

function fail(obj, code = 1) {
  process.stdout.write(JSON.stringify(obj, null, 2) + '\n');
  process.exit(code);
}

/* ------------------------------------------------------------------ *
 * Front matter YAML (plat, sans dépendance)
 * ------------------------------------------------------------------ */

function splitFrontMatter(content) {
  const normalized = content.replace(/^﻿/, '');
  if (!normalized.startsWith('---')) return null;

  const lines = normalized.split('\n');
  if (lines[0].trim() !== '---') return null;

  let end = -1;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === '---') { end = i; break; }
  }
  if (end === -1) return null;

  const data = {};
  for (const line of lines.slice(1, end)) {
    if (!line.trim() || line.trim().startsWith('#')) continue;
    const idx = line.indexOf(':');
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    let value = line.slice(idx + 1).trim();
    if (value.startsWith('[') && value.endsWith(']')) {
      const inner = value.slice(1, -1).trim();
      data[key] = inner
        ? inner.split(',').map(v => v.trim().replace(/^["']|["']$/g, '')).filter(Boolean)
        : [];
    } else {
      data[key] = value.replace(/^["']|["']$/g, '');
    }
  }

  return { data, body: lines.slice(end + 1).join('\n'), bodyStartLine: end + 1 };
}

function serializeFrontMatter(data) {
  const lines = ['---'];
  for (const [key, value] of Object.entries(data)) {
    if (value === null || value === undefined) { lines.push(`${key}: null`); continue; }
    if (Array.isArray(value)) { lines.push(`${key}: [${value.map(v => String(v)).join(', ')}]`); continue; }
    const str = String(value);
    lines.push(`${key}: ${/[[\]{}]|^[\s]|:\s|["']|^\s*#/.test(str) ? JSON.stringify(str) : str}`);
  }
  lines.push('---');
  return lines.join('\n');
}

function readFrontMatter(filePath) {
  if (!fs.existsSync(filePath)) return null;
  return splitFrontMatter(fs.readFileSync(filePath, 'utf-8'));
}

function writeFrontMatter(filePath, data) {
  const current = fs.readFileSync(filePath, 'utf-8');
  const split = splitFrontMatter(current);
  if (!split) {
    throw new Error(`Front matter absent ou invalide : ${filePath}`);
  }
  const bom = current.startsWith('﻿') ? '﻿' : '';
  // normalizeBody retire les sauts de ligne de tête : le corps écrit est donc
  // toujours identique à celui que contentHash hache, quelle que soit la façon
  // dont le fichier a été produit. Sans cette symétrie, un simple changement de
  // statut modifierait le content_hash et marquerait le document « stale ».
  const next = bom + serializeFrontMatter(data) + '\n\n' + normalizeBody(split.body);
  fs.writeFileSync(filePath, next);
}

/* ------------------------------------------------------------------ *
 * Hachage
 * ------------------------------------------------------------------ */

function sha12(input) {
  return 'sha256:' + crypto.createHash('sha256').update(input).digest('hex').substring(0, 12);
}

/**
 * Forme canonique du corps d'un document.
 * Retire les sauts de ligne de tête et l'espace final : ces variations sont
 * cosmétiques et ne doivent jamais faire bouger un content_hash.
 */
function normalizeBody(body) {
  return String(body).replace(/^\n+/, '').replace(/\s+$/, '');
}

/** Hachage du CORPS du document (hors front matter) : détecte les éditions hors bande. */
function contentHash(filePath) {
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, 'utf-8');
  const split = splitFrontMatter(raw);
  if (!split) return sha12(raw);
  return sha12(normalizeBody(split.body));
}

/* ------------------------------------------------------------------ *
 * Chemins
 * ------------------------------------------------------------------ */

function toAbs(root, rel) {
  return path.isAbsolute(rel) ? rel : path.join(root, rel);
}

function isInside(parentDir, childPath) {
  const rel = path.relative(path.resolve(parentDir), path.resolve(childPath));
  return rel === '' || (!rel.startsWith('..') && !path.isAbsolute(rel));
}

function listFilesRecursive(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === '.git') continue;
      listFilesRecursive(full, acc);
    } else {
      acc.push(full);
    }
  }
  return acc;
}

/* ------------------------------------------------------------------ *
 * Racine du projet (anchor)
 * ------------------------------------------------------------------ */

const PROJECT_MARKERS = [
  '.forge', 'package.json', 'pnpm-workspace.yaml', 'pyproject.toml', 'Cargo.toml',
  'go.mod', 'pubspec.yaml', 'composer.json', 'Gemfile', 'pom.xml', 'build.gradle',
  'build.gradle.kts', 'mix.exs', 'pubspec.lock', 'deno.json', 'project.clj', '.git'
];

/** Le répertoire est-il vide (hors fichiers cachés) ? Un projet greenfield l'est. */
function isEmptyDir(dir) {
  let entries;
  try {
    entries = fs.readdirSync(dir);
  } catch {
    return false;
  }
  return entries.filter(e => !e.startsWith('.')).length === 0;
}

/**
 * Résout la racine du projet courant.
 *
 * Un projet de référence (Legacy, corpus, etc.) accessible depuis la session ne
 * doit JAMAIS devenir l'anchor : seul le répertoire de travail et ses ancêtres
 * légitimes comptent.
 *
 * Trois cas, dans l'ordre :
 *   1. existing_state  — un .forge/state.json dans un ancêtre : reprise.
 *   2. project_marker  — un marqueur dans le répertoire courant, ou remontée
 *                        courte SI le répertoire courant contient déjà des
 *                        fichiers (donc qu'on est dans un sous-dossier, pas
 *                        dans un projet neuf).
 *   3. cwd             — répertoire de travail tel quel : projet greenfield.
 *
 * Le cas 2 est volontairement conditionnel. Un répertoire vide est un projet
 * qu'on s'apprête à créer : remonter chercher un marqueur chez ses parents
 * reviendrait à ancrer le nouveau projet sur un monorepo ou un projet voisin —
 * exactement le bug d'ancrage erroné qu'on cherche à empêcher.
 */
function resolveAnchor(startPath) {
  const start = path.resolve(startPath);
  const isProject = dir => PROJECT_MARKERS.some(m => fs.existsSync(path.join(dir, m)));
  const chain = [];

  // 1. Un .forge existant dans un ancêtre du répertoire courant gagne : c'est la
  //    reprise d'un projet en cours, y compris si on se trouve dans un sous-dossier.
  let cursor = start;
  for (;;) {
    chain.push(cursor);
    if (fs.existsSync(path.join(cursor, FORGE_DIR, 'state.json'))) {
      return { root: cursor, source: 'existing_state', chain, ascended: chain.length > 1 };
    }
    const parent = path.dirname(cursor);
    if (parent === cursor) break;
    cursor = parent;
  }

  // 2a. Marqueur dans le répertoire courant lui-même.
  if (isProject(start)) return { root: start, source: 'project_marker', chain, ascended: false };

  // 2b. Remontée courte — seulement si le répertoire courant contient déjà des
  //     fichiers, signe qu'on est dans un sous-dossier et non dans un projet neuf.
  if (!isEmptyDir(start)) {
    cursor = start;
    for (let hops = 0; hops < 2; hops++) {
      const parent = path.dirname(cursor);
      if (parent === cursor) break;
      cursor = parent;
      if (isProject(cursor)) return { root: cursor, source: 'project_marker', chain, ascended: true };
    }
  }

  // 3. Aucun marqueur : projet neuf, on utilise le répertoire de travail tel quel.
  return { root: start, source: 'cwd', chain, ascended: false };
}

/* ------------------------------------------------------------------ *
 * state.json
 * ------------------------------------------------------------------ */

function statePath(root) {
  return path.join(root, STATE_PATH);
}

function readState(root) {
  const p = statePath(root);
  if (!fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p, 'utf-8'));
}

function writeState(root, state) {
  fs.mkdirSync(path.join(root, FORGE_DIR), { recursive: true });
  state.version = STATE_VERSION;
  fs.writeFileSync(statePath(root), JSON.stringify(state, null, 2) + '\n');
}

function ensureLayout(root) {
  const dirs = [
    FORGE_DIR,
    `${FORGE_DIR}/design`,
    `${FORGE_DIR}/design/screens`,
    `${FORGE_DIR}/plans`,
    `${FORGE_DIR}/audit`
  ];
  for (const d of dirs) fs.mkdirSync(path.join(root, d), { recursive: true });
}

function deliverables(state) {
  return state.deliverables || {};
}

function findDeliverableByPath(state, relPath) {
  const target = path.normalize(relPath);
  for (const [key, d] of Object.entries(deliverables(state))) {
    if (d.path && path.normalize(d.path) === target) return key;
  }
  return null;
}

/* ------------------------------------------------------------------ *
 * Audit (append-only)
 * ------------------------------------------------------------------ */

function appendLog(root, event) {
  const p = path.join(root, AUDIT_PATHS.log);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  const entry = { ts: new Date().toISOString(), ...event };
  fs.appendFileSync(p, JSON.stringify(entry) + '\n');
  return entry;
}

function readLog(root) {
  const p = path.join(root, AUDIT_PATHS.log);
  if (!fs.existsSync(p)) return [];
  return fs.readFileSync(p, 'utf-8')
    .split('\n')
    .filter(Boolean)
    .map(line => { try { return JSON.parse(line); } catch { return null; } })
    .filter(Boolean);
}

/* ------------------------------------------------------------------ *
 * Détection de livrables égarés (hors .forge)
 * ------------------------------------------------------------------ */

const DELIVERABLE_MARKERS = [
  'type: prd', 'type: roadmap', 'type: architecture', 'type: design-system',
  'type: implementation-plan', 'type: test-plan', 'type: screen',
  'type: benchmarks', 'type: conventions', 'forge_id:'
];

/** Reconnaît un fichier généré par Forge grâce à son front matter. */
function looksLikeForgeDeliverable(filePath) {
  if (/\.forge[\\/]/.test(filePath)) return false;
  let head;
  try {
    const fd = fs.openSync(filePath, 'r');
    const buf = Buffer.alloc(512);
    const read = fs.readSync(fd, buf, 0, 512, 0);
    fs.closeSync(fd);
    head = buf.slice(0, read).toString('utf-8');
  } catch {
    return false;
  }
  if (!head.startsWith('---')) return false;
  return DELIVERABLE_MARKERS.some(m => head.includes(m));
}

module.exports = {
  FORGE_DIR, STATE_PATH, STATE_VERSION, AUDIT_PATHS, NON_DELIVERABLE_DIRS,
  CANONICAL_LAYOUT, STATUS_VOCAB, ALLOWED_STATE_KEYS, FORBIDDEN_STATE_KEYS, FINDING_DOMAINS,
  out, fail,
  splitFrontMatter, serializeFrontMatter, readFrontMatter, writeFrontMatter, normalizeBody,
  sha12, contentHash,
  toAbs, isInside, listFilesRecursive,
  resolveAnchor,
  statePath, readState, writeState, ensureLayout, deliverables, findDeliverableByPath,
  appendLog, readLog,
  looksLikeForgeDeliverable,
  PHASE_KEYS, PHASE_REQUIREMENTS, missingPhaseRequirements
};
