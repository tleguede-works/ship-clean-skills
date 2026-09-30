---
type: screen
slug: export
title: Production d'un export
module: donnees-personnelles
status: draft
generated_at: 2026-09-30
derived_from:
  - .forge/prd.md
  - .forge/design/design-system.md
rule_ids: [B1, B2, B6, B7, B9, B10, B11, B16, B18, C1, C2, C6, C7, C9, C11, N1, N3, N4, N5, N6, N7, N8]
edge_case_ids: [E5, E7, E10]
flow: portabilite
---

# Écran — Production d'un export

> Ce document est la **source de vérité** pour qu'une IA génère l'interface de cet écran.
> Il est généré depuis le gabarit, jamais recopié. Aucun `{{PLACEHOLDER}}` ne doit subsister.

---

## 1. Rôle de l'écran

| | |
|---|---|
| **Archétype d'app** | `mobile_field_ops` (principal), `rental_tenancy` (secondaire) |
| **Module** | `donnees-personnelles` — hors barre principale, sous-écran |
| **Route** | `/donnees-personnelles/export` |
| **Type** | page |
| **Utilisateurs** | Le propriétaire, seul utilisateur (C3) |
| **User stories servies** | — (portée par B10, B11) |
| **Règles métier** | B1, B2, B6, B7, B9, B10, B11, B16, B18, C1, C2, C6, C7, C9, C11, N1, N3, N4, N5, N6, N7, N8 |
| **Edge cases** | E5, E7, E10 |

**Une phrase** : cet écran produit, **d'un geste**, l'un des trois exports de Bailly — le
dossier d'un locataire, la reprise complète, ou les comptes — **daté, lisible hors de
Bailly**, et il montre son contenu avant de l'envoyer.

**Pourquoi il est hors de la barre principale** : B10 dit que l'export est produit **à la
demande**, donc une destination permanente dirait qu'on y va chercher quelque chose en
attendant. Et cet écran **n'est jamais ouvert de lui-même** : il s'ouvre depuis la fiche
d'un dossier ou depuis `Plus`, toujours avec un dossier déjà sélectionné.

**La raison d'être de cette slice dans le MVP** : B11 est **la condition de survie du
produit**. « Si l'hébergeur meurt demain, je dois pouvoir récupérer mes 14 baux en une
journée. » Un export que seul Bailly sait lire n'est pas une sauvegarde, c'est une raison
de plus de ne jamais quitter Bailly. Donc cet écran est **le seul du produit qui produit un
document destiné à être lu ailleurs**, et sa conception est entirely tournée vers ça :
l'aperçu vient **avant** le bouton d'envoi, et l'horodatage est écrit en toutes lettres.

---

## 2. Direction visuelle de cet écran

| | |
|---|---|
| **Mood** | opérationnelle, parlante, sans alarme |
| **Densité** | **dense** — l'aperçu du document est en `--font-chasse` 14 px sur `--color-surface-sunken`, donc **il est le seul endroit du produit où l'écran est un éditeur de texte**. C'est un choix : un export qu'on n'a pas lu n'est pas vérifié, donc l'aperçu est la moitié de la fonctionnalité |
| **Niveau de contraste** | **fort** — l'aperçu est en chasse fixe sur un fond creusé, c'est-à-dire dans la configuration la plus lisible du thème sombre, parce que c'est de la **lecture de document**, pas de l'interface |
| **Traitement photographique** | **thumbnail** uniquement : l'aperçu affiche les premières lignes d'une image jointe sous forme d'une **vignette**, pas d'une image plein cadre, parce que l'export est un document textuel et que le texte est ce qui compte |
| **Référence** | la **fenêtre « enregistrer sous » d'un traitement de texte**, avec une différence : **l'aperçu est au-dessus du bouton, pas dessous**. Un export qu'on ne peut pas lire avant de l'envoyer est un envoi aveugle |

**Les valeurs portées par cet écran**

| Rôle | Token | Valeur |
|---|---|---|
| Fond de l'application | `--color-background` | `#101319` |
| Surface des lignes de forme | `--color-surface` | `#171B22` |
| Creux : l'aperçu du document | `--color-surface-sunken` | `#0A0C10` |
| Barre d'action | `--color-surface-raised` | `#212630` |
| Encre de lecture, nom du fichier | `--color-texte-principal` | `#E8ECF3` |
| Encre secondaire, choix de forme | `--color-texte-secondaire` | `#A6B0C0` |
| Encre tertiaire, horodatage, taille | `--color-texte-tertiaire` | `#8B95A5` |
| Ambre — segment choisi, non exporté | `--color-primaire-600` | `#E0A23A` |
| Sauge — export produit, « lisible sans Bailly » | `--color-confirme-600` | `#7FB08C` |
| Terre cuite — exclusion, « jamais dans l'export » | `--color-alerte-600` | `#F09286` |

