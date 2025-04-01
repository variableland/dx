# DX

Monorepo to hold tools made for DX in Variable Land 👊

## Packages

Check the documentation [here](./docs/README.md).

## Usage

To get started with any package, navigate to the respective package directory and follow the installation and usage instructions in its README.

## Development

### Requirements

To use this monorepo, you need to have the following tools installed:

- [Bun](https://bun.sh) >= 1.2.4
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
   pnpm run test:static
   pnpm run typecheck
   pnpm run test
   ```

### Commands

This monorepo uses [Turborepo](https://turbo.build/repo/docs) to manage tasks. Here are some useful commands:

- `pnpm run build` - Build all packages
- `pnpm run typecheck` - Run type checking for all packages
- `pnpm run test` - Run tests for all packages
- `pnpm run test:coverage` - Run tests with coverage for all packages

Additionally, the monorepo itself uses the CLIs [`run-run`](./packages/run-run/README.md) and [`starter`](./packages/starter/README.md):

- `pnpm run rr` - Run the `run-run` CLI in development mode
- `pnpm run vland` - Run the `starter` CLI in development mode

If you have [mise](https://mise.jdx.dev) installed, you can use the following commands directly:

- `rr` - Run the `run-run` CLI in development mode
- `vland` - Run the `starter` CLI in development mode

### Release

This monorepo uses [Changesets](https://github.com/changesets/changesets) to manage releases. The [Changesets bot](https://github.com/changesets/bot) is also installed in the repository.

**Preview Release**:

To preview changes in any package, create a pull request using the branch pattern `feat/*` or `fix/*`. This triggers a special GitHub workflow that publishes the package with the changes to the npm registry under the tag `pr-<PR_NUMBER>`. To preview your changes, install the package with the corresponding tag:

```bash
pnpm install @variableland/<package>@pr-123
```
