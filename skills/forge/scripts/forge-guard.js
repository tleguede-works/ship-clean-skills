#!/usr/bin/env node
'use strict';

/**
 * forge-guard.js — les garde-fous déterministes de Forge.
 *
 * SKILL.md *décrit* des règles ; ce script les *applique*. Chaque point 1-4 du
 * cahier des charges (livrables dans .forge, séparation état/document,
 * synchronisation des statuts, projet courant vs projet de référence) est
 * vérifié ici de façon mécanique, et échoue avec un code de sortie non nul.
 *
 * Commandes :
 *   paths       tout livrable enregistré est dans .forge/ et sur son chemin canonique
 *   strays      aucun livrable Forge fuera de .forge/ (détection par front matter)
 *   state       state.json respecte ALLOWED/FORBIDDEN keys, le vocabulaire de statuts, les hashs,
 *               `derived_from` n'est pas vide, aucune case « À DÉCIDER » bloquante
 *   sync        state.json (autorité) vs front matter (miroir) — avec --fix
 *   placeholders  aucun gabarit {{NON_RESOLU}} résiduel dans un livrable
 *   all         tout ce qui précède, dans l'ordre d'un gate de phase
 *
 * Zéro dépendance. Lecture seule par défaut : alone, seul `sync --fix` écrit.
 */

const fs = require('fs');
const path = require('path');
const L = require('./lib/forge-lib');

/* Gabarits attendus : {{NOM_EN_MAJUSCULES}}. Un reste = rendu de template incomplet. */
const PLACEHOLDER_RE = /\{\{\s*[A-Z0-9_]{2,}\s*\}\}/g;

/** Valeur de state.json suspecte d'être du contenu de document. */
const LONG_VALUE_THRESHOLD = 2000;

const results = { checks: [], pass: true };

function record(name, pass, details) {
  results.checks.push({ check: name, status: pass ? 'pass' : 'fail', ...details });
  if (!pass) results.pass = false;
  return pass;
}

/**
 * Un contrôle volontairement non appliqué.
 *
 * Saute ≠ passe. C'est une distinction qui compte : un contrôle vert sur
 * zéro contrôle exécuté donne l'illusion d'une base vérifiée, alors que rien
 * n'a été regardé. Un `skip` nomme la raison, pour que la sortie dise ce qu'elle
 * n'a pas couvert.
 */
function skip(name, reason) {
  results.checks.push({ check: name, status: 'skip', reason });
}

function loadStateOrFail(root) {
  const state = L.readState(root);
  if (!state) {
    L.fail({ error: 'no_state', path: L.statePath(root), hint: `node "$FORGE/scripts/state.js" init ${root} "<Nom>"` });
  }
  return state;
}

/* ------------------------------------------------------------------ *
 * paths — livrables dans .forge, sur le chemin canonique
 * ------------------------------------------------------------------ */

function checkPaths(root) {
  const state = loadStateOrFail(root);
  const forgeDir = path.join(root, L.FORGE_DIR);
  const offenders = [];

  const entries = [
    ...Object.entries(state.deliverables || {}).map(([k, v]) => ({ kind: 'deliverable', key: k, ...v })),
    ...Object.entries(state.screens || {}).map(([k, v]) => ({ kind: 'screen', key: k, ...v })),
    ...Object.entries(state.slices || {}).filter(([, v]) => v.plan_path).map(([k, v]) => ({ kind: 'slice', key: k, path: v.plan_path, ...v })),
    ...Object.entries(state.foundations || {}).filter(([, v]) => v.plan_path).map(([k, v]) => ({ kind: 'foundation', key: k, path: v.plan_path, ...v }))
  ];

  for (const e of entries) {
    const rel = e.path;
    if (!rel) continue;
    const abs = L.toAbs(root, rel);
    const problems = [];

    if (path.isAbsolute(rel)) {
      problems.push('absolute_path');
    }
    if (!L.isInside(forgeDir, abs)) {
      problems.push('outside_forge_dir');
    }
    // Un chemin qui passe par un dossier temporaire est le symptôme exact du bug
    // « le livrable a fini dans un dossier temporaire ».
    const segments = path.normalize(rel).split(/[\\/]/);
    if (segments.some(s => L.NON_DELIVERABLE_DIRS.includes(s))) {
      problems.push('temp_or_non_deliverable_dir');
    }
    if (/^\/?(tmp|var\/tmp|private\/tmp)\b/.test(rel)) {
      problems.push('system_temp_dir');
    }

    const canonical = L.CANONICAL_LAYOUT[e.key];
    if (canonical && e.kind === 'deliverable' && path.normalize(canonical) !== path.normalize(rel)) {
      problems.push('non_canonical_path');
    }

    if (problems.length) offenders.push({ kind: e.kind, key: e.key, path: rel, problems, expected: canonical || null });
  }

  record('deliverables_in_forge_dir', offenders.length === 0, {
    checked: entries.length,
    forge_dir: forgeDir,
    offenders,
    rule: `Tout livrable Forge vit dans <anchor>/${L.FORGE_DIR}/, jamais ailleurs.`
  });
}

