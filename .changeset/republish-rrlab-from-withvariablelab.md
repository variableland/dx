---
"@rrlab/biome-config": patch
"@rrlab/biome-plugin": patch
"@rrlab/cli": patch
"@rrlab/oxc-plugin": patch
"@rrlab/ts-config": patch
"@rrlab/ts-plugin": patch
"@rrlab/tsdown-config": patch
"@rrlab/tsdown-plugin": patch
"@rrlab/vitest-plugin": patch
---

Republish from the `withvariablelab/dx` repository: `repository`, `homepage`
and `bugs` now point at `withvariablelab/dx`, and packages that depended on
`@vlandoss/clibuddy` / `@vlandoss/loggy` now depend on the renamed
`@variablelab/clibuddy` / `@variablelab/loggy`. No behavior changes.
