import fs from "node:fs";
import { join } from "node:path";
import { cwd } from "@variableland/clibuddy";
import { Argument, Option, createCommand } from "commander";
import { AddAction } from "~/actions/add";
import { console } from "~/services/console";
import { ctx } from "~/services/ctx";
import { createPlopTemplateService } from "~/services/template";

type AddOptions = {
  dest: string;
};

export const PLUGINS_PATH = join("plopfiles", "templates", "plugins");

function getConfigIdChoices() {
  const pluginPath = join(ctx.value.binPkg.dirPath, PLUGINS_PATH);
  return fs.readdirSync(pluginPath);
}

export const addCommand = createCommand("add")
  .description("add config files to a project 📁")
  .addArgument(new Argument("<slug...>", "the config slugs to pick").choices(getConfigIdChoices()))
  .addOption(new Option("-d, --dest <string>", "destination path to create folder").default(cwd))
  .action(async function addAction(slugs: string[], options: AddOptions) {
    try {
      const templateService = await createPlopTemplateService({
        destBasePath: options.dest,
      });

      const initAction = new AddAction({
        templateService,
      });

      for (const configSlug of slugs) {
        await initAction.execute({ configSlug });
      }
    } catch (error) {
      console.error(error);
      process.exit(1);
    }
  })
  .addHelpText("afterAll", "\nUnder the hood, this command uses Plop.js to generate the project.");
