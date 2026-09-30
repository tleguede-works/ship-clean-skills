#!/usr/bin/env node
'use strict';

/**
 * snapshot.js — construit l'archive d'une version publiée.
 *
 * ## Pourquoi cette archive existe
 *
 * Le skill n'est pas compilé : `npx skills add` lit le dépôt, et une release ne
 * produit donc aucun exécutable à joindre. Conséquence mesurée : les releases de
 * ce dépôt ne contenaient qu'un `notes.md` — le fichier de notes lui-même.
 * Impossible de retrouver la version publiée d'un skill : le tag ne dit rien du
 * contenu, et le dépôt a bougé depuis.
 *
 * Une release qui ne permet pas de retrouver ce qu'elle a publié n'est pas une
 * release : c'est un message. Donc chaque release porte un **snapshot complet**,
 * plus un manifeste qui rend l'archive vérifiable.
 *
 * ## Déterminisme
 *
 * Deux archives de la même version doivent être **octet pour octet identiques**.
 * Sans cela, on ne peut pas comparer une archive à son contenu décompressé, et
 * la vérification « l'archive reproduit-elle la version ? » n'a aucun sens.
 * D'où : ordre des entrées trié, mtimes figés, uid/gid nuls, aucun gzip -n.
 *
 * Commandes :
 *   snapshot.js build  [--version X.Y.Z] [--out dist/] [--json]
 *   snapshot.js verify <archive> [--against <racine>]
 *   snapshot.js list
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');
const zlib = require('zlib');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const VERSION_FILE = path.join(ROOT, 'VERSION');

/* ------------------------------------------------------------------ *
 * Ce qui entre dans le snapshot
 * ------------------------------------------------------------------ */

/**
 * Le snapshot est un **skill**, pas un dépôt de développement.
 *
 * `scripts/` est inclus parce que les scripts font partie du skill : un snapshot
 * sans eux ne peut ni s'exécuter, ni être vérifié. `test/` est exclu pour la
 * même raison que `.github/` : ce sont des outils de maintenance du dépôt, pas
 * du produit.
 *
 * Chaque entrée est un chemin *relatif à la racine*, donc l'archive se
 * désarchive n'importe où et se compare à un checkout avec `diff -r`.
 */
const INCLUDE = [
  'skills',
  'scripts',
  'README.md',
  'LICENSE',
  'VERSION',
  'CHANGELOG.md',
  'package.json'
];

const EXCLUDE_DIRS = new Set(['.git', 'node_modules', '.forge-labs', 'dist']);
const EXCLUDE_FILES = new Set(['.DS_Store', 'package-lock.json']);

/** Mtime figé : 2020-01-01T00:00:00Z. Une valeur fixe rend l'archive reproductible. */
const FIXED_MTIME = new Date('2020-01-01T00:00:00Z');

function currentVersion() {
  const v = (fs.existsSync(VERSION_FILE) ? fs.readFileSync(VERSION_FILE, 'utf-8') : '').trim();
  return v || '0.0.0';
}

function shouldSkip(relPath, isDir) {
  const parts = relPath.split(path.sep);
  if (parts.some(p => EXCLUDE_DIRS.has(p))) return true;
  if (!isDir && EXCLUDE_FILES.has(path.basename(relPath))) return true;
  return false;
}

/** Liste les fichiers à empaqueter, triée. */
function collectFiles() {
  const out = [];
  const walk = (absDir, relDir) => {
    let entries;
    try {
      entries = fs.readdirSync(absDir, { withFileTypes: true });
    } catch {
      return;
    }
    entries.sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
    for (const e of entries) {
      const rel = relDir ? path.join(relDir, e.name) : e.name;
      const abs = path.join(ROOT, rel);
      if (e.isSymbolicLink()) continue;
      if (shouldSkip(rel, e.isDirectory())) continue;
      if (e.isDirectory()) walk(abs, rel);
      else if (e.isFile()) out.push(rel.split(path.sep).join('/'));
    }
  };
  for (const entry of INCLUDE) {
    const abs = path.join(ROOT, entry);
    if (!fs.existsSync(abs)) continue;
    // Le préfixe est l'entrée elle-même : sans lui, `scripts/release.js`
    // devenait `release.js` dans l'archive, et la comparaison à un checkout
    // échouait sur chaque fichier.
    if (fs.statSync(abs).isDirectory()) walk(abs, entry);
    else out.push(entry);
  }
  return [...new Set(out)].sort();
}

