---
type: screen
slug: indicateurs
title: Liste des indicateurs
module: indicateurs
status: approved
generated_at: 2026-09-30
derived_from:
  - .forge/prd.md
  - .forge/design/design-system.md
  - .forge/benchmarks.md
  - .forge/conventions.md
rule_ids:
  - B4
  - B5
  - B6
  - B11
  - B12
  - B13
  - B14
  - B17
  - B22
edge_case_ids:
  - E1
  - E2
  - E3
  - E8
  - E9
  - E15
flow: liste-indicateurs
---

# Écran — Liste des indicateurs

> Ce document est la **source de vérité** pour qu'une IA génère l'interface de cet écran.
> Il est généré depuis `templates/screen.md.tmpl`, jamais recopié.

---

## 1. Rôle de l'écran

| | |
|---|---|
| **Archétype d'app** | `dashboard` |
| **Module** | `indicateurs` — rang **1** dans la navigation (`state.json → index.nav`, design-system §3.2) |
| **Route** | `/indicateurs` |
| **Type** | `page` |
| **Utilisateurs** | manager d'équipe (commercial, production, support — quotidien), contrôleur de gestion, DG (usage mensuel, écran projeté) |
| **User stories servies** | US-3 (consulter un indicateur officiel), US-4 (détecter une anomalie), US-11 (comparer à une cible) |
| **Règles métier** | B4, B5, B6, B11, B12, B13, B14, B17, B22 |
| **Edge cases** | E1, E2, E3, E8, E9, E15 |

**Une phrase** : cet écran permet au **manager d'équipe** de **lire en un coup d'œil quels indicateurs sont hors cible sur la période affichée** afin de **décider quoi regarder en premier**.

**Pourquoi il est au rang 1 de la navigation** : parce que c'est la **boucle quotidienne**, pas parce que c'est la page d'accueil. Le PRD déclare l'usage du manager d'équipe **quotidien** (« réunion d'équipe matinale, café », PRD §2) : il ouvre le produit chaque matin pour une seule chose, savoir si un indicateur est sorti de sa cible. La fréquence est notée 5 et la centralité 5 dans l'ordre de navigation ; le rang 1 revient à cette mesure, pas à un choix par défaut. Le corollaire est **assumé** et non neutre : **cet écran n'est pas un accueil**. Il n'y a ni message de bienvenue, ni fil d'actualité, ni raccourcis vers les tâches du jour. La page d'accueil d'un outil de supervision est un récapitulatif de tâches ; ici la page d'accueil est **la lecture elle-même**. Placer « Définitions » en tête aurait mis l'outil du rare (fréquence 2) au-dessus de la boucle quotidienne : c'est exactement l'erreur que design-system §3.2 refuse.

> Le mot « accueil » est proscrit pour cette entrée de navigation, y compris dans le libellé de la page. Le titre est « Indicateurs », jamais « Bonjour ».

---

## 2. Direction visuelle de cet écran

Repris de design-system §0 et §1 — **valeurs concrètes**.

| | |
|---|---|
| **Mood** | dense, sourcée, hiérarchisée par écart — l'ambiance du produit est « dense, sourcée, non décorative » (design-system §0) ; ici les trois mots se réduisent à une seule question : **qu'est-ce qui demande une décision aujourd'hui ?** |
| **Densité** | **dense** — justification : le manager lit cette page deux fois par jour, debout, en début de journée ; et le comité la lit projetée à trois mètres (PRD §7.3). Sept indicateurs tiennent en **deux rangées** de tuiles `sm` (96 px). Une page aérée n'en montrerait que trois, et le comité comparerait des chiffres qu'il n'a pas le temps de faire défiler. |
| **Niveau de contraste** | **fort** — justification : lecture projetée et lecture au café. Le texte courant est le couple le plus sombre de la palette (`#2C3633` sur `#F2F4F3`, **11,30:1** mesuré) ; les valeurs sont en mono à chasse fixe pour être alignables en colonne. |
| **Surface** | `--color-surface` `#E9EDEB` sur `--color-background` `#F2F4F3`. Tuile hors cible : fond `--color-out-of-band-subtle` `#F6E1DE`. **Jamais `#FFFFFF`**, jamais d'ombre : la séparation des tuiles est un filet `--color-border` 1 px. |
| **Accent utilisé** | `--color-accent` `#0F5C57` — **uniquement** pour : le filet 3 px à gauche d'une tuile `official`, le badge « officiel », le lien « Ouvrir le détail », et l'état « dans la cible ». Il ne décore rien : si un élément n'est ni une action, ni un statut, ni une identité de version, il ne porte pas la couleur d'accent. |
| **Traitement photographique** | **AUCUN.** Aucune image, aucun dégradé, aucune mascotte, aucun pictogramme d'appoint (design-system §0, anti-références). |
| **Référence** | l'écran de supervision d'un atelier (des chiffres, des dates, des seuils) et l'onglet de suivi du tableur partagé — **pas** Metabase : le produit prend à Metabase le modèle « une question partageable », pas sa grille de cartes flottantes. |

### 2.1 Anti-générique — obligatoire

Cet écran ne doit ressembler **à aucun** de ces défauts :

- [x] **Pas de fond blanc pur `#FFFFFF` par défaut** — le fond porte `#F2F4F3`, gris-vert désaturé choisi, et les surfaces `#E9EDEB` / `#DEE3E1`. Le produit est ouvert toute la journée dans un onglet : un blanc pur en fond de page fatigue en séance comme au bureau. La tuile hors cible elle-même sort du gris (`#F6E1DE`) : la surface porte la sémantique.
- [x] **Pas de carte ombrée pour tout** — `--shadow-none` est la valeur par défaut, y compris sur les tuiles. Deux tuiles voisines sont séparées par un filet `--color-border`, pas par une ombre. L'ombre n'apparaît que sur ce qui **flotte** : le menu déroulant du sélecteur de période (`--shadow-sm`) et l'infobulle de provenance au survol d'une tuile (`--shadow-sm`). `--shadow-lg` est réservé à l'export en cours de génération.
- [x] **Pas d'uniformité** — la hiérarchie vient d'un **rapport d'échelles**, pas d'un espacement constant : valeur `--text-display` 40 px (24 px en `sm`) → intitulé `--text-h3` 15 px → date et source `--text-caption` 12 px. Le seul saut large de l'échelle (40 → 24 px) est placé exactement sur la valeur, parce que c'est le seul élément qui doit porter la lecture à trois mètres. L'espacement, lui, est constant (`--space-lg` 12 px entre lignes d'une tuile) : l'irrégularité est typographique, elle est voulue.
- [x] **Pas de gris neutre générique `#6B7280`** — les quatre états non ordinaires ont chacun un gris qui lui est propre, et aucun n'est un neutre : `#7A6A3C` chaud pour « on ne sait pas », `#746A5E` pour « non officiel », `#5B5B63` **froid** pour « source indisponible » (un gris froid, distinct des gris de l'atelier, pour que la panne ne passe pas pour un état normal), `#161D1B` pour le texte en thème sombre. Un état d'incertitude rendu en gris neutre est lu comme un état normal : c'est le défaut que le design system refuse explicitement.
- [x] **Pas de mise en page centrée symétrique** — sidebar 240 px à gauche, contenu aligné sur une grille de 12 colonnes calée à gauche, jamais centré dans la fenêtre. Le bord droit est un bord, pas une marge de respiration : les tuiles sont calées sur la grille, elles ne flottent pas entre deux espaces égaux.
- [x] **Pas d'illustration d'appoint générique** — aucune icône dans un cercle, aucun dégradé abstrait, aucun emoji. Les seules icônes de l'écran sont `triangle-alert` (hors cible), `bell-ring` (franchissement — alerte de ce passage, franchi et déjà signalé), `bell` (seuil armé, en attente du prochain franchissement), `circle-slash` / `circle-help` (état inconnu, et périmètre résolu vide), `file-warning` (source indisponible) et `user-round-x` (propriétaire inactif) : chacune est **liée à un état nommé** de `IndicatorTile` et disparaît avec lui. `bell` et `bell-ring` sont la seule paire d'icônes du produit, et elle existe pour cette raison précise : la machine à états distingue « armé » et « signalé » sans ajouter une seule couleur. Aucun chiffre fictif plat : les exemples sont ceux du PRD (taux de service 94,8 % contre une cible de 96 %, CA par client, taux de transformation).
- [x] **Pas d'une seule famille de police** — `--font-sans` (`Inter Variable`) pour les intitulés et le texte, `--font-mono` (`ui-monospace`, chasse fixe) pour **toute valeur chiffrée**, tout identifiant de source et tout numéro de version. C'est ce qui rend deux nombres de largeurs différentes alignables en colonne, donc comparables ; une valeur en chasse proportionnelle est lisible mais pas comparable. Graisses : 400 (texte) et 600 (intitulé, chiffre, badge).

**Choix assumé et non neutre** :

1. **Le tri par défaut est « écart à la cible décroissant », et il est écrit dans le titre de la page.** Les indicateurs hors cible remontent, puis ceux dont la fraîcheur ou la cible est incertaine, puis le reste ; et l'en-tête annonce « **2 hors cible sur 7 · septembre 2026 · tri : écart à la cible** ». Un écran générique trie par nom d'indicateur, ce qui place « Taux de transformation » avant « Taux de service » pour une raison alphabétique et non décisionnelle. Le tri est **écrit** parce qu'un tri invisible fait passer une opinion pour un ordre : le lecteur doit pouvoir dire pourquoi il voit ce qu'il voit.
2. **La page n'affiche aucune date de rafraîchissement globale, et elle l'assume.** Il n'en existe pas : chaque indicateur a son propre snapshot dans l'entrepôt. Un bandeau « Données à jour » en tête de page — que tout dashboard écrit par réflexe — serait le mensonge exact que B5 et B6 interdisent. À sa place, **chaque tuile porte sa propre date de calcul**, et la règle est écrite une fois, en bas de grille.
3. **Quand une tuile est à la fois hors cible et d'incertitude, l'incertitude gagne sur la couleur.** Le chiffre passe en `#7A6A3C`, l'écart est dit en mots (« 1,2 pt sous la cible du mois »), et la pastille rouge ne s'affiche pas. Annoncer un dépassement ferme sur une valeur dont on ignore la date de calcul, c'est affirmer plus que la source n'a dit — et c'est le cas le plus fréquent en début de mois, donc le cas que le manager voit tous les jours. La précédence complète est en § 4.1.
4. **Un franchissement est un état de la tuile, pas une notification qui clignote.** US-4 demande d'être « signalé » ; le produit choisit de l'être **dans la page**, par une ligne de seuil datée dans chaque tuile concernée, et **pas** par un toast, ni par une cloche qui vibre, ni par une couleur qui clignote. Trois raisons, dans l'ordre. (a) B12 dit « une seule fois par passage » : une alerte qui se rejoue à chaque franchissement d'oscillation est la négation de la règle, et un toast est précisément ce qui se rejoue. (b) Un toast est un **état caché** : il disparaît, donc l'information sur le franchissement disparaît avec lui, et l'écran ne peut plus répondre à « j'ai été prévenu quand ? ». (c) La règle du produit est « pas de chiffre sans sa date à côté » : une alerte sans date d'émission n'est pas une alerte, c'est un signal. Le réarmement, lui, ne produit **aucune** alerte : il se constate dans une ligne datée, jamais dans un bandeau. Un retour dans la zone normale n'est pas une victoire, et un bandeau « bonne nouvelle » serait la première fonctionnalité qu'un atelier en réunion de huit heures finirait par faire ignorer — donc par éteindre. **Ce raisonnement est écrit en entier, y compris ce qu'il produit, mais la machine à états elle-même arrive en V1** : `roadmap.md` § 2.1, § 2.2 et § 3.1. Au MVP, la ligne de seuil porte la valeur, le sens et la date du seuil (B11, B14), et rien d'autre — § 9.2, point 2.

