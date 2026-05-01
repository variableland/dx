# @vlandoss/loggy

## 0.1.0

### Minor Changes

- [#165](https://github.com/variableland/dx/pull/165) [`33659b4`](https://github.com/variableland/dx/commit/33659b4f2666aee939ed637b0dd6366854e22a96) Thanks [@rqbazan](https://github.com/rqbazan)! - Add Node.js compatibility via `publishConfig` and compiled output

  All publishable packages now ship compiled `dist/` output (via tsdown) and use `publishConfig.exports`/`publishConfig.bin` to override the package fields at publish time. This means consumers using Node.js no longer need Bun installed — the published packages work with `node >= 20` out of the box.

  A new shared package `@vlandoss/tsdown-config` provides reusable build presets (`defineBinConfig`, `defineLibConfig`) and the `nodeShebangPlugin` that rewrites the `#!/usr/bin/env bun` shebang to `#!/usr/bin/env node` in compiled bin files.

## 0.0.7

### Patch Changes

- [#162](https://github.com/variableland/dx/pull/162) [`5c89c36`](https://github.com/variableland/dx/commit/5c89c362934af0722e6b7788eb08b0620a97eb32) Thanks [@rqbazan](https://github.com/rqbazan)! - Switch tsconfigs to `@vlandoss/config/ts/*` and move path aliases from tsconfig `paths` to the `package.json` `imports` field (`#src/*`, `#test/*`). Relative imports now use explicit `.ts` extensions.

## 0.0.6

### Patch Changes

- [#144](https://github.com/variableland/dx/pull/144) [`c1517b2`](https://github.com/variableland/dx/commit/c1517b2e05d5a3bf7a067ec461c7d9e789f06a2f) Thanks [@rqbazan](https://github.com/rqbazan)! - Add test:types script

- [#142](https://github.com/variableland/dx/pull/142) [`b31758e`](https://github.com/variableland/dx/commit/b31758e2d2e2e97a5f3b7b3fec73939e8003da73) Thanks [@rqbazan](https://github.com/rqbazan)! - Stop using tsup

## 0.0.5

### Patch Changes

- [#120](https://github.com/variableland/dx/pull/120) [`462d5b4`](https://github.com/variableland/dx/commit/462d5b493bb1adaa2ed428d2b428fcaaa3001575) Thanks [@rqbazan](https://github.com/rqbazan)! - Update debug dependency

## 0.0.4

### Patch Changes

- [#117](https://github.com/variableland/dx/pull/117) [`3c05da4`](https://github.com/variableland/dx/commit/3c05da44e93bc66433cd222e1f1466a7e2048cec) Thanks [@rqbazan](https://github.com/rqbazan)! - Remove the default time

## 0.0.3

### Patch Changes

- [#97](https://github.com/variableland/dx/pull/97) [`813cfcb`](https://github.com/variableland/dx/commit/813cfcb88e9f273b7f75cf2e2275904c25810130) Thanks [@rqbazan](https://github.com/rqbazan)! - Move to Biome v2

## 0.0.2

### Patch Changes

- [#95](https://github.com/variableland/dx/pull/95) [`0c198e4`](https://github.com/variableland/dx/commit/0c198e46f159edfad14f6b2337e41e05f97172bb) Thanks [@rqbazan](https://github.com/rqbazan)! - Add multi typecheck

## 0.0.1

### Patch Changes

- [#85](https://github.com/variableland/dx/pull/85) [`bdae9bf`](https://github.com/variableland/dx/commit/bdae9bf09a9a967ced98dd42b373c725c2c4f2b3) Thanks [@rqbazan](https://github.com/rqbazan)! - Move to @vlandoss organization