/* ------------------------------------------------------------------ *
 * Écriture tar + gzip déterministes
 * ------------------------------------------------------------------ */

/** En-tête tar ustar sur 512 octets. */
function tarHeader(name, size, mode) {
  const buf = Buffer.alloc(512);
  const write = (str, off, len) => buf.write(String(str).slice(0, len - 1), off, len - 1, 'ascii');
  write(name, 0, 100);
  write(mode.toString(8).padStart(7, '0'), 100, 8);
  write('0000000', 108, 8);              // uid — figé
  write('0000000', 116, 8);              // gid — figé
  write(size.toString(8).padStart(11, '0'), 124, 12);
  write(Math.floor(FIXED_MTIME.getTime() / 1000).toString(8).padStart(11, '0'), 136, 12);
  buf.write('        ', 148, 8, 'ascii'); // checksum, spaces
  buf.write('0', 156, 1, 'ascii');        // typeflag: fichier
  buf.write('ustar\0', 257, 6, 'ascii');
  buf.write('00', 263, 2, 'ascii');
  let sum = 0;
  for (const b of buf) sum += b;
  buf.write(sum.toString(8).padStart(6, '0') + '\0 ', 148, 8, 'ascii');
  return buf;
}

function buildTar(files) {
  const chunks = [];
  for (const rel of files) {
    const abs = path.join(ROOT, rel);
    const content = fs.readFileSync(abs);
    // 0644, et 0755 pour ce qui est exécutable : le mode fait partie de
    // l'archive, donc il doit être stable.
    const mode = (fs.statSync(abs).mode & 0o111) ? 0o755 : 0o644;
    chunks.push(tarHeader(rel, content.length, mode));
    chunks.push(content);
    const pad = (512 - (content.length % 512)) % 512;
    if (pad) chunks.push(Buffer.alloc(pad));
  }
  chunks.push(Buffer.alloc(1024)); // deux blocs nuls = fin d'archive
  return Buffer.concat(chunks);
}

/** gzip sans nom de fichier ni mtime : deux appels donnent le même octet. */
function gzipDeterministic(buf) {
  return zlib.gzipSync(buf, { level: 9 });
}

/* ------------------------------------------------------------------ *
 * Manifeste
 * ------------------------------------------------------------------ */

