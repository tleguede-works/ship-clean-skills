---
type: screen
slug: definitions
title: Référentiel des définitions
module: definitions
status: approved
generated_at: 2026-09-30
derived_from:
  - .forge/prd.md
  - .forge/design/design-system.md
rule_ids:
  - B1
  - B2
  - B3
  - B4
  - B17
  - B22
  - B26
edge_case_ids:
  - E4
  - E8
  - E15
flow: liste-definitions
---

# Écran — Référentiel des définitions

> Ce document est la **source de vérité** pour qu'une IA génère l'interface de cet écran.
> Il est généré depuis `templates/screen.md.tmpl`, jamais recopié. Aucun placeholder ne doit subsister.

---

## 1. Rôle de l'écran

| | |
|---|---|
| **Archétype d'app** | `dashboard` (boucle produit) ; surface de **référentiel** conforme aux standards `admin_crud` (`references/archetypes.md` §5) — table par défaut, tri, filtre, recherche, **sélection multiple**, actions groupées, états de ligne lisibles sans clic |
| **Module** | `definitions` — rang **3** dans la navigation (`state.json → index.nav`, design-system §3.2) |
| **Route** | `/definitions` — paramètres d'état dans la query string : `?q=&proprietaire=&etat=&version=&tri=&page=` |
| **Type** | `page` — layout « page standard » (design-system §4.2) : sidebar 240 px + contenu sur grille 12 colonnes |
| **Utilisateurs** | **Contrôleur de gestion** (usage principal —US-1, US-2) ; **directeur de site** (signataire désigné, qui vient ici pour trouver ce qui l'attend, une fois par mois) |
| **User stories servies** | US-1, US-2, US-17 |
| **Règles métier** | B1, B2, B3, B4, B17, B22, B26 |
| **Edge cases** | E4, E8, E15 |

**Une phrase** : cet écran permet au contrôleur de gestion de **retrouver chaque définition d'indicateur et son état de signature sans les connaître par cœur**, afin de savoir ce qui est officiel, ce qui ne l'est pas, et ce qui attend sa signature.

**Pourquoi il est au rang 3 de la navigation** : centralité 5, fréquence 2. C'est le **cœur du produit** — B1 (une définition, des versions) et B2 (la signature par un tiers) sont les deux règles sans lesquelles aucun chiffre du produit n'est opposable. Mais **seul le contrôleur de gestion l'ouvre**, une fois par semaine, quand il écrit ou fait relire ; le directeur de site y passe une fois par mois, le temps d'une signature. Le placer au rang 1 ou au rang 2 aurait mis l'outil du rare au-dessus de la lecture quotidienne (`indicateurs`, fréquence 5) et au-dessus du support de comité (`tableau-de-bord`, fréquence 4) : c'est exactement l'erreur que design-system §3.2 refuse, et le rang 3 est le plus haut rang qui n'oppose pas la gouvernance à la boucle.

> **Cet écran alimente la boucle, il n'en est pas le centre.** Sans lui, la signature (US-2) n'a **pas d'entrée** : le contrôleur écrit une version dans `/definitions/nouvelle`, le signataire doit la retrouver par où ? Le formulaire et la modale de signature existent ; il manquait le **lieu d'où on part**. C'est le trou que ce document ferme, et c'est la raison pour laquelle il est écrit avant toute question deé.
>
> L'ordre des trois écrans du module est donc : **`/definitions` (trouver) → `/definitions/nouvelle` ou `/definitions/[slug]` (écrire) → `/definitions/[slug]/signature` (conclure)**. Le retour du formulaire et de la modale est ici, avec les filtres conservés dans l'URL.

---

## 2. Direction visuelle de cet écran

Repris du design system — **valeurs concrètes, jamais « à définir »**.

| | |
|---|---|
| **Mood** | dense, sourcée, non décorative — ici « dense » est une exigence de l'archétype : un référentiel se lit ligne à ligne, et une ligne qui doit être cliquée pour savoir si elle est valable est une ligne ratée |
| **Densité** | **dense** — `DataTable` variante `reference`, **densité `md`** : hauteur de ligne **32 px**, en-tête 28 px, `--space-md` (8 px) de padding horizontal de cellule, `--space-lg` (12 px) entre la barre de filtres et la table. Justification : un contrôleur de gestion doit comparer 7 définitions en une seule image, et le directeur de site doit voir d'un coup d'œil combien l'attendent. Une ligne `sm` (24 px) ferait tenir 12 lignes mais ferait descendre le texte de l'état sous 11 px ; une ligne `lg` n'en tiendrait que 5. `md` est le point où l'état de signature reste lisible **sans zoom**. |
| **Niveau de contraste** | **fort** — justification : c'est un écran de **contrôle**, pas de lecture. L'état d'une ligne est une affirmation qui sera opposée en comité (« vous m'avez dit que c'était signé »). Aucun état n'est porté par la seule couleur (PRD 7.3), et le texte d'état est en 13 px `--text-body-sm` ou 11 px `--text-overline` **sur le fond de badge épinglé du composant** (`design-system` § 2.7) — règle dont le calcul est dans le contrat `DataTable`, et dont les rapports de cet écran sont mesurés en § 7.1. |
| **Surface** | `--color-surface` `#E9EDEB` (en-tête de table, barre de filtres) sur `--color-background` `#F2F4F3` (page et lignes) ; lignes alternées `--color-ink-100` `#E4E8E6` ; badges d'état sur `--color-surface-raised` `#F7F9F8`, sauf « signée » sur `--color-accent-subtle` `#D3E4E2` et « refusée » sur `--color-out-of-band-subtle` `#F6E1DE` ; champs de saisie et de filtre en `--color-surface-sunken` `#DEE3E1`. Séparation par filets : `--color-border-strong` `#7E8A85` pour les lignes de la table (3,24:1, exigence 1.4.11), `--color-border` `#C9D0CD` pour le chrome. **Jamais d'ombre** sur une ligne, une colonne ou un badge. |
| **Accent utilisé** | `--color-accent` `#0F5C57` — **cinq usages, et pas un de plus** : (1) liseré 3 px à gauche de la ligne dont la définition courante est signée, (2) couleur et fond du badge « signée », (3) les liens de cellule (intitulé, « Ouvrir », « Signer la v3 »), (4) l'anneau de focus, (5) la case de sélection multiple et le fond de la ligne sélectionnée (`--color-accent-subtle` `#D3E4E2`). **Le liseré de la ligne sélectionnée est supprimé** : sélection et signature ne se confondent jamais, sinon on ne sait plus laquelle des deux est sélectionnée. |
| **Traitement photographique** | **AUCUN** — pas d'image, pas de dégradé, pas de mascotte, pas d'icône décorative. Les seules icônes de l'écran sont celles des **états de ligne** du composant (`design-system` § 2.7, sept icônes), plus `search` dans le champ de recherche : chacune est liée à un état nommé et disparaît avec lui (anti-références du design system §0). |
| **Référence** | l'écran de gestion d'un référentiel normatif — le sommaire d'une nomenclature d'entreprise, avec sa colonne « en vigueur », son filtre par responsable et son bandeau de non-conformités. **Pas** un tableau générique de back-office SaaS : pas de colonne « actions » à trois points, pas de pagination « 1 2 3 … 7 » sans compte, pas de cases cochées sans libellé. |

### 2.1 Anti-générique — obligatoire

Cet écran ne doit ressembler **à aucun** de ces défauts :

- [x] **Pas de fond blanc pur `#FFFFFF` par défaut.** — Le fond de page est `--color-background` `#F2F4F3` ; l'en-tête de table `#E9EDEB` ; les lignes alternées `#E4E8E6` ; les champs `#DEE3E1` ; les badges `#F7F9F8`. Cinq valeurs distinctes, aucune n'est un blanc par défaut. Un référentiel sur fond blanc est un tableur — et le tableur est précisément l'anti-référence du produit (design-system §0 : « le tableur partagé, un onglet par personne, des chiffres partout »).
- [x] **Pas de carte ombrée pour tout.** — `--shadow-none` sur toute la page, y compris sur la barre de filtres et sur le `BulkBar`, qui sont posés sur le fond par un filet `--color-border` et non par une surface flottante. Le tableau **n'est pas** dans une carte : il est dans la page. Deux ombres seulement existent ici, et aucune n'est décorative : `--shadow-sm` sur la liste déroulante du `owner-picker` de filtre (élément flottant) et `--shadow-md` sur la modale de signature quand elle s'ouvre depuis une ligne.
- [x] **Pas d'uniformité** : la hiérarchie vient d'un rapport d'échelles typographiques, pas d'un espacement constant. — `--text-h1` 24 px (le module) → `--text-h2` 18 px (le compte d'action, seul élément en 18 px de la page) → `--text-body` 14 px (intitulé de définition) → `--text-body-sm` 13 px (badge d'état) → `--text-overline` 11 px (en-têtes de colonne) → `--text-caption` 12 px (slug, dates, noms, motifs). L'espacement, lui, est volontairement **irrégulier** : 8 px entre les champs d'un même groupe, 12 px entre la barre de filtres et le tableau, 24 px avant le `BulkBar`, 32 px de marge de page. L'irrégularité est typographique et fonctionnelle, elle n'est pas décorative.
- [x] **Pas de gris neutre générique `#6B7280` par défaut.** — Aucun `#6B7280` dans l'écran. Chaque gris a une signification, aucun n'est hérité d'une palette générique : `--color-text-primary` `#2C3633` (le texte qui porte une information), `--color-text-secondary` `#4F5C57` (noms, dates de écriture — le second est *choisi*, il est à 6,33:1 sur le fond, § 7.1), `--color-stale` `#746A5E` (projet, valeur figée, **et propriétaire inactif** — le seul recouvrement autorisé, `design-system` § 2.7), `--color-source-unavailable` `#5B5B63` (froid : l'API du référentiel est injoignable), `--color-text-disabled` `#9BA6A2` (action impossible, jamais une information). Et le gris chaud `--color-unknown` `#7A6A3C` pour ce qui n'est ni bon ni mauvais : l'attente, la version modifiée, le périmètre vide.
- [x] **Pas de mise en page centrée symétrique.** — Sidebar 240 px à gauche, barre de filtres **calée à gauche** sur la grille de 12 colonnes, titre et compte alignés à gauche, `BulkBar` et `ProvenanceStrip` pleine largeur. La seule chose centrée sur l'écran est le texte d'un motif de refus tronqué dans sa cellule — et il est tronqué, pas centré. Aucune largeur `max-width` centrée, aucun `margin: auto` sur le contenu.
- [x] **Pas d'illustration d'appoint générique** à la place d'une vraie hiérarchie. — L'état « aucune définition déclarée » affiche les **cinq champs obligatoires nommés** (intitulé, formule, périmètre, propriétaire, signataire) et le bouton « Déclarer une définition », pas une icône dans un cercle, pas un cadre vide dessiné, pas un dégradé abstrait. L'état « 0 ligne pour ces filtres » affiche le **récapitulatif des filtres actifs sous forme de chips retrievables** (un par filtre, chacun avec sa croix), parce que la seule information utile quand un filtre ne renvoie rien est « lequel ». Aucun emoji, aucune mascotte.
- [x] **Pas d'une seule famille de police** si la hiérarchie demande du contraste. — Deux familles assumées : `--font-sans` (`Inter Variable`) pour les intitulés et les libellés, `--font-mono` (`ui-monospace`, chasse fixe) pour **tout ce qui sert à comparer** : numéro de version (`v3`), slug, dates de dernière écriture et de signature, nom du signataire, motifs de refus, identifiant de périmètre, compte de lignes résolues, identifiants de `source_ref` dans le `ProvenanceStrip`. C'est ce qui rend deux lignes de la colonne « Version » alignables et deux horodatages de la colonne « Dernière écriture » alignables : un nom de personne en chasse proportionnelle est illisible, un nom en mono se compare.

**Choix assumé et non neutre** :

