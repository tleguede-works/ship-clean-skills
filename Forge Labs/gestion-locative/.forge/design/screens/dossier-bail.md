---
type: screen
slug: dossier-bail
title: Dossier du bail
module: dossiers
status: draft
generated_at: 2026-09-30
derived_from:
  - .forge/prd.md
  - .forge/design/design-system.md
rule_ids: [B5, B9, B12, B13, B16, B17, B18, C1, C6, C9, N1, N3, N4, N5]
edge_case_ids: [E3, E5, E10, E12]
flow: cycle-de-vie-du-bail
---

# Écran — Dossier du bail

> Ce document est la **source de vérité** pour qu'une IA génère l'interface de cet écran.
> Il est généré depuis le gabarit, jamais recopié. Aucun `{{PLACEHOLDER}}` ne doit subsister.

---

## 1. Rôle de l'écran

| | |
|---|---|
| **Archétype d'app** | `mobile_field_ops` (principal), `rental_tenancy` (secondaire) |
| **Module** | `dossiers` — rang 4 dans la navigation, sous-écran de `dossiers` |
| **Route** | `/dossiers/:dossierId/bail` — création : `/dossiers/nouveau/bail` |
| **Type** | page en lecture, **feuille** en création |
| **Utilisateurs** | Le propriétaire, seul utilisateur (C3) |
| **User stories servies** | US-4 |
| **Règles métier** | B5, B9, B12, B13, B16, B17, B18, C1, C6, C9, N1, N3, N4, N5 |
| **Edge cases** | E3, E5, E10, E12 |

**Une phrase** : cet écran permet au propriétaire de **saisir trois dates une seule fois** et
de voir, immédiatement en dessous, **les cinq échéances que ces trois dates produisent** —
avec le calcul qui les a produites.

**Pourquoi il est au rang 4 de la navigation** : parce que la source des cinq échéances est
le bail (B12). C'est l'entrée de cycle de vie du module, donc elle se trouve après les
actions récurrentes et avant la configuration, et son module est en rang 4 parce que sa
fréquence chute une fois les 14 baux créés.

**La décision de conception de cet écran** : les cinq échéances sont affichées **avec leur
dérivation** — « terme 31/03/2029 − 3 mois → 31/12/2028 ». C'est ce qui rend R5 visible :
si une échéance est fausse, le propriétaire voit tout de suite que c'est la date source qui
l'est, et il ne peut corriger que celle-là. Sans la dérivation affichée, un bail mal saisi
produirait cinq échéances fausses que personne n'a jamais corrigées — exactement le reproche
du commanditaire.

---

## 2. Direction visuelle de cet écran

| | |
|---|---|
| **Mood** | opérationnelle, parlante, sans alarme |
| **Densité** | **normale** — c'est le seul écran du produit où la densité serait une faute. Une fiche se lit ligne par ligne, et les cinq échéances doivent se lire **une par une**, pas en balayant. Les lignes font 44 pt, et 64 pt quand elles portent une dérivation |
| **Niveau de contraste** | **fort** — une date fausse est un contentieux, et elle doit se lire du premier coup d'œil |
| **Traitement photographique** | **thumbnail** uniquement : si un bail signé a été joint, sa première page est une `VignettePhoto` de 72 × 72 pt avec son état d'envoi. **Elle n'est pas obligatoire** : Q5 du PRD demande au commanditaire si le bail a des annexes, donc le champ est `Impossible` tant que la réponse n'est pas donnée, avec la phrase de refus |
| **Référence** | la page « Bail » d'un logiciel de gestion locative classique, **dépouillée de tout ce qui aurait pu être calculé** : pas de révision, pas de charges, pas d'indexation, pas de quittance |

**Les valeurs portées par cet écran**

| Rôle | Token | Valeur |
|---|---|---|
| Fond de l'application | `--color-background` | `#101319` |
| Surface des lignes de fiche | `--color-surface` | `#171B22` |
| Champ de saisie, valeur dérivée | `--color-surface-sunken` | `#0A0C10` |
| Barre d'action | `--color-surface-raised` | `#212630` |
| Encre de lecture | `--color-texte-principal` | `#E8ECF3` |
| Encre secondaire | `--color-texte-secondaire` | `#A6B0C0` |
| Encre tertiaire, valeur dérivée inconnue | `--color-texte-tertiaire` | `#8B95A5` |
| Cyan-gris — « à venir » | `--color-info-600` | `#74A9BC` |
| Terre cuite — « manquée » | `--color-alerte-600` | `#F09286` |
| Sauge — « faite » | `--color-confirme-600` | `#7FB08C` |
| Filet de séparation | `--color-filet` | `#2A303A` |

