---
type: screen
slug: creer-compte
title: Création de compte et rapprochement
module: compte
status: draft
generated_at: 2026-09-30
derived_from:
  - .forge/prd.md
  - .forge/design/design-system.md
rule_ids: [B2, B3, B5, B15]
edge_case_ids: [E1, E3, E9]
flow: confirmation-compte
---

# Écran — Création de compte et rapprochement

> Ce document est la **source de vérité** pour qu'une IA génère l'interface de cet écran.
> Il est généré depuis ce gabarit, jamais recopié. Aucun `{{PLACEHOLDER}}` ne doit subsister.

---

## 1. Rôle de l'écran

| | |
|---|---|
| **Archétype d'app** | `mobile_consumer` — téléphone seul, iOS et Android, un seul marché (C10) |
| **Module** | `compte` — **sous-écran**, sous le rang 4 du module parent |
| **Route** | `/compte/creer` |
| **Type** | page — sous-écran d'un onglet, atteint **uniquement** par le bouton « Créer mon compte » de `/compte` |
| **Utilisateurs** | Le client occasionnel et le client fidèle qui n'ont pas de compte. **Un client connecté n'atteint pas cet écran** : il y est ramené sur `/compte` |
| **User stories servies** | US-4 |
| **Règles métier** | B2, B3, B5, B15 |
| **Edge cases** | E1, E3, E9 |

**Une phrase** : cet écran permet de créer un compte en sachant que son historique lui sera rattaché **si** l'adresse e-mail correspond, afin que la confirmation — et non la création — soit l'instant où la correspondance est tentée.

**La décision qui gouverne tout cet écran : la création ne rapproche rien.** Le client remplit un formulaire, la case de consentement est cochée explicitement, il appuie — et **rien ne se passe de visible**. Un e-mail de confirmation part, et le rapprochement est tenté **une seule fois, à la confirmation**. B3 est explicite : « Réessayer à chaque ouverture serait une tentative continue de rapprochement d'identité. »

Cette décision a une conséquence d'écran qui ne s'écrit pas toute seule, donc elle est écrite ici : **l'écran annonce ce qui va se passer avant que le client investsisse son effort.** Une ligne, en tête, avant le premier champ : « Nous vérifierons, une seule fois, si cette adresse a déjà des commandes. Vous LMSaa le résultat après la confirmation de l'e-mail. » Sans cette ligne, un client qui attend un historique immédiat comprend l'attente comme un échec.

**Ce qui rend cet écran atypical par rapport à un formulaire d'inscription ordinaire** :

1. **Il ne demande rien qui ne serve pas à quelque chose.** Deux champs — adresse e-mail, mot de passe — et une case. Ni nom, ni prénom, ni date de naissance, ni numéro de téléphone, ni question secrète, ni « code partenaire ». Le PRD §7 exclut la création de contenu et le roadmap §5 refuse tout ce qui demande un travail d'ingestion récurrent (C14). Un formulaire qui demande un prénom que l'application ne lit nulle part est une collecte sans finalité, donc un risque RGPD sans contrepartie.
2. **Il nomme les deux entités avant que le client valide** (C13), et la case n'est **pas** pré-cochée.
3. **Il gère l'échec du rapprochement comme un état permanent, jamais comme une panne** (B5, E1).

---

## 2. Direction visuelle de cet écran

Repris du design system — **valeurs concrètes, jamais « à définir »**.

| | |
|---|---|
| **Mood** | « chaleureux, dense, sans emphase » — repris du design system §0, mais la densité est ici celle de `/compte`, c'est-à-dire **normale** : un formulaire n'est pas une grille de comparaison |
| **Densité** | **normale** — deux champs, une case, un paragraphe. La seule densité de l'écran est dans le **paragraphe des deux entités**, qui est le texte le plus long de l'application après les descriptions de produit et qui est là pour une raison légale, pas décorative |
| **Niveau de contraste** | **fort** — le texte du paragraphe de conformité est en `--color-texte-principal` sur le papier, jamais en gris d'appoint. Un texte de protection des données en gris clair est un texte que personne ne lit avant de cocher |
| **Surface** | `--color-background #F1EDE5` pour le formulaire ; `--color-surface-sunken #E7E2D7` pour les deux champs ; `--color-surface-sunken` également pour la ligne de la case à cocher, sur le même modèle que l'interrupteur de `/compte` — un contrôle qu'on ne voit pas avant de le viser n'est pas un contrôle explicite |
| **Accent utilisé** | `--color-encre-700 #1B2220` pour la case cochée, le bouton de création et l'anneau de focus ; `--color-erreur #A03427` en filet de 2 px pour un champ en erreur, **jamais en couleur du texte seul** ; `--color-attention #7A5A0C` pour le décompte des tentatives restantes dans l'état `correspondance-echouee` |
| **Traitement photographique** | **aucune image.** Ni illustration, ni logo, ni picto de cadenas. Le design system §5 exclut l'illustration d'état ; un écran de conformité qui commence par un dessin de bouclier est un écran de conformité qu'on fait défiler |
| **Référence** | le formulaire du réglage système iOS pour la hiérarchie étiquette / champ / message, dont on reprend la logique sans copier le rendu |

