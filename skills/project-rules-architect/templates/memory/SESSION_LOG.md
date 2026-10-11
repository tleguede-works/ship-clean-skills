# SESSION_LOG.md — journal de session

**Append-only.** Une entrée par session de travail, à lire **en entier au début de
chaque session** et à compléter **avant de terminer** une session ou un commit.

## Le format, et pourquoi il est écrit en avance

Le journal ne se remplit pas **à la fin** d'une session. Il se remplit **au fil
de l'eau**, et la raison n'est pas organisationnelle.

**Un modèle avec un million de tokens de contexte survit jusqu'au bout.** Il
reste le raisonnement, et il écrit une entrée complète au moment où il sait ce
qu'il a fait. **Un modèle plus petit ne survit pas** : la compaction arrive avant
la fin, et quand l'agent rouvre les yeux, il sait ce qu'il a fait mais plus
pourquoi. Ce qui disparaît en premier, ce n'est pas le résultat — il est dans le
diff — c'est **le refus**, c'est-à-dire l'information la plus difficile à
reconstituer.

Un déclencheur de fin de session est donc **le pire moment possible** : il ne se
déclenche que si l'agent survit jusque-là.

**Le déclencheur est donc placé sur des moments observables, et l'entrée est
ouverte au départ.** Ce qui est écrit est écrit avant que le contexte ne puisse
le prendre.

## L'entrée

```markdown
### AAAA-MM-JJ — <titre de session>

- **STARTED FROM** — d'où la session part
- **STATUS** — en cours
```

Les six autres champs — `DECIDED`, `REJECTED`, `BLOCKED`, `FILES TOUCHED`,
`NEXT SESSION SHOULD`, `NEXT SESSION SHOULD NOT` — sont complétés **au fil de
l'eau**, jamais d'un seul bloc à la fin. `REJECTED` est le champ le plus cher :
c'est le seul qui empêche une session future de reproposer ce qui a déjà été
écarté, et il est aussi le premier oublié, parce que personne ne pense à écrire
« non » pendant qu'on écrit du code.

## Les points de contrôle

**Un point de contrôle est une ligne.** Il ne coûte rien et il est écrit quand
l'information est encore fraîche.

```markdown
- **[HH:MM] <où j'en suis> — <ce que je viens de décider, et ce que je fais maintenant>**
```

### Quand en écrire un — cinq moments, tous observables

| Moment | Pourquoi celui-là |
|---|---|
| **La session ouvre** | l'entrée est créée immédiatement, pas à la fin |
| **Un changement de phase** | Forge sait qu'une phase change ; c'est un signal fiable, pas une horloge |
| **Le début d'une slice** | le périmètre est connu et frais |
| **La fin d'une slice** | avant tout commit — le moment où l'inventaire des fichiers est encore exact |
| **Le contexte vient d'être compacté** | l'agent s'en aperçoit : le résumé vient d'arriver. **C'est le moment le plus important de tous**, parce que c'est le dernier avant le suivant |

**Pas d'horloge.** Un modèle ne sait pas quelle heure il est, et une horloge non
déclenchée est un déclencheur silencieux — exactement le défaut qu'on répare.
Les cinq moments ci-dessus sont des **événements que l'agent constate**, pas des
durées qu'il devine.

### Ce qu'un point de contrôle contient

Trois choses, dans cet ordre :

1. **Où j'en suis** — la slice, la phase, l'étape.
2. **Ce que je viens de décider** — une phrase, pas un paragraphe.
3. **Ce que je fais maintenant** — la prochaine action, nommée.

Le troisième est ce qui rend le point de contrôle utile après une compaction :
l'agent relit « je vais écrire le plan de la slice X » et il sait reprendre, sans
avoir à relire le diff pour savoir où il s'était arrêté.

### Ce qu'un point de contrôle ne contient pas

- Un diff, un listing de fichiers, une sortie de commande. **Ça, ça se
  régénère** depuis git ; uneynthèse ne le fait pas.
- Une justification longue. Si elle tient en trois lignes maintenant, elle
  tiendra en trois lignes dans une heure. Si elle n'y tient pas, c'est un
  `DECISIONS.md`.

## Propriété des faits

| Fichier | Tient |
|---|---|
| `DECISIONS.md` | Décisions d'architecture fermées |
| `LEARNINGS.md` | Corrections apprises, avec leur domaine de promotion |
| `SESSION_LOG.md` (ce fichier) | Le récit de la session |

{{#if forge-present}}
| `.forge/state.json` | Statut des livrables, hashes, ID — autorité, jamais édité à la main |
| `.forge/audit/run-log.jsonl` | Journal machine du skill de planification |
{{/if}}

## Journal


---

## AAAA-MM-JJ — Session N : <ce que cette session a fait, une ligne>

### STARTED FROM

Où la session précédente s'était arrêtée, et ce qu'il restait ouvert. Une session qui
démarre sans écrire ceci est une session qui ne sait pas d'où elle part.

### DECIDED

Ce qui a été tranché pendant cette session, avec la raison. Une décision de fond
appartient à `DECISIONS.md` ; on n'y met que le **geste** et le renvoi.

### REJECTED

Ce qui a été **écarté**, et pourquoi. Le champ le plus cher du fichier, et celui qu'on
omet en premier : tout le reste décrit ce qui a été fait, celui-ci empêche la session
suivante de reproposer la même chose.

Une entrée qui dit « non à la carte bancaire » sans dire pourquoi est un piège : la
session suivante va demander pourquoi.

### BLOCKED

Ce qui n'a pas pu être fait, et **ce qui le débloquerait**. Un blocage sans voie de
sortie est un blocage qui se répète.

### FILES TOUCHED

Les fichiers écrits ou modifiés, et ce qui les a imposés — un garde-fou qui a refusé,
une porte qui a nommé un manque. Pas la liste exhaustive : celle-ci est dans le
journal machine.

### STATUS

Où en est le projet, en une phrase, et ce qui est vert ou rouge en ce moment.

### NEXT SESSION SHOULD

Ce que la prochaine session doit faire en premier, dans l'ordre. Si cette section est
vide, la prochaine session recommence par explorer.

### NEXT SESSION SHOULD NOT

Ce qu'elle ne doit pas refaire, et pourquoi. **C'est le champ le plus sous-utilisé.**
Il porte les détours déjà payés, les detours deja payes et les hypothèses déjà
invalidées — tout ce qui coûterait cher à refaire et qui n'est écrit nulle part
ailleurs.

---

## Format d'une entrée

Les huit titres ci-dessus sont **obligatoires et nommés**. Une entrée qui n'en a pas
huit n'est pas une entrée : c'est un paragraphe, et le lecteur ne sait plus où
chercher.

Une session qui n'a rien changé ne s'écrit pas ici. Une entrée vide ferait croire à un
travail qui a eu lieu.