1. **La réponse à « qu'est-ce qui m'attend ? » précède la réponse à « qu'est-ce qui existe ? ».** Le tri par défaut n'est **ni alphabétique, ni par date** : il place en tête les lignes qui réclament une action de la personne connectée, selon l'ordre de § 4.2. Le compte correspondant est **écrit dans le titre de la page**, pas dans une pastille, pas dans un toast : « **7 définitions · 2 attendent une signature · 1 sans propriétaire actif** ». Le tri est écrit à côté, dans la même phrase : « tri : action requise d'abord ». Un écran générique trie par nom et affiche un total ; celui-ci trie par **charge de travail** et nomme le total **décomposé en ses causes**, parce que c'est la seule décomposition qui produit une décision. Corollaire assumé : **une définition dont le propriétaire est inactif est comptée dans le compte d'action même si sa signature est valide** — c'est la seule ligne que le contrôleur de gestion peut corriger seul, sans attendre personne.
2. **Un état de ligne porte toujours la couleur de sa cause, dans la colonne de sa cause.** Il n'existe pas de colonne unique « Statut » qui empile cinq badges. L'état de signature vit dans la colonne **État de signature** ; `propriétaire inactif` (B17) vit dans la colonne **Propriétaire**, à côté du nom de la personne qui ne répond plus ; `périmètre résolu vide` (E15) vit dans la colonne **Périmètre**, à côté du compte de lignes. Trois conséquences, toutes voulues : une ligne peut porter **deux** états sans qu'ils se recouvrent, on sait **qui** est la cause sans ouvrir la ligne, et un lecteur qui balaye la colonne « Propriétaire » voit d'un coup toutes les défaillances de gouvernance de l'entreprise — ce que le trustee d'un référentiel passe sa journée à repairing. Un écran générique aurait mis les cinq dans une colonne et aurait rendu la cause invisible.

---

## 3. Anatomie

```
chrome — layout design-system §3.1 et §4.2 « page standard »
│
├── SideNav 240 px — design-system §3.2
│   └── entrée « Définitions » : libellé + filet --color-accent 3 px à gauche
│       (4 entrées, aucune réservée à un module futur — pas d'overflow)
│
├── Breadcrumb — design-system §3.3, toujours visible → « Définitions »
│
├── PageHeader  filet --color-border en pied, PAS de carte, PAS d'ombre
│   ├── Text[h1]   « Définitions »
│   ├── Text[h2]   compte d'action, décomposé en ses causes — jamais un total seul :
│   │               « 7 définitions · 2 attendent une signature · 1 sans propriétaire actif »
│   ├── Text[caption]   le tri par défaut est écrit avec lui, pas caché dans un menu :
│   │                  « tri : action requise d'abord, puis dernière écriture »
│   └── Button[primary]  « Déclarer une définition »  →  /definitions/nouvelle
│
├── FilterBar   une rangée, repliée sur deux lignes sous 1025 px, sur fond de page
│   ├── FormField[text]        Recherche
│   │     → indice sur : intitulé · formule · périmètre · slug · propriétaire · signataire
│   ├── FormField[owner-picker] Propriétaire        — B3 : annuaire, saisie libre INTERDITE
│   ├── FormField[select]       État de signature    — les 7 états de design-system § 2.7, cases à cocher
│   ├── FormField[select]       Version              — courante · toutes · signées · en attente
│   └── Button[ghost]           « Réinitialiser les filtres »  — rendu SEULEMENT si ≥ 1 filtre
│
├── BulkBar   une rangée de 40 px, apparaît SEULEMENT si sélection ≥ 1
│   ├── Text[body-sm]   « 3 définies sélectionnées »
│   ├── Button[secondary]  Demander une relecture              (n)  — § 5
│   ├── Button[secondary]  Dupliquer comme base d'une v+1       (n)  — § 5
│   ├── Button[secondary]  Exporter la sélection en CSV         (n)  — § 5
│   ├── BulkRationale    ligne permanente, NON dismissible, --text-caption :
│   │                    « la signature n'est pas une action groupée : B2 exige un
│   │                      signataire nommé par version. Signer 3 versions d'un coup
│   │                      revient à signer 3 règles qu'on n'a pas lues. »
│   └── Button[ghost]   Tout désélectionner
│
├── DataTable  variant="reference"  density="md"   hauteur de ligne 32 px
│   ├── thead  fond --color-surface #E9EDEB, filet bas --color-border-strong (3,03:1)
│   │   ├── th[scope=col]  ☐  case de sélection multiple, libellé accessible « tout sélectionner »
│   │   ├── th  Indicateur          (tri ⇅)  — largeur libre, la plus grande
│   │   ├── th  Propriétaire        (tri ⇅)  — colonne de la cause B17
│   │   ├── th  Périmètre           (tri ⇅)  — colonne de la cause E15
│   │   ├── th  Version             (tri ⇅)  — mono, largeur fixe 64 px
│   │   ├── th  État de signature   (tri ⇅)  — tri par défaut, la plus lisible
│   │   └── th  Dernière écriture   (tri ⇅)  — mono, largeur fixe 148 px
│   ├── tbody
│   │   └── tr   (liseré gauche 3 px = signature en cours ET propriétaire actif)
│   │       ├── td  ☐  case de la ligne
│   │       ├── td  a[href="/definitions/{slug}"]  intitulé --text-body
│   │       │       + slug en mono --text-caption sur la 2e ligne
│   │       ├── td  OwnerCell   — nom nommé en 13 px (B3)
│   │       │       └── OwnerBadge  « propriétaire inactif » — B17, E8 — rendu 5 de design-system § 2.7
│   │       ├── td  ScopeCell  — libellé du périmètre 13 px
│   │       │       + mono « 1 284 lignes », ou :
│   │       │       └── ResolutionBadge  « périmètre résolu vide » — E15
│   │       ├── td  mono  v3
│   │       ├── td  SignatureBar[signed|in_review|draft|refused]  — rendus 1 à 4 de § 2.7
│   │       │       └── SignatureBar[in_review]  2e badge, E4 :
│   │       │           « v2 signée · v3 en attente » + « 2 tableaux sur v2 »
│   │       ├── td  mono  21/09/2026 · N. Ferrand
│   │       └── td  RowActions  « Ouvrir » · « Signer la v3 » — UNE version à la fois
│   └── tfoot  pagination serveur, 25 lignes par page, compte exact :
│              « 7 définies · page 1 sur 1 · 2 masquées par vos filtres »
│
└── ProvenanceStrip  fixe en bas de page — design-system §2, PAS un tooltip
    ├── segment permanent  : « une définition est une métadonnée : elle n'est jamais
    │                         lue dans l'entrepôt, et l'entrepôt n'est jamais écrit »
    └── segment contextuel : au clic ou au focus d'une ligne, SANS navigation :
                              version · propriétaire · auteur · signataire · date de
                              signature · motif de refus · n° de lignes résolues ·
                              n° de tableaux de bord et d'exports rattachés à CETTE version
```

| # | Composant | Rôle | Source |
|---|---|---|---|
| 1 | `SideNav` + `Breadcrumb` | chrome, position du module (rang 3), fil d'Ariane | design-system §3.1, §3.2, §3.3 |
| 2 | `PageHeader` + compte d'action | nommer la **charge de travail** en toutes lettres, pas un total | slice-local — texte sur fond de page, aucun conteneur |
| 3 | `FormField[text]` (recherche) | trouver une définition **par sa règle** (formule, périmètre), pas seulement par son nom | design-system §2 `FormField` |
| 4 | `FormField[owner-picker]` (filtre propriétaire) | filtrer par une personne **nommée** ; aucun nom libre (B3) | design-system §2 `FormField`, variante `owner-picker` |
| 5 | `FormField[select]` (état, version) | restreindre aux états de `design-system` § 2.7 ; l'état est un filtre de première classe, pas une decoration | design-system §2 `FormField`, variante `select` |
| 6 | `BulkBar` | les **actions groupées** exigées par `admin_crud`, et la ligne qui dit pourquoi la 4ᵉ n'existe pas | slice-local — filet + fond de page, jamais une carte flottante |
| 7 | `DataTable[reference]` densité `md` | table, tri, filtre, recherche, **sélection multiple**, états de ligne sans clic | design-system §2 `DataTable`, variante `reference`, **§ 2.7** |
| 8 | `SignatureBar` | **dans une colonne** : l'état de signature de la version courante, en 4 rendus, plus le rendu composite E4 | design-system §2 `SignatureBar`, rendus 1 à 4 et 6 de § 2.7 |
| 9 | `OwnerBadge` | B17 / E8 : plus personne ne répond de cette définition | slice-local — **instance** du rendu 5 de § 2.7 : `--color-stale` sur le fond de badge épinglé. Ce n'est pas un composant, c'est un état |
| 10 | `ResolutionBadge` | E15 : le périmètre ne résout plus aucune ligne. **Jamais un `0`** | slice-local — **instance** du rendu 7 de § 2.7 |
| 11 | `ProvenanceStrip` | au clic d'une ligne : qui a écrit quoi, qui a signé, sur quelle version, et ce qui reste rattaché à cette version (B22) | design-system §2 `ProvenanceStrip` |
| 12 | `RowActions` | `Ouvrir` et `Signer la v3` — jamais un menu « … », jamais un « signer » pluriel | slice-local |
| 13 | `PaginationFooter` | 25 lignes/page, **compte exact** de ce qui est filtré | slice-local — texte `--text-caption` |

> Aucun composant n'est inventé pour cet écran. `OwnerBadge` et `ResolutionBadge`
> sont des **instances de badge d'état** : les états qu'elles portent sont ceux de
> `design-system` **§ 2.7**, et le design system est leur autorité. Les ajouter
> comme composants serait une erreur — ce sont des usages du vocabulaire d'état,
> pas des objets. Le vocabulaire lui-même **n'est plus propre à cet écran** : il
> appartient au composant, parce que trois écrans du module le rendent (§ 9.2,
> point 1) et qu'une table recopiée dans chaque écran est une table qui divergera.
> Cet écran **référence** § 2.7 et n'y ajoute que ce qui lui est propre : la colonne
> de chaque cause, la décomposition du compte d'action, et le filtre qui en est le
> miroir.

---

## 4. States — tous, sans exception

