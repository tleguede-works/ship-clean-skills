---
type: architecture
status: approved
generated_at: 2026-09-30
derived_from: .forge/prd.md
---

# Architecture — Onduleur

> Ce document définit COMMENT le produit est structuré techniquement.
> Il transforme les besoins du PRD en modules, slices, fondations, modèles de données et contrats d'API.
>
> **Règle de granularité** : toute entité, tout champ, tout endpoint est documenté — pas résumé, pas échantillonné.

---

## 1. Vue d'ensemble

### 1.1 Stack technique

Les cases `À DÉCIDER EN PHASE 4` de `conventions.md` sont tranchées ici. La colonne « Version » porte la valeur lue sur le registre npm le 2026-09-30 : elle donne le point de repère, **le `lockfile` fait foi**, et la règle d'épinglage est la même pour toutes les lignes.

| Domaine | Choix | Version | Justification |
|---|---|---|---|
| Langage | TypeScript, mode `strict` | 7.0.2 | Déjà tranché par `conventions.md`. `conventions.md` ajoute la raison qui décide de l'architecture serveur : l'application, la fonction serverless et le script de remplissage de la recette partagent un seul langage, donc un `CHECK` écrit au § 4.10 et une assertion de test disent la même chose dans la même langue. |
| Framework | Expo (React Native) en **development build**, jamais Expo Go · Expo Router pour le routage par fichiers | expo 57.0.26 · expo-router 57.0.24 | Déjà tranché. Le **development build** est la seule façon d'avoir le secure store et un schéma d'URI personnalisé sans réécrire le projet ; `conventions.md` l'écrit et cette architecture en tire une conséquence : le schéma d'URI est posé **une fois** au premier build, donc il appartient à la fondation `chaine-publication` et non à une slice (C11 — ADR-8). |
| Base de données | PostgreSQL managé (Supabase, région UE) | 16 ou supérieur | Déjà tranché. Le DDL du § 4.10 n'utilise **aucune** fonctionnalité postérieure à PostgreSQL 13 (`gen_random_uuid()` est intégré depuis 13) : il s'exécute donc sur n'importe quel palier supporté, et le palier exact est celui du fournisseur, épinglé au premier `supabase db push`. |
| ORM / Query builder | **Drizzle ORM** (+ `drizzle-kit` pour les migrations) | drizzle-orm 0.45.3 · drizzle-kit 0.31.11 | Le § 4.10 écrit du SQL exécutable, et cette migration doit rester exécutable telle quelle : un ORM qui génère son propre DDL depuis des objets JavaScript produirait un schéma différent de celui qu'on a exécuté, et la preuve du § 4.10 porterait sur autre chose. Drizzle garde le SQL comme source de vérité tout en donnant des types de colonnes dérivés du même fichier. Alternative écartée : Kysely, qui n'apporte ici que le typage sans la chaîne de migrations ; Supabase-js en direct, qui est écarté pour une raison plus grave (ADR-1). |
| State management | **TanStack Query** pour l'état serveur · **Contexte React + `useReducer`** pour la session et le panier · `useState` local sinon | @tanstack/react-query 5.104.0 | L'application a deux états qui ne sont pas la même chose : la donnée du marchand (périssable, rejouable,annotée d'un âge — C8, B19) et l'état de session. TanStack Query porte le premier, avec sa sémantique de fraîcheur et son annulation au démontage, ce qui est exactement B18 et B7 ; un contexte + reducer ne sait rien de la péremption et le réinventer serait le réécrire. Le contexte ne porte que la session, qui est la seule donnée réellement globale et mutable. Redux est écarté par `conventions.md`. |
| Formulaires | **react-hook-form** + Zod | react-hook-form 7.89.0 · zod 4.6.5 | Le `design-system.md` impose la validation au **blur** et interdit un champ qui perd sa saisie à l'erreur ; react-hook-form gère le `touched`/`dirty` par champ sans état dérivé manuel. Zod est choisi **avec** react-hook-form et non à côté : `@hookform/resolvers` fait valider le même schéma dans l'écran et dans la fonction serverless, donc un champ invalide ne peut pas passer à côté du serveur. |
| Validation | **Zod** | zod 4.6.5 | Un seul langage de schéma pour l'application et la fonction serverless, et des schémas qui se reflètent dans les types des contrats d'API du § 5. C'est la condition pour que la règle « un fait, un seul endroit » s'applique aussi aux formes : le prix affiché et le prix refusé par le serveur sont lus par la même fonction. |
| HTTP client | **`fetch` natif enveloppé dans un client typé unique** (`src/api/http.ts`) | — (React Native 0.87.1) | Aucune bibliothèque : le `fetch` de React Native est natif, et ajouter une couche au-dessus coûte des kilo-octets sur le chemin critique de C6 pour des fonctions que TanStack Query fait déjà (annulation, nouvelle tentative, déduplication). Le client ne fait que trois choses, et qu'aucun des deux autres ne fait : poser le `Authorization`, mesurer le délai, convertir toute erreur en `EtatLecture` discriminant. Le timeout et la nouvelle tentative restent au niveau requête, pour qu'une règle de nouvelle tentative soit écrite une fois par famille de requêtes et pas une fois par client. |
| Styling | **NativeWind 4** (Tailwind pour React Native), alimenté par les tokens du design system | nativewind 4.2.7 | Le `design-system.md` nomme ses tokens `--color-texte-principal`, `--text-body`, `--space-md` : NativeWind les consomme **tels quels** comme clés de thème, donc la valeur hexadécimale n'existe qu'à un seul endroit et le nom de classe est le nom du token. L'alternative — un module `tokens.ts` écrit à la main et des `StyleSheet` — duplique chaque valeur et laisse un hex dériver en silence, exactement le défaut que `design-check` existe pour trouver. NativeWind a un domaine fort (thème sombre, bascule de palette) dont ce projet ne se sert pas : le `design-system.md` exclut explicitement le thème sombre, et cet excédent est le prix assumé de la suppression de la duplication. La substitution de la famille `--color-encre-*` par la charte du marchand (point 4 du § 6 du design system) se fait à cet endroit unique. |
| Composants UI | **Aucune bibliothèque** — primitives maison dans `app/_design/` | — | Le `design-system.md` a déjà fixé le *contrat* (trait 1,5 px, icône 20 px dans une zone 44 pt, aucun contrôle sans libellé, six variantes distinctes du panneau d'état) et il a été **vérifié contraste par contraste** sur treize primitives. Une bibliothèque de composants apporte ses propres tokens et son propre thème : ce serait une deuxième source de vérité pour exactement les valeurs qui viennent d'être mesurées. Le coût est treize primitives à écrire une fois ; le coût de l'alternative est treize primitives à réconcilier avec treize primitives. |
| Icônes | **lucide-react-native** | 1.49.0 | Le contrat du design system (trait 1,5 px, 20 px) est déjà le dessin de ce jeu : l'acheter évite de redessiner vingt icônes et de les redessiner différemment au premier écran. C'est le seul achat graphique du projet, et il est remplaçable sans toucher à un écran. |
| Tests unitaires | Jest, preset `jest-expo` | jest 30.5.2 · jest-expo 57.0.5 | Déjà tranché, et c'est le runner qu'Expo branche réellement. |
| Tests E2E | **Maestro, en local, sur le development build** | — (pas de runner en intégration continue) | Déjà tranché. C'est le seul runner qui traverse la redirection vers Shopify, et il n'y a pas de portail de fusion parce que C11 rend la publication manuelle. |
| Lint / Format | **Biome** (`@biomejs/biome`, un seul binaire pour les deux) | @biomejs/biome 2.5.15 | Déjà tranché : deux configurations qui dérivent l'une de l'autre produisent le désaccord de style qu'on ne veut pas payer en revue. |

### 1.2 Structure de dossiers cible

```
app/                                  # Expo Router : le routage EST la structure
  (tabs)/
    _layout.tsx                       # barre d'onglets, ordre du `design-system.md` § 4, figé
    index.tsx                         # accueil — écran de re-entrée, sans compte
    recherche.tsx                     # rails de contenu puis champ, jamais un champ seul (B10)
    commandes.tsx                     # fail-closed : rien sans confirmation ni correspondance
    compte.tsx                        # création, suppression (E5), consentement (C9)
  produit/[handle].tsx                # fiche produit, lisible hors ligne avec son âge (B19)
  produit/[handle]/[variant].tsx      # V1 : matrice de variantes, pas au MVP
  commande/[id].tsx                   # V1 : US-3, pas au MVP
  commande/[id]/retour.tsx            # V2 : US-9, jamais écrit tant que Q1 est sans réponse
  _design/                            # tokens et primitives — aucun autre dossier n'a de style
    tokens.ts                         # les 13 familles de tokens, importées par tout le monde
    Bouton.tsx  Champ.tsx  TuileProduit.tsx  LigneCommande.tsx
    PanneauEtat.tsx  BarreOnglets.tsx  BarrePanier.tsx  Pastille.tsx
    Encart.tsx  FeuilleModale.tsx  Squelette.tsx  Interrupteur.tsx
src/
  api/
    http.ts                           # client unique : auth, délai, conversion en EtatLecture
    shopify.storefront.ts             # catalogue, recherche, panier, checkout
    shopify.admin.ts                  # correspondance, commandes — jamais depuis l'appareil
    fonction.ts                       # base de l'URL de la fonction serverless
    lecture.ts                        # le type EtatLecture, un seul endroit
  regles/                             # règles métier pures, testées en unitaire, jamais dans un composant
    disponibilite.ts
    reassort.ts
    correspondance-compte-client.ts
    limite-retour.ts
    age-cache.ts
  composants/                         # composés d'écran, jamais des primitives
  ecran/                              # un dossier par écran : logique + pièces + états
  mesure/                             # appel de comptage, écrit une fois (ADR-15)
  persistance/                        # cache local en lecture seule, avec âge (C8)
app/                                  # ← routes
supabase/
  migrations/                         # le SQL du § 4.10, exécuté par supabase db push
  seeds/                              # le jeu d'essai du `architecture.md` § 4.10.2, versionné (R7)
maestro/                              # les quatre scénarios, exécutés en local
```

---

## 2. Fondations

> Implémentées en premier. Tout le reste en dépend.
>
> **Écart au compte de la roadmap, signalé et non tranché.** `roadmap.md` § 6 annonce **5** fondations. Ce document en déclare **6** : les cinq de la roadmap, à l'identique, plus `socle-interface`. La raison n'est pas un ajout de périmètre mais un manque du découpage — `SKILL.md` § 4.1 impose d'identifier le client API et la gestion d'erreur globale parmi les fondations, et sans eux chaque slice recopierait le même client, la même conversion d'erreur et la même coquille de navigation, ce qui est précisément le cas « deux slices partagent plus de 50 % de leur code » que `SKILL.md` § 4.1 dit-il faut fusionner. **L'écart est renvoyé à `roadmap.md` § 6 pour amendement** ; il est consigné au `architecture.md` § 9.1 et il n'est pas décidé ici.

| Fondation | Responsabilité | Dépend de | Dépendue par |
|---|---|---|---|
| `socle-interface` | Applique les tokens du design system et fournit la coquille de navigation, le client HTTP typé et l'union de lecture. | — | `identite-session`, `outillage-test`, `mesure-instrumentation`, `compte-creation`, `catalogue-produit`, et toute slice qui rend un écran |
| `identite-session` | Source d'identité unique, session sécurisée, confirmation d'e-mail, révocation. | `socle-interface` | `compte-creation`, `mesure-instrumentation`, `accueil-trois-rails`, `catalogue-produit`, `commandes-liste` |
| `chaine-publication` | Ce qui part par mise à jour à chaud, ce qui exige une publication revue, et la frontière écrite du gel. | — | `revue-appareil-physique`, `fenetre-et-frontiere-gel` |
| `boutique-demo-recette` | Boutique de démonstration, projet de recette, script de remplissage versionné. | — | `outillage-test`, `compte-creation`, `rapprochement-compte`, `accueil-trois-rails`, `catalogue-produit`, `recherche`, `mecanisme-renvoi-paiement` |
| `outillage-test` | Jest, tests de composants, quatre scénarios Maestro en local. | `socle-interface`, `boutique-demo-recette` | `compte-creation`, `catalogue-produit`, `commandes-liste`, `panier-sortie-paiement` |
| `revue-appareil-physique` | Protocole de revue sur téléphone réel, bridage 4G réglé une fois, modèle de note de pull request, relevé de coût d'hébergement. | `chaine-publication` | `verification-rendu-2s`, `verification-accessibilite`, `verification-pic-et-plafond` |

### 2.1 socle-interface

**Périmètre** : les tokens du `design-system.md` transposés en valeurs exécutables, les treize primitives, la coquille de navigation (barre d'onglets dans l'ordre du § 4 du design system, barre de panier qui **pousse** le contenu), le client HTTP unique, et le type de résultat de lecture.

C'est la fondation qui porte le **nom de l'union des états de lecture**, le point 1 des `À DÉCIDER` du `design-system.md` § 6. Ce nom est un contrat : tous les écrans, toutes les règles pures et les tests de composants l'importent, et le changer plus tard casse chaque `switch` du projet.

**Contrats** :

```typescript
// Le nom tranche le point 1 du `design-system.md` § 6 : « aucun de ces états ne peut
// résulter en ne rien rendre » devient une contrainte de type, pas une intention.
export type EtatLecture<T> =
  | { etat: 'valeurs'; valeurs: T[]; lu_le: Date }
  | { etat: 'valeur'; valeur: T; lu_le: Date }
  | { etat: 'aucune-donnee'; raison: 'aucune-commande' | 'aucun-resultat' | 'aucun-rail' }
  | { etat: 'hors-ligne'; dernier: T[] | T; age: AgeCache; reessai: () => void }
  | { etat: 'indisponible'; raison: RaisonIndisponibilite; dernier?: T[] | T; age?: AgeCache; reessai: () => void };

export type RaisonIndisponibilite =
  | 'reseau'            // E2, E11 : l'écran dit « indisponible » et propose un réessai (B7)
  | 'source-marchand'   // B6, E12 : le défaut du marchand est affiché tel quel, jamais masqué
  | 'delai-depasse';    // C6 : au-delà du délai, l'état est rendu, pas un spinner

// B18 : aucun écran ne rend sa structure avant que cet état soit résolu.
// Ce n'est pas une convention : un écran qui n'a pas de valeur rend `chargement`.
export type EtatEcran<T> = EtatLecture<T> | { etat: 'chargement' };

// Un fait, un seul endroit : le prix affiché vient d'ici, et de nulle part ailleurs.
export interface PrixAffiche {
  montant: string;      // formaté par la fonction unique `formaterPrix`, jamais à la main
  codeDevise: string;   // donnée du marchand, non convertie (B6, C15)
}
```

**Pourquoi cette fondation existe** : sans elle, chaque slice écrit son propre `try/catch`, son propre bouton « Réessayer » et sa propre conversion en « indisponible », et le défaut que B7 combat — une panne réseau transformée en affirmation commerciale — réapparaît écran par écran, jamais globalement.

### 2.2 identite-session

**Périmètre** : Supabase Auth comme source d'identité unique et **nommée**, la confirmation par e-mail, l'access token court et le refresh token en secure store, le rafraîchissement au retour au premier plan au-delà de 15 minutes, la révocation du refresh token à la déconnexion explicite, et l'exposition d'un état de session discriminant à tout l'arbre.

**Contrats** :

```typescript
export type EtatSession =
  | { etat: 'anonyme' }                                          // B1, C4 : catalogue seul, aucune rétention
  | { etat: 'confirmation-en-attente'; compte_id: string }        // C13 : rien d'autre que le catalogue
  | { etat: 'confirme'; compte_id: string }                       // seule source d'un accès à l'historique
  | { etat: 'erreur'; raison: RaisonSession };

export type RaisonSession = 'jeton-expire' | 'stockage-inaccessible' | 'reseau';

// B2 : « un défaut de correspondance est un refus ». Ce n'est pas une propriété
// de l'écran, c'est un état du type — donc impossible à contourner en composant.
export function peutLireHistorique(session: EtatSession): boolean;
```

**Décision à écrire dans le plan de la slice S1** : la session ne connaît **que** la confirmation d'e-mail. Elle ne sait rien du rapprochement. Les deux sont distincts par construction, parce que l'un vient de la source d'identité et l'autre de notre base, et les confondre est le défaut qui rendrait un défaut de correspondance indistinguishable d'une absence de compte.

### 2.3 chaine-publication

**Périmètre** : la frontière C11 — toute modification JavaScript part par mise à jour à chaud, toute modification native est une publication revue — et ce qui rend cette frontière **applicable** plutôt que déclarative : un manifeste des capacités par révision, et le gel de périmètre de trois mois comme fichier versionné, pas comme entente.

**Contrats** :

```typescript
// Le manifeste est la seule chose qui décide si une révision est une mise à
// jour à chaud ou une publication revue. Il est écrit, donc il se relit.
export interface ManifesteRevision {
  revision: string;
  ecrans: readonly string[];        // clés de § 3, la seule liste qui compte
  natif: readonly ('scheme-uri' | 'push' | 'permissions' | 'autre')[];
  gel: { actif: boolean; autorisees: readonly string[] };
}
```

**Ce que la fondation pose une fois, et qui ne se repose pas** : le schéma d'URI est posé au premier build. Il est donc **dans cette fondation** et pas dans la slice du lien profond (C11, ADR-8) — une slice qui exige un natif est une sortie planifiée, et le lien profond était le seul natif du MVP.

### 2.4 boutique-demo-recette

**Périmètre** : la boutique Shopify de démonstration et le projet Supabase de recette, tous deux sur les paliers gratuits des fournisseurs déjà retenus, remplis par un script versionné dans le dépôt. Aucun scénario ne touche la production.

**Contrats** : cette fondation ne produit pas de table. Elle produit un **script de remplissage versionné**, et c'est le seul endroit où la donnée de test est posée : la ligne de fenêtre et les comptes de démonstration du § 4.10.2 en sont la sortie. Le remplir deux fois le ferait échouer sur la contrainte de singleton — ce qui est le comportement voulu d'une fenêtre unique, et la raison pour laquelle le script est écrit une fois et appelé par tous les scénarios.

**Ce qui reste à écrire avant S1** : le contenu exact du catalogue de démonstration dépend du catalogue réel du marchand, et le changer ne coûte qu'une réexécution du script. Ce n'est pas un blocage d'architecture.

**Le calendrier, pas le code, est le risque** : R7 est le seul élément du périmètre dont l'effort n'est pas du code. C'est pourquoi cette fondation est vague 1 et non vague 4 : tout le reste l'attend.

### 2.5 outillage-test

**Périmètre** : Jest et le preset `jest-expo`, les tests de composants, et les **quatre** scénarios Maestro exécutés en local sur le development build. Le cadre n'est pas élargi : au-delà de quatre, la suite cesse d'être exécutée et il faut la réécrire.

**Contrats** :

```typescript
// Une règle métier par fichier testé, entrée → sortie. Chaque test doit échouer
// quand on casse la règle qu'il teste.
export function calculerLimiteRetour(livree_le: Date, delai_jours: number): Date;
export function decrireReassort(disponible: boolean, connu_indisponible_depuis: Date | null): EtatPastille;
export function etatPanneauHistorique(correspondance: Correspondance | null): 'aucune-donnee' | 'correspondance-echouee' | 'valeurs';
```

**Les quatre scénarios** et la frontière qu'ils s'arrêtent à sont ceux de `conventions.md` ; l'architecture n'y ajoute rien, et surtout elle n'y ajoute pas de cinquième.

### 2.6 revue-appareil-physique

**Périmètre** : le protocole réutilisable — un téléphone de référence, un bridage 4G réglé **une fois** et documenté, un modèle de note de pull request, un relevé de coût d'hébergement mensuel — et l'exécution de ce protocole pour une version donnée.

**Pourquoi c'est une fondation et non une slice** : C6, B21/E3 et B17 n'ont aucun scénario automatisé. Un protocole non écrit est un protocole que personne ne suit ; et un protocole écrit mais non outillé (pas de téléphone réservé, pas de réglage de bridage re-fait à chaque fois) coûte plus cher que l'automatisation refusée.

**Contrats** :

```markdown
<!-- modèle de note, à coller dans chaque pull request qui touche un écran -->
- Appareil            : …
- Réseau              : 4G bridée à … Mbps / … ms — réglage inchangé depuis …
- Écran               : … — première donnée utile à … s, structure complète à … s (seuil C6 : 2 s)
- Texte agrandi       : … — bouton d'achat visible, aucune troncature (B21, E3)
- Lecteur d'écran    : … — parcours nominal et état « correspondance échouée » (E3)
- Conséquence écrite  : …
```

---

## 3. Modules et slices

### 3.1 Inventaire

L'ordre des modules suit `references/module-prioritization.md` : **fréquence de la boucle de travail**, jamais l'organigramme du domaine. Les quatre premiers rangs sont ceux de la barre d'onglets et sont repris du `design-system.md` § 4 ; les rangs 5 et suivants sont des modules sans onglet, ce qui est la règle 5 du document de priorisation (« la barre principale ne dépasse pas cinq items, le reste part en overflow ») appliquée à un projet qui n'en a que quatre.

| Rang | Module | Clé | Label | Fréquence (1-5) | Centralité (1-5) | Justification du rang |
|---|---|---|---|---|---|---|
| 1 | Accueil | `accueil` | Accueil | 5 — **quotidien, ouvert par défaut au lancement** | 4 | Seul écran atteignable sans compte, et B9 y garantit trois rails : c'est le seul qui ouvre la boucle pour un client qui n'a jamais commandé, donc il est premier pour cette raison et pas par défaut. |
| 2 | Recherche | `recherche` | Recherche | 4 — plusieurs fois par session d'achat | 3 | Retrouver une référence précise est le besoin décisif du client fidèle (`prd.md` § 1.3), mais le catalogue reste atteignable par les rails : elle ne conditionne aucune autre tâche, donc elle ne monte pas au rang 1. |
| 3 | Commandes | `commandes` | Commandes | 2 — **bisannuel et non mesuré (R6)** | 5 | C'est la raison de venir et elle bloque US-2, US-4, US-7, US-10, mais sa fréquence vient d'une note que le PRD déclare non mesurée : le rang 3 est une **borne basse déclarée**, pas une mesure. |
| 4 | Compte | `compte` | Compte | 2 — bisannuel | 1 | Elle ne porte aucune boucle, mais c'est la seule porte de la création de compte, du consentement révocable (C9) et de la suppression (E5) : c'est de l'accès, pas de la configuration. |
| 5 | Catalogue | `catalogue` | Catalogue | 3 — hebdomadaire | 2 | Atteint par les rails, par un lien partagé et par la recherche, jamais par un onglet : lui donner un onglet serait créer un cinquième onglet pour un catalogue de quelques centaines de références, ce que le `prd.md` § 7 refuse. |
| 6 | Panier | `panier` | Panier | 3 — une fois par session d'achat | 4 | Porte le seul critère principal (8 % de sorties vers le paiement) et doit être visible **pendant** le parcours, donc barre persistante et non onglet (`design-system.md` § 4). |
| 7 | Mesure | `mesure` | — | 1 — jamais, l'utilisateur ne la voit pas | 5 | Ne porte aucune tâche mais **conditionne la décision** : sans elle, la règle d'arrêt du `prd.md` § 8 ne peut pas être appliquée, et c'est la seule chose que le MVP a à prouver. |

| Module | Slice | User stories (PRD) | Règles métier (B*) | Contraintes (C*) | Cas (E*) |
|---|---|---|---|---|---|
| `compte` | S1 `compte-creation` | US-4 | B2, B4, B13 | C13, C9, C2 | — |
| `compte` | S2 `rapprochement-compte` | US-4 | B3, B4, B5 | C3 | E1, E9 |
| `compte` | S3 `echec-historique-narratif` | US-4 | B5, B7 | C7 | E1 |
| `compte` | S4 `suppression-compte` | — | B14, B16 | C9, C13 | E5 |
| `commandes` | S5 `commandes-liste` | US-2 | B2, B4, B7, B13 | C4, C7 | E2 |
| `accueil` | S6 `accueil-trois-rails` | US-1 (minimum) | B8, B9, B18 | C6, C8 | E4 |
| `catalogue` | S7 `catalogue-produit` | US-1 (minimum) | B1, B6, B7, B19, B23 | C4, C8, C10 | E6, E7 |
| `recherche` | S8 `recherche` | US-5 | B10, B11, B23 | C6 | — |
| `panier` | S9 `panier-sortie-paiement` | US-6 | B7, B12 | C3, C16 | E11 |
| `mesure` | T1 `mesure-instrumentation` | US-2, US-4, US-6 | — | C9 | — |
| `mesure` | T2 `verification-rendu-2s` | US-1, US-5 | B18 | C6, C1 | — |
| `mesure` | T3 `verification-accessibilite` | toutes | B21 | C12 | E3 |
| `mesure` | T4 `verification-pic-et-plafond` | US-1, US-6 | B17 | C1, C16 | E12 |
| `panier` | T5 `mecanisme-renvoi-paiement` | US-6 | B12 | C3, C14 | E11 |
| `mesure` | T6 `fenetre-et-frontiere-gel` | — | — | C11, C1 | — |

**Répartition** : 9 slices fonctionnelles et 6 slices d'obligation transverse, soit les **15 slices** que `roadmap.md` § 6 annonce. Le compte est exact et vérifiable, il n'est pas approché.

### 3.2 Module compte (rang 4)

#### Slice : S1 — `compte-creation`

- **Phrase** : *Permettre à un client de créer un compte, de confirmer son adresse e-mail, et de voir nommées les deux entités qui détiennent des données personnelles.*
- **User stories** : US-4
- **Règles métier** : B2, B4, B13
- **Contraintes** : C13, C9, C2
- **Écrans** : `compte`, `creer-compte`, `confirmer-email` — les trois, et non un seul : la confirmation d'e-mail est un **écran** du design system, pas un toast, parce que C13 distingue « compte créé » de « adresse confirmée » et que seul un écran peut nommer les deux
- **Dépend de** : `socle-interface`, `identite-session`, `boutique-demo-recette`, `outillage-test`
- **Dépendue par** : S2, S4
- **Peut être parallélisée avec** : S6, S8, T1, T5
- **Ce que la slice ne fait pas** : elle ne rapproche pas. Le rapprochement est S2, et le séparer est ce qui permet de tester l'échec (S3) sans simuler l'état interne de la création de compte.

#### Slice : S2 — `rapprochement-compte`

- **Phrase** : *Rattacher un compte confirmé à l'historique de commandes du marchand, par un rapprochement tenté une seule fois et dont le résultat est définitif.*
- **User stories** : US-4
- **Règles métier** : B3, B4, B5
- **Contraintes** : C3, C14
- **Cas** : E1, E9
- **Dépend de** : S1, `boutique-demo-recette`
- **Dépendue par** : S3, S4, S5
- **Peut être parallélisée avec** : S6, S7
- **Donnée** : `compte`, `correspondance` (`architecture.md` § 4.1 et § 4.2)
- **Pourquoi C14 décide de la forme** : le rapprochement est une **lecture unique** de la source au moment de la confirmation, jamais une synchronisation. C'est la seule forme qu'une ressource rare en temps peut accepter.

#### Slice : S3 — `echec-historique-narratif`

- **Phrase** : *Rendre l'échec de rapprochement permanent, formulé en mots, avec un compteur de trois tentatives et un lien vers le site du marchand.*
- **User stories** : US-4
- **Règles métier** : B5, B7
- **Contraintes** : C7
- **Cas** : E1
- **Dépend de** : S2
- **Dépendue par** : S5
- **Peut être parallélisée avec** : S6, S7, S8
- **Donnée** : `compte.tentatives_rapprochement` (`architecture.md` § 4.1), dont la borne de 3 est une contrainte de base et non un `if` dans un composant

#### Slice : S4 — `suppression-compte`

- **Phrase** : *Supprimer le compte, ses données applicatives et son jeton de notification, sans toucher aux commandes qui restent chez le marchand, et sans faire disparaître le dénominateur de la règle d'arrêt.*
- **User stories** : aucune — E5 n'en a pas, ce qui est **signalé** par `roadmap.md` § 2.5 (Q-E) et non tranché ici
- **Règles métier** : B14, B16
- **Contraintes** : C9, C13
- **Cas** : E5
- **Dépend de** : S1, S2, T1
- **Dépendue par** : aucune
- **Peut être parallélisée avec** : S6, S7, S8
- **Donnée** : la cascade `ON DELETE CASCADE` du `architecture.md` § 4.10, et les deux triggers qui rendent `compteur_mesure` ineffaçable et non décroissant

### 3.3 Module commandes (rang 3)

#### Slice : S5 — `commandes-liste`

- **Phrase** : *Afficher les commandes rattachées au compte, avec leurs articles, leur état, la date de livraison et la date limite de retour — les deux ensemble ou aucune.*
- **User stories** : US-2
- **Règles métier** : B2, B4, B7, B13
- **Contraintes** : C4, C7
- **Cas** : E2
- **Dépend de** : S2, S3, `identite-session`, `outillage-test`, T1
- **Dépendue par** : T3
- **Peut être parallélisée avec** : S6, S7, S8, S9
- **Donnée** : `acces_historique` (`architecture.md` § 4.3) — la table est le **droit** de lire, pas un cache ; l'insert y est refusé par un trigger si la correspondance n'est pas réussie, donc un défaut de confirmation est un refus et non un accès accordé par défaut (B2, B4)
- **Ce qui n'est pas une table** : les commandes elles-mêmes. Le marchand en est la source (B6) et nous n'en gardons aucune copie : `conventions.md` le dit et B23 l'interdit. L'onglet lit la source, et n'affiche une copie hors ligne que depuis le cache local de l'appareil, avec son âge (C8, B19)

### 3.4 Module accueil (rang 1)

#### Slice : S6 — `accueil-trois-rails`

- **Phrase** : *Afficher trois rails qui ne sont jamais vides, dont la structure est utile en moins de deux secondes sur 4G, le reste remplissant ensuite.*
- **User stories** : US-1 (minimum)
- **Règles métier** : B8, B9, B18
- **Contraintes** : C6, C8
- **Cas** : E4
- **Dépend de** : `identite-session`, `boutique-demo-recette`
- **Dépendue par** : S8, T2, T3
- **Peut être parallélisée avec** : S1, S2, S4, S7
- **Ce qui n'est pas une table** : aucun rail n'est stocké. Les trois rails se **lisent** chez le marchand à chaque affichage et ne s'écrivent jamais, ce qui est la seule forme qui tienne sous C14 sans travail récurrent
- **`À DÉCIDER EN PHASE 4` — la source du troisième rail.** Le contrat est fixe et ne se négocie pas : troisième rail non vide, sans compte et sans travail marchand (Q-F). La source ne l'est pas. Deux mécanismes, un écarté : lire `inventory_levels.updated_at` par l'API Admin demande le droit `read_inventory` et **n'est pas confirmé** contre le palier payé par le marchand ; un instantané local de la disponibilité dernière connue s'écrit pendant une lecture en ligne et fait du « réapprovisionné » une détection d'état, ce qui laisse le rail vide au premier lancement. **Retenu provisoirement** : l'API Admin, parce qu'elle est une lecture sans ingestion récurrente (C14) — **à confirmer avant S6**, et si le droit n'est pas accordé, la réponse ne revient pas au rail mais au PRD (Q-F reste ouverte). B9 impose alors le **troisième** niveau de repli, que ni B9 ni E4 ne nomment.

### 3.5 Module catalogue (rang 5)

#### Slice : S7 — `catalogue-produit`

- **Phrase** : *Ouvrir une fiche produit depuis un lien partagé, sans compte et sans réseau, en affichant l'âge de ce qui est rejoué et en n'offrant aucune écriture hors ligne.*
- **User stories** : US-1 (minimum)
- **Règles métier** : B1, B6, B7, B19, B23
- **Contraintes** : C4, C8, C10
- **Cas** : E6, E7
- **Dépend de** : `identite-session`, `boutique-demo-recette`, `outillage-test`
- **Dépendue par** : S9, T2, T3, T4
- **Peut être parallélisée avec** : S1, S2, S3, S4, S6
- **Donnée** : `produit_recemment_vu` (`architecture.md` § 4.4) ne contient **que** le `handle` et l'horodatage. Aucun titre, aucun prix, aucune photo : E7 dit que l'application ne mémorise pas de prix, et une copie serveur d'un libellé de produit est une donnée du marchand que nous ne sommes pas censés détenir (B6, B23). Le texte et l'image affichés hors ligne viennent du cache local de l'appareil, qui porte son âge (B19)
- **Ce qui rend la lecture hors ligne possible** : la copie locale est **en lecture seule** et n'affiche que trois choses — le contenu, son âge, et « Réessayer ». Aucune action d'écriture n'y est proposée (C8, E6). C'est un choix de modèle de données autant que d'écran : `produit_recemment_vu` ne porte pas de champ d'écriture, donc il n'y a rien à synchroniser

### 3.6 Module recherche (rang 2)

#### Slice : S8 — `recherche`

- **Phrase** : *Faire atteindre la recherche sans défilement depuis l'accueil, en pleine largeur, et faire toujours s'ouvrir l'onglet sur un contenu plutôt que sur un champ vide.*
- **User stories** : US-5
- **Règles métier** : B10, B11, B23
- **Contraintes** : C6
- **Dépend de** : S6, `boutique-demo-recette`
- **Dépendue par** : T2, T3
- **Peut être parallélisée avec** : S2, S3, S4, S7
- **Donnée** : aucune. La recherche interroge la recherche du marchand, jamais un index que nous tiendrions (`conventions.md` § « exclu »)

### 3.7 Module panier (rang 6)

#### Slice : S9 — `panier-sortie-paiement`

- **Phrase** : *Construire un panier dans l'application et le céder au paiement de la boutique pour ce panier précis, sans jamais voir de numéro de carte et en déclarant l'échec de relecture plutôt que de procéder.*
- **User stories** : US-6
- **Règles métier** : B7, B12
- **Contraintes** : C3, C16
- **Cas** : E11
- **Dépend de** : S7, T5
- **Dépendue par** : T4
- **Peut être parallélisée avec** : S4, S5, S6, S8
- **`À DÉCIDER EN PHASE 4` — le mécanisme « pour ce panier précis » (B12).** C'est le point le plus difficile de cette architecture, et il est traité au `architecture.md` § 7.1 (ADR-10) : le PRD pose l'exigence sans la poser comme question. Ce que la slice consomme n'est pas un choix, c'est un **contrat** que T5 doit établir ou constater comme impossible

### 3.8 Module mesure (rang 7)

#### Slice : T1 — `mesure-instrumentation`

- **Phrase** : *Produire les six nombres du `roadmap.md` § 2.4, dont la jointure compte créé / Commandes ouverte, calculée côté serveur et jamais dans l'outil d'audit.*
- **User stories** : US-2, US-4, US-6
- **Règles métier** : —
- **Contraintes** : C9
- **Dépend de** : `identite-session`, `socle-interface`
- **Dépendue par** : S4, T4, T6
- **Peut être parallélisée avec** : S1, S2, S6, S7, S8
- **Donnée** : `session_mesure`, `marqueur_ouverture`, `compteur_mesure` (`architecture.md` § 4.5 à § 4.7) — **la cinquième chose** que la base contient, sans laquelle Q-C reste sans réponse conforme
- **Pourquoi elle ne dépend d'aucun écran** : le comptage est écrit en un seul endroit (ADR-15), donc un écran qui s'ouvre compte déjà. Les slices dont la **correction** dépend d'un nombre sont seulement S4, T4 et T6 : celles-là déclarent la dépendance, les autres n'en ont pas besoin et ne la déclarent pas

#### Slice : T2 — `verification-rendu-2s`

- **Phrase** : *Chronométrer l'accueil et la fiche produit sur un téléphone réel en 4G bridée, et écrire le chiffre dans la pull request.*
- **User stories** : US-1, US-5
- **Règles métier** : B18
- **Contraintes** : C6, C1
- **Dépend de** : `revue-appareil-physique`, S6, S7, S8
- **Dépendue par** : aucune
- **Peut être parallélisée avec** : T3
- **Ce n'est pas une fonctionnalité, c'est une slice** — c'est la formulation de `roadmap.md` § 2.1 et elle est exacte : sans ce chiffre écrit, C6 n'est pas une contrainte, c'est une intention. Aucun scénario automatisé ne couvre ce point, et Maestro non plus (`conventions.md` § « non couvert »)

#### Slice : T3 — `verification-accessibilite`

- **Phrase** : *Faire parcourir les écrans nominaux et les états d'échec par un lecteur d'écran, avec le texte agrandi, sur un téléphone réel, et écrire ce qui a été corrigé.*
- **User stories** : toutes
- **Règles métier** : B21
- **Contraintes** : C12
- **Cas** : E3
- **Dépend de** : `revue-appareil-physique`, S5, S6, S7, S8
- **Dépendue par** : aucune
- **Peut être parallélisée avec** : T2
- **Les deux états qui comptent plus que l'écran nominal** : le panneau « correspondance échouée » et le panneau « aucune commande pour le moment » sont des textes longs dans des boutons dont la cible est minimale ; ce sont eux qui cassent à 200 % de police, pas la liste de commandes

#### Slice : T4 — `verification-pic-et-plafond`

- **Phrase** : *Passer en pic saisonnier et relever la consommation d'hébergement, pour que les deux critères de garde du `prd.md` § 8 soient attestés plutôt que supposés.*
- **User stories** : US-1, US-6
- **Règles métier** : B17
- **Contraintes** : C1, C16
- **Cas** : E12
- **Dépend de** : `revue-appareil-physique`, T1, S7, S9
- **Dépendue par** : aucune
- **Peut être parallélisée avec** : T2, T3
- **Une seule fois, pas à chaque version** : c'est une propriété du pic, pas du code. Le transformer en rite par version serait le moyen de le ne pas faire

#### Slice : T5 — `mecanisme-renvoi-paiement`

- **Phrase** : *Établir par écrit si la boutique peut renvoyer vers son paiement pour le panier précis que l'application a construit, et écrire la réponse dans le contrat de la sortie.*
- **User stories** : US-6
- **Règles métier** : B12
- **Contraintes** : C3, C14
- **Cas** : E11
- **Dépend de** : `boutique-demo-recette`
- **Dépendue par** : S9, T6
- **Peut être parallélisée avec** : S1, S2, S3, S4, S6, S7, S8
- **Ce que cette slice produit, et qui est un livrable** : soit un mécanisme constaté et testé, soit la preuve écrite qu'il n'existe pas. Les deux sont acceptables ; l'un d'eux être **supposé** ne l'est pas, parce que tout le critère principal du `prd.md` § 8 en dépend

#### Slice : T6 — `fenetre-et-frontiere-gel`

- **Phrase** : *Figer la fenêtre d'observation et la frontière du gel, par écrit avant publication, puis les rendre non déplaçables par la base et par le manifeste de révision.*
- **User stories** : —
- **Règles métier** : B3
- **Contraintes** : C11, C1
- **Dépend de** : `chaine-publication`, T1, T5
- **Dépendue par** : aucune
- **Peut être parallélisée avec** : S2, S8, S9 (vague 3) — mais **rien de ce qu'elle écrit ne se termine avant la publication** : elle a deux temps, un avant et un au moment de l'ouverture de la fenêtre
- **Donnée** : `fenetre_mesure` (`architecture.md` § 4.8). B3 rend la fenêtre unique et définitive, donc elle est une **ligne**, pas une configuration : un trigger refuse toute mise à jour, et ce refus est écrit au `architecture.md` § 4.10.3 sous forme de garde

---

## 4. Modèles de données

**Où sont les données.** La base applicative contient **cinq** choses, et non quatre. Les quatre sont celles qu'énumère `conventions.md` § Stack (correspondance, jetons de push et consentements, favoris, produits récemment vus) ; la cinquième est la **mesure calculée côté serveur**, que la question Q-C de `roadmap.md` § 2.5 rend nécessaire : l'outil d'audit relie deux événements par un identifiant de personne, et C9 l'interdit, donc la jointure compte créé / Commandes ouverte se fait chez nous.

**Ce que le MVP crée, et ce qu'il ne crée pas.** Sur ces quatre premières choses, le MVP n'en crée que deux : `correspondance` et `produit_recemment_vus`. `favori` est US-7, repoussé en V1 par `roadmap.md` § 2.2 ; `jeton_push_consentement` et la table d'idempotence du webhook sont US-8, repoussées en V2. **Elles ne sont donc pas décrites ici** : une table décrite champ par champ et jamais créée en SQL est exactement ce que `ddl-exec completeness` signale comme un défaut, et le décrire pour « préparer la suite » produirait ce défaut. Elles sont nommées en ADR-7 avec la migration qui les créera.

**Le périmètre d'écriture.** L'application **ne se connecte jamais** à PostgreSQL (ADR-1) : elle appelle la fonction serverless, qui est la seule à toucher la base. C'est ce qui rend B4 tenable en un seul endroit, et c'est ce qui empêche un appareil compromis de lire `correspondance`.

### 4.1 `compte` — le compte local, projection de la source d'identité

| Champ | Type | Nullable | Défaut | Contraintes | Description | Exemple |
|---|---|---|---|---|---|---|
| `compte_id` | uuid (PK) | non | — | Clé étrangère applicative vers `auth.users` posée par la plateforme, **hors du DDL de ce document** (`architecture.md` § 4.10.1) | Identifiant de session, fourni par Supabase Auth et jamais par l'appareil. | `11111111-1111-4111-8111-111111111111` |
| `cree_le` | timestamptz | non | `now()` | — | Horodatage de création. C'est la base des quatre fenêtres de Q-B. | `2026-10-01T09:00:00Z` |
| `email_confirme_le` | timestamptz | oui | — | `compte_confirmation_apres_creation` : `email_confirme_le >= cree_le` | Date de confirmation de l'adresse. **Nulle signifie refus** : c'est le seul état qui autorise autre chose que le catalogue. | `2026-10-01T09:04:00Z` |
| `tentatives_rapprochement` | smallint | non | `0` | `compte_tentatives_borne` : `BETWEEN 0 AND 3` | Compteur de tentatives de rapprochement, B5. Au-delà de 3, l'écran masque **le compteur et le lien** ; la borne est en base pour qu'un `if` oublié dans un composant ne puisse pas l'augmenter. | `2` |

### 4.2 `correspondance` — le rapprochement unique et définitif

| Champ | Type | Nullable | Défaut | Contraintes | Description | Exemple |
|---|---|---|---|---|---|---|
| `correspondance_id` | uuid (PK) | non | `gen_random_uuid()` | — | Identifiant interne de la tentative. Il n'est jamais renvoyé à l'appareil. | `3f2c…` |
| `compte_id` | uuid | non | — | `correspondance_compte_unique` (UNIQUE) · `correspondance_compte_fkey` → `compte.compte_id` ON DELETE CASCADE | Un compte, au plus une correspondance. C'est l'unicité de B3, et elle est en base. | `11111111-…` |
| `statut` | text | non | `'en_attente'` | `correspondance_statut_connu` : `IN ('en_attente','reussi','echoue')` · une fois sortie de `en_attente`, la ligne est **immuable** (trigger `architecture.md` § 4.10) | Résultat du rapprochement. | `reussi` |
| `client_shopify_id` | text | oui | — | `correspondance_gid_shopify` : `^gid://shopify/Customer/[0-9]+$` · index unique partiel sur les seules lignes `reussi` | Identifiant du client chez le marchand. **Jamais** l'adresse e-mail : l'adresse est lue, interrogée et abandonnée (ADR-6). | `gid://shopify/Customer/4711` |
| `motif_echec` | text | oui | — | `correspondance_motif_connu` : `IN ('aucune_correspondance','ambigu')` | Pourquoi la ligne est en échec. `ambigu` couvre le cas où la source renvoie plusieurs clients pour une même adresse : c'est un refus, pas un choix. | `aucune_correspondance` |
| `cree_le` | timestamptz | non | `now()` | — | Ouverture de l'unique fenêtre de rapprochement. | `2026-10-01T09:05:00Z` |
| `decidee_le` | timestamptz | oui | — | `correspondance_decision_coherente` | Date de la réponse définitive. **Nulle** tant que la source n'a pas répondu : un incident du marchand ne doit pas consommer la tentative (B3 interdit de rejouer, pas de ne pas avoir joué). | `2026-10-01T09:05:02Z` |

### 4.3 `acces_historique` — le droit de lire, pas un cache

| Champ | Type | Nullable | Défaut | Contraintes | Description | Exemple |
|---|---|---|---|---|---|---|
| `compte_id` | uuid (PK) | non | — | `acces_historique_compte_fkey` → `compte.compte_id` ON DELETE CASCADE | Le compte qui a ouvert ses commandes. | `11111111-…` |
| `premier_ouvert_le` | timestamptz | non | `now()` | `acces_historique_chronologie` | Première ouverture de l'onglet, jamais réécrite. | `2026-10-01T18:00:00Z` |
| `dernier_ouvert_le` | timestamptz | non | `now()` | `acces_historique_chronologie` : `>= premier_ouvert_le` | Dernière ouverture, pour le tri et pour l'historique vide formulé en mots. | `2026-10-02T09:12:00Z` |

**L'insertion dans cette table est refusée** si l'adresse n'est pas confirmée **ou** si aucune correspondance réussie n'existe pour ce compte (trigger `architecture.md` § 4.10, et les deux gardes correspondantes du § 4.10.3). C'est la seule porte entre un compte et des données de commande, et elle est fermée par défaut.

### 4.4 `produit_recemment_vu` — les derniers consultés, rattachés au compte

| Champ | Type | Nullable | Défaut | Contraintes | Description | Exemple |
|---|---|---|---|---|---|---|
| `compte_id` | uuid | non | — | `produit_recemment_vu_compte_fkey` → `compte.compte_id` ON DELETE CASCADE | Rattachement au compte, donc retrouvé sur un autre appareil (B16). | `11111111-…` |
| `produit_id` | text | non | — | `produit_recemment_vu_handle` : `^[a-z0-9][a-z0-9-]{0,119}$` · clé primaire composite | Le `handle` Shopify, qui fait foi (`conventions.md` § routage). **Pas d'identifiant interne** : un identifiant numérique de notre fabrication resterait valide après que le marchand aurait changé le sien. | `chaussures-hiver` |
| `vu_le` | timestamptz | non | `now()` | — | Dernière consultation. Suffit à classer ; aucun texte du marchand n'est stocké. | `2026-10-01T19:00:00Z` |

**Aucun champ d'écriture hors ligne, et c'est volontaire** : C8 exclut toute écriture hors ligne, donc il n'existe rien à réconcilier. Le cache local de l'appareil porte le contenu et son âge (B19) ; cette table ne porte que l'ordre.

### 4.5 `session_mesure` — une session, et **aucune** personne

| Champ | Type | Nullable | Défaut | Contraintes | Description | Exemple |
|---|---|---|---|---|---|---|
| `session_id` | uuid (PK) | non | `gen_random_uuid()` | — | Identifiant de session, tiré au sort à l'ouverture. **Aucune clé étrangère vers `compte`** : c'est la garantie mécanique de C9 et de Q-C, et elle est vérifiable par une garde (`architecture.md` § 4.10.3). | `aaaaaaaa-…` |
| `debut_le` | timestamptz | non | `now()` | — | Ouverture de la session. | `2026-10-01T17:00:00Z` |
| `fin_le` | timestamptz | oui | — | `session_mesure_fin` : `>= debut_le` | Fin observée. La durée n'est pas interprétée ici : la définition de « session » est **figée** dans `fenetre_mesure` avant publication (T6). | `2026-10-01T17:45:00Z` |
| `saisie_premiere` | boolean | non | `false` | — | Vrai si le premier geste de la session est une saisie dans le champ de recherche. C'est le numérateur des 12 % de la bascule d'onglets, et il doit être **le premier geste**, sinon le seuil mesurerait n'importe quoi. | `true` |
| `sortie_paiement_le` | timestamptz | oui | — | `session_mesure_sortie` : `>= debut_le` | Heure de la sortie vers le paiement de la boutique. Numérateur du critère principal. | `2026-10-01T17:40:00Z` |

### 4.6 `marqueur_ouverture` — la jointure que C9 interdit de faire ailleurs

| Champ | Type | Nullable | Défaut | Contraintes | Description | Exemple |
|---|---|---|---|---|---|---|
| `marqueur_id` | uuid (PK) | non | `gen_random_uuid()` | — | Identifiant du marquage. Jamais exporté. | `7a10…` |
| `compte_id` | uuid | non | — | `marqueur_ouverture_onglet_unique` (compte, onglet) · `marqueur_ouverture_compte_fkey` ON DELETE CASCADE | C'est ici, et **seulement ici**, que « compte créé » se joint à « Commandes ouverte ». Cette colonne ne sort jamais de la base : ce qui part vers l'outil d'audit est un agrégat. | `11111111-…` |
| `onglet` | text | non | — | `marqueur_ouverture_onglet_connu` : `IN ('accueil','recherche','commandes','compte')` | Onglet marqué. La liste fermée est celle de la barre d'onglets du `design-system.md` § 4, pas une liste ouverte : un onglet ajouté plus tard est une décision d'architecture (`prd.md` § 8), pas une ligne ajoutée. | `commandes` |
| `premier_ouvert_le` | timestamptz | non | `now()` | `marqueur_ouverture_chronologie` | Première ouverture. Alimentera les compteurs à 24 h, 7 j, 30 j et 90 j — les quatre fenêtres que Q-B demande **séparément**. | `2026-10-01T18:00:00Z` |
| `dernier_ouvert_le` | timestamptz | non | `now()` | `marqueur_ouverture_chronologie` : `>= premier_ouvert_le` | Dernière ouverture. | `2026-10-02T09:12:00Z` |

### 4.7 `compteur_mesure` — le dénominateur, insupprimable

| Champ | Type | Nullable | Défaut | Contraintes | Description | Exemple |
|---|---|---|---|---|---|---|
| `code` | text (PK) | non | — | `compteur_mesure_code_connu` : **liste fermée** de onze valeurs | Nom du compteur. La liste fermée est ce qui rend C9 tenable en base : un identifiant de personne ne peut pas entrer, **même comme clé** (garde `architecture.md` § 4.10.3). | `comptes_crees` |
| `valeur` | bigint | non | `0` | `compteur_mesure_valeur_positive` : `>= 0` · **jamais décroissante, jamais supprimée** (deux triggers `architecture.md` § 4.10) | Valeur courante. | `184` |
| `maj_le` | timestamptz | non | `now()` | — | Dernière écriture, pour dater une lecture de compteur. | `2026-10-20T06:00:03Z` |

**Les onze compteurs** : `comptes_crees`, `correspondances_reussies`, `correspondances_echouees`, `commandes_ouvertes_j0`, `commandes_ouvertes_24h`, `commandes_ouvertes_7j`, `commandes_ouvertes_30j`, `commandes_ouvertes_90j`, `sessions`, `sessions_saisie_premiere`, `sessions_sortie_paiement`. Ils sont énumérés ici **et** dans le `CHECK` du DDL, parce qu'un compteur ajouté après coup change le document du `roadmap.md` § 2.4.

### 4.8 `fenetre_mesure` — l'unique fenêtre d'observation

| Champ | Type | Nullable | Défaut | Contraintes | Description | Exemple |
|---|---|---|---|---|---|---|
| `id` | smallint (PK) | non | `1` | `fenetre_mesure_singleton` : `= 1` | Singleton. Il ne peut pas y avoir une deuxième fenêtre : c'est la forme que prend B3 quand il est appliqué à l'observation. | `1` |
| `debut` | timestamptz | non | — | — | Instant d'ouverture. **Immuable** : la fenêtre ne se déplace pas, même pour corriger une date de publication. | `2026-10-01T00:00:00Z` |
| `duree_session_min` | smallint | non | `30` | `fenetre_mesure_duree_plausible` : `BETWEEN 5 AND 240` | Définition écrite de « session », figée avant publication comme le seuil de la règle d'arrêt. **Immuable** elle aussi, sinon la définition changerait sous les chiffres déjà lus. | `30` |
| `close_le` | timestamptz | oui | — | `fenetre_mesure_fermeture` : `> debut` | Fermeture, une fois la lecture de la règle d'arrêt faite. | `2027-01-01T00:00:00Z` |

### 4.9 Relations

| Entité A | Relation | Entité B | Clé étrangère | Cascade |
|---|---|---|---|---|
| `compte` | 1-1 | `correspondance` | `correspondance.compte_id` | `ON DELETE CASCADE` — E5 supprime les deux, dans cet ordre |
| `compte` | 1-1 | `acces_historique` | `acces_historique.compte_id` | `ON DELETE CASCADE` |
| `compte` | 1-N | `produit_recemment_vu` | `produit_recemment_vu.compte_id` | `ON DELETE CASCADE` |
| `compte` | 1-N | `marqueur_ouverture` | `marqueur_ouverture.compte_id` | `ON DELETE CASCADE` |
| `correspondance` | 0-1 | `compte` | — | `ON DELETE RESTRICT` implicite : c'est la table enfant qui porte la cascade |
| `session_mesure` | — | `compte` | **aucune, dans aucun sens** | — **C'est l'absence de lien qui est la règle** : elle rend Q-C conforme, et elle est prouvée par une garde (`architecture.md` § 4.10.3) |
| `compteur_mesure` | — | tout | **aucune, jamais** | — Un agrégat n'a pas de parent. C'est pourquoi E5 ne l'efface pas |
| `fenetre_mesure` | — | tout | **aucune** | — La fenêtre précède tout, y compris les tables |
| `auth.users` (plateforme) | 1-1 | `compte` | `compte.compte_id` | `ON DELETE CASCADE`, posée **par la plateforme** et non par ce document (`architecture.md` § 4.10.1) |

### 4.10 Contraintes en base, et preuves qu'elles tiennent

**Une contrainte écrite dans ce document n'est ni compilée, ni typée, ni exécutée : elle n'est que relue.** Trois défauts de cette sorte ont survécu à trois gates sans que personne ne les voie :

- un `CHECK` qui contient une sous-requête — **PostgreSQL le refuse à la création**, donc la contrainte n'existe pas ;
- un trigger dont la garde est inatteignable (`IF NEW.statut = OLD.statut THEN RETURN NEW` en tête) — la porte est écrite, commentée, et ne protège rien ;
- un champ que le trigger exige et que rien ne produit.

Écris le DDL, puis **exécute-le** :

```bash
node "$FORGE/scripts/ddl-exec.js" all "Forge Labs/shopify-mobile"
```

#### 4.10.1 Schéma

> **Discipline de lecture** : le `CREATE TABLE` ne porte que les colonnes, les clés primaires et les défauts. **Toutes** les autres contraintes sont des `ALTER TABLE … ADD CONSTRAINT`, séparées. La raison est celle de `SKILL.md` § 4.5 : une contrainte écrite à l'intérieur d'un `CREATE TABLE` n'est pas rejouable par l'outil qui crée les tables à partir des tableaux de colonnes du § 4.1, et elle disparaîtrait silencieusement — le schéma aurait l'air correct et la borne de B5 n'existerait pas. Séparées, elles s'exécutent dans les deux sens.

```sql
-- 1. Colonnes et clés primaires.
CREATE TABLE IF NOT EXISTS compte (
  compte_id                uuid        NOT NULL,
  cree_le                  timestamptz NOT NULL DEFAULT now(),
  email_confirme_le        timestamptz,
  tentatives_rapprochement smallint    NOT NULL DEFAULT 0,
  CONSTRAINT compte_pkey PRIMARY KEY (compte_id)
);

CREATE TABLE IF NOT EXISTS correspondance (
  correspondance_id uuid        NOT NULL DEFAULT gen_random_uuid(),
  compte_id         uuid        NOT NULL,
  statut            text        NOT NULL DEFAULT 'en_attente',
  client_shopify_id text,
  motif_echec       text,
  cree_le           timestamptz NOT NULL DEFAULT now(),
  decidee_le        timestamptz,
  CONSTRAINT correspondance_pkey PRIMARY KEY (correspondance_id)
);

CREATE TABLE IF NOT EXISTS acces_historique (
  compte_id         uuid        NOT NULL,
  premier_ouvert_le timestamptz NOT NULL DEFAULT now(),
  dernier_ouvert_le timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT acces_historique_pkey PRIMARY KEY (compte_id)
);

CREATE TABLE IF NOT EXISTS produit_recemment_vu (
  compte_id  uuid        NOT NULL,
  produit_id text        NOT NULL,
  vu_le      timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT produit_recemment_vu_pkey PRIMARY KEY (compte_id, produit_id)
);

CREATE TABLE IF NOT EXISTS session_mesure (
  session_id         uuid        NOT NULL DEFAULT gen_random_uuid(),
  debut_le           timestamptz NOT NULL DEFAULT now(),
  fin_le             timestamptz,
  saisie_premiere    boolean     NOT NULL DEFAULT false,
  sortie_paiement_le timestamptz,
  CONSTRAINT session_mesure_pkey PRIMARY KEY (session_id)
);

CREATE TABLE IF NOT EXISTS marqueur_ouverture (
  marqueur_id       uuid        NOT NULL DEFAULT gen_random_uuid(),
  compte_id         uuid        NOT NULL,
  onglet            text        NOT NULL,
  premier_ouvert_le timestamptz NOT NULL DEFAULT now(),
  dernier_ouvert_le timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT marqueur_ouverture_pkey PRIMARY KEY (marqueur_id)
);

CREATE TABLE IF NOT EXISTS compteur_mesure (
  code   text        NOT NULL,
  valeur bigint      NOT NULL DEFAULT 0,
  maj_le timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT compteur_mesure_pkey PRIMARY KEY (code)
);

CREATE TABLE IF NOT EXISTS fenetre_mesure (
  id                smallint    NOT NULL DEFAULT 1,
  debut             timestamptz NOT NULL,
  duree_session_min smallint    NOT NULL DEFAULT 30,
  close_le          timestamptz,
  CONSTRAINT fenetre_mesure_pkey PRIMARY KEY (id)
);

-- 2. Unicité, clés étrangères et bornes.
ALTER TABLE correspondance
  ADD CONSTRAINT correspondance_compte_unique UNIQUE (compte_id);

ALTER TABLE correspondance
  ADD CONSTRAINT correspondance_compte_fkey FOREIGN KEY (compte_id)
  REFERENCES compte (compte_id) ON DELETE CASCADE;

ALTER TABLE correspondance
  ADD CONSTRAINT correspondance_statut_connu CHECK (statut IN ('en_attente', 'reussi', 'echoue'));

ALTER TABLE correspondance
  ADD CONSTRAINT correspondance_motif_connu CHECK (motif_echec IS NULL OR motif_echec IN ('aucune_correspondance', 'ambigu'));

ALTER TABLE correspondance
  ADD CONSTRAINT correspondance_gid_shopify CHECK (client_shopify_id IS NULL OR client_shopify_id ~ '^gid://shopify/Customer/[0-9]+$');

ALTER TABLE correspondance
  ADD CONSTRAINT correspondance_decision_coherente CHECK (
    (statut = 'en_attente' AND motif_echec IS NULL AND client_shopify_id IS NULL AND decidee_le IS NULL)
    OR (statut = 'reussi'  AND motif_echec IS NULL AND client_shopify_id IS NOT NULL AND decidee_le IS NOT NULL)
    OR (statut = 'echoue'  AND motif_echec IS NOT NULL AND client_shopify_id IS NULL AND decidee_le IS NOT NULL)
  );

ALTER TABLE compte
  ADD CONSTRAINT compte_tentatives_borne CHECK (tentatives_rapprochement BETWEEN 0 AND 3);

ALTER TABLE compte
  ADD CONSTRAINT compte_confirmation_apres_creation CHECK (email_confirme_le IS NULL OR email_confirme_le >= cree_le);

ALTER TABLE acces_historique
  ADD CONSTRAINT acces_historique_compte_fkey FOREIGN KEY (compte_id)
  REFERENCES compte (compte_id) ON DELETE CASCADE;

ALTER TABLE acces_historique
  ADD CONSTRAINT acces_historique_chronologie CHECK (dernier_ouvert_le >= premier_ouvert_le);

ALTER TABLE produit_recemment_vu
  ADD CONSTRAINT produit_recemment_vu_compte_fkey FOREIGN KEY (compte_id)
  REFERENCES compte (compte_id) ON DELETE CASCADE;

ALTER TABLE produit_recemment_vu
  ADD CONSTRAINT produit_recemment_vu_handle CHECK (produit_id ~ '^[a-z0-9][a-z0-9-]{0,119}$');

ALTER TABLE session_mesure
  ADD CONSTRAINT session_mesure_fin CHECK (fin_le IS NULL OR fin_le >= debut_le);

ALTER TABLE session_mesure
  ADD CONSTRAINT session_mesure_sortie CHECK (sortie_paiement_le IS NULL OR sortie_paiement_le >= debut_le);

ALTER TABLE marqueur_ouverture
  ADD CONSTRAINT marqueur_ouverture_onglet_unique UNIQUE (compte_id, onglet);

ALTER TABLE marqueur_ouverture
  ADD CONSTRAINT marqueur_ouverture_compte_fkey FOREIGN KEY (compte_id)
  REFERENCES compte (compte_id) ON DELETE CASCADE;

ALTER TABLE marqueur_ouverture
  ADD CONSTRAINT marqueur_ouverture_onglet_connu CHECK (onglet IN ('accueil', 'recherche', 'commandes', 'compte'));

ALTER TABLE marqueur_ouverture
  ADD CONSTRAINT marqueur_ouverture_chronologie CHECK (dernier_ouvert_le >= premier_ouvert_le);

ALTER TABLE compteur_mesure
  ADD CONSTRAINT compteur_mesure_code_connu CHECK (code IN (
    'comptes_crees',
    'correspondances_reussies',
    'correspondances_echouees',
    'commandes_ouvertes_j0',
    'commandes_ouvertes_24h',
    'commandes_ouvertes_7j',
    'commandes_ouvertes_30j',
    'commandes_ouvertes_90j',
    'sessions',
    'sessions_saisie_premiere',
    'sessions_sortie_paiement'
  ));

ALTER TABLE compteur_mesure
  ADD CONSTRAINT compteur_mesure_valeur_positive CHECK (valeur >= 0);

ALTER TABLE fenetre_mesure
  ADD CONSTRAINT fenetre_mesure_singleton CHECK (id = 1);

ALTER TABLE fenetre_mesure
  ADD CONSTRAINT fenetre_mesure_duree_plausible CHECK (duree_session_min BETWEEN 5 AND 240);

ALTER TABLE fenetre_mesure
  ADD CONSTRAINT fenetre_mesure_fermeture CHECK (close_le IS NULL OR close_le > debut);

-- 3. Index
CREATE UNIQUE INDEX IF NOT EXISTS correspondance_client_unique
  ON correspondance (client_shopify_id)
  WHERE statut = 'reussi' AND client_shopify_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS marqueur_ouverture_lecture
  ON marqueur_ouverture (compte_id, dernier_ouvert_le DESC);

CREATE INDEX IF NOT EXISTS session_mesure_sortie
  ON session_mesure (sortie_paiement_le) WHERE sortie_paiement_le IS NOT NULL;

CREATE INDEX IF NOT EXISTS produit_recemment_vu_lecture
  ON produit_recemment_vu (compte_id, vu_le DESC);

-- 4. Fonctions
CREATE OR REPLACE FUNCTION verrouiller_correspondance() RETURNS trigger
LANGUAGE plpgsql AS $fn$
BEGIN
  IF OLD.statut <> 'en_attente' THEN
    RAISE EXCEPTION $$Une correspondance decidee est definitive : B3 interdit tout rejeu, y compris une mise a jour qui ne change pas le statut.$$;
  END IF;
  RETURN NEW;
END;
$fn$;

CREATE OR REPLACE FUNCTION exiger_acces_ferme() RETURNS trigger
LANGUAGE plpgsql AS $fn$
DECLARE
  confirme_le timestamptz;
BEGIN
  SELECT email_confirme_le INTO confirme_le FROM compte WHERE compte_id = NEW.compte_id;
  IF confirme_le IS NULL THEN
    RAISE EXCEPTION $$Acces refuse : B2 exige une adresse e-mail confirmee. Un defaut de confirmation est un refus, jamais un acces accorde par defaut.$$;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM correspondance WHERE compte_id = NEW.compte_id AND statut = 'reussi') THEN
    RAISE EXCEPTION $$Acces refuse : B4 exige une correspondance reussie et definitive avant toute lecture d historique.$$;
  END IF;
  RETURN NEW;
END;
$fn$;

CREATE OR REPLACE FUNCTION figer_fenetre_mesure() RETURNS trigger
LANGUAGE plpgsql AS $fn$
BEGIN
  RAISE EXCEPTION $$La fenetre d observation s ouvre une fois et ne se deplace pas : B3 la rend unique et definitive.$$;
END;
$fn$;

CREATE OR REPLACE FUNCTION proteger_compteur() RETURNS trigger
LANGUAGE plpgsql AS $fn$
BEGIN
  IF NEW.valeur < OLD.valeur THEN
    RAISE EXCEPTION $$Un compteur de mesure ne diminue jamais.$$;
  END IF;
  RETURN NEW;
END;
$fn$;

CREATE OR REPLACE FUNCTION interdire_suppression_compteur() RETURNS trigger
LANGUAGE plpgsql AS $fn$
BEGIN
  RAISE EXCEPTION $$Un compteur de mesure ne se supprime pas : E5 efface le compte, pas le denominateur de la regle d arret.$$;
END;
$fn$;

-- 5. Triggers
CREATE TRIGGER correspondance_decision_definitive
  BEFORE UPDATE ON correspondance
  FOR EACH ROW EXECUTE FUNCTION verrouiller_correspondance();

CREATE TRIGGER acces_historique_acces_ferme
  BEFORE INSERT OR UPDATE ON acces_historique
  FOR EACH ROW EXECUTE FUNCTION exiger_acces_ferme();

CREATE TRIGGER fenetre_mesure_immuable
  BEFORE UPDATE ON fenetre_mesure
  FOR EACH ROW EXECUTE FUNCTION figer_fenetre_mesure();

CREATE TRIGGER compteur_mesure_monotone
  BEFORE UPDATE ON compteur_mesure
  FOR EACH ROW EXECUTE FUNCTION proteger_compteur();

CREATE TRIGGER compteur_mesure_ineffacable
  BEFORE DELETE ON compteur_mesure
  FOR EACH ROW EXECUTE FUNCTION interdire_suppression_compteur();
```

**La seule instruction de ce DDL qui n'est pas exécutée par ce document**, parce qu'elle appartient à la plateforme et non à notre migration :

```text
-- Exécuté par la plateforme Supabase, pas par ce fichier.
-- Il est écrit ici pour que la clé étrangère existe et ne soit pas oubliée.
ALTER TABLE public.compte
  ADD CONSTRAINT compte_auth_fkey
  FOREIGN KEY (compte_id) REFERENCES auth.users (id) ON DELETE CASCADE;
```

Elle n'est pas dans un bloc `sql` : `auth.users` n'est pas une table que ce projet crée, et la déclarer dans le DDL ferait dire au contrôle qu'une table est utilisée sans être jamais créée — ce qui serait exact et ne rapporterait rien. Elle est dans un bloc `text` pour être lisible et exécutée par le mécanisme qui possède cette table.

#### 4.10.2 Jeu d'essai

> Ce bloc **pose des données**, il ne déclare pas de schéma. C'est la distinction que `ddl-exec` fait sur la première instruction du bloc, et la raison pour laquelle il est séparé : un `INSERT` pris pour une déclaration de schéma est le premier des trois défauts que cette section existe pour attraper.

```sql
-- Quatre comptes, deux correspondances, une fenêtre, des compteurs. Puis un
-- compte est supprime : si la cascade n'etait pas declaree, PostgreSQL refuserait
-- cette suppression, et l'execution le dirait.
INSERT INTO compte (compte_id, cree_le, email_confirme_le, tentatives_rapprochement) VALUES
  ('11111111-1111-4111-8111-111111111111', '2026-10-01T09:00:00Z', '2026-10-01T09:04:00Z', 0),
  ('22222222-2222-4222-8222-222222222222', '2026-10-01T10:00:00Z', '2026-10-01T10:03:00Z', 2),
  ('33333333-3333-4333-8333-333333333333', '2026-10-02T11:00:00Z', NULL, 0),
  ('44444444-4444-4444-8444-444444444444', '2026-10-02T12:00:00Z', '2026-10-02T12:02:00Z', 1);

INSERT INTO correspondance (compte_id, statut, client_shopify_id, motif_echec, cree_le, decidee_le) VALUES
  ('11111111-1111-4111-8111-111111111111', 'reussi', 'gid://shopify/Customer/4711', NULL, '2026-10-01T09:05:00Z', '2026-10-01T09:05:02Z'),
  ('22222222-2222-4222-8222-222222222222', 'echoue', NULL, 'aucune_correspondance', '2026-10-01T10:05:00Z', '2026-10-01T10:05:01Z'),
  ('44444444-4444-4444-8444-444444444444', 'echoue', NULL, 'ambigu', '2026-10-02T12:05:00Z', '2026-10-02T12:05:01Z');

INSERT INTO acces_historique (compte_id, premier_ouvert_le, dernier_ouvert_le) VALUES
  ('11111111-1111-4111-8111-111111111111', '2026-10-01T18:00:00Z', '2026-10-01T18:00:00Z');

INSERT INTO produit_recemment_vu (compte_id, produit_id, vu_le) VALUES
  ('11111111-1111-4111-8111-111111111111', 'chaussures-hiver', '2026-10-01T19:00:00Z');

INSERT INTO session_mesure (session_id, debut_le, saisie_premiere, sortie_paiement_le) VALUES
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', '2026-10-01T17:00:00Z', true, '2026-10-01T17:40:00Z');

INSERT INTO marqueur_ouverture (compte_id, onglet, premier_ouvert_le, dernier_ouvert_le) VALUES
  ('11111111-1111-4111-8111-111111111111', 'commandes', '2026-10-01T18:00:00Z', '2026-10-01T18:00:00Z');

INSERT INTO compteur_mesure (code, valeur) VALUES
  ('comptes_crees', 4),
  ('correspondances_reussies', 1),
  ('correspondances_echouees', 2),
  ('sessions', 11),
  ('sessions_saisie_premiere', 4),
  ('sessions_sortie_paiement', 1);

INSERT INTO fenetre_mesure (id, debut, duree_session_min) VALUES
  (1, '2026-10-01T00:00:00Z', 30);

-- E5 : le compte 44444444 et la ligne de correspondance qui lui était rattachée
-- disparaissent. Une cascade absente rendrait cette suppression impossible.
DELETE FROM compte WHERE compte_id = '44444444-4444-4444-8444-444444444444';

-- Deux vérifications d'E5, exécutées et non affirmées : elles échouent si la
-- suppression a emporté plus — ou moins — que le compte.
DO $verif$
BEGIN
  IF EXISTS (SELECT 1 FROM correspondance WHERE compte_id = '44444444-4444-4444-8444-444444444444') THEN
    RAISE EXCEPTION $$E5 : la ligne de correspondance aurait du disparaitre avec le compte.$$;
  END IF;
  IF (SELECT valeur FROM compteur_mesure WHERE code = 'comptes_crees') <> 4 THEN
    RAISE EXCEPTION $$E5 : le denominateur de la regle d arret ne doit pas bouger.$$;
  END IF;
END;
$verif$;
```

#### 4.10.3 Gardes déclarées

> Le nom de l'opération interdite n'est pas deviné par le contrôle : **c'est le document qui le nomme**. Une garde non déclarée n'est pas testée — ni par un script, ni par un relecteur, ni par elle-même.

```sql
-- forge:ddl-refuse
-- B5 : au-delà de trois tentatives, le compteur s'arrête. Si cette instruction
-- passe, la borne n'existe pas et B5 n'est tenu que par un `if` de composant.
UPDATE compte SET tentatives_rapprochement = 4 WHERE compte_id = '22222222-2222-4222-8222-222222222222';
```

```sql
-- forge:ddl-refuse
-- B3 : une correspondance décidée est définitive. L'instruction ci-dessous ne
-- change pas le statut, elle ne touche qu'une autre colonne : une garde qui ne
-- s'attraperait qu'aux transitions de statut la laisserait passer au travers.
-- C'est le deuxième des trois défauts nommés en tête de section, écrit à
-- l'envers pour qu'il ne puisse plus se reproduire tel quel.
UPDATE correspondance SET client_shopify_id = 'gid://shopify/Customer/9001' WHERE compte_id = '22222222-2222-4222-8222-222222222222';
```

```sql
-- forge:ddl-refuse
-- B3 : le rapprochement ne s'ouvre qu'une fois. Une seconde ligne pour le même
-- compte est un rejeu, même si elle est encore « en attente ».
INSERT INTO correspondance (compte_id, statut) VALUES ('11111111-1111-4111-8111-111111111111', 'en_attente');
```

```sql
-- forge:ddl-refuse
-- B4 : aucun accès à l'historique sans correspondance réussie. Ce compte est
-- confirmé mais son rapprochement a échoué : l'insertion doit être refusée par
-- le trigger, et le dire en citant B4.
INSERT INTO acces_historique (compte_id) VALUES ('22222222-2222-4222-8222-222222222222');
```

```sql
-- forge:ddl-refuse
-- B2 : un compte dont l'adresse n'est pas confirmée n'ouvre pas d'historique
-- non plus. Si cette instruction passait, un défaut de confirmation serait un
-- accès accordé par défaut — exactement ce que la règle fail-closed interdit.
INSERT INTO acces_historique (compte_id) VALUES ('33333333-3333-4333-8333-333333333333');
```

```sql
-- forge:ddl-refuse
-- C9 : un identifiant de personne ne peut pas entrer dans un compteur, même
-- comme clé. La liste fermée de `code` est ce qui rend la ligne tenable en base
-- plutôt qu'en intention.
INSERT INTO compteur_mesure (code, valeur) VALUES ('client_2f8a1c@exemple.fr', 1);
```

```sql
-- forge:ddl-refuse
-- C9 et Q-C : la table de mesure ne porte aucune colonne d'identification de
-- personne. La jointure « compte créé / Commandes ouverte » se fait ailleurs,
-- dans marqueur_ouverture, côté serveur. Si cette requête devenait exécutable,
-- quelqu'un aurait ajouté un lien — et C9 aurait déjà été violé en amont.
SELECT count(*) FROM session_mesure WHERE compte_id IS NOT NULL;
```

```sql
-- forge:ddl-refuse
-- B3 : la fenêtre d'observation s'ouvre une fois. Elle ne se déplace pas, même
-- pour corriger une date de publication.
UPDATE fenetre_mesure SET debut = debut + interval '1 day';
```

```sql
-- forge:ddl-refuse
-- E5 : supprimer un compte ne doit pas supprimer le dénominateur de la règle
-- d'arrêt. Un compteur ne s'efface pas.
DELETE FROM compteur_mesure WHERE code = 'comptes_crees';
```

```sql
-- forge:ddl-refuse
-- C9 : un compteur ne diminue pas non plus. Sans cette porte, un correctif mal
-- écrit pourrait rendre un suivi d'arrêt non reproductible, et rien ne le
-- signalerait.
UPDATE compteur_mesure SET valeur = valeur - 1 WHERE code = 'comptes_crees';
```

**Ce que ces dix gardes couvrent, et ce qu'elles ne couvrent pas.** Elles couvrent B5, B3, B2, B4, C9 et E5 — six des quinze règles les plus dures du PRD, chacune **exécutée** et non affirmée. Elles ne couvrent pas B13, dont la règle « les deux dates ensemble ou aucune » n'est pas une contrainte de base mais une contrainte de rendu : c'est une propriété du composant `LigneCommande`, et son test est un test de composant. C'est dit ici pour qu'on ne croie pas que dix portes en base ferment le périmètre.

---

## 5. Contrats API

**Une seule surface, et elle est serverless.** L'application appelle la fonction ; la fonction est la seule à toucher la base (ADR-1) et la seule à parler au marchand en API Admin. Les API externes ne sont pas re-documentées comme les nôtres : le § 5.10 dit ce que nous en lisons et ce que nous n'en lisons pas.

**Pourquoi un refus d'accès est un état et pas un code d'erreur.** C'est la décision la plus structurante de cette section. Un refus d'historique (adresse non confirmée, correspondance échouée) **doit** être rendu comme un panneau d'état, avec un libellé écrit et une action (`design-system.md` § 5, panneau d'état, variantes `acces-refuse` et `correspondance-echouee`). Renvoyer `403` obligerait l'écran à traduire un code en phrase, et le travail serait fait deux fois, une fois par erreur et une fois par défaut. Donc : `401` signifie « je ne sais plus qui tu es » et déclenche une ré-authentification ; tout le reste est un état de données rendu en `200`. La distinction n'est pas cosmétique — c'est B7 appliqué aux questions d'accès.

### 5.1 Lister les commandes rattachées

- **Méthode** : `GET`
- **Path** : `/api/v1/commandes`
- **Auth** : bearer (jeton de session Supabase)
- **Rate limit** : 30 requêtes / minute par compte, 1 requête par ouverture d'onglet (dédupliquée par `Idempotence-Key`)
- **Idempotence** : oui, par lecture

**Requête** :

```http
GET /api/v1/commandes?depuis=2026-10-01T00:00:00Z HTTP/1.1
Authorization: Bearer <access_token>
Idempotence-Key: 7f2c-…
```

| Paramètre | Type | Requis | Description |
|---|---|---|---|
| `Authorization` | header, bearer | oui | Jeton de session. Sa présence ne suffit pas : l'accès à l'historique est ouvert par `acces_historique` (B2, B4). |
| `depuis` | query, ISO 8601 | non | Borne basse sur la date de commande. Par défaut : la `debut` de `fenetre_mesure` si elle existe, sinon l'origine. |
| `Idempotence-Key` | header, uuid | oui | Évite qu'un double rendu d'écran (B8) compte deux ouvertures. |

**Réponse (succès)** — toujours `200`, toujours une union discriminée :

```json
{
  "etat": "valeurs",
  "lu_le": "2026-10-02T18:04:11Z",
  "valeurs": [
    {
      "reference": "ONDL-1042",
      "place_le": "2026-10-01T14:22:00Z",
      "livree_le": "2026-10-04T00:00:00Z",
      "limite_retour_le": "2026-10-18T00:00:00Z",
      "etat_fulfilment": "expediee",
      "articles": [{ "handle": "chaussures-hiver", "titre": "…", "quantite": 1 }]
    }
  ]
}
```

| `etat` | Quand | Ce que l'écran rend |
|---|---|---|
| `valeurs` | Des commandes existent | La liste. Les deux dates sont **ensemble** ou absentes (B13). |
| `aucune-donnee` | Correspondance réussie, zéro commande | Panneau « aucune commande pour le moment », avec le lien vers le site du marchand. **Jamais** un compteur à 0. |
| `correspondance-echouee` | Rapprochement définitivement échoué | Panneau « aucune commande trouvée à cette adresse » + compteur de tentatives ; lien et compteur disparaissent au-delà de 3 (B5). |
| `acces-refuse` | Adresse non confirmée | Panneau « confirmez l'adresse e-mail de votre compte ». |
| `hors-ligne` | Réseau absent, copie locale disponible | La copie **avec son âge**, en lecture seule, sans aucune action d'écriture (C8, B19). |
| `indisponible` | La source n'a pas répondu | « Indisponible pour le moment » + « Réessayer ». **Jamais** une liste vide, jamais un statut par défaut (E2, B7). |

**Codes d'erreur** :

| Code | Condition | Message |
|---|---|---|
| 400 | `depuis` mal formé | `"depuis must be an ISO 8601 date"` |
| 401 | Jeton absent, expiré ou révoqué | `"Session requise"` — l'application tente un rafraîchissement, puis l'écran Compte |
| 404 | Route inconnue sous `/api/v1` | `"Route not found"` |
| 422 | `Idempotence-Key` absent ou mal formé | `"Idempotence-Key header required"` |
| 429 | Plus de 30 requêtes par minute | `"Trop de requêtes"` — l'application garde la dernière valeur connue et affiche son âge |
| 500 | Défaut de la fonction | `"Erreur interne"` — Sentry porte la révision exacte |
| 502 | La source du marchand a répondu par une erreur | `"Le marchand est indisponible"` — **affiché tel quel**, jamais masqué ni réécrit (B6, E12) |
| 504 | La source n'a pas répondu dans le délai | `"Délai dépassé"` — l'état `indisponible` est rendu, pas un chargement |

**Note sur l'absence de `403` et de `409`** : il n'y en a pas, et c'est délibéré. Un refus d'accès est un `etat` de la réponse parce qu'il doit être rendu en phrase ; un conflit n'existe pas parce que la lecture ne crée rien. Les écrire ici serait annoncer un code que le serveur ne rend jamais.

### 5.2 Déclencher l'unique rapprochement

- **Méthode** : `POST`
- **Path** : `/api/v1/compte/rapprochement`
- **Auth** : bearer
- **Rate limit** : 3 par compte et par heure — la borne est B5, appliquée au serveur et pas seulement à l'écran
- **Idempotence** : oui — une seconde appel sur un compte déjà tranché renvoie l'état existant sans rien écrire

**Requête** :

```http
POST /api/v1/compte/rapprochement HTTP/1.1
Authorization: Bearer <access_token>
Content-Type: application/json

{ "adresse_alternative": "camille@exemple.fr" }
```

| Paramètre | Type | Requis | Description |
|---|---|---|---|
| `adresse_alternative` | `string \| null`, e-mail | non | Tentative suivante après un échec (B5). **Jamais stockée** (ADR-6) : lue, interrogée, abandonnée. Absente ou `null` = première tentative sur l'adresse du compte. |
| `Idempotence-Key` | header, uuid | oui | Une tentative, une clé. |

**Réponse (succès)** :

```json
{
  "etat": "reussi",
  "tentatives_utilisees": 1,
  "tentatives_restantes": 2,
  "commandes_cles": 7
}
```

**Codes d'erreur** :

| Code | Condition | Message |
|---|---|---|
| 400 | `adresse_alternative` n'est pas une adresse | `"Adresse e-mail invalide"` |
| 401 | Jeton absent ou expiré | `"Session requise"` |
| 403 | Adresse du compte non confirmée — le rapprochement n'a même pas lieu | `"Confirmez votre adresse e-mail avant de rattacher vos commandes"` |
| 409 | Une tentative a déjà produit un résultat **définitif** (B3) | `"Rapprochement déjà effectué et définitif"` — avec l'état existant dans le corps, pour que l'écran montre le résultat et non une erreur |
| 409 | Trois tentatives consommées (B5) | `"Trois tentatives ont déjà été utilisées"` |
| 422 | Le compte n'existe pas côté serveur | `"Compte introuvable"` |
| 429 | Plus de 3 tentatives par heure | `"Trop de tentatives"` |
| 502 | L'API Admin a échoué | `"Correspondance indisponible pour le moment"` — **rien n'est écrit**, la tentative n'est pas consommée (B3 : interdire le rejeu n'est pas interdire de ne pas avoir joué) |
| 504 | L'API Admin n'a pas répondu | `"Délai dépassé"` — même traitement que 502 |

