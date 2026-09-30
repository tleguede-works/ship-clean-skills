---
type: implementation-plan
slice: partage-dashboard
module: tableau-de-bord
status: identified
generated_at: 2026-09-30
derived_from:
  - .forge/architecture.md
  - .forge/prd.md
  - .forge/design/design-system.md
  - .forge/design/screens/tableau-de-bord.md
  - .forge/design/screens/tableau-de-bord-composition.md
conventions_ref: .forge/conventions.md
---

# Plan d'implémentation — `partage-dashboard`

> **Vocation de ce document.** Produit en Phase 4 à partir de l'architecture. La Phase 5
> l'approfondit et le valide slice par slice : statut `identified`, pas `planned`.

## Sources

- **PRD** : `.forge/prd.md` — US-6 · B9, B16, B13 · E4, E5, E17
- **Architecture** : § 3.4, § 4.9, § 4.10, § 4.11, § 5.10 à § 5.14, ADR-4, ADR-8
- **Design** : `tableau-de-bord.md` (page dashboard, grille 12 colonnes), `tableau-de-bord-composition.md`

## 1. Résumé de la slice

Composer un tableau de bord par **assemblage fixe** d'indicateurs officiels et le partager
à une liste nominative ou à un groupe de l'annuaire. C'est la séance de comité : le
destinataire ouvre la même chose que le composeur, sans installation.

**User stories** : US-6 (Publier et partager un dashboard officiel)
**Règles** : B9, B16, B13 · **Edge cases** : E4, E5, E17

> **Borne de périmètre** : US-10 (composeur libre) est en V1
> (`roadmap.md` § 2.1, `benchmarks.md` § 5 écart 1). L'assemblage est fixe : ni placement
> libre, ni filtre libre hors de ceux écrits dans la définition.

## 2. Contrats de données (code)

### 2.1 Schémas de validation

```ts
// src/shared/schemas/dashboard.schema.ts
import { z } from 'zod';
import { slugSchema } from './indicator-definition.schema';

export const dashboardIndicatorSchema = z.object({
  indicator_id: z.string().uuid(),
  pinned_version_id: z.string().uuid(),        // la VERSION, pas seulement l'indicateur (B16)
  tile_size: z.enum(['sm', 'md', 'lg']).default('md')
}).strict();

export const createDashboardSchema = z.object({
  slug: slugSchema,
  label: z.string().min(1).max(120),
  scope_expr_version_id: z.string().uuid(),
  indicators: z.array(dashboardIndicatorSchema).min(1).max(24)
}).strict();

export const grantSchema = z.object({
  grantee_kind: z.enum(['actor', 'group']),
  grantee_id: z.string().min(1).max(64),
  expires_at: z.string().datetime().nullable().default(null)
}).strict()
.refine(g => g.grantee_kind !== 'actor' || g.grantee_id.length <= 255, { path: ['grantee_id'] });

export type CreateDashboardInput = z.infer<typeof createDashboardSchema>;
export type GrantInput = z.infer<typeof grantSchema>;
```

### 2.2 Types et interfaces

```ts
// src/features/dashboards/compose/dashboard.types.ts
export interface DashboardTile {
  readonly position: number;              // 0..99, dense, UNIQUE par dashboard
  readonly slug: string;
  readonly versionLabel: string;          // version Épinglée (B16)
  readonly officiality: 'official' | 'provisional' | 'stale_owner' | 'target_missing';
  readonly state: 'value' | 'empty' | 'source_unavailable' | 'too_slow' | 'loading';
  readonly value: number | null;
  readonly unit: string | null;
  readonly target: { value: number; delta: number; confirmed: boolean } | null;
  readonly semanticState: 'in_target' | 'out_of_band' | 'no_target' | 'target_unconfirmed' | 'not_official';
  readonly computedAt: string | null;     // date de calcul DE LA SOURCE (B5)
  readonly sourceRef: string;
}

export interface DashboardView {
  readonly slug: string;
  readonly label: string;
  readonly isOfficial: boolean;           // false si un indicateur a perdu son statut (E17)
  readonly version: number;
  readonly tiles: readonly DashboardTile[];
  readonly excluded: readonly ExcludedResource[];   // E5
  readonly computedAt: string | null;
}
```

### 2.3 Contrats API

