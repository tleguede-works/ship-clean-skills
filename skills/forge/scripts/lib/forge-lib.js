/**
 * forge-lib — helpers partagés par les scripts déterministes de Forge.
 *
 * Zéro dépendance. Tout ce qui touche au disque, au front matter YAML, au
 * hachage et à l'audit passe par ici, pour que les scripts ne puissent pas
 * diverger entre eux.
 *
 * Règle structurante : les scripts n'écrivent JAMAIS hors de <racine>/.forge/.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const FORGE_DIR = '.forge';
const STATE_PATH = '.forge/state.json';
const STATE_VERSION = 2;

const AUDIT_PATHS = {
  log: '.forge/audit/run-log.jsonl',
  issues: '.forge/audit/issues.md',
  metrics: '.forge/audit/metrics.json'
};

/** Sous-dossiers de .forge qui ne sont pas des livrables. */
const NON_DELIVERABLE_DIRS = ['audit', '.tmp', 'node_modules'];

/** Livrables livrés avec le layout canonique. kind -> chemin relatif attendu. */
const CANONICAL_LAYOUT = {
  contract: '.forge/contract.md',
  conventions: '.forge/conventions.md',
  prd: '.forge/prd.md',
  roadmap: '.forge/roadmap.md',
  benchmarks: '.forge/benchmarks.md',
  design_system: '.forge/design/design-system.md',
  architecture: '.forge/architecture.md',
  test_plan: '.forge/test-plan.md'
};

const STATUS_VOCAB = {
  phase: ['not_started', 'in_progress', 'approved'],
  document: ['draft', 'in_review', 'approved', 'stale', 'deprecated'],
  slice: ['identified', 'planned', 'in_progress', 'implemented', 'validated']
};

/** Ordre des phases. Source unique : state.js et forge-guard.js lisent ici. */
const PHASE_KEYS = [
  '0_bootstrap', '1_prd', '2_roadmap', '3_design', '4_architecture',
  '5_implementation_plan', '6_validation', '7_implementation', '8_final_validation'
];

/**
 * Ce que chaque phase doit avoir produit pour pouvoir être approuvée.
 *
 * Sans ce contrat, une phase s'approuve sur sa seule parole : les contrôles
 * valident les livrables *déclarés*, donc zéro déclaration donne zéro
 * vérification, et tout passe au vert. Constaté sur un test grandeur nature —
 * Phase 0 approuvée avec `deliverables: {}` et aucun `conventions.md`, puis
 * toute la chaîne enchaînée sur cette base absente.
 *
 * `required` : livrables sans lesquels la phase n'a pas eu lieu.
 * `atLeastOneOf` : phases dont la quantité suit le découpage, pas un compte fixe.
 */
const PHASE_REQUIREMENTS = {
  '0_bootstrap': { required: ['conventions'] },
  '1_prd': { required: ['prd'] },
  '2_roadmap': { required: ['roadmap'] },
  '3_design': { required: ['design_system'], atLeastOneOf: [['screen']] },
  '4_architecture': { required: ['architecture'] },
  '5_implementation_plan': { atLeastOneOf: [['plan']] },
  '6_validation': { required: ['test_plan'] },
  '7_implementation': {},
  '8_final_validation': {}
};

/**
 * Le contrat ne peut exiger que des clés **enregistrables**.
 *
 * Une clé du contrat qui n'existe pas dans `CANONICAL_LAYOUT` ne peut jamais
 * être produite : le gate refuse alors l'approbation, et le refus est
 * inexplicable puisque la clé demandée ressemble à une autre qui existe.
 *
 * Constaté sur un test grandeur nature : `3_design` exigeait `design-system`
 * (tiret) alors que le livrable s'enregistre sous `design_system` (souligné) —
 * parce que le `type:` du gabarit porte un tiret et la clé d'état un autre. Le
 * gate de la Phase 3 était **infranchissable**, et rien ne l'explique.
 *
 * `selftest` vérifie désormais que toute clé exigée est enregistrable.
 */

