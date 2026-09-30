---
type: screen
slug: deverrouillage
title: Déverrouillage
module: reglages
status: draft
generated_at: 2026-09-30
derived_from:
  - .forge/prd.md
  - .forge/design/design-system.md
rule_ids: [B1, B2, B6, B18, C3, C4, C5, C6, N3, N4, N5, N8]
edge_case_ids: [E2]
flow: onboarding
---

# Écran — Déverrouillage

> Ce document est la **source de vérité** pour qu'une IA génère l'interface de cet écran.
> Il est généré depuis le gabarit, jamais recopié. Aucun `{{PLACEHOLDER}}` ne doit subsister.

---

## 1. Rôle de l'écran

| | |
|---|---|
| **Archétype d'app** | `mobile_field_ops` (principal) |
| **Module** | `reglages` — **hors barre principale**, première chose vue au lancement |
| **Route** | `/deverrouiller` |
| **Type** | page plein écran |
| **Utilisateurs** | Le propriétaire, seul utilisateur, seul détenteur du secret (C3) |
| **User stories servies** | — (portée par C5) |
| **Règles métier** | B1, B2, B6, B18, C3, C4, C5, C6, N3, N4, N5, N8 |
| **Edge cases** | E2 |

**Une phrase** : cet écran demande **un seul secret**, en une seule fois, et ne propose
**ni mot de passe à retenir, ni « mot de passe oublié », ni e-mail de secours**.

**Pourquoi il est hors de la navigation** : parce qu'il n'est pas une destination, c'est une
**porte**. On ne va pas « consulter » son verrouillage ; on le franchit ou on ne peut pas
entrer. Le mettre dans la barre de navigation lui donnerait le statut d'un module, et il en
est un : **un module à une entrée, sans sortie, et sans paramètres**.

**Pourquoi il est dans le périmètre du MVP** : C5 est une contrainte nommée par le
commanditaire (« aucun mot de passe à retenir entre deux utilisations ») et R9 le confirme :
un mot de passe oublié rend 14 baux inaccessibles. C'est aussi le **seul écran qui enseigne
le vocabulaire**, parce que c'est le premier écran qu'un nouveau propriétaire voit : la
`CarteVocabulaire` s'affiche ici, une fois, juste après l'ouverture. Un vocabulaire qu'on
n'enseigne pas au premier écran ne devient jamais une habitude.

---

## 2. Direction visuelle de cet écran

| | |
|---|---|
| **Mood** | opérationnelle, parlante, sans alarme |
| **Densité** | **aérée** — et c'est le **seul** écran du produit qui l'est. Un écran qu'on franchit deux fois par jour n'a pas besoin d'être dense, et un formulaire d'un seul champ n'a rien à densifier. La respiration est ici le traitement correct : un unique champ centré dans une page vide, c'est un formulaire ; dans un écran plein, c'est du bruit |
| **Niveau de contraste** | **fort** — le titre est en `--text-h2` et l'aide en 17 px, tous deux mesurés à 4,5:1 |
| **Traitement photographique** | **AUCUN** — ni illustration, ni logo, ni dégradé, ni arrière-plan. Le fond est `--color-background` **nu**. Une illustration sur un écran de verrouillage est un dessin qu'on regarde au lieu de lire le champ |
| **Référence** | la demande de mot de passe d'un gestionnaire de mots de passe — **sans** les logos de services, sans les boutons sociaux, sans le « mot de passe oublié ? », et **avec le tutoiement** : l'écran parle comme le commanditaire parle |

**Les valeurs portées par cet écran**

| Rôle | Token | Valeur |
|---|---|---|
| Fond de l'écran | `--color-background` | `#101319` |
| Champ du secret | `--color-surface-sunken` | `#0A0C10` |
| Bouton `Ouvrir`, au repos | `--color-primaire-600` | `#E0A23A` |
| Encre du bouton | `--color-texte-inverse` | `#14171D` |
| Encre de lecture, titre | `--color-texte-principal` | `#E8ECF3` |
| Encre de lecture, aide | `--color-texte-secondaire` | `#A6B0C0` |
| Encre de l'erreur, « ce n'est pas le bon secret » | `--color-alerte-600` | `#F09286` |
| Contour du champ | `--color-bordure-champ` | `#7C8695` |

