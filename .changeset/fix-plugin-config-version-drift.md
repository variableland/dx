---
"@rrlab/biome-plugin": patch
"@rrlab/ts-plugin": patch
"@rrlab/tsdown-plugin": patch
"@rrlab/cli": patch
---

Stop hardcoding the `@rrlab/*-config` sibling version range in each plugin's install hook — the plugin and its config sibling are versioned independently and could drift (e.g. `@rrlab/biome-plugin@0.1.0` was pinning `@rrlab/biome-config@^0.1.0` while the latest published config was `0.0.2`, breaking `rr plugins add biome`).

Plugins now resolve the sibling spec via the new `ctx.release: ReleaseService` on `InstallContext`. With no release tag, `ctx.release.resolve(pkg)` returns `"latest"`. When the user runs `rr plugins add biome@pr-226` (new syntax), the kernel parses the dist-tag, installs the plugin at that tag, and the install hook resolves siblings under the same tag — falling back to `"latest"` for any sibling the registry doesn't have at that tag (so partial preview releases install cleanly).
