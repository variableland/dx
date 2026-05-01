---
"@vlandoss/localproxy": patch
"@vlandoss/run-run": patch
---

Migrate from Bun to Node.js as the runtime target.

- `run-run`: fix `require.resolve` usage in `BiomeService` (not available in ESM with Node.js); replaced with `createRequire`. Add support for `run-run.config.mts` config files.
- `localproxy`: replace `fs.exists` (Bun-only API) with a `fs.access`-based helper.
