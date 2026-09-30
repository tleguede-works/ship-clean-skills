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
    //
    // ## Pourquoi le `content_hash` n'a pas cours ici
    //
    // Le `content_hash` prouve qu'un fichier **existant** a changé hors bande. Il
    // ne prouve **rien** sur un fichier absent. Et une slice de Phase 4 est
    // enregistrée **avec** un hash — celui du document d'architecture, qui est
    // son lieu de description. La slice n'a donc aucun hash propre, et lire son
    // `content_hash` comme une preuve de plan revient à dire « l'architecture a
    // été écrite, donc chaque slice a un plan ».
    //
    // Conséquence mesurée sur Onduleur, au gate de la Phase 4 : les 15 slices ont
    // été enregistrées contre `.forge/architecture.md`, donc toutes portaient un
    // `content_hash`, donc toutes étaient exigées d'avoir déjà un plan dans
    // `.forge/plans/` — **et aucune n'en a**. L'échec est légitime dans son
    // principe (un plan annoncé doit exister) mais il portait sur 15 fichiers dont
    // personne n'avait écrit le nom, sur une phase où les écrire est le travail
    // de la phase **suivante**.
    //
    // La preuve est donc **`plan_hash`**, écrit par `register` uniquement quand le
    // chemin enregistré est un chemin de plan. Un seul endroit décide, sinon les
    // deux lectures divergent à nouveau sur le même enregistrement.
    //
    // `plan_hash` est la preuve qu'un **fichier de plan** a été écrit : `register`
    // ne l'écrit que si le chemin enregistré est un chemin de plan. Son absence ne
    // prouve donc rien du plan — ni qu'il a été écrit, ni qu'il a disparu.
    const planWasWritten = Boolean(s.plan_hash);
    if (!planExists && (plansExpected || planWasWritten)) missingPlan.push({ slice: name, expected: rel });
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

/* ------------------------------------------------------------------ *
 * Parité des états — pointeur DÉCLARÉ entre design et architecture
 * ------------------------------------------------------------------ */

/**
 * Les états d'un composant, et l'union d'architecture qui les rend.
 *
 * Le design system **déclare** le pointeur : `**États** — rendus par l'union
 * `X`, sauf `y` :`. Ce contrôle ne fait que le résoudre. Il n'infère rien.
 *
 * Trois versions de ce contrôle ont été essayées avant que celle-ci ne tienne,
 * et les trois échouaient de la même façon — par **jointure heuristique** :
 *
 * 1. Jointure sur les seuls noms, sans déclaration. 22 signalements sur le
 *    projet de test, dont 19 faux : `empty-no-data` (design) et
 *    `empty_no_data` (architecture) sont le même fait, et rien ne le disait.
 * 2. Jointure bidirectionnelle. Ajoute `SemanticState` — qui est un
 *    **calcul** — contre `IndicatorDisplayState`, qui est un **rendu** : deux
 *    choses de nature différente, rapprochées parce que leurs noms se
 *    ressemblent.
 * 3. Jointure sur tous les types `*State`. Le motif availait la
 *    terminaison de l'union et avalait les valeurs de `DataTableProps.variant`
 *    (`drill`, `reference`, `text`…), qui ne sont pas des états.
 *
 * Le défaut commun n'était pas dans les expressions : c'était de **deviner
 * quelle union correspond à quel composant**. Une correspondance devinée est
 * fausse dans les deux sens, et elle est fausse de façon_si_nsystématique —
 * c'est-à-dire non fermable.
 *
 * Avec un pointeur déclaré par l'auteur, l'unité de vérification est la
 * déclaration : le contrôleur résout, il ne conclusions pas. Un écart reste
 * alors un vrai écart, et il est nommable.
 *
 * Même règle que `derived_from`, `content_hash`, `state_frontmatter_in_sync`,
 * la parité de surface et la citation verbatim : **un contrôle qui marche est
 * une résolution de pointeur, jamais une interprétation.**
 */
