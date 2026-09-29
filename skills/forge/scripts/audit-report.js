#!/usr/bin/env node
'use strict';

/**
 * audit-report.js — agrège les journaux d'audit de PLUSIEURS projets Forge
 * pour faire apparaître les récurrences.
 *
 * Le but : après plusieurs projets, répondre à « qu'est-ce qui échoue dans Forge,
 * et dans quel ordre faut-il le corriger ? ». Un `issues.md` par projet ne répond
 * pas à cette question — il faut le agreger.
 *
 * Entrées : <anchor>/.forge/audit/run-log.jsonl  (+ .forge/audit/issues.md en option)
 * Sorties : rapport Markdown + JSON, class par signature de défaillance.
 *
 * Zéro dépendance. Ne modifie aucun projet.
 */

const fs = require('fs');
const path = require('path');
const L = require('./lib/forge-lib');

/* ------------------------------------------------------------------ *
 * Taxonomie
 * ------------------------------------------------------------------ */

/** Signatures d'échec, de la plus grave à la moins grave. */
const SIGNATURES = [
  { key: 'anchor_hijack',      label: 'Projet de référence hijacké comme anchor',  types: ['anchor_hijack_blocked'] },
  { key: 'stray',              label: 'Livrable écrit hors de .forge',             types: ['stray_relocated'] },
  { key: 'divergence',         label: 'État / front matter désynchronisés',        types: ['divergence_fixed', 'sync'] },
  { key: 'state_error',        label: 'Erreur de schéma state.json',               types: ['state_error', 'legacy_state_v1', 'register_rejected'] },
  { key: 'ft_block',           label: 'Fast Track bloqué (BLOCK)',                 types: ['fast_track_block'] },
  { key: 'ft_revise',          label: 'Fast Track en révision (REVISE)',           types: ['fast_track_validate'] },
  { key: 'user_correction',    label: 'Correction utilisateur',                    types: ['user_correction'] },
  { key: 'guard',              label: 'Échec de garde-fou',                        types: ['guard_failure', 'placeholders_found'] },
  { key: 'stale',              label: 'Document stale',                            types: ['stale_detected'] },
  { key: 'script_failure',     label: 'Échec de script',                           types: ['script_failure'] },
  { key: 'nav_overflow',       label: 'Navigation trop fourni',                    types: ['nav_overflow'] },
  { key: 'gate_revise',        label: 'Gate humain rejeté',                        types: ['gate_revise', 'gate_rejected'] },
  { key: 'phase_retry',        label: 'Phase reprise',                             types: ['phase_retry'] }
];

const SIGNATURE_BY_TYPE = new Map();
for (const s of SIGNATURES) for (const t of s.types) SIGNATURE_BY_TYPE.set(t, s);

/** Normalise un message pour regrouper des formulations différentes du même problème. */
function normalize(message) {
  if (!message) return '(no message)';
  return String(message)
    .toLowerCase()
    .replace(/[0-9a-f]{8,}/g, '<hex>')          // hashes
    .replace(/\d{4}-\d{2}-\d{2}t[\d:.]+z?/g, '<ts>') // timestamps
    .replace(/\/[\w./-]{6,}/g, '<path>')        // chemins absolus
    .replace(/\.forge\/[\w./-]+/g, '<forge-path>')
    .replace(/[\w-]+\.(md|json|tsx?|jsx?|py|go|rs)/g, '<file>')
    .replace(/\b\d+\b/g, '<n>')                 // nombres
    .replace(/\s+/g, ' ')
    .trim();
}

/** Signature d'un type d'événement → { key, label }. */
function signatureOf(event) {
  const mapped = SIGNATURE_BY_TYPE.get(event.type);
  if (mapped) return mapped;
  if (String(event.type || '').startsWith('fast_track')) return SIGNATURES.find(s => s.key === 'ft_revise');
  return { key: 'other', label: 'Autre' };
}

/**
 * Sujet de regroupement. Certaines signatures doivent se regrouper par critère
 * structurant (un verdict, une phase) et non par message : deux REVISE sur deux
 * plans différents sont le même problème systémique.
 */
function subjectOf(event, sig) {
  switch (sig.key) {
    case 'ft_revise': return `verdict=${event.verdict || '?'} agent=${event.agent || '?'} phase=${event.phase ?? '?'}`;
    case 'ft_block': return `phase=${event.phase ?? '?'}`;
    case 'gate_revise': return `phase=${event.phase || '?'}`;
    case 'user_correction': return normalize(event.message);
    default: return normalize(event.message || event.reason || event.type);
  }
}

/** Un sync sans divergence n'est pas un incident. */
function isNoise(event) {
  if (event.type === 'sync' && !event.found) return true;
  return false;
}

