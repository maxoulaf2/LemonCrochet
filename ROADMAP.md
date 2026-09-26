# ROADMAP

Feuille de route du visualiseur 3D de patrons d'amigurumi.

Organisation : **phases** (jalons démontrables) → **épiques** (`E1`) → **fonctionnalités** (`E1.2`). Chaque fonctionnalité donne en général 1 à 3 user stories. Les identifiants sont stables : les US, branches et commits y font référence (`feat(dsl): E1.3 répétitions imbriquées`).

Statut : `[ ]` à faire · `[~]` en cours · `[x]` terminé

---

## Phase 0 : Fondations

> Un squelette qui compile, se teste et se déploie, pour que tout le reste soit incrémental.

### E0 — Socle technique

- [x] **E0.1 Workspace Cargo** — Les six crates vides avec leurs dépendances orientées (`dsl` → `topology` → `solver` → `mesh` → `wasm`, plus `cli`). `clippy -D warnings` passe.
- [x] **E0.2 CI** — GitHub Actions : fmt, clippy, tests Rust, build `wasm-pack`, typecheck et tests du front. La CI bloque la fusion en cas d'échec.
- [ ] **E0.3 Front minimal** — Vite, CodeMirror 6, scène Three.js vide. Module WASM chargé dans un Web Worker, aller-retour texte → résultat.
- [ ] **E0.4 Harnais d'exemples** — Chaque fichier `examples/**/*.crochet` devient automatiquement un test (parse, validation, invariants au fur et à mesure qu'ils existent).
- [ ] **E0.5 Docs initiales** — `docs/dsl.md` (grammaire cible V0) et `docs/model.md` (unités, constantes).

### S1 — Spike : faisabilité du solveur

- [ ] **S1.1** — XPBD jetable sur une sphère codée en dur (6-12-18-24-24-24-18-12-6). Valider stabilité, performances en WASM et rendu visuel. Principal risque technique du projet : à faire avant d'investir dans la phase 2.
- [ ] **S1.2** — Compte rendu dans `docs/spikes/s1-solver.md` : décisions retenues, chiffres de performance, pistes abandonnées.

**Jalon 0** : du texte tapé dans l'éditeur transite par le worker WASM et un résultat s'affiche. Le spike montre une sphère simulée.

---

## Phase 1 (V0) : Aperçu instantané

> Un premier outil déjà utile : il vérifie les comptes de mailles et donne un aperçu de la forme.

### E1 — DSL de base

- [ ] **E1.1 Lexer** — Tokens avec spans (via `logos`) : nombres, parenthèses, crochets, astérisques, commentaires, sauts de ligne.
- [ ] **E1.2 Parser des tours** — Instructions `T1:`, `Rnd 1:`, `R1:` ; suite de mailles ; compte optionnel `(18)` ou `[18]`.
- [ ] **E1.3 Répétitions** — `(…) x6`, `*…* répéter 6 fois`, imbrication.
- [ ] **E1.4 Plages de tours** — `T4-T8: 18 ms` s'expanse en cinq tours.
- [ ] **E1.5 Mailles de base** — Cercle magique, ms, aug, dim, et leurs synonymes (« 2 ms dans la même maille » = aug).
- [ ] **E1.6 Terminologie** — En-tête `terms: fr|us|uk`, normalisation dans l'AST, erreur si abréviation ambiguë sans en-tête.
- [ ] **E1.7 Pièces** — Bloc `piece nom`, instruction `fermer`, plusieurs pièces par fichier (sans assemblage).

### E2 — Validation et diagnostics

- [ ] **E2.1 Calcul des comptes** — Mailles consommées et produites par tour.
- [ ] **E2.2 Vérification des comptes** — Écart avec le compte annoncé → warning localisé indiquant les deux valeurs.
- [ ] **E2.3 Consommation incohérente** — Un tour qui consomme plus de mailles que le précédent n'en a produit → erreur.
- [ ] **E2.4 Récupération sur erreur** — Le parser continue après une erreur de syntaxe et remonte toutes les erreurs du fichier.
- [ ] **E2.5 Messages** — Codes d'erreur stables (`E0102`…), messages en français, suggestions (« vouliez-vous dire “dim” ? »).

### E3 — Profil analytique

- [ ] **E3.1 Rayons et hauteurs** — `r = n·w / 2π`, `dz = sqrt(h² − Δr²)`.
- [ ] **E3.2 Détection d'ondulation** — Tours sur-augmentés signalés, avec indicateur visuel.
- [ ] **E3.3 Fermeture** — Le dernier tour d'une pièce fermée converge vers l'axe.

### E4 — Éditeur

- [ ] **E4.1 Coloration syntaxique** — `StreamLanguage` dans un premier temps, grammaire Lezer ensuite.
- [ ] **E4.2 Diagnostics dans l'éditeur** — Soulignement, info-bulle, panneau listant les problèmes.
- [ ] **E4.3 Analyse en direct** — Parsing et profil avec debounce d'environ 150 ms.
- [ ] **E4.4 Compteur par tour** — Compte calculé affiché en marge de chaque ligne.

