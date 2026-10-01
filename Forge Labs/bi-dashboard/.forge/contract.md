---
type: contract
status: draft
generated_at: 2026-10-01
derived_from:
  - .forge/prd.md
  - .forge/roadmap.md
  - .forge/conventions.md
  - .forge/architecture.md
---

# Contrat de projet — Amberline

> **Contrat de migration.** Ce document a été dérivé des décisions déjà prises dans
> `.forge/`, après coup. Il n'a pas été signé par un commanditaire, et ne constitue
> pas un engagement de sa part. Les points marqués « non décidé » sont réellement
> ouverts.

Document rédigé le 2026-10-01 à partir de quatre documents datés du 2026-09-30 :
`prd.md` (version 1), `roadmap.md` (version 1), `conventions.md`,
`architecture.md`. Les versions V1 (6 mois) et V2 (12 mois) citées plus bas sont
celles de la roadmap ; aucune n'est contractée ici.

---

## Les quatre raisons pour lesquelles ce document existe

| Bloc | Ce qu'il évite |
|---|---|
| Ce qui sera livré | un périmètre qu'on découvre à la livraison |
| Ce qui ne sera pas livré | une exclusion non dite, découverte à la livraison |
| Ce qui est irréversible | un engagement acheté sans que personne ne l'ait vu |
| Ce que Forge décidera seul | quatre-vingt questions techniques par phase |

---

## 1. Ce qui sera livré

Le périmètre ci-dessous est celui de la version MVP, daté à trois mois par la
contrainte C6 du PRD, et non par une estimation. Une ligne par slice de
l'architecture. **Les cinq fondations techniques ne sont pas des livrables** : ce
sont des pièces internes, listées au § 4.

| Slice | Ce que le client aura | Pour qui |
|---|---|---|
| `definition-declarer` | Une définition écrite pour chaque chiffre d'entreprise : ce qu'il compte, sur quel périmètre, avec quelle formule, qui en répond, et quelle cible on attend. | Contrôleur de gestion |
| `definition-signer` | La possibilité de soumettre une définition à un signataire nommé, de la signer, de la refuser avec un motif, de la publier, et de la retirer avant publication. Chaque acte est daté et conservé. | Contrôleur de gestion, directeur de site |
| `consultation-indicateur` | Un écran qui affiche la valeur officielle d'un indicateur avec sa cible, son seuil, la date de calcul prise dans la source et l'identification de cette source. | Manager d'équipe, lecteur |
| `seuil-et-etat` | Un indicateur qui dit s'il est dans sa cible ou hors cible, cette indication étant dérivée de la valeur et non d'un réglage d'apparence. | Manager d'équipe |
| `historique-indicateur` | L'historique des versions signées d'un indicateur : pour chacune, sa valeur et sa date de calcul, et l'écart entre deux versions écrit en mots de métier. | Lecteur, contrôleur de gestion |
| `drill-down` | Depuis une valeur, la liste des lignes qui la composent, sous le même périmètre et avec les mêmes droits que l'écran d'origine. | Manager d'équipe |
| `restriction-lignes` | La garantie qu'une ligne interdite n'est ni lisible, ni recalculable, ni exportable par aucun chemin, démontrée sur des données réelles. | Direction, responsable support |
| `partage-dashboard` | Un tableau de bord assemblé par juxtaposition fixe d'indicateurs officiels, partagé à une liste de personnes nommées ou à un groupe de l'annuaire. | Contrôleur de gestion, comité de direction |
| `export-provenance` | Un export PDF ou CSV produit en tâche de fond, portant le périmètre, la période, la version de la définition, la date de sa signature, la date de calcul et la source de l'écran d'origine. | Manager d'équipe, contrôleur de gestion |
| `journal-acces` | Un journal de qui a consulté quel indicateur, consultable par les personnes habilitées et exportable, filtré selon les droits de celui qui le consulte. | Personnes nommées et habilitées |

**Toute ligne qui ne peut pas se relire sans glossaire est mal écrite.** Un client
non technique ne valide pas un plan ; il valide un résultat.

**Écart de comptage, relevé et non corrigé** : l'architecture § 3.2 inventorie
dix slices de MVP, la roadmap § 6 en annonce neuf. Les dix lignes ci-dessus suivent
l'inventaire de l'architecture, qui est le seul document à nommer les slices. La
différence n'est pas tranchée dans `.forge/`.

## 2. Ce qui ne sera pas livré

Le bloc le plus volumineux et le plus souvent omis. **Une exclusion non écrite est une
trahison future** : elle ne se découvre qu'à la livraison, quand il est trop tard
pour en discuter.

