# Atelier — ce qu'il faut suivre

Ce fichier est l'entrée du jeu de règles. Il ne raconte pas le projet : `AGENTS.md`,
à la racine, le fait, et il est le seul endroit où le projet est raconté. Il ne
recommence pas la stack : `.forge/conventions.md` la détient, et `.forge/architecture.md`
§ 1.1 en donne les versions. **Ne recopie ni une version ni une structure de dossiers
ici, et ne les épingle dans aucun autre fichier** : une version écrite deux fois est
fausse à la première mise à jour de dépendance.

## Commandes

`<anchor>` est le chemin du projet ; `.forge/architecture.md` § 1.2 écrit la structure cible,
`.forge/state.json` écrit la phase. `$FORGE` est le chemin du kit Forge.

| Quand | Commande |
|---|---|
| Début de session | `node "$FORGE/scripts/state.js" start <anchor>` |
| Avant chaque gate | `node "$FORGE/scripts/forge-guard.js" all <anchor>` |
| Avant chaque gate | `node "$FORGE/scripts/consistency-check.js" all <anchor>` |
| Tranche qui touche le schéma | `node "$FORGE/scripts/ddl-exec.js" all <anchor>` |
| Tranche qui est une slice | `node "$FORGE/scripts/coverage-check.js" slice <anchor> <slice>` |
| Dès que `package.json` existe | `npx eslint .` · `npx vitest run` |

**Il n'y a pas d'autre commande.** Le projet n'a pas encore de manifeste : `build`,
`test` et `lint` n'existent pas, et ce fichier ne les invente pas. La dernière ligne
devient applicable — et cesse de l'être en tant que statut — au premier `package.json`.

## Définition de terminé

Une tranche est terminée quand **tout** ce qui suit est vrai :

1. `node "$FORGE/scripts/forge-guard.js" all <anchor>` sort 0.
2. `node "$FORGE/scripts/consistency-check.js" all <anchor>` sort 0.
3. Si la tranche touche le schéma : `node "$FORGE/scripts/ddl-exec.js" all <anchor>` sort 0.
4. Si la tranche est une slice : `node "$FORGE/scripts/coverage-check.js" slice <anchor> <slice>` sort 0.
5. Dès que `package.json` existe : `npx eslint .` et `npx vitest run` sortent 0.
6. Les vérifications propres aux trois règles ci-dessous sont passées. **Des commandes
   au vert ne terminent pas une tranche qui enfreint une règle** : une règle n'est pas
   une préférence, et un test qui passe parce qu'il a vérifié autre chose n'est pas un test.

## Quand bloqué

- Une commande Forge échoue : **arrête et rapporte** la commande, son code de sortie et
  sa sortie. N'édite rien dans `.forge/` pour la faire passer — Forge possède ces fichiers,
  et une retouche faite pour débloquer une commande est un défaut que le gate ne verra plus.
- Une règle de ce jeu et le code se contredisent : **la règle l'emporte**, et la règle est
  révisée par le chemin écrit dans `LEARNINGS.md` § Promotion. Ne corrige jamais une règle
  en douce dans le fichier, et ne contourne pas une règle par un commentaire de désactivation.
- Une valeur manque et personne ne sait d'où elle sort : **demande, ou inscris la question
  dans `DECISIONS.md`**, et n'écris pas le nombre. Un seuil inventé devient une règle que
  l'agent appliquera avec l'autorité d'une règle et la fiabilité d'une supposition.

**Jamais** : `git push --force`, `git reset --hard`, `git clean`, réécrire l'historique,
supprimer un fichier verrou pour faire disparaître une erreur, contourner une commande
en échec, ou corriger un artefact Forge.

## Priorité quand deux règles ne peuvent pas être tenues ensemble

Le conflit réel est toujours le même : **l'envoi est lent, et la paresse est un argument
convaincant.** Les trois règles serrées l'une contre l'autre n'ont qu'un ordre de sacrifice.

1. **`30-empreinte.md` ne cède pas.** C'est la seule garantie juridique du produit
   (`.forge/contract.md` § 3 : une signature tracée à 0 €, pas de qualifiée, donc rien
   d'autre ne prouve quoi que ce soit à un tiers). On ne supprime pas la revérification à
   la réception pour gagner un aller-retour, et on ne réutilise pas une empreinte pour faire
   partir un envoi qui échouerait.
2. **`10-horloge.md` ne cède que par ajout.** Une tranche qui a besoin d'une heure ajoute
   une fonction à `packages/horloge` et attend. Elle ne cède pas par un commentaire de
   désactivation — c'est le seul point de rupture possible, parce que c'est le seul endroit
   où l'interdiction devient invisible, et l'interdiction est ce qui rend les démonstrations
   hors ligne dignes de foi (R-10).
3. **`20-ecriture-locale.md` ne cède que sur l'attente, jamais sur l'ordre.** La file peut
   grossir tant que le réseau ne revient pas, et R-06 la borne par le nombre de devis non
   envoyés, affiché en permanence. Un délai borné est un choix de produit ; un envoi
   réordonné par l'heure, ou une écriture partie au serveur avant d'être écrite ici, n'en
   est pas un.

Ce qui ne se négocie pas dans les trois : l'empreinte part calculée, la file part triée par
rang, et le devis est écrit ici avant d'être sorti.

## Les trois règles

Chaque ligne est chargée à chaque session : le répertoire est lu en entier, il n'y a pas
d'activation conditionnelle. Ouvre le fichier quand la tranche que tu écris touche sa zone.

| Fichier | Ce qu'il gouverne | Zone de code visée |
|---|---|---|
| `10-horloge.md` | Une seule source d'heure, trois durées qui ne se fusionnent pas | tout le dépôt sauf `packages/horloge/` |
| `20-ecriture-locale.md` | Toute écriture passe par le magasin local ; la file est ordonnée par un rang | `apps/web/magasin/`, `apps/web/file/`, `apps/web/sorties/` |
| `30-empreinte.md` | L'empreinte est calculée avant l'envoi, revérifiée à la réception, annulée par une modification | `packages/empreinte/`, `apps/web/file/`, le DDL de `drizzle/` |

**Les chemins de code cités sont des chemins cibles** : `.forge/architecture.md` § 1.2. Le projet
n'a encore aucun fichier de code, donc aucun de ces chemins n'existe. Une règle qui les cite
ne suppose pas qu'ils existent.

## Promotion

- Une correction s'écrit dans `LEARNINGS.md`, et son format y impose de nommer le fichier de
  règles qui la recevra : l'un des trois ci-dessus, selon la zone qu'elle touche.
- **L'appelant de la promotion, c'est toi**, au début d'une session : relis les entrées
  marquées comme à promouvoir et décide, pour chacune, si elle est encore vraie.
- Forge n'a pas de troisième appel déclaré dans
  `skills/forge/references/skill-boundaries.md` — il en a deux, et celui-ci est le second.
  Il n'y a donc aucune promotion automatique à attendre, et une entrée non relue reste un
  journal, ce qu'elle sera sans dommage.

## Statut

Le projet est en phase 5 et n'a aucun code. Ce jeu de règles tient en trois règles, et
c'est délibéré : chacune a **une vérification mécanique déjà décidée par le projet** — une
règle ESLint nommée, une garde SQL exécutée par `ddl-exec`, un test imposé par un ADR. Une
quatrième règle écrite aujourd'hui n'aurait rien à quoi se vérifier, donc elle serait une
préférence. Le jour où le premier fichier de code existe, la sélection des règles de
domaine cesse d'être une question et redevient une détection : c'est le moment de relancer
la sonde, pas d'étoffer ce fichier.
