# @rrlab/tsdown-plugin

[tsdown](https://tsdown.dev) plugin for [`@rrlab/cli`](https://npmjs.com/package/@rrlab/cli). Provides the `pack` capability for packaging TypeScript libraries for distribution.

## Install

```sh
rr plugins add tsdown
```

Installs `@rrlab/tsdown-plugin` and adds `tsdown` as a `devDependency`. No config file is scaffolded — tsdown reads `tsdown.config.ts` if present, otherwise uses sensible defaults. Add your own when you need to customise.

## What it provides

| Capability | Surface |
|---|---|
| `pack` | `rr pack`, `rr pack doctor` |

`rr pack` builds your library: emits ESM JavaScript + `.d.ts` declarations to `dist/` so consumers can `import` from the published package.

## Removal

```sh
rr plugins remove tsdown
```

Removes `tsdown` from `package.json` and drops the `tsdown()` entry from `run-run.config.{ts,mts}`. `tsdown.config.ts` — if you have one — is left alone.
