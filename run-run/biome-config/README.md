# @rrlab/biome-config

Shared [Biome](https://biomejs.dev) preset for projects using [`@rrlab/plugin-biome`](https://npmjs.com/package/@rrlab/plugin-biome).

## Install

If you use [`@rrlab/cli`](https://npmjs.com/package/@rrlab/cli):

```sh
rr plugins add biome
```

Scaffolds a `biome.json` extending this config (with your confirmation).

If you don't, install manually:

```sh
pnpm add -D @rrlab/biome-config @biomejs/biome
```

…and create a `biome.json`:

```json
{
  "$schema": "https://biomejs.dev/schemas/2.4.4/schema.json",
  "extends": ["@rrlab/biome-config"]
}
```

## Override

Local keys in your `biome.json` win over the preset. Add `linter.rules`, `formatter`, `files.includes`, etc. to taste. If you want to chain another shared config on top, append it to the `extends` array — entries later in the array override earlier ones, so the user's preferences and local overrides win over our base.

## Peer dependencies

- `@biomejs/biome >= 2.0.0` — the `$schema` URL is tied to a biome major and the rule set evolves between majors.
