import type { Pkg } from "@vlandoss/clibuddy";
import type { PackageManager } from "nypm";

export type WorkspaceChoice = { kind: "current" } | { kind: "root"; flag: true | undefined };
export type WorkspaceTarget = true | undefined;

export function resolveWorkspaceChoice(appPkg: Pkg, pm: PackageManager | undefined): WorkspaceChoice {
  if (!appPkg.isMonorepo()) return { kind: "current" };
  return { kind: "root", flag: pmNeedsRootFlag(pm) ? true : undefined };
}

export function toNypmWorkspace(choice: WorkspaceChoice): WorkspaceTarget {
  return choice.kind === "current" ? undefined : choice.flag;
}

export function describeWorkspaceChoice(choice: WorkspaceChoice): string {
  return choice.kind === "current" ? "the current package" : "the workspace root";
}

// pnpm and yarn-classic refuse to install at the workspace root without an
// explicit flag; npm and yarn-berry don't need it.
function pmNeedsRootFlag(pm: PackageManager | undefined): boolean {
  if (!pm) return false;
  if (pm.name === "pnpm") return true;
  if (pm.name === "yarn" && (!pm.majorVersion || pm.majorVersion === "1")) return true;
  return false;
}
