# Fast Track — validation automatique des plans

## Les deux niveaux d'autonomie

Fast Track a deux réglages indépendants. Le premier — *que valide-t-on automatiquement* — est fixe. Le second — *jusqu'où on va sans vous* — **est choisi à chaque activation**.

| Réglage | Valeurs | Défaut | Qui décide |
|---|---|---|---|
| **Portée** | Phases 4-5 (plans) · Phases 4-7 (plans + implémentation) | plans | l'utilisateur, à l'activation |
| **Autonomie** | `milestone` · `full` | **`milestone`** | l'utilisateur, à l'activation |

### `milestone` — autonomie par jalon (défaut)

L'implémentation avance slice par slice, sans interruption. Vous n'intervenez qu'à la **fin de chaque jalon de 3 à 5 slices**, avec un rapport.

**Pourquoi c'est le défaut.** Sur un projet réel, l'autonomie totale a été utilisée, et le résultat a été 20 constats jamais corrigés, 14 slices approuvées sans aucun test, et 18 corrections comptées comme faites parce qu'elles étaient écrites dans un plan à venir. Rien de tout cela n'était visible à l'instant où ça s'est produit — le suivi disait faux **sans aucun signal**.

Le mode `milestone` ne vous coûte qu'une interruptions par 3-5 slices. Ce qu'il achète : un moment où le rapport est encore vrai.

### `full` — autonomie totale

Aucune interruption jusqu'à la fin. Vous récupérez l'application.

Disponible parce que c'est votre décision. Mais le rapport de fin distingue alors explicitement **ce qui a été vérifié mécaniquement** de **ce qui ne l'a pas été** — et cette liste n'est pas la même que dans le mode `milestone`.

> Un `BLOCK` arrête les deux modes. Le niveau d'autonomie ne change pas les garde-fous ; il change seulement le nombre de points de contrôle humains.

Enregistré dans `state.json → run.autonomy`, donc une invocation interrompue reprend au bon endroit.

---

## Conditions d'entrée

Le mode ne s'active que si **tout** est vrai :

| Condition | Vérification |
|---|---|
| `prd` est `approved` | `state.json → deliverables.prd.status` |
| `conventions` est `approved` | idem |
| `design_system` est `approved` | idem |
| **Tous** les écrans sont `approved` | `state.json → screens.*` |
| `benchmarks` est `approved` | standards de référence disponibles |
| Aucun livrable égaré | `forge-guard.js paths` et `strays` passent |
| Aucun constat sans domaine | `consistency-check.js findings` |
| **Pour `phases4-7`** : la stratégie de test existe | `test_plan` non `not_started`, et un scénario de cycle complet pour un domaine à échéances |

Vérification d'un coup :

```bash
node "$FORGE/scripts/forge-guard.js" fast-track <anchor> \
     [--scope plans|phases4-7] [--autonomy milestone|full]
```

Cette commande **est** la porte. Elle sort en code non nul et nomme chaque condition non
remplie, avec son motif : `conventions est draft, pas approved`, `9/9 en attente :
accueil (draft), …`.

> Elle n'est pas dans `forge-guard all`, et c'est délibéré : `benchmarks` est un livrable
> de phase 3 et `test_plan` de phase 6, donc les mettre dans `all` ferait échouer tout
> projet ordinaire à la phase 4. Un contrôle qu'il faut demander est un contrôle
> qu'on peut oublier — d'où la règle : **quand on le demande, il échoue et dit
> pourquoi**, et `state.js status` affiche si le mode est actif.

Enregistrer la position du mode est une autre commande, et elle **n'active rien** :

```bash
node "$FORGE/scripts/state.js" fast-track <anchor> --enable \
     [--scope …] [--autonomy …] [--artifact <chemin>] [--attempt <slice>] [--checkpoint]
node "$FORGE/scripts/state.js" fast-track <anchor> --disable [--reason <texte>]
```

`--attempt` **s'arrête à 2** et refuse la troisième : au-delà, ce n'est pas un plan
qu'on corrige. `--disable` n'exige **pas** de raison — le mode doit pouvoir être
interrompu sans justification, et une commande qui exige une raison pour sortir mais
pas pour entrer n'est pas un mode qu'on peut quitter.

**Ce que la porte vérifie, et ce qu'elle ne vérifie pas.** Elle vérifie l'**état** — les
statuts, la propreté du dossier, le domaine des constats — et, en `phases4-7`, que le
`test_plan` **déclare** un scénario de cycle complet. Elle ne vérifie ni la justesse
d'un plan, ni qu'un scénario de cycle complet couvre la bonne propriété. C'est la limite
générale du mode, écrite plus bas ; la commande la rappelle dans sa sortie plutôt que de
la cacher derrière un `pass: true`.