/** Ce qui manque à une phase pour être complète. Liste vide = complète. */
function missingPhaseRequirements(state, phaseKey) {
  const spec = PHASE_REQUIREMENTS[phaseKey];
  if (!spec) return [];

  const missing = [];
  for (const key of spec.required || []) {
    const entry = (state.deliverables || {})[key];
    if (!entry) missing.push({ key, why: 'aucun livrable enregistré pour cette phase' });
    else if (!entry.path) missing.push({ key, why: 'enregistré sans chemin de fichier' });
  }

  // Un plan de slice est enregistré comme slice avec un plan, ou comme
  // livrable selon la version — on accepte les deux formes plutôt que d'imposer
  // une topologie que le skill ne contrôle pas ailleurs.
  const bucketFor = kind => {
    if (kind === 'plan') {
      const asDeliverable = Object.keys(state.deliverables || {})
        .filter(k => /^plan[-_/]/.test(k));
      const asSlice = Object.values(state.slices || {}).filter(s => s.plan_path || s.plan);
      return asDeliverable.length + asSlice.length;
    }
    const bucket = state[kind === 'screen' ? 'screens' : kind === 'slice' ? 'slices'
      : kind === 'foundation' ? 'foundations' : 'deliverables'] || {};
    return Object.keys(bucket).length;
  };

  for (const group of spec.atLeastOneOf || []) {
    if (!group.some(kind => bucketFor(kind) > 0)) {
      missing.push({
        key: group.join('|'),
        why: `aucun élément de type ${group.join(' ou ')} — la phase n'a rien produit`
      });
    }
  }
  return missing;
}

/**
 * `derived_from` du front matter → chemins relatifs à la racine, résolus.
 *
 * Le champ vit dans le front matter de chaque livrable. `fast-track.md`
 * prescrit aux validateurs de lire « l'artefact + son `derived_from` » : tant
 * que la valeur ne reste pas dans le fichier, cette consigne n'est pas
 * applicable — le validateur devrait ouvrir le document qu'il doit valider
 * pour découvrir son propre périmètre.
 *
 * `sync` recopie donc la valeur dans l'autorité, ce qui **remplit aussi les
 * entrées enregistrées avant que cette propagation existe**.
 */
function resolveDerivedFrom(root, raw) {
  const list = Array.isArray(raw) ? raw : [raw];
  const out = [];
  for (const v of list) {
    const t = String(v == null ? '' : v).trim();
    if (!t || t.startsWith('{{')) continue;
    const abs = path.isAbsolute(t) ? t : path.resolve(root, t);
    const rel = path.relative(root, abs);
    // Un chemin qui sort de la racine n'est pas une provenance exploitable.
    if (rel.startsWith('..')) continue;
    out.push(rel.split(path.sep).join('/'));
  }
  return [...new Set(out)];
}

/** Le seau de `state.json` qui porte un type d'artefact. */
function bucketOf(state, kind) {
  const name = kind === 'screen' ? 'screens' : kind === 'slice' ? 'slices'
    : kind === 'foundation' ? 'foundations' : 'deliverables';
  return state[name] || {};
}

/**
 * La phase qui possède chaque artefact.
 *
 * « Ne jamais entamer la phase suivante sans un "approuvé" clair » est
 * présenté comme la règle la plus importante du skill — et rien ne la
 * vérifiait. Un `architecture.md` de 1838 lignes et quinze plans se sont
 * écrits et enregistrés pendant que le design portait encore
 * `status: draft`, et les douze contrôles passaient au vert : il n'existait
 * nulle part la notion de « phase d'un artefact ». Sans propriétaire déclaré,
 * la règle est inapplicable — et l'agent qui l'enfreint ne peut ni le voir,
 * ni être rattrapé.
 *
 * Ce tableau est cette décision, donc sa source unique. Il est lu par
 * `state.js register` (qui **refuse** d'écrire en avance) et par
 * `forge-guard` (qui constate ce qui est déjà sur disque, donc ce qui a été
 * écrit avant que le contrôle existe).
 *
 * Une liste nomme des clés précises ; `true` nomme « tout le seau ». Les plans
 * sont Phase 5 : ce n'est pas la slice qui est en avance, c'est le fait qu'elle
 * porte déjà un `plan_path`.
 *
 * Les clés sont les `kind` **singuliers** de `state.js register`
 * (`deliverable`, `screen`, `slice`, `foundation`) — pas les noms de seaux de
 * `state.json` (`deliverables`, `screens`…). Les deux vocabulaires coexistent
 * et ne se ressemblent que d'un `s`. La première version de cette table
 * employait les pluriels : le contrôle ne déclencha alors que les plans, via
 * leur cas particulier, et laissa passer l'architecture et tous les écrans
 * sans un mot. `selftest` vérifie désormais que toute clé de cette table est
 * un `kind` enregistrable.
 *
 * `benchmarks` est **volontairement sans propriétaire** : SKILL.md le produit
 * en Phase 1 (recherche de références) et en Phase 3 (grille de conformité).
 * Lui attribuer une phase serait inventer une règle que la documentation
 * n'énonce pas — et un propriétaire inventé produit des refus inexpliqués,
 * ce qui apprend à contourner le garde-fou.
 */