/* ------------------------------------------------------------------ *
 * strays — livrables égarés hors .forge
 * ------------------------------------------------------------------ */

function scanDirForStrays(dir, root, out, depth = 0) {
  if (depth > 6 || !fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === '.git') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === L.FORGE_DIR) continue;
      scanDirForStrays(full, root, out, depth + 1);
    } else if (/\.mdx?$/.test(entry.name) || /\.json$/.test(entry.name)) {
      if (L.looksLikeForgeDeliverable(full)) {
        out.push({ path: path.relative(root, full), detected_by: 'front_matter' });
      }
    }
  }
}

function checkStrays(root, relocate) {
  const state = loadStateOrFail(root);
  const found = [];
  scanDirForStrays(root, root, found);

  // Un projet de référence peut légitimement contenir ses propres .forge.
  // On l'exclut de l'alerte, et on ne le modifie jamais.
  const refPaths = (state.reference_projects || []).map(r => path.resolve(r.path)).filter(Boolean);
  const inReferences = found.filter(f => refPaths.some(rp => L.isInside(rp, path.join(root, f.path))));
  const actionable = found.filter(f => !inReferences.some(r => r.path === f.path));

  let relocated = [];
  if (relocate) {
    for (const f of actionable) {
      const from = path.join(root, f.path);
      const key = path.basename(f.path).replace(/\.mdx?$/, '');
      const canonical = L.CANONICAL_LAYOUT[key] || `${L.FORGE_DIR}/design/screens/${key}.md`;
      const to = L.toAbs(root, canonical);
      if (fs.existsSync(to)) continue;
      fs.mkdirSync(path.dirname(to), { recursive: true });
      fs.copyFileSync(from, to);
      relocated.push({ from: f.path, to: canonical });
    }
    if (relocated.length) L.appendLog(root, { type: 'stray_relocated', count: relocated.length, files: relocated });
  }

  record('no_stray_deliverables', actionable.length === 0, {
    scanned_root: root,
    strays: actionable,
    relocated,
    ignored_in_reference_projects: inReferences,
    rule: 'Un livrable Forge (front matter type: prd|roadmap|architecture|...) doit être dans .forge/.'
  });
}

/* ------------------------------------------------------------------ *
 * state — schéma, vocabulaire, intégrité des chemins et des hashs
 * ------------------------------------------------------------------ */

/** Marche récursivement l'objet et collecte les violations de schéma. */
function walkState(node, pathParts, out) {
  if (out.length > 200) return;
  if (Array.isArray(node)) {
    node.forEach((v, i) => walkState(v, [...pathParts, String(i)], out));
    return;
  }
  if (!node || typeof node !== 'object') return;

  for (const [key, value] of Object.entries(node)) {
    const at = [...pathParts, key].join('.');

    if (L.FORBIDDEN_STATE_KEYS.includes(key)) {
      out.push({ problem: 'forbidden_key', at, key, hint: 'state.json ne contient pas de contenu de document.' });
    }
    if (pathParts.length === 0 && !L.ALLOWED_STATE_KEYS.includes(key)) {
      out.push({ problem: 'unknown_root_key', at, key, allowed: L.ALLOWED_STATE_KEYS });
    }
    if (typeof value === 'string' && value.length > LONG_VALUE_THRESHOLD) {
      out.push({
        problem: 'content_in_state',
        at,
        length: value.length,
        hint: 'Bloc de texte volumineux dans state.json : le document doit être un livrable Markdown séparé.'
      });
    }
    walkState(value, [...pathParts, key], out);
  }
}