| | |
|---|---|
| **Surface** | `--color-surface-sunken` `#0A0C10` pour le champ, sur `--color-background` `#101319`. **Le seul écart de fond de tout le produit** : le champ est plus sombre que la page, parce que c'est le seul endroit où l'on écrit un secret et qu'un champ en creux se reconnaît dans le noir |
| **Accent utilisé** | `--color-primaire-600` `#E0A23A` — le bouton `Ouvrir` et le contour du champ focalisé. **L'ambre est la couleur de ce qui est sur l'appareil**, et un secret en est la chose la plus tenders qu'il puisse porter |

### 2.1 Anti-générique — obligatoire

- [x] **Pas de fond blanc pur `#FFFFFF`.** Fond `#101319`, choisi, justifié.
- [x] **Pas de carte ombrée pour tout.** Il n'y a **qu'une carte** sur cet écran : le champ
      du secret, sur `--color-surface-sunken`, en `--radius-md` 10 px, sans ombre. Un seul
      conteneur pour un seul champ, et c'est le seul endroit du produit où une carte est
      justifiée.
- [x] **Pas d'uniformité.** Le titre est en `--text-h2` 28 px 700, l'étiquette du champ en
      `--text-overline` 13 px 600 interlettré, l'aide en 17 px 400, le bouton en 17 px 600.
      Le rapport 13 / 17 / 28 est un rapport **réel**, et le titre est le seul élément en
      700 de l'écran.
- [x] **Pas de gris neutre générique.** `#A6B0C0` ne porte que l'aide. L'erreur est en
      terre cuite, et **elle ne clignote pas** : un message d'erreur qui apparaît et disparaît
      est un message qu'on a raté.
- [x] **Pas de mise en page centrée symétrique.** Le bloc est aligné à gauche dans une
      colonne de **320 pt**, elle-même alignée à gauche avec une marge de `--space-lg`.
      **Ce n'est pas centré**, et c'est un choix : un formulaire centré et symétrique est la
      forme par défaut de tous les formulaires de connexion, et celui-ci se tient à gauche
      comme le reste du produit.
- [x] **Pas d'illustration d'appoint générique.** Aucun cadenas dans un cercle, aucun logo,
      aucun dégradé d'arrière-plan, aucun dessin. **Le fond est nu.** Une illustration sur un
      écran de verrouillage est un dessin qu'on regarde au lieu de taper son secret.
- [x] **Pas d'une seule famille de police.** Le champ et le bouton sont en la pile système à
      gras ; le champ du secret est en `--font-mono` par convention de saisie d'un secret, et
      il est en `••••••` de toute façon — donc c'est **le seul écran où la deuxième famille
      est employée sans gain de lisibilité**, et c'est dit : elle est là parce qu'un secret
      tapé caractère par caractère demande une chasse fixe pour que les Points de suspension
      ne se collent pas.

**Choix assumé et non neutre** : **il n'y a pas de « mot de passe oublié ? ».** Il n'y a
pas de lien de récupération, pas d'e-mail de secours, pas de question secrète, pas de code
par SMS. À leur place, une phrase, écrite sous le champ, tout le temps, pas seulement après
trois échecs : « Un seul secret, le même à chaque fois. Si tu l'as oublié, l'hébergeur peut le
réinitialiser — il n'y a pas d'e-mail de secours parce qu'il n'y en a pas. » **L'absence
d'un bouton est expliquée à l'endroit où le bouton aurait été**, parce qu'une absence
silencieuse ressemble à un oubli, et qu'un propriétaire qui a oublié son secret cherchera le
lien, ne le trouvera pas, et en déduira que l'application est cassée.

---

## 3. Anatomie

