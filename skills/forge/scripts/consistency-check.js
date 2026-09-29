#!/usr/bin/env node
'use strict';

/**
 * consistency-check.js — vérification INTER-artefacts.
 *
 * Pourquoi ce script existe. Sur un projet réel, le motif le plus coûteux n'était
 * pas « une spec incomplète » : c'était « un artefact ultérieur révèle un défaut
 * d'un artefact antérieur déjà approuvé ». Compté 13 fois. Et la phrase qui suit,
 * dans le journal du projet, est celle-ci :
 *
 *   « Aucun contrôle du gate ne l'attrape : les seize plans passent 11/11. »
 *
 * Parce qu'un contrôle qui lit UN document ne peut pas voir l'écart entre DEUX
 * documents. C'est la limite de l'outillage, pas de l'agent.
 *
 * Ce script confronte donc les artefacts entre eux :
 *   PRD ↔ architecture ↔ plans ↔ tests ↔ écrans ↔ décisions
 *
 * Zéro dépendance. Lecture seule.
 */

const fs = require('fs');
const path = require('path');
const L = require('./lib/forge-lib');

const results = { checks: [], pass: true };

function record(name, pass, details) {
  results.checks.push({ check: name, status: pass ? 'pass' : 'fail', ...details });
  if (!pass) results.pass = false;
}

function skip(name, why) {
  results.checks.push({ check: name, status: 'skip', reason: why });
}

function read(root, rel) {
  const p = L.toAbs(root, rel);
  return fs.existsSync(p) ? fs.readFileSync(p, 'utf-8') : null;
}

function loadStateOrFail(root) {
  const state = L.readState(root);
  if (!state) L.fail({ error: 'no_state', path: L.statePath(root) });
  if (state.version === 1 || state.documents) {
    L.fail({
      error: 'legacy_state_v1',
      hint: `node scripts/state.js migrate ${root}`,
      reference: 'references/migration-v1-v2.md'
    });
  }
  return state;
}

/* ------------------------------------------------------------------ *
 * Extraction
 * ------------------------------------------------------------------ */

/** Les IDs sont definitions OU references : les deux comptent pour la couverture. */
const ID_PATTERNS = {
  B: /\bB(\d{1,4})\b/g,
  E: /\bE(\d{1,4})\b/g,
  C: /\bC(\d{1,4})\b/g
};

