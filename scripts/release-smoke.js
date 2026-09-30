#!/usr/bin/env node
'use strict';

/**
 * release-smoke.js — exécute release.js dans un bac à sable jetable.
 *
 * Un workflow qui publie une release vide en rapportant « success » a déjà eu
 * lieu. La cause n'était pas dans la logique de version : c'était un stdout de
 * script jamais recopié dans GITHUB_OUTPUT. Aucun test statique ne l'aurait vu.
 *
 * Ce test execute donc le vrai script, dans une copie jetable du dépôt, et
 * vérifie que stdout est du JSON exploitable et que VERSION suit le CHANGELOG.
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const RELEASE = path.join(ROOT, 'scripts', 'release.js');

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    passed++;
    process.stdout.write(`  [32m✓[0m ${name}\n`);
  } catch (e) {
    failed++;
    process.stdout.write(`  [31m✗[0m ${name}\n    [31m${e.message}[0m\n`);
  }
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg || 'Assertion failed');
}

/** Copie jetable du trio VERSION / CHANGELOG / release.js. */
function sandbox() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'forge-release-'));
  fs.mkdirSync(path.join(dir, 'scripts'));
  fs.copyFileSync(path.join(ROOT, 'VERSION'), path.join(dir, 'VERSION'));
  fs.copyFileSync(path.join(ROOT, 'CHANGELOG.md'), path.join(dir, 'CHANGELOG.md'));
  fs.copyFileSync(RELEASE, path.join(dir, 'scripts', 'release.js'));
  return dir;
}

function runIn(dir, ...args) {
  try {
    const stdout = execFileSync('node', [path.join(dir, 'scripts', 'release.js'), ...args], {
      encoding: 'utf-8', stdio: ['ignore', 'pipe', 'pipe']
    });
    return { code: 0, stdout };
  } catch (e) {
    return { code: e.status === undefined ? 1 : e.status, stdout: e.stdout || '', stderr: e.stderr || '' };
  }
}

process.stdout.write('\nrelease.js — test de fumée\n\n');

