# Biome Config

> **Deprecated.** This package has been superseded by [`@vlandoss/config`](../../packages/config/README.md), which consolidates Biome, TypeScript, and other shared configs behind subpath exports. New projects should use `@vlandoss/config/biome` instead. This package will keep receiving critical fixes but no new features.

## Migration

Replace:

```json
{
  "extends": ["@vlandoss/biome-config"]
}
```

With:

```json
{
  "extends": ["@vlandoss/config/biome"]
}
```

And swap the devDependency:

```bash
pnpm remove @vlandoss/biome-config
pnpm add -D @vlandoss/config
```

## Installation

```bash
pnpm add -D @vlandoss/biome-config
```

## Usage

1. Create a `biome.json` file at the root of your project.

2. Paste the following:

  ```json
  {
    "extends": ["@vlandoss/biome-config"]
  }
  ```
