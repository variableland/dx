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
