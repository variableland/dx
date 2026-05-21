# 006: Plugin package naming — `<tool>-plugin` over `plugin-<tool>`

- **Date**: 2026-05-20
- **Status**: Applied
- **Files affected**: all 4 plugin directories renamed (`run-run/plugin-{biome,oxc,ts,tsdown}/` → `run-run/{biome,oxc,ts,tsdown}-plugin/`), their `package.json` (name + repository.directory), `run-run/cli/src/services/plugins-registry.ts` (OFFICIAL_PLUGINS map + prefix comment), `run-run/cli/src/program/missing-plugin.ts`, `run-run/cli/src/services/config-ast.ts` (docstrings), `run-run/cli/test/helpers.ts`, `run-run/cli/test/integration/plugins.test.ts`, `run-run/cli/src/services/__tests__/config-ast.test.ts`, each plugin's `src/index.ts` (error messages), `ts-plugin` + `tsdown-plugin` install test tmpDir prefixes, each plugin's README, the configs' READMEs/package.json descriptions that referenced the plugin name, root + `run-run/` CLAUDE.md tables, root `README.md`, root `package.json` devDeps, root `run-run.config.mts`, `vland/templates/monorepo/README.md`.

## Context

Until 0.1.0, the 4 official plugins shipped as `@rrlab/plugin-<tool>` (`plugin-biome`, `plugin-oxc`, `plugin-ts`, `plugin-tsdown`) while the 3 shared configs shipped as `@rrlab/<tool>-config` (`biome-config`, `ts-config`, `tsdown-config`). One scope, two naming conventions side-by-side. The `0.1.0` plugin tarballs were also published broken (missing `dist/`), so no working install of the old names exists in the wild — migration cost ≈ 0.

## Options considered

- **A**: Rename plugins to `<tool>-plugin` (unify on tool-first across the scope).
- **B**: Keep `plugin-<tool>`, rename configs to `config-<tool>` (unify on role-first across the scope).
- **C**: Do nothing — accept the two conventions.

## Decision: Option A

The single argument against A is "follow the npm plugin-naming convention" (Babel/Vite/Nuxt/ESLint use `plugin-<name>`). That convention exists to help **third-party plugin authors** discover and name their packages. The plugin contract here is kernel-internal (`run-run/CLAUDE.md` → "Plugin contract is kernel-internal") — that audience doesn't exist for `@rrlab/*`. Once you nullify that argument, the trade-off becomes "two conventions for two categories" (C) vs. "one convention across the scope" (A) — and consistency wins. B is strictly worse than A on simplicity grounds: `config-<tool>` is a non-idiom for config packages, and `ts-config` name-matches `tsconfig.json` semantically.

End users interact with plugins via the kernel's alias map (`rr plugins add biome`), not the full package name — `OFFICIAL_PLUGINS` in `plugins-registry.ts` is the only runtime coupling to the name, plus the prefix-derivation comment for hypothetical third-party plugins. Internal docs and code refer to plugins by short name (`biome`, `tsdown`), so the prefix order is mostly invisible day-to-day; what's visible is `ls run-run/`, which now groups every tool's `<tool>-config/` + `<tool>-plugin/` directories adjacent to each other.

## Alternatives rejected

- **Option B** (rename configs): `config-<tool>` is a non-idiom; nobody publishes `config-tailwind`. Drags `ts-config` (which name-matches `tsconfig.json`) into ugliness. Strictly worse than A.
- **Option C** (do nothing): The "small but permanent cognitive tax" of two conventions only pays off if it buys discoverability for third parties. With a kernel-internal contract it buys nothing.

## Notes for human review

- The 4 broken `@rrlab/plugin-<tool>@0.1.0` tarballs (and `@rrlab/tsdown-config@0.0.1`, broken for the same reason) were unpublished from npm within the 72-hour window. The package names are permanently reserved at that version, which is fine — we won't reuse them.
- The new names should be squatted on npm with empty `0.0.0` placeholders before someone else can take them. Includes `@rrlab/eslint-plugin` (already in `OFFICIAL_PLUGINS` even though the plugin isn't shipped yet).
- Historical references in earlier decisions (`decisions/001`, `decisions/003`, `decisions/005`) still say `@rrlab/plugin-<tool>` — that's frozen history of decisions made under those names. The plugins' own `CHANGELOG.md` files were wiped along with the unpublished releases; the working packages' CHANGELOGs (cli, biome-config, ts-config, clibuddy, loggy) keep the old plugin-name references because their prose accurately describes the state at their release. Future readers should treat any `@rrlab/plugin-<tool>` mention in pre-006 files as equivalent to today's `@rrlab/<tool>-plugin`.
