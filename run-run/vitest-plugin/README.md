# @rrlab/vitest-plugin

Adds the `test` capability to [`@rrlab/cli`](../cli) — a thin passthrough to [vitest](https://vitest.dev).

```bash
rr plugins add vitest
```

## Usage

`rr test` forwards every flag and argument straight to vitest, so anything you'd type after `vitest` works unchanged:

```bash
rr test                      # run the suite
rr test run --coverage       # forwarded verbatim
rr test --project unit       # forwarded verbatim
rr test --help               # vitest's own help
rr test doctor               # health check (reserved by rr, not forwarded)
```

### Env files

By default `rr test` loads an env file before running, picking the **first that exists**:

1. `.env.test`
2. `.env`

Override it with `--env` (must come before the forwarded args):

```bash
rr test --env=.env.ci run
```

> It's `--env`, not `--env-file`: Node's early `--env-file` scanner would grab
> that exact token off the `rr` process before the CLI could read it.

An explicit `--env` file that doesn't exist is an error (typo protection); the
defaults above are loaded only when present.
