---
type: screen
slug: encaissement
title: Encaissement
module: encaissement
status: draft
generated_at: 2026-09-30
derived_from:
  - .forge/prd.md
  - .forge/design/design-system.md
rule_ids: [B1, B2, B6, B7, B9, B12, B13, B15, B16, B17, B18, C2, C4, C6, C9, C11, N1, N3, N4, N5, N6]
edge_case_ids: [E1, E9, E11, E12]
flow: encaissement-mensuel
---

# Écran — Encaissement

> Ce document est la **source de vérité** pour qu'une IA génère l'interface de cet écran.
> Il est généré depuis le gabarit, jamais recopié. Aucun `{{PLACEHOLDER}}` ne doit subsister.

---

## 1. Rôle de l'écran

| | |
|---|---|
| **Archétype d'app** | `mobile_field_ops` (principal), `rental_tenancy` (secondaire) |
| **Module** | `encaissement` — rang 3 dans la navigation |
| **Route** | `/encaissement` |
| **Type** | page |
| **Utilisateurs** | Le propriétaire, seul utilisateur (C3) |
| **User stories servies** | US-5 |
| **Règles métier** | B1, B2, B6, B7, B9, B12, B13, B15, B16, B17, B18, C2, C4, C6, C9, C11, N1, N3, N4, N5, N6 |
| **Edge cases** | E1, E9, E11, E12 |

**Une phrase** : cet écran permet au propriétaire de voir, pour un mois, **qui a payé, qui
n'a pas payé et qui a payé en retard**, en trois groupes fixes, et d'appeler les trois.

**Pourquoi il est au rang 3 de la navigation** : sa fréquence est de 3 et sa centralité de
5. Le score seul (15) l'égalerait avec `dossiers` ; la règle « une opération répétitive avant
une entrée de cycle de vie » tranche en sa faveur, parce que l'encaissement **agit sur un
objet existant** quand le dossier en crée un. Et sa centralité de 5 est justifiée par une
raison qui n'est pas une moyenne : **au 6 du mois, « en retard » apparaît pour la première
fois**, et c'est le seul écran où la relance est la seule action que Bailly refuse de
produire hors ligne (B15).

**La règle de démonstration qui lui est propre** : une slice dont le comportement dépend
d'une date ne se démontre pas en « ça marche ». `encaissement` se démontre **le 6 du mois**,
parce qu'avant cette date l'état `en_retard` **n'existe pas et n'est pas calculé**.

**Ce que cet écran ne fait pas** : il ne rapproche rien (E9), il ne calcule aucun total
d'impayés (B16, roadmap § 5 : « un indicateur serait une chose qu'il consulte au lieu
d'appeler »), et il n'affiche aucun taux de recouvrement.

---

## 2. Direction visuelle de cet écran

| | |
|---|---|
| **Mood** | opérationnelle, parlante, sans alarme |
| **Densité** | **dense** — 14 lignes de 72 pt tiennent en **deux défilements et demi**. C'est la limite réelle : 14 lignes de 88 pt demanderaient quatre défilements, et le propriétaire au 6 du mois n'en fera pas quatre |
| **Niveau de contraste** | **fort** — le mot d'état de chaque ligne est l'information, donc il est en 600 et jamais en gris |
| **Traitement photographique** | **AUCUN.** Aucun logo de banque, aucun relevé, aucun QR code. Un reçu est un **fait daté** du dossier, donc il apparaît dans l'historique du locataire, pas dans une vignette d'encaissement |
| **Référence** | le **relevé bancaire du mois**, dans son ordre de lecture naturel : ce qui est arrivé, ce qui n'est pas arrivé, ce qui est arrivé tard. Et **rien de plus** : ni solde cumulé, ni courbe, ni projection |

**Les valeurs portées par cet écran**

| Rôle | Token | Valeur |
|---|---|---|
| Fond de l'application | `--color-background` | `#101319` |
| Surface des lignes | `--color-surface` | `#171B22` |
| Ligne d'écart, bandeau de contexte | `--color-surface-sunken` | `#0A0C10` |
| Barre d'action | `--color-surface-raised` | `#212630` |
| Encre de lecture, mot d'état | `--color-texte-principal` | `#E8ECF3` |
| Encre secondaire, montant reçu | `--color-texte-secondaire` | `#A6B0C0` |
| Ambre — « sur cet appareil », écriture locale | `--color-primaire-600` | `#E0A23A` |
| Sauge — payé | `--color-confirme-800` | `#4F7F5F` |
| Terre cuite — payé en retard, ou refus de relancer | `--color-alerte-800` | `#C4614F` |
| Contour de focus | `--color-bordure-focus` | `#E0A23A` |

