#!/usr/bin/env node
'use strict';

/**
 * selftest.js — tests du skill Forge lui-même.
 *
 * Ce n'est pas un test de formalism : c'est le filet de sécurité sur les quatre
 * garde-fous qui ont été violés en production :
 *
 *   1. un livrable écrit hors de .forge
 *   2. du contenu de document dans state.json
 *   3. une divergence état / front matter
 *   4. un projet de référence hijacké comme anchor
 *
 * Chaque cas est testé sur un vrai projet temporaire, pas sur des mocks.
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const SKILL_DIR = path.resolve(__dirname, '..');
const SCRIPTS = path.join(SKILL_DIR, 'scripts');

let passed = 0;
let failed = 0;
const failures = [];

function test(name, fn) {
  try {
    fn();
    passed++;
    console.log(`  \x1b[32m✓\x1b[0m ${name}`);
  } catch (e) {
    failed++;
    failures.push({ name, message: e.message });
    console.log(`  \x1b[31m✗\x1b[0m ${name}`);
    console.log(`    \x1b[31m${e.message}\x1b[0m`);
  }
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg || 'Assertion failed');
}

function section(title) {
  console.log(`\n\x1b[1m${title}\x1b[0m`);
}

/* ------------------------------------------------------------------ *
 * Harnais
 * ------------------------------------------------------------------ */

/**
 * Lance un script du skill.
 *
 * `register` est un cas particulier : la phase du projet est amenée à celle
 * qui possède le livrable avant l'appel. `state.js register` refuse en effet
 * d'enregistrer un artefact produit avant que sa phase soit atteinte, et la
 * quasi-totalité des tests ci-dessous enregistrent `prd` ou une slice dans un
 * projet fraîchement initialisé, donc en phase 0. Ils ne testaient pas
 * l'ordre des phases — six ont cassé d'un coup, tous pour cette seule raison.
 *
 * Faire la mise en scène ici plutôt que dans chaque test évite cinquante
 * répétitions, et ça ne peut rien masquer : `register` teste
 * `outside_forge_dir` et `non_canonical_path` **avant** le refus d'ordre, donc
 * les tests qui attendent ces deux erreurs les rencontrent toujours.
 *
 * `{ raw: true }` désactive cette mise en scène — c'est ce qu'utilisent les
 * tests dont le sujet est précisément l'artefact en avance.
 */
function run(script, args, opts = {}) {
  if (!opts.raw && script === 'state.js' && args[0] === 'register') {
    enterOwnerPhase(path.resolve(args[1]), args[2], args[3]);
  }
  try {
    const stdout = execFileSync('node', [path.join(SCRIPTS, script), ...args], {
      encoding: 'utf-8',
      stdio: ['ignore', 'pipe', 'pipe']
    });
    return { code: 0, json: safeJson(stdout), stdout };
  } catch (e) {
    return {
      code: e.status === undefined ? 1 : e.status,
      json: safeJson(e.stdout || ''),
      stdout: e.stdout || '',
      stderr: e.stderr || ''
    };
  }
}

function safeJson(text) {
  try { return JSON.parse(text); } catch { return null; }
}


function makeProject(name, opts = {}) {
  const dir = path.join(tmpRoot, name);
  fs.mkdirSync(dir, { recursive: true });
  if (opts.marker !== false) {
    fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify({ name, version: '0.0.0' }));
  }
  return dir;
}

/** Crée un livrable minimal mais valide (front matter + corps). */
function writeDeliverable(project, relPath, { type = 'prd', status = 'draft', body = 'Contenu.' } = {}) {
  const abs = path.join(project, relPath);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, `---\ntype: ${type}\nstatus: ${status}\n---\n\n# Titre\n\n${body}\n`);
  return abs;
}

/**
 * Amène `current_phase` à la phase qui possède l'artefact qu'on s'apprête à
 * enregistrer. Voir `run` pour pourquoi cette mise en scène est faite ici.
 */
function enterOwnerPhase(project, kind, key) {
  const L = require(path.join(SCRIPTS, 'lib', 'forge-lib.js'));
  const statePath = path.join(project, '.forge', 'state.json');
  if (!fs.existsSync(statePath)) return;
  const state = JSON.parse(fs.readFileSync(statePath, 'utf-8'));
  const idx = L.PHASE_KEYS.findIndex(pk => {
    const spec = L.PHASE_ARTIFACT_OWNERS[pk] || {};
    return spec[kind] === true || (Array.isArray(spec[kind]) && spec[kind].includes(key));
  });
  if (idx >= 0 && idx > parseInt(state.current_phase, 10)) {
    state.current_phase = idx;
    fs.writeFileSync(statePath, JSON.stringify(state, null, 2) + '\n');
  }
}

function frontMatterStatus(project, relPath) {
  const abs = path.join(project, relPath);
  const m = fs.readFileSync(abs, 'utf-8').match(/^status:\s*(.+)$/m);
  return m ? m[1].trim() : null;
}

function readState(project) {
  return JSON.parse(fs.readFileSync(path.join(project, '.forge', 'state.json'), 'utf-8'));
}

function writeState(project, state) {
  fs.writeFileSync(path.join(project, '.forge', 'state.json'), JSON.stringify(state, null, 2) + '\n');
}

function initProject(project, name, references = []) {
  const args = [project, name];
  for (const r of references) args.push(`--reference=${r}`);
  const res = run('state.js', ['init', ...args]);
  assert(res.code === 0, `init a échoué : ${res.stdout}${res.stderr}`);
  return res;
}

/** Un projet neuf, isolé, pour un test qui a besoin de son propre état. */
function freshProject(label) {
  const dir = path.join(tmpRoot, label);
  fs.mkdirSync(dir, { recursive: true });
  initProject(dir, label);
  return dir;
}

/* ------------------------------------------------------------------ *
 * Bac à sable — créé avant tout test qui touche le disque
 * ------------------------------------------------------------------ */

console.log('Forge Skill — Self-test\n');

const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'forge-selftest-'));

process.on('exit', () => {
  try { fs.rmSync(tmpRoot, { recursive: true, force: true }); } catch {}
});

/* ------------------------------------------------------------------ *
 * 1. Intégrité du skill
 * ------------------------------------------------------------------ */

section('Intégrité du skill');

test('SKILL.md existe et a un front matter valide', () => {
  const c = fs.readFileSync(path.join(SKILL_DIR, 'SKILL.md'), 'utf-8');
  assert(c.startsWith('---'), 'SKILL.md doit commencer par ---');
  const end = c.indexOf('\n---', 3);
  assert(end > 0, 'front matter non fermé');
  const fm = c.slice(3, end);
  assert(fm.includes('name: forge'), 'name manquant');
  assert(fm.includes('description:'), 'description manquante');
});

test('SKILL.md documente les 9 phases', () => {
  const c = fs.readFileSync(path.join(SKILL_DIR, 'SKILL.md'), 'utf-8');
  for (let i = 0; i <= 8; i++) assert(c.includes(`Phase ${i}`), `Phase ${i} non documentée`);
});

test('SKILL.md documente les 4 garanties (anchor, .forge, qui fait foi, audit)', () => {
  const c = fs.readFileSync(path.join(SKILL_DIR, 'SKILL.md'), 'utf-8');
  assert(c.includes('anchor'), 'la résolution de l\'anchor doit être documentée');
  assert(c.includes('.forge'), 'la règle du dossier .forge doit être documentée');
  assert(c.includes('AUTORITÉ'), 'la règle de qui fait foi doit être documentée');
  assert(c.includes('audit'), 'l\'audit doit être documenté');
});

test('SKILL.md ne contient plus l\'argument contre les sous-agents', () => {
  const c = fs.readFileSync(path.join(SKILL_DIR, 'SKILL.md'), 'utf-8');
  assert(!c.includes('Pourquoi cette approche plutôt que des agents séparés'),
    'la section qui oppose la rotation de posture aux sous-agents a été supprimée mais SKILL.md la contient encore');
});

test('les 7 références existent', () => {
  const refs = ['state-schema', 'module-prioritization', 'design-quality', 'archetypes', 'fast-track', 'impact-protocol', 'review-checklists'];
  for (const r of refs) {
    assert(fs.existsSync(path.join(SKILL_DIR, 'references', `${r}.md`)), `references/${r}.md manquant`);
  }
});

test('les 9 templates existent', () => {
  const t = ['conventions', 'prd', 'roadmap', 'benchmarks', 'design-system', 'screen', 'architecture', 'implementation-plan', 'test-plan', 'audit-issues'];
  for (const x of t) {
    assert(fs.existsSync(path.join(SKILL_DIR, 'templates', `${x}.md.tmpl`)), `templates/${x}.md.tmpl manquant`);
  }
});

test('les 6 scripts existent et sont syntaxiquement valides', () => {
  for (const s of ['state', 'forge-guard', 'coverage-check', 'dependency-check', 'audit-report', 'selftest']) {
    const p = path.join(SCRIPTS, `${s}.js`);
    assert(fs.existsSync(p), `scripts/${s}.js manquant`);
    try {
      execFileSync('node', ['--check', p], { stdio: 'pipe' });
    } catch (e) {
      throw new Error(`scripts/${s}.js a une erreur de syntaxe`);
    }
  }
});

/* ------------------------------------------------------------------ *
 * 2. Cohérence lib <-> scripts
 * ------------------------------------------------------------------ */

section('Cohérence bibliothèque / scripts');

test('chaque script hors lib require forge-lib (pas de lecture directe de state.json)', () => {
  const scripts = ['state.js', 'forge-guard.js', 'coverage-check.js', 'dependency-check.js', 'audit-report.js'];
  for (const s of scripts) {
    const c = fs.readFileSync(path.join(SCRIPTS, s), 'utf-8');
    assert(c.includes("require('./lib/forge-lib')"), `${s} n'utilise pas forge-lib`);
    assert(!c.includes("'.forge/state.json'"), `${s} hardcode le chemin de state.json au lieu d'utiliser la lib`);
  }
});

test('CANONICAL_LAYOUT : chaque entrée a un template ou un emplacement déclaré', () => {
  const lib = require(path.join(SCRIPTS, 'lib', 'forge-lib.js'));
  const templated = ['conventions', 'prd', 'roadmap', 'benchmarks', 'architecture', 'test_plan'];
  for (const key of templated) {
    assert(lib.CANONICAL_LAYOUT[key], `${key} absent de CANONICAL_LAYOUT`);
  }
  assert(lib.CANONICAL_LAYOUT.design_system === '.forge/design/design-system.md',
    'le design system doit être canoniquement dans .forge/design/');
});

test('chaque statut utilisé par state.js appartient au vocabulaire', () => {
  const lib = require(path.join(SCRIPTS, 'lib', 'forge-lib.js'));
  for (const [key, vocab] of Object.entries(lib.STATUS_VOCAB)) {
    assert(Array.isArray(vocab) && vocab.length, `vocabulaire ${key} vide`);
  }
  assert(lib.STATUS_VOCAB.document.includes('stale'), 'le statut "stale" doit exister pour les documents');
});

/* ------------------------------------------------------------------ *
 * 3. Contrats d'agents
 * ------------------------------------------------------------------ */

section('Contrats d\'agents');

const AGENTS = ['product-analyst', 'scope-architect', 'ux-designer', 'systems-architect', 'quality-analyst', 'red-team', 'plan-validator', 'forge-implementer'];

test('les 8 agents existent', () => {
  for (const a of AGENTS) {
    assert(fs.existsSync(path.join(SKILL_DIR, 'agents', `${a}.md`)), `agents/${a}.md manquant`);
  }
});

