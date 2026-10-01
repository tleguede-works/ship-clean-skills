---
type: screen
slug: reglages
title: Ce que l'application ne fait pas
module: Réglages
status: draft
generated_at: 2026-10-01
derived_from:
  - .forge/prd.md
  - .forge/design/design-system.md
  - .forge/roadmap.md
  - .forge/contract.md
rule_ids: [B22, B24, B12, B13]
edge_case_ids: [E1]
flow: Première utilisation
---

# Écran — Ce que l'application ne fait pas

> Ce document est la **source de vérité** pour qu'une IA génère l'interface de cet écran.
> Il est généré depuis le gabarit de `skills/forge/templates/screen.md.tmpl`, jamais recopié.

**Scénario** — Jean-Luc ouvre `Réglages` deux fois la première année : une fois pour vérifier ce
qu'il paie, une fois pour vérifier ce qu'il ne peut pas avoir. Il n'y a pas d_SETTINGS d'usage
quotidien, et c'est ce qui rend cet écran possible : **une page de faits, lus une fois par an.**

---

## 1. Rôle de l'écran

| | |
|---|---|
| **Archétype d'app** | `mobile_field_ops` |
| **Module** | Réglages — rang 4, **overflow `Plus`**, hors barre basse |
| **Route** | `/reglages` |
| **Type** | page — layout « document », en lecture avec deux blocs actionnables |
| **Utilisateurs** | Jean-Luc seul |
| **User stories servies** | US-5 (ouvrir sans mot de passe, sans compte), US-12 (tout télécharger à tout moment, sans rien payer) |
| **Règles métier** | B22, B24, B12, B13 |
| **Edge cases** | E1 |
| **Origine hors PRD** | `.forge/contract.md` § 2, § 3 et § 5 — les deux exclusions, le prix, et les cinq décisions qui appartiennent à Jean-Luc |

**Une phrase** : cet écran permet à Jean-Luc de **lire ce que Forge ne fait pas, ce que ça coûte, et ce qu'il peut toujours sortir**, afin de **décider s'il reste, en connaissant les trois chiffres au lieu d'un**.

**Pourquoi il est en overflow et pas en barre basse** : configuration pure, fréquence **1 sur l'année** (design-system § 3.2). Une quatrième entrée de barre basse coûterait à `Suivi`, `Devis` et `Clients` une place dans une portée de pouce qui n'en contient que trois sans comprimer (§ 3.5). Mais ce n'est pas seulement une histoire de place : `Réglages` est aussi là où vit la promesse de pouvoir partir (B24), et cette promesse doit être à **un geste** de `Suivi` — pas dans un sous-menu.

### 1.1 Ce que cet écran essaie d'éviter

Cet écran essaie d'éviter **le renvoi de l'information difficile à la fin du document**. Un écran de réglages se fait en trois minutes : on ouvre, on descend, on cherche `Facturation` ou `Abonnement`, et si ce n'est pas là, on suppose que ça n'existe pas. Le contrat § 2 exclut deux choses, dont l'une coûte 2 708 € par an à Jean-Luc sur 30 factures de 5 000 € ; et le contrat § 3 porte un engagement de 95,88 € la première année. Ces trois nombres ne peuvent pas être au fond d'une liste de vingt lignes. Donc cet écran commence par **les deux exclusions**, en tête, avec le même poids et la même taille que le prix, et il les présente comme **des faits sur le produit**, pas comme des conditions juridiques : une exclusion de prix est un fait sur un produit au même titre que son prix. La seconde chose refusée est **l'entrée `Facturation`**. Une application de facture contient toujours une rubrique `Moyens de paiement` ou `Encaissement` ; si elle existe, Jean-Luc cherchera l'y, et il y trouvera soit une option, soit `Bientôt disponible`, et les deux le font mentir — la première promet une chose que Forge ne fera pas, la seconde fait croire à un manque. Il n'y a donc **aucune rubrique de paiement** sur cet écran, et c'est une absence à écrire dans la spécification, pas une ligne à griser. La troisième est **l'écran de réglages du système**. Pas de lignes à chevron, pas de commutateurs, pas de `Compte`, pas de `Notifications`, pas de `À propos` avec une version. Un écran de réglages générique est une liste de lignes avec un chevron à droite ; ici chaque bloc est un **paragraphe écrit**, parce que ce que Jean-Luc vient lire n'est pas un réglage, c'est une promesse. La quatrième : **la comptabilité doit être dite, pas seulement omise**. Le contrat § 2 dit que Forge ne fera pas de comptabilité ; la PRD § 9 ajoute pourquoi : le logiciel lui fabriquerait un travail qu'il n'a pas demandé. Donc l'exclusion est écrite, avec sa raison, et pas laissée à l'absence.

