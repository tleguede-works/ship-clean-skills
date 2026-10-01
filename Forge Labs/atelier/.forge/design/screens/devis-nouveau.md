---
type: screen
slug: devis-nouveau
title: Nouveau devis
module: Devis
status: draft
generated_at: 2026-10-01
derived_from:
  - .forge/prd.md
  - .forge/design/design-system.md
  - .forge/roadmap.md
rule_ids: [B1, B12, B13]
edge_case_ids: [E1, E12, E13, E14]
flow: Boucle principale
---

# Écran — Nouveau devis

> Ce document est la **source de vérité** pour qu'une IA génère l'interface de cet écran.
> Il est généré depuis le gabarit de `skills/forge/templates/screen.md.tmpl`, jamais recopié.

---

## 1. Rôle de l'écran

| | |
|---|---|
| **Archétype d'app** | `mobile_field_ops` |
| **Module** | Devis — rang 2 dans la navigation |
| **Route** | `/devis` |
| **Type** | page — layout « saisie », première étape |
| **Utilisateurs** | Jean-Luc seul, debout, une main, devant le client qui attend |
| **User stories servies** | US-1 (faire un devis devant le client), US-8 (la durée de validité est choisie avant le premier envoi) |
| **Règles métier** | B1, B12, B13 |
| **Edge cases** | E1, E12, E13, E14 |

**Une phrase** : cet écran permet à Jean-Luc de **nommer le client et fixer la durée de validité d'un devis qui n'existe pas encore**, afin de **commencer devant le client sans stylo et sans feuille**.

**Pourquoi il est au rang 2 de la navigation** : fréquence 3, centralité 5, score 15. Créer un devis est peu fréquent — trente par an, deux ou trois par mois — mais c'est **l'acte** que le PRD § 1.1 nomme comme problème principal, et aucun autre module n'existe sans lui. C'est le cas d'exception « fréquence basse, centralité maximale ». L'entrée `Devis` **ouvre directement cet écran**, sans passer par une liste de devis à créer : une liste de devis vierges serait un écran où il n'y a jamais rien.

### 1.1 Ce que cet écran essaie d'éviter

Cet écran essaie d'éviter **d'afficher une identité à un devis qui n'a pas d'identité**. Le réflexe de tout formulaire est de montrer un numéro de devis en haut, `D-2026-017`, puis la date du jour — parce que c'est ainsi que sont faits les formulaires. Ce serait deux mensonges : B1 dit qu'un devis sans identifiant, sans date, sans client et sans ligne **n'est pas enregistrable**, donc un numéro affiché ici promet un enregistrement qui n'a pas eu lieu ; et l'en-tête du document afficherait une date que le devis ne porte pas encore. Jean-Luc lit ce numéro à voix haute au client, qui le retient, qui le rappellera dans trois semaines — et ce serait un numéro sans devis derrière. L'en-tête de cet écran est donc en état `partiel`, et il dit `Devis en cours — pas encore enregistré`. La seconde chose refusée est **le client saisi de mémoire** : cet écran ne demande pas `Nom du client` et une adresse, il demande un nom et **cherche** le dossier, parce qu'une adresse saisie deux fois est une adresse qui divergera (E12). Et la troisième est **la validation en deux temps** : il n'y a pas de bouton `Enregistrer` qui enregistre un devis incomplet en attendant la suite, parce qu'un devis enregistré avec un client faux est un devis que Jean-Luc retrouvera trois semaines plus tard et enverra au mauvais nom (E14).

### 1.2 Les trois mots, écrits dans l'écran

Avant même d'être envoyé, le devis que cet écran crée possède déjà son état de sortie, et il est **écrit** — pas dans un glossaire, dans l'écran :

`Devis D-2026-017 enregistré. Écrit ici, pas encore envoyé.`

C'est le seul état qu'un devis puisse avoir sans qu'aucune action de Jean-Luc l'ait mise en place, et il est donc l'état d'arrivée de cet écran, pas un état de sortie à proprement parler (design-system § 0.3). Sa ligne de preuve, au moment où Jean-Luc enregistre : `Sur ce téléphone. Personne ne l'a reçu.`

