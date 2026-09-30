# Migration `state.json` v1 → v2

> **Cette procédure n'est pas exécutée automatiquement.** Elle s'applique à un projet dont `state.json` a accumulé de la prose, ou qui a été produit par une version antérieure du skill.
>
> L'ordre compte : **extraire d'abord, migrer ensuite.** Migrer d'abord produit un `state.json` v2 qui contient 200 Ko de prose — c'est-à-dire exactement le défaut qu'on veut corriger, en mieux formaté.

---

## Pourquoi c'est un vrai chantier

Le symptôme n'est pas « le fichier est gros ». C'est qu'**il n'est plus un fichier d'état** : il est devenu le document que le skill n'a pas fourni.

Sur un projet réel, `state.json` avait 36 clés, dont `legal_findings`, `accounting_findings`, `proration_research`, `known_defects_in_reference`, `adopted_from_reference_rev3`, `rules_fixed_2026_09_26` — et 248 000 caractères de prose. Le skill n'offrait nulle part où mettre un constat, une décision, une recherche. Alors tout est allé là, et le fichier est devenu **non triable, non indexable, et faux sans signal**.

Le test de reconnaissance est simple : **y a-t-il une valeur de plus de 2 000 caractères dans `state.json` ?** Si oui, ce n'est plus un fichier d'état.

---

## Étape 0 — Diagnostic

```bash
node "$FORGE/scripts/forge-guard.js" state <anchor>
```

Sortie attendue : une liste de `forbidden_key` et de `content_in_state`. Sans diagnostic, on migre à l'aveugle.

Inventaire des blocs à extraiter, par taille :

```bash
node -e "
const s=require('<anchor>/.forge/state.json');
const rows=[];
(function w(o,p){if(typeof o==='string'){rows.push([p,o.length]);return}
 if(o&&typeof o==='object')for(const[k,v]of Object.entries(o))w(v,p+'.'+k)})(s,'');
rows.sort((a,b)=>b[1]-a[1]);
for(const[p,l]of rows.slice(0,40))console.log(String(l).padStart(7),p);
"
```

---

## Étape 1 — Table de routage

Chaque clé va dans **un** endroit. La colonne « ne pas faire » est la moitié la plus importante du tableau.

| Motif de clé | Destination | Ne pas faire |
|---|---|---|
| `*_findings`, `findings`, `*_issues` | `DECISIONS.md` si c'est un choix · `LEARNINGS.md` si c'est une erreur répétée · `.forge/audit/issues.md` si c'est un incident | Ne pas garder un tableau de constats dans `state.json` avec un `--severity` maison : c'est le doublon d'un store qui existe |
| `*_research*`, `*_standard*`, `*_analysis`, `*_survey` | `.forge/benchmarks.md` | Ne pas préfixer par `rev2`, `rev3` : c'est un problème de versionnage, pas de méthode |
| `*_decisions*`, `*_adr*` | `DECISIONS.md` (format ADR) | Ne pas écrire une décision et sa raison dans un commentaire de plan |
| `*_learnings*`, `*_corrections*`, `*_lessons*` | `LEARNINGS.md` | Ne pas inventer un troisième store d'apprentissages |
| `*_session*`, `*_log*`, `*_journal*`, `*_togo*` | `SESSION_LOG.md` | Ne pas le garder dans l'état : un journal n'est pas un état |
| `*_questions*` | `DECISIONS.md` une fois tranchée, sinon `state.json → open_questions_resolved` avec l'ID de l'ADR | Ne pas laisser une question marquée « ouverte » alors qu'une décision la tranche : elle fera échouer une slice sur un sujet clos |
| `*_process*`, `*_meta*` | la règle du fichier concerné, via `state.js finding --domain=` | Ne pas ajouter une ligne de plus à un fichier que l'agent ne lira pas |
| `*_user_stories*`, `*_personas*` | `.forge/prd.md` | Ne pas dupliquer le PRD dans l'état |
| `*_corrections*` de slices (`slices.*.note`) | `.forge/plans/<slice>.md` | Ne pas laisser un plan de 2 000 caractères dans l'état : il sera perdu, et il est la source de vérité |
| `modules.*` (rang, fréquence) | `state.json → modules` **avec** le rang et la justification | Ne pas omettre la justification : un ordre sans raison n'est pas un ordre |
| Clé inconnue | **À trancher explicitement.** Aucune clé ne survit par défaut. | Ne pas migrer « au cas où » |

