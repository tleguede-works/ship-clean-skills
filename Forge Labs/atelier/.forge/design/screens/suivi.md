---
type: screen
slug: suivi
title: Suivi
module: Suivi
status: draft
generated_at: 2026-10-01
derived_from:
  - .forge/prd.md
  - .forge/design/design-system.md
  - .forge/roadmap.md
rule_ids: [B5, B12, B23, B25, B26, B24]
edge_case_ids: [E10, E15, E2, E3]
flow: Boucle principale
---

# Écran — Suivi

> Ce document est la **source de vérité** pour qu'une IA génère l'interface de cet écran.
> Il est généré depuis le gabarit de `skills/forge/templates/screen.md.tmpl`, jamais recopié.

**Scénario de référence de tous les écrans** — on est le **11 avril 2026**, dans une cave,
mode avion. Jean-Luc vient d'ouvrir l'application.

| Devis | Client | Écrit le | Date limite | Total | État |
|---|---|---|---|---|---|
| `D-2026-008` | M. Da Silva | 14 mars 2026 | 13 avril 2026 | 760 euros | envoyé, signé, **validité passée** |
| `D-2026-011` | Mme Nguyen | 15 mars 2026 | 14 avril 2026 | 2 150 euros | envoyé, signé, **validité approche** |
| `D-2026-014` | M. Roux | 15 mars 2026 | 14 avril 2026 | 4 860 euros | **envoyé par courriel**, signé |
| `D-2026-015` | M. Bertrand | 8 avril 2026 | 8 mai 2026 | 18 400 euros | **parti en PDF partagé**, signé |
| `D-2026-016` | Mme Lefèvre | 2 avril 2026 | 2 mai 2026 | 1 240 euros | **écrit ici, pas encore envoyé**, non signé |

---

## 1. Rôle de l'écran

| | |
|---|---|
| **Archétype d'app** | `mobile_field_ops` |
| **Module** | Suivi — rang 1 dans la navigation |
| **Route** | `/suivi` |
| **Type** | page — layout « liste de suivi » |
| **Utilisateurs** | Jean-Luc seul. Le client n'a aucun accès à cet écran, et l'écran ne lui offre rien à ouvrir (E5). |
| **User stories servies** | US-5 (aucun mot de passe, aucune inscription), US-6 (voir ce qui n'est pas sorti), US-7 (suivre sans ouvrir un par un), US-8 (être prévenu avant l'expiration) |
| **Règles métier** | B5, B12, B23, B24, B25, B26 |
| **Edge cases** | E2, E3, E10, E15 |

**Une phrase** : cet écran permet à Jean-Luc de **voir d'un regard ce qui est sorti de ce téléphone et ce qui n'en est pas sorti**, afin de **répondre au téléphone « c'est parti » ou « pas encore parti » sans regarder son appareil**.

**Pourquoi il est au rang 1 de la navigation** : fréquence 5, centralité 5, score 25 — c'est l'entrée la plus utilisée du produit (design-system § 3.2). Jean-Luc ouvre l'application cinq fois par jour pour **constater**, pas pour écrire : le compteur de devis non envoyés y est le plus gros élément de l'écran (B23, E10), et la liste montre l'état de sortie de chaque devis sans sélection (B25).

### 1.1 Ce que cet écran essaie d'éviter

Cet écran essaie d'éviter **qu'un devis écrit et non envoyé devienne une ligne dans une liste de treize**, parce que la perte d'un devis ne se voit au moment où elle a lieu que si elle est comptée. Le risque produit le plus probable n'est pas une panne : c'est le risque écrit au PRD § 8, « les envois s'accumulent sur un chantier sans réseau et Jean-Luc oublie de les envoyer ». Un filtre, un onglet « Tous », un tri par date — toutes les organisations possibles transforment « deux devis pas encore envoyés » en « quatorzième ligne d'une liste triée par date décroissante », et un fait qui est le plus gros élément de l'écran devient une position dans un ordre. L'écran refuse donc **toute organisation qui presided à la frontière entre ce qui est sorti et ce qui ne l'est pas** : trois groupes fixes, dans cet ordre, jamais repliés, jamais fusionnés, jamais filtrables, toujours présents même vides (B26). La seconde chose refusée, c'est l'inverse : il refuse aussi de **dégrad** cet état en alerte. Le compteur à zéro ne dit pas « tout est parti ! » et ne montre aucune illustration de victoire ; le chiffre ne change jamais de couleur quand il devient urgent, parce qu'une couleur de chiffre se prend pour un état, et qu'elle en est déjà un.

### 1.2 Les trois mots, écrits dans l'écran

Le test de validation du produit est un test de langue : Jean-Luc doit pouvoir dire au téléphone « c'est confirmé » ou « pas encore confirmé » **sans regarder l'application**. Les trois mots sont donc **écrits dans les lignes de la liste**, pas dans un glossaire, et jamais dans un menu.

