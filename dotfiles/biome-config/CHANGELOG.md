# @vlandoss/biome-config

## 0.0.8

### Patch Changes

- [#165](https://github.com/variableland/dx/pull/165) [`33659b4`](https://github.com/variableland/dx/commit/33659b4f2666aee939ed637b0dd6366854e22a96) Thanks [@rqbazan](https://github.com/rqbazan)! - Add Node.js compatibility via `publishConfig` and compiled output

  All publishable packages now ship compiled `dist/` output (via tsdown) and use `publishConfig.exports`/`publishConfig.bin` to override the package fields at publish time. This means consumers using Node.js no longer need Bun installed — the published packages work with `node >= 20` out of the box.

  A new shared package `@vlandoss/tsdown-config` provides reusable build presets (`defineBinConfig`, `defineLibConfig`) and the `nodeShebangPlugin` that rewrites the `#!/usr/bin/env bun` shebang to `#!/usr/bin/env node` in compiled bin files.

## 0.0.7

### Patch Changes

- [#158](https://github.com/variableland/dx/pull/158) [`e7d6f17`](https://github.com/variableland/dx/commit/e7d6f17b3a5bfa56a6c2ed1aab7679bda876456d) Thanks [@rqbazan](https://github.com/rqbazan)! - Mark `@vlandoss/biome-config` as deprecated in favor of `@vlandoss/config/biome`. The package will continue to receive critical fixes but no new features. See the README for migration instructions.

## 0.0.6

### Patch Changes

- [#146](https://github.com/variableland/dx/pull/146) [`0ca5ac1`](https://github.com/variableland/dx/commit/0ca5ac1aba30399b4a3f7500e0156ab28bcf62d2) Thanks [@rqbazan](https://github.com/rqbazan)! - Migrate to biome 2.4.4

## 0.0.5

### Patch Changes

- [#134](https://github.com/variableland/dx/pull/134) [`6fe338f`](https://github.com/variableland/dx/commit/6fe338f630efe7c2554fb2bd172157d395d3931b) Thanks [@rqbazan](https://github.com/rqbazan)! - Off complexity/noStaticOnlyClass lint rule

## 0.0.4

### Patch Changes

- [#132](https://github.com/variableland/dx/pull/132) [`7074d20`](https://github.com/variableland/dx/commit/7074d208730494641fc6b3bc18176cbf2371f29f) Thanks [@rqbazan](https://github.com/rqbazan)! - Disable svg without title rule

## 0.0.3

### Patch Changes

- [#97](https://github.com/variableland/dx/pull/97) [`813cfcb`](https://github.com/variableland/dx/commit/813cfcb88e9f273b7f75cf2e2275904c25810130) Thanks [@rqbazan](https://github.com/rqbazan)! - Move to Biome v2

## 0.0.2

### Patch Changes

- [#93](https://github.com/variableland/dx/pull/93) [`0a8b49d`](https://github.com/variableland/dx/commit/0a8b49de50115ab70283854b21688649c79a85f4) Thanks [@rqbazan](https://github.com/rqbazan)! - Add schema to biome config

## 0.0.1

### Patch Changes

- [#85](https://github.com/variableland/dx/pull/85) [`bdae9bf`](https://github.com/variableland/dx/commit/bdae9bf09a9a967ced98dd42b373c725c2c4f2b3) Thanks [@rqbazan](https://github.com/rqbazan)! - Move to @vlandoss organization
