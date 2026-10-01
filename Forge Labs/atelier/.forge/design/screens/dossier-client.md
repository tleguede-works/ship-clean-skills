---
type: screen
slug: dossier-client
title: Dossier d'un client
module: Clients
status: draft
generated_at: 2026-10-01
derived_from:
  - .forge/prd.md
  - .forge/design/design-system.md
  - .forge/roadmap.md
rule_ids: [B21, B24, B5, B23]
edge_case_ids: [E12, E14, E15]
flow: Client au téléphone
---

# Écran — Dossier d'un client

> Ce document est la **source de vérité** pour qu'une IA génère l'interface de cet écran.
> Il est généré depuis le gabarit de `skills/forge/templates/screen.md.tmpl`, jamais recopié.

**Scénario** — M. Roux appelle. Jean-Luc est dans sa camionnette. Il a `D-2026-014`, écrit le
15 mars, envoyé par courriel le 20 mars, signé, `4 860 euros`, et `D-2026-019`, écrit le
8 avril, `1 780 euros`, **écrit ici, pas encore envoyé**. Il cherche la réponse à deux questions
en deux minutes, devant son client.

---

## 1. Rôle de l'écran

| | |
|---|---|
| **Archétype d'app** | `mobile_field_ops` |
| **Module** | push depuis `clients` — rang 3 de la navigation |
| **Route** | `/clients/:id` |
| **Type** | page — layout « document », variante `simple` |
| **Utilisateurs** | Jean-Luc seul, au téléphone, un client qui attend de l'autre côté |
| **User stories servies** | US-11 (retrouver le dossier par son nom), US-12 (tout télécharger sans rien payer) |
| **Règles métier** | B21, B24, B23, B5 |
| **Edge cases** | E12, E14, E15 |

**Une phrase** : cet écran permet à Jean-Luc de **voir tout ce qui concerne un client, ce qui est sorti et ce qui ne l'est pas**, afin de **répondre à sa question en deux minutes, devant lui, sans rien ressaisir**.

**Pourquoi il est au rang 3 et non dans un overflow** : parce qu'on y va quand un client **appelle**, deux ou trois fois par mois, et qu'un client au téléphone qui attend n'attend pas qu'on cherche dans un menu `Plus`. Fréquence 3, centralité 4, score 12.

### 1.1 Ce que cet écran essaie d'éviter

Cet écran essaie d'éviter **le dossier qui ne distingue pas ce qui est parti de ce qui n'est pas parti**. B21 et US-11 demandent un dossier complet ; la tentation est donc de faire une liste de tout, triée par date, avec une somme en haut. Ce serait un dossier où la seule chose qui distingue `D-2026-014`, envoyé et signé, de `D-2026-019`, écrit et jamais sorti, est sa position dans l'ordre. Or c'est exactement l'information que Jean-Luc vient chercher, et c'est celle qui se perd le plus vite. Donc ce dossier a **deux groupes séparés, dans cet ordre, `Écrits ici, pas encore envoyés` puis `Partis, et signés`**, avec les trois mots écrits dans chaque ligne. La seconde chose refusée est **le groupe `Factures`, vide**. Le contrat § 1 promet un dossier « tous les devis et factures d'un client », et US-11 dit « tous les devis et toutes les factures ». Au MVP il n'y a aucune facture (roadmap § 2.2) — donc **le groupe n'existe pas** : pas grisé, pas marqué « bientôt », pas avec un `0`. Un groupe vide `Factures` ferait croire à un dossier incomplet, c'est-à-dire à une donnée manquante, alors qu'il n'y a rien à manquer. La troisième est **l'adresse saisie deux fois**. E12 dit que le client change d'adresse entre le devis et la facture : l'adresse est ici, dans le dossier, et **une seule fois** ; les documents suivants utilisent la version à jour sans ressaisie, et les devis déjà écrits gardent la leur. La quatrième est **la fusion de deux clients du même nom**. E14 est explicite, et l'erreur qu'il protège est irréparable : un devis envoyé au mauvais homonyme. Donc l'écran ne choisit jamais — il demande, et il affiche les adresses complètes pour que la différence soit visible.

