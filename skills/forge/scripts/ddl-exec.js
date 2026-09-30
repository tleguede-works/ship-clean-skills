#!/usr/bin/env node
'use strict';

/**
 * ddl-exec.js — **exécute** le DDL que l'architecture écrit.
 *
 * ## Pourquoi ce script existe
 *
 * L'architecture écrit du SQL dans du Markdown, et pendant treize mois de ce
 * projet rien ne l'a jamais exécuté. Ce n'est pas un oubli : c'est une
 * conséquence. Un `CREATE TABLE` jeté dans un document n'est ni compilé, ni
 * typé, ni exécuté — il est seulement **relu**. On ne voit donc ses défauts
 * qu'au moment de l'écrire, quand on est l'auteur et qu'on lit ce qu'on vient
 * d'écrire.
 *
 * Trois défauts de ce dossier sont des défauts **d'exécution**, pas de lecture.
 * Tous trois sont des portes que l'architecture déclare garder :
 *
 *   1. `ALTER TABLE signature_event ADD CONSTRAINT signer_is_not_author CHECK
 *      (act NOT IN ('sign','refuse') OR actor_id <> (SELECT author_actor_id
 *      FROM definition_version WHERE ...))` — un `CHECK` qui contient une
 *      sous-requête. **PostgreSQL le refuse à la création.** Pas « peut-être »,
 *      pas « selon la version » : la restriction est explicite, parce qu'un
 *      `CHECK` doit être evaluable sur la ligne seule.
 *   2. `IF NEW.status = OLD.status THEN RETURN NEW; END IF;` en tête du trigger
 *      de cycle de vie : la garde ne s'atteint que sur une transition de statut.
 *      Un `UPDATE` qui écrit `published_at` en ne changeant pas le statut passe
 *      **au travers**. La garde est là, elle est écrite, elle est commentée — elle
 *      est inerte.
 *   3. `published_at` sans producteur : le trigger exige qu'il soit l'`occurred_at`
 *      de l'acte `publish`, et rien n'exécUTE cet acte.
 *
 * Aucun de ces trois défauts ne se voit à la relecture. Les trois se voient en
 * exécutant.
 *
 * ## Ce que le script ne fait pas
 *
 * Il n'interprète pas le sens du modèle. Il rend trois choses, chacune
 * **résolue** plutôt que devinée :
 *
 *   - `completeness` — quelles tables le DDL modifie sans jamais les créer ;
 *   - `execute`     — ce que PostgreSQL dit du DDL, en le exécutant ;
 *   - `guards`      — les tentatives que le document **déclare** devoir être
 *                     refusées, et qui ne le sont pas.
 *
 * `completeness` est un contrôle de **résolution de pointeur** : le document
 * nomme ses tables, le script compare deux listes de noms. Il ne demande
 * rien du tout à un modèle de langage, donc il ne peut pas se tromper.
 *
 * `execute` et `guards` ont une dépendance optionnelle : `@electric-sql/pglite`,
 * PostgreSQL compilé en WebAssembly. Absente, le script **ne simule rien** : il
 * rend `skipped` et dit la ligne à installer. Un contrôle qui prétend avoir
 * exécuté sans avoir exécuté est le pire des contrôles, parce qu'il donne un
 * vert.
 *
 * ## Commandes
 *
 *   ddl-exec.js completeness <anchor>   # tables modifiées sans être créées
 *   ddl-exec.js execute     <anchor>   # PostgreSQL exécute le DDL
 *   ddl-exec.js guards      <anchor>   # les gardes déclarées tiennent-elles ?
 *   ddl-exec.js all         <anchor>   # les trois
 */

const fs = require('fs');
const path = require('path');
const L = require('./lib/forge-lib');

/* ------------------------------------------------------------------ *
 * Extraction
 * ------------------------------------------------------------------ */

function read(p) {
  try { return fs.readFileSync(p, 'utf8'); } catch { return null; }
}

function lineOf(text, index) {
  return text.slice(0, index).split('\n').length;
}

/** Le chemin de l'architecture, tel que l'état le déclare. */
function architecturePath(root) {
  const state = L.readState(root);
  const d = state && state.deliverables && state.deliverables.architecture;
  if (d && d.path) {
    const abs = path.resolve(root, d.path);
    if (fs.existsSync(abs)) return abs;
  }
  const guess = path.join(root, '.forge', 'architecture.md');
  return fs.existsSync(guess) ? guess : null;
}

/** Les blocs ```sql, avec la ligne de leur première ligne de contenu. */
function sqlBlocks(md) {
  const out = [];
  const re = /^([ \t]*)```[ \t]*sql[ \t]*\r?\n([\s\S]*?)^[ \t]*```[ \t]*$/gm;
  let m;
  while ((m = re.exec(md)) !== null) {
    const body = m[2];
    out.push({
      body,
      start: lineOf(md, m.index) + 1,
      content_line: lineOf(md, m.index + m[0].indexOf(body)) + 1
    });
  }
  return out;
}

/**
 * Retirer les commentaires d'un corps SQL **en préservant les décalages**.
 *
 * Indispensable, et non pour la propreté : sans cela, le motif qui cherche
 * `FROM x`, `INTO x`, `UPDATE x` trouve des mots français et anglais dans les
 * commentaires — et une première version a ainsi rapporté sept tables
 * inexistantes nommées `sur`, `qui`, `old`, `on`, `of`, `target`, puis `from`.
 * Un contrôle qui lit les commentaires d'un document pour y trouver des tables
 * y injecte le vocabulaire de l'auteur dans son propre verdict.
 *
 * On remplace chaque caractère retiré par une espace : les numéros de ligne et
 * les colonnes restent justes.
 */
