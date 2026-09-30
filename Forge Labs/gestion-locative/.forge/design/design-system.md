---
type: design-system
status: approved
generated_at: 2026-09-30
derived_from:
  - .forge/prd.md
  - .forge/roadmap.md
  - .forge/conventions.md
---

# Design System — Bailly

> Ce document définit les fondations visuelles et les patterns d'interaction du produit.
> Tous les écrans et composants y font référence. Modifier un token ici impacte tout le produit.
>
> **Aucun ratio de contraste n'est écrit à côté d'une valeur.** La mesure est faite par
> `design-check contrast`, qui classe chaque token grâce à la déclaration § 0.0 et applique
> le seuil correspondant. Un ratio rédigé serait un nombre fabriqué.

---

## 0.0 Déclaration des classes de couleurs

> **Les cinq directives**, et pourquoi Bailly ne peut pas s'en passer.

| Directive | Tokens | Seuil appliqué par `design-check contrast` |
|---|---|---|
| `text` | les quatre encres, les quatre accents d'état | 4,5:1 contre **chacun** des fonds listés en `on:` |
| `surface` | les quatre surfaces, les quatre teintes d'état | aucune exigence propre — le texte posé dessus est mesuré |
| `nontext` | bordures de composant, anneau de focus, fonds pleins pressés | 3:1 contre `--color-background` |
| `on` | les huit fonds où ces encres sont réellement posées | — |
| `exempt` | filets décoratifs, teinte de survol, voile, texte inactif | aucune — **la raison est écrite** |

<!-- forge:token-classes
text     --color-texte-principal --color-texte-secondaire --color-texte-tertiaire
text     --color-primaire-600 --color-confirme-600 --color-info-600 --color-alerte-600
on       --color-texte-principal = --color-background --color-surface --color-surface-raised --color-surface-sunken --color-primaire-950 --color-confirme-950 --color-info-950 --color-alerte-950
on       --color-texte-secondaire = --color-background --color-surface --color-surface-raised --color-surface-sunken --color-primaire-950 --color-confirme-950 --color-info-950 --color-alerte-950
on       --color-texte-tertiaire = --color-background --color-surface --color-surface-raised --color-surface-sunken
on       --color-texte-inverse = --color-primaire-600 --color-primaire-800 --color-confirme-600
on       --color-primaire-600 = --color-background --color-surface --color-surface-raised --color-surface-sunken --color-primaire-950
on       --color-confirme-600 = --color-background --color-surface --color-surface-raised --color-surface-sunken --color-confirme-950
on       --color-info-600 = --color-background --color-surface --color-surface-raised --color-surface-sunken --color-info-950
on       --color-alerte-600 = --color-background --color-surface --color-surface-raised --color-surface-sunken --color-alerte-950
surface  --color-background --color-surface --color-surface-raised --color-surface-sunken
surface  --color-primaire-950 --color-confirme-950 --color-info-950 --color-alerte-950
nontext  --color-bordure-champ --color-bordure-elevee --color-bordure-focus
nontext  --color-primaire-800 --color-info-800 --color-confirme-800 --color-alerte-800
exempt   --color-texte-desactive = texte d'une action inactively — WCAG 1.4.3 exempte le texte inactif
exempt   --color-filet = filet de séparation entre deux lignes, ne porte aucune information
exempt   --color-bordure-desactive = contour d'un composant inactif — 1.4.11 exempte le composant inactif
exempt   --color-teinte-survol = teinte de survol et de pression, aucun texte n'y est posé
exempt   --color-voile = voile derrière une feuille modale, ne porte aucune information
-->

**Pourquoi la déclaration est obligatoire ici, et pas facultative.** Un contrôle qui devine
la classe d'après le **nom** du token ne fonctionne que dans la langue de ce nom — et
Bailly est entièrement en français. Sans cette déclaration, `--color-texte-secondaire`
serait classé composant d'interface, jugé à 3:1, et **passerait**. C'est exactement
l'encre qui porte les dates de signature et les horodatages de synchronisation, c'est-à-dire
la provenance — l'information sur laquelle repose tout le produit.

**Les cinq classes ne sont pas cinq seuils, ce sont cinq questions.** Un token est-il posé
sous du texte ? Un fond reçoit-il du texte ? Un composant a-t-il une limite visible ? Sur
quel fond lit-on réellement cet encre ? N'est-ce ni l'un ni l'autre ?

---

## 0. Direction visuelle

| Ancre | Contenu |
|---|---|
| **Références** | **Linear** — la densité et la retenue : la hiérarchie vient d'une échelle typographique et d'un filet, jamais d'une ombre ni d'une carte. **1Password** — le geste d'ouverture : un seul secret, saisi vite, et **aucune gestion de compte** derrière ; on ouvre, on referme, on oublie. **L'application de paiement de la banque du propriétaire** — l'encaissement, la date de valeur, et surtout la manière dont une application financière traite un solde qu'elle n'a pas le droit de compensationner. |
| **Ambiance** | **opérationnelle · parlante · sans alarme** |
| **Anti-références** | Voir la liste ci-dessous, en huit points. Ce sont eux qui empêcheront un agent de retomber dans le défaut. |

### 0.1 Les huit anti-références

1. **Pas d'état en pastille, ni en point, ni en coche.** Un état est une **phrase**. Raison :
   le test de succès n°3 du PRD est un **test de langage** — le propriétaire doit pouvoir
   dire au téléphone « c'est confirmé » ou « pas encore confirmé » sans regarder l'écran.
   Un point vert ne se dit pas au téléphone ; « pas encore confirmé » se dit. *Ce choix coûte
   une ligne de plus que la pastille, et c'est le produit entier qui tient dessus.*
2. **Pas de rouge pour un état récurrent et normal.** « Pas encore confirmé » n'est pas une
   erreur, c'est un état de fonctionnement — le produit travaille hors ligne par conception
   (C9). Le rouge est réservé à deux choses : une **échéance manquée** et une **action
   impossible**. Partout ailleurs, c'est l'ambre de « sur cet appareil ».
3. **Pas d'ombre portée comme séparateur.** Dans un thème sombre une ombre ne se voit presque
   pas : la séparation se fait par un **filet** ou par un **changement de valeur de fond**,
   et l'ombre ne sert qu'aux deux surfaces qui flottent réellement — la feuille modale et la
   barre d'action.
4. **Pas de fond blanc, et pas de blanc pur en surface.** Le fond est un gris ardoise froid
   choisi à la valeur, jamais un blanc par défaut. Voir § 1.1.
5. **Pas de carte pour tout.** Une ligne de liste est une **ligne** : un filet entre deux
   lignes, zéro contour, zéro fond próprio. Une carte n'apparaît que là où l'objet a une
   existence séparée — un dialogue, une feuille, un aperçu d'export.
6. **Pas de pastille pleine pour une échéance.** Un aplat rouge répété est une alarme
   permanente, et une alarme permanente est une alarme ignorée (B13). Le drapeau manquée
   est un **filet plein de 3 px** et un mot, pas un bloc rouge.
7. **Pas de bouton « tout effacer » et pas d'écran « zone sensible » générique.** B18
   l'interdit par construction. Il n'existe donc **aucune variante de bouton destructive**
   dans ce design system, et ce n'est pas un oubli : la seule action destructive que
   Bailly connaît est interdite, et les trois états RGPD ne se déclenchent pas au même
   moment, donc aucun geste unique ne peut les déclencher (§ 2.13).
8. **Pas de « Réessayer » sur un état vide.** Un vide est un vide ; « Réessayer » promet une
   reprise, et il n'y a rien à reprendre. Et **aucun bouton de reprise manuelle pour une
   écriture** : la reprise est automatique (B1, C2), donc une reprise manuelle serait un
   aveu que l automatique peut échouer.

### 0.2 Positionnement

**Archétype d'application** : `mobile_field_ops` en principal, `rental_tenancy` en secondaire.

*Pourquoi.* Le geste se fait **debout, d'une main, dans un couloir ou un sous-sol**, avec
des écritures locales d'abord et une reprise automatique : c'est la définition de
`mobile_field_ops` (C2, C4, C9, N2). Mais les objets sont des baux, des loyers, des dépôts
de garantie et des échéances, et les pathologies de `rental_tenancy` — trois soldes jamais
nettés, FIFO sur l'avance, un mois qui n'a pas de longueur fixe, un délai légal en jours —
sont exactement celles de ce portefeuille. **On ne conçoit pas comme un back-office, parce
qu'il n'y a qu'un opérateur, et on ne conçoit pas comme une app grand public, parce que le
vocabulaire est juridique.**

**Plateforme** : **téléphone d'abord** (iOS et Android, React Native), portable ensuite.
Le portable sert au travail de fond — encaissement, export, relecture d'un dossier — et
c'est la même application. **Il n'existe pas de version navigateur de bureau** (X11) :
`--bp-desktop` et `--bp-wide` existent parce que la build web tourne sur un portable, pas
parce qu'un écran de bureau serait une cible.

**Boucle de travail** : le matin, ouvrir et **lire le bandeau** (« Rien à confirmer » ou
« 2 écritures pas encore confirmées ») ; pendant la journée, **saisir ce qui s'est passé** —
fait daté, somme due, photo, signature — souvent sans réseau ; quand le réseau revient,
**confirmer** sans rien avoir à faire. Le 6 du mois, **encaisser et relancer**. En fond de
tournée, **dégager ce qui attend**.

**Densité retenue** : **dense** — et il faut dire ce que dense veut dire, parce qu'en
téléphone « dense » veut dire « petit », et c'est faux ici.

* La ligne de liste fait **56 pt** de haut au repos et **60 pt** pressée. Une ligne aérée de
  88 pt n'aurait pas deux informations de plus : elle en aurait **zéro de plus**, parce que
  Bailly n'affiche ni graphique ni indicateur agrégé (roadmap § 5 : « aucune agrégation,
  aucun indicateur — ce serait une chose qu'il consulte au lieu d'appeler »). La hauteur
  d'une ligne est donc un problème d'**information par centimètre**, pas d'aération.
* **Aucun texte courant sous 14 px**, et le corps est à **17 px** (au-dessus du plancher de
  16 px). N4 vise un propriétaire de 58 ans qui lit des chiffres à la tombée du jour : la
  densité se paie en hauteur de ligne, jamais en taille de police.
* Les cibles tactiles restent à **52 pt** de haut (N3 impose 44 pt ; on prend 52 parce que
  le pouce est plus large que le bout du doigt et que l'écran est tenu d'une main).
* **L'échelle typographique est celle du réglage du téléphone** (N5) : toutes les tailles
  sont en `rem` et l'application respecte le réglage du système, **plafonné à ×1,3**. La
  raison du plafond est C4 : au-delà, le corps double et la barre d'action sort de la
  portée du pouce. Ce plafond est un **écart conscient à N5**, et le seul élément qui doit
  survivre à ×1,3 sans casser est le bandeau de synchronisation, dont le texte est autorisé
  à passer sur trois lignes et ne pousse rien.

### 0.3 Le choix qui divise — un thème sombre unique

Bailly n'a qu'un thème, et il est **sombre**. Ce n'est pas une mode, et ce n'est pas par
goût : c'est la seule palette qui permet de tenir N4 **et** une hiérarchie à trois valeurs
de gris dans un couloir mal éclairé.

L'argument tient en une phrase : **sur fond clair, un gris secondaire lisible à 4,5:1
devient si proche du texte principal que la hiérarchie s'effondre ; sur fond sombre, la
plage des gris disponibles à contraste égal est deux fois plus large, donc la hiérarchie
tient avec trois valeurs au lieu d'une, et elle tient dans le noir.**

Ce que ça coûte, et c'est réel :

* Le travail de fond au bureau se fait sur un écran sombre. Accepté : l'export est un
  document **clair** (Markdown, CSV), et c'est là que la lecture longue a lieu.
* Le thème sombre à plat est plus plat qu'un thème clair. Contre-mesure : l'élévation est
  portée par `--color-surface-raised` **et** par `--color-bordure-elevee`, jamais par
  l'ombre seule.
* Une seule palette de faut-il se voir dans un couloir à 2 000 lux et dans un sous-sol à
  20 lux. Contre-mesure assumée : on ne fait pas de thème clair « pour le bureau ».

### 0.4 Le système de couleurs a quatre teintes, et chacune dit quelque chose

Ce n'est pas une palette, c'est un **vocabulaire de teintes**. Chaque teinte porte une
situation, et une seule :

| Teinte | Elle dit | Où elle sert |
|---|---|---|
| **Ambre** `--color-primaire-*` | **sur cet appareil** | l'action, le bandeau des écritures non confirmées, l'état d'une pièce jointe en attente |
| **Sauge** `--color-confirme-*` | **confirmé par le serveur** | le mot « Synchronisé » en accent, l'export produit. Jamais un aplat : un aplat vert est une récompense, et une récompense attire l'œil sur une information qui n'en a pas besoin |
| **Cyan-gris** `--color-info-*` | **à venir** | une échéance qui n'est pas encore échue, une date future |
| **Terre cuite** `--color-alerte-*` | **en retard, ou impossible** | le drapeau manquée, le stockage plein, l'action que Bailly refuse de faire hors ligne |

**Ambre = chez moi. Sauge = chez le serveur.** Toute la palette découle de cette phrase :
un produit qui promet de ne pas mentir doit rendre visible **où** se trouve ce qu'il dit.

**Une cinquième famille n'a aucune teinte, et c'est délibéré.** Les échéances de **marge**
(validité des diagnostics, assurance PNO) sont rendues en `--color-texte-secondaire` avec un
**filet plein de 3 px** au lieu d'un point — donc différenciées par la **forme**, pas par la
couleur. Leur échéance est « une marge, pas une alarme » (roadmap § 2.3) : leur donner une
cinquième teinte leur donnerait un statut qu'elles n'ont pas, et le propriétaire finirait par
l'apprendre comme un cinquième statut. **La forme suffit, et une famille de moins à
apprendre.**

### 0.5 Ce que ce design system ne dessine pas, et pourquoi

Une liste d'exclusions **écrite ici** vaut mieux qu'une liste d'exclusions oubliée écran par
écran. Chacune de ces lignes est un composant qui **n'existe pas** dans le § 3, et le nom
du composant absent est la moitié de l'exclusion.

| Le PRD exclut | Le composant qui n'existe donc pas | Pourquoi il ne peut pas exister |
|---|---|---|
| **X3** révision annuelle du loyer | `ChampIndiceIRL` — un champ de révision, un taux, un bouton `Appliquer` | Une révision est un **calcul**, et B16 interdit tout calcul non validé. Un taux écrit par l'application serait une décision de droit prise par un formulaire |
| **X4** fiscalité | aucun formulaire de declaration, aucun revenu, aucun abattement | Même raison. Une fiscalité saisie dans cette application serait une donnée fiscale sans contrôle, et c'est un risque sans contrepartie |
| **X8** comptabilité générale, écritures, amortissements | `PlanComptable`, `Journal`, `GrandLivre` | B16 : Bailly **affiche des sommes, elle ne les calcule pas**. Un module de comptabilité est un module de calcul, donc il ne peut pas coexister avec cette règle |
| **X7** inventaire des biens | `ListePostes`, `EtatDesLieux` structuré par poste | Le commanditaire l'a nommé : « une corvée qui devient une corvée ». Un inventaire à cocher est un écran que l'on ouvre une fois par an et que l'on ne remplit pas |
| **X5** multi-utilisateurs, rôles, permissions | `SelecteurUtilisateur`, `Avatar`, `SwitcherCompte`, `EcranAdministration` | C3 : un seul utilisateur, par construction. Un sélecteur de compte dans une application à un compte est un mensonge sur la forme du produit |
| **X9** assurance, statistiques de sinistre, déclaration de sinistre | `Sinistre`, `DeclarationAssurance` | Non demandé. **Mais l'échéance d'assurance PNO reste dans la famille `marge`** (roadmap § 2.3) : c'est une date, pas un dossier. La date est dessinée, le dossier ne l'est pas — et la distinction est celle de `DrapeauÉchéance` : un filet gris, jamais un aplat |
| **X1** quittance, **X2** régularisation | `ModeleQuittance`, `CalculCharges` | Refusés par B16 au moment de la saisie, et **le refus est écrit dans `saisir-somme`** : « Bailly n'enregistre que le loyer et les provisions. » Le refus est un rendu d'écran, pas une note |
| **X6** carte, plan, itinéraire | `Carte`, `Plan`, `Itineraire` | L'adresse est une donnée du bail, et c'est tout. Aucun composant de localisation n'existe, donc aucun écran ne peut en hériter par inadvertance |
| **X10** notification poussée | `NotificationPush` | B6 rend le compteur permanent, donc une notification est un doublon qui coûte un canal à maintenir. Le seul `BandeauAlerte` qui ressemble à une notification est en variante `information` et **ne survit pas à la condition qui l'a fait naître** |
| **X12** signature électronique qualifiée eIDAS | `SignatureQualifiee`, `Certificat`, `Signature electronique` — **et il n'y a pas non plus de signature du tout** | B5 définit ce que « signé » veut dire ici. Le composant `Signature` du § 3.28 est specifié **pour que B5 ait une manifestation visuelle**, et il n'est branché sur **aucun** écran du MVP, parce qu'aucune des huit slices ne le réclame. Le jour où une slice le réclame il est déjà écrit ; le jour où aucune ne le réclame il ne coûte rien |