### 1.2 Les trois mots, écrits dans l'écran

Les trois mentions sont **écrites dans les lignes du dossier**, pas dans un en-tête récapitulatif, et dans le groupe où elles se constateront le plus vite :

| Mention écrite | Preuve écrite | Où elle apparaît |
|---|---|---|
| `Écrit ici, pas encore envoyé` | `Sur ce téléphone. Personne ne l'a reçu.` | groupe `Écrits ici, pas encore envoyés` — `D-2026-019` |
| `Envoyé par courriel` | `Confirmé par le service de courriel le 20 mars à 18 h 12.` | groupe `Partis, et signés` — `D-2026-014` |
| `Parti en PDF partagé` | `Le 8 avril, date déclarée par vous. Rien ne l'a confirmée.` | groupe `Partis, et signés` — `D-2026-017` |

Et la date limite, en ligne compacte, dans le groupe 1 quand elle approche : `La date limite est le 8 mai.`

Et une quatrième information, propre à ce dossier : le compteur des documents de ce client qui ne sont pas sortis. Il est **en haut, en `--text-montant-geant` `44px`**, exactement comme sur `suivi`, et avec la même formule : `1 devis écrit ici, pas encore envoyé.` — parce que la question « ce client a-t-il reçu quelque chose ? » est la seule que Jean-Luc pose au téléphone, et elle doit se lire de biais, en une seconde.

---

## 2. Direction visuelle de cet écran

Repris du design system — **valeurs concrètes, jamais « à définir »**.

| | |
|---|---|
| **Mood** | dense, mate, sans emphase |
| **Densité** | **dense** — un dossier contient deux listes, pas un formulaire. La densité vient de lignes de 72px séparées par un filet `--color-tiret` `#BFB59E`, jamais d'une taille de texte réduite. |
| **Niveau de contraste** | **fort** — le nom du client en `--color-texte-principal` `#1F1B15` sur `--color-surface` `#F6F2E9`, l'adresse en `--color-texte-secondaire` `#4C4436`. Les deux groupes sont distingués par leur **titre** et leur filet, pas par une teinte de fond différente. |
| **Surface** | `--color-surface` `#F6F2E9` pour la page du dossier, sur `--color-background` `#EDE8DC` |
| **Accent utilisé** | `--color-encre-foncee` `#26211A` pour le bouton plein `Devis`. Aucune famille d'état ne colore le fond du dossier : les familles servent aux mentions et aux pastilles, pas aux conteneurs. |
| **Traitement photographique** | AUCUN |
| **Référence** | `suivi` sans le compteur global et avec un nom en haut : c'est la même liste, spécialisée à une personne. |

### 2.1 Anti-générique — obligatoire

Cet écran ne doit ressembler **à aucun** de ces défauts :

- [x] **Pas de fond blanc pur** `#FFFFFF` — la page est `--color-surface` `#F6F2E9` sur `--color-background` `#EDE8DC`.
- [x] **Pas de carte ombrée pour tout.** Aucune carte. L'en-tête du dossier, les deux groupes et le bloc d'export sont séparés par `--space-2xl` `32px` et un filet `--color-bordure-forte` `#4A4234`. Le bloc d'export est un bloc de 200px, **pas une carte flottante avec ombre** : c'est une promesse commerciale écrite dans le produit, elle ne flotte pas au-dessus d'une page.
- [x] **Pas d'uniformité** : cinq niveaux — `--text-h1` `30px` pour le nom du client, `--text-montant-geant` `44px` pour le compteur des non-envoyés, `--text-corps-fort` `17px` pour un nom de client dans une ligne, `--text-identifiant` `15px` pour `D-2026-014`, `--text-mention` `16px` pour les preuves et l'adresse.
- [x] **Pas de gris neutre générique** `#6B7280` — l'adresse est `--color-texte-secondaire` `#4C4436`, les filets `--color-tiret` `#BFB59E`.
- [x] **Pas de mise en page centrée symétrique** — tout est à gauche. Le compteur des non-envoyés est aligné à gauche comme le total, jamais centré : un chiffre centré devient un score.
- [x] **Pas d'illustration d'appoint** — pas d'avatar avec les initiales du client dans un cercle, pas d'icône de dossier, pas d'en-tête à dégradé. Le nom du client est du texte en 30px.
- [x] **Pas d'une seule famille de police** — `--font-texte` `Archivo` pour tout le texte, `--font-identifiant` `IBM Plex Mono` `15px` pour les numéros de devis.

