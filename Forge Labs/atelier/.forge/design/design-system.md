---
type: design-system
status: approved
generated_at: 2026-10-01
derived_from: .forge/prd.md
---

# Design System — Atelier

> Ce document définit les fondations visuelles et les patterns d'interaction du produit.
> Tous les écrans et composants y font référence. Modifier un token ici impacte tout le produit.

---

## 0.0 Déclaration des classes de couleurs

<!-- forge:token-classes
text     --color-texte-principal --color-texte-secondaire --color-texte-attente --color-texte-confirme --color-texte-encre-signature --color-texte-echeance --color-texte-expire
on       --color-texte-inverse = --color-encre-foncee
surface  --color-background --color-surface --color-surface-raised --color-surface-sunken
surface  --color-attente-fond --color-confirme-fond --color-encre-signature-fond --color-echeance-fond --color-expire-fond
nontext  --color-encre-foncee --color-bordure-champ --color-bordure-forte --color-bordure-focus
nontext  --color-bordure-attente --color-bordure-confirme --color-bordure-encre-signature --color-bordure-echeance --color-bordure-expire
exempt   --color-teinte-survol = teinte décorative d'état, aucun texte n'y est posé
exempt   --color-tiret = filet de séparation, ne porte aucune information
exempt   --color-bordure-focus-inverse = anneau de focus posé sur --color-encre-foncee, jamais sur une surface claire
exempt   --color-texte-desactive = action désactivée, WCAG 1.4.3 exempte le texte inactif
-->

**Les cinq directives.**

| Directive | Effet | Seuil |
|---|---|---|
| `text` | porte du texte | **4,5:1** contre chaque `surface`, et contre chaque fond de son `on:` |
| `surface` | fond sur lequel du texte est posé | aucune exigence propre ; le texte posé dessus est mesuré |
| `nontext` | composant d'interface : bordure, anneau de focus, fond de bouton | **3:1** contre `--color-background` |
| `on` | fonds sur lesquels **ce** texte est réellement posé | — |
| `exempt` | ni texte ni composant : teinte décorative, filet sans information | aucune — **la raison est obligatoire** |

> **Aucun ratio n'est écrit dans ce document, à côté d'une valeur.** La mesure est faite
> par `node "$FORGE/scripts/design-check.js" contrast <anchor>`. Un ratio rédigé à la
> main est un nombre fabriqué : il donne une assurance que rien ne soutient, et il
> devient faux au premier ajustement de palette.

**Ce que la déclaration change, ici.** `--color-encre-foncee` est le fond des boutons
pleins, de la barre basse et de l'en-tête des feuilles. Il est déclaré `nontext` : il
atteint 3:1 contre le fond sans difficulté. Le libellé posé dessus est
`--color-texte-inverse`, déclaré `text` avec un `on:` vers ce seul fond. Sans cet `on:`,
le texte inversé serait mesuré contre les neuf surfaces du document, dont le papier,
où il n'est jamais posé, et le contrôle échouerait sur une palette correcte.

---

## 0. Direction visuelle

| Ancre | Contenu |
|---|---|
| **Références** | **Too Good To Go** pour la règle d'une main : un écran, une décision, l'action au pouce, aucun menu. **Le devis papier** que Jean-Luc écrit déjà à la main : une page, un tableau, un total encerclé, une signature en bas — l'application rend ce papier, elle ne le remplace pas par un tableau de bord. **Linear** pour la hiérarchie : l'échelle typographique et la valeur de fond portent la hiérarchie, jamais la carte à ombre. |
| **Ambiance** | **dense, mate, sans emphase** |
| **Anti-références** | Pas de blanc pur ni de gris bleuté « SaaS » : le fond est un papier chaud, éclairé par l'écran du téléphone. Pas de carte blanche à ombre douce pour chaque ligne : un devis est une page, pas une collection de tuiles. Pas d'ombre comme séparateur : ce sont des filets et des valeurs de fond. Pas de dégradé, pas de verre dépoli, pas de halo — on est dans une cave, pas dans une vitrine. Pas d'illustration d'appoint, pas d'icône dans un cercle, pas d'emoji : un état vide est une phrase, pas un dessin. Pas de bleu `#3B82F6`, pas de gris `#6B7280`, pas de rouge `#EF4444` : la palette vient de l'atelier, pas d'un thème. Et **aucun bouton bleu** — voir § 0.4. |

**Archétype d'application** : `mobile_field_ops` — le signal est explicite dans le PRD :
saisie de données sur le terrain, moitié de la semaine hors couverture, téléphone en main
et Frequently hors-ligne (C1, § 1.1). La fiche de l'archétype (`archetypes.md` §1) exige
cinq choses, et chacune a une décision dans ce document : file d'attente et
synchronisation explicite (§ 2, `EtatSortie` et `FileAttente`), saisie rapide d'une main
(§ 4, échelles de pouce), grandes cibles tactiles (§ 1.3), détail en push et non en
sixième entrée de navigation (§ 3.1), et le retour arrière qui ne perd pas la saisie
(§ 3.4).

**Plateforme** : application installable (PWA), téléphone d'abord. La tablette est le
même écran en plus large, pas une application séparée. Le poste de bureau existe dans
la grille parce que Jean-Luc ouvre parfois l'application sur l'écran d'un tiers, et
parce qu'un écran qui n'a pas de comportement au-delà de 480 px est un écran non dessiné.

**Boucle de travail** : Jean-Luc ouvre l'application debout, dans un local sans réseau,
avec un client qui attend. Il regarde **combien de devis sont écrits ici et pas encore
envoyés**. Il écrit un devis — client, lignes, total. Il le montre. Le client signe au
doigt. Jean-Luc choisit comment le devis sort : par courriel, ou en PDF partagé. Il
ressort de la cave, l'envoi se réessaie seul, et le devis passe de « écrit ici, pas
encore envoyé » à « envoyé par courriel » quand le service de courriel confirme. Il
recommence deux ou trois fois par semaine ; il consulte l'état des devis environ cinq
fois par jour, dont le matin avant de partir et le soir en rentrant.

**Densité retenue** : **dense**. La fiche de l'archétype l'exige et le contexte le
confirme : l'écran est tenu d'une main, dans un local où il faut parfois allumer la
lampe, et chaque ligne de devis est du texte que Jean-Luc a écrit. Un écran aéré
transformerait un devis de douze lignes en douze défilements — et la PRD § 7.1 interdit
le défilement horizontal, ce qui reporte la pression sur le vertical. La densité est
gagnée par l'échelle typographique et par l'absence de conteneurs, jamais par une taille
de texte réduite : **rien ne descend sous 14 px, et aucun texte courant sous 16 px**.

### 0.1 Le skill de design obligatoire n'est pas installé

Le tableau de `design-quality.md` § 2 impose `imagegen-frontend-mobile` pour une
application mobile. **Ce skill n'est pas disponible dans cet environnement** : il n'y a
ni `imagegen-frontend-mobile`, ni `frontend-design`, ni `impeccable`.

Ce qui a été fait à la place, et c'est le signalement correct :

- Les **interdits du § 3 sont appliqués un par un** et sont vérifiables dans ce document :
  fond non blanc (§ 1.1), pas d'ombre comme séparateur (§ 1.4, § 4.1), pas de palette par
  défaut (§ 1.1), pas d'échelle typographique uniforme (§ 1.2), pas d'illustration
  d'appoint (§ 0.3), hiérarchie par échelle et non par centrage (§ 4.1).
- Les **exigences du § 4** sont remplies : trois ancres, tokens concrets, palette d'états
  complète, densité justifiée, ratios explicites, états d'écran complets, et un choix
  visuel contestable (§ 0.4).
- **Aucune maquette de référence n'a été produite.** Ce qui manque donc au document et
  ne peut pas être remplacé par du texte : une lecture de la composition en conditions
  réelles — la mise en page à l'échelle sur un téléphone tenu d'une main, en plein jour
  et dans une cave. C'est la limite assumée de cette phase, et elle ne se voit qu'en
  Phase 3.3.

### 0.2 Le test de langage, et ce qu'il interdit à l'interface

Le test de validation du produit est un test de **langue**, pas d'écran : Jean-Luc doit
pouvoir dire au téléphone « c'est confirmé » ou « pas encore confirmé » **sans regarder
l'application**.

La conséquence de conception est dure, et elle porte sur les mots :

> **Le mot « confirmé » n'apparaît jamais dans l'état d'un devis. Il n'apparaît que
> dans la ligne de preuve, sous l'état, et seulement s'il existe une preuve.**

Un état qui dirait « envoyé, confirmé » n'aurait que deux mots pour un seul fait, et le
deuxième serait le seul que Jean-Luc dirait au téléphone — donc l'interface mentrait sur
la moitié de ce qui compte. La ligne d'état porte le **fait** ; la ligne de preuve porte
la **source du fait** ; le mot « confirmé » appartient à la source.

### 0.3 Le vocabulaire, et ses trois mots exacts

Trois valeurs, jamais deux. Une seule d'entre elles est l'état par défaut d'un devis
enregistré, et c'est la seule qu'un devis peut avoir **sans qu'aucune action de Jean-Luc
l'ait mise en place** (B5).

| # | Mention — le mot | Preuve — la ligne en dessous | Ce qui l'a constaté |
|---|---|---|---|
| 1 | **Écrit ici, pas encore envoyé** | `Sur ce téléphone. Personne ne l'a reçu.` | Personne |
| 2 | **Envoyé par courriel** | `Confirmé par le service de courriel le 14 mars à 18 h 12.` | Le service de courriel (B6) |
| 3 | **Parti en PDF partagé** | `Le 14 mars, date déclarée par vous. Rien ne l'a confirmée.` | Jean-Luc (B8) |

La ligne de preuve n'est pas un compliment : elle **nomme la main qui a constaté**, et
elle change de forme dans trois cas où l'état ne bouge pas. C'est ce qui permet à
Jean-Luc de dire « pas encore confirmé » sans regarder, parce que la preuve lui dit *qui*
n'a rien confirmé.

| Variante de preuve | Quand | Texte exact |
|---|---|---|
| `1a` | Jamais tenté, réseau présent | `Sur ce téléphone. Personne ne l'a reçu.` |
| `1b` | Jamais tenté, pas de réseau ici | `Sur ce téléphone. Pas de réseau ici : il ne peut pas partir tout seul.` |
| `1c` | Tentative sans retour du service (E3) | `Envoi tenté le 14 mars à 18 h 12, sans réponse du service. Personne ne peut dire s'il est parti.` |
| `2a` | Confirmation reçue | `Confirmé par le service de courriel le 14 mars à 18 h 12.` |
| `3a` | Partage PDF déclaré | `Le 14 mars, date déclarée par vous. Rien ne l'a confirmée.` |

**La quatrième ligne : la date limite.** Elle n'est pas un état de sortie, c'est une
autre horloge, et elle a son propre vocabulaire, écrit dans les mots du contrat :

| Mention | Texte exact |
|---|---|
| En cours | `La date limite est le 14 avril.` |
| Elle approche | `La date limite est le 14 avril — dans 3 jours.` |
| Elle est passée | `La date limite était le 14 avril. Elle est passée.` |

**Un état vide n'est pas un zéro, et il n'appelle pas « Réessayer ».** Un devis en attente
n'a pas échoué : il n'a pas été envoyé. L'écran ne propose donc jamais « Réessayer » à
côté de la mention 1a ou 1b — il propose **Envoyer**, qui est l'action qui n'a pas encore
été faite. « Réessayer » n'apparaît que sur l'état `erreur` de `FeuilleSortie`, c'est-à-dire
après une tentative dont on sait qu'elle a échoué.

### 0.4 Le choix qui divise : aucun bouton bleu dans l'application

C'est le choix le plus contestable du document, donc c'est celui qu'il faut écrire le
plus clairement.

**`--color-texte-encre-signature` `#1F4C6B` n'est jamais le fond d'un bouton.** Les boutons
sont de l'encre (`--color-encre-foncee`) sur papier, ou du papier sur un filet. Aucune
action du produit n'est bleue.

La raison n'est pas esthétique. L'action la plus dangereuse du produit est **Envoyer**,
parce que Jean-Luc peut croire qu'elle a fonctionné. Tout ce qui ressemble à un bouton
de navigation bleue dans les applications qu'il utilise déjà — WhatsApp, sa banque, le
site d'un fournisseur — est une action dont l'effet est certain et sans conséquence. La
peindre en bleu, c'est la faire ressembler à une action inoffensive. À l'inverse, lui donner la couleur de l'attente — orange chantier, la couleur d'un gilet — la ferait
ressembler à ce qu'elle est : quelque chose qui attend une confirmation.

L'encre bleue garde un emploi, et un seul : **tout ce qui repose sur la main de Jean-Luc
et sur rien d'autre** — le tracé de la signature, l'empreinte du texte signé, et l'état
`Parti en PDF partagé`, dont la date est déclarée par lui et confirmée par personne. Cette
coïncidence n'est pas un accident de palette, c'est la règle : **le bleu, c'est « c'est
moi qui l'ai constaté, pas un service »**.

Deux autres choix assumés, pour la même raison :

- **Le compteur de devis non envoyés est le plus gros élément de l'écran d'accueil**,
  en `--text-montant-geant` (44 px), pas dans une pastille. C'est la seule mesure de la
  perte possible (E10) : elle doit se lire de biais, en une seconde, sans que Jean-Luc
  approche l'écran.
- **L'écran d'accueil n'est pas un tableau de bord.** Il n'y a ni graphique, ni tuile de
  synthèse, ni nombre décoratif. Il y a le compteur, et trois groupes de lignes. Un
  écran d'accueil qui ne sert qu'à faire du travail n'est pas un accueil, c'est un sommaire
  — et un sommaire oblige à choisir avant d'avoir fait quoi que ce soit.

### 0.5 Les deux exclus, rendus visibles