function readDeclaredStates(md) {
  const out = [];
  const re = /^#{2,4}\s+([A-Z][A-Za-z0-9]*)\s*$/gm;
  const heads = [...md.matchAll(re)];
  heads.forEach((h, i) => {
    const body = md.slice(h.index, i + 1 < heads.length ? heads[i + 1].index : md.length);
    // `**États** — rendus par l'union `X`, sauf `a`, `b` :`
    const label = body.match(/^\*\*États\*\*\s*(?:—|-)?\s*(.*)$/m);
    if (!label) return;
    // Pas de `return` ici : un composant dont la table `**États**` existe mais
    // qui ne nomme aucune union doit être signalé, pas ignoré. Le `return`
    // rendait cette branche inatteignable — et donc le contrôle muet sur
    // exactement les composants qui n'ont pas encore la convention.
    const union = label[1].match(/union\s+`([A-Za-z0-9]+)`/i);
    const unionName = union ? union[1] : null;

    const exempt = [];
    // `(.+)` jusqu'au DERNIER `:` de la ligne, pas le premier : une raison
    // entre parenthèses contient presque toujours un deux-points (« E5 : … »),
    // et une troncature au premier rendement une exemption sans le dire — donc
    // le contrôle signalait des états que l'auteur venait d'exclure.
    const sauf = label[1].match(/,\s*sauf\s+(.+):\s*$/i);
    if (sauf) for (const hit of sauf[1].matchAll(/`([a-z][a-z0-9_-]*)`/gi)) exempt.push(hit[1]);

    const names = [];
    const after = body.slice(label.index + label[0].length).replace(/^[^\n]*\n/, '');
    for (const line of after.split('\n')) {
      if (/^\|\s*-{2,}/.test(line)) continue;
      if (!line.trim()) continue;
      if (!line.trim().startsWith('|')) break;
      const cell = line.trim().match(/^\|\s*`([a-z][a-z0-9_-]*)`\s*\|/i)
        || line.trim().match(/^\|\s*([a-z][a-z0-9_-]*)\s*\|/i);
      if (cell) names.push(cell[1]);
    }
    // Forme prose : `**États** : `a` · `b``
    if (!names.length) {
      for (const seg of label[1].split('·')) {
        // Le nom de l'union partage le segment du premier état : on prend le
        // PREMIER nom qui n'est pas l'union. Sans cette exclusion, l'union
        // elle-même était lue comme un état, et l'écart sevoyait sur les trois
        // composants écrits en prose.
        let found = null;
        for (const tok of seg.matchAll(/`([A-Za-z][A-Za-z0-9_-]*)`/g)) {
          if (tok[1] === unionName) continue;
          found = tok[1];
          break;
        }
        if (found) names.push(found);
      }
    }
    if (!names.length) return;

    // `union: null` = la table existe mais **ne déclare aucun pointeur**. Ce
    // n'est pas un `skip` : une convention absente sur un composant est
    // précisément ce qui rend le contrôle muet sur ce composant.
    out.push({ component: h[1], union: union ? union[1] : null, states: names, exempt });
  });
  return out;
}

/** Les membres d'une union `export type X = 'a' | 'b' | … ;`. */
/**
 * Les noms d'états sont comparés après normalisation des tirets en tirets bas.
 *
 * C'est une **convention déclarée**, pas une tolérance : le design system
 * écrit `empty-no-data` et l'architecture `empty_no_data` pour le même fait,
 * et il faut que le contrôle le sache au lieu de le deviner. La normalisation
 * est syntaxique et déterministe — elle ne rapproche rien sur le sens, elle
 * ramène une seule graphie. Deux états distincts qui ne différeraient que par
 * ce caractère resteraient un conflit visible : ils se fusionneraient, et la
 * fusion serait signalée comme telle.
 */
function normState(name) {
  return String(name).replace(/-/g, '_');
}

function readUnionMembers(md, union) {
  // Le terminateur est `;` **suivi d'un éventuel commentaire de fin de
  // ligne**, sinon la lecture débordait sur l'instruction suivante : c'est
  // ainsi qu'une variante de composant (`'drill' | 'reference'`) se faisait
  // passer pour des états. C'était le troisième essai de ce contrôle qui
  // tombait là.
  // La borne de 600 caracteres etait une **Bornage de commodite**, pas une regle :
  // une union **documentee** — celle-la meme ou chaque membre porte pourquoi il
  // existe — depasse 600 caracteres, donc la borne la faisait disparaitre et le
  // controle rendait `union_introuvable_dans_l_architecture` sur un document
  // parfaitement correct. C'est la meme famille que la fenetre d'adjacence de
  // 140 caracteres, et la meme lecon : un motif plus etroit que ce que les
  // documents ecrivent n'est pas plus prudent, il est **faux**.
  //
  // Le vrai terminateur est deja ailleurs et il est bon : `;` **en fin de ligne**.
  // Une declaration de type s'y termine ; la ligne suivante est la suivante. La
  // borne n'est donc plus qu'une garde-fou contre un document pathologique — elle
  // peut etre large sans rien laisser passer.
  const re = new RegExp(
    'export\\s+type\\s+' + union + '\\s*=\\s*([\\s\\S]{0,2000}?);[^\\n]*\\n', 'g');
  const members = new Set();
  let m;
  while ((m = re.exec(md)) !== null) {
    const body = m[1].replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');
    for (const hit of body.matchAll(/'([a-z][a-z0-9_-]*)'/gi)) members.add(hit[1]);
  }
  return members;
}

