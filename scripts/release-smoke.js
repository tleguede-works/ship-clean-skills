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

/**
 * Un bac à sable qui est aussi un dépôt git, avec les tags demandés.
 *
 * Il faut **un commit** avant de pouvoir tagger : `git tag v1.0` sur un dépôt
 * sans HEAD échoue en `Failed to resolve 'HEAD' as a valid ref`, et l'échec est
 * silencieux si on avale l'erreur. Le dépôt ressortait donc sans le tag, le
 * contrôle paraissait inopérant, et le test **passait au vert en n'ayant rien
 * vérifié** — dans le dépôt réel, alors qu'il échouait dans l'archive extraite.
 * Le même motif une fois de plus : un bac à sable qui n'a pas ce qu'il croit avoir.
 *
 * `gitSandbox` **lève** si le tag demandé n'est pas celui qui est listé ensuite.
 */
function gitSandbox(tags = []) {
  const dir = sandbox();
  const git = (...args) => {
    execFileSync('git', args, { cwd: dir, encoding: 'utf-8', stdio: ['ignore', 'pipe', 'ignore'] });
  };
  git('init', '-q');
  git('config', 'user.email', 'test@example.invalid');
  git('config', 'user.name', 'test');
  git('commit', '-q', '--allow-empty', '-m', 'racine');
  for (const t of tags) git('tag', t);
  const listed = execFileSync('git', ['tag', '--list'], { cwd: dir, encoding: 'utf-8' })
    .split('\n').map(s => s.trim()).filter(Boolean);
  const missing = tags.filter(t => !listed.includes(t));
  if (missing.length) {
    throw new Error(`le bac à sable n'a pas les tags demandés : ${missing.join(', ')} (obtenus : ${listed.join(', ') || 'aucun'})`);
  }
  return dir;
}

/**
 * Lance `release.js` du bac à sable **depuis un autre répertoire**.
 *
 * Le CWD est délibérément **ailleurs** que le bac. C'est ainsi qu'est né le
 * défaut que ce fichier teste : `release.js` résolvait ses chemins depuis
 * `__dirname` mais interrogeait `git` depuis le CWD. Dans le dépôt, les deux
 * désignaient le même dépôt et le test passait ; dans l'archive extraite, le CWD
 * n'était pas le dépôt du bac et la protection ne s'exerçait pas.
 *
 * Un test qui lance le script depuis le bac **peut** passer alors que le script est
 * faux. Il faut donc que la suite lance depuis ailleurs, comme le fait le bot.
 */
function runIn(dir, ...args) {
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'forge-cwd-'));
  try {
    const stdout = execFileSync('node', [path.join(dir, 'scripts', 'release.js'), ...args], {
      encoding: 'utf-8', stdio: ['ignore', 'pipe', 'pipe'], cwd
    });
    return { code: 0, stdout };
  } catch (e) {
    return { code: e.status === undefined ? 1 : e.status, stdout: e.stdout || '', stderr: e.stderr || '' };
  } finally {
    fs.rmSync(cwd, { recursive: true, force: true });
  }
}

process.stdout.write('\nrelease.js — test de fumée\n\n');

