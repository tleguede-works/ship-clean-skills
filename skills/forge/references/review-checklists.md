# Checklists de gate

Génère la checklist pertinente à la fin de chaque document, juste avant validation. Ne demande jamais une validation sans checklist concrète.

**Avant toute checklist**, lance `node "$FORGE/scripts/forge-guard.js" all <anchor>`. Un garde-fou en échec invalide le gate : ce n'est pas une vérification de plus, c'est un préalable.

## `prd.md` (Phase 1)

- [ ] Le problème est défini de manière concrète (pas en jargon).
- [ ] Tous les types d'utilisateurs sont identifiés : utilisateurs finaux ET secondaires (admin, support, modérateur...).
- [ ] Chaque user story suit le format "En tant que... je veux... afin de..." avec critères d'acceptation vérifiables.
- [ ] Chaque règle métier a un ID stable (B1, B2...).
- [ ] Chaque edge case identifié a un ID stable (E1, E2...) — pas seulement les erreurs, aussi les cas limites.
- [ ] Chaque contrainte a un ID stable (C1, C2...).
- [ ] Les exigences non-fonctionnelles couvrent performance, sécurité et accessibilité.
- [ ] Les risques et inconnues sont explicitement listés.
- [ ] Le hors scope est documenté (ce qu'on ne fait PAS est aussi important que ce qu'on fait).
- [ ] La section "Points à clarifier" ne contient que des ambiguïtés réelles, pas des "on verra plus tard".
- [ ] Aucun jargon technique d'implémentation (framework, base de données, langage).
- [ ] Aucune règle métier implicite n'a été oubliée.
- [ ] **Le fichier est bien `.forge/prd.md`, et son contenu n'est pas dans `state.json`.**

## `roadmap.md` (Phase 2)

- [ ] Le MVP résout le problème principal du PRD et peut être utilisé par de vrais utilisateurs.
- [ ] Chaque exclusion est justifiée par un compromis explicite (pas "pas le temps" sans explication).
- [ ] Les risques par version sont identifiés.
- [ ] Les dépendances externes sont listées avec leur statut.
- [ ] L'effort relatif est cohérent entre versions (pas de MVP "XL" sans discussion).
- [ ] Aucune fonctionnalité P1 (PRD) n'est repoussée en V2 sans justification exceptionnelle.
- [ ] Les dépendances inter-versions sont explicites.
- [ ] La roadmap ne contient pas de dates absolues sans contexte.

## `benchmarks.md` (Phase 3.1)

- [ ] L'archétype d'application est identifié et justifié par le PRD.
- [ ] La boucle de travail est écrite en une phrase, avec sa fréquence.
- [ ] Au moins deux produits de référence sont documentés, ou leur absence est explicitement justifiée.
- [ ] Les sept questions de la grille de conformité sont répondues.
- [ ] Chaque écart par rapport à l'archétype est justifié et son coût de réversibilité est indiqué.
- [ ] Le verdict est écrit.

## `design-system.md` (Phase 3.3)

**Direction** — cf. `references/design-quality.md`

- [ ] Les trois ancres sont écrites **avant** les écrans : références, ambiance, anti-références.
- [ ] Un skill de design a été appelé, ou son absence est justifiée dans l'audit.
- [ ] La densité est choisie consciemment et justifiée.

**Tokens**

- [ ] Tous les design tokens ont une **valeur concrète** (pas « à voir plus tard »).
- [ ] Aucun `{{PLACEHOLDER}}` résiduel.
- [ ] La palette couvre tous les états : default, hover, active, disabled, error, success, warning, info.
- [ ] La palette n'est pas une palette par défaut (`#3B82F6`, `#6B7280`, `#EF4444`).
- [ ] Le fond n'est pas du blanc pur non choisi.
- [ ] L'échelle typographique a un ratio réel entre ses niveaux — pas une échelle uniforme.
- [ ] L'ombre n'est pas le séparateur par défaut ; les cartes ne sont pas systématiques.

**Composants**

- [ ] Chaque composant primitif a ses variantes, tailles, états et slots documentés.
- [ ] Les composants sont exhaustifs pour le périmètre du PRD.

**Navigation** — cf. `references/module-prioritization.md`

- [ ] La navigation est définie pour desktop ET mobile.
- [ ] **Chaque entrée porte un score de fréquence, un score de centralité et une justification d'une phrase.**
- [ ] L'ordre suit la fréquence de la boucle de travail, pas l'organigramme du domaine.
- [ ] La barre principale ne dépasse pas 5 items ; le reste est en overflow documenté.
- [ ] « Accueil » est premier **pour une raison** explicitée.
- [ ] Aucun module vide n'occupe un slot.
- [ ] L'ordre est enregistré via `state.js set-nav` et lisible dans `state.json`.
- [ ] Chaque entrée de navigation renvoie à au moins un écran existant.

**Grille**

- [ ] La grille et les layouts couvrent tous les cas d'usage identifiés dans le PRD.
- [ ] Les animations et transitions sont nommées et tokenisées.

## `design/screens/<nom>.md` (Phase 3.4)

