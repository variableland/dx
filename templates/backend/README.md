# {{projectName}}

A Node.js backend service built with [Elysia](https://elysiajs.com), [`@elysiajs/node`](https://elysiajs.com/integrations/node), and [evlog](https://evlog.dev).

## Prerequisites

- Node.js >= 20 (24 recommended; see `.node-version`)
- pnpm 10.x

## Getting started

```sh
cp .env.example .env
pnpm install
pnpm dev
```

Open <http://localhost:4000/health> — you should get `{ "ok": true }`.

## Scripts

| Script | Purpose |
|--------|---------|
| `pnpm dev` | Run the server with watch mode (`tsx watch`). |
| `pnpm build` | Bundle to `dist/index.mjs` via tsdown. |
| `pnpm start` | Run the bundled server (`node dist/index.mjs`). |
| `pnpm test` | Run the Vitest suite. |
| `pnpm test:types` | TypeScript type check. |
| `pnpm lint` | Biome lint + format check. |
| `pnpm lint:fix` | Biome auto-fix. |

## Layout

```
src/
  index.ts          # entry — start server, handle graceful shutdown
  env.ts            # zod-validated process.env
  logger.ts         # evlog initialiser
  server.ts         # Elysia app factory
  routes/
    health.ts       # GET /health
test/
  setup.ts          # vitest setup
  integration/
    health.test.ts  # example integration test
```

## Docker

```sh
docker build -t {{projectName}} .
docker run --rm -p 4000:4000 --env-file .env {{projectName}}
```
