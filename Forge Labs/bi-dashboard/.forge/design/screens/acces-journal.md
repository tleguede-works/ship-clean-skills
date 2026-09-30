---
type: screen
slug: acces-journal
title: Accès et journal des consultations
module: acces
status: approved
generated_at: 2026-09-30
derived_from:
  - .forge/prd.md
  - .forge/design/design-system.md
rule_ids:
  - B10
  - B23
  - B25
edge_case_ids:
  - E14
flow: consultation-journal
---

# Écran — Accès et journal des consultations

> Ce document est la **source de vérité** pour qu'une IA génère l'interface de cet écran.
> Il est généré depuis ce gabarit, jamais recopié. Aucun placeholder ne doit subsister.

---

## 1. Rôle de l'écran

| | |
|---|---|
| **Archétype d'app** | `dashboard` ; surface d'administration de conformité — `DataTable` variante `reference`, densité `md`, standard `admin_crud` |
| **Module** | `acces` — rang **4**, dernier rang principal (`state.json → index.nav`) |
| **Route** | `/acces` — détail d'une ligne : `/acces?e=<identifiant>` ; composition d'un groupe : `/acces/groupes/[groupId]` |
| **Type** | `page` |
| **Utilisateurs** | Responsable conformité, DPO, auditeur externe (habilité nominativement). Le responsable d'équipe n'y entre pas : ce n'est pas son outil, et lui donner le journal le rendrait illisible et sans valeur probante. |
| **User stories servies** | US-8 |
| **Règles métier** | B10, B23, B25 |
| **Edge cases** | E14 |

**Une phrase** : cet écran permet au responsable conformité de **prouver qui a consulté quoi et qui a été refusé**, afin de répondre à un contrôle.

**Pourquoi il est au rang 4 de la navigation** : fréquence 1, centralité 4. L'usage réel est mensuel, ou déclenché par un contrôle. Le placer plus haut mettrait un écran de preuve au-dessus de la lecture quotidienne des indicateurs — et, plus grave, l'exposerait au regard de gens qui n'ont pas à le voir. Le rang 4 dit deux choses : c'est important, et ce n'est pas là où on travaille. C'est aussi le dernier rang principal, donc pas d'overflow « Plus » qui l'enterrerait — un écran de conformité qu'on ne trouve pas n'est jamais ouvert, et un journal jamais ouvert ne prouve rien.

> Le design system § 3.2 décrivait un plateau de 5 entrées (`explorer` au rang 3) ; `state.json → index.nav`, autorité du gate, n'en retient que 4. Ce écran suit `state.json` et l'écart est signalé au gate plutôt que tranché ici.

---

## 2. Direction visuelle de cet écran

Repris du design system — **valeurs concrètes, jamais « à définir »**.

| | |
|---|---|
| **Mood** | dense, sourcée, non décorative — ici « dense » signifie **auditable** : la densité permet de lire 40 consultations dans un seul écran sans perdre la ligne de vue, et chaque ligne doit pouvoir être citée telle quelle dans un rapport. |
| **Densité** | **dense**, hauteur de ligne 28 px, `--space-md` (8 px) entre cellules. Un journal n'est pas une page de lecture : c'est un tableau qu'on balaie du regard pour trouver une ligne, puis qu'on cite. L'alignement vertical strict des colonnes est prioritaire sur le confort de lecture. |
| **Niveau de contraste** | **fort**, et il y a une raison de domaine : les identités, les ressources et les horodatages doivent rester lisibles quand le journal est imprimé en noir et blanc pour un dossier de contrôle. Aucune information n'est portée par la seule couleur. |
| **Surface** | `--color-background` `#F2F4F3` ; barre de filtres et en-têtes de tableau en `--color-surface` `#E9EDEB` ; lignes alternées `--color-ink-100` `#E4E8E6` ; lignes `readonly` (hors droits du lecteur) en `--color-surface-sunken` `#DEE3E1` avec le texte en `--color-text-disabled` `#9BA6A2`. Filets `--color-border` `#C9D0CD` ; bordure de tableau dense `--color-border-strong` `#7E8A85`. **Aucune ombre** : `--shadow-sm` est réservé aux menus de filtre, `--shadow-lg` à l'export en cours de génération. |
| **Accent utilisé** | `--color-accent` `#0F5C57` — focus, en-tête de colonne triée, lien vers la ressource, bouton d'export. Il sert aussi à marquer une **sélection de lignes** (fond `--color-accent-subtle` `#D3E4E2`), jamais à signaler une consultation réussie. |
| **Traitement photographique** | **AUCUN** — pas d'avatar, pas de photo d'identité, pas d'icône d'utilisateur. Une identité est `Prénom NOM` + matricule en `--font-mono`. Un avatar rend le journal plus joli et moins probant : c'est une liste d'actes attribués, pas un répertoire de personnes. |
| **Référence** | la revue d'accès d'un SI bancaire — un journal technique dense, filtrable, exportable, où l'on ne.Flow embellit rien parce que la valeur probante est l'exactitude. |

