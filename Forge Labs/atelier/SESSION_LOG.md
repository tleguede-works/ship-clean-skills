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
hesitations et les erreurs — la seule information qu'aucun autre fichier ne peut
déduire.

**Ce que `.forge/audit/run-log.jsonl` n'est pas.** C'est le journal machine des
commandes Forge. Il sait qu'un `hash` a tourné ; il ne sait pas pourquoi la décision
qui l'a précédé a été remise en cause. Les deux sont complémentaires, et aucun des
deux ne remplace l'autre.

## Propriété des faits

| Fichier | Tient |
|---|---|
| `.forge/state.json` | Statut des livrables, hashes, ID — autorité, jamais édité à la main |
| `.forge/contract.md` | Ce qui engage le client — le seul document qu'il signe |
| `.forge/conventions.md` | La stack, datée |
| `DECISIONS.md` | Décisions fermées, et questions ouvertes avec leur déclencheur |
| `LEARNINGS.md` | Corrections apprises, avec leur domaine de promotion |
| `SESSION_LOG.md` (ce fichier) | Le récit de la session |

## Journal

---

## 2026-10-01 — Session 1 : le premier contrat réellement chiffré du dossier

### STARTED FROM

Rien. Projet créé dans la minute, `state.js init`, et pas un octet de mémoire —
verifié avant de commencer, pas supposé.

### DECIDED

- **Atelier est un devis pour un menuisier seul, hors réseau.** Et non un dashboard, un
  mobile e-commerce ou une gestion locative : les trois autres existent déjà dans ce
  dossier, et un cinquième projet qui répète ne prouve rien.
- **Le volume est 30 devis par an.** Sans chiffre, l'offre gratuite d'envoi ne peut pas
  être vérifiée et le coût du paiement par carte ne peut pas être annoncé au client.
- **Appeler PRA deux fois** : en Phase 0 pour le socle de contexte, puis après
  l'architecture pour les règles.

### REJECTED

- **Les quatre projets précédents comme gabarit.** Leurs contrats sont tous
  `draft` et tous sans prix : les reprendre aurait reproduit la seule chose qu'on
  cherche à éviter.
- **Un contrat rédigé par l'agent sans prix de marché.** « Hébergement : à chiffrer »
  n'est pas un prix, c'est un trou, et il avait passé trois projets parce que personne
  ne l'avait comparé à un vrai tarif.
- **Une signature fabriquée.** Jean-Luc n'existe pas. Cinq champs du bloc signature
  restent `[à compléter]` et le contrat reste `draft`.

### BLOCKED

- **Aucune.** Le projet avance.

### FILES TOUCHED

`.forge/state.json`, puis rien d'autre — le premier appel de
`project-rules-architect` a produit les quatre fichiers de mémoire. La commande
`state.js start` a confirmé `triggers_named: 3` et `memory_described_not_triggered: 0`,
ce qui est la seule preuve que l'index a des déclencheurs et pas seulement des
descriptions.

### STATUS

Phase 0 entamée. Contrat absent, conventions à écrire.

### NEXT SESSION SHOULD

Écrire les conventions avec les trois décisions qui **engagent un achat**, puis le
contrat.

### NEXT SESSION SHOULD NOT

- **Ne pas écrire le contrat avant d'avoir un chiffre par engagement.** C'est la
  seule chose que les trois projets précédents n'ont pas faite, et c'est celle qui a
  fait parler les portes.
- **Ne pas traiter les exclusions comme des détails.** Elles sont au § 2 du contrat,
  et une exclusion non dite se découvre à la livraison.

---

## 2026-10-01 — Session 2 : le contrat, et deux défauts de la porte

### STARTED FROM

Conventions écrites avec trois cases `À DÉCIDER AVANT LA PHASE 1`, chacune engageant un
achat. Contrat à produire.

### DECIDED

- **Porte des irréversibles : deux motifs trop étroits.** `signature` n'appartenait à
  aucun genre, donc « Signature du devis » ne satisfiait pas « Identité du signataire » ;
  et « avant la » n'était pas reconnu comme échéance alors que « avant le » l'était.
- **Trois prix réels** : hébergement 5,99 €/mois sur 12 mois, nom de domaine 24 € pour
  deux ans, envoi de courriels 0 € jusqu'à 3 000. Total **95,88 €** la première année.
- **Le contrat passe `client-liaison --check`, deux fois.** La première version a rendu
  16 questions ; la seconde, 15 — mais avec trois **contradictions** que j'avais
  moi-même créées en ajoutant des chiffres.

### REJECTED

- **`client-liaison` en verdict.** Il ne rend pas de verdict, il rend des questions. Lui
  en demander un l'aurait fait inventer un jugement.