- `GET /api/v1/dashboards` — § 5.10
- `GET /api/v1/dashboards/:slug` — § 5.11
- `POST /api/v1/dashboards` — § 5.12
- `POST /api/v1/dashboards/:slug/grants` — § 5.13
- `DELETE /api/v1/dashboards/:slug/grants/:grantId` — § 5.14

## 3. Algorithmes critiques

### 3.1 `createDashboard` (couvre B13, B16, ADR-4)

```
ENTRÉES : CreateDashboardInput, actor
1  parser par createDashboardSchema → 422 avec chemins fautifs
2  rôle 'controleur' requis → 403
3  slug déjà pris → 409 SLUG_TAKEN
4  POUR CHAQUE entrée d'indicators :
4a   indicateur inconnu OU pinned_version_id inconnu OU
     pinned_version_id n'appartient PAS à cet indicateur → 404
4b   SI indicator.officiality = 'provisional' ET actor <> owner
       → 409 « Un indicateur non officiel ne peut pas entrer dans un tableau
               de bord officiel. »   (B13)
4c   SI pinned_version_id.status <> 'signed'/'published'
       → 409 : on épingle une version signée, jamais un brouillon (B16)
5  INSERT dashboard (is_official = true, author = actor)
6  INSERT dashboard_indicator avec position = index du tableau
   — l'ordre d'écriture EST l'ordre d'affichage ; `tile_size` est le seul levier
7  journaliser ressource 'dashboard', outcome 'granted'
8  renvoyer le tableau créé
```

### 3.2 `resolveDashboardForReader` (couvre B9, B16, E4, E5, E17)

```
ENTRÉES : slug, query scope, actor
1  charger dashboard + ses grants
2  accès ?
     actor est auteur OU un grant actor le vise OU un grant group le vise
     ET le grant n'est pas expiré (expires_at IS NULL OR > now())
   sinon → 404 « Tableau de bord introuvable. »
   (même réponse qu'un tableau inexistant : l'existence n'est pas divulguée)
3  POUR CHAQUE dashboard_indicator :
3a  version affichée = pinned_version_id      ← PAS current_signed_version_id (B16, E4)
     si la version courante est plus récente ET signée :
       le tableau reste sur la version épinglée tant que le lecteur n'a pas rechargé
3b  décision de droit par indicateur
     refus → l'indicateur n'entre PAS dans `tiles` ; il entre dans `excluded`
             et l'exclusion est JOURNALISÉE (E5, B25)
3c  officiality = 'stale_owner' si propriétaire inactif
     → le tableau reste CONSULTABLE, `is_official` passe à false, la tuile porte
       la mention (E17 : le retirer effacerait ce que le lecteur attendait)
4  scope effectif = scope demandé ∩ équipes accordées
   vide → 403 « Aucune des équipes demandées ne vous est accessible sur ce tableau. »
5  renvoyer DashboardView avec tiles, excluded, computed_at
```

### 3.3 `grantDashboard` (couvre B9)

```
1  rôle 'controleur' requis → 403
2  beneficiaire inconnu (actor ou group) → 404
3  partage déjà existant → 409
4  expires_at dans le passé → 422
5  INSERT dashboard_grant
6  journaliser : l'ouverture d'un tableau par un nouveau bénéficiaire est
   journalisée avec la NOUVELLE composition du groupe (E14)
```

## 4. Plan composants

### 4.1 Arbre de composants

```
DashboardPage (server)   /d/[slug]
├── Sidebar (4 entrées)
├── PeriodBar              scope dans l'URL
├── TileGrid (12 colonnes, tuile = 3 colonnes)
│   └── IndicatorTile size="md" × n, ordre = position
├── ExcludedNotice         « 1 indicateur non consultable sur ce tableau »
└── ExportPanel            (consommé par `export-provenance`)

DashboardComposer (client)   /compose/[slug]
├── DataTable variant="reference"  des indicateurs officiels
├── DragRow                 réordonne = réécrit `position` (ordre, PAS placement libre)
├── TileSizeSelect          sm | md | lg
└── SharePanel              liste nominative + groupes de l'annuaire
```

### 4.2 Composants

