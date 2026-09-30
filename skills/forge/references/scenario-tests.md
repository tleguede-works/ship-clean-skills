# Tests par scénario métier

## Ce que ça couvre, et ce que ça ne couvre pas

Un test unitaire prouve qu'une fonction rend le bon résultat pour une entrée. Un test par scénario prouve qu'**une suite d'événements métier, dans l'ordre, produit un état correct** — et que cet état survit.

C'est la différence entre :

| | Ce qui est vérifié | Ce qui ne l'est pas |
|---|---|---|
| Test unitaire | « la fonction de calcul est juste » | que quelqu'un l'appelle, dans le bon ordre, au bon moment |
| Test par scénario | l'enchaînement complet, l'état accumulé, l'historique | — |

Un test isolé peut être vert pendant que la logique d'enchaînement est fausse. C'est la panne de référence : les règles métier étaient individuellement bien testées, et l'application ne les enchaînait pas.

---

## Les deux règles qui rendent ces tests utiles

### Règle 1 — Un test de scénario n'écrit jamais ce que l'application écrit

C'est la règle la plus importante, et c'est celle qu'on viole en premier.

Un test qui doit « faire payer un locataire » alors que l'application n'a pas encore de code qui enregistre un paiement **écrit lui-même l'état qu'il veut vérifier**. Il passe au vert, et il ne prouve rien sur l'application.

> Un test qui réimplémente la règle qu'il est censé tester ne teste pas la règle, il teste sa copie.

**Application pratique.** Avant d'écrire un scénario, répondre par écrit :

1. Quelle **commande applicative** produit l'effet ? (la slice qui l'implémente)
2. Si elle n'existe pas encore, le scénario est-il **en lecture seule** sur des données écrites par la fixture ?

Un scénario en lecture seule est parfaitement valable : on prépare un état réaliste, on fait avancer le temps, et on vérifie ce que l'application **affiche** et **calcule**. C'est souvent 80% de la valeur pour 20% du travail.

Un scénario qui écrit ce que l'application écrit est un **faux vert**. Il est pire que pas de test, parce qu'il occupe la place du test qui aurait attrapé le vrai bug.

### Règle 2 — Un domaine temporel exige une horloge simulée

Si le domaine a des **échéances** — loyers, abonnements, anniversaires, délais légaux, péremptions, rotations de stocks — alors « aujourd'hui » est une variable du test, jamais une constante.

Le symptôme est reconnaissable : `DateTime.now()` dans la logique métier, et des tests qui passent tous à la même date figée. Sur un projet réel, une horloge injectée et parfaitement correcte existait déjà, avec ses propres tests unitaires — et **n'était utilisée par aucun autre test**.

Trois conséquences d'une horloge non simulée :
- on ne peut pas tester « le locataire paie en retard » sans attendre un mois, ou sans mentir sur la date
- deux lectures de l'heure dans un même écran peuvent straddler une frontière (le 1er à 23:59, le 2e à 00:01)
- la frontière qu'on veut tester n'est jamais franchie : le test passe par-dessus

**Le test de l'horloge simulée doit lui-même être testé.** Une horloge simulée qui n'est pas branchée est un harnais mort.

---

## Anatomie d'un scénario

Un scénario est un **récit nommé**, pas une liste d'assertions.

```gabarit
test/scenarios/<nom>.md          # le récit, lisible, versionné
test/scenarios/<nom>.<ext>       # son exécution
```

Le récit est un document, pas un commentaire. Il sert à trois choses : il dit ce que le produit doit faire, il est relu par un humain, et il ne peut pas mentir sans qu'on le voie.

### Structure

1. **Le récit** — en prose, une phrase : qui fait quoi, dans quel ordre, sur quelle durée.
2. **L'état initial** — la fixture. Créée par une commande applicative, ou par le harnais de test explicitement identifié comme tel.
3. **La chronologie** — une table : événement, date, action, ce qui change.
4. **Les assertions** — à chaque étape, ce que l'application **calcule** et **affiche** sur l'état accumulé.
5. **L'invariant final** — ce qui doit rester vrai à la fin, quelle que soit la chronologie.

### L'invariant final est la partie qui manque le plus souvent

Un scénario qui vérifie chaque étape vérifie des appels. Un scénario qui vérifie un **invariant en fin de parcours** attrape lesInteractions.

L'invariant est la propriété qui doit être vraie **quoi qu'il arrive** :

- la somme des allocations d'un paiement égale le montant du paiement
- le solde courant d'un compte ne peut pas être faux à cause de l'ordre des événements
- l'historique contient tous les événements, dans l'ordre, sans perte ni duplication
- le total des soldes de tous les comptes d'un workspace est conservé à travers une clôture

Écrire l'invariant **avant** le scénario force à se demander ce qui doit rester vrai — et c'est exactement la question que les tests unitaires ne posent pas.

---

## Le scénario de référence — cycle locatif complet

C'est l'exemple canonique d'un domaine à échéances. Il sert de modèle.

**Le récit.** Un locataire entre dans un logement. Il paie trois mois d'avance. Une nouvelle période commence. Il ne paie pas à la date. Il paie finalement en retard. L'application doit gérer la période, le retard, l'imputation, et conserver l'historique.

