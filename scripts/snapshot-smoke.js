#!/usr/bin/env node
'use strict';

/**
 * snapshot-smoke.js — exécute snapshot.js pour de vrai, et vérifie que
 * l'archive produite reproduit bien la version.
 *
 * ## Pourquoi ce test existe
 *
 * Les releases de ce dépôt ne contenaient qu'un `notes.md` : le fichier de notes
 * lui-même. Le skill n'étant pas compilé, il n'y avait rien d'autre à attacher —
 * et une release sans archive ne permet pas de retrouver la version publiée.
 *
 * Un workflow qui publie une archive peut échouer de deux façons : produire une
 * archive vide, ou produire une archive **fausse** — qui prétend reproduire la
 * version et ne le fait pas. La seconde est bien plus grave : elle installe une
 * confiance qui n'a pas lieu d'être, et le Manifest ne sert à rien s'il est
 * vérifié contre lui-même.
 *
 * Ce test fait donc trois choses, dont deux **négatives** :
 *   1. construit l'archive et vérifie qu'elle reproduit le checkout ;
 *   2. construit deux fois et exige des octets identiques (reproductibilité) ;
 *   3. altère l'archive et exige que la vérification ÉCHOUE.
 *
 * Le point 3 est celui qui compte. Un contrôle qui ne peut pas échouer ne
 * prouve rien : ici, on fabrique une dérive et on vérifie qu'elle est vue.
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const SNAPSHOT = path.join(ROOT, 'scripts', 'snapshot.js');

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    passed++;
    process.stdout.write(`  \x1b[32m✓\x1b[0m ${name}\n`);
  } catch (e) {
    failed++;
    process.stdout.write(`  \x1b[31m✗\x1b[0m ${name}\n    \x1b[31m${e.message}\x1b[0m\n`);
  }
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg || 'Assertion failed');
}

function run(args) {
  try {
    const stdout = execFileSync('node', [SNAPSHOT, ...args], {
      encoding: 'utf-8', stdio: ['ignore', 'pipe', 'pipe']
    });
    return { code: 0, stdout };
  } catch (e) {
    return {
      code: e.status === undefined ? 1 : e.status,
      stdout: e.stdout || '',
      stderr: e.stderr || ''
    };
  }
}

function json(res) {
  try { return JSON.parse(res.stdout); } catch { return null; }
}

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'forge-snapshot-smoke-'));
process.on('exit', () => { try { fs.rmSync(tmp, { recursive: true, force: true }); } catch {} });

process.stdout.write('\nsnapshot.js — test de fumée\n\n');

const build = run(['build', '--out', tmp, '--json']);
const built = json(build);

/* ------------------------------------------------------------------ *
 * 1. L'archive se construit
 * ------------------------------------------------------------------ */

test('build produit une archive et un manifeste exploitable', () => {
  assert(build.code === 0, `build a échoué : ${build.stdout}${build.stderr}`);
  assert(built, `stdout n'est pas du JSON : ${build.stdout.slice(0, 200)}`);
  assert(built.archive && fs.existsSync(built.archive), 'archive absente : ' + built.archive);
  assert(built.files > 0, 'archive vide');
  // Le skill doit être dedans : c'est le produit.
  assert(built.files >= 60, `trop peu de fichiers (${built.files}) : le skill ne serait pas inclus`);
});

test('l\'archive contient le skill et son point d\'entrée', () => {
  const v = run(['verify', built.archive]);
  const r = json(v);
  assert(r && r.pass === true, `verify a échoué : ${v.stdout}${v.stderr}`);
  assert(r.manifest_ok === true, 'MANIFEST.json absent ou illisible');
  assert(r.version === built.version, `version du manifeste : ${r.version}, attendu ${built.version}`);
});

/* ------------------------------------------------------------------ *
 * 2. L'archive REPRODUIT la version
 * ------------------------------------------------------------------ */

