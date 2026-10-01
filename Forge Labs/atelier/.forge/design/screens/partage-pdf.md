---
type: screen
slug: partage-pdf
title: Partage en PDF
module: Envoi
status: draft
generated_at: 2026-10-01
derived_from:
  - .forge/prd.md
  - .forge/design/design-system.md
  - .forge/roadmap.md
rule_ids: [B8, B9]
edge_case_ids: [E3, E1]
flow: Sortie PDF
---

# Écran — Partage en PDF

> Ce document est la **source de vérité** pour qu'une IA génère l'interface de cet écran.
> Il est généré depuis le gabarit de `skills/forge/templates/screen.md.tmpl`, jamais recopié.

**Scénario** — `D-2026-016`, signé le 12 avril 2026 à 10 h 07. Jean-Luc a choisi
`Partager en PDF` parce qu'il est dans une cave sans réseau. Le devis a été partagé
hier soir, chez le client, et c'est aujourd'hui qu'il le déclare.

---

## 1. Rôle de l'écran

| | |
|---|---|
| **Archétype d'app** | `mobile_field_ops` |
| **Module** | feuille depuis `sortie` — aucune entrée de navigation |
| **Route** | `/devis/:numero/sortie/pdf` |
| **Type** | sheet — feuille modale basse, hauteur 50 %, rayon `--radius-lg` `16px` |
| **Utilisateurs** | Jean-Luc seul |
| **User stories servies** | US-4 (partager le devis signé en PDF quand aucun réseau n'est disponible) |
| **Règles métier** | B8, B9 |
| **Edge cases** | E1, E3 |

**Une phrase** : cet écran permet à Jean-Luc de **déclarer la date à laquelle il a partagé un devis signé en PDF**, afin de **pouvoir ressortir le document sur un chantier sans réseau, sans revenir au bureau**.

**Pourquoi il est une feuille et non une page** : il ne fait qu'une chose, et il la fait au-dessus de la feuille `sortie` qui reste visible dessous. Une page entière pour saisir une date serait disproportionné, et surtout elle ferait perdre le fait précédent — que ce devis est signé et qu'il attend une sortie.

### 1.1 Ce que cet écran essaie d'éviter

Cet écran essaie d'éviter **la date que l'application ne peut pas connaître**. Un partage en PDF ne laisse aucune trace vérifiable : rien n'a de retour, aucun service n'a acquitté, aucun tiers n'a horodaté. La seule personne qui sait quand le devis est réellement parti du téléphone, c'est Jean-Luc. Alors la question « quand ? » n'a pas de réponse automatique, et l'écran **ne la remplace pas par la date du jour**. Le champ est pré-rempli à la date du jour — c'est le cas le plus fréquent, et un champ vide obligerait à choisir entre deux valeurs pareilles — mais **il est modifiable**, et la raison est écrite sous lui, en toutes lettres : `Cette date est celle que vous déclarez. Aucune application ne la confirmera.` Si Jean-Luc a partagé le devis hier soir chez le client, la vérité est hier, et un champ en lecture serait une date fausse. La seconde chose refusée est **l'état `envoyé par courriel`**. Un partage en PDF passe à `Parti en PDF partagé` et **jamais** à `Envoyé par courriel` : rien ne confirme un partage, et l'appeler « envoyé » serait la même erreur que l'envoyer par anticipation, mais appliquée à un acte qui n'a aucun service derrière lui. La troisième est **le mensonge de la couleur**. L'état `Parti en PDF partagé` est en `--color-texte-encre-signature` `#1F4C6B`, le bleu d'encre du produit, et c'est le seul emploi de ce bleu comme état : **le bleu, c'est « c'est moi qui l'ai constaté, pas un service »**. Le vert, lui, est réservé à ce que le service de courriel a dit. Ce n'est pas un choix de teinte, c'est une règle : une couleur d'état ne doit jamais pouvoir être prise pour une confirmation qu'elle ne porte pas.

### 1.2 Les trois mots, écrits dans l'écran

Le partage en PDF est **une sortie distincte** de l'envoi par courriel, et il a son propre mot. Les trois valeurs du vocabulaire sont donc toutes présentes sur les deux feuilles, jamais mélangées :

| Sortie | Mention écrite | Preuve écrite |
|---|---|---|
| Courriel, en attente | `Écrit ici, pas encore envoyé` | `Envoi tenté le 12 avril à 10 h 12, sans réponse du service. Personne ne peut dire s'il est parti.` |
| Courriel, confirmé | `Envoyé par courriel` | `Confirmé par le service de courriel le 12 avril à 10 h 12.` |
| **PDF partagé** | `Parti en PDF partagé` | `Le 11 avril, date déclarée par vous. Rien ne l'a confirmée.` |

La troisième ligne est celle de cet écran. Elle dit deux choses en une : **le fait**, puis **qui ne l'a pas confirmé**. C'est ce qui permet à Jean-Luc de dire au téléphone « parti en PDF, mais je te le dis moi-même » sans regarder l'application — et de ne pas dire « confirmé », parce que rien ne l'a confirmé.

---

## 2. Direction visuelle de cet écran

Repris du design system — **valeurs concrètes, jamais « à définir »**.

| | |
|---|---|
| **Mood** | dense, mate, sans emphase |
| **Densité** | **normale**, comme `sortie` : c'est une feuille de déclaration, de quatre lignes de texte et un bouton. Elle n'a rien à faire défiler. |
| **Niveau de contraste** | **fort** — l'avertissement de la date déclarée est en `--color-texte-encre-signature` `#1F4C6B` sur `--color-encre-signature-fond` `#DEE6EF`, et il est au-dessus du mot en gras, pas dans une note de bas de page. C'est un fait sur la nature du produit, pas une clause. |
| **Surface** | `--color-surface-raised` `#FBF9F4` pour la feuille, sur la feuille `sortie` en dessous |
| **Accent utilisé** | `--color-texte-encre-signature` `#1F4C6B` — le liseré `--stroke-liseré` `4px` du bloc de déclaration, la mention, l'avertissement. **Aucun bouton bleu**, et le bouton `Partager le PDF` est en variante `plein` `--color-encre-foncee` `#26211A`. |
| **Traitement photographique** | AUCUN. Le PDF ne se montre pas en vignette sur cet écran : une vignette serait une illustration d'appoint, et le document que Jean-Luc vient de partager il l'a déjà dans les mains. |
| **Référence** | Too Good To Go pour la règle d'une main et l'action unique au pouce. |

### 2.1 Anti-générique — obligatoire

Cet écran ne doit ressembler **à aucun** de ces défauts :

- [x] **Pas de fond blanc pur** `#FFFFFF` — la feuille est `--color-surface-raised` `#FBF9F4`. Un écran de partage générique est une boîte de dialogue blanche `#FFFFFF` sur un voile gris, avec un titre `Partager via…` et une liste d'applications.
- [x] **Pas de carte ombrée pour tout.** Une seule ombre, `--shadow-lg` `0 -4px 24px rgba(31,27,21,0.18)`, vers le haut, parce que la feuille monte par-dessus `sortie` et qu'elle la masque. Le bloc de date est un bloc de saisie sur `--color-surface-sunken` `#E2DAC9`, pas une carte.
- [x] **Pas d'uniformité** : trois niveaux — `--text-h2` `23px` pour le titre, `--text-corps` `17px` pour la date et le bouton, `--text-mention` `16px` pour l'avertissement. Et l'avertissement est en gras `Archivo` `16px` à la ligne 500, dans la couleur du bleu d'encre : c'est le seul texte de la feuille qui est à la fois en couleur et en gras.
- [x] **Pas de gris neutre générique** `#6B7280` — l'avertissement est en `--color-texte-encre-signature` `#1F4C6B`, jamais dans un gris de mention.
- [x] **Pas de mise en page centrée symétrique** — tout est aligné à gauche. Le bloc de date est un champ de saisie, donc il a un bord gauche, donc il est aligné à gauche.
- [x] **Pas d'illustration d'appoint** — pas d'icône de fichier, pas de pictogramme de partage dans un cercle, pas de liste des applications de partage du système.
- [x] **Pas d'une seule famille de police** — `--font-texte` `Archivo` pour le texte, `--font-identifiant` `IBM Plex Mono` `15px` pour `D-2026-016`.

**Choix assumé et non neutre** : **le sélecteur de partage du système n'est pas proposé, il est invoqué.** L'écran ne montre pas une liste d'applications — Courriel, Messages, Fichiers, AirDrop — parce que cette liste est une interface de tiers, dont la disposition change selon la tablette de Jean-Luc, et dont l'entrée la plus tapée dans une cave est celle qu'il croit habituelle. `Partager le PDF` produit le fichier et **invoque le sélecteur du système**, une fois, sans choix préalable. L'application ne prétend donc pas savoir où le fichier est allé, et elle ne l'écrit pas : elle écrit ce qu'elle sait, qui est que Jean-Luc déclare une date.

---

## 3. Anatomie

```
┌─────────────────────────────────────────┐
│ ▓▓ la feuille SORTIE reste visible ▓▓  │
├─────────────────────────────────────────┤
│ FEUILLE PARTAGE — 50 % de l'écran      │
│                                         │
│  Partager le devis D-2026-016 en PDF.   │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │ DATE DÉCLARÉE                     │  │
│  │  11 avril 2026                    │  │  ← modifiable
│  └───────────────────────────────────┘  │
│                                         │
│  ▌ Cette date est celle que vous       │  ← liseré 4px
│  ▌ déclarez. Aucune application        │    bleu d'encre
│  ▌ ne la confirmera.                   │
│                                         │
│  ── ÉTAT `declaration` ──────────────   │
│  ▌ Parti en PDF partagé          32px   │
│  ▌ Le 11 avril, date déclarée par      │
│  ▌ vous. Rien ne l'a confirmée.        │
│                                         │
│  [ Partager le PDF ]                   │
│  [ Fermer ]                             │
└─────────────────────────────────────────┘
```

| # | Composant | Rôle | Source |
|---|---|---|---|
| 1 | `FeuillePartage` variante `seule` | partager un devis signé en PDF, et faire dire par Jean-Luc la date qu'il déclare partie | design-system § 2 |
| 2 | `ChampTexte` variante `saisie` | la date déclarée, **modifiable** et pré-remplie au jour | design-system § 2 |
| 3 | `EtatSortie` variante `bloc` état `declaration` | la mention `Parti en PDF partagé` et sa preuve `3a` | design-system § 2 |
| 4 | `Bouton` variante `plein` taille `grande` | `Partager le PDF`, à `--hauteur-action-primaire` `60px` | design-system § 2 |
| 5 | `Bouton` variante `discret` | `Fermer`, retour à `sortie` puis à `devis-detail` | design-system § 2 |
| 6 | **Sélecteur de partage du système** | invoqué par le bouton, jamais listé dans l'application | slice-local : le sélecteur appartient au système, C11 |

---

## 4. États — tous, sans exception

| État | Déclencheur | Rendu | Feedback utilisateur |
|---|---|---|---|
| **Chargement** | Ouverture de la feuille | **Aucun squelette.** Le champ de date est pré-rempli immédiatement à la date du jour, par l'horloge : un champ vide en attendant une réponse de quelque chose obligerait Jean-Luc à attendre pour rien. | rien |
| **Rempli** | Ouverture depuis `sortie`, devis signé | `Partager le devis D-2026-016 en PDF.` Puis le champ de date, pré-rempli `11 avril 2026`, puis l'avertissement, puis le bouton `Partager le PDF` en `Bouton` `plein` taille `grande`. | — |
| **Vide — jamais visité** | — | **N'existe pas, et c'est un choix :** cette feuille ne s'ouvre que depuis un devis signé, donc elle n'a jamais été « vide ». Le moteur de rendu ne définit pas cet état ici, et cette absence est écrite pour qu'on ne l'implémente pas. | — |
| **Vide — aucune donnée** | — | **N'existe pas également**, pour une raison plus forte : un partage en PDF n'a besoin **ni** d'adresse, **ni** de réseau, **ni** d'information venue du serveur. C'est la seule sortie du produit qui fonctionne avec un champ entièrement vide. Si cet écran pouvait être vide, ce serait parce qu'une information manquait — et aucune n manque. | — |
| **Erreur de chargement** | Le devis signé n'est pas lisible, ou son empreinte est absente | **La feuille ne s'ouvre pas.** Un PDF produit depuis un devis dont le texte signé n'est pas disponible produirait un document dont personne ne peut dire ce qu'il couvre. `devis-detail` affiche alors `BandeauMessage` en état `echec` : `Ce devis signé n'est pas lisible sur cet appareil. Aucun PDF ne peut être produit.` | bandeau `--color-expire-fond` `#F4DED8`, il ne s'efface pas |
| **Erreur de soumission** | Le fichier PDF ne peut pas être produit, ou le sélecteur du système est fermé sans partage | Deux rendus distincts. **Si le PDF ne peut pas être produit** : `BandeauMessage` en état `echec` : `Le PDF n'a pas pu être fait. Le devis n'est pas sorti.` et `Réessayer`. **Si le sélecteur est fermé sans partage** : ce n'est pas une erreur, c'est une décision de Jean-Luc, donc **aucun bandeau, aucun message, aucune erreur** — l'écran revient à son état de départ avec la date déclarée inchangée, et rien n'a été écrit. **Le devis n'est jamais marqué `Parti en PDF partagé` tant que le partage n'a pas eu lieu.** | bandeau `echec` seulement dans le premier cas |
| **Succès** | Le partage a eu lieu et la date est déclarée | État `declaration` : `Parti en PDF partagé` en `--text-montant` `32px`, puis `Le 11 avril, date déclarée par vous. Rien ne l'a confirmée.` Le bouton devient `Fermer`. **La mention ne s'affiche jamais en vert**, et le mot `confirmé` n'apparaît dans aucune ligne de cet écran : rien n'a confirmé. | — |
| **Hors-ligne / permissions** | Mode avion, en cave | **Cet écran est le seul qui n'a rien à signaler.** Le partage en PDF ne demande aucun réseau (C1, US-4). Il n'y a donc pas de bandeau, pas d'icône, pas de texte sur le réseau — **pas même une mention de son absence**, parce qu'une mention de l'absence du réseau ici ferait croire que le partage en dépend. | rien, et c'est le rendu correct |
| **Lecture seule** | La date a déjà été déclarée et le devis est `declaration` | Le champ de date passe en `desactive` : fond `--color-surface-sunken` `#E2DAC9` à 60 %, texte `--color-texte-desactive` `#8B8272`. **Aucune seconde déclaration n'est possible** : changer la date après coup reviendrait à réécrire un fait, et un fait que Jean-Luc a déclaré ne se réécrit pas. L'écran n'affiche que la mention et sa preuve. | — |

> Un état non décrit est un état non implémenté.

---

## 5. Interactions

| Élément | Événement | Comportement | Feedback visuel | État résultant | ID |
|---|---|---|---|---|---|
| Champ de date | tap | Ouvre un sélecteur de date **natif, mais borné** : aucune date postérieure à aujourd'hui, et aucune date antérieure à la date écrite sur le devis. Une date postérieure serait une date qui n'a pas eu lieu ; une date antérieure antidaterait un document. | anneau `--color-bordure-focus` `#8A4A0E` `3px` | `rempli` | B8, B12 |
| Champ de date | saisie | La date saisie est **la date déclarée**, et elle est conservée telle quelle. Aucun recalcul, aucune correction, aucune mise à jour « pour être à jour ». | — | `rempli` | B8 |
| Bouton `Partager le PDF` | tap | Produit le PDF du devis signé depuis le texte figé par l'empreinte — **le PDF porte l'empreinte et l'horodatage de la signature**, pas l'heure du partage. Puis invoque le sélecteur du système, une fois. Un second appui ne produit pas un second appel. | état `chargement`, libellé `Partage en cours…` | `declaration` | B8, B10 |
| Sélecteur du système, partage annulé | geste | Revient à l'état de départ, **sans message et sans erreur** : Jean-Luc a changé d'avis, et une annulation de sa part n'est pas une panne. | aucun | `choix` | — |
| Sélecteur du système, partage effectué | — | L'application **n'apprend pas** où le fichier est allé. Elle enregistre la date déclarée et passe à `declaration`. | mention `Parti en PDF partagé` | `declaration` | B8 |
| Bouton `Fermer` | tap | Ferme cette feuille, puis `sortie`, puis revient à `devis-detail`, où la mention est désormais `Parti en PDF partagé` avec sa preuve. | — | `devis-detail` | B8 |
| Geste vers le bas | geste | Ferme la feuille sans partager. **Aucun message**, comme pour l'annulation du sélecteur : rien n'a eu lieu, donc rien n'a à être dit. | — | `sortie` | — |
| Feuille `sortie` en dessous | tap | **Elle ne répond pas** tant que cette feuille est ouverte : deux feuilles modales empilées ne se pilotent pas l'une l'autre. L'écran du dessous est visible et lisible, mais inerte. | — | — | — |

- **Focus / clavier** : ordre — champ de date, `Partager le PDF`, `Fermer`. Sur `--bp-poste` et `--bp-large`, `role="dialog"` `aria-modal="true"`, focus piégé. Le champ de date est un `input type="date"` étiqueté `Date déclarée`, avec une description `aria-describedby` qui pointe vers l'avertissement : le lecteur d'écran doit lire **la nature de la date** avant la date.
- **Gestes** : le geste vers le bas ferme la feuille sans partager. **Aucun geste ne partage un PDF** : un partage est un acte dont Jean-Luc doit connaître la date, donc il ne peut pas être produit par un geste qu'il ne voit pas.
- **Animations** : ouverture et fermeture, `320ms`, `--ease-entree` `cubic-bezier(0, 0, 0, 1)` et `--ease-sortie` `cubic-bezier(0.3, 0, 1, 1)`. **L'apparition de la mention de sortie dure zéro milliseconde**, comme toute mention d'état : un fondu invite à regarder pendant la transition, donc à douter de ce qu'on a vu. **La production du PDF n'affiche aucune progression** : un pourcentage serait un chiffre que le produit n'a pas, exactement comme sur `PanneauExport`.
- **Retour arrière** : intercepté, traité comme le geste vers le bas, donc comme une fermeture sans partage. **Aucun message d'erreur** : rien n'a eu lieu.

---

## 6. Responsive

| Breakpoint | Comportement | Ce qui se replie / disparaît |
|---|---|---|
| **Mobile** `--bp-telephone` 0 — 479px | Feuille de 50 % de la hauteur, rayon `--radius-lg` `16px`, pleine largeur. Le champ de date est en `ChampTexte` `normale`, hauteur `--hauteur-cible` `56px`. `Partager le PDF` est en `Bouton` `grande`, hauteur `--hauteur-action-primaire` `60px`, pleine largeur moins `--space-lg` `16px` de chaque côté, dans `--zone-pouce` `96px`. | rien |
| **Tablet** `--bp-tablette` 480 — 1023px | Feuille de 45 % de la hauteur. Le champ de date passe à `ChampTexte` `grande`, `72px`, parce que c'est un appareil qu'on tend au client et où la date doit être lisible de loin. Les deux boutons sont côte à côte : `Partager le PDF` en `plein` à gauche, `Fermer` en `discret` à droite. | rien |
| **Desktop** `--bp-poste` 1024 — 1439px | Feuille centrée, largeur limitée à `--space-3xl` `48px` de marge de chaque côté, hauteur 33 %. Le devis signé reste visible à gauche. | rien |
| **Large** `--bp-large` 1440px et plus | Identique à `--bp-poste`. | rien |

- **Cible tactile** : `--hauteur-cible` `56px` pour le champ de date sur téléphone, `--hauteur-action-primaire` `60px` pour `Partager le PDF`. **L'avertissement n'est pas cliquable** et ne l'est pas non plus sur tablette : c'est une phrase à lire, et un avertissement qu'on peut dissimer d'un tap n'est plus un avertissement.
- **Débordement** : **aucun défilement horizontal.** La feuille a quatre lignes de texte ; rien n'a à défiler, ni à une largeur ni à l'autre. La date est écrite en toutes lettres — `11 avril 2026`, jamais `11/04/26` — donc sa largeur est stable et connue, et elle ne peut pas faire bouger la mise en page selon la valeur.

---

## 7. Accessibilité

- [ ] **Contraste du texte courant** : mesuré par `node "$FORGE/scripts/design-check.js" contrast <anchor>`. **Aucun ratio n'est écrit ici** (design-system § 0.0).
- [ ] **Contraste des grands textes** : mesuré par le même contrôle, sur `--text-montant` `32px` et `--text-h2` `23px`.
- [ ] **Navigation clavier complète** sur `--bp-poste` et `--bp-large`, focus piégé dans la feuille.
- [ ] **Focus visible** : anneau `--color-bordure-focus` `#8A4A0E`, `--stroke-focus` `3px`, plus le halo `--color-teinte-survol` `#E4DCCB` à l'état `focus` de `ChampTexte`. Jamais supprimé.
- [ ] **ARIA** : la feuille est `role="dialog"` `aria-modal="true"`, étiquetée `Partager le devis D-2026-016 en PDF`. L'avertissement est un `role="note"` rattaché au champ par `aria-describedby` : il n'est pas une note de bas de page visuelle seulement, il est **dans le nom accessible du champ**. La mention de sortie est `role="status"` `aria-live="polite"` avec le texte complet, mention et preuve. Le champ expose `aria-label="Date déclarée du partage"` et `aria-describedby` pointant vers l'avertissement.
- [ ] **Texte alternatif** : aucune image. **Le PDF produit n'est pas montré en vignette** — donc il n'y a rien à légender, et le document que Jean-Luc veut regarder est celui qu'il a dans les mains.
- [ ] **Langue et direction de lecture** : `lang="fr"`, `dir="ltr"`. La date est en toutes lettres et le mois n'est jamais abrégé en code, pour qu'elle se lise à voix haute au téléphone.

---

## 8. Données

| Champ | Type | Origine | Requis | Erreur possible |
|---|---|---|---|---|
| `devis.signature.empreinte` | texte `4f2a…9c1d` | magasin local | oui | absente : la feuille ne s'ouvre pas, c'est B9 |
| `devis.texte-signé` | texte intégral figé | magasin local | oui | jamais reconstruit : le PDF porte le texte qui a été signé, pas celui du jour |
| `pdf.date-déclarée` | date | **saisie de Jean-Luc**, pré-remplie au jour | oui | date future refusée, date antérieure à l'écriture du devis refusée ; dans les deux cas, le message dit quoi faire : `La date ne peut pas être dans le futur.` |
| `pdf.etat` | énumération `choix` \| `declaration` | magasin local | oui | `declaration` sans date déclarée **est refusé à la lecture** : un état sans la date qui le fonde ne prouve rien |
| `pdf.partage-effectué` | booléen | sélecteur du système | oui | `false` tant que le sélecteur n'a pas confirmé : le devis n'est jamais marqué sorti avant que le partage ait eu lieu |

- **Chargement** : **aucun chargement réseau, à aucun moment.** Le PDF est produit sur l'appareil depuis le texte figé par l'empreinte. C'est la seule sortie du produit qui soit entièrement locale, et c'est ce qui rend `US-4` possible dans une cave.
- **Cache / hors-ligne** : **l'écran est entièrement hors-ligne et ne le signale pas** (C1). Il n'a pas d'état réseau, donc pas de bandeau, pas d'alerte, pas de mention d'absence de réseau — le dire ici laisserait croire que le partage en dépend.
- **Données sensibles** : le PDF contient le devis complet, donc les données personnelles du client (C11). Il **reste sur l'appareil** tant que Jean-Luc ne le partage pas, et l'application **n'apprend pas** la destination : elle ne reçoit du sélecteur du système qu'un fait binaire — partagé ou non. Aucun journal d'audit ne contient le contenu du PDF ni le nom du destinataire choisi dans le sélecteur ; le journal enregistre le numéro du devis, la date déclarée et l'horodatage.

---

## 9. Traçabilité

| ID | Origine | Manifestation sur cet écran |
|---|---|---|
| B8 | PRD | Le partage en PDF est **une sortie distincte** de l'envoi par courriel, avec sa propre mention et sa propre preuve. Le champ de date est modifiable, et l'avertissement `Cette date est celle que vous déclarez. Aucune application ne la confirmera.` est écrit dans l'écran, au-dessus du bouton. |
| B9 | PRD | La feuille ne s'ouvre que depuis un devis signé. Aucun PDF ne peut être produit d'un devis sans signature ni d'un devis dont l'empreinte est absente. |
| E1 | PRD | **Hors-ligne, cet écran n'a rien à signaler** — c'est son état normal et le seul. Il ne dépend d'aucun réseau, donc il n'affiche ni bandeau, ni icône, ni texte sur la couverture. |
| E3 | PRD | Sans objet ici — ce cas concerne l'envoi par courriel, qui est traité sur `sortie`. La feuille reste empilée au-dessus, visible et lisible. |
| C1 | PRD | Le partage en PDF est la seule sortie qui fonctionne sans réseau, et l'écran ne prétend pas le contraire. |
| C11 | PRD | **Aucun journal** du contenu du PDF, du nom du destinataire choisi dans le sélecteur du système, ni de la destination. L'application n'apprend qu'un fait binaire. |
| C7 | PRD | Aucun mot sur la comptabilité. |
| C8 | PRD | **Le PDF ne porte aucune mention d'encaissement par carte**, ni lien de paiement, ni RIB, ni prix de prestataire. Le prix du paiement par carte est écrit dans `reglages` avec son montant en euros ; il n'est ni dans l'application, ni dans le document. |

---

## 10. Checklist de gate

- [x] Les états sont décrits avec un rendu concret. Les deux états vides sont **écrits comme absents**, et l'un des deux porte sa raison : le partage en PDF n'a besoin d'aucune information venue de l'extérieur.
- [x] Chaque élément interactif a un comportement et un feedback — y compris l'annulation du sélecteur du système, qui est **sans message**, et c'est écrit.
- [x] Le responsive est défini à **chaque** breakpoint, avec la hauteur de champ qui change sur tablette parce que c'est l'appareil que Jean-Luc tend.
- [x] La section Anti-générique est cochée et justifiée. Le choix de ne pas lister les applications de partage est le choix contestable de cet écran, et il est justifié.
- [x] Aucune valeur de design n'est laissée à « à définir ».
- [x] Chaque ID B*/E*/C* de cet écran apparaît en section 9 : B8, B9, E1, E3, C1, C7, C8, C11.
- [x] Aucun gabarit non résolu.
- [x] L'écran reste cohérent avec `.forge/design/design-system.md`.