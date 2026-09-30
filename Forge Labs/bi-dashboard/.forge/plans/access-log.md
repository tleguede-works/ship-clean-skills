---
type: implementation-plan
slice: access-log
module: foundations
status: identified
generated_at: 2026-09-30
derived_from:
  - .forge/architecture.md
  - .forge/prd.md
  - .forge/conventions.md
conventions_ref: .forge/conventions.md
---

# Plan d'implémentation — fondation `access-log`

> **Vocation de ce document.** Produit en Phase 4 à partir de l'architecture § 2.4. La
> Phase 5 l'approfondit et le valide : statut `identified`, pas `planned`.

## 1. Résumé

Journal d'accès **append-only**, conservé un an, purgé automatiquement, et surtout
**filtré selon les droits de celui qui le consulte** (B25). C'est la seule surface du
système où la restriction de visibilité pourrait être contournée : le journal ne lit pas
l'entrepôt, il **nomme** des ressources. Ne dépend d'aucune autre fondation.

**Règles** : B10, B23, B25 · **Edge cases** : E5, E14
**Contraintes** : C4, C10

## 2. Contrats de données

Contrats : architecture § 2.4 (`AccessLogEntry`, `JournalFilter`, `JournalPage`,
`AccessLogFoundation`). Entité : `access_log` (architecture § 4.14).

## 3. Algorithmes critiques

### 3.1 `append` — écriture seule, sur le chemin critique (couvre B10, C4)

```
1  INSERT access_log (…, occurred_at = now(), expires_at = now() + 365 j)
2  AUCUN UPDATE, AUCUN DELETE du rôle applicatif :
     GRANT INSERT, SELECT ON access_log TO amberline_app ;
     -- ni UPDATE, ni DELETE, ni TRUNCATE
   C'est ce qui rend « le journal est en écriture seule pour l'application »
   (7.2) vérifiable par un test d'intégration et non par une intention.
3  ÉCHEC D'INSERT : l'entrée est mise en file de réessai et l'échec est remonté.
   On n'avale JAMAIS l'échec : une consultation non journalisée est une
   consultation qui n'a pas eu lieu.
4  RIEN n'est écrit après coup : l'appelant journalise AVANT la lecture, pour que
   la tentative reste prouvable même si la source tombe ensuite (E1).
```

### 3.2 `list` — le filtre est ici, pas chez l'appelant (couvre B25, ADR-6)

```
ENTRÉES : JournalFilter, viewer SessionActor
1  habilitation de l'appelant — DERNIÈRE LIGNE DE DÉFENSE, pas la première :
   la fondation vérifie aussi, même si la slice l'a déjà fait
2  ressources_visibles = résolution des droits du viewer, une fois par ressource
     indicateurs → auth.resolveIndicatorAccess
     dashboards  → auth.resolveDashboardAccess
     UN SEUL type de ressource est résolu pour éviter un appel par ligne
3  totalAll     = COUNT(*) sur le filtre demandé
   totalVisible = COUNT(*) sur (filtre demandé ∩ ressources_visibles)
4  SELECT … WHERE filtre ∩ droits ORDER BY occurred_at DESC LIMIT …
5  renvoyer { entries, nextCursor, totalVisible, redactedCount: totalAll - totalVisible }
```

> `redactedCount` n'est pas décoratif : il dit combien d'entrées existent sans être
> visibles. Un journal filtré **et muet** passerait pour un journal complet ; l'omission
> serait alors invisible, ce qui est pire que l'omission elle-même.

### 3.3 Ce que le journal ne contient pas (couvre B25)

```
INTERDIT dans access_log :
  ✗ le détail des lignes consultées        → une ligne interdite ne doit pas
                                            exister dans la trace de quelqu'un d'autre
  ✗ le nombre de lignes renvoyées           → 0 vs 12 sur un client interdit sont
                                            deux réponses différentes : fuite
  ✗ la payload brute d'une requête          → données clients, RGPD (C10)
  ✗ un `computed_at`                        → la date de calcul d'une SOURCE n'a
                                            rien à faire dans un journal d'accès
AUTORISÉ :
  ✓ actor_id, resource_kind, resource_slug   (même en cas de REFUS)
  ✓ scope_teams, scope_period
  ✓ outcome, error_code, request_id, occurred_at
```

### 3.4 `purgeExpired` (couvre B10, C4)

```
1  job planifié quotidien, rôle SQL DISTINCT du rôle applicatif, journalisé
2  DELETE FROM access_log WHERE expires_at < now()
3  le rapport (nombre de lignes purgées) est journalisé dans le journal d'audit
   applicatif, jamais dans access_log lui-même
```

## 4. Plan de composants

Aucun composant d'interface : la fondation est serveur. Elle est consommée par
`historique-indicateur` (journalisation B24), `journal-acces` (lecture, export) et par
toutes les slices qui écrivent une entrée.

## 5. Gestion d'état

| Donnée | Portée | Stockage | Initialisation | Mise à jour |
|---|---|---|---|---|
| Journal | serveur | `access_log` | INSERT à la consultation | Jamais modifié |
| Filtre de droits | serveur | Résolu par requête, ≤ 200 ressources | Par lecture | — |
| Purge | job planifié | `expires_at` | Quotidien | Automatique |

## 6. Traçabilité des règles

