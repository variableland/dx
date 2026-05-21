# @rrlab/ts-config

Shared TypeScript presets for projects using [`@rrlab/ts-plugin`](https://npmjs.com/package/@rrlab/ts-plugin). Built on top of [`@total-typescript/tsconfig`](https://github.com/total-typescript/tsconfig).

## Install

If you use [`@rrlab/cli`](https://npmjs.com/package/@rrlab/cli):

```sh
rr plugins add ts
```

Picks a preset interactively and scaffolds your `tsconfig.json`.

If you don't, install manually:

```sh
pnpm add -D @rrlab/ts-config typescript @types/node
```

…and point your `tsconfig.json` at one of the entries below.

## Presets

| Entry | Use when |
|---|---|
| `@rrlab/ts-config/react` | React app (browser DOM + JSX). |
| `@rrlab/ts-config/dom/app` | Web app, DOM available, no React. |
| `@rrlab/ts-config/dom/lib` | Browser library (DOM lib in scope). |
| `@rrlab/ts-config/no-dom/app` | Node.js app / CLI. Requires `@types/node`. |
| `@rrlab/ts-config/no-dom/lib` | Node.js library. Requires `@types/node`. |

## Usage

A typical `tsconfig.json` is a 3-line wrapper:

```json
{
  "extends": "@rrlab/ts-config/no-dom/app"
}
```

Override compiler options or add `include`/`exclude` by setting them in your local file — local keys win over the preset.

## Peer dependencies

- `typescript >= 5.0` — the presets use compiler options stable since TS 5.
- `@types/node >= 20` — only required by the `no-dom-*` presets (declared as optional peer).