**Choix assumé et non neutre** : **l'en-tête du dossier est un nom et une adresse, rien d'autre.** Pas de téléphone, pas de courriel, pas de bouton `Appeler`, pas de bouton `Envoyer un message`, pas de QR code, pas de bouton d'import. Un dossier d'artisan contient des documents ; il ne contient pas une fiche de contact de centre d'appel. Et **le seul bouton du dossier est `Devis`**, en bas à droite dans la zone du pouce, parce que la moitié des fois où Jean-Luc ouvre un dossier, c'est pour y créer un second devis.

---

## 3. Anatomie

```
┌─────────────────────────────────────────┐
│ FILE ATTENTE — bandeau 44px             │
├─────────────────────────────────────────┤
│ BARRE DE HAUTEUR 56px                   │
│  `Retour à Clients`                     │
├─────────────────────────────────────────┤
│ EN-TÊTE FICHE CLIENT — 120px           │
│  M. Roux                            30px│
│  12 rue de la Fontaine, 69000 Lyon      │
│  ▌ modifier l'adresse, ici, une fois    │
├─────────────────────────────────────────┤
│ COMPTEUR NON ENVOYÉS — ce dossier      │
│  1                                       │
│  devis écrit ici, pas encore envoyé.    │
├─────────────────────────────────────────┤
│ GROUPE LISTE `primaire` 40px           │
│  Écrits ici, pas encore envoyés   1    │
│  ├ LIGNE 72px : D-2026-019             │
│  │  D-2026-019      Écrit ici          │
│  │  8 avril 2026   La date limite      │
│  │                 est le 8 mai.      │
├─────────────────────────────────────────┤
│ GROUPE LISTE `secondaire` 32px         │
│  Partis, et signés                  2   │
│  ├ LIGNE 72px : D-2026-014  Envoyé     │
│  ├ LIGNE 72px : D-2026-017  PDF déclaré│
│  └ PAS de groupe `Factures` : AUCUN    │
├─────────────────────────────────────────┤
│ PANNEAU EXPORT — bloc de 200px         │
│  Vos devis et vos factures, dans un    │
│  seul fichier.                          │
│  Ce téléchargement est permanent et    │
│  ne coûte rien.                        │
│  [ Tout télécharger ]                   │
├─────────────────────────────────────────┤
│ [ Devis ] — LE POUCE, à droite         │
├─────────────────────────────────────────┤
│ NAVIGATION BASSE 68px — Clients actif │
└─────────────────────────────────────────┘
```