---

## 2. Direction visuelle de cet écran

Repris du design system — **valeurs concrètes, jamais « à définir »**.

| | |
|---|---|
| **Mood** | dense, mate, sans emphase |
| **Densité** | **dense** — quatre blocs et une barre d'action. Un écran aéré ici coûterait deux défilements de pouce avant la première ligne de travaux, devant un client qui attend. La densité vient de `--space-lg` `16px` à l'intérieur d'un bloc et `--space-xl` `24px` entre deux blocs, pas d'une taille de texte réduite. |
| **Niveau de contraste** | **fort** — `--color-texte-principal` `#1F1B15` sur `--color-surface-sunken` `#E2DAC9` pour les champs. Les deux aides de saisie sont en `--color-texte-secondaire` `#4C4436`, jamais en gris pâle : elles disent des choses que Jean-Luc ne devinera pas. |
| **Surface** | `--color-surface` `#F6F2E9` sur `--color-background` `#EDE8DC`, champs en `--color-surface-sunken` `#E2DAC9` |
| **Accent utilisé** | `--color-encre-foncee` `#26211A` — fond du bouton plein de la barre d'action, hauteur `--hauteur-action-primaire` `60px`. **Aucun accent d'état** : cet écran ne affiche aucun état de sortie, donc aucune des cinq familles sémantiques n'y apparaît. C'est volontaire — un devis en cours n'a pas d'état de sortie. |
| **Traitement photographique** | AUCUN |
| **Référence** | `devis-lignes` est le même écran au chapitre suivant : la même colonne, la même barre d'action de `60px`, le même total épinglé. |

### 2.1 Anti-générique — obligatoire

Cet écran ne doit ressembler **à aucun** de ces défauts :

- [x] **Pas de fond blanc pur** `#FFFFFF` — le fond est `--color-background` `#EDE8DC`, et le champ est `--color-surface-sunken` `#E2DAC9`. Un formulaire générique est un formulaire blanc à champs gris `#F9FAFB` : les deux sont exclus.
- [x] **Pas de carte ombrée pour tout.** Les quatre blocs sont séparés par `--space-xl` `24px` et un filet `--color-bordure-forte` `#4A4234`, pas par quatre conteneurs. `--shadow-md` `0 2px 8px rgba(31,27,21,0.12)` est réservé à la feuille modale basse.
- [x] **Pas d'uniformité** : quatre niveaux coexistent — `--text-h2` `23px` pour le nom du bloc, `--text-etiquette` `14px` capitales au-dessus de chaque champ, `--text-corps` `17px` pour la saisie, `--text-montant` `32px` pour le total en cours. Le nom du client est le seul champ en taille `grande` `72px`, et c'est le seul champ dont la taille est un choix de sens : c'est le champ le plus long et le plus important.
- [x] **Pas de gris neutre générique** `#6B7280` — le filet d'un champ au repos est `--color-bordure-champ` `#6F6757`, le texte d'aide `--color-texte-secondaire` `#4C4436`.
- [x] **Pas de mise en page centrée symétrique** — tout est aligné à gauche, marge `--space-lg` `16px`, y compris le `GroupeBoutons`.
- [x] **Pas d'illustration d'appoint** — la ligne d'ajout est un texte : `Ligne de travaux`, puis `Pose de trois fenêtres coulissantes`. Pas d'icône `+` dans un cercle, pas de zone pointillée d'illustration.
- [x] **Pas d'une seule famille de police** — `--font-texte` `Archivo` partout, et le champ de durée affiche `30 jours` en `--font-identifiant` `IBM Plex Mono` `15px` quand il est sélectionné, parce que c'est une valeur qu'on recopie.