test('l\'archive reproduit exactement le checkout', () => {
  // C'est LA question de la release : est-ce que cette archive est la version
  // publiée ? Si ce contrôle est faux, tout le reste est décoratif.
  const v = run(['verify', built.archive, '--against', ROOT]);
  const r = json(v);
  assert(v.code === 0, `verify --against a échoué : ${v.stdout}${v.stderr}`);
  assert(r.pass === true, 'verify --against doit passer sur une archive fraîche');
  assert(r.compared_to_reference === true, 'la comparaison au checkout n\'a pas eu lieu');
  assert(r.comparison.differences === 0,
    `${r.comparison.differences} fichier(s) diffèrent du checkout : ${JSON.stringify(r.comparison.diffs)}`);
  assert(r.comparison.files_compared === built.files, 'tous les fichiers doivent être comparés');
});

/* ------------------------------------------------------------------ *
 * 3. Reproductibilité
 * ------------------------------------------------------------------ */

test('deux constructions de la même version sont identiques octet pour octet', () => {
  // Sans déterminisme, « l'archive reproduit la version » n'a aucun sens :
  // on ne peut pas comparer une archive à son contenu si elle change à chaque
  // exécution pour une raison qui n'a rien à voir avec le contenu.
  const dir = path.join(tmp, 'repro');
  fs.mkdirSync(dir, { recursive: true });
  const a = json(run(['build', '--out', dir, '--json']));
  const b = json(run(['build', '--out', path.join(tmp, 'repro2'), '--json']));
  const bufA = fs.readFileSync(a.archive);
  const bufB = fs.readFileSync(b.archive);
  assert(bufA.equals(bufB),
    `deux archives de ${a.version} diffèrent (${bufA.length} vs ${bufB.length} octets) : la construction n'est pas déterministe`);
  assert(a.content_sha256 === b.content_sha256, 'les empreintes de contenu diffèrent');
});

/* ------------------------------------------------------------------ *
 * 4. Négatifs — le contrôle doit savoir ÉCHOUER
 * ------------------------------------------------------------------ */

test('verify détecte un fichier altéré dans l\'archive', () => {
  const dir = path.join(tmp, 'tampered');
  fs.mkdirSync(dir, { recursive: true });
  const ext = path.join(dir, 'x');
  fs.mkdirSync(ext, { recursive: true });
  execFileSync('tar', ['-xzf', built.archive, '-C', ext], { stdio: 'pipe' });

  // On modifie un fichier du skill sans toucher au manifeste.
  const target = path.join(ext, 'skills', 'forge', 'SKILL.md');
  fs.writeFileSync(target, fs.readFileSync(target, 'utf-8') + '\n<!-- altéré -->\n');

  const repacked = path.join(dir, 'tampered.tar.gz');
  execFileSync('tar', ['-czf', repacked, '-C', ext, '.'], { stdio: 'pipe' });

  const v = run(['verify', repacked]);
  const r = json(v);
  assert(v.code !== 0, 'une archive altérée doit être refusée');
  assert(r.pass === false, 'verify doit rendre pass: false sur une archive altérée');
  const mismatch = (r.problems || []).find(p => p.problem === 'digest_mismatch');
  assert(mismatch, `le fichier altéré doit être nommé : ${v.stdout.slice(0, 300)}`);
  assert(/SKILL\.md/.test(mismatch.path), `le mauvais fichier est nommé : ${mismatch.path}`);
});

test('verify détecte une archive qui ne correspond pas au checkout de référence', () => {
  // Deux contrôles distincts : une archive peut être cohérente avec son propre
  // manifeste tout en ne reproduisant PAS la version. C'est exactement le cas
  // qu'un manifeste auto-vérifié ne voit pas.
  const dir = path.join(tmp, 'mismatch');
  fs.mkdirSync(dir, { recursive: true });
  const other = json(run(['build', '--out', dir, '--version', '9.9.9', '--json']));
  const v = run(['verify', other.archive, '--against', ROOT]);
  const r = json(v);
  assert(v.code !== 0, 'une archive d\'une autre version doit échouer contre ce checkout');
  assert(r.pass === false, 'verify --against doit rendre pass: false');
  assert((r.comparison.differences || 0) > 0, 'les différences doivent être comptées');
});