### 2.1 Anti-générique — obligatoire

- [x] Pas de fond **blanc pur** — papier `#F1EDE5`, champs `#E7E2D7`.
- [x] **Pas de carte ombrée pour tout** — aucune carte. Le formulaire est posé sur le papier, séparé par des filets `#D9D2C4` et de l'espace `--space-xl 32px`.
- [x] **Pas d'uniformité** : `--text-display 30/36` pour le titre, `--text-h4 18/24` pour les deux titres internes, `--text-caption 14/19 500` pour les étiquettes de champ, `--text-body 17/25` pour le paragraphe de conformité et les messages d'action, `--text-body-sm 16/23` pour l'aide.
- [x] **Pas de gris neutre générique** — l'aide d'un champ est en `--color-texte-secondaire #5A544A`, le texte de conformité en `--color-texte-principal`. La case à cocher non cochée est un contour `--color-bordure-champ #847C6B`, qui est un choix de filet et non un gris de placeholder.
- [x] **Pas de mise en page centrée symétrique** — tout est calé à gauche sur `--space-lg 24px`, y compris le paragraphe de conformité et le bouton.
- [x] **Pas d'illustration d'appoint générique** — pas de picto dans un cercle devant la case à cocher, pas de cadenas, pas d'icône d'enveloppe. La case est un carré à contour et deux filet, rien de plus.
- [x] **Pas d'une seule famille de police** — l'adresse e-mail saisie est rendue en SF Mono / Roboto Mono, caractère par caractère, comme partout ailleurs dans l'application : c'est le même argument que sur `/compte`, une erreur d'un caractère suffit à perdre un historique.

**Choix assumé et non neutre** : **la case de consentement est un contrôle natif à quatre côtés, de 24 × 24 px au minimum, avec une zone tactile de 44 pt, et elle n'est jamais pré-cochée.** Le libellé est écrit à sa droite, en `--text-body`, sur la même ligne que le nom des deux entités — et non dans un paragraphe séparé au-dessus, comme le font la plupart des formulaires. La raison est juridique autant qu'esthétique : C13 impose que le consentement **se coche explicitement**, et une case dissociée de son libellé est une case que l'on coche sans avoir lu à qui on donne quoi. La zone de 44 pt est la cible entière, libellé compris.

**Second choix, contestable** : **le bouton « Créer mon compte » est rendu en `primaire` et actif avant que la case soit cochée.** Il est donc possible d'appuyer sans avoir coché. Ce que fait l'application dans ce cas est de ne rien créer et de faire remonter l'écran jusqu'à la case, avec son message d'action — pas de refuser par un toast et pas de griser le bouton. Un bouton gris pour une action bloquée par une case est un bouton qui pose une question au lieu d'y répondre ; un bouton actif qui remonte à la case lui-même est une réponse. Le coût de ce choix est qu'un appui peut ne rien créer ; il en est visible immédiatement, et c'est pourquoi le retour est un déplacement d'écran, pas un message.

---

## 3. Anatomie

