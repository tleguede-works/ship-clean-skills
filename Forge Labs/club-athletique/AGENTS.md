# AGENTS.md — Club Sportif

## De quoi il s'agit

**Club Sportif** — de la réservation de créneaux pour un club omnisports, sur
téléphone d'abord. Deux acteurs partagent un seul produit : un représentant du
club gère les créneaux, et les adhérents réservent eux-mêmes.

L'ampleur, telle que le club la décrit : 400 adhérents, 3 terrains, des créneaux
de 2 h, et une seule personne à la mairie. Ce dernier point n'est pas un détail :
c'est la capacité disponible côté club, et c'est autour d'elle que le produit se
conçoit.

## Où en est le projet

La stack technique n'est pas décidée. Aucun choix n'a été fait, rien n'est
installé, et il n'existe aucune base de code. À ce jour, ce projet n'a produit
que quatre fichiers de contexte : celui-ci et ses trois voisins.

| Fichier | Ce qu'il contient |
|---|---|
| `AGENTS.md` | ce projet, son ampleur, son état — le contexte avant d'agir |
| `SESSION_LOG.md` | ce qui s'est passé, une entrée par session |
| `DECISIONS.md` | les questions encore ouvertes, puis les décisions prises |
| `LEARNINGS.md` | les corrections, et la destination de chacune |

Ces quatre noms sont les noms exacts, et ils sont sensibles à la casse.

## Quand on écrit dans les trois autres fichiers

Le tableau dit ce que contiennent les trois fichiers. Il ne dit pas ce qui fait
qu'on y écrive, et c'est cette seconde moitié qui manque le plus gravement :
trois contenants correctement décrits, et aucune instruction de les remplir,
donnent une mémoire bien nommée, bien structurée, et définitivement vide — ce
qui est pire que pas de mémoire, parce que cela ressemble à du progrès.

Un déclencheur est une condition, pas une catégorie. « Corrections » est une
description ; « la deuxième fois que tu te trompes » est un déclencheur. Chacun
des trois doit se reconnaître seul, à l'instant où il arrive, sans relire le
fichier pour savoir si l'instant est arrivé.

### `SESSION_LOG.md` — quand la session se termine

**On y écrit** ce qui s'est passé, une entrée par session, la plus récente en
dernier, à l'unique endroit que le fichier désigne lui-même.

**Déclencheur :** quand tu ne peux plus avancer sans l'utilisateur — le moment de
ta réponse finale, ou celui où tu rends la main en attendant une réponse du
club. Tu le reconnais parce qu'il ne te reste rien à faire sans eux. Ce moment
arrive aussi pour une session qui n'a produit ni décision ni correction : c'est
celle qu'on oublie le plus, et c'est la seule trace qu'elle aura eue.

### `DECISIONS.md` — quand une voie est écartée, ou quand tu ne peux pas trancher

**On y écrit** ce qui a été choisi et ce qui n'a pas pu l'être : les décisions
prises, et les questions encore ouvertes, à l'unique endroit que le fichier
désigne lui-même.

**Déclencheur, à deux moments :**

- **Tu engages.** Tu tranches entre deux voies et aucune troisième n'est
  explorée : chacune de celles que tu écartes l'est pour une raison. Cet instant
  est une décision, et elle se consigne avec ce qu'elle écarte et pourquoi. Un
  choix qui n'écarte rien n'en est pas un.
- **Tu ne peux pas engager.** Tu t'apprêtes à écrire une consigne et il te
  manque une information. Ce n'est pas une consigne en attente, c'est une
  question ; elle se consigne ouverte, avec le nom de qui peut y répondre. Ne pas
  savoir est l'événement, pas son absence.

### `LEARNINGS.md` — quand tu refais une erreur déjà faite ici

**On y écrit** les corrections, chacune avec sa destination, à l'unique endroit
que le fichier désigne lui-même.

**Déclencheur :** la deuxième fois que, dans ce projet, tu produis le même
mauvais résultat. Le test est la reconnaissance, pas le doute : si tu te dis
« comme la dernière fois », l'instant est arrivé — et il n'était pas arrivé la
première fois. Une observation faite une seule fois n'est pas une correction, et
où elle va à la place est écrit en tête du fichier.

Ces trois moments ne se confondent pas : le premier dépend de l'heure à laquelle
tu t'arrêtes, le second de ce que tu engages ou de ce que tu ne peux pas savoir,
le troisième du fait que tu te trompes pour la deuxième fois. Une session peut
les déclencher tous les trois.

## Ce que ce fichier n'est pas

Ce n'est pas un jeu d'instructions sur le produit. Il n'y a ici aucune convention
à suivre, aucun seuil, aucune commande, aucune version épinglée : rien à
appliquer au code, donc rien à contester. Les déclencheurs ci-dessus ne disent
pas comment travailler — ils disent où laisser ce qui s'est passé. Un agent qui
cherche des conventions à suivre dans ce dépôt ne les trouvera pas, et ce n'est
pas un oubli.

## Pourquoi ce fichier s'arrête ici

Une consigne écrite avant que la stack soit connue est une supposition habillée
en consigne : elle paraît autoritaire, elle est appliquée, et elle devient fausse
au moment précis où elle commence à compter. Les questions que la stack
conditionne sont dans `DECISIONS.md`, en attente de réponse. Elles se résolvent,
et c'est à ce moment-là qu'un fichier d'instructions aura de quoi être rempli.

## Dans six mois

La décision de stack aura été prise, et elle aura sa place dans `DECISIONS.md`,
avec la raison qui l'a produite. Le présent fichier explique pourquoi le produit
existe ; cette entrée expliquera pourquoi il est bâti comme ça. Les deux ne se
remplacent pas.