test('stdout de bump est du JSON avec from et to', () => {
  const dir = sandbox();
  try {
    const changelog = path.join(dir, 'CHANGELOG.md');
    const text = fs.readFileSync(changelog, 'utf-8');
    fs.writeFileSync(changelog, text.replace(
      '## [Unreleased]',
      '## [Unreleased]\n\n### fix(test) — entrée\n\nCorps.\n'
    ));

    const r = runIn(dir, 'bump', '--patch');
    assert(r.code === 0, `bump a échoué : ${r.stdout}${r.stderr}`);

    // C'est exactement ce que le workflow ne récupérait pas.
    let json;
    try { json = JSON.parse(r.stdout); }
    catch { throw new Error(`stdout n'est pas du JSON exploitable par GITHUB_OUTPUT : ${r.stdout.slice(0, 120)}`); }

    assert(typeof json.to === 'string' && /^\d+\.\d+\.\d+$/.test(json.to),
      `champ "to" absent ou non sémantique : ${JSON.stringify(json)}`);
    assert(typeof json.from === 'string' && json.from !== json.to,
      `champ "from" absent ou inchangé : ${JSON.stringify(json)}`);
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});

test('le bump écrit VERSION et le CHANGELOG de façon cohérente', () => {
  const dir = sandbox();
  try {
    const changelog = path.join(dir, 'CHANGELOG.md');
    fs.writeFileSync(changelog, fs.readFileSync(changelog, 'utf-8').replace(
      '## [Unreleased]',
      '## [Unreleased]\n\n### feat(test) — entrée\n\nCorps.\n'
    ));

    const before = fs.readFileSync(path.join(dir, 'VERSION'), 'utf-8').trim();
    const r = runIn(dir, 'bump', '--minor');
    assert(r.code === 0, `bump a échoué : ${r.stdout}`);
    const after = fs.readFileSync(path.join(dir, 'VERSION'), 'utf-8').trim();
    assert(after !== before, 'VERSION inchangé après bump');

    const text = fs.readFileSync(changelog, 'utf-8');
    assert(text.includes(`## [${after}]`), `section ${after} absente du CHANGELOG`);
    assert(/^## \[Unreleased\]\s*\n\s*\n## /m.test(text), 'la section [Unreleased] na pas été vidée');
    assert(runIn(dir, 'check').code === 0, 'check échoue après un bump');
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});

test('un bump sans entrée est refusé, et VERSION reste intact', () => {
  const dir = sandbox();
  try {
    // Le bac à sable hérite du CHANGELOG réel, qui peut contenir des entrées
    // non publiées. Ce test doit partir d'une section [Unreleased] VIDE, sinon
    // il ne teste pas ce qu'il croit tester.
    const changelog = path.join(dir, 'CHANGELOG.md');
    fs.writeFileSync(changelog, fs.readFileSync(changelog, 'utf-8')
      .replace(/^## \[Unreleased\][\s\S]*?(?=\n## )/m, '## [Unreleased]\n\n'));

    const before = fs.readFileSync(path.join(dir, 'VERSION'), 'utf-8').trim();
    const r = runIn(dir, 'bump', '--minor');
    assert(r.code !== 0, 'un bump sans entrée a été accepté');
    const after = fs.readFileSync(path.join(dir, 'VERSION'), 'utf-8').trim();
    assert(before === after, 'VERSION a été modifiée alors que le bump a échoué');
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});

test('notes renvoie le corps de la section demandée', () => {
  const dir = sandbox();
  try {
    const changelog = path.join(dir, 'CHANGELOG.md');
    fs.writeFileSync(changelog, fs.readFileSync(changelog, 'utf-8').replace(
      '## [Unreleased]',
      '## [Unreleased]\n\n### feat(test) — une entrée de test\n\nSon corps.\n'
    ));
    runIn(dir, 'bump', '--minor');
    const v = fs.readFileSync(path.join(dir, 'VERSION'), 'utf-8').trim();

    const r = runIn(dir, 'notes', v);
    assert(r.code === 0, `notes a échoué : ${r.stdout}${r.stderr}`);
    assert(r.stdout.includes('une entrée de test'),
      `notes ne contient pas l'entrée attendue : ${r.stdout.slice(0, 120)}`);
    assert(!r.stdout.includes('## ['),
      'notes ne doit pas répéter le titre de section');
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});

test('notes échoue sur une version absente, et nomme les versions présentes', () => {
  const dir = sandbox();
  try {
    const r = runIn(dir, 'notes', '9.9.9');
    assert(r.code !== 0, 'notes a accepté une version absente');
    let json; try { json = JSON.parse(r.stdout); } catch { throw new Error('stdout non JSON'); }
    assert(Array.isArray(json.available) && json.available.length > 0,
      `l'erreur ne liste pas les versions disponibles : ${r.stdout.slice(0, 120)}`);
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});

test('decide refuse de publier une section [Unreleased] vide, même forcée', () => {
  const dir = sandbox();
  try {
    fs.writeFileSync(path.join(dir, 'CHANGELOG.md'), fs.readFileSync(path.join(dir, 'CHANGELOG.md'), 'utf-8')
      .replace(/^## \[Unreleased\][\s\S]*?(?=\n## )/m, '## [Unreleased]\n\n'));

    for (const args of [['decide'], ['decide', '--force', 'major']]) {
      const r = runIn(dir, ...args);
      assert(r.code === 0, `decide ne devrait pas échouer : ${r.stdout}${r.stderr}`);
      const json = JSON.parse(r.stdout);
      assert(json.should_release === false,
        `un [Unreleased] vide ne doit jamais être publiable, même forcé (${args.join(' ')}) : ${r.stdout}`);
      assert(json.level === null, 'aucun niveau ne doit être proposé');
    }
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});

test('decide déduit le niveau des types d\'entrée', () => {
  const dir = sandbox();
  try {
    const changelog = path.join(dir, 'CHANGELOG.md');
    const withEntry = (type) => fs.writeFileSync(changelog,
      fs.readFileSync(path.join(ROOT, 'CHANGELOG.md'), 'utf-8')
        .replace(/^## \[Unreleased\][\s\S]*?(?=\n## )/m, '## [Unreleased]\n\n### ' + type + '(test) — une entrée\n\nCorps.\n\n'));

    for (const pair of [['fix', 'patch'], ['docs', 'patch'], ['feat', 'minor'], ['breaking', 'major']]) {
      withEntry(pair[0]);
      const r = runIn(dir, 'decide');
      const json = JSON.parse(r.stdout);
      assert(json.should_release === true, pair[0] + ' doit être publiable : ' + r.stdout);
      assert(json.level === pair[1], pair[0] + ' doit donner ' + pair[1] + ', obtenu ' + json.level);
    }
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});

test('le niveau forcé est un PLANCHER, pas un plafond', () => {
  // `CONTRIBUTING.md` l'annonce depuis le début ; le workflow court-circuitait
  // avant l'analyse et appliquait un plafond. Une demande de patch sur un
  // contenu de niveau feat publiait un patch.
  const dir = sandbox();
  try {
    const changelog = path.join(dir, 'CHANGELOG.md');
    fs.writeFileSync(changelog, fs.readFileSync(path.join(ROOT, 'CHANGELOG.md'), 'utf-8')
      .replace(/^## \[Unreleased\][\s\S]*?(?=\n## )/m, '## [Unreleased]\n\n### feat(test) — une entrée\n\nCorps.\n\n'));

    let r = runIn(dir, 'decide', '--force', 'patch');
    let json = JSON.parse(r.stdout);
    assert(json.level === 'minor',
      'un feat avec un plancher patch doit publier un minor, obtenu ' + json.level);
    assert(json.raised_by_force === false, 'le niveau ne doit pas être relevé si le plancher est plus bas');

    r = runIn(dir, 'decide', '--force', 'major');
    json = JSON.parse(r.stdout);
    assert(json.level === 'major', 'un plancher major doit relever le niveau, obtenu ' + json.level);
    assert(json.raised_by_force === true, 'le relèvement doit être visible');
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});

test('decide refuse un niveau inconnu', () => {
  const dir = sandbox();
  try {
    const r = runIn(dir, 'decide', '--force', 'geant');
    assert(r.code !== 0, 'un niveau inconnu doit être refusé');
    const json = JSON.parse(r.stdout);
    assert(Array.isArray(json.accepted), 'les niveaux acceptés doivent être listés : ' + r.stdout);
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});

test('check détecte une divergence VERSION ↔ CHANGELOG', () => {
  const dir = sandbox();
  try {
    fs.writeFileSync(path.join(dir, 'VERSION'), '9.9.9\n');
    const r = runIn(dir, 'check');
    assert(r.code !== 0, 'check n\'a pas détecté la divergence');
    let json; try { json = JSON.parse(r.stdout); } catch { throw new Error('stdout non JSON'); }
    assert(json.problems.some(p => /VERSION/.test(p)), `problème non explicite : ${JSON.stringify(json.problems)}`);
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});

process.stdout.write(`\n${failed === 0 ? `[32m✓ ${passed} tests passés[0m` : `[31m✗ ${failed} échec(s)[0m, ${passed} passés`}\n`);
process.exit(failed === 0 ? 0 : 1);