| | |
|---|---|
| **Surface** | `--color-surface` `#171B22` sur `--color-background` `#101319` |
| **Accent utilisé** | `--color-primaire-600` `#E0A23A` — **uniquement** sur les trois champs `source`, c'est-à-dire les trois seules dates que Bailly demande. Le reste de l'écran est en gris, en cyan-gris ou en terre cuite : la couleur d'accent est rare ici, donc elle dit « c'est ici qu'on écrit » |

### 2.1 Anti-générique — obligatoire

- [x] **Pas de fond blanc pur `#FFFFFF`.** Fond `#101319`, choisi et justifié.
- [x] **Pas de carte ombrée pour tout.** La fiche est **une suite de lignes séparées par un
      filet**, pas un empilement de cartes. Les cinq échéances sont un seul bloc, pas cinq
      cartes — un bloc de cinq cartes est la manière dont un logiciel générique rend une
      liste de dates.
- [x] **Pas d'uniformité.** Le bloc des cinq échéances est en `LigneDonnée` variante
      `derivee`, à 64 pt et trois lignes, là où le bloc d'identité est en 44 pt et deux
      lignes. La hauteur **cadre** la différence entre « ce que j'ai écrit » et « ce que
      Bailly en a déduit ».
- [x] **Pas de gris neutre générique.** Le champ `source` est en `--color-primaire-600` à
      son étiquette, le champ `derivee` en `--color-texte-tertiaire` : la couleur
      **separe ce qu'on écrit de ce qui est calculé**, et pas seulement leur valeur.
- [x] **Pas de mise en page centrée symétrique.** Fiche alignée à gauche, pleine largeur,
      marges `--space-lg`. Le bloc des échéances est aligné sur la même grille que le
      reste, donc l'œil descend sans saut.
- [x] **Pas d'illustration d'appoint générique.** Aucun glyphe décoratif dans un cercle. Le
      seul glyphe est celui de la `VignettePhoto` du bail joint, et il dit où en est le
      fichier.
- [x] **Pas d'une seule famille de police.** `--font-chasse` pour les trois dates saisies,
      les cinq dates dérivées et les deux montants, alignés en colonne.

**Choix assumé et non neutre** : **le champ d'une échéance dérivée n'est pas modifiable, et
son calcul est écrit sous la valeur.** Une application qui affiche « échéance : 31/12/2028 »
sans dire d'où elle sort donne au propriétaire une date qu'il ne peut pas contester. Celle-ci
lui donne une date **et** son origine, donc il peut contester l'origine — qui est la seule
chose contestable. C'est aussi le seul endroit du produit où un champ est affichable et non
saisissable, et c'est marqué par un **filet fin** et non par une couleur, parce qu'une
couleur se perd à la tombée du jour et un contour non.

---

## 3. Anatomie

```
TitreÉcran  variante `feuille`
├─ [retour] Bouton 44 pt, "‹"                    → /dossiers
├─ [titre] "Courges, 3e"
└─ [etat_ecriture] mot d'état ambre, si écriture locale non confirmée
        │
        ▼  --space-lg
ListePlate  variante `groupee`
├─ [sur_titre] "CE QUE TU SAISIS"            --text-overline
├─ LigneDonnée × 3    (44 pt)
│   ├─ ChampDate variante `source`           --color-primaire-600 à l'étiquette
│   │    "Prise du bail"  →  01/09/2024
│   ├─ ChampDate variante `source`           --color-primaire-600 à l'étiquette
│   │    "Terme"          →  31/03/2029
│   └─ ChampMontant variante `somme_due`     "Loyer" → 214,00 €
├─ [sur_titre] "CE QUE LE BAIL PRODUIT"      --text-overline
├─ LigneDonnée variante `derivee` × 5        (64 pt, trois lignes)
│   ├─ [intitule]   "Opposition à reconduction tacite"
│   ├─ [valeur]     "31/12/2028"             --font-chasse
│   ├─ [derivation] "terme 31/03/2029 − 3 mois"
│   └─ [action]     Bouton secondaire "Décider"   quand famille = bloquante
├─ ChampDate variante `saisie_directe`        (Q2 du PRD : durée de conservation)
│    "Fin de conservation" →  — date de fin à confirmer —
└─ [sur_titre] "PIÈCES DU BAIL"
├─ VignettePhoto × n                        état d'envoi écrit
├─ Bouton secondaire "Joindre le bail signé"  — en variante `impossible` tant que Q5 du PRD
└─ LigneDonnée × 3
     ├─ "Dépôt de garantie reçu"   →  430,00 €
     ├─ "Avance"                    →  0,00 €        --font-chasse
     └─ "Solde courant"             →  0,00 €        --font-chasse
        │
        ▼  --space-3xl
BarreAction  variante `principale`
├─ [action_principale] Bouton lg "Enregistrer"
└─ [hauteur_respiratoire] --space-3xl
```

