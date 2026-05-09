# @vlandoss/starter

## 0.2.0

### Minor Changes

- [#182](https://github.com/variableland/dx/pull/182) [`0742fa4`](https://github.com/variableland/dx/commit/0742fa466d07a6df296fee9a575a9c92f7587c9c) Thanks [@rqbazan](https://github.com/rqbazan)! - feat(clibuddy): add `dirnameOf` / `filenameOf` helpers; simplify CLI bin entries

  - **New helpers in `@vlandoss/clibuddy`**: `dirnameOf(import.meta)` and `filenameOf(import.meta)`. They prefer the native `import.meta.dirname` / `import.meta.filename` (Node 20.11+) and fall back to `dirname(fileURLToPath(import.meta.url))` otherwise — so packages can keep `engines.node` at `>=20.0.0` without losing ergonomics.
  - **CLI bin entries simplified.** `bin.mjs` / `bin.ts` no longer compute `binDir` and pass it through a `main()` function — they just `import "./src/run.ts"` (or `./dist/run.mjs` for the published artifact). The new `src/run.ts` is now the executable entry: it resolves its own `BIN_DIR` via `dirnameOf(import.meta)` and starts the program. Affects `run-run`, `localproxy`, and `starter`. The `bin` field in each `package.json` is unchanged, so nothing changes for consumers running the CLIs.

### Patch Changes

- Updated dependencies [[`0742fa4`](https://github.com/variableland/dx/commit/0742fa466d07a6df296fee9a575a9c92f7587c9c)]:
  - @vlandoss/loggy@0.2.0
  - @vlandoss/clibuddy@0.3.0

## 0.1.4

### Patch Changes

- Updated dependencies [[`37eb596`](https://github.com/variableland/dx/commit/37eb596a3d50f30430f573ffe3c5a77a3aa88322)]:
  - @vlandoss/clibuddy@0.2.0

## 0.1.3

### Patch Changes

- [#175](https://github.com/variableland/dx/pull/175) [`3271dd1`](https://github.com/variableland/dx/commit/3271dd1144842749cd81a2eb9ba7f85f21d5467e) Thanks [@rqbazan](https://github.com/rqbazan)! - Fix `binDir` pointing to `dist/` in compiled CLIs

  When a CLI was published and executed via the compiled binary, `import.meta.url` resolved to the `dist/` folder, causing `binDir` to be `<root>/dist/` instead of the package root. This broke `localBaseBinPath` (which expects `<root>/node_modules/.bin`) and any other logic anchored to the package root.

  The fix introduces a thin `bin.mjs` wrapper at the package root that computes `binDir` from its own location (always the root) and imports the compiled logic from `dist/main.mjs`. The `tsdown-config` entry point is updated accordingly from `bin.ts` to `src/main.ts`.

## 0.1.2

### Patch Changes

- [#170](https://github.com/variableland/dx/pull/170) [`72d7305`](https://github.com/variableland/dx/commit/72d73052778ebe9d77aebc4d942eee08fe1b56b3) Thanks [@rqbazan](https://github.com/rqbazan)! - Upgrade TypeScript to 6.0.3 and enforce explicit `.ts` import extensions

  - Upgrade TypeScript from 5.9.3 to 6.0.3 across the monorepo
  - Add `useImportExtensions: "error"` biome rule to enforce explicit `.ts` extensions in all imports
  - Add `@types/node` as optional peer dependency in `@vlandoss/config`
  - Add `types: ["node"]` to the `tsconfig.no-dom` base config
  - Update all import paths in `localproxy` and `starter` to use explicit `.ts` extensions
  - Remove root-level `tsconfig.json` (paths now handled per-package)

## 0.1.1

### Patch Changes

- [#168](https://github.com/variableland/dx/pull/168) [`80e17f9`](https://github.com/variableland/dx/commit/80e17f9544f1cfff526f27ea50e2dacc6dba6e06) Thanks [@rqbazan](https://github.com/rqbazan)! - Migrate from Bun to Node.js as the runtime target.

  - `run-run`: fix `require.resolve` usage in `BiomeService` (not available in ESM with Node.js); replaced with `createRequire`. Add support for `run-run.config.mts` config files.
  - `localproxy`: replace `fs.exists` (Bun-only API) with a `fs.access`-based helper.
  - `clibuddy`, `loggy`, `starter`: remove `bun` from `engines` field.

- Updated dependencies [[`80e17f9`](https://github.com/variableland/dx/commit/80e17f9544f1cfff526f27ea50e2dacc6dba6e06)]:
  - @vlandoss/clibuddy@0.1.1
  - @vlandoss/loggy@0.1.1

## 0.1.0

### Minor Changes

- [#165](https://github.com/variableland/dx/pull/165) [`33659b4`](https://github.com/variableland/dx/commit/33659b4f2666aee939ed637b0dd6366854e22a96) Thanks [@rqbazan](https://github.com/rqbazan)! - Add Node.js compatibility via `publishConfig` and compiled output

  All publishable packages now ship compiled `dist/` output (via tsdown) and use `publishConfig.exports`/`publishConfig.bin` to override the package fields at publish time. This means consumers using Node.js no longer need Bun installed — the published packages work with `node >= 20` out of the box.

  A new shared package `@vlandoss/tsdown-config` provides reusable build presets (`defineBinConfig`, `defineLibConfig`) and the `nodeShebangPlugin` that rewrites the `#!/usr/bin/env bun` shebang to `#!/usr/bin/env node` in compiled bin files.

### Patch Changes

- Updated dependencies [[`33659b4`](https://github.com/variableland/dx/commit/33659b4f2666aee939ed637b0dd6366854e22a96)]:
  - @vlandoss/clibuddy@0.1.0
  - @vlandoss/loggy@0.1.0

## 0.0.14

### Patch Changes

- [#162](https://github.com/variableland/dx/pull/162) [`5c89c36`](https://github.com/variableland/dx/commit/5c89c362934af0722e6b7788eb08b0620a97eb32) Thanks [@rqbazan](https://github.com/rqbazan)! - Switch tsconfigs to `@vlandoss/config/ts/*` and move path aliases from tsconfig `paths` to the `package.json` `imports` field (`#src/*`, `#test/*`). Relative imports now use explicit `.ts` extensions.

- Updated dependencies [[`5c89c36`](https://github.com/variableland/dx/commit/5c89c362934af0722e6b7788eb08b0620a97eb32)]:
  - @vlandoss/clibuddy@0.0.10
  - @vlandoss/loggy@0.0.7

## 0.0.13

### Patch Changes

- [#154](https://github.com/variableland/dx/pull/154) [`577f4c7`](https://github.com/variableland/dx/commit/577f4c7df0f2f749fad395ec454d287f666d47bd) Thanks [@rqbazan](https://github.com/rqbazan)! - Improve fatal error logging

- Updated dependencies [[`577f4c7`](https://github.com/variableland/dx/commit/577f4c7df0f2f749fad395ec454d287f666d47bd)]:
  - @vlandoss/clibuddy@0.0.9

## 0.0.12

### Patch Changes

- [#149](https://github.com/variableland/dx/pull/149) [`6092149`](https://github.com/variableland/dx/commit/60921491f8d26159d450a5f41986fab220f40074) Thanks [@rqbazan](https://github.com/rqbazan)! - Update usage of clibuddy

- [#146](https://github.com/variableland/dx/pull/146) [`0ca5ac1`](https://github.com/variableland/dx/commit/0ca5ac1aba30399b4a3f7500e0156ab28bcf62d2) Thanks [@rqbazan](https://github.com/rqbazan)! - Upgrade deps

- Updated dependencies [[`6092149`](https://github.com/variableland/dx/commit/60921491f8d26159d450a5f41986fab220f40074), [`0ca5ac1`](https://github.com/variableland/dx/commit/0ca5ac1aba30399b4a3f7500e0156ab28bcf62d2)]:
  - @vlandoss/clibuddy@0.0.8

## 0.0.11

### Patch Changes

- [#144](https://github.com/variableland/dx/pull/144) [`c1517b2`](https://github.com/variableland/dx/commit/c1517b2e05d5a3bf7a067ec461c7d9e789f06a2f) Thanks [@rqbazan](https://github.com/rqbazan)! - Add test:types script

- Updated dependencies [[`c1517b2`](https://github.com/variableland/dx/commit/c1517b2e05d5a3bf7a067ec461c7d9e789f06a2f), [`b31758e`](https://github.com/variableland/dx/commit/b31758e2d2e2e97a5f3b7b3fec73939e8003da73)]:
  - @vlandoss/clibuddy@0.0.7
  - @vlandoss/loggy@0.0.6

## 0.0.10

### Patch Changes

- Updated dependencies [[`97a4b51`](https://github.com/variableland/dx/commit/97a4b513617b39b49dbc5244c9c8d9011a721f6f)]:
  - @vlandoss/clibuddy@0.0.6

## 0.0.9

### Patch Changes

- Updated dependencies [[`462d5b4`](https://github.com/variableland/dx/commit/462d5b493bb1adaa2ed428d2b428fcaaa3001575)]:
  - @vlandoss/loggy@0.0.5

## 0.0.8

### Patch Changes

- [#117](https://github.com/variableland/dx/pull/117) [`3c05da4`](https://github.com/variableland/dx/commit/3c05da44e93bc66433cd222e1f1466a7e2048cec) Thanks [@rqbazan](https://github.com/rqbazan)! - Update readme

- Updated dependencies [[`3c05da4`](https://github.com/variableland/dx/commit/3c05da44e93bc66433cd222e1f1466a7e2048cec), [`3c05da4`](https://github.com/variableland/dx/commit/3c05da44e93bc66433cd222e1f1466a7e2048cec)]:
  - @vlandoss/clibuddy@0.0.5
  - @vlandoss/loggy@0.0.4

## 0.0.7

### Patch Changes

- [#115](https://github.com/variableland/dx/pull/115) [`e64d35c`](https://github.com/variableland/dx/commit/e64d35c10e0cb63ba35011986cdd54cedec71e5d) Thanks [@rqbazan](https://github.com/rqbazan)! - Change husky pre-commit template

## 0.0.6

### Patch Changes

- [#109](https://github.com/variableland/dx/pull/109) [`d633196`](https://github.com/variableland/dx/commit/d63319692b93fcfd45acd0e05ccdb1f31ec928d6) Thanks [@rqbazan](https://github.com/rqbazan)! - Fix biome config file template

## 0.0.5

### Patch Changes

- Updated dependencies [[`9557335`](https://github.com/variableland/dx/commit/95573357150d5de9c756b250748686e49ae5ced3)]:
  - @vlandoss/clibuddy@0.0.4

## 0.0.4

### Patch Changes

- [#97](https://github.com/variableland/dx/pull/97) [`813cfcb`](https://github.com/variableland/dx/commit/813cfcb88e9f273b7f75cf2e2275904c25810130) Thanks [@rqbazan](https://github.com/rqbazan)! - Move to Biome v2

- Updated dependencies [[`813cfcb`](https://github.com/variableland/dx/commit/813cfcb88e9f273b7f75cf2e2275904c25810130)]:
  - @vlandoss/clibuddy@0.0.3
  - @vlandoss/loggy@0.0.3

## 0.0.3

### Patch Changes

- [#93](https://github.com/variableland/dx/pull/93) [`0a8b49d`](https://github.com/variableland/dx/commit/0a8b49de50115ab70283854b21688649c79a85f4) Thanks [@rqbazan](https://github.com/rqbazan)! - Add schema to biome config

- [#95](https://github.com/variableland/dx/pull/95) [`0c198e4`](https://github.com/variableland/dx/commit/0c198e46f159edfad14f6b2337e41e05f97172bb) Thanks [@rqbazan](https://github.com/rqbazan)! - Add multi typecheck

- Updated dependencies [[`0c198e4`](https://github.com/variableland/dx/commit/0c198e46f159edfad14f6b2337e41e05f97172bb), [`dc003be`](https://github.com/variableland/dx/commit/dc003bee8bfca1a50850b09114617ed030fcc6d7)]:
  - @vlandoss/clibuddy@0.0.2
  - @vlandoss/loggy@0.0.2

## 0.0.2

### Patch Changes

- [#91](https://github.com/variableland/dx/pull/91) [`711da54`](https://github.com/variableland/dx/commit/711da549bf79f6117e9f26752da01271726e7100) Thanks [@rqbazan](https://github.com/rqbazan)! - Add `tsconfig` generator to add command

## 0.0.1

### Patch Changes

- [#85](https://github.com/variableland/dx/pull/85) [`bdae9bf`](https://github.com/variableland/dx/commit/bdae9bf09a9a967ced98dd42b373c725c2c4f2b3) Thanks [@rqbazan](https://github.com/rqbazan)! - Move to @vlandoss organization

- Updated dependencies [[`bdae9bf`](https://github.com/variableland/dx/commit/bdae9bf09a9a967ced98dd42b373c725c2c4f2b3)]:
  - @vlandoss/clibuddy@0.0.1
  - @vlandoss/loggy@0.0.1
