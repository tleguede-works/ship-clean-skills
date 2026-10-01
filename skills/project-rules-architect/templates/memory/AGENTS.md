# AGENTS.md — <Nom du projet>

## Le projet

Trois ou quatre phrases : qui est le client, ce qu'il fait, et ce que le produit doit
permettre. **Pas** de choix technique — la stack a sa place dans `.forge/conventions.md`
et `.forge/architecture.md`, et la répéter ici en fait un deuxième propriétaire qui
devient faux à la première mise à jour de dépendance.

Ce que la personne sait faire, et ce qu'elle ne sait pas. Une contrainte du client
énoncée sans ces deux moitiés devient une exigence impossible à juger.

## L'état réel du projet

Où en est le travail, **à la date du jour**. Une section d'état qui ne change pas est
pire qu'absente : elle affirme un état faux, et l'agent construit dessus.

Une ligne par phase, avec son statut réel et ce qui manque. Les cases vides sont
signalées comme des cases vides, pas laissées en silence.

## Propriété

Ces quatre fichiers sont **la mémoire de l'agent**. Le skill de planification possède
`.forge/` et n'y écrit rien ; ce skill écrit le jeu de règles et ne touche pas à ces
quatre fichiers. Un seul propriétaire par fait — voir
`skills/forge/references/skill-boundaries.md`.

## Index

| Fichier | Ce qu'on y écrit | Déclencheur |
|---|---|---|
| `SESSION_LOG.md` | ce qui s'est passé, une entrée par session, 8 champs nommés | **Tu ouvres une session** : tu écris l'entrée **avant** de terminer, jamais pendant |
| `DECISIONS.md` | les décisions **fermées** (ADR) et les questions ouvertes, avec le déclencheur qui les ferme | **Tu tranches quelque chose qu'une session future=rediscuterait**, ou une question ouverte atteint sa condition de fermeture |
| `LEARNINGS.md` | les correctifs, chacun avec sa destination de promotion | **Tu te trompes une deuxième fois sur la même chose**, ou tu découvres un contournement qui n'est pas un comportement |

Les trois déclencheurs sont distincts, et chacun est une **condition** — un moment que
l'agent reconnaît seul. Une catégorie (« Corrections ») est une description ; une
condition (« la deuxième fois que tu te trompes ») est un déclencheur.

`AGENTS.md` n'a pas de déclencheur : il est chargé, c'est lui qui déclenche les trois.

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