| Exclu | Pourquoi | Réexamen |
|---|---|---|
| Partager un tableau de bord par un lien public, sans liste nominative | Incompatible avec le journal des accès (C4) et avec le secret commercial. L'accès reste une liste de personnes ou un groupe d'annuaire. | Non réexaminé — décision du 2026-09-30 |
| Détecter une anomalie sans seuil déclaré, automatiquement | Déplace l'arbitrage vers une boîte noire alors que le défaut réel est l'absence de seuil écrit. Reste une priorité P4 et ne déclenchera jamais d'alerte. | V2, à douze mois |
| Modifier une définition signée sans nouvelle signature | Rendrait la version publiée non reproductible et le journal sans valeur. Toute modification passe par une nouvelle version puis une nouvelle signature. | Jamais |
| Recalculer un indicateur hors de la source de données de l'entreprise | Contredit la source unique des chiffres. Un indicateur est calculé par l'entrepôt ou il n'existe pas. | Jamais |
| Saisir une donnée métier dans l'outil | Un tableau de bord n'est pas un formulaire. L'outil ne remplace pas l'ERP et n'y écrit rien. | Jamais |
| Couper l'accès au tableur partagé, ou imposer la migration | Le tableur reste accessible à tous. Le produit doit gagner l'usage de l'intérieur. | Six mois — si le tableur reste le lieu de calcul réel, il faut le dire |
| Composer librement un tableau de bord : placement libre, redimensionnement, filtre libre hors définition | L'assemblage est fixe au MVP. Sans cette borne, la moitié du composeur libre serait livrée sous un autre nom. | V1, à six mois |
| Un écran de gestion des cibles | La cible existe, saisie avec la définition. Un écran dédié n'a de sens qu'au-delà de quelques dizaines d'indicateurs. | V2, à douze mois |
| Recevoir une alerte par mail, et une alerte une seule fois par franchissement de seuil | Le canal n'a de sens qu'une fois les seuils signés et les habitudes installées. L'état hors cible reste affiché dans le MVP. | V1, à six mois |
| Commenter un indicateur | Une donnée qui ne s'efface plus proprement et dont le sens dépend d'une version de calcul. Le pourquoi reste dans les réunions et les courriels. | V2, à douze mois |
| Lire une valeur par programme | Doit rester bornée aux indicateurs officiels, pour ne pas devenir le chemin principal d'accès aux chiffres. | V2, à douze mois |
| Consulter en déplacement depuis un téléphone | Priorité P4 au PRD. Aucune demande réelle n'est enregistrée. | V2, à douze mois |
| Fonctionner sans réseau, ou en mode hors ligne | Aucun des quatre documents ne traite ce point : ni le PRD, ni la roadmap, ni les conventions, ni l'architecture. | non décidé — aucune date de réexamen n'est écrite dans les documents |
| Corriger automatiquement deux définitions signées qui donnent la même valeur | Corriger l'une silencieusement serait pire que le conflit. Les deux restent officielles, le conflit est remonté aux deux propriétaires. | Jamais |
| Rapprochement avec l'ERP | Hors périmètre explicite. L'outil n'écrit aucune donnée opérationnelle dans l'ERP. | V3, seulement si l'ERP expose des écritures en lecture |

**Une ligne de la forme « ce qui n'a pas été demandé » est une exclusion déguisée en
place vide.** Ce qui n'est pas écrit ici est implicitement inclus.

## 3. Ce qui est irréversible

**C'est le bloc qui rend la promesse de non-intervention vraie.** Tout ce qui engage
un achat, un abonnement, une licence ou une donnée personnelle fige ici, **avant**
la phase de conception, parce qu'après c'est trop tard pour en discuter.

Chaque ligne porte un **prix ou une durée**. Un engagement sans prix n'est pas un
engagement annoncé, c'est un engagement subi.

| Engagement | Choix | Prix / durée | Réversible ? |
|---|---|---|---|
| Hébergement dans l'Union européenne | Fournisseur non nommé ; le contrat est encore à passer | prix non chiffré dans le projet | NON — contrainte légale, l'hébergement hors Union européenne est interdit |
| Fournisseur d'identité | Fournisseur OIDC de l'entreprise, non nommé ; déclaré bloquant | prix non chiffré dans le projet | NON — sans source d'identité nommée, le refus par défaut et le journal ne sont pas constructibles |
| Contrat de lecture sur l'entrepôt | Équipe data de l'entreprise | prix non chiffré dans le projet | NON — un test d'intégration échoue si une colonne attendue est renommée ; renommer devient un travail conjoint |
| Entrepôt de test rempli | Équipe data de l'entreprise | prix non chiffré dans le projet | NON — sans lui, la restriction de lignes n'est pas démontrable et le critère de sécurité reste non vérifié |
| Données personnelles conservées | Journal des accès et journal des exports dans la base du produit | prix non chiffré dans le projet · durée : un an, purgé automatiquement | NON — durée imposée par la contrainte légale C4 |
| Accord de traitement des données | Sous-traitant d'hébergement, non nommé | prix non chiffré dans le projet | NON — prérequis de mise en production, pas une amélioration |
| Chiffrement au repos, isolation par ligne, restauration à un instant | Fournisseur de base de données, non nommé | prix non chiffré dans le projet | NON — exigence bloquante tant qu'elle n'est pas en place ; le MVP reste en recette |
| Licence Power BI |Déjà payée par l'entreprise, via Microsoft 365 | prix non chiffré dans le projet · durée : l'abonnement en cours | NON — la licence ne peut pas être récupérée ; le produit doit rendre le service obsolète, pas le supprimer |
| Exécution de fond | Un processus de fond et une table d'export dans la base du produit | prix non chiffré dans le projet | OUI — c'est un service interne, l'arrêter suffit |
| Budget de l'année | Quelques dizaines de milliers d'euros, hors recrutement d'une équipe dédiée | durée : l'année | NON — plafond posé par la contrainte C5 |

