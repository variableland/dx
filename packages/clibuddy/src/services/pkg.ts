import fs from "node:fs";
import path from "node:path";
import { type Project, findWorkspacePackages } from "@pnpm/workspace.find-packages";
import { readWorkspaceManifest } from "@pnpm/workspace.read-manifest";
import { type NormalizedPackageJson, readPackageUp } from "read-package-up";

export type { Project };

export class PkgService {
  #packageJson: NormalizedPackageJson;
  #dirPath: string;

  get dirPath() {
    return this.#dirPath;
  }

  get packageJson() {
    return this.#packageJson;
  }

  constructor(packageJson: NormalizedPackageJson, pkgPath: string) {
    this.#packageJson = packageJson;
    this.#dirPath = path.dirname(pkgPath);
  }

  info() {
    return {
      packageJson: this.#packageJson,
      dirPath: this.#dirPath,
    };
  }

  hasFile(name: string, dir?: string) {
    const filepath = dir ? path.join(dir, name) : this.#fromApp(name);
    return fs.existsSync(filepath);
  }

  isMonorepo() {
    return this.#packageJson.workspaces !== undefined || this.#hasPnpmWorkspace();
  }

  async getWorkspaceProjects() {
    let patterns: string[];

    if (this.#hasPnpmWorkspace()) {
      const manifest = await readWorkspaceManifest(this.#dirPath);

      if (!manifest) {
        throw new Error("Can't read pnpm workspace manifest");
      }

      patterns = manifest.packages;
    } else {
      patterns = Array.isArray(this.#packageJson.workspaces)
        ? this.#packageJson.workspaces
        : (this.#packageJson.workspaces?.packages ?? []);
    }

    if (!Array.isArray(patterns) || patterns.some((p) => typeof p !== "string")) {
      throw new Error("Invalid workspace patterns");
    }

    const projects = await findWorkspacePackages(this.#dirPath, {
      patterns,
    });

    const excludeRoot = (projects: Project[]) => {
      return projects.filter((project) => project.rootDir !== this.#dirPath);
    };

    return excludeRoot(projects);
  }

  #hasPnpmWorkspace() {
    return this.hasFile("pnpm-workspace.yaml");
  }

  #fromApp(...args: string[]) {
    return path.join(this.#dirPath, ...args);
  }
}

export async function createPkgService(cwd: string): Promise<PkgService | null> {
  const searchResult = await readPackageUp({ cwd });

  if (!searchResult) {
    return null;
  }

  const { packageJson, path } = searchResult;

  return new PkgService(packageJson, path);
}