const PHASE_ARTIFACT_OWNERS = {
  '0_bootstrap': { deliverable: ['contract', 'conventions'] },
  '1_prd': { deliverable: ['prd'] },
  '2_roadmap': { deliverable: ['roadmap'] },
  '3_design': { deliverable: ['design_system'], screen: true },
  '4_architecture': { deliverable: ['architecture'], slice: true, foundation: true },
  '5_implementation_plan': { plans: true },
  '6_validation': { deliverable: ['test_plan'] }
};

/**
 * Un artefact a-t-il été produit avant que sa phase ne soit atteinte ?
 *
 * On compare à `current_phase`, **pas** au statut de la phase propriétaire :
 * `complete-phase` avance `current_phase` d'un cran en approuvant, si bien que
 * la phase suivante est « courante » tout en étant `not_started`. Juger sur le
 * statut refuserait d'enregistrer le tout premier livrable de chaque phase —
 * un garde-fou qui bloque le travail légitime s'apprend à contourner.
 *
 * `strictly after` est donc la seule lecture qui distingue « j'avance » de
 * « j'ai produit ce qui n'était pas mon tour ».
 */
/**
 * La phase propriétaire d'un artefact, si elle n'est pas encore atteinte.
 *
 * La décision de propriété ne dépend **que** de `(kind, key)` — jamais de
 * savoir si l'artefact est déjà enregistré. C'était le défaut d'une première
 * version, qui exigeait `bucketOf(state, kind)[key]` avant de conclure : sur le
 * chemin d'écriture de `register` le seau est vide par construction, donc le
 * refus ne se déclenchait jamais — et `forge-guard`, seul à voir l'état déjà
 * peuplé, concluait que la règle fonctionnait.
 *
 * Un garde-fou qui ne s'exerce que sur la copie et jamais à la source protège
 * de rien : c'est la source qu'il faut fermer.
 *
 * `entry` n'est nécessaire que pour le cas `plans`, où la propriété dépend du
 * contenu de l'entrée (une slice *avec* plan appartient à la phase 5, la même
 * slice *sans* plan à la phase 4) et non de son seul nom.
 */
/**
 * Ce chemin est-il celui d'un **plan** d'implémentation ?
 *
 * Une slice appartient à la Phase 4, son plan à la Phase 5. Les deux sont donc
 * deux fichiers différents, et la distinction ne peut pas se faire sur le
 * **contenu** — il n'y en a pas encore — ni sur le **nom de la slice**, qui est le
 * même dans les deux cas. Elle se fait sur le **chemin**, qui est la seule chose
 * que l'enregistrement connaît.
 *
 * Sans cette fonction, deux lectures du même enregistrement étaient possibles et
 * aucune n'était fausse :
 *
 * - `register` écrivait `plan_path = relPath`, donc une slice enregistrée contre
 *   `.forge/architecture.md` se croyait avoir un plan, et `no_premature_artifacts`
 *   la signalait « plan écrit avant la phase 5 » ;
 * - le même enregistrement donnait à la slice le `content_hash` de
 *   l'architecture, et `consistency-check` en déduisait qu'un plan avait été écrit
 *   puis **disparu** — donc qu'il fallait le réécrire avant d'avancer.
 *
 * Un seul endroit décide, et il décide sur le chemin.
 */
function isPlanPath(relPath) {
  if (!relPath) return false;
  const p = String(relPath);
  return /(^|\/)plans?\//.test(p) || /\.plan\.md$/i.test(p);
}

