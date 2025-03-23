#!/usr/bin/env bun
import { dirname } from "node:path";
import { $, Glob } from "bun";

/**
 * @param workspaces - The workspaces to get the packages from.
 * @returns The packages directories in the workspaces.
 *
 * @example
 * ```ts
 * const packages = getWorkspacesPackages(['packages/*'])
 * console.log(packages) // ['packages/package-1', 'packages/package-2']
 * ```
 */
function getWorkspacesPackages(workspaces: string[]) {
  const collect = (workspace: string) => {
    if (!workspace.includes("*")) {
      return [workspace];
    }

    const pattern = workspace.replace("*", "**/package.json");
    const glob = new Glob(pattern);
    const files = Array.from(glob.scanSync());

    return files.map((file) => dirname(file));
  };

  return workspaces.flatMap(collect);
}

/**
 * Get the packages that have changed.
 *
 * @returns The packages that have changed.
 *
 * @example
 * ```ts
 * const changedPackages = await getChangedPackages()
 * console.log(changedPackages) // ['packages/package-1', 'packages/package-2']
 * ```
 */
async function getChangedPackages() {
  const rootPkgJson = await Bun.file("package.json").json();

  const packages = getWorkspacesPackages(rootPkgJson.workspaces);
  const changedPaths = (await $`git fetch origin main && git diff --name-only origin/main`.text())
    .trim()
    .split("\n");

  return packages.filter((pkg) => changedPaths.some((file) => file.startsWith(pkg)));
}

async function main() {
  if (!Bun.env.PR_NUMBER) {
    throw new Error("PR_NUMBER environment variable is required");
  }

  const prNumber = Bun.env.PR_NUMBER;
  const shortGitSha = (await $`git rev-parse --short HEAD`.text()).trim();
  const changedPackages = await getChangedPackages();

  for await (const pkg of changedPackages) {
    await $`cd ${pkg} && bunx bumpp prerelease --preid="git-${shortGitSha}" --no-tag --no-commit --no-push --yes`;
    await $`cd ${pkg} && bun publish --tag="pr-${prNumber}"`;
  }
}

main();