| Mention écrite dans l'écran | Preuve écrite juste en dessous | Où elle apparaît sur cet écran |
|---|---|---|
| `Écrit ici, pas encore envoyé` | `Sur ce téléphone. Pas de réseau ici : il ne peut pas partir tout seul.` | groupe 1 — `D-2026-016` |
| `Envoyé par courriel` | `Confirmé par le service de courriel le 20 mars à 18 h 12.` | groupe 2 — `D-2026-014` |
| `Parti en PDF partagé` | `Le 8 avril, date déclarée par vous. Rien ne l'a confirmée.` | groupe 2 — `D-2026-015` |

Et la quatrième ligne, qui n'est pas un état de sortie mais une autre horloge :

| Ligne d'échéance | Où elle apparaît |
|---|---|
| `La date limite est le 8 mai.` | `D-2026-016`, ligne du groupe 1 |
| `La date limite est le 14 avril — dans 3 jours.` | groupe 3 — `D-2026-011` |
| `La date limite était le 13 avril. Elle est passée.` | groupe 3 — `D-2026-008` |

Le mot `confirmé` n'apparaît **que** dans une ligne de preuve, jamais dans la mention d'état : un état qui dirait « envoyé, confirmé » aurait deux mots pour un seul fait, et le second serait le seul que Jean-Luc dirait au téléphone (design-system § 0.2).

---

## 2. Direction visuelle de cet écran

Repris du design system — **valeurs concrètes, jamais « à définir »**.

| | |
|---|---|
| **Mood** | dense, mate, sans emphase |
| **Densité** | **dense** — l'écran est tenu d'une main dans un local où il faut parfois allumer la lampe, et la PRD § 7.1 interdit tout défilement horizontal : la pression de défilement est donc entièrement verticale. Un devis de douze lignes doit tenir en six déplacements de pouce, pas en douze. |
| **Niveau de contraste** | **fort** — le texte courant est `--color-texte-principal` `#1F1B15` sur `--color-background` `#EDE8DC`, et les quatre mentions d'état portent chacune leur famille de couleur **et** leur mot écrit. Aucun sens n'est porté par la couleur seule. |
| **Surface** | `--color-surface` `#F6F2E9` sur `--color-background` `#EDE8DC` |
| **Accent utilisé** | `--color-encre-foncee` `#26211A` — le fond du **seul** bouton plein de l'écran, `Devis`, en `NavigationBasse`. `--color-texte-encre-signature` `#1F4C6B` est réservé à l'empreinte des devis signés, parce que c'est le seul endroit du produit où c'est la main de Jean-Luc qui a constaté. **Aucun bouton bleu nulle part** (design-system § 0.4). |
| **Traitement photographique** | **AUCUN.** Pas d'image, pas d'icône dans un cercle, pas de dégradé : ce produit ne rend pas de photographes, il rend un devis. |
| **Référence** | `Suivi` et `devis-lignes` sont le même écran vu de deux côtés : la liste de `--color-surface` `#F6F2E9` posée sur le plâtre `--color-background` `#EDE8DC`, c'est une feuille sur un établi. |

### 2.1 Anti-générique — obligatoire

Cet écran ne doit ressembler **à aucun** de ces défauts :

- [x] **Pas de fond blanc pur** `#FFFFFF` par défaut — le fond est `--color-background` `#EDE8DC`, un plâtre chaud. Jamais `#FFFFFF`, jamais `#F8FAFC`.
- [x] **Pas de carte ombrée pour tout.** Aucune carte ici. Les trois groupes sont séparés par de l'espace (`--space-2xl` `32px`) et un filet `--color-bordure-forte` `#4A4234`, jamais par une ombre. `--shadow-sm` `0 1px 2px rgba(31,27,21,0.10)` est réservé à la barre basse, qui masque le contenu.
- [x] **Pas d'uniformité** : la hiérarchie vient de trois rapports d'échelle coexistants — `--text-montant-geant` `44px` pour le compteur, `--text-corps-fort` `17px` pour le nom du client, `--text-mention` `16px` pour la preuve — plus l'épaisseur `--stroke-liseré` `4px` du liseré d'état. Trois niveaux de titre et un chiffre qui se lit à un mètre dans la même colonne.
- [x] **Pas de gris neutre générique** `#6B7280` par défaut — les neutres sont `#1F1B15`, `#4C4436`, `#4A4234`, `#6F6757`, `#BFB59E`, `#8B8272`, tous déclarés au design-system § 1.1 avec un emploi nommé. `#6B7280` n'apparaît nulle part.
- [x] **Pas de mise en page centrée symétrique** — tout est aligné à gauche, marge `--space-lg` `16px`, le compteur compris. Le total est le seul élément non centré de la famille `TotalBloc`, et il n'est pas sur cet écran.
- [x] **Pas d'illustration d'appoint** — l'état vide est une phrase : `Un devis se fait ici, devant le client. Il part ensuite par courriel ou en PDF.`
- [x] **Pas d'une seule famille de police** — `--font-texte` `Archivo` pour tout le texte, `--font-identifiant` `IBM Plex Mono` `15px` pour les numéros `D-2026-016`, parce qu'un identifiant illisible est un identifiant recopié faux.