| | |
|---|---|
| **Surface** | `--color-surface` `#171B22` sur `--color-background` `#101319` |
| **Accent utilisé** | `--color-confirme-800` `#4F7F5F` pour le filet de 3 px d'une ligne payée, et `--color-alerte-800` `#C4614F` pour le filet d'une ligne payée en retard. **Les deux sont des filets de 3 px, pas des aplats** : un bloc vert ou rouge répété sur 14 lignes est une alarme permanente, et une alarme permanente est une alarme ignorée (B13) |

### 2.1 Anti-générique — obligatoire

- [x] **Pas de fond blanc pur `#FFFFFF`.** Fond `#101319`, choisi, justifié.
- [x] **Pas de carte ombrée pour tout.** Trois groupes séparés par un sur-titre et
      `--space-2xl`, un filet de 1 px entre les lignes. **Aucune ligne n'a de fond propre**,
      sauf la variante `ecart` qui est sur `--color-surface-sunken` — et ce n'est pas une
      carte, c'est une ligne qui porte une information supplémentaire.
- [x] **Pas d'uniformité.** Le nom du locataire est en 17 px 600 ; le mot d'état est en
      17 px **600** en teinte d'état ; le montant est en 17 px en chasse fixe aligné à
      droite ; la date et les jours de retard sont en 14 px en chasse fixe. Le mot d'état et
      le montant sont les deux seuls éléments en chasse fixe alignés à droite, donc l'œil
      lit d'abord le mot, puis le chiffre.
- [x] **Pas de gris neutre générique.** `#8B95A5` ne porte que des dates. Le mot `Payé en
      retard` est en terre cuite, `Pas encore payé` est en encre de lecture : **les deux
      états par défaut ne sont pas colorés**, parce qu'un état normal ne doit pas se détacher.
- [x] **Pas de mise en page centrée symétrique.** Trois groupes alignés à gauche, marges
      `--space-lg`.
- [x] **Pas d'illustration d'appoint générique.** Aucun pictogramme d'état, aucune icône de
      paiement, aucun logo de banque. Les trois états sont **trois mots**.
- [x] **Pas d'une seule famille de police.** `--font-chasse` pour les montants, les dates et
      les jours de retard : les trois colonnes de droite s'alignent verticalement sur
      quatorze lignes, donc deux montants de longueurs différentes ne se comparent pas à
      l'œil.

**Choix assumé et non neutre** : **le total encaissé du mois n'est pas affiché.** Pas de
« 12 240 € encaissés sur 14 900 € », pas de taux, pas de barre de progression. C'est la
mesure assumée de la roadmap § 5 : « le propriétaire ne voit pas mon taux de retard », et
un indicateur serait « une chose qu'il consulte au lieu d'appeler ». Ce que l'écran donne à
la place, c'est **trois groupes avec trois comptes**, et le compte du haut est le seul chiffre
d'ensemble : combien de personnes je dois appeler aujourd'hui. **C'est un compte d'actions, pas
un chiffre d'affaires.** Un total encaissé optimise l'affichage pour la lecture ; un compte de
personnes à appeler optimise l'affichage pour le geste, et le geste est la tâche.

---

## 3. Anatomie