test('le bac à sable git porte RÉELLEMENT ses tags', () => {
  // Le test ci-dessous ne prouve rien si le bac à sable n'a pas les tags qu'il
  // croit avoir. Cette fois le défaut est venu du **bac**, pas du script : sans
  // commit initial, `git tag` échoue et l'échec était avalé. Le test passait donc
  // au vert en n'ayant jamais exercé le contrôle — et il échouait dans l'archive
  // extraite, où le dépôt parent diffère. Un témoin avant le test.
  const dir = gitSandbox(['v1.6.0', 'v1.8.0']);
  try {
    const listed = execFileSync('git', ['tag', '--list'], { cwd: dir, encoding: 'utf-8' })
      .split('\n').map(s => s.trim()).filter(Boolean);
    assert(listed.indexOf('v1.8.0') !== -1, `le tag doit exister : ${listed.join(', ')}`);
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});

test('bump REFUSE d\'écraser une version dont le tag existe déjà', () => {
  // Le défaut qu'aucun test ne voyait. Une branche coupée **avant** le
  // `chore(release)` du bot, puis un `bump` local : le titre écrit remplace
  // `## [1.8.0]` dans le CHANGELOG reconstruit, et **une release publiée
  // disparaît sans erreur**. `check` ne le voit pas — il compare VERSION à la
  // dernière section, et une section disparue ne se signale pas d'elle-même.
  // Le tag, lui, existe toujours.
  const dir = gitSandbox(['v1.6.0', 'v1.7.0', 'v1.8.0']);
  try {
    fs.writeFileSync(path.join(dir, 'VERSION'), '1.7.0\n');
    fs.writeFileSync(path.join(dir, 'CHANGELOG.md'), [
      '# Changelog', '', '## [Unreleased]', '',
      '### fix(a) — une entrée', '', 'Corps de l\'entrée.', '',
      '## [1.6.0] - 2026-01-01', '',
      '### fix(b) — une entrée ancienne', '', 'Corps.'
    ].join('\n'));

    const r = runIn(dir, 'bump', '--minor');
    assert(r.code !== 0, `promouvoir une version déjà publiée doit échouer : ${r.stdout}`);

    let json;
    try { json = JSON.parse(r.stdout); }
    catch { throw new Error(`le refus doit être du JSON exploitable : ${r.stdout.slice(0, 160)}`); }
    assert(json.error === 'version_deja_publiee', `motif attendu : ${JSON.stringify(json)}`);
    assert(json.version === '1.8.0', `la version en cause doit être nommée : ${JSON.stringify(json)}`);

    // Et surtout : rien n'a été écrit.
    const after = fs.readFileSync(path.join(dir, 'CHANGELOG.md'), 'utf-8');
    assert(/## \[1\.6\.0\]/.test(after), 'la section existante doit rester');
    assert(!/## \[1\.8\.0\]/.test(after), 'aucune section ne doit être écrite après un refus');
    assert(/^1\.7\.0$/m.test(fs.readFileSync(path.join(dir, 'VERSION'), 'utf-8')),
      'VERSION doit rester intact après un refus');
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});

test('bump REFUSE une promotion en arrière', () => {
  // Même geste, autre signature : un CHANGELOG plus récent que VERSION. C'est la
  // trace d'un merge qui a perdu un `chore(release)`, et l'écrire aggraverait la
  // perte en réécrivant au-dessus d'une version plus haute.
  const dir = gitSandbox(['v1.9.0']);
  try {
    fs.writeFileSync(path.join(dir, 'VERSION'), '1.5.0\n');
    fs.writeFileSync(path.join(dir, 'CHANGELOG.md'), [
      '# Changelog', '', '## [Unreleased]', '',
      '### fix(a) — une entrée', '', 'Corps.', '',
      '## [1.9.0] - 2026-01-01', '',
      '### fix(b) — une entrée', '', 'Corps.'
    ].join('\n'));

    const r = runIn(dir, 'bump', '--patch');
    assert(r.code !== 0, `une promotion en arrière doit échouer : ${r.stdout}`);
    const json = JSON.parse(r.stdout);
    assert(json.error === 'promotion_en_arriere', `motif attendu : ${JSON.stringify(json)}`);
    assert(json.derniere_version_au_changelog === '1.9.0',
      `la version du CHANGELOG doit être nommée : ${JSON.stringify(json)}`);
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});

test('bump proceed hors d\'un dépôt git, et le dit', () => {
  // Le bac à sable ordinaire n'est pas un dépôt : la protection par tag n'est pas
  // disponible, et il faut que le chemin reste praticable plutôt que de casser.
  const dir = sandbox();
  try {
    const changelog = path.join(dir, 'CHANGELOG.md');
    fs.writeFileSync(changelog, fs.readFileSync(changelog, 'utf-8').replace(
      '## [Unreleased]', '## [Unreleased]\n\n### fix(test) — entrée\n\nCorps.\n'));
    const r = runIn(dir, 'bump', '--patch');
    assert(r.code === 0, `hors git, bump doit rester utilisable : ${r.stdout}${r.stderr}`);
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});

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