| | |
|---|---|
| **Surface** | `--color-surface` `#171B22` sur `--color-background` `#101319` |
| **Accent utilisé** | `--color-primaire-600` `#E0A23A` pour le segment de forme choisi, et `--color-confirme-600` `#7FB08C` pour le panneau d'export produit. **La forme choisie et l'export produit sont les deux seuls moments où la couleur change d'état sur cet écran**, parce que ce sont les deux seuls qui annoncent quelque chose |

### 2.1 Anti-générique — obligatoire

- [x] **Pas de fond blanc pur `#FFFFFF`.** Fond `#101319` ; l'aperçu est sur `#0A0C10`, un
      fond **plus sombre** que la surface, parce qu'un document doit se lire comme du texte
      et pas comme une carte.
- [x] **Pas de carte ombrée pour tout.** Deux blocs : choix de la forme, et aperçu. Aucun n'a
      de rayon, **sauf l'aperçu**, qui est en `--radius-md` 10 px : c'est le seul composant du
      produit qui ressemble à une surface de travail, parce qu'il en est une.
- [x] **Pas d'uniformité.** Le nom du fichier est en 17 px 600 en chasse fixe ; l'aperçu est
      en 14 px 400 en chasse fixe ; les trois formes sont en 17 px, la choisie en 600 et les
      autres en 400 ; l'exclusion est en 14 px. **La graisse porte la hiérarchie à taille
      constante** dans l'aperçu, ce qui est la seule façon de garder un document lisible.
- [x] **Pas de gris neutre générique.** `#8B95A5` ne porte que des métadonnées. L'exclusion
      est en terre cuite et le panneau de confirmation en sauge : deux informations
      opposées, deux teintes opposées.
- [x] **Pas de mise en page centrée symétrique.** Blocs alignés à gauche, l'aperçu pleine
      largeur moins `--space-lg` de chaque côté.
- [x] **Pas d'illustration d'appoint générique.** Aucun glyphe de type de fichier dans un
      cercle, aucune icône de téléchargement, aucun logo de format. Les formats sont des
      **mots** : `Markdown` · `CSV` · `Markdown et CSV`.
- [x] **Pas d'une seule famille de police.** L'aperçu et le nom du fichier sont en
      `--font-chasse`, le reste en la pile système. C'est ici que la deuxième famille du
      produit trouve sa raison d'être la plus forte : **un document se lit en chasse fixe
      parce que ses colonnes s'alignent**, et un aperçu aligné permet de vérifier une date
      ou un montant d'un coup d'œil.

**Choix assumé et non neutre** : **l'aperçu vient avant le bouton.** L'écran montre les
vingt premières lignes du document, puis le bouton `Produire`. C'est l'inverse de la
conversation habituelle — on ne peut pas produire tant qu'on n'a pas regardé — et c'est
justifié par la seule chose qui compte ici : **la demande arrivera pendant un litige**,
donc au moment où le propriétaire est occupé et fait des erreurs. Lui montrer le document
avant de le produire est la seule manière que l'erreur d'export soit rattrapée avant qu'elle
atteigne un tiers.

---

## 3. Anatomie

```
BandeauSynchronisation                                  PERMANENT
        │
        ▼
TitreÉcran  variante `feuille`
├─ [retour] Bouton 44 pt
├─ [titre] "Export"
└─ [etat_ecriture] mot d'état ambre si l'export n'est pas encore confirmé
        │
        ▼
ListePlate  variante `groupee`
├─ [sur_titre] "QUEL EXPORT"
├─ LigneDonnée × 3   (variante `a_decider`, 52 pt avec bouton)
│   ├─ "Dossier d'un locataire"
│   │    "Pour le locataire, son avocat, un tribunal."
│   │    "Lisible, daté, au nom de la personne. Constaté seulement."
│   │    Bouton secondaire "Choisir"  → sélectionne, et PAS le segment :
│   │    ce sont trois boutons radio, pas un segment unique — parce que
│   │    les trois formes ne se valent pas, et un choix unique les
│   │    aplatirait.
│   ├─ "Reprise complète"
│   │    "Les 14 baux, pour le jour où l'hébergeur meurt.
│   │     Lisible sans Bailly."
│   │    Bouton secondaire "Choisir"
│   └─ "Comptes"
│        "Pour le comptable. Ce que la fiscalité attend."
│        Bouton secondaire "Choisir"
│
├─ LigneDonnée variante `lecture`      (seulement pour « dossier d'un locataire »)
│    "Locataire"  →  "Karim Breguet"   --font-chasse
│
├─ [sur_titre] "CE QUI N'ENTRE PAS DANS L'EXPORT"
├─ LigneDonnée × 1   sur --color-surface-sunken, 88 pt
│    "Tes jugements — « ce que j'ai observé » contre « ce que j'en pense ».
│     Les appréciations ne sortent d'aucun export, jamais, même par erreur
│     de saisie. Ce n'est pas une option de l'export : c'est la façon dont
│     la donnée est rangée."
│     Aucun interrupteur, aucune case à cocher, aucun bouton « inclure ».
│
├─ [sur_titre] "CE QUE LE FICHIER CONTIENT"     INTÉGRÉ
├─ LigneDonnée × 4
│   ├─ "Nom"      → "bailly-2026-09-12-karim-breguet.md"   --font-chasse
│   ├─ "Format"   → "Markdown"                --font-chasse
│   ├─ "Produit le" → "—" ou "12/09 · 19 h 12"  horodatage SERVEUR (C11)
│   └─ "Taille"   → "84 Ko"  ou  "— pas encore produit"
│
├─ [sur_titre] "APERÇU"          ← AVANT le bouton. C'est l'ordre de cet écran.
└─ ZoneTexte variante `lecture`  sur --color-surface-sunken, --radius-md
     20 premières lignes, en --font-chasse 14 px
     ┌────────────────────────────────────┐
     │ # Dossier — Karim Breguet           │
     │ 4e, rue Sainte-Catherine, 69001    │
     │                                    │
     │ ## Bail                            │
     │ Prise le 01/09/2024, terme …      │
     │                                    │
     │ ## Faits constatés                 │
     │ 12/09/2026 — chasse fuyante …      │
     │                                    │
     │ (les appréciations n'apparaissent  │
     │  pas : elles ne sont pas dans le   │
     │  fichier)                          │
     └────────────────────────────────────┘
     Bouton discret "Voir les 20 lignes suivantes"  → défilement de l'aperçu
        │
        ▼  --space-3xl
BarreAction  variante `principale`
├─ [action_principale] Bouton lg "Produire l'export"
│      puis, une fois produit :
│      Bouton lg "Envoyer le fichier"     — le SEUL écran qui envoie, et c'est explicite
│      Bouton secondaire "Voir le fichier"
└─ [hauteur_respiratoire] --space-3xl
```