Le contrat § 2 tranche deux exclusions, et le PRD § 9 les réexplique. Le design ne peut
pas les taire : une application qui propose « payer par carte » sans dire ce qu'elle
coûte ment, et une application qui émet une facture sans dire qu'elle ne tient aucun
compte laisse croire que le travail de comptabilité est fait.

| Exclu | Où c'est écrit | Texte affiché |
|---|---|---|
| **Paiement par carte** (C8, 2 708 €/an) | `reglages` § 2, en tête de liste, et sur `question-fiscale` | `Ce que Forge ne fait pas. Sur 30 factures de 5 000 € par an : 2 708 € par an, chaque année, contre 95,88 € pour tout le reste. Réexamen uniquement sur demande écrite de vous.` |
| **Comptabilité** (C7) | `reglages` § 3, et `question-fiscale` | `Hors périmètre. Forge écrit les mentions que la loi impose sur une facture. Il ne tient aucun compte, ne suit aucune trésorerie, ne déduit rien.` |

Ces deux exclusions sont dans `Réglages`, pas dans une note de bas de page d'un écran
qu'il faut découvrir : elles sont un **fait sur le produit**, au même titre que son
prix. Le prix lui aussi est affiché, à la même place, avec le même poids :
`Ce que vous payez : 95,88 € la première année, puis 71,88 € chaque année, prélevés le 5.
Aucun autre débit.`

### 0.6 L'exclusion de ce qui n'est pas conçu ici

Le MVP exclut deux tranches entières : la facture (US-9) et la relance (US-10). Le
roadmap § 2.2 le décide, et il le décide bien : B16 exige cinq mentions que Forge ne
peut ni inventer ni déduire, B17 bloque l'émission tant que la réponse fiscale n'est pas
donnée, et le jour de la relance n'est écrit nulle part (PRD § 12).

Concevoir les écrans de facture et de relance à ce stade reviendrait à inventer trois
décisions : l'égalité des montants entre devis signé et facture (Q-004), le taux de
TVA applicable (Q-006), et le jour de la relance (B20). **Ce document ne les invente
pas.** Ce qu'il conçoit à la place, et qui est dans le MVP, c'est **le blocage** :
l'écran qui dit que la question n'est pas tranchée et qui refuse d'émettre (E16, C5).

Liste exacte de ce qui n'a pas d'écran, et pourquoi :

| Non conçu | Règles sans écran | Raison | Version |
|---|---|---|---|
| Émission de la facture | B14, B15, B16, B18, B19 | Q-004 ouverte (PRD § 12) : l'égalité des montants change la forme du document, pas son code | V1 |
| Relance d'une facture échue | B20 | Le jour de la relance n'est écrit nulle part ; une relance le jour de l'échéance part avant que le client ait pu payer | V1 |
| Comptabilité, stock, catalogue | — | Hors périmètre par le contrat § 2 ; rien à concevoir, et surtout rien à suggérer | V2, jamais |

---

## 1. Design tokens

### 1.1 Couleurs

**D'où vient cette palette.** Elle n'est pas thématisée : elle est **descriptive**. Cinq
couleurs portent cinq faits distincts, et chacune dit *qui* a constaté le fait. C'est la
seule façon de faire tenir une palette qui a une règle à expliquer.

| Couleur | Ce qu'elle dit | Qui l'a constaté |
|---|---|---|
| Orange chantier | pas encore sorti de l'appareil | personne |
| Vert | sorti, et le service l'a dit | le service de courriel |
| Bleu encre | sorti comme Jean-Luc l'a déclaré | Jean-Luc, de sa main |
| Ocre | une horloge approche | l'horloge |
| Rouge brique | une horloge est passée, ou la loi bloque | l'horloge, ou la loi |

Le papier vient de l'atelier : un plâtre sale et un carton de bois brut, jamais un blanc.
L'encre vient d'un stylo bille. **Aucun de ces tons n'est une teinte générique** — c'est
vérifiable : aucun n'est dans la famille d'un gris bleuté, et les cinq sont séparables
les uns des autres par leur température, pas seulement par leur valeur.

**Aucune rampe à onze pas n'est écrite.** Sept familles à onze tons produiraient
quatre-vingts valeurs dont aucun écran ne cite, et le contrôle de contraste les mesurerait
toutes. Chaque famille sémantique n'a que **quatre tons**, et chacun a un emploi nommé :
un fond, un texte, une bordure, et c'est tout. Ce qui n'a pas d'emploi n'est pas écrit.

#### Surfaces

| Token | Valeur | Usage |
|---|---|---|
| `--color-background` | `#EDE8DC` | Fond d'écran. Le plâtre du local, éclairé par le téléphone. |
| `--color-surface` | `#F6F2E9` | La page du devis, la feuille d'un dossier. Un cran au-dessus du fond. |
| `--color-surface-raised` | `#FBF9F4` | Barre basse, feuille modale, zone de lecture d'un montant. |
| `--color-surface-sunken` | `#E2DAC9` | Champ de saisie au repos, ligne alternée d'un tableau, piste d'une zone de signature. |

#### Encre

| Token | Valeur | Usage |
|---|---|---|
| `--color-texte-principal` | `#1F1B15` | Le texte courant, les désignations de ligne, le montant. |
| `--color-texte-secondaire` | `#4C4436` | Dates, quantités, aides de saisie. Jamais le montant : le montant est toujours en principal. |
| `--color-texte-inverse` | `#FBF9F4` | Libellé d'un bouton plein, texte de la barre basse, en-tête d'une feuille. |

#### Les cinq familles sémantiques

| Token | Valeur | Usage |
|---|---|---|
| `--color-attente-fond` | `#F7E5D3` | Fond de la mention « écrit ici, pas encore envoyé ». |
| `--color-texte-attente` | `#8A3D0C` | Cette mention, en toutes lettres, et le liseré de la tuile. |
| `--color-bordure-attente` | `#A05E27` | Liseré gauche de la tuile, filet du bouton de cette famille. |
| `--color-confirme-fond` | `#DEEAE1` | Fond de la mention « envoyé par courriel ». |
| `--color-texte-confirme` | `#15583C` | Cette mention, et sa ligne de preuve. |
| `--color-bordure-confirme` | `#3C7A59` | Liseré gauche de la tuile, filet du bouton de cette famille. |
| `--color-encre-signature-fond` | `#DEE6EF` | Fond de la mention « parti en PDF partagé » et de la piste de signature. |
| `--color-texte-encre-signature` | `#1F4C6B` | Cette mention, le tracé de la signature, l'empreinte du texte signé. |
| `--color-bordure-encre-signature` | `#4E7591` | Liseré gauche de la tuile, filet du bouton de cette famille. |
| `--color-echeance-fond` | `#F4E9CB` | Fond de la ligne d'échéance qui approche. |
| `--color-texte-echeance` | `#6B4700` | « La date limite est le 14 avril — dans 3 jours. » |
| `--color-bordure-echeance` | `#8A6714` | Liseré de la ligne d'échéance. |
| `--color-expire-fond` | `#F4DED8` | Fond d'un devis expiré, et d'un blocage. |
| `--color-texte-expire` | `#86210F` | « La date limite était le 14 avril. Elle est passée. » |
| `--color-bordure-expire` | `#B45A48` | Liseré de la ligne expirée, filet du champ en erreur. |

#### Composants d'interface

| Token | Valeur | Usage |
|---|---|---|
| `--color-encre-foncee` | `#26211A` | Fond des boutons pleins, de la barre basse, de l'en-tête d'une feuille. |
| `--color-bordure-champ` | `#6F6757` | Filet d'un champ de saisie au repos. |
| `--color-bordure-forte` | `#4A4234` | Filet appuyé, séparation entre deux blocs d'un même écran. |
| `--color-bordure-focus` | `#8A4A0E` | Anneau de focus, sur fond clair. 3 px, jamais 2 : c'est le seul repère au doigt ou au clavier dans une cave. |

#### Exemptés — et la raison est obligatoire

| Token | Valeur | Usage | Raison de l'exemption |
|---|---|---|---|
| `--color-teinte-survol` | `#E4DCCB` | Teinte d'une ligne survolée ou pressée. | Teinte décorative d'état. Aucun texte n'y est posé : le texte d'une ligne pressée reste posé sur son fond d'origine. |
| `--color-tiret` | `#BFB59E` | Filet de séparation entre deux lignes d'une liste. | Filet décoratif. Il sépare, il n'informe pas : aucune information ne dépend de sa présence. |
| `--color-bordure-focus-inverse` | `#F5D9A8` | Anneau de focus sur un fond sombre. | Jamais posé que sur `--color-encre-foncee`, où il est mesuré ; jamais sur une surface claire. |
| `--color-texte-desactive` | `#8B8272` | Libellé d'une action impossible. | WCAG 1.4.3 exempte le texte inactif. Un contrôle désactivé ne doit pas êtrePressed par erreur. |

### 1.2 Typographie

**Deux familles, et chacune a un emploi.** La règle du § 3 — « pas une seule famille si
la hiérarchie demande du contraste » — n'est pas satisfaite par une seconde famille
décorative : les deux familles d'Atelier ont chacune une raison qu'on peut énoncer.

| Token | Famille | Taille | Graisse | Interligne | Usage |
|---|---|---|---|---|---|
| `--font-texte` | `Archivo` | — | — | — | Tout le texte. Graisses 400, 600, 700. Chiffres tabulaires par défaut. |
| `--font-identifiant` | `IBM Plex Mono` | — | — | — | Numéro de devis, numéro de facture, empreinte du texte signé. Graisse 500. |

**Pourquoi une police à chasse fixe pour les identifiants.** `D-2026-014` se lit à voix
haute au téléphone, et il se recopie d'un devis à une facture. Dans n'importe quelle
police proportionnelle, `1`/`l`/`I` et `0`/`O` se ressemblent, et le `1` porte un
onglet qui disparaît au premier changement de graisse. Un identifiant illisible est un
identifiant recopié faux, donc un document faux. C'est un motif de **métier**, pas de
gout.

**Pourquoi Archivo.** À 44 px, un montant doit avoir du poids et des contreformes
fermées : c'est le seul texte du produit que Jean-Luc lit à un mètre. Archivo est une
grotesque de labeur, construite pour un corps texte dense et pour des chiffres forts,
et ses chiffres tabulaires alignent une colonne de montants — ce qui est exactement ce
qu'il fait sur un devis.

**Échelle — les ratios sont écrits, et ils ne sont pas un seul.**

| Token | Taille | Graisse | Interligne | Chiffres | Ratio sur l'entrée précédente |
|---|---|---|---|---|---|
| `--text-montant-geant` | 44px | 700 | 1.1 | tabulaires | × 2,59 sur `--text-corps` |
| `--text-montant` | 32px | 700 | 1.15 | tabulaires | × 1,88 sur `--text-h1` |
| `--text-h1` | 30px | 700 | 1.33 | — | × 1,50 sur `--text-h3` |
| `--text-h2` | 23px | 700 | 1.35 | — | × 1,15 sur `--text-h3` |
| `--text-h3` | 20px | 700 | 1.4 | — | × 1,18 sur `--text-corps` |
| `--text-corps` | 17px | 400 | 1.5 | — | base |
| `--text-corps-fort` | 17px | 600 | 1.5 | — | même taille, plus grasse |
| `--text-secondaire` | 16px | 600 | 1.5 | — | × 0,94 |
| `--text-mention` | 16px | 500 | 1.4 | — | dates, quantités, ligne de preuve |
| `--text-identifiant` | 15px | 500 | 1.4 | — | `IBM Plex Mono` uniquement |
| `--text-etiquette` | 14px | 700 | 1.3 | — | capitales, interlettrage +0,08em |

**L'échelle a deux rapports, et c'est un choix.** Le premier bloc — `corps` 17, `h3` 20,
`h2` 23, `h1` 30 — est une **échelle courte à pas serrés** : × 1,18 puis × 1,15, puis un
saut de × 1,30. C'est parce qu'un écran de travail comporte **trois niveaux de titre
simultanément** (le nom du devis, le nom d'un bloc, le nom d'une action), et une échelle
à grand rapport les étirerait sur trois hauteurs de plus. Le montant sort ensuite de
l'échelle d'un coup : × 1,88 sur `h1`, × 2,59 sur le corps. Il ne monte pas par degrés
parce qu'il n'est pas un titre — c'est **le seul chiffre qu'on lit à distance**, et une
échelle graduelle le ferait en compétition avec avec le titre d'un bloc.

**Rien ne descend sous 14 px, et le seul token à 14 px est une étiquette de deux ou trois
mots au-dessus d'un titre d'au moins 20 px.** Il n'est jamais employé seul, jamais dans
une phrase, jamais pour une date. La PRD § 7.3 demande un texte lisible en plein soleil
comme en pénombre et des zones utilisables avec un gant : réduire la taille aurait été
le moyen de la résoudre, et c'est le moyen qui échoue dans les deux cas.

### 1.3 Espacements

| Token | Valeur | Usage |
|---|---|---|
| `--space-xs` | 4px | Retrait d'une étiquette sur son surtitre. |
| `--space-sm` | 8px | Écart entre une étiquette et sa valeur, entre deux icônes d'une action. |
| `--space-md` | 12px | Padding interne d'un bouton, d'une pastille. |
| `--space-lg` | 16px | Padding d'un bloc, marge entre deux lignes de devis. |
| `--space-xl` | 24px | Séparation entre deux blocs de premier plan d'un écran. |
| `--space-2xl` | 32px | Marge d'un panneau par rapport au fond. |
| `--space-3xl` | 48px | Marge de page. |

