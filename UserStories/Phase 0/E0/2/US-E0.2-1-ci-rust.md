## US E0.2-1 — Vérifications Rust en intégration continue

*Enabler technique.*

À chaque push et à chaque pull request, GitHub Actions vérifie le workspace Rust : formatage, lints et tests. Ces vérifications sont celles de la Definition of Done, exécutées dans un environnement propre plutôt que seulement sur le poste du mainteneur.

**Fixture** : aucune (enabler technique). Les tests existants du workspace servent de preuve.

**Critères d'acceptation**
- Étant donné un push sur `main` ou une pull request vers `main`, quand le workflow `.github/workflows/ci.yml` se déclenche, alors un job `rust` exécute dans l'ordre :
  `cargo fmt --all -- --check`, `cargo clippy --workspace --all-targets -- -D warnings`, `cargo test --workspace`.
- Étant donné un fichier mal formaté, quand la CI tourne, alors l'étape `fmt` échoue et le job est rouge.
- Étant donné un warning clippy (par ex. une variable inutilisée), quand la CI tourne, alors l'étape `clippy` échoue.
- Étant donné un test en échec, quand la CI tourne, alors l'étape `test` échoue et le nom du test apparaît dans les logs.
- Étant donné le dépôt dans son état actuel, quand la CI tourne, alors le job est vert.
- La version de Rust est fixée par un `rust-toolchain.toml` à la racine (canal `stable` épinglé sur une version ≥ 1.85, requise par l'édition 2024, avec les composants `rustfmt` et `clippy`). La CI et le poste local utilisent donc la même version.
- Le cache Cargo (`~/.cargo` et `target/`) est conservé entre deux exécutions (par ex. `Swatinem/rust-cache`). Une deuxième exécution sans changement de dépendances est nettement plus rapide que la première.

**Hors périmètre** : matrice multi-OS (Linux seul pour l'instant), couverture de code, `cargo insta` (pas encore de snapshots), benchmarks.
**Dépendances** : E0.1
