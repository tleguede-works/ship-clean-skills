---
type: screen
slug: echeance
title: Devis expiré
module: Suivi
status: draft
generated_at: 2026-10-01
derived_from:
  - .forge/prd.md
  - .forge/design/design-system.md
  - .forge/roadmap.md
rule_ids: [B12, B13]
edge_case_ids: [E8, E15]
flow: Devis expiré retrouvé
---

# Écran — Devis expiré

> Ce document est la **source de vérité** pour qu'une IA génère l'interface de cet écran.
> Il est généré depuis le gabarit de `skills/forge/templates/screen.md.tmpl`, jamais recopié.

**Scénario** — `D-2026-008`, M. Da Silva, écrit le 14 mars 2026, date limite le 13 avril 2026,
`760 euros`, envoyé par courriel le 14 mars et signé, empreinte `4f2a…9c1d`. Nous sommes le
**11 avril 2026**. Jean-Luc ouvre l'application et retrouve ce devis dans le groupe
`Validité finie ou proche`. **La question lui est reposée à chaque ouverture.**

---

## 1. Rôle de l'écran

| | |
|---|---|
| **Archétype d'app** | `mobile_field_ops` |
| **Module** | feuille depuis `suivi` — aucune entrée de navigation |
| **Route** | `/devis/:numero/echeance` |
| **Type** | sheet — feuille modale basse qui peut devenir pleine hauteur selon la question |
| **Utilisateurs** | Jean-Luc seul |
| **User stories servies** | US-8 (être prévenu avant qu'un devis n'expire, et décider quoi faire) |
| **Règles métier** | B12, B13 |
| **Edge cases** | E8, E15 |

**Une phrase** : cet écran permet à Jean-Luc de **choisir ce qu'il fait d'un devis dont la validité est finie**, afin de **qu'aucun prix ne soit prolongé, modifié ou signé à sa place**.

**Pourquoi il est une feuille et non une page** : parce que **ce n'est pas une information, c'est une question qui n'a pas de réponse automatique**. B13 dit que l'application ne prolonge pas seule, ne modifie aucun prix et ne signe rien à la place de Jean-Luc. Une page entière donnerait à cette question le poids d'un écran, alors qu'elle est une décision de trois mots prise entre deux portes. La feuille se pose par-dessus la liste et **attend** ; elle ne se referme pas toute seule, et elle **repose la question à chaque ouverture** tant que Jean-Luc n'a pas choisi (E8).

### 1.1 Ce que cet écran essaie d'éviter

Cet écran essaie d'éviter **que l'application choisisse à la place de Jean-Luc**. C'est la tentation la plus forte de tout ce produit, et elle est irrésistible pour une application : une validité expirée est un problème, et une application qui résout un problème en décide. Alors elle prolonge de 30 jours, parce que c'est le cas le plus fréquent. Ou elle grise les prix, « pour que le client voie que c'est ancien ». Ou elle propose un bouton unique, `Prolonger`, en `Bouton` `plein`, parce qu'un bouton unique est plus joli que trois. Chacune de ces trois décisions est une falsification. La première invente une intention commerciale ; la seconde affiche un prix modifié alors que le prix n'a pas changé — **le prix n'a pas expiré, la validité du prix a expiré**, et le montant sur l'écran doit rester `760 euros`, en `--color-texte-principal` `#1F1B15`, jamais atténué ; la troisième transforme un choix en procédure. B13 et le contrat § 5 sont explicites : « elle ne signe rien à la place et ne change aucun prix seule ». Donc cet écran offre **trois boutons, jamais un seul**, et aucun n'est pré-sélectionné, et aucun n'est plus gros que les autres. La seconde chose refusée est **le bouton `Refuser` en noir d'erreur**. Le refus est une décision de métier légitime — le client a disparu, le travail ne se fera pas — et il n'est pas une faute. Il est donc en `Bouton` variante `famille-expire`, filet `--color-bordure-expire` `#B45A48` `2px`, texte `--color-texte-expire` `#86210F`, pas en `plein` sombre : une couleur d'erreur sur une décision d'affaires ferait croire que Jean-Luc a mal fait. La troisième est **la question posée une fois**. E8 dit que si Jean-Luc ne répond pas, l'application repose la question — donc la feuille **se rouvre à chaque ouverture du devis**, et elle ne marque aucun blocage définitif tant qu'il n'a pas tranché. Et `Prolonger` **exige une nouvelle durée explicite** : un bouton qui prolongerait « de 30 jours » par défaut, et une application qui le ferait seule, et « pour une nouvelle durée » doit être un choix fait par Jean-Luc.

