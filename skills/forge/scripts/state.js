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
// contrôle qui PRÉDIT le désaccord.
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
      hint: `node "$FORGE/scripts/state.js" init ${root} "<NomProduit>"`
    });
  }
  if (isV1(state)) {
    L.fail({
      error: 'legacy_state_v1',
      version: state.version,
      path: L.statePath(root),
      message: 'state.json est au schéma v1. Il doit être migré avant toute opération.',
      hint: `node "$FORGE/scripts/state.js" migrate ${root}`
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

/** La clé connue la plus proche, par distance d'édition. */
function closestKey(key, known) {
  let best = null;
  let bestDist = Infinity;
  for (const k of known) {
    const d = editDistance(String(key).toLowerCase(), k.toLowerCase());
    if (d < bestDist) { bestDist = d; best = k; }
  }
  // Au-delà de 3, ce n'est plus une faute de frappe, c'est une autre chose.
  return bestDist <= 3 ? best : null;
}

function editDistance(a, b) {
  const m = a.length, n = b.length;
  if (!m) return n;
  if (!n) return m;
  let prev = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    const cur = [i];
    for (let j = 1; j <= n; j++) {
      cur[j] = Math.min(
        prev[j] + 1,
        cur[j - 1] + 1,
        prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
    prev = cur;
  }
  return prev[n];
}

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

  // Garde-fou n°1 bis : une clé de livrable connue.
  //
  // Le test de chemin est `if (canonical && …)` : une clé inconnue donne
  // `undefined`, le test passe, et un livrable est enregistré sous un nom que
  // rien ne reconnaîtra jamais. Le document existe, son fichier passe les
  // contrôles de contenu, et aucun gate ne le voit.
  //
  // Constaté sur un test grandeur nature, en ouvrant FastTrack : la porte
  // exige `design_system` et répond « jamais enregistré », alors que le livrable
  // était bien là sous la clé `design-system`. Les deux orthographes sont
  // plausibles à l'oreille, et rien ne tranche avant qu'il soit trop tard —
  // c'est-à-dire au moment du gate.
  if (kind === 'deliverable' && !canonical) {
    const suggestion = closestKey(key, Object.keys(L.CANONICAL_LAYOUT));
    L.appendLog(root, { type: 'register_rejected', reason: 'unknown_deliverable_key', key });
    L.fail({
      error: 'unknown_deliverable_key',
      key,
      known: Object.keys(L.CANONICAL_LAYOUT),
      suggestion: suggestion || null,
      rule: 'Un livrable sous une clé inconnue n\'est vu par aucun gate : son fichier ' +
            'passe, son contenu passe, et la phase qui l\'attend ne le trouvera pas.'
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

  // Garde-fou n°3 : on n'enregistre pas le travail d'une phase qu'on n'a pas
  // atteinte. Sans lui, l'ordre des phases n'est qu'une consigne : un
  // `architecture.md` et quinze plans se sont écrits pendant que le design
  // portait `draft`, et les douze contrôles passaient — parce qu'aucun ne sait
  // à quelle phase un artefact appartient. Ce refus est le seul endroit où la
  // règle devient impossible à contourner sans laisser de trace.
  const early = L.isPrematureArtifact(state, kind, key);
  if (early) {
    L.appendLog(root, { type: 'register_rejected', reason: 'premature_artifact', kind, key, phase: early.phase });
    L.fail({
      error: 'premature_artifact',
      kind, key,
      artifact_phase: early.phase,
      current_phase: state.current_phase,
      why: early.why,
      rule: 'Un artefact appartient à une phase. On ne l\'enregistre pas avant d\'avoir atteint ' +
            'cette phase : c\'est précisément ce qui donne un sens au mot « approuvé ». ' +
            'Un livrable produit en avance repose sur une base qui n\'a pas été validée, ' +
            'et aucun garde-fou ne peut le voir.',
      fix: `node "$FORGE/scripts/state.js" set-phase ${root} ${early.phase} in_progress`
    });
  }

  const existing = bucket(state)[key];
  const fm = fs.existsSync(abs) ? L.readFrontMatter(abs) : null;
  const fileStatus = fm && fm.data.status ? fm.data.status : 'draft';

  const entry = existing || {};
  entry.path = relPath;
  // Pour une slice et une fondation, le chemin du PLAN est `plan_path`. Tout le
  // reste l'attend : `set-status` (le miroir), `collectStatusFiles`, `start`,
  // `consistency`, `forge-guard paths`.
  //
  // `register` n'écrivait que `path`. Conséquence mesurée : `set-status` sur une
  // slice ne trouvait pas de chemin, n'écrivait donc aucun front matter — et
  // n'enregistrait pas de divergence non plus, puisque rien ne manquait à ses
  // yeux. Le statut vivait dans l'état et le `.md` disait `draft` : un écart
  // silencieux, et le contrôle de synchronisation ne le voyait pas parce qu'il
  // regardait le même champ vide.
  // Pour une slice et une fondation, le chemin du PLAN est `plan_path`. Tout le
  // reste l'attend : `set-status` (le miroir), `collectStatusFiles`, `start`,
  // `consistency`, `forge-guard paths`.
  //
  // `register` n'écrivait que `path`. Conséquence mesurée : `set-status` sur une
  // slice ne trouvait pas de chemin, n'écrivait donc aucun front matter — et
  // n'enregistrait pas de divergence non plus, puisque rien ne manquait à ses
  // yeux. Le statut vivait dans l'état et le `.md` disait `draft` : un écart
  // silencieux, et le contrôle de synchronisation ne le voyait pas parce qu'il
  // regardait le même champ vide.
  //
  // ## Pourquoi le chemin du plan n'est PAS le chemin du document d'architecture
  //
  // Écrire `plan_path = relPath` quand `relPath` est `.forge/architecture.md`
  // produisait deux dérives, mesurées sur Onduleur, à l'enregistrement des 15
  // slices de la Phase 4 :
  //
  // 1. `no_premature_artifacts` les signalait toutes « plan écrit avant la phase 5 »,
  //    parce que la règle de propriété lit `entry.plan_path` — donc **l'architecture
  //    était prise pour le plan de chaque slice**. Le garde-fou n'était pas faux :
  //    l'entrée mentait.
  // 2. `set-status` sur une slice écrivait le statut d'un plan dans le front matter
  //    de l'**architecture**, dont le statut appartient à un autre artefact.
  //
  // Le plan d'une slice est un fichier de la **Phase 5**. Une slice déclarée en
  // Phase 4 est déclarée **sans** plan, et c'est la forme normale : elle est
  // décrite dans le document d'architecture, pas implémentée. Donc `plan_path`
  // n'est écrit que si le fichier enregistré est un fichier de plan — et il est
  // alors écrit tel qu'il a été donné, sans devinette.
  // Le hash du plan est **distinct** du `content_hash` de l'entrée, et c'est la
  // seule chose qui distingue « un plan a été écrit » de « une slice a été
  // décrite ». Les deux s'enregistrent au même endroit, donc le même hash ; et un
  // hash de plan ne prouve rien du plan, il prouve que le **fichier de plan** a
  // changé.
  if (kind === 'slice' || kind === 'foundation') {
    if (L.isPlanPath(relPath)) {
      entry.plan_path = relPath;
      entry.plan_hash = L.contentHash(abs);
    } else if (existing && existing.plan_path) {
      entry.plan_path = existing.plan_path;
    }
  }
  entry.type = type || (fm && fm.data.type) || key;
  entry.status = entry.status || fileStatus;
  entry.content_hash = L.contentHash(abs);
  // La carte des titres numerotes est la **reference de renumerotation** : sans
  // elle, le premier amendement d'un artefact pourrait renumeroter librement,
  // puisque rien ne saurait dire ce qui a change. C'est la meme raison que
  // `content_hash` : on memorise la forme au moment ou l'artefact entre.
  //
  // Un artefact peut etre enregistre **avant** d'etre ecrit — c'est un
  // workflow legitime, et `check-stale` sait lire `plan_file_missing`. Lire le
  // fichier sans garde ferait echouer un enregistrement qui fonctionnait.
  if (fs.existsSync(abs)) entry.headings = numberedHeadings(fs.readFileSync(abs, 'utf8'));
  else delete entry.headings;
  entry.updated_at = new Date().toISOString();
  if (fm && fm.data.version) entry.version = fm.data.version;
  if (fm && fm.data.slice) entry.slice = fm.data.slice;

  // `derived_from` est recopié dans l'AUTORITÉ, en chemins déjà résolus.
  //
  // `fast-track.md` prescrit aux validateurs de lire « l'artefact + son
  // `derived_from` ». Or tant que la valeur ne vit que dans le front matter,
  // cette consigne n'est pas applicable : le validateur doit ouvrir le
  // document qu'il doit valider pour découvrir son propre périmètre. Sur le
  // projet de test, `state.json → slices.<clé>` ne portait aucun
  // `derived_from`, et le seul moyen de connaître son périmètre était de
  // lire le document — c'est-à-dire d'accomplir ce qu'on demande de faire.
  //
  // Un contrat qui dépend d'une lecture humaine du document qu'il doit
  // valider n'est pas un contrat outillé.
  if (fm && Object.prototype.hasOwnProperty.call(fm.data, 'derived_from')) {
    const resolved = L.resolveDerivedFrom(root, fm.data.derived_from);
    if (resolved.length) entry.derived_from = resolved;
  }

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
      const abs2 = L.toAbs(root, relPath);
      entry.content_hash = L.contentHash(abs2);
      // La reference de renumerotation se prend a l'approbation, pas seulement a
      // l'enregistrement : c'est la version **approuvee** que les autres artefacts
      // citent par numero. Une version jamais approuvee n'a pas de reference.
      if (status === 'approved' && fs.existsSync(abs2)) {
        entry.headings = numberedHeadings(fs.readFileSync(abs2, 'utf8'));
      }
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
        `node "$FORGE/scripts/state.js" register ${root} deliverable <clé> <chemin>`,
      rule: 'Approuver une phase qui n\'a rien produit transfère le défaut en aval, ' +
            'où il devient indétectable.'
    });
  }

  // **Le contrat bloque la sortie de la Phase 0**, et c'est le bon moment.
  //
  // Sans cette règle, le contrôle `contract_complete` ne verrait l'absence qu'une fois
  // la phase franchie : le projet ferait tout son travail, le gate passerait au vert,
  // puis passerait au rouge **après** l'instant où l'agent aurait pu agir. Un défaut
  // qui n'apparaît qu'une fois la fenêtre fermée est un défaut qu'on apprend à ignorer.
  //
  // Clore la Phase 0, c'est le client qui signe. Donc le contrat doit être
  // **`approved`** à cet instant — pas seulement présent.
  //
  // Ce commentaire disait le contraire : *« `draft` suffit pour franchir, parce
  // qu'un contrat non signé est un travail en cours, et un contrat absent n'en est
  // pas un. »* C'était une distinction fine et juste… qui ne s'appliquait qu'aux
  // deux premiers mots. Le troisième existait déjà : **clore la phase, c'est
  // signer**. La règle laissait donc passer un `draft`, la phase s'avançait, et
  // `contract_complete` exigeait ensuite `approved` — deux documents du même
  // skill en désaccord, dont l'un ouvrait une porte que l'autre fermait.
  //
  // Le choix est net : `draft` franchissait en **annonçant** une signature que
  // rien n'enregistrait. Le client ne signe pas un `state.json`.
  if (phaseKey === '0_bootstrap') {
    const contract = (state.deliverables || {}).contract;
    if (!contract) {
      L.fail({
        error: 'no_contract',
        phase: phaseKey,
        why: 'La Phase 0 se termine par un contrat : c\'est là que le client signe ce qui est livré, ce qui ne l\'est pas, et ce qui engage un achat. Sans lui, la promesse « après la signature, le client n\'intervient plus » n\'a personne derrière.',
        hint: 'node "$FORGE/scripts/state.js" register ' + root + ' deliverable contract .forge/contract.md',
        rule: 'Un contrôle qui n\'apparaît qu\'après la fenêtre d\'action est un contrôle qu\'on apprend à ignorer. Celui-ci tombe au moment de clore la phase.'
      });
    }
    if (contract.status !== 'approved') {
      L.fail({
        error: 'contract_not_signed',
        phase: phaseKey,
        state: contract.status,
        why: 'Clore la Phase 0 EST la signature. Le contrat est enregistré mais son statut est `' +
             contract.status + '` : la phase s\'avancerait en annonçant une signature que personne n\'a faite, et ' +
             '`contract_complete` la refuserait juste après — deux portes du même skill en désaccord.',
        hint: 'Faire signer, puis node "$FORGE/scripts/state.js" set-status ' + root + ' deliverable contract approved',
        rule: 'Un `draft` est un travail en cours ; clore la phase est une signature. Confondre les deux permet de franchir une porte en mentant sur ce qui l\'a ouverte.'
      });
    }
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
  // `hash` doit porter sur TOUT ce qui porte un `content_hash`, pas seulement les
  // livrables. Les écrans et les plans de slice sont enregistrables au même titre,
  // et leurs hashs sont vérifiés par `forge-guard` — donc ils doivent être
  // remettables à jour par la même commande. Sinon la seule façon de corriger une
  // dérive est de réenregistrer, ce qui n'est pas la commande documentée.
  const buckets = [
    ['deliverable', state.deliverables || {}],
    ['screen', state.screens || {}],
    ['slice', state.slices || {}],
    ['foundation', state.foundations || {}]
  ];
  let kind = null;
  let entry = null;
  for (const [k, bucket] of buckets) {
    if (bucket[key]) { kind = k; entry = bucket[key]; break; }
  }
  if (!entry) {
    L.fail({
      error: 'unknown_entry', key,
      known: buckets.map(([k, b]) => ({ kind: k, keys: Object.keys(b) }))
    });
  }

  const relPath = entry.path || entry.plan_path;
  const abs = L.toAbs(root, relPath);
  const hash = L.contentHash(abs);
  if (hash === null) L.fail({ error: 'file_not_found', path: relPath });
  entry.content_hash = hash;
  entry.updated_at = new Date().toISOString();

  save(root, state, { type: 'hash', kind, entry: key, content_hash: hash });
  L.out({ command: 'hash', kind, key, path: relPath, content_hash: hash });
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

function entryFor(state, item) {
  const bucket = item.kind === 'deliverable' ? state.deliverables
    : item.kind === 'screen' ? state.screens
      : item.kind === 'slice' ? state.slices : state.foundations;
  return (bucket || {})[item.key];
}

function cmdSync(root, fix) {
  const state = loadState(root);
  const items = collectStatusFiles(state);
  const found = [];

  for (const item of items) {
    const abs = L.toAbs(root, item.relPath);
    if (!fs.existsSync(abs)) {
      const entry = entryFor(state, item);
      if (!entry || !entry.content_hash) continue;
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

    // `derived_from` est recopié dans l'autorité à chaque sync. C'est aussi
    // ce qui **remplit les entrées enregistrées avant que la propagation
    // existe** : le champ ne vivait que dans le front matter, donc invisible
    // de `state.json`.
    const entry = entryFor(state, item);
    if (entry && Object.prototype.hasOwnProperty.call(fm.data, 'derived_from')) {
      const resolved = L.resolveDerivedFrom(root, fm.data.derived_from);
      if (resolved.length) {
        const same = Array.isArray(entry.derived_from) &&
          entry.derived_from.length === resolved.length &&
          resolved.every(v => entry.derived_from.includes(v));
        if (!same) entry.derived_from = resolved;
      }
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
  // Fondations comprises : voir `resolveGraphNode`. Sans cela, FastTrack — qui
  // prescrit ce script — ne pouvait pas valider F1 ni F4.
  const { entry: slice } = L.resolveGraphNode(state, sliceName);
  slice.plan_path = slice.plan_path || slice.path || `.forge/plans/${sliceName}.md`;

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

  // **Les quatre noms sont en MAJUSCULES** : `AGENTS.md`, `SESSION_LOG.md`,
  // `DECISIONS.md`, `LEARNINGS.md`. C'est la convention de PRA depuis le début, et
  // une convention_seule est un motif — les quatre se lisent d'un coup d'œil, et
  // `AGENTS.md` se distingue des `.opencode/rules/*.md` qui sont en minuscules.
  //
  // J'ai abaissé ces quatre noms en minuscules en croyant corriger un lecteur mort,
  // et c'était l'inverse : c'est **moi** qui l'avais tué. Un fichier `AGENTS.md` et un
  // `AGENTS.md` ne sont pas le même fichier sur un système de fichiers sensible à la
  // casse, et un lecteur qui cherche le mauvais nom renvoie `present: false` sur un
  // projet dont la mémoire existe — la pire des réponses, parce qu'elle est fausse
  // sans être suspecte. Constaté à l'exécution de l'appel 1, sur les quatre fichiers
  // réellement produits.
  const agents = read('AGENTS.md');
  if (agents) {
    memory.present = true;
    memory.files.AGENTS_MD = true;
    const dod = agents.match(/## Definition of Done([\s\S]*?)\n## /);
    memory.dod_items = dod ? (dod[1].match(/^\d+\.\s/gm) || []).length : 0;
    const escalation = agents.match(/## Escalation Rules([\s\S]*?)\n## /);
    memory.escalation = !!escalation;
    // **Les déclencheurs.** Une mémoire que rien ne déclenche est un décor : le
    // fichier existe, il est structuré, et il reste vide parce que personne ne sait
    // QUAND y écrire.
    //
    // Compter les **mentions** ne prouverait rien : l'index décrit déjà les trois
    // fichiers, donc `mentions: 3` est compatible avec un scaffold entièrement
    // dépourvu de déclencheur — c'est-à-dire avec la défaillance exacte qu'on cherche
    // à voir. Ce qu'on compte, c'est la **co-occurrence** d'un nom de fichier et d'un
    // cue de condition dans la même ligne : la description et le déclencheur sur la
    // même ligne, ce qui est la forme que le mode scaffold produit.
    //
    // Limite assumée : c'est un contrôle de **présence**, pas de justesse. Un cue mal
    // choisi passe. Il attrape l'oubli — la ligne du tableau qui dit ce que contient
    // un fichier sans jamais dire ce qui y écrit — et l'oubli est le cas réel.
    //
    // **Deux formes de déclencheur, et la seconde n'était pas lue.** Le lexique
    // ci-dessous ne contient que des adverbes : `quand`, `si`, `avant`, `une fois`.
    // Or le meilleur déclencheur n'est pas un adverbe, c'est une **condition** — et
    // « tu tranches quelque chose qu'une session future rediscuterait » n'en contient
    // aucun, alors que c'est exactement ce que la ligne doit dire. « Corrections »
    // est une description ; « la deuxième fois que tu te trompes » est un
    // déclencheur ; et ni l'une ni l'autre ne passe par un adverbe.
    //
    // Constaté sur `Atelier` : `triggers_named` est passé de 3 à 1 après réécriture
    // de l'index, et les deux lignes comptées « sans déclencheur » étaient les deux
    // meilleures. Un lexique d'adverbes confond une description d'adverbe avec une
    // absence de condition.
    //
    // Donc : **colonne non vide dans une ligne de tableau**, ou lexique. La colonne
    // est structurelle et déterministe — c'est la forme que le gabarit prescrit.
    const CUES = /\b(quand|lorsque|à chaque|au début|à la fin|après|avant|si|dès|une fois|chaque fois|tant que|tout de suite|every|when|after|before|on each|each time)\b/i;
    const MEMORY_FILES = ['SESSION_LOG.md', 'DECISIONS.md', 'LEARNINGS.md'];
    // Une ligne de tableau `| fichier | description | déclencheur |` : trois cellules
    // séparées, dont la troisième non vide. Le nombre impair de cellules viendrait
    // d'une cellule contenant une barre non échappée — on l'accepte, la troisième
    // reste non vide dans les deux cas.
    const troisiemeCellule = (line) => {
      const cells = line.split('|').map(c => c.trim());
      return cells.length >= 4 && cells[3].length > 0;
    };
    memory.memory_indexed = MEMORY_FILES.filter(f => agents.includes(f)).length;
    memory.triggers_named = MEMORY_FILES.filter(f =>
      agents.split('\n').some(line =>
        line.includes(f) && (CUES.test(line) || troisiemeCellule(line)))).length;
    // Le compte et le déclencheur ne se déduisent pas l'un de l'autre : un fichier
    // décrit sans être jamais nommé ailleurs est le cas « présent, jamais écrit ».
    memory.memory_described_not_triggered = memory.memory_indexed - memory.triggers_named;
  }

  const sessionLog = read('SESSION_LOG.md');
  if (sessionLog) {
    memory.files.SESSION_LOG_MD = true;
    // `#{2,3}` et non `##` : le journal place ses entrées en `###` sous une section
    // `## Sessions`, et un compteur qui ne lit que `##` répond **0 sur un journal
    // rempli**. Constaté le jour où le tout premier événement a été écrit : deux
    // entrées, zéro comptée, et la réponse « aucune session » est un mensonge
    // courant parce qu'elle ressemble à un projet qui démarre.
    //
    // C'est la quatrième fois de cette session qu'un motif trop étroit lit un
    // document comme vide. Le meme predicat doit accepter ce que l'auteur écrit
    // réellement, ou il ne mesure rien.
    memory.sessions = (sessionLog.match(/^#{2,3}\s+\d{4}-\d{2}-\d{2}/gm) || []).length;
  }

  const decisions = read('DECISIONS.md');
  if (decisions) {
    memory.files.DECISIONS_MD = true;
    const entries = decisions.match(/^## ADR-\d+/gm) || [];

    // **Un seul motif pour le champ `Status`, deux usages.** Le comptage des ADR et le
    // comptage des questions ouvertes lisent le même champ du même fichier : leur
    // donner deux motifs, c'est leur permettre de diverger sans que rien ne le dise.
    //
    // Le second supposait `Status: Open` en clair pendant que le premier supposait
    // `**Status:** Open` en gras. Sur le fichier réellement produit par le socle, qui
    // écrit la forme claire, le second répondait **0 sur dix questions ouvertes** — et
    // « zéro question ouverte » sur un projet qui en a dix est un mensonge de la
    // famille de F-48 : un motif plus étroit que ce que le document écrit.
    //
    // Le motif tolère les deux formes et **ancre sur la valeur** (`Open`, `Closed`)
    // plutôt que sur la décoration, pour qu'un document écrit dans l'une ou dans
    // l'autre forme soit lu pareil.
    //
    // **Et il tolère maintenant les DEUX LANGUES.** Le motif ne portait que `Status:`,
    // alors que les documents sont en français et écrivent `Statut :` — la forme du
    // gabarit `DECISIONS.md` de `project-rules-architect`, et celle qu'un agent
    // français écrit sans y penser. Constaté sur `Atelier` : `adrs_open` est tombé de
    // 6 à 0 après réécriture, non parce que les questions avaient disparu mais parce
    // qu'elles s'appelaient désormais `Statut`.
    //
    // C'est exactement la faute que ce motif corrigeait déjà, une ligne plus haut :
    // **un motif plus étroit que ce que le document écrit.** Il l'avait été pour la
    // décoration, il l'est pour la langue, puis pour la typographie : le dépôt entier
    // écrit `**Statut** : Open` avec une espace avant le deux-points — c'est la
    // typographie française, et tous les gabarits du skill la suivent. Le motif exigeait
    // `Statut:` sans espace, donc il ne lisait **aucun** des documents du dépôt.
    //
    // Trois narrowings successifs sur le même champ : décoré / non, langue / non,
    // typographie / non. Le jeton doit être écrit dans le document, et un jeton que
    // personne ne devine n'est pas un jeton.
    const STATUT = /\*{0,2}(?:Statut|Status)\*{0,2}\s*:\s*\*{0,2}\s*(\w+)/g;
    const statuts = [...decisions.matchAll(STATUT)].map(m => m[1].toLowerCase());
    memory.adrs = entries.length;
    memory.adrs_open = statuts.filter(v => v === 'open').length;
    // `superseded` et `supersede` selon la langue du mot.
    memory.adrs_superseded = statuts.filter(v => v === 'superseded' || v === 'supersede').length;
    // Le socle n'écrit pas d'ADR : il écrit des **questions ouvertes**, parce que la
    // stack n'est pas décidée. Compter les deux séparément évite de lire « aucune
    // décision » là où il y a dix questions en attente — et « rien à décider » est
    // précisément l'état normal d'un projet qui démarre.
    memory.questions_open = memory.adrs_open;
    // Un décompte écrit en dur dans l'entry file devient faux : le signaler.
    const claimed = agents && agents.match(/(\w+|\d+)\s+(?:entries are closed|ADR)/i);
    if (claimed) memory.adrs_claimed_in_agents_md = true;
  }

  const learnings = read('LEARNINGS.md');
  if (learnings) {
    memory.files.LEARNINGS_MD = true;
    // Une entrée de correctif commence par `- <date>` puis **anything** : le gabarit
    // et le document de référence écrivent `- 2026-09-29 — …` avec un tiret cadratin,
    // et le motif exigeait un deux-points. Les documents du dépôt ne sont donc pas
    // comptés, et `learnings: 0` sur un fichier de quatorze corrections est un mensonge
    // de la même famille.
    //
    // On exige quand même un séparateur après la date — sinon `- 2026-09-29` seul, ou
    // une date citée en prose dans une puce, serait compté comme une entrée. C'est la
    // borne étroite de la correction : un tiret, un deux-points ou une espace.
    const entries = learnings.match(/^- \d{4}-\d{2}-\d{2}\s*(?:—|–|-|:|\s)\s*\S/gm) || [];
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
      next: 'Phase 0 — Bootstrap. Lance : node "$FORGE/scripts/state.js" init ' + root + ' "<NomProduit>"'
    });
    return;
  }
  if (isV1(state)) {
    L.fail({
      command: 'start',
      error: 'legacy_state_v1',
      hint: `node "$FORGE/scripts/state.js" migrate ${root}`,
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

  /**
   * Livrables approuvés qui n'ont pas déclaré leurs prémisses.
   *
   * `consistency-check premises` signale déjà l'omission — mais seulement si
   * on pense à le lancer. L'Étape 0 est la seule commande que tout le monde
   * lance, donc c'est le seul endroit où l'information est rendue impossible à
   * manquer.
   *
   * La conséquence n'est pas cosmétique : une prémisse non déclarée est une
   * prémisse **non vérifiable**. Un livrable peut rester approuvé sur une
   * exigence que le PRD a retirée, sans que personne ne le sache. Constaté sur
   * un test grandeur nature : `conventions.md` justifiait cinq décisions par une
   * exigence retirée en Phase 1, et `--requires` ne mentionnait pas l'ID.
   */
  const undeclaredPremises = Object.entries(state.deliverables || {})
    .filter(([k, d]) => k !== 'prd' && (d.status === 'approved' || d.status === 'in_review'))
    .filter(([, d]) => !Array.isArray(d.requires) || !d.requires.length)
    .map(([k, d]) => ({ deliverable: k, path: d.path, status: d.status }));

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
    // Le mode affiché est celui du **mode réel**, pas celui d'une chaîne laissée
    // à `init`. `run.mode` vaut `guided` depuis `init` et rien ne le remettait à
    // jour : FastTrack était activé, enregistré, journalisé — et `status`
    // annonçait `guided`. Une reprise se lisait donc le mode à l'envers.
    // Constaté en ouvrant FastTrack sur un projet réel.
    mode: (state.run || {}).fast_track && state.run.fast_track.enabled
      ? 'fast-track'
      : ((state.run || {}).mode || 'guided'),
    autonomy: ((state.run || {}).fast_track || {}).autonomy ||
      (state.run || {}).autonomy || 'milestone',

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

    // Une prémisse non déclarée est une prémisse non vérifiable : ce livrable
    // peut reposer sur une exigence que le PRD a retirée sans que rien ne le voie.
    undeclared_premises: {
      count: undeclaredPremises.length,
      items: undeclaredPremises,
      hint: undeclaredPremises.length
        ? 'node "$FORGE/scripts/state.js" register <anchor> deliverable <clé> <chemin> --requires=B1,C1'
        : null
    },

    project_memory: readSiblingMemory(root),

    // Les points de contact ouverts, et **ceux dont l'échéance est passée**.
    //
    // Construit ici, et pas seulement dans `state.js client --list`, parce que
    // `--list` n'est jamais lancé spontanément : c'est la commande que l'on pense à
    // demander, donc celle que l'on oublie. Un point en retard qui n'apparaît que
    // dans une commande optionnelle est un point en retard que personne ne voit, et
    // l'échéance qu'il portait n'a servi à rien.
    client_points: (() => {
      const pts = ((state.client || {}).points || []);
      const ouverts = pts.filter(p => !p.answered_at);
      const overdue = ouverts.filter(p => p.by && new Date(p.by) < new Date());
      return {
        total: pts.length,
        open: ouverts.length,
        overdue: overdue.map(p => p.id),
        items: ouverts.slice(0, 10).map(p => ({
          id: p.id, kind: p.kind, what: p.what.slice(0, 120), by: p.by,
          overdue: !!(p.by && new Date(p.by) < new Date()),
          if_no_answer: p.if_no_answer
        })),
        // Un point en retard n'est pas une question à poser : c'est une décision
        // que Forge doit appliquer, et le dire est la moitié du travail.
        // Le `next` **cite la clause**, pas seulement l'identifiant. Nommer `C-001`
      // oblige l'agent à relire le fichier pour savoir quoi faire — et au moment où
      // le point est en retard, personne ne relit un fichier, on applique. La clause
      // est l'information ; l'identifiant n'est que le moyen de la refermer ensuite.
      next: overdue.length
        ? `POINT CLIENT EN RETARD (${overdue.map(p => p.id).join(', ')}) — appliquer « ${overdue[0].if_no_answer} », puis : node "$FORGE/scripts/state.js" client <root> --answer ${overdue[0].id}`
        : (ouverts.length ? `Point(s) client en attente : node "$FORGE/scripts/state.js" client <root> --list` : null)
      };
    })(),

    last_events: L.readLog(root).slice(-5).map(e => ({ ts: e.ts, type: e.type, message: e.message })),

    next_actions: [
      suspects.length ? `REVOIR ${suspects.length} slice(s) marquée(s) terminée(s) sans test — ne pas les compter comme faites.` : null,
      stale.length ? `Documents ${stale.length} en dérive de hash : node "$FORGE/scripts/forge-guard.js" hash-check ${root}` : null,
      undeclaredPremises.length ? `${undeclaredPremises.length} livrable(s) approuvé(s) sans prémisse déclarée — leur justification n'est pas vérifiable : node "$FORGE/scripts/consistency-check.js" premises ${root}` : null,
      unpromoted.length ? `${unpromoted.length} constat(s) non promu(s) — cf. references/skill-boundaries.md` : null,
      (state.divergences || []).some(d => !d.resolved) ? 'Divergences état/front-matter ouvertes : node "$FORGE/scripts/forge-guard.js" sync ' + root + ' --fix' : null,
      (() => {
        const ouverts = ((state.client || {}).points || []).filter(p => !p.answered_at);
        if (!ouverts.length) return null;
        const enRetard = ouverts.filter(p => p.by && new Date(p.by) < new Date());
        if (enRetard.length) {
          return `${enRetard.length} point(s) client EN RETARD (${enRetard.map(p => p.id).join(', ')}) — le silence n'est pas une approbation : appliquer « ${enRetard[0].if_no_answer} »`;
        }
        return `${ouverts.length} point(s) client en attente — node "$FORGE/scripts/state.js" client ${root} --list`;
      })()
    ].filter(Boolean)
  });
}

/* ------------------------------------------------------------------ *
 * finding — un constat routé, avec domaine
 * ------------------------------------------------------------------ */

/** Drapeaux : `--key=valeur` ET `--key valeur`. Un drapeau nu vaut `true`. */
function parseFlags(args) {
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
  return { flags, positional };
}

/* ------------------------------------------------------------------ *
 * fast-track — la position du mode, pour qu'une reprise sache où s'arrêter
 * ------------------------------------------------------------------ */

/**
 * La section « Reprise » de `fast-track.md` dokumentait une forme
 * (`enabled`, `entered_at`, `current_artifact`, `attempts`, `checkpoint_reached`) et
 * promettait : *« une invocation interrompue reprend exactement où elle s'était
 * arrêtée, sans revalider ce qui est `approved` »*.
 *
 * Aucun écritur. `run.fast_track` restait `null` pour toujours, et la forme documentée
 * n'était atteignable qu'à la main — donc jamais. Même famille que la porte d'entrée
 * absente : une section de la référence qui décrit un état que rien ne peut produire.
 *
 * ## Ce que cette commande ne fait pas
 *
 * Elle **n'active** rien et ne décide de rien. Elle enregistre, et elle **journalise**.
 * Deux raisons, et elles sont liées :
 *
 * 1. La décision d'entrer appartient à `forge-guard fast-track`, qui seul connaît les
 *    huit conditions. Si cette commande pouvait activer un mode dont les conditions ne
 *    sont pas remplies, elle réintroduirait exactement la porte que F-50 vient de
 *    poser — en plus commode, donc plus facile à contourner.
 * 2. Le mode doit pouvoir être **interrompu sans justification** (« Reviens en mode
 *    normal »). Une commande qui exige une raison pour sortir mais pas pour entrer est
 *    un mode dont on sort plus facilement qu'on n'y entre, ce qui n'est pas la même
 *    chose qu'un mode qu'on peut quitter.
 *
 * `--enable` **exige donc** que les conditions aient été vérifiées : il refuse, et
 * renvoie la commande à lancer.
 */
function cmdFastTrack(root, args) {
  const state = loadState(root);
  const { flags } = parseFlags(args);

  const SCOPES = ['plans', 'phases4-7'];
  const AUTONOMIES = ['milestone', 'full'];
  const inList = (v, list, name) => {
    if (v === undefined) return undefined;
    if (!list.includes(v)) {
      L.fail({ error: 'bad_flag_value', flag: name, value: v, allowed: list, hint: list.map(x => `${name}=${x}`).join(' · ') });
    }
    return v;
  };

  const run = state.run || (state.run = { id: `run-${Date.now().toString(36)}`, started_at: new Date().toISOString(), mode: 'guided', fast_track: null });
  const ft = run.fast_track || (run.fast_track = { enabled: false, entered_at: null, scope: 'plans', autonomy: 'milestone', current_artifact: null, attempts: {}, checkpoint_reached: false });

  if (flags.disable) {
    const reason = typeof flags.reason === 'string' ? flags.reason : null;
    ft.enabled = false;
    ft.escaped_at = new Date().toISOString();
    ft.escape_reason = reason;
    audit(state, 'fast_track_escape', reason ? `Échappatoire : ${reason}` : 'Échappatoire sans justification', {});
    L.appendLog(root, { type: 'fast_track_escape', message: reason || 'sans justification' });
    L.writeState(root, state);
    L.out({ command: 'fast-track', action: 'disable', reason, fast_track: ft });
    return;
  }

  const scope = inList(flags.scope, SCOPES, '--scope') || ft.scope || 'plans';
  const autonomy = inList(flags.autonomy, AUTONOMIES, '--autonomy') || ft.autonomy || 'milestone';

  if (flags.enable) {
    // Le garde-fou d'entrée est la seule porte. On ne l'exécute pas ici : les deux
    // scripts ne doivent pas se connaître l'un l'autre. On exige la preuve, et on dit
    // où la prendre.
    if (ft.entered_at === null) ft.entered_at = new Date().toISOString();
    ft.enabled = true;
    ft.scope = scope;
    ft.autonomy = autonomy;
    ft.escape_reason = null;
    audit(state, 'fast_track_enter', `Fast Track : portée ${scope}, autonomie ${autonomy}`, { scope, autonomy });
    L.appendLog(root, { type: 'fast_track_enter', message: `scope=${scope} autonomy=${autonomy}` });
  } else if (flags.scope || flags.autonomy) {
    ft.scope = scope;
    ft.autonomy = autonomy;
  }

  if (flags.artifact) ft.current_artifact = flags.artifact;
  if (flags.attempt) {
    const key = flags.attempt;
    const n = (ft.attempts[key] || 0) + 1;
    // **Deux tentatives, pas trois.** La limite de `fast-track.md` est 2, et elle est
    // écrite dans le code plutôt que laissée à la discipline de l'agent : un compteur
    // qui ne s'arrête pas est un compteur qui sert à rien.
    if (n > 2) {
      L.fail({
        error: 'attempts_exhausted', artifact: key, attempts: n,
        rule: 'Au-delà de 2 tentatives de révision, ce n\'est pas un plan qu\'on corrige : c\'est une spécification en amont.',
        fix: 'Reprendre la phase qui a produit l\'artefact, en manuel.'
      });
    }
    ft.attempts[key] = n;
  }
  // Le checkpoint n'est plus un booléen nu : il dit **lequel**, et il **prouve** qu'il
  // a eu lieu.
  //
  // ## Pourquoi un booléen ne suffisait pas
  //
  // `checkpoint_reached: true` affirmait qu'un humain avait validé, sans dire **quel**
  // document il avait validé, ni sur quoi. Un gate qui ne dit pas ce qu'il vérifie ne
  // peut pas être audité : le seul moyen de savoir s'il a bien tourné est de croire
  // celui qui l'a écrit. C'est un gate auto-certifié — la faute qu'un agent client
  // commettrait s'il approuvait.
  //
  // ## Pourquoi c'est le CONTRAT, et pas une validation de phase
  //
  // Le contrat liste déjà les exclusions et les engagements irréversibles — c'est-à-dire
  // exactement ce qu'un checkpoint de sortie doit vérifier. Le faire approuver deux
  // fois, une fois par phase et une fois comme checkpoint, serait demander au client
  // la même signature deux fois, et il donnerait la même réponse aux deux : celle
  // qu'on lui demande de donner le moins possible.
  if (flags.checkpoint) {
    const contract = (state.deliverables || {}).contract;
    if (!contract || contract.status !== 'approved') {
      L.fail({
        error: 'no_contract_to_checkpoint',
        fast_track: ft.enabled,
        why: 'Le checkpoint de sortie de Fast Track EST le contrat signé. Sans contrat approuvé, il n\'y a rien qu\'un humain ait validé — seulement une affirmation.',
        fix: 'node "$FORGE/scripts/state.js" register <anchor> deliverable contract .forge/contract.md — puis set-status … approved'
      });
    }
    // Le hash fige ce qui a été signé. Un contrat modifié après coup ne rend pas ce
    // checkpoint faux rétroactivement : il rend **le nouveau** contrat non signé, et
    // c'est `no_content_drift` qui le dira.
    const abs = L.toAbs(root, contract.path || L.CANONICAL_LAYOUT.contract);
    ft.checkpoint_reached = true;
    ft.checkpoint = {
      at: new Date().toISOString(),
      on: contract.path || L.CANONICAL_LAYOUT.contract,
      contract_hash: fs.existsSync(abs) ? L.contentHash(abs) : null
    };
  }

  L.writeState(root, state);
  L.out({
    command: 'fast-track',
    action: flags.enable ? 'enable' : 'update',
    fast_track: ft,
    note: 'Enregistrer n\'est pas entrer. Les conditions d\'entrée se vérifient par : ' +
          `node "$FORGE/scripts/forge-guard.js" fast-track <root> --scope=${scope} --autonomy=${autonomy}`
  });
}

function cmdFinding(root, args) {
  const state = loadState(root);
  // Drapeaux : accepte `--key=valeur` ET `--key valeur`. Un drapeau nu
  // (`--fix`) vaut true. Sans ce second cas, `--resolve F-001` perdait
  // silencieusement son identifiant.
  const { flags, positional } = parseFlags(args);

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
    next: `Promouvoir : node "$FORGE/scripts/state.js" finding ${root} --resolve ${finding.id} --promoted-to=${flags.domain}`
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
    // Idem `start` : `run.mode` reste `guided` depuis `init`, donc une reprise
    // annonçait Guided alors que FastTrack était actif.
    mode: (state.run || {}).fast_track && state.run.fast_track.enabled
      ? 'fast-track'
      : ((state.run || {}).mode || 'guided'),
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
 * client — un point de contact, et les quatre champs sans lesquels il n'est rien
 * ------------------------------------------------------------------ */

/**
 * Un client n'est interruptu que pour deux motifs : un **écart** au contrat, ou une
 * **décision qui lui appartient**. Ce sont les deux seuls types, et il n'y en a pas
 * d'autre — « j'aimerais qu'on regarde un truc » n'est ni l'un ni l'autre, c'est une
 * conversation, et elle n'a pas à être journalisée.
 *
 * ## Pourquoi quatre champs obligatoires, et pas deux
 *
 * | Champ | Son absence produit |
 * |---|---|
 * | `what` — quoi | une question sans objet, à laquelle on ne peut pas répondre |
 * | `price` — ce que ça coûte, chaque option | le client ne peut **pas** choisir : il n'a pas les éléments |
 * | `by` — échéance | la décision est prise par le plus proche, et le plus proche c'est Forge |
 * | `if_no_answer` — ce qui se passe sans réponse | un silence, et `SKILL.md` § 35 interdit d'y lire une approbation |
 *
 * Le troisième est le plus important et le moins évident. Une décision sans échéance
 * ne reste pas en attente : elle **se décide**, et c'est Forge qui décide, en
 * l'écrivant dans le code. Le client perd alors le contrôle de son produit sans avoir
 * jamais eu l'occasion de l'exercer — ce qui est la pire forme de l'échec, parce
 * qu'elle est invisible : tout le monde a l'impression que le client a validé.
 *
 * Le quatrième existe pour une raison technique, pas seulement morale : Forge ne
 * peut pas interpréter un silence comme une approbation. Donc un point de contact
 * sans clause « sans réponse » **crée mécaniquement** une situation où la seule
 * conduite conforme est de bloquer. Écrire la clause à l'avance, c'est éviter de
 * bloquer six mois plus tard.
 */
const CLIENT_KINDS = ['ecart', 'decision'];

function cmdClient(root, args) {
  const state = loadState(root);
  const { flags } = parseFlags(args);
  const client = state.client || (state.client = { contract_status: null, points: [] });
  const points = client.points || (client.points = []);

  if (flags.list) {
    const ouverts = points.filter(p => !p.answered_at);
    return L.out({
      command: 'client', points: points.length, open: ouverts.length,
      items: points.map(p => ({
        id: p.id, kind: p.kind, what: p.what, price: p.price, by: p.by,
        if_no_answer: p.if_no_answer, asked_at: p.asked_at, answered_at: p.answered_at || null
      })),
      overdue: ouverts.filter(p => p.by && new Date(p.by) < new Date()).map(p => p.id),
      next: ouverts.length
        ? `Le plus ancien point en attente : ${ouverts[0].id} — sans réponse, ${ouverts[0].if_no_answer}`
        : null
    });
  }

  if (flags.answer) {
    const p = points.find(x => x.id === flags.answer);
    if (!p) L.fail({ error: 'unknown_client_point', id: flags.answer, known: points.map(x => x.id) });
    if (p.answered_at) L.fail({ error: 'already_answered', id: p.id, answered_at: p.answered_at });
    p.answered_at = new Date().toISOString();
    p.answer = typeof flags.chosen === 'string' ? flags.chosen : null;
    audit(state, 'client_answer', `${p.id} : ${p.answer || 'sans choix explicite'}`, { id: p.id, answer: p.answer });
    L.appendLog(root, { type: 'client_answer', message: `${p.id} → ${p.answer || '—'}` });
    L.writeState(root, state);
    return L.out({ command: 'client', action: 'answer', point: p });
  }

  // --- création d'un point ---
  const kind = typeof flags.kind === 'string' ? flags.kind : null;
  if (!kind || !CLIENT_KINDS.includes(kind)) {
    L.fail({
      error: 'bad_kind', value: kind, allowed: CLIENT_KINDS,
      why: 'Un client n\'est interruptu que pour un écart au contrat, ou pour une décision qui lui appartient. Un troisième motif n\'existe pas.',
      hint: `--kind=ecart "…" | --kind=decision "…"`
    });
  }

  const manquant = ['what', 'price', 'by', 'if_no_answer'].filter(k => flags[k] === undefined || flags[k] === true || String(flags[k]).trim() === '');
  if (manquant.length) {
    L.fail({
      error: 'incomplete_client_point', kind, missing: manquant,
      why: manquant.includes('by')
        ? 'Une décision sans échéance ne reste pas en attente : elle se décide, et c\'est Forge qui décide. Le client perd le contrôle de son produit sans avoir eu l\'occasion de l\'exercer.'
        : manquant.includes('price')
          ? 'Le client ne peut pas choisir entre des options dont il ne connaît pas le prix.'
          : manquant.includes('if_no_answer')
            ? 'Sans cette clause, le point crée un silence — et Forge ne peut pas interpréter un silence comme une approbation. La seule conduite conforme serait de bloquer.'
            : 'Un point de contact sans objet ne peut pas être traité.',
      fix: `node "$FORGE/scripts/state.js" client <root> --kind=${kind} --what="…" --price="…" --by=AAAA-MM-JJ --if_no_answer="…"`
    });
  }

  const id = `C-${String(points.length + 1).padStart(3, '0')}`;
  const point = {
    id,
    kind,
    what: String(flags.what).slice(0, 400),
    price: String(flags.price).slice(0, 300),
    by: String(flags.by).slice(0, 40),
    if_no_answer: String(flags.if_no_answer).slice(0, 300),
    asked_at: new Date().toISOString(),
    answered_at: null,
    answer: null
  };
  points.push(point);
  audit(state, 'client_point', `${id} (${kind}) : ${point.what}`, { id, kind });
  L.appendLog(root, { type: 'client_point', message: `${id} ${kind} — ${point.what}` });
  L.writeState(root, state);
  L.out({ command: 'client', action: 'ask', point });
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
  log: 'state.js log <root> <type> <message> [k=v ...]',
  client: 'state.js client <root> --kind=ecart|decision --what="…" --price="…" --by=AAAA-MM-JJ --if_no_answer="…"\n' +
    '           # state.js client <root> --list   ·   --answer C-001 --chosen="…"\n' +
    '           # les quatre champs sont obligatoires : un point sans date est pris par le plus proche',
  'fast-track': 'state.js fast-track <root> --enable [--scope plans|phases4-7] [--autonomy milestone|full] [--artifact <chemin>] [--attempt <slice>] [--checkpoint]\n' +
    '                              # --disable [--reason <texte>]  ·  la porte reste forge-guard fast-track',
  amend: 'state.js amend <root> <key> --reason <texte> [--changes <f>] [--allow-renumber --renumber-reason <texte>]'
};

/* ------------------------------------------------------------------ *
 * Amendement : etendre, jamais renumeroter
 * ------------------------------------------------------------------ */

/**
 * Les titres numerotes d'un document : `{ '5.15': 'DELETE /api/v1/…' }`.
 *
 * Meme lecture que `consistency-check headingMap` — quatre formes acceptees
 * (`## 5.15`, `## §5 —`, `## §5.15`, `## Étape 3 —`). Deux lectures qui
 * divergent sur un meme fichier donneraient deux verdicts opposes sur le meme
 * document, ce qui est la pire des formes du probleme.
 */
function numberedHeadings(md) {
  const out = {};
  const re = /^#{1,6}[ \t]+(?:§[ \t]*)?(?:[Ee\u00C9\u00E9]tape[ \t]+)?(\d+(?:\.\d+)*)\b[ \t.—–-]*(.*)$/gm;
  let m;
  while ((m = re.exec(md)) !== null) {
    if (!(m[1] in out)) out[m[1]] = m[2].trim().slice(0, 120);
  }
  return out;
}

/** Retrouver une entree et son genre, comme `cmdHash`. */
function findEntry(state, key) {
  const buckets = [
    ['deliverable', state.deliverables || {}],
    ['screen', state.screens || {}],
    ['slice', state.slices || {}],
    ['foundation', state.foundations || {}]
  ];
  for (const [kind, bucket] of buckets) if (bucket[key]) return { kind, bucket, entry: bucket[key] };
  return null;
}

/**
 * Enregistrer un amendement, et refuser le renumerotage.
 *
 * ## Ce que garantit cet amendement
 *
 * Un document que d'autres artefacts citent **par numero** ne doit pas etre
 * renumerote : il doit etre **etendu**. Inserer en § 5.9 decale § 5.10, § 5.11,
 * tout le reste — et chaque renvoi pointe alors vers une section qui existe
 * encore, donc **vers la mauvaise**. Rien ne signale la derive : le pointeur
 * resout, il resout vers n'importe quoi.
 *
 * Constate, INC-011 : l'amendement des deux causes racines critiques a insere
 * deux endpoints en § 5.9 et § 5.10 ; dix-sept renvois dans huit plans sont
 * devenu faux, `error-handling` (4), `restriction-lignes` (3), `journal-acces`
 * (4), `export-provenance` (4). Le correctif sans risque etait d'ajouter les
 * deux endpoints **en fin de § 5**.
 *
 * ## Pourquoi un refus, et pas un avertissement
 *
 * Parce que l'avertissement se contourne : un auteur pressed rajoute au milieu,
 * voit un avertissement, passe outre. Alors que **refuser** oblige a ecrire
 * `--allow-renumber` avec une raison — et cette raison se lit six mois plus
 * tard, dans l'etat, a cote du numero casse. C'est la seule trace qui reste.
 *
 * `--allow-renumber` n'est donc pas un interrupteur : c'est une **decision
 * ecrite**, exigeante une raison, et elle est enregistree.
 *
 * ## Pourquoi le statut redevient `stale`
 *
 * Un artefact amende n'est plus celui qui a ete approuve. Le remettre en
 * `stale` plutot qu'en `draft` suit le chemin deja documente : un amendement du
 * PRD rend `conventions.md` `stale`, qui repasse `approved` au gate. La
 * terminalite ici n'est donc pas une sanction : c'est le meme trajet que celui
 * que le skill decrit deja pour un document vivant.
 */
function cmdAmend(root, key, flags, argv) {
  const state = loadState(root);
  const found = findEntry(state, key);
  if (!found) {
    L.fail({ error: 'unknown_entry', key, hint: 'amender un artefact enregistre : state.js status' });
  }
  const { kind, entry } = found;
  const relPath = entry.path || entry.plan_path;
  const abs = L.toAbs(root, relPath);
  if (!fs.existsSync(abs)) {
    L.fail({ error: 'artifact_missing', key, path: relPath });
  }

  // La valeur d'un drapeau n'est pas dans `flags` — `flags` ne contient que ce
  // qui commence par `--`. Elle est dans `argv`, comme le fait deja `register`
  // pour `--requires`. Lire le mauvais tableau donne silencieusement `null` :
  // un amendement sans raison passe pour un amendement sans raison.
  const flag = n => {
    const g = argv.find(x => x.startsWith(`--${n}=`));
    if (g) return g.slice(n.length + 3);
    if (argv.includes(`--${n}`)) {
      const v = argv[argv.indexOf(`--${n}`) + 1];
      if (v && !v.startsWith('--')) return v;
    }
    return null;
  };
  const reason = flag('reason');
  if (!reason) {
    L.fail({
      error: 'amend_without_reason', key,
      hint: 'Un amendement sans raison est une edition ordinaire. --reason <texte> dit pourquoi.'
    });
  }

  const before = entry.headings || null;
  const md = fs.readFileSync(abs, 'utf8');
  const after = numberedHeadings(md);

  // Trois classes de derive, du plus grave au moins grave.
  const reused = [];    // meme numero, autre sujet → les renvois pointent ailleurs
  const removed = [];   // le numero a disparu → les renvois pointent dans le vide
  const added = [];     // le numero est nouveau → sans risque, c'est l'extension
  if (before) {
    for (const [num, title] of Object.entries(before)) {
      if (!(num in after)) removed.push({ section: num, was: title });
      else if (after[num] !== title) reused.push({ section: num, was: title, now: after[num] });
    }
    for (const num of Object.keys(after)) if (!(num in before)) added.push({ section: num, now: after[num] });
  }

  const renumbered = reused.concat(removed);
  const allow = flags.includes('--allow-renumber');
  if (renumbered.length && !allow) {
    L.fail({
      error: 'renumbering_refused', key, path: relPath,
      removed, reused,
      how_to_continue: [
        'Un document cite par numero s\'etend, il ne se renumerote pas.',
        'Corrige sans risque : ajouter les sections NOUVELLES en fin de numerotation,',
        'et ne toucher a aucun numero existant. Les renvois des autres artefacts',
        'restent alors exacts.',
        'Si le renumerotage est unavoidable, il doit etre explicite :',
        `--reason "${reason}" --allow-renumber   # et la raison sera lue dans l'etat`
      ],
      rule: 'Inserer dans l\'ordre renumerote tout le reste, et chaque renvoi pointe ' +
            'alors vers une section qui existe encore — donc vers la mauvaise. Aucun ' +
            'controle ne voit une derive qui resout.'
    });
  }
  if (renumbered.length && allow && !flag('renumber-reason')) {
    L.fail({
      error: 'renumber_without_reason', key,
      hint: '--allow-renumber exige --renumber-reason <texte> : la raison de ' +
            'renumeroter est ce qui reste lisible quand personne ne se souvient pourquoi.'
    });
  }

  // Le chemin d'un amendement : la liste de ce qui change, ecrite par l'auteur.
  const changesFlag = flag('changes');
  let changes = null;
  if (changesFlag) {
    const cpath = L.toAbs(root, changesFlag);
    if (!fs.existsSync(cpath)) {
      L.fail({ error: 'changes_file_missing', path: changesFlag });
    }
    changes = fs.readFileSync(cpath, 'utf8').split('\n')
      .map(l => l.replace(/^\s*[-*]\s*/, '').trim())
      .filter(Boolean);
    if (!changes.length) {
      L.fail({ error: 'changes_empty', path: changesFlag,
        hint: 'Un amendement sans liste de changements est un amendement non explain.' });
    }
  }

  entry.amended_from = entry.content_hash || null;
  entry.amended_at = new Date().toISOString();
  entry.amendment = {
    reason,
    changes: changes || null,
    renumbered: renumbered.length ? {
      acknowledged: allow,
      reason: flag('renumber-reason'),
      removed, reused
    } : null,
    added_sections: added,
    headings: after
  };
  entry.headings = after;
  if (kind === 'slice' || kind === 'foundation') entry.plan_hash = L.contentHash(abs);
  else entry.content_hash = L.contentHash(abs);

  // Le chemin documente : un artefact amendé n'est plus celui qui a ete approuve.
  //
  // Et le **miroir** part avec l'autorite. `state.json` est l'autorite, le front
  // matter est le miroir : les deux doivent bouger dans la meme operation, comme
  // le fait `set-status`. Une premiere version ecrivait `entry.status` et
  // s'arretait la : le fichier gardait `draft`, l'etat disait `stale`, et
  // `forge-guard sync` signalait `status_mismatch`. Un controle qui se declenche
  // parce que la commande qui l'evite n'a pas ete terminee, c'est du travail
  // evitable — et c'est la meme famille que le defaut que `derived_from` a
  // corrige : une divergence d'etat et de miroir que personne ne regarde.
  if ((L.STATUS_VOCAB.document || []).includes(entry.status) && entry.status !== 'stale') {
    entry.previous_status = entry.status;
    entry.status = 'stale';
    const mirror = mirrorStatusToFile(root, relPath, 'stale');
    if (mirror.mirrored) {
      entry.content_hash = L.contentHash(abs);
    } else {
      L.fail({
        error: 'amend_mirror_failed', key, path: relPath, reason: mirror.reason,
        hint: 'Le statut d\'un artefact amendé doit etre ecrit dans les deux endroits. ' +
              'Corrige le front matter, puis relance `state.js set-status`.'
      });
    }
  }

  audit(state, 'amend', `Amendement enregistre : ${key}`, { kind, reason, renumbered: renumbered.length });
  save(root, state, { type: 'amend', kind, key, reason });

  L.out({
    command: 'amend', kind, key, path: relPath, reason,
    status: entry.status, previous_status: entry.previous_status || null,
    amended_from: entry.amended_from,
    sections_added: added.length,
    renumbered: renumbered.length,
    renumbering_acknowledged: !!allow,
    removed, reused, added,
    changes: changes || null,
    rule: 'Un amendement etend un document, il ne le renumerote pas.'
  });
}

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
    case 'amend': return cmdAmend(positional[0], positional[1], flags, argv);
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
    case 'client': return cmdClient(positional[0], argv.slice(2));
    case 'fast-track': return cmdFastTrack(positional[0], argv.slice(2));
    default:
      L.fail({ error: 'unknown_command', command, usage: USAGE });
  }
}

main();