- **« Qualifiée » spelled out en un prix.** Un prix sans dire ce que l'argent achète
  ne permet pas d'arbitrer : Jean-Luc ne choisissait qu'entre « gratuit » et « cher ».
- **Les trois contradictions au lieu de les réduire.** Un contrat qui dit 12 €/an au § 5
  et 24 € pour deux ans au § 3 n'est pas un contrat, c'est deux contrats.
- **Le paiement par carte.** 1,8 % + 0,25 € sur chaque facture, soit 2 708 €/an contre
  95,88 € pour tout le reste. Écrit comme exclusion, et comme un chiffre que Jean-Luc
  peut vérifier.

### BLOCKED

- **Le bloc signature.** Cinq champs `[à compléter]` : SIRET de Jean-Luc, raison sociale
  de Forge, adresse, téléphone, courriel. Aucun n'est à moi d'inventer.

### FILES TOUCHED

`.forge/conventions.md`, `.forge/contract.md`, puis
`skills/forge/scripts/forge-guard.js` — **les deux corrections sont dans le skill**, pas
dans le contrat. C'est ce qui les rend réutilisables.

### STATUS

`contract_complete: pass`. Phase 0 bouclée.

### NEXT SESSION SHOULD

PRD, avec l'attention sur ce que le contrat interdit.

### NEXT SESSION SHOULD NOT

- **Ne pas corriger un défaut dans un projet de labo.** Les deux motifs trop étroits
  étaient dans `forge-guard.js`. Les corriger dans le contrat aurait rendu le contrat
  conforme et la porte fausse pour le projet suivant.
- **Ne pas ajouter un chiffre sans relire les trois autres.** C'est ainsi que « 30 à 50
  devis par mois » a fini à côté de « 30 devis par an ».

---

## 2026-10-01 — Session 3 : PRD et roadmap — la facture sort du MVP

### STARTED FROM

Phase 0 close. Le contrat interdit sept choses, dont deux qui auraient été évidentes.

### DECIDED

- **La facture sort du MVP.** Ses blocages sont externes au code : cinq mentions légales
  inconnues, et un taux de TVA qui ne l'est pas non plus.
- **Point client C-001** : les cinq mentions obligatoires de la facture, échéance
  2026-10-31, clause « sans réponse » explicite.
- **Les trois durées restent distinctes** : validité du devis, délai de paiement,
  relance. Un seul `délai` générique les aurait fusionnées, et l'agent qui les confond
  relance au mauvais moment.

### REJECTED

- **Proposer la comptabilité ou la carte, même « en option ».** Le contrat les a
  tranchées. Les rouvrir serait du travail pour rien.
- **Un délai unique de 30 jours pour les trois choses.** Ça marche pour deux et casse
  la troisième.
- **Faire entrer la facture dans le MVP « pour avoir une démo complète ».** Une démo
  complète qui ment sur ce qui est prêt est pire qu'une démo incomplète.

### BLOCKED

- **C-001** ouvert jusqu'au 2026-10-31, et il bloque l'émission de facture.

### FILES TOUCHED

`.forge/prd.md` (11 contraintes, 26 règles, 18 cas limites, 14 histoires),
`.forge/roadmap.md`.

### STATUS

Phases 1 et 2 closes. Gate verte.

### NEXT SESSION SHOULD

Design system et écrans, avec le vocabulaire de trois mots écrit **dans** les libellés.

### NEXT SESSION SHOULD NOT

- **Ne pas fusionner les trois durées** en un seul nombre, même si deux d'entre elles
  valent 30. Elles ne veulent pas la même chose.
- **Ne pas supposer que le MVP est « tout ce que le contrat promet ».** Il ne l'est
  pas, et le contrat ne dit pas que le MVP est le contrat.

---

## 2026-10-01 — Session 4 : design — 23 composants, 10 écrans, deux infections

### STARTED FROM

Roadmap close. Aucun token, aucun composant, aucun écran.

### DECIDED

- **Trois mots, jamais deux** : `écrit ici, pas encore envoyé` · `envoyé` · `la date
  limite`. Le test est un **test de langage** : Jean-Luc doit pouvoir dire « c'est
  confirmé » au téléphone **sans regarder l'application**.
- **Les deux exclusions visibles.** Un design qui montre « payer par carte » sans son
  prix ment ; un design qui laisse croire qu'une facture est comptable ment aussi.

### REJECTED

- **Un quatrième état de synchronisation.** « En cours d'envoi » paraît utile et crée
  un quatrième mot que Jean-Luc ne connaît pas. Trois mots, et le troisième est la date.
- **Faire écrire l'écran `Relancer` seulement « quand il y a du réseau ».** Il disparaît
  hors ligne, et un agent qui ne le voit pas croit qu'il n'y a rien à faire.