/**
 * Chaque état que le design déclare rendre a un membre dans l'union qu'il a
 * lui-même nommée — et chaque membre de cette union est déclaré par le design.
 */
function checkStateParity(root, state) {
  const check = 'declared_state_parity';
  const ds = Object.values(state.deliverables || {})
    .find(d => d.type === 'design-system' || /design[_-]system/.test(d.type || ''));
  const arch = (state.deliverables || {}).architecture;
  if (!ds || !ds.path) { skip(check, 'aucun design system enregistré'); return; }
  if (!arch || !arch.path) { skip(check, 'aucune architecture enregistrée'); return; }
  const archAbs = L.toAbs(root, arch.path);
  if (!fs.existsSync(archAbs)) { skip(check, '`architecture.md` absent du disque'); return; }

  const declared = readDeclaredStates(fs.readFileSync(L.toAbs(root, ds.path), 'utf-8'));
  if (!declared.length) {
    skip(check, 'le design system ne déclare aucun composant avec une table `**États**` — ' +
      'rien à comparer');
    return;
  }

  const archMd = fs.readFileSync(archAbs, 'utf-8');
  const offenders = [];
  let compared = 0;

  for (const c of declared) {
    if (!c.union) {
      offenders.push({
        component: c.component,
        problem: 'pointeur_non_declare',
        hint: `\`${c.component}\` déclare ${c.states.length} états mais ne nomme pas ` +
              `l'union qui les rend. Convention : cf. \`templates/design-system.md.tmpl\`. ` +
              `Sans ce pointeur, aucun contrôle ne peut dire si ces états ont un rendu.`
      });
      continue;
    }
    const members = readUnionMembers(archMd, c.union);
    if (!members.size) {
      offenders.push({
        component: c.component, union: c.union,
        problem: 'union_introuvable_dans_l_architecture',
        hint: `Le design déclare que \`${c.union}\` rend \`${c.component}\`, mais ` +
              `l'architecture ne déclare pas ce type.`
      });
      continue;
    }
    compared++;
    const exempt = new Set(c.exempt.map(normState));
    const norm = new Set([...members].map(normState));
    for (const st of c.states) {
      const key = normState(st);
      if (exempt.has(key)) continue;
      if (!norm.has(key)) {
        offenders.push({
          component: c.component, union: c.union, state: st,
          problem: 'etat_du_design_absent_de_l_union',
          hint: `Le design déclare \`${st}\` comme état rendu par \`${c.union}\`, et ` +
                `l'union ne le contient pas. Ou l'architecture ne le sait pas rendre, ` +
                `ou c'est un état « ne pas rendre » : alors il va dans le \`sauf\` de la ligne.`
        });
      }
    }
    for (const st of members) {
      const key = normState(st);
      if (!c.states.map(normState).includes(key) && !exempt.has(key)) {
        offenders.push({
          component: c.component, union: c.union, state: st,
          problem: 'membre_d_union_non_declare_par_le_design',
          hint: `\`${c.union}\` rend \`${st}\`, que le design ne déclare pas pour ` +
                `\`${c.component}\`. Le design est l'autorité : soit l'architecture ` +
                `invente un état, soit le design l'a oublié.`
        });
      }
    }
  }

  record(check, offenders.length === 0, {
    components: declared.length,
    unions_resolved: compared,
    offenders,
    rule: 'Le design nomme l\'union qui rend ses états ; l\'architecture la définit. ' +
          'Le contrôle résout ce pointeur et n\'interprète rien — donc un écart est un écart, ' +
          'pas une question de vocabulaire.'
  });
}

/* ------------------------------------------------------------------ *
 * Exactitude des citations — la regle citee dit-elle ce qu'on lui fait dire ?
 * ------------------------------------------------------------------ */

