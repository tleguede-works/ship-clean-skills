#!/usr/bin/env node
'use strict';

/**
 * validate-repo.js — contrôle du dépôt de skills lui-même.
 *
 * Zéro dépendance. À lancer avant chaque commit et en CI.
 *
 * Ce script existe parce que les défauts qu'il vérifie ont tous été observés
 * pour de vrai :
 *
 *   - une `description` ordonnait de déléguer à un skill inexistant ;
 *   - un `SKILL.md` listait des agents et des scripts qui n'étaient plus là ;
 *   - deux skills se référencent mutuellement, et rien ne vérifiait que la
 *     frontière tient encore.
 *
 * Une liste de fichiers dans un document qui n'est plus vérifiée devient fausse
 * en silence. C'est la même maladie que le suivi de projet qui disait
 * « terminé » pour des slices sans test.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SKILLS_DIR = path.join(ROOT, 'skills');

/** Contrat Agent Skills : identifiant portable, dérivé du CHEMIN du fichier. */
const ID_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

const results = [];
let failed = 0;

function check(name, ok, details) {
  results.push({ check: name, status: ok ? 'pass' : 'fail', ...details });
  if (!ok) failed++;
}

function listFiles(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === '.git') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) listFiles(full, acc);
    else acc.push(full);
  }
  return acc;
}

/* ------------------------------------------------------------------ *
 * Front matter — plat, suffisant pour name/description
 * ------------------------------------------------------------------ */

