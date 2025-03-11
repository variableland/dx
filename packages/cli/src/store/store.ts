import fs from "node:fs";
import path from "node:path";
import type { NormalizedPackageJson } from "read-package-up";

export class Store {
  appPkg: NormalizedPackageJson;
  appPath: string;

  constructor(appPkg: NormalizedPackageJson, appPath: string) {
    this.appPkg = appPkg;
    this.appPath = appPath;
  }

  hasFile(name: string) {
    return fs.existsSync(this.#fromApp(name));
  }

  #fromApp(...args: string[]) {
    return path.join(this.appPath, ...args);
  }
}