| # | Composant | Rôle | Source |
|---|---|---|---|
| 1 | `TitreÉcran` | Nommer le dossier, avec le mot d'état d'écriture | design-system § 3.18 |
| 2 | `ListePlate` | Contenir les blocs sans carte | design-system § 3.23 |
| 3 | `LigneDonnée` | Rendre une paire intitulé → valeur, et **la dérivation** d'une valeur dérivée | design-system § 3.22 |
| 4 | `ChampDate` | Saisir les trois dates sources ; afficher les dérivées **avec leur calcul** | design-system § 3.12 |
| 5 | `ChampMontant` | Saisir le loyer, sans le calculer (B16) | design-system § 3.11 |
| 6 | `Montant` | Afficher les trois soldes, jamais compensés entre eux | design-system § 3.20 |
| 7 | `VignettePhoto` | Montrer le bail joint et dire où en est le fichier | design-system § 3.27 |
| 8 | `Bouton` | Porter `Décider` et `Enregistrer` | design-system § 3.8 |
| 9 | `BandeauAlerte` | Dire qu'une date de conservation n'est pas connue (Q2 du PRD) | design-system § 3.24 |
| 10 | `Invite` | Porter la consigne permanente sur la classe d'un fait créé ici | design-system § 3.30 |
| 11 | `BarreAction` | Porter `Enregistrer` dans la portée du pouce | design-system § 3.16 |
| 12 | `Signature` | Rendre l'état d'une signature d'état des lieux — **composant non branché sur cet écran** (voir § 5) | design-system § 3.28 |

---

## 4. États — tous, sans exception

