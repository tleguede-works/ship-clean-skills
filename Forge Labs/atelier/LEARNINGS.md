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

## Corrections

- 2026-10-01 — Ne pas ajouter un chiffre à un contrat sans relire les trois autres chiffres voisins. J'ai écrit « 30 à 50 devis par mois » à côté d'un « 30 devis par an » déjà présent, et « 12 €/an » au § 5 à côté d'un « 24 € pour deux ans » au § 3. Un contrat qui porte deux prix pour le même objet n'est pas un contrat, c'est deux contrats : le client ne peut pas savoir lequel l'engage.
  → domaine: `.forge/contract.md` § 3 | Seen: `client-liaison --check`, deuxième passage — 15 questions, dont trois contradictions nées de mon propre ajout de chiffres

- 2026-10-01 — Ne pas annoncer un prix sans dire ce que l'argent achète. J'ai écrit « qualifiée : 1 à 3 € par devis » et « tracée : 0 € ». Jean-Luc ne pouvait qu'arbitrer entre « gratuit » et « cher », donc il aurait choisi sans savoir qu'il prend un risque — et c'est la seule ligne du contrat où un mauvais choix lui coûte de l'argent réel. Un prix s'accompagne de ce qu'il achète, ou il ne permet pas de décider.
  → domaine: `.forge/contract.md` § 5 | Seen: `client-liaison --check`, première question rendue

- 2026-10-01 — Ne pas mettre un tableau de mise en scène dans un tableau de décisions. J'ai ajouté un tableau « Quand / Comment Jean-Luc répond » **à l'intérieur** du § 5, et la porte l'a lu comme trois décisions sans échéance. Elle avait raison : la porte lit les tableaux de ce qu'ils sont, pas ce que j'espérais qu'ils fussent. Un tableau de commentaire va en prose ou dans une section à côté.
  → domaine: `forge-guard.js` § contrat | Seen: `contract_complete: fail` — « 3 ligne(s) sans échéance » sur des lignes qui n'étaient pas des décisions

- 2026-10-01 — Ne pas corriger un défaut dans un projet de labo. La porte des irréversibles signalait deux absences ; les deux motifs trop étroits étaient dans `skills/forge/scripts/forge-guard.js`. Les corriger dans le contrat aurait rendu ce contrat conforme et la porte fausse pour tous les projets suivants — et le défaut est resté invisible jusqu'au premier contrat chiffré, donc longtemps.
  → domaine: `forge-guard.js` § `checkContract` | Seen: F-67, sur le premier contrat réellement chiffré du dossier

- 2026-10-01 — Ne pas faire un contre-témoin sans lire le nombre de mutations appliquées. Deux fois, une mutation a été un **no-op** : `"$FORGE"` n'était pas exporté dans le shell, la chaîne n'a jamais été trouvée, rien n'a été remplacé, et le contre-témoin a « passé ». Compter `str.count` **avant** de remplacer est le seul moyen de distinguer un contre-témoin d'un rituel — et un contre-témoin qui ne mord pas donne une assurance fausse, ce qui est pire que pas de contre-témoin.
  → domaine: `.opencode/rules/00-regles.md` § définition de terminé | Seen: F-67 contre-témoins 1 et 2, deux fois de suite

- 2026-10-01 — Ne pas valider un contre-témoin sur un projet dont le défaut a déjà été corrigé à la main. J'ai désactivé la garde « pas un retrait » et relancé `consistency-check` sur `Atelier` : vert. Non parce que la garde ne servait à rien, mais parce que j'avais déjà retiré les identifiants du § 9 du PRD à la main. **Un contre-témoin qui passe pour une raison étrangère au défaut ne prouve rien** — il faut une fixture qui porte encore le défaut.
  → domaine: `.opencode/rules/00-regles.md` § escalade | Seen: F-68, contre-témoin 1

- 2026-10-01 — Ne pas écrire un test dont la fixture n'exerce pas le chemin qu'il couvre. La fixture du test « ID ambigu » avait un `conventions.md` qui ne citait pas `C2`, donc la branche des citations n'était **jamais atteinte**. Le contre-témoin de cette garde ne mordait pas — et il serait resté vert pour toujours. Une fixture doit contenir les **mots réels** du chemin : un corps vide est un formulaire qui passe la porte.
  → domaine: `.opencode/rules/00-regles.md` § définition de terminé | Seen: F-68, contre-témoin 2

- 2026-10-01 — Ne pas faire une mutation qui s'annule elle-même. Mon contre-témoin « agent orphelin » renommait le fichier **et** le nom dans `SKILL.md` : le document nommait donc le nouveau nom, qui existait, et le contrôle passait à raison. Relancé en ne changeant que le disque, il a mordu. Une seule variable, et c'est celle qui compte.
  → domaine: `.opencode/rules/00-regles.md` § escalade | Seen: F-70, contre-témoin 2

