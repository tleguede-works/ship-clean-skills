# Stratégies de test — choisir la bonne famille

## Le critère de choix

Une seule question décide : **quelle propriété veux-je prouver ?**

| Propriété à prouver | Famille | Coût |
|---|---|---|
| Une fonction rend le bon résultat | unitaire | très faible |
| Deux composants s'accordent sur un contrat | intégration | faible |
| Un enchaînement métier produit un état juste | **scénario** | faible à moyen |
| Aucune séquence d'événements ne viole un invariant | **property-based / modèle** | faible |
| L'interface réelle fait ce que le scénario dit | E2E | **élevé** |
| Le service distant respecte le contrat | contrat (Pact) | moyen |

La erreur la plus courante est de payer le E2E pour une propriété que l'intégration prouve déjà. L'E2E est le plus lent, le plus instable et le moins informatif quand il échoue : « le test E2E a échoué » ne dit pas ce qui est faux.

---

## 1. Test unitaire

**Prouve** : une fonction, une entrée, une sortie.

Limite structurelle : il ne prouve pas que la fonction est **appelée**, ni dans le bon ordre. C'est exactement le trou que les scénarios couvrent.

## 2. Test d'intégration

**Prouve** : un adaptateur réel (SQL, HTTP, fichier) et le schéma font ensemble ce qu'on croit.

La valeur immense : c'est le seul niveau où les contraintes de base sont réellement **exécutées** — clés étrangères, `CHECK`, index uniques partiels, contraintes de domaine. Une suite verte contre une base en mémoire qui n'a pas les contraintes n'est pas une suite verte.

Un test de migration doit vérifier **ce que la migration apporte** — les données, pas le numéro de version. « Le test passe et ne vérifie rien » est le piège le plus coûteux : il a donné un faux sentiment de sécurité à un projet entier, sur le test de migration le plus important.

## 3. Scénario métier

**Prouve** : un cycle de vie complet, l'état accumulé, l'historique.

Le niveau qui manque le plus souvent, et le seul qui attrape les défauts d'ordonnancement. Détail dans `references/scenario-tests.md`.

## 4. Property-based et test de modèle

**Prouve** : un invariant tient pour *toute* une classe d'entrées, ou pour *toute* une séquence d'événements.

C'est la réponse mathématique au fait qu'on ne peut pas énumérer tous les ordres possibles. Trois formes :

| Forme | Bibliothèque type | Prouve |
|---|---|---|
| Property-based pur | `fast_check` (Dart), `fast-check` (TS), `hypothesis` (Python) | une propriété sur des entrées générées |
| Test de modèle stateful | `model_property_tester` (Dart), `fast-check` state machine | des **séquences** d'opérations, avec shrinking |
| Exhaustif en boucle | à la main | toutes les combinaisons d'un espace fini |

**Le test de modèle stateful est la famille la plus sous-utilisée et la plus rentable** pour un domaine métier. On génère des séquences aléatoires d'opérations, on compare le résultat à un modèle de référence simple, et le *shrinking* réduit automatiquement le contre-exemple à une suite minimale reproductible.

Quand l'espace est petit, l'exhaustif en boucle est aussi powerful et plus lisible : vérifier les 31 jours d'un mois dans les deux sens de débordement, les 56 combinaisons d'un allotted, chaque préfixe d'un jeu de 40 mouvements. C'est ce qu'un projet à argent a fait spontanément, et c'est un bon substitut au property-based.

> **Point d'attention.** Les règles de projet interdisent parfois explicitement le property-based testing au nom de la lisibilité. Ce n'est pas toujours justifié : la lisibilité se rattrape par un scénario lisible qui rejoue le contre-exemple minimal que *shrinking* a trouvé. Le critère n'est pas « lisible » mais « reproductible en trois commandes ».

## 5. E2E navigateur et appareil

**Prouve** : l'interface réelle, sur un vrai moteur de rendu, fait ce que le scénario décrit.

