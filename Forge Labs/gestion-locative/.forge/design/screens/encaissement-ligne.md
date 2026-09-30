---
type: screen
slug: encaissement-ligne
title: Ligne d'encaissement et relance
module: encaissement
status: draft
generated_at: 2026-09-30
derived_from:
  - .forge/prd.md
  - .forge/design/design-system.md
rule_ids: [B1, B2, B6, B7, B9, B15, B16, B17, B18, C2, C4, C6, C9, C11, N1, N3, N4, N5]
edge_case_ids: [E1, E9, E11]
flow: encaissement-mensuel
---

# Écran — Ligne d'encaissement et relance

> Ce document est la **source de vérité** pour qu'une IA génère l'interface de cet écran.
> Il est généré depuis le gabarit, jamais recopié. Aucun `{{PLACEHOLDER}}` ne doit subsister.

---

## 1. Rôle de l'écran

| | |
|---|---|
| **Archétype d'app** | `mobile_field_ops` (principal), `rental_tenancy` (secondaire) |
| **Module** | `encaissement` — rang 3, sous-écran |
| **Route** | `/encaissement/:mois/:dossierId` |
| **Type** | feuille (`Feuille` variante `bas`) |
| **Utilisateurs** | Le propriétaire, seul utilisateur (C3) |
| **User stories servies** | US-5, US-6 |
| **Règles métier** | B1, B2, B6, B7, B9, B15, B16, B17, B18, C2, C4, C6, C9, C11, N1, N3, N4, N5 |
| **Edge cases** | E1, E9, E11 |

**Une phrase** : cet écran permet au propriétaire d'enregistrer un reçu, de voir exactement
ce qui a été déclaré, et **de lancer une relance dont la preuve d'envoi est conservée** —
la seule action du produit qui exige le réseau.

**Pourquoi il est au rang 3 de la navigation** : c'est l'acte sur l'encaissement. La
roadmap § 2.2 a tranché : « la relance n'a pas d'état propre : c'est un acte sur
l'encaissement, donc elle vit dedans ». Cette feuille **est** cet acte, donc elle n'a pas de
rang propre et n'occupe aucun emplacement dans la navigation.

**Ce que cette feuille est aussi** : le seul endroit du produit où un bouton passe en
`impossible` **sans que l'action disparaisse**, et c'est la seule fois où le design system
doit prédire ce qui va se passer. C'est exactement ce que B15 demande : « on ne l'envoie pas, et
on le verra demain matin ».

---

## 2. Direction visuelle de cet écran

| | |
|---|---|
| **Mood** | opérationnelle, parlante, sans alarme |
| **Densité** | **normale** — quatre blocs : identité, sommes, reçus, relance. La feuille est à 85 % de la hauteur, donc il reste **au plus 7 lignes visibles** au-dessus du clavier, et c'est pourquoi il n'y a que deux champs dans toute la feuille |
| **Niveau de contraste** | **fort** — le montant en retard et la date limite de relance sont lus avant tout le reste |
| **Traitement photographique** | **thumbnail** pour les justificatifs de paiement, et uniquement ceux-là : un virement bancaire se prouve par un document, pas par un relevé automatique. **Aucun service bancaire, aucune API de paiement** (N8) |
| **Référence** | la fiche d'une opération bancaire — **sans** le solde cumulé, le numéro de compte, le nom de la banque et le logo du réseau. Ces quatre éléments sont précisément ce que ce produit n'a pas et ne cherche pas à avoir |

**Les valeurs portées par cet écran**

| Rôle | Token | Valeur |
|---|---|---|
| Fond de la feuille | `--color-background` | `#101319` |
| Surface de la feuille | `--color-surface` | `#171B22` |
| Champ de saisie, ligne d'écart | `--color-surface-sunken` | `#0A0C10` |
| Barre d'action de la feuille | `--color-surface-raised` | `#212630` |
| Encre de lecture, montant dû | `--color-texte-principal` | `#E8ECF3` |
| Encre secondaire, aide | `--color-texte-secondaire` | `#A6B0C0` |
| Ambre — « sur cet appareil » | `--color-primaire-600` | `#E0A23A` |
| Sauge — « payé », relance produite | `--color-confirme-600` | `#7FB08C` |
| Terre cuite — en retard, action refusée | `--color-alerte-600` | `#F09286` |
| Contour de champ | `--color-bordure-champ` | `#7C8695` |