**Choix assumé et non neutre** : l'écran affiche **la date du jour en lecture, et elle ne peut pas être corrigée**. Un champ de date éditable inviterait Jean-Luc à antidater un devis, et une date antidatée est une validité qui ne correspond à aucun fait. À la place, la date est écrite et sa règle est écrite en dessous, en `--text-mention` `16px` : `La date d'aujourd'hui. Elle ne bougera pas si le devis part plus tard.` Un formulaire générique mettrait `<input type="date">` avec un calendrier — donc une question posée à un homme qui n'a pas de réponse, pour un fait qui n'a pas de choix.

---

## 3. Anatomie

```
┌─────────────────────────────────────────┐
│ FILE ATTENTE — bandeau 44px             │  ← si des envois attendent
├─────────────────────────────────────────┤
│ EN TÊTE DEVIS — variante `partiel`      │
│  `Devis en cours — pas encore enregistré`│  ← AUCUN numéro, AUCUNE date
│         (96px + la ligne qu'il occupe)  │
├─────────────────────────────────────────┤
│ BLOC CLIENT — --space-xl 24px          │
│  CHAMP RECHERCHE `dans-barre` 56px     │
│   └ étiquette `Nom du client`          │
│   └ proposition de création si 0       │
│  ADRESSE — CHAMP TEXTE `lecture`       │
├─────────────────────────────────────────┤
│ BLOC DURÉE — --space-xl 24px           │
│  GROUPE BOUTONS `trois` 56px × 3       │
│   `15 jours` `30 jours` `60 jours`     │
├─────────────────────────────────────────┤
│ BLOC TRAVAUX — --space-xl 24px         │
│  LIGNE DEVIS variante `vide`           │
│   `Ligne de travaux`                   │
│   `Pose de trois fenêtres coulissantes`│
├─────────────────────────────────────────┤
│ TOTAL BLOC variante `saisie` 72px      │  ← ÉPINGLÉ, au-dessus du pavé
│  montant --text-montant 32px           │
├─────────────────────────────────────────┤
│ BARRE D'ACTION 60px — LE POUCE         │
│  BOUTON `grande` `plein`               │
│   `Ajouter une ligne`                  │
├─────────────────────────────────────────┤
│ NAVIGATION BASSE 68px — Devis actif    │
└─────────────────────────────────────────┘
```

| # | Composant | Rôle | Source |
|---|---|---|---|
| 1 | `EnTeteDevis` variante `partiel` | dire que le devis n'existe pas encore, donc **sans numéro et sans date** (B1) | design-system § 2 |
| 2 | `ChampRecherche` variante `dans-barre` | retrouver le dossier client par son nom, et proposer la création quand le nom ne correspond pas (E14) | design-system § 2 |
| 3 | `ChampTexte` taille `grande` | le nom du client, le champ le plus long et le plus important — 72px | design-system § 2 |
| 4 | `ChampTexte` variante `lecture` | l'adresse de facturation venue du dossier client, modifiable **une fois, dans le dossier** (E12) | design-system § 2 |
| 5 | `GroupeBoutons` variante `trois` | la durée de validité : 15, 30, 60 jours, avec `30 jours` marqué `recommandé` (B12) | design-system § 2 |
| 6 | `LigneDevis` variante `vide` | la ligne d'ajout, en texte et non en icône (E13) | design-system § 2 |
| 7 | `TotalBloc` variante `saisie` | le montant affiché **pendant** la saisie, jamais masqué (B3, PRD § 7.1) | design-system § 2 |
| 8 | `Bouton` variante `plein` taille `grande` | l'action principale, à `--hauteur-action-primaire` `60px`, en bas | design-system § 2 |
| 9 | `BandeauMessage` | confirmer l'enregistrement en portant la mention complète | design-system § 2 |
| 10 | `FileAttente` | l'état global d'envoi, repris tel quel sur tous les écrans | design-system § 2 |
| 11 | `NavigationBasse` | la sortie de l'écran, qui ne perd jamais la saisie | design-system § 2 |

---

## 4. États — tous, sans exception

