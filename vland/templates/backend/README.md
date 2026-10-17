# {{projectName}}

A Node.js backend service built with [Elysia](https://elysiajs.com), [`@elysiajs/node`](https://elysiajs.com/integrations/node), and [evlog](https://evlog.dev).

## Prerequisites

[mise](https://mise.jdx.dev) 2026.9.16 or later. It installs the Node.js and pnpm versions pinned in `mise.toml` and `mise.lock`, the same ones CI uses.

## Getting started

```sh
mise install
cp .env.example .env
pnpm install
pnpm dev
```

Open <http://localhost:4000/health> — you should get `{ "ok": true }`.

## Set up tooling

This project uses [`rr`](https://github.com/withvariablelab/dx/tree/main/run-run) (the `@rrlab/cli`) as the single entry point for lint, format, type-check, and build. The pre-configured `mise.toml` puts `./node_modules/.bin` on your `PATH`, so `rr` is invokable directly from the project root.

It starts with no plugins. Add the ones you want:

```sh
rr plugins add biome            # lint + format (writes biome.json)
rr plugins add ts               # type-check (writes tsconfig.json)
rr plugins add tsdown           # bundle (writes tsdown.config.ts)
rr plugins add vitest           # tests through `rr test`
```

Each `rr plugins add` installs the plugin, records it in `run-run.config.mts` and scaffolds its config file, asking first. `--yes` takes the defaults without asking: use it from an agent or a script. `rr plugins add oxc` swaps `biome` for oxlint and oxfmt, and `rr plugins remove <name>` undoes an add.

CI runs `rr check`, `pnpm test` and `rr pack`, so it needs `biome` (or `oxc`), `ts` and `tsdown`.

## Develop

| Command | Purpose |
|---------|---------|
| `pnpm dev` | Run the server with `node --watch`, loading `.env` when it exists. |
| `pnpm start` | Run the bundled server (`node dist/index.mjs`). |
| `pnpm test` | Run the Vitest suite. |
| `rr check` | Lint + format check, then type-check. |
| `rr jsc --fix` | Auto-fix lint + format. |
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