| État | Déclencheur | Rendu | Feedback utilisateur |
|---|---|---|---|
| **Chargement** | Ouverture de `/definitions`, changement de filtre, de recherche, de tri ou de page | Skeleton **de la forme** : 8 lignes de 32 px, la colonne « Indicateur » occupant deux hauteurs de texte (intitulé + slug), la colonne « Version » un bloc mono de 64 px, la colonne « État de signature » un bloc de 136 × 18 px reproduisant la largeur d'un badge. La barre de filtres et le `PageHeader` s'affichent **immédiatement et pour de vrai** (les filtres ne dépendent pas de la table). Aucune ligne n'est un aplat uniforme. | La ligne de compte affiche « — définitions · — attendent une signature », **jamais « 0 »** : un squelette qui affiche 0 enseigne au contrôleur que son portefeuille est vide. Après 400 ms, un `--text-caption` sous le titre : « Lecture du référentiel ». Aucun spinner central. |
| **Rempli** | Référentiel lu | `DataTable[reference]`densité `md`, tri par défaut « action requise d'abord », le tri écrit dans le titre. Chaque ligne porte ses sept cellules, dont trois portent potentiellement un état **sans clic**. Le `tfoot` donne le compte exact et le nombre de lignes masquées par les filtres. | Aucun toast. Le contenu se remplace en place, `--duration-fast` (90 ms), sans transition d'entrée (design-system §3.4). |
| **Vide — jamais visité** | Aucune définition n'existe (base vide, premier démarrage) | Message de deux lignes **nommant les cinq champs obligatoires** — « Aucun indicateur n'est encore déclaré. Une définition porte un intitulé, une formule, un périmètre, un propriétaire nommé et un signataire désigné. » — puis **CTA principale** `Déclarer la définition version 1` en `--color-accent`. Pas de tableau rendu, pas de colonnes vides, pas d'illustration. | Le CTA est le seul élément `--color-accent` de l'écran. Il mène à `/definitions/nouvelle`, le formulaire — cet écran **ne déclare pas** (C2 : la déclaration passe par le formulaire de version, pas par une ligne de liste). |
| **Vide — aucune donnée** | Deux cas distincts, jamais confondus. (a) `empty-no-data` : le référentiel n'a **aucune** définition. (b) `filtered-to-zero` : les filtres ne renvoient **rien** | (a) → l'état « jamais visité » ci-dessus. (b) → ligne unique occupant toute la largeur : **« 0 définition pour ces filtres »**, puis le **récapitulatif des filtres actifs sous forme de chips** (un par filtre, chacun avec sa croix et son nom, ex. « propriétaire : N. Ferrand × »), puis le bouton `Réinitialiser les filtres`. **Le tableau reste rendu** (en-tête, `tfoot`), pour que la structure reste lisible. | Les deux états ne se réparent **pas de la même façon** : (a) par une déclaration, (b) par un bouton. Confondre les deux est le défaut que le design system signale. Sur un référentiel, **E2 (« aucune donnée sur la période ») n'existe pas** : il n'y a pas de période ici. Le périmètre est porté par la définition, pas par la requête — d'où l'état distinct E15, rendu sur la ligne et non dans l'état vide. |
| **Erreur de chargement** | L'API interne du référentiel est injoignable ; l'annuaire ne répond pas | Bandeau pleine largeur `--color-source-unavailable` `#5B5B63` : « Le référentiel des définitions n'a pas pu être chargé. Vous ne pouvez pas savoir ce qui est officiel tant que la source n'est pas revenue. » + `Réessayer`. Si seul l'annuaire manque : **le tableau se rend normalement**, seul le `FormField[owner-picker]` passe en état d'erreur avec `Réessayer` **dans le champ**. Aucun repli en saisie libre. | Jamais un tableau vide, jamais un `0`, jamais un tiret à la place d'une version. Un échec qui s'affiche comme une absence transformerait une panne en affirmation (« aucune définition n'est signée ») — l'accusation la plus grave que cet écran puisse porter. Un filtre propriétaire indisponible ne fait pas tomber la page entière : il ne fait que son filtre. |
| **Erreur de soumission** | Action groupée ou action de ligne refusée : le propriétaire d'une ligne est inactif (B17), la version a changé entre la sélection et l'envoi, la sélection mélange des états incompatibles, le CSV est refusé | Erreur **dans le `BulkBar`**, pas en toast : bandeau `--color-out-of-band` `#B23A2E` nommant **les lignes concernées par leur intitulé**, pas « 1 élément sur 3 ». Cas récurrents : (a) « ces 2 définitions n'ont pas de propriétaire actif : un propriétaire nommé doit être désigné avant toute relecture » (B17) ; (b) « la version 3 de « Taux de service » a été modifiée depuis votre sélection — rechargez la ligne ». | La sélection **est conservée** et les lignes fautives restent cochées : l'utilisateur voit ce qui a échoué sans avoir à resélectionner. `role="alert"`. Le focus va sur le bandeau, pas sur un bouton disparu. Un toast qui disparaît laisserait un `BulkBar` qui ne dit plus rien alors que l'action a échoué. |
| **Succès** | Action groupée acceptée, `Relancer` effectué, `Réessayer` réussi, tri ou filtre appliqué | Confirmation **dans le `BulkBar`**, en `role="status"` : « 2 demandes de relecture envoyées à M. Ravel et M. Vasseur — le 30/09 à 09:41. » Les lignes concernées passent **dans la même transaction** à `en attente de signature`, et leur badge change **de couleur seule**, en `--duration-normal` (160 ms). Un filtre appliqué réécrit le compte du titre. | Aucune animation de valeur : pas de compteur qui défile, pas de count-up. Le `BulkBar` **reste affiché** avec sa confirmation tant qu'une ligne reste sélectionnée, puis disparaît en `--duration-fast` après désélection. Le tri et les filtres vivent dans l'URL : l'adresse restitue exactement l'état, **jamais un droit**. |
| **Hors-ligne / permissions** | (a) perte de liaison pendant la session ; (b) `SCOPE_DENIED` sur l'API du référentiel | (a) **Hors-ligne** : le dernier résultat reste affiché **avec sa date** dans le `tfoot` (« lu le 30/09 à 09:12 »), un bandeau `--color-source-unavailable` le dit, et **le `BulkBar` disparaît entièrement** : aucune action groupée n'est mise en file d'attente hors ligne. Une demande de relecture hors ligne ne serait ni horodatée par le serveur, ni journalisée au bon moment — même raison que pour la signature (`definition-signature.md` § 8). (b) **Permissions** : le tableau n'est **pas** rendu, pas de placeholder, pas de contour, pas de « accès refusé » qui en confirmerait l'existence. Le bandeau nomme en revanche le **module** qui porte la lecture (`Accès et journal`, rang 4) et la raison : la consultation du référentiel est journalisée (B10), y compris ce refus. | Le journal de consultation **n'est jamais rendu ici** : il se consulte dans « Accès et journal ». Rendre un journal lisible sur l'écran de gestion le rendrait décoratif. |
| **Lecture seule** | Personne connectée sans droit d'écriture : le directeur de site qui consulte, un manager qui tombe sur le lien, l'auditeur en revue | Le tableau se rend **intégralement**, avec les mêmes colonnes, les mêmes états et les mêmes totaux qu'en écriture — c'est un **écran de vérité**, il ne se dégrade pas. Disparaissent : la `Button[primary]` du `PageHeader`, les cases de sélection, le `BulkBar`, et les `RowActions` d'écriture. Reste `Ouvrir`, qui mène au formulaire en `FormField[readonly]`. Le filtre propriétaire reste utilisable. | Aucune commande grisée : ce qui n'est pas possible ici **n'est pas représenté**. Un élément désactivé apprend qu'on a le droit mais pas le moment, et le contrôleur passe son temps à essayer les boutons grisés. Le mode lecture est déduit de l'absence de commandes, et c'est un mode **légal** : lire le référentiel des définitions n'exige aucun droit d'écriture, puisque c'est la seule source de savoir ce qui est officiel. |

### 4.1 Les états de ligne — le contrat est dans le composant, ici seulement leur place

**Le vocabulaire des états de ligne appartient à `design-system` § 2.7.** Les sept
états, leur couleur, leur fond de badge épinglé, leur texte, leur icône et leur
précédence sont écrits **une seule fois**, dans le contrat du composant. Cet écran
**référence** § 2.7 et ne recopie pas la table.

Cette non-recopie est une décision, pas une économie de lignes. Une table d'états
recopiée dans chaque écran est une table qui diverge : le jour où le design system
corrige un fond ou un mot, l'écran garde l'ancien, et rien ne le signale — c'est
exactement le défaut qu'un contrôle de parité de composants ne voit pas, parce
qu'il vérifie qu'une énumération citée est à jour, pas qu'une table dupliquée
l'est. Plusieurs écrans du produit portent ce vocabulaire — ceux du module
`definitions` le rendent, les autres s'y alignent — il a donc une autorité, et cette
autorité est le composant.

Ce que cet écran ajoute, et que § 2.7 ne dit pas, tient en trois points :

1. **La colonne de chaque cause.** Les rendus 1 à 4 et 6 sont dans la colonne
   **État de signature**, parce qu'ils décrivent la version. Le rendu 5
   (`stale-owner`, propriétaire inactif — B17, E8) est dans la colonne
   **Propriétaire**, à côté du nom : c'est une question de personne, pas de
   version, et B17 retire le statut officiel **sans** annuler la signature (§ 4.2).
   Le rendu 7 (E15, périmètre résolu vide) est dans la colonne **Périmètre**, à
   côté du compte de lignes. Un état placé dans la colonne de sa cause se lit
   sans ouvrir la ligne et sans croiser deux registres.
2. **Le rendu 6 est composé, et il tient dans une colonne de 320 px.** E4 dit que
   le tableau partagé reste sur la version signée jusqu'à signature de la nouvelle :
   deux versions coexistent avec deux statuts réels et contradictoires. Un état
   unique dirait vrai sur `v3` et faux sur ce que l'entreprise utilise, ou l'inverse.
   Donc deux badges empilés, dans l'ordre signature-efficace-puis-version-en-attente,
   et une troisième ligne qui nomme la conséquence (« 2 tableaux de bord restent
   sur v2 »). C'est le seul rendu qui ne ment sur aucune des deux versions.
3. **Le rendu 5 et le rendu 3 portent le même gris, et c'est voulu** : c'est le
   recouvrement unique autorisé par le composant (§ 2.7), parce que les deux disent
   la même chose au fond — *personne n'est responsable de ce chiffre en ce moment*.
   Ils ne se confondent pas en pratique, puisqu'ils ne sont pas dans la même
   colonne. Aucune couleur n'est ajoutée pour les distinguer : les ajouter serait
   créer une teinte pour une différence de **colonne**, qui n'en est pas une.

**Le fond de chaque badge est celui du composant** — épinglé à
`--color-surface-raised` `#F7F9F8` (ou `--color-accent-subtle` pour le rendu 1,
`--color-out-of-band-subtle` pour le rendu 4), quelle que soit la parité de la
ligne. La règle et le calcul qui l'imposent sont dans le contrat `DataTable` ; cet
écran ne les recalcule pas, et ses propres rapports sont mesurés en § 7.1 sur les
fonds réels qu'il utilise.

**Rendu sans clic, en pratique** : le balayage vertical de la colonne **État de
signature** donne la répartition des signatures ; le balayage de la colonne
**Propriétaire** donne la liste des défaillances de gouvernance ; le balayage de la
colonne **Périmètre** donne les définitions devenues non mesurables. Aucune de ces
trois lectures ne demande un clic, une infobulle, ni un survol. C'est le standard
`admin_crud` appliqué à un référentiel où l'état **est** l'information.

### 4.2 Précédence des états et compte d'action

**La précédence des rendus est celle du composant** (`design-system` § 2.7,
table de précédence) : elle n'est ni réordonnée ni recopiée ici. Un même champ
`État de signature` ne peut porter qu'un seul des rendus 1 à 4, et quand plusieurs
causes convergent sur une ligne elles **ne s'annulent pas** — elles se répartissent
dans leurs colonnes (§ 4.1, point 1). Ce que l'écran ajoute, et que le composant ne
peut pas dire, c'est la **conséquence sur le compte d'action** du titre : c'est une
question d'écran, parce que le compte dépend de qui regarde.

Le **compte d'action** du titre est calculé sur cette précédence et n'est jamais un total brut :

| Ce qui est compté | Condition | Libellé exact dans le titre |
|---|---|---|
| attend une signature | rendu 2 ou rendu 6, **où la personne connectée est le signataire désigné** | « 2 attendent une signature » |
| en attente chez quelqu'un d'autre | rendu 2 ou 6, où la personne connectée n'est **pas** le signataire | **hors du compte d'action**, listé dans le filtre « qui m'attend » comme non sélectionnable, jamais dans le compte |
| sans propriétaire actif | rendu 5 | « 1 sans propriétaire actif » — **compté même si la signature est valide** (choix assumé 1) |
| projet jamais présenté | rendu 3 | **hors du compte d'action** : c'est du travail à faire, pas du travail qui attend la personne connectée |
| périmètre résolu vide | rendu 7 | **hors du compte d'action**, mais **toujours visible** en second compte : « 1 périmètre à revoir » — c'est un constat de veille, pas une urgence |

> Écrire « 7 définitions » seul serait un mensonge utile : il dirait au contrôleur que son travail est fini. Les trois nombres sont donc **tous les trois** dans le titre, et un seul d'entre eux (« sans propriétaire actif ») est actionnable sans attendre un tiers.

---

## 5. Interactions

| Élément | Événement | Comportement | Feedback visuel | État résultant | ID |
|---|---|---|---|---|---|
| `FormField[text]` (recherche) | typing, 250 ms de debounce | Recherche dans l'**intitulé, la formule, le périmètre, le slug, le propriétaire et le signataire** — pas seulement le nom. Le contrôleur de gestion arrive en connaissant la **règle** (« le taux de service qui exclut la sous-traitance »), pas le nom qu'il a donné il y a six mois. Écrit `?q=` dans l'URL ; l'état de la page est dans l'adresse, jamais dans un store | Le champ garde le focus et la frappe n'est **jamais** réécrite sous les doigts ; après 250 ms, les lignes remplacent le contenu en `--duration-fast`, la hauteur du tableau ne change pas d'une ligne à l'autre (32 px fixes) | `Chargement` → `Rempli` ou `filtered-to-zero` | B1 |
| `FormField[owner-picker]` (filtre propriétaire) | click → typing | Liste de l'**annuaire**, filtrable, `--shadow-sm`. **Aucune saisie libre** : B3 exige une personne nommée, et un filtre qui accepte « l'équipe production » produirait un résultat trompeur — il afficherait zéro pour une personne qui existe. Le filtre accepte également l'inverse, « ce qui m'attend » = signé par moi | Options en `--text-body`, rôle `option`, sélection en `--color-accent-subtle`. Si l'annuaire est injoignable, le champ seul passe en erreur avec `Réessayer` ; **le tableau reste rendu** | inchangé, ou `Erreur de chargement` sur le seul champ | B3 |
| `FormField[select]` (état de signature) | select | Cases à cocher sur les sept états de `design-system` § 2.7, repris dans le libellé du champ. Chaque état est un filtre **nommé par son texte**, jamais par une couleur. Le filtre « propriétaire inactif » est ici, en plus de la colonne : c'est la requête que le contrôleur lance une fois par mois, en revue | `--text-caption` sous le champ : « 2 états sélectionnés sur 7 » ; le bouton `Réinitialiser` apparaît | `filtered-to-zero` possible | B17 |
| `DataTable` — en-tête de colonne | click | Tri par colonne, **toggle sur 3 états** (ascendant → descendant → non trié) ; le sens est annoncé par `aria-sort` et par une flèche **textuelle** dans l'en-tête, pas seulement par sa rotation. Écrit `?tri=champ:desc` dans l'URL | L'en-tête actif passe en `--color-accent` + underline 2 px ; la flèche est un glyphe `▲` / `▼` rendu en `aria-hidden` avec un `aria-sort` qui porte le sens réel | `Chargement` → `Rempli`, **sans perdre la sélection** | — |
| `DataTable` — case d'en-tête | click | Sélectionne les **25 lignes de la page courante**, pas les 7 résultats d'un filtre ; l'intitulé accessible le dit (« sélectionner les 25 lignes de cette page »). Une deuxième activation désélectionne | La case passe en `--color-accent`, l'état `aria-checked` suit | `BulkBar` apparaît | — |
| `DataTable` — ligne, **clic sur l'intitulé** | click / `Entrée` | Navigation vers `/definitions/[slug]`, version courante, en conservant tous les filtres (ils sont dans l'URL). C'est le **seul** lien de la ligne | Soulignement `--color-accent` au survol ; focus visible sur le lien | nouveau document, retour ici avec filtres conservés | B1 |
| `DataTable` — **reste de la ligne** | click | **Ne navigue pas.** Charge la provenance **complète** de cette ligne dans le `ProvenanceStrip` fixe en bas de page : version · propriétaire · auteur · signataire et date de signature · motif de refus s'il y en a un · n° de lignes résolues · n° de tableaux de bord et n° d'exports **rattachés à cette version précise** (B22) | Le `ProvenanceStrip` se remplit en `--duration-normal` (160 ms) ; son segment contextuel est en `aria-live="polite"` | inchangé — **la table ne bouge pas, rien n'est trié, la sélection ne change pas** | B22, B26 |
| `RowActions` → `Signer la v3` | click | Ouvre `/definitions/[slug]/signature` pour **cette** version, et **celle-là seulement**. Le libellé porte le numéro de version : jamais « signer », jamais « signer tout ». Modale plein écran `--shadow-md` (design-system §4.2) | Ouverture `--duration-slow` (240 ms) ; la ligne d'origine garde un repère visuel de retour | signature possible **uniquement si** la personne connectée est le signataire désigné de cette version | B2, B26 |
| `RowActions` → `Relancer` (ligne `in_review`, délai ≥ 24 h) | click | Rappel au signataire désigné. **C'est une notification, pas une relecture** : le texte dit « rappel envoyé », jamais « relecture demandée ». Limité à une fois par 24 h par version, et **journalisé** — un envoi non journalisé est un message qui n'existe pas | Bouton en état `disabled` `--color-text-disabled` avec le motif au survol (« relance possible dans 19 h »), la ligne du `BulkBar` porte la confirmation horodatée | inchangé — l'état reste `in_review` | B2 |
| `Button[secondary]` **« Demander une relecture »** (BulkBar) | click | **Uniquement sur des lignes `draft` (3) ou `refused` (4)** — des versions jamais signées. Soumet chaque version à son signataire désigné, horodate, journalise, et fait passer la ligne en `in_review` (2). Sur une ligne `signed`, l'action est **absente** et non grisée : demander une relecture d'une version déjà signée reviendrait à demander au signataire de signer deux fois la même version, ce que B2 exclut. Sur une ligne `in_review`, l'action est remplacée par `Relancer` (§ ci-dessus) | Panneau de confirmation nommant **chaque version et son signataire par son nom** (« Taux de service v1 → M. Ravel », « CA par client v2 → M. Vasseur »), puis envoi. Le changement de badge est **de couleur seule**, en 160 ms | `draft`/`refused` → `in_review` | B2, B1 |
| **Signer en lot** | — | **IMPOSSIBLE, et l'action n'est pas rendue.** Le `BulkBar` ne contient pas de bouton « signer », et la ligne `BulkRationale` l'explique en permanence. Trois raisons distinctes, dont chacune suffit : **(1) B2 exige un signataire nommé, distinct de l'auteur, par version** — trois versions ont trois auteurs et trois signataires différents ; un « signer » groupé les engage tous, ou bien il se déguise en trois notifications et cesse d'être une signature. **(2) Signer, c'est lire** : `definition-signature.md` est une modale **plein écran** précisément parce qu'on ne signe pas dans un panneau latéral au milieu d'une liste ; un bouton groupé produirait des signatures sur des objets non lus. **(3) L'auto-signature est précisément ce que B2 interdit** : signer en lot, c'est signer des règles qu'on n'a pas lues, donc attester une définition qu'on n'a pas vérifiée — un acte sans attribution, donc sans opposabilité, ce qui vide la signature de son sens. **La seule voie est la ligne** : `Signer la v3` sur une ligne, une version, un signataire. | La ligne `BulkRationale` est **non dismissible** et cite B2. Elle n'est pas un tooltip, pas une infobulle, pas un « pourquoi ? » : elle est lisible par quiconque sélectionne trois lignes, avant de chercher où cliquer. | inchangé | B2 |
| `Button[secondary]` **« Dupliquer comme base d'une v+1 »** (BulkBar) | click | Ouvre `/definitions/nouvelle` en pré-remplissant la **version sélectionnée comme point de départ** — intitulé, unité, formule, cible, périmètre, propriétaire, signataire. **Trois règles** : (a) cela crée une **nouvelle** version, la version d'origine n'est jamais ouverte en édition (B1) ; (b) le `slug` est proposé, pas imposé, et le contrôleur doit le confirmer s'il est déjà pris ; (c) la nouvelle version est créée en `draft`, elle ne peut pas être soumise en même temps — la soumission passe par la confirmation du formulaire | Panneau listant les n versions dupliquées, avec pour chacune le numéro d'origine et le numéro créé (« v2 → v4 » — pourquoi pas v3 : elle existe déjà). Le focus va sur le titre du formulaire | `draft` sur la nouvelle version, la ligne d'origine devient E4 (rendu 6) | B1, B22 |
| `Button[secondary]` **« Exporter la sélection en CSV »** (BulkBar) | click | `ExportPanel` : le CSV porte les **définitions** (intitulé, slug, version, propriétaire, signataire, état, dates, motif de refus, n° de lignes résolues) — c'est-à-dire des **métadonnées**, jamais des lignes de données métier (C2). Chaque ligne du CSV porte sa **version** et sa **date de signature**, pour qu'un export de référentiel reste rattaché aux versions qu'il décrit (B27, B22). Le `ProvenanceStrip` et le nom de l'export portent la date d'export et son auteur | `queued` → `running` → `ready` (lien + date d'expiration) ; `--shadow-lg` sur le panneau tant que le job tourne ; la navigation n'interrompt pas le job ; `failed` ne propose **aucun fichier partiel** | `Succès` | B22, B26 |
| `PaginationFooter` | click | 25 lignes par page, **pagination serveur** ; le tri, la recherche et les filtres sont conservés d'une page à l'autre. Le `tfoot` affiche le compte exact : « 7 définies · 2 masquées par vos filtres » | Le focus revient sur la **ligne portant le même `slug`** après changement de page, pas en haut de page : changer de page dans un référentiel, c'est feuilleter, pas naviguer | `Chargement` → `Rempli` | — |
| `window` / navigateur | back | Le retour arrière restitue **l'état complet** : filtres, recherche, tri, page, position de défilement, sélection. Tout est dans l'URL. Une URL est un état de lecture, **jamais un droit** : la router vers cette adresse ne donne aucun accès supplémentaire (B9) | — | — | — |

