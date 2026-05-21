---
"@rrlab/biome-plugin": patch
"@rrlab/oxc-plugin": patch
"@rrlab/ts-plugin": patch
"@rrlab/tsdown-plugin": patch
---

`TOOL_VERSIONS` now carries only `install` (the prescriptive pin used by `rr plugins add`). The `peer` field is gone — `package.json#peerDependencies` is the single source of truth for the peer contract. The per-plugin `tool-versions.test.ts` asserts `semver.subset(install, peerDependencies[name])` instead of string-equality with a duplicated `peer` field. No runtime behaviour change — `peer` was never read outside its parity test.

Architectural rationale: `decisions/010-tool-versions-install-only.md`.
