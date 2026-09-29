# Qualité de design —orithmic anti-générique

## Le problème que cette règle résout

Un design produit par défaut IA échoue presque toujours de la même manière : **blanc, générique, mou**. Concrètement :

- Fond blanc pur, contenu centré, beaucoup d'air, rien qui ne tranche.
- Cartes blanches avec ombre portée douce partout, donc rien ne se distingue.
- Bleu par défaut `#3B82F6`, gris neutre `#6B7280`, rouge d'erreur `#EF4444`.
- Une seule famille de police, une seule graisse, une seule échelle.
- Illustrations d'appoint génériques (icône dans un cercle, dégradé abstrait) à la place d'une hiérarchie.
- Personne ne peut nommer l'ambiance du produit : c'est le symptôme de l'absence de direction.

Ce n'est pas un problème d'exécutant. C'est un problème de **cahier des charges** : rien, dans un formulaire de spécification, n'oblige à choisir. Tout est laissé à « à définir plus tard », et le défaut l'emporte.

**Cette page rend ces choix obligatoires.**

---

## Étape 1 — Choisir la direction AVANT les écrans

Aucune spécification d'écran ne s'écrit avant que ces trois ancres soient fixées dans `.forge/design/design-system.md` :

| Ancre | Question à laquelle elle répond | Exemple |
|---|---|---|
| **Références** | Quels produits existants ont ce ton ? | « Linear, Stripe Dashboard » |
| **Ambiance** | Trois mots, pas davantage | « dense, opérationnel, calme » |
| **Anti-références** | Qu'est-ce qu'on refuse explicitement ? | « pas de cartes ombrées, pas de dégradés, pas d'illustration décorative » |

Les anti-références sont **la partie la plus utile du document** : ce sont elles qui empêchent un agent de retomber dans le défaut au cours du projet.

Si les trois ancres ne sont pas écrites, la Phase 3 n'est pas terminée.

---

## Étape 2 — Déclarer un skill de design, et l'utiliser

Les skills de design ne sont pas facultatifs. Le tableau ci-dessous indique **lequel est obligatoire** pour le contexte donné.

| Contexte | Skill obligatoire | Ce qu'il apporte |
|---|---|---|
| Écran d'accueil / landing page web | `frontend-design` | Direction artistique, anti-défaut |
| **Application mobile** | `imagegen-frontend-mobile` | Maquettes premium, cohérence multi-écrans |
| Site marketing / landing long | `imagegen-frontend-web` | Direction visuelle par section |
| App web dense / dashboard | `impeccable` ou `design-taste-frontend` | Densité, hiérarchie, micro-interactions |
| Éditorial / contenu long | `minimalist-ui` | Typographie, rythme |
| Terminal / données brutes | `industrial-brutalist-ui` | Grille, Brutalisme assumé |
| Identité de marque / logo | `brandkit` | Système de marque cohérent |
| Amélioration d'une UI existante | `redesign-existing-projects` | Audit puis refonte |
| Tests visuels / comparaison d'images | `stitch-design-taste` | DESIGN.md, retour visuel |

**Si aucun skill de design n'est disponible** : appliquer au minimum le §3 (interdits) et le §4 (exigences). Un design sans skill doit être signalé dans l'audit.

### Le skill ne remplace pas la spécification

Le rôle du skill est de **produire une direction et des références**. Le rôle de Forge est de la **spécifier** de façon exécutable. L'ordre est : skill d'abord (direction), puis `screen.md.tmpl` (spécification). Ne jamais écrire la spec avant d'avoir la direction.

---

## Étape 3 — Interdits (liste de contrôle bloquante)

Ces défauts sont considérés comme des **bugs de conception**, pas comme des préférences. Un écran qui en contient un ne passe pas le gate.

### Fond et surface

- [ ] **Pas de blanc pur `#FFFFFF` en fond par défaut.** Choisir une valeur — même proche du blanc (chaud, froid, teinté). Un fond neutre « non choisi » est interdit.
- [ ] **Pas d'ombre portée comme séparateur par défaut.** Bordure, changement de valeur de fond, ou espace : l'ombre est une exception pour les éléments flottants.
- [ ] **Pas de carte pour tout.** Un conteneur qui contient deux éléments n'est pas une carte.