> **Trois points bloquants restent ouverts dans `.forge/`**, et aucune ligne de ce
> tableau ne peut être chiffrée : le nom des titulaires du rôle de signataire, le nom
> du fournisseur d'identité, l'accord sur l'entrepôt de test. Les deux premiers
> reviennent au commanditaire au § 5 ; l'accord sur l'entrepôt est une dépendance
> d'infrastructure dont l'échéance est « avant la phase de conception ».

## 4. Ce que Forge décidera seul

Le bloc qui supprime l'essentiel des questions. **Énumérer ce qui est réversible et
gratuit, c'est ce qui rend le silence légitime** — parce qu'on sait qu'il n'a rien
à dire.

| Décision | Pourquoi Forge peut la prendre seule |
|---|---|
| Structure de code, découpage des modules, nommage des fichiers et des routes | réversible, gratuit — les règles sont écrites dans `conventions.md` |
| Bibliothèque d'implémentation : client réseau, validation des entrées, gestionnaire de paquets | réversible, gratuit |
| Format de stockage : base de données du produit, cache court des lectures, index et clés | réversible si le schéma est portable |
| Bibliothèque de tests : tests unitaires, tests de composants, tests de bout en bout | réversible, gratuit |
| Outillage de lint et de format | réversible, gratuit |
| Composants d'interface et jeu d'icônes | réversible, gratuit — remplaçables sans toucher un écran |
| Mécanisme de rendu, de navigation et de styles | réversible, gratuit |
| Vocabulaire technique des erreurs et sa correspondance vers les statuts de réponse | réversible, gratuit — une liste fermée, partagée entre le client et le serveur |
| Forme des tables et contraintes en base qui portent les règles d'intégrité | réversible tant que le schéma est exportable |
| Origine des vagues d'implémentation et du parallélisme entre tranches | réversible, gratuit |

**Un client qui lit cette liste et ne la conteste pas a délégué ces décisions.** Un
silence ici est une délégation, parce que le prix de la corriger est nul.

## 5. Ce qui reviendra au client

Les décisions qui lui appartiennent — et **chacune avec une échéance**. Une décision
sans date est prise par le plus proche, et le plus proche c'est Forge.

| Décision | Options | Échéance | Prix selon l'option |
|---|---|---|---|
| Nommer les titulaires du rôle de signataire | Nommer au moins une personne, ou ne pas lancer la production tant que le rôle est vide | Avant la première signature — aucune date calendaire n'est écrite dans les documents | aucun coût direct |
| Nommer le fournisseur d'identité | Nommer le fournisseur OIDC de l'entreprise, ou accepter que le produit refuse tout accès tant qu'il n'est pas nommé | Avant la phase de conception — aucune date calendaire n'est écrite | prix non chiffré dans le projet |
| Contractualiser l'hébergement dans l'Union européenne | Choisir un hébergeur et signer, ou repousser la mise en production | Avant la mise en production — aucune date calendaire n'est écrite | prix non chiffré dans le projet |
| Trancher la valeur du taux de service | 95 % ou 96 % selon que les lignes sous-traitées sont incluses ; la production et le commercial le contestent séparément | Au moment de la signature, par le propriétaire de l'indicateur — aucune date n'est écrite | aucun coût direct |
| Obtenir l'accord sur l'entrepôt de test rempli | L'obtenir, ou accepter que la restriction de lignes ne soit pas démontrable | Avant la phase de conception — aucune date calendaire n'est écrite | prix non chiffré dans le projet |

> **Passé l'échéance sans réponse, Forge applique l'option par défaut** et le signale
> dans le bilan d'écart. Le silence n'est pas une approbation.

---

## Ce que ce contrat ne dit pas

- Il ne décrit pas la stack ligne par ligne. Le client n'a pas à la choisir, et les
  noms de bibliothèques ne l'intéressent pas — le **prix** l'intéresse, et il est au
  § 3.
- Il ne contient pas de règle de code. Ça appartient aux conventions techniques.
- Il n'est pas un rapport d'avancement. Il ne bouge pas d'une phase à l'autre ; seul
  § 3 se remplit, quand un engagement est découvert.
- Il ne fixe pas de date de livraison. La seule échéance datée du dossier est la date
  du comité, à trois mois, qui est une contrainte externe (C6) et non un engagement de
  Forge.

## Signature

| Élément | Valeur |
|---|---|
| Client | non décidé — aucun commanditaire n'est nommé dans les documents du projet |
| Date | non signé — la date de signature n'est pas décidée |
| Forge | Forge Labs |