**Choix assumé et non neutre** : le compteur de devis non envoyés est **le plus gros élément de l'écran**, en `--text-montant-geant` `44px`, et il n'y a **pas de badge** sur la barre basse. Un badge aurait mis le même nombre en pastille rouge, donc l'aurait transformé en alerte — alors qu'un devis non envoyé n'est pas une erreur, c'est un fait. Cet écran refuse donc la moitié du vocabulaire de la barre de notification pour une seule raison : la seule mesure de la perte possible doit se lire de biais, à un mètre, sans que Jean-Luc approche l'écran (E10).

---

## 3. Anatomie

```
┌─────────────────────────────────────────┐
│ BARRE DE HAUTEUR 56px                   │
│  [ Suivi ]                    [ Plus ]  │  ← overflow de configuration
├─────────────────────────────────────────┤
│ FILE ATTENTE — bandeau 44px             │  ← seulement si la file n'est pas vide
│  fait + preuve, en 2 lignes             │  ← jamais un toast, jamais un pourcentage
├─────────────────────────────────────────┤
│ COMPTEUR NON ENVOYÉS — variante         │  ← ÉTAT : se lit, ne se tape pas
│  `principal`                             │
│  chiffre 44px  +  formule               │     design-system § 3.3
│  (+ ligne d'urgence, texte inchangé)    │
├─────────────────────────────────────────┤
│ GROUPE LISTE `primaire` 40px            │
│  Écrits ici, pas encore envoyés   1    │  ← compte affiché même à 0
│  ├ LIGNE 72px : PastilleEtat ×2        │
│  ├ LIGNE 72px : …                      │
│  └ PHRASE VIDE si 0                    │
├─────────────────────────────────────────┤
│ GROUPE LISTE `secondaire` 32px         │
│  Partis, et signés                  2   │
│  ├ LIGNE 72px …                        │
├─────────────────────────────────────────┤
│ GROUPE LISTE `secondaire` 32px         │
│  Validité finie ou proche          2   │
│  ├ LIGNE 72px + LigneEcheance          │
│  └ PHRASE VIDE si 0                    │
├─────────────────────────────────────────┤
│ RAIL D'ACTION 56px — LE POUCE          │  ← tout ce qui est tapé est ici
│  [ Envoyer maintenant | Devis ]         │
├─────────────────────────────────────────┤
│ NAVIGATION BASSE 68px                   │  ← Suivi · Devis · Clients
└─────────────────────────────────────────┘
```

| # | Composant | Rôle | Source |
|---|---|---|---|
| 1 | `FileAttente` variante `barre` | dire que des envois sont partis vers le service et attendent sa confirmation, et que cet état se résoudra seul — sans pourcentage, sans spinner | design-system § 2 |
| 2 | `CompteurNonEnvoyes` variante `principal` | la seule mesure de la perte possible (E10), en `--text-montant-geant` `44px` | design-system § 2 |
| 3 | `GroupeListe` variante `primaire` | les devis écrits ici et non envoyés — le groupe de la perte | design-system § 2 |
| 4 | `GroupeListe` variante `secondaire` | les devis partis et signés | design-system § 2 |
| 5 | `GroupeListe` variante `secondaire` | les validités qui approchent ou qui sont passées | design-system § 2 |
| 6 | `ListeDevis` variante `groupee` | la structure qui tient les trois groupes et leur ordre | design-system § 2 |
| 7 | `PastilleEtat` variante `sortie` | l'état de sortie d'un devis, en mot et non en couleur seule | design-system § 2 |
| 8 | `PastilleEtat` variante `signature` | `Pas encore signé` ou `À resigner`, exigé par B25 sans ouvrir le devis | design-system § 2 |
| 9 | `LigneEcheance` variante `compacte` | la date limite, en toutes lettres, jamais `J-3` | design-system § 2 |
| 10 | `Bouton` variante `contour` | l'action de reprise, `Relancer maintenant`, quand elle est correcte | design-system § 2 |
| 11 | `Bouton` variante `famille-attente` ou `plein` | `Envoyer maintenant` / `Partager en PDF`, puis `Devis` | design-system § 2 |
| 12 | `BandeauMessage` | dire une fois, à l'endroit où ça s'est produit | design-system § 2 |
| 13 | `NavigationBasse` | trois entrées, jamais quatre, et jamais de badge | design-system § 2 |
| 14 | **Barre de hauteur 56px** | le nom de l'écran courant à gauche, l'overflow `Plus` à droite — c'est le seul endroit du produit où une entrée est hors de la barre basse, et c'est le seul endroit où ce n'est pas grave | slice-local, imposé par l'overflow `Plus` du design-system § 3.2 |
| 15 | **Rail d'action bas** | la rangée de 56px qui place toute action principale dans `--zone-pouce` `96px` | slice-local, imposé par `--zone-pouce` et par le layout du design-system § 3.1 |

