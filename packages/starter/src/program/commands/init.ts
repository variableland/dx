import { join } from "node:path";
import { cwd } from "@variableland/clibuddy";
import { Argument, Option, createCommand } from "commander";
import { InitAction } from "~/actions/init";
import { console } from "~/services/console";
import { createPlopTemplateService } from "~/services/template";

type InitOptions = {
  dest: string;
  git: boolean;
};

const DEFAULT_DEST = ".";

export const initCommand = createCommand("init")
  .description("init a new project 🚀")
  .addArgument(new Argument("<template>", "the template to use").choices(["basic", "lib"]))
  .addArgument(
    new Argument("<folder>", "folder name where the project will be created. i.e: my-new-lib"),
  )
  .addOption(
    new Option("-d, --dest <string>", "destination path to create folder").default(DEFAULT_DEST),
  )
  .addOption(new Option("--no-git", "skip to create a git repository").default(true))
  .action(async function initAction(template: string, folder: string, options: InitOptions) {
    try {
      const destBasePath = options.dest === DEFAULT_DEST ? cwd : options.dest;

      const folderPath = join(destBasePath, folder);

      const templateService = await createPlopTemplateService({
        destBasePath,
      });

      const initAction = new InitAction({
        templateService,
      });

      await initAction.execute({
        template,
        folderPath,
        ...options,
      });
    } catch (error) {
      console.error(error);
      process.exit(1);
    }
  })
  .addHelpText("afterAll", "\nUnder the hood, this command uses Plop.js to generate the project.");