**La règle qui produit cette liste** : un composant qui n'a pas de user story n'occupe pas
de place dans ce document. Les huit lignes ci-dessus ne sont pas des composants absents par
négligence — ce sont des composants **interdits**, et il est plus sûr de les nommer que de
les laisser à l'imagination du prochain agent.

---

## 1. Design tokens

### 1.1 Couleurs

**Surfaces et teintes de fond**

| Token | Valeur | Usage |
|---|---|---|
| `--color-background` | `#101319` | Fond de l'application, derrière toute la hiérarchie. Jamais `#FFFFFF`, jamais `#000000` : c'est un gris ardoise froid choisi |
| `--color-surface` | `#171B22` | Surface de base : ligne de liste, feuille modale, dialogue |
| `--color-surface-raised` | `#212630` | Surfaces élevées : barre d'action, feuille au premier plan, ligne pressée, en-tête de feuille |
| `--color-surface-sunken` | `#0A0C10` | Creux : champ de saisie, aperçu d'export, ligne alternée d'une liste dense |
| `--color-primaire-950` | `#2B1F0D` | Teinte de fond « sur cet appareil » — bandeau des écritures non confirmées, ligne d'une pièce jointe en attente |
| `--color-confirme-950` | `#14231A` | Teinte de fond « confirmé par le serveur » — panneau « export produit » |
| `--color-info-950` | `#12222A` | Teinte de fond « à venir » — ligne du drapeau d'échéance future |
| `--color-alerte-950` | `#2E1512` | Teinte de fond « en retard ou impossible » — drapeau manquée, bandeau d'action impossible |

**Textes**

| Token | Valeur | Usage |
|---|---|---|
| `--color-texte-principal` | `#E8ECF3` | L'encre de lecture. Tout ce qui porte un fait, un montant, un nom, un état |
| `--color-texte-secondaire` | `#A6B0C0` | La seconde ligne d'une ligne de liste, l'aide d'un champ, le corps d'un état |
| `--color-texte-tertiaire` | `#8B95A5` | La date d'une ligne, l'horodatage, la mention « sans réseau » |
| `--color-texte-inverse` | `#14171D` | L'encre posée sur un fond clair : bouton primaire, bouton pressé, pastille « export produit ». C'est une encre sombre sur fond clair, dans un thème sombre — le nom est celui de l'inversion, pas de la valeur |
| `--color-texte-desactive` | `#5B6474` | Libellé d'une action impossible. Exempt : WCAG 1.4.3 exempte le texte inactif, et une action impossible se reconnaît à son absence de contour |

**Teintes d'état**

| Token | Valeur | Usage |
|---|---|---|
| `--color-primaire-600` | `#E0A23A` | Le mot d'accent et d'état : « pas encore confirmé », un lien d'action, l'icône du bandeau. **Et le fond du bouton primaire** — un seul jeton, deux usages, parce que l'action et l'état local sont la même situation |
| `--color-primaire-800` | `#A87B2B` | Fond du bouton primaire pressé, et anneau plein de 2 px du bouton au repos. Jamais du texte |
| `--color-confirme-600` | `#7FB08C` | Le mot « Synchronisé » en accent, le filet de 2 px d'un bloc confirmé |
| `--color-confirme-800` | `#4F7F5F` | Contour d'un bloc « export produit ». Jamais du texte |
| `--color-info-600` | `#74A9BC` | Le mot « À venir », l'icône du drapeau d'échéance future, une date future |
| `--color-info-800` | `#4E7C8C` | Contour du drapeau « à venir proche ». Jamais du texte |
| `--color-alerte-600` | `#F09286` | Le mot « Manquée », l'icône d'impossible, le filet plein de 3 px du drapeau manquée |
| `--color-alerte-800` | `#C4614F` | Contour plein de l'état impossible. Jamais du texte |

**Bordures, filets et voiles**

| Token | Valeur | Usage |
|---|---|---|
| `--color-bordure-champ` | `#7C8695` | Contour d'un champ de saisie, d'un sélecteur, d'un interrupteur. **C'est le filet clair, et c'est voulu** : dans un couloir sombre, c'est le contour qui dit « ici on peut écrire », pas le remplissage, qui ne se voit pas |
| `--color-bordure-elevee` | `#79828F` | Contour d'une surface élevée : barre d'action, feuille modale. Porte l'élévation à la place de l'ombre |
| `--color-bordure-focus` | `#E0A23A` | Anneau de focus, 2 px, avec 2 px de `--color-background` entre l'anneau et le composant. Même teinte que l'action : ce sur quoi le focus se pose est ce qu'on peut activer |
| `--color-filet` | `#2A303A` | Filet de 1 px entre deux lignes de liste, et sous un titre de bloc. Filet décoratif, ne porte aucune information |
| `--color-bordure-desactive` | `#3A414C` | Contour d'un composant inactif. Exempt : 1.4.11 exempte le composant inactif |
| `--color-teinte-survol` | `#1E242E` | Teinte de survol et de pression d'une ligne cliquable. Aucun texte n'y est posé — le texte de la ligne ne change pas de teinte |
| `--color-voile` | `#05070A` | Voile à 72 % derrière une feuille modale. Ne porte aucune information |

### 1.2 Typographie

**Deux familles, et la seconde n'est pas décorative.** La première est la **pile système**
(`system-ui, -apple-system, "Segoe UI", Roboto`) : N5 impose que le texte suive le réglage du
téléphone, et une police embarquée ne suit pas le réglage du poids. La seconde est une
**chasse fixe** (`ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas`) : dans une
colonne de dates et de montants, les chiffres doivent s'aligner verticalement, sinon « 84 »
et « 1 284 » se lisent de travers. C'est la seule exigence réelle d'une deuxième famille
ici, et elle est fonctionnelle.

| Token | Font family | Taille | Graisse | Line-height | Usage |
|---|---|---|---|---|---|
| `--font-sans` | pile système | — | — | — | Tout le texte courant et tous les titres |
| `--font-chasse` | pile à chasse fixe, chiffres tabulaires | — | — | — | Montants, dates, horodatages, aperçu d'export, code |
| `--text-overline` | inherit | 0.8125rem | 600 | 1.25 | Étiquette de champ, sur-titre de bloc. Interlettrage +0.08em, jamais seule en bas de bloc |
| `--text-caption` | inherit | 0.875rem | 400 | 1.35 | Date d'une ligne de liste, aide d'un champ, mention « sans réseau » |
| `--text-body-sm` | inherit | 1rem | 400 | 1.4 | Seconde ligne d'une ligne de liste, corps d'un état |
| `--text-body` | inherit | 1.0625rem | 400 | 1.45 | Texte courant, corps d'une feuille |
| `--text-body-fort` | inherit | 1.0625rem | 600 | 1.45 | Un montant en cours, un libellé de champ, un mot d'état |
| `--text-h4` | inherit | 1.25rem | 600 | 1.3 | Titre de feuille, titre d'un bloc de formulaire |
| `--text-h3` | inherit | 1.5rem | 600 | 1.25 | Titre d'un panneau : le bandeau, le panneau de blocage |
| `--text-h2` | inherit | 1.75rem | 700 | 1.2 | Titre d'écran |
| `--text-h1` | inherit | 2.125rem | 700 | 1.15 | Le nombre du bandeau de synchronisation, et lui seul |

**Le ratio de l'échelle, écrit** : à partir du corps à 17 px, le pas est de **×1,19** —
14 / 16 / 17 / 20 / 24 / 28 / 34. Ce n'est pas un ratio de lecture (un tiers serait trop
large pour un écran de téléphone tenu d'une main), c'est un ratio de **densité** : la
hiérarchie doit se voir sur une capture de 180 pt de haut, pas sur un écran de bureau.
`--text-h1` n'est employé qu'à un endroit dans tout le produit, et cet endroit est le
compteur du bandeau — un nombre qu'il regarde debout, de loin, et qu'il doit pouvoir lire
avant de s'approcher.

**Graisses** : 400 (courant), 500 (libellé de champ, barreau de progression), 600 (titre,
montant, mot d'état), 700 (compteur, titre d'écran). Aucune graisse n'est utilisée pour
porter seule une distinction d'état : un état porte un **mot**.

### 1.3 Espacements

| Token | Valeur | Usage |
|---|---|---|
| `--space-xs` | 0.25rem | Écart entre un mot d'état et sa phrase |
| `--space-sm` | 0.5rem | Padding interne d'une pastille, écart entre deux lignes d'un même bloc |
| `--space-md` | 0.75rem | Padding d'une ligne de liste, écart d'un paragraphe court |
| `--space-lg` | 1rem | Padding d'un bloc, marge entre deux blocs d'une feuille |
| `--space-xl` | 1.5rem | Séparation de deux groupes dans une feuille, padding d'une feuille modale |
| `--space-2xl` | 2rem | Séparation de deux sections, padding haut d'une feuille |
| `--space-3xl` | 3rem | Marge de page, respiration au-dessus de la barre d'action |

**L'espacement n'est pas uniforme, et c'est voulu.** Un regroupement doit se lire dans
l'espace : entre deux blocs d'une même feuille il y a `--space-2xl` et un sur-titre, entre
deux lignes d'un même bloc il y a `--space-sm` et rien. Le rapport est de 4, ce qui est le
minimum pour que l'œil regroupe seul dans un couloir sombre.

### 1.4 Ombres

**Dans ce thème sombre, l'ombre ne porte pas l'élévation.** Elle ne sert qu'aux deux
surfaces qui flottent réellement au-dessus du contenu.

| Token | Valeur | Usage |
|---|---|---|
| `--shadow-none` | none | Tout le reste. Une ligne de liste, un panneau, un bandeau n'ont pas d'ombre |
| `--shadow-sm` | `0 1px 3px rgba(0, 0, 0, 0.55)` | Feuille modale, sur son fond `--color-surface` |
| `--shadow-md` | `0 10px 28px rgba(0, 0, 0, 0.60)` | Barre d'action fixe, au-dessus de la liste |
| `--shadow-lg` | `0 -14px 36px rgba(0, 0, 0, 0.62)` | Feuille qui monte du bas : l'ombre tombe vers le haut, c'est la seule fois qu'elle est dirigée |
| `--shadow-xl` | `0 20px 56px rgba(0, 0, 0, 0.70)` | La seule surface au-dessus du voile : le dialogue de confirmation d'un geste non réversible |

### 1.5 Bordures

| Token | Valeur | Usage |
|---|---|---|
| `--radius-none` | 0 | Filet, ligne de liste, bandeau : tout ce qui est un bord |
| `--radius-sm` | 6px | Badge d'un compteur, pastille d'état, vignette de photo |
| `--radius-md` | 10px | Champ de saisie, bouton, ligne de dialogue |
| `--radius-lg` | 14px | Feuille modale, carte de dialogue |
| `--radius-full` | 9999px | Interrupteur, barre de segment, pastille pleine |

### 1.6 Animations

| Token | Valeur | Usage |
|---|---|---|
| `--duration-fast` | 120ms | Survol, focus, changement d'état d'un composant |
| `--duration-normal` | 200ms | Ouverture d'une feuille, changement d'état du bandeau, bascule d'un segment |
| `--duration-slow` | 320ms | Entrée d'un écran, apparition d'un panneau de blocage |
| `--ease-default` | `cubic-bezier(0.2, 0, 0, 1)` | Toute transition standard |
| `--ease-in` | `cubic-bezier(0, 0, 0, 1)` | Apparition : la feuille monte, la hauteur part de zéro |
| `--ease-out` | `cubic-bezier(0, 0, 0.2, 1)` | Disparition : la feuille redescend |

**Deux règles d'animation, non négociables.**

* **Aucun état de synchronisation n'est animé.** Le bandeau ne pulse pas, ne brille pas, ne
  fait pas défiler son texte. Un compteur qui attire l'œil est un compteur qu'on regarde
  pour ne plus l'avoir sur le nez (B6 : le compteur est permanent, il n'a pas besoin d'être
  signalé).
* **`prefers-reduced-motion` réduit tout à 0 ms**, sans exception, y compris l'ouverture des
  feuilles. Une animation de 320 ms n'apporte rien à un propriétaire qui lit vite, et elle
  coûte 320 ms à chaque ouverture.

### 1.7 Breakpoints

| Token | Valeur | Usage |
|---|---|---|
| `--bp-mobile` | 0–479 px | Cible principale. 360 × 640 est la taille de référence, pas 390 × 844 : c'est le téléphone le plus petit qu'il possède encore, et un design qui ne tient que sur un grand écran ne tient pas debout dans un couloir |
| `--bp-tablet` | 480–899 px | Le portable en paysage, et une tablette. Le contenu passe à deux colonnes : liste à gauche, détail à droite |
| `--bp-desktop` | 900–1279 px | La build web sur un portable. **Aucun écran n'a de rendu distinct ici** : X11 exclut la version navigateur de bureau, la mise en page reste celle du portable et se contente d'être centrée dans la fenêtre |
| `--bp-wide` | 1280 px et au-delà | Idem. La grille ne s'élargit pas : un dossier locatif sur 1 920 px est moins lisible, pas plus |

**Ce que la taille d'écran ne change pas.** Le nombre de cibles, la hauteur des lignes, la
position de l'action principale et l'ordre des onglets sont **identiques** du plus petit au
plus grand. Seule la largeur de la colonne de contenu change. Un propriétaire qui passe de
son téléphone à son portable retrouve le même produit, pas un produit différent.

---

## 2. Le vocabulaire : trois mots, jamais deux

> Cette section est **avant** les composants, parce que chaque composant du produit affiche
> l'un de ces trois mots. Un composant qui n'affiche pas l'un d'eux n'est pas un composant
> de Bailly.

### 2.0.1 Pourquoi cette section existe

B2 impose trois mots. R3 constate que le propriétaire ne voit pas la différence entre
« signé ici » et « synchronisé » et présente le premier comme le second. Le critère de
succès n°3 du PRD est un **test de langage** : il doit pouvoir dire au téléphone « c'est
confirmé » ou « pas encore confirmé » **sans regarder l'application**.

Un mot d'état ne suffit pas. « Synchronisé » dit qu'une **machine** a terminé ; « pas encore
confirmé » dit qu'une **personne** n'a rien vérifié. Un locataire qui entend « c'est
synchronisé » ne comprend pas, et pose une seconde question. La phrase de B2 est donc
**le mot d'écran**, et elle est doublée d'une **phrase de lecture** qui contient le mot du
téléphone. **Le mot d'état ne se suffit jamais à lui-même à l'écran.**

### 2.0.2 Les trois mots

| # | Le mot d'état, écrit partout | La phrase de lecture, affichée sous le mot | Le mot du téléphone |
|---|---|---|---|
| **1** | **Signé ici, pas encore envoyé** | « L'acte est fait sur cet appareil. Le serveur ne l'a pas confirmé, donc la signature n'est pas valide (B5). » | « pas encore confirmé » |
| **1 bis** | **Pas encore envoyé** — pour toute autre écriture : fait, somme, photo | « L'écriture est sur cet appareil. Le serveur ne l'a pas confirmée. » | « pas encore confirmé » |
| **2** | **Synchronisé** | « Le serveur a confirmé le 12 à 18 h 04. » | « confirmé » |
| **3** | **À venir** / **Manquée** | « À venir le 31/12/2028, dans 84 jours. » / « Manquée depuis 6 jours. Remontée une fois, le 7 janvier. » | « pas faite » |

**Un mot par état, jamais deux à la fois.** Une ligne ne porte jamais « pas encore envoyé »
et « échéance manquée » dans le même bloc : ce sont deux familles, et les confondre
reviendrait à dire qu'une écriture est en retard, ce qui n'est pas le sens du mot.

### 2.0.3 Les mots interdits

