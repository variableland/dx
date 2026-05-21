# 001: Switch all plugins to `peerDependency` for their wrapped tool

- **Date**: 2026-05-19
- **Status**: Applied
- **Files affected**: each `run-run/plugin-*/package.json`

## Context

An earlier plan split plugins by how they declared their wrapped tool: Biome/oxc/tsdown bundled the binary as a direct `dependency`, while ts/eslint declared it as a `peerDependency`. The rationale was self-contained vs. ecosystemic tools.

In practice this asymmetry leaks into the user-facing experience — "why does `plugin-biome` work one way and `plugin-ts` another?" — and since `rr plugins add` writes the tool to the host project's `package.json` either way, the distinction never reaches the user as anything but inconsistency.

## Options considered

- **A**: Keep the hybrid rule (biome/oxc/tsdown bundle; ts/eslint peer).
- **B**: All plugins declare their tool as `peerDependency` + `peerDependenciesMeta` + `devDependency`.

## Decision: Option B (all-peer)

- Consistency from the user's perspective: every plugin behaves identically.
- Single source of truth for the tool's version: the host project's `package.json` owns it.
- pnpm's `autoInstallPeers=true` (default since v7) makes `pnpm add -D @rrlab/plugin-biome` install the peer transparently. npm/yarn users go through `rr plugins add`, the canonical path documented in each plugin's README.
- Smaller plugin tarball — just the plugin code, no bundled binary.
- Enables decision 002 (no bin shims) because the tool ends up in the host's `node_modules/.bin/` natively, with no shim needed.

## Alternatives rejected

- Option A (hybrid): the "self-contained vs ecosystemic" distinction is internal plumbing leaking into user-visible behaviour. Worth eliminating now while no plugins are published.

## Notes for human review

`rr plugins add`'s install hook (in `run-run/cli/src/program/commands/plugins.ts`) writes the peer to the user's `package.json` declaratively. Each plugin's `setup()` validates the peer is reachable and throws an actionable error if not.