| Composant | Type | Fichier cible | Props | State | Événements |
|---|---|---|---|---|---|
| `DashboardPage` | Server | `src/app/(dashboard)/d/[slug]/page.tsx` | `{ params, searchParams }` | — | — |
| `DashboardComposer` | Client | `src/features/dashboards/compose/dashboard-composer.tsx` | `{ draft: DashboardDraft }` | `{ dirty: boolean }` | `onSave`, `onShare` |
| `SharePanel` | Client | `src/features/dashboards/compose/share-panel.tsx` | `{ grants: Grant[] }` | `{ query: string }` | `onGrant`, `onRevoke` |
| `ExcludedNotice` | Server | `src/features/dashboards/compose/excluded-notice.tsx` | `{ excluded: ExcludedResource[] }` | — | — |

### 4.3 États par écran

#### Écran : `tableau-de-bord`

| État | Condition | Composants affichés | Données |
|---|---|---|---|
| vide | Aucune tuile lisible | « aucune donnée sur la période » + élargissement | — |
| chargement | Chargement des tuiles | `IndicatorTile: loading` × n | — |
| rempli | Au moins une tuile | Grille de tuiles | `DashboardView` |
| erreur | Source indisponible | Tuiles `source_unavailable` + dernière date | E1 |
| non officiel | Un indicateur sans propriétaire actif | Tuiles présentes + mention « propriétaire inactif », tableau non officiel | E17, B17 |
| exclusions | Au moins un indicateur interdit | `ExcludedNotice` listant les slugs exclus | E5 |

#### Écran : `tableau-de-bord-composition`

| État | Condition | Composants affichés | Données |
|---|---|---|---|
| vide | Aucune définition signée | `DataTable: empty_never_visited` + CTA | B13 |
| chargement | Chargement du référentiel | `DataTable: loading` | — |
| rempli | Indicateurs officiels disponibles | Liste sélectionnable, réordonnable | `Indicator[]` |
| erreur | Échec de chargement | `DataTable: error` + `Réessayer` | `error_code` |

### 4.4 Formulaires

| Formulaire | Bibliothèque | Schéma | Soumission | Gestion d'erreur |
|---|---|---|---|---|
| Composition | React Hook Form | `createDashboardSchema` | Server Action | Erreur au champ, validation au `onBlur` |
| Partage | React Hook Form | `grantSchema` | Server Action | Sélecteur d'annuaire, **jamais** une adresse |

## 5. Gestion d'état

| Donnée | Portée | Stockage | Initialisation | Mise à jour |
|---|---|---|---|---|
| Scope | URL | query params | Lien partagé ou valeurs par défaut | Navigation |
| Brouillon de composition | composant | `useState` | Indicateurs officiels | Édition, puis sauvegarde |
| Grants | serveur | `dashboard_grant` | Chargement du tableau | Après `onGrant` / `onRevoke` |
| Version affichée | serveur | `dashboard_indicator.pinned_version_id` | Rendu serveur | Uniquement à la re-signature, par un acte explicite |

> Le brouillon de composition ne vit pas dans l'URL : c'est un travail en cours, pas un
> état partageable. Le scope, lui, vit dans l'URL parce qu'il fait partie de ce qu'un
> tableau partagé restitue.

## 6. Traçabilité des règles

| ID | Règle (PRD) | Implémentée où | Approche |
|---|---|---|---|
| B9 | Aucun accès public : liste nominative ou groupe | § 3.3, `dashboard_grant` | Pas de `token`, pas de `public` ; ADR : une adresse restitue un état, jamais un droit |
| B16 | Une modification laisse les dashboards sur la version signée | § 3.2 étape 3a | `pinned_version_id`, pas `current_signed_version_id` |
| B13 | Un indicateur non signé n'apparaît dans aucun dashboard partagé | § 3.1 étape 4b | Refus à la composition, refus à la relecture |
| B8 | L'export ne peut pas élargir le périmètre | § 5.15 `assertNotWidened` | Hérité de `restriction-lignes` |

| ID | Edge case | Approche | Où |
|---|---|---|---|
| E4 | Définition modifiée alors qu'un dashboard la référence | § 3.2 étape 3a | Le tableau reste sur la version épinglée |
| E5 | Lecteur ouvrant un tableau contenant un indicateur interdit | § 3.2 étape 3b | Tuile absente, `excluded` listé, exclusion journalisée |
| E17 | Un indicateur du tableau devient non officiel | § 3.2 étape 3c | Tableau consultable, `is_official = false` |
| E14 | Groupe d'accès modifié | § 3.3 étape 6 | Nouvelle composition à la lecture suivante, journalisée |