/* ------------------------------------------------------------------ *
 * Analyse
 * ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ *
 * Collecte
 * ------------------------------------------------------------------ */

function readProjectLog(root) {
  const p = path.join(root, L.AUDIT_PATHS.log);
  if (!fs.existsSync(p)) return null;
  const events = L.readLog(root);
  if (!events.length) return null;

  const state = L.readState(root);
  return {
    root,
    name: (state && state.product && state.product.name) || path.basename(root),
    archetype: (state && state.product && state.product.archetype) || null,
    mode: (state && state.run && state.run.mode) || null,
    events
  };
}

function discoverTargets(args) {
  // Un chemin peut être : un anchor projet, un .forge, ou un parent contenant plusieurs projets.
  const targets = [];
  const add = r => {
    const abs = path.resolve(r);
    if (fs.existsSync(path.join(abs, L.FORGE_DIR, 'state.json')) || fs.existsSync(path.join(abs, L.FORGE_DIR, 'audit', 'run-log.jsonl'))) {
      targets.push(abs);
      return true;
    }
    if (path.basename(abs) === L.FORGE_DIR) {
      const parent = path.dirname(abs);
      if (fs.existsSync(path.join(parent, 'state.json'))) { targets.push(parent); return true; }
    }
    return false;
  };

  for (const a of args) {
    if (add(a)) continue;
    // Descente d'un niveau : cherche des sous-dossiers anchors.
    if (fs.existsSync(a) && fs.statSync(a).isDirectory()) {
      for (const entry of fs.readdirSync(a, { withFileTypes: true })) {
        if (entry.isDirectory()) add(path.join(a, entry.name));
      }
    }
  }
  return [...new Set(targets)];
}

/** Événements d'exploitation :-ce ne sont pas des incidents. */
const INFO_EVENTS = ['init', 'status_change', 'phase_status', 'hash', 'register', 'graph_written', 'migrate', 'sync'];

function analyze(projects) {
  const buckets = new Map();
  const perProject = [];
  const perPhase = {};
  const perAgent = {};
  let totalEvents = 0;
  let first = null;
  let last = null;

  const bump = (map, key) => { map[key] = (map[key] || 0) + 1; };

  for (const project of projects) {
    totalEvents += project.events.length;
    const stats = { name: project.name, root: project.root, archetype: project.archetype, mode: project.mode, events: project.events.length, issues: {} };

    for (const e of project.events) {
      const ts = e.ts || null;
      if (ts) {
        if (!first || ts < first) first = ts;
        if (!last || ts > last) last = ts;
      }

      // On ne compte que les événements "problème" pour le classement de récurrence.
      if (INFO_EVENTS.includes(e.type)) continue;
      if (isNoise(e)) continue;

      const sig = signatureOf(e);
      const norm = subjectOf(e, sig);
      const bucketKey = `${sig.key}|${norm}`;

      if (!buckets.has(bucketKey)) {
        buckets.set(bucketKey, {
          signature: sig.key,
          label: sig.label,
          normalized: norm,
          count: 0,
          projects: new Set(),
          examples: [],
          types: new Set(),
          phases: {}
        });
      }
      const b = buckets.get(bucketKey);
      b.count++;
      b.projects.add(project.name);
      b.types.add(e.type);
      if (e.phase != null) bump(b.phases, String(e.phase));
      if (e.examples === undefined && b.examples.length < 3) {
        b.examples.push({ project: project.name, ts, type: e.type, message: e.message || null, finding: e.finding || null });
      }
      bump(stats.issues, sig.key);

      // Statistiques Fast Track
      if (e.type === 'fast_track_validate') {
        bump(perPhase, `phase_${e.phase ?? '?'}`);
        if (e.verdict) bump(perAgent, e.agent || 'unknown');
      }
      if (e.type === 'gate_approved' || e.type === 'gate_revise') {
        bump(perPhase, `${e.phase || '?'}:${e.type}`);
      }
    }

    perProject.push(stats);
  }

  const recurring = [...buckets.values()]
    .map(b => ({
      ...b,
      projects: [...b.projects],
      project_count: b.projects.size,
      types: [...b.types],
      // Un problème qui traverse plusieurs projets est structurel. Dans un seul projet, c'est probablement ponctuel.
      structural: b.projects.size > 1
    }))
    .sort((a, b) => (b.structural - a.structural) || (b.count - a.count));

  return { recurring, perProject, perPhase, perAgent, totalEvents, first, last };
}

/* ------------------------------------------------------------------ *
 * Rendu
 * ------------------------------------------------------------------ */

