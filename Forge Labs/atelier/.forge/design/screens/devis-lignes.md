---
type: screen
slug: devis-lignes
title: Lignes du devis
module: Devis
status: draft
generated_at: 2026-10-01
derived_from:
  - .forge/prd.md
  - .forge/design/design-system.md
  - .forge/roadmap.md
rule_ids: [B1, B2, B3, B4, B12]
edge_case_ids: [E1, E2, E13]
flow: Boucle principale
---

# Écran — Lignes du devis

> Ce document est la **source de vérité** pour qu'une IA génère l'interface de cet écran.
> Il est généré depuis le gabarit de `skills/forge/templates/screen.md.tmpl`, jamais recopié.

**Scénario** — `D-2026-017`, Mme Lefèvre, 12 avril 2026, en cours. Jean-Luc est au milieu
de la saisie, une main, le pavé numérique ouvert, dans un local sans réseau.

---

## 1. Rôle de l'écran

| | |
|---|---|
| **Archétype d'app** | `mobile_field_ops` |
| **Module** | Devis — rang 2 dans la navigation, sous-écran de saisie |
| **Route** | `/devis/lignes` |
| **Type** | page — layout « saisie », deuxième étape |
| **Utilisateurs** | Jean-Luc seul, une main, le pavé numérique ouvert |
| **User stories servies** | US-1 (faire un devis devant le client), US-13 (douze lignes sur un écran de téléphone, d'une seule main) |
| **Règles métier** | B1, B2, B3, B4, B12 |
| **Edge cases** | E1, E2, E13 |

**Une phrase** : cet écran permet à Jean-Luc de **saisir douze lignes de travaux au pavé numérique, sans que le total quitte jamais l'écran**, afin de **chiffrer une cuisine ou une salle de bain sans changer d'appareil**.

**Pourquoi il est au rang 2 de la navigation** : il ne l'est pas lui-même — c'est le sous-écran de l'entrée `Devis`, et il n'a pas d'entrée propre, parce qu'un sous-écran qui a sa propre entrée est une nouvelle entrée de navigation déguisée (design-system § 3.1). Le rang 2 lui vient de son parent : c'est l'acte que le PRD § 1.1 nomme comme problème principal.

### 1.1 Ce que cet écran essaie d'éviter

Cet écran essaie d'éviter **deux nombres pour le même montant**. Tout formulaire de chiffrage qui se respecte affiche un sous-total et un total, un HT et un TTC, parfois un total remisé et un total avec déplacement — et le curseur se pose entre les deux, parce que deux nombres dont la différence n'est pas écrite est une question à laquelle Jean-Luc doit répondre seul, debout, devant le client. B3 tranche : **le total affiché, le total imprimé et le total couvert par la signature sont le même nombre**, et aucun autre total n'est montré à côté. Il n'y a donc pas de « sous-total » ici, pas de « total HT », pas de remise, pas de frais de déplacement séparés. Le montant est un, en `--text-montant` `32px`, tabulaire, et il est mis à jour à chaque chiffre. La seconde chose refusée est **le clavier qui mange le total** : la PRD § 7.1 impose que le total reste visible pendant la saisie d'une ligne, donc le pavé numérique est épinglé au bas et le total est posé **juste au-dessus**, jamais derrière lui, jamais dans un bandeau qu'on fait défiler. La troisième est **le bouton de suppression en haut de ligne**. Sur un devis de douze lignes, un bouton `×` en fin de ligne est à 8 px d'un autre bouton `×`, dans une colonne de chiffres, à portée d'un pouce qui glisse : c'est un geste qui supprime un prix. Passé six lignes, le bouton de suppression **quitte la ligne** et rejoint la feuille de la ligne, avec le total avant et après écrit dans la question. La quatrième est **le trait de séparation comme information** : les filets `--color-tiret` séparent, ils ne décident pas ; seul le liseré gauche `--stroke-liseré` `4px` porte un sens.

### 1.2 Les trois mots, écrits dans l'écran

Un devis en cours de saisie est déjà dans son état de sortie, et cet état est **écrit** sous le total, jamais dans un menu : `Écrit ici, pas encore envoyé`, puis `Sur ce téléphone. Personne ne l'a reçu.` Tant que le devis n'est pas sorti, cet état ne change pas — ni parce que le temps passe, ni parce que Jean-Luc a enregistré (B5).

---

## 2. Direction visuelle de cet écran

Repris du design system — **valeurs concrètes, jamais « à définir »**.

| | |
|---|---|
| **Mood** | dense, mate, sans emphase |
| **Densité** | **dense, et c'est la densité qui sert la PRD § 7.1** : l'interdiction du défilement horizontal reporte toute la pression sur le vertical, donc un devis de douze lignes doit tenir en six déplacements de pouce et pas en douze. Une ligne `compacte` fait `--hauteur-cible` `56px`, la densité est gagnée là et dans l'absence de conteneurs — **jamais** en réduisant le texte sous `--text-corps` `17px`. |
| **Niveau de contraste** | **fort** — désignation en `--color-texte-principal` `#1F1B15`, chiffres tabulaires alignés à droite dans la même couleur, aides et quantités en `--color-texte-secondaire` `#4C4436`. Le montant de ligne est en `--text-corps-fort` `17px`, jamais atténué : c'est le résultat, pas un commentaire. |
| **Surface** | `--color-surface` `#F6F2E9` pour la page du devis, `--color-surface-sunken` `#E2DAC9` pour la piste d'une ligne en cours de modification, `--color-surface-raised` `#FBF9F4` pour le pavé numérique |
| **Accent utilisé** | `--color-bordure-focus` `#8A4A0E` `--stroke-focus` `3px` — le seul accent de l'écran, et il ne sert qu'à dire **où est le curseur de saisie**. Aucun accent d'état : ce devis n'a pas d'état de sortie qui bouge. Aucun bouton bleu (design-system § 0.4). |
| **Traitement photographique** | AUCUN |
| **Référence** | `devis-nouveau` et `devis-detail` sont le même document vu de trois côtés : la même page `--color-surface` `#F6F2E9`, le même filet `--color-bordure-forte` `#4A4234`, le même total. |

### 2.1 Anti-générique — obligatoire

Cet écran ne doit ressembler **à aucun** de ces défauts :

- [x] **Pas de fond blanc pur** `#FFFFFF` — la page est `--color-surface` `#F6F2E9` sur `--color-background` `#EDE8DC` : une feuille de papier sur un établi, pas une feuille de navigateur.
- [x] **Pas de carte ombrée pour tout.** Une ligne n'est pas une carte : c'est une ligne de 56px séparée par un filet `--color-tiret` `#BFB59E`. La seule ombre de l'écran est `--shadow-lg` `0 -4px 24px rgba(31,27,21,0.18)` sous le pavé numérique, parce que le pavé est **au-dessus** du contenu — c'est le seul emploi que le design-system § 1.4 autorise.
- [x] **Pas d'uniformité** : quatre niveaux sur une même colonne — `--text-h3` `20px` pour le nom du client, `--text-corps` `17px` pour la désignation, `--text-identifiant` `15px` pour le numéro, `--text-montant` `32px` pour le total. Et deux largeurs de colonne fixes dans la ligne : la désignation prend 60 %, les trois chiffres 40 %, alignés en tabulaires.
- [x] **Pas de gris neutre générique** `#6B7280` — les aides sont `--color-texte-secondaire` `#4C4436`, le filet de champ au repos est `--color-bordure-champ` `#6F6757`.
- [x] **Pas de mise en page centrée symétrique** — alignement à gauche partout ; le total est le seul élément aligné à gauche **et** le seul chiffre aligné à droite dans son bloc, ce qui l'empêche d'être pris pour un élément décoratif.
- [x] **Pas d'illustration d'appoint** — la ligne d'ajout est `Ligne de travaux` puis `Pose de trois fenêtres coulissantes`, en texte. Pas de zone pointillée, pas de `+` dans un cercle.
- [x] **Pas d'une seule famille de police** — `--font-texte` `Archivo` pour les désignations, `--font-identifiant` `IBM Plex Mono` pour le numéro `D-2026-017` et pour les chiffres des colonnes. Les chiffres tabulaires alignent une colonne de montants : c'est exactement le travail que fait un devis.

**Choix assumé et non neutre** : le pavé numérique **reste visible pendant toute la saisie d'une ligne**, épinglé au bas, jamais flottant au-dessus du champ comme sur iOS, et **la barre basse de navigation disparaît tant qu'il est ouvert**. Deux choix dans le même sens : ce que la main cherche au pouce pendant qu'elle écrit, c'est le pavé ; deux barres empilées au bas SORTIRAIENT le pavé de la portée. Et la ligne en cours de modification ne s'ouvre pas dans une modale : elle s'ouvre **dans la page**, sur `--color-surface-sunken` `#E2DAC9`, avec le reste du devis toujours visible au-dessus. Un artisan qui compare deux prix a besoin de voir les deux.

---

## 3. Anatomie

```
┌─────────────────────────────────────────┐
│ FILE ATTENTE — bandeau 44px             │
├─────────────────────────────────────────┤
│ EN TÊTE DEVIS `complet`                 │
│  D-2026-017  ·  12 avril 2026           │
│  Mme Lefèvre                             │
├─────────────────────────────────────────┤
│ LIGNE DEVIS `compacte` 56px × 12        │  ← filet --color-tiret 1px
│  Pose de trois fenêtres coulissantes    │
│                    2 × 1 240 € = 2 480  │
│  ───────────────────────────────        │
│  Reprise des tableaux de sous-face      │
│                    1 ×   760 € =   760  │
│  …                                      │
│  LIGNE DEVIS `vide` — l'ajout           │
├─────────────────────────────────────────┤
│ TOTAL BLOC `saisie` — ÉPINGLÉ          │  ← toujours au-dessus du pavé
│  4 860 euros                             │
│  Écrit ici, pas encore envoyé           │
│  Sur ce téléphone. Personne ne l'a reçu.│
├─────────────────────────────────────────┤
│ PAVÉ NUMÉRIQUE (épinglé) — SI OUVERT   │
│  1 2 3 / 4 5 6 / 7 8 9 / ,  Effacer   │
│               Valider                 │
├─────────────────────────────────────────┤
│ BARRE D'ACTION 60px — LE POUCE         │
│  BOUTON `grande` `plein` `Revoir le devis`│
├─────────────────────────────────────────┤
│ NAVIGATION BASSE 68px — Devis actif    │
│  (masquée pendant l'ouverture du pavé)  │
└─────────────────────────────────────────┘
```

| # | Composant | Rôle | Source |
|---|---|---|---|
| 1 | `EnTeteDevis` variante `complet` | l'identité déjà acquise : numéro, date, client | design-system § 2 |
| 2 | `LigneDevis` variante `compacte` | la ligne de travaux : désignation, quantité, prix unitaire, montant | design-system § 2 |
| 3 | `LigneDevis` variante `etendue` | la même ligne au format tablette, désignation seule puis trois colonnes alignées — c'est le format où Jean-Luc montre le devis au client | design-system § 2 |
| 4 | `LigneDevis` variante `vide` | la ligne d'ajout, **en texte** et non en icône | design-system § 2 |
| 5 | `ChampMontant` variante `quantite` | la quantité, largeur 88px, unité `×` | design-system § 2 |
| 6 | `ChampMontant` variante `montant` | le prix unitaire, largeur 128px, unité `€` | design-system § 2 |
| 7 | `TotalBloc` variante `saisie` | le total affiché pendant la saisie, jamais masqué | design-system § 2 |
| 8 | `EtatSortie` variante `mention` | la mention d'état et sa preuve, sous le total | design-system § 2 |
| 9 | `Bouton` variante `plein` taille `grande` | `Revoir le devis`, à `--hauteur-action-primaire` `60px` | design-system § 2 |
| 10 | `BandeauMessage` | dire une fois, à l'endroit où ça s'est produit | design-system § 2 |
| 11 | `FileAttente` | l'état global d'envoi, repris tel quel | design-system § 2 |
| 12 | `NavigationBasse` | la sortie de l'écran, qui ne perd jamais la saisie | design-system § 2 |
| 13 | **Pavé numérique de `ChampMontant`** | la saisie à une main, épinglée en bas, jamais flottante | design-system § 2, slot `pave` |

---

## 4. États — tous, sans exception

| État | Déclencheur | Rendu | Feedback utilisateur |
|---|---|---|---|
| **Chargement** | Retour sur cet écran après une coupure de réseau, ou réouverture de l'application | **Aucun squelette, aucun spinner.** Le devis est dans le magasin local, ligne pour ligne. Si une ligne est en cours de saisie au moment de la coupure, elle est retrouvée **avec ce qui a déjà été saisi** et le pavé numérique est refermé (E2). | rien ; la saisie rouvre l'écran telle qu'elle était |
| **Rempli** | Le devis porte des lignes | Les `LigneDevis` `compacte` séparées par un filet `--color-tiret` `#BFB59E`, la ligne d'ajout `vide` en dernier, le `TotalBloc` épinglé, la barre d'action en bas. **Treize lignes à l'écran, pas davantage** : au-delà, c'est une liste, et une liste de lignes de travaux n'a pas à être vue en entier pour être relue. | le total se met à jour à chaque chiffre, instantanément |
| **Vide — jamais visité** | Le devis vient d'être créé, aucune ligne | Une seule `LigneDevis` à l'état `vide`, et le pavé numérique déjà ouvert sur la quantité : Jean-Luc n'a rien à chercher. Le total affiche `0 euros`, avec sa formule, **sans mention d'état** — un devis sans ligne n'est pas encore un devis, donc il n'a pas d'état de sortie. | la ligne d'ajout est le seul élément à regarder |
| **Vide — aucune donnée** | Toutes les lignes ont été supprimées et il en reste zéro | La ligne `vide` revient, **et le bouton `Revoir le devis` passe en `desactive` avec la raison écrite au-dessus** : `Un devis porte au moins une ligne de travaux.` Aucun `Réessayer`, aucun `Charger encore` : rien n'a échoué, il n'y a simplement rien à voir. | — |
| **Erreur de chargement** | Le magasin local ne répond pas | Les lignes **restent affichées** — on ne remplace pas un chiffrage lisible par une panne. Au-dessus, `BandeauMessage` en état `echec` : `Ce devis n'est plus lisible sur cet appareil. Il est peut-être encore ailleurs.` puis `Réessayer la lecture`. La saisie est suspendue : le bouton de la barre d'action passe en `desactive`. | bandeau `--color-expire-fond` `#F4DED8`, il ne s'efface pas |
| **Erreur de soumission** | Saisie refusée : un montant négatif, une quantité vide alors qu'un prix est saisi, un champ qui dépasse ce qu'un devis peut porter | Le champ fautif passe à l'état `erreur` de `EtatChamp` : filet `--color-bordure-expire` `#B45A48` `2px`, et un message **sous** le champ, en `--color-texte-expire` `#86210F`, qui dit ce qu'il faut faire et jamais ce qui est invalide : `Écrivez la quantité, ou effacez la ligne.` Le reste de la ligne reste lisible : **on corrige un prix, on ne relit pas un devis.** | message permanent sous le champ, pas de toast |
| **Succès** | Une ligne est validée, ou le devis est enregistré | La ligne passe à l'état `valide` : aucun liseré, montant en `--text-corps-fort` `17px` tabulaire. Le total est mis à jour sans animation. **Aucun bandeau de congratulation** : la validation d'une ligne est un fait qui se voit dans la ligne, pas une nouvelle à annoncer. | rien — le changement se voit, il n'a pas besoin d'être dit |
| **Hors-ligne / permissions** | Mode avion pendant toute la saisie | **Rien ne change.** C'est le fonctionnement normal (C1, E1). Aucune action de cet écran ne suppose la connexion, donc aucun de ses champs n'affiche d'erreur réseau. Le bandeau de file, s'il existe, écrit `Pas de réseau ici.` — mais le chiffrage continue. | aucun avertissement |
| **Lecture seule** | Le devis est signé et sa signature est valide | Les lignes passent en `ChampMontant` `desactive` : le montant reste lisible en `--color-texte-secondaire` `#4C4436`, plus aucune saisie possible. La ligne d'ajout disparaît. Le bouton de la barre d'action devient `Ouvrir le devis`. **Aucune modification n'est proposée ici** : une modification après signature annule la signature, et cela se décide sur `devis-detail`, pas au milieu de douze lignes. | — |

> Un état non décrit est un état non implémenté.

---

## 5. Interactions

| Élément | Événement | Comportement | Feedback visuel | État résultant | ID |
|---|---|---|---|---|---|
| Pavé numérique — chiffre | tap | Ajoute le chiffre au champ focalisé, en tabulaires alignés à droite. Un `0` saisi explicitement s'affiche `0`, **pas** `0,00`. | le champ focused porte `--color-bordure-focus` `#8A4A0E` `3px` et le halo `--color-teinte-survol` `#E4DCCB` | `rempli` | B2 |
| Pavé numérique — `,` | tap | Sépare décimales. Deux décimales au plus : une troisième est refusée au clavier, pas à la validation. | — | `rempli` | B2 |
| Pavé numérique — `Valider` | tap | Valide le champ focalisé et rend le pavé au champ suivant : quantité → prix unitaire → désignation. **La validation est explicite et n'est jamais automatique** : la PRD § 7.3 interdit qu'une action soit accessible sans bouton visible. | le champ suivant reçoit l'anneau de focus | `en-saisie` | US-13 |
| Chiffre du total | recalcul | Le total est recalculé à chaque chiffre et affiché en permanence en `--text-montant` `32px`, au-dessus du pavé. **Aucun second total, aucun sous-total, aucune remise affichée à côté** (B3). | pas de fondu, pas de défilement du chiffre | `en-caisie` | B3 |
| Ligne — tap | tap | Ouvre la ligne en `en-saisie` **dans la page**, sur `--color-surface-sunken` `#E2DAC9` : les trois champs, le pavé, le total. Le reste du devis reste visible au-dessus, pour comparer deux prix. | glissement vers le haut `220ms` `--ease-default` | `en-saisie` | B2 |
| Ligne — `action-supprimer` (jusqu'à 6 lignes) | tap | Ouvre la feuille de la ligne avec la question et ses deux nombres : `Retirer cette ligne ? Le total passera de 4 860 à 3 120 euros.` puis `Retirer` et `Annuler`. **Le prix après est écrit** : on ne demande pas de supprimer sans dire ce que devient le montant. | feuille modale basse `--shadow-lg`, `--radius-lg` `16px` | ligne retirée | B2 |
| Ligne — `action-supprimer` (7 lignes et plus) | tap | **Le bouton de suppression n'est plus dans la ligne.** Il est dans la feuille de la ligne, en `Bouton` variante `contour`, sous le montant. Raison : à partir de sept lignes, une colonne de boutons de suppression est à portée d'un pouce qui glisse dans une colonne de chiffres. | — | — | US-13 |
| Ligne à prix zéro | saisie | L'état `prix-zero` : **la ligne est conservée et affichée.** Son montant passe en `--color-texte-secondaire` `#4C4436`, jamais rayé, jamais masqué. Le total n'en tient pas compte, et l'écran ne dit rien de plus : un déplacement offert, une main d'œuvre incluse ou une garantie ne sont pas une erreur de saisie. | montant atténué, ligne intacte | `prix-zero` | E13 |
| Bouton `Revoir le devis` | tap | Enregistre localement (B4) et passe à `/devis/D-2026-017`. Un second appui ne fait rien de plus. | état `chargement` : libellé `Enregistrement…` | `devis-detail` | B1, B4 |
| Appel entrant au milieu de la saisie | interruption | Le devis est déjà écrit au magasin local à chaque frappe. À la reprise, l'écran s'ouvre à l'identique, **ligne par ligne et au total près**, et la ligne en cours de modification est retrouvée avec ce qui a été saisi. Aucune confirmation, aucune perte, aucun dialogue. | aucun bandeau | `rempli` | E2 |
| Bandeau de file, en haut | tap | Aucun comportement. Il se lit. | — | — | B6 |

- **Focus / clavier** : ordre — en-tête (non focusable), chaque ligne, la ligne d'ajout, le total en lecture seule, le bouton de la barre d'action. Sur `--bp-poste`, la navigation clavier est complète et `Suppr` sur une ligne focalisée ouvre la feuille de suppression — jamais une suppression immédiate, parce qu'une suppression immédiate au clavier est une suppression qu'on ne voit pas.
- **Gestes** : défilement vertical, et rien d'autre. **Pas de balayage horizontal pour changer de ligne** : la PRD § 7.1 interdit le défilement horizontal, et un geste horizontal sur une ligne de chiffres est un geste qui change un prix. **Pas de pull-to-refresh**, pas de geste de duplication de ligne : dupliquer une ligne par geste est la façon la plus rapide de facturer deux fois la même fenêtre.
- **Animations** : ouverture et fermeture du pavé, glissement vertical `320ms`, `--ease-entree` `cubic-bezier(0, 0, 0, 1)` à l'ouverture et `--ease-sortie` `cubic-bezier(0.3, 0, 1, 1)` à la fermeture. Ouverture d'une feuille de ligne, `220ms` `--duration-normal`. **Le changement d'une mention d'état dure zéro milliseconde**, sans fondu : un fondu invite à regarder pendant la transition, donc à douter de ce qu'on a vu. **Le total ne défile pas** : sa valeur change instantanément.
- **Retour arrière** : **ne perd jamais la saisie.** Le bouton `Retour à Nouveau devis` conserve la ligne en cours ; le retour arrière du système est intercepté et traité comme ce bouton. Revenir à `suivi` puis rouvrir ce devis le retrouve identique, ligne pour ligne et au total près.

---

## 6. Responsive

| Breakpoint | Comportement | Ce qui se replie / disparaît |
|---|---|---|
| **Mobile** `--bp-telephone` 0 — 479px | Une colonne, marge `--space-lg` `16px`. Ligne `compacte` de `--hauteur-cible` `56px` : désignation sur 60 % de la largeur, `qté × PU = montant` aligné à droite en tabulaires. Le pavé numérique occupe la moitié basse ; **la barre basse disparaît** tant qu'il est ouvert ; le total reste posé juste au-dessus. | la barre basse, pendant l'ouverture du pavé |
| **Tablet** `--bp-tablette` 480 — 1023px | Marge `--space-xl` `24px`. Les lignes passent en variante `etendue` de 96px : désignation sur toute la largeur, puis quantité, prix unitaire et montant sur une grille de trois colonnes alignées. **C'est le format où Jean-Luc montre le devis au client**, donc il est le format où la désignation a le plus de place. Le pavé occupe le tiers inférieur. | rien d'autre |
| **Desktop** `--bp-poste` 1024 — 1439px | Deux colonnes : les lignes à gauche sur 360px, le devis à droite sur `--color-surface` `#F6F2E9`, la liste posée sur `--color-background` `#EDE8DC`. La différence de valeur de fond **est** la séparation. La barre d'action s'aligne sur la colonne des lignes et **reste en bas** — elle ne monte jamais. | rien |
| **Large** `--bp-large` 1440px et plus | Trois colonnes, contenu plafonné à `--space-3xl` `48px` de marge. | rien |

- **Cible tactile** : `--hauteur-cible` `56px` pour chaque ligne, pour chaque touche du pavé, pour le bouton de la barre d'action à `--hauteur-action-primaire` `60px`. Le pavé fait trois colonnes d'environ 104px sur 360px de large : des cibles utilisables avec un gant, ce que la PRD § 7.3 demande à 48px et ce que le design-system porte à 56px.
- **Débordement** : **aucun défilement horizontal, sur aucun breakpoint** (PRD § 7.1). Garanti par construction : `ChampMontant` a des largeurs fixes (`88px` la quantité, `128px` le montant), la ligne `compacte` réserve 40 % de droite à trois nombres tabulaires, et au-delà de treize lignes on **défile verticalement**. La désignation est le seul texte qui peut déborder : elle passe sur deux lignes, à `--text-corps` `17px` inchangé, avec `…` à la troisième. **Aucun montant n'est jamais tronqué ni réduit** : c'est le seul nombre du produit qu'on ne peut pas réécrire de mémoire.

---

## 7. Accessibilité

- [ ] **Contraste du texte courant** : mesuré par `node "$FORGE/scripts/design-check.js" contrast <anchor>`. **Aucun ratio n'est écrit ici** (design-system § 0.0 : un ratio rédigé à la main est un nombre fabriqué).
- [ ] **Contraste des grands textes** : mesuré par le même contrôle, sur `--text-montant` `32px` et `--text-h1` `30px`.
- [ ] **Navigation clavier complète** sur `--bp-poste` et `--bp-large`, y compris chaque ligne et la feuille de suppression.
- [ ] **Focus visible** : anneau `--color-bordure-focus` `#8A4A0E`, `--stroke-focus` `3px`, plus le halo `--color-teinte-survol` `#E4DCCB` à l'état `focus`. Jamais supprimé, jamais 2px — c'est le seul repère au doigt comme au clavier dans une cave.
- [ ] **ARIA** : le pavé numérique est un `role="group"` étiqueté, chaque touche porte `aria-label` explicite : `Deux`, `Virgule`, `Effacer le dernier chiffre`, `Valider`. Les lignes sont des `role="button"` avec un `aria-label` complet : `Ligne 3, Reprise des tableaux de sous-face, 1 fois 760 euros, soit 760 euros.` La valeur d'un montant est annoncée **en mots** par le lecteur d'écran, jamais seulement en chiffres. Le total est `aria-live="polite"` : il change à chaque chiffre, et un lecteur d'écran qui le dirait caractère par caractère parlerait au-dessus de Jean-Luc.
- [ ] **Texte alternatif** : aucune image sur cet écran. Le pavé numérique est fait de touches textuelles, pas d'icônes : une icône de chiffre dans un cercle serait illisible en plein soleil et inviterait à la devinette.
- [ ] **Langue et direction de lecture** : `lang="fr"`, `dir="ltr"`. Les quantités utilisent la virgule décimale française, jamais le point. Les montants sont tabulaires et la devise est écrite en toutes lettres, `euros`.

---

## 8. Données

| Champ | Type | Origine | Requis | Erreur possible |
|---|---|---|---|---|
| `ligne.designation` | texte libre | saisie, ou reprise de la désignation la plus fréquente du métier | oui | vide : la ligne n'est pas validée, et le message dit `Écrivez la désignation.` |
| `ligne.quantite` | décimal | saisie au pavé | oui | vide ou négative : refusée au clavier, jamais à la validation |
| `ligne.prix-unitaire` | décimal, deux décimales | saisie au pavé | oui | vide : refusée, message sous le champ |
| `ligne.montant` | décimal | **calculé**, jamais saisi | oui | jamais stocké : c'est le produit, donc il ne peut pas diverger du produit |
| `devis.lignes[]` | liste | magasin local | oui | liste vide : B1 bloque le passage à `devis-detail`, et le bouton le dit |
| `devis.total` | décimal, deux décimales | **calculé** à chaque frappe | oui | jamais stocké, jamais saisi, jamais affiché à côté d'un autre total |
| `devis.date-ecriture` | date | horloge simulée, à l'enregistrement | oui | **jamais modifiée** après coup : elle court pour la validité (B12, E15) |
| `champ.erreur` | texte | validation locale | non | jamais un code : c'est une phrase qui dit quoi faire |

- **Chargement** : tout d'un bloc, et **aucun chargement réseau sur l'écran** — le devis est dans le magasin local. Treize lignes à l'écran, pas davantage ; au-delà, c'est une liste qui défile verticalement. **Pas de pagination** : un devis de trente lignes est un devis rare, et une pagination invisible sur un document unique ajoute un état sans ajouter une information.
- **Cache / hors-ligne** : l'écran est intégralement fonctionnel hors-ligne (C1, E1). Le chiffrage se fait **avant** toute sortie, et tout ce qui est saisi est écrit au magasin local à chaque frappe — donc une coupure ne perd rien (B4, E2).
- **Données sensibles** : une désignation de ligne peut contenir le nom d'un chantier, donc l'adresse du client. **Aucun journal d'audit n'écrit une désignation de ligne** : le journal enregistre l'identifiant `D-2026-017`, le nombre de lignes et l'horodatage. Le contenu du devis ne quitte ni l'appareil (C11) ni le magasin local, et il n'est jamais rendu ni journalisé dans une vue de débogage.

---

## 9. Traçabilité

| ID | Origine | Manifestation sur cet écran |
|---|---|---|
| B1 | PRD | Le bouton `Revoir le devis` exige au moins une ligne. Sinon il reste visible en `desactive` avec la raison écrite : `Un devis porte au moins une ligne de travaux.` |
| B2 | PRD | Chaque ligne porte quantité, prix unitaire et montant ; le montant est **calculé**, donc il ne peut pas diverger du produit. La ligne à prix zéro est conservée et affichée, montant en secondaire, jamais rayée. Le total est la somme des lignes, deux décimales au plus. |
| B3 | PRD | **Un seul total à l'écran**, mis à jour à chaque chiffre, jamais masqué par le pavé. Pas de sous-total, pas de HT/TTC côte à côte, pas de remise. |
| B4 | PRD | Écriture locale à chaque frappe : l'appel entrant du milieu de la saisie ne perd rien, et le devis est retrouvable à l'identique. |
| B12 | PRD | La date du devis est affichée ici mais **jamais modifiable** : elle est celle de l'enregistrement, et elle ne bougera pas quand le devis partira dans trois semaines (E15). |
| E1 | PRD | Mode avion : l'écran est identique, aucune erreur réseau sur aucun champ. |
| E2 | PRD | Coupure en pleine saisie : la ligne en cours est retrouvée avec ce qui a déjà été saisi, et le devis rouvre ligne pour ligne, au total près. |
| E13 | PRD | `prix-zero` : la ligne **est** conservée, affichée, avec son montant en `--color-texte-secondaire` `#4C4436`, jamais rayé ni masqué. Le total n'en tient pas compte et l'écran ne dit rien de plus. |
| US-13 | PRD | Douze lignes d'une seule main : `--hauteur-cible` `56px`, aucun défilement horizontal, pavé épinglé au bas, et **le bouton de suppression quitte la ligne au-delà de six lignes** — parce qu'une colonne de boutons de suppression dans une colonne de chiffres est une suppression accidentelle. |
| PRD § 7.3 | PRD | Zones tactiles à 56px, utilisables avec un gant ; aucune action accessible sans bouton visible — la validation du pavé est un bouton `Valider`, pas un changement de champ automatique. |
| C1 | PRD | Aucune action ne suppose la connexion. |
| C7 | PRD | Aucun mot sur la comptabilité. |
| C8 | PRD | Aucune mention d'encaissement par carte ni par virement : le prix du paiement par carte est écrit dans `reglages`, avec le prix du produit, au même endroit. |

---

## 10. Checklist de gate

- [x] Les états sont décrits avec un rendu concret — les neuf lignes du tableau § 4 portent des libellés écrits, y compris les deux états vides, qui ont deux phrases différentes.
- [x] Chaque élément interactif a un comportement et un feedback ; un élément a explicitement « aucun comportement » — le bandeau de file — et c'est une décision.
- [x] Le responsive est défini à **chaque** breakpoint, avec le comportement `compacte` / `etendue` des lignes écrit à chacun, et la règle de disparition de la barre basse pendant le pavé.
- [x] La section Anti-générique est cochée et justifiée, une ligne par ligne, avec la valeur du token qui la rend vraie.
- [x] Aucune valeur de design n'est laissée à « à définir ».
- [x] Chaque ID B*/E*/C* de cet écran apparaît en section 9.
- [x] Aucun gabarit non résolu.
- [x] L'écran reste cohérent avec `.forge/design/design-system.md`.