---

## 4. États — tous, sans exception

| État | Déclencheur | Rendu | Feedback utilisateur |
|---|---|---|---|
| **Chargement** | Ouverture de l'application | **Aucun squelette animé, aucun spinner.** Le magasin local est sur l'appareil et répond en moins d'une frame (C1) : un squelette serait un mensonge sur la vitesse. L'écran s'ouvre directement sur son contenu ; si le contenu n'est pas encore là, ce sont les trois groupes à leur état vide qui s'affichent, avec leurs phrases. | rien — l'ouverture est instantanée |
| **Rempli** | Au moins un devis existe sur l'appareil | Le compteur `CompteurNonEnvoyes`, puis les trois `GroupeListe` **en entier, sans défilement interne** : la liste défile, l'écran ne possède pas de zone de défilement séparée. Les lignes sont séparées par un filet `--color-tiret` `#BFB59E`. | le chiffre se lit à un mètre |
| **Vide — jamais visité** | Première ouverture, aucun devis sur l'appareil | Compteur à l'état `zero` : `Aucun devis en attente d'envoi.` en `--text-corps` `17px`, et **rien d'autre** — pas de `0`, pas d'illustration, pas de `Tout est parti !`. Puis les trois groupes à `vide-depuis-toujours`, et la phrase qui dit ce que le produit fait : `Un devis se fait ici, devant le client. Il part ensuite par courriel ou en PDF.` | aucun ; un écran d'accueil d'une installation neuve **dit ce qu'il fait**, il n'attend pas qu'on le devine |
| **Vide — aucune donnée** | Les groupes ont contenu des devis et n'en contiennent plus tous | `GroupeListe` à l'état `vide-aujourdhui` : `Aucun devis écrit aujourd'hui n'est encore parti.` La différence entre les deux vides est celle entre « rien n'a jamais eu lieu » et « ce qui avait lieu est résolu », et elle est écrite dans la phrase, pas dans une icône. | aucun |
| **Erreur de chargement** | Le magasin local ne répond pas | **Le contenu déjà affiché reste affiché** — on ne remplace pas une liste lisible par une panne. Au-dessus, un `BandeauMessage` en état `echec` : `Les devis écrits sur ce téléphone ne sont pas lisibles.` puis `Vos devis sont encore là.` et une seule action : `Réessayer la lecture`. | bandeau en `--color-expire-fond` `#F4DED8`, filet gauche `--color-bordure-expire` `#B45A48` `4px`, **il ne s'efface pas** — un échec n'a laissé de trace nulle part ailleurs |
| **Erreur de soumission** | L'action du rail est `Envoyer maintenant` et l'envoi est refusé par le service, ou le réseau manque | Le devis **ne bouge pas** d'état : il reste à `Écrit ici, pas encore envoyé` (B6). L'action du rail passe en `Relancer maintenant`, et le bandeau de file passe à `impossible` : `Le service de courriel ne répond pas. Les 2 devis attendront, et repartiront seuls.` La reprise se fait sans ressaisie (PRD § 7.5). | bandeau `echec` persistant + `Relancer maintenant` actif |
| **Succès** | Le service de courriel confirme un envoi | Un `BandeauMessage` en état `succes` : `Envoyé par courriel. Confirmé par le service de courriel à 18 h 12.` — **le texte contient toujours la mention complète**, jamais `C'est fait !`, jamais de point d'exclamation. **Simultanément**, le compteur baisse, la ligne quitte le groupe 1 pour le groupe 2, et la bande de file baisse son nombre **immédiatement** (B23). | bandeau vert `--color-confirme-fond` `#DEEAE1`, 6 s, puis rien — parce que la mention d'état, elle, ne s'efface jamais |
| **Hors-ligne / permissions** | Mode avion, en cave | **Aucun message d'erreur, aucune alerte.** C'est le fonctionnement normal de ce produit (C1). La bande de file passe à `impossible` et écrit pourquoi : `Pas de réseau ici. Les devis écrits ici ne peuvent pas partir maintenant.` L'action du rail devient `Partager en PDF`, qui n'a besoin d'aucun réseau. Les trois groupes restent intégralement lisibles. | rien d'alarmant ; l'état est écrit, pas signalé |
| **Lecture seule** | Le devis de la ligne est signé et sa signature est valide | La ligne du groupe 2 porte en plus l'empreinte `4f2a…9c1d` en `--font-identifiant` `IBM Plex Mono` `15px` et `--color-texte-encre-signature` `#1F4C6B`. **Aucune action de modification n'est proposée sur une ligne** : un document signé est figé, et l'écran ne propose rien qui le déferait (B10, B11). | — |

