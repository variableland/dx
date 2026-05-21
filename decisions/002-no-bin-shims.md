# 002: No `bin` shims — neither in the kernel nor in plugins

- **Date**: 2026-05-19
- **Status**: Applied
- **Files affected**: `run-run/cli/package.json` (`bin` field reduced to `{ "rr": "./bin" }`), `run-run/cli/tools/*` (deleted)

## Context

An earlier plan had every plugin declare `bin: { <name>: "./shims/<bin>" }` that shelled out to `rr tools <bin>`. The rationale was that with bundled tool deps inside the plugin, the plugin was the only place that could surface the binary to editors (VSCode-Biome extension, etc.). With decision 001 (all-peer), the tool is installed directly in the host project, so `node_modules/.bin/<bin>` is provided by the tool package itself and the shim becomes redundant.

## Options considered

- **A**: Keep the shims — every plugin declares its own `bin` entry that proxies through `rr tools <bin>`.
- **B**: Drop shims entirely. Kernel `bin: { "rr": "./bin" }` only; plugins have no `bin` field. Editor finds `<bin>` via the tool's own `bin` declaration in the peer-installed package.

## Decision: Option B (no shims)

- The shim's original purpose (surface the binary to editors) is obsolete: with decision 001 the binary is already in `node_modules/.bin/`.
- The shim added 80–100 ms of Node startup cost per editor invocation (LSP, format-on-save). That cost disappears entirely with the peer-installed binary.
- One less artifact per plugin to maintain.
- The `rr tools <bin>` command itself was removed in the same wave — without the shim there's no need for the dispatcher either.

## Alternatives rejected

- Option A: pays a real performance cost (and a maintenance cost — one shell script per tool per plugin) for a benefit that decision 001 already delivers natively.
