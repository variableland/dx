# DX

Monorepo to hold tools made for DX ⚡

## Packages


| Name    | Description                                                  | Documentation                                                                        |
| ------- | ------------------------------------------------------------ | ------------------------------------------------------------------------------------ |
| vland   | 🦉 The CLI to init a new project in Variable Land             | [vland](./packages/vland/README.md) ([CLI reference](./packages/vland/CLI.md))       |
| run-run | 🦊 CLI toolbox to fullstack common scripts in Variable Land   | [run-run](./packages/run-run/README.md) ([CLI reference](./packages/run-run/CLI.md)) |
| config  | ⚙️ Shared configuration presets for tooling (biome, tsc, etc) | [config](./packages/config/README.md)                                                |


## Usage

To get started with any package, navigate to the respective package directory and follow the installation and usage instructions in its README.

## Development

### Requirements

To use this monorepo, you need to have the following tools installed:

- [Node.js](https://nodejs.org) >= 24.0.0
- [pnpm](https://pnpm.io) >= 10.0.0
- [mise](https://mise.jdx.dev) >= 2025.3.3 <sup>(optional)</sup>

### Setup

1. Clone the repository:

   ```bash
   git clone git@github.com:variableland/dx.git
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Run tests:

   ```bash
   pnpm test
   ```

### Commands

This monorepo uses [Turborepo](https://turbo.build/repo/docs) to manage tasks. Here are some useful commands:

- `pnpm build` - Build all packages
- `pnpm test` - Run tests for all packages

Additionally, the monorepo itself uses the CLIs [`run-run`](./packages/run-run/README.md) and [`vland`](./packages/vland/README.md):

- `pnpm rr` - Run the `run-run` CLI in development mode
- `pnpm vland` - Run the `vland` CLI in development mode

If you have [mise](https://mise.jdx.dev) installed, you can use the following commands directly:

- `rr` - Run the `run-run` CLI in development mode
- `vland` - Run the `vland` CLI in development mode

### Release

This monorepo uses [Changesets](https://github.com/changesets/changesets) to manage releases. The [Changesets bot](https://github.com/changesets/bot) is also installed in the repository.

**Preview Release**:

To preview changes in any package, create a pull request using the branch pattern `feat/*` or `fix/*` or add a label `preview` to the PR. This triggers a special GitHub workflow that publishes the package with the changes to the npm registry under the tag `pr-<PR_NUMBER>`. To preview your changes, install the package with the corresponding tag:

```bash
pnpm add @vlandoss/<package>@pr-123
```
