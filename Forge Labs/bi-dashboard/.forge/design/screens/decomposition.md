---
type: screen
slug: decomposition
title: "Décomposition d'un indicateur"
module: indicateurs
status: approved
generated_at: 2026-09-30
derived_from:
  - .forge/prd.md
  - .forge/roadmap.md
  - .forge/benchmarks.md
  - .forge/design/design-system.md
rule_ids:
  - B5
  - B7
  - B15
edge_case_ids:
  - E2
  - E5
  - E10
  - E11
flow: investigation
---

# Écran — Décomposition d'un indicateur

> Ce document est la **source de vérité** pour qu'une IA génère l'interface de cet écran.
> Il est généré depuis le gabarit, jamais recopié. Aucun emplacement non résolu ne doit subsister.

---

## 1. Rôle de l'écran

| | |
|---|---|
| **Archétype d'app** | `dashboard` (secondaire `admin_crud` — la table dense) |
| **Module** | `indicateurs` — rang 1 de la navigation |
| **Route** | `/indicateurs/[slug]/decomposition?periode=2026-08&equipe=commercial&niveau=client` |
| **Type** | `page` |
| **Utilisateurs** | Manager d'équipe (usage principal, quotidien, début de journée) · Analyste (2 à 3 fois par semaine, préparation de comité) |
| **User stories servies** | US-5 (investiguer), US-7 (ne pas voir ce à quoi on n'a pas droit) |
| **Règles métier** | B5, B7, B15 |
| **Edge cases** | E2, E5, E10, E11 |

**Une phrase** : cet écran permet au manager d'équipe de **localiser l'anomalie dans les lignes qui composent l'indicateur**, afin d'agir sur la bonne cause.

**Pourquoi il est au rang 1 de la navigation** : il n'occupe aucune place dans la barre. C'est un **sous-écran du rang 1**, atteint en **deux sauts** depuis la tuile : tuile (grille `indicateurs`) → détail de l'indicateur → décomposition. Le standard de l'archétype `dashboard` l'exige (« chaque visuel est cliquable vers son détail ») et `benchmarks.md` § 3 écart 3 l'assume : le drill-down ne peut pas être une action de liste, parce que le détail **est** le drill-down.

**Cas d'usage précis** : 08 h 10, le manager commercial voit « CA par client » en rouge, il ouvre la décomposition, il lit la colonne `part`, il repère que 3 clients portent 61 % de l'écart, il **referme l'onglet**. Aucune action corrective n'est offerte ici (C2) : l'écran rend **la ligne fautive et sa provenance**, la décision se prend ailleurs.

---

## 2. Direction visuelle de cet écran

Repris du design system — **valeurs concrètes, jamais « à définir »**.

| | |
|---|---|
| **Mood** | dense, sourcée, non décorative — la même ambiance que le reste du produit, ici sans aucun artefact de navigation superflu |
| **Densité** | **dense** — c'est le seul écran où la densité est une fonction et pas une identité : le manager compare 12 à 30 lignes entre elles, il ne les lit pas une par une. `DataTable` variante `drill` en densité `sm`, interlignage `--space-lg` (12 px) |
| **Niveau de contraste** | **fort** — 11,3:1 pour le texte courant, 7,1:1 pour l'accent. Justification : l'écran est comparé ligne à ligne dans une colonne étroite, et la valeur `part` se lit à 3 m en comité de pilotage opérationnel |
| **Surface** | `--color-surface` `#E9EDEB` sur `--color-background` `#F2F4F3` ; en-tête de table et ligne de total en `--color-surface-sunken` `#DEE3E1` |
| **Accent utilisé** | `--color-accent` `#0F5C57` — **uniquement** sur la ligne de total (filet supérieur 2 px + valeur du total) et sur l'étape courante du `DrillTrail`. Il sert à désigner *ce qui est total*, jamais à décorer |
| **Traitement photographique** | **AUCUN**. Ni vignette, ni icône dans un cercle, ni dégradé. Le vide d'un état vide est traité par du texte et un filet, pas par une image |
| **Référence** | l'onglet de détail d'un rapport PDF de comité, pas l'écran de drill-down d'un outil BI : aucun graphique, uniquement des chiffres en chasse fixe alignables en colonne |

### 2.1 Anti-générique — obligatoire

Cet écran ne doit ressembler **à aucun** de ces défauts :

- [x] Pas de fond **blanc pur** `#FFFFFF` par défaut — le fond porte la valeur, même minime. `--color-background` `#F2F4F3`.
- [x] **Pas de carte ombrée pour tout.** `--shadow-none` sur toute la page ; la séparation se fait par `--color-border` `#C9D0CD` (filet 1 px) entre l'en-tête, le corps et la ligne de total.
- [x] **Pas d'uniformité** : la hiérarchie vient d'un rapport d'échelles typographiques, pas d'un espacement constant. `--text-h1` 24 px (intitulé) → `--text-h3` 15 px (intitulé de l'indicateur) → `--text-overline` 11 px (en-têtes de colonne) → `--text-body` 14 px (libellé de client) → `--text-caption` 12 px (date de calcul). Le seul corps de texte est `--font-sans` ; tout le reste est `--font-mono`.
- [x] **Pas de gris neutre générique** `#6B7280` par défaut — les neutres sont choisis : `#4F5C57` (vert-gris de l'atelier) pour le secondaire, `#7E8A85` pour le tertiaire, et surtout `#7A6A3C` (chaud) pour « fraîcheur inconnue », qui n'est ni rouge ni neutre. `#7E8A85` n'apparaît nulle part comme texte : à 3,24:1 sur le fond il tient le seuil de 3:1 d'un élément non textuel (WCAG 1.4.11), mais reste sous le seuil de 4,5:1 du texte — il ne sert donc qu'à une bordure de champ.
- [x] **Pas de mise en page centrée symétrique** par défaut. Bandeau de tête sur toute la largeur, table sur 12 colonnes, total aligné à droite sur la colonne `contribution` : la page est lue en diagonale, pas au centre.
- [x] **Pas d'illustration d'appoint générique** (icône employée, gradient abstrait) à la place d'une vraie hiérarchie. Aucun dégradé nulle part (anti-référence du design system), aucune icône décorative : la seule icône est celle qui porte un état, doublée d'un texte.
- [x] **Pas d'une seule famille de police** si la hiérarchie demande du contraste. Deux familles assumées : `--font-sans` pour les libellés, `--font-mono` à chasse fixe pour **toute** valeur chiffrée, la date de calcul et le `source_ref`. C'est ce qui rend deux nombres de largeurs différentes alignables en colonne, donc comparables.

**Choix assumé et non neutre** : **le total est la dernière ligne de la table, pas un encadré au-dessus.** La plupart des écrans BI calculent un total dans un composant séparé, au-dessus du tableau ; ici ce serait un défaut de sécurité et pas seulement de goût : deux composants, deux sources de vérité, et le jour où la restriction de lignes (B7) filtre une partie des lignes, le total affiche l'agrégat complet tandis que la table affiche l'agrégat restreint. Le lecteur verrait alors `1 043 800 €` sous 12 lignes et comprendrait, sans rien demander, que 15 lignes existent. **En rendant le total une ligne du `DataTable`, il est produit par la même requête que les lignes ; un écart entre eux n'est pas un défaut d'affichage, c'est une violation de B7 et l'écran ne peut plus être rendu.** La barre de `part` est dans la même logique un filet horizontal de 2 px aligné à la ligne de base, jamais une aire remplie : à 3 mètres une aire remplie devient un aplat qui avale le pourcentage qu'elle devrait servir à comparer.

---

## 3. Anatomie

```
AppShell                                        (design-system §3.1)
├── Sidebar 240px                               (design-system §3.2 — 4 entrées, module courant surligné)
│   ├── 1 Indicateurs  ← module courant
│   ├── 2 Tableaux de bord
│   ├── 3 Définitions
│   └── 4 Accès et journal
├── Breadcrumbs                                  (design-system §3.3)
│   └── Indicateurs › CA par client › Décomposition
└── main · layout « Page standard » 12 colonnes (design-system §4.2)
    ├── h1  « Décomposition — CA par client »              --text-h1
    │
    ├── Bandeau de tête · 3 colonnes + 9 colonnes, séparé par filet 1 px
    │   ├── IndicatorTile  size=sm  variante=official     (design-system §2 · IndicatorTile)
    │   │   ├── slot label        « CA par client »
    │   │   ├── slot value        « 1 043 800 € »   --font-mono --text-display
    │   │   ├── slot target       « cible 1 200 000 € · écart −156 200 € »  --color-out-of-band
    │   │   ├── slot threshold    NON RENDU sur cet écran — décision écrite en § 9.2 (1).
    │   │   │                     Le bandeau identifie l'indicateur décomposé ; le
    │   │   │                     franchissement de seuil est porté par `indicateurs`
    │   │   │                     (boucle quotidienne) et `indicateur-detail` (l'indicateur).
    │   │   │                     La couleur sémantique, elle, est bien rendue (§ 4).
    │   │   ├── slot computed_at  « calculé le 02/09/2026 04:12 »            ← B5
    │   │   ├── slot source_ref   « mat_ca_client_v2_2026-09-02 »            ← B5
    │   │   └── slot status       badge « officiel »
    │   │
    │   ├── PeriodScopeBar                               (design-system §4.2 « barre de périmètre », composant slice-local)
    │   │   ├── FormField select  période   « août 2026 »     ← vit dans l'URL
    │   │   ├── FormField select  équipe     « Équipe Nord »   ← vit dans l'URL
    │   │   └── DrillTrail                                  (slice-local — chemin de retour, US-5 critère 3)
    │   │       └── « Équipe Nord › Client   (niveau 2 de 2) »  chaque étape est un lien
    │   │
    │   └── ScopeDisclosure                              (slice-local — l'invariant B7, voir § 4 et § 9)
    │       ├── « 12 lignes dans votre périmètre. Total = somme de ces 12 lignes. »
    │       └── « Cette valeur n'est pas la valeur tous périmètres : elle n'est pas affichée. »
    │
    ├── DataTable  variante=drill  tri par contribution     (design-system §2 · DataTable) — 12 colonnes
    │   ├── thead  --text-overline, fond --color-surface-sunken, filet --color-border-strong
    │   │   ├── « Client »            (triable, par défaut : non trié)
    │   │   ├── « Contribution »      (triable — **tri par défaut, décroissant**)  --font-mono
    │   │   ├── « Part »              (triable)  barre = filet 2 px + « 20,5 % »  --font-mono
    │   │   ├── « vs cible »          (triable)  --color-out-of-band si négatif
    │   │   ├── « Rang vs période précédente »  (triable)  --text-body-sm
    │   │   └── « Calculé le »        (non triable)  --text-caption --font-mono
    │   ├── tbody  lignes alternées --color-ink-100 #E4E8E6 / --color-background
    │   │   └── chaque ligne : libellé client + les 4 valeurs ci-dessus
    │   │       └── libellé = texte, jamais un lien, jamais un bouton  ← C2, écran en lecture seule
    │   └── tfoot  **ligne de total** — filet supérieur 2 px --color-accent, fond --color-surface-sunken
    │       ├── « Total — 12 lignes visibles »
    │       ├── « 1 043 800 € »   --font-mono, aligné à droite
    │       ├── « 100,0 % »
    │       └── « calculé le 02/09/2026 04:12 · mat_ca_client_v2_2026-09-02 »
    │
    ├── « Aucune action corrective ici »  --text-caption --color-text-secondary
    │   └── « Cette ligne est celle sur laquelle agir. Amberline n'écrit pas dans l'ERP (C8) et ne saisit aucune donnée (C2). »
    │
    └── ProvenanceStrip  fixe en bas de page                (design-system §2 · ProvenanceStrip)
        └── « CA par client · version 2 signée le 28/08/2026 par Y. Benali · calculé le 02/09/2026 04:12
              · source mat_ca_client_v2_2026-09-02 · exporté par — »   ← B5, permanent, jamais une infobulle
```

| # | Composant | Rôle | Source |
|---|---|---|---|
| 1 | `AppShell` + `Sidebar` | chrome de l'application, navigation de rang 1 à 4 | design-system §3.1, §3.2 |
| 2 | `Breadcrumbs` | `Indicateurs › CA par client › Décomposition` | design-system §3.3 |
| 3 | `IndicatorTile` (`sm`, `official`) | la valeur agrégée que l'on décompose, avec cible, écart, date de calcul et source. **La ligne `threshold` n'y est pas rendue** : c'est une décision écrite (§ 9.2, point 1), et la **couleur sémantique** — elle — est bien celle de `design-system` § 2 | design-system §2 · IndicatorTile, § 2.1 `ThresholdMachine` |
| 4 | `PeriodScopeBar` (2 × `FormField select`) | période et équipe, **écrites dans l'URL** ; changement de périmètre sans changer ses droits | design-system §4.2 (« barre de périmètre ») + §2 · FormField |
| 5 | `DrillTrail` | chemin parcouru et étape courante, retour en arrière à chaque niveau | slice-local (US-5 critère d'acceptation 3) |
| 6 | `ScopeDisclosure` | énonce le nombre de lignes visibles et l'invariant « total = somme des lignes visibles » | slice-local (B7, E10) |
| 7 | `DataTable` variante `drill` | les lignes qui composent l'indicateur, triées par contribution, avec la colonne `part` | design-system §2 · DataTable |
| 8 | `ProvenanceStrip` | version signée, date de signature, date de calcul, source — permanent, pas une infobulle | design-system §2 · ProvenanceStrip |
| 9 | `ProvenanceStrip` (rang 2) | une bande par ligne de table est hors budget : la bande porte la version et la source de la **matérialisation interrogée**, identique pour toutes les lignes d'un même `source_ref` | design-system §2 · ProvenanceStrip |

> **Pas d'`ExportPanel` sur cet écran au MVP.** US-9 est portée par l'écran `tableau-de-bord`. Ce n'est pas un oubli : un export de décomposition creadosait un second chemin vers la donnée, donc un second point à prouver pour B7 (E10). Quand l'export de drill-down arrivera, il **héritera du périmètre de la table telle qu'elle est rendue** — pas d'un paramètre de filtre resaisi.

> **Ce que ce bandeau ne rend pas, et pourquoi c'est écrit.** Il ne rend ni le slot `threshold`, ni les états `out_of_band_alerting`, `out_of_band_alerted`, `threshold_latched`, `threshold_armed` — c'est-à-dire ni la ligne de seuil, ni la mention « alerte de ce passage / déjà signalé / hors zone depuis le 2ᵉ passage », ni le compteur de passages, ni la ligne « seuil réarmé le … ». C'est une **décision**, pas un silence, et elle est reprise en § 4 et en § 9.2 (point 1). Elle ne repose sur aucune répartition de versions : au MVP, **aucun** écran du produit ne rend la machine à états (V1, `roadmap.md` § 2.1, § 2.2, § 3.1), et celui-ci n'aurait rien à changer dans cette version non plus — sa décision est donc la même quelle que soit la version, ce qui est la meilleure propriété qu'une décision d'écran puisse avoir. En revanche la **couleur sémantique** est bien celle du composant : un indicateur hors cible reste en `--color-out-of-band` sur `--color-out-of-band-subtle` avec `triangle-alert`, un indicateur dans la cible reste en `--color-text-primary` avec le badge « dans la cible ». L'écran ne dit donc **jamais** qu'un indicateur est dans la cible quand il ne l'est pas, ni l'inverse.

---

## 4. États — tous, sans exception

| État | Déclencheur | Rendu | Feedback utilisateur |
|---|---|---|---|
| **Chargement** | ouverture, ou changement de `periode` / `equipe` / `niveau` dans l'URL | `IndicatorTile` en état `loading` : skeleton **de la forme du chiffre**, hauteur 96 px conservée, plus une ligne pour la date. `DataTable` en état `loading` : 12 lignes skeleton, hauteur de ligne conservée, en-têtes déjà présents et déjà triés. `ProvenanceStrip` masquée (elle ne porte que des faits, pas des barres de progression) | Aucune barre de progression : un indicateur de progression qui avance pendant un calcul dont on ignore la durée est un mensager de plus. Le skeleton est la réponse, il tient la page stable |
| **Rempli** | la source a répondu et la requête a été filtrée par le périmètre du lecteur | bandeau de tête + table remplie + `ScopeDisclosure` énonçant « 12 lignes dans votre périmètre ». **Invariant vérifié à l'affichage** : la ligne de total porte exactement la somme des lignes rendues et la somme des `part` vaut 100,0 % ; si l'invariant est rompu, l'écran n'est **pas** rendu dans cet état — il bascule dans « Erreur de chargement » avec le motif `SCOPE_TOTAL_MISMATCH`. **La tuile rend la valeur et son écart, pas le franchissement** : ni ligne `threshold`, ni badge `bell-ring`, ni compteur de passages, ni mention de réarmement — au MVP comme en V1, la machine étant en V1 et l'absence de la ligne de seuil étant une décision d'écran de toute façon (§ 9.2, point 1). La couleur sémantique, elle, est bien celle du composant (`design-system` § 2) — la tuile affiche `out_of_band` avec `triangle-alert` quand la valeur est hors cible, et l'apparence « dans la cible » quand elle y est. Décision écrite en § 9.2 (point 1) | Aucun. Un chiffre juste n'a pas besoin d'être célébré. Le retour perceptible est l'apparition du contenu à sa place, en 90 ms. **Aucun toast, aucune bannière, aucune animation** ne vient dire quoi que ce soit du franchissement : cet écran n'en rend rien, donc il n'a rien à annoncer |
| **Vide — jamais visité** | impossible sur cet écran | **Rendu identique à « Rempli » avec le tableau masqué.** Une décomposition est toujours atteinte depuis une tuile qui a déjà une valeur. Si l'URL est atteinte en direct sans historique, c'est l'état suivant qui s'applique | — |
| **Vide — aucune donnée** | la source ne renvoie **aucune ligne** sur la période (E2) | `DataTable` état `empty-no-data` : **aucun chiffre, aucun `0`**, aucun `—`. Texte : « Aucune donnée sur la période. » puis « Élargir à septembre 2026 » (bouton qui écrit `periode=2026-09` dans l'URL). `IndicatorTile` en état `no_data` : « aucune donnée sur la période ». La `ProvenanceStrip` reste affichée, elle est datée | Le bouton propose **une** période voisine, la plus proche, pas un calendrier. Un état vide qui demande de l'exploration est un état vide raté |
| **Erreur de chargement** | source injoignable (503), requête refusée par le périmètre, ou **invariant rompu** | `DataTable` état `error` : « La décomposition n'a pas pu être calculée. » + bouton `Réessayer`. Distinct de E1 : la tuile porte alors `source_unavailable` avec la dernière valeur connue, mais **la table n'affiche aucune dernière décomposition** — un détail de lignes ancien affiché sans le dire serait une affirmation fausse sur le présent. En cas de violation d'invariant, le même rendu, plus une ligne en `--color-source-unavailable` : « Contrôle d'intégrité du périmètre échoué — l'affichage a été interrompu. » | `Réessayer` est un bouton, pas un lien rechargé : il rejoue la requête **avec le périmètre courant de l'URL**, il ne devine pas. Le message ne dit jamais « accès refusé » : un 403 dirait à qui il faut demander et un 404 ne le dit pas |
| **Erreur de soumission** | seule « soumission » de l'écran : le changement de `periode` ou de `equipe` dans l'URL. Paramètre invalide, période absente de la source, ou niveau de décomposition inexistant | **Erreur au champ**, sous le `FormField` concerné : « Cette période n'existe pas dans la source. » Le périmètre **précédent reste actif et rendu** — l'écran ne se vide pas pour une saisie invalide. Aucun toast | Le focus revient sur le champ fautif, anneau `--color-border-focus` 2 px. La perte de saisie est impossible : la seule saisie est un choix parmi des valeurs existantes |
| **Succès** | le changement de périmètre a été appliqué | Le contenu est **remplacé en place** (`--duration-fast` 90 ms), jamais empilé. La nouvelle `date de calcul` apparaît immédiatement dans la ligne de total et dans la `ProvenanceStrip`. Un bandeau non bloquant de 5 s : « août 2026 chargée — calculée le 02/09/2026 04:12 », puis silence : la permanence de la `ProvenanceStrip` prend le relais | Aucun toast. La confirmation d'un changement de périmètre est la nouvelle date de calcul, qui est de toute façon un fait permanent (B5) |
| **Hors-ligne / permissions** | **E5** — l'indicateur n'est pas visible pour ce lecteur : l'écran **n'est pas rendu**. Réponse 404 identique à celle d'un `slug` inexistant (indistinguable, l'existence d'une ressource n'est pas divulguée), refus journalisé côté serveur avec l'identité résolue, la ressource visée et le motif. **E10** — le lecteur a le droit sur 12 clients et pas sur 15 : **aucune ligne des 15 ne figure dans le HTML, le payload, le `source_ref` exposé, ni le journal** ; le total affiché est l'agrégat des 12 lignes visibles et la somme des `part` vaut 100,0 % de cet agrégat. Le nombre total de lignes **n'est jamais indiqué** : ni « 12 sur 27 », ni « 15 lignes restreintes », ni un compteur de résultats paginé | Aucun message d'explication, aucun placeholder, aucune ligne grisée : ces trois rendus **confirment l'existence** de ce qui est retiré, ce qu'E5 interdit. Le seul effet visible est une décomposition plus courte et un total plus petit, ce qui est exactement la bonne nouvelle |
| **Lecture seule** | toujours, sans exception : C2 interdit toute saisie de données métier, et B15 interdit d'élargir le périmètre depuis le drill-down | Aucun libellé de ligne n'est un lien, un bouton ou un champ. Le sélecteur de période n'accepte que des périodes **présentes dans la source**, jamais une saisie libre. Le sélecteur d'équipe propose l'intersection entre les équipes du lecteur et les équipes de l'indicateur, jamais la liste complète avec des entrées désactivées | Un désactivé sans raison lisible est un refus sans explication : s'il faut filtrer, l'écran affiche `SCOPE_DENIED` avec la liste des équipes manquantes, ce qui est un 403, pas un élément d'interface fantôme |

---

## 5. Interactions

| Élément | Événement | Comportement | Feedback visuel | État résultant | ID |
|---|---|---|---|---|---|
| `IndicatorTile` (bandeau de tête) | `tap` / `Enter` | remonte au détail de l'indicateur (écran précédent) | `--duration-fast` sur le changement de contenu | navigation, 2e saut conservé | US-5 |
| `FormField select` période | `change` | écrit `periode` dans l'URL (`replace`, pas `push` : le retour arrière ne doit pas s'arrêter à chaque période) puis relance la requête **avec le périmètre de l'URL** | champ en état `loading` très court, contenu remplacé en 90 ms | Chargement → Rempli / Vide — aucune donnée / Erreur de chargement | B5, B15 |
| `FormField select` équipe | `change` | écrit `equipe` dans l'URL. Si l'équipe demandée sort du périmètre du lecteur, la requête est **refusée serveur** avant tout appel à l'entrepôt | message au champ : « Vous n'avez pas accès à cette équipe. » — `SCOPE_DENIED`, pas d'élément désactivé | Erreur de soumission, périmètre précédent conservé | B7, B15 |
| `DataTable` en-tête `Contribution` | `tap` / `Enter` / `Space` | bascule le tri décroissant ↔ croissant. Le tri est **sur la contribution**, jamais sur le libellé : un tableau de contributions trié par ordre alphabétique ne répond pas à la question posée | icône de tri en `--color-text-secondary` + `aria-sort="descending"` annoncé | Rempli, ordre réordonné sans requête (tri local sur le jeu déjà filtré) | US-5 |
| `DataTable` en-tête `Part` | `tap` | même comportement ; la barre de 2 px se réaligne sur le nouveau tri | idem | Rempli | US-5 |
| `DataTable` en-tête `Calculé le` | — | **non triable** : toutes les lignes d'une décomposition partagent la même matérialisation, un tri sur cette colonne est une opération vide | en-tête sans affordance de tri, curseur `default` | — | B5 |
| `DataTable` ligne — libellé client | `tap` / `Enter` | **aucune action**. Ce n'est pas un lien. L'écran ne permet ni d'ouvrir, ni de modifier, ni d'exporter la ligne (C2) | aucun retour visuel : le libellé n'a pas d'état survol autre que la couleur de fond de ligne alternée | Rempli inchangé | C2 |
| `DataTable` ligne — `vs cible` négative | survol / focus | met en évidence la ligne par un filet gauche 2 px `--color-out-of-band` + le texte « − 18 400 € vs cible » (jamais la couleur seule) | filet + texte, `--duration-fast` | Rempli | B11, B14 |
| `DrillTrail` étape | `tap` / `Enter` | remonte d'un niveau de décomposition ; le niveau est écrit dans l'URL (`niveau=client`), donc le retour arrière du navigateur et le bouton « précédent » du navigateur donnent le même résultat | l'étape courante passe en `--color-accent`, l'étape visée devient le lien | Chargement → Rempli, niveau précédent | US-5 |
| `DrillTrail` — dernier niveau | survol | si l'indicateur a plus de deux niveaux, une mention indique « niveau 3 de 3 » ; sinon « dernier niveau disponible ». Le Manager ne découvre pas la profondeur en ratant des écrans | texte `--text-caption` sous le chemin | Rempli | US-5 |
| Bouton « Élargir à septembre 2026 » (état Vide — aucune donnée) | `tap` | écrit `periode=2026-09` dans l'URL et relance | remplacement du contenu en 90 ms | Chargement → Rempli | E2 |
| Bouton `Réessayer` (état Erreur de chargement) | `tap` | rejoue la requête avec le périmètre courant de l'URL, sans jamais l'élargir | bouton en état `active` 90 ms, puis Chargement | Chargement → Rempli / Erreur de chargement | B8, B15 |
| `ScopeDisclosure` | survol / focus clavier | il est déjà permanent ; le survol n'ajoute rien. Il est focusable uniquement pour qu'un lecteur d'écran puisse le relire au clavier, et son contenu est dans le flux de lecture, pas dans un attribut | anneau `--color-border-focus` 2 px | Rempli inchangé | B7, E10 |
| Copier-coller de la page (`Ctrl+A`) | sélection | le presse-papiers contient **exactement** les lignes rendues. Aucune ligne hors périmètre n'est dans le DOM, donc aucune n'est copiable | — | — | B7, E10 |

- **Focus / clavier** : ordre `Sidebar` → `Breadcrumbs` → `DrillTrail` (lien) → sélecteur de période → sélecteur d'équipe → `IndicatorTile` (lien, une tabulation) → en-têtes de colonne triables (4, `Tab` entre chaque, `Enter`/`Space` pour basculer) → **une seule tabulation pour tout le tableau**, puis navigation par `↑` `↓` entre lignes, `Home`/`End` pour la première et la dernière ligne, `PageUp`/`PageDown` par 10 lignes → lien « Voir la décomposition » du détail → `ProvenanceStrip` (focusable, lisible). Le focus revient au dernier élément parcouru à la sortie du tableau par `Tab`. Raccourci `/` : place le focus sur le sélecteur de période. Survol de la souris : **jamais** requis — le survol ne porte aucune information, tout est dans le rendu permanent (anti-règle : une donnée de contrôle ne vit pas dans un état caché).
- **Gestes** : **aucun.** Pas de swipe, pas de pull-to-refresh, pas de long-press. Un pull-to-refresh afficherait l'heure du dernier rafraîchissement local, or B5 impose la date de calcul **prise dans la source** : le geste aurait pour effet d'écrire un faux `computed_at` à l'écran. C'est une raison métier, pas une préférence d'implémentation.
- **Animations** : `--duration-fast` 90 ms / `--ease-default` sur le seul remplacement de contenu ; `--duration-normal` 160 ms sur l'apparition d'un état vide. **Aucune animation sur une valeur chiffrée** : pas de compteur, pas de défilement, pas de `count-up` (design-system §1.6). Le seul mouvement autorisé sur la donnée est le changement de couleur sémantique d'un filet, en `--duration-normal`.
- **Retour arrière** : le navigateur remonte au détail de l'indicateur, périmètre restauré par l'URL (`periode`, `equipe`, `niveau`). Le contexte n'est jamais perdu, parce qu'il n'a jamais été dans un store.

---

## 6. Responsive

| Breakpoint | Comportement | Ce qui se replie / disparaît |
|---|---|---|
| **Mobile `≤ 640px`** | Rendu **autorisé en lecture seule** (le design system le prévoit ; US-15 reste en V2, donc le MVP ne le livre pas et ce rendu est décrit pour ne pas être découvert plus tard). Sidebar absente, pas de tiroir. Une seule colonne. `IndicatorTile` en `sm` pleine largeur. `DataTable` transformée en **liste de cartes de ligne** : libellé en `--text-h3`, puis les 4 valeurs en paires `libellé → valeur` empilées ; la colonne `Calculé le` remonte dans la `ProvenanceStrip`, qui n'est plus fixe. `part` passe en `--text-h3` 15 px (lecture confort, `--text-body` 14 px minimum, jamais 12 px pour une valeur) | La colonne `Rang vs période précédente` disparaît (c'est le seul signal qui sert le tri par contribution, pas la comparaison dans le temps). Le tri par contribution reste proposé en premier dans le sélecteur. Aucun contrôle n'est caché : la seule chose qui disparaît est une colonne, pas une action |
| **Tablet `641–1024px`** | Sidebar absente (elle ne tient pas sans réduire la table de 4 colonnes, et réduire la table revient à sacrifier `Part`). Bandeau de tête sur 2 lignes : `IndicatorTile` `sm` en 6 colonnes, `PeriodScopeBar` + `DrillTrail` + `ScopeDisclosure` en 6 colonnes. `DataTable` sur 12 colonnes, `Calculé le` passe en largeur fixe 132 px et ne se tronque plus | Le libellé de la colonne `Calculé le` devient `Calculé` + infobulle native. `Rang vs période précédente` est conservée (la tablette est le format « salle de réunion » du design system, pas un format de consultation personnelle) |
| **Desktop `≥ 1025px` (jusqu'à 1600)** | Layout « Page standard » : bandeau de tête sur 1 ligne (`IndicatorTile` 3 col + périmètre 9 col), `DataTable` sur 12 colonnes, première colonne (`Client`) figée en 132 px, valeurs alignées à droite en `--font-mono` à chasse fixe. `ProvenanceStrip` fixe en bas de page, hauteur 40 px, toujours visible | Rien ne disparaît. C'est le format de travail du manager |
| **Comité projeté `≥ 1601px`** | Identique au desktop avec deux écarts : le conteneur passe à la largeur maximale et la `DataTable` gagne 4 colonnes de confort (largeur de cellule, pas de colonnes nouvelles). `IndicatorTile` **reste en `sm`** — c'est la seule exception à la règle « `lg` en comité » du design system, et elle est délibérée : en `lg` (chiffre 56 px, hauteur 220 px) la tuile écraserait la table, qui est le contenu de cet écran. La lisibilité à 3 m est assurée par la taille des chiffres du tableau, pas par celle de l'en-tête | Le `DrillTrail` passe sur une ligne à côté du sélecteur d'équipe au lieu de se replier en dessous. La `ProvenanceStrip` reste fixe et gagne les 8 participants de la réunion dans une seconde ligne |

- **Cible tactile** : 44 × 44 px minimum sur tous les éléments actionnables (en-têtes de colonne triables, lignes, sélecteurs, boutons). Dans `DataTable` en densité `sm`, la hauteur de ligne est de 44 px **au MVP desktop** pour garantir la cible ; si la densité `sm` de 36 px est appliquée, la zone cliquable de 44 px est superposée par un pseudo-élément, jamais au prix d'une réduction du texte.
- **Débordement** : **garanti de ne jamais déborder** — (1) toute valeur chiffrée est rendue en `--font-mono` dans une colonne de largeur fixe avec `tabular-nums` et `overflow: hidden` + ellipse ; un chiffre ne passe jamais à la ligne, donc une cellule ne peut pas élargir la table ni décaler les autres ; (2) la `ProvenanceStrip` tronque son `source_ref` par la **fin** de la chaîne (l'identifiant de fin est le discriminant) et conserve la date de calcul en entier, parce que c'est elle qui porte B5 ; (3) le libellé de client est la seule colonne élastique et porte l'ellipse en premier segment ; (4) aucune barre de défilement horizontale au-dessus de 1025 px ; en dessous, le tableau se transforme en cartes, pas en scroll horizontal — un tableau qu'on fait défiler latéralement en séance projetée n'est pas un tableau lisible.

---

## 7. Accessibilité

- [x] Contraste **11,3:1** pour le texte courant — `--color-text-primary` `#2C3633` sur `--color-background` `#F2F4F3` (mesuré ; largement au-dessus du seuil AAA).
- [x] Contraste **7,1:1** pour l'accent `--color-accent` `#0F5C57` sur le fond — mesuré. La valeur du total et l'étape courante du `DrillTrail` sont donc lisibles à 3 m sans thicken la police.
- [x] Contraste **5,4:1** pour l'écart hors cible — `--color-out-of-band` `#B23A2E` sur `--color-background`, et **4,7:1** sur son fond `--color-out-of-band-subtle` `#F6E1DE` (mesuré). Au-dessus de 4,5:1 dans les deux cas.
- [x] Contraste **4,8:1** pour « fraîcheur inconnue » — `--color-unknown` `#7A6A3C` sur `--color-background` (mesuré). C'est le seul état d'incertitude du produit ; il ne doit pas descendre sous 4,5:1.
- [x] Navigation clavier complète sur **desktop, tablette et mobile** : tableau en `role="grid"` avec `aria-rowcount` = nombre de lignes **visibles** (jamais le nombre total), `↑ ↓ Home End PageUp PageDown` pour les lignes, `Enter`/`Space` sur les en-têtes de colonne triables avec `aria-sort` annoncé.
- [x] Focus visible : anneau `--color-border-focus` `#0F5C57` 2 px, **jamais supprimé** (`outline: none` interdit), y compris sur la ligne de total et sur la `ScopeDisclosure`.
- [x] ARIA : `aria-describedby` relie chaque ligne à sa valeur `vs cible` (la couleur seule ne porte rien) ; `aria-live="polite"` sur le bandeau de changement de périmètre (« août 2026 chargée — calculée le 02/09/2026 04:12 ») ; `aria-busy="true"` pendant le chargement de la table, ce qui évite l'annonce de chaque skeleton ; `role="status"` sur l'état d'intégrité (`SCOPE_TOTAL_MISMATCH`) car c'est un **refus** d'affichage, pas une information décorative.
- [x] Alternatives textuelles : **aucune image, donc aucune alternative à produire.** Les trois seules icônes de l'écran (hors cible, fraîcheur inconnue, source indisponible) sont des icônes de police décoratives, marquées `aria-hidden="true"`, **toujours doublées d'un texte** — « hors cible », « fraîcheur inconnue », « source indisponible ». Aucune information n'est portée par la couleur seule (PRD § 7.3).
- [x] Langue et direction de lecture correctes : `lang="fr"`, `dir="ltr"`, format de date `jj/mm/aaaa hh:mm` et format monétaire `fr-FR` (`1 043 800 €`, espace insécable, jamais `1,043,800.00`). Les noms de clients ne sont pas traduits ; le `source_ref` est affiché tel quel, jamais traduit ni réécrit.
- [x] **Contraste du texte secondaire, recalculé sur la valeur du token** : `--color-text-secondary` `#4F5C57` vaut **6,33:1** sur `--color-background` `#F2F4F3`, **5,66:1** sur la ligne alternée `--color-ink-100` `#E4E8E6`, **5,92:1** sur `--color-surface` `#E9EDEB` et **5,39:1** sur la surface creuse `--color-surface-sunken` `#DEE3E1` de l'en-tête et de la ligne de total : **conforme sur les quatre fonds réellement utilisés par cet écran**. La colonne `Calculé le` porte donc la `date de calcul` (B5) et le `source_ref` en `--color-text-secondary` `--text-caption` **sans restriction**, y compris sur les lignes alternées ; l'alternance des lignes reste `--color-ink-100` / `--color-background` sur toutes les colonnes, sans traitement par colonne. Les deux règles d'usage qui figuraient ici — (1) la date de calcul et le `source_ref` rendus en `--color-text-primary` partout, (2) l'alternance passant à `--color-surface` sur les colonnes portant du secondaire — **sont supprimées** : elles dérivaient d'un 4,44:1 mesuré sur un couple couleur/fond qui n'existe pas dans le design system. `--color-text-secondary` est conforme partout ici, donc le pousser vers le primaire n'était qu'une dégradation.

---

## 8. Données

| Champ | Type | Origine | Requis | Erreur possible |
|---|---|---|---|---|
| `indicator_slug` | slug kebab-case | URL | oui | `404` — indistinguishable d'un indicateur interdit (E5) |
| `definition_version_id` | uuid | serveur | oui | absent → l'indicateur n'est pas officiel, la `ProvenanceStrip` porte « non officiel » et le `source_ref` n'est pas affiché |
| `periode` | `AAAA-MM` | query param | oui | période absente de la source → `422` au champ `FormField`, périmètre précédent conservé |
| `equipe` | slug | query param | non (défaut : périmètre du lecteur) | équipe hors périmètre → `403 SCOPE_DENIED` avec la liste des équipes manquantes |
| `niveau` | enum `equipe` \| `client` | query param | non (défaut `client`) | niveau inexistant pour cette définition → `422` au champ |
| `value` | decimal | source (entrepôt) | oui | `null` → état `no_data` (E2), **jamais `0`** |
| `target` | decimal \| `null` | version signée de la définition | non | `null` → badge « cible à reconfirmer », `--color-unknown` (E16) |
| `computed_at` | timestamp UTC | **snapshot dans l'entrepôt** | oui | `null` → `--color-unknown`, mention « fraîcheur inconnue », **jamais l'heure du poste** (B6) |
| `source_ref` | identifiant de matérialisation | serveur | oui | absent → la ligne de total porte « source non identifiée » en `--color-source-unavailable`, pas un identifiant reconstruit |
| `rows[]` | tableau de lignes **déjà filtrées** | serveur, après `withScope()` | oui | `[]` → E2 ; jamais de page de lignes non filtrée renvoyée au client puis masquée |
| `rows[].key` | identifiant de ligne de l'entrepôt | serveur | oui | **jamais** présent pour une ligne hors périmètre : il n'est pas « masqué », il n'est pas produit |
| `rows[].label` | chaîne | source | oui | libellé vide → la cellule affiche l'identifiant en mono, pas une ligne blanche |
| `rows[].contribution` | decimal | source | oui | `null` sur une ligne → la cellule affiche `—` et la ligne est comptée avec un écart explicite ; elle n'est pas exclue du total en silence |
| `rows[].share` | decimal 0–100 | serveur, sur le total **restreint** | oui | somme ≠ 100,0 % → invariant rompu, écran non rendu |
| `rows[].delta_vs_target` | decimal | serveur | non | `null` si pas de cible → cellule neutre, jamais verte |
| `total_visible` | decimal | **somme des lignes rendues**, calculée par la même requête que `rows[]` | oui | ≠ somme de `rows[]` → invariant rompu, écran non rendu |
| `visible_line_count` | entier | serveur | oui | n'est **jamais** accompagné du nombre total de lignes du périmètre : ce nombre est lui-même une fuite (E10) |
| `is_official` | booléen | version signée courante | oui | `false` → `IndicatorTile` variante `provisional`, `--color-stale`, badge « non officiel » (B13) |

- **Chargement** : **tout d'un bloc.** Une décomposition se lit d'un seul tenant — paginer un tableau de contributions force le lecteur à reconstruire mentalement le total qu'il doit comparer. Si le volume dépasse 500 lignes, le rendu s'arrête à 500 et **le dit** : « Affichage limité aux 500 premières lignes de votre périmètre. Le total porte la totalité de vos lignes. » Le nombre global de lignes n'est **jamais** annoncé, y compris dans cette phrase : « 500 sur 1 284 » est une fuite E10. Un total partiel présenté comme complet est le défaut que E11 interdit sous une autre forme. La ligne de total est toujours la dernière ligne du `DataTable`, jamais au-dessus.
- **Cache / hors-ligne** : le dernier résultat déjà rendu **reste affiché et daté**, avec le bandeau `source_unavailable` et son `--color-source-unavailable` (#5B5B63, 6,1:1 sur le fond). Le cache ne contient que des lignes **déjà filtrées par le périmètre de la session** ; il est vidé à la déconnexion et à la perte d'un droit, jamais partagé entre deux identités (E14). Aucune requête en attente de rafraîchissement ne remplace la date de calcul affichée par l'heure du fetch.
- **Ce que la réponse ne porte pas, et c'est une décision** : ni `threshold`, ni `threshold_state`, ni `threshold_crossed_at`, ni `threshold_alerted_at`, ni `threshold_rearmed_at`. L'écran ne les reçoit donc pas et n'a rien à en rendre (§ 3, § 4, § 9.2 point 1). Ce n'est pas un oubli de lecture : le franchissement est évalué sur la séquence de snapshots du **produit**, il appartient aux écrans qui surveillent (`indicateurs`, `tableau-de-bord`) et à l'écran qui explique un indicateur (`indicateur-detail`), et non à celui qui explique **des lignes**. Le renvoyer ici aurait un coût de cohérence — une seconde évaluation de la machine, avec ses horodatages, dans une requête dont le contrat est « des lignes et leur total ». Cette absence est donc **définitive**, et non pas une question de version : en V1, la réponse de cette requête restera identique.
- **Données sensibles** : **jamais** rendues, jamais journalisées. La liste des lignes hors périmètre n'existe pas dans la réponse, le HTML, le `source_ref` exposé, le cache, ni le journal (B7, B25). Un refus journalise l'**identité**, la **ressource visée** (`indicator_slug`) et le **motif** — jamais le détail des lignes, jamais le nombre de lignes retirées, jamais un identifiant de client. Aucune valeur chiffrée n'est écrite dans une erreur technique ni dans une trace applicative : une 5xx porte l'identifiant de requête et le `error_code`, rien d'autre. Chiffrement au repos et isolation par ligne au stockage sont un prérequis de mise en production (C10) : cet écran n'est pas livrable sans eux, il est le premier par lequel on essaierait de les contourner.

---

## 9. Traçabilité

| ID | Origine | Manifestation sur cet écran |
|---|---|---|
| US-5 | PRD | § 3 : `IndicatorTile` → `DrillTrail` → `DataTable drill`. § 4 état Rempli. § 5, ligne `DrillTrail` : chaque niveau est dans l'URL, donc le retour arrière du navigateur reproduit le chemin. Atteint en 2 sauts depuis la tuile, écart d'archétype assumé (`benchmarks.md` § 3) |
| US-7 | PRD | § 4 « Hors-ligne / permissions » : l'écran **n'est pas rendu** (E5, 404 indistinguable). § 4 Rempli : invariant `total = somme des lignes rendues` vérifié avant affichage. § 5 : `Ctrl+A` ne copie que le DOM rendu. § 8 : `rows[]` est filtré serveur, jamais filtré au client |
| B5 | PRD | § 3 : `ProvenanceStrip` permanente en bas de page + slot `computed_at` de la tuile + colonne `Calculé le` + `source_ref` en mono dans la ligne de total. § 4 Succès : la nouvelle date de calcul apparaît immédiatement. § 5 Gestes : pull-to-refresh interdit **parce qu'il afficherait l'heure du poste**. § 7 : la date est en `--color-text-secondary` `#4F5C57`, 6,33:1 sur le fond — la restriction qui avait été écrite ici reposait sur une valeur abandonnée |
| B7 | PRD | § 3 : `ScopeDisclosure` énonce le périmètre et l'invariant. § 4 : l'état « Hors-ligne / permissions » décrit les deux branches (E5, E10) et l'absence de tout compteur global. § 8 « Données sensibles ». § 9bis ci-dessous : traitement explicite du total recalculé |
| B15 | PRD | § 3 : la `PeriodScopeBar` ne propose que la **restriction** du périmètre d'origine, jamais un élargissement. § 5 : `équipe` hors périmètre → `403 SCOPE_DENIED` **avant** tout appel à l'entrepôt. § 4 « Erreur de soumission » : le périmètre précédent reste actif |
| E2 | PRD | § 4 « Vide — aucune donnée » : `DataTable` état `empty-no-data`, `IndicatorTile` état `no_data`. **Aucun `0`, aucun `—`, aucune liste vide** ; la commande propose une période voisine précise. Distinct de `filtered-to-zero`, qui n'existe pas ici : l'écran n'a pas de filtre propre |
| E5 | PRD | § 4 « Hors-ligne / permissions » : aucun rendu, aucun placeholder, aucune ligne grisée, 404 indistinguable d'un `slug` inexistant, refus journalisé côté serveur avec identité + ressource + motif. § 3 : `IndicatorTile` n'est pas rendu en `permission_denied` — le composant disparaît, il ne se remplit pas |
| E10 | PRD | § 4 « Hors-ligne / permissions » + § 4 « Rempli » + § 3 (`ScopeDisclosure`, ligne de total) + **§ 9.1 ci-dessous** |
| E11 | PRD | § 4 « Rempli » et « Erreur de chargement » : aucune décomposition partielle n'est rendue comme complète. La valeur et la date de la dernière décomposition connue **ne sont pas** proposées en repli dans la table, parce qu'un détail de lignes sans le dire est une affirmation fausse sur le présent ; seul l'état `computation_too_long` de la tuile porte la dernière valeur connue, datée, avec la mention « calcul en cours, trop long » |
| C2 | PRD | § 4 « Lecture seule » + § 5 (le libellé de ligne n'est ni lien ni bouton) : l'écran ne saisit aucune donnée métier |
| C8 | PRD | § 3 : la mention « Amberline n'écrit pas dans l'ERP » — l'écran rend la ligne fautive, pas une action corrective |
| C10 | PRD | § 8 « Données sensibles » : chiffrement au repos et isolation par ligne sont un prérequis de mise en production, pas une amélioration |
| Flow `investigation` | Boucle `dashboard` | Étape 3 de **surveiller → détecter → investiguer**. Cet écran est l'extrémité de la boucle : il se termine sur une ligne identifiée, pas sur une action. Le `flow` est donc fermé ici et ne se prolonge pas vers un écran de correction — il n'y en a pas (C8) |

### 9.1 Le défaut le plus grave de cet écran, traité explicitement

**Un total recalculé qui ne correspond pas aux lignes visibles.** C'est le seul défaut de cet écran qui ne soit pas un défaut d'affichage : il **divulgue l'existence de lignes que le lecteur n'a pas le droit de connaître** (B7, E10). Un lecteur autorisé sur 12 clients et pas sur 15 verrait un total agrégé supérieur à la somme de ce qu'il voit, et en déduirait qu'il existe autre chose — l'existence d'une information, pas sa valeur, mais déjà une fuite.

Le traitement retenu, à trois niveaux :

1. **Architecture du rendu.** Le total est produit par **la même requête** que les lignes, par le même `withScope()`. Il n'existe aucun chemin de code qui puisse produire l'un sans l'autre. Un « total au-dessus du tableau » serait un second chemin : c'est la raison pour laquelle le total est une ligne de table.
2. **Invariant vérifié avant affichage.** `somme(rows[].contribution) == total_visible` **et** `somme(rows[].share) == 100,0 %`. L'écart est calculé en amont et non présenté comme un arrondi : les `part` sont arrondies à l'affichage, l'invariant est vérifié sur les valeurs non arrondies.
3. **Comportement en cas d'écart.** L'écran n'est **pas** rendu dans l'état « Rempli ». Il bascule dans « Erreur de chargement » avec le motif interne `SCOPE_TOTAL_MISMATCH`, journalisé avec l'identité, l'indicateur, la période et le périmètre — jamais avec le détail des lignes (B25). **Aucun affichage dégradé, aucun total estimatif, aucune ligne marquée « masquée ».** Afficher quelque chose qui fuit ici est pire que de ne rien afficher : un écran cassé se signale, une fuite ne se voit jamais.

Ce que l'écran **ne fait jamais** dans ce cas : indiquer le nombre total de lignes, indiquer un nombre de lignes restreintes, proposer un filtre « afficher les lignes masquées » (qui n'existe pas), ou afficher un total « tous périmètres » en regard. Les quatre sont des fuites déguisées en fonctionnalités.

### 9.2 Écarts et arbitrages ouverts

| # | Point | Ce qui a été fait dans cet écran | Arbitrage attendu |
|---|---|---|---|
| 1 | **Cet écran rend-il la machine de franchissement ? — NON, et c'est une décision écrite — qui est de surcroît rendue sans effort par le calendrier** | Le bandeau de tête rend **six slots sur sept** : `label`, `value`, `target`, `computed_at`, `source_ref`, `status`. Le slot `threshold` n'est **pas** rendu, donc ni ligne de seuil, ni badge `bell-ring`, ni mention « alerte de ce passage / déjà signalé / hors zone depuis le 2ᵉ passage », ni compteur de passages, ni « seuil réarmé le … ». Cinq raisons, dans cet ordre. (a) **La tuile est un bandeau d'identification, pas une cellule de surveillance** : elle nomme l'indicateur qu'on décompose et sert de lien vers le détail (§ 5) ; elle ne répond pas à « est-il hors cible ? », elle répond à « quelle valeur suis-je en train de décomposer ? ». (b) **La question de l'écran est une question de lignes** : US-5 demande quelles lignes composent la valeur. Le seuil est une propriété de la **définition**, pas des lignes. (c) **Là où le franchissement est rendu, c'est à un clic** : la tuile entière est un lien vers `indicateur-detail` ; `indicateurs` porte la boucle quotidienne et `tableau-de-bord` la séance projetée — **et les deux le font en V1, pas au MVP** (voir le point 3 de ce tableau et le § 9.2 des écrans concernés). Ce n'est donc plus un argument de confort : au MVP, **aucun** écran du produit ne rend la machine, et celui-ci est le seul où cela ne coûte rien, puisqu'il ne reçoit déjà pas les champs. (d) **La densité l'interdit** : la tuile est volontairement maintenue en `sm` (96 px) même au format projeté, « parce que la table est le contenu de cet écran » (§ 6) ; une septième ligne prendrait cette place à la `DataTable`, qui est ce qu'on est venu lire. (e) **La réponse ne contient pas les champs** (§ 8) : les rendre demanderait une seconde évaluation de la machine, avec ses horodatages, dans une requête dont le contrat est « des lignes et leur total ». **Ce qui n'est pas fait, et qui serait une faute** : garder la couleur du hors cible sans l'écrire quelque part, ou l'inverse. La couleur sémantique est bien celle du composant — `out_of_band` avec `triangle-alert`, sinon apparence « dans la cible » — donc **l'écran ne ment jamais sur le fait qu'un indicateur est dans la cible ou hors cible** ; il ne dit simplement pas *quand* le franchissement a eu lieu et si l'on a été prévenu | **Ce point n'a plus rien à trancher, et il n'y a plus d'alternative à trancher.** La ligne `threshold` n'est pas rendue ici pour une raison de place ni de version : elle ne l'est parce que le seuil est une propriété de la définition, que cette page répond à une question de lignes, et que la machine à états n'existe dans aucune version de ce produit avant la V1. Rendre la ligne `threshold` dans le bandeau de tête ne serait pas une variante : ce serait un **deuxième** endroit où écrire « seuil < … du … », donc un deuxième format de la même donnée, et c'est la faute que la règle de source unique interdit. La question distincte — une tuile hors cible sans la mention « déjà signalé » donne-t-elle au lecteur l'impression qu'une alerte va partir ? — a pour réponse écrite : non, parce qu'aucune alerte ne part d'ici, dans aucune version |
| 2 | **La couleur sémantique est rendue, la ligne de seuil ne l'est pas** — donc la même tuile n'a pas le même contenu sur cet écran et sur `indicateurs` | Volontaire, et borné à ce que la couleur peut porter : `--color-out-of-band` + `triangle-alert` dit « hors cible », rien de plus. Ce que la ligne `threshold` ajoute — la valeur du seuil, son sens et sa date au MVP, puis les horodatages de la machine en V1 — n'a pas d'équivalent sans date : un `--text-caption` « seuil < 96 % » sans sa date serait une affirmation sans date, donc invérifiable (B5) | **Aucun arbitrage, et il n'y en a plus besoin** : le point 1 est tranché, et la version du MVP est tranchée (§ 9.2 point 2 de `indicateurs.md`, `indicateur-detail.md` et `tableau-de-bord.md`). Au MVP, la différence entre cette tuile et celle d'`indicateurs` se réduit à **une ligne de seuil** qui manque ici ; en V1, elle se réduit à cette ligne plus les horodatages. L'écart est donc connu, borné, et il est écrit ici plutôt que subi |
| 3 | **La machine à états n'est rendue par aucun écran au MVP** — arbitrage du commanditaire, rendu dans les trois écrans du module | Cet écran n'a rien à faire pour s'y conformer, et c'est écrit : il ne rend déjà ni le slot `threshold` ni les états de la machine. `roadmap.md` § 2.1, § 2.2 et § 3.1 placent la machine **en V1** ; au MVP, l'état « hors cible / dans la zone » avec sa date de calcul est ce qui existe (B11, B14), et il est rendu ici comme partout | **Rien à trancher sur ce fichier.** Il est mentionné ici pour que la chaîne soit complète : les trois écrans `indicateurs`, `indicateur-detail` et `tableau-de-bord` portent chacun leur § 9.2 daté, et ce fichier n'en a pas besoin parce que sa décision était déjà la bonne |

---

## 10. Checklist de gate

- [x] Les 9 états sont décrits avec un rendu concret.
- [x] **Ce que cet écran rend et ne rend pas de `IndicatorTile` est écrit** : six slots sur sept, la couleur sémantique du composant conservée, l'absence de la ligne `threshold` justifiée et déclarée en § 9.2. Aucune énumération de surface n'est périmée, aucune n'est inventée. La tuile est maintenue en `sm` (96 px) à tous les breakpoints, donc le passage de la taille `md` à 172 px ne la concerne pas.
- [x] Chaque élément interactif a un comportement et un feedback.
- [x] Le responsive est défini à **chaque** breakpoint du design system.
- [x] La section Anti-générique est cochée et justifiée.
- [x] Aucune valeur de design n'est laissée à « à définir ».
- [x] Chaque ID B*/E*/C*/US de l'écran apparaît en section 9.
- [x] `node "$FORGE/scripts/forge-guard.js" placeholders <anchor>` ne signale rien ici.
- [x] L'écran reste cohérent avec `.forge/design/design-system.md`.