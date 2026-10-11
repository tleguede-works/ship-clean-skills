#!/usr/bin/env node

/**
 * selftest.js — prouve que `rules-selftest.js` **détecte** ce qu'il prétend
 * détecter.
 *
 * Un contrôle non testé est une hypothèse. Celui-ci échoue quand la règle
 * qu'il porte est fausse, et il le prouve en construisant deux jeux de règles
 * jetables dans un répertoire temporaire :
 *
 *   - un jeu **sain**, qui doit passer tous les contrôles ;
 *   - un jeu **cassé**, qui doit échouer sur les contrôles nommés, un par un.
 *
 * Sans ce fichier, le jour où une expression régulière est « corrigée » pour
 * qu'un contrôle cesse de signaler un faux positif, on ne voit pas que le
 * vrai positif est parti avec elle. Le défaut que le script cherche — un
 * contrôle trop permissif qui rapporte « tout va bien » — est exactement le
 * défaut que ce fichier attrape.
 *
 *   node selftest.js [--json]
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const SELF = path.join(__dirname, 'rules-selftest.js');

function w(dir, rel, content) {
  const p = path.join(dir, rel);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, content);
}

function run(dir) {
  try {
    const out = execFileSync('node', [SELF, dir, '--json'], { encoding: 'utf-8', stdio: ['ignore', 'pipe', 'pipe'] });
    return { code: 0, report: JSON.parse(out) };
  } catch (e) {
    const out = e.stdout ? e.stdout.toString() : '{}';
    let report = null;
    try { report = JSON.parse(out); } catch { /* sortie illisible */ }
    return { code: e.status === undefined ? 1 : e.status, report };
  }
}

const failed = (r) => r.report ? r.report.checks.filter(c => !c.ok).map(c => c.name) : ['<sortie illisible>'];

/* ------------------------------------------------------------------ *
 * 1. Un jeu sain doit tout passer.
 * ------------------------------------------------------------------ */

const HEALTHY_ENTRY = `# Projet — Instructions

## Commandes

| Action | Commande |
|---|---|
| Lint | \`npm run lint\` |
| Typecheck | \`npm run typecheck\` |
| Tests | \`npm test\` |

## Definition of Done

1. \`npm run lint\` exits 0
2. \`npm run typecheck\` exits 0
3. \`npm test\` exits 0
4. \`npm run gate:coverage\` exits 0 — couverture
5. \`npx jscpd --threshold 3 src\` exits 0 — duplication
6. \`npm audit --audit-level=high\` exits 0 — vulnérabilités
7. La code review est faite et approuvée (\`30-code-review.md\`)

## Règles

| Fichier | Gouverne |
|---|---|
| \`10-git-workflow.md\` | commits et branches |
| \`20-quality-gates.md\` | portes et seuils |
| \`30-code-review.md\` | revue de code |
`;

const HEALTHY_GATES = `# Portes de qualité

## Commandes

\`\`\`bash
npm run lint          # sort 0
npm run typecheck     # sort 0
npm test              # sort 0
npm run gate:coverage # couverture 80 %
npx jscpd --threshold 3 src
npm audit --audit-level=high
\`\`\`

## Seuils

- Duplication ≤ 3 %.
- Couverture ≥ 80 %.
- Vulnérabilités : 0.
`;

function buildHealthy(dir) {
  w(dir, 'AGENTS.md', HEALTHY_ENTRY);
  w(dir, 'opencode.json', JSON.stringify({ instructions: ['AGENTS.md', '.opencode/rules/*.md'] }, null, 2));
  w(dir, '.opencode/rules/10-git-workflow.md', '# Git\n\n## Commits\n\nUn commit = une intention.\n');
  w(dir, '.opencode/rules/20-quality-gates.md', HEALTHY_GATES);
  w(dir, '.opencode/rules/30-code-review.md', '# Code Review\n\n## Ce qui est mécanique\n\nLe lint le vérifie.\n');
}

const healthyDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pra-selftest-ok-'));
buildHealthy(healthyDir);
const healthy = run(healthyDir);

/* ------------------------------------------------------------------ *
 * 2. Chaque défaut doit être détecté par le contrôle qui le porte.
 * ------------------------------------------------------------------ */