### 1.2 Les trois mots, écrits dans l'écran

Cet écran ne montre pas d'état de sortie de devis — il n'a pas de devis. Mais il porte **le même vocabulaire de preuve**, parce qu'il parle de deux choses que Jean-Luc peut croire confirmées sans que personne les ait confirmées : son abonnement, et ses exclusions.

La preuve change de main, exactement comme sur un devis :

| Ce qui est écrit | Qui l'a constaté |
|---|---|
| `Ce que vous payez : 95,88 € la première année, puis 71,88 € chaque année, prélevés le 5. Aucun autre débit.` | Forge — c'est un fait du contrat |
| `Sur 30 factures de 5 000 € par an : 2 708 € par an, chaque année, contre 95,88 € pour tout le reste.` | Forge — un calcul, donc un chiffre qu'on peut vérifier |
| `Réexamen uniquement sur demande écrite de vous.` | Jean-Luc — c'est sa décision, pas celle de Forge |

`confirmé`, `déclaré`, `environ`, `à l'étude`, `bientôt` : **aucun de ces mots n'est écrit sur cet écran**, pour la même raison que le mot `confirmé` n'est écrit dans aucun état de devis. Le contrat dit `Réexamen uniquement sur demande écrite de vous` et non `Réexamen possible` : la nuance est celle entre une porte fermée et une porte qu'on pousse — et elle est dans les mots, pas dans une note.

---

## 2. Direction visuelle de cet écran

Repris du design system — **valeurs concrètes, jamais « à définir »**.

| | |
|---|---|
| **Mood** | dense, mate, sans emphase |
| **Densité** | **normale.** Cet écran se lit une fois par an, assis, avec du temps. Il n'a aucune raison d'être dense, et il aurait tort de l'être : une phrase à lire en diagonale n'est pas une phrase qui informe. |
| **Niveau de contraste** | **fort, et le plus fort de tout le produit** : `--color-texte-principal` `#1F1B15` sur `--color-surface` `#F6F2E9`. Aucun texte en `--color-texte-secondaire` dans les blocs d'exclusion — **une exclusion doit être lisible au même niveau qu'un fait**, sinon elle se lit comme une clause. |
| **Surface** | `--color-surface` `#F6F2E9` sur `--color-background` `#EDE8DC` |
| **Accent utilisé** | `--color-encre-foncee` `#26211A` pour le bouton `Tout télécharger`. **Les prix sont en `--color-texte-principal`, jamais en vert, jamais dans une couleur de « succès »** — un montant payé n'est pas un résultat obtained, et `10B981` n'est pas dans la palette de ce produit. |
| **Traitement photographique** | AUCUN |
| **Référence** | un devis, encore : des blocs séparés par de l'espace et un filet, alignés à gauche, sans conteneur. Le même langage que le reste, parce que c'est la même main qui écrit. |

### 2.1 Anti-générique — obligatoire

Cet écran ne doit ressembler **à aucun** de ces défauts :

- [x] **Pas de fond blanc pur** `#FFFFFF` — la page est `--color-surface` `#F6F2E9` sur `--color-background` `#EDE8DC`. Un écran de réglages générique est blanc `#FFFFFF` à `#F9FAFB`, avec des lignes `#E5E7EB`.
- [x] **Pas de carte ombrée pour tout.** **Aucune carte.** Les blocs sont séparés par `--space-2xl` `32px` et un filet `--color-bordure-forte` `#4A4234` — pas huit rectangles blancs à coins arrondis avec une ombre douce à 0,1 d'opacité. C'est le défaut le plus probable sur cet écran précis, parce qu'un écran de réglages est par définition une liste de boîtes.
- [x] **Pas d'uniformité** : `--text-h2` `23px` pour le titre de chaque bloc, `--text-corps` `17px` pour le texte, `--text-corps-fort` `17px` pour les chiffres — **les chiffres sont en gras dans le texte courant**, pas dans une taille au-dessus, donc ils sont dans la phrase et pas à côté d'elle. Et `--text-etiquette` `14px` capitales pour le titre de bloc, au-dessus d'un titre d'au moins 20px, jamais seul.
- [x] **Pas de gris neutre générique** `#6B7280` — le texte secondaire est `--color-texte-secondaire` `#4C4436`, les filets `--color-tiret` `#BFB59E`.
- [x] **Pas de mise en page centrée symétrique** — tout est à gauche. **Aucun bloc n'est centré**, y compris les deux exclusions : une exclusion centrée ressemble à un avertissement dans une boîte, donc à une alerte de l'interface, et elle n'est pas une alerte — c'est une caractéristique du produit.
- [x] **Pas d'illustration d'appoint** — pas d'icône de carte bancaire barrée, pas d'icône de balance, pas de cadenas dans un cercle pour « pas de compte ». **Les deux exclusions sont des phrases.**
- [x] **Pas d'une seule famille de police** — `--font-texte` `Archivo` pour le texte, `--font-identifiant` `IBM Plex Mono` `15px` pour les montants `95,88 €`, `2 708 €`, `24 €` et `71,88 €`, parce que ce sont des nombres que Jean-Luc va recopier dans ses comptes.

