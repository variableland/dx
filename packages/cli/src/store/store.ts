import fs from "node:fs";
import path from "node:path";
import type { NormalizedPackageJson } from "read-package-up";

export class Store {
  appPkg: NormalizedPackageJson;
  rrPkg: NormalizedPackageJson;
  appPath: string;
  rrPath: string;

  constructor(
    appPkg: NormalizedPackageJson,
    appPath: string,
    rrPkg: NormalizedPackageJson,
    rrPath: string,
  ) {
    this.appPkg = appPkg;
    this.rrPkg = rrPkg;
    this.appPath = appPath;
    this.rrPath = rrPath;
  }

  hasFile(name: string) {
    return fs.existsSync(this.#fromApp(name));
  }

  #fromApp(...args: string[]) {
    return path.join(this.appPath, ...args);
  }
}
