---
type: screen
slug: panier
title: Panier et sortie vers le paiement
module: panier
status: draft
generated_at: 2026-09-30
derived_from:
  - .forge/prd.md
  - .forge/design/design-system.md
rule_ids: [B12]
edge_case_ids: [E11]
flow: sortie-paiement
---

# Écran — Panier et sortie vers le paiement

> Ce document est la **source de vérité** pour qu'une IA génère l'interface de cet écran.
> Il est généré depuis ce gabarit, jamais recopié. Aucun `{{PLACEHOLDER}}` ne doit subsister.

---

## 1. Rôle de l'écran

| | |
|---|---|
| **Archétype d'app** | `mobile_consumer` — téléphone seul, iOS et Android, un seul marché (C10) |
| **Module** | `panier` — **pas d'onglet** : le design system §4 le place en barre persistante au-dessus de la barre d'onglets, et cet écran en est le développement pleine page |
| **Route** | `/panier` |
| **Type** | page — sous-écran empilé au-dessus de l'onglet courant, qui reste visible derrière la barre de panier |
| **Utilisateurs** | Les trois personas, sans compte : un panier se construit sans identification (B1, C4) |
| **User stories servies** | US-6 |
| **Règles métier** | B12 |
| **Edge cases** | E11 |

**Une phrase** : cet écran permet de vérifier ligne par ligne ce qu'on a mis de côté, puis de le passer au paiement du marchand, afin de partir vers la boutique avec **exactement** ce panier et pas un autre.

**Pourquoi il n'a pas de rang dans la navigation** : le design system §4 est explicite — « Ce qui n'occupe pas d'onglet : le Panier (barre persistante) ». Un cinquième onglet serait vide la plupart du temps, ce que le PRD §7 refuse. La barre de panier n'existe que lorsqu'il y a un panier, et sa présence permanente quand il y en a un est la forme la moins coûteuse de dire « vous avez choisi quelque chose ».

**La route `/panier` est une proposition de conception, pas une décision d'architecture.** La structure cible de `conventions.md` liste `produit/` et `commande/` et ne liste pas de dossier panier ; le nom retenu respecte la convention de nommage (segment en minuscules) et la parenté avec `/commande/[id]`. **La survie du panier avant paiement est Q2, sans réponse** (PRD §10, roadmap §7) : ce que l'écran rend si le panier est retrouvé vide ou différent après fermeture de l'application est **à décider en Phase 4**, et le design system §6 le note au point 5. La structure d'écran ci-dessous est prête pour les deux réponses, mais elle ne les choisit pas.

