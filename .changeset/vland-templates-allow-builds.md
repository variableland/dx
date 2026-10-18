---
"@variablelab/vland": patch
---

Projects from `vland init` let lefthook's install script run through pnpm's `allowBuilds` setting, which pnpm prefers since 10.26, instead of `onlyBuiltDependencies`, which pnpm 11 removed. A generated project that moved to pnpm 11 would have had its `onlyBuiltDependencies` ignored, so `pnpm install` failed with `ERR_PNPM_IGNORED_BUILDS` and the git hooks never got installed. The monorepo no longer lists `@biomejs/biome`, which has had no install script since Biome 2.
