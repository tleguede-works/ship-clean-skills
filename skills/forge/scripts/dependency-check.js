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

  const report = {
    total_nodes: Object.keys(graph.nodes).length,
    slices: Object.values(graph.nodes).filter(n => n.type === 'slice').length,
    foundations: Object.values(graph.nodes).filter(n => n.type === 'foundation').length,
    edges: graph.edges.length,
    waves: waves.map((w, i) => ({ wave: i, nodes: w, count: w.length })),
    cycles: cycles.map(c => c.join(' → ')),
    orphans: orphanNodes,
    missing_dependencies: missingDeps,
    written_back: !!written,
    pass: cycles.length === 0 && missingDeps.length === 0
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
