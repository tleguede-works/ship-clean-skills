# AGENTS.md — <Nom du projet>

## Le projet

Trois ou quatre phrases : qui est le client, ce qu'il fait, et ce que le produit doit
permettre. **Pas** de choix technique — la stack se résout depuis le manifeste et vit
dans le document de conventions du projet, et la répéter ici en fait un deuxième
propriétaire qui devient faux à la première mise à jour de dépendance.

Ce que la personne sait faire, et ce qu'elle ne sait pas. Une contrainte du client
énoncée sans ces deux moitiés devient une exigence impossible à juger.

## L'état réel du projet

Où en est le travail, **à la date du jour**. Une section d'état qui ne change pas est
pire qu'absente : elle affirme un état faux, et l'agent construit dessus.

Une ligne par phase, avec son statut réel et ce qui manque. Les cases vides sont
signalées comme des cases vides, pas laissées en silence.

## Propriété

Ces quatre fichiers sont **la mémoire de l'agent**, et l'agent les tient : ni ce skill,
ni un autre, n'y écrit après la création. Un seul propriétaire par fait.

{{#if forge-present}}
Ce projet utilise Forge, qui possède `.forge/` ; ce jeu de règles n'y écrit rien. Sa
frontière : `skills/forge/references/skill-boundaries.md`.
{{else}}
Ce projet n'utilise pas de skill de planification. Ces quatre fichiers sont sa seule
mémoire d'entre-sessions, et rien d'autre ne les remplace.
{{/if}}

## Index

| Fichier | Ce qu'on y écrit | Déclencheur |
|---|---|---|
| `SESSION_LOG.md` | où la session en est, ce qu'elle a décidé, ce qu'elle a écarté | **À l'ouverture de la session** — tu crées l'entrée **avant** d'écrire la première ligne de code, jamais à la fin. Puis un point de contrôle à chaque moment de `SESSION_LOG.md` § Points de contrôle |
| `DECISIONS.md` | les décisions **fermées** et les questions ouvertes, avec le déclencheur qui les ferme | **Tu tranches quelque chose qu'une session future rediscusserait** — donc dès que tu décides, pas quand la décision te revient. Aussi en supersédant une entrée |
| `LEARNINGS.md` | les correctifs, un par ligne, chacun avec sa destination de promotion | **Tu te trompes une deuxième fois sur la même chose**, ou tu découvres un contournement qui n'est pas un comportement |

## Les déclencheurs, et pourquoi ceux-là

Les trois déclencheurs sont des **conditions** — un moment que l'agent reconnaît
seul. Une catégorie (« Corrections ») est une description ; une condition
(« la deuxième fois que tu te trompes ») est un déclencheur. Seul le second
remplit un fichier.

**Le déclencheur du journal est en tête de liste parce qu'il ne peut pas attendre
la fin.** Un modèle avec un million de tokens de contexte tient jusqu'au bout et
écrit une entrée complète en fin de session. Un modèle plus petit est compacté
avant d'y arriver, et ce qui disparaît en premier n'est pas le résultat — il est
dans le diff — c'est **le refus** : ce que tu as écarté, et pourquoi. Un refus
perdu est une décision re-prise dans six mois, avec un argument différent.

Donc : **l'entrée s'ouvre au départ**, et l'agent y dépose un point de contrôle à
chaque moment observable — changement de phase, début de slice, fin de slice,
avant un commit, et **dès qu'un résumé de contexte vient d'arriver**. Ce dernier
est le plus important : c'est le dernier moment avant le suivant.

Les cinq moments sont listés dans `SESSION_LOG.md` § Points de contrôle. Ils
n'utilisent **pas d'horloge** : un modèle ne sait pas quelle heure il est, et une
horloge non déclenchée est un déclencheur silencieux.

`AGENTS.md` n'a pas de déclencheur : il est chargé à chaque session, et c'est lui
qui déclenche les trois.

### Les trois fichiers, en détail

Un paragraphe par fichier. Le tableau dit quoi ; ceci dit **pourquoi ce découpage**, et
ce qui se passe si on le casse.

**`SESSION_LOG.md`** tient le récit : ce qui s'est passé et dans quel ordre, y compris
les hésitations. Son champ le plus cher est `REJECTED` — ce qui a été écarté et
pourquoi. C'est le seul endroit qui empêche une session future de reproposer la même
chose.

**`DECISIONS.md`** tient les décisions **fermées**. Une décision y est close : ni
reproposée, ni retournée silencieusement. Le fichier est append-only, donc une décision
fausse est **supersédée** par une nouvelle qui la nomme, jamais réécrite. Les questions
que le projet ne peut pas encore répondre y sont aussi, chacune avec le déclencheur qui
la fermera.

**`LEARNINGS.md`** tient les correctifs, un par ligne, le comportement, la faute étant
écrit comme un contraste (« ne pas X, le comportement correct est Y ») parce qu'une
description d'incident devient fausse quand le code change. Chaque entrée nomme sa
destination de promotion.

## À lire avant d'agir

L'ordre, et ce que chaque lecture évite. Cet index est la seule chose qui rend les trois
fichiers utilisables : sans lui, ils existent et personne n'y écrit.