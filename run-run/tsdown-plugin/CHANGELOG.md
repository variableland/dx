# @rrlab/tsdown-plugin

## 1.0.0

### Major Changes

- [#229](https://github.com/variableland/dx/pull/229) [`696de73`](https://github.com/variableland/dx/commit/696de73e4f602b860586df413757274dabc1c198) Thanks [@rqbazan](https://github.com/rqbazan)! - ### Declarative plugin shape + first-class `only` narrowing

  Every official plugin factory now accepts an `only?: readonly Kind[]` option that narrows which capabilities the plugin contributes to the kernel's registry. The `only` array is typed against the kinds _that plugin_ provides — `biome({ only: ["lint", "format"] })` and `oxc({ only: ["tsc"] })` are both valid; `oxc({ only: ["pack"] })` is a compile error.

  This unblocks host configurations that mix plugins with overlapping capabilities — for example, biome for lint+format alongside oxc for type-aware checks:

  ```ts
  import biome from "@rrlab/biome-plugin";
  import oxc from "@rrlab/oxc-plugin";
  import { defineConfig } from "@rrlab/cli/config";

  export default defineConfig({
    plugins: [biome({ only: ["lint", "format"] }), oxc({ only: ["tsc"] })],
  });
  ```

  ### `@rrlab/oxc-plugin` — new `tsc` capability

  `@rrlab/oxc-plugin` now provides a `tsc` capability backed by the `oxlint-tsgolint` peer (already installed by `rr plugins add oxc`). `rr tsc` configured with the oxc plugin runs `oxlint --type-aware --type-check`.

  ### `@rrlab/cli` — better multi-provider error

  The error thrown when two plugins claim the same capability now references the `only` syntax explicitly, e.g.:

  > Multiple plugins provide capability 'lint': biome, oxc. Narrow each plugin's capabilities in run-run.config.ts using the 'only' option — e.g. biome({ only: ['lint'] }) or oxc({ only: ['lint'] }).

  ### Plugin authoring — declarative shape (internal-only)

  Plugins now declare `capabilities` (a `{ kind: service }` map) rather than implementing an imperative `setup()`. The kernel-internal SDK at `@rrlab/cli/plugin` applies `only` narrowing, deduplicates bin probes across services that share a `pkg`, and surfaces a single canonical "requires X to be installed" error when a peer-installed tool is missing. New plugin-authoring helpers `decideScaffold` and `pickPreset` are exported from `@rrlab/cli/plugin` and are the canonical path for any user interaction during `rr plugins add`.

  The plugin API remains internal to `@rrlab/*` (no third-party authoring contract). Architectural rationale recorded in `decisions/007-per-plugin-only-option.md` (superseded by 009) and `decisions/009-declarative-plugin-shape.md`.

### Patch Changes

- [#229](https://github.com/variableland/dx/pull/229) [`696de73`](https://github.com/variableland/dx/commit/696de73e4f602b860586df413757274dabc1c198) Thanks [@rqbazan](https://github.com/rqbazan)! - `TOOL_VERSIONS` now carries only `install` (the prescriptive pin used by `rr plugins add`). The `peer` field is gone — `package.json#peerDependencies` is the single source of truth for the peer contract. The per-plugin `tool-versions.test.ts` asserts `semver.subset(install, peerDependencies[name])` instead of string-equality with a duplicated `peer` field. No runtime behaviour change — `peer` was never read outside its parity test.

  Architectural rationale: `decisions/010-tool-versions-install-only.md`.

- Updated dependencies [[`696de73`](https://github.com/variableland/dx/commit/696de73e4f602b860586df413757274dabc1c198)]:
  - @rrlab/cli@1.0.0

## 0.1.1

### Patch Changes

- [#226](https://github.com/variableland/dx/pull/226) [`76ebd6c`](https://github.com/variableland/dx/commit/76ebd6c94805768583668b5003f0c28d86829487) Thanks [@rqbazan](https://github.com/rqbazan)! - Stop hardcoding the `@rrlab/*-config` sibling version range in each plugin's install hook — the plugin and its config sibling are versioned independently and could drift (e.g. `@rrlab/biome-plugin@0.1.0` was pinning `@rrlab/biome-config@^0.1.0` while the latest published config was `0.0.2`, breaking `rr plugins add biome`).

  Plugins now resolve the sibling spec via the new `ctx.release: ReleaseService` on `InstallContext`. With no release tag, `ctx.release.resolve(pkg)` returns `"latest"`. When the user runs `rr plugins add biome@pr-226` (new syntax), the kernel parses the dist-tag, installs the plugin at that tag, and the install hook resolves siblings under the same tag — falling back to `"latest"` for any sibling the registry doesn't have at that tag (so partial preview releases install cleanly).

- Updated dependencies [[`76ebd6c`](https://github.com/variableland/dx/commit/76ebd6c94805768583668b5003f0c28d86829487)]:
  - @rrlab/cli@0.0.3

## 0.1.0

### Minor Changes

- [#223](https://github.com/variableland/dx/pull/223) [`74ecc14`](https://github.com/variableland/dx/commit/74ecc142b64d1f98635ebfbad100be5f2e784617) Thanks [@rqbazan](https://github.com/rqbazan)! - Inaugural release of the four official `@rrlab/<tool>-plugin` packages (`biome-plugin`, `oxc-plugin`, `ts-plugin`, `tsdown-plugin`) and re-release of `@rrlab/tsdown-config`. Each ships with its `dist/` built — earlier attempts (`@rrlab/plugin-*@0.1.0`, `@rrlab/tsdown-config@0.0.1`) were unpublished from npm after they shipped without `dist/` and could not be imported.

  Each plugin exports `default = definePlugin(...)` and provides one or more `PluginCapabilities` consumed by `@rrlab/cli`:

  | Plugin                 | Capabilities                      |
  | ---------------------- | --------------------------------- |
  | `@rrlab/biome-plugin`  | `lint`, `format`, `jsc`           |
  | `@rrlab/oxc-plugin`    | `lint` (oxlint), `format` (oxfmt) |
  | `@rrlab/ts-plugin`     | `tsc`                             |
  | `@rrlab/tsdown-plugin` | `pack`                            |

  `@rrlab/tsdown-config` ships the `defineLibConfig` / `defineBinConfig` helpers that `tsdown-plugin` scaffolds into a host project's `tsdown.config.ts`.

  Naming-convention decision recorded in `decisions/006-plugin-package-naming.md`: the entire `@rrlab/*` scope now follows `<tool>-<role>` (`biome-config` + `biome-plugin`, `ts-config` + `ts-plugin`, `tsdown-config` + `tsdown-plugin`) instead of mixing `<role>-<tool>` for plugins. `@rrlab/biome-config` and `@rrlab/ts-config` get a patch bump for the corresponding description update.

  ### `@rrlab/cli` fixes

  - `rr plugins add` now passes `silent: true` to the rollback `nypm.removeDependency` call that runs when a plugin's dynamic import fails. `rr plugins remove` does the same in its per-dep removal loop. Previously the package manager's stdout (e.g. pnpm's `Packages: -3`, the `Ignored build scripts` warning) leaked into the CLI's output after the surrounding spinner had finished.
  - Every package that has a build step (`tsdown`) now declares `prepublishOnly: "pnpm build"`, so a future `pnpm publish` that forgets to build first will fail loudly instead of shipping a tarball without `dist/`.

### Patch Changes

- Updated dependencies [[`74ecc14`](https://github.com/variableland/dx/commit/74ecc142b64d1f98635ebfbad100be5f2e784617)]:
  - @rrlab/cli@0.0.2
  - @vlandoss/clibuddy@0.6.1
