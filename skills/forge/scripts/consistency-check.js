#!/usr/bin/env node
'use strict';

/**
 * consistency-check.js — vérification INTER-artefacts.
 *
 * Pourquoi ce script existe. Sur un projet réel, le motif le plus coûteux n'était
 * pas « une spec incomplète » : c'était « un artefact ultérieur révèle un défaut
 * d'un artefact antérieur déjà approuvé ». Compté 13 fois. Et la phrase qui suit,
 * dans le journal du projet, est celle-ci :
 *
 *   « Aucun contrôle du gate ne l'attrape : les seize plans passent 11/11. »
 *
 * Parce qu'un contrôle qui lit UN document ne peut pas voir l'écart entre DEUX
 * documents. C'est la limite de l'outillage, pas de l'agent.
 *
 * Ce script confronte donc les artefacts entre eux :
 *   PRD ↔ architecture ↔ plans ↔ tests ↔ écrans ↔ décisions
 *
 * Zéro dépendance. Lecture seule.
 */

const fs = require('fs');
const path = require('path');
const L = require('./lib/forge-lib');

const results = { checks: [], pass: true };

function record(name, pass, details) {
  results.checks.push({ check: name, status: pass ? 'pass' : 'fail', ...details });
  if (!pass) results.pass = false;
}

function skip(name, why) {
  results.checks.push({ check: name, status: 'skip', reason: why });
}

function read(root, rel) {
  const p = L.toAbs(root, rel);
  return fs.existsSync(p) ? fs.readFileSync(p, 'utf-8') : null;
}

function loadStateOrFail(root) {
  const state = L.readState(root);
  if (!state) L.fail({ error: 'no_state', path: L.statePath(root) });
  if (state.version === 1 || state.documents) {
    L.fail({
      error: 'legacy_state_v1',
      hint: `node "$FORGE/scripts/state.js" migrate ${root}`,
      reference: 'references/migration-v1-v2.md'
    });
  }
  return state;
}

/* ------------------------------------------------------------------ *
 * Extraction
 * ------------------------------------------------------------------ */

/** Les IDs sont definitions OU references : les deux comptent pour la couverture. */
const ID_PATTERNS = {
  B: /\bB(\d{1,4})\b/g,
  E: /\bE(\d{1,4})\b/g,
  C: /\bC(\d{1,4})\b/g
};

