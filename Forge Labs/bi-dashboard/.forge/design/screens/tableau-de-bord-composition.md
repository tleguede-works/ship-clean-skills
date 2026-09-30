---
type: screen
slug: tableau-de-bord-composition
title: Composer un tableau de bord officiel
module: tableau-de-bord
status: approved
generated_at: 2026-09-30
derived_from:
  - .forge/prd.md
  - .forge/roadmap.md
  - .forge/benchmarks.md
  - .forge/design/design-system.md
rule_ids:
  - B9
  - B13
  - B16
edge_case_ids:
  - E4
  - E17
  - E18
flow: composition-tableau-de-bord
---

# Écran — Composer un tableau de bord officiel

> Ce document est la **source de vérité** pour qu'une IA génère l'interface de cet écran.
> Il est généré depuis le gabarit, jamais recopié. Aucun emplacement non résolu ne doit subsister.

---

## 1. Rôle de l'écran

| | |
|---|---|
| **Archétype d'app** | `dashboard` (secondaire `admin_crud` — gestion d'un référentiel) |
| **Module** | `tableau-de-bord` — rang 2 de la navigation, **sous-écran d'écriture** (le module de lecture est l'écran `tableau-de-bord`) |
| **Route** | `/tableaux-de-bord/comite-mensuel-aout/composition` |
| **Type** | `page` |
| **Utilisateurs** | Contrôleur de gestion — **seul**. Le directeur du site valide une signature, il ne compose pas un tableau |
| **User stories servies** | US-6 (publier et partager un tableau de bord officiel) |
| **Règles métier** | B9, B13, B16 |
| **Edge cases** | E4, E17, E18 |

**Une phrase** : cet écran permet au contrôleur de gestion de **choisir les indicateurs officiels et les personnes qui y ont accès**, afin de publier une séance qui ne peut pas être contestée sur son périmètre.

**Pourquoi il est au rang 2 de la navigation** : il n'occupe pas de place dans la barre. C'est le **sous-écran d'écriture** du module de rang 2, atteint depuis l'écran de lecture en un clic (« Composer » n'apparaît que pour le contrôleur). Le module est rang 2 parce que c'est **le tableau de bord** qui est l'objet de séance ; son écran d'écriture ne peut pas être plus visible que sa lecture, sans quoi l'outil afficherait à un lecteur mensuel la même importance qu'à son propre auteur.

**Cas d'usage précis** : la veille du comité. Le contrôleur prend les 3 définitions qui viennent d'être signées, coche celles qui vont au comité, ajoute 6 personnes nommées de l'annuaire, publie. L'indicateur `taux de transformation` est **exclu** de la liste des cochables : sa définition n'est pas signée, et B13 interdit qu'il apparaisse dans un tableau partagé. Deux indicateurs officiels donnent la même valeur sur la période : les deux restent cochés, l'écran signale le conflit aux deux propriétaires, et **ne propose aucun bouton pour le corriger** (E18).

---

## 2. Direction visuelle de cet écran

Repris du design system — **valeurs concrètes, jamais « à définir »**.

| | |
|---|---|
| **Mood** | dense, sourcée, non décorative — ici la densité a une fonction supplémentaire : c'est un écran de **vérification avant engagement**, pas de lecture |
| **Densité** | **dense** — `DataTable` variante `reference` en densité `md` (standard `admin_crud`), lignes de 52 px, cases à cocher de 20 px alignées à gauche, une seule action primaire dans toute la barre (`Publier`) |
| **Niveau de contraste** | **fort** — 11,3:1 texte courant, 7,1:1 accent, 5,4:1 hors cible. Justification : le contrôleur doit pouvoir relire 6 personnes et 3 définitions en 4 minutes sans recalculer, et chaque état d'un indicateur doit être lisible sans ambiguïté avant qu'il ne s'engage sur un partage nominatif |
| **Surface** | `--color-surface` `#E9EDEB` sur `--color-background` `#F2F4F3` ; le panneau d'accès est en `--color-surface-sunken` `#DEE3E1` (creux : c'est la zone de saisie) ; l'aperçu est en `--color-surface-raised` `#F7F9F8` |
| **Accent utilisé** | `--color-accent` `#0F5C57` — la seule action primaire `Publier`, le filet gauche de la ligne cochée, et la bordure du panneau d'accès. Il dit « ceci devient opposable », jamais « ceci est joli » |
| **Traitement photographique** | **AUCUN**. Ni illustration, ni logo, ni mascotte, ni aperçu « capture d'écran » du tableau qui serait une image. L'aperçu est rendu avec les vrais composants `IndicatorTile`, pas avec une image |
| **Référence** | le formulaire de déclaration d'une procédure qualité, où un champ mal rempli est signalé au champ et non à la fin — et le tableau d'affectation d'un vieil ERP, où l'on coche des lignes et où rien ne bouge tout seul |

### 2.1 Anti-générique — obligatoire

Cet écran ne doit ressembler **à aucun** de ces défauts :

- [x] Pas de fond **blanc pur** `#FFFFFF` par défaut — `--color-background` `#F2F4F3`.
- [x] **Pas de carte ombrée pour tout.** `--shadow-none` sur la page ; les deux panneaux (liste d'indicateurs, liste d'accès) sont séparés par un filet `--color-border` 1 px, l'ombre est réservée à `--shadow-md` pour la modale plein écran de confirmation de publication. Un conteneur qui contient deux éléments n'est pas une carte.
- [x] **Pas d'uniformité** : la hiérarchie vient d'un rapport d'échelles typographiques. `--text-h1` 24 px (nom du tableau) → `--text-h2` 18 px (« Indicateurs officiels », « Personnes autorisées ») → `--text-h3` 15 px (nom d'un indicateur) → `--text-overline` 11 px (intitulés de colonne, labels de champ) → `--text-body` 14 px → `--text-caption` 12 px (date de signature, version). Le rapport est volontairement irrégulier : le saut 24 → 18 px est le plus petit du produit, parce qu'ici le titre **n'est pas** l'objet — les deux panneaux le sont.
- [x] **Pas de gris neutre générique** `#6B7280` par défaut — `#4F5C57` (secondaire), `#7E8A85` (tertiaire), et surtout `#7A6A3C` « cible à reconfirmer / signataire non désigné » et `#746A5E` « non officiel / propriétaire inactif » : quatre états qu'un seul gris ne pourrait pas distinguer, et dont la confusion ferait publier un tableau par erreur.
- [x] **Pas de mise en page centrée symétrique** par défaut. Deux panneaux côte à côte, liste d'indicateurs en 8 colonnes à gauche, liste d'accès en 4 colonnes à droite, l'aperçu en 12 colonnes **en dessous**, aligné à gauche sur la grille. L'axe de lecture est du haut vers le bas, il n'est pas centré.
- [x] **Pas d'illustration d'appoint générique** (icône employée, gradient abstrait) à la place d'une vraie hiérarchie. Aucun dégradé, aucune icône décorative. L'absence de champ « lien public » est traitée par un **texte et un filet**, pas par un cadenas dans un cercle gris.
- [x] **Pas d'une seule famille de police** si la hiérarchie demande du contraste. `--font-sans` pour les libellés, `--font-mono` pour les **noms de version, dates de signature, identifiants de source et nombres de personnes** — l'identifiant de version `v2 · signée le 28/08/2026` doit être comparable d'une ligne à l'autre, donc à chasse fixe.

