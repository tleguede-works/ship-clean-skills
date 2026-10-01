# LEARNINGS.md — les correctifs

Ce que le projet a appris de ses propres erreurs. Une entrée dit ce qui a été mal
fait, pourquoi c'est arrivé, et ce qu'il faut faire à la place — **le comportement,
pas le contournement**, pour qu'un changement du monde ne rende pas l'entrée fausse
sans qu'on s'en aperçoive.

Ce fichier est le **seul magasin de correctifs du projet**. Pas de section
« learnings » dans `SESSION_LOG.md`, pas de fichier de règles qui reçoive des
corrections en douce : deux magasins produisent une mention « pas encore
d'écrits » périmée dans l'un des deux, et c'est celle-là que l'agent lit en premier.

## Corrections

Rien pour l'instant.

**C'est ici, et nulle part ailleurs dans ce projet, qu'un correctif est ajouté** : en
bas de cette section, la plus récente en dernier.

## Format d'une entrée

### AAAA-MM-JJ — le correctif, en une phrase

- **Ce qui s'est passé** : l'erreur telle qu'elle a été constatée, pas « il y avait un
  problème ».
- **Pourquoi** : la cause, et non le symptôme.
- **À la place** : le comportement à tenir la prochaine fois, formulé pour que quelqu'un
  qui n'était pas là sache s'il est en train de le respecter.
- **Où ça sera promu** : le fichier de règles qui gouverne cette zone. Il n'existe pas
  encore — le jeu de règles est écrit plus tard, une fois la stack connue. Une entrée
  sans destination ne peut pas être promue, et reste un journal.
- **Confirmé** : la date, et contre quoi on l'a vérifié. Une entrée sans provenance est
  une supposition au ton assuré.

## Promotion

La promotion est le chemin qui fait passer une correction du journal vers une règle.
Elle n'a lieu qu'après que le jeu de règles existe.

- **Correction → règle.** À la naissance du jeu de règles, chaque entrée de
  `## Corrections` est relue : si elle est encore vraie, elle est tournée en règle dans
  le fichier qui gouverne la zone nommée, et l'entrée le note en une ligne. Si elle ne
  l'est plus, elle est rayée de `## Corrections` en gardant la trace de pourquoi.
- **Ce que le jeu de règles ne récupère pas.** Une entrée qui ne tient que parce que
  le contournement d'aujourd'hui est commode : elle reste dans `## Corrections` et ne
  devient pas une règle, parce qu'une règle qui encode un accident se cassera sans
  prévenir.
- **Dans l'autre sens, rien ne redescend.** Une règle qui se trompe en production ne
  se corrige pas dans le fichier de règles en douce : elle descend dans
  `## Corrections`, et c'est là qu'elle est reprise. Un correctif qui ne remonte jamais
  ne devient jamais une règle.

Aucun des deux chemins n'a d'appelant aujourd'hui : rien dans ce dossier ne
réécrit `LEARNINGS.md` après sa création. L'agent qui lit ce fichier est l'appelant,
et c'est sa responsabilité de le dire.