```
BandeauSynchronisation                                  PERMANENT
        │
        ▼
TitreÉcran  variante `avec_contexte`
├─ [titre] "Encaissement"
├─ [retour] non — c'est un onglet
└─ [contexte] "septembre · 14 baux · 9 payés · 2 en retard · 1 écart"   --font-chasse
        │
        ▼
GroupeSegmenté  variante `choix_simple`              48 pt, un seul segment choisi
└─ [options] "Septembre ▾"   — un seul choix, donc un seul segment ;
                                il ne s'agit PAS d'un filtre mais d'un période
        │
        ▼  --space-2xl
BandeauAlerte  variante `a_venir`             CONDITIONNEL, avant le 6
└─ "Le 6 de ce mois, « payé en retard » apparaîtra sur les loyers non payés.
    Tant qu'il n'est pas le 6, ce groupe n'existe pas et n'est pas calculé."
        │
        ▼  --space-lg
ListePlate  variante `groupee`
├─ [sur_titre] "EN RETARD · 2"                       seulement à partir du 6
├─ LigneEncaissement variante `en_retard` × 2        72 pt
│   ├─ [locataire] "Breguet"      [objet] "4e"
│   ├─ [etat]       "Payé en retard"   --color-alerte-600, 600
│   ├─ [montant_du] "214,00 €"     [montant_recu] "—"
│   └─ [jours]      "6 jours de retard"   --font-chasse
│
├─ [sur_titre] "PAS ENCORE PAYÉ · 3"
├─ LigneEncaissement variante `pas_encore_paye` × 3  72 pt
│   ├─ [etat] "Pas encore payé"   --color-texte-principal, 600
│   └─ [jours] "attendu le 5"      --font-chasse
│
├─ [sur_titre] "PAYÉ · 9"
├─ LigneEncaissement variante `paye` × 9            72 pt
│   ├─ [etat] "Payé"               --color-texte-secondaire
│   └─ [montant_recu] "reçu le 3 · 214,00 €"
│
├─ [sur_titre] "ÉCART · 1"                          CONDITIONNEL (E9)
└─ LigneEncaissement variante `ecart` × 1           88 pt
     "Breguet 4e — 214,00 € déclarés sur le compte,
      aucun reçu saisi. Une ligne à traiter."
     Aucun bouton « Régler », aucun « Réessayer » : Bailly ne rapproche rien.
        │
        ▼  --space-3xl
BarreAction  variante `secondaire`
├─ [action_principale] Bouton lg "Saisir une somme due"   → /dossiers/:id/somme-due
└─ [action_secondaire] Bouton md "Voir les 2 en retard"
```

| # | Composant | Rôle | Source |
|---|---|---|---|
| 1 | `BandeauSynchronisation` | Dire où en sont les écritures de l'écran (B6) | design-system § 3.1 |
| 2 | `TitreÉcran` | Nommer le mois et porter les quatre comptes en une ligne | design-system § 3.18 |
| 3 | `GroupeSegmenté` | Choisir le mois — un segment, pas un filtre | design-system § 3.13 |
| 4 | `BandeauAlerte` | Annoncer l'apparition de « en retard » le 6, avant qu'elle n'existe | design-system § 3.24 |
| 5 | `ListePlate` | Contenir les quatre groupes sans carte | design-system § 3.23 |
| 6 | `LigneEncaissement` | Rendre l'un des trois états d'encaissement, ou un écart | design-system § 3.7 |
| 7 | `Montant` | Afficher les sommes dues et reçues, jamais calculées (B16) | design-system § 3.20 |
| 8 | `Bouton` | Porter `Saisir une somme due` et `Voir les 2 en retard` | design-system § 3.8 |
| 9 | `Vide` | Rendre l'absence de loyer pour ce mois | design-system § 3.26 |
| 10 | `BarreAction` | Porter l'action principale dans la portée du pouce | design-system § 3.16 |
| 11 | `BarreOnglets` | Naviguer vers les trois autres destinations | design-system § 3.17 |

---

## 4. États — tous, sans exception