### 5.3 Supprimer le compte

- **Méthode** : `DELETE`
- **Path** : `/api/v1/compte`
- **Auth** : bearer
- **Rate limit** : sans objet
- **Idempotence** : oui — un second appel renvoie `204` sans rien faire de plus

**Requête** :

```http
DELETE /api/v1/compte HTTP/1.1
Authorization: Bearer <access_token>
```

| Paramètre | Type | Requis | Description |
|---|---|---|---|
| `Authorization` | header, bearer | oui | Session. La suppression exige la session **confirmée** : un compte en attente de confirmation se supprime, mais rien d'autre n'est attaché. |
| `motif` | body, `enum('volonte','injoignable')` | oui | **Obligatoire et non enregistré** dans une table de comptes : il n'y a pas de table de demandes de suppression, donc il ne peut pas y avoir de suivi. C'est un manque assumé, écrit ici pour qu'il soit visible. |

**Réponse (succès)** :

```json
{ "supprime_le": "2026-10-05T11:20:00Z", "donnees_conservees": ["compteurs de mesure anonymes"] }
```

**Codes d'erreur** :

| Code | Condition | Message |
|---|---|---|
| 401 | Jeton absent ou expiré | `"Session requise"` |
| 409 | La confirmation e-mail n'est pas encore faite | `"Confirmez votre adresse e-mail avant de supprimer le compte"` |
| 422 | `motif` absent ou hors liste | `"motif must be 'volonte' or 'injoignable'"` |
| 502 | La source du marchand n'a pas répondu à la révocation de jeton | `"Suppression partiellement effectuée"` — le compte local est déjà supprimé, et l'écran le dit |

