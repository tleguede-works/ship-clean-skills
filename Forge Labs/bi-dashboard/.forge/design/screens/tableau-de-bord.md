---
type: screen
slug: tableau-de-bord
title: Un tableau de bord
module: tableau-de-bord
status: approved
generated_at: 2026-09-30
derived_from:
  - .forge/prd.md
  - .forge/roadmap.md
  - .forge/benchmarks.md
  - .forge/design/design-system.md
rule_ids:
  - B5
  - B7
  - B8
  - B9
  - B16
  - B27
edge_case_ids:
  - E4
  - E5
  - E6
  - E7
  - E8
  - E17
flow: lecture-tableau-de-bord
---

# Écran — Un tableau de bord

> Ce document est la **source de vérité** pour qu'une IA génère l'interface de cet écran.
> Il est généré depuis le gabarit, jamais recopié. Aucun emplacement non résolu ne doit subsister.

---

## 1. Rôle de l'écran

| | |
|---|---|
| **Archétype d'app** | `dashboard` |
| **Module** | `tableau-de-bord` — **rang 2** de la navigation |
| **Route** | `/tableaux-de-bord/comite-mensuel-aout?periode=2026-08&equipe=commercial` |
| **Type** | `page` |
| **Utilisateurs** | DG / comité (1× par mois, en séance, écran projeté) · Manager d'équipe (quotidien) · Lecteur (hebdomadaire) |
| **User stories servies** | US-3 (consulter un indicateur officiel), US-6 (publier et partager), US-7 (ne pas voir ce à quoi on n'a pas droit), US-9 (exporter pour une réunion) |
| **Règles métier** | B5, B7, B8, B9, B16, B27 |
| **Edge cases** | E4, E5, E6, E7, E8, E17 |

**Une phrase** : cet écran permet à la direction de **voir exactement les mêmes chiffres que ceux qui les ont publiés**, afin de trancher en séance sans recalculer.

**Pourquoi il est au rang 2 de la navigation** : fréquence 4 sur 5, centralité 4 sur 5. On lit un indicateur **tous les jours** (rang 1) ; on consulte un tableau de bord **à l'approche d'une réunion**, donc moins souvent — mais le tableau, pas l'indicateur, est l'objet que la direction regarde et que le contrôleur publie. Le placer au rang 1 aurait mis l'instrument de travail quotidien au-dessus de l'objet de séance ; le mettre au rang 4, auprès du journal, aurait traité l'écran que le comité ouvre comme une préoccupation de conformité. Le rang 2 est le seul qui dise les deux : **moins fréquent que l'indicateur, plus structurant que le reste**.

**Cas d'usage précis** : 09 h 00, séance mensuelle de comité, 8 personnes, un écran de 1920 px projeté. Le contrôleur a partagé le tableau à une liste de 6 personnes nommées. Chacun ouvre, l'écran affiche les mêmes valeurs, les mêmes dates de calcul, les mêmes versions signées. Personne ne sort un tableur. **Aucune tuile n'est cliquable pour un modifier ; toutes le sont pour la comprendre** (clic = ouvrir la décomposition, § `Interactions`).

---

## 2. Direction visuelle de cet écran

Repris du design system — **valeurs concrètes, jamais « à définir »**.

| | |
|---|---|
| **Mood** | dense, sourcée, non décorative — ici sans la tension d'un outil d'exploration : la page doit se tenir debout, immobile, devant 8 personnes |
| **Densité** | **dense** — justifié par le format projeté : à 3 mètres, une page aérée ne montre que deux indicateurs, et le comité compare des chiffres qu'il n'a pas le temps de faire défiler (design-system §0). `IndicatorTile` en `md` (chiffre 40 px, hauteur **172 px** — design system § 2, Tailles), 4 par ligne sur `--bp-wide` |
| **Niveau de contraste** | **fort** — 11,3:1 pour le texte courant, 7,1:1 pour l'accent, 5,4:1 pour l'écart hors cible, 4,8:1 pour « fraîcheur inconnue », 4,8:1 pour « non officiel ». C'est le seul écran du produit qui doit être lu à 3 mètres, donc le seul où la **valeur** d'une tuile reste en `--color-text-primary` et n'est jamais rendue en `--text-caption` 12 px. Ce choix est une exigence de lecture à 3 mètres, **pas** une compensation de contraste : `--color-text-secondary` `#4F5C57` est à **6,33:1** sur le fond, il porte donc sans réserve les dates de calcul et les sources de la `ProvenanceStrip` |
| **Surface** | `--color-surface` `#E9EDEB` sur `--color-background` `#F2F4F3` ; les tuiles sont séparées par un filet `--color-border` 1 px, **jamais** par une ombre (`--shadow-none` sur toute la page) |
| **Accent utilisé** | `--color-accent` `#0F5C57` — filet gauche 3 px de la tuile `official`, bordure du `PeriodScopeBar`, et fond `--color-accent-subtle` `#D3E4E2` de la seule zone d'état « tableau officiel ». Il sert à dire « ceci est opposable », pas à décorer |
| **Traitement photographique** | **AUCUN**. Ni logo, ni mascotte, ni illustration d'accueil, ni fond de séance. La page est le support de projection : tout ce qui n'est pas un chiffre, sa date ou sa provenance est du bruit |
| **Référence** | la planche d'un rapport de comité printed et hung au mur — un tableau dense, des chiffres alignés, une date sous chaque chiffre — et non l'écran d'accueil d'un outil BI, qui est une page vide avec des cartes colorées et un message de bienvenue |

### 2.1 Anti-générique — obligatoire

Cet écran ne doit ressembler **à aucun** de ces défauts :

- [x] Pas de fond **blanc pur** `#FFFFFF` par défaut — le fond porte la valeur, même minime. `--color-background` `#F2F4F3`, choisi pour cette raison précise : un blanc pur projeté en salle est éblouissant et fait vibrer le texte.
- [x] **Pas de carte ombrée pour tout.** `--shadow-none` sur la page entière. Les tuiles sont des **cellules d'une grille** délimitées par des filets 1 px `--color-border`, alignées sur la grille 12 colonnes ; un conteneur qui contient deux éléments n'est pas une carte. Ombre réservée à `--shadow-sm` pour l'infobulle de la `PeriodScopeBar` et à `--shadow-lg` pour l'export en cours de génération.
- [x] **Pas d'uniformité** : la hiérarchie vient d'un rapport d'échelles typographiques. `--text-h1` 24 px (titre du tableau) → `--text-display` 40 px (chiffre de tuile, 56 px en `lg` sur `--bp-wide`) → `--text-h3` 15 px (intitulé d'indicateur) → `--text-overline` 11 px (labels du `PeriodScopeBar`) → `--text-caption` 12 px (date de calcul, source). Le saut le plus large, 24 → 40 px, est placé exactement là où il sert : c'est le seul chiffre que le comité doit accrocher du regard.
- [x] **Pas de gris neutre générique** `#6B7280` par défaut — les neutres sont choisis : `#4F5C57` (secondaire), `#7E8A85` (tertiaire), `#7A6A3C` (chaud, « fraîcheur inconnue »), `#746A5E` (non officiel), `#5B5B63` (froid, source indisponible). Cinq gris qui disent cinq choses différentes — un écran qui n'aurait qu'un seul gris ne pourrait pas distinguer « je ne sais pas » de « ce n'est pas prêt ».
- [x] **Pas de mise en page centrée symétrique** par défaut. Le titre est aligné à gauche dans la grille 12 colonnes, la `PeriodScopeBar` est calée à droite sur la même ligne, la `ProvenanceStrip` occupe toute la largeur en bas. La grille des tuiles est centrée **parce que la comparaison l'exige** (4 colonnes égales), pas par défaut.
- [x] **Pas d'illustration d'appoint générique** (icône employée, gradient abstrait) à la place d'une vraie hiérarchie. Aucun dégradé nulle part (anti-référence explicite du design system), aucune icône décorative. Les seules icônes portent un état et sont **toujours** doublées d'un texte : « hors cible », « frais », « source indisponible », « non officiel ».
- [x] **Pas d'une seule famille de police** si la hiérarchie demande du contraste. Deux familles assumées : `--font-sans` pour les intitulés, `--font-mono` à chasse fixe avec `tabular-nums` pour **tout** chiffre, toute date, tout `source_ref`, tout numéro de version. C'est ce qui rend 4 chiffres alignables en colonne, donc comparables d'un coup d'œil à 3 mètres.

