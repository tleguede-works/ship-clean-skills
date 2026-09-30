---
type: screen
slug: definition-signature
title: Signer ou refuser une définition
module: definitions
status: approved
generated_at: 2026-09-30
derived_from:
  - .forge/prd.md
  - .forge/design/design-system.md
rule_ids:
  - B2
  - B26
  - B1
  - B22
edge_case_ids:
  - E4
flow: signature-definition
---

# Écran — Signer ou refuser une définition

> Ce document est la **source de vérité** pour qu'une IA génère l'interface de cet écran.
> Il est généré depuis ce gabarit, jamais recopié. Aucun placeholder ne doit subsister.

---

## 1. Rôle de l'écran

| | |
|---|---|
| **Archétype d'app** | `dashboard` ; modale plein écran (layout « Plein écran », design-system §4.2) — fond assombri à 40 %, `--shadow-md` |
| **Module** | `definitions` — rang **3** dans la navigation (`state.json → index.nav`) |
| **Route** | `/definitions/[slug]/signature` |
| **Type** | `modal` plein écran (route réelle : l'URL est partageable par le signataire, le retour arrière referme proprement) |
| **Utilisateurs** | Signataire désigné — le directeur du site, le responsable de la direction signataire. L'auteur de la version est le seul autre profil qui puisse ouvrir cet écran, et seulement pour la **révocation** d'une signature non publiée. |
| **User stories servies** | US-2 |
| **Règles métier** | B2, B26, B1, B22 |
| **Edge cases** | E4 |

**Une phrase** : cet écran permet au signataire de **rendre une définition opposable, ou de la refuser avec un motif**, afin que l'officieux ne devienne jamais l'officiel par défaut.

**Pourquoi il est au rang 3 de la navigation** : même module que `definition-formulaire`, donc même rang. C'est un **sous-écran** du module `definitions` : il n'a pas de place propre dans la navigation, et il n'en prend pas. Il existe parce que la signature est un acte qui mérite un cadre fermé — on ne signe pas dans un panneau latéral au milieu d'une liste, on signe devant l'objet entier. Le rang 3 du module porte l'enjeu : c'est l'acte le plus important du produit, et c'est aussi le plus rare (une fois par mois, pas par jour). L'onglet reste donc sous `Indicateurs`.

---

## 2. Direction visuelle de cet écran

Repris du design system — **valeurs concrètes, jamais « à définir »**.

| | |
|---|---|
| **Mood** | dense, sourcée, non décorative — ici « dense » signifie **rien de superflu** : une modale de signature qui laisse de la place vide est une modale qui donne l'impression qu'il manque une décision. |
| **Densité** | **dense** — l'objet à signer est intégralement affiché, en `FormField[readonly]` sur fond `--color-surface-sunken` `#DEE3E1`, qui le distingue des panneaux `#E9EDEB` sans le rendre actif. Hauteur de ligne 20 px, un interbloc de 16 px entre les six rubriques de l'objet. |
| **Niveau de contraste** | **fort**, et c'est le seul écran où le blanc de l'objet est légitime : `--color-surface-sunken` est le fond de lecture, il porte une valeur choisie et n'est pas un blanc. L'acte de signature engage la responsabilité : rien n'y est rendu en gris faible. |
| **Surface** | Voile `--color-ink-900` `#161D1B` à 40 % sur la page ; modale `--color-surface` `#E9EDEB` sur `--color-background` `#F2F4F3` ; objet en `FormField[readonly]` sur `#DEE3E1` ; bandeau de résultat sur `--color-accent-subtle` `#D3E4E2` ; refus en `--color-out-of-band-subtle` `#F6E1DE`. Filets `#C9D0CD`. Ombre : `--shadow-md` `0 4px 12px rgba(22,29,27,0.14)` — la seule ombre du produit avec le tiroir, parce que la modale masque la page. |
| **Accent utilisé** | `--color-accent` `#0F5C57` — **uniquement** le bouton « Signer la version 3 » et le liseré gauche de la `SignatureBar`. Le bouton « Refuser » n'est jamais rouge plein : il est `--color-surface-raised` avec un filet `--color-out-of-band`, parce que refuser est un acte légitime, pas une erreur d'interface. |
| **Traitement photographique** | **AUCUN**. Ni logo, ni tampon, ni sceau, ni « signature manuscrite » dessinée. La signature est un **acte horodaté et attribué**, rendu par de la donnée (`--font-mono` pour l'horodatage), pas par un ornement — un faux sceau serait une fausse signature. |
| **Référence** | la fiche de visa d'un dossier administratif, avant la signature du responsable : l'objet à signer est intégral, l'écart avec la version précédente est écrit en clair, la barre d'action est en bas et ne bouge pas. |

### 2.1 Anti-générique — obligatoire

Cet écran ne doit ressembler **à aucun** de ces défauts :

- [x] **Pas de fond blanc pur `#FFFFFF` par défaut.** — Voile `#161D1B` à 40 %, modale `#E9EDEB`, objet `#DEE3E1`, texte `#2C3633`. Quatre valeurs, aucune n'est un blanc par défaut. Le blanc de lecture serait précisément ce qu'il ne faut pas ici : il ferait d'un acte de gouvernance un formulaire de contact.
- [x] **Pas de carte ombrée pour tout.** — Une seule ombre sur l'écran : `--shadow-md` sur la modale, justifiée parce qu'elle masque la page. `--shadow-sm` est réservé au menu « motif de refus » déroulant. Tout le reste est séparé par des filets `#C9D0CD` et par la valeur de fond.
- [x] **Pas d'uniformité** : la hiérarchie vient d'un rapport d'échelles typographiques, pas d'un espacement constant. — Titre de l'objet en `--text-h2` 18 px, version et horodatage en `--text-caption` 12 px, libellés de rubrique en `--text-overline` 11 px / 600, valeurs en `--text-body` 14 px, **formule et horodatages en `--font-mono`**. La formule est en chasse fixe : une formule en chasse proportionnelle n'est pas comparable à celle de la version précédente ligne à ligne, donc le diff de formule n'est pas lisible.
- [x] **Pas de gris neutre générique `#6B7280` par défaut.** — Aucun `#6B7280`. Refus en `--color-out-of-band` `#B23A2E`, incertitude en `--color-unknown` `#7A6A3C`, indisponible en `--color-source-unavailable` `#5B5B63`, verrouillé en `--color-stale` `#746A5E`. Un refus est rouge, une incertitude est ocre, un verrou est un brun-gris : trois intentions distinctes, jamais le même « gris d'alerte ».
- [x] **Pas de mise en page centrée symétrique par défaut.** — Modale à largeur maximale utile 1120 px, mais à **deux colonnes** : objet 7 col / conséquences 5 col, tout aligné à gauche dans la colonne objet. Le seul contenu réellement centré est le libellé de la `SignatureBar`. Une modale de signature centrée et empilée ressemblerait à une boîte de dialogue générique.
- [x] **Pas d'illustration d'appoint générique** à la place d'une vraie hiérarchie. — L'état « vous ne pouvez pas signer » est un **paragraphe qui nomme la règle et sa conséquence**, pas une icône dans un cercle, pas un cadenas dessiné, pas un dégradé. Aucun emoji, aucune mascotte (anti-références du design system).
- [x] **Pas d'une seule famille de police** si la hiérarchie demande du contraste. — Deux familles : `Inter Variable` pour le texte, `--font-mono` pour **toute** valeur chiffrée, la formule, le `slug`, les numéros de version et les horodatages. C'est ce qui permet de lire deux versions côte à côte dans le diff et de voir que `95,0 %` et `96,0 %` sont alignables.

**Choix assumé et non neutre** : **cet écran ne montre aucune valeur de l'indicateur.** Ni CA par client, ni taux de service, ni « dernière valeur publiée ». La seule tuile présente est celle des conséquences de la signature (des tableaux de bord et des exports, avec leurs dates) — pas un chiffre de l'indicateur. La raison est écrite dans le document : on signe une **règle de calcul**, pas un résultat ; afficher la valeur à côté du bouton « Signer » pousse à signer un chiffre qu'on a sous les yeux, et c'est exactement le glissement que le produit existe pour empêcher. Corollaire assumé : le bandeau d'`IdentityGuard` — le bloc qui explique à l'auteur pourquoi il ne peut pas signer — est **pleine largeur, en haut, et le premier élément focusable**, pas une infobulle au survol du bouton. Un bouton grisé apprend au gens qu'ils ont le droit mais pas le moment ; un paragraphe qui nomme B2 leur apprend pourquoi le produit existe. Enfin, la modale affiche l'objet **en entier, sans défilement obligatoire pour atteindre le bouton** : le bouton est en barre d'action fixe, mais le paragraphe d'avertissement (diff, conséquences, verrouillage) est au-dessus du pli — on ne peut pas atteindre « Signer » sans avoir vu ce qui change.

---

## 3. Anatomie

```
ModalFullscreen  1120px, --shadow-md, voile #161D1B 40 %        design-system §4.2
├── ModalHeader                                              aligné à gauche, pas centré
│   ├── Text[h2]        « CA par client »
│   ├── Text[caption]   slug monospace  ca-par-client
│   └── Text[caption]   v3 · soumise le 21/09 par N. Ferrand
├── IdentityGuard                          B2 — pleine largeur, PREMIER élément focusable
│   └── Text[body] + Text[body-sm]        pourquoi cette personne ne peut pas signer
├── SignatureBar[in_review]               B2, B26 — 6 états rendus (voir §4)
├── ObjetSplit  7 col / 5 col
│   ├── ObjetColumn  <dl>, 6 rubriques
│   │   ├── FormField[readonly]  Version        v3, horodatage de soumission
│   │   ├── FormField[readonly]  Formule        mono, aide syntaxique repliée
│   │   ├── FormField[readonly]  Cible           B14 — champ de la formule
│   │   ├── FormField[readonly]  Périmètre      + nombre de lignes résolues
│   │   ├── FormField[readonly]  Propriétaire    B3 — personne nommée
│   │   └── FormField[readonly]  Auteur         N. Ferrand, contrôle de gestion
│   ├── VersionDiff                         B1, US-2 — avant / après, langue métier
│   │   └── Toggle « voir la formule »       diff technique replié, mono, non par défaut
│   └── ConsequencesColumn
│       ├── ConsequencesPanel                E4, B16 — ce qui bascule à la signature
│       │   └── DataTable[reference]         2 tableaux de bord + 14 exports
│       ├── ExportPanel[queued]              1 export en cours, rattaché à v2 (B22)
│       └── ProvenanceStrip                  source · période · date de calcul · version
├── RefusalForm  replié par défaut          B2 — motif obligatoire
│   └── FormField[text]  Motif du refus    --color-out-of-band au focus
└── ActionBar  fixe en bas, 64px
    ├── Button[secondary]  Refuser            filet --color-out-of-band
    └── Button[primary]    Signer la version 3   --color-accent, mono sur le n° de version
```

| # | Composant | Rôle | Source |
|---|---|---|---|
| 1 | `ModalFullscreen` + `ModalHeader` | Cadre fermé de l'acte ; titre et provenance de la version | design-system §4.2 « Plein écran » |
| 2 | `IdentityGuard` | Explique **en clair** pourquoi la personne connectée ne peut pas signer (B2) — et porte, en variante `revocable`, l'action de révocation qui, elle, ne vaut pas signature | slice-local |
| 3 | `SignatureBar` | État de signature et action : `draft`, `in_review`, `signed`, `refused`, `revocable`, `locked` | design-system §2 `SignatureBar` |
| 4 | `FormField[readonly]` | Les six rubriques de l'objet à signer, en `readonly` — jamais saisissables ici | design-system §2 `FormField`, variante `readonly` |
| 5 | `VersionDiff` | Ce qui change par rapport à la version précédente, **en langue métier**, avec le diff technique replié | slice-local |
| 6 | `ConsequencesPanel` + `DataTable[reference]` | Les tableaux de bord partagés et les exports qui basculent à la signature (E4, B16) | design-system §2 `DataTable`, variante `reference` |
| 7 | `ExportPanel` | Un export en cours reste rattaché à la version signante, pas à celle qui la remplace (B22) | design-system §2 `ExportPanel` |
| 8 | `ProvenanceStrip` | Source · période · date de calcul · version, permanente et non conditionnée au survol | design-system §2 `ProvenanceStrip` |
| 9 | `RefusalForm` | Motif de refus, **obligatoire**, qui bloque l'envoi tant qu'il est vide | slice-local, sur `FormField[text]` |

---

## 4. States — tous, sans exception

| État | Déclencheur | Rendu | Feedback utilisateur |
|---|---|---|---|
| **Chargement** | Ouverture de `/definitions/[slug]/signature` — objet, version précédente, conséquences, journal de signature | Skeleton **de la forme** : six rubriques `FormField[readonly]` à hauteur conservée (la formule garde ses lignes), l'`IdentityGuard` en bloc de deux lignes, la `DataTable` en 3 lignes skeleton. La `SignatureBar` apparaît en premier : l'utilisateur sait où il est avant de savoir ce qu'il regarde. | Le titre et le numéro de version s'affichent immédiatement ; l'objet se remplit ensuite. Aucun décalage de mise en page au remplissage. |
| **Rempli** | Version `in_review`, personne connectée = signataire désigné | Modale complète : `IdentityGuard` absent, objet intégral en `readonly`, `VersionDiff` déroulé, `ConsequencesPanel` en `DataTable[reference]`, barre d'action avec « Refuser » et « Signer la version 3 ». | `SignatureBar` en `in_review` : « en attente de votre signature depuis le 21/09, 6 jours ». Le délai est affiché — une signature qui traîne six jours est une information. |
| **Vide — jamais visité** | La route est atteinte par URL alors qu'aucune version n'est en attente de **cette** personne | Message en pleine largeur : « aucune version de cette définition n'est en attente de votre signature », la liste des versions déjà signées (`DataTable[reference]`, `SignatureBar` en `signed` / `locked`) et un bouton « Fermer ». | **Pas de modale vide.** Une modale qui s'ouvre sur rien apprend au signataire que la route est un oubli ; celle-ci lui apprend où il en est. |
| **Vide — aucune donnée** | Version 1 : il n'y a pas d'écart possible avec une version précédente | `VersionDiff` affiche « version 1 — il n'y a pas d'écart à comparer », et non un tableau de diff vide avec des flèches qui ne vont nulle part. `ConsequencesPanel` affiche « aucun tableau de bord partagé ne référence cette définition ». | L'absence de comparaison est **nommée** comme telle : le signataire sait qu'il signe une première version, il ne croit pas à un bug d'affichage. |
| **Erreur de chargement** | L'objet de la définition (formule, périmètre) est injoignable au moment de la signature | **La signature est suspendue.** Bandeau `--color-source-unavailable` : « la définition n'a pas pu être chargée — la signature est suspendue, on ne signe pas un objet qu'on n'a pas pu lire », bouton `Réessayer`. La barre d'action est remplacée par un seul bouton « Fermer ». | Aucun signataire partiel, aucun envoi dégradé, aucune formule affichée « telle que connue ». Une signature est un acte : elle ne se passe pas sur un résumé. |
| **Erreur de soumission** | Signature ou refus rejeté : la version a changé pendant la lecture ; le signataire a quitté l'annuaire ; l'annuaire l'a retiré du rôle | Bandeau `--color-out-of-band` pleine largeur : « la version 3 a été modifiée pendant que vous la signiez — vous allez signer un objet qui n'est plus celui affiché » avec les commandes « Recharger la version » et « Fermer ». Pour le refus : le motif vide déclenche un message **au champ**, avec focus sur le champ ; rien n'est envoyé. | Le résultat de l'action précédente est conservé et daté ; l'écran ne se referme pas sur une erreur. Le refus sans motif ne part jamais (B2 : le refus est motivé ou il n'existe pas). |
| **Succès** | Signature acceptée | La `SignatureBar` passe en `signed` : « Version 3 signée par vous le 30/09 à 09:41 · signature journalisée · l'indicateur devient officiel ». Le bandeau `--color-accent-subtle` nomme l'effet : 2 tableaux de bord partagés basculent sur la v3. Après un refus : `SignatureBar` en `refused` avec le motif affiché, statut resté **projet**, mention « N. Ferrand est notifié du refus et du motif ». | `role="status"` + `aria-live="polite"` : la nouvelle version, l'horodatage et l'effet sont annoncés en une phrase. Le focus va sur le bandeau de résultat, pas sur le bouton qui vient de disparaître. |
| **Hors-ligne / permissions** | (a) perte de liaison ; (b) la personne connectée n'est pas le signataire désigné ; (c) la personne connectée est l'auteur de la version | (a) bandeau « signature impossible hors ligne — une signature est un acte horodaté, elle ne se reporte pas ni ne se rattrape plus tard ». L'objet reste lisible, les commandes de signer et de refuser sont **absentes** (pas désactivées). (b) même rendu que (a), motif : « vous n'êtes pas le signataire désigné de cette version ». (c) → **`IdentityGuard`**, traité ci-dessous et en § 2.1 : pleine largeur, en tête, premier élément focusable. | Le cas (c) est le seul des trois où l'écran reste entièrement utile : l'auteur y lit ce qu'il a écrit, il voit le propriétaire et le signataire désignés, et il comprend pourquoi il ne peut pas conclure lui-même. |
| **Lecture seule** | Version déjà `signed` ou `locked`, rouverte pour vérification | Objet intégral en `readonly`, `SignatureBar` en `signed` ou `locked` avec l'horodatage et l'identité du signataire, **aucune** commande de signature ni de refus. En `locked` (signée **et** publiée), la bande `IdentityGuard` affiche : « cette version a été publiée le 14/03 : elle ne se reprend plus. Pour la modifier, il faut une nouvelle version puis une nouvelle signature » (B26). | Aucune commande grisée : ce qui n'est pas possible ici n'est pas représenté. En `revocable`, l'auteur trouve en revanche « Révoquer cette signature » — la révocation n'est pas une signature, c'est son retrait, et elle est ouverte à l'auteur tant que la version n'est pas publiée. |

### 4.1 Les six états de `SignatureBar` sur cet écran

| État | Déclencheur | Rendu | Ce que l'écran permet |
|---|---|---|---|
| `draft` | Version écrite, pas encore soumise | Filet `--color-stale`, badge « projet — non soumise », auteur et date de création | Lecture seule. Aucune action : il n'y a personne à qui demander une signature, donc aucune commande. |
| `in_review` | Version soumise à un signataire désigné | Liseré `--color-accent` 3 px, badge « en attente de signature », identité du signataire, date de soumission, délai écoulé | Objet intégral + « Signer » / « Refuser ». C'est l'état principal de l'écran. |
| `signed` | Signature horodatée enregistrée | Liseré `--color-accent`, badge « officielle », nom du signataire + horodatage en `--font-mono` | Lecture seule + journal de signature (qui, quand, sur quelle version). |
| `refused` | Refus motivé | Liseré `--color-out-of-band`, badge « refusée », motif affiché en entier, signataire et horodatage | La version **reste un projet** : elle est de nouveau modifiable, et le motif est repris dans l'historique de la version. |
| `revocable` | Signée **et** non publiée | Liseré `--color-accent`, badge « signée, non publiée — révocable par l'auteur » | Autorise « Révoquer cette signature » **à l'auteur** uniquement. Révoker ne rend pas la règle fausse : elle la ramène à l'état de projet, et `IdentityGuard` rappelle alors que l'auteur ne peut toujours pas la signer lui-même. |
| `locked` | Signée **et** publiée | Liseré `--color-accent`, badge « officielle — verrouillée », mention « publiée le <date> » | Aucune révocation, aucun avertissement qui ressemblerait à une option. Le seul chemin est explicité : nouvelle version, nouvelle signature. Confondre ce rendu avec `revocable` ferait croire qu'une signature publiée se reprend en un clic — c'est exactement ce que B26 interdit. |

---

## 5. Interactions

| Élément | Événement | Comportement | Feedback visuel | État résultant | ID |
|---|---|---|---|---|---|
| Ouverture de la modale | load | Le focus entre sur le **titre** (`tabindex="-1"`), pas sur le bouton « Signer » : on ne place jamais le premier focus sur l'action irréversible | Anneau `--color-border-focus` 2 px sur le titre, masqué après 600 ms | `Chargement` → `Rempli` | — |
| `IdentityGuard` (auteur connecté) | render | Bloc pleine largeur expliquant : « vous êtes l'auteur de cette version ; B2 interdit qu'une règle rendue opposable le soit par celui qui l'a écrite. Une auto-signature ne produirait pas d'attribution, donc pas d'opposition. » Le bouton « Signer » **n'existe pas** ; il n'est ni grillé, ni masqué par CSS | Paragraphe `--text-body` + la règle citée en `--font-mono` ; pas d'icône seule | `Hors-ligne / permissions`, cas (c) | B2 |
| `IdentityGuard` (état `revocable`, auteur) | click sur « Révoquer » | Panneau de confirmation nommant la conséquence : la version redevient un projet, l'indicateur perd son statut officiel, les tableaux de bord partagés qui la référencent perdent leur caractère officiel (E17) et le portent à l'auteur | Bouton de confirmation en `--color-out-of-band`, motif facultatif | `SignatureBar` → `in_review` | B26 |
| `FormField[readonly]` (objet) | — | Aucune saisie n'est possible : pas de focus de saisie, pas de `contenteditable`, pas de collage. Le contexte est toujours sélectionnable et copiable | Valeurs `--color-text-primary`, jamais `--color-text-disabled` : ce qui est présenté en lecture seule reste lisible | inchangé | B2 |
| `VersionDiff` | render | Deux colonnes « version 2 » / « version 3 », **en langue métier** : « les lignes sous-traitées ne sont plus comptées », « le périmètre passe de toutes les agences à l'agence de Rennes ». Un bouton « voir la formule » déplie le diff technique en mono | `--color-out-of-band` sur la ligne retirée, `--color-accent` sur la ligne ajoutée, plus un **texte** « retiré » / « ajouté » | inchangé | B1 |
| `VersionDiff` | render (v1) | Message « il n'y a pas d'écart à comparer » | — | `Vide — aucune donnée` | B1 |
| `ConsequencesPanel` | render | Nomme les 2 tableaux de bord partagés qui basculeront sur la v3 **et** ceux qui resteront sur la v2 tant que la v3 n'est pas signée — c'est E4, pas B16 seule | `DataTable[reference]` : titre du tableau, personnes partagées, date de partage | inchangé | E4 |
| `ExportPanel` | render (B22) | Un export en cours reste rattaché à la **version 2** et le dit : « produit sur la version 2 — il le restera après la signature de la version 3 ». Un export déjà produit n'est jamais réécrit | État `queued` avec son identifiant en mono | inchangé | B22 |
| `Button[primary]` « Signer » | click | Ouvre une confirmation courte rappelant l'identité de la version (« Vous signez la version 3 de CA par client, écrite par N. Ferrand ») puis envoie. Double action, parce que l'acte engage la responsabilité | Bouton `loading` avec largeur conservée ; l'objet passe en `FormField[readonly]` pendant l'envoi | `Succès` → `signed` | B2 |
| `Button[secondary]` « Refuser » | click | Déplie `RefusalForm` ; le focus va au champ motif ; le libellé devient « Refuser avec ce motif ». Le refus **n'est pas** un bouton rouge de suppression : c'est une réponse motivée | `RefusalForm` en `--duration-normal` (160 ms) `--ease-out`, focus sur le champ | `Rempli` → refus en cours | B2 |
| `RefusalForm` (motif) | submit vide | Aucun envoi. Message au champ : « un refus sans motif n'est pas un refus » ; le champ porte `--color-out-of-band` | `role="alert"` | `Erreur de soumission` | B2 |
| `SignatureBar` (`locked`) | render | Aucune commande de révocation n'est rendue ; la bande d'explication nomme la date de publication et le chemin de contournement légitime | Mention `--color-stale` « verrouillée » | `Lecture seule` | B26 |
| Modale | `Échap` | Ferme **seulement** si aucune action n'est en vol ; sinon le raccourci est neutralisé et un message le dit | — | retour à l'appelant, focus restauré sur le déclencheur | — |
| Modale | trap de focus | `role="dialog" aria-modal="true"`, focus confiné, `Tab` cyclique ; à la fermeture, le focus revient sur l'élément qui a ouvert la modale | — | — | — |
| Historique de signature | render | Bande listant **qui, quand, sur quelle version** : signature, refus, révocation. La consultation de cet historique est elle-même journalisée (B24) | `DataTable[reference]` en `--text-caption` | inchangé | B1 |

- **Focus / clavier** : ordre = titre → `IdentityGuard` (s'il est présent) → objet (lecture) → `VersionDiff` et son dépliant → conséquences → barre d'action. Le **premier** focus n'est jamais le bouton d'action irréversible. `Échap` ferme, `Tab` est confiné, et à la fermeture le focus revient au déclencheur. Tous les boutons ont un nom explicite qui porte la version : « Signer la version 3 », jamais « Signer » — deux fenêtres de signature ne doivent jamais se confondre.
- **Gestes** : aucun geste obligatoire. Le clic sur le voile **ne ferme pas** la modale : c'est un acte de signature, une fermeture accidentelle coûte un aller-retour au signataire. La fermeture passe par `Échap` ou par « Fermer », toujours.
- **Animations** : ouverture `--duration-slow` (240 ms) `--ease-in` sur l'opacité et un translation de 8 px ; fermeture `--duration-fast` (90 ms) `--ease-out`. Changement d'état de `SignatureBar` `--duration-normal` (160 ms) `--ease-default`, **changement de couleur sémantique seul**. Dépliage du `RefusalForm` `--duration-normal`. **Aucune valeur chiffrée ne bouge, aucun compteur ne défile** : un horodatage qui s'anime est un horodatage qu'on ne peut pas lire pendant qu'il bouge.
- **Retour arrière** : l'URL est réelle, donc le retour navigateur referme la modale et rend la page appelante dans son état précédent (filtres, position de défilement). Si une action est en vol, le retour est intercepté et annoncé : « signature en cours, elle ne peut pas être interrompue ». Après succès, le retour arrière ne peut pas faire disparaître la confirmation — elle est rendue dans la page appelante.

---

## 6. Responsive

| Breakpoint | Comportement | Ce qui se replie / disparaît |
|---|---|---|
| **Mobile** `≤ 640px` | **Non livré au MVP** (lecture seule sur téléphone, US-15 en V2). La route rend un message explicite : « la signature se fait depuis un poste de bureau » — **jamais** une modale amputée, **jamais** une version mobile avec le bouton désactivé. La signature mobile serait le pire des deux mondes : un acte horodaté signé sur un écran de 360 px. | Disparaissent : la modale, ses deux colonnes, la barre d'action. Reste : le message et le lien de retour. |
| **Tablet** `641 – 1024px` | La modale devient une feuille plein écran sur toute la hauteur, largeur 100 %, une seule colonne : `IdentityGuard`, `SignatureBar`, objet, `VersionDiff`, conséquences. Barre d'action **collante en bas**, 64 px, toujours visible. L'objet défile, la barre ne défile pas. | Se replient : les deux colonnes de `VersionDiff` deviennent deux lignes empilées par entrée (« avant : … » / « après : … ») ; la colonne « personnes partagées » de la `DataTable` passe sous le libellé. |
| **Desktop** `1025 – 1600px` | Modale centrée, largeur utile **1120 px**, hauteur `calc(100vh - 64px)`. Objet 7 col / conséquences 5 col. L'objet et le diff sont **au-dessus du pli** : le bouton est visible sans avoir fait défiler. | Rien ne disparaît. Seul le `ExportPanel` passe de `queued` à une ligne compacte quand l'identifiant dépasse la largeur de colonne. |
| **Wide** `≥ 1601px` | Largeur utile 1440 px, objet 8 col / conséquences 4 col. La formule passe de 6 à 8 lignes. Le `VersionDiff` gagne une colonne « type d'écart » (ajout / retrait / modification) sans jamais écraser le libellé métier. | Rien de plus — et surtout pas de largeur infinie : un diff de formule sur 2000 px se lit moins bien que sur deux lignes, la comparaison côte à côte est le but. |

- **Cible tactile** : sur `641 – 1024px`, les deux boutons d'action font **48 px** de haut, séparés de 24 px — jamais un bouton adjacent à 8 px, parce que « Refuser » et « Signer » sont deux actes de portée opposée et qu'un clic raté sur le mauvais change l'état du produit. Sur `≥ 1025px`, 40 px, hauteur dense assumée. Le `Toggle` « voir la formule » fait 32 px de haut sur desktop et 44 px sur tablet.
- **Débordement** : garanti de ne jamais déborder — (a) la formule **défile horizontalement** dans son `FormField[readonly]` (`overflow-x: auto`, mono, `white-space: pre`) au lieu de se replier : une formule repliée n'est plus la formule qu'on est censé signer ; (b) la barre d'action est hors du conteneur défilant, donc elle ne peut pas être masquée par l'objet ; (c) la `DataTable` des conséquences défile horizontalement avec la colonne « tableau de bord » en `sticky` ; (d) les motifs de refus longs s'habillent en `overflow-wrap: anywhere` — sauf les `slug` et les `source_ref`, qui restent en mono et défilent.

---

## 7. Accessibility

- [x] Contraste **9,6:1** pour le texte de l'objet : `--color-text-primary` `#2C3633` sur `--color-surface-sunken` `#DEE3E1` (**11,3:1** sur le fond de page). Les valeurs de l'objet ne sont **jamais** rendues en `#7E8A85`, y compris les valeurs que l'on ne peut pas modifier : une information non modifiable n'est pas pour autant moins importante. `#7E8A85` est un token de filet — 3,24:1, conforme au seuil de 3:1 des éléments non textuels, mais sous le seuil de 4,5:1 du texte.
- [x] Contraste **6,6:1** pour le texte d'accent : `--color-accent` `#0F5C57` sur `#E9EDEB` (7,1:1 sur le fond de page) — bouton « Signer », liseré de la `SignatureBar`, liens.
- [x] Contraste **5,0:1** pour le refus : `--color-out-of-band` `#B23A2E` sur `#E9EDEB` (5,4:1 sur le fond de page) et **4,7:1** sur `--color-out-of-band-subtle` `#F6E1DE` — filet du bouton « Refuser », messages de refus, badge `refused`. Au-dessus de 4,5:1 sur les deux fonds. Accompagné d'un mot (« refusée », « hors cible ») et d'une icône, jamais de la seule couleur (exigence 7.3 du PRD).
- [x] Contraste **5,0:1** pour l'état verrouillé : `--color-stale` `#746A5E` sur le fond épinglé du badge `--color-surface-raised` `#F7F9F8` (**4,79:1** sur le fond de page) — règle déjà écrite dans `definitions.md` § 7.1, cet écran s'y aligne. Un verrou n'est pas une faute : il ne doit pas ressembler à un refus.
- [x] **Contraste 6,33:1 pour `--color-text-secondary` `#4F5C57`**, recalculé sur la valeur du design system §1.1 : **6,33:1** sur `#F2F4F3`, **5,9:1** sur la modale `#E9EDEB`, **6,6:1** sur `#F7F9F8`, **5,4:1** sur l'objet en `readonly` `#DEE3E1`. **Conforme sur les quatre fonds de cet écran** : le secondaire porte les `source_ref`, les horodatages de dépôt et d'envoi, les libellés de rubrique et les messages d'aide **sans réserve**. La restriction aux seuls libellés non essentiels est **supprimée** — elle mesurait 4,2:1 sur un couple couleur/fond qui n'existe pas dans le design system.
- [x] Navigation clavier complète sur `--bp-desktop` : focus confiné dans la modale (`aria-modal`), ordre logique, `Échap` ferme, retour du focus sur le déclencheur, aucun piège de tabulation au retour.
- [x] Focus visible (tokens `--focus-ring` = `--color-border-focus` 2 px) sur le titre à l'ouverture, sur chaque champ, chaque bouton, chaque ligne de `DataTable`, et sur le dépliant du diff. Jamais supprimé — y compris sur un `FormField[readonly]`, qui reste sélectionnable.
- [x] ARIA : `role="dialog" aria-modal="true" aria-labelledby` (titre) et `aria-describedby` pointant sur l'`IdentityGuard` — **la raison de l'interdiction est donc lue en entrant dans la modale**, pas seulement au survol du bouton. L'objet est un `<dl>` sémantique (6 rubriques), `VersionDiff` est un tableau avec `<th scope="col">`. Le bandeau de résultat est `role="status"` + `aria-live="polite"` ; les erreurs d'envoi sont `role="alert"`. Le focus se déplace sur le bandeau de résultat après succès, pas sur un bouton disparu. Chaque bouton porte un `name` qui inclut la version (« Signer la version 3 »).
- [x] Alternatives textuelles : aucune image, donc aucune alternative à écrire. Le refus d'auto-signature est rendu par du texte ; un cadenas en icône serait un `aria-label` sur une illustration, c'est-à-dire une information qui n'existe que pour qui la voit.
- [x] Langue et direction de lecture correctes : `lang="fr"`, `dir="ltr"`. Les identifiants de source, les `slug` et les horodatages ne sont pas traduits (7.4) et restent en `--font-mono` pour rester alignables.
- [x] Signature jamais portée par la seule couleur **ni** par la seule gestuelle : l'état `signed` porte un badge textuel « officielle », un nom et un horodatage ; l'état `locked` porte « verrouillée » et sa date de publication.

---

## 8. Données

| Champ | Type | Origine | Requis | Erreur possible |
|---|---|---|---|---|
| `version` | entier + `signed_at` | serveur | oui | version modifiée pendant la lecture → refus d'envoi, rechargement demandé |
| `formule` | texte mono, multi-ligne | serveur (C1) | oui | objet non chargé → **signature suspendue**, jamais d'envoi sur un résumé |
| `cible` | nombre + unité | serveur, même version (B14) | non | absente → ligne rendue « aucune cible déclarée », jamais 0 |
| `perimetre` | énumération + nombre de lignes résolues | serveur | oui | ne résout aucune ligne → E15 rendu dans l'objet : « périmètre résolu vide », le signataire le voit avant de signer |
| `proprietaire_id` | identifiant de personne | serveur, `owner-picker` en `readonly` (B3) | oui | personne inactive → `SignatureBar` porte « propriétaire inactif », la signature reste possible mais l'avertissement est visible |
| `auteur_id` | identifiant de personne | serveur, `readonly` | oui | inactif → l'écran le signale ; l'objet reste signable |
| `signataire_designe_id` | identifiant de personne | serveur | oui | personne_connectée ≠ signataire désigné → refus d'accès, motif affiché |
| `diff_precedente` | liste d'écarts (libellé métier, type) | serveur | non | version 1 → message « pas d'écart à comparer », pas un tableau vide |
| `dashboards_impactes` | liste (titre, personnes, date de partage) | serveur | oui | liste vide → « aucun tableau de bord ne référence cette définition » |
| `journal_signature` | liste (qui, quand, quelle version, acte) | serveur | oui | vide → tableau `empty-never-visited`, pas d'historique fantôme |
| `signature_id` | identifiant, à l'écriture | serveur | oui | refus d'écriture → bandeau `Erreur de soumission`, la modale reste ouverte |

- **Chargement** : **un seul bloc**, pas de pagination. L'objet est intégralement rendu avant que la barre d'action ne soit active : on ne signe pas ce qui n'a pas fini de charger. L'historique de signature est plafonné aux 10 derniers actes, avec un compteur « N actes antérieurs » qui ouvre un drawer.
- **Cache / hors-ligne** : **aucun cache d'écriture**. L'objet est mis en cache de lecture (30 min) pour survivre à une reconnexion, mais la signature elle-même n'est jamais mise en file d'attente hors ligne : une signature hors ligne ne serait ni horodatée par le serveur, ni journalisée au bon moment. Reconnecté, l'écran recharge et repasse par `in_review`.
- **Données sensibles** : **l'écran ne transporte aucune ligne de données** de l'indicateur et **aucune valeur** de l'indicateur (voir le choix assumé en § 2.1). Seul le journal de signature est retourné, limité aux actes : qui, quand, quelle version, quel acte. La modale ne connaît pas l'existence de filtres métier, de critères de restriction de lignes, ni du détail d'un export autre que son identifiant et sa version — si l'export est en cours, seul son rattachement de version est affiché, pas son contenu. La signature elle-même est journalisée à l'instant de l'acte (US-2) et n'est jamais réinscrite ni purgée depuis l'interface (C4).

---

## 9. Traçabilité

| ID | Origine | Manifestation sur cet écran |
|---|---|---|
| **B2** | PRD §4 | Deux fois. (a) L'objet à signer est complet et en `readonly` : version, formule, cible, périmètre, propriétaire, auteur, écart avec la version précédente. (b) `IdentityGuard` : si la personne connectée est l'auteur, **pleine largeur, en tête, premier élément focusable, `aria-describedby` sur la modale** — la raison est lue à l'entrée. Le bouton « Signer » **n'existe pas** (ni grillé, ni masqué) ; il en va de même pour « Refuser ». Le texte cite la règle et sa raison : une règle rendue opposable par son auteur ne produit pas d'attribution, donc pas d'opposition. Critère US-2 « le refus est expliqué en clair, pas seulement désactivé ». |
| **B26** | PRD §4 | Rendu `SignatureBar` `revocable` (signée, non publiée) avec l'action de révocation ouverte **à l'auteur**, et rendu `locked` (signée, publiée) **sans aucune action**, avec la seule phrase qui ouvre la voie : « nouvelle version, nouvelle signature ». `IdentityGuard` explique pourquoi la révocation n'est pas une signature, pour que l'action ne soit pas comprise comme une contre-signature. La confirmation de révocation nomme la conséquence : perte du statut officiel, tableaux de bord partagés non officiels (E17). |
| **B1** | PRD §4 | L'écran travaille sur **une** version identifiée, jamais sur « la définition » au sens large : `v3`, horodatage de soumission, auteur de cette version. `VersionDiff` rend l'écart avec la version précédente en langue métier, avec repli du diff technique. L'historique de signature liste chaque acte avec sa version. Aucune commande de cette modale n'écrit dans une version existante. |
| **B22** | PRD §4 | `ExportPanel` porte « produit sur la version 2 — il le restera après la signature de la version 3 » : les artefacts déjà produits restent rattachés à la version qui les a produits. `ConsequencesPanel` distingue les tableaux de bord qui basculent de ceux qui restent sur la v2 tant que la v3 n'est pas signée. |
| **E4** | PRD §6 | `ConsequencesPanel` : « 2 tableaux de bord partagés référencent cette définition ; ils resteront sur la version 2 tant que la version 3 n'est pas signée », avec le titre et les personnes nommées de chaque tableau de bord. L'information est au-dessus du pli : on ne peut pas atteindre « Signer » sans l'avoir croisée. |
| **US-2** | PRD §3 | Écran entier. Les cinq critères d'acceptation sont adressés : signature horodatée d'un signataire distinct (B2) · refus expliqué en clair (B2, `IdentityGuard`) · signature journalisée « qui, quand, quelle version » (bandeau de succès + historique) · refus avec motif obligatoire, version restant en projet (état `refused`) · révocable jusqu'à publication seulement (`revocable` / `locked`). |

---

## 10. Checklist de gate

- [x] Les 9 états sont décrits avec un rendu concret, plus les **6 états de `SignatureBar`** (§ 4.1).
- [x] Chaque élément interactif a un comportement et un feedback.
- [x] Le responsive est défini à **chaque** breakpoint du design system (`≤640`, `641–1024`, `1025–1600`, `≥1601`).
- [x] La section Anti-générique est cochée et justifiée (7 cases + un choix assumé).
- [x] Aucune valeur de design n'est laissée à « à définir ».
- [x] Chaque ID B*/E* de l'écran apparaît en section 9 : B1, B2, B22, B26, E4, US-2.
- [x] `node "$FORGE/scripts/forge-guard.js" placeholders <anchor>` ne signale rien ici.
- [x] L'écran reste cohérent avec `.forge/design/design-system.md` : tokens, `SignatureBar` et ses six états, `FormField[readonly]`, `ProvenanceStrip` permanente, `--shadow-md` réservé à la modale.