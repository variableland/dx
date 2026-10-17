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

`rr` loads `run-run.config.{ts,mts}` with Node's native type stripping, which is on by default only from Node 22.18.0. Without it `rr` stops with `ERR_UNKNOWN_FILE_EXTENSION` as soon as it reads the config: Node 20 has no type stripping at all, and 22.6 to 22.17 only behind `--experimental-strip-types`. So the old `>=20.0.0` was never true for `rr`. CI now tests 22.18.0 and Node 24.