**Choix assumé et non neutre** : **ce produit n'a pas de constructeur de tableaux de bord, et l'écran le dit.** L'assemblage est **fixe** : les indicateurs sont choisis, pas placés ; il n'y a ni glisser-déposer, ni largeur de colonne réglable, ni filtre libre, ni couleur de tuile — un filtre libre serait un périmètre que le contrôleur n'a pas signé, et un placement libre produirait deux tableaux « officiels » différents du même jeu d'indicateurs. Cette borne, arbitrée au gate de la Phase 2, est écrite **dans l'écran** et pas seulement dans un document de cadrage : un bandeau permanent en tête, sous le titre, l'énonce, et la zone de composition libre est explicitement marquée « US-10 — V1 ». Deuxième décision, non moins assumée : **la case à cocher d'un indicateur non officiel n'est pas simplement désactivée, elle porte la raison en clair** — « non officiel — non publiable dans un tableau partagé (B13) », avec le nom du signataire manquant. Une case grisée sans explication est un refus que le contrôleur contournera en allant chercher la donnée ailleurs ; une case qui dit ce qu'il faut signer rend le garde-fou pédagogique. Et il n'y a **aucun bouton de correction** en cas de conflit de valeurs (E18) : l'écran signale, les deux propriétaires traitent, parce que corriger automatiquement l'un des deux indicateurs réécrit une version signée.

---

## 3. Anatomie

```
AppShell                                        (design-system §3.1)
├── Sidebar 240px                               (design-system §3.2 — module courant surligné)
│   ├── 1 Indicateurs
│   ├── 2 Tableaux de bord   ← module courant
│   ├── 3 Définitions
│   └── 4 Accès et journal
├── Breadcrumbs                                  (design-system §3.3)
│   └── Tableaux de bord › Comité mensuel — août 2026 › Composition
└── main · layout « Page dashboard » (design-system §4.2) — grille 12 colonnes
    │
    ├── Ligne de titre · hauteur 56 px
    │   ├── h1 « Comité mensuel — août 2026 »   (FormField readonly)
    │   ├── FormField text  slug  « comite-mensuel-aout »   (readonly, mono)
    │   └── SignatureBar  état draft|in_review|signed|locked (design-system §2 · SignatureBar)
    │
    ├── FixedAssemblyNotice                       (slice-local — porte la borne US-6/US-10)
    │   ├── filet gauche 2 px --color-accent, fond --color-accent-subtle
    │   ├── « Assemblage fixe. Vous choisissez les indicateurs officiels et les personnes ;
    │   │   vous ne les placez pas. Aucun filtre libre : seuls ceux écrits dans la
    │   │   définition s'appliquent. »
    │   └── « La composition libre d'une vue est US-10, prévue en V1. Elle n'existe pas ici. »
    │
    ├── Panneau gauche · 8 colonnes
    │   ├── h2 « Indicateurs officiels »
    │   └── DataTable variante reference            (design-system §2 · DataTable)
    │       ├── thead --text-overline, fond --color-surface-sunken
    │       │   ├── « ☐ »  (colonne de sélection, 44 px)
    │       │   ├── « Indicateur » · « Propriétaire » · « Version signée » · « Date de calcul »
    │       │   └── « État » · « Conflit »
    │       ├── tbody, ligne cochée = filet gauche 2 px --color-accent
    │       │   ├── ligne SIGNÉE      ☐ coché  · Badge « officiel »
    │       │   │                       + VersionNotice « v3 en attente — la publication
    │       │   │                         utilisera v2 signée le 28/08/2026 »   (B16, E4)
    │       │   ├── ligne NON SIGNÉE   ☐ **désactivée** + raison en clair
    │       │   │                       « non officiel — non publiable dans un tableau
    │       │   │                         partagé (B13) · signataire non désigné »   (B13)
    │       │   ├── ligne PROPRIÉTAIRE INACTIF  ☐ coché mais badge « propriétaire
    │       │   │                       inactif — le tableau perdra son caractère
    │       │   │                       officiel (E17) »
    │       │   └── ligne EN CONFLIT   ☐ coché + ConflictFlag
    │       │                           « même valeur que “Taux de transformation” sur août 2026 —
    │       │                             signalé à Nadia Ferrand le 30/09/2026, en attente »
    │       │                           +lien « voir l'historique »   (E18)
    │       │                           **aucun bouton de correction**
    │       └── tfoot  « 3 cochés sur 4 · 1 non officiel exclu (B13) »
    │
    ├── Panneau droit · 4 colonnes, fond --color-surface-sunken (creux)
    │   ├── h2 « Personnes autorisées » + « Accès nominatif (B9) »
    │   ├── NoPublicLinkNotice                     (slice-local — porte B9 et B18 retiré)
    │   │   ├── filet gauche 2 px --color-stale
    │   │   └── « Aucun lien public n'existe dans ce produit. L'adresse d'un tableau
    │   │         restitue un état, elle ne donne aucun droit. B18 a été retiré du
    │   │         périmètre le 30/09/2026 : un lien n'est pas un droit. »
    │   ├── FormField owner-picker  « Ajouter une personne »   (annuaire, saisie libre INTERDITE)
    │   ├── Liste des personnes nommées, une ligne chacune
    │   │   └── « Sophie Marchand · Marchés Nord · retirable »
    │   ├── FormField owner-picker  « Ajouter un groupe d'annuaire »
    │   │   └── Liste des groupes : « Comité de direction (8 personnes) »
    │   └── tfoot  « 6 personnes nommées + 1 groupe d'annuaire = 14 accès effectifs »
    │
    ├── Aperçu · 12 colonnes, fond --color-surface-raised, lecture seule
    │   ├── h2 « Aperçu — ce que verra le comité »
    │   └── grille de 3 × IndicatorTile md, hauteur 172 px (les composants réels, pas
    │       une capture ; « md » = 172 px depuis l'arbitrage du design system § 2)
    │       └── chaque tuile rend la valeur, sa cible et sa couleur sémantique —
    │           PAS le slot threshold : l'aperçu ne montre pas le franchissement
    │           (décision écrite en § 9.2, point 1). L'emplacement vide est un
    │           filet 1 px --color-border, sans valeur donc sans état de seuil.
    │       └── OffScopeNotice si une tuile sera retirée pour un lecteur (E5) :
    │           « 2 des 6 personnes autorisées ne verront pas “Taux de service”. »
    │
    └── Barre d'action · hauteur 64 px, filet supérieur 1 px, une seule action primaire
        ├── FormField text (readonly)  « Modifications non enregistrées » / « enregistrées »
        ├── btn ghost  « Aperçu » → plein écran (modale, --shadow-md)
        ├── btn secondary  « Enregistrer le projet »
        └── btn primary  « Publier le tableau officiel »  → opens PublishConfirm
            └── PublishConfirm  (modale plein écran, design-system §4.2)
                ├── récapitulatif : 3 indicateurs officiels, 14 accès, période par défaut
                ├── rappel : « La publication fige la version des définitions utilisée »
                └── btn primary « Publier »  →  SignatureBar  draft → in_review
```

