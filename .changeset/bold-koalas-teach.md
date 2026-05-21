---
"@vlandoss/vland": minor
---

Templates and `vland init` overhauled to align with the `@rrlab/*` ecosystem:

- Every template now ships `@rrlab/cli` as the single CLI entry point and an empty `run-run.config.mts` (`plugins: []`). Per-tool config files (`biome.json`, `tsconfig.json`, `tsdown.config.ts`) and their devDeps are no longer bundled — run `rr plugins add biome | ts | tsdown` in the new project to opt in. Tool-related `package.json` scripts (`lint`, `format`, `test:types`, `check`, `build`) are removed — `rr` is meant to be typed directly in the terminal (the templates' `mise.toml` puts `./node_modules/.bin` on `PATH`). Lefthook + CI workflows + `prepublishOnly` call `pnpm rr <cmd>` directly.
- New `--visibility <private|public>` flag (interactive prompt for the library template). Library scope derives from visibility: private → `@variableland/<name>` + `private: true`; public → `@vlandoss/<name>`.
- Monorepo apps now use the bare `<projectName>-<app>` naming convention (`yoppy-api`, `yoppy-web`); packages stay scoped (`@yoppy/types`). Backend templates set `private: true` at root.
- Removed the `--pm` flag and package-manager auto-detection — `vland` is opinionated and uses pnpm exclusively.
- Library `release` npm-script removed (the developer never runs `pnpm release`; CI invokes `pnpm changeset publish` directly).