---

## Périmètre

| Réglage | Couvre | Ne couvre pas |
|---|---|---|
| `plans` | Phase 4 — Architecture · Phase 5 — Plans | Phase 7 — Implémentation · Phase 8 |
| `phases4-7` | + Phase 7 — Implémentation, avec vérification mécanique par slice | Phase 8 — Validation finale |

**Un seul checkpoint humain** à la sortie de la Phase 5. En portée `phases4-7`, un checkpoint **par jalon** pendant la Phase 7.

### Le checkpoint est le contrat signé — et il ne peut pas être une affirmation

`--checkpoint` exige un **`contract` approuvé**, et enregistre **quel** document a été
signé, **quand**, et **le hash de son contenu à cet instant** :

```json
"checkpoint": {
  "at": "2026-10-01T09:48:20.643Z",
  "on": ".forge/contract.md",
  "contract_hash": "sha256:b57fa286cf5d"
}
```

**Pourquoi ce n'est plus un booléen.** `checkpoint_reached: true` affirmait qu'un humain
avait validé, sans dire quel document ni sur quoi. Un gate qui ne dit pas ce qu'il
vérifie ne peut pas être audité : le seul moyen de savoir s'il a bien tourné est de
croire celui qui l'a écrit. C'est un gate **auto-certifié** — la faute qu'un agent client
commettrait s'il approuvait, et qu'on ne peut pas commettre soi-même.

**Pourquoi c'est le contrat, et pas une validation de phase.** Le contrat liste déjà les
exclusions et les engagements irréversibles — exactement ce qu'un checkpoint de sortie
doit vérifier. Le faire signer deux fois, une fois par phase et une fois comme
checkpoint, serait demander au client la même signature deux fois ; il donnerait la même
réponse aux deux, celle qu'on lui demande de donner le moins possible.

**Le hash est figé, et c'est voulu.** Modifier le contrat après signature ne change pas
le hash enregistré : le checkpoint atteste de **ce qui a été signé**, pas de ce qui est
écrit aujourd'hui. C'est `no_content_drift` qui signale l'édition — les deux contrôles ne
se recouvrent pas.

### Phase 7 sous Fast Track

L'implémentation n'est pas validée par des agents qui relisent le code. Elle est validée par **des portes exécutables**, parce qu'un agent qui relit du code Million de lignes ne prouve rien, et qu'une porte qui sort 0 si.

**Par slice :**

```bash
node "$FORGE/scripts/forge-exit.js" <anchor> <slice>        # critère de sortie EXÉCUTÉ
node "$FORGE/scripts/consistency-check.js" all <anchor>     # écarts inter-artefacts
```

`forge-exit` exécute les commandes réelles du projet (lint, typecheck, tests) et vérifie que la slice a des **cas de test**, pas un fichier de test. C'est la porte qui aurait attrapé 14 slices approuvées à tort.

**Avant de marquer une slice `implemented` :**

1. `forge-exit` passe
2. `consistency-check` ne signale pas cette slice
3. Les constats que l'implémentation a révélés sont **routés** avec un domaine
4. Aucun constat n'est laissé « dans un plan à venir » — un constat écrit dans une checklist n'est pas un constat fait

**À la fin de chaque jalon**, le rapport de jalon contient : slices réellement terminées (avec nombre de cas de test), constats ouverts par domaine, documents en dérive de hash, et la liste explicite de ce qui **n'a pas été vérifié mécaniquement**.

**En portée `phases4-7`**, si le seuil de constats non promus est dépassé, Forge **déclenche la promotion** : ré-invocation de `project-rules-architect` avec les constats routés. Cf. `references/skill-boundaries.md` § Quand l'invoquer.

---

## Le périmètre d'un validateur — une seule règle

Trois fichiers fixaient trois périmètres différents, et ils étaient
**incompatibles** :

- `fast-track.md` (ci-dessus) : « l'artefact + son `derived_from` » ;
- `agents/quality-analyst.md` : le PRD **seulement en Phase 6** ;
- `agents/red-team.md` : le PRD, mais « uniquement pour ces IDs ».

Un validateur applique **la règle la plus étroite qu'il connaît**. Il se
prive donc du document dont il a le plus besoin — et comme aucun des trois ne
mentionnait la sanction, il rend un verdict quand même, sans dire qu'il est
aveugle. Constaté sur un test grandeur nature : deux validateurs ont rendu
`unreadable_without` listant le PRD, l'architecture et les conventions, **sans
que cela change leur verdict**.

**La règle, en une phrase :**

