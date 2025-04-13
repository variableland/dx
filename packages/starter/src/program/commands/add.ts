import { cwd } from "@variableland/clibuddy";
import { Argument, Option, createCommand } from "commander";
import { AddAction } from "~/actions/add";
import { console } from "~/services/console";
import type { ContextValue } from "~/services/ctx";
import { createPlopTemplateService } from "~/services/template";

type AddOptions = {
  dest: string;
  force: boolean;
};

export function createAddCommand(ctx: ContextValue) {
  return createCommand("add")
    .description("add config files to a project 📁")
    .addArgument(new Argument("[slug...]", "the config slugs to pick").choices(ctx.config.getPluginChoices()))
    .addOption(new Option("-d, --dest <string>", "destination path to create folder (default: cwd)"))
    .addOption(new Option("-f, --force", "override existing files").default(false))
    .action(async function addAction(slugs: string[], options: AddOptions) {
      try {
        const { dest: destBasePath = cwd, force } = options;

        const templateService = await createPlopTemplateService({
          force,
          destBasePath,
          basePath: ctx.binPkg.dirPath,
        });

        const addAction = new AddAction({
          templateService,
        });

        await addAction.execute({ slugs });
      } catch (error) {
        console.error(error);
        process.exit(1);
      }
    })
    .addHelpText("afterAll", "\nUnder the hood, this command uses Plop.js to generate the project.");
}