function ownerPhaseFor(state, kind, key, entry) {
  const current = parseInt(state && state.current_phase, 10);
  if (!Number.isFinite(current)) return null;

  for (const [phaseKey, spec] of Object.entries(PHASE_ARTIFACT_OWNERS)) {
    const idx = PHASE_KEYS.indexOf(phaseKey);
    if (idx < 0 || idx <= current) continue;

    // `plans` : la slice appartient à la Phase 4, son plan à la Phase 5.
    if (spec.plans && (kind === 'slice' || kind === 'foundation')) {
      const item = entry || bucketOf(state, kind)[key];
      if (item && (item.plan_path || item.plan)) {
        return { phase: phaseKey, bucket: kind, key, why: 'plan écrit avant la phase 5' };
      }
      continue;
    }

    if (spec[kind] === true || (Array.isArray(spec[kind]) && spec[kind].includes(key))) {
      return { phase: phaseKey, bucket: kind, key, why: `enregistré avant la phase ${idx}` };
    }
  }
  return null;
}

/** Un artefact a-t-il été produit avant que sa phase ne soit atteinte ? */
function isPrematureArtifact(state, kind, key, entry) {
  const owner = ownerPhaseFor(state, kind, key, entry);
  return owner ? { premature: true, ...owner } : null;
}

/** Tous les artefacts enregistrés en avance. Liste vide = rien n'a été produit trop tôt. */
function prematureArtifacts(state) {
  const found = [];
  for (const kind of ['deliverable', 'screen', 'slice', 'foundation']) {
    for (const key of Object.keys(bucketOf(state, kind))) {
      const hit = isPrematureArtifact(state, kind, key);
      if (hit) found.push(hit);
    }
  }
  return found;
}

/** Clés de state.json autorisées (schema strict, cf. guard state-schema). */
const ALLOWED_STATE_KEYS = [
  'version', 'forge_skill_version', 'product', 'project', 'reference_projects',
  'run', 'current_phase', 'phases', 'deliverables', 'index', 'screens',
  'foundations', 'modules', 'slices', 'gates_pending', 'audit', 'divergences',
  'findings', 'client'
];

/**
 * Domaines de constat = fichiers de règles vers lesquels un constat est promu.
 *
 * Ce n'est pas une liste arbitraire : c'est le routage. Un constat sans
 * domaine n'a nulle part où aller, donc il ne change rien — il devient un
 * journal de plus, en concurrence avec les règles qu'il devait informer.
 *
 * Ces noms correspondent aux gabarits de project-rules-architect. Un constat
 * dont le domaine n'est pas dans cette liste n'est pas routable : il doit
 * aller dans .forge/audit/issues.md (incident), pas dans state.json.
 */
const FINDING_DOMAINS = [
  'entry-file.md', 'workflow.md', 'architecture.md', 'coding-standards.md', 'security.md',
  'data-and-state.md', 'testing.md', 'ui-components.md', 'forms.md',
  'errors-and-loading-states.md', 'external-system-contracts.md',
  'accessibility.md', 'design-system.md', 'i18n.md', 'performance.md',
  'flutter-dart.md', 'typescript-javascript.md', 'react.md', 'react-native-expo.md',
  'nextjs.md', 'node-nestjs.md', 'java-spring.md'
];

/** Sous-clés interdites dans state.json : le contenu des documents vit ailleurs. */
const FORBIDDEN_STATE_KEYS = [
  'content', 'body', 'markdown', 'text', 'html', 'sections', 'prose',
  'document_content', 'raw', 'summary_text'
];

/* ------------------------------------------------------------------ *
 * Utilitaires terminal
 * ------------------------------------------------------------------ */

/**
 * Sortie de résultat.
 *
 * Les scripts sont conçus pour être enchaînés : `state.js … | node -e …`,
 * comme le fait la documentation. Donc le résultat — y compris un refus — va
 * sur stdout, pour rester lisible dans une chaîne de commandes.
 */
function out(obj) {
  process.stdout.write(JSON.stringify(obj, null, 2) + '\n');
}

/**
 * Échec : stderr, plus une copie sur stdout.
 *
 * Le fait d'écrire aussi sur stdout est délibéré, parce que le refus reste
 * ainsi lisible dans un enchaînement. Mais stderr porte la version qui ne peut
 * pas être perdue.
 *
 * Constaté sur un test grandeur nature : sept `state.js finding …` ont été
 * lancés avec `> /dev/null`. Tous les sept avaient échoué — domaine de règle
 * inconnu — et aucun n'a laissé de trace. La sortie de résultat et le signal
 * d'échec étaient sur le même flux, donc le shell pouvait avaler l'échec
 * exactement comme il avale une sortie normale. C'est le pire endroit pour
 * perdre une information : le compte de ce qui a été enregistré dans l'état.
 */
