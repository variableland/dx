import path from "node:path";
import { cwd } from "@variableland/clibuddy";
import { Argument, Option, createCommand } from "commander";
import { InitAction } from "~/actions/init";
import { configService } from "~/services/config";
import { console } from "~/services/console";
import { createPlopTemplateService } from "~/services/template";

type InitOptions = {
  dest: string;
  git: boolean;
  force: boolean;
};

export const initCommand = createCommand("init")
  .description("init a new project 🚀")
  .addArgument(new Argument("[template]", "the template to use").choices(configService.getTemplateChoices()))
  .addOption(new Option("-d, --dest [string]", "destination path to create folder (default: cwd)"))
  .addOption(new Option("--no-git", "skip to create a git repository").default(true))
  .addOption(new Option("-f, --force", "override existing files").default(false))
  .action(async function initAction(template: string | undefined, options: InitOptions) {
    try {
      const { dest: destBasePath = cwd, force } = options;

      const templateService = await createPlopTemplateService({
        force,
        destBasePath,
      });

      const initAction = new InitAction({
        templateService,
      });

      await initAction.execute({
        template,
        destBasePath,
        ...options,
      });
    } catch (error) {
      console.error(error);
      process.exit(1);
    }
  })
  .addHelpText("afterAll", "\nUnder the hood, this command uses Plop.js to generate the project.");