| # | Composant | Rôle | Source |
|---|---|---|---|
| 1 | `AppShell` + `Sidebar` | chrome, navigation de rang 1 à 4 | design-system §3.1, §3.2 |
| 2 | `Breadcrumbs` | `Tableaux de bord › Comité mensuel — août 2026 › Composition` | design-system §3.3 |
| 3 | `SignatureBar` | état de signature de la version **du tableau** : `draft`, `in_review`, `signed` (horodatage, identité, version), `revocable`, `locked` | design-system §2 · SignatureBar |
| 4 | `FixedAssemblyNotice` | énonce à l'écran la borne « assemblage fixe », et le renvoi à US-10 en V1 | slice-local (borne arbitrée au gate de la Phase 2, US-6) |
| 5 | `DataTable` variante `reference` | choisir les indicateurs, avec leur état de signature, leur propriétaire, leur version signée, leur date de calcul | design-system §2 · DataTable |
| 6 | `VersionNotice` | signale qu'une version plus récente attend une signature et nomme la version qui sera réellement publiée | slice-local (B16, E4) |
| 7 | `ConflictFlag` | signale à l'écran une valeur identique entre deux indicateurs officiels, sans proposer de correction | slice-local (E18) |
| 8 | `FormField` variante `owner-picker` | ajouter une personne **nommée** ou un groupe d'annuaire — **jamais** de saisie libre | design-system §2 · FormField |
| 9 | `NoPublicLinkNotice` | écrit qu'aucun lien public n'existe, et pourquoi (B18 retiré du PRD le 30/09/2026) | slice-local (B9, § 9 du PRD) |
| 10 | `IndicatorTile` (`md`) dans l'aperçu | montrer le résultat avec les **vrais** composants, pas une capture d'écran : la valeur, sa cible, sa couleur sémantique et sa provenance. **Le slot `threshold` n'y est pas rendu** — décision écrite (§ 9.2, point 1) | design-system §2 · IndicatorTile, § 2.1 `ThresholdMachine` |
| 11 | `OffScopeNotice` | annonce, avant publication, qu'un indicateur ne sera pas visible par une partie des accès | slice-local (E5) |
| 12 | `PublishConfirm` (modale plein écran) | récapitulatif et engagement explicite avant que la publication fige les versions | design-system §4.2 (« Plein écran ») |

> **Pas de champ « copier le lien ».** Aucun. L'absence n'est pas un oubli d'implémentation, c'est la conséquence écrite de B9 : un champ de partage vide serait une promesse que le produit ne tient pas. Le contrôleur qui cherche où coller un lien trouve à sa place un paragraphe qui explique qu'il n'y en a pas.
>
> **L'aperçu ne rend pas le franchissement de seuil, et c'est écrit.** Les tuiles de l'aperçu portent la valeur, la cible, l'écart, la date de calcul, la source et la **couleur sémantique** de `IndicatorTile` — donc un indicateur hors cible s'y voit en `--color-out-of-band`, et un indicateur dans la cible garde l'apparence « dans la cible ». Elles ne portent **ni** ligne de seuil, **ni** badge `bell-ring`, **ni** mention « alerte de ce passage / déjà signalé / hors zone depuis le 2ᵉ passage », **ni** compteur de passages, **ni** « seuil réarmé le … ». Cinq raisons : la composition choisit **quels** indicateurs entrent dans le tableau, elle ne les supervise pas ; la réponse ne contient pas `threshold` ni `threshold_state` (§ 8) ; la moitié de la grille est faite d'**emplacements vides**, qui n'ont pas de valeur donc pas d'état de seuil ; l'état que cet écran montre déjà est celui de la **définition** (officiel, propriétaire inactif, en conflit), pas celui de la valeur ; et l'aperçu est une `role="img"` dont l'étiquette ne doit rien ajouter qui ne se lise ailleurs. L'écran qui affichera ces tuiles au comité — `tableau-de-bord` — rend la machine complète. Justification et arbitrage en § 9.2.

---

## 4. États — tous, sans exception

| État | Déclencheur | Rendu | Feedback utilisateur |
|---|---|---|---|
| **Chargement** | ouverture de `composition` | `DataTable` en état `loading` : 4 lignes skeleton de 52 px, hauteur conservée, en-têtes présents. Panneau d'accès : 2 lignes skeleton. `SignatureBar` en `draft` sans horodatage. L'aperçu reste **vide d'un cadre** (le rectangle de sa future hauteur est réservé, il ne clignote pas) | Aucun spinner global. La zone de saisie est la dernière à s'afficher : afficher une zone d'accès avant les indicateurs inviterait à saisir dans le vide |
| **Rempli** | la source a répondu, l'utilisateur est le propriétaire du tableau | 4 lignes d'indicateurs (3 signés, 1 non signé), 6 personnes nommées + 1 groupe, 3 tuiles dans l'aperçu, `SignatureBar` en `draft`. Le compteur du pied de table est permanent : « 3 cochés sur 4 · 1 non officiel exclu (B13) ». **Les tuiles de l'aperçu ne portent pas la ligne `threshold`** : ni seuil, ni mention d'état de la machine, ni compteur de passages, ni badge `bell-ring`. Elles portent en revanche la **couleur sémantique** du composant, donc un indicateur hors cible s'y voit en `--color-out-of-band` — l'écran ne montre jamais un indicateur comme « dans la cible » quand il ne l'est pas. Décision écrite en § 9.2 (point 1) | Le seul retour au repos est le survol d'une ligne : fond alterné `--color-ink-100` et bordure `--color-border-strong`. **Aucun effet au survol d'une case à cocher** : cocher ne déclenche pas d'animation, parce qu'une case qui glisse est une case dont on peut rater le changement. **Aucun toast, aucune bannière, aucune animation** ne vient dire quoi que ce soit du franchissement : cet écran n'en rend rien, donc il n'a rien à annoncer |
| **Vide — jamais visité** | le tableau existe mais n'a encore aucun indicateur | `DataTable` en état `empty-never-visited` : pas de lignes du tout, texte « Ce tableau de bord n'a encore aucun indicateur. » + **CTA unique** « Cocher les indicateurs officiels » qui place le focus sur la première case disponible. Panneau d'accès : 0 personne, message « Personne n'a encore accès. Un tableau sans accès n'est pas partagé. » | Le CTA **coche**, il ne navigue pas : il termine sa propre action. Un écran d'écriture dont le bouton principal envoie ailleurs est un écran qui fait perdre la saisie |
| **Vide — aucune donnée** | aucun indicateur **officiel** n'existe dans le catalogue (pas encore de définition signée) | Ce n'est pas un tableau vide, c'est une **dépendance non satisfaite** : la `DataTable` rend « Aucun indicateur signé. Un tableau de bord officiel ne peut être composé qu'avec des définitions signées. » + lien « Définir un indicateur » (module `definitions`, rang 3). `PublishConfirm` est **inatteignable**, le bouton `Publier` est désactivé **avec sa raison affichée**. La liste d'accès reste utilisable | Distinction volontaire avec l'état précédent : « pas encore de choix » ≠ « plus rien à choisir ». Un contrôleur qui n'a encore rien signé ne doit pas croire qu'il peut publier un tableau vide |
| **Erreur de chargement** | catalogue des indicateurs indisponible, ou tableau en modification concurrente (409) | `DataTable` en état `error` : « La liste des indicateurs n'a pas pu être chargée. » + `Réessayer`. **La saisie n'est pas perdue** : les personnes déjà ajoutées et les cases déjà cochées sont conservées localement et restaurées au rechargement. En modification concurrente (409) : « Ce tableau a été modifié par Nadia Ferrand pendant votre saisie. » + `Recharger la version à jour` + `Garder ma version en projet` | Jamais de toast. Un conflit d'écriture qui se résout dans un toast est un conflit d'écriture qui se reproduira |
| **Erreur de soumission** | publication ou enregistrement refusé | **Au champ**, jamais en toast. Liste d'accès vide → message sous le `FormField owner-picker` : « Un tableau doit être partagé à au moins une personne nommée ou à un groupe d'annuaire. » (B9). Indicateur `stale-owner` coché → refus **explicite** de publier comme officiel : « Le propriétaire de “Taux de service” est inactif. Nommez un propriétaire ou publiez sans le caractère officiel. » (B17, E17) — le refus est expliqué, pas seulement bloqué. Nom de tableau en doublon → 409 au champ | Deux niveaux de refus sont proposés au contrôleur, et **les deux sont nommés** : publier sans caractère officiel, ou nommer un propriétaire. Un refus qui ne dit pas quoi faire est un refus que l'utilisateur contourne |
| **Succès** | publication acceptée | `SignatureBar` `draft` → `in_review` → `signed` (horodatage, identité du contrôleur, version du tableau). Le titre passe au filet `--color-accent` 3 px et au badge « officiel ». La modale se ferme, un bandeau **permanent** remplace le bandeau de confirmation : « Publié le 30/09/2026 à 09:14 · version 1 · 3 définitions signées figées · 14 accès · l'adresse restitue un état, elle ne donne aucun droit (B9) » | Aucun toast, aucune animation de célébration, aucune confetti. Le succès est un **changement d'état permanent et daté** : c'est la seule preuve qui a de la valeur le lendemain. Le `SignatureBar` en `locked` après publication : la version des définitions est figée, elle ne se reprend plus |
| **Hors-ligne / permissions** | l'appelant n'est pas le contrôleur de gestion : l'écran **n'est pas rendu**. `404` identique à celui d'un `slug` inexistant, refus journalisé côté serveur avec l'identité, la ressource visée et le motif. **Annuaire indisponible** (le fournisseur d'identité ne répond pas) : le `FormField owner-picker` passe en état dégradé, la recherche de personnes est désactivée, `Publier` est désactivé **avec sa raison** : « L'annuaire ne répond pas : on ne publie pas une liste d'accès qu'on n'a pas pu vérifier. » | Aucun rendu dégradé « ajouter une personne manuellement ». Un nom saisi à la main n'est pas une personne nommée (B3, B9) : c'est une chaîne de caractères, donc un droit invérifiable, donc un journal sans piste |
| **Lecture seule** | le tableau est publié : `SignatureBar` en `locked` | La `DataTable` passe en lecture seule : cases **cochées et désactivées**, pas de retrait par ligne. Le panneau d'accès liste les personnes et les groupes sans `owner-picker` et sans bouton de retrait. Le bouton `Publier` est remplacé par « Voir le tableau » (navigation vers l'écran de lecture). Le `slug` reste en `FormField readonly` | `revocable` et `locked` sont **deux rendus distincts** : avant première publication, l'auteur peut reprendre ; après, seule une nouvelle version puis une nouvelle signature peuvent remplacer. Confondre les deux ferait croire qu'une publication se reprend en un clic, ce que B26 interdit |

