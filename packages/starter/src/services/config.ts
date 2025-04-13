import fs from "node:fs";
import { join } from "node:path";

export class ConfigService {
  #baseDir: string;

  constructor(baseDir = "") {
    this.#baseDir = baseDir;
  }

  getPluginChoices() {
    const folderPath = this.#getPlopFolderDir("plugins");
    return fs.readdirSync(folderPath).sort();
  }

  getTemplateChoices() {
    const folderPath = this.#getPlopFolderDir("templates");

    return fs
      .readdirSync(folderPath)
      .filter((folder) => !folder.startsWith("#"))
      .sort();
  }

  #getPlopFolderDir(folder: string) {
    return join(this.#baseDir, join("plopfiles", folder));
  }
}
