# config

Shared configuration presets for `@variableland` tooling (Biome, TypeScript, and more over time).

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