function fail(obj, code = 1) {
  process.stderr.write(JSON.stringify(obj, null, 2) + '\n');
  process.stdout.write(JSON.stringify(obj, null, 2) + '\n');
  process.exit(code);
}

/* ------------------------------------------------------------------ *
 * Front matter YAML (sans dépendance)
 *
 * Ce n'est PAS du YAML complet, et il ne doit pas le devenir : il couvre
 * exactement ce que les gabarits de Forge écrivent, et refuse de lire une
 * construction qu'il ne sait pas rendre.
 *
 * Deux formes sont donc gérées, parce que les gabarits les utilisent toutes
 * les deux :
 *   - les scalaires, y compris les blocs pliés (`>-`) ;
 *   - les séquences en bloc :
 *         derived_from:
 *           - .forge/prd.md
 *           - .forge/architecture.md
 *
 * Le support des séquences n'est pas un détail. `derived_from` EST le contrat
 * de lecture d'un validateur Fast Track, et `set-status` réécrit le front
 * matter à chaque changement de statut. Un lecteur qui ne sait pas rendre une
 * séquence la lit comme une chaîne vide : la trace est détruite au PREMIER
 * `set-status`, c'est-à-dire au moment précis où elle commence à compter, et
 * `forge-guard` comme `consistency-check` rapportent un vert.
 * Constaté sur un test grandeur nature : `benchmarks.md`, `screen.md`,
 * `implementation-plan.md` et `scenario.md` — les quatre gabarits porteurs
 * d'une séquence.
 * ------------------------------------------------------------------ */

/** Une valeur est-elle rendue telle quelle par un parseur YAML ? */
const YAML_UNSAFE = /[[\]{}]|:\s|\s#|^[\s]|["']|^\s*#|^\s*-|^\s*&|^\s*\*/;

function unquote(raw) {
  const s = raw.trim();
  if (s.length >= 2 && ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'")))) {
    const inner = s.slice(1, -1);
    // Un scalaire double-quoté est échappé : on ne le décode qu'en partie,
    // et ce qui reste est rendu tel quel à la réécriture. Mieux vaut une
    // escapade visible qu'une donnée perdue.
    return inner.replace(/\\"/g, '"').replace(/\\n/g, '\n').replace(/\\\\/g, '\\');
  }
  return s;
}

function splitFrontMatter(content) {
  const normalized = content.replace(/^﻿/, '');
  if (!normalized.startsWith('---')) return null;

  const lines = normalized.split('\n');
  if (lines[0].trim() !== '---') return null;

  let end = -1;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === '---') { end = i; break; }
  }
  if (end === -1) return null;

  const data = {};
  const src = lines.slice(1, end);
  let i = 0;

  while (i < src.length) {
    const line = src[i];
    i++;

    if (!line.trim() || line.trim().startsWith('#')) continue;
    // Une ligne de séquence orpheline (le parent a déjà été consommé) est ignorée :
    // elle n'a pas de clé, donc pas de valeur à perdre.
    if (/^\s*-\s/.test(line)) continue;

    const idx = line.indexOf(':');
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    let value = line.slice(idx + 1).trim();

    // Séquence en bloc : `key:` puis des lignes `- item` indentées.
    if (value === '') {
      const items = [];
      const blockLines = [];
      while (i < src.length && /^\s+\S/.test(src[i])) {
        const l = src[i];
        const item = l.match(/^\s*-\s+(.*)$/);
        if (item) items.push(unquote(item[1]));
        else blockLines.push(l.trim());
        i++;
      }
      if (items.length) {
        data[key] = items;
        continue;
      }
      if (blockLines.length) {
        // Séquence de scalaires Written sur plusieurs lignes sans `-` : on ne
        // sait pas la rendre. On la garde en texte plutôt que de l'effacer.
        data[key] = blockLines.join(' ');
        continue;
      }
      data[key] = '';
      continue;
    }

    // Bloc plié ou littéral : `key: >-`, `key: |`, …
    if (/^[>|][-+]?\d*$/.test(value)) {
      const blockLines = [];
      while (i < src.length && (/^\s+\S/.test(src[i]) || !src[i].trim())) {
        if (src[i].trim()) blockLines.push(src[i].trim());
        i++;
      }
      data[key] = blockLines.join(' ').replace(/\s+/g, ' ').trim();
      continue;
    }

    if (value.startsWith('[') && value.endsWith(']')) {
      const inner = value.slice(1, -1).trim();
      data[key] = inner
        ? inner.split(',').map(v => unquote(v)).filter(Boolean)
        : [];
      continue;
    }

    data[key] = unquote(value);
  }

  return { data, body: lines.slice(end + 1).join('\n'), bodyStartLine: end + 1 };
}