**Ce qui n'est pas supprimé, et pourquoi c'est écrit ici** : les compteurs de mesure. E5 dit que les données applicatives du client sont supprimées ; un compteur ne contient aucun identifiant (C9) et c'est le dénominateur de la règle d'arrêt du `prd.md` § 8. Le supprimer rendrait la règle indécidable, et une règle indécidable est pire qu'une donnée conservée. Les commandes restent chez le marchand et ne sont pas notre propriété — c'est E5 qui le dit.

### 5.4 Lire les produits récemment vus

- **Méthode** : `GET`
- **Path** : `/api/v1/compte/recents`
- **Auth** : bearer — un compte non confirmé reçoit la liste vide, pas un `403`
- **Rate limit** : sans objet
- **Idempotence** : oui, par lecture

**Requête** :

```http
GET /api/v1/compte/recents?limite=8 HTTP/1.1
Authorization: Bearer <access_token>
```

| Paramètre | Type | Requis | Description |
|---|---|---|---|
| `limite` | query, entier 1-20 | non | Nombre de handles rendus. Défaut 8. |
| `Authorization` | header, bearer | oui | Session. Sans correspondance réussie, la liste est vide **et** le rail affiche quand même autre chose (B10). |

**Réponse (succès)** :

```json
{ "etat": "valeurs", "handles": ["chaussures-hiver", "echarpe-laine"], "lus_le": "2026-10-02T19:00:04Z" }
```

