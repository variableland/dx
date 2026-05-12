---
"@vlandoss/run-run": patch
---

Internal migration to the new tinyexec-backed `ShellService` (see `@vlandoss/clibuddy`).

- `ToolService.exec` now accepts only `string[]` (the `string` overload that silently word-split on spaces is gone). All tool services (`biome`, `oxlint`, `oxfmt`, `tsdown`, `tsc`) build their flags as arrays so each flag survives as its own argv entry.
- Bin resolution moves into the base `ToolService`: subclasses declare `{ pkg, bin?, ui }` in the constructor and the base resolves the absolute path via `resolvePackageBin` (memoised). The verbose `$ <bin> <args>` line is preserved via the `display` option so users still see `$ biome check ...` instead of an absolute resolved path. Resolving to the absolute path bypasses the `node_modules/.bin/<bin>` shims that run-run itself publishes (`tools/biome` etc.), which would otherwise loop back through `rr tools <bin>` indefinitely.
- `tscheck` runs `pretsc` / `pretypecheck` package scripts through `shell: true` so they can use `&&`, pipes, and env-var substitution.
- Bump `tsdown` from `0.21.10` to `0.22.0`. `tsdown@0.21.x` depends on `unrun@^0.2.37`, which pnpm resolved to `0.2.38` — whose published tarball is missing `dist/`, producing `WARN Failed to create bin … unrun` on every install. `tsdown@0.22.0` dropped `unrun` from `dependencies` (now an optional peer), erradicating the warning.

Tests reorganised into one e2e file per command (`cli`, `jsc`, `lint`, `format`, `tsc`, `build-lib`). Each spawns the real `rr` binary against a temp fixture (`makeFixture` helper) and asserts on observable output, so we no longer rely on a `clibuddy/test-helpers` mock.

End-user CLI behaviour is unchanged.