| État | Déclencheur | Rendu | Feedback utilisateur |
|---|---|---|---|
| **Chargement** | Ouverture du dossier, lecture du bail local et dérivation des cinq échéances | 11 `LigneDonnée` en ossature aux hauteurs exactes — **44 pt** pour les lignes d'identité, **64 pt** pour les échéances. Le bloc des cinq échéances a un `sur_titre` `CE QUE LE BAIL PRODUIT` affiché pendant le chargement, **parce qu'un bloc vide qui se remplit de cinq dates fait sauter la fiche** | Aucun texte d'attente. Les cinq lignes d'échéance sont réservées en advance |
| **Rempli** | Le bail existe et les cinq échéances sont dérivées | Les deux blocs rendus intégralement, chaque échéance avec sa dérivation écrite, et le bouton `Décider` sur les trois échéances bloquantes | Aucun. La fiche **est** le feedback |
| **Vide — jamais visité** | `/dossiers/nouveau/bail`, aucun bail saisi | Les trois champs `source` vides, leurs étiquettes en `--color-primaire-600`, et **le bloc `CE QUE LE BAIL PRODUIT` déjà présent avec cinq lignes de dérivation en tirets** : « terme — − 3 mois → — ». **Le propriétaire voit ce qui va sortir de ses trois dates avant de les saisir.** C'est le meilleur état vide du produit, parce qu'il annonce le résultat avant la saisie | Aucune illustration, aucune complication. L'aide du champ terme porte la phrase : « Trois mois avant le terme, c'est la date limite pour s'opposer à la reconduction tacite. » |
| **Vide — aucune donnée** | Le bail existe mais le terme n'a pas été renseigné | Le bloc identité est rendu, et le bloc `CE QUE LE BAIL PRODUIT` rend **cinq lignes avec un tiret en valeur** et la phrase : « Ces cinq échéances sortent du terme. Sans terme, il n'y a rien à dériver — et Bailly n'invente pas une date. » Les lignes existent, elles sont vides, et **leur vide est expliqué** | Aucun bouton d'écran vide. L'action est `Enregistrer` dans la barre d'action, qui reste présente |
| **Erreur de chargement** | Le bail local est illisible, ou le serveur est injoignable et rien n'est en cache | `Vide` variante `erreur` + `BandeauAlerte` en variante `impossible` : « Impossible de lire ce bail. Rien n'est affiché — et ce n'est pas vide : on ne sait pas encore. » | **Aucun bouton « Réessayer »** : la reprise est automatique. Le seul geste offert est un `BandeauAlerte` en variante `information` — « La lecture se fera seule dès que le réseau revient. » Un bail à moitié affiché serait pire qu'un bail absent : il laisserait croire que les échéances sont justes |
| **Erreur de soumission** | Le terme est antérieur à la prise du bail, ou un des deux est vide | Erreur **au champ**, sous le champ fautif, en `--color-alerte-600` : « Le terme ne peut pas précéder la prise du bail. » Le champ fautif passe en contour 2 px `--color-alerte-600` et **le focus y revient**. Les cinq échéances **se recalculent en direct** et suivent le champ : une échéance fausse affichée en permanence pendant la correction serait une échéance fausse que le propriétaire peut ne pas voir bouger | Aucun toast, aucune secousse, aucun blocage modal |
| **Succès** | Le bail est enregistré, et ses cinq échéances sont dérivées | `MessageBref` variante `info` : « Bail enregistré sur cet appareil. Cinq échéances en sont tirées — 1 est à décider avant le 31 décembre. » Il dit « sur cet appareil » et non « enregistré », parce que **c'est la vérité** : le serveur ne l'a pas encore confirmé. Le mot de synchronisation ne vient qu'après | Le bandeau, s'il est présent, bascule quand le serveur confirme. **Le message bref ne dit jamais l'état de synchronisation seul** |
| **Hors-ligne / permissions** | Mode avion, sous-sol, 4G absente | Le bail et ses cinq échéances s'affichent **entièrement** depuis l'appareil, les dérivations comprises. **Toutes les trois dates sources restent modifiables** : corriger un bail hors-ligne est une écriture locale, protégée par B1 comme les autres. Le bouton `Décider` reste actif : décider d'une opposition à reconduction est un geste hors ligne par nature | Le bandeau rend `hors_ligne` s'il est présent. Une `BandeauAlerte` en variante `information` apparaît sous les cinq échéances : « La décision que tu prends ici est datée sur cet appareil. Elle sera transmise avec le reste. » |
| **Lecture seule** | Écran reverrouillé, ou bail confirmé et modification interdite par le propriétaire lui-même | Les trois champs `source` passent en variante `lecture` : contour `--color-filet`, valeur en `--color-texte-secondary`. Les cinq échéances restent rendues. **Le bouton `Décider` disparaît** — c'est la seule action de l'écran qui disparaît, parce que décider est un geste, pas une lecture | La `BarreAction` rend `desactivee`, bouton `Enregistrer` en variante `impossible` avec l'aide « Ce bail est en lecture seule. Déverrouille pour le modifier. » **La barre ne disparaît pas** |

---

## 5. Interactions