> Lis l'artefact, son `derived_from` — lu dans `state.json`
> (`deliverables.<clé>.derived_from`, `screens.<clé>.derived_from`,
> `slices.<clé>.derived_from`), et `state.json`. Rien d'autre, sauf un fichier
> listé dans `derived_from`.

Trois conséquences, qui sont le but :

1. **Le périmètre est résolvable mécaniquement.** `state.js register` et
   `state.js sync` recopient `derived_from` dans l'autorité. Sans cela,
   « son `derived_from` » est une notion que l'agent doit reconstruire en
   ouvrant le document qu'il doit valider — un contrat qui dépend d'une
   lecture humaine du document à valider n'est pas un contrat outillé.
2. **`unreadable_without` non vide ⇒ `BLOCK`.** C'est une sanction, pas une
   déclaration. Elle est dans les trois fichiers.
3. **`derived_from` absent de l'autorité ⇒ l'agent le déclare**, et ce
   `BLOCK` est alors la bonne réponse : l'outillage n'a pas fourni le
   périmètre, ce n'est pas au validateur de le deviner.

Et ce qui reste interdit : lire tout `.forge`, et combler un trou par
imagination. Une imagination qui bouche un trou devient le prochain bug.

---

## Boucle de validation

Pour chaque artefact (architecture, puis chaque plan de slice) :

```
1. GÉNÉRER        l'artefact depuis son template
2. SCRIPTS        coverage-check + dependency-check + forge-guard  (déterministe, ~0 token)
3. VALIDATEURS    2 agents en parallèle, chacun avec le contexte minimal
4. CONSOLIDER     l'agent principal tranche → PASS | REVISE | BLOCK
5. DÉCIDER        PASS : set-status + journal   |   REVISE : régénérer (max 2)   |   BLOCK : arrêt
```

### Étape 2 — les scripts d'abord, toujours

Aucun appel LLM avant que les scripts passent. Un script détecte en une seconde ce qu'un agent met trois lectures à trouver.

| Artefact | Scripts |
|---|---|
| Architecture | `forge-guard.js all` · `dependency-check.js check --write` |
| Plan de slice | `coverage-check.js slice` · `forge-guard.js placeholders` · `check-stale` |

Un script en échec court-circuite la boucle : **REVISE immédiat**, sans consulter les agents.

### Étape 3 — deux validateurs complémentaires

Ils ne sont pas redondants. Chacun a un angle mort que l'autre couvre.

| Agent | Angle mort qu'il couvre | Question centrale |
|---|---|---|
| `quality-analyst` | Ce qui **manque** | « Cette spec est-elle complète ? Chaque règle a-t-elle sa traduction ? » |
| `red-team` | Ce qui est **faux** | « Qu'est-ce qui ne marchera pas ? » |

`plan-validator` intervient en plus lorsque `.forge/benchmarks.md` existe : il compare aux standards de l'archétype (cf. `references/archetypes.md`).

Les validateurs sont lancés **en parallèle**, jamais en séquence.

### Étape 4 — contrat de sortie

Chaque validateur renvoie **exactement** cette structure. Toute réponse hors format est traitée comme `REVISE` (format invalide), jamais comme `PASS`.

```json
{
  "artifact": ".forge/plans/slice-entree.md",
  "agent": "quality-analyst",
  "verdict": "PASS | REVISE | BLOCK",
  "findings": [
    {
      "severity": "critical | major | minor",
      "location": "fichier:ligne — ou ID B12 / E3",
      "problem": "ce qui ne va pas, en une phrase",
      "required_change": "ce qu'il faut faire concrètement",
      "evidence": "la citation ou l'ID qui prouve le problème"
    }
  ],
  "coverage_gaps": ["B7", "E4"],
  "unreadable_without": ["fichier que je n'ai pas pu lire"]
}
```

- `PASS` : 0 finding `critical` et 0 `major`.
- `REVISE` : au moins 1 `major`, ou findings `minor` multiples.
- `BLOCK` : finding `critical`, ou fichier illisible.

### Étape 5 — arbitrage

L'agent principal consolide. En cas de désaccord entre validateurs :

- Les deux ont raison, gravité différente → on prend la plus grave.
- Les deux ont raison, même conclusion → `REVISE`.
- **Verdicts opposés** (`PASS` vs `BLOCK`) → on prend `BLOCK` et on ne tranche pas seul : l'escalade est humaine.

Un validateur qui n'est pas d'accord doit dire **pourquoi**, avec une preuve. « Je ne suis pas d'accord » sans finding n'est pas un désaccord.

---

## Limites — non négociables