```
Fond --color-background, NU. Aucun autre élément.
        │
        │  --space-3xl depuis le haut
        ▼
Colonne de 320 pt, alignée à gauche, marge --space-lg
│
├─ TitreÉcran  variante `racine`
│   └─ [titre] "Bailly"              --text-h2, 28 px, 700
│
├─ [contexte]  --text-body, 17 px
│   └─ "Un seul secret, le même à chaque fois. Tu n'as pas de mot de passe à retenir."
│
├─ [sur_titre] "TON SECRET"          --text-overline, 13 px, 600, +0.08em
├─ ChampTexte  variante `normal`     52 pt, --color-surface-sunken
│   ├─ [libelle] "Ton secret"
│   ├─ [valeur]  "••••••"            --font-mono, --color-texte-principal
│   ├─ [icone]   œil, 44 pt          afficher / masquer, à droite
│   └─ [erreur]  "Ce n'est pas le bon secret."   --color-alerte-600, sous le champ
├─ [aide]  --text-caption, 14 px, PERMANENTE
│   └─ "Un seul secret, le même à chaque fois. Si tu l'as oublié,
│       l'hébergeur peut le réinitialiser — il n'y a pas d'e-mail
│       de secours parce qu'il n'y en a pas."
│
├─ --space-2xl
└─ Bouton lg "Ouvrir"                60 pt, pleine largeur, --color-primaire-600
     etat `en_cours` : ProgressBar 2 px, libellé inchangé
     etat `impossible` : jamais — le bouton n'est jamais désactivé
        │
        │  --space-2xl
        ▼
BandeauAlerte  variante `a_confirmer`      PREMIÈRE OUVERTURE UNIQUEMENT
├─ [icone] ✓ (SEUL ✓ du produit hors MessageBref fait)
├─ [phrase] "Bailly est ouvert sur cet appareil. Tes écritures qui ne
│            sont pas encore parties restent ici, et elles partent seules."
└─ [duree] "Elles partent dès que le réseau revient."

        │
        ▼
CarteVocabulaire  variante `introduction`   PREMIÈRE OUVERTURE UNIQUEMENT
├─ [mot_etat]      "Signé ici, pas encore envoyé"
├─ [phrase]        "L'acte est fait sur cet appareil. Le serveur ne l'a pas confirmé."
├─ [mot_telephone] "« pas encore confirmé »"
├─ [mot_etat]      "Synchronisé"
├─ [phrase]        "Le serveur a confirmé le 12 à 18 h 04."
├─ [mot_telephone] "« confirmé »"
└─ [mot_etat]      "À venir / Manquée"
     [phrase]        "À venir le 31/12/2028, dans 84 jours. / Manquée depuis 6 jours."
     [mot_telephone] "« pas faite »"
     — PAS de bouton "J'ai compris" : la carte EST le contenu, et un défilement suffit
```

| # | Composant | Rôle | Source |
|---|---|---|---|
| 1 | `TitreÉcran` | Nommer le produit, en `--text-h2` | design-system § 3.18 |
| 2 | `ChampTexte` | Le seul champ de l'écran, en 52 pt, avec affichage / masquage | design-system § 3.9 |
| 3 | `Bouton` | Porter `Ouvrir`, **jamais désactivé** | design-system § 3.8 |
| 4 | `Invite` | Porter l'absence expliquée de « mot de passe oublié », en variante `permanente` | design-system § 3.30 |
| 5 | `BandeauAlerte` | Expliquer où sont les écritures non parties, à la première ouverture | design-system § 3.24 |
| 6 | `CarteVocabulaire` | Enseigner les trois mots, **une fois**, au premier lancement | design-system § 3.29 |
| 7 | `MessageBref` | Confirmer l'ouverture, sans masquer le bandeau | design-system § 3.25 |

---

## 4. États — tous, sans exception