```
Écran "/compte/creer" — sous-écran de l'onglet Compte

├─ Barre système — retour vers "/compte"
├─ Titre d'écran — "Créer mon compte" --text-display 30/36
├─ Ligne d'annonce du rapprochement — --text-body-sm, AVANT les champs
│    "Nous vérifierons une seule fois si cette adresse a déjà des commandes."
├─ Champ "Adresse e-mail"
│    ├─ étiquette --text-caption
│    ├─ saisie --text-body, mono
│    ├─ aide : "C'est l'adresse avec laquelle vous avez commandé." --text-body-sm
│    └─ message d'action sous le filet, --color-erreur-fort
├─ Champ "Mot de passe"
│    ├─ étiquette --text-caption
│    ├─ saisie masquée, avec case à œil de 44×44
│    └─ aide : "8 caractères minimum." --text-body-sm
├─ Paragraphe des deux entités — --text-body, filet au-dessus
│    "La boutique {boutique} et le prestataire d'identité {fournisseur} détiennent
│     des données personnelles vous concernant."
├─ Ligne de consentement — zone tactile 44 pt
│    ├─ Case 24×24, contour --color-bordure-champ, cochée en --color-encre-700
│    └─ Libellé : "J'accepte que mes données soient traitées par la boutique et
│                  par le prestataire d'identité, pour retrouver mes commandes."
├─ Bouton primaire "Créer mon compte" — lg 56 px, icône aucune
├─ Ligne d'état — Panneau d'état `correspondance-echouee` ou `aucune-donnee`,
│                  insertion sous le formulaire
└─ Lien secondaire — "Voir mes commandes sur la boutique" (E1), présent d'emblée
```

| # | Composant | Rôle | Source |
|---|---|---|---|
| 1 | Champ de saisie | Adresse e-mail et mot de passe, validation au blur | design-system §5 |
| 2 | Ligne de consentement | Case explicite + libellé contenant les deux entités | slice-local, sur design-system §5 |
| 3 | Bouton primaire | Créer le compte ; **ne déclenche pas le rapprochement** | design-system §5 |
| 4 | Panneau d'état | `correspondance-echouee` et `aucune-donnee` après un résultat négatif | design-system §5 |
| 5 | Encart | Message de confirmation d'e-mail envoyé | design-system §5 |
| 6 | Lien textuel | « Voir mes commandes sur la boutique » — le recours écrit d'E1 | design-system §5 |

**Ce qui n'est pas dans cette anatomie** et ne doit pas y apparaître : un champ « prénom », « nom », « code partenaire », « code de réduction », une question de sécurité, une case pré-cochée, un bouton « J'accepte tout », une case distincte par entité, un bouton « Créer un compte et commander », une connexion sociale tierce — un bouton « Continuer avec Google » amènerait une troisième entité détenant des données, que C13 n'autorise pas à nommer parce que le marchand ne l'a pas choisie.

---

## 4. États — tous, sans exception