function gitCommit() {
  try {
    return execFileSync('git', ['rev-parse', 'HEAD'], { cwd: ROOT, encoding: 'utf-8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
  } catch {
    return null;
  }
}

/**
 * `MANIFEST.json` est le premier membre de l'archive.
 *
 * Il porte le SHA-256 de chaque fichier. C'est ce qui rend l'archive
 * *vérifiable* : on peut contrôler l'intégrité sans le dépôt, et surtout
 * comparer deux archives pour savoir si deux versions portent le même contenu.
 */
function buildManifest(files, version, archiveName) {
  const entries = files.map(rel => {
    const abs = path.join(ROOT, rel);
    const buf = fs.readFileSync(abs);
    return {
      path: rel,
      sha256: crypto.createHash('sha256').update(buf).digest('hex'),
      bytes: buf.length
    };
  });
  return {
    schema: 'ship-clean-skills/snapshot@1',
    product: 'ship-clean-skills',
    version,
    archive: archiveName,
    commit: gitCommit(),
    built_at_source: 'git HEAD, contenu du répertoire de travail',
    file_count: entries.length,
    total_bytes: entries.reduce((n, e) => n + e.bytes, 0),
    note: 'Le skill n\'est pas compilé : cette archive EST le produit publié. ' +
          'Extraire, puis comparer chaque fichier à son sha256.',
    files: entries
  };
}

/* ------------------------------------------------------------------ *
 * Commandes
 * ------------------------------------------------------------------ */

function cmdBuild(argv) {
  const version = (argv.includes('--version') ? argv[argv.indexOf('--version') + 1] : null) || currentVersion();
  const outDir = (argv.includes('--out') ? argv[argv.indexOf('--out') + 1] : null) || path.join(ROOT, 'dist');
  const name = `ship-clean-skills-v${version}.tar.gz`;
  const outPath = path.join(outDir, name);

  const files = collectFiles();
  if (!files.length) {
    process.stdout.write(JSON.stringify({ error: 'no_files', include: INCLUDE }, null, 2) + '\n');
    process.exit(1);
  }

  fs.mkdirSync(outDir, { recursive: true });
  const manifest = buildManifest(files, version, name);
  const manifestBuf = Buffer.from(JSON.stringify(manifest, null, 2) + '\n', 'utf-8');

  const tarParts = [];
  tarParts.push(tarHeader('MANIFEST.json', manifestBuf.length, 0o644), manifestBuf);
  const pad = (512 - (manifestBuf.length % 512)) % 512;
  if (pad) tarParts.push(Buffer.alloc(pad));
  tarParts.push(buildTar(files));

  const gz = gzipDeterministic(Buffer.concat(tarParts));
  fs.writeFileSync(outPath, gz);

  // Le digest du contenu, pas celui du conteneur : il ne dépend pas du niveau de
  // compression, seulement des fichiers.
  const contentDigest = crypto.createHash('sha256')
    .update(files.map(f => f + ':' + manifest.files.find(m => m.path === f).sha256).join('\n'))
    .digest('hex');

  const result = {
    command: 'build',
    version,
    archive: outPath,
    bytes: gz.length,
    files: files.length,
    total_bytes: manifest.total_bytes,
    content_sha256: contentDigest,
    manifest_first_entry: true
  };
  if (argv.includes('--json')) process.stdout.write(JSON.stringify(result, null, 2) + '\n');
  else {
    process.stdout.write(`archive   ${outPath}\n`);
    process.stdout.write(`version   ${version}\n`);
    process.stdout.write(`fichiers  ${files.length}\n`);
    process.stdout.write(`octets    ${gz.length}\n`);
    process.stdout.write(`contenu   sha256:${contentDigest.slice(0, 16)}\n`);
  }
}

/** Extrait une archive dans un répertoire temporaire. */
function extract(archivePath, dest) {
  fs.mkdirSync(dest, { recursive: true });
  const tar = execFileSync('tar', ['-xzf', archivePath, '-C', dest], { stdio: ['ignore', 'pipe', 'pipe'] });
  return tar;
}

/**
 * Vérifie qu'une archive reproduit bien une version.
 *
 * Trois contrôles, du plus faible au plus fort :
 *   1. l'archive s'extrait et contient un `MANIFEST.json` ;
 *   2. chaque fichier extrait correspond à son SHA-256 du manifeste ;
 *   3. (optionnel) le contenu extrait est identique au répertoire de référence.
 *
 * Le contrôle 3 est celui qui répond à la question posée par la release :
 * « est-ce que cette archive reproduit la version publiée ? ». Le contrôle 2
 * seul dirait que l'archive est cohérente avec elle-même.
 */
function cmdVerify(archiveArg, againstArg) {
  const archivePath = path.resolve(archiveArg);
  if (!fs.existsSync(archivePath)) {
    process.stdout.write(JSON.stringify({ error: 'archive_not_found', archive: archivePath }, null, 2) + '\n');
    process.exit(1);
  }

  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'forge-snapshot-'));
  const problems = [];
  let result;
  try {
    extract(archivePath, tmp);

    const manifestPath = path.join(tmp, 'MANIFEST.json');
    if (!fs.existsSync(manifestPath)) {
      problems.push({ problem: 'no_manifest', why: "l'archive ne contient pas MANIFEST.json à sa racine" });
    } else {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));

      // 2. Intégrité interne
      for (const entry of manifest.files) {
        const abs = path.join(tmp, entry.path);
        if (!fs.existsSync(abs)) {
          problems.push({ problem: 'missing_in_archive', path: entry.path });
          continue;
        }
        const actual = crypto.createHash('sha256').update(fs.readFileSync(abs)).digest('hex');
        if (actual !== entry.sha256) {
          problems.push({ problem: 'digest_mismatch', path: entry.path, expected: entry.sha256, actual });
        }
      }
      const onDisk = [];
      const walk = (d, rel) => {
        for (const e of fs.readdirSync(d, { withFileTypes: true })) {
          const r = rel ? path.join(rel, e.name) : e.name;
          if (e.isDirectory()) walk(path.join(d, e.name), r);
          else if (r !== 'MANIFEST.json') onDisk.push(r.split(path.sep).join('/'));
        }
      };
      walk(tmp, '');
      const declared = new Set(manifest.files.map(f => f.path));
      for (const f of onDisk) if (!declared.has(f)) problems.push({ problem: 'undeclared_in_archive', path: f });

      // 3. Reproduction de la version
      let comparison = null;
      if (againstArg) {
        const ref = path.resolve(againstArg);
        const diffs = [];
        for (const entry of manifest.files) {
          const refAbs = path.join(ref, entry.path);
          if (!fs.existsSync(refAbs)) { diffs.push({ path: entry.path, problem: 'absent_du_referentiel' }); continue; }
          const actual = crypto.createHash('sha256').update(fs.readFileSync(refAbs)).digest('hex');
          if (actual !== entry.sha256) diffs.push({ path: entry.path, problem: 'differe', expected: entry.sha256, actual });
        }

        // La VERSION elle-même.
        //
        // Sans ce contrôle, une archive construite avec `--version 9.9.9` passe
        // la vérification contre un checkout en 1.1.9 : seul MANIFEST.json
        // diffère, et MANIFEST.json n'est pas dans la liste des fichiers
        // comparés. L'archive aurait donc été jugée fidèle alors qu'elle annonce
        // une version fausse — le défaut exact qu'un manifeste est censé attraper.
        const refVersionFile = path.join(ref, 'VERSION');
        const refVersion = fs.existsSync(refVersionFile)
          ? fs.readFileSync(refVersionFile, 'utf-8').trim()
          : null;
        if (refVersion !== null && refVersion !== manifest.version) {
          diffs.push({
            path: 'VERSION',
            problem: 'version_differente',
            expected: refVersion,
            actual: manifest.version,
            why: 'l\'archive annonce une version que le checkout ne porte pas'
          });
        }

        comparison = {
          reference: ref,
          files_compared: manifest.files.length,
          version_declared: manifest.version,
          version_in_reference: refVersion,
          differences: diffs.length,
          diffs: diffs.slice(0, 20)
        };
        if (diffs.length) problems.push({ problem: 'reference_mismatch', differences: diffs.length });
      }

      result = {
        command: 'verify',
        archive: archivePath,
        version: manifest.version,
        commit: manifest.commit,
        files: manifest.file_count,
        manifest_ok: true,
        compared_to_reference: !!againstArg,
        comparison,
        pass: problems.length === 0
      };
    }

    if (!result) {
      result = { command: 'verify', archive: archivePath, manifest_ok: false, problems, pass: false };
    } else if (problems.length) {
      result.problems = problems;
      result.pass = false;
    }
  } catch (e) {
    result = { command: 'verify', archive: archivePath, pass: false, problems: [{ problem: 'extract_failed', detail: e.message }] };
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }

  process.stdout.write(JSON.stringify(result, null, 2) + '\n');
  if (!result.pass) process.exit(1);
}

