# @rrlab/vitest-plugin

## 0.1.2

### Patch Changes

- Updated dependencies [[`3b95217`](https://github.com/withvariablelab/dx/commit/3b95217c49dd32b366516085dfd5d3096d4b30fe)]:
  - @variablelab/clibuddy@0.7.3

## 0.1.1

### Patch Changes

- [#248](https://github.com/withvariablelab/dx/pull/248) [`e02f589`](https://github.com/withvariablelab/dx/commit/e02f589351c8335f678c5d4ac2e9dcdfe3db187e) Thanks [@rqbazan](https://github.com/rqbazan)! - Republish from the `withvariablelab/dx` repository: `repository`, `homepage`
  and `bugs` now point at `withvariablelab/dx`, and packages that depended on
  `@vlandoss/clibuddy` / `@vlandoss/loggy` now depend on the renamed
  `@variablelab/clibuddy` / `@variablelab/loggy`. No behavior changes.
- Updated dependencies [[`e02f589`](https://github.com/withvariablelab/dx/commit/e02f589351c8335f678c5d4ac2e9dcdfe3db187e)]:
  - @variablelab/clibuddy@0.7.2

## 0.1.0

### Minor Changes

- [#244](https://github.com/variableland/dx/pull/244) [`42a8eb0`](https://github.com/variableland/dx/commit/42a8eb0aa22edc43fc200ac3329527ec1019c3c3) Thanks [@rqbazan](https://github.com/rqbazan)! - Add `@rrlab/vitest-plugin` and the `rr test` command — a passthrough to vitest.

  `rr test` forwards every flag and argument (and `--help`) straight to vitest, and loads an env file first (the first existing of `.env.test`, then `.env`; override with `--env <path>`). This adds a streaming `test` capability to the kernel (`TestRunner`, `ToolService.runStreamed`) alongside the existing captured verbs.