Cette table n'est pas une préférence de style : **chaque mot interdit est une phrase que le
propriétaire pourrait répéter au téléphone et qui serait fausse.**

| Interdit | Pourquoi il est faux |
|---|---|
| « enregistré », « sauvegardé », « enregistré automatiquement » | L'appareil n'est pas une preuve, il est volable (B5, E2). Ces trois mots promettent une conservation que rien ne garantit |
| « en ligne », « synchronisé ✓ », « en ligne ✓ » | Une coche sur un mot d'état est un glyphe, pas une phrase, et elle ne se dit pas au téléphone |
| « en attente », « en cours », « transfert », « upload », « traitement en cours » | Ces mots-là promettent qu'un **instant** existe, donc qu'une attente bornée existe. Or la reprise est automatique et **sans borne** (C2) : dire « en cours » promet une fin à une opération qui n'en a pas |
| « terminé », « réussi », « sauvegardé sur nos serveurs » | « Nos serveurs » est une promesse de sauvegarde que C1 confie à l'hébergeur, pas à Bailly. L'application ne peut pas l'écrire |
| « tout est bon », « aucune action requise », « tout va bien » | Ces trois phrases ferment la boucle avant qu'elle soit bouclée. C'est la forme exacte du mensonge que le produit promet de ne pas faire |
| « alerte », « urgent », « rappel » — pour une échéance | Un mot d'alarme sur un produit qui promet de ne pas crier. Le mot d'état est « Manquée » ; ce qui est en retard se dit, il ne s'alarme pas (B13) |
| « supprimer » — pour l'état RGPD d'un dossier | L'action n'existe pas (B18). Ce qui existe, c'est « effacer », « anonymiser », « conserver » — et jamais les trois d'un coup |

### 2.0.4 Le test, écrit comme une question d'un seul coup

À la fin de la conception de chaque écran qui porte un de ces trois mots, la question est :

> **Que dit le propriétaire au téléphone s'il n'ouvre pas l'application ?**

Si la réponse n'est pas lisible dans la phrase affichée, la phrase est refaite. Ce n'est pas
une vérification de cohérence, c'est le critère de succès n°3 du PRD, appliqué écran par
écran.

---

## 3. Composants primitifs

> Vingt-neuf composants, et pas un de plus. La liste est **exhaustive pour le périmètre du
> MVP** : un composant qui ne sert aucune des huit slices n'est pas dans ce document, et un
> composant qui ne sert qu'à une slice est écrit dans son écran, pas ici.
>
> **Chaque composant déclare ses états avec le nom de l'union qui les rend** — ce pointeur
> est la seule chose que `consistency-check state-parity` peut résoudre, et le nom est écrit
> ici pour être repris tel quel par l'architecture, en Phase 4.

---

### BandeauSynchronisation

**Rôle** : dire, en permanence et en une phrase, où se trouve ce que le propriétaire vient
d'écrire. C'est le composant le plus important du produit : il est le seul élément qui
n'est jamais masqué, jamais replié, jamais caché (B6).

> **Ce que ce bandeau ne promet pas, et c'est volontaire.** La question **Q3** du PRD —
> quel hébergeur, et quel engagement de sauvegarde écrit — est **sans réponse**. Donc le
> bandeau dit exactement deux choses et pas une de plus : *le serveur a confirmé cette
> écriture* et *elle est encore sur cet appareil*. Il ne dit **jamais** « sauvegardé chez
> nous », « sauvegarde automatique », « vos données sont en sécurité ». Le mot qu'il emploie
> est `confirmé`, qui décrit une **réponse du serveur à une écriture**, et rien d'autre. Une
> promesse de conservation serait une promesse qu'un composant d'interface n'a pas le droit
> de faire à la place de l'hébergeur, et C1 a confié cette promesse à quelqu'un d'autre.

**Variantes** :

| Variante | Apparence | Usage |
|---|---|---|
| `rien_a_confirmer` | `--color-surface`, filet `--color-filet` en bas, icône `—` en cercle, phrase en `--color-texte-secondaire` | Tout est confirmé. **Ce n'est pas un succès, donc ce n'est pas vert** : un état « tout va bien » coloré est une récompense, et une récompense attire l'œil sur une information qui n'en a pas besoin |
| `a_envoyer` | Fond `--color-primaire-950`, filet ambre `--color-primaire-600` de 2 px à gauche, icône `↑` cerclée, nombre en `--text-h1` ambre | Le cas courant : il y a des écritures chez moi et pas encore chez le serveur |
| `hors_ligne` | Fond `--color-primaire-950`, filet ambre de 2 px, icône `⊘` | Impossible d'envoyer. La phrase dit ce qui va se passer, pas ce qui a échoué |
| `echec_envoi` | Fond `--color-alerte-950`, filet `--color-alerte-600` de 2 px, icône `!` | L'envoi a échoué plusieurs fois. **L'échec est annoncé, jamais l'envoi** — C9 |
| `lecture_seule` | Fond `--color-surface`, filet `--color-filet`, icône `🔒` | L'appareil a été reverrouillé : on lit, on n'écrit pas encore |

**Tailles** : hauteur **72 pt** au repos, **96 pt** si la phrase passe sur deux lignes,
**120 pt** au réglage ×1,3. Le bandeau **grandit** vers le bas et ne pousse jamais le
contenu hors de l'écran.

**États** — rendus par l'union `EtatEcriture`, sauf `hover`, `active`, `focus`, `disabled` (le bandeau n'est pas une cible, et son état « chargement » **est** son état `a_envoyer` : le masquer serait mentir) :

| État | Déclencheur | Apparence |
|---|---|---|
| `rien_a_confirmer` | La file locale est vide et le dernier envoi a été confirmé | « **Rien à confirmer.** Tout ce que tu as saisi est confirmé par le serveur. » — icône `—` en cercle, en `--color-texte-tertiaire` |
| `a_envoyer` | Au moins une écriture locale non confirmée | « **2 écritures pas encore confirmées.** Elles partent seules dès que le réseau revient. » + un lien `Voir` — icône `↑` en cercle ambre, **le mot du téléphone est dans la phrase** |
| `hors_ligne` | Aucune connectivité | « **Hors-ligne.** Rien ne part pour l'instant. Tes écritures restent sur cet appareil et elles repartent seules. » — icône `⊘` ambre |
| `echec_envoi` | Trois tentatives consécutives ont échoué à être en ligne | « **3 écritures n'ont pas pu partir.** Elles sont encore sur cet appareil. Ouvre-les une par une. » — icône `!` terre cuite. **Aucun bouton « Réessayer »** : la reprise est automatique, un bouton dirait qu'elle ne l'est pas |
| `lecture_seule` | Écran verrouillé, ou écriture impossible | « **Lecture seule.** Déverrouille pour écrire. Ce que tu lis ici est confirmé. » — icône `🔒` |

**Slots** :

| Slot | Requis | Contenu |
|---|---|---|
| `icone` | oui | Un glyphe **circulaire** de 24 pt, à gauche, suivi du nombre s'il y en a un. Jamais un glyphe nu |
| `nombre` | non | Le compte des écritures en attente, en `--text-h1` chasse fixe. Absent quand le compte est zéro : **un zéro n'est pas un compte** |
| `phrase` | oui | La phrase de § 2.0.2, complète, jamais abrégée par un nombre seul |
| `lien_voir` | non | `Voir` — mène à la liste filtrée sur « pas encore confirmé ». N'apparaît que s'il y a des écritures à voir |
| `phrase_secondaire` | non | Une ligne de plus, en `--text-caption`, qui **n'ajoute jamais un mot d'état** : elle explique une conséquence (« sans réseau, une relance ne part pas ») |

---

### DrapeauÉchéance

**Rôle** : porter le **seul** drapeau d'échéance d'une ligne, et le porter une fois
(B13). Un objet qui porte deux échéances n'affiche qu'un drapeau — celui de la plus
échéance, et le panneau de blocage nomme les autres.

> **Les cinq échéances sont nommées, et Q1 est donc clos pour la conception.** Le PRD laissait
> Q1 ouverte — « les cinq échéances que je ne dois pas louper », sans les nommer — et la
> roadmap § 2.3 les a nommées et **classées par le commanditaire lui-même**. Le design system
> ne les redécouvre pas et ne les redéfinit pas : il dessine la **forme** qui les porte, et
> cette forme a deux branches — `famille = bloquante` et `famille = marge` — parce que les
> trois premières bloquent et les deux autres sont « une alerte longue et silencieuse ».
>
> | Échéance | Rappel à | Délai | Famille | Rendu |
> |---|---|---|---|---|
> | Fin de terme, opposition à la reconduction tacite | propriétaire | 3 mois — **6 en meublé** | `bloquante` | `DrapeauÉchéance` + `Bouton` `Décider` |
> | Bascule en créance exigible | propriétaire, puis relance au locataire | 6ᵉ jour | `bloquante` | idem, et la date de bascule est **dérivée**, jamais saisie |
> | Restitution du dépôt de garantie | propriétaire | 1 mois — **21 jours** si aucune retenue | `bloquante` | idem |
> | Validité des diagnostics (DPE, gaz, amiante) | propriétaire | 6 ans — **10 ans** pour un DPE antérieur à 1948 | `marge` | `DrapeauÉchéance` variante `marge`, **sans bouton `Décider`** |
> | Assurance PNO | propriétaire | annuel | `marge` | idem |
>
> **Les deux branches ne se ressemblent pas, et c'est tout le sujet.** Une échéance
> `bloquante` peut rendre un `Bouton` et **déplace l'action principale de la barre**. Une
> échéance `marge` ne peut rendre **aucun** bouton, ne prend **aucun** filet de couleur, et
> son information n'apparaît que dans la fiche du bail. Une marge qui prend la place de
> l'action serait déjà devenue une alarme.

**Variantes** :

| Variante | Apparence | Usage |
|---|---|---|
| `bloquante_a_venir` | Point creux `--color-info-600`, libellé `--color-info-600` | Les trois échéances bloquantes, avant leur date |
| `bloquante_proche` | **Cercle plein** `--color-info-600`, contour `--color-info-800`, libellé `--color-info-600` | Échéance bloquante à 30 jours ou moins. La forme change, pas seulement la couleur |
| `bloquante_manquee` | **Filet plein de 3 px** `--color-alerte-600` sur `--color-alerte-950`, libellé `--color-alerte-600` | Échéance manquée. **Jamais un bloc rouge plein** : un aplat rouge répété est une alarme permanente (B13) |
| `bloquante_faite_tard` | Filet plein de 3 px `--color-info-600`, libellé `--color-texte-secondaire` | Décidée après la date. Elle **cesse d'être rouge au moment où elle est traitée** : c'est ce qui rend l'alerte lisible la prochaine fois |
| `bloquante_faite_avec_accord` | Filet plein de 3 px `--color-confirme-800`, libellé `--color-texte-secondaire` | Décidée après un accord passé. Elle se range |
| `marge` | **Filet plein de 3 px** `--color-filet` sur la ligne entière, libellé `--color-texte-tertiaire` | Les deux échéances de marge. **Aucune teinte** : c'est une marge, pas une alarme, et une cinquième couleur lui donnerait un statut qu'elle n'a pas |
| `aucune` | Rien | Aucun drapeau rendu. Ce n'est pas un état : c'est l'absence de l'indicateur, et elle ne s'annonce pas |

**Tailles** : hauteur **24 pt**, largeur variable, rayon `--radius-sm`, marge droite
`--space-md` dans une ligne de liste. En liste dense, il passe sur **sa propre ligne** sous
le titre, jamais à la fin d'une ligne de 60 pt de large.

**États** — rendus par l'union `EtatEcheance`, sauf `hover`, `active`, `focus`, `disabled`, `loading` (un drapeau ne se presse pas : il est le **résultat** d'une décision, jamais une cible) :

| État | Déclencheur | Apparence |
|---|---|---|
| `a_venir` | La date d'échéance est future | « **À venir** · 31/12/2028 · J‑84 » — point creux cyan-gris |
| `proche` | 30 jours ou moins avant la date | « **À venir** · 31/12/2028 · J‑12 » — cercle plein cyan-gris. Le mot ne change pas : c'est la **forme** qui presse |
| `manquee` | La date est passée et rien n'a été décidé | « **Manquée depuis 6 jours** · remontée une fois, le 7 janvier » — filet terre cuite. Le jour de la remontée est écrit, pour que le propriétaire sache qu'il ne l'aura pas deux fois |
| `faite_tard` | Décidée après la date | « **Faite tard** · le 9 janvier, 6 jours après » — filet cyan-gris, libellé gris. Plus rouge |
| `faite_avec_accord` | Décidée après la date, avec un accord | « **Faite avec accord** · le 7 janvier » — filet vert-gris, libellé gris |
| `marge` | Une échéance de marge est dans la fenêtre d'affichage | « **Marge** · DPE valable jusqu'au 04/03/2032 » — filet neutre, aucune teinte |
| `absent` | Aucune échéance, ou échéance hors fenêtre | **Rien n'est rendu.** Pas de place vide, pas de tiret |

**Slots** :

| Slot | Requis | Contenu |
|---|---|---|
| `famille` | oui | `bloquante` ou `marge`. C'est ce slot qui décide de la couleur — il n'y a pas d'autre porte d'entrée |
| `forme` | oui | `point`, `cercle`, `filet`. La forme porte la gravité, la couleur ne fait que la confirmer |
| `libelle` | oui | Le mot d'état, écrit en toutes lettres. **Jamais une icône seule** |
| `date` | oui | La date dérivée du bail, en `--font-chasse`. Jamais un compte à rebours animé |
| `reste` | non | « J‑84 », ou « Made in 6 jours », ou la mention de la remontée unique |

---

### PanneauBlocage

**Rôle** : dire qu'il reste des **décisions** à prendre sur des échéances bloquantes, et
prendre la place de l'action principale tant qu'il en reste. C'est la forme que prend la
property `garde-fou` (US-8) : un rappel ouvre quand on a déjà oublié, donc le rappel est
trop tard ; ce panneau, lui, s'affiche **avant** qu'on puisse clore la journée, et il ne
peut pas être ignoré parce qu'il occupe la place du bouton.

**Variantes** :

| Variante | Apparence | Usage |
|---|---|---|
| `a_decider` | `--color-alerte-950`, filet terre cuite 2 px en haut, liste de lignes de 44 pt | Une ou plusieurs échéances bloquantes dont la **décision** n'est pas prise. C'est le seul composant du produit qui utilise la teinte d'alerte comme fond de zone |
| `marge_a_voir` | `--color-surface-sunken`, filet `--color-filet`, aucune teinte | Échéances de marge dans la fenêtre d'affichage. **N'occupe pas la barre d'action** : une marge n'est pas une décision, c'est une information |
| `absent` | Rien | Aucune échéance bloquante à décider. Le panneau ne laisse pas de place vide |

**Tailles** : hauteur variable, **72 pt par ligne**, `--space-md` de padding horizontal,
apparaît au-dessus de la barre d'action et pousse le contenu vers le haut.

**États** — rendus par l'union `EtatBlocage`, sauf `hover`, `active`, `focus`, `disabled` :

| État | Déclencheur | Apparence |
|---|---|---|
| `a_decider` | ≥ 1 échéance bloquante non décidée | « **2 décisions bloquent la clôture de la journée.** » puis les lignes `Opposition à reconduction tacite · Courges, 3e · échéance le 31/12/2028 · décision attendue avant le 12` |
| `marge_a_voir` | ≥ 1 échéance de marge visible, aucune bloquante | « **1 échéance longue approche.** Le DPE de la rue Dumenge expire le 04/03/2032. Rien à décider aujourd'hui. » |
| `absent` | Aucune | **Rien.** Pas de bandeau « tout est à jour » : ce serait un cinquième état, et le bandeau de synchronisation tient déjà le rôle de dire que rien n'attend |

**Slots** :

| Slot | Requis | Contenu |
|---|---|---|
| `titre` | oui | La phrase qui dit **pourquoi** c'est là, jamais un nombre seul |
| `lignes` | oui | Une ligne par échéance : intitulé, bien, date, ce qui est attendu et **quand** |
| `famille` | oui | `bloquante` ou `marge`. Une ligne `marge` ne peut pas rendre l'état `a_decider` |
| `action` | non | Le lien `Traiter ces 2 décisions`, qui mène à la ligne concernée du dossier-bail |

---

### LigneDossier

**Rôle** : rendre un bail en une ligne de 56 pt, lisible d'un coup dans une liste de
14, avec son drapeau d'échéance et son état de synchronisation s'il en a un.

