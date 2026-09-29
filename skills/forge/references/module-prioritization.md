# Priorisation des modules et de la navigation

## Le problème que cette règle résout

Une organisation de modules dictée par la **taxonomie de l'organisation** (« on a des locataires, donc un module Locataires ; on a des logements, donc un module Logements ») produit une navigation illisible : sept entrées, aucune hiérarchie, et les trois actions que l'utilisateur fait dix fois par jour sont reléguées en fin de liste.

La navigation se lit de gauche à droite ou de haut en bas : **la position est une déclaration de priorité**. L'ordre n'est donc jamais un hasard — il doit être justifié par la fréquence d'usage et la centralité dans les tâches.

> **Règle** : l'ordre de la navigation suit la **fréquence de la boucle de travail**, pas l'organigramme du domaine.

---

## Étape 1 — Identifier l'archétype

L'archétype conditionne tout le reste (modèle de navigation, nombre d'items, plateau de priorité). Voir `references/archetypes.md`.

| Archétype | Modèle de nav typique | Plateau |
|---|---|---|
| `mobile_field_ops` | bottom nav 3–5 | Le terrain, hors-ligne, gestes rapides |
| `mobile_consumer` | bottom nav 3–5 | Rythme de vie, découverte, engagement |
| `marketplace` | bottom nav 3–5 + filtres | Recherche, Mise en relation, Transactions |
| `dashboard` | sidebar | Surveillance, alertes, drill-down |
| `admin_crud` | sidebar, arbre | Back-office, densité, raccourcis |
| `transactional_web` | topbar + étapes | Tunnel guidé, conversion |
| `booking` | bottom nav 4–5 | Réservation,Wallet, Historique |

Stocker dans `state.json` : `product.archetype`.

---

## Étape 2 — Mesurer fréquence × centralité

Pour **chaque** fonctionnalité du PRD, noter deux notes de 1 à 5 :

- **Fréquence** — à quelle fréquence l'utilisateur cible fait cette action ?
  `1` mensuel · `2` hebdo · `3` quotidien/hebdo selon le métier · `4` plusieurs fois par jour · `5` **boucle principale, opened par défaut au lancement**

- **Centralité** — à quel point la tâche structure le reste du travail ?
  `1` accessory · `3` important mais différable · `5` **bloque ou conditionne d'autres tâches**

Deux ethnogrammes valent mieux qu'un score unique :

| Axe | Question | Effet |
|---|---|---|
| Fréquence | Combien de fois **par jour** dans la boucle principale ? | Priorité 1, bottom nav |
| Centralité | La tâche conditionne-t-elle d'autres tâches ? | Priorité 1, doit être accessible en 1 saut |

**Règle de score** : `score = fréquence × centralité`. Le score sert à **classer**, pas à **décider seul** — un module peu fréquent mais structurant reste haut s'il ouvre la boucle (l'accueil d'un back-office, par exemple).

---

## Étape 3 — Appliquer les règles d'ordonnancement

1. **Un module qui ouvre la boucle principale d'abord.** L'écran d'accueil « tableau de bord » n'est premier que s'il est réellement le point de départ quotidien. Sinon, l'entrée la plus fréquente passe premier. *« Accueil » n'est pas premier par défaut — il l'est parce qu'il est le plus utilisé.*
2. **Une opération répétitive est deuxième.** Ce que l'utilisateur saisit ou consulte plusieurs fois par jour mérite une position haute, même si ce n'est pas le cœur du produit.
3. **Les entrées de cycle de vie ensuite.** Créer, modifier, clôturer un objet métier (un contrat, une commande, une intervention) arrive après les actions récurrentes, mais avant les paramètres.
4. **La configuration est toujours en fin de liste**, et ne passe jamais dans la navigation principale si elle est peu utilisée.
5. **Une navigation par défaut doit tenir en une portée de pouce.** Maximum **5 items principaux** en bottom nav. Le reste part dans un overflow (« Plus », kebab menu, tiroir).
6. **Aucun module vide.** Un module qui n'a aucune user story n'occupe pas de slot.
7. **Découper plutôt que d'empiler.** Si deux modules se suivent partout, ce sont deux facets d'un seul module.