function checkStateSchema(root) {
  const state = loadStateOrFail(root);
  const violations = [];
  walkState(state, [], violations);

  record('state_schema_clean', violations.length === 0, {
    version: state.version,
    violations,
    rule: 'state.json = métadonnées uniquement (statuts, IDs, chemins, hashs, index). Jamais de contenu.'
  });
}

function checkStatusVocab(root) {
  const state = loadStateOrFail(root);
  const bad = [];

  const check = (kind, bucket, vocabKey) => {
    const vocab = L.STATUS_VOCAB[vocabKey];
    for (const [key, entry] of Object.entries(bucket || {})) {
      if (entry.status && !vocab.includes(entry.status)) {
        bad.push({ kind, key, status: entry.status, allowed: vocab });
      }
    }
  };

  check('deliverable', state.deliverables, 'document');
  check('screen', state.screens, 'document');
  check('slice', state.slices, 'slice');
  check('foundation', state.foundations, 'slice');
  for (const [key, p] of Object.entries(state.phases || {})) {
    if (p.status && !L.STATUS_VOCAB.phase.includes(p.status)) {
      bad.push({ kind: 'phase', key, status: p.status, allowed: L.STATUS_VOCAB.phase });
    }
  }

  record('status_vocabulary_valid', bad.length === 0, { invalid: bad });
}

function checkPathsExist(root) {
  const state = loadStateOrFail(root);
  const missing = [];
  for (const [key, d] of Object.entries(state.deliverables || {})) {
    if (d.status === 'not_started' || !d.path) continue;
    if (!fs.existsSync(L.toAbs(root, d.path))) missing.push({ deliverable: key, path: d.path });
  }
  for (const [key, s] of Object.entries(state.screens || {})) {
    if (s.path && !fs.existsSync(L.toAbs(root, s.path))) missing.push({ screen: key, path: s.path });
  }
  record('deliverable_files_present', missing.length === 0, { missing });
}

/**
 * La phase courante a-t-elle produit ce qu'elle doit produire ?
 *
 * `deliverable_files_present` ne peut pas le dire : il boucle sur les
 * livrables *déclarés*, donc zéro déclaration donne zéro vérification et un
 * contrôle vert. Ce contrôle regarde l'autre côté — la phase, et ce que le
 * contrat `PHASE_REQUIREMENTS` en attend. Il échoue donc sur une phase
 * genuinely inachevée, ce qui est exactement le cas qu'il faut voir.
 */
function checkPhaseRequirements(root) {
  const state = loadStateOrFail(root);

  // Si la lib n'expose pas le contrat, ce contrôle ne doit pas disparaître en
  // silence : un `return` précoce transforme une porte en décor, et le rapport
  // affiche un vert qui ne couvre rien. Mieux vaut un échec bruyant.
  if (typeof L.missingPhaseRequirements !== 'function' || !L.PHASE_KEYS) {
    record('current_phase_has_deliverables', false, {
      error: 'forge-lib n\'expose pas PHASE_KEYS / missingPhaseRequirements',
      rule: 'Un contrôle qui ne peut pas s\'exécuter doit échouer, pas rendre la main.'
    });
    return;
  }

  const current = state.current_phase;
  // On ne juge que la phase EN COURS, pas les phases futures : le roadmap n'a
  // pas à exister tant qu'on n'y est pas.
  const currentKey = L.PHASE_KEYS[parseInt(current, 10)];
  if (!currentKey) return;

  // `complete-phase` avance `current_phase` à la phase **suivante** dès qu'il
  // approuve. La phase suivante est donc « courante » alors qu'elle n'a pas
  // commencé — et ce contrôle échouait systématiquement juste après chaque
  // transition, en annonçant que le roadmap manquait alors que personne n'avait
  // encore commencé à l'écrire.
  //
  // Un contrôle qui produit ce signal au moment exact où l'on n'a rien à faire
  // s'apprend à ignorer : c'est la seule façon de « passer ». On ne juge donc
  // que les phases dont le statut n'est pas `not_started`.
  const phaseStatus = (state.phases || {})[currentKey] || {};
  if (phaseStatus.status === 'not_started') {
    skip('current_phase_has_deliverables',
      `phase ${currentKey} pas encore commencée — le contrat ne s'applique qu'à une phase commencée`);
    return;
  }

  const buckets = {
    deliverable: state.deliverables || {},
    screen: state.screens || {},
    slice: state.slices || {},
    foundation: state.foundations || {}
  };
  const missing = L.missingPhaseRequirements(state, currentKey);

  record('current_phase_has_deliverables', missing.length === 0, {
    current_phase: current,
    phase: currentKey,
    phase_status: phaseStatus.status,
    missing,
    declared: Object.fromEntries(
      Object.entries(buckets).map(([k, v]) => [k, Object.keys(v).length])
    ),
    rule: 'Un contrôle vert sur zéro livrable déclaré confirme le vide au lieu de le ' +
          'signaler. Le gate de la phase refusera cette approbation de toute façon ; ' +
          'il vaut mieux le voir ici.'
  });
}