**Variantes** :

| Variante | Apparence | Usage |
|---|---|---|
| `normal` | `--color-surface`, filet 1 px, aucun fond propre | Le dossier courant |
| `a_decider` | Même ligne + un `DrapeauÉchéance` en variante `bloquante_manquee` | Le dossier porte une échéance bloquante non décidée |
| `selectionnee` | Filet gauche 3 px `--color-primaire-600`, fond inchangé | À la navigation clavier et en `--bp-tablet` |
| `lecture_seule` | Tout le texte en `--color-texte-desactive` | Dossier verrouillé |

**Tailles** : hauteur **56 pt** au repos, **60 pt** pressée, **72 pt** quand elle porte un
`DrapeauÉchéance` sur sa propre ligne.

**États** — rendus par l'union `EtatLigne` :

| État | Déclencheur | Apparence |
|---|---|---|
| `repos` | Aucune interaction | `Bien · 3e` en `--text-body-fort`, `terme 31/03/2029` en `--text-caption` en chasse fixe, montant du loyer en `--text-body-fort` à droite, drapeau à droite |
| `presse` | Doigt posé | Fond `--color-teinte-survol`, 120 ms, le texte ne change pas de couleur |
| `survol` | Souris (`--bp-tablet` et au-delà) | Idem `presse` |
| `focus` | Navigation clavier | Anneau `--color-bordure-focus` 2 px, inset 2 px |
| `vide` | Aucun dossier à afficher | **Rendu par `Vide`, pas par cette ligne.** Une ligne vide n'est pas un dossier |

**Slots** :

| Slot | Requis | Contenu |
|---|---|---|
| `intitule` | oui | « Courges, 3e » — bien et numéro, en 3 mots maximum |
| `terme` | oui | « terme 31/03/2029 », en chasse fixe, en `--text-caption`. C'est la date dont tout le reste dérive (B12) |
| `montant` | oui | Le loyer en cours, en chasse fixe, aligné à droite. **Jamais de total calculé** (B16) : c'est le montant saisi |
| `drapeau` | non | Un `DrapeauÉchéance`, ou rien |
| `etat_ecriture` | non | Un mot d'état de § 2.0.2, si le dossier porte une écriture non confirmée |

---

### LigneFait

**Rôle** : rendre un fait daté, et **rendre visible de quel type il est** — constaté ou
apprécié — sans que le propriétaire ait à s'en souvenir (B7, B8, E6, E7).

**Variantes** :

| Variante | Apparence | Usage |
|---|---|---|
| `constate` | Texte en `--color-texte-principal`, filet gauche 3 px `--color-filet`, date en chasse fixe | Ce que le propriétaire a observé. **Seul type exportable** |
| `apprecie` | Bloc en retrait de `--space-lg`, fond `--color-surface-sunken`, texte en `--color-texte-secondaire`, **préfixe écrit** `Mon appréciation :` | Son opinion de travail. **Le préfixe est du texte, pas une couleur** : il survit à une capture d'écran, à un export imprimé, à une lecture au téléphone |
| `avec_photos` | Les deux, plus la rangée de `VignettePhoto` sous la date | Un fait qui porte des pièces jointes |
| `non_confirme` | Les deux, plus la ligne d'état en `--color-primaire-600` : « **Pas encore envoyé** — sur cet appareil, pas encore confirmé par le serveur » | Écriture locale non confirmée (B4) |

**Tailles** : hauteur **56 pt** sans photo, **96 pt** avec la rangée de vignettes.

**États** — rendus par l'union `EtatFait` :

| État | Déclencheur | Apparence |
|---|---|---|
| `repos` | Aucune interaction | Date et texte, comme la variante |
| `presse` | Doigt posé | Fond `--color-teinte-survol` |
| `focus` | Navigation clavier | Anneau `--color-bordure-focus` |
| `non_confirme` | Écriture locale non confirmée | Le mot d'état **écrit**, en ambre, sous le texte. Pas d'icône seule |
| `modifie` | Le propriétaire corrige une écriture non confirmée (B4) | Un champ `En train de corriger` en `--text-caption` — une correction d'écriture non partie est elle-même une écriture |

**Slots** :

| Slot | Requis | Contenu |
|---|---|---|
| `date` | oui | « 12 septembre · 18 h 04 », en chasse fixe. La date est **saisie**, l'heure est **celle de l'appareil** |
| `classe` | oui | `constate` ou `apprecie`. **Pas de valeur par défaut** : c'est la propriété du schéma, pas une discipline (B7) |
| `texte` | oui | Le texte libre. En `apprecie`, il est précédé de `Mon appréciation :` |
| `photos` | non | La rangée de `VignettePhoto`, et le nombre : « 3 photos, 1 pas encore envoyée » |
| `etat_ecriture` | non | Un mot d'état de § 2.0.2, ou rien |

---

### LigneDemande

**Rôle** : rendre une demande en attente avec **qui doit agir** en premier, parce que sans
cette information la moitié de la liste est une liste de lignes qu'on ne peut pas traiter
(B14, US-7).

**Variantes** :

| Variante | Apparence | Usage |
|---|---|---|
| `moi` | **Pastille pleine** `--color-primaire-600` à gauche avec le libellé `À moi`, en `--color-texte-inverse` | C'est le propriétaire qui doit agir. C'est le cas urgent |
| `locataire` | Pastille à contour `--color-bordure-champ`, libellé `Au locataire`, en `--color-texte-secondaire` | C'est le locataire qui doit agir. **C'est le cas le plus fréquent, et il n'est pas urgent** — l'horloge est celle de l'autre |
| `deux_fois_le_meme_jour` | Identique à `moi` / `locataire`, avec **deux horodatages** sur la ligne | E8 : deux demandes de la même personne le même jour **restent deux lignes**. Rien n'est dédupliqué, donc rien ne se dédouble non |

**Tailles** : hauteur **72 pt** — la ligne la plus haute du produit, parce que c'est la
seule qui porte deux lines d'information (intitulé + horloge) et une pastille.

**États** — rendus par l'union `EtatDemande` :

| État | Déclencheur | Apparence |
|---|---|---|
| `a_moi` | `qui_doit_agir = proprietaire` | Pastille pleine ambre, l'intitulé en `--text-body-fort` |
| `au_locataire` | `qui_doit_agir = locataire` | Pastille à contour, l'intitulé en `--text-body` |
| `repus_plusieurs_fois` | La même demande a été reçue plusieurs fois, sans déduplication (E8) | La ligne affiche les horodatages côte à côte : « reçue à 9 h 12 · 18 h 41 ». Aucune mention « doublon » |
| `traitee` | La demande est close | Ligne sortie de la liste, conservée dans l'historique du dossier |

**Slots** :

| Slot | Requis | Contenu |
|---|---|---|
| `qui_doit_agir` | oui | `moi` ou `locataire`. **Obligatoire, en première position, avant l'intitulé** — c'est la donnée qui rend la liste actionnable (B14) |
| `intitule` | oui | « Devis de remplacement de la chasse d'eau », en 6 mots maximum. La ligne est tronquée au deuxième point, pas au mot |
| `horloge` | oui | « reçue le 12 à 9 h 12 » ou « attendue depuis le 12 septembre », en chasse fixe |
| `objet` | oui | Le bien, en 2 mots : « Courges, 3e » |

---

### LigneEncaissement

**Rôle** : dire en une ligne, pour un locataire et un mois, **l'un des trois états de
l'encaissement** — payé, pas encore payé, payé en retard — et rendre l'appel possible.

**Variantes** :

| Variante | Apparence | Usage |
|---|---|---|
| `paye` | Filet gauche 3 px `--color-confirme-800`, mot `Payé` en `--color-texte-secondaire`, la date de réception en chasse fixe | Ce qui est arrivé. **Pas de coche, pas d'aplat vert** |
| `pas_encore_paye` | Aucun filet, mot `Pas encore payé` en `--color-texte-principal`, la date attendue en chasse fixe | L'état par défaut d'un loyer pas encore échu. Ce n'est pas un défaut |
| `en_retard` | Filet gauche 3 px `--color-alerte-800`, mot `Payé en retard` en `--color-alerte-600`, et **le nombre de jours de retard** | Le 6 du mois et après seulement. Avant, cet état **n'existe pas** et ne se calcule pas (roadmap § 2.5) |
| `ecart` | Fond `--color-surface-sunken`, une ligne de plus : « **Écart** — 214 € déclarés sur le compte, aucun reçu saisi. Une ligne à traiter. » | E9. Bailly **ne rapproche rien** : c'est une ligne du dossier, pas une anomalie système. Aucun bouton « Réessayer », aucun « Régler » |

**Tailles** : hauteur **72 pt** (deux lignes : nom + état) ou **88 pt** pour la variante
`ecart` (trois lignes).

**États** — rendus par l'union `EtatEncaissement` :

| État | Déclencheur | Apparence |
|---|---|---|
| `a_venir` | Le mois n'est pas échu | « Pas encore payé · attendu le 5 » — c'est le cas de 27 jours sur 30 |
| `paye` | Un reçu est saisi, daté | « Payé · reçu le 3, 214 € » |
| `paye_en_retard` | Reçu après le 5, à partir du 6 | « Payé en retard · reçu le 11, 6 jours après · 214 € » |
| `impaye` | Le 6 est passé, aucun reçu saisi | « Pas encore payé · 6 jours de retard » |
| `ecart` | Un montant est déclaré mais aucun reçu saisi (E9) | La ligne d'écart, en plus de l'état courant |
| `saisie_partielle` | Le mois est saisi à moitié puis abandonné (E11) | « Saisi à moitié — ce qui manque est saisi ici, ce n'est pas un brouillon » |

**Slots** :

| Slot | Requis | Contenu |
|---|---|---|
| `locataire` | oui | Le nom, 2 mots maximum |
| `objet` | oui | Le bien, 2 mots maximum |
| `montant_du` | oui | La somme due, saisie (B16). Jamais calculée |
| `montant_recu` | non | La somme reçue, saisie. Son absence **est** l'information |
| `etat` | oui | Le mot d'état, écrit : `Payé` · `Pas encore payé` · `Payé en retard` |
| `jours` | non | « 6 jours de retard », en chasse fixe. Absent avant le 6 du mois |

---

### Bouton

**Rôle** : déclencher une action. Rien d'autre.

**Variantes** :

| Variante | Apparence | Usage |
|---|---|---|
| `primaire` | Fond `--color-primaire-600`, libellé en `--color-texte-inverse`, hauteur 52 pt | **Une seule action primaire par écran.** L'action la plus fréquente du produit |
| `secondaire` | Fond transparent, contour 1 px `--color-bordure-champ`, libellé `--color-texte-principal` | L'action secondaire, et l'action impossible qu'on peut quand même expliquer |
| `discret` | Aucun fond, aucun contour, libellé en `--color-primaire-600` | Un lien d'action : `Voir`, `Traiter ces 2 décisions` |
| `confirme` | Fond `--color-confirme-600`, libellé `--color-texte-inverse` | **Le seul autre fond plein du produit**, et il est réservé à deux gestes : l'export produit, et un fait constaté validé. Une confirmation, pas une récompense |
| `impossible` | Contour 1 px `--color-bordure-desactive`, libellé `--color-texte-desactive`, ** accompanied d'une phrase en dessous** | Une action que Bailly refuse de faire hors ligne (B15). La phrase dit pourquoi, et dit ce qui se passera |

> **Il n'y a pas de variante `destructif`.** Ce n'est pas un oubli : B18 interdit le geste
> unique qui effacerait, et aucune des trois décisions RGPD ne peut être prise seule. Un
> bouton rouge qui supprime quelque chose n'a rien à faire dans ce produit, donc il n'existe
> pas dans ce design system — et un design system qui le définirait permettrait à un écran de
> l'utiliser par inadvertance.

**Tailles** :

| Taille | Dimensions | Usage |
|---|---|---|
| `sm` | hauteur 40 pt, padding horizontal `--space-md` | Action secondaire d'une feuille, `Voir` dans un bandeau |
| `md` | hauteur 52 pt, padding horizontal `--space-lg` | **Taille par défaut.** C'est la taille N3, relevée à 52 pt parce que le pouce est plus large que le bout du doigt |
| `lg` | hauteur 60 pt, padding horizontal `--space-xl`, pleine largeur | L'action unique de la barre d'action basse |

**États** — rendus par l'union `EtatAction` :

| État | Déclencheur | Apparence |
|---|---|---|
| `repos` | Aucune interaction | Selon la variante |
| `presse` | Doigt posé | Fond `--color-primaire-800`, aucune translation, aucun rebond. Un bouton qui rebondit est un jouet, et ce n'est pas un jouet |
| `survol` | Souris | Idem `presse`, sur `--bp-tablet` et au-delà |
| `focus` | Navigation clavier | Anneau `--color-bordure-focus` 2 px, inset 2 px — **jamais supprimé** |
| `impossible` | L'action ne peut pas être faite | Non pressable, contour `--color-bordure-desactive`, libellé `--color-texte-desactive`, **et la phrase en dessous qui dit pourquoi** |
| `en_cours` | L'action est déclenchée et attend une réponse | Le libellé est remplacé par `—` et un `ProgressBar` de 2 px passe au-dessus du fond. **Le libellé ne change pas de texte** : écrire « Envoi… » promet un instant, et il n'y en a pas |
| `fait` | L'action a réussi | 1,2 s, le fond passe à `--color-confirme-800` puis revient. **Jamais de coche** : la confirmation d'un bouton est un mot d'état, il va dans le bandeau |

**Slots** :

| Slot | Requis | Content |
|---|---|---|
| `libelle` | oui | Un verbe, une action, 3 mots maximum. « Saisir », « Envoyer la relance », « Traiter les 2 décisions » |
| `icone` | non | À gauche du libellé, 20 pt. Jamais seule, jamais à droite |
| `aide` | non | La phrase en dessous, `--text-caption`, en `--color-texte-tertiaire`. **Obligatoire** pour la variante `impossible`, facultative ailleurs |
| `raccourci` | non | Touche clavier, affichée à droite sur `--bp-tablet` et au-delà |

---

### ChampTexte

**Rôle** : saisir du texte court.

**Variantes** :

| Variante | Apparence | Usage |
|---|---|---|
| `normal` | Fond `--color-surface-sunken`, contour 1 px `--color-bordure-champ`, rayon 10 px | La saisie de texte |
| `lecture` | Même fond, contour 1 px `--color-filet`, texte en `--color-texte-secondaire` | Une valeur dérivée, non modifiable. **Le contour fin dit « pas modifiable », pas la couleur** |
| `classe_obligatoire` | Le champ est suivi d'un `GroupeSegmenté` obligatoire, et l'aide porte la raison | La saisie libre qui demande sa classe (B8) |

**Tailles** : hauteur **52 pt**, largeur pleine, padding horizontal `--space-md`.
En mode texte, hauteur libre avec un minimum à 52 pt.

**États** — rendus par l'union `EtatChamp` :

| État | Déclencheur | Apparence |
|---|---|---|
| `repos` | Aucune interaction | Contour `--color-bordure-champ`, libellé en sur-titre au-dessus |
| `focus` | Champ focalisé | Contour `--color-bordure-focus` 2 px, le libellé passe en `--color-primaire-600` |
| `rempli` | Une valeur existe | Placeholder disparu, valeur en `--color-texte-principal` |
| `erreur` | La valeur est refusée par une règle | Contour 2 px `--color-alerte-600`, message en `--color-alerte-600` **sous** le champ, jamais dans un message bref. Le message dit la correction, pas l'échec |
| `impossible` | Le champ ne peut pas être rempli | Contour `--color-bordure-desactive`, texte désactivé, et la phrase qui dit pourquoi |
| `lecture` | Champ non modifiable | Valeur en `--color-texte-secondaire` sur `--color-surface-sunken`, contour `--color-filet`, aucun clavier |

**Slots** :

| Slot | Requis | Contenu |
|---|---|---|
| `libelle` | oui | Le nom de la donnée, en sur-titre, jamais en placeholder : un placeholder disparaît dès que l'on tape, et le nom doit rester |
| `valeur` | oui | Le texte saisi |
| `aide` | non | Une phrase sous le champ. Pour la saisie libre, elle **porte la raison de la question de classe** |
| `erreur` | non | Le message d'erreur, ou rien |
| `suffixe` | non | Une unité, en `--text-caption` : « € », « j », « € / mois » |

---

### ZoneTexte

**Rôle** : saisir un texte libre de plusieurs lignes. **Le composant qui porte B8.**