> Un état non décrit est un état non implémenté.

---

## 5. Interactions

| Élément | Événement | Comportement | Feedback visuel | État résultant | ID |
|---|---|---|---|---|---|
| Compteur non envoyés | tap | **Aucun comportement.** Le compteur n'est pas cliquable : il est un fait, pas un contrôle. Une icône de chaîne ou de chevron à côté du `44px` dirait qu'il reste un écran derrière, et il n'y en a pas. | — | — | B23 |
| Action du rail — gauche | tap | Un seul emplacement, trois libellés, choisis par priorité. **`impossible`** → `Relancer maintenant`, actif. Sinon, **réseau présent** → `Envoyer maintenant`, qui passe par `FeuilleSortie` et exige une signature valide. Sinon, **pas de réseau** → `Partager en PDF`, qui passe par `FeuillePartage` et exige lui aussi une signature valide. Si aucun devis n'est signé, les trois sont en `desactive` avec la raison écrite sous le bouton : `Signer d'abord : un devis sans signature ne part pas.` | `Bouton` `contour` `--color-bordure-forte` `#4A4234`, ou `famille-attente` `--color-bordure-attente` `#A05E27` ; `famille-attente` **jamais** `plein` | file vide → bandeau absent ; sinon bandeau `attente` ou `impossible` | B7, B9 |
| Action du rail — droite, `Devis` | tap | Ouvre `/devis` : la saisie, sans écran de liste intermédiaire (design-system § 3.2). Le bouton ne disparaît jamais, même quand le compteur est à zéro : c'est le début de la boucle, pas une récompense. | `Bouton` `plein` `--color-encre-foncee` `#26211A`, texte `--color-texte-inverse` `#FBF9F4`, 56px | écran de saisie | US-1 |
| Bandeau de file | tap | **Aucun comportement.** Il se lit. Un bandeau cliquable inventerait une action derrière, et il n'y en a pas. | — | — | B6 |
| Ligne de devis | tap | Push vers `/devis/D-2026-016`. **La liste retrouve l'endroit exact où elle était** au retour (design-system § 3.4). | glissement vertical `--duration-normal` `220ms`, `--ease-default` `cubic-bezier(0.2, 0, 0, 1)` | `devis-detail` | B25 |
| Groupe replié | tap | **Les groupes ne se replient pas.** Il n'y a pas de chevron, pas de geste de repli, pas de state persistante. B26 demande trois groupes toujours affichés. | — | — | B26 |
| Clic dans le vide de la liste | tap | Rien. Aucun geste de pull-to-refresh : la liste vient de l'appareil, elle n'est pas distante, et un geste de rafraîchissement qui ne peut rien charger ajoute un espacement de geste pour une information fausse. | — | — | C1 |
| `Plus`, en haut à droite | tap | Ouvre l'overflow `Plus`, qui ne contient qu'une entrée : `Réglages`. **Une seule entrée dans un menu de trois est un menu inutile** — donc `Plus` n'est pas un menu, c'est un `Bouton` variante `discret` étiqueté `Réglages`, en haut à droite, cible `--hauteur-cible` `56px`. Il est **volontairement en haut**, et c'est la seule dérogation du produit à la règle « l'action en bas » : la configuration s'ouvre **une fois par an**, alors que le rail du bas porte la boucle, ouverte cinq fois par jour. Et la promesse qui compte — tout télécharger (B24) — reste **à un geste de l'écran le plus utilisé**, parce que `Réglages` est à un geste de `Suivi`. | `--text-etiquette` `14px` capitales, `--color-texte-secondaire` `#4C4436` | `reglages` | B24 |