**Choix assumé et non neutre** : **les euros sont en police à chasse fixe.** Un montant recopié faux est un virement de trop ; `95,88` avec un `9` qui ressemble à un `g`, ou un `1` qui ressemble à un `l`, coûte une facture à Jean-Luc sans qu'il le sache. C'est du métier, pas du goût, et c'est le seul endroit du produit où un chiffre est en `IBM Plex Mono` sans être un identifiant de document.

---

## 3. Anatomie

```
┌─────────────────────────────────────────┐
│ BARRE DE HAUTEUR 56px                   │
│  `Retour à Suivi`                       │
├─────────────────────────────────────────┤
│ CE QUE FORGE NE FAIT PAS — h2 23px     │
│ ▌ Sur 30 factures de 5 000 € par an :  │  ← liseré gauche 4px
│ ▌ 2 708 € par an, chaque année, contre │    --color-bordure-forte
│ ▌ 95,88 € pour tout le reste.         │
│ ▌ Réexamen uniquement sur demande      │
│ ▌ écrite de vous.                      │
├─────────────────────────────────────────┤
│ HORS PÉRIMÈTRE — h2 23px               │
│ Forge écrit les mentions que la loi    │
│ impose sur une facture. Il ne tient    │
│ aucun compte, ne suit aucune trésorerie│
│ , ne déduit rien.                      │
├─────────────────────────────────────────┤
│ CE QUE VOUS PAYEZ — h2 23px            │
│ 95,88 € la première année, puis        │
│ 71,88 € chaque année, prélevés le 5.   │
│ Aucun autre débit.                      │
│ Nom de domaine : 24 € pour deux ans.   │
├─────────────────────────────────────────┤
│ CE QUE VOUS DÉCIDEZ — h2 23px          │
│ SIGNATURE — 0 € — tracée              │
│ DOMAINE — 24 € — .fr                  │
│ VALIDITÉ — 15 / 30 / 60 jours          │
│   (GroupeBoutons `trois` `desactive`)  │
│ FACTURATION — bloquée, en V1           │
├─────────────────────────────────────────┤
│ PANNEAU EXPORT — bloc de 200px         │
│  Vos devis et vos factures, dans un    │
│  seul fichier.                          │
│  Ce téléchargement est permanent et    │
│  ne coûte rien.                        │
├─────────────────────────────────────────┤
│ [ Tout télécharger ] — LE POUCE        │  ← --hauteur-action-primaire
├─────────────────────────────────────────┤
│ NAVIGATION BASSE 68px — aucune entrée  │
│   active : Réglages est en overflow     │
└─────────────────────────────────────────┘
```

| # | Composant | Rôle | Source |
|---|---|---|---|
| 1 | **Bloc d'exclusion — paiement par carte** | dire ce que Forge ne fait pas, **avec son prix en euros** (C8) | slice-local, imposé par le design-system § 0.5 |
| 2 | **Bloc d'exclusion — comptabilité** | dire ce qui est hors périmètre, et pourquoi (C7) | slice-local, imposé par le design-system § 0.5 |
| 3 | **Bloc du prix** | le budget réel, en trois chiffres, à la même place et au même poids que les exclusions | slice-local, imposé par le contrat § 3 |
| 4 | `GroupeBoutons` variante `trois`, état `desactive` | la durée de validité, et la règle qui explique pourquoi elle est verrouillée (B12) | design-system § 2 |
| 5 | `PanneauExport` variante `permanent` | tout télécharger, à tout moment, sans rien payer (B24) | design-system § 2 |
| 6 | `Bouton` variante `plein` taille `grande` | `Tout télécharger`, à `--hauteur-action-primaire` `60px` | design-system § 2 |
| 7 | `BandeauMessage` | l'échec de préparation d'un export, et l'export prêt | design-system § 2 |
| 8 | **Mention de blocage — facturation** | écrire que la facture n'existe pas encore, et pourquoi (roadmap § 2.2) | slice-local |
| 9 | `NavigationBasse` | la sortie de l'overflow, **sans entrée active** | design-system § 2 |