| État | Déclencheur | Rendu | Feedback utilisateur |
|---|---|---|---|
| **Chargement** | Ouverture depuis la barre basse | **Aucun squelette.** La recherche client est locale (SQLite sur OPFS) et le dossier n'a pas de réseau à attendre. L'écran s'ouvre directement sur le champ vide, à l'état `inactif` de `ChampRecherche` : étiquette `Nom du client`, texte d'indication `Un seul nom suffit.` | rien |
| **Rempli** | Un dossier client est trouvé | Le nom passe en `ChampTexte` `rempli`, étiquette flottante au-dessus. L'adresse apparaît en `ChampTexte` variante `lecture`, filet `--color-tiret` `#BFB59E`. La durée porte `30 jours` en `selectionne`. | l'adresse s'inscrit seule : elle ne se saisit pas (E12) |
| **Vide — jamais visité** | Première saisie de l'histoire, aucun devis | `EnTeteDevis` `partiel` : `Devis en cours — pas encore enregistré`. `GroupeBoutons` à l'état `inactif`, trois boutons `contour` avec `recommandé` au-dessus de `30 jours`. `LigneDevis` à l'état `vide` : étiquette `Ligne de travaux`, puis le texte `Pose de trois fenêtres coulissantes`. Le total affiche `0 euros`. Le bouton de la barre d'action est en `desactive`, avec la raison écrite juste au-dessus : `Un devis porte un nom de client et au moins une ligne de travaux.` | rien d'alarmant — c'est un début, pas une panne |
| **Vide — aucune donnée** | Jean-Luc tape un nom qui ne correspond à aucun dossier | `ChampRecherche` à l'état `sans-resultat` : `Aucun client ne porte ce nom.` puis, en dessous, la **création** proposée comme la réponse la plus fréquente : `Nouveau dossier pour M. Roux ?` en `Bouton` variante `contour`. La recherche échoue rarement ; c'est la création qui est le plus souvent la bonne réponse. | — |
| **Erreur de chargement** | Le magasin local ne répond pas | Les champs déjà saisis **restent saisis et affichés**. Un `BandeauMessage` en état `echec` : `Les clients écrits sur ce téléphone ne sont pas lisibles. Vos devis sont encore là.` avec `Réessayer la lecture`. Le bouton de la barre d'action passe en `desactive` : `Le nom du client ne peut pas être vérifié. Réessayez la lecture.` | bandeau `--color-expire-fond` `#F4DED8`, **il ne s'efface pas** |
| **Erreur de soumission** | B1 refuse l'enregistrement : un des quatre éléments manque | Le bouton de la barre d'action reste visible et **en `desactive`**, et la raison est écrite au-dessus de lui en `--color-texte-expire` `#86210F` : `Il manque : le nom du client.` ou `Il manque : une ligne de travaux.` — la ligne dit ce qu'il faut **faire**, jamais ce qui est invalide. **Aucune fenêtre modale, aucun toast** : un devis se remplit debout, une modale à remplir serait une modale à fermer. | texte permanent, pas d'alerte |
| **Succès** | Les quatre éléments de B1 sont réunis et le devis est enregistré | `EnTeteDevis` passe à l'état `complet` : numéro `D-2026-017` en `--font-identifiant` `IBM Plex Mono` `15px` en `--color-texte-secondaire` `#4C4436`, date `12 avril 2026` en `--text-mention` `16px`, nom du client en `--text-h3` `20px`. Un `BandeauMessage` en état `succes` écrit : `Devis D-2026-017 enregistré. Écrit ici, pas encore envoyé.` puis sa preuve : `Sur ce téléphone. Personne ne l'a reçu.` | bandeau `--color-confirme-fond` `#DEEAE1`, filet gauche `--color-bordure-confirme` `#3C7A59` `4px`, 6 s. **Le bouton change de rôle** : `Ajouter une ligne` devient `Continuer`. |
| **Hors-ligne / permissions** | Mode avion, dans une cave | **Rien ne change et rien ne se signale.** Aucune action de cet écran ne suppose la connexion (C1) : c'est le fonctionnement normal, pas un mode dégradé. Le bandeau de file, s'il existe, écrit `Pas de réseau ici.` — mais la saisie, elle, est entièrement disponible. | aucun avertissement sur les champs |
| **Lecture seule** | Un devis déjà enregistré est rouvert ici — cas de la reprise après coupure | Tout le formulaire passe en `desactive` : champs au fond `--color-surface-sunken` `#E2DAC9` à 60 %, texte `--color-texte-desactive` `#8B8272`, `GroupeBoutons` à l'état `desactive` avec la ligne qui va avec : `La durée de validité est fixée avant le premier envoi. Elle ne s'applique qu'aux devis écrits après.` Le bouton de la barre d'action devient `Ouvrir le devis`. | — |

