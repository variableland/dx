# ⚙️ config

Shared configuration presets for tooling (biome, tsc, etc)

## Installation

```sh
pnpm add -D @vlandoss/config
```

To use the Biome preset you also need `@biomejs/biome` installed (it's declared as an optional peer):

```sh
pnpm add -D @biomejs/biome
```

## Biome

`biome.json`:

```json
{
  "extends": ["@vlandoss/config/biome"]
}
```

## TypeScript

`tsconfig.json`:

```json
{
  "extends": ["@vlandoss/config/ts/no-dom/lib"]
}
```

Available TypeScript presets:

- `@vlandoss/config/ts/react` — DOM + `react-jsx`
- `@vlandoss/config/ts/dom/app`
- `@vlandoss/config/ts/dom/lib`
- `@vlandoss/config/ts/no-dom/app`
- `@vlandoss/config/ts/no-dom/lib`

### Caveat: `vite`/`oxc` + `pnpm` strict isolation

The TypeScript presets extend `@total-typescript/tsconfig`. `tsc` and Node resolve transitive `extends` relative to the file that declares them (per the TS spec), but `vite`/`oxc` (used by `vitest` ≥ 4 via `rolldown`) resolves them from the **consumer**'s location instead. Under `pnpm`'s strict isolation, `@total-typescript/tsconfig` is reachable from this package but not from the consumer, so `oxc` errors with `Tsconfig not found`.

Workaround — public-hoist the transitive base in the consumer's `.npmrc`:

```
public-hoist-pattern[]=@total-typescript/*
```

Not needed for `tsc`-only consumers.

## Lefthook

Consumed via [lefthook remotes](https://lefthook.dev/examples/remotes) — no `pnpm add` needed.

`lefthook.yml`:

```yaml
remotes:
  - git_url: https://github.com/variableland/dx
    configs:
      - packages/config/src/lefthook/turborepo.yml
```

Then `pnpm lefthook install` to sync the hooks.