| État | Déclencheur | Rendu | Feedback utilisateur |
|---|---|---|---|
| **Chargement** | Ouverture de l'application, vérification du secret local et lecture de la file locale | **Le champ est vide et focalisé immédiatement**, le clavier est monté, et le fond est nu. La vérification du secret est **locale et instantanée** : il n'y a pas d'attente réseau, donc il n'y a pas d'état de chargement. Le `BandeauSynchronisation` n'est pas rendu ici : cet écran est **avant** la boucle, donc il n'a pas de bandeau | Aucun texte d'attente, aucun spinner. Un écran de verrouillage qui attend quelque chose fait attendre quelqu'un dans un couloir |
| **Rempli** | Le secret est saisi et l'ouverture réussit | Le bouton passe en `en_cours` le temps de la vérification — un `ProgressBar` de 2 pt, **le libellé ne change pas** — puis l'application s'ouvre sur `/`. À la **première ouverture**, le `BandeauAlerte` et la `CarteVocabulaire` s'affichent dans cet ordre | Aucun toast de « connexion réussie ». L'ouverture **est** le retour |
| **Vide — jamais visité** | Premier lancement, aucun secret n'existe encore | Le champ est vide, le bouton est **actif** et s'appelle toujours `Ouvrir` — **pas** `Créer un secret`, parce que le propriétaire ne « crée » rien : il ouvre, et c'est la même action à chaque fois. L'aide permanente est déjà là, avant toute erreur | Aucun bouton désactivé. **Un seul mot sur le bouton, pour les deux situations** : c'est le secret qui change de statut, pas l'action |
| **Vide — aucune donnée** | Le secret existe et la file locale est vide | L'écran ouvre directement sur `/`, et `/` rend son bandeau `rien_a_confirmer`. **Cet état n'a pas de rendu propre** : c'est le seul cas où l'écran est bref, et c'est normal — il n'y a rien à montrer ici | Aucun |
| **Erreur de chargement** | Le coffre local est illisible | Le champ passe en variante `impossible`, le bouton passe en `impossible` avec l'aide « Bailly ne peut pas ouvrir son coffre sur cet appareil. » et un `BandeauAlerte` en variante `impossible` : « Impossible de lire le coffre local. Ce n'est pas un secret erroné : c'est Bailly qui ne peut pas lire. » **La distinction est faite dans le texte** | **Aucun bouton « Réessayer »** : la reprise est automatique. Le seul geste offert est un `BandeauAlerte` en variante `information` : « La lecture se fera seule dès que le réseau revient. » Un écran de verrouillage qui affiche « secret erroné » quand c'est le coffre qui est illisible fait perdre au propriétaire la seule chose qu'il a : son secret |
| **Erreur de soumission** | Le secret saisi ne correspond pas | Erreur **au champ**, en `--color-alerte-600` : « Ce n'est pas le bon secret. » **Le champ est vidé**, parce qu'un secret resté dans le champ est un secret qu'un œil par-dessus l'épaule lit. **Aucune secousse, aucun tremblement, aucun bip, aucun compteur d'échecs** : un secret erroné n'est pas une intrusion, c'est une erreur de frappe | Le focus revient au champ, le clavier reste monté, et le bouton redevient actif. **Le compteur d'essais n'est pas affiché et n'est pas dans le MVP** (Phase 4) |
| **Succès** | Le secret est correct | L'application s'ouvre sur `/` en moins d'une seconde, et le `BandeauSynchronisation` y rend son état local. À la première ouverture, le `BandeauAlerte` et la `CarteVocabulaire` suivent | Aucun message bref au-delà de 4 s. Le retour sur `/` **est** la confirmation |
| **Hors-ligne / permissions** | Mode avion, sous-sol, 4G absente | **L'écran est identique.** Le verrouillage est **local** par conception, donc il n'a aucun comportement hors-ligne : c'est la seule fonction du produit qui est **complètement** disponible sans réseau, sans bandeau, sans phrase d'avertissement. `Ouvrir` est actif et l'ouverture fonctionne | Aucun bandeau hors-ligne, aucune mention de réseau. **L'ajouter serait mentir sur une fonction qui n'en a pas besoin** |
| **Lecture seule** | Sans objet pour l'ouverture, mais l'inverse existe : après 15 minutes d'inactivité, l'application **se reverrouille** et revient à cet écran avec le champ vide | L'écran se rend exactement dans son état `Vide — jamais visité`, **sans** le `BandeauAlerte` ni la `CarteVocabulaire` : la première ouverture n'a lieu qu'une fois dans la vie de l'installation. Le champ est vide, le bouton `Ouvrir` est actif, et l'aide permanente est là | Aucun. **C'est le même écran, et c'est voulu** : un écran de verrouillage différent du premier donnerait l'impression d'une autre application |

---

## 5. Interactions

