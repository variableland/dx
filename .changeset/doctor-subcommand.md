---
"@vlandoss/run-run": minor
"@vlandoss/clibuddy": minor
"@vlandoss/localproxy": patch
---

feat(run-run): add `doctor` subcommand to all tool-backed commands

Each command that wraps an external tool (`jsc`, `tsc`, `lint`, `format`, `build:lib`) now exposes a `doctor` subcommand that verifies the underlying tool is available and working correctly. Example: `rr jsc doctor`.

- Adds `ToolService` base class with a `doctor()` method that runs `<bin> --help` and returns `{ ok, output }`
- Adds `TscService` to wrap the `tsc` binary via `ToolService`
- Adds `createDoctorSubcommand` helper used by all five commands
- Fixes `ToolService.#shell()` to not override the parent shell's `cwd` when no explicit cwd is given
- Fixes `ToolService.#getPreferLocal()` to catch errors from `getBinDir()` gracefully

feat(clibuddy): add `ShellService.mute()` method

Adds a convenience `mute()` method to `ShellService` that combines `quiet()` (verbose: false) with `stdio: "pipe"`, used internally by the doctor flow to capture tool output without printing it.

fix(localproxy): correct internal import path alias (`#/*` → `#src/*`)
