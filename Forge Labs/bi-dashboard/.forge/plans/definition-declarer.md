---
type: implementation-plan
slice: definition-declarer
module: definitions
status: identified
generated_at: 2026-09-30
derived_from:
  - .forge/architecture.md
  - .forge/prd.md
  - .forge/design/design-system.md
  - .forge/design/screens/definition-formulaire.md
  - .forge/design/screens/definitions.md
conventions_ref: .forge/conventions.md
---

# Plan d'implémentation — `definition-declarer`

> **Vocation de ce document.** Il est produit en Phase 4 à partir de l'architecture,
> pour que la slice soit implémentable sans interprétation et pour que le graphe de
> dépendances soit vérifiable. La Phase 5 l'approfondit et le valide slice par slice :
> statut `identified`, pas `planned`.

## Sources

- **PRD** : `.forge/prd.md` — US-1, US-11 · B1, B3, B14, B22 (B18 **retiré**, PRD § 9) · E4, E8, E15
- **Architecture** : `.forge/architecture.md` — § 3.5, § 4.2, § 4.5, § 4.6, § 4.7, § 5.4, § 5.5
- **Design** : `definition-formulaire.md`, `definitions.md`
- **Conventions** : `.forge/conventions.md`

## 1. Résumé de la slice

Écrire la définition versionnée d'un indicateur : intitulé, formule, périmètre,
propriétaire **nommé** et signataire désigné, plus la cible qui accompagne la
formule. Chaque enregistrement crée une version ; les versions précédentes restent
intactes. La slice ne signe rien : elle produit un dépôt que `definition-signer`
consommera.

**User stories** : US-1 (Déclarer un indicateur), US-11 (Comparer à une cible)
**Règles** : B1, B3, B14, B22 · **Edge cases** : E4, E8, E15

## 2. Contrats de données (code)

### 2.1 Schémas de validation

```ts
// src/shared/schemas/indicator-definition.schema.ts
import { z } from 'zod';
import { teamCodeSchema, periodSchema } from './scope.schema';

export const slugSchema = z.string().regex(/^[a-z0-9][a-z0-9-]{2,63}$/);
export const actorIdSchema = z.string().min(1).max(255);

export const thresholdSchema = z.object({
  comparison: z.enum(['below', 'above']),
  threshold_value: z.number(),
  label: z.string().min(1).max(120)
}).strict();

export const indicatorDefinitionSchema = z.object({
  slug: slugSchema,
  label: z.string().min(1).max(120),
  warehouse_key: z.string().regex(/^[a-z0-9_.]{2,64}$/),
  owner_actor_id: actorIdSchema,
  designated_signer_actor_id: actorIdSchema,
  formula: z.string().min(1).max(2000),
  scope_expr: z.string().min(1).max(2000),
  grain: z.enum(['day', 'week', 'month']),
  unit: z.string().min(1).max(16),
  target_value: z.number().nullable().default(null),
  target_unit: z.string().min(1).max(16).nullable().default(null),
  change_note: z.string().min(1).max(500),
  threshold: thresholdSchema.optional()
}).strict()
.refine(d => d.designated_signer_actor_id !== d.owner_actor_id, {
  message: 'Le signataire désigné doit être distinct de l\'auteur (B2).',
  path: ['designated_signer_actor_id']
})
.refine(d => d.target_value === null || d.target_unit !== null, {
  message: 'Une cible sans unité n\'est pas exploitable (B14).',
  path: ['target_unit']
});

export const newVersionSchema = indicatorDefinitionSchema
  .omit({ slug: true, warehouse_key: true, owner_actor_id: true, designated_signer_actor_id: true })
  .extend({
    based_on_version_id: z.string().uuid(),
    expected_version_no: z.number().int().min(1)
  }).strict();

export type IndicatorDefinitionInput = z.infer<typeof indicatorDefinitionSchema>;
export type NewVersionInput = z.infer<typeof newVersionSchema>;
```

### 2.2 Types et interfaces

