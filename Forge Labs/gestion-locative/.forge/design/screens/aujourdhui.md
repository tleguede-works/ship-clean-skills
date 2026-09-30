---
type: screen
slug: aujourdhui
title: Aujourd'hui
module: aujourdhui
status: draft
generated_at: 2026-09-30
derived_from:
  - .forge/prd.md
  - .forge/design/design-system.md
rule_ids: [B1, B2, B3, B4, B6, B12, B13, B15, B16, B18, C2, C4, C5, C8, C9, N1, N2, N3, N4, N5]
edge_case_ids: [E1, E2, E4, E11, E12]
flow: boucle-quotidienne
---

# Écran — Aujourd'hui

> Ce document est la **source de vérité** pour qu'une IA génère l'interface de cet écran.
> Il est généré depuis le gabarit, jamais recopié. Aucun `{{PLACEHOLDER}}` ne doit subsister.

---

## 1. Rôle de l'écran

| | |
|---|---|
| **Archétype d'app** | `mobile_field_ops` (principal), `rental_tenancy` (secondaire) |
| **Module** | `aujourdhui` — rang 1 dans la navigation |
| **Route** | `/` |
| **Type** | page |
| **Utilisateurs** | Le propriétaire, seul utilisateur, seul opérateur (C3) |
| **User stories servies** | US-1, US-2, US-3, US-5, US-7, US-8 |
| **Règles métier** | B1, B2, B3, B4, B6, B12, B13, B15, B16, B18, C2, C4, C5, C8, C9, N1, N2, N3, N4, N5 |
| **Edge cases** | E1, E2, E4, E11, E12 |

**Une phrase** : cet écran permet au propriétaire de savoir, **sans rien cliquer**, où se
trouve ce qu'il vient d'écrire, et d'atteindre la saisie en un geste, debout et d'une main.

**Pourquoi il est au rang 1 de la navigation** : parce qu'il ouvre la boucle — *consulter
l'état, agir, saisir, continuer* — et parce qu'il est **le seul endroit du produit où les
trois mots de B2 sont enseignés**. Si « pas encore confirmé » n'est pas visible ici, il
n'existe nulle part ailleurs ; et le critère de succès n°3 du PRD est un test de langage,
pas un test d'écran. C'est aussi l'écran ouvert au lancement, donc l'entrée la plus
utilisée. « Accueil » est premier ici pour cette raison précise, et pas par défaut.

**Le test de validation de cet écran est une question, pas une inspection** : que dit le
propriétaire au téléphone s'il n'ouvre pas Bailly ? La réponse doit être dans la phrase du
bandeau, pas dans une icône.

---

## 2. Direction visuelle de cet écran

Repris du design system — **valeurs concrètes, jamais « à définir »**.

| | |
|---|---|
| **Mood** | opérationnelle, parlante, sans alarme |
| **Densité** | **dense** — c'est le seul écran qui affiche les quatre familles d'information à la fois, donc le seul où la hauteur de ligne est un problème. Chaque bloc est un `TitreÉcran` à 44 pt, pas un en-tête à 72 pt : le propriétaire regarde cet écran debout, de loin, dans un couloir, et il doit voir le bandeau, le blocage et l'action avant de lire un titre |
| **Niveau de contraste** | **fort** — N4 vise un propriétaire de 58 ans qui lit des chiffres à la tombée du jour, et N1 impose un indicateur de synchronisation lisible en moins d'une seconde. Le `texte-tertiaire` est le seul cran bas du produit et il ne porte jamais une information unique |
| **Traitement photographique** | **AUCUN.** Aucune vignette, aucune photo de bien, aucun plan d'appartement : l'adresse est une donnée du bail et rien d'autre (X6) |
| **Référence** | la page d'accueil d'un **journal de chantier papier** — une liste de choses à faire aujourd'hui, une date, et rien qui décore |

**Les valeurs portées par cet écran**

| Rôle | Token | Valeur |
|---|---|---|
| Fond de l'application | `--color-background` | `#101319` |
| Surface des listes et du bandeau au repos | `--color-surface` | `#171B22` |
| Barre d'action, feuille au premier plan | `--color-surface-raised` | `#212630` |
| Creux : champ, ligne alternée | `--color-surface-sunken` | `#0A0C10` |
| Encre de lecture | `--color-texte-principal` | `#E8ECF3` |
| Encre secondaire | `--color-texte-secondaire` | `#A6B0C0` |
| Ambre — « sur cet appareil » | `--color-primaire-600` | `#E0A23A` |
| Sauge — « confirmé par le serveur » | `--color-confirme-600` | `#7FB08C` |
| Cyan-gris — « à venir » | `--color-info-600` | `#74A9BC` |
| Terre cuite — « en retard ou impossible » | `--color-alerte-600` | `#F09286` |
| Filet de séparation | `--color-filet` | `#2A303A` |

