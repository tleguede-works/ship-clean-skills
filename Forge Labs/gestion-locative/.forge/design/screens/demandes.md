---
type: screen
slug: demandes
title: Demandes
module: demandes
status: draft
generated_at: 2026-09-30
derived_from:
  - .forge/prd.md
  - .forge/design/design-system.md
rule_ids: [B1, B2, B6, B7, B8, B14, B16, B17, B18, C2, C4, C6, C9, N1, N3, N4, N5]
edge_case_ids: [E8, E11]
flow: debloquer-le-flux
---

# Écran — Demandes

> Ce document est la **source de vérité** pour qu'une IA génère l'interface de cet écran.
> Il est généré depuis le gabarit, jamais recopié. Aucun `{{PLACEHOLDER}}` ne doit subsister.

---

## 1. Rôle de l'écran

| | |
|---|---|
| **Archétype d'app** | `mobile_field_ops` (principal) |
| **Module** | `demandes` — rang 5 de la navigation, **dans le menu « Plus »** |
| **Route** | `/demandes` |
| **Type** | page |
| **Utilisateurs** | Le propriétaire, seul utilisateur (C3) |
| **User stories servies** | US-7 |
| **Règles métier** | B1, B2, B6, B7, B8, B14, B16, B17, B18, C2, C4, C6, C9, N1, N3, N4, N5 |
| **Edge cases** | E8, E11 |

**Une phrase** : cet écran permet au propriétaire de voir, **en premier à chaque ligne, qui
doit agir** — lui ou le locataire — et de ne garder que les lignes qu'il peut traiter.

**Pourquoi il est au rang 5, dans le menu « Plus »** : sa fréquence est de 3 et sa
centralité de 3, donc c'est le score le plus bas des cinq destinations. La raison du
placement est celle du commanditaire : « un devis reçu attend ma décision ; un rendez-vous à
prendre attend mon geste. Sans cette info, la moitié de ma liste est des lignes que je ne
peux pas traiter, et **je cesse de l'ouvrir**. » Une liste qu'on cesse d'ouvrir ne mérite pas
une place dans la barre de navigation : elle mérite d'être **dans le Overflow**, avec la
pastille `À moi` comme signal, et c'est ce qui fait qu'on l'ouvre **quand il y a quelque
chose à faire** plutôt que par habitude.

**Le tri est la fonctionnalité.** Le tri est par `qui doit agir` — `À moi` d'abord — puis par
date. Ce n'est pas un tri d'usage, c'est une **réponse à B14** : sans elle, la moitié de la
liste est un travail impossible, et une liste de travail impossible est une liste qu'on
cesse d'ouvrir.

---

## 2. Direction visuelle de cet écran

| | |
|---|---|
| **Mood** | opérationnelle, parlante, sans alarme |
| **Densité** | **normale** — les lignes font 72 pt, la plus haute du produit après la ligne d'écart, parce qu'elles portent **deux horloges opposées** : la date de réception et l'attente. Réduire cette hauteur fusionnerait deux informations qui ne sont pas du même ordre |
| **Niveau de contraste** | **fort** — `À moi` est une pastille **pleine** ambre et `Au locataire` une pastille à contour : les deux se distinguent au balayage, sans avoir à lire le mot |
| **Traitement photographique** | `thumbnail` **uniquement** pour un devis d'artisan joint à une demande. Sinon `AUCUN` : une demande n'a pas d'image, et une photo de pièce à traiter serait du bruit |
| **Référence** | le **tiroir de tâches** d'un logiciel de gestion, vidé de tout ce qui rend la liste non actionnable : pas d'étiquettes libres, pas de filtres, pas de recherche, pas de tri par l'utilisateur. Il reste **deux groupes fixes** et une pastille par ligne |

**Les valeurs portées par cet écran**

| Rôle | Token | Valeur |
|---|---|---|
| Fond de l'application | `--color-background` | `#101319` |
| Surface des lignes | `--color-surface` | `#171B22` |
| Surface élevée, pastille pleine `À moi` | `--color-surface-raised` | `#212630` |
| Barre d'action | `--color-surface-raised` | `#212630` |
| Encre de lecture, intitulé | `--color-texte-principal` | `#E8ECF3` |
| Encre secondaire, horloge | `--color-texte-secondaire` | `#A6B0C0` |
| Encre tertiaire, objet du bien | `--color-texte-tertiaire` | `#8B95A5` |
| Ambre — `À moi` | `--color-primaire-600` | `#E0A23A` |
| Sauge — « faite », en second | `--color-confirme-600` | `#7FB08C` |
| Contour de la pastille `Au locataire` | `--color-bordure-champ` | `#7C8695` |