function serializeFrontMatter(data) {
  const lines = ['---'];
  for (const [key, value] of Object.entries(data)) {
    if (value === null || value === undefined) { lines.push(`${key}: null`); continue; }

    // Une séquence est écrite en bloc, jamais en `[a, b]`. Deux raisons : la
    // forme `[…]` casse sur un élément contenant une virgule, et elle ne
    // se relit pas à l'identique — ce qui ferait bouger `content_hash` à
    // chaque changement de statut.
    if (Array.isArray(value)) {
      if (!value.length) { lines.push(`${key}: []`); continue; }
      lines.push(`${key}:`);
      for (const item of value) {
        const str = String(item);
        lines.push(`  - ${YAML_UNSAFE.test(str) ? JSON.stringify(str) : str}`);
      }
      continue;
    }

    const str = String(value);
    if (str.includes('\n')) {
      // Un scalaire multiligne reste un bloc : le lire comme un seul jeton
      // produirait des `\n` littéraux dans la valeur.
      lines.push(`${key}: >-`);
      for (const part of str.split('\n')) {
        const t = part.trim();
        if (!t) continue;
        lines.push(`  ${YAML_UNSAFE.test(t) ? JSON.stringify(t) : t}`);
      }
      continue;
    }
    lines.push(`${key}: ${YAML_UNSAFE.test(str) ? JSON.stringify(str) : str}`);
  }
  lines.push('---');
  return lines.join('\n');
}

function readFrontMatter(filePath) {
  if (!fs.existsSync(filePath)) return null;
  return splitFrontMatter(fs.readFileSync(filePath, 'utf-8'));
}

function writeFrontMatter(filePath, data) {
  const current = fs.readFileSync(filePath, 'utf-8');
  const split = splitFrontMatter(current);
  if (!split) {
    throw new Error(`Front matter absent ou invalide : ${filePath}`);
  }
  const bom = current.startsWith('﻿') ? '﻿' : '';
  // normalizeBody retire les sauts de ligne de tête : le corps écrit est donc
  // toujours identique à celui que contentHash hache, quelle que soit la façon
  // dont le fichier a été produit. Sans cette symétrie, un simple changement de
  // statut modifierait le content_hash et marquerait le document « stale ».
  const next = bom + serializeFrontMatter(data) + '\n\n' + normalizeBody(split.body);
  fs.writeFileSync(filePath, next);
}

/* ------------------------------------------------------------------ *
 * Hachage
 * ------------------------------------------------------------------ */

function sha12(input) {
  return 'sha256:' + crypto.createHash('sha256').update(input).digest('hex').substring(0, 12);
}

/**
 * Forme canonique du corps d'un document.
 * Retire les sauts de ligne de tête et l'espace final : ces variations sont
 * cosmétiques et ne doivent jamais faire bouger un content_hash.
 */
function normalizeBody(body) {
  return String(body).replace(/^\n+/, '').replace(/\s+$/, '');
}

/** Hachage du CORPS du document (hors front matter) : détecte les éditions hors bande. */
function contentHash(filePath) {
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, 'utf-8');
  const split = splitFrontMatter(raw);
  if (!split) return sha12(raw);
  return sha12(normalizeBody(split.body));
}

/* ------------------------------------------------------------------ *
 * Chemins
 * ------------------------------------------------------------------ */

function toAbs(root, rel) {
  return path.isAbsolute(rel) ? rel : path.join(root, rel);
}

function isInside(parentDir, childPath) {
  const rel = path.relative(path.resolve(parentDir), path.resolve(childPath));
  return rel === '' || (!rel.startsWith('..') && !path.isAbsolute(rel));
}

function listFilesRecursive(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === '.git') continue;
      listFilesRecursive(full, acc);
    } else {
      acc.push(full);
    }
  }
  return acc;
}

/* ------------------------------------------------------------------ *
 * Racine du projet (anchor)
 * ------------------------------------------------------------------ */

const PROJECT_MARKERS = [
  '.forge', 'package.json', 'pnpm-workspace.yaml', 'pyproject.toml', 'Cargo.toml',
  'go.mod', 'pubspec.yaml', 'composer.json', 'Gemfile', 'pom.xml', 'build.gradle',
  'build.gradle.kts', 'mix.exs', 'pubspec.lock', 'deno.json', 'project.clj', '.git'
];

