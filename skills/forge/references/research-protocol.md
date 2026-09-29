# Protocole de recherche — ne pas réinventer

## Le principe

> *There is nothing new under the sun.*

Un produit nouveau est presque toujours une recomposition de problèmes déjà résolus. Quelqu'un a déjà dealt avec la clôture d'un bail, la FIFO d'une avance, le mois qui n'a pas de longueur fixe. Refaire cette réflexion de zéro coûte des semaines et aboutit à une réponse moins bonne que celle qui existe déjà.

**Mais l'inverse est aussi vrai, et c'est le piège.** Un projet réel a passé 5 produits à l'étude puis 57 défauts catalogués dans la référence qu'il avait trouvée, et le résultat a été : une recherche écrite en prose dans le fichier d'état, jamais consolidée, et une référence lue comme du **code à copier** plutôt que comme une **source d'invariants**. Les 11 occurrences d'un fait dupliqué sans réconciliation viennent toutes de là.

La recherche doit produire des **invariants**, pas du code.

---

## Ce qu'on extrait, et ce qu'on n'extrait pas

| ✅ À extraire | ❌ À ne pas extraire |
|---|---|
| L'**invariant** : quelle propriété ne peut jamais être fausse | Le code qui l'implémente |
| Le **piège** associé et sa raison | Le contournement (il devient faux au premier changement de version) |
| L'**ordre** des opérations et pourquoi cet ordre | Les noms, l'arborescence, les conventions |
| La **donnée de domaine** que le métier impose | La pile technique |
| Ce que les utilisateurs **attendent** | L'UI exacte |

**Test de l'invariant.** Si l'affirmation reste vraie après avoir changé de langage, de base de données et d'interface, c'est un invariant. Sinon, c'est une observation sur un implémentation, et elle ne se transpose pas.

---

## Les six questions

Pour chaque problème métier identifié dans le PRD, chercher les réponses existantes à :

1. **Qui résout déjà ce problème ?** Nommer au moins deux produits de référence, avec leur URL. En Kenntnis, s'il n'en existe aucun, c'est un signal — le dire explicitement, ne pas laisser la case vide.
2. **Quel est l'invariant que ce produit garantit ?** Exprimé indépendamment de son implémentation.
3. **Quel est le piège que ce produit a payé ?** Un piège coûte plus cher qu'un invariant : il est invisible et il se reproduit.
4. **Quelle donnée de domaine est sichr, et que nos utilisateurs DONC une exigence forte ?
5. **Qu'est-ce que nous faisons différemment, et pourquoi ?** — l'écart assumé, avec sa raison et son coût de réversibilité.
6. **Ce produit a-t-il un défaut connu ?** → c'est une **liste d'avertissements**, pas une liste de tâches.

---

## Discipline de la liste d'avertissements

C'est la discipline la plus importante, et celle qu'un projet réel a le plus mal appliquée : 57 défauts de référence n'étaient pas 57 tâches.

**Un défaut d'une référence est un avertissement, pas un travail.**

- Il indique une **classe** de piège, pas une tâche.
- Le nombre n'est pas la mesure. « 57 défauts » ne veut rien dire. « Cette classe de piège est sous-estimée par 4× dans notre découpage » veut dire quelque chose.
- La question à poser n'est jamais « ce défaut existe-t-il chez nous ? » — elle est quasi toujours oui. La question est : « notre conception fait-elle mieux que ça, **et l'avons-nous vérifié ? » »

### Forme attendue d'un avertissement

```
CLASSE : <nom de la famille de piège, pas le symptôme>
TROUVÉ : <où, dans quel produit>
POURQUOI C'EST UN PIÈGE : <la raison>
NOTRE TRAITEMENT : <l'invariant que nous posons à la place>
VÉRIFIÉ PAR : <le test, le scénario, ou la porte mécanique — sinon ce n'est pas traité>
```

Une entrée sans ligne `VÉRIFIÉ PAR` est un souhait, pas un traitement.

---

## Sortie attendue

Un seul livrable : **`.forge/benchmarks.md`**, depuis `templates/benchmarks.md.tmpl`.

Il contient l'archétype, la boucle de travail, les produits de référence, la grille de conformité, les standards retenus, les écarts assumés — et **l'inventaire des pathologies récurrentes** de l'archétype, venues de `references/archetypes.md`.

`references/archetypes.md` est la mémoire **générique** : elle accumule les pathologies de tous les projets. `benchmarks.md` est l'application **de ce projet**. Un projet qui découvre une nouvelle pathologie doit la remonter dans `archetypes.md` — c'est le seul mécanisme par lequel la recherche des uns sert aux autres.

---

## Quand

| Moment | Ce qu'on fait |
|---|---|
| **Phase 1**, après l'interview | Une passe large : quel archétype, quels produits de référence, quelle boucle de travail. Pas d'étude détaillée. |
| **Phase 3**, avant les écrans | Les invariants et les pièges de l'UX, pas la logique métier |
| **Phase 4**, avant l'architecture | Les invariants de domaine, les données imposées, les standards de l'archétype |
| **Phase 6** | Le plan de tests : quels scénarios couvrent la boucle de travail |

Le même `benchmarks.md` se complète, il ne se réécrit pas. Les suffixes `rev2`/`rev3` dans un suivi désignent un problème de versionnage, pas de méthode.

---

## Anti-objectifs

| ❌ | Pourquoi |
|---|---|
| Copier l'architecture d'un produit de référence | On copie ses contraintes, pas ses hypothèses. Ses choix d'historique ne sont pas les nôtres. |
| Lister 20 produits | Au-delà de 3-4, personne n'a lu. Citer moins, et lire vraiment. |
| Écrire la recherche dans `state.json` | Un fichier d'état n'est pas un document. Cf. `references/skill-boundaries.md`. |
| Transformer les défauts de la référence en backlog | Un défaut hérité n'est pas un défaut inherited. |
| Appeler ça « recherche » sans modifier une décision | Si aucune décision ne change, la recherche n'a rien produit. |
| Faire la recherche après le PRD figé | Le PRD est le moment où les bonnes questions sont encore ouvertes. |

---

## Contrôle de sortie

Avant de passer au gate :

- [ ] Au moins deux produits de référence nommés et **réellement consultés** — ou l'absence explicitement justifiée.
- [ ] Chaque invariant est formulé **indépendamment de toute implémentation**.
- [ ] Chaque écart est motivé et son coût de réversibilité est indiqué.
- [ ] Chaque avertissement a une ligne `VÉRIFIÉ PAR`.
- [ ] Aucun défaut de référence n'a été converti en tâche sansInvariantPosé.
- [ ] **Au moins une décision a changé** grâce à la recherche — sinon elle n'a rien produit.
- [ ] Les nouvelles pathologies sont remontées dans `references/archetypes.md`.
- [ ] `benchmarks.md` est un livrable enregistré, pas de la prose dans `state.json`.
