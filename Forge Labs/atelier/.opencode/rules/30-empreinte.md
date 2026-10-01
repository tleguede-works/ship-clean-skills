# L'empreinte avant l'envoi

## Commande

| Quand | Commande |
|---|---|
| Toute tranche | `npx vitest run` — sort 0 |
| Toute tranche | `npx eslint .` — sort 0 |
| Tranche qui touche le schéma | `node "$FORGE/scripts/ddl-exec.js" all <anchor>` — sort 0, avec la garde `signature_empreinte_verifie` déclarée |

Les deux premières lignes ne s'appliquent qu'une fois `package.json` écrit ; le statut est
dans `00-regles.md` § Commandes.

`ddl-exec` ne se contente pas de valider un DDL : il **exécute** les gardes déclarées et
échoue si l'une ne tient pas. Une garde `signature_empreinte_verifie` écrite mais jamais
déclarée n'est pas vérifiée par cette commande — la déclaration fait partie de la tranche.

## Définition de terminé

1. `npx vitest run` sort 0.
2. `npx eslint .` sort 0.
3. Si la tranche touche le schéma : `node "$FORGE/scripts/ddl-exec.js" all <anchor>` sort 0,
   et la garde `signature_empreinte_verifie` est déclarée, donc exécutée.
4. La tranche a un test où **une modification du texte après la signature annule la
   signature**. C'est le test qui distingue cette règle d'une règle de ne-pas-modifier.

## Quand écrire un devis signable, sa signature, ou son envoi

- **L'empreinte est calculée sur l'appareil, au moment de la signature, donc avant tout
  envoi.** Elle sort de `packages/empreinte`, un paquet unique importé **des deux côtés**,
  sur des centimes entiers, sans aucun formatage local.
- **À la réception, la base revérifie.** La contrainte `signature_empreinte_verifie`
  recalcule l'empreinte du texte stocké et **refuse l'insertion** si elle diffère ; le
  serveur répond alors `422`. La base ne peut donc pas certifier une empreinte fausse.
- **Modifier le texte après la signature annule la signature.** Dans la transaction de la
  modification : l'entrée de file est invalidée avec la raison
  `signature annulée par une modification (B11)`, la signature passe à l'état `annulee`,
  le tracé antérieur **reste visible, barré**, et le devis ne peut pas ressortir avant une
  nouvelle signature. Une nouvelle signature écrit une **nouvelle** ligne, avec une
  empreinte différente : les deux sont cumulables, donc l'archive garde la chaîne
  complète de ce qui a été signé, et dans quel ordre.
- **L'empreinte est imprimée en bas du PDF**, en police à chasse fixe : elle est sur le
  papier que le client emporte, pas seulement dans l'application. Elle vit à trois endroits,
  et il n'y en a pas d'autre : la ligne du devis (ce qu'il est *maintenant*), la ligne de
  signature, immuable (ce qu'il *était* au moment de signer), et le PDF.

## Motifs interdits

- **« Ne pas modifier un devis signé. »** Cette formulation est fausse, et elle coûte cher :
  on **peut** modifier un devis signé — c'est le geste de correction normal, E6. Ce qui
  se produit, c'est que la signature **cesse d'exister**. Interdire la modification
  interdirait la correction ; laisser croire que la signature survit ment au client et à
  Jean-Luc. Ce qui est interdit, c'est de laisser une signature affichée après que le
  texte a changé.
- **Recalculer l'empreinte côté serveur** au lieu de l'importer de `packages/empreinte`.
  Deux implémentations, deux octets possibles, et l'empreinte vérifiée n'est plus celle
  qui a été signée : c'est le risque numéro un du projet, parce qu'il n'attaque pas le
  produit, il attaque sa seule garantie juridique (R-01).
- **Un montant en flottant, ou un montant formaté, dans le texte canonique.** `0.1 + 0.2`
  n'est pas `0.3`, et une empreinte qui dépend d'un flottant ou d'un séparateur décimal
  local n'est pas une empreinte : elle diverge entre l'appareil et le serveur. Les centimes
  sont des entiers, l'ordre des champs est écrit une fois et ne bouge jamais, et les
  désignations passent par une normalisation NFC.
- **Un `UPDATE` ou un `DELETE` sur la ligne de signature.** Elle est immuable : le
  déclencheur `signature_preuve_gele` refuse les deux. Un historique qu'on peut réécrire
  n'est pas une preuve.

## Pourquoi cette règle est la première du jeu

`.forge/contract.md` § 3 achète une **signature tracée à 0 €** et exclut la signature qualifiée,
qui coûterait 1 à 3 € par devis. **Rien d'autre dans ce produit ne prouve quoi que ce soit
à un tiers** : ni l'archive, ni le courriel, ni le PDF. L'empreinte est donc la seule
garantie juridique, et elle ne tient que parce qu'elle est calculée par un paquet partagé
et revérifiée par la base — trois occasions de se tromper, dont deux indépendantes du code
qui écrit le document. C'est aussi pourquoi elle est calculée **avant** l'envoi : une
empreinte prise à la réception décrirait ce qui est arrivé, pas ce qui a été signé.

<!-- source: décisions du projet — `.forge/architecture.md` § 10.3, § 5.4, ADR-2, ADR-6, R-01 ;
exigences — `.forge/prd.md` B3, B9, B10, B11, C3, § 7.2, E6, E17 ; `.forge/contract.md` § 3 -->
