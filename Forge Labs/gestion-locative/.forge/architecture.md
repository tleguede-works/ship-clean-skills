---
type: architecture
status: approved
generated_at: 2026-09-30
derived_from:
  - .forge/prd.md
  - .forge/roadmap.md
  - .forge/conventions.md
  - .forge/design/design-system.md
impl_waves: 6
impl_waves_rationale: "Le graphe se réduit à 6 vagues et le plan en retient 6 : aucune ne sert à garder une personne pour elle, donc il n'y a rien à justifier. Le seul écart au minimum topologique est un écart de VALEUR, pas de nombre, et il est volontaire : `garde-fou` est en vague 1 alors que la roadmap la place en position 8. La roadmap exprime l'ordre de VALIDATION — on valide le garde-fou quand les trois échéances bloquantes existent, donc après `dossier-bail` — et le graphe exprime l'ordre de CONSTRUCTION. `garde-fou` ne lit que le contrat de données du § 4 et la fondation `horloge`, donc il peut être écrit avant `dossier-bail`, et c'est la seule façon d'éviter le cycle que l'autre ordre créerait."
---

# Architecture — Bailly

> Ce document définit COMMENT le produit est structuré techniquement.
> Il transforme les besoins du PRD en modules, slices, fondations, modèles de données et contrats d'API.
>
> **Règle de granularité** : toute entité, tout champ, tout endpoint est documenté — pas résumé, pas échantillonné.

---

## 1. Vue d'ensemble

### 1.1 Stack technique

| Domaine | Choix | Version | Justification |
|---|---|---|---|
| Langage | TypeScript, mode `strict` | 7.0.2 | Reprise de `conventions.md` § 2 sans discussion : un logiciel qui doit tenir 5 ans sans auteur disponible ne peut pas accumuler de `any`. Le `strict` rend le typage du § 4 vérifiable par le compilateur. |
| Cible mobile | **React Native, hors Expo Go** | résolue au premier commit | La décision est la sortie d'Expo Go, pas le numéro. `conventions.md` § 3 exige une écriture locale **durablement**, et Expo Go ne donne ni le keystore ni le enclave que le chiffrage du magasin local exige ; il les délègue à un runtime qu'on ne contrôle pas. Le mode de build décide donc du stockage, donc c'est une décision d'architecture. |
| Cible fond de travail | **Web**, ouvert depuis un navigateur du portable | — | `conventions.md` § 1 : le portable sert au travail de fond. C'est la **même** application, pas un second produit, donc le même paquet de contrats. |
| Base de données | **PostgreSQL** managé, région UE | 16 ou supérieur | Reprise de `conventions.md` § 2. Le SQL permet d'écrire des contraintes qui tiennent : c'est la seule raison pour laquelle ce document existe (§ 4.3). |
| Base locale | **SQLite** chiffré, dans le magasin local | — | Non négociable : C2 et B3 exigent que l'écriture précède le réseau, et `conventions.md` § 3 exige qu'elle survive à une application tuée. SQLite est le seul moteur embarqué qui porte les `CHECK` que le § 4.3 duplique. |
| Accès aux données | **SQL écrit à la main**, via Kysely | résolue au premier commit | Un ORM qui génère le DDL produirait un schéma différent de celui du § 4.3, et les portes du § 4.3 cesseraient d'être les portes de la base réelle. Kysely donne le **typage** des requêtes sans posséder le schéma : c'est exactement le partage voulu. |
| Validation | **Zod**, un schéma par entité du § 4 | résolue au premier commit | Un schéma par table, généré depuis la même source que les `CHECK` du § 4.3 : une valeur acceptée par Zod et refusée par PostgreSQL est un bug de génération, et il se voit parce que les deux listes sont cote à côte. |
| State management | **Zustand** | résolue au premier commit | L'état global du produit est un compteur, une connectivité et une horloge. Un magasin unique lisible hors de React est la seule forme qui permette de **piloter l'interface depuis un test avec une horloge simulée** : c'est la fondation `horloge` qui l'exige, donc le choix du gestionnaire d'état en découle. |
| HTTP client | `fetch` natif (React Native et Node) | — | N8 interdit un service tiers ; une bibliothèque de requêtes n'en est pas un, mais elle n'apporte rien ici. Le client doit seulement porter une clé d'idempotence et un accusés (§ 5.1). |
| Styling | `StyleSheet` React Native + jetons TypeScript | — | Le design system est écrit en propriétés CSS `--*`, `rem` et `@bp-*`, que React Native n'a pas. Le **pont de jetons** est donc une fondation à part entière (`architecture.md` § 2.6) : sans lui, chaque écran réécrirait les couleurs en dur et la parité de Phase 3 serait perdue au premier commit. |
| Composants UI | Les 29 composants de `design-system.md` § 3 | Phase 3 | Aucun composant supplémentaire au MVP : la règle de `design-system.md` § 0.5 est qu'un composant sans user story n'occupe pas de place, et une architecture qui en ajoute un la contredit. |
| Tests unitaires | **Vitest** + **fast-check** | résolue au premier commit | Le garde-fou est une property (US-8) : sans générateur de propriétés, une property n'est pas testée, elle est affirmée. C'est la seule dépendance de test que la roadmap § 2.5 rend obligatoire. |
| Tests E2E | **Detox** + `adb` pour le mode avion | résolue au premier commit | Les trois démonstrations de la roadmap § 2.5 sont au niveau appareil : le 6 du mois, le 11e mois du terme, le mode avion. `adb shell svc wifi disable` donne un mode avion **au niveau du système**, reproductible, et c'est la seule chose qui permette de ne pas dépendre d'un réglage du développeur. |
| Lint / Format | **ESLint 9** (config plate) + Prettier | résolue au premier commit | Le plugin n'est pas le sujet : la règle qui compte est `no-restricted-syntax` sur `Date.now`, `new Date`, `Date.parse` en dehors de `packages/horloge/`. C'est **l'application mécanique** de la décision n°1 (`architecture.md` § 7, ADR-1). |

### 1.2 Structure de dossiers cible

```
bailly/
├── apps/
│   ├── mobile/                  React Native. Compose la racine : bandeau, panneau, 4 onglets.
│   └── web/                     La même application, ouverte depuis le navigateur du portable.
├── server/                      API HTTP + exécution du DDL du § 4.3. Une seule transaction par écriture.
├── packages/
│   ├── horloge/                 ADR-1. Le contrat, les deux implémentations, le canal de test.
│   ├── magasin-local/           ADR-2. SQLite chiffré, journal d'écritures, migrations.
│   ├── client-api/              § 5. Clé d'idempotence, accusé, reprise automatique.
│   ├── secret/                  C5. Un secret, saisissable vite, jamais une session à gérer.
│   ├── erreurs/                 Un échec technique → un état du design system, jamais un texte libre.
│   ├── design-system/           Les 29 composants, le pont de jetons, les 30 unions d'état.
│   ├── coquille/                Le cadre : bandeau permanent, barre d'action, barre d'onglets, feuille.
│   ├── modele/                  Un schéma Zod par entité du § 4, et les types des 30 unions.
│   └── echeances/               Fonctions pures du garde-fou. Prennent `au` en paramètre, jamais l'horloge.
├── migrations/                  Le DDL du § 4.3, versionné, appliqué dans l'ordre des fichiers.
└── e2e/                         Scénarios Detox. Contiennent les horloges simulées, jamais le code.
```

**Pourquoi un dépôt unique à trois cibles.** Les trois cibles partagent le magasin local, le pont de jetons, les contrats de données et — surtout — la fonction pure qui décide d'un délai. Dupliqués, ils divergeraient, et le garde-fou tournerait sur une copie de la logique d'échéance : c'est précisément le défaut que la roadmap § 2.5 reproche. Un paquet par fondation rend la duplication impossible par construction, et `packages/echeances/` rend visible le fait que **la règle du garde-fou n'a qu'un endroit où vivre**.

**Ce qui n'est pas dans l'arborescence, et pourquoi.** Pas de `packages/calcul/` : B16 interdit tout calcul métier, donc un paquet qui calcule serait un paquet sans raison d'exister. Pas de `packages/signature/` : le composant `Signature` existe (`design-system.md` § 3, composant `Signature`) mais aucune slice du MVP ne le réclame, donc il vit dans `design-system/` et n'est branché nulle part.

---

## 2. Fondations

> Implémentées en premier. Tout le reste en dépend.

| Fondation | Responsabilité | Dépend de | Dépendue par |
|---|---|---|---|
| `horloge` | Fournir l'heure, et rendre l'heure simulée **structurellement impossible à livrer** en production | — | toutes |
| `magasin-local` | Écrire durablement sur l'appareil, en premier, et tenir le journal des écritures | — | `client-api`, `coquille`, toutes les slices |
| `client-api` | Porter une écriture au serveur et en rapporter l'accusé, sans rien annoncer avant qu'il existe | `secret` | toutes les slices |
| `secret` | Un seul secret, saisissable vite, oubliable entre deux utilisations | — | `client-api` |
| `erreurs` | Traduire un échec technique en un état du design system, jamais en texte libre | — | `coquille`, toutes les slices |
| `design-system` | Les 29 composants, le pont de jetons, et les 30 unions d'état | — | `coquille`, toutes les slices |
| `coquille` | Le cadre commun : bandeau permanent, panneau de blocage, barre d'action, barre d'onglets, feuille | `design-system`, `erreurs`, `magasin-local` | toutes les slices |

### 2.1 `horloge` — la décision qui dicte toutes les autres

**Périmètre** : le contrat d'heure du produit, ses deux implémentations, le canal par lequel un test la pilote, et les deux garde-fous qui empêchent l'implémentation de test d'atteindre un bundle de livraison.

**Pourquoi c'est une fondation, et pas un réglage.** La roadmap § 2.5 pose le reproche : une slice est finie quand elle marche une fois, alors que « en retard » n'existe qu'au 6e jour. Un réglage — une variable d'environnement, une constante, un interrupteur dans les préférences — produit une démonstration qui marche sur la machine de celui qui la fait, et qui échoue sur le téléphone du commanditaire. Le canal de test doit donc être **absent du code livré**, pas désactivé.

**Contrats** :

```typescript
// packages/horloge/src/contrat.ts
export type Horloge = {
  /** L'heure du produit. Une seule source, jamais `Date.now()` à côté. */
  maintenant(): Instant;
  /** S'abonner au changement de date. Utilisé par le garde-fou et par l'écran d'encaissement. */
  surChangement(abonne: (instant: Instant) => void): () => void;
};

export type ImplementationHorloge = Horloge & {
  /** Présent uniquement sur l'implémentation simulée. Le cast est un detroit, pas une option. */
  _estSimulee: true;
};
```

```typescript
// packages/horloge/src/index.ts — le point d'injection unique.
export function creerHorloge(): Horloge {
  return CONTEXTE_HORLOGE_SIMULEE ? horlogeSimulee() : horlogeSysteme();
}

// Vrai dans les bundles de test E2E, faux dans tous les autres.
// La constante est remplacée à la construction ; elle n'est pas lisible au
// runtime, donc un téléphone ne peut pas « activer » l'horloge simulée.
declare const __BAILLY_BUNDLE__: 'test' | 'release';
const CONTEXTE_HORLOGE_SIMULEE: boolean = __BAILLY_BUNDLE__ === 'test';
```

**Le canal de test, et pourquoi il n'est pas un réglage.** Un test E2E doit piloter l'heure **depuis l'extérieur du processus**, parce qu'un test qui injecte une dépendance ne teste pas l'application mais son montage. Le canal est donc un lien profond, `bailly://horloge-test?at=2027-03-06T08:00:00+01:00`, traité par un module que **seul** le bundle de test enregistre. Deux garde-fous rendent la fuite impossible à vérifier par soi-même :

```bash
# 1. Le module de test n'est pas dans le bundle de livraison.
grep -r "horlogeSimulee\|bailly://horloge-test" apps/mobile/dist/ && exit 1

# 2. La règle de lint qui rend l'injection obligatoire.
#    Sans elle, un `new Date()` glissé dans un sélecteur d'échéance passerait
#    en revue et produirait un garde-fou qui marche une fois.
npx eslint --max-warnings=0 apps packages
```

**Ce que le serveur ne fait pas, et pourquoi c'est la même décision.** Le serveur n'a pas d'horloge simulée, et il n'en a pas besoin : **aucune de ses requêtes ne décide d'un délai**. Toutes les dates qu'il stocke sont soit derivées d'une source, soit horodatées par un acte. « Est-ce en retard ? » est une fonction pure de `(date_echeance, now)` exécutée sur l'appareil, avec l'horloge injectée. Le serveur ne connaît donc pas le 6 du mois, et ne peut pas se tromper dessus.

```typescript
// packages/echeances/src/delai.ts — la seule fonction qui décide d'un délai.
export type EtatDelai = 'a_venir' | 'proche' | 'manquee';

export function etatEcheanceBloquante(
  dateEcheance: Date,
  au: Instant,                 // ← l'horloge, en paramètre. Jamais lue à l'intérieur.
  fenetreProcheJours = 30,
): EtatDelai {
  const jours = joursEntre(au, dateEcheance);
  if (jours < 0) return 'a_venir';
  if (jours <= fenetreProcheJours) return 'proche';
  return 'manquee';
}
```

### 2.2 `magasin-local` — l'écriture locale durable, et le journal

**Périmètre** : le SQLite chiffré, les migrations, et la table qui répond à la question centrale du § 4 : où est-ce que l'on sait si c'est parti.

**Contrat** :

```typescript
// packages/magasin-local/src/journal.ts
export type Ecriture = {
  ecritureId: string;          // uuid généré par l'appareil : la clé d'idempotence
  nature: NatureEcriture;
  empreinte: string;           // sha256 du corps, recalculé à chaque reprise
  recueLe: Instant;            // horloge de l'appareil — jamais celle du serveur
  confirmeLe: Instant | null;  // ← la seule réponse à « c'est parti ? »
};

/** Une écriture n'est confirmée que si le serveur a renvoyé un accusé. Nowhere else. */
export function motDEcriture(e: Ecriture): 'pas_encore_envoye' | 'synchronise' {
  return e.confirmeLe === null ? 'pas_encore_envoye' : 'synchronise';
}
```

**Le dialecte local, et ce qu'il ne sait pas faire.** Le § 4.3 écrit des `CHECK`, des clés étrangères et des colonnes générées ; SQLite sait les trois. Il ne sait pas les **triggers de contrainte différés** ni `timestamptz`. La conséquence est écrite, pas découverte : *la porte « une écriture confirmée a un accusé » n'existe que côté serveur*, parce que l'accusé est un fait du réseau, pas de la ligne. Ce que le magasin local garantit, c'est l'autre moitié, et il la garantit seul : **`confirmeLe` n'est écrit que par `appliquerAccuse()`**, et une règle de lint interdit toute autre affectation. Une propriété testée vérifie qu'aucun chemin de code ne produit une écriture confirmée sans avoir traversé cette fonction.

### 2.3 `client-api` — l'écrit et l'accusé

**Périmètre** : la transport d'une écriture, la clé d'idempotence, l'accusé, et la reprise automatique. Il ne réessaie **jamais** une écriture qui n'a pas d'accusé : il la retente, et c'est tout.

```typescript
// packages/client-api/src/ecrire.ts
export type ReponseEcriture =
  | { ecritureId: string; confirmeLe: Instant; empreinte: string }   // 201 : l'accusé
  | { ecritureId: string; confirmeLe: Instant; empreinte: string };  // 200 : déjà reçue

/** Le contrat de B1, en une signature : aucune autre valeur de retour n'existe. */
export function ecrire(body: Ecriture): Promise<ReponseEcriture>;
```

### 2.4 `secret` — un seul secret, pas de session à gérer

**Périmètre** : l'ouverture et la fermeture. C3 interdit les rôles, donc il n'y a ni inscription, ni mot de passe oublié, ni « administrateur ». C5 impose un secret unique. La reprise passe par **la réinitialisation à partir de l'hébergeur** (R9), pas par un e-mail que le propriétaire n'a pas configuré.

### 2.5 `erreurs` — un échec technique n'est jamais un texte libre

**Périmètre** : traduire `429`, `503`, un délai dépassé et un stockage plein dans les états que le design system a déjà nommés. Le seul état d'erreur qu'une slice peut produire sans le contrat de cette fondation est un `Vide` en variante `erreur`, et il est nommé dans § 2.5 du design system.

### 2.6 `design-system` — le pont de jetons, et les unions d'état

**Périmètre** : ce que la Phase 3 a produit, plus le travail que React Native impose : traduire des propriétés CSS en valeurs, des `rem` en multiplicateurs du réglage système, et des breakpoints en décisions de mise en page.

| Ce que la Phase 3 écrit | Ce que le pont produit | Raison |
|---|---|---|
| `--color-texte-principal: #E8ECF3` | `theme.couleur.textePrincipal` | React Native n'a pas de cascade CSS ; sans pont, chaque écran réécrit la palette. |
| `1.0625rem` | `policer(corpsPx)` qui lit le réglage du téléphone | N5 impose que le texte suive le réglage ; **plafonné à ×1,3**, écart conscient écrit dans `design-system.md` § 0.2. |
| `--bp-mobile: 0–479 px` | `estLarge` par `useWindowDimensions()` | La grille ne change pas de hauteurs de ligne ; seul le nombre de colonnes change. |
| `prefers-reduced-motion` | `AccessibilityInfo.isReduceMotionEnabled()` avec écoute | `design-system.md` § 1.6 : tout à 0 ms, sans exception. |
| Les 29 composants | Les 29 composants, plus les 30 unions qui les rendent | Le design nomme l'union ; c'est ici qu'elle est définie, et le § 4 lui donne ses conséquences. |

**Les 30 unions.** Elles sont définies ici parce que le design system § 3 les nomme et que `consistency-check state-parity` résout ce pointeur. Onze d'entre elles ont une **conséquence en base** et sont commentées ; les dix-neuf autres ne sont que du rendu, et leur définition n'a pas de raison d'être lisible ailleurs qu'ici.

```typescript
// packages/modele/src/etats.ts
// ————————————————————————————————————————————————————————————————
// Les onze unions qui décident de quelque chose.
// ————————————————————————————————————————————————————————————————

/** B2 : les trois mots. `rien_a_confirmer` est un état, pas un succès — § 4.3, garde G2. */
export type EtatEcriture = 'rien_a_confirmer' | 'a_envoyer' | 'hors_ligne' | 'echec_envoi' | 'lecture_seule';

/** B13 + roadmap § 2.3 : `famille` décide de la couleur, `forme` décide de la gravité. */
export type EtatEcheance = 'a_venir' | 'proche' | 'manquee' | 'faite_tard' | 'faite_avec_accord' | 'marge' | 'absent';

/** US-8 : la property `garde-fou`, pas un écran de rappels. */
export type EtatBlocage = 'a_decider' | 'marge_a_voir' | 'absent';

/** § 4.3, garde G9 : le 6e jour est une colonne, donc cet état est une comparaison. */
export type EtatEncaissement = 'a_venir' | 'paye' | 'paye_en_retard' | 'impaye' | 'ecart' | 'saisie_partielle';

/** B8 : la classe est demandée, donc son absence est un état du champ. */
export type EtatZoneTexte = 'repos' | 'focus' | 'classe_manquante' | 'classe_choisie' | 'erreur';

/** B8, forme dialoguée : pour un fait créé avant que la classe existe. */
export type EtatFeuilleClasse = 'ouverte_sans_choix' | 'ouverte_avec_choix' | 'fermée_sans_choix' | 'fermée_avec_choix';

/** B16 : la frontière du MVP, rendue. `refuse` est un refus de saisie, pas une erreur. */
export type EtatMontant = 'repos' | 'focus' | 'rempli' | 'erreur' | 'refuse';

/** Q2 : `inconnue` est l'état de `conserve_jusqua` tant que la durée légale n'est pas connue. */
export type EtatDate = 'repos' | 'focus' | 'ouvert' | 'erreur' | 'a_confirmer' | 'inconnue';

/** E12 + C8 + B3 : quatre états, dont un où aucune vignette n'est rendue. */
export type EtatPhoto = 'a_confirmer' | 'envoyee' | 'illisible' | 'erreur_ecriture';

/** C9 + N2 : hors-ligne n'est pas une erreur, et le vide et l'échec ne se ressemblent pas. */
export type EtatVide = 'jamais_visite' | 'aucune_donnee' | 'erreur' | 'hors_ligne';

/** B6 : permanent, donc jamais absent. `resolu` fait disparaître l'alerte, il ne la grise pas. */
export type EtatAlerte = 'visible' | 'actionnable' | 'resolu' | 'persistant';

// ————————————————————————————————————————————————————————————————
// Les dix-neuf unions de rendu. Elles n'ont pas de conséquence en base :
// leur définition appartient à l'écran, pas au contrat de données.
// ————————————————————————————————————————————————————————————————
export type EtatLigne = 'repos' | 'presse' | 'survol' | 'focus' | 'vide';
export type EtatFait = 'repos' | 'presse' | 'focus' | 'non_confirme' | 'modifie';
export type EtatDemande = 'a_moi' | 'au_locataire' | 'repus_plusieurs_fois' | 'traitee';
export type EtatAction = 'repos' | 'presse' | 'survol' | 'focus' | 'impossible' | 'en_cours' | 'fait';
export type EtatChamp = 'repos' | 'focus' | 'rempli' | 'erreur' | 'impossible' | 'lecture';
export type EtatSegment = 'non_choisi' | 'choisi' | 'requis_non_choisi' | 'focus' | 'desactive';
export type EtatFeuille = 'fermee' | 'ouverture' | 'ouverte' | 'fermeture' | 'impossible';
export type EtatBarreAction = 'active' | 'avec_decision' | 'secondaire' | 'desactivee';
export type EtatOnglet = 'inactif' | 'actif' | 'presse' | 'avec_decision' | 'desactive';
export type EtatTitre = 'repos' | 'avec_contexte' | 'defilement' | 'hors_ligne';
export type EtatPastille = 'neutre' | 'accent' | 'confirme' | 'discrete';
export type EtatMontantAffiche = 'saisi' | 'non_saisi' | 'a_confirmer' | 'refuse';
export type EtatHorodatage = 'connu' | 'relatif_seul' | 'a_confirmer' | 'inconnu';
export type EtatLigneDonnee = 'repos' | 'presse' | 'focus' | 'a_decider';
export type EtatListe = 'en_chargement' | 'remplie' | 'vide' | 'en_erreur' | 'hors_ligne';
export type EtatMessageBref = 'apparu' | 'visible' | 'file' | 'chasse';
export type EtatSignature = 'a_tracer' | 'tracee_non_confirmee' | 'tracee_confirmee' | 'lecture_seule' | 'efface';
export type EtatVocabulaire = 'introduction' | 'rappel_ouvert' | 'rappel_ferme' | 'masque';
export type EtatInvite = 'visible' | 'fermee' | 'de_securite';
```

**Deux membres portent un accent, et c'est un fait à signaler, pas à corriger ici.** `EtatFeuilleClasse` a pour membres `fermée_sans_choix` et `fermée_avec_choix`, accentués, dans `design-system.md` § 3, composant `FeuilleClasse`. TypeScript l'accepte et l'union est donc écrite **exactement** comme le design la nomme : corriger l'accent ici laisserait les deux documents dire deux choses, et `consistency-check state-parity` le signalerait comme un état absent de l'union. Le nom ASCII est recommandé en V1, **et cette recommandation est un amendement du design system, pas une correction opportuniste de l'architecture**.

### 2.7 `coquille` — le cadre, et le slot qui évite un cycle

**Périmètre** : l'assemblage permanent — `BandeauSynchronisation` en haut, jamais masqué (B6) ; `BarreAction` ; `BarreOnglets` ; `Feuille`. Elle **ne connaît pas** le garde-fou.

