---
"@vlandoss/loggy": minor
"@vlandoss/clibuddy": minor
"@vlandoss/localproxy": minor
"@vlandoss/starter": minor
"@vlandoss/run-run": minor
---

feat(clibuddy): add `dirnameOf` / `filenameOf` helpers; simplify CLI bin entries

- **New helpers in `@vlandoss/clibuddy`**: `dirnameOf(import.meta)` and `filenameOf(import.meta)`. They prefer the native `import.meta.dirname` / `import.meta.filename` (Node 20.11+) and fall back to `dirname(fileURLToPath(import.meta.url))` otherwise — so packages can keep `engines.node` at `>=20.0.0` without losing ergonomics.
- **CLI bin entries simplified.** `bin.mjs` / `bin.ts` no longer compute `binDir` and pass it through a `main()` function — they just `import "./src/run.ts"` (or `./dist/run.mjs` for the published artifact). The new `src/run.ts` is now the executable entry: it resolves its own `BIN_DIR` via `dirnameOf(import.meta)` and starts the program. Affects `run-run`, `localproxy`, and `starter`. The `bin` field in each `package.json` is unchanged, so nothing changes for consumers running the CLIs.
