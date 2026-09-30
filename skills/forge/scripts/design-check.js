#!/usr/bin/env node
'use strict';

/**
 * design-check.js — vérifie mécaniquement ce que la checklist design demande à
 * l'auteur de vérifier à la main.
 *
 * ## Pourquoi ce script existe
 *
 * La checklist de gate du design system demande « contraste N:1 pour le texte
 * courant », et `screen.md.tmpl` demande « contraste {{ratio}} ». Aucun contrôle
 * ne calcule quoi que ce soit : les ratios sont donc **écrits** par l'auteur,
 * pas **mesurés**.
 *
 * Constaté sur un test grandeur nature, sur `.forge/design/design-system.md` de
 * « Amberline » :
 *
 *   - `--color-text-secondary` `#6B7873` sur `#F2F4F3` → **4,17:1**, sous le
 *     seuil AA. Ce token porte les **dates de calcul**, c'est-à-dire la
 *     provenance — l'information sur laquelle repose tout le produit (B5) ;
 *   - `--color-stale` `#8A7F72` → **3,55:1** ;
 *   - `--color-border-strong` `#8A9590` → **2,80:1**, sous le seuil 3:1 des
 *     composants d'interface (WCAG 1.4.11) ;
 *   - `--color-text-secondary` à **4,44:1** sur la ligne alternée des tableaux,
 *     c'est-à-dire **exactement là où on lit le plus** ;
 *   - et les ratios « annoncés » étaient faux : 7,1 pour 7,07, 5,6 pour 5,37,
 *     5,0 pour 4,81. Écrits, pas mesurés.
 *
 * Cinq défauts, un seul script : des valeurs qui échouent, et des valeurs
 * inventées.
 *
 * Commandes :
 *   design-check.js contrast <anchor>   # WCAG 1.4.3 et 1.4.11, mesurés
 *   design-check.js tokens   <anchor>   # tokens sans valeur concrète
 */

const fs = require('fs');
const path = require('path');
const L = require('./lib/forge-lib');

/* ------------------------------------------------------------------ *
 * WCAG
 * ------------------------------------------------------------------ */