| # | Composant | Rôle | Source |
|---|---|---|---|
| 1 | `FicheClient` variante `simple` | le dossier d'un client : ce qui est sorti et ce qui ne l'est pas | design-system § 2 |
| 2 | `CompteurNonEnvoyes` variante `principal` | les documents de **ce** client qui ne sont pas sortis, en `44px` | design-system § 2 |
| 3 | `GroupeListe` variante `primaire` | les devis de ce client écrits ici et non envoyés | design-system § 2 |
| 4 | `GroupeListe` variante `secondaire` | les devis de ce client sortis et signés | design-system § 2 |
| 5 | `ListeDevis` variante `plate` | la structure de liste d'un dossier, **sans groupes de plus haut niveau** | design-system § 2 |
| 6 | `PastilleEtat` variante `sortie` | l'état de sortie de chaque devis | design-system § 2 |
| 7 | `LigneEcheance` variante `compacte` | la date limite de chaque devis de ce client | design-system § 2 |
| 8 | `PanneauExport` variante `permanent` | tout télécharger à tout moment, sans rien payer (B24) | design-system § 2 |
| 9 | `ChampTexte` variante `lecture` | l'adresse de facturation, **une fois** (E12) | design-system § 2 |
| 10 | `Bouton` variante `discret` | `Télécharger le dossier de ce client`, dans le tiers bas | design-system § 2 |
| 11 | `Bouton` variante `plein` | `Devis`, en bas à droite, dans la zone du pouce | design-system § 2 |
| 12 | `FileAttente` | l'état global d'envoi | design-system § 2 |
| 13 | `NavigationBasse` | la sortie du push | design-system § 2 |

---

## 4. États — tous, sans exception

| État | Déclencheur | Rendu | Feedback utilisateur |
|---|---|---|---|
| **Chargement** | Ouverture depuis une recherche | **Aucun squelette.** Le dossier est local. S'il n'est pas encore lu, le compteur passe à l'état `zero` et les groupes à leur état vide — pas de rectangle gris clignotant. | rien |
| **Rempli** | Le client a au moins un devis | Nom en `--text-h1` `30px`, adresse, compteur, puis `Écrits ici, pas encore envoyés` **puis** `Partis, et signés`, puis le `PanneauExport`, puis `Devis`. Chaque ligne porte le numéro, la `PastilleEtat` de sortie, la date et la `LigneEcheance` compacte. | le compteur se lit à un mètre |
| **Vide — jamais visité** | Le dossier vient d'être créé, aucun devis | Compteur à l'état `zero` : `Aucun devis en attente d'envoi pour ce client.` Les deux groupes à `vide-depuis-toujours` : `Aucun devis écrit ici pour ce client.` et `Aucun devis n'est encore parti vers ce client.` Puis `Devis` en bas. **Pas d'illustration d'accueil**, pas de « Bienvenue » : un dossier vide se décrit. | aucun |
| **Vide — aucune donnée** | Le client a eu des devis et n'en a plus dans un groupe | `GroupeListe` à l'état `vide-aujourdhui` : `Aucun devis écrit aujourd'hui pour ce client n'est encore parti.` La différence entre les deux vides est écrite dans la phrase, comme sur `suivi` : « rien n'a jamais eu lieu » et « ce qui avait lieu est résolu » ne sont pas le même fait. | aucun |
| **Erreur de chargement** | Le magasin local ne répond pas | **Le contenu déjà affiché reste affiché.** Au-dessus, `BandeauMessage` en état `echec` : `Le dossier de ce client n'est pas lisible sur cet appareil.` puis `Vos devis sont encore là.` et `Réessayer la lecture`. **Aucune liste vide à la place** : une liste vide pour un dossier illisible ferait croire que M. Roux n'a jamais eu de devis ici. | bandeau `--color-expire-fond` `#F4DED8`, il ne s'efface pas |
| **Erreur de soumission** | Le téléchargement du dossier échoue | L'export échoue **dans le `PanneauExport`**, pas dans le dossier : `PanneauExport` à l'état `echec`, en `--color-texte-expire` `#86210F` : `Le fichier n'a pas pu être fait.` puis `Réessayer`. **Le dossier reste entièrement lisible** — l'export est une copie, et l'échec d'une copie n'a pas de raison de cacher l'original. | le panneau d'export, et lui seul |
| **Succès** | Un devis de ce dossier est envoyé, ou l'export est prêt | **À l'envoi** : la ligne quitte le groupe 1 pour le groupe 2, le compteur baisse immédiatement (B23), et la mention passe à `Envoyé par courriel` avec sa preuve. **À l'export** : `PanneauExport` à l'état `pret` : `Le fichier est prêt.`, puis son nom et sa taille, puis `Enregistrer` et `Partager`. | bandeau `--color-confirme-fond` `#DEEAE1`, 6 s |
| **Hors-ligne / permissions** | Mode avion | **Le dossier est entièrement disponible** (C1) : nom, adresse, groupes, lignes, compteur. L'export aussi : il produit un fichier sur l'appareil, il ne contacte personne. **Aucun bandeau réseau, aucune mention de couverture** — le dossier n'a pas de dépendance réseau du tout, donc il n'a rien à signaler. | rien |
| **Lecture seule** | Ce client a un devis signé dont la signature est valide | La ligne du groupe 2 porte en plus l'empreinte `4f2a…9c1d` en `--font-identifiant` `IBM Plex Mono` et `--color-texte-encre-signature` `#1F4C6B`. **Aucune action de modification sur la ligne** : un document signé est figé, et le dossier ne propose rien qui le déferait. L'adresse, elle, reste modifiable — elle ne fait pas partie du devis. | — |

