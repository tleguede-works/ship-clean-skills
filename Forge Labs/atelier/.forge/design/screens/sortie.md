---
type: screen
slug: sortie
title: Comment le devis sort
module: Envoi
status: draft
generated_at: 2026-10-01
derived_from:
  - .forge/prd.md
  - .forge/design/design-system.md
  - .forge/roadmap.md
rule_ids: [B5, B6, B7, B9]
edge_case_ids: [E3, E4, E1]
flow: Boucle principale
---

# Écran — Comment le devis sort

> Ce document est la **source de vérité** pour qu'une IA génère l'interface de cet écran.
> Il est généré depuis le gabarit de `skills/forge/templates/screen.md.tmpl`, jamais recopié.

**Scénario** — `D-2026-016` vient d'être signé, empreinte `4f2a…9c1d`, 12 avril 2026 à 10 h 07.
Jean-Luc est toujours dans la pièce du client. Le devis porte toujours `Écrit ici, pas encore envoyé`.
Il est 10 h 09.

---

## 1. Rôle de l'écran

| | |
|---|---|
| **Archétype d'app** | `mobile_field_ops` |
| **Module** | feuille depuis `devis-detail` — aucune entrée de navigation |
| **Route** | `/devis/:numero/sortie` |
| **Type** | sheet — feuille modale basse, hauteur 60 %, rayon `--radius-lg` `16px` |
| **Utilisateurs** | Jean-Luc seul, debout, un client dans la pièce |
| **User stories servies** | US-3 (envoyer et savoir si c'est vraiment parti) |
| **Règles métier** | B5, B6, B7, B9 |
| **Edge cases** | E1, E3, E4 |

**Une phrase** : cet écran permet à Jean-Luc de **choisir comment le devis sort et de savoir honnêtement où en est cet envoi**, afin de **poder répondre « il est parti » ou « il n'est pas encore parti » sans rien supposer**.

**Pourquoi il est une feuille et non une page** : c'est une **décision**, pas un parcours. Jean-Luc est en train de choisir entre deux sorties, et une page entière pour ce choix afficherait un document déjà connu et une barre d'action déjà connue, donc deux éléments qui n'aident pas. La feuille laisse le devis signé **visible et lisible en dessous**, et c'est utile : Jean-Luc montre le document pendant qu'il choisit, et le client reste devant lui. La feuille occupe 60 % de l'écran, monte du bas, et porte `--shadow-lg` `0 -4px 24px rgba(31,27,21,0.18)` — l'ombre va vers le haut parce qu'elle vient du bas.

### 1.1 Ce que cet écran essaie d'éviter

Cet écran essaie d'éviter **que Jean-Luc croie que l'envoi a marché**. C'est la différence centrale du produit, et elle tient sur cet écran : le PRD § 1.4 dit qu'aucun autre outil ne distingue « enregistré » de « parti » parce que pour lui la distinction n'existe pas. Ici elle existe, et elle se paie par un prix : **l'écran ne dit jamais `Envoyé` avant que le service de courriel n'ait confirmé**, et il ne le fait pas non plus quand l'envoi semble être parti. La première tentation à refuser est donc le **bouton qui devient un succès optimiste** — `Envoyer` pressé, crayon animé, et un « C'est envoyé ! » au bout de 300 ms parce que le réseau a répondu. Ce serait un mensonge : une réponse HTTP d'acceptation n'est pas la preuve que le courriel est parti, et c'est précisément ce que B6 interdit. Ce que l'écran écrit à la place, c'est `Envoi tenté le 12 avril à 10 h 12.` puis `Le service de courriel n'a pas encore confirmé. Personne ne peut dire si ce devis est parti.` — ce qui est moins satisfaisant, et c'est vrai. La seconde tentation à refuser est **`Réessayer` à l'état d'attente**. Rien n'a échoué : l'envoi est parti, l'attente est la suite normale, et B7 interdit qu'un second essai envoie un second courriel au client. Un doublon chez un client se corrige mal. Il n'y a donc **qu'un seul bouton** à cet état, `Fermer`, et l'incertitude reste visible ailleurs : dans la ligne de preuve `1c` du devis, et dans le bandeau de file de tous les autres écrans. La troisième est **les deux sorties en `Bouton` `plein`**. Aucune des deux n'est `plein` : ce sont deux sorties, et Jean-Luc choisit — donc aucune des deux ne doit se ressembler à une action acquise. La quatrième est l'animation : cet écran à l'état d'attente **ne bouge pas, ne pulse pas, ne tourne pas, n'affiche aucune barre de progression**. Une animation invite à attendre là ; Jean-Luc a un client à servir.

### 1.2 Les trois mots, écrits dans l'écran

Les trois mentions apparaissent sur cet écran, à trois moments différents, et c'est la seule feuille du produit où elles se voient successivement :

| Moment | Mention écrite | Preuve écrite |
|---|---|---|
| Ouverture | `Écrit ici, pas encore envoyé` | `Sur ce téléphone. Personne ne l'a reçu.` |
| Après `Envoyer par courriel` pressé | `Écrit ici, pas encore envoyé` — **inchangée** | `Envoi tenté le 12 avril à 10 h 12, sans réponse du service. Personne ne peut dire s'il est parti.` |
| Confirmation reçue du service | `Envoyé par courriel` | `Confirmé par le service de courriel le 12 avril à 10 h 12.` |

Et pour la sortie PDF, ouverte depuis cette feuille : `Parti en PDF partagé` · `Le 12 avril, date déclarée par vous. Rien ne l'a confirmée.`

Le mot `confirmé` n'apparaît que dans la ligne de preuve. L'état d'attente ne dit jamais `en cours d'envoi` : il dit ce qui est en train de se passer, `Envoi tenté`, et ce que personne ne sait encore.

---

## 2. Direction visuelle de cet écran

Repris du design system — **valeurs concrètes, jamais « à définir »**.

| | |
|---|---|
| **Mood** | dense, mate, sans emphase |
| **Densité** | **normale.** Une feuille de décision n'a pas besoin d'être dense : elle a deux blocs de 72px et trois lignes de texte, et il faut la charger. Elle est plus aérée que le reste du produit parce que c'est le seul moment où Jean-Luc a le temps de lire, et que la feuille n'est pas une liste. |
| **Niveau de contraste** | **fort** — la mention d'état en grand, dans sa famille de couleur, sur son fond de famille. `--color-attente-fond` `#F7E5D3` avec `--color-texte-attente` `#8A3D0C` à l'état d'attente, `--color-confirme-fond` `#DEEAE1` avec `--color-texte-confirme` `#15583C` à l'état confirmé. |
| **Surface** | `--color-surface-raised` `#FBF9F4` pour la feuille, sur le devis signé en `--color-surface` `#F6F2E9` qui reste visible en dessous |
| **Accent utilisé** | `--color-bordure-attente` `#A05E27` pour `Envoyer par courriel` et `--color-bordure-confirme` `#3C7A59` pour `Envoyer à nouveau`. **Aucun des deux n'est `plein`**, et aucun n'est bleu (design-system § 0.4). |
| **Traitement photographique** | AUCUN |
| **Référence** | Too Good To Go pour le choix unique et l'action au pouce ; ici l'écran est une **feuille**, pas un écran — parce qu'un choix est temporaire et un document ne l'est pas. |

### 2.1 Anti-générique — obligatoire

Cet écran ne doit ressembler **à aucun** de ces défauts :

- [x] **Pas de fond blanc pur** `#FFFFFF` — la feuille est `--color-surface-raised` `#FBF9F4`, le devis en dessous `--color-surface` `#F6F2E9`.
- [x] **Pas de carte ombrée pour tout.** **Une seule ombre sur cet écran**, et elle est légitime : `--shadow-lg` `0 -4px 24px rgba(31,27,21,0.18)`, vers le haut, parce que la feuille **monte** et qu'elle masque le devis. Les deux blocs de sortie sont des blocs de 72px séparés par `--space-lg` `16px`, pas deux cartes.
- [x] **Pas d'uniformité** : quatre niveaux — `--text-montant` `32px` pour le numéro du devis, `--text-h2` `23px` pour la mention d'état, `--text-mention` `16px` pour la ligne de preuve, `--text-corps-fort` `17px` pour les libellés des deux sorties. Et l'échelle n'est pas la même selon l'état : à l'état `attente` la mention est en `23px`, à l'état `confirme` elle passe en `--text-montant` `32px`, parce que la confirmation est un fait plus gros que l'attente.
- [x] **Pas de gris neutre générique** `#6B7280` — la preuve est dans la même famille que la mention, jamais dans un gris de secrétariat.
- [x] **Pas de mise en page centrée symétrique** — tout est aligné à gauche, y compris la mention. Le seul bloc centré du produit est le `GroupeBoutons` en variante `deux`, qui n'est pas sur cet écran.
- [x] **Pas d'illustration d'appoint** — pas d'enveloppe dessinée, pas de tuile avec un icône de courriel dans un cercle. L'état d'attente est une phrase : `Le service de courriel n'a pas encore confirmé. Personne ne peut dire si ce devis est parti.`
- [x] **Pas d'une seule famille de police** — `--font-texte` `Archivo` pour les libellés, `--font-identifiant` `IBM Plex Mono` `15px` pour `D-2026-016` et pour les horodatages des preuves, qui sont des données, pas de la prose.

**Choix assumé et non neutre** : **aucune barre de progression, aucun spinner, aucun pourcentage, aucun point animé, sur aucun état de cet écran.** L'application ne sait pas combien de temps il lui reste, donc afficher `67 %` serait exactement le mensonge que ce produit a été conçu pour ne pas produire — présenté dans une autre couleur. Ce que la feuille contient, c'est un **fait** et une **promesse** : `Envoi tenté le 12 avril à 10 h 12.` et `personne ne peut dire si ce devis est parti`. Les deux sont vérifiables par Jean-Luc sans l'application, et ce sont les deux seules choses qu'il puisse dire au téléphone.

---

## 3. Anatomie

```
┌─────────────────────────────────────────┐
│ ▓▓▓ le devis signé reste visible ▓▓▓▓  │  ← --color-surface, lisible
├─────────────────────────────────────────┤
│ FEUILLE SORTIE — 60 % de l'écran        │  ← --shadow-lg vers le haut
│  D-2026-016                    (15px)  │
│                                         │
│  ── ÉTAT `choix` ───────────────────    │
│  Sortie du devis                        │
│  ┌────────────────────────────────────┐  │
│  │ Envoyer par courriel           72px│  │
│  │ lefevre@example.net — dossier     │  │
│  ├────────────────────────────────────┤  │
│  │ Partager en PDF               72px │  │
│  │ La date sera celle que vous       │  │
│  │ déclarez.                          │  │
│  └────────────────────────────────────┘  │
│  [ Annuler ]                            │
│                                         │
│  ── ÉTAT `attente` ─────────────────    │
│  Écrit ici, pas encore envoyé  (23px)  │
│  Envoi tenté le 12 avril à 10 h 12.    │
│  Le service de courriel n'a pas encore  │
│  confirmé. Personne ne peut dire si ce  │
│  devis est parti.                       │
│  [ Fermer ]              ← UN SEUL     │
│                                         │
│  ── ÉTAT `confirme` ─────────────────   │
│  Envoyé par courriel          (32px)    │
│  Confirmé par le service de courriel    │
│  le 12 avril à 10 h 12.                 │
│  [ Fermer ]                             │
│                                         │
│  ── ÉTAT `echoue` ───────────────────   │
│  Le service de courriel a refusé cet    │
│  envoi. Le devis n'est pas parti.       │
│  [ Réessayer ] [ Fermer ]               │
└─────────────────────────────────────────┘
```

| # | Composant | Rôle | Source |
|---|---|---|---|
| 1 | `FeuilleSortie` variante `choix` | les deux sorties possibles, avec la consequence de chacune écrite | design-system § 2 |
| 2 | `FeuilleSortie` variante `attente` | l'envoi est parti, le service n'a pas répondu — **sans animation, sans `Réessayer`** | design-system § 2 |
| 3 | `FeuilleSortie` variante `confirme` | le service a répondu, la mention change, la feuille **ne se ferme pas toute seule** | design-system § 2 |
| 4 | `FeuilleSortie` variante `echoue` | le service a renvoyé une erreur : `Réessayer` et `Fermer` | design-system § 2 |
| 5 | `EtatSortie` variante `bloc` | la mention et sa preuve, dans cet ordre | design-system § 2 |
| 6 | `Bouton` variante `contour` | les deux sorties — **aucune des deux n'est `plein`** | design-system § 2 |
| 7 | `Bouton` variante `discret` | `Annuler`, `Fermer` | design-system § 2 |
| 8 | `Bouton` variante `famille-confirme` | `Réessayer` sur un envoi que le service a refusé | design-system § 2 |
| 9 | `FeuillePartage` | ouverte par `Partager en PDF`, feuille empilée au-dessus | design-system § 2 |
| 10 | `BandeauMessage` | l'échec, écrit une fois, persistant | design-system § 2 |

---

## 4. États — tous, sans exception

| État | Déclencheur | Rendu | Feedback utilisateur |
|---|---|---|---|
| **Chargement** | Ouverture de la feuille | **Aucun squelette, aucun spinner.** Les deux blocs de sortie s'affichent immédiatement : tout vient du magasin local, et l'adresse du client vient du dossier (E12). | rien |
| **Rempli** | Ouverture après une signature valide | État `choix` : deux blocs de 72px. `Envoyer par courriel` avec l'adresse du dossier en dessous — `lefevre@example.net` — et `Partager en PDF` avec la phrase `La date sera celle que vous déclarez.` Puis `Annuler`. **Aucun des deux n'est `plein`.** | — |
| **Vide — jamais visité** | — | **N'existe pas, et c'est un choix :** cette feuille ne s'ouvre que depuis un devis signé, donc elle n'a jamais été « vide ». Le moteur de rendu ne définit pas cet état ici, et cette absence est écrite pour qu'on ne l'implémente pas. | — |
| **Vide — aucune donnée** | Le dossier du client n'a pas d'adresse de courriel | **Il n'y a pas de bloc vide : l'action est absente et la raison est écrite.** Le bloc `Envoyer par courriel` est retiré, et à sa place, en `--text-mention` `16px` : `Ce client n'a pas d'adresse de courriel dans son dossier.` puis `Partager en PDF`, qui n'a besoin d'aucune adresse. **Un bouton `Envoyer par courriel` désactivé sans raison écrite serait un bouton qui demande pourquoi** ; ici la raison est en clair et l'autre sortie reste disponible. | — |
| **Erreur de chargement** | Le magasin local ne répond pas | La feuille **ne s'ouvre pas**. L'écran d'où l'on vient affiche `BandeauMessage` en état `echec` : `Les devis écrits sur ce téléphone ne sont pas lisibles.` et `Réessayer la lecture`. Une feuille de sortie ouverte sans document à envoyer proposerait d'envoyer un devis qu'on ne voit pas. | bandeau `--color-expire-fond` `#F4DED8`, il ne s'efface pas |
| **Erreur de soumission** | Le service de courriel renvoie une erreur | État `echoue` : `Le service de courriel a refusé cet envoi. Le devis n'est pas parti.` puis **deux** boutons : `Réessayer` et `Fermer`. Le devis reste à `Écrit ici, pas encore envoyé` (B6), et la reprise est possible **sans ressaisie** (PRD § 7.5). Un `BandeauMessage` `echec` accompagne le retour vers `devis-detail` : `Le devis n'est pas parti. Vous pouvez réessayer.` | bandeau `echec`, il ne s'efface pas — un échec n'a laissé de trace nulle part ailleurs |
| **Succès** | Le service de courriel confirme l'envoi | État `confirme` : la mention passe à `Envoyé par courriel` en `--text-montant` `32px`, sa preuve devient `Confirmé par le service de courriel le 12 avril à 10 h 12.` Un seul bouton : `Fermer`. **Cette feuille ne se ferme pas toute seule** : elle attend qu'on la lise, parce que c'est le seul moment où Jean-Luc peut encore rater la confirmation. **Aucun `Envoyé !` avec un point d'exclamation** n'est écrit nulle part. | la mention change instantanément, sans fondu |
| **Hors-ligne / permissions** | Mode avion | **Les deux sorties restent proposées.** L'envoi par courriel est `desactive` — opacité 45 %, libellé `--color-texte-desactive` `#8B8272`, `aria-disabled` — **et il ne disparaît pas** : il disparaîtrait chaque fois que Jean-Luc ouvre un devis en cave, et il reviendrait ensuite, et Jean-Luc apprendrait à l'ignorer. La raison est écrite sous les deux blocs : `Pas de réseau ici : l'envoi par courriel attendra. Le PDF, non.` `Partager en PDF` reste actif, parce qu'un partage n'a besoin d'aucun réseau (C1, US-4). | aucun message d'erreur réseau sur les blocs eux-mêmes |
| **Lecture seule** | Le devis n'est pas signé | **La feuille ne s'ouvre pas** et l'écran d'où l'on vient l'explique avant : `Signer d'abord : un devis sans signature ne part pas.` (B9). Il n'y a donc pas de feuille présentée en lecture seule : ce serait proposer un choix sur un document qui ne peut pas sortir. | — |

> Un état non décrit est un état non implémenté.

---

## 5. Interactions

| Élément | Événement | Comportement | Feedback visuel | État résultant | ID |
|---|---|---|---|---|---|
| Bloc `Envoyer par courriel` | tap | L'envoi part vers le service, **une seule fois**. Le bloc passe en `Bouton` état `chargement` avec le libellé changé en `Envoi tenté…` ; il ne rétrécit pas et ne se grise pas, il reste appuyable, et **un second appui ne fait rien de plus** et ne produit pas un second courriel (B7). | libellé changé, variante conservée | `attente` | B6, B7, E4 |
| Bloc `Partager en PDF` | tap | Ouvre la feuille `partage-pdf` **au-dessus** de celle-ci, qui reste monté dessous. Aucun réseau n'est requis. | glissement vers le haut `320ms` `--ease-entree` | `partage-pdf` | B8, US-4 |
| `Annuler`, état `choix` | tap | Ferme la feuille sans rien envoyer. **Aucun message de confirmation** : rien n'a été fait, et demander « vraiment annuler ? » pour une action qui n'a rien fait est une question qui coûte du temps à un homme qui a un client devant lui. | glissement vers le bas `320ms` `--ease-sortie` | `devis-detail` | — |
| `Fermer`, état `attente` | tap | Ferme la feuille. **L'incertitude reste visible ailleurs** : la preuve `1c` reste dans le devis, et le `FileAttente` la reprend en bandeau sur tous les écrans. Fermer ne fait pas disparaître le fait. | — | `devis-detail` | E3 |
| `Réessayer`, état `echoue` | tap | Reprend l'envoi **sans ressaisie** et sans changement d'adresse. Un second appui ne fait rien de plus. | libellé `Envoi tenté…` | `attente` | B7, PRD § 7.5 |
| `Fermer`, état `confirme` | tap | Ferme la feuille vers `devis-detail`, où la mention est désormais `Envoyé par courriel` avec sa preuve. Le compteur de l'écran d'accueil a déjà baissé (B23). | — | `devis-detail` | B6 |
| `Relancer` depuis le bandeau de file, ici | tap | **Ce bandeau n'est pas sur cet écran.** La feuille est modale et le bandeau de file est couvert — sauf à l'état `attente`, où la feuille écrit elle-même l'essentiel : `Personne ne peut dire si ce devis est parti.` | — | — | B6 |
| Feuille, geste vers le bas | geste | Ferme la feuille à l'état `choix` et à l'état `confirme`. **À l'état `attente`, le geste vers le bas est inerte** : la seule sortie est `Fermer`, parce que l'incertitude est le contenu de cet état et qu'un geste accidenté qui la fait disparaître sans que Jean-Luc l'ait lue est exactement le défaut qu'on cherche à éviter. | — | — | E3 |

- **Focus / clavier** : ordre — `Envoyer par courriel`, `Partager en PDF`, puis l'action de l'état. Sur `--bp-poste` et `--bp-large`, la navigation clavier est complète et la feuille est un `role="dialog"` `aria-modal="true"` avec le focus piégé à l'intérieur — c'est le seul `role="dialog"` du produit.
- **Gestes** : le geste vers le bas ferme la feuille, sauf à l'état `attente`. **Aucun geste ne déclenche un envoi** : ni double-tap sur le bloc, ni balayage, ni appui long. Un envoi est irréversible dans son effet — le client reçoit un courriel — donc il ne peut pas être produit par un geste qu'on ne voit pas. La PRD § 7.3 interdit qu'une action soit accessible sans bouton visible ; ici le bouton est un bloc de 72px, visible et étiqueté.
- **Animations** : ouverture et fermeture de la feuille, `320ms`, `--ease-entree` `cubic-bezier(0, 0, 0, 1)` et `--ease-sortie` `cubic-bezier(0.3, 0, 1, 1)`. Le changement de mention d'état — de `Écrit ici, pas encore envoyé` à `Envoyé par courriel` — dure **zéro milliseconde**. **L'état `attente` ne s'anime pas du tout** : pas de rotation, pas de pulsation, pas de barre de progression. Une animation invite à attendre là ; Jean-Luc a un client à servir.
- **Retour arrière** : intercepté, traité comme le geste vers le bas, donc comme `Annuler` à l'état `choix` et comme `Fermer` aux états `confirme` et `echoue`. **À l'état `attente`, le retour arrière ne fait rien** : l'écran ne se ferme pas sur un état d'incertitude qu'il faut lire. Le devis reste inchangé dans tous les cas.

---

## 6. Responsive

| Breakpoint | Comportement | Ce qui se replie / disparaît |
|---|---|---|
| **Mobile** `--bp-telephone` 0 — 479px | Feuille de 60 % de la hauteur, rayon `--radius-lg` `16px`, pleine largeur. Les deux blocs de sortie font `--hauteur-cible` `56px` de haut, avec leur conséquence en dessous — donc environ 72px chacun. Les actions sont en bas, dans `--zone-pouce` `96px`. Le devis signé reste lisible dans les 40 % supérieurs. | rien |
| **Tablet** `--bp-tablette` 480 — 1023px | La feuille occupe 50 % de la hauteur, et les deux blocs de sortie passent **côte à côte** en deux colonnes au lieu d'être empilés : 480px suffisent pour deux blocs de 72px, et Jean-Luc voit les deux options d'un coup d'œil au lieu de faire défiler. | rien |
| **Desktop** `--bp-poste` 1024 — 1439px | La feuille est **centrée**, largeur limitée à `--space-3xl` `48px` de marge de chaque côté, hauteur 40 %. Le devis signé reste visible à gauche en entier. La feuille ne devient pas une boîte de dialogue centrée générique : elle garde son rayon `--radius-lg` et son ombre vers le haut, qui disent qu'elle vient du bas. | rien |
| **Large** `--bp-large` 1440px et plus | Identique à `--bp-poste`, contenu plafonné à `--space-3xl` `48px`. | rien |

- **Cible tactile** : `--hauteur-cible` `56px` minimum pour chaque bloc de sortie, et `--hauteur-action-primaire` `60px` pour l'action principale de l'état quand elle est unique. Les deux blocs sont posés à `--space-lg` `16px` l'un de l'autre, donc un glissement de pouce ne les confond pas.
- **Débordement** : **aucun défilement horizontal.** Garanti par construction : les blocs sont empilés, pas côte à côte sur téléphone, donc aucune largeur à partager. La preuve la plus longue — `Envoi tenté le 12 avril à 10 h 12, sans réponse du service. Personne ne peut dire s'il est parti.` — passe sur trois lignes à `--text-mention` `16px` **jamais réduite**. La date et l'heure sont insécables : `12 avril à 10 h 12` ne se coupe jamais entre la date et l'heure.

---

## 7. Accessibilité

- [ ] **Contraste du texte courant** : mesuré par `node "$FORGE/scripts/design-check.js" contrast <anchor>`. **Aucun ratio n'est écrit ici** (design-system § 0.0).
- [ ] **Contraste des grands textes** : mesuré par le même contrôle, sur `--text-montant` `32px` et `--text-h2` `23px`.
- [ ] **Navigation clavier complète** sur `--bp-poste` et `--bp-large`, avec le focus piégé dans la feuille tant qu'elle est ouverte.
- [ ] **Focus visible** : anneau `--color-bordure-focus` `#8A4A0E`, `--stroke-focus` `3px`, jamais supprimé. Sur la feuille en `--color-surface-raised` `#FBF9F4`, c'est le seul anneau employé.
- [ ] **ARIA** : la feuille est `role="dialog"` `aria-modal="true"`, étiquetée par la mention d'état — donc son nom **change avec elle** : `Envoyer le devis D-2026-016`. Le bloc `EtatSortie` est `role="status"` `aria-live="polite"` et son texte accessible est la mention **et** la preuve, jamais la mention seule : annoncer `Écrit ici, pas encore envoyé` sans sa preuve annoncerait un fait dont la source est inconnue. À l'état `attente`, un second `role="status"` annonce le passage à `attente` une seule fois, puis **plus rien** : l'état ne bouge pas et ne redonne pas son actualité. Les blocs de sortie sont des `role="button"` avec un `aria-label` complet : `Envoyer par courriel à lefevre@example.net, adresse du dossier client`.
- [ ] **Texte alternatif** : **aucune image sur cet écran.** Les deux sorties sont du texte et un filet de famille ; une icône d'enveloppe serait un pictogramme à deviner, et le design-system § 2 le refuse pour les boutons.
- [ ] **Langue et direction de lecture** : `lang="fr"`, `dir="ltr"`. Les horodatages sont en toutes lettres — `12 avril à 10 h 12` — et jamais `12/04 10:12`, parce que Jean-Luc lit cette ligne au téléphone.

---

## 8. Données

| Champ | Type | Origine | Requis | Erreur possible |
|---|---|---|---|---|
| `devis.numero` | texte `D-2026-016` | magasin local | oui | absent : la feuille ne s'ouvre pas |
| `devis.signature.empreinte` | texte | magasin local | oui | absente : la feuille ne s'ouvre pas, c'est B9 |
| `client.courriel` | texte | dossier client | **non** | absente : le bloc `Envoyer par courriel` est retiré et la raison est écrite ; `Partager en PDF` reste disponible |
| `envoi.etat` | énumération `choix` \| `attente` \| `confirme` \| `echoue` | machine d'envoi | oui | incohérence refusée : `confirme` sans horodatage de confirmation est rejeté et ramené à `attente` |
| `envoi.horodatage-tentative` | date et heure | horloge simulée | non | présente à `attente` et à `echoue`, absente à `choix` |
| `envoi.horodatage-confirmation` | date et heure | service de courriel | non | **absente tant que la confirmation n'est pas reçue** — c'est la seule preuve qui autorise la mention `Envoyé par courriel` (B6) |
| `envoi.identifiant-interne` | texte | machine d'envoi | oui | sert à la **déduplication** : deux appuis, un seul identifiant, donc un seul courriel (B7, E4) |

- **Chargement** : **aucun chargement réseau à l'ouverture.** La feuille lit le magasin local et le dossier client, tous deux sur l'appareil. Le réseau n'intervient qu'après `Envoyer par courriel` pressé, et **son absence ne bloque jamais l'affichage** : l'état `attente` s'affiche immédiatement.
- **Cache / hors-ligne** : **c'est le seul écran du produit où le réseau décide d'un état**, et c'est le seul acte qui en dépend (C1, PRD § 7.5). Hors-ligne, l'envoi part dans la file locale, l'état `attente` s'affiche avec la preuve `1b` côté devis, et la reprise se fait seule quand le réseau revient — sans ressaisie, sans nouvelle action de Jean-Luc. `Partager en PDF` fonctionne entièrement hors-ligne.
- **Données sensibles** : l'adresse de courriel du client est une donnée personnelle (C11). Elle apparaît ici parce que c'est le seul endroit où Jean-Luc peut vérifier **à qui** il envoie, avant d'envoyer — c'est une vérification, pas une exposition, et c'est pourquoi elle est là. Elle n'est jamais journalisée : le journal enregistre le numéro du devis, l'identifiant d'envoi interne et l'horodatage. Aucun contenu de devis ne part ailleurs qu'auprès du service de courriel, et rien ne part vers une régie publicitaire, une mesure d'audience ou un réseau social (C11).

---

## 9. Traçabilité

| ID | Origine | Manifestation sur cet écran |
|---|---|---|
| B5 | PRD | Les trois valeurs d'état sont **écrites dans la feuille**, avec leur preuve. L'état ne change que sur une action explicite de Jean-Luc : le temps qui passe ne change rien. |
| B6 | PRD | **La règle centrale du produit, visible ici.** `Envoyé par courriel` n'apparaît qu'après la confirmation du service, et la preuve la nomme. Tant qu'elle n'est pas là, la mention reste `Écrit ici, pas encore envoyé` et la preuve devient `1c`. Un envoi échoué laisse le devis dans le même état et propose `Réessayer`. |
| B7 | PRD | Le bloc pressé passe en `chargement` et un second appui ne produit pas de second courriel : l'identifiant interne d'envoi déduplique. C'est le seul mécanisme, et il est écrit ici. |
| B9 | PRD | La feuille **ne s'ouvre pas** sur un devis non signé, et `devis-detail` l'a dit avant : `Signer d'abord : un devis sans signature ne part pas.` |
| E1 | PRD | Hors-ligne, les deux sorties restent proposées, `Envoyer par courriel` en `desactive` avec la raison écrite : `Pas de réseau ici : l'envoi par courriel attendra. Le PDF, non.` |
| E3 | PRD | Réseau coupé après l'envoi, avant la confirmation : l'état `attente`, la mention inchangée, la preuve `1c`, **un seul bouton `Fermer`**, aucune animation. Un nouvel essai n'envoie pas de second courriel. |
| E4 | PRD | Deux appuis sur `Envoyer par courriel` : le second ne fait rien de plus, et l'écran ne montre ni erreur ni double animation. |
| C1 | PRD | L'envoi est le seul acte du produit qui dépend du réseau, et c'est le seul écran où cela se voit. |
| C11 | PRD | Aucune donnée ne part ailleurs qu'auprès du service de courriel. L'adresse affichée ici sert à vérifier le destinataire avant l'envoi. |
| C7 | PRD | Aucun mot sur la comptabilité. |
| C8 | PRD | **Aucune mention d'encaissement par carte, ni par virement.** Le prix du paiement par carte est écrit dans `reglages` avec son montant en euros ; il n'est pas ici, et il ne sera pas sur le PDF. |

---

## 10. Checklist de gate

- [x] Les états sont décrits avec un rendu concret. Les états « n'existe pas » sont **écrits comme absents** plutôt que laissés vides : cette feuille ne s'ouvre que sur un devis signé.
- [x] Chaque élément interactif a un comportement et un feedback — et le geste vers le bas a un comportement **différent selon l'état**, ce qui est écrit et justifié.
- [x] Le responsive est défini à **chaque** breakpoint, y compris le passage des deux sorties en deux colonnes à partir de 480px.
- [x] La section Anti-générique est cochée et justifiée. Le choix de n'afficher **aucune progression** est le choix contestable de cet écran, et il est justifié par écrit.
- [x] Aucune valeur de design n'est laissée à « à définir ».
- [x] Chaque ID B*/E*/C* de cet écran apparaît en section 9 : B5, B6, B7, B9, E1, E3, E4, C1, C7, C8, C11.
- [x] Aucun gabarit non résolu.
- [x] L'écran reste cohérent avec `.forge/design/design-system.md`.