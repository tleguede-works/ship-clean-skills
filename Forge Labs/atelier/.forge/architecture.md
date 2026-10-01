---
type: architecture
status: approved
generated_at: 2026-10-01
derived_from:
  - .forge/prd.md
  - .forge/roadmap.md
  - .forge/conventions.md
  - .forge/contract.md
  - .forge/design/design-system.md
impl_waves: 11
impl_waves_rationale: "Minimum topologique du graphe declare en section 6. Le plan est plus fin que le minimum uniquement en un point : les fondations F6 et F7 (envoi confirme, rendu PDF) sont portees en vague 1 avec F3 et F9, alors que le graphe les accepterait en vague 0. Elles ne portent pas sur le meme sujet que F3 (persistance) : les laisser au meme moment que F3 et F9 ferait porter par la meme personne une transaction locale, un protocole d'envoi et un rendu de document."
---

# Architecture — Atelier

> Ce document définit COMMENT le produit est structuré techniquement.
> Il transforme les besoins du PRD en modules, slices, fondations, modèles de données et contrats d'API.
>
> **Règle de granularité** : toute entité, tout champ, tout endpoint est documenté — pas résumé, pas échantillonné.

---

## 1. Vue d'ensemble

### 1.1 Stack technique

| Domaine | Choix | Version | Justification |
|---|---|---|---|
| Langage | TypeScript, mode `strict` | 5.9 | Convention : un logiciel qui doit tenir cinq ans sans auteur disponible ne peut pas accumuler de `any`. |
| Framework | Next.js, rendu application | 15.5 | Convention : la boucle se fait sur un téléphone, une application installable tient dans le budget de contexte. |
| Base de données | PostgreSQL, hébergement UE | 17 | Convention, et `contract.md` § 3 : l'hébergement à 5,99 €/mois est payé pour douze mois, chez l'hébergeur de Forge, en France ou dans l'Union européenne. |
| Magasin local | SQLite compilé, sur OPFS | 3.46 | Convention, et `prd.md` C1 : un devis se fait dans une cave. Le même schéma est posé dans les deux magasins (§ 4.0). |
| ORM / Query builder | Drizzle ORM | 0.44 | Convention : le schéma est la source, et les requêtes sont lisibles. Sur le serveur seulement — sur l'appareil, les requêtes sont écrites à la main dans `F3`. |
| State management | Zustand | 5.0 | Convention : l'état global est un compteur de synchronisation, une connectivité et un compteur de documents non envoyés, et il doit être lisible hors de React pour piloter l'interface depuis un test. |
| Validation | Zod, un schéma par entité | 4.1 | Convention : une valeur acceptée par Zod et refusée par la base est un bug de génération, et il se voit parce que les deux listes sont côte à côte. |
| HTTP client | `fetch` natif, plus un wrapper de 40 lignes | — | **Choix de la Phase 4.** Une bibliothèque de client HTTP réessaie automatiquement ; or `prd.md` B7 interdit qu'un second essai envoie un second courriel. La politique de réessai doit être écrite à la main pour être lisible, donc elle l'est. |
| Styling | CSS natif, modules CSS, tokens en variables CSS | — | **Choix de la Phase 4.** Le `design-system.md` § 0.0 déclare déjà ses tokens en variables `--color-*` ; Tailwind introduirait un second langage de jetons et une seconde place où une couleur se décide. |
| Composants UI | Aucune bibliothèque | — | **Choix de la Phase 4**, et `contract.md` § 4 le délègue à Forge. Le `design-system.md` § 2 définit 23 composants avec leurs états nommés ; une bibliothèque imposerait ses propres états, et deux « motion » sur le même bouton sont deux mensonges possibles. |
| Tests unitaires | Vitest + fast-check | 3.2 | Convention : le garde-fou est une propriété, pas un cas ; sans générateur de propriétés, une propriété n'est pas testée, elle est affirmée. |
| Tests E2E | Playwright en mode hors ligne | 1.55 | Convention : les trois démonstrations sont au niveau appareil. |
| Lint / format | ESLint 9 + Prettier | 9.17 | Convention : la règle qui compte est `no-restricted-syntax` sur `Date.now` et `new Date` hors du paquet `horloge` (F2). |

### 1.1.1 Trois choix que les conventions laissaient à la Phase 4

| Sujet | Choix | Version | Une raison |
|---|---|---|---|
| Rendu du PDF | `pdf-lib`, rendu dans le navigateur, fichier écrit sur l'appareil | 1.17.1 | `contract.md` § 4 délègue la façon de produire le PDF à Forge ; un rendu **sur l'appareil** est la seule option qui satisfait `prd.md` US-4, où le partage fonctionne sans réseau, et C1. |
| Polices | `Archivo` et `IBM Plex Mono` auto-hébergées, servies par l'hébergeur de Forge | — | `prd.md` C11 interdit qu'une donnée de Jean-Luc parte chez un tiers ; une police servie par un CDN tiers voit son adresse IP à chaque ouverture de l'application. |
| SQLite dans le navigateur | `@sqlite.org/sqlite-wasm`, chargé depuis la même origine, dans un *Web Worker* | 3.46 | L'accès à OPFS par poignée synchrone exige `SharedArrayBuffer`, donc un contexte isolé : deux en-têtes de réponse (`Cross-Origin-Opener-Policy: same-origin`, `Cross-Origin-Embedder-Policy: require-corp`) que l'hébergeur doit servir. Voir § 8, risque R-02, pour le repli. |

### 1.2 Structure de dossiers cible

```
atelier/
├─ apps/
│  ├─ web/                          Next.js 15.5, rendu application, l'appareil
│  │  ├─ app/                       les 13 écrans du design-system.md § 5
│  │  ├─ composants/                F1 — tokens, 23 composants primitifs
│  │  ├─ magasin/                   F3 — SQLite sur OPFS, schéma, transactions
│  │  ├─ file/                      F4 — la file d'attente
│  │  ├─ sorties/                   F6 — envoi confirmé · F7 — PDF
│  │  ├─ coquille/                  F8 — barre basse, bandeau, compteur, magasin Zustand
│  │  └─ e2e/                       les trois démonstrations Playwright, hors ligne
│  └─ serveur/                      handlers de route + Drizzle : l'archive et l'envoi
├─ packages/
│  ├─ horloge/                      F2 — le seul endroit où Date.now existe
│  ├─ empreinte/                    F5 — canonique + SHA-256, partagé
│  └─ modele/                       schémas Zod, un par entité
├─ drizzle/                         schéma PostgreSQL et migrations, une par version
└─ pglite/                          rien : PostgreSQL ne tourne que dans les contrôles
```

**Pourquoi trois paquets partagés, et pas un dossier.** `packages/empreinte` (F5) doit produire **le même octet** dans le navigateur et sur le serveur, sinon l'empreinte calculée avant l'envoi n'est pas celle vérifiée à la réception. `packages/horloge` (F2) doit être **le seul** lecteur de `Date.now`, sinon la règle ESLint des conventions n'a pas d'objet. Ce sont deux raisons distinctes, et elles ne se mélangent pas.

### 1.3 Où vivent les données, au regard de l'hébergement payé

`contract.md` § 3 est irréversible : **5,99 €/mois pendant douze mois**, chez l'hébergeur de Forge, en France ou dans l'Union européenne, et **24 € pour deux ans** pour le nom en `.fr`. Cette architecture ne les contredit pas, et voici où chaque donnée vit.

