#!/usr/bin/env node
'use strict';

/**
 * state.js — lecture / écriture de `<anchor>/.forge/state.json` (schéma v2).
 *
 * Règles structurantes :
 *   1. Tout passe par lib/forge-lib.js. Aucune écriture hors de `<anchor>/.forge/`.
 *   2. `state.json` est l'AUTORITÉ pour le statut d'un livrable. Le front matter
 *      YAML du fichier est un MIROIR, écrit uniquement par `set-status`.
 *      Le modèle ne modifie jamais `status:` à la main.
 *   3. `content_hash` porte sur le CORPS du document (hors front matter) :
 *      changer un statut n'invalide donc jamais le hash d'un plan.
 *   4. Aucun contenu de document ici — uniquement métadonnées, IDs, chemins, hashes.
 *      (Invariant vérifié par forge-guard.js via FORBIDDEN_STATE_KEYS.)
 *
 * Toutes les commandes impriment du JSON sur stdout et sortent non-zéro en cas d'échec.
 */

const fs = require('fs');
const path = require('path');
const L = require('./lib/forge-lib');

const SKILL_VERSION = '2.0.0';

const STATUSABLE_KINDS = ['deliverable', 'screen', 'slice', 'foundation', 'phase'];

// Le contrat de phase vit dans forge-lib : forge-guard.js doit voir exactement
// la même règle, sinon le contrôle et le gate peuvent diverger — et c'est le
// contrôle qui ПREDIT le désaccord.
const PHASE_KEYS = L.PHASE_KEYS;
const missingRequirements = L.missingPhaseRequirements;

/* ------------------------------------------------------------------ *
 * Chargement
 * ------------------------------------------------------------------ */

function isV1(state) {
  return !!state && (state.version === 1 || !!state.documents);
}

/**
 * Charge state.json en refusant explicitement un fichier v1.
 * On ne migre jamais implicitement : une migration silencieuse peut
 * perdre de l'information. Le message dit exactement quoi lancer.
 */
function loadState(root) {
  const state = L.readState(root);
  if (!state) {
    L.fail({
      error: 'no_state',
      message: `Aucun state.json dans ${L.statePath(root)}`,
      hint: `node scripts/state.js init ${root} "<NomProduit>"`
    });
  }
  if (isV1(state)) {
    L.fail({
      error: 'legacy_state_v1',
      version: state.version,
      path: L.statePath(root),
      message: 'state.json est au schéma v1. Il doit être migré avant toute opération.',
      hint: `node scripts/state.js migrate ${root}`
    });
  }
  return state;
}

function save(root, state, event) {
  L.writeState(root, state);
  if (event) L.appendLog(root, event);
  return state;
}

/* ------------------------------------------------------------------ *
 * Cible de statut : entrée d'état + fichier miroir éventuel
 * ------------------------------------------------------------------ */

const KIND_BUCKET = {
  deliverable: state => state.deliverables || (state.deliverables = {}),
  screen: state => state.screens || (state.screens = {}),
  slice: state => state.slices || (state.slices = {}),
  foundation: state => state.foundations || (state.foundations = {})
};

/** Clé de chemin qui porte le document miroir, par genre d'entrée. */
function pathKeyFor(kind, entry) {
  if (kind === 'slice' || kind === 'foundation') return entry.plan_path || null;
  return entry.path || null;
}

function resolveTarget(state, kind, key) {
  if (kind === 'phase') {
    const entry = (state.phases || {})[key];
    return { kind, key, entry, relPath: null };
  }
  const bucket = KIND_BUCKET[kind];
  if (!bucket) {
    L.fail({ error: 'unknown_kind', kind, expected: STATUSABLE_KINDS });
  }
  const entry = bucket(state)[key];
  if (!entry) {
    L.fail({
      error: 'unknown_entry', kind, key,
      known: Object.keys(bucket(state))
    });
  }
  return { kind, key, entry, relPath: pathKeyFor(kind, entry) };
}

/** Vocabulaire de statut applicable à chaque genre d'entrée. */
const STATUS_VOCAB_KEY = {
  phase: 'phase',
  deliverable: 'document',
  screen: 'document',
  slice: 'slice',
  foundation: 'slice'
};

function assertStatus(kind, status) {
  const vocabKey = STATUS_VOCAB_KEY[kind];
  if (!vocabKey) {
    L.fail({ error: 'unknown_kind', kind, expected: STATUSABLE_KINDS });
  }
  const vocab = L.STATUS_VOCAB[vocabKey];
  if (!vocab.includes(status)) {
    L.fail({ error: 'invalid_status', kind, status, vocabulary: vocabKey, allowed: vocab });
  }
  return status;
}

/**
 * Écrit le statut dans le front matter du fichier miroir.
 * Le corps n'est jamais touché : c'est ce qui garantit que le
 * content_hash reste valide après un simple changement de statut.
 */
function mirrorStatusToFile(root, relPath, status) {
  const abs = L.toAbs(root, relPath);
  if (!fs.existsSync(abs)) {
    return { mirrored: false, reason: 'file_missing', path: relPath };
  }
  const fm = L.readFrontMatter(abs);
  if (!fm) {
    return {
      mirrored: false,
      reason: 'no_front_matter',
      path: relPath,
      hint: 'Créer le livrable depuis un template (templates/*.tmpl) : le front matter est obligatoire.'
    };
  }
  const before = fm.data.status;
  if (before === status) return { mirrored: true, changed: false, path: relPath, status };

  L.writeFrontMatter(abs, { ...fm.data, status });
  return { mirrored: true, changed: true, path: relPath, from: before, to: status };
}

/* ------------------------------------------------------------------ *
 * Journal d'audit
 * ------------------------------------------------------------------ */

function audit(state, type, message, extra = {}) {
  state.audit = state.audit || { counts: {} };
  state.audit.counts = state.audit.counts || {};
  state.audit.counts[type] = (state.audit.counts[type] || 0) + 1;
  return { type, message, ...extra };
}

/* ------------------------------------------------------------------ *
 * anchor
 * ------------------------------------------------------------------ */

/**
 * Recense les projets déclarés comme référence par des projets Forge voisins.
 *
 * Un projet de référence n'a pas forcément de `.forge/` lui-même : c'est
 * souvent un projet legacy analysé en lecture seule. Or c'est précisément le
 * cas dangereux — sans `.forge/`, `resolveAnchor` le sélectionne via son
 * marqueur de projet, et l'anchor finit par pointer le legacy.
 *
 * La recherche est volontairement BORNNÉE : on ne regarde que les répertoires
 * entre le point de départ et le parent de l'anchor, plus les frères de l'anchor.
 * Un balayage récursif libre remonterait jusqu'à `/` et scannerait la machine.
 */
