# @rrlab/tsdown-plugin

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