function channel(c) {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

function relativeLuminance(hex) {
  const m = /^#?([0-9a-f]{6})$/i.exec(String(hex).trim());
  if (!m) return null;
  const n = parseInt(m[1], 16);
  return 0.2126 * channel((n >> 16) & 255) + 0.7152 * channel((n >> 8) & 255) + 0.0722 * channel(n & 255);
}

function contrast(a, b) {
  const la = relativeLuminance(a), lb = relativeLuminance(b);
  if (la === null || lb === null) return null;
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

/* ------------------------------------------------------------------ *
 * Classification des tokens
 * ------------------------------------------------------------------ */

const TEXT_AA = 4.5;     // WCAG 1.4.3
const NON_TEXT_AA = 3.0; // WCAG 1.4.11

const SURFACE_EXACT = new Set([
  '--color-background', '--color-surface', '--color-surface-raised', '--color-surface-sunken'
]);
const SURFACE_LIGHT_RAMP = new Set(['--color-ink-50', '--color-ink-100', '--color-ink-200']);

/**
 * Exemptions **nommées**, jamais par préfixe.
 *
 * Un préfixe est trop large : `--color-border*` inclut `--color-border-focus`,
 * qui est un anneau de focus — l'exemple même d'un composant qui DOIT atteindre
 * 3:1, sinon un utilisateur qui navigue au clavier ne voit pas où il est.
 * Exempter tout le préfixe, c'est exempter la seule couleur qui compte.
 *
 * Chaque exemption porte sa raison, et la classification est **affichée** dans
 * la sortie pour être contestable.
 */
const EXEMPT = {
  '--color-border': 'filet décoratif — pas une frontière de composant',
  '--color-border-subtle': 'filet décoratif',
  '--color-text-disabled': 'action désactivée — WCAG 1.4.3 exempte le texte inactif'
};

/**
 * ## Comment la classe est déterminée
 *
 * Un contrôle ne peut pas deviner qu'une couleur porte du texte : c'est un fait
 * de design, pas une propriété de la valeur. Trois signaux, tous puisés dans le
 * document lui-même, et **tous affichés dans la sortie** pour être contestables :
 *
 * 1. **la déclaration** — le token est listé dans `EXEMPT`, avec sa raison ;
 * 2. **son usage** — si la colonne « Usage » parle de bordure, de filet ou de
 *    séparation, c'est un **filet**, donc un composant non textuel (3:1), quel que
 *    soit le rang où il se trouve dans la rampe ;
 * 3. **son nom** — `--color-text-*` porte du texte (4,5:1) ; `--color-surface*`,
 *    `*-subtle` et le début d'une rampe sont des remplissages (aucune exigence
 *    propre, mais le texte posé dessus est mesuré) ; le reste est un composant non
 *    textuel (3:1).
 *
 * Le signal 2 existe parce que le signal 3 se trompe : `--color-ink-200` est au
 * début de la rampe — donc « remplissage » par le nom — mais c'est un filet de
 * séparation. Sans le signal 2, un texte à 4,5:1 sur le fond passe à 3,5:1 sur ce
 * filet, et le contrôle ne le voit pas.
 */
const BORDER_USAGE = /\bbordure|\bfi?lets?\b|s[ée]paration|\bcontour\b/i;

function classify(token, usage = '') {
  if (Object.prototype.hasOwnProperty.call(EXEMPT, token)) {
    return { kind: 'exempt', required: null, why: EXEMPT[token], by: 'déclaration' };
  }
  if (token.startsWith('--color-text-')) {
    return { kind: 'text', required: TEXT_AA, why: 'nom `--color-text-*`', by: 'nom' };
  }
  if (SURFACE_EXACT.has(token)) return { kind: 'surface', required: null, why: 'nom de surface', by: 'nom' };
  if (BORDER_USAGE.test(usage)) {
    return { kind: 'non_text', required: NON_TEXT_AA, why: 'usage : filet ou bordure', by: 'usage' };
  }
  if (token.endsWith('-subtle')) return { kind: 'surface', required: null, why: 'nom : teinte de remplissage', by: 'nom' };
  if (SURFACE_LIGHT_RAMP.has(token)) return { kind: 'surface', required: null, why: 'nom : début de rampe', by: 'nom' };
  return { kind: 'non_text', required: NON_TEXT_AA, why: 'défaut : composant non textuel', by: 'défaut' };
}

/* ------------------------------------------------------------------ *
 * Extraction
 * ------------------------------------------------------------------ */

const REQUIRED_TOKENS = [
  '--color-background',
  '--color-surface',
  '--color-text-primary',
  '--color-text-secondary'
];

function readTokens(md) {
  const tokens = new Map();
  md.split('\n').forEach((line, i) => {
    if (!/^\s*\|/.test(line)) return;
    // Les cellules sont entourées de guillemets Markdown : sans les retirer, un
    // token écrit `` `#F2F4F3` `` n'est pas une couleur, et le contrôle ne mesure
    // rien — silencieusement, en passant au vert.
    const cells = line.split('|')
      .map(c => c.trim().replace(/^`+|`+$/g, '').trim())
      .filter(c => c !== '');
    if (cells.length < 2) return;
    const m = /^(--[a-z0-9-]+)$/.exec(cells[0]);
    if (!m) return;
    const rest = cells.slice(1).join(' | ');
    const claimed = (rest.match(/(\d+[.,]\d+)\s*:\s*1/) || [])[1];
    tokens.set(m[1], {
      line: i + 1,
      hex: /^(none|null)$/i.test(cells[1]) ? 'none' : cells[1],
      usage: cells[2] || '',
      claimed: claimed ? parseFloat(claimed.replace(',', '.')) : null
    });
  });
  return tokens;
}

/* ------------------------------------------------------------------ *
 * Contrôles
 * ------------------------------------------------------------------ */

const DESIGN = '.forge/design/design-system.md';

function checkContrast(root) {
  const results = {
    command: 'contrast', anchor: root, pass: true,
    surfaces: [], classified: [], measured: [], offenders: [], unmeasurable: []
  };

  const abs = L.toAbs(root, DESIGN);
  if (!fs.existsSync(abs)) {
    results.error = 'design_system_absent';
    results.hint = 'node "$FORGE/scripts/design-check.js" contrast <anchor> — après la Phase 3.3';
    results.pass = false;
    return results;
  }

  const tokens = readTokens(fs.readFileSync(abs, 'utf-8'));

  for (const required of REQUIRED_TOKENS) {
    if (!tokens.has(required)) {
      results.offenders.push({
        token: required, line: null, problem: 'token_absent',
        why: 'un token porteur de sens n\'est pas déclaré : ' + required
      });
      results.pass = false;
    }
  }

  // Toutes les surfaces du document, pas une liste en dur.
  //
  // La liste en dur est le premier défaut qu'a eu ce contrôle : il ne vérifiait
  // que le fond et trois surfaces nommées, et manquait `--color-ink-100`, la
  // ligne alternée des tableaux. Un texte à 4,5:1 sur le fond et à 4,44:1 sur la
  // ligne alternée passe alors — et c'est sur la ligne alternée qu'on le lit.
  const surfaces = [];
  for (const [key, t] of tokens) {
    if (!t.hex || t.hex === 'none') continue;
    if (classify(key, t.usage).kind === 'surface') surfaces.push({ key, hex: t.hex });
  }
  results.surfaces = surfaces.map(x => x.key);

  for (const [key, t] of tokens) {
    if (!t.hex || t.hex === 'none') continue;

    const cls = classify(key, t.usage);
    results.classified.push({ token: key, line: t.line, kind: cls.kind, why: cls.why, by: cls.by });

    if (cls.kind === 'exempt' || cls.kind === 'surface') continue;

    const bg = tokens.get('--color-background');
    const against = cls.kind === 'text'
      ? surfaces.filter(x => x.key !== key)
      : (bg && bg.hex !== 'none' ? [{ key: '--color-background', hex: bg.hex }] : []);

    let worst = null;
    for (const ref of against) {
      const ratio = contrast(t.hex, ref.hex);
      if (ratio === null) { results.unmeasurable.push({ token: key, hex: t.hex }); continue; }
      // La COMPARAISON se fait sur la valeur brute, jamais sur l'arrondi.
      //
      // Constaté sur le projet de test : `#7A6A3C` sur `#E9EDEB` vaut 4,4958:1.
      // Arrondi à deux décimales, cela fait 4,50 — donc conforme. Or 4,4958 est
      // SOUS 4,5. Un arrondi qui crée un vert est pire qu'une absence d'arrondi :
      // il rend le contrôle vert sur un échec réel.
      if (!worst || ratio < worst.raw) worst = { against: ref.key, raw: ratio, ratio: Math.round(ratio * 100) / 100 };
    }
    if (!worst) continue;

    const entry = {
      token: key, line: t.line, hex: t.hex, kind: cls.kind,
      ratio: worst.ratio, ratio_exact: Math.round(worst.raw * 10000) / 10000,
      against: worst.against, required: cls.required,
      claimed: t.claimed, usage: t.usage
    };
    results.measured.push(entry);

    if (worst.raw < cls.required) {
      entry.problem = 'below_threshold';
      results.offenders.push(entry);
      results.pass = false;
    } else if (t.claimed !== null && Math.abs(t.claimed - worst.raw) > 0.15) {
      // Un ratio annoncé qui ne correspond pas au mesuré est pire qu'un ratio
      // absent : il donne une assurance que rien ne vient soutenir.
      entry.problem = 'claimed_ratio_differs';
      results.offenders.push(entry);
      results.pass = false;
    }
  }

  results.rule = 'Texte (1.4.3) : 4,5:1 contre TOUTE surface du document. Composant non ' +
    'textuel (1.4.11) : 3:1 contre le fond. Surfaces : aucune exigence propre, mais le texte ' +
    'posé dessus est mesuré. Un ratio annoncé qui diffère du mesuré de plus de 0,15 échoue ' +
    'aussi : un ratio inventé donne une assurance que rien ne soutient.';
  results.classification_is_visible = true;
  return results;
}

function checkTokens(root) {
  const abs = L.toAbs(root, DESIGN);
  const results = { command: 'tokens', anchor: root, pass: true, offenders: [] };
  if (!fs.existsSync(abs)) {
    results.error = 'design_system_absent';
    results.pass = false;
    return results;
  }
  const md = fs.readFileSync(abs, 'utf-8');
  md.split('\n').forEach((line, i) => {
    if (!/^\s*\|/.test(line)) return;
    const cells = line.split('|')
      .map(c => c.trim().replace(/^`+|`+$/g, '').trim())
      .filter(c => c !== '');
    const m = /^(--[a-z0-9-]+)$/.exec(cells[0] || '');
    if (!m) return;
    const value = (cells[1] || '').trim();
    if (!value || /^à |à définir|TBD|\?\?/i.test(value)) {
      results.offenders.push({ token: m[1], line: i + 1, value: value || '(vide)' });
    }
  });
  results.pass = results.offenders.length === 0;
  results.rule = 'Un token de design sans valeur concrète est une décision reportée.';
  return results;
}

/* ------------------------------------------------------------------ *
 * Tokens cités par les écrans
 * ------------------------------------------------------------------ */

/**
 * Un écran qui cite un token que le design system ne définit plus, ou avec une
 * autre valeur, écrit une spécification qui ne correspond à rien.
 *
 * Constaté sur un test grandeur nature : après avoir corrigé trois tokens de
 * couleur dans le design system — parce que leurs contrastes échouaient — cinq
 * écrans sur neuf continuaient de citer les **valeurs anciennes**, avec les
 * ratios anciens, et en tiraient des **règles d'usage** : « les dates ne doivent
 * pas utiliser le secondaire », « `stale` ne sert qu'au filet ». Ces règles
 * sont nées d'un couple couleur/fond qui n'existe plus dans le design system.
 * `forge-guard` était vert : rien ne relie un écran à ses tokens.
 *
 * Modifier un token après avoir écrit les écrans n'est donc pas une mise à jour,
 * c'est une **rupture de contrat silencieuse** — et la seule façon de la voir
 * est de comparer ce que chaque écran écrit à ce que le design system définit.
 */
function checkTokensUsed(root) {
  const designAbs = L.toAbs(root, DESIGN);
  const results = { command: 'tokens-used', anchor: root, pass: true, screens: [], offenders: [] };

  if (!fs.existsSync(designAbs)) {
    results.error = 'design_system_absent';
    results.pass = false;
    return results;
  }

  // Ce que le design system définit : token → valeur.
  const defined = new Map();
  for (const [key, t] of readTokens(fs.readFileSync(designAbs, 'utf-8'))) {
    if (t.hex && t.hex !== 'none') defined.set(key.toLowerCase(), { hex: t.hex.toLowerCase(), line: t.line });
  }
  results.defined_tokens = defined.size;

  const state = L.readState(root) || {};
  const screens = [
    ...Object.entries(state.screens || {}).map(([k, s]) => ({ key: k, path: s.path })),
    ...Object.entries(state.deliverables || {}).filter(([, d]) => d.type === 'design-system').map(([k, d]) => ({ key: k, path: d.path }))
  ];

  // `--color-xxx` `#ABCDEF` — un token et la valeur qu'on lui donne sur la ligne.
  const CITE = /(--[a-z0-9-]+)`?\s+`(#[0-9a-fA-F]{6})`|(--[a-z0-9-]+)`\s*\|\s*`(#[0-9a-fA-F]{6})`/g;

  for (const s of screens) {
    if (!s.path) continue;
    const abs = L.toAbs(root, s.path);
    if (!fs.existsSync(abs)) continue;
    const src = fs.readFileSync(abs, 'utf-8');
    let m;
    CITE.lastIndex = 0;
    while ((m = CITE.exec(src)) !== null) {
      const token = (m[1] || m[3] || '').toLowerCase();
      const hex = (m[2] || m[4] || '').toLowerCase();
      if (!token.startsWith('--')) continue;
      const line = src.slice(0, m.index).split('\n').length;
      const def = defined.get(token);
      results.screens.push(s.key);
      if (!def) {
        results.offenders.push({ screen: s.key, token, hex, line, problem: 'token_absent_du_design_system' });
        results.pass = false;
      } else if (def.hex !== hex) {
        results.offenders.push({
          screen: s.key, token, hex, line,
          problem: 'valeur_differe_de_celle_du_design_system',
          design_system_value: def.hex, design_system_line: def.line
        });
        results.pass = false;
      }
    }
  }

  results.rule = 'Un écran qui cite un token que le design system ne définit pas, ou avec une ' +
    'autre valeur, écrit une spécification qui ne correspond à rien. Corriger le token dans le ' +
    'design system ET dans tous les écrans, ou corriger les écrans avant de changer le token.';
  return results;
}

/* ------------------------------------------------------------------ *
 * CLI
 * ------------------------------------------------------------------ */

function main() {
  const argv = process.argv.slice(2);
  const command = argv[0] || 'contrast';
  const root = path.resolve(argv[1] && !argv[1].startsWith('--') ? argv[1] : process.cwd());

  let result;
  switch (command) {
    case 'contrast': result = checkContrast(root); break;
    case 'tokens': result = checkTokens(root); break;
    case 'tokens-used': result = checkTokensUsed(root); break;
    default:
      L.fail({
        error: 'unknown_command', command,
        usage: {
          'design-check.js contrast <anchor>': 'mesure WCAG 1.4.3 et 1.4.11 sur chaque token',
          'design-check.js tokens <anchor>': 'signale les tokens sans valeur concrète',
          'design-check.js tokens-used <anchor>': 'vérifie que chaque écran cite des tokens qui EXISTENT'
        }
      });
      return;
  }

  L.out(result);
  if (!result.pass) process.exit(1);
}

main();