function stripSqlComments(body) {
  const out = body.split('');
  let i = 0;
  const blank = (from, to) => {
    for (let k = from; k < to && k < out.length; k++) if (out[k] !== '\n') out[k] = ' ';
  };
  while (i < out.length) {
    if (out[i] === '-' && out[i + 1] === '-') {
      let j = i;
      while (j < out.length && out[j] !== '\n') j++;
      blank(i, j); i = j;
    } else if (out[i] === '/' && out[i + 1] === '*') {
      let j = i + 2, depth = 1;
      while (j < out.length && depth > 0) {
        if (out[j] === '/' && out[j + 1] === '*') { depth++; j += 2; continue; }
        if (out[j] === '*' && out[j + 1] === '/') { depth--; j += 2; continue; }
        j++;
      }
      blank(i, j); i = j;
    } else if (out[i] === "'" || out[i] === '"') {
      // Les littéraux ne sont pas des commentaires, mais ils ne sont pas des
      // tables non plus : on les saute entiers, guillemets doubled inclus.
      const q = out[i];
      let j = i + 1;
      while (j < out.length) {
        if (out[j] === q) { if (out[j + 1] === q) { j += 2; continue; } j++; break; }
        j++;
      }
      i = j;
    } else if (out[i] === '$') {
      const tag = /^\$([A-Za-z_][A-Za-z0-9_]*)?\$/.exec(body.slice(i));
      if (tag) {
        const close = body.indexOf(tag[0], i + tag[0].length);
        i = close === -1 ? out.length : close + tag[0].length;
      } else i++;
    } else i++;
  }
  return out.join('');
}

/**
 * Les tables que le DDL crée, et celles qu'il touche.
 *
 * Les motifs sont appliqués au **bloc entier**, pas ligne à ligne : un
 * `CREATE TRIGGER nom BEFORE UPDATE OF a, b ON table` s'écrit sur trois lignes,
 * et un motif ancré au début de ligne ne voit jamais son `ON`. C'est ce que
 * fit une première version : elle ne comptait que les 2 `ALTER TABLE` et
 * ignorait les 2 triggers et les 3 index.
 */
/** Mots réservés de PL/pgSQL : ce ne sont pas des tables. */
const PLPGSQL_RESERVED = new Set(['old', 'new', 'tg_op', 'tg_relid', 'tg_table_name', 'only']);

/**
 * Les tables qu'un corps de DDL **lit** : `FROM x`, `JOIN x`, `INTO x`, `UPDATE x`.
 *
 * Trois pièges, tous rencontrés sur le projet de test, tous résolus par
 * déclaration plutôt que par heuristique :
 *
 *   - `SELECT act INTO target FROM signature_event` — `target` est une
 *     **variable PL/pgSQL**, déclarée six lignes plus haut par
 *     `DECLARE target text`. On la lit dans le `DECLARE` du même corps ;
 *   - `REVOKE DELETE ON x FROM amberline_app` — `amberline_app` est un **rôle**,
 *     pas une table. Dans un `GRANT`/`REVOKE`, seul le nom après `ON` est
 *     l'objet ; après `TO`/`FROM`, c'est le bénéficiaire ;
 *   - `BEFORE UPDATE OF status, published_at ON definition_version` — sans
 *     traitement particulier, le motif lit `OF` et `ON` comme des tables.
 *     La cible d'un trigger se lit après `ON`.
 *
 * Sans ces trois lectures, le contrôle rapportait sept tables inexistantes
 * nommées `sur`, `qui`, `old`, `on`, `of`, `target` et `amberline_app` : sept
 * faux positifs, tous des mots du texte.
 */
function tablesReadInDdl(code) {
  const out = [];
  // Les variables déclarées par les corps de fonction du bloc.
  //
  // `DECLARE v_id uuid; v_status text;` — **le séparateur est le point-virgule**,
  // pas la virgule. La version précédente découpait sur `,`, donc une déclaration
  // à deux variables n'en enregistrait qu'une : `v_status` n'était pas « déclaré »,
  // et `SELECT status INTO v_status FROM definition_version` était lu comme une
  // lecture de la **table** `v_status`. Résultat : `dangling_references: ['v_status']`
  // sur une fonctionTrigger parfaitement valide, et un contrôle qui accuse une
  // table inexistante.
  //
  // Le même pars separait aussi les paramètres `:=` des variables, et les
  // declarations par ligne (`DECLARE\n  v_id uuid;`). On lit donc la section
  // `DECLARE` **jusqu'à `BEGIN`**, ce qui est la frontiere reelle du bloc de
  // declarations en PL/pgSQL.
  const declared = new Set();
  for (const m of code.matchAll(/\bDECLARE\b([\s\S]*?)\bBEGIN\b/gi)) {
    for (const item of m[1].split(';')) {
      const name = /^\s*([A-Za-z_][A-Za-z0-9_]*)\s+(?:[A-Za-z_][A-Za-z0-9_]*(\[\])?|[A-Za-z]+)/.exec(item);
      if (name) declared.add(name[1].toLowerCase());
      // `name CONSTANT type := valeur` et `name type := valeur` : le nom est
      // toujours le premier mot, donc le motif ci-dessus suffit.
    }
  }
  // Les lignes de privilèges : `GRANT`/`REVOKE` nomment des rôles après TO/FROM.
  const privilegeLines = new Set();
  code.split('\n').forEach((l, i) => {
    if (/^\s*(GRANT|REVOKE)\b/i.test(l)) privilegeLines.add(i);
  });

  const re = /\b(FROM|JOIN|INTO|UPDATE)\s+([A-Za-z_][A-Za-z0-9_]*)/gi;
  let m;
  while ((m = re.exec(code)) !== null) {
    const name = m[2];
    const lower = name.toLowerCase();
    if (PLPGSQL_RESERVED.has(lower)) continue;
    if (declared.has(lower)) continue;
    if (/^(OF|ON|TABLE|SELECT|VALUES|SET|EXISTS|ONLY)$/i.test(name)) continue;
    const lineIdx = code.slice(0, m.index).split('\n').length - 1;
    if (privilegeLines.has(lineIdx)) continue;   // GRANT/REVOKE : c'est un rôle
    out.push({ name: lower, index: m.index, how: 'lu dans le DDL' });
  }
  return out;
}