- **Focus / clavier** : ordre de tabulation = lien d'évitement (« Aller au contenu ») → champs de filtres dans l'ordre de la barre → bouton `Réinitialiser` → en-têtes de colonne triables → **case de sélection multiple d'en-tête** → cases des lignes → liens d'intitulé de chaque ligne → `RowActions` de la ligne → pagination → `ProvenanceStrip`. Raccourcis de l'archétype `admin_crud`, qui exige des raccourcis pour les actions répétitives : `x` bascule la case de la ligne courante, `⇧`+`x` la portée à la sélection courante, `Entrée` sur une ligne ouvre la version, `Espace` sur une ligne sélectionnée ne fait **rien** (il n'y a pas d'action silencieuse), `/` place le focus dans la recherche, `Échap` vide la recherche puis désélectionne, `Alt`+`S` n'existe **pas** — il n'y a pas de « signer tout » à écrire dans une barre d'outils, et c'est **borné par B2** et non « hors exigence » : B2 impose un signataire nommé distinct de l'auteur, par version, donc un raccourci de groupe fabriquerait N actes à partir d'une intention (§ 9.2, point 5). La barre de filtres est un `role="search"` avec `aria-label` ; le tableau est un `<table>` avec `<th scope="col">` et `aria-sort` ; chaque case est une `<input type="checkbox">` au vrai libellé, et l'état d'une ligne est concaténé dans le **nom accessible** de sa ligne (« Taux de service, v2, signée le 14/03 par M. Ravel, propriétaire inactif, périmètre résolu vide ») — sans quoi un lecteur d'écran annonce « Taux de service » et perd les trois informations qui font la ligne.
- **Gestes** : **aucun** au MVP. Pas de swipe, pas de pull-to-refresh, pas de long-press, pas de glisser-déposer. Le rafraîchissement est le bouton `Réessayer`, explicite, parce qu'un geste de rafraîchissement ne se justifie devant aucun journal. Sur `≤ 640px`, une seule invention gestuelle est admise et elle est **non destructive** : le balayage horizontal sur la barre de filtres fait défiler la rangée de filtres, sans déclencher de filtre et sans modifier l'état.
- **Animations** : `--duration-fast` (90 ms, `--ease-default`) au survol, au focus et au changement de tri ; `--duration-normal` (160 ms, `--ease-default`) au **changement de couleur sémantique d'un badge** et au remplissage du `ProvenanceStrip` ; `--duration-slow` (240 ms, `--ease-in`) à l'apparition du `BulkBar` et à l'ouverture de la modale de signature. **Aucune valeur chiffrée ne bouge** : pas de compteur qui défile, pas de count-up sur le compte du titre, pas de défilement de texte dans une cellule. Le seul mouvement autorisé sur une donnée est son changement de couleur sémantique — et une valeur qui bouge est une valeur qu'on ne peut pas lire en comité (design-system §1.6).
- **Retour arrière** : l'état complet est dans l'URL, donc le navigateur restitule filtres, tri, page et position sans travail supplémentaire. Deux exceptions explicites : (a) si une action groupée est **en vol**, le retour est intercepté et annoncé (« 2 demandes de relecture en cours d'envoi — elles seront envoyées ») — l'envoi n'est jamais annulé à mi-parcours, parce qu'une notification à moitié partie est une notification qu'on ne saura pas relancer ; (b) après un succès, la confirmation est rendue **dans la page appelante** et non dans un toast, donc le retour arrière ne la fait pas disparaître.

---

## 6. Responsive

| Breakpoint | Comportement | Ce qui se replie / disparaît |
|---|---|---|
| **Mobile** `≤ 640px` | **Non livré au MVP.** Le design system pose la lecture seule sur téléphone (US-15 est en V2, hors périmètre) : la route rend un message explicite — « le référentiel des définitions se consulte depuis un poste de bureau : le contrôleur de gestion y écrit, et le directeur de site y signe. » **Jamais** un tableau amputé en cartes empilées, **jamais** un message 403. Un référentiel de gouvernance rendu en cartes perd ses colonnes, donc perd la comparaison, donc perd sa raison d'être ; et l'attrapé de signatures, qui est le seul usage mobile réel, ne se fait pas au pouce. | Disparaissent : le tableau, la barre de filtres, le `BulkBar`, le `ProvenanceStrip`. Reste : le message et le lien de retour vers `Indicateurs`, rang 1 — parce qu'un téléphone sert d'abord à lire un chiffre, et c'est là qu'il doit mener. |
| **Tablet** `641 – 1024px` | Sidebar non rendue (elle deviendrait un tiroir, non implémenté au MVP). La barre de filtres passe sur **deux rangées** : recherche pleine largeur en rangée 1, propriétaire / état / version en rangée 2. Le tableau défile **horizontalement** avec la colonne `☐` et la colonne « Indicateur » en `position: sticky` — un référentiel se parcourt à l'horizontale sur une tablette, il ne se replie pas en cartes. Densité maintenue à `md` : c'est une tablette de bureau, posée sur un bureau, pas un téléphone. | Se replient : la colonne « Dernière écriture » passe **sous** l'intitulé, en 12 px, dans le même bloc (le nom de l'auteur et la date sur deux lignes) ; le `BulkBar` passe sur deux rangées et sa ligne `BulkRationale` devient un bloc de texte à part entière, jamais un texte tronqué. Disparaît : rien d'essentiel. Le `ProvenanceStrip` reste fixe en bas, sur 40 px. |
| **Desktop** `1025 – 1600px` | Layout « page standard » : sidebar 240 px persistante, barre de filtres sur **une seule rangée** (recherche 320 px, propriétaire 200 px, état 180 px, version 160 px, réinitialiser), marges `--space-3xl` (32 px). Le tableau occupe 9 des 12 colonnes, la colonne « État de signature » **320 px** — la largeur exacte qu'il faut pour porter deux badges empilés (rendu E4) sans les tronquer. Le `tfoot` est à gauche, le `ProvenanceStrip` pleine largeur en bas. C'est le cas du contrôleur de gestion, à son bureau, une fois par semaine. | Rien ne disparaît. Seul ajustement : au-delà de 25 lignes sur une page, le `BulkBar` se colle au bas au-dessus du `ProvenanceStrip` pour rester atteignable sans remonter en haut du tableau. |
| **Wide** `≥ 1601px` | Conteneur utile **1440 px** : le tableau passe à 10 colonnes de contenu utile sans jamais s'étirer au-delà. La colonne « Indicateur » gagne la place pour afficher le **résumé de la formule sur une seule ligne en mono tronquée au milieu** (jamais repliée : une formule repliée n'est plus la formule affichée, et l'écran ment). Le `ProvenanceStrip` gagne un segment : l'historique de signature de la ligne survolée (qui, quand, quelle version). Le `BulkBar` gagne une colonne de largeur constante pour que ses trois boutons ne se déplacent pas d'une sélection à l'autre. | Rien de plus à cacher — et surtout pas de largeur infinie : au-delà de 1440 px, c'est la **colonne « Indicateur » qui s'arrête**, pas le tableau. Une formule de 140 caractères sur une ligne de 2400 px est moins lisible que sur deux lignes de 900 px. La densité `md` ne change pas : un écran projeté n'a pas besoin de lignes plus hautes, il a besoin de plus de lignes, et c'est la pagination qui les fournit. |