**Chronologie.**

| # | Date | Événement | Ce qui doit être vrai |
|---|---|---|---|
| 1 | J0 | Signature du bail, garantie versée | 3 comptes distincts, aucun netté entre eux |
| 2 | J0 | Paiement de 3 mois d'avance | Le surplus va sur le compte *avance*, pas sur le compte courant |
| 3 | J30 | Début période 2 | Le calendrier de la période 2 existe, dû = 1 mois |
| 4 | J30 | Rien | La période 2 n'est pas en retard avant l'échéance |
| 5 | **J35** | Échéance dépassée, aucun paiement | Retard détecté, montant dû = 1 mois (+ pénalités si la règle le dit) |
| 6 | J40 | Paiement partiel | Imputation selon l'ordre défini, reliquat non nul |
| 7 | J45 | Paiement du reliquat | Solde courant à 0, **avance** intacte, historique complet |
| 8 | J45 | Relecture de l'écran | L'utilisateur voit l'historique, pas un solde recalculé à l'instant |

**Invariants vérifiés en J45 :**

- somme des allocations du paiement J40 + J45 = montant total versé
- le compte *avance* est resté à sa valeur de J0 (le surplus n'a pas été consommé à tort)
- l'ordre des événements ne change aucun total (rejouer dans un autre ordre donne le même solde courant)
- le nombre de mouvements dans l'historique = nombre d'événements écrits

**Ce que ce scénario attrape qu'aucun test unitaire n'attrape :**
- l'avance consommée au mauvais moment parce que les paiements sont arrives dans le désordre
- un retard qui ne se cumule pas parce que chaque calcul repart de zéro
- un solde courant faux à cause d'un `sort` instable sur des dates identiques
- une garantie reconstituée affichée comme due au mauvais mois

---

## Comment le faire tourner

### Le plus simple : lecture seule, sur fonctions pures qui prennent une date

Quand l'application expose des fonctions pures du type `étatÀ(entités, à_la_date)`, le scénario est une boucle :

```
fixture := état initial
pour chaque événement de la chronologie :
    appliquer l'événement via l'API applicative
    avancer l'horloge
    asserter sur étatÀ(à = maintenant)
asserter les invariants finaux
```

Coût : quelques centaines d'inserts sur une base en mémoire. **Millisecondes.** Aucun appareil, aucun émulateur, aucune nouvelle dépendance.

C'est la forme à privilégier : la moins chère, la plus précise, et la plus difficile à faire passer à côté d'un vrai bug.

### Quand il faut écrire : le port applicatif

Si le scénario doit écrire, il passe par **le port de l'application** (repository, service, use case) — jamais par SQL direct, jamais en réimplementant la règle.

Si le port n'existe pas encore, ce n'est pas un blocage du test : c'est un constat sur la slice.

```bash
node "$FORGE/scripts/state.js" finding <anchor> --domain=architecture.md --severity=majeur \
  "Le scénario locatif ne peut pas écrire un paiement : aucun port applicatif ne l'expose" \
  "Extraire l'écriture dans un port, puis brancher le scénario dessus"
```

C'est le bon usage : le test révèle un manque réel de l'architecture, et le constat est routé.

---

## Couverture attendue

| Niveau de test | Question | Obligatoire |
|---|---|---|
| Unitaire | une fonction rend-elle le bon résultat ? | oui |
| Intégration (base réelle) | l'adaptateur et le schéma font-ils ensemble ce qu'on croit ? | oui |
| **Scénario** | **l'enchaînement métier produit-il un état juste ?** | **dès que le domaine a des échéances ou un cycle de vie** |
| E2E navigateur/appareil | l'interface réelle fait-elle ce que le scénario décrit ? | si l'UI est critique |

Un projet à échéances **sans aucun scénario** n'est pas testé : il est vérifié par morceaux, et c'est précisément l'illusion que les tests unitaires procurent.

---

## Checklist de gate

- [ ] Les scénarios couvrent les **cycles de vie complets**, pas seulement des appels.
- [ ] Chaque scénario a un **récit nommé** en prose, versionné à côté du test.
- [ ] Chaque scénario déclare un **invariant final** écrit avant le test.
- [ ] **Aucun test de scénario n'écrit ce que l'application écrit** — ou, s'il le fait, c'est un constat routé, pas un test.
- [ ] Le domaine étant temporel, l'**horloge est injectée** et un test vérifie que l'horloge simulée est *branchée*, pas seulement existante.
- [ ] Le scénario le plus critique (le « cycle nominal complet ») existe et passe.
- [ ] Au moins un scénario couvre un **chemin d'échec** (retard, refus, double paiement, annulation).
- [ ] L'historique est vérifié : nombre d'événements et ordre, pas seulement le solde final.

---

## Références

- `references/test-strategies.md` — les autres familles de tests, et comment choisir
- `templates/scenario.md.tmpl` — le gabarit du récit
- `agents/scenario-tester.md` — l'agent qui écrit et maintient les scénarios
- `references/archetypes.md` §`rental_tenancy` — le scénario de référence pour un produit locatif
