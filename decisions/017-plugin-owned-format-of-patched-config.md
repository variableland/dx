# 017: Who makes a config file that `rr plugins add` patches pass the project's formatter: the edit engine, the owning plugin, or the kernel?

- **Date**: 2026-10-18
- **Status**: Applied
- **Files affected**: `run-run/biome-plugin/src/index.ts`, `run-run/biome-plugin/src/__tests__/install.test.ts` (new), `run-run/biome-plugin/README.md`, `run-run/cli/src/services/json-edit.ts`, `run-run/cli/src/services/__tests__/json-edit.test.ts`, `run-run/cli/src/services/__tests__/file-ops.test.ts`, `run-run/cli/test/integration/plugins.test.ts`, `run-run/cli/CLAUDE.md`, `run-run/CLAUDE.md`, `decisions/004-templating-and-edit-json-dsl.md` (amended)

## Context

`applyJsonEdits` (`run-run/cli/src/services/json-edit.ts`) ends every edit with `cjson.stringify(root, null, 2)`. The output always has a 2-space indent and every array item on its own line, whatever the source looked like. So on a project that already has a `biome.json`, biome-plugin's patch (`include /extends`) leaves a file that Biome's own formatter rejects: `formatter.expand: "auto"` keeps short arrays on one line, and the indent comes from the merged config. `rr jsc`, `rr format` and `rr check` then fail right after `rr plugins add biome`. A patch that changes nothing (`rr plugins add biome --force`) also rewrote the file and reported "Edited". ADR 004 accepted this because "the user's formatter re-applies their style on next run". Since dx#276 the bar is that an add without a TTY leaves `rr check` green, and `rr check` reports problems without fixing them.

## Options considered

- **A**: The owning plugin formats. biome-plugin's patch branch returns the existing `edit-json`, then an `edit-text` that runs the patched `biome.json` through the installed Biome synchronously (`biome format --stdin-file-path=biome.json`) and falls back to the unformatted text on any error. Separately, `applyJsonEdits` returns the source verbatim when no edit changes the document.
- **B**: A surgical engine. Amend 004 so that edit-json edits the source text in place (jsonc-parser or hand-written), keeping untouched text and indent and inserting new values compactly.
- **C**: The kernel formats. After `rr plugins add/remove`, the kernel runs the configured `Formatter` on exactly the files it wrote. That needs a file list on `Formatter.format` and a registry rebuilt from the config it just saved.

## Decision: Option A

Biome's layout depends on the merged config, and the patch changes that config. For a `biome.json` without `indentStyle`, Biome formats with tabs before the patch and spaces after it, because `@rrlab/biome-config` sets `indentStyle: space`. Only Biome gets this right, and only when it runs after the patched file is on disk and `@rrlab/biome-config` is installed. In `rr plugins add`, the file-ops step is the one point where both are true: `add.ts` installs `devDependencies` before it applies the file ops, in order. Formatting a tool's own config file with that tool falls under the plugin's ownership of "the tool's config-file shape" (`run-run/CLAUDE.md`). It uses the existing `edit-text` op (tsdown-plugin already patches through it) and changes no contract, so the new plugin works on the published `@rrlab/cli` and the two packages release independently. The no-op guard is tool-agnostic and makes ADR 004's idempotency hold byte for byte: an edit that changes nothing leaves the file as it was.

`edit-text` stays `(source) => string`, so the format step spawns Biome synchronously (`execFileSync`). That makes biome-plugin the first plugin to spawn a process outside `ToolService`/`ShellService`. Widening `edit-text` to return a Promise would let it use `ShellService.runCaptured` with `stdin`. But `rr plugins add` installs the latest plugin whatever the host's `@rrlab/cli` version, and an older `applyFileOp` does not await `op.edit`: it would pass a Promise to `fs.writeFile` partway through the add.

## Alternatives rejected

- Option B: it doesn't fix the bug. Keeping the source indent is wrong whenever the preset changes it. jsonc-parser was tested and still spreads the inserted array over lines, so the engine would need its own compact-insertion rule, which is a formatting policy inside a tool-agnostic kernel. It also reopens 004's rejection of jsonc-parser.
- Option C: the right shape for the whole bug class, but it costs too much for the one file in scope. `Formatter.format` takes only `{ fix }` and formats the whole project, so it would need a file list, implemented in both biome and oxc. The add/remove flows would need a new step that rebuilds the registry after `ast.save` and handles zero or several formatters. And it would need an ADR 011 release. A does not rule it out; see the notes.
- Formatting inside `install()`: `install()` runs before the `devDependencies` are installed and before the patch is written, so Biome would format against the old config or fail to resolve `@rrlab/biome-config`.
- One `edit-text` that patches and formats in a single step: it formats against the pre-patch config on disk.

## Notes for human review

- The scope is the patch path for `biome.json`. Still unformatted after this: ts-plugin's `tsconfig.json` patch and uninstall (arrays spread over lines, `rr check` red), and `run-run.config.mts`, which is written with recast's 2-space indent even in tab or 4-space projects. ts-plugin owns no formatter, and the project's formatter may be oxfmt, so this plugin-side pattern doesn't carry over to those files. Fixing them is Option C's job, in its own decision.
- A does not foreclose C, because it adds nothing to the contract. When C lands, delete biome-plugin's format step (`formatWithBiome` and its `edit-text` op) in the same PR; until then, formatting the same file twice is idempotent. C needs the no-op guard too, so that a re-add doesn't churn files.
- The format step falls back to the unformatted text when Biome can't be resolved, exits non-zero (invalid JSON, an `extends` it can't resolve), times out (10 s) or prints nothing. The add never fails because of this step; the worst case is the old behaviour. When the user's `files.includes` leaves `biome.json` out, Biome echoes the input unchanged, so the step reports "No changes", which matches `rr jsc` not checking that file either.
- Known wart: `add.ts` logs one line per op, so a patch prints "Edited biome.json" twice (or "Edited" then "No changes"). Collapsing the outcomes per path is a separate change.
- Edge case: an empty existing file with no-op edits now stays empty instead of becoming `{}\n`. No existing test asserted the old behaviour; `json-edit.test.ts` locks the new one.
