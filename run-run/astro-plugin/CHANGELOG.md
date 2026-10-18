# @rrlab/astro-plugin

## 0.1.1

### Patch Changes

- [#278](https://github.com/withvariablelab/dx/pull/278) [`b463230`](https://github.com/withvariablelab/dx/commit/b463230abf9ead24c3c5a5a89c1f94647df64d00) Thanks [@rqbazan](https://github.com/rqbazan)! - The README follows the Variable Lab README structure, and the tarball now includes the MIT `LICENSE`.
- Updated dependencies [[`b463230`](https://github.com/withvariablelab/dx/commit/b463230abf9ead24c3c5a5a89c1f94647df64d00)]:
  - @variablelab/clibuddy@0.8.1

## 0.1.0

### Minor Changes

- [#270](https://github.com/withvariablelab/dx/pull/270) [`8febcf5`](https://github.com/withvariablelab/dx/commit/8febcf53d98964d8c475e125b706ff81bd682fec) Thanks [@rqbazan](https://github.com/rqbazan)! - Add `@rrlab/astro-plugin`, which provides the `typecheck` capability through `astro check`.
  
  In an Astro project, `rr tsc` and `rr check` now type-check `.astro` files along with the rest of the project, so they replace a separate `astro check` step. `rr plugins add astro` installs it.
