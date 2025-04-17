#!/usr/bin/env bun
import { relative } from "node:path";
import { $ } from "bun";

type PackageOutput = {
  name: string;
  version: string;
  path: string;
  // biome-ignore lint:
  [key: string]: any;
};

type PackageDep = {
  from: string;
  version: string;
  resolved?: string;
  path: string;
};

async function getWorkspacesPackages(): Promise<Array<PackageOutput>> {
  return $`pnpm list -r --json`.json();
}

async function getDependenciesPackages(pkg: PackageOutput, packages: Array<PackageOutput>) {
  const isLinked = (version: string) => version.startsWith("link:");

  const dependenciesObj: Record<string, PackageDep> = {
    ...(pkg.dependencies ?? {}),
    ...(pkg.devDependencies ?? {}),
  };

  const depPackages: Array<PackageOutput> = [];

  for (const [name, dep] of Object.entries(dependenciesObj)) {
    if (isLinked(dep.version)) {
      const depPackage = packages.find((pkg) => pkg.name === name);

      if (depPackage) {
        const nestedDepPackages = await getDependenciesPackages(depPackage, packages);
        depPackages.push(depPackage, ...nestedDepPackages);
      }
    }
  }

  return depPackages;
}

/**
 * @example
 * ```ts
 * const relativePath = getRelativeFolderPath('/path/to/the/repository/packages/package-1')
 * console.log(relativePath) // 'packages/package-1'
 * ```
 */
function getRelativeFolderPath(absPath: string) {
  const relativePath = relative(process.cwd(), absPath);
  return relativePath.length > 0 ? relativePath : null;
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
async function getChangedPackages(): Promise<Array<string>> {
  const packages = await getWorkspacesPackages();

  const changedPaths = (await $`git fetch origin main && git diff --name-only origin/main`.text()).trim().split("\n");

  const changedPackages = new Map<string, PackageOutput>();

  for (const pkg of packages) {
    const relativePath = getRelativeFolderPath(pkg.path);
    const hasChanged = changedPaths.some((file) => relativePath && file.startsWith(relativePath));

    if (hasChanged) {
      changedPackages.set(pkg.name, pkg);

      const depPackages = await getDependenciesPackages(pkg, packages);

      for (const depPackage of depPackages) {
        changedPackages.set(depPackage.name, depPackage);
      }
    }
  }

  // @ts-expect-error the filter remove possible null values
  return Array.from(changedPackages.values())
    .map((pkg) => getRelativeFolderPath(pkg.path))
    .filter(Boolean);
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
    throw new Error("Failed to bump packages");
  }

  try {
    if (!(await Bun.file(".npmrc").exists())) {
      if (!Bun.env.AUTH_TOKEN) {
        throw new Error("AUTH_TOKEN environment variable is required");
      }

      // Don't interpolate AUTH_TOKEN for security reasons
      await Bun.write(".npmrc", "//registry.npmjs.org/:_authToken=${AUTH_TOKEN}");
    }

    const tag = `pr-${Bun.env.PR_NUMBER}`;

    for (const pkg of changedPackages) {
      await publishPackage(pkg, tag);
    }
  } catch (error) {
    throw new Error("Failed to publish packages");
  }
}

main();
