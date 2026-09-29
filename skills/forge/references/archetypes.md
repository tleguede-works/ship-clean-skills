# Archétypes d'application — standards de référence

> **Une application est rarement entièrement nouvelle.** Il existe presque toujours des produits similaires, des conventions établies, des patterns que les utilisateurs attendent déjà. Ce document fournit ces standards par archétype, pour que Forge puisse **comparer** un plan à ce qui se fait plutôt que d'inventer de zéro.

Utilisé par : Phase 3 (navigation, direction design), Phase 4 (découpage), et l'agent `plan-validator` en mode Fast Track.

---

## Comment utiliser ce document

1. Identifier l'archétype dominant (§ tableau). Un produit peut être hybride : noter l'archétype principal et le secondaire.
2. Lire la fiche de l'archétype.
3. **Comparer** : le plan Proposed est-il cohérent avec la boucle de travail, le modèle de navigation et les modules standards de l'archétype ?
4. **Écrire les écarts** dans `.forge/benchmarks.md` avec une justification : « on s'écarte parce que… » ou « on ne s'écarte pas ».

Un écart non justifié n'est pas automatiquement une erreur — mais il doit être **visible et assumé**.

---

## Tableau de correspondance

| Archétype | Signal d'identification | Fiche |
|---|---|---|
| `mobile_field_ops` | Opérateur sur le terrain, données saisies, hors-ligne | §1 |
| `mobile_consumer` | Usage quotidien grand public, engagement | §2 |
| `marketplace` | Deux parties, mise en relation, recherche | §3 |
| `dashboard` | Surveillance, alertes, lecture de métriques | §4 |
| `admin_crud` | Back-office, densité, gestion de référentiels | §5 |
| `transactional_web` | Tunnel d'achat / inscription / paiement | §6 |
| `booking` | Réservation de créneau / de ressource | §7 |
| `rental_tenancy` | Location de biens, baux, loyers, garanties, encaissements | §8 |

---

## §1 — `mobile_field_ops`

**Boucle de travail** : consulter l'état → agir → saisir → continuer.

**Standards**

- Bottom nav 3–5 items, **la première action fréquente est en position haute**
- Saisie rapide : champs pré-remplis, validation tolérante, mode une main
- Fonctionne hors-ligne : file d'attente, synchronisation explicite, indicateur d'état
- Le détail est modal ou push, pas une nouvelle entrée de navigation
- Grandes cibles tactiles, actions principales atteignables au pouce

**Modules attendance** : accueil/tableau, saisie du jour, carte/liste, détail, historique

**Pièges** : navigation trop profonde pour une action rapide · saisie qui perd le contexte · état hors-ligne invisible · retour arrière qui perd la saisie

---

## §2 — `mobile_consumer`

**Boucle de travail** : découvrir → consommer → revenir.

**Standards**

- Bottom nav 3–5, ancre « home » réelle
- Un écran d'accueil qui **ouvre la boucle**, pas un menu
- Découverte avant gestion : le contenu est produit par l'usage
- Notifications et partage comme moteur de ré-engagement
- Thumb reach : les actions principales sont en bas

**Modules attendance** : feed, recherche, création, profil, notifications

**Pièges** : écran d'accueil qui est un sommaire · création noyée · trop d'onglets · onboarding trop long

---

## §3 — `marketplace`

**Boucle de travail** : trouver → comparer → transacter.

**Standards**

- La recherche est l'écran le plus important, pas un simple champ en header
- Filtres et facettes : la liste doit se réduire sans quitter l'écran
- Fiche détaillée riche : c'est la page de conversion
- Deux flux distincts : **offre** (ce qui est publié) et **demande** (ce qui est consommé)
- Confiance : avis, garanties, statut de l'intermédiaire
- Navigation : Recherche · Messages · [Profil/Publication] · Activité

**Modules attendance** : recherche, publication, messagerie, commandes/paiements, avis

**Pièges** : une seule liste pour deux publics · recherche trop profonde · prix masqué · transaction impossible depuis la fiche

---

## §4 — `dashboard`

**Boucle de travail** : surveiller → détecter → investiguer.

**Standards**

- Sidebar, densité haute
- Hiérarchie en trois temps : **KPI → signal → détail**
- Le dashboard montre des **anomalies**, pas des métriques décoratives
- Chaque visuel est cliquable vers son détail
- Seuils et couleurs sémantiques : l'alerte doit sauter aux yeux
- Plages temporelles pilotables (24h / 7j / 30j) sur les visuels principaux

**Modules attendance** : vue d'ensemble, alertes, rapports, drill-down, configuration

**Pièges** : graphiques jolis mais sans action · tout au même niveau · pas de density · alertes ignorées

---

## §5 — `admin_crud`

**Boucle de travail** : trouver une ligne → la modifier → valider.