| État | Déclencheur | Rendu | Feedback utilisateur |
|---|---|---|---|
| **Chargement** | Ouverture de l'écran, ou retour de `/confirmer-email` avec un compte en attente | Le titre, la ligne d'annonce, les étiquettes, le paragraphe et la case sont **du texte local** et s'affichent immédiatement. Seuls les deux champs portent un indicateur d'attente à droite, saisie conservée, hauteur inchangée | Aucun indicateur global. Un formulaire ne se remplit pas de squelettes : des champs fantômes feraient croire que le client doit y saisir du texte |
| **Rempli** | Compte créé, e-mail de confirmation envoyé, rapprochement **non tenté** | `Encart · info` sous le formulaire, avec les trois faits écrits : « Compte créé. E-mail de confirmation envoyé à {adresse}. » puis « Après votre confirmation, nous vérifierons une seule fois si cette adresse a déjà des commandes. » Le bouton de création passe en `desactive` avec la raison écrite — « Compte en attente de confirmation » — **et il n'y a aucun bouton « Renvoyer » ici** : l'écran d'attente belongs à `/confirmer-email` | Aucun. Le client n'a rien à faire ; l'écran dit pourquoi |
| **Vide — jamais visité** | Première ouverture, formulaire vierge | Paragraphe des deux entités et case **déjà présents, avant toute saisie**. La case est décochée. Le lien « Voir mes commandes sur la boutique » est présent d'emblée | Aucun. Aucun texte d'accueil, aucun logo, aucun chiffre (« rejoignez 2 000 clients ») |
| **Vide — aucune donnée** | Correspondance échouée **définitivement** (B3), retour sur cet écran | `Panneau d'état · correspondance-echouee`, libellé écrit du design system §5 : « Aucune commande trouvée à cette adresse. » avec le détail « {n} tentatives sur 3 ». Action « Vérifier une autre adresse ». **Au-delà de trois tentatives, le compteur et le lien disparaissent tous les deux** (B5) ; il ne reste que la phrase et le lien « Voir mes commandes sur la boutique » | Aucun. **Ni « Réessayer », ni spinner, ni message d'erreur de serveur** : B3 rend le résultat définitif, donc afficher une nouvelle tentative serait promettre une opération que la règle interdit |
| **Erreur de chargement** | La création est refusée ou la source d'identité ne répond pas | Le message est rendu **sous le formulaire**, en `Encart · erreur`, avec le motif en clair : « Compte non créé. » Action « Réessayer ». **Les valeurs saisies sont conservées intégralement** — un champ qui perd son contenu à l'erreur est interdit (design system §5 Champ de saisie) | Le bouton repasse en actif avec son libellé. Aucun champ n'est vidé, aucun écran n'est quitté |
| **Erreur de soumission** | Champ invalide au blur, ou case de consentement non cochée au submit | **Au blur** : filet `--color-erreur #A03427` de 2 px, message d'action dessous en `--color-erreur-fort #8E2B1F` — ce que vous avez tapé, pourquoi c'est refusé, comment corriger. Exemples écrits : « Cette adresse ne contient pas d'arobase. Exemple : prenom.nom@exemple.fr » · « 8 caractères minimum. » — **jamais la couleur seule**. **Case non cochée** : l'écran défile jusqu'à la case, qui prend un anneau de focus `--color-bordure-focus`, et le libellé passe en `--color-erreur-fort` avec le message « Cochez pour accepter le traitement de vos données par la boutique et le prestataire d'identité. » | Le focus va au premier champ fautif ou à la case. La saisie n'est jamais effacée |
| **Succès** | Le compte est créé et l'e-mail envoyé | L'état « Rempli » ci-dessus. **Aucun message de type « Bienvenue »** : la seule information utile est l'adresse à confirmer et le fait que la vérification aura lieu | Aucun toast. Le résultat est dans le formulaire, à l'endroit du geste |
| **Hors-ligne / permissions** | Ouverture ou soumission sans réseau | À l'ouverture : le formulaire est rendu normalement, **les champs sont `desactive` avec la raison écrite à côté** — « Connexion requise pour créer un compte. » — et la case aussi. Un `Encart · hors-ligne` en tête porte le libellé du design system §5. **Le lien « Voir mes commandes sur la boutique » reste actif** : c'est la seule action possible, et elle est précisément celle qui rend l'application utile sans compte (C4) | Le catalogue et la boutique restent accessibles. L'écran n'est jamais un mur |
| **Lecture seule** | Compte déjà connecté, ou rapprochement déjà réalisé — B3 rend le résultat **définitif** | **Le formulaire est en entier dans un état non modifiable** : les deux champs et la case passent en `desactive` avec leur raison, et un `Encart · info` écrit la conséquence d'E9 en toutes lettres : « Cette adresse est confirmée et votre historique y est rattaché. Un rapprochement n'est jamais refait. Pour un autre historique, créez un autre compte. » Le bouton de création n'est pas rendu | Aucun. Le client ne peut pas déclencher un second rapprochement, et l'écran **le dit** plutôt que de ne rien expliquer. C'est le coût assumé du fail-closed, et le client doit en connaître le prix |

> Un état non décrit est un état non implémenté. Aucun de ces neuf n'affiche de compteur à 0, et l'état d'échec du rapprochement ne propose **jamais** « Réessayer » (C7, B3).

---

## 5. Interactions