| | |
|---|---|
| **Surface** | `--color-surface` `#171B22` sur `--color-background` `#101319` |
| **Accent utilisé** | `--color-primaire-600` `#E0A23A` — il ne sert qu'à deux choses sur cet écran : l'ambre du bandeau « sur cet appareil » et le bouton `Saisir`. **C'est le même accent que l'action**, parce que l'écriture locale et le geste qui la produit sont la même situation |

### 2.1 Anti-générique — obligatoire

Cet écran ne doit ressembler **à aucun** de ces défauts :

- [x] **Pas de fond blanc pur `#FFFFFF` par défaut.** Le fond est `#101319`, un gris ardoise
      froid choisi à la valeur, et le thème sombre unique est justifié au design system
      § 0.3 : dans un couloir mal éclairé, c'est le seul fond qui tienne 4,5:1 sur un texte
      secondaire **sans** le confondre avec le texte principal.
- [x] **Pas de carte ombrée pour tout.** Aucun bloc de cet écran n'a de fond propre ni
      d'ombre. Les quatre familles sont séparées par un `--color-filet` de 1 px et par de
      l'espace, dans un rapport de 4. La seule surface élevée est la `BarreAction`, et son
      ombre `--shadow-md` sert à dire qu'elle flotte au-dessus d'une liste — pas à la
      contenir.
- [x] **Pas d'uniformité.** La hiérarchie vient d'un rapport d'échelles : `--text-h1` 34 px
      pour le compteur du bandeau, `--text-h2` 28 px pour le titre d'onglet, `--text-body`
      17 px pour le fait, `--text-caption` 14 px pour la date. Le compteur du bandeau est
      le seul élément de tout le produit en `--text-h1` : il se lit de loin.
- [x] **Pas de gris neutre générique `#6B7280`.** Les quatre encres sont choisies dans une
      rampe ardoise froide (`#E8ECF3`, `#A6B0C0`, `#8B95A5`) et le gris de filet `#2A303A`
      est sans information.
- [x] **Pas de mise en page centrée symétrique.** L'écran est un **flux vertical aligné à
      gauche**, pleine largeur, marges latérales fixes de `--space-lg`. Le seul bloc centré
      est un état vide, et même là le texte est aligné à gauche dans un bloc de 280 pt.
- [x] **Pas d'illustration d'appoint générique.** Aucune image, aucun dégradé, aucun glyphe
      dans un cercle décoratif. Le seul glyphe en cercle est celui du `BandeauSynchronisation`,
      et il **accompagne un mot**.
- [x] **Pas d'une seule famille de police.** Deux familles : la pile système pour le texte,
      et `--font-chasse` pour les chiffres, les dates et les montants. Les montants d'une
      ligne d'encaissement s'alignent verticalement, et c'est la seule raison de la seconde
      famille.

**Choix assumé et non neutre** : **l'écran d'accueil n'est pas un sommaire, et il ne
commence pas par une liste.** Il commence par le bandeau de synchronisation, qui est la
seule information de cet écran qui ne peut pas être consultée ailleurs. Et quand rien
n'attend, l'écran ne le dit pas avec un message de congratulation : il dit
« **Rien à confirmer** » en gris, parce qu'un « tout va bien » coloré est une récompense
et qu'une récompense attire l'œil sur une information qui n'en a pas besoin. Le produit qui
promet de ne pas mentir ne félicite personne de ne pas avoir de problème.

---

## 3. Anatomie

```
BandeauSynchronisation                                  PERMANENT, 72–120 pt
├─ [icone] [nombre] "2"        --text-h1, --color-primaire-600
├─ [phrase] "2 écritures pas encore confirmées. …"      --text-body-fort
└─ [lien_voir] "Voir"                                    --color-primaire-600
        │
        ▼  --space-md
PanneauBlocage  variante `a_decider`            CONDITIONNEL, 72 pt par ligne
├─ [titre] "2 décisions bloquent la clôture de la journée."
├─ [lignes] LigneDonnée × n  — échéance, bien, date, ce qui est attendu
└─ [action] Bouton discret "Traiter ces 2 décisions"
        │
        ▼  --space-2xl + sur-titre
TitreÉcran  variante `avec_contexte`   — ne s'affiche pas : on est sur la racine
        │
        ▼  --space-lg
ListePlate  variante `groupee`
├─ [sur_titre] "AUJOURD'HUI · 12 SEPTEMBRE"     --text-overline
├─ LigneFait × n
│   ├─ LigneFait variante `constate`  — constat_exportable
│   ├─ LigneFait variante `apprecie`  — bloc en retrait, préfixe écrit
│   ├─ LigneFait variante `avec_photos` — rangée de VignettePhoto
│   └─ LigneFait variante `non_confirme` — mot d'état ambre écrit
├─ [sur_titre] "CE QUI N'EST PAS ENCORE ENVOYÉ"   — replié, vide si rien
├─ LigneFait variante `non_confirme` × n
└─ [lignes] Vide  variante `aucune_donnee`   si aucun fait aujourd'hui
        │
        ▼  --space-2xl + sur-titre
ListePlate  variante `groupee`
├─ [sur_titre] "ENCAISSEMENT · SEPTEMBRE"
├─ LigneEncaissement × 3   — `impaye` | `paye_en_retard` | `a_venir`
└─ Bouton discret "Voir le mois"             → /encaissement
        │
        ▼  --space-2xl + sur-titre
ListePlate  variante `groupee`
├─ [sur_titre] "CE QUI ATTEND"
├─ [contexte] "3 demandes · 2 attendent ta décision"
└─ LigneDemande × n   — variante `moi` d'abord, puis `locataire`
        │
        ▼  --space-3xl
BarreAction  variante `principale`
├─ [action_principale] Bouton lg "Saisir"        PERMANENTE, 88 pt
└─ [hauteur_respiratoire] --space-3xl
BarreOnglets  variante `actif` sur le 1er segment   PERMANENTE, 64 pt
```