function declaredReferencesNear(start, anchor) {
  const found = new Map();
  const parent = path.dirname(anchor);
  const dirs = new Set();

  // 1. Du point de départ jusqu'au parent de l'anchor inclus.
  let cursor = path.resolve(start);
  for (let hops = 0; hops < 8; hops++) {
    dirs.add(cursor);
    if (cursor === parent) break;
    const up = path.dirname(cursor);
    if (up === cursor) break;
    cursor = up;
  }
  dirs.add(parent);

  // 2. Les frères de l'anchor : un projet de référence est souvent un voisin
  //    du projet courant, déclaré par celui-ci.
  try {
    for (const entry of fs.readdirSync(parent, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      if (entry.name === 'node_modules' || entry.name === '.git') continue;
      dirs.add(path.join(parent, entry.name));
    }
  } catch {
    return found;
  }

  for (const dir of dirs) {
    let state;
    try {
      state = L.readState(dir);
    } catch {
      continue;
    }
    if (!state) continue;
    for (const ref of state.reference_projects || []) {
      if (ref && ref.path) found.set(path.resolve(ref.path), { declared_by: dir, name: ref.name });
    }
  }
  return found;
}

function cmdAnchor(startPath) {
  const start = path.resolve(startPath || process.cwd());
  const { root, source, chain, ascended } = L.resolveAnchor(start);

  // Les projets de référence sont des cibles de LECTURE. Si l'anchor tombe
  // dessus, c'est exactement le bug de hijack que resolveAnchor doit empêcher.
  const state = L.readState(root);
  const ownRefs = (state && state.reference_projects) || [];
  const nearby = declaredReferencesNear(start, root);

  const hijack = nearby.get(path.resolve(root)) ||
    (ownRefs.some(r => r && r.path && path.resolve(r.path) === root) ? { declared_by: root, name: path.basename(root) } : null);

  const result = {
    command: 'anchor',
    start,
    anchor: root,
    source,
    ascended: !!ascended,
    searched: chain,
    forge_dir: path.join(root, L.FORGE_DIR),
    state_exists: !!state,
    reference_projects: ownRefs,
    warning: hijack
      ? `BLOCKED : l'anchor résolu (${root}) est un projet de référence déclaré${hijack.declared_by && hijack.declared_by !== root ? ` par ${hijack.declared_by}` : ''}. Reprends depuis le répertoire du projet courant.`
      : ascended
        ? `ATTENTION : l'anchor a été résolu par REMONTÉE depuis ${start}. Vérifie que c'est bien le projet courant avant d'écrire quoi que ce soit.`
        : null
  };

  if (hijack) {
    try {
      L.appendLog(root, { type: 'anchor_hijack_blocked', resolved: root, start, declared_by: hijack.declared_by });
    } catch { /* le journal ne doit jamais faire échouer anchor */ }
    L.fail(result);
  }
  L.out(result);
}

/* ------------------------------------------------------------------ *
 * init
 * ------------------------------------------------------------------ */

function cmdInit(rootArg, productName, references) {
  const { root, source } = L.resolveAnchor(rootArg || process.cwd());

  if (L.readState(root)) {
    L.fail({
      error: 'already_initialized',
      path: L.statePath(root),
      hint: 'Utilise `status` pour reprendre, ou `migrate` si le fichier est en v1.'
    });
  }

  L.ensureLayout(root);

  const now = new Date().toISOString();
  const state = {
    version: L.STATE_VERSION,
    forge_skill_version: SKILL_VERSION,
    product: {
      name: productName || path.basename(root),
      created_at: now,
      description: '',
      archetype: null
    },
    project: {
      path: root,
      anchor_source: source,
      stack: {},
      package_manager: null,
      testing: {}
    },
    reference_projects: (references || []).map(p => ({
      name: path.basename(p),
      path: path.resolve(p),
      role: 'reference',
      read_only: true,
      granted_at: now
    })),
    run: {
      id: `run-${Date.now().toString(36)}`,
      started_at: now,
      mode: 'guided',
      fast_track: null
    },
    current_phase: '0',
    phases: Object.fromEntries(
      PHASE_KEYS.map(k => [k, { status: 'not_started' }])
    ),
    deliverables: {},
    index: {},
    screens: {},
    foundations: {},
    modules: {},
    slices: {},
    gates_pending: [],
    audit: {
      log: L.AUDIT_PATHS.log,
      issues: L.AUDIT_PATHS.issues,
      metrics: L.AUDIT_PATHS.metrics,
      counts: {}
    },
    divergences: []
  };

  state.phases['0_bootstrap'].status = 'in_progress';
  audit(state, 'init', 'Projet initialisé', { anchor: root, anchor_source: source });

  save(root, state, {
    type: 'init',
    anchor: root,
    anchor_source: source,
    product: state.product.name,
    references: state.reference_projects.map(r => r.path)
  });

  L.out({
    command: 'init',
    status: 'initialized',
    anchor: root,
    anchor_source: source,
    state_path: L.statePath(root),
    layout: [
      L.FORGE_DIR, `${L.FORGE_DIR}/design`, `${L.FORGE_DIR}/design/screens`,
      `${L.FORGE_DIR}/plans`, `${L.FORGE_DIR}/audit`
    ],
    reference_projects: state.reference_projects
  });
}

/* ------------------------------------------------------------------ *
 * register
 * ------------------------------------------------------------------ */

function cmdRegister(root, kind, key, relPath, type, opts) {
  const state = loadState(root);
  const canonical = L.CANONICAL_LAYOUT[key];

  // Garde-fou n°1 : rien ne sort de .forge
  const abs = L.toAbs(root, relPath);
  if (!L.isInside(path.join(root, L.FORGE_DIR), abs)) {
    L.appendLog(root, { type: 'register_rejected', reason: 'outside_forge_dir', path: relPath, key });
    L.fail({
      error: 'outside_forge_dir',
      path: relPath,
      resolved: abs,
      rule: `Tout livrable Forge doit être écrit dans <anchor>/${L.FORGE_DIR}/.`,
      canonical_hint: canonical || null
    });
  }

  // Garde-fou n°2 : pas de chemin canonique concurrent
  if (canonical && path.normalize(canonical) !== path.normalize(relPath)) {
    L.appendLog(root, { type: 'register_rejected', reason: 'non_canonical_path', path: relPath, expected: canonical });
    L.fail({
      error: 'non_canonical_path',
      key,
      given: relPath,
      expected: canonical,
      rule: 'Le chemin canonique de ce livrable est fixé par CANONICAL_LAYOUT.'
    });
  }

  const bucket = KIND_BUCKET[kind];
  if (!bucket) L.fail({ error: 'unknown_kind', kind, expected: STATUSABLE_KINDS });

  const existing = bucket(state)[key];
  const fm = fs.existsSync(abs) ? L.readFrontMatter(abs) : null;
  const fileStatus = fm && fm.data.status ? fm.data.status : 'draft';

  const entry = existing || {};
  entry.path = relPath;
  entry.type = type || (fm && fm.data.type) || key;
  entry.status = entry.status || fileStatus;
  entry.content_hash = L.contentHash(abs);
  entry.updated_at = new Date().toISOString();
  if (fm && fm.data.version) entry.version = fm.data.version;
  if (fm && fm.data.slice) entry.slice = fm.data.slice;

  // Les prémisses dont ce livrable dépend. C'est la dépendance que rien ne
  // déclarait, et qui rendait invisible le défaut le plus coûteux : un
  // livrable approuvé se justifie par une exigence qu'un artefact postérieur a
  // retirée. `consistency-check premises` compare ces IDs à l'état réel du PRD.
  if (opts && opts.requires !== undefined) {
    const list = String(opts.requires)
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);
    if (!list.length) {
      L.fail({
        error: 'empty_requires',
        key,
        hint: '--requires attend au moins un ID de règle (B1, C2…).'
      });
    }
    entry.requires = list;
  }
  if (opts && opts.amendedBy) entry.amended_by = String(opts.amendedBy).trim();

  bucket(state)[key] = entry;
  audit(state, 'register', `Livrable enregistré : ${key}`, { kind, path: relPath });

  save(root, state, { type: 'register', deliverable: key, path: relPath, kind });

  L.out({
    command: 'register', kind, key, path: relPath,
    status: entry.status, content_hash: entry.content_hash,
    requires: entry.requires || []
  });
}