| Limite | Valeur | Raison |
|---|---|---|
| Tentatives de révision par artefact | **2** | Au-delà, c'est un problème de spec en amont, pas de plan |
| Artefacts validés automatiquement | Phase 4, 5, et 7 **par portes exécutables** | Aucun agent ne valide du code par relecture |
| Checkpoint humain | 1 à la sortie de Phase 5, **+ 1 par jalon** en Phase 7 | Jamais supprimé, même en `full` |
| Lecture d'un validateur | l'artefact + son `derived_from` **résolu dans `state.json`** + `state.json` | Pas tout `.forge` — le contexte est le coût |
| **`derived_from` absent de l'autorité** | l'artefact est lisible seul, mais **aucun validateur ne peut certifier une citation** | `state.js register` et `state.js sync` recopient `derived_from` dans `state.json` ; s'il reste absent, le validateur le déclare dans `unreadable_without` |
| **`unreadable_without` non vide** | `BLOCK` | Un validateur qui n'a pas pu lire ce qu'il devait lire ne peut rien certifier |
| **`severity: info` + `prior_critical_resolved`** | un constat résolu ne peut pas re-BLOCK | Sans lui, un tour se solde par un `BLOCK` sur un bug déjà corrigé |
| Arrêt sur `BLOCK` | immédiat | Jamais de `BLOCK` contourné |
| **Constats sans domaine** | refusés | Un constat non routable n'est pas un constat |

## Ce que la validation automatique ne peut pas faire

Écrit ici pour qu'on ne le découvre pas en production.

**Une porte vérifie la présence et la conformité, pas la justesse.** `forge-exit` prouve que les tests passent et que la slice en a. Il ne prouve pas que le test vérifie la bonne chose. Un test peut passer pour la mauvaise raison, et il le fera.

**Un agent ne remplace pas une relecture.** `red-team` cherche ce qui est faux dans un document ; il ne peut pas exhaustive. Sur un plan de 500 lignes, il en lit une partie, et il ne le dit pas.

**Les écarts entre artefacts sont les seuls qui échappent à la validation isolée.** C'est le motif le plus coûteux mesuré : 13 fois, un artefact ultérieur a révélé un défaut d'un artefact antérieur déjà approuvé, et aucun contrôle de gate ne l'a vu. `consistency-check.js` est le seul outil qui regarde l'écart.

**Le niveau d'autonomie ne change pas cette limite.** Il change le nombre de moments où un humain peut la compenser. C'est tout.

**Un `BLOCK` arrête Fast Track.** Le mode revient en manuel, l'audit enregistre l'incident, et l'utilisateur est prévenu avec le contenu du finding.

---

## Reprise

`state.json → run.fast_track` conserve la position :

```json
"fast_track": {
  "enabled": true,
  "entered_at": "2026-09-27T14:00:00Z",
  "current_artifact": ".forge/plans/slice-sortie.md",
  "attempts": { "slice-entree": 1, "slice-sortie": 2 },
  "checkpoint_reached": false
}
```

Une invocation interrompue reprend exactement où elle s'était arrêtée, sans revalider ce qui est `approved`.

---

## Échappatoire

L'utilisateur peut interrompre Fast Track à tout moment, sans justification :

- « Reviens en mode normal »
- « Valide ce plan sans agent »
- « Refais la Phase 4 en manuel »

L'audit enregistre l'échappatoire : un mode qui saute la validation est une information exploitable.

---

## Journalisation — obligatoire

Fast Track sans traces ne sert à rien. **Chaque** itération est journalisée :

```bash
node "$FORGE/scripts/state.js" log <anchor> fast_track_validate "<artifact>" agent=quality-analyst verdict=REVISE
node "$FORGE/scripts/state.js" log <anchor> fast_track_block    "<artifact>" finding="..."
node "$FORGE/scripts/state.js" log <anchor> fast_track_escape   "reason=..."
```

Ces entrées alimentent `audit-report.js`, qui calcule le taux de `REVISE` par phase et par agent — c'est la seule façon de savoir si la validation automatique apporte quelque chose.

---

## Checklist de gate — sortie de Fast Track

- [ ] Toutes les conditions d'entrée étaient satisfaites au démarrage.
- [ ] Chaque artefact est passé par les scripts **et** par les deux validateurs.
- [ ] Aucun artefact n'a dépassé 2 tentatives de révision.
- [ ] Aucun `BLOCK` n'a été contourné.
- [ ] `forge-guard.js all` ne signale rien.
- [ ] Tous les artefacts sont `approved` dans `state.json` **et** dans leur front matter.
- [ ] Le checkpoint humain a été atteint et les validations journalisées.
- [ ] `run.fast_track.checkpoint_reached` est vrai, **et `run.fast_track.checkpoint` porte le contrat, sa date et son hash** — un booléen seul n'atteste de rien.
