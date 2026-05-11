# 🦉 vland

The CLI to init a new project in Variable Land 👊

## Prerequisites

- Node.js >= 20.0.0

## Installation

Run it directly with `npx`:

```sh
npx @vlandoss/vland init
```

…or install it globally:

```sh
pnpm add -g @vlandoss/vland
vland init
```

## Usage

```sh
vland init                        # interactive
vland init my-app -t library      # explicit template
vland init my-app -t backend --no-install --no-git
```

See [`CLI.md`](./CLI.md) for the full reference (auto-generated per release).

### Templates

| Template   | What you get |
|------------|--------------|
| `library`  | A standalone TypeScript library with tsdown, Vitest, biome, Changesets release workflow. |
| `backend`  | An Elysia (`@elysiajs/node`) backend with evlog, Vitest, Dockerfile, CI shape. |
| `monorepo` | pnpm + Turbo workspace with an Elysia API, a Vite-React SPA, and a few internal packages. |

All templates target Node.js, use pnpm, and extend `@vlandoss/config` for biome and tsconfig.

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

When you upgrade `@vlandoss/vland`, the next shell session will pick up new commands automatically — no need to re-run anything.

## Troubleshooting

To enable debug mode, set the `DEBUG` environment variable to `vland:*` before running *any* command.

```sh
DEBUG=vland:* vland init my-app
```

To point `init` at local templates instead of fetching from GitHub (useful when developing inside this monorepo):

```sh
VLAND_TEMPLATES_DIR=/absolute/path/to/dx/templates vland init my-app -t library
```