| | |
|---|---|
| **Surface** | `--color-surface` `#171B22` sur `--color-background` `#101319` |
| **Accent utilisé** | `--color-primaire-600` `#E0A23A` — **la pastille `À moi`, et rien d'autre.** Aucune autre ligne n'est ambre, donc l'œil va directement à ce qu'il peut traiter. Le nom « À moi » est le même mot que dans la phrase du commanditaire, donc il n'a pas besoin d'être appris |

### 2.1 Anti-générique — obligatoire

- [x] **Pas de fond blanc pur `#FFFFFF`.** Fond `#101319`, choisi, justifié.
- [x] **Pas de carte ombrée pour tout.** Deux groupes séparés par un sur-titre et
      `--space-2xl`, un filet de 1 px entre les lignes. **La seule carte du produit sur
      cet écran est le menu « Plus »**, qui est un vrai conteneur modal.
- [x] **Pas d'uniformité.** L'intitulé est en 17 px 600 pour le groupe `À moi` et en 17 px
      **400** pour le groupe `Au locataire` : **la graisse elle-même encode la priorité**, ce
      que la couleur ne peut pas faire seule. La pastille est en 13 px 600 interlettré,
      l'horloge en 14 px, l'objet du bien en 14 px.
- [x] **Pas de gris neutre générique.** La pastille `Au locataire` est à contour
      `--color-bordure-champ` en `--color-texte-secondaire` ; la pastille `À moi` est pleine
      ambre en `--color-texte-inverse`. **Les deux sont des pastilles, donc aucune n'est
      une teinte d'état** — c'est `BandeauOnglets` qui porte la pastille, jamais un état.
- [x] **Pas de mise en page centrée symétrique.** Deux groupes alignés à gauche, marges
      `--space-lg`.
- [x] **Pas d'illustration d'appoint générique.** Aucun glyphe de type de demande dans un
      cercle, aucune icône de devis, de rendez-vous ou de courrier. La catégorie est un mot
      en sur-titre à droite de l'horloge.
- [x] **Pas d'une seule famille de police.** `--font-chasse` pour les horodatages et la
      ligne «Attend depuis… », alignés sur une colonne de 128 pt pour les deux groupes, donc
      les horloges des deux groupes se comparent d'un coup d'œil.

**Choix assumé et non neutre** : **`À moi` est en haut, toujours, et `Au locataire` en
bas, toujours** — et l'ordre ne s'inverse pas quand un groupe est vide. Un tri dynamique qui
change selon le contenu fait perdre au propriétaire l'endroit où ses yeux vont. Un ordre
fixe, c'est un muscle. Et quand le groupe `À moi` est vide, il **reste affiché avec son
compte à 0 et une phrase**, parce qu'une liste vide ne prouve pas qu'il n'y a rien à faire —
elle prouve seulement qu'il n'y a rien à faire **dans la partie de la liste qu'on voit**.
L'autre partie existe, elle est juste plus bas.

---

## 3. Anatomie