| Élément | Événement | Comportement | Feedback visuel | État résultant | ID |
|---|---|---|---|---|---|
| `ChampDate` source « Prise du bail » | saisie | Met à jour la base de toutes les dérivations. **Les cinq lignes se recalculent pendant la frappe**, pas à la validation | Aucune animation : les valeurs changent en place | Les cinq échéances suivent immédiatement | B12 |
| `ChampDate` source « Terme » | saisie | Idem. Le terme est la seule date qui pilote les échéances 1, 2 et 3 | Aucune animation | Échéances recalculées | B12 |
| `ChampDate` dérivée, n'importe laquelle | tap | **Aucune action.** Le champ n'est pas saisissable, il n'a pas de focus, il n'a pas de curseur. Un appui long ouvre la `Feuille` de la dérivation, qui montre la règle en toutes lettres et le champ source qu'elle lit | La feuille monte en 200 ms | Feuille de règle | B12 |
| `LigneDonnée` échéance, bouton `Décider` | tap | Ouvre la `Feuille` de décision : deux choix, **écrit avec leur conséquence**, et rien d'autre. Aucun champ libre, aucune date à saisir — la décision est **booléenne**, et une échéance manquée qui remonte une fois ne peut pas être reportée en boucle | La feuille monte en 200 ms | Décision prise, échéance figée | B13 |
| `Feuille` de décision, hors-ligne | ouverture | Le choix reste possible et reste local. **Aucune boîte de dialogue n'est demandée** : « Cette décision sera transmise dès que le réseau revient. » est une information, pas une confirmation | — | Décision locale, mot d'état ambre | E4 |
| `ChampMontant` « Loyer » | saisie | Accepte un montant ; **refuse** toute valeur qui n'est pas un loyer ou des provisions, avec la phrase de refus de § 2.0.3 du design system appliquée au cas (roadmap § 2.2 : « le produit refusera de la saisir, ce qui est la bonne failure ») | Le champ revient vide, l'aide porte la phrase de refus | Champ `refuse` | B16 |
| `ChampDate` « Fin de conservation » | tap | Champ en variante `saisie_directe`. **Il est vide et le reste** tant que Q2 du PRD n'est pas tranchée, avec la phrase : « Tant que cette date n'est pas écrite, Bailly ne peut pas dire quand ce document pourra être effacé. » Un bail saisi reste conservé, et l'écran **le dit** | Valeur en `--color-texte-tertiaire` | `ChampDate` état `inconnu` | B9 |
| `Bouton secondaire "Joindre le bail signé"` | tap | Champ en variante `impossible` tant que Q5 du PRD n'est pas tranchée : « Je ne sais pas encore si ton bail a des annexes à joindre. Tant que tu ne me le dis pas, ce champ reste fermé — et il n'est pas obligatoire. » **Aucun champ photo n'est ouvert sur un champ obligatoire** | Bouton non pressable, aide affichée | Champ fermé | US-4, Q5 du PRD |
| `Bouton lg "Enregistrer"` | tap | Écrit le bail localement **d'abord**, dérive les cinq échéances, puis envoie. Le message bref dit « enregistré sur cet appareil », jamais « enregistré » | `MessageBref` 4 s | Bail local, mot d state's `a_envoyer` | B1, C2 |
| Appui long sur la valeur d'une échéance | appui long | Ouvre la `Feuille` de règle, avec la règle en clair et le champ source qu'elle lit. **Aucun moyen de modifier l'échéance elle-même** — c'est la seule façon de garantir que B12 ne peut pas être contourné | La feuille monte en 200 ms | Feuille de règle | B12 |
| Appui long sur le bloc `CE QUE LE BAIL PRODUIT` | appui long | Aucune action. Ce bloc n'est pas une cible : il est informatif, et une cible sans action est un piège | Aucun | — | — |
| `Signature`, si un jour une slice la réclame | tap | **Ce composant n'est rendu sur aucun écran du MVP.** Aucune des huit slices de la roadmap ne porte la signature : `piece-jointe` porte la photo, `saisie` porte le fait. Le composant est spécifié au design system § 3.28 parce que **B5 doit avoir une manifestation visuelle**, et le jour où une slice le réclame il est déjà écrit | — | — | B5, E3 |
| Retour arrière | retour | Conserve toute saisie en cours. Si le bail a été modifié sans `Enregistrer`, les modifications **sont conservées localement** et le mot d'état `a_envoyer` apparaît au retour : perdure de saisie ne doit jamais coûter un fait | Aucun | Saisie conservée | E11 |

- **Focus / clavier** : les trois champs `source` sont les seuls focusables de l'écran —
  les cinq champs `derivee` ne prennent pas le focus, parce qu'un champ qu'on ne peut pas
  modifier ne doit pas s'annoncer comme modifiable. `Tab` parcourt identité → échéances →
  pièce jointe → barre d'action. `Origine` va au terme, la date qui pilote le plus de
  dérivations.
- **Gestes** : **aucun geste porteur.** Pas de swipe pour changer la date, pas de swipe pour
  décaler d'un mois : une date que l'on change au doigt pendant qu'on marche est une date
  fausse, et une date fausse saisie dans un couloir est une reconduction tacite perdue. Le seul geste est le
  glissement de `Feuille`, qui ne fait que fermer.
- **Animations** : **le recalcul des cinq échéances n'est pas animé.** Les valeurs changent
  en place, sans transition, sans comptage. Une valeur qui défile est une valeur qu'on
  n'arrive pas à lire pendant qu'elle bouge, et une date lue de travers est une date fausse.
  Les autres transitions sont en `--duration-fast` et `--duration-normal` avec
  `--ease-default`. `prefers-reduced-motion` met tout à 0 ms.
- **Retour arrière** : conserve toute saisie, et **la rend visible** par un mot d'état.

---

## 6. Responsive

| Breakpoint | Comportement | Ce qui se replie / disparaît |
|---|---|---|
| **Mobile** (0–479 px) | Le layout de référence. Fiche alignée à gauche, lignes de 44 et 64 pt, marges `--space-lg` | Rien |
| **Tablet** (480–899 px) | Deux colonnes : identité et échéances à gauche sur 400 pt, pièces du bail et soldes à droite. La navigation devient un rail vertical de 88 pt | Le bloc des trois soldes passe à droite : ce sont les lignes les moins fréquentes, donc celles que l'œil cherche le moins souvent |
| **Desktop** (900 px et au-delà) | **Aucun rendu distinct.** Colonne centrée de 720 px maximum, navigation en bas. X11 exclut la version navigateur de bureau | Rien |