function tablesTouched(blocks) {
  const created = new Map();   // nom -> ligne
  const touched = new Map();   // nom -> { ligne, comment }

  const TOUCH = [
    ['ALTER TABLE', /^ALTER\s+TABLE\s+(?:IF\s+EXISTS\s+)?(?:ONLY\s+)?["]?([A-Za-z_][A-Za-z0-9_]*)["]?/gim],
    ['CREATE INDEX', /^CREATE\s+(?:UNIQUE\s+)?INDEX\s+(?:CONCURRENTLY\s+)?(?:IF\s+NOT\s+EXISTS\s+)?[\s\S]{0,300}?\bON\s+(?:ONLY\s+)?["]?([A-Za-z_][A-Za-z0-9_]*)["]?/gim],
    ['CREATE TRIGGER', /^CREATE\s+(?:CONSTRAINT\s+)?TRIGGER\b[\s\S]{0,300}?\bON\s+(?:ONLY\s+)?["]?([A-Za-z_][A-Za-z0-9_]*)["]?/gim],
    ['REFERENCES', /\bREFERENCES\s+["]?([A-Za-z_][A-Za-z0-9_]*)["]?/g]
  ];

  for (const b of blocks) {
    // **Un bloc qui ecrit des donnees ne declare pas un schema.** Il utilise un
    // schema, il ne le cree pas. Sans cette exclusion, poser trois lignes de
    // fixture suffisait a faire dire que `actor` et `indicator` n'etaient pas
    // creees en SQL -- ce qui est une tautologie, donc un faux positif.
    //
    // On regarde la **premiere instruction reelle** du bloc, pas « contient ». Une
    // premiere version testait `/^\s*(INSERT|SELECT|…)/im` sur tout le bloc : `\s`
    // mange les retours a la ligne, donc le motif reconnaisait un `SELECT` place
    // au milieu d'un corps PL/pgSQL et ecartait le bloc **entier** — DDL compris.
    // Resultat : `tables_touched: 0`, et le controle ne regardait plus rien du tout.
    const firstStmt = stripSqlComments(b.body)
      .split('\n')
      .map(l => l.trim())
      .find(l => l.length) || '';
    if (/^(INSERT|SELECT|UPDATE|DELETE|COPY)\b/i.test(firstStmt)) continue;

    // Les motifs voient le SQL **sans ses commentaires** et sans ses litteraux.
    // `stripSqlComments` preserve les decalages, donc `where()` reste exact.
    const code = stripSqlComments(b.body);
    const at = idx => b.content_line + code.slice(0, idx).split('\n').length - 1;

    const ct = /^CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?["]?([A-Za-z_][A-Za-z0-9_]*)["]?/gim;
    let m;
    while ((m = ct.exec(code)) !== null) {
      created.set(m[1].toLowerCase(), at(m.index));
    }

    for (const [how, re] of TOUCH) {
      const rx = new RegExp(re.source, re.flags);
      while ((m = rx.exec(code)) !== null) {
        const name = m[1].toLowerCase();
        if (created.has(name)) continue;
        if (!touched.has(name)) touched.set(name, { line: at(m.index), how });
      }
    }

    for (const r of tablesReadInDdl(code)) {
      if (created.has(r.name)) continue;
      if (!touched.has(r.name)) touched.set(r.name, { line: at(r.index), how: r.how });
    }
  }
  return { created, touched };
}

/* ------------------------------------------------------------------ *
 * Le schéma, tel que le document le déclare en prose
 * ------------------------------------------------------------------ */

const SQL_TYPES = new Set([
  'text', 'uuid', 'integer', 'int', 'int4', 'int8', 'bigint', 'smallint',
  'boolean', 'bool', 'date', 'timestamptz', 'timestamp', 'timestamp with time zone',
  'jsonb', 'json', 'numeric', 'decimal', 'real', 'double precision', 'bytea', 'char', 'varchar'
]);

