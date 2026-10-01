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

# Contrat de projet — Bailly

> **Contrat de migration.** Ce document a été dérivé des décisions déjà prises dans
> `.forge/`, après coup. Il n'a pas été signé par un commanditaire, et ne constitue
> pas un engagement de sa part. Les points marqués « non décidé » sont réellement
> ouverts.

Document rédigé le 2026-10-01 à partir de quatre documents datés du 2026-09-30 :
`conventions.md`, `prd.md`, `roadmap.md`, `architecture.md`. Le commanditaire est
identifié comme un propriétaire de quatorze appartements à Lyon, mais il n'est pas
nommé. Aucune date de livraison n'est contractée ici.

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

Le périmètre ci-dessous est celui du MVP : huit tranches. **Les sept fondations
techniques ne sont pas des livrables** : ce sont des pièces internes, listées au § 4.

| Slice | Ce que le client aura | Pour qui |
|---|---|---|
| `socle-synchronisation` | Un compteur permanent et visible qui dit à tout instant ce qui est parti et ce qui n'est pas encore parti, et qui renvoie tout seul quand le réseau revient. | Le propriétaire |
| `dossier-bail` | Le dossier d'un locataire et son bail avec ses dates ; les échéances en découlent et ne sont jamais tapées à côté. | Le propriétaire |
| `saisie` | L'écriture d'un fait daté et d'une somme due depuis le téléphone, sans réseau, la classe de tout texte libre demandée avant l'enregistrement. | Le propriétaire |
| `piece-jointe` | Une photo écrite sur l'appareil avant toute tentative d'envoi, datée par le lieu, dont l'état est dit jusqu'à la confirmation par le serveur. | Le propriétaire |
| `encaissement` | Pour chaque locataire et chaque mois, l'un des trois états de l'encaissement, et une relance qui n'existe qu'en ligne et qui laisse une preuve d'envoi datée. | Le propriétaire |
| `demandes` | La liste de ce qui attend, avec l'indication de qui doit agir en premier, sans jamais fusionner deux demandes reçues le même jour. | Le propriétaire |
| `garde-fou` | Une échéance bloquante manquée qui remonte une fois, puis se classe — faite tard, faite avec accord — sans écran de rappels. | Le propriétaire |
| `donnees-personnelles` | Un dossier de locataire exporté à la demande, lisible et daté, qui ne contient que du constaté ; et l'export complet des quatorze baux, relisible sans ce logiciel. | Le propriétaire, le locataire et son conseil |

**Toute ligne qui ne peut pas se relire sans glossaire est mal écrite.** Un client
non technique ne valide pas un plan ; il valide un résultat.

## 2. Ce qui ne sera pas livré

Le bloc le plus volumineux et le plus souvent omis. **Une exclusion non écrite est une
trahison future** : elle ne se découvre qu'à la livraison, quand il est trop tard
pour en discuter.

