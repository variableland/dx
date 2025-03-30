import fs from "node:fs";
import path from "node:path";
import { type NormalizedPackageJson, readPackageUp } from "read-package-up";

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

  hasFile(name: string) {
    return fs.existsSync(this.#fromApp(name));
  }

  #fromApp(...args: string[]) {
    return path.join(this.#dirPath, ...args);
  }

  info() {
    return {
      packageJson: this.#packageJson,
      dirPath: this.#dirPath,
    };
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
