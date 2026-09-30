#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const L = require('./lib/forge-lib');

/**
 * dependency-check.js — graphe de dépendances slices/fondations.
 * Détecte les cycles, calcule l'ordre topologique (vagues) et, avec --write,
 * persiste depends_on / depended_on_by dans state.json.
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
      hint: `node scripts/state.js migrate ${projectPath}`
    });
  }
  return state;
}

function buildDependencyGraph(state) {
  const nodes = {};
  const edges = [];

  for (const [name, foundation] of Object.entries(state.foundations || {})) {
    nodes[name] = { type: 'foundation', dependsOn: foundation.depends_on || [], dependedOnBy: foundation.depended_on_by || [] };
  }

  for (const [name, slice] of Object.entries(state.slices || {})) {
    nodes[name] = { type: 'slice', dependsOn: slice.depends_on || [], dependedOnBy: slice.depended_on_by || [], module: slice.module };
    for (const dep of (slice.depends_on || [])) {
      edges.push({ from: name, to: dep, type: 'depends_on' });
    }
  }

  return { nodes, edges };
}

/**
 * Le nombre de vagues DÉCLARÉ dans l'architecture.
 *
 * Source primaire : `impl_waves: N` dans le front matter — un champ
 * machine-lisible. Repli : la forme « N vagues, de V0 à V(N-1) » du § graphe,
 * parce que le style en clair est ce que les rédacteurs écrivent spontanément,
 * et qu'un champ absent ne doit pas rendre la vérification impossible.
 */
/**
 * Lit un scalaire plié YAML (`>-`, `>`, `|`) dans le front matter.
 *
 * Les raisons d'un écart sont longues, donc écrites en bloc plié. Un lecteur
 * naïf — `match(/^champ:\s*(.+)$/m)` — remonte l'indicateur `>-` et pas le
 * texte, ce qui fait passer une justification présente pour une
 * justification absente. C'est exactement le défaut qu'un contrôle ne doit pas
 * commettre : distinguer « il n'a pas expliqué » de « il a expliqué, mal lu ».
 */
function readFoldedScalar(fm, field) {
  const lines = fm.split('\n');
  const start = lines.findIndex(l => new RegExp('^' + field + ':').test(l));
  if (start === -1) return null;
  const inline = lines[start].slice(field.length + 1).trim();
  if (inline && !/^[>|][-+]?$/.test(inline)) return inline;

  const parts = [];
  for (let i = start + 1; i < lines.length; i++) {
    const l = lines[i];
    if (!/^\s+\S/.test(l)) {
      if (parts.length) parts.push('');
      continue;
    }
    parts.push(l.trim());
  }
  const text = parts.join(' ').replace(/\s+/g, ' ').trim();
  return text || null;
}

function readDeclaredWaves(projectPath) {
  const archRel = 'architecture.md';
  const p = path.join(projectPath, '.forge', archRel);
  if (!fs.existsSync(p)) return null;
  const text = fs.readFileSync(p, 'utf-8');

  const end = text.indexOf('\n---', 3);
  if (text.startsWith('---') && end > 0) {
    const fm = text.slice(3, end);
    const m = fm.match(/^impl_waves:\s*(\d+)/m);
    if (m) {
      // Un écart assumé se déclare comme tel, avec sa raison. Sinon « j'ai
      // écrit 13 et l'outil en trouve 8 » reste un échec, et la seule façon de
      // le faire disparaître est de corriger le document — donc de mentir.
      const rationale = readFoldedScalar(fm, 'impl_waves_rationale');
      return {
        waves: parseInt(m[1], 10),
        rationale: rationale ? rationale.trim() : null,
        source: 'front matter .forge/architecture.md (impl_waves)'
      };
    }
  }
  const prose = text.match(/\*\*(\d+)\s+vagues\*\*/) || text.match(/^(\d+)\s+vagues\b/m);
  if (prose) {
    return {
      waves: parseInt(prose[1], 10),
      rationale: null,
      source: '§ graphe de l\'architecture (texte)'
    };
  }
  return null;
}