| # | Composant | Rôle | Source |
|---|---|---|---|
| 1 | `BandeauSynchronisation` | Dire en permanence où se trouve ce qui vient d'être écrit (B1, B2, B6) | design-system § 3.1 |
| 2 | `PanneauBlocage` | Porter la property `garde-fou` : les échéances bloquantes dont la décision manque (B13) | design-system § 3.3 |
| 3 | `ListePlate` | Contenir les lignes sans carte ni fond propre | design-system § 3.23 |
| 4 | `LigneFait` | Rendre un fait daté et rendre visible s'il est constaté ou apprécié (B7) | design-system § 3.5 |
| 5 | `VignettePhoto` | Montrer une pièce jointe et dire où elle en est (B3, C8) | design-system § 3.27 |
| 6 | `LigneEncaissement` | Dire l'un des trois états de l'encaissement, en un coup d'œil (US-5) | design-system § 3.7 |
| 7 | `LigneDemande` | Rendre `qui doit agir` avant l'intitulé (B14) | design-system § 3.6 |
| 8 | `Vide` | Rendre un état vide avec son libellé écrit | design-system § 3.26 |
| 9 | `Bouton` | Porter l'action principale du produit | design-system § 3.8 |
| 10 | `BarreAction` | Porter `Saisir` au même endroit, dans la portée du pouce (C4) | design-system § 3.16 |
| 11 | `BarreOnglets` | Naviguer vers les trois autres destinations | design-system § 3.17 |
| 12 | `CarteVocabulaire` | Rappeler les trois mots sur appui long d'un mot d'état | design-system § 3.29 |

---

## 4. États — tous, sans exception

| État | Déclencheur | Rendu | Feedback utilisateur |
|---|---|---|---|
| **Chargement** | Ouverture de l'application, lecture des écritures locales | **6 lignes en ossature**, de la hauteur **exacte** de `LigneFait` (56 pt) ou `LigneEncaissement` (72 pt) selon le bloc. Une ossature d'une autre hauteur fait sauter la liste au remplissage. Le `BandeauSynchronisation` rend son état `rien_a_confirmer` gris pendant ce temps — **il ne tourne pas et ne montre pas de compteur fantôme** | Aucun texte d'attente. Le défilement est verrouillé tant que la hauteur du premier bloc n'est pas connue |
| **Rempli** | Des faits, des lignes d'encaissement et des demandes existent | Les trois groupes rendus dans leur intégralité, le bandeau dans l'état qui correspond à la file locale | Le bandeau est le seul feedback : il porte le compte et la phrase |
| **Vide — jamais visité** | Le propriétaire a ouvert Bailly et n'a rien saisi | Le `BandeauSynchronisation` rend `rien_a_confirmer` — **parce que l'absence d'écritures locales est un fait, pas une absence**. Puis `Vide` variante `aucune_donnee` : « Aucun fait aujourd'hui. Le premier que tu écris ici peut être daté de maintenant. » | La `BarreAction` reste présente avec `Saisir`. **Un module vide où le geste principal a disparu est un module dont on ne peut pas sortir** |
| **Vide — aucune donnée** | Des faits existent mais pas pour aujourd'hui | Le groupe `AUJOURD'HUI` rend `Vide` variante `aucune_donnee` : « Aucun fait aujourd'hui. Les faits des autres jours sont dans leur dossier. » Le groupe `ENCAISSEMENT` et le groupe `CE QUI ATTEND` sont rendus normalement | Aucun bouton dans le vide. Le seul geste est `Saisir`, dans la barre d'action |
| **Erreur de chargement** | La lecture locale échoue, ou le serveur est injoignable au premier lancement sans écriture locale | `Vide` variante `erreur`, avec un `BandeauAlerte` en variante `impossible` au-dessus : « Impossible de lire. Rien n'est affiché — et ce n'est pas vide : on ne sait pas encore. » | **Aucun bouton « Réessayer »** : la reprise est automatique, et un bouton dirait qu'elle ne l'est pas. Le seul geste proposé est un `BandeauAlerte` en variante `information` : « La lecture se fera seule dès que le réseau revient. » Un **vide et une erreur n'ont jamais le même rendu** |
| **Erreur de soumission** | Cet écran n'a aucune soumission. La seule action qu'il déclenche est `Saisir`, et son échec appartient à l'écran `saisir` | Le bandeau passe alors à `echec_envoi` : « 3 écritures n'ont pas pu partir. Elles sont encore sur cet appareil. Ouvre-les une par une. » **C'est le seul endroit où l'écran reconnaît un échec d'envoi, et il le reconnaît sans le provoquer** | Le mot `n'ont pas pu partir` est en terre cuite, et le filet de 2 px du bandeau change de teinte. Aucun toast, aucune secousse |
| **Succès** | Le réseau revient et la file locale se vide | Le bandeau bascule en `rien_a_confirmer` : « Rien à confirmer. Tout ce que tu as saisi est confirmé par le serveur. » **Il ne devient pas vert et ne se congratule pas** — un état « tout va bien » coloré est une récompense, et cet état n'a pas besoin d'attention | Aucun message bref : le bandeau est déjà le feedback, et B6 dit qu'il ne doit pas se masquer |
| **Hors-ligne / permissions** | Mode avion, sous-sol, 4G absente | Le bandeau rend `hors_ligne` : « Hors-ligne. Rien ne part pour l'instant. Tes écritures restent sur cet appareil et elles repartent seules. » **Toutes les écritures locales restent lisibles et modifiables** (B4, C9, N2). Si des échéances de marge sont dans la fenêtre, le `PanneauBlocage` rend `marge_a_voir` et **ne bloque rien** | Le bandeau **passe de 72 à 96 pt** : sa phrase est plus longue et le bandeau grandit vers le bas, il ne tronque jamais |
| **Lecture seule** | Écran reverrouillé après 15 minutes d'inactivité, ou écriture impossible pour un autre motif | Le bandeau rend `lecture_seule` : « Lecture seule. Déverrouille pour écrire. Ce que tu lis ici est confirmé. » La `BarreAction` rend son état `desactivee` : le bouton `Saisir` en variante `impossible`, avec l'aide « Déverrouille pour saisir. » **La barre ne disparaît pas** | Le bouton est visibly non pressable, et son aide dit pourquoi. Un bouton qui s'en va déplacerait l'action hors de la portée |