```ts
// src/features/definitions/declarer/definition.types.ts
export type DefinitionStatus = 'draft' | 'in_review' | 'signed' | 'refused' | 'published' | 'revoked';
export type Officiality = 'official' | 'provisional' | 'stale_owner';

export interface DefinitionVersion {
  readonly definitionVersionId: string;
  readonly indicatorId: string;
  readonly versionNo: number;
  readonly status: DefinitionStatus;
  readonly authorActorId: string;
  readonly label: string;
  readonly formula: string;
  readonly scopeExpr: string;
  readonly grain: 'day' | 'week' | 'month';
  readonly unit: string;
  readonly targetValue: number | null;
  readonly targetUnit: string | null;
  readonly targetConfirmedAt: string | null;   // null ⇒ E16 « cible à reconfirmer »
  readonly changeNote: string;
  readonly createdAt: string;
  readonly publishedAt: string | null;        // non null ⇒ signature non révocable (B26)
  readonly threshold: DefinitionThreshold | null;
}

export interface DefinitionThreshold {
  readonly comparison: 'below' | 'above';
  readonly thresholdValue: number;
  readonly label: string;
  readonly definedAt: string;                  // B11 : le seuil porte sa date
}
```

### 2.3 Contrats API

- `POST /api/v1/indicators` — architecture § 5.4
- `POST /api/v1/indicators/:slug/versions` — architecture § 5.5
- Lecture du référentiel : `GET /api/v1/indicators?include_provisional=true` — § 5.2

## 3. Algorithmes critiques

### 3.1 `createIndicatorVersion` (couvre B1, B3, B22)

```
ENTRÉES : input IndicatorDefinitionInput, actor SessionActor
1  parser input par indicatorDefinitionSchema
     échec → 422 VALIDATION_FAILED, details = chemins fautifs
2  vérifier input.owner_actor_id existe dans actor ET is_directory_entry = true
     échec → 409 OWNER_REQUIRED
3  vérifier input.designated_signer_actor_id existe dans actor
     échec → 404 « Personne introuvable dans l'annuaire. »
4  vérifier input.designated_signer_actor_id <> input.owner_actor_id
     échec → 409 SIGNER_IS_AUTHOR   (le CHECK de la base le garantit aussi)
5  vérifier input.warehouse_key résout dans l'entrepôt (test de contrat, § 4.17)
     injoignable → 503 SOURCE_UNREACHABLE ; inconnue → 422 SIGNER_UNKNOWN
6  TROUVER slug déjà pris dans indicator
     trouvé → 409 SLUG_TAKEN
7  INSERT indicator (status = 'provisional', current_signed_version_id = NULL)
8  INSERT definition_version (version_no = 1, status = 'draft',
                              target_confirmed_at = now() SI target_value NOT NULL)
9  SI threshold fourni → INSERT definition_threshold
10 journaliser : ressource 'definition', outcome 'granted'
11 renvoyer la version créée
```

### 3.2 `createNextVersion` (couvre B1, B22, E4)

```
ENTRÉES : slug, newVersionSchema, actor
1  charger l'indicateur ; invisible → 404 « Indicateur introuvable. »
2  vérifier (actor.roles contient 'controleur') OU (actor = owner_actor_id)
     sinon → 403
3  version_courante = dernière version_no de l'indicateur
4  SI input.expected_version_no <> version_courante.version_no
     → 409 CONCURRENT_MODIFICATION     (le tableau partagé reste sur v_signée : B16)
5  SI version_courante.status = 'published'
     → 409 SIGNED_VERSION_IMMUTABLE     (jamais d'UPDATE, ADR-8)
6  vérifier input.based_on_version_id = version_courante.definition_version_id
     sinon → 422
7  INSERT definition_version (version_no = version_courante.version_no + 1,
                              status = 'draft')
8  SI input.target_value NOT NULL → target_confirmed_at = now()
   SINON                        → target_confirmed_at = NULL   (E16)
9  AUCUNE écriture sur la version précédente : elle reste consultable intacte
10 renvoyer la nouvelle version
```

## 4. Plan composants

### 4.1 Arbre de composants