function findCycles(graph) {
  const cycles = [];
  const visited = new Set();
  const stack = new Set();

  function dfs(node, pathNodes, pathEdges) {
    if (stack.has(node)) {
      const cycleStart = pathNodes.indexOf(node);
      const cycle = [...pathNodes.slice(cycleStart), node];
      cycles.push(cycle);
      return;
    }

    if (visited.has(node)) return;

    visited.add(node);
    stack.add(node);

    const nodeData = graph.nodes[node];
    if (nodeData && nodeData.dependsOn) {
      for (const dep of nodeData.dependsOn) {
        if (graph.nodes[dep]) {
          dfs(dep, [...pathNodes, node], [...pathEdges]);
        }
      }
    }

    stack.delete(node);
  }

  for (const node of Object.keys(graph.nodes)) {
    if (!visited.has(node)) {
      dfs(node, [], []);
    }
  }

  return cycles;
}

function topologicalOrder(graph) {
  const waves = [];
  const remaining = new Set(Object.keys(graph.nodes));
  const processed = new Set();

  while (remaining.size > 0) {
    const wave = [];

    for (const node of remaining) {
      const nodeData = graph.nodes[node];
      const deps = nodeData.dependsOn || [];
      const allDepsProcessed = deps.every(d => processed.has(d) || !graph.nodes[d]);
      if (allDepsProcessed) {
        wave.push(node);
      }
    }

    if (wave.length === 0) {
      const cycles = findCycles(graph);
      console.log(JSON.stringify({
        error: 'Cannot resolve dependencies — cycles detected',
        cycles: cycles.map(c => c.join(' → '))
      }));
      process.exit(1);
    }

    for (const node of wave) {
      remaining.delete(node);
      processed.add(node);
    }

    waves.push(wave);
  }

  return waves;
}

/** Reconstruit depended_on_by depuis depends_on et persiste le graphe. */
function writeBack(projectPath, state, graph, waves) {
  const byName = {};
  for (const [name, node] of Object.entries(graph.nodes)) {
    byName[name] = { dependsOn: [...node.dependsOn], dependedOnBy: [] };
  }
  for (const [name, node] of Object.entries(graph.nodes)) {
    for (const dep of node.dependsOn) {
      if (byName[dep]) byName[dep].dependedOnBy.push(name);
    }
  }

  const rank = {};
  waves.forEach((w, i) => { for (const n of w) rank[n] = i; });

  for (const [name, node] of Object.entries(graph.nodes)) {
    const bucket = node.type === 'slice' ? state.slices : state.foundations;
    const entry = bucket && bucket[name];
    if (!entry) continue;
    entry.depends_on = byName[name].dependsOn;
    entry.depended_on_by = byName[name].dependedOnBy;
    entry.impl_wave = rank[name];
  }

  state.index = state.index || {};
  state.index.impl_waves = waves.map((w, i) => ({ wave: i, nodes: w }));

  L.writeState(projectPath, state);
  L.appendLog(projectPath, { type: 'graph_written', nodes: Object.keys(graph.nodes).length, waves: waves.length });
  return { waves: state.index.impl_waves };
}