```
BandeauSynchronisation                                  PERMANENT
        │
        ▼
TitreÉcran  variante `avec_contexte`
├─ [titre] "Demandes"
├─ [retour] non — c'est un onglet du menu « Plus »
└─ [contexte] "6 en attente · 2 attendent ta décision"   --font-chasse
        │
        ▼
BandeauAlerte  variante `impossible`            CONDITIONNEL
└─ "Une demande sans « qui doit agir » ne peut pas être traitée.
    Bailly n'en invente pas : elle est comptée à part, dans « sans porteur »."
        │
        ▼  --space-2xl
ListePlate  variante `groupee`
├─ [sur_titre] "À MOI · 2"
├─ LigneDemande variante `moi` × 2                72 pt
│   ├─ [qui_doit_agir] Pastille PLEINE ambre  "À moi"
│   ├─ [intitule]  "Devis de remplacement de la chasse d'eau"   --text-body-fort
│   ├─ [horloge]   "reçue le 12 à 9 h 12"
│   ├─ [objet]     "Courges, 3e"
│   └─ [categorie] "Devis"     --text-overline, à droite
│
├─ [sur_titre] "AU LOCATAIRE · 4"
├─ LigneDemande variante `locataire` × 4          72 pt
│   ├─ [qui_doit_agir] Pastille à CONTOUR  "Au locataire"
│   ├─ [intitule]  "Rendez-vous pour le passage du plombier"   --text-body
│   ├─ [horloge]   "attendue depuis le 9 septembre"
│   └─ [objet]     "Breguet, 4e"
│
├─ [sur_titre] "SANS PORTEUR · 0"                CONDITIONNEL, cf. E8 et B14
└─ LigneDemande × n   72 pt
     ┌ variante `deux_fois_le_meme_jour`
     │  [horloge] "reçue à 9 h 12 · 18 h 41"  — deux horodatages, jamais fusionnés (E8)
     └ [qui_doit_agir] — le champ est vide, et l'écran le dit
        │
        ▼  --space-3xl
BarreAction  variante `secondaire`
├─ [action_principale] Bouton lg "Traiter les 2 qui t'attendent"
└─ [action_secondaire] Bouton md "Voir les 4 au locataire"
```

| # | Composant | Rôle | Source |
|---|---|---|---|
| 1 | `BandeauSynchronisation` | Dire où en sont les écritures de l'écran (B6) | design-system § 3.1 |
| 2 | `TitreÉcran` | Nommer l'écran et porter les deux comptes en une ligne | design-system § 3.18 |
| 3 | `BandeauAlerte` | Dire qu'une demande sans porteur existe et n'est pas inventée (B14) | design-system § 3.24 |
| 4 | `ListePlate` | Contenir les trois groupes, dans un **ordre fixe** | design-system § 3.23 |
| 5 | `LigneDemande` | Rendre `qui doit agir` **avant** l'intitulé (B14) | design-system § 3.6 |
| 6 | `Pastille` | Porter la catégorie `Devis`, `Rendez-vous`, `Courrier` — **jamais un état** | design-system § 3.19 |
| 7 | `Horodatage` | Rendre **deux horodatages distincts** quand la demande est arrivée deux fois (E8) | design-system § 3.21 |
| 8 | `Vide` | Rendre l'absence de demandes avec son libellé écrit | design-system § 3.26 |
| 9 | `Bouton` | Porter les deux actions de la barre | design-system § 3.8 |
| 10 | `BarreAction` | Porter le geste principal dans la portée du pouce | design-system § 3.16 |

---

## 4. États — tous, sans exception