> Un état non décrit est un état non implémenté.

---

## 5. Interactions

| Élément | Événement | Comportement | Feedback visuel | État résultant | ID |
|---|---|---|---|---|---|
| `ChampRecherche` — saisie | typing | Filtre **local**, et les résultats **apparaissent sous le champ**, jamais dans un autre écran : passer à un autre écran ferait perdre ce qui est tapé si un appel entrant coupe (E2). | résultats en `FicheClient` réduites à une ligne, nom en `--text-corps-fort` `17px`, adresse en `--text-mention` `16px` | `actif` | US-11 |
| Proposition `Nouveau dossier pour M. Roux ?` | tap | Crée le dossier et le rattache au devis en cours. Le nom est repris tel quel, jamais corrigé ni complété : une application qui « devine » un nom écrit une adresse au mauvais client. | champ passe en `rempli`, adresse vide avec l'aide `L'adresse se saisit ici, une fois.` | `rempli` | E14 |
| Deux dossiers du même nom | tap | Les **deux** sont listés, chacun avec son adresse complète, **aucun présélectionné** (E14). L'application demande lequel ; confondre deux dossiers, c'est envoyer un devis au mauvais client. | — | `plusieurs` | E14 |
| `GroupeBoutons` — `15 jours` | tap | Sélectionne. Le bouton choisi passe en `plein` `--color-encre-foncee` `#26211A`, les deux autres s'atténuent à 60 %. **Un seul bouton plein à la fois** : c'est la seule place du produit où `plein` sert à montrer une sélection et non une action. | `--duration-fast` `120ms`, `--ease-default` `cubic-bezier(0.2, 0, 0, 1)` | `selectionne` | B12 |
| `LigneDevis` variante `vide` | tap | Ouvre la ligne en état `en-saisie` : désignation en `ChampTexte`, puis quantité et prix unitaire en `ChampMontant`, pavé numérique épinglé au bas de l'écran. | le pavé occupe la moitié basse, **le total reste visible juste au-dessus** | `en-saisie` | US-13 |
| Champ de quantité, montant, prix unitaire | tap | Pavé numérique en `0 1 2 3 4 5 6 7 8 9 ,`, quatre lignes sur trois colonnes, la ligne du bas portant `,` puis `Effacer` puis `Valider`. Un montant négatif est **refusé au clavier**, pas à la validation. | pavé sur `--color-surface-raised` `#FBF9F4`, `--radius-lg` `16px`, `--shadow-lg` `0 -4px 24px rgba(31,27,21,0.18)` | `en-saisie` | E13 |
| Total pendant la frappe | saisie | Le total est **mis à jour à chaque chiffre** et affiché en permanence au-dessus du pavé, en `--text-montant` `32px` (B3). Un total « provisoire » n'existe pas : le total affiché, le total imprimé et le total couvert par la signature sont le même nombre. | aucune animation du chiffre — un chiffre qui défile est un chiffre dont on n'est pas sûr | `en-caisie` | B3 |
| Bouton `Ajouter une ligne` | tap | Enregistre le devis **localement d'abord** (B4), puis passe à `/devis/lignes`. Un second appui ne fait rien de plus. | état `chargement` : le libellé change en `Enregistrement…` | `devis-lignes` | B1, B4 |
| Bandeau de file, en haut | tap | Aucun comportement. Il se lit. | — | — | B6 |
| Bouton `Devis` de la barre basse | tap | **Aucun comportement ici** : c'est l'entrée courante. Le bouton reste visible et actif, il ne se grise pas — une entrée courante qui disparaît ferait croire que l'application a décroché. | filet haut `--color-bordure-forte` `#4A4234` `3px` sur toute la largeur de l'entrée ; **le fond ne change pas** | `actif` | B22 |
| Retour arrière du système | gesto | Traité exactement comme le bouton `Retour`. **Aucune confirmation, aucune perte** : le devis est écrit au magasin local à chaque frappe, donc un appel entrant au milieu de la saisie ne fait rien perdre (E2). | aucun | retour à `suivi` | E2 |