```
DefinitionForm (client)
├── FormField variant="text"        label
├── FormField variant="formula"      formula
├── FormField variant="formula"      scope_expr
├── FormField variant="select"       grain
├── FormField variant="owner_picker" owner_actor_id      ← saisie libre INTERDITE
├── FormField variant="owner_picker" designated_signer_actor_id
├── FormField variant="text"         change_note
├── FormField variant="text"         target_value
└── SignatureBar state="draft"       aperçu de l'état de signature

DefinitionsList (server)
└── DataTable variant="reference" state={loading|filled|empty_never_visited|error}
```

### 4.2 Composants

| Composant | Type | Fichier cible | Props | State | Événements |
|---|---|---|---|---|---|
| `DefinitionForm` | Client | `src/features/definitions/declarer/definition-form.tsx` | `{ initial?: DefinitionVersion }` | `{ dirty: boolean }` | `onSubmit(input)` |
| `OwnerPicker` | Client | `src/components/owner-picker.tsx` | `{ value: string \| null; role: 'owner' \| 'signer' }` | `{ query: string }` | `onSelect(actorId)` |
| `DefinitionsList` | Server | `src/features/definitions/declarer/definitions-list.tsx` | `{ data: IndicatorRow[]; state: TableState }` | — | — |
| `SignatureBar` | Server | `src/components/signature-bar.tsx` | § 2.3 de l'architecture | — | — |

### 4.3 États par écran

#### Écran : `definition-formulaire`

| État | Condition | Composants affichés | Données |
|---|---|---|---|
| vide | Nouvelle définition | FormField vides, bouton désactivé | — |
| chargement | Edition d'une version existante | Skeleton par champ | `DefinitionVersion` |
| rempli | Version chargée ou saisie valide | FormField remplis, `SignatureBar` en `draft` | `DefinitionVersion` |
| erreur | Échec de soumission | Message **au champ** + libellé d'action | `ApiErrorBody.details` |
| vide-données | Référentiel sans définition | `DataTable: empty_never_visited` + CTA | — |

### 4.4 Formulaires

| Formulaire | Bibliothèque | Schéma | Soumission | Gestion d'erreur |
|---|---|---|---|---|
| Formulaire de définition | React Hook Form | `indicatorDefinitionSchema` (§ 2.1) | Server Action → `createIndicatorVersion` | Erreur au champ, validation au `onBlur`, jamais en toast |

## 5. Gestion d'état

| Donnée | Portée | Stockage | Initialisation | Mise à jour |
|---|---|---|---|---|
| Brouillon de définition | composant | `useState` local | Vide ou version chargée | `onChange` |
| Version courante | serveur | `GET /api/v1/indicators` | Au rendu | Rechargement après mutation |
| Propriétaire / signataire | serveur | Table `actor` via `owner-picker` | À l'ouverture du champ | À la sélection |
| Message de refus | page | URL (`?error=`) pour un partage en lecture seule | — | — |

## 6. Traçabilité des règles

| ID | Règle (PRD) | Implémentée où | Approche |
|---|---|---|---|
| B1 | Une modification crée une version, ne réécrit pas | § 3.2 étape 5, 7, 9 | Append-only, aucune clause `UPDATE` |
| B3 | Propriétaire = personne nommée | § 3.1 étape 2 + `owner_picker` sans saisie libre | FK sur `actor`, CHECK `is_directory_entry` |
| B14 | La cible est versionnée avec la définition | Colonnes `target_*` de `definition_version` | Pas de table séparée, pas de report automatique |
| B22 | Les valeurs restent rattachées à leur version | `current_signed_version_id` + `pinned_version_id` | Pointeur, jamais de copie |
| B18 | Partage par lien public | **Retiré** (PRD § 9) — aucun jeton, aucun `public` | Absence actée, pas implémentée |

| ID | Edge case | Approche | Où |
|---|---|---|---|
| E4 | Définition modifiée alors qu'un dashboard la référence | `dashboard_indicator.pinned_version_id` reste sur la version signée | § 3.2 étape 4 |
| E8 | Propriétaire inactif ou parti | CHECK sur `owner_actor_id` + garde applicative → 409 `OWNER_INACTIVE` | `createIndicatorVersion` |
| E15 | Périmètre devenu vide | `scope_expr` est vérifié à la création ; le périmètre **résolu** est renvoyé par le query-engine | § 4.17 |

