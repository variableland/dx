# {{projectName}}

A standalone TypeScript library scaffolded with [`@vlandoss/vland`](https://github.com/variableland/dx/tree/main/packages/vland).

## Install

```sh
pnpm add {{projectName}}
```

## Usage

```ts
import { greet } from "{{projectName}}";

greet("vland");
```

## Develop

```sh
pnpm install
pnpm test       # vitest
pnpm build      # tsdown → dist/index.mjs (+ types)
```

## Release

This package uses [Changesets](https://github.com/changesets/changesets):

```sh
pnpm changeset            # describe a change
pnpm changeset version    # bump versions + changelog
pnpm release              # publishes to npm (also wired up in CI)
```
