# loggy

`@variablelab/loggy` is the logger of [run-run](https://github.com/withvariablelab/dx/tree/main/run-run/cli) and [vland](https://github.com/withvariablelab/dx/tree/main/vland/cli). It writes messages through [consola](https://github.com/unjs/consola), and debug output through [debug](https://github.com/debug-js/debug) under a namespace, which `DEBUG=<namespace>:*` turns on. It is published because `@rrlab/cli` and `@variablelab/vland` depend on it, and it isn't meant for use outside them.

## Install

```sh
pnpm add @variablelab/loggy
```

It needs Node 22.18 or later.

## License

[MIT](https://github.com/withvariablelab/dx/blob/main/LICENSE).

<p align="center">
  <a href="https://lab.variable.land"><img src="https://cdn.jsdelivr.net/gh/withvariablelab/brand@v0.3.1/.github/readme/logo.svg" width="24" alt="" align="absmiddle">&nbsp;Variable Land</a>
</p>