### 2.1 Anti-générique — obligatoire

Cet écran ne doit ressembler **à aucun** de ces défauts :

- [x] **Pas de fond blanc pur `#FFFFFF` par défaut.** — Fond `#F2F4F3`, surfaces `#E9EDEB` / `#E4E8E6` / `#DEE3E1`. Le journal est un document de contrôle : un fond blanc « papier » ferait croire à une impression, alors qu'une impression est précisément ce qu'on produira plus tard, depuis l'export.
- [x] **Pas de carte ombrée pour tout.** — Aucune carte. La structure est un bandeau de contexte, une barre de filtres, un tableau. Les seules ombres sont `--shadow-sm` sur les menus déroulants de filtre et `--shadow-lg` sur l'export en cours. Séparation par filets et valeurs de fond.
- [x] **Pas d'uniformité** : la hiérarchie vient d'un rapport d'échelles typographiques, pas d'un espacement constant. — Titre `--text-h1` 24 px, libellés de colonne `--text-overline` 11 px / 600, identités `--text-body` 14 px, matricules / ressources / horodatages en `--font-mono` 13 px, dates de rétention `--text-caption` 12 px. Le rapport 24 → 14 → 12 → 11 est réel et il sert : le regard doit trouver les identités avant les horodatages.
- [x] **Pas de gris neutre générique `#6B7280` par défaut.** — Aucun `#6B7280`. Refus `--color-out-of-band` `#B23A2E`, fraîcheur inconnue `--color-unknown` `#7A6A3C`, source indisponible `#5B5B63`, verrouillé `--color-stale` `#746A5E`, hors droits `#7E8A85`. Cinq gris, cinq sens.
- [x] **Pas de mise en page centrée symétrique par défaut.** — Bandeau de contexte pleine largeur, barre de filtres sur une rangée à gauche, tableau pleine largeur à partir du filet gauche de la page. Aucun conteneur centré à 1200 px : un journal doit pouvoir s'imprimer sur toute la largeur de la page, bord à bord.
- [x] **Pas d'illustration d'appoint générique** à la place d'une vraie hiérarchie. — Aucun graphique de donut « accès par rôle », aucun pictogramme, aucun dégradé d'accent pour « shimmer » le chargement. Le chargement est un skeleton **de la forme du tableau**. Si une synthèse est nécessaire, elle est un `DataTable` chiffré, pas un graphique.
- [x] **Pas d'une seule famille de police** si la hiérarchie demande du contraste. — Deux familles : `Inter Variable` pour le texte, `--font-mono` pour les **matricules**, `resource_id`, `source_ref`, les **horodatages** et les **volumes**. C'est ce qui rend deux lignes alignables colonne par colonne et ce qui permet de lire une suite de `export` comme une suite de nombres.

**Choix assumé et non neutre** : le bandeau de contexte affiche en permanence **« vous voyez 1 204 consultations sur 3 418 sur la période du 01/03 au 30/09 — les 2 214 autres portent sur des ressources que vos droits ne couvrent pas »**. Ce n'est pas une note de bas de page : c'est la **première rangée** de la page, au-dessus de la barre de filtres, dans une teinte de fond propre. La plupart des produitstraitent ce filtrage comme une commodité ; ici c'est l'écran. Corollaire : la **vue restreinte** n'est jamais `./acces?filtre=lecture-seule` — elle n'existe pas. Une restriction de visibilité ne se déverrouille pas par un paramètre, elle est la seule version qui existe pour un lecteur donné. Et surtout, le journal **journalise sa propre consultation** : à l'ouverture, une ligne apparaît immédiatement en tête de tableau, horodatée à la seconde, `vous — journal des accès — autorisé`. Le fichier qui prouve les accès est lui-même un accès.

---

## 3. Anatomie

```
Page /acces                                        design-system §3.1 — SideNav + contenu 12 col
├── SideNav                                      rank 4 « Accès et journal » actif
├── Breadcrumb                                   Indicateurs › Accès et journal
├── ContextBanner                                B25 — cadre de visibilité, PLEINE LARGEUR, rangée 1
│   └── Text[body] + Text[caption]               « 1 204 / 3 418 visibles » + motif du filtrage B25
├── PageHeader
│   ├── Text[h1] Journal des consultations
│   └── Text[caption] fenêtre de conservation 1 an — B10
├── FilterBar                                    aligné à gauche, jamais centré
│   ├── FormField[select]  Identité              annuaire, personne nommée — B23
│   ├── FormField[select]  Ressource             indicateur / tableau de bord / export
│   ├── FormField[select]  Issue                 **toutes** par défaut (autorisée + refusée) — B10
│   ├── FormField[select]  Période                24h / 7j / 30j / période libre
│   └── Button[ghost]         Réinitialiser       distinct de « aucun résultat »
├── SelfAuditStrip                               B23 — votre propre consultation, horodatée
├── DataTable[reference]        journal, 28 px    B10 — identité · ressource · périmètre · période · issue · horodatage
│   ├── DataTableRow             issue = autorisée     liseré gauche --color-accent
│   │   └── RowDetail            motif, source, composition du groupe à la date
│   └── DataTableRow             issue = refusée      liseré gauche --color-out-of-band
│       └── RowDetail            ressource visée UNIQUEMENT — aucun détail de ligne — B25
├── CompositionDrawer            E14 — groupe modifié, effet immédiat, journalisé
└── Footer
    ├── RetentionNotice          B10 — « conservé 1 an, purgé le <date> »
    ├── ExportPanel              US-8 — export du journal, porte ses propres métadonnées B27
    └── ProvenanceStrip          journal extrait le · conservé jusqu'au · écriture seule
```