function check(projectPath, fullReport, doWrite) {
  const state = readState(projectPath);
  const graph = buildDependencyGraph(state);

  const cycles = findCycles(graph);
  const waves = topologicalOrder(graph);
  const orphanNodes = [];

  for (const [name, node] of Object.entries(graph.nodes)) {
    if (node.type === 'slice' && node.dependsOn.length === 0 && node.dependedOnBy.length === 0) {
      orphanNodes.push(name);
    }
  }

  const missingDeps = [];
  for (const [name, node] of Object.entries(graph.nodes)) {
    for (const dep of (node.dependsOn || [])) {
      if (!graph.nodes[dep]) {
        missingDeps.push({ node: name, missingDep: dep });
      }
    }
  }

  const written = doWrite && cycles.length === 0 ? writeBack(projectPath, state, graph, waves) : null;

  /* ---------------------------------------------------------------- *
   * Le plan de vagues déclaré dans l'architecture.
   *
   * `writeBack` écrase `impl_wave` par le calcul. Si l'architecture annonce un
   * plan de vagues différent, cet écart disparaît sans bruit : l'outil
   * rapporte `pass: true`, et deux documents de la Phase 4 se contredisent
   * alors que la CI est verte.
   *
   * Constaté sur un test grandeur nature : l'architecture annonçait 13 vagues
   * (V0 à V12), le calcul en donne 8. Les deux peuvent être vrais — un plan
   * d'ordonnancement peut être plus fin que le minimum du chemin critique —
   * mais personne n'en était informé, et l'implémenteur lisait l'un pendant que
   * `state.json` contenait l'autre.
   * ---------------------------------------------------------------- */
  const declared = readDeclaredWaves(projectPath);
  const computed = waves.length;
  const divergence = [];
  if (declared && declared.waves !== computed) {
    // Déclaré ET justifié → un avertissement visible, pas un échec. Le plan
    // reste plus fin que le minimum, et c'est un choix assumé.
    // Déclaré sans raison, ou trouvé dans la prose → un échec : un plan non
    // justifié ne se distingue pas d'une erreur de comptage.
    divergence.push({
      what: 'impl_waves',
      declared: declared.waves,
      computed,
      difference: declared.waves - computed,
      declared_source: declared.source,
      rationale: declared.rationale || null,
      acknowledged: !!declared.rationale,
      status: declared.rationale ? 'warn' : 'fail',
      rule: 'Un plan d\'ordonnancement plus fin que le minimum du chemin critique est ' +
            'légitime, mais il doit être DÉCLARÉ et JUSTIFIÉ : sinon deux documents de la ' +
            'phase se contredisent et rien ne le signale.'
    });
  }

  const report = {
    total_nodes: Object.keys(graph.nodes).length,
    slices: Object.values(graph.nodes).filter(n => n.type === 'slice').length,
    foundations: Object.values(graph.nodes).filter(n => n.type === 'foundation').length,
    edges: graph.edges.length,
    waves: waves.map((w, i) => ({ wave: i, nodes: w, count: w.length })),
    waves_computed: computed,
    waves_declared: declared ? declared.waves : null,
    divergence,
    cycles: cycles.map(c => c.join(' → ')),
    orphans: orphanNodes,
    missing_dependencies: missingDeps,
    written_back: !!written,
    pass: cycles.length === 0 && missingDeps.length === 0 && !divergence.some(d => d.status === 'fail')
  };

  if (fullReport) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    console.log(JSON.stringify({
      pass: report.pass,
      cycles: report.cycles,
      missing_deps: report.missing_dependencies,
      orphans: report.orphans,
      waves_count: report.waves.length,
      waves_declared: report.waves_declared,
      divergence: report.divergence,
      written_back: report.written_back
    }));
  }

  if (!report.pass) {
    process.exit(1);
  }
}

const command = process.argv[2];
const projectPath = process.argv[3] || process.cwd();
const fullReport = process.argv.includes('--full');
const doWrite = process.argv.includes('--write');

switch (command) {
  case undefined:
  case 'check':
  case '--help':
    if (command === '--help') {
      console.log(JSON.stringify({
        usage: {
          check: 'forge-deps check <project-path> [--full] [--write]'
        },
        notes: {
          '--write': 'persiste depends_on / depended_on_by / impl_wave dans state.json'
        }
      }));
    } else {
      check(projectPath, fullReport, doWrite);
    }
    break;
  default:
    console.log(JSON.stringify({ error: `Unknown command: ${command}. Use 'check'.` }));
    process.exit(1);
}