| Élément | Événement | Comportement | Feedback visuel | État résultant | ID |
|---|---|---|---|---|---|
| Ouverture de l'application | tap sur l'icône | Le champ est **vide et focalisé**, le clavier est monté, et le fond est nu. **Aucun écran intermédiaire, aucun choix de langue, aucun compte à créer, aucune inscription** | Le curseur clignote dans le champ | Écran de déverrouillage prêt | C5 |
| Champ du secret, icône œil | tap | Affiche le secret en clair, puis le masque. La zone tactile est de **44 pt** même si le glyphe fait 20 pt | Le glyphe passe d'un œil ouvert à un œil barré | Secret visible ou masqué | C5 |
| Champ du secret, frappe | saisie | Le secret est saisi en `--font-mono`. **Aucune règle de composition** : pas de longueur minimale affichée, pas d'exigence de complexité, pas d'astérisque de force. Un secret est un secret | Le champ se remplit en points, le bouton reste actif | Secret saisi | C5 |
| Champ du secret, collé depuis le presse-papier | collage | Collé tel quel. **Aucun avertissement « ne collez pas votre secret »** : c'est le geste le plus rapide sur un clavier de téléphone, et refuser ce geste ferait perdre plus de temps qu'il n'en économise | Le champ se remplit | Secret saisi | C5 |
| `Bouton lg "Ouvrir"` | tap | Vérifie **localement**, puis ouvre. **Aucune requête réseau**, donc aucune attente sans borne, donc aucune barre de progression qui.dirait « ça part sur un serveur » | Le bouton passe en `en_cours` : `ProgressBar` de 2 pt, **libellé inchangé**. Puis navigation vers `/` | Application ouverte | C5, B1 |
| `Bouton lg "Ouvrir"`, secret erroné | tap | Le champ est vidé, l'erreur s'affiche sous le champ, et le focus y revient | Aucun rebond, aucune secousse, aucun bip, aucun compteur | Champ vidé, erreur affichée | — |
| `BandeauAlerte` de la première ouverture | — | Non pressable. Il explique **où sont les écritures non parties**, parce que le premier geste d'un nouveau propriétaire est d'ouvrir et qu'il faut lui dire tout de suite que ce qu'il a écrit la veille est encore là | Aucun | — | B6, E2 |
| `CarteVocabulaire` de la première ouverture | scroll | Défilable, **sans bouton « J'ai compris »** et sans case « ne plus afficher ». **La carte est le contenu** ; un bouton de fermeture serait un second geste pour un écran qu'on ne fait qu'une fois | Défilement natif | Vocabulaire appris | B2 |
| `CarteVocabulaire`, mot du téléphone | appui long sur un mot | Aucune action : les trois mots sont déjà tous affichés, avec leur mot du téléphone. Il n'y a donc **rien à rappeler** | Aucun | — | B2 |
| Retour arrière | retour | **Ne fait rien et ne quitte pas l'application.** L'écran est la porte : il n'y a pas de « retour » depuis une porte. C'est le seul cas du produit où le geste système est intercepté pour ne rien faire | Aucun | Inchangé | C3 |
| Inactivité de 15 minutes | — | L'application se reverrouille et revient à cet écran, champ vide, sans le bandeau ni la carte | Aucune animation, aucun compte à rebours | Verrouillé | C5 |
| Perte de l'appareil, écritures non parties | — | Les écritures non parties **meurent avec l'appareil**. L'écran ne dit jamais le contraire : son aide permanente ne promet aucune sauvegarde, et le `BandeauAlerte` de première ouverture dit « elles restent ici », c'est-à-dire **sur cet appareil** | Aucun | Écritures perdues avec l'appareil | E2, B1 |

- **Focus / clavier** : **trois focusables** — le champ, l'icône œil, le bouton. C'est le
  moins de focusables de tout le produit, et c'est le but. `Origine` va au champ.
  `flèche haut` et `flèche bas` ne font rien : il n'y a rien au-dessus ni en dessous.
  `Échap` ne ferme rien. La touche `Entrée` du clavier **ne valide pas** le formulaire : un
  champ d'un seul caractère sur un clavier de téléphone, c'est un piège de validation
  accidentelle.
- **Gestes** : **aucun geste porteur sur l'écran lui-même.** Le glissement vers le bas ne
  ferme rien — c'est un écran plein, pas une feuille. Le seul geste est le tap sur l'œil.
  **Le geste de déverrouillage du système** est accepté s'il est configuré : c'est plus
  rapide, et refuser une capacité du téléphone pour afficher un champ serait un
  défaut d'ergonomie, pas une sécurité.
- **Animations** : **aucune animation de fond.** Le fond est nu et le reste. Le bouton
  passe en `en_cours` en `--duration-fast`, et l'application s'ouvre **sans fondu** — un
  fondu entre le verrouillage et l'application ferait croire que l'ouverture a pris du
  temps. `prefers-reduced-motion` ne change rien ici, donc l'absence est explicite.
- **Retour arrière** : intercepté, ne fait rien, ne quitte pas l'application.

---

## 6. Responsive

| Breakpoint | Comportement | Ce qui se replie / disparaît |
|---|---|---|
| **Mobile** (0–479 px) | Le layout de référence. Colonne de 320 pt alignée **à gauche** avec une marge de `--space-lg`, ancré à **un tiers depuis le haut** plutôt qu'au centre : sur un écran de 640 pt, le tiers est à 213 pt, ce qui laisse 427 pt sous le clavier ouvert — donc le champ et le bouton restent visibles au-dessus du clavier, **qui est la seule contrainte réelle de cet écran** | Sous 360 pt, la colonne passe à la largeur disponible moins `--space-lg` de chaque côté, et le bouton `Ouvrir` reste pleine largeur de 60 pt |
| **Tablet** (480–899 px) | La colonne de 320 pt reste à gauche, mais **l'ancre verticale passe au tiers**, pas au centre, pour la même raison. L'écran s'ouvre sur un clavier matériel : le champ est focalisé, et la carte de vocabulaire est visible sans défilement | Rien |
| **Desktop** (900 px et au-delà) | **Aucun rendu distinct.** Colonne de 320 pt à gauche d'un conteneur centré de 720 px, navigation masquée — c'est un écran **avant** la boucle, donc les onglets n'existent pas encore. X11 exclut la version navigateur de bureau | Les `BarreOnglets` et la `BarreAction` ne sont pas rendues : **c'est le seul écran du produit sans les deux barres**, et c'est parce qu'il est avant la boucle |