---

## 4. États — tous, sans exception

| État | Déclencheur | Rendu | Feedback utilisateur |
|---|---|---|---|
| **Chargement** | Ouverture depuis `Plus` | **Aucun squelette.** Le prix, les exclusions et les décisions sont écrits dans l'application : il n'y a rien à aller chercher, donc rien à charger. Le `PanneauExport` s'affiche dans son état `inactif` immédiatement. | rien |
| **Rempli** | Ouverture normale | Les quatre blocs dans l'ordre : les deux exclusions, le prix, vos décisions, l'export. **Les deux exclusions sont en tête**, parce que ce sont les seules informations de cet écran que Jean-Luc ne peut pas découvrir autrement. | — |
| **Vide — jamais visité** | Première ouverture | **Cet écran n'a pas d'état vide, et c'est un choix :** il n'affiche pas de données facultatives, il affiche des faits du produit. Un écran de réglages qui dirait `Aucun réglage` serait un écran qui ne fait rien — et ici il n'y a rien à « régler » parce que Jean-Luc n'a rien à configurer au quotidien. Il n'y a **ni compte, ni mot de passe, ni notification, ni thème** (B22, C2). Cette absence est l'information la plus utile de l'écran. | — |
| **Vide — aucune donnée** | — | **N'existe pas.** Aucun bloc de cet écran ne dépend d'une liste, d'un compte ou d'un serveur. La seule liste qui pourrait être vide est l'export, et le `PanneauExport` à l'état `inactif` **n'affiche déjà pas de contenu dépendant du nombre de documents** : il écrit `Vos devis et vos factures, dans un seul fichier.`, ce qui est vrai même avec un seul devis et vrai avec zéro. | — |
| **Erreur de chargement** | Le magasin local ne répond pas | Les blocs d'exclusion, le prix et vos décisions **restent affichés** : ils sont écrits dans l'application, ils ne dépendent d'aucune lecture. Seul le `PanneauExport` passe en `PanneauExport` état `echec` : `Le fichier n'a pas pu être fait. Vos devis sont encore là.` puis `Réessayer`. **L'écran ne se vide pas** : un écran de réglages vide parce qu'une base locale ne répond pas ferait croire que les exclusions ont disparu. | bandeau `--color-expire-fond` `#F4DED8` dans le seul panneau concerné |
| **Erreur de soumission** | La durée de validité est tentée alors qu'elle est verrouillée | **`GroupeBoutons` à l'état `desactive`** : tous les boutons en `desactive` — opacité 45 %, texte `--color-texte-desactive` `#8B8272`, `aria-disabled` — avec la ligne qui va avec, au-dessus : `La durée de validité est fixée avant le premier envoi. Elle ne s'applique qu'aux devis écrits après.` Aucun message d'erreur, aucune tentative de déverrouiller. | — |
| **Succès** | Un export est produit | `PanneauExport` à l'état `pret` : `Le fichier est prêt.` puis son nom et sa taille — `atelier-devis-2026-04-12.pdf`, `2,4 Mo` — puis `Enregistrer` et `Partager`. Le bouton `Tout télécharger` reste visible et redevient actif, à la même place : **l'écran ne se vide pas et ne se réorganise pas.** | — |
| **Hors-ligne / permissions** | Mode avion | **L'écran est complet hors-ligne.** Le prix, les exclusions, les décisions et l'export se produisent sans réseau — l'export écrit un fichier sur l'appareil. **Aucune mention de couverture** : cet écran n'a aucune dépendance réseau, donc il n'a rien à signaler. | rien |
| **Lecture seule** | La durée de validité est fixée, et un devis a déjà été envoyé | C'est l'état normal de cet écran pour la durée : `GroupeBoutons` `desactive` avec la règle écrite. Le reste de l'écran est en lecture, y compris les deux exclusions et le prix — **ce sont des faits, et un fait ne se modifie pas depuis un téléphone.** | — |

> Un état non décrit est un état non implémenté.

---

## 5. Interactions