- **Focus / clavier** : ordre — champ du client, `GroupeBoutons` (flèches gauche/droite, `role="radiogroup"`), ligne d'ajout, bouton de la barre d'action. Sur `--bp-poste`, la navigation clavier est complète. Anneau `--color-bordure-focus` `#8A4A0E`, `--stroke-focus` `3px`, jamais supprimé.
- **Gestes** : défilement vertical, et **rien d'autre**. Pas de pull-to-refresh : cet écran n'a rien de distant à recharger. Pas de geste de balayage pour valider : une validation par balayage est une validation qu'on fait sans voir, et la PRD § 7.3 interdit qu'une action soit accessible sans bouton visible.
- **Animations** : l'ouverture du pavé numérique, glissement vers le haut `320ms` `--ease-entree` `cubic-bezier(0, 0, 0, 1)`. La fermeture, `320ms` `--ease-sortie` `cubic-bezier(0.3, 0, 1, 1)`. **Le total ne défile pas** et ne s'anime pas : sa valeur change instantanément, pour que Jean-Luc puisse dire ce qu'il vient de changer sans suivre le mouvement.
- **Retour arrière** : **ne perd jamais la saisie.** Le devis est écrit au magasin local à chaque frappe ; revenir à `suivi` puis revenir ici retrouve le devis à l'identique, ligne pour ligne et au total près (US-1). Le retour arrière du système est intercepté et traité comme le bouton `Retour`.

---

## 6. Responsive

| Breakpoint | Comportement | Ce qui se replie / disparaît |
|---|---|---|
| **Mobile** `--bp-telephone` 0 — 479px | Une colonne, marge `--space-lg` `16px`. `GroupeBoutons` `trois` sur trois colonnes égales de `56px` — `15 jours`, `30 jours`, `60 jours` tiennent sur 328px de contenu. Le pavé numérique est épinglé au bas et **la barre basse disparaît** tant qu'il est ouvert : deux barres empilées au bas laisseraient le pavé hors de la portée du pouce. | la barre basse, pendant l'ouverture du pavé |
| **Tablet** `--bp-tablette` 480 — 1023px | Marge `--space-xl` `24px`. Le pavé numérique occupe le tiers inférieur au lieu de la moitié. Le bouton de la barre d'action passe à `--hauteur-action-primaire` `60px`, pleine largeur moins `--space-lg` `16px` de chaque côté. | rien |
| **Desktop** `--bp-poste` 1024 — 1439px | Deux colonnes bornées à `--space-2xl` `32px` : les blocs Client et Durée à gauche, les blocs Travaux et Total à droite. La barre d'action reste **en bas**, alignée sur la colonne de droite — elle ne monte jamais dans la colonne, parce qu'une action qui se déplace selon la largeur n'est plus une position de pouce. | rien |
| **Large** `--bp-large` 1440px et plus | Trois colonnes, contenu plafonné à `--space-3xl` `48px` de marge. | rien |

- **Cible tactile** : `--hauteur-cible` `56px` minimum pour le champ client en `normale` et pour chaque bouton du `GroupeBoutons` ; `--hauteur-action-primaire` `60px` pour le bouton de la barre d'action. Les cibles du pavé numérique font `--hauteur-cible` `56px` de haut sur toute la largeur d'une colonne : trois colonnes de 104px, c'est trois cibles utilisables avec un gant.
- **Débordement** : **aucun défilement horizontal** (PRD § 7.1). Garanti par construction : `GroupeBoutons` `trois` a trois colonnes fixes ; les champs `ChampMontant` ont des largeurs fixes (`88px` la quantité, `128px` le montant) ; le nom du client est le seul champ dont le texte peut déborder, et il passe sur deux lignes à `--text-corps` `17px` inchangé. Un montant n'est **jamais** tronqué, jamais réduit, jamais remplacé par `…`.