### 1.2 La quatrième ligne, et elle n'est pas un état de sortie

La date limite est **une autre horloge**, avec son propre vocabulaire, et elle ne se confond jamais avec les trois états de sortie. Les trois formes exactes :

| Situation | Ligne écrite | Rendu |
|---|---|---|
| Plus de 7 jours | `La date limite est le 13 avril.` | `--color-texte-secondaire` `#4C4436`. **Aucune couleur d'alerte** : rien ne presse. |
| 7 jours ou moins | `La date limite est le 14 avril — dans 3 jours.` | Liseré gauche `--stroke-liseré` `4px` `--color-bordure-echeance` `#8A6714`, fond `--color-echeance-fond` `#F4E9CB`, texte `--color-texte-echeance` `#6B4700`. |
| Dépassée | `La date limite était le 13 avril. Elle est passée.` | Liseré gauche `--color-bordure-expire` `#B45A48` `4px`, fond `--color-expire-fond` `#F4DED8`, texte `--color-texte-expire` `#86210F`. **Et trois boutons, jamais un seul.** |

Le montant ne change pas et ne s'atténue pas dans le troisième cas : c'est ce qui distingue une horloge expirée d'un prix périmé, et c'est écrit dans la feuille par le fait que `760 euros` reste en `--color-texte-principal` `#1F1B15`.

---

## 2. Direction visuelle de cet écran

Repris du design system — **valeurs concrètes, jamais « à définir »**.

| | |
|---|---|
| **Mood** | dense, mate, sans emphase |
| **Densité** | **normale** : trois boutons et une phrase. Une feuille dense ici donnerait l'impression qu'il y a beaucoup à gérer, alors qu'il y a trois mots à choisir. |
| **Niveau de contraste** | **fort** — le liseré `--stroke-liseré` `4px` en `--color-bordure-expire` `#B45A48`, le fond `--color-expire-fond` `#F4DED8`, le texte `--color-texte-expire` `#86210F`. Et le montant en `--color-texte-principal` `#1F1B15`, **le contraste le plus élevé de l'écran**, précisément pour qu'il soit clair que le prix n'a pas bougé. |
| **Surface** | `--color-surface-raised` `#FBF9F4` pour la feuille, sur la liste en `--color-surface` `#F6F2E9` |
| **Accent utilisé** | `--color-bordure-expire` `#B45A48` pour le liseré de l'échéance et le filet de `Refuser`, `--color-bordure-confirme` `#3C7A59` pour le filet de `Prolonger 30 jours` — un devis prolongé devient un devis **à nouveau valide**, et sa famille de couleur est donc celle de la sortie confirmée. Aucun bouton bleu. |
| **Traitement photographique** | AUCUN. Ni sablier, ni calendrier, ni icône d'horloge dans un cercle. |
| **Référence** | le devis papier : une validité écrite en bas de page, à la main, et un mot de la main de Jean-Luc en dessous. |

### 2.1 Anti-générique — obligatoire

Cet écran ne doit ressembler **à aucun** de ces défauts :