function frontMatter(file) {
  const raw = fs.readFileSync(file, 'utf-8').replace(/^﻿/, '');
  if (!raw.startsWith('---')) return null;
  const end = raw.indexOf('\n---', 3);
  if (end === -1) return null;
  const data = {};
  for (const line of raw.slice(3, end).split('\n')) {
    if (!line.trim() || line.trim().startsWith('#')) continue;
    const i = line.indexOf(':');
    if (i === -1) continue;
    data[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  return { data, body: raw.slice(end + 4) };
}

/* ------------------------------------------------------------------ *
 * Découverte
 * ------------------------------------------------------------------ */

function discoverSkills() {
  if (!fs.existsSync(SKILLS_DIR)) return [];
  return fs.readdirSync(SKILLS_DIR, { withFileTypes: true })
    .filter(e => e.isDirectory())
    .map(e => e.name)
    .filter(name => fs.existsSync(path.join(SKILLS_DIR, name, 'SKILL.md')))
    .sort();
}

const skillIds = discoverSkills();
const allText = new Map();

for (const id of skillIds) {
  allText.set(id, listFiles(path.join(SKILLS_DIR, id))
    .map(f => fs.readFileSync(f, 'utf-8'))
    .join('\n'));
}

function out(obj) {
  process.stdout.write(JSON.stringify(obj, null, 2) + '\n');
}

/* ------------------------------------------------------------------ *
 * 1. Structure du dépôt
 * ------------------------------------------------------------------ */

// La racine ne doit PAS contenir de SKILL.md : le dépôt entier serait alors
// détecté comme un skill unique au lieu d'en exposer plusieurs.
check('no_root_skill_md', !fs.existsSync(path.join(ROOT, 'SKILL.md')), {
  reason: 'Un SKILL.md à la racine fait de tout le dépôt un seul skill. Utilisez README.md.',
  found: fs.existsSync(path.join(ROOT, 'SKILL.md')) ? 'SKILL.md' : null
});

check('skills_directory_exists', skillIds.length > 0, {
  found: skillIds
});

/* ------------------------------------------------------------------ *
 * 2. Contrat de chaque skill
 * ------------------------------------------------------------------ */

const missingFrontmatter = [];
const badIds = [];
const nameMismatch = [];
const missingDescription = [];
const shortDescriptions = [];

for (const id of skillIds) {
  const file = path.join(SKILLS_DIR, id, 'SKILL.md');
  const fm = frontMatter(file);

  if (!fm) { missingFrontmatter.push(id); continue; }
  if (!ID_PATTERN.test(id)) badIds.push({ id, expected: '^[a-z0-9]+(-[a-z0-9]+)*$' });

  const name = fm.data.name;
  // L'ID vient du chemin. Le `name` est un libellé d'affichage, mais s'il
  // diverge de l'ID, l'agent et l'utilisateur l'appellent par deux noms.
  if (name && name !== id) nameMismatch.push({ id, name });
  if (name === undefined) nameMismatch.push({ id, name: null });

  const desc = fm.data.description;
  if (!desc) missingDescription.push(id);
  else if (desc.length < 80) shortDescriptions.push({ id, length: desc.length });
}

check('every_skill_has_frontmatter', missingFrontmatter.length === 0, { missing: missingFrontmatter });
check('skill_ids_are_portable', badIds.length === 0, { invalid: badIds, pattern: '^[a-z0-9]+(-[a-z0-9]+)*$' });
check('skill_name_matches_directory', nameMismatch.length === 0, {
  mismatches: nameMismatch,
  rule: "L'identifiant du skill est dérivé du CHEMIN. Un `name` différent crée deux noms pour la même chose."
});
check('every_skill_has_description', missingDescription.length === 0, {
  missing: missingDescription,
  rule: 'Sans description, le skill n\'est jamais proposé au modèle.'
});
check('descriptions_are_actionable', shortDescriptions.length === 0, {
  too_short: shortDescriptions,
  rule: 'Une description trop courte ne permet pas de choisir le bon skill.'
});

/* ------------------------------------------------------------------ *
 * 3. Références à des skills inexistants
 * ------------------------------------------------------------------ */

// Détecter une référence à un skill inexistant sans crier au passage sur la
// prose. Trois signaux, du plus fiable au plus risqué :
//
//   1. la forme explicite « skill <id> », avec liste d'arrêt   (élevée confiance)
//   2. un kebab-case entre backticks qui ressemble à un ID      (faible)
//   3. un quasi-doublon d'un ID existant — donc une faute de frappe
//
// Un motif trop large produirait des faux positifs, et une porte qui hurle sur
// des mots ordinaires est une porte qu'on désactive au bout de deux jours.
const KNOWN_EXTERNAL = new Set(['skills', 'skill', 'corpus']);

// Mots ordinaires qui suivent « skill » dans la prose française ou anglaise.
const PROSE_AFTER_SKILL = new Set([
  'lui', 'meme', 'me', 'the', 'and', 'or', 'of', 'a', 'an', 'to', 'for', 'in', 'on',
  'is', 'are', 'was', 'that', 'this', 'it', 'he', 'she', 'they', 'we', 'you',
  'copy', 'pasted', 'set', 'like', 'below', 'above', 'format', 'files',
  'list', 'name', 'names', 'directory', 'level', 'with', 'without', 'from', 'at', 'by',
  'un', 'une', 'des', 'les', 'ce', 'cet', 'cette', 'du', 'de', 'la', 'le', 'et', 'ou',
  'plus', 'tout', 'tous', 'peut', 'doit', 'est', 'sont', 'dans', 'sur', 'pour',
  'seul', 'seule', 'propre', 'premier', 'dernier', 'nouveau', 'nouvelle'
]);

/** Retire les fragments entre backticks : ils documentent, ils ne référencent pas. */
function stripCodeSpans(text) {
  return text.replace(/`[^`]*`/g, ' `` ');
}

const dangling = [];
for (const [id, rawText] of allText) {
  const text = stripCodeSpans(rawText);

  // 1. forme explicite « skill <id> »
  const explicit = /\bskills?\s+([a-z][a-z0-9]*(?:-[a-z0-9]+)+)/gi;
  let m;
  while ((m = explicit.exec(text)) !== null) {
    const ref = m[1].toLowerCase();
    if (KNOWN_EXTERNAL.has(ref)) continue;
    if (PROSE_AFTER_SKILL.has(ref) || PROSE_AFTER_SKILL.has(ref.split('-')[0])) continue;
    if (!skillIds.includes(ref)) {
      dangling.push({ in_skill: id, referenced: ref, form: 'explicit' });
    }
  }
}

// 2. quasi-doublon d'un ID existant → faute de frappe probable
const typos = [];
const escapeRe = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
for (const [id, rawText] of allText) {
  for (const known of skillIds) {
    for (const variant of [known.replace(/-/g, '_'), known.replace(/-/g, ''), known.replace(/-/g, ' ')]) {
      if (variant === known) continue;
      if (new RegExp(`\\b${escapeRe(variant)}\\b`).test(rawText)) {
        typos.push({ in_skill: id, probably_meant: known, found_as: variant });
      }
    }
  }
}

check('no_dangling_skill_references', dangling.length === 0, {
  references_missing_skill: dangling,
  known_skills: skillIds,
  rule: "Un skill qui renvoie vers un skill absent ordonne au modèle de déléguer à rien. C'est un défaut d'inférence, pas une note."
});

check('no_skill_id_typos', typos.length === 0, {
  typos,
  known_skills: skillIds,
  rule: 'Un ID de skill cité sous une forme modifiée (tiret, underscore, accolade) ne sera jamais résolu.'
});

/* ------------------------------------------------------------------ *
 * 4. Listes déclarées dans SKILL.md vs fichiers réels
 * ------------------------------------------------------------------ */

// Forge liste ses agents et ses scripts dans des tableaux. Une liste qui
// derive de son contenu devient fausse sans aucun signal.
//
// Chaque motif est ancre sur SA PROPRE section : sans cela les deux tables se
// contaminent - un `selftest` ecrit dans l'une est compte comme un agent
// manquant dans l'autre, et le controle devient un faux positif permanent.
function section(text, heading) {
  const start = text.indexOf(heading);
  if (start === -1) return null;
  const rest = text.slice(start + heading.length);
  const next = rest.search(/\n#{2,4} /);
  return next === -1 ? rest : rest.slice(0, next);
}

const DECLARED_LISTS = {
  'skills/forge/SKILL.md': [
    { label: 'agents', dir: 'skills/forge/agents', ext: '.md',
      heading: '## Agents spécial', re: /^\|\s*`([a-z0-9-]+)(?:\.[a-z]+)?`\s*\|/gm },
    { label: 'scripts', dir: 'skills/forge/scripts', ext: '.js',
      heading: '### Scripts', re: /^\|\s*`([a-z0-9-]+)(?:\.[a-z]+)?(?:\s+[^`]*)?`\s*\|/gm }
  ],
  'skills/project-rules-architect/SKILL.md': []
};

const listDrift = [];
for (const [rel, specs] of Object.entries(DECLARED_LISTS)) {
  const file = path.join(ROOT, rel);
  if (!fs.existsSync(file)) continue;
  const fm = frontMatter(file);
  const text = fm ? fm.body : fs.readFileSync(file, 'utf-8');

  for (const spec of specs) {
    const scope = section(text, spec.heading);
    if (scope === null) {
      listDrift.push({ file: rel, label: spec.label, problem: 'section « ' + spec.heading + ' » introuvable' });
      continue;
    }
    const dir = path.join(ROOT, spec.dir);
    if (!fs.existsSync(dir)) continue;
    const actual = new Set(
      fs.readdirSync(dir)
        .filter(f => f.endsWith(spec.ext) && f !== 'lib.js')
        .map(f => f.replace(/\.(md|js)$/, ''))
    );

    spec.re.lastIndex = 0;
    const declared = new Set();
    let m;
    while ((m = spec.re.exec(scope)) !== null) declared.add(m[1]);

    for (const d of declared) {
      if (!actual.has(d)) listDrift.push({ file: rel, label: spec.label, item: d, problem: 'déclaré dans SKILL.md mais absent du dossier' });
    }
    for (const a of actual) {
      if (!declared.has(a)) listDrift.push({ file: rel, label: spec.label, item: a, problem: 'présent sur disque mais non listé dans SKILL.md' });
    }
  }
}

check('declared_lists_match_files', listDrift.length === 0, {
  drift: listDrift,
  rule: "Une liste de fichiers dans SKILL.md qui dérive de son contenu devient fausse sans signal."
});

/* ------------------------------------------------------------------ *
 * 5. Gabarits non rendus
 * ------------------------------------------------------------------ */

// Un `{{PLACEHOLDER}}` résiduel trahit une valeur jamais choisie. Mais le
// contrôle doit viser le CONTENU livrable, pas le code ni les formulaires :
//
//   - un `.js` qui cite `{{PLACEHOLDER}}` dans une chaîne ou un commentaire
//     *documente* le motif ; ce n'est pas un rendu oublié ;
//   - un fichier de formulaire contient des placeholders **par conception** ;
//   - un `.tmpl` est un gabarit : c'est son rôle.
//
// Un formulaire se déclare avec le marqueur `<!-- forge:form -->`.
const PLACEHOLDER = /\{\{\s*[A-Z0-9_]{2,}\s*\}\}/g;
const FORM_MARKER = '<!-- forge:form -->';
const unrendered = [];
const formFiles = [];

for (const [id] of allText) {
  for (const file of listFiles(path.join(SKILLS_DIR, id))) {
    if (file.endsWith('.tmpl') || file.endsWith('.js')) continue;
    const rel = path.relative(ROOT, file);
    // Un fichier sous un répertoire `templates/` est un gabarit par son
    // emplacement, même s'il s'appelle .md.
    if (/(^|\/)templates?\//.test(rel)) continue;
    const raw = fs.readFileSync(file, 'utf-8');
    if (raw.includes('forge:form')) { formFiles.push(rel); continue; }
    const found = (stripCodeSpans(raw).match(PLACEHOLDER) || []);
    if (found.length) unrendered.push({ file: rel, placeholders: [...new Set(found)].slice(0, 5) });
  }
}

check('no_unrendered_placeholders', unrendered.length === 0, {
  offenders: unrendered,
  form_files: formFiles,
  rule: "Un {{PLACEHOLDER}} dans un document livré est une valeur jamais choisie. Sont exemptés les .tmpl, les .js, et les formulaires marqués `<!-- forge:form -->`."
});

/* ------------------------------------------------------------------ *
 * 6. Intégrité des scripts exécutables
 * ------------------------------------------------------------------ */

const scriptIssues = [];
const scripts = listFiles(SKILLS_DIR).filter(f => f.endsWith('.js'));
for (const f of scripts) {
  try {
    require('child_process').execFileSync('node', ['--check', f], { stdio: 'pipe' });
  } catch {
    scriptIssues.push({ file: path.relative(ROOT, f), problem: 'erreur de syntaxe' });
  }
}
check('scripts_parse', scriptIssues.length === 0, {
  checked: scripts.length,
  offenders: scriptIssues
});

/* ------------------------------------------------------------------ *
 * Sortie
 * ------------------------------------------------------------------ */

out({
  command: 'validate-repo',
  root: ROOT,
  skills: skillIds,
  pass: failed === 0,
  failed: results.filter(r => r.status === 'fail').map(r => r.check),
  checks: results
});

process.exit(failed === 0 ? 0 : 1);