> Un état non décrit est un état non implémenté.

---

## 5. Interactions

| Élément | Événement | Comportement | Feedback visuel | État résultant | ID |
|---|---|---|---|---|---|
| Ligne de devis | tap | Push vers `/devis/:numero`. **La liste retrouve l'endroit exact où elle était** au retour. | glissement `220ms` `--duration-normal` | `devis-detail` | B25 |
| Adresse du dossier | tap | Ouvre la modification de l'adresse **une seule fois, ici** : c'est la seule place du produit où elle se saisit. Les devis déjà écrits gardent l'adresse qui figurait sur eux ; les suivants utilisent la version à jour. | `ChampTexte` passe de `lecture` à `saisie`, étiquette `Adresse de facturation`, aide `Les devis déjà écrits gardent l'adresse qu'ils portaient.` | `saisie` | E12 |
| Deux clients du même nom | tap | L'écran **demande lequel**, et n'affiche qu'une entrée de dossier par homonyme, chacun avec son adresse complète. **Aucun n'est présélectionné** (E14). | — | `plusieurs` | E14 |
| Compteur des non-envoyés | tap | **Aucun comportement.** C'est un fait, pas un contrôle. Sur ce dossier il n'y a pas de partage groupé : le partage en un geste est une action de `suivi`, qui concerne tous les devis non envoyés, pas ceux d'un client. | — | — | B23 |
| `Devis`, en bas à droite | tap | Ouvre `/devis` avec le dossier client déjà rattaché : le champ du nom est rempli et l'adresse est reprise. **La moitié des ouvertures de dossier sert à faire un second devis** pour ce client. | `Bouton` `plein` 56px | `devis-nouveau` | US-1 |
| `Tout télécharger` | tap | Produit le fichier unique de tous les devis et de toutes les factures, **gratuitement et sans abonnement** (B24). Le bouton passe en état `preparation` : `Préparation en cours.` **Sans barre de progression** — l'export n'est pas un envoi, et un pourcentage serait un chiffre que le produit n'a pas. Le bouton reste `desactive` à sa place, il n'est pas masqué : l'écran ne bouge pas. | — | `pret` | B24 |
| `Télécharger le dossier de ce client` | tap | Produit le dossier de ce client seul, dans la même promesse : permanent, gratuit. `Bouton` variante `discret`, dans le tiers bas. | — | `pret` | B24, US-11 |
| `Retour à Clients` | tap | Pop vers l'écran de recherche, qui **retrouve le terme tapé**. Le retour système est intercepté et traité comme ce bouton. | glissement inverse `220ms` | `clients` | E2 |
| Appel entrant au milieu de la consultation | interruption | Rien à perdre : aucun champ de saisie n'est en cours sur cet écran. Le dossier rouvre à l'identique, groupe par groupe, ligne par ligne. | aucun bandeau | `rempli` | E2 |