- [x] **Pas de fond blanc pur** `#FFFFFF` — la feuille est `--color-surface-raised` `#FBF9F4`, le bloc d'échéance en `--color-expire-fond` `#F4DED8`.
- [x] **Pas de carte ombrée pour tout.** **Une seule ombre**, `--shadow-lg` `0 -4px 24px rgba(31,27,21,0.18)`, vers le haut, parce que la feuille monte et masque la liste. Les trois actions sont trois blocs de `--hauteur-cible` `56px` séparés par `--space-md` `12px`, **pas trois cartes** — trois cartes ombrées pour trois boutons, c'est le défaut exact que le design-system § 1.4 refuse.
- [x] **Pas d'uniformité** : quatre niveaux — `--text-montant` `32px` pour le montant, `--text-h3` `20px` pour la mention d'échéance, `--text-corps` `17px` pour la question, `--text-mention` `16px` pour la conséquence de chaque choix.
- [x] **Pas de gris neutre générique** `#6B7280` — le texte de la question est `--color-texte-principal` `#1F1B15`, la ligne d'échéance `--color-texte-expire` `#86210F`.
- [x] **Pas de mise en page centrée symétrique** — tout est aligné à gauche. **Aucun des trois boutons n'est centré et aucun n'est pré-sélectionné** : un choix doit être visible comme un choix.
- [x] **Pas d'illustration d'appoint** — pas de sablier, pas de calendrier qui tourne, pas d'alarme. La question est `La date limite est passée. Que voulez-vous faire de ce devis ?` et c'est tout.
- [x] **Pas d'une seule famille de police** — `--font-texte` `Archivo` pour les phrases, `--font-identifiant` `IBM Plex Mono` `15px` pour `D-2026-008` et pour la nouvelle date limite.

**Choix assumé et non neutre** : **les trois boutons sont de hauteur identique et aucun n'est `plein`.** Un design d'interface donnerait `plein` au premier bouton de la liste, et ici le premier est `Prolonger 30 jours` — donc `plein` afficherait « prolonger » comme la réponse évidente, et Jean-Luc la presserait sans la lire, ce qui est exactement la décision que B13 lui réserve. Les trois sont donc en variante `contour` avec un filet de famille : `--color-bordure-confirme` `#3C7A59` pour prolonger, `--color-bordure-attente` `#A05E27` pour faire ressigner, `--color-bordure-expire` `#B45A48` pour refuser. **Aucun n'est plus gros, aucun n'est plus haut, aucun n'est en haut.** L'ordre des trois est : prolonger, faire ressigner, refuser — le refus est **en dernier**, parce qu'il est le seul qui ne mène nulle part, et le placer en premier le mettrait à portée du pouce par hasard.

---

## 3. Anatomie

```
┌─────────────────────────────────────────┐
│ ▓▓ la liste de suivi reste visible ▓▓▓  │
│  (groupe 3 : Validité finie ou proche)  │
├─────────────────────────────────────────┤
│ FEUILLE ÉCHÉANCE                         │
│  D-2026-008                 (mono 15px) │
│                                         │
│  M. Da Silva                             │
│                                         │
│  ▌ La date limite était le 13 avril.    │  ← liseré 4px expire
│  ▌ Elle est passée.                     │
│                                         │
│  760 euros                  (32px)      │  ← le prix n'a pas
│                                         │     changé, et il ne
│  Que voulez-vous faire de ce devis ?    │     s'atténue pas
│                                         │
│  ┌────────────────────────────────────┐  │
│  │ Prolonger 30 jours          56px  │  │  ← famille-confirme
│  │ Nouvelle date limite : 13 mai      │  │
│  ├────────────────────────────────────┤  │
│  │ Faire ressigner              56px  │  │  ← famille-attente
│  │ Le client signe de nouveau.        │  │
│  ├────────────────────────────────────┤  │
│  │ Refuser                       56px  │  │  ← famille-expire
│  │ Le devis ne pourra plus partir.    │  │
│  └────────────────────────────────────┘  │
│                                         │
│  Aucun de ces trois choix n'est fait    │
│  pour vous. Aucun prix ne change sans  │
│  que vous le decidiez.                  │
└─────────────────────────────────────────┘
```