**Standards**

- Sidebar + **table** par défaut, pas de cartes
- Tri, filtre, recherche, **sélection multiple**, actions groupées
- Densité haute, pagination ou scroll infini
- Édition :Drawer inline (pas de modale pour un formulaire long)
- Raccourcis clavier pour les actions répétitives
- États de ligne : actif / inactif / en attente / erreur — visibles sans clic

**Modules attendance** : référentiel, utilisateurs, permissions, journal d'activité, imports/exports

**Pièges** : modale pour un formulaire de 20 champs · pas de bulk · édition qui perd la position · pas d'audit trail

---

## §6 — `transactional_web`

**Boucle de travail** : démarrer → remplir → valider → confirmer.

**Standards**

- Tunnel **étagé et visible** : l'utilisateur sait où il en est et ce qu'il reste
- Validation au blur, pas seulement au submit
- Les erreurs sont **au champ**, avec un message d'action
- Les données saisies ne sont pas perdues entre les étapes
- Page de confirmation explicite : ce qui s'est passé, et par où continuer
- Un seul appel à l'action principal par écran

**Modules attendance** : choix, informations, paiement, confirmation, récapitulatif

**Pièges** : étapes cachées · validation qui vide le formulaire · frais découverts à la fin · pas de reprise

---

## §7 — `booking`

**Boucle de travail** : choisir un créneau → réserver → gérer.

**Standards**

- La **disponibilité** est la donnée maîtresse : elle doit être visible avant l'engagement
- Réservation en 2 temps : choisir → confirmer, avec un résumé persistant
- La réduction de capacité (réservation pour plusieurs personnes, hébergement) est traitée à part
- Gestion post-réservation accessible en 1 action : modifier, annuler
- Wallet et historique : deux modules de fréquence quasi identique
- Navigation : Découvrir · Réserver · Wallet · Historique

**Modules attendance** : catalogue, calendrier/disponibilité, panier/réservation, wallet, historique, avis

**Pièges** : pas de visibility sur la disponibilité · modification d'une réservation qui casse · trop d'étapes · annulation impossible

---

## §8 — `rental_tenancy`

**Boucle de travail** : consulter l'état du portefeuille → saisir les entrées et sorties → agir sur un contrat qui arrive à échéance ou signale un impayé.

**Navigation attendue** : `Accueil · Finance · Contrats · Locataires · [Plus]`. La position 2 va à l'opération la plus répétée, pas au module le plus évident. Cf. `references/module-prioritization.md`.

**Standards**

- **Trois soldes jamais nettés** : dépôt de garantie, avance, courant. Unifier ou compenser deux soldes est un défaut, pas une optimisation.
- **FIFO** : une avance se consomme par ordre d'échéance, jamais au hasard.
- **Le mois n'a pas de longueur fixe.** Ajouter un mois au 31 janvier déborde. **La direction du débordement est un paramètre du domaine**, jamais une constante : les deux contextes — constitution d'une échéance, constitution d'une reconstitution — portent le risque en sens **opposés**.
- **Un délai légal s'exprime en jours**, pas en instants.
- **L'historique est append-only** : corriger une faute de frappe ne doit jamais réécrire le passé. Ni `DELETE`, ni `INSERT` massif sur des données personnelles.
- Un paiement tardif reste un paiement : il change le **chemin d'imputation**, pas la nature de l'opération.

**Modules attendance** : portefeuille/biens, locataires, contrats (baux), garantie (dépôt / reconstituée), finance (mouvements, grand livre), échéancier, relance

**Pièges** : le solde de garantie reconstituée affiché comme légalement dû au titre du dépôt · un mois calculé au 32e jour · l'avance absorbée par un paiement courant · une garantie reconstituée treated comme due parce qu'aucun solde ne la consulted

---

## §9 — Pathologies récurrentes par archétype

> Cette section est la **mémoire** du protocole de recherche. Un projet qui découvre une pathology la remonte ici.
>
> **Ce ne sont pas des tâches.** Ce sont des avertissements : des familles de pièges, avec la raison pour laquelle elles mordent. Cf. `references/research-protocol.md` § Discipline de la liste d'avertissements.

### Transversales — quel que soit l'archétype