- **Focus / clavier** : ordre de tabulation — `Réglages` en haut, puis action du rail gauche, `Devis`, puis les trois entrées de la barre basse. Sur un devis signé, l'empreinte `4f2a…9c1d` est le premier texte focusable de sa ligne, et son `aria-label` est `Empreinte de la signature du devis D-2026-014, 4f2a…9c1d`. Anneau de focus `--color-bordure-focus` `#8A4A0E`, `--stroke-focus` `3px`, jamais supprimé, jamais 2px : c'est le seul repère au clavier dans une cave.
- **Gestes** : défilement vertical natif, avec rebond de fin de liste à `--duration-fast` `120ms`. **Aucun geste latéral** — un retour latéral se fait vers la droite, et un geste vers la droite n'est pas un geste de pouce sur un téléphone tenu d'une main. **Aucun pull-to-refresh**, pour la raison ci-dessus.
- **Animations** : le chiffre du compteur ne défile pas et ne s'incrémente pas en boucle — un compteur qui s'anime est un compteur dont la valeur n'est pas encore connue. Le changement d'une mention d'état d'une ligne dure **zéro milliseconde** : `--text-mention` passe de `Écrit ici` à `Envoyé` instantanément, sans fondu, parce qu'un fondu invite à regarder **pendant** la transition, donc à douter de ce qu'on a vu. La seule animation de cet écran est l'entrée, `--duration-slow` `320ms`, `--ease-default` `cubic-bezier(0.2, 0, 0, 1)`.
- **Retour arrière** : le bouton `Retour` n'existe pas sur cet écran, qui est la racine. Le retour système ramène à l'écran précédent de l'onglet système, ou ferme. Il **ne demande rien** et ne déclenche aucune confirmation : rien n'y a été modifié.

---

## 6. Responsive

| Breakpoint | Comportement | Ce qui se replie / disparaît |
|---|---|---|
| **Mobile** `--bp-telephone` 0 — 479px | Une colonne, marge `--space-lg` `16px`. La barre de hauteur fait `--hauteur-cible` `56px`, `Réglages` à droite. Le rail d'action est à 56px de haut, pleine largeur moins `--space-lg` `16px` de chaque côté, juste au-dessus de la barre basse de `--hauteur-barre-basse` `68px`. **Les deux actions tiennent dans la portée de pouce** : la gauche au-dessus du tiers gauche, la droite au-dessus du tiers droit, donc toutes deux au-dessus du bord droit de la main qui tient l'appareil. | rien — c'est la cible |
| **Tablet** `--bp-tablette` 480 — 1023px | Marge `--space-xl` `24px`. Le rail d'action devient deux colonnes de largeur égale, les deux boutons à `--hauteur-cible` `56px`. Le compteur passe à `--text-montant-geant` `44px` avec la formule sur la ligne de droite du bloc. **C'est le format où Jean-Luc montre l'écran au client**, donc les lignes de devis passent en lecture `etendue` : désignation sur toute la largeur, puis les nombres alignés. | rien |
| **Desktop** `--bp-poste` 1024 — 1439px | Deux colonnes : les trois groupes à gauche sur 360px, le devis ouvert à droite. La séparation est **la différence de valeur de fond** — liste en `--color-surface` `#F6F2E9`, page ouverte en `--color-background` `#EDE8DC` — pas une ombre, pas une bordure. | rien |
| **Large** `--bp-large` 1440px et plus | Trois colonnes : navigation, liste, devis. Contenu plafonné à `--space-3xl` `48px` de marge. La barre basse **reste en bas** et prend toute la largeur : c'est la seule chose qui ne change pas, et c'est délibéré — elle ne devient jamais un menu latéral, parce qu'un menu au bord gauche d'un téléphone tenu de la main droite est un geste de pouce impossible. | rien |

- **Cible tactile** : `--hauteur-cible` `56px` minimum pour toute cible principale — le plancher de la PRD § 7.3 est 48px, 48 est le plancher, et avec un gant de chantier la marge d'erreur réelle est d'environ 8px. Les trois entrées de la barre basse ont chacune 56px. Les deux actions du rail ont 56px. Le liseré d'état `--stroke-liseré` `4px` n'est **pas** une cible : il porte l'information, il ne se tape pas.
- **Débordement** : **aucun défilement horizontal, jamais**, sur aucun breakpoint — c'est une exigence de la PRD § 7.1 et la seule dont la violation rendrait l'écran inutilisable sur l'appareil que Jean-Luc possède. Garanti par construction : les nombres d'un devis sont tabulaires et leur colonne a une largeur fixe ; la désignation d'une ligne est le seul texte qui peut déborder, et elle passe sur **deux lignes au maximum** avec un `--text-corps` `17px` inchangé — jamais de `…` sur un montant, jamais de réduction de taille, jamais de `J-3` à la place d'une date.

---

## 7. Accessibilité

