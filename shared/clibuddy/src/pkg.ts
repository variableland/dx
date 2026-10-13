import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { findPackages } from "@pnpm/fs.find-packages";
import type { Project } from "@pnpm/types";
import { type PackageJson, readPackageJSON, resolvePackageJSON, writePackageJSON } from "pkg-types";
import { parse as yamlParse } from "yaml";

export type { Project };

export class Pkg {
  #packageJson: PackageJson;
  #dirPath: string;
  #pkgPath: string;

  get dirPath() {
    return this.#dirPath;
  }

  get pkgPath() {
    return this.#pkgPath;
  }

  get packageJson() {
    return this.#packageJson;
  }

  get version() {
    return process.env.VERSION || this.#packageJson.version || "0.0.0";
  }

  constructor(packageJson: PackageJson, pkgPath: string) {
    this.#packageJson = packageJson;
    this.#pkgPath = pkgPath;
    this.#dirPath = path.dirname(pkgPath);
  }

  info() {
    return {
      packageJson: this.#packageJson,
      dirPath: this.#dirPath,
    };
  }

  hasFile(name: string, dir?: string) {
    const filepath = dir ? path.join(dir, name) : this.#fromPkgDir(name);
    return existsSync(filepath);
  }

  isMonorepo() {
    return !!this.#packageJson.workspaces || !!this.#pnpmWorkspacePatterns();
  }

  async getWorkspaceProjects() {
    let patterns: string[];
    const pnpmPatterns = this.#pnpmWorkspacePatterns();

    if (pnpmPatterns) {
      patterns = pnpmPatterns;
    } else {
      patterns = Array.isArray(this.#packageJson.workspaces)
        ? this.#packageJson.workspaces
        : (this.#packageJson.workspaces?.packages ?? []);
    }

    if (!Array.isArray(patterns) || patterns.some((p) => typeof p !== "string")) {
      throw new Error("Invalid workspace patterns");
    }

    const projects = await findPackages(this.#dirPath, {
      patterns,
    });

    const excludeRoot = (projects: Project[]) => {
      return projects.filter((project) => project.rootDir !== this.#dirPath);
    };

    return excludeRoot(projects);
  }

  async write(packageJson: PackageJson) {
    await writePackageJSON(this.#pkgPath, packageJson);
  }

  // Since pnpm 10, single-package repos keep settings in pnpm-workspace.yaml without `packages`.
  #pnpmWorkspacePatterns(): string[] | undefined {
    const manifestPath = this.#fromPkgDir("pnpm-workspace.yaml");
    if (!existsSync(manifestPath)) return;

    const manifest = yamlParse(readFileSync(manifestPath, "utf-8"));
    return Array.isArray(manifest?.packages) && manifest.packages.length ? manifest.packages : undefined;
  }

  #fromPkgDir(...args: string[]) {
    return path.join(this.#dirPath, ...args);
  }
}

export async function createPkg(cwd: string): Promise<Pkg | null> {
  let pkgPath: string;
  try {
    pkgPath = await resolvePackageJSON(cwd);
  } catch {
    return null;
  }

  const packageJson = await readPackageJSON(pkgPath);

  return new Pkg(packageJson, pkgPath);
}
