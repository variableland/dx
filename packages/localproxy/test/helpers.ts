import fs from "node:fs";
import path from "node:path";

export class FixtureReader {
  #basePath: string;

  constructor(basePath: string) {
    this.#basePath = path.join(basePath, "fixtures");
  }

  read(filename: string) {
    const fullpath = this.getFullPath(filename);
    return fs.readFileSync(fullpath).toString("utf-8");
  }

  getFullPath(filename: string) {
    return path.join(this.#basePath, filename);
  }
}
