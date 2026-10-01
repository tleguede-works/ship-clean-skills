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
 *   fast-track   les conditions d'entrée du mode Fast Track, et le refus nommé
 *   all         tout ce qui précède — sauf fast-track, qui se demande (voir § CLI)
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

/**
 * Tous les artefacts qui portent un `content_hash`, pas seulement les livrables.
 *
 * `state.js register` enregistre un `content_hash` pour les écrans et pour les
 * plans de slice comme pour les livrables — mais le contrôle ne lisait que
 * `deliverables`. Un écran donc pouvait être réécrit après son enregistrement,
 * ligne par ligne, sans qu'aucun garde-fou ne le voie.
 *
 * Constaté sur un test grandeur nature : huit écrans réécrits après leur
 * enregistrement (ratios recalculés, règles d'usage levées), et
 * `content_hashes_current` resté au vert. Le hash enregistré était périmé — donc
 * faux, et personne ne le savait.
 *
 * Un hash enregistré et jamais relu n'est pas une protection : c'est une
 * information qui ment.
 */
function hashTargets(state) {
  const targets = [];
  for (const [key, d] of Object.entries(state.deliverables || {})) {
    if (d.path) targets.push({ kind: 'deliverable', key, path: d.path });
  }
  for (const [key, d] of Object.entries(state.screens || {})) {
    if (d.path) targets.push({ kind: 'screen', key, path: d.path });
  }
  for (const [key, d] of Object.entries(state.slices || {})) {
    if (d.plan_path) targets.push({ kind: 'slice', key, path: d.plan_path });
  }
  for (const [key, d] of Object.entries(state.foundations || {})) {
    if (d.plan_path) targets.push({ kind: 'foundation', key, path: d.plan_path });
  }
  return targets;
}

/**
 * Aucun artefact produit avant que sa phase ne soit atteinte.
 *
 * `state.js register` refuse désormais d'écrire en avance. Ce contrôle attrape
 * ce qui est **déjà** sur disque — donc ce qui a été écrit avant que la règle
 * existe, ou par une voie qui n'est pas `register` (`sync --fix`, édition
 * manuelle de `state.json`, migration).
 *
 * Il est l'exact miroir de `current_phase_has_deliverables`, qui ne juge que la
 * phase courante : ensemble, les deux ferment l'intervalle. Sans celui-ci,
 * l'ordre des phases restait une consigne.
 */
function checkPrematureArtifacts(root) {
  const state = loadStateOrFail(root);

  // Même règle que `checkPhaseRequirements` : un contrôle qui ne peut pas
  // s'exécuter doit ÉCHOER, pas rendre la main. Rendre la main produirait un
  // rapport sans cette ligne, et l'absence se lirait comme « rien à signaler ».
  if (typeof L.prematureArtifacts !== 'function' || !L.PHASE_KEYS || !L.PHASE_ARTIFACT_OWNERS) {
    record('no_premature_artifacts', false, {
      error: 'forge-lib n\'expose pas PHASE_KEYS / PHASE_ARTIFACT_OWNERS / prematureArtifacts',
      rule: 'Un contrôle qui ne peut pas s\'exécuter doit échouer, pas rendre la main. ' +
            'Sinon la règle la plus importante du skill disparaît en silence.'
    });
    return;
  }

  const offenders = L.prematureArtifacts(state);
  record('no_premature_artifacts', offenders.length === 0, {
    current_phase: state.current_phase,
    current_phase_key: L.PHASE_KEYS[parseInt(state.current_phase, 10)],
    offenders,
    owners: L.PHASE_ARTIFACT_OWNERS,
    fix: 'Avancer jusqu\'à la phase propriétaire (`state.js set-phase`), ou retirer ' +
          'l\'artefact et le produire après son gate. Le laisser en place rend chaque ' +
          '« approuvé » ultérieur faux par construction.',
    rule: 'Un artefact appartient à une phase. Tant que cette phase n\'est pas atteinte, ' +
          'l\'artefact repose sur une base non validée — et rien d\'autre ne le signale.'
  });
}

/**
 * Caractères parasites dans les livrables.
 *
 * Deux faux verts successifs, sur un test grandeur nature : un scan
 * `Get-Content -Raw` + regex `\u` en PowerShell qui ne matchait rien, puis un
 * scan « CJK only » en Node qui a déclaré propre un fichier contenant
 * `U+1EE1` dans `_USERNAMEOục` — Latin Extended Additional, hors des plages
 * testées. Le troisième parasite (`diverge阈ront`) n'a été trouvé qu'en
 * passant par une **liste blanche**.
 *
 * L'erreur de conception était de corréler le contrôle au seul mode d'échec
 * observé (« la corruption est CJK ») au lieu de couvrir l'espace. Ici :
 * autorisé = ASCII + Latin-1 + Latin Extended-A + ponctuation générale +
 * symboles +emoji ; **tout le reste est signalé**, y compris les systèmes
 * d'écriture qu'on ne cite jamais.
 *
 * Une ligne portant `unicode-scan:ignore` est ignorée : c'est ce qui permet de
 * **citer un défaut dans le journal d'incidents** sans que la citation
 * elle-même déclenche le contrôle. Sans cela, le rapport qui prouve le défaut
 * ne peut pas être commité — et un rapport de test qui ne s'applique pas son
 * propre contrôle n'est pas un rapport de test.
 */
const SCAN_ALLOWED = [
  [0x0009, 0x000a], [0x000d, 0x000d], [0x0020, 0x007e], [0x00a0, 0x00ff],
  [0x0100, 0x017f], [0x2000, 0x206f], [0x20a0, 0x20bf], [0x2100, 0x214f],
  [0x2190, 0x21ff], [0x2200, 0x22ff], [0x2500, 0x27bf], [0x2e00, 0x2e7f],
  [0xfe00, 0xfe0f], [0x1f000, 0x1faff],
  // Typographie française : ordinaux (« 1er » → `1ᵉʳ`, `ᵉ` en U+1D49 Phonetic
  // Extensions, `ʳ` en U+02B3 lettres de modificateur) et indices
  // (« CO2 » → `CO₂`). Sans ces trois plages, le contrôle signalait **28 fois**
  // des ordinaux français parfaitement corrects : au premier essai, 28 des 37
  // signalements étaient de la typographie, pas de la corruption. Une liste
  // blanche qui ne couvre pas la langue du dépôt devient un contrôle que l'on
  // éteint — et le premier essai essai avait pris `ʳ` pour `ᵉ` : les
  // deux sont des exposants, dans deux blocs différents.
  [0x02b0, 0x02ff], [0x2070, 0x209f], [0x1d00, 0x1d7f]
];
const SCAN_NAMED = new Map([
  [0x0000, 'Control'], [0x000b, 'Control'], [0x000c, 'Control'],
  [0x007f, 'Control'], [0xfeff, 'BOM'], [0xfffd, 'Replacement'],
  [0x4e00, 'CJK'], [0x3040, 'CJK'], [0xac00, 'CJK']
]);