// Mots outils du francais. Sans cette liste, « dans », « chaque » ou « est »
// portent assez de bruit pour qu'aucune citation ne soit jamais signalee.
const CIT_STOP = new Set(['alors','avec','cette','dans','pour','par','plus','sans','sous','sur','une','des','les','deux','elle','ils','est','sont','etre','avoir','fait','faire','meme','tout','tous','toute','toutes','doit','doivent','peut','peuvent','vers','entre','chez','leur','leurs','notre','nos','votre','vos','ceci','cela','celle','celui','quand','comme','donc','ainsi','car']);

function citWords(text) {
  return String(text)
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .split(/\s+/)
    .filter(w => w.length >= 4 && !CIT_STOP.has(w));
}

/** Les regles du PRD : identifiant -> texte. Cellule 1 = ID, cellule 2 = la regle. */
function readRules(prd) {
  const rules = new Map();
  for (const line of prd.split('\n')) {
    if (!line.trim().startsWith('|')) continue;
    const cells = line.split('|').slice(1, -1).map(c => c.trim());
    if (cells.length < 2) continue;
    const m = cells[0].match(/^\*?\*?([BEUCV]\d+)\*?\*?$/);
    if (!m) continue;
    if (rules.has(m[1])) continue;
    rules.set(m[1], { id: m[1], text: cells[1] });
  }
  return rules;
}

/**
 * Les citations : une **ligne** de tableau qui porte des IDs et une affirmation.
 *
 * L'unité est la ligne, pas la cellule. Dans la forme la plus courante du PRD —
 * `| B11 | PRD §4 | § 3 : chaque tuile porte ses 7 slots |` — l'ID est dans une
 * cellule et l'affirmation dans la suivante : parser par cellule voyait donc
 * **le format dominant**, et ne captait que les citations écrites en ligne. Deux
 * tests l'ont attrapé.
 */