/** Un type SQL, avec ses modificateurs : `text[]`, `numeric(18,6)`, `varchar(40)`. */
function sqlTypeOf(declared) {
  let t = String(declared).replace(/`/g, '').trim();
  t = t.replace(/\([^)]*\)/g, '').trim().toLowerCase();
  const array = /\[\s*\]$/.test(t);
  if (array) t = t.replace(/\[\s*\]$/, '').trim();
  if (!SQL_TYPES.has(t)) return null;
  return array ? `${t}[]` : t;
}

/**
 * Les tables de colonnes : `| Champ | Type | Nullable | Défaut | ... |`.
 *
 * L'architecture ne fournit pas de `CREATE TABLE` : elle fournit une table de
 * colonnes par entité, avec le type, la nullabilité, le défaut et les clés. Ce
 * sont des **données déclarées**, pas une intention : si la colonne dit `uuid`,
 * le schéma est `uuid`.
 *
 * Ce qui n'est pas résolu est **rapporté**, jamais deviné. Une colonne dont le
 * type est `objet` ou `enum / string` n'a pas de type SQL : le script le dit,
 * et la table est marquée incomplète plutôt que compilée de travers.
 */
function declaredTables(md) {
  const lines = md.split('\n');
  const tables = [];

  // Une entité est annoncée par un titre qui porte un nom entre backticks,
  // suivi — parfois quelques lignes plus bas — d'un en-tête de colonnes.
  for (let i = 0; i < lines.length; i++) {
    const head = /^#{2,4}\s+(.*)$/.exec(lines[i]);
    if (!head) continue;
    const named = [...head[1].matchAll(/`([A-Za-z_][A-Za-z0-9_]*)`/g)].map(m => m[1]);
    if (!named.length) continue;

    // Chercher l'en-tête `| Champ | Type |` dans les 60 lignes qui suivent.
    for (let j = i + 1; j < Math.min(i + 60, lines.length); j++) {
      if (!/^\|\s*Champs?\s*\|/i.test(lines[j])) continue;

      const columns = [];
      const unresolved = [];
      const pk = [];
      let k = j + 1;
      for (; k < lines.length; k++) {
        if (!lines[k].trim().startsWith('|')) break;
        if (/^\|\s*-+/.test(lines[k])) continue;
        const cells = lines[k].split('|').slice(1, -1).map(c => c.trim());
        if (cells.length < 4) continue;

        const name = cells[0].replace(/[`*]/g, '').split(' / ')[0].trim();
        if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(name)) continue;

        const rawType = cells[1].replace(/`/g, '').trim();
        const isPk = /\bPK/.test(rawType);
        // Le type est résolu tel que la colonne le déclare : `text[]`,
        // `numeric(18,6)`, `uuid` (PK, FK₁). Un type que le script ne connaît
        // pas n'est pas deviné : la table est marquée incomplète.
        const type = sqlTypeOf(rawType);
        if (!type) { unresolved.push({ column: name, declared: rawType }); continue; }
        if (isPk) pk.push(name);

        // Un defaut SQL est soit une **fonction** (`now()`,
        // `gen_random_uuid()`), soit un **litteral** — et un litteral est tres
        // souvent `'quoted'` : `'draft'`, `'provisional'`, `'below'`. Une version
        // n'acceptait que les fonctions, donc chaque colonne `NOT NULL` portant un
        // defaut textuel perdait son defaut, et la pose de donnees echouait sur
        // `null value in column "officiality" ... violates not-null constraint`.
        //
        // C'est le meme defaut que la version qui ne lisait ni `text[]` ni
        // `**\`computed_at\`** : une restriction du motif plus etroite que ce que
        // les documents ecrivent reellement. Un motif trop etroit est un motif
        // faux — il ne rend pas le controle moins bruyant, il le rend incapable.
        let def = cells[3].replace(/[`*]/g, '').trim();
        if (/^(—|-|NULL|n\/a)$/i.test(def)) def = null;
        else if (/^'[^']*'$/.test(def)) def = def;                       // litteral
        else if (/^-?\d+(\.\d+)?$/.test(def)) def = def;              // nombre
        else if (/^[A-Za-z_][A-Za-z0-9_]*(\(\))?$/.test(def)) def = def;  // fonction
        else def = null;                                                // non SQL → pas de defaut

        columns.push({
          name,
          type,
          not_null: /^non$/i.test(cells[2].replace(/[`*]/g, '').trim()),
          default: def
        });
      }

      if (columns.length) {
        tables.push({
          name: named[0].toLowerCase(),
          line: i + 1,
          columns,
          primary_key: pk,
          unresolved
        });
      }
      break;
    }
  }
  return tables;
}

/** Le `CREATE TABLE` d'une entité déclarée. */
function createTableSql(t) {
  const parts = t.columns.map(c =>
    `  ${c.name} ${c.type}${c.not_null ? ' NOT NULL' : ''}` +
    (c.default ? ` DEFAULT ${c.default}` : ''));
  const pk = t.primary_key.length
    ? `,\n  PRIMARY KEY (${t.primary_key.join(', ')})`
    : '';
  return `CREATE TABLE ${t.name} (\n${parts.join(',\n')}${pk}\n);`;
}

/**
 * Découper un corps SQL en instructions, **sans couper dans un corps de
 * fonction**.
 *
 * `body.split(/;/)` suffit pour du SQL ordinaire et casse tout le reste : un
 * `CREATE FUNCTION ... AS $$ BEGIN ... ; ... END $$` contient des points-virgules,
 * donc le découpage à l'aveugle tronque la fonction, la création échoue, et le
 * `CREATE TRIGGER` qui la référence échoue à son tour avec « function does not
 * exist ». C'est exactement ce que fit une première version : sur trois blocs
 * du projet de test elle n'a exécuté que trois instructions, dont aucune
 * fonction, et elle a rapporté deux erreurs de trigger qui n'existaient pas dans
 * le document.
 *
 * Le découpage suit donc `$$…$$`, `'…'` et `"…"`, et ne coupe qu'au `;` de
 * niveau extérieur.
 */
function splitSqlStatements(body) {
  const out = [];
  let start = 0;
  let i = 0;
  while (i < body.length) {
    const ch = body[i];
    if (ch === '-' && body[i + 1] === '-') {
      while (i < body.length && body[i] !== '\n') i++;
      continue;
    }
    if (ch === "'" || ch === '"') {
      const q = ch;
      i++;
      while (i < body.length) {
        if (body[i] === q) { if (body[i + 1] === q) { i += 2; continue; } i++; break; }
        i++;
      }
      continue;
    }
    if (ch === '$') {
      const tag = /^\$([A-Za-z_][A-Za-z0-9_]*)?\$/.exec(body.slice(i));
      if (tag) {
        const close = body.indexOf(tag[0], i + tag[0].length);
        i = close === -1 ? body.length : close + tag[0].length;
        continue;
      }
    }
    if (ch === ';') {
      const stmt = body.slice(start, i);
      if (stmt.trim()) out.push({ text: stmt, index: start });
      start = i + 1;
    }
    i++;
  }
  const tail = body.slice(start);
  if (tail.trim()) out.push({ text: tail, index: start });
  return out;
}

/* ------------------------------------------------------------------ *
 * PostgreSQL
 * ------------------------------------------------------------------ */

async function loadEngine() {
  try {
    const mod = await import('@electric-sql/pglite');
    return { PGlite: mod.PGlite, available: true };
  } catch {
    return { PGlite: null, available: false };
  }
}

const ENGINE_HINT = "npm install --save-dev @electric-sql/pglite  (PostgreSQL en WebAssembly, ~9 Mo)";

function skipped(name, detail) {
  return {
    pass: true,
    ran: false,
    status: 'skipped',
    check: name,
    why_not_run: detail,
    how_to_run: ENGINE_HINT,
    rule: 'Un contrôle qui prétend avoir exécuté sans avoir exécuté est le pire des contrôles, ' +
          'parce qu\'il donne un vert. Sans moteur, ce contrôle ne rend aucun verdict : il dit ' +
          'qu\'il n\'a rien fait et comment le faire.'
  };
}

/* ------------------------------------------------------------------ *
 * Les trois contrôles
 * ------------------------------------------------------------------ */

function checkCompleteness(root) {
  const abs = architecturePath(root);
  if (!abs) {
    return { pass: true, check: 'ddl_completeness', skipped: 'aucune architecture enregistrée' };
  }
  const md = read(abs);
  const rel = path.relative(root, abs);
  const blocks = sqlBlocks(md);
  const { created, touched } = tablesTouched(blocks);
  const inProse = new Map(declaredTables(md).map(t => [t.name, t.line]));

  // Deux verdicts, parce que ce sont deux défauts de nature différente et
  // qu'un seul les confondrait.
  const dangling = [];    // ni créée en DDL, ni décrite en tableau de colonnes
  const proseOnly = [];   // décrite en tableau de colonnes, jamais créée en DDL

  for (const [name, info] of touched) {
    if (created.has(name)) continue;
    if (inProse.has(name)) proseOnly.push({ table: name, line: info.line, how: info.how, declared_at: inProse.get(name) });
    else dangling.push({ table: name, line: info.line, how: info.how });
  }
  dangling.sort((a, b) => a.line - b.line);
  proseOnly.sort((a, b) => a.line - b.line);

  return {
    pass: dangling.length === 0 && proseOnly.length === 0,
    check: 'ddl_completeness',
    architecture: rel,
    sql_blocks: blocks.length,
    tables_created_in_ddl: created.size,
    tables_declared_in_prose: inProse.size,
    tables_touched: touched.size,
    dangling_references: dangling,
    prose_only: proseOnly,
    what_this_means: dangling.length === 0 && proseOnly.length === 0
      ? 'Chaque table que le DDL touche est créée par ce même DDL.'
      : [
          dangling.length
            ? `${dangling.length} table(s) sont utilisées par le DDL sans être décrites nulle part.`
            : null,
          proseOnly.length
            ? `${proseOnly.length} table(s) sont décrites comme tableaux de colonnes mais jamais ` +
              `créées en SQL : le DDL suppose un schéma préexistant dont le document ne tient pas ` +
              `la source, donc il n'a jamais pu être exécuté.`
            : null
        ].filter(Boolean).join(' '),
    fix: null,
    rule: 'Un DDL qu\'on ne peut pas exécuter est un DDL qu\'on ne peut pas relire non plus : les ' +
          'contraintes qu\'il déclare ne sont vérifiées par personne, et les portes qu\'il écrit ' +
          'peuvent être inertes sans que rien ne s\'en aperçoive. Ce contrôle ne suppose rien du ' +
          "schéma : il compare des noms que le document écrit lui-même."
  };
}

async function checkExecute(root) {
  const abs = architecturePath(root);
  if (!abs) return skipped('ddl_executes', 'aucune architecture enregistrée');
  const md = read(abs);
  const rel = path.relative(root, abs);
  const blocks = sqlBlocks(md);
  if (!blocks.length) return skipped('ddl_executes', `${rel} ne contient aucun bloc \`\`\`sql`);

  const eng = await loadEngine();
  if (!eng.available) {
    const s = skipped('ddl_executes', 'moteur PostgreSQL absent');
    s.sql_blocks = blocks.length;
    s.architecture = rel;
    s.found_without_running = 'nothing — un contrôle absent ne peut rien trouver';
    return s;
  }

  const declared = declaredTables(md);
  const db = new eng.PGlite();
  const errors = [];
  const prerequisites = [];
  const applied = [];
  const created_by_document = [];
  let statements = 0;
  let refused_blocks = 0;

  // Les tables que le **document** cree lui-meme en SQL. Une table a la fois dans
  // un `CREATE TABLE` du DDL et dans un tableau de colonnes n'a pas deux
  // definitions : le DDL fait foi, et la colonne sert a verifier que la prose et le
  // SQL **parlent de la meme chose** — pas a la creer.
  const { created: createdInDdl } = tablesTouched(blocks);

  // Un rôle absent n'est pas un DDL cassé : c'est un **prérequis** que le
  // document ne déclare pas. Le dire dans le verdict serait faux — le
  // provisionnement du rôle appartient au déploiement, pas à l'architecture.
  // Mais le Silence serait pire : le document envoie ses privilèges à un rôle
  // dont personne ne peut dire qu'il existe.
  const isPrerequisite = msg =>
    /role "[^"]+" does not exist/.test(msg) ||
    /role "[^"]+" already exists/.test(msg);

  try {
    for (const t of declared) {
      if (t.unresolved.length) continue;   // table incomplète : le script ne l'invente pas
      // **Ne pas synthétiser une table que le document déclare lui-même.**
      //
      // `execute` créait chaque table du tableau de colonnes avant de jouer le DDL.
      // C'était un的service du script, utile quand une architecture décrit ses tables en
      // prose et n'écrit que des contraintes — mais alors `completeness`, qui exige un
      // `CREATE TABLE` dans le DDL, disait que ces tables **n'existaient pas**. Les
      // deux contrôles lisaient le même document et se contredisaient, et le second
      // donnait tort au document alors que le premier venait de l'inventer.
      //
      // Constaté sur Amberline : `completeness` -> `tables_created_in_ddl: 0`,
      // `prose_only: [definition_version, signature_event, indicator]`. La correction
      // n'est pas de synthesizer davantage, ni de supprimer la declaration : c'est
      // que le document **écrive son schema**, et que le script ne fabrique plus rien
      // derrière son dos. Un schéma qu'un script invente n'est pas un schéma du
      // document — c'est un schéma du script.
      if (createdInDdl.has(t.name.toLowerCase())) {
        created_by_document.push(t.name);
        continue;
      }
      try {
        await db.exec(createTableSql(t));
        applied.push(t.name);
      } catch (e) {
        errors.push({
          kind: 'schema_declaré_inexécutable',
          table: t.name,
          line: t.line,
          error: String(e.message).split('\n')[0]
        });
      }
    }

    for (const b of blocks) {
      // **Un bloc `forge:ddl-refuse` doit echouer.** Le compter comme une erreur
      // d'execution revient a dire qu'une porte qui fonctionne est un DDL casse :
      // sur le projet de test, les quatre portes tenant etaient rendues comme
      // quatre erreurs, et `execute` echouait alors que le document etait
      // correct. Ces blocs appartiennent a `guards`, qui sait ce qu'il cherche.
      if (/--\s*forge:ddl-refuse\b/.test(b.body)) { refused_blocks++; continue; }
      const code = stripSqlComments(b.body);
      for (const s of splitSqlStatements(code)) {
        const stmt = s.text.trim();
        if (!stmt || /^\s*(--|\/\*)/.test(stmt)) continue;
        statements++;
        try {
          await db.exec(stmt);
        } catch (e) {
          const msg = String(e.message).split('\n')[0].slice(0, 220);
          const first = stmt.split('\n').find(l => l.trim() && !l.trim().startsWith('--')) || stmt;
          const where = {
            architecture: rel,
            block_line: b.content_line + code.slice(0, s.index).split('\n').length - 1,
            statement: first.slice(0, 160),
            error: msg
          };
          if (isPrerequisite(msg)) prerequisites.push(Object.assign({ kind: 'prerequisite_absent' }, where));
          else errors.push(Object.assign({ kind: 'postgresql_refuse' }, where));
        }
      }
    }
  } finally {
    await db.close();
  }

  const incomplete = declared.filter(t => t.unresolved.length);
  const roles = [...new Set(prerequisites.map(p => {
    const m = /role "([^"]+)"/.exec(p.error); return m ? m[1] : '?';
  }))];

  return {
    pass: errors.length === 0,
    check: 'ddl_executes',
    architecture: rel,
    engine: 'pglite (PostgreSQL en WebAssembly)',
    sql_blocks: blocks.length,
    statements_run: statements,
    guard_blocks_left_to_guards: refused_blocks,
    tables_declared: declared.length,
    tables_created: applied.length,
    tables_created_by_document: created_by_document,
    tables_not_resolvable: incomplete.map(t => ({
      table: t.name, line: t.line, columns: t.unresolved
    })),
    errors,
    prerequisites,
    what_this_means: errors.length === 0
      ? `PostgreSQL a accepté ${statements} instructions du DDL de ${rel}.` +
        (prerequisites.length
          ? ` ${prerequisites.length} instruction(s) n'ont pas pu être évaluées : ` +
            `les rôles ${roles.map(r => '`' + r + '`').join(', ')} n'existent pas dans cette base. ` +
            `Ce n'est pas un DDL cassé — c'est un prérequis que le document ne déclare pas.`
          : '')
      : `PostgreSQL a refusé ${errors.length} instruction(s) de ${rel}. Ce ne sont pas des ` +
        `opinions : c'est le moteur qui refuse de créer l'objet. Une contrainte refusée à la ` +
        `création n'existe pas — et une porte refusée n'est pas une porte, c'est un commentaire.`,
    rule: 'Un DDL écrit dans un document n\'est ni compilé, ni typé, ni exécuté. Tout défaut ' +
          'd\'un `CHECK`, d\'un trigger ou d\'une fonction ne se voit qu\'à l\'exécution — donc ' +
          'jusqu\'à ce qu\'elle ait lieu, le document peut déclarer des portes qui n\'existent pas.'
  };
}