---

## 3. Anatomie

```
chrome — layout design-system §3.1, §4.1
│
├── sidebar 240 px — design-system §3.2 (5 entrées, persistante ≥ 1025 px)
│   └── entrée « Indicateurs » : libellé + filet --color-accent 3 px à gauche
│
├── fil d'Ariane — design-system §3.3 → « Indicateurs »
│
└── contenu, grille 12 colonnes, tuile = 3 colonnes (4 par ligne ≥ 1025 px)
    │
    ├── en-tête de page — pas de carte, filet --color-border en pied
    │   ├── titre --text-h1 « Indicateurs »
    │   ├── ligne de lecture --text-body-sm, --color-text-secondary :
    │   │     « 2 hors cible sur 7 · septembre 2026 · tri : écart à la cible »
    │   ├── FormField variant="select" libellé « Période »
    │   │     → 7 j · 30 j · mois courant · mois précédent · personnalisée
    │   ├── FormField variant="select" libellé « Périmètre »
    │   │     → mes équipes · toutes mes équipes · [équipes autorisées, nommées]
    │   └── ExportPanel état="idle" — « Exporter en CSV », « Exporter en PDF »
    │
    ├── bandeau d'état — 0 ou 1, jamais empilés ; pleine largeur, filet 1 px, pas d'ombre
    │   ├── E1  source indisponible  → tint --color-source-unavailable + « Réessayer »
    │   ├── E2  aucune donnée        → « Élargir la période »
    │   ├── E3  pas rafraîchi        → dernière date connue + source concernée
    │   ├── E8  propriétaire inactif → « Voir la définition »
    │   └── E15 périmètre résolu vide → « Ouvrir la définition » (le périmètre vide est nommé)
    │
    ├── SURFACE DE FRANCHISSEMENT — US-4, B12, E9. **NON RENDUE AU MVP — V1**
    │   │   (le travail est écrit et il est complet ; il n'est simplement pas dans
    │   │   le périmètre de cette version : § 9.2, point 2). 0 ou 1, jamais empilée
    │   │   avec le bandeau d'état. **Placée entre le bandeau d'état et la grille**,
    │   │   donc au-dessus de la première rangée de tuiles : c'est la seule zone de la
    │   │   page qui soit en pleine largeur ET dans la colonne de gauche, hors de la
    │   │   grille. Rendue UNIQUEMENT si au moins une tuile visible est dans un état de
    │   │   la machine à états — c'est-à-dire si son threshold_state n'est pas
    │   │   not_applicable (out_of_band_alerting | out_of_band_alerted |
    │   │   threshold_latched | **threshold_armed**).
    │   │   Au MVP, cette surface n'existe pas : le bandeau d'état et la grille
    │   │   s'affichent seuls, et rien n'est dit du franchissement à l'échelle de la
    │   │   page. Aucune zone vide, aucun filet, aucun titre orphelin.
    │   │   Aucune carte, aucun fond coloré, aucune ombre :
    │   │   filet gauche --color-out-of-band 3 px, texte --color-text-primary
    │   │   sur le fond de page, comme le bandeau de version retirée du détail.
    │   ├── en-tête --text-h2 18 px : « Franchissements de la période »
    │   ├── ligne de lecture --text-body-sm --color-text-secondary :
    │   │     « septembre 2026 · 2 franchissements · 3 seuils · 1 réarmement »
    │   │   (aucune mention d'envoi ni de messagerie : au MVP l'alerte est visible
    │   │    dans le produit, il n'y a pas de canal sortant — § 9.2, point 6)
    │   ├── une ligne par indicateur concerné, --text-body-sm, une seule ligne :
    │   │   ┌──────────────────────────────────────────────────────────────────────┐
    │   │   │ Taux de service   94,8 %   seuil < 96,0 %   calculé le 02/09 06:00  │
    │   │   │ bell-ring  hors cible de 1,2 pt · alerte de ce passage               │  ← out_of_band_alerting
    │   │   │             franchi le 02/09 06:00                                   │
    │   │   │ bell-ring  hors cible · déjà signalé · aucune nouvelle alerte       │  ← out_of_band_alerted
    │   │   │             hors zone · signalé le 02/09 06:00                       │
    │   │   │ bell-ring  hors zone depuis le 2e passage · aucune nouvelle alerte   │  ← threshold_latched
    │   │   │ bell       seuil réarmé le 04/09 06:00 · retour dans la zone        │  ← threshold_armed
    │   │   └──────────────────────────────────────────────────────────────────────┘
    │   │   les quatre lignes ci-dessus sont les rendus EXCLUSIFS et MUTUELS des
    │   │   états de la machine (design-system § 2.1) : une seule s'affiche par
    │   │   indicateur, jamais les quatre empilées
    │   ├── la ligne d'état du seuil est le SEUL endroit de l'écran qui dit
    │   │   « le seuil est armé / désarmé ». Elle n'est pas cliquable : elle constate.
    │   └── pied du bandeau --text-caption, une seule ligne, jamais un bouton :
    │       « Le seuil est réarmé au retour dans la zone normale : le retour
    │         lui-même ne déclenche aucune alerte. »
    │
    ├── grille de tuiles — IndicatorTile size="sm" (chiffre 24 px, hauteur 96 px)
    │   │   composition interne, de haut en bas :
    │   │   ┌──────────────────────────────────────────────┐
    │   │   │ label      --text-h3 15 px, 1 ligne, troncature au 2e mot long
    │   │   │ value      --font-mono 24 px / 600, aligné à gauche
    │   │   │ target     --text-body-sm — « cible 96 % » + écart signé
    │   │   │ threshold  --text-caption — ligne de seuil, présente seulement si un
    │   │   │   │           seuil est déclaré sur la version signée (B11) :
    │   │   │   │           « seuil < 96 % du 28/08/2026 »  ← c'est TOUT ce que
    │   │   │   │           porte la ligne au MVP : valeur, sens, date du seuil.
    │   │   │   │           La suite n'arrive qu'en V1, avec la machine (B12) :
    │   │   │   │           « signalé le 02/09 06:00 »  ou  « réarmé le 04/09 06:00 »
    │   │   │ status     badge --text-overline 11 px (voir § 4)
    │   │   │ computed_at+ source_ref  --text-caption 12 px, 1 ligne, mono
    │   │   └──────────────────────────────────────────────┘
    │   ├── IndicatorTile size="sm" variant="official"   state="out_of_band"            (hors cible)
    │   │   ↑ RENDU AU MVP : chiffre --color-out-of-band, fond
    │   │     --color-out-of-band-subtle, triangle-alert « hors cible de 1,2 pt », et
    │   │     la ligne threshold « seuil < 96 % du 28/08/2026 » si un seuil est
    │   │     déclaré (B11, B14). Ni badge bell-ring, ni compteur, ni date de
    │   │     franchissement : la machine n'existe pas dans cette version (§ 9.2, 2)
    │   ├── IndicatorTile size="sm"   state="out_of_band_alerting"   (B12, US-4)   ─┐
    │   ├── IndicatorTile size="sm"   state="out_of_band_alerted"    (B12, E9)     ─┤ V1 :
    │   ├── IndicatorTile size="sm"   state="threshold_latched"      (B12)        ─┤ non rendus
    │   ├── IndicatorTile size="sm"   state="threshold_armed"        (B12, US-4)  ─┘ au MVP
    │   ├── IndicatorTile size="sm" variant="official"   state="default"
    │   ├── IndicatorTile size="sm" variant="official"   state="unknown_freshness"
    │   ├── IndicatorTile size="sm" variant="target-missing"   (E16)
    │   ├── IndicatorTile size="sm" variant="provisional"      (B13)
    │   ├── IndicatorTile size="sm" variant="stale-owner"       (B17, E8)
    │   ├── IndicatorTile size="sm" state="no_data"             (E2)
    │   ├── IndicatorTile size="sm" state="perimeter_empty"     (E15)
    │   ├── IndicatorTile size="sm" state="source_unavailable"  (E1)
    │   ├── IndicatorTile size="sm" state="computation_too_long"(E11)
    │   └── state="permission_denied" → NON RENDUE (E5) : ni tuile, ni place réservée,
    │                                      ni placeholder, ni contour — l'indiquer confirmait
    │                                      son existence, et E5 demande l'inverse
    │
    ├── ligne de bas de grille — une seule, --text-caption, largeur totale :
    │     « Chaque valeur porte la date de son calcul et l'identifiant de sa source.
    │       Les indicateurs non officiels et ceux hors de votre périmètre ne sont pas listés. »
    │
    └── ProvenanceStrip — fixe en bas de page (design-system §3.1), jamais un tooltip
        ├── segment permanent : « la date affichée est celle du snapshot en entrepôt,
        │                        jamais l'heure de votre consultation »
        └── segment contextuel : provenance de la tuile survolée ou focalisée
                                 (calculé le · source · version · signé par)
```

