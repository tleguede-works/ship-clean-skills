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

/* ------------------------------------------------------------------ *
 * ## La déclaration du document
 *
 * ## Pourquoi elle existe — le septième cas de la même famille
 *
 * Les trois signaux ci-dessus sont des **littéraux anglais** : `--color-text-*`,
 * `SURFACE_EXACT`, `--color-ink-50/100/200`, `*-subtle`. Ils ont été écrits contre
 * le design system de « Amberline », dont les tokens sont nommés en anglais.
 *
 * Or **tout ce que le skill produit est en français** : `SKILL.md`, les gabarits,
 * les agents, et jusqu'à l'exemple canonique de `design-quality.md`, dont l'ambiance
 * est donnée en français. Un vocabulaire de tokens français n'est donc pas un cas
 * limite : c'est le cas attendu.
 *
 * Constaté sur « Onduleur », premier design system français passé ici, en un seul
 * appel :
 *
 *   - **faux positif** — `--color-texte-inverse` (du texte) classé `non_text` et
 *     mesuré à 1,10:1 sur le fond clair, alors qu'il n'est jamais posé que sur de
 *     l'encre et sur les quatre teintes sémantiques ;
 *   - **faux positif** — les quatre premières teintes d'une rampe (`encre-50` à
 *     `encre-300`), qui sont des **teintes de survol** et des trames, exigées à
 *     3:1 contre le fond alors que la WCAG 1.4.11 ne s'applique pas à une teinte
 *     décorative d'état ;
 *   - **faux négatif, et c'est le grave** — `--color-texte-desactive`, **token de
 *     texte**, mesuré à **3,80:1** sur `--color-surface-sunken`. Classé `non_text`,
 *     il était jugé contre 3:1, donc **conforme**, et le contrôle a rendu
 *     `measured` sans `offenders`. C'est exactement le défaut que ce script a été
 *     écrit pour trouver — `--color-text-secondary` à 4,17:1 sur Amberline — et il
 *     l'a reproduit **dans le document qu'il venait de mesurer**.
 *
 * Le classement par nom est donc un **patron plus étroit que ce que les documents
 * écrivent**, ce qui est le sixième mécanisme déjà rencontré dans ce dossier, et le
 * plus insidieux parce qu'il **échoue dans le sens silencieux**.
 *
 * ## Pourquoi une déclaration, et non des littéraux français
 *
 * Ajouter `--color-texte-*` à côté de `--color-text-*` ne ferait que déplacer le
 * problème : il faudrait réécrire la liste à chaque vocabulaire, et le contrôle
 * continuerait à **deviner**. Or le principe tenu depuis cinq échecs est inverse :
 * un contrôle qui marche **résout un pointeur déclaré** ; une tentative
 * d'inférence produit du bruit.
 *
 * Le document déclare donc ses propres classes, une fois, et le script mesure.
 * L'ordre de résolution est : **déclaration, puis `EXEMPT`, puis les heuristiques
 * historiques** — ce qui laisse inchangés les design systems déjà écrits, dont
 * Amberline.
 * ------------------------------------------------------------------ */

/** `<!-- forge:token-classes … -->` — un jeton, un `=`, une liste ou une raison. */
const DECL_OPEN = /<!--\s*forge:token-classes\s*([\s\S]*?)-->/;
const DECL_LINE = /^(--[a-z0-9-]+)(?:\s*=\s*(.*))?$/i;
const DECL_DIRECTIVE = /^(text|surface|nontext|on|exempt)$/i;

function splitTokens(raw) {
  return String(raw || '')
    .split(/[\s,]+/)
    .map(s => s.trim().replace(/^`+|`+$/g, ''))
    .filter(s => /^--[a-z0-9-]+$/i.test(s));
}