/** Section de définition : un ID est *défini* s'il apparaît dans un titre de règle. */
const DEF_HEADING = {
  B: /^(?:###\s*)?\*{0,2}B(\d{1,4})\b[—\-:.]/gm,
  E: /^(?:###\s*)?\*{0,2}E(\d{1,4})\b[—\-:.]/gm,
  C: /^(?:###\s*)?\*{0,2}C(\d{1,4})\b[—\-:.]/gm
};

function allIds(content, kind) {
  const out = new Set();
  if (!content) return out;
  const re = ID_PATTERNS[kind];
  re.lastIndex = 0;
  let m;
  while ((m = re.exec(content)) !== null) out.add(m[1]);
  return out;
}

function definedIds(content, kind) {
  const out = new Set();
  if (!content) return out;
  const re = DEF_HEADING[kind];
  re.lastIndex = 0;
  let m;
  while ((m = re.exec(content)) !== null) out.add(m[1]);
  return out;
}

function planPaths(state) {
  return Object.entries(state.slices || {})
    .map(([name, s]) => ({ name, rel: s.plan_path || `${L.FORGE_DIR}/plans/${name}.md` }));
}

/* ------------------------------------------------------------------ *
 * 1. Le plan existe-t-il, et teste-t-il vraiment quelque chose
 * ------------------------------------------------------------------ */

function countTestCases(root, sliceName) {
  const testsRoot = path.join(root, 'test');
  if (!fs.existsSync(testsRoot)) return { file: null, count: 0 };
  const files = L.listFilesRecursive(testsRoot).filter(f => /\.(dart|ts|tsx|js|jsx|py|go|rs|java|kt)$/.test(f));
  const named = files.find(f => path.basename(f).includes(sliceName));
  if (!named) return { file: null, count: 0 };
  const src = fs.readFileSync(named, 'utf-8');
  const count =
    (src.match(/^\s*(test|testWidgets|it)\s*\(/gm) || []).length +
    (src.match(/@Test/g) || []).length +
    (src.match(/^\s*def test_/gm) || []).length;
  return { file: path.relative(root, named), count };
}

const DONE = /^(approved|done|validated|implemented|complete|completed)$/;

function checkSliceReality(root, state) {
  const slices = Object.entries(state.slices || {});
  if (!slices.length) return skip('slice_reality', 'aucune slice déclarée (Phase 4 non atteinte)');

  const missingPlan = [];
  const missingTest = [];
  const falseDone = [];

  for (const [name, s] of slices) {
    const rel = s.plan_path || `${L.FORGE_DIR}/plans/${name}.md`;
    const planExists = fs.existsSync(L.toAbs(root, rel));
    const { file, count } = countTestCases(root, name);

    if (!planExists) missingPlan.push({ slice: name, expected: rel });
    if (DONE.test(s.status || '') && count === 0) {
      // Le défaut le plus coûteux : rend le fichier de suivi FAUX, sans signal.
      falseDone.push({
        slice: name,
        status: s.status,
        plan_exists: planExists,
        test_file: file,
        test_count: 0,
        detail: file
          ? `le fichier ${file} existe mais ne déclare aucun cas de test`
          : 'aucun fichier de test ne porte le nom de la slice'
      });
    }
    if (file && count === 0) missingTest.push({ slice: name, file });
  }

  record('slice_plan_exists', missingPlan.length === 0, { missing: missingPlan });
  record('slice_marked_done_has_tests', falseDone.length === 0, {
    suspect: falseDone,
    rule: 'Un statut « fait » sans cas de test est une affirmation, pas un fait. Présence du fichier ≠ test qui vérifie.'
  });
}

/* ------------------------------------------------------------------ *
 * 2. Traçabilité des IDs : PRD → plan → test
 * ------------------------------------------------------------------ */

function checkIdTraceability(root, state) {
  const prdRel = (state.deliverables || {}).prd && state.deliverables.prd.path;
  const prd = prdRel ? read(root, prdRel) : null;
  if (!prd) return skip('id_traceability', 'PRD absent ou non enregistré');

  const planContents = planPaths(state)
    .map(p => read(root, p.rel))
    .filter(Boolean);

  if (!planContents.length) return skip('id_traceability', 'aucun plan sur disque (Phase 5 non atteinte)');

  const covered = { B: new Set(), E: new Set(), C: new Set() };
  for (const kind of ['B', 'E', 'C']) {
    for (const c of planContents) for (const id of allIds(c, kind)) covered[kind].add(id);
  }

  const orphans = {};
  for (const kind of ['B', 'E', 'C']) {
    const defined = definedIds(prd, kind);
    if (!defined.size) continue;
    const missing = [...defined].filter(id => !covered[kind].has(id)).sort((a, b) => Number(a) - Number(b));
    if (missing.length) orphans[kind] = missing.map(id => `${kind}${id}`);
  }

  const hasOrphans = Object.keys(orphans).length > 0;
  record('ids_traced_to_plans', !hasOrphans, {
    orphans,
    rule: "Chaque règle, edge case et contrainte défini(e) dans le PRD doit apparaître dans au moins un plan.",
    note: 'Un ID orphelin n\'est pas forcément faux : une règle peut êtreV1. Vérifie qu\'elle est reportée ou explicitement hors périmètre.'
  });
}

/* ------------------------------------------------------------------ *
 * 3. Le plan déclare-t-il les IDs qu'il prétend couvrir ?
 * ------------------------------------------------------------------ */

/** Clé state.json qui porte les IDs d'un genre donné. */
const ID_FIELD = { B: 'rule_ids', E: 'edge_case_ids', C: 'constraint_ids' };

/** Normalise « B12 », « b12 », « B-12 », 12 → « 12 ». */
function normalizeId(v) {
  const m = String(v).match(/(\d{1,4})\s*$/);
  return m ? m[1] : null;
}

function checkPlanSelfConsistency(root, state) {
  const slices = Object.entries(state.slices || {});
  if (!slices.length) return skip('plan_declared_coverage', 'aucune slice déclarée');

  const inflated = [];

  for (const [name, s] of slices) {
    const rel = s.plan_path || `${L.FORGE_DIR}/plans/${name}.md`;
    const content = read(root, rel);
    if (!content) continue;

    for (const kind of ['B', 'E', 'C']) {
      // Un genre donné ne doit hériter que de son propre champ. Un repli
      // générique sur rule_ids ferait porter les IDs B à E et C.
      const declared = s[ID_FIELD[kind]];
      if (!Array.isArray(declared) || !declared.length) continue;

      const present = allIds(content, kind);
      const absent = declared
        .map(normalizeId)
        .filter(id => id && !present.has(id))
        .map(id => `${kind}${id}`);

      if (absent.length) inflated.push({ slice: name, kind, declared_absent_from_plan: absent });
    }
  }

  record('plan_contains_declared_ids', inflated.length === 0, {
    inflated,
    rule: "Un ID déclaré dans state.json mais absent du plan rend la couverture annoncée fausse."
  });
}

/* ------------------------------------------------------------------ *
 * 4. Écrans ↔ slices ↔ navigation
 * ------------------------------------------------------------------ */

function checkScreenCoverage(root, state) {
  const screens = Object.keys(state.screens || {});
  if (!screens.length) return skip('screen_coverage', 'aucun écran déclaré (Phase 3 non atteinte)');

  const allPlans = planPaths(state).map(p => read(root, p.rel) || '').join('\n');
  const allSlices = JSON.stringify(state.slices || {});

  const noSlice = screens.filter(s =>
    !allPlans.includes(s) && !allSlices.includes(s)
  );

  const nav = (state.index || {}).nav;
  let navWithoutScreen = [];
  if (nav && Array.isArray(nav.items)) {
    navWithoutScreen = nav.items
      .filter(it => it && !it.overflow)
      .filter(it => !screens.some(s => s === it.key || s.includes(it.key) || it.key.includes(s)))
      .map(it => it.key);
  }

  record('screens_have_slices', noSlice.length === 0, {
    screens_without_slice: noSlice,
    rule: "Un écran de design sans slice ne sera jamais implémenté — c'est le « trou de la décomposition »."
  });

  if (nav) {
    record('nav_items_have_screens', navWithoutScreen.length === 0, {
      nav_without_screen: navWithoutScreen,
      rule: "Chaque entrée de navigation renvoie à au moins un écran. Un slot sans écran est un module vide."
    });
  } else {
    skip('nav_items_have_screens', 'navigation non enregistrée (state.js set-nav)');
  }
}

/* ------------------------------------------------------------------ *
 * 5. Une question ouverte citée comme bloquante alors qu'une décision la tranche
 * ------------------------------------------------------------------ */

function checkOpenQuestions(root, state) {
  const decisions = read(root, 'DECISIONS.md');
  if (!decisions) return skip('open_questions_resolved', 'DECISIONS.md absent (project-rules-architect)');

  // Questions ouvertes : state.json legacy, ou le PRD.
  const openFromState = Object.entries(state.open_questions_resolved || {});
  if (!openFromState.length) return skip('open_questions_resolved', 'aucune question ouverte enregistrée');

  const adrs = new Set((decisions.match(/^## ADR-\d+/gm) || []).map(h => h.replace('## ', '')));
  const stillOpen = [];
  for (const [q, resolvedBy] of openFromState) {
    if (resolvedBy && adrs.has(String(resolvedBy))) stillOpen.push({ question: q, decided_by: resolvedBy });
  }

  record('open_questions_resolved', stillOpen.length === 0, {
    resolved_but_still_open: stillOpen,
    rule: "Une question tranchée par une ADR mais encore citée comme bloquante fait échouer une slice sur un sujet clos."
  });
}

/* ------------------------------------------------------------------ *
 * 6. Les constats trouvés ne sont pas comptés comme du travail fait
 * ------------------------------------------------------------------ */

function checkFindings(root, state) {
  const findings = state.findings || [];
  if (!findings.length) return skip('findings_promoted', 'aucun constat enregistré');

  const withoutDomain = findings.filter(f => !f.domain);
  const openUnpromoted = findings.filter(f => !f.promoted_to && f.status !== 'resolved');

  record('findings_have_domain', withoutDomain.length === 0, {
    without_domain: withoutDomain.map(f => ({ id: f.id, summary: (f.summary || '').slice(0, 100) })),
    rule: "Un constat sans domaine n'a aucune cible de promotion : il reste un journal, pas une règle."
  });

  results.checks.push({
    check: 'findings_promoted',
    status: openUnpromoted.length ? 'warn' : 'pass',
    open_unpromoted: openUnpromoted.length,
    items: openUnpromoted.slice(0, 10).map(f => ({ id: f.id, domain: f.domain, severity: f.severity })),
    rule: "Un constat qui n'atteint jamais un fichier de règles n'a rien changé.",
    next: openUnpromoted.length
      ? `Invoquer project-rules-architect pour promouvoir ${openUnpromoted.length} constat(s).`
      : null
  });
}

/* ------------------------------------------------------------------ *
 * CLI
 * ------------------------------------------------------------------ */

const CHECKS = {
  reality: (root, state) => checkSliceReality(root, state),
  ids: (root, state) => checkIdTraceability(root, state),
  plans: (root, state) => checkPlanSelfConsistency(root, state),
  screens: (root, state) => checkScreenCoverage(root, state),
  questions: (root, state) => checkOpenQuestions(root, state),
  findings: (root, state) => checkFindings(root, state)
};

function main() {
  const argv = process.argv.slice(2);
  const command = argv[0] || 'all';
  const root = path.resolve(argv[1] && !argv[1].startsWith('--') ? argv[1] : process.cwd());
  const state = loadStateOrFail(root);

  if (command !== 'all' && !CHECKS[command]) {
    L.fail({
      error: 'unknown_command', command,
      usage: {
        all: 'consistency-check.js all <anchor>',
        reality: 'consistency-check.js reality <anchor>   # plan + tests réellement présents',
        ids: 'consistency-check.js ids <anchor>         # PRD → plans',
        plans: 'consistency-check.js plans <anchor>      # state.json → contenu du plan',
        screens: 'consistency-check.js screens <anchor>   # écrans ↔ slices ↔ navigation',
        questions: 'consistency-check.js questions <anchor> # questions ouvertes vs ADR',
        findings: 'consistency-check.js findings <anchor>  # constats routés et promus'
      },
      note: 'Vérifie les écarts ENTRE artefacts. Aucun contrôle unitaire ne peut les voir.'
    });
  }

  const toRun = command === 'all' ? Object.keys(CHECKS) : [command];
  for (const c of toRun) CHECKS[c](root, state);

  const failed = results.checks.filter(c => c.status === 'fail');
  const warned = results.checks.filter(c => c.status === 'warn');

  L.out({
    command: `consistency-check ${command}`,
    anchor: root,
    pass: results.pass,
    failed: failed.map(c => c.check),
    warned: warned.map(c => c.check),
    checks: results.checks
  });

  if (!results.pass) process.exit(1);
}

main();