### E5 — Rendu par surface de révolution

- [ ] **E5.1 Maillage** — Révolution du profil, normales, matériau simple.
- [ ] **E5.2 Caméra** — Rotation orbitale, zoom, recentrage automatique.
- [ ] **E5.3 Lien texte → 3D** — Survoler une ligne met en surbrillance l'anneau du tour.
- [ ] **E5.4 Sélecteur de pièce** — Choisir la pièce affichée quand il y en a plusieurs.

**Jalon 1** : je colle le patron d'une tête d'ours, je vois ses erreurs de compte et sa silhouette 3D mise à jour pendant que je tape.

---

## Phase 2 (V1) : Simulation réaliste

> Une vraie forme rembourrée, maille par maille, en couleur.

### E6 — Graphe de mailles

- [ ] **E6.1 Construction** — AST → graphe : arêtes horizontales (spirale) et verticales (parents).
- [ ] **E6.2 Invariants** — Tests `proptest` : conservation des comptes, 1 ou 2 parents, chaîne horizontale unique, identifiants contigus.
- [ ] **E6.3 Traçabilité** — Chaque maille conserve le span de l'instruction qui l'a produite.
- [ ] **E6.4 Export de debug** — JSON et DOT depuis la CLI.

### E7 — Solveur XPBD

