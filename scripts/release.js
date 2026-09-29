#!/usr/bin/env node
'use strict';

/**
 * release.js — versionnage et publication.
 *
 * Le dépôt contient deux skills fortement couplés : Forge référence
 * project-rules-architect dans sa frontière, et l'inverse. Les versionner
 * séparément permettrait à cette frontière de dériver en silence — exactement la
 * panne que la CI existe pour attraper. Donc : **un version pour le dépôt**,
 * et le CHANGELOG dit quel skill a bougé.
 *
 * Commandes :
 *   release.js bump   --major|--minor|--patch   écrit VERSION + met à jour CHANGELOG
 *   release.js current                            affiche la version courante
 *   release.js check                               CHANGELOG cohérent, VERSION correct
 *
 * Zéro dépendance. Le calcul de version est fait ici, pas par une action tierce :
 * une action de release qui tombe en panne silencieusement est pire qu'un script
 * qu'on lit.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const VERSION_FILE = path.join(ROOT, 'VERSION');
const CHANGELOG = path.join(ROOT, 'CHANGELOG.md');

function read(p, fallback = null) {
  return fs.existsSync(p) ? fs.readFileSync(p, 'utf-8') : fallback;
}

function currentVersion() {
  const v = (read(VERSION_FILE, '0.0.0\n') || '').trim();
  return v || '0.0.0';
}

function parse(v) {
  const m = String(v).match(/^(\d+)\.(\d+)\.(\d+)$/);
  if (!m) throw new Error(`VERSION illisible : « ${v} » — attendu X.Y.Z`);
  return { major: +m[1], minor: +m[2], patch: +m[3] };
}

function bump(v, kind) {
  const p = parse(v);
  if (kind === 'major') return `${p.major + 1}.0.0`;
  if (kind === 'minor') return `${p.major}.${p.minor + 1}.0`;
  return `${p.major}.${p.minor}.${p.patch + 1}`;
}

/* ------------------------------------------------------------------ *
 * CHANGELOG
 * ------------------------------------------------------------------ */

const SECTION_RE = /^## \[(Unreleased|[0-9]+\.[0-9]+\.[0-9]+)\](?: - (.*))?$/;

/**
 * Analyse le CHANGELOG. Une entrée est un bloc sous un `## [x.y.z]`, et son
 * corps doit commencer par une ligne de la forme :
 *   `### <type>(<scope>) — <résumé>`
 * où <type> ∈ breaking | feat | fix | docs | chore | test | perf
 *
 * Une section `[Unreleased]` sans entrée est traitée comme VIDE, jamais comme
 * valide : c'est ce qui empêche une release vide.
 */
