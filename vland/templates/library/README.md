# {{projectName}}

A standalone TypeScript library scaffolded with [`@vlandoss/vland`](https://github.com/variableland/dx/tree/main/vland/cli).

## Install

```sh
pnpm add {{projectName}}
```

## Usage

```ts
import { greet } from "{{projectName}}";

greet("vland");
```

## Set up tooling

This project uses [`rr`](https://github.com/variableland/dx/tree/main/run-run) (the `@rrlab/cli`) as the single entry point for lint, format, type-check, and build. The pre-configured `mise.toml` puts `./node_modules/.bin` on your `PATH`, so `rr` is invokable directly from the project root.

```sh
pnpm install                    # also pulls in @rrlab/cli
rr plugins add biome            # lint + format (writes biome.json)
rr plugins add ts               # type-check (writes tsconfig.json)
rr plugins add tsdown           # bundle (writes tsdown.config.ts)
```

Each `rr plugins add` records the plugin in `run-run.config.mts` and scaffolds its config file. Re-run any time you want a different toolset.

## Develop

```sh
rr jsc                  # lint + format check
rr jsc --fix            # auto-fix
rr tsc                  # type-check
rr pack                 # build to dist/
vitest run              # tests
```

## Release

This package uses [Changesets](https://github.com/changesets/changesets). As a developer you only need to describe the change; the publish step is run by CI.

```sh
pnpm changeset            # describe a change
pnpm changeset version    # bump versions + changelog (locally, when needed)
```

CI invokes `pnpm changeset publish` on `main`. `prepublishOnly` runs `rr pack` automatically before publish.
