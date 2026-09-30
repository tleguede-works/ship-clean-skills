---
type: benchmarks
status: approved
generated_at: 2026-09-30
derived_from:
  - .forge/prd.md
  - .forge/roadmap.md
archetype: dashboard
---

# Standards de référence — Amberline

> Ce document compare le projet à ce qui **se fait déjà** pour un produit du même archétype.
> Il n'est pas normatif : il rend les écarts **visibles**.
>
> Cf. `references/archetypes.md` pour les standards par archétype.

---

## 1. Archétype

| | |
|---|---|
| **Archétype principal** | `dashboard` |
| **Archétype secondaire** | `admin_crud` (gestion d'un référentiel : les définitions d'indicateurs) |
| **Plateforme** | web |
| **Boucle de travail** | consulter l'état d'un chiffre → détecter qu'il sort de sa cible → descendre jusqu'aux lignes qui le composent |

**Justification de l'archétype** : le PRD décrit une consultation fréquente par des personnes qui n'écrivent pas de requêtes, sur des chiffres d'entreprise, avec des seuils et un partage nominatif. C'est le signal `dashboard` de `archetypes.md` §4 (« surveillance, alertes, lecture de métriques »), pas `admin_crud` : l'utilisateur cible n'est pas en train de trouver une ligne à modifier, il est en train de regarder une valeur et de décider.

---

## 2. Produits de référence

| Produit | Ce qu'on lui reprend | Ce qu'on ne reprend pas |
|---|---|---|
| **Metabase** (déjà auto-hébergé chez le client) | Le modèle « question » comme unité partageable ; l'idée qu'une question est un objet avec un auteur ; les filtres globaux à un dashboard | Le glisser-déposer libre comme cœur du produit : il est `already_solved` et il n'attaque pas la cause nommée dans le PRD. Retiré du MVP (voir § 5, écart 1). |
| **Power BI** (déjà sous licence via M365) | La sécurité au niveau de la ligne (RLS) comme réponse à « quelle équipe ne voit quelles lignes » ; la notion de jeu de données governed | Le cycle de publication service → rapport → application, incompatible avec le délai de trois mois et avec une équipe sans spécialiste BI. |
| **Le tableur partagé avec un onglet par personne** | Rien. C'est le standard de facto à battre, pas une référence de conception. | Tout. Chaque onglet est un auteur, une formule et une version : c'est précisément le modèle que `archetypes.md` §9 nomme « un fait, deux représentations ». |
| **dbt Semantic Layer / Cube** (référence d'industry pour la métrique gouvernée) | La fiche de métrique versionnée avec propriétaire, définition et version ; le fait qu'une métrique ne soit pas requetable sans sa définition | Le déploiement côté entrepôt : le client n'écrit pas dans l'entrepôt (C1), donc la couche sémantique reste dans l'outil. |

> **Réserve sur la recherche.** Cette section a été produite **sans accès à la documentation en ligne**. Les quatre produits sont nommés parce que le demandeur a lui-même cité les trois premiers ; le quatrième est cité pour la seule raison que c'est la pratique courante en métrique gouvernée. Aucune URL, aucun numéro de version et aucun comportement précis n'est affirmé ici. Les affirmations à vérifier avant la Phase 4 sont listées en § 6.

---

## 3. Grille de conformité à l'archétype

| # | Question | Réponse | Justification si écart |
|---|---|---|---|
| 1 | Module le plus fréquent accessible en 1–2 sauts ? | conformité | La lecture d'indicateurs est l'écran d'accueil. La construction d'une vue libre est à deux sauts, et c'est cohérent avec sa priorité P2. |
| 2 | Navigation bornée (≤5 principaux) et justifiée ? | conformité | Cinq entrées, ordonnées par fréquence (cf. § 4). |
| 3 | Actions récurrentes sans navigation profonde ? | écart assumé | Le drill-down passe par un détail d'indicateur puis une décomposition : deux sauts depuis la liste. Justifié par l'archétype lui-même : « chaque visuel est cliquable vers son détail » — le détail **est** le drill-down, il ne peut pas être une action de liste. |
| 4 | Boucle principale couverte de bout en bout ? | conformité | Consulter (US-3) → détecter (US-4) → investiguer (US-5). Les trois étapes ont une slice. |
| 5 | États d'erreur / hors-ligne traités si requis ? | conformité | E1, E3, E11 couvrent l'indisponibilité de la source, la non-rafraîchissement et le calcul trop long. |
| 6 | Modules attendance de l'archétype présents ou écartés ? | écart assumé | Quatre des cinq modules attendance sont présents (vue d'ensemble, alertes, rapports, drill-down). **Configuration est éclatée** : les seuils sont écrits à côté de la définition (B11) et non dans un écran de réglages. Voir § 5, écart 2. |
| 7 | Aucun module sans user story ? | conformité | Chaque entrée de navigation renvoie à au moins une user story et à au moins un écran. |

