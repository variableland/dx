# CLAUDE.md — `@rrlab/cli` (the kernel)

Internals of the kernel. Read **after** the repo-root `CLAUDE.md` and `run-run/CLAUDE.md`. Both establish the working principles and the plugin shape this file assumes you already know.

## Mental model

```
bin                                    (bash dispatcher — entry point)
 └─ src/run.ts                         (boots the program)
     └─ src/program/index.ts           (createProgram — assembles commander tree)
         ├─ createContext()            (src/services/ctx.ts — wires shell, logger, config, registry)
         │   ├─ ConfigService.load()   (src/services/config.ts — lilconfig)
         │   └─ for each config.plugins: plugin.setup(ctx) → registry.register(...)
         │
         └─ commands                   (src/program/commands/*.ts)
             ├─ lint / format / jsc / tsc / pack
             │   └─ ctx.registry.get(kind)
             ├─ check                  (sibling-dispatch via this.parent)
             ├─ doctor                 (collects distinct providers, runs in parallel)
             ├─ plugins {list, add, remove}
             ├─ clean / config / completion
             └─ --usage                (KDL spec emission)
```

## Commander patterns we rely on

### `this` is the running Command inside actions

Commander invokes actions as `fn.apply(this, [...args, options, this])`. Two things matter:

- Inside a non-arrow `function` action, `this` is the Command. `this.parent` is the parent program.
- Inside an arrow function action, `this` is the enclosing module scope. Avoid arrows when you need the binding.

`rr check` uses this to dispatch to siblings: it reads `this.parent.commands`, finds `jsc` and `tsc`, calls each's `.parseAsync([], { from: "user" })`. This is how the kernel reuses commander's command tree as the action registry without maintaining a parallel one (an earlier draft had `registerCommand` / `commandHandler` on `PluginRegistry`; deleted).

### `--usage` is an event listener, not an action

`createCommand("rr").addOption(new Option("--usage", "...")).on("option:usage", function (this: Command) { generateToStdout(this); process.exit(0); })`. Same `this` binding rule — non-arrow function gets the root program as `this`.

The `bin` script exports `RR_USAGE_MODE=1` (alongside `NO_COLOR=1`) when it sees `--usage` in argv. Read at `src/program/ui.ts` to strip per-environment annotations from command summaries (`(biome)` → `""` and `(not configured)` → `""`). The KDL spec must be stable across machines; the per-project plugin set is not.

## Context lifecycle

`createContext(binDir)` runs once per `rr <cmd>` invocation. It builds a fresh `Context`:

```ts
type Context = {
  binPkg: Pkg;          // @rrlab/cli's own package.json
  appPkg: Pkg;          // the host project's package.json (resolved from cwd)
  shell: ShellService;
  config: ExportedConfig;
  registry: PluginRegistry;
};
```

The registry is populated immediately: for each `plugin` in `config.plugins ?? []`, the kernel calls `plugin.setup(pluginContext)` and registers the returned capabilities. If `apiVersion` doesn't match `1`, `createContext` throws.