| # | Composant | Rôle | Source |
|---|---|---|---|
| 1 | `BandeauSynchronisation` | Dire où en est l'export, tant qu'il n'est pas confirmé (B6) | design-system § 3.1 |
| 2 | `TitreÉcran` | Nommer l'écran | design-system § 3.18 |
| 3 | `LigneDonnée` | Rendre les trois formes, l'exclusion et les métadonnées | design-system § 3.22 |
| 4 | `Bouton` | Porter les trois boutons radio de forme, `Produire` et `Envoyer` | design-system § 3.8 |
| 5 | `ZoneTexte` | Rendre l'aperçu du document, **avant** le bouton de production | design-system § 3.10 |
| 6 | `Horodatage` | Porter l'horodatage **serveur** de production (C11) | design-system § 3.21 |
| 7 | `BandeauAlerte` | Dire l'exclusion permanente des appréciations, en variante `impossible` | design-system § 3.24 |
| 8 | `MessageBref` | Confirmer la production, avec le mot du téléphone | design-system § 3.25 |
| 9 | `BarreAction` | Porter `Produire l'export` puis `Envoyer le fichier` | design-system § 3.16 |

---

## 4. États — tous, sans exception

| État | Déclencheur | Rendu | Feedback utilisateur |
|---|---|---|---|
| **Chargement** | Ouverture, et **production de l'export en cours** | L'aperçu se rend ligne par ligne, en 20 lignes, avec un rendu progressif ; et pendant la production, le bouton passe en état `en_cours` avec un `ProgressBar` de 2 px et **son libellé ne change pas** — écrire « Génération… » promet un instant, et il n'y en a pas de garanti | L'aperçu est déjà lisible pendant le remplissage : c'est de la lecture de document, pas de l'attente. Aucune barre de progression globale |
| **Rempli** | Une forme est choisie et l'aperçu est rendu | Les quatre blocs, l'aperçu complet, et le bouton `Produire l'export` actif | Aucun. L'aperçu **est** la vérification |
| **Vide — jamais visité** | Aucune forme n'est choisie | Les trois formes en `LigneDonnée` avec leur bouton `Choisir`, l'exclusion déjà affichée, et **l'aperçu rendu avec un en-tête et rien d'autre** : « Choisis ce que tu veux produire, et l'aperçu se remplira ici. » Le bouton `Produire` est `impossible` avec l'aide « Choisis d'abord ce que tu veux produire. » | Aucun bouton désactivé sans raison : les trois boutons `Choisir` sont actifs et visibles |
| **Vide — aucune donnée** | La forme « dossier d'un locataire » est choisie et le dossier n'a **aucun fait** | L'aperçu rend le dossier **avec son en-tête et un paragraphe** : « Aucune donnée à exporter pour ce dossier : aucun fait n'y est enregistré. L'export est produit quand même, et il le dit. » **Un dossier vide est un dossier vide, et l'export le dit** | Aucun bouton de reprise. Un export d'un dossier vide est un document, pas une erreur |
| **Erreur de chargement** | La lecture des données du dossier échoue | `Vide` variante `erreur` + `BandeauAlerte` en variante `impossible` : « Impossible de lire les données de ce dossier. Rien n'est affiché — et ce n'est pas vide : on ne sait pas encore. » **Le bouton `Produire` passe en `impossible`** avec la raison | **Aucun bouton « Réessayer »** : la reprise est automatique. Produire un export à partir d'une lecture incomplète donnerait **un document partiel qui se dit complet**, et c'est exactement le genre de document qu'un tribunal refuse |
| **Erreur de soumission** | La production dépasse l'espace disponible, ou un format n'est pas disponible | Erreur **au dos de la ligne de forme** concernée : « Cet export n'a pas pu être produit : il manque 1,2 Mo sur l'appareil. Libère de l'espace, puis produis-le. » **Aucun dialogue modal, aucune secousse** | Le bouton de la forme concernée reste actif, et son aide porte la raison. **Un export qui n'a pas pu être produit n'est pas un export raté** : il n'existe pas, donc rien ne le prétend |
| **Succès** | L'export est produit | Le panneau d'export produit apparaît, sur `--color-confirme-950` : « Export produit le 12/09 · 19 h 12 · 84 Ko. Lisible sans Bailly. » La ligne `Produit le` se remplit avec l'**horodatage serveur**, et la taille aussi. Le bouton `Produire` devient `Envoyer le fichier` | `MessageBref` variante `fait` : « Export produit **sur cet appareil**. Pas encore confirmé. » **Il n'y a pas de toast « téléchargé »** : rien n'a été téléchargé. Le fichier est **sur l'appareil**, et c'est ce que l'écran dit |
| **Hors-ligne / permissions** | Mode avion, sous-sol, 4G absente | **La production est possible** : l'export se compose localement, c'est une écriture comme une autre. L'aperçu est complet. `Produire l'export` reste **actif**. **Seul** `Envoyer le fichier` passe en `impossible`, avec la raison : « Le fichier est produit et sur cet appareil. L'envoi a besoin du réseau ; il partira dès que le réseau revient. » | Aucun dialogue d'erreur. **L'export hors-ligne est un cas normal** : c'est 27 jours sur 30. L'écran le dit dans le mot d'état et nulle part ailleurs |
| **Lecture seule** | Écran verrouillé | L'aperçu reste **lisible en entier** — c'est de la lecture, et de la lecture de document personnel ; les trois boutons `Choisir` passent en `impossible`, l'exclusion reste affichée, et `Produire` passe en `impossible` avec l'aide « Déverrouille pour produire un export. » **L'aperçu n'est jamais masqué** | Le bouton est visiblement non pressable et son aide dit pourquoi |

---

## 5. Interactions

| Élément | Événement | Comportement | Feedback visuel | État résultant | ID |
|---|---|---|---|---|---|
| `Bouton secondaire "Choisir"` d'une forme | tap | Sélectionne la forme, **remplit l'aperçu**, et recalcule le nom du fichier et son format. **Les trois formes sont des boutons radio** et non un segment unique, parce qu'elles ne se valent pas : une est adressée à une personne, une à un événement, une à un professionnel | La ligne choisie passe en `selectionnee` : filet gauche 3 px `--color-primaire-600` | Forme choisie, aperçu rempli | B10 |
| `Bouton secondaire "Choisir"` d'une autre forme après avoir choisi | tap | **Confirmation demandée si un export a déjà été produit** : `MessageBref` variante `refus` — « Un export a déjà été produit le 12/09. En choisir un autre ne le remplace pas : les deux fichiers existent. » **Bailly ne remplace pas un document** — un document produit est une trace, et une trace ne se remplace pas | Les deux formes restent sélectionnables, et le panneau d'export produit **reste affiché** | Deux exports coexistants | C11 |
| `LigneDonnée` « Ce qui n'entre pas dans l'export » | tap | **Aucune action.** Il n'y a **ni interrupteur, ni case à cocher, ni bouton « inclure »**. La ligne n'est pas focusable : c'est une information, et une cible sans action est un piège | Aucun | — | B7, E7 |
| `BandeauAlerte` d'exclusion, appui long | appui long | Ouvre une `Feuille` d'explication : « Ce n'est pas un réglage d'export, c'est la façon dont la donnée est rangée. Une appréciation n'est pas une donnée sur la personne, donc elle n'a pas d'existence propre à exporter. C'est pour ça que le mot « inclure » n'existe pas dans Bailly : il n'y a rien à inclure. » | La feuille monte en 200 ms | Explication | B7 |
| `Bouton lg "Produire l'export"` | tap | Compose le fichier **localement**, puis l'envoie. La production ne demande aucune confirmation supplémentaire : c'est un acte réversible, le fichier est sur l'appareil et rien n'est sorti | Le bouton passe en `en_cours` avec une `ProgressBar` de 2 px, **libellé inchangé** | Export produit localement | B1, C2 |
| `Bouton lg "Envoyer le fichier"`, hors-ligne | tap | **Rien.** Le bouton passe en `impossible` et porte la raison : « Le fichier est produit et sur cet appareil. L'envoi a besoin du réseau ; il partira dès que le réseau revient. » **L'envoi n'est pas perdu et n'est pas mis en file visible** : il partira seul | Aucun retour élastique | Fichier local, envoi en attente | C9, E1 |
| `Bouton lg "Envoyer le fichier"` | tap | Ouvre le **choix de destination du système** — feuille de partage, courriel, ou enregistrement. **Bailly n'a pas de messagerie et n'enverra rien de lui-même** : la destination est choisie par le propriétaire, à chaque fois | La feuille de partage native s'ouvre | Fichier partagé | C6 |
| `ZoneTexte` d'aperçu, défilement | scroll | Défilement de l'aperçu, par blocs de 20 lignes, avec un `Bouton discret` à la fin de chaque bloc. **L'aperçu ne montre pas tout** : 14 baux en Markdown, c'est des milliers de lignes, et un aperçu de tout serait un chargement de tout | Défilement par blocs de 20 lignes | Aperçu étendu | N6 |
| `Bouton secondaire "Voir le fichier"` | tap | Ouvre le fichier produit dans l'application de lecture du système, **hors de Bailly**. C'est la démonstration de B11 : un fichier que Bailly peut lire est un fichier de moins pour récupérer tes baux | Aucune animation d'ouverture | Fichier ouvert ailleurs | B11 |
| `LigneDonnée` « Produit le », tap | tap | Aucune action : c'est une trace, avec la date et l'heure, et une trace ne se modifie pas | Aucun | — | C11 |
| Retour arrière | retour | **Ne supprime rien.** Un export produit reste produit, et le fichier reste sur l'appareil. Aucune confirmation, aucun dialogue de perte | Aucun | Export conservé | B18 |
| Confirmation serveur reçue | réception | Le mot d'état du titre passe à `rien_a_confirmer`, et le panneau d'export produit **gagne** la mention « Confirmé par le serveur · 12/09 · 19 h 14 ». **Aucune animation au-delà de 200 ms, aucun message bref** : l'état est visible, donc il n'a pas besoin d'être annoncé (X10) | Mention ajoutée en 200 ms | Export confirmé | B6 |

- **Focus / clavier** : sept focusables — trois boutons `Choisir`, l'aperçu, `Produire`, puis
  `Envoyer` et `Voir le fichier` une fois l'export produit. La ligne d'exclusion **n'est pas
  focusable**. `Origine` va au premier bouton `Choisir`. Les trois boutons `Choisir` sont un
  groupe radio au sens de la tabulation : `Tab` entre dans le groupe, les flèches changent
  de forme, `Espace` pose.
- **Gestes** : **aucun geste porteur.** Pas de swipe pour produire, pas de swipe pour
  partager, pas de pull-to-refresh. Un export est un document, et un document ne se
  produit pas au doigt pendant qu'on marche. Le glissement de `Feuille` ne fait que fermer.
- **Animations** : le remplissage de l'aperçu est en `--duration-slow` `--ease-out`, ligne
  par ligne, **et c'est la seule animation de l'écran qui ressemble à une animation.** Le
  `ProgressBar` de production est en mouvement continu sans texte, et l'état de
  synchronisation n'est **jamais** animé. `prefers-reduced-motion` met tout à 0 ms.
- **Retour arrière** : **ne supprime ni ne remplace l'export produit.** Deux exports peuvent
  coexister, et c'est dit quand on tente d'en produire un troisième.

---

## 6. Responsive

| Breakpoint | Comportement | Ce qui se replie / disparaît |
|---|---|---|
| **Mobile** (0–479 px) | Le layout de référence. Aperçu sur `--color-surface-sunken` en `--font-chasse` 14 px, largeur pleine moins `--space-lg`, 20 lignes visibles, barre d'action de 88 pt au-dessus du clavier | Sous 360 pt de large, l'aperçu passe de **20 à 12 lignes** — parce que les colonnes de Markdown se serrent, et un aperçu illisible ne vérifie rien. Le nom du fichier passe sur **deux lignes** |
| **Tablet** (480–899 px) | Deux colonnes : choix de la forme et exclusion à gauche sur 320 pt, aperçu et métadonnées à droite. L'aperçu passe à 40 lignes visibles. Conteneur centré de 560 pt | Rien. **Le contenu de l'aperçu est identique** — il y a plus de lignes visibles, pas moins d'information |
| **Desktop** (900 px et au-delà) | **Aucun rendu distinct.** Colonne centrée de 720 px, aperçu en pleine largeur, navigation en bas. X11 exclut la version navigateur de bureau — **mais le portable est précisément la machine de travail de fond**, donc c'est là que l'export se produit le plus souvent | Rien |

- **Cible tactile** : 52 pt pour les sept boutons, 44 pt pour le retour, et **44 pt de zone
  pour le défilement par blocs de l'aperçu** — le geste y est un défilement, donc la zone
  tactile du bouton de bloc est de 44 pt et non de 52.
- **Débordement** : (1) L'aperçu **ne déborde jamais horizontalement** : il a un retour à la
      ligne forcé à la largeur de colonne, et les valeurs longues d'une pièce jointe sont
      tronquées **dans le fichier lui-même**, avec une mention de troncature, donc l'aperçu
      montre exactement ce que le fichier contient. (2) Le nom du fichier passe sur deux
      lignes plutôt que d'être abrégé : `bailly-2026-09-12-karim-breguet.md` est un nom de
      fichier, et un nom de fichier abrégé ne se retrouve pas. (3) La ligne d'exclusion
      s'allonge sur plus de lignes plutôt que d'être tronquée.
- **Ce qui ne déborde jamais** : l'horodatage de production. `JJ/MM/AAAA · HH h mm`,
      complet, en chasse fixe, aligné à droite sur 144 pt. **Une trace d'export sans sa date
      complète n'est pas opposable** (C11).

---

## 7. Accessibilité

- [ ] **Contraste du texte courant** — mesuré par `design-check contrast`, qui applique
      4,5:1 à chaque encre contre les huit surfaces de son `on:`, dont
      `--color-surface-sunken` (**l'aperçu**, c'est-à-dire la surface la plus contraignante de
      cet écran, parce qu'elle porte le texte le plus petit) et
      `--color-confirme-950` (le panneau d'export produit). **Aucun ratio n'est écrit ici.**
- [ ] **Contraste des grands textes** — il n'y a pas de grand texte sur cet écran. **L'aperçu
      est en 14 px**, soit le plancher du produit, donc mesuré à 4,5:1. C'est un choix
      assumé : un aperçu en 17 px ne tiendrait pas 20 lignes sur un écran de téléphone, et un
      aperçu de 8 lignes ne vérifierait rien. Le plancher de 14 px est donc **atteint
      exactement** ici, et **jamais dépassé en dessous**.
- [ ] **Navigation clavier complète** — sur clavier externe et sur tous les breakpoints. Les
      trois boutons `Choisir` forment un `role="radiogroup"` : `Tab` entre dans le groupe,
      les flèches changent de forme, `Espace` pose. L'aperçu est un `role="region"` avec
      `aria-label` « Aperçu du document produit, 20 premières lignes » et
      `aria-live="off"` : **il ne s'annonce pas ligne par ligne**, sinon un lecteur d'écran
      commenterait la production d'un export pendant qu'elle se fait.
- [ ] **Focus visible** — anneau `--color-bordure-focus` de 2 px avec 2 px de fond entre
      l'anneau et le composant. Le bouton `Choisir` de la forme sélectionnée porte un filet
      gauche de 3 px qui **ne change pas** au focus : il porte la sélection, pas la
      position.
- [ ] **ARIA** — chaque ligne de forme porte un `aria-label` complet : « Dossier d'un
      locataire, pour le locataire, son avocat ou un tribunal, lisible, daté, au nom de la
      personne, constaté seulement. » La ligne d'exclusion porte
      `aria-label` « Ce qui n'entre pas dans l'export » et **n'est pas focusable** : elle ne
      déclenche rien. Le panneau d'export produit est un `role="status"` : quand il apparaît,
      il est annoncé **sans interrompre** la lecture.
- [ ] **Alternative textuelle** — **aucune image plein cadre.** L'aperçu est du **texte**,
      donc il est lu caractère par caractère par un lecteur d'écran, y compris les valeurs
      d'une pièce jointe tronquées dans le fichier. Les vignettes de pièces jointes portent
      un `alt` décrivant **l'état et non l'image** : « Photo du 12 septembre, confirmée par
      le serveur. » Aucune icône de type de fichier, aucun logo de format : les formats sont
      des mots.
- [ ] **Langue et direction de lecture** — `lang="fr-FR"`, gauche à droite, horodatages
      `JJ/MM/AAAA · HH h mm` en chasse fixe, tailles en kilo-octets avec la virgule
      décimale. **L'aperçu du document porte sa propre langue** : `lang="fr-FR"` sur la zone
      d'aperçu, et le nom du fichier est du texte brut, pas une image.

---

## 8. Données

| Champ | Type | Origine | Requis | Erreur possible |
|---|---|---|---|---|
| `forme` | `dossier_locataire` / `reprise_complete` / `comptes` | **choisie explicitement**, jamais déduite de l'écran précédent | oui | Aucune forme choisie : l'aperçu reste vide et le bouton est `impossible` avec la raison |
| `dossier_id` | identifiant | **pré-sélectionné par l'écran d'origine**, jamais choisi à la main (B17) | oui pour `dossier_locataire` | Aucun dossier sélectionné : le champ est rendered en lecture avec un tiret, et le bouton `Choisir` est `impossible` |
| `nom_fichier` | chaîne | **dérivé** de la forme, de la date et du nom de la personne | oui | Un nom de personne avec des caractères exotiques : le nom est **normalisé en minuscules sans accents** dans le nom de fichier, et l'écran le dit : « Le nom du fichier est simplifié ; le contenu ne l'est pas. » |
| `contenu` | Markdown ou CSV | **composé localement**, jamais généré par un tiers | oui | Lecture incomplète : la production est refusée avec la raison, parce qu'un export partiel qui se dit complet est pire qu'aucun export |
| `appreciations` | liste de textes | **jamais composée dans l'export**, à aucune forme | non | **Ce champ n'a pas de ligne dans le fichier.** C'est une propriété du générateur, pas un filtre appliqué après coup |
| `horodatage_production` | `JJ/MM/AAAA · HH h mm` | **horloge du serveur** (C11) | **non, tant qu'il n'est pas produit** | Non produit : la ligne porte `— pas encore produit`. **Jamais une date locale**, parce qu'une trace d'export non datée n'a pas de valeur |
| `taille` | octets | métadonnée du fichier | non | Fichier non produit : idem |
| `etat_envoi` | `a_envoyer` / `rien_a_confirmer` | local d'abord (C2) | oui | Échec : aucun bouton « Réessayer ». **L'envoi du fichier passe en `impossible` hors-ligne, et c'est le seul élément de cet écran qui change** |
| `destinataire` | choix du système | **choisi par le propriétaire à chaque envoi** | non | Aucun partage : rien ne part, et l'écran le dit dans son aide de bouton |

- **Chargement** : l'aperçu se charge **par blocs de 20 lignes**, jamais tout d'un bloc. 14
  baux en Markdown, c'est des milliers de lignes : un aperçu de tout serait un chargement de
  tout, et un chargement de tout pendant un litige est exactement le moment où le
  propriétaire n'a pas le temps (N6).
- **Cache / hors-ligne** : **la production est possible hors-ligne** (C2, C9). Le fichier
  est composé localement, l'aperçu est complet, et `Produire l'export` reste actif. **Seul**
  `Envoyer le fichier` passe en `impossible`, avec la raison : le fichier est produit et sur
  cet appareil, et il partira dès que le réseau revient. C'est **27 jours sur 30**, donc
  l'export hors-ligne est le cas normal.
