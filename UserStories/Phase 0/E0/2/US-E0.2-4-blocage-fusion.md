## US E0.2-4 — La CI bloque la fusion en cas d'échec

*Enabler technique.*

Une pull request vers `main` ne peut pas être fusionnée tant que la CI n'est pas verte. La Definition of Done devient ainsi une garantie plutôt qu'une bonne intention.

**Fixture** : aucune (enabler technique).

**Critères d'acceptation**
- Étant donné une règle de protection (ou un *ruleset*) sur `main`, alors les jobs `rust` et `wasm` y sont déclarés comme *status checks* obligatoires.
- Étant donné une pull request dont un job obligatoire est rouge, quand on tente de la fusionner, alors GitHub refuse la fusion.
- Étant donné une pull request volontairement cassée (par ex. un fichier non formaté), quand la CI tourne, alors la PR est bloquée. Une fois corrigée, la CI repasse au vert et la fusion est permise. Cette démonstration est faite une fois, puis la PR est fermée.
- Étant donné que le job `front` est *skipped* tant que `web/` n'existe pas, alors il n'est **pas** encore obligatoire. Il le deviendra avec E0.3 (à noter dans les US de E0.3).
- La configuration de la protection, qui se fait manuellement dans les réglages GitHub, est décrite en quelques lignes dans le `README` ou dans `docs/`, pour pouvoir être refaite.

**Hors périmètre** : revue obligatoire par une seconde personne, signature des commits, règles sur les messages de commit.
**Dépendances** : US E0.2-1, US E0.2-2
**Point d'attention** : les branches protégées et les rulesets ne sont appliqués sur un compte GitHub Free que pour un dépôt public. C'est le cas de LemonCrochet (vérifié). S'il repassait en privé, cette protection sauterait.