- **Focus / clavier** : ordre — `Retour à Clients`, le nom du client, l'adresse, le compteur, chaque groupe puis chaque ligne, le `PanneauExport`, `Devis`, la barre basse. Anneau `--color-bordure-focus` `#8A4A0E`, `--stroke-focus` `3px`, jamais supprimé. Sur `--bp-poste` et `--bp-large`, la navigation clavier est complète et les deux groupes sont des `role="region"` étiquetés par leur titre.
- **Gestes** : défilement vertical. **Aucun pull-to-refresh** : le dossier est local, et un geste de rafraîchissement qui ne peut rien charger ajoute un espacement de geste pour une information fausse. **Pas de swipe pour supprimer un devis** : un devis n'est pas supprimé d'un geste, et il ne l'est pas du tout — il se refuse depuis `echeance`, avec une question.
- **Animations** : `--duration-normal` `220ms` pour le push vers le devis, `--ease-default`. **Le changement de mention d'état d'une ligne dure zéro milliseconde**, sans fondu. Le compteur **ne s'incrémente pas en boucle** : un compteur qui s'anime est un compteur dont la valeur n'est pas encore connue. Le `PanneauExport` à l'état `preparation` **n'anime rien** : pas de rotation, pas de progression.
- **Retour arrière** : intercepté, traité comme `Retour à Clients`. **La liste de recherche retrouve le terme tapé**, parce que l'appel entrant a pu couper la recherche (E2), et parce que perdre ce qu'on tapait ferait rouvrir l'écran vide.

---

## 6. Responsive

| Breakpoint | Comportement | Ce qui se replie / disparaît |
|---|---|---|
| **Mobile** `--bp-telephone` 0 — 479px | Une colonne, marge `--space-lg` `16px`. En-tête 120px : le nom en `--text-h1` `30px` sur une ligne, l'adresse en `--text-mention` `16px` sur deux lignes au maximum. Lignes de 72px. Le bouton `Devis` est en bas à droite, 56px, dans `--zone-pouce` `96px`. | rien |
| **Tablet** `--bp-tablette` 480 — 1023px | Marge `--space-xl` `24px`. Les lignes passent en lecture `etendue` : désignation pleine largeur puis trois colonnes alignées — c'est le format où Jean-Luc montre le dossier au client. Le `PanneauExport` passe à deux blocs côte à côte : la promesse à gauche, le bouton à droite. | rien |
| **Desktop** `--bp-poste` 1024 — 1439px | Deux colonnes : le dossier à gauche sur 360px, le devis ouvert à droite sur `--color-background` `#EDE8DC`. Séparation par la différence de valeur de fond, pas par une ombre ni une bordure. | rien |
| **Large** `--bp-large` 1440px et plus | Trois colonnes : navigation, liste, dossier. Contenu plafonné à `--space-3xl` `48px` de marge. La barre basse **reste en bas**, pleine largeur. | rien |

- **Cible tactile** : `--hauteur-cible` `56px` pour le bouton `Devis`, pour les boutons du `PanneauExport`, pour la zone d'édition de l'adresse. Les lignes de 72px sont cliquables sur toute leur hauteur.
- **Débordement** : **aucun défilement horizontal** (PRD § 7.1). Le nom d'un client peut être long : il passe sur deux lignes à `--text-h1` `30px` puis se tronque avec `…` à la troisième, **et son numéro de dossier reste affiché juste en dessous**, pour qu'un nom tronqué reste identifiable. **Aucun montant n'est tronqué** : `4 860 euros` tient toujours, en tabulaires, dans la colonne de droite.

---

## 7. Accessibilité