| # | Composant | Rôle | Source |
|---|---|---|---|
| 1 | `LigneEcheance` variante `complete` | dire quand le prix cesse de tenir, et **ne rien décider** à la place de Jean-Luc (B13) | design-system § 2 |
| 2 | `LigneEcheance` état `passee` | la mention d'échéance dépassée, et **les trois issues**, jamais une seule | design-system § 2 |
| 3 | `EnTeteDevis` variante `expire` | l'en-tête du devis avec la durée barrée et la mention d'échéance | design-system § 2 |
| 4 | `TotalBloc` variante `fige` état `expire` | le montant, **inchangé et non atténué**, parce que le prix n'a pas expiré | design-system § 2 |
| 5 | `Bouton` variante `contour` | les trois issues, **de hauteur identique, aucune `plein`, aucune pré-sélectionnée** | design-system § 2 |
| 6 | `Bouton` variante `famille-confirme` | le filet de `Prolonger 30 jours` — une validité prolongée redevient valide | design-system § 2 |
| 7 | `Bouton` variante `famille-attente` | le filet de `Faire ressigner` | design-system § 2 |
| 8 | `Bouton` variante `famille-expire` | le filet de `Refuser` | design-system § 2 |
| 9 | `GroupeBoutons` variante `trois` | **le choix de la nouvelle durée**, exige de `Prolonger` — et il exige des durées explicites | design-system § 2 |
| 10 | `BandeauMessage` | confirmer l'issue choisie, une fois, avec ce qui a changé | design-system § 2 |

---

## 4. États — tous, sans exception

| État | Déclencheur | Rendu | Feedback utilisateur |
|---|---|---|---|
| **Chargement** | Ouverture depuis le groupe 3 de `suivi` | **Aucun squelette.** Le devis est local et sa date limite est déjà connue — c'est une horloge, pas une donnée distante. La feuille s'ouvre sur l'état `passee` complet. | rien |
| **Rempli** | La date limite est dépassée | `LigneEcheance` variante `complete` à l'état `passee` : liseré gauche `--color-bordure-expire` `#B45A48` `4px`, fond `--color-expire-fond` `#F4DED8`, mention `La date limite était le 13 avril. Elle est passée.` Puis le montant `760 euros` inchangé, la question `Que voulez-vous faire de ce devis ?`, puis **trois blocs de 56px**, chacun avec sa conséquence écrite en dessous. Puis la phrase qui ferme : `Aucun de ces trois choix n'est fait pour vous. Aucun prix ne change sans que vous le décidiez.` | — |
| **Vide — jamais visité** | — | **N'existe pas sur cette feuille**, et c'est un choix : cette feuille ne s'ouvre que pour un devis dont la validité est passée. Elle ne peut pas avoir été « jamais visitée ». Le moteur de rendu ne définit pas cet état, et cette absence est écrite pour qu'on ne l'implémente pas. **Et surtout, il n'y a pas d'« état vide d'échéance »** : un devis valide n'a pas de feuille d'échéance à ouvrir. `suivi` n'ouvre cette feuille que pour les lignes du groupe 3 dont l'état est `passee`. | — |
| **Vide — aucune donnée** | — | **N'existe pas** pour la même raison. Il n'y a rien à vider : la feuille porte une question, pas une liste. | — |
| **Erreur de chargement** | Le devis n'est pas lisible sur l'appareil | **La feuille ne s'ouvre pas**, et `suivi` affiche `BandeauMessage` en état `echec` : `Ce devis n'est pas lisible sur cet appareil. Aucune question de validité ne peut être posée.` Un devis illisible ne peut pas être prolongé, ressigné ni refusé, parce que personne ne sait ce qu'il contient. | bandeau `--color-expire-fond` `#F4DED8`, il ne s'efface pas |
| **Erreur de soumission** | L'issue choisie ne peut pas être écrite dans le magasin local | La feuille **ne se ferme pas** et l'issue choisie reste affichée, avec un `BandeauMessage` en état `echec` : `Ce choix n'a pas pu être enregistré. Le devis n'a pas été modifié.` puis `Réessayer`. **Aucun prix n'a bougé pendant l'échec**, et l'écran le dit : c'est le seul endroit du produit où une décision de métier pourrait être perdue, donc c'est le seul endroit où l'écran écrit explicitement que rien n'a changé. | bandeau `echec`, il ne s'efface pas |
| **Succès** | Une des trois issues est appliquée | Le bandeau écrit **ce qui a changé, précisément**. `Prolonger` : `Validité prolongée de 30 jours. Nouvelle date limite : 13 mai 2026.` `Faire ressigner` : `Le devis n'est plus signé. Le client doit signer de nouveau avant qu'il sorte.` `Refuser` : `Devis D-2026-008 refusé. Il ne peut plus partir.` Puis la feuille se ferme en `--duration-slow` `320ms`, et l'écran précédent revient **exactement au même endroit**. | bandeau `--color-confirme-fond` `#DEEAE1` pour prolonger, `--color-attente-fond` `#F7E5D3` pour ressigner, `--color-expire-fond` `#F4DED8` pour refuser — 6 s pour le premier, persistant pour le troisième |
| **Hors-ligne / permissions** | Mode avion | **La feuille fonctionne entièrement hors-ligne** : les trois décisions sont locales, aucune ne demande le réseau (C1). Aucune mention de la couverture, aucune icône. La signature de `Faire ressigner` demandera ensuite l'écran `signature`, qui est lui aussi local. | rien |
| **Lecture seule** | Le devis a déjà été prolongé, ressigné ou refusé | **La feuille ne s'ouvre plus** : `suivi` n'ouvre `echeance` que pour une validité passée. Pour une validité prolongée, la ligne affiche `La date limite est le 13 mai 2026.` et pour un refus, le devis porte `Refusé` et quitte le groupe 3. **Aucun bouton n'est proposé sur un devis déjà traité**, donc aucune issue n'est déjà appliquée — E8 et B13 disent qu'aucune des trois issues n'est appliquée seule. | — |