| État | Déclencheur | Rendu | Feedback utilisateur |
|---|---|---|---|
| **Chargement** | Changement de mois, lecture des montants et des reçus | 14 `LigneEncaissement` en ossature de **72 pt**, réparties dans les trois groupes, et les sur-titres **déjà rendus** avec leurs comptes. **Un sur-titre qui apparaît après ses lignes fait sauter toute la page** | Aucun texte d'attente, aucun spinner. Le mois affiché change **immédiatement**, et les ossatures occupent la place |
| **Rempli** | Des loyers sont saisis pour le mois | Les trois groupes dans l'ordre **fixe** `En retard` · `Pas encore payé` · `Payé`, plus `Écart` s'il y en a un. L'ordre ne change jamais, même quand un groupe est vide : un groupe vide est **affiché avec son compte à 0**, parce qu'un compteur de 0 est une information et une absence de groupe ne l'est pas | Aucun. Les groupes **sont** le feedback |
| **Vide — jamais visité** | Le propriétaire n'a jamais saisi de loyer pour ce dossier-ci | `Vide` variante `jamais_visite` : « Aucun loyer saisi pour septembre. Les montants viennent du bail, et ils se saisissent une fois par dossier et par mois. » + `Bouton primaire` `Saisir une somme due` | La `BarreAction` porte **le même** bouton en `lg`. Deux points d'entrée pour un geste unique, comme sur `dossiers`, parce que c'est le premier geste du mois |
| **Vide — aucune donnée** | Aucun bail n'existe encore | `Vide` variante `aucune_donnee` : « Aucun bail saisi, donc aucun loyer à encaisser. Les loyers viennent des baux. » + `Bouton secondaire` `Créer un bail` → `/dossiers/nouveau/bail` | Aucun bouton `Saisir une somme due` : **sans bail, il n'y a pas de somme due**, et le bouton serait un mensonge. Il est `impossible` avec son aide |
| **Erreur de chargement** | La lecture des montants échoue | `Vide` variante `erreur` + `BandeauAlerte` en variante `impossible` : « Impossible de lire les encaissements de septembre. Rien n'est affiché — et ce n'est pas vide : on ne sait pas encore. » | **Aucun bouton « Réessayer »** : la reprise est automatique. Le seul geste offert est un `BandeauAlerte` en variante `information` — « La lecture se fera seule dès que le réseau revient. » **Afficher le groupe `Payé` vide en pensant que personne n'a payé serait l'erreur la plus coûteuse de cet écran** |
| **Erreur de soumission** | La relance n'a pas pu être produite, ou un reçu saisi est incohérent avec le montant | Erreur **au champ** ou **au dos de la ligne**, jamais dans un message bref global. Pour un reçu incohérent : la ligne porte une ligne supplémentaire en terre cuite — « Reçu le 3 : 180,00 €, somme due 214,00 €. Différence 34,00 €. Une ligne à traiter, pas une erreur. » **Aucun bouton « Régler », aucun « Corriger automatiquement »** | Le focus reste sur la ligne concernée. Un écart n'est pas une anomalie système, c'est un fait que le propriétaire doit traiter, et l'écran le nomme comme tel (E9) |
| **Succès** | Une somme a été enregistrée pour le mois | `MessageBref` variante `fait` : « Somme enregistrée **sur cet appareil**. Pas encore confirmée. » La ligne concernée **change de groupe immédiatement**, et les comptes du titre se recomposent | Aucun total n'apparaît : ce qui change, c'est **à quel groupe appartient une personne**, ce qui est exactement ce que le propriétaire est venu voir |
| **Hors-ligne / permissions** | Mode avion, travail de fond | Les 14 lignes s'affichent **entièrement** depuis l'appareil, avec les trois groupes et les comptes. `Saisir une somme due` reste **actif**. `Relancer` passe en `impossible` avec la raison de B15 | Le `BandeauAlerte` de B15 apparaît **sur la ligne concernée**, pas dans le bandeau permanent : « Sans réseau, une relance ne part pas. Une relance produit une preuve d'envoi, donc elle a besoin du réseau. Demain matin elle sera là. » **Bailly le dit, et ne bloque rien d'autre** |
| **Lecture seule** | Écran verrouillé | Les 14 lignes en variante `lecture`, aucun filet d'état, aucune zone pressable. La `BarreAction` rend `desactivee` : `Saisir une somme due` en `impossible` avec l'aide « Déverrouille pour saisir une somme. » **La barre ne disparaît pas** | Le bouton est visiblement non pressable et son aide dit pourquoi |

---

## 5. Interactions

| Élément | Événement | Comportement | Feedback visuel | État résultant | ID |
|---|---|---|---|---|---|
| `GroupeSegmenté` « Septembre » | tap | Ouvre une `Feuille` de choix de mois : 14 mois, du terme le plus ancien au plus récent. **Ce n'est pas un filtre**, c'est une période : la feuille le dit dans son aide — « Tu changes de mois, tu ne filtres pas la liste. » | La feuille monte en 200 ms | Mois changé, ossatures rendues | Q4 |
| `BandeauAlerte` « le 6 » | appui long | Ouvre une `Feuille` d'explication : « Le sixième jour du mois, une somme due non reçue passe en créance exigible. Avant cette date, elle est due et rien n'est encore exigible. Bailly n'affiche donc aucun groupe « en retard » avant le 6, et ne le calcule pas. » | La feuille monte en 200 ms | Explication de la date | B12 |
| `LigneEncaissement`, tap | tap | Ouvre `/encaissement/:mois/:dossierId` : le détail du mois pour ce locataire, avec le bouton `Relancer` | Aucun fondu | Feuille de ligne | US-5 |
| `LigneEncaissement` variante `en_retard`, appui long | appui long | Ouvre la même feuille, à la section `Relancer`. Hors-ligne, le bouton y est `impossible` avec la phrase de B15 | La feuille monte en 200 ms | Feuille de ligne | B15 |
| `LigneEncaissement` variante `ecart`, tap | tap | Ouvre la feuille à la section de l'écart, qui explique les deux montants en présence et **ne propose aucun rapprochement** | Aucun fondu | Feuille, section `Écart` | E9 |
| `LigneEncaissement` variante `paye`, appui long | appui long | Ouvre la liste des reçus de ce mois pour ce locataire : date, montant, et **le mot d'état d'envoi de chaque reçu**. Un reçu saisi hors-ligne et pas encore confirmé est donc visible ici | La feuille monte en 200 ms | Liste des reçus | B1 |
| `Bouton lg "Saisir une somme due"` | tap | Ouvre `/dossiers/:dossierId/somme-due`. **Le dossier est celui de la première ligne du groupe `Pas encore payé`** si elle existe, sinon il est demandé — **jamais deviné** | Aucun fondu, la page se remplace | Formulaire de somme | US-3, B17 |
| `Bouton md "Voir les 2 en retard"` | tap | Défile jusqu'au groupe `En retard` et pose le focus sur sa première ligne. **Ce n'est pas un filtre** : la liste reste entière, c'est seulement la position de lecture qui change | Défilement en `--duration-normal` `--ease-default` | Focus posé sur la première ligne en retard | US-5 |
| Compte du titre, appui long | appui long | Affiche la précision du compte : « 2 en retard : Breguet 4e depuis 6 jours, Girard 2e depuis 2 jours. » Un compte sans détail est un chiffre qu'on ne peut pas vérifier | Le contexte s'étend sur deux lignes | Contexte détaillé | US-5 |
| Retour arrière | retour | Conserve la position de défilement et le mois sélectionné | Aucun | Inchangé | — |
| Défilement | scroll | Défilement natif, 16 pt de respiration sous la dernière ligne. **Pas de pull-to-refresh** : le même geste sert à revenir en arrière, donc le déclencher ici ferait oublier d'où l'on vient | Défilement natif | Inchangé | — |