| ID | Règle | Implémentée où | Approche |
|---|---|---|---|
| B10 | Toute consultation est journalisée, refus compris ; conservé un an | § 3.1, § 3.4 | INSERT + `expires_at = +365 j` + purge planifiée |
| B23 | Seules des personnes nommées consultent le journal, et cette consultation est journalisée | § 3.2 étapes 1, + entrée `resource_kind = 'journal'` | Vérification dans la fondation **et** dans la slice |
| B25 | Le journal est filtré selon les droits du lecteur | § 3.2 étapes 2-5 | Filtre ici, pas chez l'appelant ; `redactedCount` rendu |
| B25 | Un refus journalise la ressource, jamais le détail des lignes | § 3.3 | Absence de colonnes, vérifiée par relecture du schéma |

| ID | Edge case | Approche | Où |
|---|---|---|---|
| E5 | Ressource interdite visée par un tiers | Entrée journalisée avec `resource_slug` ; **invisible** pour un lecteur non habilité | § 3.2 étapes 2-3 |
| E14 | Groupe d'accès modifié | La composition **en vigueur** est celle de la lecture courante | `actor_group_member.valid_to` |
| E1 | Source indisponible | L'entrée est écrite **avant** la lecture : la tentative reste prouvable | § 3.1 étape 4 |

| ID | Contrainte | Comment elle est respectée |
|---|---|---|
| C4 | Journal conservé un an, purgé automatiquement, consultable | `expires_at` + job quotidien + endpoint de consultation |
| C10 | Chiffrement au repos, isolation par ligne, PITR, rétention | Le journal est dans PostgreSQL, hors entrepôt ; rôle sans `UPDATE`/`DELETE` |
| 7.2 | Le journal est en écriture seule | Contrainte de droits SQL, testée |

## 7. Pièges à éviter

- **Un filtre dans la slice appelante** — ⚠️ Ne pas laisser `journal-acces` implémenter le filtre
  B25. C'est une règle de sécurité transverse : mise en place à chaque endroit, elle sera oubliée une
  fois. Elle est ici, derrière une seule porte.
- **Un journal non filtré « réservé à quelques personnes »** — ⚠️ Ne pas faire. Le journal nomme les
  ressources : dire qu'un indicateur existe, qui l'a consulté et à quelle fréquence divulgue ce que
  l'écran nie (E5, ADR-6).
- **Un filtre muet** — ⚠️ Ne pas renvoyer la page amputée sans l'annoncer. `redactedCount` est rendu à
  l'interface.
- **Une purge manuelle** — ⚠️ Ne pas offrir de `DELETE` dans l'application. La purge est automatique,
  par un rôle distinct, et elle est journalisée (C4).
- **Un `UPDATE` de `occurred_at` pour « corriger » une heure** — ⚠️ Ne pas. Le journal est
  append-only ; une correction se raconte dans une nouvelle entrée.
- **Journaliser après coup, dans un middleware de réponse** — ⚠️ Ne pas. Si la source tombe, l'entrée
  n'existe pas, et la tentative la plus importante à prouver est celle qui a échoué.

## 8. Dépendances

Aucune. Consommée par `historique-indicateur` et `journal-acces`, et par toute slice qui
écrit une entrée. Elle **consomme** `auth` pour résoudre les droits du lecteur, mais ne
dépend pas de lui dans le graphe : l'injection se fait par l'appelant, qui fournit un
`SessionActor` déjà résolu.

## 9. Checklist de tâches

- [ ] Migration Drizzle : `access_log` + 3 index (`actor_id`, `resource_slug`, `occurred_at`)
- [ ] Rôles SQL : `amberline_app` (`INSERT`, `SELECT`), `amberline_purger` (`DELETE`)
- [ ] `append`, `list`, `purgeExpired`
- [ ] Job quotidien de purge, rapport journalisé
- [ ] Test d'intégration : `UPDATE` et `DELETE` refusés au rôle applicatif
- [ ] Test : `redactedCount` exact sur un jeu dont on connaît la répartition des droits
- [ ] Test : aucune entrée ne contient de détail de ligne

## 10. Critères d'acceptation

- [ ] B10 : toute consultation est journalisée, refus compris ; la purge à un an est automatique
- [ ] 7.2 : l'application ne peut ni modifier ni purger une entrée
- [ ] B25 : la liste renvoyée ne contient aucune entrée hors des droits du lecteur
- [ ] B25 : `redactedCount` rend visible le fait que le journal est filtré
- [ ] C4 : la purge passe par un rôle distinct et elle est journalisée

## 11. Plan de tests

| Cible | Scénarios | IDs couverts |
|---|---|---|
| `append` | consultation · refus · `not_found` · échec d'écriture mis en file | B10 |
| `list` | lecteur habilité · non habilité · entrées filtrées · `redactedCount` | B23, B25 |
| `list` | ressource interdite invisible · `resource_slug` présent sur le refus | B25, E5 |
| `purgeExpired` | purge à 365 j · lignes plus récentes conservées | B10, C4 |
| Intégration SQL | `UPDATE` / `DELETE` / `TRUNCATE` refusés | 7.2, C4 |
| Schéma | aucune colonne ne peut contenir un détail de ligne | B25 |

**Statut** : `identified` — à approfondir et valider en Phase 5.