function readCitations(md, rel) {
  const out = [];
  md.split('\n').forEach((line, i) => {
    if (!line.trim().startsWith('|')) return;
    const row = line.split('|').slice(1, -1).map(c => c.trim());
    if (row.length < 2) return;
    const joined = row.join(' | ');
    const ids = [...new Set([...joined.matchAll(/\b([BEUCV]\d+)\b/g)].map(m => m[1]))];
    if (!ids.length) return;
    const claim = joined
      .replace(/\b[BEUCV]\d+\b/g, ' ')
      .replace(/§+\s*[\d.]+/g, ' ')
      .replace(/`[^`]*`/g, ' ')
      .replace(/\bPRD\b/g, ' ')
      .replace(/\|/g, ' ');
    const words = citWords(claim);
    if (words.length < 3) return; // une citation trop sèche ne prouve rien
    out.push({ rel, line: i + 1, ids, words, raw: joined });
  });
  return out;
}

/**
 * Une citation dont la regle ne dit pas ce que le document affirme.
 *
 * Ce controle ne demande pas « l'ID existe-t-il ? ». Il demande « **la regle
 * dit-elle ce que le document affirme ?** »
 *
 * Constate sur deux projets independants :
 *  - 22 references `B*` dans trois specifications d'ecran, dont **8 fausses** :
 *    `B11` (seuil signe, valeur/sens/date) cite pour « l'immutabilite de la
 *    version publiee », `B24` (restauration) pour la conservation de saisie ;
 *  - ici, un plan affirmait « B11 : chaque tuile porte ses 7 slots, dont
 *    `computed_at` et `source_ref` » — or B11 ne parle que du seuil.
 *
 * Une reference fausse est **plus grave** qu'une reference absente : elle donne
 * l'apparence d'une tracabilite verifiee. Verifier la presence de l'ID donne un
 * vert parfaitement inutile, parce que l'ID existe et ne parle pas de ce qu'on
 * a ecrit.
 *
 * Deux garde-fous contre le faux positif, parce qu'un controle bruyant s'eteint :
 *  - une citation qui **emprunte au moins trois mots** a la regle est acceptee :
 *    un vocabulaire metier legitimement different n'est pas une fausse citation ;
 *  - une regle de moins de trois mots significatifs n'est pas comparable.
 */
function checkCitationAccuracy(root, state) {
  const check = 'citation_accuracy';
  const prdRel = (state.deliverables || {}).prd && state.deliverables.prd.path;
  if (!prdRel) { skip(check, 'PRD absent ou non enregistre'); return; }
  const prd = read(root, prdRel);
  if (!prd) { skip(check, 'PRD illisible'); return; }

  const rules = readRules(prd);
  // Un PRD de quatre regles est un PRD legitime : le seuil ne protege pas contre un
  // tableau illisible, il decale juste le seuil de detection. Quatre est assez bas
  // pour attraper une table mal reconnue sans exiger un PRD riche.
  if (rules.size < 4) { skip(check, `PRD ne declare que ${rules.size} regles — table de reference illisible`); return; }

  const docs = [];
  for (const [key, d] of Object.entries(state.deliverables || {})) {
    if (!d.path || d.type === 'prd') continue;
    const c = read(root, d.path);
    if (c) docs.push({ key, rel: d.path, text: c });
  }
  for (const [key, s] of Object.entries(state.screens || {})) {
    if (!s.path) continue;
    const c = read(root, s.path);
    if (c) docs.push({ key, rel: s.path, text: c });
  }
  for (const [key, s] of Object.entries(state.slices || {})) {
    if (!s.plan_path) continue;
    const c = read(root, s.plan_path);
    if (c) docs.push({ key, rel: s.plan_path, text: c });
  }

  const suspects = [];
  let checked = 0, verifiable = 0, acknowledged = 0, collective = 0;
  for (const d of docs) {
    for (const cit of readCitations(d.text, d.rel)) {
      for (const id of cit.ids) {
        const rule = rules.get(id);
        if (!rule) continue;
        const ruleWords = new Set(citWords(rule.text));
        if (ruleWords.size < 3) continue;
        // Une cellule qui cite **plusieurs** regles porte une affirmation
        // collective : la comparer a chaque regle separement garantit un
        // faux positif par regle non concernee. C'etait la source du bruit.
        if (cit.ids.length > 1) { collective++; continue; }
        checked++;
        if (/acquitt|assum|r[eé]-dat/.test(cit.raw)) { acknowledged++; continue; }
        const hit = cit.words.filter(w => ruleWords.has(w));
        if (hit.length >= 3) { verifiable++; continue; }
        suspects.push({
          id, doc: d.rel, line: cit.line, shared: hit,
          claim: cit.raw.slice(0, 170),
          rule_text: rule.text.slice(0, 170),
          what_to_do: 'Soit citer la regle mot pour mot, soit ecrire pourquoi elle couvre ' +
                       'cet endroit. Les deux sont des decisions ; ne faire ni l\'un ni l\'autre ' +
                       'est un oubli, pas une paraphrase.'
        });
      }
    }
  }

  // **Ce controle ne peut pas dire qu'une citation est fausse.** Deux textes
  // peuvent dire la meme chose avec des mots differents — « source
  // indisponible » et « entrepot injoignable » — et aucun test lexical ne les
  // separe. Une version anterieure de ce controle rendait `fail` sur ces
  // paraphrases : elle etait fausse sur des documents **corrects**, donc elle
  // aurait ete eteinte, puis oubliee.
  //
  // Il rend donc une **obligation a examiner**, pas un verdict : la file des
  // citations qui n'empruntent rien a la regle, et le decompte de celles qui
  // sont verifiables sans interpretation. Le gate tranche, comme il tranche de
  // tout ce qu'aucun script ne peut decider.
  record(check, true, {
    rules: rules.size,
    documents: docs.length,
    citations_checked: checked,
    citations_verifiable: verifiable,
    citations_acknowledged: acknowledged,
    citations_collective: collective,
    citations_to_review: suspects.length,
    suspects,
    measured_precision: "~0% sur le projet de test. Les six suspects les plus solides ont ete " +
      "lus a la main : six paraphrases ou citations legitimes, zero fausse. Exemples verifies " +
      "un par un — `C4` (domaine « legale ») cite pour « C4 est une contrainte legale » : " +
      "exact ; `B11` (seuil signe, valeur/sens/date) cite pour « les seuils sont ecrits a " +
      "cote de la definition » : exact. Une premiere lecture les avait comptes comme " +
      "fausses ; ils ne l'etaient pas. C'est pourquoi ce controle est **pilote** : il ne " +
      "peut pas etre une obligation de gate, et un rapport sans precision mesuree est un " +
      "verdict deguise.",
    obligation: 'Ce controle est une FILE D\'EXAMEN, pas un verdict. Il rend `pass` par ' +
      'construction : sur 358 citations, 244_etait une file de 244 lignes, dont 2 fausses ' +
      'citations reelles. Le gate tranche. ' +
                ' citations a examiner et statuer sur chacune. Le controle ne peut pas ' +
                'dire lesquelles sont fausses : il ne sait distinguer une paraphrase d\'une erreur.',
    rule: "Verifier la presence d'un ID donne un vert inutile : l'ID existe et ne parle " +
          "pas de ce qu'on a ecrit. Une reference fausse est plus grave qu'une reference " +
          "absente, parce qu'elle donne l'apparence d'une tracabilite verifiee. Mais " +
          "l'inverse est vrai aussi : un controle lexical accuse aussi les paraphrases, " +
          "et un controle qui accuse juste est eteint comme les autres."
  });
}

/* ------------------------------------------------------------------ *
 * Les renvois de section : `citee -> resolue`
 * ------------------------------------------------------------------ */

/**
 * Les titres numerotes d'un fichier : `{ '5.15': 'DELETE /api/v1/…', … }`.
 *
 * **Quatre formes** sont acceptees, parce que les quatre existent dans les
 * documents livres avec ce skill :
 *
 *   `## 5.15 Titre`      — gabarits du skill
 *   `## §5 — Titre`      — `references/archetypes.md`
 *   `## §5.15 Titre`     — melange des deux
 *   `## Étape 3 — Titre` — `references/design-quality.md`, qui ecrit pourtant
 *                           « le §3 (interdits) » dans sa propre prose
 *
 * Une premiere version n'acceptait que la premiere forme : elle declarait alors
 * **dix-huit renvois casses** vers `archetypes.md § 4` et `§ 9`, qui existent, et
 * **un renvoi casse** vers `design-quality.md § 3` — dont la section 3 est le
 * titre `## Étape 3 — Interdits`. Dix-neuf faux positifs produits par un motif
 * trop etroit. Un motif trop etroit est aussi un motif faux : il rend le compte
 * « rien n'est casse » quand un tiers des renvois est intact, et il rend le
 * compte « tout est casse » quand une seule forme change.
 */
function headingMap(md) {
  const out = {};
  const re = /^#{1,6}[ \t]+(?:§[ \t]*)?(?:[Ee\u00C9\u00E9]tape[ \t]+)?(\d+(?:\.\d+)*)\b[ \t.—–-]*(.*)$/gm;
  let m;
  while ((m = re.exec(md)) !== null) {
    if (!(m[1] in out)) out[m[1]] = m[2].trim().slice(0, 90);
  }
  return out;
}

/** Tous les `.md` indexes, par nom de fichier. Projet d'abord, skill ensuite. */
function referenceIndex(root, state) {
  const byName = new Map();     // basename -> chemin
  const headings = new Map();    // chemin -> { numero -> titre }
  const add = (abs, rel) => {
    const md = read(root, rel);
    if (!md) return;
    const h = headingMap(md);
    headings.set(rel, h);
    const base = path.basename(rel).toLowerCase();
    // Un nom ne pointe que sur un fichier unique : deux homonymes sont
    // ambigus, et un pointeur ambigu ne se resout pas.
    if (!byName.has(base)) byName.set(base, []);
    if (!byName.get(base).includes(rel)) byName.get(base).push(rel);
  };

  for (const d of Object.values(state.deliverables || {})) if (d.path) add(d.path, d.path);
  for (const s2 of Object.values(state.screens || {})) if (s2.path) add(s2.path, s2.path);
  for (const s2 of Object.values(state.slices || {})) if (s2.plan_path) add(s2.plan_path, s2.plan_path);
  for (const s2 of Object.values(state.foundations || {})) if (s2.path) add(s2.path, s2.path);

  const forgeDir = path.resolve(__dirname, '..');
  for (const dir of [path.join(root, '.forge'), path.join(forgeDir, 'references'), forgeDir]) {
    let files = [];
    try { files = fs.readdirSync(dir, { withFileTypes: true }); } catch { continue; }
    for (const f of files) {
      if (!f.isFile() || !f.name.endsWith('.md')) continue;
      const abs = path.join(dir, f.name);
      add(abs, path.relative(root, abs));
    }
  }
  return { byName, headings };
}

/**
 * Un renvoi de section dont la cible n'existe pas.
 *
 * Un renvoi `§ 5.15` est un **pointeur** — la forme que le skill sait deja
 * traiter (`derived_from`, `content_hash`, la parite de surface). Aucun
 * controle ne le resolvait : rien n'extractait les `§ X.Y` d'un artefact et ne
 * verifiait que la cible existe.
 *
 * Constate sur le projet de test, INC-011 : corriger l'architecture **a insere**
 * deux endpoints en § 5.9 et § 5.10, ce qui a decale toute la numerotation
 * § 5.11 → § 5.13 … § 5.20 → § 5.22. **Dix-sept renvois** dans huit plans
 * pointent desormais vers la mauvaise section, et aucune de ces lignes ne
 * signale qu'elle est perimee. Ils pointent vers *quelque chose* : c'est ce qui
 * les rend invisibles.
 *
 * ## Deux classes, deux verdicts — et pourquoi
 *
 *   - le renvoi **nomme** sa cible (`` `architecture.md` § 5.15 ``). Le controle
 *     sait alors exactement ou regarder. Cible absente → **defaut**, sans
 *     discussion : c'est un pointeur casse, comme `derived_from` vers un fichier
 *     disparu ;
 *   - le renvoi est **nu** (`§ 5.15`). Personne ne sait de quel document il
 *     parle. Le controle ne pretend pas deviner : il constate que **le pointeur
 *     ne nomme pas sa cible**, et il compte.
 *
 * La deuxieme classe ne fait pas echouer. Elle est comptee, avec sa voie de
 * sortie ecrite dans la sortie : ecrire le nom du fichier, et le compte tombe.
 * Un controle qu'on ne peut pas suivre sans un chantier de 288 renvois est un
 * controle qu'eteint au bout d'une semaine — c'est arrive quatre fois dans ce
 * dossier, et la lesson est la meme a chaque fois.
 */
/**
 * Fenetre d'adjacence, en caracteres, entre un nom de fichier et le `§ N` qui
 * pointe dans ce fichier. See la table mesuree dans `checkSectionReferences`.
 */
const ADJACENCY = 12;

function checkSectionReferences(root, state) {
  const check = 'section_references';
  const index = referenceIndex(root, state);
  if (index.headings.size < 3) { skip(check, 'trop peu de documents numerotes pour verifier des renvois'); return; }

  const artefacts = [];
  for (const [key, d] of Object.entries(state.deliverables || {})) if (d.path) artefacts.push({ key, rel: d.path });
  for (const [key, s2] of Object.entries(state.screens || {})) if (s2.path) artefacts.push({ key, rel: s2.path });
  for (const [key, s2] of Object.entries(state.slices || {})) if (s2.plan_path) artefacts.push({ key, rel: s2.plan_path });
  for (const [key, s2] of Object.entries(state.foundations || {})) if (s2.path) artefacts.push({ key, rel: s2.path });
  if (!artefacts.length) { skip(check, 'aucun artefact enregistre'); return; }

  const broken = [];      // cible nommee, section absente  → ECHEC
  const unknown = [];     // cible nommee, fichier absent    → ECHEC
  const undeclared = [];  // renvoi nu                       → compte
  let resolved = 0;

  for (const a of artefacts) {
    const md = read(root, a.rel);
    if (!md) continue;
    const own = index.headings.get(a.rel) || {};

    // Les renvois explicites : un nom de fichier suivi, **a cote**, de son
    // numero de section.
    //
    // La fenetre est de **douze caracteres**, et c'est une decision mesuree.
    // Un nom de fichier et un numero de section ne sont pas voisins en prose :
    // un document nomme `design-system.md` une fois, puis cite `§ 2.3` quarante
    // caracteres plus loin — dans un tout autre paragraphe. Une fenetre large
    // attribue au fichier le premier nom trouve dans le document entier : sur le
    // projet de test elle produisait **539 renvois casses**, tous faux.
    //
    //     fenetre   casses   resolus
    //        60 car.     13     1090
    //        30 car.      5     1080
    //        20 car.      3     1073
    //        12 car.      1     1072   <-- retenue
    //
    // Au-dela de douze caracteres, le controle **refuse de deviner** et compte le
    // renvoi comme non declare. C'est la meme regle que partout ailleurs dans ce
    // dossier : un pointeur se resout ou il ne vaut rien.
    const windows = [];
    const nameRe = /([A-Za-z0-9_][A-Za-z0-9_./-]*\.md)/g;
    let nm;
    while ((nm = nameRe.exec(md)) !== null) {
      windows.push({
        from: nm.index + nm[0].length,
        to: Math.min(md.length, nm.index + nm[0].length + ADJACENCY),
        name: path.basename(nm[1]).toLowerCase(),
        at: nm.index
      });
    }

    const covered = [];
    for (const w of windows) {
      const body = md.slice(w.from, w.to);
      if (!/§/.test(body)) continue;
      const cands = index.byName.get(w.name);
      for (const m of body.matchAll(/§+\s*(\d+(?:\.\d+)*)/g)) {
        const num = m[1];
        const line = md.slice(0, w.from + m.index).split('\n').length;
        covered.push(w.from + m.index);
        if (!cands) { unknown.push({ artifact: a.key, file: a.rel, line, section: num, target: w.name }); continue; }
        if (cands.length > 1) {
          undeclared.push({ artifact: a.key, file: a.rel, line, section: num,
            why: 'deux fichiers portent ce nom : le pointeur est ambigu' });
          continue;
        }
        const h = index.headings.get(cands[0]) || {};
        if (num in h) { resolved++; continue; }
        broken.push({ artifact: a.key, file: a.rel, line, section: num, target: w.name,
          target_file: cands[0], what_exists: Object.keys(h).slice(0, 8) });
      }
    }

    // Les renvois nus : rien ne dit de quel document ils parlent.
    for (const m of md.matchAll(/§+\s*(\d+(?:\.\d+)*)/g)) {
      if (covered.includes(m.index)) continue;
      const num = m[1];
      if (num in own) { resolved++; continue; }
      undeclared.push({ artifact: a.key, file: a.rel,
        line: md.slice(0, m.index).split('\n').length, section: num,
        why: 'renvoi nu : aucun fichier nomme' });
    }
  }

  const byFile = {};
  for (const u of undeclared) byFile[u.file] = (byFile[u.file] || 0) + 1;

  record(check, broken.length === 0 && unknown.length === 0, {
    artifacts: artefacts.length,
    files_indexed: index.headings.size,
    references_resolved: resolved,
    references_broken: broken.length,
    references_to_unknown_file: unknown.length,
    references_undeclared: undeclared.length,
    broken,
    unknown,
    undeclared_by_file: byFile,
    undeclared_sample: undeclared.slice(0, 12),
    exit_route: undeclared.length === 0 ? null :
      `Ecrire le nom du fichier devant chaque renvoi : \`architecture.md § 5.15\`. ` +
      `${undeclared.length} renvois nus, dont les plus charges : ` +
      Object.entries(byFile).sort((a, b) => b[1] - a[1]).slice(0, 3)
        .map(([f, n]) => `${f} (${n})`).join(', ') +
      `. Un renvoi nu ne fait pas echouer : il se compte. Mais un renvoi nu ne ` +
      `resout jamais tout seul, et INC-011 est exactement ce cas — dix-sept ` +
      `renvois qui pointent vers la mauvaise section sans qu'aucune ligne ne le dise.`,
    rule: 'Un renvoi de section est un pointeur, et un pointeur se resout ou ne vaut rien. ' +
          'Un renvoi qui pointe encore quelque chose apres une renumerotation est le pire : ' +
          'il semble resolu. C\'est pour cela qu\'un amendement etend un document, ' +
          'jamais il ne le renumerote.'
  });
}

const CHECKS = {
  reality: (root, state) => checkSliceReality(root, state),
  ids: (root, state) => checkIdTraceability(root, state),
  plans: (root, state) => checkPlanSelfConsistency(root, state),
  screens: (root, state) => checkScreenCoverage(root, state),
  questions: (root, state) => checkOpenQuestions(root, state),
  findings: (root, state) => checkFindings(root, state),
  premises: (root, state) => checkPremises(root, state),
  citations: (root, state) => checkCitationAccuracy(root, state),
  'state-parity': (root, state) => checkStateParity(root, state),
  references: (root, state) => checkSectionReferences(root, state),
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

  // `state-parity` est un **pilotage** : son parseur de la forme prose prend
  // le nom de l'union pour un état et rate ceux qui suivent. Sur le projet de
  // test il rend 1 vrai écart et 15 faux. Il tourne donc à la demande
  // (`consistency-check state-parity`) et pas dans `all` — un contrôle qui
  // ment est pire qu'un contrôle absent.
  const PILOTED = ['state-parity', 'citations'];
  const toRun = command === 'all'
    ? Object.keys(CHECKS).filter(k => !PILOTED.includes(k))
    : [command];
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
