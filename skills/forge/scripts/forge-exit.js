#!/usr/bin/env node
'use strict';

/**
 * forge-exit.js — le critère de sortie d'une slice, exécuté.
 *
 * Le problème. Un « Definition of Done » écrit en phrases n'est pas un contrôle :
 * c'est un rappel. Sur un projet réel, un item de DoD sans commande derrière lui a
 * été ignoré 13 fois sur 26 commits, et le projet en a tiré la règle que
 * « documenter une correction en prose ne suffit pas ».
 *
 * Le second problème, plus sournois. « Le test existe » vérifie qu'un FICHIER
 * existe. Or le défaut le plus coûteux d'un suivi de projet n'est pas un fichier
 * de test manquant : c'est un fichier de test présent qui déclare **zéro cas**,
 * ou dont les assertions sont fausses. Sur un projet réel, 14 slices ont été
 * approuvées sans aucun cas de test, et rien ne l'avait signalé.
 *
 * Donc : une slice est terminée quand ses COMMANDES sortent 0, et « le test
 * existe » signifie « il y a au moins un cas de test ».
 *
 * Zéro dépendance. Exécute les commandes du projet — c'est son outillage, pas le
 * nôtre. `--dry-run` n'exécute rien et se contente de lister les contrôles.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const L = require('./lib/forge-lib');

/* ------------------------------------------------------------------ *
 * Détection des commandes du projet
 * ------------------------------------------------------------------ */

/** outward→ inward. On ne devine pas : on regarde ce qui existe. */
const COMMANDS = {
  lint: [
    { cmd: 'npm run lint', files: ['package.json'] },
    { cmd: 'pnpm lint', files: ['package.json'] },
    { cmd: 'bun run lint', files: ['package.json'] },
    { cmd: 'flutter analyze', files: ['pubspec.yaml'] },
    { cmd: 'cargo clippy', files: ['Cargo.toml'] },
    { cmd: 'go vet ./...', files: ['go.mod'] }
  ],
  typecheck: [
    { cmd: 'npm run typecheck', files: ['package.json'] },
    { cmd: 'pnpm typecheck', files: ['package.json'] },
    { cmd: 'tsc --noEmit', files: ['tsconfig.json'] },
    { cmd: 'mypy .', files: ['pyproject.toml', 'mypy.ini'] }
  ],
  test: [
    { cmd: 'flutter test', files: ['pubspec.yaml'] },
    { cmd: 'npm test', files: ['package.json'] },
    { cmd: 'pnpm test', files: ['package.json'] },
    { cmd: 'pytest', files: ['pytest.ini', 'pyproject.toml'] },
    { cmd: 'go test ./...', files: ['go.mod'] },
    { cmd: 'cargo test', files: ['Cargo.toml'] }
  ]
};

function detectCommands(root) {
  const found = {};
  for (const [kind, candidates] of Object.entries(COMMANDS)) {
    for (const c of candidates) {
      if (c.files.some(f => fs.existsSync(path.join(root, f)))) { found[kind] = c.cmd; break; }
    }
  }
  return found;
}

/* ------------------------------------------------------------------ *
 * Comptage de cas de test
 * ------------------------------------------------------------------ */

