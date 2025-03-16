# 🦊 run-run

CLI toolbox to fullstack common scripts in Variable Land 👊

## Prerequisites

- Node.js >= 20

## Toolbox

- [Biome](https://biomejs.dev)
- [TSC](https://www.typescriptlang.org)
- [Plop.js](https://plopjs.com)

## Installation

```sh
pnpm add -g @variableland/run-run
```

It will adds the `rr` and `run-run` command to your system path.

## Usage

> [!NOTE]
> The documentation is WIP

Run the help command:

```sh
rr help
```

## Troubleshooting

To enable debug mode, set the `DEBUG` environment variable to `run-run:*` before running *any* command.

```sh
DEBUG=run-run:* rr help
```

Additionally, there is an special command to display package information:

```sh
rr info:pkg --help
```
