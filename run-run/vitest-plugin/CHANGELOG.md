# @rrlab/vitest-plugin

## 0.1.0

### Minor Changes

- [#244](https://github.com/variableland/dx/pull/244) [`42a8eb0`](https://github.com/variableland/dx/commit/42a8eb0aa22edc43fc200ac3329527ec1019c3c3) Thanks [@rqbazan](https://github.com/rqbazan)! - Add `@rrlab/vitest-plugin` and the `rr test` command — a passthrough to vitest.

  `rr test` forwards every flag and argument (and `--help`) straight to vitest, and loads an env file first (the first existing of `.env.test`, then `.env`; override with `--env <path>`). This adds a streaming `test` capability to the kernel (`TestRunner`, `ToolService.runStreamed`) alongside the existing captured verbs.
