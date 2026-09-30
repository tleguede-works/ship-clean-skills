---
type: implementation-plan
slice: definition-signer
module: definitions
status: identified
generated_at: 2026-09-30
derived_from:
  - .forge/architecture.md
  - .forge/prd.md
  - .forge/design/design-system.md
  - .forge/design/screens/definition-signature.md
conventions_ref: .forge/conventions.md
---

# Plan d'implémentation — `definition-signer`

> **Vocation de ce document.** Produit en Phase 4 à partir de l'architecture. La Phase 5
> l'approfondit et le valide slice par slice : statut `identified`, pas `planned`.

## Sources

- **PRD** : `.forge/prd.md` — US-2 · B2, B26 · E8
- **Architecture** : `.forge/architecture.md` — § 3.5, § 4.5, § 4.6, § 4.8, § 5.8, § 5.9, ADR-1, ADR-8
- **Design** : `definition-signature.md` — `SignatureBar`, états `revocable` / `locked`

## 1. Résumé de la slice

Signer, refuser avec motif, ou demander la révocation d'une version de définition. Le
signataire est **nominé** et **distinct de l'auteur** : la règle est une contrainte
d'intégrité en base, pas un garde d'interface. Chaque acte est journalisé, et aucun
acte ne modifie un acte précédent.

**User stories** : US-2 (Faire signer une définition)
**Règles** : B2, B26

## 2. Contrats de données (code)

### 2.1 Schémas de validation

```ts
// src/shared/schemas/signature.schema.ts
import { z } from 'zod';

export const signatureRequestSchema = z.discriminatedUnion('act', [
  z.object({ act: z.literal('sign') }).strict(),
  z.object({ act: z.literal('refuse'), reason: z.string().min(1).max(500) }).strict()
]);
export type SignatureRequest = z.infer<typeof signatureRequestSchema>;

export const revocationRequestSchema = z.object({
  reason: z.string().min(1).max(500)
}).strict();
```

### 2.2 Types et interfaces

```ts
// src/features/definitions/signer/signature.types.ts
export type SignatureAct = 'sign' | 'refuse' | 'revoke';
export type SignatureBarState = 'draft' | 'in_review' | 'signed' | 'refused' | 'revocable' | 'locked';

export interface SignatureEvent {
  readonly signatureEventId: string;
  readonly definitionVersionId: string;
  readonly actorId: string;
  readonly act: SignatureAct;
  readonly revokesEventId: string | null;   // renseigné si et seulement si act = 'revoke'
  readonly reason: string | null;          // obligatoire si act = 'refuse'
  readonly occurredAt: string;
}

export interface SignatureDecision {
  readonly state: SignatureBarState;       // `revocable` et `locked` sont distincts (B26)
  readonly versionStatus: 'draft' | 'in_review' | 'signed' | 'refused' | 'published' | 'revoked';
  readonly signerName: string | null;      // jamais l'auteur : la règle est structurelle
  readonly signedAt: string | null;
  readonly refusalReason: string | null;
  readonly revocable: boolean;
}
```

### 2.3 Contrats API

- `POST /api/v1/definitions/:versionId/signature` — architecture § 5.8
- `POST /api/v1/definitions/:versionId/signature/revocation` — architecture § 5.9

## 3. Algorithmes critiques

### 3.1 `signVersion` (couvre B2)

```
ENTRÉES : versionId, act ∈ {sign, refuse}, reason?, actor SessionActor
1  parser le corps par signatureRequestSchema → échec 422
2  charger la version + l'indicateur ; invisible → 404
3  SI act = 'sign' :
3a   SI actor.actorId = version.author_actor_id
       → 409 SIGNER_IS_AUTHOR, message EXPLICITE
       « Vous êtes l'auteur de cette version : l'auto-signature est interdite (B2). »
       (le CHECK § 4.8 de l'architecture le garantit aussi : défense en profondeur)
3b   SI actor.actorId <> indicator.designated_signer_actor_id → 403
3c   SI version.status <> 'in_review' → 409 « Cette version n'est pas en attente de signature. »
3d   SI l'indicateur porte déjà une signature active de cet acteur → 409
4  SI l'indicateur est 'stale_owner' (propriétaire inactif, B17) → 409 OWNER_INACTIVE
5  INSERT signature_event (act, reason, revokes_event_id = NULL)
     — append-only : la ligne précédente n'est pas relue
6  act = 'sign'  → UPDATE definition_version SET status = 'signed'
     act = 'refuse' → UPDATE definition_version SET status = 'draft'  (reste en projet)
7  SI act = 'sign' → UPDATE indicator SET current_signed_version_id = versionId,
                                         officiality = 'official'     (B4)
8  journaliser l'acte : ressource 'definition', outcome 'granted'
9  renvoyer SignatureDecision
```