### Couleur

- [ ] **Pas de palette par défaut** (`#3B82F6`, `#6B7280`, `#EF4444`, `#10B981`). Les valeurs doivent venir d'un choix de marque ou du sens fonctionnel, et être documentées.
- [ ] **Pas de la couleur seule pour porter du sens.** Un état d'erreur est aussi une icône, un texte, ou une bordure.

### Typographie

- [ ] **Pas d'une seule famille et d'une seule graisse** si la hiérarchie est forte. Le contraste d'échelle porte la hiérarchie.
- [ ] **Pas d'échelle typographique uniforme** : si h1, h2 et body sont à `16/15/14`, il n'y a pas de hiérarchie.
- [ ] **Pas de corps de texte sous `16px` sur mobile.**

### Composition

- [ ] **Pas de centrage symétrique systématique.**
- [ ] **Pas de grille uniforme sans intention.** Une grille peut être dense en données et aérée en lecture — c'est un choix, pas un défaut.
- [ ] **Pas d'espacement uniforme sur toute la page.** Les regroupements doivent se lire dans l'espace.

### Contenu

- [ ] **Pas d'illustration d'appoint générique** (icône dans un cercle, dégradé abstrait, emoji) pour meubler.
- [ ] **Pas de données fictives crédibles mais plates** (prénom « Jean », montant « 1234,56 € »). Utiliser des cas réalistes du PRD.
- [ ] **Pas de micro-copy vide** (« Bienvenue ! », « Vous êtes prêt »).

---

## Étape 4 — Exigences (ce qu'il faut fournir)

| Exigence | Détail |
|---|---|
| **Trois ancres** | Références, ambiance, anti-références — avant tout écran |
| **Tokens concrets** | Chaque couleur, chaque pas d'échelle, chaque durée a une **valeur**. Jamais « à définir » |
| **Palette d'états complète** | default, hover, active, focus, disabled, error, success, warning, info — pour chaque composant |
| **Densité assumée** | Densité choisie consciemment et justifiée par le contexte d'usage |
| **Échelle typographique** | Ratios explicites entre niveaux, avec valeurs |
| **États d'écran complets** | Les 9 états (cf. `screen.md.tmpl` §4) |
| **Un choix qui divise** | Au moins un choix visuel qui serait contestable — preuve que le design est pensé et pas accumulé |

---

## Étape 5 — Vérification

```bash
node scripts/forge-guard.js placeholders <anchor>
```

Détecte les `{{PLACEHOLDER}}` résiduels — le symptôme mécanique d'une spec jamais remplie, et la cause première des designs génériques : personne n'a eu à choisir.

Le reste est un jugement humain, à faire au gate : ouvrir les écrans côte à côte et se demander **« qu'est-ce qui, ici, ne pourrait pas venir du même générateur ? »** Si la réponse est « rien », le design est générique.

---

## Checklist de gate — qualité de design

- [ ] Les trois ancres (références / ambiance / anti-références) sont écrites avant les écrans.
- [ ] Un skill de design a été appelé, ou son absence est justifiée dans l'audit.
- [ ] Le fond n'est pas du blanc pur non choisi.
- [ ] L'ombre n'est pas le séparateur par défaut.
- [ ] La palette n'est pas une palette par défaut.
- [ ] L'échelle typographique a un ratio réel entre ses niveaux.
- [ ] Tous les tokens ont une valeur concrète ; aucun `{{PLACEHOLDER}}`.
- [ ] Chaque écran déclare sa densité et sa hiérarchie de surface.
- [ ] Les 9 états sont documentés pour chaque écran.
- [ ] Au moins un choix visuel est assumé et contestable.
- [ ] L'ordre de navigation est justifié par la fréquence (`references/module-prioritization.md`).
- [ ] `node scripts/forge-guard.js placeholders <anchor>` ne signale rien.
