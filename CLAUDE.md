# CLAUDE.md

Ce fichier guide Claude Code sur ce dépôt. Garde-le à jour quand l'architecture ou les conventions évoluent.

## Le projet

Visualiseur 3D de patrons de crochet, centré sur les amigurumis. L'utilisateur écrit un patron en texte (notation proche de celle des patrons publiés), et l'application affiche la forme 3D finale, rembourrée ou non.

Le pipeline est le suivant :

```
texte du patron ─► DSL (AST + spans) ─► graphe de mailles ─► solveur (profil analytique puis XPBD) ─► maillage ─► rendu Three.js
```

Principe fondamental : **un patron décrit une topologie, pas une géométrie.** La forme émerge des longueurs au repos des mailles, de la flexion et de la pression de rembourrage. Ne jamais « tricher » en imposant une géométrie qui ne découle pas du graphe.

## Structure du dépôt

```
crates/
  crochet-dsl/        Lexer (logos) + parser récursif descendant écrit à la main → AST avec spans
  crochet-topology/   AST → StitchGraph (nœuds = mailles, arêtes horizontales/verticales)
  crochet-solver/     Profil analytique (surface de révolution) + simulation XPBD
  crochet-mesh/       StitchGraph + positions → buffers de rendu (positions, normales, couleurs, repères par maille)
  crochet-wasm/       Bindings wasm-bindgen, seule API exposée au front
  crochet-cli/        Outil de debug : parse, validate, simulate, export OBJ/JSON
web/                  Front TypeScript : Vite, Three.js, CodeMirror 6, Web Worker pour le solveur
docs/
  dsl.md              Spécification de référence du DSL
  model.md            Modèle physique (contraintes, paramètres, unités)
examples/             Patrons d'exemple (.crochet) servant aussi de fixtures de test
```

Dépendances entre crates : `dsl` → `topology` → `solver` → `mesh` → `wasm`. Aucune dépendance dans l'autre sens. `crochet-dsl` ne connaît rien à la géométrie.

## Commandes

```bash
cargo fmt --all
cargo clippy --workspace --all-targets -- -D warnings
cargo test --workspace
cargo insta review                       # valider les snapshots modifiés
cargo bench -p crochet-solver            # criterion

cargo run -p crochet-cli -- validate examples/ours.crochet
cargo run -p crochet-cli -- simulate examples/ours.crochet --out /tmp/ours.obj

wasm-pack build crates/crochet-wasm --target web --out-dir ../../web/src/wasm
cd web && pnpm install && pnpm dev
cd web && pnpm test && pnpm typecheck
```

Avant de considérer une tâche terminée : `fmt`, `clippy` sans warning et `test` doivent passer.

## Conventions

- Code, identifiants, commentaires et messages de commit en **anglais**. Documentation utilisateur et messages d'erreur du DSL en **français** d'abord (i18n prévue plus tard).
- Rust édition 2021, `glam` pour les vecteurs (f32), `serde` pour la sérialisation, `thiserror` pour les erreurs.
- **Pas de `panic!`, `unwrap()` ni `expect()` dans le code de bibliothèque.** Un panic en WASM tue l'onglet. Autorisés uniquement dans les tests et la CLI.
- Toute erreur du DSL porte un `Span` (offset de début et de fin dans le texte source) pour être affichée dans l'éditeur.
- **Déterminisme** : même patron + mêmes paramètres = mêmes positions au bit près. Pas d'itération sur `HashMap` dans le solveur ; indexer par `Vec` et identifiants `u32`. Pas d'aléatoire non seedé.
- Données du solveur en Structure of Arrays (`Vec<Vec3>` de positions, `Vec<f32>` de masses inverses, etc.), pas de `Vec<Stitch>` avec des objets riches.
- Unités : les longueurs sont exprimées en **largeurs de maille serrée** (`w = 1.0`). La conversion en centimètres (échantillon) ne se fait qu'à l'affichage.
- L'API WASM échange des données plates (`Float32Array`, `Uint32Array`) et des diagnostics sérialisés, jamais de structures Rust complexes.

## Glossaire des mailles

Les patrons mélangent terminologies française, US et UK. Le DSL accepte les trois, l'AST est normalisé.

| Français | US | UK | Op. AST | Consomme → produit |
|---|---|---|---|---|
| cercle magique (CM) | magic ring (MR) | magic ring | `MagicRing(n)` | 0 → n |
| maille en l'air (ml) | chain (ch) | chain (ch) | `Chain` | 0 → 1 |
| maille coulée (mc) | slip stitch (sl st) | slip stitch (ss) | `SlipStitch` | 1 → 1 (hauteur ~0) |
| maille serrée (ms) | single crochet (sc) | double crochet (dc) | `Sc` | 1 → 1 |
| demi-bride (db) | half double (hdc) | half treble (htr) | `Hdc` | 1 → 1 |
| bride (B) | double crochet (dc) | treble (tr) | `Dc` | 1 → 1 |
| augmentation (aug) | increase (inc) | increase | `Inc` | 1 → 2 |
| diminution (dim) | decrease (dec, invdec) | decrease | `Dec` | 2 → 1 |
| brin avant / arrière | FLO / BLO | FLO / BLO | modificateur | — |