**Choix assumé et non neutre** : **en séance projetée, la page ne défile pas.** À `≥1601px`, la grille des tuiles, la `PeriodScopeBar` et la `ProvenanceStrip` tiennent ensemble dans la hauteur de l'écran sans défilement vertical : la grille des tuiles est le **seul** contenu qui se réorganise, et elle se réorganise par nombre de tuiles, pas par scroll. Un tableau de bord projeté qui défile est un tableau de bord dont le comité voit des chiffres disparaître et réapparaître — il compare alors des valeurs qu'il n'a pas vues en même temps, ce qui est précisément la faute que ce produit existe pour supprimer. Corollaire assumé : **la `PeriodScopeBar` et la `ProvenanceStrip` sont les deux seules zones à hauteur fixe et à contraste renforcé de la page**, tout le reste est une grille de chiffres sur fond neutre. Et une seconde décision, non moins contestable : **il n'y a aucun graphique sur cet écran**. Une courbe dans un tableau de bord de comité n'est pas un indicateur, c'est une illustration dont l'axe ment sur la période — la flèche de variation est écrite en pourcentage à côté du chiffre, en mono, sans courbe.

---

## 3. Anatomie

```
AppShell                                        (design-system §3.1)
├── Sidebar 240px                               (design-system §3.2 — module courant surligné)
│   ├── 1 Indicateurs
│   ├── 2 Tableaux de bord   ← module courant
│   ├── 3 Définitions
│   └── 4 Accès et journal
├── Breadcrumbs                                  (design-system §3.3)
│   └── Tableaux de bord › Comité mensuel — août 2026
└── main · layout « Page dashboard » puis « Page projetée » ≥1601px (design-system §4.2)
    │
    ├── Ligne de titre · 12 colonnes, 1 ligne, hauteur fixe 56 px
    │   ├── div (8 col)  h1 « Comité mensuel — août 2026 »   --text-h1
    │   │   └── OfficialityBadge  « tableau officiel »         (slice-local — porte B16/E17)
    │   │       └──.OwnershipLine  « publié par Nadia Ferrand le 28/08/2026 »
    │   └── PeriodScopeBar (4 col, aligné à droite)            (design-system §4.2)
    │       ├── FormField select  période  « août 2026 »      ← URL
    │       ├── FormField select  équipe    « Équipe Nord »    ← URL
    │       └── « 6 personnes nommées · aucun lien public »    (slice-local — porte B9)
    │
    ├── VersionNotice × N                                       (slice-local — porte B16, E4)
    │   └── « CA par client : version 4 en attente de signature. Cette valeur reste sur
    │         la version 2 signée le 28/08/2026. »  filet gauche 2 px --color-stale
    │
    ├── Grille de tuiles · 12 colonnes, 4 par ligne ≥1601px, aucune ombre, filets 1 px
    │   ├── IndicatorTile md variante=official  ×4
    │   │   ├── label · value (--text-display 40px, mono) · target
    │   │   ├── threshold  « seuil < 1 200 000 € du 28/08/2026 »                     ← B11
    │   │   │              AU MVP : la valeur, le sens et la date du seuil. C'est tout,
    │   │   │              et c'est déjà trois faits de la version signée.
    │   │   │              En V1 s'y ajoute la mention de la machine à états :
    │   │   │              « signalé le 02/09/2026 06:00 · aucune nouvelle alerte
    │   │   │              tant que la valeur reste hors zone »        ← B12, slot optionnel
    │   │   │              (absente si aucun seuil n'est déclaré)
    │   │   ├── computed_at « 02/09/2026 04:12 » --font-mono        ← B5, slot requis
    │   │   ├── source_ref  « mat_ca_client_v2_2026-09-02 »         ← B5, slot requis
    │   │   └── status  « officiel » | « hors cible » | « fraîcheur inconnue » | « non officiel »
    │   │   └── (état permission_denied → la tuile N'EST PAS RENDUE, aucun placeholder)   ← E5
    │   └── IndicatorTile lg  (variante de taille, au-dessus de 1600px uniquement)
    │       └── la ligne threshold passe en --text-body-sm : à 3 m, « signalé le 02/09 06:00 »
    │           doit se lire sans rapprocher l'œil du texte d'à côté
    │
    ├── ExportPanel                                               (design-system §2 · ExportPanel)
    │   ├── état idle : « Exporter » ▾ → « PDF (présentation) » · « CSV (données) »
    │   │   └── ProvenanceExportPreview  (slice-local — B27, aperçu AVANT de générer)
    │   │       └── « PDF : 6 pages, une page de provenance en tête, pied de page sur chaque
    │   │             page : version 2 · signée le 28/08/2026 · calculé le 02/09/2026 ·
    │   │             mat_ca_client_v2_2026-09-02 · exporté par Sophie Marchand le 30/09/2026 »
    │   └── états queued · running · ready · failed · forbidden_scope  (E6, E13)
    │
    └── ProvenanceStrip  fixe en bas de page, hauteur 48 px, TOUJOURS visible
        └── « 6 indicateurs · version 2 des définitions, signées le 28/08/2026 · calculé le
              02/09/2026 04:12 · sources : mat_ca_client_v2_…, mat_taux_service_v1_… ·
              export : — »   --text-caption --font-mono
```

| # | Composant | Rôle | Source |
|---|---|---|---|
| 1 | `AppShell` + `Sidebar` | chrome, navigation de rang 1 à 4 | design-system §3.1, §3.2 |
| 2 | `Breadcrumbs` | `Tableaux de bord › Comité mensuel — août 2026` | design-system §3.3 |
| 3 | `PeriodScopeBar` (2 × `FormField select`) | période et équipe, **écrites dans l'URL** — un tableau partagé restitue l'état autorisé | design-system §4.2 (« barre de périmètre ») + §2 · FormField |
| 4 | `OfficialityBadge` | dit si le tableau est officiel ou non, et depuis quand | slice-local (B16, E17) |
| 5 | `VersionNotice` | signale qu'une version plus récente attend une signature, et nomme la version signée réellement affichée | slice-local (B16, E4) |
| 6 | `IndicatorTile` (`md` 172 px, et `lg` au-dessus de 1600 px) | chaque valeur avec sa cible, sa **ligne de seuil** (au MVP : valeur, sens et date — B11 ; en V1 : plus les horodatages de la machine — B12), sa date de calcul, sa source, son état sémantique | design-system §2 · IndicatorTile, § 2.1 `ThresholdMachine` |
| 7 | `ExportPanel` | déclencher l'export et porter son état | design-system §2 · ExportPanel |
| 8 | `ProvenanceExportPreview` | montre, **avant** de générer, la provenance qui sera imprimée sur le support | slice-local (B27) |
| 9 | `ProvenanceStrip` | bande permanente en bas de page : calculé le · sources · versions · signé par | design-system §2 · ProvenanceStrip |

> **Aucun `SignatureBar` sur cet écran.** Signer est un acte d'administration qui appartient à l'écran `definitions` (rang 3). Un lecteur qui voit un `SignatureBar` comprendrait qu'il peut signer ; ici il ne peut rien. Le `SignatureBar` n'apparaît que comme **donnée** : l'identité du signataire et la date de signature sont écrites en clair dans la `ProvenanceStrip` et dans le `VersionNotice`.
>
> **Aucun `DataTable` sur cet écran.** Le tableau de bord est une grille de valeurs, pas une liste de lignes : descendre dans les lignes est le rôle de l'écran `decomposition`, atteint en un clic sur chaque tuile. Ce qui est ici, c'est l'agrégat daté et sourcé.

---

## 4. États — tous, sans exception