| # | Composant | Rôle | Source |
|---|---|---|---|
| 1 | `ContextBanner` | **Risque central de l'écran** (B25) : ce que le lecteur voit, ce qu'il ne voit pas, et pourquoi | slice-local |
| 2 | `FilterBar` + `FormField[select]` | Identité, ressource, issue, période — l'issue est sur **toutes** par défaut | design-system §2 `FormField`, variante `select` |
| 3 | `SelfAuditStrip` | La ligne qui prouve que **ce lecteur** consulte le journal (B23) | slice-local |
| 4 | `DataTable` (`reference`) | Le journal lui-même : identité, ressource, périmètre, période, issue, horodatage | design-system §2 `DataTable` |
| 5 | `DataTableRow` | Deux rendus de ligne : `granted` (liseré `--color-accent`) et `refused` (liseré `--color-out-of-band`) | design-system §2 `DataTable` |
| 6 | `RowDetail` | Détail d'une consultation autorisée ; **pour une consultation refusée, la ressource visée seule** (B25) | slice-local |
| 7 | `CompositionDrawer` | Composition d'un groupe d'accès à la date de la consultation (E14) | slice-local |
| 8 | `ExportPanel` | Export du journal, avec son auteur, sa date, sa fenêtre, et son périmètre restreint | design-system §2 `ExportPanel` |
| 9 | `RetentionNotice` | Rappel de la conservation d'un an et de la purge (B10, C4) | slice-local |
| 10 | `ProvenanceStrip` | Provenance **du journal** : extrait le, conservé jusqu'au, écriture seule | design-system §2 `ProvenanceStrip` |

---

## 4. States — tous, sans exception

| État | Déclencheur | Rendu | Feedback utilisateur |
|---|---|---|---|
| **Chargement** | Ouverture de `/acces` — journal filtré, décompte de visibilité, composition de groupe | Skeleton **de la forme du tableau** : 20 lignes à 28 px, colonnes à leur place, `ContextBanner` en trois lignes skeleton dont le ratio « N / M » reste à sa place pour éviter tout saut de mise en page. Le compteur de visibilité arrive en premier que les lignes, parce que c'est l'information critique (B25) | Aucun spinner central. La `FilterBar` est **active** pendant le chargement : changer un filtre ne fait pas attendre. |
| **Rempli** | Journal disponible | `DataTable[reference]` pleine largeur, lignes alternées `#E4E8E6`, liseré gauche coloré par issue, `ContextBanner` avec le ratio exact. La ligne d'issue **refusée** est rendue au même poids visuel que l'issue autorisée — elle est dans le flux, pas dans un filtre à activer. | Survol : fond `--color-surface`, bordure `--color-border-strong`. Clic : ouverture du `RowDetail` en panneau latéral (drawer, `--shadow-md`). |
| **Vide — jamais visité** | Le lecteur habilité n'a jamais ouvert le journal | Un `DataTable` vide avec **CTA principale** « Consulter le journal » — et, juste au-dessus, la phrase qui engage : « cette consultation sera elle-même journalisée (B23) ». Aucun chiffre, aucun décompte, aucune illustration. | Le CTA est le seul élément accentué de la ligne. Après clic, la ligne d'auto-journalisation apparaît en tête de tableau, horodatée à la seconde : la promesse de l'écran est tenue immédiatement et visiblement. |
| **Vide — aucune donnée** | Filtres ne renvoyant aucune consultation sur la période | **Distinct** de `filtered-to-zero` : message « 0 consultation sur ces critères entre le 01/03 et le 30/09 » avec la commande « Réinitialiser les filtres » qui affiche **les critères actifs nommés**, et le rappel « la conservation est de 1 an : les consultations de mars 2025 ne sont plus disponibles (B10) » si la période demandée est antérieure à la fenêtre | Un filtre qui ne renvoie rien n'est pas une absence de données : la cause affichée est le filtre, avec la liste de ce qui filtre. |
| **Erreur de chargement** | Journal indisponible (panne, source d'identité injoignable) | Bandeau `--color-source-unavailable` : « journal indisponible — aucune liste n'est affichée », bouton `Réessayer`. **Jamais** « 0 consultation » en remplacement d'une erreur, et **jamais** de résultat partiel : un journal tronqué qui semble complet est le pire des deux. | Le compteur du `ContextBanner` affiche « — » plutôt qu'un chiffre. Un décompte faux est plus grave qu'un décompte absent. |
| **Erreur de soumission** | Export du journal en échec, ou périmètre d'export refusé | `ExportPanel` en `failed` (E13) : **aucun fichier partiel proposé**, message + reprise. `ExportPanel` en `forbidden_scope` (E6) : « export refusé sur les 12 derniers mois — votre habilitation couvre les 6 derniers mois ; la demande des 12 mois doit être adressée nominativement au responsable conformité », avec la commande de demander explicitement | Le journal **refuse** de s'élargir : il porte exactement le périmètre de l'écran (B8 appliqué à l'outil de preuve). Un journal exportable au-delà de ses droits n'est plus une preuve, c'est une fuite. |
| **Succès** | Export prêt | `ExportPanel` en `ready` : lien, expiration datée, et **métadonnées portées par le fichier** : auteur de l'export, date de l'export, fenêtre de conservation, périmètre couvert, et la mention « ce journal ne peut être ni modifié ni purgé depuis l'interface » | Aucune notification silencieuse : l'export du journal est un acte archivé, il est écrit dans le journal lui-même (B10, B27). |
| **Hors-ligne / permissions** | (a) personne non habilitée ; (b) habilité mais droits restreints sur certaines ressources ; (c) perte de liaison | (a) la page rend **rien** : ni liste, ni compteur, ni nombre de lignes. Message unique : « le journal des accès est réservé à des personnes nommées (B23) ». Afficher un décompte serait déjà divulguer qu'il existe des consultations. (b) `ContextBanner` explicite avec le ratio et le motif ; les ressources hors droits apparaissent en `readonly` grisé **avec la mention du motif**, ou sont absentes — le choix est documenté en §5 et c'est l'absence qui l'emporte (B25, B7). (c) dernier extrait affiché **et daté** dans la `ProvenanceStrip`, bandeau « extrait du 30/09 09:12, non actualisé », sans bouton d'action | Le cas (a) est le seul état où l'écran ne dit rien sur le contenu, et c'est délibéré. |
| **Lecture seule** | Par nature : le journal est **en écriture seule pour l'application** (C4) | Aucune commande d'édition, de suppression, de purge ou de correction sur aucune ligne. Le bandeau de rétention le dit : « ce journal ne se modifie pas ; toute anomalie constatée est consignée dans un ticket, pas ici ». Le `ExportPanel` est la seule action, et elle **ajoute** une entrée au journal | Aucun bouton « supprimer », même grisé. L'absence est le contrôle : une commande qui n'existe pas ne peut pas être usurpée. |