- **Cible tactile** : sur `641 – 1024px`, la hauteur de ligne passe de **32 px à 44 px** (densité `md` tactile), les cases de sélection font 24 × 24 px, les trois boutons du `BulkBar` font **48 px** de haut séparés de 24 px — jamais deux boutons adjacents à 8 px, parce que « Demander une relecture » et « Dupliquer comme base » ont des conséquences opposées et qu'un clic raté sur le mauvais crée une version fantôme. Sur `≥ 1025px`, 32 px pour les lignes et 40 px pour les boutons, hauteur dense assumée pour un produit de bureau. La `RowActions` fait 44 × 44 sur tous les breakpoints, y compris dense : un lien d'action de 24 px de haut est un lien qu'on rate quand on cherche `Signer la v3` en fin de ligne.
- **Débordement** : **garanti de ne jamais déborder.** (a) Le tableau défile **horizontalement** dans son conteneur, jamais en reflow : les colonnes gardent leur largeur, `☐` et « Indicateur » sont en `position: sticky` pour qu'on sache toujours sur quelle ligne on est en balayant. (b) Un **motif de refus** long est tronqué à 2 lignes avec `…` et son texte intégral est dans le `ProvenanceStrip` au clic de la ligne et dans le `title` — il n'est **jamais** perdu, et il ne fait **jamais** sauter la hauteur d'une ligne. (c) La formule affichée dans la colonne « Indicateur » est en mono et tronquée **par le milieu**, jamais par retour à la ligne : une formule qui se replie en 3 lignes dans une cellule de 32 px déborde verticalement et pousse la ligne. (d) Les `slug` et les `source_ref` restent en mono et défilent horizontalement dans leur cellule au lieu de s'habiller. (e) Le libellé d'une définition longue est `overflow-wrap: anywhere` sur son nom mais **jamais** sur son `slug`. (f) Le `BulkBar` ne peut pas masquer une ligne sélectionnée : quand il apparaît, la table se décale d'un `scroll-margin-top` de 40 px, jamais d'un recouvrement.

---

## 7. Accessibilité

Méthode : **rapport WCAG 2.1 calculé**, jamais estimé. Pour chaque couple, la luminance relative de chaque couleur est
`L = 0,2126·R + 0,7152·G + 0,0722·B`, où `R`, `G`, `B` sont les composantes normalisées dans `[0, 1]` puis linéarisées par `c ≤ 0,03928 ? c/12,92 : ((c + 0,055)/1,055)^2,4` ; le rapport est `(L₁ + 0,05) / (L₂ + 0,05)`, la luminance la plus forte au numérateur. Le fond réel de cet écran est `--color-background` `#F2F4F3`, **sauf** dans les cellules de badge, dont le fond est épinglé (§ 7.1) et dans les lignes alternées `--color-ink-100` `#E4E8E6`.

### 7.1 Contrastes calculés sur les tokens réellement utilisés

