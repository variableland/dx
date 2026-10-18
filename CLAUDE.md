# CLAUDE.md — `withvariablelab/dx`

You are an agent maintaining this monorepo. The microkernel refactor that produced `@rrlab/*` is **done** (see `decisions/` for the architectural choices that shape the codebase). Your work going forward is features, fixes, and refactors — not phased migrations.

## Layout

The folders and what each holds: [docs/development.md](docs/development.md#layout).

This repo hosts **two npm orgs** intentionally: `@variablelab/*` (Variableland's utilities + the `vland` CLI) and `@rrlab/*` (the `rr` CLI product). Cross-pollination is fine — clibuddy and loggy are shared utilities both stacks depend on.

Stack: pnpm workspaces, Turborepo, Changesets, `tsdown` for builds, vitest for tests, Biome for lint/format, TypeScript strict.

## Build & verify

Setup, the Node floor, the everyday commands and CI are in [docs/development.md](docs/development.md).

`pnpm rr check` must be green before any commit. If `pnpm rr lint --fix` or `pnpm rr format --fix` applies safe fixes, run them and re-verify.

## Working principles (non-negotiable)

1. **Strict test discipline.** Every feature and fix lands with the tests [docs/contributing.md](docs/contributing.md#pull-requests) asks for, in the folders [docs/development.md](docs/development.md#tasks) names.
   - Refactors with no behaviour change: existing tests must still pass; remove tests only when they were asserting implementation details that no longer exist.
   - If you can't write a meaningful test, the design is probably wrong — stop and report.

2. **Aggressive cleanup.** When you touch a file for any reason, leave it cleaner than you found it:
   - Unused imports, dead constants, dangling comments referencing removed code → drop them.
   - Anonymous `TODO` with no name/date → either implement it now or remove it.
   - Pattern drift (e.g., one file uses `for...of`, the neighbour uses `.forEach()`) → align with the closer neighbour's pattern.
   - Don't go on cleanup spelunking expeditions for files unrelated to your task. Stay in the blast radius of what you're already touching.

3. **Atomic commits** as [Conventional Commits](docs/contributing.md#pull-requests), such as `feat(cli): add PluginRegistry` or `fix(ts-plugin): handle tsc cwd on monorepos`. A change to what a package ships to npm needs a changeset (`pnpm changeset`). See [docs/contributing.md](docs/contributing.md#changesets) for the bump.

4. **Never publish to npm.** No `pnpm publish`, no `changeset publish`, no `npm publish`. The human handles publication.

5. **Don't invent design.** If you face a real architectural ambiguity, invoke the `arch-critic` subagent and record the outcome in `decisions/NNN-<slug>.md` (format documented in `decisions/README.md`). Bug fixes, mechanical changes, and decisions already in `decisions/` don't need arch-critic.

## Coding conventions

- **Imports**: `#src/...` inside `@rrlab/cli` and `@variablelab/vland`, which map it in `imports`. Relative paths in the other packages. Package names (`@rrlab/...`, `@variablelab/...`) across packages.
- **Exports**: named exports preferred; default exports only when the consumer needs them (e.g. plugin factories).
- **Services**: classes ending in `Service`, dependencies via constructor. Only `logger` is a singleton.
- **Commands and actions** (in `@rrlab/cli`): see "Commands are thin wrappers over actions" in [run-run/cli/CLAUDE.md](run-run/cli/CLAUDE.md#commands-are-thin-wrappers-over-actions) and [decisions/015](decisions/015-command-action-service-layering.md).
- **Errors**: domain errors are classes — kernel-internal ones in `src/errors/` (e.g. `MissingPluginError`), SDK ones in `src/lib/plugin/errors.ts` (`MultipleProvidersError`). Each builds its user-facing message from structured constructor args. Do NOT set `this.name` — keep the plain `Error:` prefix, so output stays clean.
- **Tests**: vitest, in the folders [docs/development.md](docs/development.md#tasks) names. Inline snapshots for CLI output assertions.
- **No `any`.** If TypeScript pushes you there, stop and report — it usually means a design problem.
- **Match neighbours.** Before introducing a new pattern, scan 2-3 nearby files. If they use a different style, follow theirs.

## What NOT to touch without explicit ask

- `.github/workflows/*` — CI is managed separately.
- `pnpm-workspace.yaml` structurally (adding a new workspace dir is fine; restructuring is not).
- `vland/templates/*` — these are scaffolds the `vland init` flow copies into new projects. Don't refactor them while working on something else.

## Going deeper

- **[`docs/contributing.md`](docs/contributing.md)** — branches, commits, tests, changesets and releases.
- **`run-run/CLAUDE.md`** — orientation for working on the `@rrlab/*` ecosystem (plugin contract, conventions for adding/modifying plugins).
- **`run-run/cli/CLAUDE.md`** — kernel internals (commander patterns, context lifecycle, edit-json DSL, KDL spec emission).
- **`decisions/`** — one file per architectural decision. Read before designing anything that touches plugin lifecycle, dependency model, or templating. Format / template in `decisions/README.md`.

## Plugin contract is kernel-internal

The plugin API (`@rrlab/cli/plugin`: `Plugin`, `PluginServices`, `InstallResult`, etc.) is treated as **internal to `@rrlab/*`**, not as a public API for third-party plugin authors. The official plugins (listed in `run-run/CLAUDE.md`) are the only consumers we commit to. This means:

- Breaking changes to the contract are fine as long as every official plugin compiles and tests pass.
- Don't write contract-level documentation for hypothetical third-party authors.
- Don't preserve backwards-compat shims for the contract.
- If you need to evolve the contract, propagate the change across every official plugin in the same commit.