function scanVerdict(cp) {
  if (SCAN_NAMED.has(cp)) return SCAN_NAMED.get(cp);
  for (const [a, b] of SCAN_ALLOWED) if (cp >= a && cp <= b) return null;
  if (cp >= 0x0590 && cp <= 0x05ff) return 'Hebrew';
  if (cp >= 0x0400 && cp <= 0x04ff) return 'Cyrillic';
  if (cp >= 0x0100 && cp <= 0x024f) return 'LatinExtendedAdditional';
  return 'OutOfContext';
}

/** Les livrables scannés : ce que le projet a produit, rien de tiers. */
function scanTargets(root, state) {
  const out = [];
  for (const [key, d] of Object.entries(state.deliverables || {})) if (d.path) out.push({ kind: 'deliverable', key, path: d.path });
  for (const [key, d] of Object.entries(state.screens || {})) if (d.path) out.push({ kind: 'screen', key, path: d.path });
  for (const [key, d] of Object.entries(state.slices || {})) if (d.plan_path) out.push({ kind: 'slice', key, path: d.plan_path });
  for (const [key, d] of Object.entries(state.foundations || {})) if (d.plan_path) out.push({ kind: 'foundation', key, path: d.plan_path });
  return out;
}

function checkStrayCharacters(root) {
  const state = loadStateOrFail(root);
  const offenders = [];
  const targets = scanTargets(root, state);

  for (const t of targets) {
    const abs = L.toAbs(root, t.path);
    if (!fs.existsSync(abs)) continue;
    const lines = fs.readFileSync(abs, 'utf-8').split('\n');
    lines.forEach((line, i) => {
      if (line.includes('unicode-scan:ignore')) return;
      const seen = new Set();
      for (const ch of line) {
        const cp = ch.codePointAt(0);
        const kind = scanVerdict(cp);
        if (!kind) continue;
        const tag = `${kind}:U+${cp.toString(16).toUpperCase().padStart(4, '0')}`;
        if (seen.has(tag)) continue;
        seen.add(tag);
        offenders.push({ kind: t.kind, key: t.key, path: t.path, line: i + 1, char: tag, excerpt: line.trim().slice(0, 90) });
      }
    });
  }

  record('no_stray_characters', offenders.length === 0, {
    scanned_files: targets.length,
    offenders,
    hint: 'Un caractère hors liste blanche dans un livrable est un artefact de génération. ' +
          'Pour citer un défaut dans un journal, marque la ligne `unicode-scan:ignore`.',
    rule: 'La corruption générative est un mode d\'échec récurrent et silencieux : le fichier se parse, ' +
          'les tests passent, et seul le caractère est faux. Le scan est donc une liste blanche, ' +
          'jamais une liste de suspects.'
  });
}