**Codes d'erreur** :

| Code | Condition | Message |
|---|---|---|
| 400 | `limite` hors bornes | `"limite must be between 1 and 20"` |
| 401 | Jeton absent ou expiré | `"Session requise"` |
| 429 | Débit dépassé | `"Trop de requêtes"` |
| 502 | La source du marchand ne répond pas | `"Catalogue indisponible"` — le rail affiche sa dernière valeur connue **avec son âge** (B7) |
| 504 | Délai dépassé | `"Délai dépassé"` |

### 5.5 Enregistrer une consultation

- **Méthode** : `PUT`
- **Path** : `/api/v1/compte/recents/:handle`
- **Auth** : bearer
- **Rate limit** : 60 par minute et par compte
- **Idempotence** : oui — c'est un `PUT` sur la clé `(compte_id, produit_id)`

**Requête** :

```http
PUT /api/v1/compte/recents/chaussures-hiver HTTP/1.1
Authorization: Bearer <access_token>
```

| Paramètre | Type | Requis | Description |
|---|---|---|---|
| `handle` | path, `^[a-z0-9][a-z0-9-]{0,119}$` | oui | Le handle Shopify. La contrainte est **la même** que le `CHECK` de la colonne : un handle invalide est refusé à la frontière et en base. |

**Réponse (succès)** : `204`, sans corps. **Aucun titre, aucun prix, aucune image ne sont acceptés ni stockés** : E7 et B23.

