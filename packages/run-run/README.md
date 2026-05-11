# 🦊 run-run

CLI toolbox to fullstack common scripts in [Variable Land](https://variable.land) 👊

## Prerequisites

- Node.js >= 24.0.0

## Toolbox

- [biome](https://biomejs.dev)
- [tsc](https://www.typescriptlang.org)
- [rimraf](https://www.npmjs.com/package/rimraf)
- [oxfmt](https://oxc.rs/docs/guide/usage/formatter.html)
- [oxlint](https://oxc.rs/docs/guide/usage/linter.html)
- [tsdown](https://tsdown.dev)

## Installation

```sh
pnpm add -D @vlandoss/run-run
```

It adds the `rr` command to your project.

## Usage

Run the help command:

```sh
pnpm rr help
```

> If you have `node_modules/.bin` on your `PATH` (e.g. via `mise` or `direnv` — see [Shell completion](#shell-completion)), you can drop the `pnpm` prefix and invoke `rr` directly.

See [`CLI.md`](./CLI.md) for the full reference (auto-generated per release).

## Shell completion

`rr` ships a `completion` subcommand that prints a shell-specific script.
Pick the option that matches your setup.

### Option A — with `mise` or `direnv` (recommended)

If your tooling puts `node_modules/.bin` on `PATH` per-project, `rr` resolves at shell startup and completion picks up new commands automatically on each new shell. Examples:

```toml
# mise.toml
[env]
_.path = ["{{config_root}}/node_modules/.bin"]
```

```sh
# .envrc (direnv)
PATH_add node_modules/.bin
```

Then add a guarded eval to your shell rc — the guard makes it a no-op when you open a shell outside any project:

```sh
# zsh — ~/.zshrc
command -v rr >/dev/null 2>&1 && eval "$(rr completion zsh)"

# bash — ~/.bashrc
command -v rr >/dev/null 2>&1 && eval "$(rr completion bash)"

# fish — ~/.config/fish/config.fish
command -v rr >/dev/null 2>&1; and rr completion fish | source
```

### Option B — without a per-project PATH manager

Cache the completion script once, then source the cached file from your shell rc. Run the generation step from inside a project that has `@vlandoss/run-run` installed:

```sh
mkdir -p ~/.cache
pnpm exec rr completion zsh  > ~/.cache/rr-completion.zsh
pnpm exec rr completion bash > ~/.cache/rr-completion.bash
pnpm exec rr completion fish > ~/.cache/rr-completion.fish
```

```sh
# zsh — ~/.zshrc
[ -f ~/.cache/rr-completion.zsh ] && source ~/.cache/rr-completion.zsh

# bash — ~/.bashrc
[ -f ~/.cache/rr-completion.bash ] && source ~/.cache/rr-completion.bash

# fish — ~/.config/fish/config.fish
test -f ~/.cache/rr-completion.fish; and source ~/.cache/rr-completion.fish
```

Regenerate the cache after upgrading `@vlandoss/run-run` to pick up new commands.

### Prerequisite

The [`usage`](https://usage.jdx.dev) CLI must be on your `PATH` (it powers completion at runtime). Install via one of:

```sh
mise use -g usage
brew install usage
```

## Troubleshooting

To enable debug mode, set the `DEBUG` environment variable to `run-run:*` before running *any* command.

```sh
DEBUG=run-run:* pnpm rr <command>
```