---

## 5. Interactions

| Élément | Événement | Comportement | Feedback visuel | État résultant | ID |
|---|---|---|---|---|---|
| Bandeau, lien `Voir` | tap | Ouvre la liste filtrée sur les écritures `non_confirme`, un groupe de plus sous celui d'aujourd'hui | Ouverture instantanée, sans fondu — un fondu entre deux listes de chiffres fait douter de celle qu'on quitte | Le groupe `CE QUI N'EST PAS ENCORE ENVOYÉ` est déroulé, le bandeau garde son état | B6 |
| PanneauBlocage, action `Traiter ces 2 décisions` | tap | Ouvre `/dossiers/:dossierId/bail` sur la première échéance non décidée, et pose le focus sur sa `LigneDonnée` en état `a_decider` | La barre d'action bascule en variante `avec_decision` : le primaire devient `Traiter les 2 décisions`, et `Saisir` **descend** en secondaire au-dessus. Le geste d'urgence reste possible | `PanneauBlocage` rendu, `LigneDonnée` en `a_decider` | B13 |
| Bandeau, appui long sur le mot d'état | appui long | Déplie le `CarteVocabulaire` en variante `rappel` sous le bandeau, 44 pt, 3 lignes, puis se replie au bout de 15 s | Apparition en `--duration-normal`, sans halo | Bandeau inchangé, rappel déplié | B2 |
| Bandeau, état `echec_envoi`, lien `Voir` | tap | Ouvre la liste filtrée, **triée par ancienneté de la tentative** et non par date de saisie — une écriture qui a échoué trois fois est plus urgente qu'une qui vient d'échouer une fois | Ouverture instantanée | Liste triée, chaque ligne portant son mot d'état et son horodatage de tentative | B1, E1 |
| `Vide`, action du panneau de blocage | tap | Aucune action : le panneau de blocage **n'a pas d'action de reprise**. Le seul geste possible est `Saisir` | Aucun | — | B13 |
| `LigneFait`, tap | tap | Ouvre `/faits/:faitId` | Aucun fondu | Navigation vers la fiche | US-1 |
| `LigneFait`, appui long | appui long | Ouvre la `Feuille` de modification, qui **suppose la classe** du fait : un fait `constate` se modifie dans un champ de constaté, un fait `apprecie` dans un champ d'appréciation, et **jamais l'inverse** (B7, E7) | La feuille s'ouvre en 200 ms | Édition du fait, dans sa classe d'origine | B7, B8 |
| `LigneFait`, tap sur une `VignettePhoto` | tap | Ouvre l'aperçu plein écran de la photo, avec son état d'envoi et ses deux horodatages | Aucune animation d'ouverture | Aperçu | B3, C8 |
| `LigneEncaissement`, tap | tap | Ouvre `/encaissement/:mois/:dossierId` | Aucun fondu | Feuille de ligne d'encaissement | US-5 |
| `LigneEncaissement`, variante `ecart`, tap | tap | Ouvre la même feuille, à la section de l'écart, qui explique les deux montants en présence et **ne propose aucun rapprochement** | Aucun | Feuille, section `Écart` | E9 |
| `LigneDemande`, tap | tap | Ouvre `/demandes/:demandeId` | Aucun fondu | Navigation vers la demande | US-7, B14 |
| `Bouton lg "Saisir"` | tap | Ouvre la `Feuille` `/saisir`, en mode `avec_classe`. Le dossier est pré-sélectionné si le propriétaire arrive d'une visite, sinon la liste des 14 baux — **jamais un champ vide à remplir** (B17) | La feuille monte en `--duration-normal` | Feuille de saisie ouverte | US-1, B8 |
| `Bouton lg "Saisir"`, état `desactivee` | tap | **Rien.** Le bouton est en variante `impossible`, son aide porte la raison | Aucun retour élastique, aucune secousse | Écran en lecture seule | C5 |
| `BarreOnglets`, segment 2 | tap | Bascule vers `/encaissement` | Instantané, sans fondu | Onglet actif, filet de 3 px ambre | — |
| Défilement vers le haut | scroll | Le bandeau **reste fixe** et ne se replie jamais. Ni lui, ni la `BarreAction`, ni la `BarreOnglets` ne défilent : la zone de pouce est constante, quelle que soit la position dans la liste | Défilement natif, avec 16 pt de respiration sous la dernière ligne | Inchangé | C4 |
| Retour arrière système | retour | Revient à l'écran précédent en **conservant la position de défilement** et tout ce qui a été saisi. Sur la racine, ne quitte pas l'application | Aucun | Inchangé | E11 |

- **Focus / clavier** : chaque `LigneFait`, `LigneEncaissement` et `LigneDemande` est un
  focusable unique avec un anneau `--color-bordure-focus` de 2 px. Le bandeau est un
  `role="status"` avec `aria-live="polite"` : il se met à jour au fil des confirmations
  **sans interrompre** la lecture en cours. Sur `--bp-tablet` et au-delà, la liste du jour
  passe à gauche et le panneau de blocage à droite, et la navigation devient un rail
  vertical de 88 pt.
- **Gestes** : **aucun geste de balayage n'est porteur d'information.** Pas de swipe pour
  supprimer, pas de swipe pour archiver, pas de pull-to-refresh : dans un sous-sol, un
  geste involontaire qui efface un fait daté coûte plus cher que le temps qu'il fait
  gagner. Le seul geste est le glissement de la `Feuille`, et il ne fait que fermer.
- **Animations** : ossatures de ligne en `--duration-slow` avec `--ease-out` à l'entrée,
  `--duration-normal` avec `--ease-default` pour le changement d'état du bandeau,
  `--duration-fast` avec `--ease-default` pour le changement d'état d'une ligne. **Aucun
  état de synchronisation n'est animé** : le bandeau ne pulse pas. `prefers-reduced-motion`
  met tout à 0 ms.
- **Retour arrière** : conserve la position de défilement et toute saisie en cours (E11).
  Le geste système Android et le bouton retour iOS ont le même effet, et tous deux sont
  interceptés sur la racine pour ne pas quitter l'application par accident dans un
  sous-sol.

---

## 6. Responsive

| Breakpoint | Comportement | Ce qui se replie / disparaît |
|---|---|---|
| **Mobile** (0–479 px) | Le layout de référence. Flux vertical aligné à gauche, marges `--space-lg`, bandeau 72 pt, barre d'action 88 pt, onglets 64 pt, 460 pt de contenu utile sur une hauteur de 640 pt | Rien ne disparaît. C'est la version pour laquelle toutes les hauteurs sont définies |
| **Tablet** (480–899 px) | Deux colonnes : colonne de gauche 320 pt pour les listes, colonne de droite fluide pour le `PanneauBlocage` et la carte de vocabulaire. La `BarreOnglets` devient un rail vertical de 88 pt à gauche. Le bandeau passe pleine largeur au-dessus des deux colonnes | Le bloc `CE QUI ATTEND` passe sous le groupe `ENCAISSEMENT` — c'est le seul réordonnancement du produit, et il est motivé : à 480 pt de large, la colonne de gauche ne peut pas porter quatre groupes |
| **Desktop** (900 px et au-delà) | **Aucun rendu distinct.** Une colonne centrée de 720 px maximum, marges automatiques, la navigation reste en bas. X11 exclut la version navigateur de bureau : la build web sert le portable, et une mise en page de bureau serait une cible de plus à maintenir pour un utilisateur qui n'existe pas | Rien. La largeur de colonne change, rien d'autre |

- **Cible tactile** : **52 pt** de haut pour tout ce qui est pressable — lignes, boutons,
  segments d'onglet, lien `Voir`. N3 impose 44 pt ; on prend 52 pt parce que le pouce est
  plus large que le bout du doigt et que l'écran est tenu d'une main, debout. Le lien
  `Voir` du bandeau a une zone tactile de 44 pt pour une hauteur visible de 20 pt.
- **Débordement** : **garanti nul** sur quatre choses, et ce sont les quatre qui portent une
  information. (1) Le bandeau **grandit** vers le bas au lieu de tronquer sa phrase : 72 pt,
  96 pt si la phrase passe sur deux lignes, 120 pt au réglage ×1,3. (2) Le compteur
  `--text-h1` ne peut pas pousser le bandeau au-delà de 120 pt : au-delà de 999, il passe
  en `--text-h3` et le nombre complet passe dans la phrase. (3) Le `intitule` d'une
  `LigneFait` est tronqué au deuxième point, jamais au milieu d'un mot, et la troncature
  porte des points de suite — un mot coupé se lit comme un mot différent. (4) Le
  `libelle` d'une `VignettePhoto` est sur **une seule ligne** tronquée, jamais sur deux.
- **Ce qui ne déborde jamais** : les montants. `--font-chasse` à chiffres tabulaires et
  largeur minimale de 72 pt, donc deux montants voisins s'alignent verticalement sans
  jamais pousser leur colonne.

---

## 7. Accessibilité

- [ ] **Contraste du texte courant** — mesuré, jamais écrit. `design-check contrast` applique
      4,5:1 à `--color-texte-principal`, `--color-texte-secondaire` et
      `--color-texte-tertiaire` contre les huit surfaces déclarées en `on:`, dont
      `--color-surface-raised` `#212630`, la plus contraignante. **Aucun ratio n'est écrit à
      côté d'une valeur dans ce document** : un ratio rédigé est un nombre fabriqué, et la
      mesure la fait le script.
