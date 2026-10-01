# DECISIONS.md — <Nom du projet>

## Règle

Ce projet couvre plusieurs sessions avec un contexte qui repart de zéro. Sans ce
fichier respecté, une IA sans mémoire va périodiquement reproposer des alternatives
déjà écartées — perdant ce qu'on construit et en refaisant le débat.

**Ce fichier est un registre de décisions FERMÉES.** Une décision consignée ici est
close : elle ne doit être ni reproposée, ni retournée silencieusement, même si elle
paraît sous-optimale pour la tâche en cours.

Si une décision fermée est **actuellement fausse** : le dire explicitement, nommer la
décision et l'endroit où elle est consignée, expliquer en quoi elle ne tient plus ici,
et **s'arrêter pour demander** avant de procéder autrement. Ne pas simplement
construire l'alternative.

Ce fichier est **append-only**. Ne jamais supprimer ni réécrire une entrée : si une
décision change, on **ajoute une entrée qui la supersède** et on renvoie à l'ancienne
par `Statut: Supersédé par ADR-<NNN>`.

Une décision appartient ici quand elle devrait sinon être **re-discutée à chaque
session**. Si elle devait être répétée ou redébatée dans chaque slice qui la touche,
c'est ici qu'elle appartient.

## Format d'une entrée

Six champs, dans cet ordre. Les six sont obligatoires : une entrée sans `Statut:` ne
peut pas être supersédée, donc ne peut pas être corrigée.

```markdown
## ADR-<NNN>: <Titre>

- **Date** : <AAAA-MM-JJ>
- **Statut** : Actif | Supersédé par ADR-<NNN>
- **Contexte** : <ce qui a déclenché la décision>
- **Décision** : <ce qui est décidé>
- **Alternatives considérées** : <quoi d'autre, et pourquoi ce n'est pas ça>
- **Conséquences** : <à quoi cela engage les phases suivantes>
```

**`Alternatives considérées` est le champ qu'on saute, et c'est celui qui rend une
décision réutilisable.** Une décision sans alternative rejetée oblige la prochaine
session à refaire l'évaluation entière pour découvrir qu'elle existe déjà.

Les questions que le projet **ne peut pas encore** répondre restent des questions, et
chaque question porte **le déclencheur qui la fermera** — la condition que l'agent
reconnaîtra seul, à l'instant où elle arrive. Une question sans déclencheur ne se ferme
jamais, et devient une ligne morte.

## Questions ouvertes

### Q-<NNN> — <la question, formulée comme une question>

- **Ce qui n'est pas connu** : <ce qui manque, précisément>
- **Ce que la réponse détermine** : <ce qui sera différent selon la réponse>
- **Se ferme quand** : <le déclencheur — une condition, pas une catégorie>
- **Statut** : Open

## Questions tranchées

Une question fermée quitte cette section **et devient une ADR**, qui porte la décision,
la date, et l'alternative écartée. La relier par son numéro pour que l'historique reste
lisible : la question n'a pas disparu, elle a été répondue.

## Journal des décisions

<!-- ADR-001, ADR-002… la plus ancienne en premier. -->