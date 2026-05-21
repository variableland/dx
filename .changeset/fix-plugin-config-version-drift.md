---
"@rrlab/biome-plugin": patch
"@rrlab/ts-plugin": patch
"@rrlab/tsdown-plugin": patch
---

Resolve sibling `@rrlab/*-config` packages via the `latest` dist-tag at install time instead of hardcoding a version range. Fixes `rr plugins add` failing when the plugin and its config sibling drift (e.g. `@rrlab/biome-plugin@0.1.0` was pinning `@rrlab/biome-config@^0.1.0` while the latest published config was `0.0.2`). The host's `package.json` still ends up with a concrete resolved range (pnpm resolves the dist-tag at install time), so lockfile reproducibility is unchanged.