> Un état non décrit est un état non implémenté.

---

## 5. Interactions

| Élément | Événement | Comportement | Feedback visuel | État résultant | ID |
|---|---|---|---|---|---|
| Bloc `Prolonger 30 jours` | tap | **N'applique rien seul.** Il ouvre le choix de la nouvelle durée : `GroupeBoutons` `trois` — `15 jours`, `30 jours`, `60 jours` — avec `30 jours` marqué `recommandé`. Le nouveau terme est **écrit avant d'être appliqué** : `La date limite passera du 13 avril au 13 mai 2026.` Un second appui sur le bloc lui-même ne fait rien de plus. | `GroupeBoutons` à l'état `inactif`, trois boutons `contour` de 56px | choix de durée | B13, B12 |
| Nouvelle durée choisie | tap | **Un seul bouton devient `plein`** dans le `GroupeBoutons` — c'est la seule place du produit où `plein` sert à montrer une sélection et non une action, parce que montrer une action et montrer un état revient au même geste. Les deux autres s'atténuent à 60 %. Puis `Prolonger de 30 jours` devient disponible en bas. | `--duration-fast` `120ms` | `selectionne` | B13 |
| `Prolonger de 30 jours` | tap | La date limite est recalculée **depuis la date écrite sur le devis**, jamais depuis aujourd'hui : un devis écrit le 14 mars prolongé de 30 jours finit le 13 mai, que le prolongement soit demandé le 11 avril ou le 2 mai. Le prix, la signature et l'empreinte **ne bougent pas**. | bandeau `succes` 6 s, puis fermeture `320ms` | `LigneEcheance` `en-cours` | B12, B13 |
| Bloc `Faire ressigner` | tap | Le devis repasse à non signé : la signature est barrée, la mention `À resigner` apparaît, et l'écran `signature` s'ouvre. **Aucune nouvelle signature n'est produite**, et aucun prix n'est modifié. | bandeau `--color-attente-fond` `#F7E5D3` | `signature` | B11, B13 |
| Bloc `Refuser` | tap | Demande confirmation, parce que c'est la seule des trois issues qui ferme une porte : `Refuser ce devis ? Il ne pourra plus être envoyé ni partagé en PDF.` puis `Refuser le devis` et `Annuler`. Le devis reste consultable, il n'est pas supprimé : un refus n'est pas une suppression. | — | `refusé` | B13 |
| Feuille, geste vers le bas | geste | **Ferme la feuille sans rien appliquer, et c'est correct** : E8 veut que la question soit **reposée** tant que Jean-Luc n'a pas choisi, donc fermer sans choisir est un résultat parfaitement recevable — et la question reviendra à la prochaine ouverture. Aucun message, aucune confirmation. | — | `suivi` | E8 |
| Retour arrière du système | geste | Traité comme le geste vers le bas. La question n'est pas marquée comme respondue. | — | `suivi` | E8 |
| Réouverture du devis le lendemain | — | **La feuille se rouvre.** La question est reposée, dans les mêmes mots, parce que rien n'a été tranché. Le bandeau dit alors : `La question a été reposée : aucun choix n'a encore été fait pour ce devis.` | — | `passee` | E8 |

- **Focus / clavier** : ordre — les trois blocs, dans l'ordre écrit. Sur `--bp-poste` et `--bp-large`, `role="dialog"` `aria-modal="true"`, focus piégé, et le focus initial est sur le **premier bloc**, pas sur un bouton pré-sélectionné : le focus n'est pas une sélection. Sur le `GroupeBoutons` de la nouvelle durée, `role="radiogroup"` avec les flèches gauche et droite.
- **Gestes** : défilement vertical de la feuille, et geste vers le bas pour fermer. **Aucun geste n'applique une des trois issues** : prolonger, ressigner ou refuser sont trois décisions de métier, donc chacune a un bouton visible de `--hauteur-cible` `56px`. La PRD § 7.3 l'impose, et ici l'enjeu est plus grave qu'ailleurs — un geste qui refuse un devis par accident est un devis que le client ne recevra jamais.
- **Animations** : ouverture `320ms` `--ease-entree`, fermeture après application `--duration-slow` `320ms` `--ease-default`. **Le montant ne s'anime pas et ne change pas de couleur** en passant à l'état `expire` : `760 euros` reste en `--color-texte-principal` `#1F1B15`, parce que le prix n'a pas expiré — c'est la validité du prix qui a expiré. **Le liseré d'échéance apparaît instantanément**, sans fondu, comme toute mention d'état.
- **Retour arrière** : intercepté, traité comme le geste vers le bas, donc comme une fermeture **sans application**. La question sera reposée.