function parseDeclaration(md) {
  const m = DECL_OPEN.exec(md);
  if (!m) return null;
  const decl = { text: [], surface: [], nontext: [], on: {}, exempt: {}, seen: false };
  let directive = null;
  for (const raw of m[1].split('\n')) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    decl.seen = true;
    const head = /^([a-z]+)\s*:?\s+(.*)$/i.exec(line) || /^([a-z]+)\s*:?\s*$/.exec(line);
    if (head && DECL_DIRECTIVE.test(head[1])) {
      directive = head[1].toLowerCase();
      const rest = head[2] || '';
      if (!rest) continue;
      const kv = DECL_LINE.exec(rest.trim());
      if (kv) applyDeclEntry(decl, directive, kv);
      else for (const tk of splitTokens(rest)) (decl[directive] = decl[directive] || []).push(tk);
      continue;
    }
    const kv = DECL_LINE.exec(line);
    if (kv && directive) { applyDeclEntry(decl, directive, kv); continue; }
    // Ligne de continuation d'une liste : plusieurs tokens, sans `=`. La première
    // version de ce parseur les perdait — la directive restait active mais la ligne
    // ne correspondait ni à une directive ni à une paire `token = valeur`. Résultat :
    // une déclaration paraissait complète et ne l'était qu'à moitié, et les tokens
    // manquants retombaient sur le classement par défaut.
    if (directive && /^(text|surface|nontext)$/.test(directive)) {
      for (const tk of splitTokens(line)) decl[directive].push(tk);
    }
  }
  return decl;
}

function applyDeclEntry(decl, directive, kv) {
  const token = kv[1];
  const rest = (kv[2] || '').trim();
  // `on:` IMPLIQUE `text` : « posé sur X » n'a pas de sens pour une surface ou un
  // composant, donc la ligne dit les deux choses en une. L'exiger deux fois serait
  // faire répéter au document ce qu'il vient déjà d'écrire.
  if (directive === 'on') {
    if (!decl.text.includes(token)) decl.text.push(token);
    decl.on[token] = splitTokens(rest);
    return;
  }
  if (directive === 'exempt') { decl.exempt[token] = rest || 'exempté par le document'; return; }
  (decl[directive] = decl[directive] || []).push(token);
}

function declaredClass(decl, token, usage) {
  if (!decl) return null;
  if (Object.prototype.hasOwnProperty.call(decl.exempt, token)) {
    return { kind: 'exempt', required: null, why: decl.exempt[token], by: 'déclaration' };
  }
  if (decl.text.includes(token)) {
    return { kind: 'text', required: TEXT_AA, why: 'déclaration : porte du texte', by: 'déclaration' };
  }
  if (decl.surface.includes(token)) {
    return { kind: 'surface', required: null, why: 'déclaration : fond sur lequel du texte est posé', by: 'déclaration' };
  }
  if (decl.nontext.includes(token)) {
    return { kind: 'non_text', required: NON_TEXT_AA, why: 'déclaration : composant d\'interface', by: 'déclaration' };
  }
  return null;
}