- **Données sensibles** : cet écran **compose un document contenant des données
  personnelles** (C6) : identité, adresse, montants, faits constatés, pièces jointes. Le
  fichier produit est **une copie**, donc il est conservé au titre de l'obligation légale et
  **non effaçable** (B9) — c'est cohérent, un export n'est jamais un brouillon. **Les
  appréciations n'y sont pas**, à aucune forme d'export, jamais, même par erreur de saisie
  (B7, E7). Rien n'est envoyé à un tiers **par Bailly** (N8) : la destination d'envoi est
  choisie par le propriétaire dans le sélecteur du système, à chaque fois, et Bailly n'a ni
  messagerie, ni service d'envoi, ni journalisation tierce.

---

## 9. Traçabilité

| ID | Origine | Manifestation sur cet écran |
|---|---|---|
| **B1** | PRD | Le fichier est **composé localement avant toute tentative d'envoi**. Le message de production dit « Export produit **sur cet appareil**. Pas encore confirmé. », et `Envoyer le fichier` passe en `impossible` hors-ligne avec la raison |
| **B2** | PRD | Le `MessageBref` porte le mot du téléphone : « Pas encore confirmé. » Et le panneau de production porte l'horodatage **serveur** dès qu'il existe, jamais une date locale |
| **B6** | PRD | Le `BandeauSynchronisation` est présent pendant la production et après. Il ne se masque pas quand l'export est produit, et la mention « Confirmé par le serveur » vient s'ajouter à la ligne de production |
| **B7** | PRD | La ligne « ce qui n'entre pas dans l'export » est **affichée avant l'aperçu**, et son `BandeauAlerte` en variante `impossible` dit : « Ce n'est pas un réglage d'export, c'est la façon dont la donnée est rangée. » **Il n'y a ni interrupteur, ni case à cocher, ni bouton « inclure »** |
| **B9** | PRD | Le fichier produit est **conservé et non effaçable**, parce qu'un export est une copie et donc une pièce comptable. L'écran ne propose aucun effacement de ce qu'il a produit |
| **B10** | PRD | L'export est produit **à la demande**, en un geste, et **la destination est choisie par le propriétaire à chaque envoi** — ce qui est la forme exacte de « sans qu'on ait à le réclamer » : il ne fait rien tout seul, il est toujours disponible |
| **B11** | PRD | Le format est `Markdown` ou `CSV`, **jamais un format propriétaire**, et l'aperçu est en Markdown, donc lisible dans n'importe quel éditeur de texte. `Voir le fichier` ouvre le document **hors de Bailly** — c'est la démonstration, pas une promesse |
| **C7** | PRD | Le panneau d'export produit porte la phrase **« Lisible sans Bailly »**, et ce n'est pas une formule : l'aperçu est en Markdown sur un fond nu, et `Voir le fichier` ouvre le document dans l'application de lecture **du système**, pas dans Bailly. L'écran **le prouve** au lieu de l'afficher |
| **B16** | PRD | Aucun montant n'est calculé pour l'export. Les montants sont exportés tels qu'ils ont été **saisis**, et c'est écrit dans l'en-tête du document : « Ce document contient des montants saisis, pas calculés. » |
| **B18** | PRD | Aucun bouton d'effacement, et **le retour arrière ne supprime ni ne remplace l'export produit**. Un document produit est une trace, et une trace ne se remplace pas — c'est dit quand on tente de produire un troisième |
| **C1** | PRD | Le `BandeauSynchronisation` ne masque pas que le fichier est **encore sur l'appareil** tant que l'envoi n'a pas eu lieu. La référence reste chez l'hébergeur, et l'écran ne prétend pas le contraire |
| **C2** | PRD | La composition est locale, l'envoi ensuite. L'ordre n'est jamais inversé, et la production hors-ligne est le cas normal |
| **C6** | PRD | **Bailly n'a pas de messagerie et n'envoie rien de lui-même** : `Envoyer le fichier` ouvre le sélecteur du système, et la destination est choisie par le propriétaire à chaque fois. Le droit d'accès du locataire est servi par la forme `dossier_locataire`, qui est au nom de la personne |
| **C9** | PRD | Hors-ligne, **tout fonctionne sauf l'envoi du fichier** : la composition, l'aperçu et la production sont locaux. C'est la seule restriction, et elle est expliquée en une phrase |
| **C11** | PRD | L'export porte son **horodatage de production, celui du serveur**, affiché en `JJ/MM/AAAA · HH h mm` complet, dans le panneau et dans la ligne `Produit le`. Tant qu'il n'est pas produit, la ligne porte `— pas encore produit` et **jamais une date locale** |
| **N1** | PRD | L'aperçu se remplit en 200 ms par blocs de 20 lignes, et le bouton de production n'affiche **aucun texte de progression** — une `ProgressBar` de 2 pt suffit. **Aucun délai n'est aguardé à l'écran** |
| **N3** | PRD | 52 pt pour les sept boutons, 44 pt pour le retour et pour le défilement par blocs |
| **N4** | PRD | L'aperçu est en **14 px**, le plancher du produit, mesuré à 4,5:1 sur `--color-surface-sunken`. Le plancher est atteint exactement ici et **jamais dépassé en dessous** |
| **N5** | PRD | Tailles en `rem` suivant le réglage du téléphone, plafonné à ×1,3 : à ×1,3 l'aperçu passe de 20 à **14 lignes** et la chasse fixe garde l'alignement des colonnes. **Le contenu de l'aperçu ne change pas** |
| **N6** | PRD | L'aperçu se charge **par blocs de 20 lignes**, jamais tout. La reprise complète des 14 dossiers est produite en moins d'une minute, et l'écran ne bloque pas le propriétaire pendant ce temps |
| **N7** | PRD | Le fichier produit est **rejouable sans Bailly** : c'est la propriété que cet écran démontre. `Voir le fichier` l'ouvre hors de Bailly, donc la reprise ne dépend pas de Bailly |
| **N8** | PRD | Bailly n'envoie rien à un tiers : ni messagerie, ni service d'envoi, ni analytics, ni crash reporter. **La destination d'envoi est choisie par le propriétaire dans le sélecteur du système** |
| **E5** | PRD | Un locataire part et demande ses données : la forme `dossier_locataire` produit un document **au nom de la personne**, daté, lisible, et qui ne contient **que du constaté**. Les appréciations n'y sont pas, et l'écran le dit avant la production |
| **E7** | PRD | Les appréciations **n'entrent dans aucune forme d'export**, jamais, même par erreur de saisie. C'est une propriété du générateur, pas un filtre : le champ n'a pas de ligne dans le fichier, donc il n'y a rien à activer |
| **E10** | PRD | « Faire le ménage » : l'écran **ne produit rien qui efface quoi que ce soit**. Il produit une copie, datée, conservée. Il n'y a pas de bouton d'effacement sur cet écran, donc la question ne se pose pas |

