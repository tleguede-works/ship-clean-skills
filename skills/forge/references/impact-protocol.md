<!-- forge:form — ce document est un formulaire à remplir, pas un livrable. Ses
     {{PLACEHOLDER}} sont voulus ; `scripts/validate-repo.js` les exempte. -->

# Protocole d'analyse d'impact

Ce protocole s'applique à **toute modification demandée par l'utilisateur** après qu'un document a été validé (PRD, roadmap, design, architecture, plan d'implémentation). Ne jamais appliquer un changement sans cette analyse.

## Quand déclencher l'analyse

L'analyse d'impact est obligatoire quand la demande de l'utilisateur concerne :
- L'ajout, la modification ou la suppression d'une fonctionnalité.
- La modification d'une règle métier.
- Le changement d'une interface ou d'un écran.
- La modification d'un modèle de données ou d'un contrat API.
- Le changement de scope (MVP, V1, V2).
- La modification d'une contrainte.
- Un changement de stack technique.

L'analyse n'est pas nécessaire pour :
- Une question d'information.
- Une correction orthographique.
- Une clarification sans changement de fond.

## Protocole en 4 étapes

### Étape 1 — Identifier le changement primaire

Qu'est-ce qui change exactement ? Formuler en une phrase :
- "L'utilisateur veut supprimer la fonctionnalité X"
- "L'utilisateur veut ajouter une règle métier : quand Y alors Z"
- "L'utilisateur veut modifier l'écran A pour afficher B au lieu de C"

### Étape 2 — Cartographier l'impact

Parcourir systématiquement cette grille :

| Dimension | Questions | Impact |
|---|---|---|
| **Règles métier** | Quelles B* sont créées, modifiées, supprimées ? | {{LISTE}} |
| **Edge cases** | Quels E* sont créés, modifiés, supprimés ? | {{LISTE}} |
| **Contraintes** | Quelles C* sont affectées ? | {{LISTE}} |
| **User stories** | Quelles US sont modifiées ? | {{LISTE}} |
| **Interfaces** | Quels écrans doivent être modifiés ? | {{LISTE}} |
| **Modules/Slices** | Quelles slices doivent être retouchées ? | {{LISTE}} |
| **Dépendances** | Quelles autres slices dépendent de ce qui change ? | {{LISTE}} |
| **Modèles de données** | Quelles entités/champs sont modifiés ? | {{LISTE}} |
| **API** | Quels endpoints sont modifiés ? | {{LISTE}} |
| **Tests** | Quels tests existants seront cassés ? | {{LISTE}} |
| **Documents** | Quels documents doivent être mis à jour (PRD, architecture, roadmap...) ? | {{LISTE}} |

### Étape 3 — Évaluer la sévérité

| Niveau | Description |
|---|---|
| **Localisé** | Le changement affecte une seule slice, pas de dépendances externes. |
| **Modéré** | Le changement affecte 2-3 slices ou modifie une interface partagée. |
| **Majeur** | Le changement affecte 4+ slices, ou modifie une fondation, ou impacte la roadmap. |
| **Structurel** | Le changement redéfinit une partie du produit, modifie le MVP, ou change la stack. |

### Étape 4 — Présenter à l'utilisateur

Présenter le résumé d'impact AVANT d'appliquer le changement. Format :

```
📋 Analyse d'impact : {{DESCRIPTION DU CHANGEMENT}}

Sévérité : 🔴 structurel / 🟠 majeur / 🟡 modéré / 🟢 localisé

Fonctionnalités affectées :
  - B2 (modifiée) : nouvelle règle → "quand X alors Y"
  - B5 (supprimée) : l'ancienne règle ne s'applique plus

Interfaces à modifier :
  - Écran "Profil" : nouveau champ à ajouter
  - Écran "Paramètres" : suppression du bouton X

Slices à retoucher :
  - user-profile (modification)
  - user-settings (modification)
  - admin-dashboard (dépend de user-profile)

Dépendances en cascade :
  - admin-dashboard dépend de user-profile → sera impacté

Tests à modifier :
  - 3 tests unitaires de user-profile
  - 1 test E2E du flow d'onboarding

Documents à mettre à jour :
  - PRD : §4 règles métier, §6 edge cases
  - Architecture : §4.1 User entity
  - Plan user-profile : $2 contrats de données, $3 algorithme B2
  - Roadmap : pas d'impact sur le scope

Risques :
  - ⚠️ Le test E2E d'onboarding référence l'ancien comportement → à mettre à jour
  - ⚠️ Si la migration des données existantes est nécessaire → impact supplémentaire

Confirmer le changement ?
```

Ne jamais appliquer le changement sans un "oui" ou "c'est bon" explicite.

## Après application

Une fois le changement appliqué :
1. Mets à jour le document source (PRD, architecture, design...).
2. Propage les conséquences dans tous les documents listés.
3. **Marque chaque document impacté `stale`** — un plan fondé sur une règle modifiée n'est pas « à jour », il est faux :
   `node "$FORGE/scripts/state.js" set-status <anchor> deliverable <clé> stale`
4. **Recalcule le hash des documents modifiés** pour que la dérive soit détectable :
   `node "$FORGE/scripts/state.js" hash <anchor> <clé>`
5. Trouve les slices dépendantes devenues invalides :
   `node "$FORGE/scripts/state.js" check-stale <anchor> <slice>`
6. Vérifie la cohérence globale :
   `node "$FORGE/scripts/dependency-check.js" check <anchor> --full --write`
   puis `node "$FORGE/scripts/forge-guard.js" all <anchor>`
7. Signale tout ce qui est devenu incohérent ou stale.
8. Propose de lancer `scripts/coverage-check.js slice` sur les slices affectées.
9. Journalise l'incident : `node "$FORGE/scripts/state.js" log <anchor> impact_change "<résumé>" phase=<n>`

## Changements en cascade

Si l'utilisateur demande un deuxième changement avant que le premier et toutes ses conséquences ne soient propagés :
1. Termine d'abord la propagation du premier changement.
2. Puis seulement analyse le deuxième.
3. Ne cumule jamais les analyses d'impact — une à la fois.

## Règle d'or

> **Mieux vaut une analyse d'impact refusée par l'utilisateur ("c'est bon, je sais, applique") qu'un changement appliqué sans analyse qui crée un problème silencieux trois phases plus tard.**
