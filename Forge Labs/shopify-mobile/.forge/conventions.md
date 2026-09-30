---
type: conventions
status: draft
generated_at: 2026-09-30
---

# Conventions techniques — Onduleur

> Document unique. Tous les plans d'implémentation (Phase 5) y font référence plutôt que de reformuler ces règles.
> Ce document démarre en Phase 0 avec ce qui est connu, s'enrichit en Phase 4, et peut être amendé à tout moment.
> Toute règle vague (« gestion d'erreur cohérente ») doit être reformulée en règle concrète avant validation.
> Les sections marquées `À DÉCIDER EN PHASE 4` seront complétées lors de la conception de l'architecture.

---

## Stack technique cible

<!--
  Deux marqueurs, et ils ne veulent pas dire la même chose.

  `À DÉCIDER EN PHASE 4`        la décision peut attendre la Phase 4. C'est le
                             cas de la plupart des choix internes (state
                             management, bibliothèque de formulaires) : ils se
                             déduisent de l'architecture, et les changer ne
                             coûte rien.

  `À DÉCIDER AVANT LA PHASE 1`  la décision engage quelque chose qu'on ne
                             reprend pas : le fournisseur d'identité, le mode
                             d'hébergement, l'achat d'un service, l'exécution
                             de fond. Elle se tranche pendant l'interview,
                             parce que la réponse change ce qu'on achète et ce
                             qu'on héberge — pas seulement le code.

  Une case bloquante écrite `À DÉCIDER EN PHASE 4` est INDISCERNABLE d'une case
  différable, et personne ne la voit avant la Phase 4 — quand il est trop tard.
  `forge-guard state` échoue sur toute case `AVANT LA PHASE 1` encore présente,
  et signale celles qui subsistent après la Phase 4.
-->

| Domaine | Choix | Version | Justification |
|---|---|---|---|
| Langage | TypeScript, mode `strict` | dernier stable, épinglé | Une équipe de deux qui maintient deux langages passe son temps à translater des bugs au lieu de les corriger. L'application, la fonction de webhooks et le back-office partagent le même langage. |
| Framework | Expo (React Native) en **development build**, jamais Expo Go · Expo Router pour la navigation par fichiers | dernier SDK stable, épinglé dans `package.json` | Ni chaîne native Xcode/CocoaPods, ni routeur à configurer à la main. Le development build est le seul moyen d'avoir les notifications push et le secure store sans réécrire le projet en bare React Native. |
| Identity provider | Supabase Auth — email + mot de passe avec confirmation par email | — | Source d'identité unique et nommée, exigée par la règle *fail-closed*. La source d'identité est le `user_id` de Supabase Auth : un compte sans correspondance Shopify confirmée n'accède **qu'au catalogue**, et rien d'autre. Un défaut de correspondance est un refus, jamais un accès accordé par défaut. |
| Stratégie de session | Access token court + refresh token · **secure store** (Keychain / Keystore via `expo-secure-store`), **jamais `AsyncStorage`** · rafraîchissement au retour au premier plan au-delà de 15 min · la déconnexion explicite révoque le refresh token côté serveur | — | `AsyncStorage` est lisible par un appareil compromis ; le secure store ne l'est pas. La révocation côté serveur est ce qui rend la déconnexion effective plutôt que cosmétique. |
| Base de données | PostgreSQL managé (Supabase, région UE) | — | Elle ne contient que **quatre** choses : correspondance compte ↔ client Shopify, jetons de push et consentements, favoris, produits récemment vus. Tout est rattaché au compte, donc un client qui change de téléphone retrouve sa liste. |
| ORM / Query builder | À DÉCIDER EN PHASE 4 | — | Se déduit de l'accès direct à Postgres pour les correspondances, et de l'absence de miroir catalogue. |
| Exécution de fond | **Aucun.** Une seule fonction serverless réveillée par un webhook Shopify, qui envoie une notification push via le service Expo, protégée par une table d'idempotence | — | Shopify rejoue ses webhooks : sans table d'idempotence, le même événement notifie deux fois. Une file de messages est de l'infrastructure pour deux personnes ; si le volume la rend nécessaire, c'est une décision de version 2. |
| State management | À DÉCIDER EN PHASE 4 | — | |
| Formulaires | À DÉCIDER EN PHASE 4 | — | Aucun formulaire de paiement n'existe en v1 : le panier se construit chez nous et la main est tendue au checkout Shopify. |
| Validation | À DÉCIDER EN PHASE 4 | — | |
| HTTP client | À DÉCIDER EN PHASE 4 | — | La règle « un fait, un seul endroit » impose que le prix affiché vienne de la même fonction partout : c'est une contrainte d'architecture, pas de bibliothèque. |
| Styling | À DÉCIDER EN PHASE 4 | — | |
| Composants UI | À DÉCIDER EN PHASE 4 | — | |
| Icônes | À DÉCIDER EN PHASE 4 | — | |
| Tests unitaires | Jest, preset `jest-expo` | — | C'est ce que la chaîne Expo teste réellement ; un runner plus rapide mais moins bien intégré nous ferait perdre plus de temps qu'il n'économise. |
| Tests composants | React Native Testing Library | — | Toute règle métier — disponibilité, éligibilité au réassort, correspondance compte-client — se teste en unitaire, **avec un test qui échoue quand on casse la règle**. |
| Tests E2E | **Maestro, en local, sur le development build. Aucun runner en intégration continue, aucun parc d'appareils.** | — | C'est le seul test qui traverse les écrans, la navigation et la redirection vers Shopify ; les tests de composants rendent un état, pas un trajet. Pas de runner en CI parce que C11 rend la publication manuelle : un test qui vise un build publié ne peut pas être un portail de fusion. |
| Test d'intégration bout-en-bout sur un prestataire de paiement | **Sans objet en v1** | — | Aucun paiement ne se fait dans l'application en version 1 : l'application ne voit jamais un numéro de carte. Le point redevient `À DÉCIDER` le jour où un paiement entre dans l'application. |
| Lint | Biome | — | Un seul outil pour le lint et le format : deux configurations qui dérivent l'une de l'autre produisent exactement le désaccord de style qu'on ne veut pas payer en revue. |
| Format | Biome | — | Idem. |
| Package manager | pnpm | — | Un seul lockfile, installations rapides : moins de conflits de dépendances pour deux développeurs. |
| Crash reporting | Sentry | — | Dans une application grand public, le crash silencieux est le mode de panne le plus cher qui soit. « On ne sait pas » n'est pas une stratégie. |
| Audit produit | PostHog, hébergé en UE | — | Il faut pouvoir répondre à « est-ce que l'application sert à quelque chose », et un outil qui exige de transporter la donnée client hors d'Europe n'est pas acceptable. |
| Builds | EAS Build · EAS Update pour toute modification JavaScript | — | À deux développeurs, la pull request est l'unique filet de sécurité, et la prévisualisation déployée fait partie de la revue. |

---

## Ce qui est exclu, et sans transaction

| Exclu | Pourquoi |
|---|---|
| Kubernetes, swarm, machine virtuelle maintenue à la main | Au-delà d'une fonction serverless et d'une base managée, tout ce qu'on ajoute est une seconde chose à réveiller à trois heures du matin, et un budget dépassé. **Rejeté en séance.** |
| Redis, RabbitMQ, Kafka | Le seul flux asynchrone est un webhook Shopify ; il tient dans une table d'idempotence. |
| Firebase | Un quatrième fournisseur pour l'identité, l'audit et le stockage alors que l'identité et les données sont déjà payées chez Supabase — avec en prime un transfert de données hors UE. |
| Redux | Le surcoût de boilerplate sur chaque écran est ce que deux développeurs ne peuvent pas absorber. |
| Base vectorielle, modèle de recommandation | La recommandation est un jeu de règles écrit par le marchand, et c'est définitif en v1. |
| Service de feature flags | Une colonne dans notre PostgreSQL, ou le système d'updates d'Expo. |
| Module natif écrit à la main pour un détail d'interface | Une fonctionnalité qui exige du natif est une sortie planifiée, pas un correctif d'urgence. |
| Duplication du catalogue dans un index de recherche externe | La recherche s'appuie sur la recherche Shopify. Si elle est jugée insuffisante en Phase 2, on en reparle comme une décision, pas comme un ajout. |

---

## Contraintes non négociables

| # | Contrainte | Conséquence directe |
|---|---|---|
| C1 | Budget d'hébergement plafonné à une cinquantaine d'euros par mois | Une proposition qui le dépasse revient avec une conception moins chère, pas avec une facture plus haute. |
| C2 | Donnée client en **région UE** | Héberger la base ou les logs hors UE n'est pas un arbitrage technique, c'est une décision CNIL. |
| C3 | **Aucun paiement dans l'application en v1** | Le panier se construit chez nous, la main est tendue au checkout Shopify. L'application ne voit jamais un numéro de carte. |
| C4 | Catalogue consultable **sans compte** ; compte exigé pour l'historique, les adresses et les favoris | Le premier écran doit être utile déconnecté, et aucune rétention ne peut être posée sur l'authentification. |
| C5 | Interface en français, une seule langue, **sans couche i18n en v1** | Le deuxième marché déclenche la décision, pas avant. |
| C6 | Fiche produit et accueil utiles **en moins de deux secondes sur 4G** ; un réseau lent produit du **contenu partiel affichable**, pas un spinner pleine page | L'accueil ne peut pas enchaîner des requêtes séquentielles sur son premier rendu, et chaque écran a un état de chargement partiel réel. |
| C7 | **Un affichage vide n'est jamais un zéro** | Si une lecture échoue, l'écran dit « indisponible pour le moment » avec une action de réessai. Une panne réseau transformée en affirmation commerciale est le défaut le plus coûteux d'une application grand public. |
| C8 | Cache catalogue hors-ligne **en lecture seule**, et il affiche son âge | Toute écriture hors-ligne est exclue en v1. |
| C9 | RGPD de plein droit : consentement explicite et **révocable** avant toute mesure d'audience et avant tout push marketing ; **aucune donnée personnelle dans les événements analytiques** | Ni email, ni identifiant de commande, ni identifiant client dans un événement. Un événement qui transporte un email est une fuite de données, pas un détail de style. La désinscription supprime réellement la ligne. |
| C10 | iOS et Android, **format téléphone**, un seul marché | Le rendu tablette et la version web sont exclus. Un écran « responsive » livré en v1 est du travail jeté. |
| C11 | Toute modification **JavaScript** part par mise à jour à chaud (EAS Update) ; toute modification **native** est une publication soumise à revue | C'est la contrainte d'architecture la plus structurante : une fonctionnalité qui exige un natif est une sortie planifiée. |
| C12 | Accessibilité non négociable : cibles tactiles ≥ 44 pt, contraste conforme, texte qui suit le réglage système sans être tronqué | Un utilisateur qui grossit la police ne doit pas perdre le bouton d'achat. C'est vérifiable, donc ça se teste. |

---

## Structure de dossiers cible

```
app/                        # Expo Router : le routage EST la structure
  (tabs)/                   # les quatre onglets
    _layout.tsx
    index.tsx               # accueil — écran de ré-entrée
    recherche.tsx
    commandes.tsx
    compte.tsx
  produit/[handle].tsx      # fiche produit
  produit/[handle]/[variant].tsx
  commande/[id].tsx         # suivi de commande
  commande/[id]/retour.tsx
  _design/                  # tokens et primitives, importés par tout le monde
src/
  api/                      # clients : shopify.storefront, shopify.admin, supabase
  regles/                   # règles métier pures, testables en unitaire
    disponibilite.ts
    reassort.ts
    correspondance-compte-client.ts
  composants/
  ecran/                    # un dossier par écran : logique + pièces
 Lie/                       # ce que l'application sait déjà sur le client
lib/                        # ce qu'elle ne sait pas encore
```

---

## Conventions de nommage

| Élément | Règle | Exemple |
|---|---|---|
| Fichier composant | PascalCase | `ProductCard.tsx` |
| Fichier service/utilitaire | camelCase | `disponibilite.ts` |
| Fichier de validation | camelCase, suffixe `Schema` | `checkoutSchema.ts` |
| Fichier de test | `<nom>.test.ts` collé au fichier testé | `disponibilite.test.ts` |
| Routes / URLs | segments en minuscules ; le `handle` Shopify fait foi | `/produit/chaussures-hiver` |
| Props de composant | `interface` nommé, jamais `type` en ligne | `interface ProductCardProps` |
| Fonctions | verbe + objet, une responsabilité | `calculerReassort(produit)` |
| Constantes | `SCREAMING_SNAKE_CASE` | `DUREE_SESSION_MIN` |

---

## Conventions de code

### Typage

- `strict` sans exception. `any` est interdit ; `unknown` est le type d'erreur par défaut.
- Les unions discriminées plutôt que les booléens multiples : `state: 'value' | 'empty' | 'unavailable'` plutôt que `hasValue` + `isError`. « Un état absent n'est jamais un état faux ».

### Composants

- Un composant d'écran ne fait pas d'appel réseau : il lit un état et rend. La donnée vient de `src/regles/`, qui est pur et testé.
- Aucune logique de disponibilité, de réassort ou de correspondance dans un composant : ces trois règles sont testées en unitaire, donc elles vivent hors du composant.

### State management

À DÉCIDER EN PHASE 4.

### Formulaires

À DÉCIDER EN PHASE 4. Règle transverse déjà tranchée : **aucun formulaire ne saisit de donnée de paiement.**

### Data fetching

- Un fait, un seul endroit : le prix affiché vient de la même fonction que partout ailleurs.
- Le catalogue n'est **jamais** copié chez nous. Une lecture qui échoue rend un état d'indisponibilité avec sa date de dernière valeur connue — jamais un zéro, jamais une liste vide.

---

## Gestion d'erreur standard

### Erreurs réseau

```
Trois issues, jamais une liste vide ni un « 0 résultat » :
  - catalogue indisponible  → dernier catalogue connu, avec son âge affiché
  - commande illisible      → « indisponible pour le moment » + action de réessai
  - correspondance absente  → accès catalogue seul, compte signage au retour
Chaque écran a un état de chargement PARTIEL : l'accueil rend la recherche et
les rails même quand la commande en cours n'est pas encore revenue.
```

### Erreurs de validation

À DÉCIDER EN PHASE 4, avec la bibliothèque de formulaires.

### Erreurs serveur

```
Une fonction serverless, un webhook. Toute réponse à une action d'écriture
distingue : refus métier (l'utilisateur peut agir), indisponibilité (réessai),
et défaut du marchand (affiché tel quel, jamais masqué). Les deux derniers ne
sont jamais rendus par un même code.
```

---

## Stratégie de tests

### Tests unitaires

- Framework : Jest, preset `jest-expo`
- Pattern : une règle métier par fichier testé, entrée → sortie
- Règle : **chaque test doit échouer quand on casse la règle qu'il teste.** Un test qui passe pour la mauvaise raison occupe la place du test qui aurait trouvé le vrai défaut.
- Emplacement : collé au fichier, `src/regles/*.test.ts`
- Commande : `pnpm test`

### Tests de composants

- Framework : React Native Testing Library
- Pattern : rendu par un état, jamais par une séquence d'appels
- Mocking : la couche réseau est mockée ; **aucun** composant ne teste sa propre règle métier
- Commande : `pnpm test`

### Tests E2E

- Framework : **Maestro**, exécuté **en local** sur le development build — par `adb` ou `simctl`, en relisant le bundle JavaScript local
- **Aucun runner en intégration continue.** Un test qui vise un build publié ne peut pas être un portail de fusion, parce que la promotion vers le canal de production est une étape manuelle distincte et qu'une modification native met plusieurs jours à atteindre les appareils (C11). Un émulateur Android sur runner partagé n'est pas l'appareil, et il échoue assez souvent pour qu'une équipe de deux y passe ses soirées.
- Quand : l'auteur les exécute **avant d'ouvrir une pull request** qui touche `src/regles/`, la stratégie de session ou l'arborescence Expo Router, et il écrit le résultat dans la pull request. Les scénarios ne bloquent pas la fusion automatiquement.
- **Infrastructure de données de test, créée maintenant** — c'est elle, et non le runner, qui demande du temps calendaire : un *dev store* Shopify dédié et un projet Supabase de recette dédié, tous deux sur les paliers gratuits des fournisseurs déjà retenus, remplis par un script versionné dans le dépôt. Aucun scénario ne touche la production. Son contenu exact est `À DÉCIDER EN PHASE 4` : il dépend du catalogue du marchand, et le changer ne coûte rien.
- **Qui paie : personne.** Ni le runner, ni le magasin, ni le projet de recette ne sont un service payant.

**Périmètre — quatre scénarios, chacun arrêté à la frontière que nous possédons**

| # | Scénario | Où il s'arrête |
|---|---|---|
| 1 | **Achat jusqu'à la redirection Shopify** | On construit le panier, on vérifie qu'on part vers l'URL de checkout du bon panier. On n'affirme rien sur la suite : C3 interdit que l'application voie un numéro de carte, donc « la commande est créée » testerait Shopify et pas notre code. |
| 2 | **Connexion** | Un compte **confirmé** atteint l'onglet commandes ; un compte **non confirmé** ne voit que le catalogue. C'est l'assertion de *fail-closed* : elle passe au rouge dès qu'on ouvre l'accès par défaut. |
| 3 | **Commande en cours** | De la liste au suivi, **en incluant l'état « indisponible pour le moment »** et sa reprise, parce que c'est l'état qui casse vraiment en production, pas l'écran nominal. |
| 4 | **Lien profond** | La page produit partagée ouvre la bonne fiche, y compris à froid : c'est le chemin d'acquisition, et aucun autre test ne le parcourt. |

Au-delà de quatre, la suite cesse d'être exécutée et il faut la réécrire : **une suite que deux personnes ne lancent plus ne teste plus rien.**

**Ce qui n'est PAS couvert, nommé**

| Non couvert | Pourquoi |
|---|---|
| Notifications push et le tap qui ouvre la commande | Maestro ne pilote pas une notification réelle sur simulateur |
| Démarrage à froid et lecture du secure store | Nécessite un cold start instrumenté |
| Hors-ligne et âge du cache (C8) | On ne coupe pas le réseau d'un simulateur iOS de façon fiable |
| Rendu en moins de 2 s sur 4G (C6) | Aucun automate ne chronomètre |
| L'appareil réel | Simulateur ≠ téléphone : vrai clavier, vraies notifications, texte agrandi de C12 |

Le paiement n'est **pas** un trou : il est hors périmètre par C3.

**Ce qui remplace le rôle de portail de fusion**

| Remplacement | Ce qu'il couvre, et qu'aucun scénario ne voit |
|---|---|
| **Prévisualisation déployée sur chaque pull request**, ouverte sur un téléphone physique par l'auteur, avec le constat écrit dans la pull request | La classe de défauts qu'un émulateur ne couvre pas, à coût nul. C'est le geste de cinq minutes qui remplace le test refusé d'automatiser. |
| **Sentry**, rattaché à la révision exacte du JavaScript — chaque EAS Update est une release | Le crash qu'aucun scénario ne voit |
| **PostHog**, chaque chemin critique avec son entonnoir, relu à chaque version | Un E2E dit qu'un trajet a fonctionné **une fois** ; un entonnoir dit qu'il a cessé de fonctionner pour les gens réels — checkout lancé jamais terminé, commande ouverte abandonnée. Aucune automatisation ne voit cela, seule la mesure le voit. |

**Quand rouvrir la question** — comme une décision explicite, pas comme une ligne de configuration : si un module natif change le chemin de démarrage, si un cinquième chemin critique apparaît, ou si l'équipe passe au-delà de quatre personnes.

---

## Patterns retenus

| Pattern | Quand l'utiliser | Exemple |
|---|---|---|
| Union discriminée | Tout résultat de lecture | `{ state: 'value', value }` · `{ state: 'empty', reason }` · `{ state: 'unavailable', lastKnown, at }` |
| Cache en lecture seule avec âge | Toute donnée rejouée hors-ligne | Le catalogue, avec `at` affiché |
| Repli sur la dernière valeur connue | Toute panne de source | Un indicateur, une commande, un panier |
| Idempotence par table | Tout traitement de webhook | `webhook_shopify(shop, id)` en clé primaire |
| Page de partage qui ouvre la fiche | Toute acquisition | `/produit/[handle]`, hors-ligne, sans compte |

---

## Commandes

```bash
pnpm dev                      # expo start, development build
pnpm build                    # eas build
pnpm update                   # eas update — toute modification JavaScript
pnpm lint                     # biome check
pnpm format                   # biome format --write
pnpm typecheck                # tsc --noEmit
pnpm test                     # jest
pnpm e2e                      # maestro, en local, sur le development build
```

---

## Ce qui n'appartient PAS à ce document

Toute règle spécifique à une seule slice va dans le plan d'implémentation de cette slice, signalée comme déviation dans la section « Déviations par rapport à conventions.md ».

---

## Checklist de gate

- [ ] Toute décision (nommage, structure, gestion d'erreur, tests) est actionnable.
- [ ] La stack cible est entièrement spécifiée (framework, state, forms, HTTP, styling, tests).
- [ ] Le document ne contient aucune règle spécifique à une seule slice.
- [ ] Les commandes (dev, build, lint, test, e2e) sont documentées et fonctionnelles.
- [ ] Les trous de couverture E2E sont **nommés**, pas absents.
- [ ] Aucune section marquée `À DÉCIDER EN PHASE 4` ne subsiste après la Phase 4.

**Statut** : `draft` → enrichi à chaque phase, verrouillé en Phase 4.
