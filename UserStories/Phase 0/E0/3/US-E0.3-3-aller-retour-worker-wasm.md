## US E0.3-3 — Aller-retour texte → Web Worker WASM → résultat

*Enabler technique.*

Le texte de l'éditeur est envoyé à un Web Worker. Celui-ci charge le module `crochet-wasm`, appelle une fonction Rust et renvoie un résultat que la page affiche. C'est la tuyauterie sur laquelle reposeront le parsing (E1) et le solveur (E7), qui ne doivent jamais bloquer le thread principal.

**Fixture** : le patron d'exemple de l'US E0.3-2.

**Critères d'acceptation**
- Étant donné `crochet-wasm`, alors il expose une fonction `#[wasm_bindgen]` de démonstration qui prend le texte et renvoie un résultat simple, par ex. `count_lines(text: &str) -> u32`. Elle est couverte par un test Rust et ne contient ni `unwrap` ni `panic!`.
- Étant donné la page chargée, alors le module WASM est instancié **dans un Web Worker** (worker module de Vite), jamais sur le thread principal.
- Étant donné les messages entre la page et le worker, alors leur forme est décrite par des types TypeScript partagés : une requête portant un identifiant et le texte, une réponse portant le même identifiant et le résultat ou une erreur.
- Étant donné une frappe dans l'éditeur, quand le texte change, alors il est envoyé au worker, et une barre d'état affiche la version du module (`version()`) et le résultat, par ex. « crochet-wasm 0.1.0 · 12 lignes ».
- Étant donné plusieurs frappes rapides, alors seule la réponse à la dernière requête est affichée : une réponse arrivée en retard, avec un identifiant plus ancien, est ignorée.
- Étant donné un échec de chargement du module WASM, alors la barre d'état affiche un message d'erreur en français au lieu de rester vide.
- Étant donné un test Vitest, alors il charge le `.wasm` généré dans Node et vérifie le résultat de la fonction de démonstration.
- Étant donné `web/package.json`, alors un script `wasm` lance la commande `wasm-pack` de CLAUDE.md, pour ne pas avoir à la retaper.

**Hors périmètre** : debounce et analyse en direct (E4.3), annulation d'un calcul en cours (E11.1), vrai parsing (E1), transfert de buffers `Float32Array` (E9).
**Dépendances** : US E0.3-1, US E0.3-2, US E0.2-2 (build WASM)