**Variantes** :

| Variante | Apparence | Usage |
|---|---|---|
| `avec_classe` | La `ZoneTexte` est **subordonnée** à un `GroupeSegmenté` de classe. Le segment n'a **aucune valeur sélectionnée** au départ, et le bouton d'enregistrement est inactif avec la raison écrite | La saisie d'un fait (E6). **Le défaut ne peut pas être « ce que j'ai lu quelque part »** — donc il n'y a pas de défaut |
| `sans_classe` | Champ de texte ordinaire | Les champs qui ne portent pas de donnée sur une personne : une note de travaux, l'objet d'une demande |

**Tailles** : hauteur libre, **minimum 132 pt** (six lignes), largeur pleine.

**États** — rendus par l'union `EtatZoneTexte` :

| État | Déclencheur | Apparence |
|---|---|
| `repos` | Aucune interaction | Contour `--color-bordure-champ`, compteur de caractères **désactivé** — il n'y a pas de limite |
| `focus` | Champ focalisé | Contour `--color-bordure-focus` 2 px |
| `classe_manquante` | Le groupe de classe n'a pas de valeur et le texte n'est pas vide | Le segment porte un contour 2 px `--color-alerte-800`, le bouton `Enregistrer` est `impossible`, et son aide porte la phrase de § 2.0.4 |
| `classe_choisie` | Une classe est choisie | Le segment sélectionné se remplit, et l'aide du champ **change** pour dire où ça partira : « Ce que tu écris ici part dans l'export du dossier. » ou « Ce que tu écris ici ne sortira jamais d'un export. » |
| `erreur` | La règle du champ refuse la valeur | Contour 2 px `--color-alerte-600`, message sous le champ |

**Slots** :

| Slot | Requis | Contenu |
|---|---|---|
| `libelle` | oui | Le nom de la donnée, en sur-titre |
| `valeur` | oui | Le texte saisi |
| `classe` | oui, dans la variante `avec_classe` | Un `GroupeSegmenté` de deux valeurs, obligatoire, sans défaut |
| `aide` | non | La phrase qui dit où la valeur partira. **Elle change quand la classe change** |
| `erreur` | non | Le message, ou rien |

---

### ChampMontant

**Rôle** : saisir une somme d'argent. C'est un `ChampTexte` contraint, et il ne calcule
rien (B16).

**Variantes** :

| Variante | Apparence | Usage |
|---|---|---|
| `somme_due` | Champ vide, suffixe `€`, clavier numérique | Ce qui est dû. **Aucun montant n'est pré-rempli** : un pré-rempli inventerait une valeur (B17) |
| `somme_recue` | Idem, avec en plus la ligne du dessus qui rappelle la somme due | Ce qui a été reçu |
| `lecture` | Le montant saisi, en chasse fixe, en `--text-body-fort`, jamais modifiable après confirmation | Une somme déjà confirmée |

**Tailles** : hauteur **52 pt**, chiffres en `--font-chasse` de 20 px, alignement à droite,
padding droit `--space-md`.

**États** — rendus par l'union `EtatMontant` :

| État | Déclencheur | Apparence |
|---|---|
| `repos` | Aucune interaction | Placeholder `0,00`, suffixe `€` en `--text-caption` |
| `focus` | Champ focalisé, clavier numérique monté | Contour 2 px `--color-bordure-focus`, le `€` passe en `--color-primaire-600` |
| `rempli` | Une valeur est saisie | Chiffres tabulaires, alignés à droite, tabulation vérifiée par le champ |
| `erreur` | La saisie n'est pas un nombre, ou hors de la plage permise | Contour 2 px `--color-alerte-600`, message sous le champ : « Ce n'est pas un montant. Écris 214 ou 214,50. » |
| `refuse` | La valeur est dans une catégorie que Bailly n'enregistre pas | Le champ est **vide** et l'aide porte la phrase de refus du § 2.0.3 appliquée au cas : « Bailly n'enregistre que le loyer et les provisions. Une régularisation des charges se calcule à la main. » |

**Slots** :

| Slot | Requis | Contenu |
|---|---|---|
| `libelle` | oui | « Loyer », « Provisions sur charges », « Reçu le 3 » |
| `valeur` | oui | Le montant saisi, en chiffres tabulaires |
| `devise` | oui | `€`, en suffixe. **Une seule monnaie** (C10) |
| `aide` | non | La phrase de refus, ou le rappel de la somme due |

---

### ChampDate

**Rôle** : saisir une date. **Presque toujours en lecture seule**, parce que les échéances
sont dérivées (B12) et parce que seule la date source du bail se saisit.

**Variantes** :

| Variante | Apparence | Usage |
|---|---|---|
| `source` | Champ modifiable, calendrier mensuel en feuille | **La seule date que Bailly demande** : terme du bail, date de début, date d'un fait. Toutes les autres sont dérivées |
| `derivee` | Champ en lecture, contour fin `--color-filet`, valeur en chasse fixe, et **une ligne en dessous qui montre le calcul** : « terme 31/03/2029 − 3 mois → 31/12/2028 » | Une échéance. **Afficher le calcul est ce qui rend le garde-fou vérifiable** : si la dérivation est fausse, c'est la date source qui est fausse, et on le voit (R5) |
| `saisie_directe` | Champ modifiable, sans calendrier | Les deux dates de conservation, qui ne dérivent de rien (Q-A) |

**Tailles** : hauteur **52 pt**, valeur en `--font-chasse` alignée à gauche (une date ne
s'aligne pas à droite : on la lit de gauche à droite).

**États** — rendus par l'union `EtatDate` :

| État | Déclencheur | Apparence |
|---|---|---|
| `repos` | Aucune interaction | Valeur en chasse fixe |
| `focus` | Champ focalisé | Contour 2 px `--color-bordure-focus` pour la variante `source` ; **aucun focus** pour `derivee`, qui n'est pas saisissable |
| `ouvert` | Calendrier ouvert | Feuille de 320 pt de haut, grille de 7 colonnes, le jour est sélectionnable en 44 pt minimum |
| `erreur` | Une date impossible pour la règle (terme avant début) | Contour 2 px `--color-alerte-600`, message : « Le terme ne peut pas précéder la prise du bail. » |
| `a_confirmer` | La date est saisie mais pas encore envoyée | Le champ porte, sous sa valeur, le mot d'état `Pas encore envoyé`, comme tout le reste |
| `inconnue` | La date n'est pas connue et n'est pas dérivable (Q-A : la durée légale de conservation) | Valeur : `— date de fin à confirmer` en `--color-texte-tertiaire`, et une ligne d'aide : « Tant que cette date n'est pas écrite, Bailly ne peut pas dire quand ce document pourra être effacé. » **Un tiret, pas une date inventée** |

**Slots** :

| Slot | Requis | Contenu |
|---|---|---|
| `libelle` | oui | Le nom de la date, en sur-titre |
| `valeur` | oui | La date, en `JJ/MM/AAAA`, en chasse fixe |
| `derivation` | non, mais **obligatoire** dans la variante `derivee` | La ligne de calcul. C'est ce qui rend B12 vérifiable |
| `aide` | non | La phrase d'état `inconnu` |
| `etat_ecriture` | non | Un mot d'état de § 2.0.2 |

---

### GroupeSegmenté

**Rôle** : choisir **une valeur parmi deux ou trois**, à l'épaule. Il ne sert qu'à ça : un
choix multiple se fait par `CaseACocher`, jamais ici.

**Variantes** :

| Variante | Apparence | Usage |
|---|---|---|
| `classe_de_donnee` | Deux segments, **aucun sélectionné au départ**, chacun avec son titre **et sa conséquence d'export** en dessous | La question de classe du fait (B8). C'est l'emploi le plus important du composant |
| `a_confirmer` | Deux segments, `Saisir` et `Annuler` | La confirmation d'un geste long |
| `choix_simple` | Deux à quatre segments, une valeur sélectionnée | `Mois` de l'encaissement, `Ascendant` / `Descendant` |

**Tailles** : hauteur **64 pt** pour `classe_de_donnee` (deux lignes par segment), **48 pt**
pour les autres. Plein traversant, rayon `--radius-full`, fond `--color-surface-sunken`,
2 px de padding extérieur.

**États** — rendus par l'union `EtatSegment` :

| État | Déclencheur | Apparence |
|---|---|---|
| `non_choisi` | Aucune valeur sélectionnée | Tous les segments en fond `--color-surface-raised`, contour `--color-bordure-champ`, texte `--color-texte-secondaire` |
| `choisi` | Une valeur est sélectionnée | Le segment sélectionné en fond `--color-primaire-600`, texte `--color-texte-inverse`, contour supprimé. **Un segment plein, pas un contour autour du texte** |
| `requis_non_choisi` | Le composant est obligatoire et rien n'est sélectionné | Contour 2 px `--color-alerte-800` sur le groupe, et la phrase de § 2.0.4 sous le champ qui dépend de lui |
| `focus` | Navigation clavier | Anneau `--color-bordure-focus` sur le segment focalisé ; les flèches gauche/droite déplacent la sélection |
| `desactive` | Le choix n'a pas de sens ici | Opacité du groupe à 40 %, aucun segment sélectionnable |

**Slots** :

| Slot | Requis | Contenu |
|---|---|---|
| `intitule` | oui | Le nom du groupe, en sur-titre : « Ce que tu écris » |
| `options` | oui | Deux ou trois segments. Chaque segment porte un **titre** et une **conséquence** |
| `consequence` | oui, dans la variante `classe_de_donnee` | « Part dans l'export du dossier » / « Ne sortira jamais d'un export ». **C'est la réponse à la question, pas la description du champ** |
| `aide` | non | La phrase de § 2.0.4 quand rien n'est choisi |

---

### FeuilleClasse

**Rôle** : demander la classe d'une saisie libre **quand le propriétaire ne l'a pas demandée
à la source** — c'est-à-dire à la modification d'un fait existant dont la classe n'a jamais
été enregistrée. C'est la forme de B8 appliquée à l'existant, et elle existe parce que les
14 baux sont déjà en cours.

**Variantes** :

| Variante | Apparence | Usage |
|---|---|---|
| `demande` | Feuille de 380 pt, deux cartes de 72 pt, le bouton d'enregistrement est `impossible` tant que rien n'est choisi | La demande initiale |
| `rappel` | Feuille de 320 pt, la classe déjà enregistrée est affichée en haut, et le bouton est `Confirmer` | La reprise d'un fait créé avant que la classe existe |

**Tailles** : largeur pleine moins `--space-lg` de chaque côté, rayon `--radius-lg` en haut.

**États** — rendus par l'union `EtatFeuilleClasse` :

| État | Déclencheur | Apparence |
|---|---|---|
| `ouverte_sans_choix` | Ouverture, rien de sélectionné | Les deux cartes, le bouton `Enregistrer` en variante `impossible`, son aide : « Choisis ce que tu écris : ce que tu as observé, ou ce que tu en penses. » |
| `ouverte_avec_choix` | Une carte est sélectionnée | La carte choisie passe en contour 2 px `--color-primaire-600`, et **l'aide du champ change** pour dire où ça partira |
| `fermée_sans_choix` | Fermeture sans choix | Le fait n'est **pas enregistré**. Message bref : « Rien n'a été enregistré. » — **jamais** « Réessayer », jamais un dialogue de confirmation |
| `fermée_avec_choix` | Fermeture avec choix | Le fait est enregistré, et son état d'écriture apparaît : `Pas encore envoyé` |

**Slots** :

| Slot | Requis | Contenu |
|---|---|---|
| `question` | oui | « Ce que tu écris, c'est ce que tu as observé, ou ce que tu en penses ? » — une seule phrase, sansecnologie |
| `options` | oui | Deux cartes : `Ce que j'ai observé` et `Ce que j'en pense` |
| `consequence` | oui, par carte | La ligne qui dit où la valeur partira |
| `aide` | oui | La raison du refus tant qu'aucune carte n'est choisie |

---

### Feuille

**Rôle** : le conteneur modal qui monte du bas. C'est le seul conteneur de dialogue du
produit.

**Variantes** :

| Variante | Apparence | Usage |
|---|---|---|
| `bas` | Depuis le bas, hauteur ≤ 85 % de l'écran, rayon `--radius-lg` en haut, `--shadow-lg` | Une saisie, un choix, un détail court. Le geste par défaut |
| `centree` | Centrée, largeur 92 %, hauteur automatique, `--shadow-xl` | Un dialogue de confirmation, et **le seul dialogue** du produit |
| `haute` | Depuis le bas, hauteur 92 %, un seul emplacement : le calendrier de dates | Le calendrier de `ChampDate` |

**Tailles** : `--space-lg` de padding sur les côtés, `--space-xl` en haut, `--space-2xl` en
bas — le bas est plus généreux parce que c'est là que le pouce va.

**États** — rendus par l'union `EtatFeuille` :

| État | Déclencheur | Apparence |
|---|---|---|
| `fermee` | Aucune feuille ouverte | Rien. Le voile est absent, pas transparent : un voile à 0 % qui capture les événements est un piège |
| `ouverture` | Ouverture | Voile `--color-voile` à 72 % en `--duration-normal`, feuille en translation `Y: 100 % → 0` |
| `ouverte` | Stable | Feuille au repos, poignée de 4 pt × 40 pt en `--color-filet` centrée sous le titre |
| `fermeture` | Glissement vers le bas ou bouton retour | Le contenu **n'est pas effacé** : la feuille se rétracte, et les données saisies sont conservées dans l'écran parent (E11, et le piège « retour arrière qui perd la saisie » de l'archétype) |
| `impossible` | L'action principale dépend du réseau (B15) | Bouton `impossible`, et la phrase de refus sous le bouton. La feuille reste ouverte et consultable |

**Slots** :

| Slot | Requis | Contenu |
|---|---|---|
| `titre` | oui | Le titre de la feuille, en `--text-h4`, 4 mots maximum |
| `aide` | non | Une phrase sous le titre — la conséquence, pas l'explication |
| `contenu` | oui | Le corps, défilement vertical, `--space-lg` de padding |
| `poignee` | oui | La poignée de glissement, 44 pt de zone tactile, 4 pt × 40 pt visible |
| `action` | non | La barre d'action de la feuille, collée en bas, hauteur 88 pt, avec l'action primaire et son aide |

---

### BarreAction

**Rôle** : porter l'action principale du produit, **toujours au même endroit**, et
respecter la contrainte C4 : debout, d'une main, dans un couloir.

**Variantes** :

| Variante | Apparence | Usage |
|---|---|---|
| `principale` | Fond `--color-surface-raised`, filet `--color-bordure-elevee` 1 px en haut, `--shadow-md`, hauteur 88 pt. Un `Bouton lg` pleine largeur `Saisir` | L'écran d'accueil, l'écran de saisie, un dossier |
| `decide` | Même barre, mais le `Bouton lg` est remplacé par `Traiter les 2 décisions`, et `Saisir` passe en `Bouton secondaire` **au-dessus**, toujours dans la zone du pouce | Le panneau de blocage est ouvert. **Le geste d'urgence reste possible** |
| `secondaire` | Deux boutons côte à côte : `Saisir` en primaire, `Voir le dossier` en secondaire | L'encaissement, la ligne d'un dossier |
| `masquee` | Aucun bouton, la barre est réduite à 56 pt et affiche le contexte | Un écran en lecture seule, verrouillé |

**Tailles** : hauteur **88 pt** (+ `--space-3xl` de respiration au-dessus pour le pouce),
pleine largeur, le contenu est à `--space-lg` des bords.

**États** — rendus par l'union `EtatBarreAction` :

| État | Déclencheur | Apparence |
|---|---|---|
| `active` | Écran interactif | Le bouton primaire, toujours le même mot dans le même produit : `Saisir` |
| `avec_decision` | Le panneau de blocage est ouvert | Le bouton dit `Traiter les 2 décisions`, en variante `primaire`. **Le compte est écrit dans le libellé** : un bouton qui change de fonction doit changer de mot |
| `secondaire` | Deux actions disponibles | Deux boutons, le primaire à gauche — **le premier est le plus proche du pouce** |
| `desactivee` | Écran verrouillé ou conditions non réunies | Les boutons en `impossible`, chacun avec sa phrase. La barre **ne disparaît pas** : un bouton qui s'en va déplace l'action hors de la portée |

**Slots** :

| Slot | Requis | Content |
|---|---|---|
| `action_principale` | oui, sauf en `masquee` | Un `Bouton lg`, pleine largeur |
| `action_secondaire` | non | Un `Bouton md`, à gauche de la principale, ou au-dessus |
| `contexte` | oui, en `masquee` | La phrase qui explique pourquoi on ne peut pas écrire |
| `hauteur_respiratoire` | oui | `--space-3xl` de vide au-dessus de la barre, pour que le pouce atteigne le bouton sans viser |

---

### BarreOnglets

**Rôle** : la navigation entre quatre destinations. **Quatre, pas cinq** — la raison est
écrite en § 4.2.

**Variantes** :

| Variante | Apparence | Usage |
|---|---|---|
| `repos` | Fond `--color-background`, filet `--color-filet` 1 px en haut, libellé en `--color-texte-tertiaire` | Onglet non sélectionné |
| `selectionne` | **Aucun fond.** Un filet de 3 px `--color-primaire-600` **en haut** de l'onglet, libellé en `--color-texte-principal`. Pas de pastille, pas d'icône remplie | Onglet sélectionné. Le filet en haut se lit de loin, ce qu'un fond ne fait pas dans le noir |
| `avec_alerte` | Le même filet, plus une **pastille de 2 pt** en `--color-alerte-600` en haut à droite de l'onglet | Un onglet qui porte une décision bloquante. **Une pastille de 2 pt, pas un chiffre** : le compte est dans le panneau de blocage, pas dans la barre |

**Tailles** : hauteur **64 pt**, 4 segments égaux, cible tactile pleine hauteur, icône 22 pt
au-dessus du libellé en `--text-caption`.

**États** — rendus par l'union `EtatOnglet` :

| État | Déclencheur | Apparence |
|---|---|---|
| `inactif` | Onglet courant d'un autre onglet | Filet de 1 px, libellé gris |
| `actif` | Onglet courant | Filet de 3 px ambre en haut, libellé en `texte-principal` |
| `presse` | Doigt posé | `--color-teinte-survol` sur le segment, 120 ms |
| `avec_decision` | L'onglet mène à une liste qui porte une décision bloquante | Le filet de 3 px reste **ambre** et une pastille de 2 pt terre cuite s'ajoute. **L'onglet ne vire pas au rouge** |
| `desactive` | Destination indisponible (hors-ligne, verrouillé) | Libellé en `--color-texte-desactive`, segment non pressable |

**Slots** :

| Slot | Requis | Contenu |
|---|---|---|
| `icone` | oui | 22 pt, trait de 2 pt, jamais pleine |
| `libelle` | oui | Un mot, 10 caractères maximum : `Aujourd'hui` · `Encaissement` · `Dossiers` · `Plus` |
| `marqueur` | non | Le filet de 3 px, ou la pastille de 2 pt |
| `badge` | non | **Uniquement un point de 2 pt, jamais un nombre.** Un nombre dans la barre de navigation est un compteur de rappels, et c'est ce que B13 interdit |

---

### TitreÉcran

**Rôle** : nommer l'écran et donner **le contexte d'un coup d'œil**, en une seule ligne de
mots.

**Variantes** :

| Variante | Apparence | Usage |
|---|---|---|
| `racine` | `--text-h2` en 700, hauteur 44 pt, pas de bouton retour visible — le retour est le geste système | Les quatre onglets de la barre basse |
| `feuille` | `--text-h4` en 600, 44 pt, bouton retour à gauche en 44 pt | Une feuille, un sous-écran |
| `avec_contexte` | Le titre **et** une seconde ligne en `--text-caption` qui dit l'état du lieu : « mars · 14 baux · 1 écart » | Les écrans qui portent un ensemble : dossiers, encaissement, demandes |

**Tailles** : hauteur **44 pt** sans contexte, **64 pt** avec. Le titre ne se coupe jamais :
il est choisi pour tenir en une ligne à ×1,3.

**États** — rendus par l'union `EtatTitre` :

| État | Déclencheur | Apparence |
|---|---|---|
| `repos` | Aucune interaction | Titre seul |
| `avec_contexte` | Un ensemble est affiché | Titre + ligne de contexte en `--text-caption`, en chasse fixe pour les chiffres |
| `defilement` | Le contenu défile sous le titre | Le titre reste fixe et gagne un filet `--color-filet` **et** un fond `--color-surface-raised` opaque. Jamais transparent : un titre transparent sur une liste de chiffres est illisible |
| `hors_ligne` | Pas de réseau | Le titre ne change pas. **Seul le bandeau change** — un titre qui annonce le réseau ment sur ce qu'il affiche |

**Slots** :

| Slot | Requis | Contenu |
|---|---|---|
| `titre` | oui | 2 à 4 mots |
| `retour` | non, obligatoire si la feuille n'est pas un onglet | Un bouton 44 pt, icône `‹` |
| `contexte` | non | La seconde ligne : période, volume, état de l'ensemble |
| `etat_ecriture` | non | Un mot d'état de § 2.0.2, quand l'écran porte une écriture en cours |

---

### Pastille

**Rôle** : porter une **catégorie** de texte, pas un état. La distinction est stricte : un
état est une phrase (§ 2.0), une pastille est un mot de classe.

**Variantes** :

| Variante | Apparence | Usage |
|---|---|---|
| `neutre` | Fond `--color-surface-raised`, contour 1 px `--color-bordure-champ`, texte `--color-texte-secondaire` | Une catégorie : `Devis`, `Rendez-vous`, `Courrier` |
| `accent` | Fond `--color-primaire-600`, texte `--color-texte-inverse` | `À moi` sur une demande, et rien d'autre |
| `confirme` | Fond `--color-confirme-600`, texte `--color-texte-inverse` | L'export produit, un fait constaté validé |
| `discrete` | Aucun fond, contour 1 px `--color-bordure-champ`, texte `--color-texte-tertiaire` | `Marge`, `Hors-ligne` — des mentions, pas des catégories |

**Tailles** : hauteur **24 pt**, padding horizontal `--space-sm`, rayon `--radius-full`,
`--text-overline` avec interlettrage +0.04em.

**États** — rendus par l'union `EtatPastille`, sauf `hover`, `active`, `focus`, `disabled` (une pastille n'est pas une cible ; **un état ne doit jamais être une pastille**, c'est la seule façon de garantir qu'un état est toujours une phrase) :

| État | Déclencheur | Apparence |
|---|---|---|
| `neutre` | Catégorie neutre | Comme la variante |
| `accent` | La catégorie est « à moi » | Comme la variante |
| `confirme` | La catégorie est confirmée | Comme la variante |
| `discrete` | La catégorie est une mention | Comme la variante |

**Slots** :

| Slot | Requis | Contenu |
|---|---|---|
| `texte` | oui | Un mot, 12 caractères maximum |
| `icone` | non | 14 pt, à gauche. **Jamais seule** |

---

### Montant

**Rôle** : afficher une somme d'argent de façon que deux montants voisins se comparent d'un
coup d'œil. C'est le composant typographique le plus utilisé après le texte.

**Variantes** :

| Variante | Apparence | Usage |
|---|---|---|
| `principal` | `--text-body-fort` 600 en `--font-chasse`, chiffres tabulaires, aligné à droite | Un loyer, une somme due |
| `secondaire` | `--text-body` en `--font-chasse`, en `--color-texte-secondaire` | Un montant secondaire, une somme reçue |
| `a_confirmer` | Comme `principal`, plus la ligne d'état ambre sous le montant | Une somme saisie et pas encore envoyée |
| `manquant` | `—` en `--color-texte-tertiaire`, et l'absence expliquée à côté | Aucune somme saisie. **Un tiret n'est pas un zéro** : 0,00 € est une affirmation, l'absence en est une |

**Tailles** : hauteur 24 pt (`principal`) ou 20 pt (`secondaire`), largeur minimale
72 pt pour que les colonnes s'alignent.

**États** — rendus par l'union `EtatMontantAffiche`, sauf `hover`, `active`, `focus`, `disabled` (un montant affiché n'est pas une cible ; son état d'écriture ne se montre que par le mot d'état) :