**Ce que cet écran ne fait pas** : il ne saisit rien qui ressemble à un paiement. C3 est une contrainte de produit, et la fiche de conception la rend visible en n'affichant **aucun** champ de carte, aucun moyen de paiement, aucun total calculé par l'application (B7 est cité par E11 et s'applique à la relecture).

---

## 2. Direction visuelle de cet écran

Repris du design system — **valeurs concrètes, jamais « à définir »**.

| | |
|---|---|
| **Mood** | « chaleureux, dense, sans emphase » — repris du design system §0 |
| **Densité** | **dense** — un panier est une liste à vérifier : le client compare photo, quantité, prix unitaire et prix de ligne. Tout élément qui prend de la hauteur sans porter une information de contrôle est supprimé. La seule respiration est entre le bloc « Récapitulatif » et le bloc d'action |
| **Niveau de contraste** | **fort** — le montant total est la donnée que le client cherche avant de payer ; il est en `--text-texte-principal` à la plus grande taille de l'écran. Le récapitulatif est posé sur une **feuille** `--color-surface #FBF8F2` pour se détacher du papier, avec un filet, sans ombre |
| **Surface** | `--color-background #F1EDE5` pour la liste ; `--color-surface #FBF8F2` pour le bloc récapitulatif, le seul conteneur de cet écran — un seul conteneur, pas une carte par ligne |
| **Accent utilisé** | `--color-encre-700 #1B2220` sur le bouton `primaire` de sortie. Le chroma ne sert qu'à deux choses : le filet gauche `--color-erreur #A03427` de la ligne en rupture, et l'`Encart` en cas d'indisponibilité. **Le total n'est jamais coloré comme une promotion** (design system §0, choix assumé n° 3) |
| **Traitement photographique** | vignette carrée de 72 px de la photo du marchand dans chaque ligne, jamais retouchée |
| **Référence** | Zalando mobile pour la ligne panier dense à deux niveaux ; Back Market pour le récapitulatif posé sur une feuille à filet, sans ombre |

### 2.1 Anti-générique — obligatoire

- [x] Pas de fond **blanc pur** — le papier `#F1EDE5`, la feuille `#FBF8F2` ; aucun des deux n'est du blanc et les deux sont vérifiés par le script.
- [x] **Pas de carte ombrée pour tout** — les lignes de panier sont **des lignes**, pas des cartes : aucun fond, aucun coins arrondis, séparation par filet `--color-secondaire #D9D2C4`. Le seul conteneur est le récapitulatif, et il est plat.
- [x] **Pas d'uniformité** : `--text-h3 20/26 700` pour le total, `--text-body 17/25` pour le nom du produit, `--text-body-sm 16/23` pour le prix unitaire, `--text-caption 14/19` pour la quantité et les lignes de récapitulatif. Cinq niveaux, deux échelles de prix visibles côte à côte sur une même ligne.
- [x] **Pas de gris neutre générique** — la même encre verte froide que le reste de l'application ; le prix unitaire en `--color-texte-secondaire #5A544A` et le prix de ligne en encre, ce qui hiérarchise sans changer de famille.
- [x] **Pas de mise en page centrée symétrique** — les prix sont alignés à droite sur la colonne des chiffres, les noms à gauche : l'axe vertical des montants est la seule grille de cet écran, et c'est celle que l'œil suit.
- [x] **Pas d'illustration d'appoint générique** — un panier vide ne montre ni icône de caddie dans un cercle, ni dégradé, ni emoji. Il montre une phrase et deux actions.
- [x] **Pas d'une seule famille de police** — tous les montants, quantités et le total sont en chiffres tabulaires SF Mono / Roboto Mono, alignés en colonne.

**Choix assumé et non neutre** : **le bouton de sortie est le seul bouton plein de l'écran, et il nomme sa destination dans son propre libellé : « Payer sur la boutique »**, avec l'icone-droite réservée à cet usage par le design system §5. Pas de « Commander », pas de « Valider », pas de « Payer 189,00 € ». Trois raisons, dans cet ordre : le mot *boutique* est la seule information que l'application puisse donner au client sans inventer une promesse de paiement ; le mot *payer* annonce la sortie de l'application, ce qu'un client sent souvent dans le geste avant de le voir ; et nommer un montant dans un bouton de paiement que l'application n'encaisse pas serait annoncer une bascule de prix.

**Second choix, contestable** : **aucune feuille de confirmation ne s'intercale entre le tap et la sortie vers le paiement.** Le design system réserve `icone-droite` à ce bouton précisément pour que la destination soit nommée avant le geste ; une confirmation redemanderait au client de relire ce qu'il vient de lire et ajoute un écran à un tunnel dont le critère de succès est mesuré (PRD §8). Le prix du refus de la friction : un client qui tape « Payer sur la boutique » et découvre que son panier a changé peut revenir. Ce risque est accepté, et il est **moindre** que l'alternative, qui ajoute une étape mesurée à chaque session.

---

## 3. Anatomie

```
Écran "/panier" — sous-écran au-dessus de l'onglet courant
├─ Barre système — retour arrière + titre "Panier" --text-display
├─ Liste des lignes — hauteur variable, pas de hauteur fixe
│    └─ Ligne de panier  (96 px de base, grandit avec le réglage de police)
│         ├─ Photo 72×72 + nom --text-body + prix unitaire --text-body-sm
│         ├─ Contrôle de quantité — boutons − / + de 44×44, valeur --text-body chiffres tabulaires
│         ├─ Prix de ligne --text-body, aligné à droite, chiffres tabulaires
│         └─ Action "Retirer" — fantome, --color-erreur-fort, 44 px de haut
├─ Filet --color-secondaire
├─ Récapitulatif — feuille --color-surface, filet, sans ombre
│    ├─ Lignes de la source marchande, --text-caption, une par ligne, jamais fusionnées
│    ├─ Filet interne
│    └─ Total — --text-h3 700 chiffres tabulaires
├─ Encart d'indisponibilité — rendu seulement quand la relecture échoue (E11)
└─ Barre d'action — Bouton primaire "Payer sur la boutique" lg 56 px, icône droite
                    + ligne d"--text-caption" : "Vous serez redirigé vers {boutique}."
```

| # | Composant | Rôle | Source |
|---|---|---|---|
| 1 | Ligne de panier | Photo, nom, quantité, prix unitaire, prix de ligne, retrait | slice-local, sur design-system §5 |
| 2 | Contrôle de quantité | Modifier la quantité sans quitter l'écran | slice-local, sur design-system §5 Bouton |
| 3 | Récapitulatif | Les lignes de total **fournies par la source**, puis le total | slice-local, sur design-system §5 |
| 4 | Bouton primaire de sortie | Tendre la main au paiement de la boutique pour ce panier | design-system §5 |
| 5 | Encart | Porter la raison d'une action impossible ou d'une relecture échouée | design-system §5 |
| 6 | Filet | Séparation entre liste et récapitulatif | design-system §1 (`--color-secondaire`) |

**Ce qui n'est pas dans cette anatomie** : aucun champ de carte, aucun moyen de paiement, aucun code promo, aucun champ de code postal, aucun bouton « Continuer les achats » au-dessus du total, aucun total calculé par l'application, aucun bouton d'achat direct depuis une ligne.

---

## 4. États — tous, sans exception

| État | Déclencheur | Rendu | Feedback utilisateur |
|---|---|---|---|
| **Chargement** | Ouverture de l'écran, panier en cours de relecture | **Aucun squelette pleine page (B8).** Le titre « Panier » et l'axe des colonnes sont du texte local. Chaque ligne rend sa photo et son nom dès qu'ils arrivent ; le récapitulatif est squeletté ligne par ligne et le total reste masqué tant qu'il n'est pas connu — **un total qu'on devine serait un prix inventé** | Le bouton de sortie est rendu en `chargement` dès l'ouverture, ce qui **empêche de sortir vers le paiement avec un panier non relu** (E11). Le bouton est visible et indisponible, avec sa raison |
| **Rempli** | Le panier a été relu avec succès et contient au moins une ligne | Liste des lignes, récapitulatif, bouton actif | Aucun toast. Le résultat est visible sur place |
| **Vide — jamais visité** | Ouverture sans panier, ou toutes les lignes retirées pendant la session | `Panneau d'état · aucune-donnee`, une ligne, **sans illustration**, avec la phrase du design system §5 : « Aucune commande pour le moment. Dès que vous commandez, elle apparaîtra ici. » — reformulée pour le panier en : « Panier vide. Dès que vous ajoutez un article, il apparaîtra ici. » Action « Voir mes commandes sur la boutique ». **Ni compteur à 0, ni la mention « 0 article », ni « Réessayer »** | Aucune. Le catalogue reste une destination à un geste : l'onglet d'origine reste derrière la barre d'onglets |
| **Vide — aucune donnée** | La source renvoie un panier existant mais **sans aucune ligne** | Même rendu que ci-dessus, avec la variante de formulation qui nomme la source : « Panier vide. Dès que vous ajoutez un article, il apparaîtra ici. » Le bouton de sortie **n'est pas rendu** : un « Payer sur la boutique » au-dessus d'un panier sans article est un bouton qui ne peut pas fonctionner | Aucun |
| **Erreur de chargement** | La relecture du panier échoue et aucune copie locale n'est relisible | `Encart · erreur` au-dessus du bouton, avec le libellé du design system §5, sujet panier : « Indisponible pour le moment. Votre panier n'a pas été effacé. » Action « Réessayer ». Le récapitulatif est rendu **vide**, jamais avec un total à 0,00 € | Le bouton de sortie passe en `desactive` avec **la raison écrite à côté** — il n'est jamais rendu gris sans explication (design system §5 Bouton, et le rappel sur `--color-texte-desactive`) |
| **Erreur de soumission** | La modification d'une quantité ou le retrait d'une ligne est refusé par la source | `Encart · erreur` d'une ligne juste au-dessus du récapitulatif, message d'action : « Quantité non modifiée. » ou « Article non retiré. » La ligne concernée est rendue dans son état **antérieur**, jamais dans un état optimiste | Aucun toast. La modification échouée est signalée **à l'endroit où elle devait se voir**, pas dans un bandeau qui disparaît |
| **Succès** | Sortie vers le paiement lancée, ou modification de quantité prise en compte | La quantité modifiée est rendue à sa nouvelle valeur, le prix de ligne et le récapitulatif sont relus. À la sortie, la barre de panier passe à son état de navigation et le paiement s'ouvre chez la boutique | Aucune animation de confirmation. Le passage se voit : c'est le site qui s'ouvre |
| **Hors-ligne / permissions** | Réseau absent | **Le panier n'est pas modifiable hors ligne.** Chaque contrôle de quantité et chaque action « Retirer » passe en `desactive` avec la raison écrite à côté. Aucune écriture hors ligne n'est proposée (C8) | Un `Encart · hors-ligne` en tête : « Affiché hors ligne. Dernière mise à jour il y a X h. » avec action « Réessayer ». Le bouton de sortie est `desactive` : on ne part pas vers un paiement avec un panier qu'on n'a pas relu |
| **Lecture seule** | Hors-ligne, **ou** la question Q2 (survie du panier avant paiement) encore sans réponse | Le panier est rendu **en entier** à partir de la copie locale, avec son âge, sans aucune action d'écriture. Aucune variante d'écran n'est inventée ici : le comportement à l'ouverture dépend de la réponse du marchand, et **l'écrire serait décider à sa place**. Deux dispositions sont tendues et une seule sera retenue : soit le panier est conservé et rejoué avec son âge, soit il est déclaré absent et l'écran rend son état « vide — aucune donnée » | Aucun. Tant que Q2 n'est pas répondue, l'écran ne prétend rien |

> Un état non décrit est un état non implémenté. Aucun de ces neuf ne montre un total de 0,00 € ni n'appelle « Réessayer » sur un panier simplement vide (C7).

---

## 5. Interactions

| Élément | Événement | Comportement | Feedback visuel | État résultant | ID |
|---|---|---|---|---|---|
| Bouton « Payer sur la boutique » | tap | **Relecture obligatoire du panier** ; si elle réussit, ouverture de l'URL de checkout de la boutique **pour ce panier précis** ; si elle échoue, rien ne s'ouvre, rien ne part | `chargement` (largeur inchangée, libellé conservé en accessibilité), puis `desactive` avec la raison écrite en cas d'échec | Rempli → sortie vers le paiement | B12 |
| Bouton « Payer sur la boutique » | tap, panier non relu | Aucune ouverture. Le presse-papier, le partage et toute application tierce ne sont jamais sollicités pour transporter un panier que l'application n'a pas relu | `Encart · erreur` + raison écrite sous le bouton | Erreur de chargement | E11 |
| Bouton « + » d'une quantité | tap | Incrément de 1, plafonné à la valeur annoncée par la source ; relecture du panier et du récapitulatif | Bouton `presse` 120 ms ; la valeur change en chiffres tabulaires sans faire bouger la colonne | Rempli | B12 |
| Bouton « − » d'une quantité | tap | Décrément de 1 ; à 1, le pas suivant **retire la ligne** après confirmation inline, pas de feuille modale | idem | Rempli, ou Vide | B12 |
| Action « Retirer » | tap | Retrait de la ligne, avec relecture ; en cas de refus, la ligne est rendue dans son état antérieur | `Encart · erreur` à l'emplacement de la modification | Rempli ou Erreur de soumission | B12 |
| Action « Voir mes commandes sur la boutique » | tap | Ouverture de l'URL de la boutique, dans la section commandes | Aucun | Sortie de l'application | — |
| Action « Réessayer » | tap | Relance **la seule** lecture qui a échoue — panier, ou copie locale si le réseau est revenu | `chargement` sur le bouton concerné, largeur inchangée | Rempli ou Erreur de chargement | E11 |
| Ligne de panier | tap sur la photo ou le nom | Navigation vers `/produit/[handle]` | Pressé 120 ms | Fiche produit | B1 |

- **Focus / clavier** : ordre de tabulation égal à l'ordre de lecture — retour système, puis pour chaque ligne : retrait, quantité −, quantité +, photo et nom, prix ; puis récapitulatif, puis bouton de sortie. **Le prix de ligne et le prix unitaire ne sont jamais des cibles** : ce sont des données, et une donnée qui devient une cible tactile vole le geste (design system §0, choix assumé n° 1).
- **Gestes** : défilement vertical natif. **Le swipe horizontal sur une ligne ne retire pas l'article** : un retrait par geste horizontal est irréversible à l'aveugle et disparaît au premier appui long, exactement le défaut qu'un réglage de police agrandi rend systématique. Le retrait est une action explicite de 44 px, toujours visible.
- **Animations** : `--duration-fast 120ms` sur les pressés et le passage d'une quantité à l'autre ; **aucune animation de déplacement de ligne** au retrait — la liste qui se referme en glissant est illisible sur un appareil lent ; `--duration-slow 320ms` au retour arrière seulement. Toutes les durées tombent à zéro si le système demande une réduction des animations.
- **Retour arrière** : rend l'onglet d'origine avec sa position. **Si l'application se ferme alors que le panier existe, la réouverture doit rendre `/panier` et non l'accueil** — c'est la seule conséquence d'écran de Q2, et elle est écrite ici pour être discutée en Phase 4, pas décidée.

---

## 6. Responsive

| Breakpoint | Comportement | Ce qui se replie / disparaît |
|---|---|---|
| **Mobile** | **Seul format livré et seul format de référence** : `--format-320 320 × 568`. Marge `--space-lg 24px`, zone utile 272 px. Ligne de panier : photo 72 px + gouttière `--space-md 16px` + colonne de texte ; les deux contrôles de quantité sont des carrés de **44 × 44 px**, donc 88 px plus les gouttières, ce qui laisse 168 px pour le nom et les prix. Le récapitulatif est un bloc plat de largeur utile | Rien ne disparaît. Au format le plus étroit, c'est la **colonne des prix qui passe sous le nom** dans une ligne, pas le contrôle de quantité qui rétrécit : un contrôle sous 44 px viole B21 |
| **Tablet** | **Hors périmètre en v1** — C10 exclut tablette et web ; le roadmap §4.2 conditionne leur retour à une part de sessions tablette mesurée pendant la fenêtre, au-dessus d'un seuil écrit avant publication | Non conçu. Aucun panier à deux colonnes, aucun récapitulatif latéral |
| **Desktop** | **Hors périmètre en v1**, même raison, même seuil. Le format de référence unique est `--format-320` | Non conçu |

- **Cible tactile** : bouton de sortie `lg` 56 px ; contrôles de quantité 44 × 44 px ; action « Retirer » 44 px de hauteur ; action de retour système 44 × 44 px ; lien d'action d'un `Encart` 44 px de hauteur de ligne.
- **Débordement** : garanti sans débordement à tout réglage de police — le nom du produit (`--text-body`, trois lignes maximum puis `…`) ; le prix unitaire (`--text-body-sm`, retour à la ligne autorisé) ; le prix de ligne (chiffres tabulaires, colonne de droite conservée, **jamais rogné**) ; chaque ligne du récapitulatif (`--text-caption`, deux lignes puis retour à la ligne) ; le **total** (`--text-h3 700` chiffres tabulaires, `flex-wrap` autorisé, jamais rogné — un total tronqué est un prix faux) ; le bouton de sortie (le libellé complet « Payer sur la boutique » reste entier au réglage maximal).
- **Réglage de police** : aucun conteneur de texte n'a de hauteur fixe ; la ligne de panier **grandit** au lieu de tronquer ; les contrôles de quantité **grandissent** et ne rétrécissent jamais (B21, E3). Au réglage maximal, le bouton de sortie passe à deux lignes et reste entièrement atteignable.

---

## 7. Accessibilité

- [x] **Contraste du texte courant** — `--color-texte-principal #161A19` sur `--color-background #F1EDE5` pour les noms de produit et les prix de ligne, et sur `--color-surface #FBF8F2` pour le total et le récapitulatif ; `--color-texte-secondaire #5A544A` sur les deux surfaces pour les prix unitaires et les lignes de récapitulatif ; `--color-texte-inverse #FBF8F2` sur `--color-encre-700 #1B2220` pour le libellé du bouton de sortie et sur `--color-erreur #A03427` pour le libellé de l'action de retrait ; `--color-erreur-fort #8E2B1F` sur `--color-background` pour l'action « Retirer » en variante `fantome`. Le seuil appartient à `design-check contrast`.
- [x] **Contraste des grands textes** — le total en `--text-h3 20/26 700` est posé sur `--color-surface` uniquement ; le libellé de sortie est posé sur `--color-encre-700` ; l'âge du cache est en `--text-caption 14/19` posé sur `--color-info-doux #E3EDF3` avec `--color-info-fort #24455C`.
- [x] **Navigation clavier complète** — sur matériel, ordre de tabulation égal à l'ordre de lecture, avec le retrait et les deux contrôles de quantité exposés dans cet ordre pour chaque ligne ; chaque ligne est annoncée comme un groupe portant son nom de produit, ce qui évite qu'un lecteur d'écran annonce six nombres sans dire à quoi ils se rapportent.
- [x] **Focus visible** — anneau de 2 px en décalage de 2 px, couleur `--color-bordure-focus #1B2220`, sur chaque contrôle, sur l'action de retrait et sur le bouton de sortie ; sur un contrôle `desactive`, l'anneau reste visible et l'état `disabled` est annoncé, parce qu'un contrôle mort qui ne peut pas être atteint ne peut pas être compris.
- [x] **ARIA** — la liste est un `list` dont chaque entrée est un `group` étiqueté par le nom du produit ; les contrôles de quantité sont des `button` nommés « Retirer un exemplaire de {produit} » et « Ajouter un exemplaire de {produit} », avec `aria-valuenow` porté par la valeur centrale ; le bouton de sortie porte un nom accessible qui **inclut la destination** : « Payer sur la boutique {nom} » ; l'`Encart` d'indisponibilité est un `status` annoncé poliment à son apparition, parce qu'il explique pourquoi une action vient de devenir impossible ; le bloc récapitulatif est une `region` étiquetée « Récapitulatif ».
- [x] **Alternatives textuelles** — chaque photo de ligne porte le texte alternatif du marchand ou, à défaut, « Photo de {nom du produit} » ; le pictogramme de la ligne en rupture porte un texte alternatif vide et son sens est porté par le filet gauche `--color-erreur` **et** par le mot « Épuisé » en toutes lettres, jamais par la couleur ni par le filet seuls ; l'icône droite du bouton de sortie est décorative, la destination étant déjà dans le libellé.
- [x] **Langue et direction de lecture** — `lang="fr"`, `dir="ltr"`, une seule langue, aucune couche d'internationalisation (C5, B20).

---

## 8. Données

| Champ | Type | Origine | Requis | Erreur possible |
|---|---|---|---|---|
| Lignes du panier | tableau de lignes | Source marchand | oui | Tableau vide → état « vide — aucune donnée » ; réponse en erreur → état d'indisponibilité, **jamais** un panier à 0,00 € |
| Nom, photo | texte, URL | Source marchand | oui / non | Nom absent → nom rendu vide à sa hauteur ; photo absente → trame `--color-encre-200` |
| Quantité | entier | Source marchand | oui | Hors de la plage annoncée → refus rendu dans l'état « erreur de soumission », la ligne restant dans son état antérieur |
| Prix unitaire, prix de ligne | texte, tel que fourni | Source marchand | oui | Absent → ligne vide à sa hauteur, jamais recalculée ni complétée (B23) |
| Lignes de récapitulatif | tableau de libellés et montants | **Source marchand, jamais calculées** | oui | Absentes → le récapitulatif n'est pas rendu et **aucun total n'est reconstitué** ; l'application n'invente ni frais de port ni remise |
| Total | texte, tel que fourni | Source marchand | oui | Absent → le total n'est pas rendu et le bouton de sortie reste `desactive` avec la raison écrite |
| URL de checkout du panier | URL | Source marchand | oui | Absente → `Encart` d'indisponibilité, aucune ouverture |
| Âge de la copie locale | horodatage | Cache local, affiché tel quel | oui si hors-ligne | Jamais absent : un panier rejoué sans âge n'est pas rendu (B19) |

- **Chargement** : **un seul bloc, chargé d'un bloc.** Le panier est une liste courte et une récapitulatif ; aucune pagination, aucun chargement différé. La relecture est déclenchée à l'ouverture de l'écran et **obligatoirement relancée au tap sur le bouton de sortie** : c'est la mécanique de E11, pas une optimisation.
- **Cache / hors-ligne** : copie **en lecture seule** du panier, avec son âge. Toute écriture hors ligne est exclue : quantités et retrait sont indisponibles hors ligne, et le retrait de ligne comme la quantité sont des écritures (C8).
- **Données sensibles** : **aucun numéro de carte n'est jamais demandé, reçu, ni stocké** (C3). Aucun montant n'est envoyé dans un événement d'audit ; seuls le nombre de lignes et le fait qu'une sortie a été lancée sont comptés (C9).
- **Instrumentation (PRD §8, C9)** : `panierOuvert` (nombre de lignes), `panierModifie` (type de modification, position de la ligne, **jamais de prix**), `sortiePaiementLancee` (nombre de lignes, identifiant du panier technique, **jamais d'identifiant de commande ni d'adresse**), `sortiePaiementRefusee` (motif : relecture échouée ou URL absente). Le critère principal — 8 % de sessions terminées par une sortie vers le paiement — se lit sur `sortiePaiementLancee` rapporté aux sessions ; un refus de relecture doit donc être compté à part, sinon l'application pourrait « atteindre » son critère en comptant des sorties qui n'ont jamais eu lieu chez la boutique.

---

## 9. Traçabilité

| ID | Origine | Manifestation sur cet écran |
|---|---|---|
| **B12** | PRD | Le panier se construit dans l'application, ligne par ligne, et la sortie mène au paiement de la boutique **pour ce panier précis** : le bouton relit le panier avant d'ouvrir l'URL. Le libellé « Payer sur la boutique » et son icône droite nomment la destination avant le geste. L'application ne voit jamais de numéro de carte |
| **E11** | PRD | Le panier n'est pas relu au moment de la sortie vers le paiement : **rien ne s'ouvre**, l'`Encart` porte le libellé du design system §5, l'action « Réessayer » apparaît, et le bouton passe en `desactive` avec la raison écrite. L'application ne procède pas avec un panier qu'elle n'a pas relu |
| **C3** | PRD | Aucun paiement dans l'application : aucun champ de saisie, aucun moyen de paiement, aucun frais calculé, aucun total reconstitué. Le total affiché est celui de la source, ligne par ligne, sans fusion |
| **C7** | PRD | Un panier vide n'est jamais rendu comme « 0,00 € ». C'est un `Panneau d'état` formulé en mots, sans compteur, et son action n'est pas « Réessayer » : un panier vide n'a pas échoué |
| **C8** | PRD | Hors ligne, le panier est rejoué **en lecture seule** avec son âge, et aucune écriture n'est proposée : quantités et retrait sont désactivés avec leur raison écrite |

**Règles du PRD citées sans être opposables à cet écran** : **B7**, cité par E11, est respectée mécaniquement — la panne de source rend `indisponible` avec « Réessayer », et une panne ne rend jamais un panier vide. **B6 et B23** sont respectées par construction : toutes les données de panier et de récapitulatif viennent de la source et sont rendues telles quelles. **Q2** — survie du panier avant paiement — n'a pas de réponse ; c'est la seule case ouverte de cet écran et elle est nommée en §4 plutôt que comblée par une valeur inventée.

---

## 10. Checklist de gate

- [x] Les 9 états sont décrits avec un rendu concret.
- [x] Chaque élément interactif a un comportement et un feedback.
- [x] Le responsive est défini à **chaque** breakpoint du design system — Mobile livré, Tablet et Desktop **écrits comme hors périmètre** avec leur condition de retour.
- [x] La section Anti-générique est cochée et justifiée.
- [x] Aucune valeur de design n'est laissée à « à définir ». La seule question ouverte est **Q2 du PRD §10**, dont les deux issues possibles sont décrites en §4 sans qu'aucune ne soit choisie à la place du marchand.
- [x] Chaque ID B*/E*/C* de l'écran apparaît en section 9, et les règles citées sans être opposables sont nommées comme telles.
- [x] `node "$FORGE/scripts/forge-guard.js" placeholders <anchor>` ne signale rien ici.
- [x] L'écran reste cohérent avec `.forge/design/design-system.md`.