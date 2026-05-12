---
"@vlandoss/run-run": patch
---

Internal migration to the new tinyexec-backed `ShellService` (see `@vlandoss/clibuddy`).

- `ToolService.exec` now accepts only `string[]` (the `string` overload that silently word-split on spaces is gone). All tool services (`biome`, `oxlint`, `oxfmt`, `tsdown`, `tsc`) build their flags as arrays so each flag survives as its own argv entry.
- All tool services resolve their binary via `resolveBinPath` and pass the absolute path to `ShellService.run`. Doing so bypasses the `node_modules/.bin/<bin>` shims that run-run itself publishes (`tools/biome` etc.), which would otherwise loop back through `rr tools <bin>` indefinitely.
- The verbose `$ <bin> <args>` line is preserved by passing `display: <friendly-name>` so users still see `$ biome check ...` instead of an absolute resolved path.
- `tscheck` runs `pretsc` / `pretypecheck` package scripts through `shell: true` so they can use `&&`, pipes, and env-var substitution.

Tests reorganised into one e2e file per command (`cli`, `jsc`, `lint`, `format`, `tsc`, `build-lib`). Each spawns the real `rr` binary against a temp fixture (`makeFixture` helper) and asserts on observable output, so we no longer rely on a `clibuddy/test-helpers` mock.

End-user CLI behaviour is unchanged.