| Élément | Événement | Comportement | Feedback visuel | État résultant | ID |
|---|---|---|---|---|---|
| Champ « Adresse e-mail » | blur | Validation du format ; correction des espaces de bord ; mise en minuscules de la partie domaine, **sans jamais modifier le texte visible** | Filet `--color-erreur` + message d'action, ou filet `--color-encre-600` à l'état actif | Rempli / Erreur de soumission | E3 |
| Champ « Adresse e-mail » | saisie | Aucune action réseau. Le bouton n'est jamais « en attente de vérification d'adresse » : une vérification d'existence d'adresse par frappe est une collecte déguisée et une requête inutile | Aucune | — | C9 |
| Champ « Mot de passe » | tap sur l'œil | Affichage du mot de passe saisi | L'œil a deux états, `--color-texte-secondaire` et `--color-texte-principal`, avec un nom accessible « Afficher le mot de passe » / « Masquer le mot de passe » | — | E3 |
| Case de consentement | tap | Bascule de l'état coché. **Elle n'est jamais pré-cochée et jamais cochée automatiquement** | La case passe en `--color-encre-700` avec sa coche, en `--duration-fast 120ms` ; zone tactile de 44 pt sur toute la ligne | — | C13 |
| Bouton « Créer mon compte » | tap, case cochée et champs valides | Création du compte, **sans aucun rapprochement**, puis envoi de l'e-mail de confirmation | `chargement` (largeur inchangée, libellé conservé en accessibilité), puis l'état « Rempli » | Rempli | B3, B2 |
| Bouton « Créer mon compte » | tap, **double-tap ou répétition réseau** | **Aucun second effet.** La création est idempotente sur l'adresse : un double appui, un retour arrière puis un nouvel appui, ou une reprise de réseau ne produisent **qu'un compte et qu'une tentative de rapprochement** — jamais deux. C'est B15 appliqué à l'acte de création, dont la partie « notification » n'a pas lieu d'exister au MVP | Le bouton passe et reste en `chargement` dès le premier appui : aucun second retour visuel ne suggère une seconde action | Rempli, une seule fois | B15 |
| Bouton « Créer mon compte » | tap, case non cochée | **Aucune création.** L'écran défile jusqu'à la case, qui prend l'anneau de focus | Défilement `--duration-normal 200ms`, anneau sur la case, libellé en `--color-erreur-fort` | Erreur de soumission | C13 |
| Action « Vérifier une autre adresse » | tap | Vide le champ d'adresse **seulement**, conserve le reste, et **incrémente le compteur de tentatives**. Au-delà de trois, l'action n'est plus rendue | Le champ d'adresse prend le focus, la case passe en décochée | Vide — aucune donnée | B5 |
| Action « Réessayer » | tap | Relance la seule création refusée, avec les valeurs conservées | `chargement` sur le bouton | Rempli ou Erreur de chargement | — |
| Lien « Voir mes commandes sur la boutique » | tap | Ouvre l'URL de la boutique, section commandes | Aucun | Sortie de l'application | E1 |
| Barre système | geste | Retour vers `/compte`, sans rien créer | `--duration-slow 320ms` | Compte | — |

- **Focus / clavier** : ordre de tabulation égal à l'ordre de lecture — adresse e-mail, mot de passe, œil du mot de passe, case de consentement, bouton de création, lien de recours. **La case est atteinte comme un contrôle unique** et non comme un texte : `aria-checked` porte son état, le libellé est relié par `aria-labelledby`, et le message d'erreur de la case est relié par `aria-describedby`.
- **Gestes** : défilement vertical natif, et **c'est tout**. Aucun geste ne ferme l'écran en cas de saisie non sauvegardée — sur un formulaire de deux champs, la confirmation « Abandonner ? » est du bruit. Le client qui veut sortir utilise le retour système, et ce qu'il a tapé est conservé s'il revient.
- **Animations** : `--duration-fast 120ms` sur la coche de la case et les pressés ; `--duration-normal 200ms` sur le défilement vers la case ; `--duration-slow 320ms` au retour arrière et à l'ouverture de la feuille de confirmation des tentatives, si elle existe. Aucune animation sur le paragraphe de conformité, qui doit être lu, pas apparaître.
- **Retour arrière** : rend `/compte`. Si le compte a été créé et l'e-mail envoyé, l'état « Rempli » est **conservé**, de sorte que le client qui quitte l'application pour ouvrir sa boîte ne revienne pas devant un formulaire vierge qui lui ferait croire que rien n'a été fait.

---

## 6. Responsive