**Verdict** : `PASS` — deux écarts assumés, tous deux justifiés en § 5.

---

## 4. Standards d'archétype retenus

| Standard | Adopté | Comment |
|---|---|---|
| Sidebar, densité haute | oui | Cinq entrées, pas de barre supérieure qui répète le titre. |
| Hiérarchie en trois temps KPI → signal → détail | oui | Tuile d'indicateur (valeur + cible + fraîcheur), signal (franchissement), détail (drill-down). |
| Le dashboard montre des anomalies, pas des métriques décoratives | oui | Un indicateur hors cible porte une couleur sémantique et un texte ; un indicateur dans la cible est neutre. B11 le rend impossible de colorier une valeur par agrément. |
| Chaque visuel est cliquable vers son détail | oui | Chaque tuile ouvre la décomposition de son calcul. |
| Seuils et couleurs sémantiques | oui | B11 + B12. Seuils écrits avec la définition, jamais dans un écran séparé. |
| Plages temporelles pilotables | oui | La période est dans l'URL : elle fait partie de ce qu'un lien partagé restitue. |
| Tri et filtre, sélection multiple, actions groupées | non | `admin_crud` secondaire : le référentiel des définitions en profitera en V1, pas dans le MVP. |

---

## 5. Écarts assumés

| # | Écart par rapport à l'archétype ou à un produit de référence | Décision | Justification | Réversibilité |
|---|---|---|---|---|
| 1 | Pas de constructeur de vues par glisser-déposer dans le MVP | on s'écarte | `premise-challenger` a établi que Metabase et Power BI le font déjà et sont déjà payés ; le demandeur a accepté de le repousser en V1, en échange d'un engagement de trois mois. L'effort placé ici aurait produit une capacité déjà possédée deux fois, sur un problème de **définition** et non de rendu. | facile — c'est une fonctionnalité absente, pas une donnée créée |
| 2 | Les seuils ne vivent pas dans un écran de configuration | on s'écarte | Un seuil posé à côté d'une définition non signée produit une alerte qui crie sur un désaccord de calcul. Le seuil appartient à la version de la définition (B11), donc il se signe avec elle. | coûteuse — bouger un seuil plus tard, c'est changer une version signée |
| 3 | Pas de valeurs de détail dans les vues | on s'écarte | Un échantillon de lignes sur un agrégat contredit B7 : la restriction de visibilité s'applique à la donnée, donc un échantillon n'est pas « représentatif » mais « filtré », et le lecteur ne peut pas savoir lequel. | facile |
| 4 | La détection d'anomalie sans seuil reste hors périmètre | on s'écarte | Arbitrage explicite du demandeur : le vrai défaut est l'absence de seuil écrit, pas l'absence d'algorithme. US-16 est maintenue en P4 et ne déclenchera jamais d'alerte. | facile |
| 5 | La version est un dépôt, pas une branche | on s'écarte | L'archétype `admin_crud` suppose des brouillons et des révisions. Ici chaque version d'une définition est un objet figé : c'est B1, et c'est ce qui rend B2 applicable. | facile |

---

## 6. Risques de biais

| Risque | Probabilité | Impact | Mitigation |
|---|---|---|---|
| Sur-copie de Metabase, alors que le produit se veut différent | MEDIUM | HIGH | La grille § 3 est vérifiée par `plan-validator` en Fast Track ; tout écart non listé ici est un défaut. |
| Biais « on reconstruit un outil » : conviction que le problème est la construction de vues | HIGH | HIGH | Le § 5 écart 1 l'écrit noir sur blanc. Si la Phase 4 introduit un composeur en V1 sans la justification de délai, il faut le traiter comme une dérive. |
| Affirmation non vérifiée sur un produit cité | MEDIUM | MEDIUM | Aucune URL ni version n'est affirmée ; les quatre entrées sont à revérifier avant la Phase 4, et rien dans l'architecture ne doit en dépendre. |
| Navigation calquée sur un autre archétype (grid/liste dense d'`admin_crud`) | LOW | MEDIUM | La densité est justifiée par la lecture en séance de comité, pas par l'archivage. |

---

## 7. Checklist de gate

- [x] L'archétype est identifié et justifié par le PRD.
- [x] La boucle de travail est écrite en une phrase.
- [x] Au moins deux produits de référence sont documentés, ou leur absence est justifiée.
- [x] Les sept questions de la grille de conformité sont répondues.
- [x] Chaque écart est justifié et son coût de réversibilité est indiqué.
- [x] Les standards retenus sont ceux **applicables**, pas une liste exhaustive.
- [x] Le verdict est écrit.
- [x] Ce document est écrit **avant** le gate d'architecture, pour servir de référence au `plan-validator` en Fast Track.