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
    const pkgJsonPaths = Array.from(glob.scanSync());

    return pkgJsonPaths.map((pkgJsonPath) => dirname(pkgJsonPath));
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

/**
 * Bump the package version
 *
 * @param pkg - The package directory to bump.
 * @param shortGitSha - The short git sha.
 */
async function bumpPackage(pkg: string, shortGitSha: string) {
  await $`cd ${pkg} && bunx bumpp prerelease --preid="git-${shortGitSha}" --no-tag --no-commit --no-push --yes`;
}

/**
 * Publish the package
 *
 * @param pkg - The package directory to publish.
 * @param prNumber - The pull request number.
 */
async function publishPackage(pkg: string, prNumber: string) {
  await $`cd ${pkg} && bun publish --tag="pr-${prNumber}"`;
}

async function main() {
  if (!Bun.env.PR_NUMBER) {
    throw new Error("PR_NUMBER environment variable is required");
  }

  if (!Bun.env.NPM_TOKEN) {
    throw new Error("NPM_TOKEN environment variable is required");
  }

  const changedPackages = await getChangedPackages();

  const shortGitSha = (await $`git rev-parse --short HEAD`.text()).trim();

  try {
    for await (const pkg of changedPackages) {
      await bumpPackage(pkg, shortGitSha);
    }
  } catch (error) {
    throw new Error("Failed to bump packages", { cause: error });
  }

  await Bun.write(".npmrc", `//registry.npmjs.org/:_authToken=${Bun.env.NPM_TOKEN}`);

  try {
    for await (const pkg of changedPackages) {
      await publishPackage(pkg, Bun.env.PR_NUMBER);
    }
  } catch (error) {
    throw new Error("Failed to publish packages", { cause: error });
  }
}

main();