---

## 6. Responsive

| Breakpoint | Comportement | Ce qui se replie / disparaît |
|---|---|---|
| **Mobile** `--bp-telephone` 0 — 479px | Feuille de 60 % de la hauteur, rayon `--radius-lg` `16px`, pleine largeur. Les trois blocs font `--hauteur-cible` `56px`, empilés, séparés par `--space-md` `12px`. Les trois sont dans `--zone-pouce` `96px` en bas de feuille — **les trois decisions sont au pouce**, parce qu'aucune des trois ne doit être plus difficile à atteindre qu'une autre. | rien |
| **Tablet** `--bp-tablette` 480 — 1023px | Feuille de 50 %. Les trois blocs passent **côte à côte**, trois colonnes égales de 56px, avec la conséquence de chacun en dessous sur trois lignes. Aucune n'est plus large qu'une autre : une largeur différente serait un choix arbitraire. | rien |
| **Desktop** `--bp-poste` 1024 — 1439px | Feuille centrée, largeur limitée à `--space-3xl` `48px` de marge de chaque côté, hauteur 33 %. La liste de suivi reste visible et lisible à gauche. | rien |
| **Large** `--bp-large` 1440px et plus | Identique à `--bp-poste`. | rien |

- **Cible tactile** : `--hauteur-cible` `56px` pour les trois blocs, `--hauteur-action-primaire` `60px` pour `Prolonger de 30 jours` une fois la durée choisie. **Les trois cibles sont de hauteur identique** : c'est une contrainte de ce écran, pas un effet de style, parce qu'une cible plus haute se presse plus vite et qu'aucune des trois issues ne doit être plus rapide que les autres.
- **Débordement** : **aucun défilement horizontal.** Les dates sont en toutes lettres — `13 avril`, `13 mai 2026` — jamais `13/04`, jamais `J-3`, jamais `+30j`, donc leur largeur est stable et ne fait pas bouger la mise en page. Les trois conséquences de bouton passent sur deux lignes à `--text-mention` `16px` **jamais réduites**.

