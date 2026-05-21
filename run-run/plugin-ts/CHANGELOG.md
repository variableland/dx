# @rrlab/plugin-ts

## 0.1.0

### Minor Changes

- [#220](https://github.com/variableland/dx/pull/220) [`911965a`](https://github.com/variableland/dx/commit/911965a7b458b6de7197d8203a54e819786b396c) Thanks [@rqbazan](https://github.com/rqbazan)! - Inaugural release of the `@rrlab/*` ecosystem: a microkernel `rr` CLI plus four official, opt-in plugins (one per tool) and three shared config presets. Replaces the private `@vlandoss/run-run@0.x`. Architectural rationale lives in `decisions/001-005-*.md`.

  ## Kernel — `@rrlab/cli`

  `rr` is a thin command router. Built-ins: `lint`, `format`, `jsc`, `tsc`, `pack`, `check`, `doctor`, `clean`, `config`, `completion`, plus the `plugins` lifecycle (`add | remove | list`). Each plugin-backed command consults a `PluginRegistry` populated from `run-run.config.{ts,mts}`; a command with no provider exits with an actionable `rr plugins add <alias>` suggestion. `rr check` dispatches in-process via commander (no re-spawned `rr`). `rr jsc` is synthesised from `lint` + `format` when no plugin provides it directly.

  Public surface:

  - **`@rrlab/cli/config`** — `defineConfig` for user configs.
  - **`@rrlab/cli/plugin`** — the plugin contract: `Plugin`, `PluginContext`, `PluginCapabilities`, `PluginRegistry`, verb-matches-type capability shapes (`Linter.lint`, `Formatter.format`, `StaticChecker.check`, `TypeChecker.check`, `Packer.pack`), `Doctor`, the `install`/`uninstall` planner types (`InstallContext`, `FileOp`, `JsonEdit`), and `ToolService` as a base for tool wrappers. Treated as **internal to `@rrlab/*`** — the four official plugins are the only consumers we commit to.

  ## Plugins

  Four official plugins, each declaring its tool as a `peerDependency` ([D-001](../decisions/001-all-peer-dependencies.md)) and shipping without `bin` shims ([D-002](../decisions/002-no-bin-shims.md)). Each plugin owns the version ranges of its tool in `src/tool-versions.ts` (`TOOL_VERSIONS = { <tool>: { install, peer } }`) with a per-plugin coherence test that reads the plugin's `package.json` and asserts the peer range matches — the kernel stays tool-agnostic.

  | Plugin                     | Capabilities                      | Notes                                                                  |
  | -------------------------- | --------------------------------- | ---------------------------------------------------------------------- |
  | **`@rrlab/plugin-biome`**  | `lint`, `format`, `jsc`           | One `BiomeService` backs all three.                                    |
  | **`@rrlab/plugin-oxc`**    | `lint` (oxlint), `format` (oxfmt) | `rr jsc` is composed by the kernel.                                    |
  | **`@rrlab/plugin-ts`**     | `tsc`                             | Workspace-aware via the optional `{ cwd }` arg on `TypeChecker.check`. |
  | **`@rrlab/plugin-tsdown`** | `pack`                            | —                                                                      |

  ## Lifecycle: `rr plugins add | remove`

  `rr plugins add <alias>` installs the plugin, edits `run-run.config.{ts,mts}` via `ConfigAstService` (magicast-based, preserves comments + unrelated keys), then runs the plugin's `install(ctx)` hook. The hook returns a declarative plan — `{ devDependencies, files: FileOp[] }` — that the kernel applies. `--yes` skips prompts; `--dry-run` prints the plan and exits. `rr plugins remove` is symmetric.

  `FileOp` ([D-004](../decisions/004-templating-and-edit-json-dsl.md)) is four ops:

  - **`create`** — full content as a string, no template engine.
  - **`edit-json`** — JSON Pointer paths + an idempotent op DSL (`set` / `unset` / `include` / `exclude`, with `set` modes `replace` / `if-missing`) via `comment-json`.
  - **`edit-text`** — escape hatch for TS modules (the plugin owns the parse, typically via `magicast`).
  - **`delete`** — idempotent.

  Plugin install/uninstall hooks are pure planners; the kernel does the IO. Package manager detection uses `nypm`: when `appPkg` is a monorepo root, `pnpm` gets `--workspace-root` and yarn-classic gets `-W` automatically.

  `rr doctor` walks every configured plugin and runs each `Doctor` once, dedup'd by service identity.

  ## Shared config presets

  - **`@rrlab/ts-config`** — five tsconfig presets `react | dom/app | dom/lib | no-dom/app | no-dom/lib`. `plugin-ts` scaffolds `tsconfig.json` as a one-line `{ "extends": "@rrlab/ts-config/<preset>" }` wrapper.
  - **`@rrlab/biome-config`** — shared biome preset; `plugin-biome` scaffolds `biome.json` to extend it.
  - **`@rrlab/tsdown-config`** — `defineLibConfig` / `defineBinConfig` helpers. `plugin-tsdown` scaffolds `tsdown.config.ts` as a thin call site ([D-005](../decisions/005-plugin-tsdown-scaffolding.md)).

  When the artifact already exists, `install()` patches in place: JSON files via `edit-json` (comment-preserving), `tsdown.config.ts` via `edit-text` + `magicast` (refuses to mutate an unrecognised default export — better to bail than guess). `uninstall()` is symmetric.

  ## Dogfood

  The monorepo runs on the new model. Root `run-run.config.mts` declares `plugins: [biome(), ts(), tsdown()]`; every workspace package is built via `@rrlab/tsdown-config` helpers.

### Patch Changes

- Updated dependencies [[`911965a`](https://github.com/variableland/dx/commit/911965a7b458b6de7197d8203a54e819786b396c), [`911965a`](https://github.com/variableland/dx/commit/911965a7b458b6de7197d8203a54e819786b396c)]:
  - @rrlab/cli@0.0.1
  - @vlandoss/clibuddy@0.6.1
