---
"@vlandoss/clibuddy": patch
"@vlandoss/localproxy": patch
"@vlandoss/loggy": patch
"@vlandoss/run-run": patch
"@vlandoss/starter": patch
---

Migrate from Bun to Node.js as the runtime target.

- `run-run`: fix `require.resolve` usage in `BiomeService` (not available in ESM with Node.js); replaced with `createRequire`. Add support for `run-run.config.mts` config files.
- `localproxy`: replace `fs.exists` (Bun-only API) with a `fs.access`-based helper.
- `clibuddy`, `loggy`, `starter`: remove `bun` from `engines` field.