**Attention** : « dc » signifie maille serrée en UK mais bride en US. Le DSL exige une déclaration `terms: us|uk|fr` en tête de patron si des abréviations ambiguës sont utilisées ; sinon, erreur explicite.

## Le DSL

La spécification complète vit dans `docs/dsl.md`. Toute modification de la grammaire doit mettre à jour ce fichier et les snapshots dans le même commit. Exemple :

```
terms: fr

piece tete color=beige
  T1: CM 6 (6)
  T2: aug x6 (12)
  T3: (1 ms, aug) x6 (18)
  T4-T8: 18 ms (18)
  T9: (1 ms, dim) x6 (12)
  T10: dim x6 (6)
  fermer

piece oreille color=beige
  T1: CM 6 (6)
  T2: BLO 6 ms (6)
  ...

assemble
  oreille -> tete T3 maille 2
```

Le compte entre parenthèses en fin de tour est optionnel mais, s'il est présent, il est **vérifié** : un écart produit un diagnostic (warning) pointant sur la ligne.

## Invariants du graphe de mailles

À vérifier par des tests, idéalement avec `proptest` :

- Pour chaque tour, la somme des mailles consommées égale le nombre de mailles du tour précédent (sauf instruction explicite « laisser les mailles restantes non travaillées »).
- Le nombre de mailles produites égale le compte calculé du tour.
- Chaque maille hors du premier tour a 1 ou 2 parents verticaux ; chaque maille a au plus un successeur horizontal.
- En spirale continue, les mailles forment une seule chaîne horizontale par pièce.
- Les identifiants de nœuds sont stables et contigus (`0..n`), dans l'ordre de crochetage.

## Solveur

Deux niveaux, dans cet ordre :

1. **Profil analytique** (`solver::profile`) : pour chaque tour, `r = n·w / 2π`, et `dz = sqrt(h² − Δr²)`. Si `Δr > h`, marquer le tour comme ondulé. C'est instantané et sert d'aperçu en direct pendant la frappe **et** d'état initial pour XPBD.
2. **XPBD** (`solver::xpbd`) : contraintes de distance (arêtes horizontales et verticales, avec compliance), de flexion (angle de repos ~90° pour BLO/FLO, ~0° sinon), de volume ou de pression pour le rembourrage (`stuffing ∈ [0, 1]`), et de couture pour l'assemblage.

Paramètres par défaut dans `docs/model.md`. Ne pas modifier une constante physique sans mettre à jour ce document et les snapshots de forme.

Tests du solveur : comparer des mesures robustes (rayon max, hauteur totale, volume, fermeture) avec tolérance, pas des positions exactes. Formes de référence : sphère (6-12-18-...-18-...-12-6), cylindre, disque plat (6 aug par tour), cône.

## Front (`web/`)

- Le solveur tourne dans un **Web Worker** ; le thread principal ne fait que l'édition et le rendu.
- Le parsing est rapide : il tourne à chaque frappe (avec debounce ~150 ms) pour diagnostics et profil analytique. La simulation XPBD n'est relancée qu'à la demande ou après une pause de frappe plus longue.
- Lien bidirectionnel texte ↔ 3D : chaque maille du graphe garde le `Span` de l'instruction qui l'a produite. Survol d'une ligne = surbrillance du tour ; clic sur une maille = curseur dans l'éditeur.
- Rendu des mailles par `InstancedMesh` (géométrie de « V » orientée par le repère tangent fourni par `crochet-mesh`).

## Feuille de route

- [ ] **V0** : DSL (CM, ms, aug, dim, répétitions, comptes), validation, profil analytique, surface de révolution dans le front
- [ ] **V1** : graphe de mailles complet, XPBD avec rembourrage, couleurs
- [ ] **V2** : BLO/FLO, départ en ovale sur chaînette, rangs aller-retour, fermeture
- [ ] **V3** : pièces multiples et assemblage (DSL + placement interactif)
- [ ] **V4** : import de patrons libres via LLM (vers le DSL), mode « pas à pas », export

Travailler dans l'ordre. Ne pas anticiper une fonctionnalité d'une version ultérieure sans le demander.

## Façon de travailler

- Pour toute modification touchant plusieurs crates, proposer un plan avant d'écrire le code.
- Pour le DSL : écrire d'abord le test (snapshot `insta` de l'AST ou du diagnostic attendu), puis l'implémentation.
- Ajouter tout nouveau patron d'exemple dans `examples/` : il devient automatiquement un test de non-régression (parse + validation + invariants).
- En cas de doute sur la façon dont une vraie crocheteuse interprète une instruction, poser la question plutôt que deviner : le mainteneur crochète.