Commands that don't need plugin capabilities (`clean`, `config`, `completion`) still get the full context; they just ignore `registry`. Don't try to lazy-load the registry; the cost is small (plugins' `setup()` is meant to be cheap) and the simplicity is worth more than the savings.

## PluginRegistry

`src/plugin/registry.ts`. Three things it exposes:

- `register(plugin, capabilities)` — called by `createContext`.
- `get<K>(kind: K)` — returns the impl when exactly one plugin provides it; throws on N>1 (with actionable error); undefined on N=0.
- `providersOf(kind)` — returns all providers (used by `rr doctor` to enumerate distinct doctor implementations).

Multi-provider error message format is load-bearing for the "ambiguity → user fixes config" UX. Don't simplify it; the test in `src/plugin/__tests__/registry.test.ts` asserts the names appear.

## Commands

Every command file follows the same shape:

```ts
export function create<Name>Command(ctx: Context) {
  const provider = ctx.registry.get("<kind>");  // for plugin-backed commands

  const cmd = createCommand("<name>")
    .summary(`<summary>${pluginAnnotation(provider)}`)
    .description("<description>")
    .option(...);

  if (provider) cmd.addCommand(createDoctorSubcommand(provider));

  cmd.action(async function action(options) {
    if (!provider) throw missingPluginError("<kind>");
    await provider.<verb>(options);
  });

  return cmd;
}
```

`pluginAnnotation(provider)` returns `(<ui>)` when the plugin is loaded, `(not configured)` when not, and `""` when `RR_USAGE_MODE` is set.

`missingPluginError` lives in `src/program/missing-plugin.ts` and emits the `rr plugins add <alias>` suggestion the user needs.

`rr check` is the exception: instead of consulting the registry directly, it grabs `this.parent` and dispatches to `jsc` + `tsc` siblings via `parseAsync([], { from: "user" })`. This is in-process; saves the ~80ms Node startup of a re-spawned `rr`.

## File ops engine (`applyFileOp`)

`src/program/commands/plugins.ts`. Four `FileOp` kinds:

- `create` — writes content; respects `overwrite` flag.
- `edit-json` — reads, applies `JsonEdit[]` via `applyJsonEdits` (in `src/services/json-edit.ts`), writes back. Uses `comment-json` so user comments + key positions survive.
- `edit-text` — reads, calls `op.edit(source)`, writes back. Escape hatch for TS modules etc.
- `delete` — `fs.unlink`. Idempotent (skips if file doesn't exist).

`applyJsonEdits` implements the 4 ops (`set`, `unset`, `include`, `exclude`) over JSON-Pointer paths. Tested in `src/services/__tests__/json-edit.test.ts`. The dedup in `include`/`exclude` uses `JSON.stringify` deep-equality — fine for the value shapes we use today (strings, plain objects).

## `rr plugins` lifecycle (add / remove)

Both commands resolve the alias via `OFFICIAL_PLUGINS` in `src/services/plugins-registry.ts`. Only official aliases are accepted; unknown aliases throw with the list.

**add** flow:
1. Install the plugin package via `nypm.addDependency` (best-effort rollback via `removeDependency` if a later step throws).
2. Dynamic import the plugin, call `install(ctx)`.
3. Apply returned `devDependencies` via `nypm` (batched).
4. Apply returned `files` via `applyFileOp`.
5. Edit `run-run.config.{ts,mts}` via `ConfigAstService` (magicast wrapper) to add the plugin entry.

**remove** flow:
1. If installed, dynamic import and call `uninstall(ctx)`.
2. Aggregate the plan: config entry removal + file ops + deps to remove (including the plugin package itself).
3. Show the plan and a single confirmation (skipped with `--yes`).
4. Apply file ops, then edit config, then `removeDependency` per dep.

Both support `--dry-run` (print plan, no side effects) and `--yes` (skip prompts).

## `ConfigAstService`

`src/services/config-ast.ts`. Wraps `magicast` to add/remove plugin entries from `run-run.config.{ts,mts}`. Operates on the AST so user comments + formatting + non-plugin keys are preserved.

`magicast` proxies for arrays are not `Array.isArray()` (they're Proxy objects). Guard on `.length` instead. There's a test for this in `src/services/__tests__/config-ast.test.ts` that exists specifically to lock the lesson down — touching `#pluginsArray` requires you to keep the guard.

## Tests

- `src/**/__tests__/*.test.ts` — unit tests (no fs, no spawn).
- `test/integration/*.test.ts` — spawn `rr` against a real fixture in `os.tmpdir()`. The fixture symlinks the workspace `node_modules` so the fixture's `run-run.config.mts` can import `@rrlab/*-plugin`.

When the integration test asserts on the doctor or output of a plugin-backed command, configure the fixture's `run-run.config.mts` with `fixtures.config([...aliases])`. See `test/integration/check.test.ts` for the canonical multi-plugin shape (biome + ts).

## What to keep an eye on

- `dist/cli.usage.kdl` is regenerated by the `build:kdl` script. If a command's summary, description, or option set changes, `pnpm --filter @rrlab/cli build` should be run and the KDL diff inspected before committing.
- `CLI.md` is generated from the KDL via `usage generate markdown` in CI (after a release tag). Locally, regenerate via `usage generate markdown --file dist/cli.usage.kdl --out-file CLI.md --replace-pre-with-code-fences` if you want to see the diff in dev.
- `bin` is a bash dispatcher with a fast path for `rr completion <shell>` (skips Node startup). Keep it minimal — anything new goes in `src/`, not `bin`.

## Anti-patterns we already paid for

- **Don't add a parallel action store on `PluginRegistry`.** A previous commit added `registerCommand` / `commandHandler` to feed `rr x` (a parallel-dispatch command). `rr x` was removed; the parallel store with it. Commander already holds the action tree — use `program.commands.find(...)` if you need to dispatch by name.
- **Don't use `JSON.parse(text) → mutate → JSON.stringify`** for editing user-owned files. That destroys comments + trailing commas + indentation. Use `edit-json` with `JsonEdit[]` and let `applyJsonEdits` route through `comment-json`.
- **Don't introduce `bin: { biome, … }` shims** in the kernel or in plugins. The peer-installed tool provides `node_modules/.bin/<bin>` natively. See `decisions/002-no-bin-shims.md`.
- **Don't put `tools` capability back.** It only made sense before the all-peer model (see `decisions/001-all-peer-dependencies.md`). The kernel surface is smaller without it.
- **Don't centralise tool versions (or any tool-specific concept) in the kernel.** An earlier attempt added a `TOOL_VERSIONS` constant in `@rrlab/cli/services/tool-versions.ts` and re-exported it via `@rrlab/cli/plugin`, so every plugin imported its version pins from the kernel. Wrong layer — it made the kernel know every tool name, coupled the kernel's release cycle to tool bumps, and inverted the ownership. Each plugin owns its tool's version pins in `plugin-*/src/tool-versions.ts`; the coherence test (peer range vs. `package.json`) lives in the plugin too. See `run-run/CLAUDE.md` → "The kernel is tool-agnostic" for the rule and the test to apply before adding anything to `@rrlab/cli`.