/* ------------------------------------------------------------------ *
 * set-status  — le point de bascule de la synchronisation
 * ------------------------------------------------------------------ */

function cmdSetStatus(root, kind, key, status) {
  const state = loadState(root);
  assertStatus(kind, status);
  const { entry, relPath } = resolveTarget(state, kind, key);

  const previous = entry.status ?? null;
  entry.status = status;
  entry.updated_at = new Date().toISOString();

  let mirror = null;
  if (relPath) {
    mirror = mirrorStatusToFile(root, relPath, status);
    if (mirror.mirrored) {
      entry.content_hash = L.contentHash(L.toAbs(root, relPath));
    }
    if (!mirror.mirrored) {
      state.divergences.push({
        ts: new Date().toISOString(),
        kind, key, path: relPath,
        state_status: status,
        file_status: null,
        reason: mirror.reason,
        resolved: false
      });
    }
  }

  audit(state, 'status_change', `${kind}/${key} : ${previous ?? '∅'} → ${status}`, { kind, key });

  save(root, state, { type: 'status_change', kind, key, from: previous, to: status, mirrored: mirror });

  L.out({
    command: 'set-status',
    kind, key,
    from: previous,
    to: status,
    mirrored: mirror
  });
}

/* ------------------------------------------------------------------ *
 * set-phase / complete-phase
 * ------------------------------------------------------------------ */

function cmdSetPhase(root, phaseKey, status) {
  const state = loadState(root);
  if (!state.phases[phaseKey]) {
    L.fail({ error: 'unknown_phase', phase: phaseKey, expected: PHASE_KEYS });
  }
  // Passer une phase en `approved` par ce raccourci ne doit pas contourner le
  // contrat : c'est le même geste que `complete-phase`.
  if (status === 'approved') {
    const missing = missingRequirements(state, phaseKey);
    if (missing.length) {
      L.fail({
        error: 'phase_incomplete',
        phase: phaseKey,
        missing,
        hint: 'Utilise `complete-phase` une fois les livrables enregistrés, ouproduis-les.',
        rule: 'Une phase qui n\'a rien produit ne peut pas être approuvée : le contrôle vert ' +
              'sur zéro livrable déclaré donne l\'illusion d\'une base vérifiée.'
      });
    }
  }
  const previous = state.phases[phaseKey].status;
  state.phases[phaseKey].status = status;
  if (status === 'approved') state.phases[phaseKey].completed_at = new Date().toISOString();
  state.current_phase = String(parseInt(phaseKey.split('_')[0], 10));
  audit(state, 'phase_status', `${phaseKey} : ${previous} → ${status}`);

  save(root, state, { type: 'phase_status', phase: phaseKey, from: previous, to: status });
  L.out({ command: 'set-phase', phase: phaseKey, from: previous, to: status, current_phase: state.current_phase });
}

function cmdCompletePhase(root, phaseKey) {
  const state = loadState(root);
  if (!state.phases[phaseKey]) {
    L.fail({ error: 'unknown_phase', phase: phaseKey, expected: PHASE_KEYS });
  }
  const idx = PHASE_KEYS.indexOf(phaseKey);

  // Le gate valide un livrable, pas une intention. Une phase sans livrable ne
  // peut pas être approuvée : sinon les phases suivantes s'appuient sur une base
  // qui n'existe pas, et le contrôle vert de `forge-guard` — qui ne valide que
  // les livrables *déclarés* — confirme le vide au lieu de le signaler.
  const missing = missingRequirements(state, phaseKey);
  if (missing.length) {
    L.fail({
      error: 'phase_incomplete',
      phase: phaseKey,
      missing,
      deliverables_present: Object.keys(state.deliverables || {}),
      hint: `Enregistre les livrables manquants avant d'approuver : ` +
        `node scripts/state.js register ${root} deliverable <clé> <chemin>`,
      rule: 'Approuver une phase qui n\'a rien produit transfère le défaut en aval, ' +
            'où il devient indétectable.'
    });
  }

  state.phases[phaseKey].status = 'approved';
  state.phases[phaseKey].completed_at = new Date().toISOString();
  state.current_phase = idx < PHASE_KEYS.length - 1 ? String(idx + 1) : String(PHASE_KEYS.length);
  audit(state, 'gate_approved', `Phase approuvée : ${phaseKey}`);

  save(root, state, { type: 'gate_approved', phase: phaseKey, next_phase: state.current_phase });
  L.out({ command: 'complete-phase', phase: phaseKey, next_phase: state.current_phase });
}