- [ ] **Contraste des grands textes** — `--text-h1` du compteur est classé `text` en § 0.0
      du design system, donc mesuré à 4,5:1 contre `--color-surface-raised`, et non à
      3:1. C'est un choix : le compteur du bandeau est le seul élément en `--text-h1` du
      produit, on le lit debout de loin, et on ne lui accorde pas l'exception des grands
      caractères. **Le ratio n'est pas écrit ici** — `design-check contrast` le mesure et
      signale l'échec.
- [ ] **Navigation clavier complète** — sur mobile au clavier externe, et sur tous les
      breakpoints. Ordre : bandeau (lien `Voir`), panneau de blocage, groupes de listes dans
      l'ordre de lecture, barre d'action, onglets. `Tab` et ` Maj +Tab` franchissent les
      groupes, les flèches haut et bas parcourent les lignes d'un même groupe, `Entrée`
      active.
- [ ] **Focus visible** — anneau `--color-bordure-focus` `#E0A23A` de 2 px avec 2 px de
      `--color-background` entre l'anneau et le composant. **Jamais supprimé**, jamais
      remplacé par un changement de teinte seul : la couleur de fond d'une ligne ne change
      pas au focus, parce qu'un changement de teinte ne se voit pas au bord d'un écran
      sombre.
- [ ] **ARIA** — le bandeau est `role="status" aria-live="polite"` : il annonce
      « 2 écritures pas encore confirmées » quand le compte change, **sans jamais
      interromp** la lecture en cours. Le `PanneauBlocage` est `role="region"
      aria-label="Décisions bloquantes"`. Chaque `LigneFait` est un `article` avec un
      `aria-label` composé : « Fait du 12 septembre, constaté, pas encore envoyé ». Chaque
      `LigneDemande` porte `aria-label` commençant par « Attend ta décision » ou « Attend
      le locataire », **parce que `qui doit agir` est la première information de la ligne
      et doit donc être la première dans le nom accessible**.