| Élément | Événement | Comportement | Feedback visuel | État résultant | ID |
|---|---|---|---|---|---|
| Bloc d'exclusion — paiement par carte | tap | **Aucun comportement.** Il se lit. Il n'y a pas d'activation à faire, pas de demande à faire ici : la réouverture se fait **par écrit, auprès de Forge**, pas dans un interrupteur. Un interrupteur `Activer l'encaissement par carte` serait une promesse de 2 708 € par an avec un bouton à 56px — et Forge ne l'installera jamais d'office (C8). | — | — | C8 |
| Bloc d'exclusion — comptabilité | tap | Aucun comportement. Il se lit. | — | — | C7 |
| Bloc du prix | tap | Aucun comportement. Il se lit. **Le prix n'a pas de bouton** : un prix avec un bouton « mettre à jour » qui mène nulle part est une promesse. Le seul geste possible est d'appeler le numéro de Forge, qui est écrit en bas de l'écran. | — | — | C10 |
| `GroupeBoutons` — 15 / 30 / 60 jours | tap | **Aucune sélection possible** tant qu'un devis est sorti : `EtatGroupeBoutons.desactive`, avec la règle écrite au-dessus. Une fois le premier devis envoyé, ce contrôle est mort — et il reste affiché, dans son état désactivé, avec sa raison. Le retirer reviendrait à effacer une règle. | opacité 45 %, `aria-disabled` | `desactive` | B12 |
| Bouton `Tout télécharger` | tap | Produit le fichier unique de tous les devis et de toutes les factures, **gratuitement et sans abonnement** (B24). Le bouton passe en `preparation` : `Préparation en cours.` **Sans barre de progression** — un pourcentage serait un chiffre que le produit n'a pas. Le bouton reste `desactive`, **à la même place** : l'écran ne bouge pas, donc l'emplacement du bouton est stable dans la mémoire de Jean-Luc. | — | `pret` | B24 |
| `Enregistrer`, export prêt | tap | Enregistre le fichier là où Jean-Luc le décide, via le sélecteur du système. L'application ne choisit pas de dossier : c'est une donnée personnelle. | — | — | C11 |
| `Partager`, export prêt | tap | Invoque le sélecteur du système, une fois. L'application **n'apprend pas** la destination — elle ne reçoit qu'un fait binaire. | — | — | C11 |
| `Retour à Suivi` | tap | Pop vers l'écran d'où l'on vient. Le retour système est intercepté et traité comme ce bouton. | glissement inverse `220ms` | `suivi` | — |
| Numéro de Forge | tap | Compose l'appel. **Un seul numéro, sept jours sur sept** — c'est la contrepartie écrite du contrat : si l'application tombe en panne un jeudi matin sur un chantier, Jean-Luc appelle ce numéro. Il n'y a ni formulaire de contact, ni chat, ni ticket, ni adresse de courriel de support à trouver. | — | appel | C11 |

- **Focus / clavier** : ordre — `Retour à Suivi`, les quatre blocs en lecture, le `GroupeBoutons` désactivé (focusable, announced `désactivé`, avec sa règle en `aria-describedby`), puis `Tout télécharger`, puis la barre basse. Sur `--bp-poste` et `--bp-large`, la navigation clavier est complète et chaque bloc est un `role="region"` étiqueté par son titre. Anneau `--color-bordure-focus` `#8A4A0E`, `--stroke-focus` `3px`, jamais supprimé.
- **Gestes** : défilement vertical. **Aucun geste ne produit un fichier** — ni double-tap sur le bouton, ni balayage, ni appui long. Le téléchargement est permanent et gratuit : il n'y a donc aucune raison de le rendre rapide au risque de le déclencher par accident, et un geste qui part quand on relit l'écran pour trouver un prix serait le pire endroit pour qu'un fichier parte.
- **Animations** : `--duration-normal` `220ms` à l'entrée. **L'export en préparation n'anime rien** : ni rotation, ni progression, ni point clignotant — parce qu'un pourcentage serait un chiffre que le produit n'a pas. **Aucun chiffre de cet écran ne s'anime**, et aucun texte d'exclusion n'apparaît en fondu : une exclusion qui s'anime est une exclusion qui a l'air d'arriver.
- **Retour arrière** : intercepté, traité comme `Retour à Suivi`. **Le retour arrière du système ne demande rien**, et ne déclenche aucun dialogue de confirmation : rien n'a été modifié sur cet écran, à part une préparation d'export, qui se termine ou échoue seule et écrit son résultat.

---

## 6. Responsive