function checkHashes(root) {
  const state = loadStateOrFail(root);
  const drifted = [];
  const checked = hashTargets(state);
  for (const t of checked) {
    const d = (t.kind === 'deliverable' ? (state.deliverables || {}) : t.kind === 'screen' ? (state.screens || {})
      : t.kind === 'slice' ? (state.slices || {}) : (state.foundations || {}))[t.key] || {};
    if (!d.content_hash) continue;
    const current = L.contentHash(L.toAbs(root, t.path));
    if (current && current !== d.content_hash) {
      drifted.push({
        kind: t.kind, artifact: t.key, path: t.path,
        recorded: d.content_hash, actual: current,
        hint: 'Édition hors bande : le corps a changé sans passer par state.js hash.'
      });
    }
  }
  record('content_hashes_current', drifted.length === 0, { checked: checked.length, drifted });
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
  /**
   * Cet artefact est-il le **premier** de sa chaîne ?
   *
   * Opérationnellement : est-il le seul artefact enregistré à déclarer une liste de
   * sources, ou le seul à ne rien déclarer du tout ? Un `conventions.md` est le
   * premier parce qu'il n'a **personne** au-dessus de lui ; un `roadmap.md` en a un.
   *
   * On ne se fie **pas** au fait que l'artefact soit seul : un écran enregistré seul
   * dans un projet vide n'est pas le premier de sa chaîne, il est un écran **sans
   * conception**. Ce qui décide est la **phase propriétaire** : seul l'artefact de la
   * phase 0 — les conventions — est le premier, parce que c'est le seul dont la phase
   * n'a pas de prédécesseur.
   *
   * Constaté en corrigeant : la première version demandait « personne d'autre ne
   * déclare de source », ce qui acceptait un écran isolé et faisait passer un test
   * négatif. Le test l'a vu. Un contrôle assoupli jusqu'à ne plus rien voir n'est pas
   * un contrôle assoupli, c'est un contrôle supprimé.
   */
  const isChainRoot = (key, kind, state) => {
    // Le propriétaire de l'artefact, déduit de (kind, key) et non de l'état des
    // phases : c'est la même règle que `prematureArtifacts`, donc les deux ne
    // peuvent pas diverger sur le même artefact.
    let ownerIdx = -1;
    for (const [phaseKey, spec] of Object.entries(L.PHASE_ARTIFACT_OWNERS)) {
      const i = L.PHASE_KEYS.indexOf(phaseKey);
      if (i < 0) continue;
      if (spec[kind] === true || (Array.isArray(spec[kind]) && spec[kind].includes(key))) {
        ownerIdx = Math.max(ownerIdx, i);
      }
    }
    // `ownerIdx === 0` : le document des conventions, seul artefact sans amont.
    //
    // La version précédente exigeait aussi `current_phase <= 1`, pour « ne pas
    // confondre un premier artefact avec un artefact produit en avance ». C'est
    // faux : un écran enregistré en phase 0 n'est pas le premier, c'est **en
    // avance** — et c'est `no_premature_artifacts` qui le dit, avec la règle
    // complète. Le doublon fait ici ne servait à rien et produisait un faux
    // positif dès que le projet passait en phase 2 : `conventions.md`, toujours
    // premier de sa chaîne, était refusé parce que « plus personne ne déclare de
    // source » — alors qu'un PRD **en dérive**.
    return ownerIdx === 0;
  };

  for (const t of targets) {
    const abs = L.toAbs(root, t.path);
    if (!fs.existsSync(abs)) continue;
    const fm = L.readFrontMatter(abs);
    if (!fm) continue;
    if (!Object.prototype.hasOwnProperty.call(fm.data, 'derived_from')) continue;
    const v = fm.data.derived_from;
    // ## Une liste vide est un **contexte**, pas un oubli — sauf au premier artefact
    //
    // `derived_from: []` signifie « cet artefact n'a pas de source » : c'est le cas
    // **légitime** de `conventions.md`, qui est le premier document écrit et dérive
    // d'un entretien, non d'un autre fichier. Le même front matter sans la clé du
    // tout ne dit rien — et l'absence de clé est acceptée, parce que le gabarit
    // `conventions.md.tmpl` ne déclare pas `derived_from`.
    //
    // Constaté sur Bailly, premier projet du banc d'essai où ce cas apparaît : la
    // clé a été écrite vide pour être explicite, et le contrôle l'a refusée. Le
    // contrôle avait raison de la forme et tort du fond : il confondait « j'ai
    // déclaré que je n'ai pas de source » et « j'ai oublié de dire d'où ça vient ».
    //
    // La distinction est donc : **une liste vide est acceptée si l'artefact est le
    // premier de sa chaîne** — c'est-à-dire si aucun autre artefact enregistré déclare
    // une source, ce qui est la définition opérationnelle de « premier ». Pour tout
    // le reste, la liste vide reste un défaut, parce qu'elle cache une rupture de
    // traçabilité.
    const isEmpty = v === null || v === undefined ||
      (typeof v === 'string' && v.trim() === '') ||
      (Array.isArray(v) && v.length === 0);
    if (!isEmpty) continue;

    if (isChainRoot(t.key, t.kind, state)) continue;
    empty.push({
      kind: t.kind, key: t.key, path: t.path,
      why: '`derived_from` est déclaré mais vide alors que cet artefact dérive d\'un autre : ' +
           'les fichiers sources ne sont plus liés.',
      hint: 'Un artefact **premier** de sa chaîne (les conventions, ce qui dérive d\'un ' +
            'entretien) peut déclarer une liste vide. Tout le reste doit nommer ses sources.'
    });
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

/**
 * Une **case** non tranchée, et non la phrase « à décider » employée en prose.
 *
 * ## Pourquoi la distinction est nécessaire, et comment elle se fait
 *
 * `no_undecided_slots` cherchait `À DÉCIDER` **n'importe où dans une ligne**. Le motif
 * est un marqueur d'**emplacement** : il dit « rien n'a été écrit ici, et quelque chose
 * devait l'être ». Mais la même suite de caractères, dans une **phrase**, décrit
 * souvent le contraire — elle **raconte** une décision.
 *
 * Constaté sur Bailly, 11 faux positifs en un document : tous la même ligne de code.
 *
 *   - `Aucune échéance bloquante à décider` — la description d'un état `absent` ;
 *   - `La décision du propriétaire` — la description d'une colonne ;
 *   - `1 à décider` dans un libellé d'écran — **le mot que le produit affiche** ;
 *   - `Ce qui a servi à décider` — la définition même de l'anonymisation.
 *
 * Le dernier cas est le plus instructif : **le produit** s'appelle « les trois états de
 * traitement » et l'une de ses colonnes s'appelle `decidee_le`. Interdire le mot
 * « décider » dans ce projet interdirait de le nommer.
 *
 * ## La règle
 *
 * Un marqueur n'est une case que s'il occupe la **place** d'une valeur — c'est-à-dire
 * dans une cellule de tableau dont la colonne est un nom de champ, ou en tête d'une
 * section. Ailleurs c'est de la prose.
 *
 * On distingue par la **forme de la ligne**, jamais par le sens du mot : c'est la seule
 * chose qu'un contrôle peut décider sans lire le document, et c'est la seule qui ne
 * dépende pas d'une intention.
 */
function isUndecidedSlotLine(line) {
  if (!UNDECIDED_RE.test(stripCodeSpans(line))) return false;

  const cells = line.split('|').map(c => c.trim()).filter(c => c !== '');
  if (cells.length < 2) {
    // Pas de tableau : un titre de section, ou une ligne de liste. « ## 2. À
    // DÉCIDER » est une case ; une phrase qui commence par « À décider » ne l'est
    // pas. La distinction tient à ce que le marqueur est **seul dans sa cellule**.
    const head = /^(#{2,4}\s*|[-*]\s*|\d+\.\s*)?(.*)$/.exec(line);
    const body = (head && head[2] || line).trim();
    return /^(#{2,4}\s*)?À\s*DÉCIDER\b/i.test(body) || /^TODO\s*:\s*décider\b/i.test(body);
  }

  // Tableau : une seule cellule porte le marqueur, et elle est **courte**. Une
  // cellule de prose qui contient le mot est une description ; un champ vide est
  // « À DÉCIDER EN PHASE 4 », et rien d'autre.
  const marked = cells.filter(c => UNDECIDED_RE.test(stripCodeSpans(c)));
  if (marked.length !== 1) return false;
  const cell = stripCodeSpans(marked[0]).trim();
  return /^(?:[-*]\s*)?À\s*DÉCIDER\b/i.test(cell) || /^TODO\s*:\s*décider\b/i.test(cell);
}

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
      if (!isUndecidedSlotLine(line)) return;
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

function entryFor(state, item) {
  const bucket = item.kind === 'deliverable' ? state.deliverables
    : item.kind === 'screen' ? state.screens
      : item.kind === 'slice' ? state.slices : state.foundations;
  return (bucket || {})[item.key];
}

function checkSync(root, fix) {
  const state = loadStateOrFail(root);
  const items = collectStatusFiles(state);
  const divergences = [];

  for (const item of items) {
    const abs = L.toAbs(root, item.relPath);
    if (!fs.existsSync(abs)) {
      // Un artefact enregistré dont le fichier n'a JAMAIS été écrit n'est pas une
      // divergence : c'est le travail d'une phase qui n'a pas commencé — une slice
      // déclarée en Phase 4, dont le plan est un livrable de Phase 5.
      // Ce qui est une divergence, c'est un fichier qui existait — donc un
      // `content_hash` enregistré — et qui a disparu.
      const entry = entryFor(state, item);
      if (!entry || !entry.content_hash) continue;
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
  const checked = hashTargets(state);
  for (const t of checked) {
    const d = (t.kind === 'deliverable' ? (state.deliverables || {}) : t.kind === 'screen' ? (state.screens || {})
      : t.kind === 'slice' ? (state.slices || {}) : (state.foundations || {}))[t.key] || {};
    if (!d.content_hash) continue;
    const current = L.contentHash(L.toAbs(root, t.path));
    if (current && current !== d.content_hash) {
      drifted.push({ kind: t.kind, artifact: t.key, path: t.path, recorded: d.content_hash, actual: current });
    }
  }
  record('no_content_drift', drifted.length === 0, {
    checked: checked.length,
    drifted,
    fix: 'node "$FORGE/scripts/state.js" register <anchor> <kind> <cle> <chemin> — pour remettre le hash d\'un ecran ou d\'un plan a jour',
    rule: "Un hash qui ne match plus signifie une édition hors bande : le document est stale. " +
          "Cela vaut pour un écran et pour un plan de slice, pas seulement pour un livrable."
  });
}

/* ------------------------------------------------------------------ *
 * Le contrat de projet — ce que le client signe, et ce qu'il couvre
 * ------------------------------------------------------------------ */

/**
 * Le projet comporte un artefact de plus : ce que le client **signe**.
 *
 * ## Pourquoi un contrat, et pas un bilan par phase
 *
 * Le modèle demandé est celui d'une agence : le client signe un contrat, puis il
 * n'est plusinterruptu que pour un **écart** ou une **décision qui lui appartient**.
 * Un bilan par phase sur un client non technique produit l'inverse de ce qu'il
 * cherche : une formalité qu'il approuve sans lire, donc un gate vide. C'est la
 * même faute qu'un constat non promu qui verdit l'indicateur.
 *
 * ## La propriété qui rend la promesse vraie
 *
 * « Après la signature, le client n'intervient plus » n'est vrai que si **tout ce
 * qui engage un achat est décidé avant la signature**. Sinon il découvre un
 * engagement en Phase 4, dans un document qu'il ne lit pas.
 *
 * Cette propriété est **vérifiable**, parce que `conventions.md` porte déjà les
 * cases `À DÉCIDER AVANT LA PHASE 1` — celles qui « changent ce qu'on achète et ce
 * qu'on héberge », selon le gabarit lui-même. Le contrat doit donc **nommer chacune**
 * d'elles, avec un prix et une date. C'est le seul endroit où la promesse de
 * non-intervention peut s'appuyer sur autre chose que de la bonne volonté.
 */
const CONTRACT_BLOCKS = [
  { key: 'livre', re: /^##\s+\d*\.?\s*Ce qui sera livré/im, label: 'Ce qui sera livré' },
  { key: 'exclu', re: /^##\s+\d*\.?\s*Ce qui ne sera pas livré/im, label: 'Ce qui ne sera pas livré' },
  { key: 'irreversible', re: /^##\s+\d*\.?\s*Ce qui est irréversible/im, label: 'Ce qui est irréversible' },
  { key: 'forge_seul', re: /^##\s+\d*\.?\s*Ce que Forge décidera seul/im, label: 'Ce que Forge décidera seul' },
  { key: 'client', re: /^##\s+\d*\.?\s*Ce qui reviendra au client/im, label: 'Ce qui reviendra au client' }
];

/**
 * Les engagements qu'un client non technique ne peut pas déléguer, **par genre**.
 *
 * ## Pourquoi une classification, et non une comparaison de chaînes
 *
 * Le premier essai comparait le libellé de la case de `conventions.md` à celui du
 * contrat. Il a échoué sur un dossier parfaitement complet : `conventions.md` écrit
 * « Fournisseur identité », le contrat écrit « Identité » — le même engagement,
 * deux formulations. Le contrôle a signalé une absence, donc **le test positif a
 * cassé**, et c'est lui qui avait raison.
 *
 * C'est la règle du dossier,applied this time to two documents of the same project :
 * un motif plus étroit que ce que les documents écrivent est faux. Et ici le
 * meilleur correctif n'est pas d'élargir le motif — il n'y a pas de largeur qui
 * convienne, puisque les deux documents ont le droit de nommer les choses
 * différemment. Le bon correctif est de comparer **le genre de l'engagement**,
 * qui est une propriété du fait et non de sa formulation.
 */
const ENGAGEMENT_KINDS = [
  { kind: 'hebergement', re: /h[eé]bergement|hebergeur|hosting|serveur|instances?\b/i },
  // `signature` et `signataire` appartiennent au genre **identite** : signer, c'est
  // etablir qui a engage. Constate sur Atelier, le premier contrat reellement
  // chiffre de tout le dossier : les conventions nommaient « Identite du signataire »
  // et le contrat nommait « Signature du devis » — le meme engagement, deux
  // formulations, et la porte signalait une absence. C'est F-48 et F-53 encore,
  // mais sur la **classification** : une categorie qui ne couvre pas ce que les
  // documents ecrivent ne sert a rien, meme si le reste du raisonnement est bon.
  { kind: 'identite', re: /identit[eé]|identity|authentification|auth provider|login|connexion|signature|signataire|signer/i },
  { kind: 'achat', re: /\bachat\b|acheter|licence|license|abonnement|subscription|solde\.|facturation|facture|forfait|\bplan\b (payant|pro|premium)|\bnom de domaine\b/i },
  { kind: 'fond', re: /ex[ée]cution de fond|background (job|execution)|t[aâ]che planifi[eé]e|\bcron\b|webhook|queue|file d'attente/i },
  { kind: 'donnees', re: /donn[eé]es? personnelle|rgpd|gdpr|h[ée]bergement de donn[eé]es|residenz? (data|ue)/i }
];

/** Le genre d'un engagement, ou `null` si la ligne n'en est pas un. */
function engagementKind(text) {
  for (const k of ENGAGEMENT_KINDS) if (k.re.test(text)) return k.kind;
  return null;
}

const ENGAGEMENT_RE = new RegExp(ENGAGEMENT_KINDS.map(k => k.re.source).join('|'), 'i');

/** Une ligne du tableau des irréversibles : un champ et une valeur, pas de la prose. */
function parseCommitment(line) {
  const cells = line.split('|').map(c => c.trim()).filter(c => c !== '');
  if (cells.length < 2) return null;
  // La colonne du champ doit nommer l'engagement ; celle du prix doit porter un montant
  // ou une durée. Une ligne qui n'a pas les deux est une intention, pas un engagement.
  const named = ENGAGEMENT_RE.test(cells[0]) || ENGAGEMENT_RE.test(cells[1]);
  if (!named) return null;
  const hasPrice = cells.some(c => /\d/.test(c) && /[€$£]|€|\/\s*(mois|an|month|year)|par\s+(mois|an)|\d/.test(c));
  return { field: cells[0].replace(/`/g, '').slice(0, 60), hasPrice, cells };
}

function checkContract(root) {
  const state = loadStateOrFail(root);
  const contract = (state.deliverables || {}).contract;

  if (!contract) {
    // Le contrat est **nouveau**, et tous les projets ne l'ont pas produit. Ce qui
    // décide n'est pas « a-t-il un contrat » mais « a-t-il **avance** sans en avoir
    // un » : un projet encore en Phase 0 n'a pas fait son travail, et le faire
    // echouer serait l'interrompre au milieu d'une tache normale.
    //
    // Un projet qui a franchi la Phase 0 sans contrat n'a pas un oubli : il a une
    // promesse non tenue. Personne n'a signe, et le suivi le dira quand meme.
    const phase = parseInt(state.current_phase, 10);
    if (!Number.isFinite(phase) || phase <= 0) {
      return record('contract_complete', true, {
        state: 'absent',
        phase: state.current_phase,
        warn: 'Aucun contrat de projet, et la Phase 0 n\'est pas terminee : c\'est le travail en cours, pas un oubli.',
        next: 'node "$FORGE/scripts/state.js" register <anchor> deliverable contract .forge/contract.md',
        rule: 'Le contrat est le seul artefact qui engage le client. Tant qu\'il est en Phase 0, son absence est le travail a faire, pas une faute.'
      });
    }
    return record('contract_complete', false, {
      state: 'absent_past_phase_0',
      phase: state.current_phase,
      why: 'Le projet est en Phase ' + state.current_phase + ' et n\'a pas de contrat : il a franchi la Phase 0 sans l\'etape ou le client signe ce qui est livre, ce qui ne l\'est pas, et ce qui engage un achat.',
      next: 'Produire le contrat depuis templates/contract.md.tmpl : node "$FORGE/scripts/state.js" register <anchor> deliverable contract .forge/contract.md',
      rule: "\u00ab Apres la signature, le client n\'intervient plus \u00bb est la promesse centrale du mode agence. Elle repose entierement sur un contrat signe avant que quoi que ce soit ne soit engage. Un projet qui a avance sans n\'a pas de client : il a un perimetre."
    });
  }

  const rel = contract.path || L.CANONICAL_LAYOUT.contract;
  const abs = L.toAbs(root, rel);
  if (!fs.existsSync(abs)) {
    return record('contract_complete', false, {
      state: 'file_missing', path: rel,
      rule: "Un contrat enregistré mais absent du disque ne signe rien : l'engagement du client est un souvenir, pas un document."
    });
  }

  const raw = fs.readFileSync(abs, 'utf-8');
  const problems = [];

  // 1. Les cinq blocs. Un contrat sans le bloc « ce qui ne sera pas livré » est un
  //    contrat qui ne promet rien de négatif, donc qui ne peut pas être violé.
  for (const b of CONTRACT_BLOCKS) {
    if (!b.re.test(raw)) problems.push({ block: b.label, why: 'bloc absent' });
  }

  // 2. Les engagements de `conventions.md` doivent tous figurer au contrat.
  const conv = (state.deliverables || {}).conventions;
  const engagements = [];
  if (conv && conv.path && fs.existsSync(L.toAbs(root, conv.path))) {
    const crows = fs.readFileSync(L.toAbs(root, conv.path), 'utf-8').split('\n');
    for (const line of crows) {
      if (!/À\s*DÉCIDER\s+AVANT\s+LA\s+PHASE\s+1/i.test(line)) continue;
      const c = parseCommitment(line);
      engagements.push({
        field: c ? c.field : line.trim().slice(0, 60),
        kind: engagementKind(line),
        line: line.trim().slice(0, 90)
      });
    }
  }

  const irrSection = raw.split(/^##\s+\d*\.?\s*Ce qui est irréversible/im)[1] || '';
  const irrBefore = irrSection.split(/^##\s/im)[0] || '';

  // Les genres couverts par le contrat, lus **ses** lignes — pas son texte entier :
  // une mention en prose dans le contrat ne couvre pas un engagement, une ligne de
  // tableau si. C'est la même distinction que pour un prix, et pour la même raison :
  // ce qui compte est l'engagement annoncé, pas le mot écrit quelque part.
  const covered = new Set();
  for (const line of irrBefore.split('\n')) {
    if (!/^\s*\|/.test(line)) continue;
    const k = engagementKind(line);
    if (k) covered.add(k);
  }

  for (const e of engagements) {
    if (!e.kind) continue;
    if (!covered.has(e.kind)) {
      problems.push({
        block: 'Ce qui est irréversible',
        field: e.field,
        kind: e.kind,
        why: `engagement de genre « ${e.kind} » annoncé dans conventions.md, absent des irréversibles du contrat`,
        evidence: e.line
      });
    }
  }

  // 3. Un engagement sans prix n'est pas un engagement annoncé, c'est un engagement
  //    subi. Le client ne peut pas valider un coût qu'il n'a pas vu.
  // Un prix **inconnu** et un prix **oublié** sont le même défaut pour le client — il ne
  // peut valider ni l'un ni l'autre — mais ce ne sont pas la même **action**. « Personne
  // n'a chiffré » demande une recherche ; « la case est vide » demande de la remplir.
  // La porte dit laquelle, parce qu'un message qui ne distingue pas les deux fait
  // perdre au lecteur le temps de comprendre ce qu'il doit faire ensuite.
  //
  // Constaté sur les trois projets de laboratoire migrés : les trois ont déclaré
  // « prix non chiffré dans le projet » sur tous leurs engagements. Ce n'est pas une
  // erreur de rédaction : c'est **le trou que le contrat existe pour rendre visible**,
  // et il était invisible parce qu'il n'y avait nulle part où l'écrire.
  const PRIX_INCONNU = /(non\s+(chiffr|cit|d[ée]cid|estim)|inconnu|jamais\s+chiffr|à\s+chiffrer|a\s+chiffrer|\?)/i;
  for (const line of irrBefore.split('\n')) {
    if (!/^\s*\|/.test(line)) continue;
    const c = parseCommitment(line);
    if (!c || c.hasPrice) continue;
    const inconnu = c.cells.some(cell => PRIX_INCONNU.test(cell));
    problems.push({
      block: 'Ce qui est irréversible',
      field: c.field,
      why: inconnu
        ? 'prix déclaré inconnu — le client ne peut pas valider un coût que personne n a chiffré'
        : 'aucun prix ni durée — le client ne peut pas valider un coût qu\'il n\'a pas vu',
      action: inconnu ? 'chiffrer l’engagement avant signature' : 'renseigner le prix ou la durée',
      evidence: line.trim().slice(0, 90)
    });
  }

  // 4. Le bloc « ce qui reviendra au client » doit porter une **date** par ligne.
  //    Une décision sans échéance est prise par le plus proche, et le plus proche
  //    c'est Forge — c'est-à-dire exactement l'absence de client que le contrat
  //    prétend éviter.
  const clientSection = raw.split(/^##\s+\d*\.?\s*Ce qui reviendra au client/im)[1] || '';
  const clientBefore = clientSection.split(/^##\s/im)[0] || '';
  // La **ligne d'en-tete** est retiree avant de compter les echeances. Elle en porte
  // le *nom* (« Échéance »), pas une valeur ; la compter comme une décision sans date
  // produisait un défaut permanent sur un contrat correct — et un gate qui refuse
  // toujours est un gate qu'on éteint. Constaté en migrant les projets de laboratoire :
  // leurs contrats étaient complets, et la porte les refusait sur leur en-tête.
  const allRows = clientBefore.split('\n').filter(l => /^\s*\|/.test(l) && !/^\s*\|[\s\-:|]+\|\s*$/.test(l));
  // Le motif tolere l'accent **et son absence** : `Echeance` et `Échéance` designent la
  // meme colonne, et un gate qui n'en reconnait qu'un des deux refute un contrat correct
  // pour une raison de typographie. C'est la meme famille que F-48 et F-53 : un motif
  // plus etroit que ce que les documents ecrivent est faux.
  // Le motif cherche `echeance` dans **n'importe quelle cellule** de la ligne, pas
  // seulement la premiere : dans `| Décision | Options | Échéance | Prix |` le mot est
  // en troisieme position, et un motif ancre sur la premiere ne voit rien.
  const rows = allRows.filter(l => !/e[\u0300-\u036f]?cheance/i.test(l));
  // Une echeance relative s'ecrit de mille facons, et `avant le` n'en est qu'une.
  // « Avant la premiere facture » est une echeance aussi precise que « avant le
  // premier devis » — meme jour, meme obligation, meme consequence si elle passe.
  // Constate sur le meme contrat, sur la meme ligne dont la premiere version
  // etait refusee pour cette seule raison : la porte reconnait l'article, pas la
  // proposition. Vingt-et-unieme manifestation du meme defaut — un motif plus
  // etroit que ce que les documents ecrivent.
  const ECHEANCE = /\d{4}-\d{2}-\d{2}|avant\s+(?:le |la |l’|les )|au\s+plus\s+tard|[eé]ch[eé]ance|d ici|fin de|premiere|premi[eè]re|\bd[ée]\b/i;
  const dated = rows.filter(l => ECHEANCE.test(l));
  if (rows.length && dated.length < rows.length) {
    problems.push({ block: 'Ce qui reviendra au client', why: `${rows.length - dated.length} ligne(s) sans échéance — une décision sans date est prise par le plus proche`, evidence: (rows.find(l => !dated.includes(l)) || '').trim().slice(0, 90) });
  }

  // 5. **Les blocs sont-ils remplis ?**
  //
  //    Constaté en exécutant `client-liaison` sur un vrai contrat, en bac à sable.
  //    Le contrat avait ses cinq blocs, des titres corrects, et **rien dedans** :
  //    `| Slice | Résultat | | a | b |`.
  //
  //    Pire : `state.json` disait `status: approved`, un hash était enregistré, et
  //    `checkpoint_reached` valait `true`. Le mécanisme avait signé **un formulaire
  //    vide** à la place du client, et comptait sa décision comme prise.
  //
  //    Le diagnostic de l'agent client est le point à retenir : *les cinq titres sont
  //    exactement les cinq questions du client. Un lecteur pressé voit cinq sections
  //    qui lui posent déjà les bonnes questions, et conclut qu'elles sont traitées.*
  //    **La structure rend le document plus difficile à critiquer qu'un document
  //    vide** — un fichier sans rien aurait fait demander « est-ce qu'il existe ? ».
  //
  //    Donc : un bloc vide est un défaut, et une valeur d'une lettre en est un autre.
  //    Vérifier la présence d'un formulaire sans vérifier son contenu n'est pas une
  //    porte, c'est un passe-case.
  const FILLED_BLOCKS = [
    { label: 'Ce qui sera livré', re: /^##\s+\d*\.?\s*Ce qui sera livré/im },
    { label: 'Ce qui ne sera pas livré', re: /^##\s+\d*\.?\s*Ce qui ne sera pas livré/im },
    { label: 'Ce qui est irréversible', re: /^##\s+\d*\.?\s*Ce qui est irréversible/im },
    { label: 'Ce qui reviendra au client', re: /^##\s+\d*\.?\s*Ce qui reviendra au client/im }
  ];
  for (const b of FILLED_BLOCKS) {
    const parts = raw.split(b.re);
    const body = parts.length > 1 ? (parts[1].split(/^##\s/im)[0] || '') : '';
    // Toutes les lignes de tableau du bloc, séparateur exclu. **L'en-tête n'a pas
    // besoin d'être exclu** : ses cellules portent des mots, donc la détection
    // d'une lettre isolée ne le remarque pas. Essayer de le filtrer à part revient à
    // écrire un prédicat de plus, et il n'a qu'une façon de se tromper — ce qu'il a
    // fait, en excluant exactement les lignes qu'il fallait attraper.
    //
    // Un en-tête et son séparateur ne sont pas du contenu : un tableau qui ne contient
    // que les deux est **aussi vide** qu'un tableau sans rien, et c'est le cas qu'on
    // voit le moins, parce qu'il a la forme d'un tableau plein.
    const lignes = body.split('\n').filter(l => /^\s*\|/.test(l));
    const estSeparateur = l => /^\s*\|[\s\-:|]+\|\s*$/.test(l);
    const rows = lignes.filter(l => !estSeparateur(l));
    const contenu = rows.length - 1;   // moins la ligne d'en-tête
    if (contenu <= 0) {
      problems.push({ block: b.label, why: 'aucune ligne de contenu — un bloc sans contenu est un formulaire, pas un contrat' });
      continue;
    }
    for (const r of rows) {
      const cells = r.split('|').map(c => c.trim()).filter(c => c !== '');
      for (const c of cells) {
        if (/^[A-Za-z]$/.test(c)) {
          problems.push({
            block: b.label,
            why: `cellule « ${c} » : une valeur d'une lettre est un gabarit non rempli`,
            evidence: r.trim().slice(0, 80)
          });
        }
      }
    }
  }

  /* Un contrat **relu et non signé** n'engage personne non plus.
   *
   * La branche « contrat absent » applique déjà `warn` en Phase 0 et `fail`
   * au-delà. Elle ne voyait que l'absence. Un contrat `draft` — écrit,
   * chiffré, relu — passait ensuite par `problems.length === 0`, donc
   * **vert dans toutes les phases**, alors que personne n'avait signé.
   *
   * Constate sur Atelier : contrat parfait, cinq blocs, quatre engagements
   * chiffrés, et `state: draft`. La porte disait `pass`. Un `draft` n'est pas
   * « en cours d'écriture » : le gabarit produit le document en un geste, et un
   * client signe ou ne signe pas. La seule chose qui rend le `draft` légitime
   * est la phase 0 — le travail en cours.
   */
  const phaseNum = parseInt(state.current_phase, 10);
  if (contract.status !== 'approved' && Number.isFinite(phaseNum) && phaseNum > 0) {
    return record('contract_complete', false, {
      state: contract.status,
      phase: state.current_phase,
      why: 'Le contrat est en Phase ' + state.current_phase + ' et son statut est ' +
           '`' + contract.status + '` : personne ne l\'a signé. « Après la signature, ' +
           'le client n\'intervient plus » est la promesse centrale du mode agence, et ' +
           'elle ne commence pas à la lecture du document.',
      next: 'Faire signer, puis node "$FORGE/scripts/state.js" set-status <anchor> deliverable contract approved',
      rule: 'Le contrat est le seul artefact qui engage le client. Tant qu\'il est en Phase 0, son absence ou son statut `draft` est le travail à faire. Au-delà, un contrat non signé est une promesse faite à personne.',
      problems
    });
  }

  record('contract_complete', problems.length === 0, {
    state: contract.status,
    blocks_checked: CONTRACT_BLOCKS.length,
    engagements_in_conventions: engagements.length,
    problems,
    fix: 'Le contrat est relisible ; les points ci-dessus disent ce qui manque et où.',
    rule: "« Après la signature, le client n'intervient plus » n'est vrai que si tout ce qui engage un achat est décidé avant la signature. Cette propriété est vérifiable : conventions.md porte les cases `À DÉCIDER AVANT LA PHASE 1`, et le contrat doit nommer chacune d'elles, avec un prix et une date."
  });
}

/* ------------------------------------------------------------------ *
 * Fast Track — les conditions d'entrée
 * ------------------------------------------------------------------ */

/**
 * Le mode avait une **table de huit conditions d'entrée** et une promesse :
 * *« Si une condition échoue, Fast Track **refuse de démarrer** et dit laquelle. »*
 *
 * Aucune des deux n'était implémentée. `run.fast_track` n'existait que comme `null`
 * dans l'initialisation de `state.json`, et les trois commandes que la référence
 * proposait pour « vérifier d'un coup » — `state.js start`, `forge-guard all`,
 * `consistency-check all` — **ne testent aucune des huit** : elles disent si le
 * projet est sain, pas s'il est prêt pour Fast Track. Un projet dont les neuf
 * écrans sont en `draft` les passe toutes les trois.
 *
 * C'est la forme de défaut la plus coûteuse du dossier, et la plus simple : une porte
 * écrite en prose, que rien n'exécute. Elle ne se voit pas parce qu'un mode activé à
 * la main « fonctionne » — jusqu'au jour où il valide des plans contre des livrables
 * en `draft`, ce que rien n'interdit et rien ne signale.
 *
 * ## Pourquoi ce contrôle est son **propre sous-commande**, et pas dans `all`
 *
 * Deux des huit conditions portent sur des livrables de phase 3 et de phase 6
 * (`benchmarks`, `test_plan`). Les mettre dans `all` ferait échouer **tout** projet
 * ordinaire à la phase 4, donc ils n'y sont pas.
 *
 * Mais un contrôle qu'il faut **demander** est un contrôle qui peut être oublié — et
 * c'est le même piège que l'autre, en miroir : vert parce que personne n'a regardé.
 * D'où la règle : `fast-track` **échoue bruyamment** et nomme chaque condition
 * non remplie, et il ne se contente jamais de passer par défaut quand il est appelé.
 * Demander, c'est obtenir une réponse ; ne pas demander, c'est ne pas être en Fast
 * Track, ce que `state.js status` affiche.
 */

/**
 * Exécute un contrôle existant et récupère son verdict **sans** l'enregistrer.
 *
 * Le verdict se lit dans l'**enregistrement**, jamais dans la valeur de retour.
 *
 * Constaté en écrivant cette fonction : `checkPaths` et `checkStrays` ne `return`ent
 * rien — elles appellent `record()` et c'est tout. Lire la valeur de retour donnait
 * `undefined`, donc « échec », donc Fast Track refusait un projet parfaitement sain en
 * annonçant *« aucun livrable égaré »* alors qu'il n'y en a aucun. Un contrôle qui
 * lit un canal que la fonction ne remplit pas ne contrôle rien : il signale le vide
 * comme un défaut, ce qui est la pire des deux erreurs — un défaut annoncé à tort se
 * apprend, et le vrai défaut passe ensuite pour un bruit.
 */
function capture(name, fn) {
  const before = results.checks.length;
  fn();
  const entries = results.checks.slice(before);
  results.checks.length = before;
  const failed = entries.filter(e => e.status === 'fail');
  return {
    name,
    pass: failed.length === 0,
    entry: failed[0] || entries[entries.length - 1] || { check: name, status: 'fail', reason: 'le contrôle n\'a rien enregistré' }
  };
}

/**
 * Le statut d'un livrable, et **la raison** quand il n'est pas `approved`.
 *
 * Un livrable absent se distingue d'un livrable en `draft` : le premier est un
 * livrable jamais écrit, le second un livrable écrit et non validé. Les deux bloquent
 * Fast Track, mais dire lequel est la moitié du travail — « le design system n'est pas
 * approuvé » ne dit pas s'il manque ou s'il attend une relecture.
 */
function deliverableCondition(state, key, label, problems) {
  const d = (state.deliverables || {})[key];
  if (!d) {
    problems.push({ condition: label, met: false, detail: `livrable \`${key}\` jamais enregistré` });
    return;
  }
  if (d.status !== 'approved') {
    problems.push({ condition: label, met: false, detail: `\`${key}\` est \`${d.status}\`, pas \`approved\`` });
  }
}

/**
 * « Tous les écrans sont approved » — avec **zéro écran**, la phrase est vraie.
 *
 * C'est la non-vacuité, et elle a déjà coûté une release entière sur
 * `token-classes` : un contrôle qui lit un ensemble vide lit une propriété du vide,
 * pas du projet. Un projet sans écran n'est pas un projet dont les écrans sont
 * approuvés, c'est un projet qui n'a pas de design — et c'est précisément le projet
 * où Fast Track n'a rien à valider.
 */
function screensCondition(state, problems) {
  const screens = Object.entries(state.screens || {});
  if (screens.length === 0) {
    problems.push({
      condition: 'Tous les écrans sont approved',
      met: false,
      detail: 'aucun écran enregistré — « tous approuvés » est vrai sur un ensemble vide'
    });
    return;
  }
  const pending = screens.filter(([, s]) => s.status !== 'approved');
  if (pending.length) {
    problems.push({
      condition: 'Tous les écrans sont approved',
      met: false,
      detail: `${pending.length}/${screens.length} en attente : ${pending.slice(0, 6).map(([k, s]) => `${k} (${s.status})`).join(', ')}${pending.length > 6 ? ', …' : ''}`
    });
  }
}

/**
 * Le scénario de cycle complet, pour `phases4-7` seulement.
 *
 * ## Ce que cette condition ne peut pas prouver, et pourquoi elle le dit
 *
 * `references/test-strategies.md` § checklist porte la case « le domaine étant
 * temporel, il existe au moins un scénario de cycle complet ». Une case de checklist
 * n'est pas un fait lisible par un script : c'est une **affirmation de l'agent** qui
 * l'a cochée.
 *
 * Ce contrôle vérifie donc ce qui est vérifiable — le `test_plan` existe, il est
 * `approved`, et le document **déclare** un scénario de cycle — et il **nomme** la
 * limite dans sa sortie. Le mot « déclare » est le mot important : ce qui est vérifié
 * est la **présence** d'une déclaration, pas sa justesse. Un scénario de cycle
 * complet écrit pour la mauvaise propriété passe ici.
 *
 * C'est la limite générale de Fast Track, écrite dans sa propre référence : *« une
 * porte vérifie la présence et la conformité, pas la justesse »*. La propped up par
 * un mot dans la sortie vaut mieux que la même limite cachée derrière un `pass: true`.
 */
function cycleScenarioCondition(root, state, problems) {
  const tp = (state.deliverables || {})['test_plan'];
  if (!tp) {
    problems.push({ condition: 'Stratégie de test (phases4-7)', met: false, detail: 'aucun `test_plan` enregistré' });
    return;
  }
  if (tp.status === 'not_started') {
    problems.push({ condition: 'Stratégie de test (phases4-7)', met: false, detail: '`test_plan` est `not_started`' });
    return;
  }
  if (tp.status !== 'approved') {
    problems.push({ condition: 'Stratégie de test (phases4-7)', met: false, detail: `\`test_plan\` est \`${tp.status}\`, pas \`approved\`` });
    return;
  }
  const abs = L.toAbs(root, tp.path || '.forge/test-plan.md');
  if (!fs.existsSync(abs)) {
    problems.push({ condition: 'Stratégie de test (phases4-7)', met: false, detail: `\`${tp.path}\` est enregistré mais absent du disque` });
    return;
  }
  const declares = /^#{2,4}\s.*cycle\s+complet/im.test(fs.readFileSync(abs, 'utf-8'));
  if (!declares) {
    problems.push({
      condition: 'Stratégie de test (phases4-7)',
      met: false,
      detail: `\`${tp.path}\` ne déclare aucun scénario de cycle complet`
    });
  }
}

function checkFastTrack(root, flags) {
  const state = loadStateOrFail(root);

  // Les deux réglages sont **indépendants** et choisis à l'activation, pas un
  // commutateur unique : c'est la première phrase de `fast-track.md`. Un défaut qui
  // prend `--scope phases4-7` sans autonomie prend un mode que personne n'a choisi.
  const flagValue = (name, allowed, fallback) => {
    const hit = flags.find(f => f === `--${name}` || f.startsWith(`--${name}=`));
    if (!hit) return fallback;
    const value = hit.includes('=') ? hit.split('=')[1] : (flags[flags.indexOf(hit) + 1] || '');
    if (!allowed.includes(value)) {
      L.fail({ error: 'bad_flag_value', flag: `--${name}`, value, allowed, hint: allowed.map(a => `--${name}=${a}`).join(' · ') });
    }
    return value;
  };
  const scope = flagValue('scope', ['plans', 'phases4-7'], 'plans');
  const autonomy = flagValue('autonomy', ['milestone', 'full'], 'milestone');

  const problems = [];

  // --- conditions d'état : cinq livrables ---
  deliverableCondition(state, 'prd', '`prd` est approved', problems);
  deliverableCondition(state, 'conventions', '`conventions` est approved', problems);
  deliverableCondition(state, 'design_system', '`design_system` est approved', problems);
  screensCondition(state, problems);
  deliverableCondition(state, 'benchmarks', '`benchmarks` est approved', problems);

  // --- conditions croisées : celles que deux autres scripts savent déjà ---
  const paths = capture('paths', () => checkPaths(root));
  if (!paths.pass) {
    const n = paths.entry.check || 'paths';
    problems.push({ condition: 'Aucun livrable égaré', met: false, detail: `${n} : ${(paths.entry.offenders || paths.entry.missing || []).length} entrée(s) — ${n === 'no_stray_deliverables' ? 'livrable Forge hors .forge/' : 'chemin non canonique ou fichier absent'}` });
  }
  const strays = capture('strays', () => checkStrays(root, false));
  if (!strays.pass) {
    const s = (strays.entry.strays || []).map(x => x.path || x).slice(0, 4);
    problems.push({ condition: 'Aucun livrable égaré', met: false, detail: `${strays.entry.check} : ${strays.entry.strays ? strays.entry.strays.length : 0} égaré(s)${s.length ? ` — ${s.join(', ')}` : ''}` });
  }

  const sansDomaine = (state.findings || []).filter(f => f.status !== 'resolved' && !f.domain);
  if (sansDomaine.length) {
    problems.push({
      condition: 'Aucun constat sans domaine',
      met: false,
      detail: `${sansDomaine.length} constat(s) sans domaine : ${sansDomaine.map(f => f.id).join(', ')}`
    });
  }

  // --- condition de portée : `phases4-7` seulement ---
  if (scope === 'phases4-7') cycleScenarioCondition(root, state, problems);

  // Les contrôles empruntés ont pu basculer `results.pass` ; la réponse du mode est
  // celle de **ses** conditions, rien d'autre.
  results.pass = problems.length === 0;

  record('fast_track_ready', problems.length === 0, {
    scope,
    autonomy,
    conditions_checked: 7 + (scope === 'phases4-7' ? 1 : 0),
    problems,
    limits: [
      'La présence d\'un scénario de cycle complet est vérifiée ; sa justesse ne l\'est pas.',
      'Les huit conditions portent sur l\'État et sur la propreté du dossier, pas sur la qualité des plans.'
    ],
    rule: "Le mode avait une table de huit conditions et une promesse de refus, sans code derrière. " +
          "Un mode dont la porte n'existe que dans la prose est un mode qui valide des plans contre des " +
          "livrables en `draft` — et `state.js start`, `forge-guard all` et `consistency-check all` " +
          "valident tous les trois un tel projet, parce qu'ils répondent à une autre question."
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
    checkPrematureArtifacts(root);
    checkContract(root);
    checkStrayCharacters(root);
    checkHashes(root);
    checkProvenance(root);
    checkUndecidedSlots(root);
  },
  sync: (root, flags) => checkSync(root, flags.includes('--fix')),
  placeholders: (root) => checkPlaceholders(root),
  facts: (root) => checkFacts(root),
  'hash-check': (root) => checkHashDrift(root),
  anchor: (root) => checkAnchor(root),
  'fast-track': (root, flags) => checkFastTrack(root, flags),
  contract: (root) => checkContract(root),
  all: (root, flags) => {
    checkAnchor(root);
    checkPaths(root);
    checkStrays(root, flags.includes('--relocate'));
    checkStateSchema(root);
    checkStatusVocab(root);
    checkPathsExist(root);
    checkPhaseRequirements(root);
    checkPrematureArtifacts(root);
    checkContract(root);
    checkStrayCharacters(root);
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
        'fast-track': 'forge-guard fast-track <root> [--scope plans|phases4-7] [--autonomy milestone|full]',
        contract: 'forge-guard contract <root>',
        all: 'forge-guard all <root> [--fix] [--relocate]',
        note: 'Tous les contrôles de `state` sont aussi dans `all`. ' +
              '`fast-track` n\'y est PAS : deux de ses conditions portent sur des livrables de phase 3 et 6, ' +
              'qui feraient échouer tout projet ordinaire. Il se demande — et quand on le demande, il échoue et nomme chaque condition non remplie.'
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