---

## 10. Checklist de gate

- [x] Les 9 états sont décrits avec un rendu concret et des **libellés écrits** — y compris
      celui d'un dossier sans aucun fait, dont l'export est produit quand même et le dit.
- [x] **L'aperçu est avant le bouton.** C'est l'ordre de cet écran, et il est justifié par la
      seule chose qui compte : la demande arrivera pendant un litige.
- [x] **Ni interrupteur, ni case à cocher, ni bouton « inclure »** sur l'exclusion des
      appréciations. La ligne n'est pas focusable, parce qu'elle ne déclenche rien.
- [x] Hors-ligne, **la production est possible** et seul l'envoi passe en `impossible`,
      avec la raison.
- [x] Un export produit n'est **ni supprimé ni remplacé** par le retour arrière, et l'écran
      le dit quand on en produit un troisième.
- [x] Aucun « Réessayer », aucun bouton d'effacement.
- [x] Chaque élément interactif a un comportement, un feedback et un état résultant.
- [x] Le responsive est défini aux trois breakpoints, avec le passage de 20 à 12 lignes
      d'aperçu sous 360 px explicité.
- [x] La section Anti-générique est cochée et justifiée avec les valeurs réelles.
- [x] Aucune valeur de design n'est laissée à « à définir ».
- [x] **Aucun ratio de contraste écrit à côté d'une valeur.**
- [x] Chaque ID `B*`, `E*`, `C*` et `N*` de l'écran apparaît en § 9.
- [x] `node "$FORGE/scripts/forge-guard.js" placeholders <anchor>` ne signale rien ici.
- [x] L'écran reste cohérent avec `.forge/design/design-system.md`.