test('verify échoue sur une archive qui n\'est pas une archive', () => {
  const junk = path.join(tmp, 'junk.tar.gz');
  fs.writeFileSync(junk, 'ceci n\'est pas une archive');
  const v = run(['verify', junk]);
  assert(v.code !== 0, 'une archive illisible doit être refusée');
  const r = json(v);
  assert(r.pass === false, 'verify doit rendre pass: false');
});

test('verify refuse une archive sans MANIFEST.json', () => {
  const dir = path.join(tmp, 'nomanifest');
  fs.mkdirSync(path.join(dir, 'src'), { recursive: true });
  fs.writeFileSync(path.join(dir, 'src', 'lisezmoi.txt'), 'rien à voir');
  const archive = path.join(dir, 'nomanifest.tar.gz');
  execFileSync('tar', ['-czf', archive, '-C', path.join(dir, 'src'), '.'], { stdio: 'pipe' });
  const v = run(['verify', archive]);
  assert(v.code !== 0, 'une archive sans manifeste doit être refusée');
  const r = json(v);
  assert(r.manifest_ok === false, 'le contrôle doit signaler l\'absence de manifeste');
  assert((r.problems || []).some(p => p.problem === 'no_manifest'), 'la raison doit être nommée');
});

/* ------------------------------------------------------------------ *
 * 5. Le périmètre du snapshot
 * ------------------------------------------------------------------ */

test('le snapshot exclut ce qui ne fait pas partie du produit', () => {
  const dir = path.join(tmp, 'perimetre');
  fs.mkdirSync(dir, { recursive: true });
  // Un fichier de dépôt sans rapport ne doit pas entrer dans l'archive.
  const junk = path.join(ROOT, 'snapshot-smoke-junk.tmp');
  fs.writeFileSync(junk, 'ne pas embarquer\n');
  try {
    const a = json(run(['build', '--out', dir, '--json']));
    const listing = execFileSync('tar', ['-tzf', a.archive], { encoding: 'utf-8' });
    assert(!listing.includes('snapshot-smoke-junk.tmp'), 'un fichier parasite est entré dans l\'archive');
    assert(!listing.includes('node_modules'), 'node_modules ne doit pas être embarqué');
    assert(!listing.includes('Forge%20Labs') && !listing.includes('Forge Labs/'),
      'le dépôt de test ne doit pas être embarqué');
  } finally {
    fs.unlinkSync(junk);
  }
});

test('le snapshot inclut ce qui rend le skill utilisable hors du dépôt', () => {
  const listing = execFileSync('tar', ['-tzf', built.archive], { encoding: 'utf-8' });
  const required = [
    'MANIFEST.json',
    'skills/forge/SKILL.md',
    'skills/forge/scripts/state.js',
    'skills/forge/scripts/lib/forge-lib.js',
    'skills/forge/references/fast-track.md',
    'skills/forge/templates/screen.md.tmpl',
    'scripts/release.js',
    'scripts/snapshot.js',
    'README.md',
    'LICENSE',
    'VERSION',
    'CHANGELOG.md'
  ];
  for (const f of required) {
    assert(listing.includes(f), `${f} absent de l'archive — le skill ne serait pas utilisable hors du dépôt`);
  }
});

test('MANIFEST.json est le PREMIER membre de l\'archive', () => {
  // Un manifeste accessible seulement après avoir tout extrait ne sert à rien
  // quand on veut décider avant d'extraire 90 fichiers.
  const listing = execFileSync('tar', ['-tzf', built.archive], { encoding: 'utf-8' })
    .split('\n').map(l => l.trim()).filter(Boolean);
  assert(listing[0] === 'MANIFEST.json', `premier membre : ${listing[0]}`);
});

process.stdout.write(`\n${failed === 0 ? `\x1b[32m✓ ${passed} tests passés\x1b[0m` : `\x1b[31m✗ ${failed} échec(s)\x1b[0m, ${passed} passés`}\n`);
process.exit(failed === 0 ? 0 : 1);