const CASE_PATTERNS = [
  // Dart (test/testWidgets) et JS/TS (it/test). Un seul motif pour les deux :
  // deux motifs qui se recouvrent comptent chaque cas deux fois, et un compteur
  // faux est pire qu'un compteur absent.
  /^\s*(?:test|testWidgets|it)\s*\(/gm,
  /@Test\b/g,                                 // JUnit
  /^\s*def test_/gm,                          // pytest
  /^\s*func Test/gm,                          // Go
  /#\[test\]/g                                // Rust
];

function countCasesIn(file) {
  const src = fs.readFileSync(file, 'utf-8');
  let n = 0;
  for (const re of CASE_PATTERNS) {
    re.lastIndex = 0;
    n += (src.match(re) || []).length;
  }
  return n;
}

function findTestFiles(root, sliceName) {
  const out = [];
  for (const dir of ['test', 'tests', 'spec', '__tests__']) {
    const p = path.join(root, dir);
    if (!fs.existsSync(p)) continue;
    for (const f of L.listFilesRecursive(p)) {
      if (!/\.(dart|ts|tsx|js|jsx|mjs|py|go|rs|java|kt)$/.test(f)) continue;
      const base = path.basename(f);
      const stem = base.replace(/\.(dart|ts|tsx|js|jsx|mjs|py|go|rs|java|kt)$/, '');
      if (stem.includes(sliceName) || base.includes(sliceName)) out.push(f);
    }
  }
  return out;
}

/* ------------------------------------------------------------------ *
 * Vérifications
 * ------------------------------------------------------------------ */

function runCommand(root, cmd, timeoutMs) {
  try {
    execSync(cmd, { cwd: root, stdio: 'pipe', timeout: timeoutMs });
    return { cmd, ok: true };
  } catch (e) {
    return {
      cmd,
      ok: false,
      code: e.status === undefined ? null : e.status,
      signal: e.signal || null,
      // On ne retient que la queue : la cause est en fin de sortie.
      output: (e.stdout ? e.stdout.toString() : '') + (e.stderr ? e.stderr.toString() : ''),
      detail: e.status === null
        ? `la commande n'a pas de code de sortie (${e.signal || 'timeout'})`
        : undefined
    };
  }
}

function check(args) {
  const dryRun = args.includes('--dry-run');
  const positional = args.filter(a => !a.startsWith('--'));
  const anchor = path.resolve(positional[0] || process.cwd());
  const sliceName = positional[1];

  const state = L.readState(anchor);
  if (!state) L.fail({ error: 'no_state', path: L.statePath(anchor) });
  if (state.version === 1 || state.documents) {
    L.fail({ error: 'legacy_state_v1', hint: `node "$FORGE/scripts/state.js" migrate ${anchor}`, reference: 'references/migration-v1-v2.md' });
  }

  const checks = [];
  const add = (name, ok, details = {}) => checks.push({ check: name, status: ok ? 'pass' : 'fail', ...details });

  /* --- 1. le plan existe --- */
  // Fondations comprises, comme `check-stale` et `coverage-check`.
  const slice = L.graphNodes(state)[sliceName];
  const planRel = (slice && (slice.plan_path || slice.path)) ||
    (sliceName ? `${L.FORGE_DIR}/plans/${sliceName}.md` : null);
  const planAbs = planRel ? L.toAbs(anchor, planRel) : null;
  const planExists = !!(planAbs && fs.existsSync(planAbs));

  if (!sliceName) {
    L.fail({
      error: 'missing_slice',
      usage: 'forge-exit.js <anchor> <slice> [--dry-run] [--only=lint,test]',
      known: Object.keys(L.graphNodes(state))
    });
  }
  add('plan_exists', planExists, { path: planRel, ...(planExists ? {} : { hint: `Créer ${planRel}` }) });

  /* --- 2. la slice a des CAS de test, pas un fichier de test --- */
  const testFiles = findTestFiles(anchor, sliceName);
  const totalCases = testFiles.reduce((n, f) => n + countCasesIn(f), 0);
  add('slice_has_test_cases', totalCases > 0, {
    test_files: testFiles.map(f => path.relative(anchor, f)),
    case_count: totalCases,
    rule: "« Le test existe » signifie au moins un cas de test. Un fichier vide est un test qui ne vérifie rien.",
    detail: totalCases > 0 ? undefined
      : testFiles.length
        ? `${testFiles.length} fichier(s) trouvé(s) mais 0 cas déclaré(s) — le test existe-t-il vraiment ?`
        : `aucun fichier de test ne porte le nom de la slice (cherché dans test/, tests/, spec/, __tests__/)`
  });

  /* --- 3. le plan n'est pas vide --- */
  if (planExists) {
    const plan = fs.readFileSync(planAbs, 'utf-8');
    const placeholders = (plan.match(/\{\{\s*[A-Z0-9_]{2,}\s*\}\}/g) || []).filter((v, i, a) => a.indexOf(v) === i);
    add('plan_has_no_placeholders', placeholders.length === 0, {
      placeholders,
      rule: 'Un livrable ne contient jamais de {{PLACEHOLDER}} : il est généré depuis un gabarit, pas recopié.'
    });
    const empty = (plan.match(/^#{2,3} [^\n]+\n\s*\n(?=\n|---)/gm) || []).length;
    add('plan_sections_filled', empty === 0, { empty_sections: empty });
  }

  /* --- 4. les commandes du projet --- */
  const only = (positional.find(a => false) || (args.find(a => a.startsWith('--only=')) || '').slice('--only='.length))
    .split(',').map(s => s.trim()).filter(Boolean);
  const detected = detectCommands(anchor);

  if (!only.length) {
    for (const [kind, cmd] of Object.entries(detected)) {
      if (dryRun) { add(`cmd_${kind}`, true, { cmd, dry_run: true }); continue; }
      const r = runCommand(anchor, cmd, kind === 'test' ? 15 * 60 * 1000 : 5 * 60 * 1000);
      add(`cmd_${kind}`, r.ok, {
        cmd,
        ...(r.ok ? {} : { exit_code: r.code, ...(r.detail ? { detail: r.detail } : {}), output_tail: r.output ? r.output.split('\n').slice(-25).join('\n') : null })
      });
    }
    if (!Object.keys(detected).length) {
      checks.push({
        check: 'cmd_detection',
        status: 'warn',
        message: 'Aucune commande de projet détectée — les contrôles de code n\'ont pas pu être exécutés.',
        hint: 'Déclare-les dans state.json → project.commands, ou dans AGENTS.md §Commands.'
      });
    }
  } else {
    for (const kind of only) {
      const cmd = detected[kind];
      if (!cmd) { add(`cmd_${kind}`, false, { error: `commande ${kind} non détectée` }); continue; }
      if (dryRun) { add(`cmd_${kind}`, true, { cmd, dry_run: true }); continue; }
      const r = runCommand(anchor, cmd, kind === 'test' ? 15 * 60 * 1000 : 5 * 60 * 1000);
      add(`cmd_${kind}`, r.ok, { cmd, ...(r.ok ? {} : { exit_code: r.code, output_tail: r.output ? r.output.split('\n').slice(-25).join('\n') : null }) });
    }
  }

  /* --- 5. la slice est-elle stale ? --- */
  if (slice && slice.plan_hash && planExists) {
    const current = L.contentHash(planAbs);
    add('plan_not_edited_since_approval', slice.plan_hash === current, {
      recorded: slice.plan_hash,
      actual: current,
      rule: "Un plan modifié après son approbation est stale : ré-approuve-le avant de l'implémenter."
    });
  }

  const failed = checks.filter(c => c.status === 'fail');
  const warned = checks.filter(c => c.status === 'warn');

  L.out({
    command: 'forge-exit',
    anchor,
    slice: sliceName,
    mode: dryRun ? 'dry-run' : 'execute',
    pass: failed.length === 0,
    failed: failed.map(c => c.check),
    warned: warned.map(c => c.check),
    summary: { test_cases: totalCases, commands_run: Object.keys(detected).filter(k => !only.length || only.includes(k)).length },
    checks
  });

  if (!dryRun && failed.length === 0 && slice) {
    L.appendLog(anchor, {
      type: 'exit_criterion_met',
      slice: sliceName,
      test_cases: totalCases
    });
  }

  if (failed.length) process.exit(1);
}

check(process.argv.slice(2));