---

## 7. Accessibilité

- [ ] **Contraste du texte courant** : mesuré par `node "$FORGE/scripts/design-check.js" contrast <anchor>`. **Aucun ratio n'est écrit ici** — le design-system § 0.0 l'interdit, et un ratio rédigé à la main devient faux au premier ajustement de palette.
- [ ] **Contraste des grands textes** : mesuré par le même contrôle, sur `--text-montant` `32px` et `--text-h2` `23px`.
- [ ] **Navigation clavier complète** sur `--bp-poste` et `--bp-large`, y compris le `GroupeBoutons` en `role="radiogroup"` avec flèches.
- [ ] **Focus visible** : anneau `--color-bordure-focus` `#8A4A0E`, `--stroke-focus` `3px`, plus le halo `--color-teinte-survol` `#E4DCCB` à l'état `focus` de `ChampTexte`. Jamais supprimé. La mention `30 jours` en `recommandé` est en `--text-etiquette` `14px`, qui est le seul token à 14px et qui n'est **jamais** employé dans une phrase.
- [ ] **ARIA** : chaque champ a une étiquette **toujours visible** au-dessus — jamais un texte d'indication qui disparaît à la frappe, parce qu'un texte d'indication qui s'efface laisse Jean-Luc sans étiquette au moment où il relit sa saisie, et c'est à ce moment-là qu'il vérifierait le total. Le groupe de boutons est `role="radiogroup"` avec `aria-describedby` pointant vers la mention `recommandé`. La barre d'action est `role="toolbar"` avec une seule action, donc `aria-label` explicite.
- [ ] **Texte alternatif** : aucune image sur cet écran. Les deux seules images du produit sont le document à signer et la piste de signature, et aucune n'est ici.
- [ ] **Langue et direction de lecture** : `lang="fr"`, `dir="ltr"`. Les montants sont en chiffres tabulaires `--font-texte` `Archivo`, la devise écrite en toutes lettres `euros` et jamais `€` collé au nombre — un artisan prononce « quatre mille huit cent soixante » sans symbole.

---

## 8. Données

| Champ | Type | Origine | Requis | Erreur possible |
|---|---|---|---|---|
| `client.nom` | texte | saisie, ou dossier trouvé | oui | vide : B1 bloque l'enregistrement, et la raison est écrite sous la barre d'action |
| `client.adresse` | texte | dossier client (E12) | non | absente : le devis est utilisable, l'adresse est demandée à la première facture ; ici l'aide dit `L'adresse se saisit ici, une fois.` |
| `devis.date-ecriture` | date | horloge simulée au moment de l'enregistrement | oui | jamais saisie par Jean-Luc : elle est le jour où le devis est écrit, et elle ne bouge pas ensuite (B12) |
| `devis.duree-validite` | énumération `15` \| `30` \| `60` | choix de Jean-Luc, défaut `30` | oui | choix absent : le défaut existe, il est écrit (`recommandé`) et Jean-Luc peut en partir |
| `devis.lignes[]` | liste de lignes | saisie | oui | liste vide : B1 bloque, raison écrite |
| `devis.total` | décimal | **calculé**, jamais saisi | oui | jamais stocké en double : le total est la somme des lignes, en euros, à deux décimales (B2) |
| `devis.numero` | texte | attribué à l'enregistrement | oui | **jamais affiché avant l'enregistrement** — un numéro afficherait une identité qui n'existe pas encore (B1) |

