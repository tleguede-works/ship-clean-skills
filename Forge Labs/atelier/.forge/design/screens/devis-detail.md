---
type: screen
slug: devis-detail
title: Détail du devis
module: Suivi
status: draft
generated_at: 2026-10-01
derived_from:
  - .forge/prd.md
  - .forge/design/design-system.md
  - .forge/roadmap.md
rule_ids: [B1, B3, B5, B6, B9, B10, B11]
edge_case_ids: [E6, E15, E7, E13]
flow: Boucle principale
---

# Écran — Détail du devis

> Ce document est la **source de vérité** pour qu'une IA génère l'interface de cet écran.
> Il est généré depuis le gabarit de `skills/forge/templates/screen.md.tmpl`, jamais recopié.

**Scénario** — `D-2026-016`, Mme Lefèvre, écrit le 2 avril 2026, date limite le 2 mai 2026,
total `1 240 euros`, **non signé, écrit ici, pas encore envoyé**. Nous sommes le 11 avril 2026,
dans une cave, sans réseau. Jean-Luc vient d'ouvrir ce devis trois semaines après l'avoir écrit.

---

## 1. Rôle de l'écran

| | |
|---|---|
| **Archétype d'app** | `mobile_field_ops` |
| **Module** | push depuis `suivi` — pas d'entrée de navigation propre |
| **Route** | `/devis/:numero` |
| **Type** | page — layout « document » |
| **Utilisateurs** | Jean-Luc seul. **Jamais le client** : le client ne voit que `signature`, et rien d'autre n'est atteignable de là (E5). |
| **User stories servies** | US-1 (un devis complet et identique après réouverture), US-3 (savoir si c'est parti), US-7 (suivre sans ouvrir un par un) |
| **Règles métier** | B1, B3, B5, B6, B9, B10, B11 |
| **Edge cases** | E6, E7, E13, E15 |

**Une phrase** : cet écran permet à Jean-Luc de **relire un devis comme une feuille de papier et de savoir exactement où il en est**, afin de **répondre au téléphone sans hésiter, et de décider si le devis peut sortir**.

**Pourquoi il est un push et non une entrée de navigation** : le détail est modal ou push, jamais une nouvelle entrée. Une entrée par type de document produirait quatre entrées de barre basse et un accueil qui demande de choisir avant d'avoir fait quoi que ce soit. Le push porte un bouton `Retour à Suivi` explicite de `--hauteur-cible` `56px`, en haut à gauche, avec le **nom de l'écran d'où l'on vient** — parce que sur un écran d'encre, en plein soleil, le mot dit où on va et pas d'où on vient.

### 1.1 Ce que cet écran essaie d'éviter

Cet écran essaie d'éviter **la place où Jean-Luc se tromperait de mot au téléphone**. C'est le seul écran du produit où les trois mots du vocabulaire tiennent sur une même feuille, et c'est donc le seul endroit où une formulation glissante ferait le plus de dégâts : il regarde cette page cinq fois par jour, et il en retient une formule. L'ordre des trois blocs en bas du document est donc une règle, pas une préférence : **le montant, puis la date limite, puis l'état de sortie.** Le montant est la réponse à la question du client. L'échéance est la contrainte qu'il doit connaître. L'état de sortie est ce qu'il dira au téléphone. Un écran qui commence par l'état de sortie commence par ce qui est le moins urgent et le plus facile à mal comprendre. Et l'état ne commence **jamais** par le mot `confirmé` : la mention porte le fait, la ligne de preuve porte la source du fait, et `Confirmé par le service de courriel le 20 mars à 18 h 12.` est la seule ligne où ce mot apparaît. La seconde chose refusée est **l'action qui ressemble aux actions déjà connues**. `Envoyer` est en `Bouton` variante `famille-attente` — filet `--color-bordure-attente` `#A05E27` `2px`, jamais `plein` : l'action la plus dangereuse du produit ne doit pas ressembler à une action acquise, parce que tout ce qui ressemble à un bouton bleu dans les applications que Jean-Luc utilise déjà est une action dont l'effet est certain et sans conséquence (design-system § 0.4). La troisième est **la modification silencieuse après signature** : au premier changement, la signature est barrée, la mention `À resigner` s'inscrit dans l'en-tête, et le devis ne peut pas ressortir avant une nouvelle signature — parce que sinon la signature ne prouverait pas que c'est ce texte-là qui a été signé.

### 1.2 Les trois mots, écrits dans l'écran

Les trois mentions et leurs preuves sont **écrites dans la feuille**, pas dans un glossaire, et chacune s'affiche avec la variante de preuve qui correspond à son cas. C'est exactement ce qui permet à Jean-Luc de dire « pas encore confirmé » sans regarder l'application.

| Cas | Mention écrite | Preuve écrite juste en dessous | Qui a constaté |
|---|---|---|---|
| Jamais tenté, réseau présent | `Écrit ici, pas encore envoyé` | `Sur ce téléphone. Personne ne l'a reçu.` | personne |
| Jamais tenté, **pas de réseau ici** | `Écrit ici, pas encore envoyé` | `Sur ce téléphone. Pas de réseau ici : il ne peut pas partir tout seul.` | personne |
| Tenté, sans retour du service | `Écrit ici, pas encore envoyé` | `Envoi tenté le 8 avril à 11 h 04, sans réponse du service. Personne ne peut dire s'il est parti.` | personne |
| Confirmé par le service | `Envoyé par courriel` | `Confirmé par le service de courriel le 20 mars à 18 h 12.` | le service de courriel |
| Partagé en PDF | `Parti en PDF partagé` | `Le 8 avril, date déclarée par vous. Rien ne l'a confirmée.` | Jean-Luc |

Et la quatrième ligne, qui est une autre horloge et pas un état de sortie :

`La date limite est le 2 mai.` · `La date limite est le 14 avril — dans 3 jours.` · `La date limite était le 13 avril. Elle est passée.`

---

## 2. Direction visuelle de cet écran

Repris du design system — **valeurs concrètes, jamais « à définir »**.

| | |
|---|---|
| **Mood** | dense, mate, sans emphase |
| **Densité** | **dense** — c'est une page de devis, pas une fiche de résumé : douze lignes de travaux doivent tenir en six déplacements de pouce. La densité vient de l'absence de conteneurs, jamais d'une taille de texte réduite. |
| **Niveau de contraste** | **fort** — le montant en `--color-texte-principal` `#1F1B15`, les dates et quantités en `--color-texte-secondaire` `#4C4436`. Les quatre lignes de pied ne se concurrencent pas entre elles : chacune a sa famille de couleur **et** son mot, jamais une couleur seule. |
| **Surface** | `--color-surface` `#F6F2E9` — la page du devis — sur `--color-background` `#EDE8DC`. **Aucune ombre** : le document est une feuille de papier posée sur le plâtre, et son seul repère est le filet `--color-bordure-forte` `#4A4234`. |
| **Accent utilisé** | `--color-encre-foncee` `#26211A` pour le bouton plein de la barre d'action, `--color-texte-encre-signature` `#1F4C6B` pour l'empreinte du texte signé, `--color-bordure-attente` `#A05E27` pour le filet de `Envoyer`. **Aucun bouton bleu** : le bleu n'apparaît que sur ce que Jean-Luc a constaté de sa main. |
| **Traitement photographique** | AUCUN. Pas de vignette de page, pas de coin de feuille. Le bord du devis est droit, `--radius-none` `0` : c'est une feuille de papier. |
| **Référence** | le devis que Jean-Luc écrit à la main : une page, un tableau, un total encerclé, une signature en bas. L'application rend ce papier, elle ne le remplace pas par un tableau de bord. |

### 2.1 Anti-générique — obligatoire

Cet écran ne doit ressembler **à aucun** de ces défauts :

- [x] **Pas de fond blanc pur** `#FFFFFF` — la page est `--color-surface` `#F6F2E9` sur `--color-background` `#EDE8DC`.
- [x] **Pas de carte ombrée pour tout.** Aucune carte. Les trois blocs du pied — montant, échéance, état — sont séparés par `--space-xl` `24px` et un filet `--color-bordure-forte` `#4A4234`. `--shadow-sm` `0 1px 2px rgba(31,27,21,0.10)` est réservé à la barre basse, au-dessus du contenu qu'elle masque.
- [x] **Pas d'uniformité** : cinq niveaux coexistent dans une seule colonne — `--text-h1` `30px` pour le nom du client, `--text-montant-geant` `44px` pour le total, `--text-identifiant` `15px` pour le numéro, `--text-corps` `17px` pour une désignation, `--text-mention` `16px` pour les preuves. Et une échelle d'espacement à deux valeurs : `--space-lg` `16px` entre deux lignes, `--space-2xl` `32px` entre deux blocs.
- [x] **Pas de gris neutre générique** `#6B7280` — les dates sont `--color-texte-secondaire` `#4C4436`, les filets `--color-tiret` `#BFB59E`.
- [x] **Pas de mise en page centrée symétrique** — tout est aligné à gauche, marge `--space-lg` `16px`. **Le total est le seul élément de l'application qui n'est pas centré**, et c'est précisément ce qui l'empêche d'être pris pour un élément décoratif.
- [x] **Pas d'illustration d'appoint** — pas d'icône d'état dans un cercle, pas de coche verte à côté de la mention : la mention est un mot en toutes lettres, et elle suffit.
- [x] **Pas d'une seule famille de police** — `--font-texte` `Archivo` pour le texte, `--font-identifiant` `IBM Plex Mono` `15px` pour `D-2026-016` et pour `4f2a…9c1d`. L'identifiant se lit à voix haute au téléphone et se recopie d'un devis à une facture : dans une police proportionnelle, `1`, `l` et `I` se ressemblent, donc un identifiant illisible est un identifiant recopié faux, donc un document faux.

**Choix assumé et non neutre** : **les trois lignes de pied ne sont jamais réunies dans une seule pastille.** L'état de sortie est présenté en `EtatSortie` variante `bloc` — un liseré gauche `--stroke-liseré` `4px` de sa famille de couleur, un fond de famille, la mention, puis sa preuve. Le liseré se voit de biais quand une pastille se perd dans le bruit, et dans un document c'est la seule place où une couleur d'état peut porter une information **sans être la seule à la porter**, parce que le mot écrit juste à côté dit le même fait. C'est le seul endroit du produit où l'épaisseur porte un sens.

---

## 3. Anatomie

```
┌─────────────────────────────────────────┐
│ FILE ATTENTE — bandeau 44px             │
├─────────────────────────────────────────┤
│ BARRE DE HAUTEUR 56px                   │
│  `Retour à Suivi`                       │
├─────────────────────────────────────────┤
│ EN TÊTE DEVIS `complet` — 96px + lignes │
│  D-2026-016   (mono 15px)               │
│  2 avril 2026  ·  Valable 30 jours      │
│  Mme Lefèvre                    h3 20px │
├─────────────────────────────────────────┤
│ CORPS DU DEVIS — --color-surface        │
│  LIGNE DEVIS `compacte` × n             │
│  Pose de trois fenêtres coulissantes    │
│                    2 × 1 240 € = 2 480  │
│  …                                      │
│  ─────────────────────────────────────  │
│  LIGNE DEVIS `prix-zero` conservée      │
├─────────────────────────────────────────┤
│ TOTAL BLOC `fige` — 96px                │
│  1 240 euros             (44px, 700)     │
│  ─────────────────────────────────────  │
│  LIGNE ÉCHÉANCE :                       │
│  La date limite est le 2 mai.           │
│  ─────────────────────────────────────  │
│  ÉTAT SORTIE `bloc` — liseré gauche 4px │
│  Écrit ici, pas encore envoyé           │
│  Sur ce téléphone. Pas de réseau ici :  │
│  il ne peut pas partir tout seul.       │
├─────────────────────────────────────────┤
│ BARRE D'ACTION 60px — LE POUCE         │
│  BOUTON `famille-attente` `Envoyer`     │
├─────────────────────────────────────────┤
│ NAVIGATION BASSE 68px                   │
└─────────────────────────────────────────┘
```

| # | Composant | Rôle | Source |
|---|---|---|---|
| 1 | `EnTeteDevis` variante `complet` | l'identité du document : numéro, date écrite, client, durée de validité | design-system § 2 |
| 2 | `EnTeteDevis` variante `expire` | le même en-tête, durée barrée et mention d'échéance, à l'état `passee` | design-system § 2 |
| 3 | `EnTeteDevis` état `lecture` | l'en-tête signé, plus le bloc d'empreinte | design-system § 2 |
| 4 | `LigneDevis` variante `compacte` | les lignes de travaux, en tabulaires alignés | design-system § 2 |
| 5 | `LigneDevis` état `prix-zero` | une ligne à prix zéro, **conservée et affichée** (E13) | design-system § 2 |
| 6 | `TotalBloc` variante `fige` | le montant, la date limite et l'état de sortie, dans cet ordre | design-system § 2 |
| 7 | `LigneEcheance` variante `compacte` | la date limite en une ligne, dans la phrase entière | design-system § 2 |
| 8 | `EtatSortie` variante `bloc` | la mention d'état et sa preuve — deux lignes, dans cet ordre | design-system § 2 |
| 9 | `Bouton` variante `famille-attente` | l'action `Envoyer`, et elle seule, **jamais** `plein` | design-system § 2 |
| 10 | `Bouton` variante `famille-confirme` | `Envoyer à nouveau` quand le devis est déjà sorti | design-system § 2 |
| 11 | `Bouton` variante `plein` taille `grande` | `Signer` quand aucune signature n'existe | design-system § 2 |
| 12 | `Bouton` variante `discret` | `Modifier`, `Annuler`, un lien d'explication | design-system § 2 |
| 13 | `BandeauMessage` | dire une fois, à l'endroit où ça s'est produit | design-system § 2 |
| 14 | `FileAttente` | l'état global d'envoi | design-system § 2 |
| 15 | `NavigationBasse` | la sortie du push | design-system § 2 |
| 16 | **Barre de retour 56px** | `Retour à Suivi`, avec le nom de l'écran d'où l'on vient | slice-local, imposé par le design-system § 3.4 |

---

## 4. États — tous, sans exception

| État | Déclencheur | Rendu | Feedback utilisateur |
|---|---|---|---|
| **Chargement** | Ouverture depuis `suivi`, `clients` ou la barre basse | **Aucun squelette.** Le devis est dans le magasin local et s'ouvre sans attendre le réseau (PRD § 7.1). L'en-tête s'affiche, puis le corps, puis le pied. | rien |
| **Rempli** | Le devis existe et n'est pas signé | Le document entier : en-tête, lignes, `TotalBloc` `fige`, `EtatSortie` `bloc`, barre d'action. La barre d'action porte `Signer` en `Bouton` `plein` taille `grande`, et **rien n'est proposé pour l'envoyer** : B9 rend la sortie impossible sans signature. | — |
| **Vide — jamais visité** | — | **Cet état n'existe pas sur cet écran, et c'est un choix :** un devis est un document né d'une action, donc il ne peut pas avoir été « jamais visité ». Le moteur de rendu ne définit pas cet état pour ce type d'écran, et cette absence est écrite ici pour qu'on ne l'implémente pas. | — |
| **Vide — aucune donnée** | — | **N'existe pas non plus**, pour la même raison : il n'y a pas de liste à vider, il y a un document. Un devis « vide » afficherait un montant à zéro et une date limite qui n'ont pas de sens, et surtout il ressemblerait à un devis de zéro euro — donc à un devis réel. | — |
| **Erreur de chargement** | Le devis demandé n'existe pas, ou le magasin local ne répond pas | `BandeauMessage` en état `echec` : `Ce devis n'est pas lisible sur cet appareil.` puis `Il a peut-être été écrit sur un autre téléphone : un devis écrit ici ne quitte pas l'appareil.` et une seule action : `Réessayer la lecture`. **Aucun devis vierge** ne s'affiche à la place : montrer un devis vide pour un devis introuvable ferait croire que le devis n'a jamais existé. | bandeau `--color-expire-fond` `#F4DED8`, il ne s'efface pas |
| **Erreur de soumission** | Modification d'un devis signé | Aucune modale, aucun toast. Le changement s'applique **immédiatement**, et c'est l'écran qui dit ce qui vient d'arriver : le tracé de signature est barré d'un filet `--color-bordure-expire` `#B45A48`, la mention `À resigner` s'inscrit dans l'en-tête, et un `BandeauMessage` en état `avertissement` écrit : `Ce devis a été modifié. Sa signature ne vaut plus rien. Il faut le faire signer de nouveau avant qu'il sorte.` **L'écran le dit dès la première modification**, pas au moment de l'envoi. | bandeau `--color-echeance-fond` `#F4E9CB`, il ne s'efface pas |
| **Succès** | Le devis est signé, ou le service de courriel confirme un envoi | Deux rendus distincts. **À la signature** : l'en-tête passe à l'état `lecture`, le bloc d'empreinte apparaît sous l'en-tête — `Signé le 20 mars à 18 h 12 — empreinte 4f2a…9c1d.` en `--font-identifiant` `IBM Plex Mono` et `--color-texte-encre-signature` `#1F4C6B` — et la barre d'action propose `Envoyer`. **À la confirmation d'envoi** : la mention passe **instantanément** à `Envoyé par courriel`, sa preuve devient `Confirmé par le service de courriel le 20 mars à 18 h 12.`, et un `BandeauMessage` `succes` porte le texte complet. **Le changement de mention ne dure rien**, sans fondu : un fondu invite à regarder pendant la transition, donc à douter de ce qu'on a vu. | bandeau `--color-confirme-fond` `#DEEAE1`, 6 s ; la mention, elle, ne s'efface jamais |
| **Hors-ligne / permissions** | Mode avion | **`Écrit ici, pas encore envoyé` prend sa variante de preuve `1b`** : `Sur ce téléphone. Pas de réseau ici : il ne peut pas partir tout seul.` Le bouton `Envoyer` **reste visible** et passe à l'état `desactive` de `EtatBouton` : opacité 45 %, aucun fond, libellé `--color-texte-desactive` `#8B8272`, `aria-disabled`. **Il ne disparaît pas et il ne devient pas `Réessayer`** : un devis écrit et non envoyé n'a pas échoué, il n'a pas été envoyé — l'action qui n'a pas encore été faite est celle qui s'appelle `Envoyer`, et c'est elle qui est proposée. Le bouton `Signer`, lui, reste **actif** : une signature ne demande aucun réseau. | aucun message d'erreur — le hors-ligne est le fonctionnement normal |
| **Lecture seule** | Le devis est signé, sa signature est valide, et Jean-Luc ne le modifie pas | Le document est figé : lignes en `ChampMontant` `desactive`, montant lisible en `--color-texte-secondaire` `#4C4436`, aucun bouton de modification visible, empreinte `4f2a…9c1d` sous l'en-tête. `Envoyer à nouveau` devient disponible en variante `famille-confirme` — filet `--color-bordure-confirme` `#3C7A59` `2px`. **Un devis sorti n'a plus d'action de sortie : il a une action de relance**, et la relance est hors MVP (US-10, roadmap § 2.2) — donc aucun bouton de relance n'est dessiné, plutôt qu'un bouton qui ne ferait rien. | — |

> Un état non décrit est un état non implémenté. Les deux lignes « n'existe pas » ci-dessus sont une déclaration, pas un oubli : un écran qui rendrait un devis vide ferait croire à un devis de zéro euros.

---

## 5. Interactions

| Élément | Événement | Comportement | Feedback visuel | État résultant | ID |
|---|---|---|---|---|---|
| Bouton `Signer` | tap | Ouvre `signature`. **Rien n'est envoyé ni partagé avant** (B9). Le bouton n'est pas « désactivé pour l'instant » : il est simplement le seul proposé. | glissement vers le haut `320ms` `--ease-entree` `cubic-bezier(0, 0, 0, 1)` | `signature` | B9 |
| Bouton `Envoyer` | tap | Ouvre la feuille `sortie`. Un second appui **n'envoie pas un second courriel** et ne crée pas de doublon (B7) : le bouton passe en état `chargement`, son libellé change en `Envoi tenté…`, il ne rétrécit pas et ne se grise pas, et un second appui ne fait rien de plus. | libellé changé, variante `famille-attente` conservée | `sortie` | B6, B7 |
| `Modifier`, devis non signé | tap | Passe le corps en saisie **dans la page** : les lignes deviennent éditables, la barre d'action devient `Annuler`. Le `TotalBloc` passe de `fige` à `saisie` et le total recommence à bouger. | — | `en-saisie` | B3 |
| `Modifier`, devis signé | tap | Ouvre la confirmation avec la conséquence écrite : `Modifier ce devis annule sa signature. Le client devra signer de nouveau.` puis `Modifier quand même` et `Annuler`. **Il n'y a pas de « je le fais plus tard »** : une signature qui ne vaut plus rien ne peut pas rester en attente d'une décision. | — | `annulee` | B11, E6 |
| `Retour à Suivi` | tap | Pop vers `suivi`. **La liste retrouve l'endroit exact où elle était**, pas le haut de la liste. Le retour arrière du système est intercepté et traité comme ce bouton. | glissement inverse `220ms` `--duration-normal` | `suivi` | — |
| Ligne à prix zéro | tap | La ligne s'ouvre en lecture et **reste affichée** : déplacement offert, main d'œuvre incluse, garantie. Montant en `--color-texte-secondaire` `#4C4436`, jamais rayé, jamais masqué. Le total ne change pas et l'écran ne dit rien de plus : E13 ne demande pas un avertissement, il demande que la ligne existe. | montant atténué, ligne intacte | `prix-zero` | E13 |
| Mention d'état | tap | **Aucun comportement.** Elle se lit. Une mention cliquable laisserait croire qu'on peut la corriger, alors que l'état ne change que sur une action explicite de Jean-Luc (B5). | — | — | B5 |
| Bandeau de file | tap | Aucun comportement. Il se lit. | — | — | B6 |
| Première frappe dans un devis signé | saisie | Le devis repasse à non signé **immédiatement**, dès la première frappe et sans confirmation préalable : l'empreinte est barrée, la mention `À resigner` s'inscrit dans l'en-tête, et toute sortie est bloquée jusqu'à une nouvelle signature. | liseré gauche `--color-bordure-expire` `#B45A48` `4px` sur la ligne, filet de barrage sur le tracé | `annulee` | B11, E6 |
| Devis dont le client refuse de signer | — | Aucun état supplémentaire. Le devis reste à la fois `écrit ici, pas encore envoyé` et non signé, il n'est envoyé à personne et rien n'est signé. L'écran ne dit pas `signature en attente` : rien n'attend (E7). | — | `rempli` | E7 |
| `Envoyer à nouveau`, devis sorti | tap | Ouvre `sortie` en état `choix`, pour un devis déjà sorti. **Il n'envoie pas un doublon au client** : c'est une nouvelle sortie, volontaire, d'un document déjà sorti. | variante `famille-confirme` | `sortie` | B7 |

- **Focus / clavier** : ordre — `Retour à Suivi`, le corps du devis en lecture, la barre d'action, la barre basse. Sur un devis signé, le bloc d'empreinte est le premier texte focusable après le retour. Sur `--bp-poste` et `--bp-large`, la navigation clavier est complète. Anneau `--color-bordure-focus` `#8A4A0E`, `--stroke-focus` `3px`, jamais supprimé.
- **Gestes** : défilement vertical du document. **Aucun pincer-zoom** : le zoom matériel du système est libre, mais l'application n'offre ni geste de zoom ni bouton de zoom, parce qu'un devis se relit à taille réelle ou se relit sur la tablette — pas entre les deux. **Pas de balayage pour signer**, **pas de double-tap** : une signature qui se déclenche par un geste est une signature que Jean-Luc peut produire sans le vouloir.
- **Animations** : ouverture de `sortie`, glissement vers le haut `320ms` `--ease-entree`. **Le changement de mention d'état dure zéro milliseconde.** Le total ne s'anime pas : un chiffre qui défile est un chiffre dont on n'est pas sûr, et B3 impose que le total affiché, le total imprimé et le total signé soient le même nombre.
- **Retour arrière** : intercepté, traité comme `Retour à Suivi`, **sans jamais perdre la saisie** (E2, PRD US-13). Si Jean-Luc est en cours de modification, la barre d'action porte `Annuler` juste au-dessus du bouton de retour : perdre une modification sans un mot serait le seul endroit du produit où une donnée disparaît sans phrase.

---

## 6. Responsive

| Breakpoint | Comportement | Ce qui se replie / disparaît |
|---|---|---|
| **Mobile** `--bp-telephone` 0 — 479px | Une colonne, marge `--space-lg` `16px`. Ligne `compacte` de `--hauteur-cible` `56px`. Barre d'action de `--hauteur-action-primaire` `60px`, pleine largeur moins `--space-lg` `16px` de chaque côté. **L'état est en haut, l'action est en bas** : la mention d'état est dans la moitié haute de la feuille et le bouton est dans `--zone-pouce` `96px`. | rien |
| **Tablet** `--bp-tablette` 480 — 1023px | Marge `--space-xl` `24px`. Lignes en variante `etendue` de 96px : désignation sur toute la largeur, puis quantité, prix unitaire et montant sur trois colonnes alignées. **C'est le format où Jean-Luc montre le devis au client**, donc le format où le document a le plus d'air et le moins de chrome. | rien |
| **Desktop** `--bp-poste` 1024 — 1439px | Deux colonnes : la liste des devis à gauche sur 360px en `--color-surface` `#F6F2E9`, le devis ouvert à droite sur `--color-background` `#EDE8DC`. La différence de valeur de fond **est** la séparation — pas une ombre, pas une bordure. Le bouton `Retour à Suivi` reste en haut : il ne devient pas un `<` nu. | rien |
| **Large** `--bp-large` 1440px et plus | Trois colonnes : navigation, liste, devis. Contenu plafonné à `--space-3xl` `48px` de marge. La barre basse **reste en bas**, pleine largeur : elle ne devient jamais un menu latéral. | rien |

- **Cible tactile** : `--hauteur-cible` `56px` pour le bouton de retour, pour chaque ligne, pour les deux boutons de la barre d'action. `--hauteur-action-primaire` `60px` pour le bouton principal. La PRD § 7.3 demande 48px ; 48 est le plancher, et avec un gant de chantier la marge d'erreur réelle est d'environ 8px.
- **Débordement** : **aucun défilement horizontal, sur aucun breakpoint** (PRD § 7.1). Garanti par construction : les trois nombres d'une ligne sont tabulaires dans des colonnes de largeur fixe (`88px` la quantité, `128px` le montant), le numéro et la date sont en `--font-identifiant` `IBM Plex Mono` `15px` et ne se coupent pas, et le total en `--text-montant-geant` `44px` passe sur deux lignes s'il doit passer — jamais sur deux chiffres manquants. **Aucun montant n'est jamais tronqué ni réduit.**

---

## 7. Accessibilité

- [ ] **Contraste du texte courant** : mesuré par `node "$FORGE/scripts/design-check.js" contrast <anchor>`. **Aucun ratio n'est écrit ici** (design-system § 0.0 : un ratio rédigé à la main est un nombre fabriqué, et il devient faux au premier ajustement de palette).
- [ ] **Contraste des grands textes** : mesuré par le même contrôle, sur `--text-montant-geant` `44px` et `--text-h1` `30px`.
- [ ] **Navigation clavier complète** sur `--bp-poste` et `--bp-large`, y compris le bouton de retour nommé et la barre d'action à deux boutons.
- [ ] **Focus visible** : anneau `--color-bordure-focus` `#8A4A0E`, `--stroke-focus` `3px`. Jamais supprimé, jamais 2px : c'est le seul repère au doigt comme au clavier dans une cave. L'empreinte `4f2a…9c1d` porte un `aria-label` complet : `Empreinte de la signature du devis D-2026-016, 4f2a…9c1d, signée le 20 mars à 18 h 12.`
- [ ] **ARIA** : le bloc `EtatSortie` est `role="status"` `aria-live="polite"` avec le texte **complet** en lecture — mention **et** preuve, jamais la mention seule, parce que `aria-live` qui annonce `Écrit ici, pas encore envoyé` sans sa preuve annoncerait un fait dont la source est inconnue. Le `BandeauMessage` d'avertissement sur la modification est `role="alert"`. Le bouton `Envoyer` en `desactive` porte `aria-disabled="true"` et **reste dans l'arbre d'accessibilité** : le retirer ferait disparaître de la seule action qui explique pourquoi le devis ne part pas.
- [ ] **Texte alternatif** : aucune image sur cet écran. La seule image du produit est le tracé de signature, et il est décrit par son empreinte et son horodatage, pas par une description de sa forme.
- [ ] **Langue et direction de lecture** : `lang="fr"`, `dir="ltr"`. Les dates en toutes lettres — `2 avril 2026`, jamais `02/04`, jamais `J-3` — parce que Jean-Luc parle en dates et les prononce au téléphone. Les montants en tabulaires, la devise écrite en toutes lettres : `euros`, jamais `€` collé au nombre.

---

## 8. Données

| Champ | Type | Origine | Requis | Erreur possible |
|---|---|---|---|---|
| `devis.numero` | texte `D-2026-016` | magasin local | oui | jamais absent : B1 impose l'identifiant à l'enregistrement |
| `devis.date-ecriture` | date | horloge simulée à l'enregistrement | oui | **jamais modifiée** par cet écran, et jamais recalculée à l'envoi (E15) |
| `devis.date-limite` | date | `date-ecriture` + durée choisie avant le premier envoi | oui | recalcul interdit : c'est ce qui rend la validité invérifiable si on la bouge à l'envoi |
| `devis.etat-sortie` | énumération `attente` \| `confirme` \| `declaration` | magasin local | oui | un `confirme` sans confirmation horodatée est rejeté à la lecture et traité comme `attente` — l'écran ne peut pas afficher un état qu'il ne sait pas soutenir |
| `devis.signature.empreinte` | texte `4f2a…9c1d` | magasin local | non | absente tant que le devis n'est pas signé, et son absence est **affichée** (`Pas encore signé`), jamais devinée |
| `devis.signature.horodatage` | date et heure | horloge simulée | non | idem |
| `devis.lignes[]` | liste | magasin local | oui | liste vide impossible : B1 bloque l'enregistrement |
| `devis.total` | décimal, deux décimales | **calculé**, jamais saisi | oui | jamais stocké : c'est la somme des lignes, donc il ne peut pas diverger |
| `client.nom`, `client.adresse` | texte | dossier client | oui / non | l'adresse manque sur un devis ancien : l'écran ne la demande pas ici, il l'affiche si elle existe (E12) |

- **Chargement** : tout d'un bloc, **depuis le magasin local, sans réseau**. Aucune pagination : un devis se lit d'un bout à l'autre, et un devis qu'on feuillette par pages n'est pas une feuille.
- **Cache / hors-ligne** : l'écran est intégralement disponible hors-ligne (C1, E1), et il est **le seul écran du produit où cela ne coûte rien à l'affichage** : aucune donnée n'y dépend du service de courriel. La seule chose qui change hors-ligne est **le libellé de la preuve** — `1a` devient `1b` — et l'état `desactive` du bouton `Envoyer`.
- **Données sensibles** : l'adresse de facturation est une donnée personnelle (C11). Elle n'est rendue que si elle existe, une fois, en `ChampTexte` `lecture`. **Aucun journal d'audit n'écrit un nom de client ni une adresse** : le journal enregistre le numéro `D-2026-016`, l'action, l'horodatage et l'état résultant. L'empreinte du texte signé est conservée avec le devis — la signature reste rattachée à ce texte, et non à une image détachée (PRD § 7.2).

---

## 9. Traçabilité

| ID | Origine | Manifestation sur cet écran |
|---|---|---|
| B1 | PRD | `EnTeteDevis` à l'état `complet` : numéro, date, client, lignes. Aucun de ces quatre éléments ne peut manquer, donc aucun de ces quatre éléments n'est affiché vide. |
| B3 | PRD | **Un seul total**, aligné à gauche, en `--text-montant-geant` `44px`, jamais masqué, jamais accompagné d'un sous-total. Il passe de `fige` à `saisie` quand Jean-Luc modifie, et il ne change pas d'allure entre les deux — c'est le même nombre qui bouge, pas deux nombres. |
| B5 | PRD | Les trois mentions sont **écrites dans la feuille** avec leur preuve. Le temps qui passe ne change pas l'état : un devis relu trois semaines plus tard est toujours dans le même état (E15). |
| B6 | PRD | `Envoyé par courriel` n'apparaît qu'après confirmation du service, et sa preuve le nomme. Un envoi tenté sans retour laisse la mention à `Écrit ici, pas encore envoyé` avec la preuve `1c`. |
| B9 | PRD | Tant que le devis n'est pas signé, **aucune action de sortie n'est proposée** : ni `Envoyer`, ni `Partager en PDF`. La barre d'action ne propose que `Signer`. |
| B10 | PRD | L'empreinte `4f2a…9c1d` et l'horodatage `20 mars à 18 h 12` sont affichés dans l'en-tête, en `--font-identifiant` `IBM Plex Mono` et `--color-texte-encre-signature` `#1F4C6B`. C'est le seul endroit du produit où le bleu apparaît sans que ce soit un bouton. |
| B11 | PRD | Dès la première frappe sur un devis signé, l'empreinte est barrée, la mention `À resigner` s'inscrit, et un bandeau écrit que la signature ne vaut plus rien. La sortie est bloquée tant qu'il n'y a pas de nouvelle signature. |
| E6 | PRD | Idem B11 : c'est le même cas, et il a un rendu d'écran explicite, avec un bandeau qui ne s'efface pas. |
| E7 | PRD | Le client refuse de signer : aucun état supplémentaire, aucune mention `signature en attente`. Le devis reste simplement à `Écrit ici, pas encore envoyé` et non signé. |
| E13 | PRD | Une ligne à prix zéro est **affichée et conservée**, montant en `--color-texte-secondaire` `#4C4436`, jamais rayée ni masquée, et le total n'en tient pas compte sans que l'écran dise quoi que ce soit. |
| E15 | PRD | `D-2026-016`, écrit le 2 avril et jamais envoyé, est relu ici trois semaines plus tard : `La date limite est le 2 mai.` — la date est celle du devis, pas celle d'aujourd'hui. |
| C1 | PRD | Hors-ligne, l'écran est identique. La seule différence est le libellé de la preuve et l'état du bouton `Envoyer`. |
| C3 | PRD | La signature est tracée et gratuite. **Aucune proposition de signature qualifiée** n'apparaît nulle part sur cet écran : la qualifier coûterait 1 à 3 € par devis, et elle n'est pas exigée pour un devis. |
| C7 | PRD | Aucun mot, aucune tuile, aucun lien vers une comptabilité. Le produit ne dit jamais qu'il tient un compte. |
| C8 | PRD | Aucune mention d'encaissement. Le prix du paiement par carte est écrit dans `reglages`, avec le prix du produit, au même endroit et au même poids. |

---

## 10. Checklist de gate

- [x] Les états sont décrits avec un rendu concret — les neuf lignes du tableau § 4 sont là, y compris les deux qui **n'existent pas** et le disent, parce qu'un devis vide ressemble à un devis de zéro euros.
- [x] Chaque élément interactif a un comportement et un feedback ; deux éléments ont explicitement « aucun comportement » — la mention d'état et le bandeau de file — et c'est une décision écrite.
- [x] Le responsive est défini à **chaque** breakpoint, avec le passage `compacte` / `etendue` des lignes et le maintien de la barre basse en bas.
- [x] La section Anti-générique est cochée et justifiée, une ligne par ligne, avec la valeur du token qui la rend vraie.
- [x] Aucune valeur de design n'est laissée à « à définir ».
- [x] Chaque ID B*/E*/C* de cet écran apparaît en section 9 : B1, B3, B5, B6, B9, B10, B11, E6, E7, E13, E15, C1, C3, C7, C8.
- [x] Aucun gabarit non résolu.
- [x] L'écran reste cohérent avec `.forge/design/design-system.md`.