| ID | Contrainte | Comment elle est respectée |
|---|---|---|
| C1 | L'entrepôt n'est jamais écrit | La slice n'ouvre qu'une connexion de lecture pour vérifier `warehouse_key` |
| C2 | Aucune saisie de données métier | Ce sont des définitions, pas des chiffres |
| C3 | Authentification unique | `owner-picker` lit le miroir `actor` issu de l'IdP |

## 7. Pièges à éviter

- **Un seuil modifiable sur une version signée** — ⚠️ Ne pas offrir d'édition du seuil sur une
  version `signed`. `definition_threshold` est lié par `UNIQUE(definition_version_id)` et la
  version est immuable : changer un seuil, c'est créer une version (B11).
- **Un `owner_picker` en texte libre** — ⚠️ Ne pas dégrader le champ en saisie texte : « l'équipe
  production » produit une règle sans propriétaire, donc **non signable** (B3).
- **Reporter `target_value` automatiquement à la version suivante** — ⚠️ Ne pas le faire. Une cible
  qui suit automatiquement contredit E16 : elle est suspendue (`target_confirmed_at = NULL`) et la
  tuile affiche « cible à reconfirmer » (B14).
- **Un `change_note` qui est un diff de formule** — ⚠️ Ne pas composer `change_note` par différence
  de chaînes. US-17 demande « les lignes sous-traitées ne sont plus comptées », pas `scope_expr`
  ligne 12 modifiée (E19).

## 8. Dépendances

| Dépend de | Nature | Statut | Fallback si absent |
|---|---|---|---|
| `auth` | Session + résolution de l'annuaire | foundations, vague 0 | Aucun : la slice ne peut pas écrire sans identité |
| `design-primitives` | `FormField`, `DataTable`, `SignatureBar` | foundations, vague 0 | Mock en test de composant |
| `query-engine` | Vérification de `warehouse_key` | foundations, vague 0 | `SCHEMA_UNKNOWN` — la création est refusée, pas contournée |

## 9. Checklist de tâches

- [ ] Schémas Zod § 2.1 importés par le client **et** le serveur (jamais recopiés)
- [ ] Migration Drizzle : `actor` (lecture), `indicator`, `definition_version`, `definition_threshold`
- [ ] CHECK `designated_signer_actor_id <> owner_actor_id`
- [ ] `createIndicatorVersion`, `createNextVersion` (§ 3)
- [ ] `OwnerPicker` branché sur la table `actor`, sans saisie libre
- [ ] Écrans `definition-formulaire` et `definitions`
- [ ] Test E2E : une définition ne peut pas être enregistrée sans propriétaire **et** sans signataire

## 10. Critères d'acceptation

- [ ] B3 : un enregistrement sans `owner_actor_id` nommé est refusé par la base, pas par un message
- [ ] B2 : `designated_signer_actor_id = owner_actor_id` est refusé en `409 SIGNER_IS_AUTHOR`
- [ ] B1 : modifier une définition publiée renvoie `409 SIGNED_VERSION_IMMUTABLE`
- [ ] B14 : une version sans cible porte `target_confirmed_at = null` et déclenche E16
- [ ] B22 : la version précédente est identique avant et après la création d'une version

## 11. Plan de tests

| Cible | Scénarios | IDs couverts |
|---|---|---|
| `createIndicatorVersion` | sans propriétaire · sans signataire · signataire = auteur · slug déjà pris · clé d'entrepôt inconnue | B2, B3, B1 |
| `createNextVersion` | version publiée · `expected_version_no` faux · version précédente inchangée | B1, B22, E4 |
| `OwnerPicker` | refuse une saisie libre ; propose l'auteur comme signataire ? **non** | B3, B2 |
| E2E | déclaration complète sans propriétaire → refus expliqué au champ | B3 |

**Statut** : `identified` — à approfondir et valider en Phase 5.