| # | Composant | Rôle | Source |
|---|---|---|---|
| 1 | chrome (sidebar + fil d'Ariane + grille 12 col) | structure de page, position dans la navigation, fil d'ariane | design-system §3.1, §3.2, §3.3, §4.1 |
| 2 | `FormField` variant `select` | période et périmètre — **état dans l'URL**, jamais dans un store | design-system §2 — `FormField` |
| 3 | `ExportPanel` | déclencher l'export de la liste affichée et afficher son état | design-system §2 — `ExportPanel` |
| 4 | bandeau d'état | porter E1, E2, E3, E8, E15 au niveau de la page quand ils concernent plus d'une tuile | slice-local — simple filet + tint, **pas une carte** |
| 5 | **surface de franchissement** — **V1, non rendue au MVP** | porter US-4, B12 et E9 au niveau de la page : quels seuils ont été franchis, **quand**, si l'alerte de ce passage est déjà partie, et si le seuil est armé ou désarmé. C'est le seul endroit de l'écran qui parle de la machine à états, et il est au-dessus de la grille pour que la réponse à « qu'est-ce qui demande une décision aujourd'hui ? » ne demande pas de défilement | slice-local — filet gauche `--color-out-of-band` 3 px, `--text-h2` + `--text-body-sm` + `--text-caption`, sur le fond de page. **Ni carte, ni fond coloré, ni ombre**, et **aucun bouton**. Le composant est écrit et rendu ici entièrement ; seul son affichage est hors périmètre de version (§ 9.2, point 2) |
| 6 | `IndicatorTile` size `sm` | la valeur, sa cible, son écart, sa **ligne de seuil** — au MVP : valeur, sens et date du seuil (B11, B14) ; en V1, la même ligne plus les horodatages de la machine (B12) —, sa date, sa source, son état sémantique. Le composant le plus lu du produit | design-system §2 — `IndicatorTile`, § 2.1 `ThresholdMachine` |
| 7 | `ProvenanceStrip` | rappeler en permanence que la date affichée est celle de la source | design-system §2 — `ProvenanceStrip` |
| 8 | ligne de bas de grille | dire en clair ce que la liste ne montre pas (indicateurs non officiels, hors périmètre) | slice-local — texte de page, aucun conteneur |

> Aucun composant n'est inventé pour cet écran. Le bandeau d'état, la surface de
> franchissement et la ligne de bas de grille sont du **texte sur fond de page** :
> ils n'ont pas de surface, pas de rayon et pas d'ombre. Les ajouter au design
> system comme composants serait une erreur ; ce sont des instances de mise en
> page. La surface de franchissement n'est pas un composant **parce que** sa
> machine à états l'est déjà : le composant `IndicatorTile` porte l'état, la
> surface le regroupe à l'échelle de la page. Deux couches, une seule source
> d'état — la dédoublonner créerait un second endroit où écrire « signalé le ».
>
> **Une zone décrite ici n'est pas forcément rendue dans cette version.** La
> surface de franchissement est écrite entièrement, interaction comprise, et elle
> arrive en V1. Ce qui n'est pas rendu au MVP n'est pas supprimé : c'est étiqueté
> dans le § 3, dans le § 4, dans le § 5 et au § 9.2, avec l'endroit exact où il
> revient. Une zone non rendue ne laisse **rien** derrière elle — ni place gardée,
> ni filet, ni titre vide.

---

## 4. États — tous, sans exception

Les états sont nommés comme ceux de `IndicatorTile` (design-system §2). Chaque état a **un** rendu, pas une intention.

| État | Déclencheur | Rendu | Feedback utilisateur |
|---|---|---|---|
| **Chargement** | première lecture, ou changement de période | **Skeleton de la forme du chiffre** sur la grille complète : bloc `--color-ink-100` de 24 px sur 96 px de haut, plus une ligne pour la date ; hauteur de tuile conservée, donc **pas de saut de mise en page** au remplissage. La ligne de lecture affiche « — sur — », jamais « 0 sur 0 ». Le bandeau d'état n'est pas rendu. | Aucun spinner : le skeleton a la forme du contenu. Après 400 ms, un texte `--text-caption` sous le titre : « Lecture en cours depuis l'entrepôt ». |
| **Rempli** | valeurs et `computed_at` reçus de la source | Grille de `IndicatorTile` `sm`, trié par écart décroissant. Chaque tuile porte ses sept slots : label, value, target, **threshold**, computed_at, source_ref, status. Le compte de l'en-tête est calculé sur les tuiles **visibles**. | Aucun toast : la page entière change d'un bloc, `--duration-fast` (90 ms), sans transition d'entrée. |
| **Vide — jamais visité** | aucun indicateur n'existe pour ce lecteur (base vide, premier démarrage) | Message de deux lignes, pas d'illustration : « Aucun indicateur n'est encore déclaré. » puis « Les indicateurs sont déclarés dans Définitions, avec un propriétaire nommé. » **CTA principale** : `Ouvrir Définitions`, un lien vers le module de rang 3 — **pas** un formulaire de création ici (C2 : aucune saisie de données métier dans l'interface ; US-1 vit dans un autre module). | Le CTA est le seul élément `--color-accent` de la page. Le fil d'Ariane reste `Indicateurs`, ce qui indique au lecteur qu'il n'a pas changé de module. |
| **Vide — aucune donnée** | E2 : la période demandée ne renvoie aucune ligne, pour aucun indicateur | **Pas un chiffre, pas un zéro.** Chaque tuile passe en état `no_data` : pas de chiffre, message « aucune donnée sur la période », et la cible reste affichée (elle ne dépend pas de la période). Un bandeau unique en tête récapitule et porte l'action **« Élargir la période »**, qui écrit `?periode=mois-precedent` dans l'URL. | Le compte de l'en-tête affiche « 0 valeur sur 7 indicateurs », pas « 7 indicateurs hors cible ». Distinct d'une panne : E1 a son propre bandeau. |
| **Périmètre résolu vide** | E15 : le périmètre de la définition ne résout aucune ligne, alors que la définition en déclare | La tuile concernée passe en état `perimeter_empty` : **aucun chiffre, jamais un `0 %`**, badge `--color-unknown` `#7A6A3C` sur fond épinglé `--color-surface-raised` `#F7F9F8` (5,02:1), icône `circle-help` + mention « périmètre résolu vide », action « Ouvrir la définition ». Les autres tuiles **restent rendues** : un périmètre vide est propre à une définition, pas à la page. | **L'action proposée est « Ouvrir la définition », jamais « Élargir la période ».** C'est la raison pour laquelle `perimeter_empty` est un état distinct de `no_data` : « élargir la période » ne répare pas un périmètre qui ne résout rien, et une commande qui ne répare pas ce qu'elle annonce est un mensonge d'interface. Le bandeau d'état reprend le cas page entière, jamais en même temps que le bandeau de franchissement. |
| **Franchissement** — **V1, non rendu au MVP** | B12 / US-4 / E9 : au moins une tuile visible a un `threshold_state` ≠ `not_applicable` — donc `out_of_band_alerting`, `out_of_band_alerted`, `threshold_latched` ou `threshold_armed`. `not_applicable` est la valeur « pas de machine » de design-system § 2.1 : elle ne déclenche rien ici non plus | **Ce que le MVP rend à la place, et c'est écrit ici, pas déduit** : la tuile concerné est en état `out_of_band` — chiffre `--color-out-of-band`, fond `--color-out-of-band-subtle`, `triangle-alert` + « hors cible de 1,2 pt » — et sa ligne `threshold` porte **la valeur du seuil, son sens et sa date** (B11, B14) : « seuil < 96,0 % du 28/08/2026 ». Pas de badge `bell-ring`, pas de compteur de passages, pas de date de franchissement, pas de réarmement : ces quatre choses sont des produits de la machine à états, et la machine n'existe pas dans cette version. **La surface de franchissement n'est pas rendue** : ni zone, ni place réservée, ni bandeau vide. Le rendu complet de la ligne est écrit ci-dessous, en clair, et il revient en V1 (§ 9.2, point 2) | **Aucun toast, aucun compte à rebours, aucune bannière animée, aucune vibration** — au MVP comme en V1, et c'est la même règle qui produit les deux. Le franchissement est un **état durable et daté**, pas une notification. Le compteur de la ligne de lecture est un `role="status"` à `aria-live="polite"` : en V1, le franchissement s'annonce à l'ouverture de la page, une fois, et **pas** à chaque rechargement. Un toast rejoué à chaque franchissement d'oscillation serait la négation de B12. **Rendu complet (V1)** : la surface de franchissement est rendue entre le bandeau d'état et la grille (§ 3), une ligne par indicateur, avec son nom, sa valeur, son seuil, sa date de calcul, et **une seule** des quatre mentions d'état ; la tuile porte en plus le badge `bell-ring` et la ligne `threshold` datée ; la ligne de lecture gagne le compte « septembre 2026 · 2 franchissements » |
| **Réarmement** — **V1, non rendu au MVP** | B12 / US-4 critère 3 : la valeur est revenue dans la zone normale depuis un franchissement constaté | **Ce que le MVP rend à la place** : exactement le rendu de « dans la cible » du composant — chiffre `--color-text-primary`, fond `--color-surface`, badge « dans la cible » — plus la ligne `threshold` du seuil (valeur, sens, date). Le mot « réarmé » et sa date n'apparaissent nulle part au MVP, parce qu'un réarmement n'existe pas sans machine. **Rendu complet (V1)** : l'état `threshold_armed`, qui est l'apparence de `default` plus la ligne `threshold` « seuil réarmé le JJ/MM/AAAA HH:MM » et la ligne correspondante de la surface de franchissement ; le compteur de passages repart à zéro | **Silencieux, et c'est le point — au MVP comme en V1.** Aucune alerte de « bon », aucun toast, aucun bandeau, aucune animation, aucun changement de couleur sémantique : la tuile était déjà dans la couleur « dans la cible ». Le réarmement se **constate** dans la ligne `threshold` et dans le journal (B10). Un retour dans la zone normale n'est pas un événement, et un produit qui le félicite est un produit dont on désactive les notifications |
| **Erreur de chargement** | E1 : l'entrepôt est injoignable au moment du rendu (`error_code: WAREHOUSE_UNREACHABLE`, `QUERY_TIMEOUT`) | Bandeau `--color-source-unavailable` : « Source indisponible. Les valeurs ci-dessous sont celles du dernier calcul connu. » Puis les tuiles en état `source_unavailable` : **dernière valeur connue, conservée, avec sa date**, chiffre en `#5B5B63`. Action `Réessayer`. | Jamais une liste vide, jamais un zéro, jamais un tiret à la place du chiffre (conventions §Gestion d'erreur, point 5). Un échec qui s'affiche comme une absence transforme une panne en affirmation commerciale. |
| **Erreur de soumission** | application d'une nouvelle période ou d'un nouveau périmètre refusée par la source : `SCOPE_DENIED`, `PLAN_INVALID`, période invalide | Erreur **au champ**, sous le `FormField` concerné, jamais en toast : « Période refusée par la source : le périmètre demandé n'est pas accessible. » La période précédente **reste affichée** avec ses propres `computed_at`, et l'URL conserve la période valide. | Message collé au champ avec une action nommée ; focus déplacé sur le champ en erreur ; anneau `--color-border-focus` 2 px. Un toast qui disparaît laisse l'utilisateur avec une page qui ne correspond plus à l'URL. |
| **Succès** | nouvelle période appliquée, `Réessayer` réussi, ou export terminé | La grille se remplace en place. Confirmation **dans la ligne de lecture** de l'en-tête, pas dans un toast : « Septembre 2026 · 7 valeurs recalculées depuis la source ». Les dates de calcul changent **si et seulement si** le snapshot a changé ; sinon elles restent identiques, et c'est visible. `ExportPanel` passe à `ready` : lien, date d'expiration datée. | Aucune animation de valeur : pas de compteur qui défile, pas de count-up. Le seul mouvement autorisé sur une donnée est le changement de couleur sémantique, en `--duration-normal` (160 ms). |
| **Hors-ligne / permissions** | session coupée, `error_code: SCOPE_DENIED` sur toute la page, ou coupure réseau pendant la session | Deux rendus distincts. (a) **Permissions** : la tuile en état `permission_denied` **n'est pas rendue** — pas de placeholder, pas de contour, pas de message « accès refusé » ; le compte de l'en-tête ne compte que ce qui est visible (E5), et la ligne de bas de grille le dit. (b) **Hors-ligne** : dernier résultat affiché, avec la date de son propre `computed_at`, et le bandeau E1 reste en place tant que la source ne répond pas. | Le journal de consultation est écrit à chaque lecture, y compris sur refus (B10) ; il n'est **jamais rendu sur cet écran**, il se consulte dans « Accès et journal ». |
| **Lecture seule** | état permanent de l'écran | Aucun contrôle d'édition, aucun bouton d'ajout, aucun menu « … » porteur d'une action de modification. Les seules actions sont : changer de période, changer de périmètre, exporter, ouvrir le détail. La période et le périmètre sont un **scope**, pas une saisie de données (C2). | Le focus au clavier ne s'arrête que sur ces quatre actions. Un élément non actionnable ne reçoit pas de focus : un focus qui ne fait rien est un piège pour l'utilisateur clavier. |

### 4.1 Précédence des états sur une même tuile

**La table de précédence est celle du design system § 2.2. Elle n'est pas redéfinie ici.** Les deux couleurs sémantiques du produit (`--color-out-of-band`, `--color-unknown`) peuvent toucher **la même tuile**, donc une règle écrite dans un seul écran finit par ne s'appliquer que là où quelqu'un a pensé à la recopier — et le même composant a deux rendus. Les rangs `4 bis` et `5 bis` de cette table (les quatre états de la machine à seuil) sont donc ceux que rend cet écran, sans variante locale.