> **La règle qui évite 90% des erreurs** : une clé qui ne trouve pas de destination est un **signal**, pas un detail. Elle signale que le skill manque d'un endroit où mettre ce fait. La créer dans le skill est le vrai correctif.

---

## Étape 2 — Extraire

Créer les fichiers de destination et y déplacer le contenu, **en conservant les identifiants**.

- Les IDs stables (`B12`, `E3`, `F-042`, `ADR-0007`) sont la seule chose qui doit survivre intacte. Ne jamais les renommer pendant une migration : ils sont cités dans des plans, des tests et des écrans.
- Pour chaque constat extrait vers une règle : il lui faut un **domaine**. Cf. `references/skill-boundaries.md`.

```bash
# Un constat qui devient une règle
node "$FORGE/scripts/state.js" finding <anchor> --domain=testing.md --severity=majeur \
  "<le fait>" "<la correction, en une phrase, sans l'archéologie>"
```

---

## Étape 3 — Migrer la structure

```bash
node "$FORGE/scripts/state.js" migrate <anchor>
```

`migrate` fait le strict nécessaire :

- `documents` → `deliverables` (renommé : un `document` est un fichier, pas une entrée d'état)
- ajoute les clés canoniques manquantes
- `version` → 2, renseigne `forge_skill_version`
- **déplace** `.forge/design-system.md` → `.forge/design/design-system.md` (le layout canonique a changé)
- recalcule les `content_hash`

Si le projet est en v1, **toute autre commande refuse de tourner** et dit de lancer `migrate`. C'est délibéré : une migration silencieuse peut perdre de l'information.

---

## Étape 4 — Épurer

`migrate` produit un `state.json` v2 structurellement valide. Il reste à le **vider de la prose** qui a été copiée à l'étape 2.

```bash
node "$FORGE/scripts/forge-guard.js" state <anchor>
```

Tant qu'il signale `content_in_state` ou `forbidden_key`, l'extraction n'est pas terminée.

Ce qui doit rester dans `state.json` :

- des **statuts** (`approved`, `in_progress`, `validated`)
- des **chemins**
- des **identifiants** (`rule_ids`, `edge_case_ids`)
- des **empreintes** (`content_hash`)
- des **index** (`index.nav` — un ordre avec sa justification, pas du texte libre)
- des **constats non promus** (`findings[]` — et seulement ceux-là, avec leur domaine)

Tout le reste est un document.

---

## Étape 5 — Reprendre

```bash
node "$FORGE/scripts/state.js" start <anchor>
node "$FORGE/scripts/forge-guard.js" all <anchor>
node "$FORGE/scripts/consistency-check.js" all <anchor>
```

`state.js start` est la commande qui compte : elle assemble l'état réel, y compris les slices **déclarées faites sans cas de test** et les constats **non promus**. C'est ce que le suivi précédent ne pouvait pas faire.

Si `start` signale des slices suspectes, ce n'est pas une régression de la migration : c'est un défaut préexistant que la migration rend visible pour la première fois.

---

## Pièges

| Piège | Pourquoi il coûte cher |
|---|---|
| Migrer avant d'extraire | On obtient un v2 qui contient 200 Ko de prose : le défaut, mieux formaté |
| Renommer les IDs pendant la migration | Les plans, tests et écrans citent ces IDs. Ils deviennent des orphelins sans que rien ne le signale |
| Supprimer une clé « non comprise » | Elle contenait peut-être le seul exemplaire d'une décision. Le vide est silencieux |
| Conserver `*_rev3` | Un fichier qui se renomme à chaque révision n'est pas versionné, il est réécrit. L'historique est perdu |
| Faire confiance à `migrate` pour l'épuration | `migrate` migre la **structure**. La prose reste. C'est `forge-guard state` qui la juge |
| Ne pas vérifier les statuts après | Un projet qui disait `done` sur 19 slices avec un vocabulaire hors schéma signalera des statuts invalides. C'est vrai, et c'est bon : c'est le premier signe fiable |

---

## Vérification finale

- [ ] `forge-guard.js state` ne signale plus aucun `content_in_state` ni `forbidden_key`
- [ ] Aucune valeur de `state.json` ne dépasse 2 000 caractères
- [ ] Aucun ID stable n'a été renommé
- [ ] Chaque constat extrait a reçu un domaine
- [ ] `state.js start` ne signale aucune slice suspecte — ou les suspects sont traitées
- [ ] `consistency-check.js all` ne signale aucun écart
- [ ] Les documents de destination existent et sont lisibles
