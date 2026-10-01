# L'écriture locale d'abord, et l'ordre par rang

## Commande

| Quand | Commande |
|---|---|
| Toute tranche | `npx eslint .` — sort 0, et donc aucun `Date.now()` dans `apps/web/magasin/`, `apps/web/file/` ni `apps/web/sorties/` |
| Toute tranche | `npx vitest run` — sort 0 |

Les deux lignes ne s'appliquent qu'une fois `package.json` écrit ; le statut est dans
`00-regles.md` § Commandes. L'interdiction dont la première ligne dépend est écrite une
seule fois, dans `10-horloge.md` § Motifs interdits — elle n'est pas répétée ici.

## Définition de terminé

1. `npx vitest run` sort 0, et le test qui compare l'ordre de sortie de la file à l'ordre
   des rangs fait partie de ce qui passe. C'est un test nommé par un ADR, pas un test qu'on
   choisit d'écrire quand il arrange.
2. `npx eslint .` sort 0.
3. La tranche a obtenu son rang par le magasin — la transaction `F3.ecrire` ou
   `F3.prochainRang()` — et par rien d'autre.

## Quand écrire une écriture ou une sortie

- **Toute écriture passe par `F3`, dans une transaction, et renvoie le rang obtenu.** Elle
  est retrouvable à l'identique après réouverture, coupure de réseau comprise. Aucune
  action de la boucle — saisir, chiffrer, signer, enregistrer, consulter — ne suppose la
  connexion ; seule la sortie du devis en dépend.
- **Le serveur archive et envoie, il ne réécrit rien.** Aucune écriture ne va directement
  au serveur, et aucun algorithme de fusion n'existe : il n'y a qu'un écrivain, donc il
  n'y a rien à arbitrer. Un refus du serveur devient un état visible sur le devis, jamais
  une reprise silencieuse.
- **La file se trie par `rang`, et le rang vient du magasin.** `rang_sequentiel` et le
  déclencheur `rang_suivant` l'attribuent à l'écriture. Une écriture qui veut passer devant
  une autre n'a pas de mot à dire : elle prend le prochain rang.
- **Une modification d'un devis déjà signé invalide l'entrée de file à l'écriture**, pas au
  moment de l'envoi, et l'entrée **reste visible** avec sa raison. Une entrée qui disparaît
  de la liste est un devis que Jean-Luc croit parti.
- **L'envoi ne se réessaie pas tout seul.** Le client interroge ; il ne boucle pas, il n'y a
  aucun délai actif, et le jeton de tentative est tiré **avant** le départ. Un refus est
  affiché à l'écran avec ce que le service a dit, jamais « a échoué ».

## Motifs interdits

- **Trier la file par `Date.now()`, par `tente_le`, ou par la date du document.** C'est le
  motif le plus probable et le plus silencieux : l'ordre obtenu est plausible, reproductible
  sur le bureau, et faux sur le terrain. Le tri n'est pas un paramètre passé à la file — il
  est écrit une fois, dans `dansLordre()`.
- **Un second essai qui repart avec un nouveau jeton.** Un devis n'est envoyé qu'une fois
  par action : le second appui n'envoie rien et ne crée pas de doublon. Un doublon chez un
  client se corrige mal.
- **Supprimer une entrée de file** pour qu'elle cesse d'être visible.
- **Afficher un pourcentage, une durée estimée ou un ton rassurant** dans le bandeau de
  file. Le bandeau dit un nombre. Une estimation que le produit ne peut pas tenir devient
  un mensonge optimiste dès que le réseau ne revient pas.

## Pourquoi le rang et pas l'heure

Un devis signé à 9 h sur un chantier sans réseau part-il après un devis saisi à 8 h avec
réseau ? **Oui, il part après.** Le rang dit l'**ordre de production**, pas l'ordre
d'horloge : le devis de 8 h est entré dans la file avant celui de 9 h. Être signé rend un
devis **sortable**, ce qui n'est pas être urgent.

Trois raisons de ne pas ordonner par l'heure, et la troisième est celle qui compte :
l'horloge d'un téléphone de chantier n'est pas celle de Jean-Luc ; `Date.now` est
interdit hors de `packages/horloge`, donc l'heure d'écriture **n'est même pas lisible à
l'endroit où l'ordre se décide** ; et surtout B12 établit que la date qui fait foi est celle
**écrite sur le document**, qui ne bouge pas si le devis sort trois semaines plus tard. Un
ordre fondé sur l'heure ferait dépendre la file d'un fait que le PRD déclare sans valeur.
Un ordre fondé sur le rang est reproductible : même magasin, même rang, même ordre, que
l'appareil ait ou non raison.

Et l'écriture locale d'abord, c'est ce même principe appliqué à l'écran : le devis se fait
dans une cave, devant un client qui attend. Une écriture partie d'abord est perdue au
moment précis où elle se fait.

<!-- source: décisions du projet — `.forge/architecture.md` § 10.1, ADR-1, ADR-2, ADR-3, ADR-4, R-06 ;
exigences — `.forge/prd.md` B4, B5, B6, B7, B12, C1, E2, E3, E4, E10 -->