---

## 5. Interactions

| Élément | Événement | Comportement | Feedback visuel | État résultant | ID |
|---|---|---|---|---|---|
| `FormField` nom du tableau | `blur` | valide le format du `slug` (kebab-case, jamais un identifiant technique) | message au champ, pas de toast | Rempli | — |
| `DataTable` case d'un indicateur **signé** | `click` / `Space` | coche ou décoche l'indicateur. Ajoute ou retire la tuile correspondante dans l'aperçu. Le compteur du pied de table se met à jour immédiatement | la ligne prend un filet gauche 2 px `--color-accent` ; la tuile apparaît/disparaît dans l'aperçu en `--duration-fast` | Rempli | US-6 |
| `DataTable` case d'un indicateur **non signé** | `click` | **rien.** La case est `disabled` et porte la raison en clair dans la cellule : « non officiel — non publiable dans un tableau partagé (B13) · signataire non désigné » + lien « aller à la définition » | pas d'effet au clic sur la case ; le texte de la raison est un lien | inchangé | B13 |
| `DataTable` case d'un indicateur `stale-owner` | `click` | coche normalement, mais la ligne porte l'avertissement E17 : « propriétaire inactif — le tableau perdra son caractère officiel ». Le contrôleur **peut** cocher : c'est sa décision, et elle est datée | filet gauche 2 px `--color-stale` sur la ligne, badge « propriétaire inactif » — rendu 5 de `design-system` § 2.7, sur le fond épinglé du composant | Rempli, et `Publier` restreint à « publier sans caractère officiel » | E17, B17 |
| `ConflictFlag` (E18) | `click` sur le lien « voir l'historique » | ouvre l'historique des **deux** indicateurs concernés, dans la même page, pour comparer les deux séries. **Aucun bouton « corriger », « harmoniser », « exclure de la publication », « garder celui-ci »** | l'historique s'ouvre en panneau 4 colonnes, journalisé comme consultation | Rempli | E18 |
| `ConflictFlag` (E18) — survol / focus | `hover` | **rien de nouveau.** Le conflit est déjà écrit en permanence dans la ligne : indicateur en conflit, date du signalement, destinataire, état du traitement. Un survol qui révélerait « deux indicateurs donnent la même valeur » serait un état caché | anneau focus sur le lien, rien d'autre | inchangé | E18, B5 |
| `FormField owner-picker` — recherche | `type` | filtre l'annuaire. **Saisie libre impossible** : le composant ne propose que des personnes et des groupes existants, avec nom, service et identifiant. On ne peut pas créer un accès à « l'équipe production » | liste de suggestions `--color-surface-raised` + `--shadow-sm` + `--radius-sm` | Rempli | B9, B3 |
| `FormField owner-picker` — sélection | `click` / `Enter` | ajoute la personne nommée à la liste d'accès. Le décompte effectif est recalculé immédiatement, en tenant compte des groupes déjà présents | ligne ajoutée, compteur « 6 personnes nommées + 1 groupe = 14 accès effectifs » | Rempli | B9 |
| Retrait d'une personne | `click` | retire l'accès. Si la personne est retraitée et l'annuaire ne répond plus, le retrait est **impossible** et la raison est affichée : on ne retire pas un droit qu'on ne peut plus vérifier | `--duration-fast` sur le retrait | Rempli | B9 |
| Groupe d'annuaire modifié (E14) | — hors de cet écran, mais visible ici | la composition affichée est celle **résolue à l'instant de l'affichage**, avec la mention «composition résolue le 30/09/2026 à 09:12 » dans le pied du panneau d'accès. Une modification du groupe s'applique à la prochaine lecture, journalisée avec la nouvelle composition | la date de résolution est permanente, pas un tooltip | Rempli | E14 |
| `VersionNotice` (E4) | `click` sur « v3 en attente de signature » | ouvre l'historique de la version de la définition | `--duration-fast` | Rempli | B16, E4 |
| `OffScopeNotice` (E5) | survol / focus | **rien.** L'avertissement « 2 des 6 personnes autorisées ne verront pas “Taux de service” » est écrit en permanence dans l'aperçu, avant la publication. Il nomme l'indicateur et le nombre d'accès concernés, **jamais** la raison du retrait d'une personne | anneau focus | Rempli | E5, B7 |
| Bouton « Enregistrer le projet » | `click` | enregistre la composition en `draft`. La `SignatureBar` reste en `draft`. Le bandeau d'état passe à « enregistré le 30/09/2026 à 09:12 » | bandeau permanent, pas de toast | Rempli | US-6 |
| Bouton « Publier le tableau officiel » | `click` | ouvre `PublishConfirm` en plein écran (`--shadow-md`, fond assombri 40 %), qui récapitule **les 3 nombres** : 3 indicateurs officiels, 14 accès, et les versions signées qui seront figées | modale centrée, 1 seule action primaire | Rempli → confirmation | US-6 |
| `PublishConfirm` — « Publier » | `click` | publie. Les versions de définition utilisées sont **figées** sur ce tableau. `SignatureBar` → `in_review` → `signed` | bandeau permanent daté (§ 4 Succès) | Succès | US-6, B16, B26 |
| `PublishConfirm` — « Revenir » | `click` / `Esc` | ferme la modale **sans rien perdre** : la composition est conservée en `draft` | la modale disparaît en `--duration-normal` 160 ms | Rempli | — |
| `Publier` avec un indicateur `stale-owner` coché | `click` | **refus expliqué**, pas refus muet : la modale propose deux issues nommées — « nommer un propriétaire » (ouvre `definitions`) ou « publier sans caractère officiel ». Aucun des deux n'est caché | modale en `--color-out-of-band` sur le bord gauche, les deux boutons sont visibles | Erreur de soumission | E17 |
| `Publier` sans personne nommée | `click` | refus **au champ**, sous le `owner-picker` : « Un tableau doit être partagé à au moins une personne nommée ou à un groupe d'annuaire. » (B9) | message au champ, anneau focus sur le champ fautif | Erreur de soumission | B9 |
| Glisser-déposer, déplacement d'une tuile, redimensionnement d'une colonne | — | **n'existent pas.** Aucune zone de dépôt, aucun curseur `move`, aucune poignée de redimensionnement. Le glisser-déposer libre est `already_solved` (Metabase, Power BI) et sortirait du périmètre arbitré : il est US-10, en V1 | aucune affordance de dépôt n'est rendue, donc rien n'indique qu'un dépôt serait possible | inchangé | US-6, US-10 |
| « Copier le lien » | — | **n'existe pas.** Le paragraphe `NoPublicLinkNotice` est à sa place | — | inchangé | B9 |

