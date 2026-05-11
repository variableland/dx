# {{projectName}}

variableland-flavoured Node.js monorepo: pnpm workspaces + Turborepo + Biome + Vitest.

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

## Scripts

| Script | Purpose |
|--------|---------|
| `pnpm dev` | `turbo run dev` across every app. |
| `pnpm build` | `turbo run build`. |
| `pnpm test` | `turbo run test` (depends on build). |
| `pnpm test:types` | TypeScript across the workspace. |
| `pnpm lint` / `pnpm lint:fix` | Biome. |
