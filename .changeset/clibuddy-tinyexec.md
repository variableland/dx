---
"@vlandoss/clibuddy": minor
---

**Breaking:** Replace `zx` with `tinyexec` and redesign `ShellService` around array-based exec.

The previous tagged-template API (`shell.$\`...\``) and its surrounding helpers (`quote`, `isRaw`, `defaultQuote`, `getPreferLocal`, `localBaseBinPath`, `mute()`, `quiet()`, `isProcessOutput`, `./test-helpers` export) are gone. They duplicated zx internals, introduced a quoting bug for whitespace strings, and surfaced inconsistent `node_modules/.bin` resolution.

New surface:

- `shell.run(cmd, args, opts?)` — streams stdio to the terminal and prints `$ <cmd> <args>` in verbose mode. Throws `NonZeroExitError` on non-zero exit by default.
- `shell.runCaptured(cmd, args, opts?)` — silent, returns the captured `Output { stdout, stderr, exitCode }`. Same throw-by-default semantics.
- `shell.at(cwd)` / `shell.child(opts)` — child shells with merged options.
- `RunOptions`: `cwd`, `env`, `verbose`, `throwOnError`, `shell` (pass-through `shell: true` for `&&`/pipes), `stdin`, `display` (override the verbose-printed name without affecting what's spawned).
- `resolvePackageBin(pkg, { from, binName? })` — async resolver that returns the absolute path to an installed package's binary, tolerating restrictive `exports` maps (oxlint) and packages without `main`/`exports` at all (`@biomejs/biome`). Memoised per `(pkg, from, binName)`.
- `isNonZeroExitError(value)` — replaces `isProcessOutput`.

`tinyexec` automatically prepends every parent `node_modules/.bin` to `PATH`, so `localBaseBinPath` / `getPreferLocal` are no longer needed.

New dependencies: `tinyexec` (replaces `zx`), `memoize` (for `resolvePackageBin`).

**Migration**

- `await shell.$\`git init\`` → `await shell.run("git", ["init"])`
- `await shell.$\`git config\`.nothrow()` → `await shell.runCaptured("git", ["config", ...], { throwOnError: false })`
- `shell.mute()` → call `runCaptured` instead (silent by default).
- `createShellService({ localBaseBinPath: [dir] })` → drop the option; tinyexec walks up automatically.
- `isProcessOutput(err)` → `isNonZeroExitError(err)`.
- Tools wrapping a npm package (e.g. biome, tsdown) should resolve the bin path via `resolvePackageBin` and pass it as the `cmd` with `display: "<friendly-name>"` to avoid `node_modules/.bin/<name>` shim loops.