- **Chargement** : aucun chargement réseau sur cet écran. Tout vient du magasin local, et la recherche client est un filtrage en mémoire du magasin — d'où l'absence de tout squelette.
- **Cache / hors-ligne** : l'écran est intégralement fonctionnel hors-ligne (C1, E1). La seule donnée qui dépend du réseau est *la liste des dossiers déjà connus*, et elle est locale : c'est le principe « écriture locale d'abord » de `conventions.md`.
- **Données sensibles** : l'adresse du client est une donnée personnelle (C11). Elle est écrite dans le dossier et lue ici, jamais journalisée. Aucun journal d'audit ne contient un nom de client ni une adresse : le journal enregistre l'identifiant `D-2026-017`, l'action et l'horodatage.

---

## 9. Traçabilité

| ID | Origine | Manifestation sur cet écran |
|---|---|---|
| B1 | PRD | `EnTeteDevis` à l'état `partiel` : `Devis en cours — pas encore enregistré`, **sans numéro et sans date**. Le bouton d'enregistrement ne s'active qu'aux quatre éléments réunis, et la raison du refus est écrite : `Il manque : le nom du client.` |
| B12 | PRD | `GroupeBoutons` `trois` à l'état `inactif`, `30 jours` marqué `recommandé`, et une fois le choix fait, l'état `desactive` avec la règle écrite : la durée ne s'applique qu'aux devis écrits après. La date est en lecture et sa règle est écrite dessous. |
| B13 | PRD | La durée est choisie **avant** que l'horloge ne compte, donc avant toute décision sur un devis expiré. Aucun prix n'est modifié, aucune signature n'est produite, ici ni ailleurs : les trois issues sont dans `echeance`. |
| E1 | PRD | Mode avion : l'écran est identique. Aucune action n'affiche d'erreur causée par l'absence de réseau, et le bandeau de file, s'il existe, écrit le fait au lieu de signaler une panne. |
| E12 | PRD | L'adresse apparaît en `ChampTexte` variante `lecture`, et son aide dit qu'elle se modifie **dans le dossier, une fois** — pas à chaque devis. |
| E13 | PRD | `LigneDevis` variante `vide` conserve la ligne comme une ligne : l'état `prix-zero` la garde affichée, son montant en `--color-texte-secondaire`, jamais rayé, jamais masqué, et le total n'en tient pas compte. |
| E14 | PRD | Deux dossiers du même nom sont listés avec leur adresse complète et aucun n'est présélectionné. L'application demande, elle ne choisit pas. |
| C1 | PRD | Aucune action de cet écran ne suppose la connexion : c'est la première tranche, et elle se fait dans une cave. |
| C7 | PRD | Aucun mot sur la comptabilité, aucun lien, aucune tuile. |
| C8 | PRD | Aucune mention d'encaissement. Le prix du paiement par carte est écrit au seul endroit où il doit l'être : `reglages`, avec le sien, à côté du prix du produit. |

---

## 10. Checklist de gate

- [x] Les états sont décrits avec un rendu concret — les neuf lignes du tableau § 4 portent des libellés écrits. Les deux états vides ont deux phrases, parce qu'un devis qui n'a jamais existé et un dossier qui ne correspond à rien ne sont pas le même fait.
- [x] Chaque élément interactif a un comportement et un feedback ; deux éléments ont explicitement « aucun comportement » — l'entrée `Devis` de la barre basse et le bandeau de file — et c'est une décision écrite, pas un oubli.
- [x] Le responsive est défini à **chaque** breakpoint : `--bp-telephone`, `--bp-tablette`, `--bp-poste`, `--bp-large`, avec les hauteurs `--hauteur-cible` `56px` et `--hauteur-action-primaire` `60px` citées.
- [x] La section Anti-générique est cochée et justifiée, une ligne par ligne, avec la valeur du token qui la rend vraie.
- [x] Aucune valeur de design n'est laissée à « à définir ».
- [x] Chaque ID B*/E*/C* de cet écran apparaît en section 9 : B1, B12, B13, E1, E12, E13, E14, C1, C7, C8.
- [x] Aucun gabarit non résolu.
- [x] L'écran reste cohérent avec `.forge/design/design-system.md` : seuls des tokens déclarés, avec leur valeur déclarée ; aucun composant rendu hors de sa surface d'états.