/** Section de définition : un ID est *défini* s'il apparaît dans un titre de règle. */
const DEF_HEADING = {
  B: /^(?:###\s*)?\*{0,2}B(\d{1,4})\b[—\-:.]/gm,
  E: /^(?:###\s*)?\*{0,2}E(\d{1,4})\b[—\-:.]/gm,
  C: /^(?:###\s*)?\*{0,2}C(\d{1,4})\b[—\-:.]/gm
};

function allIds(content, kind) {
  const out = new Set();
  if (!content) return out;
  const re = ID_PATTERNS[kind];
  re.lastIndex = 0;
  let m;
  while ((m = re.exec(content)) !== null) out.add(m[1]);
  return out;
}

function definedIds(content, kind) {
  const out = new Set();
  if (!content) return out;
  const re = DEF_HEADING[kind];
  re.lastIndex = 0;
  let m;
  while ((m = re.exec(content)) !== null) out.add(m[1]);
  return out;
}

function planPaths(state) {
  return Object.entries(state.slices || {})
    .map(([name, s]) => ({ name, rel: s.plan_path || `${L.FORGE_DIR}/plans/${name}.md` }));
}

/* ------------------------------------------------------------------ *
 * 1. Le plan existe-t-il, et teste-t-il vraiment quelque chose
 * ------------------------------------------------------------------ */

function countTestCases(root, sliceName) {
  const testsRoot = path.join(root, 'test');
  if (!fs.existsSync(testsRoot)) return { file: null, count: 0 };
  const files = L.listFilesRecursive(testsRoot).filter(f => /\.(dart|ts|tsx|js|jsx|py|go|rs|java|kt)$/.test(f));
  const named = files.find(f => path.basename(f).includes(sliceName));
  if (!named) return { file: null, count: 0 };
  const src = fs.readFileSync(named, 'utf-8');
  const count =
    (src.match(/^\s*(test|testWidgets|it)\s*\(/gm) || []).length +
    (src.match(/@Test/g) || []).length +
    (src.match(/^\s*def test_/gm) || []).length;
  return { file: path.relative(root, named), count };
}

const DONE = /^(approved|done|validated|implemented|complete|completed)$/;

function checkSliceReality(root, state) {
  const slices = Object.entries(state.slices || {});
  if (!slices.length) return skip('slice_reality', 'aucune slice déclarée (Phase 4 non atteinte)');

  // Les plans sont produits en Phase 5. Tant que cette phase n'est pas
  // franchie, leur absence n'est pas un défaut : c'est l'ordre normal.
  //
  // Constaté sur un test grandeur nature : `consistency-check all` sortait en
  // échec au gate de la Phase 4, sur les dix plans qui n'existaient pas encore —
  // pour la raison exacte qu'on était en train de faire ce qu'on fait dans
  // l'ordre prévu. Un contrôle qui échoue pour une information qu'on n'a pas
  // encore à produire apprend à être ignoré.
  const plansExpected = ((state.phases || {})['5_implementation_plan'] || {}).status === 'approved';

  const missingPlan = [];
  const missingTest = [];
  const falseDone = [];

  for (const [name, s] of slices) {
    const rel = s.plan_path || `${L.FORGE_DIR}/plans/${name}.md`;
    const planExists = fs.existsSync(L.toAbs(root, rel));
    const { file, count } = countTestCases(root, name);

    // Avant la Phase 5, seule une DERIVE compte — et « le fichier existait » se
    // prouve par le `content_hash` enregistré au moment du `register`. Un plan
    // enregistré sans hash n'a jamais été écrit : ce n'est pas une dérive, c'est
    // le travail de la Phase 5 qui n'a pas commencé.
    if (!planExists && (plansExpected || s.content_hash)) missingPlan.push({ slice: name, expected: rel });
    if (DONE.test(s.status || '') && count === 0) {
      // Le défaut le plus coûteux : rend le fichier de suivi FAUX, sans signal.
      falseDone.push({
        slice: name,
        status: s.status,
        plan_exists: planExists,
        test_file: file,
        test_count: 0,
        detail: file
          ? `le fichier ${file} existe mais ne déclare aucun cas de test`
          : 'aucun fichier de test ne porte le nom de la slice'
      });
    }
    if (file && count === 0) missingTest.push({ slice: name, file });
  }

  record('slice_plan_exists', missingPlan.length === 0, {
    plans_expected: plansExpected,
    missing: missingPlan,
    rule: plansExpected
      ? 'Une slice déclarée sans plan ne sera jamais implémentée.'
      : 'Avant la Phase 5, un plan manquant est l\'ordre normal. Seul compte un plan ENREGISTRÉ dont le fichier a disparu.'
  });
  record('slice_marked_done_has_tests', falseDone.length === 0, {
    suspect: falseDone,
    rule: 'Un statut « fait » sans cas de test est une affirmation, pas un fait. Présence du fichier ≠ test qui vérifie.'
  });
}

/* ------------------------------------------------------------------ *
 * 2. Traçabilité des IDs : PRD → plan → test
 * ------------------------------------------------------------------ */

function checkIdTraceability(root, state) {
  const prdRel = (state.deliverables || {}).prd && state.deliverables.prd.path;
  const prd = prdRel ? read(root, prdRel) : null;
  if (!prd) return skip('id_traceability', 'PRD absent ou non enregistré');

  const planContents = planPaths(state)
    .map(p => read(root, p.rel))
    .filter(Boolean);

  if (!planContents.length) return skip('id_traceability', 'aucun plan sur disque (Phase 5 non atteinte)');

  const covered = { B: new Set(), E: new Set(), C: new Set() };
  for (const kind of ['B', 'E', 'C']) {
    for (const c of planContents) for (const id of allIds(c, kind)) covered[kind].add(id);
  }

  const orphans = {};
  for (const kind of ['B', 'E', 'C']) {
    const defined = definedIds(prd, kind);
    if (!defined.size) continue;
    const missing = [...defined].filter(id => !covered[kind].has(id)).sort((a, b) => Number(a) - Number(b));
    if (missing.length) orphans[kind] = missing.map(id => `${kind}${id}`);
  }

  const hasOrphans = Object.keys(orphans).length > 0;
  record('ids_traced_to_plans', !hasOrphans, {
    orphans,
    rule: "Chaque règle, edge case et contrainte défini(e) dans le PRD doit apparaître dans au moins un plan.",
    note: 'Un ID orphelin n\'est pas forcément faux : une règle peut êtreV1. Vérifie qu\'elle est reportée ou explicitement hors périmètre.'
  });
}

/* ------------------------------------------------------------------ *
 * 3. Le plan déclare-t-il les IDs qu'il prétend couvrir ?
 * ------------------------------------------------------------------ */

/** Clé state.json qui porte les IDs d'un genre donné. */
const ID_FIELD = { B: 'rule_ids', E: 'edge_case_ids', C: 'constraint_ids' };

/** Normalise « B12 », « b12 », « B-12 », 12 → « 12 ». */
function normalizeId(v) {
  const m = String(v).match(/(\d{1,4})\s*$/);
  return m ? m[1] : null;
}

function checkPlanSelfConsistency(root, state) {
  const slices = Object.entries(state.slices || {});
  if (!slices.length) return skip('plan_declared_coverage', 'aucune slice déclarée');

  const inflated = [];

  for (const [name, s] of slices) {
    const rel = s.plan_path || `${L.FORGE_DIR}/plans/${name}.md`;
    const content = read(root, rel);
    if (!content) continue;

    for (const kind of ['B', 'E', 'C']) {
      // Un genre donné ne doit hériter que de son propre champ. Un repli
      // générique sur rule_ids ferait porter les IDs B à E et C.
      const declared = s[ID_FIELD[kind]];
      if (!Array.isArray(declared) || !declared.length) continue;

      const present = allIds(content, kind);
      const absent = declared
        .map(normalizeId)
        .filter(id => id && !present.has(id))
        .map(id => `${kind}${id}`);

      if (absent.length) inflated.push({ slice: name, kind, declared_absent_from_plan: absent });
    }
  }

  record('plan_contains_declared_ids', inflated.length === 0, {
    inflated,
    rule: "Un ID déclaré dans state.json mais absent du plan rend la couverture annoncée fausse."
  });
}

/* ------------------------------------------------------------------ *
 * 4. Écrans ↔ slices ↔ navigation
 * ------------------------------------------------------------------ */

function checkScreenCoverage(root, state) {
  const screens = Object.keys(state.screens || {});
  if (!screens.length) return skip('screen_coverage', 'aucun écran déclaré (Phase 3 non atteinte)');

  const allPlans = planPaths(state).map(p => read(root, p.rel) || '').join('\n');
  const allSlices = JSON.stringify(state.slices || {});
  const slicesDeclared = Object.keys(state.slices || {}).length > 0 || allPlans.length > 0;

  const nav = (state.index || {}).nav;
  let navWithoutScreen = [];
  if (nav && Array.isArray(nav.items)) {
    navWithoutScreen = nav.items
      .filter(it => it && !it.overflow)
      .filter(it => !screens.some(s => s === it.key || s.includes(it.key) || it.key.includes(s)))
      .map(it => it.key);
  }

  // Le lien écran ↔ slice n'existe qu'à partir du moment où il existe des
  // slices. Sans slice déclarée, exiger ce lien au gate du design, c'est
  // demander une information que la phase courante ne peut pas produire : le
  // gate échoue alors pour une raison étrangère à l'artefact présenté, et la
  // seule façon de « passer » est d'ignorer l'échec.
  //
  // Constaté sur un test grandeur nature : au gate de la Phase 3, avec 9
  // écrans parfaitement conformes, `screens_have_slices` échouait sur les 9 —
  // la réponse étant de ne plus lire la sortie.
  //
  // La navigation, en revanche, se vérifie dès maintenant : elle est
  // déclarée dans le même document que les écrans.
  // Le lien écran ↔ slice s'établit quand les plans existent. Avant la Phase 5,
  // les slices sont déclarées par la Phase 4 sans plan : exiger le lien à ce
  // stade, c'est exiger une information que la phase courante ne peut pas
  // produire — même erreur que le lien initial, mais un an plus tard.
  const plansWritten = planPaths(state).some(p => fs.existsSync(L.toAbs(root, p.rel)));

  if (slicesDeclared && plansWritten) {
    const noSlice = screens.filter(s => !allPlans.includes(s) && !allSlices.includes(s));
    record('screens_have_slices', noSlice.length === 0, {
      screens_without_slice: noSlice,
      rule: "Un écran de design sans slice ne sera jamais implémenté — c'est le « trou de la décomposition »."
    });
  } else if (slicesDeclared) {
    skip('screens_have_slices', 'aucun plan de slice écrit — le lien écran ↔ slice se vérifie à partir de la Phase 5');
  } else {
    skip('screens_have_slices', 'aucune slice déclarée — le lien écran ↔ slice se vérifie à partir de la Phase 4');
  }

  if (nav) {
    record('nav_items_have_screens', navWithoutScreen.length === 0, {
      nav_without_screen: navWithoutScreen,
      rule: "Chaque entrée de navigation renvoie à au moins un écran. Un slot sans écran est un module vide."
    });
  } else {
    skip('nav_items_have_screens', 'navigation non enregistrée (state.js set-nav)');
  }
}

/* ------------------------------------------------------------------ *
 * 5. Une question ouverte citée comme bloquante alors qu'une décision la tranche
 * ------------------------------------------------------------------ */

function checkOpenQuestions(root, state) {
  const decisions = read(root, 'DECISIONS.md');
  if (!decisions) return skip('open_questions_resolved', 'DECISIONS.md absent (project-rules-architect)');

  // Questions ouvertes : state.json legacy, ou le PRD.
  const openFromState = Object.entries(state.open_questions_resolved || {});
  if (!openFromState.length) return skip('open_questions_resolved', 'aucune question ouverte enregistrée');

  const adrs = new Set((decisions.match(/^## ADR-\d+/gm) || []).map(h => h.replace('## ', '')));
  const stillOpen = [];
  for (const [q, resolvedBy] of openFromState) {
    if (resolvedBy && adrs.has(String(resolvedBy))) stillOpen.push({ question: q, decided_by: resolvedBy });
  }

  record('open_questions_resolved', stillOpen.length === 0, {
    resolved_but_still_open: stillOpen,
    rule: "Une question tranchée par une ADR mais encore citée comme bloquante fait échouer une slice sur un sujet clos."
  });
}

/* ------------------------------------------------------------------ *
 * 6. Les constats trouvés ne sont pas comptés comme du travail fait
 * ------------------------------------------------------------------ */

function checkFindings(root, state) {
  const findings = state.findings || [];
  if (!findings.length) return skip('findings_promoted', 'aucun constat enregistré');

  const withoutDomain = findings.filter(f => !f.domain);
  const openUnpromoted = findings.filter(f => !f.promoted_to && f.status !== 'resolved');

  record('findings_have_domain', withoutDomain.length === 0, {
    without_domain: withoutDomain.map(f => ({ id: f.id, summary: (f.summary || '').slice(0, 100) })),
    rule: "Un constat sans domaine n'a aucune cible de promotion : il reste un journal, pas une règle."
  });

  results.checks.push({
    check: 'findings_promoted',
    status: openUnpromoted.length ? 'warn' : 'pass',
    open_unpromoted: openUnpromoted.length,
    items: openUnpromoted.slice(0, 10).map(f => ({ id: f.id, domain: f.domain, severity: f.severity })),
    rule: "Un constat qui n'atteint jamais un fichier de règles n'a rien changé.",
    next: openUnpromoted.length
      ? `Invoquer project-rules-architect pour promouvoir ${openUnpromoted.length} constat(s).`
      : null
  });
}

/* ------------------------------------------------------------------ *
 * CLI
 * ------------------------------------------------------------------ */

/**
 * Prémisses retirées sous un livrable approuvé.
 *
 * C'est le contrôle qui manquait le plus. Tous les autres vérifient qu'un
 * artefact est cohérent avec un artefact **postérieur** : ils sautent tous
 * jusqu'à ce que les plans existent. Or le motif le plus coûteux d'un projet
 * est précisément l'inverse — un artefact antérieur **approuvé**, dont un
 * artefact postérieur révèle qu'il reposait sur une prémisse abandonnée.
 *
 * Constaté sur un test grandeur nature : `conventions.md`, approuvé en Phase 0,
 * justifiait PostgreSQL par « la réponse à l'exigence multi-tenant strict ».
 * Le PRD, écrit plus tard, a mis le multi-tenant hors scope faute de second
 * client, et l'isolation par ligne à la place. Les deux documents ne peuvent
 * pas rester vrais ensemble. `consistency-check all` répondait `pass: true`,
 * parce que tous ses contrôles exigeaient une slice, un plan, un écran ou un
 * DECISIONS.md — rien de tout cela n'existait à la fin de la Phase 1.
 *
 * Le mécanisme ne fait pas d'analyse de texte : un livrable **déclare** les IDs
 * de règles dont il dépend, et on compare ces IDs à l'état réel du PRD. La
 * section « Hors scope » du gabarit est la seule structure lue, parce que c'est
 * celle que le skill contrôle lui-même.
 */
function checkPremises(root, state) {
  const prd = (state.deliverables || {}).prd;
  if (!prd || !prd.path) {
    return skip('premises', 'aucun PRD (Phase 1 non atteinte)');
  }
  const prdAbs = L.toAbs(root, prd.path);
  if (!fs.existsSync(prdAbs)) {
    return skip('premises', `PRD introuvable : ${prd.path}`);
  }
  const text = fs.readFileSync(prdAbs, 'utf-8');

  // Découpe le PRD : le « hors scope » du gabarit est la seule zone où un ID
  // présent signifie « cette exigence a été retirée ».
  //
  // Et une entrée de hors scope SANS ID est elle-même un défaut : retirer une
  // exigence en lui ôtant son identifiant empêche toute mention ultérieure.
  // Le retrait devient invisible au moment précis où il coûte le plus cher.
  const lines = text.split('\n');
  const inHorsScope = new Set();
  const untraceable = [];

  // Où chaque ID est *défini* : une ligne de tableau `| C1 | …` ou une puce
  // en tête. Un ID défini deux fois avec deux sens différents n'est pas un
  // identifiant, c'est une collision — et le contrôle qui s'appuie dessus va
  // alors accuser le mauvais livrable, en citant une exigence sans rapport.
  // Constaté en corrigeant le projet de test : C1 valait « multi-tenant
  // strict » en hors scope et « un seul serveur » en contraintes.
  const definitions = new Map();
  let section = '';
  let hors = false;
  const noteDefinition = (id, label, sec) => {
    if (!definitions.has(id)) definitions.set(id, []);
    definitions.get(id).push({ label: label.slice(0, 70), section: sec });
  };

  for (const line of lines) {
    const h = line.match(/^##\s+(.*)$/);
    if (h) { section = h[1].trim(); hors = /hors[ -]?scope/i.test(section); }

    // Ligne de tableau : | B1 | texte |, ou | C1 | texte |
    const row = line.match(/^\|\s*\*{0,2}([BCE]\d+)\*{0,2}\s*\|\s*([^|]*)/);
    if (row) {
      noteDefinition(row[1], row[2], section);
      if (hors) inHorsScope.add(row[1]);
      continue;
    }

    if (!hors) continue;
    const isBullet = /^\s*[-*]\s+/.test(line);
    if (!isBullet) continue;
    // L'ID doit être en TÊTE de l'entrée, comme le prescrit le gabarit
    // (`B7 — titre`). Un ID cité dans la raison ne rend pas le retrait
    // traçable : il dit qu'une autre exigence existe, pas que celle-ci est
    // retirée. Accepter une mention en prose ferait passer un retrait non
    // déclaré pour un retrait déclaré.
    const head = line.replace(/^\s*[-*]\s+/, '');
    const lead = head.match(/^\*\*([BCE]\d+)\*\*\s*[-—:]?\s*/) || head.match(/^([BCE]\d+)\s*[-—:]\s*/);
    if (!lead) {
      const label = head.split('—')[0].trim();
      untraceable.push({
        line: label.slice(0, 80),
        why: 'exigence retirée sans son ID en tête d\'entrée — plus rien ne peut dire ' +
             'qu\'un livrable approuvé reposait dessus'
      });
      continue;
    }
    inHorsScope.add(lead[1]);
    noteDefinition(lead[1], head.replace(lead[0], '').split('—')[0].trim(), section);
  }

  const collisions = [];
  for (const [id, defs] of definitions) {
    const sections = new Set(defs.map(d => d.section));
    if (defs.length > 1 && sections.size > 1) {
      collisions.push({
        id,
        defined_in: defs,
        why: `l'ID ${id} désigne deux exigences différentes. Toute référence à ${id} ` +
             'devient ambiguë — y compris celle de ce contrôle.'
      });
    }
  }

  // Les IDs déclarés, et leur état.
  const declared = new Set();
  for (const m of text.matchAll(/\b([BCE]\d+)\b/g)) declared.add(m[1]);

  const retired = [];
  const unknown = [];
  const undeclared = [];
  const checked = [];

  for (const [key, d] of Object.entries(state.deliverables || {})) {
    if (d.status !== 'approved' && d.status !== 'in_review') continue;
    if (key === 'prd') continue;

    if (!Array.isArray(d.requires) || !d.requires.length) {
      undeclared.push({
        deliverable: key,
        why: 'approuvé sans déclarer les exigences dont il dépend',
        hint: `node "$FORGE/scripts/state.js" register <anchor> deliverable ${key} ${d.path} --requires=B1,C1`
      });
      continue;
    }
    for (const id of d.requires) {
      checked.push({ deliverable: key, premise: id });
      if (inHorsScope.has(id)) {
        retired.push({
          deliverable: key, premise: id, path: d.path,
          why: `l'exigence ${id} est dans la section « Hors scope » du PRD, ` +
               `mais ${key} a été approuvé en s'appuyant dessus`
        });
      } else if (!declared.has(id)) {
        unknown.push({
          deliverable: key, premise: id,
          why: `l'exigence ${id} n'existe pas dans le PRD — la référence est morte`
        });
      }
    }
  }

  /* ---------------------------------------------------------------- *
   * Ce que `--requires` ne voit pas.
   *
   * Les prémisses déclarées sont une liste **saisie à la main**. Un
   * livrable approuvé peut donc justifier ses décisions par une exigence
   * retirée sans que l'ID soit déclaré : la déclaration reste vraie — elle
   * est simplement fausse par omission, et rien ne la contredit.
   *
   * Constaté sur un test grandeur nature : `conventions.md`, approuvé en
   * Phase 0, justifiait cinq décisions (Next.js SSR, URL-as-state, Playwright,
   * stratégie de session, slug+version) par « le partage par lien », exigence
   * retirée plus tard en Phase 1. `retired: []`, `pass: true`. La
   * justification était en **prose**, donc invisible à toute comparaison
   * d'IDs — ce que ce contrôle peut détecter, en revanche, c'est la
   * citation textuelle de l'ID retiré dans le document.
   *
   * C'est un avertissement, pas un échec : un document a le droit de
   * *mentionner* une exigence retirée, à condition de le faire
   * explicitement (« B18 retiré »). Ce que l'avertissement garantit, c'est
   * que chaque citation soit vue et confirmée — ce qui était impossible
   * auparavant, puisque l'information n'était produite nulle part.
   * ---------------------------------------------------------------- */
  const retiredCited = [];
  for (const [key, d] of Object.entries(state.deliverables || {})) {
    if (d.status !== 'approved' && d.status !== 'in_review') continue;
    if (key === 'prd' || !d.path) continue;
    const body = read(root, d.path);
    if (!body) continue;
    for (const id of inHorsScope) {
      if (!new RegExp(`\\b${id}\\b`).test(body)) continue;
      const lines = body.split('\n');
      const hits = lines
        .map((l, i) => ({ l, i }))
        .filter(({ l }) => new RegExp(`\\b${id}\\b`).test(l))
        .map(({ l, i }) => ({
          line: i + 1,
          excerpt: l.trim().slice(0, 120),
          // L'acquittement se lit sur la ligne ENTIÈRE, jamais sur l'extrait.
          // Sur l'extrait tronqué à 120 caractères, une citation explicitement
          // acquittée en fin de ligne passait pour non acquittée — donc pour un
          // défaut. Un contrôle qui signale un défaut inexistant apprend à être
          // ignoré.
          acknowledged: /retir[ée]|écarté|écartée|abandonn|hors\s*scope/i.test(l)
        }));
      // Une mention explicite du retrait est légitime : c'est même exactement ce
      // que l'on veut voir.
      const acknowledged = hits.filter(h => h.acknowledged);
      retiredCited.push({
        deliverable: key, premise: id, path: d.path,
        citations: hits.length,
        acknowledged: acknowledged.length,
        acknowledged_only: acknowledged.length === hits.length,
        hits: hits.slice(0, 4)
      });
    }
  }

  // Une citation qui ANNONCE le retrait est légitime — c'est même exactement ce
  // qu'on veut voir. Seules les citations non acquittées méritent un signal :
  // un contrôle qui signale un défaut inexistant apprend à être ignoré.
  const unacknowledgedCitations = retiredCited.filter(r => !r.acknowledged_only);

  const pass = retired.length === 0 && unknown.length === 0 && untraceable.length === 0 &&
    collisions.length === 0;
  record('premises', pass, {
    retired,
    unknown,
    undeclared,
    untraceable,
    collisions,
    retired_cited_in_body: retiredCited,
    retired_cited_without_acknowledgement: unacknowledgedCitations,
    declared_dependencies: checked.length,
    rule: 'Un livrable approuvé qui se justifie par une exigence retirée reste un livrable ' +
          'approuvé, et rien ne le signale. C\'est le motif le plus coûteux d\'un projet : ' +
          'l\'artefact tardif révèle le défaut de l\'artefact déjà validé.'
  });
  // Les livrables approuvés sans prémisse déclarée ne sont pas une erreur —
  // un PRD ne dépend de rien — mais l'omission doit être visible, sinon la
  // dépendance reste non déclarée pour de bon. Idem pour la citation d'un ID
  // retiré : elle est légitime si elle annonce le retrait.
  if (pass && (undeclared.length || unacknowledgedCitations.length)) {
    const entry = results.checks[results.checks.length - 1];
    entry.status = 'warn';
  }
}

const CHECKS = {
  reality: (root, state) => checkSliceReality(root, state),
  ids: (root, state) => checkIdTraceability(root, state),
  plans: (root, state) => checkPlanSelfConsistency(root, state),
  screens: (root, state) => checkScreenCoverage(root, state),
  questions: (root, state) => checkOpenQuestions(root, state),
  findings: (root, state) => checkFindings(root, state),
  premises: (root, state) => checkPremises(root, state)
};

function main() {
  const argv = process.argv.slice(2);
  const command = argv[0] || 'all';
  const root = path.resolve(argv[1] && !argv[1].startsWith('--') ? argv[1] : process.cwd());
  const state = loadStateOrFail(root);

  if (command !== 'all' && !CHECKS[command]) {
    L.fail({
      error: 'unknown_command', command,
      usage: {
        all: 'consistency-check.js all <anchor>',
        reality: 'consistency-check.js reality <anchor>   # plan + tests réellement présents',
        ids: 'consistency-check.js ids <anchor>         # PRD → plans',
        plans: 'consistency-check.js plans <anchor>      # state.json → contenu du plan',
        screens: 'consistency-check.js screens <anchor>   # écrans ↔ slices ↔ navigation',
        questions: 'consistency-check.js questions <anchor> # questions ouvertes vs ADR',
        findings: 'consistency-check.js findings <anchor>  # constats routés et promus',
        premises: 'consistency-check.js premises <anchor>  # prémisses retirées sous un livrable approuvé'
      },
      note: 'Vérifie les écarts ENTRE artefacts. Aucun contrôle unitaire ne peut les voir.'
    });
  }

  const toRun = command === 'all' ? Object.keys(CHECKS) : [command];
  for (const c of toRun) CHECKS[c](root, state);

  const failed = results.checks.filter(c => c.status === 'fail');
  const warned = results.checks.filter(c => c.status === 'warn');

  L.out({
    command: `consistency-check ${command}`,
    anchor: root,
    pass: results.pass,
    failed: failed.map(c => c.check),
    warned: warned.map(c => c.check),
    checks: results.checks
  });

  if (!results.pass) process.exit(1);
}

main();
