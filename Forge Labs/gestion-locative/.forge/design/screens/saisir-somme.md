---
type: screen
slug: saisir-somme
title: Enregistrer une somme due
module: saisir
status: draft
generated_at: 2026-09-30
derived_from:
  - .forge/prd.md
  - .forge/design/design-system.md
rule_ids: [B1, B2, B4, B7, B8, B15, B16, B17, C2, C4, C9, N1, N3, N4, N5]
edge_case_ids: [E4, E6, E7, E11]
flow: encaissement-mensuel
---

# Écran — Enregistrer une somme due

> Ce document est la **source de vérité** pour qu'une IA génère l'interface de cet écran.
> Il est généré depuis le gabarit, jamais recopié. Aucun `{{PLACEHOLDER}}` ne doit subsister.

---

## 1. Rôle de l'écran

| | |
|---|---|
| **Archétype d'app** | `mobile_field_ops` (principal), `rental_tenancy` (secondaire) |
| **Module** | `saisir` — rang 2, sous-écran |
| **Route** | `/dossiers/:dossierId/somme-due` |
| **Type** | page |
| **Utilisateurs** | Le propriétaire, seul utilisateur (C3) |
| **User stories servies** | US-3 |
| **Règles métier** | B1, B2, B4, B7, B8, B15, B16, B17, C2, C4, C9, N1, N3, N4, N5 |
| **Edge cases** | E4, E6, E7, E11 |

**Une phrase** : cet écran permet au propriétaire d'enregistrer **ce qui est dû** et
**ce qui a été reçu**, en lui refusant explicitement toute autre catégorie de somme.

**Pourquoi il est au rang 2 de la navigation** : US-3 est la moitié de la boucle
quotidienne, et une somme due non enregistrée fausse l'encaissement du mois entier. Il est
néanmoins un **écran distinct** de `saisir` : « fait daté » et « somme due » sont deux objets
différents, avec deux règles différentes — un fait porte une **classe**, une somme porte une
**catégorie** — et les confondre dans un seul formulaire obligerait à demander une classe à
un montant, ce qui n'a pas de sens.

**La frontière de périmètre, écrite** : Bailly n'enregistre que **le loyer** et **les
provisions sur charges**. Tout le reste est refusé avec une phrase. Ce n'est pas une
limitation technique, c'est la frontière posée par la roadmap § 2.2 — « le produit refusera
de la saisir, ce qui est la bonne failure ».

---

## 2. Direction visuelle de cet écran

| | |
|---|---|
| **Mood** | opérationnelle, parlante, sans alarme |
| **Densité** | **dense** — deux montants et deux actions tiennent en 320 pt de haut. Un formulaire de dix champs serait une page de gestion locative, et ce n'est pas ce produit |
| **Niveau de contraste** | **fort** — un montant mal saisi est de l'argent perdu, et il doit se lire au premier coup d'œil |
| **Traitement photographique** | **AUCUN.** Un montant n'a pas de photo, et le reçu du locataire, s'il existe, est une pièce jointe d'un fait, pas de cette page |
| **Référence** | le ticket de caisse et la ligne d'imputation d'un relevé bancaire : **deux montants, deux actions, une catégorie par montant** |

**Les valeurs portées par cet écran**

| Rôle | Token | Valeur |
|---|---|---|
| Fond de l'application | `--color-background` | `#101319` |
| Surface des lignes | `--color-surface` | `#171B22` |
| Champ de saisie | `--color-surface-sunken` | `#0A0C10` |
| Barre d'action | `--color-surface-raised` | `#212630` |
| Encre de lecture, montant | `--color-texte-principal` | `#E8ECF3` |
| Encre secondaire, étiquette | `--color-texte-secondaire` | `#A6B0C0` |
| Ambre — « sur cet appareil », segment choisi | `--color-primaire-600` | `#E0A23A` |
| Terre cuite — catégorie refusée | `--color-alerte-600` | `#F09286` |
| Contour de champ | `--color-bordure-champ` | `#7C8695` |