- **Cible tactile** : 52 pt sur les trois champs source, sur `Enregistrer` et sur `Décider`.
  Le champ `derivee` a une zone tactile de 44 pt pour un appui long qui ouvre la règle —
  **il ne réagit pas au tap**, et sa zone n'est donc pas une cible de tap, c'est une cible
  d'appui long, ce qui est écrit dans son étiquette d'accessibilité.
- **Débordement** : (1) La ligne de dérivation « terme 31/03/2029 − 3 mois » est sur une
      ligne de 14 px et **ne se coupe jamais** : à 320 px de large elle tient en 240 px, et
      au-delà elle passe sur une deuxième ligne en augmentant la hauteur de la ligne de
      64 pt à 84 pt, jamais en tronquant. (2) Le titre « Opposition à reconduction tacite »
      est sur **deux lignes** par construction, il ne se coupe pas au milieu d'un mot. (3) La
      valeur d'un champ `derivee` est alignée à gauche, jamais à droite : une date se lit de
      gauche à droite.
- **Ce qui ne déborde jamais** : les trois soldes. Dépôt, avance et courant sont sur trois
      `LigneDonnée` séparées, jamais sur une seule ligne combinée, et **aucun n'est
      compensé avec un autre** : c'est la pathologie `rental_tenancy` la plus coûteuse, et
      la seule façon de l'éviter est de ne pas mettre les trois dans le même champ.

---

## 7. Accessibilité