### 3.2 `revokeSignature` (couvre B26)

```
ENTRÉES : versionId, reason, actor
1  parser revocationRequestSchema → échec 422
2  charger la version ; invisible → 404
3  SI actor <> author ET actor <> owner → 403
4  SI version.published_at IS NOT NULL
     → 409 « Cette version est publiée : sa signature n'est plus révocable. »
       (B26 : seule une nouvelle version + une nouvelle signature peut la remplacer)
5 .signature_active = dernière signature_event act='sign' non révoquée
     absente → 409 « Cette version n'a pas de signature active. »
6  INSERT signature_event (act='revoke', revokes_event_id = signature_active.id)
     L'acte annulé N'EST PAS SUPPRIMÉ : il reste consultable
7  UPDATE definition_version SET status = 'revoked'
8  SI versionId = indicator.current_signed_version_id
     → libérer le pointeur et repasser officiality = 'provisional'
9  journaliser, renvoyer SignatureDecision(state = 'revocable')
```

## 4. Plan composants

```
SignatureModal (client)
├── ProvenanceStrip         version, auteur, date de signature éventuelle
├── SignatureBar state={draft|in_review|signed|refused|revocable|locked}
├── FormField variant="textarea"   reason   (requis si refusal ou révocation)
└── Server Action → signVersion | revokeSignature
```

### 4.2 Composants

| Composant | Type | Fichier cible | Props | State | Événements |
|---|---|---|---|---|---|
| `SignatureModal` | Client | `src/features/definitions/signer/signature-modal.tsx` | `{ version: DefinitionVersion; decision: SignatureDecision }` | `{ submitting: boolean }` | `onSign`, `onRefuse(reason)`, `onRevoke(reason)` |
| `SignatureBar` | Server | `src/components/signature-bar.tsx` | architecture § 2.3 | — | — |
| `ProvenanceStrip` | Server | `src/components/provenance-strip.tsx` | architecture § 2.3 | — | — |

### 4.3 États par écran

#### Écran : `definition-signature`

| État | Condition | Composants affichés | Données |
|---|---|---|---|
| vide | Aucune version à signer | — | — |
| chargement | Chargement de la version | Skeleton | `DefinitionVersion` |
| rempli | `state = in_review` | `SignatureBar` + actions actives | `SignatureDecision` |
| erreur | 409 `SIGNER_IS_AUTHOR` | Message explicite, **action refusée et expliquée** | `ApiErrorBody` |
| vide-données | Aucune version `in_review` | `SignatureBar state="draft"`, mention « aucune version à signer » | — |

### 4.4 Formulaires

| Formulaire | Bibliothèque | Schéma | Soumission | Gestion d'erreur |
|---|---|---|---|---|
| Motif de refus | React Hook Form | `signatureRequestSchema` (`act = refuse`) | Server Action | Erreur au champ, obligatoire |
| Motif de révocation | React Hook Form | `revocationRequestSchema` | Server Action | Erreur au champ |

## 5. Gestion d'état

| Donnée | Portée | Stockage | Initialisation | Mise à jour |
|---|---|---|---|---|
| Version à signer | serveur | `GET` via la ressource `definition` | Ouverture de la modale | Après chaque acte |
| Décision de signature | serveur | Dérivée de `definition_version` + `signature_event` | Idem | `revalidate` |
| Motif saisi | composant | `useState` | Vide | `onChange` |

## 6. Traçabilité des règles

