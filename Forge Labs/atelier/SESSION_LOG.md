# SESSION_LOG.md — ce qui s'est passé, session par session

La mémoire de ce qui a été fait, pour qu'une session qui démarre sache où la
précédente s'est arrêtée sans avoir à relire tout le projet.

Ce fichier raconte. Il ne décide pas et ne corrige pas : quand une session produit
une décision, elle va dans `DECISIONS.md` ; quand elle produit un correctif, il va
dans `LEARNINGS.md`. Une entrée de journal qui raconte une décision en détail crée
la même information à deux endroits, et les deux copies divergent.

## Journal

Rien pour l'instant.

**C'est ici, et nulle part ailleurs dans ce projet, qu'une entrée de session est
ajoutée** : en bas de cette section, une par session, dans l'ordre chronologique, la
plus ancienne en premier.

## Format d'une entrée

### AAAA-MM-JJ — ce que cette session a fait

- **Fait** : ce qui a changé, en une ou deux phrases, pas la liste des fichiers
  touchés.
- **Resté ouvert** : ce qui n'a pas été résolu, en une ligne par point.
- **Appris sur le projet** : ce que cette session a compris du métier ou du besoin,
  pas du code.
- **Renvoie à** : la question de `DECISIONS.md` touchée, si elle a été tranchée ; le
  correctif de `LEARNINGS.md`, s'il y en a eu un.

Une session qui n'a rien changé ne s'écrit pas ici. Une entrée vide ferait croire à
un travail qui a eu lieu.