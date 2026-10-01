# L'horloge injectable

## Commande

| Quand | Commande |
|---|---|
| Toute tranche | `npx eslint .` — sort 0 |
| Tranche qui touche `packages/horloge/` | `npx eslint packages/horloge/` — sort 0 |

Ces deux lignes ne s'appliquent qu'une fois `package.json` écrit ; le statut est dans
`00-regles.md` § Commandes. **`eslint.config.js` n'existe pas encore non plus** : c'est la
première tranche qui l'écrit, et elle l'écrit avec les deux blocs ci-dessous. Un fichier de
config qui n'interdit rien n'est pas une règle en attente : c'est un fichier qui laisse
passer.

## Définition de terminé

1. `npx eslint .` sort 0.
2. Si la tranche a touché `packages/horloge/` : `npx eslint packages/horloge/` sort 0.
   **Sans ce second point, l'exception n'est pas prouvée.** Un bloc qui ne s'applique à
   aucun fichier n'est pas une exception, c'est un oubli qui laisse l'interdiction sans
   contrepartie.

## Quand écrire du code qui parle de temps

- Toute lecture de l'heure passe par `packages/horloge`. Les trois durées y ont une
  fonction et un type de retour : `termeValidite`, `echeance`, `jourRelance`.
- Quand tu as besoin d'une heure, **ajoute la fonction à `packages/horloge`** et fais-la
  dépendre de `SourceHorloge`. Ne passe pas une date en paramètre depuis l'appelant pour
  éviter le paquet : l'appelant n'a pas d'heure à donner, il a un besoin à exprimer.
- Une quatrième durée n'est pas un besoin, c'est une confusion. La validité d'un devis
  court depuis la **date écrite sur le document** (B12) ; l'échéance court depuis la date
  de la facture (B18) ; la relance se compte **depuis l'échéance** (B20). Aucun code ne
  fait `termeValidite - delaiPaiementJours`, et les types de retour distincts le rendent
  impossible à écrire.
- Une relance ne part pas le jour où le devis expire : ce sont deux horloges qui ne
  partagent pas leur point de départ. Une propriété le prouve — pour toute date `j` et
  tout délai `p`, `echeance(j, p)` ≠ `termeValidite(j, p)` dès que `p` n'est pas la durée
  choisie.

## Motifs interdits

- **`Date.now()` et `new Date()` en dehors de `packages/horloge/`.** <!-- source: ESLint
  v9.37.0, docs officielles, règle `no-restricted-syntax` — sélecteurs esquery, et
  `configuration-files.md` : les objets de configuration sont fusionnés, le dernier l'emporte -->
  L'interdiction porte sur ces deux formes **et sur ces deux formes seulement** : ce sont
  exactement les deux appels que la démonstration Playwright sait substituer dans la page,
  donc une troisième façon de lire l'heure passerait le lint et ferait mentir le test.
  <!-- source: Playwright, docs officielles, classe `Clock` — `setFixedTime` « Sets the
  fixed time for `Date.now()` and `new Date()` », et `install` -->
- **`// eslint-disable` sur l'une de ces deux lignes.** C'est le seul moyen de rendre
  l'interdiction décorative : le lint passe, la démonstration continue de mentir, et
  personne ne voit rien. L'exception est nommée, et c'est `packages/horloge/`.
- **Une source d'heure injectée depuis l'extérieur du paquet** — un `now()` passé en
  argument, un `Date` global readapté, une variable de module qui stocke l'heure. La
  source d'une source d'heure, c'est le paquet.

## La configuration qui rend la règle applicable

Une interdiction sans exception nommée n'est pas une règle, c'est une panne : `eslint.config.js`
doit porter **deux** blocs, dans cet ordre.

```js
export default [
  {
    files: ["**/*.{ts,tsx}"],
    rules: {
      "no-restricted-syntax": ["error",
        { selector: "CallExpression[callee.object.name='Date'][callee.property.name='now']",
          message: "L'heure vient de packages/horloge. Voir .opencode/rules/10-horloge.md" },
        { selector: "NewExpression[callee.name='Date']",
          message: "L'heure vient de packages/horloge. Voir .opencode/rules/10-horloge.md" },
      ],
    },
  },
  { files: ["packages/horloge/**/*.ts"], rules: { "no-restricted-syntax": "off" } },
];
```

Le second bloc est l'exception nommée : il arrive **après**, et c'est de là qu'il l'emporte
pour ces fichiers. Dès que `eslint.config.js` existe, cette règle pointe le fichier et ce
bloc disparaît d'ici — un extrait de code collé dans une règle vieillit sans bruit, une
référence de fichier reste juste.

## Pourquoi ces deux formes, et pas d'autres

Un devis a une durée de validité, une facture a une échéance, une relance a un jour : aucune
de ces trois choses ne se démontre en attendant le moment où elle arrive. « Ça marche » ne
prouve pas qu'une relance part au bon jour. Et l'interdiction n'est pas une hygiène : c'est
la **condition de validité de la démonstration**. Si une tranche lisait `Date.now()`
directement, `page.clock` ne substituerait rien pour elle, le scénario passerait quand
même et n'aurait rien démontré (R-10). Le lint échoue avant que le test mente.

<!-- source: décision du projet — `.forge/architecture.md` § 10.2, R-10, ADR-5 ; conventions —
`.forge/conventions.md` § Horloge injectable, et la ligne « Lint / format » du tableau de stack -->
