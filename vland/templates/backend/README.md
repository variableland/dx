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

## Set up tooling

This project uses [`rr`](https://github.com/variableland/dx/tree/main/run-run) (the `@rrlab/cli`) as the single entry point for lint, format, type-check, and build. The pre-configured `mise.toml` puts `./node_modules/.bin` on your `PATH`, so `rr` is invokable directly from the project root.

```sh
rr plugins add biome            # lint + format (writes biome.json)
rr plugins add ts               # type-check (writes tsconfig.json)
rr plugins add tsdown           # bundle (writes tsdown.config.ts)
```

## Develop

| Command | Purpose |
|---------|---------|
| `pnpm dev` | Run the server with watch mode (`tsx watch`). |
| `pnpm start` | Run the bundled server (`node dist/index.mjs`). |
| `pnpm test` | Run the Vitest suite. |
| `rr jsc` | Lint + format check (add `--fix` to auto-fix). |
| `rr tsc` | TypeScript type check. |
| `rr pack` | Bundle to `dist/index.mjs` via tsdown. |

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
