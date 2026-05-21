# @vlandoss/vland

## 0.2.0

### Minor Changes

- [#210](https://github.com/variableland/dx/pull/210) [`7d7e673`](https://github.com/variableland/dx/commit/7d7e673e34974740b6b09c8385e9f91ad9af8ea8) Thanks [@rqbazan](https://github.com/rqbazan)! - `vland init` now prompts (default-yes) for installing dependencies and initialising a git repository when those flags aren't passed on the CLI. Use `--install` / `--no-install` and `--git` / `--no-git` to skip the prompts; in non-interactive contexts both default to `true`.

  Also fixes the git initialisation step: the commit message was being split on whitespace by the underlying shell layer, producing errors like `pathspec 'initial' did not match any file(s)` and leaving the repo half-initialised. The migration to `tinyexec` (via `@vlandoss/clibuddy`) makes each argv entry survive as a separate token, so the canonical first commit `chore: initial commit from vland` now lands cleanly.

### Patch Changes

- Updated dependencies [[`7d7e673`](https://github.com/variableland/dx/commit/7d7e673e34974740b6b09c8385e9f91ad9af8ea8)]:
  - @vlandoss/clibuddy@0.6.0

## 0.1.1

### Patch Changes

- [#204](https://github.com/variableland/dx/pull/204) [`75e5b1c`](https://github.com/variableland/dx/commit/75e5b1c1834719d46d5c78f8c94a32636e7097a8) Thanks [@rqbazan](https://github.com/rqbazan)! - Show the vland banner at the start of the `init` command

## 0.1.0

### Minor Changes

- [#198](https://github.com/variableland/dx/pull/198) [`d467f7f`](https://github.com/variableland/dx/commit/d467f7fd0f0512a1fe15f6d74cd9a540a21bbfbc) Thanks [@rqbazan](https://github.com/rqbazan)! - Initial release of `@vlandoss/vland` — the modern project bootstrapper that replaces `@vlandoss/starter`.

  - Same `vland` binary and UX (ASCII banner, `--usage` → KDL, ghost `completion` command via the bash bin dispatcher).
  - New `vland init [name] [-t <template>]` flow built on **giget + @clack/prompts + commander**, with placeholder replacement (`{{projectName}}` / `{{author}}` / `{{year}}`), automatic dependency install via `nypm`, and `git init` through clibuddy's `ShellService`.
  - Three official templates fetched from `github:variableland/dx/templates/<name>` (with a `VLAND_TEMPLATES_DIR` escape hatch for E2E):
    - **`library`** — standalone publishable TypeScript library with Changesets release workflow.
    - **`backend`** — Elysia (`@elysiajs/node`) service with evlog, zod, Dockerfile, vitest integration test.
    - **`monorepo`** — pnpm + Turbo workspace with `apps/api` (Elysia + evlog), `apps/web` (Vite + React), `packages/types` (shared zod schemas).
  - All templates target Node.js 20+ (24 recommended), use pnpm 10.6.4, extend `@vlandoss/config` for biome and tsconfig, and include `@total-typescript/tsconfig` as a direct devDep so rolldown/vite can resolve the shared tsconfig under pnpm strict isolation.

### Patch Changes

- Updated dependencies [[`d467f7f`](https://github.com/variableland/dx/commit/d467f7fd0f0512a1fe15f6d74cd9a540a21bbfbc)]:
  - @vlandoss/clibuddy@0.5.0