- [ ] **Contraste du texte courant** : mesuré par `node "$FORGE/scripts/design-check.js" contrast <anchor>`. **Aucun ratio n'est écrit ici** (design-system § 0.0).
- [ ] **Contraste des grands textes** : mesuré par le même contrôle, sur `--text-montant-geant` `44px` et `--text-h1` `30px`.
- [ ] **Navigation clavier complète** sur `--bp-poste` et `--bp-large`, chaque groupe étant un `role="region"` étiqueté.
- [ ] **Focus visible** : anneau `--color-bordure-focus` `#8A4A0E`, `--stroke-focus` `3px`, jamais supprimé.
- [ ] **ARIA** : le compteur porte `aria-label="1 devis écrit ici, pas encore envoyé, pour ce client"` — le mot complet, jamais une abréviation, parce que c'est le compteur de `suivi` qui est abrégé en nombre et non celui-ci. Chaque `PastilleEtat` expose son libellé en texte et `aria-hidden` sur son icône. Les deux groupes sont des régions nommées : `Écrits ici, pas encore envoyés, 1 devis` et `Partis, et signés, 2 devis`. Le `PanneauExport` est `role="status"` pendant la préparation, pour qu'un lecteur d'écran annonce `Préparation en cours.` une fois.
- [ ] **Texte alternatif** : **aucune image sur cet écran.** Pas d'avatar, pas d'icône de dossier, pas de vignette de document : le contenu du dossier est du texte, donc sélectionnable, donc lisible par un lecteur d'écran et copiable par Jean-Luc dans un SMS à son client.
- [ ] **Langue et direction de lecture** : `lang="fr"`, `dir="ltr"`. Les dates en toutes lettres, jamais `J-3`, jamais `08/04`.

---

## 8. Données

| Champ | Type | Origine | Requis | Erreur possible |
|---|---|---|---|---|
| `client.id` | texte interne | magasin local | oui | jamais affiché à l'écran : Jean-Luc ne parle jamais d'un identifiant interne au téléphone |
| `client.nom` | texte | saisie, ou recherche | oui | homonymes : l'écran demande, il ne choisit pas (E14) |
| `client.adresse` | texte | dossier, modifiable ici une seule fois | non | absente sur un dossier ancien : le devis reste utilisable, l'adresse est demandée à la première facture |
| `client.courriel` | texte | dossier | non | absent : `sortie` retire alors le bloc `Envoyer par courriel` et écrit la raison |
| `devis[]` | liste des devis du client | magasin local | oui | liste vide : les deux groupes passent à leur état vide, avec leur phrase |
| `devis.etat-sortie` | énumération `attente` \| `confirme` \| `declaration` | magasin local | oui | incohérence refusée à la lecture et ramenée à `attente` |
| `devis.date-limite` | date | calculé | oui | jamais stocké : c'est une horloge |
| `compteur.non-envoyes` | entier | calculé | oui | **jamais arrondi, jamais masqué au-delà de 99** : au-delà de 99, le nombre est écrit en toutes lettres |
| `export.etat` | énumération `inactif` \| `preparation` \| `pret` | local | oui | `preparation` sans possibilité de revenir : le bouton reste à la place, jamais masqué |

- **Chargement** : tout d'un bloc, **depuis le magasin local**. **Aucune pagination** : trente devis par an, c'est trente lignes sur quatre ans pour un même client ; une pagination sur un dossier d'artisan serait un état sans information. Le seul cas où la liste est longue est un client à qui Jean-Luc refait une fenêtre tous les deux ans, et il est encore sous la trentaine de lignes.
- **Cache / hors-ligne** : **le dossier est entièrement hors-ligne**, y compris l'export (C1). C'est la seule raison pour laquelle la promesse de pouvoir tout télécharger est crédible dès le MVP : le fichier se produit sur l'appareil, sans serveur, sans frais et sans réseau.
- **Données sensibles** : le dossier contient l'adresse de facturation et les noms des documents du client (C11). **Aucun journal d'audit n'écrit un nom de client ni une adresse** : le journal enregistre le numéro du devis, l'action et l'horodatage. Le fichier d'export contient les documents complets — c'est le but de B24 — et il **reste sur l'appareil** tant que Jean-Luc ne l'a pas partagé, et il ne part qu'auprès de la personne que Jean-Luc choisit. Aucune donnée ne part chez une régie publicitaire, une mesure d'audience tierce ou un réseau social (C11).

