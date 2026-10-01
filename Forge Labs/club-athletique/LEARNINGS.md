# LEARNINGS.md — Club Sportif

Ce fichier recueille les corrections : les cas où un agent s'est trompé deux fois
de la même manière dans ce projet. Il est vide pour l'instant, et c'est normal —
il se remplit avec les sessions, pas au démarrage. Il ne contient aucune consigne
de travail, seulement des faits sur ce qui a été corrigé.

Une observation qui n'a encore rien confirmé reste une question dans
`DECISIONS.md`. Elle ne monte ici que confirmée.

**Le seul endroit où ajouter un correctif : la section `## Correctifs`, en bas.**
Une entrée par correction, la plus récente en dernier. Aucun autre endroit dans
ce dépôt n'accueille de correctif : ni le journal des sessions, ni le journal des
questions, ni une note en tête de ce fichier. Un correctif consigné à deux
endroits a une moitié périmée, et c'est celle qu'un agent lira.

## Destination d'un correctif

Chaque entrée porte le champ **`Promote to :`** — le fichier de règles dans
lequel elle sera promue, nommé au moment de l'entrée.

Ce fichier n'existe pas encore. Il sera produit lorsque la stack sera décidée,
et il n'existe aucune raison de deviner son nom aujourd'hui : le nommer à
l'avance serait exactement le genre d'invention que ce projet s'interdit. Une
entrée écrite avant ce moment-là nomme donc le périmètre concerné — « la
réservation », « l'identité des adhérents », « l'accès de l'adhérent », « les
données du club » — et le fichier exact est rempli à la promotion, quand il
existe.

Deux directions, et un seul invariant : un correctif qui reste ici sans
destination n'a jamais été promu, donc le cycle n'est pas bouclé.

- **Correctif → consigne.** Confirmé deux fois, il rejoint le fichier de règles qui
  gouverne son périmètre, à l'endroit exact de la consigne concernée, et l'entrée
  ici passe à `Status: Promu` avec la date.
- **Observation → question.** Une fois seulement, ou sans confirmation, elle reste
  une entrée `Status: Open` dans `DECISIONS.md`, et elle y est notée par un simple
  renvoi depuis une entrée ici.

## Correctifs

* vide pour l'instant — forme d'une entrée, à reproduire ici :*

### <date> — <le correctif, en une ligne>

Ce qui s'était passé : <ce que l'agent a fait deux fois>.
Ce qu'il fallait faire : <le comportement correct, décrit, pas codé>.
Portée : <le périmètre — réservation, identité, accès adhérent, données du club>.
Promote to : <le fichier de règles qui couvrira ce périmètre, une fois la stack
décidée>.
Status : Open
