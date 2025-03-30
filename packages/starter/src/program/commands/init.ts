import { join } from "node:path";
import { $, cwd } from "@variableland/clibuddy";
import { Argument, Option, createCommand } from "commander";
import nodePlop from "node-plop";
import { ctx } from "~/services/ctx";
import { Logger } from "~/services/logger";
import { PlopTemplateService } from "~/services/template";

type InitOptions = {
  dest: string;
  git: boolean;
  install: boolean;
};

const META = {
  GENERATOR_ID: "init",
  PLOP_CONFIG_PATH: join("plopfiles", "plopfile.js"),
};

export const initCommand = createCommand("init")
  .description("init a new project 🚀")
  .addArgument(new Argument("<template>", "the template to use").choices(["basic", "lib"]))
  .addArgument(
    new Argument("<folder>", "folder name where the project will be created. i.e: my-new-lib"),
  )
  .addOption(new Option("-d, --dest", "destination path to create folder").default(cwd))
  .addOption(new Option("--no-git", "skip to create a git repository").default(true))
  .action(async function initAction(template: string, folder: string, options: InitOptions) {
    try {
      const d = Logger.subdebug("init");

      d("template:", template);
      d("folder:", folder);
      d("options: %O", options);

      const configPath = join(ctx.value.binPkg.dirPath, META.PLOP_CONFIG_PATH);

      const plop = await nodePlop(configPath, {
        force: false,
        destBasePath: options.dest,
      });

      const templateService = new PlopTemplateService(plop);

      await templateService.generate({
        generatorId: META.GENERATOR_ID,
        template,
        folder,
      });

      if (options.git) {
        Logger.start("Creating git repository");
        await $.quiet`cd ${folder} && git init`;
        Logger.success("Git repository created");
      }
    } catch (error) {
      Logger.error(error);
      process.exit(1);
    }
  })
  .addHelpText("afterAll", "\nUnder the hood, this command uses Plop.js to generate the project.");
