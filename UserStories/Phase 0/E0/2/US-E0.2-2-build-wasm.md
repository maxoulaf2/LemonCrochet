## US E0.2-2 — Build WebAssembly en intégration continue

*Enabler technique.*

La CI compile `crochet-wasm` avec `wasm-pack`, pour détecter au plus tôt un code qui compile en natif mais pas pour la cible `wasm32-unknown-unknown`. C'est le cas, par exemple, d'une dépendance qui utilise le système de fichiers ou des threads.

**Fixture** : aucune (enabler technique).

**Critères d'acceptation**
- Étant donné `crates/crochet-wasm/Cargo.toml`, alors il déclare `crate-type = ["cdylib", "rlib"]` et une dépendance `wasm-bindgen`. `lib.rs` expose au moins une fonction `#[wasm_bindgen]` triviale, par ex. `version() -> String`, pour que le module ne soit pas vide.
- Étant donné un push ou une pull request, quand la CI tourne, alors un job `wasm` exécute
  `wasm-pack build crates/crochet-wasm --target web --out-dir ../../web/src/wasm`
  et réussit.
- Étant donné le build réussi, alors le job vérifie la présence du `.wasm` et du `.js` de liaison dans le dossier de sortie.
- Étant donné une dépendance incompatible avec `wasm32-unknown-unknown` ajoutée à une crate de la chaîne `dsl → … → wasm`, quand la CI tourne, alors le job `wasm` échoue.
- La cible `wasm32-unknown-unknown` est déclarée dans `rust-toolchain.toml` (voir US E0.2-1).
- `web/src/wasm/` est ignoré par git : c'est un artefact de build.
- Le build fonctionne aussi en local avec la commande de CLAUDE.md.

**Hors périmètre** : chargement du module dans un navigateur ou un Web Worker (E0.3), optimisation de taille (`wasm-opt`, profil `release` spécifique), publication du paquet npm.
**Dépendances** : E0.1, US E0.2-1 (toolchain)
