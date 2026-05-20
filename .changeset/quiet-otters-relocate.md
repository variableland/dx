---
"@vlandoss/vland": patch
"@vlandoss/clibuddy": patch
"@vlandoss/loggy": patch
---

Relocate the `@vlandoss/*` stack inside the monorepo: `packages/{clibuddy,loggy}` → `shared/{clibuddy,loggy}`, and `packages/vland` + the three `vland init` scaffolds → `vland/{cli,templates}`. Package APIs are unchanged.

The `vland init` template source moves with the scaffolds: when no `VLAND_TEMPLATES_DIR` override is set, `giget` now pulls from `github:variableland/dx/vland/templates/<name>` (previously `github:variableland/dx/templates/<name>`). Existing `vland init` invocations against the published CLI keep working once this version ships alongside the relocated `main` branch.

`@vlandoss/clibuddy` and `@vlandoss/loggy` only see metadata updates (`homepage`, `repository.directory` repointed to `shared/<name>`); the published code is byte-identical to the previous patch.