- **Focus / clavier** : ordre `Sidebar` → `Breadcrumbs` → nom du tableau (`readonly`, une tabulation) → `SignatureBar` (focusable, son état est annoncé) → `FixedAssemblyNotice` (focusable, `role="note"`) → `DataTable` (**une seule tabulation**, puis `↑ ↓` entre lignes, `Space` pour cocher, `Enter` pour suivre un lien de la ligne) → panneau d'accès (`owner-picker`, puis liste avec `↑ ↓`) → aperçu (lecture seule, `role="img"` avec un `aria-label` décrivant les 3 indicateurs et leurs valeurs — il ne contient pas d'information qui n'existe pas déjà à l'écran, il n'est donc pas une alternative à inventer) → barre d'action. Raccourcis : `Ctrl+S` enregistre le projet, `Ctrl+Entrée` ouvre `PublishConfirm`, `Échap` ferme la modale. Toutes les cases à cocher sont atteignables au clavier **même désactivées** dans la liste de lecture des lignes, afin qu'un lecteur d'écran puisse entendre la raison du blocage.
- **Gestes** : **aucun.** Ni glisser-déposer, ni swipe, ni long-press, ni pinch. Rappel : un glisser-déposer sur un écran detablet projeté en séance est un geste imprécis sur un asset de présentation, et il introduirait une liberté de placement que le gate de la Phase 2 a explicitement arbitrée hors périmètre.
- **Animations** : `--duration-fast` 90 ms à l'apparition ou au retrait d'une tuile dans l'aperçu et au changement de filet sur une ligne cochée ; `--duration-normal` 160 ms à l'ouverture et à la fermeture de `PublishConfirm`. **Aucune animation sur une valeur chiffrée**, et **aucune animation sur une case à cocher** : une case qui se coche avec une transition retarde la confirmation d'un geste qui doit être instantané, parce qu'il conditionne un engagement nominatif. Le seul mouvement autorisé sur la donnée est le changement de couleur sémantique d'un badge, en `--duration-normal`.
- **Retour arrière** : la composition est un formulaire long ; le navigateur **ne doit pas** quitter la page. Si l'utilisateur tente de quitter avec des modifications non enregistrées, une confirmation nombere les changements : « 2 indicateurs cochés, 1 personne ajoutée non enregistrés. » La composition n'est pas un store, elle est un formulaire local : la seule perte possible est une perte de saisie, jamais une perte de partage.

---

## 6. Responsive