| État | Déclencheur | Rendu | Feedback utilisateur |
|---|---|---|---|
| **Chargement** | ouverture de l'URL, ou changement de `periode` / `equipe` | **6 skeleton de tuile**, hauteur **172 px** conservée (taille `md` du design system), un rectangle pour le chiffre, une ligne pour la date et **une ligne à la place de la ligne `threshold`**, à la même place qu'à l'état rempli. Les `VersionNotice`, l'`OfficialityBadge` et la `ProvenanceStrip` sont **déjà rendus** s'ils sont connus, parce qu'ils décrivent l'objet, pas sa valeur. Le squelette ne recouvre jamais la `ProvenanceStrip` | Aucun spinner global. Le dessin tient en place, donc la page ne « saute » pas en se remplissant. Budget de performance : **moins de 2 secondes** sur le périmètre usual d'une équipe, source comprise (PRD § 7.1) |
| **Rempli** | la source a répondu, périmètre filtré | 6 tuiles rendues dans l'ordre de composition, filet 1 px entre elles, `ProvenanceStrip` complète, `ExportPanel` en `idle`. Chaque tuile porte ses 7 slots : `label`, `value`, `target`, `threshold`, `computed_at`, `source_ref`, `status` — la ligne de seuil est rendue ici (**décision écrite, § 9.2 point 1**) — au MVP avec la valeur, le sens et la date du seuil (B11). **Cet écran ne porte pas la machine de franchissement dans cette version** : les quatre états sont **V1** (§ 4 « Franchissement » et « Réarmement », § 9.2 point 2). | Aucun. La seule action visible au repos est le survol d'une tuile — **porté par le fond relevé et la couleur sémantique du chiffre, jamais par la seule bordure** (voir § 7) — et il **n'affiche aucune information supplémentaire** : tout est déjà à l'écran. **Aucun toast, aucune bannière, aucun compte à rebours, aucune animation** sur un franchissement : c'est un état durable et daté, pas une notification |
| **Vide — jamais visité** | impossible sur cet écran : un tableau de bord partagé à une liste nominative (B9) n'existe pas sans indicateurs publiés | Si l'URL est atteinte en direct et qu'aucun tableau n'existe sous ce `slug` pour cet appelant : rendu identique à « Rempli », zone de contenu vide et texte unique « Ce tableau de bord n'existe pas. » **Plus** → `indicateurs`. C'est un 404 rendu, pas une page d'accueil | Aucun lien de partage, aucun code d'invitation, aucun « créer un tableau » pour un lecteur : ce n'est pas son rôle (l'écriture est portée par l'écran `composition`) |
| **Vide — aucune donnée** | la source ne renvoie aucune ligne pour **tous** les indicateurs sur la période (E2) | Les tuiles passent en état `no_data` : **aucun chiffre, aucun `0`**, aucun tiret. Message par tuile : « aucune donnée sur la période ». La `PeriodScopeBar` propose « Élargir à septembre 2026 ». La `ProvenanceStrip` **reste affichée et datée** : elle décrit le tableau, pas ses valeurs | Le bouton propose une période voisine précise. Un indicateur sans ligne et un indicateur à zéro sont deux faits différents, et l'écran ne les confond jamais |
| **Erreur de chargement** | source injoignable (E1), ou requête refusée sur le périmètre | Par tuile, **pas** de bandeau global : une tuile en état `source_unavailable` affiche la **dernière valeur connue**, en `--color-source-unavailable` `#5B5B63` (6,1:1), avec sa date de calcul et la mention « source indisponible ». La `ProvenanceStrip` porte la même mention. Bouton `Réessayer` dans la `PeriodScopeBar` | L'écran ne devient pas illisible à cause d'une panne (PRD § 7.5) : six valeurs datées valent mieux qu'un écran vide. Le `Réessayer` rejoue avec le périmètre **courant de l'URL**, il n'élargit rien |
| **Erreur de soumission** | seule « soumission » : l'export. `ExportPanel` en état `failed` (E13) : **aucun fichier partiel proposé**, message « La génération a échoué. Aucun fichier n'a été produit. » + `Réessayer`. `ExportPanel` en état `forbidden_scope` (E6) : export **refusé** sur une période plus large que celle du tableau, avec le périmètre exact qui serait autorisé (« du 01/01/2026 au 30/09/2026 · Équipe Nord ») et la commande pour le demander explicitement | Erreur **au panneau**, jamais un toast. Un export échoué doit laisser une trace lisible après le départ de l'utilisateur : c'est un support de réunion, pas une action jetable |
| **Succès** | export terminé, ou changement de périmètre appliqué | `ExportPanel` en état `ready` : lien de téléchargement + **date d'expiration** datée, + la provenance reprise dans le panneau. Sur changement de périmètre : contenu remplacé en place, `--duration-fast` 90 ms, nouvelle date de calcul immédiatement visible dans les 6 tuiles et dans la `ProvenanceStrip` | Aucun toast de « export réussi ». Le panneau reste ouvert avec son lien daté : c'est un objet, pas une notification transitoire |
| **Franchissement** — **V1, non rendu au MVP** | B12 / US-4 / E9 : la machine à états de la tuile est dans un état autre que `not_applicable` (design-system § 2.1 — `not_applicable` signifie « pas de machine »), donc `out_of_band_alerting`, `out_of_band_alerted` ou `threshold_latched` | **Ce que le MVP rend, et c'est écrit ici plutôt que déduit** : la tuile porte la ligne `threshold` en `--text-caption` avec **la valeur du seuil, son sens et sa date** (B11) — « seuil < 1 200 000 € du 28/08/2026 » — et, si un seuil n'est pas déclaré, **aucune** ligne de seuil. Un dépassement reste `out_of_band` : chiffre `--color-out-of-band` sur `--color-out-of-band-subtle`, `triangle-alert` « hors cible de 1,2 pt ». Ni badge `bell-ring`, ni mention d'état, ni horodatage de franchissement, ni compteur de passages : ces quatre choses sont des produits de la machine à états, et `roadmap.md` § 2.1, § 2.2 et § 3.1 la placent **en V1**. **Rendu complet (V1)** : la ligne `threshold` porte en plus **une seule** des trois mentions hors zone — « hors cible de 1,2 pt · alerte de ce passage » (avec « franchi le JJ/MM/AAAA HH:MM »), « hors cible · déjà signalé » (avec « signalé le JJ/MM/AAAA HH:MM · aucune nouvelle alerte tant que la valeur reste hors zone »), ou « hors zone depuis le 2ᵉ passage · aucune nouvelle alerte » — et `threshold_latched` ajoute le compteur de passages. La `ProvenanceStrip` **n'est modifiée ni dans un cas ni dans l'autre** : elle décrit le tableau, pas l'état d'un seuil | **Aucun toast, aucune bannière, aucun compte à rebours, aucune vibration, aucune animation de badge** — au MVP comme en V1, et c'est la même règle qui produit les deux. La transition `out_of_band_alerting → out_of_band_alerted` **ne produit aucun rendu** : confirmer un envoi n'est pas une information pour le lecteur. La couleur ne change pas entre ces états : un franchissement est un dépassement comme un autre |
| **Réarmement** — **V1, non rendu au MVP** | B12 / US-4 critère 3 : la valeur est revenue dans la zone normale depuis un franchissement constaté, donc `threshold_armed` | **Ce que le MVP rend à la place** : exactement l'apparence « dans la cible » du composant — chiffre `--color-text-primary`, fond `--color-surface`, badge « dans la cible » — plus la ligne `threshold` du seuil (valeur, sens, date). Le mot « réarmé » n'apparaît nulle part au MVP : un réarmement n'existe pas sans machine. Aucune autre tuile ne bouge, la grille ne se recompose pas. **Rendu complet (V1)** : la tuile porte « seuil réarmé le JJ/MM/AAAA HH:MM » dans la ligne `threshold`, et le compteur de passages repart à zéro | **Silencieux, et c'est le point.** Aucune alerte de « bon », aucun toast, aucun bandeau, aucune animation, aucun changement de couleur sémantique : la tuile était déjà dans la couleur « dans la cible ». Le réarmement se **constate** dans la ligne `threshold` |
| **Hors-ligne / permissions** | **E5** — un indicateur du tableau est interdit à ce lecteur : **la tuile n'est pas rendue**, aucun placeholder, aucune ligne grisée, aucun « accès refusé », aucun compteur « 5 sur 6 indicateurs ». La grille se recompose sur les 5 tuiles autorisées. **Le refus est journalisé côté serveur** avec l'identité, l'indicateur visé et le motif, **jamais** avec le détail des lignes (B25) | Aucune trace à l'écran. Un placeholder « accès refusé » **confirme l'existence** de l'indicateur, ce qu'E5 interdit explicitement. Le seul effet visible est un tableau plus court — et c'est la bonne nouvelle, pas une panne. **B7** : la tuile absente n'est pas dans le DOM, pas dans le payload, pas dans le cache ; l'exclusion est appliquée à la donnée, pas à l'affichage |
| **Lecture seule** | **toujours**, sans exception : C2 interdit toute saisie de données métier, et l'écriture d'un tableau de bord est portée par l'écran `composition` | Aucun bouton « modifier », « réorganiser », « dupliquer », « retirer ». Une tuile est un **lien vers sa décomposition** (US-5), pas un point d'entrée d'édition. Le `PeriodScopeBar` ne propose que la restriction du périmètre d'origine, jamais un élargissement | Le contrôleur qui veut changer le contenu de ce tableau n'a rien à faire ici : il doit passer par `composition`, où chaque indicateur est coché nommément. Une action d'édition accessible en lecture serait une action non journalisée (B10) |

