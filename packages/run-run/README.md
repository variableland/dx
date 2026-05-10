# 🦊 run-run

CLI toolbox to fullstack common scripts in Variable Land 👊

## Prerequisites

- Node.js >= 24.0.0

## Toolbox

- [Biome](https://biomejs.dev)
- [TSC](https://www.typescriptlang.org)
- [rimraf](https://www.npmjs.com/package/rimraf)

## Installation

```sh
pnpm add @vlandoss/run-run
```

It adds the `rr` command to your project.

## Usage

Run the help command:

```sh
rr help
```

See [`CLI.md`](./CLI.md) for the full reference (auto-generated per release).

## Shell completion

`rr` ships a `completion` subcommand that prints a shell-specific script. Add it to your shell rc file:

```sh
# zsh — ~/.zshrc
eval "$(rr completion zsh)"

# bash — ~/.bashrc
eval "$(rr completion bash)"

# fish — ~/.config/fish/config.fish
rr completion fish | source
```

**Prerequisite:** the [`usage`](https://usage.jdx.dev) CLI must be on your `PATH` (it powers completion at runtime). Install via one of:

```sh
mise use -g usage
brew install usage
```

When you upgrade `@vlandoss/run-run`, the next shell session will pick up new commands automatically — no need to re-run anything.

## Troubleshooting

To enable debug mode, set the `DEBUG` environment variable to `run-run:*` before running *any* command.

```sh
DEBUG=run-run:* rr <command>
```

Additionally, there is an special command to display `package.json` information:

```sh
rr info:pkg --help
```