Ce que cet écran ajoute, et que la table ne dit pas, tient en quatre points :

1. **Le rang 0 est un rendu de page autant qu'un rendu de tuile.** Ici un `perimeter_empty` ne prend que sa tuile : un périmètre vide est propre à une définition, pas à la page. Seul le bandeau d'état reprend le cas page entière, et jamais en même temps que la surface de franchissement.
2. **La surface de franchissement est retirée dès le rang 3** (`unknown_freshness`, B6, E3) : on ne date pas un franchissement sur un snapshot dont on ignore la date, donc l'écran renonce à l'alerte plutôt que d'en inventer la date. C'est la même suspension que celle de `design-system` § 2.1, appliquée ici à l'échelle de la page.
3. **Le rang 1 se propage au cache** (§ 8) : un résultat servi sans `threshold_state` est rendu en `out_of_band`, **sans ligne d'alerte** — on ne dessine pas un franchissement qu'on ne sait pas dater.
4. **La condition d'apparition de la surface est dans le § 4, pas dans la table** : la surface de franchissement est rendue dès qu'une tuile visible a un `threshold_state` ≠ `not_applicable`.

> Les rangs 2 et 3 priment sur le rang 4 : un dépassement annoncé sur une valeur dont la date ou la cible est incertaine est une affirmation que la source n'a pas faite. Le rang 1 prime sur tout : on ne colore pas une valeur qu'on n'a pas. Le rang 0 prime sur le rang 1 : il n'y a rien à colorer, et afficher la dernière valeur connue d'un périmètre vide serait afficher une valeur calculée sur un périmètre qui n'existe plus.
>
> **Les rangs 4 bis et 5 bis ne changent ni la couleur ni le fond.** Ils changent ce que la ligne `threshold` **dit**. C'est toute la conception de B12 dans cette table : un franchissement est un dépassement comme un autre, et la seule chose qu'il ajoute au-delà du dépassement est une **date** — celle du franchissement, celle de l'alerte, celle du réarmement. Une implémentation qui colorerait le franchissement autrement, ou qui le laisserait sans date, viole soit « pas de couleur sans signifié », soit « pas de chiffre sans sa date à côté ».
>
> **Et l'ordre 0 < 1 < 2 < 3 < 4 est un ordre de vérité, pas de gravité.** Un `perimeter_empty` n'est pas plus grave qu'une panne de l'entrepôt : c'est simplement un cas où la comparaison à la cible n'a pas de matière. Lui donner une couleur plus forte que le rouge du hors cible reviendrait à inventer une gravité que le produit ne sait pas mesurer.

---

## 5. Interactions

| Élément | Événement | Comportement | Feedback visuel | État résultant | ID |
|---|---|---|---|---|---|
| `IndicatorTile` (tuile entière) | clic / `Entrée` | navigation vers `/indicateurs/{slug}?periode={période}&perimetre={périmètre}` — la période et le périmètre voyagent dans l'URL, donc la décomposition prépare aura exactement le même scope | curseur `pointer`, filet `--color-border-strong`, puis navigation sans transition d'entrée | nouveau document, page 2 du flow `liste-indicateurs` | B15, B9 |
| `IndicatorTile` | survol | fond relevé `--color-surface`, bordure `--color-border-strong`, et le `ProvenanceStrip` du bas affiche la provenance de cette tuile | 90 ms `--duration-fast` ; l'information existe déjà dans la tuile, le survol ne la révèle pas | inchangé | B5 |
| `IndicatorTile` | `Tab` puis `Entrée` | même navigation qu'au clic ; le focus suit l'ordre de tri, pas l'ordre alphabétique | anneau `--color-border-focus` 2 px, jamais supprimé | inchangé | B5 |
| `FormField` période | `select` | écrit `?periode=` dans l'URL et relance la lecture **depuis la source** ; aucun tri, aucun filtre local | le champ passe en `--color-surface-sunken` pendant la lecture, puis la ligne de lecture se met à jour | Chargement → Rempli | B5 |
| `FormField` période | valeur refusée par la source | erreur au champ, période précédente conservée à l'écran et dans l'URL | message sous le champ + focus sur le champ | Erreur de soumission | B5, B9 |
| action « Élargir la période » (E2) | clic | passe à la période immediately supérieure et l'écrit dans l'URL | la période du champ se met à jour en même temps que la grille | Chargement → Rempli ou Vide — aucune donnée | E2 |
| action « Réessayer » (E1) | clic | relance la lecture ; 2 tentatives avec backoff 500 ms puis 2 s si `retryable` | le bouton passe en état désactivé `--color-text-disabled` le temps de la tentative | Erreur de chargement → Rempli ou Erreur de chargement | E1 |
| `ExportPanel` | clic sur « Exporter en CSV » | job de fond ; le panneau passe `queued` avec son identifiant, puis `running`, puis `ready` avec lien et **date d'expiration** ; l'export porte exactement la période, le périmètre et les restrictions affichés | `--shadow-lg` sur le panneau tant que le job tourne ; navigation possible sans interrompre le job | Succès | B8, B27, B22 |
| `ExportPanel` | job en échec | état `failed` : aucun fichier partiel proposé, message d'échec et reprise | message dans le panneau, jamais en toast | Erreur de soumission | E13 |
| bandeau E3 | clic sur « source concernée » | ouvre le détail de l'indicateur sur sa page, pour comparer avec la version précédente | underline `--color-accent` au survol | nouveau document | E3 |
| bandeau E8 | clic sur « Voir la définition » | ouvre la version courante de la définition dans le module `definitions` | idem | nouveau document | B17 |
| bandeau E15 | clic sur « Ouvrir la définition » | ouvre la version courante de la définition dans le module `definitions`, sur la version qui porte le périmètre vide | idem | nouveau document | E15, B4 |
| **surface de franchissement, ligne d'un indicateur** — **V1 : la surface n'est pas rendue au MVP, donc ces trois lignes ne sont pas applicables dans cette version** | clic / `Entrée` | navigation vers `/indicateurs/{slug}?periode={période}&perimetre={périmètre}` — **exactement le même couple que la tuile**, jamais un paramètre resaisi : le clic sur une ligne de franchissement et le clic sur la tuile sous-jacente mènent au même endroit, et c'est le même couple période/périmètre qui est transmis (B15) | curseur `pointer` sur le nom de l'indicateur, filet `--color-border-strong` au survol, puis navigation sans transition d'entrée | nouveau document | US-4, B15 |
| **surface de franchissement, mention d'état** (`bell-ring` / `bell` + texte) — **V1** | survol / focus clavier | **aucune action.** Le survol ne révèle rien : l'état du seuil, la date du franchissement et la date du réarmement sont **déjà** dans la ligne. La seule chose que le survol fait, c'est porter la provenance de cette tuile dans le `ProvenanceStrip`, comme le survol de la tuile elle-même | anneau `--color-border-focus` 2 px au focus clavier ; **aucun** changement de fond au survol du texte | inchangé | B5, B12 |
| **surface de franchissement, ligne d'état du seuil** — **V1** | — | **non cliquable, et il n'y a rien à cliquer** : ni « réarmer », ni « acquitter », ni « marquer comme vu », ni « voir les alertes ». Le seuil est armé ou désarmé **par la valeur**, pas par une action d'utilisateur. Une commande « réarmer le seuil » serait une contradiction : elle laisserait croire qu'un seuil désarmé est un état que l'on choisit, alors qu'il est un état que l'on **constate** | aucune, et c'est écrit : une zone cliquable sans action est un piège ; une action qui ressemble à une option alors qu'elle constate quelque chose est pire | inchangé | B12, C2 |
| **réarmement** (`threshold_armed`) — **V1** | `Entrée`, survol, clic n'importe où | **aucun feedback.** Le réarmement est silencieux : pas de toast, pas de bandeau, pas de notification, pas d'animation, pas de changement de couleur. Il n'apparaît **que** comme la ligne `threshold` de la tuile et comme la ligne « seuil réarmé le JJ/MM/AAAA HH:MM » de la surface de franchissement, les deux datées par le `computed_at` du snapshot qui a constaté le retour | aucun | Réarmement → Rempli | **B12, E9, US-4** |
| ligne de bas de grille | — | **non cliquable** : elle constate une absence, elle ne la répare pas | aucune | inchangé | E5 |

- **Focus / clavier** : ordre de tabulation = lien d'évitement (« Aller au contenu ») → sélecteur de période → sélecteur de périmètre → export → **lignes de la surface de franchissement, dans l'ordre des tuiles** → **tuiles dans l'ordre de tri** → retour en haut. La tuile entière est un seul tabstop (rôle `link`, un nom accessible qui concatène intitulé, valeur, cible, écart, ligne de seuil et date de calcul) : tabuler ligne par ligne dans une tuile fait qu'un lecteur clavier perd la valeur au milieu de sa navigation. La ligne de franchissement est **focusable** et son nom accessible concatène les trois horodatages distincts, jamais permutés : « Taux de service, 94,8 %, seuil inférieur à 96 %, franchi le 02/09/2026 06:00, alerte émise, aucune nouvelle alerte tant que la valeur reste hors zone ». Sans cela, un lecteur d'écran annoncerait « hors cible » et perdrait le fait que **rien** ne sera renvoyé. Au MVP, la ligne de franchissement n'existe pas et n'est donc **ni focusable ni annoncée** : le focus va du sélecteur de périmètre aux tuiles, sans étape intermédiaire. Retour arrière : le navigateur restaure la période, le périmètre, l'ordre de tri et la position de défilement.
- **Gestes** : **aucun** au MVP. Pas de swipe, pas de pull-to-refresh, pas de long-press, pas de glisser-déposer. Le rafraîchissement est un bouton explicite dans le bandeau d'état, parce qu'un geste de rafraîchissement déclenché sans confirmation est un geste que l'utilisateur ne peut pas justifier devant un journal d'accès. **Pas de geste «balayer pour acquitter le franchissement »** : un acquittement par geste effacerait le franchissement sans laisser de trace, et B12 veut dire « une fois par passage », pas « une fois jusqu'à ce que quelqu'un l'ait effacé ».
- **Animations** : `--duration-fast` (90 ms, `--ease-default`) au survol et au focus ; `--duration-normal` (160 ms) au changement d'état sémantique d'une tuile ; `--duration-slow` (240 ms, `--ease-in`) à l'apparition d'un bandeau d'état. **Aucune animation sur une valeur chiffrée** : un chiffre qui défile est un chiffre qu'on ne peut pas lire en comité. **Aucune animation sur un franchissement** : ni clignotement, ni pulsation, ni rebond sur le badge `bell-ring`, ni vibration. La transition `out_of_band_alerting → out_of_band_alerted` — celle où une alerte vient de partir — ne produit **aucun** mouvement : c'est un changement d'état interne, pas une information pour le lecteur, et une animation dirait « quelque chose vient de se passer » alors que ce qui s'est passé est précisément qu'on a été prévenu.
- **Retour arrière** : retour à la page précédente avec son état complet (période, périmètre, tri, position). Une URL est un état de lecture, **jamais un droit** : la router vers cette URL ne donne aucun accès supplémentaire.

---

## 6. Responsive