test('chaque agent déclare un contrat exploitable (phases, modes, inputs)', () => {
  for (const a of AGENTS) {
    const c = fs.readFileSync(path.join(SKILL_DIR, 'agents', `${a}.md`), 'utf-8');
    assert(c.startsWith('---'), `${a} : front matter manquant`);
    assert(/^phases:\s*\[/m.test(c), `${a} : clé "phases" manquante`);
    assert(/^modes:\s*\[/m.test(c), `${a} : clé "modes" manquante`);
    assert(/^## Inputs/m.test(c), `${a} : section "## Inputs" manquante`);
    assert(/\.forge/.test(c), `${a} : ne référence aucun chemin .forge`);
  }
});

test('les deux validateurs Fast Track ont un contrat de sortie JSON strict', () => {
  for (const a of ['quality-analyst', 'red-team', 'plan-validator']) {
    const c = fs.readFileSync(path.join(SKILL_DIR, 'agents', `${a}.md`), 'utf-8');
    assert(c.includes('"verdict"'), `${a} : le contrat de sortie ne définit pas "verdict"`);
    assert(c.includes('PASS') && c.includes('REVISE') && c.includes('BLOCK'),
      `${a} : les trois verdicts ne sont pas définis`);
    assert(c.includes('findings'), `${a} : le contrat de sortie ne définit pas "findings"`);
  }
});

test('ux-designer impose la priorisation de navigation et la qualité de design', () => {
  const c = fs.readFileSync(path.join(SKILL_DIR, 'agents', 'ux-designer.md'), 'utf-8');
  assert(c.includes('module-prioritization'), 'la priorisation de navigation n\'est pas référencée');
  assert(c.includes('design-quality'), 'les règles de qualité de design ne sont pas référencées');
  assert(c.includes('screen.md.tmpl'), 'le gabarit d\'écran n\'est pas référencé');
});

/* ------------------------------------------------------------------ *
 * 4. Garde-fou 1 — livrables dans .forge
 * ------------------------------------------------------------------ */

section('Garde-fou 1 — les livrables vivent dans .forge');

test('register refuse un chemin hors de .forge', () => {
  const p = makeProject('g1-outside');
  initProject(p, 'G1');
  const res = run('state.js', ['register', p, 'deliverable', 'prd', '/tmp/prd-hors-forge.md']);
  assert(res.code !== 0, 'register aurait dû échouer');
  assert(res.json && res.json.error === 'outside_forge_dir', `erreur inattendue : ${JSON.stringify(res.json)}`);
});

test('register refuse un chemin non canonique', () => {
  const p = makeProject('g1-canonical');
  initProject(p, 'G1');
  const res = run('state.js', ['register', p, 'deliverable', 'prd', '.forge/prd-v2.md']);
  assert(res.code !== 0, 'register aurait dû échouer');
  assert(res.json && res.json.error === 'non_canonical_path', `erreur inattendue : ${JSON.stringify(res.json)}`);
});

test('register refuse un chemin dans un dossier temporaire', () => {
  const p = makeProject('g1-temp');
  initProject(p, 'G1');
  const res = run('state.js', ['register', p, 'deliverable', 'prd', '.forge/.tmp/prd.md']);
  assert(res.code !== 0, 'register aurait dû échouer');
});

test('le guard détecte un livrable égaré hors de .forge', () => {
  const p = makeProject('g1-stray');
  initProject(p, 'G1');
  writeDeliverable(p, 'docs/roadmap.md', { type: 'roadmap' });
  const res = run('forge-guard.js', ['strays', p]);
  assert(res.code !== 0, 'le guard aurait dû échouer');
  const strays = res.json.checks[0].strays;
  assert(strays.some(s => s.path === path.join('docs', 'roadmap.md')), `livrable égaré non détecté : ${JSON.stringify(strays)}`);
});

test('le guard ne signale pas les livrables d\'un projet de référence', () => {
  const ref = makeProject('g1-ref');
  initProject(ref, 'Ref');
  const p = makeProject('g1-main');
  initProject(p, 'Main', [ref]);
  writeDeliverable(ref, '.forge/roadmap.md', { type: 'roadmap' });
  const res = run('forge-guard.js', ['strays', p]);
  const strays = res.json.checks[0].strays;
  assert(!strays.some(s => s.path.includes('g1-ref')), 'le projet de référence ne doit pas être signalé');
});

test('le guard signale un livrable dont le chemin est hors .forge', () => {
  const p = makeProject('g1-pathcheck');
  initProject(p, 'G1');
  const s = readState(p);
  s.deliverables.prd = { path: 'docs/prd.md', type: 'prd', status: 'draft' };
  writeState(p, s);
  const res = run('forge-guard.js', ['paths', p]);
  assert(res.code !== 0, 'le guard aurait dû échouer');
  const offenders = res.json.checks[0].offenders;
  assert(offenders.some(o => o.problems.includes('outside_forge_dir')), `problème non signalé : ${JSON.stringify(offenders)}`);
});

/* ------------------------------------------------------------------ *
 * 5. Garde-fou 2 — state.json ne contient pas de contenu
 * ------------------------------------------------------------------ */

section('Garde-fou 2 — state.json ne contient que des métadonnées');

test('le guard rejette une clé interdite (content)', () => {
  const p = makeProject('g2-key');
  initProject(p, 'G2');
  const s = readState(p);
  s.deliverables.prd = { path: '.forge/prd.md', type: 'prd', status: 'draft', content: '# PRD\n\ntexte' };
  writeState(p, s);
  const res = run('forge-guard.js', ['state', p]);
  assert(res.code !== 0, 'le guard aurait dû échouer');
  const v = res.json.checks.find(c => c.check === 'state_schema_clean').violations;
  assert(v.some(x => x.problem === 'forbidden_key'), `clé interdite non détectée : ${JSON.stringify(v)}`);
});

test('le guard détecte un PRD collé dans state.json (bloc de texte volumineux)', () => {
  const p = makeProject('g2-content');
  initProject(p, 'G2');
  const s = readState(p);
  s.deliverables.prd = { path: '.forge/prd.md', type: 'prd', status: 'draft', notes: 'lorem ipsum '.repeat(400) };
  writeState(p, s);
  const res = run('forge-guard.js', ['state', p]);
  assert(res.code !== 0, 'le guard aurait dû échouer');
  const v = res.json.checks.find(c => c.check === 'state_schema_clean').violations;
  assert(v.some(x => x.problem === 'content_in_state'), `contenu détecté comme métadonnée : ${JSON.stringify(v)}`);
});

test('le guard rejette une clé racine inconnue', () => {
  const p = makeProject('g2-unknown');
  initProject(p, 'G2');
  const s = readState(p);
  s.prd_content = 'nope';
  writeState(p, s);
  const res = run('forge-guard.js', ['state', p]);
  assert(res.code !== 0, 'le guard aurait dû échouer');
  const v = res.json.checks.find(c => c.check === 'state_schema_clean').violations;
  assert(v.some(x => x.problem === 'unknown_root_key'), `clé racine inconnue non détectée : ${JSON.stringify(v)}`);
});

test('le guard rejette un statut hors vocabulaire', () => {
  const p = makeProject('g2-status');
  initProject(p, 'G2');
  writeDeliverable(p, '.forge/prd.md');
  run('state.js', ['register', p, 'deliverable', 'prd', '.forge/prd.md']);
  const s = readState(p);
  s.deliverables.prd.status = 'bientot_fini';
  writeState(p, s);
  const res = run('forge-guard.js', ['state', p]);
  assert(res.code !== 0, 'le guard aurait dû échouer');
  const bad = res.json.checks.find(c => c.check === 'status_vocabulary_valid').invalid;
  assert(bad.some(b => b.status === 'bientot_fini'), `statut invalide non détecté : ${JSON.stringify(bad)}`);
});

/* ------------------------------------------------------------------ *
 * 6. Garde-fou 3 — état = autorité, front matter = miroir
 * ------------------------------------------------------------------ */

section('Garde-fou 3 — synchronisation état / front matter');

test('set-status écrit le statut dans state.json ET dans le front matter', () => {
  const p = makeProject('g3-write');
  initProject(p, 'G3');
  writeDeliverable(p, '.forge/prd.md', { status: 'draft' });
  run('state.js', ['register', p, 'deliverable', 'prd', '.forge/prd.md']);

  const res = run('state.js', ['set-status', p, 'deliverable', 'prd', 'approved']);
  assert(res.code === 0, `set-status a échoué : ${res.stdout}`);
  assert(readState(p).deliverables.prd.status === 'approved', 'state.json non mis à jour');
  assert(frontMatterStatus(p, '.forge/prd.md') === 'approved', 'front matter non mis à jour');
  assert(res.json.mirrored && res.json.mirrored.changed === true, 'le miroir n\'a pas été signalé comme modifié');
});

test('le guard détecte une divergence état / front matter', () => {
  const p = makeProject('g3-detect');
  initProject(p, 'G3');
  // Le bug reporté : state.json dit `implemented`, le .md dit encore `draft`.
  // `implemented` est un statut de slice, pas de document — on passe par une slice.
  writeDeliverable(p, '.forge/plans/slice-x.md', { type: 'implementation-plan', status: 'draft' });
  const s = readState(p);
  s.slices['slice-x'] = { module: 'm', status: 'draft', rule_ids: [], plan_path: '.forge/plans/slice-x.md' };
  writeState(p, s);
  run('state.js', ['register', p, 'slice', 'slice-x', '.forge/plans/slice-x.md']);
  run('state.js', ['set-status', p, 'slice', 'slice-x', 'implemented']);
  assert(frontMatterStatus(p, '.forge/plans/slice-x.md') === 'implemented', 'le miroir n\'a pas été écrit');

  // Édition hors bande : quelqu'un repasse le front matter à draft.
  const abs = path.join(p, '.forge/plans/slice-x.md');
  fs.writeFileSync(abs, fs.readFileSync(abs, 'utf-8').replace('status: implemented', 'status: draft'));

  const res = run('forge-guard.js', ['sync', p]);
  assert(res.code !== 0, 'le guard aurait dû détecter la divergence');
  const d = res.json.checks[0].divergences;
  assert(d.length === 1 && d[0].reason === 'status_mismatch', `divergence mal décrite : ${JSON.stringify(d)}`);
  assert(d[0].stateStatus === 'implemented' && d[0].fileStatus === 'draft',
    `authority/mirror mal orientés : ${JSON.stringify(d[0])}`);
});

test('sync --fix réaligne le front matter sur state.json (autorité)', () => {
  const p = makeProject('g3-fix');
  initProject(p, 'G3');
  writeDeliverable(p, '.forge/prd.md', { status: 'draft' });
  run('state.js', ['register', p, 'deliverable', 'prd', '.forge/prd.md']);
  run('state.js', ['set-status', p, 'deliverable', 'prd', 'approved']);
  const abs = path.join(p, '.forge/prd.md');
  fs.writeFileSync(abs, fs.readFileSync(abs, 'utf-8').replace('status: approved', 'status: draft'));

  const res = run('forge-guard.js', ['sync', p, '--fix']);
  assert(res.code === 0, `après --fix le guard devrait passer : ${res.stdout}`);
  assert(frontMatterStatus(p, '.forge/prd.md') === 'approved', 'le front matter n\'a pas été réaligné');
});

test('changer un statut n\'invalide pas le content_hash (le corps seul est hashé)', () => {
  const p = makeProject('g3-hash');
  initProject(p, 'G3');
  writeDeliverable(p, '.forge/prd.md', { status: 'draft' });
  run('state.js', ['register', p, 'deliverable', 'prd', '.forge/prd.md']);
  const before = readState(p).deliverables.prd.content_hash;
  assert(before, 'content_hash absent après register');

  run('state.js', ['set-status', p, 'deliverable', 'prd', 'approved']);
  const after = readState(p).deliverables.prd.content_hash;
  assert(before === after, `le hash a changé sur un simple changement de statut : ${before} → ${after}`);
});

test('le guard détecte une édition hors bande (dérive du hash)', () => {
  const p = makeProject('g3-drift');
  initProject(p, 'G3');
  writeDeliverable(p, '.forge/prd.md', { status: 'draft', body: 'Version initiale.' });
  run('state.js', ['register', p, 'deliverable', 'prd', '.forge/prd.md']);

  const abs = path.join(p, '.forge/prd.md');
  fs.writeFileSync(abs, fs.readFileSync(abs, 'utf-8').replace('Version initiale.', 'Version modifiée en douce.'));

  const res = run('forge-guard.js', ['state', p]);
  assert(res.code !== 0, 'le guard aurait dû détecter la dérive');
  const d = res.json.checks.find(c => c.check === 'content_hashes_current').drifted;
  assert(d.some(x => x.kind === 'deliverable' && x.artifact === 'prd'), `dérive non détectée : ${JSON.stringify(d)}`);
});

/* ------------------------------------------------------------------ *
 * 7. Garde-fou 4 — le projet de référence ne hijacke pas l'anchor
 * ------------------------------------------------------------------ */

section('Garde-fou 4 — résolution du projet courant');

test('l\'anchor résolu est le projet courant, pas le Legacy voisin', () => {
  const legacy = makeProject('g4-legacy');
  fs.mkdirSync(path.join(legacy, '.forge'), { recursive: true });
  fs.writeFileSync(path.join(legacy, '.forge', 'state.json'), JSON.stringify({ version: 2, project: { path: legacy } }));
  const app = makeProject('g4-app');

  const res = run('state.js', ['anchor', app]);
  assert(res.code === 0, `anchor a échoué : ${res.stdout}`);
  assert(path.resolve(res.json.anchor) === path.resolve(app),
    `l'anchor devrait être ${app}, obtenu ${res.json.anchor}`);
  assert(res.json.source === 'project_marker', `source inattendue : ${res.json.source}`);
});

test('anchor refuse un projet de référence déclaré (sans .forge)', () => {
  // Cas réel et le plus dangereux : le legacy n'a pas de .forge, seulement un
  // package.json. resolveAnchor le sélectionne donc via son marqueur de projet.
  // C'est le projet hôte qui le déclare comme référence.
  const legacy = makeProject('g4-ref2');
  const host = makeProject('g4-host2');
  initProject(host, 'Host', [legacy]);
  const inside = path.join(legacy, 'src');
  fs.mkdirSync(inside, { recursive: true });
  fs.writeFileSync(path.join(inside, 'index.js'), '// code legacy\n');

  const res = run('state.js', ['anchor', inside]);
  assert(res.code !== 0, 'anchor aurait dû être bloqué sur le projet de référence');
  assert(res.json && res.json.warning && res.json.warning.includes('BLOCKED'),
    `avertissement de blocage manquant : ${JSON.stringify(res.json)}`);
});

test('le guard signale un anchor hijacké', () => {
  const legacy = makeProject('g4-guard-ref2');
  const host = makeProject('g4-guard-host2');
  initProject(host, 'Host', [legacy]);
  const res = run('forge-guard.js', ['anchor', legacy]);
  assert(res.code !== 0, 'le guard aurait dû échouer');
  const c = res.json.checks[0];
  assert(c.check === 'anchor_is_current_project' && c.hijacked_by,
    `hijack non signalé : ${JSON.stringify(c)}`);
});

test('anchor n\'est pas bloqué dans le projet courant', () => {
  const legacy = makeProject('g4-ok-legacy');
  const host = makeProject('g4-ok-host');
  initProject(host, 'Host', [legacy]);
  const res = run('state.js', ['anchor', host]);
  assert(res.code === 0, `anchor ne devrait pas être bloqué dans le projet courant : ${res.stdout}`);
  assert(path.resolve(res.json.anchor) === path.resolve(host), 'l\'anchor devrait être le projet hôte');
});

test('un répertoire greenfield vide s\'ancre sur lui-même, pas sur le parent', () => {
  // Régression : un projet neuf est un répertoire vide. Sans cette règle, la
  // remontée à la recherche d'un marqueur ancrerait le nouveau projet sur un
  // monorepo ou un projet voisin — le bug d'ancrage erroné, sous une autre forme.
  const parent = makeProject('g4-mono');
  const fresh = path.join(parent, 'nouvelle-app');
  fs.mkdirSync(fresh, { recursive: true });

  const res = run('state.js', ['anchor', fresh]);
  assert(res.code === 0, `anchor a échoué : ${res.stdout}`);
  assert(path.resolve(res.json.anchor) === path.resolve(fresh),
    `un projet greenfield vide doit s'ancrer sur lui-même, obtenu ${res.json.anchor}`);
  assert(res.json.source === 'cwd', `source inattendue : ${res.json.source}`);
});

test('un sous-dossier non vide remonte et le signale', () => {
  const project = makeProject('g4-sub');
  const sub = path.join(project, 'src', 'deep');
  fs.mkdirSync(sub, { recursive: true });
  fs.writeFileSync(path.join(sub, 'index.js'), '// code\n');

  const res = run('state.js', ['anchor', sub]);
  assert(path.resolve(res.json.anchor) === path.resolve(project), `l'anchor devrait remonter à ${project}`);
  assert(res.json.ascended === true, 'la remontée doit être signalée');
  assert(res.json.warning && res.json.warning.includes('REMONTÉE'),
    `un avertissement de remontée est attendu : ${JSON.stringify(res.json.warning)}`);
});

test('anchor reprend un projet en cours depuis un sous-dossier', () => {
  const p = makeProject('g4-resume');
  initProject(p, 'Resume');
  const sub = path.join(p, 'src', 'deep');
  fs.mkdirSync(sub, { recursive: true });
  const res = run('state.js', ['anchor', sub]);
  assert(path.resolve(res.json.anchor) === path.resolve(p), `l'anchor devrait remonter à ${p}, obtenu ${res.json.anchor}`);
  assert(res.json.source === 'existing_state', `source inattendue : ${res.json.source}`);
});

test('le projet de référence est déclaré en lecture seule et modifiable par init', () => {
  const ref = makeProject('g4-declared');
  const p = makeProject('g4-host');
  initProject(p, 'Host', [ref]);
  const s = readState(p);
  assert(Array.isArray(s.reference_projects) && s.reference_projects.length === 1, 'le projet de référence n\'est pas enregistré');
  assert(s.reference_projects[0].read_only === true, 'le projet de référence doit être marqué read_only');
  assert(path.resolve(s.reference_projects[0].path) === path.resolve(ref), 'chemin du projet de référence incorrect');
});

/* ------------------------------------------------------------------ *
 * 8. Priorisation de navigation
 * ------------------------------------------------------------------ */

section('Priorisation de la navigation');

test('set-nav refuse plus de 5 items principaux', () => {
  const p = makeProject('nav-cap');
  initProject(p, 'Nav');
  const items = ['a', 'b', 'c', 'd', 'e', 'f'].map((k, i) => ({ key: k, label: k, rank: i + 1, frequency: 3, task_criticality: 3 }));
  const res = run('state.js', ['set-nav', p, JSON.stringify({ archetype: 'dashboard', items })]);
  assert(res.code !== 0, 'set-nav aurait dû refuser 6 items principaux');
  assert(res.json && res.json.error === 'too_many_primary_nav_items', `erreur inattendue : ${JSON.stringify(res.json)}`);
});

test('set-nav accepte un ordre justifié et le persiste', () => {
  const p = makeProject('nav-ok');
  initProject(p, 'Nav');
  const items = [
    { key: 'accueil', label: 'Accueil', rank: 1, frequency: 5, task_criticality: 5, rationale: 'ouvre la boucle' },
    { key: 'finance', label: 'Finance', rank: 2, frequency: 5, task_criticality: 4, rationale: 'saisie quotidienne' },
    { key: 'contrats', label: 'Contrats', rank: 3, frequency: 3, task_criticality: 4, rationale: 'échéances' }
  ];
  const res = run('state.js', ['set-nav', p, JSON.stringify({ archetype: 'mobile_field_ops', items })]);
  assert(res.code === 0, `set-nav a échoué : ${res.stdout}`);
  const nav = readState(p).index.nav;
  assert(nav.items.length === 3, 'les items ne sont pas persistés');
  assert(nav.items[1].key === 'finance', 'l\'ordre retenu n\'est pas celui demandé');
  assert(readState(p).product.archetype === 'mobile_field_ops', 'l\'archétype n\'est pas enregistré');
});

test('set-nav refuse un doublon de clé', () => {
  const p = makeProject('nav-dup');
  initProject(p, 'Nav');
  const items = [
    { key: 'accueil', label: 'Accueil', rank: 1 },
    { key: 'accueil', label: 'Accueil bis', rank: 2 }
  ];
  const res = run('state.js', ['set-nav', p, JSON.stringify({ items })]);
  assert(res.code !== 0, 'set-nav aurait dû refuser un doublon');
});

test('module-prioritization documente le cas d\'usage de référence (Finance avant Contrats)', () => {
  const c = fs.readFileSync(path.join(SKILL_DIR, 'references', 'module-prioritization.md'), 'utf-8');
  assert(/Finance/.test(c) && /Contrats/.test(c), 'le cas d\'usage de gestion locative doit être documenté');
  assert(c.includes('set-nav'), 'l\'enregistrement via set-nav doit être documenté');
});

/* ------------------------------------------------------------------ *
 * 9. Qualité des livrables
 * ------------------------------------------------------------------ */

section('Qualité des livrables');

test('le guard détecte un {{PLACEHOLDER}} résiduel', () => {
  const p = makeProject('q-placeholder');
  initProject(p, 'Q');
  writeDeliverable(p, '.forge/prd.md', { body: 'Résumé exécutif\n\nProduit : {{PRODUCT_NAME}}' });
  run('state.js', ['register', p, 'deliverable', 'prd', '.forge/prd.md']);
  const res = run('forge-guard.js', ['placeholders', p]);
  assert(res.code !== 0, 'le guard aurait dû échouer');
  const o = res.json.checks[0].offenders;
  assert(o.some(x => x.placeholders.includes('{{PRODUCT_NAME}}')), `placeholder non détecté : ${JSON.stringify(o)}`);
});

test('le guard passe sur un livrable propre', () => {
  const p = makeProject('q-clean');
  initProject(p, 'Q');
  writeDeliverable(p, '.forge/prd.md', { body: 'Résumé exécutif\n\nProduit : Gestion Locative' });
  run('state.js', ['register', p, 'deliverable', 'prd', '.forge/prd.md']);
  const res = run('forge-guard.js', ['placeholders', p]);
  assert(res.code === 0, `le guard ne devrait pas échouer : ${res.stdout}`);
});

test('le gabarit d\'écran exige les 9 états et la section anti-générique', () => {
  const c = fs.readFileSync(path.join(SKILL_DIR, 'templates', 'screen.md.tmpl'), 'utf-8');
  for (const s of ['Chargement', 'Rempli', 'Vide', 'Erreur', 'Succès', 'Lecture seule', 'Anti-générique', 'Accessibilité', 'Traçabilité']) {
    assert(c.includes(s), `le gabarit d'écran ne couvre pas « ${s} »`);
  }
});

test('design-quality liste des skills de design obligatoires et des interdits', () => {
  const c = fs.readFileSync(path.join(SKILL_DIR, 'references', 'design-quality.md'), 'utf-8');
  assert(c.includes('imagegen-frontend-mobile'), 'le skill mobile doit être référencé');
  assert(c.includes('#3B82F6'), 'la palette par défaut doit être interdite explicitement');
  assert(c.includes('blanc pur'), 'le blanc pur non choisi doit être interdit');
  assert(c.includes('anti-références') || c.includes('Anti-références'), 'les anti-références doivent être exigées');
});

test('archetypes fournit la grille de comparaison et les 7 archétypes', () => {
  const c = fs.readFileSync(path.join(SKILL_DIR, 'references', 'archetypes.md'), 'utf-8');
  for (const a of ['mobile_field_ops', 'mobile_consumer', 'marketplace', 'dashboard', 'admin_crud', 'transactional_web', 'booking']) {
    assert(c.includes(a), `archétype ${a} manquant`);
  }
  assert(c.includes('Grille de comparaison'), 'la grille de comparaison est absente');
});

/* ------------------------------------------------------------------ *
 * 10. Fast Track
 * ------------------------------------------------------------------ */

section('Fast Track');

test('fast-track.md définit conditions d\'entrée, limites et échappatoire', () => {
  const c = fs.readFileSync(path.join(SKILL_DIR, 'references', 'fast-track.md'), 'utf-8');
  assert(c.includes("Conditions d'entrée"), 'les conditions d\'entrée manquent');
  assert(c.includes('Tentatives de révision'), 'la limite de tentatives manque');
  assert(c.includes('Échappatoire'), 'l\'échappatoire manque');
  assert(c.includes('Checkpoint humain') || c.includes('checkpoint'), 'le checkpoint humain manque');
  assert(c.includes('en parallèle'), 'la validation parallèle des agents manque');
});

test('fast-track exige le passage par les scripts avant les agents', () => {
  const c = fs.readFileSync(path.join(SKILL_DIR, 'references', 'fast-track.md'), 'utf-8');
  assert(/scripts? (d'abord|avant)/i.test(c), 'les scripts doivent passer avant les agents');
});

test('l\'audit est journalisé et l\'analyse inter-projets existe', () => {
  const sk = fs.readFileSync(path.join(SKILL_DIR, 'SKILL.md'), 'utf-8');
  assert(/state\.js"?\s+log/.test(sk), 'la commande de journalisation doit être documentée');
  assert(sk.includes('audit-report.js'), 'l\'analyse inter-projets doit être documentée');
  assert(fs.existsSync(path.join(SKILL_DIR, 'templates', 'audit-issues.md.tmpl')), 'le gabarit d\'incidents manque');
  const t = fs.readFileSync(path.join(SKILL_DIR, 'templates', 'audit-issues.md.tmpl'), 'utf-8');
  assert(t.includes('Cause racine'), 'le gabarit d\'incidents exige une cause racine');
  assert(t.includes('Origine'), 'le gabarit d\'incidents exige une origine');
});

test('audit-report fusionne plusieurs projets et distingue le structurel', () => {
  const host = path.join(tmpRoot, 'audit-host');
  fs.mkdirSync(host, { recursive: true });
  for (const name of ['audit-a', 'audit-b']) {
    const p = path.join(host, name);
    fs.mkdirSync(p, { recursive: true });
    fs.writeFileSync(path.join(p, 'package.json'), JSON.stringify({ name, version: '0.0.0' }));
    initProject(p, name);
    run('state.js', ['log', p, 'user_correction', 'le PRD ne doit pas contenir de jargon', 'phase=1']);
  }
  const outDir = path.join(tmpRoot, 'reports');
  const res = run('audit-report.js', [host, '--out', outDir]);
  assert(fs.existsSync(outDir), 'le rapport n\'a pas été écrit');
  const files = fs.readdirSync(outDir).filter(f => f.endsWith('.md'));
  assert(files.length > 0, 'aucun rapport Markdown produit');
  const md = fs.readFileSync(path.join(outDir, files[0]), 'utf-8');
  assert(md.includes('Correction utilisateur'), 'la récurrence n\'est pas agrégée');
  assert(md.includes('Structurel'), 'la distinction structurel/ponctuel est absente');
  assert(res.code === 2, `un problème structureux doit sortir en 2, obtenu ${res.code}`);
});

/* ------------------------------------------------------------------ *
 * 11. Migration v1 → v2
 * ------------------------------------------------------------------ */

section('Migration v1 → v2');

test('un state.json v1 est refusé, pas migré silencieusement', () => {
  const p = makeProject('m-refuse');
  fs.mkdirSync(path.join(p, '.forge'), { recursive: true });
  fs.writeFileSync(path.join(p, '.forge', 'state.json'), JSON.stringify({ version: 1, documents: {} }));
  const res = run('state.js', ['status', p]);
  assert(res.code !== 0, 'un state v1 aurait dû être refusé');
  assert(res.json && res.json.error === 'legacy_state_v1', `erreur inattendue : ${JSON.stringify(res.json)}`);
  assert(res.json.hint && res.json.hint.includes('migrate'), 'le message doit indiquer la commande migrate');
});

test('migrate convertit documents → deliverables', () => {
  const p = makeProject('m-convert');
  fs.mkdirSync(path.join(p, '.forge'), { recursive: true });
  writeDeliverable(p, '.forge/prd.md', { type: 'prd', status: 'approved' });
  fs.writeFileSync(path.join(p, '.forge', 'state.json'), JSON.stringify({
    version: 1,
    product: { name: 'Legacy' },
    current_phase: '4',
    documents: { prd: { path: '.forge/prd.md', status: 'approved' } }
  }));
  const res = run('state.js', ['migrate', p]);
  assert(res.code === 0, `migrate a échoué : ${res.stdout}`);
  const s = readState(p);
  assert(s.version === 2, 'la version n\'est pas passée à 2');
  assert(!s.documents, 'l\'ancienne clé documents doit disparaître');
  assert(s.deliverables.prd.status === 'approved', 'le statut du PRD a été perdu');
  assert(s.deliverables.prd.content_hash, 'le content_hash n\'a pas été recalculé');
  assert(s.deliverables.architecture, 'les livrables canoniques manquants ne sont pas créés');
});

test('migrate déplace le design system vers .forge/design/', () => {
  const p = makeProject('m-move');
  fs.mkdirSync(path.join(p, '.forge'), { recursive: true });
  writeDeliverable(p, '.forge/design-system.md', { type: 'design-system', status: 'approved' });
  fs.writeFileSync(path.join(p, '.forge', 'state.json'), JSON.stringify({
    version: 1,
    documents: { design_system: { path: '.forge/design-system.md', status: 'approved' } }
  }));
  const res = run('state.js', ['migrate', p]);
  assert(res.code === 0, `migrate a échoué : ${res.stdout}`);
  assert(fs.existsSync(path.join(p, '.forge/design/design-system.md')), 'le design system n\'a pas été déplacé');
  assert(!fs.existsSync(path.join(p, '.forge/design-system.md')), 'l\'ancien emplacement existe encore');
  assert(readState(p).deliverables.design_system.path === '.forge/design/design-system.md', 'le chemin n\'a pas été mis à jour');
});

test('migrate est idempotent', () => {
  const p = makeProject('m-idem');
  fs.mkdirSync(path.join(p, '.forge'), { recursive: true });
  fs.writeFileSync(path.join(p, '.forge', 'state.json'), JSON.stringify({ version: 1, documents: {} }));
  run('state.js', ['migrate', p]);
  const res = run('state.js', ['migrate', p]);
  assert(res.code === 0, 'la seconde migration a échoué');
  assert(res.json.status === 'noop', 'la seconde migration devait être un no-op');
});

/* ------------------------------------------------------------------ *
 * 11. Mémoire, frontière, constat routé
 * ------------------------------------------------------------------ */

section('Mémoire, frontière et routage des constats');

test('state.js start assemble l\'état réel', () => {
  const p = makeProject('m-start');
  initProject(p, 'Mem');
  const res = run('state.js', ['start', p]);
  assert(res.code === 0, `start a échoué : ${res.stdout}`);
  for (const key of ['phase', 'slices', 'unpromoted_findings', 'project_memory', 'next_actions', 'deliverables']) {
    assert(key in res.json, `start ne renvoie pas "${key}"`);
  }
});

test('state.js start signale une slice faite SANS cas de test', () => {
  const p = makeProject('m-start-suspect');
  initProject(p, 'Mem');
  const s = readState(p);
  s.slices = { 'slice-x': { status: 'done', plan_path: '.forge/plans/slice-x.md' } };
  writeState(p, s);
  const res = run('state.js', ['start', p]);
  assert(res.json.slices.suspect.length === 1, `slice suspecte non détectée : ${JSON.stringify(res.json.slices)}`);
  assert(res.json.slices.suspect[0].name === 'slice-x', 'mauvaise slice signalée');
  assert(res.json.next_actions.some(a => /sans test/.test(a)), `aucune action proposée : ${JSON.stringify(res.json.next_actions)}`);
});

test('un constat SANS domaine est refusé', () => {
  const p = makeProject('m-no-domain');
  initProject(p, 'Mem');
  const res = run('state.js', ['finding', p, '--severity=majeur', 'un fait', 'une correction']);
  assert(res.code !== 0, 'un constat sans domaine aurait dû être refusé');
  assert(res.json.error === 'missing_domain', `erreur inattendue : ${JSON.stringify(res.json)}`);
});

test('un constat avec un domaine INCONNU est refusé', () => {
  const p = makeProject('m-bad-domain');
  initProject(p, 'Mem');
  const res = run('state.js', ['finding', p, '--domain=magic.md', 'un fait', 'une correction']);
  assert(res.code !== 0, 'un domaine non routable aurait dû être refusé');
  assert(res.json.error === 'unknown_domain', `erreur inattendue : ${JSON.stringify(res.json)}`);
});

test('un constat routé est enregistré, puis promu', () => {
  const p = makeProject('m-promote');
  initProject(p, 'Mem');
  const raised = run('state.js', ['finding', p, '--domain=testing.md', '--severity=majeur', 'un attendu invente', 'le calculer']);
  assert(raised.code === 0, `le constat a été refusé : ${raised.stdout}`);
  const id = raised.json.finding.id;
  assert(readState(p).findings[0].domain === 'testing.md', 'le domaine n\'est pas enregistré');

  const resolved = run('state.js', ['finding', p, '--resolve', id, '--promoted-to', 'testing.md']);
  assert(resolved.code === 0, `la promotion a échoué : ${resolved.stdout}`);
  assert(resolved.json.id === id && resolved.json.promoted_to === 'testing.md',
    `promotion mal enregistrée : ${JSON.stringify(resolved.json)}`);

  const start = run('state.js', ['start', p]);
  assert(start.json.unpromoted_findings.count === 0, 'le constat promu reste compté comme non promu');
});

test('les deux formes de drapeau sont acceptées (--k=v et --k v)', () => {
  const p = makeProject('m-flags');
  initProject(p, 'Mem');
  assert(run('state.js', ['finding', p, '--domain=i18n.md', 'a', 'b']).code === 0, '--domain=v échoue');
  assert(run('state.js', ['finding', p, '--domain', 'testing.md', 'c', 'd']).code === 0, '--domain v échoue');
});

test('forge-guard facts détecte un conflit de version entre fichiers', () => {
  const p = makeProject('m-facts');
  initProject(p, 'Mem');
  fs.mkdirSync(path.join(p, '.opencode', 'rules'), { recursive: true });
  fs.writeFileSync(path.join(p, 'pubspec.yaml'), 'name: m\ndependencies:\n  intl: 0.20.2\n');
  fs.writeFileSync(path.join(p, '.opencode', 'rules', 'i18n.md'), '# r\n\n| Package | Version |\n|---|---|\n| `intl` | 0.20.3 |\n');
  fs.writeFileSync(path.join(p, 'AGENTS.md'), '# A\n\n| P | V |\n|---|---|\n| `intl` | 0.20.2 |\n');

  const res = run('forge-guard.js', ['facts', p]);
  assert(res.code !== 0, 'le conflit de version aurait dû être détecté');
  const c = res.json.checks[0].conflicts.find(x => x.package === 'intl');
  assert(c, `conflit intl non détecté : ${JSON.stringify(res.json.checks[0].conflicts)}`);
  assert(c.versions.includes('0.20.2') && c.versions.includes('0.20.3'), `versions incorrectes : ${JSON.stringify(c.versions)}`);
  assert(c.entry_points_affected.length > 0, 'les entry points ne sont pas signalés');
});

test('forge-guard facts passe sur un projet sans conflit', () => {
  const p = makeProject('m-facts-ok');
  initProject(p, 'Mem');
  fs.writeFileSync(path.join(p, 'pubspec.yaml'), 'name: m\ndependencies:\n  intl: 0.20.2\n');
  fs.writeFileSync(path.join(p, 'AGENTS.md'), '# A\n\n| P | V |\n|---|---|\n| `intl` | 0.20.2 |\n');
  const res = run('forge-guard.js', ['facts', p]);
  assert(res.code === 0, `faux positif : ${res.stdout}`);
});

/* ------------------------------------------------------------------ *
 * 12. Vérification inter-artefacts
 * ------------------------------------------------------------------ */

section('Vérification inter-artefacts');

/** Fixture : deux slices, une testée, une marquée finie sans aucun test. */
let ccSeq = 0;
function coherenceFixture() {
  const p = makeProject(`cc-${++ccSeq}`);
  initProject(p, 'Coherence');
  fs.mkdirSync(path.join(p, '.forge', 'plans'), { recursive: true });
  fs.mkdirSync(path.join(p, 'test'), { recursive: true });
  fs.writeFileSync(path.join(p, '.forge', 'plans', 'slice-a.md'),
    '---\ntype: implementation-plan\nstatus: approved\n---\n\n## 6. Tracabilite\nB1, B2, E1\n');
  fs.writeFileSync(path.join(p, '.forge', 'plans', 'slice-b.md'),
    '---\ntype: implementation-plan\nstatus: approved\n---\n\n## 6. Tracabilite\nB3\n');
  fs.writeFileSync(path.join(p, 'test', 'slice-a_test.dart'),
    "void main() {\n  test('un', () {});\n  test('deux', () {});\n}\n");
  fs.writeFileSync(path.join(p, '.forge', 'prd.md'),
    '---\ntype: prd\n---\n\n### B1 — r\n### B2 — r\n### B3 — r\n### B7 — r\n### E1 — e\n');
  const s = readState(p);
  s.deliverables.prd = { path: '.forge/prd.md', type: 'prd', status: 'approved' };
  s.slices = {
    'slice-a': { status: 'validated', plan_path: '.forge/plans/slice-a.md', rule_ids: ['B1', 'B2'], edge_case_ids: ['E1'] },
    'slice-b': { status: 'done', plan_path: '.forge/plans/slice-b.md', rule_ids: ['B7', 'B8'] }
  };
  writeState(p, s);
  return p;
}

test('consistency-check signale une slice finie sans test (le défaut le plus coûteux)', () => {
  const p = coherenceFixture();
  const res = run('consistency-check.js', ['reality', p]);
  assert(res.code !== 0, 'consistency-check aurait dû échouer');
  const c = res.json.checks.find(x => x.check === 'slice_marked_done_has_tests');
  assert(c.status === 'fail', 'le contrôle n\'a pas échoué');
  assert(c.suspect.some(s => s.slice === 'slice-b' && s.test_count === 0),
    `slice-b non signalée : ${JSON.stringify(c.suspect)}`);
  assert(!c.suspect.some(s => s.slice === 'slice-a'), `slice-a testée signalée à tort : ${JSON.stringify(c.suspect)}`);
});

test('consistency-check n\'hérite pas rule_ids vers E et C', () => {
  const p = coherenceFixture();
  const res = run('consistency-check.js', ['plans', p]);
  const c = res.json.checks[0];
  // slice-a déclare B1,B2 + E1 et les cite : rien à signaler.
  const onA = c.inflated.filter(x => x.slice === 'slice-a');
  assert(onA.length === 0, `slice-a signalée à tort (repli sur rule_ids) : ${JSON.stringify(onA)}`);
  // slice-b déclare B7,B8 absents du plan : à signaler, et seulement en B.
  const onB = c.inflated.filter(x => x.slice === 'slice-b');
  assert(onB.length === 1 && onB[0].kind === 'B', `slice-b mal signalée : ${JSON.stringify(onB)}`);
});

test('consistency-check exige un domaine sur les constats', () => {
  const p = coherenceFixture();
  const s = readState(p);
  s.findings = [{ id: 'F-001', summary: 'sans domaine' }];
  writeState(p, s);
  const res = run('consistency-check.js', ['findings', p]);
  assert(res.code !== 0, 'consistency-check aurait dû échouer');
  const c = res.json.checks.find(x => x.check === 'findings_have_domain');
  assert(c.status === 'fail' && c.without_domain.length === 1, `constat sans domaine non signalé : ${JSON.stringify(c)}`);
});

test('forge-exit compte les CAS de test, pas les fichiers', () => {
  const p = coherenceFixture();
  const a = run('forge-exit.js', [p, 'slice-a', '--dry-run']);
  assert(a.code === 0, `slice-a devrait passer : ${a.stdout}`);
  assert(a.json.summary.test_cases === 2, `2 cas attendus, obtenu ${a.json.summary.test_cases} — double comptage ?`);

  const b = run('forge-exit.js', [p, 'slice-b', '--dry-run']);
  assert(b.code !== 0, 'slice-b sans test devrait échouer');
  const c = b.json.checks.find(x => x.check === 'slice_has_test_cases');
  assert(c.case_count === 0 && c.detail, 'le message explicatif manque');
});

test('forge-exit échoue sur une slice sans plan', () => {
  const p = coherenceFixture();
  const res = run('forge-exit.js', [p, 'slice-introuvable', '--dry-run']);
  assert(res.json.pass === false && res.json.failed.includes('plan_exists'),
    `une slice sans plan devrait échouer : ${JSON.stringify(res.json.failed)}`);
});

/* ------------------------------------------------------------------ *
 * 13. Nouveaux livrables et agents
 * ------------------------------------------------------------------ */

section('Nouveaux livrables et agents');

test('les 5 nouvelles références existent et portent les règles essentielles', () => {
  for (const r of ['skill-boundaries', 'scenario-tests', 'test-strategies', 'research-protocol', 'migration-v1-v2']) {
    assert(fs.existsSync(path.join(SKILL_DIR, 'references', `${r}.md`)), `references/${r}.md manquant`);
  }
  const b = fs.readFileSync(path.join(SKILL_DIR, 'references', 'skill-boundaries.md'), 'utf-8');
  assert(b.includes('DECISIONS.md') && b.includes('LEARNINGS.md'), 'la frontière doit nommer les fichiers du voisin');
  assert(b.includes('sans domaine'), 'l\'obligation de domaine doit être énoncée');
  const s = fs.readFileSync(path.join(SKILL_DIR, 'references', 'scenario-tests.md'), 'utf-8');
  assert(s.includes('n\'écrit jamais ce que l\'application écrit'), 'l\'interdiction d\'auto-écriture manque');
  assert(s.includes('horloge'), 'l\'obligation d\'horloge injectée manque');
  const m = fs.readFileSync(path.join(SKILL_DIR, 'references', 'migration-v1-v2.md'), 'utf-8');
  assert(m.includes('Table de routage'), 'la table de routage manque');
});

test('scenario.md.tmpl exige récit, invariant et mode d\'écriture', () => {
  const c = fs.readFileSync(path.join(SKILL_DIR, 'templates', 'scenario.md.tmpl'), 'utf-8');
  for (const s of ['Le récit', 'Invariant final', 'Chronologie', "Mode d'écriture", "Chemin d'échec"]) {
    assert(c.includes(s), `le gabarit de scénario ne couvre pas « ${s} »`);
  }
});

test('archetypes contient rental_tenancy et les pathologies récurrentes', () => {
  const c = fs.readFileSync(path.join(SKILL_DIR, 'references', 'archetypes.md'), 'utf-8');
  assert(c.includes('rental_tenancy'), 'l\'archétype locatif manque');
  assert(c.includes('Pathologies récurrentes'), 'la section pathologies manque');
  for (const p of ['Un fait, deux représentations', 'Fail-open', 'instable', 'Horloge non injectée']) {
    assert(c.includes(p), `la pathologie « ${p} » manque`);
  }
});

test('les 2 nouveaux agents ont un contrat exploitable', () => {
  for (const a of ['premise-challenger', 'scenario-tester']) {
    const c = fs.readFileSync(path.join(SKILL_DIR, 'agents', `${a}.md`), 'utf-8');
    assert(/^phases:\s*\[/m.test(c), `${a} : phases manquant`);
    assert(/^modes:\s*\[/m.test(c), `${a} : modes manquant`);
    assert(/^## Inputs/m.test(c), `${a} : Inputs manquant`);
    assert(/^## Output/m.test(c), `${a} : Output manquant`);
  }
  const pc = fs.readFileSync(path.join(SKILL_DIR, 'agents', 'premise-challenger.md'), 'utf-8');
  assert(pc.includes('already_solved') && pc.includes('disproportionate'),
    'premise-challenger doit savoir dire « déjà résolu » et « disproportionné »');
});

test('SKILL.md porte la discipline de vérification et les deux niveaux d\'autonomie', () => {
  const c = fs.readFileSync(path.join(SKILL_DIR, 'SKILL.md'), 'utf-8');
  assert(c.includes('Discipline de vérification'), 'la section discipline manque');
  for (const r of ['Un code de sortie', 'PRÉSENCE', 'réimplémente la règle', 'invariant doit avoir une forme']) {
    assert(c.includes(r), `la règle « ${r} » manque`);
  }
  assert(c.includes('milestone') && c.includes('full'), 'les deux niveaux d\'autonomie doivent être nommés');
  assert(c.includes('state.js start'), 'la commande de reprise doit être l\'étape 0');
  assert(c.includes('forge-exit.js'), 'le critère de sortie exécuté doit être référencé');
  assert(c.includes('consistency-check.js'), 'la vérification inter-artefacts doit être référencée');
  assert(c.includes('skill-boundaries.md'), 'la frontière entre skills doit être référencée');
});

/* ------------------------------------------------------------------ *
 * Exécution — les tests se sont déroulés ci-dessus
 * ------------------------------------------------------------------ */

console.log(`\n${'─'.repeat(60)}`);
if (failed === 0) {

/* ------------------------------------------------------------------ *
 * Contrat de phase — une phase ne s'approuve pas sur sa seule parole
 * ------------------------------------------------------------------ */

section('Contrat de phase');

test('complete-phase refuse une phase sans le livrable qu\'elle doit produire', () => {
  const project = freshProject('contrat-complete');
  // Cas reproduit sur un test grandeur nature : Phase 0 approuvée alors que
  // `conventions.md` n'a jamais été créé ni enregistré.
  const res = run('state.js', ['complete-phase', project, '0_bootstrap']);
  assert(res.code !== 0, 'complete-phase a approuvé une phase vide');
  assert(res.json.error === 'phase_incomplete', `erreur inattendue : ${res.stdout}`);
  const missing = res.json.missing.map(m => m.key);
  assert(missing.includes('conventions'), `le manque de conventions n'est pas nommé : ${JSON.stringify(res.json.missing)}`);

  // Et l'état ne doit pas avoir bougé : un refus qui écrit quand même est pire
  // qu'un refus muet, parce qu'il laisse croire que la phase est close.
  const state = readState(project);
  assert(state.phases['0_bootstrap'].status === 'in_progress',
    `la phase a été modifiée malgré le refus : ${state.phases['0_bootstrap'].status}`);
});

test('set-phase approved ne contourne pas le contrat', () => {
  const project = freshProject('contrat-setphase');
  const res = run('state.js', ['set-phase', project, '1_prd', 'approved']);
  assert(res.code !== 0, 'set-phase approved a contourné le contrat');
  assert(res.json.error === 'phase_incomplete', `erreur inattendue : ${res.stdout}`);
});

test('forge-guard signale la phase courante sans livrable', () => {
  const project = freshProject('contrat-guard');
  const res = run('forge-guard.js', ['all', project]);
  assert(res.code !== 0 || res.json.pass === false,
    'forge-guard a passé avec une phase courante sans livrable');
  const c = (res.json.checks || []).find(x => x.check === 'current_phase_has_deliverables');
  assert(c, 'le contrôle current_phase_has_deliverables est absent du rapport');
  assert(c.status === 'fail', `le contrôle devrait échouer, il est : ${c.status}`);
});

test('forge-guard ne se désactive pas en silence si la lib perd le contrat', () => {
  // Un contrôle qui fait `return` quand la lib n'expose pas ce qu'il attend
  // devient un décor : le rapport affiche un vert qui ne couvre rien.
  //
  // Le projet est créé AVANT de casser la lib : `state.js init` lit lui aussi
  // PHASE_KEYS, donc le créer pendant la fenêtre cassée testerait autre chose.
  const project = freshProject('contrat-lib-morte');

  const lib = path.join(SCRIPTS, 'lib', 'forge-lib.js');
  const original = fs.readFileSync(lib, 'utf-8');
  try {
    fs.writeFileSync(lib, original.replace(
      'PHASE_KEYS, PHASE_REQUIREMENTS, missingPhaseRequirements',
      'PHASE_REQUIREMENTS'
    ));
    const res = run('forge-guard.js', ['all', project]);
    const c = (res.json.checks || []).find(x => x.check === 'current_phase_has_deliverables');
    assert(c, 'le contrôle a disparu du rapport');
    assert(c.status === 'fail',
      `le contrôle aurait dû échouer bruyamment, il est : ${c.status}`);
    assert(/forge-lib/.test(c.error || ''), `l'erreur ne nomme pas la cause : ${JSON.stringify(c)}`);
  } finally {
    fs.writeFileSync(lib, original);
  }
  // La lib doit être revenue intacte, sinon les tests suivants mesurent n'importe quoi.
  assert(fs.readFileSync(lib, 'utf-8') === original, 'la lib n\'a pas été restaurée');
});

test('chaque phase 0-6 déclare ce qu\'elle doit produire', () => {
  const L = require('./lib/forge-lib');
  for (const key of L.PHASE_KEYS.slice(0, 7)) {
    const spec = L.PHASE_REQUIREMENTS[key];
    assert(spec, `phase ${key} sans contrat`);
    const hasExpectation = (spec.required && spec.required.length) ||
      (spec.atLeastOneOf && spec.atLeastOneOf.length);
    assert(hasExpectation,
      `phase ${key} n'exige rien : elle peut s'approuver sans rien produire`);
  }
});

test('toute clé exigée par un contrat de phase est ENREGISTRABLE', () => {
  // Le gate de la Phase 3 exigeait `design-system` alors que le livrable
  // s'enregistre sous `design_system` : une clé qu'aucune commande ne peut
  // produire. Le gate était infranchissable, et son refus nommant une clé
  // ressemblante, donc inexplicable.
  const L = require(path.join(SCRIPTS, 'lib', 'forge-lib.js'));
  const problems = [];
  for (const [phaseKey, spec] of Object.entries(L.PHASE_REQUIREMENTS)) {
    for (const key of spec.required || []) {
      if (!L.CANONICAL_LAYOUT[key]) {
        problems.push({ phase: phaseKey, key, why: 'aucun `state.js register … deliverable <clé>` ne peut la produire' });
      }
    }
  }
  assert(problems.length === 0,
    `clés de contrat inatteignables : ${JSON.stringify(problems)}`);
});

test('toute clé de PHASE_ARTIFACT_OWNERS est un kind ENREGISTRABLE', () => {
  // La table possédait `deliverables`/`screens`/`slices`/`foundations` — les
  // noms de seaux de `state.json` — alors que `isPrematureArtifact` reçoit les
  // `kind` singuliers de `register`. Les deux vocabulaires coexistent et ne se
  // distinguent que d'un `s` : le contrôle ne déclenchait alors que les plans,
  // via leur cas particulier, et laissait passer l'architecture et tous les
  // écrans sans un mot. Un tableau de propriétaires écrit dans le mauvais
  // vocabulaire ne protège de rien, et semble protéger.
  const L = require(path.join(SCRIPTS, 'lib', 'forge-lib.js'));
  const kinds = ['deliverable', 'screen', 'slice', 'foundation', 'phase'];
  const problems = [];
  for (const [phaseKey, spec] of Object.entries(L.PHASE_ARTIFACT_OWNERS)) {
    for (const [prop, value] of Object.entries(spec)) {
      if (prop === 'plans') continue;
      if (!kinds.includes(prop)) {
        problems.push({ phase: phaseKey, key: prop, why: 'ce kind n\'existe pas — la règle ne peut rien voir' });
      }
      if (value !== true && !Array.isArray(value)) {
        problems.push({ phase: phaseKey, key: prop, why: 'ni liste de clés ni `true` : la règle ne peut rien voir' });
      }
    }
  }
  assert(problems.length === 0, `propriétaires inopérants : ${JSON.stringify(problems)}`);
});

test('PHASE_ARTIFACT_OWNERS ne laisse aucun artefact de phase sans propriétaire', () => {
  // Une phase dont le contrat exige un livrable mais qui n'en possède aucun
  // rend la règle muette sur ce livrable : il est le plus facile à écrire en
  // avance, donc le plus probable en avance.
  const L = require(path.join(SCRIPTS, 'lib', 'forge-lib.js'));
  const problems = [];
  for (const [phaseKey, spec] of Object.entries(L.PHASE_REQUIREMENTS)) {
    const owned = L.PHASE_ARTIFACT_OWNERS[phaseKey] || {};
    for (const key of spec.required || []) {
      if (!(Array.isArray(owned.deliverable) && owned.deliverable.includes(key))) {
        problems.push({ phase: phaseKey, key, why: 'exigé par le contrat, possédé par personne' });
      }
    }
  }
  assert(problems.length === 0, `livrables sans propriétaire : ${JSON.stringify(problems)}`);
});

test('register REFUSE un artefact produit avant sa phase', () => {
  // « Ne jamais entamer la phase suivante sans un approuvé clair » est la règle
  // la plus importante du skill, et n'avait aucun moyen d'être appliquée : un
  // `architecture.md` et quinze plans se sont écrits pendant que le design
  // portait `draft`, et les douze contrôles passaient. Le refus au moment
  // d'écrire est le seul endroit où la règle devient impossible à contourner.
  const L = require(path.join(SCRIPTS, 'lib', 'forge-lib.js'));
  const project = freshProject('artefact-en-avance');
  fs.writeFileSync(path.join(project, '.forge', 'conventions.md'),
    '---\nforge: true\nkind: deliverable\nkey: conventions\nstatus: draft\n---\n\n# Conventions\n');
  const reg = run('state.js', ['register', project, 'deliverable', 'conventions', '.forge/conventions.md']);
  assert(reg.code === 0, `register a échoué : ${reg.stdout}${reg.stderr}`);
  run('state.js', ['complete-phase', project, '0_bootstrap']);

  // On est en phase 1. L'architecture appartient à la phase 4.
  const state = readState(project);
  assert(parseInt(state.current_phase, 10) === 1,
    `current_phase attendu à 1, obtenu ${JSON.stringify(state.current_phase)}`);
  fs.writeFileSync(path.join(project, '.forge', 'architecture.md'),
    '---\nforge: true\nkind: deliverable\nkey: architecture\nstatus: draft\n---\n\n# Architecture\n');
  const early = run('state.js', ['register', project, 'deliverable', 'architecture', '.forge/architecture.md'], { raw: true });
  assert(early.code !== 0, 'register a accepté un artefact de la phase 4 depuis la phase 1');
  assert(/premature_artifact/.test(early.stdout + early.stderr),
    `le refus ne nomme pas premature_artifact : ${early.stdout}${early.stderr}`);

  // Le seau doit être resté vide : un refus qui écrit quand même ne protège pas.
  const after = readState(project);
  assert(!after.deliverables || !after.deliverables.architecture,
    'l\'artefact refusé a quand même été enregistré');
});

test('forge-guard constate un artefact en avance déjà écrit sur disque', () => {
  // `register` refuse désormais d'écrire en avance, mais un état peut avoir
  // été produit avant que la règle existe, ou par `sync --fix`. Le contrôle doit
  // rattraper ce qui est déjà là, sinon la règle ne s'applique qu'à l'avenir.
  const project = freshProject('avance-sur-disque');
  fs.writeFileSync(path.join(project, '.forge', 'conventions.md'),
    '---\nforge: true\nkind: deliverable\nkey: conventions\nstatus: draft\n---\n\n# Conventions\n');
  run('state.js', ['register', project, 'deliverable', 'conventions', '.forge/conventions.md']);
  run('state.js', ['complete-phase', project, '0_bootstrap']);

  fs.writeFileSync(path.join(project, '.forge', 'architecture.md'),
    '---\nforge: true\nkind: deliverable\nkey: architecture\nstatus: draft\n---\n\n# Architecture\n');
  // Enregistré en phase 4, comme le ferait un agent qui ignore la règle —
  // puis on rebascule en phase 1 : l'artefact écrit avant l'existence du
  // contrôle doit être rattrapé par le contrôle.
  run('state.js', ['register', project, 'deliverable', 'architecture', '.forge/architecture.md']);
  const state = readState(project);
  state.current_phase = 1;
  fs.writeFileSync(path.join(project, '.forge', 'state.json'), JSON.stringify(state, null, 2));

  const guard = run('forge-guard.js', ['state', project]);
  const out = JSON.parse(guard.stdout);
  const check = out.checks.find(c => c.check === 'no_premature_artifacts');
  assert(check, 'le contrôle no_premature_artifacts est absent du rapport');
  assert(check.status === 'fail', 'un artefact en avance sur disque n\'a pas été constaté');
  assert(check.offenders.some(o => o.key === 'architecture'),
    'l\'architecture en avance n\'est pas nommée');
});

test('un artefact de la phase atteinte n\'est PAS signalé en avance', () => {
  // Le piège du faux positif : `complete-phase` avance `current_phase` d'un
  // cran en approuvant, donc la phase suivante est « courante » tout en étant
  // `not_started`. Juger sur le statut refuserait d'enregistrer le tout premier
  // livrable de chaque phase — un garde-fou qui bloque le travail légitime
  // s'apprend à contourner, et la règle réelle cesse d'exister.
  const project = freshProject('phase-atteinte');
  fs.writeFileSync(path.join(project, '.forge', 'conventions.md'),
    '---\nforge: true\nkind: deliverable\nkey: conventions\nstatus: draft\n---\n\n# Conventions\n');
  run('state.js', ['register', project, 'deliverable', 'conventions', '.forge/conventions.md']);
  run('state.js', ['complete-phase', project, '0_bootstrap']);

  fs.writeFileSync(path.join(project, '.forge', 'prd.md'),
    '---\nforge: true\nkind: deliverable\nkey: prd\nstatus: draft\n---\n\n# PRD\n');
  const reg = run('state.js', ['register', project, 'deliverable', 'prd', '.forge/prd.md'], { raw: true });
  assert(reg.code === 0,
    `le premier livrable de la phase atteinte a été refusé : ${reg.stdout}${reg.stderr}`);

  const guard = run('forge-guard.js', ['state', project]);
  const out = JSON.parse(guard.stdout);
  const check = out.checks.find(c => c.check === 'no_premature_artifacts');
  assert(check.status === 'pass', `un livrable légitime est signalé en avance : ${JSON.stringify(check.offenders)}`);
});

test('une slice sans plan n\'est pas signalée en avance, une slice avec plan si', () => {
  // La slice appartient à la phase 4, son plan à la phase 5. Les confondre
  // produirait deux erreurs opposées : interdire le découpage, ou laisser
  // passer les plans écrits avant qu'ils ne soient leur tour.
  const L = require(path.join(SCRIPTS, 'lib', 'forge-lib.js'));
  const base = { current_phase: 4, slices: { a: { status: 'identified' }, b: { plan_path: '.forge/plans/b.md' } } };
  assert(!L.isPrematureArtifact(base, 'slice', 'a'), 'une slice sans plan est signalée en avance');
  assert(L.isPrematureArtifact(base, 'slice', 'b'), 'une slice déjà planifiée en phase 4 n\'est pas signalée');
  assert(!L.isPrematureArtifact(base, 'slice', 'b') ||
    L.isPrematureArtifact(base, 'slice', 'b').phase === '5_implementation_plan',
    'le plan est attribué à la mauvaise phase');
});

test('une phase complète passe le contrat', () => {
  const project = freshProject('contrat-satisfait');
  fs.writeFileSync(path.join(project, '.forge', 'conventions.md'),
    '---\nforge: true\nkind: deliverable\nkey: conventions\nstatus: draft\n---\n\n# Conventions\n');
  const reg = run('state.js', ['register', project, 'deliverable', 'conventions', '.forge/conventions.md']);
  assert(reg.code === 0, `register a échoué : ${reg.stdout}${reg.stderr}`);
  const res = run('state.js', ['complete-phase', project, '0_bootstrap']);
  assert(res.code === 0, `une phase complète a été refusée : ${res.stdout}`);
  const state = readState(project);
  assert(state.phases['0_bootstrap'].status === 'approved', 'la phase n\'a pas été approuvée');
});

/* ------------------------------------------------------------------ *
 * Prémisses — un livrable approuvé ne doit pas reposer sur une exigence retirée
 * ------------------------------------------------------------------ */

section('Prémisses retirées');

/** Un mini-projet avec un PRD dont la section « Hors scope » est donnée. */
function prdProject(label, horsScope) {
  const project = freshProject(label);
  fs.writeFileSync(path.join(project, '.forge', 'prd.md'), [
    '---', 'type: prd', 'status: draft', '---', '',
    '# PRD', '',
    '## 4. Règles métier', '',
    '| B1 | Une exigence vivante |', '',
    '## 9. Hors scope (explicitement)', '',
    horsScope, '',
    '## 10. Critères de succès', ''
  ].join('\n'));
  run('state.js', ['register', project, 'deliverable', 'prd', '.forge/prd.md']);
  fs.writeFileSync(path.join(project, '.forge', 'conventions.md'),
    '---\ntype: conventions\nstatus: draft\n---\n\n# Conventions\n');
  return project;
}

test('conventions approved sur une prémisse retirée est signalé', () => {
  // C'est le cas du projet de test : conventions.md approuvait PostgreSQL en
  // s'appuyant sur « multi-tenant strict », que le PRD a ensuite retiré.
  const project = prdProject('premise-retiree', '- **C102** — Multi-tenant strict — raison : aucun second client');
  run('state.js', ['register', project, 'deliverable', 'conventions', '.forge/conventions.md', '--requires=C102']);
  run('state.js', ['set-status', project, 'deliverable', 'conventions', 'approved']);

  const res = run('consistency-check.js', ['premises', project]);
  assert(res.code !== 0 || res.json.pass === false, 'le conflit n\'a pas été signalé');
  const c = res.json.checks[0];
  assert(c.retired && c.retired.length === 1, `prémisse retirée non nommée : ${JSON.stringify(c)}`);
  assert(c.retired[0].deliverable === 'conventions', 'le livrable fautif n\'est pas nommé');
  assert(c.retired[0].premise === 'C102', 'l\'ID retiré n\'est pas nommé');
});

test('consequences du retrait : un livrable approuvé sans prémisse déclarée est un avertissement', () => {
  const project = prdProject('premise-non-declaree', '- **C102** — Multi-tenant strict');
  run('state.js', ['register', project, 'deliverable', 'conventions', '.forge/conventions.md']);
  run('state.js', ['set-status', project, 'deliverable', 'conventions', 'approved']);

  const res = run('consistency-check.js', ['premises', project]);
  const c = res.json.checks[0];
  // Un avertissement, pas un échec : un PRD ne dépend de rien, et forcer la
  // déclaration rendrait le contrôle irritant donc désactivé.
  assert(c.status === 'warn', `statut attendu warn, obtenu ${c.status}`);
  assert(c.undeclared.length === 1, 'le livrable sans prémisse déclarée n\'est pas listé');
  assert(/--requires=/.test(c.undeclared[0].hint), 'l\'aide ne donne pas la commande');
});

test('une exigence retirée sans son ID est un retrait non traçable', () => {
  const project = prdProject('premise-sans-id', '- **Multi-tenant strict** — raison : aucun second client');
  run('state.js', ['register', project, 'deliverable', 'conventions', '.forge/conventions.md', '--requires=C102']);
  const res = run('consistency-check.js', ['premises', project]);
  const c = res.json.checks[0];
  assert(c.untraceable.length === 1, `le retrait sans ID n\'est pas vu : ${JSON.stringify(c)}`);
  assert(c.status === 'fail', `un retrait non traçable doit échouer, il est : ${c.status}`);
});

test('un ID cité dans la raison ne rend pas le retrait traçable', () => {
  // L'entrée retire C103 ; sa raison évoque C102. Un ID lu dans la prose
  // décrit une AUTRE exigence, pas celle-ci : le dire revientrait à déclarer
  // C102 retirée alors qu'elle ne l'est pas — et à accuser les livrables qui
  // s'appuient légitimement dessus.
  const project = prdProject('premise-en-prose', "- **C103** — Autre chose — l'exigence C102 est abandonnée");
  run('state.js', ['register', project, 'deliverable', 'conventions', '.forge/conventions.md', '--requires=C102']);
  const res = run('consistency-check.js', ['premises', project]);
  const c = res.json.checks[0];
  assert(c.untraceable.length === 0,
    `l'entrée a bien un ID en tête, elle ne doit pas être signalée : ${JSON.stringify(c.untraceable)}`);
  assert(c.retired.length === 0,
    `C102 n'est pas retirée, elle ne doit pas être signalée : ${JSON.stringify(c.retired)}`);
  assert(c.status === 'pass', `statut attendu pass, obtenu ${c.status}`);
});

test('un ID qui désigne deux exigences est une collision', () => {
  // Constaté en corrigeant le projet de test : C1 valait « multi-tenant strict »
  // en hors scope et « un seul serveur » en contraintes. Même identifiant, deux
  // sens, et ce contrôle aurait alors accusé le mauvais livrable.
  const project = freshProject('premise-collision');
  fs.writeFileSync(path.join(project, '.forge', 'prd.md'), [
    '---', 'type: prd', 'status: draft', '---', '',
    '## 5. Contraintes', '',
    '| C1 | Un seul serveur, hébergé chez le client |', '',
    '## 9. Hors scope (explicitement)', '',
    '- **C1** — Multi-tenant strict — raison : aucun second client', ''
  ].join('\n'));
  run('state.js', ['register', project, 'deliverable', 'prd', '.forge/prd.md']);
  fs.writeFileSync(path.join(project, '.forge', 'conventions.md'),
    '---\ntype: conventions\nstatus: draft\n---\n\n# Conventions\n');
  run('state.js', ['register', project, 'deliverable', 'conventions', '.forge/conventions.md', '--requires=C1']);
  run('state.js', ['set-status', project, 'deliverable', 'conventions', 'approved']);

  const res = run('consistency-check.js', ['premises', project]);
  const c = res.json.checks[0];
  assert(c.collisions && c.collisions.length === 1, `collision non détectée : ${JSON.stringify(c.collisions)}`);
  assert(c.collisions[0].id === 'C1', 'l\'ID en collision n\'est pas nommé');
  assert(c.collisions[0].defined_in.length === 2, 'les deux définitions ne sont pas montrées');
  assert(c.status === 'fail', `une collision doit échouer, elle est : ${c.status}`);
});

test('une prémisse déclarée et vivante ne pose aucun problème', () => {
  const project = prdProject('premise-saine', '- **C102** — Multi-tenant strict');
  run('state.js', ['register', project, 'deliverable', 'conventions', '.forge/conventions.md', '--requires=B1']);
  run('state.js', ['set-status', project, 'deliverable', 'conventions', 'approved']);
  const res = run('consistency-check.js', ['premises', project]);
  const c = res.json.checks[0];
  assert(c.status === 'pass', `statut attendu pass, obtenu ${c.status}`);
  assert(c.declared_dependencies === 1, `dépendances non comptées : ${c.declared_dependencies}`);
});

test('premises saute proprement sans PRD', () => {
  const project = freshProject('premise-sans-prd');
  const res = run('consistency-check.js', ['premises', project]);
  const c = res.json.checks[0];
  assert(c.status === 'skip', `un contrôle sans PRD doit sauter, il est : ${c.status}`);
});

test('un refus Forge est écrit sur stderr, pas seulement sur stdout', () => {
  // Constaté en perdant sept constats d'affilée : `> /dev/null` avalait
  // l'échec exactement comme il avale une sortie normale. Le compte de ce qui
  // a été enregistré dans l'état devenait faux, sans trace.
  const project = freshProject('stderr-refus');
  const res = run('state.js', ['finding', project, '--domain=inexistant', '--severity=low',
    '--origin=test', 'un fait', 'une correction']);
  assert(res.code !== 0, 'le refus aurait dû échouer');
  assert(/unknown_domain/.test(res.stderr || ''),
    `l'erreur n'est pas sur stderr : ${JSON.stringify(res.stderr)}`);
  assert(res.json.error === 'unknown_domain', 'l\'erreur ne reste pas lisible en JSON sur stdout');
});

test('un succès n\'écrit rien sur stderr', () => {
  const project = freshProject('stderr-succes');
  const res = run('state.js', ['status', project]);
  assert(res.code === 0, 'status a échoué');
  assert((res.stderr || '').trim() === '', `une commande réussie écrit sur stderr : ${res.stderr}`);
});

/* ------------------------------------------------------------------ *
 * Graphe de dépendances — déclarable, et l'écart de vagues est visible
 * ------------------------------------------------------------------ */

section('Graphe de dépendances');

test('state.js dep déclare une dépendance', () => {
  const project = freshProject('dep-declare');
  run('state.js', ['register', project, 'slice', 'A', '.forge/plans/A.md']);
  run('state.js', ['register', project, 'slice', 'B', '.forge/plans/B.md']);
  const res = run('state.js', ['dep', project, 'B', 'A']);
  assert(res.code === 0, `dep a échoué : ${res.stdout}${res.stderr}`);
  assert(/A/.test(res.stdout), 'la dépendance déclarée ne figure pas dans la sortie');
});

test('state.js dep refuse une dépendance vers une slice inexistante', () => {
  // Un graphe faux, pas un graphe incomplet : elle ne sera jamais satisfaite et
  // rien ne le signalerait ensuite.
  const project = freshProject('dep-inconnue');
  run('state.js', ['register', project, 'slice', 'A', '.forge/plans/A.md']);
  const res = run('state.js', ['dep', project, 'A', 'fantome']);
  assert(res.code !== 0, 'une dépendance vers du vide a été acceptée');
  assert(res.json.error === 'unknown_dependency', `erreur inattendue : ${res.stdout}`);
});

test('state.js dep refuse l\'auto-dépendance', () => {
  const project = freshProject('dep-soi');
  run('state.js', ['register', project, 'slice', 'A', '.forge/plans/A.md']);
  const res = run('state.js', ['dep', project, 'A', 'A']);
  assert(res.code !== 0, 'l\'auto-dépendance a été acceptée');
  assert(res.json.error === 'self_dependency', `erreur inattendue : ${res.stdout}`);
});

test('state.js dep refuse de fermer un cycle', () => {
  const project = freshProject('dep-cycle');
  run('state.js', ['register', project, 'slice', 'A', '.forge/plans/A.md']);
  run('state.js', ['register', project, 'slice', 'B', '.forge/plans/B.md']);
  run('state.js', ['dep', project, 'A', 'B']);
  const res = run('state.js', ['dep', project, 'B', 'A']);
  assert(res.code !== 0, 'un cycle a été persisté');
  assert(res.json.error === 'circular_dependency', `erreur inattendue : ${res.stdout}`);
});

/** Un graphe A→B, B isolé : le minimum topologique est 2. */
function waveProject(label, frontMatterExtra) {
  const project = freshProject(label);
  run('state.js', ['register', project, 'slice', 'A', '.forge/plans/A.md']);
  run('state.js', ['register', project, 'slice', 'B', '.forge/plans/B.md']);
  run('state.js', ['dep', project, 'B', 'A']);
  fs.writeFileSync(path.join(project, '.forge', 'architecture.md'), [
    '---', 'type: architecture', 'status: draft', ...frontMatterExtra, '---', '',
    '# Architecture', ''
  ].join('\n'));
  run('state.js', ['register', project, 'deliverable', 'architecture', '.forge/architecture.md']);
  return project;
}

test('un plan de vagues plus fin que le minimum est signalé s\'il n\'est pas déclaré', () => {
  // Constaté sur le projet de test : l'architecture annonçait 13 vagues,
  // le graphe se réduit à 8. `writeBack` écrasait impl_wave sans rien dire, et
  // l'outil rapportait pass. Deux documents de la Phase 4 se contredisaient.
  const project = waveProject('vagues-non-declarees', []);
  fs.writeFileSync(path.join(project, '.forge', 'architecture.md'), [
    '---', 'type: architecture', 'status: draft', '---', '',
    '# Architecture', '', '**5 vagues**, de V0 à V4.', ''
  ].join('\n'));
  const res = run('dependency-check.js', ['check', project]);
  assert(res.json.waves_count === 2, `le minimum calculé devrait être 2, obtenu ${res.json.waves_count}`);
  assert(res.json.divergence.length === 1, `l\'écart n\'est pas signalé : ${res.stdout}`);
  assert(res.json.pass === false,
    'un plan d\'ordonnancement non justifié doit laisser le contrôle en échec');
});

test('un plan déclaré ET justifié reste visible sans faire échouer', () => {
  const project = waveProject('vagues-justifiees', [
    'impl_waves: 5',
    'impl_waves_rationale: >-',
    '  On retient 5 vagues parce que A et B ne doivent pas être portées par la',
    '  même personne.'
  ]);
  const res = run('dependency-check.js', ['check', project]);
  const d = res.json.divergence[0];
  assert(d, `l\'écart doit rester visible : ${res.stdout}`);
  assert(d.status === 'warn', `un plan justifié doit être un avertissement, il est : ${d.status}`);
  assert(res.json.pass === true, 'un plan justifié ne doit pas faire échouer');
  assert(/même personne/.test(d.rationale || ''),
    `la raison n\'a pas été lue : ${JSON.stringify(d.rationale)}`);
});

test('la raison d\'un écart plié est lue, pas son indicateur YAML', () => {
  // Un lecteur naïf remonte `>-` : une justification présente serait alors
  // lue comme absente, et le contrôle confondrait « il n'a pas expliqué »
  // avec « il a expliqué, mal lu ».
  const project = waveProject('vagues-pliees', [
    'impl_waves: 5',
    'impl_waves_rationale: >-',
    '  Raison sur plusieurs lignes,'
  ]);
  const res = run('dependency-check.js', ['check', project]);
  const d = res.json.divergence[0];
  assert(d.rationale && d.rationale !== '>-',
    `la valeur pliée n\'a pas été dépliée : ${JSON.stringify(d.rationale)}`);
  assert(/plusieurs lignes/.test(d.rationale), `texte inattendu : ${d.rationale}`);
});


/* ------------------------------------------------------------------ *
 * Front matter — la trace ne doit pas disparaître au changement de statut
 * ------------------------------------------------------------------ */

section('Front matter — round-trip sans perte');

test('une séquence en bloc est relue comme une séquence', () => {
  const L = require(path.join(SCRIPTS, 'lib', 'forge-lib.js'));
  const fm = L.splitFrontMatter('---\ntype: screen\nderived_from:\n  - .forge/prd.md\n  - .forge/architecture.md\n---\n\n# c\n');
  assert(Array.isArray(fm.data.derived_from), `derived_from n'est pas une liste : ${JSON.stringify(fm.data.derived_from)}`);
  assert(fm.data.derived_from.length === 2, `liste tronquée : ${JSON.stringify(fm.data.derived_from)}`);
});

test('set-status préserve derived_from (défaut trouvé sur un test grandeur nature)', () => {
  // Le bug : la trace des sources d'un artefact disparaissait au PREMIER
  // `set-status`, donc au moment précis où elle commence à compter — et avec
  // forge-guard comme consistency-check au vert.
  const project = freshProject('front-matter-derive');
  const rel = '.forge/design/screens/accueil.md';
  const abs = path.join(project, rel);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs,
    '---\ntype: screen\nstatus: draft\nderived_from:\n  - .forge/prd.md\n  - .forge/design/design-system.md\nrule_ids: [B1, B2]\n---\n\n# Accueil\n\nContenu.\n');

  assert(run('state.js', ['register', project, 'screen', 'accueil', rel]).code === 0, 'register a échoué');
  assert(run('state.js', ['set-status', project, 'screen', 'accueil', 'approved']).code === 0, 'set-status a échoué');

  const raw = fs.readFileSync(abs, 'utf-8');
  assert(raw.includes('- .forge/prd.md'), `derived_from a été vidé :\n${raw.slice(0, 200)}`);
  assert(raw.includes('- .forge/design/design-system.md'), `une source a été perdue :\n${raw.slice(0, 200)}`);
  assert(/status: approved/.test(raw), 'le statut n\'a pas été écrit');
});

test('la réécriture du front matter est idempotente et ne bouge pas le content_hash', () => {
  const L = require(path.join(SCRIPTS, 'lib', 'forge-lib.js'));
  const raw = '---\ntype: screen\nstatus: draft\nderived_from:\n  - a.md\n  - b.md\nrule_ids: [B1]\n---\n\n# T\n\nCorps.\n';
  const abs = path.join(tmpRoot, 'fm-idempotent.md');
  fs.writeFileSync(abs, raw);
  const hashBefore = L.contentHash(abs);

  const fm = L.readFrontMatter(abs);
  L.writeFrontMatter(abs, { ...fm.data, status: 'approved' });
  const once = fs.readFileSync(abs, 'utf-8');

  const fm2 = L.readFrontMatter(abs);
  L.writeFrontMatter(abs, { ...fm2.data, status: 'in_review' });
  const twice = fs.readFileSync(abs, 'utf-8');

  assert(once.replace('approved', 'in_review') === twice, 'la réécriture n\'est pas stable');
  assert(L.contentHash(abs) === hashBefore,
    'un changement de statut a modifié le content_hash du corps : le document deviendrait stale');
});

test('forge-guard signale un derived_from vide', () => {
  const project = freshProject('front-matter-vide');
  const rel = '.forge/design/screens/vide.md';
  const abs = path.join(project, rel);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, '---\ntype: screen\nstatus: draft\nderived_from:\n---\n\n# V\n\nContenu.\n');
  assert(run('state.js', ['register', project, 'screen', 'vide', rel]).code === 0, 'register a échoué');

  const res = run('forge-guard.js', ['state', project]);
  const check = (res.json.checks || []).find(c => c.check === 'derived_from_non_empty');
  assert(check, `le contrôle derived_from_non_empty est absent : ${res.stdout.slice(0, 200)}`);
  assert(check.status === 'fail', 'un derived_from vide doit échouer');
});

/* ------------------------------------------------------------------ *
 * Cases « À DÉCIDER » — bloquante ou différable
 * ------------------------------------------------------------------ */

section('Cases à décider — bloquantes et différables');

test('forge-guard échoue sur une case AVANT LA PHASE 1 encore ouverte', () => {
  const project = freshProject('a-decider-bloquante');
  const rel = '.forge/conventions.md';
  const abs = path.join(project, rel);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs,
    '---\ntype: conventions\nstatus: draft\n---\n\n# C\n\n| Identity provider | À DÉCIDER AVANT LA PHASE 1 | — | fail-closed est inapplicable |\n');
  assert(run('state.js', ['register', project, 'deliverable', 'conventions', rel]).code === 0, 'register a échoué');

  const res = run('forge-guard.js', ['state', project]);
  const check = (res.json.checks || []).find(c => c.check === 'no_undecided_slots');
  assert(check && check.status === 'fail', `une case bloquante doit échouer : ${JSON.stringify(check)}`);
  assert(check.blocking.length === 1, 'la case bloquante doit être nommée');
});

test('une case EN PHASE 4 est signalée, pas refusée, avant la Phase 4', () => {
  const project = freshProject('a-decider-differable');
  const rel = '.forge/conventions.md';
  const abs = path.join(project, rel);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs,
    '---\ntype: conventions\nstatus: draft\n---\n\n# C\n\n| State management | À DÉCIDER EN PHASE 4 | — | |\n');
  assert(run('state.js', ['register', project, 'deliverable', 'conventions', rel]).code === 0, 'register a échoué');

  const res = run('forge-guard.js', ['state', project]);
  const check = (res.json.checks || []).find(c => c.check === 'no_undecided_slots');
  assert(check && check.status === 'pass',
    `une case différable est l'usage normal du gabarit avant la Phase 4 : ${JSON.stringify(check)}`);
  assert(check.expected.length === 1, 'elle doit rester visible dans la sortie');
});

test('après la Phase 4, toute case ouverte devient un échec', () => {
  const project = freshProject('a-decider-apres-phase4');
  const rel = '.forge/conventions.md';
  const abs = path.join(project, rel);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs,
    '---\ntype: conventions\nstatus: draft\n---\n\n# C\n\n| State management | À DÉCIDER EN PHASE 4 | — | |\n');
  assert(run('state.js', ['register', project, 'deliverable', 'conventions', rel]).code === 0, 'register a échoué');

  const state = readState(project);
  state.phases['4_architecture'].status = 'approved';
  writeState(project, state);

  const res = run('forge-guard.js', ['state', project]);
  const check = (res.json.checks || []).find(c => c.check === 'no_undecided_slots');
  assert(check && check.status === 'fail',
    `un document verrouillé ne doit pas contenir de case ouverte : ${JSON.stringify(check)}`);
});

test('le gabarit distingue la case bloquante de la case différable', () => {
  const t = fs.readFileSync(path.join(SKILL_DIR, 'templates', 'conventions.md.tmpl'), 'utf-8');
  assert(t.includes('À DÉCIDER AVANT LA PHASE 1'), 'le gabarit doit définir le marqueur bloquant');
  assert(t.includes('Identity provider'), 'le gabarit doit porter une ligne identité');
  assert(t.includes('Exécution de fond'), 'le gabarit doit porter une ligne exécution de fond');
});

/* ------------------------------------------------------------------ *
 * Chemins d'exécution
 * ------------------------------------------------------------------ */

section("Chemins d'exécution des scripts");

test("SKILL.md dit où sont les scripts et donne une forme exécutable", () => {
  const c = fs.readFileSync(path.join(SKILL_DIR, 'SKILL.md'), 'utf-8');
  assert(c.includes('Comment exécuter les scripts'), "la section d'exécution est absente");
  assert(c.includes('export FORGE='), 'la variable FORGE doit être définie');
  assert(c.includes('node "$FORGE/scripts/state.js" start'), "l'Étape 0 doit être exécutable");
});

test("aucune commande livrée ne suppose scripts/ à la racine du projet", () => {
  // Le défaut trouvé : toutes les commandes étaient écrites `node scripts/…`,
  // ce qui échoue dans tout projet — et les messages d'erreur des scripts
  // eux-mêmes reprenaient la forme cassée, au moment précis où l'on copie la
  // commande pour la rejouer.
  const offenders = [];
  const walk = dir => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) { walk(full); continue; }
      if (!/\.(md|tmpl|js)$/.test(entry.name)) continue;
      if (path.basename(full) === 'selftest.js') continue;
      const raw = fs.readFileSync(full, 'utf-8');
      raw.split('\n').forEach((line, i) => {
        if (/node scripts\//.test(line)) offenders.push(`${path.relative(SKILL_DIR, full)}:${i + 1}`);
      });
    }
  };
  walk(SKILL_DIR);
  assert(offenders.length === 0,
    `commandes encore écrites sans $FORGE : ${offenders.join(', ')}`);
});


/* ------------------------------------------------------------------ *
 * Prémisses : ce que la déclaration saisie à la main ne voit pas
 * ------------------------------------------------------------------ */

section('Prémisses — déclaration et citations');

/** Un PRD minimal avec une exigence retirée, et un livrable qui la cite. */
function retiredPremiseProject(label, { citeId = false, declares = null } = {}) {
  const project = freshProject(label);
  // B3 n'est définie QUE dans le § 9 : elle est retirée sans jamais avoir été
  // vivante dans le § 4, donc sans collision.
  writeDeliverable(project, '.forge/prd.md', {
    body: [
      '## 4. Règles métier',
      '| ID | Règle |',
      '|---|---|',
      '| B1 | Une règle vivante |',
      '| B2 | Une deuxième règle vivante |',
      '',
      '## 9. Hors scope (explicitement)',
      '',
      '- **B3** — Partage par lien public — raison : incompatible avec le journal des accès',
      ''
    ].join('\n')
  });
  assert(run('state.js', ['register', project, 'deliverable', 'prd', '.forge/prd.md']).code === 0, 'register prd');
  assert(run('state.js', ['set-status', project, 'deliverable', 'prd', 'approved']).code === 0, 'approve prd');

  const body = citeId
    ? "Un dashboard partagé.\n\nLa session ne passe jamais par un jeton dans l'URL (B3).\n"
    : "Un dashboard partagé.\n\nLa session ne passe jamais par un jeton dans l'URL.\n";
  writeDeliverable(project, '.forge/conventions.md', { type: 'conventions', body });
  assert(run('state.js', ['register', project, 'deliverable', 'conventions', '.forge/conventions.md']).code === 0, 'register conv');
  const args = ['register', project, 'deliverable', 'conventions', '.forge/conventions.md'];
  if (declares) args.push(`--requires=${declares}`);
  assert(run('state.js', args).code === 0, 're-register conv');
  assert(run('state.js', ['set-status', project, 'deliverable', 'conventions', 'approved']).code === 0, 'approve conv');
  return project;
}

test('une exigence retirée citée dans un livrable approuvé est signalée', () => {
  // Ce que `--requires` ne voit pas : la déclaration est manquée, donc vraie
  // par omission — et le contrôle sortait `retired: []` avec `pass: true`,
  // alors que la justification du livrable portait sur une exigence retirée.
  const project = retiredPremiseProject('premises-citee', { citeId: true, declares: 'B1' });
  const res = run('consistency-check.js', ['premises', project]);
  const c = res.json.checks.find(x => x.check === 'premises');
  assert(Array.isArray(c.retired_cited_in_body) && c.retired_cited_in_body.length === 1,
    `la citation d'un ID retiré doit être remontée : ${res.stdout.slice(0, 300)}`);
  const hit = c.retired_cited_in_body[0];
  assert(hit.deliverable === 'conventions' && hit.premise === 'B3',
    `mauvaise cible : ${JSON.stringify(hit)}`);
  assert(hit.acknowledged_only === false,
    'une citation qui n\'annonce pas le retrait ne doit pas compter comme acquittée');
});

test('une citation qui annonce explicitement le retrait est acquittée', () => {
  const project = freshProject('premises-acquittee');
  writeDeliverable(project, '.forge/prd.md', {
    body: [
      '## 4. Règles métier', '| ID | Règle |', '|---|---|', '| B1 | Une règle vivante |',
      '| B2 | Une deuxième règle vivante |', '',
      '## 9. Hors scope (explicitement)', '',
      '- **B3** — Partage par lien public — raison : incompatible avec le journal des accès', ''
    ].join('\n')
  });
  run('state.js', ['register', project, 'deliverable', 'prd', '.forge/prd.md']);
  run('state.js', ['set-status', project, 'deliverable', 'prd', 'approved']);
  writeDeliverable(project, '.forge/conventions.md', {
    type: 'conventions',
    body: "Session serveur. Le partage par lien est retiré (B3) : l'accès est une liste nominative (B1).\n"
  });
  run('state.js', ['register', project, 'deliverable', 'conventions', '.forge/conventions.md']);
  run('state.js', ['register', project, 'deliverable', 'conventions', '.forge/conventions.md', '--requires=B1,B2']);
  run('state.js', ['set-status', project, 'deliverable', 'conventions', 'approved']);

  const res = run('consistency-check.js', ['premises', project]);
  const c = res.json.checks.find(x => x.check === 'premises');
  const hit = (c.retired_cited_in_body || [])[0];
  assert(hit, 'la citation doit toujours être remontée, même acquittée');
  assert(hit.acknowledged_only === true,
    `une mention explicite du retrait doit acquitter la citation : ${JSON.stringify(hit)}`);
});

test('une citation acquittée en fin de ligne reste acquittée', () => {
  // Le défaut trouvé en conditions réelles : l'acquittement se lisait sur un
  // extrait tronqué à 120 caractères. Une mention « (B18 retiré) » placée en fin
  // de ligne tombait hors de la fenêtre, et une citation explicitement
  // acquittée était signalée comme un défaut. Un contrôle qui signale un
  // défaut inexistant apprend à être ignoré — c'est le pire sens possible.
  const project = freshProject('premises-extrait');
  writeDeliverable(project, '.forge/prd.md', {
    body: [
      '## 4. Règles métier', '| ID | Règle |', '|---|---|', '| B1 | Vivante |',
      '| B2 | Une deuxième règle vivante |', '',
      '## 9. Hors scope (explicitement)', '',
      '- **B3** — Partage par lien public — raison : incompatible avec le journal', ''
    ].join('\n')
  });
  run('state.js', ['register', project, 'deliverable', 'prd', '.forge/prd.md']);
  run('state.js', ['set-status', project, 'deliverable', 'prd', 'approved']);

  const padding = 'x'.repeat(160);
  writeDeliverable(project, '.forge/conventions.md', {
    type: 'conventions',
    body: `Une ligne très longue qui repousse la mention hors de la fenêtre : ${padding} (B3 retiré).\n`
  });
  run('state.js', ['register', project, 'deliverable', 'conventions', '.forge/conventions.md']);
  run('state.js', ['register', project, 'deliverable', 'conventions', '.forge/conventions.md', '--requires=B1']);
  run('state.js', ['set-status', project, 'deliverable', 'conventions', 'approved']);

  const res = run('consistency-check.js', ['premises', project]);
  const c = res.json.checks.find(x => x.check === 'premises');
  const hit = (c.retired_cited_in_body || [])[0];
  assert(hit, 'la citation doit être remontée');
  assert(hit.acknowledged === true || hit.acknowledged_only === true,
    `une mention placed hors de la fenêtre de 120 caractères doit rester acquittée : ${JSON.stringify(hit)}`);
  assert((c.retired_cited_without_acknowledgement || []).length === 0,
    'une citation acquittée ne doit pas rester dans la liste des défauts');
  assert(c.status !== 'warn',
    `une citation acquittée ne doit pas produire un avertissement : ${c.status}`);
});

test('une citation d\'exigence retirée qui n\'annonce pas le retrait déclenche un avertissement', () => {
  const project = retiredPremiseProject('premises-non-acquittee', { citeId: true, declares: 'B1' });
  const res = run('consistency-check.js', ['premises', project]);
  const c = res.json.checks.find(x => x.check === 'premises');
  assert(c.status === 'warn',
    `une citation non acquittée doit avertir : ${c.status}`);
  assert((c.retired_cited_without_acknowledgement || []).length === 1,
    `la liste des défauts doit contenir la citation : ${JSON.stringify(c.retired_cited_without_acknowledgement)}`);
});

test('state.js start liste les livrables approuvés sans prémisse déclarée', () => {
  const project = retiredPremiseProject('premises-start', { declares: 'B1' });
  // On retire la déclaration pour reproduire l'omission.
  const state = readState(project);
  delete state.deliverables.conventions.requires;
  writeState(project, state);

  const res = run('state.js', ['start', project]);
  assert(res.json.undeclared_premises && res.json.undeclared_premises.count === 1,
    `l'Étape 0 doit remonter l'omission : ${res.stdout.slice(0, 300)}`);
  assert(res.json.next_actions.some(a => /prémisse/i.test(a)),
    `l'Étape 0 doit proposer une action : ${JSON.stringify(res.json.next_actions)}`);
});

/* ------------------------------------------------------------------ *
 * Transition de phase — le contrôle ne doit pas crier sur une phase jamais commencée
 * ------------------------------------------------------------------ */

section('Transition de phase');

test('après complete-phase, le contrat ne juge pas la phase qui n\'a pas commencé', () => {
  // `complete-phase` avance `current_phase` à la phase suivante. Cette phase
  // est alors « courante » mais pas commencée — et le contrôle annonçait que
  // le roadmap manquait, à l'instant exact où personne n'avait commencé à
  // l'écrire. Un contrôle qui hurle quand on n'a rien à faire s'apprend à ignorer.
  const project = freshProject('phase-transition');
  writeDeliverable(project, '.forge/conventions.md', { type: 'conventions', body: '## Stack\n\nRien.\n' });
  run('state.js', ['register', project, 'deliverable', 'conventions', '.forge/conventions.md']);
  run('state.js', ['set-status', project, 'deliverable', 'conventions', 'approved']);
  assert(run('state.js', ['complete-phase', project, '0_bootstrap']).code === 0, 'complete-phase');

  const res = run('forge-guard.js', ['state', project]);
  const c = (res.json.checks || []).find(x => x.check === 'current_phase_has_deliverables');
  assert(c, 'le contrôle doit rester présent dans la sortie');
  assert(c.status === 'skip',
    `une phase non commencée doit être sautée, pas refusée : ${JSON.stringify(c)}`);
  assert(/pas encore commencée/.test(c.reason || ''), `la raison doit être explicite : ${c.reason}`);
  assert(res.json.pass === true, 'la transition ne doit pas rendre le garde-fou rouge');
});

test('une phase commencée sans livrable reste un échec', () => {
  const project = freshProject('phase-commencee');
  const state = readState(project);
  state.phases['0_bootstrap'].status = 'in_progress';
  writeState(project, state);

  const res = run('forge-guard.js', ['state', project]);
  const c = (res.json.checks || []).find(x => x.check === 'current_phase_has_deliverables');
  assert(c && c.status === 'fail',
    `une phase commencée et vide doit échouer : ${JSON.stringify(c)}`);
});

/* ------------------------------------------------------------------ *
 * Un contrôle ne doit pas exiger ce que la phase courante n'a pas à produire
 * ------------------------------------------------------------------ */

section('Exigences hors phase');

test('avant la Phase 5, un plan manquant n\'est pas un défaut', () => {
  // Au gate de la Phase 4, `consistency-check all` echouait sur les dix plans
  // qui n'existaient pas encore — pour la raison exacte qu'on etait en train de
  // faire ce qu'on fait dans l'ordre prevu.
  const project = freshProject('phases-plans');
  run('state.js', ['register', project, 'slice', 'slice-alpha', '.forge/plans/slice-alpha.md']);
  const res = run('consistency-check.js', ['reality', project]);
  const c = res.json.checks.find(x => x.check === 'slice_plan_exists');
  assert(c.status === 'pass', `un plan manquant avant la Phase 5 doit passer : ${c.status}`);
  assert(c.plans_expected === false, 'le controle doit dire qu\'il n\'attend rien');
});

test('un plan ecrit puis disparu reste un defaut', () => {
  const project = freshProject('phases-plan-disparu');
  const abs = path.join(project, '.forge', 'plans', 'slice-beta.md');
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  writeDeliverable(project, '.forge/plans/slice-beta.md', { type: 'implementation-plan', body: 'Le plan.' });
  run('state.js', ['register', project, 'slice', 'slice-beta', '.forge/plans/slice-beta.md']);
  // Le plan a été écrit — le hash est donc enregistré — puis il disparaît.
  fs.unlinkSync(abs);
  const res = run('consistency-check.js', ['reality', project]);
  const c = res.json.checks.find(x => x.check === 'slice_plan_exists');
  assert(c.status === 'fail',
    `un plan enregistre et disparu est une derive, pas un plan a ecrire : ${c.status}`);
  assert(c.missing.some(m => m.slice === 'slice-beta'), 'le plan manquant doit etre nomme');
});

test('apres la Phase 5, un plan manquant redevient un defaut', () => {
  const project = freshProject('phases-plans-apres');
  run('state.js', ['register', project, 'slice', 'slice-gamma', '.forge/plans/slice-gamma.md']);
  const state = readState(project);
  state.phases['5_implementation_plan'].status = 'approved';
  writeState(project, state);
  const res = run('consistency-check.js', ['reality', project]);
  const c = res.json.checks.find(x => x.check === 'slice_plan_exists');
  assert(c.status === 'fail', 'une phase franchie exige ses livrables');
  assert(c.plans_expected === true, 'le controle doit le dire');
});

test('avant la Phase 5, le lien ecran ↔ slice est saute', () => {
  const project = freshProject('phases-ecrans');
  writeDeliverable(project, '.forge/design/screens/accueil.md', { type: 'screen' });
  run('state.js', ['register', project, 'screen', 'accueil', '.forge/design/screens/accueil.md']);
  run('state.js', ['register', project, 'slice', 'slice-delta', '.forge/plans/slice-delta.md']);
  const res = run('consistency-check.js', ['screens', project]);
  const c = res.json.checks.find(x => x.check === 'screens_have_slices');
  assert(c.status === 'skip',
    `le lien ecran ↔ slice se verifie quand les plans existent : ${c.status}`);
});

test('le hash d\'un ecran est verifie, pas seulement celui d\'un livrable', () => {
  // `state.js register` enregistre un `content_hash` pour les ecrans comme pour
  // les livrables, mais le controle ne lisait que `deliverables`. Un ecran
  // reecrit apres son enregistrement etait invisible : le hash enregistre etait
  // perime, donc faux, et personne ne le savait.
  const project = freshProject('phases-hash-ecran');
  writeDeliverable(project, '.forge/design/screens/liste.md', { type: 'screen', body: 'Version initiale.' });
  run('state.js', ['register', project, 'screen', 'liste', '.forge/design/screens/liste.md']);

  let res = run('forge-guard.js', ['state', project]);
  let c = res.json.checks.find(x => x.check === 'content_hashes_current');
  assert(c.status === 'pass', 'un ecran intact ne doit pas etre signale');

  const abs = path.join(project, '.forge', 'design', 'screens', 'liste.md');
  fs.writeFileSync(abs, fs.readFileSync(abs, 'utf-8').replace('Version initiale.', 'Version reecrite.'));

  res = run('forge-guard.js', ['state', project]);
  c = res.json.checks.find(x => x.check === 'content_hashes_current');
  assert(c.status === 'fail', 'un ecran reecrit hors bande doit etre signale');
  assert(c.drifted.some(d => d.kind === 'screen' && d.artifact === 'liste'),
    `la derive doit nommer l'ecran : ${JSON.stringify(c.drifted)}`);

  // Et la commande documentee doit permettre de remettre le hash a jour.
  const h = run('state.js', ['hash', project, 'liste']);
  assert(h.code === 0, `state.js hash doit porter sur un ecran : ${h.stdout}${h.stderr}`);
  res = run('forge-guard.js', ['state', project]);
  c = res.json.checks.find(x => x.check === 'content_hashes_current');
  assert(c.status === 'pass', 'apres hash, l\'ecran doit repasser au vert');
});

/* ------------------------------------------------------------------ *
 * IDs retirés : la règle d'attribution
 * ------------------------------------------------------------------ */

section('Attribution des IDs');

test('SKILL.md interdit de renuméroter un ID retiré', () => {
  const c = fs.readFileSync(path.join(SKILL_DIR, 'SKILL.md'), 'utf-8');
  const sectionText = c.slice(c.indexOf('Un ID ne désigne qu'), c.indexOf('## Gestion des changements'));
  assert(/garde son ID/.test(sectionText), 'la règle de conservation doit être présente');
  assert(/ne réattribue jamais un numéro libéré|jamais réattribu/i.test(sectionText),
    'la règle de non-réattribution doit être présente');
  assert(/B1xx/.test(sectionText) && /casse la traçabilité|à écarter/i.test(sectionText),
    'le renumérotage en plage à part doit être explicitement écarté, pas seulement évité');
});

/* ------------------------------------------------------------------ *
 * Design — le contraste se mesure, il ne s'écrit pas
 * ------------------------------------------------------------------ */

section('Design — contrastes mesurés');

/** Un design system minimal mais réaliste : fond, surfaces, texte, tokens. */
function designProject(label, overrides = {}) {
  const project = freshProject(label);
  const tokens = {
    '--color-ink-100': '#E4E8E6',
    '--color-background': '#F2F4F3',
    '--color-surface': '#E9EDEB',
    '--color-surface-raised': '#F7F9F8',
    '--color-text-primary': ['#2C3633', 'Texte principal'],
    '--color-text-secondary': ['#4F5C57', 'Labels et dates de calcul'],
    '--color-accent': ['#0F5C57', 'Action principale | 7,07:1 sur le fond'],
    '--color-border': '#C9D0CD'
  };
  for (const [k, v] of Object.entries(overrides)) tokens[k] = v;

  const rows = Object.entries(tokens).map(([k, v]) => {
    if (Array.isArray(v)) return `| \`${k}\` | \`${v[0]}\` | ${v[1]} |`;
    return `| \`${k}\` | \`${v}\` | usage |`;
  }).join('\n');

  writeDeliverable(project, '.forge/design/design-system.md', {
    type: 'design-system',
    body: '# Design System\n\n## 1.1 Couleurs\n\n| Token | Valeur | Usage |\n|---|---|---|\n' + rows + '\n'
  });
  assert(run('state.js', ['register', project, 'deliverable', 'design_system', '.forge/design/design-system.md']).code === 0,
    'register design_system');
  return project;
}

/* ------------------------------------------------------------------ *
 * component-parity — la surface d'un composant, dans tous les écrans
 * ------------------------------------------------------------------ */

/** Un design system avec un composant nommé, et un écran qui le rend. */
function parityProject(label, { slots = ['label', 'value'], states = ['default', 'loading'], screenSlots = null } = {}) {
  const project = freshProject(label);
  const slotRows = slots.map((n, i) => `| \`${n}\` | ${i === 0 ? 'oui' : 'non'} | usage |`).join('\n');
  const stateRows = states.map(n => `| \`${n}\` | déclencheur | apparence |`).join('\n');

  writeDeliverable(project, '.forge/design/design-system.md', {
    type: 'design-system',
    body: '# Design System\n\n## 1.1 Couleurs\n\n' +
      '| Token | Valeur | Usage |\n|---|---|---|\n' +
      '| `--color-text-primary` | `#2C3633` | Texte principal |\n\n' +
      '## 2. Composants primitifs\n\n### Tile\n\n**Rôle** : afficher une valeur.\n\n' +
      '**États** :\n\n| État | Déclencheur | Apparence |\n|---|---|---|\n' + stateRows + '\n\n' +
      '**Slots** :\n\n| Slot | Requis | Contenu |\n|---|---|---|\n' + slotRows + '\n'
  });
  assert(run('state.js', ['register', project, 'deliverable', 'design_system', '.forge/design/design-system.md']).code === 0,
    'register design_system');

  const cited = screenSlots === null ? slots : screenSlots;
  writeDeliverable(project, '.forge/design/screens/liste.md', {
    type: 'screen',
    body: '# Liste\n\nGrille de `Tile` en `sm`.\n\n' +
      `Chaque tuile porte ses ${cited.length} slots : ${cited.map(n => '`' + n + '`').join(', ')}.\n\n` +
      'États rendus : ' + states.map(n => '`' + n + '`').join(', ') + '.\n'
  });
  assert(run('state.js', ['register', project, 'screen', 'liste', '.forge/design/screens/liste.md']).code === 0,
    'register écran');
  return project;
}

test('component-parity accepte un écran à jour de la surface du composant', () => {
  const project = parityProject('parity-ok');
  const res = run('design-check.js', ['component-parity', project]);
  assert(res.code === 0, `un écran à jour doit passer : ${res.stdout}${res.stderr}`);
  assert(res.json.pass === true, 'pass attendu');
  assert(res.json.components.length === 1, `le composant doit être recensé : ${JSON.stringify(res.json.components)}`);
});

test('component-parity détecte une ÉNUMÉRATION de surface périmée', () => {
  // Le composant gagne un slot ; un écran continue d'affirmer « ses 6 slots ».
  // Aucun contrôle ne le voyait : `tokens-used` vérifie que les tokens cités
  // existent, pas que la surface annoncée est celle du composant. Le même
  // composant se retrouve avec deux rendus, et l'écart apparaît précisément là
  // où la règle de précédence existe pour l'empêcher.
  const project = parityProject('parity-perime',
    { slots: ['label', 'value', 'threshold'], screenSlots: ['label', 'value'] });
  const res = run('design-check.js', ['component-parity', project]);
  assert(res.code !== 0, 'une énumération périmée doit échouer');
  const o = res.json.offenders.find(x => x.problem === 'enumeration_perimee');
  assert(o, `le défaut doit être nommé : ${JSON.stringify(res.json.offenders)}`);
  assert(o.component === 'Tile', `le composant doit être nommé : ${JSON.stringify(o)}`);
  assert(o.actual_count === 3 && o.cited_count === 2,
    `les deux comptes doivent être rapportés : ${JSON.stringify(o)}`);
  assert(/threshold/.test(o.hint), `le slot manquant doit être nommé : ${o.hint}`);
});

test('component-parity n\'accuse pas le mauvais composant', () => {
  // Une ligne de tableau cite plusieurs composants : `ProvenanceStrip`,
  // `ExportPanel`, puis « chaque tuile porte ses 6 slots » — qui parle de la
  // tuile. Rattacher l'énumération au dernier composant nommé accuse le mauvais.
  const project = parityProject('parity-attribution');
  const screenPath = path.join(project, '.forge/design/screens/liste.md');
  const md = fs.readFileSync(screenPath, 'utf-8');
  fs.writeFileSync(screenPath, md.replace('Grille de `Tile`', '`ExportPanel` complet, puis `Tile`'));

  const res = run('design-check.js', ['component-parity', project]);
  assert(res.code === 0, `l'énumération correcte ne doit pas être signalée : ${JSON.stringify(res.json.offenders)}`);
  assert(res.json.offenders.length === 0, `aucun signalement attendu : ${JSON.stringify(res.json.offenders)}`);
});

test('component-parity lit les deux écritures d\'un contrat de composant', () => {
  // `**États** :` suivi d'un tableau, et `**États** : \`a\` · \`b\`` en prose.
  // Ne lire que le tableau déclare que la moitié des composants sans état —
  // donc n'exige rien d'eux, en silence.
  const project = freshProject('parity-prose');
  writeDeliverable(project, '.forge/design/design-system.md', {
    type: 'design-system',
    body: '# Design System\n\n## 2. Composants primitifs\n\n### Table\n\n' +
      '**États** : `loading` (squelette) · `filled` · `error` (message).\n\n' +
      '### Tile\n\n**États** :\n\n| État | Déclencheur | Apparence |\n|---|---|---|\n' +
      '| `default` | valeur | normale |\n| `no_data` | aucune ligne (E2) | vide |\n'
  });
  assert(run('state.js', ['register', project, 'deliverable', 'design_system', '.forge/design/design-system.md']).code === 0,
    'register');
  const res = run('design-check.js', ['component-parity', project]);
  const byName = Object.fromEntries(res.json.components.map(c => [c.component, c.states]));
  assert(byName.Table === 3, `la forme prose doit être lue : ${JSON.stringify(res.json.components)}`);
  assert(byName.Tile === 2, `la forme tableau doit être lue : ${JSON.stringify(res.json.components)}`);
});

test('component-parity ne confond pas un § 2.1 avec la fin du composant', () => {
  // `search` rend l'index du PREMIER `#`. Sauter `start + 1` laisse
  // `## Tile` en tête de la section extraite, qui ressort comme « titre
  // suivant » à l'offset 0 — et le composant est déclaré sans état, donc sans
  // aucune exigence, sans aucune erreur.
  const project = freshProject('parity-sous-section');
  writeDeliverable(project, '.forge/design/design-system.md', {
    type: 'design-system',
    body: '# Design System\n\n## 2. Composants primitifs\n\n### Tile\n\n' +
      '**États** :\n\n| État | Déclencheur | Apparence |\n|---|---|---|\n| `default` | valeur | normale |\n\n' +
      '#### 2.1 `Machine` — les transitions\n\n| De | Vers |\n|---|---|\n| `a` | `b` |\n\n' +
      '### Autre\n\n**États** : `x`.\n'
  });
  assert(run('state.js', ['register', project, 'deliverable', 'design_system', '.forge/design/design-system.md']).code === 0,
    'register');
  const res = run('design-check.js', ['component-parity', project]);
  const tile = res.json.components.find(c => c.component === 'Tile');
  assert(tile && tile.states === 1,
    `les états de Tile doivent être lus avant sa sous-section : ${JSON.stringify(res.json.components)}`);
});

/* ------------------------------------------------------------------ *
 * Bloc 2 — le périmètre d'un validateur, et la citation vérifiable
 * ------------------------------------------------------------------ */

test('register recopie derived_from dans l\'AUTORITÉ', () => {
  // `fast-track.md` prescrit aux validateurs de lire « son `derived_from` ».
  // Tant que la valeur ne vit que dans le front matter, la consigne n'est pas
  // applicable : le validateur doit ouvrir le document qu'il doit valider pour
  // découvrir son propre périmètre. Constaté sur un test grandeur nature, où
  // `state.json → slices.<clé>` ne portait aucun `derived_from`.
  const project = freshProject('derived-from-autorite');
  fs.writeFileSync(path.join(project, '.forge/prd.md'),
    '---\nforge: true\nkind: deliverable\nkey: prd\nstatus: draft\nderived_from:\n  - .forge/conventions.md\n---\n\n# PRD\n');
  const res = run('state.js', ['register', project, 'deliverable', 'prd', '.forge/prd.md']);
  assert(res.code === 0, `register a échoué : ${res.stdout}${res.stderr}`);
  const state = readState(project);
  assert(Array.isArray(state.deliverables.prd.derived_from),
    `derived_from absent de l'autorité : ${JSON.stringify(state.deliverables.prd)}`);
  assert(state.deliverables.prd.derived_from.includes('.forge/conventions.md'),
    `le chemin résolu est attendu : ${JSON.stringify(state.deliverables.prd.derived_from)}`);
});

test('sync REMPLIT derived_from sur une entrée enregistrée avant la propagation', () => {
  // C'est le cas de tout projet ayant utilisé le skill avant ce correctif :
  // l'entrée existe, le front matter aussi, mais l'autorité ne les relie pas.
  const project = freshProject('derived-from-backfill');
  fs.writeFileSync(path.join(project, '.forge/prd.md'),
    '---\nforge: true\nkind: deliverable\nkey: prd\nstatus: draft\nderived_from:\n  - .forge/conventions.md\n---\n\n# PRD\n');
  run('state.js', ['register', project, 'deliverable', 'prd', '.forge/prd.md']);
  // On simule l'état antérieur : le champ a disparu de l'autorité.
  const state = readState(project);
  delete state.deliverables.prd.derived_from;
  writeState(project, state);

  const res = run('state.js', ['sync', project]);
  assert(res.code === 0, `sync a échoué : ${res.stdout}${res.stderr}`);
  const after = readState(project);
  assert(after.deliverables.prd.derived_from &&
         after.deliverables.prd.derived_from.includes('.forge/conventions.md'),
    `sync n'a pas propagé derived_from : ${JSON.stringify(after.deliverables.prd)}`);
});

test('derived_from ne retient ni un gabarit ni un chemin hors racine', () => {
  const project = freshProject('derived-from-bruit');
  fs.writeFileSync(path.join(project, '.forge/prd.md'),
    '---\nforge: true\nkind: deliverable\nkey: prd\nstatus: draft\nderived_from:\n' +
    '  - .forge/conventions.md\n  - "{{SOURCE}}"\n  - ../ailleurs.md\n---\n\n# PRD\n');
  run('state.js', ['register', project, 'deliverable', 'prd', '.forge/prd.md']);
  const got = readState(project).deliverables.prd.derived_from || [];
  assert(got.includes('.forge/conventions.md'), `le chemin réel doit être gardé : ${JSON.stringify(got)}`);
  assert(!got.some(v => v.includes('{{')), `un gabarit non résolu ne doit pas être une provenance : ${JSON.stringify(got)}`);
  assert(!got.some(v => v.startsWith('..')), `un chemin hors racine n'est pas une provenance : ${JSON.stringify(got)}`);
});

test('les TROIS fichiers de périmètre disent la MÊME chose', () => {
  // Le défaut : `fast-track.md` disait « l'artefact + son derived_from »,
  // `quality-analyst.md` interdisait le PRD jusqu'en Phase 6, `red-team.md`
  // l'autorisait pour les IDs. Un validateur applique la règle la plus
  // étroite qu'il connaît — donc se prive du document dont il a le plus
  // besoin — et ne le signale pas.
  const agents = path.join(SCRIPTS, '..', 'agents');
  const qa = fs.readFileSync(path.join(agents, 'quality-analyst.md'), 'utf-8');
  const rt = fs.readFileSync(path.join(agents, 'red-team.md'), 'utf-8');
  const ft = fs.readFileSync(path.join(SCRIPTS, '..', 'references', 'fast-track.md'), 'utf-8');

  for (const [nom, txt] of [['quality-analyst', qa], ['red-team', rt]]) {
    assert(/derived_from/.test(txt), `${nom} doit nommer derived_from comme source du périmètre`);
    // L'ancienne règle restrictive a disparu.
    assert(!/seulement en Phase 6/.test(txt),
      `${nom} porte encore l'interdiction du PRD qui contredisait fast-track.md`);
    // On teste le SENS, pas la ponctuation : la ligne qui énonce la sanction
    // doit nommer `unreadable_without`, « non vide » et BLOCK ensemble.
    const sanction = txt.split('\n').find(l => /unreadable_without` non vide/.test(l) && /BLOCK/.test(l));
    assert(sanction,
      `${nom} ne fait pas de unreadable_without non vide une sanction`);
    assert(/prior_critical_resolved/.test(txt),
      `${nom} ne sait pas rendre un constat résolu sans re-BLOCK`);
  }
  assert(/une seule règle/i.test(ft), `fast-track.md doit poser la règle en un seul endroit`);
  assert(/unreadable_without` non vide/.test(ft), `fast-track.md doit porter la sanction`);
});

test('les deux contrats de sortie des validateurs sont IDENTIQUES', () => {
  // Ils ne doivent pas diverger de nouveau : c'est exactement le défaut, sous
  // une autre forme. On compare la forme JSON, pas le texte.
  const agents = path.join(SCRIPTS, '..', 'agents');
  const shape = f => {
    const m = fs.readFileSync(path.join(agents, f), 'utf-8').match(/```json\n([\s\S]*?)```/);
    assert(m, `${f} n'a pas de bloc json`);
    const keys = [...m[1].matchAll(/^  "([a-z_]+)":/gm)].map(x => x[1]).sort();
    const fkeys = [...m[1].matchAll(/^ {6}"([a-z_]+)":/gm)].map(x => x[1]).sort();
    return { top: keys.join(','), finding: fkeys.join(',') };
  };
  const qa = shape('quality-analyst.md');
  const rt = shape('red-team.md');
  assert(qa.top === rt.top, `clés du rapport divergentes : ${qa.top} ≠ ${rt.top}`);
  assert(qa.finding === rt.finding, `clés d'un finding divergentes : ${qa.finding} ≠ ${rt.finding}`);
});

test('un contrôle borné à sonhappy path est REJETÉ', () => {
  // La règle, née d'un test grandeur nature où deux contrôles successifs ont
  // déclaré « 0 problème » sur des fichiers pourtant corrompus : le premier
  // était un `Get-Content -Raw` PowerShell qui ne matchait rien, le second un
  // scan CJK-only qui a laissé passer `U+1EE1` dans `_USERNAMEOục`. Deux faux
  // verts, dont un sur douze fichiers.
  //
  // **Un contrôle jamais vu échouer n'est pas validé, il est inconnu.** Il ne
  // suffit donc pas d'écrire `pass === true` : il faut avoir vu le contrôle
  // accrocher sur une entrée volontairement défectueuse, et laisser passer un
  // témoin propre. Ce test applique cette exigence à `component-parity` et à
  // `state-parity`, les deux contrôles ajoutés après la formulation de la règle.
  const cases = [
    {
      nom: 'component-parity',
      run: (project, broken) => run('design-check.js',
        ['component-parity', project, ...(broken ? [] : [])]),
      casser: project => {
        // Un écran qui affirme une énumération périmée de la surface.
        const p = path.join(project, '.forge/design/screens/liste.md');
        fs.writeFileSync(p, fs.readFileSync(p, 'utf-8')
          .replace('ses 2 slots', 'ses 3 slots'));
      },
      doitEchouer: res => res.code !== 0,
    }
  ];

  for (const c of cases) {
    const project = parityProject(`selftest-negatif-${c.nom}`);
    const propre = c.run(project);
    assert(propre.code === 0,
      `témoin propre : ${c.nom} aurait dû passer : ${propre.stdout}`);
    c.casser(project);
    const casse = c.run(project);
    assert(c.doitEchouer(casse),
      `${c.nom} n'a pas accroché sur une entrée défectueuse : ` +
      `un contrôle jamais vu échouer est inconnu, pas validé — ${casse.stdout}`);
  }
});

test('state-parity accroche sur un état absent, et laisse un témoin propre', () => {
  // Même exigence, sur le contrôle qui a mis quatre essais à devenir honnête :
  // il rendait 22 signalements dont 19 faux. Un contrôle bruyant et un
  // contrôle muet sont deux versions du même défaut — celui de ne pas l'avoir
  // vu travailler dans les deux sens.
  const project = freshProject('selftest-state-parity');
  writeDeliverable(project, '.forge/design/design-system.md', {
    type: 'design-system',
    body: '# Design System\n\n## 2. Composants primitifs\n\n### Tile\n\n' +
      '**États** — rendus par l\'union `TileState` :\n\n| État | Déclencheur | Apparence |\n|---|---|---|\n' +
      '| `default` | valeur | normale |\n| `ghost` | jamais produit | aucune |\n\n'
  });
  run('state.js', ['register', project, 'deliverable', 'design_system', '.forge/design/design-system.md']);
  writeDeliverable(project, '.forge/architecture.md', {
    type: 'architecture',
    body: '# Architecture\n\n```ts\nexport type TileState = \'default\';\n```\n'
  });
  run('state.js', ['register', project, 'deliverable', 'architecture', '.forge/architecture.md']);

  const res = run('consistency-check.js', ['state-parity', project]);
  assert(res.code !== 0, 'un état déclaré au design et absent de l\'union doit accrocher');
  const c = (res.json.checks || []).find(x => x.check === 'declared_state_parity');
  assert(c && c.offenders.some(o => o.state === 'ghost'),
    `l'état fautif doit être nommé : ${JSON.stringify(c && c.offenders)}`);

  // Témoin propre : l'union contient l'état, et rien ne doit être signalé.
  writeDeliverable(project, '.forge/architecture.md', {
    type: 'architecture',
    body: '# Architecture\n\n```ts\nexport type TileState = \'default\' | \'ghost\';\n```\n'
  });
  const propre = run('consistency-check.js', ['state-parity', project]);
  assert(propre.code === 0,
    `une union alignée doit passer sans signalement : ${JSON.stringify((propre.json.checks || [])[0])}`);
});

test('no_stray_characters accroche sur du VRAI parasite, et laisse la typographie française', () => {
  // Un scan « CJK only » a déclaré propre un fichier contenant `U+1EE1` dans
  // `_USERNAMEOục` : Latin Extended Additional, hors des plages testées. Le
  // parasite suivant (`diverge阈ront`) n'a été trouvé qu'en passant par une
  // liste blanche. Et le premier essai de la liste blanche signalait **28 fois**
  // des ordinaux français corrects (`1ᵉʳ`) — donc un contrôle que l'on éteint.
  //
  // Le test vérifie les deux sens : il accroche sur du vrai parasite, et il
  // se tait sur la typographie. Les deux, sinon il est inconnu.
  const project = freshProject('stray-chars');
  writeDeliverable(project, '.forge/prd.md', {
    type: 'prd',
    body: 'Le 1ᵉʳ trimestre, le CO₂ baisse. Au 2ᵉ rang.\n'   // doit rester silencieux
  });
  run('state.js', ['register', project, 'deliverable', 'prd', '.forge/prd.md']);

  const propre = run('forge-guard.js', ['all', project]);
  const c1 = (propre.json.checks || []).find(x => x.check === 'no_stray_characters');
  assert(c1 && c1.offenders.length === 0,
    `la typographie française ne doit pas être signalée : ${JSON.stringify(c1 && c1.offenders)}`);

  // Vrai parasite : un caractère d'un système d'écriture qu'on ne cite jamais,
  // collé au milieu d'un mot français.
  const abs = path.join(project, '.forge/prd.md');
  fs.writeFileSync(abs, fs.readFileSync(abs, 'utf-8')
    .replace('baisse', 'bei' + String.fromCharCode(0xBC95) + String.fromCharCode(0xC5D0) + 'se'));

  const casse = run('forge-guard.js', ['all', project]);
  const c2 = (casse.json.checks || []).find(x => x.check === 'no_stray_characters');
  assert(c2 && c2.offenders.length > 0,
    'un vrai parasite collé dans un mot français doit être signalé');
  assert(c2.offenders.some(o => o.char.includes('OutOfContext')),
    `le parasite doit être qualifié : ${JSON.stringify(c2.offenders)}`);
});

test('une ligne marquée unicode-scan:ignore est ignorée, et rien d\'autre', () => {
  // Sans cette marque, le rapport qui **cite** un défaut déclencherait le
  // contrôle sur sa propre citation — et un rapport de test qui ne s'applique
  // pas son propre contrôle n'est pas un rapport de test.
  const project = freshProject('stray-ignore');
  writeDeliverable(project, '.forge/prd.md', {
    type: 'prd',
    body: 'Un caractère CJK parasite : 阈. <!-- unicode-scan:ignore -->\n' +
          'Et un autre, non marqué : 阈\n'
  });
  run('state.js', ['register', project, 'deliverable', 'prd', '.forge/prd.md']);
  const res = run('forge-guard.js', ['all', project]);
  const c = (res.json.checks || []).find(x => x.check === 'no_stray_characters');
  assert(c && c.offenders.length === 1,
    `seule la ligne NON marquée doit être signalée : ${JSON.stringify(c && c.offenders)}`);
});

test('design-check mesure et accepte une palette conforme', () => {
  const project = designProject('design-ok');
  const res = run('design-check.js', ['contrast', project]);
  assert(res.code === 0, `une palette conforme doit passer : ${res.stdout}${res.stderr}`);
  assert(res.json.pass === true, 'pass attendu');
  assert(res.json.surfaces.length >= 4, `les surfaces doivent être recensées : ${JSON.stringify(res.json.surfaces)}`);
  assert(res.json.classified.length > 0, 'la classification doit être visible');
});

test('design-check échoue sur un texte sous 4,5:1', () => {
  const project = designProject('design-texte-faible', { '--color-text-primary': '#8FA098' });
  const res = run('design-check.js', ['contrast', project]);
  assert(res.code !== 0, 'un texte à 2,09:1 doit échouer');
  const o = res.json.offenders.find(x => x.token === '--color-text-primary');
  assert(o, `le token fautif doit être nommé : ${res.stdout.slice(0, 300)}`);
  assert(o.kind === 'text', `la classe texte doit être déterminée : ${o.kind}`);
});

test('design-check mesure le texte contre TOUTE surface, pas seulement le fond', () => {
  // Le défaut que ce contrôle a d'abord eu : une liste en dur de surfaces. Un
  // texte à 4,5:1 sur le fond passait à 4,44:1 sur la ligne alternée des
  // tableaux — c'est-à-dire là où on lit le plus.
  const project = designProject('design-surface', {
    '--color-text-secondary': '#5F6C67',
    '--color-ink-100': '#E4E8E6'
  });
  const res = run('design-check.js', ['contrast', project]);
  const o = res.json.offenders.find(x => x.token === '--color-text-secondary');
  assert(o, 'un texte trop clair sur une surface doit être signalé');
  assert(o.against !== '--color-background',
    `l'échec doit être attribué à la surface fautive, pas au fond : ${o.against}`);
  assert(/ink-100/.test(o.against), `la ligne alternée doit être nommée : ${o.against}`);
});

test('design-check échoue sur un ratio ANNONCE qui ne correspond pas au mesuré', () => {
  // Un ratio inventé est pire qu'un ratio absent : il donne une assurance que
  // rien ne vient soutenir.
  const project = designProject('design-annonce', {
    '--color-accent': ['#0F5C57', 'Action principale | 9,9:1 sur le fond']
  });
  const res = run('design-check.js', ['contrast', project]);
  const o = res.json.offenders.find(x => x.token === '--color-accent');
  assert(o && o.problem === 'claimed_ratio_differs',
    `un ratio annoncé faux doit être signalé : ${JSON.stringify(o)}`);
  assert(res.code !== 0, 'un ratio annoncé faux doit faire échouer');
});

test('l\'anneau de focus n\'est PAS exempté de contraste', () => {
  // Exempter tout le préfixe `--color-border*` exempterait `--color-border-focus`,
  // qui est précisément le composant qui DOIT atteindre 3:1 : sans lui, un
  // utilisateur qui navigue au clavier ne voit pas où il est.
  const project = designProject('design-focus', { '--color-border-focus': '#DDE3E0' });
  const res = run('design-check.js', ['contrast', project]);
  const o = res.json.offenders.find(x => x.token === '--color-border-focus');
  assert(o, 'un anneau de focus à 1,2:1 doit échouer');
  assert(o.kind === 'non_text', `classe attendue : non_text, obtenu ${o.kind}`);
});

test('une exemption est nommée et visible dans la sortie', () => {
  const project = designProject('design-exempt');
  const res = run('design-check.js', ['contrast', project]);
  const cls = res.json.classified.find(c => c.token === '--color-border');
  assert(cls && cls.kind === 'exempt', `le filet décoratif doit être exempté : ${JSON.stringify(cls)}`);
  assert(cls.why && cls.why.length > 5, 'une exemption doit porter sa raison');
  assert(cls.by, 'la classification doit dire sur quoi elle s\'appuie');
});

test('un arrondi ne doit jamais créer un VERT', () => {
  // `#7A6A3C` sur `#E9EDEB` vaut 4,4958:1. Arrondi à deux décimales : 4,50 —
  // donc conforme. Or 4,4958 est SOUS 4,5. Un contrôle qui compare l'arrondi au
  // seuil est vert sur un échec réel, et il le restera pour toujours, parce
  // qu'on ne voit pas d'erreur là où il n'y en a pas.
  const project = designProject('design-arrondi', {
    '--color-surface': '#E9EDEB',
    '--color-accent-subtle': '#7A6A3C'
  });
  const res = run('design-check.js', ['contrast', project]);
  assert(res.code !== 0,
    `4,4958:1 est sous 4,5 et doit échouer, même arrondi à 4,50 : ${res.stdout.slice(0, 400)}`);
});

test('design-check signale un token sans valeur concrète', () => {
  const project = designProject('design-vide', { '--color-accent': ['À DÉCIDER', 'Action principale'] });
  const res = run('design-check.js', ['tokens', project]);
  assert(res.code !== 0, 'un token sans valeur doit échouer');
  assert(res.json.offenders.some(o => o.token === '--color-accent'),
    `le token doit être nommé : ${JSON.stringify(res.json.offenders)}`);
});

test('design-check échoue proprement sans design system', () => {
  const project = freshProject('design-absent');
  const res = run('design-check.js', ['contrast', project]);
  assert(res.code !== 0, 'sans design system, le contrôle doit le dire');
  assert(res.json.error === 'design_system_absent', 'le motif doit être nommé');
});

test('placeholders ignore un placeholder cité entre guillemets', () => {
  // Le contrôle signalait sa propre checklist de design system (« aucun
  // `{{PLACEHOLDER}}` résiduel »). Un garde-fou qui hurle quand il n'a rien à
  // dire est un garde-fou qu'on n'écoute plus.
  const project = freshProject('placeholders-code');
  const abs = path.join(project, '.forge', 'design', 'design-system.md');
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs,
    '---\ntype: design-system\nstatus: draft\n---\n\n# DS\n\n' +
    '- [ ] Aucun `{{PLACEHOLDER}}` résiduel — cité, donc documenté.\n' +
    '- [ ] Un vrai {{PLACEHOLDER}} laissé ici.\n');
  assert(run('state.js', ['register', project, 'deliverable', 'design_system', '.forge/design/design-system.md']).code === 0, 'register');

  const res = run('forge-guard.js', ['placeholders', project]);
  assert(res.code !== 0, 'un placeholder hors guillemets doit toujours échouer');
  const c = res.json.checks.find(x => x.check === 'no_unresolved_placeholders');
  assert(c.status === 'fail', 'le contrôle doit rester actif');
  // Le contrôle doit avoir vu exactement le placeholder hors guillemets. Si le
  // cité est aussi signalé, le contrôle hurle sur sa propre checklist — et il
  // faut alors le désinstaller : la prochaine erreur qu'il rendra
  //Channels::false sera ignorée.
  const reported = (c.offenders || []).flatMap(o => o.placeholders || []);
  assert(reported.length === 1 && reported[0] === '{{PLACEHOLDER}}',
    `un seul placeholder doit être signalé, celui hors guillemets : ${JSON.stringify(c.offenders)}`);
});

test('SKILL.md branche design-check au gate de la Phase 3', () => {
  const c = fs.readFileSync(path.join(SKILL_DIR, 'SKILL.md'), 'utf-8');
  assert(c.includes('design-check.js'), 'le script doit être documenté dans SKILL.md');
  assert(c.includes('Mesure les contrastes'), 'la Phase 3 doit exiger une mesure, pas une rédaction');
  const list = c.slice(c.indexOf('### Scripts'), c.indexOf('### Documents de référence'));
  assert(/`design-check\.js`/.test(list), 'le script doit figurer dans le tableau de référence');
});

  console.log(`\x1b[32m✓ ${passed} tests passés\x1b[0m`);
} else {
  console.log(`\x1b[31m✗ ${failed} échec(s)\x1b[0m, ${passed} passés`);
  for (const f of failures) console.log(`  - ${f.name}: ${f.message}`);
}
process.exit(failed === 0 ? 0 : 1);