| | |
|---|---|
| **Surface** | `--color-surface` `#171B22` sur un voile `--color-voile` `#05070A` à 72 % |
| **Accent utilisé** | `--color-primaire-600` `#E0A23A` — le segment choisi, l'étiquette du champ focalisé, et le mot `Pas encore confirmé` du reçu non parti. **L'ambre est la couleur de ce qui est sur l'appareil, donc de tout ce qui n'est pas encore sorti d'ici** |

### 2.1 Anti-générique — obligatoire

- [x] **Pas de fond blanc pur `#FFFFFF`.** Feuille `#101319`, champ `#0A0C10`.
- [x] **Pas de carte ombrée pour tout.** Quatre blocs séparés par un sur-titre et
      `--space-2xl`. Aucun n'a de fond propre ni de rayon, **sauf la ligne d'écart**, qui est
      sur `--color-surface-sunken` — et ce n'est pas une carte, c'est une ligne qui porte une
      information que les autres ne portent pas.
- [x] **Pas d'uniformité.** Le montant dû est en `--text-body-fort` 17 px 600 en chasse fixe
      aligné à droite ; l'intitulé est en 17 px 400 ; la date limite de relance est en 14 px
      en chasse fixe ; la ligne d'écart est en 14 px. **Le montant et la date limite sont les
      deux seules choses en chasse fixe alignées à droite**, donc le regard va au chiffre
      puis à la date qui le rend actionnable.
- [x] **Pas de gris neutre générique.** `#A6B0C0` ne porte que de l'aide. Le mot
      `Payé en retard` est en terre cuite, `Payé` est en gris secondaire : **l'état en retard
      est le seul coloré**, parce que c'est le seul qui réclame un geste.
- [x] **Pas de mise en page centrée symétrique.** Blocs alignés à gauche, pleine largeur
      moins `--space-xl` de chaque côté.
- [x] **Pas d'illustration d'appoint générique.** **Aucun logo de banque, aucun pictogramme
      de virement, aucun pictogramme de relance.** Le bouton s'appelle `Relancer` et son
      résultat est une `VignettePhoto` de preuve — pas un glyphe.
- [x] **Pas d'une seule famille de police.** `--font-chasse` pour les montants, les dates et
      l'horodatage de la preuve d'envoi, alignés sur une même colonne de 88 pt.

**Choix assumé et non neutre** : **le bouton `Relancer` ne disparaît jamais, et sa
désactivation est un texte, pas une absence.** Hors-ligne, il reste là, en variante
`impossible`, avec sous lui la phrase : « Une relance produit une preuve d'envoi. Sans
réseau, elle n'est pas envoyée, et tu la verras demain matin. » Un bouton qui s'en va
laisse croire qu'il n'y a rien à faire, et **rien n'a changé** : il y a une action à faire,
elle exige un réseau, et elle sera faite demain. C'est la seule fois que ce produit refuse
un geste, et donc la seule fois où il doit le dire mot pour mot.

---

## 3. Anatomie

```
Feuille  variante `bas`                       85 % de la hauteur
├─ [poignee] 4 × 40 pt, zone 44 pt
├─ [titre] "Breguet · 4e"
├─ [aide] "Septembre 2026 · attendu le 5"
│
├─ [contenu]
│   ├─ LigneDonnée × 2
│   │    "Loyer du bail"   →  214,00 €      --font-chasse, aligné à droite
│   │    "Provisions"      →   36,00 €      --font-chasse, aligné à droite
│   ├─ LigneDonnée  --color-texte-principal
│   │    "Total dû"        →  250,00 €      --font-chasse, 600
│   │       PAS un total calculé en dur : une somme affichée, recalculée à chaque rendu (B16)
│   │
│   ├─ LigneDonnée variante `lecture`
│   │    "En retard depuis" →  6 jours       --font-chasse, --color-alerte-600
│   │    "Créance exigible depuis le" → 06/09  derivé du 6 du mois, pas tapé (B12)
│   │
│   ├─ [sur_titre] "CE QUI A ÉTÉ REÇU"        CONDITIONNEL
│   ├─ LigneDonnée × n  (reçus)
│   │    "Reçu le 3"        →  250,00 €
│   │    └─ Horodatage variante `a_confirmer`  "sur cet appareil · 03/09 · 18 h 04"
│   │       ou variante `source`  "confirmé par le serveur · 03/09 · 18 h 11"
│   ├─ Bouton secondaire "Enregistrer un reçu"  → /dossiers/:id/somme-due
│   │
│   ├─ [sur_titre] "ÉCART"                     CONDITIONNEL (E9)
│   ├─ LigneDonnée variante `lecture` sur --color-surface-sunken, 3 lignes
│   │    "214,00 € déclarés sur le compte, aucun reçu saisi.
│   │     Différence : 214,00 €.
│   │     Bailly ne rapproche rien : c'est une ligne à traiter."
│   │    Aucun bouton « Régler », aucun « Réessayer »
│   │
│   ├─ [sur_titre] "RELANCE"
│   ├─ LigneDonnée × 2
│   │    "Motif de la relance"  →  "Loyer et provisions de septembre non reçus."
│   │    "Preuve d'envoi"       →  CONDITIONNEL
│   │         "aucune"          + "Produite le" horodatage serveur + VignettePhoto 72 pt
│   ├─ Bouton lg "Relancer"
│   │      etat `impossible` hors-ligne, avec la phrase de B15 sous le bouton
│   │
│   └─ BandeauAlerte  variante `information`   CONDITIONNEL, hors-ligne
│        "Sans réseau, une relance ne part pas. Une relance produit une preuve
│         d'envoi, donc elle a besoin du réseau. Demain matin elle sera là."
│
└─ [action] Barre d'action de la feuille, 88 pt
     ├─ Bouton lg "Relancer"
     └─ [aide] la phrase de B15 quand le réseau manque
```

