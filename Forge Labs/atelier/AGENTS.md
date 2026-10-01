# AGENTS.md — Atelier

## Le projet

Atelier sert à faire un devis devant un client, l'envoyer, le faire signer, puis
facturer. La personne qui s'en sert est un artisan menuisier, Jean-Luc, qui
travaille seul dans son atelier et sur les chantiers. Il n'a ni ordinateur portable
ni bureau : il a un téléphone et une tablette, et il passe une bonne partie de la
semaine sur un chantier.

C'est tout le contexte dont l'agent dispose avant d'agir. Il n'y en a pas plus : la
stack n'est pas décidée, il n'existe aucun manifeste, et ce dossier ne contient
donc **aucune règle**. Le jeu de règles arrive plus tard, écrit contre la stack
réellement choisie, et il ne viendra pas ici.

## Qui tient ces quatre fichiers

`AGENTS.md`, `SESSION_LOG.md`, `DECISIONS.md` et `LEARNINGS.md` sont la mémoire du
projet d'une session à l'autre. Une fois créés, **l'agent les tient à jour, lui
seul**. Ni le skill de planification — qui possède `.forge/` — ni l'architecte de
règles n'y écrivent ensuite, et personne n'en garde une seconde copie ailleurs.
Leur valeur se cumule, et c'est précisément ce qui les rend faciles à détruire en
doublon : un qui ajoute, un qui écrase, et la perte ne se voit pas.

## L'index

| Fichier | Ce qu'on y écrit | Le moment où on y écrit |
|---|---|---|
| `SESSION_LOG.md` | Ce qui s'est passé dans une session : ce qui a été fait, ce qui reste ouvert, ce que la session a appris du projet. | À la fin d'une session pendant laquelle quelque chose a changé. |
| `DECISIONS.md` | D'abord les questions que le projet ne peut pas encore trancher, ensuite les choix arrêtés, avec leur date et leur source. | Au moment où tu tranches quelque chose qui aurait pu aller autrement : un choix entre plusieurs options viables, pas la seule façon de faire. |
| `LEARNINGS.md` | Les correctifs : ce qui a été mal fait, pourquoi, et ce qu'il faut faire à la place. | La deuxième fois que tu te trompes sur la même chose. |

`AGENTS.md` n'a pas besoin de déclencheur : il est chargé à chaque session, et c'est
lui qui déclenche les trois autres.

## Les trois fichiers, en détail

### `SESSION_LOG.md`

**Ce que contient `SESSION_LOG.md`.** Une entrée par session pendant laquelle
quelque chose a changé : ce qui a été fait, ce qui reste ouvert, ce que la session
a appris sur le projet — pas sur la stack, qui n'existe pas encore.

**Tu écris dans `SESSION_LOG.md` quand** une session se termine et que quelque chose
a bougé. Une session qui n'a rien changé ne s'y écrit pas : une entrée vide ment sur
le fait qu'un travail a eu lieu.

**Où ça mène.** Vers `DECISIONS.md` si la session a touché une question, vers
`LEARNINGS.md` si elle a produit un correctif. Le journal raconte, il ne décide pas
et ne corrige pas.

### `DECISIONS.md`

**Ce que contient `DECISIONS.md`.** Les questions que le projet ne peut pas encore
trancher, puis les choix arrêtés. Une décision écrite avant de savoir sur quoi elle
porte n'est pas une décision, c'est une supposition habillée — donc la première
chose écrite dans ce fichier est une question, avec `Status: Open`.

**Tu écris dans `DECISIONS.md` quand** tu tranches quelque chose qui aurait pu aller
autrement. Une entrée n'est pas un choix enregistré par confort : c'est le moment où
une alternative crédible disparaît.

**Où ça mène.** Une question close disparaît de la liste des questions ouvertes au
moment où elle est tranchée, et entre alors dans la liste des questions tranchées,
avec sa date et sa source.

### `LEARNINGS.md`

**Ce que contient `LEARNINGS.md`.** Ce que le projet a appris de ses propres erreurs :
ce qui a été mal fait, pourquoi, et le comportement à tenir la prochaine fois — pas le
contournement.

**Tu écris dans `LEARNINGS.md` quand** c'est la deuxième fois que tu te trompes sur la
même chose. Une fois, c'est un hasard ; deux fois, c'est une règle qui manque.

**Où ça mène.** Chaque correction nomme le fichier de règles où elle sera promue le
jour où le jeu de règles existera. Une correction sans destination ne peut pas être
promue et reste un journal.

## Ce que ce dossier n'est pas

Il n'y a pas de stack ici, donc pas de règle à suivre et pas de commande à lancer.
Le jour où la stack est fixée, ce dossier reste tel quel et le jeu de règles est
écrit à part, contre cette stack. Rien n'est promu vers ici : `DECISIONS.md` ne
devient pas un fichier de règles, et `LEARNINGS.md` n'en est pas un.