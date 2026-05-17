---
"@vlandoss/run-run": minor
---

Rename `rr test:static` to `rr check`, and drop the `check` alias from `rr jsc`.

`check` better reflects what the command does: it runs the JS check (`jsc`, Biome) and the TS check (`tsc`) together, without "test" implying execution. The previous `check` alias on `jsc` was just a shortcut for Biome lint+format and got in the way of this clearer naming.

**Breaking:**

- `rr test:static` is gone. Use `rr check` instead.
- `rr check` no longer runs only the JS check. For that, use `rr jsc` (or its `jscheck` alias).