| État | Déclencheur | Apparence |
|---|---|---|
| `saisi` | Une somme existe | Chiffres tabulaires alignés à droite, devise en `--text-caption` |
| `non_saisi` | Aucune somme | `—` et la mention « pas saisi » en `--text-texte-tertiaire` |
| `a_confirmer` | Saisie locale non envoyée | Le montant, puis la ligne `Pas encore envoyé` en ambre |
| `refuse` | La valeur est hors périmètre | Le champ refuse la saisie ; le composant affiche l'aide de refus |

**Slots** :

| Slot | Requis | Contenu |
|---|---|---|
| `valeur` | oui | Le nombre, en chiffres tabulaires. **Jamais calculé** (B16) |
| `devise` | oui | `€`, toujours affichée, jamais en suffixe ambigu |
| `etat` | non | Un mot d'état de § 2.0.2, ou rien |

---

### Horodatage

**Rôle** : dire **quand**, en chasse fixe, et dire aussi **de quoi** — parce qu'un horodatage
sans source est une demi-vérité dans un produit qui promet de ne pas mentir.

**Variantes** :

| Variante | Apparence | Usage |
|---|---|---|
| `relatif` | « il y a 3 jours », en `--text-caption` en chasse fixe | Un fait, une demande. **Avec sa date absolue au second appui** — un relatif seul devient faux au bout d'un mois |
| `absolu` | « 12/09 · 18 h 04 », en chasse fixe | Un fait daté, une réception de paiement |
| `source` | « confirmé par le serveur · 12/09 · 18 h 04 » | L'horodatage d'une synchronisation. **La source fait partie de la ligne** : c'est la différence entre « écrit à 18 h 04 » et « confirmé à 18 h 04 » |
| `retard` | « 6 jours de retard » en `--color-alerte-600` | Un impayé au 6 du mois |

**Tailles** : hauteur **20 pt**, `--text-caption`, jamais en dessous de 14 px.

**États** — rendus par l'union `EtatHorodatage` :

| État | Déclencheur | Apparence |
|---|---|---|
| `connu` | La date et sa source sont connues | La ligne complète, source incluse |
| `relatif_seul` | Le relatif est disponible, l'absolu aussi mais masqué | Relatif au repos, absolu au second appui |
| `a_confirmer` | L'écriture n'est pas partie | « saisi sur cet appareil · 12/09 · 18 h 04 » — **jamais** « synchronisé », jamais un relatif qui laisserait croire que c'est parti |
| `inconnu` | La date n'existe pas | `—`, et la phrase qui dit pourquoi |

**Slots** :

| Slot | Requis | Contenu |
|---|---|---|
| `valeur` | oui | La date, en chasse fixe |
| `source` | oui, dans la variante `source` et dans l'état `a_confirmer` | `sur cet appareil` ou `confirmé par le serveur` |
| `relatif` | non | La forme relative, en second appui |

---

### LigneDonnée

**Rôle** : rendre une paire **intitulé → valeur** dans une fiche, sans carte et sans
tableau. C'est la ligne de base de toutes les fiches de dossier.

**Variantes** :

| Variante | Apparence | Usage |
|---|---|---|
| `normale` | Intitulé en `--color-texte-secondary` à 40 % de la largeur, valeur en `--text-body` à droite, filet `--color-filet` | Une donnée de fiche : « Loyer · 214 € » |
| `derivee` | Même chose, plus une troisième ligne en `--text-caption` qui montre la dérivation | Une échéance : « Opposition à reconduction tacite · 31/12/2028 · terme 31/03/2029 − 3 mois » |
| `lecture` | Valeur en `--color-texte-secondaire`, aucune action | Une donnée qui ne se modifie pas ici |
| `a_decider` | Un `Bouton secondaire` à droite au lieu de la valeur | Une échéance bloquante dont la décision est attendue : la ligne **se termine par un geste**, pas par une date |

**Tailles** : hauteur **44 pt**, ou **64 pt** pour `derivee` (trois lignes), ou **52 pt**
pour `a_decider` (bouton de 40 pt à droite).

**États** — rendus par l'union `EtatLigneDonnee` :

| État | Déclencheur | Apparence |
|---|---|---|
| `repos` | Aucune interaction | Intitulé et valeur |
| `presse` | Ligne touchable | `--color-teinte-survol` |
| `focus` | Navigation clavier | Anneau `--color-bordure-focus` |
| `a_decider` | Une décision est attendue sur cette ligne | Le bouton `Décider` apparaît, en variante `secondaire`, et **le mot `Traiter` ne suffit pas** : c'est `Décider` |

**Slots** :

| Slot | Requis | Contenu |
|---|---|---|
| `intitule` | oui | Le nom de la donnée, 4 mots maximum |
| `valeur` | oui | La valeur, en chasse fixe si c'est une date ou un montant |
| `derivation` | non | La ligne de calcul d'une valeur dérivée (B12) |
| `action` | non | Un `Bouton` de 40 pt, à droite |

---

### ListePlate

**Rôle** : contenir des lignes. **C'est un conteneur, pas une carte** : aucun fond propre,
aucun contour, aucun rayon. C'est ce que la règle « pas de carte pour tout » rend possible.

**Variantes** :

| Variante | Apparence | Usage |
|---|---|---|
| `liste` | Filet `--color-filet` 1 px entre les lignes, `--space-xs` de padding vertical | Une liste de lignes de 56 ou 72 pt |
| `liste_alternee` | Une ligne sur deux sur `--color-surface-sunken` | Une liste dense de plus de 8 lignes, où le suivi de l'œil otherwise se perd |
| `groupee` | Un sur-titre `--text-overline` collé au filet, `--space-2xl` au-dessus | L'encaissement groupé par état, les demandes groupées par `qui doit agir` |
| `defilante` | Idem `liste`, défilement vertical avec 16 pt d'air sous la dernière ligne | Une liste dans une feuille |

**Tailles** : largeur pleine, lignes de 56 / 72 / 88 / 96 pt selon le composant de ligne.
**Toujours** 16 pt de respiration sous la dernière ligne : le pouce ne vise pas le dernier
élément d'une liste collée à la barre d'action.

**États** — rendus par l'union `EtatListe`, sauf `hover`, `active`, `focus`, `disabled` :

| État | Déclencheur | Apparence |
|---|---|---|
| `en_chargement` | Les lignes locales existent et sont lues | 6 lignes en ossature de la **hauteur exacte** de la ligne réelle. Une ossature d'une autre hauteur fait sauter la liste au remplissage |
| `remplie` | Des lignes existent | Les lignes |
| `vide` | La liste est vide pour une **raison connue** | Rendu par `Vide`, avec le libellé écrit |
| `en_erreur` | La lecture a échoué et rien n'est connu | Rendu par `Vide` en variante `erreur`. **Un vide et une erreur n'ont pas le même rendu, jamais** |
| `hors_ligne` | Lecture locale disponible, serveur injoignable | Les lignes locales, plus une ligne de contexte en tête : « Affiché depuis cet appareil · dernière synchronisation 12/09 · 18 h 04 » |

**Slots** :

| Slot | Requis | Contenu |
|---|---|---|
| `sur_titre` | non | Le nom du groupe, en `--text-overline`, collé au filet |
| `lignes` | oui | Les composants de ligne, ou un `Vide`, ou des ossatures de ligne |
| `contexte` | non | La ligne « affiché depuis cet appareil » en mode hors-ligne |
| `respiration` | oui | 16 pt sous la dernière ligne, constants |

---

### BandeauAlerte

**Rôle** : dire une **conséquence** qui tient en une phrase, sans interrompre. Ce n'est ni
une erreur, ni une confirmation : c'est une information qui change ce qu'on peut faire
(C9, E12, B15).

**Variantes** :

| Variante | Apparence | Usage |
|---|---|---|
| `information` | Fond `--color-surface-sunken`, filet gauche 3 px `--color-filet`, icône `i` en cercle | « Une relance a besoin du réseau pour produire sa preuve d'envoi. Elle partira demain matin. » |
| `a_venir` | Fond `--color-info-950`, filet gauche 3 px `--color-info-600`, icône `◷` | « Le 6 de ce mois, « en retard » apparaîtra sur les loyers non payés. » |
| `impossible` | Fond `--color-alerte-950`, filet gauche 3 px `--color-alerte-600`, icône `!` | « Pas de place sur cet appareil : 0 Mo libres. La photo n'a pas pu être écrite. » |
| `a_confirmer` | Fond `--color-confirme-950`, filet gauche 3 px `--color-confirme-800`, icône `✓` | « Export produit le 30/09 à 19 h 12. Lisible sans Bailly. » — **le seul endroit du produit où un `✓` est admis**, parce qu'il accompagne un mot et une date |

**Tailles** : hauteur **variable**, 44 pt minimum, padding `--space-md`, largeur pleine
moins `--space-lg` de chaque côté.