| Breakpoint | Comportement | Ce qui se replie / disparaît |
|---|---|---|
| **Mobile** `--bp-telephone` 0 — 479px | Une colonne, marge `--space-lg` `16px`. Les deux exclusions en tête, en `--text-corps` `17px`, avec un liseré gauche `--stroke-liseré` `4px`. `Tout télécharger` est en `Bouton` `grande`, hauteur `--hauteur-action-primaire` `60px`, pleine largeur moins `--space-lg` `16px` de chaque côté, dans `--zone-pouce` `96px` — **l'engagement de pouvoir partir est au pouce, même sur un écran qu'on ouvre une fois par an.** | rien |
| **Tablet** `--bp-tablette` 480 — 1023px | Marge `--space-xl` `24px`. Les deux exclusions passent en deux colonnes côte à côte, de largeur égale : **deux faits de même nature, donc deux poids égaux.** Les montants des blocs de prix et de décisions s'alignent en colonne à droite. | rien |
| **Desktop** `--bp-poste` 1024 — 1439px | Une colonne centrée, largeur limitée à `--space-3xl` `48px` de marge de chaque côté. **Cet écran ne gagne pas de colonne en grand :** du texte long de deux phrases par ligne est moins lisible en pleine largeur qu'à 720px, et c'est la seule mesure typographique qui compte ici. | rien |
| **Large** `--bp-large` 1440px et plus | Identique à `--bp-poste`. Le contenu ne s'étire pas, parce qu'un paragraphe de prix sur 1 400 px est une ligne qu'on ne relit pas. | rien |

- **Cible tactile** : `--hauteur-action-primaire` `60px` pour `Tout télécharger`, `--hauteur-cible` `56px` pour `Enregistrer`, `Partager` et la zone d'appel du numéro de Forge. Les blocs d'exclusion **ne sont pas cliquables** et ne le sont nulle part : une exclusion n'est pas un contrôle.
- **Débordement** : **aucun défilement horizontal.** Les montants sont en `IBM Plex Mono` `15px` dans le texte, donc de largeur stable ; `2 708 €` ne peut pas faire bouger la ligne. Les phrases d'exclusion passent sur quatre à six lignes à `--text-corps` `17px` **jamais réduites** — c'est le seul texte du produit qu'il serait le plus facile de réduire, et c'est précisément celui qu'il ne faut pas réduire, parce qu'une exclusion en 14px est une exclusion que Jean-Luc ne lit pas dans une camionnette en plein soleil.

---

## 7. Accessibilité

- [ ] **Contraste du texte courant** : mesuré par `node "$FORGE/scripts/design-check.js" contrast <anchor>`. **Aucun ratio n'est écrit ici** (design-system § 0.0). Le texte des deux exclusions est mesuré contre `--color-surface` `#F6F2E9` au niveau du texte courant — **jamais contre une couleur d'exclusion** : un texte d'exclusion sur un fond rouge se lirait comme une alerte, et il n'est pas une alerte.
- [ ] **Contraste des grands textes** : mesuré par le même contrôle, sur `--text-h2` `23px`.
- [ ] **Navigation clavier complète** sur `--bp-poste` et `--bp-large`, avec le `GroupeBoutons` focusable et annoncé désactivé.
- [ ] **Focus visible** : anneau `--color-bordure-focus` `#8A4A0E`, `--stroke-focus` `3px`, jamais supprimé. Le liseré gauche `--stroke-liseré` `4px` des blocs d'exclusion est **le seul élément de cet écran qui ressemble à un repère et qui n'est pas focusable** : il porte un sens mais n'est pas un contrôle, et le dire ici évite qu'un implémenteur en fasse un bouton.
- [ ] **ARIA** : chaque bloc est un `role="region"` étiqueté par son titre : `Ce que Forge ne fait pas`, `Hors périmètre`, `Ce que vous payez`, `Ce que vous décidez`. Le `PanneauExport` est `role="status"` pendant la préparation et à l'état `pret`, pour qu'un lecteur d'écran annonce `Le fichier est prêt.` Le `GroupeBoutons` désactivé porte `aria-disabled="true"` sur chaque bouton et `aria-describedby` pointant vers `La durée de validité est fixée avant le premier envoi.` Les montants portent un `aria-label` en mots : `2 708 euros par an`, `95 euros 88`, `24 euros`, `71 euros 88` — **écrits en toutes lettres**, parce qu'un montant lu « deux mille sept cent huit virgule zéro cinq » n'est pas un montant qu'on peut vérifier dans ses comptes.
- [ ] **Texte alternatif** : **aucune image sur cet écran.** Il n'y a pas d'icône de carte bancaire barrée, pas d'icône de balance, pas de cadenas. Les deux exclusions sont des phrases, donc elles sont sélectionnables, donc Jean-Luc peut les copier dans un message à Forge pour demander un réexamen — ce qui est exactement la procédure que le contrat prévoit : **une demande écrite**.
- [ ] **Langue et direction de lecture** : `lang="fr"`, `dir="ltr"`. Les montants sont en format français, espace fine insécable entre les milliers et la virgule décimale. Les durées en toutes lettres : `15 jours`, `30 jours`, `60 jours` — jamais `15j`.

