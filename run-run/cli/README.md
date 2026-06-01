# 🦊 run-run

CLI toolbox to fullstack common scripts in [Variable Land](https://variable.land)

## Prerequisites

- Node.js >= 20.0.0

## Installation

```sh
pnpm add -D @rrlab/cli
```

It adds the `rr` command to your project.

## Usage

Run the help command:

```sh
pnpm rr help
```

> If you have `node_modules/.bin` on your `PATH` (e.g. via `mise` or `direnv` — see [Shell completion](#shell-completion)), you can drop the `pnpm` prefix and invoke `rr` directly.

See [`CLI.md`](./CLI.md) for the full reference (auto-generated per release).

## Plugins

`rr` is a microkernel: every tool lives in its own `@rrlab/<tool>-plugin` package. The official plugins are `biome` ([Biome](https://biomejs.dev)), `oxc` ([oxlint](https://oxc.rs/docs/guide/usage/linter.html) + [oxfmt](https://oxc.rs/docs/guide/usage/formatter.html)), `ts` ([tsc](https://www.typescriptlang.org)) and `tsdown` ([tsdown](https://tsdown.dev)). Install one with:

```sh
rr plugins add biome
```

This installs `@rrlab/biome-plugin` plus its peer tool and shared config, scaffolds `biome.json` if missing, and wires the plugin into `run-run.config.{ts,mts}`.

To install from a specific dist-tag (e.g. a PR preview release published as `pr-<N>`, or a custom tag), append `@<spec>`:

```sh
rr plugins add biome@pr-226   # preview tag
rr plugins add biome@next     # any dist-tag
rr plugins add biome@^0.1.0   # explicit version range (sibling configs still use latest)
```

When the spec is a dist-tag, `rr` resolves any `@rrlab/*-config` sibling at the same tag, falling back to `latest` if the registry doesn't have the sibling at that tag.

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

Cache the completion script once, then source the cached file from your shell rc. Run the generation step from inside a project that has `@rrlab/cli` installed:

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

Regenerate the cache after upgrading `@rrlab/cli` to pick up new commands.

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
