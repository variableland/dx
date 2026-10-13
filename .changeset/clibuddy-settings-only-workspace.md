---
"@variablelab/clibuddy": patch
"@rrlab/cli": patch
---

Treat `pnpm-workspace.yaml` as a workspace only when its `packages` array lists something other than the root.

Since pnpm 10, single-package repos use `pnpm-workspace.yaml` for settings such as `minimumReleaseAge` or `catalog`, with no `packages` or with only the root (`packages: ["."]`). `Pkg.isMonorepo()` no longer reports such a repo as a monorepo, and `getWorkspaceProjects()` falls back to `package.json` workspaces instead of throwing `Invalid workspace patterns`. In those repos `rr tsc` (and so `rr check`) typechecks the root package instead of failing or skipping it, and `rr plugins add`/`remove` target the current package instead of the workspace root.