| # | Composant | Rôle | Source |
|---|---|---|---|
| 1 | `Feuille` | Le conteneur modal monté du bas | design-system § 3.15 |
| 2 | `LigneDonnée` | Rendre les sommes, les dates limites, les reçus et la preuve | design-system § 3.22 |
| 3 | `ChampMontant` | Saisir un reçu, ou refuser une catégorie hors périmètre | design-system § 3.11 |
| 4 | `Montant` | Afficher les sommes, jamais calculées en dur (B16) | design-system § 3.20 |
| 5 | `Horodatage` | Distinguer **sur cet appareil** de **confirmé par le serveur**, pour chaque reçu | design-system § 3.21 |
| 6 | `VignettePhoto` | Montrer la preuve d'envoi produite par le serveur | design-system § 3.27 |
| 7 | `Bouton` | Porter `Relancer` — **qui ne disparaît jamais** (B15) | design-system § 3.8 |
| 8 | `BandeauAlerte` | Dire la conséquence de l'absence de réseau, une fois | design-system § 3.24 |
| 9 | `MessageBref` | Confirmer un reçu enregistré, ou refuser | design-system § 3.25 |
| 10 | `Invite` | Rappeler que la date de relance est derivée, pas saisie | design-system § 3.30 |

---

## 4. États — tous, sans exception