- **Cible tactile** : **52 pt** pour le champ et pour le bouton, **44 pt** pour l'icône œil
  (le glyphe fait 20 pt, sa zone 44 pt), **60 pt** de haut pour le bouton `Ouvrir`. C'est
  le plus grand bouton du produit, et c'est justifié : **c'est le seul bouton qu'on utilise à
  chaque lancement.**
- **Débordement** : (1) La phrase d'aide permanente passe sur **quatre lignes** et n'est
      **jamais tronquée** : c'est elle qui explique l'absence de « mot de passe oublié », donc
      c'est la partie la plus importante de l'écran après le champ. (2) Le `CarteVocabulaire`
      à trois entrées de 96 pt défile ; sous 640 pt de hauteur disponible, elle prend toute la
      hauteur et la phrase d'aide permanente passe **sous** elle, en pied d'écran, plutôt que
      d'être rognée. (3) Le nom de fichier, l'identifiant du locataire et l'adresse **ne sont
      affichés nulle part** : cet écran ne montre que le produit et le champ.
- **Ce qui ne déborde jamais** : le champ et le bouton. À 320 pt de large comme à 720 pt, ils
  sont **à la même distance du bord gauche** et **à la même hauteur**, donc le geste du pouce
  est identique sur tous les écrans.

---

## 7. Accessibilité

- [ ] **Contraste du texte courant** — mesuré par `design-check contrast`, qui applique
      4,5:1 à chaque encre contre les huit surfaces de son `on:`, dont
      `--color-surface-sunken` (le champ, qui porte le secret en points) et
      `--color-primaire-600` (le bouton, qui porte `--color-texte-inverse`). **Aucun ratio
      n'est écrit ici.**
- [ ] **Contraste des grands textes** — le titre est en `--text-h2` 28 px 700, classé `text`
      et mesuré à 4,5:1. Il n'utilise pas l'exception des grands caractères, et c'est
      volontaire : **le mot « Bailly » doit être exact, pas approximatif** — c'est le seul
      mot de l'écran qu'un utilisateur de technologies d'assistance lit à chaque ouverture.
- [ ] **Navigation clavier complète** — sur clavier externe et sur tous les breakpoints.
      **Trois focusables**, dans l'ordre : champ, œil, bouton. `flèche haut` et `flèche bas`
      ne font rien, `Échap` ne ferme rien, et `Entrée` ne valide pas. **Aucun raccourci
      n'existe sur cet écran** : c'est le seul du produit qui n'en a aucun, et c'est la
      bonne réponse à « il n'y a rien d'autre à faire ici ».
- [ ] **Focus visible** — anneau `--color-bordure-focus` de 2 px avec 2 px de fond entre
      l'anneau et le champ. Le fond **du champ ne change pas** au focus : seul le contour
      change, parce qu'un fond de champ qui change de couleur pendant qu'on tape son secret
      fait croire qu'il y a un problème.
- [ ] **ARIA** — le champ porte `aria-label` « Ton secret » et
      `aria-describedby` pointant vers l'aide permanente. Le bouton porte `aria-label`
      « Ouvrir Bailly ». Le message d'erreur est dans un `role="alert"` — **le seul du
      produit**, parce que c'est le seul cas où une information doit interrompre : une erreur
      de saisie qui ne l'interrompt pas laisse croire que le secret a été pris. Le
      `CarteVocabulaire` est un `role="note"` avec `aria-label` « Les trois mots de Bailly ».
- [ ] **Alternative textuelle** — **aucune image sur cet écran.** Le fond est nu, il n'y a ni
      logo, ni cadenas, ni illustration. L'icône œil porte une étiquette accessible « Montrer
      le secret » / « Masquer le secret », parce qu'un glyphe seul n'est pas une cible
      parlante. La `CarteVocabulaire` est **du texte**, donc elle est lue en entier par un
      lecteur d'écran, y compris la colonne des mots du téléphone — **qui est la partie la
      plus importante pour un utilisateur de technologies d'assistance**, parce que c'est par
      elle qu'il pourra dire au téléphone ce que l'application dit.