/* ------------------------------------------------------------------ *
 * hash
 * ------------------------------------------------------------------ */

function cmdHash(root, key) {
  const state = loadState(root);
  const entry = (state.deliverables || {})[key];
  if (!entry) L.fail({ error: 'unknown_deliverable', key, known: Object.keys(state.deliverables || {}) });

  const abs = L.toAbs(root, entry.path);
  const hash = L.contentHash(abs);
  if (hash === null) L.fail({ error: 'file_not_found', path: entry.path });
  entry.content_hash = hash;
  entry.updated_at = new Date().toISOString();

  save(root, state, { type: 'hash', deliverable: key, content_hash: hash });
  L.out({ command: 'hash', key, path: entry.path, content_hash: hash });
}

/* ------------------------------------------------------------------ *
 * sync  — réconcilie state.json (autorité) ↔ front matter (miroir)
 * ------------------------------------------------------------------ */

/** Liste tous les livrables porteurs d'un statut + leur chemin. */
function collectStatusFiles(state) {
  const out = [];
  for (const [key, entry] of Object.entries(state.deliverables || {})) {
    if (entry.path) out.push({ kind: 'deliverable', key, relPath: entry.path, stateStatus: entry.status });
  }
  for (const [key, entry] of Object.entries(state.screens || {})) {
    if (entry.path) out.push({ kind: 'screen', key, relPath: entry.path, stateStatus: entry.status });
  }
  for (const [key, entry] of Object.entries(state.slices || {})) {
    if (entry.plan_path) out.push({ kind: 'slice', key, relPath: entry.plan_path, stateStatus: entry.status });
  }
  for (const [key, entry] of Object.entries(state.foundations || {})) {
    if (entry.plan_path) out.push({ kind: 'foundation', key, relPath: entry.plan_path, stateStatus: entry.status });
  }
  return out;
}

function cmdSync(root, fix) {
  const state = loadState(root);
  const items = collectStatusFiles(state);
  const found = [];

  for (const item of items) {
    const abs = L.toAbs(root, item.relPath);
    if (!fs.existsSync(abs)) {
      found.push({ ...item, fileStatus: null, reason: 'file_missing' });
      continue;
    }
    const fm = L.readFrontMatter(abs);
    if (!fm) {
      found.push({ ...item, fileStatus: null, reason: 'no_front_matter' });
      continue;
    }
    const fileStatus = fm.data.status || null;
    if (fileStatus !== item.stateStatus) {
      found.push({ ...item, fileStatus, reason: 'status_mismatch' });
    }
  }

  let fixed = 0;
  if (fix) {
    for (const f of found) {
      if (f.reason === 'status_mismatch') {
        mirrorStatusToFile(root, f.relPath, f.stateStatus);
        f.resolved = true;
        fixed++;
      }
    }
    // On purge les divergences résolues, on conserve les non repairables.
    state.divergences = (state.divergences || []).filter(d => !d.resolved);
  }

  const remaining = fix ? found.filter(f => !f.resolved) : found;

  const event = audit(state, 'sync', `Synchronisation : ${found.length} divergence(s)`, {
    found: found.length, fixed, mode: fix ? 'fix' : 'report'
  });

  for (const f of found) {
    state.divergences.push({
      ts: new Date().toISOString(),
      kind: f.kind, key: f.key, path: f.relPath,
      state_status: f.stateStatus ?? null,
      file_status: f.fileStatus ?? null,
      reason: f.reason,
      resolved: !!f.resolved
    });
  }

  save(root, state, { type: 'sync', found: found.length, fixed, divergences: found });

  L.out({
    command: 'sync',
    authority: 'state.json',
    checked: items.length,
    divergences: fix && fixed ? remaining : found,
    fixed,
    pass: remaining.length === 0
  });
  if (remaining.length > 0) process.exit(1);
}

/* ------------------------------------------------------------------ *
 * check-stale
 * ------------------------------------------------------------------ */

/**
 * Déclarer les dépendances d'une slice ou d'une fondation.
 *
 * Le graphe de dépendances est l'entrée de `dependency-check`, qui calcule les
 * vagues d'implémentation et détecte les cycles. Mais jusqu'ici, rien ne
 * pouvait écrire cette entrée : il fallait éditer `state.json` à la main.
 *
 * Or `state-schema.md` affirme que `depends_on` est écrit par
 * `dependency-check --write` — qui ne fait que le *calculer*. Le champ était
 * donc censé apparaître tout seul, et son absence ne produisait aucun défaut :
 * un graphe vide est un graphe valide.
 *
 * Conséquence, sur un test grandeur nature : la Phase 4 est la phase qui
 * *produit* le découpage en slices, et son étape 3 consiste à « vérifier le
 * graphe et persister depends_on ». Il n'y avait aucun moyen de le faire. La
 * seule voie restante — éditer le JSON à la main — contredit la règle du skill
 * qui fait de `state.json` une autorité machine.
 */
