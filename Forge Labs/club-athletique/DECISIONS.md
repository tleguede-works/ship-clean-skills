# DECISIONS.md — Club Sportif

Ce projet n'a pas encore de stack. Ce qui suit est donc, pour l'essentiel, une
liste de questions : une décision écrite avant que la stack soit connue serait
une supposition habillée en décision, et elle serait lue comme une vérité dans
six mois. Une question ouverte n'a pas ce problème — elle est fausse et vraie en
même temps, et elle attend.

**Le seul endroit où ajouter une entrée : la section `## Entrées`, en bas.** Une
entrée passe de `Status: Open` à `Status: Closed` sur place, avec la date de
clôture et la réponse. Elle n'est ni déplacée ni dupliquée : un journal de
décisions qui garde la moitié périmée d'une question quelque part est un journal
dont on ne sait plus quelle moitié lire.

Forme d'une entrée : un identifiant, la question ou la décision en une ligne,
`Status:`, puis ce qui la bloque et qui peut y répondre.

## Entrées

### Q-001 — Quelle stack, et qui tranche ?

Status: Open

Aucun choix n'a été fait et rien n'est installé. C'est la première question parce
que les autres en dépendent : sans elle, ni le modèle de données, ni
l'hébergement, ni l'identité n'ont pas de terrain pour être discutés.

Bloqué par : rien, c'est le point de départ. Répondable par : la phase de
planification, sur un usage que le club décrit et qui est déjà clair.

### Q-002 — Quel support viser en premier, et en repli sur quel autre ?

Status: Open

« Sur téléphone d'abord » ne dit pas si un poste d'administrateur existe aussi,
ni si le club a un ordinateur, ni d'où un représentant accède aux créneaux. Ces
trois réponses changent le produit plus que la stack.

Bloqué par : Q-001 pour la forme, mais la réponse est partiellement disponible dès
maintenant — le club peut la donner. Répondable par : le représentant du club.

### Q-003 — Comment un adhérent se fait-il reconnaître ?

Status: Open

Les adhérents réservent eux-mêmes, et le club n'a qu'une personne à la mairie.
Personne n'a décrit comment quelqu'un passe de « je suis adhérent » à « je
réserve », et les réponses possibles ont des conséquences très différentes.

Bloqué par : rien de technique. Répondable par : le club.

### Q-004 — Le représentant crée-t-il les créneaux un par un, ou depuis un rythme hebdomadaire ?

Status: Open

Trois terrains, des créneaux de 2 h, une seule personne : la manière dont le
planning est saisi au départ est le poste de coût le plus visible de l'outil, et
personne ne l'a décrite.

Bloqué par : rien. Répondable par : le représentant du club.

### Q-005 — Que se passe-t-il quand deux adhérents visent le même créneau ?

Status: Open

La règle de priorité n'est pas écrite, et elle ne peut pas l'être : le club sait
ce qui lui convient, pas nous. La question est posée pour que la réponse soit
consignée quand elle viendra, pas devinée en attendant.

Bloqué par : rien. Répondable par : le club.

### Q-006 — Y a-t-il de l'argent derrière la réservation ?

Status: Open

Rien n'a été dit d'un paiement, d'une adhésion, d'un tarif, ni de leur absence.
Selon la réponse, le produit contient un système de paiement ou n'en contient pas,
et c'est une différence de taille.

Bloqué par : rien. Répondable par : le club.

### Q-007 — Le terrain est-il la seule unité, ou le terrain-sport l'est-il ?

Status: Open

Trois terrains pour un club omnisports : la même personne ne peut peut-être pas
jouer deux sports sur le même créneau, et rien ne le dit. Savoir si une unité de
réservation existe déjà, ou si elle est à créer, change le modèle de données.

Bloqué par : rien. Répondable par : le club.

### Q-008 — Quelque chose remplace-t-il aujourd'hui un carnet papier, un tableur, ou une autre appli ?

Status: Open

Personne n'a mentionné d'outil en usage, dans un sens ou dans l'autre. S'il en
existe un, il est la vraie spécification — ce que le club a tenté et abandonné
en dit plus long que ce qu'il prévoit.

Bloqué par : rien. Répondable par : le représentant du club.

### Q-009 — Que devient le service si la personne de la mairie s'absente ?

Status: Open

Une seule personne gère le club aujourd'hui. Ce que le projet laisse derrière
elle — données, accès, compétence de reprise — n'a pas été discuté, et c'est la
question qui décide du modèle d'hébergement.

Bloqué par : Q-001. Répondable par : le club, puis la phase de planification.

### Q-010 — Comment le projet est-il mis en service, et par qui ?

Status: Open

Le déploiement n'est pas décrit : qui le fait, depuis où, avec quelle
maintenance. Sur un club de cette taille, « personne ne sait le mettre à jour »
est un état d'échec, pas une contrainte.

Bloqué par : Q-001. Répondable par : le club, puis la phase de planification.