Coût élevé, instabilité élevée, diagnostic faible. À réserver à ce qui n'est prouvable autrement : navigation réelle, rendu, gestes, permissions OS, notifications push.

Ce qui le remplace souvent à moindre coût : des tests de composants sur le routeur complet avec une base réelle. Si l'échec concerne l'état, pas le rendu, l'E2E n'apporte rien.

## 6. Tests de contrat

**Prouve** : qu'un consommateur et un fournisseur s'accordent sur la forme, indépendamment du déploiement.

Utile quand le backend est un autre service : le contrat published est vérifié des deux côtés. Sans backend, la question ne se pose pas — et c'est un avantage : il n'y a rien à mocker.

## 7. Test de migration

**À part, parce que c'est là que les tests mentent le plus.**

Un test de migration qui vérifie `version == 3` passe et ne prouve rien. Ce qui compte : les **données** sont-elles là, dans le bon ordre, avec le bon contenu, après la migration ?

Et si la migration est destructive par choix, **l'assertion doit dire le contraire** : la perte est alors la propriété testée, pas un accident.

---

## Par stack

| Stack | Ce qui tourne sans appareil | Ce qui en exige un |
|---|---|---|
| **Flutter** | `flutter test` : unitaires, widgets, integration avec base en mémoire via FFI | E2E : `integration_test` + `flutter drive`, sur appareil/émulateur |
| **Node / TS** | `node --test`, `vitest`, `jest` — tout, y compris DB via conteneur ou SQLite embarqué | E2E navigateur : Playwright (télécharge son navigateur) |
| **Nest / Express + SQL** | `supertest` contre une base éphémère, tout le backend | rien pour le backend ; E2E si l'UI est critique |
| **React / Next** | `vitest` + Testing Library, y compris RSC avec l'environnement approprié | E2E navigateur |
| **Django** | `pytest` + `TestCase`/`TransactionTestCase` avec base de test | E2E : `LiveServerTestCase` + navigateur |
| **Spring** | `JUnit 5` + Testcontainers | rien pour le service |

**Le point commun utile** : pour la quasi-totalité des stacks, un scénario métier complet tourne en headless, sans appareil, en quelques secondes — **à condition d'avoir une horloge injectée** et un accès au port applicatif.

Le test E2E navigateur/appareil est le seul qui demande du matériel. Tout le reste est du logiciel.

---

## Pièges mesurés

| Piège | Symptôme |
|---|---|
| Un test qui passe pour la mauvaise raison | vert, mais la branche exercised n'est pas celle qu'on croit |
| Un attendu écrit de mémoire | l'assertion est fausse, le code est juste — et on « corrige » le code |
| Un test qui ne touche pas la ligne fautive | la couverture affiche un pourcentage, le défaut reste |
| Un test d'absence qui cherche un TYPE | il vérifie qu'un widget n'a pas été **construit**, pas qu'il n'est pas **affiché** |
| Une commande qui sort 0 sans rien faire | un drapeau déprécié ignoré en silence, un `replace` sans occurrence |
| Un test qui ne emprunte que le chemin nominal | la frontière n'est jamais franchie par un test |
| Une base de test sans contraintes actives | une suite verte sur un schéma que la production refuse |

---

## Checklist de gate

- [ ] Chaque famille retenue couvre une propriété **distincte** et non redondante.
- [ ] Aucun test E2E ne prouve une propriété que l'intégration prouve déjà.
- [ ] Les tests d'intégration tournent contre une base avec ses contraintes **réellement actives**.
- [ ] Les tests de migration vérifient les **données**, pas un numéro de version.
- [ ] Les tests d'absence distinguent « pas construit » de « pas affiché ».
- [ ] Aucun attendu n'est écrit de mémoire quand il pouvait être calculé.
- [ ] Le domaine étant temporel, il existe au moins un scénario de cycle complet.
- [ ] Aucun test n'attrape lui-même les défauts qu'il prétend couvrir.