function parseChangelog(text) {
  const lines = (text || '').split('\n');
  const sections = [];
  let current = null;

  for (const line of lines) {
    const m = line.match(SECTION_RE);
    if (m) {
      current = { version: m[1], date: m[2] || null, body: [], entries: [] };
      sections.push(current);
      continue;
    }
    if (!current) continue;
    current.body.push(line);

    const e = line.match(/^###\s+(breaking|feat|fix|docs|chore|test|perf)(?:\(([^)]+)\))?\s+—\s+(.*)$/);
    if (e) current.entries.push({ type: e[1], scope: e[2] || null, summary: e[3].trim() });
  }
  return sections;
}

function sectionHasContent(section) {
  return section.entries.length > 0;
}

/* ------------------------------------------------------------------ *
 * Commandes
 * ------------------------------------------------------------------ */

function cmdCurrent() {
  process.stdout.write(JSON.stringify({ version: currentVersion() }, null, 2) + '\n');
}

function cmdCheck() {
  const problems = [];
  const text = read(CHANGELOG);
  if (text === null) {
    process.stdout.write(JSON.stringify({ pass: false, problems: ['CHANGELOG.md absent'] }, null, 2) + '\n');
    process.exit(1);
  }

  const sections = parseChangelog(text);
  if (!sections.length) problems.push('CHANGELOG.md ne contient aucune section `## [version]`');
  if (!sections.some(s => s.version === 'Unreleased')) problems.push('pas de section `## [Unreleased]`');

  // La version de VERSION doit correspondre à la dernière section non-Unreleased.
  const released = sections.filter(s => s.version !== 'Unreleased');
  const latest = released[0];
  const v = currentVersion();
  if (!latest) problems.push('aucune version publiée dans le CHANGELOG');
  else if (latest.version !== v) {
    problems.push(`VERSION (${v}) ne correspond pas à la dernière version du CHANGELOG (${latest.version})`);
  }

  for (const s of sections) {
    if (s.version === 'Unreleased' && s.entries.length === 0 && s.body.some(l => l.trim())) {
      problems.push('`## [Unreleased]` contient du texte libre sans entrée `### type(scope) — résumé`');
    }
  }

  const pass = problems.length === 0;
  process.stdout.write(JSON.stringify({ pass, version: v, problems }, null, 2) + '\n');
  if (!pass) process.exit(1);
}

function cmdBump(kind) {
  if (!['major', 'minor', 'patch'].includes(kind)) {
    process.stdout.write(JSON.stringify({
      error: 'usage: release.js bump --major|--minor|--patch'
    }, null, 2) + '\n');
    process.exit(1);
  }

  const text = read(CHANGELOG);
  if (text === null) {
    process.stdout.write(JSON.stringify({ error: 'CHANGELOG.md absent' }, null, 2) + '\n');
    process.exit(1);
  }

  const sections = parseChangelog(text);
  const unreleased = sections.find(s => s.version === 'Unreleased');

  if (!unreleased) {
    process.stdout.write(JSON.stringify({
      error: 'aucune section `## [Unreleased]`',
      hint: 'En ajouter une en tête de CHANGELOG.md avant de bumper.'
    }, null, 2) + '\n');
    process.exit(1);
  }
  if (!sectionHasContent(unreleased)) {
    process.stdout.write(JSON.stringify({
      error: '`## [Unreleased]` ne contient aucune entrée',
      rule: 'Une release ne se publie que s\'il y a quelque chose à publier.'
    }, null, 2) + '\n');
    process.exit(1);
  }

  const from = currentVersion();
  const to = bump(from, kind);
  const today = new Date().toISOString().slice(0, 10);

  // Reconstruire le CHANGELOG : on promeut [Unreleased] en version datée.
  const lines = text.split('\n');
  const out = [];
  let done = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const m = line.match(SECTION_RE);
    if (m && m[1] === 'Unreleased' && !done) {
      const startIdx = i;
      // trouver la fin de cette section
      let end = lines.length;
      for (let j = i + 1; j < lines.length; j++) {
        if (SECTION_RE.test(lines[j])) { end = j; break; }
      }
      out.push(`## [${to}] - ${today}`);
      out.push(...lines.slice(startIdx + 1, end));
      done = true;
      i = end - 1;
      continue;
    }
    if (!done && m && m[1] === 'Unreleased') continue;
    out.push(line);
  }
  // réinsérer la section Unreleased vide juste après le titre
  const titleEnd = out.findIndex(l => l.startsWith('## ['));
  const rebuilt = [
    ...out.slice(0, titleEnd),
    '## [Unreleased]',
    '',
    ...out.slice(titleEnd)
  ].join('\n').replace(/\n{3,}/g, '\n\n');

  fs.writeFileSync(CHANGELOG, rebuilt);
  fs.writeFileSync(VERSION_FILE, to + '\n');

  process.stdout.write(JSON.stringify({
    from, to, kind,
    date: today,
    entries: unreleased.entries.length,
    breaking: unreleased.entries.filter(e => e.type === 'breaking').length
  }, null, 2) + '\n');
}

const [cmd, arg] = process.argv.slice(2);
switch (cmd) {
  case 'current': cmdCurrent(); break;
  case 'check': cmdCheck(); break;
  case 'bump': cmdBump((arg || '').replace(/^--/, '')); break;
  default:
    process.stdout.write(JSON.stringify({
      usage: {
        'release.js current': 'affiche la version',
        'release.js check': 'valide VERSION ↔ CHANGELOG (CI)',
        'release.js bump --major|--minor|--patch': 'promeut [Unreleased] en version datée'
      }
    }, null, 2) + '\n');
}