---

## 9. Traçabilité

| ID | Origine | Manifestation sur cet écran |
|---|---|---|
| B21 | PRD | Le dossier regroupe tous les devis et toutes les factures du client, trouvables par son nom. Au MVP il n'y a pas de facture : le groupe `Factures` **n'existe pas**, donc B21 est honoré au maximum de ce qui existe. |
| B24 | PRD | `PanneauExport` en permanence dans le tiers bas : `Vos devis et vos factures, dans un seul fichier.` puis `Ce téléchargement est permanent et ne coûte rien.` Puis `Tout télécharger`. **Aucun compte, aucun abonnement, aucune « version premium » en dessous.** |
| B23 | PRD | Le compteur des devis de **ce** client qui ne sont pas sortis est permanent, exact, et en `--text-montant-geant` `44px` — la même mesure que sur `suivi`, donc Jean-Luc n'a pas deux chiffres différents à retenir. |
| B5 | PRD | Les trois mentions sont **écrites dans les lignes**, avec leur preuve, dans le groupe où elles se constatent le plus vite. |
| E12 | PRD | L'adresse est ici, dans le dossier, **et une seule fois** : `ChampTexte` variante `lecture` avec une action `modifier`. Les devis déjà écrits gardent leur adresse. |
| E14 | PRD | Deux clients du même nom ne sont pas confondus : l'application **demande lequel**, et chaque entrée porte son adresse complète. Aucun choix automatique. |
| E15 | PRD | Un devis écrit puis jamais envoyé se retrouve ici à son état exact, avec sa date d'écriture et sa date limite d'origine. |
| C1 | PRD | Hors-ligne, le dossier est complet : nom, adresse, groupes, lignes, compteur, et l'export produit un fichier. Aucun bandeau réseau sur cet écran. |
| C6 | PRD | **Aucune proposition de « nettoyer » ou de « purger » quoi que ce soit.** Les factures sont conservées dix ans, les devis deux ans, les sauvegardes trente jours, et l'export est permanent et gratuit — donc aucun bouton de suppression de masse n'existe ici, et pas de non plus sur les lignes. |
| C11 | PRD | Aucun journal du nom du client ni de son adresse. Le fichier d'export reste sur l'appareil tant que Jean-Luc ne le partage pas. |
| C7 | PRD | **Aucun groupe `Comptabilité`.** Aucun mot sur un compte, une trésorerie ou une déduction. Le produit ne dit jamais qu'il tient une comptabilité, parce qu'il n'en tient pas. |
| C8 | PRD | **Aucun mot sur l'encaissement par carte**, ni dans le dossier, ni dans le fichier exporté. Le prix du paiement par carte est écrit dans `reglages`, avec son montant en euros. |

---

## 10. Checklist de gate

- [x] Les états sont décrits avec un rendu concret. Les deux états vides ont **deux phrases différentes**, parce que « rien n'a jamais eu lieu » et « ce qui avait lieu est résolu » ne sont pas le même fait.
- [x] Chaque élément interactif a un comportement et un feedback ; le compteur a explicitement « aucun comportement », et l'absence du groupe `Factures` est une décision écrite et justifiée.
- [x] Le responsive est défini à **chaque** breakpoint, avec le passage en lecture `etendue` à partir de 480px et le plafonnement du nom de client.
- [x] La section Anti-générique est cochée et justifiée.
- [x] Aucune valeur de design n'est laissée à « à définir ».
- [x] Chaque ID B*/E*/C* de cet écran apparaît en section 9 : B5, B21, B23, B24, E12, E14, E15, C1, C6, C7, C8, C11.
- [x] Aucun gabarit non résolu.
- [x] L'écran reste cohérent avec `.forge/design/design-system.md`.