# vland v2 — agent build notes

Working notes captured during the rewrite of `@vlandoss/starter` → `@vlandoss/vland`. Read these before changing anything in `packages/vland/` or `templates/`.

## Decisions locked with Ricardo

| #   | Decision                                                   | Source         |
| --- | ---------------------------------------------------------- | -------------- |
| 1   | Backend framework: **Elysia + `@elysiajs/node`**           | Q&A 2026-05-10 |
| 2   | Monorepo apps: **backend + minimal Vite-React SPA**        | Q&A 2026-05-10 |
| 3   | Logger across all templates: **evlog** (https://evlog.dev) | Q&A 2026-05-10 |

These override the kickoff's "Fastify (assumed)" / open frontend / open logger spots.

## dx conventions (discovered)

Source of truth for everything we write under `packages/vland/` and `templates/*`. Every template MUST conform.

### Toolchain

- **Package manager**: `pnpm@10.6.4` pinned in root `package.json#packageManager`. `pnpm-workspace.yaml` covers `packages/*` and `dotfiles/*`. `onlyBuiltDependencies: ["@biomejs/biome", "lefthook"]`.
- **Node**: `>=20.0.0` in every package's `engines.node`; `.node-version` ships `24` (templates default to 24).
- **Build tool**: `tsdown` (currently `0.21.10`) wrapped by the workspace-private `@vlandoss/tsdown-config` package. Two factories: `defineBinConfig()` (entry `src/run.ts`, ESM, platform `node`) and `defineLibConfig()` (entry `src/index.ts`, ESM, `dts: true`).
- **Test runner**: vitest `^4.0.0`, multi-project (`unit` + `integration`).
- **Turbo tasks**: `build` (outputs `dist/**`, `dependsOn: ["^build"]`), `test` (`dependsOn: ["build"]`), `test:types`, `test:unit`, `test:integration` (last `dependsOn: ["build"]`).
- **Lint/format**: Biome `2.4.4` via root `biome.json` extending `@vlandoss/config/biome`. **Critical lint rule**: `correctness.useImportExtensions = "error"` — every import in source MUST include the `.ts` (or `.tsx`) extension explicitly.
- **Git hooks**: lefthook `2.1.1`, config remote-loaded from `@vlandoss/config/lefthook/turborepo.yml`. Pre-commit: `pnpm rr jscheck --fix-staged` + `pnpm turbo run test:types --filter='...[HEAD]'`. Pre-push: affected tests.
- **Releases**: changesets (`@changesets/cli` + `@changesets/changelog-github`). `access: "restricted"` at root, public per-package via `publishConfig.access: "public"`.

### Per-package `package.json` shape (for libraries / CLIs)

```jsonc
{
  "type": "module",
  "imports": {
    "#src/*": "./src/*",
    "#test/*": "./test/*"            // only if there is a test/ dir
  },
  "exports": { "./foo": "./src/foo.ts" },   // libs: source paths, not dist
  "publishConfig": {
    "access": "public",
    "exports": {                      // dist overrides — only the npm tarball sees these
      "./foo": { "types": "./dist/foo.d.mts", "default": "./dist/foo.mjs" }
    }
  },
  "files": ["bin", "dist", "src", "!src/**/__tests__", "!src/**/*.test.*", "tsconfig.json"],
  "engines": { "node": ">=20.0.0" },
  "scripts": {
    "build": "tsdown",                              // CLIs: "tsdown && pnpm build:kdl"
    "build:kdl": "./bin --usage > dist/cli.usage.kdl",   // CLIs only
    "prepublishOnly": "pnpm build",
    "test:types": "rr tsc"
  },
  "peerDependencies": { /* any */ },
  "peerDependenciesMeta": { "<dep>": { "optional": true } }   // ALL peerDeps are optional
}
```

### Per-package `tsconfig.json`

One-liner extending shared config. Choose by package shape:
- `@vlandoss/config/ts/no-dom/lib` — Node libraries
- `@vlandoss/config/ts/no-dom/app` — Node CLIs / backends
- `@vlandoss/config/ts/dom/app` or `dom/lib` — DOM contexts
- `@vlandoss/config/ts/react` — React (extends dom + `jsx: "react-jsx"`)

Underneath, all extend `@total-typescript/tsconfig/bundler/{no-dom,dom}` and set `allowImportingTsExtensions: true`. **No** root tsconfig in dx; templates with multiple workspaces should follow the same — config inherited per-package.

### Source-file conventions

- `import x from "./foo.ts"` — extensions required.
- `imports` aliases: `#src/*` → `./src/*`, `#test/*` → `./test/*`. Use them inside source for cross-cutting modules.
- Entry layout: bin is `src/run.ts`, library barrel is `src/index.ts`.
- `src/run.ts` pattern (CLIs):

  ```ts
  import path from "node:path";
  import { dirnameOf, run } from "@vlandoss/clibuddy";
  import { createProgram } from "./program/index.ts";
  import { logger } from "./services/logger.ts";

  const BIN_DIR = path.dirname(dirnameOf(import.meta));

  await run(async () => {
    const program = await createProgram({ binDir: BIN_DIR });
    await program.parseAsync();
  }, logger);
  ```

### Bin script (`./bin`) — CLIs

A bash dispatcher (NOT a JS shim). Two responsibilities:
1. Intercept `<cli> completion <shell>` and `exec usage generate completion <shell> <cli> --file dist/cli.usage.kdl` (so the completion code path doesn't spin up Node).
2. Detect dev vs published install: if `tsdown.config.ts` exists in the package dir, run `node $DIR/src/run.ts "$@"`; else run `node $DIR/dist/run.mjs "$@"`.

Verbatim template (replace `<cli>` and `<pkg>`):

```bash
#!/usr/bin/env bash
set -e

SOURCE="${BASH_SOURCE[0]}"
while [ -L "$SOURCE" ]; do
  TARGET="$(readlink "$SOURCE")"
  case "$TARGET" in
    /*) SOURCE="$TARGET" ;;
    *) SOURCE="$(dirname "$SOURCE")/$TARGET" ;;
  esac
done
DIR="$(cd "$(dirname "$SOURCE")" && pwd)"

if [ "$1" = "completion" ]; then
  case "$2" in
    bash | zsh | fish)
      kdl="$DIR/dist/cli.usage.kdl"
      if [ ! -f "$kdl" ]; then
        echo "<cli> completion: missing $kdl. Reinstall <pkg> or run \`pnpm build\`." >&2
        exit 1
      fi
      if ! command -v usage >/dev/null 2>&1; then
        echo "<cli> completion: 'usage' CLI not found in PATH." >&2
        echo "Install via: mise use -g usage  |  brew install usage" >&2
        exit 1
      fi
      exec usage generate completion "$2" <cli> --file "$kdl"
      ;;
  esac
fi

if [ -f "$DIR/tsdown.config.ts" ]; then
  exec node "$DIR/src/run.ts" "$@"
else
  exec node "$DIR/dist/run.mjs" "$@"
fi
```

### Commander layer (CLIs)

- `commander@14.0.3` and `@usage-spec/commander@1.1.0`.
- Each subcommand lives in `src/program/commands/<name>.ts` and exports a factory (`createXxxCommand(ctx)`).
- `src/program/index.ts` builds the program; wraps it in `addUsage(...)` to register the `--usage` option (prints KDL to stdout via `generateToStdout`).
- A *ghost* `completion` command is registered with Commander only for help/discoverability — the bash dispatcher actually handles execution.
- ASCII banner via `getBannerText(version)` from `src/program/ui.ts`. Generated once with `npx figlet -f "ANSI Shadow" "<cli>"` and color-painted via `colorize(hex)` from `@vlandoss/clibuddy`.

### Shared in-repo deps

- `@vlandoss/clibuddy` — colors (`chalk` via `colorize(hex)`), `palette`, `text.vland`, `text.version(v)`, `dirnameOf(meta)`, `run(fn, logger)`, `createPkg`, `createShellService`, `cwd`.
- `@vlandoss/loggy` — `createLoggy({ namespace })` (consola+debug, with `.subdebug(ns)` for `DEBUG=` traces).
- `@vlandoss/config` — `biome` JSON, tsconfig presets at `ts/{no-dom,dom,react}/{app,lib}`, lefthook config.
- `@vlandoss/tsdown-config` — `defineBinConfig()`, `defineLibConfig()`. Workspace-private (templates can't depend on it; libs/bins in the monorepo template are expected to inline an equivalent or just call `tsdown` with their own config).

### CI workflows shipped with dx

- `.github/workflows/ci.yml` — test (jscheck + types + vitest), build (turbo), release (changesets).
- `.github/workflows/cli-docs.yml` — on tag `@vlandoss/<cli>@*`, regenerates `CLI.md` from KDL via `usage generate markdown`.

Templates can ship a slimmed analog of `ci.yml`; `cli-docs.yml` is monorepo-internal and shouldn't appear in templates.

## vland v2 architecture

### Layering

```
src/
  run.ts                  # entry — top-level await, run(...) wrapper
  program/
    index.ts              # commander program factory
    ui.ts                 # banner + tagline + tool labels
    commands/
      usage.ts            # addUsage helper (--usage → KDL)
      completion.ts       # ghost command (bash dispatcher does the real work)
      init.ts             # init subcommand wiring
  actions/
    init.ts               # the init flow (clack prompts → giget → placeholders → install → git)
    placeholders.ts       # token replacement walker
    template.ts           # giget source resolution (github vs local override for tests)
  services/
    ctx.ts                # binPkg lookup so we can read version
    logger.ts             # createLoggy({ namespace: "vland" })
```

### Placeholders walked across template files

- `{{projectName}}` — kebab-case validated as both dirname and npm package name.
- `{{author}}` — `git config user.name` + `<git config user.email>` (`Name <email>`); prompt if missing.
- `{{year}}` — current year (4-digit).

`package.json` `name` field is updated via `pkg-types` (not regex) for safety.

### Local templates for testing

`init` resolves the template source in this order:
1. `VLAND_TEMPLATES_DIR` env var → use `${VLAND_TEMPLATES_DIR}/<template>` as the source (giget supports `file:` URLs / a local copy fallback). Used by E2E tests against `templates/` in the dx checkout.
2. Default → `github:variableland/dx/templates/<template>` via giget.

This avoids needing a published GitHub branch during development.

## Verified end-to-end

Manual + automated runs against `templates/` (`VLAND_TEMPLATES_DIR`):

- `vland init <name> -t library --no-install --no-git` → `pnpm install && pnpm test:types && pnpm test && pnpm build` all green.
- `vland init <name> -t backend --no-install --no-git` → same; `dist/index.mjs` produced.
- `vland init <name> -t monorepo --no-install --no-git` → same; turbo runs `test:types`/`test`/`build` across api + web + types workspaces, all green.
- `vland init existing-dir` (non-empty) → fails with `--force` hint, exit non-zero.
- `vland init existing-dir --force` → overwrites cleanly.
- Non-TTY without `--template` or name → fails with helpful message.
- `vland --usage` → emits valid KDL.
- `pnpm build` → produces `dist/run.mjs` + `dist/cli.usage.kdl`.

Automated coverage in `packages/vland/test/integration/init.test.ts`:
- 4 specs covering placeholder replacement, package name update, non-empty failure path, and monorepo workspace name rewriting.

## Known gotchas in templates

- **`@total-typescript/tsconfig` must be a direct devDep** of every package that extends `@vlandoss/config/ts/...`. pnpm's strict isolation means transitive resolution doesn't reach `@vlandoss/config`'s own dep when tsdown/vite (rolldown plugin dts) resolves `extends` from the consumer. See `packages/config/README.md` for the full reasoning.
- **tsdown extension defaults**: with `"type": "module"` and `dts: true` the JS output is `dist/<entry>.js` + `dist/<entry>.d.ts`. With `dts` omitted, JS is `dist/<entry>.mjs`. Templates currently match each tsdown config's actual output (library uses `.js`, backend/api use `.mjs`).
- **evlog API shape**: `initLogger({ minLevel, pretty })` (NOT `level`); the standalone bootstrap logger is the exported `log` (NOT `useLogger()`, which is request-scoped). `log.info`/`log.error` accept either `(tag, message)` strings or a single event object.
- **Vite + TS**: `apps/web/src/vite-env.d.ts` containing `/// <reference types="vite/client" />` is required so `tsc --noEmit` accepts side-effect `.css` imports.

## Items skipped / open questions for Ricardo

(Append here if anything is halted by the safety guardrails.)

- _none — everything in the kickoff is done. No registry publishes, no `@vlandoss/starter` deprecation, no `git push`. Branch `feat/vland-v2` is local; review and ship from there._