---

## 7. Accessibilité

- [ ] **Contraste du texte courant** : mesuré par `node "$FORGE/scripts/design-check.js" contrast <anchor>`. **Aucun ratio n'est écrit ici** (design-system § 0.0).
- [ ] **Contraste des grands textes** : mesuré par le même contrôle, sur `--text-montant` `32px` et `--text-h3` `20px`. Le montant est mesuré contre `--color-surface-raised` `#FBF9F4`, pas contre le fond rouge : c'est un choix de conception, et il est écrit pour qu'on ne le corrige pas en « améliorant » le contraste du bloc.
- [ ] **Navigation clavier complète** sur `--bp-poste` et `--bp-large`, focus piégé dans la feuille, `role="radiogroup"` pour le choix de durée.
- [ ] **Focus visible** : anneau `--color-bordure-focus` `#8A4A0E`, `--stroke-focus` `3px`, jamais supprimé. Jamais 2px : c'est le seul repère au doigt comme au clavier, et cet écran est lu dans une cave.
- [ ] **ARIA** : la feuille est `role="dialog"` `aria-modal="true"` avec `aria-labelledby` pointant vers la question, et son nom est donc `Que voulez-vous faire de ce devis ?`. La mention d'échéance est `role="status"`. Les trois blocs portent un `aria-label` complet avec leur conséquence : `Prolonger 30 jours. Nouvelle date limite : 13 mai 2026.` La phrase de pied — `Aucun de ces trois choix n'est fait pour vous.` — est un `role="note"`, jamais une simple ligne de texte : c'est la règle de l'écran, et elle doit être lue par un lecteur d'écran comme telle.
- [ ] **Texte alternatif** : aucune image sur cet écran, donc aucune alternative à écrire. Le montant est du texte et reste sélectionnable, ce qui est plus utile qu'une image du montant.
- [ ] **Langue et direction de lecture** : `lang="fr"`, `dir="ltr"`. Les durées sont en toutes lettres — `30 jours`, `15 jours`, `60 jours` — et le mot `jours` est toujours présent : `30j` serait abrégé au point de ne plus être une durée lisible au téléphone.

---

## 8. Données

| Champ | Type | Origine | Requis | Erreur possible |
|---|---|---|---|---|
| `devis.numero` | texte `D-2026-008` | magasin local | oui | absent : la feuille ne s'ouvre pas |
| `devis.date-ecriture` | date | magasin local | oui | **jamais modifiée** ; c'est la référence de tous les calculs de validité |
| `devis.date-limite` | date | `date-ecriture` + durée choisie avant le premier envoi | oui | recalculée seulement sur une décision explicite de Jean-Luc, jamais par l'écoulement du temps (B13) |
| `devis.etat-echeance` | énumération `en-cours` \| `approche` \| `passee` | **calculé**, jamais stocké | oui | stocké par erreur, il est ignoré au rendu : c'est une horloge, pas un fait à écrire |
| `devis.duree-validite` | `15` \| `30` \| `60` | choix de Jean-Luc avant le premier envoi | oui | un changement ne s'applique **qu'aux devis écrits après** (B12) |
| `devis.issue` | énumération vide \| `prolonge` \| `a-resigner` \| `refuse` | décision explicite de Jean-Luc | oui | vide tant que Jean-Luc n'a pas tranché, et **la question est alors reposée** (E8) |
| `devis.prix-lignes[]` | liste | magasin local | oui | **jamais modifié par cette feuille** : aucune des trois issues ne change un prix |
| `devis.signature.empreinte` | texte | magasin local | non | conservée à `Prolonger` et à `Refuser`, **annulée à `Faire ressigner`** (B11) |

- **Chargement** : **aucun.** La date limite est calculée sur l'horloge locale à partir de la date écrite sur le devis. La feuille n'a rien à charger et n'affiche aucun squelette.
- **Cache / hors-ligne** : **entièrement hors-ligne** (C1). Les trois décisions sont des écritures locales, et aucune ne demande le service de courriel. `Prolonger` ne change que deux champs, `Refuser` en change un, `Faire ressigner` en change deux — et **aucune des trois ne modifie un prix**.
- **Données sensibles** : aucune donnée personnelle n'est écrite par cette feuille. Aucun journal d'audit ne contient une décision de Jean-Luc sans le numéro du devis qui la porte : le journal enregistre `D-2026-008`, l'issue choisie, la date de l'ancienne et de la nouvelle validité, et l'horodatage. Le contenu du devis n'y entre pas (C11).

---

## 9. Traçabilité

| ID | Origine | Manifestation sur cet écran |
|---|---|---|
| B12 | PRD | La durée court **depuis la date écrite sur le devis**. Une prolongation porte sur 30 jours à partir du 14 mars, pas du 11 avril, et l'écran écrit la nouvelle date avant de l'appliquer. Un changement de durée ne s'applique qu'aux devis écrits après. |
| B13 | PRD | **Trois boutons, jamais un seul**, chacun avec sa conséquence écrite, aucun pré-sélectionné, aucun en `plein`. `Prolonger` exige une **nouvelle durée explicite**. Aucune des trois issues ne modifie un prix, ne produit une signature, et aucune n'est appliquée seule. La phrase de pied le dit : `Aucun de ces trois choix n'est fait pour vous.` |
| E8 | PRD | Si Jean-Luc ne répond pas, le devis reste `expiré`, la question est **reposée à chaque ouverture**, et un bandeau écrit : `La question a été reposée : aucun choix n'a encore été fait pour ce devis.` L'application ne prolonge pas, ne modifie aucun prix et ne signe rien. |
| E15 | PRD | Un devis écrit puis jamais envoyé, retrouvé trois semaines plus tard, est ici avec sa date limite d'origine — pas une date recalculée à l'ouverture. |
| C1 | PRD | Les trois décisions fonctionnent hors-ligne. Aucune mention de couverture. |
| C7 | PRD | Aucun mot sur la comptabilité. Le contrat § 5 dit que l'application « ne change aucun prix seule » — c'est la seule chose qu'elle ne fait pas en matière d'argent, et elle le dit ici. |
| C8 | PRD | Aucune mention d'encaissement. |

---

## 10. Checklist de gate

- [x] Les états sont décrits avec un rendu concret, et les états vides sont **écrits comme absents** — cette feuille ne s'ouvre que pour une validité passée, donc elle n'a pas d'état vide.
- [x] Chaque élément interactif a un comportement et un feedback. `Prolonger 30 jours` a un comportement en deux temps, et c'est écrit : il ouvre le choix de durée, il n'applique rien seul.
- [x] Le responsive est défini à **chaque** breakpoint, avec la contrainte que les trois cibles restent de hauteur identique à toutes les largeurs.
- [x] La section Anti-générique est cochée et justifiée. Le choix qu'aucun des trois boutons ne soit `plein` est le choix contestable de cet écran, et il est justifié par B13.
- [x] Aucune valeur de design n'est laissée à « à définir ».
- [x] Chaque ID B*/E*/C* de cet écran apparaît en section 9 : B12, B13, E8, E15, C1, C7, C8.
- [x] Aucun gabarit non résolu.
- [x] L'écran reste cohérent avec `.forge/design/design-system.md`.