---

## 5. Interactions

| Élément | Événement | Comportement | Feedback visuel | État résultant | ID |
|---|---|---|---|---|---|
| `IndicatorTile` (n'importe laquelle) | `tap` / `Enter` | ouvre la décomposition de cet indicateur, **en conservant `periode` et `equipe` de l'URL** : la restriction de l'écran d'origine est la même que celle du drill-down | `--duration-fast` sur le remplacement de contenu ; pas d'ombre portée au survol, seulement fond relevé + bordure | navigation vers `decomposition` | US-5, B15 |
| `FormField select` période | `change` | écrit `periode` dans l'URL (`replace`, pas `push`), relance avec le périmètre de l'URL. **Aucune restriction au-delà de ce que la source contient** : c'est le lecteur qui choisit la période qu'il consulte, dans les droits qu'il a | champ `loading` bref, grille remplacée en 90 ms, **les valeurs ne bougent pas** (aucune animation de compteur) | Chargement → Rempli / Vide — aucune donnée / Erreur de chargement | US-3, B7 |
| `FormField select` équipe | `change` | écrit `equipe` dans l'URL. Si l'équipe sort du périmètre du lecteur : `403 SCOPE_DENIED` **avant** tout appel à l'entrepôt, avec la liste des équipes manquantes | message au champ : « Vous n'avez pas accès à l'équipe Marchés Nord. » — l'écran ne se vide pas | Erreur de soumission, périmètre précédent conservé | B7 |
| `PeriodScopeBar` — sélecteur de période (survol / focus) | `hover` | `Période au 02/09/2026 04:12 pour les 6 indicateurs · sources alignées` — c'est le **seul** tooltip du produit, et il ne porte que le résumé d'un fait déjà visible dans les 6 tuiles | `--color-surface-raised` `#F7F9F8` + `--shadow-sm` + `--radius-sm` | inchangé | B5 |
| `VersionNotice` | `tap` sur « version 4 en attente de signature » | ouvre l'historique des versions de l'indicateur (écran d'historique, journalisé comme consultation) | `--duration-fast` | navigation | US-17, B24 |
| `OfficialityBadge` | `tap` | **non interactif** : il n'ouvre rien. Son contenu est intégralement dans la `ProvenanceStrip` et dans la `VersionNotice`, il ne sert que d'accroche visuelle en séance | curseur `default`, pas d'état survol autre que le texte | inchangé | B16 |
| `ExportPanel` — « Exporter » | `click` | déplie le choix du format **et** l'aperçu de provenance `ProvenanceExportPreview`, avant toute génération | `--duration-normal` 160 ms sur l'ouverture | `idle` → `ready` à lancer | B27 |
| `ExportPanel` — « PDF (présentation) » | `click` | lance une tâche de fond. `ExportPanel` passe `queued` (identifiant de tâche affiché) puis `running` (progression). **La navigation n'interrompt pas l'export** : l'utilisateur peut changer de période, de tableau, quitter l'écran | panneau non modal, persistant, avec son identifiant | `queued` → `running` → `ready` | US-9, B27 |
| `ExportPanel` — « CSV (données) » | `click` | idem, format données : une ligne par indicateur, colonnes `indicateur, valeur, cible, unité, version, signée_le, calculé_le, source_ref, exporté_le, exporté_par` | idem | `queued` → `running` → `ready` | B8, B27 |
| `ExportPanel` — demande de période plus large | `submit` | **refusé** : état `forbidden_scope`. Le message nomme le périmètre exact qui serait autorisé et la commande pour le demander explicitement. L'export ne peut **jamais** élargir le périmètre de l'écran | panneau en `--color-out-of-band` avec la mention « périmètre plus large non exportable depuis cet écran » | `forbidden_scope` | E6, B8 |
| `ExportPanel` — échec de génération | — | état `failed` : **aucun fichier partiel proposé**, message d'échec, `Réessayer` | panneau en `--color-out-of-band` | `failed` | E13 |
| `ProvenanceStrip` | survol / focus clavier | **rien**. Elle est permanente, donc le survol n'a rien à révéler. Elle est focusable pour qu'un lecteur d'écran puisse la relire | anneau `--color-border-focus` 2 px | inchangé | B5, B10 |
| Deux lecteurs, même tableau, 4 secondes d'écart (E7) | — | pas d'action : les deux lectures affichent **chacune sa `computed_at`**, prise dans la source. Si la matérialisation a été rafraîchie entre les deux, les deux écrans sont cohérents et la différence est **visible et non ambiguë** (deux dates, deux identifiants de source) — c'est le comportement correct, pas un bug | la `ProvenanceStrip` et les 6 tuiles portent des dates qui peuvent différer entre deux lecteurs ; aucune n'est « rafraîchie » localement à l'affichage | inchangé | E7 |
| Touche `P` | `keydown` | place le focus sur le sélecteur de période (raccourci de séance : « on va voir le mois prochain ») | anneau focus | inchangé | — |

- **Focus / clavier** : ordre `Sidebar` → `Breadcrumbs` → bouton « Exporter » → `PeriodScopeBar` (période puis équipe) → grille de tuiles (**une seule tabulation pour les 6 tuiles**, puis `↑ ↓ ← →` pour se déplacer dans la grille, `Enter` pour ouvrir la décomposition) → `ExportPanel` → `ProvenanceStrip` (focusable). `Home` / `End` vont à la première et à la dernière tuile de la rangée. Le survol de la souris n'est **jamais** requis : en séance projetée, personne n'a de souris, et tout ce que le survol pourrait révéler est déjà affiché en permanence (anti-règle : une donnée de contrôle ne vit pas dans un état caché).
- **Gestes** : **aucun.** Ni swipe, ni pull-to-refresh, ni long-press. Raison métier : un rafraîchissement déclenché par l'utilisateur afficherait l'heure du dernier fetch, or B5 impose la date de calcul **prise dans la source**. En séance, « je tire pour actualiser » produirait un écran où six chiffres viennent de changer sans que personne sache pourquoi — exactement le problème que ce produit supprime. Le rafraîchissement est fait par la source, il se **constate**, il ne se provoque pas.
- **Animations** : `--duration-fast` 90 ms / `--ease-default` au seul remplacement de la grille ; `--duration-normal` 160 ms / `--ease-in` à l'ouverture du `PeriodScopeBar` déplié et de l'aperçu d'export. **Aucune animation sur une valeur chiffrée** : pas de compteur, pas de `count-up`, pas de défilement. Le seul mouvement autorisé sur la donnée est le changement de couleur sémantique d'une tuile (passage dans la cible ↔ hors cible), en `--duration-normal` — et il ne se produit qu'au rechargement, jamais au survol. Un cadre projeté a un taux de rafraîchissement qui peut découpler la fréquence : une animation longue devient saccadée et illisible.
- **Retour arrière** : le périmètre vit dans l'URL, donc le retour arrière restaure **exactement** la vue précédente — même période, même équipe, y compris après un partage. Un tableau partagé n'a pas d'« état de session » à perdre.

---

## 6. Responsive

| Breakpoint | Comportement | Ce qui se replie / disparaît |
|---|---|---|
| **Mobile `≤ 640px`** | Rendu **autorisé en lecture seule** (le design system le prévoit ; US-15 reste en V2, le MVP ne le livre pas). Sidebar absente, pas de tiroir. Une tuile par ligne, `IndicatorTile` en `sm` (chiffre 24 px) — jamais `md`, qui déborderait. Titre sur 2 lignes, `PeriodScopeBar` sous le titre, alignée à gauche. `ProvenanceStrip` **non fixe**, rendue en fin de document : sur un écran de 640 px elle occuperait un tiers de la hauteur pour un fait que personne ne peut lire en tenant. La ligne `threshold` passe sur **deux lignes** — le seuil d'un côté, la mention d'état et sa date de l'autre — sur le même principe que sur `indicateurs` : elle n'est **jamais tronquée**, elle est repliée (règle permanente du composant, design system § 2, Tailles). Au MVP elle ne porte que la valeur, le sens et la date du seuil. `ExportPanel` en corps de flux, pas en panneau collant | La cible de l'export passe sous le texte « même périmètre que cet écran » ; le détail de la provenance imprimée reste visible dans l'aperçu. Aucune **valeur** n'est supprimée : sur téléphone on consulte, on n'a pas le confort de survoler |
| **Tablet `641–1024px`** | 2 tuiles par ligne. `PeriodScopeBar` passe sur sa propre ligne, pleine largeur, alignée à droite. `ExportPanel` en panneau compact, l'aperçu de provenance se déplie en pleine largeur. `ProvenanceStrip` fixe, hauteur 40 px | Le `OwnershipLine` (« publié par … le … ») se réduit à la date. L'aperçu de provenance dans le `ExportPanel` passe de 6 lignes à 2 lignes + lien « voir le détail » ; le contenu est identique, seule la hauteur visible change |
| **Desktop `≥ 1025px` (jusqu'à 1600)** | Layout « Page dashboard » : titre 8 col + `PeriodScopeBar` 4 col sur une ligne de 56 px, `IndicatorTile` en `md` (40 px), 3 par ligne, `ProvenanceStrip` fixe 48 px. Défilement vertical possible au-delà de 6 tuiles | Rien n'est masqué. C'est le format de travail du manager et de l'analyste |
| **Comité projeté `≥ 1601px`** | Layout « Page projetée » du design system : **sidebar masquée**, 4 tuiles par ligne, `IndicatorTile` en **`lg`** (chiffre 56 px, hauteur 220 px). **La ligne `threshold` passe en `--text-body-sm` et occupe deux lignes** — au MVP : le seuil d'un côté, sa date de l'autre ; en V1 : l'indicateur d'un côté, la mention d'état et sa date de l'autre, pour que « déjà signalé le 02/09 06:00 » reste lisible sans rapprocher l'œil du texte d'à côté. À 3 m, c'est la ligne qui répond à la première question du comité : « qu'est-ce qui va nous poser problème aujourd'hui ? » Elle ne disparaît à aucun breakpoint. Deux lignes de 220 px + bandeau + `ProvenanceStrip` = la page entière tient **sans défilement vertical**. C'est le format qui décide de cette promesse, et il n'a pas bougé : en `md`, la grille de 6 tuiles à 4 par ligne (4 + 2) fait 2 × 172 = 344 px de haut, soit 96 px de moins que le même nombre de tuiles en `lg`. La `PeriodScopeBar` passe en 4 colonnes de largeur fixe alignées à droite, plus lisibles à 3 m que 2 sélecteurs compacts. Le titre passe en `--text-h1` 24 px sur une ligne pleine largeur, avec le `OwnershipLine` sous le titre | Rien. **Aucun contenu n'est retiré au format comité** : si 7 indicateurs sont publiés, la 7ᵉ tuile passe sur une 3ᵉ rangée plus courte, la grille devient 4 + 3 et la `ProvenanceStrip` reste fixe. Ce qui disparaît au-dessus de 1600 px, c'est la `Sidebar` — que personne ne regarde depuis un fauteuil |

- **Cible tactile** : 44 × 44 px minimum sur toutes les tuiles (les tuiles font 220 px de haut en `lg`, la cible est la tuile entière) et sur les sélecteurs et le bouton d'export. Les zones `--space-md` (8 px) de la grille ne sont **pas** cliquables : elles ne sont que du gap, et un gap cliquable est un piège d'interface.
- **Débordement** : **garanti de ne jamais déborder** — (1) toute valeur chiffrée est en `--font-mono` avec `tabular-nums`, largeur de colonne fixe, `overflow: hidden` + ellipse : en `lg` sur un écran étroit, `12 480 000 €` ne passe jamais à la ligne, donc une tuile ne peut pas s'allonger et décaler la rangée ; (2) un intitulé d'indicateur long passe à **deux lignes maximum** puis ellipsé, la tuile garde sa hauteur fixe (220 px en `lg`) — une grille de hauteurs variables est illisible en rangée ; (3) la `ProvenanceStrip` tronque les `source_ref` **par la fin** de la chaîne et conserve en entier la date de calcul et les numéros de version, parce que ce sont eux qui portent B5 et B27 ; (4) la grille ne défile **pas** horizontalement à aucun breakpoint : en dessous de 1025 px le nombre de colonnes diminue, il ne se réduit pas ; (5) un export lancé puis une navigation ne perd jamais son `ExportPanel` : il revient dans une barre de notification persistante portant l'identifiant de tâche ; (6) **la ligne `threshold` ne passe jamais sur trois lignes et n'est jamais tronquée** — règle permanente du composant (design system § 2, Tailles), en `sm`, en `md` et en `lg` : si la place manque, elle remonte sur deux lignes pleines largeur sous la tuile plutôt que de perdre une date. C'est précisément pour cela que la taille `md` est passée de 148 px à **172 px** : à 148 px, les sept slots ne tenaient pas, et la complétude de la ligne dépendait donc du format d'écran — un même composant, deux rendus. Une mention de franchissement tronquée perdrait la date du franchissement, donc l'alerte deviendrait invérifiable.

---

## 7. Accessibilité

- [x] Contraste **11,3:1** pour le texte courant — `--color-text-primary` `#2C3633` sur `--color-background` `#F2F4F3` (mesuré). Le chiffre de tuile en `--text-display` est le texte le plus contrasté de l'écran.
- [x] Contraste **7,1:1** pour l'accent `--color-accent` `#0F5C57` (mesuré) — filet gauche de la tuile officielle, bordure de la `PeriodScopeBar`, texte du `OfficialityBadge` sur `--color-accent-subtle` `#D3E4E2` (**5,9:1**, mesuré).
- [x] Contraste **4,7:1** pour le hors cible `#B23A2E` sur le fond de tuile `#F6E1DE` (**5,4:1** sur le fond de page, mesuré) ; **4,8:1** pour `--color-unknown` `#7A6A3C` (fraîcheur inconnue) ; **6,1:1** pour `--color-source-unavailable` `#5B5B63` (source indisponible). Aucun état de la tuile ne descend sous 4,5:1.
- [x] Navigation clavier complète sur **desktop, tablette et mobile** : grille en `role="grid"`, `aria-colcount` fixe, `↑ ↓ ← → Home End` pour les tuiles, `Enter` pour ouvrir la décomposition. Le `PeriodScopeBar` est atteignable en 2 tabulations depuis le haut de la page.
- [x] Focus visible : anneau `--color-border-focus` `#0F5C57` 2 px, **jamais supprimé** (`outline: none` interdit), y compris sur une tuile dont le filet gauche est déjà `--color-accent` (l'anneau est alors doublé d'un décalage de 2 px pour rester distinct).
- [x] ARIA : chaque tuile est un `role="gridcell"` contenant un `link` étiqueté « CA par client, 1 043 800 euros, cible 1 200 000 euros, calculé le 2 septembre 2026 à 4 h 12, hors cible, officiel » — l'étiquette porte **tous** les faits de la tuile, donc un lecteur d'écran n'a rien à reconstruire. **Le nom accessible concatène aussi la ligne de seuil** quand elle existe, dans l'ordre des faits que la ligne porte : au MVP « seuil inférieur à 1 200 000 euros du 28 août 2026 » ; en V1, dans le même ordre que les horodatages de la machine, « …, signalé le 2 septembre 2026 à 6 heures, alerte déjà émise, aucune nouvelle alerte tant que la valeur reste hors zone ». Au MVP, un lecteur d'écran n'entend donc pas « rien ne sera renvoyé » — parce qu'aucune alerte n'est émise dans cette version, et que le dire serait annoncer un fait qui n'existe pas. `aria-live="polite"` sur la `ProvenanceStrip` (elle change au rechargement) ; `role="status"` sur l'état d'`ExportPanel` ; `aria-busy="true"` sur la grille pendant le chargement, pour éviter l'annonce de 6 skeletons. Aucun `aria-live` sur les chiffres eux-mêmes : en séance projetée, une lecture automatique d'un nouveau total serait un commentaire audio dans une réunion.
- [x] Alternatives textuelles : **aucune image, donc aucune alternative à produire.** Les seules icônes (hors cible, source indisponible, non officiel, frais) sont des icônes de police `aria-hidden="true"`, **toujours doublées d'un texte** — aucune information n'est portée par la couleur seule (PRD § 7.3). Le `OfficialityBadge` porte le mot « officiel » ou « non officiel », jamais une couleur.
- [x] Langue et direction de lecture correctes : `lang="fr"`, `dir="ltr"`, montants en `fr-FR` (`1 043 800 €`, espace insécable, jamais `1,043,800.00`), dates `jj/mm/aaaa hh:mm`, heure de la source dans le fuseau de l'entrepôt et non celui du poste. Les noms propres de clients et les `source_ref` ne sont jamais traduits.
- [x] **Contrainte de lecture à 3 mètres (PRD § 7.3)** : corps minimal de `--text-body-sm` 13 px, **jamais** `--text-caption` 12 px pour une valeur ; les valeurs de tuile en `--text-display` 40 px (56 px en `lg`) ; pas d'information portée uniquement par la taille ou la couleur. La `ProvenanceStrip` est en `--text-caption` 12 px **uniquement** au-dessus de 1025 px, où elle est lue de près ou par un président de séance ; au format projeté elle passe en `--text-body-sm` 13 px.
- [x] **Tokens recalculés sur les valeurs du design system §1.1, et une règle d'usage qui en découle** : `--color-stale` `#746A5E` est à **4,79:1** sur le fond (mesuré) — il passe le seuil AA, donc le badge « non officiel » et la `VersionNotice` **peuvent** le porter en texte, et le font ; sur le fond épinglé du badge `--color-surface-raised` `#F7F9F8` il est à **5,01:1**. `--color-border-strong` `#7E8A85` est à **3,24:1** sur le fond : c'est une bordure, donc un élément non textuel, et elle **tient** le seuil de 3:1 que WCAG 1.4.11 exige pour la limite d'un composant — mais avec 0,24 de marge, sur un filet de 1 px lu à 3 mètres par 8 personnes. La conséquence appliquée ne porte donc plus sur une conformité, mais sur la redondance : l'état `hover` d'une tuile **ne repose jamais sur sa seule bordure**. Le changement d'état est porté par le fond (`--color-surface` relevé), par la couleur sémantique du chiffre et par l'anneau de focus `#0F5C57` (7,1:1). Un signal dont la seule fonction est de dire « tu es ici », porté par un filet à la marge minimale, est un signal qu'on ne double pas.

---

## 8. Données

| Champ | Type | Origine | Requis | Erreur possible |
|---|---|---|---|---|
| `dashboard_slug` | slug kebab-case | URL | oui | `404` — identique à un tableau non visible pour l'appelant |
| `periode` | `AAAA-MM` | query param | oui | période absente de la source → `422` au champ, périmètre précédent conservé |
| `equipe` | slug | query param | non (défaut : périmètre du lecteur) | hors périmètre → `403 SCOPE_DENIED` avec la liste des équipes manquantes |
| `title` | chaîne | serveur | oui | — |
| `is_official` | booléen | serveur | oui | `false` → `OfficialityBadge` « non officiel » + `IndicatorTile` en variante `provisional` ou `stale-owner` (E17) |
| `published_at` | timestamp | serveur | oui | `null` → badge « jamais publié » ; l'écran reste consultable |
| `published_by` | identité nommée | serveur | oui | identité partie → « auteur inconnu », jamais un identifiant technique |
| `indicators[]` | tableau **déjà filtré** des indicateurs visibles pour l'appelant | serveur, après résolution de droits | oui | **la réponse ne contient jamais** un indicateur interdit (E5) : il n'est pas filtré côté client |
| `indicators[].value` | decimal | source | oui | `null` → état `no_data` (E2), **jamais `0`** |
| `indicators[].target` | decimal `null` | version signée de la définition | non | `null` → badge `--color-unknown` « cible à reconfirmer » (E16) |
| `indicators[].computed_at` | timestamp | **snapshot dans l'entrepôt** | oui | `null` → `--color-unknown` « fraîcheur inconnue », **jamais l'heure du poste** (B6) |
| `indicators[].source_ref` | identifiant de matérialisation | serveur | oui | absent → mention « source non identifiée » en `--color-source-unavailable`, jamais un identifiant reconstruit |
| `indicators[].definition_version_id` | uuid | serveur | oui | — |
| `indicators[].threshold` | objet **ou `null`** | **versionné avec la définition signée qui le porte** (B11) ; jamais saisi ici, jamais dans un écran séparé | non | `null` → **aucune** ligne `threshold` : un indicateur sans seuil a un écart, pas une alerte. En V1 s'y ajoute `threshold_state: not_applicable`, donc pas de badge `bell-ring` non plus |
| `indicators[].threshold_state` — **V1** | enum `not_applicable` \| `armed` \| `disarmed` | machine de franchissement (design-system § 2.1), évaluée côté serveur sur la séquence de snapshots **de la période affichée**. **Le MVP ne demande pas ce champ** : il n'a aucun consommateur sur cet écran | oui (V1) | `not_applicable` → rien n'est rendu sur le franchissement. Un `threshold_state` rendu alors que `threshold` est `null` est un invariant rompu : la tuile passe en `out_of_band` sans ligne d'alerte. **Jamais servi tel quel depuis le cache court** : il est réévalué sur la séquence du jour, sinon une seconde alerte semble partie alors qu'aucune ne l'est |
| `indicators[].threshold_crossed_at` — **V1** | timestamp **ou `null`** | `computed_at` du snapshot où la valeur a quitté la zone normale — jamais `Date.now()`. Non demandé au MVP | oui si `threshold_state = disarmed` (V1) | `null` pendant un franchissement en cours → état `out_of_band_alerting` |
| `indicators[].threshold_alerted_at` — **V1** | timestamp **ou `null`** | `computed_at` du snapshot qui a constaté l'émission de l'alerte du passage. Non demandé au MVP | oui si `threshold_state = disarmed` (V1) | `null` → l'écran dit « alerte de ce passage » et **ne prétend pas** qu'elle est partie |
| `indicators[].threshold_rearmed_at` — **V1** | timestamp **ou `null`** | `computed_at` du snapshot qui a constaté le retour dans la zone normale. Non demandé au MVP | non (nullable) | `null` tant que le seuil n'a jamais été réarmé → la ligne ne porte que le seuil, sans historique |
| `indicators[].threshold_pass_count` — **V1** | entier | nombre de franchissements depuis le dernier réarmement ; **incrémente, ne déclenche rien**. Non demandé au MVP | oui (défaut 0), V1 | un compteur qui réémet une alerte à l'incrément viole B12 : il est là pour que le **silence** soit lisible |
| `indicators[].signature` | identité + timestamp | version signée | si `is_official` | absente → variante `provisional`, badge « non officiel » |
| `indicators[].pending_version` | uuid `null` | serveur | non | `true` → `VersionNotice` : la valeur reste sur la version signée (B16, E4) |
| `indicators[].owner_active` | booléen | annuaire | oui | `false` → variante `stale-owner` (B17, E8) |
| `scope_allowed_for_export` | période + équipes | serveur | oui | période demandée plus large → `ExportPanel` en `forbidden_scope` (E6) |
| `access_list_size` | entier | serveur | oui | affiché comme « 6 personnes nommées », **jamais** comme une liste de noms sur l'écran de lecture : les noms des autres droits appartiennent au contrôleur |
| `export_job` | objet `{ id, state, progress, expires_at }` | serveur, tâche de fond | non | `failed` → aucun fichier partiel proposé (E13) |

- **Chargement** : **tout d'un bloc**, 6 tuiles, budget **moins de 2 secondes** source comprise (PRD § 7.1). Aucune pagination sur cet écran : un tableau de bord se lit d'un tenant, et un nombre d'indicateurs par page en séance est un arbitrage que personne n'a demandé. Si la composition dépasse 12 indicateurs, la grille gagne une rangée et la page défile — au-dessus de 1600 px, ce cas est signalé à la composition, pas masqué à la lecture.
- **Cache / hors-ligne** : le dernier résultat **reste affiché et daté**, avec la mention `source_unavailable` et sa `computed_at`. Le cache ne contient que des indicateurs **déjà filtrés par les droits de la session** ; il est vidé à la déconnexion et à la perte d'un droit, jamais partagé entre deux identités (E14). **Le cache ne contient jamais d'indicateur interdit** : c'est la même règle que B7 appliquée au stockage local, sans quoi la tuile exclue réapparaîtrait auhors ligne.
- **Données sensibles** : la réponse ne contient **aucun** indicateur interdit (E5) et **aucune** ligne de détail — la restriction de lignes est appliquée à la donnée en amont, jamais au rendu. Le journal d'accès enregistre chaque consultation avec l'identité, l'indicateur, le périmètre, la période et l'issue (B10) ; un refus enregistre la **ressource visée**, **jamais** le détail des lignes (B25). Une 5xx porte l'identifiant de requête et le `error_code`, **jamais** la payload brute. Les `source_ref` sont des identifiants métier : ils vont dans le journal d'accès, pas dans la ligne d'erreur technique. Chiffrement au repos, isolation par ligne, PITR et politique de rétention sont des **prérequis de mise en production** (C4, C10) : cet écran est celui qui circule entre les mains du comité, donc celui où leur absence se verrait le plus vite.

---

## 9. Traçabilité

| ID | Origine | Manifestation sur cet écran |
|---|---|---|
| US-3 | PRD | § 3 : chaque `IndicatorTile` porte ses 7 slots, dont `computed_at` et `source_ref` (criteres d'acceptation de US-3). § 4 « Rempli ». § 5 : la tuile ouvre la décomposition, ce qui est le standard « chaque visuel est cliquable vers son détail » de l'archétype |
| B11 | PRD | La ligne `threshold` de la tuile écrit le seuil **lu dans la version signée qui le porte**, avec sa valeur, son sens et **sa date** : « seuil < 1 200 000 € du 28/08/2026 ». Il n'existe **aucun** moyen de poser un seuil sur cet écran (C2) : la seule porte est la forme de définition, dans un autre module. Quand aucun seuil n'est déclaré, la tuile porte `threshold_state: not_applicable` et **aucune** ligne d'alerte n'apparaît — c'est le rendu du design system § 2.1, pas une variante de cet écran. Une version postérieure qui change le seuil **ne réécrit pas** le franchissement de la valeur affichée (B22) |
| B12 | PRD | **Au MVP, cette règle n'est pas rendue par cet écran, et c'est un arbitrage de version, pas un oubli** (§ 9.2 point 2). Ce que le MVP rend vient de B11 et B14 : la ligne `threshold` avec la valeur, le sens et la date du seuil, et l'écart signé hors cible. Les quatre états de la machine, leurs trois horodatages et `threshold_pass_count` sont **V1** (`roadmap.md` § 2.1, § 2.2, § 3.1). **Le rendu complet est écrit et reviendra tel quel** : celui de `design-system` § 2.1, sans variante locale — `out_of_band_alerting` (« alerte de ce passage · franchi le JJ/MM/AAAA HH:MM ») puis `out_of_band_alerted` (« hors cible · déjà signalé · aucune nouvelle alerte tant que la valeur reste hors zone »), **sans aucun rendu entre les deux** ; `threshold_latched` affiche « hors zone depuis le 2ᵉ passage », le compteur **incrémente sans déclencher** ; le réarmement donne `threshold_armed` et **rien d'autre**. Les trois horodatages sont des `computed_at` de snapshot, jamais `Date.now()` (§ 8) |
| US-4 | PRD §3 | « Être signalé quand un indicateur sort du seuil écrit à côté de sa définition. » **Au MVP, cet écran rend le seuil et l'écart, pas l'alerte** : le seuil n'est posé que sur une définition signée et il n'est saisissable nulle part sur cet écran (C2) — c'est le critère 1, entièrement satisfait ; les critères 2 et 3 (une alerte par passage, réarmement silencieux) sont des critères de **V1** et leur rendu est écrit, sans être dans cette version (§ 9.2 point 2). L'export portera la même limite : **B27 énumère** version, date de signature, date de calcul, source, auteur et date d'export, et **rien de plus n'est demandé à l'export**. Ce qui reste vrai dans les deux versions, c'est le critère US-9 lui-même : « un support qui circule en réunion ne peut pas être déconnecté du chiffre qu'il affirme » — d'où l'obligation, quelle que soit la version, que la **valeur** soit datée et attachée à sa version, ce que B5 et B22 règlent déjà |
| US-6 | PRD | § 1 et § 3 : l'objet est partagé à une **liste nominative**, la ligne « 6 personnes nommées · aucun lien public » est permanente sous la `PeriodScopeBar`. § 4 « Lecture seule » : ce que le lecteur voit ne se modifie pas ici. La composition elle-même est portée par l'écran `composition` |
| US-7 | PRD | § 4 « Hors-ligne / permissions » : E5 traité en détail. § 8 : `indicators[]` est filtré **serveur**, jamais côté client, et le cache local suit la même règle. § 5 : un export ne peut pas élargir le périmètre |
| US-9 | PRD | § 3 : `ExportPanel` en `idle` avec aperçu de provenance avant génération. § 4 : états `queued` / `running` / `ready` / `failed`. § 5 : l'export est une tâche de fond, **la navigation ne l'interrompt pas** (critère d'acceptation explicite de US-9) |
| B5 | PRD | § 3 : `computed_at` + `source_ref` en slots **requis** de chaque tuile, et `ProvenanceStrip` permanente en bas de page. § 5 : le seul tooltip du produit ne porte qu'un résumé d'un fait déjà visible. § 5 Gestes : pull-to-refresh interdit parce qu'il écrirait l'heure du poste à la place de la source. § 7 : `--color-text-secondary` proscrit pour toute valeur |
| B7 | PRD | § 4 « Hors-ligne / permissions » + § 8 « Données sensibles » : la tuile interdite n'existe pas dans la réponse, le DOM, ni le cache. Un `placeholder` « accès refusé » est explicitement écarté : il confirmerait l'existence de l'indicateur, ce qu'E5 interdit |
| B8 | PRD | § 5 : l'export reprend la période, l'équipe et les restrictions **tels qu'ils sont dans l'URL au moment du clic**, et ne peut jamais les élargir — état `forbidden_scope` (E6) avec le périmètre exact qui serait autorisé. § 4 « Erreur de soumission » |
| B9 | PRD | § 3 : la ligne « 6 personnes nommées · aucun lien public » est **permanente**, sous la `PeriodScopeBar`. § 4 « Vide — jamais visité » : aucun lien de partage, aucun code d'invitation sur l'écran de lecture. L'adresse restitue un état, elle ne constitue jamais un droit |
| B16 | PRD | § 3 : `VersionNotice` par indicateur — « version 4 en attente de signature, cette valeur reste sur la version 2 signée le 28/08/2026 ». § 4 « Rempli » : la valeur affichée est celle de la dernière version signée, jamais celle d'un projet. § 4 « Erreur de chargement » : la dernière valeur connue est **la version signée**, pas la dernière version écrite |
| B27 | PRD | § 3 : `ProvenanceExportPreview` montre, **avant** génération, la page de provenance en tête du PDF et le pied de page de chaque page : version · date de signature · date de calcul · source · auteur · date d'export. § 5 : export en tâche de fond **rattaché à la version qui l'a produit**, même après une signature plus récente. § 4 « Succès » : le panneau `ready` reprend la provenance et affiche la date d'expiration |
| E4 | PRD | § 3 `VersionNotice` + § 4 « Rempli » : le tableau partagé reste sur la version signée ; la version 4 en attente est **nommée et datée**, jamais appliquée. C'est le seul endroit de l'écran où une version non publiée apparaît, et elle apparaît comme un fait, pas comme une valeur |
| E5 | PRD | § 4 « Hors-ligne / permissions » : la tuile n'est pas rendue, aucun placeholder, aucun compteur « 5 sur 6 », la grille se recompose sur les indicateurs autorisés, le refus est journalisé côté serveur avec identité + ressource + motif. § 3 : `IndicatorTile` en état `permission_denied` **disparaît**, il ne se remplit pas |
| E6 | PRD | § 4 « Erreur de soumission » et § 5 : `ExportPanel` en `forbidden_scope` — refus nommé, périmètre exact qui serait autorisé, commande pour le demander explicitement. Aucun fichier n'est produit |
| E7 | PRD | § 5, ligne « Deux lecteurs, même tableau, 4 secondes d'écart » : chaque lecture porte **sa** `computed_at` et **son** `source_ref`, pris dans la source. Une différence entre deux lecteurs est visible et non ambiguë, et c'est le comportement attendu — pas un défaut de synchronisation |
| E8 | PRD | § 4 « Hors-ligne / permissions » et § 8 `owner_active` : `IndicatorTile` en variante `stale-owner` (filet `--color-stale`, badge « propriétaire inactif »), l'`OfficialityBadge` passe « non officiel ». Le tableau **reste consultable** et n'est **pas** retiré des accès en cours : le retirer effacerait ce que le lecteur attendait, et l'essentiel de la séance est déjà à l'écran |
| E17 | PRD | § 3 `OfficialityBadge` + § 4 « Rempli » : chaque indicateur concerné porte « non officiel », le tableau perd son caractère officiel, et **reste dans les accès**. La perte de statut est un bandeau, pas un retrait — la séance se tient |
| C2 | PRD | § 4 « Lecture seule » : aucun bouton d'édition, de réorganisation ou de retrait. Un tableau de bord n'est pas un formulaire (C2) |
| C4 | PRD | § 8 « Données sensibles » : le journal est conservé un an, purgé automatiquement, et ce qui circule entre les mains du comité est journalisé à chaque lecture |
| C6 | PRD | § 1 et § 6 `≥1601px` : le format projeté est le cas d'usage principal. La page ne défile pas, la grille tient, la `ProvenanceStrip` est fixe — c'est la traduction visuelle du critère « zéro retraitement manuel pendant une séance de comité » |
| C7 | PRD | § 1 : deux seuls concepts sur l'écran (période, équipe), tout est ailleurs ; la formation en moins d'une demi-journée ne passe pas par un écran qui aurait trois modes |
| C9 | PRD | § 4 « Rempli » : rien n'empêche de garder le tableur ouvert. Cet écran ne prétend pas être le seul lieu du chiffre, il prétend être le seul lieu où le chiffre est opposable — c'est ce que C9 autorise |
| C10 | PRD | § 8 « Données sensibles » : chiffrement au repos, isolation par ligne, restauration à un instant — prérequis bloquants de mise en production, pas des améliorations |
| Flow `lecture-tableau-de-bord` | Boucle `dashboard` | Entrée par le lien d'accès transmis par le contrôleur (jamais par un lien public), sortie par le clic sur une tuile vers la décomposition, ou par l'export qui emporte le support en séance. La boucle **ne se referme pas sur cet écran** : elle se poursuit dans `investigation` |

### 9.2 Écarts et arbitrages ouverts

| # | Point | Ce qui a été fait dans cet écran | Arbitrage attendu |
|---|---|---|---|
| 1 | ~~La tuile énumérait 6 slots et ignorait le slot `threshold`~~ — **ÉCART FERMÉ** | Le contrôle `design-check component-parity` a signalé que `design-system` § 2 déclare 7 slots et que cet écran n'en citait que 6. Les deux énumérations sont corrigées (§ 4 « Rempli », § 9 US-3) et la ligne `threshold` est rendue : valeur et sens du seuil avec sa date (B11), puis la mention d'état de la machine et ses horodatages (B12). La ligne disparaît dans les trois cas où la machine est suspendue (B13 / B17 / E8, E16, **B6**) et quand aucun seuil n'est déclaré — `threshold_state: not_applicable` | ~~Aligner l'énumération sur le composant~~ — **fait**. Le contrôle passe à `pass: true`, 0 offender |
| 2 | **Cet écran rend-il la machine de franchissement ? — NON dans cette version, et OUI en V1. Les deux réponses sont écrites, et la date de bascule est l'arbitrage ci-dessous** | **La question elle-même était mal posée**, et la réponse est aujourd'hui double. *Au MVP*, cet écran rend la ligne `threshold` avec **la valeur, le sens et la date du seuil** (B11), et l'écart signé hors cible (B14) — rien d'autre. *En V1*, il rend en plus les quatre états (`out_of_band_alerting`, `out_of_band_alerted`, `threshold_latched`, `threshold_armed`), la mention d'état et les trois horodatages, **sans variante locale** par rapport à `design-system` § 2.1, et **sans aucune couleur ajoutée**. La décision de le porter en V1 tient sur deux raisons, et sur deux seulement. (a) **C'est la surface de décision du comité** : la grille est projetée en séance (`--bp-wide`, page projetée), et la première question d'un comité est « qu'est-ce qui va nous poser problème aujourd'hui ? ». Un franchissement que l'on ne voit qu'en réunion a été traité trop tard. (c) **L'état est connu ici** : il est évalué sur la séquence de snapshots **de la période affichée**, donc ce n'est pas une donnée inventée. | **Ce qui est arbitré ici est la version, pas le principe** : la machine est **V1**, par `roadmap.md` § 2.1 (« B12 […] part entièrement en V1 »), § 2.2 (B12 → V1, sous « Ce qui n'est **PAS** dans le MVP ») et § 3.1, et par l'arbitrage de périmètre du commanditaire rendu au § 9.2 des trois écrans du module. L'argument (b) de la version précédente de ce tableau — « l'export PDF porte la provenance, donc la ligne `threshold` et ses horodatages doivent être à l'écran d'abord », présenté comme une exigence de B27 — est **retiré** : `prd.md` B27 énumère version de définition, date de signature, date de calcul, source, auteur et date d'export, et **le mot « seuil » n'y apparaît pas**. Une règle ne peut pas être citée pour dire ce qu'elle ne dit pas. La décision de porter la machine complète sur cet écran **tient sur (a) et (c)** |
| 3 | ~~La tuile `md` fait 148 px et le slot `threshold` est une septième ligne~~ — **ÉCART FERMÉ, par le commanditaire à ce gate** : la taille `md` passe de **148 px à 172 px** dans la table des tailles du design system (§ 2), et la règle permanente **« aucune date de seuil n'est rognée, quelle que soit la taille »** est écrite dans le contrat d'`IndicatorTile` | Le critère de l'arbitrage est écrit tel quel : *si la complétude de la machine dépend du format d'écran, le même composant a deux rendus* — c'est exactement le défaut que le commanditaire venait de refuser par ailleurs. À 148 px, les sept slots ne tenaient pas avec les gaps `--space-lg`, donc la ligne de seuil était complète en `lg` et amputée en `md` : un même composant, deux rendus, choisis par la largeur de la fenêtre. **Effet vérifié sur la grille** : le nombre de tuiles par ligne **ne change pas** (une tuile occupe des colonnes, pas des pixels) ; la grille à 4 par ligne de six tuiles (4 + 2) passe de 2 × 148 = 296 px à 2 × 172 = **344 px**, soit 48 px de plus, et reste inférieure aux 440 px du même nombre de tuiles en `lg` — donc le format projeté **continue de tenir sans défilement vertical**, qui est l'exigence de lecture de l'écran (§ 6). Les grilles à 4 par ligne en `sm` (96 px) et en `lg` (220 px) ne sont pas concernées. Les skeletons de chargement (§ 4) et la tuile `md` de la tablette de `indicateur-detail.md` § 6 sont alignés sur la nouvelle valeur | ~~Soit la taille `md` passe à 172 px, soit `lg` devient le seul format où la ligne de seuil est complète~~ — **première branche retenue**, et la seconde est écartée par le critère lui-même : elle aurait fait de la complétude une propriété du format. Aucune hauteur de tuile ne peut devenir une permission de perdre une date |

---

## 10. Checklist de gate

- [x] Les 11 états sont décrits avec un rendu concret — dont **« Franchissement »** et **« Réarmement »**, **étiquetés V1** : leur rendu complet, celui de `design-system` § 2.1 et sans variante locale, est écrit en entier, et le même état dit en toutes lettres ce que le MVP rend à la place (ligne de seuil valeur + sens + date, écart signé).
- [x] **La surface de `IndicatorTile` est celle du composant** : sept slots énumérés, les quatre états de la machine **énumérés et datés** (V1), et la décision de périmètre écrite en § 4, § 6, § 8 et § 9.2 — pas un silence, pas une six-surface. La taille `md` est à **172 px**, donc les sept slots tiennent en un seul format, et la ligne de seuil n'est amputée à aucun.
- [x] Chaque élément interactif a un comportement et un feedback.
- [x] Le responsive est défini à **chaque** breakpoint du design system.
- [x] La section Anti-générique est cochée et justifiée.
- [x] Aucune valeur de design n'est laissée à « à définir ».
- [x] Chaque ID B*/E*/C*/US de l'écran apparaît en section 9.
- [x] `node "$FORGE/scripts/forge-guard.js" placeholders <anchor>` ne signale rien ici.
- [x] L'écran reste cohérent avec `.forge/design/design-system.md`.