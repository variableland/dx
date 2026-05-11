# ⚡ vland

The CLI to init a new project in Variable Land 👊

> [!CAUTION]
> `@vlandoss/starter` is deprecated. Use [`@vlandoss/vland`](https://github.com/variableland/dx/tree/main/packages/vland) instead — same `vland` binary, modern stack (`giget` + `@clack/prompts` + `commander`), and three first-class templates (`library`, `backend`, `monorepo`).
>
> ```sh
> pnpm add -g @vlandoss/vland
> # or one-shot:
> npx @vlandoss/vland init
> ```

## Prerequisites

- Node.js >= 24.0.0

## Installation

```sh
pnpm add -g @vlandoss/starter
```

It will adds the `vland` to your global workspace

## Usage

Run the help command:

```sh
vland help
```

## Shell completion

`vland` ships a `completion` subcommand that prints a shell-specific script. Add it to your shell rc file:

```sh
# zsh — ~/.zshrc
eval "$(vland completion zsh)"

# bash — ~/.bashrc
eval "$(vland completion bash)"

# fish — ~/.config/fish/config.fish
vland completion fish | source
```

**Prerequisite:** the [`usage`](https://usage.jdx.dev) CLI must be on your `PATH` (it powers completion at runtime). Install via one of:

```sh
mise use -g usage
brew install usage
```

When you upgrade `@vlandoss/starter`, the next shell session will pick up new commands automatically — no need to re-run anything.

## Troubleshooting

To enable debug mode, set the `DEBUG` environment variable to `vland:*` before running *any* command.

```sh
DEBUG=vland:* vland <command>
```