---

## Étape 4 — Écrire la justification

Chaque item porte sa raison. Sans justification, l'ordre est arbitraire et le prochain intervenant le cassera.

| Champ | Contenu |
|---|---|
| `key` | Identifiant technique du module |
| `label` | Libellé affiché (1–2 mots, pas de phrase) |
| `rank` | Position, à partir de 1 |
| `frequency` | Score 1–5 **et** libellé (`quotidien`, `hebdomadaire`…) |
| `task_criticality` | Score 1–5 |
| `rationale` | Une phrase : pourquoi ici, et pas ailleurs |

---

## Étape 5 — Enregistrer

L'ordre devient un **livrable vérifiable**, pas un conseil :

```bash
node scripts/state.js set-nav <anchor> '{
  "archetype": "mobile_field_ops",
  "platform": "ios,android",
  "core_loop": "consulter l état, saisir une entree/sortie, agir sur un contrat",
  "items": [
    { "key": "accueil",   "label": "Accueil",  "rank": 1, "frequency": 5, "task_criticality": 5, "rationale": "..." },
    { "key": "finance",   "label": "Finance",  "rank": 2, "frequency": 5, "task_criticality": 4, "rationale": "..." },
    { "key": "contrats",  "label": "Contrats", "rank": 3, "frequency": 3, "task_criticality": 4, "rationale": "..." }
  ]
}'
```

Le script **refuse** plus de 5 items principaux, et journalise le dépassement.

---

## Exemple worked — gestion locative (mobile)

Produit : gestion locative pour un bailleur avec plusieurs lots.

**Boucle de travail** : le matin, le bailleur consulte l'état de son portefeuille, saisit les entrées et sorties du jour, puis agit sur un contrat qui arrive à échéance ou signale un impayé.

| Module | Fréq. | Centralité | Score | Verdict |
|---|---|---|---|---|
| Accueil (tableau de bord) | 5 | 5 | 25 | Ouvre la boucle. **Rang 1** |
| Finance (entrées / sorties) | 5 | 4 | 20 | Saisie quotidienne, validée de l'aube au soir. **Rang 2** |
| Contrats | 3 | 4 | 12 | Événementiel mais structurant : échéances, reconductions, impayés. **Rang 3** |
| Locataires | 3 | 2 | 6 | Consultation, création peu fréquente. **Rang 4** |
| Logements / Lots | 2 | 2 | 4 | Stable, peu de mouvement. **Rang 5** |
| Maintenance / Tickets | 2 | 2 | 4 | Réactif. **Rang 4 (menu secondaire)** |
| Paramètres | 1 | 1 | 1 | **Overflow** — jamais dans la barre principale |

**Navigation obtenue** :

```
bottom nav  :  Accueil · Finance · Contrats · Locataires · [Plus]
overflow     :  Logements · Maintenance · Paramètres
```

Ce qui distingue une navigation correcte d'une navigation générique : **Finance est en position 2** parce que c'est l'action la plus répétée, et **Locataires est en position 4** parce que créer un locataire est un événement, pas une boucle. Un découpage « par objet métier » aurait mis Locataires en 1 et Finance en 5.

---

## Checklist de gate

- [ ] L'archétype est identifié et écrit dans `state.json` (`product.archetype`).
- [ ] Chaque module a un score de fréquence et un score de centralité, tous deux justifiés.
- [ ] L'ordre des entrées de navigation suit la fréquence de la boucle, pas l'organigramme.
- [ ] L'entrée qui ouvre la boucle principale est au rang 1 — et c'est justifié, pas subi.
- [ ] Aucune opération quotidienne n'est reléguée en fin de liste.
- [ ] La barre principale ne dépasse pas 5 items ; le reste est explicitement en overflow.
- [ ] Aucun module vide (sans user story) n'occupe un slot.
- [ ] Chaque item porte une justification d'une phrase.
- [ ] L'ordre est enregistré via `state.js set-nav` et lisible dans `state.json`.
- [ ] Chaque item de navigation renvoie à au moins un écran existant dans `.forge/design/screens/`.
