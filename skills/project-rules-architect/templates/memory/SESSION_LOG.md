# SESSION_LOG.md — journal de session

**Append-only.** Une entrée par session de travail, à lire **en entier au début de
chaque session** et à ajouter **avant de terminer** une session ou un commit.

Chaque entrée porte **8 champs, dans cet ordre**. L'ordre fait partie du format : une
session qui commence par `STATUS` doit relire les sept autres pour savoir où elle en
est.

`STARTED FROM` · `DECIDED` · `REJECTED` · `BLOCKED` · `FILES TOUCHED` · `STATUS` ·
`NEXT SESSION SHOULD` · `NEXT SESSION SHOULD NOT`

**Ce que ce fichier n'est pas.** Il ne porte pas le statut d'un livrable — cette
autorité est `.forge/state.json`, seul. Il ne porte pas une décision
d'architecture : c'est `DECISIONS.md`. Il ne porte pas une correction de fond : c'est
`LEARNINGS.md`. Il porte **ce qui s'est passé et dans quel ordre**, y compris les
hésitations et les erreurs — la seule information qu'aucun autre fichier ne peut
déduire.

**Ce que `.forge/audit/run-log.jsonl` n'est pas.** C'est le journal machine des
commandes Forge (`init`, `hash`, `status_change`, `gate_approved`). Il sait qu'un
`hash` a tourné ; il ne sait pas pourquoi la décision qui l'a précédé a été remise en
cause. Les deux sont complémentaires, et aucun des deux ne remplace l'autre.

## Propriété des faits

| Fichier | Tient |
|---|---|
| `.forge/state.json` | Statut des livrables, hashes, ID — autorité, jamais édité à la main |
| `.forge/audit/run-log.jsonl` | Journal machine de Forge |
| `.forge/audit/issues.md` | Incidents du processus de planification |
| `DECISIONS.md` | Décisions d'architecture fermées |
| `LEARNINGS.md` | Corrections apprises, avec leur domaine de promotion |
| `SESSION_LOG.md` (ce fichier) | Le récit de la session |

## Journal

<!-- Une entrée par session, la plus ancienne en premier. Rien d'autre ici. -->

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