**Codes d'erreur** :

| Code | Condition | Message |
|---|---|---|
| 400 | `handle` mal formé | `"handle must match ^[a-z0-9][a-z0-9-]{0,119}$"` |
| 401 | Jeton absent ou expiré | `"Session requise"` |
| 422 | Le handle n'existe pas chez le marchand | `"Produit introuvable"` — l'enregistrement est ignoré, pas rejeté : c'est une observation, pas une saisie |
| 429 | Débit dépassé | `"Trop de requêtes"` |
| 502 | La source du marchand ne répond pas | `"Produit indisponible"` |

### 5.6 Ouvrir une session de mesure

- **Méthode** : `POST`
- **Path** : `/api/v1/mesure/session`
- **Auth** : **aucune** — et c'est obligatoire : un événement de session ne peut pas être authentifié, donc il ne peut pas transporter d'identité (C9)
- **Rate limit** : 20 par heure et par installation identifiée par un identifiant technique non personnel
- **Idempotence** : non — deux ouvertures sont deux sessions

**Requête** :

```http
POST /api/v1/mesure/session HTTP/1.1
Content-Type: application/json

{ "installation_id": "0f3a…", "version_app": "1.0.0", "revision_js": "a1b2c3d" }
```

| Paramètre | Type | Requis | Description |
|---|---|---|---|
| `installation_id` | body, uuid | oui | Identifiant **d'installation**, tiré au sort à la première ouverture, stocké dans le secure store. Ce n'est pas une personne : il ne se rattache à aucun compte, et il ne sert qu'à limiter le débit. |
| `version_app` | body, `x.y.z` | oui | Version de l'application. |
| `revision_js` | body, chaîne de 7 à 40 | oui | Révision JavaScript publiée, donc chaque mise à jour à chaud est distinguée dans les chiffres (C11). |