| Classe | Pourquoi ça mord | Traitement type |
|---|---|---|
| **Un fait, deux représentations** | Deux endroits calculent la même chose, aucun ne réconcilie. Le jour où ils divergent, personne ne sait lequel a raison. *(Observé 11 fois sur un projet)* | Extraire une fonction canonique. Jamais deux sites. |
| **Un calcul ou une décision dupliqué** | Le seuil, l'ordre des opérations, la conversion — exprimés à chaque usage. Divergence au premier changement. | Une porte, ou un helper dont le nom rend le sens lisible dans l'appel. |
| **Un booléen qui tranche seul** | Un indicateur qui décide en silence (« si avance alors… ») sans que la raison soit lisible au site d'appel. *(3 implémentations divergentes d'un même booléen)* | Le triplement devient une fonction nommée, testée sur ses deux côtés. |
| **Une absence présentée comme un zéro** | Une liste vide et un résultat « rien à afficher » se ressemblent. Une panne réseau devient une affirmation commerciale. *(5 fois sur un seul écran)* | L'absence est un état distinct, avec son rendu. Jamais `Err() => []`. |
| **Fail-open sur une autorisation** | `can(...) ?? true` rend l'écrasement Impossible. Une panne de droits devient un droit d'écriture. | Fail-closed. Le défaut d'un droit est un refus, jamais un accord. |
| **Un test qui ne touche pas la ligne fautive** | La couverture affiche un pourcentage, le défaut reste. « La règle est écrite » ≠ « la règle est branchée ». | Le test doit exercer **la ligne fautive**, pas une ligne voisine qui existe. |
| **Un test qui passe pour la mauvaise raison** | Pire qu'un échec : il occupe la place du test qui aurait trouvé le vrai défaut. | Vérifier que l'assertion échoue quand on casse le code. |
| **Une caractéristique instable** | Un tri non stable, un `Set` itéré, une Map par ordre d'insertion. Deux exécutions, deux résultats. | Toujours un critère de départage total. |

### `rental_tenancy` — argent et échéances

| Classe | Pourquoi ça mord | Traitement type |
|---|---|---|
| **Horloge non injectée dans le domaine** | `DateTime.now()` dans la logique métier : les échéances ne sont pas testables, et deux lectures dans un même écran peuvent straddler une frontière. *(3 fois, dont une lue deux fois sur un même écran)* | Horloge injectée. Un test vérifie qu'elle est **branchée**, pas seulement qu'elle existe. |
| **Un mois de longueur fixe** | Le 31 + 1 mois. Selon le sens du débordement, on perd un jour de loyer ou on en invente un. | Surcharge d'opération mensuelle, direction en paramètre, testée dans les deux sens. |
| **Arrondi non marqué** | Un prorata arrondi au supérieur, c'est de l'argent pris au locataire. Un franc par ligne, sur 12 lignes. | La convention est **enregistrée** sur le contrat, jamais dans une constante. Test sur l'exemple chiffré. |
| **Une garantie reconstituée traitée comme due** | Sans colonne, sans rédacteur, l'échéance légale n'est jamais affichée. | La reconstitution est **due** (obligation légale), la consommation est **réactive**. Deux statuts distincts. |
| **Suppression et réinsertion sur donnée personnelle** | `DELETE` + `INSERT` à chaque correction d'une faute de frappe. Contredit l'historique immuable. | Correction ciblée. L'historique n'est jamais réécrit. |
| **De la prose métier dans la couche domaine** | Un nom de personne ou un texte de notification dans le domaine : le métier n'est plus testable, et il n'est plus traduisible. | Le domaine ne produit que des faits. Les libellés sont au-dessus. |
| **Précondition absente d'une règle de redistribution** | Une règle qui redistribue un total sans dire quand elle s'applique. Elle s'applique à des cas où elle est fausse. | La précondition vaut autant que la règle. Testée sur le cas limite. |

### Comment utiliser cette section

1. À la Phase 4, lire les pathologies de l'archétype **avant** de découper.
2. Pour chacune : notre conception fait-elle mieux, et **comment le sait-on** ? Un test, un scénario, ou une porte mécanique. Sinon ce n'est pas traité.
3. Ce qui est nouveau remonte ici, avec la même structure.

---

## Grille de comparaison (utilisée par `plan-validator`)

Pour chaque plan, sept questions notées **conformité / écart / non applicable** :

| # | Question | Attendu |
|---|---|---|
| 1 | Le module le plus fréquent est-il accessible en 1–2 sauts depuis l'écran d'accueil ? | oui |
| 2 | La navigation est-elle bornée (≤5 principaux) et justifiée ? | oui |
| 3 | Les actions récurrentes sont-elles atteignables sans navigation profonde ? | oui |
| 4 | La boucle principale de l'archétype est-elle couverte de bout en bout ? | oui |
| 5 | Les états d'erreur et le hors-ligne sont-ils traités si l'archétype l'exige ? | oui / explicite |
| 6 | Les modules attendance de l'archétype sont-ils tous présents ou écartés ? | présents ou justifiés |
| 7 | Existe-t-il un module sans user story ? | non |

**Verdict** : `PASS` si 0 écart · `REVISE` si 1–2 écarts non critiques · `BLOCK` si ≥3 écarts ou si la boucle principale n'est pas couverte.

Les écarts sont écrits dans `.forge/benchmarks.md`.
