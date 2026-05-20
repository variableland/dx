# {{projectName}}

variableland-flavoured Node.js monorepo: pnpm workspaces + Turborepo + Vitest.

## What's inside

### Apps

| App | Description |
|-----|-------------|
| [`apps/api`](./apps/api) | Elysia (`@elysiajs/node`) backend with evlog. |
| [`apps/web`](./apps/web) | Minimal Vite + React SPA. |

### Packages

| Package | Description |
|---------|-------------|
| [`packages/types`](./packages/types) | Shared zod schemas, consumed by `apps/api` and `apps/web`. |

## Prerequisites

- Node.js >= 20 (24 recommended; see `.node-version`)
- pnpm 10.x

## Getting started

```sh
pnpm install
pnpm dev
```

## Set up tooling

This project uses [`rr`](https://github.com/variableland/dx/tree/main/run-run) (the `@rrlab/cli`) as the single entry point for lint, format, type-check, and build. The pre-configured `mise.toml` puts `./node_modules/.bin` on your `PATH`, so `rr` is invokable directly from anywhere inside the repo.

Add the plugins you want — each one writes its own config file and registers itself in the workspace's `run-run.config.mts`:

```sh
# Workspace-wide formatting + linting (lives at root)
rr plugins add biome

# Type-checking iterates every workspace when invoked at root.
# Install plugin-ts at root (decline scaffolding root tsconfig.json),
# then install it inside each workspace that needs its own tsconfig.
rr plugins add ts                                                          # at root
cd apps/api       && pnpm rr plugins add ts && pnpm rr plugins add tsdown && cd ../..
cd apps/web       && pnpm rr plugins add ts                                && cd ../..
cd packages/types && pnpm rr plugins add ts && pnpm rr plugins add tsdown && cd ../..
```

Inside a workspace folder, prefix with `pnpm` (`pnpm rr <cmd>`) — pnpm resolves `rr` from the workspace root's `node_modules/.bin`.

## Develop

| Command | Purpose |
|---------|---------|
| `pnpm dev` | `turbo run dev` across every app. |
| `pnpm build` | `turbo run build`. |
| `pnpm test` | `turbo run test` across every workspace with tests. |
| `rr jsc` (root) | Lint + format check on the whole repo. |
| `rr tsc` (root) | Type-check every workspace that has a `tsconfig.json`. |
| `rr pack` (per workspace) | Bundle the workspace's `src/index.ts` via tsdown. |