- **Focus / clavier** : 14 focusables, un par ligne, plus 2 boutons et 1 segment de mois.
  `Origine` va à la première ligne du groupe `En retard` s'il existe, sinon à la première
  ligne du groupe `Pas encore payé` — **dans les deux cas, à la première personne qu'il a à
  appeler**, ce qui est l'ordre d'action du commanditaire. `Tab` parcourt ensuite les
  groupes dans leur ordre fixe.
- **Gestes** : **aucun geste porteur.** Pas de swipe pour marquer comme payé, pas de
  swipe pour relancer, pas de long-press pour clôturer. Un paiement est un **acte juridique** :
  le proprietor doit pouvoir le dater et le voir dans un historique append-only, donc il
  n'est pas dans un geste qu'on fait sans réfléchir. Le glissement de `Feuille` ne fait que
  fermer.
- **Animations** : **le changement de groupe d'une ligne est en `--duration-fast`.** Une
  ligne qui glisse d'un groupe à l'autre pendant qu'on la regarde serait une ligne qu'on ne
  voit pas bouger — et le changement de groupe est précisément l'information que l'écran
  porte. Le changement de mois est instantané, avec ossatures. `prefers-reduced-motion` met
  tout à 0 ms.
- **Retour arrière** : conserve le mois et la position de défilement.

---

## 6. Responsive

| Breakpoint | Comportement | Ce qui se replie / disparaît |
|---|---|---|
| **Mobile** (0–479 px) | Le layout de référence. 14 lignes de 72 pt (88 pt pour un écart), marges `--space-lg`, barre d'action de 88 pt, onglets de 64 pt | Sous 360 px de large, le nom et l'objet passent sur **deux lignes** et la ligne passe de 72 à 88 pt. Le mot d'état **ne bouge jamais** : c'est la première information |
| **Tablet** (480–899 px) | Deux colonnes : les trois groupes à gauche sur 420 pt, la ligne d'écart et le `BandeauAlerte` à droite. La navigation devient un rail vertical de 88 pt | Le bloc `Écart` passe à droite : un écart est un **cas**, pas un état, donc il se lit moins souvent qu'un groupe entier |
| **Desktop** (900 px et au-delà) | **Aucun rendu distinct.** Colonne centrée de 720 pt, navigation en bas. X11 exclut la version navigateur de bureau | Rien |

- **Cible tactile** : **72 pt par ligne**, ce qui est au-dessus de N3 de plus d'un tiers, parce
  que la ligne porte deux actions : ouvrir et relancer. Les boutons sont à 52 pt, le segment
  de mois à 48 pt.
- **Débordement** : (1) Le `locataire` est tronqué au deuxième point, jamais au milieu d'un
      mot, avec points de suite. (2) Le `montant_du` et le `montant_recu` ne débordent jamais :
      largeur minimale de 72 pt en chiffres tabulaires. (3) Le contexte du titre passe à la
      forme abrégée sous 360 px : « septembre · 9 payés · 2 en retard ». **Le compte d'en
      retard n'est jamais abrégé en « 2 »** : c'est le compte d'appels à passer, donc il
      doit rester lisible.
