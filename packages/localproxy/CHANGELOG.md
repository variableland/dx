# @vlandoss/localproxy

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
