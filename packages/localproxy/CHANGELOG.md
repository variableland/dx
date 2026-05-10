# @vlandoss/localproxy

## 0.2.1

### Patch Changes

- Updated dependencies [[`45e1b91`](https://github.com/variableland/dx/commit/45e1b9104d777f3a3da84f395ea62bdf8a2c5f58)]:
  - @vlandoss/clibuddy@0.4.0

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

- [#178](https://github.com/variableland/dx/pull/178) [`37eb596`](https://github.com/variableland/dx/commit/37eb596a3d50f30430f573ffe3c5a77a3aa88322) Thanks [@rqbazan](https://github.com/rqbazan)! - feat(run-run): add `doctor` subcommand to all tool-backed commands

  Each command that wraps an external tool (`jsc`, `tsc`, `lint`, `format`, `build:lib`) now exposes a `doctor` subcommand that verifies the underlying tool is available and working correctly. Example: `rr jsc doctor`.

  - Adds `ToolService` base class with a `doctor()` method that runs `<bin> --help` and returns `{ ok, output }`
  - Adds `TscService` to wrap the `tsc` binary via `ToolService`
  - Adds `createDoctorSubcommand` helper used by all five commands
  - Fixes `ToolService.#shell()` to not override the parent shell's `cwd` when no explicit cwd is given
  - Fixes `ToolService.#getPreferLocal()` to catch errors from `getBinDir()` gracefully

  feat(clibuddy): add `ShellService.mute()` method

  Adds a convenience `mute()` method to `ShellService` that combines `quiet()` (verbose: false) with `stdio: "pipe"`, used internally by the doctor flow to capture tool output without printing it.

  fix(localproxy): correct internal import path alias (`#/*` → `#src/*`)

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

## 0.0.10

### Patch Changes

- [#162](https://github.com/variableland/dx/pull/162) [`5c89c36`](https://github.com/variableland/dx/commit/5c89c362934af0722e6b7788eb08b0620a97eb32) Thanks [@rqbazan](https://github.com/rqbazan)! - Switch tsconfigs to `@vlandoss/config/ts/*` and move path aliases from tsconfig `paths` to the `package.json` `imports` field (`#src/*`, `#test/*`). Relative imports now use explicit `.ts` extensions.

- Updated dependencies [[`5c89c36`](https://github.com/variableland/dx/commit/5c89c362934af0722e6b7788eb08b0620a97eb32)]:
  - @vlandoss/clibuddy@0.0.10
  - @vlandoss/loggy@0.0.7

## 0.0.9

### Patch Changes

- Updated dependencies [[`577f4c7`](https://github.com/variableland/dx/commit/577f4c7df0f2f749fad395ec454d287f666d47bd)]:
  - @vlandoss/clibuddy@0.0.9

## 0.0.8

### Patch Changes

- [#149](https://github.com/variableland/dx/pull/149) [`6092149`](https://github.com/variableland/dx/commit/60921491f8d26159d450a5f41986fab220f40074) Thanks [@rqbazan](https://github.com/rqbazan)! - Update usage of clibuddy

- [#146](https://github.com/variableland/dx/pull/146) [`0ca5ac1`](https://github.com/variableland/dx/commit/0ca5ac1aba30399b4a3f7500e0156ab28bcf62d2) Thanks [@rqbazan](https://github.com/rqbazan)! - Upgrade deps

- Updated dependencies [[`6092149`](https://github.com/variableland/dx/commit/60921491f8d26159d450a5f41986fab220f40074), [`0ca5ac1`](https://github.com/variableland/dx/commit/0ca5ac1aba30399b4a3f7500e0156ab28bcf62d2)]:
  - @vlandoss/clibuddy@0.0.8

## 0.0.7

### Patch Changes

- [#144](https://github.com/variableland/dx/pull/144) [`c1517b2`](https://github.com/variableland/dx/commit/c1517b2e05d5a3bf7a067ec461c7d9e789f06a2f) Thanks [@rqbazan](https://github.com/rqbazan)! - Add test:types script

- [#142](https://github.com/variableland/dx/pull/142) [`b31758e`](https://github.com/variableland/dx/commit/b31758e2d2e2e97a5f3b7b3fec73939e8003da73) Thanks [@rqbazan](https://github.com/rqbazan)! - Stop using tsup

- Updated dependencies [[`c1517b2`](https://github.com/variableland/dx/commit/c1517b2e05d5a3bf7a067ec461c7d9e789f06a2f), [`b31758e`](https://github.com/variableland/dx/commit/b31758e2d2e2e97a5f3b7b3fec73939e8003da73)]:
  - @vlandoss/clibuddy@0.0.7
  - @vlandoss/loggy@0.0.6

## 0.0.6

### Patch Changes

- Updated dependencies [[`97a4b51`](https://github.com/variableland/dx/commit/97a4b513617b39b49dbc5244c9c8d9011a721f6f)]:
  - @vlandoss/clibuddy@0.0.6

## 0.0.5

### Patch Changes

- [#127](https://github.com/variableland/dx/pull/127) [`d40355f`](https://github.com/variableland/dx/commit/d40355fa43c3d0f251012575f1d719856884ad58) Thanks [@rqbazan](https://github.com/rqbazan)! - Add gracefully exit

## 0.0.4

### Patch Changes

- [#125](https://github.com/variableland/dx/pull/125) [`19e1984`](https://github.com/variableland/dx/commit/19e19849dcfb4514b8e49042501bdebf86586c08) Thanks [@rqbazan](https://github.com/rqbazan)! - Improve status command

## 0.0.3

### Patch Changes

- [#123](https://github.com/variableland/dx/pull/123) [`70e3674`](https://github.com/variableland/dx/commit/70e3674b76bd15c4817d68a6d3a1e9374027ea72) Thanks [@rqbazan](https://github.com/rqbazan)! - Support multple ports for same host

## 0.0.2

### Patch Changes

- [#120](https://github.com/variableland/dx/pull/120) [`462d5b4`](https://github.com/variableland/dx/commit/462d5b493bb1adaa2ed428d2b428fcaaa3001575) Thanks [@rqbazan](https://github.com/rqbazan)! - Fix find host and ask sudo password

- Updated dependencies [[`462d5b4`](https://github.com/variableland/dx/commit/462d5b493bb1adaa2ed428d2b428fcaaa3001575)]:
  - @vlandoss/loggy@0.0.5

## 0.0.1

### Patch Changes

- [#119](https://github.com/variableland/dx/pull/119) [`5ceaf2c`](https://github.com/variableland/dx/commit/5ceaf2ca2912b70961a99d9d8a7369a5443fd15b) Thanks [@rqbazan](https://github.com/rqbazan)! - Fix verbose shell

- [#117](https://github.com/variableland/dx/pull/117) [`3c05da4`](https://github.com/variableland/dx/commit/3c05da44e93bc66433cd222e1f1466a7e2048cec) Thanks [@rqbazan](https://github.com/rqbazan)! - Add initial commands

- Updated dependencies [[`3c05da4`](https://github.com/variableland/dx/commit/3c05da44e93bc66433cd222e1f1466a7e2048cec), [`3c05da4`](https://github.com/variableland/dx/commit/3c05da44e93bc66433cd222e1f1466a7e2048cec)]:
  - @vlandoss/clibuddy@0.0.5
  - @vlandoss/loggy@0.0.4
