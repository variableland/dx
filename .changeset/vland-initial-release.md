---
"@vlandoss/vland": minor
---

Initial release of `@vlandoss/vland` — the modern project bootstrapper that replaces `@vlandoss/starter`.

- Same `vland` binary and UX (ASCII banner, `--usage` → KDL, ghost `completion` command via the bash bin dispatcher).
- New `vland init [name] [-t <template>]` flow built on **giget + @clack/prompts + commander**, with placeholder replacement (`{{projectName}}` / `{{author}}` / `{{year}}`), automatic dependency install via `nypm`, and `git init` through clibuddy's `ShellService`.
- Three official templates fetched from `github:variableland/dx/templates/<name>` (with a `VLAND_TEMPLATES_DIR` escape hatch for E2E):
  - **`library`** — standalone publishable TypeScript library with Changesets release workflow.
  - **`backend`** — Elysia (`@elysiajs/node`) service with evlog, zod, Dockerfile, vitest integration test.
  - **`monorepo`** — pnpm + Turbo workspace with `apps/api` (Elysia + evlog), `apps/web` (Vite + React), `packages/types` (shared zod schemas).
- All templates target Node.js 20+ (24 recommended), use pnpm 10.6.4, extend `@vlandoss/config` for biome and tsconfig, and include `@total-typescript/tsconfig` as a direct devDep so rolldown/vite can resolve the shared tsconfig under pnpm strict isolation.