| Breakpoint | Comportement | Ce qui se replie / disparaît |
|---|---|---|
| **`≤ 640px`** — `--bp-mobile` | Une tuile par ligne (12 colonnes), `IndicatorTile` `sm`, sidebar non rendue : c'est le seul cas où le tiroir existerait, et **il n'est pas implémenté au MVP** (design-system §3.2 ; US-15 est en P4, hors MVP). Le sélecteur de période passe sous le titre, pleine largeur. **La surface de franchissement (V1) n'est pas rendue au MVP** : rien ne se place sous le titre de ce fait, et le bandeau d'état reste le seul bandeau de la page. En V1, elle passe sous le titre, en pleine largeur, et **chaque ligne occupe deux lignes de texte** au lieu d'une : l'indicateur, puis la mention d'état avec sa date. Statut de ce cas : **non cible MVP**, et il est écrit dans le composant, pas seulement ici : un `--bp-mobile` n'est pas une cible du MVP, il ne doit pas non plus être une page cassée. | disparaissent : sidebar, export (le panneau reste présent mais passe sous la grille, inactif avec la mention « l'export n'est pas disponible sur ce format »). Le `ProvenanceStrip` fixe devient une ligne de bas de page. |
| **`641–1024px`** — `--bp-tablet` | Grille de 2 tuiles par ligne (6 colonnes), tuiles `sm`, sidebar **non rendue** (elle devient un tiroir, non implémenté au MVP) ; le sélecteur de période et le sélecteur de périmètre passent sur une ligne commune sous le titre, l'export à droite. Salle de réunion : l'écran est lu de loin, la densité reste. **La surface de franchissement (V1) n'est pas rendue au MVP.** En V1, elle garde son titre `--text-h2` et ses lignes `--text-body-sm` : c'est le seul bloc de la page qui porte la réponse à « qu'est-ce qui demande une décision aujourd'hui ? », il ne peut pas être la première chose qui s'amenuise. | disparaissent : la colonne `source_ref` passe sous la date dans la même ligne de caption ; le segment contextuel du `ProvenanceStrip`. |
| **`1025–1600px`** — `--bp-desktop` | Layout « page standard » : sidebar 240 px persistante, grille de 4 tuiles `sm` par ligne (3 colonnes chacune), période et périmètre alignés à droite du titre sur une seule ligne, export à l'extrémité droite de l'en-tête. C'est le cas du manager au bureau. | rien ne disparaît ; seul le bandeau d'état passe de pleine largeur à pleine largeur (identique). |
| **`≥ 1601px`** — `--bp-wide`, **cas projeté en comité** | Layout « page projetée » (design-system §4.2) : **sidebar masquée**, grille de **4 tuiles `lg`** par ligne — chiffre à 56 px, hauteur 220 px — et `--text-display` à 56 px. Le compteur « 2 hors cible sur 7 » passe en `--text-h1` et devient le premier élément lu. La période affichée passe en `--text-h2` : en séance, la première question est « de quand parle-t-on ? ». **La surface de franchissement (V1, donc absente du MVP) passerait au-dessus de la grille et son titre passerait en `--text-h1`** : à 3 m, « Franchissements de la période » est la réponse à la première question du comité — « qu'est-ce qui va nous poser problème aujourd'hui ? » — et elle doit se lire avant les chiffres. Au MVP, la grille de 4 tuiles `lg` monte donc d'autant, et c'est la ligne de seuil de chaque tuile — valeur, sens et date (B11, B14) — qui répond à cette question. La ligne de franchissement reste `--text-body-sm`, en **deux lignes** : l'indicateur d'un côté, la mention d'état et sa date de l'autre, pour que « déjà signalé le 02/09 06:00 » reste lisible sans rapprocher l'œil du texte d'à côté. | disparaissent : les libellés `--text-overline` des champs, remplacés par leur valeur seule (`FormField` en lecture). **En V1, la surface de franchissement ne disparaîtra à aucun breakpoint** : un franchissement qu'on ne voit qu'en réunion est un franchissement qu'on a traité trop tard. Au MVP, elle n'existe à aucun breakpoint, et **aucun espace n'est gardé pour elle**. |

- **Cible tactile** : 44 × 44 px minimum sur toutes les zones cliquables (`IndicatorTile`, `FormField`, actions du bandeau, lignes de la surface de franchissement, onglets de l'export). La tuile `sm` fait 96 px de haut : elle dépasse largement le minimum, ce qui est une conséquence de la densité lisible et non un effet de bord.
- **Débordement** : **garanti nul**. L'intitulé d'un indicateur est tronqué au deuxième mot long avec `…` en fin de ligne (une seule ligne, `--text-h3`) ; la `source_ref` est tronquée par le milieu avec `…` aux extrémités, jamais par retour à la ligne, pour ne pas faire bouger la hauteur des tuiles ; une valeur chiffrée ne s'écoule jamais (elle est mono, donc de largeur prévisible, et la tuile est dimensionnée pour la valeur la plus large du catalogue) ; les bandeaux d'état passent à la ligne sur deux lignes de texte au lieu de déborder ; **la ligne de seuil ne se tronque jamais** — règle permanente du composant (`design-system` § 2, Tailles) : au MVP elle porte la valeur, le sens et la date du seuil, en V1 la même ligne plus les horodatages de la machine, et dans les deux cas une date rognée serait une affirmation invérifiable ; elle se replie sur deux lignes plutôt que de perdre un mot ; aucun tableau n'est utilisé sur cet écran — il n'y a rien qui puisse déborder horizontalement.

---

## 7. Accessibilité

- [x] **Contraste 11,30:1** pour le texte courant — `#2C3633` sur `#F2F4F3`, mesuré (WCAG 2.1, tokens design-system §1.1). Le tableau complet des rapports mesurés est en § 7.1.
- [x] **Contraste 7,07:1** pour les grands textes — `--color-accent` `#0F5C57` sur le fond, et **4,73:1** pour la valeur hors cible `#B23A2E` sur son fond de tuile `#F6E1DE` (**5,37:1** sur le fond de page). Le chiffre d'une tuile est un **grand texte** au sens WCAG (≥ 24 px en gras) : le seuil applicable est 3:1, tenu à plus de 4:1 de marge.
- [x] **Navigation clavier complète** sur le `--bp-desktop` : chaque action de la page est atteignable et déclenchable au clavier, y compris la navigation vers le détail (PRD §7.3 : « navigation complète au clavier, y compris pour le drill-down »). Les lignes de la surface de franchissement sont focusables et déclenchent la même navigation que la tuile.
- [x] **Focus visible** — anneau `--color-border-focus` `#0F5C57` 2 px, jamais supprimé (`outline: none` sans remplacement est interdit). Le focus est visible sur fond sombre comme sur fond clair, et l'anneau n'est jamais rogné par un `overflow: hidden` de tuile.
- [x] **ARIA** — la grille est une `list` de `listitem` (pas une grille ARIA : il n'y a ni cellule fusionnée ni en-têtes croisés, une grille imposerait une navigation par cellule pour un lecteur d'écran). Chaque tuile est un `link` dont le nom accessible concatène **intitulé, valeur, cible, écart, ligne de seuil, date de calcul et source** — sinon un lecteur d'écran annonce « Taux de service » et perd le fait qu'il est hors cible. La ligne de lecture est un `status` à `aria-live="polite"` : le compte d'indicateurs hors cible s'y annonce au changement. Les bandeaux d'état sont des `role="alert"`. Les sélecteurs sont des `FormField` natifs `<label for>` + `<select>`, pas des `div` cliquables.
- [x] **La surface de franchissement est une `region` étiquetée, pas un `role="alert"`.** C'est un choix délibéré et c'est le même que celui du § 4 « Franchissement » : `role="alert"` est une annonce **interruptive**, il est fait pour « votre session a expiré dans deux minutes ». Une alerte de franchissement qui interromp la lecture d'un tableau à chaque rechargement est exactement le bruit que B12 interdit. La surface est donc une `<section aria-labelledby>` dont le titre est « Franchissements de la période », et son contenu **n'est pas** une région vivante en boucle : le compteur de la ligne de lecture, lui, est un `status` à `aria-live="polite"` et s'annonce **une fois**, au chargement. Un même franchissement annoncé à chaque rechargement serait plusieurs alertes pour un seul passage.
- [x] **Aucune information portée par la seule couleur** (PRD §7.3) : chaque état de tuile porte **une icône ET un texte**. `out_of_band` = `triangle-alert` + « hors cible de 1,2 pt » ; `out_of_band_alerting` = `bell-ring` + « hors cible de 1,2 pt · alerte de ce passage » ; `out_of_band_alerted` = `bell-ring` + « hors cible · déjà signalé » ; `threshold_latched` = `bell-ring` + « hors zone depuis le 2ᵉ passage · aucune nouvelle alerte » ; `threshold_armed` = `bell` + « seuil réarmé le 04/09/2026 06:00 » ; `perimeter_empty` = `circle-help` + « périmètre résolu vide » ; `unknown_freshness` = `circle-help` + « fraîcheur inconnue » ; `source_unavailable` = `file-warning` + « source indisponible » ; `permission_denied` n'a pas d'icône parce qu'il n'a pas de rendu. Un utilisateur daltonien voit la même information qu'un autre.
- [x] **Alternatives textuelles** : aucune image, donc aucune alternative à écrire. Les icônes d'état sont `aria-hidden="true"` et accompagnées de leur texte.
- [x] **Langue et direction de lecture** : `lang="fr"`, sens `ltr`. Le vocabulaire métier (taux de service, CA par client, sous-traitance) n'est pas traduit (PRD §7.4) ; les `source_ref` et les noms propres sont rendus tels quels, en mono, sans traduction ni mise en forme.

### 7.1 Contrastes mesurés sur les tokens du design system

Rapports WCAG 2.1 calculés depuis les valeurs de design-system §1.1, sur le fond réellement utilisé par cet écran (`#F2F4F3`) et sur le fond épinglé des badges d'état. **Tous les couples de texte de ce tableau tiennent le seuil AA de 4,5:1** ; la décision d'usage reste écrite à droite, parce qu'un usage permis ne dispense pas d'être écrit.

| Couple | Rapport | Verdict AA (4,5:1) | Décision d'usage sur cet écran |
|---|---|---|---|
| `#2C3633` (texte principal) sur `#F2F4F3` | **11,30:1** | conforme | texte courant, intitulés, chiffres |
| `#0F5C57` (accent) sur `#F2F4F3` | **7,07:1** | conforme | badge « officiel », lien « Ouvrir », état « dans la cible » |
| `#0F5C57` (accent) sur `#D3E4E2` (`accent-subtle`) | **5,94:1** | conforme | fond du badge « dans la cible » |
| `#B23A2E` (hors cible) sur `#F2F4F3` | **5,37:1** | conforme | valeur hors cible, filet et fond de tuile |
| `#B23A2E` sur `#F6E1DE` (fond hors cible) | **4,73:1** | conforme | chiffre dans une tuile hors cible |
| `#5B5B63` (source indisponible) sur `#F2F4F3` | **6,09:1** | conforme | valeur en état `source_unavailable` |
| `#7A6A3C` (inconnu) sur `#F2F4F3` | **4,81:1** | conforme | valeur en état `unknown_freshness` |
| `#4F5C57` (texte secondaire) sur `#F2F4F3` | **6,33:1** | conforme | **les dates de calcul et les identifiants de source portent ce token**, en `--text-caption`, sans restriction : 6,33:1 tient 4,5:1 avec 1,8 point de marge. L'ancien écart qui écartait le secondaire de ces informations est supprimé. |
| `#746A5E` (non officiel) sur `#F2F4F3` | **4,79:1** | conforme | `--color-stale` **porte en texte** le badge « non officiel » et la mention « propriétaire inactif », en plus du filet 3 px : la couleur n'est plus cantonnée au filet. Le fond du badge est épinglé à `--color-surface-raised` `#F7F9F8`, où le texte est à **5,01:1** (règle de `definitions.md` § 7.1). |
| `#7E8A85` (filet fort) sur `#F2F4F3` | **3,24:1** | conforme (3:1, WCAG 1.4.11) | filet d'un tableau en lecture dense et bordure de tuile. Élément non textuel : le seuil applicable est 3:1, pas 4,5:1. **Jamais en texte** — 3,24:1 est sous le seuil de texte. |
| `#9BA6A2` (texte désactivé) sur `#F2F4F3` | **2,27:1** | exempté (texte inactif, 1.4.3) | réservé aux **actions impossibles**, comme le bouton `Réessayer` pendant une tentative. Ne porte **jamais** d'information unique : le motif est dans l'infobulle et dans le nom accessible. |
| `#2C3633` (texte principal) sur `#F6E1DE` (fond hors cible) | **9,95:1** | conforme | **texte de la surface de franchissement posé sur une tuile hors cible**, et mention de la ligne `threshold` : aucune restriction, la couleur sémantique reste dans le chiffre et dans le filet |
| `#4F5C57` (texte secondaire) sur `#F6E1DE` (fond hors cible) | **5,58:1** | conforme | **les dates de la ligne `threshold`** — date du seuil, date du franchissement, date du réarmement — sur une tuile en état `out_of_band_alerting` / `out_of_band_alerted` / `threshold_latched`. La date d'une alerte est la partie qui ne peut pas être tronquée |
| `#2C3633` (texte principal) sur `#F7F9F8` (`surface-raised`, fond de badge épinglé) | **11,80:1** | conforme | texte courant du bandeau E15 « périmètre résolu vide », à côté de son badge |
| `#4F5C57` (texte secondaire) sur `#F7F9F8` (`surface-raised`) | **6,62:1** | conforme | ligne de bas du bandeau E15, et dates de la tuile en état `perimeter_empty` |
| `#7A6A3C` (inconnu) sur `#F7F9F8` (fond de badge épinglé) | **5,02:1** | conforme | **texte du badge `perimeter_empty` (E15)** — le fond du badge est épinglé à `--color-surface-raised`, **identiquement** à `definitions.md` § 7.1, pour que les écrans frères ne divergent pas |

> **Les trois restrictions d'usage que cet écran portait ont été levées.** Elles dérivaient d'un couple couleur/fond qui n'existe pas dans le design system : ce tableau mesurait `#4F5C57` à 4,17:1, `#746A5E` à 3,55:1 et `#7E8A85` à 2,27:1, et en déduisait qu'il fallait écarter le secondaire des dates, réduire `stale` au filet et réserver `#7E8A85` aux actions impossibles. Les trois tokens ont été corrigés dans le design system, qui définit `#4F5C57`, `#746A5E` et `#7E8A85` — recalculés sur ces valeurs, ils donnent 6,33:1, 4,79:1 et 3,24:1. Les trois verdicts « non conforme » et les trois restrictions qui en dépendaient sont donc supprimés, et cet écran applique la version conforme, alignée sur `definitions.md` § 7.1.
>
> **Aucun couple de la surface de franchissement n'a demandé un token neuf.** Le filet gauche est `--color-out-of-band` sur le fond de page (5,37:1, et c'est un élément non textuel : 3:1 suffirait) ; le texte est `--color-text-primary` (11,30:1) ; les dates sont `--color-text-secondary` (6,33:1). Les six lignes ajoutées ci-dessus mesurent des fonds **qui existent déjà** — `--color-out-of-band-subtle` et `--color-surface-raised` — sur des éléments **qui sont nouveaux**. Un rendu neuf sur un fond existant n'a pas besoin d'une couleur neuve, et c'est exactement ce que la règle « pas de couleur sans signifié » demande.

