#!/usr/bin/env node
'use strict';

/**
 * changelog-policy.js — ce qu'une pull request a le droit de toucher dans le
 * CHANGELOG et le VERSION.
 *
 * Pourquoi cette règle existe. Le workflow de release committe `VERSION` et
 * `CHANGELOG.md` directement sur `main`. Toute pull request ouverte qui touche
 * ces deux fichiers entre en conflit au moment du merge — et le conflit
 * s'installe au pire moment, entre deux versions publiées, quand personne
 * n'attend de dispute de fusion.
 *
 * La règle est donc inverse et simple : une pull request n'ajoute QUE dans la
 * section `[Unreleased]`. Elle ne touche ni `VERSION`, ni une section déjà
 * publiée.
 *
 * `node changelog-policy.js --base main` compare l'état de travail à `main`.
 * Sans `--base`, il vérifie seulement l'état courant du fichier.
 */

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const CHANGELOG = path.join(ROOT, 'CHANGELOG.md');
const VERSION = path.join(ROOT, 'VERSION');

const problems = [];
function fail(msg) { problems.push(msg); }

function git(args) {
  try {
    // PAS de trim() ici. `git show` rend le fichier tel quel ; comparer une
    // version sans saut de ligne final à une version qui en a un fait échouer
    // une comparaison pourtant légitime. C'est arrivé, et le contrôle rejetait
    // alors toutes les pull requests valides.
    return execFileSync('git', args, { cwd: ROOT, encoding: 'utf-8', stdio: ['ignore', 'pipe', 'pipe'] });
  } catch { return null; }
}

/** Comparaison de contenu insensible aux fins de ligne. */
function sameContent(a, b) {
  if (a === null || b === null) return true;
  return a.replace(/\s+$/, '') === b.replace(/\s+$/, '');
}

/** Partie du CHANGELOG à partir de la première section publiée incluse. */
function publishedPart(text) {
  const lines = text.split('\n');
  const i = lines.findIndex(l => /^## \[\d+\.\d+\.\d+\]/.test(l));
  return i === -1 ? '' : lines.slice(i).join('\n');
}

function unreleasedPart(text) {
  const lines = text.split('\n');
  const start = lines.findIndex(l => /^## \[Unreleased\]/.test(l));
  if (start === -1) return '';
  let end = lines.length;
  for (let j = start + 1; j < lines.length; j++) {
    if (/^## \[/.test(lines[j])) { end = j; break; }
  }
  return lines.slice(start, end).join('\n');
}

/* ------------------------------------------------------------------ */

const base = (process.argv.includes('--base') ? process.argv[process.argv.indexOf('--base') + 1] : null) || null;

if (base) {
  // --- VERSION ne doit jamais être touché par une pull request ---------
  // `git show` restitue un saut de ligne final ; le fichier lu sur disque en a
  // un aussi. Les deux côtés sont normalisés, sinon 1.0.0 ≠ 1.0.0\n et le
  // contrôle rejette des pull requests parfaitement légitimes.
  const versionNow = fs.readFileSync(VERSION, 'utf-8').trim();
  const versionBaseRaw = git(['show', `${base}:VERSION`]);
  const versionBase = versionBaseRaw === null ? null : versionBaseRaw.trim();
  if (versionBase !== null && versionNow !== versionBase) {
    fail(`VERSION a été modifié dans cette branche (${versionBase} → ${versionNow}). ` +
      'C\'est le rôle du workflow de release, pas d\'une pull request : les deux se disputeraient le même fichier.');
  }

  // --- le CHANGELOG ne perd rien et ne touche pas au publié ----------
  const now = fs.readFileSync(CHANGELOG, 'utf-8');
  const before = git(['show', `${base}:CHANGELOG.md`]);

  if (before === null) {
    // Nouveau fichier : pas de comparaison possible, on vérifie la forme.
  } else {
    const publishedBefore = publishedPart(before);
    const publishedNow = publishedPart(now);
    if (!sameContent(publishedNow, publishedBefore)) {
      fail('La partie publiée du CHANGELOG a été modifiée. ' +
        'Une pull request ajoute dans `[Unreleased]` ; elle ne réécrit pas une version sortie, ' +
        'et elle ne supprime pas une entrée. Corriger une release par une nouvelle entrée.');
    }
    const unreleasedBefore = unreleasedPart(before);
    const unreleasedNow = unreleasedPart(now);
    if (sameContent(unreleasedNow, unreleasedBefore)) {
      fail('Le CHANGELOG n\'a pas été modifié. ' +
        'Toute modification de skill doit laisser une trace : une entrée dans `[Unreleased]`, ' +
        'au format `### type(scope) — résumé`.');
    }
  }
}

// --- forme du fichier, indépendamment de git -------------------------
const text = fs.readFileSync(CHANGELOG, 'utf-8');

if (!/^## \[Unreleased\]/m.test(text)) {
  fail('CHANGELOG.md n\'a pas de section `## [Unreleased]` en tête. C\'est elle qui reçoit les changements en cours.');
}
if (!/^## \[Unreleased\][ \t]*$/m.test(text)) {
  fail('`## [Unreleased]` doit être seule sur sa ligne, sans suffixe de date.');
}

// Les entrées de la section Unreleased doivent respecter le format.
const unreleased = unreleasedPart(text);
const entryLines = unreleased.split('\n').filter(l => l.startsWith('### '));
for (const line of entryLines) {
  if (!/^###\s+(breaking|feat|fix|docs|chore|test|perf)(\([^)]+\))?\s+—\s+\S/.test(line)) {
    fail(`Entrée de CHANGELOG mal formée : \`${line}\`` +
      '\nFormat attendu : `### type(scope) — résumé`');
  }
}

const result = { pass: problems.length === 0, problems, unreleased_entries: entryLines.length };
process.stdout.write(JSON.stringify(result, null, 2) + '\n');
process.exit(result.pass ? 0 : 1);