- 2026-10-01 — Ne pas faire confiance à un contre-témoin exécuté dans un shell où une variable n'est pas exportée. `$FORGE` manquait et le contre-témoin est sorti « conforme ». Le symptôme est un fichier binaire qui tourne et une sortie qui a l'air correcte : rien ne distingue un test qui a tourné d'un test qui n'a rien fait.
  → domaine: `.opencode/rules/00-regles.md` § définition de terminé | Seen: F-67 contre-témoins, première tentative

- 2026-10-01 — Ne pas indexer la visibilité d'un travail sur l'approbation qui le produit. `slice_plan_exists` ne comptait les plans manquants que si la Phase 5 était `approved`. J'ai approuvé la Phase 5 trop tôt, vu rouge, puis retiré l'approbation — geste honnête — et le signal s'est **éteint**. La fenêtre d'action était précisément le moment où l'on pouvait encore écrire les plans. Un défaut qu'on peut éteindre en faisant ce qu'il faut n'est pas un défaut, c'est un indicateur.
  → domaine: `consistency-check.js` § `checkSliceReality` | Seen: F-71, mesuré sur `Atelier`

- 2026-10-01 — Ne pas laisser une section d'état affirmer un état périmé. `AGENTS.md` disait « la stack n'est pas décidée, ce dossier ne contient donc aucune règle » alors que la stack était décidée et que `.opencode/rules/` existait. Une section d'état qui ne change pas est pire qu'absente : elle affirme un état faux, et l'agent construit dessus.
  → domaine: `AGENTS.md` § L'état réel du projet | Seen: au deuxième appel de PRA, qui l'a signalé sans y toucher

- 2026-10-01 — Ne pas concevoir un format parce qu'il est connu. Le format du journal de session à 8 champs est écrit dans
  `skills/project-rules-architect/provenance/synthesis-provenance.md`, qui dit aussi que les gabarits sont « émis avec le fichier
  d'entrée ». Aucun `templates/` n'a jamais été émis. Le résultat est mesuré : un journal à 4 puces, un `DECISIONS.md` sans aucune
  décision fermée, et un `LEARNINGS.md` vide sur un projet qui a fait six sessions.
  → domaine: `skills/project-rules-architect/SKILL.md` § The formats are normative | Seen: comparaison avec `bi-dashboard-platform`, archive du 2026-09-29

- 2026-10-01 — Ne pas supprimer `REJECTED` en croyant alléger le journal. C'est le seul champ qui empêche une session future de reproposer la même chose, et il est le premier qu'on omet parce que les sept autres racontent déjà quelque chose. Sur ce projet, les refus portaient : la comptabilité, la carte, la signature qualifiée, le SMS, le quatrième état de synchronisation, les six tranches non planifiées, et deux chemins d'agent inventés. Aucun n'avait où aller.
  → domaine: `SESSION_LOG.md` § Format d'une entrée | Seen: la comparaison de formats ci-dessus

## Promotion

La promotion est le chemin qui fait passer une correction du journal vers une règle. Le
jeu de règles **existe** depuis le 2026-10-01, donc elle a lieu.

- **Correction → règle.** Chaque entrée de `## Corrections` ci-dessus a été relue à la
  naissance de `.opencode/rules/`. Celles qui sont encore vraies sont **déjà** des
  règles : le jeu de règles écrit par PRA incorpore les trois contraintes du projet
  (horloge injectable, écriture locale, empreinte avant l'envoi) et la discipline
  d'escalade dans `00-regles.md`.
- **Ce qui reste dans `## Corrections` et n'est pas promu** : les six corrections de
  **méthode** ci-dessus — contre-témoins, fixtures, sections d'état. Elles ne
  gouvernent aucune zone de code du produit ; elles gouvernent la façon de travailler
  dessus. Elles sont déjà écrites dans `.opencode/rules/00-regles.md`, sous forme de
  définition de terminé et d'escalade — donc elles sont promues **ailleurs**, et
  restent ici parce que ce sont des erreurs de l'agent, pas du produit.
- **Dans l'autre sens, rien ne redescend.** Une règle qui se trompe en production ne se
  corrige pas dans le fichier de règles en douce : elle descend ici, et c'est là qu'elle
  est reprise. Un correctif qui ne remonte jamais ne devient jamais une règle.

## Constats non promus

- **Le cas limite E11 n'a pas de chemin si l'appareil est perdu.** ADR-005 le nomme
  comme point ouvert : la parade écrite repose sur une personne, pas sur un mécanisme.
  Ce n'est pas encore un correctif — c'est du travail non fait, et il est dans
  `DECISIONS.md`.

- **Une infection de caractères chinois dans le design system**, trouvée par le
  sous-agent qui écrivait les écrans — un fichier dont il n'était pas propriétaire. Le
  scan de la source du skill ne couvre pas les livrables de projet, donc il l'a vue par
  lecture, pas par contrôle. Signalée ici parce qu'elle n'a pas de domaine de promotion
  : `.forge/design/` n'est pas un fichier de règles.