**États** — rendus par l'union `EtatAlerte`, sauf `hover`, `active`, `focus`, `disabled` :

| État | Déclencheur | Apparence |
|---|---|---|
| `visible` | La condition est vraie | La variante, avec son icône et sa phrase |
| `actionnable` | La condition est vraie et il y a quelque chose à faire | Un `Bouton discret` à droite : `Voir`, `Libérer de l'espace` |
| `resolu` | La condition n'est plus vraie | **L'alerte disparaît.** Elle ne se grise pas et ne reste pas avec une croix : une alerte résolue qui occupe la place d'une alerte active est une alerte de plus |
| `persistant` | La condition est vraie et ne se résoudra pas d'elle-même | Elle reste, et **son texte le dit** : « Tant que la date de fin n'est pas écrite, cette ligne reste conservée. » |

**Slots** :

| Slot | Requis | Contenu |
|---|---|---|
| `icone` | oui | Un glyphe circulaire, 20 pt, dans une pastille — la couleur seule ne porte rien |
| `phrase` | oui | La conséquence, une à deux phrases, en langage de téléphone |
| `action` | non | Un `Bouton discret` |
| `duree` | non | « jusqu'à demain matin », « tant que… » — la condition de fin, quand elle existe |

---

### MessageBref

**Rôle** : confirmer un geste, ou refuser un geste, **en une phrase**, pendant 4 secondes.
Ce n'est pas une notification et ce n'est pas un dialogue.

**Variantes** :

| Variante | Apparence | Usage |
|---|---|---|
| `fait` | Fond `--color-surface-raised`, contour 1 px `--color-confirme-800`, icône `✓` | « Saisi sur cet appareil. Pas encore confirmé — tu le sauras quand le bandeau le dira. » |
| `refus` | Fond `--color-alerte-950`, contour 1 px `--color-alerte-600`, icône `!` | « Rien n'a été enregistré. » |
| `info` | Fond `--color-surface-raised`, contour 1 px `--color-bordure-elevee`, icône `i` | « Le dossier a été créé. Ses cinq échéances en sont tirées. » |

> **Un `MessageBref` ne contient jamais un mot d'état de synchronisation sans le bandeau.**
> S'il dit « enregistré », il ment. S'il dit « pas encore confirmé », il doit le dire dans
> la même phrase que l'action : « Saisi sur cet appareil. Pas encore confirmé. »

**Tailles** : hauteur **variable**, 44 pt minimum, largeur **92 %** de l'écran, centré,
**au-dessus** de la barre d'action et **sous** le panneau de blocage. Il ne couvre jamais
le bandeau, qui est permanent.

**États** — rendus par l'union `EtatMessageBref` :

| État | Déclencheur | Apparence |
|---|---|---|
| `apparu` | Un geste a réussi ou a été refusé | Entrée par le bas, `--duration-normal`, `--ease-out` |
| `visible` | Stable | 4 s, puis disparition en `--duration-normal` |
| `file` | Deux messages en moins de 4 s | **Un seul à la fois.** Le second remplace le premier, et le replacement est instantané — un empilement de messages est une file de Things à ne pas faire |
| `chasse` | Un message monoclonal | Il ne se ferme pas au doigt. Il ne porte pas d'action : une action dans un message qui disparaît est une action ratée |

**Slots** :

| Slot | Requis | Contenu |
|---|---|---|
| `icone` | oui | 20 pt, dans une pastille |
| `phrase` | oui | La confirmation ou le refus, une phrase, en langage de téléphone |
| `etat` | non | Le mot d'état de § 2.0.2, **dans la même phrase** que l'action, jamais dans un second paragraphe |

---

### Vide

**Rôle** : rendre un état vide **avec son libellé écrit**, et distinguer trois vides qui ne
se ressemblent pas.

**Variantes** :

| Variante | Apparence | Usage |
|---|---|---|
| `jamais_visite` | `--text-body` en 600, une phrase d'explication, un `Bouton primaire` | Un module jamais utilisé. Le vide a une **issue** |
| `aucune_donnee` | `--text-body`, une phrase qui dit **pourquoi** c'est vide, un `Bouton secondaire` | Un module ouvert et vide. Le vide est un résultat, pas une absence d'écran |
| `erreur` | `--text-body` + un `BandeauAlerte` au-dessus en variante `impossible`, **et aucune action de reprise** si la reprise est automatique | La lecture a échoué. **Un vide et une erreur ne se ressemblent pas** — confondre les deux revient à transformer une panne réseau en affirmation commerciale (E9, et la pathologie « une absence présentée comme un zéro ») |

**Tailles** : hauteur **auto**, bloc de 200 pt de haut, texte centré horizontalement mais
**aligné à gauche** dans un bloc de 280 pt — un vide centré sur toute la largeur est un
vide générique.

**États** — rendus par l'union `EtatVide`, sauf `hover`, `active`, `focus`, `disabled` :

| État | Déclencheur | Apparence |
|---|---|---|
| `jamais_visite` | Aucune donnée et aucun module créé | « Aucun bail saisi. Le bail est le seul endroit où les dates entrent — les cinq échéances en sont tirées. » + `Créer un bail` |
| `aucune_donnee` | Le module existe, il est vide | « Aucun fait pour ce dossier. Le premier que tu écris ici peut être daté d'aujourd'hui. » + `Saisir un fait` |
| `erreur` | La lecture a échoué | « Impossible de lire depuis le serveur. Rien n'est affiché — et ce n'est pas vide : on ne sait pas encore. » **Aucun bouton « Réessayer »** : la reprise est automatique, et un bouton dirait qu'elle ne l'est pas. Le seul geste proposé est `Saisir une fois le réseau revenu` — donc un geste qui ne ment pas |
| `hors_ligne` | Hors-ligne, avec des écritures locales | « Hors-ligne. Ce qui est déjà sur cet appareil est affiché ; le reste n'est pas connu. » |

**Slots** :

| Slot | Requis | Contenu |
|---|---|---|
| `titre` | oui | Le **libellé écrit** de l'état, en 4 mots maximum. Jamais « Aucun résultat », jamais « 0 » |
| `explication` | oui | La raison, une phrase, qui dit pourquoi c'est vide et non pas ce qu'il faut faire |
| `action` | non | Un `Bouton`. **Interdit** dans la variante `erreur` |
| `illustration` | **non, et jamais** | Ce composant n'a pas de slot d'illustration. Une illustration dans un vide est un remplissage décoratif, et il n'y a rien à garnir de décor |

---

### VignettePhoto

**Rôle** : montrer une photo jointe à un fait, et dire où elle en est. C'est le seul
composant du produit qui porte une image, et il est **local d'abord** (B3).

**Variantes** :

| Variante | Apparence | Usage |
|---|---|---|
| `sur_appareil` | Vignette 72 × 72 pt, rayon `--radius-sm`, contour 1 px `--color-primaire-600`, étiquette sous la vignette : `Sur cet appareil` | B3 : la photo est **sur l'appareil avant toute tentative réseau**. Le contour ambre est le signe |
| `envoyee` | Vignette 72 × 72 pt, contour 1 px `--color-confirm-800`, étiquette : `Confirmée le 12 · 18 h 04` | Le serveur l'a confirmée, avec la date |
| `a_confirmer` | Contour 2 px `--color-primaire-600`, étiquette `Pas encore envoyée` | L'envoi est en attente. **C'est l'état par défaut d'une photo juste prise** — et il est affiché aussi longtemps qu'il dure |
| `illisible` | Vignette 72 × 72 pt sur `--color-surface-sunken`, icône `▨`, étiquette `Illisible sur cet appareil` | Le fichier existe, il ne s'affiche pas. Un fichier non lisible reste un fichier : il est compté et il est envoyé |

**Tailles** : vignette **72 × 72 pt**, rangée de 3 avec `--space-sm` d'écart, étiquette en
`--text-caption` sur **une seule ligne**, tronquée.

**États** — rendus par l'union `EtatPhoto` :

| État | Déclencheur | Apparence |
|---|---|---|
| `a_confirmer` | Fichier écrit localement, envoi non confirmé | Contour 2 px ambre, `Pas encore envoyée` |
| `envoyee` | Le serveur a confirmé le fichier | Contour 1 px vert-gris, `Confirmée le 12 · 18 h 04` |
| `illisible` | Le fichier ne s'affiche pas | Le fichier reste compté et envoyé — il n'est pas perdu, il n'est pas lisible ici |
| `erreur_ecriture` | L'écriture du fichier a échoué (E12, stockage plein) | **Aucune vignette** : le slot est vide et le slot `etat` porte la phrase d'impossibilité. On ne montre pas un emplacement vide qui ressemble à une photo |

**Slots** :

| Slot | Requis | Contenu |
|---|---|---|
| `image` | oui | La vignette, 72 × 72 pt. **Jamais une icône d'image générique** : si le fichier ne s'affiche pas, on affiche `illisible`, pas un cadre vide |
| `etat` | oui | Le mot d'état, écrit, en toutes lettres |
| `horodatage` | oui | La date et l'heure **de prise** (celle de l'appareil) et, si elle est partie, celle de confirmation. Les deux, distingués |
| `taille` | non | « 2,4 Mo », en `--text-caption` |

---

### Signature

**Rôle** : recueillir un trait manuscrit et l'afficher **sans jamais le présenter comme
valide** tant que le serveur ne l'a pas confirmé (B5).

> **Ce composant n'est branché sur aucun écran du MVP**, et c'est un fait, pas un oubli :
> aucune des huit slices de la roadmap ne réclame la signature — `piece-jointe` porte la
> photo, `saisie` porte le fait. Le composant est spécifié ici parce que **B5 doit avoir une
> manifestation visuelle** et que le vocabulaire de § 2.0.2 existe pour lui. Le jour où
> une slice le réclame, il est déjà écrit ; le jour où aucune ne le réclame, il ne coûte
> rien.

**Variantes** :

| Variante | Apparence | Usage |
|---|---|---|
| `a_tracer` | Zone de tracé `--color-surface-sunken` sur `--color-primaire-600` de 2 px, hauteur 200 pt, un `Bouton primaire` `Signer` | Le geste, debout, d'une main |
| `tracee_non_confirmee` | Le trait en `--color-texte-principal`, et **sous** la zone, le mot d'état de § 2.0.2 en ambre : « **Signé ici, pas encore envoyé** — l'acte est fait sur cet appareil, le serveur ne l'a pas confirmé, donc la signature n'est pas valide » | **L'état principal de ce composant.** La signature existe, et elle n'est pas une signature |
| `tracee_confirmee` | Le trait, et l'état : « **Synchronisé** — le serveur a confirmé le 12 à 18 h 04 » | Le seul état où l'acte vaut, et il n'est atteignable qu'après confirmation serveur |
| `lecture_seule` | Le trait en `--color-texte-secondaire`, et l'état historique | Un état des lieux déjà confirmé, consulté six mois plus tard |

**Tailles** : zone de tracé **200 pt** de haut, largeur pleine, bouton `Signer` pleine
largeur en `lg`.

**États** — rendus par l'union `EtatSignature` :

| État | Déclencheur | Apparence |
|---|---|---|
| `a_tracer` | Aucune trace | Zone vide, et **une phrase d'aide** : « Signe ici, même sans réseau. Le serveur le confirmera plus tard. » — la phrase promet la continuité, pas la validité |
| `tracee_non_confirmee` | Trait posé, serveur pas prévenu | Le trait, puis le mot d'état en ambre et sa phrase complète. **Le bouton `Signer` disparaît** : on ne signe pas deux fois |
| `tracee_confirmee` | Serveur a confirmé | Le trait, puis l'état `Synchronisé` et l'horodatage du serveur, enHorodatage variante `source` |
| `lecture_seule` | Signature déjà confirmée, en consultation | Le trait en secondaire, l'état historique. **Aucun bouton** |
| `efface` | Le propriétaire reprend le trait avant confirmation | Le trait disparaît, et **une ligne d'explication reste** : « Trait effacé. Rien n'a été envoyé, et rien ne sera » — parce que B4 autorise la modification, et une modification silencieuse serait une perte |

**Slots** :

| Slot | Requis | Contenu |
|---|---|---|
| `zone` | oui | La zone de tracé, 200 pt, et un `libellé` accessible : « Signature manuscrite de l'état des lieux du 12 septembre, sur l'appareil, pas encore envoyée » |
| `trait` | oui | Le trait, en points bruts, jamais une image aplatie |
| `etat_ecriture` | oui | Le mot d'état de § 2.0.2, **obligatoire dans tous les états** — c'est le seul composant du produit où le mot d'état ne peut pas être absent |
| `aide` | non | La phrase qui explique la conséquence |
| `horodatage` | non | Celui de l'appareil, et celui du serveur, **distingués** |

---

### CarteVocabulaire

**Rôle** : la seule fois où Bailly **enseigne** ses mots, au premier lancement. Elle existe
parce que le critère de succès n°3 est un test de langage : un vocabulaire qu'on n'a pas
entendu une fois ne devient pas une habitude.

**Variantes** :

| Variante | Apparence | Usage |
|---|---|---|
| `introduction` | Feuille centrée, 3 lignes, chacune avec le mot d'état, sa phrase de lecture, et **le mot du téléphone** en troisième colonne | Le premier lancement. Elle est **défilable** et n'a **pas** de bouton `J'ai compris` : c'est la carte elle-même qui est le contenu |
| `rappel` | Bandeau de 44 pt sous le bandeau de synchronisation, repliable, jamais récurrent | Le rappel d'une phrase, déclenché par un appui long sur le mot d'état. **Il disparaît au bout de 15 jours**, parce qu'un rappel permanent devient un bruit (B13) |

**Tailles** : feuille centrée, largeur 92 %, 3 lignes de 96 pt. En variante `rappel`, une
ligne de 44 pt, repliable.

**États** — rendus par l'union `EtatVocabulaire` :

| État | Déclencheur | Apparence |
|---|---|---|
| `introduction` | Premier lancement, après le déverrouillage | Les trois mots, leurs phrases, et les trois mots du téléphone. **Elle s'affiche une fois** et l'application ne la propose plus |
| `rappel_ouvert` | Appui long sur un mot d'état | La même table, en bandeau dépliable |
| `rappel_ferme` | Repli du bandeau | Une ligne : « Appui long sur un mot d'état pour lerevoir » |
| `masque` | Après 15 jours d'usage | Rien. Le vocabulaire ne se rappelle plus tout seul : à partir du moment où il est su, se le rappeler est du bruit |

**Slots** :

| Slot | Requis | Contenu |
|---|---|---|
| `mot_etat` | oui | Le mot d'écran, écrit en toutes lettres |
| `phrase` | oui | La phrase de lecture complète, de § 2.0.2 |
| `mot_telephone` | oui | Le mot que le propriétaire peut répéter au téléphone. **La troisième colonne est obligatoire** : c'est elle qui fait passer le test de langage |

---

### Invite

**Rôle** : dire **une fois** comment faire un geste, à l'endroit où le geste se fait. Jamais
de tutoriel, jamais de bulle de guidage sur un écran entier, jamais deux fois pour la même chose.

**Variantes** :

| Variante | Apparence | Usage |
|---|---|---|
| `contextuelle` | Fond `--color-surface-raised`, contour 1 px `--color-bordure-focus`, 44 pt, une phrase, un bouton `×` de 24 pt | Un geste que le propriétaire n'a jamais fait dans cette application |
| `permanente` | Une ligne de `--text-caption` sous un libellé de champ, pas de cadre | Une consigne qui vaut toujours : « Choisis la classe avant d'enregistrer. » |
| `de_securite` | Fond `--color-alerte-950`, filet gauche 3 px, une phrase | Ce qui va se passer si le réseau manque. **Pas un avertissement, une conséquence** |

**Tailles** : hauteur **44 pt**, largeur pleine moins `--space-lg` de chaque côté.

**États** — rendus par l'union `EtatInvite` :

| État | Déclencheur | Apparence |
|---|---|---|
| `visible` | Le geste n'a jamais été fait | La variante, avec le bouton de fermeture |
| `fermee` | Le propriétaire l'a fermée, ou il a fait le geste | **Rien.** Une invite ne revient pas : si le geste n'a pas été fait, la prochaine fois il sera écrit dans le libellé du bouton, pas dans une bulle |
| `de_securite` | Une condition limite le geste | La variante, toujours visible tant que la condition est vraie |

**Slots** :