| Donnée | Où elle vit | Durée | Ce qui l'y met, ce qui l'en retire |
|---|---|---|---|
| Devis en cours, lignes, total, signature, tracé, empreinte courante, file d'attente, réglages | **L'appareil de Jean-Luc.** SQLite sur OPFS. | Tant que l'appareil existe | Écrit par `F3`, jamais lu par le réseau. Rien ne les purge : `prd.md` § 7.2 dit qu'un magasin que le système peut vider à sa guise ne tient pas un devis. |
| Devis sortis, signatures horodatées, factures, numéros | **L'hébergeur de Forge, en France ou dans l'UE.** PostgreSQL 17. | Devis 2 ans, factures 10 ans, sauvegardes 30 jours (`prd.md` C6) | Reçoit ce qui a quitté l'appareil ; ne renvoie jamais le contenu d'un document, seulement la confirmation d'un envoi. |
| Adresse du destinataire des courriels | **La boîte à Jean-Luc seul.** (`contract.md` § 3, 3 000 envois) | — | Reçoit une adresse et un contenu rédigé par l'hébergeur. C'est le second et dernier acteur (`prd.md` C11). |
| Le PDF partagé | **Là où Jean-Luc le met.** | — | Hors du produit dès qu'il est partagé. La promesse de `prd.md` C11 s'arrête à la frontière du produit : le dire ici vaut mieux que le laisser découvrir. |
| L'adresse `.fr` des clients | Le domaine payé 24 € pour deux ans | Deux ans, renouvelable | Doit continuer à répondre si Forge change d'hébergeur (`contract.md` § 3 : « l'adresse ne change pas »). Conséquence d'architecture : le domaine pointe sur l'hébergeur de Forge, jamais sur une adresse personnelle. |

**Ce que l'hébergement décide, et qu'aucune ligne de code ne rattrape.** Les 5,99 €/mois comprennent l'espace **et** les sauvegardes (`contract.md` § 3). Donc : pas de service de synchronisation tiers, pas de stockage de fichiers hors du plan, pas de CDN, pas de service de signature qualifié — `prd.md` C3 l'exclut, il coûterait 1 à 3 € par devis. Et le quota : 5,99 €/mois ne tient pas un déploiement par client ; **une seule base, un seul schéma, un seul jeu de migrations**.

---

## 2. Fondations

> Implémentées en premier. Tout le reste en dépend.

| Fondation | Responsabilité | Dépend de | Dépendue par |
|---|---|---|---|
| **F1** `design-system` | Les tokens, les 23 composants primitifs et les 13 écrans de `design-system.md`, sans réinventeur | — | F7, F8, F9, S1 à S20 |
| **F2** `horloge` | La seule source d'heure du produit, et trois durées distinctes qui ne se fusionnent jamais | — | F3, F4, F6, F8, S1 à S20 |
| **F3** `magasin-local` | Écrire sur l'appareil sans perdre rien, dans une transaction, avec un `rang` monotone | F2, F5 | F4, F8, S1 à S14, S17 à S20 |
| **F4** `file-attente` | L'ordre d'envoi, la déduplication, et l'invalidation d'une entrée quand le devis change | F2, F3, F5 | F8, S1, S8, S9, S20 |
| **F5** `empreinte` | Le texte canonique d'un devis et son SHA-256, calculés une fois et vérifiés des deux côtés | — | F3, F4, F6, F7, S6, S7, S10 |
| **F6** `sortie-courriel` | Envoyer par courriel et n'affirmer « envoyé » qu'après retour du service | F2, F5 | S8, S9, S17, S20 |
| **F7** `sortie-pdf` | Produire un PDF lisible hors ligne, empreinte imprimée dessus | F1, F5 | S10, S14, S16 |
| **F8** `coquille` | La barre basse à trois entrées, le bandeau de file, le compteur, et le magasin d'état global | F1, F2, F3, F4 | S1 à S20 |
| **F9** `identite-emetteur` | Les cinq mentions que Forge n'a pas encore, et le blocage explicite qui les attend | F1 | S15, S16, S18 |

### 2.1 F1 `design-system`

**Périmètre** : appliquer `design-system.md` tel qu'il est écrit — ses jetons de `design-system.md` § 1, les 23 composants de `design-system.md` § 2 avec leurs états nommés, les 13 écrans de `design-system.md` § 5. La fondation ne **décide** rien : elle décide que les 30 couleurs de `design-system.md` § 1.1 existent, que `--color-texte-attente` ne porte jamais une alerte qu'elle ne constate pas, et que `EtatSortie` a exactement trois valeurs parce que `design-system.md` § 0.3 dit « Trois valeurs, jamais deux ».

**Contrats** :

```typescript
// Les trois valeurs d'état de sortie. Une quatrième n'existe pas : B5 en
// donne trois, et le design-system.md § 0.2 interdit d'ajouter le mot
// « confirmé » à l'une d'elles.
export type EtatSortie = 'attente' | 'confirme' | 'declaration';

// La preuve nomme qui a constaté le fait. Elle est toujours présente,
// y compris à l'état « attente » (design-system.md § 0.3, variantes 1a/1b/1c).
export type PreuveSortie = '1a' | '1b' | '1c' | '2a' | '3a';
```

**Ce que F1 rend impossible, et pourquoi c'est une fondation** : `FichierSignee` n'a pas de bouton de retour (§ 2 de `design-system.md`), donc E5 est tenu par l'absence d'éléments de navigation et non par leur désactivation. Ce n'est pas un réglage d'écran ; c'est une propriété du composant, donc elle appartient à une fondation et pas à une tranche.

### 2.2 F2 `horloge`

**Périmètre** : être le seul endroit du dépôt où `Date.now()` et `new Date()` existent, et exposer **trois** durées qui répondent à trois questions différentes. `roadmap.md` § 5 l'écrit : « Ne pas fusionner les trois durées en un délai unique ».

**Contrats** :

```typescript
// Une source d'heure. Le test en fournit une ; le navigateur en fournit une
// autre. Aucun autre module ne connaît l'une des deux.
export type SourceHorloge = { maintenant(): Instant };
export type Instant = { epochMs: number; dateFr: string; heureFr: string };

// Les trois durées, trois types, trois fonctions. Aucun « delai » générique
// n'existe dans ce paquet : c'est l'interdiction de roadmap.md § 5, rendue
// impossible par les types.
export function termeValidite(d: { dateDocument: string; dureeValiditeJours: number }): DateLimite;
export function echeance(f: { dateFacture: string; delaiPaiementJours: number }): Echeance;
export function jourRelance(e: Echeance, delaiRelanceJours: number): DateLimite;

// Les trois résultats sont des types distincts, et non un nombre de jours.
export type DateLimite = { iso: string; joursRestants: number; depassee: boolean };
export type Echeance = { iso: string; joursRetard: number; depassee: boolean };
```

**Les trois durées ne se déduisent pas l'une de l'autre.** La validité court depuis la **date écrite sur le devis** (B12), qui ne bouge pas si le devis sort trois semaines plus tard (E15). L'échéance court depuis la **date de la facture** (B18). Le jour de relance se compte **depuis l'échéance** (B20). Il n'existe aucun code qui fasse `termeValidite - delaiPaiementJours`, et il n'en existera pas : les trois entrées ne se resembled pas.

### 2.3 F3 `magasin-local`

**Périmètre** : toute écriture de l'application passe par ici, dans une transaction, et n'est jamais perdu (B4, E2). Le magasin vit dans SQLite compilé, sur OPFS, et il **pose le même schéma que le serveur** (§ 4.0).

**Contrats** :

```typescript
export type Tx = {
  // Chaque écriture transactionnelle renvoie le rang qu'elle a obtenu. Ce rang
  // est l'ordre de sortie de la file d'attente : il est monotone, local, et
  // ne dépend d'aucune horloge (voir ADR-1).
  ecrire<T>(req: (tx: Tx) => T): Promise<{ valeur: T; rang: number }>;
  lire<T>(req: (tx: Tx) => T): Promise<T>;
};

export type MagasinLocal = {
  dansTransaction<T>(fn: (tx: Tx) => Promise<T>): Promise<T>;
  prochainRang(): Promise<number>;
  // La persistance est demandée au système, et son refus est remonté :
  // prd.md § 7.2 dit que les données écrites ne peuvent pas être effacées
  // sans que Jean-Luc en soit informé.
  persistant(): Promise<boolean>;
};
```

**Le rang est attribué par le magasin, pas par l'appelant.** Une écriture qui veut passer devant une autre n'a pas de mot à dire : elle prend le prochain rang. C'est ce qui rend l'ordre de la file reproductible même si l'horloge de l'appareil recule d'un jour.

### 2.4 F4 `file-attente`

**Périmètre** : ce qui est parti vers le service et attend sa confirmation, dans quel ordre, et ce qui rend une entrée invalide. Le composant `FileAttente` du `design-system.md` § 2 en est la face visible ; cette fondation est le mécanisme.

**Contrats** :

```typescript
export type EntreeFile = {
  jeton: string;            // jeton de tentative, tiré AVANT le départ (E3)
  numero: string;           // le devis concerné
  empreinte: string;        // l'empreinte signée, au moment de la signature
  rang: number;             // ordre d'envoi, fourni par F3
  etat: 'en_attente' | 'confirme' | 'echoue';
  tente_le: string | null;  // horloge F2
  erreur: string | null;    // ce que le service a dit, jamais « a échoué »
};

// Une entrée entre dans la file par cette fonction, et par aucune autre.
export function entrer(f: FileAttente, e: { jeton: string; numero: string; empreinte: string; rang: number }): void;

// Le tri n'est pas un paramètre : il est écrit ici, une fois.
export function* dansLordre(): AsyncGenerator<EntreeFile>;

// L'invalidation se produit à l'écriture du devis, jamais à l'envoi.
export function invalider(f: FileAttente, numero: string, raison: string): void;
```

**`invalider` porte le nom de l'opération interdite.** Une écriture de devis appelle `invalider` avec la raison `signature annulée par une modification (B11)`. L'entrée reste visible dans la file avec cet état — elle n'est pas supprimée en silence, parce qu'un devis qui attendait une confirmation et qui disparaît de la liste est un devis que Jean-Luc croit parti.

### 2.5 F5 `empreinte`

**Périmètre** : transformer un devis en **une suite d'octets unique**, et laire deux fois. C'est la seule garantie juridique du produit (`contract.md` § 3 : signature tracée à 0 €, sans costo de signature qualifiée), donc le paquet est petit et n'a pas de dépendance autre que l'API Web Crypto.

**Contrats** :

```typescript
// Le texte canonique. L'ordre des champs est écrit ici et ne bouge jamais ;
// les montants sont des centimes entiers, jamais des flottants ; aucun
// formatage local n'intervient, sinon le serveur et l'appareil divergent.
export function texteCanonique(d: DevisSignable): string;

// SHA-256 des octets UTF-8 du texte canonique, en hexadécimal minuscule.
export function empreinte(texte: string): Promise<string>;
```

**La forme exacte, parce qu'une empreinte dépend de la forme.**

```
numero=D-2026-014|date=2026-03-28|client=Roux|lignes=2|total=1440000
```

Chaque ligne de travaux sérialise ensuite dans le même texte, dans l'ordre de `rang_ligne`, sous la forme `ligne=<rang>|<designation>|<quantite centimes>|<montant centimes>` — la désignation passant par une normalisation NFC. Les centimes sont entiers parce que `0.1 + 0.2` n'est pas `0.3` en IEEE 754, et qu'une empreinte qui dépend d'un flottant n'est pas une empreinte.

### 2.6 F6 `sortie-courriel`

**Périmètre** : envoyer par courriel et **attendre le retour du service** avant d'écrire quoi que ce soit qui dise « envoyé » (B6). Cette fondation couvre les deux bouts : la requête de l'appareil et la route du serveur qui l'exécute.

**Contrats** :

```typescript
// L'appareil. Le jeton est tiré avant le départ, transmis, et rejoué au
// besoin : un second essai avec le même jeton ne peut pas produire un second
// courriel (B7, E4), et il sert aussi à demander au serveur ce qu'il est
// devenu de la première tentative (E3).
export type EnvoiCourriel = {
  envoyer(d: DevisSignable, jeton: string): Promise<Confirmation | En attente>;
  interroger(jeton: string): Promise<Confirmation | En attente>;
};

export type Confirmation =
  | { etat: 'confirme'; recu_le: string; adresse: string }
  | { etat: 'refuse'; motif: string; reessayable: boolean };
```

**Aucun délai, aucune boucle, aucun `setTimeout` d'attente active.** Le client interroge, il ne retente pas tout seul. Une client HTTP qui réessaierait automatiquement violerait B7 par construction : c'est la raison pour laquelle § 1.1 refuse une bibliothèque de client HTTP.

### 2.7 F7 `sortie-pdf`

**Périmètre** : produire un fichier PDF **sur l'appareil**, sans réseau, lisible au format français, et **empreinte imprimée dessus** (B10, `design-system.md` § 2 `EnTeteDevis`, slot `empreinte`).

**Contrats** :

```typescript
export type PdfDevis = {
  rendre(d: DevisSignable, empreinteSignee: string): Promise<Uint8Array>;
};

// Ce que le PDF porte, et qui décide de le porter :
//   le numéro (police à chasse fixe), la date écrite sur le document,
//   les lignes, le total en toutes lettres (« quatre mille huit cent soixante »),
//   la date limite, la mention de sortie et sa ligne de preuve,
//   et l'empreinte, en bas, comme le design-system.md § 2 l'affiche.
export type PdfOptions = { polices: Record<'texte' | 'identifiant', Uint8Array> };
```

**Aucune conversion d'un montant par un formateur de langue.** « 1440000 centimes » devient « 14 400,00 € » par une fonction unique, testée par propriété avec fast-check sur les centimes : c'est la seule façon de garantir qu'un montant ne varie pas entre l'écran, le PDF et l'empreinte (B3).

### 2.8 F8 `coquille`

**Périmètre** : la barre basse à trois entrées (`Suivi` · `Devis` · `Clients`), le bandeau `FileAttente` sous l'en-tête, le `CompteurNonEnvoyes` en 44 px, le push du détail, et le magasin d'état global. Le magasin est ici et nulle part ailleurs : aucune tranche n'écrit dans le magasin global.

**Contrats** :

```typescript
export type EtatGlobal = {
  compteurNonEnvoyes: number;   // exact, jamais arrondi (B23)
  ancienAttenteIso: string | null; // pour la ligne « Le plus ancien attend depuis 6 jours »
  enLigne: boolean;             // network, pas « le service répond-il »
  fichierEnAttente: number;     // N devis attendent la confirmation du service
  fichierImpossible: boolean;   // le service a renvoyé une erreur
  valide: boolean;              // la durée de validité par défaut
};
```

**Un seul magasin, parce qu'il n'y a qu'une chose à afficher en haut.** `conventions.md` dit que l'état global du produit est « un compteur de synchronisation, une connectivité et un compteur de documents non envoyés » : ce sont trois champs, pas une bibliothèque d'état. Toute autre forme de cet état est un état local à sa tranche.

### 2.9 F9 `identite-emetteur`

**Périmètre** : porter les cinq mentions que `contract.md` § 3 laisse en `[à compléter]` — le SIRET de Jean-Luc, la raison sociale de Forge, son adresse, son téléphone, son courriel — et produire le blocage visible quand il en manque une. `state.json` enregistre déjà ce manque comme le point client C-001.

**Contrats** :

```typescript
export type MentionEmetteur =
  | 'siret_artisan'
  | 'raison_sociale_forge'
  | 'adresse_forge'
  | 'telephone_forge'
  | 'courriel_forge';

export type IdentiteEmetteur = Record<MentionEmetteur, string>;
// Un seul état rend compte des cinq, jamais cinq états séparés.
export function etatIdentite(c: Configuration): 'complete' | 'manque' | 'jamais_demandee';
```

**Le blocage est sur l'émission, pas sur le produit.** `roadmap.md` § 2.2 : le devis, la signature, l'envoi et le suivi fonctionnent sans ces cinq champs. C'est pourquoi F9 est une fondation et non une tranche du parcours de facture : elle n'a pas d'écran propre, elle a **un écran qui bloque**, `question-fiscale` et son voisin `BandeauBlocage` variante `incomplet`.

### 2.10 Ce qui n'est pas une fondation, et pourquoi

Une fondation annoncée et jamais écrite est une fondation imaginaire. Voici les **cinq** que `systems-architect.md` attend par défaut et qu'Atelier **ne** possède **pas**, avec la règle qui l'interdit chacune.

| Attendu par défaut | Présent ? | La règle qui l'interdit |
|---|---|---|
| Authentification / sessions | **Non, délibérément** | `prd.md` B22 et C2 : aucune action ne demande un mot de passe, un code ni une réponse à une question secrète ; il n'existe ni gestion de compte, ni « mot de passe oublié ». Le seul verrou est celui de l'appareil. Ce n'est pas un oubli : c'est une contrainte, et le jeton d'appareil de la § 5 est la seule identité technique. Voir § 5.1 pour la manière dont le serveur reconnaît l'appareil sans que Jean-Luc ait quoi que ce soit à saisir. |
| Gestion d'erreur globale | **Non, absorbée par F1** | Le `design-system.md` § 2 définit déjà `BandeauMessage` et l'état `erreur` de `ListeDevis`. Une fondation d'erreur séparée créerait une seconde grammaire d'erreur ; ici, il y a une seule. |
| i18n | **Non** | `prd.md` § 7.4 : le produit est français, une seule langue, une seule devise. Une table de traduction serait une décision prise contre le PRD. |
| Observabilité, métriques, journalisation distante | **Non** | `prd.md` C11 et `contract.md` § 3 : « Aucune donnée de Jean-Luc ne part chez un tiers en dehors de l'hébergeur et de l'expéditeur de courriels. » Une télémétrie est une donnée de Jean-Luc qui part chez un tiers. L'observabilité du produit est donc **locale** : le journal d'erreurs vit sur l'appareil, dans F3, et Forge le demande à Jean-Luc par téléphone. |
| Rendu de document distant | **Non, `F7` le fait sur l'appareil** | Le PDF est produit sur l'appareil (`prd.md` US-4) ; un service de rendu distant serait un acteur supplémentaire, interdit par C11, et ferait dépendre US-4 du réseau — ce qu'US-4 exclut explicitement. |

---

## 3. Modules et slices

### 3.1 Inventaire

**L'ordre des modules suit la fréquence de la boucle de travail de Jean-Luc**, pas l'organigramme du domaine : un module n'est pas en haut parce qu'il est le cœur métier sur le papier, mais parce qu'on y revient tous les jours. Les rangs de navigation, eux, sont ceux du `design-system.md` § 3.2, et un module peut avoir un rang technique et aucune entrée dans la barre basse.

| Rang | Module | Fréquence (1-5) | Libellé | Rationale du rang |
|---|---|---|---|---|
| 1 | `suivi` | 5 | **quotidien** | Jean-Luc ouvre l'application pour savoir s'il a envoyé quelque chose, pas pour envoyer : cinq fois par jour, dont le matin avant de partir et le soir en rentrant (`design-system.md` § 0). |
| 2 | `devis` | 3 | **hebdomadaire** | Créer un devis est peu fréquent — 30 par an, deux ou trois par mois (`contract.md` § 3) — mais c'est l'acte que `prd.md` § 1.1 nomme comme problème principal, et aucun module n'existe sans lui. |
| 3 | `sortie` | 3 | **hebdomadaire** | Chaque devis fait ici doit sortir, et c'est le seul acte du produit qui dépend du réseau ; sa fréquence suit celle des devis, pas celle de leur consultation. |
| 4 | `clients` | 3 | **mensuel** | On y va quand un client appelle : deux ou trois fois par mois, devant un client qui attend au téléphone. |
| 5 | `reglages` | 1 | **annuel** | Configuration pure : la durée de validité par défaut, les deux exclusions de `design-system.md` § 0.5, le prix. |
| 6 | `export` | 1 | **annuel** | La promesse de pouvoir partir (`contract.md` § 3) est à un geste, pas dans une barre : lui donner une entrée de navigation serait lui donner une fréquence qu'il n'a pas (`design-system.md` § 3.2). |
| 7 | `facture` | 1 | **annuel, V1** | Module de la V1 : 30 factures par an. **Il n'a pas d'entrée de navigation au MVP**, et son écran de blocage est la seule chose qui existe avant la V1 (`design-system.md` § 0.6). |

| Module | Slice | User stories (PRD) | Règles métier (B*) | Version |
|---|---|---|---|---|
| `suivi` | **S1** `accueil-compteur` | US-5, US-6 | B22, B23 · C2 · E10 | MVP |
| `suivi` | **S2** `liste-suivi` | US-7 | B25, B26 | MVP |
| `suivi` | **S3** `echeance-devis` | US-8 | B12, B13 · E8, E15 | MVP |
| `devis` | **S4** `nouveau-devis` | US-1 | B1, B12 · E13, E14 | MVP |
| `devis` | **S5** `lignes-devis` | US-1, US-13 | B2, B3, B4 · C1 · E2, E13 | MVP |
| `devis` | **S6** `detail-devis` | US-1, US-7 | B1, B3, B5, B10, B11 · E6, E15 | MVP |
| `devis` | **S7** `signature` | US-2, US-14 | B9, B10, B11 · C3 · E5, E6, E7, E17 | MVP |
| `sortie` | **S8** `choisir-sortie` | US-3 | B5, B6, B7, B9 · E3, E4 | MVP |
| `sortie` | **S9** `confirmation-envoi` | US-3, US-6 | B6, B23 · E3 | MVP |
| `sortie` | **S10** `partage-pdf` | US-4 | B8 · E3 | MVP |
| `clients` | **S11** `recherche-client` | US-11 | B21 · E12, E14 | MVP |
| `clients` | **S12** `dossier-client` | US-11 | B21 · E12, E14 | MVP |
| `reglages` | **S13** `duree-validite-reglages` | US-5, US-8 | B12, B22 · C2 | MVP |
| `export` | **S14** `export-tout` | US-12 | B24 · C6 | MVP |
| `facture` | **S15** `question-fiscale` | US-9 | B17 · C5 · E16 | V1 |
| `facture` | **S16** `mentions-facture` | US-9, US-12 | B16 · C4 | V1 |
| `facture` | **S17** `numeration-facture` | US-9 | B15 · E18 | V1 |
| `facture` | **S18** `emission-facture` | US-9 | B14, B18, B19 · E18 | V1 |
| `facture` | **S19** `echeance-facture` | US-9, US-10 | B18 · E9 | V1 |
| `facture` | **S20** `relance` | US-10 | B20 · E9 | V1 |

**Vingt tranches : quatorze au MVP, six en V1.** `roadmap.md` § 6 estimait 16 tranches MVP et 9 tranches V1 ; l'écart est un découpage, pas un périmètre : chaque `US-1` à `US-14` du `prd.md` § 3 a au moins une tranche, et aucune tranche ne sert une fonctionnalité hors scope. **Aucune story P3 ou P4 n'existe** : le contrat a signé sept tranches et le PRD les a toutes classées P1 ou P2 (`prd.md` § 3).

**Les trois tranches qui ne sont pas au MVP, et ce qui les bloque.** S15 à S20 portent `B14`, `B15`, `B16`, `B17`, `B18`, `B19`, `B20`. Elles sont **écrites ici** pour que la V1 ne soit pas un document vide, et **elles ne peuvent pas être planifiées** tant que trois décisions ne sont pas prises : l'égalité des montants entre devis signé et facture (Q-004, `prd.md` § 12), le taux de TVA applicable (Q-006), et le jour de la relance (B20, `prd.md` § 12). Aucun de ces trois nombres n'est inventé ici : l'architecture n'a pas le droit de trancher une question de menuisier.

### 3.2 Module `suivi`

#### Slice : **S1** `accueil-compteur`

- **Une phrase** : ouvrir l'application sur le nombre exact de devis écrits ici et pas encore envoyés, et permettre de les partager tous en un geste.
- **User stories** : US-5, US-6
- **Règles métier** : B22, B23 · C2 · E10
- **Dépend de** : F1, F2, F3, F4, F8
- **Dépendue par** : S2, S11
- **Peut être parallélisée avec** : S4, S13
- **Écran** : `suivi.md` · **Ce qui la distingue** : le compteur est en `--text-montant-geant` 44 px (`design-system.md` § 0.4), et à l'état `zero` il affiche `Aucun devis en attente d'envoi.` — jamais un `0`, jamais une illustration de victoire.

#### Slice : **S2** `liste-suivi`

- **Une phrase** : montrer les trois groupes de devis sans que Jean-Luc en ouvre un seul.
- **User stories** : US-7
- **Règles métier** : B25, B26
- **Dépend de** : F1, F2, F3, F8, S1
- **Dépendue par** : S3 (par le composant), S11
- **Peut être parallélisée avec** : S5
- **Écran** : `suivi.md` · **Ce qui la distingue** : `Écrits ici, pas encore envoyés` · `Partis, et signés` · `Validité finie ou proche`, **toujours les trois, même vides** (B26). Les fusionner en un onglet « Tous » ferait d'un devis non envoyé un élément d'une liste de trente — exactement la perte que E10 décrit.

#### Slice : **S3** `echeance-devis`

- **Une phrase** : dire qu'un devis est arrivé au terme de sa validité, et demander à Jean-Luc de prolonger, faire ressigner ou refuser — sans rien décider à sa place.
- **User stories** : US-8
- **Règles métier** : B12, B13 · E8, E15
- **Dépend de** : F1, F2, F3, F8, S6
- **Dépendue par** : S19
- **Peut être parallélisée avec** : S7
- **Écran** : `echeance.md` · **Ce qui la distingue** : l'application **repose la question à chaque ouverture** tant que Jean-Luc n'a pas choisi (E8). « Prolonger » exige une durée explicite, et le devis qu'elle prolonge **redevient à resigner** si sa signature existait.

### 3.3 Module `devis`

#### Slice : **S4** `nouveau-devis`

- **Une phrase** : commencer un devis en déposant le nom du client, hors réseau, sans demander quoi que ce soit à Jean-Luc.
- **User stories** : US-1
- **Règles métier** : B1, B12 · E13, E14
- **Dépend de** : F1, F2, F3, F8
- **Dépendue par** : S5
- **Peut être parallélisée avec** : S1, S13
- **Écran** : `devis-nouveau.md` · **Ce qui la distingue** : à l'état `partiel` de `EnTeteDevis`, **aucun numéro et aucune date** ne s'affichent — un numéro afficherait une identité qui n'existe pas encore (B1).

#### Slice : **S5** `lignes-devis`

- **Une phrase** : saisir douze lignes de travaux d'une seule main, le total visible pendant toute la frappe, et ne rien perdre si un appel coupe.
- **User stories** : US-1, US-13
- **Règles métier** : B2, B3, B4 · C1 · E2, E13
- **Dépend de** : F1, F2, F3, F8, S4
- **Dépendue par** : S6, S11
- **Peut être parallélisée avec** : S2
- **Écran** : `devis-lignes.md` · **Ce qui la distingue** : la ligne à prix zéro est **conservée et affichée** en `--color-texte-secondaire`, jamais biffée (E13) ; le retour arrière est intercepté et traité comme le bouton `Retour`, sans jamais perdre la saisie (E2).

#### Slice : **S6** `detail-devis`

- **Une phrase** : montrer le devis enregistré tel qu'il sera imprimé — total, date limite, état de sortie et sa ligne de preuve — et dire ce qu'il reste à faire.
- **User stories** : US-1, US-7
- **Règles métier** : B1, B3, B5, B10, B11 · E6, E15
- **Dépend de** : F1, F2, F3, F5, F8, S5
- **Dépendue par** : S3, S7, S12, S18
- **Peut être parallélisée avec** : aucune : c'est le sommet de la chaîne du devis.
- **Écran** : `devis-detail.md` · **Ce qui la distingue** : l'ordre des trois lignes du pied est une règle, pas un goût — **montant, échéance, état** (`design-system.md` § 2 `TotalBloc`). Le montant est la réponse à la question du client ; l'état est ce qu'il dira au téléphone.

#### Slice : **S7** `signature`

- **Une phrase** : recueillir la signature du client au doigt sur cet écran, et n'être **rien d'autre** pendant ce geste.
- **User stories** : US-2, US-14
- **Règles métier** : B9, B10, B11 · C3 · E5, E6, E7, E17
- **Dépend de** : F1, F2, F5, F8, S6
- **Dépendue par** : S8, S10, S18
- **Peut être parallélisée avec** : S3
- **Écran** : `signature.md` · **Ce qui la distingue** : l'écran n'a **ni** barre basse, **ni** en-tête, **ni** bouton de retour. E5 est tenu par l'absence de ces éléments, pas par leur désactivation. À l'état `annulee`, le tracé **reste visible, barré**, et la mention `À resigner` dit pourquoi (E6).

### 3.4 Module `sortie`

#### Slice : **S8** `choisir-sortie`

- **Une phrase** : laisser Jean-Luc choisir comment le devis sort — par courriel ou en PDF — en lançant le départ, sans jamais partir de ce que le service n'a pas confirmé.
- **User stories** : US-3
- **Règles métier** : B5, B6, B7, B9 · E3, E4
- **Dépend de** : F1, F2, F4, F5, F6, F8, S7
- **Dépendue par** : S9
- **Peut être parallélisée avec** : S10
- **Écran** : `sortie.md` · **Ce qui la distingue** : aucun des deux blocs n'est `plein` — les deux sont des sorties, et Jean-Luc choisit. Un devis non signé n'atteint jamais cette feuille (B9).

#### Slice : **S9** `confirmation-envoi`

- **Une phrase** : dire honnêtement où en est un envoi parti, et faire baisser le compteur au moment exact où le service confirme.
- **User stories** : US-3, US-6
- **Règles métier** : B6, B23 · E3
- **Dépend de** : F1, F2, F4, F6, F8, S8
- **Dépendue par** : aucune
- **Peut être parallélisée avec** : S14
- **Écran** : `sortie.md` (états `attente`, `confirme`, `echoue`) + le bandeau `FileAttente` · **Ce qui la distingue** : l'état `attente` est le plus important du produit et le plus difficile à instrumenter. Il n'affiche **ni pourcentage, ni spinner, ni « Réessayer »**, parce que rien n'a échoué et que B7 interdit le doublon ; il affiche un fait et une promesse : `N devis attendent la confirmation` et `repartiraient seuls`.

#### Slice : **S10** `partage-pdf`

- **Une phrase** : partager le devis signé en PDF sans aucun réseau, et faire dire à Jean-Luc la date à laquelle il le déclare parti.
- **User stories** : US-4
- **Règles métier** : B8 · E3
- **Dépend de** : F1, F5, F7, F8, S7
- **Dépendue par** : S14
- **Peut être parallélisée avec** : S8
- **Écran** : `partage-pdf.md` · **Ce qui la distingue** : le champ de date est **pré-rempli à la date du jour et modifiable** — s'il a partagé le devis hier dans une cave, la vérité est hier. L'état devient `parti en PDF partagé`, **jamais** `envoyé par courriel` (B8), et la preuve dit `Rien ne l'a confirmée`.

### 3.5 Module `clients`

#### Slice : **S11** `recherche-client`

- **Une phrase** : retrouver un dossier client par son nom en deux minutes, et demander lequel quand deux clients portent le même nom.
- **User stories** : US-11
- **Règles métier** : B21 · E12, E14
- **Dépend de** : F1, F2, F3, F8, S1
- **Dépendue par** : S12
- **Peut être parallélisée avec** : S5
- **Écran** : `clients.md` · **Ce qui la distingue** : les résultats apparaissent **sous le champ**, pas dans un écran différent — passer à un autre écran ferait perdre ce qui est tapé si l'appel entrant coupe. À l'état `sans-resultat`, l'application propose `Nouveau dossier pour M. Roux ?` : la recherche échoue rarement, c'est la **création** qui est souvent la bonne réponse.

#### Slice : **S12** `dossier-client`

- **Une phrase** : réunir tous les devis et toutes les factures d'un client, en séparant ce qui est parti de ce qui ne l'est pas, avec son adresse de facturation modifiable une seule fois.
- **User stories** : US-11
- **Règles métier** : B21 · E12, E14
- **Dépend de** : F1, F2, F3, F8, S6, S11
- **Dépendue par** : S14
- **Peut être parallélisée avec** : S7
- **Écran** : `dossier-client.md` · **Ce qui la distingue** : deux clients du même nom sont listés avec leur adresse complète et **aucun n'est présélectionné** (E14) — confondre deux dossiers, c'est envoyer un devis au mauvais client. La facturation **n'a pas de groupe** tant qu'il n'y a pas de facture.

### 3.6 Module `reglages`

#### Slice : **S13** `duree-validite-reglages`

- **Une phrase** : choisir une fois la durée de validité par défaut — 15, 30 ou 60 jours, 30 par défaut — et y trouver les deux exclusions que Forge ne fait pas, et le prix.
- **User stories** : US-5, US-8
- **Règles métier** : B12, B22 · C2
- **Dépend de** : F1, F2, F3, F8
- **Dépendue par** : S4, S3
- **Peut être parallélisée avec** : S1, S4
- **Écran** : `reglages.md` · **Ce qui la distingue** : `30 jours` porte la mention `recommandé`, et le défaut est écrit au lieu d'être subi. Un changement de durée **ne s'applique qu'aux devis écrits après** (B12) : S3 le dit à l'écran quand Jean-Luc tente de changer une durée déjà utilisée.

### 3.7 Module `export`

#### Slice : **S14** `export-tout`

- **Une phrase** : télécharger tous les devis et toutes les factures dans un seul fichier, à tout moment, sans rien payer.
- **User stories** : US-12
- **Règles métier** : B24 · C6
- **Dépend de** : F1, F3, F7, F8, S12
- **Dépendue par** : aucune
- **Peut être parallélisée avec** : S9
- **Écran** : `reglages.md` § 2 `PanneauExport` + `export.md` · **Ce qui la distingue** : le fichier est produit **sur l'appareil**, hors ligne, à partir du magasin local — et le `design-system.md` § 2 ne dessine aucun état d'erreur pour ce panneau, parce qu'il n'y en a pas. Aucun compte, aucun abonnement, aucune « version premium » en dessous.

### 3.8 Module `facture` (V1)

#### Slice : **S15** `question-fiscale`

- **Une phrase** : poser une seule question — « Êtes-vous assujetti à la TVA ? » — et refuser d'émettre une facture tant qu'elle n'a pas reçu de réponse.
- **User stories** : US-9
- **Règles métier** : B17 · C5 · E16
- **Dépend de** : F1, F3, F8, F9
- **Dépendue par** : S18
- **Peut être parallélisée avec** : S16, S17
- **Écran** : `question-fiscale.md` · **Ce qui la distingue** : la feuille ne se ferme pas. Il n'y a ni « Plus tard », ni « Passer sans », ni croix de fermeture ; la seule sortie est la réponse, et elle est en deux mots.

#### Slice : **S16** `mentions-facture`

- **Une phrase** : écrire sur la facture les mentions que la loi impose, sans que Jean-Luc en saisisse une seule.
- **User stories** : US-9, US-12
- **Règles métier** : B16 · C4
- **Dépend de** : F1, F7, F9
- **Dépendue par** : S18
- **Peut être parallélisée avec** : S15, S17
- **Écran** : aucun écran dédié — `design-system.md` § 0.6 refuse d'en concevoir un tant que Q-004 et Q-006 sont ouvertes. **Ce qui la distingue** : les cinq mentions de F9 sont lues par cette tranche, et elle **échoue visiblement** si l'une manque, au lieu d'émettre une facture que Jean-Luc ne pourra pas faire payer à un client qui refuse (C4).

#### Slice : **S17** `numeration-facture`

- **Une phrase** : donner à chaque facture un numéro unique, dans une séquence qui ne recule jamais et ne se répète jamais, pas même après une annulation.
- **User stories** : US-9
- **Règles métier** : B15 · E18
- **Dépend de** : F2, F3, F6, F8
- **Dépendue par** : S18
- **Peut être parallélisée avec** : S15, S16
- **Ce qui la distingue** : le numéro est tiré **sur le serveur**, dans la même transaction que l'écriture, parce que c'est le seul endroit qui survit à l'appareil (E11). Deux appels simultanés ne peuvent pas tirer le même numéro : la séquence est verrouillée par ligne.

#### Slice : **S18** `emission-facture`

- **Une phrase** : émettre la facture depuis le devis signé, en reprenant le client, les lignes et le total sans modification.
- **User stories** : US-9
- **Règles métier** : B14, B18, B19 · E18
- **Dépend de** : F2, F3, F5, F8, S7, S15, S16, S17
- **Dépendue par** : S19
- **Peut être parallélisée avec** : aucune
- **Ce qui la distingue** : **l'émission est irréversible** — la facture est insérée avec ses lignes, son texte canonique et son empreinte dans une seule transaction, puis gelée (§ 4.14). Une correction est une nouvelle facture qui cite le numéro qu'elle corrige (B19, E18). **Bloquée par** : Q-004 (`prd.md` § 12).

#### Slice : **S19** `echeance-facture`

- **Une phrase** : calculer la date limite d'une facture depuis son délai de paiement, et afficher ce qui est légalement dû quand cette date est passée.
- **User stories** : US-9, US-10
- **Règles métier** : B18 · E9
- **Dépend de** : F2, F3, F8, S18
- **Dépendue par** : S20
- **Peut être parallélisée avec** : aucune
- **Ce qui la distingue** : au-delà de l'échéance, la facture porte la date limite, le taux d'intérêt et les 40 € de frais de recouvrement (B16, C4). **Cette horloge est distincte** de la validité du devis : une facture ne peut pas expirer, elle est exigible ou en retard.

#### Slice : **S20** `relance`

- **Une phrase** : envoyer **une seule** relance par courriel pour une échéance manquée, au plus, et jamais deux fois pour la même échéance.
- **User stories** : US-10
- **Règles métier** : B20 · E9
- **Dépend de** : F2, F4, F6, F8, S19
- **Dépendue par** : aucune
- **Peut être parallélisée avec** : aucune
- **Ce qui la distingue** : la relance est une **entrée de la file d'attente** comme une autre, donc elle part sans réseau et se résout seule ; la clef d'idempotence est `(facture_numero, echeance_le)`, et non le jeton, parce que c'est l'échéance et non l'envoi qui doit être unique (B20). **Bloquée par** : le jour de la relance n'est écrit nulle part (`prd.md` § 12) — la tranche existe, le nombre n'existe pas.

---

## 4. Modèles de données

### 4.0 Un seul schéma, deux magasins

Il y a **deux magasins** et **un seul modèle**. Le SQLite de l'appareil (OPFS) et le PostgreSQL de l'hébergeur portent les mêmes tables et les mêmes colonnes, à une liste près :

| Différence | Colonnes concernées | Rôle |
|---|---|---|
| **Appareil seul** | `devis.rang_entree`, `devis.jeton_tentative`, `devis.tentative_le`, `devis.sync_etat` · `facture.rang_entree`, `facture.sync_etat` | Le `rang` et le jeton de tentative sont des ordres d'exécution **locaux** : ils n'ont pas de sens sur le serveur, qui ne se synchronise avec aucun autre appareil (`prd.md` C2). |
| **Serveur seul** | `signature_devis.recu_le` · `envoi_courriel.demande_le`, `confirme_le`, `refuse_par` · `sortie_devis.sortie_id` · `facture.emise_le` | Ce sont les faits **horodatés par le serveur**, que l'appareil ne peut pas produire. |
| **Les deux** | tout le reste, colonnes et contraintes | Une donnée écrite sur l'appareil et reçue par le serveur a la même forme des deux côtés. |

**Pourquoi un seul modèle plutôt que deux.** Un devis qui est parti doit être le **même** document des deux côtés, sinon la question « qu'est-ce qui a été signé ? » a deux réponses, et il n'y en a qu'une qui est la bonne. La différence entre les deux magasins est donc une **liste de colonnes**, pas une deuxième modèle : elle est écrite ci-dessus, elle est courte, et elle est vérifiable ligne à ligne.

**Ce que le magasin local ne fait pas.** Il ne pose pas les contraintes que PostgreSQL pose avec `plpgsql` : les déclencheurs d'immuabilité (`signature_preuve_gele`, `facture_emise_gelee`, `devis_duree_fixee`) sont des garanties **d'archive**. Sur l'appareil, la même garantie est obtenue par le code de `F3` et `F4`, et surtout par le fait que l'appareil **écrit dans une seule direction** : il n'envoie que, et il ne fusionne rien. C'est pourquoi une garde SQL qui tient côté serveur n'est pas unprotected côté appareil, et pourquoi la décision `ADR-3` existe.

### 4.1 `client`

| Champ | Type | Nullable | Défaut | Contraintes | Description | Exemple |
|---|---|---|---|---|---|---|
| `client_id` | uuid | non | `gen_random_uuid()` | clé primaire | Identifiant interne du dossier. | `3f1c…` |
| `nom` | text | non | — | `length(btrim(nom)) > 0` | Nom du client, trouvé par recherche (B21). **Jamais unique** : deux clients peuvent porter le même nom (E14). | `Roux` |
| `adresse` | text | non | — | — | Adresse de facturation du dossier. Modifiable ici, et **une seule fois** (E12). | `4 rue des Allées, 69000 Lyon` |
| `courriel` | text | non | — | — | Adresse à laquelle le devis part. Les documents suivants utilisent la version à jour. | `roux@example.fr` |
| `cree_le` | timestamptz | non | `now()` | — | Instant de création, horloge `F2` sur l'appareil. | `2026-03-28T08:41:00Z` |

### 4.2 `devis`

| Champ | Type | Nullable | Défaut | Contraintes | Description | Exemple |
|---|---|---|---|---|---|---|
| `numero` | text | non | — | clé primaire · `^D-[0-9]{4}-[0-9]{3,}$` | Identifiant unique et **définitif** : ni réattribué ni réutilisé (B1). Seul l'appareil le tire. | `D-2026-014` |
| `client_id` | uuid | non | — | clé étrangère → `client.client_id` | Le dossier client. Deux devis du même client le même jour coexistent, avec deux numéros (E14). | `3f1c…` |
| `date_document` | date | non | — | — | Date **écrite sur le document**. Elle ne bouge pas si le devis sort trois semaines plus tard (B12, E15). | `2026-03-28` |
| `duree_validite_jours` | smallint | non | `30` | `IN (15, 30, 60)` | Durée choisie par Jean-Luc, fixée avant le premier envoi (B12). **Verrouillée** ensuite — voir § 4.14. | `30` |
| `empreinte_courante` | text | oui | `NULL` | 64 hexadécimaux si non nul | Empreinte du texte **à cet instant**. C'est elle que F4 compare à l'empreinte signée pour savoir si la signature tient. | `e237b9…15e9` |
| `premier_envoi_le` | timestamptz | oui | `NULL` | — | Premier départ effectif du devis. Rend `duree_validite_jours` immuable (B12). | `2026-03-28T09:20:00Z` |
| `rang_entree` | bigint | oui | `NULL` | — | Ordre de sortie dans la file, fourni par F3. **Colonne d'appareil.** | `128` |
| `sync_etat` | text | oui | `NULL` | — | `écrit ici` · `en_attente` · `envoyé` · `pdf` · `erreur`. **Colonne d'appareil.** | `en_attente` |
| `jeton_tentative` | text | oui | `NULL` | — | Jeton tiré avant le départ, rejoué au besoin (E3, E4). **Colonne d'appareil.** | `j-7f3a` |
| `tentative_le` | timestamptz | oui | `NULL` | — | Dernière tentative, horloge F2. **Colonne d'appareil.** | `2026-03-28T09:19:00Z` |
| `horodate_le` | timestamptz | non | `now()` | — | Dernière écriture du devis. | `2026-03-28T09:19:41Z` |

**Il n'y a pas de colonne de total.** Le total est la somme des lignes : il n'existe nulle part où l'écrire à la main, donc il ne peut pas mentir sur son prix (B2, B3). La garde `G1` de la § 4.14 le prouve en tentant de l'écrire.

### 4.3 `ligne_devis`

| Champ | Type | Nullable | Défaut | Contraintes | Description | Exemple |
|---|---|---|---|---|---|---|
| `devis_numero` | text | non | — | clé étrangère → `devis.numero` | Le devis propriétaire. | `D-2026-014` |
| `rang_ligne` | smallint | non | — | clé primaire (avec `devis_numero`) · `>= 1` | Ordre d'affichage **et** ordre de sérialisation de l'empreinte. | `1` |
| `designation` | text | non | — | `length(btrim(designation)) > 0` | Désignation libre. | `Pose de trois fenêtres coulissantes` |
| `quantite` | numeric(10,2) | non | — | `>= 0` | Quantité, deux décimales. | `3.00` |
| `prix_unitaire_centimes` | bigint | non | — | `>= 0` | Prix unitaire **en centimes**. Une ligne à prix zéro est conservée (E13). | `480000` |
| `montant_centimes` | bigint | non | — | `>= 0` · `= round(quantite * prix_unitaire_centimes)` | Le produit, calculé, jamais saisi. La contrainte fait que le montant **ne peut pas** diverger de ses deux facteurs. | `1440000` |

### 4.4 `signature_devis`

| Champ | Type | Nullable | Défaut | Contraintes | Description | Exemple |
|---|---|---|---|---|---|---|
| `devis_numero` | text | non | — | clé étrangère → `devis.numero` | Le devis signé. | `D-2026-014` |
| `empreinte` | text | non | — | clé primaire (avec `devis_numero`) · 64 hex · `= empreinte_devis(texte_canonique)` | L'empreinte du texte exact au moment de la signature (B10). **La contrainte est le cœur de la garantie juridique** : la base recalcule l'empreinte du texte stocké et refuse la ligne si elle ne correspond pas. | `e237b9…15e9` |
| `texte_canonique` | text | non | — | — | Le texte signé, **congelé**. C'est l'archive de ce qui a été signé ; il est immuable (§ 4.14). | `numero=D-2026-014\|…` |
| `trace` | text | non | — | — | Le tracé du doigt, en path SVG. **Affichage seulement** : la preuve est l'empreinte, pas le dessin (C3). | `M12 210 C…` |
| `date_signee` | date | non | — | — | Date de la signature, **horloge de l'appareil** (F2). | `2026-03-28` |
| `heure_signee` | text | non | — | `^[0-9]{2}:[0-9]{2}:[0-9]{2}$` | Heure locale de la signature, à la minute près, au format 24 h. Conservée en texte parce qu'elle est **locale** : c'est 18 h 12 à Lyon, pas 18 h 12 UTC. | `09:14:00` |
| `signataire` | text | non | — | — | `Jean-Luc`. La signature est **tracée sur son appareil**, par lui (C3, `contract.md` § 3). | `Jean-Luc` |
| `recu_le` | timestamptz | non | `now()` | — | **Horloge du serveur** : quand la signature est arrivée à l'hébergeur. Deux horodatages, parce qu'un téléphone peut avoir tort. | `2026-03-28T09:14:02Z` |

### 4.5 `envoi_courriel`

| Champ | Type | Nullable | Défaut | Contraintes | Description | Exemple |
|---|---|---|---|---|---|---|
| `jeton` | text | non | — | clé primaire | Jeton de tentative, tiré sur l'appareil **avant** le départ. C'est la clef d'idempotence de la requête (E3, E4). | `j-7f3a` |
| `devis_numero` | text | non | — | clé étrangère → `devis.numero` | Le devis envoyé. | `D-2026-014` |
| `empreinte` | text | non | — | 64 hex · **unique avec `devis_numero`** | L'empreinte du texte effectivement parti. Un second envoi du même texte est **refusé par la base** (B7). | `e237b9…15e9` |
| `adresse` | text | non | — | — | Destinataire, pris dans le dossier client au moment du départ. | `roux@example.fr` |
| `demande_le` | timestamptz | non | `now()` | — | Quand le serveur a reçu la demande. | `2026-03-28T09:19:00Z` |
| `confirme_le` | timestamptz | oui | `NULL` | monotone : ne revient jamais à `NULL` | **Seule preuve de B6.** Tant qu'elle est nulle, l'écran dit `Envoi tenté …` et rien d'autre. | `2026-03-28T09:19:04Z` |
| `refuse_par` | text | oui | `NULL` | — | Ce que le service a dit s'il a refusé. **Un fait, pas un verdict** : jamais `échec`. | `boîte pleine` |

### 4.6 `sortie_devis`

| Champ | Type | Nullable | Défaut | Contraintes | Description | Exemple |
|---|---|---|---|---|---|---|
| `sortie_id` | bigint | non | identité | clé primaire | Ordre des sorties. | `7` |
| `devis_numero` | text | non | — | clé étrangère → `devis.numero` | Le devis sorti. | `D-2026-014` |
| `genre` | text | non | — | `IN ('courriel', 'pdf_partage')` | **Deux sorties, jamais confondues** (B8). | `courriel` |
| `jeton` | text | oui | `NULL` | unique · clé étrangère → `envoi_courriel.jeton` | Requis et **seulement** pour `courriel` : une sortie par courriel doit s'appuyer sur un envoi enregistré, sinon rien ne l'a confirmée. | `j-7f3a` |
| `date_declaree` | date | oui | `NULL` | requis et **seulement** pour `pdf_partage` ; interdit pour `courriel` | La date que **Jean-Luc déclare**, modifiable avant validation (B8). | `2026-03-27` |

**Cette table ne peut pas porter de confirmation.** Les deux contraintes ci-dessus rendent impossible une ligne qui serait à la fois un partage PDF et un envoi confirmé : `pdf_partage` interdit le `jeton`, et le `jeton` est la seule chose qui rattache une sortie à une confirmation. B8 n'est pas une règle appliquée par l'écran : c'est une impossibilité de stockage.

### 4.7 `configuration`

| Champ | Type | Nullable | Défaut | Contraintes | Description | Exemple |
|---|---|---|---|---|---|---|
| `cle` | text | non | — | clé primaire | Nom du réglage. | `duree_validite_jours` |
| `valeur` | text | non | — | — | Valeur du réglage. **Un réglage absent est un réglage jamais posé**, ce qui est différent d'un réglage à `faux` : c'est ainsi que E16 est bloquant et non par défaut. | `30` |

**Clés utilisées, et seulement celles-là** : `duree_validite_jours` (B12), `assujetti_tva` (B17, `oui` ou `non`), `taux_tva` (Q-006, valeur non décidée), `taux_interet_retard` (B16, valeur non décidée), `delai_relance_jours` (B20, valeur non décidée), `validite_de_signature_levee` (le devis signé n'a-t-il pas encore été envoyé).

### 4.8 `identite_emetteur`

| Champ | Type | Nullable | Défaut | Contraintes | Description | Exemple |
|---|---|---|---|---|---|---|
| `champ` | text | non | — | clé primaire · `IN ('siret_artisan', 'raison_sociale_forge', 'adresse_forge', 'telephone_forge', 'courriel_forge')` | L'une des cinq mentions de B16. | `siret_artisan` |
| `valeur` | text | non | — | `length(btrim(valeur)) > 0` | Sa valeur. **Une ligne ne porte pas de valeur vide** : un champ manquant est une ligne absente, et c'est ce qui rend le blocage comptable (cinq lignes, pas cinq attributs). | `812 345 678 00012` |

### 4.9 `sequence_facture`

| Champ | Type | Nullable | Défaut | Contraintes | Description | Exemple |
|---|---|---|---|---|---|---|
| `annee` | smallint | non | — | clé primaire | L'année de la séquence. | `2026` |
| `derniere` | smallint | non | `0` | `>= 0` | Le dernier numéro attribué pour cette année. **Ne redescend jamais** (B15). | `14` |

### 4.10 `facture`

| Champ | Type | Nullable | Défaut | Contraintes | Description | Exemple |
|---|---|---|---|---|---|---|
| `numero` | text | non | — | clé primaire · `^F-[0-9]{4}-[0-9]{4,}$` | Numéro unique, **jamais réutilisé**, pas même par une facture annulée (B15). | `F-2026-0001` |
| `devis_numero` | text | non | — | clé étrangère → `devis.numero` | Le devis signé dont elle est issue (B14). | `D-2026-014` |
| `client_id` | uuid | non | — | clé étrangère → `client.client_id` | Repris du devis, sans ressaisie. | `3f1c…` |
| `date_facture` | date | non | — | — | Date de la facture. **Distincte de `date_document`** : la validité du devis et l'échéance de la facture ne partagent pas leur point de départ. | `2026-04-10` |
| `delai_paiement_jours` | smallint | non | — | `> 0` | Le délai accordé par Jean-Luc, porté sur la facture (B18). **Ce n'est pas la durée de validité.** | `30` |
| `texte_canonique` | text | non | — | — | Le texte figé de la facture, mentions obligatoires comprises (B16). | `numero=F-2026-0001\|…` |
| `empreinte` | text | non | — | 64 hex · `= empreinte_devis(texte_canonique)` | L'empreinte de ce texte. | `faae57…6c9e` |
| `emise_le` | timestamptz | non | `now()` | — | Quand la facture a été émise. Une facture émise n'est ni modifiée ni supprimée (B19). | `2026-04-10T17:02:00Z` |
| `rang_entree` | bigint | oui | `NULL` | — | **Colonne d'appareil.** | `12` |
| `sync_etat` | text | oui | `NULL` | — | **Colonne d'appareil.** | `écrit ici` |

### 4.11 `ligne_facture`

| Champ | Type | Nullable | Défaut | Contraintes | Description | Exemple |
|---|---|---|---|---|---|---|
| `facture_numero` | text | non | — | clé étrangère → `facture.numero` | La facture propriétaire. | `F-2026-0001` |
| `rang_ligne` | smallint | non | — | clé primaire (avec `facture_numero`) · `>= 1` | Ordre d'affichage et de sérialisation. | `1` |
| `designation` | text | non | — | `length(btrim(designation)) > 0` | Désignation, reprise du devis sans modification (B14). | `Pose de trois fenêtres coulissantes` |
| `quantite` | numeric(10,2) | non | — | `>= 0` | Quantité. | `3.00` |
| `prix_unitaire_centimes` | bigint | non | — | `>= 0` | Prix unitaire en centimes. | `480000` |
| `montant_centimes` | bigint | non | — | `>= 0` · `= round(quantite * prix_unitaire_centimes)` | Le produit, calculé. | `1440000` |

### 4.12 `relance`

| Champ | Type | Nullable | Défaut | Contraintes | Description | Exemple |
|---|---|---|---|---|---|---|
| `relance_id` | bigint | non | identité | clé primaire | Ordre des relances. | `3` |
| `facture_numero` | text | non | — | clé étrangère → `facture.numero` | La facture relancée. | `F-2026-0001` |
| `echeance_le` | date | non | — | **unique avec `facture_numero`** | L'échéance manquée. **C'est elle, et non l'envoi, qui est unique** : deux tentatives pour la même échéance sont interdites (B20). | `2026-05-10` |
| `declenchee_le` | timestamptz | non | `now()` | — | Quand la relance est devenue possible, horloge F2. | `2026-05-17T07:00:00Z` |
| `envoyee_le` | timestamptz | oui | `NULL` | — | Quand elle est partie et a été confirmée. | `2026-05-17T07:00:09Z` |

### 4.13 Relations

| Entité A | Relation | Entité B | Clé étrangère | Cascade |
|---|---|---|---|---|
| `client` | 1-N | `devis` | `devis.client_id` | aucune : un dossier client survit à ses devis |
| `client` | 1-N | `facture` | `facture.client_id` | aucune |
| `devis` | 1-N | `ligne_devis` | `ligne_devis.devis_numero` | `ON DELETE CASCADE` — un brouillon supprimé n'a pas de lignes à conserver |
| `devis` | 1-N | `signature_devis` | `signature_devis.devis_numero` | aucune : la preuve survit au devis |
| `devis` | 1-N | `envoi_courriel` | `envoi_courriel.devis_numero` | aucune : un envoi est un fait passé |
| `devis` | 1-N | `sortie_devis` | `sortie_devis.devis_numero` | aucune |
| `devis` | 1-1 | `facture` | `facture.devis_numero` | aucune : plusieurs factures peuvent venir d'un même devis, si un montant change |
| `facture` | 1-N | `ligne_facture` | `ligne_facture.facture_numero` | aucune |
| `facture` | 1-N | `relance` | `relance.facture_numero` | aucune |
| `sortie_devis` | N-1 | `envoi_courriel` | `sortie_devis.jeton` | aucune |

**Les deux seules cascades du document sont sur `ligne_devis`.** Partout ailleurs, la suppression est impossible : `devis` et `facture` ne sont pas supprimables une fois écrits (§ 4.14, gardes `G8` et `G10`), donc une cascade ailleurs ne décrit rien.

**Le total n'est ni dans `devis` ni dans `facture`.** Il est une **vue**, posée dans le DDL de la § 4.14 : `SUM(montant_centimes)` par document, une seule expression, réutilisée à l'identique par `devis_total` et `facture_total`. C'est la **seule** expression qui produit un total dans le produit ; l'écran, le PDF et l'empreinte l'appellent tous les trois, et aucun des trois n'a sa propre formule (B3). La vue est écrite **après** les tables, dans le même bloc : une vue posée avant ses tables n'existe pas.

### 4.14 Contraintes en base, et preuves qu'elles tiennent

**Une contrainte écrite dans ce document n'est ni compilée, ni typée, ni exécutée : elle n'est que relue.** Trois défauts de cette sorte ont survécu à trois gates sans que personne ne les voie :

- un `CHECK` qui contient une sous-requête — **PostgreSQL le refuse à la création**, donc la contrainte n'existe pas ;
- un trigger dont la garde est inatteignable (`IF NEW.statut = OLD.statut THEN RETURN NEW` en tête) — la porte est écrite, commentée, et ne protège rien ;
- un champ que le trigger exige et que rien ne produit.

Écris le DDL, puis **exécute-le** :

```bash
node "$FORGE/scripts/ddl-exec.js" all "/workspaces/ship-clean-skills/Forge Labs/atelier"
```

Puis **chaque garde est nommée**. Le nom de l'opération interdite n'est pas deviné par le contrôle : c'est le document qui le nomme.

```sql
CREATE OR REPLACE FUNCTION empreinte_devis(p_texte text) RETURNS text
  LANGUAGE sql IMMUTABLE STRICT
  AS $$ SELECT encode(sha256(convert_to(p_texte, 'UTF8')), 'hex') $$;

CREATE TABLE client (
  client_id   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nom         text NOT NULL CHECK (length(btrim(nom)) > 0),
  adresse     text NOT NULL,
  courriel    text NOT NULL,
  cree_le     timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE devis (
  numero               text PRIMARY KEY CHECK (numero ~ '^D-[0-9]{4}-[0-9]{3,}$'),
  client_id            uuid NOT NULL REFERENCES client (client_id),
  date_document        date NOT NULL,
  duree_validite_jours  smallint NOT NULL DEFAULT 30 CHECK (duree_validite_jours IN (15, 30, 60)),
  empreinte_courante   text,
  premier_envoi_le     timestamptz,
  rang_entree          bigint,
  sync_etat            text,
  jeton_tentative      text,
  tentative_le         timestamptz,
  horodate_le          timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE ligne_devis (
  devis_numero           text NOT NULL REFERENCES devis (numero),
  rang_ligne             smallint NOT NULL CHECK (rang_ligne >= 1),
  designation            text NOT NULL CHECK (length(btrim(designation)) > 0),
  quantite               numeric(10,2) NOT NULL CHECK (quantite >= 0),
  prix_unitaire_centimes bigint NOT NULL CHECK (prix_unitaire_centimes >= 0),
  montant_centimes       bigint NOT NULL CHECK (montant_centimes >= 0),
  PRIMARY KEY (devis_numero, rang_ligne),
  CONSTRAINT ligne_montant_calcule CHECK (montant_centimes = round(quantite * prix_unitaire_centimes)::bigint)
);

CREATE TABLE signature_devis (
  devis_numero    text NOT NULL REFERENCES devis (numero),
  empreinte       text NOT NULL CHECK (empreinte ~ '^[0-9a-f]{64}$'),
  texte_canonique text NOT NULL,
  trace           text NOT NULL,
  date_signee     date NOT NULL,
  heure_signee    text NOT NULL CHECK (heure_signee ~ '^[0-9]{2}:[0-9]{2}:[0-9]{2}$'),
  signataire      text NOT NULL,
  recu_le         timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (devis_numero, empreinte),
  CONSTRAINT signature_empreinte_verifie CHECK (empreinte = empreinte_devis(texte_canonique))
);

CREATE FUNCTION signature_preuve_immuable() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'la preuve de % est immuable : elle se resigne, elle ne se reecrit pas', OLD.devis_numero;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER signature_preuve_gele
  BEFORE DELETE OR UPDATE ON signature_devis
  FOR EACH ROW EXECUTE FUNCTION signature_preuve_immuable();

CREATE TABLE envoi_courriel (
  jeton        text PRIMARY KEY,
  devis_numero text NOT NULL REFERENCES devis (numero),
  empreinte    text NOT NULL CHECK (empreinte ~ '^[0-9a-f]{64}$'),
  adresse      text NOT NULL,
  demande_le   timestamptz NOT NULL DEFAULT now(),
  confirme_le  timestamptz,
  refuse_par   text,
  CONSTRAINT envoi_un_par_empreinte UNIQUE (devis_numero, empreinte)
);

CREATE FUNCTION envoi_confirmation_aller_seule() RETURNS trigger AS $$
BEGIN
  IF OLD.confirme_le IS NOT NULL AND NEW.confirme_le IS DISTINCT FROM OLD.confirme_le THEN
    RAISE EXCEPTION 'la confirmation du jeton % ne se retire pas', OLD.jeton;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER envoi_confirmation_monotone
  BEFORE UPDATE ON envoi_courriel
  FOR EACH ROW EXECUTE FUNCTION envoi_confirmation_aller_seule();

CREATE TABLE sortie_devis (
  sortie_id      bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  devis_numero   text NOT NULL REFERENCES devis (numero),
  genre          text NOT NULL CHECK (genre IN ('courriel', 'pdf_partage')),
  jeton          text UNIQUE REFERENCES envoi_courriel (jeton),
  date_declaree  date,
  CONSTRAINT sortie_courriel_exige_jeton CHECK (genre <> 'courriel' OR (jeton IS NOT NULL AND date_declaree IS NULL)),
  CONSTRAINT sortie_pdf_exige_date CHECK (genre <> 'pdf_partage' OR (date_declaree IS NOT NULL AND jeton IS NULL))
);

CREATE TABLE configuration (cle text PRIMARY KEY, valeur text NOT NULL);

CREATE TABLE identite_emetteur (
  champ   text PRIMARY KEY CHECK (champ IN ('siret_artisan', 'raison_sociale_forge', 'adresse_forge', 'telephone_forge', 'courriel_forge')),
  valeur  text NOT NULL CHECK (length(btrim(valeur)) > 0)
);

CREATE TABLE sequence_facture (
  annee     smallint PRIMARY KEY,
  derniere  smallint NOT NULL DEFAULT 0 CHECK (derniere >= 0)
);

CREATE TABLE facture (
  numero               text PRIMARY KEY CHECK (numero ~ '^F-[0-9]{4}-[0-9]{4,}$'),
  devis_numero         text NOT NULL REFERENCES devis (numero),
  client_id            uuid NOT NULL REFERENCES client (client_id),
  date_facture         date NOT NULL,
  delai_paiement_jours  smallint NOT NULL CHECK (delai_paiement_jours > 0),
  texte_canonique      text NOT NULL,
  empreinte            text NOT NULL CHECK (empreinte ~ '^[0-9a-f]{64}$'),
  emise_le             timestamptz NOT NULL DEFAULT now(),
  rang_entree          bigint,
  sync_etat            text,
  CONSTRAINT facture_empreinte_verifie CHECK (empreinte = empreinte_devis(texte_canonique))
);

CREATE FUNCTION facture_bloquante() RETURNS trigger AS $$
DECLARE v_n integer;
BEGIN
  SELECT count(*) INTO v_n FROM identite_emetteur;
  IF v_n < 5 THEN
    RAISE EXCEPTION 'B16 : % des cinq mentions de l emetteur manquent ; aucune facture n est emise', 5 - v_n;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM configuration WHERE cle = 'assujetti_tva') THEN
    RAISE EXCEPTION 'B17 / E16 : la fiscalite n est pas tranchee ; aucune facture n est emise';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER facture_bloquee_tant_que_incomplete
  BEFORE INSERT ON facture
  FOR EACH ROW EXECUTE FUNCTION facture_bloquante();

CREATE TABLE ligne_facture (
  facture_numero         text NOT NULL REFERENCES facture (numero),
  rang_ligne             smallint NOT NULL CHECK (rang_ligne >= 1),
  designation            text NOT NULL CHECK (length(btrim(designation)) > 0),
  quantite               numeric(10,2) NOT NULL CHECK (quantite >= 0),
  prix_unitaire_centimes bigint NOT NULL CHECK (prix_unitaire_centimes >= 0),
  montant_centimes       bigint NOT NULL CHECK (montant_centimes >= 0),
  PRIMARY KEY (facture_numero, rang_ligne),
  CONSTRAINT ligne_facture_montant_calcule CHECK (montant_centimes = round(quantite * prix_unitaire_centimes)::bigint)
);

CREATE FUNCTION facture_emise_immuable() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'une facture emise n est ni modifiee ni supprimee (B19, E18) : %', OLD.numero;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER facture_emise_gelee
  BEFORE DELETE OR UPDATE ON facture
  FOR EACH ROW EXECUTE FUNCTION facture_emise_immuable();

CREATE FUNCTION ligne_facture_ajout_seul() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'une ligne de facture emise ne se modifie pas : la correction est une nouvelle facture (B19, E18)';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ligne_facture_gelee
  BEFORE DELETE OR UPDATE ON ligne_facture
  FOR EACH ROW EXECUTE FUNCTION ligne_facture_ajout_seul();

CREATE TABLE relance (
  relance_id      bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  facture_numero  text NOT NULL REFERENCES facture (numero),
  echeance_le     date NOT NULL,
  declenchee_le   timestamptz NOT NULL DEFAULT now(),
  envoyee_le      timestamptz,
  CONSTRAINT relance_un_par_echeance UNIQUE (facture_numero, echeance_le)
);

CREATE FUNCTION devis_duree_fixee() RETURNS trigger AS $$
BEGIN
  IF OLD.premier_envoi_le IS NOT NULL THEN
    RAISE EXCEPTION 'B12 : la duree de validite de % est fixee avant le premier envoi ; elle ne bouge plus', OLD.numero;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER devis_duree_fixee_apres_envoi
  BEFORE UPDATE OF duree_validite_jours ON devis
  FOR EACH ROW EXECUTE FUNCTION devis_duree_fixee();

-- Les deux vues de total. Elles sont posees APRES les tables : une vue posee
-- avant ses tables n'existe pas, et l'ordre des instructions dans un DDL
-- n'est pas une question de style.
CREATE VIEW devis_total AS
  SELECT d.numero, COALESCE(SUM(l.montant_centimes), 0)::bigint AS total_centimes
  FROM devis d LEFT JOIN ligne_devis l ON l.devis_numero = d.numero
  GROUP BY d.numero;

CREATE VIEW facture_total AS
  SELECT f.numero, COALESCE(SUM(l.montant_centimes), 0)::bigint AS total_centimes
  FROM facture f LEFT JOIN ligne_facture l ON l.facture_numero = f.numero
  GROUP BY f.numero;
```

**Données d'essai, pour que les gardes ait sur quoi mordre.** Ce bloc est du `INSERT`, pas du `CREATE` : il ne déclare pas un schéma, il en exerce un.

```sql
INSERT INTO client (nom, adresse, courriel)
  VALUES ('Roux', '4 rue des Allees, 69000 Lyon', 'roux@example.fr');

INSERT INTO devis (numero, client_id, date_document, rang_entree, sync_etat)
  VALUES ('D-2026-014', (SELECT client_id FROM client LIMIT 1), '2026-03-28', 128, 'écrit ici');

INSERT INTO ligne_devis VALUES ('D-2026-014', 1, 'Pose de trois fenetres coulissantes', 3, 480000, 1440000);
INSERT INTO ligne_devis VALUES ('D-2026-014', 2, 'Deplacement offert', 1, 0, 0);

INSERT INTO signature_devis (devis_numero, empreinte, texte_canonique, trace, date_signee, heure_signee, signataire)
  VALUES ('D-2026-014',
          'e237b9c53915c40eb3e2e25b4de28ff90cb177e328c948c05c26eeaf4be615e9',
          'numero=D-2026-014|date=2026-03-28|client=Roux|lignes=2|total=1440000',
          'M12 210 C40 120 90 240 160 130', '2026-03-28', '09:14:00', 'Jean-Luc');

INSERT INTO envoi_courriel (jeton, devis_numero, empreinte, adresse)
  VALUES ('jeton-1', 'D-2026-014',
          'e237b9c53915c40eb3e2e25b4de28ff90cb177e328c948c05c26eeaf4be615e9',
          'roux@example.fr');
```

**Les treize gardes.** Chacune nomme l'opération interdite. Si l'une de ces instructions **réussit**, la porte n'est pas une porte.

**`G1` — un total ne s'écrit pas à la main.** Il n'existe pas de colonne où l'écrire ; si cette insertion passe, c'est qu'une colonne a été ajoutée quelque part, et c'est qu'un devis peut mentir sur son prix.

```sql
-- forge:ddl-refuse
-- Un total saisi à la main doit être refusé : il n'existe aucune colonne où l'écrire.
-- Si cette instruction passe, B2 et B3 ne sont plus garantis : le total affiché
-- peut diverger du total signé, et le document ment sur son prix.
INSERT INTO devis (numero, client_id, date_document, total_centimes)
  VALUES ('D-2026-900', (SELECT client_id FROM client LIMIT 1), '2026-03-28', 999999);
```

**`G2` — une empreinte qui ne correspond pas à son texte.** C'est la seule garantie juridique du produit ; si elle passe, la signature ne prouve plus rien.

```sql
-- forge:ddl-refuse
-- Une empreinte qui ne correspond pas au texte envoyé doit être refusée.
-- Si cette instruction passe, `contract.md` § 3 « signature tracée avec l'heure,
-- la date et l'empreinte du document » devient une signature d'un texte que
-- personne n'a vérifié : C3 et B10 ne sont plus garantis.
INSERT INTO signature_devis (devis_numero, empreinte, texte_canonique, trace, date_signee, heure_signee, signataire)
  VALUES ('D-2026-014',
          '0000000000000000000000000000000000000000000000000000000000000000',
          'numero=D-2026-014|date=2026-03-29|client=Roux|lignes=2|total=1500000',
          'M12 210', '2026-03-28', '09:14:00', 'Jean-Luc');
```

**`G3` — le texte signé ne se réécrit pas.** La garde est en tête du déclencheur et n'a pas de condition d'état : elle est atteinte par **toute** mise à jour.

```sql
-- forge:ddl-refuse
-- Le texte signé ne se réécrit pas : la preuve est figée.
-- Si cette instruction passe, l'archive de ce qui a été signé peut être
-- réécrite après coup, et B11 (toute modification annule la signature)
-- cesse d'être une garantie — il ne resterait qu'une signature sans texte.
UPDATE signature_devis SET texte_canonique = 'texte modifie apres signature'
  WHERE devis_numero = 'D-2026-014';
```

**`G4` — un second envoi du même texte est refusé par la base.** Deux appuis sur `Envoyer` produisent **une** ligne, donc **un** courriel (B7, E4).

```sql
-- forge:ddl-refuse
-- Un second envoi du même devis avec la même empreinte doit être refusé.
-- Si cette instruction passe, le deuxième appui du scenario E4 produit un
-- deuxième courriel chez le client, et un doublon se corrige mal.
INSERT INTO envoi_courriel (jeton, devis_numero, empreinte, adresse)
  VALUES ('jeton-2', 'D-2026-014',
          'e237b9c53915c40eb3e2e25b4de28ff90cb177e328c948c05c26eeaf4be615e9',
          'roux@example.fr');
```

**`G5` — une confirmation ne se retire pas.** Le bandeau `FileAttente` ne propose `Réessayer` qu'à l'état `impossible` ; une confirmation qui peut disparaître rendrait cet état inatteignable.

```sql
-- forge:ddl-refuse
-- Une confirmation reçue ne se retire pas : elle est un fait du service.
-- Si cette instruction passe, un devis peut repasser de « envoyé par courriel »
-- à « écrit ici, pas encore envoyé » alors que le client a le document, et
-- B6 — la règle centrale du produit — cesse de tenir.
INSERT INTO envoi_courriel (jeton, devis_numero, empreinte, adresse, confirme_le)
  VALUES ('jeton-confirme', 'D-2026-014',
          'a237b9c53915c40eb3e2e25b4de28ff90cb177e328c948c05c26eeaf4be615e9',
          'roux@example.fr', now());
UPDATE envoi_courriel SET confirme_le = NULL WHERE jeton = 'jeton-confirme';
```

**`G6` — aucun devis n'est marqué sorti sans un envoi enregistré derrière.** C'est `sortie_courriel_exige_jeton`, et c'est ce qui rend B6 et B8 non contournables.

```sql
-- forge:ddl-refuse
-- Un devis ne peut pas être marqué sorti sans un envoi enregistré derrière lui.
-- Si cette instruction passe, il existe un chemin qui écrit « sorti » sans que
-- le service de courriel ait jamais rien su : l'écran dirait « envoyé par
-- courriel » sur une ligne que personne n'a confirmée.
INSERT INTO sortie_devis (devis_numero, genre) VALUES ('D-2026-014', 'courriel');
```

**`G7` — un partage en PDF ne peut pas porter de jeton d'envoi.** B8 : rien ne confirme un partage.

```sql
-- forge:ddl-refuse
-- Un partage en PDF ne peut pas porter de jeton d'envoi, et un envoi confirmé
-- ne peut pas porter de date déclarée. Si cette instruction passe, les deux
-- sorties peuvent se confondre et « parti en PDF partagé » peut afficher une
-- confirmation que personne n'a donnée.
INSERT INTO sortie_devis (devis_numero, genre, jeton, date_declaree)
  VALUES ('D-2026-014', 'pdf_partage', 'jeton-confirme', '2026-03-27');
```

**`G8` — aucune facture tant que la fiscalité n'est pas tranchée.** `identite_emetteur` est vide et `configuration` ne contient pas `assujetti_tva` : la garde doit le dire.

```sql
-- forge:ddl-refuse
-- Aucune facture ne peut être émise tant que la question de la fiscalité n'est
-- pas tranchée par Jean-Luc. Si cette instruction passe, E16 et C5 ne sont plus
-- garantis : une facture est émise avec une fiscalité déduite d'un document, et
-- B17 est une réponse inventée.
INSERT INTO facture (numero, devis_numero, client_id, date_facture, delai_paiement_jours, texte_canonique, empreinte)
  VALUES ('F-2026-0001', 'D-2026-014', (SELECT client_id FROM client LIMIT 1),
          '2026-04-10', 30, 'numero=F-2026-0001|devis=D-2026-014|date=2026-04-10|client=Roux|lignes=2|total=1440000',
          'faae5760dc0ff466bcb8af40a3571d9cf0426963dc393d83f2e70bc6b4c06c9e');
```

**`G9` — le total d'une facture non plus.** Le même raisonnement que `G1`, appliqué au document qui engage l'argent.

```sql
-- forge:ddl-refuse
-- Le total d'une facture n'existe pas comme colonne : il se dérive de ses lignes.
-- Si cette instruction passe, une facture peut être émise avec un total que ses
-- lignes ne donnent pas, et c'est précisément la facture fausse que le produit
-- existe pour éviter (`prd.md` § 1.1).
INSERT INTO facture (numero, devis_numero, client_id, date_facture, delai_paiement_jours, texte_canonique, empreinte, total_centimes)
  VALUES ('F-2026-0002', 'D-2026-014', (SELECT client_id FROM client LIMIT 1),
          '2026-04-10', 30, 'texte', 'faae5760dc0ff466bcb8af40a3571d9cf0426963dc393d83f2e70bc6b4c06c9e', 1);
```

**`G10` — une facture émise n'est ni supprimée ni modifiée.** B19 et E18. **La garde prépare ses propres données** : elle remplit les cinq mentions, tranche la fiscalité, crée une facture valide — et la tentative échoue ensuite.

```sql
-- forge:ddl-refuse
-- Une facture émise n'est ni supprimée ni modifiée ; une correction est une
-- nouvelle facture qui cite le numéro corrigé. Si ces instructions passent,
-- une facture partie peut être réécrite, et elle ne prouve plus ce qu'elle
-- prouvait le jour de l'envoi.
INSERT INTO identite_emetteur VALUES
  ('siret_artisan', '812 345 678 00012'),
  ('raison_sociale_forge', 'Forge SAS'),
  ('adresse_forge', '12 rue de la Fabrique, 69003 Lyon'),
  ('telephone_forge', '04 78 00 00 00'),
  ('courriel_forge', 'contact@forge.fr');
INSERT INTO configuration VALUES ('assujetti_tva', 'non');
INSERT INTO facture (numero, devis_numero, client_id, date_facture, delai_paiement_jours, texte_canonique, empreinte)
  VALUES ('F-2026-0001', 'D-2026-014', (SELECT client_id FROM client LIMIT 1),
          '2026-04-10', 30, 'numero=F-2026-0001|devis=D-2026-014|date=2026-04-10|client=Roux|lignes=2|total=1440000',
          'faae5760dc0ff466bcb8af40a3571d9cf0426963dc393d83f2e70bc6b4c06c9e');
DELETE FROM facture WHERE numero = 'F-2026-0001';
```

**`G11` — les lignes d'une facture émise sont gelées aussi.** Une porte sur l'entête ne protège rien si les lignes restent modifiables. **Cette garde prépare ses propres données**, et chaque garde le fait : une garde est jouée dans une transaction, donc ce qu'elle prépare est annulé avec elle si elle réussit à échouer — ce qui est précisément le cas.

```sql
-- forge:ddl-refuse
-- Une ligne de facture émise ne se modifie pas : la correction est une nouvelle
-- facture. Si cette instruction passe, le total affiché et le total imprimé
-- peuvent diverger après l'émission, et c'est la seule chose que B19 protège.
INSERT INTO identite_emetteur VALUES
  ('siret_artisan', '812 345 678 00012'),
  ('raison_sociale_forge', 'Forge SAS'),
  ('adresse_forge', '12 rue de la Fabrique, 69003 Lyon'),
  ('telephone_forge', '04 78 00 00 00'),
  ('courriel_forge', 'contact@forge.fr');
INSERT INTO configuration VALUES ('assujetti_tva', 'non');
INSERT INTO facture (numero, devis_numero, client_id, date_facture, delai_paiement_jours, texte_canonique, empreinte)
  VALUES ('F-2026-0001', 'D-2026-014', (SELECT client_id FROM client LIMIT 1),
          '2026-04-10', 30, 'numero=F-2026-0001|devis=D-2026-014|date=2026-04-10|client=Roux|lignes=2|total=1440000',
          'faae5760dc0ff466bcb8af40a3571d9cf0426963dc393d83f2e70bc6b4c06c9e');
INSERT INTO ligne_facture VALUES ('F-2026-0001', 1, 'Pose de trois fenetres coulissantes', 3, 480000, 1440000);
UPDATE ligne_facture SET quantite = 99 WHERE facture_numero = 'F-2026-0001';
```

**`G12` — la durée de validité se fixe avant le premier envoi.** B12.

```sql
-- forge:ddl-refuse
-- La durée de validité est fixée avant le premier envoi et ne bouge plus
-- ensuite. Si cette instruction passe, la date limite affichée peut changer
-- après coup, et B12 — « la date portée sur le document est celle qui compte »
-- — n'est plus vrai : la validité devient invérifiable.
UPDATE devis SET premier_envoi_le = now() WHERE numero = 'D-2026-014';
UPDATE devis SET duree_validite_jours = 60 WHERE numero = 'D-2026-014';
```

**`G13` — une échéance manquée ne se relance qu'une fois.** B20.

```sql
-- forge:ddl-refuse
-- La même facture n'est pas relancée deux fois pour la même échéance manquée.
-- Si cette instruction passe, B20 est rompu et un client reçoit deux relances
-- pour la même dette : c'est la limite que le contrat pose à Forge.
INSERT INTO identite_emetteur VALUES
  ('siret_artisan', '812 345 678 00012'),
  ('raison_sociale_forge', 'Forge SAS'),
  ('adresse_forge', '12 rue de la Fabrique, 69003 Lyon'),
  ('telephone_forge', '04 78 00 00 00'),
  ('courriel_forge', 'contact@forge.fr');
INSERT INTO configuration VALUES ('assujetti_tva', 'non');
INSERT INTO facture (numero, devis_numero, client_id, date_facture, delai_paiement_jours, texte_canonique, empreinte)
  VALUES ('F-2026-0001', 'D-2026-014', (SELECT client_id FROM client LIMIT 1),
          '2026-04-10', 30, 'numero=F-2026-0001|devis=D-2026-014|date=2026-04-10|client=Roux|lignes=2|total=1440000',
          'faae5760dc0ff466bcb8af40a3571d9cf0426963dc393d83f2e70bc6b4c06c9e');
INSERT INTO relance (facture_numero, echeance_le) VALUES ('F-2026-0001', '2026-05-10');
INSERT INTO relance (facture_numero, echeance_le) VALUES ('F-2026-0001', '2026-05-10');
```

**L'ordre de ces gardes est une contrainte, pas un hasard.** `G8` doit passer **avant** `G10`, parce que `G10` remplit `identite_emetteur` et `configuration` : lus dans l'autre ordre, `G8` échouerait sur une base déjà complète et la garde ne prouverait plus ce qu'elle prétend prouver. Un garde non déclaré n'est pas testé ; un garde lu dans le mauvais ordre est pire : il est testé et il ne prouve rien.

### 4.15 Ce que le magasin local pose

Le SQLite de l'appareil ne pose pas les déclencheurs `plpgsql`. Il pose le **même** DDL, moins `F8`, moins les fonctions `LANGUAGE plpgsql`, et il **ajoute** ce que le serveur n'a pas besoin d'avoir :

```sqlite
-- Le même modèle, pas un second. Ce bloc n'ajoute aucune table : il montre ce
-- que l'appareil pose en plus, et il est la seule partie du schéma propre à
-- F3. Le reste est le DDL de la § 4.14, transposé.
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;
PRAGMA synchronous = FULL;   -- prd.md § 7.2 : une coupure ne perd rien

CREATE TABLE rang_sequentiel (
  id        smallint PRIMARY KEY CHECK (id = 1),
  dernier   bigint NOT NULL DEFAULT 0
);
INSERT INTO rang_sequentiel (id, dernier) VALUES (1, 0);

-- Le rang est Compteur par le magasin, jamais par l'appelant (F3).
CREATE TRIGGER rang_suivant
  AFTER INSERT ON devis
  FOR EACH ROW WHEN NEW.rang_entree IS NULL
  BEGIN
    UPDATE rang_sequentiel SET dernier = dernier + 1 WHERE id = 1;
    UPDATE devis SET rang_entree = (SELECT dernier FROM rang_sequentiel WHERE id = 1)
      WHERE numero = NEW.numero;
  END;
```

---

## 5. Contrats API

**Six endpoints, et pas un de plus.** Le serveur n'est ni un deuxième appareil, ni une source de vérité concurrente : il **archive** ce qui est parti et **envoie** les courriels. Tout ce que Jean-Luc peut écrire se lit dans son magasin local, donc tout ce qui n'est pas « sortir un document » ou « confirmer un envoi » n'a pas besoin du réseau. C'est la forme que prend l'écriture locale d'abord (`conventions.md`) quand elle est appliquée au serveur au lieu de l'être seulement à l'écran.

**Auth — et c'est la seule chose que ce produit possède.** `prd.md` B22 interdit tout secret demandé à Jean-Luc, et C2 interdit comptes, rôles et permissions. Il faut pourtant que le serveur sache qui appelle. La réponse tient en un objet : un **jeton d'appareil** — 32 octets aléatoires, tirés une seule fois, reçus **par courriel** à l'adresse de Jean-Luc (`contract.md` § 3 : la boîte est à lui seul), conservés dans le magasin local, jamais affichés, jamais demandés. Il sert aussi de lien de retour après changement d'appareil (E11). Ce n'est pas un mot de passe : il n'est ni saisi, ni mémorisé, ni rappelable. **Sa faiblesse est assumée et écrite** : un appareil volé donne le jeton, parce qu'il n'y a pas de seconde serrure (B22). Voir § 8, risque R-03.

| En-tête | Present sur | Valeur |
|---|---|---|
| `Authorization` | tous sauf `POST /api/v1/appareils` | `Bearer <jeton-appareil>` |
| `jeton-tentative` | `POST /api/v1/devis/:numero/envoi`, `POST /api/v1/factures/:numero/relance` | Le jeton tiré **avant** le départ, rejoué au besoin (E3, E4) |

### 5.1 `POST /api/v1/appareils`

- **Méthode** : POST · **Path** : `/api/v1/appareils`
- **Auth** : `jeton-une-seule-fois` — le lien reçu par courriel le présente une fois ; l'appel sans jeton est refusé
- **Rate limit** : sans limite utile ; le plafond réel est celui de l'hébergeur

**Requête** :

```
POST /api/v1/appareils
Content-Type: application/json

{ "jeton_entree": "<celui du lien reçu par courriel>" }
```

| Paramètre | Type | Requis | Description |
|---|---|---|---|
| `jeton_entree` | string | oui | Le jeton qui figurait dans le lien reçu à l'adresse de Jean-Luc. **Il n'est pas renvoyé dans la réponse** : le serveur ne le connaît pas, il ne connaît que son empreinte. |

**Réponse (succès)** :

```json
{ "jeton_appareil": "…", "prefixe_numeros": { "annee": 2026, "dernier": 14 } }
```

| Code | Condition | Message |
|---|---|---|
| 400 | Corps illisible | `"Requête illisible"` |
| 401 | `jeton_entree` absent ou inconnu | `"Lien inconnu ou déjà utilisé"` |
| 422 | `jeton_entree` mal formé | `"Lien mal formé"` |
| 429 | Trop de tentatives | `"Trop de tentatives, réessayez plus tard"` |
| 500 | Erreur serveur | `"Erreur interne"` |

### 5.2 `POST /api/v1/numeros/reconcilier`

- **Méthode** : POST · **Path** : `/api/v1/numeros/reconcilier`
- **Auth** : bearer · **Rate limit** : sans limite utile
- **Quand** : une fois par session, au **premier contact** avec le réseau, avant que quoi que ce soit n'entre dans la file d'attente

**Requête** :

```json
{ "numeros": ["D-2026-014", "D-2026-015"], "deja_partis": ["D-2026-012"] }
```

| Paramètre | Type | Requis | Description |
|---|---|---|---|
| `numeros` | string[] | oui | Les numéros **locaux et jamais partis**. Ce sont les seuls qui peuvent entrer en collision. |
| `deja_partis` | string[] | oui | Les numéros dont le serveur a déjà la copie. Envoyés pour que le serveur n'ait rien à comparer d'inutile. |

**Réponse (succès)** :

```json
{
  "conformes": ["D-2026-014"],
  "en_conflit": [
    { "numero": "D-2026-015", "existant": "D-2026-0090", "raison": "deja_sorti" }
  ],
  "prefixe_numeros": { "annee": 2026, "dernier": 14 }
}
```

**Ce que l'appareil fait d'un `en_conflit`.** Le numéro est remplacé par un numéro frais **avant** toute entrée en file, parce que B1 dit que le numéro est définitif **et** que rien n'a encore quitté l'appareil. Si le devis concerné **était signé**, le changement de numéro change le texte canonique, donc l'empreinte : la signature ne correspond plus, le devis repasse `À resigner`, et l'écran le dit. Ce n'est pas un cas théorique : c'est E11, un devis écrit sur l'ancien appareil, retrouvé sur le nouveau.

| Code | Condition | Message |
|---|---|---|
| 400 | Corps illisible | `"Requête illisible"` |
| 401 | Non authentifié | `"Authentification requise"` |
| 422 | Un numéro ne respecte pas `D-<année>-<séquence>` | `"Numéro de devis mal formé"` |
| 429 | Trop de requêtes | `"Trop de requêtes"` |
| 500 | Erreur serveur | `"Erreur interne"` |

### 5.3 `GET /api/v1/archive`

- **Méthode** : GET · **Path** : `/api/v1/archive?depuis=<iso>&jusqu=<iso>`
- **Auth** : bearer · **Rate limit** : sans limite utile
- **Ce que c'est** : tout ce qui a quitté l'appareil depuis `depuis`, avec les empreintes et les horodatages de réception

| Paramètre | Type | Requis | Description |
|---|---|---|---|
| `depuis` | string ISO | oui | Borne basse. `1970-01-01T00:00:00Z` au premier contact. |
| `jusqu` | string ISO | non | Borne haute. Absente = maintenant. |

**Réponse (succès)** :

```json
{
  "devis": [
    { "numero": "D-2026-014", "client_id": "…", "date_document": "2026-03-28",
      "duree_validite_jours": 30, "total_centimes": 1440000,
      "empreinte": "e237b9…15e9", "texte_canonique": "…",
      "recu_le": "2026-03-28T09:19:02Z",
      "lignes": [ { "rang_ligne": 1, "designation": "…", "quantite": "3.00", "montant_centimes": 1440000 } ] }
  ],
  "factures": [],
  "curseur": { "jusqu": "2026-04-28T00:00:00Z" }
}
```

**Le `curseur` est la pièce qui rend E11 tenable.** L'archive se relit par tranches, et le dernier `jusqu` devient le `depuis` de l'appel suivant : après un changement d'appareil, Jean-Luc retrouve tout ce qui est sorti, et **rien** de ce qui ne l'est pas — ce qui est exactement ce que le PRD promet (E11, et `prd.md` § 12 : « les devis écrits ici et non envoyés restent sur l'ancien appareil »).

| Code | Condition | Message |
|---|---|---|
| 400 | `depuis` absent ou illisible | `"Date de début illisible"` |
| 401 | Non authentifié | `"Authentification requise"` |
| 422 | `depuis` postérieur à `jusqu` | `"Intervalle inversé"` |
| 429 | Trop de requêtes | `"Trop de requêtes"` |
| 500 | Erreur serveur | `"Erreur interne"` |

### 5.4 `POST /api/v1/devis/:numero/envoi`

- **Méthode** : POST · **Path** : `/api/v1/devis/:numero/envoi`
- **Auth** : bearer · **En-tête obligatoire** : `jeton-tentative`
- **Rate limit** : sans limite utile — le plafond réel est celui de l'hébergeur, et le produit ne compte pas dessus
- **Idempotence** : **totale sur `(numero, empreinte)`**, et `jeton-tentative` rend le rejeu consultable

**Requête** :

```json
{
  "client": { "nom": "Roux", "adresse": "4 rue des Allées, 69000 Lyon", "courriel": "roux@example.fr" },
  "date_document": "2026-03-28",
  "duree_validite_jours": 30,
  "lignes": [
    { "rang_ligne": 1, "designation": "Pose de trois fenêtres coulissantes", "quantite": "3.00", "prix_unitaire_centimes": 480000, "montant_centimes": 1440000 }
  ],
  "signature": {
    "empreinte": "e237b9…15e9",
    "texte_canonique": "numero=D-2026-014|date=2026-03-28|client=Roux|lignes=2|total=1440000",
    "trace": "M12 210 C40 120 90 240 160 130",
    "date_signee": "2026-03-28", "heure_signee": "09:14:00", "signataire": "Jean-Luc"
  }
}
```

| Paramètre | Type | Requis | Description |
|---|---|---|---|
| `:numero` | path | oui | `D-<année>-<séquence>`. |
| `jeton-tentative` | header | oui | Tiré avant le départ. Rejoué, il **ne produit pas un second courriel** (B7). |
| `signature.empreinte` | string | oui | SHA-256 du texte canonique. **Vérifiée côté serveur** (§ 4.14, `G2`). |
| `signature.texte_canonique` | string | oui | Le texte signé. Il est **stocké tel quel**, pas recalculé : c'est l'archive. |
| `signature.trace` | string | oui | Le tracé, pour l'affichage. Aucune valeur probante. |
| `lignes` | tableau | oui | Au moins une ligne (B1). Une ligne à prix zéro est acceptée (E13). |

**Réponse (succès)** :

```json
{ "etat": "en_attente", "jeton": "j-7f3a", "demande_le": "2026-03-28T09:19:00Z" }
```

```json
{ "etat": "confirme", "jeton": "j-7f3a", "confirme_le": "2026-03-28T09:19:04Z", "adresse": "roux@example.fr" }
```

**La deuxième réponse est celle que l'appareil attend.** Tant qu'il n'a que la première, l'écran dit `Envoi tenté … sans réponse du service` et le devis reste à `écrit ici, pas encore envoyé` (B6, E3).

| Code | Condition | Message |
|---|---|---|
| 400 | Corps illisible, ou `jeton-tentative` absent | `"Requête illisible ou jeton de tentative absent"` |
| 401 | Non authentifié | `"Authentification requise"` |
| 403 | Le devis n'est pas signé, ou sa signature a été annulée | `"Ce devis n'est pas signé"` |
| 404 | `numero` inconnu du serveur **et** absent du corps | `"Devis introuvable"` |
| 409 | Le `numero` a déjà servi à un autre devis | `"Numéro déjà utilisé"` |
| 422 | Empreinte absente, mal formée, ou **différente du SHA-256 du texte canonique reçu** | `"Empreinte et texte ne concordent pas"` |
| 422 | Aucune ligne, ou champs de ligne invalides | `"Lignes invalides"` |
| 429 | Trop de requêtes | `"Trop de requêtes"` |
| 500 | Erreur serveur, **avant** l'envoi | `"Erreur interne, rien n'a été envoyé"` |

**Le `500` ne part jamais après l'envoi.** Si une erreur survient entre la remise au service et l'enregistrement de la confirmation, la réponse est un `500` mais le serveur a tout de même **inséré** la ligne `envoi_courriel` : le rejeu du même `jeton-tentative` la retrouve, et B7 est tenu. C'est le scénario E3, et c'est pour cela que le jeton est tiré **avant** le départ.

### 5.5 `GET /api/v1/envois/:jeton`

- **Méthode** : GET · **Path** : `/api/v1/envois/:jeton`
- **Auth** : bearer · **Rate limit** : sans limite utile
- **Ce que c'est** : demander au serveur **ce qu'il est devenu** d'une tentative dont l'appareil n'a jamais eu le retour (E3). C'est une lecture, donc elle ne peut rien déclencher.

| Paramètre | Type | Requis | Description |
|---|---|---|---|
| `:jeton` | path | oui | Le jeton tiré avant le départ. |

**Réponse (succès)** :

```json
{ "etat": "confirme", "jeton": "j-7f3a", "confirme_le": "2026-03-28T09:19:04Z", "adresse": "roux@example.fr" }
```

```json
{ "etat": "refuse", "jeton": "j-7f3a", "motif": "boîte pleine", "reessayable": true }
```

**Un `404` ici est une réponse, pas une erreur** : il signifie que le serveur n'a **jamais reçu** cette tentative, donc qu'aucun courriel n'est parti, donc que le client peut réessayer avec le même jeton sans risque de doublon (B7, E4).

| Code | Condition | Message |
|---|---|---|
| 401 | Non authentifié | `"Authentification requise"` |
| 404 | Le serveur n'a jamais reçu ce jeton | `"Envoi inconnu"` |
| 429 | Trop de requêtes | `"Trop de requêtes"` |
| 500 | Erreur serveur | `"Erreur interne"` |

### 5.6 `POST /api/v1/factures` *(V1)*

- **Méthode** : POST · **Path** : `/api/v1/factures`
- **Auth** : bearer · **En-tête obligatoire** : `jeton-tentative` · **Rate limit** : sans limite utile

**Requête** :

```json
{
  "devis_numero": "D-2026-014",
  "date_facture": "2026-04-10",
  "delai_paiement_jours": 30,
  "texte_canonique": "numero=F-2026-0001|devis=D-2026-014|date=2026-04-10|client=Roux|lignes=2|total=1440000",
  "empreinte": "faae57…6c9e",
  "corrige": null
}
```

**Réponse (succès)** :

```json
{ "numero": "F-2026-0001", "emise_le": "2026-04-10T17:02:00Z" }
```

**Le numéro vient du serveur, jamais de l'appareil.** C'est le seul endroit qui survit à l'appareil (E11), donc le seul où un numéro peut être unique pour toujours. Il est tiré dans la même transaction que l'écriture, sous verrou de ligne : deux appels simultanés ne peuvent pas obtenir le même numéro (B15).

| Code | Condition | Message |
|---|---|---|
| 400 | Corps illisible ou `jeton-tentative` absent | `"Requête illisible ou jeton de tentative absent"` |
| 401 | Non authentifié | `"Authentification requise"` |
| 403 | La fiscalité n'est pas tranchée | `"La fiscalité n'est pas tranchée"` |
| 403 | Une des cinq mentions de l'émetteur manque | `"Les mentions de l'émetteur sont incomplètes"` |
| 404 | `devis_numero` inconnu, ou non signé | `"Devis signé introuvable"` |
| 409 | Une facture existe déjà pour ce devis **avec le même texte canonique** | `"Facture déjà émise"` |
| 422 | Empreinte différente du SHA-256 du texte reçu | `"Empreinte et texte ne concordent pas"` |
| 422 | `date_facture` antérieure à `date_document`, ou `delai_paiement_jours` nul | `"Date ou délai invalide"` |
| 429 | Trop de requêtes | `"Trop de requêtes"` |
| 500 | Erreur serveur, **avant** l'écriture | `"Erreur interne, aucune facture émise"` |

### 5.7 `POST /api/v1/factures/:numero/relance` *(V1)*

- **Méthode** : POST · **Path** : `/api/v1/factures/:numero/relance`
- **Auth** : bearer · **En-tête obligatoire** : `jeton-tentative`
- **Idempotence** : sur `(facture_numero, echeance_le)`, pas sur le jeton — c'est l'échéance qui doit être unique (B20)

**Requête** :

```json
{ "echeance_le": "2026-05-10", "delai_relance_jours": 7, "montant_du_centimes": 1440000 }
```

**Réponse (succès)** :

```json
{ "etat": "confirme", "relance_id": 3, "confirme_le": "2026-05-17T07:00:09Z" }
```

**`delai_relance_jours` est un paramètre, et sa valeur n'est pas écrite ici.** `prd.md` § 12 le dit : le jour de la relance n'est écrit nulle part, et une relance le jour de l'échéance part avant que le client ait eu l'occasion de payer. Le nombre appartient à `configuration.delai_relance_jours`, il est absent tant qu'il n'a pas été décidé, et `S20` ne peut pas être planifié avant. **Aucune valeur n'est inventée dans cette architecture** : ce serait exactement le « nombre qui sera implémenté deux fois différemment » que le PRD désigne.

| Code | Condition | Message |
|---|---|---|
| 400 | Corps illisible ou `jeton-tentative` absent | `"Requête illisible ou jeton de tentative absent"` |
| 401 | Non authentifié | `"Authentification requise"` |
| 404 | Facture inconnue | `"Facture introuvable"` |
| 409 | Une relance existe déjà pour cette échéance | `"Cette échéance a déjà été relancée"` |
| 422 | `echeance_le` dans le futur, ou `delai_relance_jours` absent | `"Échéance non échue ou délai de relance inconnu"` |
| 429 | Trop de requêtes | `"Trop de requêtes"` |
| 500 | Erreur serveur | `"Erreur interne, aucune relance envoyée"` |

---

## 6. Graphe de dépendances

### 6.1 Ordre d'implémentation topologique

```
Vague 0 (fondations pures — aucune dépendance entre elles) :
  ├── F1  design-system
  ├── F2  horloge
  └── F5  empreinte

Vague 1 :
  ├── F3  magasin-local        (F2, F5)
  ├── F6  sortie-courriel      (F2, F5)
  ├── F7  sortie-pdf           (F1, F5)
  └── F9  identite-emetteur    (F1)

Vague 2 :
  ├── F4  file-attente         (F2, F3, F5)
  └── S16 mentions-facture     (F1, F7, F9)      ← seule tranche avant la coquille

Vague 3 :
  └── F8  coquille             (F1, F2, F3, F4)  ← toute tranche en dépend

Vague 4 :
  ├── S1  accueil-compteur     (F8, F4)
  ├── S4  nouveau-devis        (F8, F3)
  ├── S13 duree-validite-reglages (F8, F3)
  ├── S15 question-fiscale     (F8, F3, F9)
  └── S17 numeration-facture   (F8, F3, F6)

Vague 5 :
  ├── S5  lignes-devis         (S4)
  ├── S2  liste-suivi          (S1)
  └── S11 recherche-client     (S1)

Vague 6 :
  └── S6  detail-devis         (S5, F5)

Vague 7 :
  ├── S7  signature            (S6, F5)
  ├── S3  echeance-devis       (S6)
  └── S12 dossier-client       (S6, S11)

Vague 8 :
  ├── S8  choisir-sortie       (S7, F4, F6)
  ├── S10 partage-pdf          (S7, F7)
  ├── S14 export-tout          (S12, F7)
  └── S18 emission-facture     (S7, S15, S16, S17)

Vague 9 :
  ├── S9  confirmation-envoi   (S8, F6)
  └── S19 echeance-facture     (S18)

Vague 10 :
  └── S20 relance              (S19, F4, F6)
```

**Onze vagues**, et le front matter les déclare avec leur raison. La seule chose que le plan ajoute au minimum topologique est écrit dans `impl_waves_rationale` : `F6` et `F7` sont descendues en vague 1 avec `F3` et `F9` alors que le graphe les accepterait en vague 0, parce qu'une transaction locale, un protocole d'envoi et un rendu de document ne se portent pas par la même personne.

### 6.2 Parallélisme possible

| Vague | Slices parallélisables | Pourquoi elles ne se gênent pas |
|---|---|---|
| 0 | F1, F2, F5 | Aucune dépendance : un jeton, une horloge, une empreinte |
| 1 | F3, F6, F7, F9 | Trois sujets distincts : stocker, envoyer, rendre |
| 2 | F4, S16 | `F4` est un mécanisme, `S16` un rendu de document |
| 4 | S1, S4, S13, S15, S17 | Cinq écrans différents sur un même magasin |
| 5 | S5, S2, S11 | S5 écrit, S2 et S11 lisent |
| 7 | S7, S3, S12 | Une écrit la signature, les deux autres lisent |
| 8 | S8, S10, S14, S18 | `S8` et `S10` sortent par deux voies, `S14` exporte, `S18` facturé |
| 9 | S9, S19 | Une concerne un envoi, l'autre une échéance |
| 3, 6, 10 | une seule tranche | Le chemin critique : la coquille, le détail du devis, la relance |

### 6.3 Cycles

**Aucun cycle de dépendances détecté.** Vérifié par `scripts/dependency-check.js check --write`, qui refuse d'écrire un graphe circulaire.

**Un point de contention, et il est nommé.** `F8` (la coquille) est dépendue par **dix-neuf des vingt tranches** — seule `S16` s'en passe, parce qu'elle ne produit qu'un rendu de document. C'est le seul sommet qui bloque tout, et donc le premier risque de calendrier du projet : pas le plus grave, mais celui qui transforme tout retard en retard global. Sa parade est dans la vague 3 : elle est courte, elle ne dépend que de `F4`, et elle ne peut pas être autorisée à traîner derrière les fondations de la vague 1.

**Le socle de données : `F3`.** Seize sommets en dépendent, dont **quatorze tranches** — les six qui s'en passent sont `S7`, `S8`, `S9`, `S10`, `S16` et `S20`, qui écrivent ou lisent par l'empreinte et la file plutôt que par le schéma. `F3` porte le modèle (§ 4.0) : une erreur de modèle ne se corrige pas en changeant une tranche, elle se corrige avant la vague 1.

**Le sommet le plus universellement dépendu : `F2`.** Les vingt sommets en dépendent, sans exception. Une horloge injectable mal écrite ne se voit pas dans une tranche : elle se voit dans **toutes** les tranches à la fois, et dans la démonstration de la § 10.2.

### 6.4 Le graphe, déclaré

```bash
node "$FORGE/scripts/state.js" dep "/workspaces/ship-clean-skills/Forge Labs/atelier" F1 ""
node "$FORGE/scripts/state.js" dep "/workspaces/ship-clean-skills/Forge Labs/atelier" F2 ""
node "$FORGE/scripts/state.js" dep "/workspaces/ship-clean-skills/Forge Labs/atelier" F3 F2,F5
node "$FORGE/scripts/state.js" dep "/workspaces/ship-clean-skills/Forge Labs/atelier" F4 F2,F3,F5
node "$FORGE/scripts/state.js" dep "/workspaces/ship-clean-skills/Forge Labs/atelier" F5 ""
node "$FORGE/scripts/state.js" dep "/workspaces/ship-clean-skills/Forge Labs/atelier" F6 F2,F5
node "$FORGE/scripts/state.js" dep "/workspaces/ship-clean-skills/Forge Labs/atelier" F7 F1,F5
node "$FORGE/scripts/state.js" dep "/workspaces/ship-clean-skills/Forge Labs/atelier" F8 F1,F2,F3,F4
node "$FORGE/scripts/state.js" dep "/workspaces/ship-clean-skills/Forge Labs/atelier" F9 F1
node "$FORGE/scripts/state.js" dep "/workspaces/ship-clean-skills/Forge Labs/atelier" S1 F1,F2,F3,F4,F8
node "$FORGE/scripts/state.js" dep "/workspaces/ship-clean-skills/Forge Labs/atelier" S2 F1,F2,F3,F8,S1
node "$FORGE/scripts/state.js" dep "/workspaces/ship-clean-skills/Forge Labs/atelier" S3 F1,F2,F3,F8,S6
node "$FORGE/scripts/state.js" dep "/workspaces/ship-clean-skills/Forge Labs/atelier" S4 F1,F2,F3,F8
node "$FORGE/scripts/state.js" dep "/workspaces/ship-clean-skills/Forge Labs/atelier" S5 F1,F2,F3,F8,S4
node "$FORGE/scripts/state.js" dep "/workspaces/ship-clean-skills/Forge Labs/atelier" S6 F1,F2,F3,F5,F8,S5
node "$FORGE/scripts/state.js" dep "/workspaces/ship-clean-skills/Forge Labs/atelier" S7 F1,F2,F5,F8,S6
node "$FORGE/scripts/state.js" dep "/workspaces/ship-clean-skills/Forge Labs/atelier" S8 F1,F2,F4,F5,F6,F8,S7
node "$FORGE/scripts/state.js" dep "/workspaces/ship-clean-skills/Forge Labs/atelier" S9 F1,F2,F4,F6,F8,S8
node "$FORGE/scripts/state.js" dep "/workspaces/ship-clean-skills/Forge Labs/atelier" S10 F1,F5,F7,F8,S7
node "$FORGE/scripts/state.js" dep "/workspaces/ship-clean-skills/Forge Labs/atelier" S11 F1,F2,F3,F8,S1
node "$FORGE/scripts/state.js" dep "/workspaces/ship-clean-skills/Forge Labs/atelier" S12 F1,F2,F3,F8,S6,S11
node "$FORGE/scripts/state.js" dep "/workspaces/ship-clean-skills/Forge Labs/atelier" S13 F1,F2,F3,F8
node "$FORGE/scripts/state.js" dep "/workspaces/ship-clean-skills/Forge Labs/atelier" S14 F1,F3,F7,F8,S12
node "$FORGE/scripts/state.js" dep "/workspaces/ship-clean-skills/Forge Labs/atelier" S15 F1,F3,F8,F9
node "$FORGE/scripts/state.js" dep "/workspaces/ship-clean-skills/Forge Labs/atelier" S16 F1,F7,F9
node "$FORGE/scripts/state.js" dep "/workspaces/ship-clean-skills/Forge Labs/atelier" S17 F2,F3,F6,F8
node "$FORGE/scripts/state.js" dep "/workspaces/ship-clean-skills/Forge Labs/atelier" S18 F2,F3,F5,F8,S7,S15,S16,S17
node "$FORGE/scripts/state.js" dep "/workspaces/ship-clean-skills/Forge Labs/atelier" S19 F2,F3,F8,S18
node "$FORGE/scripts/state.js" dep "/workspaces/ship-clean-skills/Forge Labs/atelier" S20 F2,F4,F6,F8,S19
node "$FORGE/scripts/dependency-check.js" check "/workspaces/ship-clean-skills/Forge Labs/atelier" --write
```

---

## 7. Décisions d'architecture (ADR)

| ID | Décision | Contexte | Options considérées | Choix | Justification | Conséquences |
|---|---|---|---|---|---|---|
| **ADR-1** | La file d'attente est ordonnée par le **rang monotone du magasin**, jamais par l'heure | Un devis signé à 9 h sur un chantier sans réseau et un devis saisi à 8 h avec réseau doivent tous deux partir, et dans un ordre que Jean-Luc peut expliquer | heure de création · date du document · rang monotone | **rang monotone** | Le rang est local, monotone et indépendant de l'exactitude de l'horloge de l'appareil, donc il est reproductible même si le téléphone se trompe de jour ; l'ordre obtenu est **l'ordre dans lequel Jean-Luc a produit ses devis**, et c'est le seul ordre qu'il puisse redire | Le `rang` est une colonne d'appareil (`devis.rang_entree`), attribuée par `F3`. Un test vérifie que l'ordre de la file est l'ordre des rangs, jamais l'ordre des horodatages |
| **ADR-2** | L'invalidation d'une entrée de la file se produit **à l'écriture du devis**, pas au moment de l'envoi | Le devis peut être modifié pendant qu'il attend le retour du service | invalider à l'envoi · invalider à l'écriture · laisser partir la version signée | **à l'écriture** | B11 annule la signature dès la première modification : la seule version qui peut sortir est celle dont l'empreinte est encore celle du devis. Attendre l'envoi rouvrirait une fenêtre où une version modifiée partirait avec l'empreinte d'une autre | `F4.invalider` porte la raison `signature annulée par une modification (B11)`. L'entrée **reste visible** avec cet état ; elle n'est pas supprimée en silence |
| **ADR-3** | **Aucun algorithme de fusion.** Le serveur archive et envoie, il ne réécrit jamais | `prd.md` C2 : un seul utilisateur, aucune équipe. Le seul multi-appareil possible est E11, après un changement d'appareil | CRDT · dernière écriture gagne avec fusion · pas de fusion | **pas de fusion** | Il n'y a qu'un écrivain, donc il n'y a rien à arbitrer. Chercher un convergent à un problème à un seul écrivain est du travail pour un risque qui n'existe pas | Le serveur tranche **le numéro** (seul registre qui survit à l'appareil) et jamais **le contenu**. Un refus du serveur devient un état visible, jamais une reprise silencieuse |
| **ADR-4** | L'envoi est idempotent sur `(numero, empreinte)`, et le jeton de tentative est tiré **avant** le départ | E3 : le réseau tombe après l'envoi, avant la confirmation. E4 : deux appuis. B7 : un seul courriel | clé d'idempotence sur `numero` · sur `jeton` · sur `(numero, empreinte)` | **`(numero, empreinte)` + jeton tiré avant** | La paire est la seule qui distingue « le même devis, le même texte » de « le même devis, un texte différent » : un devis resigné **doit** pouvoir repartir, et le nombre de tentatives ne doit pas non plus créer de doublon. La garde `G4` en est la preuve exécutée | Le rejeu du même jeton retrouve l'enregistrement existant. Un devis modifié puis resigné repart avec une **nouvelle** empreinte, donc un envoi légitime |
| **ADR-5** | Une seule horloge, en un paquet, et **trois durées distinctes** qui ne se fusionnent pas | B12 (validité 30 j), B18 (délai de paiement), B20 (relance) — `roadmap.md` § 5 interdit de les confondre | un champ `delai_jours` unique · trois champs dans une table `durees` · trois fonctions typées | **trois fonctions, trois types de retour** | Un délai unique produirait soit des devis expirés avant leur échéance, soit des relances envoyées avant que la facture soit due. Les **types de retour distincts** rendent la confusion impossible à écrire, pas seulement discouraged | `configuration` porte trois clés séparées, et `delai_relance_jours` **reste absent** tant que `prd.md` § 12 n'est pas tranché |
| **ADR-6** | L'empreinte est un SHA-256 d'un texte canonique, produit par **un paquet partagé**, et **revérifié par la base** dans un `CHECK` | B10 est la seule garantie juridique du produit (`contract.md` § 3) ; `prd.md` § 7.2 exige que la signature reste rattachée à son texte | empreinte côté serveur seulement · empreinte côté appareil seulement · canonique partagé + contrainte SQL | **canonique partagé + contrainte** | Une empreinte calculée par un code et vérifiée par un autre n'est une garantie que si les deux implémentations produisent **le même octet** : d'où un paquet unique, des centimes entiers, et aucun formatage local. La contrainte SQL est la contrepartie : elle **recalcule** et refuse, donc la base ne peut pas certifier une empreinte fausse | `packages/empreinte` est importé par l'appareil **et** par le serveur. La garde `G2` le prouve. Un test de parité compare les deux implémentations sur un jeu de cas figés |
| **ADR-7** | Un **seul modèle**, deux magasins, différenciés par une **liste de colonnes** | L'appareil et le serveur portent le même document : deux modèles, c'est deux réponses à « qu'est-ce qui a été signé ? » | deux modèles distincts · un modèle, deux jeux de colonnes · un modèle, deux moteurs de migration | **un modèle, une liste de colonnes** | La différence entre les deux magasins est alors **énumérable et vérifiable** (§ 4.0), au lieu d'être un lieu où un champ a divergé en silence | Trois déclencheurs `plpgsql` n'existent que côté archive. Sur l'appareil, la garantie est **`F3` + `F4` + le fait que l'appareil n'envoie qu'il ne fusionne** (ADR-3) |
| **ADR-8** | Le total est une **vue**, jamais une colonne | B2, B3 : le total affiché, le total imprimé et le total signé sont le même nombre | colonne `total_centimes` recalculée par trigger · colonne saisie · vue | **vue** | Une colonne peut toujours être écrite par quelqu'un qui ne connaît pas la règle : une vue n'a pas de point d'écriture. La garde `G1` tente de l'écrire et **échoue**, ce qui est la seule preuve possible d'une contrainte absente | Un seul `SUM(montant_centimes)` dans le produit. L'écran, le PDF et l'empreinte l'appellent tous les trois |
| **ADR-9** | L'export se construit **sur l'appareil**, à partir du magasin local | B24 : tout télécharger, à tout moment, sans rien payer. E11 : après un changement d'appareil | rendu du PDF sur le serveur · ZIP sur le serveur · PDF sur l'appareil | **sur l'appareil** | `design-system.md` § 2 dessine `PanneauExport` avec trois états — `inactif`, `preparation`, `pret` — et **aucun état d'erreur** : la conception dit qu'un export ne peut pas échouer. C'est vrai seulement si le rendu est local. La complétude vient de § 5.3, qui remplit le magasin local à chaque contact | L'export marche hors réseau, et il ne coûte rien à faire tourner. `S14` dépend de `F7`, pas d'un service |
| **ADR-10** | Aucun CDN, polices auto-hébergées, contexte isolé | `prd.md` C11 et `contract.md` § 3 : aucune donnée de Jean-Luc ne part chez un tiers hors hébergeur et expéditeur | polices depuis un CDN · polices auto-hébergées | **auto-hébergées** | Une police servie par un tiers voit son adresse IP à chaque ouverture, et l'isolation de contexte qu'OPFS exige (`Cross-Origin-Embedder-Policy: require-corp`) **interdit** de charger quoi que ce soit d'une autre origine. Les deux raisons convergent | Deux polices à héberger sur l'hébergeur payé, et **deux en-têtes de réponse que Forge doit pouvoir servir** (risque R-02) |

---

## 8. Risques architecturaux

| Risque | Probabilité | Impact | Mitigation |
|---|---|---|---|
| **R-01** — Deux implémentations du texte canonique divergent (navigateur et serveur), et l'empreinte vérifiée n'est plus celle qui a été signée | MEDIUM | HIGH | Un seul paquet `packages/empreinte`, importé des deux côtés ; centimes entiers, aucun formatage local ; **test de parité** qui compare les deux implémentations sur un jeu de cas figés ; et la contrainte `signature_empreinte_verifie`, qui recalcule et refuse. C'est le risque numéro un du projet : il n'attaque pas le produit, il attaque sa seule garantie juridique |
| **R-02** — L'hébergeur ne sert pas `Cross-Origin-Opener-Policy` et `Cross-Origin-Embedder-Policy`, alors qu'OPFS par poignée synchrone exige `SharedArrayBuffer` | MEDIUM | HIGH | **À vérifier avec Forge avant la vague 1.** Repli écrit : le VFS asynchrone d'OPFS, qui n'exige pas l'isolation, au prix de la vitesse d'écriture. Un repli qui marche lentement vaut mieux qu'une base qui ne s'ouvre pas ; mais le repli doit être **choisi**, pas subi. Voir ADR-10 |
| **R-03** — Le jeton d'appareil n'est connu que de l'appareil et de Forge, et B22 interdit tout second verrou | MEDIUM | HIGH | Le lien est **renvoyable** par Forge à la demande, par le numéro de téléphone que Jean-Luc a déjà (persona `Forge`). Un appareil volé donne le jeton : c'est le prix explicite de C2, et il est écrit dans `prd.md` § 8 comme un risque non levé, pas comme un risque absent |
| **R-04** — L'horloge de l'appareil est fausse, et B10 exige une heure de signature | MEDIUM | HIGH | **Deux horodatages, jamais un seul** : `signature_devis.heure_signee` (appareil) et `signature_devis.recu_le` (serveur). Les deux sont conservés, les deux sont lisibles, et **ni l'un ni l'autre n'en remplace un autre**. Si l'appareil recule d'un jour, l'écart se voit dans l'archive au lieu de disparaître. La validité du devis, elle, ne dépend pas de l'horloge : elle court depuis la date **écrite** (B12) |
| **R-05** — Le système vide OPFS, et les devis écrits ici sont perdus avec l'appareil | LOW | HIGH | `navigator.storage.persist()` demandé au premier lancement, et **son refus est remonté à l'écran** (`prd.md` § 7.2). En cas de refus assumé, la réponse n'est pas une promesse : c'est le compteur permanent (B23) et le partage en un geste. E10 est déjà écrit comme un cas qui perd, pas comme un cas que le produit couvre |
| **R-06** — La file d'attente grossit sans borne si le réseau ne revient jamais, et le bandeau devient un mensonge optimiste | MEDIUM | MEDIUM | Le bandeau dit un **nombre**, jamais un pourcentage ni une durée (`design-system.md` § 2) ; à l'état `impossible`, il propose `Réessayer maintenant`, qui est alors l'action correcte. La file est bornée par le nombre de devis non envoyés — lui aussi affiché en 44 px |
| **R-07** — La V1 ne peut pas être planifiée : Q-004, Q-006 et le jour de la relance sont ouverts (`prd.md` § 12) | HIGH | HIGH | Les six tranches S15 à S20 sont **écrites** ici pour que la V1 ne soit pas vide, et aucune ne porte de valeur inventée. Le blocage est nommé dans le § 3.1 et dans `state.json` comme point client C-001. Le MVP n'en dépend pas : `roadmap.md` § 2.0 |
| **R-08** — Le volume réel dépasse les 30 devis par an sur lesquels `contract.md` § 3 calcule le quota de courriels et le budget (Q-003) | LOW | MEDIUM | Mesuré pendant la première année. Le surplus coûte 20 €/mois au-delà de 3 000 envois ; l'architecture n'a rien à changer, elle a à mesurer. Une seule base, un seul jeu de migrations : c'est ce qui rend l'ajout d'un second client à 5,99 €/mois possible le jour où il faudrait |
| **R-09** — SQLite compilé en WASM dans un *Web Worker* est une dépendance lourde, et l'ouverture de la base à chaque écran coûterait plus qu'une écriture | MEDIUM | MEDIUM | **Une seule instance**, ouverte au démarrage, jamais par écran ; l'application ne rend rien tant qu'elle n'est pas ouverte (`design-system.md` § 2, `ListeDevis` n'a pas d'état `chargement` animé : le magasin local répond en moins d'une frame) |
| **R-10** — La démonstration Playwright ne prouve la relance que si `F2` est bien le seul lecteur de l'heure | LOW | MEDIUM | `page.clock.install()` n'intercepte que ce que la page appelle : elle substitue `Date.now`, donc **exactement** l'appel que `conventions.md` autorise. La règle `no-restricted-syntax` sur `Date.now` et `new Date` rend cette hypothèse **vérifiable au lieu deespérée** ; si elle est violée, le lint échoue avant que la démonstration ne mente |

---

## 9. Amendements

**Ce document sera cité par numéro.** Un plan de la Phase 5 écrit « selon
l'architecture § 5.4 » : ce numéro est un **contrat**.

> **Étendre, jamais renuméroter.** Ajouter une section **en fin de numérotation**
> ne casse rien. Insérer en plein milieu décale tous les numéros suivants — et
> chaque renvoi pointe alors vers une section qui existe **encore**, donc vers la
> **mauvaise**. Aucun contrôle ne voit une dérive qui résout.

| # | Amendement | Raison | Sections ajoutées | Renumérotage |
|---|---|---|---|---|
| — | Aucun à ce jour | Le document est écrit d'un bloc, avant sa première citation | — | aucun |

Un amendement ne s'édite pas dans le fichier : il s'enregistre, et la commande
**refuse** le renumérotage en nommant la dérive.

```bash
node "$FORGE/scripts/state.js" amend <anchor> architecture \
  --reason "<pourquoi cet amendement existe>" \
  --changes <fichier-listant-ce-qui-change>
```

Renuméroter quand même : `--allow-renumber --renumber-reason "<texte>"`. Cette
raison reste **dans l'état**, à côté des numéros cassés.

**Nomme tes renvois.** `` `architecture.md` § 5.4 `` dit de quel document il parle ;
un numéro de section seul ne le dit pas, et un contrôle peut le vérifier sans rien
deviner. Ce document n'a **aucun** renvoi de cette forme : les 112 renvois nus que
`consistency-check references` relève aujourd'hui sont dans les documents des
phases antérieures, pas ici.

---

## 10. Les trois décisions d'architecture, et pourquoi

> Cette section **étend** le document en fin de numérotation : elle n'a décalé
> aucun numéro, donc aucun renvoi écrit avant elle ne pointe ailleurs.

### 10.1 La file d'attente : un rang, pas une heure

**Ce qui est décidé.** L'ordre de sortie est le **rang monotone** attribué par le
magasin local au moment de l'écriture (`F3`), et rien d'autre.

**La question posée.** *Un devis signé par Jean-Luc à 9 h sur un chantier sans
réseau part-il après un devis saisi à 8 h sur un chantier avec réseau ?*

**La réponse.** **Oui, il part après** — et la raison est celle-ci : le rang dit
l'**ordre de production**, pas l'**ordre d'horloge**. Le devis de 8 h est entré dans
la file avant le devis de 9 h, donc il part avant. Aucun motif ne fait monter le
devis signé : être signé le rend **sortable**, ce qui est différent d'être urgent,
et un client qui attend une confirmation ne sera pas servi plus vite parce que son
devis passe devant un autre.

**Pourquoi pas l'heure.** Trois raisons, et la troisième est celle qui compte.
Un téléphone de chantier a une horloge que Jean-Luc ne contrôle pas ; l'usage de
`Date.now` est **interdit** hors de `F2`, donc l'heure d'écriture n'est même pas
lisible à l'endroit où l'ordre se décide ; et surtout, **B12 a déjà tranché la
question de la date** : c'est la date **écrite sur le document** qui fait foi, et
elle ne bouge pas si le devis sort trois semaines plus tard. Un ordre fondé sur
l'heure du départ ferait dépendre la file d'un fait que le PRD déclare sans
valeur. Un ordre fondé sur le rang est **reproductible** : le même magasin, le
même rang, le même ordre, que l'appareil ait ou non raison.

**Qui tranche en cas de conflit, et Jean-Luc doit-il le savoir.** Il n'y a
**pas de conflit de contenu à arbitrer**, et c'est une propriété construite, pas
un espoir : `prd.md` C2 donne **un seul écrivain**, donc il n'existe aucun
scénario où deux versions légitimes du même devis se disputent la priorité. Le
seul point qui peut se trouver en double est le **numéro** — après un changement
d'appareil (E11), parce que le numéro est tiré sur l'appareil et que l'appareil
n'emporte pas les devis non envoyés. Ce point-là, le serveur l'arbitre, parce que
son registre est le seul qui survive à la perte ; l'appareil réconcilie au
premier contact (§ 5.2), **avant** toute entrée en file, et si le devis concerné
était signé, changer son numéro change son empreinte, donc la signature tombe et
l'écran dit `À resigner`.

**Et Jean-Luc le sait-il ?** Il doit le savoir, et il n'y a pas de version de ce
produit où il ne le sache pas. Un refus du serveur ne produit **jamais** une
reprise silencieuse : il produit un état sur le devis — et l'état de sortie d'un
devis est déjà, par construction, un fait que Jean-Luc peut redire au téléphone
sans regarder l'écran (`design-system.md` § 0.2). Une architecture qui cache un
conflit ment ; celle-ci ne sait pas cacher un conflit, parce qu'elle n'en a pas
la mécanique : l'appareil n'écrit que dans une direction et ne fusionne rien
(ADR-3).

### 10.2 L'horloge : un paquet, trois durées, et une démonstration qui n'attend pas

**Ce qui est décidé.** `packages/horloge` est le **seul** module du dépôt qui
appelle `Date.now`. Il expose trois fonctions — `termeValidite`, `echeance`,
`jourRelance` — qui rendent **trois types distincts** (`DateLimite`, `Echeance`,
`DateLimite`). Les trois durées ne partagent aucun champ, aucune constante, aucun
type de retour.

**La question posée.** *Qui avance l'horloge dans les tests, et comment une
démonstration montre-t-elle qu'une relance part au bon jour sans attendre trente
jours ?*

**La réponse, en deux temps.**

*Dans les tests unitaires*, c'est `F2` lui-même : la fonction `horloge()` est
construite sur une `SourceHorloge` injectée, et Vitest fournit une source fixe.
Une propriété fast-check — « pour toute durée `d` dans {15, 30, 60} et toute date
de document `j`, `termeValidite(j, d)` vaut exactement `j + d` » — prouve les
trois durées **par arithmétique**. C'est la raison pour laquelle
`conventions.md` a choisi fast-check : sans générateur, une propriété n'est pas
testée, elle est affirmée.

*Dans la démonstration Playwright*, c'est **`page.clock`**, et la raison pour
laquelle cette question a une réponse aussi simple est architecturale :
`page.clock.install({ time })` substitue `Date.now()` **dans la page**, et
`Date.now()` n'existe **que** dans `F2`. La démonstration avance donc
l'horloge du produit sans toucher à une ligne de production et sans portillon
de test dans le code. Le scénario est court : *devis du 28 du mois, expiré le 3
du suivant* ; *facture payée à 30 jours, puis relancée* ; *le tout sans réseau*,
en ne faisant avancer que l'horloge. Ce que cette démonstration prouve dépend
entièrement de l'invariance vérifiée par le lint : si une tranche lisait
`Date.now` directement, la démonstration passerait quand même et **prouverait
rien** — c'est R-10, et c'est pourquoi la règle ESLint n'est pas une hygiène,
c'est la condition de validité de la démonstration.

**Le test qui prouve les trois durées ne se confondent pas.** Une propriété
nulle : pour toute date de document `j` et tout délai de paiement `p`,
`echeance(j + decalage, p)` ≠ `termeValidite(j + decalage, p)` dès que `p` n'est
pas la durée choisie. Une relance ne part jamais le jour où le devis expire,
parce que ce sont deux horloges qui ne partagent pas leur point de départ.

### 10.3 La preuve de signature : une empreinte, deux vérifications, un texte qui ne bouge plus

**Ce qui est décidé.** L'empreinte est le **SHA-256 du texte canonique** du
devis, calculé sur l'appareil **au moment de la signature, donc avant tout
envoi**, et revérifié **à la réception** par une contrainte SQL qui recalcule
l'empreinte du texte stocké et refuse la ligne si elle diffère.

**Où elle vit, exactement, et c'est trois endroits et non deux.**

1. **Dans la ligne `devis.empreinte_courante`** — recalculée à chaque écriture du
   devis, c'est-à-dire en permanence. C'est l'empreinte de ce que le devis est
   *maintenant*.
2. **Dans la ligne `signature_devis`** — `(empreinte, texte_canonique, date_signee,
   heure_signee, recu_le)`, **immuable** : le déclencheur `signature_preuve_gele`
   refuse toute mise à jour et toute suppression. C'est l'empreinte de ce que le
   devis *était* quand le client a signé.
3. **Dans le PDF**, imprimée en bas du document, en police à chasse fixe
   (`design-system.md` § 2, slot `empreinte`) — donc sur le papier que le client
   emporte, et pas seulement dans l'application.

**Que se passe-t-il si le texte du devis change après la signature.** Trois
réponses, à trois moments, et aucune n'est une reconstruction :

*À l'écriture*, dans la même transaction que la modification : `F4.invalider`
compare `empreinte_courante` et `signature_devis.empreinte`. Elles diffèrent →
l'entrée de la file est invalidée avec la raison `signature annulée par une
modification (B11)`, la signature passe à l'état `annulee`, le tracé **reste
visible, barré**, et le devis ne peut plus ressortir (B9, E6).

*À la signature suivante*, Jean-Luc signe à nouveau : une **nouvelle** ligne
`signature_devis` est écrite, avec une empreinte différente. La clé primaire
`(devis_numero, empreinte)` rend les deux lignes **cumulables**, donc l'archive
garde la chaîne complète de ce qui a été signé, et dans quel ordre.

*À la réception*, si malgré tout une empreinte et un texte discordants
arrivaient — un bogue, ou une charge utile falsifiée — la contrainte
`signature_empreinte_verifie` **refuse l'insertion** et le serveur répond `422`.
La garde `G2` de la § 4.14 est exactement cette tentative, exécutée par
PostgreSQL : elle échoue.

**Pourquoi c'est la seule garantie juridique, et pourquoi elle tient.** C'est la
seule, parce que `contract.md` § 3 achète une **signature tracée à 0 €** et
exclut la qualifiée à 1 à 3 € par devis : rien d'autre dans ce produit ne prouve
quoi que ce soit à un tiers. Et elle tient parce que l'empreinte est calculée
par **un paquet** partagé par l'appareil et le serveur, sur des centimes entiers,
et revérifiée par la base — trois occasions de se tromper, dont deux
indépendantes du code qui écrit le document. Si le texte change, la signature
**cesse d'exister** au lieu de désigner autre chose : c'est la seule manière
honnête de faire, et c'est exactement ce que B11 énonce.

---

## Check list de gate

- [x] Chaque user story du PRD a une slice correspondante — les quatorze `US-1` à `US-14` sont portées par S1 à S14 (§ 3.1).
- [x] Chaque slice a une responsabilité claire et nommable en une phrase — les vingt sont en gras et commencent par un verbe.
- [x] Les fondations sont identifiées et isolées des slices métier — neuf fondations, `F1` à `F9`, et cinq exigences transverses explicitement **absentes**, chacune avec la règle qui l'interdit (§ 2.10).
- [x] Tous les modèles de données sont définis champ par champ — douze entités, et une liste de colonnes qui distingue les deux magasins (§ 4.0).
- [x] Tous les endpoints API listent leurs codes d'erreur de manière exhaustive — six endpoints, 400/401/403/404/409/422/429/500 selon le cas (§ 5).
- [x] Le graphe de dépendances est sans cycle.
- [x] L'ordre d'implémentation est cohérent avec les dépendances — onze vagues, déclarées dans le front matter avec leur raison.
- [x] Les décisions d'architecture non triviales sont documentées en ADR — dix, dont les trois du § 10.
- [x] `ddl-exec all` passe : PostgreSQL accepte le DDL (33 instructions), et les treize gardes déclarées tiennent.
- [x] `consistency-check references` : **zéro** renvoi cassé, **zéro** renvoi nu dans ce document. Les 111 renvois nus restants sont dans les documents des phases antérieures ; ce document nomme tous les siens.

**Trois points que ce document refuse de cocher, et un dont il n'est pas en faute.**

- Les trois décisions de `prd.md` § 12 (Q-004, Q-006, le jour de la relance) restent ouvertes, et **aucun nombre n'a été inventé** pour les contourner : la V1 est écrite, pas planifiable.
- Le risque R-02 doit être vérifié avec Forge **avant** la vague 1, parce qu'il touche un hébergement déjà payé.
- `consistency-check all` échoue sur **`premises`**, et l'échec n'est pas de ce document : `prd.md` définit **C2, C3, C7, C8 et C9 deux fois** — une fois en § 5 « Contraintes », une fois en § 9 « Hors scope ». Toute citation de ces cinq identifiants est donc ambiguë, y compris celles de ce document, et il en va de même pour `roadmap.md` et `conventions.md`. C'est un défaut de la Phase 1, à corriger par le protocole d'impact et non par une retouche ici.

**Statut** : `draft` → en attente de validation.