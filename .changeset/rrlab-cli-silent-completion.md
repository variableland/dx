---
"@rrlab/cli": patch
---

Discard stderr in the shell completion rc lines shown by the README and `rr completion --help`, so a mise shim for `rr` with no active version no longer prints `mise ERROR No version is set for shim: rr` on every new shell outside a project.