**L'espacement n'est pas uniforme, et c'est là que se lit le regroupement.** Un devis
n'est pas une liste d'éléments égaux : il y a l'en-tête (identité), le corps (les lignes),
et le pied (le total, la date limite, l'état de sortie). Ces trois groupes sont séparés
par `--space-xl` et `--space-2xl` ; à l'intérieur d'un groupe, l'écart est `--space-lg`.
Un écran où tous les écarts valent 16 px ne dit rien : c'est exactement la « grille
uniforme sans intention » que le § 3 refuse.

**Les échelles de pouce — la contrainte d'une main, en chiffres.**

| Token | Valeur | Usage | Pourquoi cette valeur |
|---|---|---|---|
| `--hauteur-cible` | 56px | Hauteur minimale de toute cible tactile principale | La PRD § 7.3 demande 48 px avec un gant. 48 est le plancher ; avec un gant de chantier, la marge d'erreur réelle est d'environ 8 px. |
| `--hauteur-action-primaire` | 60px | Barre d'action fixée en bas d'un écran de saisie | La barre elle-même est à portée du pouce ; elle n'a pas besoin d'être fine. |
| `--hauteur-barre-basse` | 68px | Barre de navigation basse | Trois zones de 56 px plus 12 px de respiration. Un socle plus fin rend les cibles trop courtes. |
| `--zone-pouce` | 96px | Hauteur de la zone basse réellement atteignable au pouce | Toute action qui n'est pas réversible ne vit **pas** au-dessus de cette ligne. |
| `--marge-basse` | 24px | Marge entre le bord de l'écran et le premier contenu | Au-dessus de la zone d'ombre du pouce, pas dans le vide. |

### 1.4 Ombres

| Token | Valeur | Usage |
|---|---|---|
| `--shadow-none` | none | Défaut, sur tout ce qui n'est pas flottant. |
| `--shadow-sm` | `0 1px 2px rgba(31,27,21,0.10)` | Barre basse, au-dessus du contenu qu'elle masque. |
| `--shadow-md` | `0 2px 8px rgba(31,27,21,0.12)` | Feuille modale basse, au-dessus du fond. |
| `--shadow-lg` | `0 -4px 24px rgba(31,27,21,0.18)` | La feuille qui **monte** : ombre vers le haut, parce qu'elle vient du bas. |
| `--shadow-xl` | `0 8px 32px rgba(31,27,21,0.22)` | La feuille de signature et la feuille de blocage : seules deux surfaces de tout le produit qui masquent autre chose que le fond. |

**L'ombre ne sépare rien.** Elle ne sert qu'à une chose : dire qu'un panneau est **au-dessus**
d'un autre. Tout ce qui est à côté — deux blocs d'un même écran, deux lignes d'un tableau,
un champ et son aide — est séparé par un filet `--color-tiret`, par un changement de
valeur de fond, ou par de l'espace. Une ombre qui sépare deux choses voisines est une
ombre décorative, et elle rend chaque chose pareille.

### 1.5 Bordures

| Token | Valeur | Usage |
|---|---|---|
| `--radius-none` | 0 | Le devis lui-même : la page de devis a des bords droits, c'est une feuille de papier. |
| `--radius-sm` | 6px | Champ de saisie, pastille d'état. |
| `--radius-md` | 10px | Bouton, feuille modale basse, tuile de la liste. |
| `--radius-lg` | 16px | La barre basse, la feuille de blocage. |
| `--radius-full` | 9999px | Le liseré de la ligne de preuve — c'est le seul élément arrondi du document. |
| `--stroke-champ` | 1.5px | Filet d'un champ au repos. |
| `--stroke-focus` | 3px | Anneau de focus. |
| `--stroke-liseré` | 4px | Le liseré gauche d'une tuile d'état : la seule couleur qui porte le sens, et elle est en thickness. |

### 1.6 Animations

| Token | Valeur | Usage |
|---|---|---|
| `--duration-fast` | 120ms | Survol, appui, apparition d'un anneau de focus. |
| `--duration-normal` | 220ms | Ouverture et fermeture d'une feuille, changement d'état d'une mention. |
| `--duration-slow` | 320ms | Entrée d'un écran, sortie de la feuille de blocage. |
| `--ease-default` | `cubic-bezier(0.2, 0, 0, 1)` | Transitions standard. |
| `--ease-entree` | `cubic-bezier(0, 0, 0, 1)` | Une feuille qui monte. |
| `--ease-sortie` | `cubic-bezier(0.3, 0, 1, 1)` | Une feuille qui descend. |

**Deux durées sont volontairement nulles.**

- **Le changement de mention d'état ne dure rien.** `--text-mention` passe de « Écrit ici,
  pas encore envoyé » à « Envoyé par courriel » instantanément, sans fondu. Un fondu
  invite à regarder **pendant** la transition, et donc à douter de ce qu'on a vu. Le
  changement doit êtreConstat et non provocation : Jean-Luc doit pouvoir dire, sans
  suivre le mouvement, ce que l'écran dit maintenant.
- **L'envoi n'a pas de spinner tournant sur le bouton.** Le bouton « Envoyer » passe en
  état `chargement` avec un **texte qui change** : `Envoi tenté…`. Voir § 2, `Bouton`.
  Une animation dit « ça travaille » ; un texte dit **ce qui est en train de se passer**,
  et c'est le seul des deux qui ne puisse pas mentir.

### 1.7 Breakpoints

| Token | Plage | Usage |
|---|---|---|
| `--bp-telephone` | 0 — 479px | Une colonne. C'est l'appareil de la PRD § 7.1 : la boucle complète sur un téléphone tenu d'une main, sans aucun défilement horizontal. |
| `--bp-tablette` | 480 — 1023px | Une colonne élargie, et **deux colonnes pour les lignes de devis** — la désignation à gauche, les trois chiffres alignés à droite sur une grille fixe. C'est le format où Jean-Luc montre le devis au client. |
| `--bp-poste` | 1024 — 1439px | Deux colonnes : la liste des devis à gauche, le devis ouvert à droite. |
| `--bp-large` | 1440px et plus | Trois colonnes : navigation, liste, devis. Contenu plafonné à `--space-3xl` de marge. |

**Le poste de bureau n'est pas un écran inventé pour la démonstration.** Jean-Luc n'a pas
d'ordinateur — c'est écrit dans le contrat § 0 et dans `AGENTS.md`. Cet écran existe
pour trois raisons réelles : la tablette en paysage (480 — 1023 px), l'écran emprunté chez
un client ou un fournisseur, et le fait qu'un design sans comportement au-delà de 480 px
n'est pas un design. Ce qu'il ne doit **pas** faire, c'est devenir un tableau de bord
avec des colonnes en plus — ce serait un produit pour quelqu'un d'autre.

---

## 2. Composants primitifs

> Vingt-trois composants, pas une liste générique. Chaque section porte son **rôle**, ses
> **états** avec le nom de l'union qui les rend, et ses **slots**. Un composant sans
> état déclaré ne sera pas implémenté.

### Bouton

**Rôle** : déclencher une action, avec un libellé qui dit ce qui va se passer.

**Variantes** :

| Variante | Apparence | Usage |
|---|---|---|
| `plein` | Encre pleine `--color-encre-foncee`, texte `--color-texte-inverse` | Une seule action principale par écran, au bas, dans la zone du pouce. |
| `contour` | Filet `--color-bordure-forte` 1.5px, texte `--color-texte-principal`, fond transparent | Action secondaire, action destructible d'un document non signé. |
| `discret` | Aucun fond, aucun filet, texte `--color-texte-secondaire` | Annuler, « Plus tard », un lien d'explication. |
| `famille-attente` | Filet `--color-bordure-attente` 2px, texte `--color-texte-attente` | L'action **Envoyer**, et elle seule. Jamais `plein` : une action qui attend une confirmation ne doit pas ressembler à une action acquise. |
| `famille-confirme` | Filet `--color-bordure-confirme` 2px, texte `--color-texte-confirme` | L'action **Envoyer à nouveau** quand un devis est déjà sorti. |
| `famille-expire` | Filet `--color-bordure-expire` 2px, texte `--color-texte-expire` | Refuser un devis expiré. |

**Tailles** :

| Taille | Dimensions | Usage |
|---|---|---|
| `normale` | 44px de haut, padding 12px 16px | Bouton dans un groupe d'actions. |
| `grande` | 60px de haut, pleine largeur moins 24px de marge | Barre d'action d'un écran de saisie. **C'est la taille par défaut sur téléphone.** |

**États** — rendus par l'union `EtatBouton` :

| État | Déclencheur | Apparence |
|---|---|---|
| `repos` | — | Variente × taille. |
| `survol` | Souris au-dessus | Fond `--color-teinte-survol`, filet inchangé. |
| `appui` | Doigt ou souris enfoncé | Fond `--color-teinte-survol`, translation de 1px vers le bas, `--duration-fast`. |
| `focus` | Navigation clavier, focus visible | Anneau `--color-bordure-focus` 3px, décalé de 2px à l'extérieur. Jamais supprimé. |
| `desactive` | Action impossible | Opacité 45 %, aucun fond, texte `--color-texte-desactive`, `aria-disabled`. |
| `chargement` | Action déclenchée, en cours | Le libellé **change** : il devient `Envoi tenté…` ou `Signature en cours…`. Le bouton ne rétrécit pas et ne se désactive pas visuellement : il reste appuyable, et un second appui ne fait rien de plus. |

**Slots** :

| Slot | Requis | Contenu |
|---|---|---|
| `libelle` | oui | 2 à 4 mots. Le verbe d'abord : `Envoyer`, `Signer`, `Ajouter une ligne`, `Tout télécharger`. |
| `icone` | non | 24 px, à gauche du libellé. Jamais seule : une icône sans mot n'est pas une action, c'est un pictogramme à deviner. |
| `mention-etat` | non | La pastille d'état de sortie, quand le bouton est posé au-dessus d'un document dont l'état compte. |

**Pourquoi `chargement` n'est pas un spinner.** Un spinner dit « ça travaille » et laisse
deviner quoi. `Envoi tenté…` dit exactement ce qui est en cours, et il est **faux dès la
seconde seconde** — parce que l'envoi n'est plus en cours, il est en attente d'un retour du
service. Le libellé change donc une seconde après l'appui, en `FamilleAttente`. Voir
`FeuilleSortie`, qui porte la règle.

### ChampTexte

**Rôle** : saisir un texte libre, une main, sans clavier de précision.

**Variantes** :

| Variante | Apparence | Usage |
|---|---|---|
| `saisie` | Fond `--color-surface-sunken`, filet `--color-bordure-champ` | Le cas général. |
| `lecture` | Aucun fond, filet `--color-tiret`, texte `--color-texte-secondaire` | Une donnée déjà tranchée et modifiable ailleurs : le nom du client dans l'en-tête d'un devis. |

**Tailles** :

| Taille | Hauteur | Usage |
|---|---|---|
| `normale` | 56px | Saisie de texte. |
| `grande` | 72px | Saisie du nom du client : c'est le champ le plus long et le plus important. |

**États** — rendus par l'union `EtatChamp` :

| État | Déclencheur | Apparence |
|---|---|---|
| `repos` | Vide, non focalisé | Filet `--color-bordure-champ` 1.5px, texte d'indication `--color-texte-secondaire`. |
| `survol` | Souris au-dessus | Filet `--color-bordure-forte`. |
| `focus` | Champ focalisé | Filet `--color-bordure-focus` 3px, halo `--color-teinte-survol`, le clavier s'ouvre. |
| `rempli` | Texte saisi | Texte `--color-texte-principal`, étiquette flottante au-dessus du champ. |
| `erreur` | Validation refusée | Filet `--color-bordure-expire` 2px, et un message **sous** le champ en `--color-texte-expire` qui dit ce qu'il faut faire, jamais ce qui est invalide. |
| `desactive` | Champ non modifiable dans cet état | Fond `--color-surface-sunken` à 60 %, texte `--color-texte-desactive`. |

**Slots** :

| Slot | Requis | Contenu |
|---|---|---|
| `etiquette` | oui | 2 à 3 mots, toujours visible au-dessus du champ — jamais un texte d'indication qui disparaît à la saisie. |
| `valeur` | non | Le texte saisi. |
| `aide` | non | Une ligne sous le champ. À l'état `erreur`, cette ligne porte l'action, pas le constat. |
| `suffixe` | non | Unité ou suffixe aligné à droite : `€`, `mm`, `j`. |

**L'étiquette ne disparaît jamais.** Elle flotte au-dessus une fois le champ rempli, et
elle est à 20 px quand le champ est vide. Un texte d'indication qui s'efface à la frappe
laisse Jean-Luc sans étiquette au moment où il relit sa saisie — et c'est à ce moment-là
qu'il vérifierait le total.

### ChampMontant

**Rôle** : saisir une quantité ou un montant, une main, au clavier numérique.

**Variantes** :

| Variante | Apparence | Usage |
|---|---|---|
| `quantite` | Chiffres tabulaires, unité `×` à droite, largeur 88px | Quantité d'une ligne de devis. |
| `montant` | Chiffres tabulaires, `€` à droite, largeur 128px | Prix unitaire d'une ligne, montant d'une ligne. |

**Tailles** : `normale` 56px · `grande` 60px — la seule différence avec `ChampTexte` est
le pavé numérique, qui s'ouvre toujours en bas de l'écran et occupe la moitié de la
hauteur disponible.

**États** — rendus par l'union `EtatMontant` :

| État | Déclencheur | Apparence |
|---|---|---|
| `repos` | Vide | Comme `ChampTexte`, plus le pavé numérique en `0 1 2 3 4 5 6 7 8 9 ,` disposé en 4 lignes sur 3 colonnes, la ligne du bas portant `,` puis `Effacer` puis `Valider`. |
| `focus` | Champ focalisé | Le champ remonte au-dessus du pavé numérique, et **le total du devis reste visible juste au-dessus du pavé**. |
| `rempli` | Chiffres saisis | Les chiffres sont tabulaires et alignés à droite ; un `0` saisi explicitement s'affiche `0`, pas `0,00`. |
| `erreur` | Saisie refusée | Le champ refuse le saisi et le signale en place. Un montant négatif est refusé au clavier, pas à la validation : la PRD § 7.3 dit qu'aucune action ne doit être accessible par un seul geste sans bouton visible. |
| `desactive` | Ligne gelée | Le montant reste lisible, plus aucune saisie possible. |

**Slots** :

| Slot | Requis | Contenu |
|---|---|---|
| `valeur` | oui | Le nombre saisi, aligné à droite. |
| `unite` | oui | `€` ou `×`. |
| `pave` | oui | Le pavé numérique, épinglé au bas de l'écran, jamais flottant au-dessus du champ. |

### LigneDevis

**Rôle** : une ligne de travaux — désignation, quantité, prix unitaire, montant — et son
état de saisie.

**Variantes** :

| Variante | Apparence | Usage |
|---|---|---|
| `compacte` | Une seule ligne de 56px : désignation à gauche, `qté × PU = montant` aligné à droite en tabulaires | La ligne normale. Treize à l'écran, pas davantage : au-delà, c'est une liste. |
| `etendue` | Deux lignes : désignation sur toute la largeur, puis quantité, prix unitaire et montant sur une grille de trois colonnes alignées | Le mode `--bp-tablette`, et le mode où Jean-Luc relit un devis devant le client. |
| `vide` | Aucun filet, une étiquette `--text-etiquette` et un libellé d'invitation | La ligne d'ajout. **Pas d'icône plus, pas d'illustration** : le texte dit quoi faire. |

**Tailles** : `compacte` 56px · `etendue` 96px.

**États** — rendus par l'union `EtatLigneDevis` :

| État | Déclencheur | Apparence |
|---|---|---|
| `vide` | Ligne d'ajout, jamais utilisée | Étiquette `Ligne de travaux`, puis le texte `Pose de trois fenêtres coulissantes`. |
| `en-saisie` | Un des trois champs est focalisé | Le champ focalisé prend `--color-bordure-focus` 3px ; les deux autres passent en `--color-texte-secondaire`. Le montant de la ligne reste visible. |
| `valide` | Les trois champs sont remplis | Aucun liseré. Le montant est en `--text-corps-fort`, tabulaire. |
| `erreur` | Un des trois champs est refusé | Liseré gauche `--color-bordure-expire` 4px sur toute la ligne, et le message sous la ligne en `--color-texte-expire`. Le reste de la ligne reste lisible : on corrige un prix, on ne relit pas un devis. |
| `prix-zero` | Montant à 0, E13 | La ligne **est conservée et affichée** — déplacement offert, main d'œuvre incluse, garantie. Son montant est en `--color-texte-secondaire`, jamais enrayé, jamais masqué. Le total du devis n'en tient pas compte, et l'écran ne dit rien de plus : E13 ne demande pas d'avertissement, il demande que la ligne existe. |

**Slots** :

| Slot | Requis | Contenu |
|---|---|---|
| `designation` | oui | Le texte libre. C'est le champ le plus long : il prend 60 % de la largeur en mode `compacte`, 100 % en mode `etendue`. |
| `quantite` | oui | Nombre décimal. |
| `prix-unitaire` | oui | Montant en euros, deux décimales. |
| `montant` | oui | Le produit, calculé, jamais saisi. |
| `action-supprimer` | oui | Toujours présente en fin de ligne, cible `--hauteur-cible`, et **jamais** au-dessus de la zone du pouce sur un devis à plus de six lignes. |

### EnTeteDevis

**Rôle** : porter l'identité du document — numéro, date, client, durée de validité.

**Variantes** : `complet` (numéro, date, client, durée) · `partiel` (le devis est en cours
de saisie : il n'y a pas encore de numéro) · `expire` (le même en-tête, avec la durée
barrée et la mention d'échéance).

**Tailles** : une seule, 96px, plus les lignes qu'il occupe.

**États** — rendus par l'union `EtatEnTete` :

| État | Déclencheur | Apparence |
|---|---|---|
| `partiel` | Le devis n'est pas enregistré | `Devis en cours — pas encore enregistré`, en `--text-secondaire`. **Aucun numéro, aucune date : un numéro afficherait une identité qui n'existe pas encore** (B1). |
| `complet` | Le devis est enregistré | Numéro `--font-identifiant` 15px en `--text-secondaire`, date du jour en `--text-mention`, nom du client en `--text-h3`. |
| `expire` | La durée est passée | Identique à `complet`, plus une ligne `--color-texte-expire` : `La date limite était le 14 avril. Elle est passée.` |
| `lecture` | Le devis est signé | Identique à `complet`, plus le bloc d'empreinte en `--color-texte-encre-signature`. |

**Slots** :

| Slot | Requis | Contenu |
|---|---|---|
| `numero` | non | `D-2026-014`, en police à chasse fixe. Absent à l'état `partiel`. |
| `date` | oui | La date **écrite sur le document**, qui ne bouge pas si le devis sort plus tard (B12). |
| `client` | oui | Le nom du client, en 20 px. |
| `duree-validite` | oui | `Valable 30 jours`, et la date limite qui en découle. |
| `empreinte` | non | `Empreinte 4f2a…9c1d`, en `--font-identifiant` et en `--color-texte-encre-signature`. Présente seulement si le devis est signé (B10). |

### TotalBloc

**Rôle** : le montant, la date limite et l'état de sortie, dans les huit centimètres les
plus regardés de l'application.

**Variantes** : `saisie` (le total est en cours de calcul, donc affiché pendant la saisie) ·
`fige` (le devis est enregistré ou signé, le total ne bouge plus).

**Tailles** : `saisie` 72px de haut pour le montant, `fige` 96px.

**États** — rendus par l'union `EtatTotalBloc` :

| État | Déclencheur | Apparence |
|---|---|
| `en-caisie` | Une ligne est en cours de modification | Le total est affiché en permanence au-dessus du pavé numérique, en `--text-montant` 32 px. Il est **mis à jour à chaque chiffre saisi**, et il n'est jamais masqué par le clavier : c'est la PRD § 7.1. |
| `complet` | Le devis porte un total | Montant en `--text-montant-geant` 44 px, tabulaire, avec « euros » en `--text-secondaire` à côté — jamais `€` collé au nombre, parce qu'un artisan prononce « quatre mille huit cent soixante » sans symbole. |
| `expire` | La date limite est passée | Le montant ne change pas et ne s'atténue pas : le prix n'a pas expiré, **la validité du prix** a expiré. La ligne d'échéance passe en `--color-texte-expire` sous le montant. |

**Slots** :

| Slot | Requis | Contenu |
|---|---|---|
| `montant` | oui | Un seul nombre, tabulaire. **Jamais deux totaux côte à côte** (B3) : il n'y a pas de « sous-total », pas de « total TTC » à côté d'un « total HT ». |
| `devise` | oui | Le mot `euros`, en toutes lettres. |
| `ligne-echeance` | oui | La mention de la date limite, dans les mots du § 0.3. |
| `mention-etat` | oui | La mention de sortie et sa ligne de preuve. **Dans cet ordre** : montant, échéance, état. |

**L'ordre des trois lignes est une règle, pas une préférence.** Le montant est la réponse
à la question du client. L'échéance est la contrainte que Jean-Luc doit connaître. L'état
de sortie est ce qu'il dira au téléphone. Un écran qui commence par l'état de sortie
commence par ce qui est le moins urgent et le plus facile à mal comprendre.

### EtatSortie

**Rôle** : dire en deux lignes où en est un devis, et **qui** l'a constaté.

**Variantes** : `mention` (la ligne d'état seule, dans une liste) · `bloc` (mention +
preuve, dans le détail d'un devis) · `complet` (mention + preuve + action, à l'écran
d'accueil).

**Tailles** : `mention` 24px · `bloc` 56px · `complet` 96px.

**États** — rendus par l'union `EtatSortie` :

| État | Déclencheur | Apparence |
|---|---|---|
| `attente` | Le devis est écrit ici et n'est sorti par aucune action | Liseré gauche `--color-bordure-attente` 4px, fond `--color-attente-fond`, texte `--color-texte-attente`. Mention : `Écrit ici, pas encore envoyé`. Preuve : une des trois variantes `1a`, `1b`, `1c` du § 0.3. |
| `confirme` | Le service de courriel a confirmé l'envoi | Liseré gauche `--color-bordure-confirme` 4px, fond `--color-confirme-fond`, texte `--color-texte-confirme`. Mention : `Envoyé par courriel`. Preuve : `Confirmé par le service de courriel le 14 mars à 18 h 12.` |
| `declaration` | Le devis a été partagé en PDF | Liseré gauche `--color-bordure-encre-signature` 4px, fond `--color-encre-signature-fond`, texte `--color-texte-encre-signature`. Mention : `Parti en PDF partagé`. Preuve : `Le 14 mars, date déclarée par vous. Rien ne l'a confirmée.` |

**Slots** :

| Slot | Requis | Contenu |
|---|---|---|
| `mention` | oui | Les mots exacts du § 0.3. Jamais une variante, jamais une abrégation, jamais une icône seule. |
| `preuve` | oui | La ligne qui nomme la main qui a constaté. Toujours présente, y compris à l'état `attente`. |
| `action` | non | `Envoyer` ou `Partager en PDF` à l'état `attente` ; **jamais** de bouton à l'état `confirme` — un devis sorti n'a plus d'action de sortie, il a une action de relance. |
| `liseré` | oui | 4px à gauche. C'est le seul endroit du produit où l'épaisseur porte une information : sur une liste dense, un liseré se voit de biais, une pastille se perd dans le bruit. |

**Une icône ne remplace pas la mention.** L'état `attente`, `confirme` et `declaration`
ont chacun une icône — un crayon, un avion, un pouce ouvert. Elle est **à gauche du texte**,
et elle ne suffit jamais seule : dans une liste de treize lignes vue en plein soleil sur
un téléphone, elle n'est pas ce que Jean-Luc lit. La règle du § 3 — « pas la couleur
seule pour porter du sens » — s'applique ici deux fois : ni la couleur seule, ni l'icône
seule.

### FileAttente

**Rôle** : dire que des envois sont partis vers le service et attendent sa confirmation, et
que cet état se résoudra **seul**.

**Variantes** : `barre` (un bandeau sous l'en-tête, sur tous les écrans) · `bloc` (la
feuille d'envoi, quand Jean-Luc l'a ouverte).

**Tailles** : `barre` 44px · `bloc` le contenu de la feuille.

**États** — rendus par l'union `EtatFileAttente` :

| État | Déclencheur | Apparence |
|---|---|---|
| `attente` | Un ou plusieurs devis sont partis vers le service, sans retour | `3 devis attendent la confirmation du service de courriel.` en `--color-texte-attente` sur `--color-attente-fond`. **Aucun bouton « Réessayer »** : rien n'a échoué, et le fichier se résout seul. Le bandeau ne tourne pas, ne pulse pas et ne comporte pas de barre de progression. |
| `vide` | La file est vide | Rien. Le bandeau n'existe pas : un état vide n'est pas un « 0 sur 0 ». |
| `impossible` | Le service a renvoyé une erreur, ou le réseau manque depuis plus d'un cycle | `Le service de courriel ne répond pas. Les 3 devis attendront, et repartiront seuls.` — plus le bouton `Réessayer maintenant`, qui est alors l'action correcte. |

**Slots** :

| Slot | Requis | Content |
|---|---|---|
| `nombre` | oui | Le nombre exact, jamais un pluriel approximatif. Il baisse **immédiatement** quand un envoi est confirmé (B23). |
| `source` | oui | Le nom de qui doit confirmer : `le service de courriel`. |
| `action` | non | Présent **uniquement** à l'état `impossible`. |

**Pourquoi ce bandeau ne ressemble à aucune barre de synchronisation connue.** Pas de
pourcentage, pas de spinner, pas de point animé, pas de « synchronisation… ». Un
pourcentage afficherait un nombre que le produit ne connaît pas : il ne sait pas combien de
temps il lui reste, et afficher `67 %` serait exactement le mensonge que ce produit a été
conçu pour ne pas produire. Le bandeau contient un **fait** et une **promesse** : `N devis
attendent la confirmation` et `repartiraient seuls`. C'est vérifiable par Jean-Luc sans
l'application, et c'est la seule chose qu'il puisse dire au téléphone de ce fichier.

### CompteurNonEnvoyes

**Rôle** : la seule mesure de la perte possible, quand l'appareil peut disparaître (E10).

**Variantes** : `principal` (à l'écran d'accueil) · `compact` (en en-tête, sur les autres
écrans).

**Tailles** : `principal` 44px de chiffre · `compact` 20px.

**États** — rendus par l'union `EtatCompteur` :

| État | Déclencheur | Apparence |
|---|---|---|
| `zero` | Aucun devis écrit et non envoyé | `Aucun devis en attente d'envoi.` en `--text-corps`, et rien d'autre. **Pas de `0`, pas deillustration, pas de « tout est parti ! ».** Un compteur à zéro est une information ; une_IMAGE de victoire serait une conversation sur un fait qui n'a pas d'enjeu. |
| `compte` | Au moins un devis écrit et non envoyé | Le chiffre en `--text-montant-geant`, puis `devis écrits ici, pas encore envoyés.` **La formule est celle du § 0.3** : c'est le même mot que la mention d'état, donc Jean-Luc n'a qu'une seule formule à retenir. |
| `urgent` | Au moins un devis non envoyé est daté de plus de 48 h | Le chiffre reste identique — **la taille ne change pas, la couleur non plus**. Ce qui change, c'est l'ajout d'une seule ligne en `--color-texte-expire` : `Le plus ancien attend depuis 6 jours.` La couleur d'un chiffre ne doit pas pouvoir être prise pour une alerte : elle est déjà prise pour un état. |

**Slots** :

| Slot | Requis | Contenu |
|---|---|---|
| `nombre` | oui | Le nombre exact. **Jamais arrondi, jamais « quelques-uns », jamais masqué au-delà de 99** : au-delà de 99, le nombre est écrit en toutes lettres. |
| `formule` | oui | `devis écrits ici, pas encore envoyés.` — identique à la mention d'état. |
| `delai` | non | Présent à l'état `urgent` seulement. |
| `action` | oui | `Envoyer maintenant` si le réseau est là, `Partager en PDF` sinon. **Le compteur est aussi le raccourci de la PRD § 6 : partager en un geste tout ce qui n'est pas sorti.** |

### LigneEcheance

**Rôle** : dire quand le prix cesse de tenir, et ne rien décider à la place de
Jean-Luc (B13).

**Variantes** : `compacte` (une ligne dans une liste) · `complete` (mention + les trois
issues, à l'ouverture d'un devis expiré).

**Tailles** : `compacte` 24px · `complete` 200px.

**États** — rendus par l'union `EtatEcheance` :

| État | Déclencheur | Apparence |
|---|---|---|
| `en-cours` | Plus de 7 jours avant la date limite | `La date limite est le 14 avril.` en `--color-texte-secondaire`. Aucune couleur d'alerte : rien ne presse. |
| `approche` | 7 jours ou moins avant la date limite | Liseré gauche `--color-bordure-echeance` 4px, fond `--color-echeance-fond`, `La date limite est le 14 avril — dans 3 jours.` |
| `passee` | La date limite est dépassée | Liseré gauche `--color-bordure-expire` 4px, fond `--color-expire-fond`, `La date limite était le 14 avril. Elle est passée.` Et trois boutons, jamais un seul : `Prolonger 30 jours`, `Faire ressigner`, `Refuser`. |

**Slots** :

| Slot | Requis | Contenu |
|---|---|---|
| `date-limite` | oui | La date, en toutes lettres. Jamais « J-3 » : Jean-Luc parle en dates, et il les prononce au téléphone. |
| `mention` | oui | La phrase entière du § 0.3, pas un nombre seul. |
| `issues` | non | Les trois issues de B13, à l'état `passee` seulement. **Jamais une seule**, jamais une action unique, jamais une action déjà appliquée. |
| `action` | non | `Prolonger`, qui exige une nouvelle durée explicite — l'application ne prolonge pas d'elle-même, ne modifie aucun prix et ne signe rien. |

### PastilleEtat

**Rôle** : porter un état de sortie ou d'échéance dans une ligne de liste, sans la
déformer.

**Variantes** : `sortie` (l'état d'un devis) · `echeance` (l'état d'une horloge) ·
`signature` (signé ou à resigner).

**Tailles** : `normale` 24px de haut, `--radius-full`, `--text-mention` 16px.

**États** — rendus par l'union `EtatPastille` :

| État | Déclencheur | Apparence |
|---|---|---|
| `attente` | Devis non sorti | Fond `--color-attente-fond`, texte `--color-texte-attente`, filet `--color-bordure-attente` 1px. |
| `confirme` | Devis sorti par courriel | Fond `--color-confirme-fond`, texte `--color-texte-confirme`, filet `--color-bordure-confirme` 1px. |
| `declaration` | Devis partagé en PDF | Fond `--color-encre-signature-fond`, texte `--color-texte-encre-signature`, filet `--color-bordure-encre-signature` 1px. |
| `echeance` | La date limite approche | Fond `--color-echeance-fond`, texte `--color-texte-echeance`, filet `--color-bordure-echeance` 1px. |
| `expire` | La date limite est passée | Fond `--color-expire-fond`, texte `--color-texte-expire`, filet `--color-bordure-expire` 1px. |
| `signature-absente` | Le devis n'est pas signé | Fond transparent, filet `--color-tiret`, texte `--color-texte-secondaire`, libellé `Pas encore signé`. |
| `a-resigner` | La signature a été annulée par une modification (B11, E6) | Comme `signature-absente`, plus un liseré gauche `--color-bordure-expire` 4px sur la ligne entière de la liste. |

**Slots** :

| Slot | Requis | Contenu |
|---|---|---|
| `libelle` | oui | Le mot de l'état. `Pas encore signé`, `À resigner`, `Écrit ici`, `Envoyé`, `PDF déclaré`, `Expiré`. |
| `icone` | non | 16px, à gauche du libellé. Jamais seule. |

**La pastille est le seul endroit où un mot est abrégé.** `Écrit ici` au lieu de
`Écrit ici, pas encore envoyé`, parce qu'une pastille de 130 px ne tient pas
vingt-huit caractères à 16 px sur un téléphone de 360 px de large. C'est un compromis
d'espace, et il est acceptable **parce que** la version longue est à un geste : le
détail du devis. Ce qui n'est pas acceptable, c'est une pastille dont l'abréviation
renverse le sens — `En attente` pour « pas encore envoyé » dirait qu'une action est en
cours, et elle ne l'est pas.

### FeuilleSignature

**Rôle** : recueillir la signature du client au doigt, et n'être **rien d'autre** pendant
ce geste (E5, B9, US-14).

**Variantes** : `signature` (le client signe) · `confirmation` (Jean-Luc relit l'empreinte
après).

**Tailles** : plein écran, 100 % de la hauteur, sans barre basse.

**États** — rendus par l'union `EtatSignature` :

| État | Déclencheur | Apparence |
|---|---|
| `vide` | L'écran s'ouvre | Le document à signer en entier, en haut, sur fond `--color-surface`. En bas, une piste de signature : fond `--color-surface-sunken`, filet `--color-bordure-champ`, hauteur 220px, avec le texte `Le client signe ici, du doigt.` **Aucun bouton « Effacer », aucun bouton « Valider »** tant que la piste est vide : ils n'auraient rien à valider. |
| `en-cours` | Un doigt touche la piste | Le tracé se dessine en `--color-texte-encre-signature`, largeur de trait 3px, arrondi. Aucun bouton n'apparaît sous le doigt. |
| `tracee` | Le doigt se lève | Le tracé reste affiché. Le bloc d'empreinte apparaît **sous** la piste, jamais à sa place : `Signé le 14 mars à 18 h 12 — empreinte 4f2a…9c1d.` Le bouton `Valider la signature` devient disponible, en `Bouton` variante `plein`, taille `grande`, dans la zone du pouce. |
| `interrompue` | Appel entrant, batterie vide, application fermée (E17) | Rien n'est enregistré comme signé. À la réouverture, l'écran est à l'état `vide`, et le devis est **non signé** — pas « signature en attente », pas « presque signé ». |
| `annulee` | Le devis a été modifié après signature (B11, E6) | Le tracé **reste visible, barré** d'un filet `--color-bordure-expire`, et la mention `À resigner` s'affiche dans l'en-tête. Le devis ne peut pas ressortir avant une nouvelle signature. |

**Slots** :

| Slot | Requis | Contenu |
|---|---|---|
| `document` | oui | Le devis complet, borné à celui-ci. **Aucun en-tête de navigation, aucun bouton de retour vers une liste, aucun lien vers un dossier** : c'est l'exigence E5, et elle est tenue par l'absence de ces éléments, pas par leur désactivation. |
| `piste` | oui | La zone de tracé. Cible de 220px de haut : on signe avec un doigt, pas avec un curseur de précision (PRD § 7.3). |
| `tracé` | oui | Le dessin, en `--color-texte-encre-signature`. |
| `empreinte` | non | La date, l'heure et l'empreinte du texte exact. **Apparaît seulement à l'état `tracee`**, et jamais avant. |
| `mention-a-resigner` | non | À l'état `annulee` seulement. |

**Le retour arrière est impossible à l'aveugle.** L'écran de signature n'a pas de bouton
`Retour`. La seule façon d'en sortir est `Annuler`, qui **efface la signature commencée**
et écrit : `La signature n'a pas été gardée. Le devis n'est pas signé.` Rien n'est perdu
silencieusement : E17 veut que rien ne soit enregistré comme signé, et Annuler dit
exactement ce qui vient de se passer.

### GroupeListe

**Rôle** : un des trois groupes de la liste de suivi, **présent même vide** (B26).

**Variantes** : `primaire` (le groupe du haut, avec son compte) · `secondaire`.

**Tailles** : `primaire` 40px d'en-tête, `secondaire` 32px.

**États** — rendus par l'union `EtatGroupeListe` :

| État | Déclencheur | Apparence |
|---|---|---|
| `vide-depuis-toujours` | Le groupe n'a jamais contenu de devis | `Aucun devis n'a encore expiré.` en `--text-corps`, plus une phrase de contexte en `--text-mention` : `Un devis expire 30 jours après la date écrite dessus.` **Ce n'est pas une erreur, et il n'y a rien à réessayer.** |
| `vide-aujourdhui` | Le groupe avait des devis, ils n'y sont plus tous | `Aucun devis écrit aujourd'hui n'est encore parti.` — la différence entre les deux vides est celle entre « rien n'a jamais eu lieu » et « ce qui avait lieu est résolu », et elle est écrite dans la phrase. |
| `rempli` | Au moins un élément | Les lignes, séparées par `--color-tiret`. |

**Slots** :

| Slot | Requis | Content |
|---|---|---|
| `titre` | oui | Le nom du groupe : `Écrits ici, pas encore envoyés` · `Partis, et signés` · `Validité finie ou proche`. |
| `compte` | oui | Le nombre exact. **Il s'affiche aussi quand il vaut 0** — le groupe existe, il est vide. |
| `lignes` | non | Les éléments. |
| `phrase-vide` | non | Le libellé exact de l'état vide. Jamais `Réessayer`, jamais `Charger encore`. |

**Trois groupes, pas deux, et jamais un seul.** `Écrits ici, pas encore envoyés` ·
`Partis, et signés` · `Validité finie ou proche`. B26 exige que les trois soient visibles
séparément, **y compris quand ils sont vides**. Les fusionner en un onglet « Tous », avec
un filtre, ferait d'un devis non envoyé un élément d'une liste de trente : c'est
exactement la perte que E10 et le risque « les envois s'accumulent sur un chantier » de la
PRD § 8 décrivent. La séparation n'est pas un filtre, c'est une frontière physique.

### ListeDevis

**Rôle** : la liste de suivi, groupée, et lisible sans sélectionner un devis.

**Variantes** : `groupee` (le cas normal, trois groupes) · `plate` (le dossier d'un client,
sans groupes).

**Tailles** : ligne de 72px — deux lignes de texte, la plus haute portant le nom du client
et le numéro, la plus basse l'état et la date.

**États** — rendus par l'union `EtatListeDevis` :

| État | Déclencheur | Apparence |
|---|---|---|
| `chargement` | Ouverture de l'écran | **Aucun squelette animé.** Le magasin local répond en moins d'une frame (C1, PRD § 7.5), donc un squelette serait un mensonge sur la vitesse. L'écran s'ouvre directement sur son contenu, et si le contenu n'est pas encore là, c'est l'état `vide` du groupe qui s'affiche. |
| `rempli` | Des devis existent | Trois `GroupeListe`, en entier, sans défilement interne : la liste défile, l'écran ne possède pas de zone de défilement séparée. |
| `vide` | Aucun devis du tout | Le compteur à `zero`, puis les trois groupes à leur état `vide-depuis-toujours`. **L'écran d'accueil d'une installation neuve dit ce qu'il fait** : `Un devis se fait ici, devant le client. Il part ensuite par courriel ou en PDF.` |
| `erreur` | Le magasin local ne répond pas | Le contenu déjà affiché **reste affiché**. Au-dessus, un `BandeauMessage` en état `echec` : `Les devis écrits sur ce téléphone ne sont pas lisibles.` Et une seule action : `Réessayer la lecture`. C'est le seul `Réessayer` de tout le produit. |

**Slots** :

| Slot | Requis | Contenu |
|---|---|---|
| `compteur` | oui | Le `CompteurNonEnvoyes`, en haut, hors du groupe 1 — il compte tous les devis non envoyés, pas seulement ceux affichés dans la fenêtre. |
| `groupe-sortie` | oui | `Écrits ici, pas encore envoyés`. |
| `groupe-partis` | oui | `Partis, et signés`. |
| `groupe-echeance` | oui | `Validité finie ou proche`. |
| `ligne` | oui | Le nom du client, le numéro `--font-identifiant`, la `PastilleEtat` de sortie, la `LigneEcheance` compacte. |

### FicheClient

**Rôle** : le dossier d'un client — tous ses devis et toutes ses factures, et ce qui est
sorti de ce qui ne l'est pas.

**Variantes** : `simple` (le dossier au MVP) · `complet` (avec les factures, en V1).

**Tailles** : en-tête 120px, puis la liste.

**États** — rendus par l'union `EtatFicheClient` :

| État | Déclencheur | Apparence |
|---|---|
| `chargement` | Ouverture depuis une recherche | Comme `ListeDevis` : aucun squelette. |
| `rempli` | Le client a au moins un document | Son nom en `--text-h1`, son adresse, puis la liste groupée : `Écrits ici, pas encore envoyés` d'abord, `Partis` ensuite. **La facturation n'a pas de groupe tant qu'il n'y a pas de facture** — un groupe vide « Factures » ferait croire à un manquant. |
| `introuvable` | La recherche ne trouve rien | `Aucun client ne porte ce nom.` et la liste des trois noms les plus proches : `Vous vouliez dire :` — c'est un nom, pas un bouton d'annulation. |
| `plusieurs` | Deux clients portent le même nom (E14) | Les deux sont listés, chacun avec son adresse complète. **L'application demande lequel, elle ne choisit pas** — confondre deux dossiers, c'est envoyer un devis au mauvais client. |

**Slots** :

| Slot | Requis | Contenu |
|---|---|---|
| `nom` | oui | Le nom du client, en 30px. |
| `adresse` | oui | L'adresse de facturation, celle du dossier (E12). C'est ici, et une seule fois, qu'elle se modifie. |
| `groupe-non-envoyes` | oui | Les devis écrits ici et non envoyés de ce client. |
| `groupe-partis` | oui | Les devis sortis et les factures. |
| `action-export` | oui | `Télécharger le dossier de ce client`, en `Bouton` variante `discret`, dans le tiers bas. |

### ChampRecherche

**Rôle** : retrouver un dossier par son nom, en deux minutes, devant le client (US-11).

**Variantes** : `seule` (l'écran de recherche) · `dans-barre` (au-dessus d'une liste).

**Tailles** : `seule` 72px, centré en haut · `dans-barre` 56px, pleine largeur.

**États** — rendus par l'union `EtatRecherche` :

| État | Déclencheur | Apparence |
|---|---|---|
| `inactif` | Ouverture de l'écran | Champ vide, étiquette `Nom du client`, texte d'indication `Un seul nom suffit.` |
| `actif` | Un ou plusieurs caractères saisis | Les résultats **apparaissent sous le champ**, pas dans un écran différent : passer à un autre écran ferait perdre ce qui est tapé si l'appel entrant coupe (E2). |
| `sans-resultat` | Aucun nom ne correspond | `Aucun client ne porte ce nom.` Puis `Nouveau dossier pour M. Roux ?` — la recherche échoue rarement, c'est la **création** qui est le plus souvent la bonne réponse. |
| `plusieurs` | Plusieurs correspondances (E14) | Les résultats sont listés avec l'adresse complète de chacun. Aucun n'est présélectionné. |
| `erreur` | La recherche locale échoue | `La recherche ne répond pas. Vos devis sont encore là.` — parce qu'ils sont dans le magasin local, et le dire évite qu'il believe les a perdus. |

**Slots** :

| Slot | Requis | Content |
|---|---|---|
| `champ` | oui | Le champ de saisie. |
| `resultats` | non | Les `FicheClient` réduites à une ligne : nom + adresse. |
| `proposition` | non | À l'état `sans-resultat` : créer le dossier. |

**La recherche est l'écran le plus profond du produit, et c'est délibéré.** Elle n'est pas
dans la barre basse : on cherche un client quand un client appelle, c'est-à-dire deux ou
trois fois par mois, et la mettre en rang 3 coûte à tous les autres usages. Elle est
atteignable en **un geste** depuis la liste des devis et depuis le dossier d'un client.
Le geste que la PRD § 7.1 interdit — « plus de trois gestes depuis l'écran d'accueil » —
n'est jamais franchi pour chercher un nom.

### FeuilleSortie

**Rôle** : choisir comment un devis sort, et dire honnêtement où en est cet envoi.

**Variantes** : `choix` (courriel ou PDF) · `attente` (l'envoi est parti, le service n'a
pas répondu) · `confirme` (le service a répondu) · `echoue` (le service a renvoyé une
erreur).

**Tailles** : feuille modale basse, hauteur 60 % de l'écran, rayon `--radius-lg`.

**États** — rendus par l'union `EtatFeuilleSortie` :

| État | Déclencheur | Apparence |
|---|---|---|
| `choix` | Ouverture après une signature valide | Deux blocs de 72px : `Envoyer par courriel` avec l'adresse du dossier client en dessous, et `Partager en PDF` avec la phrase `La date sera celle que vous déclarez.` Puis `Annuler`. **Aucun des deux n'est `plein`** : les deux sont des sorties, et Jean-Luc choisit. |
| `attente` | L'envoi est parti, le service n'a pas répondu (E3) | `Envoi tenté le 14 mars à 18 h 12.` puis `Le service de courriel n'a pas encore confirmé. Personne ne peut dire si ce devis est parti.` Puis **un seul bouton** : `Fermer`. **Pas de barre de progression, pas de spinner, pas de « Réessayer »** : rien n'a échoué, et B7 interdit qu'un second essai envoie un second courriel. Le devis reste à `Écrit ici, pas encore envoyé`, et sa preuve devient la variante `1c`. |
| `confirme` | Le service de courriel a confirmé (B6) | La mention passe à `Envoyé par courriel`, avec sa preuve datée. Un seul bouton : `Fermer`. **Cette feuille ne montre jamais de « Envoyé ! » avec un point d'exclamation**, et elle ne se ferme pas toute seule : elle attend qu'on la lise, parce que c'est le seul moment où Jean-Luc peut encore rater la confirmation. |
| `echoue` | Le service a renvoyé une erreur | `Le service de courriel a refusé cet envoi. Le devis n'est pas parti.` Puis deux boutons : `Réessayer` et `Fermer`. Le devis reste à `Écrit ici, pas encore envoyé` (B6), et la reprise est possible sans ressaisie (PRD § 7.5). |

**Slots** :

| Slot | Requis | Content |
|---|---|---|
| `mention` | oui | La mention d'état du § 0.3, en grand. |
| `preuve` | oui | La ligne qui nomme qui a constaté, ou qui n'a rien constaté. |
| `sortie-courriel` | oui | À l'état `choix` seulement, avec l'adresse du dossier client. |
| `sortie-pdf` | oui | À l'état `choix` seulement. |
| `action` | oui | `Fermer`, `Réessayer`, ou `Annuler` selon l'état. Jamais deux actions primaires. |

**L'état `attente` est l'état le plus important de ce produit, et le moinsInstr Alfaisable.**
On lui demande d'afficher une incertitude réelle à un homme debout, dont le client attend,
avec une contrainte physique : il ne peut pas rester là. D'où trois décisions, et elles
sont toutes dans le composant :

1. **La feuille se ferme d'un geste et l'incertitude reste visible ailleurs.** Le
   `FileAttente` la reprend en bandeau, et la preuve `1c` reste dans le devis. Fermer ne
   fait pas disparaître le fait.
2. **Aucun « Réessayer » à l'état `attente`.** Il n'y a rien à réessayer : l'envoi est
   parti, l'attente est la suite normale, et B7 interdit le doublon.
3. **Aucune animation.** L'état `attente` ne bouge pas, ne pulse pas, ne tourne pas. Une
   animation invite à attendre là ; Jean-Luc a un client à servir.

### FeuillePartage

**Rôle** : partager un devis signé en PDF, et faire dire par Jean-Luc la date à laquelle il
le déclare partie (B8).

**Variantes** : `seule` (feuille pleine).

**Tailles** : feuille modale basse, hauteur 50 %.

**États** — rendus par l'union `EtatFeuillePartage` :

| État | Déclencheur | Apparence |
|---|---|---|
| `choix` | Ouverture depuis `FeuilleSortie` | `Partager le devis D-2026-014 en PDF.` Puis `Cette date est celle que vous déclarez. Aucune application ne la confirmera.` Et un champ de date, pré-rempli à la date du jour, que Jean-Luc **peut changer** — parce que s'il a partagé le devis hier dans une cave sans réseau, la vérité est hier. |
| `declaration` | Le partage est fait | `Parti en PDF partagé le 12 mars.` puis `Date déclarée par vous. Rien ne l'a confirmée.` Le document devient `declaration` et **jamais** `confirme` (B8, US-4). |

**Slots** :

| Slot | Requis | Contenu |
|---|---|---|
| `date-declaree` | oui | La date que Jean-Luc déclare, éditable avant validation. |
| `avertissement` | oui | `Cette date est celle que vous déclarez. Aucune application ne la confirmera.` |
| `bouton-partage` | oui | `Partager le PDF`. |
| `mention` | oui | À l'état `declaration`, la mention du § 0.3 avec sa preuve `3a`. |

### BandeauBlocage

**Rôle** : dire qu'une action est impossible **et pourquoi**, sans disparaître et sans
être contournable (E16, C5, B16).

**Variantes** : `question` (une seule question à trancher) · `incomplet` (des champs
manquants) · `lecture` (un fait que Jean-Luc doit connaître avant d'agir).

**Tailles** : feuille plein écran, hauteur 100 %, en-tête `--color-encre-foncee` et texte
`--color-texte-inverse`.

**États** — rendus par l'union `EtatBlocage` :

| État | Déclencheur | Apparence |
|---|---|---|
| `ouvert` | Une action est bloquée | L'écran entier est remplacé. Il n'y a **aucun moyen de le contourner** : pas de « Plus tard », pas de « Passer sans », pas de fermeture par la croix. L'écran d'où l'on vient est enregistré, et le retour y ramène **exactement au même endroit**. |
| `resolu` | La question est tranchée | L'écran disparaît en `--duration-slow`, et l'écran précédent revient à l'endroit où il était. |

**Slots** :

| Slot | Requis | Contenu |
|---|---|---|
| `question` | oui | **Une seule question par feuille.** La fiscalité, c'est une question : `Êtes-vous assujetti à la TVA ?` Les deux réponses sont `Oui` et `Non`, avec la conséquence écrite sous chacune. |
| `consequence` | oui | Sous chaque réponse, ce qu'elle engage. Sous `Non` : `Vos factures porteront la mention « non assujetti à la TVA ».` Sous `Oui` : `Forge vous demandera le taux applicable avant la première facture.` |
| `exclusion` | oui | La phrase de § 0.5 sur la comptabilité, en pied de feuille : `Forge écrit les mentions que la loi impose. Il ne tient aucun compte, ne suit aucune trésorerie, ne déduit rien.` |
| `issue` | oui | Le bouton qui tranche. Un seul. |

**La question de la TVA ne peut pas être tranchée par défaut, et la feuille ne se ferme
pas.** E16 est critique, C5 est bloquante, et la PRD § 8 dit que si la réponse traîne,
Jean-Luc ne peut plus facturer. Un blocage qui se referme tout seul est un blocage qui
n'existe pas. La seule sortie est la réponse, et elle est en deux mots.

### BandeauMessage

**Rôle** : dire quelque chose une fois, à l'endroit où ça s'est produit, sans-cover ce qui
est déjà à l'écran.

**Variantes** : `information` · `succes` · `echec` · `avertissement`.

**Tailles** : `barre` 48px, pleine largeur, sous l'en-tête · `ligne` 32px, dans un bloc de
formulaire.

**États** — rendus par l'union `EtatMessage` :

| État | Déclencheur | Apparence |
|---|---|---|
| `information` | Un fait que Jean-Luc n'attendait pas | Fond `--color-surface-raised`, filet gauche `--color-bordure-forte` 4px, icône `i`, texte `--color-texte-principal`. |
| `succes` | Une action a réussi et **l'état du document a changé** | Fond `--color-confirme-fond`, filet gauche `--color-bordure-confirme` 4px, icône de coche, texte `--color-texte-confirme`. Le texte contient **toujours la mention complète**, jamais `C'est fait !` : `Envoyé par courriel. Confirmé par le service de courriel à 18 h 12.` |
| `echec` | Une action a échoué | Fond `--color-expire-fond`, filet gauche `--color-bordure-expire` 4px, icône d'alerte, texte `--color-texte-expire`. Le texte dit ce qui **n'a pas** eu lieu, et il propose une action : `Le devis n'est pas parti. Vous pouvez réessayer.` |
| `avertissement` | Une échéance approche | Fond `--color-echeance-fond`, filet gauche `--color-bordure-echeance` 4px, icône d'horloge, texte `--color-texte-echeance`. |

**Slots** :

| Slot | Requis | Contenu |
|---|---|---|
| `texte` | oui | 8 à 16 mots. **Jamais de point d'exclamation**, jamais de « Bien joué », jamais de « Bienvenue ». La PRD § 7.3 dit que Jean-Luc lit en plein soleil ou dans une cave : une ligne d'exclamation est du bruit, et du bruit coûte de la attention. |
| `action` | non | Un bouton `discret`. Présent à `echec` (`Réessayer`) et à `information` (`Voir`), absent à `succes`. |
| `duree` | oui | `information` et `succes` disparaissent après 6 s ; `echec` et `avertissement` **restent jusqu'au changement d'écran**. |

**Un message qui disparaît ne peut pas porter une information qu'il faut retenir.** C'est la
raison de la durée inégale : un succès est déjà écrit dans le document — la mention
d'état a changé — donc le bandeau peut s'effacer. Un échec, lui, n'a laissé aucune trace
ailleurs, et c'est précisément pour cela qu'il ne s'efface pas tout seul.

### GroupeBoutons

**Rôle** : choisir une valeur dans une liste fermée de trois, ou de deux.

**Variantes** : `trois` (la durée de validité : 15, 30, 60 jours) · `deux` (oui / non sur
la fiscalité).

**Tailles** : `trois` 56px de haut, trois colonnes égales · `deux` 72px de haut, deux
colonnes, empilées en `verticale` sur téléphone pour que chaque réponse porte sa
conséquence.

**États** — rendus par l'union `EtatGroupeBoutons` :

| État | Déclencheur | Apparence |
|---|---|---|
| `inactif` | Aucun choix fait | Trois boutons `contour`, texte `--color-texte-principal`. `30 jours` porte la mention `recommandé` en `--text-etiquette` au-dessus : le défaut existe, il est écrit, et Jean-Luc peut en partir. |
| `selectionne` | Un choix est fait | Le bouton choisi passe en `plein` — encre pleine, texte inversé — et **les deux autres s'atténuent à 60 %**. Un seul bouton plein à la fois : c'est la seule place du produit où `plein` sert à montrer une sélection et non une action, parce que montrer une action et montrer un état revient au même geste. |
| `desactive` | Le choix est verrouillé | Tous les boutons en `desactive`, avec une ligne au-dessus : `La durée de validité est fixée avant le premier envoi. Elle ne s'applique qu'aux devis écrits après.` (B12) |

**Slots** :

| Slot | Requis | Contenu |
|---|---|---|
| `intitule` | oui | `Valable combien de temps ?` / `Êtes-vous assujetti à la TVA ?` |
| `option` | oui | Le libellé, et sous lui sa conséquence. `30 jours` · `Le défaut.` |
| `mention` | non | `recommandé`, à l'état `inactif` seulement. |

### PanneauExport

**Rôle** : tout télécharger, à tout moment, sans rien payer (B24, C6). C'est l'engagement
qui rend crédible la promesse de pouvoir partir.

**Variantes** : `permanent` (le panneau, tel qu'il est en permanence dans `Réglages`) ·
`en-cours` (la préparation) · `pret` (le fichier est prêt).

**Tailles** : bloc de 200px, pleine largeur moins les marges.

**États** — rendus par l'union `EtatPanneauExport` :

| État | Déclencheur | Apparence |
|---|---|---|
| `inactif` | Repos | `Vos devis et vos factures, dans un seul fichier.` puis `Ce téléchargement est permanent et ne coûte rien.` Puis un bouton `Tout télécharger`. **Aucun compte, aucun abonnement, aucune « version premium » en dessous.** |
| `preparation` | Préparation du fichier | `Préparation en cours.` **Pas de barre de progression** : l'export n'est pas un envoi, et un pourcentage serait un chiffre que le produit n'a pas. Le bouton est `desactive`, pas masqué : il reste à la même place, donc l'écran ne bouge pas. |
| `pret` | Le fichier est prêt | `Le fichier est prêt.` puis le nom du fichier et sa taille, puis `Enregistrer` et `Partager`. |

**Slots** :

| Slot | Requis | Contenu |
|---|---|---|
| `promesse` | oui | `Ce téléchargement est permanent et ne coûte rien.` |
| `action` | oui | `Tout télécharger`. |
| `resultat` | non | À l'état `pret` : le nom du fichier, sa taille, `Enregistrer`, `Partager`. |

### NavigationBasse

**Rôle** : trois entrées, et rien d'autre. Chaque entrée ouvre la boucle ou la consultent.

**Variantes** : `normale` (fond `--color-surface-raised`, filet `--color-tiret` en haut) ·
`au-dessus-dune-feuille` (fond `--color-encre-foncee`, pour `--shadow-lg`).

**Tailles** : 68px de haut, trois colonnes, zone tactile de 56px par entrée.

**États** — rendus par l'union `EtatNavigation` :

| État | Déclencheur | Apparence |
|---|---|---|
| `normal` | Écran autre que la boucle | Icône 24px en `--color-texte-secondaire`, libellé 14px en `--text-etiquette`. |
| `actif` | L'entrée correspond à l'écran courant | Icône et libellé en `--color-texte-principal`, filet haut `--color-bordure-forte` 3px sur toute la largeur de l'entrée. **Le fond de l'entrée ne change pas** : un aplat plein sur un téléphone qui bouge est un aplat qui fait sauter la ligne de vue. |
| `masque` | Une feuille modale est ouverte | La barre disparaît sous `--shadow-lg`. Pendant `FeuilleSignature` et `BandeauBlocage`, elle n'a jamais existé : c'est ce qui rend E5 impossible par construction plutôt que par désactivation. |

**Slots** :

| Slot | Requis | Contenu |
|---|---|---|
| `entree` | oui | Icône + libellé. Trois entrées, jamais quatre : `Suivi` · `Devis` · `Clients`. |
| `action-secondaire` | oui | `Ajouter` — le bouton d'action de la boucle, au-dessus de la barre, à droite, 56px, always visible sur l'écran d'accueil. **Ce n'est pas une icône dans un cercle** : c'est un bouton `plein` avec le mot `Devis`. |

**Il n'y a pas de badge sur la barre basse.** Pas de pastille rouge sur `Suivi` avec le
nombre de devis non envoyés. Le compteur est en haut de l'écran d'accueil, en 44 px, et il
est déjà le plus gros élément de l'écran : un badge le rendrait illisible, et il
transformerait un nombre en alerte alors qu'un devis non envoyé n'est pas une erreur.

---

## 3. Patterns de navigation

### 3.1 Structure

```
┌───────────────────────────────────────┐
│ FILE ATTENTE (44px) — seulement s'il  │  ← état global, jamais un toast
│ y a des envois en attente             │
├───────────────────────────────────────┤
│                                       │
│  CONTENU DE L'ÉCRAN                   │  ← défile
│                                       │
│                                       │
├───────────────────────────────────────┤
│ BARRE D'ACTION (60px) — quand l'écran │  ← action principale, à portée du pouce
│ a une action principale               │
├───────────────────────────────────────┤
│ ACCION (56px)   Suivi  Devis  Clients │  ← 3 entrées, jamais 4
└───────────────────────────────────────┘
```

**Trois bandes, et la bande d'action n'existe que là où elle sert.** L'écran de suivi n'a
pas de barre d'action : son action est dans son contenu, et une barre vide de bas en
occupant 60 px coûte 60 px de liste pour rien. L'écran de signature n'a **ni** barre
d'action **ni** barre basse : il n'a rien à faire et personne ne doit pouvoir sortir.

**Le détail est un push, jamais une entrée.** Le pattern de l'archétype
(`archetypes.md` §1) est explicite : le détail est modal ou push, pas une nouvelle entrée
de navigation. Un devis ouvert, un dossier ouvert, un devis expiré : ce sont des empilements
au-dessus de la liste, avec un bouton `Retour` explicite, et la liste **retrouve l'endroit
exact où elle était**.

### 3.2 Navigation principale

- **Type** : barre basse, trois entrées, plus un overflow `Plus`.
- **Comportement responsive** : identique du téléphone au grand écran. **La barre basse ne
  devient jamais un menu latéral.** La PRD § 7.1 impose que la boucle complète se fasse sur
  un téléphone tenu d'une main ; un menu latéral est un geste de pouce **impossible** au
  bord gauche d'un téléphone tenu de la main droite, et Jean-Luc est droitier dans neuf cas
  de travaux sur dix. Sur grand écran, la barre basse **reste en bas** et prend toute la
  largeur ; c'est la seule chose qui ne change pas, et c'est délibéré.
- **Plateau** : 3 items principaux (max 5 — le reste est en overflow).

| Rang | Module | Libellé | Fréq. (1-5) | Centralité (1-5) | Justification |
|---|---|---|---|---|---|
| 1 | `suivi` | **Suivi** | 5 | 5 | **Score 25.** C'est l'entrée la plus utilisée : Jean-Luc ouvre l'application pour savoir s'il a envoyé quelque chose, pas pour envoyer. Le compteur de devis non envoyés y est le plus gros élément de l'écran (B23, E10), et la liste montre l'état de sortie de chaque devis sans sélection (B25). **L'accueil n'est pas premier par défaut** — il l'est parce qu'il ouvre la boucle : constater l'état, puis agir. |
| 2 | `devis` | **Devis** | 3 | 5 | **Score 15.** Créer un devis est peu fréquent — 30 par an, soit deux ou trois par mois (hypothèse du contrat § 3) — mais c'est **l'acte** que la PRD § 1.1 nomme comme problème principal, et aucun autre module n'existe sans lui. La fréquence est basse, la centralité maximale : c'est le cas d'exception que `module-prioritization.md` §Étape 3.1 décrit. Elle ouvre directement la saisie, sans passer par une liste intermédiaire. |
| 3 | `clients` | **Clients** | 3 | 4 | **Score 12.** On y va quand un client appelle : deux ou trois fois par mois. Recherche par nom, dossier complet (B21, E12, E14). En rang 3 et non en overflow, parce que c'est un **appel**, pas une consultation : un client au téléphone qui attend n'attend pas qu'on cherche dans un menu `Plus`. |

**Overflow (`Plus`)** :

| Module | Libellé | Raison du placement en overflow |
|---|---|---|
| `reglages` | **Réglages** | Fréquence 1 sur l'année : la durée de validité, les deux exclusions de § 0.5, le prix, l'export. C'est de la **configuration** (règle 4 de `module-prioritization.md`), donc jamais dans la barre principale. Mais c'est aussi là que vit la promesse de pouvoir partir (B24) : elle est à un geste, pas dans un sous-menu. |
| `facture` | **Facture** | **N'existe pas dans la navigation avant la V1.** Le MVP n'a pas de facture (roadmap § 2.2), et une entrée qui mène à un écran vide est une promesse que le produit ne tient pas. L'entrée n'est pas « grisée » : elle n'existe pas. |
| `export` | — | **N'est pas un module.** C'est un bloc de `Réglages` (§ 2, `PanneauExport`), atteignable en un geste. Lui donner une entrée de navigation serait lui donner une fréquence qu'il n'a pas. |

**L'ordre retenu est ensuite enregistré de façon vérifiable :**

```bash
node "$FORGE/scripts/state.js" set-nav "/workspaces/ship-clean-skills/Forge Labs/atelier" '{
  "archetype": "mobile_field_ops",
  "platform": "web installable (PWA), telephone d abord",
  "core_loop": "constater ce qui n est pas sorti, ecrire un devis devant le client, le faire signer au doigt, choisir comment il sort, verifier que le service a confirme",
  "items": [
    { "key": "suivi",   "label": "Suivi",   "rank": 1, "frequency": 5, "task_criticality": 5,
      "rationale": "l entree la plus utilisee : Jean-Luc ouvre pour savoir s il a envoye, pas pour envoyer ; le compteur de devis non envoyes y est le plus gros element de l ecran (B23, E10)" },
    { "key": "devis",   "label": "Devis",   "rank": 2, "frequency": 3, "task_criticality": 5,
      "rationale": "creer un devis est peu frequent mais c est l acte que le PRD nomme comme probleme principal ; aucun module n existe sans lui" },
    { "key": "clients", "label": "Clients", "rank": 3, "frequency": 3, "task_criticality": 4,
      "rationale": "on y va quand un client appelle ; un client au telephone qui attend n attend pas qu on cherche dans un menu Plus" },
    { "key": "reglages", "label": "Reglages", "rank": 4, "overflow": true, "frequency": 1, "task_criticality": 3,
      "rationale": "configuration pure, une fois par an ; mais c est aussi la que vit la promesse de pouvoir tout telecharger (B24)" }
  ]
}'
```

### 3.3 Le paradoxe de l'archétype, et comment il se tranche

`archetypes.md` §1 dit deux choses qui ne vont pas ensemble :

> « Bottom nav 3–5 items, **la première action fréquente est en position haute** »
> « Grandes cibles tactiles, actions principales atteignables par le pouce »

La première phrase prescribe une position haute ; la seconde rend cette position
inatteignable au pouce. Le produit ne peut pas satisfaire les deux, donc il doit choisir —
et dire lequel il choisit.

**Atelier tranche ainsi : la position haute porte l'état, la position basse porte l'action.**

- **L'état — `FileAttente`, `EtatSortie`, la ligne de preuve — est en haut de l'écran.**
  Il est hors de portée du pouce. C'est délibéré : **un état ne se tape pas, il se lit**, et
  on lit une position haute sans avoir à déplacer la main qui tient l'appareil. Le placer en
  bas l'obligerait à mettre le pouce sur le mot `confirmé`, c'est-à-dire à le masquer au
  moment précis où l'on s'en sert pour vérifier.
- **L'action — `Bouton` `grande`, barre d'action, barre basse — est en bas**, dans
  `--zone-pouce` (96 px). Elle est à portée du pouce, et elle est à 60 px de haut, pas à 44.

Ce qui rend ce choix tenable, c'est que la **hauteur** d'un élément et sa **position** ne
sont pas la même contrainte : un état en haut peut être à 32 px de haut et perfectly lisible
sans le toucher, tandis qu'une action à mi-hauteur d'un écran de 800 px est hors de portée
sur un téléphone de 6 pouces. Le critère réel n'est pas « haut » ou « bas », c'est
**tapé ou lu**. L'archétype confond les deux dans sa première phrase ; ce design les sépare.

### 3.4 Breadcrumbs, retour arrière, transitions

- **Fil d'Ariane** : **jamais.** Un fil d'Ariane est un chemin de navigation dans une
  arborescence ; Atelier n'a pas d'arborescence, il a un empilement. Le retour est un
  bouton `Retour` de 56 px, en haut à gauche, avec le **nom de l'écran d'où l'on vient** —
  `Retour à Suivi` plutôt que `Retour`, parce que sur un écran d'encre, en plein soleil,
  le mot dit où on va et pas d'où on vient.
- **Retour arrière** : **ne perd jamais la saisie.** Une ligne en cours de saisie est
  conservée au moment où l'on quitte l'écran (E2, PRD US-13). Le retour arrière du système
  est intercepté et traité comme le bouton `Retour`. Deux exceptions, qui sont des pages
  à part entière et non des sous-écrans : `FeuilleSignature` (§ 2, état `interrompue`) et
  `BandeauBlocage` (§ 2, état `ouvert`).
- **Transitions** : **fondu de 220 ms** (`--duration-normal`) entre deux pushes de premier
  niveau ; **glissement vers le haut de 320 ms** pour une feuille modale basse, avec
  `--ease-entree`. Le retour est le glissement inverse. **Aucun glissement latéral** : un
  retour latéral se fait vers la droite, et un geste vers la droite n'est pas un geste de
  pouce sur un téléphone tenu d'une main.
- **Aucune transition sur un changement d'état de mention** — voir § 1.6.

### 3.5 Écarts aux standards de l'archétype

Chaque écart est écrit, avec sa raison. Un écart non justifié est un défaut ; un écart
justifié est une décision.

| Standard de `mobile_field_ops` §1 | Position retenue | Raison |
|---|---|---|
| Bottom nav 3–5, première action fréquente en position haute | **Écart assumé** : 3 entrées, l'état en haut, l'action en bas | § 3.3 : l'état se lit, l'action se tape. Garder les deux à 5 entrées ferait 5 zones de 56 px dans une portée de pouce qui n'en contient que 3 sans comprimer. |
| Saisie rapide, champs pré-remplis, validation tolérante | **Conforme** | `LigneDevis` en mode `vide` propose la désignation la plus fréquente du métier ; `ChampRecherche` propose `Nouveau dossier pour M. Roux ?` ; la validation tolère tout, sauf ce qui est légal (B1, B16). |
| Fonctionne hors-ligne, file d'attente, synchronisation explicite | **Conforme, et c'est le cœur** | `EtatSortie`, `FileAttente`, `CompteurNonEnvoyes`, `FeuilleSortie`. |
| Détail modal ou push, pas une nouvelle entrée | **Conforme** | § 3.1, § 3.4. |
| Grandes cibles, actions au pouce | **Conforme** | `--hauteur-cible` 56px, `--zone-pouce` 96px, § 1.3. |
| Modules attendus : accueil, saisie du jour, carte/liste, détail, historique | **Écart assumé** : pas de carte, pas d'historique séparé | Jean-Luc est dans une **cave**, sur un **sous-sol** : une carte n'a aucun point de repère. Et un « historique » séparé du suivi serait un second endroit où un devis peut être absent — donc un second endroit où il peut être perdu. L'historique **est** la liste de suivi, ordonnée par date. |

---

## 4. Grille et layout

### 4.1 Grille de base

```
Téléphone (0 – 479px)          Tablette (480 – 1023px)
┌──────────────────┐          ┌────────────────────────────┐
│ marge 16px       │          │ marge 24px                 │
│ ┌──────────────┐ │          │ ┌────────────────────────┐ │
│ │ contenu      │ │          │ │ ligne de devis         │ │
│ │ largeur =    │ │          │ │ ┌──────┐ ┌──┐┌──┐┌───┐ │ │
│ │ 100% - 32px  │ │          │ │ │désig.│ │q ││PU││mnt│ │ │
│ └──────────────┘ │          │ │ └──────┘ └──┘└──┘└───┘ │ │
│ marge 16px       │          │ │ 58%    14% 14%  14%    │ │
└──────────────────┘          │ └────────────────────────┘ │
                               └────────────────────────────┘
```

**La grille n'est pas uniforme, et c'est le choix qui la rend lisible.**

- **Dans un devis**, la grille est dense : `--space-md` entre deux lignes de 56 px, une
  ligne de filet `--color-tiret` entre chaque. Un devis de douze lignes tient en six
  défilements verticaux de pouce, pas en douze.
- **Entre trois blocs d'un écran**, la grille est aérée : `--space-2xl`. L'en-tête, les
  lignes et le pied sont trois **`GroupeListe`** distincts, séparés par de l'espace et un
  filet `--color-bordure-forte`, pas par trois cartes.
- **Le montant n'est pas dans une grille.** `TotalBloc` est un bloc pleine largeur, aligné
  à gauche, avec le montant en 44 px et `euros` en 16 px sur sa ligne de base. Le total est
  la seule chose de cet écran qui n'est pas centrée, et c'est ce qui l'empêche d'être
  pris pour un élément décoratif.

**Aucun centrage symétrique.** Le contenu est aligné à gauche avec une marge constante ;
les seules choses centrées sur le produit sont les deux blocs de `GroupeBoutons` en
variante `deux`, et un état vide — parce qu'un état vide n'a pas de côté gauche naturel, et
que le centrer est la seule lecture honnête de « il n'y a rien ici ».

### 4.2 Layouts type

| Layout | Structure | Usage |
|---|---|---|
| **Liste de suivi** | `FileAttente` → `CompteurNonEnvoyes` → `GroupeListe` × 3 → `NavigationBasse`. Pas de barre d'action. | `suivi`, `clients` |
| **Saisie** | `EnTeteDevis` partiel → `LigneDevis` en liste → `TotalBloc` épinglé → `Bouton grande` `plein` en barre d'action. Le total est **épinglé au-dessus** du pavé numérique. | `devis-nouveau`, `devis-lignes` |
| **Document** | `EnTeteDevis` complet → corps du devis en `--color-surface` → `LigneEcheance` complète → `TotalBloc` figé → `EtatSortie` en `bloc`. Aucune ombre : le document est une feuille de papier sur un fond de plâtre, et son seul repère est le filet. | `devis-detail`, `dossier-client` |
| **Signature** | Le document entier, en haut, sans chrome. `FeuilleSignature` en bas, sur toute la largeur, hauteur 220px. `Bouton grande` dans la zone du pouce, sous la piste. **Ni barre basse, ni en-tête de navigation, ni bouton de retour.** | `signature` |
| **Feuille modale basse** | `Mention` grande → `Preuve` → une à trois actions → `Annuler`. Ombre `--shadow-lg` vers le haut. Le fond en dessous est visible et **reste lisible** : c'est le document que Jean-Luc vient de signer. | `sortie`, `partage-pdf` |
| **Plein écran bloquant** | En-tête `--color-encre-foncee`, une question, deux réponses avec leur conséquence, un bouton. Pas de fermeture possible. | `question-fiscale` |
| **Colonnes** | Sur `--bp-poste` et au-delà : la liste à gauche sur 360 px, le document à droite, sur le fond `--color-background`, avec la liste sur `--color-surface`. La différence de valeur de fond **est** la séparation — pas une ombre, pas une bordure. | Tous, sur grand écran |

---

## 5. Inventaire des écrans

| # | Fichier | Écran | Rang de navigation | Type | US | B* | E* |
|---|---|---|---|---|---|---|---|
| 1 | `suivi.md` | Suivi | 1 | page | 6, 7, 8 | B5, B12, B23, B25, B26 | E10, E15 |
| 2 | `devis-nouveau.md` | Nouveau devis | 2 | page | 1 | B1, B12 | E13, E14 |
| 3 | `devis-lignes.md` | Lignes du devis | sous-écran de `devis` | page | 1, 13 | B2, B3, B4 | E2, E13 |
| 4 | `devis-detail.md` | Détail du devis | push depuis `suivi` | page | 1, 3, 7 | B1, B3, B5, B6, B10, B11 | E6, E15 |
| 5 | `signature.md` | Signature | sous-écran de `devis-detail` | page | 2, 14 | B9, B10, B11 | E5, E7, E17 |
| 6 | `sortie.md` | Comment le devis sort | feuille depuis `devis-detail` | sheet | 3 | B5, B6, B7, B9 | E3, E4 |
| 7 | `partage-pdf.md` | Partage en PDF | feuille depuis `sortie` | sheet | 4 | B8 | E3 |
| 8 | `dossier-client.md` | Dossier d'un client | push depuis `clients` | page | 11, 12 | B21, B24 | E12, E14 |
| 9 | `clients.md` | Clients | 3 | page | 11 | B21 | E12, E14 |
| 10 | `echeance.md` | Devis expiré | feuille depuis `suivi` | sheet | 8 | B12, B13 | E8 |
| 11 | `question-fiscale.md` | Question à trancher | plein écran, hors rang | bloquant | 9 (V1) | B17 | E16 |
| 12 | `reglages.md` | Ce que l'application ne fait pas | `Plus` | page | 5, 12 | B22, B24 | — |
| 13 | `export.md` | Tout télécharger | `Plus` | sheet | 12 | B24 | — |

**Treize écrans.** Deux d'entre eux n'appartiennent à aucun rang de navigation, et c'est
normal : `signature` est un sous-écran imposé par B9, et `question-fiscale` est un écran
bloquant que rien ne déclenche volontairement — on tombe dessus quand on essaie d'émettre
une facture, ce qui n'est pas encore possible au MVP.

**Écarts de couverture, déclarés.** Les règles B14, B15, B16, B18, B19 et B20 **n'ont
aucune manifestation visuelle**, et c'est un choix explicite : ce sont les six règles de la
tranche Facture et Relance, exclues du MVP par le roadmap § 2.2 parce que B16 exige cinq
mentions que Forge ne peut pas déduire et que B17 bloque l'émission. Les concevoir
maintenant ferait inventer trois décisions non tranchées (PRD § 12). Ce qui est conçu à la
place, c'est **le blocage** — écran 11, `question-fiscale`, qui est la manifestation de
E16 et C5.

### 5.1 Flows de navigation

| Flow | Chemin | Le moment où ça peut échouer |
|---|---|---|
| **Boucle principale** | `suivi` → `Devis` → `devis-nouveau` → `devis-lignes` → `devis-detail` → `signature` → `sortie` → `confirme` | À `sortie` seulement. Partout avant, l'application écrit en local (B4). |
| **Sortie PDF** | `signature` → `sortie` → `partage-pdf` → retour `devis-detail` | Jamais : le partage n'a besoin d'aucun réseau (US-4). |
| **Devis expiré retrouvé** | `suivi` → groupe 3 → `echeance` → `devis-detail` | Jamais. L'échéance est une question, pas une action : elle est **reposée à chaque ouverture** tant que Jean-Luc n'a pas choisi (E8). |
| **Client au téléphone** | `suivi` → `Clients` → `ChampRecherche` → `dossier-client` → `devis-detail` | À la recherche seulement, et elle est locale. |
| **Hors-ligne complet** | `suivi` → tout le reste de la boucle → `sortie` état `choix` → `partage-pdf` | À l'envoi par courriel. **La seule action du produit qui dépend du réseau.** |
| **Reprise après coupure** | Sortie de l'application, réouverture → `suivi` | Aucun : tout est écrit en local (B4, E2). |
| **Première utilisation** | Ouverture → `suivi` à `zero`, les trois groupes vides avec leur phrase, `Devis` en action permanente | Aucun. **Pas d'inscription, pas de mot de passe, pas de tutoriel** (B22, C2). |
| **Le client tente de regarder ailleurs** | `signature` : aucune sortie n'existe vers une liste | Impossible : il n'y a aucun élément de navigation sur l'écran (E5). |

---

## 6. Ce que ce design refuse de faire

Trois refus, écrits parce qu'ils seront tentés à nouveau.

| Refus | Raison |
|---|---|
| **Un pourcentage de synchronisation** | Le produit ne sait pas combien de temps il lui reste. `67 %` est un nombre inventé, et c'est le même défaut que d'écrire « envoyé » avant la confirmation — présenté dans une autre couleur. |
| **Une action « Réessayer » sur un devis non envoyé** | Un devis écrit et non envoyé n'a pas **échoué** : il n'a pas été envoyé. `Réessayer` décrit un état qui n'existe pas et suggère que quelque chose s'est mal passé. L'action correcte s'appelle `Envoyer`, et elle est disponible parce que c'est elle qui n'a pas été faite. |
| **Un total « provisoire » pendant la saisie** | B3 impose que le total affiché, le total imprimé et le total couvert par la signature soient **le même nombre**. Un total qui se recalcule pendant la frappe est un total différent du total signé, et il le serait de nouveau à la signature. Le total est affiché en permanence et il est mis à jour ; ce n'est pas la même chose qu'en montrer deux. |

---

## Checklist de gate

Cf. `design-quality.md` — cette checklist n'est pas qu'une formalité, elle est le filtre anti-générique.

**Direction**
- [x] Les trois ancres sont écrites : références, ambiance, anti-références (§ 0).
- [x] L'archétype est identifié et justifié (`mobile_field_ops`, § 0), et le paradoxe de la
  fiche de l'archétype est tranché par écrit (§ 3.3).
- [x] La densité est choisie consciemment et justifiée : **dense**, parce que l'écran est
  tenu d'une main dans un local sombre (§ 0).
- [x] **Le skill de design `imagegen-frontend-mobile` n'est pas installé dans cet
  environnement.** Les interdits du § 3 de `design-quality.md` ont été appliqués un par un
  et les exigences du § 4 sont remplies. **Aucune maquette de référence n'a été produite**,
  et c'est le manque que cette phase assume (§ 0.1). Ce signalement est écrit ici, et non
      dans un rapport que personne ne lit.

**Tokens**
- [x] Tous les design tokens ont une **valeur concrète** — 30 couleurs en hexadécimal,
  aucune « à définir », aucun « à voir plus tard ».
- [x] Aucun `{{PLACEHOLDER}}` résiduel — `node "$FORGE/scripts/forge-guard.js" placeholders <anchor>`
  ne signale rien.
- [x] La palette couvre tous les états (default, hover, active, disabled, error, success,
  warning, info) pour chaque composant qui les rend.
- [x] La palette n'est pas une palette par défaut : ni `#3B82F6`, ni `#6B7280`, ni
  `#EF4444`, ni `#10B981`. Elle est **descriptive** : chaque couleur nomme un fait et la
  main qui l'a constaté (§ 1.1).
- [x] Le fond n'est pas du blanc pur non choisi : `--color-background` `#EDE8DC`.
- [x] L'échelle typographique a des ratios explicites entre ses niveaux, et **elle en a
  deux** parce que l'écran en a trois niveaux de titre et un chiffre qui se lit à un mètre.
- [x] **Aucun ratio de contraste n'est écrit dans ce document.** La mesure est faite par
  `design-check contrast`, et un ratio rédigé serait un nombre fabriqué.

**Composants**
- [x] Vingt-trois composants primitifs, exhaustifs pour le périmètre.
- [x] Chaque composant a ses états documentés **et le nom de l'union qui les rend** —
  sans ce pointeur, aucun contrôle ne peut dire si un état déclaré a un rendu.
- [x] Chaque composant a ses slots déclarés.
- [x] L'ombre n'est pas le séparateur par défaut : elle ne sert qu'à dire qu'un panneau est
  **au-dessus** d'un autre (§ 1.4).

**Navigation**
- [x] La navigation est définie pour téléphone, tablette, poste et grand écran.
- [x] **L'ordre des entrées est justifié par la fréquence**, avec un score et une raison
  par entrée : Suivi 25, Devis 15, Clients 12, Réglages 1 (overflow).
- [x] La barre principale ne dépasse pas 5 items : **3**, le reste est en overflow documenté.
- [x] « Suivi » est premier **pour une raison** : c'est l'entrée la plus utilisée, et c'est
  elle qui ouvre la boucle.
- [x] L'ordre est enregistré via `state.js set-nav`.

**Layout**
- [x] La grille et les layouts couvrent tous les usages du PRD, y compris le pavé numérique
  d'une main et la feuille de signature sans chrome.
- [x] Les animations et transitions sont nommées, avec durée et easing, et **deux durées
  sont volontairement nulles** (§ 1.6).
- [x] **Un choix visuel est assumé et contestable** : aucun bouton bleu dans toute
  l'application (§ 0.4). Un second : l'état vide de l'accueil dit ce que le produit fait,
  au lieu d'afficher une illustration et un « Bienvenue ».

**Contenu**
- [x] Les états vides portent un libellé écrit, jamais `Réessayer`, jamais `Charger encore`,
  et un état vide n'est jamais rendu comme un `0`.
- [x] Les deux exclus du contrat sont **visibles à l'écran**, avec leur prix en euros
  (§ 0.5).
- [x] Le vocabulaire de sortie tient en trois mots, et le mot `confirmé` n'apparaît que
  dans la ligne de preuve (§ 0.3).

**Statut** : `draft` → en attente de validation.