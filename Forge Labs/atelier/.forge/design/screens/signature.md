---
type: screen
slug: signature
title: Signature
module: Signature
status: draft
generated_at: 2026-10-01
derived_from:
  - .forge/prd.md
  - .forge/design/design-system.md
  - .forge/roadmap.md
rule_ids: [B9, B10, B11]
edge_case_ids: [E5, E7, E17]
flow: Boucle principale
---

# Écran — Signature

> Ce document est la **source de vérité** pour qu'une IA génère l'interface de cet écran.
> Il est généré depuis le gabarit de `skills/forge/templates/screen.md.tmpl`, jamais recopié.

**Scénario** — `D-2026-016`, Mme Lefèvre, `1 240 euros`, signé le 12 avril 2026 à 10 h 07,
empreinte `4f2a…9c1d`. L'écran a été ouvert, Mme Lefèvre a signé, et le devis ne partira
d'ici que si Jean-Luc choisit une sortie.

---

## 1. Rôle de l'écran

| | |
|---|---|
| **Archétype d'app** | `mobile_field_ops` |
| **Module** | sous-écran de `devis-detail` — aucune entrée de navigation |
| **Route** | `/devis/:numero/signature` |
| **Type** | page plein écran, sans barre basse, sans chrome |
| **Utilisateurs** | **Le client**, une fois par devis, occasionnel, sans connaître l'application. Et Jean-Luc, qui tient l'appareil. |
| **User stories servies** | US-2 (faire signer au doigt), US-14 (tendre l'appareil sans ouvrir les dossiers) |
| **Règles métier** | B9, B10, B11 |
| **Edge cases** | E5, E7, E17 |

**Une phrase** : cet écran permet **au client de signer le devis de son doigt, sur l'appareil de Jean-Luc**, afin de **repartir avec un document signé sans stylo, sans papier et sans compte à créer**.

**Pourquoi il n'a pas de rang de navigation** : c'est un sous-écran imposé par B9, et il ne peut pas être atteint autrement. Le PRD § 2 est explicite : un client qui pose sa signature n'hérite d'aucun accès, ce qu'il voit est borné au devis à signer. Lui donner une entrée de navigation reviendrait à donner au client l'accès à l'application.

### 1.1 Ce que cet écran essaie d'éviter

Cet écran essaie d'éviter **que le client voie autre chose que le devis qu'il signe**. Le risque produit le plus grave du PRD § 8 est celui-ci : Jean-Luc tend sa tablette, le client parcourt, et il tombe sur le devis du voisin. Aucun garde-fou ne tient ici, et c'est un choix d'architecture : cet écran **n'a pas de barre basse, pas de bouton de retour, pas d'en-tête de navigation, aucun lien vers un dossier, aucun contrôle de document précédent, aucun glissement latéral de navigation**. L'exigence E5 est tenue par **l'absence de ces éléments**, pas par leur désactivation — un bouton `Retour` grisé se voit, et un bouton visible se presse. Le design-system § 2 le dit en une phrase : la barre basse « n'a jamais existé » pendant cet écran, et c'est ce qui rend E5 impossible **par construction** plutôt que par convention. La seconde chose refusée est **l'écran de signature qui ressemble à un formulaire**. Aucun titre de produit, aucun logo, aucun « Étape 2 sur 3 », aucun nom d'application : le client doit voir un devis, pas un logiciel. La troisième est **le geste interruptible qui enregistre quand même**. Si un appel entrant coupe le tracé, ou si la batterie meurt, **rien n'est enregistré comme signé** (E17) — l'écran rouvre à `vide`, et le devis est non signé. Pas « signature en attente », pas « presque signé » : ce sont deux expressions qui promettront une signature qui n'existe pas. La quatrième est **`Annuler` silencieux** : la seule sortie de cet écran dit ce qu'elle vient de faire — `La signature n'a pas été gardée. Le devis n'est pas signé.`

### 1.2 Les trois mots, écrits dans l'écran

Un devis signé ne change pas encore d'état de sortie : il est signé, et il est **encore** dans son état d'écriture. L'écran le dit, au-dessus de la piste, avant que le client ne signe — pas après, ce serait trop tard :

`Pas encore signé` — puis, dès que la signature est validée :

`Signé le 12 avril 2026 à 10 h 07 — empreinte 4f2a…9c1d.`
`Écrit ici, pas encore envoyé` · `Sur ce téléphone. Personne ne l'a reçu.`

Les deux sont sur le même écran, à des moments différents, et dans cet ordre : **d'abord le geste, ensuite l'état de sortie**. L'inverse — annoncer `Écrit ici, pas encore envoyé` pendant que le client signe — dirait au client que ce document va partir par courriel tout seul.

---

## 2. Direction visuelle de cet écran

Repris du design system — **valeurs concrètes, jamais « à définir »**.

| | |
|---|---|
| **Mood** | dense, mate, sans emphase |
| **Densité** | **normale dans le document, dense dans la piste.** Le devis occupe le haut de l'écran en `--text-corps` `17px` — il doit être lisible par un client qui ne connaît pas l'application, donc on ne le compacte pas. La piste de signature fait 220px de haut : c'est la cible, et une cible ne se compacte pas. |
| **Niveau de contraste** | **fort** — le texte du devis en `--color-texte-principal` `#1F1B15` sur `--color-surface` `#F6F2E9`. Le tracé en `--color-texte-encre-signature` `#1F4C6B` sur `--color-encre-signature-fond` `#DEE6EF` : c'est la seule couleur de l'application qui sert à dire « c'est moi qui l'ai constaté », et ici c'est littéralement vrai : le tracé est la main du client, et son empreinte est le texte que Jean-Luc a vu. |
| **Surface** | le document en `--color-surface` `#F6F2E9` en haut, la piste en `--color-encre-signature-fond` `#DEE6EF` en bas. Les deux surfaces **se touchent sans filet** : ce sont deux morceaux du même papier. |
| **Accent utilisé** | `--color-texte-encre-signature` `#1F4C6B` — le tracé, l'empreinte, et rien d'autre. **Aucun bouton bleu** : le bouton `Valider la signature` est en `Bouton` variante `plein`, donc encre `--color-encre-foncee` `#26211A` sur papier, jamais bleu. |
| **Traitement photographique** | AUCUN |
| **Référence** | Too Good To Go pour la règle d'une main : un écran, une décision, l'action au pouce, aucun menu. Ici la règle est poussée à sa limite — **une décision, zéro sortie**. |

### 2.1 Anti-générique — obligatoire

Cet écran ne doit ressembler **à aucun** de ces défauts :

- [x] **Pas de fond blanc pur** `#FFFFFF` — le document est `--color-surface` `#F6F2E9`, la piste `--color-encre-signature-fond` `#DEE6EF`. Un écran de signature générique est un PDF blanc sur fond gris `#F5F5F5`, avec un cadre `1px solid #E5E7EB` autour de la signature.
- [x] **Pas de carte ombrée pour tout.** Aucune carte. Le document est une page à bords droits `--radius-none` `0`, la piste est un aplat. L'ombre n'apparaît qu'à un seul endroit, et c'est le seul endroit où elle est légitime : `--shadow-xl` `0 8px 32px rgba(31,27,21,0.22)`, parce que la piste **masque le document** au lieu de lui être voisine.
- [x] **Pas d'uniformité** : quatre niveaux sur l'écran — `--text-h2` `23px` pour le nom du client dans le document, `--text-corps` `17px` pour les lignes de travaux, `--text-mention` `16px` pour `Pas encore signé` et l'empreinte, `--text-corps-fort` `17px` pour le libellé du bouton. Et deux échelles d'espacement : `--space-lg` `16px` à l'intérieur du document, `--space-md` `12px` dans la piste.
- [x] **Pas de gris neutre générique** `#6B7280` — la piste est `--color-encre-signature-fond` `#DEE6EF`, son filet `--color-bordure-champ` `#6F6757`, le texte d'indication `--color-texte-secondaire` `#4C4436`.
- [x] **Pas de mise en page centrée symétrique** — le document est aligné à gauche. **La seule chose centrée sur cet écran est le libellé d'indication de la piste**, parce qu'une piste de signature n'a pas de côté gauche naturel et que le centrer est la seule lecture honnête de « signe ici ».
- [x] **Pas d'illustration d'appoint** — la piste vide dit `Le client signe ici, du doigt.` Pas de stylo dans un cercle, pas de main dessinée, pas de zone pointillée.
- [x] **Pas d'une seule famille de police** — `--font-texte` `Archivo` pour le devis, `--font-identifiant` `IBM Plex Mono` `15px` pour `D-2026-016` et pour `4f2a…9c1d`.

**Choix assumé et non neutre** : **aucun bouton `Effacer`, aucun bouton `Valider` tant que la piste est vide.** C'est le choix le plus contestable de cet écran, parce que les deux boutons sont attendus. Ils n'auraient rien à valider : un `Valider la signature` actif sur une piste vide enregistre une signature vide, et une signature vide est un document que Jean-Luc croit couvert et qui ne l'est pas. Les deux apparaissent **en même temps que le tracé**, jamais avant, et `Effacer` reste présent après — parce qu'un tracé qu'on ne peut pas recommencer est un tracé qu'on est forcé de valider.

---

## 3. Anatomie

```
┌─────────────────────────────────────────┐
│                                         │
│  DOCUMENT À SIGNER — le devis borné     │
│  D-2026-016  (mono 15px)               │
│  Mme Lefèvre                   h2 23px │
│  ─────────────────────────────────      │
│  Pose de trois fenêtres coulissantes    │
│                2 × 1 240 € = 2 480      │
│  ─────────────────────────────────      │
│  1 240 euros             (montant 32px) │
│  Pas encore signé            (16px)     │
│                                         │
│  AUCUN en-tête                          │
│  AUCUNE barre basse                     │
│  AUCUN bouton de retour                 │
│  AUCUN lien vers un dossier             │
│                                         │
├─────────────────────────────────────────┤
│ PISTE DE SIGNATURE — 220px              │
│  `--color-encre-signature-fond`         │
│  ┌───────────────────────────────────┐  │
│  │  Le client signe ici, du doigt.   │  │  ← état `vide`
│  └───────────────────────────────────┘  │
│  (au tracé)                             │
├─────────────────────────────────────────┤
│ EMPREINTE — sous la piste, jamais à sa  │
│  place — 16px mono                      │
│  Signé le 12 avril 10 h 07 —            │
│  empreinte 4f2a…9c1d                    │
├─────────────────────────────────────────┤
│ BARRE D'ACTION 60px — LE POUCE         │
│  [ Annuler ] [ Valider la signature ]   │
└─────────────────────────────────────────┘
```

| # | Composant | Rôle | Source |
|---|---|---|---|
| 1 | `FeuilleSignature` variante `signature` | recueillir la signature du doigt, et n'être **rien d'autre** pendant ce geste (E5) | design-system § 2 |
| 2 | `FeuilleSignature` variante `confirmation` | Jean-Luc relit l'empreinte après | design-system § 2 |
| 3 | `EnTeteDevis` variante `complet` | l'identité du document à signer, dans le document lui-même — **pas un en-tête d'application** | design-system § 2 |
| 4 | `LigneDevis` variante `compacte` | les lignes de travaux, en lecture seule | design-system § 2 |
| 5 | `TotalBloc` variante `fige` | le montant couvert par la signature, et **rien d'autre à côté** (B3) | design-system § 2 |
| 6 | `PastilleEtat` variante `signature` | `Pas encore signé`, puis `À resigner` si la signature a été annulée | design-system § 2 |
| 7 | `Bouton` variante `plein` taille `grande` | `Valider la signature`, à `--hauteur-action-primaire` `60px` | design-system § 2 |
| 8 | `Bouton` variante `discret` | `Annuler`, la seule sortie de l'écran | design-system § 2 |
| 9 | `BandeauMessage` | l'échec d'écriture de la signature, une fois | design-system § 2 |
| 10 | **Piste de signature 220px** | la zone de tracé, en `--color-encre-signature-fond` `#DEE6EF`, filet `--color-bordure-champ` `#6F6757` | design-system § 2, slot `piste` |

---

## 4. États — tous, sans exception

| État | Déclencheur | Rendu | Feedback utilisateur |
|---|---|---|---|
| **Chargement** | Ouverture depuis `devis-detail` | **Aucun squelette.** Le devis est local. Le document s'affiche, puis la piste en dessous, **vide**. | rien |
| **Rempli** | Un doigt a tracé et `Valider la signature` a été pressé | `FeuilleSignature` à l'état `tracee` : le tracé **reste affiché**, le bloc d'empreinte apparaît **sous** la piste — jamais à sa place : `Signé le 12 avril 2026 à 10 h 07 — empreinte 4f2a…9c1d.` Le bouton `Valider la signature` devient disponible. La `PastilleEtat` `Pas encore signé` disparaît et c'est l'empreinte qui la remplace. | le tracé ne s'efface pas au relâcher |
| **Vide — jamais visité** | Première ouverture de cet écran pour ce devis | `FeuilleSignature` à l'état `vide` : le document **en entier**, en haut, sur `--color-surface` `#F6F2E9` ; la piste en bas, 220px, avec le texte centré `Le client signe ici, du doigt.` **Aucun bouton `Effacer`, aucun bouton `Valider`.** La barre d'action ne contient qu'un `Bouton` `discret` : `Annuler`. | rien — l'écran attend un doigt, et il le dit par écrit |
| **Vide — aucune donnée** | — | **N'existe pas, et c'est un choix :** la seule chose qui rendrait cet écran vide est l'absence de devis, or on n'ouvre pas un écran de signature sans devis. Le moteur de rendu ne définit pas cet état ici, et cette absence est écrite pour qu'on ne l'implémente pas. Un écran de signature vide afficherait un montant à zéro et une piste pour signer un devis qui n'existe pas. | — |
| **Erreur de chargement** | Le devis à signer n'est pas lisible sur l'appareil | **Cet écran n'a pas d'état d'erreur de chargement.** Le devis a été lu pour ouvrir cet écran ; s'il ne l'a pas été, `devis-detail` l'a déjà dit, et l'écran de signature ne s'ouvre pas du tout. Ouvrir un écran de signature sur un devis illisible proposerait de signer quelque chose qui n'est pas affiché. | — |
| **Erreur de soumission** | L'écriture de la signature dans le magasin local échoue | `BandeauMessage` en état `echec`, au-dessus de la piste : `La signature n'a pas pu être gardée. Le devis n'est pas signé.` et `Réessayer`. **Le tracé reste affiché** pour que Jean-Luc n'ait pas à le refaire, et `Valider la signature` reste disponible. Aucun état `presque signé` : ce n'est pas un état, c'est une absence de règle. | bandeau `--color-expire-fond` `#F4DED8`, il ne s'efface pas |
| **Succès** | La signature est validée et écrite | L'empreinte s'inscrit sous la piste, la `PastilleEtat` disparaît, et un `BandeauMessage` en état `succes` écrit : `Devis D-2026-016 signé. Il peut maintenant sortir.` — **sans point d'exclamation**, parce qu'un fait grave ne s'annonce pas avec un point d'exclamation. Puis le bouton `Valider la signature` devient `Signer le devis sur l'appareil`… il **disparaît**, remplacé par un `Bouton` `discret` `Comment il sort`. | bandeau `--color-confirme-fond` `#DEEAE1`, 6 s |
| **Hors-ligne / permissions** | Mode avion, ou l'appareil en veille | **Aucun message, aucune icône, aucune invite à se connecter.** Signer ne demande aucun réseau (C1), donc cet écran n'a pas d'état réseau. Si l'appel entrant interrompt le tracé, l'état est `interrompue` : **rien n'est enregistré**, et à la réouverture l'écran est à `vide` avec le devis non signé (E17). | rien |
| **Lecture seule** | La signature a été annulée par une modification (B11, E6) | `FeuilleSignature` à l'état `annulee` : le tracé **reste visible, barré** d'un filet `--color-bordure-expire` `#B45A48`, et la mention `À resigner` s'affiche dans l'en-tête du document, avec un `BandeauMessage` `avertissement` : `Ce devis a été modifié depuis la signature. Il faut le faire signer de nouveau.` **Le devis ne peut pas ressortir avant une nouvelle signature**, et la barre d'action ne propose que `Signer de nouveau` — pas `Envoyer`. | bandeau `--color-echeance-fond` `#F4E9CB`, il ne s'efface pas |

> Un état non décrit est un état non implémenté.

---

## 5. Interactions

| Élément | Événement | Comportement | Feedback visuel | État résultant | ID |
|---|---|---|---|---|---|
| Doigt sur la piste | touchmove | Trace en temps réel, largeur de trait `3px`, arrondi, en `--color-texte-encre-signature` `#1F4C6B`. **Aucun bouton n'apparaît sous le doigt** : un contrôle qui naît sous un doigt se presse sans qu'on l'ait vu. | le tracé se dessine | `en-cours` | B10 |
| Doigt levé | touchend | Le tracé **reste affiché**. Le bloc d'empreinte apparaît **sous** la piste, jamais à sa place. Le bouton `Valider la signature` devient disponible. | — | `tracee` | B10 |
| Bouton `Valider la signature` | tap | Écrit la signature, l'horodatage et l'empreinte du texte exact dans le magasin local. Le bouton passe en état `chargement` avec le libellé changé en `Signature en cours…` ; un second appui ne fait rien de plus. | libellé changé, variante `plein` conservée | `tracee` → retour `devis-detail` | B10 |
| Bouton `Effacer` | tap | Efface le tracé, **et rien d'autre** : pas d'empreinte, pas d'horodatage, pas d'état. La piste redevient comme à l'ouverture. | la piste se vide instantanément | `vide` | — |
| Bouton `Annuler` | tap | **La seule sortie de cet écran.** Elle **efface la signature commencée** et écrit : `La signature n'a pas été gardée. Le devis n'est pas signé.` Puis retour à `devis-detail`. Rien n'est perdu silencieusement : E17 veut que rien ne soit enregistré comme signé, et `Annuler` dit exactement ce qui vient de se passer. | — | `devis-detail` | E17 |
| Tentative de sortir par le geste du système | geste | Le retour arrière du système est **intercepté** sur cet écran et traité comme `Annuler`. Un seul comportement : l'écran ne se ferme pas « comme ça » en laissant un tracé à moitié fait. | — | `vide` | E17, E5 |
| Champ `signature` du journal d'audit | — | **Aucun journal d'audit n'enregistre le tracé, ni une image, ni une description de sa forme.** Le journal enregistre l'empreinte `4f2a…9c1d`, l'horodatage et le numéro du devis — donc la signature reste rattachée à son texte, et non à une image détachée (PRD § 7.2). | — | — | B10, C11 |
| Le client regarde l'écran pendant qu'il signe | — | Il ne voit que le devis à signer : ni la liste des devis, ni le dossier d'un autre client, ni aucun autre document, ni aucun élément de navigation. L'exigence est tenue par l'absence de ces éléments. | — | — | E5 |
| Le client refuse de signer | — | `Annuler`. Le devis reste à la fois `écrit ici, pas encore envoyé` et non signé. **Aucun écran d'erreur, aucune relance**, aucune phrase qui suggère de réessayer : rien n'a échoué. | — | `devis-detail` | E7 |

- **Focus / clavier** : la signature est un tracé de doigt et **n'a pas d'équivalent clavier** — c'est assumé, et c'est écrit : la PRD § 7.3 demande un tracé au doigt, sans curseur de précision à viser, donc aucune alternative clavier n'est proposée et aucune n'est annoncée. Ce qui reste atteignable au clavier, c'est `Annuler` et `Valider la signature`, dans cet ordre. Anneau `--color-bordure-focus` `#8A4A0E`, `--stroke-focus` `3px`.
- **Gestes** : le tracé, et rien d'autre. **Pas de geste pour valider** — pas de double-tap, pas de balayage, pas de relâchement prolongé qui valide tout seul : une signature qui se déclenche par un geste est une signature que le client produit sans le vouloir. **Pas de zoom, pas de défilement horizontal** : la PRD § 7.1 l'interdit, et sur cet écran il n'y a rien à défiler que le document, qui se relit en déroulant.
- **Animations** : l'apparition du bloc d'empreinte, `--duration-normal` `220ms` `--ease-default` `cubic-bezier(0.2, 0, 0, 1)`, et **rien d'autre**. Le tracé ne s'anime pas pendant qu'il se dessine : un tracé qui se lisse en retard sur le doigt donne l'impression que l'appareil ne suit pas. **Le changement de `PastilleEtat` dure zéro milliseconde.** L'ouverture de l'écran, `--duration-slow` `320ms`.
- **Retour arrière** : **il n'y a pas de bouton de retour** — c'est `E5`, et c'est une absence, pas une désactivation. Le retour arrière du système est intercepté et traité comme `Annuler`, qui **efface la signature commencée** et écrit ce qui vient de se passer. Il n'y a ni `Plus tard`, ni `Passer sans`, ni fermeture par une croix : sur cet écran, il n'y a pas d'élément de navigation du tout.

---

## 6. Responsive

| Breakpoint | Comportement | Ce qui se replie / disparaît |
|---|---|---|
| **Mobile** `--bp-telephone` 0 — 479px | Plein écran. Le document occupe le haut, la piste **220px** occupe le bas, la barre d'action `--hauteur-action-primaire` `60px` est en dessous. **Aucun élément de navigation n'apparaît, à aucun moment** : c'est la différence entre cet écran et tous les autres. | rien, et c'est le principe |
| **Tablet** `--bp-tablette` 480 — 1023px | Le document passe en variante `etendue` des lignes : désignation pleine largeur, puis trois colonnes alignées. La piste fait 280px de haut et passe à `--hauteur-cible` `56px` d'épaisseur de trait — **la tablette est l'appareil que Jean-Luc tend**, donc la piste y est plus généreuse, pas plus petite. | rien |
| **Desktop** `--bp-poste` 1024 — 1439px | **Cet écran n'a pas de version « deux colonnes ».** Le document est centré horizontalement dans une largeur de `--space-3xl` `48px` de marge, la piste reste pleine largeur en bas. Un devis signé sur un écran emprunté chez un client doit avoir l'air du même devis que sur le téléphone. | rien |
| **Large** `--bp-large` 1440px et plus | Identique à `--bp-poste`, avec le contenu plafonné à `--space-3xl` `48px` de chaque côté. | rien |

- **Cible tactile** : la piste fait **220px de haut** sur téléphone : on signe avec un doigt, pas avec un curseur de précision. Les deux boutons de la barre d'action font `--hauteur-action-primaire` `60px`, et `Annuler` occupe une zone de `--hauteur-cible` `56px` de haut sur toute sa largeur. Le trait lui-même fait `3px` : plus fin, il disparaîtrait en plein soleil et dans une cave ; plus épais, une signature deviendrait un dessin.
- **Débordement** : **aucun défilement horizontal, sur aucun breakpoint** (PRD § 7.1). Le document défile **verticalement** si le devis est long, et la piste reste épinglée en bas : elle ne défile jamais avec lui, parce que Jean-Luc ne doit pas faire défiler pour trouver l'endroit où signer. **Aucun montant n'est tronqué**, jamais réduit : `--text-montant` `32px` passe sur deux lignes s'il le faut.

---

## 7. Accessibilité

- [ ] **Contraste du texte courant** : mesuré par `node "$FORGE/scripts/design-check.js" contrast <anchor>`. **Aucun ratio n'est écrit ici** (design-system § 0.0).
- [ ] **Contraste des grands textes** : mesuré par le même contrôle, sur `--text-montant` `32px` et `--text-h2` `23px`.
- [ ] **Navigation clavier** : **`Valider la signature` et `Annuler` seulement.** Le tracé n'a pas d'équivalent clavier et **aucune promesse d'en avoir une** n'est affichée à l'écran : annoncer une voie d'accès qui n'existe pas est pire que ne rien annoncer. Sur `--bp-poste` et `--bp-large`, la navigation clavier est complète pour ces deux éléments.
- [ ] **Focus visible** : anneau `--color-bordure-focus` `#8A4A0E`, `--stroke-focus` `3px`, jamais supprimé. Sur le fond `--color-encre-signature-fond` `#DEE6EF`, c'est la seule couleur d'anneau employée : `--color-bordure-focus-inverse` `#F5D9A8` n'est mesuré que sur `--color-encre-foncee` `#26211A` et n'est donc pas cité sur cette piste.
- [ ] **ARIA** : la piste est `role="application"` étiquetée `Signature au doigt`, parce qu'un tracé libre n'a pas d'équivalent en arbre d'accessibilité et que l'annoncer évite qu'un lecteur d'écran la saute sans prévenir. Le bouton `Valider la signature` porte `aria-disabled="true"` tant que la piste est vide — **il reste dans l'arbre**, pour que le client sache qu'il y a quelque chose à faire après avoir tracé. Le bloc d'empreinte est `role="status"` `aria-live="polite"` : il s'inscrit après le tracé et Jean-Luc le lit à voix haute au client.
- [ ] **Texte alternatif** : **aucune image à légender sur cet écran**, et c'est un choix : le document est du texte rendu en texte, donc sélectionnable et lisible par un lecteur d'écran, et le tracé est décrit par son horodatage et son empreinte. Une image du devis serait moins accessible que le devis lui-même.
- [ ] **Langue et direction de lecture** : `lang="fr"`, `dir="ltr"`. Le montant est en chiffres tabulaires avec la devise écrite en toutes lettres ; les dates en toutes lettres : `12 avril 2026 à 10 h 07`, jamais `12/04 10:07`.

---

## 8. Données

| Champ | Type | Origine | Requis | Erreur possible |
|---|---|---|---|---|
| `devis.texte-signé` | texte intégral | magasin local | oui | **jamais reconstruit** : l'empreinte porte sur le texte exact, donc le texte est figé au moment de la signature |
| `signature.tracé` | tracé vectoriel | doigt | oui | jamais persisté si l'écriture échoue — rien n'est enregistré comme signé (E17) |
| `signature.horodatage` | date et heure | horloge simulée | oui | jamais à la main : une heure saisie serait une heure invérifiable |
| `signature.empreinte` | texte `4f2a…9c1d` | calculée sur `devis.texte-signé` | oui | absente tant que le devis n'est pas signé, et son absence est affichée |
| `signature.signataire` | texte | `Jean-Luc` — un seul signataire, par convention du contrat § 5 | oui | jamais un nom de tiers : le client signe **sur l'appareil de Jean-Luc**, et l'application ne tient aucun compte tiers (C2) |
| `devis.etat-signature` | énumération `non-signe` \| `signe` \| `a-resigner` | magasin local | oui | `signe` avec une empreinte recalculée est **rejeté** : la signature ne vaut que liée à son texte |

- **Chargement** : **aucun.** Cet écran n'affiche rien qui ne soit déjà en mémoire. Le devis a été lu par `devis-detail` avant l'ouverture, et le magasin local est sur l'appareil.
- **Cache / hors-ligne** : l'écran est **entièrement hors-ligne, sans exception ni dégradation** (C1, E17). Il n'a pas d'état réseau, donc il n'a pas de bandeau de file, pas de `Réessayer`, pas de message de coupure. La seule chose qui peut interrompre le tracé est physique — un appel entrant, une batterie vide, la fermeture de l'application — et dans les trois cas **rien n'est enregistré**.
- **Données sensibles** : le tracé de signature est **la donnée la plus sensible du produit**, et elle ne sort ni du journal, ni d'une vue de débogage, ni d'une vue d'ensemble. Le journal d'audit enregistre l'empreinte, l'horodatage et le numéro du devis ; il n'enregistre **ni le tracé, ni une image du tracé, ni une description de sa forme**. Aucune donnée de Jean-Luc ni de son client ne part chez un tiers (C11) : la signature est locale, et la seule sortie possible du document signé est le courriel ou le PDF, choisis explicitement à l'étape suivante.

---

## 9. Traçabilité

| ID | Origine | Manifestation sur cet écran |
|---|---|---|
| B9 | PRD | Cet écran **existe** parce que B9 rend la sortie impossible sans signature. Il est donc le préalable obligatoire, et il n'est atteignable que depuis un devis signé en amont de toute sortie. |
| B10 | PRD | Tracé au doigt, largeur `3px`, en `--color-texte-encre-signature` `#1F4C6B`, enregistré avec la date, l'heure et l'empreinte du texte exact : `Signé le 12 avril 2026 à 10 h 07 — empreinte 4f2a…9c1d.` Coût 0 €. |
| B11 | PRD | L'état `annulee` : le tracé **reste visible et barré**, la mention `À resigner` est dans l'en-tête, et le devis ne peut pas ressortir avant une nouvelle signature. |
| E5 | PRD | **Aucun élément de navigation n'existe** sur cet écran : pas de barre basse, pas de bouton de retour, pas de lien vers un dossier, pas de document précédent. L'exigence est tenue par cette absence, pas par une désactivation. |
| E7 | PRD | Le client refuse de signer : `Annuler` et une phrase qui dit ce qui est arrivé. Aucune relance, aucun `Réessayer`, aucun état d'erreur — rien n'a échoué. |
| E17 | PRD | Appel entrant, batterie vide, application fermée : **rien n'est enregistré comme signé.** L'écran rouvre à `vide`, le devis est non signé, et il n'existe nulle part l'expression `signature en attente`. |
| US-14 | PRD | L'exigence est entièrement tenue par l'absence d'éléments de navigation. Le retour système est intercepté et traité comme `Annuler`, il ne ramène pas vers une liste. |
| C1 | PRD | Signer ne demande aucun réseau. L'écran n'a pas d'état réseau, donc pas de bandeau, pas d'alerte. |
| C2 | PRD | Un seul utilisateur, aucun compte à créer, aucun mot de passe, aucune question secrète, aucun rôle. Le client qui signe n'hérite d'aucun accès. |
| C3 | PRD | Signature tracée, gratuite. Aucune mention de signature qualifiée et aucun tarif de 1 à 3 € par devis : l'offre n'existe pas dans ce produit. |
| C7 | PRD | Aucun mot sur la comptabilité. |
| C8 | PRD | Aucune mention d'encaissement : ni carte, ni virement. Le prix du paiement par carte est écrit dans `reglages`, avec son montant en euros, et nulle part ailleurs. |

---

## 10. Checklist de gate

- [x] Les états sont décrits avec un rendu concret. Les deux états « n'existe pas » sont **écrits comme des états absents** plutôt que laissés vides : cet écran n'a pas d'état vide de données, et il n'a pas d'erreur de chargement, parce qu'un devis illisible n'ouvre pas cet écran.
- [x] Chaque élément interactif a un comportement et un feedback — et le tracé n'a **aucun** contrôle d'effacement avant d'avoir quelque chose à effacer.
- [x] Le responsive est défini à **chaque** breakpoint, y compris la décision explicite de ne **pas** faire de version « deux colonnes » sur cet écran.
- [x] La section Anti-générique est cochée et justifiée, une ligne par ligne, avec la valeur du token qui la rend vraie.
- [x] Aucune valeur de design n'est laissée à « à définir ».
- [x] Chaque ID B*/E*/C* de cet écran apparaît en section 9 : B9, B10, B11, E5, E7, E17, C1, C2, C3, C7, C8.
- [x] Aucun gabarit non résolu.
- [x] L'écran reste cohérent avec `.forge/design/design-system.md`.