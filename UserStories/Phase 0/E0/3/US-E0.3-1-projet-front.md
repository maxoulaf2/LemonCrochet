## US E0.3-1 — Projet front et outillage

*Enabler technique.*

Le dossier `web/` devient un projet TypeScript construit avec Vite. Il possède des versions d'outils fixées et les scripts attendus par la CI. Le job `front`, préparé en E0.2, s'active alors et devient obligatoire.

**Fixture** : aucune (enabler technique).

**Critères d'acceptation**
- Étant donné `web/package.json`, alors il déclare :
  - le champ `packageManager` (pnpm, version exacte) ;
  - les scripts `dev`, `build`, `typecheck` (`tsc --noEmit`) et `test` (Vitest, en exécution unique et pas en mode watch).
- Étant donné `web/.nvmrc`, alors il fixe la version majeure de Node (24).
- Étant donné `web/pnpm-lock.yaml`, alors il est commité.
- Étant donné `web/tsconfig.json`, alors le mode `strict` est activé.
- Étant donné un clone neuf, quand je lance `corepack enable`, puis `pnpm install` et `pnpm dev` dans `web/` (après le build WASM), alors une page s'ouvre sans erreur dans la console.
- Étant donné au moins un test Vitest trivial, quand je lance `pnpm test`, alors il passe.
- Étant donné une pull request, quand la CI tourne, alors le job `front` n'est plus *skipped* : il exécute `typecheck` puis `test`, et passe.
- Étant donné une erreur de type introduite volontairement, alors `pnpm typecheck` échoue, en local comme en CI.
- Étant donné le ruleset `main protégée`, alors `front` y est ajouté comme check obligatoire. Le tableau de `docs/ci.md` est mis à jour en conséquence.
- `web/node_modules/` et `web/dist/` sont ignorés par git.

**Hors périmètre** : framework UI (React, Vue…), qui n'est pas prévu ; le front reste en TypeScript sans framework. Linter et formateur JS (ESLint, Prettier), déploiement, build de production optimisé.
**Dépendances** : E0.2 (job `front`, ruleset)
