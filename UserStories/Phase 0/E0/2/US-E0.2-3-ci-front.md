## US E0.2-3 — Vérifications du front en intégration continue

*Enabler technique.*

La CI vérifie le front TypeScript (`web/`) : typage et tests. Le front n'existe pas encore (il arrive avec E0.3). Le job est donc écrit dès maintenant, mais ne s'active que lorsque `web/package.json` existe.

**Fixture** : aucune (enabler technique).

**Critères d'acceptation**
- Étant donné un dépôt **sans** `web/package.json`, quand la CI tourne, alors le job `front` est ignoré (statut *skipped*) et ne bloque rien.
- Étant donné un dépôt **avec** `web/package.json`, quand la CI tourne, alors le job `front` :
  1. dépend du job `wasm` et récupère le module généré (artefact), car le typecheck importe `web/src/wasm` ;
  2. installe pnpm et Node (versions fixées : `packageManager` dans `package.json`, `.nvmrc` ou équivalent) ;
  3. exécute `pnpm install --frozen-lockfile`, `pnpm typecheck`, puis `pnpm test`.
- Étant donné une erreur de type TypeScript, quand la CI tourne, alors l'étape `typecheck` échoue.
- Étant donné un lockfile désynchronisé du `package.json`, alors `pnpm install` échoue plutôt que de mettre le lockfile à jour en silence.
- Le store pnpm est mis en cache entre deux exécutions.

**Hors périmètre** : création du projet Vite et des scripts `typecheck` / `test` (E0.3), tests end-to-end en navigateur, build de production et déploiement.
**Dépendances** : US E0.2-2 ; activation effective avec E0.3