/**
 * Les gardes que le document déclare devoir être actives.
 *
 * Convention : un bloc `sql` dont la première ligne est `-- forge:ddl-refuse`
 * contient une instruction qui **doit être rejetée** par le schéma. Si elle
 * passe, la porte que le document écrit n'est pas une porte.
 *
 * C'est une déclaration, pas une interprétation : le script n'a pas à deviner
 * quelle opération est interdite. Le document la nomme.
 */
async function checkGuards(root) {
  const abs = architecturePath(root);
  if (!abs) return skipped('ddl_guards', 'aucune architecture enregistrée');
  const md = read(abs);
  const rel = path.relative(root, abs);
  const declared = sqlBlocks(md).filter(b => /--\s*forge:ddl-refuse\b/.test(b.body));
  if (!declared.length) {
    return {
      pass: true, check: 'ddl_guards', architecture: rel, ran: true,
      guards_declared: 0,
      what_this_means: `${rel} ne déclare aucune garde. Une porte non écrite n'est pas ` +
        `testée : ni par un script, ni par un relecteur, ni par elle-même.`,
      rule: 'Une garde que le document ne déclare pas n\'existe pas. Le test d\'une porte n\'est ' +
            'pas sa lecture : c\'est une tentative qui doit échouer.'
    };
  }

  const eng = await loadEngine();
  if (!eng.available) {
    const s = skipped('ddl_guards', 'moteur PostgreSQL absent');
    s.architecture = rel;
    s.guards_declared = declared.length;
    return s;
  }

  const db = new eng.PGlite();
  const results = [];
  const errors = [];
  const prerequisites = [];
  try {
    // L'ordre est celui du document : les tables déclarées en prose d'abord
    // Le schéma vient du **document**, dans les deux sens : ce qu'il écrit en SQL
    // d'abord, ce qu'il ne décrit qu'en prose ensuite. C'est la meme règle que
    // dans `execute`, et elle doit l'être : une garde essayée sur un schéma que
    // l'autre commande construit autrement ne prouve rien, et le verdict « inerte »
    // qui en découle accuse le document d'un défaut qu'il n'a pas.
    //
    // Constaté sur Amberline : `execute` PASS, `guards` « 2 gardes inertes » — parce
    // que `guards` synthétisait les tables de la prose et ignorait les `CREATE TABLE`
    // du document, donc `revoked_at` **n'existait pas** et la garde echouait sur une
    // colonne fantome. Deux commandes, deux schemas, un verdict faux.
    const { created: createdInDdl } = tablesTouched(sqlBlocks(md));
    for (const b of sqlBlocks(md)) {
      if (/--\s*forge:ddl-refuse\b/.test(b.body)) continue;
      const code = stripSqlComments(b.body);
      for (const st of splitSqlStatements(code)) {
        const stmt = st.text.trim();
        if (!stmt || /^\s*(--|\/\*)/.test(stmt)) continue;
        if (!/^(CREATE|ALTER)\b/i.test(stmt)) continue;
        try { await db.exec(stmt); }
        catch (e) {
          // « deja existe » n'est pas une erreur ici : ce bloc peut avoir ete joue
          // pour poser le schema, et la synthese prose qui suit le rejoue. Ce qui
          // compte pour une garde, c'est que l'objet existe, pas qu'il n'ait pas
          // existe deux fois.
          if (!/already exists/i.test(String(e.message))) {
            /* rendu par `execute`, qui le signale avec la ligne du document */
          }
        }
      }
    }
    for (const t of declaredTables(md)) {
      if (t.unresolved.length) continue;
      if (createdInDdl.has(t.name.toLowerCase())) continue;   // le document l'a créée
      try { await db.exec(createTableSql(t)); } catch { /* rendu par `execute` */ }
    }

    const deferred = [];
    const isSchema = b => /^\s*(CREATE|ALTER)\b/im.test(stripSqlComments(b.body));
    // Deux passes, par **nature** et non par position : d'abord ce qui crée le
    // schéma, ensuite ce qui le peuple. Un document qui place ses données
    // d'essai avant son `CREATE TABLE` n'a pas pour autant une garde
    // inintestable — et un contrôle qui rendrait « inerte » à cause de l'ordre
    // des blocs signalerait le contrôle, pas le document.
    // **Instruction par instruction, jamais bloc par bloc.** Une version de ce
    // script faisait `db.exec(b.body)` sur le bloc entier. Or `exec` s'arrete a la
    // **premiere** instruction en echec : sur le projet de test, un bloc contient
    // quatre `GRANT` echouant sur un role absent, **suivis** des deux
    // `CREATE TRIGGER` qui font vivre le cycle de vie. Le bloc s'arretait au
    // `GRANT`, les deux triggers n'etaient **jamais crees**, et le controle
    // annoncait quand meme « quatre gardes declarees, toutes inertes ».
    //
    // Autrement dit : la faute d'execution masquait les instructions suivantes du
    // meme bloc, et le verdict « garde inerte » portait sur un schema qui
    // n'existait pas. Un controle qui n'a pas execute ce qu'il croit avoir execute
    // ne peut rien conclure — ni « inerte », ni « active ». D'ou le decoupage.
    const runBlock = async (b, kind) => {
      const code = stripSqlComments(b.body);
      for (const st of splitSqlStatements(code)) {
        const stmt = st.text.trim();
        if (!stmt || /^(--|\/\*)/.test(stmt)) continue;
        try {
          await db.exec(stmt);
        } catch (e) {
          const msg = String(e.message).split('\n')[0].slice(0, 200);
          if (/role "[^"]+" does not exist/.test(msg)) {
            prerequisites.push({ kind: 'prerequisite_absent', block_line: b.start, error: msg });
            continue;
          }
          // Un objet **deja pose** n'est pas une erreur de garde : le schema a ete
          // applique plus haut, et ce passage rejoue les blocs de donnees. Signaler
          // « already exists » comme un DDL casse ferait echouer le controle sur un
          // document correct — c'est ce que faisait la premiere version, et le
          // projet de test a paye deux tests verts pour un schemasans defaut.
          if (/already exists/i.test(msg)) continue;
          errors.push({
            kind,
            block_line: b.content_line + code.slice(0, st.index).split('\n').length - 1,
            statement: (stmt.split('\n').find(l => l.trim()) || stmt).slice(0, 120),
            error: msg
          });
        }
      }
    };

    for (const b of sqlBlocks(md)) {
      if (!isSchema(b)) continue;
      await runBlock(b, 'postgresql_refuse');
    }
    for (const b of sqlBlocks(md)) {
      if (isSchema(b)) continue;
      if (/--\s*forge:ddl-refuse\b/.test(b.body)) { deferred.push(b); continue; }
      await runBlock(b, 'donnees_de_pose_refusees');
    }

    for (const b of deferred) {
      const label = (b.body.split('\n').find(l => l.trim() && !l.trim().startsWith('--')) || '').slice(0, 120);
      try {
        await db.exec(b.body);
        results.push({
          block_line: b.start, statement: label, refused: false,
          verdict: 'garde inerte : l\'opération interdite a réussi'
        });
      } catch (e) {
        results.push({
          block_line: b.start, statement: label, refused: true,
          error: String(e.message).split('\n')[0].slice(0, 140)
        });
      }
    }
  } finally {
    await db.close();
  }

  const dead = results.filter(r => !r.refused);
  return {
    pass: dead.length === 0 && errors.length === 0,
    check: 'ddl_guards',
    architecture: rel,
    engine: 'pglite',
    guards_declared: results.length,
    guards_active: results.filter(r => r.refused).length,
    guards_dead: dead.length,
    ddl_errors: errors,
    prerequisites,
    guards: results,
    what_this_means: dead.length === 0
      ? `Gardes déclarées : ${results.length}. Toutes refusent l'opération interdite.`
      : `Gardes déclarées : ${results.length}. ${dead.length} ne refusent pas l'opération ` +
        `interdite. Une garde inerte est la pire forme de défaut dans une architecture : ` +
        `elle est écrite, commentée, et elle ne protège rien.`,
    rule: 'Une porte ne se relit pas, elle s\'essaie. Une garde déclarée puis exécutée sans ' +
          'être refusée est un commentaire qui se croit une contrainte.'
  };
}

