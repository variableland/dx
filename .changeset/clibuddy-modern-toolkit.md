---
"@vlandoss/clibuddy": minor
---

Modernise the CLI toolkit. **Breaking** for consumers — even though we stay on `0.x`, the public API names changed.

**Colors**
- Replace `chalk` + `supports-color` with [`ansis`](https://www.npmjs.com/package/ansis). `colorize(hex)` and `colorIsSupported()` keep their signatures.
- Extend `palette` with semantic tokens used across our CLIs: `dim`, `highlight` (cyan), `success` (green), `label` (bgMagenta + black). `palette.bold` / `.italic` / `.link` / `.muted` / `.primary` are unchanged.

**Package JSON helpers**
- Replace `read-package-up` with [`pkg-types`](https://www.npmjs.com/package/pkg-types).
- Rename `PkgService` → `Pkg` and `createPkgService` → `createPkg`.
- Add `Pkg.write(packageJson)` for safely round-tripping `package.json` and `Pkg.pkgPath` getter.

**Workspace discovery**
- Replace `@pnpm/workspace.find-packages` + `@pnpm/workspace.read-manifest` with `@pnpm/fs.find-packages` + `yaml` (smaller dep tree, no `read-package-up` chain).

**Env detection**
- New `env` module re-exporting `hasTTY` and `isCI` from [`std-env`](https://www.npmjs.com/package/std-env). Replaces ad-hoc `process.env.NO_COLOR` / `is-ci` usage in consumers.

**Internals**
- Flatten `src/services/*` into `src/` (`pkg.ts`, `shell/*` directly under `src/`). The barrel still re-exports the same names.

Migration: `import { createPkgService, type NormalizedPackageJson } from "@vlandoss/clibuddy"` → `import { createPkg, type PackageJson } from "@vlandoss/clibuddy"`. The chained chalk style (`chalk.bold.red`) maps 1:1 to ansis (`ansis.bold.red`); within clibuddy you should use `palette.*` tokens or call `colorize(hex)`.