function renderMarkdown(report, projects) {
  const L_ = [];
  L_.push('# Rapport d\'audit Forge');
  L_.push('');
  L_.push(`Généré le ${new Date().toISOString().slice(0, 10)}`);
  L_.push('');
  L_.push(`**${projects.length} projet(s)** · **${report.totalEvents} événement(s)**` +
    (report.first ? ` · du ${report.first.slice(0, 10)} au ${report.last.slice(0, 10)}` : ''));
  L_.push('');

  L_.push('## Points d\'attention — problèmes récurrents');
  L_.push('');
  if (!report.recurring.length) {
    L_.push('_Aucun incident enregistré._');
  } else {
    L_.push('Les problèmes qui apparaissent dans **plusieurs projets** sont structurels : ils sont dans le skill, pas dans le projet.');
    L_.push('');
    L_.push('| # | Problème | Occ. | Projets | Structurel |');
    L_.push('|---|---|---|---|---|');
    report.recurring.slice(0, 25).forEach((b, i) => {
      L_.push(`| ${i + 1} | **${b.label}** — ${b.normalized.slice(0, 90)} | ${b.count} | ${b.project_count} | ${b.structural ? '⚠️ oui' : 'non'} |`);
    });
  }
  L_.push('');

  const structural = report.recurring.filter(b => b.structural);
  if (structural.length) {
    L_.push('## Recommandations de correction');
    L_.push('');
    structural.forEach((b, i) => {
      L_.push(`### ${i + 1}. ${b.label} (${b.count} occurrences, ${b.project_count} projets)`);
      L_.push('');
      L_.push(`- **Signature** : \`${b.normalized}\``);
      L_.push(`- **Types d'événements** : ${b.types.map(t => `\`${t}\``).join(', ')}`);
      if (Object.keys(b.phases).length) {
        L_.push(`- **Phases concernées** : ${Object.entries(b.phases).map(([p, n]) => `${p} (${n})`).join(', ')}`);
      }
      L_.push('- **Exemples** :');
      for (const ex of b.examples) L_.push(`  - \`${ex.project}\` ${ex.ts ? ex.ts.slice(0, 16).replace('T', ' ') : ''} — ${ex.message || ex.finding || ex.type}`);
      L_.push('');
    });
  }

  L_.push('## Par projet');
  L_.push('');
  L_.push('| Projet | Archétype | Mode | Événements | Incidents |');
  L_.push('|---|---|---|---|---|');
  for (const p of report.perProject) {
    const issues = Object.entries(p.issues).map(([k, n]) => `${k}:${n}`).join(', ') || '—';
    L_.push(`| ${p.name} | ${p.archetype || '—'} | ${p.mode || '—'} | ${p.events} | ${issues} |`);
  }
  L_.push('');

  const ftPhases = Object.keys(report.perPhase).filter(k => k.startsWith('phase_'));
  if (ftPhases.length) {
    L_.push('## Fast Track');
    L_.push('');
    L_.push('| Phase | Validations |');
    L_.push('|---|---|');
    for (const k of ftPhases) L_.push(`| ${k.replace('phase_', '')} | ${report.perPhase[k]} |`);
    L_.push('');
    if (Object.keys(report.perAgent).length) {
      L_.push('Validations par agent : ' + Object.entries(report.perAgent).map(([a, n]) => `\`${a}\` ${n}`).join(', '));
      L_.push('');
      if (report.perPhase.phase_4 && report.perPhase.phase_5) {
        const ratio = (report.perPhase.phase_5 / (report.perPhase.phase_4 + report.perPhase.phase_5) * 100).toFixed(0);
        L_.push(`Les plans de slice (Phase 5) concentrent **${ratio}%** des validations — c'est là que la validation automatique est la plus rentable.`);
        L_.push('');
      }
    }
  }

  /* ---- Promotion : la section qui distingue un skill qui apprend d'un diary ---- */
  L_.push('## Promotion des constats');
  L_.push('');
  L_.push('> Un constat qui n\'atteint jamais un fichier de règles **n\'a rien changé**.');
  L_.push('> Il est lu *à la place* de la règle qu\'il devait corriger, pas *en plus*.');
  L_.push('');

  const promoted = [], unpromoted = [], undomained = [];
  for (const p of report.perProject) {
    const state = readStateSafe(p.root);
    for (const f of (state && state.findings) || []) {
      const row = { project: p.name, id: f.id, domain: f.domain || null, severity: f.severity, summary: (f.summary || '').slice(0, 100) };
      if (!f.domain) undomained.push(row);
      else if (f.promoted_to) promoted.push(row);
      else unpromoted.push(row);
    }
  }

  if (!promoted.length && !unpromoted.length && !undomained.length) {
    L_.push('_Aucun constat enregistré._');
  } else {
    L_.push('| Projet | ID | Domaine | Gravité | Constat |');
    L_.push('|---|---|---|---|---|');
    for (const r of promoted) L_.push(`| ${r.project} | ${r.id} | ${r.domain} | ${r.severity} | ${r.summary} |`);
    for (const r of unpromoted) L_.push(`| ${r.project} | ${r.id} | ${r.domain} | ${r.severity} | ⚠️ **non promu** — ${r.summary} |`);
    for (const r of undomained) L_.push(`| ${r.project} | ${r.id} | — | ${r.severity} | 🚫 **sans domaine** — ${r.summary} |`);
    L_.push('');
    L_.push(`**${promoted.length}** promus · **${unpromoted.length}** non promus · **${undomained.length}** sans domaine`);
    L_.push('');
    if (unpromoted.length || undomained.length) {
      L_.push('Action : ré-invoquer `project-rules-architect` avec ces constats routés. Voir `references/skill-boundaries.md`.');
      L_.push('');
    }
    if (undomained.length) {
      L_.push('> Les constats **sans domaine** sont la cause mesurée des promotions à zéro : sans cible, un constat n\'a nulle part où aller. Il ne reste qu\'à le lire.');
      L_.push('');
    }
  }

  L_.push('---');
  L_.push('');
  L_.push('_Généré par `scripts/audit-report.js`. Sources : `.forge/audit/run-log.jsonl` et `state.json → findings` de chaque projet._');
  return L_.join('\n');
}