/** Le répertoire est-il vide (hors fichiers cachés) ? Un projet greenfield l'est. */
function isEmptyDir(dir) {
  let entries;
  try {
    entries = fs.readdirSync(dir);
  } catch {
    return false;
  }
  return entries.filter(e => !e.startsWith('.')).length === 0;
}

/**
 * Résout la racine du projet courant.
 *
 * Un projet de référence (Legacy, corpus, etc.) accessible depuis la session ne
 * doit JAMAIS devenir l'anchor : seul le répertoire de travail et ses ancêtres
 * légitimes comptent.
 *
 * Trois cas, dans l'ordre :
 *   1. existing_state  — un .forge/state.json dans un ancêtre : reprise.
 *   2. project_marker  — un marqueur dans le répertoire courant, ou remontée
 *                        courte SI le répertoire courant contient déjà des
 *                        fichiers (donc qu'on est dans un sous-dossier, pas
 *                        dans un projet neuf).
 *   3. cwd             — répertoire de travail tel quel : projet greenfield.
 *
 * Le cas 2 est volontairement conditionnel. Un répertoire vide est un projet
 * qu'on s'apprête à créer : remonter chercher un marqueur chez ses parents
 * reviendrait à ancrer le nouveau projet sur un monorepo ou un projet voisin —
 * exactement le bug d'ancrage erroné qu'on cherche à empêcher.
 */
function resolveAnchor(startPath) {
  const start = path.resolve(startPath);
  const isProject = dir => PROJECT_MARKERS.some(m => fs.existsSync(path.join(dir, m)));
  const chain = [];

  // 1. Un .forge existant dans un ancêtre du répertoire courant gagne : c'est la
  //    reprise d'un projet en cours, y compris si on se trouve dans un sous-dossier.
  let cursor = start;
  for (;;) {
    chain.push(cursor);
    if (fs.existsSync(path.join(cursor, FORGE_DIR, 'state.json'))) {
      return { root: cursor, source: 'existing_state', chain, ascended: chain.length > 1 };
    }
    const parent = path.dirname(cursor);
    if (parent === cursor) break;
    cursor = parent;
  }

  // 2a. Marqueur dans le répertoire courant lui-même.
  if (isProject(start)) return { root: start, source: 'project_marker', chain, ascended: false };

  // 2b. Remontée courte — seulement si le répertoire courant contient déjà des
  //     fichiers, signe qu'on est dans un sous-dossier et non dans un projet neuf.
  if (!isEmptyDir(start)) {
    cursor = start;
    for (let hops = 0; hops < 2; hops++) {
      const parent = path.dirname(cursor);
      if (parent === cursor) break;
      cursor = parent;
      if (isProject(cursor)) return { root: cursor, source: 'project_marker', chain, ascended: true };
    }
  }

  // 3. Aucun marqueur : projet neuf, on utilise le répertoire de travail tel quel.
  return { root: start, source: 'cwd', chain, ascended: false };
}

/* ------------------------------------------------------------------ *
 * state.json
 * ------------------------------------------------------------------ */

function statePath(root) {
  return path.join(root, STATE_PATH);
}

function readState(root) {
  const p = statePath(root);
  if (!fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p, 'utf-8'));
}

function writeState(root, state) {
  fs.mkdirSync(path.join(root, FORGE_DIR), { recursive: true });
  state.version = STATE_VERSION;
  fs.writeFileSync(statePath(root), JSON.stringify(state, null, 2) + '\n');
}

function ensureLayout(root) {
  const dirs = [
    FORGE_DIR,
    `${FORGE_DIR}/design`,
    `${FORGE_DIR}/design/screens`,
    `${FORGE_DIR}/plans`,
    `${FORGE_DIR}/audit`
  ];
  for (const d of dirs) fs.mkdirSync(path.join(root, d), { recursive: true });
}

function deliverables(state) {
  return state.deliverables || {};
}

function findDeliverableByPath(state, relPath) {
  const target = path.normalize(relPath);
  for (const [key, d] of Object.entries(deliverables(state))) {
    if (d.path && path.normalize(d.path) === target) return key;
  }
  return null;
}

/* ------------------------------------------------------------------ *
 * Audit (append-only)
 * ------------------------------------------------------------------ */