| État | Déclencheur | Rendu | Feedback utilisateur |
|---|---|---|---|
| **Chargement** | Ouverture de `/demandes` depuis le menu « Plus » | 6 `LigneDemande` en ossature de **72 pt**, réparties dans les groupes avec leurs sur-titres **déjà rendus et leurs comptes déjà écrits**. Un sur-titre qui apparaît après ses lignes fait sauter toute la page | Aucun texte d'attente, aucun spinner. Le titre porte déjà les deux comptes dès la première frame |
| **Rempli** | Des demandes sont en attente | Les trois groupes dans l'ordre **fixe** `À moi` · `Au locataire` · `Sans porteur`, chaque ligne avec sa pastille, son horloge et son objet | Aucun. Les groupes **sont** le feedback |
| **Vide — jamais visité** | Le propriétaire n'a jamais eu de demande | `Vide` variante `jamais_visite` : « Aucune demande. Une demande est une chose qui attend : un devis reçu, un rendez-vous à prendre, un courrier à traiter. Tu en crées une, ou un locataire en dépose une. » + `Bouton primaire` `Créer une demande` | La `BarreAction` porte `Créer une demande` en `lg` à la place de `Traiter les 2 qui t'attendent`, qui **n'a pas de nombre à afficher**. Le mot du bouton change, la barre ne bouge pas |
| **Vide — aucune donnée** | Toutes les demandes sont traitées | Les trois groupes sont **rendus avec leurs comptes à 0** et une ligne de phrase par groupe : « Rien n'attend ta décision. » / « Le locataire n'a rien à te transmettre. » Le `BandeauAlerte` de B14 **disparaît** quand le compte `Sans porteur` est à 0 | Aucun bouton de reprise, aucun « Réessayer ». Une liste vide qui n'attend personne n'appelle à la rafraîchir |
| **Erreur de chargement** | La lecture des demandes échoue | `Vide` variante `erreur` + `BandeauAlerte` en variante `impossible` : « Impossible de lire les demandes. Rien n'est affiché — et ce n'est pas vide : on ne sait pas encore. » | **Aucun bouton « Réessayer »** : la reprise est automatique. Un `BandeauAlerte` en variante `information` — « La lecture se fera seule dès que le réseau revient. » **Afficher les trois groupes vides ferait croire qu'il n'y a rien à traiter**, et c'est exactement la situation où le propriétaire cesse d'ouvrir l'écran |
| **Erreur de soumission** | Une demande est créée sans `qui_doit_agir`, ou un rendez-vous est posé sans date | Erreur **au champ** de la feuille de création, jamais dans un message bref global. Pour `qui_doit_agir` : le `GroupeSegmenté` passe en `requis_non_choisi` et le bouton bascule en `impossible` avec l'aide « Choisis qui doit agir : toi ou le locataire. Bailly ne le devine pas. » **Aucun dialogue modal** | Le focus reste sur le champ fautif. **Aucune demande n'est enregistrée sans porteur** : elle n'est pas « corrigée plus tard », elle n'est pas créée |
| **Succès** | Une demande est traitée, ou une demande est créée | `MessageBref` variante `info` : « Demande **sur cet appareil**. Pas encore confirmée. » La ligne **quitte le groupe `À moi`** immédiatement et passe en `traitée`, ce qui fait descendre le compte du sur-titre. **La ligne passe dans l'historique du dossier**, elle n'est pas supprimée — une demande traitée n'est pas une demande qui n'a jamais existé | Le compte du titre se recompose. **Aucun toast, aucune animation de disparition** : la ligne devient simplement non listée ici, et le message dit où elle est |
| **Hors-ligne / permissions** | Mode avion, sous-sol | Les trois groupes s'affichent **entièrement** depuis l'appareil, et `Créer une demande` reste **actif** : créer une demande est une écriture locale, protégée par B1 comme les autres. Traiter une demande hors-ligne est également possible, sauf quand elle exige une preuve d'envoi | Le `BandeauSynchronisation` rend `hors_ligne`. Si une demande exige une preuve d'envoi, **le bouton de traitement de cette demande** passe en `impossible` avec sa raison, sur la ligne — le même traitement que la relance (B15) |
| **Lecture seule** | Écran verrouillé | Les lignes passent en variante `lecture_seule` : pastille conservée, texte en `--color-texte-desactive`, aucune zone pressable. La `BarreAction` rend `desactivee`, le bouton principal en `impossible` avec l'aide « Déverrouille pour traiter une demande. » **La barre ne disparaît pas** | Le bouton est visiblement non pressable et son aide dit pourquoi |

---

## 5. Interactions

| Élément | Événement | Comportement | Feedback visuel | État résultant | ID |
|---|---|---|---|---|---|
| `Bouton lg "Traiter les 2 qui t'attendent"` | tap | Ouvre `/demandes` sur le groupe `À moi`, et pose le focus sur **la plus ancienne** de ses lignes. C'est l'ordre d'action : la plus ancienne est celle qui attend depuis le plus longtemps | Le groupe est déjà en haut, donc le focus est posé sans défilement ; un défilement en `--duration-normal` seulement si la liste a changé de longueur | Focus posé sur la demande la plus ancienne | US-7 |
| `Bouton md "Voir les 4 au locataire"` | tap | Défile jusqu'au groupe `Au locataire` et pose le focus sur sa première ligne. **Ce n'est pas un filtre** : la liste reste entière | Défilement en `--duration-normal` `--ease-default` | Focus posé | US-7 |
| `LigneDemande`, tap | tap | Ouvre `/demandes/:demandeId` | Aucun fondu | Navigation vers la demande | US-7 |
| `LigneDemande` du groupe `Sans porteur`, tap | tap | Ouvre la même fiche, mais la feuille **ne propose pas de traitement** : elle affiche « Cette demande n'a pas de porteur. Choisis qui doit agir, sinon elle reste ici. » Le `GroupeSegmenté` est donc rendu **ici**, en modification, avec l'aide « Bailly ne le devine pas. » | Aucun fondu | Feuille de demande, segment actif | B14 |
| `LigneDemande`, appui long | appui long | Ouvre la `Feuille` des actions : `Voir le dossier`, `Voir les faits`, `Voir les photos`. **Aucune action de suppression, et aucune action « marquer comme traitée »** — une demande traitée passe par la fiche, parce que la traiter c'est produire une pièce (un devis, une décision, un rendez-vous), pas cocher une case | La feuille monte en 200 ms | Feuille d'actions | B18 |
| `LigneDemande` variante `deux_fois_le_meme_jour` | tap | Ouvre la fiche, qui affiche **les deux horodatages côte à côte** et **ne propose aucun rapprochement** | Aucun | Feuille de demande | E8 |
| `Pastille` de catégorie, tap | tap | Aucune action. Une catégorie est une étiquette, pas un filtre : filtrer par catégorie sur une liste de six lignes serait plus long que de la lire | Aucun | — | — |
| Sur-titre `À MOI · 2`, appui long | appui long | Affiche la précision du compte : « 2 attendent ta décision depuis plus de 3 jours. » Un compte sans détail est un chiffre qu'on ne peut pas vérifier | Le contexte s'étend sur deux lignes | Contexte détaillé | US-7 |
| `BandeauAlerte` de B14 | appui long | Ouvre la `Feuille` de règle : « Qui doit agir est la première information d'une demande. Un devis reçu attend ta décision ; un rendez-vous à prendre attend ton geste. Bailly ne le devine pas : une demande sans porteur reste dans son groupe, et c'est visible. » | La feuille monte en 200 ms | Explication de la règle | B14 |
| Retour arrière | retour | Conserve la position de défilement et le groupe courant | Aucun | Inchangé | — |
| Défilement | scroll | Défilement natif, 16 pt de respiration sous la dernière ligne. **Pas de pull-to-refresh** : le même geste sert à revenir en arrière, et ce menu s'ouvre par un retour | Défilement natif | Inchangé | — |

- **Focus / clavier** : 6 focusables, un par ligne, plus 2 boutons. **`Origine` va à la
  ligne la plus ancienne du groupe `À moi`** — l'ordre d'action, pas l'ordre visuel si les
  groupes changeaient. `Tab` parcourt ensuite les lignes dans l'ordre fixe des groupes.
- **Gestes** : **aucun geste porteur.** Pas de swipe pour traiter une demande, pas de
  swipe pour l'archiver, pas de long-press pour la supprimer. Une demande traitée est un
  **acte** qui produit une pièce, donc elle ne se balaie pas. Le glissement de `Feuille` ne
  fait que fermer.
- **Animations** : le déplacement d'une ligne d'un groupe à l'autre est en
  `--duration-fast`**, et c'est la seule animation de la page. Une ligne qui glisse à
  l'écran pendant qu'on la cherche est une ligne qu'on ne voit pas partir. Un compteur de
  sur-titre qui défile n'est pas un compteur qu'on peut lire. `prefers-reduced-motion` met
  tout à 0 ms.
- **Retour arrière** : conserve la position et le groupe, et **ne ferme pas le menu « Plus »
  par inadvertance** : le retour arrière dans un menu déroulant est intercepté une fois.

---

## 6. Responsive

| Breakpoint | Comportement | Ce qui se replie / disparaît |
|---|---|---|
| **Mobile** (0–479 px) | Le layout de référence. Lignes de 72 pt, pastille et intitulé sur la **première ligne**, horloge et objet sur la deuxième, marges `--space-lg`, barre d'action de 88 pt, onglets de 64 pt | Rien. Sous 360 pt, l'intitulé passe sur **deux lignes** et la ligne passe de 72 à 88 pt. **La pastille ne bouge jamais** : c'est la première information, elle reste en haut à gauche |
| **Tablet** (480–899 px) | Deux colonnes : groupe `À moi` et groupe `Au locataire` côte à côte, `Sans porteur` en pleine largeur dessous. Le menu « Plus » devient un rail vertical de 88 pt | Le groupe `Sans porteur` passe dessous : il ne compte presque jamais, donc il ne doit pas prendre la moitié de la largeur |
| **Desktop** (900 px et au-delà) | **Aucun rendu distinct.** Colonne centrée de 720 pt, navigation en bas. X11 exclut la version navigateur de bureau | Rien |

- **Cible tactile** : **72 pt par ligne**, plus 52 pt pour les boutons et 64 pt pour les
  segments d'onglet. La pastille n'est **pas** une cible de 40 pt : elle est incluse dans
  les 72 pt de la ligne, donc la zone pressable est la ligne entière.
- **Débordement** : (1) L'intitulé est tronqué au deuxième point, jamais au milieu d'un mot,
      avec points de suite. (2) Le compteur de sur-titre ne déborde jamais : `À MOI · 2` est
      court par construction, et le nombre peut atteindre trois chiffres sans casser la
      ligne. (3) Les **deux horodatages** d'une demande reçue deux fois passent sur **deux
      lignes** sous 360 pt, jamais sur une seule ligne tronquée : « reçue à 9 h 12 » puis
      « 18 h 41 », parce que deux horodatages fusionnés en un seraient un horodatage.
- **Ce qui ne déborde jamais** : la ligne d'un groupe vide. Le sur-titre et sa phrase sont
      lus en entier, parce que **c'est le seul endroit où la page dit quelque chose quand il
      n'y a rien à faire**.

---

## 7. Accessibilité

- [ ] **Contraste du texte courant** — mesuré par `design-check contrast`, qui applique
      4,5:1 à chaque encre contre les huit surfaces de son `on:`, dont
      `--color-surface-raised` (la pastille `À moi` porte `--color-texte-inverse` dessus).
      **Aucun ratio n'est écrit ici.**
- [ ] **Contraste des grands textes** — il n'y a pas de grand texte sur cet écran. Les
      sur-titres de groupe sont en `--text-overline` 13 px **600** : c'est la taille la plus
      basse du produit, donc **la plus contraignante au contraste**. Ils sont mesurés à
      4,5:1 comme tout le reste, et c'est pourquoi ils sont en gras : à 13 px, le gras est ce
      qui rend un sur-titre lisible dans le noir, pas la taille.
- [ ] **Navigation clavier complète** — sur clavier externe et sur tous les breakpoints.
      `Origine` va à la demande la plus ancienne du groupe `À moi`. `Tab` parcourt les lignes
      dans l'ordre fixe des groupes. Le menu « Plus » a ses propres règles : `flèche haut` et
      `flèche bas` pour se déplacer entre ses entrées, `Échap` pour le fermer.
- [ ] **Focus visible** — anneau `--color-bordure-focus` de 2 px avec 2 px de fond entre
      l'anneau et la ligne. **La pastille ne change pas au focus** : elle porte `qui doit
      agir`, pas la position, et la confondre ferait croire qu'une demande a changé de
      porteur.
- [ ] **ARIA** — les trois groupes sont trois `role="list"` avec chacun un `aria-label`
      complet : « À traiter par le propriétaire, 2 demandes », « En attente du locataire, 4
      demandes », « Sans porteur désigné, aucune demande ». Chaque ligne porte un `aria-label`
      qui **commence par le porteur** : « Attend ta décision, devis de remplacement de la
      chasse d'eau, reçu le 12 septembre à 9 h 12, Courges 3e. » **C'est la première
      information de la ligne visible, donc c'est la première du nom accessible** — sans
      elle, un utilisateur de technologies d'assistance doit lire toute la ligne pour savoir
      s'il peut agir.
- [ ] **Alternative textuelle** — une demande peut porter une `VignettePhoto` de devis
      d'artisan, dont l'`alt` décrit **l'état et non l'image** : « Devis du plombier, page 1,
      sur cet appareil, pas encore envoyé. » Aucun glyphe de type de demande dans un cercle
      : les catégories sont des mots, donc rien à décrire.
- [ ] **Langue et direction de lecture** — `lang="fr-FR"`, gauche à droite, horodatages
      `JJ/MM` et `HH h mm` en chasse fixe. **La pastille dit `À moi` et non `Moi`** : la
      préposition porte le sens, c'est lui qui fait la différence entre « c'est à moi » et
      « c'est moi ». Le mot est le même que dans la phrase du commanditaire, donc il n'a pas
      à être appris.

---

## 8. Données

| Champ | Type | Origine | Requis | Erreur possible |
|---|---|---|---|---|
| `qui_doit_agir` | énumération `proprietaire` / `locataire` | **obligatoire, saisie explicitement** (B14) | oui | Absente : la demande va dans le groupe `Sans porteur`, **n'est jamais inventée** et n'est jamais rangée ailleurs. Le `BandeauAlerte` compte ces lignes et l'écran le dit |
| `intitule` | chaîne, 6 mots maximum | saisie ou **dérivée d'un objet déposé** | oui | Vide à la création : refusé au champ. **À la réception d'un objet, l'intitulé est dérivé du type de l'objet, pas de son contenu** — un contenu libre demanderait sa classe (B8) |
| `categorie` | `devis` / `rendez_vous` / `courrier` | choisie, en `Pastille` | oui | **Une catégorie n'est pas un état**, donc aucune teinte sémantique ne lui est attachée. Une catégorie inconnue est refusée à la création |
| `horodatages_reception` | liste d'horodatages, **jamais dédupliquée** (E8) | local, à chaque réception | oui | Deux horodatages pour la même demande et le même jour : **les deux sont conservés et affichés côte à côte**. Aucun rapprochement automatique, aucun mot « doublon » |
| `objet` | identifiant du bien | choisi, jamais déduit d'une position (X6) | oui | Sans objet : la ligne porte un tiret, et le groupe reste affichable |
| `etat_traitement` | `a_moi` / `au_locataire` / `sans_porteur` / `traitee` | dérivé de `qui_doit_agir` et de l'état | oui | Une demande traitée reste dans l'historique du dossier : **elle n'est jamais supprimée** |
| `decision` | texte libre, **avec classe** (B8) | saisie | non | Vide : la demande reste en attente. Une décision en appréciation **ne sort jamais d'un export** |
| `piece_jointe` | fichier | local d'abord, confirmé ensuite (C2) | non | Fichier illisible : `VignettePhoto` en état `illisible`, compté. Fichier non écrit (E12) : le `BandeauAlerte` le dit |
| `etat_envoi` | `a_envoyer` / `rien_a_confirmer` | local d'abord | oui | Échec : aucun bouton « Réessayer », la reprise est automatique |

- **Chargement** : tout d'un bloc, **sans pagination**. Une liste de six demandes n'a pas
  besoin de pages, et une pagination ferait perdre la position dans la liste de gens à
  appeler.
- **Cache / hors-ligne** : les trois groupes s'affichent **entièrement** hors-ligne (N2,
  C9), et `Créer une demande` reste actif. **La seule exception** est une demande qui
  exige une preuve d'envoi : son bouton de traitement passe en `impossible` **sur la
  ligne**, avec le même traitement que la relance (B15). C'est la seule fois que ce
  produit refuse un geste, donc c'est la seule fois où il doit l'expliquer mot pour mot.
- **Données sensibles** : l'intitulé d'une demande, sa catégorie et sa décision sont des
  **données personnelles au sens de C6** : exportables avec le dossier du locataire, et
  **non effaçables** pour ce qui relève d'une pièce comptable. La décision textuelle
  **demande sa classe**, donc une appréciation écrite dans une décision n'est jamais
  exportée (B7, B8). **Rien n'est journalisé, rien n'est envoyé à un tiers** (N8) — et en
  particulier **aucune notification poussée** : le compteur est dans l'écran et dans le
  menu « Plus », donc on vient le voir quand on a quelque chose à faire (X10).

---

## 9. Traçabilité

| ID | Origine | Manifestation sur cet écran |
|---|---|---|
| **B1** | PRD | Toute demande créée est locale d'abord, et porte `Pas encore confirmé` tant que le serveur n'a rien confirmé. Le `MessageBref` contient le mot du téléphone |
| **B2** | PRD | Les trois mots d'état de l'écran sont `À moi` · `Au locataire` · `Sans porteur`, écrits en toutes lettres dans la `Pastille`. **Un état en pastille** — parce que ce ne sont pas des états de synchronisation mais **des porteurs d'action**, et la distinction est celle du design system § 3.19 |
| **B6** | PRD | Le `BandeauSynchronisation` est présent même quand il n'y a aucune écriture en attente. Il ne se masque pas |
| **B7** | PRD | Une demande ne porte **jamais** de texte libre non classé : l'intitulé est dérivé d'un type d'objet, la décision demande sa classe, et la catégorie est une `Pastille` |
| **B8** | PRD | Le champ de décision demande sa classe avant d'être accepté. **Il n'y a pas de champ « note »** |
| **B14** | PRD | `qui_doit_agir` est **obligatoire, saisie, jamais devinée**. Le groupe `Sans porteur` existe, il est visible, il est compté, et le `BandeauAlerte` explique pourquoi il n'est pas rangé ailleurs. **La moitié de la liste ne peut pas être des lignes qu'on ne peut pas traiter** |
| **B16** | PRD | Aucun montant sur cet écran, aucun total, aucun compteur d'argent. Les seuls chiffres sont des **comptes de demandes** et des **comptes de jours d'attente** |
| **B17** | PRD | Le bien est **choisi**, jamais déduit d'une position ou d'une carte (X6) |
| **B18** | PRD | Aucune action de suppression, et **pas de « marquer comme traitée »** dans l'appui long : traiter une demande, c'est produire une pièce, donc ça passe par la fiche. Le `BandeauAlerte` de B14 n'est pas un bouton |
| **C2** | PRD | Création et traitement sont des écritures locales d'abord. L'ordre n'est jamais inversé |
| **C4** | PRD | `BarreAction` de 88 pt et `BarreOnglets` de 64 pt permanentes, avec `--space-3xl` de respiration. La ligne fait 72 pt, donc l'information et la zone pressable sont la même chose |
| **C6** | PRD | L'intitulé, la catégorie et la décision sont des données personnelles. La décision textuelle demande sa classe, donc un jugement n'est pas exporté comme un fait |
| **C9** | PRD | Hors-ligne, la liste est complète et la création fonctionne. Seule une demande exigeant une preuve d'envoi change d'état, **sur sa ligne**, avec la raison |
| **N1** | PRD | Le rendu est local donc instantané. Le déplacement d'une ligne entre groupes est en 200 ms et rien d'autre n'est attend |
| **N3** | PRD | 72 pt par ligne, 52 pt pour les boutons. La pastille n'est pas une cible séparée : elle est dans les 72 pt de la ligne |
| **N4** | PRD | Corps à 17 px, sur-titres à 13 px **600**. Aucun texte sous 14 px ailleurs |
| **N5** | PRD | Tailles en `rem` suivant le réglage du téléphone, plafonné à ×1,3 : à ×1,3 la ligne passe de 72 à 88 pt et **les groupes restent dans le même ordre** |
| **E8** | PRD | Deux demandes de la même personne le même jour : **deux lignes, deux horodatages, côte à côte**. Aucune déduplication, donc aucun risque de dédoublement, et **aucun mot « doublon »** — ce n'en est pas un |
| **E11** | PRD | Une demande créée puis abandonnée reste dans son groupe avec son mot d'état. Le retour arrière conserve la position et le groupe, et ne ferme pas le menu « Plus » par inadvertance |

---

## 10. Checklist de gate

- [x] Les 9 états sont décrits avec un rendu concret et des **libellés écrits** — y compris
      la phrase de chaque groupe vide.
- [x] Un groupe vide est **affiché avec son compte à 0 et une phrase** : une liste vide ne
      prouve pas qu'il n'y a rien à faire.
- [x] `Sans porteur` est un groupe à part entière, visible et compté : B14 est une property du
      schéma, donc son absence doit être visible.
- [x] Aucun « Réessayer », aucune action de suppression, pas de « marquer comme traitée »
      dans l'appui long.
- [x] Chaque élément interactif a un comportement, un feedback et un état résultant.
- [x] Le responsive est défini aux trois breakpoints.
- [x] La section Anti-générique est cochée et justifiée avec les valeurs réelles.
- [x] Aucune valeur de design n'est laissée à « à définir ».
- [x] **Aucun ratio de contraste écrit à côté d'une valeur.**
- [x] Chaque ID `B*`, `E*`, `C*` et `N*` de l'écran apparaît en § 9.
- [x] `node "$FORGE/scripts/forge-guard.js" placeholders <anchor>` ne signale rien ici.
- [x] L'écran reste cohérent avec `.forge/design/design-system.md` : la `Pastille` porte un
      **porteur d'action**, jamais un mot d'état de synchronisation, et la distinction est
      écrite.
