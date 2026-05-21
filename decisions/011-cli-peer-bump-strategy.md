# 011: How should bumps of `@rrlab/cli` propagate to the 4 official plugins via Changesets?

- **Date**: 2026-05-21
- **Status**: Applied
- **Files affected**: `.changeset/config.json`, `run-run/{biome,oxc,ts,tsdown}-plugin/package.json` (peer range), `.changeset/plugin-only-narrowing.md` (CLI bump escalated to major)

## Context

The 4 official plugins declare `@rrlab/cli` as a `peerDependency`. With Changesets' defaults (`onlyUpdatePeerDependentsWhenOutOfRange: false`), any non-`patch` bump of a peer automatically promotes its dependents to `major` — that lives in `@changesets/assemble-release-plan` `determine-dependents.ts#shouldBumpMajor`. The result was that even a routine `minor` to `@rrlab/cli` cascaded into 4 plugin majors, which doesn't reflect the actual contract: a minor or patch of the kernel never breaks the plugin SDK.

The default is also entangled with the `workspace:*` range, which Changesets resolves to the *exact* old version when reading the peer range, so the "is the new version still in range?" check would always fail anyway.

## Options considered

- **A**: Move `@rrlab/cli` out of `peerDependencies` into `dependencies` in each plugin. With `updateInternalDependencies: "patch"`, any CLI bump becomes a plugin patch automatically. Loses the peer contract (each plugin would carry its own copy in installs that don't deduplicate).
- **B**: Bump `@rrlab/cli` to `1.0.0`, switch the plugin peer range to `workspace:^` (publishes as `^<cli-version>`), and turn on the experimental `onlyUpdatePeerDependentsWhenOutOfRange: true`. CLI minors land in-range and stop propagating to plugin majors; CLI majors still escape `^1.x.y` and propagate as intended.
- **C**: Replace `workspace:*` with a literal manual range (`>=0.0.0 <2.0.0`) in each plugin's peer, then enable `onlyUpdatePeerDependentsWhenOutOfRange: true`. Works pre-1.0, but the range is maintained by hand.

## Decision: Option B

- `1.0.0` is honest about where the contract sits. The declarative-plugin-shape change in this PR is itself a breaking edit to the kernel↔plugin SDK, so the CLI exiting `0.x` here is congruent with the change, not a marketing decision.
- `workspace:^` + `onlyUpdatePeerDependentsWhenOutOfRange: true` is the smallest delta that gives the desired semantics: patches/minors of the CLI keep the plugins as-is, majors propagate to plugin majors. Both knobs are already supported by Changesets — no fork, no custom tooling.
- The plugin contract being kernel-internal (per `CLAUDE.md`) means the only consumers of the peer relationship are the 4 official plugins; we can keep the peer-vs-dependency distinction because pnpm + workspaces makes both resolve to the same workspace package.

Resulting matrix once on 1.x:

| CLI bump | Effect on plugins |
|---|---|
| `patch` `1.0.0 → 1.0.1` | no bump — `nextRelease.type === "patch"` short-circuits and `^1.0.0` still satisfies |
| `minor` `1.0.0 → 1.1.0` | no bump — `^1.0.0` still satisfies, so out-of-range check fails |
| `major` `1.0.0 → 2.0.0` | plugins go `major` — out of `^1.0.0`, contract is actually breaking |

## Alternatives rejected

- Option A: drops the peer semantics. The plugins genuinely couple to the kernel SDK; expressing that as `dependencies` would model the relationship incorrectly and lose `peerDependencies`' duplicate-detection guarantees for hosts.
- Option C: works, but introduces a manually-maintained range string per plugin. Option B uses `workspace:^` which Changesets already resolves at publish-time, so no per-release upkeep.

## Notes for human review

- `___experimentalUnsafeOptions_WILL_CHANGE_IN_PATCH` is the actual config key — its name advertises that the API may change in a future patch release. If Changesets renames it, the migration is mechanical.
- `updateInternalDependents` (the sibling experimental key) is left at the default `"out-of-range"`. With `workspace:^`, in-range CLI bumps publish no new plugin tarballs at all, which is the intended low-churn behaviour. Flipping it to `"always"` would force a plugin patch on every CLI release.
- For *this* PR specifically the plugins still publish as `1.0.0` because the changeset declares them `major` explicitly (the declarative-plugin-shape change is breaking for plugin authors), not because the cascade promoted them.