- **Ce qui ne déborde jamais** : la ligne d'écart. Ses 88 pt sont calculés pour sa
      troisième ligne, et sous 360 px elle passe à **112 pt** avec le montant sur sa propre
      ligne. Un écart tronqué est un écart qu'on ne traite pas.

---

## 7. Accessibilité

- [ ] **Contraste du texte courant** — mesuré par `design-check contrast`, qui applique
      4,5:1 à chaque encre contre les huit surfaces de son `on:`, dont
      `--color-surface-sunken` (la ligne d'écart) et `--color-surface-raised` (la barre
      d'action). **Aucun ratio n'est écrit ici.**
- [ ] **Contraste des grands textes** — le mot d'état est en `--text-body-fort` 17 px 600,
      donc mesuré à 4,5:1 et **pas** à 3:1. C'est délibéré : les trois mots
      `Payé` · `Pas encore payé` · `Payé en retard` sont **la** lecture de cet écran, et un
      mot d'état à 3:1 dans le noir à la tombée du jour est un mot qu'on devine.
- [ ] **Navigation clavier complète** — sur clavier externe et sur tous les breakpoints.
      `Origine` va à la première personne à appeler, dans les deux cas de figure. `Tab`
      parcourt ensuite les groupes dans l'ordre fixe `En retard` · `Pas encore payé` ·
      `Payé`, qui est **l'ordre d'appel**.
- [ ] **Focus visible** — anneau `--color-bordure-focus` de 2 px avec 2 px de fond entre
      l'anneau et la ligne. Le filet d'état de 3 px à gauche de la ligne **ne change pas**
      au focus : il porte l'état, pas la position, et le confondre ferait croire qu'une
      ligne a changé d'état.
- [ ] **ARIA** — les trois groupes sont trois `role="list"` avec chacun un `aria-label`
      complet : « Payés en retard, 2 lignes », « Pas encore payés, 3 lignes », « Payés, 9
      lignes ». Chaque ligne porte un `aria-label` qui **commence par l'état** : « Payé en
      retard, Breguet, 4e, 214 euros dus, 6 jours de retard, aucune somme reçue. » Le mot
      d'état est en premier parce que c'est la première information du balayage. Le
      segment de mois porte `aria-label` « Mois de l'encaissement, septembre » avec
      `aria-expanded`.
- [ ] **Alternative textuelle** — **aucune image sur cet écran.** Les montants sont du
      texte en chasse fixe, donc lus caractère par caractère avec l'unité annoncée comme
      « euros ». **Aucun logo de banque, aucun pictogramme de paiement** : les trois états
      sont trois mots, donc rien à décrire.
- [ ] **Langue et direction de lecture** — `lang="fr-FR"`, gauche à droite, euros en
      suffixe, dates `JJ/MM`, jours en `6 jours de retard`. **Le mois est écrit en toutes
      lettres** — `septembre`, pas `09` — parce que le nom du mois se prononce et se
      comprend au téléphone, ce qui est le seul contexte où le propriétaire parle de cet
      écran à quelqu'un d'autre.

---

## 8. Données

| Champ | Type | Origine | Requis | Erreur possible |
|---|---|---|---|---|
| `mois` | `Mois AAAA` | **l'horloge du projet, injectée dans le domaine** | oui | L'horloge n'est pas branchée : le mois affiché porte une mention explicite, et l'écran le dit. Une horloge non branchée produirait un mois faux, donc le test de démonstration du 6 du mois ne vaudrait rien |
| `somme_due` | montant | reprise du bail, **jamais calculée** (B16) | oui | Non saisie : `Montant` variante `manquant`, un tiret et « pas saisi » |
| `somme_recue` | montant | saisie locale, **une par reçu** | non | Non saisie : l'absence **est** l'information de l'état `impaye`. Jamais 0,00 € par défaut |
| `date_reception` | date `JJ/MM/AAAA` | **saisie**, pas celle de l'appareil (un virement du 3 se saisit le 5) | oui | Date future : refusée au champ |
| `etat_encaissement` | `a_venir` / `paye` / `paye_en_retard` / `impaye` | dérivé, et **`en_retard` n'existe pas avant le 6** | oui | Avant le 6, le groupe `En retard` n'est **ni rendu ni calculé** — c'est une property, pas un masquage |
| `jours_retard` | entier | différence entre la date attendue et la date de réception, en **jours** (roadmap § 2.3 : un délai légal s'exprime en jours) | non | Nécessaire avant le 6 : non rendu |
| `ecart` | paire de montants, jamais rapprochée | dérivée de la comparaison entre un montant déclaré et un reçu saisi | non | Un écart est **une ligne à traiter**, pas une anomalie. Aucun rapprochement automatique, aucun bouton de correction |
| `relance_possible` | booléen | **faux hors-ligne**, sans exception (B15) | oui | Hors-ligne : le bouton passe en `impossible` et la phrase est **sur la ligne**, pas dans un bandeau global |
| `preuve_envoi` | horodatage + référence | **produite par le serveur**, jamais par l'appareil | non | Non produite : aucune relance n'est enregistrée, donc **rien ne prétend avoir été envoyé** |
| `etat_envoi` | `a_envoyer` / `rien_a_confirmer` | local d'abord (C2) | oui | Échec : bandeau `echec_envoi`, aucun bouton « Réessayer » |

- **Chargement** : tout d'un bloc, **sans pagination**. 14 lignes et un mois : il n'y a rien à
  paginer, et une pagination ferait perdre la position de défilement — donc la position dans
  la liste des gens à appeler.
- **Cache / hors-ligne** : l'écran s'affiche **entièrement** hors-ligne (N2, C9), y compris
  les trois groupes et leurs comptes. **La seule action qui change hors-ligne est
  `Relancer`**, et elle ne disparaît pas : elle passe en `impossible` avec sa raison. C'est
  la seule fonction du produit qui ne fonctionne pas hors-ligne, et elle **le dit au lieu
  de disparaître**.
- **Données sensibles** : nom du locataire et montants sont des données personnelles au sens
  de C6 : **exportables** et **non effaçables**, parce que ce sont des pièces comptables au
  sens de B9, conservées jusqu'à une date de fin écrite. **Rien n'est journalisé, rien n'est
  envoyé à un tiers** (N8) — en particulier **aucun service de paiement, aucune banque, aucun
  Open Banking** : la saisie est manuelle et c'est la seule forme que le PRD connaît. La
  preuve d'envoi d'une relance est une **trace serveur** (roadmap § 2.2), donc elle n'est ni
  générée ni consultable sur l'appareil.

---

## 9. Traçabilité

| ID | Origine | Manifestation sur cet écran |
|---|---|---|
| **B1** | PRD | Un appui long sur une ligne payée ouvre la liste des reçus **avec le mot d'état d'envoi de chacun**. Un reçu saisi hors-ligne et pas encore confirmé est donc visible ici, exactement comme un fait non confirmé |
| **B2** | PRD | Le `MessageBref` porte le mot du téléphone : « Pas encore confirmée. » Et les trois mots d'état de l'écran — `Payé` · `Pas encore payé` · `Payé en retard` — sont **écrits en toutes lettres** et jamais remplacés par une icône |
| **B6** | PRD | Le `BandeauSynchronisation` est présent sur cet écran comme sur tous les autres, et **ne se masque pas** quand le mois est entièrement saisi |
| **B7** | PRD | Aucun champ de texte libre sur cet écran, donc aucune classe n'est demandée. **C'est la bonne nouvelle et elle est entière** : il n'y a rien sur cette page qui puisse devenir un jugement exporté |
| **B9** | PRD | Les montants sont des **pièces comptables** : ils ne sont jamais effaçables et sont conservés jusqu'à une date de fin écrite. Aucun bouton d'effacement n'existe sur cet écran, donc la contrainte est respectée par construction |
| **B12** | PRD | Le `BandeauAlerte` annonce l'apparition de « en retard » le 6, avec la règle expliquée en clair. Le groupe n'existe ni n'est calculé avant cette date |
| **B13** | PRD | Les états d'encaissement sont des **filets de 3 px**, jamais des aplats. Et l'état par défaut `Pas encore payé` n'est **pas coloré** : c'est l'état normal de 27 jours sur 30, donc il ne doit pas se détacher. **Un état normal coloré est une alarme permanente** |
| **B15** | PRD | `Relancer` passe en `impossible` hors-ligne, **sur la ligne concernée**, avec la phrase : « Une relance produit une preuve d'envoi, donc elle a besoin du réseau. Demain matin elle sera là. » Le bouton ne disparaît pas, et rien d'autre n'est bloqué |
| **B16** | PRD | Aucun total encaissé, aucun taux, aucune barre de progression, aucune somme d'impayés. Les montants sont saisis et affichés, et le seul chiffre d'ensemble est un **compte de personnes à appeler** |
| **B17** | PRD | `Saisir une somme due` ouvre le dossier de la première ligne du groupe, ou le demande — **jamais deviné** |
| **B18** | PRD | Aucune action d'effacement, aucune variante destructive, aucun geste de suppression. Un paiement est un acte juridique conservé en append-only, donc il ne se balaie pas |
| **C2** | PRD | L'écran se rend depuis le cache local avant tout appel réseau, donc il s'ouvre instantanément le 6 au matin |
| **C4** | PRD | `BarreAction` de 88 pt et `BarreOnglets` de 64 pt permanentes, avec `--space-3xl` de respiration. `Origine` au clavier va à la première personne à appeler |
| **C6** | PRD | Les montants sont des données personnelles non effaçables, conservées au titre de l'obligation légale. Rien n'est journalisé, rien n'est envoyé à un tiers |
| **C9** | PRD | Hors-ligne, l'écran est complet. **La seule chose qui change est `Relancer`**, et elle le dit au lieu de disparaître |
| **C11** | PRD | L'horodatage de chaque reçu est celui que le propriétaire a saisi, pas celui de l'appareil, et il est affiché en chasse fixe à côté du montant. La preuve d'envoi d'une relance est une trace serveur horodatée |
| **N1** | PRD | L'écran se rend localement donc en moins d'une seconde. Le seul délai — celui de l'envoi — n'est **jamais** aguardé à l'écran |
| **N3** | PRD | 72 pt par ligne, 52 pt pour les boutons, 48 pt pour le segment de mois |
| **N4** | PRD | Corps à 17 px, dates et jours de retard à 14 px, le mot d'état en 600. Aucun texte sous 14 px |
| **N5** | PRD | Tailles en `rem` suivant le réglage du téléphone, plafonné à ×1,3 : à ×1,3 la ligne passe de 72 à 88 pt et le nombre de lignes visibles diminue — **c'est le comportement correct**, parce que lire moins de lignes à la fois avec une police plus grande vaut mieux que lire des lignes coupées |
| **N6** | PRD | L'export complet des 14 dossiers est produit en moins d'une minute sans passer par cet écran ; cette page ne fait que porter l'affichage, aucun calcul lourd |
| **E1** | PRD | Le réseau tombe pendant une écriture de ce mois : la ligne reste dans son groupe, le mot d'état `Pas encore envoyé` apparaît sur le reçu au lieu d'être dans un bandeau, et aucun bouton « Réessayer » n'existe |
| **E9** | PRD | Le groupe `Écart` est rendu **avec ses deux montants et sa différence**, et **sans aucun bouton de rapprochement**. C'est une ligne à traiter, pas une anomalie système, et l'écran le dit en toutes lettres |
| **E11** | PRD | Un mois saisi à moitié puis abandonné : les lignes saisies restent dans leurs groupes, le groupe `Pas encore payé` affiche `Saisi à moitié` sur les lignes concernées, et reprendre le mois est un geste normal à la même place. **Aucun brouillon caché** |
| **E12** | PRD | Si le stockage est plein, aucune somme n'est écrite : le formulaire de somme refuse avec la phrase d'impossibilité, et cette page **continue d'afficher le mois tel qu'il était**. Un encaissement affiché à moitié serait pire qu'un encaissement affiché entièrement |

---

## 10. Checklist de gate

- [x] Les 9 états sont décrits avec un rendu concret et des **libellés écrits**.
- [x] **Aucun total, aucun taux, aucune barre de progression.** Le seul chiffre d'ensemble est
      un compte de personnes à appeler, et c'est un choix écrit.
- [x] Un groupe vide est affiché avec son compte à 0 ; un écart est une ligne à traiter, pas
      une anomalie.
- [x] Hors-ligne, **seule** `Relancer` change d'état, et elle passe en `impossible` avec sa
      raison **sur la ligne** — pas de disparition, pas de blocage global.
- [x] Aucun « Réessayer », aucun « Régler », aucun « Corriger automatiquement ».
- [x] Chaque élément interactif a un comportement, un feedback et un état résultant.
- [x] Le responsive est défini aux trois breakpoints, avec le comportement à ×1,3 explicité
      — moins de lignes visibles plutôt que des lignes coupées.
- [x] La section Anti-générique est cochée et justifiée avec les valeurs réelles.
- [x] Aucune valeur de design n'est laissée à « à définir ».
- [x] **Aucun ratio de contraste écrit à côté d'une valeur.**
- [x] Chaque ID `B*`, `E*`, `C*` et `N*` de l'écran apparaît en § 9.
- [x] `node "$FORGE/scripts/forge-guard.js" placeholders <anchor>` ne signale rien ici.
- [x] L'écran reste cohérent avec `.forge/design/design-system.md`.
