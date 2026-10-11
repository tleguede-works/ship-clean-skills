#!/usr/bin/env node

/**
 * rules-selftest.js — vérifie un **jeu de règles livré** contre les dix
 * promesses que le skill fait dans `audit-checklist.md`.
 *
 * Ne modifie rien. Sort 1 si un contrôle échoue, 0 si tout passe.
 *
 *   node rules-selftest.js <projet> [--json] [--quiet]
 *
 * Pourquoi un script et pas une checklist
 * ---------------------------------------
 * Le skill exige, en prose, des choses qu'un case à cocher ne prouve pas :
 * que le câblage pointe sur des fichiers existants, que l'index liste tout,
 * que les renvois de section résolvent, qu'aucun seuil ne soit contredit,
 * qu'aucune référence à `.forge/` ne survive hors Forge. Tout cela est
 * **décidable** — et une exigence décidable écrite en prose est une exigence
 * que l'agent peut déclarer satisfaite sans l'avoir vérifiée. C'est le défaut
 * que ce script ferme.
 *
 * Les contrôles qui ne sont pas décidables (l'esthétique d'une règle, la
 * pertinence d'un test, le respect des critères d'acceptation) restent dans
 * `audit-checklist.md` et ne sont **pas** simulés ici : un contrôle qui
 * mentirait sur ce qu'il vérifie coûterait plus cher que son absence.
 */

const fs = require('fs');
const path = require('path');

/* ------------------------------------------------------------------ *
 * Utilitaires
 * ------------------------------------------------------------------ */

const RULES_DIR_CANDIDATES = [
  '.opencode/rules',
  '.cursor/rules',
  'rules',
  '.rules'
];

const ENTRY_CANDIDATES = ['AGENTS.md', 'CLAUDE.md', '.github/copilot-instructions.md'];

function walk(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === 'node_modules' || e.name.startsWith('.')) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full, acc);
    else acc.push(full);
  }
  return acc;
}