function checkHashes(root) {
  const state = loadStateOrFail(root);
  const drifted = [];
  for (const [key, d] of Object.entries(state.deliverables || {})) {
    if (!d.path || !d.content_hash) continue;
    const current = L.contentHash(L.toAbs(root, d.path));
    if (current && current !== d.content_hash) {
      drifted.push({
        deliverable: key, path: d.path,
        recorded: d.content_hash, actual: current,
        hint: 'Édition hors bande : le corps a changé sans passer par state.js hash.'
      });
    }
  }
  record('content_hashes_current', drifted.length === 0, { drifted });
}

/* ------------------------------------------------------------------ *
 * provenance — `derived_from` est le contrat de lecture d'un validateur
 * ------------------------------------------------------------------ */

/**
 * Un `derived_from` déclaré ne doit pas être vide.
 *
 * `derived_from` dit à un validateur Fast Track quels fichiers lire avec
 * l'artefact. Une version de ce front matter qui ne savait pas rendre une
 * séquence en bloc le réduisait à une chaîne vide **au premier changement de
 * statut** — donc sans erreur, sans journal, et avec tous les garde-fous au
 * vert. Le validateur se retrouvait ensuite à lire un artefact sans ses
 * sources, et sa conclusion ne portait plus sur le document.
 *
 * Le contrôle est volontairement faible : il ne demande pas *ce que* le
 * `derived_from` contient, seulement qu'il contienne quelque chose. Une trace
 * vide est la seule forme de ce défaut qui soit mécaniquement détectable — et
 * c'est celle qui se produit.
 */
function checkProvenance(root) {
  const state = loadStateOrFail(root);
  const targets = [
    ...Object.entries(state.deliverables || {}).filter(([, d]) => d.path).map(([k, d]) => ({ kind: 'deliverable', key: k, path: d.path })),
    ...Object.entries(state.screens || {}).filter(([, s]) => s.path).map(([k, s]) => ({ kind: 'screen', key: k, path: s.path })),
    ...Object.entries(state.slices || {}).filter(([, s]) => s.plan_path).map(([k, s]) => ({ kind: 'slice', key: k, path: s.plan_path })),
    ...Object.entries(state.foundations || {}).filter(([, f]) => f.plan_path).map(([k, f]) => ({ kind: 'foundation', key: k, path: f.plan_path }))
  ];

  const empty = [];
  for (const t of targets) {
    const abs = L.toAbs(root, t.path);
    if (!fs.existsSync(abs)) continue;
    const fm = L.readFrontMatter(abs);
    if (!fm) continue;
    if (!Object.prototype.hasOwnProperty.call(fm.data, 'derived_from')) continue;
    const v = fm.data.derived_from;
    const isEmpty = v === null || v === undefined ||
      (typeof v === 'string' && v.trim() === '') ||
      (Array.isArray(v) && v.length === 0);
    if (isEmpty) {
      empty.push({
        kind: t.kind, key: t.key, path: t.path,
        why: '`derived_from` est déclaré mais vide : les fichiers sources de cet artefact ne sont plus liés.'
      });
    }
  }
  record('derived_from_non_empty', empty.length === 0, {
    checked: targets.length,
    offenders: empty,
    rule: "Un `derived_from` vide supprime le contrat de lecture du validateur sans laisser de trace. " +
          "Il est produit par un changement de statut, pas par une édition : c'est pour cela qu'un garde-fou le vérifie."
  });
}

/* ------------------------------------------------------------------ *
 * Slots non tranchés — `À DÉCIDER`
 * ------------------------------------------------------------------ */

