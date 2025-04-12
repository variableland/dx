import fs from "node:fs";
import { join } from "node:path";
import { ctx } from "~/services/ctx";

export class ConfigService {
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
    return join(ctx.value.binPkg.dirPath, join("plopfiles", folder));
  }
}

export const configService = new ConfigService();