- [ ] **Contraste du texte courant** : mesuré par `node "$FORGE/scripts/design-check.js" contrast <anchor>` — **aucun ratio n'est écrit dans ce document**. Le design-system § 0.0 l'interdit : un ratio rédigé à la main est un nombre fabriqué, qui donne une assurance que rien ne soutient et qui devient faux au premier ajustement de palette.
- [ ] **Contraste des grands textes et des montants** : mesuré par le même contrôle, sur les `--text-montant-geant` `44px`, `--text-h1` `30px` et `--text-mention` `16px`.
- [ ] **Navigation clavier complète** sur `--bp-poste` et `--bp-large` : action du rail, `Devis`, trois entrées de barre, puis chaque ligne de devis, dans l'ordre de lecture des trois groupes.
- [ ] **Focus visible** : anneau `--color-bordure-focus` `#8A4A0E`, `--stroke-focus` `3px`, décalé de 2px vers l'extérieur, jamais supprimé. Sur un fond sombre hypothétique, l'anneau serait `--color-bordure-focus-inverse` `#F5D9A8` — mais ce fond n'existe pas sur cet écran, donc ce token n'est pas cité ici.
- [ ] **ARIA** : chaque `PastilleEtat` expose son libellé en texte et `aria-hidden` sur son icône, parce que ni la couleur ni l'icône ne portent le sens seules. Le bandeau de file est `role="status"` `aria-live="polite"` : il annonce un fait qui s'est résolu seul, et il ne doit pas interrompre. Le bandeau d'échec est `role="alert"`. Le compteur porte `aria-label="2 devis écrits ici, pas encore envoyés"`.
- [ ] **Texte alternatif** : **aucune image sur cet écran**, donc aucune alternative à écrire. C'est une conséquence du design, pas un oubli — un état vide est une phrase, pas un dessin.
- [ ] **Langue et direction de lecture** : `lang="fr"`, `dir="ltr"`. Les nombres sont tabulaires et les dates en toutes lettres : `13 avril 2026`, jamais `13/04`, jamais `J-3` — Jean-Luc parle en dates et les prononce au téléphone.

---

## 8. Données

| Champ | Type | Origine | Requis | Erreur possible |
|---|---|---|---|---|
| `devis.numero` | texte, `D-2026-016` | magasin local | oui | jamais absent : un devis enregistré porte toujours son numéro (B1) |
| `devis.date-ecriture` | date | magasin local | oui | jamais absente — c'est elle qui fait courir la validité (B12, E15) |
| `devis.date-limite` | date | calculé à l'écriture | oui | recalculé **jamais** à l'envoi : un devis envoyé trois semaines plus tard garde son terme d'origine |
| `devis.etat-sortie` | énumération `attente` \| `confirme` \| `declaration` | magasin local | oui | incohérence refusée à la lecture : un état `confirme` sans confirmation horodatée est rejeté et traité comme `attente` |
| `devis.signature.empreinte` | texte, `4f2a…9c1d` | magasin local | non | absente tant que le devis n'est pas signé — et son absence est affichée, pas devinée |
| `devis.etat-echeance` | énumération `en-cours` \| `approche` \| `passee` | calculé sur l'horloge | oui | jamais stocké : c'est une horloge, pas un fait à écrire |
| `file.attente` | liste de numéros | file locale | non | file vide = bandeau absent, pas un `0 sur 0` |
| `reseau` | booléen | état du navigateur | oui | faux par défaut : tant que le réseau n'est pas confirmé, l'écran ne suppose pas qu'il existe |
| `client.nom` | texte | magasin local | oui | — |

- **Chargement** : **tout d'un bloc**, et en pratique instantané — le magasin local est sur l'appareil (SQLite compilé sur OPFS, conventions.md). Il n'y a ni pagination ni défilement infini sur les trois groupes : un devis de plus de treize lignes fait dix groupes de défilement de pouce, et un artisan qui fait trente devis par an n'a jamais plus de trente devis. Si le nombre dépasse ce que l'écran sait tenir confortablement, on ajoute un groupe — **jamais une pagination invisible**.
- **Cache / hors-ligne** : **ce écran est le hors-ligne.** Il n'a aucun état réseau à charger : il lit le magasin local et c'est tout. Le seul champ qui change de valeur selon le réseau est `reseau`, qui ne sert qu'à choisir entre trois libellés d'action et à écrire la preuve `1b`.
- **Données sensibles** : aucune adresse de client, aucun téléphone, aucun courriel n'est rendu sur cet écran — un nom, un numéro de devis, un total, une date. L'adresse de facturation (E12) **n'apparaît que dans le dossier client**, une fois, à sa place. Aucun de ces textes n'est jamais écrit dans un journal : le journal d'audit enregistre l'état de sortie, l'horodatage et le numéro, jamais le nom du client.

---

## 9. Traçabilité