| État | Déclencheur | Rendu | Feedback utilisateur |
|---|---|---|---|
| **Chargement** | Ouverture, lecture de la ligne du mois et des reçus | Les huit lignes en ossature à leur hauteur exacte — 44 pt pour les sommes, 64 pt pour la ligne d'écart, 72 pt pour la preuve. **Le bloc `RELANCE` est réservé** : s'il apparaît après le bouton, le bouton saute sous le pouce au pire moment | Aucun texte d'attente, aucun spinner. Le titre porte déjà le locataire |
| **Rempli** | La ligne du mois existe | Les quatre blocs rendus, avec les reçus et leur mot d'état, et la preuve d'envoi si elle existe | Aucun. La feuille **est** le feedback |
| **Vide — jamais visité** | La ligne du mois n'a jamais été saisie et le bail n'a pas de loyer | `Vide` variante `jamais_visite` : « Aucun loyer saisi pour ce dossier en septembre. Les montants viennent du bail. » + `Bouton primaire` `Saisir une somme due`. **Le bloc `RELANCE` n'est pas rendu** : sans somme due, il n'y a rien à relancer, et un bouton de relance sans montant serait un mensonge | `MessageBref` aucun. Le seul geste est `Saisir une somme due`, présent dans le vide **et** dans la barre d'action |
| **Vide — aucune donnée** | Le bail existe, le loyer est saisi, aucun reçu | La feuille est rendue en entier, et le bloc `CE QUI A ÉTÉ REÇU` rend `Vide` variante `aucune_donnee` : « Aucun reçu saisi pour septembre. Ce qui n'est pas saisi ici n'existe pas : Bailly ne rapproche rien tout seul. » **Cette phrase est la traduction directe de E9** | Aucun bouton dans le vide. Le geste est `Enregistrer un reçu`, juste en dessous |
| **Erreur de chargement** | La ligne du mois est illisible localement | `Vide` variante `erreur` + `BandeauAlerte` en variante `impossible` : « Impossible de lire l'encaissement de ce dossier. Rien n'est affiché — et ce n'est pas vide : on ne sait pas encore. » | **Aucun bouton « Réessayer »** : la reprise est automatique. Un `BandeauAlerte` en variante `information` — « La lecture se fera seule dès que le réseau revient. » **Afficher une somme due à zéro serait l'erreur la plus coûteuse de cette feuille** : un zéro quiere dire « rien n'est dû », et c'est faux |
| **Erreur de soumission** | Le reçu saisi ne correspond pas à la somme due, ou la relance a été refusée par le serveur | Erreur **au dos de la ligne**, pas dans un message bref global : « Reçu le 3 : 180,00 €, somme due 250,00 €. Différence 70,00 €. Une ligne à traiter, pas une erreur. » Pour une relance refusée : `MessageBref` variante `refus` « Aucune relance envoyée. » | Aucun dialogue modal, aucune secousse. **Un écart n'est pas une anomalie système** : c'est un fait que le propriétaire doit traiter, et l'écran le nomme comme tel |
| **Succès** | Un reçu est enregistré, ou une relance est produite | Pour le reçu : `MessageBref` variante `fait` — « Reçu enregistré **sur cet appareil**. Pas encore confirmé. » Pour la relance : **c'est le seul succès de Bailly qui produit une preuve**, donc la feuille fait autre chose qu'afficher un mot — **un nouveau bloc `Preuve d'envoi` apparaît** avec la date de production, l'horodatage serveur et la pièce jointe | Le bloc `Preuve d'envoi` **apparaît** et la ligne `Preuve d'envoi : aucune` **disparaît**. **Rien ne disparaît avant d'avoir sa remplaçante** |
| **Hors-ligne / permissions** | Mode avion, sous-sol, 4G absente | La feuille est rendue en entier. `Enregistrer un reçu` reste **actif**. `Relancer` passe en `impossible` — **il ne disparaît pas** — et porte sous lui la phrase de B15. Un `BandeauAlerte` en variante `information` reprend la conséquence une seule fois, en haut du bloc `RELANCE` | Le bouton est visiblement non pressable, son aide est écrite, et **rien d'autre n'est bloqué**. Bailly ne refuse qu'une seule chose dans tout le produit, et il le dit ici |
| **Lecture seule** | Écran verrouillé | Tous les champs passent en `lecture`, `Relancer` passe en `impossible` pour une **seconde raison** : « Déverrouille pour relancer. » Les deux aides ne se cumulent pas — c'est la raison la plus proche de l'action qui s'affiche | La barre d'action reste présente avec `Fermer` actif. **La feuille ne se ferme pas toute seule** |

---

## 5. Interactions