---

## 8. Données

| Champ | Type | Origine | Requis | Erreur possible |
|---|---|---|---|---|
| `contrat.prix-premiere-annee` | décimal `95,88` | **écrit dans l'application**, pas lu d'un serveur | oui | ne peut pas être absent : c'est un fait du contrat § 3, écrit dans le fichier |
| `contrat.prix-annee-suivante` | décimal `71,88` | idem | oui | idem |
| `contrat.prix-domaine` | décimal `24` | idem, pour deux ans | oui | idem |
| `contrat.prelevement` | date | idem, le 5 de chaque mois | oui | jamais `Aucun autre débit.` ne peut disparaître : c'est la phrase qui rend le prix vérifiable |
| `contrat.cout-carte-par-an` | décimal `2 708` | idem, sur l'hypothèse de 30 factures de 5 000 € | oui | **affiché avec son hypothèse, jamais seul** : `2 708 €` sans `sur 30 factures de 5 000 € par an` serait un chiffre invérifiable |
| `contrat.exclusions[]` | liste de textes | idem | oui | vide refusé : le contrat en porte deux (C7, C8) |
| `duree-validite` | `15` \| `30` \| `60` | choix de Jean-Luc | oui | **absent avant le premier envoi** : l'écran affiche alors `30 jours` marqué `recommandé`, le défaut existe et il est écrit |
| `export.etat` | `inactif` \| `preparation` \| `pret` | local | oui | `preparation` qui n'aboutit pas : l'écran écrit `Le fichier n'a pas pu être fait.` et propose `Réessayer` |
| `forge.telephone` | texte | **écrit dans l'application** | oui | jamais absent : c'est le seul numéro, et il est la contrepartie de l'engagement de non-interruption |
| `devis.mentions-obligatoires` | texte | idem | oui | **jamais affichées comme complètes** tant que les cinq champs `[à compléter]` manquent — l'écran écrit qu'elles ne le sont pas encore |

- **Chargement** : **aucun chargement réseau, sur aucune partie de cet écran.** Les prix, les exclusions et le numéro de Forge sont écrits dans l'application : ils ne changent pas sans que le produit change, et le produit ne se met pas à jour en arrière-plan sans que Jean-Luc le sache. C'est la seule chose qu'un écran de configuration puisse faire sans réseau, et c'est ici qu'elle est possible.
- **Cache / hors-ligne** : **entièrement hors-ligne** (C1). L'export produit un fichier sur l'appareil, sans serveur et sans frais — c'est ce qui rend B24 crédible dès le MVP, et c'est la raison pour laquelle la promesse de pouvoir partir est écrite ici, à côté du prix, et pas dans une note de bas de page d'un site.
- **Données sensibles** : **aucune donnée personnelle.** Aucun nom, aucune adresse, aucun numéro de devis, aucune donnée de client n'est rendu sur cet écran. Le seul numéro de téléphone est celui de Forge. Les cinq champs d'identité `[à compléter]` ne sont **jamais affichés comme des espaces vides dans un formulaire** — un formulaire de cinq champs vides Dirait à Jean-Luc qu'il peut les remplir, et il ne peut pas : il doit les demander à Forge, par téléphone.

---

## 9. Traçabilité

