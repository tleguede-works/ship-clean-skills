# AGENTS.md — Atelier

## Le projet

Atelier sert à faire un devis **devant le client**, l'envoyer, le faire signer, puis
facturer. La personne qui s'en sert est un artisan menuisier, Jean-Luc, qui travaille
seul, dans son atelier et sur les chantiers. Il n'a ni ordinateur portable ni bureau :
il a un téléphone et une tablette, et il passe une bonne partie de la semaine sur un
chantant, souvent sans réseau.

**Ce que Jean-Luc sait faire** : poser une fenêtre, chiffrer un devis, facturer.
**Ce qu'il ne sait pas** : ce qu'est un serveur, un framework, une migration, une
« signature qualifiée » ou un prestataire de paiement. Toute exigence qui suppose
qu'il comprenne un de ces mots produit une demande qu'il ne peut pas arbitrer.

## L'état réel du projet — 2026-10-01

| Phase | Statut | Ce qui manque |
|---|---|---|
| 0 Bootstrap | terminé | **Le contrat n'est pas signé.** Cinq champs de signature sont `[à compléter]` : SIRET de Jean-Luc, raison sociale de Forge, adresse, téléphone, courriel. |
| 1 PRD | terminé | — |
| 2 Roadmap | terminé | — |
| 3 Design | terminé | `clients.md` et `export.md` sont inventoriés par le design system et n'existent pas. |
| 4 Architecture | terminé | — |
| 5 Plans | **en cours** | 14 plans sur 20 tranches. Les 6 tranches V1 (S15–S20) n'ont pas de plan : Q-004, Q-006 et le jour de la relance sont ouverts. |

**Trois portes sont rouges**, et elles ont raison :

- `contract_complete` — personne n'a signé.
- `slice_plan_exists` — 6 tranches déclarées sans plan.
- `premises` en avertissement — 6 exclusions du PRD sans identifiant, la forme ordinaire.

## La stack est décidée

**Elle l'est depuis le 2026-10-01**, et le jeu de règles existe : `.opencode/rules/`,
371 lignes, écrit contre cette stack par le deuxième appel de
`project-rules-architect`. Trois règles contraignantes :

| Règle | Ce qu'elle interdit | Où |
|---|---|---|
| Horloge injectable | `Date.now()` et `new Date()` hors de `packages/horloge/` | `.opencode/rules/10-horloge.md` |
| Écriture locale d'abord | toute écriture qui ne passe pas par le magasin local ; la file est ordonnée par **rang**, jamais par horodatage | `.opencode/rules/20-ecriture-locale.md` |
| Empreinte avant l'envoi | envoyer un devis dont l'empreinte ne correspond plus au texte signé | `.opencode/rules/30-empreinte.md` |

`opencode.json` charge les deux surfaces : `AGENTS.md` et `.opencode/rules/*.md`.

**Ne recopie pas la stack ici.** Elle est dans `.forge/conventions.md` et
`.forge/architecture.md`, et la répéter en fait un deuxième propriétaire qui devient
faux à la première mise à jour de dépendance.

## Qui tient ces quatre fichiers

`AGENTS.md`, `SESSION_LOG.md`, `DECISIONS.md` et `LEARNINGS.md` sont la mémoire du
projet d'une session à l'autre. **L'agent les tient à jour, lui seul.** Ni le skill de
planification — qui possède `.forge/` — ni l'architecte de règles n'y écrivent, et
personne n'en garde une seconde copie ailleurs. Leur valeur se cumule, et c'est
précisément ce qui les rend faciles à détruire en doublon : un qui ajoute, un qui
écrase, et la perte ne se voit pas.

## Propriété des faits

| Fichier | Tient |
|---|---|
| `.forge/state.json` | Statut des livrables, hashes, ID — autorité, jamais édité à la main |
| `.forge/contract.md` | Ce qui est livré, exclu, irréversible, et qui décide. **Le seul document que le client signe.** |
| `.forge/conventions.md` | La stack, datée |
| `.forge/architecture.md` | Fondations, tranches, vagues |
| `.opencode/rules/` | Les règles de code, écrites contre la stack |
| `DECISIONS.md` | Les décisions **fermées** (ADR) et les questions ouvertes |
| `LEARNINGS.md` | Les correctifs, avec leur domaine de promotion |
| `SESSION_LOG.md` | Le récit de la session |

## Index

| Fichier | Ce qu'on y écrit | Déclencheur |
|---|---|---|
| `SESSION_LOG.md` | Ce qui s'est passé, une entrée par session, **8 champs nommés dans l'ordre** | **Tu ouvres une session** : tu écris l'entrée **avant** de terminer, jamais pendant |
| `DECISIONS.md` | Les décisions **fermées** (ADR) et les questions ouvertes avec leur déclencheur | **Tu tranches quelque chose qu'une session future rediscuterait**, ou une question ouverte atteint sa condition de fermeture |
| `LEARNINGS.md` | Les correctifs, un par ligne, chacun avec sa destination de promotion | **Tu te trompes une deuxième fois sur la même chose**, ou tu découvres un contournement qui n'est pas un comportement |

Les trois déclencheurs sont distincts, et chacun est une **condition** — un moment que
l'agent reconnaît seul. Une catégorie (« Corrections ») est une description ; une
condition (« la deuxième fois que tu te trompes ») est un déclencheur.

`AGENTS.md` n'a pas de déclencheur : il est chargé à chaque session, et c'est lui qui
déclenche les trois autres.

## Les trois fichiers, en détail

### `SESSION_LOG.md`

Tient le récit : ce qui s'est passé et dans quel ordre, y compris les hésitations.
Huit champs nommés, dans cet ordre : `STARTED FROM` · `DECIDED` · `REJECTED` ·
`BLOCKED` · `FILES TOUCHED` · `STATUS` · `NEXT SESSION SHOULD` ·
`NEXT SESSION SHOULD NOT`.

Son champ le plus cher est **`REJECTED`** — ce qui a été écarté et pourquoi. C'est le
seul endroit qui empêche une session future de reproposer la même chose, et sur ce
projet il y en avait besoin dès la première session : la comptabilité, l'encaissement
par carte, la signature qualifiée, le SMS.

### `DECISIONS.md`

Tient les décisions **fermées**. Une décision y est close : ni reproposée, ni retournée
silencieusement. Le fichier est append-only, donc une décision fausse est
**supersédée** par une nouvelle qui la nomme, jamais réécrite. Les questions que le
projet ne peut pas encore répondre y sont aussi, chacune avec le déclencheur qui la
fermera.

### `LEARNINGS.md`

Tient les correctifs, un par ligne, la faute étant écrite comme un **contraste** — « ne
pas X, le comportement correct est Y » — parce qu'une description d'incident devient
fausse quand le code change. Chaque entrée nomme sa destination de promotion, et le jeu
de règles **existe maintenant** : la promotion a donc lieu.

## À lire avant d'agir

1. Ce fichier, pour savoir où on en est et ce qui est rouge.
2. `SESSION_LOG.md` en entier, pour savoir d'où la session précédente s'est arrêtée.
3. `DECISIONS.md`, pour ne pas reproposer une décision fermée — et pour vérifier qu'aucune
   question ouverte n'a atteint sa condition de fermeture.
4. `.opencode/rules/` avant d'écrire du code.