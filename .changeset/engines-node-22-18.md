---
"@rrlab/cli": minor
"@rrlab/biome-plugin": minor
"@rrlab/oxc-plugin": minor
"@rrlab/ts-plugin": minor
"@rrlab/tsdown-plugin": minor
"@rrlab/vitest-plugin": minor
"@rrlab/tsdown-config": minor
"@variablelab/vland": minor
"@variablelab/clibuddy": minor
"@variablelab/loggy": minor
---

Require Node.js 22.18.0 or newer (`engines.node` was `>=20.0.0`).

`rr` loads `run-run.config.{ts,mts}` with Node's native type stripping, which is on by default only from Node 22.18.0. On older versions, including every Node 20, `rr` stops with `ERR_UNKNOWN_FILE_EXTENSION` as soon as it reads the config, so the old `>=20.0.0` was never true for `rr`. CI now tests 22.18.0 and Node 24.
