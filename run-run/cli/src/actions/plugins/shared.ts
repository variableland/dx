import * as clack from "@clack/prompts";
import type { InstallContext, InstallResult, UninstallContext, UninstallResult } from "#src/lib/plugin/types.ts";
import type { ContextValue } from "#src/services/context.ts";
import type { FileOpOutcome } from "#src/services/file-ops.ts";

export type AddOptions = {
  force?: boolean;
  yes?: boolean;
  dryRun?: boolean;
};

export type RemoveOptions = {
  yes?: boolean;
  dryRun?: boolean;
};

type InstallHook = (ctx: InstallContext) => Promise<InstallResult>;
type UninstallHook = (ctx: UninstallContext) => Promise<UninstallResult>;
export type PluginModule = { default?: (opts?: unknown) => { install?: InstallHook; uninstall?: UninstallHook } };

export function hasInPackageJson(ctx: ContextValue, pkgName: string): boolean {
  const pkg = ctx.appPkg.packageJson;
  const deps = {
    ...pkg.dependencies,
    ...pkg.devDependencies,
    ...pkg.peerDependencies,
  };
  return pkgName in deps;
}

/** Renders a `FileOpOutcome` (from the `file-ops` engine) as the matching clack log line. */
export function reportFileOp(outcome: FileOpOutcome): void {
  switch (outcome.status) {
    case "skipped-exists":
      clack.log.warn(`Skipping ${outcome.path} — already exists. Use --force to overwrite.`);
      return;
    case "created":
      clack.log.success(`Created ${outcome.path}`);
      return;
    case "overwritten":
      clack.log.success(`Overwrote ${outcome.path}`);
      return;
    case "missing":
      clack.log.warn(`Skipping ${outcome.path} — file does not exist.`);
      return;
    case "edited":
      clack.log.success(`Edited ${outcome.path}`);
      return;
    case "unchanged":
      clack.log.info(`No changes for ${outcome.path}.`);
      return;
    case "deleted":
      clack.log.success(`Deleted ${outcome.path}`);
      return;
    case "absent":
      return;
  }
}