**Pourquoi elle ne connaît pas le garde-fou.** `PanneauBlocage` est rendu sur `aujourdhui` et sur `dossier-bail`, deux écrans qui appartiennent à deux slices différentes. Si la coquille importait le sélecteur d'échéances, elle dépendrait de `garde-fou`, qui dépend du contrat de données, et `dossier-bail` dépendrait de la coquille : le cycle serait immédiat. La coquille publie donc un **slot** — un emplacement vide, rendu par l'écran qui le possède — et c'est l'écran qui compose. Le garde-fou reste une property : il ne possède aucun écran.

```typescript
// packages/coquille/src/cadre.tsx
export type Cadre = {
  bandeau: ReactNode;   // permanent, jamais conditionnel
  panneau?: ReactNode;  // slot : le propriétaire de l'écran y rend le PanneauBlocage
  titre: ReactNode;
  contenu: ReactNode;
  action?: ReactNode;
};
```

---

## 3. Modules et slices

### 3.1 Inventaire

L'ordre des modules suit la **fréquence de la boucle de travail**, pas l'organigramme du domaine. Il ne contredit pas l'ordre de navigation de la Phase 3 (`design-system.md` § 4.2, enregistré dans `state.json`) : la navigation classe des **écrans**, ce tableau classe des **regroupements techniques**. Les deux portent un rang, et les deux classent `Saisir` et `Encaissement` avant `Dossiers`.