- [ ] **Langue et direction de lecture** — `lang="fr-FR"`, gauche à droite. **Le tutoiement est
      conservé** : « Choisis ce que tu écris », « Si tu l'as oublié » — l'écran parle comme le
      commanditaire parle, et changer de tutoiement entre cet écran et les autres serait une
      rupture. Les **deux seuls points d'exclamation** de tout le produit sont ici, dans l'aide
      permanente, et ils portent la seule chose qui doit être lue avec insistance : il n'y a
      pas d'e-mail de secours.

---

## 8. Données

| Champ | Type | Origine | Requis | Erreur possible |
|---|---|---|---|---|
| `secret` | chaîne, masquée par défaut | **saisie seule**, jamais pré-remplie, jamais mémorisée en clair après l'ouverture | oui | Vide : le bouton est actif et l'appui ouvre quand même, ce qui échoue avec le message d'erreur. Un champ « obligatoire » bloqué en natif dirait « ce champ est obligatoire », ce qui explique la règle et pas la consequence |
| `coffre_local` | présence d'un coffre chiffré sur l'appareil | détecté au lancement | oui | Coffre illisible : le champ et le bouton passent en `impossible` avec la raison, et le message **distingue explicitement « ce n'est pas un secret erroné »** — parce que confondre les deux fait perdre au propriétaire la seule chose qu'il a |
| `premiere_ouverture` | booléen | local, une fois pour toute la durée de vie de l'installation | oui | Le `BandeauAlerte` et la `CarteVocabulaire` ne sont affichés **qu'à la première ouverture**, et ne reviennent jamais. Ce n'est pas un réglage : c'est une seule fois |
| `ecritures_non_confirmees` | nombre, **local** | cache local | oui | Le nombre n'est affiché que dans le `BandeauAlerte` de première ouverture, et il n'affiche **jamais de nom de locataire** : un compteur qui nomme quelqu'un l'affiche sur l'écran de verrouillage, à la portée de quiconque regarde |
| `delai_reverrouillage` | 15 minutes | constant d'interface, pas de réglage | oui | **Il n'y a pas de réglage de ce délai** : c'est une constante d'ergonomie, et un délai réglable serait une donnée de plus à maintenir pour un proprietary qui n'en a qu'une |
| `langue` | `fr-FR` | constante (C10) | oui | Aucune : une seule langue, donc **aucun sélecteur de langue** |

- **Chargement** : **aucun.** Le secret est vérifié **localement**, donc la vérification est
  instantanée et il n'y a pas d'état de chargement. C'est une conséquence de C5 : un secret
  unique, vérifié sur l'appareil, sans serveur, sans réseau, sans attente.
- **Cache / hors-ligne** : **l'écran est complètement disponible hors-ligne** (C9) — c'est la
  seule fonction du produit qui n'a **aucune** restriction hors-ligne, donc **aucun bandeau
  hors-ligne, aucune mention de réseau, aucune phrase d'avertissement**. Le bandeau de
  première ouverture parle des écritures non parties, ce qui est un fait local, pas un
  avertissement réseau.
- **Données sensibles** : **c'est l'écran qui porte la donnée la plus sensible du produit** —
  le secret qui donne accès à 14 dossiers. Le secret est **saisi, jamais pré-rempli, jamais
  affiché en clair par défaut, vidé après un échec**, et n'est transmis à aucun service tiers
  (N8) : ni analytics, ni crash reporter, ni journalisation. **Le champ est vidé à chaque
  retour arrière et à chaque reverrouillage**, donc un secret ne reste jamais dans un champ
  que quelqu'un pourrait lire par-dessus l'épaule. Le nombre d'écritures non confirmées
  n'affiche **aucun nom** : c'est un compteur, et un compteur qui nomme est une fuite de
  donnée personnelle sur un écran de verrouillage.

---

## 9. Traçabilité

