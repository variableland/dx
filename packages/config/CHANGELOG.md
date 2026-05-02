# @vlandoss/config

## 0.2.0

### Minor Changes

- [#170](https://github.com/variableland/dx/pull/170) [`72d7305`](https://github.com/variableland/dx/commit/72d73052778ebe9d77aebc4d942eee08fe1b56b3) Thanks [@rqbazan](https://github.com/rqbazan)! - Upgrade TypeScript to 6.0.3 and enforce explicit `.ts` import extensions

  - Upgrade TypeScript from 5.9.3 to 6.0.3 across the monorepo
  - Add `useImportExtensions: "error"` biome rule to enforce explicit `.ts` extensions in all imports
  - Add `@types/node` as optional peer dependency in `@vlandoss/config`
  - Add `types: ["node"]` to the `tsconfig.no-dom` base config
  - Update all import paths in `localproxy` and `starter` to use explicit `.ts` extensions
  - Remove root-level `tsconfig.json` (paths now handled per-package)

## 0.1.1

### Patch Changes

- [#165](https://github.com/variableland/dx/pull/165) [`33659b4`](https://github.com/variableland/dx/commit/33659b4f2666aee939ed637b0dd6366854e22a96) Thanks [@rqbazan](https://github.com/rqbazan)! - Add Node.js compatibility via `publishConfig` and compiled output

  All publishable packages now ship compiled `dist/` output (via tsdown) and use `publishConfig.exports`/`publishConfig.bin` to override the package fields at publish time. This means consumers using Node.js no longer need Bun installed — the published packages work with `node >= 20` out of the box.

  A new shared package `@vlandoss/tsdown-config` provides reusable build presets (`defineBinConfig`, `defineLibConfig`) and the `nodeShebangPlugin` that rewrites the `#!/usr/bin/env bun` shebang to `#!/usr/bin/env node` in compiled bin files.

## 0.1.0

### Minor Changes

- [#158](https://github.com/variableland/dx/pull/158) [`e7d6f17`](https://github.com/variableland/dx/commit/e7d6f17b3a5bfa56a6c2ed1aab7679bda876456d) Thanks [@rqbazan](https://github.com/rqbazan)! - Introduce `@vlandoss/config`, a shared configuration package for `@variableland` tooling. Ships initial presets for Biome (`@vlandoss/config/biome`) and TypeScript (`@vlandoss/config/ts/*`) behind subpath exports, with room to add more (e.g. lefthook) over time. Supersedes `@vlandoss/biome-config`, which is now soft-deprecated but still published. `@biomejs/biome` is declared as an optional peer dependency so consumers only install it when using the Biome preset.