- [ ] **Alternative textuelle** — une `VignettePhoto` porte un `alt` **décrivant l'état et
      non l'image** : « Photo du 12 septembre, sur cet appareil, pas encore envoyée ». Un
      `alt` de description visuelle n'apporterait rien à un utilisateur de lecteur d'écran ;
      ce qui compte ici, c'est où en est le fichier. La `VignettePhoto` en état `illisible`
      porte un `alt` explicite et **reste comptée**, donc un fichier non lisible n'est
      jamais un fichier absent pour un utilisateur de technologies d'assistance.
- [ ] **Langue et direction de lecture** — `lang="fr-FR"`, sens de lecture gauche à droite,
      une seule langue et une seule monnaie (C10). Les nombres sont en chiffres arabes avec
      une virgule décimale ; les dates sont en `JJ/MM/AAAA`, **jamais** en `JJ/MM` seul, parce
      qu'un `04/05` se lit le 4 mai à Lyon et le 5 avril ailleurs.

---

## 8. Données

| Champ | Type | Origine | Requis | Erreur possible |
|---|---|---|---|---|
| `ecritures_non_confirmees` | liste d'identifiants et de types | cache local, lues avant tout appel réseau | oui | La liste locale est illisible : l'écran rend alors `Vide` variante `erreur`, jamais une liste vide |
| `phrase_etat` | chaîne, **jamais calculée à l'écran** | dérivée de l'union `EtatEcriture` | oui | — |
| `faits_du_jour` | liste de faits | cache local | oui | Liste vide : `Vide` variante `aucune_donnee`. Distinguée de l'erreur par le rendu, jamais par la donnée |
| `classe_fait` | énumération `constate` / `apprecie` | base locale | oui | Une classe manquante sur un fait antérieur : la ligne rend une `Invite` en variante `permanente`, « Choisis la classe avant d'enregistrer. » — **et le fait n'est pas exportable tant qu'elle manque** (B7, E7) |
| `photos` | liste de pièces jointes | base locale, écriture d'abord locale (B3) | non | Un fichier illisible : `VignettePhoto` en état `illisible`, compté et envoyé quand même |
| `lignes_encaissement` | trois groupes, ordre figé | cache local | oui | Le mois n'est pas échu : le groupe `En retard` **n'est pas rendu**, et l'ordre reste `Payé` · `Pas encore payé` · `Payé en retard` |
| `demandes` | liste, `qui_doit_agir` obligatoire | cache local | oui | `qui_doit_agir` absent : la ligne n'est pas rendue, et le groupe affiche son compte exact. Une ligne sans « qui doit agir » est exactement la ligne que B14 interdit de laisser dans la liste |
| `echeances_bloquantes` | liste d'échéances dérivées | dérivées du bail, jamais saisies ici (B12) | non | Le bail n'est pas encore saisi : le `PanneauBlocage` n'est pas rendu, et rien n'affiche d'échéance — **pas de date inventée** |
| `hors_ligne` | booléen | état de la connectivité | oui | Une panne réseau est traitée comme hors-ligne : la consequence est identique, donc le traitement aussi |
| `lecture_seule` | booléen | verrouillage de session, 15 min d'inactivité | oui | — |