| ID | Contrainte | Comment elle est respectée |
|---|---|
| C3 | SSO, hébergement UE | Aucune adresse, aucun mot de passe : l'accès est une identité d'annuaire |
| C6 | Trois mois | Assemblage fixe, pas de moteur de placement |
| C7 | Autonomie en une demi-journée | Ajouter une tuile = une ligne dans un tableau ; partager = choisir un nom |

## 7. Pièges à éviter

- **Afficher `current_signed_version_id` au lieu de `pinned_version_id`** — ⚠️ Ne pas simplifier
  ainsi. B16 exige que le tableau reste sur la version signée **jusqu'à** la signature de la
  suivante ; afficher la courante partout mettrait deux chiffres différents en circulation
  (E4).
- **Un jeton dans l'URL de partage** — ⚠️ Ne pas ajouter de `?token=`. B18 est **retiré** : une
  adresse de dashboard restitue un état, elle ne constitue jamais un droit (B9).
- **Retirer un indicateur devenu non officiel du tableau** — ⚠️ Ne pas le faire. E17 le dit
  explicitement : le retirer effacerait ce que le lecteur attendait. Le tableau perd son caractère
  officiel, la tuile porte la mention.
- **Rendre une tuile grisée pour un indicateur interdit** — ⚠️ Ne pas afficher de placeholder. E5
  demande que la liste des indicateurs reste complète **sans** les rendre : `ExcludedNotice` les
  nomme, les tuiles ne les montrent pas.
- **Un éditeur de placement libre** — ⚠️ Ne pas ajouter de glisser-déposer positionnel. C'est la
  moitié de US-10, repoussée en V1 (ADR-4). Seul l'**ordre** est manipulable.
- **Un tableau de bord public « non partagé mais accessible à tous les authentifiés »** — ⚠️ Ne pas
  exister. L'absence de partage est un `404`, pas un `403` (B9).

## 8. Dépendances

| Dépend de | Nature | Statut | Fallback si absent |
|---|---|---|---|
| `auth` | Session, `resolveDashboardAccess`, groupes d'annuaire | vague 0 | Aucun : fail-closed |
| `definition-declarer` | Table `indicator`, `definition_version`, `current_signed_version_id` | vague 1 | Jeu de données en test d'intégration |

## 9. Checklist de tâches

- [ ] Schémas Zod § 2.1
- [ ] `createDashboard`, `resolveDashboardForReader`, `grantDashboard` (§ 3)
- [ ] `DashboardPage`, `DashboardComposer`, `SharePanel`, `ExcludedNotice`
- [ ] Grille 12 colonnes, tuile = 3 colonnes, ordre = `position`
- [ ] Test : une nouvelle version signée **non épinglée** ne change pas l'affichage (E4)
- [ ] Test E2E : le comité ouvre le même tableau que le composeur

## 10. Critères d'acceptation

- [ ] B9 : aucun accès sans partage nominatif ou de groupe ; aucun accès public
- [ ] B16 : une définition modifiée sans re-signature ne change pas le tableau partagé
- [ ] B13 : un indicateur non signé ne peut pas entrer dans un tableau officiel
- [ ] E5 : un indicateur interdit n'est pas rendu et son exclusion est journalisée
- [ ] E17 : un tableau dont un indicateur perd son statut reste consultable et perd son caractère officiel
- [ ] US-6 : le lecteur voit exactement le périmètre et la période autorisés, et peut les changer sans changer ses droits

## 11. Plan de tests

| Cible | Scénarios | IDs couverts |
|---|---|---|
| `createDashboard` | indicateur non officiel · version épinglée non signée · slug déjà pris · ordre respecté | B13, B16 |
| `resolveDashboardForReader` | accès par groupe · accès par personne · grant expiré · version épinglée conservée | B9, B16, E4, E14 |
| `resolveDashboardForReader` | indicateur interdit exclu + journalisé · propriétaire inactif | E5, E17, B25 |
| `DashboardComposer` | réordonnancement réécrit `position` · pas de placement libre | ADR-4 |
| E2E | un membre du groupe ouvre le tableau et voit exactement le périmètre accordé | B9, B7 |

**Statut** : `identified` — à approfondir et valider en Phase 5.