---

## 8. Données

| Champ | Type | Origine | Requis | Erreur possible |
|---|---|---|---|---|
| `value` | décimal + unité (`94.8` + `%`) | **entrepôt**, via `server/query` et `withScope()` — jamais de SQL dans un composant, jamais de valeur recalculée côté client (C1, B21) | oui | `QUERY_TIMEOUT` → `computation_too_long` (E11) ; `WAREHOUSE_UNREACHABLE` → `source_unavailable` (E1) |
| `computed_at` | timestamp **ou `null`** | **snapshot dans l'entrepôt**, jamais l'heure de notre requête | oui (nullable) | `null` → état `unknown_freshness`, fraîcheur « inconnue » (B6). **On ne comble jamais avec l'horloge du poste.** |
| `source_ref` | chaîne | identifiant de la matérialisation interrogée, affichée **telle quelle** en mono `--text-caption` | oui | `SCHEMA_UNKNOWN` → bandeau d'erreur, la valeur n'est pas rendue sans sa source |
| `target` | décimal **ou `null`** | versionnée **avec** la définition qui la porte (B14) ; jamais dans un écran séparé (US-11) | non | `null` sur une version qui en portait une → « cible à reconfirmer » (E16) |
| `target_version` | chaîne | version de définition porteuse de la cible — sert à afficher « cible de la v2 » quand la définition courante est plus récente | non | si `target_version ≠ definition_version`, la comparaison sémantique est suspendue |
| `threshold` | objet **ou `null`** | **versionné avec la définition signée qui le porte** (B11) ; jamais dans un écran séparé, jamais saisi ici | non | `null` → aucun seuil déclaré : le dépassement reste affiché en `out_of_band`, sans ligne d'alerte. Un seuil sans indicateur signé n'existe pas (B11) |
| `threshold.value` | décimal | idem | oui si `threshold` existe | — |
| `threshold.direction` | enum `above` \| `below` | idem | oui si `threshold` existe | — |
| `threshold.defined_at` | date | **le seuil porte sa date** (B11) ; affichée dans la ligne `threshold`. **Seul** champ `threshold` rendu au MVP avec `threshold.value` et `threshold.direction` : les trois faits sont dans la version signée, ils ne dépendent pas de la machine | oui si `threshold` existe | — |
| **`threshold_state`** — **V1** | enum `not_applicable` \| `armed` \| `disarmed` | **machine à états du franchissement** (design-system § 2.1), évaluée côté serveur sur la séquence de snapshots. **Le MVP ne demande pas ce champ** : il n'a pas de consommateur, puisqu'aucun état de machine n'est rendu | oui (V1) | `not_applicable` est une valeur **nommée** de la machine : « pas de machine » — aucun seuil déclaré (B11) ou machine suspendue. L'écran ne dessine alors rien sur le franchissement : ni ligne d'alerte, ni `bell-ring`, ni compteur. Un `threshold_state` rendu alors que `threshold` est `null` est un invariant rompu, l'écran affiche alors `out_of_band` et **ne** dessine aucune alerte |
| **`threshold_crossed_at`** — **V1** | timestamp **ou `null`** | **`computed_at` du snapshot où la valeur a quitté la zone normale** — jamais `Date.now()`. Non demandé au MVP | oui si `threshold_state = disarmed` (V1) | `null` pendant un franchissement en cours → état `out_of_band_alerting` |
| **`threshold_alerted_at`** — **V1** | timestamp **ou `null`** | **`computed_at` du snapshot qui a constaté l'émission de l'alerte du passage** — l'alerte est datée par la source, pas par l'envoi. Non demandé au MVP | oui si `threshold_state = disarmed` (V1) | `null` → l'alerte n'est pas encore partie, et l'écran **le dit** au lieu de prétendre qu'elle est partie |
| `threshold_rearmed_at` — **V1** | timestamp **ou `null`** | **`computed_at` du snapshot qui a constaté le retour dans la zone normale**. Non demandé au MVP | non (nullable) | `null` tant que le seuil n'a jamais été réarmé → la ligne `threshold` porte alors le seuil seul, sans historique |
| `threshold_pass_count` — **V1** | entier | nombre de franchissements depuis le dernier réarmement ; **s'incrémente, ne déclenche rien**. Non demandé au MVP | oui (défaut 0), V1 | un compteur qui réémet une alerte à l'incrément viole B12 : il est ici pour que le silence soit **lisible** |
| `perimeter_resolved_row_count` | entier | entrepôt, même scope que la valeur | oui | `0` alors que la définition déclare des lignes → état `perimeter_empty` et bandeau « périmètre résolu vide » (E15). **Jamais rendu comme un `0 %`.** |
| `definition_version` | chaîne | version signée courante de la définition ; affichée dans le badge (`officiel · v3`) pour rendre B22 lisible au premier écran | oui | absence de version signée → `provisional` (B13) |
| `definition_signed_at` | timestamp **ou `null`** | métadonnées produit, PostgreSQL — **jamais l'entrepôt** | non | — |
| `definition_signed_by` | personne nommée | annuaire, PostgreSQL | non | rôle non pourvu (F-001) → le badge le dit |
| `owner_active` | booléen | annuaire (données d'identité, pas de ligne métier) | oui | `false` → variante `stale-owner`, perte du statut officiel (B17, E8) |
| `is_official` | booléen | dérivé de l'existence d'une signature valide (B2), **pas d'un réglage d'affichage** (US-11) | oui | `false` → `provisional`, absent de tout tableau de bord partagé (B13) **et machine à états suspendue** (B13 : un indicateur non officiel ne déclenche aucune alerte) |
| `error_code` | enum fermée partagée client/serveur | couche API : `QUERY_TIMEOUT`, `WAREHOUSE_UNREACHABLE`, `SCHEMA_UNKNOWN`, `SCOPE_DENIED`, `PLAN_INVALID`… | non | une chaîne libre ici ferait que chaque endpoint invente son libellé |
| `restrictions` | — | **n'est pas un champ rendu.** La restriction de visibilité est appliquée à la donnée avant sérialisation (B7) : l'interface ne reçoit pas les lignes interdites, elle ne les masque pas. | — | un `masked: true` renvoyé au client serait déjà une fuite |

- **Chargement** : **tout d'un bloc**, pas de pagination ni de défilement infini. Le MVP compte trois indicateurs : une pagination serait une infrastructure sans audience. En revanche, si un périmètre en résout plus que la grille n'en affiche, la ligne de bas de grille porte le compte exact — « 12 indicateurs affichés sur 14 » — et **aucune tuile n'est cachée sans que le compte le dise**. Le tri reste la règle dans ce cas : on ne réintroduit pas un tri alphabétique pour « faire tenir ».
- **Cache / hors-ligne** : le cache court de 24 h indexé sur (hash de requête, `computed_at`, scope) sert à **ne pas marteler l'entrepôt**, jamais à produire une valeur. Un résultat de cache **sans `computed_at`** est traité comme `unknown_freshness`, pas comme une valeur datée par notre propre horloge : c'est le défaut exact que B6 et conventions §Data fetching interdisent. Hors-ligne : dernier résultat affiché, avec la date de son snapshot d'origine, jamais re-daté à l'ouverture. **Le `threshold_state` n'est jamais servi tel quel depuis le cache court** : il est réévalué sur la séquence de snapshots du jour, et un état d'armement lu en cache pourrait faire croire qu'une seconde alerte est partie alors qu'aucune n'est partie. Un résultat servi sans `threshold_state` est rendu en `out_of_band`, **sans ligne d'alerte** — on ne dessine pas un franchissement qu'on ne sait pas dater.
- **Données sensibles** : cet écran ne rend **aucune ligne de donnée** — c'est le rôle de l'écran de détail, et c'est aussi ce qui permet à B10 (journaliser chaque consultation) de s'appuyer sur cet écran sans rien exposer. Le journal n'est **pas affiché ici**. `source_ref` est un identifiant métier : il est journalisé, et il n'apparaît jamais dans une ligne d'erreur technique (conventions §Erreurs serveur). Aucune valeur n'est envoyée à un service tiers, aucun export n'élargit le périmètre affiché (B8). **La surface de franchissement n'envoie rien non plus** : au MVP l'alerte est visible dans le produit et il n'existe aucun canal sortant — donc aucun destinataire, aucune adresse, aucun envoi à protéger (US-12 est V1 — `roadmap.md` § 2.2).

---

## 9. Traçabilité

| ID | Origine | Manifestation sur cet écran |
|---|---|---|
| **B4** | PRD §4 | Seule la version signée courante est lue : la valeur affichée vient de `definition_version` et `is_official`. Une version modifiée sans re-signature n'apparaît pas ici — elle n'existe que dans le détail, et sans effet sur la valeur publiée. Le badge `official` nomme la version (`officiel · v3`) pour qu'on puisse voir laquelle. |
| **B5** | PRD §4 | Chaque tuile porte son `computed_at` **issu de la source**, en `--text-caption`, sous la valeur, jamais dans un tooltip ; et sa `source_ref` en mono sur la même ligne. Le `ProvenanceStrip` fixe rappelle la règle en permanence. Aucune date de ce produit n'est l'heure de la requête. |
| **B6** | PRD §4 | Quand `computed_at` est `null`, la tuile passe en état `unknown_freshness` : chiffre en `#7A6A3C` et mention « fraîcheur inconnue ». **Jamais** la date du poste, **jamais** « à l'instant », **jamais** la date de la dernière consultation réussie. E3 (matérialisation pas rafraîchie) se distingue de ce cas : la date existe, elle est affichée telle quelle, et le bandeau dit que la source n'a pas été rafraîchie depuis. |
| **B11** | PRD §4 | Le seuil n'est jamais une invention de cet écran : il est **lu** dans la version signée qui le porte, avec sa valeur, son sens et **sa date**, et il est écrit dans la ligne `threshold` de la tuile sous la forme « seuil < 96 % du 28/08/2026 ». Il n'y a **aucun** champ de saisie de seuil ici (C2) : la seule façon de le poser est la forme de définition, dans un autre module. Quand aucun seuil n'est déclaré, le dépassement reste affiché en `out_of_band` et **aucune ligne d'alerte n'apparaît** — un indicateur sans seuil n'a pas d'alerte, il a un écart. |
| **B12** | PRD §4 | **Au MVP, B12 n'est pas rendue par cet écran, et c'est un choix de version, pas un oubli.** Ce que le MVP rend vient de B11 et B14, pas de B12 : la tuile hors cible est `out_of_band` (chiffre `--color-out-of-band`, `triangle-alert` « hors cible de 1,2 pt ») et sa ligne `threshold` porte la valeur, le sens et la date du seuil. Ni `bell-ring`, ni compteur de passages, ni date de franchissement, ni réarmement : les quatre sont des produits de la machine à états, et `roadmap.md` § 2.1, § 2.2 et § 3.1 placent cette machine **en V1**. **Le rendu complet de B12 est écrit, et il revient en V1** : la machine à états nommée (design-system § 2.1 — `threshold_armed`, `out_of_band_alerting`, `out_of_band_alerted`, `threshold_latched`, `out_of_band`, `not_applicable`), rendue par une **surface dédiée** au-dessus de la grille (§ 3, § 4) et par la ligne `threshold` de chaque tuile. Les trois preuves que la règle y sera rendue : (a) **une seule alerte par passage** — `out_of_band_alerting` puis `out_of_band_alerted`, transition sans rendu, donc pas de toast rejoué ; (b) **aucune alerte à l'oscillation** — `threshold_latched` affiche « hors zone depuis le 2ᵉ passage · aucune nouvelle alerte » ; (c) **réarmement silencieux** — `threshold_armed` et sa ligne datée, **rien d'autre**. Toutes ces dates sont des `computed_at` de snapshot (§ 8), jamais `Date.now()`. Une indicateur non officiel verra sa machine **suspendue** (B13), une cible incertaine suspendra la comparaison (E16) | ⚠ **Écart de version, arbitrage du commanditaire à ce gate** : voir § 9.2, point 2. Aucune couleur n'a été ajoutée pour la machine, ni au MVP ni en V1 : le franchissement porte `--color-out-of-band` comme n'importe quel dépassement, et ce qui le distingue est une **date** |
| **US-4** | PRD §3, **P1** | « Être signalé quand un indicateur sort du seuil écrit à côté de sa définition. » **Au MVP, cette user story n'est servie que par son versant vérifiable** : le seuil est une donnée de la version signée, lue et affichée avec sa valeur, son sens et sa date (B11), et la valeur est comparée à la cible avec son écart (B14). Les deux critères qui portent sur l'**alerte** et sur le **réarmement** arrivent en V1 avec la machine (`roadmap.md` § 2.1). **Ce qui est écrit pour la V1, en entier** : (1) « un seuil ne peut être posé que sur un indicateur signé » — déjà vrai au MVP, et il n'y a aucun moyen de poser un seuil ici (C2), et un indicateur `provisional` n'a pas de machine (B13) ; (2) « le franchissement produit une alerte une seule fois par passage » — la surface de franchissement énonce le compte de la période, la tuile dit « alerte de ce passage » puis « déjà », et `threshold_pass_count` **incrémente sans déclencher** ; (3) « le retour dans la zone normale réarme le seuil sans nouvelle alerte » — `threshold_armed`, une ligne datée, et **aucune** alerte, **aucun** toast, **aucun** bandeau (§ 4, § 5). US-4 sera servie **sans canal sortant** : le signal est dans le produit, ce qui est la seule forme d'alerte possible | ⚠ **V1** pour les critères 2 et 3 — § 9.2, point 2 |
| **B13** | PRD §4 | Un indicateur sans définition signée s'affiche en variante `provisional` : filet `--color-stale`, badge « non officiel ». L'export de cet écran **exclut** les indicateurs non officiels et le dit dans le panneau d'export ; il ne peut donc pas servir à contourner B13 par un fichier. B13 a une seconde manifestation, moins évidente : « **ne déclenche aucune alerte** ». La machine à états est **suspendue** pour un indicateur non officiel — le dépassement reste affiché en `out_of_band`, la ligne `threshold` disparaît, et la surface de franchissement ne le compte pas. |
| **B14** | PRD §4 | La cible est affichée **à côté de la valeur** (`cible 96 %` + écart signé), pas dans un écran séparé. Le champ `target` est celui de la version de définition qui le porte, et `target_version` est affiché quand il diffère de la version courante : une cible héritée d'une ancienne version est nommée comme telle, jamais appliquée en silence. |
| **B17** | PRD §4 | `owner_active: false` → variante `stale-owner`, badge « propriétaire inactif », filet `--color-stale`, **la valeur reste affichée et datée**. Un bandeau nomme la conséquence : le statut officiel est perdu (B17), et un propriétaire nommé doit être désigné avant toute nouvelle signature. Le chiffre ne devient pas « non officiel » par une couleur, mais par un badge et une action nommée. La perte du statut officiel **suspend aussi la machine à états** : la valeur reste hors cible, mais plus rien n'est signalé, et la surface de franchissement ne le compte pas. |
| **B22** | PRD §4 | Chaque tuile affiche la version qui a produit la valeur (`officiel · v3`) et le `ProvenanceStrip` nomme la version et son signataire. Une nouvelle signature ne réécrit pas l'historique : les valeurs déjà lues restent rattachées à leur version, et un export produit aujourd'hui reste rattaché à la version d'aujourd'hui même après une signature plus récente. La même règle vaut pour la **ligne `threshold`** : le seuil affiché est celui de la version qui a produit la valeur, donc un changement de seuil par une version postérieure n'est pas appliqué en silence au franchissement en cours. |
| **E1** | PRD §6 | Bandeau `--color-source-unavailable` + tuiles en état `source_unavailable` : **dernière valeur connue, conservée, avec sa date**. Jamais un zéro, jamais une liste vide, jamais un tiret. Action `Réessayer`. |
| **E2** | PRD §6 | Tuiles en état `no_data` : **aucun chiffre affiché** (une absence n'est pas un zéro), message « aucune donnée sur la période », cible toujours visible, bandeau récapitulatif et action **« Élargir la période »** qui écrit la période élargie dans l'URL. Distinct de E15 et de `filtered-to-zero`. |
| **E3** | PRD §6 | Bandeau : « La matérialisation `dsn_prod_commandes_v42` n'a pas été rafraîchie depuis le 29/09/2026 06:00 — les valeurs affichées sont celles de ce snapshot. » La date réelle est affichée, jamais une fraîcheur devinée ; un indicateur sans `computed_at` combine ce bandeau et l'état `unknown_freshness`. **En V1, la surface de franchissement disparaît** dans ce cas : on ne peut pas dater un franchissement sur un snapshot dont on ne connaît pas la date, donc l'écran renonce à l'alerte plutôt que d'en inventer la date. Au MVP, rien ne change : ni le badge « fraîcheur inconnue », ni la valeur, ni la ligne de seuil ne dépendent de la date du franchissement. |
| **E8** | PRD §6 | Variante `stale-owner` + bandeau « propriétaire inactif » : la valeur reste lisible et datée, le statut officiel est perdu, et le bandeau nomme l'action requise (« désigner un propriétaire »). L'indicateur **n'est pas retiré** de la liste : le retirer effacerait ce que le lecteur attendait (E17). |
| **E9** | PRD §6 | « Seuil franchi puis retour dans la zone normale dans la même journée → une seule alerte, puis réarmement silencieux. » **Cet edge case est entièrement du ressort de la machine à états : il n'est donc pas rendu au MVP**, et rien ne le simule. En V1, il est rendu en une fois, et c'est la seule façon de le rendre **falsifiable** à l'œil : la tuile est d'abord `out_of_band_alerting` (« alerte de ce passage · franchi le 02/09 06:00 »), puis `out_of_band_alerted` (« hors cible · déjà signalé ») — **une seule alerte, et rien ne se rejoue** au rechargement, parce que la transition entre les deux n'a aucun rendu ; puis la valeur revient dans la zone et la tuile passe à `threshold_armed` (« seuil réarmé le 04/09 06:00 »), **sans toast, sans bandeau et sans animation**. Si la valeur oscille autour du seuil sans jamais revenir franchement, l'état est `threshold_latched` et l'écran dit « hors zone depuis le 2ᵉ passage · aucune nouvelle alerte » : c'est la seule manière de distinguer à l'œil « une alerte » de « deux alertes ». Au MVP, une oscillation autour du seuil se lit comme ce qu'elle est — deux dépassements de cible, deux écarts datés — et l'écran n'en dit rien de plus, parce qu'il n'a rien de plus à dire | ⚠ **V1** — § 9.2, point 2 |
| **E15** | PRD §6 | Tuile en état **`perimeter_empty`** — un état nommé du design system, ajouté pour cette occasion : **aucun chiffre**, mention « **périmètre résolu vide** », badge `--color-unknown` `#7A6A3C` sur fond épinglé `--color-surface-raised` `#F7F9F8` (**5,02:1**), icône `circle-help`, action « Ouvrir la définition », **jamais un `0 %`**. Le rendu est **celui du rendu 7 de `design-system` § 2.7** — mot, token, fond et ratio compris : un lecteur qui voit « périmètre résolu vide » sur le référentiel le reconnaît immédiatement ici, et les écrans ne peuvent pas diverger. L'action est « Ouvrir la définition » et **jamais** « Élargir la période » : c'est précisément ce qui distingue cet état de `no_data` (§ 4, rang 0 de la précédence). Les autres tuiles **restent rendues** — un périmètre vide est propre à une définition, pas à la page ; seul le bandeau d'état prend le cas page entière. ⚠ **Écart fermé** : l'état `perimeter_empty` existe désormais dans `IndicatorTile` (design-system §2) — voir § 9.2, point 1. |

### 9.1 Contraintes respectées

| ID | Origine | Contrainte respectée |
|---|---|---|
| **C1** | PRD §5 | Aucune valeur n'est calculée, recalculée ou mise en forme en JavaScript : la lecture passe par `server/query` et `withScope()`, l'entrepôt est la seule source des chiffres et n'est jamais écrit. |
| **C2** | PRD §5 | Aucune saisie de données métier sur cet écran. Période et périmètre sont un **scope** porté par l'URL, pas un formulaire. L'état « Vide — jamais visité » renvoie vers le module qui déclare, il ne déclare pas. |
| **C6** | PRD §5 | Le périmètre de l'écran est celui de la séance de comité : lire une valeur, sa cible, sa date, sa source. Aucun compositeur, aucun rapport, aucun réglage — l'écran fait une chose. |
| **C7** | PRD §5 | Deux notions seulement sont apprenables sur cet écran : la période et l'état d'un indicateur. Le vocabulaire est celui du PRD (cible, hors cible, périmètre, freshness→fraîcheur), pas celui d'un outil BI. |
| **C9** | PRD §5 | Aucun encart « migrez vos tableurs », aucune alerte de migration. Le produit ne se présente pas ; il affiche des valeurs. |
| **B7** | PRD §4 | Une tuile interdite par le périmètre n'est pas rendue : pas de placeholder, pas de contour, pas de message « accès refusé ». Le compte de l'en-tête ne compte que le visible, et la ligne de bas de grille énonce cette absence. |
| **B8** | PRD §4 | `ExportPanel` produit exactement la période, le périmètre et les restrictions affichés ; il ne propose aucun élargissement. Un export demandé hors périmètre passe en état `forbidden_scope` et nomme le périmètre qui serait autorisé. |
| **B9** | PRD §4 | Période et périmètre vivent dans l'URL : une adresse restitue un état, **jamais un droit**. Aucun jeton de partage dans l'URL, aucune adresse accessible sans session. |
| **B10** | PRD §4 | Chaque lecture de cet écran est journalisée, y compris un refus ; le journal est conservé un an. L'écriture est **invisible** ici par choix : un journal consultable sur l'écran de lecture rendrait le journal décoratif. Le franchissement y entre par la même porte : chaque passage constaté est journalisé avec sa date de source, et c'est ce journal — pas l'écran — qui permet de vérifier qu'une seule alerte est partie pour un passage. |
| **B27** | PRD §4 | L'export porte **exactement** ce que B27 énumère : la version de la définition, la date de sa signature, la date de calcul, la source, son auteur et sa date d'export — et rien de plus n'est prétendu. **Le mot « seuil » n'y figure pas** : ce n'est donc pas B27 qui impose d'afficher la ligne `threshold` à l'écran, et rien dans ce dossier ne le prétend. L'argument qui a été écrit ici — « un support qui affirme « déjà signalé le 02/09 06:00 » doit pouvoir être contrôlé sur la même feuille » — est **retiré de l'export** et ne vaut que pour l'écran, en V1, où la ligne de seuil est déjà rendue (il y a écrit la même phrase). Ce qui est vrai dans les deux cas, c'est le critère US-9 lui-même : « un support qui circule en réunion ne peut pas être déconnecté du chiffre qu'il affirme » |

### 9.2 Écarts et arbitrages ouverts

| # | Point | Ce qui a été fait dans cet écran | Arbitrage attendu |
|---|---|---|---|
| 1 | ~~E15 n'a pas d'état nommé dans `IndicatorTile`~~ — **ÉCART FERMÉ** | L'état **`perimeter_empty`** a été ajouté à la table des états de `IndicatorTile` (design-system §2), avec son rendu : aucun chiffre, badge `--color-unknown` `#7A6A3C` sur fond épinglé `--color-surface-raised` `#F7F9F8` (5,02:1), icône `circle-help`, mention « périmètre résolu vide », action « Ouvrir la définition ». Le mot, le token, le fond et le ratio sont **ceux du rendu 7 de `design-system` § 2.7**, pour que les écrans ne divergent pas — et le fond épinglé est la règle du composant (contrat `DataTable`), que cet écran ne recalcule pas. L'état est rang **0** de la précédence (§ 4.1) — avant la panne et avant l'incertitude, parce qu'il n'y a rien à comparer. `no_data` **n'a pas été réutilisé** : « élargir la période » ne répare pas un périmètre vide | ~~Soit un état `perimeter_empty` est ajouté au design system~~ — **fait**. Il ne reste rien à trancher sur E15, et `definitions.md` n'a pas à être modifié : son rendu 7 est déjà le rendu canonique, il a simplement été promu au niveau du composant |
| 2 | **Le périmètre MVP de la machine à états** — **ARBITRÉ PAR LE COMMANDITAIRE À CE GATE. Une version antérieure de ce tableau attribuait au gate une décision qu'il n'avait pas prise : elle y affirmait que la détection du franchissement était dans le MVP, en s'appuyant sur `roadmap.md` § 2.1. C'est faux, et c'est le défaut le plus grave de ce dossier** : `roadmap.md` § 2.1 dit l'**inverse** — « Le MVP livre **l'état** […] dérivé de la valeur, **sans machine à états** ni tâche de fond. **B12 […] part entièrement en V1** » — et `roadmap.md` § 2.2, sous le titre « Ce qui n'est **PAS** dans le MVP », classe B12 en **V1**, comme `roadmap.md` § 3.1 (« la machine à états […] et le canal mail arrivent ensemble »). Trois occurrences concordantes. Le commanditaire a tranché **le contraire** de ce qui était écrit, et l'a dit ainsi : « Un gate qui n'a pas tranché ne peut pas être cité comme ayant tranché. » | **Ce qui RESTE au MVP**, et qui ne dépend pas de B12 : l'état `out_of_band` avec sa cible, son écart et sa date de calcul (B11, B14), et la ligne `threshold` portant **la valeur du seuil, son sens et sa date** (B11) — trois faits de la version signée, disponibles sans machine. **Ce qui SORT du MVP** et arrive en V1 : les quatre états `out_of_band_alerting`, `out_of_band_alerted`, `threshold_latched`, `threshold_armed` ; `threshold_pass_count` ; les trois horodatages de franchissement, d'alerte et de réarmement ; le badge `bell-ring` ; la **surface de franchissement** de cet écran ; et la ligne de seuil à six faits. Aucun de ces éléments n'est supprimé : tous sont écrits (§ 3, § 4, § 5, § 6, § 8) et étiquetés V1, avec l'endroit exact où ils reviennent. **Ce qui reste dans le design system** : § 2.1 `ThresholdMachine`, § 2.2 la précédence, le slot `threshold`, `not_applicable`, les huit transitions — un design system décrit **ce qu'est le produit**, pas son calendrier | **Arbitrage rendu, rien à trancher sur ce point.** Le fondement du périmètre est `roadmap.md` lui-même ; l'arbitrage ci-dessus le constate, le date, et tranche **le contraire** de ce qui était écrit dans ce tableau. La phrase du commanditaire est reproduite telle quelle |
| 3 | Le badge `official` ne porte que le mot « officiel » | il porte `officiel · v3`, sinon deux valeurs produites par deux versions différentes ont la même apparence et B22 devient invisible au premier écran | confirmer l'extension du badge, ou richer la `source_ref` du numéro de version sur la ligne de caption |
| 4 | ~~Trois tokens de couleur du design system n'atteignent pas 4,5:1 en texte~~ — **Résolu par la correction des tokens dans le design system** : `--color-text-secondary` `#4F5C57` est à 6,33:1, `--color-stale` `#746A5E` à 4,79:1, `--color-border-strong` `#7E8A85` à 3,24:1. Aucune restriction d'usage n'est appliquée | ~~assombrir les trois tokens, ou acter l'usage restreint par écrit~~ — plus rien à trancher : le secondaire porte les dates et les sources, `stale` porte le texte du badge, `--color-border-strong` reste un filet conforme à 1.4.11 | |
| 5 | `ExportPanel` exclut les indicateurs non officiels (B13) | le panneau le déclare avant l'export, dans le panneau lui-même | confirmer : un export « de ce que je vois » qui exclut une partie de ce qu'on voit doit le dire, il ne doit pas le faire silencieusement |

---

## 10. Checklist de gate

- [x] Les états sont décrits avec un rendu concret, nommés comme ceux de `IndicatorTile` (`loading`, `default`, `empty-never-visited`, `no_data`, `perimeter_empty`, `error`, `scope-error`, `success`, `franchissement`, `réarmement`, `permission_denied` / `offline`, `read-only`) — soit 12 lignes en § 4, dont **deux étiquetées V1** (« Franchissement », « Réarmement ») : leur rendu complet est écrit, et le § 4 dit en toutes lettres ce que le MVP rend à la place.
- [x] Chaque élément interactif a un comportement et un feedback (§ 5, 19 lignes) — y compris les éléments qui n'ont **délibérément** aucune action : la mention d'état du seuil, le réarmement, la ligne de bas de grille. « Aucun comportement » écrit en toutes lettres est un comportement, pas une case vide. Les quatre lignes de la surface de franchissement sont **étiquetées V1** : leur comportement est écrit, il n'a simplement pas d'objet tant que la surface n'est pas rendue.
- [x] Le responsive est défini à **chaque** breakpoint du design system : `≤640`, `641–1024`, `≥1025`, `≥1601`. En V1, la surface de franchissement ne disparaîtra à aucun ; au MVP elle n'existe à aucun et ne réserve aucune place.
- [x] La section Anti-générique est cochée **et justifiée**, avec quatre choix assumés et non neutres (tri par écart écrit dans le titre, absence assumée de date globale, précédence incertitude > hors cible, alerte dans la page et jamais en toast).
- [x] Aucune valeur de design n'est laissée à « à définir » : chaque couleur, chaque échelle, chaque durée est un token du design system ; les seuls chiffres calculés ici sont les rapports de contraste de § 7.1, avec leur méthode de calcul. **Aucun token n'a été ajouté pour US-4 ni pour E15** : les deux rendus neuf sont posés sur des fonds qui existaient déjà, et les six rapports ajoutés en § 7.1 sont mesurés sur ces fonds.
- [x] Chaque ID B*/E*/C* de l'en-tête apparaît en § 9 avec l'endroit où il est visible à l'écran (B4, B5, B6, **B11**, **B12**, B13, B14, B17, B22, E1, E2, E3, E8, **E9**, E15), plus **US-4** en § 9 et en § 1.
- [x] `node forge-guard.js placeholders` ne signale rien ici.
- [x] L'écran reste cohérent avec `.forge/design/design-system.md` : aucun composant inventé, aucune ombre, aucun blanc pur, aucun dégradé, valeurs chiffrées en mono, date de calcul sous chaque valeur, et **états nommés identiques** à ceux du composant — `perimeter_empty` compris, et les quatre états de la machine à seuil, **écrits et étiquetés V1** au lieu d'être rendus. La grille à 4 par ligne de cet écran est en `sm` (96 px) et en `lg` (220 px) : le passage de `md` à 172 px ne la concerne pas, l'effet sur les grilles en `md` est écrit dans le design system § 2 (Tailles) et dans `tableau-de-bord.md` § 9.2 point 3.