| | |
|---|---|
| **Surface** | `--color-surface` `#171B22` sur `--color-background` `#101319` |
| **Accent utilisé** | `--color-primaire-600` `#E0A23A` — le segment choisi de la catégorie, le `€` du champ focalisé, le bouton `Enregistrer`. Il ne sert **jamais** à souligner un montant : un montant souligné est un montant qu'on ne lit plus |

### 2.1 Anti-générique — obligatoire

- [x] **Pas de fond blanc pur `#FFFFFF`.** Fond `#101319`, choisi, justifié.
- [x] **Pas de carte ombrée pour tout.** Deux blocs, séparés par un `--space-2xl` et un
      sur-titre. **Aucun des deux n'a de fond propre ni de rayon** : ce sont des sections,
      pas des cartes.
- [x] **Pas d'uniformité.** Le montant est en `--text-body-fort` 17 px 600 en chasse fixe
      aligné à droite sur 72 pt ; l'étiquette de catégorie est en `--text-overline` 13 px
      600 interlettré ; le refus est en 14 px. Le montant est **le seul gros chiffre** de
      l'écran, et c'est le seul qui doit être gros.
- [x] **Pas de gris neutre générique.** Le `€` du champ focalisé passe en
      `--color-primaire-600`, et le segment choisi se remplit de la même teinte : le focus et
      la sélection partagent une couleur, ce qui évite d'avoir deux teintes d'accent.
- [x] **Pas de mise en page centrée symétrique.** Formulaire aligné à gauche, pleine largeur
      moins `--space-lg` de chaque côté.
- [x] **Pas d'illustration d'appoint générique.** Aucun glyphe décoratif, aucun pictogramme
      de catégorie. Les deux catégories sont des **mots** dans des segments.
- [x] **Pas d'une seule famille de police.** `--font-chasse` à chiffres tabulaires pour les
      deux montants : sans elle, « 1 284 » et « 214 » n'ont pas la même largeur et les deux
      colonnes se désalignent.

**Choix assumé et non neutre** : **Bailly refuse une catégorie de somme, et le refus est
écrit.** Le `GroupeSegmenté` n'offre que deux valeurs — `Loyer` et `Provisions sur
charges` — et **aucune autre n'est offered, même provisoirement**. Un champ « Montant »
avec un menu déroulant de huit catégories serait le produit d'un logiciel qui veut tout
enregistrer ; celui-ci affiche deux, et son aide dit pourquoi c'est deux : « Bailly
n'enregistre que le loyer et les provisions. Une régularisation des charges se calcule à la
main, et une quittance se fait à la main. Ce n'est pas un oubli. » C'est la seule fois que
Bailly écrit « ce n'est pas un oubli » à l'écran, et c'est précisément parce que c'est la
seule place où un utilisateur pourrait le croire.

---

## 3. Anatomie

```
TitreÉcran  variante `feuille`
├─ [retour] Bouton 44 pt
├─ [titre] "Somme due · Courges, 3e"
└─ [etat_ecriture] mot d'état ambre si écriture locale non confirmée
        │
        ▼
ListePlate  variante `groupee`
├─ [sur_titre] "CE QUI EST DÛ POUR SEPTEMBRE"
├─ LigneDonnée × 2
│   ├─ ChampMontant variante `somme_due`  "Loyer"               → 214,00 €
│   └─ ChampMontant variante `somme_due`  "Provisions"          →  36,00 €
├─ LigneDonnée variante `lecture`          --color-bordure-champ
│    "Loyer du bail"  →  214,00 €           valeur saisie une fois, recopiée
├─ LigneDonnée variante `lecture`
│    "Total dû"       →  250,00 €           --color-texte-principal, PAS un calcul :
│                                          une somme affichée, jamais un calcul métier
├─ [sur_titre] "CE QUI A ÉTÉ REÇU POUR SEPTEMBRE"
├─ LigneDonnée × 2
│   ├─ ChampMontant variante `somme_recue` "Reçu le 3"           →   0,00 €
│   │      ligne du dessus : rappel du total dû
│   └─ ChampMontant variante `somme_recue` "Reçu le 11"          →   0,00 €
├─ ChampMontant variante `somme_recue`  "Autre reçu"  → vide
│      étiquette : "La date est celle que tu saisis, pas celle de la banque"
├─ [sur_titre] "CE QUE CETTE PAGE NE PEUT PAS FAIRE"
└─ LigneDonnée × 2   (lecture, filet fin)
     ├─ "Affecter un reçu à un mois"   → "— non fait"
     └─ "Rapprocher un écart"          → "— non fait"   (E9)
        │
        ▼  --space-3xl
