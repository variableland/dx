---
"@rrlab/cli": patch
---

Honor `pretscheck` as the primary pre-script alias for `rr tsc`.

Now that the typecheck task is canonically named `tscheck` (#240), a package's `pretscheck` script runs before the type check, taking precedence over the legacy `pretsc` and `pretypecheck` aliases (which still work as fallbacks).
