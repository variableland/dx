---
"@vlandoss/run-run": patch
---

- Drop the direct `is-ci` dependency in favour of `isCI` re-exported from `@vlandoss/clibuddy`'s new env module. One less direct dep, single source of truth for env detection.
- Remove the duplicate `bin` block from `publishConfig` — it mirrored the top-level `bin` field with no overrides.