| Exclu | Pourquoi | Réexamen |
|---|---|---|
| La quittance de loyer | Une fois par mois, et le commanditaire la fait encore à la main sans que cela devienne ingérable. | Jamais dans le dossier actuel |
| La régularisation des charges | Annuelle. L'application n'a aucun calcul métier validé, et elle n'en calcule aucun. | Jamais dans le dossier actuel |
| La révision annuelle du loyer | Annuelle. | Jamais dans le dossier actuel |
| La fiscalité | Annuelle, et hors du champ d'un propriétaire particulier. | Jamais dans le dossier actuel |
| La gestion de plusieurs utilisateurs, les rôles, les permissions | Un seul utilisateur, par construction. | Jamais |
| La carte, le plan, l'itinéraire, la géolocalisation | L'adresse est une donnée du bail, et c'est tout. | Jamais |
| L'inventaire des biens | Une corvée qui devient une corvée. | Jamais |
| La comptabilité générale, les écritures, les plans d'amortissement | Ni demandés, ni validés, et tout calcul est interdit. | Jamais |
| L'assurance, les statistiques de sinistre, la déclaration de sinistre | Non demandé. | Jamais |
| Une notification poussée | Le compteur de synchronisation est permanent et visible ; une notification est un canal de plus pour dire la même chose. | V2, conditionnel — si le propriétaire ouvre moins d'une fois par semaine sur deux mois |
| Une version web de bureau | Le téléphone d'abord ; le portable sert au travail de fond, et c'est la même application. | non décidé |
| Une signature électronique qualifiée | Une signature tracée localement, valide seulement à la confirmation du serveur. C'est un autre produit, avec un autre niveau de preuve et un autre coût. | Hors dossier |
| Une somme due qui ne soit ni le loyer, ni les provisions sur charges, ni un arriéré, ni un acompte | C'est la frontière exacte où la régularisation des charges commence. L'application n'a pas la formule validée. | V1, à condition que la formule soit validée par écrit |
| Les deux échéances longues : validité des diagnostics et assurance propriétaire | Leur échéance est une marge, pas une alarme : six ans, annuel. Le propriétaire les verra à six mois. | V1, au quatrième trimestre 2027 |
| L'import de l'historique des quatorze baux en cours | On ne sait pas dans quel format il existe, s'il est lisible. À questionner, pas à supposer. | V2 — sur demande explicite et format source identifié |
| Un agrégat ou un indicateur, par exemple le taux de retard | Le propriétaire appelle les trois cas ; un indicateur serait une chose qu'il consulte au lieu d'appeler. | Jamais dans le dossier actuel |
| Un écran de signature d'état des lieux | Le composant existe au système de design, mais aucune tranche du MVP ne le réclame : la distinction entre « signé ici » et « confirmé » n'a donc pas d'écran. | non décidé — aucune tranche du MVP ni aucune version cible ne le reprend |
| La purge automatique des pièces à date de fin | La date de fin par catégorie de pièce est inconnue. Une purge sans date serait un effacement de masse, c'est-à-dire le geste interdit. | non décidé — conditionné à la durée légale de conservation, question ouverte au § 5 |
| Le troisième état de traitement des données : conserver jusqu'à une date de fin écrite | Déclaré dans la donnée, non applicable tant que la durée par catégorie est inconnue. Aucune fonction de pièces effaçables n'existe. | non décidé — conditionné à la durée légale de conservation, question ouverte au § 5 |
| Écrire une relance, une mise en demeure, une convocation ou un accusé de réception sans réseau | Ce qui exige une preuve d'envoi n'est produit qu'en ligne. L'application le dit à l'écran, sans mode dégradé. | Jamais — c'est accepté et écrit, pas un défaut à corriger |
| Récupérer les écritures non envoyées après le vol du téléphone | Elles meurent avec l'appareil, et l'application ne les a jamais annoncées comme sauvegardées. | Jamais — c'est accepté et écrit |
| Tout service tiers qui recevrait des données personnelles | Ni mesure d'audience, ni rapport de crash, ni diffusion de contenu qui journalise. | Tant que la contrainte tient |
| La comparaison entre appartements, l'assistant de relance, le mode inspection | Reviennent à des seuils d'activité et de taille qui ne sont pas atteints. | V3, sous conditions écrites dans la roadmap |

**Une ligne de la forme « ce qui n'a pas été demandé » est une exclusion déguisée en
place vide.** Ce qui n'est pas écrit ici est implicitement inclus.

## 3. Ce qui est irréversible

**C'est le bloc qui rend la promesse de non-interruption vraie.** Tout ce qui engage
un achat, un abonnement, une licence ou une donnée personnelle fige ici.

Chaque ligne porte un **prix ou une durée**. Un engagement sans prix n'est pas un
engagement annoncé, c'est un engagement subi.

| Engagement | Choix | Prix / durée | Réversible ? |
|---|---|---|---|
| Hébergement de la donnée de référence | Fournisseur non nommé ; un hébergeur mutualisé ou un serveur dédié, en région de l'Union européenne, chiffré au repos | prix non chiffré dans le projet | OUI — l'export complet est rejouable sans ce logiciel et ne dépend pas du fournisseur |
| Engagement de sauvegarde de l'hébergeur | Fournisseur non nommé | prix non chiffré dans le projet · exigence : moins de vingt-quatre heures | non décidé — le palier et son engagement de sauvegarde sont une question ouverte au § 5 |
| Sortie de données et reprise après incident | Export complet produit en moins d'une minute, lisible sans ce logiciel, repartant d'une sauvegarde de moins de vingt-quatre heures | prix non chiffré dans le projet | OUI — c'est une sortie, pas une entrée ; la reprise ne dépend pas du fournisseur |
| Données personnelles des locataires | Baux, loyers, dépôts de garantie, coordonnées, états des lieux, photos de dommages, conservés chez un hébergeur | prix non chiffré dans le projet · durée de conservation : non décidée dans les documents | NON — le régime s'applique de plein droit et aucune fonction d'effacement global n'existe |
| Fidélité des cinq échéances au droit réel | Aucune relecture juridique avant la première version ; les cinq échéances viennent du commanditaire, pas d'un juriste | prix non chiffré dans le projet | NON — une échéance fausse affichée par l'outil devient une obligation que l'outil a écrite |
| Absence de tout service tiers dans les données personnelles | Ni mesure d'audience, ni rapport de crash, ni diffusion de contenu qui journalise | prix non chiffré dans le projet | NON — c'est une contrainte de conception : l'hébergeur voit déjà la donnée |
| Accès unique par un secret ressaisi à chaque ouverture | Secret unique, sans session persistante | prix non chiffré dans le projet | OUI — la réinitialisation passe par l'hébergeur |

> **Une ligne manque et ne peut pas être écrite** : aucun des quatre documents ne dit
> quel compte d'éditeur d'application, quelle identité de publication, ni quel coût
> de distribution sont prévus pour une application mobile. Le sujet n'apparaît nulle
> part dans `.forge/` ; il n'est donc pas chiffré ici et il reste à instruire si le
> commanditaire signe un jour.