- [ ] Le fichier est généré depuis `templates/screen.md.tmpl`, dans `.forge/design/screens/`.
- [ ] **Les 9 états** sont décrits avec un rendu concret (vide, chargement, rempli, vide-données, erreur chargement, erreur soumission, succès, hors-ligne/permissions, lecture seule).
- [ ] Une colonne vide n'est tolérée pour aucun état.
- [ ] L'arbre de composants est complet, pas seulement les composants principaux.
- [ ] Chaque élément interactif a événement → comportement → feedback visuel → état résultant.
- [ ] Le responsive est défini à **chaque** breakpoint du design system.
- [ ] L'accessibilité est chiffrée (contrastes, focus, ARIA, alternatives textuelles).
- [ ] La section Anti-générique est cochée **et justifiée**.
- [ ] Chaque ID B*/E*/C* de l'écran apparaît avec l'endroit où il est visible.
- [ ] L'écran est rattaché à un rang de navigation cohérent avec `state.json → index.nav`.

## `architecture.md` (Phase 4)

- [ ] Chaque user story du PRD a une slice correspondante.
- [ ] Chaque slice a une responsabilité nommable en une phrase.
- [ ] **L'ordre des modules suit `references/module-prioritization.md`**, et chaque module porte un rang, un score de fréquence et une justification.
- [ ] Les fondations transverses sont identifiées et correctement isolées (pas de slice qui fait de l'auth).
- [ ] Tous les modèles de données sont définis champ par champ (pas résumés).
- [ ] Tous les endpoints API listent leurs codes d'erreur exhaustivement (pas juste 200 et 500).
- [ ] Le graphe de dépendances est vérifié (pas de cycle) — `dependency-check.js check` sans erreur.
- [ ] L'ordre d'implémentation topologique est calculé et persisté (`--write`), pas inventé.
- [ ] Les décisions d'architecture non triviales sont documentées en ADR.
- [ ] La structure de dossiers cible est définie.
- [ ] La conformité aux standards de `.forge/benchmarks.md` est vérifiée (`plan-validator`).

## `implementation-plan.md` (Phase 5)

- [ ] Le plan référence explicitement ses sources (PRD, architecture, design, conventions).
- [ ] Chaque ID B*/E*/C* du périmètre de la slice apparaît dans le tableau de traçabilité.
- [ ] Les contrats de données sont du code réel, pas de la prose.
- [ ] Chaque règle à branches multiples a son algorithme en pseudocode/code.
- [ ] La section "Pièges à éviter" contient de vrais pièges liés à des IDs précis, ou dit explicitement qu'il n'y en a pas.
- [ ] La checklist de tâches couvre toutes les phases (données → métier → UI → intégration → tests).
- [ ] Les critères d'acceptation sont vérifiables individuellement et liés aux IDs B*/E*/C*.
- [ ] Le plan de tests ($11 du plan) couvre tous les IDs avec des scénarios concrets.
- [ ] Les vérifications Chrome MCP sont listées écran par écran.
- [ ] `node "$FORGE/scripts/coverage-check.js" slice <anchor> <slice>` renvoie `pass: true`.
- [ ] `node "$FORGE/scripts/forge-guard.js" placeholders <anchor>` ne signale rien.
- [ ] `node "$FORGE/scripts/state.js" check-stale <anchor> <slice>` renvoie `stale: false`.

## `test-plan.md` (Phase 6)

- [ ] La pyramide des tests est définie (unitaires, composants, intégration, E2E, UI).
- [ ] Chaque type d'ID (B*, E*, C*) a une obligation de couverture.
- [ ] Les tests des fondations sont planifiés avant toute slice métier.
- [ ] La suite de régression est documentée avec sa commande.
- [ ] Les vérifications Chrome MCP sont listées écran par écran.
- [ ] Les environnements de test sont définis avec leurs variables.

## Sortie de Fast Track (Phases 4-5 automatisées)

- [ ] Toutes les conditions d'entrée étaient satisfaites au démarrage.
- [ ] Chaque artefact est passé par les scripts **et** par les sous-agents validateurs.
- [ ] Aucun artefact n'a dépassé 2 tentatives de révision.
- [ ] Aucun `BLOCK` n'a été contourné.
- [ ] `forge-guard.js all` ne signale rien.
- [ ] Chaque artefact est `approved` dans `state.json` **et** dans son front matter (pas de divergence).
- [ ] `run.fast_track.checkpoint_reached` est vrai.
- [ ] Toutes les validations sont journalisées dans `.forge/audit/run-log.jsonl`.

## Validation post-implémentation (Phases 7, 8)

- [ ] Lint sans erreur.
- [ ] Typecheck clean.
- [ ] Tous les tests unitaires passent.
- [ ] Tous les tests de composants passent.
- [ ] Tous les tests d'intégration passent.
- [ ] Tous les tests E2E passent.
- [ ] Chrome MCP : pas de régression visuelle.
- [ ] Chaque critère d'acceptation du plan a été vérifié.
- [ ] La traçabilité (IDs) est complète.
- [ ] `forge-guard.js all` ne signale rien.
- [ ] `state.json` est à jour et sans divergence avec les front matters.
- [ ] Le journal d'incidents `.forge/audit/issues.md` est à jour.
