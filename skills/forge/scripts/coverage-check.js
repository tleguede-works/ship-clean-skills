#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const L = require('./lib/forge-lib');

/**
 * coverage-check.js — vérifie qu'un plan de slice couvre bien son périmètre.
 * Lit state.json (v2) via forge-lib. Ne modifie rien.
 */

function readState(projectPath) {
  const state = L.readState(projectPath);
  if (!state) {
    L.fail({ error: 'no_state', path: L.statePath(projectPath) });
  }
  if (state.version === 1 || state.documents) {
    L.fail({
      error: 'legacy_state_v1',
      path: L.statePath(projectPath),
      hint: `node "$FORGE/scripts/state.js" migrate ${projectPath}`
    });
  }
  return state;
}

/** Résout le chemin d'un livrable en tolérant l'absence de path. */
function deliverablePath(state, root, key, fallback) {
  const d = (state.deliverables || {})[key];
  if (d && d.path) return L.toAbs(root, d.path);
  return fallback ? path.join(root, fallback) : null;
}

function checkSlice(projectPath, sliceName) {
  const state = readState(projectPath);
  // Fondations comprises : une fondation a un plan, donc une couverture à
  // vérifier. C'est ce que FastTrack appelle à l'étape 2 de sa boucle.
  let slice;
  try {
    slice = L.resolveGraphNode(state, sliceName).entry;
  } catch {
    console.log(JSON.stringify({ error: `Slice "${sliceName}" not found in state.json`, known: Object.keys(L.graphNodes(state)) }));
    process.exit(1);
  }
  slice = { ...slice, plan_path: slice.plan_path || slice.path || `.forge/plans/${sliceName}.md` };

  const results = {
    slice: sliceName,
    checks: [],
    pass: true
  };

  const planPath = slice.plan_path
    ? L.toAbs(projectPath, slice.plan_path)
    : path.join(projectPath, `.forge/plans/${sliceName}.md`);

  if (!fs.existsSync(planPath)) {
    results.checks.push({
      check: 'plan_exists',
      status: 'fail',
      message: `Plan file not found: ${planPath}`
    });
    results.pass = false;
    console.log(JSON.stringify(results, null, 2));
    process.exit(1);
  }

  const planContent = fs.readFileSync(planPath, 'utf-8');

  const requiredSections = [
    '## 1. Résumé',
    '## 2. Contrats de données',
    '## 3. Algorithmes critiques',
    '## 4. Plan composants',
    '## 5. Gestion d\'état',
    '## 6. Traçabilité des règles',
    '## 7. Pièges à éviter',
    '## 8. Dépendances',
    '## 9. Checklist de tâches',
    '## 10. Critères d\'acceptation',
    '## 11. Plan de tests'
  ];

  for (const section of requiredSections) {
    const alternativeSection = section.replace('## ', '### ');
    const found = planContent.includes(section) || planContent.includes(alternativeSection);
    results.checks.push({
      check: `section_${section.replace(/^#+ /, '').toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
      status: found ? 'pass' : 'fail',
      message: found ? `Section "${section}" found` : `Section "${section}" MISSING`
    });
    if (!found) results.pass = false;
  }

  if (slice.rule_ids && slice.rule_ids.length > 0) {
    for (const ruleId of slice.rule_ids) {
      const inTraceability = planContent.includes(ruleId);
      if (!inTraceability) {
        const inContent = planContent.includes(ruleId);
        results.checks.push({
          check: `rule_${ruleId}`,
          status: inContent ? 'pass' : 'fail',
          message: inContent
            ? `Rule ${ruleId} found in plan`
            : `Rule ${ruleId} MISSING from plan`
        });
        if (!inContent) results.pass = false;
      }
    }
  }

  if (slice.edge_case_ids && slice.edge_case_ids.length > 0) {
    for (const ecId of slice.edge_case_ids) {
      if (!planContent.includes(ecId)) {
        results.checks.push({
          check: `edge_case_${ecId}`,
          status: 'fail',
          message: `Edge case ${ecId} MISSING from plan`
        });
        results.pass = false;
      }
    }
  }

  const hasEmptySection = /^#{2,3} [^\n]+\n\n\s*\n(?!\S)/m.test(planContent);
  if (hasEmptySection) {
    results.checks.push({
      check: 'empty_sections',
      status: 'fail',
      message: 'Plan contains empty sections'
    });
    results.pass = false;
  }

  console.log(JSON.stringify(results, null, 2));

  if (!results.pass) {
    process.exit(1);
  }
}

function checkPRD(projectPath) {
  const state = readState(projectPath);
  const prd = (state.deliverables || {}).prd;

  if (!prd) {
    console.log(JSON.stringify({ error: 'PRD not found in state.json deliverables' }));
    process.exit(1);
  }

  const prdPath = L.toAbs(projectPath, prd.path);
  if (!fs.existsSync(prdPath)) {
    console.log(JSON.stringify({ error: `PRD file not found: ${prdPath}` }));
    process.exit(1);
  }

  const prdContent = fs.readFileSync(prdPath, 'utf-8');
  const results = {
    document: 'prd',
    checks: [],
    pass: true
  };

  const requiredSections = [
    'Résumé exécutif',
    'Utilisateurs et personas',
    'User stories',
    'Règles métier',
    'Contraintes',
    'Edge cases',
    'Hors scope'
  ];

  for (const section of requiredSections) {
    if (!prdContent.includes(section)) {
      results.checks.push({
        check: `section_${section.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
        status: 'fail',
        message: `Section "${section}" MISSING from PRD`
      });
      results.pass = false;
    }
  }

  console.log(JSON.stringify(results, null, 2));

  if (!results.pass) {
    process.exit(1);
  }
}

const command = process.argv[2];
const projectPath = process.argv[3] || process.cwd();
const target = process.argv[4];

switch (command) {
  case undefined:
  case '--help':
    console.log(JSON.stringify({
      usage: {
        slice: 'forge-coverage slice <project-path> <slice-name>',
        prd: 'forge-coverage prd <project-path>'
      }
    }));
    break;
  case 'slice':
    if (!target) {
      console.log(JSON.stringify({ error: 'Usage: forge-coverage slice <project-path> <slice-name>' }));
      process.exit(1);
    }
    checkSlice(projectPath, target);
    break;
  case 'prd':
    checkPRD(projectPath);
    break;
  default:
    console.log(JSON.stringify({ error: `Unknown command: ${command}. Use 'slice' or 'prd'.` }));
    process.exit(1);
}