| Breakpoint | Comportement | Ce qui se replie / disparaît |
|---|---|---|
| **Mobile** | **Seul format livré et seul format de référence** : `--format-320 320 × 568`. Marge `--space-lg 24px`, zone utile 272 px. Champs de 48 px de haut, case de 24 × 24 px dans une zone de 44 pt, bouton `lg` 56 px pleine largeur. Le clavier système remonte la zone utile : le défilement cible **le champ fautif ou la case**, jamais le haut de l'écran | Rien ne disparaît. Ce qui se replie, c'est le paragraphe des deux entités, qui passe de cinq à onze lignes au réglage maximal — et reste **intégralement lisible**, jamais tronqué, jamais réduit à un lien |
| **Tablet** | **Hors périmètre en v1** — C10 exclut tablette et web ; le roadmap §4.2 conditionne leur retour à une part de sessions tablette mesurée pendant la fenêtre, au-dessus d'un seuil écrit avant publication. Un formulaire de conformité non conçu sur un grand écran est le pire des deux cas | Non conçu. Aucune mise en deux colonnes du formulaire |
| **Desktop** | **Hors périmètre en v1**, même raison, même seuil. Le format de référence unique est `--format-320` | Non conçu |

- **Cible tactile** : champs 48 px ; **case à cocher, zone tactile de 44 × 44 pt sur toute la ligne libellé comprise** ; œil du mot de passe 44 × 44 px ; bouton `lg` 56 px ; lien « Voir mes commandes sur la boutique » 44 px de hauteur de ligne.
- **Débordement** : garanti sans débordement à tout réglage de police — les deux champs (pleine largeur, retour à la ligne autorisé, **jamais tronqués**, et jamais de hauteur fixe) ; le libellé de la case (retour à la ligne autorisé, il pousse la case vers le haut et la zone tactile grandit) ; le paragraphe de conformité (bloc libre, aucune hauteur fixe) ; chaque message d'action de champ (bloc libre) ; le bouton (le libellé « Créer mon compte » reste entier au réglage maximal) ; l'adresse e-mail saisie, rendue en mono avec retour à la ligne et jamais rognée.
- **Réglage de police** : aucun conteneur de texte n'a de hauteur fixe ; la **zone tactile de la case grandit** avec son libellé et ne rétrécit jamais (B21, E3) ; le message d'erreur d'un champ se place **sous** le champ et le pousse, il ne se superpose jamais. C'est la vérification manuelle de E3 : lecture d'écran sur un téléphone réel avec la police au maximum, et le parcours complet jusqu'à l'e-mail de confirmation doit rester utilisable.

---

## 7. Accessibilité

- [x] **Contraste du texte courant** — `--color-texte-principal #161A19` sur `--color-background #F1EDE5` pour le libellé de la case, le paragraphe des deux entités, la ligne d'annonce du rapprochement et les messages d'action ; `--color-texte-secondaire #5A544A` sur `--color-background` pour les étiquettes de champ et l'aide ; `--color-texte-secondaire #5A544A` sur `--color-surface-sunken #E7E2D7` pour la saisie elle-même ; `--color-erreur-fort #8E2B1F` sur `--color-background` pour les messages d'erreur ; `--color-texte-inverse #FBF8F2` sur `--color-encre-700 #1B2220` pour le libellé du bouton. Le seuil appartient à `design-check contrast`.
- [x] **Contraste des grands textes** — `--text-display 30/36` et `--text-h4 18/24` posés sur `--color-background` uniquement ; `--text-caption 14/19` pour les étiquettes, posées sur `--color-background` et sur `--color-surface-sunken` pour la ligne de la case.
- [x] **Navigation clavier complète** — sur matériel, ordre de tabulation égal à l'ordre de lecture ; la case est un `checkbox` natif dans le parcours de tabulation, donc le clavier la bascule par la barre d'espace et l'état est annoncé ; le bouton d'œil est un `button` dans le parcours, entre le mot de passe et la case.
- [x] **Focus visible** — anneau de 2 px en décalage de 2 px, couleur `--color-bordure-focus #1B2220`, sur les deux champs, sur l'œil, sur la case et sur le bouton. **Le cas particulier de la case non cochée** : l'anneau est posé sur la case, pas sur toute la ligne, pour que le client voie précisément ce qui manque, et il est accompagné du message d'erreur relié par `aria-describedby`.
- [x] **ARIA** — chaque champ a une `<label>` associée, jamais un placeholder comme étiquette ; les messages d'action sont reliés par `aria-describedby` et annoncés par `aria-live="assertive"` **une fois à leur apparition**, pas à chaque frappe ; la case a `aria-required="false"` mais son erreur lui est reliée, et le bouton n'est jamais marqué `disabled` à la place d'un message — c'est le message d'action qui explique ; le paragraphe des deux entités est **du texte ordinaire**, ni `alert` ni région vivante : un texte de conformité annoncé à l'ouverture est agressif et il est entendu avant d'être choisi ; l'`Encart` de confirmation d'e-mail est un `status` poliment annoncé.
- [x] **Alternatives textuelles** — **aucune image sur cet écran.** L'œil du mot de passe est un `button` dont le sens est porté par son nom accessible et **jamais** par son dessin seul ; la coche de la case est décorative et l'état est porté par `aria-checked` et par le changement de couleur de la case — c'est le seul endroit de l'application où la couleur porte un état sans second porteur visuel, parce que le carré coché et le carré vide sont deux formes distinctes, pas deux teintes.
- [x] **Langue et direction de lecture** — `lang="fr"`, `dir="ltr"`, l'adresse saisie n'est pas corrigée grammaticalement — une adresse en majuscules reste en majuscules — ; une seule langue, aucune couche d'internationalisation (C5, B20).

