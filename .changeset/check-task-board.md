---
"@rrlab/cli": minor
"@rrlab/biome-plugin": minor
"@rrlab/oxc-plugin": minor
"@rrlab/ts-plugin": minor
"@rrlab/tsdown-plugin": minor
---

Rework the output of `rr check`, `lint`, `format`, `jsc`, `tsc`, `pack`, and `doctor` into a live task board. Each tool runs captured and renders a spinner row that collapses to ✔/✖, with its output flushed below (dimmed on a pass, full brightness on a failure) and a one-line summary. In a monorepo, `tsc` shows one row per package so it's clear which one failed.

Every command and subcommand now reads identically: a single-target row is `<command> (<tool>) · <package>` (e.g. `lint (biome) · dx`, `doctor (biome) · dx`), a fan-out is `<command> (<tool>) · <n> packages`, and each run shows the underlying `$ <command>` it executed. `rr check` runs `jsc` then `tsc` as framed sections and closes with one overall verdict (`✔ check passed` / `✖ check failed · <section>`). The verdict is always the tool's exit code — never parsed from output. `clean` stays logger-based (it has no pass/fail verdict).

Plugin SDK: the capability verbs plus `Packer.pack()` and `Doctor.doctor()` now return a `RunReport` (`{ ok, output }`); `DoctorResult`/`DoctorOutput` are removed. See decisions 012–014.