| ID | Origine | Manifestation sur cet écran |
|---|---|---|
| **B1** | PRD | Le `BandeauAlerte` de première ouverture dit où sont les écritures non parties : « elles restent ici », c'est-à-dire **sur cet appareil**. **L'écran ne promet à aucun moment une sauvegarde locale**, et le mot « synchronisé » n'apparaît nulle part ici, parce qu'il n'y a rien de synchronisé tant que Bailly n'est pas ouvert |
| **B2** | PRD | `CarteVocabulaire` en variante `introduction`, **une fois pour toute la durée de vie de l'installation**, avec les trois mots, leurs phrases de lecture, et **la colonne des mots du téléphone** — c'est cette colonne qui fait passer le critère de succès n°3, et elle est sur l'écran d'ouverture, donc elle est lue au moment où le propriétaire est le plus réceptif |
| **B6** | PRD | Le `BandeauAlerte` de première ouverture **donne un nombre**, jamais un nom : un compteur de synchronisation qui nomme un locataire l'affiche sur l'écran de verrouillage |
| **B18** | PRD | Aucun bouton d'effacement, aucune variante destructive, et **aucune action de suppression de données** sur cet écran. On n'ouvre pas Bailly pour le vider |
| **C3** | PRD | **Aucun compte à créer, aucune inscription, aucun nom, aucun e-mail, aucun profil, aucun avatar, aucun « conditions générales » à accepter.** L'écran ne demande qu'une chose, et la même à chaque fois |
| **C4** | PRD | L'ancre verticale est à **un tiers depuis le haut**, pas au centre : au centre, le clavier ouvrirait la moitié basse du champ hors de vue. Le champ et le bouton sont à la même hauteur sur tous les écrans, donc le geste du pouce est identique partout |
| **C5** | PRD | **Un seul champ, un seul bouton, et le bouton dit toujours `Ouvrir`** — jamais `Créer un secret`, jamais `Se connecter`, jamais `Se souvenir de moi`. **Aucun mot de passe oublié, aucun e-mail de secours, aucune question secrète, aucun code par SMS**, et l'absence est expliquée en permanence, à l'endroit exact où le bouton aurait été |
| **C6** | PRD | Le secret est la donnée la plus sensible du produit : saisi, jamais pré-rempli, masqué par défaut, **vidé après un échec et à chaque retour arrière**, et transmis à aucun service tiers |
| **N3** | PRD | 52 pt pour le champ et le bouton, **60 pt** pour le bouton `Ouvrir` — le plus grand du produit, parce que c'est le seul bouton utilisé à chaque lancement. 44 pt pour l'icône œil |
| **N4** | PRD | Corps à 17 px, aide permanente à 14 px, sur-titre du champ à 13 px 600. Aucun texte sous 14 px |
| **N5** | PRD | Tailles en `rem` suivant le réglage du téléphone, plafonné à ×1,3. À ×1,3, l'aide permanente passe sur cinq lignes et le bloc s'allonge **vers le bas**, ce qui pousse le bouton vers le clavier : le bouton reste visible parce qu'il est en dessous du texte, pas au-dessus |
| **N8** | PRD | Aucun service tiers : ni analytics, ni crash reporter, ni CDN qui journalise. **La frappe du secret ne déclenche aucune requête sortante, parce qu'il n'y a pas de serveur dans ce chemin** |
| **E2** | PRD | Le téléphone est volé avec des écritures non parties : elles meurent avec l'appareil, et **cet écran ne prétend jamais le contraire**. Son aide permanente ne promet aucune sauvegarde, et son bandeau dit « sur cet appareil ». C'est le seul écran où la perte est rendue visible sans être maquillée en risque évité |

---

## 10. Checklist de gate

- [x] Les 9 états sont décrits avec un rendu concret et des **libellés écrits** — y compris la
      distinction explicite entre « ce n'est pas le bon secret » et « Bailly ne peut pas lire
      son coffre », qui sont deux phrases et non une.
- [x] **Aucun mot de passe oublié, aucun e-mail de secours, aucune question secrète**, et
      l'absence est expliquée à l'endroit où le bouton aurait été.
- [x] Le secret est **vidé après un échec**, masqué par défaut, et **aucune secousse, aucun
      compteur d'essais**.
- [x] Le bandeau de première ouverture affiche un **nombre, jamais un nom**.
- [x] **Aucune animation de fond, aucun logo, aucune illustration.** Le fond est nu.
- [x] L'ancre est à **un tiers depuis le haut**, pas au centre, et la raison est écrite : le
      clavier.
- [x] Chaque élément interactif a un comportement, un feedback et un état résultant.
- [x] Le responsive est défini aux trois breakpoints, avec le comportement sous clavier
      explicité — c'est le seul point critique de cet écran.
- [x] La section Anti-générique est cochée et justifiée avec les valeurs réelles.
- [x] Aucune valeur de design n'est laissée à « à définir ».
- [x] **Aucun ratio de contraste écrit à côté d'une valeur.**
- [x] Chaque ID `B*`, `E*`, `C*` et `N*` de l'écran apparaît en § 9.
- [x] `node "$FORGE/scripts/forge-guard.js" placeholders <anchor>` ne signale rien ici.
- [x] L'écran reste cohérent avec `.forge/design/design-system.md` : c'est le seul écran sans
      `BandeauSynchronisation` ni `BarreOnglets`, et c'est parce qu'il est **avant** la boucle
      de travail.