| Couple couleur / fond | Rapport | Seuil applicable | Verdict | Où il est utilisé sur cet écran |
|---|---|---|---|---|
| `#2C3633` texte principal / `#F2F4F3` fond | **11,30:1** | 4,5:1 | conforme | intitulé de définition, nom du propriétaire, badge d'état (texte) |
| `#2C3633` / `#E4E8E6` ligne alternée | **10,09:1** | 4,5:1 | conforme | tout texte de la ligne paire |
| `#2C3633` / `#E9EDEB` en-tête de table | **10,57:1** | 4,5:1 | conforme | en-têtes de colonne, étiquette de champ |
| `#2C3633` / `#D3E4E2` ligne sélectionnée | **9,49:1** | 4,5:1 | conforme | texte de la ligne cochée |
| `#4F5C57` texte secondaire / `#F2F4F3` fond | **6,33:1** | 4,5:1 | conforme | nom du propriétaire, signataire, date de dernière écriture |
| `#4F5C57` / `#E4E8E6` ligne alternée | **5,66:1** | 4,5:1 | conforme | idem, ligne alternée |
| `#4F5C57` / `#E9EDEB` en-tête | **5,92:1** | 4,5:1 | conforme | étiquette de champ de filtre |
| `#0F5C57` accent / `#F2F4F3` fond | **7,07:1** | 4,5:1 | conforme | lien d'intitulé, lien de cellule, anneau de focus |
| `#0F5C57` accent / `#D3E4E2` fond de badge « signée » | **5,94:1** | 4,5:1 | conforme | **texte du badge d'état 1** et liseré 3 px de la ligne signée |
| `#0F5C57` / `#E4E8E6` | **6,32:1** | 4,5:1 | conforme | lien d'intitulé en ligne alternée |
| `#7A6A3C` inconnu / `#F7F9F8` fond de badge | **5,02:1** | 4,5:1 | conforme | **texte des badges 2, 6 et 7** |
| `#7A6A3C` / `#F2F4F3` | **4,81:1** | 4,5:1 | conforme | texte d'état en ligne, liseré de la ligne en attente |
| `#746A5E` stale / `#F7F9F8` fond de badge | **5,01:1** | 4,5:1 | conforme | **texte des badges 3 « projet » et 5 « propriétaire inactif »** — le fond est celui du composant (`design-system` § 2.7) |
| `#746A5E` / `#F2F4F3` | **4,79:1** | 4,5:1 | conforme | liseré 3 px de la ligne projet |
| `#B23A2E` hors cible / `#F6E1DE` fond de badge | **4,73:1** | 4,5:1 | conforme | **texte du badge 4 « refusée »** |
| `#B23A2E` / `#F2F4F3` | **5,37:1** | 4,5:1 | conforme | filet de la ligne refusée, message d'erreur du `BulkBar` |
| `#5B5B63` / `#F2F4F3` | **6,09:1** | 4,5:1 | conforme | bandeau d'erreur de chargement, mention « lit le 30/09 à 09:12 » |
| `#7E8A85` filet fort / `#E9EDEB` en-tête | **3,03:1** | 3:1 (1.4.11) | conforme | filet de ligne de tableau, bordure de cellule de filtre |
| `#7E8A85` / `#F2F4F3` | **3,24:1** | 3:1 (1.4.11) | conforme | filet de séparation de la barre de filtres |
| `#9BA6A2` texte désactivé / `#F2F4F3` | **2,27:1** | — | **exempté, assumé** | réservé aux **actions impossibles** (`Relancer` avant 24 h). Exempté de 1.4.3 (texte inactif) et **jamais porteur d'une information unique** : le motif du délai est dans son infobulle et dans le nom accessible du bouton. Ne pas confondre avec `#7E8A85`, qui est un token de filet et non de texte. |
| `#C9D0CD` filet / `#F2F4F3` | **1,42:1** | 3:1 (1.4.11) | **non conforme, assumé** | `#C9D0CD` ne sépare **jamais** deux éléments porteurs d'information. Les limites du tableau utilisent `--color-border-strong` `#7E8A85` (**3,24:1**). `#C9D0CD` ne sert qu'au chrome (filet bas d'en-tête de page, pourtour du `BulkBar`), où rien n'est à lire. |

> **Le fond épinglé n'est pas une règle de cet écran : c'est une règle du
> composant, et cet écran ne la recalcule pas.** Le fond d'un badge d'état est
> épinglé à `--color-surface-raised` `#F7F9F8` (ou `--color-accent-subtle` pour le
> rendu 1, `--color-out-of-band-subtle` pour le rendu 4) **quelle que soit la parité
> de la ligne**. La règle et le calcul qui l'imposent sont dans le contrat
> `DataTable` du design system : sur la ligne alternée `#E4E8E6`, `--color-unknown`
> tombe à 4,30:1 et `--color-stale` à 4,28:1, soit deux textes sous 4,5:1 — donc un
> état de signature illisible sur une ligne sur deux. Ce tableau mesure les
> rapports **sur les fonds que cet écran utilise réellement** ; il ne rejoue pas le
> calcul qui a fait choisir l'épinglage, il en vérifie le résultat.
>
> Les deux écrans frères du module (`definition-formulaire.md` § 7 et
> `definition-signature.md` § 7) s'alignent sur cette même règle, et n'en ont jamais
> fait une quatrième version : ils citent le fond épinglé, ils ne le redéfinissent
> pas. Trois écrans, une règle, un calcul.

- [x] **Contraste 11,30:1 pour le texte courant** — `#2C3633` sur `#F2F4F3`, calculé. Le texte qui porte une information de gouvernance — intitulé, propriétaire, version, date, motif — n'est **jamais** rendu en secondaire ni en désactivé, même quand il est techniquement « secondaire » dans la table.
- [x] **Contraste 5,94:1 pour le badge « signée »**, 5,01:1 pour « projet » et « propriétaire inactif », 5,02:1 pour « en attente » et « périmètre résolu vide », 4,73:1 pour « refusée » — **tous au-dessus de 4,5:1**, calculés individuellement sur leur fond réel, qui est le fond épinglé du composant (§ 2.7). Le seuil applicable est bien 4,5:1 et non 3:1 : le texte du badge est en `--text-overline` 11 px, ce n'est pas un grand texte au sens WCAG.
- [x] **Navigation clavier complète sur `--bp-desktop`** : chaque action de l'écran est atteignable et déclenchable au clavier, y compris le tri, la sélection multiple, les trois actions groupées et l'ouverture de la modale de signature. Les raccourcis du § 5 sont annoncés dans l'attribut `aria-keyshortcuts`. L'exigence 7.3 du PRD (« navigation complète au clavier ») est ici la plus contraignante du projet, parce qu'un référentiel se parcourt au clavier plus qu'à la souris.
- [x] **Focus visible** — anneau `--color-border-focus` `#0F5C57` 2 px, jamais supprimé, jamais `outline: none` sans remplacement, **jamais rogné** par le `overflow-x` du tableau : l'anneau est dessiné en `outline` et non en `box-shadow` pour cette raison, et le conteneur de défilement porte un `padding` de 2 px sur les côtés. Le focus est visible sur fond `#F2F4F3`, sur fond `#E4E8E6` (ligne alternée) et sur fond de badge `#F7F9F8` : sur les trois, l'anneau `#0F5C57` est à 7,07:1 de contraste, donc jamais confondu avec le texte.
- [x] **ARIA** — le tableau est une `<table>` sémantique avec `<th scope="col">` et `aria-sort` sur la colonne triée ; **pas** de grille ARIA, il n'y a ni cellule fusionnée ni en-tête croisé. Chaque ligne porte un `aria-label` qui concatène ses états, pour qu'un lecteur d'écran n'annonce pas « Taux de service » et ne perde pas « v2 signée le 14/03, propriétaire inactif, périmètre résolu vide ». La barre de filtres est un `role="search"` ; les cases à cocher sont des `<input type="checkbox">` au vrai `<label>`, y compris celle de l'en-tête dont le libellé est « sélectionner les 25 lignes de cette page ». Le `BulkBar` est `role="region"` avec `aria-label` portant le compte, ses messages sont `role="status"` en `aria-live="polite"`, ses erreurs sont `role="alert"`. Le segment contextuel du `ProvenanceStrip` est `aria-live="polite"`, donc le clic sur une ligne est **annoncé** sans qu'il soit visible. Le compte d'action du titre est un `role="status"` : le nombre de signatures en attente s'y annonce à chaque rechargement, et c'est le nombre que le directeur de site est venu chercher. `aria-current="page"` sur l'entrée `Définitions` de la `SideNav`.
- [x] **Aucune information portée par la seule couleur** (PRD 7.3) : les sept états de ligne portent **une couleur, un texte et une icône** — règle du composant, `design-system` § 2.7, appliquée ici sans variante. Les sept icônes sont `badge-check`, `clock`, `pencil-line`, `circle-x`, `user-round-x`, `git-branch`, `circle-help` — toutes `aria-hidden="true"`, le texte étant le porteur. Le tri est porté par `aria-sort` **et** par un glyphe `▲` / `▼` visible. La ligne sélectionnée est portée par la case cochée **et** par le fond `#D3E4E2`. Un utilisateur daltonien voit exactement la même information qu'un autre.
- [x] **Alternatives textuelles** : **aucune image** sur cet écran, donc aucune alternative à écrire. Aucune icône n'est porteuse d'un sens unique : chacune accompagne un mot. Le `ProvenanceStrip` est du texte, pas un graphique.
- [x] **Langue et direction de lecture** : `lang="fr"`, `dir="ltr"`. Le vocabulaire métier (marge, taux de service, sous-traitance) n'est pas traduit (PRD 7.4) ; les `slug`, les `source_ref` et les noms propres ne sont ni traduits ni reformés, et restent en `--font-mono` pour rester alignables et recopiables.
- [x] **Taille de texte** : 11 px est le plancher de cet écran, atteint uniquement par les en-têtes de colonne et les libellés de badge, qui sont des `text-transform: uppercase` **entièrement Vocabulaire métier connu** (« PÉRIMÈTRE », « SIGNÉE ») doublés du nom accessible complet de la ligne. Le corps est à 14 px, les états à 13 px. L'exigence « pas de corps sous 16 px sur mobile » est satisfaite par construction : **l'écran n'existe pas sur mobile au MVP**.

### 7.2 Écart de mesure relevé sur les deux écrans frères du même module

Les deux écrans déjà écrits du module (`definition-formulaire.md` § 7 et `definition-signature.md` § 7) signalaient un écart de contraste sur `--color-text-secondary` et sur `--color-stale`, et en déduisaient qu'il fallait **restreindre leur usage** à des libellés non critiques ou à des filets. **Cette déduction reposait sur des valeurs qui ne sont pas celles du design system.** Les deux écrans mesuraient `#4F5C57` et `#746A5E` ; `design-system.md` §1.1 définit `#4F5C57` et `#746A5E`. Calculés sur les valeurs du design system, avec la même formule et sur le même fond `#F2F4F3` :

| Token | Valeur design system | Écran frère | Rapport sur `#F2F4F3` avec la valeur du design system | Verdict |
|---|---|---|---|---|
| `--color-text-secondary` | `#4F5C57` | `#4F5C57` | **6,33:1** | conforme |
| `--color-stale` | `#746A5E` | `#746A5E` | **4,79:1** | conforme |

Les trois restrictions d'usage que les écrans frères avaient écrites (dates et sources écartées du secondaire, `stale` réduit au filet, `#4F5C57` réservé aux libellés non essentiels) n'étaient donc pas nécessaires : elles avaient été inspirées par un couple couleur/fond qui n'existe pas dans le design system. **Cet écran applique la version conforme** — le secondaire `#4F5C57` porte les noms, les dates d'écriture et les `slug` sans réserve (6,33:1), et `--color-stale` `#746A5E` porte le texte du badge « projet » (5,01:1 sur son fond). **Les deux écrans frères sont désormais alignés dessus** : leur § 7 a été recalculé sur les valeurs du token et leurs trois restrictions supprimées. L'écart est levé et consigné comme tel en § 9.2.

---

## 8. Données

| Champ | Type | Origine | Requis | Erreur possible |
|---|---|---|---|---|
| `definition_id` | UUID | **API interne — PostgreSQL** (métadonnées produit) | oui | `—` |
| `slug` | kebab-case, unique | **API interne — PostgreSQL** | oui | déjà pris à la duplication → le formulaire demande un autre `slug`, il ne le remplace pas |
| `intitule` | texte, 120 car. | **API interne — PostgreSQL** | oui | vide (le serveur le refuse) |
| `formula` | texte multi-ligne, mono | **API interne — PostgreSQL** | oui | — (la formule est **validée par la source** à la déclaration, C1 ; elle n'est pas recalculée ici) |
| `cible` | nombre + unité, ou `null` | **API interne — PostgreSQL**, même version que la formule (B14) | non | `null` sur une version qui en portait une → E16, hors périmètre de cet écran |
| `perimetre` | énumération issue de l'entrepôt (C1) | **API interne — PostgreSQL** (la définition) | oui | — |
| `perimetre_resolved_row_count` | entier | **entrepôt**, `COUNT` en lecture seule sur le périmètre de la version, même scope que les valeurs | oui | `0` → **E15**, rendu « périmètre résolu vide », **jamais `0 %` ni un tiret** |
| `proprietaire_id` | identifiant de personne | **API interne — PostgreSQL** ; résolu via l'**annuaire** | oui | annuaire injoignable → `Erreur de chargement` sur le seul champ de filtre ; **jamais** de repli en saisie libre (B3) |
| `proprietaire_actif` | booléen | **annuaire** (donnée d'identité, pas une ligne métier) | oui | `false` → rendu 5, perte du statut officiel (B17, E8) |
| `signataire_designe_id` | identifiant de personne | **API interne — PostgreSQL**, l'**auteur est exclu** de la liste (B2) | oui | personne sortie de l'annuaire → la ligne passe en `in_review` sans destinataire et le compte d'action affiche « 1 sans signataire » |
| `auteur_id` | identifiant de personne | **API interne — PostgreSQL** | oui | — |
| `version` | entier, 1-indexé, monotone par `definition_id` | **API interne — PostgreSQL** | oui | `expected_version` dépassé → `Erreur de soumission` au `BulkBar`, la ligne est nommée |
| `statut_signature` | `draft` / `in_review` / `signed` / `refused` / `locked` | **API interne — PostgreSQL** | oui | incohérence serveur → `Erreur de chargement`, **jamais** de ligne rendue dans un état deviné |
| `signed_at` | timestamp | **API interne — PostgreSQL** — horodaté par le serveur, jamais par le poste (B2) | non | `null` → le badge dit « signée » sans date est impossible : un `signed` sans `signed_at` est traité comme une erreur serveur, pas comme une signature |
| `signed_by` | identifiant de personne | **API interne — PostgreSQL** + annuaire | non | — |
| `refused_at` / `motif_refus` | timestamp / texte libre | **API interne — PostgreSQL** | non | motif vide → refusé est impossible côté serveur ; un `refused` sans motif est traité comme une erreur, pas comme un refus |
| `published_at` | timestamp ou `null` | **API interne — PostgreSQL** | oui | `null` + `signed` → la signature est **révocable** par l'auteur (B26), et l'écran le dit ; `published_at` renseigné → `locked`, aucune révocation n'est représentée |
| `n_dashboards_rattaches` | entier | **API interne — PostgreSQL** | oui | 0 → pas de bandeau E4 sur la ligne ; **pas** de bandeau « rien à signaler » non plus |
| `n_exports_rattaches` | entier | **API interne — PostgreSQL** | oui | 0 → idem |
| `derniere_ecriture_at` | timestamp | **API interne — PostgreSQL** (date de création de la version courante) | oui | — |
| `action_possible_pour_moi` | `signer` / `relancer` / `dupliquer` / `aucune` | **dérivé**, côté serveur, de l'identité connectée × le statut × `proprietaire_actif` | oui | `signer` alors que la personne est l'auteur → **le serveur ne le renvoie pas** ; l'action n'est pas rendue (B2) |
| `error_code` | enum fermée partagée client/serveur | couche API | non | une chaîne libre ici ferait que chaque endpoint invente son libellé |
| `restrictions` | — | **n'est pas un champ rendu.** La restriction porte sur la donnée (B7) et l'API du référentiel ne sérialise que des métadonnées, jamais de lignes. | — | un `masked: true` renvoyé au client serait déjà une fuite |

- **Chargement** : **pagination serveur de 25 lignes par page**, tri et filtres envoyés à l'API. Le choix est dicté par `admin_crud` (« pagination ou scroll infini ») **et** par la gouvernance : un défilement infini sur un référentiel de 200 définitions fait perdre la position en cours de revue, et « j'ai fait défiler jusqu'au bout sans le voir venir » est un état qui n'existe pas dans un outil de contrôle. Le `tfoot` affiche le compte exact — « 7 définies · 2 masquées par vos filtres » — pour qu'aucune ligne ne soit cachée sans que le compte le dise. Le tri, la recherche et les filtres vivent dans l'URL et sont donc partageables comme **état de lecture** (B9 : une adresse restitue un état, jamais un droit).
- **Cache / hors-ligne** : cache de lecture de 30 minutes sur `/definitions?…`, invalidé à toute écriture de version ou de signature — donc, en pratique, invalidé par l'utilisateur lui-même, ce qui est le comportement correct ici. **Aucun cache d'écriture, et aucune action groupée mise en file d'attente hors ligne** : une demande de relecture envoyée sans réponse serveur ne serait ni horodatée, ni notifiée, ni journalisée — ce serait un mensonge de cycle de vie. Hors-ligne, le dernier résultat reste affiché **avec la date de sa lecture** dans le `tfoot`, jamais re-daté à l'ouverture.
- **Données sensibles** : cet écran **ne transporte aucune ligne de donnée métier et aucune valeur d'indicateur** — il ne manipule que des métadonnées. Conséquence directe et volontaire : c'est ce qui permet d'en faire un écran de vérité lisible par un tiers sans que la lecture soit un accès à la donnée (B7, B9). Le `motif_refus` est le **seul** texte libre de l'écran, et c'est de la donnée personnelle : il est journalisé à la consultation, il n'apparaît **jamais dans l'URL** (le filtre porte l'état, pas le motif), et il n'est inclus dans un export CSV que si l'export porte la mention de sa source et de sa date. C10 (chiffrement au repos, isolation par ligne, restauration à un instant) est un prérequis hors de cet écran, mais l'écran ne doit produire aucune copie non chiffrée : le `motif_refus` n'est donc jamais mis en cache local par le navigateur.
- **Ce qui vient de l'entrepôt, et ce qui n'en vient pas** : **tout le tableau vient de l'API interne (PostgreSQL)**, parce qu'**une définition est une métadonnée**, pas une mesure. C'est la traduction directe de C1 — l'entrepôt est la source des chiffres et n'est jamais écrit par Amberline — et elle a une conséquence d'architecture qu'il faut écrire ici parce qu'elle est facile à infringée : une définition **n'existe pas** dans l'entrepôt, donc elle ne peut pas y être lue, et elle ne peut pas y être écrite non plus. Le **champ unique** qui vient de l'entrepôt est `perimetre_resolved_row_count`, un `COUNT` en lecture seule, indispensable à E15 : sans lui, on ne peut pas distinguer « le périmètre est vide » de « le périmètre n'a pas été résolu », et E15 deviendrait invisible. Aucun autre champ de ce tableau n'est un agrégat, aucune ligne n'est transportée, et **aucune commande de cet écran n'écrit dans l'entrepôt** — la seule écriture possible est une nouvelle version ou une signature, toutes deux dans PostgreSQL.

---

## 9. Traçabilité

| ID | Origine | Manifestation sur cet écran |
|---|---|---|
| **B1** | PRD §4 | Trois manifestations, aucune n'étant « la définition » au sens large. (a) La colonne **Version** est un nombre en mono, jamais un nom : une ligne porte `v3`, pas « la version actuelle ». (b) La colonne **État de signature** porte l'état de **cette** version-là, et l'état E4 compose les deux versions explicitement. (c) `Dupliquer comme base d'une v+1` est le **seul** moyen de modifier une définition depuis cet écran : il n'existe **aucune** commande d'édition en ligne, **aucun** crayon dans la colonne « Indicateur », **aucun** menu « … » portant une action de modification. Le clic sur la ligne ouvre la version en lecture, et toute écriture passe par `/definitions/[slug]`, qui crée une version. Le `ProvenanceStrip` nomme l'auteur et la date d'écriture de **la version affichée**. |
| **B2** | PRD §4 | L'absence de l'action est la manifestation principale. (1) **Il n'y a pas de bouton « signer » dans le `BulkBar`**, et la ligne `BulkRationale`, non dismissible, cite la règle et donne les trois raisons — dont le fait que signer en lot revient à signer des règles qu'on n'a pas lues, c'est-à-dire exactement l'auto-signature que B2 exclut. (2) `Signer la v3` est une action **de ligne**, jamais de groupe, et son libellé porte le numéro de version. (3) Le champ `action_possible_pour_moi` est calculé côté serveur : si la personne connectée est l'auteur, l'action **n'est pas rendue** — pas grisée, pas masquée par CSS. (4) Le filtre par propriétaire accepte une personne nommée, et le filtre par signataire permet de voir « ce qui m'attend » sans jamais se voir dans la liste de ce qu'on a écrit soi-même. (5) Chaque ligne porte le nom de son signataire et la date de signature en mono : la signature est un acte **attribué**, et l'attribution est lisible sur le référentiel sans ouvrir la ligne. |
| **B3** | PRD §4 | Le filtre `FormField[owner-picker]` interroge l'**annuaire** et **n'accepte aucune saisie libre**. Conséquence écrite à l'écran : un filtre qui accepte « l'équipe production » affiche un zéro pour une personne qui existe, et un compte d'action faux. Si l'annuaire est injoignable, le filtre échoue **seul** — le tableau reste rendu, et il n'y a **aucun** repli en saisie libre, parce que ce repli est la seule chose qui ferait que l'écran accepte une règle sans propriétaire. La colonne **Propriétaire** affiche toujours un **nom**, jamais un rôle ni une équipe. |
| **B4** | PRD §4 | La valeur publiée est celle de la **dernière version signée** : la colonne « Version » et le badge d'état disent donc, sur la même ligne, « quelle version existe » et « quelle version est publiée ». Le cas E4 est là pour le rendre visible sans calcul : quand une v2 signée est publiée et qu'une v3 attend, la ligne affiche **les deux**, avec lisiblement « 2 tableaux de bord restent sur v2 ». Une version modifiée sans re-signature n'apparaît nulle part comme publiée : la ligne porte `v3` en `in_review` et `v2` comme version effective. Il n'existe sur cet écran **aucune** commande qui pourrait modifier une version signée sans nouvelle version : le seul chemin est `Dupliquer comme base d'une v+1`. |
| **B17** | PRD §4 | Le rendu 5 de `design-system` § 2.7 : badge « propriétaire inactif · **statut officiel perdu** » dans la colonne **Propriétaire**, en `--color-stale` `#746A5E` sur le fond épinglé `#F7F9F8` (**5,01:1**, mesuré en § 7.1), icône `user-round-x`, **sans clic**. Le token est celui de la variante `stale-owner` d'`IndicatorTile` (design system § 2) : un même fait, un même mot, un même token, sur tous les écrans du produit. Trois conséquences rendues visibles sans ouvrir la ligne : (a) la ligne est **comptée** dans le titre même si sa signature est valide — c'est la seule ligne que le contrôleur peut corriger seul ; (b) `Signer la v3` n'est **pas** rendue sur une ligne dont le propriétaire est inactif, et le motif est dit dans le `BulkBar` si on tente l'action groupée (« un propriétaire nommé doit être désigné avant toute relecture ») ; (c) le filtre `État de signature` propose « propriétaire inactif » comme état à part entière, ce qui en fait la revue mensuelle. L'indicateur n'est **jamais retiré** de la liste : le retirer effacerait ce que le lecteur attendait (E17). |
| **B22** | PRD §4 | Le `ProvenanceStrip` affiche, pour la version de la ligne, le nombre de **tableaux de bord** et le nombre d'**exports** qui lui restent rattachés — et c'est le seul endroit où cette information apparaît sans navigation. Le rendu E4 nomme la version qui reste effective. L'export CSV de la sélection porte pour chaque ligne son **numéro de version et sa date de signature**, donc un export de référentiel ne se déconnecte pas des versions qu'il décrit ; il reste rattaché à celles-ci même après une signature plus récente. Aucune commande de cet écran ne réécrit une version antérieure, et la `DataTable` des versions n'existe pas ici : les versions antérieures se consultent en ouvrant la ligne, en lecture. |
| **B26** | PRD §4 | La distinction `revocable` / `locked` est lisible sur la ligne sans clic : `published_at` est `null` sur une version signée → le badge porte « signée · non publiée », et l'action de révocation **est** disponible **à l'auteur seul**, en ligne, via `Ouvrir` puis la modale. `published_at` renseigné → le badge porte « signée · publiée le <date> », et **aucune** commande de révocation n'est rendue : pas de bouton, pas d'entrée de menu, pas d'infobulle qui proposerait la marche à suivre. Le seul chemin affiché est textuel : « pour la remplacer : une nouvelle version, puis une nouvelle signature ». Confondre les deux rendus ferait croire qu'une signature publiée se reprend en un clic, ce que B26 interdit ; l'export CSV porte la même distinction dans sa colonne `published_at`. |
| **E4** | PRD §4 | Le rendu 6, **composé** : deux badges empilés dans la colonne « État de signature » — `signed` en accent pour la version publiée, `in_review` en inconnu pour la version en attente — plus une troisième ligne de 12 px qui nomme la conséquence : « **2 tableaux de bord restent sur v2** ». E4 est une relation entre deux versions, pas un état d'une version : aucun état unique ne serait vrai. Le rendu est **sans clic** et il est prévu pour être lu en balayage vertical, parce que c'est le cas le plus fréquent après une modification de définition. Le même fait est repris dans le `ProvenanceStrip` et dans le panneau de confirmation de `Dupliquer comme base`. |
| **E8** | PRD §4 | Le rendu 5 est le cas visible d'E8 : « propriétaire en congé longue durée ou parti ». L'indicateur **n'est pas retiré** de la liste — il est signalé, parce que le retirer effacerait ce que le lecteur attendait. Le `BulkBar` refuse `Demander une relecture` sur ces lignes et **nomme la cause**. Le compte du titre expose « 1 sans propriétaire actif » comme le seul chiffre actionnable sans attendre un tiers. Le filtre propriétaire permet la revue nominative du parc, et `Dupliquer comme base d'une v+1` permet de réécrire la gouvernance sans perte d'historique, la version d'origine restant intacte (B1). Le remplacement demandé est **nominatif** : un nom d'annuaire, jamais un rôle. |
| **E15** | PRD §4 | Le rendu 7 : badge « périmètre résolu vide » en `#7A6A3C` sur `#F7F9F8` (**5,02:1**), icône `circle-help`, dans la **colonne Périmètre**, à côté du compte de lignes — donc lisible sans clic et **sans `0`**. Aucune valeur `0`, aucun tiret, aucune « 0 % » n'apparaît nulle part sur cet écran : le seul champ de l'entrepôt rendu ici est un `COUNT`, et il ne rend pas une mesure. Le badge est distinct de l'état `filtered-to-zero` de la table : l'un concerne une ligne, l'autre concerne un filtre, et ils ne se réparent pas de la même façon. `formule` et `perimetre` sont modifiables **uniquement** par duplication d'une nouvelle version (B1), donc corriger un périmètre vide ne réécrit jamais la version qui l'a produit. |

### 9.1 Contraintes et user stories servies

| ID | Origine | Contrainte respectée / user story servie |
|---|---|---|
| **US-1** | PRD §3 | Écran d'**entrée** de la boucle : c'est ici qu'on découvre qu'un indicateur n'a pas de définition, qu'on vérifie qu'elle a un propriétaire nommé et un signataire désigné avant de la déclarer, et qu'on suit son état. Le CTA `Déclarer une définition` mène à `/definitions/nouvelle`. Les cinq champs obligatoires de US-1 sont **nommés** dans l'état « jamais visité », donc ils sont connus avant d'ouvrir le formulaire. |
| **US-2** | PRD §3 | Le critère « le refus est expliqué en clair, pas seulement désactivé » est satisfait deux fois : le refus est **visible sur la ligne** avec son motif (rendu 4) sans qu'il faille ouvrir quoi que ce soit, et l'absence de signature en lot est **expliquée** dans le `BulkBar` plutôt que laissée deviner. Le critère « une signature est journalisée : qui, quand, sur quelle version » est rendu par le `ProvenanceStrip` et par la colonne Version. |
| **US-17** | PRD §3 | Servi **à son point d'entrée seulement** : le référentiel apprend qu'un indicateur a trois versions signées et que la dernière a changé le 14/03, sans dire pourquoi. L'écart en langue métier et les valeurs de chaque version appartiennent à `/definitions/[slug]` et à l'écran de détail de l'indicateur — c'est le point d'entrée de l'historique, pas son contenu. Le `ProvenanceStrip` de cet écran indique le nombre de versions signées, pour que la décision d'aller les lire soit informée. |
| **C1** | PRD §5 | **La manifestation de C1 sur cet écran est son absence de source de données.** Une définition est une métadonnée : elle vit dans PostgreSQL et n'existe pas dans l'entrepôt, donc l'entrepôt n'a rien à recevoir de cet écran. Le seul champ dérivé de l'entrepôt est `perimetre_resolved_row_count`, un `COUNT` en lecture seule, et aucune commande de l'écran n'écrit dans l'entrepôt. Le segment permanent du `ProvenanceStrip` l'énonce au lecteur, en permanence. |
| **C2** | PRD §5 | Aucune saisie de données métier. Recherche, filtres, tri et pagination sont un **périmètre de lecture** porté par l'URL. La seule écriture possible est la création d'une version ou l'envoi d'une demande de relecture, et les deux passent par le formulaire ou la modale, jamais par une cellule du tableau. |
| **C7** | PRD §5 | Sept états de ligne, deux notions seulement apprenables — « version » et « signature » — et un vocabulaire métier déjà présent dans l'entreprise. La formation d'une demi-journée tient dans l'écran, et l'écran ne demande pas d'apprendre une notion pour être utilisable : le compte du titre dit déjà ce qu'il faut faire. |
| **B7 / B9 / B10** | PRD §4 | Aucun droit par l'adresse : une URL restitue un état de lecture, jamais un accès. Chaque lecture du référentiel est journalisée, y compris les refus, et le journal n'est **pas** rendu ici — il se consulte dans « Accès et journal », rang 4. Aucune restriction de ligne n'est applicable : cet écran ne transporte que des métadonnées. |

### 9.2 Écarts et arbitrages ouverts

| # | Point | Ce qui a été fait dans cet écran | Arbitrage attendu |
|---|---|---|---|
| 1 | ~~Le vocabulaire de 7 états de ligne n'existait pas dans le design system~~ — **ÉCART FERMÉ, par le commanditaire à ce gate** | Le § 2.7 « États de ligne d'un référentiel » est **créé dans le design system**, avec le **contrat** : les sept états, leur couleur, leur fond de badge épinglé, leur texte, leur icône, leur précédence, et la règle qu'un état est porté par **un mot** et **jamais** par une couleur seule (PRD § 7.3). Cet écran **référence** § 2.7 et ne recopie plus la table : une table dupliquée dans trois écrans du module est une table qui diverge en silence, et c'est cette duplication qui avait produit ce gate | ~~Soit § 2.7 est ajouté au design system, soit le vocabulaire reste propre à `definitions`~~ — **fait, dans le design system**. Le § 4.1 de cet écran ne décrit plus que ce qui lui est propre : la colonne de chaque cause, la décomposition du compte d'action, le filtre. Rien à trancher |
| 2 | ~~`--color-source-unavailable` employé pour « propriétaire inactif »~~ — **ÉCART FERMÉ, par le commanditaire à ce gate** : la réutilisation est **REFUSÉE** | Le rendu 5 passe de `--color-source-unavailable` `#5B5B63` à **`--color-stale` `#746A5E`**, mesuré à **5,01:1** sur le fond épinglé `#F7F9F8` (§ 7.1). Trois raisons, toutes vérifiables. (a) La variante `stale-owner` d'`IndicatorTile` pose **déjà** `--color-stale` sur « propriétaire inactif » (design system § 2) : l'écran et le composant divergeaient, et c'est l'écran qui avait tort. (b) `tableau-de-bord-composition.md` § 7 documente mesurablement `--color-stale` à 4,79:1 sur le fond et 5,01:1 sur le fond de badge épinglé **en portant le texte de ce badge** : l'usage était déjà établi et mesuré ailleurs dans le produit. (c) Le gris froid `#5B5B63` signifie « la source est injoignable » ; un référentiel n'a pas de source, et dire « source indisponible » à une ligne dont le problème est une personne partie aurait été une **fausse alerte**. La justification de fond est conservée dans `design-system` § 2.7, avec l'explication du seul recouvrement autorisé (`projet` et `propriétaire inactif`) | ~~Soit on valide la réutilisation, soit on crée un token `owner-missing`~~ — **ni l'un ni l'autre : `--color-stale`, et aucun token nouveau**. Le contrôle `design-check tokens` n'a rien à signaler, et « pas de couleur sans signifié » est respectée : le signifié existait, il était mal adressé |
| 3 | ~~Les deux écrans frères du module mesurent `--color-text-secondary` et `--color-stale` sur des valeurs qui ne sont pas celles du design system, et en concluent à tort que trois usages doivent être restreints~~ — **Résolu** : `definition-formulaire.md` § 7 et `definition-signature.md` § 7 recalculent désormais sur `#4F5C57` = 6,33:1 et `#746A5E` = 4,79:1, et les trois restrictions d'usage qu'elles avaient dérivées sont supprimées | cet écran applique les valeurs du design system et **ne restreint aucun usage** ; les deux écrans frères sont alignés dessus | ~~réaligner les deux écrans frères sur la valeur du token~~ — fait, plus rien à trancher |
| 4 | ~~Le fond de badge est épinglé à `--color-surface-raised` alors que le design system prévoit des lignes alternées `--color-ink-100`~~ — **ÉCART FERMÉ, par le commanditaire à ce gate** | La règle est **écrite une seule fois, dans le contrat `DataTable`** : fond de badge épinglé à `--color-surface-raised` `#F7F9F8` (ou `--color-accent-subtle` pour l'état officiel, `--color-out-of-band-subtle` pour le refus), quelle que soit la parité de la ligne — avec le calcul qui l'impose : sur la ligne alternée `#E4E8E6`, `--color-unknown` tombe à **4,30:1** et `--color-stale` à **4,28:1**, soit deux textes sous 4,5:1. Un badge dont le contraste change avec la parité est un badge **parfois** illisible, et « parfois » ne se spécifie pas. Ce § 7.1 ne rejoue pas le calcul : il mesure le résultat sur les fonds que cet écran utilise | ~~Acter que le fond d'un badge d'état est une surface épinglée et le documenter dans `DataTable`~~ — **fait**, dans le composant. Les trois écrans du module y renvoient sans le recalculer |
| 5 | **`admin_crud` exige des raccourcis clavier pour les actions répétitives, et l'action la plus répétitive du référentiel est la signature** — arbitrage rendu **par le commanditaire à ce gate** | `Alt`+`S` n'existe pas et la ligne `BulkRationale` l'explique en permanence. Le groupé est **refusé**, et le **raccourci par ligne reste** : `Signer la v3` s'atteint au clavier depuis la ligne. La formulation exacte est **borné par B2**, et c'est elle qui change la nature de la discussion | **« Borné par B2 ».** B2 impose qu'une définition ne soit officielle qu'après signature horodatée d'un signataire **nommé, distinct de l'auteur de la version qu'il signe** (PRD § 4, B2). Un raccourci de groupe sur « signer » est exactement la façon de faire signer N définitions d'un seul geste : il **fabrique l'acte que la règle interdit** — il produit N actes à partir d'une intention, dont aucun n'est attribuable. « Hors exigence » se contourne (on rename l'action, on la déplace dans un menu) ; « borné par B2 » se discute, parce qu'il nomme la règle qui borne et qu'on peut alors discuter de cette règle. Le raccourci par ligne n'est pastouché : il ouvre **une** modale pour **une** version, ce que B2 autorise. **Reste ouvert** : rien sur ce point |
| 6 | La colonne « Version » rend `v3` sans dire si c'est la version **courante** ou la version **publiée** quand elles diffèrent | la ligne porte les deux quand elles divergent (rendu E4) ; quand elles coïncident, `v3` est les deux | ajouter `version · published` au pied du tableau plutôt qu'une colonne supplémentaire, pour ne pas élargir l'écran |

---

## 10. Checklist de gate

- [x] Les **9 états** sont décrits avec un rendu concret (§ 4), **plus les états de ligne** exigés par `admin_crud`, rendus sans clic et **référencés, pas recopiés** — le contrat est dans `design-system` § 2.7 (§ 4.1) — plus la décomposition du compte d'action, la seule chose que le composant ne peut pas dire (§ 4.2).
- [x] Chaque élément interactif a un comportement et un feedback : 14 lignes en § 5, dont **trois actions impossibles** documentées avec leur motif — signer en lot, dupliquer une version signée en place, et toute écriture depuis une ligne.
- [x] Le responsive est défini à **chaque** breakpoint du design system : `≤ 640`, `641 – 1024`, `1025 – 1600`, `≥ 1601`.
- [x] La section Anti-générique est cochée **et justifiée** : 7 cases, chacune avec sa justification concrète, et **deux** choix assumés et non neutres (tri par charge de travail écrit dans le titre ; état porté par la couleur et la colonne de sa cause).
- [x] Aucune valeur de design n'est laissée à « à définir » : chaque couleur est un token du design system avec sa valeur hexadécimale, chaque surface est chiffrée en px, chaque durée est un token d'animation. Les **seuls** nombres calculés dans ce document sont les **rapports de contraste de la § 7.1**, tous obtenus par la formule WCAG écrite en tête de section, jamais estimés. Le calcul qui a fondé la règle de l'épinglage (4,30:1 et 4,28:1 sur la ligne alternée) **n'est plus ici** : il est écrit une fois dans le contrat `DataTable` du design system, et cette section n'en mesure que le résultat.
- [x] Chaque ID de l'en-tête apparaît en § 9 avec l'endroit où il est visible à l'écran : **B1, B2, B3, B4, B17, B22, B26, E4, E8, E15** — les dix.
- [x] `node forge-guard.js placeholders <anchor>` ne signale rien ici.
- [x] L'écran reste cohérent avec `.forge/design/design-system.md` : les états de ligne sont ceux de **§ 2.7** (mots, icônes, fonds épinglés, précédence) et aucun ne lui est propre ; `DataTable` variante `reference` en densité `md`, `SignatureBar` dans une colonne d'état, `FormField` pour la recherche et les filtres, `ProvenanceStrip` au clic d'une ligne, `owner-picker` sans saisie libre, `--shadow-none` par défaut, valeurs en mono, aucune date de calcul à l'heure du poste, aucun blanc pur, aucun dégradé.