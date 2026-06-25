---
"@rrlab/vitest-plugin": minor
"@rrlab/cli": minor
---

Add `@rrlab/vitest-plugin` and the `rr test` command — a passthrough to vitest.

`rr test` forwards every flag and argument (and `--help`) straight to vitest, and loads an env file first (the first existing of `.env.test`, then `.env`; override with `--env <path>`). This adds a streaming `test` capability to the kernel (`TestRunner`, `ToolService.runStreamed`) alongside the existing captured verbs.
