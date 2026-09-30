# Forge Labs — banc d'essai grandeur nature du skill `forge`

Ce dossier n'est pas un produit. C'est le **terrain d'essai** utilisé pour
exécuter le skill `forge` de bout en bout, sur trois projets suffisamment
différents pour éprouver ses phases, et pour remonter les défauts qu'une
exécution réelle révèle.

## Les trois projets

| Dossier | Produit | Archétype | Ce qu'il éprouve |
|---|---|---|---|
| `bi-dashboard/` | Amberline — vues et dashboards BI | `dashboard` | Densité, hiérarchie KPI → signal → détail, anomalies, drill-down |
| `shopify-mobile/` | Onduleur — app mobile Shopify | `mobile_consumer` | Navigation par fréquence, pouce, hors-ligne, stores partenaires |
| `gestion-locative/` | Bailly — gestion locative | `rental_tenancy` | Argent, échéances, horloge, invariants comptables, mois de longueur variable |

Chaque projet contient **un `.forge/` complet** : les livrables des Phases 0 à 6,
l'état, le journal d'audit. **Aucune implémentation** — le test s'arrête au plan.

## Méthode

1. Chaque projet est initialisé par `state.js init` et conduit phase par phase.
2. À chaque point où le skill demande un arbitrage humain, un **sous-agent joue
   le demandeur** : il répond, conteste, hiérarchise, valide ou refuse.
3. À chaque gate, les garde-fou déterministes sont lancés **avant** la présentation :
   `forge-guard all` et `consistency-check all`.
4. Quand un contrôle échoue, on ne contourne pas dans le projet : on cherche la
   cause dans le skill, on corrige le skill, on reprend au bon endroit, on
   revalide.
5. Un projet au moins passe par **Fast Track** (Phases 4-5 automatisées), afin
   de vérifier que les livrables produits par cette voie sont équivalents à
   ceux du parcours normal.

## Ce qu'on produit ici

| Livrable | Où |
|---|---|
| Les trois projets complets (Phases 0-6) | `<projet>/.forge/` |
| L'historique des problèmes et des corrections | [`INCIDENTS.md`](INCIDENTS.md) |
| Les corrections apportées au skill | `skills/forge/**`, via des pull requests |

## Avertissement sur ces fichiers

Ce sont des **sorties de test**, pas des sources. Deux choses y sont
volontairement laissées telles quelles :

- `.forge/state.json` contient un `project.path` absolu, propre à la machine
  qui a produit le fichier ;
- les documents citent des produits de référence, des endpoints et des versions
  qui n'ont pas été exécutés. Rien ici n'a été implémenté, et rien n'a été
  vérifié contre une source externe.