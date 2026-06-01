---
"@rrlab/cli": minor
"@rrlab/biome-plugin": patch
"@rrlab/oxc-plugin": patch
"@rrlab/ts-plugin": patch
"@rrlab/tsdown-plugin": patch
---

Decouple the CLI into framework-agnostic layers and redesign the help surface.

Every command body becomes a free-function action (`src/actions/*`) that takes a single `<Name>ActionConfig` object; commander commands are thin wrappers that resolve their service via the `ctx.plugins` facade (throwing `MissingPluginError` when no configured plugin provides the capability) and delegate to exactly one action. Actions depend only on `services`/`render`/`lib`, never on the CLI framework. The plugin SDK moves to `src/lib/plugin/*`, ad-hoc errors become domain error classes (`src/errors/*` for kernel errors, `src/lib/plugin/errors.ts` for SDK errors), and a plugin's `ui` label is now derived from a single `color` function it provides — plugins no longer hard-code their own `ui` string. The `plugins` command monolith is split into `actions/plugins/*`, and the official plugin list is reshaped into `src/lib/plugin/directory.ts` (`PLUGINS_DIRECTORY` + `allPluginNames`/`isPluginName`).

The help surface is rebuilt on commander's native formatter instead of a bespoke help class: the root program is a `RunRunCmd` subclass that groups commands (`Code quality:` / `Build:` / `Maintenance:` / `Meta:`) and attaches a banner and an installed/available plugins footer via `addHelpText`. Unknown commands now use commander's native `showSuggestionAfterError` "Did you mean?" output. `--about` credits, per-command `Powered by:` / `See also:` lines (auto-derived from each command's declared capabilities by the `Cmd` base class in `src/program/base.ts`), the installed/available plugins footer (`render/footer.ts`), a `rr config` plugins table (package + version), and a small table/line builder (`render/lines.ts`) round out the rendering layer.
