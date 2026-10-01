# LEARNINGS.md — corrections apprises

Ce que le projet a appris de **ses propres** erreurs. Une entrée dit ce qui a été mal
fait, et **le comportement à tenir la prochaine fois** — pas le contournement, pour
qu'un changement du monde ne rende pas l'entrée fausse sans qu'on s'en aperçoive.

Ce fichier est le **seul magasin de correctifs du projet**. Pas de section
« learnings » dans `SESSION_LOG.md`, pas de fichier de règles qui reçoive des
corrections en douce : deux magasins produisent une mention « pas encore écrits »
périmée dans l'un des deux, et c'est celle-là que l'agent lit en premier.

## Format

**Une ligne par correctif**, dans cet ordre : la date, puis **le contraste**, puis la
destination.

```markdown
- AAAA-MM-JJ — <la faute, formulée comme un contraste : « ne pas X, le comportement correct est Y »>
  → domaine: <fichier de règles visé> | Seen: <où on l'a constaté>
```

Le **contraste** est la forme, et elle n'est pas décorative. « Il y avait un problème
avec les dates » n'apprend rien et devient fausse sans prévenir. « Ne pas comparer une
date à `maintenant` : comparer à l'horloge injectable, sinon le test passe au mauvais
jour » reste vrai quand l'implémentation change.

`domaine:` est l'endroit où ce correctif sera **promu** quand le jeu de règles existera.
Un correctif sans destination ne peut pas être promu, et reste un journal.

`Seen:` est l'endroit où on l'a constaté. Sans lui, une entrée répète la faute trois
fois avant qu'on admette qu'elle est un motif.

## Corrections

<!-- La plus récente en dernier. -->

## Promotion

La promotion est le chemin qui fait passer une correction du journal vers une règle.
Elle n'a lieu qu'après que le jeu de règles existe.

- **Correction → règle.** À la naissance du jeu de règles, chaque entrée de
  `## Corrections` est relue : si elle est encore vraie, elle est tournée en règle dans
  le fichier qui gouverne le domaine nommé, et l'entrée le note en une ligne. Si elle
  ne l'est plus, elle est rayée de `## Corrections` en gardant la trace de pourquoi.
- **Ce que le jeu de règles ne récupère pas.** Une entrée qui ne tient que parce que
  le contournement d'aujourd'hui est commode : elle reste dans `## Corrections` et ne
  devient pas une règle, parce qu'une règle qui encode un accident se cassera sans
  prévenir.
- **Dans l'autre sens, rien ne redescend.** Une règle qui se trompe en production ne
  se corrige pas dans le fichier de règles en douce : elle descend dans
  `## Corrections`, et c'est là qu'elle est reprise. Un correctif qui ne remonte jamais
  ne devient jamais une règle.

## Constats non promus

Un constat sans domaine de promotion va dans `.forge/audit/issues.md`, pas ici. Il
n'est pas encore un correctif : c'est une observation qui n'a pas d'endroit où être
appliquée.