# 🦊 run-run

CLI toolbox to fullstack common scripts in Variable Land 👊

## Prerequisites

- Bun >= 1.2.4

## Toolbox

- [Biome](https://biomejs.dev)
- [TSC](https://www.typescriptlang.org)
- [rimraf](https://www.npmjs.com/package/rimraf)

## Installation

```sh
pnpm add @vlandoss/run-run
```

It will adds the `rr` and `run-run` command to your project

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

Additionally, there is an special command to display `package.json` information:

```sh
rr info:pkg --help
```