const UNDECIDED_RE = /À\s*DÉCIDER|TODO\s*:\s*décider/i;

/** Un marqueur cité enters guillemets documente la convention ; il n'est pas une case. */
function stripCodeSpans(line) {
  return line.replace(/`[^`]*`/g, ' `` ');
}

/**
 * Un gabarit de Forge porte `À DÉCIDER EN PHASE 4` tant que la décision n'est
 * pas prise. C'est correct tant que la Phase 4 n'est pas franchie.
 *
 * Après, c'est un défaut : le document est présenté comme verrouillé alors
 * qu'il contient une case vide. La checklist de gate du gabarit l'écrit
 * (« aucune section marquée `À DÉCIDER EN PHASE 4` ne subsiste après la
 * Phase 4 ») et aucun contrôle ne le vérifiait.
 *
 * Avant la Phase 4, une case non tranchée n'est pas un échec — c'est
 * exactement l'usage prévu du gabarit. Ce qui n'est pas acceptable, en
 * revanche, c'est qu'une décision **bloquante** soit indiscernable d'une
 * décision différable : d'où la séparation `À DÉCIDER EN PHASE 4` /
 * `À DÉCIDER AVANT LA PHASE 1` dans le gabarit.
 */
function checkUndecidedSlots(root) {
  const state = loadStateOrFail(root);
  const architectureApproved = !!(state.phases || {})['4_architecture'] &&
    state.phases['4_architecture'].status === 'approved';

  const targets = [
    ...Object.entries(state.deliverables || {}).filter(([, d]) => d.path).map(([k, d]) => ({ key: k, path: d.path })),
    ...Object.entries(state.screens || {}).filter(([, s]) => s.path).map(([k, s]) => ({ key: k, path: s.path }))
  ];

  const found = [];
  for (const t of targets) {
    const abs = L.toAbs(root, t.path);
    if (!fs.existsSync(abs)) continue;
    const raw = fs.readFileSync(abs, 'utf-8');
    raw.split('\n').forEach((line, idx) => {
      if (!UNDECIDED_RE.test(stripCodeSpans(line))) return;
      found.push({ key: t.key, path: t.path, line: idx + 1, excerpt: line.trim().slice(0, 120) });
    });
  }

  const BLOCKING = /AVANT\s+LA\s+PHASE\s+1/;
  const blocking = found.filter(f => BLOCKING.test(f.excerpt));
  const differe = found.filter(f => !BLOCKING.test(f.excerpt));

  if (architectureApproved) {
    record('no_undecided_slots', found.length === 0, {
      phase: '4_architecture approved',
      offenders: found,
      rule: "Un document verrouillé qui contient encore « À DÉCIDER » est un document dont la case vide est devenue invisible."
    });
    return;
  }

  record('no_undecided_slots', blocking.length === 0, {
    phase: state.current_phase,
    state: blocking.length ? 'blocking' : 'expected_before_phase_4',
    blocking,
    expected: differe,
    rule: "« À DÉCIDER EN PHASE 4 » est l'usage normal du gabarit avant la Phase 4. " +
          "« À DÉCIDER AVANT LA PHASE 1 » ne l'est pas : une décision dont dépendent le fournisseur d'identité, " +
          "le mode d'hébergement ou le recrutement ne peut pas attendre la Phase 4."
  });
}

/* ------------------------------------------------------------------ *
 * sync — state.json (autorité) vs front matter (miroir)
 * ------------------------------------------------------------------ */

function collectStatusFiles(state) {
  const out = [];
  for (const [key, e] of Object.entries(state.deliverables || {})) if (e.path) out.push({ kind: 'deliverable', key, relPath: e.path, stateStatus: e.status });
  for (const [key, e] of Object.entries(state.screens || {})) if (e.path) out.push({ kind: 'screen', key, relPath: e.path, stateStatus: e.status });
  for (const [key, e] of Object.entries(state.slices || {})) if (e.plan_path) out.push({ kind: 'slice', key, relPath: e.plan_path, stateStatus: e.status });
  for (const [key, e] of Object.entries(state.foundations || {})) if (e.plan_path) out.push({ kind: 'foundation', key, relPath: e.plan_path, stateStatus: e.status });
  return out;
}

function checkSync(root, fix) {
  const state = loadStateOrFail(root);
  const items = collectStatusFiles(state);
  const divergences = [];

  for (const item of items) {
    const abs = L.toAbs(root, item.relPath);
    if (!fs.existsSync(abs)) {
      divergences.push({ ...item, fileStatus: null, reason: 'file_missing' });
      continue;
    }
    const fm = L.readFrontMatter(abs);
    if (!fm) {
      divergences.push({ ...item, fileStatus: null, reason: 'no_front_matter' });
      continue;
    }
    if ((fm.data.status || null) !== (item.stateStatus ?? null)) {
      divergences.push({ ...item, fileStatus: fm.data.status ?? null, reason: 'status_mismatch' });
    }
  }

  let fixed = 0;
  if (fix) {
    for (const d of divergences) {
      if (d.reason !== 'status_mismatch') continue;
      const abs = L.toAbs(root, d.relPath);
      const fm = L.readFrontMatter(abs);
      L.writeFrontMatter(abs, { ...fm.data, status: d.stateStatus });
      fixed++;
      d.resolved = true;
    }
    if (fixed) {
      L.appendLog(root, { type: 'divergence_fixed', count: fixed, files: divergences.filter(d => d.resolved).map(d => d.relPath) });
    }
  }

  // Un écart corrigé n'est plus un écart : seuls les cas non repairables
  // (fichier manquant, front matter absent) font échouer le check.
  const remaining = fix ? divergences.filter(d => !d.resolved) : divergences;

  record('state_frontmatter_in_sync', remaining.length === 0, {
    authority: 'state.json',
    mirror: 'front matter status:',
    checked: items.length,
    divergences: fix && fixed ? remaining : divergences,
    fixed,
    rule: "state.json fait foi. En cas d'écart, state.js set-status réécrit le front matter."
  });
}

/* ------------------------------------------------------------------ *
 * placeholders — rendu de gabarit incomplet
 * ------------------------------------------------------------------ */

function checkPlaceholders(root) {
  const state = loadStateOrFail(root);
  const offenders = [];

  const files = [
    ...Object.entries(state.deliverables || {}).filter(([, d]) => d.path).map(([k, d]) => ({ k, p: d.path })),
    ...Object.entries(state.screens || {}).filter(([, s]) => s.path).map(([k, s]) => ({ k, p: s.path }))
  ];

  for (const f of files) {
    const abs = L.toAbs(root, f.p);
    if (!fs.existsSync(abs)) continue;
    const raw = fs.readFileSync(abs, 'utf-8');
    const found = (stripCodeSpans(raw).match(PLACEHOLDER_RE) || []);
    if (found.length) offenders.push({ deliverable: f.k, path: f.p, placeholders: [...new Set(found)] });
  }

  record('no_unresolved_placeholders', offenders.length === 0, {
    offenders,
    rule: 'Un livrable ne contient jamais de {{PLACEHOLDER}} hors guillemets : il est généré ' +
          'depuis un template, pas recopié. Un placeholder cité entre guillemets documente la ' +
          'convention, ce n\'est pas une case ouverte.'
  });
}

/* ------------------------------------------------------------------ *
 * anchor — le projet courant n'est pas le projet de référence
 * ------------------------------------------------------------------ */

function checkAnchor(rootArg) {
  const start = path.resolve(rootArg || process.cwd());
  const { root, source, chain } = L.resolveAnchor(start);

  // Rassemble les déclarations de référence visibles depuis la session, pour
  // attraper le cas où le legacy n'a pas de .forge mais est déclaré ailleurs.
  // Recherche bornée : entre le point de départ et le parent de l'anchor, plus
  // les frères de l'anchor. Jamais de remontée jusqu'à la racine du système.
  const parent = path.dirname(root);
  const refs = new Map();
  const dirs = new Set([parent]);
  let cursor = start;
  for (let hops = 0; hops < 8; hops++) {
    dirs.add(cursor);
    if (cursor === parent) break;
    const up = path.dirname(cursor);
    if (up === cursor) break;
    cursor = up;
  }
  try {
    for (const entry of fs.readdirSync(parent, { withFileTypes: true })) {
      if (entry.isDirectory() && entry.name !== 'node_modules' && entry.name !== '.git') {
        dirs.add(path.join(parent, entry.name));
      }
    }
  } catch { /* parent illisible : on s'en tient aux répertoires connus */ }

  for (const dir of dirs) {
    let s;
    try { s = L.readState(dir); } catch { continue; }
    if (!s) continue;
    for (const ref of s.reference_projects || []) {
      if (ref && ref.path) refs.set(path.resolve(ref.path), ref.name || path.basename(ref.path));
    }
  }

  const hijackedBy = refs.get(path.resolve(root));

  record('anchor_is_current_project', !hijackedBy, {
    start,
    anchor: root,
    anchor_source: source,
    searched: chain,
    declared_references: [...refs.entries()].map(([p, n]) => ({ name: n, path: p })),
    hijacked_by: hijackedBy || null,
    rule: "Un projet de référence (Legacy) accessible depuis la session ne doit jamais devenir l'anchor."
  });
}

/* ------------------------------------------------------------------ *
 * facts — un fait, une maison
 * ------------------------------------------------------------------ */

/**
 * Compare les pins de versions et les plages d'ID entre tous les fichiers qui
 * les déclarent.
 *
 * On ne peut pas détecter toute duplication — c'est indécidable en général.
 * Ce qu'on détecte, c'est la classe de drift qui a réellement fait dérailler un
 * projet : une version annoncée dans six fichiers, résolue sur deux, et fausse
 * dans trois — un constat marqué « résolu » parce que les deux premiers
 * consultés concordaient.
 *
 * Portée : .forge/, AGENTS.md, .opencode/rules/, et les manifestes.
 */
const PIN_PATTERNS = [
  // pubspec.yaml / package.json
  { re: /^\s{2}([a-z0-9_]+):\s*[\^~]?(\d+\.\d+\.\d+[^\s#]*)\s*$/gm, ecosystems: ['pub'] },
  { re: /"([a-z0-9@/._-]+)":\s*"\^?~?(\d+\.\d+\.\d+[^"]*)"/g, ecosystems: ['npm'] },
  // tableaux markdown : | `pkg` | 1.2.3 | ... |
  { re: /\|\s*`?([a-z0-9@/._-]{2,})`?\s*\|\s*`?[\^~]?(\d+\.\d+\.\d+[^|`\s]*)`?/g, ecosystems: ['table'] }
];

function collectPins(root) {
  const found = new Map();
  const add = (file, pkg, version) => {
    const key = pkg.toLowerCase();
    if (!found.has(key)) found.set(key, []);
    found.get(key).push({ file: path.relative(root, file), version });
  };

  const roots = [
    path.join(root, '.forge'),
    path.join(root, '.opencode', 'rules'),
    path.join(root, '.opencode'),
    path.join(root, 'rules'),
    root
  ];

  const files = new Set();
  for (const r of roots) {
    if (!fs.existsSync(r)) continue;
    if (fs.statSync(r).isFile()) { files.add(r); continue; }
    for (const f of L.listFilesRecursive(r)) {
      if (/\.(md|yaml|yml|json)$/.test(f) && !/node_modules|pubspec\.lock|package-lock|yarn\.lock|Cargo\.lock/.test(f)) {
        files.add(f);
      }
      // borne : on ne veut pas scanner un lockfile de 20 000 lignes
    }
  }

  for (const file of files) {
    let src;
    try { src = fs.readFileSync(file, 'utf-8'); } catch { continue; }
    for (const { re } of PIN_PATTERNS) {
      re.lastIndex = 0;
      let m;
      while ((m = re.exec(src)) !== null) {
        // Ignore les lignes de prose qui ressemblent à des versions.
        if (/^(http|https)$/i.test(m[1])) continue;
        add(file, m[1], m[2].trim());
      }
    }
  }
  return found;
}

function checkFacts(root) {
  const pins = collectPins(root);

  // Un fichier de règles est un ENTRY POINT lu par l'agent : c'est là qu'une
  // version fausse est la plus coûteuse, parce qu'elle guide les choix.
  const ENTRY_POINTS = ['AGENTS.md', '.opencode/rules/', '.forge/conventions.md'];
  const isEntry = f => ENTRY_POINTS.some(e => f.includes(e));

  const conflicts = [];
  const hot = [];

  for (const [pkg, instances] of pins) {
    if (instances.length < 2) continue;
    const versions = [...new Set(instances.map(i => i.version))];
    if (versions.length > 1) {
      const byVersion = {};
      for (const i of instances) (byVersion[i.version] = byVersion[i.version] || []).push(i.file);
      conflicts.push({
        package: pkg,
        versions: versions.sort(),
        by_version: byVersion,
        entry_points_affected: instances.filter(i => isEntry(i.file)).map(i => i.file)
      });
    } else if (instances.length >= 3) {
      hot.push({ package: pkg, version: versions[0], homes: instances.length, files: instances.map(i => i.file) });
    }
  }

  conflicts.sort((a, b) => (b.entry_points_affected.length - a.entry_points_affected.length) || (b.versions.length - a.versions.length));

  record('version_pins_agree', conflicts.length === 0, {
    scanned_packages: pins.size,
    conflicts,
    // Info, pas un échec : c'est le terrain miné qui produit les conflits.
    duplicated_facts: hot,
    rule: "Un fait technique vit dans un seul fichier. Les versions se résolvent depuis le manifeste, elles ne se recopient pas."
  });
}

/* ------------------------------------------------------------------ *
 * hash-check — la dérive de hash, en lecture seule
 * ------------------------------------------------------------------ */

function checkHashDrift(root) {
  const state = loadStateOrFail(root);
  const drifted = [];
  for (const [key, d] of Object.entries(state.deliverables || {})) {
    if (!d.path || !d.content_hash) continue;
    const current = L.contentHash(L.toAbs(root, d.path));
    if (current && current !== d.content_hash) {
      drifted.push({ deliverable: key, path: d.path, recorded: d.content_hash, actual: current });
    }
  }
  record('no_content_drift', drifted.length === 0, {
    drifted,
    fix: 'node "$FORGE/scripts/state.js" hash <anchor> <deliverable>  — après avoir relu le changement',
    rule: "Un hash qui ne match plus signifie une édition hors bande : le document est stale."
  });
}

/* ------------------------------------------------------------------ *
 * CLI
 * ------------------------------------------------------------------ */

const CHECKS = {
  paths: (root) => checkPaths(root),
  strays: (root, flags) => checkStrays(root, flags.includes('--relocate')),
  state: (root) => {
    checkStateSchema(root);
    checkStatusVocab(root);
    checkPathsExist(root);
    checkPhaseRequirements(root);
    checkHashes(root);
    checkProvenance(root);
    checkUndecidedSlots(root);
  },
  sync: (root, flags) => checkSync(root, flags.includes('--fix')),
  placeholders: (root) => checkPlaceholders(root),
  facts: (root) => checkFacts(root),
  'hash-check': (root) => checkHashDrift(root),
  anchor: (root) => checkAnchor(root),
  all: (root, flags) => {
    checkAnchor(root);
    checkPaths(root);
    checkStrays(root, flags.includes('--relocate'));
    checkStateSchema(root);
    checkStatusVocab(root);
    checkPathsExist(root);
    checkPhaseRequirements(root);
    checkHashes(root);
    checkProvenance(root);
    checkUndecidedSlots(root);
    checkSync(root, flags.includes('--fix'));
    checkPlaceholders(root);
    checkHashDrift(root);
    checkFacts(root);
  }
};

function main() {
  const argv = process.argv.slice(2);
  const command = argv[0] || 'all';
  const root = path.resolve(argv[1] && !argv[1].startsWith('--') ? argv[1] : process.cwd());
  const flags = argv.filter(a => a.startsWith('--'));

  if (!CHECKS[command]) {
    L.fail({
      error: 'unknown_command', command,
      usage: {
        paths: 'forge-guard paths <root>',
        strays: 'forge-guard strays <root> [--relocate]',
        state: 'forge-guard state <root>',
        sync: 'forge-guard sync <root> [--fix]',
        placeholders: 'forge-guard placeholders <root>',
        facts: 'forge-guard facts <root>',
        'hash-check': 'forge-guard hash-check <root>',
        anchor: 'forge-guard anchor [start]',
        all: 'forge-guard all <root> [--fix] [--relocate]',
        note: 'Tous les contrôles de `state` sont aussi dans `all`.'
      }
    });
  }

  CHECKS[command](root, flags);

  const failed = results.checks.filter(c => c.status === 'fail');
  L.out({
    command: `forge-guard ${command}`,
    anchor: root,
    pass: results.pass,
    failed: failed.map(c => c.check),
    checks: results.checks
  });

  if (!results.pass) process.exit(1);
}

main();
