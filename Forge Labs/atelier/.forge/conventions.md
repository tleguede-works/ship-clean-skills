---
type: conventions
status: approved
generated_at: 2026-10-01
---

# Conventions techniques — Atelier

> Document unique. Les plans d'implémentation (Phase 5) y font référence plutôt que de
> reformuler ces règles. Toute règle vague doit être reformulée en règle concrète avant
> validation. Les sections marquées `À DÉCIDER EN PHASE 4` seront complétées en Phase 4.

---

## Stack technique cible

<!--
  `À DÉCIDER EN PHASE 4`        la décision peut attendre la Phase 4 : elle se déduit
                                de l'architecture, et la changer ne coûte rien.

  `À DÉCIDER AVANT LA PHASE 1`  la décision engage quelque chose qu'on ne reprend pas :
                                un achat, un abonnement, un engagement juridique. Elle
                                se tranche pendant l'interview, parce que la réponse
                                change ce qu'on achète — pas seulement le code.
-->

| Domaine | Choix | Version | Justification |
|---|---|---|---|
| Langage | TypeScript, mode `strict` | 5.9 | Un logiciel qui doit tenir cinq ans sans auteur disponible ne peut pas accumuler de `any`. Le `strict` rend le typage vérifiable par le compilateur. |
| Cadre | Next.js, rendu application | 15.5 | Jean-Luc travaille sur chantier, au téléphone. Une application installable tient dans le budget de contexte, alors qu'un site responsive àStretch se relit à chaque changement d'écran. |
| Base de données | PostgreSQL, hébergement UE | 17 | Les devis et les factures portent des données personnelles de clients. La localisation de l'hébergement est un engagement, pas un réglage. |
| Accès aux données | Drizzle ORM | 0.44 | Les requêtes sont lisibles et le schéma est la source ; pas de couche qui masque ce qui part en base. |
| Magasin local | SQLite compilé, sur OPFS | 3.46 | Un devis se fait sur un chantier sans réseau. Un magasin que le navigateur peut vider à sa guise ne tient pas un devis. |
| Signature | Signature tracée sur l'appareil | — | Voir Q-002 : la signature qualifiée coûte 1 à 3 € par signature, la signature tracée est admissible pour un devis. Le choix engage un achat, donc il est bloquant. |
| **Identité du signataire** | Signature **tracée** sur l'appareil, par Jean-Luc | 0 € | Jean-Luc signe seul de sa main, devant le client, et l'application conserve la date, l'heure et l'empreinte exacte du devis. La signature qualifiée (1 à 3 € par devis) est réservée aux actes qu'elle est légalement exigée pour — ce n'est pas le cas d'un devis. **Tranché par le contrat § 3 et § 5, au 2026-10-01.** |
| **Hébergement et nom de domaine** | Hébergeur UE de Forge + nom en `.fr` choisi par Jean-Luc | 5,99 €/mois et 24 € pour deux ans | Engagement de 12 mois, 95,88 € la première année. Le nom est **l'adresse que les clients ont dans leurs courriels** : elle ne change pas même si Forge change de service. **Tranché par le contrat § 3, au 2026-10-01.** |
| **Expéditeur des courriels** | Boîte à Jean-Luc seul, offre gratuite | 0 € jusqu'à 3 000 envois | Sur la base de 30 devis par an et 2 à 3 courriels par devis, il reste très large. Si l'offre gratuite prend fin, Forge prévient 3 mois avant et Jean-Luc change de boîte sans perdre son adresse. **Tranché par le contrat § 3, au 2026-10-01.** |
| Validation | Zod, un schéma par entité | 4.1 | Une valeur acceptée par Zod et refusée par PostgreSQL est un bug de génération, et il se voit parce que les deux listes sont côte à côte. |
| State management | Zustand | 5.0 | L'état global du produit est un compteur de synchronisation, une connectivité et un compteur de documents non envoyés. Un magasin unique lisible hors de React est la seule forme qui permette de piloter l'interface depuis un test. |
| Tests unitaires | Vitest + fast-check | 3.2 | Le garde-fou est une propriété, pas un cas : sans générateur de propriétés, une propriété n'est pas testée, elle est affirmée. |
| Tests bout en bout | Playwright en mode hors ligne | 1.55 | Les trois démonstrations sont au niveau appareil : sans réseau, hors du cabinet, et en signant. Une simulation ne prouve rien de ces trois-là. |
| Lint / format | ESLint 9 + Prettier | 9.17 | Le plugin n'est pas le sujet : la règle qui compte est `no-restricted-syntax` sur `Date.now` et `new Date` en dehors du paquet `horloge`. C'est l'application mécanique de la décision d'horloge simulée. |

---

## Écriture locale d'abord

**La règle.** Toute écriture passe par le magasin local, puis par l'envoi. Aucune
écriture ne va directement au serveur, et aucune action utilisateur ne suppose le réseau.

**Pourquoi.** Jean-Luc est sur un chantier une bonne partie de la semaine, et une cave
n'a pas de réseau. Un produit qui suppose la connexion perd le devis au moment précis où
il se fait — devant le client, qui attend.

**Ce que la règle ne dit pas.** Elle ne dit pas que l'envoi réussit. Une écriture
locale n'est pas une écriture confirmée, et la différence est visible à l'écran, avec
ses trois mots : **écrit ici, pas encore envoyé** · **envoyé** · **la date limite** qui
approche.

---

## Horloge injectable

**La règle.** L'heure vient d'un paquet unique. `Date.now()` et `new Date()` sont
interdits ailleurs, et ESLint le bloque.

**Pourquoi.** Un devis a une durée de validité. Une facture a des échéances. Une relance
a une date. None de ces trois choses ne peut se démontrer en attendant le moment où elle
arrive : « ça marche » ne prouve pas qu'une relance part au bon jour.

**Le test qui en découle.** Les trois démonstrations attendues sont : un devis produit
le 28 du mois et expiré le 3 du suivant ; une facture payée à 30 jours, puis relancée ;
et l'ensemble fait sans réseau, avec la seule horloge avancée.

---

## Ce que ce projet ne fait pas

| ❌ Jamais | Pourquoi |
|---|---|
| Une application de comptabilité | Jean-Luc n'a ni compte, ni expert en la matière ; le logiciel lui fabrique un travail qu'il n'a pas demandé. |
| Un catalogue de fournitures avec stock | C'est un métier de négoce, pas de menuiserie. Le stock n'a qu'une seule source de vérité utile : ce que le devis a dit. |
| La gestion du chantier, la main d'œuvre, les plannings d'équipe | Jean-Luc est seul. Un outil à plusieurs utilisateurs est un produit pour quelqu'un d'autre. |
| Un paiement intégré | La demande de paiement d'un particulier à un artisan se fait par virement ou chèque. Un prestataire de paiement coûte un pourcentage **sur chaque facture** — c'est un engagement récurrent sur le chiffre d'affaires, pas un coût fixe. |