# 010: Should `TOOL_VERSIONS` carry a separate `peer` field, or derive peer ranges from each plugin's `package.json#peerDependencies`?

- **Date**: 2026-05-21
- **Status**: Applied
- **Files affected**: `run-run/{biome,oxc,ts,tsdown}-plugin/src/tool-versions.ts`, the matching `src/__tests__/tool-versions.test.ts` in each plugin

## Context

Each official plugin (`@rrlab/{biome,oxc,ts,tsdown}-plugin`) used to declare per-tool versions in two places — `src/tool-versions.ts` with `{ install, peer }` fields, and `package.json#peerDependencies`. The per-plugin `tool-versions.test.ts` asserted exact-string equality between `peer` and `peerDependencies[name]`, so the two stayed in sync; but `peer` was never consumed anywhere at runtime (the kernel's bin-probe message names the missing package without quoting a range). The result was two sources of truth where only one was load-bearing, and version drift had set in: `oxfmt` and `oxlint-tsgolint` carried stale `install` ranges (`^0.30.0` and `^0.15.0` respectively) while npm latest was many minors ahead, hidden by the fact that 0.x caret semver doesn't allow minor bumps.

## Options considered

- **A**: Status quo — leave both fields, bump them in lock-step manually. Cheap today, but the drift recurs.
- **B**: Add a Renovate `customManagers` rule that pattern-matches `install`/`peer` strings in `tool-versions.ts` and bumps both files in one PR. Solves drift but adds repo-level automation config that has to be maintained alongside the code.
- **C**: Drop `peer` from `TOOL_VERSIONS`, leave only `install`. Treat `package.json#peerDependencies` as the single source of truth for the peer contract (npm enforces it anyway). Rewrite the parity test to `semver.subset(install, peerDependencies[name])` so an `install` range that escapes the peer contract is caught in CI.

## Decision: Option C

`peer` was dead code — the parity test was the only consumer, and it was just guarding internal consistency between two redundant fields. Eliminating it collapses the per-tool data model to one prescriptive field (`install`, used by `rr plugins add`'s `nypm.addDependency` call) and lets npm's existing `peerDependencies` mechanism own the contract. `semver.subset(install, peer)` is a stronger invariant than string-equality with `peer` was: it actually checks that the prescribed install range falls inside what the plugin claims to support, which is the semantic property that mattered all along. Renovate (option B) remains compatible — its native `package.json` manager handles `peerDependencies` and `devDependencies` directly, leaving `install` as the only spot that needs ad-hoc bumps or a small `customManagers` rule later.

## Alternatives rejected

- Option A: doesn't solve the recurring drift — the 0.x semver trap (`^0.X.Y` ≡ `>=0.X.Y <0.(X+1).0`) silently strands the install range any time upstream cuts a minor.
- Option B: solves drift but pre-commits to a Renovate-specific automation. Option C is a code-side fix that composes with B later if/when Renovate is enabled; doing B without C still leaves the dead `peer` field and the weaker string-equality test.

## Notes for human review

- The `install` range is now the only prescriptive value per tool. For 0.x packages the maintainer should usually pin with `^0.X.Y` matching the latest minor on npm; for ≥1.x packages the caret behaves intuitively.
- `@types/node` lives in `TOOL_VERSIONS` (used by `ts-plugin`'s `install()` when `presetInfo.needsNode`) but has no corresponding `peerDependencies` entry. The new test skips entries without a peer-side counterpart — `@types/node` is an install-time convenience, not a contract.