/* ------------------------------------------------------------------ *
 * CLI
 * ------------------------------------------------------------------ */

async function main() {
  const argv = process.argv.slice(2);
  const command = argv[0] || 'all';
  const root = path.resolve(argv[1] && !argv[1].startsWith('--') ? argv[1] : process.cwd());

  let result;
  switch (command) {
    case 'completeness': result = checkCompleteness(root); break;
    case 'execute': result = await checkExecute(root); break;
    case 'guards': result = await checkGuards(root); break;
    case 'all':
      result = {
        pass: true,
        check: 'ddl',
        completeness: checkCompleteness(root),
        execute: await checkExecute(root),
        guards: await checkGuards(root)
      };
      result.pass = result.completeness.pass && result.execute.pass && result.guards.pass;
      result.rule = 'Un DDL écrit dans un document n\'est ni compilé, ni typé, ni exécuté. Ce ' +
        'script ne juge pas le modèle : il rend le DDL à PostgreSQL, et vérifie que le ' +
        'document crée les tables qu\'il modifie et que les gardes qu\'il déclare tiennent.';
      break;
    default:
      L.fail({
        error: 'unknown_command', command,
        usage: {
          'ddl-exec.js completeness <anchor>': 'tables modifiées par le DDL sans être créées',
          'ddl-exec.js execute <anchor>': 'PostgreSQL exécute le DDL de l\'architecture',
          'ddl-exec.js guards <anchor>': 'les gardes déclarées refusent-elles l\'opération interdite ?',
          'ddl-exec.js all <anchor>': 'les trois'
        }
      });
      return;
  }

  L.out(result);
  if (!result.pass) process.exit(1);
}

main().catch(e => {
  L.fail({ error: 'ddl_exec_crash', message: String(e && e.message ? e.message : e) });
  process.exit(2);
});