- **Chargement** : tout le contenu en une seule lecture, **en trois blocs** — faits du
  jour, encaissement du mois, demandes. Aucune pagination : 14 baux, une journée de faits,
  un mois d'encaissement. Au-delà de 30 faits dans la journée, la liste défile sans
  pagination, parce que 30 faits tiennent encore en trois défilements et qu'une pagination
  ferait perdre la position.
- **Cache / hors-ligne** : **le catalogue et les listes s'affichent sans réseau** si les
  écritures locales existent (N2, C9). Le bandeau affiche alors le compte local, et
  chaque ligne porte son mot d'état. La date de la dernière synchronisation est lisible
  d'un appui long sur le bandeau — elle n'est pas dans le bandeau, parce que le bandeau
  parle de l'état et pas de l'historique.
- **Données sensibles** : ce dossier affiche des **données personnelles** (nom du
  locataire, montants, photos de dommages). Rien n'est journalisé, rien n'est envoyé à un
  tiers (N8), et **aucun appreciation n'apparaît jamais dans une zone d'export ni dans une
  notification** — la liste du jour affiche le texte d'une appréciation avec son préfixe
  écrit, mais l'apprentissage du composant de liste ne reçoit jamais la classe, donc il ne
  peut pas l'apprendre par association (B7, E7). Le compte du bandeau ne contient qu'un
  **nombre**, jamais un nom : un compteur de synchronisation qui nomme un locataire
  afficherait le nom du locataire sur un écran de verrouillage.

---

## 9. Traçabilité

