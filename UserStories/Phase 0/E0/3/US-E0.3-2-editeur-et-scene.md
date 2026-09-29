## US E0.3-2 — Éditeur de texte et scène 3D vide

En tant que créatrice de patrons, je veux voir côte à côte une zone où écrire mon patron et une zone 3D, afin de retrouver dès le départ la disposition de l'outil final.

**Fixture** : le contenu initial de l'éditeur est le patron d'exemple de CLAUDE.md (tête de sphère en `terms: fr`), embarqué comme texte statique.

**Critères d'acceptation**
- Étant donné la page ouverte, alors l'écran est partagé en deux panneaux : l'éditeur à gauche, la scène 3D à droite.
- Étant donné le panneau de gauche, alors il contient un éditeur CodeMirror 6 avec numéros de ligne, historique (annuler/rétablir) et le patron d'exemple pré-rempli.
- Étant donné l'éditeur, quand je tape du texte, alors il est modifiable normalement. Aucune coloration propre au DSL n'est attendue.
- Étant donné le panneau de droite, alors il affiche une scène Three.js avec une caméra, une lumière, une grille au sol et des axes, pour vérifier visuellement que le rendu fonctionne.
- Étant donné une fenêtre redimensionnée, alors la scène s'adapte à la taille de son panneau sans déformation (ratio de la caméra et taille du canvas mis à jour).
- Étant donné l'onglet en arrière-plan, alors la boucle de rendu ne consomme pas de CPU inutilement (`requestAnimationFrame`).

**Hors périmètre** : coloration syntaxique (E4.1), diagnostics (E4.2), contrôles de caméra (E5.2), sauvegarde du texte, thème sombre.
**Dépendances** : US E0.3-1
