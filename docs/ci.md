# Intégration continue

Le workflow `.github/workflows/ci.yml` tourne sur chaque push vers `main` et sur chaque pull request qui cible `main`.

| Job | Contenu | Obligatoire pour fusionner |
|---|---|---|
| `rust` | `cargo fmt --check`, `clippy -D warnings`, `cargo test` | oui |
| `wasm` | `wasm-pack build`, puis publication de `web/src/wasm` comme artefact | oui |
| `front` | `pnpm install --frozen-lockfile`, `pnpm typecheck`, `pnpm test` (ignoré tant que `web/package.json` n'existe pas) | non, il le deviendra avec E0.3 |

## Protection de la branche `main`

La fusion est bloquée tant que la CI n'est pas verte. Cette protection se règle à la main sur GitHub. Voici comment la refaire :

1. Sur le dépôt, aller dans **Settings → Rules → Rulesets → New ruleset → New branch ruleset**.
2. Remplir les champs :
   - **Ruleset name** : `main protégée` ;
   - **Enforcement status** : `Active` ;
   - **Bypass list** : laisser vide (personne ne contourne la règle, pas même l'administrateur) ;
   - **Target branches** : *Add target → Include default branch*.
3. Cocher les règles suivantes :
   - **Restrict deletions** et **Block force pushes** (cochées par défaut) ;
   - **Require a pull request before merging**, avec 0 approbation requise ;
   - **Require status checks to pass**, puis *Add checks* : `rust` et `wasm` (source : GitHub Actions).
4. Cliquer sur **Create**.

Les noms des checks correspondent au champ `name:` des jobs dans `ci.yml`. Si un job est renommé, il faut aussi mettre à jour le ruleset, sinon la PR restera bloquée en attendant un check qui ne viendra jamais.

**Attention** : sur un compte GitHub Free, les rulesets ne s'appliquent qu'aux dépôts publics. Si le dépôt repasse en privé, cette protection disparaît.