| ID | Origine | Manifestation sur cet écran |
|---|---|---|
| B5 | PRD | Les trois mentions sont **écrites dans les lignes**, pas dans un glossaire : `Écrit ici, pas encore envoyé` sur le groupe 1, `Envoyé par courriel` et `Parti en PDF partagé` sur le groupe 2. Un devis listé n'a jamais d'état indéterminé : il est dans l'un des deux premiers groupes, ou dans le troisième. |
| B6 | PRD | `Envoyé par courriel` n'apparaît qu'après confirmation, et sa preuve nomme le service : `Confirmé par le service de courriel le 20 mars à 18 h 12.` Un devis dont l'envoi a été tenté sans retour reste au groupe 1 avec la preuve `1c`. |
| B7 | PRD | Le rail n'expose jamais deux envois. En état `attente`, l'action propose l'état de sortie, pas un renvoi : `Relancer maintenant` ne ré-envoie pas un courriel au client (B7), il repose la question au service. |
| B12 | PRD | La durée de validité court depuis la date écrite sur le devis. `D-2026-016`, écrit le 2 avril, affiche `La date limite est le 2 mai.` — pas de date recalculée à l'affichage, donc pas de date recalculée à l'envoi (E15). |
| B23 | PRD | Le compteur est le plus gros élément de l'écran, en `--text-montant-geant` `44px`, permanent, exact, jamais arrondi, jamais masqué. Il baisse **immédiatement** à la confirmation. |
| B24 | PRD | `US-6` : le rail gauche est `Envoyer maintenant` s'il reste un réseau, `Partager en PDF` sinon — le partage en un geste de tout ce qui n'est pas sorti. |
| B25 | PRD | Sans ouvrir un devis : `PastilleEtat` de sortie, `PastilleEtat` de signature (`Pas encore signé`, `À resigner`), `LigneEcheance` compacte. Les trois tiennent sur la ligne de 72px, en mot et non en couleur. |
| B26 | PRD | Trois groupes fixes, dans cet ordre, jamais repliés, jamais filtrables, **affichés même vides** avec leur compte à `0` et leur phrase. Un groupe vide ne ressemble pas à une panne. |
| E2 | PRD | L'écran lit le magasin local : une coupure au milieu d'une saisie ne change rien à l'affichage, et le devis retrouvé est identique ligne pour ligne (B4). |
| E3 | PRD | Un envoi tenté sans retour laisse le devis dans le groupe 1, avec la preuve `1c` : `Envoi tenté le 20 mars à 18 h 12, sans réponse du service. Personne ne peut dire s'il est parti.` |
| E10 | PRD | Le compteur est la seule mesure de la perte possible quand l'appareil peut disparaître. Il est permanent et exact, et il ne porte ni badge, ni Pastille, ni couleur d'alerte. |
| E15 | PRD | `D-2026-016`, écrit puis jamais envoyé, est dans le groupe 1 à son état exact, avec sa date. Il ne disparaît pas au bout de trois semaines et son terme ne bouge pas. |
| C1 | PRD | Aucune action de cet écran ne suppose la connexion. Hors-ligne n'est pas un état d'erreur : c'est le fonctionnement normal, et il n'y a ni message d'erreur ni icône d'avertissement. |
| C7 | PRD | Aucun mot, aucune tuile, aucun lien vers une comptabilité. Le produit ne dit nulle part qu'il tient un compte, parce qu'il n'en tient pas. |
| C8 | PRD | Aucune mention d'encaissement, ni par carte ni par virement : ce n'est pas le sujet d'un écran de suivi, et le prix du paiement par carte est écrit au seul endroit où il doit l'être — `reglages` § 2. |

---

## 10. Checklist de gate

- [x] Les états sont décrits avec un rendu concret — les neuf lignes du tableau § 4 portent des libellés écrits, pas des intentions. Les deux états vides ont chacun **une phrase différente**, parce que « rien n'a jamais eu lieu » et « ce qui avait lieu est résolu » ne sont pas le même fait.
- [x] Chaque élément interactif a un comportement et un feedback — et **trois éléments ont explicitement « aucun comportement »**, qui est une décision : le compteur, le bandeau de file et le vide de la liste ne sont pas cliquables. Ils ne sont pas décoratifs, ils sont des faits.
- [x] Le responsive est défini à **chaque** breakpoint du design system : `--bp-telephone`, `--bp-tablette`, `--bp-poste`, `--bp-large`, avec les valeurs `--space-lg` `16px` et `--space-xl` `24px` citées.
- [x] La section Anti-générique est cochée et justifiée, une ligne par ligne, avec la valeur du token qui la rend vraie.
- [x] Aucune valeur de design n'est laissée à « à définir ». Les sept points de contact avec le pouce sont écrits en chiffres : `--zone-pouce` `96px`, `--hauteur-cible` `56px`, `--hauteur-barre-basse` `68px`, `--marge-basse` `24px`.
- [x] Chaque ID B*/E*/C* de cet écran apparaît en section 9 : B5, B6, B7, B12, B23, B24, B25, B26, E2, E3, E10, E15, C1, C7, C8.
- [x] Aucun gabarit non résolu : le contrôle `node "$FORGE/scripts/state.js" placeholders` n'a rien à signaler ici.
- [x] L'écran reste cohérent avec `.forge/design/design-system.md` : il ne cite que des tokens que le design-system déclare, avec la valeur qu'il déclare, et il ne rend aucun composant en dehors de sa surface d'états.