| Rang | Module | Slice | User stories (PRD) | Règles métier (B*) | Fréquence | Justification du rang |
|---|---|---|---|---|---|---|
| 1 | `ecriture` | `socle-synchronisation` | — (R2, R3, N1) | B1, B2, B3, B4, B6 | **5 — quotidien** | B1 s'applique à **toutes** les autres slices : la règle qui domine le produit doit exister avant celles qu'elle gouvernent. Le compteur du bandeau est sur les sept écrans du produit, donc sa fréquence est celle du produit. |
| 2 | `saisie` | `saisie` | US-1, US-3 | B1, B2, B8, B16 | **5 — quotidien** | Le geste du sous-sol, plusieurs fois par jour, et la seule slice que le propriétaire utilise tous les jours sans exception (R1). L'organigramme du domaine la classerait sixième, derrière les locataires, les logements et les baux — c'est exactement l'erreur que la priorisation par fréquence interdit. |
| 2 | `saisie` | `piece-jointe` | US-2 | B3, B8, C8 | **5 — quotidien** | Même boucle que `saisie` : une photo se prend en même temps qu'un fait. Séparée parce que son risque vient de l'environnement, pas de la logique. |
| 3 | `encaissement` | `encaissement` | US-5, US-6 | B15, B16 | **3 — mensuel** | Le score seul l'égalerait à `Dossiers`. La règle « une opération répétitive avant une entrée de cycle de vie » tranche : on agit sur un objet existant, on n'en crée pas. |
| 4 | `dossier` | `dossier-bail` | US-4 | B12, B17, B18 | **3 — à la création, puis consultation** | La source des cinq échéances (B12). Les 14 baux une fois créés, elle se consulte plus qu'elle ne se modifie : d'où une fréquence de 3 et non de 5. |
| 4 | `dossier` | `garde-fou` | US-8 | B12, B13 | **3 — à chaque ouverture** | La property est évaluée sur tous les écrans qui portent une échéance, donc sa fréquence d'**exécution** est quotidienne. Sa fréquence de **conception** est faible : c'est une fonction pure, pas un écran. Le rang décrit ce qu'on construit, pas ce qui tourne. |
| 5 | `demandes` | `demandes` | US-7 | B14, C3 | **3 — hebdomadaire** | La liste se consulte en passant (« je cesse de l'ouvrir »). B14 dit qu'elle n'est utile qu'avec « qui doit agir » : c'est la pastille qui la rend actionnable, pas sa position. |
| 6 | `vie-privee` | `donnees-personnelles` | — (E5, E10) | B7, B9, B10, B11, B18 | **1 — à la demande** | B10 : l'export est produit **à la demande**, donc une destination permanente lui ôterait son sens. Hors barre principale, par construction. |

**Ce qui n'est pas une slice, et pourquoi.** `aujourdhui` n'est pas dans ce tableau. Ce n'est pas un oubli : l'écran n'a **aucune donnée propre** — il assemble le bandeau (`socle-synchronisation`), le panneau de blocage (`garde-fou`) et les faits du jour (`saisie`). Une slice qui n'a pas de slice, une feature dont le propriétaire ne s'occupe pas, et la roadmap § 5 le dit : « aucune agrégation, aucun indicateur ». L'écran est une **composition**, et il est donc rattaché à `socle-synchronisation` pour le registre des écrans. Le mot « Accueil » est écarté au profit d'« Aujourd'hui » pour la raison écrite par la Phase 3 : c'est le seul écran où les trois mots de B2 sont enseignés.

### 3.2 `ecriture`

#### Slice : `socle-synchronisation`

- **User stories** : aucune. Elle porte R2, R3, N1 et le critère de succès n°1.
- **Règles métier** : B1, B2, B3, B4, B6 — et E1, E2, E3 par ricochet.
- **Dépend de** : `horloge`, `magasin-local`, `client-api`, `secret`, `erreurs`, `design-system`, `coquille`
- **Dépendue par** : `dossier-bail`, `saisie`, `piece-jointe`, `encaissement`, `demandes`, `garde-fou`, `donnees-personnelles`
- **Peut être parallélisée avec** : `garde-fou` (aucune des deux n'a de dépendance sur l'autre)
- **Responsabilité en une phrase** : *Faire dire à l'application, à tout instant et sans que le propriétaire le demande, combien de ce qu'il a écrit est parti et combien ne l'est pas encore.*
- **Démonstration exigée** : **n'importe quelle date, mode avion** (roadmap § 2.5). Une écriture faite hors ligne, application tuée, téléphone redémarré, réseau rendu : le bandeau passe de « 1 écriture pas encore confirmée » à « Rien à confirmer », et l'export porte l'horodatage du serveur.

**Constat d'architecte, à écrire avant de valider.** Cette slice est utilisée par les sept autres : c'est le critère que le rôle d'architecte donne pour proposer une **fondation**. Elle n'est pas convertie en fondation pour une raison précise : son livrable démontrable est le bandeau et la reprise automatique, c'est-à-dire un comportement de bout en bout qui n'existe pas tant que la fondation n'est pas demonstrate. Ce qui **est** extrait en fondation, c'est le contrat : `horloge` (§ 2.1), `magasin-local` (§ 2.2) et `client-api` (§ 2.3). La slice est donc le **démonstrateur** des trois fondations, pas leur porteur. C'est la réponse au reproche de la roadmap § 2.5 : la première slice doit pouvoir être finie avant les autres, et elle l'est.

### 3.3 `saisie`

#### Slice : `saisie`

- **User stories** : US-1 (fait daté), US-3 (somme due)
- **Règles métier** : B1, B2, B8, B16 — et E6, E11 par ricochet
- **Dépend de** : les sept fondations, `socle-synchronisation`, `dossier-bail`
- **Dépendue par** : `piece-jointe`
- **Peut être parallélisée avec** : `encaissement`, `demandes`, `donnees-personnelles`, `garde-fou`
- **Responsabilité en une phrase** : *Écrire un fait daté et une somme due sur l'appareil, en demandant la classe de tout texte libre, avant toute tentative réseau.*
- **Démonstration exigée** : dans un sous-sol, mode avion. Le fait est écrit, la classe est demandée, le bandeau compte 1.

**Deux objets, deux endpoints, une raison.** US-1 et US-3 sont dans la même slice parce qu'ils se font dans le même geste. Ils ne sont **pas** dans la même table parce que B8 les rend dissemblables : un fait porte un texte libre qui demande sa classe, une somme porte un montant qui n'en demande pas. Les mélanger obligerait la somme à répondre à une question qui ne la concerne pas.

**La frontière de « somme due », écrite.** Ce qui entre dans une `somme_due` au MVP est **exactement** ce que l'énumération `loyer`, `provisions_sur_charges`, `arriere`, `acompte` autorise, et rien d'autre. Les quatre noms viennent de US-3 ; aucun n'est inventé ici. Ce qui n'entre pas : la régularisation des charges (X2), la révision du loyer (X3), la taxe d'habitation, tout décompte de charges. La frontière n'est pas une documentation : c'est la contrainte `nature_connue` de la table `somme_due`, essayée par la garde **G14**. Bailly ne calcule rien (B16) : `montant_centimes` est ce que le propriétaire a écrit, et le total de l'écran est une `SUM` affichée, jamais un calcul de charges. Le refus est **un rendu d'écran** (`ChampMontant` en variante `refuse`), pas une note.

#### Slice : `piece-jointe`

- **User stories** : US-2
- **Règles métier** : B3, B8, C8 — et E1, E12
- **Dépend de** : les sept fondations, `socle-synchronisation`, `dossier-bail`, `saisie`
- **Dépendue par** : aucune
- **Peut être parallélisée avec** : aucune (elle dépend de `saisie`)
- **Responsabilité en une phrase** : *Écrire la photo sur l'appareil, datée par le lieu, avant toute tentative réseau, et dire où elle en est jusqu'à ce que le serveur l'ait confirmée.*
- **Démonstration exigée** : photo prise, mode avion, application tuée, redémarrage : la photo est là, compte toujours, et n'est pas annoncée comme partie.

**Décision : une photo s'accroche à un constaté, et à rien d'autre.** `piece_jointe.fait_constate_id` est `NOT NULL` et n'a pas d'alternative. La raison est B7 : une appréciation ne sort d'aucun export, donc une pièce d'appréciation n'a nulle part où aller, et une pièce qu'on ne peut pas exporter n'a pas à exister. La conséquence est une bonne contrainte d'usage et non une perte : le propriétaire qui veut une photo **et** son opinion écrit **deux lignes datées** — le constat avec la photo, l'appréciation sans — et c'est exactement la séparation que B8 lui demande de choisir. `B3` ne s'appuie pas sur le réseau pour exister : l'ordre est écrire le fichier, écrire la ligne, **puis** tenter l'envoi. E12 est traité avant la prise de vue, pas après : l'application annonce le stockage plein au lieu de faire semblant d'avoir photographié.

### 3.4 `encaissement`

#### Slice : `encaissement`

- **User stories** : US-5, US-6
- **Règles métier** : B15, B16 — et E9, E11
- **Dépend de** : les sept fondations, `socle-synchronisation`, `dossier-bail`
- **Dépendue par** : aucune
- **Peut être parallélisée avec** : `saisie`, `demandes`, `donnees-personnelles`, `garde-fou`
- **Responsabilité en une phrase** : *Dire pour chaque locataire et chaque mois l'un des trois états de l'encaissement, et produire une relance qui n'existe qu'en ligne et qui laisse une preuve d'envoi.*
- **Démonstration exigée** : **le 6 du mois**, horloge simulée (roadmap § 2.5). Le 5, aucun loyer n'est « en retard ». Le 6, les loyers sans reçu portent le filet terre cuite et le nombre de jours.

**« Payé » est la présence d'un reçu, pas une comparaison de sommes.** C'est la manière dont B16 et E9 tiennent ensemble. L'état d'une ligne d'encaissement est une **fonction** de cinq choses : la présence d'au moins une ligne `somme_recue` sur la période, sa date, la présence d'au moins une `somme_due`, la date de créance exigible, et l'heure. Il n'y a **aucune** soustraction et **aucune** comparaison de montants dans cette fonction. C'est la seule façon d'éviter le piège que la roadmap nomme : « Bailly ne rapproche rien tout seul — une ligne à traiter, pas une anomalie système ».

**Et l'écart de E9 n'est pas une fonction non plus.** « 214 € déclarés sur le compte, aucun reçu saisi » est une **saisie du propriétaire** : c'est un `fait_constate`, pas une comparaison. Le design system le nomme `LigneEncaissement` variante `ecart` ; la donnée est une ligne de fait comme une autre, donc elle est exportable comme une observation, et c'est correct.

**La relance n'a pas d'état propre, et sa preuve en a un.** La roadmap § 2.2 tranche : la relance est un acte sur l'encaissement, donc elle vit dedans. Mais **sa preuve d'envoi est un fait serveur**, daté, et c'est ce qui la rend opposable (US-6). Elle est donc une ligne du journal d'écritures de `nature = 'relance'`, et c'est la seule écriture que l'application **ne produit pas hors ligne** (B15). Le bouton est `impossible` avec la phrase de conséquence, et il n'existe aucun mode dégradé : l'écran d'encaissement affiche `BandeauAlerte` en variante `de_securite`, jamais un échec.

**Q4 n'est pas tranchée, et le schéma ne la tranche pas.** `bail.jour_echeance_loyere` est un champ `smallint` entre 1 et 28, **obligatoire et sans défaut**. Choisir 5 serait inventer Q4. En revanche la borne s'arrête à 28, et c'est une décision : `make_date` refuse un jour absent du mois, et février doit avoir une réponse. Une échéance au 31 ne peut donc pas être exprimée, et c'est mieux qu'une échéance au 31 qui tombe au 28 en février sans que personne ne l'ait vu. La `periode` est le **1er du mois** : si Q4 révèle un rythme trimestriel, le changement est de **deux colonnes** (`periode` devient une date de fin de période, `date_echeance` devient une date simple) et non un changement de logique, parce que la logique est déjà dans `bail.jour_echeance_loyere`.

### 3.5 `dossier`

#### Slice : `dossier-bail`

- **User stories** : US-4
- **Règles métier** : B12, B17, B18 — et E5
- **Dépend de** : les sept fondations, `socle-synchronisation`, `garde-fou`
- **Dépendue par** : `saisie`, `piece-jointe`, `encaissement`, `demandes`, `donnees-personnelles`
- **Peut être parallélisée avec** : `demandes`
- **Responsabilité en une phrase** : *Créer le dossier d'un locataire et son bail avec ses dates, et en tirer les échéances sans qu'aucune date d'échéance soit jamais tapée.*
- **Démonstration exigée** : un bail **meuble** et un bail **vide** créés avec le même terme, et l'écart de trois mois visible dans le calcul affiché (`LigneDonnée` variante `derivee` : « terme 31/03/2028 − 6 mois »). Afficher le calcul est ce qui rend B12 vérifiable : si la dérivation est fausse, c'est la date source qui est fausse, et on le voit (R5).

**Dépendre de `garde-fou` et non l'inverse.** C'est la seule direction qui n'introduit pas de cycle. `garde-fou` lit le **contrat de données** du § 4 et la fondation `horloge` ; il ne lit aucune slice. `dossier-bail`, en revanche, rend le drapeau et le bouton `Décider`, donc il consomme `garde-fou`. La roadmap place `garde-fou` en position 8 : cet ordre est un ordre de **validation** — on valide le garde-fou quand les trois échéances bloquantes existent — et il devient ici un ordre de **construction** dès la vague 1.

#### Slice : `garde-fou`

- **User stories** : US-8
- **Règles métier** : B12, B13
- **Dépend de** : `horloge`, `design-system`, `erreurs`, `magasin-local`
- **Dépendue par** : `dossier-bail`, et par tout écran qui rend un `DrapeauÉchéance`
- **Peut être parallélisée avec** : `socle-synchronisation`
- **Responsabilité en une phrase** : *Faire monter une échéance bloquante manquée une fois, puis la classer, sans écran de rappels et sans répétition.*
- **Démonstration exigée** : **le 11e mois du terme**, horloge simulée, mode avion. Le 10e mois, rien. Le 11e, une échéance bloquante non décidée prend la place de l'action principale. Le propriétaire décide : elle passe en `faite_tard`, elle ne remonte plus, et l'écran d'accueil redevient `Saisir`.

**Une property, donc un test de propriété.** US-8 n'est pas une fonctionnalité : c'est une propriété que toute l'application doit satisfaire. Elle s'écrit en `fast-check`, et le générateur est ce qui la rend testée plutôt qu'affirmée :

```typescript
// packages/echeances/src/propriete.test.ts
test('une échéance bloquante ne peut prendre que trois états, et manquée est inatteignable avant la date', () => {
  fc.assert(fc.property(
    fc.date({ min: '2000-01-01', max: '2100-01-01' }),
    fc.date({ min: '2000-01-01', max: '2100-01-01' }),
    (dateEcheance, au) => {
      const etat = etatEcheanceBloquante(dateEcheance, au);
      expect(['a_venir', 'proche', 'manquee']).toContain(etat);
      if (au < dateEcheance) expect(etat).not.toBe('manquee');
      if (au >= dateEcheance) expect(etat).toBe('manquee');
    }));
});

test('remonter une deuxième fois est impossible, quel que soit le chemin', () => {
  // La propriété est dans le schéma (colonne `remontee_le`, garde G12), donc
  // elle n'est pas testable par un générateur d'horloge : elle est essayée
  // par PostgreSQL. Ce test vérifie qu'aucun code ne la contourne.
  fc.assert(fc.property(fc.integer(), (n) => {
    expect(peutRemonterUneSeuleFois(n)).toBe(n === 1);
  }));
});
```

**« Remonte une fois » est une contrainte de schéma, pas une règle d'écran.** `echeance.remontee_le` s'écrit au plus une fois : le trigger `trg_remontee_et_decision_uniques` refuse toute seconde écriture, et la garde **G12** l'essaie. Un écran qui oublierait la règle produirait un badge qui revient tous les jours, et rien dans le code de l'écran ne pourrait l'empêcher — c'est la base qui l'empêche. C'est exactement la propriété que la roadmap § 2.5 réclame : « une slice non démontrable avec une date simulée et un mode avion n'est pas finie ».

### 3.6 `demandes`

#### Slice : `demandes`

- **User stories** : US-7
- **Règles métier** : B14, C3 — et E8
- **Dépend de** : les sept fondations, `socle-synchronisation`, `dossier-bail`
- **Dépendue par** : aucune
- **Peut être parallélisée avec** : `saisie`, `encaissement`, `donnees-personnelles`, `garde-fou`
- **Responsabilité en une phrase** : *Lister ce qui attend, avec qui doit agir en premier, sans jamais dédoubler ni rapprocher deux demandes reçues le même jour.*
- **Démonstration exigée** : deux demandes du même locataire le même jour → **deux lignes**, deux horodatages, aucune mention « doublon ».

**E8 se traduit par une contrainte qui n'existe pas.** Il n'y a **aucune** contrainte d'unicité sur `(bail_id, jour)`. C'est une absence volontaire et c'est la seule façon de garantir E8 : un `UNIQUE` serait une déduplication déguisée, et une déduplication automatique est précisément ce que le PRD refuse (« il n'y a pas de doublon parce que rien n'est dédupliqué automatiquement »). La ligne `LigneDemande` en variante `repus_plusieurs_fois` affiche les horodatages côte à côte, parce que c'est une information et pas un défaut.

### 3.7 `vie-privee`

#### Slice : `donnees-personnelles`

- **User stories** : aucune user story directe. Elle porte E5, E6, E7, E10, C6, C7, C10, C11, N6, N7, N8, et R4, R8.
- **Règles métier** : B7, B9, B10, B11, B18
- **Dépend de** : `horloge`, `magasin-local`, `client-api`, `secret`, `design-system`, `socle-synchronisation`, `dossier-bail`
- **Dépendue par** : aucune
- **Peut être parallélisée avec** : `saisie`, `encaissement`, `demandes`, `garde-fou`
- **Responsabilité en une phrase** : *Produire, à la demande et sans qu'on la réclame, un dossier lisible et daté qui ne contient que du constaté, et ne proposer aucun geste qui efface un ensemble.*
- **Démonstration exigée** : export du dossier d'un locataire, lu, avec trois propriétés vérifiables à l'œil : il porte la date de sa production (C11), il ne contient aucune ligne d'appréciation (B7), et il est lisible sans Bailly (B11). **Ce que cette slice ne peut pas démontrer, et qui est écrit** : le troisième état de B9. Voir § 4.5.

**Pourquoi cette slice est au MVP et pas en V1.** B11 est la condition de survie du produit (R8) : « si l'hébergeur meurt demain, je dois pouvoir récupérer mes 14 baux en une journée ». Un export prévu pour plus tard est un export qui n'existe pas au moment du litige, et c'est le seul moment où il compte.

### 3.8 Récapitulatif : ce que chaque slice doit démontrer

La roadmap § 2.5 pose la règle — *une slice dont le comportement dépend d'une date ne se démontre pas par « ça marche »* — et la colonne de droite est la manière dont cette règle est appliquée. Une slice qui n'a pas de droite n'est pas finie, quelle que soit la qualité de son code.

| Slice | Ce qui la démontre | Ce qui la ferait échouer |
|---|---|---|
| `socle-synchronisation` | Une écriture faite **hors ligne**, application tuée, téléphone redémarré, réseau rendu. Le bandeau passe à « Rien à confirmer ». | Le compteur qui ment sur le nombre d'écritures non parties, ou une reprise qui perd une écriture. |
| `dossier-bail` | Un bail **vide** et un bail **meuble** de même terme, dont les échéances difèrent de trois mois, avec le calcul affiché. | Une échéance saisie à côté, ou un `if` qui fait le 3/6 dans un écran. |
| `saisie` | Un fait et une somme écrits **dans un sous-sol, mode avion**, la classe demandée avant l'enregistrement. | L'enregistrement sans classe, ou l'annonce « enregistré ». |
| `piece-jointe` | Une photo prise hors ligne, application tuée, redémarrage : elle est là, comptée, et **pas** annoncée comme partie. | Le fichier écrit après la tentative réseau (B3), ou une photo comptée 0 alors qu'elle est sur l'appareil. |
| `encaissement` | **Le 6 du mois**, horloge simulée. Le 5, rien n'est « en retard ». Le 6, les loyers sans reçu portent le filet et le nombre de jours. | Une ligne « en retard » le 3, ou une comparaison de sommes quelque part. |
| `demandes` | Deux demandes du même locataire le même jour : **deux lignes**, deux horodatages, aucun mot « doublon ». | Une contrainte d'unicité, ou une déduplication automatique. |
| `garde-fou` | **Le 11e mois du terme**, horloge simulée, mode avion. Le 10e, rien. Le 11e, le panneau de blocage prend la place de l'action principale. Décidée, elle se classe et ne remonte plus. | Une seconde remontée, ou un panneau qui revient tous les jours (B13). |
| `donnees-personnelles` | Un dossier exporté, lu, daté, **sans aucune appréciation** et sans aucune date inventée. | Une appréciation dans l'export, ou une date de fin de conservation inventée (§ 4.5). |

**Les trois horloges de la roadmap § 2.5 sont donc démontrables sans attendre** : le 6, le 11e, et n'importe quelle date en mode avion. Aucune ne demande un réglage, une date système modifiée, ni l'accès au téléphone du commanditaire.

**Ce qu'aucune slice ne démontre, et qui est écrit ici pour qu'il ne soit pas oublié.** `donnees-personnelles` ne démontre **pas** le troisième état de B9, parce que Q2 est sans réponse (§ 4.5) ; sa checklist portera une case non cochée, pas un coche. `garde-fou` ne démontre **pas** les deux échéances de marge, parce qu'elles sont hors MVP (roadmap § 2.2) — et le schéma sait déjà qu'il ne saura pas les traiter, sans producer (garde **G11**). `piece-jointe` ne démontre **pas** la signature d'un état des lieux : le composant `Signature` existe (`design-system.md` § 3) et aucune slice du MVP ne le réclame, donc il n'est branché nulle part et B5 n'a pour l'instant qu'une existence vocabulario, pas un écran.

---

## 4. Modèles de données

**Trois conventions, avant les tables.**

- **L'argent est en centimes d'euro, en `bigint`.** Jamais en flottant, jamais en `numeric` : une somme doit additionner exactement, et `620.10 + 19.90` doit faire `640.00` et pas `640.0000000000001`. C10 : une seule monnaie, l'euro.
- **Les dates calendaires sont en `date`, les instants en `timestamptz`.** Une échéance est un jour, pas un instant : le 6 du mois n'a pas d'heure. Un horodatage est un instant, et il est toujours écrit par quelqu'un : l'appareil pour `recue_le`, le serveur pour `confirme_le`, et **cette distinction est la seule qui compte pour B1**.
- **Une colonne générée n'a pas de défaut, parce qu'elle n'est pas une colonne.** PostgreSQL la refuse à l'écriture ; c'est la forme la plus courte d'une contrainte qu'aucun code ne peut contourner.

### 4.1 Entités

#### 4.1.1 `locataire`

| Champ | Type | Nullable | Défaut | Contraintes | Description | Exemple |
|---|---|---|---|---|---|---|
| `locataire_id` | `uuid` (PK) | non | `gen_random_uuid()` | — | Identifiant stable. Jamais réutilisé, jamais recyclé : l'anonymisation garde la ligne. | `11111111-1111-1111-1111-111111111111` |
| `nom` | `text` | non | — | `length(btrim(nom)) > 0` | Nom de famille. Doit devenir vide à l'anonymisation, jamais `NULL`. | `Ferrand` |
| `prenom` | `text` | non | — | `length(btrim(prenom)) > 0` | Prénom. | `Colette` |
| `courriel` | `text` | oui | — | `courriel ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'` | Contact. Une absence est `NULL`, pas une chaîne vide : un tiret et un zéro ne se confondent pas. | `colette@example.org` |
| `telephone` | `text` | oui | — | — | Contact. | `0600000001` |
| `adresse_postale` | `text` | non | — | `length(btrim(adresse_postale)) > 0` | Adresse **postale** du locataire. C'est la seule adresse que l'application connaît : X6 exclut la carte, l'itinéraire et la géolocalisation, donc aucune colonne ne contient de coordonnées. | `12 rue Dumenge, 69003 Lyon` |
| `etat` | `text` | non | `'actif'` | `IN ('actif','anonymise')` | B9 : l'anonymisation est un **état**, pas un effacement. C'est ce qui permet de garder le fait et de retirer l'identifiant. | `actif` |
| `anonymise_le` | `timestamptz` | oui | — | `(etat = 'anonymise') = (anonymise_le IS NOT NULL)` | Instantan**t** de la décision d'anonymiser. Écrit par le serveur. `NULL` tant qu'elle n'est pas prise. | `2027-06-01T10:00:00Z` |

**Ce qui n'est pas dans cette table.** Ni date de naissance, ni pièce d'identité, ni numéro de sécurité sociale, ni.ibAN. Q5 demande si le bail a une identité de document et des annexes : la réponse n'est pas connue, donc **aucun champ n'est prévu pour elle**, et la pièce du dossier est une `piece_justificative` dont `nom` est du texte. Ajouter un champ « type de document » avant la réponse serait inventer Q5.

#### 4.1.2 `bail`

| Champ | Type | Nullable | Défaut | Contraintes | Description | Exemple |
|---|---|---|---|---|---|---|
| `bail_id` | `uuid` (PK) | non | `gen_random_uuid()` | — | Identifiant du bail. | `33333333-3333-3333-3333-333333333333` |
| `locataire_id` | `uuid` (FK) | non | — | → `locataire`, `UNIQUE (locataire_id)` | Le locataire. **Un bail par locataire** : 14 appartements, un bail chacun, pas de colocataire (US-4). | `11111111-…` |
| `ecriture_bail` | `uuid` (FK) | oui | — | → `ecriture` | L'écriture qui a produit ce bail. **Nullable** parce que la ligne et son accusé ne peuvent pas être insérés dans le même `INSERT` : la contrainte FK est donc posée par un `ALTER TABLE` juste après. | `55555555-…` |
| `reference` | `text` | non | — | `length(btrim(reference)) > 0` | Référence du bail, saisie. B17 : rien n'est pré-rempli, donc pas de numéro généré. | `BL-001` |
| `adresse_bien` | `text` | non | — | `length(btrim(adresse_bien)) > 0` | Adresse du bien, **donnée textuelle** (X6). « Courges 3e » suffit et se lit mieux sur une ligne de 56 pt. | `Courges 3e` |
| `regime` | `text` | non | — | `IN ('vide','meuble')` | **La bascule de 3 mois à 6 mois.** Une colonne, un `CHECK`, et c'est tout. C'est la réponse à la question posée en tête de dossier. | `meuble` |
| `date_debut` | `date` | non | — | — | Prise du bail. Source. | `2025-04-01` |
| `date_fin_terme` | `date` | oui | — | `> date_debut` | Fin de terme. **Nullable** parce qu'un bail newly créé peut n'avoir pas de terme. Source. | `2028-03-31` |
| `jour_echeance_loyere` | `smallint` | non | — | `BETWEEN 1 AND 28` | Jour du mois où le loyer est attendu. **Sans défaut** : Q4 n'est pas tranchée, donc choisir 5 serait inventer une réponse. La borne à 28 vient de `make_date`, qui refuse un jour absent du mois. | `5` |
| `montant_loyer_centimes` | `bigint` | non | — | `> 0` | Loyer mensuel, **saisi** (B16). Jamais calculé, jamais indexé. | `91000` |
| `depot_garantie_centimes` | `bigint` | oui | — | `>= 0` | Dépôt de garantie, saisi. `NULL` = pas de dépôt. | `91000` |
| `date_sortie_effective` | `date` | oui | — | `>= date_debut` | Date de sortie réelle. `NULL` tant que le locataire est là. C'est l'**événement** qui déclenche la restitution. | `2027-05-15` |
| `restitution_depot_etat` | `text` | non | `'en_cours'` | `IN ('en_cours','sans_retenue','avec_retenue')` | **La seconde bascule** : 21 jours ou un mois. C'est une **décision enregistrée**, pas un calcul : B16 interdit de déduire « sans retenue » d'une comparaison de sommes. | `sans_retenue` |
| `date_opposition_reconduction` | `date` | oui | — | **colonne générée** : `date_fin_terme − 3 mois` en vide, `− 6 mois` en meublé | La première échéance bloquante. **N'est pas une colonne** : c'est une expression, et PostgreSQL refuse toute écriture (garde **G7**). | `2027-09-30` |
| `date_echeance_restitution` | `date` | oui | — | **colonne générée** : `date_sortie_effective + 21` si `sans_retenue`, sinon `+ 1 mois` | La troisième échéance bloquante. Même garantie (garde **G8**). | `2027-06-05` |

**Les deux colonnes générées ne sont pas des colonnes.** Elles sont le point de bascule écrit en SQL, et c'est la seule réponse possible à « qu'est-ce qui, en base, fait basculer le délai de 3 à 6 ? » : `regime`. Un `if` dans un écran mettrait la bascule dans le code, où elle changerait avec lui. Ici, changer la bascule, c'est corriger une expression, et les 14 lignes déjà saisies changent avec elle. Le § 4.3 l'exécute et vérifie les deux valeurs.

**Pourquoi `jour_echeance_loyere` est un `smallint` et pas un `ENUM`.** Ce document n'utilise **aucun type `ENUM` de PostgreSQL** : toutes les énumérations sont des `text` + `CHECK`. Trois raisons, et la troisième est décisive. Un `ALTER TYPE … ADD VALUE` ne s'exécute pas dans une transaction, donc une migration d'énumération est un opération à part et un fichier de migration de plus. SQLite n'a pas d'énumération, et le magasin local doit porter **les mêmes** contraintes (§ 4.4). Et une liste de valeurs est **lisible** : elle se compare ligne à ligne entre le `CHECK`, le schéma Zod et le tableau ci-dessus, ce qu'un type opaque ne permet pas. Le prix est une liste dupliquée trois fois, et il est payé par un générateur, pas par une discipline.

#### 4.1.3 `ecriture`

| Champ | Type | Nullable | Défaut | Contraintes | Description | Exemple |
|---|---|---|---|---|---|---|
| `ecriture_id` | `uuid` (PK) | non | — | — | **Généré par l'appareil**, pas par le serveur : c'est la clé d'idempotence, et elle doit exister avant le réseau. | `55555555-…` |
| `bail_id` | `uuid` (FK) | oui | — | → `bail` | Le bail concerné. `NULL` pour une écriture qui n'en relève pas. | `33333333-…` |
| `nature` | `text` | non | — | 10 valeurs nommées (§ 4.1.3.1) | Ce que l'écriture porte. `'signature'` **n'en est pas** : aucune slice du MVP ne la produit, et ajouter une valeur sans producteur est le défaut que le § 4.3 cherche. | `fait_constate` |
| `empreinte` | `text` | non | — | `length > 0` | `sha256` du corps. L'idempotence est « même empreinte, même ligne » : sans elle, une reprise en double créerait deux faits. | `sha256:9f2b…` |
| `recue_le` | `timestamptz` | non | — | — | Quand l'appareil a écrit. **Horloge de l'appareil**, jamais celle du serveur. | `2027-03-05T18:04:11+01:00` |
| `confirme_le` | `timestamptz` | oui | — | `>= recue_le` ; refus de toute modification après confirmation (garde **G2**) | **La réponse à la question centrale.** Une seule colonne, dans une seule table, dit si c'est parti. | `2027-03-05T18:04:29+01:00` |

##### 4.1.3.1 Les dix natures d'écriture

| Valeur | Qui la produit | Conséquence si elle manque |
|---|---|---|
| `bail` | `dossier-bail` | Aucune échéance n'existe. |
| `fait_constate` | `saisie` | L'historique du dossier est vide. |
| `appreciation_travail` | `saisie` | Idem, et l'export n'a rien à filtrer. |
| `somme_due` | `saisie`, `encaissement` | L'encaissement n'a pas de montant. |
| `somme_recue` | `encaissement` | « Payé » n'existe pas. |
| `piece_jointe` | `piece-jointe` | Le compteur de photos non confirmées est faux. |
| `demande` | `demandes` | La liste des attentes est fausse. |
| `echeance_decision` | `garde-fou` | Une décision d'échéance n'est jamais opposable. |
| `piece_justificative` | `dossier-bail` | Le dossier n'a pas de pièce. |
| `relance` | `encaissement` | **La seule écriture que l'application refuse hors ligne** (B15). |

#### 4.1.4 `accuse_reception`

| Champ | Type | Nullable | Défaut | Contraintes | Description | Exemple |
|---|---|---|---|---|---|---|
| `ecriture_id` | `uuid` (PK, FK) | non | — | → `ecriture` | L'écriture accusée. | `55555555-…` |
| `confirme_le` | `timestamptz` | non | — | — | L'instant de la **validation de la transaction**, pas celui de la réception HTTP. | `2027-03-05T18:04:29+01:00` |
| `empreinte` | `text` | non | — | — | L'empreinte acceptée. Permet de constater qu'une reprise a réécrit autre chose. | `sha256:9f2b…` |

**Pourquoi cette table existe.** C'est la preuve exécutable de B1. `trg_ecrire_sans_accuse` est un **trigger de contrainte `DEFERRABLE INITIALLY DEFERRED`** : il ne se vérifie pas à l'`INSERT`, il se vérifie au `COMMIT`. Conséquence : une réponse HTTP envoyée avant la validation serait fausse, et la validation la refuse. Le serveur ne peut donc pas **contenir** une ligne « en attente » — la seule façon d'en créer une est exactement ce que la garde **G1** interdit. C'est la forme la plus courte de « aucune écriture n'est annoncée comme enregistrée avant confirmation serveur » qui ne dépende d'aucune discipline de code.

#### 4.1.5 `fait_constate`

| Champ | Type | Nullable | Défaut | Contraintes | Description | Exemple |
|---|---|---|---|---|---|---|
| `fait_constate_id` | `uuid` (PK) | non | `gen_random_uuid()` | — | Identifiant du fait. | `66666666-…` |
| `bail_id` | `uuid` (FK) | non | — | → `bail` | Le dossier. | `33333333-…` |
| `ecriture_id` | `uuid` (FK) | non | — | → `ecriture` | L'écriture qui l'a produit. **Toute ligne porte son écriture** : c'est le seul moyen de savoir si elle est partie, sans colonne `synchronise` (garde **G17**). | `55555555-…` |
| `sur_le_leure` | `date` | non | — | — | Le jour du fait. **Saisi**, parce qu'un fait du 12 se déclare le 12 ou le 13. Design system § 3.6 : « la date est saisie, l'heure est celle de l'appareil ». | `2027-03-05` |
| `texte` | `text` | non | — | `length(btrim(texte)) > 0` | Ce qui a été observé. Exportable, non effaçable (B7). | `La chasse d'eau fuyait.` |

**Il n'y a pas de colonne `classe`.** C'est le choix qui porte B7 et B8, et la garde **G18** l'essaie : `UPDATE fait_constate SET classe = 'apprecie'` est refusé, parce que la colonne n'existe pas. La classe n'est pas une propriété d'une ligne de constaté : c'est le **choix de la table dans laquelle la ligne existe**. Il n'y a donc pas de chemin de l'appréciation vers le constaté, parce qu'il n'y a pas de champ qui le porte.

#### 4.1.6 `appreciation_travail`

| Champ | Type | Nullable | Défaut | Contraintes | Description | Exemple |
|---|---|---|---|---|---|---|
| `appreciation_id` | `uuid` (PK) | non | `gen_random_uuid()` | — | Identifiant. | `77777777-…` |
| `bail_id` | `uuid` (FK) | non | — | → `bail` | Le dossier. | `33333333-…` |
| `ecriture_id` | `uuid` (FK) | non | — | → `ecriture` | L'écriture. | `55555555-…` |
| `sur_le_leure` | `date` | non | — | — | Le jour où le propriétaire a formulé son opinion. | `2027-03-05` |
| `texte` | `text` | non | — | `length(btrim(texte)) > 0` | Son opinion de travail. **Ne sort d'aucun export, jamais.** | `Difficile à relouer.` |

**L'asymétrie, exécutée.** `fait_constate` a un trigger `BEFORE UPDATE OR DELETE` qui refuse dès que son écriture est confirmée ; `appreciation_travail` **n'a aucun trigger de gel**, parce que `conventions.md` § 4 dit qu'une appréciation est effaçable. Le § 4.3 pose les deux : la garde **G3** vérifie que le `DELETE` du constat est refusé, et un bloc de contrôle positif vérifie que le `DELETE` **de l'appréciation passe**. Deux tables, deux destinations, et l'asymétrie n'est pas une intention : elle est essayée dans les deux sens.

#### 4.1.7 `piece_jointe`

| Champ | Type | Nullable | Défaut | Contraintes | Description | Exemple |
|---|---|---|---|---|---|---|
| `piece_jointe_id` | `uuid` (PK) | non | `gen_random_uuid()` | — | Identifiant. | `88888888-…` |
| `fait_constate_id` | `uuid` (FK) | non | — | → `fait_constate`, **pas d'alternative** | B7 : une pièce s'accroche à un constat exportable, donc elle est exportable. Une appréciation n'a pas de pièce, parce qu'elle n'a pas d'export. | `66666666-…` |
| `ecriture_id` | `uuid` (FK) | non | — | → `ecriture` | L'écriture. | `55555555-…` |
| `prise_le` | `timestamptz` | non | — | — | **Heure de l'appareil**, au moment de la prise. US-2 : « horodatée et datée par le lieu ». La géolocalisation est l'**instant** de la prise, pas des coordonnées : X6 exclut la carte. | `2027-03-05T18:03:02+01:00` |
| `empreinte_sha256` | `text` | non | — | `length = 64` | Empreinte du fichier. Sert à ne pas envoyer deux fois la même photo, et à prouver que le fichier reçu est celui d'origine. | `aaaa…` (64 car.) |
| `taille_octets` | `bigint` | non | — | `> 0` | Taille. Un stockage plein échoue **avant** la prise de vue (E12), donc une ligne de 0 octet n'est pas représentable. | `2411520` |
| `objet_cle` | `text` | oui | — | `!~* '^https?://'` | Clé **opaque** de l'objet chez l'hébergeur. **Jamais une URL** : N8 et C1. Bailly sert lui-même l'objet, donc changer d'hébergeur (Q3, sans réponse) ne change pas le schéma. `NULL` tant que le fichier n'est pas au serveur. | `bailly/2027/03/pj-1` |

#### 4.1.8 `encaissement`

| Champ | Type | Nullable | Défaut | Contraintes | Description | Exemple |
|---|---|---|---|---|---|---|
| `encaissement_id` | `uuid` (PK) | non | `gen_random_uuid()` | — | Identifiant. | `99999999-…` |
| `bail_id` | `uuid` (FK) | non | — | → `bail`, `UNIQUE (bail_id, periode)` | Le bail. | `33333333-…` |
| `ecriture_id` | `uuid` (FK) | non | — | → `ecriture` | L'écriture qui a ouvert la période. | `55555555-…` |
| `periode` | `date` | non | — | `extract(day) = 1` | **Le 1er du mois.** Le jour exact de l'encaissement est porté par le bail, donc « mensuel pour tous » et « décalé selon les contrats » sont tous les deux exprimables sans changer la structure (Q4). | `2027-03-01` |
| `date_echeance` | `date` | non | — | **dérivée** par trigger depuis `bail.jour_echeance_loyere` ; écriture directe refusée | Le jour du mois où le loyer est attendu. Refusée à la saisie (garde **G9**) : c'est une **copie dérivée**, pas une source. | `2027-03-05` |
| `date_creance_exigible` | `date` | non | — | **colonne générée** : `date_echeance + 1` | **Le 6e jour.** Colonne générée, donc non saisissable (garde **G9**). C'est le fait le plus important du § 4 : la date qui rend une créance exigible est un calcul de la base, pas une constante du code. | `2027-03-06` |

**Pourquoi `+ 1` et pas « le 6 du mois ».** La roadmap dit « 6e jour », le design system dit « attendu le 5 », « reçu après le 5, à partir du 6 ». Les deux sont vrais si le 6 est **le lendemain de l'échéance du loyer**. C'est cette lecture qui est implémentée, pour une raison qui n'est pas de la commodité : elle reste juste quel que soit le jour d'échéance du contrat, et Q4 n'est pas tranchée. Si Q4 révèle que le 6 est un jour **calendaire** indépendant du contrat, la correction porte sur **une expression générée et une colonne du bail**, pas sur la logique du garde-fou — parce que la logique lit déjà une colonne.

#### 4.1.9 `somme_due`

| Champ | Type | Nullable | Défaut | Contraintes | Description | Exemple |
|---|---|---|---|---|---|---|
| `somme_due_id` | `uuid` (PK) | non | `gen_random_uuid()` | — | Identifiant. | `aaaaaaaa-…` |
| `encaissement_id` | `uuid` (FK) | non | — | → `encaissement` | La période concernée. | `99999999-…` |
| `ecriture_id` | `uuid` (FK) | non | — | → `ecriture` | L'écriture. | `55555555-…` |
| `nature` | `text` | non | — | `IN ('loyer','provisions_sur_charges','arriere','acompte')` | **B16 : la frontière du MVP est cette liste.** Les quatre noms viennent de US-3. Une régularisation des charges est refusée par le moteur (garde **G14**). | `loyer` |
| `montant_centimes` | `bigint` | non | — | `>= 0` | Ce qui est dû, **saisi**. Jamais calculé. Zéro est autorisé : une somme due de zéro est une affirmation, l'absence est l'absence de ligne. | `62000` |
| `libelle` | `text` | oui | — | non vide si présent | Précision libre, **sans classe** : c'est un compliment de ligne (« provision ordenado de janvier »), pas une donnée sur la personne. Un compliment n'est pas une appréciation. | `Provision ordonnée` |

**Pourquoi `libelle` n'a pas de colonne de classe, et pourquoi ce n'est pas une exception à B8.** B8 porte sur la **saisie libre qui porte une donnée sur la personne**. `libelle` est un complément d'une somme : il n'est pas exporté dans le dossier du locataire comme un fait, il est affiché sur la ligne d'encaissement. Si le propriétaire y écrit un jugement, ce jugement reste dans la ligne d'encaissement, qui **n'est pas** le dossier du locataire. C'est vérifiable : le dossier est produit par la vue `v_dossier_locataire`, qui ne lit pas `somme_due`. La règle est donc appliquée là où elle a un sens, et elle ne se corrompt pas par une exception.

#### 4.1.10 `somme_recue`

| Champ | Type | Nullable | Défaut | Contraintes | Description | Exemple |
|---|---|---|---|---|---|---|
| `somme_recue_id` | `uuid` (PK) | non | `gen_random_uuid()` | — | Identifiant. | `bbbbbbbb-…` |
| `encaissement_id` | `uuid` (FK) | non | — | → `encaissement` | La période couverte. | `99999999-…` |
| `ecriture_id` | `uuid` (FK) | non | — | → `ecriture` | L'écriture. | `55555555-…` |
| `montant_centimes` | `bigint` | non | — | `>= 0` | Ce qui a été reçu, **saisi**. | `62000` |
| `recue_le` | `date` | non | — | — | Le jour de la réception. C'est **cette date** qui produit « payé en retard », comparée à `date_creance_exigible`. | `2027-03-11` |

**« Payé » et « payé en retard » ne sont pas des calculs, ce sont des présences.** Une ligne est `paye` s'il existe au moins une `somme_recue` dont `recue_le <= date_echeance` ; `paye_en_retard` s'il en existe une au-delà. Aucune soustraction, aucune comparaison de montants. C'est la manière dont B16 et E9 tiennent ensemble : Bailly **ne rapproche rien**, donc il ne peut pas se tromper en rapprochant.

#### 4.1.11 `demande`

| Champ | Type | Nullable | Défaut | Contraintes | Description | Exemple |
|---|---|---|---|---|---|---|
| `demande_id` | `uuid` (PK) | non | `gen_random_uuid()` | — | Identifiant. | `dddddddd-…` |
| `bail_id` | `uuid` (FK) | non | — | → `bail` | Le dossier. | `33333333-…` |
| `ecriture_id` | `uuid` (FK) | non | — | → `ecriture` | L'écriture. | `55555555-…` |
| `qui_doit_agir` | `text` | non | — | `IN ('proprietaire','locataire')` | **B14.** `NOT NULL` et sans défaut : les deux gardes **G15** et **G16** l'essaient, l'une avec une valeur hors énumération, l'autre avec la colonne absente. | `proprietaire` |
| `intitule` | `text` | non | — | non vide | 6 mots maximum à l'affichage ; le texte n'est pas tronqué en base. | `Devis de remplacement de la chasse` |
| `objet` | `text` | non | — | non vide | Le bien, 2 mots à l'affichage. | `Courges 3e` |
| `recu_le` | `timestamptz` | non | — | — | Heure d'arrivée. **Deux demandes le même jour ont deux horodatages** (E8). | `2027-03-12T09:12:00+01:00` |
| `cloturee_le` | `timestamptz` | oui | — | `>= recue_le` | Clôture. `NULL` = en attente. | `2027-03-19T18:00:00+01:00` |

**Il n'y a pas de `UNIQUE` sur le jour.** C'est une absence volontaire : une contrainte d'unicité serait une déduplication, et E8 dit que rien n'est dédupliqué. La ligne `LigneDemande` en variante `repus_plusieurs_fois` affiche les horodatages côte à côte parce que c'est une information.

#### 4.1.12 `echeance`

| Champ | Type | Nullable | Défaut | Contraintes | Description | Exemple |
|---|---|---|---|---|---|---|
| `echeance_id` | `uuid` (PK) | non | `gen_random_uuid()` | — | Identifiant. | `eeee…` |
| `bail_id` | `uuid` (FK) | non | — | → `bail` | Le dossier. | `33333333-…` |
| `ecriture_id` | `uuid` (FK) | non | — | → `ecriture` | L'écriture **du bail** qui a produit cette échéance, pas celle qui l'a décidée : la décision est un **événement** (`echeance_decision`), pas une réécriture de la ligne. | `55555555-…` |
| `type` | `text` | non | — | `IN ('opposition_reconduction','creance_exigible','restitution_depot')`, `UNIQUE (bail_id, type)` | Les trois échéances bloquantes. Les deux de marge n'ont **pas** de type : elles arrivent en V1 avec leur propre type, et `UNIQUE` les empêche d'en doublonner une bloquante. | `opposition_reconduction` |
| `famille` | `text` | non | — | `IN ('bloquante','marge')` | La classification de la roadmap § 2.3, **en base**. `marge` ne peut avoir ni décision ni accord (garde **G11**). | `bloquante` |
| `date_echeance` | `date` | non | — | **dérivée** par trigger depuis la source ; écriture directe refusée (garde **G10**) ; déplacement après décision refusé | B12 : la date est dérivée, jamais tapée à côté. | `2026-12-31` |
| `decidee_le` | `timestamptz` | oui | — | `NULL` sur une marge ; s'écrit **une fois** (garde **G12** et trigger) | La décision du propriétaire. `NULL` = à décider. C'est ce qui rend `PanneauBlocage` conditionnel sans qu'aucun écran ait à le calculer. | `2027-01-09T10:00:00+01:00` |
| `accord` | `boolean` | non | `false` | `false OR decidee_le IS NOT NULL` | Y a-t-il eu un accord ? Distingue `faite_tard` de `faite_avec_accord` (design system § 3.2). **Un accord ne peut pas précéder une décision.** | `true` |
| `remontee_le` | `timestamptz` | oui | — | `>= date_echeance` ; s'écrit **une fois** | **B13.** La date à laquelle le propriétaire a été reminded. `NULL` = pas encore remontée. S'écrit au plus une fois, donc « remonte une fois » est une contrainte de schéma. | `2027-06-16T08:00:00+01:00` |

**L'échéance est une ligne persistante, pas un calcul de lecture.** C'est un choix qui coûte des lignes et qui achète trois choses : elle est lisible **hors ligne** (C9, N2), elle porte l'historique de la décision, et elle permet d'écrire « déjà remontée » une seule fois. Une échéance recalculée à chaque lecture ne pourrait pas se souvenir qu'elle a déjà été montrée, et B13 serait une règle d'écran.

#### 4.1.13 `piece_justificative`

| Champ | Type | Nullable | Défaut | Contraintes | Description | Exemple |
|---|---|---|---|---|---|---|
| `piece_id` | `uuid` (PK) | non | `gen_random_uuid()` | — | Identifiant de la pièce du dossier. | `bbbbbbbb-…` |
| `bail_id` | `uuid` (FK) | non | — | → `bail` | Le dossier. | `33333333-…` |
| `ecriture_id` | `uuid` (FK) | non | — | → `ecriture` | L'écriture. | `55555555-…` |
| `nom` | `text` | non | — | non vide | **Texte libre, sans classe demandée** : c'est le nom d'un document, pas une donnée sur la personne. « Bail signé du 01/10/2024 » n'est ni un fait observé ni une appréciation. | `Bail signé du 01/10/2024` |
| `qualification` | `text` | non | — | `IN ('donnee_personnelle','obligation_legale','interne')` | **La colonne qui rend B9 applicable.** Elle décide, ligne par ligne, si la pièce est une donnée personnelle, un document conservé pour obligation légale, ou un document de travail interne. | `obligation_legale` |
| `personne_id` | `uuid` (FK) | oui | — | → `locataire` ; `NOT NULL` si `obligation_legale` | À qui la pièce se rapporte. **L'anonymisation ne peut pas la vider** si la pièce est une obligation légale (garde **G6**). | `11111111-…` |
| `conserve_jusqua` | `date` | oui | — | **aucun défaut** | B9 : la date de fin de conservation. **`NULL` tant que Q2 n'est pas tranchée** — et `NULL` veut dire « on ne sait pas », pas « pas de limite ». | `NULL` |
| `objet_cle` | `text` | oui | — | `!~* '^https?://'` | Clé opaque chez l'hébergeur. | `bailly/2024/10/bail` |

**La pièce du dossier est une `piece_justificative` de `qualification = 'obligation_legale'`.** C'est ce qui rend B18 vérifiable : « la suppression d'un dossier n'efface pas ce qui relève d'une obligation légale ». Le bail est **toujours** un document conservé, quelle que soit la réponse à Q2 — donc la garde **G5** (supprimer un bail) et la garde **G6** (anonymiser sa pièce) sont indépendantes de Q2. Sans Q2, on sait déjà qu'on ne peut pas tout effacer ; on ne sait pas encore **quand** on pourra arrêter de conserver.

#### 4.1.14 `evenement_rgpd`

| Champ | Type | Nullable | Défaut | Contraintes | Description | Exemple |
|---|---|---|---|---|---|---|
| `evenement_id` | `uuid` (PK) | non | `gen_random_uuid()` | — | Identifiant. | `cccccccc-…` |
| `piece_id` | `uuid` (FK) | non | — | → `piece_justificative` | La pièce concernée. **Une pièce à la fois** : il n'existe aucun événement qui porte sur un dossier entier, et c'est ce qui rend le bouton « tout effacer » non constructible. | `bbbbbbbb-…` |
| `action` | `text` | non | — | `IN ('effacer','anonymiser','conserver')` | Les trois états de B9, **nommés un par un**. Une seule valeur par ligne. | `conserver` |
| `decide_le` | `timestamptz` | non | — | — | Quand la décision a été prise. Serveur. | `2027-06-01T10:00:00Z` |

**Ce journal s'ajoute et ne se réécrit pas.** Le trigger `trg_evenement_incorrection` refuse tout `UPDATE` et tout `DELETE` (garde **G13**). C'est la seule façon d'éviter qu'un jugement de travail devienne un fait de gestion : la trace de ce qui a été décidé ne peut pas être corrigée après coup.

### 4.2 Relations

| Entité A | Relation | Entité B | Clé étrangère | Cascade |
|---|---|---|---|---|
| `locataire` | 1-1 | `bail` | `bail.locataire_id` | `RESTRICT`. Un locataire n'est jamais effacé ; il est anonymisé. |
| `bail` | 1-1 | `ecriture` (nature `bail`) | `bail.ecriture_bail` | `RESTRICT`. |
| `bail` | 1-N | `encaissement` | `encaissement.bail_id` | `RESTRICT`, `UNIQUE (bail_id, periode)` |
| `bail` | 1-N | `echeance` | `echeance.bail_id` | `RESTRICT`, `UNIQUE (bail_id, type)` |
| `bail` | 1-N | `fait_constate` | `fait_constate.bail_id` | `RESTRICT` |
| `bail` | 1-N | `appreciation_travail` | `appreciation_travail.bail_id` | `RESTRICT` |
| `bail` | 1-N | `demande` | `demande.bail_id` | `RESTRICT` |
| `bail` | 1-N | `piece_justificative` | `piece_justificative.bail_id` | `RESTRICT` |
| `ecriture` | 1-1 | `accuse_reception` | `accuse_reception.ecriture_id` | `CASCADE` — **la seule cascade du schéma.** Elle ne peut rien effacer d'autre, parce qu'elle part d'une table qui ne porte aucune donnée. |
| `ecriture` | 1-N | toutes les tables métier | `*.ecriture_id` | `RESTRICT`. Aucune écriture n'est effacée, donc rien ne l'est par elle. |
| `fait_constate` | 1-N | `piece_jointe` | `piece_jointe.fait_constate_id` | `RESTRICT` |
| `encaissement` | 1-N | `somme_due` | `somme_due.encaissement_id` | `RESTRICT` |
| `encaissement` | 1-N | `somme_recue` | `somme_recue.encaissement_id` | `RESTRICT` |
| `piece_justificative` | 1-N | `evenement_rgpd` | `evenement_rgpd.piece_id` | `RESTRICT` |
| `locataire` | 1-N | `piece_justificative` | `piece_justificative.personne_id` | `SET NULL` — **autorisé, mais refusé par trigger** quand `qualification = 'obligation_legale'` (garde **G6**). |

**Il n'y a qu'une seule cascade dans tout le schéma**, et elle part de `accuse_reception`. C'est un choix : une cascade qui part d'une donnée métier peut toujours atteindre un fait constaté, et un fait constaté n'est pas effaçable (B7). En retirant les cascades, aucune suppression ne peut contourner un trigger par le bas. Il n'existe donc **aucun chemin** dans la base qui produise l'effet « tout effacer » — il n'existe pas de bouton, et il n'existe pas non plus de requête.

### 4.3 Contraintes en base, et preuves qu'elles tiennent

**Une contrainte écrite dans ce document n'est ni compilée, ni typée, ni exécutée : elle n'est que relue.** Trois défauts de cette sorte ont survécu à trois gates sans que personne ne les voie :

- un `CHECK` qui contient une sous-requête — **PostgreSQL le refuse à la création**, donc la contrainte n'existe pas ;
- un trigger dont la garde est inatteignable (`IF NEW.statut = OLD.statut THEN RETURN NEW` en tête) — la porte est écrite, commentée, et ne protège rien ;
- un champ que le trigger exige et que rien ne produit.

Écris le DDL, puis **exécute-le** :

```bash
node "$FORGE/scripts/ddl-exec.js" all "Forge Labs/gestion-locative"
```

Puis **déclare chaque garde**. Le nom de l'opération interdite n'est pas deviné par le contrôle : c'est le document qui le nomme.

#### 4.3.1 Le schéma

```sql
-- ============================================================
-- Bailly — schéma de référence. PostgreSQL 16, région UE.
-- Un seul schéma, `public` : il n'y a qu'un jeu de données, et un
-- schéma par version ferait porter à quatorze lignes le coût d'une
-- migration de nom. Le sens est donc porté par le nom de la table.
-- ============================================================

-- ------------------------------------------------------------
-- Le locataire. La seule entité qui porte une identité.
-- ------------------------------------------------------------
CREATE TABLE locataire (
  locataire_id     uuid PRIMARY KEY,
  nom              text NOT NULL,
  prenom           text NOT NULL,
  courriel         text,
  telephone        text,
  adresse_postale  text NOT NULL,
  etat             text NOT NULL DEFAULT 'actif',
  anonymise_le     timestamptz,
  CONSTRAINT identite_non_vide      CHECK (length(btrim(nom)) > 0 AND length(btrim(prenom)) > 0),
  CONSTRAINT courriel_format         CHECK (courriel IS NULL OR courriel ~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'),
  CONSTRAINT etat_connu              CHECK (etat IN ('actif', 'anonymise')),
  CONSTRAINT anonyme_exige_une_date  CHECK ((etat = 'anonymise') = (anonymise_le IS NOT NULL)),
  CONSTRAINT anonyme_retire_noms     CHECK (etat <> 'anonymise' OR (btrim(nom) = '' AND btrim(prenom) = '')),
  CONSTRAINT anonyme_retire_contact  CHECK (etat <> 'anonymise' OR (courriel IS NULL AND telephone IS NULL))
);

-- ------------------------------------------------------------
-- Le bail. C'est ici, et nulle part ailleurs, qu'une date entre.
-- Les deux dernières colonnes ne sont pas des colonnes : ce sont deux
-- expressions. Aucun code ne peut les écrire, PostgreSQL les refuse.
-- ------------------------------------------------------------
CREATE TABLE bail (
  bail_id                       uuid PRIMARY KEY,
  locataire_id                  uuid NOT NULL REFERENCES locataire(locataire_id),
  ecriture_bail                 uuid,
  reference                     text NOT NULL,
  adresse_bien                  text NOT NULL,
  regime                        text NOT NULL,
  date_debut                    date NOT NULL,
  date_fin_terme                date,
  jour_echeance_loyere          smallint NOT NULL,
  montant_loyer_centimes        bigint NOT NULL,
  depot_garantie_centimes       bigint,
  date_sortie_effective         date,
  restitution_depot_etat        text NOT NULL DEFAULT 'en_cours',
  date_opposition_reconduction date GENERATED ALWAYS AS (
    date_fin_terme - CASE WHEN regime = 'meuble' THEN interval '6 months' ELSE interval '3 months' END
  ) STORED,
  date_echeance_restitution     date GENERATED ALWAYS AS (
    CASE WHEN restitution_depot_etat = 'sans_retenue'
         THEN date_sortie_effective + 21
         ELSE date_sortie_effective + interval '1 month' END
  ) STORED,
  CONSTRAINT bail_par_locataire  UNIQUE (locataire_id),
  CONSTRAINT regime_connu         CHECK (regime IN ('vide', 'meuble')),
  CONSTRAINT reference_non_vide   CHECK (length(btrim(reference)) > 0),
  CONSTRAINT adresse_non_vide     CHECK (length(btrim(adresse_bien)) > 0),
  CONSTRAINT jour_dans_le_mois    CHECK (jour_echeance_loyere BETWEEN 1 AND 28),
  CONSTRAINT loyer_positif        CHECK (montant_loyer_centimes > 0),
  CONSTRAINT depot_non_negatif    CHECK (depot_garantie_centimes IS NULL OR depot_garantie_centimes >= 0),
  CONSTRAINT terme_apres_debut    CHECK (date_fin_terme IS NULL OR date_fin_terme > date_debut),
  CONSTRAINT sortie_apres_debut   CHECK (date_sortie_effective IS NULL OR date_sortie_effective >= date_debut),
  CONSTRAINT restitution_connue   CHECK (restitution_depot_etat IN ('en_cours', 'sans_retenue', 'avec_retenue')),
  CONSTRAINT sortie_et_restitution CHECK (restitution_depot_etat = 'en_cours' OR date_sortie_effective IS NOT NULL)
);

-- ------------------------------------------------------------
-- Le journal des écritures. C'est la seule table qui dit si c'est parti.
-- Aucune table métier ne porte de colonne « synchronisé » : l'état
-- d'une écriture est l'état de son écriture, et il n'existe qu'une fois.
-- ------------------------------------------------------------
CREATE TABLE ecriture (
  ecriture_id   uuid PRIMARY KEY,
  bail_id       uuid REFERENCES bail(bail_id),
  nature        text NOT NULL,
  empreinte     text NOT NULL,
  recue_le      timestamptz NOT NULL,
  confirme_le   timestamptz,
  CONSTRAINT nature_connue CHECK (nature IN (
    'bail', 'fait_constate', 'appreciation_travail', 'somme_due', 'somme_recue',
    'piece_jointe', 'demande', 'echeance_decision', 'piece_justificative', 'relance')),
  CONSTRAINT empreinte_non_vide CHECK (length(empreinte) > 0),
  CONSTRAINT confirmation_horodatee CHECK (confirme_le IS NULL OR confirme_le >= recue_le)
);

-- `bail` et `ecriture` se référencent l'une l'autre : le bail garde la
-- trace de l'écriture qui l'a produit. La contrainte est posée après coup,
-- parce que PostgreSQL ne résout pas une référence à une table qui n'existe
-- pas encore.
ALTER TABLE bail
  ADD CONSTRAINT ecriture_bail_presente FOREIGN KEY (ecriture_bail) REFERENCES ecriture(ecriture_id);

-- L'accusé de réception. Il est produit par le serveur, dans la
-- transaction qui a écrit la ligne, et il n'est rendu au téléphone
-- qu'après la validation de cette transaction.
CREATE TABLE accuse_reception (
  ecriture_id  uuid PRIMARY KEY REFERENCES ecriture(ecriture_id),
  confirme_le  timestamptz NOT NULL,
  empreinte    text NOT NULL
);

-- ------------------------------------------------------------
-- Saisie libre, en deux tables. Jamais une seule.
-- ------------------------------------------------------------
CREATE TABLE fait_constate (
  fait_constate_id  uuid PRIMARY KEY,
  bail_id           uuid NOT NULL REFERENCES bail(bail_id),
  ecriture_id       uuid NOT NULL REFERENCES ecriture(ecriture_id),
  sur_le_leure      date NOT NULL,
  texte             text NOT NULL,
  CONSTRAINT constat_non_vide CHECK (length(btrim(texte)) > 0)
);

CREATE TABLE appreciation_travail (
  appreciation_id  uuid PRIMARY KEY,
  bail_id          uuid NOT NULL REFERENCES bail(bail_id),
  ecriture_id      uuid NOT NULL REFERENCES ecriture(ecriture_id),
  sur_le_leure     date NOT NULL,
  texte            text NOT NULL,
  CONSTRAINT appreciation_non_vide CHECK (length(btrim(texte)) > 0)
);

-- ------------------------------------------------------------
-- Pièce jointe. Elle s'accroche à un constaté, et à rien d'autre.
-- ------------------------------------------------------------
CREATE TABLE piece_jointe (
  piece_jointe_id  uuid PRIMARY KEY,
  fait_constate_id uuid NOT NULL REFERENCES fait_constate(fait_constate_id),
  ecriture_id      uuid NOT NULL REFERENCES ecriture(ecriture_id),
  prise_le         timestamptz NOT NULL,
  empreinte_sha256 text NOT NULL,
  taille_octets    bigint NOT NULL,
  objet_cle        text,
  CONSTRAINT empreinte_non_vide CHECK (length(empreinte_sha256) = 64),
  CONSTRAINT taille_positive CHECK (taille_octets > 0),
  CONSTRAINT objet_cle_sans_url CHECK (objet_cle IS NULL OR objet_cle !~* '^https?://')
);

-- ------------------------------------------------------------
-- Encaissement. Une période par bail, et le 6e jour est une colonne.
-- ------------------------------------------------------------
CREATE TABLE encaissement (
  encaissement_id        uuid PRIMARY KEY,
  bail_id                uuid NOT NULL REFERENCES bail(bail_id),
  ecriture_id            uuid NOT NULL REFERENCES ecriture(ecriture_id),
  periode                date NOT NULL,
  date_echeance          date NOT NULL,
  date_creance_exigible  date GENERATED ALWAYS AS (date_echeance + 1) STORED,
  CONSTRAINT periode_par_bail  UNIQUE (bail_id, periode),
  CONSTRAINT periode_1er_du_mois CHECK (date_part('day', periode) = 1),
  CONSTRAINT exigible_apres_echeance CHECK (date_creance_exigible > date_echeance)
);

CREATE TABLE somme_due (
  somme_due_id       uuid PRIMARY KEY,
  encaissement_id    uuid NOT NULL REFERENCES encaissement(encaissement_id),
  ecriture_id        uuid NOT NULL REFERENCES ecriture(ecriture_id),
  nature             text NOT NULL,
  montant_centimes   bigint NOT NULL,
  libelle            text,
  -- B16 : la frontière du MVP est ici, dans une contrainte, pas dans un if.
  CONSTRAINT nature_connue CHECK (nature IN ('loyer', 'provisions_sur_charges', 'arriere', 'acompte')),
  CONSTRAINT montant_non_negatif CHECK (montant_centimes >= 0),
  CONSTRAINT libelle_non_vide CHECK (libelle IS NULL OR length(btrim(libelle)) > 0)
);

CREATE TABLE somme_recue (
  somme_recue_id     uuid PRIMARY KEY,
  encaissement_id    uuid NOT NULL REFERENCES encaissement(encaissement_id),
  ecriture_id        uuid NOT NULL REFERENCES ecriture(ecriture_id),
  montant_centimes   bigint NOT NULL,
  recue_le           date NOT NULL,
  CONSTRAINT montant_non_negatif CHECK (montant_centimes >= 0)
);

-- ------------------------------------------------------------
-- Demande : qui doit agir, obligatoire, sans défaut.
-- E8 : il n'y a pas de contrainte d'unicité sur le jour. Deux demandes
-- le même jour restent deux lignes, et rien ne les rapproche.
-- ------------------------------------------------------------
CREATE TABLE demande (
  demande_id     uuid PRIMARY KEY,
  bail_id        uuid NOT NULL REFERENCES bail(bail_id),
  ecriture_id    uuid NOT NULL REFERENCES ecriture(ecriture_id),
  qui_doit_agir  text NOT NULL,
  intitule       text NOT NULL,
  objet          text NOT NULL,
  recue_le       timestamptz NOT NULL,
  cloturee_le    timestamptz,
  CONSTRAINT qui_doit_agir_connu CHECK (qui_doit_agir IN ('proprietaire', 'locataire')),
  CONSTRAINT intitule_non_vide CHECK (length(btrim(intitule)) > 0),
  CONSTRAINT objet_non_vide CHECK (length(btrim(objet)) > 0),
  CONSTRAINT cloture_posterieure CHECK (cloturee_le IS NULL OR cloturee_le >= recue_le)
);

-- ------------------------------------------------------------
-- Échéance. Dérivée du bail, jamais saisie à côté.
-- ------------------------------------------------------------
CREATE TABLE echeance (
  echeance_id    uuid PRIMARY KEY,
  bail_id        uuid NOT NULL REFERENCES bail(bail_id),
  ecriture_id    uuid NOT NULL REFERENCES ecriture(ecriture_id),
  type           text NOT NULL,
  famille        text NOT NULL,
  date_echeance  date NOT NULL,
  decidee_le     timestamptz,
  accord         boolean NOT NULL DEFAULT false,
  remontee_le    timestamptz,
  CONSTRAINT echeance_par_bail_type    UNIQUE (bail_id, type),
  CONSTRAINT type_connu                 CHECK (type IN ('opposition_reconduction', 'creance_exigible', 'restitution_depot')),
  CONSTRAINT famille_connue             CHECK (famille IN ('bloquante', 'marge')),
  -- Une marge est une information, pas une décision : le schéma ne sait
  -- pas la traiter, et il ne peut pas se tromper de famille.
  CONSTRAINT marge_nest_jamais_decidee  CHECK (famille = 'bloquante' OR (decidee_le IS NULL AND accord = false)),
  CONSTRAINT accord_exige_une_decision  CHECK (accord = false OR decidee_le IS NOT NULL),
  CONSTRAINT remontee_posterieure       CHECK (remontee_le IS NULL OR remontee_le >= date_echeance)
);

-- ------------------------------------------------------------
-- Pièce justificative : le support des trois états RGPD.
-- `conserve_jusqua` est sans défaut et sans produit tant que Q2 n'est
-- pas tranchée. NULL veut dire « la durée légale n'est pas connue »,
-- et l'export écrit un tiret, jamais une date inventée.
-- ------------------------------------------------------------
CREATE TABLE piece_justificative (
  piece_id        uuid PRIMARY KEY,
  bail_id         uuid NOT NULL REFERENCES bail(bail_id),
  ecriture_id     uuid NOT NULL REFERENCES ecriture(ecriture_id),
  nom             text NOT NULL,
  qualification   text NOT NULL,
  personne_id     uuid REFERENCES locataire(locataire_id),
  conserve_jusqua date,
  objet_cle       text,
  CONSTRAINT nom_non_vide CHECK (length(btrim(nom)) > 0),
  CONSTRAINT qualification_connue CHECK (qualification IN ('donnee_personnelle', 'obligation_legale', 'interne')),
  -- Tant que la durée n'est pas connue, une pièce légale n'est pas
  --ffinable : elle reste identifiée, et rien ne peut la dépersonnaliser.
  CONSTRAINT obligation_legale_garde_identite CHECK (qualification <> 'obligation_legale' OR personne_id IS NOT NULL),
  CONSTRAINT objet_cle_sans_url CHECK (objet_cle IS NULL OR objet_cle !~* '^https?://')
);

-- Le journal des trois décisions. Il s'ajoute, il ne se réécrit pas.
CREATE TABLE evenement_rgpd (
  evenement_id  uuid PRIMARY KEY,
  piece_id      uuid NOT NULL REFERENCES piece_justificative(piece_id),
  action        text NOT NULL,
  decide_le     timestamptz NOT NULL,
  CONSTRAINT action_connue CHECK (action IN ('effacer', 'anonymiser', 'conserver'))
);
```

#### 4.3.2 Les fonctions, les portes et les vues

```sql
-- ============================================================
-- Fonctions, portes, vues. Chaque porte est essayée plus bas.
-- ============================================================

-- Le jour J du mois M de l'année A. `make_date` refuse un jour absent
-- du mois ; c'est pourquoi la borne est 28 et non 31, et non « la fin
-- du mois » : février doit avoir une réponse, pas une approximation.
CREATE FUNCTION fn_jour_du_mois(annee integer, mois integer, jour smallint)
RETURNS date LANGUAGE sql IMMUTABLE STRICT AS
$$ SELECT make_date(annee::integer, mois::integer, jour::integer) $$;

-- Une écriture est confirmée si, et seulement si, la colonne qui le dit
-- le dit. Aucune autre source n'existe dans la base : c'est la réponse
-- à « qu'est-ce qui distingue les écritures en attente des écritures
-- parties », et la réponse est « une colonne, dans une seule table ».
CREATE FUNCTION fn_est_confirmee(p_ecriture_id uuid)
RETURNS boolean LANGUAGE sql STABLE AS
$$ SELECT EXISTS (
     SELECT 1 FROM ecriture e
     WHERE e.ecriture_id = p_ecriture_id AND e.confirme_le IS NOT NULL) $$;

-- La date attendue d'une échéance, lue à sa source, jamais recopiée
-- à la main. `creance_exigible` n'a pas de source dans le bail : sa
-- source est la ligne d'encaissement du mois, et une échéance qui n'a
-- pas de ligne n'a pas de date.
CREATE FUNCTION fn_date_echeance_attendue(p_bail_id uuid, p_type text)
RETURNS date LANGUAGE sql STABLE AS
$$ SELECT CASE p_type
     WHEN 'opposition_reconduction' THEN b.date_opposition_reconduction
     WHEN 'restitution_depot'        THEN b.date_echeance_restitution
     WHEN 'creance_exigible'        THEN (
       SELECT min(enc.date_creance_exigible) FROM encaissement enc
       WHERE enc.bail_id = p_bail_id
         AND enc.date_creance_exigible > now())
   END
   FROM bail b WHERE b.bail_id = p_bail_id $$;

-- ============================================================
-- Porte 1 — B1. Une écriture ne peut être confirmée que par un accusé,
-- et l'accusé ne peut exister que dans la transaction qui a écrit la
-- ligne. La contrainte est DEFERRABLE : elle ne se vérifie pas à
-- l'INSERT, elle se vérifie au COMMIT. Une réponse envoyée avant le
-- commit la ferait échouer — donc le téléphone ne peut pas recevoir
-- « confirmé » pour une écriture que le serveur n'a pas validée.
-- ============================================================
CREATE FUNCTION fn_accuse_exige() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM accuse_reception a WHERE a.ecriture_id = NEW.ecriture_id) THEN
    RAISE EXCEPTION
      'écriture % : aucun accusé de réception, donc rien ne sera annoncé comme enregistré',
      NEW.ecriture_id USING ERRCODE = 'check_violation';
  END IF;
  RETURN NULL;
END $$;

CREATE CONSTRAINT TRIGGER trg_ecriture_accuse_exige
AFTER INSERT ON ecriture
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW EXECUTE FUNCTION fn_accuse_exige();

-- ============================================================
-- Porte 2 — B2. Une écriture confirmée ne redescend pas en attente,
-- et sa date de confirmation ne se déplace pas. Elle est partie.
-- ============================================================
CREATE FUNCTION fn_confirmation_esterelle() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  IF OLD.confirme_le IS NOT NULL AND NEW.confirme_le IS DISTINCT FROM OLD.confirme_le THEN
    RAISE EXCEPTION 'écriture % déjà confirmée par le serveur : sa confirmation ne se reprend pas',
      OLD.ecriture_id USING ERRCODE = 'check_violation';
  END IF;
  RETURN NEW;
END $$;

CREATE TRIGGER trg_confirmation_esterelle
BEFORE UPDATE OF confirme_le ON ecriture
FOR EACH ROW EXECUTE FUNCTION fn_confirmation_esterelle();

-- ============================================================
-- Porte 3 — B12. La date d'une échéance est lue à sa source à chaque
-- écriture. Elle ne se tape pas : toute écriture directe qui ne soit pas
-- la dérivation elle-même est refusée. Et une échéance déjà décidée ne
-- se déplace pas, parce qu'une décision prise sur une date est un acte.
-- ============================================================
CREATE FUNCTION fn_echeance_derivee() RETURNS trigger
LANGUAGE plpgsql AS $$
DECLARE
  attendue      date;
  en_derivation text;
BEGIN
  attendue := fn_date_echeance_attendue(NEW.bail_id, NEW.type);
  IF attendue IS NULL THEN
    RAISE EXCEPTION 'échéance de type % : la source ne produit aucune date',
      NEW.type USING ERRCODE = 'check_violation';
  END IF;

  en_derivation := current_setting('bailly.derivation', true);

  IF TG_OP = 'UPDATE' AND en_derivation IS DISTINCT FROM '1'
     AND NEW.date_echeance IS DISTINCT FROM OLD.date_echeance THEN
    RAISE EXCEPTION 'la date d''une échéance est dérivée de sa source : elle ne se tape pas (obligations : %)',
      NEW.type USING ERRCODE = 'check_violation';
  END IF;

  IF TG_OP = 'UPDATE' AND OLD.decidee_le IS NOT NULL
     AND attendue IS DISTINCT FROM OLD.date_echeance THEN
    RAISE EXCEPTION 'échéance % déjà décidée le % : sa date ne bouge plus',
      OLD.echeance_id, OLD.decidee_le USING ERRCODE = 'check_violation';
  END IF;

  NEW.date_echeance := attendue;
  RETURN NEW;
END $$;

CREATE TRIGGER trg_echeance_derivee
BEFORE INSERT OR UPDATE ON echeance
FOR EACH ROW EXECUTE FUNCTION fn_echeance_derivee();

-- ============================================================
-- Porte 4 — la bascule 3 mois / 6 mois n'est pas écrite ici : c'est
-- `bail.regime`, et les deux dates sont des colonnes générées. Cette
-- fonction ne propage rien d'autre, et le garde-fou n'a donc rien à
-- décider : il lit deux colonnes que PostgreSQL a calculées.
-- ============================================================
CREATE FUNCTION fn_encaissement_echeance_derivee() RETURNS trigger
LANGUAGE plpgsql AS $$
DECLARE
  attendue      date;
  jour          smallint;
  en_derivation text;
BEGIN
  SELECT b.jour_echeance_loyere INTO jour FROM bail b WHERE b.bail_id = NEW.bail_id;
  IF jour IS NULL THEN
    RAISE EXCEPTION 'encaissement % : le bail n''existe plus, sa date d''échéance n''a plus de source',
      NEW.encaissement_id USING ERRCODE = 'check_violation';
  END IF;

  attendue := fn_jour_du_mois(
    extract(year FROM NEW.periode)::integer,
    extract(month FROM NEW.periode)::integer,
    jour);

  en_derivation := current_setting('bailly.derivation', true);

  IF TG_OP = 'UPDATE' AND en_derivation IS DISTINCT FROM '1'
     AND NEW.date_echeance IS DISTINCT FROM OLD.date_echeance THEN
    RAISE EXCEPTION 'la date d''échéance d''un encaissement est dérivée du bail : elle ne se tape pas'
      USING ERRCODE = 'check_violation';
  END IF;

  NEW.date_echeance := attendue;
  RETURN NEW;
END $$;

CREATE TRIGGER trg_encaissement_echeance_derivee
BEFORE INSERT OR UPDATE ON encaissement
FOR EACH ROW EXECUTE FUNCTION fn_encaissement_echeance_derivee();

-- La dérivation, appelée quand le bail change : les échéances du bail,
-- et les dates d'échéance des mois déjà ouverts.
CREATE FUNCTION fn_deriver(p_bail_id uuid, p_ecriture_id uuid) RETURNS void
LANGUAGE plpgsql AS $$
DECLARE
  types_a_deriver text[] := ARRAY['opposition_reconduction', 'restitution_depot'];
  t              text;
  src            date;
BEGIN
  PERFORM set_config('bailly.derivation', '1', true);

  FOREACH t IN ARRAY types_a_deriver LOOP
    src := fn_date_echeance_attendue(p_bail_id, t);
    IF src IS NOT NULL THEN
      INSERT INTO echeance (echeance_id, bail_id, ecriture_id, type, famille, date_echeance)
      VALUES (gen_random_uuid(), p_bail_id, p_ecriture_id, t, 'bloquante', src)
      ON CONFLICT (bail_id, type) DO UPDATE
        SET date_echeance = EXCLUDED.date_echeance, ecriture_id = EXCLUDED.ecriture_id
        WHERE echeance.decidee_le IS NULL;
    ELSE
      DELETE FROM echeance WHERE bail_id = p_bail_id AND type = t;
    END IF;
  END LOOP;

  UPDATE encaissement SET date_echeance = date_echeance WHERE bail_id = p_bail_id;

  PERFORM set_config('bailly.derivation', '', true);
END $$;

CREATE FUNCTION fn_bail_derive() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  PERFORM fn_deriver(NEW.bail_id, NEW.ecriture_bail);
  RETURN NULL;
END $$;

CREATE TRIGGER trg_bail_derive
AFTER INSERT OR UPDATE OF date_fin_terme, jour_echeance_loyere, date_sortie_effective,
  restitution_depot_etat, ecriture_bail ON bail
FOR EACH ROW WHEN (NEW.ecriture_bail IS NOT NULL)
EXECUTE FUNCTION fn_bail_derive();

-- ============================================================
-- Porte 5 — B7. Un constat est une donnée sur la personne : elle ne
-- s'efface pas, et elle ne se corrige plus une fois confirmée (B4).
-- ============================================================
CREATE FUNCTION fn_constat_gele() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  IF NOT fn_est_confirmee(OLD.ecriture_id) THEN RETURN OLD; END IF;
  IF TG_OP = 'DELETE' THEN
    RAISE EXCEPTION 'fait constaté % : un constat exportable ne s''efface pas',
      OLD.fait_constate_id USING ERRCODE = 'check_violation';
  END IF;
  RAISE EXCEPTION 'fait constaté % : confirmé par le serveur, il ne se corrige plus',
    OLD.fait_constate_id USING ERRCODE = 'check_violation';
END $$;

CREATE TRIGGER trg_fait_constate_gele
BEFORE DELETE OR UPDATE ON fait_constate
FOR EACH ROW EXECUTE FUNCTION fn_constat_gele();

-- Porte 6 — B7, l'autre moiety : une photo est une pièce de constat,
-- donc elle est gelée par la même règle et pour la même raison.
CREATE FUNCTION fn_photo_gelee() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'pièce jointe % : confirmée par le serveur, elle ne s''efface pas',
    OLD.piece_jointe_id USING ERRCODE = 'check_violation';
END $$;

CREATE TRIGGER trg_piece_jointe_gele
BEFORE DELETE ON piece_jointe
FOR EACH ROW WHEN (fn_est_confirmee(OLD.ecriture_id))
EXECUTE FUNCTION fn_photo_gelee();

-- ============================================================
-- Porte 7 — B18. Un bail ne se supprime pas. Il n'existe aucun chemin
-- qui effacerait un dossier d'un coup, et il n'y a pas de bouton.
-- ============================================================
CREATE FUNCTION fn_bail_intouchable() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'le bail % ne se supprime pas : effacer, anonymiser et conserver sont trois décisions distinctes, prises pièce par pièce',
    OLD.bail_id USING ERRCODE = 'check_violation';
END $$;

CREATE TRIGGER trg_bail_intouchable
BEFORE DELETE ON bail
FOR EACH ROW EXECUTE FUNCTION fn_bail_intouchable();

-- ============================================================
-- Porte 8 — B9. Une pièce conservée pour obligation légale ne perd pas
-- son identifiant : ce serait un effacement déguisé en anonymisation.
-- ============================================================
CREATE FUNCTION fn_obligation_legale_garde_son_identite() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  IF OLD.qualification = 'obligation_legale' AND NEW.personne_id IS NULL THEN
    RAISE EXCEPTION 'pièce % : conservée pour obligation légale, elle garde la personne à qui elle se rapporte',
      OLD.piece_id USING ERRCODE = 'check_violation';
  END IF;
  RETURN NEW;
END $$;

CREATE TRIGGER trg_obligation_legale_garde_son_identite
BEFORE UPDATE OF personne_id ON piece_justificative
FOR EACH ROW EXECUTE FUNCTION fn_obligation_legale_garde_son_identite();

-- ============================================================
-- Porte 9 — B13. Une échéance manquée remonte une fois, puis se classe.
-- « Une fois » n'est pas une règle d'écran : c'est une colonne qui ne
-- s'écrit pas deux fois. Une décision ne se réécrit pas non plus.
-- ============================================================
CREATE FUNCTION fn_remontee_et_decision_uniques() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  IF OLD.remontee_le IS NOT NULL AND NEW.remontee_le IS DISTINCT FROM OLD.remontee_le THEN
    RAISE EXCEPTION 'échéance % déjà remontée le % : elle ne remonte pas une seconde fois',
      OLD.echeance_id, OLD.remontee_le USING ERRCODE = 'check_violation';
  END IF;
  IF OLD.decidee_le IS NOT NULL AND NEW.decidee_le IS DISTINCT FROM OLD.decidee_le THEN
    RAISE EXCEPTION 'échéance % déjà décidée le % : une décision ne se réécrit pas',
      OLD.echeance_id, OLD.decidee_le USING ERRCODE = 'check_violation';
  END IF;
  RETURN NEW;
END $$;

CREATE TRIGGER trg_remontee_et_decision_uniques
BEFORE UPDATE OF remontee_le, decidee_le ON echeance
FOR EACH ROW EXECUTE FUNCTION fn_remontee_et_decision_uniques();

-- ============================================================
-- Porte 10 — le journal RGPD ne se réécrit pas.
-- ============================================================
CREATE FUNCTION fn_evenement_incorrection() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'le journal des décisions RGPD s''ajoute, il ne se modifie pas'
    USING ERRCODE = 'check_violation';
END $$;

CREATE TRIGGER trg_evenement_incorrection
BEFORE DELETE OR UPDATE ON evenement_rgpd
FOR EACH ROW EXECUTE FUNCTION fn_evenement_incorrection();

-- ============================================================
-- Index. Quatorze baux, et N6 : l'export complet en moins d'une minute.
-- ============================================================
CREATE INDEX idx_fait_constate_bail_date  ON fait_constate (bail_id, sur_le_leure DESC);
CREATE INDEX idx_appreciation_bail_date    ON appreciation_travail (bail_id, sur_le_leure DESC);
CREATE INDEX idx_piece_jointe_fait         ON piece_jointe (fait_constate_id);
CREATE INDEX idx_echeance_bail_famille     ON echeance (bail_id, famille);
CREATE INDEX idx_echeance_non_decidee      ON echeance (date_echeance) WHERE decidee_le IS NULL;
CREATE INDEX idx_somme_due_enc             ON somme_due (encaissement_id);
CREATE INDEX idx_somme_recue_enc           ON somme_recue (encaissement_id);
CREATE INDEX idx_demande_bail_horloge      ON demande (bail_id, recue_le DESC);
CREATE INDEX idx_ecriture_non_confirmee    ON ecriture (recue_le) WHERE confirme_le IS NULL;
CREATE INDEX idx_piece_justificative_bail  ON piece_justificative (bail_id);

-- ============================================================
-- B7 : deux destinations d'export, et aucun objet qui les réunisse.
-- `v_dossier_locataire` est la seule entrée de l'export d'un dossier ;
-- il ne lit pas `appreciation_travail`, et il n'existe aucune vue qui le
-- fasse. Le contrôle d'export ne dispose donc d'aucun chemin.
-- ============================================================
CREATE VIEW v_dossier_locataire AS
SELECT fc.fait_constate_id, b.locataire_id, b.locataire_id AS dossier_id,
       fc.bail_id, fc.sur_le_leure, fc.texte,
       (SELECT count(*) FROM piece_jointe pj WHERE pj.fait_constate_id = fc.fait_constate_id) AS pieces
  FROM fait_constate fc
  JOIN bail b ON b.bail_id = fc.bail_id;
```

#### 4.3.3 Les données de pose, et ce que le schéma affirme

Ce bloc ne crée aucun fait du produit. Il pose deux baux, un mois échu, un constat, une appréciation, une photo, une pièce de dossier et une demande, puis **affirme** sept choses que PostgreSQL vérifie : la bascule 3/6, le 6e jour, les 21 jours, la dérivation des échéances, l'absence de marge au MVP, la séparation constaté/appréciation, et le fait qu'**aucune écriture sans accusé n'existe côté serveur**. Si une de ces affirmations est fausse, le bloc échoue et le gate le voit.

```sql
-- ============================================================
-- Données de pose. Elles ne créent aucun fait du produit : elles posent
-- un vocabulaire de dates — un bail vide, un bail meublé, un mois échu,
-- une échéance déjà remontée — pour que les portes aient de quoi
-- s'exercer, et pour que les affirmations du schéma soient vérifiées
-- par PostgreSQL plutôt que par une relecture.
-- ============================================================

INSERT INTO locataire (locataire_id, nom, prenom, courriel, telephone, adresse_postale)
VALUES ('11111111-1111-1111-1111-111111111111', 'Ferrand', 'Colette', 'colette@example.org', '0600000001', '12 rue Dumenge, 69003 Lyon');
INSERT INTO locataire (locataire_id, nom, prenom, courriel, telephone, adresse_postale)
VALUES ('22222222-2222-2222-2222-222222222222', 'Amrani', 'Yanis', 'yanis@example.org', '0600000002', '4 rue Dumenge, 69003 Lyon');

INSERT INTO bail (bail_id, locataire_id, reference, adresse_bien, regime, date_debut, date_fin_terme,
                  jour_echeance_loyere, montant_loyer_centimes, depot_garantie_centimes, date_sortie_effective)
VALUES ('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'BL-001', 'Courges 3e', 'vide',
        DATE '2024-10-01', DATE '2027-03-31', 5, 62000, 62000, DATE '2027-05-15');
INSERT INTO bail (bail_id, locataire_id, reference, adresse_bien, regime, date_debut, date_fin_terme,
                  jour_echeance_loyere, montant_loyer_centimes, depot_garantie_centimes)
VALUES ('44444444-4444-4444-4444-444444444444', '22222222-2222-2222-2222-222222222222', 'BL-002', 'Fournival 2e', 'meuble',
        DATE '2025-04-01', DATE '2028-03-31', 10, 91000, 91000);

-- Le journal, puis l'accusé : la seule façon dont une écriture devient confirmée.
-- L'ecriture et son accuse sont ecrites dans LA MEME TRANSACTION. C'est la
-- seule facon dont un « confirme » peut exister, et c'est ce que verifie la
-- contrainte differee `trg_ecriture_accuse_exige` au moment du COMMIT. Si les
-- deux ecritures etaient separees, elle echouerait — donc la reponse « confirme »
-- ne peut pas partir avant que la transaction soit validee.
DO $$
BEGIN
  INSERT INTO ecriture (ecriture_id, bail_id, nature, empreinte, recue_le, confirme_le)
  VALUES ('55555555-5555-5555-5555-555555555555', '33333333-3333-3333-3333-333333333333', 'bail', 'sha256:aaa', now(), now());
  INSERT INTO accuse_reception (ecriture_id, confirme_le, empreinte)
  VALUES ('55555555-5555-5555-5555-555555555555', now(), 'sha256:aaa');
END $$;

UPDATE bail SET ecriture_bail = '55555555-5555-5555-5555-555555555555' WHERE bail_id = '33333333-3333-3333-3333-333333333333';
UPDATE bail SET ecriture_bail = '55555555-5555-5555-5555-555555555555' WHERE bail_id = '44444444-4444-4444-4444-444444444444';

-- Un constat, une appréciation, une photo : la frontière de B7 tient.
INSERT INTO fait_constate (fait_constate_id, bail_id, ecriture_id, sur_le_leure, texte)
VALUES ('66666666-6666-6666-6666-666666666666', '33333333-3333-3333-3333-333333333333', '55555555-5555-5555-5555-555555555555', DATE '2027-03-05', 'La chasse d''eau fuyait.');
INSERT INTO appreciation_travail (appreciation_id, bail_id, ecriture_id, sur_le_leure, texte)
VALUES ('77777777-7777-7777-7777-777777777777', '33333333-3333-3333-3333-333333333333', '55555555-5555-5555-5555-555555555555', DATE '2027-03-05', 'Difficile à relouer.');
INSERT INTO piece_jointe (piece_jointe_id, fait_constate_id, ecriture_id, prise_le, empreinte_sha256, taille_octets, objet_cle)
VALUES ('88888888-8888-8888-8888-888888888888', '66666666-6666-6666-6666-666666666666', '55555555-5555-5555-5555-555555555555', now(),
        repeat('a', 64), 2411520, 'bailly/2027/03/pj-1');

-- Un mois échu, et le 6e jour qui tombe le 6.
INSERT INTO encaissement (encaissement_id, bail_id, ecriture_id, periode, date_echeance)
VALUES ('99999999-9999-9999-9999-999999999999', '33333333-3333-3333-3333-333333333333', '55555555-5555-5555-5555-555555555555', DATE '2027-03-01', DATE '2027-03-05');
INSERT INTO somme_due (somme_due_id, encaissement_id, ecriture_id, nature, montant_centimes)
VALUES ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '99999999-9999-9999-9999-999999999999', '55555555-5555-5555-5555-555555555555', 'loyer', 62000);

-- La pièce du dossier : conservée pour obligation légale, donc identifiée,
-- et sans date de fin parce que Q2 n'est pas tranchée.
INSERT INTO piece_justificative (piece_id, bail_id, ecriture_id, nom, qualification, personne_id, conserve_jusqua)
VALUES ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '33333333-3333-3333-3333-333333333333', '55555555-5555-5555-5555-555555555555',
        'Bail signé du 01/10/2024', 'obligation_legale', '11111111-1111-1111-1111-111111111111', NULL);
INSERT INTO evenement_rgpd (evenement_id, piece_id, action, decide_le)
VALUES ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'conserver', now());

-- Une demande, avec qui doit agir, et une échéance déjà remontée une fois.
INSERT INTO demande (demande_id, bail_id, ecriture_id, qui_doit_agir, intitule, objet, recue_le)
VALUES ('dddddddd-dddd-dddd-dddd-dddddddddddd', '33333333-3333-3333-3333-333333333333', '55555555-5555-5555-5555-555555555555',
        'proprietaire', 'Devis de remplacement de la chasse', 'Courges 3e', now());
UPDATE echeance SET remontee_le = DATE '2027-06-16'
 WHERE bail_id = '33333333-3333-3333-3333-333333333333' AND type = 'restitution_depot';

-- ============================================================
-- Ce que le schéma affirme, vérifié par PostgreSQL et non par relecture.
-- ============================================================
DO $$
DECLARE
  v_date date;
  v_n    integer;
BEGIN
  -- La bascule 3 mois / 6 mois tient dans `bail.regime`, et nulle part ailleurs.
  SELECT date_opposition_reconduction INTO v_date FROM bail WHERE bail_id = '33333333-3333-3333-3333-333333333333';
  IF v_date <> DATE '2026-12-31' THEN
    RAISE EXCEPTION 'bail vide : opposition attendue le 31/12/2026, obtenue le %', v_date;
  END IF;
  SELECT date_opposition_reconduction INTO v_date FROM bail WHERE bail_id = '44444444-4444-4444-4444-444444444444';
  IF v_date <> DATE '2027-09-30' THEN
    RAISE EXCEPTION 'bail meuble : opposition attendue le 30/09/2027, obtenue le %', v_date;
  END IF;

  -- Le 6e jour est le lendemain de l'échéance du loyer, jamais une constante du code.
  SELECT date_creance_exigible INTO v_date FROM encaissement WHERE bail_id = '33333333-3333-3333-3333-333333333333';
  IF v_date <> DATE '2027-03-06' THEN
    RAISE EXCEPTION 'créance exigible attendue le 06/03/2027, obtenue le %', v_date;
  END IF;

  -- La restitution : 21 jours sans retenue, un mois avec.
  SELECT date_echeance_restitution INTO v_date FROM bail WHERE bail_id = '33333333-3333-3333-3333-333333333333';
  IF v_date <> DATE '2027-06-15' THEN
    RAISE EXCEPTION 'restitution avec retenue attendue le 15/06/2027, obtenue le %', v_date;
  END IF;
  UPDATE bail SET restitution_depot_etat = 'sans_retenue' WHERE bail_id = '33333333-3333-3333-3333-333333333333';
  SELECT date_echeance_restitution INTO v_date FROM bail WHERE bail_id = '33333333-3333-3333-3333-333333333333';
  IF v_date <> DATE '2027-06-05' THEN
    RAISE EXCEPTION 'restitution sans retenue attendue le 05/06/2027, obtenue le %', v_date;
  END IF;

  -- Les deux échéances bloquantes du bail vide existent, dérivées, et ne sont pas saisies.
  SELECT count(*) INTO v_n FROM echeance WHERE bail_id = '33333333-3333-3333-3333-333333333333' AND famille = 'bloquante';
  IF v_n <> 2 THEN
    RAISE EXCEPTION 'le bail vide doit porter 2 échéances bloquantes dérivées, il en porte %', v_n;
  END IF;
  SELECT count(*) INTO v_n FROM echeance WHERE famille = 'marge';
  IF v_n <> 0 THEN
    RAISE EXCEPTION 'aucune échéance de marge au MVP : les deux échéances longues sont hors périmètre, % trouvées', v_n;
  END IF;

  -- B7 : les deux destinations d'export sont deux tables, et une seule
  -- porte des pièces. Le constaté est exportable, l'appréciation non.
  SELECT count(*) INTO v_n FROM fait_constate;
  IF v_n <> 1 THEN RAISE EXCEPTION '1 fait constaté attendu, %', v_n; END IF;
  SELECT count(*) INTO v_n FROM appreciation_travail;
  IF v_n <> 1 THEN RAISE EXCEPTION '1 appréciation attendue, %', v_n; END IF;

  -- B2 : côté serveur, il n'existe pas de ligne « en attente ». Toutes
  -- les écritures du jeu de pose portent un accusé.
  SELECT count(*) INTO v_n FROM ecriture e
   WHERE NOT EXISTS (SELECT 1 FROM accuse_reception a WHERE a.ecriture_id = e.ecriture_id);
  IF v_n <> 0 THEN
    RAISE EXCEPTION 'le serveur ne doit contenir aucune écriture sans accusé, il en contient %', v_n;
  END IF;
END $$;
```

Le contrôle **positif** de l'asymétrie B7. Le même `DELETE` est refusé sur `fait_constate` (garde **G3**) et **accepté** ici. Une garde qui réussit ne prouve qu'une moitié d'une règle asymétrique ; ce bloc prouve l'autre.

```sql
DELETE FROM appreciation_travail WHERE appreciation_id = '77777777-7777-7777-7777-777777777777';
```

#### 4.3.4 Les dix-huit gardes

Chacune est une tentative qui **doit** échouer. Si l'une passe, `ddl-exec guards` le dit, et ce qu'il dit est vrai : c'est PostgreSQL qui l'a exécutée.

**B1 — Aucune écriture ne peut être confirmée sans accusé de réception.** Si cette instruction passe, le serveur peut contenir une ligne « en attente », et donc répondre « confirmé » avant d'avoir validé. Le refus vient du trigger **différé** : il ne se déclenche qu'au `COMMIT`, donc il attrape précisément le cas dangereux — celui où la réponse part avant la validation.

```sql
-- forge:ddl-refuse
-- Poser une écriture sans son accusé de réception. Le trigger de contrainte
-- `trg_ecriture_accuse_exige` est DEFERRABLE : il se vérifie au COMMIT, donc
-- une réponse « confirmé » envoyée avant la validation serait fausse, et la
-- validation échoue.
INSERT INTO ecriture (ecriture_id, bail_id, nature, empreinte, recue_le)
VALUES ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '33333333-3333-3333-3333-333333333333', 'fait_constate', 'sha256:zzz', now());
```

**B2 — Une écriture confirmée ne se déconfirmed pas.** Sa confirmation est un fait passé : ni une reprise, ni une correction, ni un retour de l'horloge ne la réécrivent. C'est la moitié « jamais deux mots » de B2 : « pas encore envoyé » ne peut pas devenir une seconde fois la vérité d'une ligne déjà partie.

```sql
-- forge:ddl-refuse
-- Déplacer la date de confirmation d'une écriture déjà confirmée. Si cette
-- instruction passe, une écriture partie peut être rendue non partie, et
-- l'application peut re-mentir au téléphone.
UPDATE ecriture SET confirme_le = now() + interval '1 day' WHERE ecriture_id = '55555555-5555-5555-5555-555555555555';
```

**B7 — Un fait constaté ne s'efface pas.** Une donnée sur la personne, exportable, est **non effaçable** : c'est la formulation positive de « il n'y a pas de bouton tout effacer ».

```sql
-- forge:ddl-refuse
-- Effacer un fait constaté confirmé. Si cette instruction passe, B7 n'est pas
-- une contrainte du produit mais une intention.
DELETE FROM fait_constate WHERE fait_constate_id = '66666666-6666-6666-6666-666666666666';
```

**B7 — Une pièce jointe ne s'efface pas.** Elle est une pièce de constat, donc elle suit la même règle. `WHERE fn_est_confirmee(...)` est dans le trigger : tant que la photo n'est pas partie, B4 autorise à la retirer.

```sql
-- forge:ddl-refuse
-- Effacer une photo confirmée. Une photo de dégât non contestable est la
-- donnée la plus fragile du dossier ; la garder est une obligation, pas une
-- préférence.
DELETE FROM piece_jointe WHERE piece_jointe_id = '88888888-8888-8888-8888-888888888888';
```

**B18 — Un bail ne se supprime pas.** Le message est écrit pour être lu dans un journal : il dit **pourquoi** il n'y a pas de bouton, et il nomme les trois décisions à la place.

```sql
-- forge:ddl-refuse
-- Supprimer un bail. Si cette instruction passe, il existe un chemin qui
-- efface un dossier d'un coup — le geste que B18 interdit et qui mettrait le
-- commanditaire en infraction.
DELETE FROM bail WHERE bail_id = '33333333-3333-3333-3333-333333333333';
```

**B9 — Une pièce conservée pour obligation légale garde son identifiant.** C'est la porte qui empêche un effacement de se déguiser en anonymisation. Elle ne dépend **pas** de Q2 : un bail est un document conservé quelle que soit la durée légale, donc cette porte est déjà posable.

```sql
-- forge:ddl-refuse
-- Anonymiser une pièce conservée pour obligation légale. Si cette instruction
-- passe, « anonymiser » est un effacement avec un autre nom, et les trois
-- états de B9 se réduisent à deux.
UPDATE piece_justificative SET personne_id = NULL WHERE piece_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
```

**Q1 — La date d'opposition à reconduction ne se tape pas.** `date_opposition_reconduction` est une **colonne générée**. Le refus vient de PostgreSQL lui-même, qui n'accepte sur une telle colonne que la valeur `DEFAULT`. C'est la démonstration exécutée de la réponse à « qu'est-ce qui fait basculer le délai de 3 à 6 ? » : pas une valeur, pas un `if` — **une expression, et la seule entrée est `bail.regime`**.

```sql
-- forge:ddl-refuse
-- Écrire la date d'échéance de la fin de terme à la main. La colonne est
-- générée ; si cette instruction passe, la bascule 3/6 est dans le code.
UPDATE bail SET date_opposition_reconduction = DATE '2030-01-05' WHERE bail_id = '33333333-3333-3333-3333-333333333333';
```

**Q1 — La date de restitution du dépôt ne se tape pas.** Même mécanisme, et la branche des 21 jours y est avec le reste.

```sql
-- forge:ddl-refuse
-- Écrire la date de restitution à la main.
UPDATE bail SET date_echeance_restitution = DATE '2030-01-05' WHERE bail_id = '33333333-3333-3333-3333-333333333333';
```

**Q1 — Le 6e jour ne se tape pas.** Colonne générée sur `encaissement`. C'est le cas le plus important : « en retard » n'existe qu'à partir de cette date, donc une date qu'un code pourrait déplacer déplacerait une **frontière juridique**.

```sql
-- forge:ddl-refuse
-- Écrire la date de bascule en créance exigible à la main.
UPDATE encaissement SET date_creance_exigible = DATE '2030-01-06' WHERE encaissement_id = '99999999-9999-9999-9999-999999999999';
```

**Q1 — La date d'une échéance ne se tape pas.** Elle est une **copie dérivée** de la source — la colonne générée du bail, ou la ligne d'encaissement du mois — recalculée à chaque écriture. Le trigger distingue la dérivation (`bailly.derivation`) d'une écriture directe, et refuse la seconde : c'est le même motif que `encaissement.date_echeance`, et les deux sont la porte qui rend B12 exécutable plutôt que déclaratif.

```sql
-- forge:ddl-refuse
-- Changer la date d'une échéance à la main. La source la détermine ; la ligne
-- ne fait que la recopier, et une recopie que l'on peut écrire n'est plus
-- une dérivation. Sans cette porte, B12 est une intention.
UPDATE echeance SET date_echeance = DATE '2030-01-05'
 WHERE bail_id = '33333333-3333-3333-3333-333333333333' AND type = 'opposition_reconduction';
```

**Roadmap § 2.3 — Une échéance de marge ne se décide pas.** C'est le point de bascule entre bloquante et marge, écrit comme une contrainte : une marge est une information, pas une décision, donc elle n'a pas de bouton `Décider` **et pas de colonne qui l'accepterait**. Le `CHECK` refuse l'insertion d'une marge déjà décidée.

```sql
-- forge:ddl-refuse
-- Créer une échéance de marge avec une décision. Les deux échéances longues
-- (diagnostics, assurance) sont hors MVP, et le schéma ne sait pas les
-- traiter : si cette instruction passe, la différence entre « une alarme » et
-- « une marge » est redevenue une décision de code.
INSERT INTO echeance (echeance_id, bail_id, ecriture_id, type, famille, date_echeance, decidee_le)
VALUES ('22222222-0000-0000-0000-000000000000', '33333333-3333-3333-3333-333333333333',
        '55555555-5555-5555-5555-555555555555', 'opposition_reconduction', 'marge', DATE '2030-01-05', now());
```

**B13 — Une échéance ne remonte pas deux fois.** `remontee_le` a été écrit le 16 juin dans le bloc de pose ; cette instruction tente une seconde écriture. Le refus vient du trigger `trg_remontee_et_decision_uniques`, pas du `CHECK` de date, parce que la date proposée est **valide** : c'est bien la porte de l'unicité qui tombe. Si c'est le `CHECK` qui refusait, la porte serait inerte et le propriétaire verrait une échéance remonter tous les jours — le défaut exact que B13 interdit.

```sql
-- forge:ddl-refuse
-- Remonter une deuxième fois une échéance déjà remontée.
UPDATE echeance SET remontee_le = DATE '2027-06-20'
 WHERE bail_id = '33333333-3333-3333-3333-333333333333' AND type = 'restitution_depot';
```

**B9 — Le journal des décisions RGPD ne se réécrit pas.** Un jugement de travail qui a étéRanges dans un historique ne doit pas pouvoir devenir un fait de gestion par la réécriture d'une trace.

```sql
-- forge:ddl-refuse
-- Réécrire le journal des décisions RGPD.
UPDATE evenement_rgpd SET action = 'effacer' WHERE evenement_id = 'cccccccc-cccc-cccc-cccc-cccccccccccc';
```

**B16 — Une régularisation des charges n'est pas une somme due.** La frontière du MVP est dans une contrainte, pas dans un formulaire. `regularisation_charges` est un nom qui **n'existe pas** dans l'énumération : le refuser, c'est refuser précisément la chose que la roadmap § 2.2 sort du périmètre.

```sql
-- forge:ddl-refuse
-- Enregistrer une régularisation des charges comme somme due. B16 et X2 : le
-- produit n'enregistre que le loyer et les provisions. Si cette instruction
-- passe, la frontière est dans un `if` d'écran et elle bougera avec lui.
INSERT INTO somme_due (somme_due_id, encaissement_id, ecriture_id, nature, montant_centimes)
VALUES ('33333333-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '99999999-9999-9999-9999-999999999999',
        '55555555-5555-5555-5555-555555555555', 'regularisation_charges', 10000);
```

**B14 — `qui_doit_agir` ne peut pas être une valeur inventée.** Garde **G15**, par la contrainte d'énumération.

```sql
-- forge:ddl-refuse
-- Enregistrer une demande dont personne ne doit agir.
INSERT INTO demande (demande_id, bail_id, ecriture_id, qui_doit_agir, intitule, objet, recue_le)
VALUES ('44444444-dddd-dddd-dddd-dddddddddddd', '33333333-3333-3333-3333-333333333333',
        '55555555-5555-5555-5555-555555555555', 'un_tiers', 'Devis', 'Courges 3e', now());
```

**B14 — `qui_doit_agir` ne peut pas être absent.** Garde **G16**, par `NOT NULL`. Les deux gardes sont déclarées parce que ce sont deux défauts différents : une valeur fausse et une valeur manquante. Un écran qui envoie `null` et un écran qui envoie un tiers sont deux bugs, et une seule contrainte n'en couvre qu'un.

```sql
-- forge:ddl-refuse
-- Enregistrer une demande sans dire qui doit agir. Sans cette colonne
-- obligatoire, la moitié de la liste est untraitable (B14).
INSERT INTO demande (demande_id, bail_id, ecriture_id, intitule, objet, recue_le)
VALUES ('55555555-dddd-dddd-dddd-dddddddddddd', '33333333-3333-3333-3333-333333333333',
        '55555555-5555-5555-5555-555555555555', 'Devis', 'Courges 3e', now());
```

**B2 — Il n'y a pas de booléen de synchronisation.** Garde **G17**. C'est une porte **par absence**, et c'est la démonstration exécutée de la réponse à « qu'est-ce qui, en base, distingue les écritures en attente des écritures parties ? » : rien ne porte un booléen. L'état se lit dans `ecriture.confirme_le`, et nulle part ailleurs. Si cette instruction passait — si une colonne `synchronise` existait — l'écran et la base pourraient dire deux choses différentes, et c'est le mensonge que tout le produit promet d'éviter.

```sql
-- forge:ddl-refuse
-- Porter l'état de synchronisation sur la ligne métier. La colonne n'existe
-- pas : l'état d'une écriture est l'état de son écriture, et il n'y en a qu'un.
UPDATE fait_constate SET synchronise = true WHERE fait_constate_id = '66666666-6666-6666-6666-666666666666';
```

**B7 — Il n'y a pas de colonne de classe.** Garde **G18**. Deux tables, pas une table à deux classes. C'est la forme exécutée du choix qui porte B7 et B8 : la classe n'est pas une propriété d'une ligne, c'est **le choix de la table**. Il n'y a donc pas de chemin de l'appréciation vers le constaté, parce qu'aucun champ ne peut porter ce chemin.

```sql
-- forge:ddl-refuse
-- Reclasser un fait constaté en appréciation. La colonne n'existe pas : les
-- deux destinations d'export sont deux tables, et rien ne les réunit.
UPDATE fait_constate SET classe = 'apprecie' WHERE fait_constate_id = '66666666-6666-6666-6666-666666666666';
```

#### 4.3.5 Ce que ces dix-huit gardes ne prouvent pas

Écrit pour que la liste ne soit pas lue comme un certificat.

- **Elles ne prouvent pas qu'une écriture non partie reste lisible et modifiable** (B4). C'est une propriété du magasin local, testée par une propriété fast-check sur la base SQLite, pas par PostgreSQL : le trigger `trg_fait_constate_gele` **laisse passer** l'écriture quand l'écriture n'est pas confirmée, et c'est ce « laisser passer » qu'il faudrait prouver par l'absence d'erreur — chose qu'une garde ne sait pas faire.
- **Elles ne prouvent pas que l'application ne ment pas** sur l'accusé. Une porte SQL ne peut pas vérifier qu'un appareil a reçu une réponse réseau. Ce qui le vérifie : `confirmeLe` n'est écrit que par `appliquerAccuse()` (règle de lint), et le test E2E « mode avion » de la roadmap § 2.5.
- **Elles ne prouvent pas que le garde-fou classe les échéances correctement.** C'est `packages/echeances/`, une fonction pure, testée par fast-check avec une horloge injectée.
- **Elles ne prouvent rien sur Q2.** Voir § 4.5.

### 4.4 Le dialecte local : ce que SQLite sait faire, et ce qu'il ne sait pas faire

Le magasin local applique **les mêmes contraintes** que le serveur, pour une raison qui n'est pas la parité pour la parité : si la base locale accepte une écriture que le serveur refusera, le propriétaire aura saisi un fait qui ne sera jamais confirmé, et il ne saura pas pourquoi. C'est une perte de données silencieuse, donc c'est le pire défaut possible dans ce produit.

| Contrainte | SQLite local | PostgreSQL serveur | Raison de l'écart |
|---|---|---|---|
| `NOT NULL`, `CHECK`, `UNIQUE`, clés étrangères | **oui**, à l'identique | oui | Aucune. Les deux dialectes exécutent la même liste. |
| Colonnes générées | **oui**, `GENERATED ALWAYS` | oui | Aucune. La même expression protège les deux côtés. |
| `date_echeance` dérivée par trigger | **oui**, `BEFORE INSERT OR UPDATE` | oui | Aucune. La porte G10 est dans les deux. |
| Trigger de contrainte **différé** | **non** | oui | SQLite n'a pas de trigger de contrainte. La porte G1 est **serveur seul** — et c'est cohérent : l'accusé est un fait du réseau, donc seul le serveur peut l'exiger. |
| Indicateur de dérivation (`set_config`) | **oui**, `set_config` n'existe pas | oui | SQLite utilise un `PRAGMA user_version` maintenu par la fonction de dérivation locale. Deux lignes de code, une seule intention. |
| `bigint` (centimes) | `integer` (64 bits) | `bigint` | Une adaptation de type, pas de sémantique. Le schéma Zod du § 4 expose `entier_sure` dans les deux cas. |
| `timestamptz` | `text` ISO 8601 avec décalage | `timestamptz` | SQLite ne connaît pas les fuseaux. Le texte ISO **avec** décalage est le seul format qui survive à un changement de fuseau, donc il est stocké ainsi. |

**Ce qui n'est pas dupliqué, et pourquoi c'est correct.** La dérivation de `date_opposition_reconduction` et de `date_echeance_restitution` est une **expression générée**, donc elle vit dans le DDL de chaque côté. Les deux DDL sont **générés depuis la même source** (une migration, deux dialectes), et `migrations/` contient le seul `0001_initial.sql` dont un générateur produit les deux formes. Un seul endroit à corriger quand la règle du meublé change.

### 4.5 Ce qui tient sans Q2, et ce qui ne tient pas

**Q2 — « La durée légale de conservation, par catégorie de pièce » — est sans réponse.** La PRD le dit : « on ne sait pas jusqu'à quand conserver, donc la date de fin écrite n'a pas de contenu ». B9 n'est donc **pas applicable**, et cette section sépare ce qui tient de ce qui ne tient pas. Elle ne comble rien.

**Ce qui tient, et qui est déjà posé dans le § 4 :**

| Élément | Pourquoi il tient sans Q2 |
|---|---|
| **Le bouton « tout effacer » n'existe pas** | Il n'existe aucun `DELETE` sur `bail`, `fait_constate`, `piece_jointe` confirmée, `echeance` décidée, `evenement_rgpd` ni `locataire` : ce sont les portes **G5**, **G3**, **G4**, **G12**, **G13** et les contraintes d'anonymisation. Il n'y a pas de bouton parce qu'il n'y a pas de requête. C'est **B18**, et B18 ne dépend d'aucune date. |
| **L'effacement d'une donnée personnelle** | Il porte sur une pièce de `qualification = 'donnee_personnelle'`, au départ du locataire. Le déclencheur est `bail.date_sortie_effective`, qui est une **date réelle**. |
| **L'anonymisation** | Elle porte sur `locataire` et sur les pièces non légales. Le même déclencheur. |
| **L'impossibilité d'anonymiser une pièce légale** | Un bail est un document conservé **quelle que soit** la durée : c'est une question de nature de pièce, pas de délai. Porte **G6**. |
| **L'export du dossier, lisible, daté, sans appréciation** | B10, B11, C7, C11. Aucun des quatre ne dépend d'une durée de conservation. |
| **Le refus d'inventer une date** | `conserve_jusqua` est `NULL`, sans défaut. Le rendu est `ChampDate` en état `inconnue` : un tiret et la phrase « tant que cette date n'est pas écrite, Bailly ne peut pas dire quand ce document pourra être effacé ». Le `BandeauAlerte` correspondant est en variante `persistant`. |

**Ce qui ne tient pas, et qui est nommé plutôt que contourné :**

| Élément | Ce qui manque | Conséquence écrite |
|---|---|---|
| **Le troisième état de B9** — conserver jusqu'à une date de fin écrite | La durée par catégorie | `conserve_jusqua` reste `NULL`. **Aucune fonction de « pièces qui peuvent être effacées » n'existe**, et il n'en est pas de prévue tant que Q2 n'est pas tranchée. |
| **La démonstration de `donnees-personnelles`** | Un troisième état à démontrer | La slice est démontrable sur **deux** états et sur l'export. Sa checklist portera une case « troisième état : non démontrable, Q2 ouverte », et non un coche. |
| **La purge automatique** | Une date de fin | Il n'y a **aucun** job de purge, et il n'y en aura pas tant que la date n'est pas une donnée. Une purge sans date est un effacement de masse, c'est-à-dire le bouton interdit. |
| **La mention dans l'export** | Une durée | L'export écrit `— date de fin à confirmer` sur la ligne concernée, et rien d'autre. C'est `C11` appliqué à une donnée absente : on dore la production, on ne dore pas la date. |

**Ce qu'il ne faut pas faire en attendant.** Trois contournements sont refusés par écrit. **Un `NULL` traité comme « pas de limite »** : c'est l'inverse du sens, et il rendrait la donnée effaçable au moment précis où on ignore si elle l'est. **Une durée par défaut dans le code** — 3 ans, 5 ans, 10 ans : ce serait inventer la réponse d'un juriste, et la roadmap § 7 dit que le conseil juridique n'a pas été sollicité. **Un `CHECK` qui refuse `conserve_jusqua IS NULL`** : cela rendrait le schéma inutilisable tant que Q2 est ouverte, et le produit perdrait la trace de ses pièces. Le champ est donc nullable, et c'est le **seul** `NULL` de ce document qui n'est pas une absence de données mais une **absence de réponse**.

### 4.6 Les cinq échéances, et le point de bascule entre bloquante et marge

Les cinq échéances sont tranchées — Q1 est close, la roadmap § 2.3 les nomme et le commanditaire les a classées lui-même. Ce document ne les redécouvre pas.

| # | Échéance | Type en base | Famille | Origine de la date | Où elle est décidée |
|---|---|---|---|---|---|
| 1 | Opposition à reconduction tacite | `opposition_reconduction` | `bloquante` | `bail.date_fin_terme` **− 3 mois** ou **− 6 mois** | **Colonne générée**,expression conditionnée par `bail.regime` |
| 2 | Bascule en créance exigible | `creance_exigible` | `bloquante` | `encaissement.date_creance_exigible` = `date_echeance + 1` | **Colonne générée**, `date_echeance` dérivée de `bail.jour_echeance_loyere` |
| 3 | Restitution du dépôt de garantie | `restitution_depot` | `bloquante` | `bail.date_sortie_effective` **+ 21** ou **+ 1 mois** | **Colonne générée**, branche choisie par `bail.restitution_depot_etat` |
| 4 | Validité des diagnostics (DPE, gaz, amiante) | **absent au MVP** | `marge` | `diagnostic.date_validite` — **table absente** | **V1.** Aucune contrainte n'exige son existence, et le `CHECK` `famille_connue` accepte déjà `marge`. |
| 5 | Assurance propriétaire (PNO) | **absent au MVP** | `marge` | `police.date_echeance` — **table absente** | **V1.** Idem. |

**Le point de bascule, en une phrase.** Il n'y en a pas un, il y en a **trois colonnes**, et chacune est une **donnée du bail** : `regime` fait basculer 3 mois en 6, `jour_echeance_loyere` place le 6e jour, `restitution_depot_etat` fait basculer 21 jours en 1 mois. Aucune n'est un `if`. Un `if` dans un écran mettrait la bascule dans le code, où elle changerait avec lui, et où la correction d'une date de bail ne la propagerait pas aux 14 lignes déjà saisies.

**Et le point de bascule entre bloquante et marge est lui aussi une colonne** : `echeance.famille`, avec un `CHECK` qui interdit à une marge de porter une décision (garde **G11**). C'est la route que la roadmap § 2.3 demande, sans que le code ait à connaître la différence. Une échéance de marge ne peut rendre aucun bouton, **parce qu'elle ne peut pas être décidée** — et non parce qu'un écran choisit de ne pas afficher de bouton.

**Ce qui n'est pas produit au MVP, et qui ne doit pas l'être.** Aucune ligne de `famille = 'marge'` n'est créée. Le `CHECK` `marge_nest_jamais_decidee` existe sans producteur de marge, et c'est délibéré : il décrit la contrainte que la V1 devra respecter, et il ne coûte rien. Ce qui serait un défaut, c'est l'inverse — une contrainte `NOT NULL` ou un trigger qui exige une ligne de marge et que rien ne produit. Le § 4.3.3 l'affirme par un comptage : **zéro** ligne de marge après la pose.

### 4.7 Les sommes, et la frontière de B16

**B16 : aucune quantité n'est calculée par l'application.** Elle enregistre ce qui est dû et ce qui a été reçu ; le total est une somme affichée, pas un calcul métier.

| Ce qui est enregistré | Où | Qui l'écrit |
|---|---|---|
| Loyer mensuel | `bail.montant_loyer_centimes` | Le propriétaire, à la création du bail |
| Dépôt de garantie | `bail.depot_garantie_centimes` | Le propriétaire |
| Ce qui est dû pour un mois | `somme_due.montant_centimes`, `nature ∈ {loyer, provisions_sur_charges, arre, acompte}` | Le propriétaire |
| Ce qui a été reçu | `somme_recue.montant_centimes` + `recue_le` | Le propriétaire |
| **Le total affiché de l'encaissement du mois** | `SUM(somme_due.montant_centimes)` | **Affiché, jamais stocké** |

**Ce que l'application ne fait pas, nommément.** Aucune soustraction. Aucune conversion de devise (C10). Aucune division par un nombre de mois. Aucune proratisation. Aucune remise. Aucun indice (X3). Aucune déduction de charges (X2). Aucune somme « restant dû » stockée : elle se lit, elle ne se conserve pas, parce qu'une somme stockée et recalculée finit par diverger de ses lignes, et qu'un produit qui promet de ne pas mentir ne peut pas garder deux vérités.

**Les trois sommes que l'écran affiche, et d'où elles viennent.** « Attendu » : la somme des `somme_due` de la période, écrite par le propriétaire. « Reçu » : la somme des `somme_recue` de la période. « Écart » (E9) : **une ligne de `fait_constate`**, saisie par le propriétaire, jamais une différence calculée. C'est la forme que prend E9 quand on refuse le rapprochement automatique.

---

## 5. Contrats API

### 5.1 Le contrat commun

Un seul secret, une seule écriture par requête, un accusé par réponse. Ces trois lignes valent pour les dix-huit endpoints et ne sont pas répétées quinze fois.

**Auth** — `Authorization: Bearer <secret>`. Un seul secret, comparaison en temps constant, et **aucun** jeton de session, aucun refresh, aucun « connecté en tant que ». C3 interdit les utilisateurs multiples, donc il n'y a rien à.refresh. La réinitialisation (R9) passe par l'hébergeur, pas par un e-mail.

**Idempotence** — `Idempotency-Key: <ecriture_id>`, où `ecriture_id` est l'`uuid` généré par l'appareil. C'est la clé de la reprise automatique : si l'appareil a écrit, est parti dans un sous-sol, et n'a jamais su si la requête est arrivée, il la renvoie **telle quelle**, et le serveur répond `200` au lieu de `201` s'il l'a déjà traitée. Sans cette clé, une reprise double l'encodage d'un fait ou d'un paiement — le pire défaut possible sur un montant.

**Réponse d'écriture** — aucune autre forme n'existe. Un `2xx` **est** un accusé.

```json
{ "ecriture_id": "55555555-…", "confirme_le": "2027-03-05T18:04:29+01:00", "empreinte": "sha256:9f2b…" }
```

**Codes d'erreur communs à tous les endpoints** — ils sont normatifs. Un endpoint qui ne les liste pas tous ne les a pas implémentés.

| Code | Condition | Message | Où c'est traité |
|---|---|---|---|
| `400` | Corps illisible, ou `Idempotency-Key` absente ou mal formée | `"Corps illisible"` | `erreurs` → `EtatChamp` `erreur` |
| `401` | Secret absent, faux, ou appareil reverrouillé | `"Secret requis"` | `secret` → écran `Le secret` |
| `403` | **Jamais.** C3 : il n'y a qu'un rôle. | — | Un `403` dans les journaux est un bug. |
| `404` | Ressource inexistante, ou **elle existe et n'est pas à toi** — même réponse dans les deux cas | `"Ressource introuvable"` | `EtatVide` `erreur` |
| `409` | Conflit d'état : échéance déjà décidée, remontée déjà faite, écriture en attente sur la même ligne | `"Conflit d'état"` | `EtatBlocage` — le conflit **se montre**, il ne se réessaie pas en boucle |
| `412` | Empreinte différente pour un `ecriture_id` connu | `"L'écriture existe déjà avec un autre contenu"` | `BandeauAlerte` `impossible` |
| `422` | La base a refusé : `CHECK`, `NOT NULL`, clé étrangère, ou colonne générée écrite | Le **message de PostgreSQL**, rendu tel quel | `EtatMontant` `refuse`, `EtatDate` `erreur` |
| `429` | Limite d'appels dépassée | `"Trop de requêtes"` | `BandeauAlerte` `information`, **jamais** un dialogue |
| `503` | **B15 : l'action exige le réseau et il n'y en a pas** | `"Cette action part en ligne"` | `Bouton` variante `impossible` + `BandeauAlerte` `de_securite` |
| `500` | Erreur serveur | `"Erreur interne"` | `EtatVide` `erreur` |

**Le `422` est le code qui porte le produit.** C'est lui qui rend une contrainte du § 4.3 **visible** au téléphone : si le propriétaire écrit une régularisation des charges, la base refuse, le serveur renvoie `422` avec le nom de la contrainte, et l'écran rend `ChampMontant` en variante `refuse` avec la phrase de `design-system.md` § 2.0.3 appliquée au cas. La contrainte n'est pas une défense silencieuse : elle est une **réponse**.

**Rate limit** — 60 requêtes par minute et par secret. Ce n'est pas une protection contre un attaquant : c'est un garde-fou contre une **reprise automatique-loop** après une longue coupure réseau. Un appareil resté hors ligne un mois et qui se reconnecte aurait sinon 400 requêtes à rattraper ; il les envoie par lots de 20, avec une pause entre les lots, et le compteur du bandeau descend pendant ce temps. C'est le seul comportement de reprise que l'utilisateur voit, et il est écrit ici parce qu'il est visible.

### 5.2 Les endpoints

| # | Méthode | Path | Auth | Idempotence | Erreurs propres |
|---|---|---|---|---|---|
| 1 | `GET` | `/api/v1/etat` | oui | — | — |
| 2 | `POST` | `/api/v1/bails` | oui | oui | `422` sur un terme antérieur au début |
| 3 | `GET` | `/api/v1/bails` | oui | — | — |
| 4 | `GET` | `/api/v1/bails/:bailId` | oui | — | — |
| 5 | `PATCH` | `/api/v1/bails/:bailId` | oui | oui | `422` **nominativement** si le corps porte une colonne générée |
| 6 | `POST` | `/api/v1/bails/:bailId/fait-constate` | oui | oui | `422` si le texte est vide |
| 7 | `GET` | `/api/v1/bails/:bailId/fait-constate` | oui | — | — |
| 8 | `POST` | `/api/v1/bails/:bailId/appreciations` | oui | oui | `422` si le texte est vide |
| 9 | `GET` | `/api/v1/bails/:bailId/appreciations` | oui | — | — |
| 10 | `POST` | `/api/v1/bails/:bailId/pieces-jointes` | oui | oui, par `empreinte_sha256` | `413` si la taille dépasse la limite ; `503` si l'objet n'est pas encore écrit |
| 11 | `GET` | `/api/v1/bails/:bailId/pieces-jointes/:id/contenu` | oui | — | `404` si `objet_cle` est `NULL` |
| 12 | `POST` | `/api/v1/bails/:bailId/encaissements` | oui | oui | `409` si la période existe déjà |
| 13 | `GET` | `/api/v1/bails/:bailId/encaissements/:periode` | oui | — | — |
| 14 | `POST` | `/api/v1/bails/:bailId/encaissements/:periode/recu` | oui | oui | — |
| 15 | `POST` | `/api/v1/bails/:bailId/encaissements/:periode/relances` | oui | oui | **`503` toujours hors ligne** (B15) ; `409` si la créance n'est pas exigible |
| 16 | `GET` | `/api/v1/bails/:bailId/demandes` | oui | — | — |
| 17 | `POST` | `/api/v1/bails/:bailId/demandes` | oui | oui | `422` sur `qui_doit_agir` absent ou inconnu (B14) |
| 18 | `POST` | `/api/v1/bails/:bailId/echeances/:echeanceId/decisions` | oui | oui | `409` si déjà décidée ; `422` si la famille est `marge` |
| 19 | `POST` | `/api/v1/bails/:bailId/echeances/:echeanceId/remontee` | oui | oui | `409` si déjà remontée (B13) |
| 20 | `GET` | `/api/v1/dossiers/:locataireId/export` | oui | — | — |
| 21 | `GET` | `/api/v1/reprise` | oui | — | — |

**Trois absences, délibérées.**

- **Aucun `DELETE`.** Pas sur un bail, pas sur un dossier, pas sur un fait. Le § 4.2 a supprimé les cascades et le § 4.3 pose les portes : il n'existe pas de route, donc il n'existe pas de bouton. C'est B18 rendu au niveau du contrat.
- **Aucun `GET /api/v1/saisies`.** Il n'y a pas de table `saisie`. Il y a deux endpoints de lecture, et chacun ne rend que sa famille. C'est B7 au niveau de l'API : un export « de tout le dossier » ne peut pas réunit les deux, parce que la route qui le ferait n'existe pas.
- **Aucun `PATCH /api/v1/bails/:id/echeances`.** Les échéances se modifient par `decisions` (endpoint 18) et par la correction du bail (endpoint 5, qui **redérivera**). Une route directe d'écriture d'échéance serait une porte que le § 4.3 refuse de laisser ouverte.

### 5.3 Les contrats qui portent une décision

Les six endpoints ci-dessous sont les seuls dont la forme ne va pas de soi. Les douze autres sont du CRUD vérifié par le contrat commun du § 5.1.

#### 5.3.1 `POST /api/v1/bails/:bailId/fait-constate` et `POST /api/v1/bails/:bailId/appreciations`

**Deux endpoints, pas un.** C'est la forme que prend B8 : « le défaut ne peut pas être « ce que j'ai lu quelque part » ». Si c'était un seul endpoint avec un champ `classe`, un client pourrait omettre le champ, et l'écran serait la seule chose qui demande la classe. **Deux endpoints rendent l'omission impossible** : le client choisit la route, donc il a choisi la classe, et le design system n'a plus qu'à poser la question avant de choisir la route.

- **Méthode** : `POST` · **Path** : `/api/v1/bails/:bailId/fait-constate` · **Auth** : bearer · **Idempotence** : oui

**Requête** :

```json
{
  "ecriture_id": "66666666-6666-6666-6666-666666666666",
  "sur_le_leure": "2027-03-05",
  "texte": "La chasse d'eau fuyait."
}
```

| Paramètre | Type | Requis | Description |
|---|---|---|---|
| `ecriture_id` | `uuid` | oui | Généré par l'appareil, **avant** toute tentative réseau. Clé d'idempotence. |
| `sur_le_leure` | `date` ISO | oui | Le jour du fait. Ni `heure`, ni fuseau : un fait est un jour, l'heure est celle de l'appareil et va dans `recue_le`. |
| `texte` | `text` | oui | 1 à 2000 caractères, non vide après `trim`. |

**Réponse (succès)** : `201` (nouveau) ou `200` (déjà reçu, même empreinte) — le corps est celui du § 5.1.

**Codes d'erreur propres** :

| Code | Condition | Message |
|---|---|---|
| `422` | `texte` vide ou composé d'espaces | `"Le constat ne peut pas être vide."` |
| `412` | `ecriture_id` connu avec une empreinte différente | `"L'écriture existe déjà avec un autre contenu"` |

**Ce que l'endpoint ne fait pas, et pourquoi c'est important.** Il ne déduit pas la date du jour, il ne complète pas le prénom, il ne vérifie pas que le locataire « existe ailleurs ». B17 : **aucune donnée n'est pré-remplie depuis une source extérieure**. Un fait sans date est refusé, pas corrigé.

#### 5.3.2 `PATCH /api/v1/bails/:bailId`

Le point où les colonnes générées deviennent une **réponse** plutôt qu'un `422` opaque. Le corps ne contient que des colonnes **sources** ; toute colonne générée renvoie `422` en la nommant, et le message dit pourquoi.

```json
{ "date_fin_terme": "2028-03-31" }
```

```json
{
  "erreur": "colonnes_generees",
  "re refusees": ["date_opposition_reconduction"],
  "message": "Ces dates sont tirées du bail. Corrige la date du terme, elles se corrigent avec."
}
```

**Conséquence à écrire ici, parce qu'elle est un effet de bord voulu.** Corriger `date_fin_terme` **redérivera** l'échéance d'opposition **si et seulement si** elle n'est pas encore décidée (`fn_deriver` porte un `WHERE decidee_le IS NULL`). Une échéance déjà décisée ne bouge pas, et la correction **échoue** avec un `409` si elle essaierait de la bouger. C'est la protection de R5 : on corrige la source, pas les conséquences, et une décision déjà prise sur une date reste un acte.

#### 5.3.3 `POST /api/v1/bails/:bailId/encaissements/:periode/relances`

**La seule action que l'application refuse hors ligne**, et c'est écrit dans le contrat plutôt que dans l'écran.

- **Rate limit** : 1 par période et par jour. Une relance par jour est déjà au-delà de ce que le droit et le bruit supportent ; au-delà, `429`.

**Réponse (succès)** : `201`, avec la preuve d'envoi — un fait **serveur**, daté, non reproductible par le client.

```json
{
  "preuve_envoi": {
    "relance_id": "f0f0f0f0-0000-0000-0000-000000000000",
    "envoyee_le": "2027-03-11T08:12:44+01:00",
    "canal": "sms",
    "reference": "BL-001-2027-03-11"
  }
}
```

**Codes d'erreur propres** :

| Code | Condition | Message | Rendu |
|---|---|---|---|
| `503` | Hors ligne | `"La preuve d'envoi se fait en ligne. Elle partira demain matin."` | `Bouton` `impossible` + `BandeauAlerte` `de_securite` |
| `409` | `date_creance_exigible` non atteinte | `"La créance n'est pas exigible avant le 06/03/2027."` | Le `422` devient un `409` ici, et le message **contient la date** |
| `429` | Deuxième relance le même jour | `"Une relance par jour suffit."` | `BandeauAlerte` `information` |

**Pourquoi `canal` est un champ du serveur.** La preuve d'envoi est un fait du serveur : Bailly ne peut pas prouver qu'un SMS est arrivé, seulement qu'il l'a **expédié**, à quel instant, et sous quelle référence. C'est écrit ainsi pour ne pas promettre plus que la preuve. La relance elle-même n'a **pas d'état** : la roadmap § 2.2 le dit, et le contrat le respecte — il n'y a pas de `statut_relance`, seulement l'écriture de nature `relance` et sa preuve.

#### 5.3.4 `POST /api/v1/bails/:bailId/echeances/:echeanceId/decisions`

- **Requête** : `{"ecriture_id": "…", "accord": false}`. **`accord` n'a pas de défaut** : design system § 3.2 distingue `faite_tard` de `faite_avec_accord`, et un `false` implicite confondrait les deux.

```json
{ "echeance_id": "…", "etat": "faite_tard", "decidee_le": "2027-01-09T10:00:00+01:00", "remontee_le": "2026-12-31T08:00:00+01:00" }
```

**Codes d'erreur propres** :

| Code | Condition | Message |
|---|---|---|
| `409` | `decidee_le` déjà renseignée | `"Cette échéance a été décidée le 09/01/2027."` |
| `422` | `famille = 'marge'` | `"Une échéance longue ne se décide pas. Elle s'affiche, elle ne bloque rien."` |

Le `422` sur une marge est le **point de bascule entre bloquante et marge, rendu visible** : il n'existe aucun chemin API pour décider d'une marge, donc aucun écran ne peut proposer le bouton.

#### 5.3.5 `GET /api/v1/dossiers/:locataireId/export`

B10, B11, C7, C11. Le format est **Markdown**, jamais un format propriétaire, jamais du JSON.

```http
GET /api/v1/dossiers/11111111-1111-1111-1111-111111111111/export?format=md
```

```json
{
  "format": "md",
  "produit_le": "2027-06-12T19:12:00+02:00",
  "au_nom_de": "Colette Ferrand",
  "dossier": "11111111-1111-1111-1111-111111111111",
  "bail": { "reference": "BL-001", "adresse": "Courges 3e", "regime": "vide",
            "date_debut": "2024-10-01", "date_fin_terme": "2027-03-31",
            "opposition_a_reconduction": "2026-12-31",
            "calcul": "terme 31/03/2027 − 3 mois" },
  "constats": [
    { "le": "2027-03-05", "texte": "La chasse d'eau fuyait.", "pieces": 1 }
  ],
  "appreciations": "non exportées — voir B7",
  "pieces_du_dossier": [
    { "nom": "Bail signé du 01/10/2024", "qualification": "obligation_legale",
      "conserve_jusqua": null, "mention": "date de fin à confirmer" }
  ]
}
```

**Trois propriétés du document produit, vérifiables à l'œil :**

- **Il porte la date de sa production** (C11), en tête, et pas dans un pied de page.
- **Il ne contient aucune appréciation.** Le champ `appreciations` dit pourquoi c'est vide. Ce n'est pas un oubli de génération : c'est une **mention explicite**, parce qu'un dossier sans explication fait croire à une absence de données.
- **Il montre le calcul de chaque échéance** (`"terme 31/03/2027 − 3 mois"`). Afficher le calcul est ce qui rend B12 vérifiable par un tiers, et c'est aussi ce qui rend R5 diagnosticable en cas de contestation.
- **`conserve_jusqua: null` sort avec la mention `date de fin à confirmer`**, jamais avec une date inventée (§ 4.5).

#### 5.3.6 `GET /api/v1/reprise`

B11, C7, N6, N7. **Toute** la donnée, dans un format lisible sans Bailly. `format=md` rend un Markdown ; `format=csv` rend une archive ZIP contenant un fichier par entité **et** un `_index.md` qui explique chaque colonne. Le `_index.md` n'est pas un confort : sans lui, une reprise dans un tableur est une devinette.

**N6 — moins d'une minute pour 14 baux** est une exigence de performance, pas une promesse. La mesure se fait sur le jeu de pose du § 4.3.3, et le critère est écrit dans le test : `expect( duree ).toBeLessThan(60_000)`.

**C1, Q3, N7.** Le palier d'hébergement est **sans réponse**, donc rien ici ne nomme un fournisseur, et `objet_cle` est une clé opaque servie par Bailly. Le jour où Q3 est tranchée, aucun schéma ne change : c'est la raison d'être de `objet_cle` plutôt que d'une URL.

### 5.4 `GET /api/v1/etat` — le point qui rend N1 mesurable

N1 : « latence cible de l'indicateur de synchronisation < 1 s quand en ligne ». Cet endpoint est le **cœur** de l'écriture, pas un écran d'accueil :

- **Méthode** : `POST` (il écrit, donc il est compté dans la latence) · **Path** : `/api/v1/etat` · **Idempotence** : oui

**Requête** — un lot d'écritures, dans l'ordre, chacune avec son `ecriture_id` :

```json
{ "ecritures": [ { "ecriture_id": "…", "nature": "fait_constate", "bail_id": "…", "corps": { } } ] }
```

**Réponse** : un accusé par écriture, **individuellement**. C'est le point important : un lot ne succeed pas ou n'échoue pas en bloc. Un lot de 20 dont 3 sont refusées renvoie 19 accusés et 3 erreurs nommées, et le bandeau compte **3**, pas 20.

---

## 6. Graphe de dépendances

### 6.1 Ordre d'implémentation topologique

Le graphe se réduit à **six** vagues, et le plan en retient six : aucune ne sert à garder une personne pour elle, donc il n'y a rien à justifier devant le contrôle d'écart. La forme est en trois paliers — les fondations libres, puis les fondations qui en dépendent, puis les slices — et c'est la structure du projet, pas un découpage de confort.

```
Vague 0 — fondations sans dépendance (5, parallélisables) :
  ├── horloge          l'heure injectable, et le canal de test absent du bundle de livraison
  ├── magasin-local    SQLite chiffré, journal d'écritures, migrations
  ├── secret           un secret, pas une session
  ├── erreurs          un échec technique → un état du design system
  └── design-system    les 29 composants, le pont de jetons, les 30 unions

Vague 1 — fondations dépendantes, et la property (3, parallélisables) :
  ├── client-api       ← secret
  ├── coquille         ← design-system, erreurs, magasin-local
  └── garde-fou        ← horloge, magasin-local, design-system, erreurs

Vague 2 — le test du produit :
  └── socle-synchronisation   ← les 7 fondations

Vague 3 — la source des dates :
  └── dossier-bail     ← les 7 fondations, socle-synchronisation, garde-fou

Vague 4 — les gestes du mois et du quotidien (4, parallélisables) :
  ├── saisie                 ← les 7 fondations, socle-synchronisation, dossier-bail
  ├── encaissement           ← les 7 fondations, socle-synchronisation, dossier-bail
  ├── demandes               ← les 7 fondations, socle-synchronisation, dossier-bail
  └── donnees-personnelles   ← horloge, magasin-local, client-api, secret,
                                      design-system, socle-synchronisation, dossier-bail

Vague 5 — la preuve la plus fragile :
  └── piece-jointe     ← les 7 fondations, socle-synchronisation, dossier-bail, saisie
```

**Le seul écart à la lecture de la roadmap, et il est volontaire.** `garde-fou` est en position 8 dans la roadmap et en vague 1 ici. La roadmap exprime l'ordre de **validation** — on valide le garde-fou quand les trois échéances bloquantes existent, donc après `dossier-bail` et `encaissement` — et le graphe exprime l'ordre de **construction**. Construire `garde-fou` en première vague n'empêche pas de le valider en dernier ; construire `dossier-bail` avant `garde-fou` l'empêcherait, parce que l'écran du bail rend le drapeau et le bouton `Décider` et qu'il faudrait y revenir. C'est le seul désaccord entre la roadmap et ce document, et il est écrit (ADR-9) plutôt que résolu en silence.

**Pourquoi `socle-synchronisation` est seule en vague 2, et ce que cela coûte.** Elle dépend des sept fondations, donc elle attend la dernière d'entre elles. C'est le prix de la règle qui domine tout le produit : B1 s'applique à toutes les autres écritures, donc elle ne peut pas être écrite avant d'avoir un magasin local, un client HTTP et une horloge. Le coût est une vague à une seule personne ; le gain est qu'aucune des sept slices suivantes n'est construite sur une reprise automatique non démontrée.

### 6.2 Parallélisme possible

| Vague | Slices et fondations parallélisables | Pourquoi elles ne se gênent pas |
|---|---|---|
| 0 | `horloge`, `magasin-local`, `secret`, `erreurs`, `design-system` | Aucune ne dépend d'une autre. Elles partagent des contrats déjà écrits au § 2. |
| 1 | `client-api`, `coquille`, `garde-fou` | `client-api` parle au serveur, `coquille` compose l'écran, `garde-fou` calcule un délai. **`garde-fou` ne dépend d'aucune slice métier** : il lit le contrat de données du § 4, ce qui est précisément ce qui permet de le lancer avant `dossier-bail`. |
| 2 | — | `socle-synchronisation` seule : elle attend les sept fondations. |
| 3 | — | `dossier-bail` seule : elle attend `garde-fou` pour le drapeau et le bouton `Décider`. |
| 4 | `saisie`, `encaissement`, `demandes`, `donnees-personnelles` | Quatre objets **disjoints** : un fait, une somme, une demande, un dossier exporté. Le seul point de contact est la vue `v_dossier_locataire`, en lecture seule. |
| 5 | — | `piece-jointe` dépend de `saisie` : une photo s'accroche à un constat, et rien d'autre. |

**Point de contention : `socle-synchronisation`.** Sept slices en dépendent, c'est le maximum du graphe, et c'est le signal que le rôle d'architecte doit lever. Il est levé dans la forme, pas dans le nom : ce qui est réellement partagé est extrait en trois fondations (`horloge`, `magasin-local`, `client-api`), et la slice n'est plus que le **démonstrateur** de ces trois. Si elle grossit au-delà de dix fichiers, c'est qu'elle a repris du code de fondation : il faut le remonter, pas l'agrandir.

**Vague 4, quatre slices en parallèle : le seul vrai risque du plan.** Elles sont disjointes en données, donc elles ne se cassent pas — mais elles se rejoignent sur `ecriture.nature` et sur la vue d'export. La mitigation est écrite : `piece-jointe` est **volontairement** en vague 5, pour que les trois qui écrivent du texte libre et des montants soient fusionnées avant que quelqu'un touche à une pièce jointe.

**Slices qui dépendent de trop d'autres** : `piece-jointe` en dépend de dix, et c'est la plus riche en dépendances comme la plus pauvre en surface. C'est le signal du rôle d'architecte : une slice qui dépend de presque tout est une slice dont la frontière est mal tracée. Ici la dépendance est **réelle** — une photo n'existe pas sans un fait constaté, et un constat n'existe pas sans un bail — donc elle est justifiée et écrite, et non réduite.

### 6.3 Cycles

**Aucun cycle de dépendances détecté.** Le cycle qui aurait été naturel — `dossier-bail` rend le drapeau du garde-fou, et le garde-fou lit les échéances du bail — est rompu par deux décisions distinctes :

1. `garde-fou` ne dépend d'aucune slice métier. Il lit le **contrat de données** du § 4 et la fondation `horloge`. Une table n'est pas une slice.
2. `coquille` ne connaît pas le garde-fou. Elle publie un **slot** ; l'écran qui possède le `PanneauBlocage` le rend. Une coquille qui importerait le sélecteur d'échéances serait le nœud du cycle.

Le contrôle qui l'établit :

```bash
node "$FORGE/scripts/dependency-check.js" check "Forge Labs/gestion-locative" --write
```

---

## 7. Décisions d'architecture (ADR)

| ID | Décision | Contexte | Options considérées | Choix | Justification | Conséquences |
|---|---|---|---|---|---|---|
| **ADR-1** | L'heure est **injectée à une frontière**, et l'implémentation de test est absente du bundle de livraison | La roadmap § 2.5 refuse qu'une slice soit finie quand elle marche une fois ; « en retard » n'existe qu'au 6e jour | (a) avancer la date du système ; (b) une constante de configuration ; (c) une dépendance injectée, présente seulement dans le bundle de test | **(c)** | (a) n'est pas reproductible, change aussi le serveur, le TLS et le système, et ne marche pas sur un téléphone ; (b) est un réglage du développeur, exactement ce que la roadmap refuse. (c) est **injectable en test unitaire** (un paramètre) et **pilotable en E2E** (un lien profond), et son absence du bundle est **vérifiable par un `grep`**. | Une règle de lint interdit `Date.now`, `new Date` et `Date.parse` hors `packages/horloge/`. Le serveur n'a **pas** d'horloge simulée et n'en a pas besoin : aucune de ses requêtes ne décide d'un délai. |
| **ADR-2** | L'état « parti ou pas parti » est **une colonne d'une seule table**, et aucune table métier n'en porte | B2, B1, et le critère de succès n°1 est un test de langage | (a) un booléen `synchronise` sur chaque table métier ; (b) un champ de texte libre ; (c) un journal d'écritures référencé par chaque ligne | **(c)** | (a) est ce que la question exclut : l'écran lit `fait.synchronise` et l'API écrit `ecriture.confirme_le`, donc les deux peuvent diverger. (b) laisse l'état dépendre d'un accord humain. (c) donne **un seul endroit** où l'état existe, et il est lisible hors ligne parce qu'il est local. | La garde **G17** l'essaie : `UPDATE fait_constate SET synchronise` est refusé, car la colonne n'existe pas. Coût : chaque table porte `ecriture_id`, et il faut une jointure pour lire l'état — c'est le prix, et il est bon. |
| **ADR-3** | Le **constaté** et l'**appréciation** sont deux tables, deux endpoints, deux vues — et **aucune colonne de classe** | B7, B8 ; le piège nommé : « un espace notes où tout se mélange » | (a) une table `saisie` avec une colonne `classe` ; (b) deux tables ; (c) deux champs de texte dans une même ligne | **(b)** | (a) laisse la classe à la discipline de l'écran : un client peut omettre le champ, et E7 (une appréciation saisie par mégarde comme un fait) reste possible. (b) rend l'omission **impossible** : le client choisit la route, donc il a choisi la classe. (c) est exactement le piège nommé. | Les gardes **G3** et **G18** l'essaient : effacer un constat est refusé, reclasser un constat est refusé car la colonne n'existe pas. Une pièce jointe s'accroche à un **constaté** et à rien d'autre, donc l'opinion n'a pas de photo. |
| **ADR-4** | Les deux délais de fin de terme et de restitution sont des **colonnes générées** ; le délai de bascule est une colonne du bail | La bascule 3 mois / 6 mois, et 21 jours / 1 mois | (a) un `if` dans un écran ; (b) une colonne calculée par le serveur ; (c) une colonne générée, alimentée par une colonne du bail | **(c)** | (a) met la bascule dans le code. (b) laisse la valeur **stockée**, donc falsifiable et divergente de sa source. (c) n'est pas une colonne : PostgreSQL refuse de l'écrire (gardes **G7**, **G8**, **G9**). Et **deux** bascules, pas une : `regime` et `restitution_depot_etat`. | Une correction de la date source redérivera les échéances non décidées. Une échéance **déjà décidée** ne bouge pas, et la tentative de la déplacer échoue en `409`. |
| **ADR-5** | L'accusé de réception est un **trigger de contrainte différé** | B1 : rien n'est annoncé avant confirmation serveur | (a) une discipline de code serveur ; (b) une colonne `confirme_le` écrite par l'API ; (c) une contrainte `DEFERRABLE` vérifiée au `COMMIT` | **(c)** | (b) dit « qui a écrit `confirme_le` ? » et la réponse est « l'API », donc rien. (c) vérifie au moment où c'est vrai : **après** la validation. Une réponse HTTP émise avant la validation est nécessairement fausse, et la validation échoue. | Conséquence forte et vérifiée par le § 4.3.3 : **le serveur ne peut pas contenir de ligne « en attente »**. La garde **G1** l'essaie. |
| **ADR-6** | Aucune quantité d'argent n'est calculée ; « payé » est la **présence** d'un reçu, et l'écart de E9 est une **saisie** | B16, E9, X2, X3 | (a) calculer le restant dû ; (b) comparer deux sommes ; (c) la présence d'une ligne, et rien d'autre | **(c)** | (a) est un calcul métier non validé. (b) est le rapprochement automatique qu'E9 refuse. (c) fait de « payé » une **présence** : il n'y a aucune soustraction dans la fonction d'état, donc aucune façon de se tromper en rapprochant. | La frontière de « somme due » est une contrainte d'énumération (garde **G14**), pas un formulaire. Le total affiché est une `SUM` et n'est **jamais stocké**. |
| **ADR-7** | Les énumérations sont des `text` + `CHECK`, **jamais** des `ENUM` PostgreSQL | Le magasin local doit porter les mêmes contraintes | (a) `ENUM` ; (b) table de référence avec FK ; (c) `text` + `CHECK`, généré | **(c)** | (a) est impossible à modifier dans une transaction, donc une migration d'énumération est un fichier à part. SQLite n'a pas d'énumération. (b) multiplie les jointures sur les colonnes les plus lues. (c) est une **liste**, donc comparable ligne à ligne entre le `CHECK`, le schéma Zod et le tableau du § 4. | Le prix est une liste dupliquée trois fois, payée par un générateur. Le gain : ajouter une valeur à `bail.regime` est une modification de contrainte, et les 14 lignes changent avec. |
| **ADR-8** | L'application est en **React Native hors Expo Go**, et le dépôt est **unique** à trois cibles | C2 exige une écriture locale durable ; le téléphone d'abord, le portable ensuite | (a) Expo Go ; (b) React Native natif ; (c) natif iOS et natif Android séparés | **(b)**, dépôt unique | (a) ne donne ni le keystore ni l'enclave que le chiffrement du magasin local exige : il les délègue à un runtime qu'on ne contrôle pas, et `conventions.md` § 3 demande une écriture **durablement**. (c) doublerait le travail sans gain : le téléphone d'abord, et le portable est la même application. | Le **pont de jetons** devient une fondation : React Native n'a pas de cascade CSS, donc sans pont chaque écran réécrirait la palette et la parité de Phase 3 serait perdue au premier commit. |
| **ADR-9** | `garde-fou` est écrit en vague 1, la roadmap le place en position 8 | La roadmap et le graphe n'expriment pas le même ordre | (a) respecter l'ordre de la roadmap ; (b) construire dans l'ordre du graphe et valider dans l'ordre de la roadmap | **(b)** | `dossier-bail` rend le drapeau et le bouton `Décider` : le construire avant `garde-fou` obligerait à revenir dessus. Et `garde-fou` ne lit qu'un contrat de données, donc rien ne l'en empêche. | L'ordre de **validation** reste celui de la roadmap. C'est la seule discordance entre les deux documents, et elle est écrite plutôt que résolue en silence. |
| **ADR-10** | Le troisième état de B9 est **déclaré et non applicable** ; `conserve_jusqua` est `NULL` sans défaut | Q2 est sans réponse | (a) inventer une durée par défaut ; (b) interdire `NULL` ; (c) `NULL` = « on ne sait pas », rendu par `ChampDate` en état `inconnue` | **(c)** | (a) inventerait la réponse d'un juriste non sollicité. (b) rendrait le produit inutilisable. (c) est la seule qui ne mente pas. | **Ce qui tient sans Q2** : le bouton « tout effacer » n'existe pas (portes **G3**, **G5**, **G6**, **G13**), l'effacement et l'anonymisation fonctionnent, l'export est produit et lisible. **Ce qui ne tient pas** : aucune fonction de « pièces effaçables », aucun job de purge, et la troisième case de la checklist de `donnees-personnelles` reste non cochée. § 4.5 détaille les deux colonnes. |
| **ADR-11** | Le 6e jour est une **colonne générée** `date_echeance + 1`, et non une constante « 6 du mois » | La roadmap dit « 6e jour », le design system dit « attendu le 5 » | (a) une constante dans le code ; (b) le 6 du mois calendaire ; (c) le lendemain de l'échéance du loyer | **(c)** | Les deux formulations sont vraies pour le cas que le design system dessine, et (c) reste juste quel que soit `jour_echeance_loyere` — donc Q4 peut répondre sans que la logique bouge. (b) figerait le contrat du bail dans le code de l'encaissement. | Si Q4 révèle que le 6 est **calendaire**, la correction porte sur une expression générée et une colonne du bail. Pas sur la logique du garde-fou, qui lit déjà une colonne. |
| **ADR-12** | L'ordre d'écriture est : **fichier, puis ligne, puis réseau** ; et `confirme_le` n'est écrit que par `appliquerAccuse()` | B3, C8, E1, E12 | (a) écrire en base puis'uploader' ; (b) uploader puis écrire en base ; (c) fichier, ligne, réseau, dans cet ordre | **(c)** | (b) est interdit par B3. (a) perd la photo si l'application est tuée entre l'écriture en base et l'envoi. (c) garantit qu'à **tout** instant il existe une copie locale, et l'état affiché est dérivé de l'absence de `confirme_le`. | E12 est traité **avant** la prise de vue : l'application annonce le stockage plein, et `VignettePhoto` rend l'état `erreur_ecriture` sans vignette. SQL ne peut pas vérifier qu'un accusé a été **reçu** : c'est une règle de lint et un test E2E mode avion. |

---

## 8. Risques architecturaux

| Risque | Probabilité | Impact | Mitigation |
|---|---|---|---|
| **Le magasin local et PostgreSQL divergent** : une contrainte existe d'un côté et pas de l'autre, et une saisie locale est acceptée puis refusée au serveur | **moyenne** | **élevé** — une perte de données silencieuse, et un propriétaire qui ne comprend pas pourquoi sa saisie est « Revenue » | Les deux DDL sont **générés depuis une seule migration** (§ 4.4). Un test de conformité compare, pour chaque table, la liste des `CHECK` et des `NOT NULL` des deux côtés et échoue à la première différence. Un test E2E écrit chaque forme interdite **hors ligne** et vérifie qu'elle est refusée **avant** d'envoyer. |
| **L'horloge simulée fuit en production** : le module de test est empaqueté, ou la constante `__BAILLY_BUNDLE__` est lisible au runtime | **faible** | **élevé** — le compteur, le garde-fou et l'encaissement afficheraient des dates fausses, et rien ne le signalerait | Le `grep` du bundle de livraison est **bloquant** dans le pipeline (§ 2.1). La constante est remplacée à la construction et n'est pas lisible. Un test E2E du bundle **de livraison** ouvre l'application, vérifie que le lien profond d'horloge est ignoré, et que la date affichée est celle du système. |
| **Une nouvelle slice ajoute une colonne `synchronise`**, parce que c'est le réflexe et que `ecriture_id` demande de la jointure | **moyenne** | **moyen** — l'état du produit se dédouble, et l'écran peut dire autre chose que la base | La garde **G17** rend l'écriture impossible sur `fait_constate` ; la même garde est dupliquée sur les sept tables métier, donc la colonne ne peut pas **exister**. Une property test vérifie que `EtatEcriture` est dérivé de `ecriture.confirme_le` et de rien d'autre. |
| **L'export devient illisible** : le `_index.md` ne suffit pas, ou le format dérive vers du CSV propriétaire | **moyenne** | **fort** — R8, la survie du produit | L'export a **son** critère : il est produit, puis relu par le commanditaire, une fois, et c'est le critère de succès n°5 de la PRD. Un test vérifie qu'un tableur ouvre le CSV sans intervention. Le `_index.md` est obligatoire, pas optionnel. |
| **Q3 reste sans réponse et l'hébergeur ne tient pas son engagement de sauvegarde** | **moyenne** | **fort** — R4, perte totale | C1 tient : la donnée est exportable sans Bailly, donc la reprise ne dépend pas de l'hébergeur. L'export complet est **rejouable** sans le logiciel, et le test de reprise est écrit avant que le commanditaire ne fasse confiance à l'outil. Le `objet_cle` opaque garantit qu'aucun changement de fournisseur ne touche le schéma. |
| **La règle des 21 jours est juridiquement fausse** et devient une obligation opposable que Bailly a lui-même écrite | **faible** | **fort** — une échéance fausse dans un produit de gestion locative | Les cinq échéances viennent du commanditaire (Q1 close), **pas d'un juriste**. Le même écart existe pour la durée légale (Q2) et il est assumé. La mention de calcul affichée dans le dossier et dans l'export (`terme 31/03/2027 − 3 mois`) rend la règle **visible et contestable**, ce qui vaut mieux qu'une date juste mais opaque. Une relecture juridique est une action de V1, écrite dans le § 7 de la roadmap. |
| **`garde-fou` devient un bruit** : trop d'échéances à l'écran, le panneau de blocage s'ouvre tout le temps | **moyenne** | **moyen** — R6, et le propriétaire cesse de regarder | Le schéma porte la contrainte : une échéance **remonte une fois** (garde **G12**) et les marges ne sont pas des décisions (garde **G11**). Le panneau de blocage ne montre que les bloquantes **non décidées**, et il **disparaît** quand il n'y en a plus — pas de « tout est à jour ». Une property test vérifie qu'un bail sans échéance bloquante non décidée ne produit aucun panneau. |
| **LeSecrets d'OAuth ou un jeton de session réapparaît** parce qu'une bibliothèque d'authentification le fournit par défaut | **faible** | **fort** — R9, 14 baux inaccessibles | C5 interdit un mot de passe à retenir. Le contrat d'API est un `Bearer <secret>` sans expiration, et le `client-api` n'a **aucune** dépendance à une bibliothèque d'authentification. Un test vérifie qu'aucune route ne renvoie de `Set-Cookie`. |
| **Un `ENUM` de PostgreSQL revient**, ajouté par confort parce qu'un `text` + `CHECK` est plus long à écrire | **moyenne** | **moyen** — divergence entre les deux dialectes, et une migration qui ne passe pas en transaction | ADR-7 est écrit avec ses trois raisons, dont une est vérifiable : un test échoue si le schéma contient un type `ENUM` ou `CREATE TYPE`. |

---

## 9. Amendements

**Ce document sera cité par numéro.** Un plan de la Phase 5 écrit « selon
`architecture.md` § 5.1 » : ce numéro est un **contrat**.

> **Étendre, jamais renuméroter.** Ajouter une section **en fin de numérotation**
> ne casse rien. Insérer en plein milieu décale tous les numéros suivants — et
> chaque renvoi pointe alors vers une section qui existe **encore**, donc vers la
> **mauvaise**. Aucun contrôle ne voit une dérive qui résout.

| # | Amendement | Raison | Sections ajoutées | Renumérotage |
|---|---|---|---|---|
| 0 | 2026-09-30 | Écriture initiale. Aucune section préexistante, donc aucune dérive possible. | § 1 à § 9 | aucun |
| 1 | 2026-09-30 | La Phase 4 a besoin de quatre sections que le gabarit n'a pas : le dialecte local (§ 4.4), la séparation sans Q2 (§ 4.5), la bascule bloquante/marge (§ 4.6) et la frontière des sommes (§ 4.7). Elles sont **ajoutées en fin de numérotation** du § 4, et le § 4.3 garde son numéro parce qu'il est cité par § 4.5 et par le gate. | § 4.4, § 4.5, § 4.6, § 4.7 | aucun |
| 2 | 2026-09-30 | Écart relevé avec la Phase 3 : `EtatFeuilleClasse` a deux membres accentués (`fermée_sans_choix`, `fermée_avec_choix`) dans `design-system.md` § 3. L'architecture les reprend **tels quels**, parce que corriger l'accent ici ferait diverger les deux documents et que `consistency-check state-parity` le signalerait comme un état absent de l'union. Le passage en ASCII est un **amendement du design system**, à décider en Phase 5, pas une correction opportuniste ici. | aucune | aucun |

Un amendement ne s'édit pas dans le fichier : il s'enregistre, et la commande
**refuse** le renumérotage en nommant la dérive.

```bash
node "$FORGE/scripts/state.js" amend "Forge Labs/gestion-locative" architecture \
  --reason "<pourquoi cet amendement existe>" \
  --changes <fichier-listant-ce-qui-change>
```

Renuméroter quand même : `--allow-renumber --renumber-reason "<texte>"`. Cette
raison reste **dans l'état**, à côté des numéros cassés.

**Nomme tes renvois.** Un renvoi nu ne dit pas de quel document il parle ;
`` `architecture.md` § 5.1 `` le dit, et un contrôle peut le vérifier sans rien
deviner. C'est pour cette raison que le § 9 cite `§ 4.4` à `§ 4.7` et non
« les quatre sections ajoutées » : la numérotation est une adresse, pas un
souvenir.

---

## Check list de gate

- [ ] Chaque user story du PRD a une slice correspondante. — US-1..US-8 : `saisie` (1, 3), `piece-jointe` (2), `dossier-bail` (4), `encaissement` (5, 6), `demandes` (7), `garde-fou` (8). US-5 et US-6 sont dans une seule slice, comme la roadmap l'a tranché.
- [ ] Chaque slice a une responsabilité claire et nommable en une phrase. — § 3.2 à § 3.7.
- [ ] Les fondations sont identifiées et isolées des slices métier. — § 2, sept fondations, aucune ne contient de règle métier.
- [ ] Tous les modèles de données sont définis champ par champ. — § 4.1, quatorze tables, aucun champ résumé.
- [ ] Tous les endpoints API listent leurs codes d'erreur de manière exhaustive. — § 5.1 liste les codes communs, chaque endpoint du § 5.2 porte ses codes propres, les six contrats non triviaux sont détaillés au § 5.3.
- [ ] Le graphe de dépendances est sans cycle. — § 6.3, `dependency-check --write`.
- [ ] L'ordre d'implémentation est cohérent avec les dépendances. — § 6.1, six vagues, `impl_waves: 6` déclaré au front matter ; `dependency-check --write` ne signale aucun écart.
- [ ] Les décisions d'architecture non triviales sont documentées en ADR. — § 7, douze ADR.
- [ ] `ddl-exec all` passe : PostgreSQL accepte le DDL, et les gardes déclarées tiennent. — § 4.3, dix-huit gardes.
- [ ] `consistency-check references` : **zéro** renvoi cassé. Les renvois nus se comptent — les nommer.
- [ ] `consistency-check state-parity` : les 30 unions du design system sont définies. — § 2.6.
- [ ] `dependency-check check --write` : **zéro** cycle, et l'écart entre `impl_waves` déclaré et calculé est **nul**. — § 6.1.
- [ ] `forge-guard no_undecided_slots` : **zéro** case `À DÉCIDER` subsistant de `conventions.md` § 2. — Les neuf cases sont tranchées au § 1.1 ; les quatre questions ouvertes (Q2, Q3, Q4, Q5) sont **des questions au commanditaire**, pas des cases de stack, et elles sont traitées aux § 4.5, § 3.4 et § 4.1.1.

**Statut** : `draft` → en attente de validation.