function stripCodeSpans(text) {
  return text.replace(/`[^`\n]*`/g, match => ' '.repeat(match.length));
}

/**
 * Retire les diacritiques, pour qu'un jeu de règles écrit en français soit
 * cherché aussi finement qu'un jeu en anglais.
 *
 * Sans cela, `/\bvulnerab/i` ne trouve pas « vulnérabilité », et le contrôle
 * conclut qu'un jeu de règles parfaitement complet ne parle pas de
 * vulnérabilités — puis le déclare conforme. **Un contrôle qui ne reconnaît
 * pas la langue du projet rapporte « tout va bien » sur ce qu'il n'a pas
 * regardé**, ce qui est le pire des deux défauts possibles.
 */
function deaccent(text) {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/** Normalise un titre de section pour comparer deux références. */
function normSection(s) {
  return String(s)
    .toLowerCase()
    .replace(/[`*_]/g, '')
    .replace(/[^a-z0-9 ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Retire le préfixe numérique d'un titre : `### 3. Coverage` → `coverage`. */
function stripHeadingNumber(h) {
  return String(h).replace(/^\s*#+\s*\d+(\.\d+)*[.)]?\s*/, '').trim();
}

function headingsOf(md) {
  const out = [];
  for (const line of md.split('\n')) {
    const m = /^(#{1,6})\s+(.*)$/.exec(line);
    if (m) out.push({ level: m[1].length, raw: m[2].trim(), text: stripHeadingNumber(m[2]) });
  }
  return out;
}

/* ------------------------------------------------------------------ *
 * Chargement du jeu de règles
 * ------------------------------------------------------------------ */

function load(projectRoot) {
  const rulesDir = RULES_DIR_CANDIDATES
    .map(d => path.join(projectRoot, d))
    .find(d => fs.existsSync(d) && fs.statSync(d).isDirectory());

  const entry = ENTRY_CANDIDATES
    .map(f => path.join(projectRoot, f))
    .find(f => fs.existsSync(f));

  const files = rulesDir
    ? walk(rulesDir).filter(f => /\.(md|mdc)$/.test(f))
    : [];

  return {
    root: projectRoot,
    rulesDir,
    entry,
    files,
    contents: new Map(files.map(f => [f, fs.readFileSync(f, 'utf-8')])),
    entryText: entry ? fs.readFileSync(entry, 'utf-8') : ''
  };
}

/* ------------------------------------------------------------------ *
 * Les dix contrôles
 * ------------------------------------------------------------------ */

/** 1. Le câblage existe, parse, et pointe sur des fichiers présents. */
function checkWiring(ctx) {
  const offenders = [];
  const cfgCandidates = ['opencode.json', 'opencode.jsonc', '.opencode/opencode.json'];
  let found = null;
  for (const c of cfgCandidates) {
    const p = path.join(ctx.root, c);
    if (fs.existsSync(p)) { found = p; break; }
  }

  if (!found) {
    return {
      name: 'wiring_present',
      ok: false,
      detail: { error: 'no_wiring_file', expected: cfgCandidates },
      rule: "Générer le Markdown sans le fichier de configuration produit un jeu de règles complet en apparence et totalement inerte."
    };
  }

  let cfg;
  try {
    cfg = JSON.parse(fs.readFileSync(found, 'utf-8'));
  } catch (e) {
    return {
      name: 'wiring_present',
      ok: false,
      detail: { file: path.relative(ctx.root, found), error: 'invalid_json', message: e.message },
      rule: "Un JSON invalide désactive silencieusement tout le jeu d'instructions, et rien ne le signale."
    };
  }

  const instructions = cfg.instructions;
  if (!Array.isArray(instructions) || instructions.length === 0) {
    offenders.push({ problem: 'no_instructions_key', file: path.relative(ctx.root, found) });
    return {
      name: 'wiring_present',
      ok: false,
      detail: { offenders, hint: 'Ajouter "instructions": ["AGENTS.md", "<rules glob>"]' },
      rule: "Sans clé `instructions`, aucune règle n'est chargée."
    };
  }

  const resolved = [];
  for (const pattern of instructions) {
    if (pattern.includes('*') || pattern.includes('?')) {
      // Glob : on l'évalue grossièrement — un `**` ou un `*` suffit.
      const dir = pattern.split('*')[0].replace(/\/$/, '');
      const absDir = path.join(ctx.root, dir);
      const matches = walk(absDir).filter(f => /\.(md|mdc)$/.test(f));
      if (matches.length === 0) {
        offenders.push({ problem: 'glob_matches_nothing', pattern, dir });
      }
      resolved.push({ pattern, kind: 'glob', matches: matches.length });
    } else {
      const p = path.join(ctx.root, pattern);
      if (!fs.existsSync(p)) offenders.push({ problem: 'path_missing', pattern });
      resolved.push({ pattern, kind: 'path', exists: fs.existsSync(p) });
    }
  }

  // L'entrée canonique doit être chargée : un glob seul donne les règles sans
  // les commandes ni la définition de terminé.
  const hasEntry = instructions.some(i => !i.includes('*') && /AGENTS\.md$/.test(i));
  if (!hasEntry && fs.existsSync(path.join(ctx.root, 'AGENTS.md'))) {
    offenders.push({ problem: 'entry_file_not_loaded' });
  }

  return {
    name: 'wiring_present',
    ok: offenders.length === 0,
    detail: { file: path.relative(ctx.root, found), resolved, offenders },
    rule: "Une glob qui ne matche rien est une configuration valide qui ne charge rien."
  };
}

/** 2. L'index liste chaque fichier livré, et chaque fichier listé existe. */

/**
 * Un index est un **tableau de lignes**, pas une mention en prose. `clients.md`
 * cité dans une phrase n'est pas une entrée d'index ; `10-horloge.md` dans une
 * ligne de tableau en est une. Sans cette distinction le contrôle signale des
 * fichiers de conception, des ADR et des documents de projet comme des règles
 * orphelines.
 *
 * Un projet peut en outre avoir **son index dans le répertoire de règles**
 * plutôt que dans le fichier d'entrée — un `00-regles.md` d'entrée de jeu.
 * Cet index se cite lui-même, donc il est exempté du « présent mais non listé ».
 */
function indexTables(ctx) {
  const onDisk = new Set(ctx.files.map(f => path.basename(f)));
  const IGNORED = ['AGENTS.md', 'CLAUDE.md', 'DECISIONS.md', 'SESSION_LOG.md', 'LEARNINGS.md'];

  /** Les lignes de tableau d'un document, séparateur de tableau exclu. */
  const tableRows = (text) => text.split('\n')
    .filter(l => /^\s*\|/.test(l) && !/^\s*\|[\s|:-]*\|?\s*$/.test(l));

  /** Les noms de fichiers cités par une ligne de tableau, dans les deux premières cellules. */
  const namesIn = (line) => {
    const out = [];
    for (const cell of line.split('|').slice(1, 3)) {
      for (const m of cell.matchAll(/`([^`\n/]+\.md)`/g)) {
        const name = path.basename(m[1]);
        if (!IGNORED.includes(name)) out.push(name);
      }
    }
    return out;
  };

  /**
   * **Reconnaître un index par son en-tête de tableau ne suffit pas**, et pas
   * plus par « il cite un fichier qui existe » : un fichier de règles cite
   * ses voisins en prose, et chaque référence compterait alors comme une
   * entrée d'index. Le contrôle déclarait alors la moitié du jeu de règles
   * absente du disque — un faux positif si bruyant qu'il apprend à ignorer le
   * contrôle.
   *
   * La discrimination est donc **structurelle ET sémantique**, sur les lignes
   * de tableau seulement : un index a au moins une **ligne de tableau** qui
   * nomme un fichier présent.
   */
  const isIndex = (file, text) => tableRows(text).some(row => namesIn(row).some(n => onDisk.has(n)));

  const sources = [];
  if (ctx.entry) sources.push({ text: ctx.entryText, file: ctx.entry });
  for (const [file, text] of ctx.contents) {
    if (isIndex(file, text)) sources.push({ text, file });
  }

  const listed = new Map(); // nom -> { index }
  for (const src of sources) {
    for (const row of tableRows(src.text)) {
      for (const name of namesIn(row)) {
        if (!listed.has(name)) listed.set(name, { index: path.basename(src.file) });
      }
    }
  }
  return { listed, indexFiles: new Set(sources.map(s => path.basename(s.file))) };
}

function checkIndex(ctx) {
  const offenders = [];
  if (!ctx.entry) {
    return {
      name: 'index_covers_everything',
      ok: false,
      detail: { error: 'no_entry_file', expected: ENTRY_CANDIDATES },
      rule: "Sans fichier d'entrée, rien n'indique à l'agent que les règles existent."
    };
  }

  const { listed, indexFiles } = indexTables(ctx);
  const onDisk = new Set(ctx.files.map(f => path.basename(f)).filter(n => !indexFiles.has(n)));

  // Un nom cité dans une table d'index qui **existe dans le projet** sans être
  // dans le répertoire de règles est un document du projet — `.forge/conventions.md`,
  // `SESSION_LOG.md` — pas une règle orpheline. Sans cette distinction, tout
  // projet organisé autour d'un dossier de spécifications déclare une-hundred
  // règles manquantes, et l'agent apprend à ignorer le contrôle.
  const existsInProject = (name) => {
    if (fs.existsSync(path.join(ctx.root, name))) return true;
    return walk(ctx.root).some(f => path.basename(f) === name);
  };

  for (const [name, where] of listed) {
    if (onDisk.has(name)) continue;
    if (existsInProject(name)) continue;
    offenders.push({ kind: 'listed_but_absent', file: name, in: where.index });
  }
  for (const name of onDisk) {
    if (!listed.has(name)) offenders.push({ kind: 'present_but_unlisted', file: name });
  }

  return {
    name: 'index_covers_everything',
    ok: offenders.length === 0,
    detail: { index_files: [...indexFiles], listed: listed.size, on_disk: onDisk.size, offenders },
    rule: "Un fichier non listé ne sera jamais lu ; un fichier listé qui n'existe pas est une référence cassée."
  };
}

/** 3. Aucun `{{PLACEHOLDER}}` n'a survécu à la génération. */
function checkPlaceholders(ctx) {
  const offenders = [];
  const RE = /\{\{\s*[A-Za-z0-9_#\/.-]+\s*\}\}/g;
  const targets = [...ctx.contents.entries()];
  if (ctx.entry) targets.push([ctx.entry, ctx.entryText]);

  for (const [file, text] of targets) {
    const body = stripCodeSpans(text);
    const found = body.match(RE);
    if (found) {
      offenders.push({
        file: path.relative(ctx.root, file),
        placeholders: [...new Set(found)].slice(0, 6)
      });
    }
  }

  return {
    name: 'no_placeholder_residue',
    ok: offenders.length === 0,
    detail: { offenders },
    rule: "Un `{{PLACEHOLDER}}` dans un fichier livré est une valeur jamais choisie."
  };
}

/**
 * 4. Chaque renvoi `fichier.md §Section` résout vers un titre réel.
 *
 * Deux résolutions, parce que deux questions se posent :
 *   - le fichier cité fait-il partie du jeu de règles livré ? alors la
 *     **section** doit exister, sinon le renvoi est mort ;
 *   - le fichier cité est-il un document du projet (`.forge/architecture.md`,
 *     `LEARNINGS.md`) ? alors seul son **existence** compte — on ne possède
 *     pas ses titres, et les deviner serait un contrôle qui ment sur ce qu'il
 *     vérifie.
 */
function checkCrossRefs(ctx) {
  const offenders = [];
  const ruleFiles = new Map(ctx.files.map(f => [path.basename(f), fs.readFileSync(f, 'utf-8')]));

  const targets = [...ruleFiles.entries()].map(([n, t]) => [path.join(ctx.root, n), t]);
  if (ctx.entry) targets.push([ctx.entry, ctx.entryText]);

  for (const [file, text] of targets) {
    const src = path.basename(file);
    // La citation peut porter un chemin : `.forge/architecture.md` § 1.2.
    // Le premier caractère peut être un point — sans quoi `.forge/…` est
    // capturé à partir du `f` et résout vers `forge/…`, qui n'existe pas.
    for (const m of text.matchAll(/`?((?:[\w.-]+\/)*[\w.-]+\.md)`?\s*§+\s*`?([A-Za-zÀ-ÿ0-9][^`\n.]*)/g)) {
      const citedPath = m[1];
      const targetName = path.basename(citedPath);
      const wanted = normSection(m[2].replace(/[`.,;:)\]]+$/, '').trim());
      if (!wanted) continue;

      // Un document du projet, cité par son chemin complet : il suffit qu'il existe.
      if (!ruleFiles.has(targetName) && fs.existsSync(path.join(ctx.root, citedPath))) continue;

      const isRule = ruleFiles.has(targetName);
      if (!isRule) {
        offenders.push({ kind: 'cited_file_absent', in: src, cites: citedPath });
        continue;
      }

      const heads = headingsOf(ruleFiles.get(targetName)).map(h => normSection(h.text));
      const found = heads.some(h => h === wanted || h.includes(wanted) || wanted.includes(h));
      if (!found) {
        offenders.push({ kind: 'unresolved_section', in: src, cites: citedPath, section: m[2].trim().slice(0, 60) });
      }
    }
  }

  return {
    name: 'cross_references_resolve',
    ok: offenders.length === 0,
    detail: { offenders: offenders.slice(0, 30) },
    rule: "Un renvoi de section survit à un découpage de fichier ; un renvoi de nom de fichier ne survit à rien."
  };
}

/**
 * 5. Aucun seuil contradictoire.
 *
 * Le défaut le plus coûteux d'un jeu de règles, parce que les deux nombres
 * sont individuellement raisonnables et qu'aucun ne se trompe : deux fichiers
 * donnent deux réponses à « cette taille de fichier est-elle trop grande ».
 * On extrait les seuils par grandeur et on échoue si une grandeur a plus
 * d'une valeur.
 */
const THRESHOLD_CONCEPTS = [
  {
    key: 'duplication', label: 'duplication du code',
    re: /(\d+(?:[.,]\d+)?)\s*%\s*(?:de\s+)?(?:duplication|copi|copypaste)|(?:duplication|max-duplication|threshold)\s*[:=]\s*(\d+(?:[.,]\d+)?)/gi
  },
  {
    key: 'coverage', label: 'couverture de tests',
    re: /(\d+(?:[.,]\d+)?)\s*%\s*(?:de\s+)?couverture|couverture\s*(?:>=?|≥|min(?:imum)?)\s*(\d+(?:[.,]\d+)?)\s*%|coverage(?:Threshold)?\s*[:=]\s*(\d+(?:[.,]\d+)?)/gi
  },
  {
    // Le vocabulaire des seuils de taille est le plus varié : « au-delà de »,
    // « plus de », « au-dessus de », « over », « more than », « split at ».
    // Un motif qui n'en couvre qu'une forme laisse passer précisément la
    // contradiction qu'il existe pour attraper.
    key: 'file_size', label: 'taille de fichier (lignes)',
    re: /(?:au[- ]del[aà]s?\s+de|au[- ]dessus\s+de|plus\s+de|over|more\s+than|above)\s+(\d{2,4})\s*(?:lignes|lines)|[>]\s*(\d{2,4})\s*(?:lignes|lines)|(\d{2,4})\s*lignes\s*(?:et\s+plus|ou\s+plus|\+)|(?:split|refactor|decompos|decoup)\w*\s*(?:at|over|au[- ]del[aà]|au[- ]dessus)\s*(\d{2,4})/gi
  }
];

function extractThresholds(text) {
  const out = [];
  for (const c of THRESHOLD_CONCEPTS) {
    if (c.key === 'component_size') continue;
    c.re.lastIndex = 0;
    let m;
    while ((m = c.re.exec(text)) !== null) {
      const raw = m.slice(1).find(Boolean);
      if (!raw) continue;
      const n = parseFloat(String(raw).replace(',', '.'));
      if (Number.isFinite(n)) out.push({ concept: c.key, value: n, excerpt: m[0].trim().slice(0, 60) });
    }
  }
  return out;
}

function checkThresholds(ctx) {
  const found = new Map(); // concept -> Map(value -> [{file, excerpt}])
  for (const [file, text] of ctx.contents) {
    for (const t of extractThresholds(stripCodeSpans(text))) {
      if (!found.has(t.concept)) found.set(t.concept, new Map());
      const byVal = found.get(t.concept);
      if (!byVal.has(t.value)) byVal.set(t.value, []);
      byVal.get(t.value).push({ file: path.basename(file), excerpt: t.excerpt });
    }
  }

  const conflicts = [];
  for (const [concept, byVal] of found) {
    const values = [...byVal.keys()];
    if (values.length > 1) {
      // Seuil et floor de couverture : 80 partout, « au moins 80 » et
      // « 85 sur l'outillage » ne sont pas la même notion, mais le contrôle
      // ne peut pas le savoir. On signale, l'humain tranche.
      conflicts.push({
        concept,
        values: values.sort((a, b) => a - b).map(v => ({
          value: v,
          occurrences: byVal.get(v)
        }))
      });
    }
  }

  return {
    name: 'no_contradictory_thresholds',
    ok: conflicts.length === 0,
    detail: { conflicts },
    rule: "Deux fichiers qui donnent deux réponses à « cette taille est-elle trop grande » n'ont pas de règle : ils ont deux avis."
  };
}

/** 6. Aucune dépendance à `.forge/` hors d'un projet qui en a un. */
function checkForgeCoupling(ctx) {
  const hasForge = fs.existsSync(path.join(ctx.root, '.forge'));
  const offenders = [];
  if (hasForge) {
    return { name: 'no_forge_coupling', ok: true, detail: { skipped: '.forge/ présent' }, rule: "Hors Forge, un fichier de règles ne doit rien demander à `.forge/`." };
  }

  const targets = [...ctx.contents.entries()];
  if (ctx.entry) targets.push([ctx.entry, ctx.entryText]);

  for (const [file, text] of targets) {
    const hits = (text.match(/\.forge[\/\\][\w./*-]*/g) || []);
    if (hits.length) {
      offenders.push({ file: path.relative(ctx.root, file), hits: [...new Set(hits)].slice(0, 5) });
    }
  }

  return {
    name: 'no_forge_coupling',
    ok: offenders.length === 0,
    detail: { offenders },
    rule: "Un jeu de règles qui pointe vers `.forge/` devient inexplicable dès que le fichier est réutilisé ailleurs."
  };
}

/**
 * 7. Contamination.
 *
 * Trois passes séparées, parce qu'un seul grep ne les attrape pas toutes
 * (`postmortems.md` Case 2 et son addendum), et deux exemptions, parce qu'un
 * contrôle trop permissif est pire que pas de contrôle du tout :
 *
 *   - une bibliothèque **que le projet possède** n'est pas de la
 *     contamination — un projet Flutter mentionne Flutter. On lit donc les
 *     manifestes avant de juger ;
 *   - les outils internes de Forge ne sont de la contamination **que dans un
 *     projet qui n'a pas de `.forge/`**.
 */
const ECOSYSTEM_SIGNALS = {
  flutter: [/flutter/i],
  react_native: [/expo/i, /react-native/i],
  nextjs: [/next/i],
  angular: [/@angular\//i],
  spring: [/spring-boot/i, /springframework/i],
  nest: [/@nestjs\//i],
  react: [/\breact\b/i]
};

const FOREIGN_LIBS = [
  { label: 'flutter', re: /\bflutter\b/i, not_if: 'flutter' },
  { label: 'riverpod', re: /\bRiverpod\b/, not_if: 'flutter' },
  { label: 'flutter_bloc', re: /\bflutter_bloc\b/, not_if: 'flutter' },
  { label: 'createAsyncThunk', re: /\bcreateAsyncThunk\b/, not_if: 'flutter' },
  { label: 'nextjs', re: /\bNext\.js\b/i, not_if: 'nextjs' },
  { label: 'gssp', re: /\bgetServerSideProps\b/, not_if: 'nextjs' },
  { label: 'gssp_static', re: /\bgetStaticProps\b/, not_if: 'nextjs' },
  { label: 'shadcn', re: /\bshadcn\b/, not_if: null },
  { label: 'redux_toolkit', re: /\bRedux Toolkit\b/, not_if: null },
  { label: 'createSlice', re: /\bcreateSlice\b/, not_if: null },
  { label: 'tanstack_query', re: /\b(TanStack|react-)query\b/i, not_if: null },
  { label: 'zustand', re: /\bZustand\b/, not_if: null },
  { label: 'ng_module', re: /\bNgModule\b/, not_if: 'angular' },
  { label: 'app_module', re: /\bAppModule\b/, not_if: 'angular' },
  { label: 'rxjs', re: /\bRxJS\b/, not_if: 'angular' },
  { label: 'http_client_module', re: /\bHttpClientModule\b/, not_if: 'angular' },
  { label: 'spring_boot', re: /\bSpring Boot\b/, not_if: 'spring' },
  { label: 'spring_boot_app', re: /\bSpringBootApplication\b/, not_if: 'spring' },
  { label: 'jpa_repository', re: /\bJpaRepository\b/, not_if: 'spring' },
  { label: 'nestjs', re: /\bNestJS\b/, not_if: 'nest' },
  { label: 'nest_decorator', re: /@nestjs\//, not_if: 'nest' },
  { label: 'jquery', re: /\bjQuery\b/, not_if: null }
];

/** Outils internes du skill de planification : contaminants hors de sa portée. */
const FORGE_INTERNAL = [
  /\bforge-guard\b/, /\bconsistency-check\b/, /\bcoverage-check\b/,
  /\bddl-exec\b/, /\bforge-exit\b/, /\bstate\.js\b/, /\bclient-liaison\b/,
  /\bFORGE\/scripts\//, /skills\/forge\//
];

/**
 * Vocabulaire de processus d'un projet source. On ne retient que les marqueurs
 * **non ambigus** : un terme générique comme « slice » peut appartenir au projet
 * lui-même, un nom de fichier d'un autre projet ne peut appartenir qu'à lui.
 */
const PROCESS_VOCAB = [
  /\.plan\.md/,
  /MIGRATION_ROADMAP/,
  /\bsource profiles?\b/i,
  /\bsuper-linter\b/i
];

const SELF_REFERENCE = [
  /\bper the profiles\b/i, /\bthe profiles\b/i, /\bthis profile\b/i,
  /\bas in the \w+ profile\b/i, /\bthe \w+ profile\b/i,
  /\baccording to the template\b/i, /\ble gabarit\b/i, /\bsource profile\b/i
];

/**
 * La stack se résout depuis les manifestes — **et, quand il n'y en a pas, depuis
 * l'endroit où elle est déclarée**.
 *
 * Le cas n'est pas rare : un projet en Phase 4 a une stack approuvée dans un
 * document de conventions, aucun `package.json`, et donc aucune piste. Sans ce
 * repli, le contrôle de contamination signalait `Next.js` dans un projet
 * Next.js — et le pire défaut d'un contrôle est celui qui apprend à le contourner.
 */
function detectStack(root) {
  const found = new Set();
  const read = f => { try { return fs.readFileSync(path.join(root, f), 'utf-8'); } catch { return ''; } };

  const sources = [
    read('package.json'), read('pubspec.yaml'),
    read('pom.xml') + read('build.gradle') + read('build.gradle.kts'),
    read('angular.json'), read('next.config.js') + read('next.config.mjs') + read('next.config.ts'),
    // Déclarations en prose : la stack approuvée d'un projet qui n'a pas encore
    // de manifeste, et l'entrée du jeu de règles elle-même.
    read('.forge/conventions.md'), read('.forge/architecture.md'), read('AGENTS.md')
  ].join('\n');

  for (const [name, sigs] of Object.entries(ECOSYSTEM_SIGNALS)) {
    for (const sig of sigs) {
      if (sig.test(sources)) { found.add(name); break; }
    }
  }
  return found;
}

function checkContamination(ctx) {
  const offenders = [];
  const hasForge = fs.existsSync(path.join(ctx.root, '.forge'));
  const stack = detectStack(ctx.root);

  const targets = [...ctx.contents.entries()];
  if (ctx.entry) targets.push([ctx.entry, ctx.entryText]);

  const scan = (re, kind, exempt) => {
    for (const [file, text] of targets) {
      const hits = (text.match(re) || []);
      if (hits.length) offenders.push({ kind, file: path.basename(file), hits: [...new Set(hits)].slice(0, 4) });
    }
  };

  for (const lib of FOREIGN_LIBS) {
    if (lib.not_if && stack.has(lib.not_if)) continue;
    scan(lib.re, `foreign_library:${lib.label}`);
  }
  // Les outils internes de Forge ne sont contaminants que hors de Forge.
  if (!hasForge) FORGE_INTERNAL.forEach(re => scan(re, 'forge_internal_tool'));

  PROCESS_VOCAB.forEach(re => scan(re, 'process_vocabulary'));
  SELF_REFERENCE.forEach(re => scan(re, 'template_self_reference'));

  return {
    name: 'no_cross_project_contamination',
    ok: offenders.length === 0,
    detail: { detected_stack: [...stack], forge_present: hasForge, offenders },
    rule: "Une règle qui cite une bibliothèque, un fichier ou un symbole que le projet n'a pas est une règle qui envoie l'agent chercher."
  };
}

/** 8. Aucune formulation qui sera ignorée : adjectif vague, ou pari assumé. */

// Formes francisées : `proprement` répond à « propre », `si besoin` à « as
// needed ». Le français n'a pas de mot pour « cleanly », mais il a dix formes
// pour « correctement fait » — d'où la liste.
const VAGUE = [
  /\b(carefully|properly|gracefully|robustly|cleanly|best practices?|make sure to|ensure that)\b/gi,
  /(proprement|correctement|soigneusement|convenablement|ad[ée]quatement|bien fait)/gi,
  /\b(as needed|where appropriate|as appropriate)\b/gi,
  /(si besoin|selon le cas|au besoin|le cas [ée]ch[ée]ant|qu'il le faut)/gi,
  /\b(bien practices|buenas practicas)\b/gi
];

const HEDGE = [
  /\b(probably|likely|presumably|more or less)\b[^\n]{0,60}\b(but|though|however|verify|confirm)\b/gi,
  /(probablement|sans doute|il me semble)[^\n]{0,60}\b(mais|cependant|toutefois|v[ée]rifier|v[ée]rifier)\b/gi
];

function checkClarity(ctx) {
  const offenders = [];
  const targets = [...ctx.contents.entries()];
  if (ctx.entry) targets.push([ctx.entry, ctx.entryText]);

  for (const [file, text] of targets) {
    // Normalisé : `revenir` doit répondre à `venir`.
    const body = deaccent(stripCodeSpans(text));
    const rel = path.relative(ctx.root, file);
    body.split('\n').forEach((line, i) => {
      // Une ligne de séparateur de tableau n'est pas une phrase.
      if (/^\s*\|?[\s|:-]*$/.test(line)) return;
      for (const re of VAGUE) {
        re.lastIndex = 0;
        const m = re.exec(line);
        if (m) offenders.push({ kind: 'vague_adjective', file: rel, line: i + 1, hit: m[0], excerpt: line.trim().slice(0, 90) });
      }
      for (const re of HEDGE) {
        re.lastIndex = 0;
        const m = re.exec(line);
        if (m) offenders.push({ kind: 'hedged_rule', file: rel, line: i + 1, hit: m[0].slice(0, 40), excerpt: line.trim().slice(0, 90) });
      }
    });
  }

  return {
    name: 'no_unenforceable_prose',
    ok: offenders.length === 0,
    detail: { offenders: offenders.slice(0, 30) },
    rule: "« proprement », « si besoin » et « probablement X, mais vérifie » portent l'autorité d'une règle avec la fiabilité d'une intuition."
  };
}

/**
 * 9. Un gate déclaré doit avoir une commande qui sort non-zéro.
 *
 * C'est le contrôle qui répond à « les contrôles sont-ils réellement
 * exécutables, ou l'agent se contente-t-il de déclarer qu'il les a faits ».
 *
 * Les mots-clés sont **trilingues** : un jeu de règles écrit en français ne
 * mentionne jamais « coverage ». Un contrôle monolingue validerait
 * systématiquement les jeux non-anglais, ce qui est exactement le pire défaut
 * d'un contrôle — il rapporte « tout va bien » sur ce qu'il n'a pas regardé.
 */
const GATE_REQUIRED = [
  { gate: 'lint',            re: /\blint\b|analyse statique|\beslintado\b/i },
  { gate: 'typecheck',       re: /\btypecheck\b|\btype-check\b|\btypage\b|verificacion de tipos/i },
  { gate: 'tests',           re: /\btests?\b|test suite|suite de tests|\bpruebas\b/i },
  { gate: 'coverage',        re: /\bcoverage\b|\bcouverture\b|\bcubierta\b/i },
  { gate: 'duplication',     re: /\bduplication\b|\bduplicacion\b|copypaste|copie[- ]coller/i },
  { gate: 'vulnerabilities', re: /\bvulnerab/i },
  { gate: 'review',          re: /\breview\b|\brevue\b|\brevision\b|code review|revue de code/i }
];

function checkGates(ctx) {
  // Le corpus est normalisé : `vulnérabilité` doit répondre à `vulnerab`.
  const corpus = deaccent([...ctx.contents.values()].join('\n') + '\n' + ctx.entryText);

  const missing = [];
  for (const g of GATE_REQUIRED) {
    if (!g.re.test(corpus)) missing.push({ gate: g.gate });
  }

  // Chaque gate nommé doit apparaître au moins une fois dans un bloc de
  // commande ou une ligne qui dit « sort 0 ».
  const hasCommandEvidence = /\bexit 0\b|\bsort 0\b|\bsortie 0\b|\bsalida 0\b|exit code|--threshold|--fail-on|--audit-level/.test(corpus);

  const offenders = [];
  if (missing.length) offenders.push({ problem: 'gate_never_mentioned', missing });
  if (!hasCommandEvidence) offenders.push({ problem: 'no_command_evidence' });

  return {
    name: 'gates_are_commands',
    ok: offenders.length === 0,
    detail: { required: GATE_REQUIRED.map(g => g.gate), has_command_evidence: hasCommandEvidence, offenders },
    rule: "Un seuil qui n'a pas de commande qui sort non-zéro n'est pas une porte : c'est une phrase."
  };
}

/** 10. Le budget est mesuré, pas estimé. */
function checkBudget(ctx) {
  const perFile = ctx.files.map(f => ({
    file: path.basename(f),
    lines: ctx.contents.get(f).split('\n').length
  })).sort((a, b) => b.lines - a.lines);
  const total = perFile.reduce((s, f) => s + f.lines, 0);
  const entryLines = ctx.entryText ? ctx.entryText.split('\n').length : 0;
  const over = perFile.filter(f => f.lines > 500);

  return {
    name: 'budget_measured',
    ok: over.length === 0,
    detail: { total_rules_lines: total, entry_lines: entryLines, over_ceiling: over, per_file: perFile },
    rule: "Sur une cible sans scoping, le budget est le total du répertoire : découper un fichier n'y change rien, le glob le charge de toute façon."
  };
}

/* ------------------------------------------------------------------ *
 * Point d'entrée
 * ------------------------------------------------------------------ */

const CHECKS = [
  checkWiring,
  checkIndex,
  checkPlaceholders,
  checkCrossRefs,
  checkThresholds,
  checkForgeCoupling,
  checkContamination,
  checkClarity,
  checkGates,
  checkBudget
];

function main() {
  const args = process.argv.slice(2);
  const json = args.includes('--json');
  const quiet = args.includes('--quiet');
  const project = path.resolve(args.find(a => !a.startsWith('--')) || '.');

  if (!fs.existsSync(project)) {
    console.log(JSON.stringify({ error: 'project_not_found', path: project }));
    process.exit(1);
  }

  const ctx = load(project);
  const results = [];
  for (const fn of CHECKS) {
    try {
      results.push(fn(ctx));
    } catch (e) {
      results.push({ name: fn.name, ok: false, detail: { error: 'check_crashed', message: e.message, stack: e.stack } });
    }
  }

  const failed = results.filter(r => !r.ok);

  if (json) {
    console.log(JSON.stringify({
      project,
      rules_dir: ctx.rulesDir ? path.relative(project, ctx.rulesDir) : null,
      files: ctx.files.length,
      passed: results.length - failed.length,
      failed: failed.length,
      checks: results
    }, null, 2));
  } else if (!quiet || failed.length) {
    const lines = [];
    lines.push(`rules-selftest — ${path.basename(project)}`);
    lines.push(`  règles : ${ctx.files.length} fichier(s)${ctx.rulesDir ? ` dans ${path.relative(project, ctx.rulesDir)}` : ''}`);
    lines.push('');
    for (const r of results) {
      const mark = r.ok ? 'PASS' : 'FAIL';
      lines.push(`[${mark}] ${r.name}`);
      if (!r.ok && !quiet) {
        lines.push(`       ${r.rule}`);
        lines.push(`       ${JSON.stringify(r.detail).slice(0, 600)}`);
      }
    }
    lines.push('');
    lines.push(`${results.length - failed.length}/${results.length} contrôles passés`);
    console.log(lines.join('\n'));
  }

  process.exit(failed.length ? 1 : 0);
}

if (require.main === module) main();
module.exports = { CHECKS, load, extractThresholds, normSection };