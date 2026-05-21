# @rrlab/plugin-oxc

[oxc](https://oxc.rs) plugin for [`@rrlab/cli`](https://npmjs.com/package/@rrlab/cli). Provides `lint` (oxlint) and `format` (oxfmt) capabilities.

## Install

```sh
rr plugins add oxc
```

Installs `@rrlab/plugin-oxc` and adds `oxlint`, `oxfmt`, and `oxlint-tsgolint` (optional) as `devDependencies`. No config file is scaffolded — oxlint and oxfmt work with sensible defaults and the projects that need to customise add their own `oxlintrc.json` / `.oxfmtrc` on demand.

For `rr jsc` (lint + format together), the kernel composes oxlint + oxfmt automatically when both capabilities are present and no plugin provides `jsc` directly.

## What it provides

| Capability | Surface |
|---|---|
| `lint` | `rr lint`, `rr lint doctor` |
| `format` | `rr format`, `rr format doctor` |
| `jsc` (composed) | `rr jsc` (synthesised lint + format) |

## Removal

```sh
rr plugins remove oxc
```

Removes `oxlint`, `oxfmt`, and `oxlint-tsgolint` from `package.json` and drops the `oxc()` entry from `run-run.config.{ts,mts}`. Tool config files (`oxlintrc.json`, `.oxfmtrc`) — if any — are left alone, they belong to the user.
