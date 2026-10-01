# DECISIONS.md — les questions d'abord, les choix ensuite

Ce projet n'a pas encore de stack, donc il n'a pas encore de choix à défendre. Une
décision écrite avant de savoir sur quoi elle porte n'est pas une décision : c'est
une supposition habillée en décision, et elle sera lue comme une autorisation. Ce
fichier commence donc par ce que le projet **ne sait pas encore**.

Chaque entrée porte une ligne `Status:`. Tant qu'elle vaut `Open`, la question est
posée et pas tranchée — et le fait qu'elle reste ouverte est une information, pas un
oubli.

## Questions ouvertes

### Q-001 — Sur quel appareil le devis se fait-il devant le client ?

Status: Open

- **Ce qui n'est pas connu** : si c'est le téléphone, la tablette, l'un puis l'autre
  selon le rendez-vous — et lequel est effectivement dans la main quand le client
  attend la réponse.
- **Ce que la réponse détermine** : ce qui peut être fait au moment du devis, et ce
  qui doit se faire avant ou après.

### Q-002 — Comment le devis devient-il signé ?

Status: Open

- **Ce qui n'est pas connu** : signature tracée sur l'écran, photo de la signature au
  stylo, ou simple accord par retour — et si Jean-Luc a besoin que le client signe
  devant lui ou peut s'en passer.
- **Ce que la réponse détermine** : tout l'aller-retour entre l'envoi et la facture,
  et ce que l'application doit prouver qu'un devis a été accepté.

### Q-003 — Quel volume, et quelle part du travail se fait sans réseau ?

Status: Open

- **Ce qui n'est pas connu** : combien de devis par mois en moyenne et au pire moment
  de l'année, et quelle part se passe sans réseau — sous un porche, dans une cave, en
  fin de journée sur un chantier.
- **Ce que la réponse détermine** : si l'outil doit refaire quelque chose sans
  connexion, et pour quoi.

### Q-004 — Entre le devis accepté et la facture, qu'est-ce qui peut changer ?

Status: Open

- **Ce qui n'est pas connu** : si le prix du devis est ferme, ou s'il bouge après —
  avancement réel différent, fournitures, imprévus constatés une fois le chantier
  ouvert.
- **Ce que la réponse détermine** : si une facture peut être émise depuis un devis tel
  quel, ou s'il faut un mécanisme d'écart entre les deux.

### Q-005 — Où vivent les devis de Jean-Luc, et qui d'autre peut les ouvrir ?

Status: Open

- **Ce qui n'est pas connu** : si Jean-Luc est le seul lecteur, ou s'il y a un
  composant, une autre personne de l'atelier, un comptable ; et ce que devient un
  dossier client si son téléphone ou sa tablette est perdu.
- **Ce que la réponse détermine** : combien de personnes un document doit
  reconnaître comme lecteur, et si perdre un appareil est un incident ou une fin de
  dossier client.

### Q-006 — Quelles mentions doit porter une facture de menuiserie en France ?

Status: Open

- **Ce qui n'est pas connu** : les mentions obligatoires d'une facture dans ce
  métier, le traitement de la TVA, et ce qui doit apparaître pour un devis.
- **Ce que la réponse détermine** : les champs que chaque document doit porter, et ce
  qu'un devis signé ne pourra pas devenir une facture sans ressaisie.

## Questions tranchées

Rien pour l'instant : aucune des questions ci-dessus n'est tranchée.

**Le moment où l'on écrit ici** est celui où tu tranches quelque chose qui aurait pu
aller autrement. À cet instant, l'entrée de la question correspondante est déplacée
de `## Questions ouvertes` vers cette section, sa ligne `Status:` passe de `Open` à
`Closed`, et l'entrée gagne quatre lignes :

- la date ;
- la décision, en une phrase, dans la voix du projet ;
- la source : qui l'a décidée, et où l'on peut aller le vérifier ;
- ce qui a été écarté, et pourquoi.

L'entrée reste unique : elle change de section, elle n'est pas dupliquée. Une même
question présente dans les deux listes serait lue deux fois et les deux versions
divergeraient.