- [ ] **Contraste du texte courant** — mesuré par `design-check contrast`, qui applique
      4,5:1 à chaque encre déclarée `text` contre les huit surfaces de son `on:`. Les
      surfaces les plus contraignantes de cet écran sont `--color-surface-sunken` (les
      champs) et `--color-surface-raised` (la barre d'action). **Aucun ratio n'est écrit
      ici.**
- [ ] **Contraste des grands textes** — il n'y en a pas sur cet écran : le titre est classé
      `text` et mesuré à 4,5:1 comme le reste.
- [ ] **Navigation clavier complète** — sur clavier externe et sur tous les breakpoints.
      Seuls les trois champs `source` sont focusables ; les cinq échéances sont annoncées en
      lecture seule par le lecteur d'écran, **et ne sont pas dans l'ordre de tabulation**,
      parce qu'un champ non modifiable ne doit pas s'annoncer comme modifiable.
- [ ] **Focus visible** — anneau `--color-bordure-focus` de 2 px avec 2 px de fond entre
      l'anneau et le champ. Le focus ne passe **jamais** à un champ `derivee`.
- [ ] **ARIA** — chaque `LigneDonnée` est un groupe `role="group"` dont le `aria-label`
      est composé : « Terme, 31 mars 2029, modifiable ». Pour une échéance dérivée :
      « Opposition à reconduction tacite, 31 décembre 2028, valeur dérivée du terme du 31
      mars 2029, non modifiable ». Le mot **« dérivée » et l'origine** sont dans le nom
      accessible, pas seulement dans la ligne visible. Les cinq échéances sont dans une
      `role="list"` avec un `aria-label` « Échéances dérivées du bail ».
- [ ] **Alternative textuelle** — la `VignettePhoto` du bail joint porte un `alt`
      décrivant **l'état et non l'image** : « Page 1 du bail, sur cet appareil, pas encore
      envoyée ». L'aperçu du document n'est pas une image décorative, donc il a une
      alternative, et elle dit la même chose que la ligne de liste.
- [ ] **Langue et direction de lecture** — `lang="fr-FR"`, gauche à droite, dates
      `JJ/MM/AAAA`, montants en euros avec la virgule décimale. Le signe `−` de la
      dérivation est un vrai signe moins typographique et non un tiret : la différence se
      voit à 14 px, et c'est exactement là qu'on regarde une dérivation.

---

## 8. Données

| Champ | Type | Origine | Requis | Erreur possible |
|---|---|---|---|---|
| `prise_bail` | date `JJ/MM/AAAA` | saisie, **une seule fois** | oui | Antérieure au terme : refusée au champ |
| `terme` | date `JJ/MM/AAAA` | saisie, **une seule fois** | oui | Antérieur à la prise du bail : refusée au champ. Vide : **aucune échéance n'est dérivée et aucune date n'est affichée** |
| `duree` | énumération `3 ans` / `6 ans` | saisie | oui | Le terme court n'exige pas la reconduction tacite : la ligne d'échéance 1 rend « Sans objet — ce bail ne se reconduit pas tacitement. » **Le produit dit quand une règle ne s'applique pas, au lieu de la laisser vide** |
| `loyer` | montant | saisie (B16) | oui | Hors périmètre : refusé avec la phrase de § 2.0.3 |
| `echeances` | liste de 5, **dérivées** | dérivées du bail, **jamais saisies** (B12) | oui | Une échéance sans date source : rendue avec un tiret et la phrase qui dit pourquoi. **Jamais une date par défaut** |
| `famille_echeance` | `bloquante` ou `marge` | dérivée, non choisie | oui | Absente : l'échéance n'est pas rendue |
| `etat_decision` | `a_decider` / `faite` / `faite_tard` / `faite_avec_accord` | calculé une fois, **figé** | oui | Le figeage est la property : une décision ne se rouvre pas tant que le délai n'est pas passé |
| `depot_garantie` | montant | saisie | non | Non saisi : `Montant` variante `manquant`, un tiret et « pas saisi » — **jamais 0,00 € par défaut** |
| `avance` | montant | saisie | non | Non saisi : idem. **L'avance est un solde séparé, jamais absorbée** |
| `solde_courant` | montant | saisie | non | Non saisi : idem. **Les trois soldes ne sont jamais compensés entre eux** |
| `fin_conservation` | date, **vide** | **non renseignable** tant que Q2 du PRD n'est pas tranchée | **non, et c'est le sujet** | Champ état `inconnu` : un tiret et la phrase qui dit que tant que la date n'est pas écrite, Bailly ne peut pas dire quand le document pourra être effacé |
| `piece_bail` | fichier, **facultatif** | bloqué tant que Q5 du PRD n'est pas tranchée | non | Le champ est `impossible` et le dit. **Aucune pièce jointe n'est exigée** |
| `etat_ecriture` | `a_envoyer` / `rien_a_confirmer` / `echec_envoi` | local d'abord (C2) | oui | Le mot d'état est **écrit** dans le titre de l'écran, pas dans une icône |

- **Chargement** : tout d'un bloc, sans pagination. Le bail est un objet unique, donc il
  n'y a rien à paginer — et les cinq échéances sont rendues dans la même passe que le bail,
  jamais dans une seconde requête, pour qu'une ligne de dérivation ne puisse pas arriver
  sans sa valeur.
- **Cache / hors-ligne** : le bail et ses cinq échéances s'affichent **entièrement** sans
  réseau (N2, C9). Les échéances sont dérivées **localement** à partir du bail local, donc
  le garde-fou est disponible dans un sous-sol — ce qui est la seule raison pour laquelle
  un garde-fou hors ligne vaut quelque chose. Les trois dates sources restent modifiables
  hors-ligne : ce sont des écritures locales, protégées par B1.
- **Données sensibles** : identité, adresse, montants, dépôt, pièces du bail : données
  personnelles au sens de C6. **Rien n'est journalisé, rien n'est envoyé à un tiers**
  (N8), et **aucun élément de ce dossier n'est chiffré côté client d'une façon qui
  produirait une copie hors du contrôle de l'hébergeur** : la référence vit chez
  l'hébergeur (C1), pas sur l'appareil — l'appareil ne contient que la copie locale, qui
  meurt avec lui (E2), et l'écran ne prétend jamais le contraire.

---

## 9. Traçabilité

| ID | Origine | Manifestation sur cet écran |
|---|---|---|
| **B5** | PRD | Le composant `Signature` est spécifié avec son état `tracee_non_confirmee` et sa phrase « signée ici, pas encore envoyé — la signature n'est pas valide », mais **il n'est rendu sur aucun écran du MVP**, et l'écran le dit en § 5. Une règle sans manifestation visuelle serait une règle non conçue ; une règle dont on invente l'écran serait une fonctionnalité non décidée |
| **B9** | PRD | Le champ « Fin de conservation » est **vide et explained** : « Tant que cette date n'est pas écrite, Bailly ne peut pas dire quand ce document pourra être effacé. » C'est l'un des trois états, et il est rendu sans bouton d'effacement |
| **B12** | PRD | Les cinq échéances sont rendues en variante `derivee` **avec la ligne de calcul**. Aucun champ d'échéance n'est saisissable, et l'appui long ouvre la règle au lieu d'un clavier. La seule date modifiable est `terme` |
| **B13** | PRD | Le bouton `Décider` n'apparaît que sur les trois échéances de famille `bloquante`. Une fois la décision prise, l'état est **figé** en `faite_tard` ou `faite_avec_accord` et cesse d'être rouge. Les deux échéances de `marge` n'ont **jamais** de bouton `Décider` |
| **B16** | PRD | Le loyer est saisi, jamais calculé. Les trois soldes sont affichés séparément et **jamais compensés** : ni net, ni dans un total. Une application qui additionne trois soldes en un seul nombre prend une décision de droit que le PRD n'a pas validée |
| **B17** | PRD | Aucune donnée n'est pré-remplie depuis une source extérieure. Le nom vient du bail, l'adresse vient du bail, le loyer vient du bail, et **Bailly ne complète ni ne corrige rien** |
| **B18** | PRD | Aucun bouton d'effacement, aucune variante destructive, dans aucune section de cet écran. Les trois états RGPD sont portés par l'écran `donnees-personnelles`, où aucun geste unique ne peut les déclencher |
| **C1** | PRD | L'écran ne prétend jamais que l'appareil est une sauvegarde. Le message de succès dit « enregistré **sur cet appareil** » |
| **C6** | PRD | Le droit d'accès porte sur ce dossier : l'entrée d'export est dans la fiche du dossier, et son contenu ne contiendra que du constaté |
| **C9** | PRD | Hors-ligne, tout est lisible et modifiable, et une `BandeauAlerte` dit que la décision est datée sur cet appareil et sera transmise ensuite. **Décider d'une opposition à reconduction est un geste hors ligne par nature** |
| **N1** | PRD | Le message de succès ne dit pas l'état de synchronisation ; il dit ce qui a été fait et où. L'indicateur de synchronisation, lui, est mis à jour en moins d'une seconde depuis l'état local |
| **N3** | PRD | 52 pt sur les trois champs source, `Enregistrer` et `Décider` |
| **N4** | PRD | Aucun texte sous 14 px ; la ligne de dérivation est à 14 px, le plancher du produit, et elle porte l'information la plus critique de l'écran — donc elle est aussi la plus courte qu'il faut |
| **N5** | PRD | Tailles en `rem` suivant le réglage du téléphone, plafonné à ×1,3. À ×1,3, la ligne de dérivation passe sur deux lignes et la ligne passe de 64 à 84 pt : **la hauteur s'adapte, la valeur ne se tronque jamais** |
| **E3** | PRD | Le composant `Signature` porte l'état `tracee_non_confirmee` et interdit de présenter la signature comme valide tant que le serveur n'a pas confirmé. Le § 5 de cet écran dit explicitement où cette règle se matérialise |
| **E5** | PRD | Le champ « Fin de conservation » est vide tant que Q2 du PRD n'est pas tranchée, donc **la durée de conservation est une case vide honnête, pas une date inventée**. C'est la condition pour que `donnees-personnelles` soit démontrable |
| **E10** | PRD | Aucun bouton « supprimer le dossier » sur cette fiche, dans aucune variante |
| **E12** | PRD | Si le stockage est plein, `Enregistrer` échoue **avant** d'écrire : le bail n'est pas créé à moitié, et donc aucune échéance n'est dérivée d'un bail incomplet. Un bail sans terme ne produirait rien, et c'est la bonne failure |

---

## 10. Checklist de gate

- [x] Les 9 états sont décrits avec un rendu concret et des **libellés écrits**.
- [x] Le vide de `/dossiers/nouveau/bail` **annonce ce qui va sortir des trois dates**, avec
      cinq lignes de dérivation en tirets. C'est le meilleur état vide du produit, et il est
      écrit.
- [x] Un vide n'est jamais un zéro ; l'erreur a un rendu et un libellé distincts.
- [x] Aucun « Réessayer » : la reprise est automatique.
- [x] Chaque élément interactif a un comportement, un feedback et un état résultant.
- [x] Le responsive est défini aux trois breakpoints.
- [x] La section Anti-générique est cochée et justifiée avec les valeurs réelles.
- [x] Aucune valeur de design n'est laissée à « à définir ».
- [x] **Aucun ratio de contraste écrit à côté d'une valeur.**
- [x] Chaque ID `B*`, `E*`, `C*` et `N*` de l'écran apparaît en § 9.
- [x] `node "$FORGE/scripts/forge-guard.js" placeholders <anchor>` ne signale rien ici.
- [x] L'écran reste cohérent avec `.forge/design/design-system.md` : le composant `Signature`
      est cité **sans être rendu**, et l'écran dit pourquoi.