const BREAKERS = [
  {
    name: 'câblage absent',
    check: 'wiring_present',
    build(dir) { fs.rmSync(path.join(dir, 'opencode.json')); }
  },
  {
    name: 'glob qui ne matche rien',
    check: 'wiring_present',
    build(dir) {
      // Le répertoire visé existe mais ne contient aucun `.md` : une glob qui
      // ne matche rien est une configuration valide qui ne charge rien.
      fs.mkdirSync(path.join(dir, '.opencode/empty'), { recursive: true });
      w(dir, 'opencode.json', JSON.stringify({ instructions: ['AGENTS.md', '.opencode/empty/*.md'] }));
    }
  },
  {
    name: 'fichier livré non listé',
    check: 'index_covers_everything',
    build(dir) { w(dir, '.opencode/rules/99-orphelin.md', '# Orphelin\n\nJamais listé.\n'); }
  },
  {
    name: 'placeholder résiduel',
    check: 'no_placeholder_residue',
    build(dir) { w(dir, '.opencode/rules/10-git-workflow.md', '# Git\n\nFormat : {{COMMIT_FORMAT}}\n'); }
  },
  {
    name: 'renvoi de section qui ne résout pas',
    check: 'cross_references_resolve',
    build(dir) {
      w(dir, '.opencode/rules/10-git-workflow.md', '# Git\n\nVoir `20-quality-gates.md` § Section Inexistante.\n');
    }
  },
  {
    name: 'fichier cité qui n\'existe pas',
    check: 'cross_references_resolve',
    build(dir) {
      w(dir, '.opencode/rules/10-git-workflow.md', '# Git\n\nVoir `absent.md` § Section.\n');
    }
  },
  {
    name: 'deux seuils contradictoires',
    check: 'no_contradictory_thresholds',
    build(dir) {
      // Le défaut est la *contradiction*, pas la présence d'un seuil : il faut
      // donc deux valeurs concurrentes de la même grandeur, dans deux fichiers.
      w(dir, '.opencode/rules/30-code-review.md', '# Code Review\n\nUn fichier de plus de 250 lignes doit être découpé.\n');
      w(dir, '.opencode/rules/40-taille.md', '# Taille\n\nAu-delà de 300 lignes, le fichier doit être découpé.\n');
      const e = path.join(dir, 'AGENTS.md');
      let t = fs.readFileSync(e, 'utf-8');
      t = t.replace('## Règles', '| `40-taille.md` | taille de fichier |\n\n## Règles');
      fs.writeFileSync(e, t);
    }
  },
  {
    name: 'fuite .forge hors Forge',
    check: 'no_forge_coupling',
    build(dir) {
      w(dir, '.opencode/rules/10-git-workflow.md', '# Git\n\nLa stack est dans `.forge/conventions.md`.\n');
    }
  },
  {
    name: 'contamination : bibliothèque d\'une autre stack',
    check: 'no_cross_project_contamination',
    build(dir) {
      w(dir, '.opencode/rules/10-git-workflow.md', '# Git\n\nUtiliser `getServerSideProps` pour le rendu.\n');
    }
  },
  {
    name: 'contamination : auto-référence au gabarit',
    check: 'no_cross_project_contamination',
    build(dir) {
      w(dir, '.opencode/rules/10-git-workflow.md', '# Git\n\nPer the profiles, un commit est petit.\n');
    }
  },
  {
    name: 'prose invérifiable',
    check: 'no_unenforceable_prose',
    build(dir) {
      w(dir, '.opencode/rules/10-git-workflow.md', '# Git\n\nÉcrire proprement le code, où approprié.\n');
    }
  },
  {
    name: 'règle parisée',
    check: 'no_unenforceable_prose',
    build(dir) {
      w(dir, '.opencode/rules/10-git-workflow.md', '# Git\n\nProbably git-flow is right, but verify per project.\n');
    }
  },
  {
    name: 'gate manquant',
    check: 'gates_are_commands',
    build(dir) {
      const p = path.join(dir, '.opencode/rules/20-quality-gates.md');
      fs.writeFileSync(p, '# Portes\n\nRien ici.\n');
      const e = path.join(dir, 'AGENTS.md');
      fs.writeFileSync(e, HEALTHY_ENTRY
        .replace(/^\d+\. .*(coverage|duplication|vulnérabilit|review).*$/gim, ''));
      // Retire aussi les lignes du tableau pour éviter un index cassé.
      fs.writeFileSync(e, HEALTHY_ENTRY.replace(/\| `30-code-review\.md`.*\n/, '').replace(/^\s*[4567]\..*\n/gm, ''));
    }
  },
  {
    name: 'fichier au-dessus du plafond',
    check: 'budget_measured',
    build(dir) {
      w(dir, '.opencode/rules/10-git-workflow.md', '# Git\n\n' + 'ligne\n'.repeat(520));
      const e = path.join(dir, 'AGENTS.md');
      let t = fs.readFileSync(e, 'utf-8');
      t = t.replace('## Règles', '| `10-git-workflow.md` | commits |\n\n## Règles');
      fs.writeFileSync(e, t);
    }
  }
];

const breakerResults = [];
for (const b of BREAKERS) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'pra-selftest-ko-'));
  buildHealthy(dir);
  b.build(dir);
  const r = run(dir);
  const names = failed(r);
  breakerResults.push({
    name: b.name,
    expected: b.check,
    detected: names.includes(b.check),
    failures: names
  });
  fs.rmSync(dir, { recursive: true, force: true });
}

fs.rmSync(healthyDir, { recursive: true, force: true });

/* ------------------------------------------------------------------ *
 * Verdict
 * ------------------------------------------------------------------ */

const healthyOk = healthy.code === 0;
const healthyFailures = failed(healthy);
const undetected = breakerResults.filter(b => !b.detected);
const ok = healthyOk && undetected.length === 0;

if (process.argv.includes('--json')) {
  console.log(JSON.stringify({
    ok,
    healthy_rule_set: { code: healthy.code, failures: healthyFailures },
    breakers: breakerResults
  }, null, 2));
} else {
  console.log('rules-selftest — auto-épreuve');
  console.log('');
  console.log(`[${healthyOk ? 'PASS' : 'FAIL'}] le jeu sain passe tous les contrôles`);
  if (!healthyOk) {
    console.log(`        contrôles en échec : ${healthyFailures.join(', ')}`);
    console.log('        Un contrôle qui échoue sur un jeu sain devient un contrôle que');
    console.log('        l\'on contourne. C\'est pire que pas de contrôle.');
  }
  console.log('');
  for (const b of breakerResults) {
    console.log(`[${b.detected ? 'PASS' : 'FAIL'}] détecte : ${b.name} (${b.expected})`);
    if (!b.detected) console.log(`        contrôles qui ont réellement échoué : ${b.failures.join(', ') || 'aucun'}`);
  }
  console.log('');
  const passed = breakerResults.filter(b => b.detected).length + (healthyOk ? 1 : 0);
  console.log(`${passed}/${breakerResults.length + 1} contrôles vérifiés`);
}

process.exit(ok ? 0 : 1);