| Élément | Événement | Comportement | Feedback visuel | État résultant | ID |
|---|---|---|---|---|---|
| `Bouton lg "Relancer"` | tap | Ouvre la confirmation en ligne, puis **le serveur produit la relance et sa preuve**. L'appareil ne l'envoie pas : une preuve d'envoi est une trace serveur, donc c'est la seule action du produit dont l'envoi n'est pas fait par l'appareil (B15, roadmap § 2.2) | La feuille de confirmation s'ouvre, puis le bloc `Preuve d'envoi` apparaît avec la date et la pièce | Preuve d'envoi produite | B15, C11 |
| `Bouton lg "Relancer"`, hors-ligne | tap | **Rien.** Le bouton est en variante `impossible`, son aide est écrite, et le tap ne produit ni erreur, ni toast, ni vibration. **La relance n'est pas mise en file d'attente par l'appareil** : c'est le serveur qui l'envoie, donc une file locale ne pourrait rien garantir | Aucun retour élastique. Le mot du bouton ne change pas : il reste `Relancer`, pour que le propriétaire sache quoi faire demain matin | Aucune relance envoyée | B15 |
| Feuille de confirmation, touche retour | retour | Ferme la confirmation **sans rien envoyer**. Aucun dialogue de confirmation secondaire : le geste a été demandé une fois, la feuille de confirmation est cette demande | La feuille se rétracte | Aucune relance | B18 |
| `Bouton secondaire "Enregistrer un reçu"` | tap | Ouvre `/dossiers/:dossierId/somme-due`, à la section `CE QUI A ÉTÉ REÇU`, dossier **et mois pré-remplis** (B17) | La page se remplace | Formulaire de somme | US-3 |
| `LigneDonnée` « Reçu le 3 », appui long | appui long | Ouvre la `Feuille` du reçu : montant, date saisie, et les **deux horodatages distingués** — celui de la saisie et celui de la confirmation serveur | La feuille monte en 200 ms | Feuille de reçu | B1 |
| `LigneDonnée` « Créance exigible depuis le », appui long | appui long | Ouvre la `Feuille` de règle : « Le sixième jour du mois, une somme due non reçue passe en créance exigible. Cette date est dérivée de ton entrée, pas tapée. » | La feuille monte en 200 ms | Explication de la date | B12 |
| `LigneDonnée` de l'écart | tap | **Aucune action.** La ligne n'est pas une cible : c'est une information, et une cible sans action est un piège. Elle porte sa réponse — « Bailly ne rapproche rien : c'est une ligne à traiter » | Aucun | — | E9 |
| `VignettePhoto` de la preuve d'envoi, tap | tap | Ouvre la preuve en aperçu. **Elle est produite par le serveur**, donc son horodatage est celui du serveur et elle ne porte jamais l'état `a_confirmer` — **c'est la seule `VignettePhoto` du produit qui n'est jamais en attente** | Aucun fondu | Aperçu de la preuve | C11 |
| Bloc `Preuve d'envoi`, ligne « Produite le » | tap | Aucune action : c'est une trace, comme sur la fiche d'un fait | Aucun | — | C11 |
| `Bouton lg "Relancer"`, après une relance produite | tap | Le bouton reste visible mais devient `impossible` avec l'aide : « Une relance a déjà été produite le 12/09 · 19 h 12. Une deuxième relance pour le même mois, c'est toi qui décides — et elle sera datée. » **Bailly ne bloque pas une deuxième relance** : c'est un acte de gestion, pas un calcul | Le bouton ne disparaît pas | Deuxième relance possible, datée | B16 |
| Retour arrière | retour | Ferme la feuille. **Ne demande rien** et ne perd aucun reçu saisi | Aucun | Retour à l'encaissement | E11 |
| Clavier matériel entrant | — | Le clavier numérique s'ouvre au focus d'un `ChampMontant` et **n'écarte pas le champ** : le champ focalisé est toujours scrolls dans la zone visible | Défilement automatique de 200 ms | Champ visible | N3 |

- **Focus / clavier** : cinq focusables — les deux lignes de montant, `Enregistrer un reçu`,
  le champ de motif de relance, `Relancer`. **La ligne d'écart n'est pas focusable** : elle ne
  déclenche rien. La preuve d'envoi, une fois produite, ajoute une vignette focusable. Le
  clavier numérique **n'a pas de touche d'envoi** et le clavier matériel n'est pas
  intercepté : une faute de frappe sur `Entrée` ne doit pas lancer une relance, qui est
  un acte juridique.
- **Gestes** : **aucun geste porteur.** Pas de swipe pour relancer, pas de swipe pour
  marquer comme payé, pas de pull-to-refresh. Une relance est un acte juridique daté, donc
  elle ne se déclenche pas au doigt. Le glissement de `Feuille` ne fait que fermer.
- **Animations** : l'apparition du bloc `Preuve d'envoi` est en `--duration-normal`
  `--ease-out`, **et rien d'autre n'est animé**. Le mot d'état d'un reçu ne bouge pas : il
  change en place, parce qu'un mot d'état qui glisse est un mot d'état qu'on ne lit pas.
  `prefers-reduced-motion` met tout à 0 ms.
- **Retour arrière** : ferme la feuille, ne demande rien, ne perd aucun reçu saisi.

---

## 6. Responsive

| Breakpoint | Comportement | Ce qui se replie / disparaît |
|---|---|---|
| **Mobile** (0–479 px) | Le layout de référence. Feuillet à 85 % de la hauteur, blocs alignés à gauche, montants alignés à droite sur 88 pt, barre d'action de 88 pt **au-dessus du clavier** | Le bloc `ÉCART` passe sur 4 lignes sous 360 pt de large, donc la feuille grandit au lieu de tronquer. La ligne `Preuve d'envoi` passe son horodatage sur deux lignes |
| **Tablet** (480–899 px) | La feuille devient centrée, largeur 560 pt, hauteur automatique plafonnée à 85 %. Les blocs `CE QUI A ÉTÉ REÇU` et `RELANCE` passent en colonnes séparées | Rien. **Les mots, les montants et les états sont identiques** |
| **Desktop** (900 px et au-delà) | **Aucun rendu distinct.** Feuille centrée, navigation en bas. X11 exclut la version navigateur de bureau | Rien |

