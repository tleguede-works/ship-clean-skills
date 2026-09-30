---
type: implementation-plan
slice: auth
module: foundations
status: identified
generated_at: 2026-09-30
derived_from:
  - .forge/architecture.md
  - .forge/prd.md
  - .forge/conventions.md
conventions_ref: .forge/conventions.md
---

# Plan d'implémentation — fondation `auth`

> **Vocation de ce document.** Produit en Phase 4 à partir de l'architecture § 2.1. La
> Phase 5 l'approfondit et le valide : statut `identified`, pas `planned`.
> Les contrats de données complets sont dans l'architecture ; ce plan décrit **comment** les
> obtenir, pas ce qu'ils contiennent.

## 1. Résumé

Échange OIDC, cookie de session de 8 h, résolution d'un `SessionActor` depuis
l'annuaire, résolution des droits de ligne, refus d'auto-signature, rate limit par
session. **Ne dépend d'aucune autre fondation** : elle est en vague 0.

**Règles** : B7 (base de fail-closed), B9, B23, B2 (garde d'auto-signature) · E14
**Contraintes** : C3, C10

## 2. Contrats de données

Contrats : `.forge/architecture.md` § 2.1 (`SessionActor`, `AccessDecision`,
`AuthFoundation`, `scopeSchema`). Schémas Zod : `src/shared/schemas/scope.schema.ts`
(partagés avec `restriction-lignes`).

Entités : `actor`, `actor_group`, `actor_group_member`, `session` (architecture § 4.2-4.4,
§ 4.16).

## 3. Algorithmes critiques

### 3.1 `resolveSession` (fail-closed)

```
1  lire le cookie `amberline_session` ; absent → null
2  charger `session` ; absente, expirée ou `revoked_at <> NULL` → null
3  vérifier `oidc_iss` == l'émetteur attendu (rotating keys) → sinon null + journal
4 .actor = charger `actor` par `actor_id`
5  SI .actor absent OU is_active = false
     → session révoquée + null      (B17 : un compte qui perd son accès cesse à la
                                      lecture suivante, sans intervention — E14)
6  équipes accordées = groupes de l'appelant ∪ équipes directes, RÉÉVALUÉES MAINTENANT
   — jamais relues depuis le cookie ni depuis `session.rights_snapshot`
7  renvoyer SessionActor
```

### 3.2 `resolveIndicatorAccess`

```
1  granted = intersections(actor.groupCodes actifs, indicator.teams déclarées)
   droits directs ajoutés s'ils existent
2  SI granted = ∅ → { allowed: false, reason: 'not_granted', missingTeamCodes: demandé }
3  SI indicator.owner_actor_id est inactif → { allowed: false, reason: 'owner_inactive' }
4  effective.teams = requested.teams ∩ granted
   SI vide → { allowed: false, reason: 'not_granted', missingTeamCodes: demandé \ granted }
5  effective.période = requested.période ∩ indicator.période déclarée
   (une définition ne s'étend pas au-delà de sa propre période)
6  → { allowed: true, scope: effective, reason: 'granted' }
```

> Il n'existe **aucun** chemin par lequel une panne de l'annuaire produit un droit.
> `AccessDecision` n'a pas de troisième cas : « inconnu » est un refus
> (`archetypes.md` § 9, « Fail-open sur une autorisation »).

### 3.3 `assertCanSign`

```
1  version = charger la version de définition
2  SI actor.actorId = version.author_actor_id
     → ApiError SIGNER_IS_AUTHOR (« l'auto-signature est interdite »)
3  SI actor.actorId <> indicator.designated_signer_actor_id
     → ApiError FORBIDDEN
4  SI actor.is_signer = false
     → ApiError FORBIDDEN : le rôle est décrit mais non pourvu (F-001)
```

## 4. Plan de composants

Aucun composant d'interface : la fondation est serveur. Elle expose un middleware
`requireSession()` et un `withRateLimit()` utilisés par toutes les slices.

## 5. Gestion d'état

| Donnée | Portée | Stockage | Initialisation | Mise à jour |
|---|---|---|---|---|
| Session | cookie HttpOnly, 8 h | `session` en table | Connexion OIDC | Rotation à chaque élévation de droit |
| Droits de ligne | serveur | Réévalués par requête | — | Jamais mis en cache client |
| Identités | serveur | miroir `actor` | Réconciliation quotidienne avec l'annuaire | `is_active` propagé |

## 6. Traçabilité des règles

| ID | Règle | Implémentée où | Approche |
|---|---|---|---|
| B2 | L'auteur ne signe jamais sa propre version | § 3.3 + CHECK en base (`definition-signer`) | Défense en profondeur : type + garde applicative + contrainte |
| B7 | La restriction porte sur la donnée | § 3.2 | Les droits sont résolus **avant** la requête, jamais pendant |
| B9 | L'accès est une liste nominative ou un groupe | § 3.2 | Groupes d'annuaire répliqués en local |
| B23 | Journal réservé à des personnes nommées | § 3.1 | Habilitation `auditeur` + `is_directory_entry` |
| E14 | Perte d'accès immédiate | § 3.1 étape 5 | `revoked_at` + réévaluation par requête |

| ID | Contrainte | Comment elle est respectée |
|---|---|---|
| C3 | SSO, hébergement UE, aucun mot de passe stocké | OIDC uniquement ; cookie opaque ; pas de champ mot de passe nulle part |
| C10 | Données personnelles | Table `session` chiffrée au repos, purgée à l'expiration |

## 7. Pièges à éviter

- **Un droit mis en cache dans le cookie** — ⚠️ Ne pas mettre d'équipes dans le cookie. Une perte
  d'accès doit s'appliquer à la **lecture suivante** (E14) : il faut donc résoudre à chaque requête.
- **Un `can(...) ?? true`** — ⚠️ Ne pas écrire de résolveur qui rend `true` par défaut. C'est
  exactement la pathologie « fail-open sur une autorisation » : une panne de droits devient un
  droit d'écriture.
- **Un jeton dans l'URL** — ⚠️ Ne jamais. B18 est **retiré** : le partage passe par
  `dashboard_grant`, et une adresse restitue un état, jamais un droit (B9).
- **Une session plus longue que la journée** — ⚠️ Ne pas dépasser 8 h sans rotation. La session doit
  survivre à une journée de travail, pas à une absence de plusieurs jours.
- **`is_active` lu une fois et mis en cache** — ⚠️ Ne pas cache l'état actif d'un acteur. C'est
  précisément ce que B17 et E14 demandent de voir à jour.

## 8. Dépendances

Aucune. C'est la condition de six slices ; c'est aussi le point de contention maximal du
graphe (architecture § 6.4).

## 9. Checklist de tâches

- [ ] Client OIDC : redirection, échange de code, vérification d'audience et d'émetteur
- [ ] Middleware `requireSession()` + rotation
- [ ] `resolveIndicatorAccess`, `resolveDashboardAccess`, `assertCanSign`
- [ ] `withRateLimit(bucket)` : `indicator_read`, `decomposition`, `export_create`, `journal_read`
- [ ] Réconciliation quotidienne de l'annuaire → `actor`, `actor_group_member`
- [ ] Test : fournisseur injoignable ⇒ **tout** est refusé, rien n'est accordé
- [ ] Test : `is_active` passé à false ⇒ lecture suivante refusée

## 10. Critères d'acceptation

- [ ] C3 : aucun mot de passe n'est stocké ; la session expire à 8 h
- [ ] B7 : une panne de l'annuaire ne produit aucun droit
- [ ] E14 : un compte qui perd son accès cesse d'accéder à la lecture suivante
- [ ] B2 : l'auteur ne peut pas signer sa propre version, la raison est rendue en clair

## 11. Plan de tests

| Cible | Scénarios | IDs couverts |
|---|---|---|
| `resolveSession` | cookie absent · session expirée · session révoquée · `oidc_iss` inconnu · acteur inactif | C3, E14, B17 |
| `resolveIndicatorAccess` | équipes accordées ∅ · intersection vide · période restricted · propriétaire inactif | B7, B17 |
| `assertCanSign` | auteur = signataire · signataire non désigné · acteur non habilité | B2, F-001 |
| `withRateLimit` | dépassement par bucket | 7.2 |

**Statut** : `identified` — bloqué sur le **fournisseur d'identité nommé** (PRD § 12.1,
point 2). Le code est fail-closed : sans fournisseur, tout est refusé, ce qui est correct
mais rend le produit inutilisable tant que le nom n'est pas donné.
