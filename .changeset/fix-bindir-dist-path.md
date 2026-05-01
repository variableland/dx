---
"@vlandoss/run-run": patch
"@vlandoss/localproxy": patch
"@vlandoss/starter": patch
"@vlandoss/tsdown-config": patch
---

Fix `binDir` pointing to `dist/` in compiled CLIs

When a CLI was published and executed via the compiled binary, `import.meta.url` resolved to the `dist/` folder, causing `binDir` to be `<root>/dist/` instead of the package root. This broke `localBaseBinPath` (which expects `<root>/node_modules/.bin`) and any other logic anchored to the package root.

The fix introduces a thin `bin.mjs` wrapper at the package root that computes `binDir` from its own location (always the root) and imports the compiled logic from `dist/main.mjs`. The `tsdown-config` entry point is updated accordingly from `bin.ts` to `src/main.ts`.