---

## 8. Données

| Champ | Type | Origine | Requis | Erreur possible |
|---|---|---|---|---|
| Adresse e-mail | texte | Saisie du client | oui | Format invalide → message d'action au blur ; **la saisie n'est jamais vidée ni corrigée silencieusement** |
| Adresse normalisée | texte | Dérivée de la saisie, partie domaine en minuscules | oui | Non reproductible → la source d'identité refuse, et le refus est affiché tel quel, jamais contourné |
| Mot de passe | texte | Saisie du client, secure store uniquement | oui | Moins de huit caractères → message d'action ; **jamais journalisé, jamais mesuré, jamais envoyé à l'outil d'audit** |
| Case de consentement | booléen | Geste explicite du client | oui | Non cochée → aucune création, message d'action, défilement jusqu'à la case |
| Acceptation des deux entités | horodatage | Base applicative | oui | Non enregistrable → le compte n'est pas créé et le motif est affiché |
| Confirmation d'e-mail | énumération `en_attente \| confirmee` | Base applicative | oui | `en_attente` → état « Rempli », avec la raison du bouton inactif écrite |
| Résultat du rapprochement | énumération `non_abouti \| reussi \| echoue` | Base applicative, **définitif** (B3) | après confirmation | **Jamais recalculé** : une lecture de cet écran ne rejoue pas le rapprochement |
| Nombre de tentatives | entier | Base applicative | non | ≥ 3 → compteur et lien « Vérifier une autre adresse » supprimés tous les deux (B5) |
| Identité du prestataire | texte | Convention technique, figée | oui | Jamais affichée si elle n'est pas nommée — C13 exige de nommer les deux entités, donc l'application ne peut pas démarrer sans ce nom |

- **Chargement** : aucun. Le formulaire est **entièrement local** : aucune requête n'est émise pendant la saisie, pas même pour « vérifier si cette adresse existe ». Un formulaire qui appelle le serveur à chaque frappe pour vérifier une adresse est une collecte d'existences pour rien, et un réseau lent sur un formulaire rend les erreurs de saisie impossibles à distinguer des erreurs de réseau.
- **Cache / hors-ligne** : **aucun cache applicatif sur cet écran**, et ce n'est pas un oubli : la création de compte est une écriture, et toute écriture hors ligne est exclue (C8). Hors ligne, l'écran est rendu, les contrôles sont désactivés avec leur raison, et la seule action disponible est le lien vers la boutique.
- **Données sensibles** : le mot de passe n'est jamais journalisé, mesuré ni écrit ailleurs que dans le secure store (jamais `AsyncStorage`). L'adresse e-mail n'est envoyée dans **aucun** événement d'audit (C9). La création est comptée comme un booléen — `compteCree: true` — et **la jointure avec l'ouverture de l'onglet Commandes se fait côté serveur** (roadmap §2.5, Q-C), parce qu'un identifiant de personne dans un événement est précisément ce que C9 interdit.
- **Instrumentation (PRD §8, C9)** : `creationCompteOuverture`, `compteCree` (booléen, sans adresse), `consentementCoche` (booléen, sans adresse), `creationCompteRefus` (motif : format, case non cochée, serveur). Le dénominateur de la règle d'arrêt du PRD §8 — les comptes créés — se lit sur `compteCree`, et il doit être exact : c'est le seul chiffre sur lequel repose la décision de suite.