**Réponse (succès)** :

```json
{ "session_id": "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa", "debut_le": "2026-10-01T17:00:00Z" }
```

**Codes d'erreur** :

| Code | Condition | Message |
|---|---|---|
| 400 | `installation_id` ou `revision_js` mal formé | `"Payload invalide"` |
| 422 | `version_app` non conforme au format sémantique | `"version_app must match x.y.z"` |
| 429 | Plus de 20 sessions par heure | `"Trop de sessions ouvertes"` — l'application continue de fonctionner, elle ne mesure plus |
| 500 | Défaut de la fonction | `"Erreur interne"` |

### 5.7 Marquer le premier geste de recherche

- **Méthode** : `POST`
- **Path** : `/api/v1/mesure/session/:session_id/recherche`
- **Auth** : aucune
- **Rate limit** : sans objet
- **Idempotence** : oui — seul le **premier** geste compte, et les suivants sont ignorés

**Requête** :

```http
POST /api/v1/mesure/session/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa/recherche HTTP/1.1
Idempotence-Key: 1c9e-…
```

| Paramètre | Type | Requis | Description |
|---|---|---|---|
| `session_id` | path, uuid | oui | Session ouverte par 5.6. |
| `Idempotence-Key` | header, uuid | oui | Une session, une seule bascule de `saisie_premiere` de `false` à `true`. |

**Réponse (succès)** : `204`, sans corps. **Le champ de recherche n'est pas transmis** : seul le fait compte, et un texte de recherche est une donnée personnelle (C9).

**Codes d'erreur** :

| Code | Condition | Message |
|---|---|---|
| 400 | `session_id` mal formé | `"session_id must be a uuid"` |
| 404 | Session inconnue ou déjà close | `"Session inconnue"` |
| 422 | `Idempotence-Key` absent | `"Idempotence-Key header required"` |
| 429 | Débit dépassé | `"Trop de requêtes"` |

### 5.8 Marquer une sortie vers le paiement

- **Méthode** : `POST`
- **Path** : `/api/v1/mesure/session/:session_id/sortie-paiement`
- **Auth** : aucune
- **Rate limit** : sans objet
- **Idempotence** : oui — deux appels sur la même session n'écrivent qu'une fois

**Requête** :

```http
POST /api/v1/mesure/session/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa/sortie-paiement HTTP/1.1
Idempotence-Key: 4d20-…
X-Mecanisme-Sortie: a-confirmer
```

| Paramètre | Type | Requis | Description |
|---|---|---|---|
| `session_id` | path, uuid | oui | Session ouverte par 5.6. |
| `X-Mecanisme-Sortie` | header, `a-confirmer \| a-declarer` | oui | **Quel mécanisme B12 a été utilisé.** `a-confirmer` = l'URL de paiement a été obtenue et affichée ; `a-declarer` = aucun mécanisme n'a pu être établi et la sortie a été un lien nu. C'est la seule façon de mesurer le critère principal sans mentir sur ce qu'il mesure. |
| `Idempotence-Key` | header, uuid | oui | Une sortie par session. |

**Réponse (succès)** : `204`, sans corps.

**Codes d'erreur** :

| Code | Condition | Message |
|---|---|---|
| 400 | `session_id` ou `X-Mecanisme-Sortie` hors liste | `"En-tête ou identifiant invalide"` |
| 404 | Session inconnue | `"Session inconnue"` |
| 422 | `Idempotence-Key` absent | `"Idempotence-Key header required"` |
| 429 | Débit dépassé | `"Trop de requêtes"` |

### 5.9 Marquer l'ouverture d'un onglet

- **Méthode** : `POST`
- **Path** : `/api/v1/mesure/ouverture-onglet`
- **Auth** : bearer — **le seul endpoint de mesure authentifié**, parce qu'il est le seul qui joint un compte (Q-C)
- **Rate limit** : 60 par minute et par compte
- **Idempotence** : oui — `(compte_id, onglet)` est unique, l'écriture est un `INSERT … ON CONFLICT` qui ne touche qu'à `dernier_ouvert_le`

**Requête** :

```http
POST /api/v1/mesure/ouverture-onglet HTTP/1.1
Authorization: Bearer <access_token>
Content-Type: application/json

{ "onglet": "commandes", "premier_geste": true }
```

| Paramètre | Type | Requis | Description |
|---|---|---|---|
| `onglet` | body, `enum` | oui | L'un des quatre onglets du `design-system.md` § 4. La liste est fermée des deux côtés : serveur et base. |
| `premier_geste` | body, boolean | oui | Vrai si l'ouverture est la première de cet onglet pour ce compte. C'est ce booléen qui alimente les quatre fenêtres de Q-B. |

**Réponse (succès)** :

```json
{ "onglet": "commandes", "premier_ouvert_le": "2026-10-01T18:00:00Z", "nouvelle_fenetre": "commandes_ouvertes_j0" }
```

**Codes d'erreur** :

| Code | Condition | Message |
|---|---|---|
| 400 | `onglet` hors liste fermée | `"onglet must be one of accueil, recherche, commandes, compte"` |
| 401 | Jeton absent ou expiré | `"Session requise"` |
| 409 | `premier_geste: false` alors que le marqueur n'existe pas | `"Marqueur absent"` — un `false` sans première ouverture est une contradiction |
| 422 | `onglet` ou `premier_geste` absent | `"onglet and premier_geste are required"` |
| 429 | Débit dépassé | `"Trop de requêtes"` |

### 5.10 Contrats externes — ce que nous lisons chez le marchand, et rien de plus

| Source | Ce que nous lisons | Ce que nous ne lisons pas | Pourquoi |
|---|---|---|---|
| Storefront API — catalogue | Produits, variantes, `availableForSale`, prix, `handle`, images | Aucune écriture, aucun panier créé côté serveur | Le catalogue est consultable sans compte (B1) ; notre rôle est de le montrer, pas de le détenir (B6, B23) |
| Storefront API — recherche | Résultats paginés par nom | Aucun index miroir | `conventions.md` exclut un index de recherche externe ; un index est une copie du catalogue |
| Storefront API — panier | Création, ajout, relecture, URL de paiement | **Jamais** de numéro de carte, **jamais** de paiement | C3, et c'est aussi pourquoi l'application ne peut pas mesurer autre chose qu'une sortie (B12) |
| Admin API — clients | `customers.json` filtré sur l'adresse, une fois, à la confirmation | Une synchronisation, une pagination de tout le portefeuille | C14 : toute ingestion récurrente est refusée. Le rapprochement est une **lecture unique** (ADR-5) |
| Admin API — commandes | Commandes d'un client, pour la liste de l'onglet | Aucune copie stockée, aucune normalisation, aucun arrondi | B6 et B23 : le marchand est une source, pas un collaborateur |
| Admin API — niveaux de stock | `inventory_levels.updated_at`, si le droit `read_inventory` est accordé | Aucun instantané récurrent | La source du troisième rail est un **`À DÉCIDER`**, pas un acquis (§ 3.4) |

---

## 6. Graphe de dépendances

### 6.1 Ordre d'implémentation topologique

> L'ordre ci-dessous n'est pas une lecture : il est **le minimum topologique que calcule l'outil**, et il est identique à ce que `state.json` enregistre après `dependency-check check --write`. Si les deux divergeaient, `state.json` décrirait une architecture qui n'existe plus et les agents des Phases 7-8 implémenteraient dans le désordre.

```
Vague 0 :
  ├── socle-interface           (aucune dépendance)
  ├── chaine-publication        (aucune dépendance)
  └── boutique-demo-recette     (aucune dépendance)

Vague 1 :
  ├── identite-session          (dépend de : socle-interface)
  ├── outillage-test            (dépend de : socle-interface, boutique-demo-recette)
  ├── revue-appareil-physique   (dépend de : chaine-publication)
  └── mecanisme-renvoi-paiement (dépend de : boutique-demo-recette)

Vague 2 :
  ├── compte-creation           (dépend de : socle-interface, identite-session, boutique-demo-recette, outillage-test)
  ├── accueil-trois-rails       (dépend de : identite-session, boutique-demo-recette)
  ├── catalogue-produit         (dépend de : identite-session, boutique-demo-recette, outillage-test)
  └── mesure-instrumentation    (dépend de : socle-interface, identite-session)

Vague 3 :
  ├── rapprochement-compte      (dépend de : compte-creation, boutique-demo-recette)
  ├── recherche                 (dépend de : accueil-trois-rails, boutique-demo-recette)
  ├── panier-sortie-paiement    (dépend de : catalogue-produit, mecanisme-renvoi-paiement)
  └── fenetre-et-frontiere-gel  (dépend de : chaine-publication, mesure-instrumentation, mecanisme-renvoi-paiement)

Vague 4 :
  ├── echec-historique-narratif (dépend de : rapprochement-compte)
  ├── suppression-compte        (dépend de : compte-creation, rapprochement-compte, mesure-instrumentation)
  ├── verification-rendu-2s     (dépend de : revue-appareil-physique, accueil-trois-rails, catalogue-produit, recherche)
  └── verification-pic-et-plafond(dépend de : revue-appareil-physique, mesure-instrumentation, catalogue-produit, panier-sortie-paiement)

Vague 5 :
  └── commandes-liste           (dépend de : rapprochement-compte, echec-historique-narratif, identite-session, outillage-test, mesure-instrumentation)

Vague 6 :
  └── verification-accessibilite(dépend de : revue-appareil-physique, accueil-trois-rails, catalogue-produit, recherche, commandes-liste)
```

**Sept vagues**, et **aucun plan de vagues plus fin n'est déclaré** dans le front matter. Le graphe se réduit à sept vagues topologiques ; le conserver à sept signifie qu'il n'y a pas deux versions de la vérité entre ce document et `state.json`. Si un jour deux personnes ne peuvent pas porter à la fois la politique d'accès et la formule d'écart, c'est là qu'un `impl_waves` plus fin se déclare — avec sa raison, sans quoi l'écart échoue au lieu d'avertir.

### 6.2 Parallélisme possible