function cmdDep(root, key, depsArg) {
  const state = loadState(root);
  const slice = (state.slices || {})[key];
  const foundation = (state.foundations || {})[key];
  const entry = slice || foundation;
  if (!entry) {
    L.fail({
      error: 'unknown_slice',
      key,
      known: [...Object.keys(state.slices || {}), ...Object.keys(state.foundations || {})],
      hint: `Déclare la slice d'abord : state.js register ${root} slice ${key} .forge/plans/${key}.md`
    });
  }

  const list = (depsArg || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

  const known = new Set([
    ...Object.keys(state.slices || {}),
    ...Object.keys(state.foundations || {})
  ]);
  const unknown = list.filter(d => !known.has(d));
  if (unknown.length) {
    L.fail({
      error: 'unknown_dependency',
      key,
      unknown,
      known: [...known],
      rule: 'Une dépendance vers une slice inexistante est un graphe faux, pas un graphe ' +
            'incomplet : elle ne sera jamais satisfaite et rien ne le signalera.'
    });
  }
  if (list.includes(key)) {
    L.fail({ error: 'self_dependency', key, rule: 'Une slice ne peut pas dépendre d\'elle-même.' });
  }
  for (const d of list) {
    const target = (state.slices || {})[d] || (state.foundations || {})[d];
    if (target && Array.isArray(target.depends_on) && target.depends_on.includes(key)) {
      L.fail({
        error: 'circular_dependency', key, with: d,
        rule: 'Cette dépendance refermerait un cycle. Corrige avant de persister.'
      });
    }
  }

  entry.depends_on = list;
  entry.updated_at = new Date().toISOString();
  audit(state, 'dependency_declared', `Dépendances de ${key} : ${list.join(', ') || '(aucune)'}`);
  save(root, state, { type: 'dependency_declared', node: key, depends_on: list });

  L.out({ command: 'dep', key, depends_on: list, kind: slice ? 'slice' : 'foundation' });
}

function cmdCheckStale(root, sliceName) {  const state = loadState(root);
  const slice = (state.slices || {})[sliceName];
  if (!slice) L.fail({ error: 'unknown_slice', slice: sliceName, known: Object.keys(state.slices || {}) });

  const reasons = [];
  if (!slice.plan_path) {
    reasons.push('no_plan');
  } else {
    const abs = L.toAbs(root, slice.plan_path);
    if (!fs.existsSync(abs)) {
      reasons.push('plan_file_missing');
    } else {
      const current = L.contentHash(abs);
      if (slice.plan_hash && slice.plan_hash !== current) reasons.push('plan_edited');
      if (!slice.plan_hash) reasons.push('plan_hash_missing');
      slice.plan_hash = current;
    }
    if (!slice.plan_hash) reasons.push('no_reference_hash');
  }

  // Le plan devient stale si une source déclarée a changé depuis son écriture.
  const upstream = ['prd', 'architecture', 'conventions', 'design_system'];
  const drifted = [];
  for (const key of upstream) {
    const d = (state.deliverables || {})[key];
    if (!d || !d.content_hash) continue;
    const abs = L.toAbs(root, d.path);
    const current = fs.existsSync(abs) ? L.contentHash(abs) : null;
    if (current && current !== d.content_hash) drifted.push(key);
  }
  if (drifted.length) reasons.push('upstream_drifted');

  const stale = reasons.length > 0;
  slice.stale = stale;
  if (stale) slice.stale_reasons = reasons;

  save(root, state, {
    type: stale ? 'stale_detected' : 'stale_clear',
    slice: sliceName,
    reasons,
    drifted
  });

  L.out({ command: 'check-stale', slice: sliceName, stale, reasons, drifted, status: slice.status });
  if (stale) process.exit(1);
}

/* ------------------------------------------------------------------ *
 * migrate  (v1 → v2)
 * ------------------------------------------------------------------ */

const DESIGN_SYSTEM_MOVES = [
  ['.forge/design-system.md', '.forge/design/design-system.md']
];

function cmdMigrate(root) {
  const raw = L.readState(root);
  if (!raw) L.fail({ error: 'no_state', path: L.statePath(root) });
  if (!isV1(raw)) {
    L.out({ command: 'migrate', status: 'noop', version: raw.version, message: 'Déjà au schéma v2.' });
    return;
  }

  const now = new Date().toISOString();
  const moved = [];

  // 1. Déplacements de fichiers vers le layout canonique.
  for (const [from, to] of DESIGN_SYSTEM_MOVES) {
    const absFrom = L.toAbs(root, from);
    if (fs.existsSync(absFrom)) {
      const absTo = L.toAbs(root, to);
      fs.mkdirSync(path.dirname(absTo), { recursive: true });
      fs.renameSync(absFrom, absTo);
      moved.push({ from, to });
    }
  }

  // 2. documents → deliverables
  const deliverables = {};
  for (const [key, doc] of Object.entries(raw.documents || {})) {
    const canonical = L.CANONICAL_LAYOUT[key];
    let p = doc.path;
    if (canonical && moved.some(mm => mm.to === canonical) && p === moved.find(mm => mm.to === canonical).from) {
      p = canonical;
    }
    const abs = L.toAbs(root, p);
    deliverables[key] = {
      ...doc,
      path: p,
      type: key,
      content_hash: L.contentHash(abs),
      updated_at: now,
      migrated_from_v1: true
    };
  }

  // 3. Garante la présence de tous les livrables canoniques
  for (const [key, canonical] of Object.entries(L.CANONICAL_LAYOUT)) {
    if (!deliverables[key]) {
      deliverables[key] = {
        path: canonical,
        type: key,
        status: 'not_started',
        content_hash: null,
        updated_at: now,
        migrated_from_v1: true
      };
    }
  }

  const state = {
    version: L.STATE_VERSION,
    forge_skill_version: SKILL_VERSION,
    product: raw.product || { name: path.basename(root), created_at: now, description: '' },
    project: { ...(raw.project || {}), path: root, anchor_source: 'migrated' },
    reference_projects: raw.reference_projects || [],
    run: raw.run || { id: `run-${Date.now().toString(36)}`, started_at: now, mode: 'guided', fast_track: null },
    current_phase: raw.current_phase || '0',
    phases: raw.phases || Object.fromEntries(PHASE_KEYS.map(k => [k, { status: 'not_started' }])),
    deliverables,
    index: raw.index || {},
    screens: raw.screens || {},
    foundations: raw.foundations || {},
    modules: raw.modules || {},
    slices: raw.slices || {},
    gates_pending: raw.gates_pending || [],
    audit: raw.audit || {
      log: L.AUDIT_PATHS.log, issues: L.AUDIT_PATHS.issues,
      metrics: L.AUDIT_PATHS.metrics, counts: {}
    },
    divergences: []
  };

  audit(state, 'migrate', 'Migration v1 → v2', { moved });

  // 4. Les fichiers déplacés doivent pointer vers leur nouvel emplacement.
  L.writeState(root, state);
  L.appendLog(root, { type: 'migrate', from: 1, to: L.STATE_VERSION, moved, deliverables: Object.keys(deliverables) });

  L.out({
    command: 'migrate',
    status: 'migrated',
    from: 1,
    to: L.STATE_VERSION,
    moved,
    deliverables: Object.fromEntries(
      Object.entries(deliverables).map(([k, v]) => [k, { path: v.path, status: v.status }])
    )
  });
}

/* ------------------------------------------------------------------ *
 * set-nav  (priorisation de la navigation, cf. module-prioritization.md)
 * ------------------------------------------------------------------ */

function cmdSetNav(root, json) {
  const state = loadState(root);
  let payload;
  try {
    payload = JSON.parse(json);
  } catch (e) {
    L.fail({ error: 'invalid_json', detail: e.message });
  }
  if (!Array.isArray(payload.items)) {
    L.fail({ error: 'invalid_nav', expected: '{ "items": [ { "key", "label", "rank", "frequency", "task_criticality", "rationale" } ] }' });
  }

  const seen = new Set();
  payload.items.forEach((it, i) => {
    if (!it.key) L.fail({ error: 'nav_item_missing_key', index: i });
    if (seen.has(it.key)) L.fail({ error: 'nav_duplicate_key', key: it.key });
    seen.add(it.key);
  });

  const overflow = payload.items.filter(it => it.overflow);
  const primary = payload.items.filter(it => !it.overflow);
  if (primary.length > 5) {
    L.appendLog(root, { type: 'nav_overflow', count: primary.length });
    L.fail({
      error: 'too_many_primary_nav_items',
      count: primary.length,
      max: 5,
      rule: 'La navigation principale est plafonnée à 5 items (portée du pouce / lisibilité). Le reste va dans un overflow "Plus".',
      hint: 'Voir references/module-prioritization.md'
    });
  }

  state.index = state.index || {};
  state.index.nav = {
    archetype: payload.archetype || state.product.archetype || null,
    platform: payload.platform || null,
    core_loop: payload.core_loop || null,
    items: payload.items,
    primary_count: primary.length,
    overflow_count: overflow.length,
    rationale: payload.rationale || null,
    updated_at: new Date().toISOString()
  };
  if (payload.archetype) state.product.archetype = payload.archetype;

  audit(state, 'nav_prioritized', `Navigation priorisée : ${primary.length} primary + ${overflow.length} overflow`);

  save(root, state, { type: 'nav_prioritized', archetype: payload.archetype, primary: primary.length, overflow: overflow.length });

  L.out({ command: 'set-nav', nav: state.index.nav });
}

/* ------------------------------------------------------------------ *
 * start — l'état réel en une commande
 * ------------------------------------------------------------------ */

/** Presence réelle : un fichier existe-t-il, et contient-il des cas de test ? */
function sliceReality(root, name, entry) {
  const planRel = entry.plan_path || `${L.FORGE_DIR}/plans/${name}.md`;
  const planAbs = L.toAbs(root, planRel);
  const planExists = fs.existsSync(planAbs);

  // Cherche un fichier de test named after the slice, ou un test qui le cite.
  let testFile = null;
  let testCount = 0;
  const testsRoot = path.join(root, 'test');
  if (fs.existsSync(testsRoot)) {
    const files = L.listFilesRecursive(testsRoot).filter(f => /\.(dart|ts|tsx|js|jsx|py|go|rs|java|kt)$/.test(f));
    const named = files.find(f => path.basename(f).includes(name));
    if (named) {
      testFile = path.relative(root, named);
      const src = fs.readFileSync(named, 'utf-8');
      // Compte les CAS, pas le fichier. « le test existe » ≠ « le test vérifie ».
      const dart = (src.match(/^\s*(test|testWidgets)\s*\(/gm) || []).length;
      const generic = (src.match(/^\s*(it|test|Test|@Test)\s*[({\[]/gm) || []).length;
      testCount = dart + generic;
    }
  }

  return {
    status: entry.status,
    plan: planRel,
    plan_exists: planExists,
    test: testFile,
    test_count: testCount,
    // Un statut « fait » sans test est le défaut le plus coûteux : il rend le
    // fichier de suivi faux sans aucun signal.
    suspect: /^(approved|done|validated|implemented)$/.test(entry.status || '') && testCount === 0
  };
}

function readSiblingMemory(root) {
  const read = (rel) => {
    const p = path.join(root, rel);
    return fs.existsSync(p) ? fs.readFileSync(p, 'utf-8') : null;
  };

  const memory = { present: false, files: {} };

  const agents = read('AGENTS.md');
  if (agents) {
    memory.present = true;
    memory.files.AGENTS_MD = true;
    const dod = agents.match(/## Definition of Done([\s\S]*?)\n## /);
    memory.dod_items = dod ? (dod[1].match(/^\d+\.\s/gm) || []).length : 0;
    const escalation = agents.match(/## Escalation Rules([\s\S]*?)\n## /);
    memory.escalation = !!escalation;
  }

  const decisions = read('DECISIONS.md');
  if (decisions) {
    memory.files.DECISIONS_MD = true;
    const entries = decisions.match(/^## ADR-\d+/gm) || [];
    const open = (decisions.match(/^- \*\*Status:\*\* Open/gm) || []).length;
    const superseded = (decisions.match(/^- \*\*Status:\*\* Superseded/gm) || []).length;
    memory.adrs = entries.length;
    memory.adrs_open = open;
    memory.adrs_superseded = superseded;
    // Un décompte écrit en dur dans l'entry file devient faux : le signaler.
    const claimed = agents && agents.match(/(\w+|\d+)\s+(?:entries are closed|ADR)/i);
    if (claimed) memory.adrs_claimed_in_agents_md = true;
  }

  const learnings = read('LEARNINGS.md');
  if (learnings) {
    memory.files.LEARNINGS_MD = true;
    const entries = learnings.match(/^- \d{4}-\d{2}-\d{2}\s*:/gm) || [];
    memory.learnings = entries.length;
    // Le store existe mais rien n'est encore promu : c'est un journal, pas des règles.
    const placeholder = /no entries yet|-\s*\(none/i.test(learnings);
    memory.learnings_placeholder = placeholder && entries.length > 0;
    // Champ domaine : sans lui, aucune promotion n'est routable.
    const withDomain = entries.filter((_, i) => {
      const line = learnings.split('\n').find(l => /^- \d{4}-\d{2}-\d{2}\s*:/.test(l));
      return line && /\b(domain|→|->)\b/.test(line);
    }).length;
    memory.learnings_total = entries.length;
  }

  const rulesDir = path.join(root, '.opencode', 'rules');
  if (fs.existsSync(rulesDir)) {
    memory.files.RULES_DIR = true;
    memory.rule_files = fs.readdirSync(rulesDir).filter(f => f.endsWith('.md')).length;
  }

  return memory;
}

function cmdStart(rootArg) {
  const { root, source, ascended } = L.resolveAnchor(rootArg || process.cwd());
  const state = L.readState(root);

  if (!state) {
    L.out({
      command: 'start',
      anchor: root,
      anchor_source: source,
      state_exists: false,
      next: 'Phase 0 — Bootstrap. Lance : node scripts/state.js init ' + root + ' "<NomProduit>"'
    });
    return;
  }
  if (isV1(state)) {
    L.fail({
      command: 'start',
      error: 'legacy_state_v1',
      hint: `node scripts/state.js migrate ${root}`,
      reference: 'references/migration-v1-v2.md'
    });
  }

  const slices = Object.entries(state.slices || {}).map(([name, e]) => ({ name, ...sliceReality(root, name, e) }));
  const suspects = slices.filter(s => s.suspect);

  const stale = [];
  for (const [key, d] of Object.entries(state.deliverables || {})) {
    if (!d.content_hash || !d.path) continue;
    const current = L.contentHash(L.toAbs(root, d.path));
    if (current && current !== d.content_hash) stale.push({ deliverable: key, reason: 'content_drift' });
  }

  const unpromoted = (state.findings || []).filter(f => !f.promoted_to && f.status !== 'resolved');

  const phases = state.phases || {};
  const currentIdx = parseInt(String(state.current_phase ?? '0').split('_')[0], 10) || 0;
  const pendingPhase = PHASE_KEYS.find(k => (phases[k] || {}).status !== 'approved');

  L.out({
    command: 'start',
    anchor: root,
    anchor_source: source,
    ascended: !!ascended,
    product: state.product.name,
    archetype: state.product.archetype,
    mode: (state.run || {}).mode,
    autonomy: (state.run || {}).autonomy || 'milestone',

    phase: {
      current: state.current_phase,
      next_phase: pendingPhase || 'complete',
      status: pendingPhase ? (phases[pendingPhase] || {}).status : null
    },

    deliverables: Object.fromEntries(Object.entries(state.deliverables || {}).map(([k, d]) => [k, d.status])),
    stale_deliverables: stale,
    open_divergences: (state.divergences || []).filter(d => !d.resolved).length,
    gates_pending: (state.gates_pending || []).length,

    slices: {
      total: slices.length,
      by_status: slices.reduce((acc, s) => { acc[s.status] = (acc[s.status] || 0) + 1; return acc; }, {}),
      // Slices déclarées faites sans aucun cas de test : le défaut le plus coûteux,
      // parce qu'il rend le fichier faux SANS SIGNAL.
      suspect: suspects.map(s => ({ name: s.name, status: s.status, test_count: 0, plan_exists: s.plan_exists }))
    },

    unpromoted_findings: {
      count: unpromoted.length,
      items: unpromoted.slice(0, 10).map(f => ({ id: f.id, domain: f.domain || null, severity: f.severity, origin: f.origin, summary: (f.summary || '').slice(0, 120) })),
      missing_domain: unpromoted.filter(f => !f.domain).length
    },

    project_memory: readSiblingMemory(root),

    last_events: L.readLog(root).slice(-5).map(e => ({ ts: e.ts, type: e.type, message: e.message })),

    next_actions: [
      suspects.length ? `REVOIR ${suspects.length} slice(s) marquée(s) terminée(s) sans test — ne pas les compter comme faites.` : null,
      stale.length ? `Documents ${stale.length} en dérive de hash : node scripts/forge-guard.js hash-check ${root}` : null,
      unpromoted.length ? `${unpromoted.length} constat(s) non promu(s) — cf. references/skill-boundaries.md` : null,
      (state.divergences || []).some(d => !d.resolved) ? 'Divergences état/front-matter ouvertes : node scripts/forge-guard.js sync ' + root + ' --fix' : null
    ].filter(Boolean)
  });
}

/* ------------------------------------------------------------------ *
 * finding — un constat routé, avec domaine
 * ------------------------------------------------------------------ */

function cmdFinding(root, args) {
  const state = loadState(root);
  // Drapeaux : accepte `--key=valeur` ET `--key valeur`. Un drapeau nu
  // (`--fix`) vaut true. Sans ce second cas, `--resolve F-001` perdait
  // silencieusement son identifiant.
  const flags = {};
  const positional = [];
  for (let i = 0; i < (args || []).length; i++) {
    const a = args[i];
    if (!a.startsWith('--')) { positional.push(a); continue; }
    const eq = a.indexOf('=');
    if (eq > 0) {
      flags[a.slice(2, eq)] = a.slice(eq + 1);
    } else {
      const next = args[i + 1];
      if (next && !next.startsWith('--')) { flags[a.slice(2)] = next; i++; }
      else flags[a.slice(2)] = true;
    }
  }

  if (flags.resolve) {
    const f = (state.findings || []).find(x => x.id === flags.resolve);
    if (!f) L.fail({ error: 'unknown_finding', id: flags.resolve });
    f.status = 'resolved';
    if (flags['promoted-to']) {
      f.promoted_to = flags['promoted-to'];
      f.resolved_at = new Date().toISOString();
    }
    audit(state, 'finding_promoted', `${f.id} → ${f.promoted_to || 'clos sans promotion'}`, { id: f.id });
    save(root, state, { type: 'finding_promoted', id: f.id, promoted_to: f.promoted_to || null });
    L.out({ command: 'finding', action: 'resolve', id: f.id, promoted_to: f.promoted_to || null });
    return;
  }

  const [summary, correction] = positional;

  // Le domaine est obligatoire : sans cible, le constat ne peut pas être promu.
  if (!flags.domain) {
    L.appendLog(root, { type: 'finding_without_domain', summary: summary || null });
    L.fail({
      error: 'missing_domain',
      message: 'Un constat sans domaine ne peut pas être promu : il reste un journal, pas une règle.',
      required: '--domain=<fichier de règles visé>',
      accepted: L.FINDING_DOMAINS,
      hint: 'Si le constat ne concerne aucune règle (bug, divergence, incident), il va dans .forge/audit/issues.md — pas ici.'
    });
  }
  if (!L.FINDING_DOMAINS.includes(flags.domain)) {
    L.fail({
      error: 'unknown_domain',
      domain: flags.domain,
      accepted: L.FINDING_DOMAINS,
      hint: 'Le domaine doit nommer le fichier de règles qui portera la règle. Ajouter un domaine non routable, c\'est créer un constat qui ne sera jamais promu.'
    });
  }
  if (!summary) L.fail({ error: 'missing_summary' });

  state.findings = state.findings || [];
  const n = state.findings.length + 1;
  const finding = {
    id: `F-${String(n).padStart(3, '0')}`,
    domain: flags.domain,
    severity: flags.severity || 'mineur',
    origin: flags.origin || 'forge',
    status: 'open',
    summary,
    correction: correction || null,
    artifact: positional[2] || null,
    raised_at: new Date().toISOString(),
    promoted_to: null,
    resolved_at: null
  };
  state.findings.push(finding);

  audit(state, 'finding_raised', `${finding.id} [${finding.domain}] ${summary}`, { id: finding.id, domain: finding.domain });
  save(root, state, { type: 'finding_raised', id: finding.id, domain: finding.domain, severity: finding.severity });

  L.out({
    command: 'finding',
    action: 'raise',
    finding,
    next: `Promouvoir : node scripts/state.js finding ${root} --resolve ${finding.id} --promoted-to=${flags.domain}`
  });
}

/* ------------------------------------------------------------------ *
 * status
 * ------------------------------------------------------------------ */

function cmdStatus(root) {
  const state = loadState(root);
  const byStatus = {};
  for (const slice of Object.values(state.slices || {})) {
    byStatus[slice.status] = (byStatus[slice.status] || 0) + 1;
  }
  const deliv = {};
  for (const [k, d] of Object.entries(state.deliverables || {})) {
    deliv[k] = d.status;
  }

  L.out({
    command: 'status',
    product: state.product.name,
    archetype: state.product.archetype,
    anchor: state.project.path,
    mode: (state.run || {}).mode,
    current_phase: state.current_phase,
    phases: state.phases,
    deliverables: deliv,
    screens_count: Object.keys(state.screens || {}).length,
    slices_by_status: byStatus,
    foundations_count: Object.keys(state.foundations || {}).length,
    open_divergences: (state.divergences || []).filter(d => !d.resolved).length,
    gates_pending: (state.gates_pending || []).length,
    audit_counts: (state.audit || {}).counts || {}
  });
}

/* ------------------------------------------------------------------ *
 * log
 * ------------------------------------------------------------------ */

function cmdLog(root, type, message, pairs) {
  const state = L.readState(root);
  const extra = {};
  for (const pair of pairs || []) {
    const i = pair.indexOf('=');
    if (i > 0) extra[pair.slice(0, i)] = pair.slice(i + 1);
  }
  const entry = L.appendLog(root, { type, message, ...extra });
  if (state) {
    audit(state, type, message, extra);
    L.writeState(root, state);
  }
  L.out({ command: 'log', entry });
}

/* ------------------------------------------------------------------ *
 * CLI
 * ------------------------------------------------------------------ */

const USAGE = {
  start: 'state.js start [root]                              # l\'état RÉEL en une commande — À FAIRE EN PREMIER',
  anchor: 'state.js anchor [start-path]                       # résout l\'anchor (protège contre un projet Legacy)',
  init: 'state.js init [root] [product-name] [--reference <p>] # crée .forge/ + state.json v2',
  register: 'state.js register <root> <deliverable|screen|slice|foundation> <key> <rel-path> [type]',
  'set-status': 'state.js set-status <root> <kind> <key> <status>   # ÉCRIT state.json ET le front matter',
  'set-phase': 'state.js set-phase <root> <phase-key> <status>',
  'complete-phase': 'state.js complete-phase <root> <phase-key>',
  hash: 'state.js hash <root> <deliverable-key>',
  sync: 'state.js sync <root> [--fix]                       #.state.json = autorité',
  'check-stale': 'state.js check-stale <root> <slice>',
    'dep': 'state.js dep <root> <slice|foundation> <a,b,c>   # déclare le graphe — à faire AVEC dependency-check --write',
  migrate: 'state.js migrate <root>                        # v1 → v2',
  'set-nav': 'state.js set-nav <root> <json>',
  finding: 'state.js finding <root> --domain=<règle> --severity=<s> --origin=<o> "<fait>" "<correction>"',
  resolve: 'state.js finding <root> --resolve <id> --promoted-to=<règle>',
  status: 'state.js status <root>',
  log: 'state.js log <root> <type> <message> [k=v ...]'
};

function main() {
  const argv = process.argv.slice(2);
  const command = argv[0];
  const positional = argv.slice(1).filter(a => !a.startsWith('--'));
  const flags = argv.slice(1).filter(a => a.startsWith('--'));

  if (!command || command === '--help' || command === 'help') {
    L.out({ usage: USAGE });
    return;
  }

  switch (command) {
    case 'anchor': return cmdAnchor(positional[0]);
    case 'init': {
      const refs = [];
      for (const f of flags) if (f.startsWith('--reference=')) refs.push(f.slice('--reference='.length));
      return cmdInit(positional[0], positional[1], refs);
    }
    case 'dep': return cmdDep(positional[0], positional[1], positional[2]);
    case 'register': {
      // `--requires` et `--amended-by` sont des dépendances déclarées, pas des
      // options de confort : sans elles, un livrable approuvé peut reposer sur
      // une prémisse retirée par un artefact postérieur, et rien ne le voit.
      const extra = {};
      for (const f of flags) {
        if (f.startsWith('--requires=')) extra.requires = f.slice('--requires='.length);
        if (f === '--requires') extra.requires = '__next__';
        if (f.startsWith('--amended-by=')) extra.amendedBy = f.slice('--amended-by='.length);
      }
      if (extra.requires === '__next__') {
        const i = argv.indexOf('--requires');
        extra.requires = argv[i + 1];
      }
      return cmdRegister(positional[0], positional[1], positional[2], positional[3], positional[4], extra);
    }
    case 'set-status': return cmdSetStatus(positional[0], positional[1], positional[2], positional[3]);
    case 'set-phase': return cmdSetPhase(positional[0], positional[1], positional[2]);
    case 'complete-phase': return cmdCompletePhase(positional[0], positional[1]);
    case 'hash': return cmdHash(positional[0], positional[1]);
    case 'sync': return cmdSync(positional[0], flags.includes('--fix'));
    case 'check-stale': return cmdCheckStale(positional[0], positional[1]);
    case 'migrate': return cmdMigrate(positional[0]);
    case 'set-nav': return cmdSetNav(positional[0], positional[1]);
    case 'start': return cmdStart(positional[0]);
    // finding a besoin des drapeaux : on lui passe l'argv brut, pas la liste filtrée.
    case 'finding': return cmdFinding(positional[0], argv.slice(2));
    case 'status': return cmdStatus(positional[0]);
    case 'log': return cmdLog(positional[0], positional[1], positional[2], positional.slice(3));
    default:
      L.fail({ error: 'unknown_command', command, usage: USAGE });
  }
}

main();