- **Réécrire le design system depuis les écrans.** Il a été écrit d'abord ; les écrans
  s'y conforment. Le contraire crée deux propriétaires.

### BLOCKED

- **`imagegen-frontend-mobile` n'est pas installé.** L'absence est écrite dans la
  checklist plutôt que contournée.

### FILES TOUCHED

`.forge/design/design-system.md` (1 548 lignes, 23 composants),
`.forge/design/screens/` (10 écrans).

### STATUS

Phase 3 close. `contrast`, `tokens`, `tokens-used`, `component-parity` : tous verts.

### NEXT SESSION SHOULD

Architecture, puis le deuxième appel à PRA.

### NEXT SESSION SHOULD NOT

- **Ne pas écrire de ratio de contraste à côté d'une valeur de token.** La mesure se
  fait par `design-check contrast` ; un ratio rédigé est un nombre fabriqué.
- **Ne pas corriger une infection de caractères dans un fichier dont on n'est pas
  propriétaire** sans le signaler. Le design system en a reçu une du sous-agent écrans.

---

## 2026-10-01 — Session 5 : architecture et règles — deux portes en désaccord

### STARTED FROM

Design clos. La stack est décidée, donc les règles peuvent enfin être écrites.

### DECIDED

- **Appel 2 à PRA**, une fois `architecture approved`. Il a produit `.opencode/rules/`
  — 371 lignes, 24 règles de domaine — et **n'a pas touché** aux quatre fichiers de
  mémoire, dont les horodatages sont antérieurs à l'appel.
- **« Hors scope » n'est pas « retiré ».** `roadmap` était accusé de reposer sur cinq
  exigences retirées qui ne l'étaient pas. La règle existait dans le commentaire du code
  et dans toutes les fixtures — pas dans le code.
- **Un contrat non signé est rouge au-delà de la Phase 0.** Corriger cela a révélé que
  `complete-phase` ouvrait une porte que `contract_complete` fermait.
- **La visibilité des plans manquants dépendait de l'approbation de la Phase 5.** J'ai
  retiré une approbation prématurée — geste honnête — et le signal s'est éteint.

### REJECTED

- **Un plan pour S15–S20.** Ces six tranches sont bloquées par Q-004, Q-006 et le jour
  de la relance. Écrire un plan aurait exigé d'inventer un de ces nombres, et
  l'architecture l'interdit.
- **`FORGE` non exporté dans un shell de contre-témoin.** Deux contre-témoins ont
  semblé passer parce que la variable avait disparu : une mutation no-op. Le compteur
  d'occurrences (`str.count`) est ce qui a révélé le no-op, pas l'absence d'échec.
- **Corriger la contradiction du § 5 du contrat seulement.** Elle venait de mon propre
  ajout de chiffres ; la réduire aurait laissé les trois autres.
- **Réparer le journal des phases en déplaçant le curseur.** `complete-phase` avance le
  curseur dans le même geste qu'il approuve : réparer ainsi aurait déformé une autre
  trace. Le contrôle nomme, il ne répare pas.

### BLOCKED

- **Le contrat n'est pas signé**, et il ne peut pas l'être : cinq champs sont à
  Jean-Luc ou à Forge.
- **S15–S20** sans plan.

### FILES TOUCHED

`.forge/architecture.md` (9 fondations, 20 tranches, 11 vagues), `.opencode/rules/`
(4 fichiers), `opencode.json`, puis quatre scripts du skill et deux tests.

### STATUS

Phases 0 à 4 closes, phase 5 en cours. Trois portes rouges, toutes correctes.

### NEXT SESSION SHOULD

Faire signer le contrat. C'est la seule action qui débloque le reste, et elle est
humaine.

### NEXT SESSION SHOULD NOT

- **Ne pas approuver la Phase 5 tant que des tranches déclarées n'ont pas de plan.**
  Je l'ai fait, la porte l'a dit, et j'ai dû retirer l'approbation.
- **Ne pas donner à `project-rules-architect` un chemin d'agent qui n'existe pas.** J'ai
  écrit `agents/solution-architect.md` et `agents/plan-writer.md` ; ni l'un ni l'autre
  n'est le bon nom, et les deux appels ont semblé réussir.
- **Ne pas traiter « la stack est décidée » comme une raison de laisser `AGENTS.md`
  dire le contraire.** Une section d'état qui ne change pas affirme un état faux.

---

## Format d'une entrée

Les huit titres ci-dessus sont **obligatoires et nommés**. Une entrée qui n'en a pas
huit n'est pas une entrée : c'est un paragraphe, et le lecteur ne sait plus où chercher.

Une session qui n'a rien changé ne s'écrit pas ici. Une entrée vide ferait croire à un
travail qui a eu lieu.