---
"@rrlab/biome-plugin": minor
"@rrlab/oxc-plugin": minor
"@rrlab/ts-plugin": minor
"@rrlab/tsdown-plugin": minor
"@rrlab/cli": minor
---

### Declarative plugin shape + first-class `only` narrowing

Every official plugin factory now accepts an `only?: readonly Kind[]` option that narrows which capabilities the plugin contributes to the kernel's registry. The `only` array is typed against the kinds *that plugin* provides — `biome({ only: ["lint", "format"] })` and `oxc({ only: ["tsc"] })` are both valid; `oxc({ only: ["pack"] })` is a compile error.

This unblocks host configurations that mix plugins with overlapping capabilities — for example, biome for lint+format alongside oxc for type-aware checks:

```ts
import biome from "@rrlab/biome-plugin";
import oxc from "@rrlab/oxc-plugin";
import { defineConfig } from "@rrlab/cli/config";

export default defineConfig({
  plugins: [
    biome({ only: ["lint", "format"] }),
    oxc({ only: ["tsc"] }),
  ],
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