- **Cible tactile** : 52 pt pour les deux boutons, 44 pt pour la fermeture, et **44 pt de
  zone pour la ligne d'écart** — qui n'est pas pressable, donc sa zone n'est pas une cible
  et n'est pas comptée comme telle.
- **Débordement** : (1) Les montants ne débordent jamais : largeur minimale de 88 pt en
      chiffres tabulaires, et un montant de plus de sept chiffres passe en `Montant` variante
      `secondaire` sur une deuxième ligne — **jamais** abrégé en `1,2 k`, parce qu'un montant
      abrégé est un montant qu'on a mal lu. (2) Le bloc `ÉCART` **ne tronque jamais** : il
      passe sur plus de lignes. (3) La preuve d'envoi tient sur sa ligne horodatage + 72 pt
      de vignette, sans jamais rétrécir la vignette.
- **Ce qui ne déborde jamais** : l'horodatage de la preuve d'envoi. Il est celui du serveur,
      en `JJ/MM · HH h mm`, et il **n'est jamais abrégé** : une preuve d'envoi sans sa date
      complète n'est pas opposable (C11).

---

## 7. Accessibilité

- [ ] **Contraste du texte courant** — mesuré par `design-check contrast`, qui applique
      4,5:1 à chaque encre contre les huit surfaces de son `on:`, dont
      `--color-surface-sunken` (la ligne d'écart) et `--color-surface-raised` (la barre
      d'action, en `--color-texte-inverse`). **Aucun ratio n'est écrit ici.**
- [ ] **Contraste des grands textes** — le montant dû est en `--text-body-fort` 17 px 600,
      donc mesuré à 4,5:1. Il n'utilise pas l'exception des grands caractères : **un montant
      lu de travers est de l'argent lu de travers.**
- [ ] **Navigation clavier complète** — sur clavier externe et sur tous les breakpoints. Le
      bouton `Relancer` en état `impossible` reste **focusable** avec
      `aria-disabled="true"` et son `aria-describedby` pointe vers la phrase qui explique
      pourquoi. Un bouton désactivé qu'on ne peut pas atteindre ne peut pas être lu, donc on
      ne sait pas pourquoi il ne marche pas.
- [ ] **Focus visible** — anneau `--color-bordure-focus` de 2 px avec 2 px de fond entre
      l'anneau et le composant. Le filet de la ligne d'écart ne change pas au focus : il
      porte l'information, pas la position.
- [ ] **ARIA** — la feuille est un `role="dialog"` dont le `aria-label` est « Encaissement de
      Breguet, 4e, septembre 2026 ». Le bloc `RELANCE` est un `role="region"` avec
      `aria-label` « Relance ». **La preuve d'envoi porte un `role="status"`** : quand elle
      apparaît, elle est annoncée **sans interrompre** la lecture. Le champ de motif porte
      `aria-required="true"` s'il est requis par la configuration du dossier, et son refus
      est annoncé par `aria-describedby`.
- [ ] **Alternative textuelle** — la `VignettePhoto` de la preuve d'envoi porte un `alt`
      décrivant **l'état et non l'image** : « Preuve d'envoi du 12 septembre, confirmée par
      le serveur à 19 h 12. » **C'est la seule `VignettePhoto` du produit qui porte
      `Confirmée` d'entrée**, parce que la preuve d'envoi est produite par le serveur et
      n'est jamais en attente. Un `alt` de type « capture d'écran d'un SMS » serait une
      description, pas l'information dont l'utilisateur a besoin : **quand et par qui**.
- [ ] **Langue et direction de lecture** — `lang="fr-FR"`, gauche à droite, euros en
      suffixe, dates `JJ/MM/AAAA` et heures `HH h mm`. Le mois est écrit en toutes lettres.
      La formule de la relance est en langage de téléphone : « Loyer et provisions de
      septembre non reçus. » — **pas** « Objet : régularisation de loyer ».

---

## 8. Données

| Champ | Type | Origine | Requis | Erreur possible |
|---|---|---|---|---|
| `mois` | `Mois AAAA` | **horloge du projet injectée** | oui | Horloge non branchée : le mois affiché porte une mention explicite. Sans elle, le test de démonstration du 6 du mois ne vaudrait rien |
| `somme_due` | montant | reprise du bail, **jamais calculée** (B16) | oui | Non saisie : `Montant` variante `manquant`, un tiret et « pas saisi ». **Jamais 0,00 €** |
| `somme_recue` | montant | saisie locale, **une par reçu** | non | Non saisie : l'absence **est** l'information de l'état `impaye` |
| `date_reception` | date `JJ/MM/AAAA` | **saisie**, pas celle de l'appareil | oui | Future : refusée au champ |
| `jours_retard` | entier en jours | différence entre la date attendue et la réception | non | Avant le 6 du mois : non rendu, **pas calculé** |
| `date_creance_exigible` | date `JJ/MM/AAAA` | **dérivée du 6 du mois**, jamais saisie | oui | Dérivation non branchée : la date n'est pas affichée et l'écran le dit |
| `ecart` | paire de montants, jamais rapprochée | comparaison déclarée / reçu | non | **Une ligne à traiter, pas une anomalie.** Aucun rapprochement, aucun bouton |
| `motif_relance` | chaîne, **texte libre → classe demandée** (B8) | saisie locale | oui | Vide : refusé au champ. Un motif en appréciation **ne sort jamais d'un export**, et la classe est demandée ici aussi |
| `relance_envoyee` | booléen | **serveur seul** | oui | Hors-ligne : `false`, et le bouton passe en `impossible` avec sa raison |
| `preuve_envoi` | horodatage serveur + référence + fichier | **produite par le serveur**, jamais par l'appareil (B15) | non | Non produite : la ligne porte `aucune` et « pas encore produite », **jamais un tiret** — parce qu'une preuve absente est une relance non envoyée, et c'est le mot qui compte |
| `etat_envoi_reçu` | `a_envoyer` / `rien_a_confirmer` | local d'abord (C2) | oui | Échec : aucun bouton « Réessayer », la reprise est automatique |

- **Chargement** : tout d'un bloc, sans pagination. Une ligne de mois pour un dossier : il n'y
  a rien à charger par pages.
- **Cache / hors-ligne** : la feuille s'affiche **entièrement** hors-ligne (N2, C9), et
  `Enregistrer un reçu` reste actif. **La seule action qui change est `Relancer`**, et elle
  ne disparaît pas : elle passe en `impossible` avec sa raison écrite, parce que
  « rien à faire » et « à faire demain » sont deux informations différentes et l'écran doit
  pouvoir les dire toutes les deux.
- **Données sensibles** : montants, dates de paiement et preuve d'envoi sont des
  **pièces comptables** au sens de B9 : **non effaçables**, conservées jusqu'à une date de
  fin écrite, et exportables avec le dossier du locataire. Le motif de la relance est un
  texte libre et **demande sa classe** : un jugement écrit dans un motif de relance ne peut
  pas finir exporté comme un fait (B7, B8). **Aucun service bancaire, aucune API de
  paiement, aucun envoi à un tiers** (N8) : la saisie est manuelle, c'est la seule forme que
  le PRD connaît, et c'est aussi la seule qui ne fasse sortir aucune donnée personnelle de
  chez l'hébergeur.

---

## 9. Traçabilité

| ID | Origine | Manifestation sur cet écran |
|---|---|---|
| **B1** | PRD | Chaque reçu porte **deux horodatages distingués** : celui de la saisie, sur cet appareil, et celui de la confirmation serveur. Tant que le second manque, l'état est `Pas encore confirmé` |
| **B2** | PRD | Le `MessageBref` porte le mot du téléphone : « Pas encore confirmé. » Et la preuve d'envoi ne s'affiche qu'après production, jamais avant |
| **B6** | PRD | Le compteur de synchronisation est présent sur cet écran comme sur les autres, et ne se masque pas quand le mois est entièrement saisi |
| **B7** | PRD | Le motif de la relance est un texte libre et **demande sa classe**. C'est le seul champ de la feuille, donc c'est le seul endroit où la règle B7 s'applique — et elle s'y applique |
| **B9** | PRD | Les montants et la preuve d'envoi sont des pièces comptables : **non effaçables**, conservées jusqu'à une date de fin écrite. Aucun bouton d'effacement n'existe sur cette feuille |
| **B15** | PRD | `Relancer` passe en `impossible` hors-ligne, **sans disparaître**, et porte la phrase : « Une relance produit une preuve d'envoi. Sans réseau, elle n'est pas envoyée, et tu la verras demain matin. » **C'est la seule action que Bailly refuse dans tout le produit, donc c'est la seule qui doit être expliquée mot pour mot** |
| **B16** | PRD | Aucun montant n'est calculé par l'application. Le total dû est **une somme affichée, recalculée à chaque rendu, jamais stockée**. La date de créance exigible est **dérivée du 6**, pas tapée. Une deuxième relance pour le même mois n'est pas bloquée : c'est un acte de gestion, pas un calcul |
| **B17** | PRD | `Enregistrer un reçu` ouvre le formulaire avec dossier **et mois pré-remplis** depuis cette feuille, donc le montant n'est saisi qu'à un seul endroit |
| **B18** | PRD | Aucune action d'effacement. La feuille de confirmation d'une relance est **le** dialogue, et il n'y en a pas de second : le geste a été demandé une fois |
| **C2** | PRD | Les reçus sont écrits localement d'abord. **La relance est la seule écriture dont l'envoi n'est pas fait par l'appareil** — parce que sa preuve d'envoi est une trace serveur, donc c'est le serveur qui l'envoie |
| **C4** | PRD | Barre d'action de 88 pt au-dessus du clavier, boutons à 52 pt, dans la zone du pouce |
| **C6** | PRD | Les montants et la preuve d'envoi sont des données personnelles non effaçables. Rien n'est journalisé, rien n'est envoyé à un tiers, et aucun service bancaire n'est appelé |
| **C9** | PRD | Hors-ligne, tout fonctionne **sauf la relance**, et l'écran le dit. C'est la seule exception du produit, elle est donc écrite, et elle est écrite **une fois** en haut du bloc plutôt qu'à chaque ligne |
| **C11** | PRD | La preuve d'envoi porte son horodatage de production, **celui du serveur**, affiché en `JJ/MM · HH h mm` complet. L'application le dit, et ne l'affiche jamais abrégé |
| **N1** | PRD | L'enregistrement d'un reçu est local et instantané. **Le seul délai — celui de la relance — est produit explicitement par le bouton `Relancer`**, jamais aguardé passivement, parce qu'une attente sans borne n'est pas une attente |
| **N3** | PRD | 52 pt pour les deux boutons, 44 pt pour la fermeture, 44 pt de zone pour la ligne d'écart qui n'est pas pressable |
| **N4** | PRD | Corps à 17 px, montants en chasse fixe, ligne d'écart à 14 px — la taille la plus basse du produit, parce qu'elle porte l'information la moins urgente et la plus longue |
| **N5** | PRD | Tailles en `rem` suivant le réglage du téléphone, plafonné à ×1,3 : les montants passent à 22 px, la feuille s'allonge, et **aucun montant n'est abrégé** |
| **E1** | PRD | Le réseau tombe pendant l'enregistrement d'un reçu : le reçu est **local**, la feuille reste lisible, et le mot d'état `Pas encore confirmé` apparaît sur le reçu lui-même. Aucun bouton « Réessayer » |
| **E9** | PRD | Le bloc `ÉCART` montre les deux montants et leur différence, avec la phrase « Bailly ne rapproche rien : c'est une ligne à traiter », et **aucun bouton de rapprochement ni de correction automatique**. La ligne n'est pas non plus focusable : une cible sans action est un piège |
| **E11** | PRD | Un reçu saisi à moitié reste saisissable et visible sur la feuille, avec son mot d'état. Le retour arrière ferme sans rien perdre et **sans demander confirmation** |

---

## 10. Checklist de gate

- [x] Les 9 états sont décrits avec un rendu concret et des **libellés écrits**.
- [x] `Relancer` **ne disparaît jamais** : il passe en `impossible` et porte la raison de B15
      sous lui. « Rien à faire » et « à faire demain » sont deux informations, et l'écran doit
      pouvoir les dire toutes les deux.
- [x] Une preuve d'envoi absente porte le mot `aucune` et `pas encore produite`, jamais un
      tiret : une preuve absente est une relance non envoyée.
- [x] La ligne d'écart n'a **aucun bouton** et n'est **pas focusable** : c'est une
      information, pas une cible.
- [x] Aucun « Réessayer », aucun « Régler », aucun « Corriger automatiquement ».
- [x] Chaque élément interactif a un comportement, un feedback et un état résultant.
- [x] Le responsive est défini aux trois breakpoints, avec la règle « la feuille grandit au
      lieu de tronquer » explicite.
- [x] La section Anti-générique est cochée et justifiée avec les valeurs réelles.
- [x] Aucune valeur de design n'est laissée à « à définir ».
- [x] **Aucun ratio de contraste écrit à côté d'une valeur.**
- [x] Chaque ID `B*`, `E*`, `C*` et `N*` de l'écran apparaît en § 9.
- [x] `node "$FORGE/scripts/forge-guard.js" placeholders <anchor>` ne signale rien ici.
- [x] L'écran reste cohérent avec `.forge/design/design-system.md`.