function cmdList(argv) {
  const dir = (argv.includes('--out') ? argv[argv.indexOf('--out') + 1] : null) || path.join(ROOT, 'dist');
  const out = [];
  for (const rel of INCLUDE) {
    const abs = path.join(ROOT, rel);
    if (!fs.existsSync(abs)) continue;
    if (fs.statSync(abs).isDirectory()) {
      const files = collectFiles().filter(f => f.startsWith(rel + '/'));
      out.push({ entry: rel, type: 'dir', files: files.length });
    } else out.push({ entry: rel, type: 'file', bytes: fs.statSync(abs).size });
  }
  process.stdout.write(JSON.stringify({ command: 'list', include: INCLUDE, entries: out }, null, 2) + '\n');
}

/* ------------------------------------------------------------------ */

const [cmd, ...rest] = process.argv.slice(2);
switch (cmd) {
  case 'build':
    cmdBuild(rest);
    break;
  case 'verify': {
    // `--against` absent → aucune comparaison. Sans ce test, `rest[0]` (l'archive
    // elle-même) devenait la référence, et `verify <archive>` comparait l'archive
    // à elle-même : un diagnostic qui accuse l'archive d'être fausse parce qu'elle
    // ne se compare pas à elle-même.
    const ai = rest.indexOf('--against');
    cmdVerify(rest[0], ai !== -1 ? rest[ai + 1] : null);
    break;
  }
  case 'list':
    cmdList(rest);
    break;
  default:
    process.stdout.write(JSON.stringify({
      usage: {
        'snapshot.js build [--version X.Y.Z] [--out dist/] [--json]': 'construit l\'archive de la version',
        'snapshot.js verify <archive> [--against <racine>]': 'vérifie l\'archive, et optionnellement sa reproduction d\'un checkout',
        'snapshot.js list': 'ce qui entre dans le snapshot'
      },
      include: INCLUDE,
      exclude: [...EXCLUDE_DIRS, ...EXCLUDE_FILES]
    }, null, 2) + '\n');
}