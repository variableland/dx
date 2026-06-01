# 003: Wire plugins through `ctx.registry` and drop `future.oxc` outright

- **Date**: 2026-05-19
- **Status**: Applied
- **Files affected**: `run-run/cli/src/services/ctx.ts`, `run-run/cli/src/services/config.ts`, `run-run/cli/src/types/config.ts`, all command files under `run-run/cli/src/program/commands/`, `run-run/cli/package.json`, `run-run.config.mts` (root), `package.json` (root), `run-run/cli/test/helpers.ts`.

## Context

With decisions 001 (all-peer) and 002 (no shims) settled, the next question was whether to keep two parallel code paths inside the kernel — the legacy `if (config.future?.oxc)` branching plus the new registry consumption — across the plugin extraction, or to collapse them in one move.

An earlier draft kept the kernel's `*Service` files (`biome.ts`, `oxlint.ts`, etc.) imported via legacy branches while the plugin packages also carried their own copies. The plan was to delete the kernel versions in a later phase. That tension disappears once the kernel consumes capabilities through `ctx.registry` instead of importing services directly: the indirection through the registry means the kernel no longer needs a workspace dep on any plugin package (which had been creating a cyclic workspace graph turbo rejected).

There was also the user-driven requirement to dogfood the plugins in this monorepo's own `run-run.config.mts` and to delete `future.oxc` entirely — no deprecation window.

## Options considered

- **A**: Keep two paths in parallel. Plugins exist as artefacts, but the kernel keeps its `*Service` files and the `if (config.future?.oxc)` branches. Wiring + `future.oxc` deprecation happens in a follow-up commit chain.
- **B**: Wire the registry immediately. Drop `future.oxc` outright. Delete the kernel's `*Service` files. Dogfood this monorepo's config on the new path in the same wave.

## Decision: Option B

- Dogfood requires it. The whole monorepo using `@vlandoss/run-run` today has to switch to `@rrlab/cli` + plugins as part of this work; deferring would leave the dogfood broken across multiple commits.
- The cyclic-dep problem that a parallel kernel-side service implementation worked around vanishes once the kernel goes through the registry instead of importing services directly. Option B is strictly cleaner architecturally.
- `future.oxc` shipped only under `@vlandoss/run-run` (never under `@rrlab/cli`). The inaugural `@rrlab/cli` release has no installed base to bridge — there's nothing to deprecate.
- Independent slices (`rr plugins add | remove | list`, `jsc` composition, etc.) can land in follow-up commits without being blocked by the wiring.

## Alternatives rejected

- Option A: would require maintaining two parallel code paths inside the same commit chain, plus a stop-the-world migration commit later. More moving parts, more risk of regression, slower path to working dogfood.

## What landed in this commit

- `createContext` builds a `PluginRegistry`, iterates `config.plugins`, calls each plugin's `setup({ shell, logger, appPkg, binPkg, cwd })`, and registers the returned capabilities.
- `lint`, `format`, `jsc`, `tsc`, `pack` commands resolve their capability from `ctx.registry` (the resolver method has been renamed since; today it's `getService` / `getServiceOrThrow`). They register cleanly even when no plugin provides the capability (so `--help` works); the action throws an actionable error referencing `rr plugins add <alias>` when invoked.
- `tsc`'s workspace-iteration loop calls `tsc.check({ cwd: project.rootDir })`. `TypeChecker.check` gained an optional `{ cwd?: string }` argument; `ToolService.exec` learned an optional `{ cwd?: string }` to forward to `shell.at(cwd)`.
- Kernel `src/services/{biome,oxlint,oxfmt,tsdown,tsc}.ts` deleted — each plugin owns its service.
- Heavy deps removed from `@rrlab/cli/package.json` (`@biomejs/biome`, `oxfmt`, `oxlint`, `oxlint-tsgolint`, `tsdown`, `typescript`). `tsdown` re-added as a kernel devDep for the kernel's own build only.
- `UserConfig.future.oxc` removed. `UserConfig` is now `{ plugins?: Plugin[] }`.
- Root `package.json` devDeps add `@rrlab/plugin-{biome,ts,tsdown}` so this monorepo's `run-run.config.mts` can import them.
- `run-run.config.mts` switched to `defineConfig({ plugins: [biome(), ts(), tsdown()] })`.
- Test fixtures symlink the workspace root's `node_modules` (so the fixture's generated `run-run.config.mts` can resolve `@rrlab/plugin-*` packages), and a `fixtures.config(plugins[])` helper emits the right config string per test.