---

## 9. Traçabilité

| ID | Origine | Manifestation sur cet écran |
|---|---|---|
| **B2** | PRD | Le compte créé n'ouvre rien par lui-même : l'e-mail de confirmation est envoyé, et l'historique n'apparaîtra qu'après. L'écran l'écrit en clair avant que le client investisse son effort — « Après votre confirmation, nous vérifierons une seule fois… » |
| **B3** | PRD | **Le rapprochement n'est pas déclenché par ce bouton.** Il est tenté une seule fois, à la confirmation, et son résultat est définitif. L'état « Lecture seule » écrit la conséquence d'E9 : « Un rapprochement n'est jamais refait. Pour un autre historique, créez un autre compte. » Rejouer le rapprochement serait une tentative continue de rapprochement d'identité |
| **B5** | PRD | L'échec propose « Vérifier une autre adresse » avec le détail « {n} tentatives sur 3 ». **Au-delà de trois tentatives, le compteur et le lien disparaissent tous les deux**, et il ne reste que la phrase du design system §5 plus le lien « Voir mes commandes sur la boutique » |
| **B15** | PRD | **Idempotence de l'acte de création** : un double appui, un retour arrière suivi d'un nouvel appui, ou une reprise de réseau ne produisent qu'un compte et qu'une tentative. Le bouton passe en `chargement` dès le premier appui et ne rend aucun second retour visuel. La partie notification de B15 n'a pas d'objet au MVP, US-8 étant hors périmètre — c'est écrit ici plutôt que laissé croire que la règle entière est traitée par cet écran |
| **E1** | PRD | Le quatrième cas d'E1 — le client ne se souvient pas de l'adresse utilisée — est traité **avant** l'effort : le lien « Voir mes commandes sur la boutique » est présent d'emblée, en bas de l'écran, alors que le client n'a encore rien tapé. Le présenter après l'échec serait le laisser repartir sans réponse pendant une minute |
| **E3** | PRD | Aucun conteneur de hauteur fixe, zone tactile de la case qui grandit avec le texte, messages d'erreur qui **poussent** le champ et ne se superposent jamais, et défilement programmatique vers le champ fautif ou la case. C'est la vérification manuelle du MVP, sur un téléphone réel et non sur un émulateur |
| **E9** | PRD | Le client qui a changé d'adresse après un rapprochement réussi **ne peut pas rejouer** : le formulaire passe en lecture seule avec la conséquence écrite par le client lui-même. Le prix de ce fail-closed est assumé et dit, plutôt que masqué par un champ de changement d'adresse qui promettrait un rejeu interdit |
| **C4** | PRD | Le catalogue reste consultable sans compte, et le lien vers la boutique reste actif dans **tous** les états de cet écran, y compris hors ligne. Créer un compte n'est jamais une condition pour regarder le catalogue |
| **C9** | PRD | Case de consentement explicite, jamais pré-cochée, et libellé contenant les deux entités. Aucune adresse, aucun mot de passe, aucun identifiant dans un événement d'audit |
| **C13** | PRD | Le paragraphe nomme nommément **la boutique et le prestataire d'identité**, il est présent **avant** la première frappe, et la case qui suit immédiatement reprend les deux noms. Pas d'accord tacite, pas de case pré-cochée, pas de bouton « accepter tout » |

---

## 10. Checklist de gate

- [x] Les 9 états sont décrits avec un rendu concret.
- [x] Chaque élément interactif a un comportement et un feedback.
- [x] Le responsive est défini à **chaque** breakpoint du design system — Mobile livré, Tablet et Desktop **écrits comme hors périmètre** avec leur condition de retour.
- [x] La section Anti-générique est cochée et justifiée.
- [x] Aucune valeur de design n'est laissée à « à définir ».
- [x] Chaque ID B*/E*/C* de l'écran apparaît en section 9. **C9 et C13 ont été ajoutés** par rapport au découpage initial : C13 est la raison d'être du paragraphe et de la case, et C9 régit leur enregistrement ; les omettre laisserait deux lignes d'écran sans règle opposable.
- [x] `node "$FORGE/scripts/forge-guard.js" placeholders <anchor>` ne signale rien ici.
- [x] L'écran reste cohérent avec `.forge/design/design-system.md`.