function appendLog(root, event) {
  const p = path.join(root, AUDIT_PATHS.log);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  const entry = { ts: new Date().toISOString(), ...event };
  fs.appendFileSync(p, JSON.stringify(entry) + '\n');
  return entry;
}

function readLog(root) {
  const p = path.join(root, AUDIT_PATHS.log);
  if (!fs.existsSync(p)) return [];
  return fs.readFileSync(p, 'utf-8')
    .split('\n')
    .filter(Boolean)
    .map(line => { try { return JSON.parse(line); } catch { return null; } })
    .filter(Boolean);
}

/* ------------------------------------------------------------------ *
 * Détection de livrables égarés (hors .forge)
 * ------------------------------------------------------------------ */

const DELIVERABLE_MARKERS = [
  'type: prd', 'type: roadmap', 'type: architecture', 'type: design-system',
  'type: implementation-plan', 'type: test-plan', 'type: screen',
  'type: benchmarks', 'type: conventions', 'forge_id:'
];

/** Reconnaît un fichier généré par Forge grâce à son front matter. */
function looksLikeForgeDeliverable(filePath) {
  if (/\.forge[\\/]/.test(filePath)) return false;
  let head;
  try {
    const fd = fs.openSync(filePath, 'r');
    const buf = Buffer.alloc(512);
    const read = fs.readSync(fd, buf, 0, 512, 0);
    fs.closeSync(fd);
    head = buf.slice(0, read).toString('utf-8');
  } catch {
    return false;
  }
  if (!head.startsWith('---')) return false;
  return DELIVERABLE_MARKERS.some(m => head.includes(m));
}

/**
 * Les nœuds du graphe : slices ET fondations.
 *
 * Une fondation est un nœud du graphe — `architecture.md` §2 le dit — et elle a
 * un plan, un statut, des dépendances, un hash. Longtemps, `check-stale`,
 * `coverage-check` et `forge-exit` ne lisaient que `state.slices`.
 *
 * Conséquence, mesurée : `state.js check-stale . F4` répondait
 * `unknown_slice` alors que F4 était déclarée dans `state.foundations`. Et
 * FastTrack prescrit précisément ce script à l'étape 2 de sa boucle de
 * validation — donc **le mode ne pouvait pas valider une fondation**, c'est-à-dire
 * ni F1 (design system) ni F4 (isolation par ligne), les deux plus délicates du
 * projet. L'agent contournait alors l'étape, ou lisait « unknown_slice » comme
 * « rien à vérifier ».
 *
 * Passé par un résolveur unique : une fondation et une slice se traitent
 * pareil, et l'oubli d'un script ne peut plus se reproduire.
 */
function graphNodes(state) {
  return { ...(state.foundations || {}), ...(state.slices || {}) };
}

/** Résout un nœud par son nom, quelle que soit sa nature. */
function resolveGraphNode(state, name) {
  const all = graphNodes(state);
  const entry = all[name];
  if (!entry) {
    fail({
      error: 'unknown_slice',
      slice: name,
      known: Object.keys(all),
      rule: 'Le nom est cherché parmi les slices ET les fondations : une fondation est ' +
            'un nœud du graphe, avec le même statut et le même plan.'
    });
  }
  return { key: name, entry, isFoundation: !!(state.foundations || {})[name] };
}

module.exports = {
  FORGE_DIR, STATE_PATH, STATE_VERSION, AUDIT_PATHS, NON_DELIVERABLE_DIRS,
  CANONICAL_LAYOUT, STATUS_VOCAB, ALLOWED_STATE_KEYS, FORBIDDEN_STATE_KEYS, FINDING_DOMAINS,
  out, fail,
  splitFrontMatter, serializeFrontMatter, readFrontMatter, writeFrontMatter, normalizeBody,
  sha12, contentHash,
  toAbs, isInside, listFilesRecursive,
  resolveAnchor,
  statePath, readState, writeState, ensureLayout, deliverables, findDeliverableByPath,
  appendLog, readLog,
  looksLikeForgeDeliverable,
  PHASE_KEYS, PHASE_REQUIREMENTS, missingPhaseRequirements,
  PHASE_ARTIFACT_OWNERS, bucketOf, resolveDerivedFrom, ownerPhaseFor, isPrematureArtifact, prematureArtifacts,
  isPlanPath,
  graphNodes, resolveGraphNode
};
