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

function run(script, args, opts = {}) {
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
  assert(d.some(x => x.deliverable === 'prd'), `dérive non détectée : ${JSON.stringify(d)}`);
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
  assert(sk.includes('state.js log'), 'la commande de journalisation doit être documentée');
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

  console.log(`\x1b[32m✓ ${passed} tests passés\x1b[0m`);
} else {
  console.log(`\x1b[31m✗ ${failed} échec(s)\x1b[0m, ${passed} passés`);
  for (const f of failures) console.log(`  - ${f.name}: ${f.message}`);
}
process.exit(failed === 0 ? 0 : 1);