| Breakpoint | Comportement | Ce qui se replie / disparaît |
|---|---|---|
| **Mobile `≤ 640px`** | Rendu **théorique et signalé comme non supporté** : une bannière persistante en tête, « Cet écran est un outil de bureau : la composition et le partage se font au poste de travail. Les indicateurs restent consultables sur téléphone. » + lien vers l'écran de lecture. Le corps de l'écran **n'est pas rendu adaptativement** il n'est pas rendu : un formulaire de publication d'un accès nominatif sur un écran de 640 px produirait une liste de personnes illisible et des erreurs de destinataire | Rien ne « se replie » : ce qui disparaît, c'est l'écran. C'est la seule réponse correcte — un composeur qui fonctionne mal sur téléphone produit des listes d'accès fausses, et une liste d'accès fausse est un problème de sécurité, pas un problème de mise en page. **Contrat explicite** : la barre d'action `Publier` n'existe pas en dessous de 1025 px, elle n'est ni masquée, ni déplacée, ni désactivée sans raison |
| **Tablet `641–1024px`** | Un seul plan de travail, les panneaux empilés : indicateurs (12 col) puis accès (12 col) puis aperçu (12 col). `DataTable` en `reference` conserve ses 7 colonnes ; la colonne « Propriétaire » se replie dans la cellule sous le nom de l'indicateur. `SignatureBar` pleine largeur sous le titre. Barre d'action **collante** en bas, hauteur 64 px, filet 1 px — c'est le seul format où une barre d'action collante est admise, parce que c'est le seul où le bas de l'écran est atteignable au doigt | La colonne « Date de calcul » passe sous le nom de l'indicateur. **Aucune colonne de la liste d'indicateurs n'est supprimée** : le contrôleur qui ne voit pas une colonne ne peut pas juger ce qu'il coche. La colonne « Conflit » (E18) est celle qui gagne la place en premier si l'écran est étroit, avant la date de calcul : c'est la seule information de cette table qui peut rendre une publication contestable |
| **Desktop `≥ 1025px` (jusqu'à 1600)** | Layout « Page dashboard » : indicateurs 8 col + accès 4 col sur une même rangée, aperçu 12 col en dessous, barre d'action non collante en pied de document, hauteur 64 px. `DataTable` en `reference` avec ses 7 colonnes, lignes de 52 px, case de 20 px alignée à gauche dans une colonne de 44 px | Rien n'est masqué. C'est le format du contrôleur de gestion, sur un poste fixe |
| **Bureau large `≥ 1601px`** | Identique au desktop, avec trois ajustements : la `DataTable` passe à 7 colonnes élargies (le contrôleur relit 3 lignes, la largeur lui sert à lire les motifs de conflit en entier) ; l'aperçu passe sur **une seule rangée** de 6 `IndicatorTile` `md` (3 cochés + 3 emplacements vides en filet 1 px `--color-border`, qui montrent la place disponible sans inventer de contenu). **Effet du passage de `md` à 172 px, vérifié** : la rangée passe de 6 × 148 = 888 px à 6 × 172 = **1 032 px**, soit 144 px de plus. Elle **reste sur une seule rangée** — la largeur ne change pas, seule la hauteur — mais elle ne tient plus dans une page à défilement court : l'aperçu devient donc la **seule zone de l'écran qui défile verticalement**, ce qui est écrit ici plutôt que subi. Aucun indicateur n'est retiré de l'aperçu pour faire tenir la hauteur : retirer une tuile de l'aperçu, c'est retirer un indicateur du comité ; le `PublishConfirm` devient une modale de 640 px de large alignée à gauche du centre, pas une modale plein écran — le plein écran est réservé à la signature d'une définition | Le `PublishConfirm` en plein écran est remplacé par une modale centrée. Le contenu du récapitulatif est identique, y compris la liste des versions signées qui seront figées |

- **Cible tactile** : 44 × 44 px sur les cases à cocher (la case fait 20 px, la cellule 44 px, l'aire cliquable est la cellule entière), sur les `owner-picker`, sur les boutons de la barre d'action, et sur les liens de cellule (« aller à la définition », « voir l'historique »). Les lignes de 52 px laissent 8 px de respiration entre deux zones cliquables : un écart de 8 px entre deux cibles de 44 px est insuffisant, la zone cliquable est donc inset de 4 px de part et d'autre et les lignes alternées portent un fond différent pour que l'alignement des doigts reste lisible.
- **Débordement** : **garanti de ne jamais déborder** — (1) `slug`, numéros de version, dates de signature et identifiants de source sont en `--font-mono` avec `tabular-nums` dans des colonnes de largeur fixe : un `source_ref` long s'ellipse par la **fin** de la chaîne sans élargir la table ; (2) le motif de `ConflictFlag` est sur **trois lignes maximum** puis ellipsé, avec le texte intégral dans un `title` accessible et dans l'historique des deux indicateurs — un conflit qu'on ne peut pas lire en entier est un conflit qu'on publie ; (3) le nom d'une personne dans la liste d'accès est la seule colonne élastique, avec ellipse sur le segment de droite (le nom de famille est le discriminant) ; (4) la barre d'action ne déborde jamais : à trois boutons la barre est en 3 colonnes égales, et le libellé de l'action primaire passe de « Publier le tableau officiel » à « Publier » en dessous de 1280 px, jamais au-delà du bord ; (5) l'aperçu ne défile pas horizontalement : le nombre de tuiles par ligne diminue, il ne se réduit pas.

---

## 7. Accessibilité

- [x] Contraste **11,3:1** pour le texte courant — `--color-text-primary` `#2C3633` sur `--color-background` `#F2F4F3` (mesuré). C'est le texte des motifs de refus, qui sont les informations les plus importantes de cet écran.
- [x] Contraste **7,1:1** pour l'accent `--color-accent` `#0F5C57` (mesuré) — action primaire `Publier`, filet de la ligne cochée, bordure du panneau d'accès. Le texte de l'action primaire sur fond accent est `#F7F9F8` : **7,4:1** (mesuré).
- [x] Contraste **5,4:1** pour `--color-out-of-band` `#B23A2E` sur le fond, **4,7:1** sur `--color-out-of-band-subtle` `#F6E1DE` (mesuré) — bord gauche de la `PublishConfirm` refusée.
- [x] Contrastes de badge : `--color-unknown` `#7A6A3C` **4,8:1** (cible à reconfirmer, signataire non désigné) et `--color-accent` sur `--color-accent-subtle` **5,9:1** (officiel). Aucun badge de cet écran ne descend sous 4,5:1.
- [x] Navigation clavier complète sur **desktop et tablette** : `DataTable` en `role="grid"` avec `aria-rowcount`, `↑ ↓ Home End` entre lignes, `Space` pour cocher, `aria-checked` propagé. **Les cases désactivées restent atteignables** dans la liste des lignes et sont annoncées avec leur raison : `aria-disabled="true"` et non `disabled` strict, pour que la raison soit lisible au clavier plutôt que silencieuse.
- [x] Focus visible : anneau `--color-border-focus` `#0F5C57` 2 px, **jamais supprimé**. Sur la ligne cochée, dont le filet gauche est déjà `--color-accent`, l'anneau est doublé d'un décalage de 2 px pour rester distinct.
- [x] ARIA : `aria-live="polite"` sur le compteur « 3 cochés sur 4 » et sur le décompte d'accès effectifs — cocher une case change un nombre qui engage une publication ; `aria-live="assertive"` sur le refus de publication, parce qu'un refus non annoncé est un refus contourné ; `role="alertdialog"` sur `PublishConfirm` avec `aria-modal="true"` et piégeage du focus ; `aria-describedby` relie chaque case désactivée au texte de sa raison ; `role="note"` sur `FixedAssemblyNotice` et `NoPublicLinkNotice`, qui portent des informations de cadrage, pas des actions ; `aria-errormessage` sur les champs en erreur.
- [x] Alternatives textuelles : **aucune image, donc aucune alternative à produire.** L'aperçu est rendu avec les **vrais** composants `IndicatorTile`, pas avec une capture : il n'y a donc aucun contenu d'image à décrire. Le `role="img"` de l'aperçu porte un `aria-label` qui énumère les indicateurs et leurs valeurs, ce qui duplique ce que la lecture linéaire lirait déjà — c'est un confort, pas un mensonge d'accessibilité. Les seules icônes (verrou, avertissement, conflit) sont `aria-hidden="true"` et **toujours doublées d'un texte** ; l'état « non officiel » est porté par le mot, jamais par une couleur (PRD § 7.3).
- [x] Langue et direction de lecture correctes : `lang="fr"`, `dir="ltr"`, dates `jj/mm/aaaa hh:mm`, noms de personnes et de groupes **non traduits** (identités d'annuaire), `source_ref` affiché tel quel. Les noms propres ne sont jamais translittérés ni abrégés : un nom de personne mal rendu est un problème d'attribution de droit.
- [x] **Tokens recalculés sur les valeurs du design system §1.1, et une règle d'usage qui en découle** : `--color-stale` `#746A5E` est à **4,79:1** sur le fond (mesuré), il passe le seuil AA et **porte** donc le texte du badge « propriétaire inactif » et de la `VersionNotice` — **5,01:1** sur le fond épinglé du badge `--color-surface-raised` `#F7F9F8` (mesuré). Ce badge n'est pas une exception de cet écran : c'est le rendu 5 de `design-system` § 2.7, et cet écran est l'un des trois qui documentent mesurablement que `--color-stale` **porte ce texte** — ce qui a permis de trancher le point 2 du § 9.2 de `definitions.md` en refusant `--color-source-unavailable` pour cette cause. Le fond épinglé est la règle du composant (contrat `DataTable`), cet écran ne le recalcule pas. `--color-border-strong` `#7E8A85` est à **3,24:1** : il **tient** le seuil de 3:1 des éléments non textuels (WCAG 1.4.11), avec 0,24 de marge seulement. La conséquence appliquée n'est donc plus une non-conformité mais une exigence de redondance : l'état « ligne cochée » est porté par **deux** signaux — le filet gauche 2 px `--color-accent` (7,1:1) **et** la case à cocher elle-même, dont l'état `checked` est annoncé au lecteur d'écran. Elle a une fonction de sécurité autant que de lisibilité : un contrôleur qui ne distingue pas la nuance de gris coche quand même le bon indicateur ; un contrôleur qui distingue mal le gris **et** la case coche le mauvais, et c'est un indicateur qui part en comité.

---

## 8. Données

| Champ | Type | Origine | Requis | Erreur possible |
|---|---|---|---|---|
| `dashboard_slug` | slug kebab-case | URL + `FormField` | oui | collision → 409 au champ, motif écrit ; jamais d'identifiant technique (convention de routage) |
| `dashboard_version` | entier | serveur | oui | 409 en modification concurrente → bannière à deux issues, saisie conservée |
| `signature_state` | enum `draft` `in_review` `signed` `revocable` `locked` | serveur | oui | `locked` → écran entier en lecture seule |
| `selected_indicators[]` | slugs d'indicateurs | état local du formulaire,ersisté serveur au `Enregistrer` | oui | indicateur retiré du catalogue entre la sélection et la publication → refus au champ, coché non conservé |
| `indicators[].definition_version_id` | uuid | serveur | oui | version signée supprimée → refus de publication, jamais de repli sur un projet |
| `indicators[].signature` | identité + timestamp | serveur | si officiel | absente → `is_official = false`, la case est désactivée avec la raison (B13) |
| `indicators[].owner` | identité nommée | annuaire | oui | `null` → la case est désactivée : une définition sans propriétaire nommé n'est pas signable (B3) |
| `indicators[].owner_active` | booléen | annuaire | oui | `false` → badge « propriétaire inactif » + avertissement E17 + restriction de publication |
| `indicators[].is_official` | booléen | serveur | oui | `false` → **case désactivée avec la raison en clair** (B13) |
| `indicators[].pending_version` | uuid `null` | serveur | non | `true` → `VersionNotice` : la publication utilisera la version signée, pas la version en attente (B16, E4) |
| `indicators[].pending_signature` | identité `null` | serveur | non | `null` → la raison du blocage est « signataire non désigné », pas « non officiel » sans plus |
| `conflict[]` | tableau `{ indicator_slug, with_indicator_slug, period, value, raised_at, owners[], state }` | serveur | non | `state = open` → `ConflictFlag` sur **les deux** lignes. `state = acknowledged` → le badge reste, l'écran n'efface pas le constat : E19 interdit le correction automatique et l'oubli automatique aussi |
| `access_people[]` | identités nommées de l'annuaire | état local + serveur | oui si publication | liste vide → refus au champ, message nommé (B9) |
| `access_groups[]` | groupes d'annuaire | idem | non | un groupe est **résolu** au moment de l'affichage, la date de résolution est affichée (E14) |
| `effective_access_count` | entier | serveur (somme personnes + groupes résolus, sans double compte) | oui | `0` → refus de publication. Le décompte est effectif, pas nominal : « 6 personnes + 1 groupe = 14 accès » et jamais « 7 » |
| `out_of_scope_access[]` | `{ indicator_slug, blocked_access_count }` | serveur | non | `> 0` → `OffScopeNotice` **avant** publication. Le contrôleur voit la conséquence avant de s'engager, pas après |
| `no_public_link` | constante `true` | PRD § 9 | oui | **jamais** paramétrable. Il n'existe aucun champ qui pourrait rendre cette valeur fausse |
| `resolution` | `{ period, teams }` | périmètre par défaut du tableau, lié à la version | oui | modifié entre la composition et la lecture → la lecture utilise le périmètre résolu, pas celui saisi |

- **Chargement** : **tout d'un bloc**, catalogue des indicateurs officiels complet (au MVP : 3 à 10 lignes, pas de pagination, pas de recherche — un catalogue de trois éléments avec une barre de recherche est une fausse promesse d'échelle). Le compteur « 3 cochés sur 4 » et le décompte d'accès effectifs sont recalculés **localement** à chaque changement, en moins d'une frame : ils ne sont pas revalidés par un aller-retour serveur, parce qu'un compteur d'accès qui met 400 ms à répondre est un compteur que le contrôleur ne fait plus confiance.
- **Cache / hors-ligne** : **aucun cache, et ce n'est pas un oubli.** Un cache d'annuaire serait une copie d'identités nominatives hors du contrôle d'accès (C10), et un cache de catalogue d'indicateurs servirait à afficher une définition retirée. La composition est un formulaire **local**, non persisté en cache : la reprise passe par « Enregistrer le projet » côté serveur, et la perte de liaison ne perd **aucune** saisie en cours (PRD § 7.5) parce que l'état du formulaire est en mémoire React, pas dans un stockage local. Un compte qui perd un droit cesse d'accéder à la lecture suivante, sans intervention (E14) — donc aucun droit n'est mis en cache, ici ni ailleurs.
- **Ce que la réponse ne porte pas, et c'est une décision** : ni `threshold`, ni `threshold_state`, ni `threshold_crossed_at`, ni `threshold_alerted_at`, ni `threshold_rearmed_at`. Le catalogue de composition décrit une **définition** — sa version signée, son signataire, son propriétaire, son propriétaire actif, sa version en attente — pas l'historique d'un franchissement. L'aperçu rend donc les composants réels avec la surface qu'il a (§ 3, § 9.2 point 1), et il ne fabrique pas un `threshold_state` qu'il n'a pas reçu. Le tableau qui sera publié est lu par `tableau-de-bord`, qui rend la machine complète ; cette asymétrie est écrite, elle n'est pas un oubli d'implémentation.
- **Données sensibles** : c'est l'écran qui porte le plus de données personnelles du produit — **6 identités nominatives et 14 accès effectifs**. Elles ne sont jamais écrites dans un journal d'erreurs : une 5xx porte l'identifiant de requête et le `error_code`, **jamais** la payload brute (C3, C10). Elles ne sont jamais préchargées dans le HTML pour un utilisateur non autorisé : la liste d'accès n'est renvoyée qu'au contrôleur du tableau, et l'affichage d'une liste de personnes à un lecteur est interdit par construction. Le retrait d'une personne de la liste est journalisé (qui, quand, quel tableau, quelle personne) — c'est une modification de droit, pas une modification de contenu. Le `ConflictFlag` écrit dans le journal **les deux** indicateurs en conflit, sans la valeur (une valeur n'est pas une donnée personnelle, mais elle n'est pas non plus nécessaire pour constater un conflit).

---

## 9. Traçabilité

| ID | Origine | Manifestation sur cet écran |
|---|---|---|
| US-6 | PRD | § 3 : l'écran est la réalisation des deux critères d'acceptation de US-6 — « partagé à des personnes nommées » (panneau d'accès, `FormField owner-picker`) et « aucun accès public n'existe » (`NoPublicLinkNotice`, `no_public_link`). § 4 « Rempli » et « Succès ». § 5 : cocher / décocher / ajouter / retirer / publier, chacun avec son feedback |
| B9 | PRD | § 3 : `FormField owner-picker` **sans saisie libre** (une personne nommée ou un groupe d'annuaire, rien d'autre) ; `NoPublicLinkNotice` écrit en permanence qu'aucun lien public n'existe et **pourquoi** (B18 retiré du PRD le 30/09/2026, « un lien n'est pas un droit »). § 4 « Erreur de soumission » : refus nommé si la liste est vide. § 4 « Hors-ligne / permissions » : si l'annuaire ne répond pas, on ne publie pas — **aucun** repli par saisie manuelle. § 5 : le retrait est impossible sans annuaire, parce qu'on ne retire pas un droit qu'on ne peut plus vérifier |
| B13 | PRD | § 3 : la case d'un indicateur non signé est **désactivée et porte la raison en clair** — « non officiel — non publiable dans un tableau partagé (B13) · signataire non désigné », avec un lien vers la définition. § 5 : le clic ne fait rien, la raison est un lien. § 4 « Erreur de soumission » et compteur du pied de table « 1 non officiel exclu (B13) ». L'indicateur reste visible et explorable **ailleurs** : B13 l'interdit dans un tableau partagé, pas partout |
| B16 | PRD | § 3 : `VersionNotice` par ligne — « v3 en attente de signature, la publication utilisera v2 signée le 28/08/2026 ». § 4 « Erreur de soumission » : si la version signée disparaît, refus de publication, **jamais** de repli sur un projet. § 5 : `VersionNotice` cliquable vers l'historique. La version publiée est toujours la dernière version **signée** |
| E4 | PRD | § 3 `VersionNotice` + § 5 : une définition modifiée alors que ce tableau la référence est nommée, datée, et **non appliquée**. La publication fige la version signée : c'est le mécanisme qui rend la borne vérifiable |
| E17 | PRD | § 3 : ligne `stale-owner` (filet `--color-stale`, badge « propriétaire inactif », rendu 5 de `design-system` § 2.7) ; § 4 « Erreur de soumission » : le refus de publier comme officiel est **explicité à deux issues** — nommer un propriétaire, ou publier sans caractère officiel ; § 5 : la ligne peut être cochée, c'est la décision datée du contrôleur. Le tableau **n'est pas retiré** des accès en cours : le retirer effacerait ce que le lecteur attendait, et la séance se tient |
| E18 | PRD | § 3 `ConflictFlag` sur **les deux** lignes concernées, avec la valeur, la période, la date du signalement, les destinataires et l'état du traitement. § 4 « Rempli » : le badge **persiste** même après accusé de réception — l'absence de correction automatique ne justifie pas l'oubli automatique. § 5 : **aucun bouton « corriger », « harmoniser », « exclure », « garder celui-ci »**. Corriger le calcul de l'indicateur le plus récent ne réécrit pas l'autre : les deux restent officiels, et le constat remonte au propriétaire de chacun |
| B3 | PRD | § 3 et § 5 : le `FormField owner-picker` ne propose que des personnes **nommées** de l'annuaire. Un champ libre acceptant « l'équipe production » produirait une règle sans propriétaire, donc non signable. Ce n'est pas une contrainte d'interface, c'est la règle |
| B17 | PRD | § 3 et § 4 : indicateur `stale-owner` perdant le statut officiel tant qu'un propriétaire n'est pas nommé, et avertissement E17 sur la publication du tableau |
| B26 | PRD | § 4 « Lecture seule » : `SignatureBar` en `revocable` **avant** première publication (l'auteur peut reprendre) et en `locked` **après** (seule une nouvelle version puis une nouvelle signature remplacent). Deux rendus distincts, confondre les deux ferait croire qu'une publication se reprend en un clic |
| B25 | PRD | § 8 « Données sensibles » : la liste d'accès et le journal ne contiennent jamais le détail des lignes, seulement la ressource visée |
| B10 | PRD | § 5 : le retrait d'une personne est journalisé — une modification de droit est un événement journalisé, pas une modification de contenu |
| C2 | PRD | § 1 et § 3 : cet écran ne saisit **aucune donnée métier**. Il coche des indicateurs et des personnes ; il ne modifie ni une formule, ni une valeur, ni un seuil. Modifier un indicateur passe par une nouvelle version de définition (écran `definitions`) |
| C3 | PRD | § 4 « Hors-ligne / permissions » et § 8 : authentification unique, aucun mot de passe stocké, hébergement dans l'Union européenne. L'annuaire est la source des identités, l'outil n'en détient pas de copie |
| C7 | PRD | § 2 : deux panneaux et un aperçu, six contrôles, une seule action primaire. La formation en moins d'une demi-journée ne passe pas par un écran qui aurait six modes |
| C10 | PRD | § 4 et § 8 : ce sont des identités nominatives, donc des données personnelles. Chiffrement au repos, isolation par ligne, PITR et accord de traitement sont des **prérequis bloquants** de mise en production, pas des améliorations |
| Flow `composition-tableau-de-bord` | US-6 | Flux fermé et **entièrement journalisé** : ouvrir `composition` → choisir des indicateurs signés → nommer les accès → publier → la `SignatureBar` passe en `locked`. Le contrôleur peut sortir à tout moment avant `Publier` sans perte : le seul engagement irréversible est la publication, et il est précédé d'une confirmation qui récapitule les trois nombres qui comptent |
| Borne US-10 | Gate Phase 2 | § 2.1, § 3 `FixedAssemblyNotice`, § 5 : « assemblage fixe, aucun placement, aucun filtre libre ». La composition libre est **US-10, en V1**. Cette borne est écrite **dans l'écran**, pas seulement dans un document de cadrage : c'est le seul endroit où elle protège réellement l'utilisateur d'une promesse |

### 9.2 Écarts et arbitrages ouverts

| # | Point | Ce qui a été fait dans cet écran | Arbitrage attendu |
|---|---|---|---|
| 1 | **Cet écran rend-il la machine de franchissement ? — NON, et c'est une décision écrite** | Les tuiles de l'aperçu ne portent **ni** ligne `threshold`, **ni** badge `bell-ring`, **ni** mention « alerte de ce passage / déjà signalé / hors zone depuis le 2ᵉ passage », **ni** compteur de passages, **ni** « seuil réarmé le … ». Cinq raisons. (a) **La composition choisit, elle ne supervise pas** : les machines à états de cet écran sont `SignatureBar` (`draft` → `in_review` → `signed` → `locked`), `ConflictFlag` (E18) et `OffScopeNotice` (E5) ; le franchissement d'un seuil n'en est pas une quatrième. Ce que le contrôleur décide ici, c'est **ce que le comité verra**, pas **si le comité a été prévenu**. (b) **La réponse ne porte pas les champs** (§ 8) : `indicators[]` décrit une définition — version signée, signataire, propriétaire, propriétaire actif, version en attente — et aucun `threshold` ni `threshold_state`. Rendre la ligne demanderait de les ajouter au contrat de composition, donc une seconde évaluation de la machine sur un écran dont le server-side job est de figer des versions. (c) **La moitié de la grille est faite d'emplacements vides** : un emplacement en filet 1 px n'a pas de valeur, donc pas d'état de seuil. Une grille dont trois cases portent une date de franchissement et trois autres un filet muet donnerait l'impression que le franchissement est l'objet de la grille — il ne l'est pas, l'objet est la **place disponible**. (d) **L'état que cet écran montre déjà est celui de la définition** : la colonne « État » de la `DataTable` porte officiel / propriétaire inactif / en conflit, jamais « hors cible ». Mélanger les deux registres dans la même colonne serait exactement la confusion que la colonne « Conflit » existe pour éviter. (e) **L'aperçu est une `role="img"`** dont l'étiquette énumère les indicateurs et leurs valeurs (§ 5) : y ajouter des dates de franchissement ajouterait des faits à une étiquette composite, pour des faits que le lecteur ne peut pas y relier à une ligne. **Ce qui n'est pas fait, et qui serait une faute** : montrer une tuile avec une couleur « dans la cible » quand elle est hors cible. La **couleur sémantique** du composant est bien rendue, donc l'écran ne ment pas sur le fait lui-même ; il ne dit pas *quand* le franchissement a eu lieu | **Confirmer que la composition ne porte que la valeur et la couleur.** L'alternative — rendre la ligne `threshold` dans l'aperçu — est défendable et il faut trancher une seule fois : soit on accepte d'ajouter `threshold` et `threshold_state` au contrat de composition et de faire porter à l'aperçu une information que le contrôleur ne peut pas agir dessus, soit on acte que le franchissement appartient à `tableau-de-bord` (séance projetée), à `indicateurs` (boucle quotidienne) et à `indicateur-detail` (l'indicateur) — et alors **l'écart est fermé**. |
| 2 | **Un indicateur hors cible apparaît en rouge dans l'aperçu sans qu'aucune mention n'explique qu'il a déjà été signalé** | C'est la conséquence assumée du point 1 : la couleur porte « hors cible », elle ne porte pas « et on a été prévenu ». Le contrôleur qui veut cette information l'a à un clic, dans le tableau publié. Ce qui serait une faute, et qui n'est pas fait : ajouter une mention statique « déjà signalé » sans sa date — une alerte sans date est invérifiable (B5) | **Aucun arbitrage propre à cet écran.** Si le point 1 est confirmé, l'écart est fermé avec lui ; si le point 1 est refusé au profit de la ligne complète, ce point disparaît également |

---

## 10. Checklist de gate

- [x] Les 9 états sont décrits avec un rendu concret.
- [x] **Ce que cet écran rend et ne rend pas de `IndicatorTile` est écrit** : la surface absente est nommée (slot `threshold`, quatre états de la machine), la couleur sémantique conservée, la raison donnée dans l'écran (§ 3, § 4) **et** dans § 9.2. Aucune énumération de surface n'est périmée, aucune n'est inventée.
- [x] Chaque élément interactif a un comportement et un feedback.
- [x] Le responsive est défini à **chaque** breakpoint du design system.
- [x] La section Anti-générique est cochée et justifiée.
- [x] Aucune valeur de design n'est laissée à « à définir ».
- [x] Chaque ID B*/E*/C*/US de l'écran apparaît en section 9.
- [x] `node "$FORGE/scripts/forge-guard.js" placeholders <anchor>` ne signale rien ici.
- [x] L'écran reste cohérent avec `.forge/design/design-system.md`.