function classify(token, usage = '', decl = null) {
  const declared = declaredClass(decl, token, usage);
  if (declared) return declared;
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

  const md = fs.readFileSync(abs, 'utf-8');
  const tokens = readTokens(md);
  const decl = parseDeclaration(md);

  // Les tokens exigés ne sont plus une liste de **noms anglais** quand le
  // document déclare ses classes : exiger `--color-text-primary` d'un document
  // français l'obligerait à déclarer un token qu'il n'a pas, ou à renommer sa
  // palette pour satisfaire un script. L'exigence devient alors **structurelle** —
  // « il y a au moins un texte, et un fond » — ce qui est ce que la liste en dur
  // cherchait réellement à garantir.
  if (decl && decl.seen) {
    if (!decl.text.length) {
      results.offenders.push({
        token: '(déclaration)', line: null, problem: 'declaration_incomplete',
        why: 'la déclaration des classes ne nomme aucun token de texte'
      });
      results.pass = false;
    }
    if (!decl.surface.includes('--color-background')) {
      results.offenders.push({
        token: '--color-background', line: null, problem: 'declaration_incomplete',
        why: 'le fond n\'est pas déclaré comme surface : tout texte serait mesuré contre rien'
      });
      results.pass = false;
    }
  } else {
    for (const required of REQUIRED_TOKENS) {
      if (!tokens.has(required)) {
        results.offenders.push({
          token: required, line: null, problem: 'token_absent',
          why: 'un token porteur de sens n\'est pas déclaré : ' + required
        });
        results.pass = false;
      }
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
    if (classify(key, t.usage, decl).kind === 'surface') surfaces.push({ key, hex: t.hex });
  }
  // Un composant déclaré n'est PAS une surface, et c'est délibéré.
  //
  // Première version de ce correctif : tout `nontext` entrait dans les surfaces,
  // « parce qu'un bouton porte son libellé ». C'est exact pour le bouton et faux
  // pour tout le reste — un texte courant n'est pas posé sur un filet, et le
  // mesureur retient le **pire** couple. Résultat : du texte de corps était
  // signalé à 2,16:1 sur le fond d'un bouton où il ne sera jamais écrit. Un
  // contrôle plus strict que la réalité n'est pas plus prudent, il est faux.
  //
  // Le mécanisme honnête est `on:` : c'est le document qui dit sur quels fonds un
  // texte est effectivement posé. Le libellé d'un bouton le déclare, le texte
  // courant non.
  if (decl && decl.seen) {
    results.surfaces_note = 'les surfaces sont celles déclarées `surface:` ; un texte posé ' +
      'sur un composant le déclare par `on:`';
  }
  results.surfaces = surfaces.map(x => x.key);

  for (const [key, t] of tokens) {
    if (!t.hex || t.hex === 'none') continue;

    const cls = classify(key, t.usage, decl);
    results.classified.push({ token: key, line: t.line, kind: cls.kind, why: cls.why, by: cls.by });

    // Un token **de couleur** absent de la déclaration d'un document qui en
    // declare une est un engagement non tenu : le document a écrit la liste, donc
    // l'omettre est un choix, pas un oubli qu'un nom puisse rattraper.
    if (decl && decl.seen && /^#[0-9a-f]{6}$/i.test(t.hex) && !declaredClass(decl, key, t.usage)) {
      results.offenders.push({
        token: key, line: t.line, hex: t.hex, kind: 'undeclared', problem: 'undeclared_class',
        why: 'le document déclare ses classes et omet ce token de couleur : il est classé par défaut, non par engagement'
      });
      results.pass = false;
    }

    if (cls.kind === 'exempt' || cls.kind === 'surface') continue;

    const bg = tokens.get('--color-background');
    // Un texte inversé n'est jamais posé que sur des fonds sombres. Le document
    // le déclare : sans `on:`, le mesurer contre TOUTE surface du document
    // produirait un échec sur chaque fond clair — un faux positif à chaque
    // palette qui a un texte inversé, c'est-à-dire presque toutes.
    const declaredOn = decl && decl.on[key];
    const against = cls.kind === 'text'
      ? (declaredOn
        // L'étiquette doit être celle du FOND, pas celle du texte : un rapport
        // d'échec qui nomme la mauvaise surface envoie corriger la mauvaise
        // couleur. La mesure était juste ici ; l'attribution ne l'était pas.
        ? declaredOn.map(k => { const ref = tokens.get(k); return ref ? { key: k, hex: ref.hex } : null; }).filter(Boolean)
        : surfaces.filter(x => x.key !== key))
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

  results.rule = 'Texte (1.4.3) : 4,5:1 contre TOUTE surface du document, ou contre les ' +
    'surfaces déclarées par `on:`. Composant non textuel (1.4.11) : 3:1 contre le fond. ' +
    'Surfaces : aucune exigence propre, mais le texte posé dessus est mesuré. Un ratio ' +
    'annoncé qui diffère du mesuré de plus de 0,15 échoue aussi : un ratio inventé donne ' +
    'une assurance que rien ne soutient.';
  results.classification_is_visible = true;
  results.declared_classes = decl && decl.seen ? {
    text: decl.text, surface: decl.surface, nontext: decl.nontext,
    on: decl.on, exempt: Object.keys(decl.exempt),
    source: '<!-- forge:token-classes -->'
  } : null;
  results.classification_source = (decl && decl.seen)
    ? 'déclaration du document'
    : 'noms de tokens en anglais (aucune déclaration) — voir README : un design system ' +
      'en français doit déclarer ses classes';
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
  const results = { command: 'tokens-used', anchor: root, pass: true, screens: [], offenders: [], citations: 0, read_screens: [] };

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
  //
  // ## Les deux formes que la citation prend
  //
  // La première version n'acceptait que `` `--color-xxx` `#ABCDEF` ``, c'est-à-dire
  // le jeton **et** sa valeur séparés par des backticks. Un écran écrit aussi
  // `--color-background #F1EDE5` en prose, sans backticks, et c'est la forme la
  // plus fréquente : les sections « Direction visuelle » et « Accessibilité »
  // nomment les tokens avec leur valeur pour que la mesure soit reproductible.
  //
  // Conséquence mesurée sur Onduleur, neuf écrans écrits : **34 citations retenues
  // sur plusieurs centaines**, et un défaut injecté à la main — un écran citant
  // `--color-background #7A5A0C` au lieu de `#F1EDE5` — est passé **au vert**.
  // Le contrôle avait raison de son périmètre, et son périmètre ne contenait pas
  // ce que les écrans écrivent. Deux fois en un jour, pour la même raison.
  // La troisième forme — `` | `--color-xxx` | `#ABCDEF` | `` — se reconnaît par la
  // **cellule de tableau** qui suit, pas par la seule adjacence : sans elle, un
  // tableau à deux colonnes (`| jeton | valeur |`) et une citation en prose
  // produisent la même chaîne de caractères, et il faut choisir.
  // La forme en cellule doit être **la cellule entière**, pipe à pipe : `| jeton | #ABCDEF |`.
  // Un motif plus lâche (`| `jeton` #ABCDEF` |`) attrapait aussi une cellule de
  // tableau **à une colonne**, où le texte de la cellule est lui-même une citation
  // en prose — et une substitution faite pour couvrir plus de formes a supprimé la
  // moitié des citations au lieu d'en ajouter. Le motif doit dire *quand* il s'agit
  // d'une paire, pas deviner que deux backticks-separated par un pipe en font une.
  const CELL = /^[ \t]*\|[ \t]*`?(--[a-z0-9-]+)`?[ \t]*\|[ \t]*`?(#[0-9a-fA-F]{6})`?[ \t]*\|/gm;
  const CITE = /(--[a-z0-9-]+)`?\s+`(#[0-9a-fA-F]{6})`|(--[a-z0-9-]+)`?\s+(#[0-9a-fA-F]{6})\b/g;

  /** Une citation, une fois : existence et valeur. `s` est l'entrée lue. */
  const inspect = (s, token, hex, src, index) => {
    if (!token.startsWith('--')) return;
    const def = defined.get(token);
    const line = src.slice(0, index).split('\n').length;
    const lineOfScreen = s.key;
    // Le design system est **la référence**, pas une source à vérifier : le compter
    // dans ses citations ferait dire à `citations` le nombre de jetons définis, et
    // ferait passer une vérification vide pour une vérification fournie. Seul un
    // écran produit une citation vérifiable.
    if (s.path !== DESIGN) results.citations += 1;
    results.screens.push(lineOfScreen);
    if (!def) {
      results.offenders.push({ screen: lineOfScreen, token, hex, line, problem: 'token_absent_du_design_system' });
      results.pass = false;
    } else if (def.hex !== hex) {
      results.offenders.push({
        screen: lineOfScreen, token, hex, line,
        problem: 'valeur_differe_de_celle_du_design_system',
        design_system_value: def.hex, design_system_line: def.line
      });
      results.pass = false;
    }
  };

  for (const s of screens) {
    if (!s.path) continue;
    const abs = L.toAbs(root, s.path);
    if (!fs.existsSync(abs)) continue;
    const src = fs.readFileSync(abs, 'utf-8');

    // Les trois écritures sont lues, et **les positions des cellules sont mises de
    // côté** avant les deux autres : une citation en tableau est aussi une citation
    // en adjacence, et sans cette exclusion elle serait comptée deux fois — donc un
    // défaut signalé deux fois, et un compteur qui ne veut plus rien dire.
    const cells = [];
    CELL.lastIndex = 0;
    let cm;
    while ((cm = CELL.exec(src)) !== null) cells.push({ at: cm.index, len: cm[0].length, token: cm[1], hex: cm[2] });
    for (const c of cells) inspect(s, c.token.toLowerCase(), c.hex.toLowerCase(), src, c.at);

    const inCell = i => cells.some(c => i >= c.at && i < c.at + c.len);
    let m;
    CITE.lastIndex = 0;
    while ((m = CITE.exec(src)) !== null) {
      if (inCell(m.index)) continue;
      inspect(s, (m[1] || m[3] || '').toLowerCase(), (m[2] || m[4] || '').toLowerCase(), src, m.index);
    }
  }

  results.read_screens = [...new Set(results.screens)];
  // Non-vacuité : un contrôle qui n'a rien lu ne dit pas « conforme ». Même règle que
  // `component-parity`, pour la même raison — un périmètre vide rend un vert qui
  // n'atteste rien.
  if (!results.citations) {
    results.offenders.push({
      problem: 'aucune_citation',
      why: 'Aucun écran ne cite un token avec sa valeur. Soit les écrans sont vides, soit ils citent ' +
           'les tokens sans leur valeur — dans les deux cas, ce contrôle n\'a rien vérifié.'
    });
    results.pass = false;
  }
  results.rule = 'Un écran qui cite un token que le design system ne définit pas, ou avec une ' +
    'autre valeur, écrit une spécification qui ne correspond à rien. Corriger le token dans le ' +
    'design system ET dans tous les écrans, ou corriger les écrans avant de changer le token.';
  return results;
}

/* ------------------------------------------------------------------ *
 * Parité composant / écran
 * ------------------------------------------------------------------ */

/**
 * Les sections `##`/`###`/`####` du document, avec leur corps.
 *
 * Le nom est le titre **entier**, moins sa clause après un tiret cadratin : un
 * composant français s'écrit `### Tuile produit`, pas `### ProductTile`.
 */
function sectionBodies(md) {
  const out = [];
  const re = /^#{2,4}\s+(.+?)\s*$/gm;
  let m;
  while ((m = re.exec(md)) !== null) {
    const after = md.indexOf('\n', m.index);
    const rest = after < 0 ? '' : md.slice(after + 1);
    const next = rest.search(/^#{2,4}\s+\S/m);
    out.push({
      name: m[1].split(/\s+[—–-]\s+/)[0].trim(),
      line: md.slice(0, m.index).split('\n').length,
      body: next < 0 ? rest : rest.slice(0, next)
    });
  }
  return out;
}

/**
 * Les slots et les états nommés qu'un composant déclare.
 *
 * Deux écritures coexistent dans les design systems réels, et il faut lire les
 * deux : `**États** :` suivi d'un tableau markdown (`IndicatorTile`), et
 * `**États** : \`a\` · \`b\`` sur une seule ligne (`DataTable`, `SignatureBar`…).
 * Ne lire que le tableau revient à déclarer que quatre composants sur six
 * n'ont aucun état — donc à ne rien leur exiger.
 *
 * En prose, on ne retient que le **premier** nom de chaque segment séparé par
 * `·` : les parenthèses explicatives contiennent des backticks qui ne sont pas
 * des états (`error` (message + `Réessayer`)).
 *
 * ## Le séparateur du libellé : `:` ou `—`
 *
 * Le libellé s'écrit `**États** :` dans un design system et `**États** —` dans
 * l'autre ; les deux écritures coexistent, et lire seulement la première donnait
 * zéro état à tout un document — donc **zéro exigence**, et un vert.
 */
function readComponentContract(md, component) {
  const sec = sectionBodies(md).find(s => s.name === component);
  return sec ? contractFromBody(sec.body) : null;
}

function contractFromBody(body) {
  const collect = (label) => {
    // `[ \t]*` et non `\s*` : `\s` franchit le retour à la ligne, donc un `\s*`
    // après le séparateur avaleait la ligne vide et la ligne d'en-tête du
    // tableau — `(.*)` lisait alors `| État | Déclencheur |` comme une prose
    // inline, ne trouvait aucun backtick, et déclarait **zéro** état. C'est
    // exactement le cinquième mécanisme du dossier (`^\s*` qui franchit les
    // lignes), reproduit en corrigeant le sixième.
    const m = body.match(new RegExp(`^\\*\\*${label}\\*\\*[ \\t]*[:—–][ \\t]*(.*)$`, 'm'));
    if (!m) return [];

    // Ce qui suit le libellé décide de la forme : un tableau, ou de la prose.
    // On ne déduit pas la forme de ce qu'il y a **après** le séparateur — un
    // document écrit volontiers `**États** — rendus par X :` suivi d'un tableau,
    // et cette déduction envoyait lire l'en-tête du tableau comme une prose.
    const after = body.slice(m.index + m[0].length).replace(/^[^\n]*\n/, '');
    const lines = after.split('\n');
    const first = (lines.find(l => l.trim()) || '').trim();

    if (!first.startsWith('|')) {
      // Forme prose : le premier nom de chaque segment.
      return m[1].trim().split('·')
        .map(seg => seg.match(/`([^`]+)`/))
        .filter(Boolean)
        .map(hit => ({ name: hit[1].trim() }));
    }

    // Forme tableau. Le reste de la ligne du libellé est vide : le parcourir
    // casserait la boucle de lignes sur la toute première itération, et le
    // composant serait déclaré sans état — donc sans aucune exigence.
    const rows = [];
    for (const line of lines) {
      if (/^\|\s*-{2,}/.test(line)) continue;
      if (!line.trim()) continue;
      if (!line.trim().startsWith('|')) break; // le tableau est fini
      const cell = line.trim().match(/^\|\s*`([^`]+)`\s*\|/);
      if (cell) rows.push({ name: cell[1].trim() });
    }
    return rows;
  };

  return {
    slots: collect('Slots'),
    states: collect('États')
  };
}

/** Les exemptions écrites par un écran : `` `IndicatorTile` — exempt: `x`, `y` `` */
function readExemptions(md, component) {
  const re = new RegExp(
    '`' + component + '`[^\\n]*?exempt\\s*:\\s*([^\\n]+)', 'gi');
  const out = new Set();
  let m;
  while ((m = re.exec(md)) !== null) {
    for (const hit of m[1].matchAll(/`([a-z0-9_]+)`/gi)) out.add(hit[1]);
  }
  return out;
}

/**
 * Deux affirmations qu'un écran fait sur la surface d'un composant.
 *
 * `tokens-used` vérifie que les tokens cités existent. Rien ne vérifiait
 * l'autre moitié du contrat : qu'un écran qui rend un composant.connaisse la
 * **surface** de ce composant.
 *
 * Ce contrôle ne demande donc pas à chaque écran d'énumérer tous les états
 * d'un composant — beaucoup ne s'appliquent nulle part, et une telle exigence
 * produirait des dizaines d'exemptions, donc un contrôle qu'on contourne.
 * Il vérifie deux **affirmations**, qui sont les seules formes que prennent
 * vraiment l'ignorance :
 *
 * 1. **Contradiction** — l'écran énumère la surface du composant (`ses 6 slots :
 *    a, b, c`) et cette énumération ne correspond plus au design system.
 * 2. **Exhaustivité déclarée** — l'écran prétend lister *tous* les états
 *    (« sans exception », « tous ») et n'en cite pas la totalité.
 *
 * Constaté sur un test grandeur nature : `IndicatorTile` passe de 6 à 7 slots
 * et gagne cinq états pour la machine de franchissement. Deux écrans
 * propagent, **trois ne propagent pas** — dont un dont le § 4 s'intitule
 * « États — tous, sans exception ». Le « 6 slots » y est écrit deux fois, et
 * `tokens-used` est au vert : il a raison de l'être, il ne demande pas cette
 * question.
 *
 * Une exemption reste possible, écrite (`exempt:` + raison) : choisir de ne
 * pas rendre un état est une décision, et elle doit s'écrire.
 */
function checkComponentParity(root) {
  const designAbs = L.toAbs(root, DESIGN);
  const results = {
    command: 'component-parity', anchor: root, pass: true,
    components: [], offenders: [], exemptions: []
  };

  if (!fs.existsSync(designAbs)) {
    results.error = 'design_system_absent';
    results.pass = false;
    return results;
  }

  const dsMd = fs.readFileSync(designAbs, 'utf-8');

  // ## Un composant est déclaré par son CONTRAT, pas par la forme de son nom
  //
  // La version précédente cherchait `^### PascalCase$` et ne retenait ensuite que
  // les sections dont le libellé s'écrivait `**États** :`. Sur un design system
  // français — c'est-à-dire **tout** ce que ce skill produit — six composants sur
  // sept s'écrivent `### Tuile produit`, et les libellés s'écrivent `**États** —`.
  // Résultat, mesuré sur Onduleur : **un** composant lu, **zéro** état, **zéro**
  // exigence — et `pass: true`.
  //
  // Un contrôle qui n'a rien vérifié ne doit pas dire « conforme ». C'est la
  // correction de fond : le nom n'est plus une forme, la **présence d'un contrat**
  // est le pointeur déclaré, et l'absence de contrat est dite au lieu de passer.
  const sections = sectionBodies(dsMd);
  const surfaces = new Map();
  const skipped = [];

  for (const sec of sections) {
    const contract = contractFromBody(sec.body);
    const declared = contract
      ? [...contract.slots.map(x => ({ ...x, kind: 'slot' })),
         ...contract.states.map(x => ({ ...x, kind: 'state' }))]
      : [];
    if (!contract || !declared.length) { skipped.push(sec.name); continue; }
    surfaces.set(sec.name, {
      slots: contract.slots.map(x => x.name),
      states: contract.states.map(x => x.name)
    });
    results.components.push({
      component: sec.name, line: sec.line,
      slots: contract.slots.length, states: contract.states.length
    });
  }

  if (!surfaces.size) {
    results.offenders.push({
      problem: 'aucune_surface_declaree',
      read_headings: sections.map(s => s.name),
      why: 'Le design system ne déclare la surface d\'aucun composant (ni `**États**`, ni `**Slots**`). ' +
           'Ce contrôle ne peut alors rien exiger des écrans : il ne rend pas « conforme », il rend « rien vérifié ».'
    });
    results.pass = false;
  }
  results.skipped_headings = skipped;

  const state = L.readState(root) || {};
  const screens = Object.entries(state.screens || {}).map(([k, s]) => ({ key: k, path: s.path }));
  const lineOf = (md, index) => md.slice(0, index).split('\n').length;

  for (const s of screens) {
    if (!s.path) continue;
    const abs = L.toAbs(root, s.path);
    if (!fs.existsSync(abs)) continue;
    const md = fs.readFileSync(abs, 'utf-8');

    for (const item of readExemptions(md, 'IndicatorTile')) void item;

    // Une **énumération** de surface : « ses 6 slots : `a`, `b`, `c` ».
    //
    // On n'attribue pas l'énumération au dernier composant nommé avant elle :
    // une même ligne de tableau cite trois composants, et « Chaque tuile porte
    // ses 6 slots » est preceded de `ExportPanel` alors qu'elle parle de
    // `IndicatorTile`. On attribue donc par **preuve** : le composant dont la
    // surface contient tous les noms cités. C'est robuste, et cela évite
    // d'accuser le mauvais composant.
    const ENUM = /\b(\d+)\s+(slots|états|states)\b[^\n]{0,20}:[^\n]*/gi;
    let em;
    ENUM.lastIndex = 0;
    while ((em = ENUM.exec(md)) !== null) {
      const kind = /^slots$/i.test(em[2]) ? 'slot' : 'state';
      const claimed = [...em[0].matchAll(/`([a-z][a-z0-9_-]*)`/gi)].map(h => h[1]);
      if (claimed.length < 2) continue; // « 6 slots » seul n'est pas une énumération

      const owners = [...surfaces.entries()].filter(([, v]) => {
        const actual = kind === 'slot' ? v.slots : v.states;
        return actual.length && claimed.every(n => actual.includes(n));
      });

      // Attribué à un seul composant : on peut comparer.
      if (owners.length === 1) {
        const [component, v] = owners[0];
        const actual = kind === 'slot' ? v.slots : v.states;
        const said = parseInt(em[1], 10);
        if (said !== actual.length || claimed.length !== actual.length) {
          results.offenders.push({
            screen: s.key, component, kind, problem: 'enumeration_perimee',
            said_count: said, cited_count: claimed.length, actual_count: actual.length,
            actual_surface: actual, cited: claimed, line: lineOf(md, em.index),
            hint: `Le design system déclare ${actual.length} ${kind === 'slot' ? 'slots' : 'états'} ` +
                  `(${actual.join(', ')}). L'écran en cite ${claimed.length} : ` +
                  `manque ${actual.filter(n => !claimed.includes(n)).join(', ') || 'rien'}.`
          });
          results.pass = false;
        }
        continue;
      }

      // Attribué à plusieurs composants : la comparaison n'a pas de sens,
      // on ne signale rien. Attribué à aucun : les noms cités n'appartiennent
      // à aucune surface — mais cela peut être une liste de tokens, pas de
      // surface, alors on exige que le libellé soit vraiment « slots/états ».
      if (owners.length === 0 && claimed.length >= 3) {
        const anySlot = [...surfaces.values()].some(v => claimed.some(n => v.slots.includes(n)));
        const anyState = [...surfaces.values()].some(v => claimed.some(n => v.states.includes(n)));
        if ((kind === 'slot' && !anySlot) || (kind === 'state' && !anyState)) continue;
        results.offenders.push({
          screen: s.key, component: null, kind, problem: 'surface_inconnue_du_design_system',
          cited: claimed, line: lineOf(md, em.index),
          hint: 'Ces noms ne correspondent à la surface d\'aucun composant déclaré.'
        });
        results.pass = false;
      }
    }
  }

  results.rule = 'Un écran qui rend un composant ne doit pas affirmer une surface périmée. ' +
    'Un composant qui gagne un état doit être propagé à tous les écrans qui le rendent — ' +
    'sinon le même composant a deux rendus, et `tokens-used` reste vert parce qu\'il ne demande pas cette question.';
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
    case 'component-parity': result = checkComponentParity(root); break;
    default:
      L.fail({
        error: 'unknown_command', command,
        usage: {
          'design-check.js contrast <anchor>': 'mesure WCAG 1.4.3 et 1.4.11 sur chaque token',
          'design-check.js tokens <anchor>': 'signale les tokens sans valeur concrète',
          'design-check.js tokens-used <anchor>': 'vérifie que chaque écran cite des tokens qui EXISTENT',
          'design-check.js component-parity <anchor>': 'vérifie que chaque écran qui rend un composant énumère ses slots et ses états'
        }
      });
      return;
  }

  L.out(result);
  if (!result.pass) process.exit(1);
}

main();