| ID | Règle (PRD) | Implémentée où | Approche |
|---|---|---|---|
| B2 | Signature d'un signataire nommé, distinct de l'auteur | § 3.1 étape 3a + CHECK `signer_is_not_author` | Contrainte d'intégrité **et** garde applicative |
| B26 | Révocable par l'auteur jusqu'à la première publication | § 3.2 étape 4 | `published_at` est la borne ; au-delà, `409` |
| B1 | Une version signée ne se modifie pas | § 3.1 étape 3c, ADR-8 | Le cycle porte sur le statut, jamais sur le contenu |
| B4 | La valeur publiée est celle de la dernière version signée | § 3.1 étape 7 | `current_signed_version_id` |

| ID | Edge case | Approche | Où |
|---|---|---|---|
| E8 | Propriétaire inactif ou parti | § 3.1 étape 4 → 409 `OWNER_INACTIVE` | `signVersion` |

| ID | Contrainte | Comment elle est respectée |
|---|---|---|
| C3 | Authentification unique, session gérée par l'outil | L'acteur vient de `resolveSession()`, jamais du corps de requête |
| C6 | Trois mois | La slice tient dans une modale et trois transactions ; aucun service nouveau |

## 7. Pièges à éviter

- **Un garde d'interface pour l'auto-signature** — ⚠️ Ne pas se contenter de retirer l'auteur de la
  liste des signataires. La règle est un `CHECK` en base (§ 4.8 de l'architecture) : un appel API
  direct ou un script de reprise doit échouer aussi (ADR-1).
- **Un `revoke` qui met à jour la ligne `sign`** — ⚠️ Ne pas faire `UPDATE signature_event SET
  revoked = true`. La trace d'une signature annulée doit rester consultable : `revoke` est un
  **nouvel** acte qui référence l'ancien (`revokes_event_id`).
- **`revocable` et `locked` rendus de la même façon** — ⚠️ Ne pas afficher un bouton « révoquer »
  sur une version publiée. B26 l'interdit, et un rendu commun ferait croire qu'une signature
  publiée se reprend en un clic.
- **La délégation de signature** — ⚠️ Ne pas ajouter de `delegated_to` ni de drapeau
  `allow_delegation` : le rôle n'est pas pourvu (`F-001`) et une délégation changerait la nature de
  B2. Si le besoin apparaît, c'est une nouvelle version et un autre signataire désigné (ADR-1).

## 8. Dépendances

| Dépend de | Nature | Statut | Fallback si absent |
|---|---|---|---|
| `auth` | Identité de l'acteur + rôle `signataire` | vague 0 | Aucun : sans identité, aucun acte |
| `definition-declarer` | Table `definition_version`, statut `in_review` | vague 1 | Mock de la table en test d'intégration |

## 9. Checklist de tâches

- [ ] Migration Drizzle : `signature_event` + index `one_active_signature_per_signer`
- [ ] CHECK `signer_is_not_author`, `refusal_has_reason`, `revoke_targets_signature`
- [ ] `signVersion`, `revokeSignature` (§ 3)
- [ ] Rôle SQL applicatif **sans** `UPDATE`/`DELETE` sur `definition_version`
- [ ] Écran `definition-signature`, états `revocable` / `locked`
- [ ] Test d'intégration : un `INSERT` qui viole B2 **échoue en base**

## 10. Critères d'acceptation

- [ ] B2 : un `INSERT` direct violant `signer_id ≠ author_id` est rejeté par PostgreSQL
- [ ] B2 : l'auteur voit un refus **expliqué**, pas une action simplement désactivée
- [ ] B26 : après `published_at`, la révocation renvoie `409` et propose une nouvelle version
- [ ] US-2 : qui, quand et sur quelle version est consultable après toute signature
- [ ] Un refus conserve la version en projet et son motif

## 11. Plan de tests

| Cible | Scénarios | IDs couverts |
|---|---|---|
| `signVersion` | auteur = signataire · signataire non désigné · version déjà signée · propriétaire inactif · refus sans motif | B2, B17, B26 |
| `revokeSignature` | version publiée · pas de signature active · auteur ≠ propriétaire | B26 |
| Contrainte SQL | `INSERT` auto-signature · `refuse` sans raison | B2, ADR-1 |
| `SignatureBar` | `signed` vs `locked` vs `revocable` rendus distincts | B26 |
| E2E | un directeur du site signe une définition dont il n'est pas l'auteur | B2 |

**Statut** : `identified` — à approfondir et valider en Phase 5.
