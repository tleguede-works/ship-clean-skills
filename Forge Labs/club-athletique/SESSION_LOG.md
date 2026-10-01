# SESSION_LOG.md — Club Sportif

Ce journal raconte ce qui s'est passé, et rien d'autre : ni les questions en
cours, ni les corrections. Chacune de ces deux choses a son fichier, cité ici
pour que personne n'y ajoute une troisième fois le même événement.

**Le seul endroit où ajouter une entrée : la section `## Sessions`, en bas**, une
entrée par session, la plus récente en dernier. Le journal se lit à l'endroit où
il est écrit, pas à l'endroit où une section voisine existe déjà.

## Sessions

### 2026-10-01 — Socle de contexte

Ce qui s'est passé : création des quatre fichiers de contexte à la racine du
projet, à partir de la seule description donnée par le club — réservation de
créneaux pour un club omnisports, sur téléphone d'abord, un représentant qui
gère les créneaux et des adhérents qui réservent eux-mêmes, 400 adhérents,
3 terrains, des créneaux de 2 h, une personne à la mairie.

Ce qui n'a pas été fait, et qui n'est reporté nulle part : aucune stack n'a été
choisie, aucune vérification de terrain n'a été lancée, aucun fichier
d'instructions n'a été produit. Les questions ouvertes sont dans
`DECISIONS.md` — ce journal ne les répète pas. Elles sont toutes marquées
ouvertes, et le resteront jusqu'à ce que quelqu'un y réponde.

### 2026-10-01 — Les deux appels, et deux défauts trouvés en les faisant

Ce qui s'est passé : la Phase 0 a été ouverte avec Forge, et les deux appels à
`project-rules-architect` ont été faits dans l'ordre prévu — d'abord le socle de
contexte, ici même, puis rien encore, parce que l'architecture n'est pas décidée.

Deux défauts ont été trouvés en exécutant, et tous deux dans les fichiers de
mémoire :

1. **La casse.** Les quatre fichiers ont été écrits en minuscules, alors que la
   convention est en majuscules. Conséquence : rien ne les trouvait, et l'outillage
   répondait qu'il n'y avait pas de mémoire sur un projet où il y en avait une.
2. **Les déclencheurs manquaient.** Le tableau disait ce que contenait chaque
   fichier, et jamais ce qui faisait qu'on y écrive. Trois contenants décrits et
   aucune instruction de les remplir : c'est-à-dire une mémoire qui serait
   définitivement vide tout en ayant l'air d'avancer.

Ce qui a été corrigé, et où : les deux dans le skill — le lecteur de mémoire remis
sur les bons noms, et la vérification du mode socle complétée par les déclencheurs
et par la casse. Les fichiers eux-mêmes ont été corrigés sur place.

Ce qui n'a pas été fait : aucun choix de stack, donc toujours aucun appel pour les
règles, donc toujours pas de `AGENTS.md` de règles. Cette session n'a produit
aucune décision : les dix questions de `DECISIONS.md` restent ouvertes, et c'est le
bon état.