| Vague | Slices parallélisables | Contrainte de capacité |
|---|---|---|
| 0 | `socle-interface`, `chaine-publication`, `boutique-demo-recette` | `socle-interface` est un prérequis de presque tout : c'est la seule qu'on ne lance pas en parallèle de long. Les deux autres se répartissent. |
| 1 | `identite-session`, `outillage-test`, `revue-appareil-physique`, `mecanisme-renvoi-paiement` | `mecanisme-renvoi-paiement` porte l'écrit à faire valider au marchand (T5) : le lancer **premier** et en parallèle d'`identite-session` est la seule façon d'avoir une réponse avant que la vague 3 ait besoin d'elle. |
| 2 | `compte-creation`, `accueil-trois-rails`, `catalogue-produit`, `mesure-instrumentation` | `mesure-instrumentation` doit être finie avant la fin de la vague : c'est elle qui tient le dénominateur et les quatre fenêtres, et une entonnoir posé après coup se définit après coup. |
| 3 | `rapprochement-compte`, `recherche`, `panier-sortie-paiement`, `fenetre-et-frontiere-gel` | `recherche` est la plus légère et `panier-sortie-paiement` la plus à risque (elle dépend d'un mécanisme encore hypothétique). `fenetre-et-frontiere-gel` s'écrit ici mais ne **finit** qu'à la publication : c'est la seule slice dont une partie est datée par un événement externe, et c'est écrit dans sa fiche. |
| 4 | `echec-historique-narratif`, `suppression-compte`, `verification-rendu-2s`, `verification-pic-et-plafond` | `suppression-compte` est la plus courte et la plus risquée : c'est celle qu'il faut faire relire. Elle ne peut pas être laissée pour la fin, parce que c'est elle qui fixe la limite de ce qu'E5 touche. |
| 5 | `commandes-liste` | Seule slice de la vague, et la plus grosse du MVP hors `catalogue-produit`. |
| 6 | `verification-accessibilite` | Seule slice de la vague, et c'est normal : elle dépend de tous les écrans. |

### 6.3 Cycles

Aucun cycle de dépendances détecté.

**Deux points de contention, signalés parce qu'ils sont réels** :

| Point | Entrantes | Pourquoi c'est un risque | Traitement |
|---|---|---|---|
| `mesure-instrumentation` | 3 | Écrire de la mesure **après** avoir écrit les écrans, c'est définir un entonnoir après coup, et `roadmap.md` § 2.1 le dit mot pour mot | Placée en vague 2, avant tout écran de mesure, et déclarée sans dépendance d'écran (ADR-15) |
| `catalogue-produit` | 4 | La sortie vers le paiement, le rendu en moins de deux secondes, l'accessibilité et le pic saisonnier en dépendent toutes | C'est la slice la plus large du MVP, et c'est un choix assumé : US-1 au minimum n'a pas d'autre découpage qui tienne sous dix fichiers |

### 6.4 Ce que la V1 vient accrocher, et pourquoi elle n'oblige pas à réécrire le MVP

> **Section ajoutée, et voici pourquoi** : le gabarit a un graphe de dépendances et rien pour dire ce qui reste possible ensuite. Or le MVP n'a de valeur que si une V1 **ne le réécrit pas** : `roadmap.md` § 3.1 ajoute 12 slices aux 15 du MVP, et chacune doit s'accrocher à un nœud existant sans en déplacer un. Cette sous-section est la preuve, pas un souhait — elle dit, pour chaque ajout V1, le **seul** nœud qu'il touche.

| Élément V1 (`roadmap.md` § 3.1) | Nœud du MVP dont il dépend | Nouvelle table ? | Nouvelle migration ? | Ce qu'il faudrait réécrire dans le MVP |
|---|---|---|---|---|
| US-3 — suivre une commande | `commandes-liste` (S5) | **non** — l'écran lit la source comme la liste | non | rien : la liste et le suivi lisent la même chose, par la même fonction |
| US-1 en profondeur — facettes, variantes, produits liés | `catalogue-produit` (S7), `accueil-trois-rails` (S6) | **non** — tout vient de la source | non | rien : la profondeur vient du marchand (B23), donc rien n'est stocké |
| US-7 — favori | `catalogue-produit` (S7), `commandes-liste` (S5) | **oui** — `favori`, une seule | oui, additive | rien : `favori` est faite sur le modèle de `produit_recemment_vu`, qui existe déjà |
| US-10 — gérer mes adresses | `compte-creation` (S1) | **non, par décision** (ADR-13) | non | rien : l'adresse de référence reste chez le marchand (B6) |
| Les quatre vérifications, **closes** | `revue-appareil-physique` (F5) et les trois slices T2, T3, T4 | non | non | rien : elles se ferment en réexécutant un protocole qui existe déjà |

**Le test** : aucune des 12 slices V1 ne déplace un nœud du MVP, aucune ne modifie une colonne, et une seule ajoute une table — celle que ADR-7 a nommée et refusée au MVP **avec sa raison**. Une V1 qui exigerait de réécrire le MVP serait, par cette définition, une V2.

---

## 7. Décisions d'architecture (ADR)

### 7.1 B12 — le mécanisme « pour ce panier précis »

> C'est le point le plus difficile de cette architecture, parce que **le PRD pose l'exigence sans la poser comme question**. `roadmap.md` § 7 le classe « inconnu », § 2.3 dit que c'est le seul slice dont la faisabilité repose sur une hypothèse non écrite, et Q2 (survie du panier) est sans réponse. Ce qui suit fixe ce qui est fixable et nomme ce qui ne l'est pas.

**Ce que la slice S9 consomme n'est pas un choix, c'est un contrat.** Trois mécanismes sont techniquement possibles chez Shopify, et ils n'ont pas les mêmes conséquences :

| Mécanisme | Ce que l'application voit | Conséquence sur le critère principal | Verdict |
|---|---|---|---|
| **A** — panier créé par l'application, l'application **relait** l'identifiant de panier dans l'URL de paiement | Une `checkoutUrl` qui pointe vers le panier qu'elle a construit | Le 8 % mesure une sortie vers **le bon** panier, donc l'attribution est réelle | **Retenu provisoirement**, sous réserve de T5 |
| **B** — panier créé par l'application, l'application **lit** le panier chez le marchand juste avant la sortie et l'affiche | Un panier relu, avec relecture explicite (E11) | Même tunnel, mais l'application doit savoir relire — et c'est un droit de plus à demander | Retenu comme repli si A échoue |
| **C** — l'application n'a aucun panier et renvoie vers le site | Un lien nu | Le 8 % ne mesure plus qu'un clic vers le site, qui n'est **ni mesurable de la même façon ni attribuable** à l'application | **Refusé** : c'est précisément ce que `roadmap.md` § 2.1 refuse d'appeler un tunnel |

**Décisions qui ne dépendent pas de la réponse** :

- **Le panier vit sur l'appareil**, en mémoire d'exécution puis en stockage local, et **jamais** dans notre base. C'est la lecture de C8 : une écriture hors ligne est exclue, donc rien à réconcilier, et c'est aussi ce qui rend Q2 moins grave — si le panier ne survit pas à une fermeture, l'impact est une session perdue, pas des données désynchronisées.
- **La sortie est un abandon de session mesuré** : l'application émet `POST /api/v1/mesure/session/:id/sortie-paiement` avec l'en-tête `X-Mecanisme-Sortie`, puis ouvre l'URL. Si l'URL n'a pas pu être obtenue, l'application **ne procède pas** (E11) : elle dit « le panier n'a pas pu être relu » et propose un réessai. Procéder avec un panier non relu serait afficher un prix qu'on n'a pas vérifié, ce que B6 interdit.
- **Aucune donnée de carte, aucun champ de paiement, aucun SDK de paiement** dans l'application. Ce n'est pas une règle de style, c'est C3.

**Ce que l'architecture ne décide pas, et où cela va** :

> **Q2, survie du panier avant la sortie.** Le PRD la date « avant la conception », elle
> n'a pas de réponse, et son « qui peut répondre » est écrit : le marchand. Ce qu'on
> peut dire sans elle : si le panier **survit** à la fermeture, il faut revalider chez
> le marchand à la reprise — une lecture de plus sur le chemin critique de C6 — ou
> seulement à la sortie ; si le panier **ne survit pas**, le comportement est déjà
> défini et il n'y a rien à trancher.
>
> **La Phase 4 ne tranche pas, et sa sortie est écrite** : c'est la slice
> `mecanisme-renvoi-paiement` (T5) qui rend le verdict, et l'écran `panier` est
> construit pour **les deux réponses** — donc aucune ne casse l'implémentation. Une
> réponse inventée ici serait reprise comme un fait par la Phase 5, ce qui est
> exactement ce que Q2 interdit. Question **datée**, pas **ouverte** : elle a un
> porteur et une échéance.
>
> **L'existence du mécanisme B12.** Écrit au § 3.7 et porté par T5, dont le livrable
> accepte **deux** formes : un mécanisme constaté et testé, ou la preuve écrite qu'il
> n'existe pas. La troisième — le supposer — n'est pas un livrable. Tant que T5 n'a pas
> rendu son verdict, le critère principal du PRD § 8 est inatteignable et le gel de
> périmètre n'a pas de sens : **on ne gèle pas un périmètre dont la partie mesurable
> est hypothétique.** C'est la première slice à porter, et la seule dont l'échec
> arrête le projet plutôt que de le retarder.

### 7.2 Les autres décisions

| ID | Décision | Contexte | Options considérées | Choix | Justification | Conséquences |
|---|---|---|---|---|---|---|
| ADR-1 | L'application ne se connecte jamais à PostgreSQL ; une fonction serverless est la seule porte | B4 exige qu'aucune donnée de commande ne soit rendue sans confirmation et sans correspondance ; C2 impose l'UE ; C1 plafonne à 50 €/mois | accès direct de l'appareil à la base (PostgREST) · fonction unique qui filtre tout | **Fonction unique** | B4 ne se tient qu'exactement une fois : si l'appareil lit la base, un défaut de correspondance est un `where` oublié quelque part, donc une fuite. La fonction est aussi le seul endroit où le jeton du marchand peut rester secret | Chaque écran qui lit notre base fait un aller-retour réseau de plus ; **aucun** écran du chemin critique de C6 n'est concerné, car ni l'accueil ni la fiche produit ne lisent notre base |
| ADR-2 | La base passe de quatre choses à cinq : la mesure se compte chez nous | Q-C de `roadmap.md` : l'outil d'audit joint deux événements par un identifiant de personne, ce que C9 interdit | jointure dans l'outil d'audit · jointure par agrégats exportés · jointure dans notre base | **Dans notre base**, par agrégats jamais identifiés | Un agrégat ne contient pas de personne ; une ligne par compte, si. C'est la seule forme qui rend C9 et le `roadmap.md` § 2.4 simultanément possibles | Trois tables de plus, et une seule tâche planifiée (enrichissement à 24 h / 7 j / 30 j / 90 j) — qui porte sur 2 000 lignes au maximum et n'ingère rien |
| ADR-3 | La fenêtre d'observation est une **ligne**, pas une configuration | B3 rend la fenêtre unique et définitive, et la règle d'arrêt ne peut pas être lue deux fois sur deux périodes | un intervalle dans un paramètre d'environnement · une ligne en base, immuable par trigger | **Une ligne immuable** | Un paramètre se déplace au premier redémarrage malin ; une ligne dont le trigger refuse la mise à jour ne peut pas bouger, et le refus est écrit au `architecture.md` § 4.10.3 | Corriger une date de publication exige une migration — et c'est le but |
| ADR-4 | Les compteurs de mesure ne se suppriment pas et ne diminuent pas | E5 exige la suppression des données du client ; le `prd.md` § 8 exige un dénominateur et une règle d'arrêt décidable | tout supprimer · tout conserver, y compris l'identifiant · conserver l'agrégat seul | **L'agrégat seul** | Un agrégat n'est pas une donnée personnelle (C9). Le supprimer rendrait la règle d'arrêt indécidable, ce qui est pire que sa conservation ; le conserver ne garde aucune personne | Un compte supprimé reste compté dans « comptes créés ». C'est le comportement correct : un compte **a** été créé, et un client qui se supprime après s'être autorisé ne doit pas pouvoir faire disparaître le dénominateur |
| ADR-5 | Le rapprochement lit l'API Admin une fois, et ne synchronise jamais | C14 refuse toute ingestion récurrente ; B3 rend le rapprochement unique ; B6 fait du marchand une source | API de compte client Shopify (OAuth par client) · API Admin filtrée sur l'adresse | **API Admin, lecture unique** | L'API de compte client est la « bonne » API, mais elle impose un second parcours d'identité à un projet qui s'est donné **une** source d'identité nommée (C13). L'API Admin lit l'existant sans rien créer, et elle est incluse dans le forfait déjà payé | Le résultat du rapprochement est un `client_shopify_id`, et l'accès aux commandes se fait par ce client. Si Q3 répond que le marchand ne retrouve pas ses commandes d'invité, l'échec est **visible et compté** plutôt que subi |
| ADR-6 | L'adresse essayée n'est pas conservée | B5 n'affiche qu'un compteur ; C9 interdit de garder plus que le nécessaire | stocker l'adresse en clair · stocker son empreinte · ne rien stocker | **Ne rien stocker** | Une adresse devinée par le client est une donnée personnelle qu'il n'a pas demandée à nous donner, et dont aucun écran n'a besoin. La fonction de rapprochement l'utilise, interroge, puis l'abandonne | Le journal d'audit serveur ne contient qu'un booléen « tentative échouée » et un compteur. La seule adresse que nous détenons est celle du compte, que le client a lui-même fournie |
| ADR-7 | Les tables de la V1 et de la V2 ne sont pas créées par le MVP | `roadmap.md` § 2.2 renvoie US-7 en V1 et US-8 en V2 | tout créer maintenant · créer au moment de la slice | **Au moment de la slice** | Une table créée et jamais écrite est une promesse que rien ne tient, et `ddl-exec completeness` signale une table décrite en colonnes et jamais créée comme un défaut du document. Les nommer ici sans les décrire évite ce défaut | `favori` (US-7) et `jeton_push_consentement` + la table d'idempotence (US-8) apparaissent dans la migration qui porte leur slice, sur le modèle de `produit_recemment_vu` |
| ADR-8 | Le schéma d'URI est posé une fois, dans la chaîne de publication, et aucune slice MVP n'exige de natif | C11 rend toute modification native une publication revue ; `roadmap.md` § 2.2 repousse US-8 précisément pour ça | lien profond traité comme une slice à part entière · traité comme une fondation | **Fondation** | Le schéma d'URI est une configuration de build, pas du JavaScript : le traiter dans une slice aurait fait du lien profond un « natif », donc une sortie planifiée, donc une slice qui ne pourrait pas être livrée à chaud. Le poser dans la chaîne de publication le rend disponible immédiatement | Le **seul** natif du MVP est celui-ci, et il est posé au premier build. Toute autre dépendance native interdit l'entrée d'une fonctionnalité jusqu'à la version suivante |
| ADR-9 | Le catalogue n'est ni stocké ni indexé, et `produit_recemment_vu` ne porte que le handle | B6 et B23 : le marchand est une source, pas un collaborateur ; C8 exclut l'écriture hors ligne ; B19 impose l'âge affiché | copier produits et prix · copier produits sans prix · ne rien copier | **Ne rien copier** | E7 dit que l'application ne mémorise pas de prix, et une copie serveur d'un libellé est une donnée du marchand que nous n'avons pas à détenir. Le cache local de l'appareil porte le contenu et son âge, ce qui est exactement ce que B19 demande | Les « derniers consultés » d'un visiteur anonyme viennent du cache de l'appareil, pas du compte : c'est une limite assumée, et elle est écrite |
| ADR-10 | Le panier vit sur l'appareil et la sortie est un abandon de session mesuré | B12 exige « ce panier précis » sans que le mécanisme soit posé ; Q2 est sans réponse | panier en base · panier en mémoire d'application · panier dans le panier du marchand | **Sur l'appareil**, revalidé à la sortie | C8 exclut toute écriture hors ligne : un panier en base imposerait une synchronisation, donc un travail récurrent, donc un refus par C14. Et B7 impose de ne pas procéder avec un panier qu'on n'a pas relu | Q2 non tranchée : son impact est un panier perdu à la fermeture, pas une désynchronisation. Si le marchand répond « il survit », il faudra revalider à la reprise — décision de Phase 5, pas ici |
| ADR-11 | Le SQL du `architecture.md` § 4.10 est la source de vérité ; les contraintes sont des `ALTER TABLE` séparés | § 4.5 : un DDL dans un document n'est ni compilé ni exécuté, et l'outil qui vérifie le crée d'abord depuis les tableaux de colonnes | contraintes en ligne dans le `CREATE TABLE` · contraintes séparées | **Séparées** | Une contrainte écrite à l'intérieur d'un `CREATE TABLE` n'est pas rejouée par un outil qui a déjà créé la table : le schéma paraît correct et la borne n'existe pas. Séparées, elles s'exécutent dans les deux sens, et `ddl-exec execute` le prouve | Le fichier est plus long et un `CREATE TABLE` paraît incomplet à la relecture. Le commentaire de tête le dit, et la preuve est dans le verdict de l'outil |
| ADR-12 | Six fondations, pas cinq — écart renvoyé à la roadmap | `roadmap.md` § 6 annonce 5 fondations ; `SKILL.md` § 4.1 impose d'identifier le client API et la gestion d'erreur globale | cinq, en dissolvant le socle dans l'identité · six | **Six, signalées** | Sans socle, chaque slice écrit son propre client HTTP, sa propre conversion d'erreur et sa propre coquille : c'est le cas « deux slices partagent plus de 50 % de leur code » que `SKILL.md` § 4.1 fait fusionner. Le renier reviendrait à dissoudre la fondation dans une slice, ce qui la rendrait invisible | **Écart à amender dans `roadmap.md` § 6.** Il est consigné au § 9.1 et n'est pas décidé ici : la roadmap est le document qui compte les fondations |
| ADR-13 | US-10 sera servi sans nouvelle table, ou son coût sera un choix explicite de la V1 | C3 envoie le paiement chez le marchand, qui détient l'adresse ; B6 fait du marchand la source | table d'adresses applicative · pas de table, l'adresse reste au marchand | **Pas de table, par décision** | Une adresse de livraison dans notre base serait une **sixième** chose dans une base dont Q-C vient de fixer le nombre à cinq, et elle serait redondante avec celle du marchand au moment où elle sert — le checkout. Si la V1 décide d'en garder une, elle **amende cet ADR** et ne l'ajoute pas en passant | US-10 devient « l'application ne vous fait plus ressaisir votre adresse **chez le marchand** », ce qui suppose un mécanisme de report que la V1 devra établir |
| ADR-14 | Le comptage de mesure est écrit en un seul endroit, pas dans chaque écran | ADR-2 crée trois tables ; vingt écrans podrían écrire dedans et aucun ne le ferait pareil | compter dans chaque écran · une fonction unique appelée par le client API | **Une fonction unique** | Le dénominateur et le numérateur d'un entonnoir se définissent une fois ou se définissent différemment. C'est aussi pourquoi T1 n'est pas une dépendance de chaque écran : l'écran qui s'ouvre compte déjà, et seules les slices dont la **correction** dépend d'un nombre déclarent la dépendance | Un écran affiché hors ligne ne compte pas d'ouverture. C'est assumé : la fenêtre de mesure porte sur des sessions en ligne, et le dire vaut mieux qu'un compteur qu'on ne sait pas ce qu'il compte |
| ADR-15 | Les deux compteurs horodatés de Q-B sont produits **séparément** et aucun n'est retenu comme étant « le bon » | Q-B n'est pas tranchée : l'ouverture comptée est-elle celle du jour de la création, ou une ultérieure ? Les deux lectures donnent des verdicts opposés | en choisir une · en produire les deux | **Les deux** | Choisir ici serait prendre une décision de règle au niveau de l'architecture, et `roadmap.md` § 2.5 la laisse au PRD. Les produire coûte une colonne et une tâche d'enrichissement, et rend le diagnostic possible au lieu d'arbitraire | Le `prd.md` § 8 devra indiquer lequel lire. Tant qu'il ne l'a pas fait, les deux existent et aucun n'est mal interprété |
| ADR-16 | Les refus d'accès sont des états de données, pas des codes d'erreur HTTP | B7 et le panneau d'état du `design-system.md` imposent une phrase et une action ; `conventions.md` distingue refus métier, indisponibilité et défaut du marchand | `403` pour un refus d'accès · état dans le corps en `200` | **État en `200`** | Un `403` oblige chaque écran à traduire un code en phrase, et la traduction se fait deux fois : une fois par erreur, une fois par défaut de rendu. L'union discriminée rend l'oubli impossible à la compilation | `401` reste un code d'erreur, parce qu'il signifie « je ne sais plus qui tu es » et demande une ré-authentification, pas un texte. Le `architecture.md` § 5.1 dit pourquoi il n'y a pas de `403` ni de `409` sur la lecture |

---

## 8. Risques architecturaux

| Risque | Probabilité | Impact | Mitigation |
|---|---|---|---|
| **B12 n'existe pas** : la boutique ne peut pas renvoyer vers son paiement « pour ce panier précis », et le critère principal est inatteignable | MEDIUM | HIGH | T5 est une slice, pas une supposition, et son livrable accepte la preuve d'impossibilité. Le repli B (`architecture.md` § 7.1) préserve l'attribution sans le mécanisme A. Le repli C est explicitement refusé pour qu'on ne puisse pas y dériver sans le dire |
| **Le rapprochement échoue massivement** (Q3) et l'onglet Commandes est vide pour presque tout le monde | HIGH | HIGH | Le taux de correspondances réussies est dans le contrat de mesure du MVP (`roadmap.md` § 2.4) précisément pour que ce cas soit **un diagnostic** et non une attente. Le produit échoue alors proprement : « aucune commande pour le moment » formulé en mots, avec le lien vers le site |
| **La base de mesure devient une base de production** : trois tables, une tâche planifiée, un identifiant par installation | MEDIUM | MEDIUM | `session_mesure` n'a aucune clé étrangère vers `compte` (garde `architecture.md` § 4.10.3) ; `compteur_mesure` est un agrégat sans parent et insupprimable ; la rétention de `session_mesure` n'est pas écrite ici et **doit l'être** avant publication — c'est le premier `À DÉCIDER` que la Phase 5 doit trancher, sinon la table grossit sans borne |
| **La borne de B5 est contournée** parce qu'un écran écrit le compteur lui-même | MEDIUM | HIGH | La borne est un `CHECK` en base (garde 1). Un `if` dans un composant ne peut pas l'augmenter, seulement échouer — ce qui devient un `500` visible en recette, pas une divergence silencieuse en production |
| **Une mise à jour à chaud change le produit sous le compteur** | MEDIUM | HIGH | T6 fige la frontière dans le manifeste de révision de `chaine-publication`, pas dans une entente. La règle écrite de `roadmap.md` § 2.3 est reprise telle quelle : corriger ce qui restaure est permis, ajouter est interdit |
| **Le troisième rail est vide** et B9 est rompu | MEDIUM | MEDIUM | Le contrat du rail est fixé sans compte et sans travail marchand (Q-F) ; la **source** est un `À DÉCIDER` explicite avec un mécanisme écarté et sa raison. Si le droit `read_inventory` n'est pas accordé, la réponse revient au PRD et pas au rail |
| **La performance de l'accueil se dégrade** parce que trois rails et un cache local se contredisent | MEDIUM | HIGH | C6 n'est couverte par aucun automatisé, donc T2 est une slice et non une bonne intention. Le budget est écrit dans la note de pull request à chaque version. La hors-ligne est un **repli**, jamais un chemin de premier rendu |
| **La session est compromise** : un jeton lu sur un appareil-rooté donne accès à l'historique d'une personne | LOW | HIGH | Secure store, jamais `AsyncStorage` ; refresh court ; révocation côté serveur à la déconnexion ; et surtout : même avec un jeton valide, l'accès à l'historique exige une correspondance réussie **en base**, que l'attaquant ne peut pas fabriquer sans le compte (B2, B4) |
| **C9 est violé par un événement** écrit à la main dans un écran qu'on n'a pas relu | MEDIUM | HIGH | Le type de la mesure est fermé des deux côtés : `EtatLecture` n'a pas de champ libre, et `compteur_mesure.code` est une liste fermée refusée par la base. Une chaîne de caractères libre n'a nulle part où entrer |
| **Le troisième rail, la recherche ou le catalogue sont plus lents que prévu** et les deux secondes ne tiennent qu'en recette | MEDIUM | MEDIUM | Le catalogue est lu chez le marchand, donc la latence est celle du marchand et elle est **visible** (état `indisponible` avec réessai) plutôt que masquée par un cache infini. Le cache local est borné et porte son âge |
| **Le MVP s'arrête après quinze slices** et la V1 exige de réécrire S5 ou S7 | LOW | HIGH | Le `architecture.md` § 6.4 énumère, pour chacun des 12 ajouts V1, l'unique nœud du MVP qu'il touche. Une seule table est ajoutée, sur un modèle de table déjà existant |
| **La dépendance à une API de marchand non confirmée** (droits de l'API Admin, comportement du panier) | MEDIUM | HIGH | Tous les points d'incertitude externes sont nommés au `architecture.md` § 5.10 et dans les `À DÉCIDER`, et aucun n'est supposé acquis. T5 existe pour cette raison |

---

## 9. Amendements

**Ce document sera cité par numéro.** Un plan de la Phase 5 écrit « selon
`architecture.md` § <un numéro> » : ce numéro est un **contrat**.

> **Étendre, jamais renuméroter.** Ajouter une section **en fin de numérotation**
> ne casse rien. Insérer en plein milieu décale tous les numéros suivants — et
> chaque renvoi pointe alors vers une section qui existe **encore**, donc vers la
> **mauvaise**. Aucun contrôle ne voit une dérive qui résout.

### 9.1 Registre

| # | Amendement | Raison | Sections ajoutées | Renumérotage |
|---|---|---|---|---|
| 1 | 2026-09-30 — **six fondations déclarées, écart renvoyé à la roadmap.** Les cinq fondations de `roadmap.md` § 6 sont reprises à l'identique ; `socle-interface` est ajoutée | `SKILL.md` § 4.1 impose d'identifier le client API et la gestion d'erreur globale parmi les fondations, et sans elles chaque slice recopierait le même code — le cas que `SKILL.md` § 4.1 fait fusionner. C'est un manque du découpage, pas un ajout de périmètre | `2.1 socle-interface` (nouvelle, **en fin** de § 2) · renvoi dans § 2 et § 6.1 | aucun |
| 2 | 2026-09-30 — **`§ 6.4` ajoutée** pour prouver que la V1 s'accroche au MVP sans le réécrire | Le gabarit a un graphe de dépendances et rien pour dire ce qui reste possible ensuite ; or la valeur du MVP tient entièrement à cela | `6.4 Ce que la V1 vient accrocher` (nouvelle, **en fin** de § 6) | aucun |
| 3 | 2026-09-30 — **`§ 7.1` isolée** pour traiter B12 séparément du tableau des ADR | B12 est le seul point où le PRD pose une exigence sans la poser comme question ; le noyer dans un tableau le ferait passer pour une décision comme les autres | `7.1 B12` (nouvelle, **avant** le tableau `7.2`) — **signalé explicitement** : les ADR existants ne sont pas renumérotés, ils sont regroupés sous `7.2` | **reconnu explicite** — les identifiants `ADR-1` à `ADR-16` ne changent pas ; seuls les numéros de section sont minted à neuf, et la raison reste écrite ici |
| 4 | 2026-09-30 — **`§ 4.10` regroupement** du DDL, du jeu d'essai et des gardes | `SKILL.md` § 4.5 demande que la section des contraintes **prouve** qu'elles tiennent ; une liste de contraintes sans exécution ne prouve rien | `4.10.1`, `4.10.2`, `4.10.3` (nouvelles, **en fin** de § 4) | aucun |

### 9.2 Écart renvoyé, non tranché

| # | Écart | Où il doit être tranché | Pourquoi il n'est pas tranché ici |
|---|---|---|---|
| E-1 | Le compte des fondations : 5 dans `roadmap.md` § 6, 6 dans ce document | `roadmap.md` § 6, par amendement | Une roadmap ne se réécrit pas depuis une architecture ; ADR-12 **signale** et ne décide pas |
| E-2 | La source du troisième rail (`À DÉCIDER`, § 3.4) | Le PRD, via la question Q-F | La contrainte sur la réponse est fixée ici (non vide, sans compte, sans travail marchand) ; la réponse appartient au PRD, comme le veut `roadmap.md` § 2.5 |
| E-3 | Le mécanisme « pour ce panier précis » (`À DÉCIDER`, § 7.1) et Q2 | Le marchand, via Q2 et la question que le PRD ne pose pas | Le PRD pose l'exigence B12 sans la poser comme question ; la poser ici comme résolue serait inventer une réponse marchand |
| E-4 | La rétention de `session_mesure` | Ce document, en Phase 5 | C'est la seule décision de données que l'architecture laisse ouverte, et elle est un défaut de conception de table, pas un trou de la phase : elle se tranche quand on écrit la slice T1 |
| E-5 | Q-A (dénominateur minimum), Q-B (quelle ouverture compte), Q1 (qui porte la décision de retour) | Le PRD | Ces trois-là ne sont pas des choix d'architecture. Les produire ou non n'est pas à ma main, et les trancher ici transformerait une roadmap en réécriture de son PRD |

Un amendement ne s'édit pas dans le fichier : il s'enregistre, et la commande
**refuse** le renumérotage en nommant la dérive.

```bash
node "$FORGE/scripts/state.js" amend <anchor> architecture \
  --reason "<pourquoi cet amendement existe>" \
  --changes <fichier-listant-ce-qui-change>
```

Renuméroter quand même : `--allow-renumber --renumber-reason "<texte>"`. Cette
raison reste **dans l'état**, à côté des numéros cassés.

**Nomme tes renvois.** Un `§ <numéro>` seul ne dit pas de quel document il
parle ; `` `architecture.md` § <numéro> `` le dit, et un contrôle peut le
vérifier sans rien deviner. C'est pour cela que **tous** les renvois de ce
document nomment leur fichier, y compris ceux qui pointent vers eux-mêmes.

---

## Check list de gate

- [x] Chaque user story du PRD **scopée dans le MVP** a une slice correspondante : US-1 (minimum) → S6, S7 · US-2 → S5 · US-4 → S1, S2, S3 · US-5 → S8 · US-6 → S9. US-3, US-7, US-8, US-9, US-10 sont hors MVP par `roadmap.md` § 2.2 et ne le sont pas ici.
- [x] Chaque slice a une responsabilité claire et nommable en une phrase qui commence par un verbe.
- [x] Les fondations sont identifiées et isolées des slices métier. **Six, pas cinq — écart consigné au § 9.1 et renvoyé à la roadmap.**
- [x] Les modules portent `rank`, `frequency` (score et libellé) et une justification d'une phrase, dans l'ordre de `module-prioritization.md`.
- [x] Les 15 slices sont énumérées : 9 fonctionnelles, 6 d'obligation transverse. Le compte est vérifiable, pas approché.
- [x] **Tous les modèles de données sont définis champ par champ** : huit tables, chaque champ avec type, nullabilité, défaut, contrainte, description et exemple.
- [x] Toutes les tables que le DDL touche sont créées par ce DDL, et `favori`, `jeton_push_consentement` et la table d'idempotence ne sont **ni décrites ni créées** au MVP (ADR-7).
- [x] `ddl-exec all` passe : PostgreSQL accepte le DDL, le jeu d'essai s'exécute, et les **dix gardes déclarées** refusent chacune l'opération interdite. Le compte est rendu par l'outil, pas affirmé ici.
- [x] Les deux vérifications d'E5 sont **exécutées** dans le jeu d'essai, pas affirmées en prose.
- [x] Tous les endpoints API listent leurs codes d'erreur de manière exhaustive, y compris `502` et `504` pour le défaut du marchand, et **y compris l'absence de `403` et de `409`** sur la lecture, qui est une décision (ADR-16).
- [x] Le graphe de dépendances est sans cycle : sept vagues topologiques, aucun `impl_waves` divergent déclaré.
- [x] L'ordre d'implémentation est cohérent avec les dépendances, et le parallélisme est écrit vague par vague.
- [x] Les décisions d'architecture non triviales sont documentées en ADR : 16 décisions, dont trois `À DÉCIDER EN PHASE 4` restés ouverts (mécanisme B12, Q2, source du troisième rail) et cinq écarts renvoyés au § 9.2.
- [x] Aucun `À DÉCIDER EN PHASE 4` de `conventions.md` ne subsiste : ORM, état, formulaires, validation, client HTTP, styles, composants et icônes sont tranchés au § 1.1. Aucun `À DÉCIDER` du `design-system.md` § 6 ne subsiste non plus : le nom de l'union de lecture est écrit au § 2.1, le système de styles au § 1.1, la bibliothèque de composants et le jeu d'icônes au § 1.1.
- [x] `consistency-check references` : **zéro** renvoi cassé, sur 934 renvois résolus. Les 67 renvois restants ne nomment pas leur fichier et sont donc **comptés** ; la règle qui les supprime est écrite au § 9 (« Nomme tes renvois »).

**Statut** : `draft` → en attente de validation.