| Slot | Requis | Contenu |
|---|---|---|
| `phrase` | oui | Une phrase, à l'impératif, 12 mots maximum |
| `fermer` | non | Un bouton 24 pt, pour la variante `contextuelle` seulement |
| `consequence` | oui, dans la variante `de_securite` | Ce qui va se passer, pas ce qui pourrait arriver |

---

## 4. Patterns de navigation

### 4.1 Structure

```
┌──────────────────────────────────────────────┐
│  BandeauSynchronisation        PERMANENT     │  72–120 pt, ne se masque jamais (B6)
├──────────────────────────────────────────────┤
│  PanneauBlocage               CONDITIONNEL   │  n'apparaît que si décision en attente
├──────────────────────────────────────────────┤
│  TitreÉcran                                 │  44 pt (64 avec contexte)
├──────────────────────────────────────────────┤
│                                              │
│  ListePlate / Feuille / ZoneTexte            │  le contenu
│                                              │
│  ↓ 16 pt de respiration sous le dernier      │
├──────────────────────────────────────────────┤
│  BarreAction                 PERMANENTE      │  88 pt + --space-3xl de respiration
├──────────────────────────────────────────────┤
│  BarreOnglets                PERMANENTE      │  64 pt, 4 segments
└──────────────────────────────────────────────┘
```

**Deux barres fixes, pas une.** La `BarreOnglets` occupe **64 pt**, la `BarreAction`
**88 pt**, et entre les deux `--space-3xl` de respiration pour que le pouce atteigne le
bouton sans viser. Sur une hauteur utile de 640 pt — le plus petit téléphone du périmètre
— cela laisse **460 pt** de contenu.

**C'est un prix, et il est assumé** : sur un écran de 844 pt cela prend 24 % du bas de l'écran.
La raison est C4 et elle est la seule : debout, d'une main, dans un couloir, la cible
principale doit être **toujours** au même endroit et toujours atteignable. Une barre qui
disparaît au défilement obligerait à la retrouver ; une barre qui apparaît contextuellement
la placerait hors de portée une fois sur deux.

### 4.2 Navigation principale

> L'ordre des entrées est une **déclaration de priorité**. Il suit la fréquence de la boucle
> de travail, pas l'organigramme du domaine.

- **Type** : `bottom nav` à **4 onglets** + une **barre d'action** juste au-dessus qui porte
  l'action principale. Ce n'est pas une barre d'action flottante : elle est pleine largeur,
  au-dessus des onglets, donc dans la même zone de pouce.
- **Pourquoi 4 onglets et pas 5** : la règle de portée en impose 5, mais une cinquième
  destination ferait passer l'action principale hors de la zone de pouce, parce qu'elle est
  déjà au-dessus de la barre. **Plutôt que d'entasser une cinquième destination dans la
  navigation, on met l'action la plus fréquente dans un composant fait pour elle.** C'est la
  seule entorse à « la barre principale ne dépasse pas 5 items », et elle va dans le sens
  de la contrainte et non contre elle.
- **Comportement selon la largeur** : identique sur tous les seuils. En `--bp-tablet`, la
  navigation passe à gauche en rail vertical de 88 pt ; en `--bp-desktop`, elle reste en bas.

**Plateau : 5 destinations, dont 4 dans la barre et 1 en overflow.**

| Rang | Module | Libellé | Fréq. (1-5) | Centralité (1-5) | Justification |
|---|---|---|---|---|---|
| 1 | `aujourdhui` | **Aujourd'hui** | 5 | 5 | Ouvre la boucle — consulter l'état avant d'agir — **et c'est le seul écran où les trois mots sont enseignés**. Si la règle de vocabulaire n'est pas visible là, elle n'existe pas (B2, R3). C'est aussi l'écran ouvert au lancement, donc l'entrée la plus utilisée. **« Accueil » est premier ici pour cette raison précise, et pas par défaut** |
| 2 | `saisir` | **Saisir** | 5 | 5 | Le geste du sous-sol, **plusieurs fois par jour**, et la seule slice que le propriétaire utilise tous les jours sans exception (R1). Score le plus élevé du tableau. L'organigramme du domaine la classerait sixième — derrière les locataires, les logements, les baux — et c'est exactement l'erreur que la priorisation des modules interdit |
| 3 | `encaissement` | **Encaissement** | 3 | 5 | Fréquence mensuelle, **centralité maximale au 6 du mois**, où « en retard » apparaît et où la relance est la seule action que Bailly refuse de produire hors ligne (B15). Le score seul (15) l'égalerait à Dossiers ; la règle « une opération répétitive avant une entrée de cycle de vie » tranche en sa faveur, parce qu'il s'agit d'agir sur un objet existant, pas d'en créer un |
| 4 | `dossiers` | **Dossiers** | 3 | 5 | La **source des cinq échéances** (B12) : sans elle, le garde-fou n'a rien à afficher. C'est l'entrée de cycle de vie — créer le bail — et, les 14 baux une fois créés, elle se consulte plus qu'elle ne se modifie. Position haute, rôle de consultation |
| 5 | `demandes` | **Demandes** | 3 | 3 | La liste se consulte **en passant** (« je cesse de l'ouvrir », B14). B14 dit qu'elle n'est utile que si on sait qui doit agir — donc la pastille `À moi` est ce qui la rend actionnable, pas sa position. En overflow : c'est aussi la façon de dire qu'elle **ne doit pas être ouverte quand il n'y a rien à faire** |
| — | `donnees-personnelles` | **Données personnelles** | 1 | 4 | **Hors barre principale, par construction** : B10 dit que l'export est produit à la demande, donc une destination de navigation lui ôterait de son sens. On y va depuis `Plus` et depuis la fiche d'un dossier |
| — | `reglages` | **Le secret** | 2 | 3 | Hors barre, toujours. C5 impose un secret unique et saisissable vite : la seule chose à en faire est de l'**ouvrir**, pas de l'administrer. **Aucun écran d'administration, aucun écran de paramètres** (C3) |

**Overflow (« Plus »)** :

| Module | Libellé | Raison du placement en overflow |
|---|---|---|
| `demandes` | Demandes | Fréquence 3, et la liste n'est utile que lorsqu'elle porte `À moi`. L'entrer en barre reviendrait à remplacer un compteur de rappels par une pastille de notification — ce que B13 interdit |
| `donnees-personnelles` | Données personnelles | Produit à la demande (B10). Une destination permanente dirait qu'on y va chercher quelque chose en attendant |
| `reglages` | Le secret | Changeur de secret, jamais. Un écran de paramètres est le signe d'un produit qui a été conçu pour une équipe (C3) |

**Le geste qui n'est pas dans la barre** : la `BarreAction` porte `Saisir` en `primaire`
sur les six écrans où un fait peut être écrit. Sur `aujourdhui` et sur `dossier-bail`, quand
le panneau de blocage est ouvert, `Saisir` **descend** en `secondaire` et le primaire
devient `Traiter les 2 décisions` — la barre ne disparaît jamais, donc le geste d'urgence
reste atteignable pendant qu'on traite l'obligation.

L'ordre retenu est ensuite enregistré de façon vérifiable :

```bash
node "$FORGE/scripts/state.js" set-nav <anchor> '{
  "archetype": "mobile_field_ops",
  "platform": "ios,android",
  "core_loop": "lire le bandeau de synchronisation, saisir ce qui s est passé, confirmer quand le reseau revient",
  "items": [
    { "key": "aujourdhui",     "label": "Aujourdhui",     "rank": 1, "frequency": 5, "task_criticality": 5, "rationale": "ouvre la boucle et enseigne les trois mots ; seul ecran ou la regle de vocabulaire est visible" },
    { "key": "saisir",         "label": "Saisir",         "rank": 2, "frequency": 5, "task_criticality": 5, "rationale": "geste du sous-sol, plusieurs fois par jour, seule slice utilisee tous les jours" },
    { "key": "encaissement",   "label": "Encaissement",   "rank": 3, "frequency": 3, "task_criticality": 5, "rationale": "centralite maximale au 6 du mois ; la relance est la seule action refusee hors ligne" },
    { "key": "dossiers",       "label": "Dossiers",       "rank": 4, "frequency": 3, "task_criticality": 5, "rationale": "source des cinq echeances derivees ; entree de cycle de vie, ensuite consultation" },
    { "key": "demandes",       "label": "Demandes",       "rank": 5, "frequency": 3, "task_criticality": 3, "rationale": "liste qui se consulte en passant ; B14 dit qu elle ne sert qu avec qui doit agir" }
  ]
}'
```

### 4.3 Breadcrumbs

- **Visibilité** : **jamais sur téléphone.** Un fil d'Ariane de « Dossiers › Courges 3e ›
  Bail » est une phrase de huit mots à lire debout, sur 180 pt de large, en trois lignes.
  Sur mobile, le retour est le geste système et le `TitreÉcran` porte le contexte en une
  ligne.
- **Format** : en `--bp-tablet` et au-delà, un fil d'Ariane d'un seul niveau, en
  `--text-caption`, au-dessus du titre : `Dossiers / Courges 3e`. Jamais plus de deux
  segments : un fil d'Ariane qui se déroule est un menu déguisé.
- **Ce qui le remplace sur téléphone** : le `TitreÉcran` en variante `avec_contexte`, qui
  tient la même information en une ligne de chiffres — « mars · 14 baux · 1 écart ».

### 4.4 Transitions entre pages

- **Type** : **aucune animation de page.** Un push latéral fait perdre le nord dans un
  couloir, et il coûte 200 ms sur chaque aller-retour.
- **Durée** : sans objet. Ce qui est animé, ce sont les **feuilles** — `--duration-normal`
  en `--ease-in` à l'ouverture, `--ease-out` à la fermeture.
- **Le changement d'onglet** est instantané, sans fondu. Un fondu entre deux listes de
  chiffres fait douter de la liste qu'on vient de quitter.
- **Ce qui est animé à l'entrée d'un écran** : les ossatures de ligne, en
  `--duration-slow` en `--ease-out`, et **rien d'autre**.

---

## 5. Grille et layout

### 5.1 Grille de base

```
Mobile (0–479 px)
  1 colonne, largeur utile = 100% − 2 × --space-lg
  gouttière verticale entre deux lignes : --space-xs
  gouttière entre deux blocs : --space-2xl + un sur-titre
  marges latérales fixes : --space-lg (16 px) — jamais 0, jamais 8

Tablet (480–899 px)
  2 colonnes : liste 320 px + détail fluide, gouttière --space-xl
  les listes gardent exactement les mêmes hauteurs de ligne qu'en mobile

Desktop (900 px+)
  1 colonne centrée, largeur maximale 720 px, marges automatiques
  la BarreOnglets reste en bas ; en --bp-tablet et plus, elle devient un rail vertical à gauche
```

**La grille de mobile n'est pas une version réduite, c'est la version de référence.** Les
hauteurs de ligne, les tailles de police et les cibles tactiles sont définies une fois, en
mobile, et ne sont jamais redimensionnées ensuite. Un produit dense dont les hauteurs de
ligne changent selon la largeur d'écran est un produit qui n'est dense nulle part.

### 5.2 Layouts type

| Layout | Structure | Usage |
|---|---|---|
| **Liste-écran** | `BandeauSynchronisation` + `PanneauBlocage?` + `TitreÉcran avec_contexte` + `ListePlate` + `BarreAction` + `BarreOnglets` | Les quatre onglets, et la feuille de détail longue |
| **Fiche-écran** | `BandeauSynchronisation` + `TitreÉcran` + `LigneDonnée` groupées en sections par `sur_titre` + `BarreAction` | Le dossier-bail, le fait, la demande, les données personnelles |
| **Saisie-écran** | `BandeauSynchronisation` + `TitreÉcran feuille` + `ListePlate` de champs, un champ par `LigneDonnée` | La saisie d'un fait, d'une somme, la création d'un bail |
| **Feuille** | `Feuille variante bas` au-dessus du contenu courant, qui **reste mounted** et garde son défilement | La saisie rapide, la relance, le calendrier, le choix de classe |
| **Hors-ligne-écran** | `Liste-écran` + une ligne de contexte en tête de liste | Toute liste lue sans réseau, avec des écritures locales |
| **Vide-écran** | `BandeauSynchronisation` + `TitreÉcran` + `Vide` centré, `BarreAction` conservée | Un module vide. **La barre d'action ne disparaît pas** : un module vide où le geste principal a disparu est un module qu'on ne peut pas sortir |

---

## Checklist de gate

Cf. `references/design-quality.md` — cette checklist n'est pas qu'une formalité, elle est
le filtre anti-générique.

**Direction**
- [x] Les trois ancres sont écrites : références, ambiance, anti-références.
- [x] L'archétype est identifié et justifié : `mobile_field_ops` principal, `rental_tenancy`
      secondaire, avec la raison de l'hybride.
- [x] La densité est choisie consciemment et justifiée : **dense**, et la densité est
      explicitée en « informations par centimètre », pas en taille de police.
- [ ] **Un skill de design a été utilisé, ou son absence est justifiée dans l'audit.**
      `imagegen-frontend-mobile`, obligatoire pour une application mobile selon
      `design-quality.md` § 2, **n'est pas disponible dans cet environnement** : les seuls
      skills installés sont `forge` et `project-rules-architect`. Les interdits du § 3 ont
      donc été appliqués un par un — c'est la contre-mesure prévue par la référence, qui
      écrit « appliquer au minimum le § 3 et le § 4, et le signaler dans l'audit ».
      Le constat est enregistré avec `state.js finding --domain=design`.
- [x] Les trois ancres **précèdent** les écrans : ce document est écrit avant tout fichier
      dans `.forge/design/screens/`.

**Tokens**
- [x] Tous les design tokens ont une **valeur concrète**, en hexadécimal pour les couleurs.
- [x] Aucun `{{PLACEHOLDER}}` résiduel.
- [x] La palette couvre tous les états : `default`, `hover`, `active`, `focus`, `disabled`,
      `error`, `success`, `warning`, `info` — les neuf sont présents, et les états
      d'interaction sontrender par l'union `EtatAction`.
- [x] La palette **n'est pas une palette par défaut** : `#101319` (fond), `#E0A23A` (ambre),
      `#7FB08C` (sauge), `#74A9BC` (cyan-gris), `#F09286` (terre cuite). Aucune de ces
      valeurs n'est `#3B82F6`, `#6B7280`, `#EF4444` ni `#10B981`.
- [x] Le fond **n'est pas du blanc pur** : `#101319`, un gris ardoise froid choisi à la
      valeur, et la raison du thème sombre unique est écrite en § 0.3.
- [x] L'échelle typographique a un **ratio réel** : ×1,19 par pas, à partir de 17 px, avec
      le plancher à 14 px et le corps à 17 px.
- [x] Les classes de couleurs sont **déclarées** en § 0.0, avec `on:` pour chaque encre et
      une raison pour chaque `exempt`.

**Composants**
- [x] Les composants primitifs sont exhaustifs pour le périmètre du MVP : 29 sections, et la
      règle qui les rend exhaustifs est écrite (« un composant qui ne sert aucune slice
      n'est pas dans ce document »).
- [x] Chaque composant a ses états documentés, avec le **nom de l'union** qui les rend, et
      les états qu'elle ne rend pas sont nommés dans la clause `sauf`.
- [x] **L'ombre n'est pas le séparateur par défaut** : `--shadow-none` est le défaut de tout
      le produit, et l'élévation en thème sombre est portée par `--color-surface-raised` et
      `--color-bordure-elevee`.

**Navigation**
- [x] La navigation est définie pour mobile, tablette et desktop.
- [x] **L'ordre des entrées est justifié par la fréquence**, avec deux notes, un score et une
      raison par item — y compris les deux départages explicites (encaissement avant
      dossiers).
- [x] La barre principale ne dépasse pas 5 items : **4 onglets**, et la raison de l'écart
      avec la borne de 5 est écrite.
- [x] « Aujourd'hui » est premier **pour une raison** : il ouvre la boucle *et* il est le
      seul écran où le vocabulaire est enseigné.
- [x] L'ordre est enregistré via `state.js set-nav`.

**Layout**
- [x] La grille et les layouts couvrent tous les cas d'usage du MVP : liste, fiche, saisie,
      feuille, hors-ligne, vide.
- [x] Les animations sont nommées avec leurs tokens de durée et d'easing, et
      `prefers-reduced-motion` est traité.
- [x] **Au moins un choix visuel est assumé et contestable** : le thème sombre unique (§ 0.3),
      la quatre-teintes à signification unique (§ 0.4), l'absence de variante destructive de
      `Bouton` (§ 2.11), et l'absence de slot d'illustration dans `Vide` (§ 2.26).

**Statut** : `draft` → en attente de validation.