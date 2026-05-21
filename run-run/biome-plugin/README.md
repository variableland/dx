# @rrlab/biome-plugin

Biome plugin for [`@rrlab/cli`](https://npmjs.com/package/@rrlab/cli). Provides `lint`, `format`, and `jsc` capabilities backed by [Biome](https://biomejs.dev).

## Install

```sh
rr plugins add biome
```

`rr plugins add` installs `@rrlab/biome-plugin`, adds `@biomejs/biome` as a `devDependency`, and (with your confirmation) scaffolds a `biome.json` extending [`@rrlab/biome-config`](https://npmjs.com/package/@rrlab/biome-config). When `biome.json` already exists you can choose to patch it, leave it alone, or overwrite it.

## What it provides

| Capability | Surface |
|---|---|
| `lint` | `rr lint`, `rr lint doctor` |
| `format` | `rr format`, `rr format doctor` |
| `jsc` | `rr jsc` (lint + format together), `rr jsc doctor` |

## Configuration

The scaffolded `biome.json` is a thin wrapper:

```json
{
  "$schema": "https://biomejs.dev/schemas/2.4.4/schema.json",
  "extends": ["@rrlab/biome-config"]
}
```

Override any biome setting by adding it to your local `biome.json`. The preset lives in [`@rrlab/biome-config`](https://npmjs.com/package/@rrlab/biome-config) — bump the package to get updated defaults.

## Removal

```sh
rr plugins remove biome
```

Removes `@biomejs/biome` + `@rrlab/biome-config` from `package.json`, edits or deletes `biome.json` (depending on whether you have other settings in it), and drops the `biome()` entry from `run-run.config.{ts,mts}`.
