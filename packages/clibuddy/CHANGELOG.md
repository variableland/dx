# @vlandoss/clibuddy

## 0.2.0

### Minor Changes

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

## 0.1.1

### Patch Changes

- [#168](https://github.com/variableland/dx/pull/168) [`80e17f9`](https://github.com/variableland/dx/commit/80e17f9544f1cfff526f27ea50e2dacc6dba6e06) Thanks [@rqbazan](https://github.com/rqbazan)! - Migrate from Bun to Node.js as the runtime target.

  - `run-run`: fix `require.resolve` usage in `BiomeService` (not available in ESM with Node.js); replaced with `createRequire`. Add support for `run-run.config.mts` config files.
  - `localproxy`: replace `fs.exists` (Bun-only API) with a `fs.access`-based helper.
  - `clibuddy`, `loggy`, `starter`: remove `bun` from `engines` field.

## 0.1.0

### Minor Changes

- [#165](https://github.com/variableland/dx/pull/165) [`33659b4`](https://github.com/variableland/dx/commit/33659b4f2666aee939ed637b0dd6366854e22a96) Thanks [@rqbazan](https://github.com/rqbazan)! - Add Node.js compatibility via `publishConfig` and compiled output

  All publishable packages now ship compiled `dist/` output (via tsdown) and use `publishConfig.exports`/`publishConfig.bin` to override the package fields at publish time. This means consumers using Node.js no longer need Bun installed — the published packages work with `node >= 20` out of the box.

  A new shared package `@vlandoss/tsdown-config` provides reusable build presets (`defineBinConfig`, `defineLibConfig`) and the `nodeShebangPlugin` that rewrites the `#!/usr/bin/env bun` shebang to `#!/usr/bin/env node` in compiled bin files.

## 0.0.10

### Patch Changes

- [#162](https://github.com/variableland/dx/pull/162) [`5c89c36`](https://github.com/variableland/dx/commit/5c89c362934af0722e6b7788eb08b0620a97eb32) Thanks [@rqbazan](https://github.com/rqbazan)! - Switch tsconfigs to `@vlandoss/config/ts/*` and move path aliases from tsconfig `paths` to the `package.json` `imports` field (`#src/*`, `#test/*`). Relative imports now use explicit `.ts` extensions.

## 0.0.9

### Patch Changes

- [#154](https://github.com/variableland/dx/pull/154) [`577f4c7`](https://github.com/variableland/dx/commit/577f4c7df0f2f749fad395ec454d287f666d47bd) Thanks [@rqbazan](https://github.com/rqbazan)! - Improve fatal error logging

## 0.0.8

### Patch Changes

- [#149](https://github.com/variableland/dx/pull/149) [`6092149`](https://github.com/variableland/dx/commit/60921491f8d26159d450a5f41986fab220f40074) Thanks [@rqbazan](https://github.com/rqbazan)! - Change exported colors

- [#146](https://github.com/variableland/dx/pull/146) [`0ca5ac1`](https://github.com/variableland/dx/commit/0ca5ac1aba30399b4a3f7500e0156ab28bcf62d2) Thanks [@rqbazan](https://github.com/rqbazan)! - Upgrade deps

## 0.0.7

### Patch Changes

- [#144](https://github.com/variableland/dx/pull/144) [`c1517b2`](https://github.com/variableland/dx/commit/c1517b2e05d5a3bf7a067ec461c7d9e789f06a2f) Thanks [@rqbazan](https://github.com/rqbazan)! - Add test:types script

- [#142](https://github.com/variableland/dx/pull/142) [`b31758e`](https://github.com/variableland/dx/commit/b31758e2d2e2e97a5f3b7b3fec73939e8003da73) Thanks [@rqbazan](https://github.com/rqbazan)! - Stop using tsup

## 0.0.6

### Patch Changes

- [#140](https://github.com/variableland/dx/pull/140) [`97a4b51`](https://github.com/variableland/dx/commit/97a4b513617b39b49dbc5244c9c8d9011a721f6f) Thanks [@rqbazan](https://github.com/rqbazan)! - Export new colors for terminal ui

## 0.0.5

### Patch Changes

- [#117](https://github.com/variableland/dx/pull/117) [`3c05da4`](https://github.com/variableland/dx/commit/3c05da44e93bc66433cd222e1f1466a7e2048cec) Thanks [@rqbazan](https://github.com/rqbazan)! - Add bold style

## 0.0.4

### Patch Changes

- [#103](https://github.com/variableland/dx/pull/103) [`9557335`](https://github.com/variableland/dx/commit/95573357150d5de9c756b250748686e49ae5ced3) Thanks [@rqbazan](https://github.com/rqbazan)! - Export Shell type

## 0.0.3

### Patch Changes

- [#97](https://github.com/variableland/dx/pull/97) [`813cfcb`](https://github.com/variableland/dx/commit/813cfcb88e9f273b7f75cf2e2275904c25810130) Thanks [@rqbazan](https://github.com/rqbazan)! - Move to Biome v2

## 0.0.2

### Patch Changes

- [#95](https://github.com/variableland/dx/pull/95) [`0c198e4`](https://github.com/variableland/dx/commit/0c198e46f159edfad14f6b2337e41e05f97172bb) Thanks [@rqbazan](https://github.com/rqbazan)! - Add multi typecheck

- [#96](https://github.com/variableland/dx/pull/96) [`dc003be`](https://github.com/variableland/dx/commit/dc003bee8bfca1a50850b09114617ed030fcc6d7) Thanks [@rqbazan](https://github.com/rqbazan)! - Fix error display handling

## 0.0.1

### Patch Changes

- [#85](https://github.com/variableland/dx/pull/85) [`bdae9bf`](https://github.com/variableland/dx/commit/bdae9bf09a9a967ced98dd42b373c725c2c4f2b3) Thanks [@rqbazan](https://github.com/rqbazan)! - Move to @vlandoss organization