- [ ] **E7.1 Structure SoA** — Positions, masses inverses, contraintes en tableaux plats.
- [ ] **E7.2 Contraintes de distance** — Arêtes horizontales et verticales, avec compliance.
- [ ] **E7.3 Contraintes de flexion** — Entre mailles voisines, angle de repos à 0°.
- [ ] **E7.4 Initialisation** — Positions de départ issues du profil analytique (E3).
- [ ] **E7.5 Convergence** — Critère d'arrêt, itérations max, résultats déterministes au bit près.
- [ ] **E7.6 Budget de performance** — Benchmark criterion. Cible à confirmer après S1 (ex. 5 000 mailles convergées en moins d'une seconde dans le navigateur).

### E8 — Rembourrage

- [ ] **E8.1 Pression ou volume** — Implémenter, comparer, choisir ; documenter dans `docs/model.md`.
- [ ] **E8.2 Paramètre utilisateur** — Curseur `stuffing` de 0 à 1 qui relance la simulation.
- [ ] **E8.3 Pièces ouvertes** — Pas de pression sur une pièce non fermée.

### E9 — Maillage et rendu des mailles

- [ ] **E9.1 Triangulation** — Quads entre les tours, triangles aux aug et dim.
- [ ] **E9.2 Repères locaux** — Repère tangent par maille, calculé dans `crochet-mesh`.
- [ ] **E9.3 Rendu instancié** — Géométrie en « V » par maille via `InstancedMesh`.
- [ ] **E9.4 Niveaux de rendu** — Bascule surface lisse / normal map / mailles instanciées.

### E10 — Couleurs

- [ ] **E10.1 Syntaxe** — Couleur par pièce (`color=`) et changement en cours de tour (« en couleur B »).
- [ ] **E10.2 Palette** — Couleurs nommées, sélecteur dans l'interface.
- [ ] **E10.3 Rendu** — Couleur appliquée par maille.

### E11 — Orchestration du worker

- [ ] **E11.1 Annulation** — Une nouvelle frappe annule la simulation en cours.
- [ ] **E11.2 Progression** — Positions intermédiaires envoyées au rendu, la forme se construit à l'écran.
- [ ] **E11.3 Double régime** — Profil analytique immédiat, puis simulation après une pause de frappe.

### E12 — Lien 3D → texte

- [ ] **E12.1 Sélection** — Cliquer sur une maille place le curseur sur l'instruction correspondante.
- [ ] **E12.2 Inspection** — Info-bulle : tour, index, type de maille.

**Jalon 2** : une pièce multicolore, rembourrée, à la forme crédible, avec navigation complète texte ↔ 3D.

---

## Phase 3 (V2) : Techniques avancées

> Couvrir la majorité des patrons réels d'une seule pièce.

- [ ] **E13 Brin avant / arrière** — Syntaxe BLO et FLO, flexion de repos à ~90°, rendu des brins restés libres. *Fixtures : fond de pied, rebord de chapeau.*
- [ ] **E14 Départ en ovale** — « N ml puis autour de la chaînette » : topologie et initialisation dédiées. *Fixtures : pied, museau.*
- [ ] **E15 Rangs aller-retour** — Tourner l'ouvrage, ml de tournant, topologie en bandes. *Fixtures : oreille plate, aile.*
- [ ] **E16 Mailles hautes** — Demi-bride et bride, longueurs au repos propres, mélange dans un même tour.
- [ ] **E17 Tours partiels** — Mailles non travaillées, maille coulée de fin de tour, tours fermés (non spiralés) et leur couture.
- [ ] **E18 Échantillon et mesures** — Taille du crochet et échantillon, conversion en cm, hauteur et diamètre affichés.
- [ ] **E19 Mailles texturées** *(optionnel)* — Popcorn, picot, rendus comme des bosses localisées.

**Jalon 3** : un corpus d'environ dix patrons réels d'une pièce rendus de manière crédible.

---

## Phase 4 (V3) : Assemblage

> Un amigurumi complet.

- [ ] **E20 Multi-pièces** — Instances (`bras x2`), symétrie, bibliothèque de pièces dans le fichier.
- [ ] **E21 Syntaxe d'assemblage** — Bloc `assemble`, adressage d'une maille (pièce, tour, index), couture d'un bord ouvert sur une surface, orientation.
- [ ] **E22 Contraintes de couture** — Intégration au solveur, simulation conjointe des pièces.
- [ ] **E23 Collisions simples** — Pas d'interpénétration entre pièces (sphères englobantes par maille).
- [ ] **E24 Placement interactif** — Glisser une pièce, aimantation à la surface, rotation, écriture automatique de la ligne `assemble`.
- [ ] **E25 Accessoires** — Yeux de sécurité (taille, position entre deux tours), broderie simple (segments entre mailles), ancrés au graphe.

**Jalon 4** : un ours complet (tête, corps, quatre membres, oreilles, museau, yeux) assemblé et rendu.

---

## Phase 5 (V4) : Produit

- [ ] **E26 Import assisté par LLM** — Patron libre collé → DSL proposé → diff → validation. La validation déterministe reste obligatoire avant acceptation.
- [ ] **E27 Mode pas à pas** — Construction tour par tour, compteur de mailles, marqueur du tour en cours, affichage mobile.
- [ ] **E28 Persistance** — Sauvegarde locale, liste de projets, historique.
- [ ] **E29 Partage et export** — Lien de partage, export OBJ/GLB, capture PNG, GIF de rotation, export du patron normalisé.
- [ ] **E30 Internationalisation** — Interface et messages d'erreur en anglais.
- [ ] **E31 Conception inverse** *(exploratoire)* — Forme sculptée ou importée → patron généré.

---

## Chemin critique

```
E1 → E2 → E6 → E7 → E8 → E21 → E22
```

En parallèle du chemin critique :

- le rendu (E5 puis E9) peut avancer avec des données factices ;
- l'éditeur (E4) ne dépend que du lexer (E1.1) ;
- le spike S1 lève le risque du solveur avant la phase 2.

---

## Definition of Done

Toute US est terminée quand :

- `cargo fmt`, `cargo clippy -D warnings` et `cargo test --workspace` passent, ainsi que `pnpm typecheck` et `pnpm test` si le front est touché ;
- **DSL** : `docs/dsl.md` est à jour, les snapshots `insta` sont validés, et au moins un fichier d'exemple couvre la fonctionnalité dans `examples/` ;
- **Solveur** : pas de régression sur les benchmarks, tests de forme par mesures avec tolérance (rayon, hauteur, volume), `docs/model.md` à jour si une constante change ;
- **Front** : navigation au clavier et contrastes corrects, performances vérifiées sur un appareil mobile moyen ;
- la case correspondante de ce fichier est cochée.

---

## Rédiger les user stories

Deux formats :

- **Story utilisateur** — « En tant que *persona*, je veux… afin de… ». Personas : la **crocheteuse** qui suit un patron, la **créatrice** qui écrit ses patrons, la **découvreuse** qui ouvre un patron partagé.
- **Enabler technique** — Pour E0, E6, E7 notamment : titre technique direct et critères d'acceptation, sans « en tant que » artificiel.

Les critères d'acceptation s'appuient de préférence sur un fichier d'exemple en fixture, au format Étant donné / Quand / Alors.

### Modèle

```markdown
## US E<x>.<y> — <titre court>

En tant que <persona>, je veux <action> afin de <bénéfice>.

**Fixture** : `examples/<chemin>.crochet`

**Critères d'acceptation**
- Étant donné …, quand …, alors …
- …

**Hors périmètre** : …
**Dépendances** : E…
```

### Exemple

```markdown
## US E2.2 — Signaler un compte de mailles erroné

En tant que créatrice de patrons, je veux être avertie quand le compte annoncé
d'un tour ne correspond pas aux mailles réellement produites, afin de corriger
mes erreurs avant de publier.

**Fixture** : `examples/erreurs/compte_faux.crochet` (le tour 3 annonce `(17)`)

**Critères d'acceptation**
- Étant donné la fixture, quand je l'ouvre dans l'éditeur, alors `(17)` est
  souligné en warning avec le message « Ce tour produit 18 mailles, pas 17 ».
- Étant donné la même fixture, alors la 3D s'affiche quand même, en utilisant
  le compte calculé (18).
- Étant donné un patron sans compte annoncé, alors aucun warning n'est émis.

**Hors périmètre** : correction automatique du compte.
**Dépendances** : E1.2, E2.1
```