BarreAction  variante `secondaire`
├─ [action_principale] Bouton lg "Enregistrer"
└─ [action_secondaire] Bouton md "Voir le mois"       → /encaissement
```

| # | Composant | Rôle | Source |
|---|---|---|---|
| 1 | `TitreÉcran` | Nommer le dossier et porter le mot d'état d'écriture | design-system § 3.18 |
| 2 | `ListePlate` | Contenir les trois blocs sans carte | design-system § 3.23 |
| 3 | `LigneDonnée` | Rendre un champ, et une valeur reprise du bail en lecture | design-system § 3.22 |
| 4 | `ChampMontant` | Saisir un montant, et **refuser** une catégorie hors périmètre | design-system § 3.11 |
| 5 | `Montant` | Afficher le total dû comme une **somme affichée**, jamais un calcul | design-system § 3.20 |
| 6 | `BandeauAlerte` | Écrire la raison du refus de catégorie, une fois, pas à chaque frappe | design-system § 3.24 |
| 7 | `BandeauSynchronisation` | Dire où en sont les écritures de cette page | design-system § 3.1 |
| 8 | `MessageBref` | Confirmer l'enregistrement local, ou refuser | design-system § 3.25 |
| 9 | `BarreAction` | Porter `Enregistrer` dans la portée du pouce | design-system § 3.16 |

---

## 4. États — tous, sans exception

| État | Déclencheur | Rendu | Feedback utilisateur |
|---|---|---|---|
| **Chargement** | Ouverture, lecture du bail local pour rappeler le loyer | Les cinq lignes de montant en ossature, à **44 pt**, et le montant du bail en chasse fixe à 20 pt. **Le champ du loyer n'est jamais pré-rempli avant que la lecture soit finie** : pré-remplir puis corriger est un taux d'erreur non nul, et un taux d'erreur sur un loyer est de l'argent | Aucun texte d'attente. Le clavier ne monte pas : cette page n'a qu'un champ par ligne et le propriétaire tape dedans quand il le choisit |
| **Rempli** | Le bail existe et le mois est à saisir | Les trois blocs rendus, le loyer du bail rappelé en lecture, et le total dû affiché comme une **somme** | Aucun. Le total ne bouge pas tout seul d'une manière spectaculaire : il change en place quand un montant change |
| **Vide — jamais visité** | Le mois n'a jamais été saisi pour ce dossier | Les six champs vides, les deux segments de catégorie **présélectionnés sur `Loyer`** — **et c'est la seule présélection du produit** : la catégorie par défaut d'un montant est le loyer, parce que c'est le seul montant que ce bail produit par défaut, et parce que la catégorie ne change pas la donnée exportable, seulement sa nature. Le reste est vide et le dit | Le bouton `Enregistrer` est actif : un montant vide est un montant absent, et un montant absent est une information |
| **Vide — aucune donnée** | Aucun montant saisi pour ce mois, et le bail n'a pas de loyer | Le bloc `CE QUI EST DÛ` est rendu avec deux champs vides, et le champ `Loyer du bail` en variante `lecture` affiche un tiret et la mention « pas saisi au bail ». **Un tiret, pas 0,00 €** : le bail ne dit pas que le loyer est zéro, il dit qu'il n'est pas écrit | `Invite` en variante `permanente` sous le champ : « Le loyer vient du bail. Saisis-le une fois dans le bail, et toutes les sommes suivantes le reprennent. » |
| **Erreur de chargement** | Le bail local est illisible | Le champ `Loyer du bail` rend une `Invite` en variante `de_securite` : « Le bail n'a pas pu être lu sur cet appareil. Tu peux saisir les sommes quand même — mais Bailly ne les rapprochera d'aucun montant de référence tant qu'il n'a pas le bail. » **Le formulaire reste entièrement utilisable** | Aucun bouton « Réessayer ». Le seul geste offert est un `BandeauAlerte` en variante `information` : « La lecture se fera seule dès que le réseau revient. » |
| **Erreur de soumission** | Le montant n'est pas un nombre, ou il est négatif, ou il est hors de la plage permise | Erreur **au champ** : contour 2 px `--color-alerte-600`, message sous le champ qui dit la correction et non l'échec — « Ce n'est pas un montant. Écris 214 ou 214,50. » ou « Un montant reçu ne peut pas être négatif. » **Aucun dialogue modal, aucun toast** | Le focus reste sur le champ fautif. La saisie des autres champs n'est pas bloquée : une seule erreur ne bloque pas tout le formulaire |
| **Succès** | Les sommes sont écrites localement | `MessageBref` variante `fait` : « Sommes enregistrées **sur cet appareil**. Pas encore confirmées. » Il ne dit jamais « enregistrées » seul, et il ne dit pas « calculées » : Bailly **affiche** une somme, il ne la **calcule** pas (B16) | Le mot d'état `a_envoyer` apparaît au titre de l'écran, et la ligne correspondante de `/encaissement` passe en état `saisie_partielle` ou `paye` |
| **Hors-ligne / permissions** | Mode avion, travail de fond sans réseau | **La page est identique.** Tous les champs sont modifiables, le bouton `Enregistrer` est actif, et un `BandeauAlerte` en variante `information` apparaît : « Hors-ligne. Ces sommes restent sur cet appareil et partent seules dès que le réseau revient. » | Aucun bouton désactivé, aucune erreur. **La saisie de sommes est le cas normal, pas un mode dégradé** — la seule chose que Bailly refuse hors-ligne est la relance (B15) |
| **Lecture seule** | Écran verrouillé | Tous les champs passent en variante `lecture`, les segments de catégorie ne sont pas pressables, et le bouton `Enregistrer` est `impossible` avec l'aide « Déverrouille pour enregistrer ces sommes. » **La barre d'action reste présente** | Le bouton est visiblement non pressable et son aide dit pourquoi |

---

## 5. Interactions

| Élément | Événement | Comportement | Feedback visuel | État résultant | ID |
|---|---|---|---|---|---|
| `ChampMontant` « Loyer », saisie | saisie | Accepte un nombre, formate avec la virgule décimale, aligne à droite en chiffres tabulaires. **Aucune conversion, aucun calcul, aucune proposition** : si le propriétaire saisit `214,50`, l'écran affiche `214,50 €` et c'est tout | Le champ se remplit, le total se met à jour **en place, sans animation** | Montant saisi, total recalculé par somme affichée | B16 |
| `ChampMontant` « Provisions », saisie | saisie | Idem. Les provisions sont une **saisie**, pas un pourcentage du loyer : un taux appliqué par l'application serait un calcul métier non validé (B16, X2) | Idem | Montant saisi | B16 |
| `ChampMontant` « Reçu le … », saisie | saisie | La date est **celle que le propriétaire saisit**, pas celle de l'appareil : un virement du 3 peut être saisi le 5. Le champ le dit sous son étiquette | Aucun | Reçu saisi | B16 |
| `ChampMontant`, saisie d'une catégorie hors périmètre | saisie | **Impossible à saisir** : le sélecteur n'offre que deux valeurs. Le cas « autre » passe par le champ `Autre reçu`, qui a sa propre étiquette et **sa propre ligne dans le bloc `CE QUE CETTE PAGE NE PEUT PAS FAIRE`** | Le `BandeauAlerte` d'explication est déjà affiché, avant même la tentative | Aucune saisie refusée par surprise : **le refus est annoncé en permanence**, il n'est pas une erreur de frappe | B16, X2 |
| Ligne `Loyer du bail`, appui long | appui long | Ouvre la `Feuille` du bail, sur la ligne du loyer, en lecture | La feuille monte en 200 ms | Fiche du bail | B17 |
| Ligne `Loyer du bail` | tap | Aucune action de modification : **le loyer se saisit dans le bail, pas ici**. Le renvoyer à sa source est ce qui garantit B12 et B17 — un montant saisi à deux endroits diverge, et personne ne saura lequel a raison | Aucun | — | B17 |
| Ligne `Rapprocher un écart` | tap | **Aucune action, et ce n'est pas une ligne morte** : elle porte la réponse. « Bailly ne rapproche rien. Un écart est une ligne à traiter, pas une anomalie système. » C'est E9 écrit dans l'interface, parce que l'écart de paiement est le cas limite que le commanditaire a nommé et qu'un produit qui ne le fait pas doit le dire | Aucun | — | E9 |
| `Bouton lg "Enregistrer"` | tap | Écrit localement **d'abord**, puis envoie. **L'écriture est partielle et légale** : enregistrer avec deux montants vides et deux renseignés est un enregistrement valide, et c'est ce qui rend E11 possible | `MessageBref` 4 s | Sommes locales, mot d'état `a_envoyer` | B1, C2, E11 |
| `Bouton lg "Enregistrer"`, aucun montant saisi | tap | L'enregistrement est **valide et sans effet** : il crée une somme due à `Montant` en variante `manquant`, soit un tiret. Il n'y a pas d'erreur, parce qu'un mois non saisi n'est pas une faute | `MessageBref` variante `info` : « Rien à enregistrer pour ce mois. » | Aucune somme écrite | E11 |
| `Bouton md "Voir le mois"` | tap | Ouvre `/encaissement`, positionné sur ce dossier et sur le mois courant | Aucun fondu | Écran d'encaissement | US-5 |
| Retour arrière | retour | Conserve toute saisie non enregistrée, et la rend visible par le mot d'état au retour | Aucun | Saisie conservée | E11 |
| Glissement de feuille / clavier matériel entrant | — | Le clavier numérique s'ouvre au focus d'un `ChampMontant` et **n'écarte pas le champ** : le champ focalisé est toujours scrolls dans la zone visible, au-dessus du clavier | Défilement automatique de 200 ms | Champ visible | N3 |

- **Focus / clavier** : six focusables — deux montants dus, deux montants reçus, un montant
  autre, un bouton. Les segments de catégorie sont un `role="radiogroup"`, les flèches
  changent la sélection. **Le clavier numérique ne comporte pas de touche d'envoi** et le
  clavier matériel n'est pas intercepté : une faute de frappe sur `Entrée` dans un couloir ne
  doit pas enregistrer une somme.
- **Gestes** : **aucun geste porteur.** Pas de swipe pour dupliquer un montant d'un mois à
  l'autre, pas de pincer pour ajuster. Le glissement de `Feuille` ne fait que fermer. Un
  montant modifié au doigt pendant qu'on marche est un montant faux.
- **Animations** : **le total ne bouge pas de façon spectaculaire.** Il change en place, sans
  compteur animé, sans défilement, sans clignotement. Un total qui défile est un total qu'on
  n'arrive pas à lire pendant qu'il bouge, et un total lu de travers est de l'argent lu de
  travers. Les transitions de segment et de message bref sont en `--duration-normal`.
  `prefers-reduced-motion` met tout à 0 ms.
- **Retour arrière** : conserve la saisie, ne demande rien.

---

## 6. Responsive

| Breakpoint | Comportement | Ce qui se replie / disparaît |
|---|---|---|
| **Mobile** (0–479 px) | Le layout de référence. Champs pleine largeur moins `--space-lg` de chaque côté, montants alignés à droite sur 72 pt, barre d'action de 88 pt **au-dessus du clavier** | Le bloc `CE QUE CETTE PAGE NE PEUT PAS FAIRE` passe **après** la barre d'action, en pied de page, quand la hauteur manque : c'est une information de contexte, pas une action |
| **Tablet** (480–899 px) | Deux colonnes : `CE QUI EST DÛ` et `CE QUI A ÉTÉ REÇU` côte à côte, `CE QUE CETTE PAGE NE PEUT PAS FAIRE` en pleine largeur dessous. Conteneur centré de 560 pt | Rien. Les mots, les montants et les catégories sont **identiques** |
| **Desktop** (900 px et au-delà) | **Aucun rendu distinct.** Colonne centrée de 720 pt, navigation en bas. X11 exclut la version navigateur de bureau | Rien |

- **Cible tactile** : 52 pt pour les six champs, `Enregistrer` et `Voir le mois`. Le clavier
  numérique a ses propres cibles, hors de la main du produit.
- **Débordement** : (1) Les montants ne débordent jamais : largeur minimale de 72 pt en
      chiffres tabulaires, et un montant de plus de sept chiffres passe en scientific **non** —
      il passe en `Montant` variante `secondaire` sur une deuxième ligne, **jamais** en
      `1,2 M` ni en `2,4 k`, parce qu'un montant abrégé est un montant lu de travers.
      (2) L'étiquette `Provisions sur charges` passe sur deux lignes sous 320 pt, et la
      ligne passe de 44 à 60 pt. (3) Le bloc du refus n'est **jamais** tronqué : il est
      lisible en entier, parce que c'est la phrase qui explique une limite du produit.
- **Ce qui ne déborde jamais** : le format de date du reçu. `JJ/MM/AAAA` complet, en chasse
      fixe, sur une colonne de 88 pt.

---

## 7. Accessibilité

- [ ] **Contraste du texte courant** — mesuré par `design-check contrast`, qui applique
      4,5:1 à chaque encre contre les huit surfaces de son `on:`, dont
      `--color-surface-sunken` (le champ) et `--color-surface-raised` (le segment choisi, en
      `--color-texte-inverse`). **Aucun ratio n'est écrit ici.**
- [ ] **Contraste des grands textes** — il n'y en a pas sur cet écran : le montant est en
      `--text-body-fort`, donc mesuré à 4,5:1 comme le reste. **Le montant n'est pas
      volontairement « grand »** : c'est 17 px 600 en chasse fixe, et sa lisibilité vient de
      la chasse fixe et de l'alignement, pas d'une taille supérieure. Un montant en 24 px
      ferait de l'encaissement un écran de présentation.
- [ ] **Navigation clavier complète** — sur clavier externe et sur tous les breakpoints.
      Ordre : loyer → provisions → reçu 1 → reçu 2 → autre reçu → boutons. Les segments de
      catégorie sont un `role="radiogroup"` traversé aux flèches.
- [ ] **Focus visible** — anneau `--color-bordure-focus` de 2 px avec 2 px de fond entre
      l'anneau et le champ. Le focus ne change **jamais** la couleur du montant : un montant
      qui change de couleur au focus semble avoir changé de valeur.
- [ ] **ARIA** — chaque `ChampMontant` porte un `aria-label` complet : « Loyer, euros,
      champ numérique ». Le montant du bail en lecture porte `aria-readonly="true"` et son
      `aria-describedby` pointe vers « Cette valeur vient du bail et se modifie dans le
      bail. » Les deux lignes du bloc « ce que cette page ne peut pas faire » sont des
      `role="note"`, lues au même niveau que le reste, et non décoratives.
- [ ] **Alternative textuelle** — **aucune image sur cet écran**, donc aucune alternative
      n'est nécessaire. Les montants sont du texte en chasse fixe, donc ils sont lus
      caractère par caractère par un lecteur d'écran, avec le `€` annoncé comme « euros ».
- [ ] **Langue et direction de lecture** — `lang="fr-FR"`, gauche à droite, euros toujours
      en suffixe, dates `JJ/MM/AAAA`. La virgule est la **virgule décimale** et le point est
      le séparateur de milliers : c'est la convention française, et un montant lu à voix
      haute par un propriétaire lyonnais doit sonner juste.

---

## 8. Données

| Champ | Type | Origine | Requis | Erreur possible |
|---|---|---|---|---|
| `loyer_du_bail` | montant | **repris du bail**, jamais ressaisi (B17) | oui | Bail illisible : le champ affiche un tiret et la page reste utilisable |
| `loyer_du` | montant | saisie locale | non | Non saisi : `Montant` variante `manquant`, un tiret et « pas saisi » |
| `provisions_du` | montant | saisie locale, **jamais un pourcentage** (B16) | non | Non saisi : idem |
| `total_du` | **somme affichée** | somme des deux montants ci-dessus, **affichée et non stockée comme vérité** | oui | Il ne peut pas diverger, parce qu'il n'est **pas stocké** : il est recalculé à chaque rendu. Une somme affichée qui diverge, c'est un montant stocké deux fois |
| `recu_1` / `recu_2` | montant + date saisie | saisie locale | non | Date future sur un reçu : refusée au champ, « Un reçu ne peut pas être daté dans le futur. » |
| `recu_autre` | montant + date + motif en texte | saisie locale, **avec classe** (B8) | non | Un motif en texte libre ici demande sa classe, comme tout texte libre : `FeuilleClasse` si le propriétaire écrit un jugement dans le motif |
| `categorie` | énumération `loyer` / `provisions` | **deux valeurs, pas d'autre** | oui | Aucune autre valeur n'est offered, donc aucune erreur de catégorie n'est possible |
| `mois` | `MM/AAAA` | **l'horloge du projet, pas celle de l'appareil** | oui | L'horloge injectée dans le domaine est une exigence de testabilité : cette page n'affiche le mois courant que si l'horloge est branchée, et l'écran le dit |
| `etat_saisie` | `jamais_visite` / `partiel` / `complet` | dérivé de la présence des montants | oui | Un mois saisi à moitié est `partiel`, et le libellé le dit : « Saisi à moitié — ce qui manque est saisi ici, ce n'est pas un brouillon » (E11) |
| `etat_envoi` | `a_envoyer` / `rien_a_confirmer` | local d'abord (C2) | oui | Échec : bandeau `echec_envoi`, aucun bouton « Réessayer » |

- **Chargement** : tout d'un bloc, sans pagination. Cette page porte **six champs**, donc
  il n'y a rien à charger par pages ni à parcourir.
- **Cache / hors-ligne** : la page est **identique** hors-ligne (N2, C9). Les montants
  viennent du cache local, la date de réception est saisie, le loyer du bail est repris du
  bail local. Aucune de ces données n'a besoin du réseau pour exister.
- **Données sensibles** : les montants sont des données personnelles au sens de C6 : ils
  sont exportables avec le dossier du locataire, et **non effaçables**, parce qu'ils sont
  des pièces comptables au sens de B9. **Le champ `motif` du reçu `Autre reçu` est le seul
  texte libre de cette page, et il suit la règle de B8** : il demande sa classe, et une
  appréciation n'y est jamais exportée. Rien n'est journalisé, rien n'est envoyé à un tiers
  (N8).

---

## 9. Traçabilité

| ID | Origine | Manifestation sur cet écran |
|---|---|---|
| **B1** | PRD | Le message de succès dit « Sommes enregistrées **sur cet appareil**. Pas encore confirmées. » Le mot `Synchronisé` n'apparaît qu'après confirmation serveur |
| **B2** | PRD | Le `MessageBref` porte le mot du téléphone : « Pas encore confirmées. » |
| **B4** | PRD | Une somme `a_envoyer` est modifiable, et le retour arrière conserve la saisie. Une somme confirmée ne l'est plus, et le passage en lecture dit « la rectification passe par le dossier du locataire » |
| **B7** | PRD | Le motif du reçu `Autre reçu` est un texte libre et **demande sa classe**. Un jugement écrit dans un motif de reçu ne peut pas finir dans l'export du dossier |
| **B8** | PRD | Le motif du `Autre reçu` passe par `FeuilleClasse`. **Le reste de cette page n'a pas de texte libre** : les deux montants et leurs dates n'ont pas besoin de classe, et leur en demander une serait absurde |
| **B15** | PRD | Cette page **fonctionne entièrement hors-ligne** : aucune de ses actions n'exige une preuve d'envoi. C'est le critère de distinction avec l'encaissement, et il est visible ici par un bandeau d'information et non par une erreur |
| **B16** | PRD | Aucun montant n'est calculé par l'application. Le total est **une somme affichée, jamais stockée**, donc il ne peut pas diverger. Les provisions sont une saisie, pas un pourcentage du loyer. Et la **catégorie** est limitée à deux valeurs, avec le refus écrit |
| **B17** | PRD | Le loyer du bail est repris, jamais ressaisi, et sa ligne n'est pas modifiable : elle renvoie à sa source. **C'est la seule façon de garantir qu'un montant n'existe qu'à un endroit** |
| **C2** | PRD | Écriture locale d'abord, vérifiée, envoyée après. L'ordre n'est jamais inversé, et l'interface ne fait pas attendre le réseau |
| **C4** | PRD | La barre d'action est de 88 pt, au-dessus du clavier, et ne bouge pas. Les champs sont à 52 pt, dans la zone du pouce |
| **C9** | PRD | Hors-ligne, la page est identique. Le bandeau le dit comme une information, jamais comme une erreur |
| **N1** | PRD | L'enregistrement est local et instantané ; le `MessageBref` paraît sans attendre le réseau. Le total se met à jour en place, sans animation |
| **N3** | PRD | 52 pt sur les six champs et les deux boutons |
| **N4** | PRD | Corps à 17 px, montants en chasse fixe, plancher à 14 px pour le refus. Le refus est en 14 px parce qu'il est une information de lecture, pas une action |
| **N5** | PRD | Tailles en `rem` suivant le réglage du téléphone, plafonné à ×1,3 : le montant passe en 22 px, les colonnes gardent leur largeur grâce à la chasse fixe, et **aucun montant n'est abrégé** |
| **E4** | PRD | Le propriétaire saisit ses sommes dans un sous-sol et sort : l'écriture est complète au moment où il a fini de taper, et rien n'attend le réseau |
| **E6** | PRD | Le motif du `Autre reçu` demande sa classe avant d'être accepté, sans dialogue et sans déplacer le focus |
| **E7** | PRD | Un motif d'appréciation écrit dans un reçu n'est **jamais exporté**, même par erreur de saisie : la classe est une propriété du schéma, pas une discipline d'écriture |
| **E11** | PRD | Un mois saisi à moitié est `partiel` et le dit : « Saisi à moitié — ce qui manque est saisi ici, ce n'est pas un brouillon. » Reprendre le mois est un geste normal, à la même place, sans incident |

---

## 10. Checklist de gate

- [x] Les 9 états sont décrits avec un rendu concret et des **libellés écrits**.
- [x] Un montant absent est un **tiret**, jamais `0,00 €` : une absence et un zéro sont deux
      faits différents et l'écran les rend différemment.
- [x] Le refus de catégorie est **écrit en permanence** dans le bloc « ce que cette page ne
      peut pas faire », donc il n'est pas une erreur de frappe mais une limite du produit.
- [x] Un vide n'est jamais un zéro ; l'erreur a un rendu distinct et **le formulaire reste
      utilisable** quand le bail est illisible.
- [x] Aucun « Réessayer ».
- [x] Chaque élément interactif a un comportement, un feedback et un état résultant.
- [x] Le responsive est défini aux trois breakpoints.
- [x] La section Anti-générique est cochée et justifiée avec les valeurs réelles.
- [x] Aucune valeur de design n'est laissée à « à définir ».
- [x] **Aucun ratio de contraste écrit à côté d'une valeur.**
- [x] Chaque ID `B*`, `E*`, `C*` et `N*` de l'écran apparaît en § 9.
- [x] `node "$FORGE/scripts/forge-guard.js" placeholders <anchor>` ne signale rien ici.
- [x] L'écran reste cohérent avec `.forge/design/design-system.md`.
