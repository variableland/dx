# @vlandoss/config

## 0.1.0

### Minor Changes

- [#158](https://github.com/variableland/dx/pull/158) [`e7d6f17`](https://github.com/variableland/dx/commit/e7d6f17b3a5bfa56a6c2ed1aab7679bda876456d) Thanks [@rqbazan](https://github.com/rqbazan)! - Introduce `@vlandoss/config`, a shared configuration package for `@variableland` tooling. Ships initial presets for Biome (`@vlandoss/config/biome`) and TypeScript (`@vlandoss/config/ts/*`) behind subpath exports, with room to add more (e.g. lefthook) over time. Supersedes `@vlandoss/biome-config`, which is now soft-deprecated but still published. `@biomejs/biome` is declared as an optional peer dependency so consumers only install it when using the Biome preset.
