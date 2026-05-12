# @vlandoss/run-run

## 0.5.3

### Patch Changes

- [#210](https://github.com/variableland/dx/pull/210) [`7d7e673`](https://github.com/variableland/dx/commit/7d7e673e34974740b6b09c8385e9f91ad9af8ea8) Thanks [@rqbazan](https://github.com/rqbazan)! - Internal migration to the new tinyexec-backed `ShellService` (see `@vlandoss/clibuddy`).

  - `ToolService.exec` now accepts only `string[]` (the `string` overload that silently word-split on spaces is gone). All tool services (`biome`, `oxlint`, `oxfmt`, `tsdown`, `tsc`) build their flags as arrays so each flag survives as its own argv entry.
  - Bin resolution moves into the base `ToolService`: subclasses declare `{ pkg, bin?, ui }` in the constructor and the base resolves the absolute path via `resolvePackageBin` (memoised). The verbose `$ <bin> <args>` line is preserved via the `display` option so users still see `$ biome check ...` instead of an absolute resolved path. Resolving to the absolute path bypasses the `node_modules/.bin/<bin>` shims that run-run itself publishes (`tools/biome` etc.), which would otherwise loop back through `rr tools <bin>` indefinitely.
  - `tscheck` runs `pretsc` / `pretypecheck` package scripts through `shell: true` so they can use `&&`, pipes, and env-var substitution.
  - Bump `tsdown` from `0.21.10` to `0.22.0`. `tsdown@0.21.x` depends on `unrun@^0.2.37`, which pnpm resolved to `0.2.38` — whose published tarball is missing `dist/`, producing `WARN Failed to create bin … unrun` on every install. `tsdown@0.22.0` dropped `unrun` from `dependencies` (now an optional peer), erradicating the warning.

  Tests reorganised into one e2e file per command (`cli`, `jsc`, `lint`, `format`, `tsc`, `build-lib`). Each spawns the real `rr` binary against a temp fixture (`makeFixture` helper) and asserts on observable output, so we no longer rely on a `clibuddy/test-helpers` mock.

  End-user CLI behaviour is unchanged.

- Updated dependencies [[`7d7e673`](https://github.com/variableland/dx/commit/7d7e673e34974740b6b09c8385e9f91ad9af8ea8)]:
  - @vlandoss/clibuddy@0.6.0

## 0.5.2

### Patch Changes

- [#201](https://github.com/variableland/dx/pull/201) [`c46f6e8`](https://github.com/variableland/dx/commit/c46f6e8ea78d7c14c3e44ef1d1d543a812437cdf) Thanks [@rqbazan](https://github.com/rqbazan)! - Document shell completion setup for project-local installs (mise/direnv guard + cached-script fallback)

## 0.5.1

### Patch Changes

- [#198](https://github.com/variableland/dx/pull/198) [`d467f7f`](https://github.com/variableland/dx/commit/d467f7fd0f0512a1fe15f6d74cd9a540a21bbfbc) Thanks [@rqbazan](https://github.com/rqbazan)! - - Drop the direct `is-ci` dependency in favour of `isCI` re-exported from `@vlandoss/clibuddy`'s new env module. One less direct dep, single source of truth for env detection.
  - Remove the duplicate `bin` block from `publishConfig` — it mirrored the top-level `bin` field with no overrides.
- Updated dependencies [[`d467f7f`](https://github.com/variableland/dx/commit/d467f7fd0f0512a1fe15f6d74cd9a540a21bbfbc)]:
  - @vlandoss/clibuddy@0.5.0

## 0.5.0

### Minor Changes

- [#192](https://github.com/variableland/dx/pull/192) [`45e1b91`](https://github.com/variableland/dx/commit/45e1b9104d777f3a3da84f395ea62bdf8a2c5f58) Thanks [@rqbazan](https://github.com/rqbazan)! - Add UI consistency for CLIs

### Patch Changes

- Updated dependencies [[`45e1b91`](https://github.com/variableland/dx/commit/45e1b9104d777f3a3da84f395ea62bdf8a2c5f58)]:
  - @vlandoss/clibuddy@0.4.0

## 0.4.1

### Patch Changes

- [#188](https://github.com/variableland/dx/pull/188) [`9e40d2f`](https://github.com/variableland/dx/commit/9e40d2fccdae5a0b0b0f8053083906113d301f93) Thanks [@rqbazan](https://github.com/rqbazan)! - Update run-run readme

## 0.4.0

### Minor Changes

- [#184](https://github.com/variableland/dx/pull/184) [`0cb97e8`](https://github.com/variableland/dx/commit/0cb97e84e568ffb85fb5c881d4a044e448de8f2c) Thanks [@rqbazan](https://github.com/rqbazan)! - Add `rr completion <shell>` for shell autocomplete (bash, zsh, fish), powered by [`usage`](https://usage.jdx.dev). The `rr` bin became a small bash dispatcher so the completion fast path skips Node startup entirely (~10ms cold).

- [#184](https://github.com/variableland/dx/pull/184) [`0cb97e8`](https://github.com/variableland/dx/commit/0cb97e84e568ffb85fb5c881d4a044e448de8f2c) Thanks [@rqbazan](https://github.com/rqbazan)! - Replace the implicit `rr <cmd1> <cmd2>` parallel syntax with an explicit `rr x <cmd1> <cmd2>` subcommand. The previous form was ambiguous — there was no way to tell whether the user wanted a subcommand with positional args or to fan out multiple subcommands. **Breaking:** `rr jsc tsc` no longer runs both concurrently; use `rr x jsc tsc` instead.

## 0.3.0

### Minor Changes

- [#182](https://github.com/variableland/dx/pull/182) [`0742fa4`](https://github.com/variableland/dx/commit/0742fa466d07a6df296fee9a575a9c92f7587c9c) Thanks [@rqbazan](https://github.com/rqbazan)! - feat(clibuddy): add `dirnameOf` / `filenameOf` helpers; simplify CLI bin entries

  - **New helpers in `@vlandoss/clibuddy`**: `dirnameOf(import.meta)` and `filenameOf(import.meta)`. They prefer the native `import.meta.dirname` / `import.meta.filename` (Node 20.11+) and fall back to `dirname(fileURLToPath(import.meta.url))` otherwise — so packages can keep `engines.node` at `>=20.0.0` without losing ergonomics.
  - **CLI bin entries simplified.** `bin.mjs` / `bin.ts` no longer compute `binDir` and pass it through a `main()` function — they just `import "./src/run.ts"` (or `./dist/run.mjs` for the published artifact). The new `src/run.ts` is now the executable entry: it resolves its own `BIN_DIR` via `dirnameOf(import.meta)` and starts the program. Affects `run-run`, `localproxy`, and `starter`. The `bin` field in each `package.json` is unchanged, so nothing changes for consumers running the CLIs.

### Patch Changes

- Updated dependencies [[`0742fa4`](https://github.com/variableland/dx/commit/0742fa466d07a6df296fee9a575a9c92f7587c9c)]:
  - @vlandoss/loggy@0.2.0
  - @vlandoss/clibuddy@0.3.0

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

### Patch Changes

- Updated dependencies [[`37eb596`](https://github.com/variableland/dx/commit/37eb596a3d50f30430f573ffe3c5a77a3aa88322)]:
  - @vlandoss/clibuddy@0.2.0

## 0.1.4

### Patch Changes

- [#175](https://github.com/variableland/dx/pull/175) [`3271dd1`](https://github.com/variableland/dx/commit/3271dd1144842749cd81a2eb9ba7f85f21d5467e) Thanks [@rqbazan](https://github.com/rqbazan)! - Fix `binDir` pointing to `dist/` in compiled CLIs

  When a CLI was published and executed via the compiled binary, `import.meta.url` resolved to the `dist/` folder, causing `binDir` to be `<root>/dist/` instead of the package root. This broke `localBaseBinPath` (which expects `<root>/node_modules/.bin`) and any other logic anchored to the package root.

  The fix introduces a thin `bin.mjs` wrapper at the package root that computes `binDir` from its own location (always the root) and imports the compiled logic from `dist/main.mjs`. The `tsdown-config` entry point is updated accordingly from `bin.ts` to `src/main.ts`.

## 0.1.3

### Patch Changes

- [#173](https://github.com/variableland/dx/pull/173) [`b2592a5`](https://github.com/variableland/dx/commit/b2592a518e62009dc2c2e8a64d2d3bff3dbfe07a) Thanks [@rqbazan](https://github.com/rqbazan)! - fix: add missing `tsdown` bin alias to package.json

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

## 0.0.21

### Patch Changes

- [#162](https://github.com/variableland/dx/pull/162) [`5c89c36`](https://github.com/variableland/dx/commit/5c89c362934af0722e6b7788eb08b0620a97eb32) Thanks [@rqbazan](https://github.com/rqbazan)! - Switch tsconfigs to `@vlandoss/config/ts/*` and move path aliases from tsconfig `paths` to the `package.json` `imports` field (`#src/*`, `#test/*`). Relative imports now use explicit `.ts` extensions.

- Updated dependencies [[`5c89c36`](https://github.com/variableland/dx/commit/5c89c362934af0722e6b7788eb08b0620a97eb32)]:
  - @vlandoss/clibuddy@0.0.10
  - @vlandoss/loggy@0.0.7

## 0.0.20

### Patch Changes

- [#157](https://github.com/variableland/dx/pull/157) [`ceb8c23`](https://github.com/variableland/dx/commit/ceb8c235a60aed14836a69e92c0798a426868c59) Thanks [@rqbazan](https://github.com/rqbazan)! - Add link to https://variable.land

## 0.0.19

### Patch Changes

- [#154](https://github.com/variableland/dx/pull/154) [`577f4c7`](https://github.com/variableland/dx/commit/577f4c7df0f2f749fad395ec454d287f666d47bd) Thanks [@rqbazan](https://github.com/rqbazan)! - Improve fatal error logging

- Updated dependencies [[`577f4c7`](https://github.com/variableland/dx/commit/577f4c7df0f2f749fad395ec454d287f666d47bd)]:
  - @vlandoss/clibuddy@0.0.9

## 0.0.18

### Patch Changes

- [#152](https://github.com/variableland/dx/pull/152) [`373b8fc`](https://github.com/variableland/dx/commit/373b8fc9ff4d4899111b2eafdd63f27c7415fb4f) Thanks [@rqbazan](https://github.com/rqbazan)! - Add tsdown to tools

## 0.0.17

### Patch Changes

- [#150](https://github.com/variableland/dx/pull/150) [`701b338`](https://github.com/variableland/dx/commit/701b3386c78a76d00c127972221d50e51b563fbe) Thanks [@rqbazan](https://github.com/rqbazan)! - Reorder commands

## 0.0.16

### Patch Changes

- [#149](https://github.com/variableland/dx/pull/149) [`6092149`](https://github.com/variableland/dx/commit/60921491f8d26159d450a5f41986fab220f40074) Thanks [@rqbazan](https://github.com/rqbazan)! - Add build:lib command and improve banner

- [#146](https://github.com/variableland/dx/pull/146) [`0ca5ac1`](https://github.com/variableland/dx/commit/0ca5ac1aba30399b4a3f7500e0156ab28bcf62d2) Thanks [@rqbazan](https://github.com/rqbazan)! - Upgrade deps

- Updated dependencies [[`6092149`](https://github.com/variableland/dx/commit/60921491f8d26159d450a5f41986fab220f40074), [`0ca5ac1`](https://github.com/variableland/dx/commit/0ca5ac1aba30399b4a3f7500e0156ab28bcf62d2)]:
  - @vlandoss/clibuddy@0.0.8

## 0.0.15

### Patch Changes

- [#144](https://github.com/variableland/dx/pull/144) [`c1517b2`](https://github.com/variableland/dx/commit/c1517b2e05d5a3bf7a067ec461c7d9e789f06a2f) Thanks [@rqbazan](https://github.com/rqbazan)! - Add test:types script

- [#145](https://github.com/variableland/dx/pull/145) [`66f3633`](https://github.com/variableland/dx/commit/66f3633cc908eaf9fa32e47062668f76c2872e02) Thanks [@rqbazan](https://github.com/rqbazan)! - Remove test old comment

- Updated dependencies [[`c1517b2`](https://github.com/variableland/dx/commit/c1517b2e05d5a3bf7a067ec461c7d9e789f06a2f), [`b31758e`](https://github.com/variableland/dx/commit/b31758e2d2e2e97a5f3b7b3fec73939e8003da73)]:
  - @vlandoss/clibuddy@0.0.7
  - @vlandoss/loggy@0.0.6

## 0.0.14

### Patch Changes

- [#140](https://github.com/variableland/dx/pull/140) [`97a4b51`](https://github.com/variableland/dx/commit/97a4b513617b39b49dbc5244c9c8d9011a721f6f) Thanks [@rqbazan](https://github.com/rqbazan)! - Add oxc support as future flag

- Updated dependencies [[`97a4b51`](https://github.com/variableland/dx/commit/97a4b513617b39b49dbc5244c9c8d9011a721f6f)]:
  - @vlandoss/clibuddy@0.0.6

## 0.0.13

### Patch Changes

- [#138](https://github.com/variableland/dx/pull/138) [`87c603a`](https://github.com/variableland/dx/commit/87c603aadca4681370e1387d280522cf82426dd9) Thanks [@rqbazan](https://github.com/rqbazan)! - Add concurrency to tsc

## 0.0.12

### Patch Changes

- [#136](https://github.com/variableland/dx/pull/136) [`ab88a87`](https://github.com/variableland/dx/commit/ab88a8781750f49ea394c7da00bc014ce1aba2a1) Thanks [@rqbazan](https://github.com/rqbazan)! - Add `pkgs` command

## 0.0.11

### Patch Changes

- Updated dependencies [[`462d5b4`](https://github.com/variableland/dx/commit/462d5b493bb1adaa2ed428d2b428fcaaa3001575)]:
  - @vlandoss/loggy@0.0.5

## 0.0.10

### Patch Changes

- [#117](https://github.com/variableland/dx/pull/117) [`3c05da4`](https://github.com/variableland/dx/commit/3c05da44e93bc66433cd222e1f1466a7e2048cec) Thanks [@rqbazan](https://github.com/rqbazan)! - Update readme

- Updated dependencies [[`3c05da4`](https://github.com/variableland/dx/commit/3c05da44e93bc66433cd222e1f1466a7e2048cec), [`3c05da4`](https://github.com/variableland/dx/commit/3c05da44e93bc66433cd222e1f1466a7e2048cec)]:
  - @vlandoss/clibuddy@0.0.5
  - @vlandoss/loggy@0.0.4

## 0.0.9

### Patch Changes

- [#112](https://github.com/variableland/dx/pull/112) [`838e75a`](https://github.com/variableland/dx/commit/838e75a15bcb58ff3d5d53e8e2ec803d12e1c98c) Thanks [@rqbazan](https://github.com/rqbazan)! - Fix parse args & stop using `--unsafe` flag

## 0.0.8

### Patch Changes

- [#110](https://github.com/variableland/dx/pull/110) [`4d9c358`](https://github.com/variableland/dx/commit/4d9c35853dc56277554f211d06add78b2400570e) Thanks [@rqbazan](https://github.com/rqbazan)! - Allow run multiple commands

## 0.0.7

### Patch Changes

- [#109](https://github.com/variableland/dx/pull/109) [`d633196`](https://github.com/variableland/dx/commit/d63319692b93fcfd45acd0e05ccdb1f31ec928d6) Thanks [@rqbazan](https://github.com/rqbazan)! - Fix biome lsp

- [#107](https://github.com/variableland/dx/pull/107) [`dcb6ee2`](https://github.com/variableland/dx/commit/dcb6ee20283ebaf80aa1f60b6fec1d3abc05422b) Thanks [@rqbazan](https://github.com/rqbazan)! - Add mark for tools cmd

## 0.0.6

### Patch Changes

- [#105](https://github.com/variableland/dx/pull/105) [`a5ef3f4`](https://github.com/variableland/dx/commit/a5ef3f4f6ee676a61aa97f13044711a8cba2d9a0) Thanks [@rqbazan](https://github.com/rqbazan)! - Refactor order and commands aliases

- [#105](https://github.com/variableland/dx/pull/105) [`a5ef3f4`](https://github.com/variableland/dx/commit/a5ef3f4f6ee676a61aa97f13044711a8cba2d9a0) Thanks [@rqbazan](https://github.com/rqbazan)! - Remove info:pkg command

- [#103](https://github.com/variableland/dx/pull/103) [`9557335`](https://github.com/variableland/dx/commit/95573357150d5de9c756b250748686e49ae5ced3) Thanks [@rqbazan](https://github.com/rqbazan)! - Fix biome tool script

- Updated dependencies [[`9557335`](https://github.com/variableland/dx/commit/95573357150d5de9c756b250748686e49ae5ced3)]:
  - @vlandoss/clibuddy@0.0.4

## 0.0.5

### Patch Changes

- [#101](https://github.com/variableland/dx/pull/101) [`7443fc2`](https://github.com/variableland/dx/commit/7443fc2019bd55b466c01df468daf5776525f8d4) Thanks [@rqbazan](https://github.com/rqbazan)! - Add check command name

## 0.0.4

### Patch Changes

- [#99](https://github.com/variableland/dx/pull/99) [`faa1b3e`](https://github.com/variableland/dx/commit/faa1b3e9b615d5102099fd43db0fc657caa19d01) Thanks [@rqbazan](https://github.com/rqbazan)! - Expose internal tools as the following command: `rr tools biome`

## 0.0.3

### Patch Changes

- [#97](https://github.com/variableland/dx/pull/97) [`813cfcb`](https://github.com/variableland/dx/commit/813cfcb88e9f273b7f75cf2e2275904c25810130) Thanks [@rqbazan](https://github.com/rqbazan)! - Move to Biome v2

- Updated dependencies [[`813cfcb`](https://github.com/variableland/dx/commit/813cfcb88e9f273b7f75cf2e2275904c25810130)]:
  - @vlandoss/clibuddy@0.0.3
  - @vlandoss/loggy@0.0.3

## 0.0.2

### Patch Changes

- [#95](https://github.com/variableland/dx/pull/95) [`0c198e4`](https://github.com/variableland/dx/commit/0c198e46f159edfad14f6b2337e41e05f97172bb) Thanks [@rqbazan](https://github.com/rqbazan)! - Add multi typecheck

- [#96](https://github.com/variableland/dx/pull/96) [`dc003be`](https://github.com/variableland/dx/commit/dc003bee8bfca1a50850b09114617ed030fcc6d7) Thanks [@rqbazan](https://github.com/rqbazan)! - Fix error display handling

- [#96](https://github.com/variableland/dx/pull/96) [`dc003be`](https://github.com/variableland/dx/commit/dc003bee8bfca1a50850b09114617ed030fcc6d7) Thanks [@rqbazan](https://github.com/rqbazan)! - Add dry-run to clean command

- Updated dependencies [[`0c198e4`](https://github.com/variableland/dx/commit/0c198e46f159edfad14f6b2337e41e05f97172bb), [`dc003be`](https://github.com/variableland/dx/commit/dc003bee8bfca1a50850b09114617ed030fcc6d7)]:
  - @vlandoss/clibuddy@0.0.2
  - @vlandoss/loggy@0.0.2

## 0.0.1

### Patch Changes

- [#85](https://github.com/variableland/dx/pull/85) [`bdae9bf`](https://github.com/variableland/dx/commit/bdae9bf09a9a967ced98dd42b373c725c2c4f2b3) Thanks [@rqbazan](https://github.com/rqbazan)! - Move to @vlandoss organization

- Updated dependencies [[`bdae9bf`](https://github.com/variableland/dx/commit/bdae9bf09a9a967ced98dd42b373c725c2c4f2b3)]:
  - @vlandoss/clibuddy@0.0.1
  - @vlandoss/loggy@0.0.1