| ID | Origine | Manifestation sur cet écran |
|---|---|---|
| **B1** | PRD | Le bandeau ne dit jamais « enregistré ». Les seuls mots qu'il emploie sont `rien_a_confirmer`, `a_envoyer`, `hors_ligne`, `echec_envoi` — et chacun porte une phrase qui dit où se trouve l'écriture |
| **B2** | PRD | Le bandeau rend `a_envoyer` avec la phrase « 2 écritures **pas encore confirmées** », qui contient littéralement le mot du téléphone. C'est la seule place du produit où le mot de l'écran et le mot de la conversation sont le même mot |
| **B3** | PRD | Le bandeau ne compte que des écritures **locales**. Une photo est donc comptée dès la prise, avant tout envoi, et `VignettePhoto` porte l'état `a_confirmer` par défaut |
| **B4** | PRD | Hors-ligne, toutes les `LigneFait` restent **lisibles et pressables** : aucune n'est grisée, aucune n'affiche de verrou. La correction passe par l'appui long, qui conserve la classe d'origine |
| **B6** | PRD | Le bandeau est permanent, ne se replie pas, ne disparaît pas au défilement, et **ne se masque pas quand tout est à jour** : l'état `rien_a_confirmer` est rendu en gris, pas en vert, et il occupe la même hauteur |
| **B12** | PRD | Le `PanneauBlocage` n'affiche que des échéances **dérivées d'un bail existant**. Aucun rappel n'est saisi, aucune date n'est inventée, et si aucun bail n'existe le panneau n'est pas rendu |
| **B13** | PRD | Le `DrapeauÉchéance` est un **filet de 3 px**, jamais un aplat rouge plein. Une échéance manquée remonte **une fois** : la ligne porte la mention « remontée une fois, le 7 janvier », et elle cesse d'être rouge au moment où elle est traitée |
| **B15** | PRD | Hors-ligne, le bandeau dit que rien ne part **et** que les écritures repartiront seules. Il ne propose aucun bouton d'envoi manuel : la reprise est automatique et un bouton dirait qu'elle ne l'est pas |
| **B16** | PRD | Les montants affichés sont **saisis**, jamais calculés. Le total du mois n'apparaît nulle part sur cet écran : c'est un agrégat, et un agrégat est une chose qu'on consulte au lieu d'appeler |
| **B18** | PRD | Aucun geste d'effacement sur cet écran, dans aucune variante. Le panneau de blocage n'a pas d'action de reprise, parce qu'il n'y a rien à reprendre |
| **C2** | PRD | L'affichage est local d'abord : le bandeau et les trois groupes se rendent à partir du cache local, avant tout appel réseau. Le réseau ne fait que confirmer |
| **C4** | PRD | `BarreAction` de 88 pt et `BarreOnglets` de 64 pt, toutes deux **permanentes**, avec `--space-3xl` de respiration au-dessus de la barre. Rien de vital n'est dans un coin haut |
| **C5** | PRD | Aucun mot de passe n'est demandé sur cet écran. L'état `lecture_seule` renvoie à l'écran de déverrouillage par un bouton, et non par une saisie |
| **C8** | PRD | Une `VignettePhoto` porte son état d'envoi et **les deux horodatages distingués** : celui de la prise, celui de la confirmation. Aucun envoi n'est annoncé sans confirmation |
| **C9** | PRD | Le bandeau rend `hors_ligne` et le dit. L'application fonctionne hors ligne pour tout ce qui n'exige pas de preuve d'envoi, et le signale quand ce n'est pas le cas |
| **N1** | PRD | Le bandeau est alimenté par l'état local, pas par un aller-retour serveur : sa mise à jour est locale et instantanée, et il passe à `rien_a_confirmer` **après** confirmation, jamais avant |
| **N2** | PRD | Le catalogue et les listes s'affichent sans réseau dès que les écritures locales existent |
| **N3** | PRD | 52 pt de cible tactile sur **tout** ce qui est pressable, y compris les segments d'onglet et le lien `Voir` |
| **N4** | PRD | Aucun texte sous 14 px, corps à 17 px, et toutes les classes déclarées en § 0.0 du design system avec des `on:` explicites |
| **N5** | PRD | Toutes les tailles sont en `rem` et suivent le réglage du téléphone, **plafonné à ×1,3** — le plafond qui préserve C4, et qui n'oblige que le bandeau à tenir sur trois lignes |
| **E1** | PRD | Le bandeau rend `a_envoyer` ou `hors_ligne` avec la phrase qui promet la reprise seule. **Aucun bouton « Réessayer »** : il n'y a rien à relancer à la main, et l'appuyer laisserait croire que l'automatique peut échouer |
| **E2** | PRD | Aucune donnée de cet écran ne prétend être conservée ailleurs. Le seul stockage durable est celui du serveur, et le bandeau est le seul élément qui le dit |
| **E4** | PRD | Le propriétaire signe ou saisit hors réseau, sort du sous-sol, et l'écran lui dit ce qui va se passer : « elles repartent seules ». Le geste est **complet** au moment où il est fait |
| **E11** | PRD | Le retour arrière conserve la position de défilement et toute saisie en cours. Les fait saisis restent dans le groupe du jour, jamais dans un brouillon caché |
| **E12** | PRD | Si le stockage est plein, le bandeau n'est pas concerné, mais l'état `echec_envoi` et le `MessageBref` de la feuille de saisie portent la phrase d'impossibilité. Aucune pièce jointe n'est comptée comme envoyée si son fichier n'a pas pu être écrit |

---

## 10. Checklist de gate

- [x] Les 9 états sont décrits avec un rendu concret, et chacun a un **libellé écrit** —
      aucun n'est « — » et aucun n'est vide.
- [x] Un état vide n'est jamais un zéro, et **aucun ne propose « Réessayer »** : la reprise
      est automatique, donc un bouton de reprise serait un aveu.
- [x] Un vide et une erreur ont **deux rendus distincts**, et c'est écrit dans les deux
      lignes du tableau.
- [x] Chaque élément interactif a un comportement, un feedback visuel et un état résultant.
- [x] Le responsive est défini à **chaque** breakpoint du design system, y compris le
      desktop — où la réponse est explicitement « aucun rendu distinct », parce que X11
      exclut la version navigateur de bureau.
- [x] La section Anti-générique est cochée et **justifiée**, point par point, avec les
      valeurs réelles de l'écran.
- [x] Aucune valeur de design n'est laissée à « à définir ».
- [x] **Aucun ratio de contraste n'est écrit à côté d'une valeur.** Le § 7 renvoie à
      `design-check contrast`, qui mesure.
- [x] Chaque ID `B*`, `E*`, `C*` et `N*` de l'écran apparaît en § 9, et **où** c'est visible
      à l'écran.
- [x] `node "$FORGE/scripts/forge-guard.js" placeholders <anchor>` ne signale rien ici.
- [x] L'écran reste cohérent avec `.forge/design/design-system.md` : aucune valeur, aucun
      composant et aucun mot d'état n'est inventé hors du design system.
