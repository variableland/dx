# @rrlab/plugin-ts

TypeScript plugin for [`@rrlab/cli`](https://npmjs.com/package/@rrlab/cli). Provides the `tsc` capability backed by the TypeScript compiler.

## Install

```sh
rr plugins add ts
```

`rr plugins add` installs `@rrlab/plugin-ts`, adds `typescript` as a `devDependency`, and (with your confirmation) scaffolds a `tsconfig.json` extending one of the [`@rrlab/ts-config`](https://npmjs.com/package/@rrlab/ts-config) presets. When you opt into scaffolding, you're prompted to pick:

- `react` — React app.
- `dom-app` — Web app (DOM, no React).
- `dom-lib` — Browser library.
- `no-dom-app` — Node.js app / CLI (default).
- `no-dom-lib` — Node.js library.

The `no-dom-*` presets also bring `@types/node` along. If `tsconfig.json` already exists, you can choose to patch (the safe migration default), skip, or overwrite.

## What it provides

| Capability | Surface |
|---|---|
| `tsc` | `rr tsc` (workspace-aware in monorepos), `rr tsc doctor` |

## Configuration

The scaffolded `tsconfig.json` is a thin wrapper:

```json
{
  "extends": "@rrlab/ts-config/no-dom/app"
}
```

Override compiler options or `include`/`exclude` by adding them to your local `tsconfig.json`. The preset lives in [`@rrlab/ts-config`](https://npmjs.com/package/@rrlab/ts-config).

## Removal

```sh
rr plugins remove ts
```

Removes `typescript`, `@rrlab/ts-config`, and `@types/node` from `package.json`. If `tsconfig.json` was only the wrapper we scaffolded, deletes it; otherwise unsets the `extends` and leaves the rest of your settings untouched. Drops the `ts()` entry from `run-run.config.{ts,mts}`.