## 4. Ce que Forge décidera seul

Le bloc qui supprime l'essentiel des questions. **Énumérer ce qui est réversible et
gratuit, c'est ce qui rend le silence légitime** — parce qu'on sait qu'il n'a rien
à dire.

| Décision | Pourquoi Forge peut la prendre seule |
|---|---|
| Structure de code, découpage en paquets, nommage des fichiers | réversible, gratuit — les règles sont écrites dans `conventions.md` |
| Bibliothèque d'implémentation : accès aux données, client réseau, validation des entrées, gestionnaire d'état | réversible, gratuit |
| Format de stockage : base du serveur et base chiffrée sur l'appareil, générées depuis une seule source de migration | réversible si le schéma est portable |
| Bibliothèque de tests : tests unitaires, tests de propriété, scénarios sur appareil avec mode avion | réversible, gratuit |
| Outillage de lint et de format | réversible, gratuit |
| La forme du schéma qui sépare le fait constaté et l'appréciation de travail | réversible — la séparation elle-même est une contrainte du commanditaire, pas une option de Forge |
| Le traitement des dates d'échéance par colonnes calculées par la base, et non par le code des écrans | réversible, gratuit |
| La règle « payé est la présence d'un reçu » : aucune somme n'est soustraite, aucun montant n'est comparé | réversible, gratuit |
| Le journal des écritures comme unique endroit où l'état « parti ou pas parti » existe | réversible, gratuit |
| Le canal par lequel une date simulée atteint l'application en test, et son absence du code livré | réversible, gratuit |
| Le nom des états d'écran et la forme des unions de rendu | réversible, gratuit |
| L'ordre des vagues d'implémentation et le parallélisme entre tranches | réversible, gratuit |

**Un client qui lit cette liste et ne la conteste pas a délégué ces décisions.** Un
silence ici est une délégation, parce que le prix de la corriger est nul.

## 5. Ce qui reviendra au client

Les décisions qui lui appartiennent — et **chacune avec une échéance**. Une décision
sans date est prise par le plus proche, et le plus proche c'est Forge.

| Décision | Options | Échéance | Prix selon l'option |
|---|---|---|---|
| La durée légale de conservation, par catégorie de pièce | Le commanditaire la donne, ou il sollicite un conseil juridique | non datée dans les documents ; elle bloque le troisième état du traitement des données | prix non chiffré dans le projet |
| Le palier d'hébergement et son engagement de sauvegarde réel | Comparer des offres et retenir un palier, ou rester sans engagement écrit et compter sur l'export seul | non datée dans les documents | prix non chiffré dans le projet |
| Le rythme réel de l'encaissement : mensuel pour tous, ou décalé selon les contrats | Mensuel pour tous, ou une date d'échéance propre au bail | non datée dans les documents ; le jour de l'échéance est aujourd'hui obligatoire, sans valeur par défaut | aucun coût direct |
| L'identité du document de bail et ses annexes | Attacher un document au dossier comme champ obligatoire, ou le laisser facultatif | non datée dans les documents | aucun coût direct |
| Le contenu du formulaire de la somme due : loyer et provisions seulement, ou davantage | Loyer, provisions, arriéré et acompte, ou un périmètre élargi | non datée dans les documents ; le périmètre élargi suppose une formule validée par écrit | aucun coût direct |
| Le format de l'historique existant des quatorze baux, et s'il existe une demande de l'importer | Un format lisible est fourni et l'import est fait, ou le propriétaire saisit ses quatorze baux à la main | À poser pendant le MVP, pas à la première version complète : c'est un risque d'adoption, pas une fonctionnalité | aucun coût direct |
| La signature d'un état des lieux | Faire figurer ou non la signature dans le périmètre, alors que le composant existe et qu'aucune tranche ne le réclame | non datée dans les documents | aucun coût direct |

> **Passé l'échéance sans réponse, Forge applique l'option par défaut** et le signale
> dans le bilan d'écart. Le silence n'est pas une approbation.

---

## Ce que ce contrat ne dit pas

- Il ne décrit pas la stack ligne par ligne. Le commanditaire n'a pas à la choisir, et
  les noms de bibliothèques ne l'intéressent pas — le **prix** l'intéresse, et il est
  au § 3.
- Il ne contient pas de règle de code. Ça appartient aux conventions techniques.
- Il n'est pas un rapport d'avancement. Il ne bouge pas d'une phase à l'autre ; seul
  § 3 se remplit, quand un engagement est découvert.
- Il ne tranche aucune des quatre échéances listées au § 5. Les remplir serait
  inventer la réponse d'un conseil juridique qui n'a pas été sollicité.

## Signature

| Élément | Valeur |
|---|---|
| Client | non décidé — le commanditaire est décrit comme un propriétaire de quatorze appartements à Lyon, mais il n'est pas nommé |
| Date | non signé — la date de signature n'est pas décidée |
| Forge | Forge Labs |