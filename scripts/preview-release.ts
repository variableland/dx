#!/usr/bin/env bun
import { dirname } from "node:path";
import { $, Glob } from "bun";
import { parse as parseYaml } from "yaml";

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
  const pnpmWorkspace = parseYaml(await Bun.file("pnpm-workspace.yaml").text());

  const packages = getWorkspacesPackages(pnpmWorkspace.packages);

  const changedPaths = (await $`git fetch origin main && git diff --name-only origin/main`.text())
    .trim()
    .split("\n");

  return packages.filter((pkg) => changedPaths.some((file) => file.startsWith(pkg)));
}

/**
 * Bump the package version
 *
 * @param pkg - The package directory to bump.
 * @param preid - The prerelease identifier.
 */
async function bumpPackage(pkg: string, preid: string) {
  await $`cd ${pkg} && pnpm version prerelease --preid="${preid}" --no-git-tag-version`;
}

/**
 * Publish the package
 *
 * @param pkg - The package directory to publish.
 * @param tag - The tag to publish the package with.
 */
async function publishPackage(pkg: string, tag: string) {
  await $`cd ${pkg} && pnpm publish --tag="${tag}" --no-git-checks`;
}

async function main() {
  if (!Bun.env.PR_NUMBER) {
    throw new Error("PR_NUMBER environment variable is required");
  }

  if (!Bun.env.NPM_TOKEN) {
    throw new Error("NPM_TOKEN environment variable is required");
  }

  const changedPackages = await getChangedPackages();

  if (!changedPackages.length) {
    console.log("No packages have changed");
    return;
  }

  try {
    const shortGitSha = (await $`git rev-parse --short HEAD`.text()).trim();
    const preid = `git-${shortGitSha}`;

    for (const pkg of changedPackages) {
      await bumpPackage(pkg, preid);
    }
  } catch (error) {
    throw new Error("Failed to bump packages", { cause: error });
  }

  try {
    await Bun.write(".npmrc", `//registry.npmjs.org/:_authToken=${Bun.env.NPM_TOKEN}`);

    const tag = `pr-${Bun.env.PR_NUMBER}`;

    for (const pkg of changedPackages) {
      await publishPackage(pkg, tag);
    }
  } catch (error) {
    throw new Error("Failed to publish packages", { cause: error });
  }
}

main();