/** Lecture tolérante : l'agrégateur ne doit pas échouer sur un projet illisible. */
function readStateSafe(root) {
  try { return L.readState(root); } catch { return null; }
}

/* ------------------------------------------------------------------ *
 * CLI
 * ------------------------------------------------------------------ */

function main() {
  const argv = process.argv.slice(2);
  if (!argv.length || argv.includes('--help')) {
    L.out({
      usage: {
        report: 'audit-report.js <projet|parent> [<projet> ...] [--out <dir>] [--json]'
      },
      notes: {
        '<projet>': 'un anchor Forge, un dossier .forge, ou un parent contenant plusieurs projets',
        '--out': 'dossier de sortie (défaut : <cwd>/reports)',
        'types': 'signature d\'événements — voir SIGNATURES dans le script'
      }
    });
    return;
  }

  const outFlag = argv.indexOf('--out');
  const outDir = outFlag !== -1 ? path.resolve(argv[outFlag + 1]) : path.join(process.cwd(), 'reports');
  const asJson = argv.includes('--json');
  const inputs = argv.filter(a => !a.startsWith('--') && a !== (outFlag !== -1 ? argv[outFlag + 1] : null));

  const targets = discoverTargets(inputs);
  if (!targets.length) {
    L.fail({
      error: 'no_projects_found',
      searched: inputs,
      hint: 'Passe un ou plusieurs chemins de projets Forge (dossiers contenant .forge/state.json).'
    });
  }

  const projects = targets.map(readProjectLog).filter(Boolean);
  if (!projects.length) {
    L.fail({ error: 'no_audit_logs', projects: targets, hint: 'Aucun .forge/audit/run-log.jsonl exploitable.' });
  }

  const report = analyze(projects);
  const md = renderMarkdown(report, projects);
  const stamp = new Date().toISOString().slice(0, 10);

  fs.mkdirSync(outDir, { recursive: true });
  const mdPath = path.join(outDir, `forge-audit-${stamp}.md`);
  const jsonPath = path.join(outDir, `forge-audit-${stamp}.json`);
  fs.writeFileSync(mdPath, md + '\n');
  fs.writeFileSync(jsonPath, JSON.stringify({
    generated_at: new Date().toISOString(),
    projects: report.perProject,
    recurring: report.recurring.map(({ examples, ...rest }) => rest),
    per_phase: report.perPhase,
    per_agent: report.perAgent,
    total_events: report.totalEvents,
    window: { first: report.first, last: report.last }
  }, null, 2) + '\n');

  if (asJson) {
    L.out(JSON.parse(fs.readFileSync(jsonPath, 'utf-8')));
  } else {
    L.out({
      command: 'audit-report',
      projects: projects.length,
      projects_list: report.perProject.map(p => ({ name: p.name, root: p.root, events: p.events })),
      total_events: report.totalEvents,
      top_issues: report.recurring.slice(0, 10).map(b => ({
        signature: b.signature,
        label: b.label,
        count: b.count,
        projects: b.project_count,
        structural: b.structural
      })),
      written: [mdPath, jsonPath]
    });
  }

  // Un problème structureux est un signal d'action : exit 2 pour l'automatisation.
  if (report.recurring.some(b => b.structural)) process.exit(2);
}

main();