| ID | Origine | Manifestation sur cet écran |
|---|---|---|
| B22 | PRD | **L'écran le montre en n'ayant rien à montrer** : pas de compte, pas de mot de passe, pas de récupération, pas de notification. L'absence de rubriques est le rendu de B22, et elle est écrite dans le paragraphe de l'état vide plutôt que laissée au silence. |
| B24 | PRD | `PanneauExport` en `permanent`, dans le tiers bas, avec la promesse complète : `Vos devis et vos factures, dans un seul fichier.` puis `Ce téléchargement est permanent et ne coûte rien.` Puis `Tout télécharger`. **Aucun compte, aucun abonnement, aucune « version premium » en dessous.** |
| B12 | PRD | `GroupeBoutons` `trois` à l'état `desactive` dès qu'un devis est sorti, avec la règle écrite : `La durée de validité est fixée avant le premier envoi. Elle ne s'applique qu'aux devis écrits après.` |
| B13 | PRD | Le même principe, appliqué aux prix : **ce produit ne modifie aucun prix seul, et il le dit.** Aucune remise automatique, aucun tarif dégressif, aucun prix qui bouge. |
| E1 | PRD | Hors-ligne, l'écran est complet, y compris l'export. Aucun bandeau réseau. |
| **C8** | PRD · contrat § 2 et § 5 | **Le paiement par carte, avec son prix, en tête d'écran** : `Sur 30 factures de 5 000 € par an : 2 708 € par an, chaque année, contre 95,88 € pour tout le reste. Réexamen uniquement sur demande écrite de vous.` **Aucune rubrique `Facturation`, `Paiement` ou `Moyens de paiement` n'existe sur cet écran** — pas grisée, absente. |
| **C7** | PRD · contrat § 2 | **La comptabilité, avec sa raison** : `Forge écrit les mentions que la loi impose sur une facture. Il ne tient aucun compte, ne suit aucune trésorerie, ne déduit rien.` C'est aussi la phrase du pied du `BandeauBlocage` de la question fiscale, et elle est la même des deux côtés. |
| **C10** | PRD · contrat § 3 | Le prix complet : `Ce que vous payez : 95,88 € la première année, puis 71,88 € chaque année, prélevés le 5. Aucun autre débit.` Et le coût du départ : `Et si vous vous arrêtez au bout de trois mois : 17,97 € payés, 24 € de nom de domaine non remboursés — 41,97 € perdus, c'est tout.` |
| **C11** | PRD · contrat § 3 | Un seul numéro de téléphone, sept jours sur sept, appelable en un geste. Aucun formulaire de contact, aucun chat, aucun ticket. **Aucun outil d'audience, aucune régie publicitaire, aucun partage à un réseau social** : rien de tout cela n'existe dans l'application, donc rien ne le mentionne. |
| C2 | PRD · contrat § 2 | Un seul utilisateur : pas de rôles, pas de permissions, pas de partage de dossier, pas de planning, pas d'équipe. Ces six rubriques n'existent pas, et c'est une exclusion visible au même titre que les deux autres. |
| C4 | PRD · contrat § 3 | Les mentions obligatoires sont **écrites, jamais saisies**, et l'écran dit qu'elles ne sont pas encore complètes tant que les cinq champs manquent : `Les mentions de la facture ne sont pas encore complètes : Forge doit connaître cinq informations. Vous pouvez déjà chiffrer, signer et envoyer.` **Aucun formulaire de cinq champs vides** n'est proposé ici. |
| C3 | PRD · contrat § 5 | La signature est tracée et coûte `0 €`, écrit dans les décisions de Jean-Luc avec le prix de l'alternative : `1 à 3 € par devis signé, soit 30 à 90 € par an pour 30 devis. La signature tracée suffit pour un devis.` |
| C6 | PRD | `Vos factures sont gardées 10 ans, vos devis 2 ans, les sauvegardes 30 jours.` Et **aucun bouton de « nettoyage », de « purge » ou de « liberation d'espace » n'existe** : un produit ne peut pas proposer de supprimer des factures. |
| C9 | PRD | Aucun réglage d'envoi de SMS, aucun réglage de gestion d'appels : ces deux exclus n'ont pas de rubrique. |
| Roadmap § 2.2 | Roadmap | **La facturation est annoncée absente, pas cachée** : `La facture n'existe pas encore. Elle sortira après la réponse à une seule question : êtes-vous assujetti à la TVA ?` Un vide affiché à sa place — `Bientôt disponible` — ferait croire à un manque du produit alors que c'est un choix de séquence. |

---

## 10. Checklist de gate

- [x] Les états sont décrits avec un rendu concret. Les états vides sont **écrits comme absents**, et le paragraphe de l'état vide porte l'information la plus utile de l'écran : il n'y a rien à configurer parce que Jean-Luc est seul.
- [x] Chaque élément interactif a un comportement et un feedback ; **six éléments ont explicitement « aucun comportement »** — les deux exclusions, le prix — et c'est une décision écrite : un fait du produit n'est pas un contrôle.
- [x] Le responsive est défini à **chaque** breakpoint, y compris la décision de ne pas gagner de colonne sur cet écran.
- [x] La section Anti-générique est cochée et justifiée. Le choix de mettre les euros en `IBM Plex Mono` est le choix contestable de cet écran, et il est justifié par un risque de recopie.
- [x] Aucune valeur de design n'est laissée à « à définir ».
- [x] Chaque ID B*/E*/C* de cet écran apparaît en section 9 : B12, B13, B22, B24, E1, C2, C3, C4, C6, C7, C8, C9, C10, C11, et `roadmap § 2.2`.
- [x] Aucun gabarit non résolu.
- [x] L'écran reste cohérent avec `.forge/design/design-system.md`.