> Pour la ligne hors droits : le design system tranche dans l'autre sens que l'usage pour `IndicatorTile` (`permission_denied` → la tuile n'est pas rendue). Ici la divergence est assumée et écrite dans `ContextBanner` : sur un indicateur, un placeholder « accès refusé » confirmerait l'existence d'un chiffre dont le lecteur n'a pas le droit de connaître l'existence ; sur un **journal d'accès**, une ligne sayant « Réfusée sur [ressource] » est précisément ce que le journal doit prouver. Le journal est donc le seul endroit du produit où l'on **nomme** une ressource refusée — et c'est pourquoi il est filtré par droits (B25) et jamais affiché à un non habilité (B23). C'est le pari de conception de cet écran, il est explicite et contestable.

---

## 5. Interactions

| Élément | Événement | Comportement | Feedback visuel | État résultant | ID |
|---|---|---|---|---|---|
| Entrée `acces` de la `SideNav` | click | Ouvre `/acces` ; si la personne n'est pas habilitée, la page rend l'état « non habilité » sans rien laisser filtrer | Aucune ligne, aucun compteur | `Hors-ligne / permissions` (a) | B23 |
| Ouverture de `/acces` | load | Écrit **immédiatement** une entrée de journal pour la consultation du journal, et l'affiche en tête de tableau horodatée à la seconde | `SelfAuditStrip` en `--color-accent-subtle` | `Rempli` | B23 |
| `ContextBanner` | render | Affiche « N sur M visibles sur la période » et nomme le **motif** du filtrage : « ressources hors de votre périmètre de conformité ». Le bandeau n'est pas repliable et n'a pas de « masquer » | Rangée 1, pleine largeur, filet gauche `--color-accent` 3 px | permanent | B25 |
| `FormField[select]` (issue) | change | Valeur par défaut : **toutes** (autorisées **et** refusées). Aucun preset ne filtre sur « autorisées seulement » : un journal qui ne montre que les réussites flatte celui qui le produit | Menu `--surface-raised`, `--shadow-sm` | `Rempli` / `Vide — aucune donnée` | B10 |
| `FormField[select]` (identité) | type | Recherche dans l'annuaire, personnes nommées. Une saisie libre est acceptée **pour la recherche**, pas pour produire une identité affichée : si aucune correspondance, le filtre est ignoré et l'écran le dit (« aucune personne ne correspond ; le filtre n'a pas été appliqué ») | Message sous le champ, jamais une ligne vide étiquetée « inconnu » | inchangé | B23 |
| `FormField[select]` (période) | change | Le sélecteur propose `24h / 7j / 30j` puis une période libre. Une période antérieure à la fenêtre de conservation est **acceptée** mais rendu avec le bandeau de rétention, parce que refuser une période Making someone think there's no data quand il y en a — seulement qu'elle est purgée | Bandeau `--color-stale` | `Vide — aucune donnée` | B10 |
| `DataTableRow` (issue autorisée) | click | Ouvre `RowDetail` : motif de l'accès, ressource, `source_ref`, portée (page consultée), horodatage complet, et **composition du groupe d'accès telle qu'elle était à la date de la consultation** (E14) | Drawer droit, `--shadow-md`, focus sur son titre | inchangé | B10, E14 |
| `DataTableRow` (issue refusée) | click | Ouvre un `RowDetail` **réduit** : horodatage, identité, **type et nom de la ressource visée**, périmètre demandé, période demandée, motif du refus. **Aucun détail de ligne, aucun nombre de lignes, aucun filtre appliqué, aucun lien vers un export.** Ce panneau ne peut pas s'étendre : il n'y a pas de contrôle d'expansion | Idem, contenu réduit, pas de bouton « voir plus » | inchangé | B25 |
| `DataTableRow` (ressource hors droits) | — | La ligne **n'est pas rendue**. Pas de ligne grisée « accès refusé » : sur le journal lui-même, nommer une ressource que le lecteur ne peut pas voir contredirait B25. Le lecteur voit l'absence dans le `ContextBanner`, et c'est tout | — | — | B25, B7 |
| `CompositionDrawer` | open | Ouvre `/acces/groupes/[groupId]` : composition actuelle, date de la dernière modification, et **journal des consultations avant et après cette date** | Bandeau E14 en tête | — | E14 |
| `ExportPanel` (bouton) | click | Lance l'export du journal **pour la vue courante** : mêmes filtres, même périmètre de droits. Tâche de fond, `queued` puis `running` avec identifiant en mono ; la navigation ne l'interrompt pas | `--shadow-lg` sur le panneau d'export en cours | `Succès` / `Erreur de soumission` | B10, B27 |
| `ExportPanel` (périmètre refusé) | click | `forbidden_scope` : refuse et **nomme le périmètre qui serait autorisé**, avec la commande de le demander explicitement | `--color-out-of-band` | `Erreur de soumission` | E6 |
| Bouton « Réinitialiser » | click | Remet les quatre filtres à leur défaut et **annonce** le nombre de lignes rendues | `--color-accent-subtle` bref | `Rempli` | — |
| Tri de colonne | click | Tri sur `horodatage`, `identité`, `ressource`, `issue`. Tri **stable** : deux lignes à la même seconde restent dans l'ordre d'écriture du journal, sinon le journal n'est pas reproductible | En-tête de colonne en `--color-accent` + `aria-sort` | inchangé | B10 |
| Aucune commande d'écriture | — | Suppression, purge, correction, annotation, modification d'une ligne : **aucune n'existe dans le DOM**, pas seulement « désactivée ». Le journal est en écriture seule pour l'application (C4) | Bandeau de rétention | `Lecture seule` | B10 |
| `window` | beforeunload | Aucune confirmation : la consultation est **déjà** journalisée à l'ouverture, il n'y a rien à perdre | — | — | B23 |

- **Focus / clavier** : ordre = `ContextBanner` (focusable, `role="status"` — on ne rate pas le cadre de visibilité) → filtres → tableau → `ExportPanel` → rétention. Dans le `DataTable`, navigation par flèches entre cellules (`role="grid"`), `Entrée` ouvre le détail, `Échap` ferme le drawer et **rend le focus à la ligne d'origine**. Anneau `--color-border-focus` 2 px partout. Toute action du tableau est atteignable au clavier, y compris le tri (bouton dans le `th`).
- **Gestes** : swipe horizontal pour changer de colonne **désactivé** sur le tableau, car il entre en conflit avec le défilement horizontal du `DataTable` et pourrait être lu comme « ligne suivante » ; pull-to-refresh autorisé sur `≤ 640px` uniquement, il relance la lecture du journal (qui est de toute façon journalisée à chaque ouverture).
- **Animations** : apparition du tableau `--duration-normal` (160 ms) `--ease-in` sans translation — un journal qui glisse semble défiler. Changement d'issue d'une ligne (autorisée → refusée après un changement de droits) : changement de couleur sémantique seul, `--duration-normal`. Ouverture du drawer `--shadow-md`, `--duration-normal` `--ease-out`. **Aucun compteur animé, aucune barre de progression qui défile** ; l'export affiche un pourcentage en `--font-mono` mis à jour toutes les 2 s.
- **Retour arrière** : le drawer se referme ; les filtres sont dans l'URL, donc le retour arrière **retourne à la vue filtrée précédente** plutôt qu'à une vue par défaut. Une vue filtrée est une vue citable dans un rapport : elle doit avoir une URL, pas un état caché dans le composant.

---

## 6. Responsive

| Breakpoint | Comportement | Ce qui se replie / disparaît |
|---|---|---|
| **Mobile** `≤ 640px` | **Non livré au MVP** (lecture seule sur téléphone, US-15 en V2). La route rend un message explicite : « le journal des accès s'ouvre depuis un poste de bureau » — **jamais** un tableau à 6 colonnes sur 360 px, et **jamais** une version allégée qui perdrait une colonne de preuve. Un journal amputé est pire qu'un journal absent : il semble complet. | Disparaissent : le tableau, les filtres, l'export. Reste : le message et le lien de retour. |
| **Tablet** `641 – 1024px` | Une colonne. `ContextBanner` pleine largeur sur 3 lignes. Filtres sur deux rangées. `DataTable` en colonnes fixes avec défilement horizontal ; les colonnes secondaires (période, `source_ref`) passent sous le libellé au format liste à deux niveaux, la **colonne `issue` et la colonne `horodatage` restent toujours visibles** — ce sont les deux qui font la preuve | Se replient : `périmètre`, `source_ref` deviennent des lignes secondaires. Ne disparaissent **jamais** : identité, ressource, issue, horodatage |
| **Desktop** `1025 – 1600px` | 12 colonnes, hauteur de ligne 28 px, toutes les colonnes visibles en un seul balayage : horodatage · identité · matricule · ressource · périmètre · période · issue · canal. `ContextBanner` sur une ligne. Pagination par 100 lignes, numérotée et stable | Rien ne disparaît. Seul le `RowDetail` passe en drawer latéral de 480 px au lieu d'un panneau pleine largeur |
| **Wide** `≥ 1601px` | Le tableau peut tenir **120 lignes** sans défilement horizontal ; `RowDetail` passe en panneau de 640 px avec l.identity et l'horodatage figés en haut pendant le défilement du détail. La barre de filtres passe sur une rangée unique avec les quatre sélecteurs et le bouton d'export alignés à droite | Rien de plus — et **jamais** de largeur infinie : au-delà de 1600 px on ajoute des lignes, pas des colonnes vides |

- **Cible tactile** : sur `641 – 1024px`, sélecteurs et boutons **44 px**, lignes du tableau **44 px** de haut minimum (une ligne de journal qu'on ne peut pas toucher est une ligne qu'on ne peut pas citer). Sur `≥ 1025px`, hauteur 28 px assumée pour la densité ; l'export et la réinitialisation restent à 40 px.
- **Débordement** : garanti de ne jamais déborder — (a) les identités longues passent en `overflow-wrap: anywhere`, les `resource_id`, `matricule` et `source_ref` **jamais** : ils sont en mono et le tableau défile horizontalement plutôt que de les couper, parce qu'un identifiant tronqué dans une preuve est un identifiant inutilisable ; (b) la colonne `horodatage` est en `position: sticky` à gauche comme à droite du `RowDetail`, pour qu'on sache toujours de quelle ligne on parle ; (c) la `FilterBar` passe sur deux rangées sous 1024 px au lieu de déborder ; (d) `ExportPanel` se réduit à une ligne compacte quand son identifiant dépasse la largeur.

---

## 7. Accessibility

- [x] Contraste **11,3:1** pour le texte courant : `--color-text-primary` `#2C3633` sur `--color-background` `#F2F4F3`. Identités, ressources et périodes sont toutes en texte primaire — **aucune** information du journal n'est en texte secondaire.
- [x] Contraste **7,1:1** pour l'accent : `--color-accent` `#0F5C57` — en-têtes de colonne triée, liens, focus, bouton d'export.
- [x] Contraste **4,8:1** pour l'issue **refusée** : `--color-out-of-band` `#B23A2E` sur la ligne alternée `#E4E8E6` (**5,4:1** sur la ligne paire `#F2F4F3`). Refusée est **aussi** écrite en toutes lettres et doublée d'une icône — exigence 7.3 du PRD.
- [x] Contraste de l'**issue autorisée** : elle est portée par un liseré `--color-accent` (7,1:1) et un texte, **pas** par une teinte de fond. Un vert « succès » n'existe pas dans la palette du produit : une consultation autorisée n'est pas un succès, c'est un acte. Ce parti pris évite d'avoir à signaler un `--color-success` absent du design system.
- [x] **Contraste 6,33:1 pour `--color-text-secondary` `#4F5C57`**, recalculé sur la valeur du design system §1.1 : **6,33:1** sur `--color-background` `#F2F4F3`, **5,9:1** sur la barre de filtres et les en-têtes `#E9EDEB`, **5,7:1** sur la ligne alternée `#E4E8E6`, **5,4:1** sur la ligne `readonly` `#DEE3E1`. **Conforme sur les quatre fonds de cet écran** : le secondaire porte donc les **dates de conservation** et les libellés de la barre de filtres sans réserve, et rien n'est réservé aux seuls libellés non essentiels. L'écart signalé ici — 4,2:1, « sous le seuil AA », à trancher au gate — **est levé** : il venait d'un couple couleur/fond qui n'existe pas dans le design system.
- [x] Navigation clavier complète sur `--bp-desktop` : `role="grid"` avec navigation par flèches, tri par bouton dans le `th` avec `aria-sort`, `Entrée` ouvre le détail, `Échap` ferme et rend le focus à la ligne. Toute ligne est atteignable au clavier — un journal qu'on ne peut pas parcourir au clavier ne peut pas être lu par un auditeur qui n'utilise pas de souris.
- [x] Focus visible (tokens `--focus-ring` = `--color-border-focus` 2 px) sur les sélecteurs, les lignes, les boutons de tri, le lien d'export et le titre du drawer.
- [x] ARIA : `ContextBanner` en `role="status"` + `aria-live="polite"` — **le ratio de visibilité est annoncé**, un lecteur d'écran doit entendre « 1 204 sur 3 418 visibles » avant la première ligne. `DataTable` en `role="grid"` avec `aria-rowcount` et `aria-rowindex` (le nombre total inclut les lignes hors droits, sans les révéler individuellement — le `aria-rowcount` est une information de volume agrégé, pas d'identité). `SelfAuditStrip` en `role="status"`. Les lignes refusées portent `aria-label` complet (identité, ressource, issue) pour que l'information ne soit jamais dans la seule couleur.
- [x] Alternatives textuelles : aucune image, donc aucune alternative — **et c'est délibéré** : pas d'avatar, pas d'icône d'état seule. Chaque icône d'issue a un texte à côté ; chaque identité est du texte.
- [x] Langue et direction de lecture correctes : `lang="fr"`, `dir="ltr"`. Les matricules, `resource_id` et `source_ref` ne sont pas traduits (7.4) et restent en `--font-mono`.
- [x] Imprimabilité : `@media print` retire la `SideNav`, la `FilterBar` et le `ExportPanel`, force le fond blanc et conserve le liseré d'issue **en noir épais** (3 px) — le dossier de contrôle s'imprime en noir et blanc, l'information doit y survivre. Testé en niveaux de gris : les deux issues restent distinguables.

---

## 8. Données

| Champ | Type | Origine | Requis | Erreur possible |
|---|---|---|---|---|
| `identity_id` + `display_name` | identifiant + nom affiché | **annuaire** (jamais saisi) | oui | personne sortie de l'annuaire → la ligne est **conservée** avec son nom au moment de l'acte et la mention « personne inconnue de l'annuaire » ; un journal qui efface l'identité d'unpection est un journal qui se contredit lui-même |
| `resource_kind` | `indicator` / `dashboard` / `export` | serveur | oui | ressource supprimée depuis → nom conservé au moment de l'acte, `resource_id` conservé |
| `resource_id` + `resource_label` | slug + intitulé | serveur | oui | — |
| `scope_requested` | périmètre demandé, en langage métier | serveur | oui | pour une issue refusée : le périmètre demandé est affiché **comme périmètre demandé**, jamais comme périmètre réellement appliqué |
| `period` | période demandée | serveur | oui | — |
| `outcome` | `granted` / `refused` + code de motif | serveur | oui | motif inconnu → `refused` avec code affiché, jamais `granted` par défaut (**fail-closed**, exigence 7.2) |
| `occurred_at` | horodatage serveur, `--font-mono` | serveur, **jamais l'heure du poste** | oui | horodatage indisponible → `Erreur de chargement`, jamais de date locale substituée (B5 appliqué au journal) |
| `access_channel` | web / export / interface de lecture | serveur | oui | — |
| `group_composition_at_event` | composition du groupe à la date de l'acte | serveur | oui | absente → le détail est affiché sans le bloc composition, avec la mention ; le reste du journal reste valable (E14) |
| `retention_until` | date de purge | serveur, dérivée de B10 | oui | calcul impossible → export et écran refusent de produire un fichier sans date de purge |
| `line_detail` | — | **jamais retourné pour une issue refusée** | non | **B25** : ce champ n'existe pas dans la réponse de l'API pour une consultation refusée. Ce n'est pas une règle d'interface, c'est une absence de donnée |

- **Chargement** : **pagination numérotée de 100 lignes**, jamais de défilement infini — un journal doit être **citable par page** (« page 3 du relevé du 12/04 »). Le tri est stable et le numéro de ligne fait partie de l'URL.
- **Cache / hors-ligne** : le journal **n'est jamais mis en cache côté client au-delà de la session**. Le dernier extrait affiché hors ligne est celui de la dernière lecture réussie, daté dans la `ProvenanceStrip`, et **il n'est pas exportable**. Une pièce de contrôle doit venir du journal, pas d'un cache de poste.
- **Données sensibles** : l'export ne contient **aucun détail de ligne** pour une consultation refusée (B25) ; il contient les identités, ressources, périmètres demandés, périodes, issues et horodatages, plus ses propres métadonnées (auteur, date, périmètre, fenêtre de conservation — B27). Le journal ne permet **aucune recherche en texte libre sur des valeurs métier** : on cherche par identité, ressource, période ou issue, jamais par « un montant » ou « un nom de client » — une recherche plein texte sur les lignes est le chemin par lequel le journal deviendrait un outil de ré-identification. La consultation du journal est elle-même journalisée (B23), et le journal est en écriture seule pour l'application (C4) : **aucune** commande de purge depuis l'interface, la purge annuelle est automatique et datée.

---

## 9. Traçabilité

| ID | Origine | Manifestation sur cet écran |
|---|---|---|
| **B10** | PRD §4 | La ligne de journal porte **cinq** colonnes : identité, indicateur/ressource, périmètre, période, issue — plus l'horodatage serveur. Le filtre `issue` est sur **toutes** par défaut, donc les refus sont dans le flux principal et pas derrière un interrupteur. `RetentionNotice` nomme la fenêtre de 1 an et la date de purge ; une période antérieure est refusée avec cette raison-là, jamais avec « aucune donnée ». `ProvenanceStrip` en pied porte la date d'extraction et « écriture seule ». Aucune commande d'écriture n'existe dans le DOM. |
| **B23** | PRD §4 | (a) Le message d'état non habilité ne donne **ni liste, ni compteur, ni nombre de lignes** — nommer le volume serait déjà divulguer. (b) `SelfAuditStrip` en tête, horodaté à la seconde, apparaît **à l'ouverture** : la ligne de sa propre consultation. (c) L'état « vide — jamais visité » annonce par écrit, avant le clic, que la consultation sera journalisée. (d) L'export du journal est lui-même une entrée de journal. |
| **B25** | PRD §4 | **Risque central de l'écran, traité à trois niveaux.** (1) `ContextBanner`, rangée 1, pleine largeur, non repliable, `role="status"` : « 1 204 sur 3 418 visibles — les autres portent sur des ressources que vos droits ne couvrent pas ». (2) Une consultation **refusée** journalise et affiche la **ressource visée** (type, nom, `resource_id`), le périmètre **demandé**, la période demandée, le motif — et **jamais le détail des lignes** : le champ n'existe pas dans la réponse, il n'y a pas de contrôle d'expansion sur la ligne, donc il n'y a rien à contourner. (3) Une ressource hors droits **n'est pas rendue** dans le tableau : pas de ligne grisée « accès refusé », qui confirmerait l'existence d'une ressource interdite. Le `RowDetail` d'une ligne refusée est volontairement plus court que celui d'une ligne autorisée — cette dissymétrie visuelle est la démonstration permanente de ce que la règle protège. |
| **E14** | PRD §6 | Chaque ligne porte, dans son `RowDetail`, la **composition du groupe d'accès telle qu'elle était à la date de la consultation** (« Accès via Direction commerciale — 4 membres au 14/03 »), pas la composition actuelle : un journal qui montre la composition d'aujourd'hui ne prouve rien sur ce qui était permis hier. `CompositionDrawer` (`/acces/groupes/[groupId]`) affiche la composition avant/après une modification avec la date exacte, et le journal des consultations situées de part et d'autre — la preuve que la nouvelle composition s'est appliquée à la lecture suivante. |
| **US-8** | PRD §3 | Écran entier. Les deux critères : journaliser identité, indicateur, périmètre, période et issue (les cinq colonnes) ; et permettre l'export du journal (`ExportPanel`) aux personnes habilitées, avec ses propres métadonnées. |
| **C4** | PRD §5 | Rétention d'un an purgée automatiquement et consultable, et journal en écriture seule pour l'application : aucune commande de purge ni de modification dans l'interface, mention explicite dans le bandeau de rétention et dans le `ProvenanceStrip`. |
| **C10** | PRD §5 | Données personnelles dans le stockage : l'export porte son auteur et sa date, et le journal lui-même est journalisé à chaque ouverture — un journal d'accès qui ne dirait pas qui l'a consulté ne prouverait rien. |
| **7.2 (sécurité)** | PRD §7.2 | `outcome` en `fail-closed` : un motif de refus inconnu rend `refused`, jamais `granted`. |

---

## 10. Checklist de gate

- [x] Les 9 états sont décrits avec un rendu concret.
- [x] Chaque élément interactif a un comportement et un feedback.
- [x] Le responsive est défini à **chaque** breakpoint du design system (`≤640`, `641–1024`, `1025–1600`, `≥1601`).
- [x] La section Anti-générique est cochée et justifiée (7 cases + un choix assumé).
- [x] Aucune valeur de design n'est laissée à « à définir ».
- [x] Chaque ID B*/E*/C* de l'écran apparaît en section 9 : B10, B23, B25, E14, US-8, C4, C10.
- [x] `node "$FORGE/scripts/forge-guard.js" placeholders <anchor>` ne signale rien ici.
- [x] L'écran reste cohérent avec `.forge/design/design-system.md` : tokens, `DataTable` variante `reference`, `FormField[select]`, `ExportPanel`, `ProvenanceStrip`, `--shadow-none` par défaut, aucune couleur sans signifié.