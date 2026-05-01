---
"@vlandoss/clibuddy": minor
"@vlandoss/loggy": minor
"@vlandoss/localproxy": minor
"@vlandoss/run-run": minor
"@vlandoss/starter": minor
"@vlandoss/config": patch
"@vlandoss/biome-config": patch
---

Add Node.js compatibility via `publishConfig` and compiled output

All publishable packages now ship compiled `dist/` output (via tsdown) and use `publishConfig.exports`/`publishConfig.bin` to override the package fields at publish time. This means consumers using Node.js no longer need Bun installed — the published packages work with `node >= 20` out of the box.

A new shared package `@vlandoss/tsdown-config` provides reusable build presets (`defineBinConfig`, `defineLibConfig`) and the `nodeShebangPlugin` that rewrites the `#!/usr/bin/env bun` shebang to `#!/usr/bin/env node` in compiled bin files.
