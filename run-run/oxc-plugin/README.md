# @rrlab/oxc-plugin

[oxc](https://oxc.rs) plugin for [`@rrlab/cli`](https://npmjs.com/package/@rrlab/cli). Provides `lint` (oxlint), `format` (oxfmt), and `tsc` (oxlint type-aware) capabilities.

## Install

```sh
rr plugins add oxc
```

Installs `@rrlab/oxc-plugin` and adds `oxlint`, `oxfmt`, and `oxlint-tsgolint` as `devDependencies`. No config file is scaffolded — oxlint and oxfmt work with sensible defaults and the projects that need to customise add their own `oxlintrc.json` / `.oxfmtrc` on demand.

For `rr jsc` (lint + format together), the kernel composes oxlint + oxfmt automatically when both capabilities are present and no plugin provides `jsc` directly.

## What it provides

| Capability | Surface | Underlying command |
|---|---|---|
| `lint` | `rr lint`, `rr lint doctor` | `oxlint --check` / `--fix` |
| `format` | `rr format`, `rr format doctor` | `oxfmt --check` / `--fix` |
| `typecheck` | `rr tsc`, `rr tsc doctor` | `oxlint --type-aware --type-check` (via `oxlint-tsgolint`) |
| `jsc` (composed) | `rr jsc` (synthesised lint + format) | |

## Picking only some capabilities

Pass `only` to mix oxc with another plugin. Example: biome for lint+format, oxc just for the type-aware checks:

```ts
import biome from "@rrlab/biome-plugin";
import oxc from "@rrlab/oxc-plugin";
import { defineConfig } from "@rrlab/cli/config";

export default defineConfig({
  plugins: [
    biome({ only: ["lint", "format"] }),
    oxc({ only: ["typecheck"] }),
  ],
});
```

The `only` array is typed against the kinds *this* plugin provides (`"lint" | "format" | "typecheck"` for oxc), so typos like `oxc({ only: ["pack"] })` are caught at compile time.

## Removal

```sh
rr plugins remove oxc
```

Removes `oxlint`, `oxfmt`, and `oxlint-tsgolint` from `package.json` and drops the `oxc()` entry from `run-run.config.{ts,mts}`. Tool config files (`oxlintrc.json`, `.oxfmtrc`) — if any — are left alone, they belong to the user.
