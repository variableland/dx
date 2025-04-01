import fs from "node:fs";
import { join } from "node:path";
import { $, cwd } from "@variableland/clibuddy";
import { Argument, Option, createCommand } from "commander";
import nodePlop from "node-plop";
import { console } from "~/services/console";
import { ctx } from "~/services/ctx";
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
      const debug = console.subdebug("init");

      debug("template:", template);
      debug("options: %O", options);

      const configPath = join(ctx.value.binPkg.dirPath, META.PLOP_CONFIG_PATH);
      const dest = fs.realpathSync(options.dest);
      const folderPath = join(dest, folder);

      debug("plop config path:", folderPath);
      debug("dest folder path:", folderPath);

      const plop = await nodePlop(configPath, {
        force: false,
        destBasePath: dest,
      });

      const templateService = new PlopTemplateService(plop);

      console.start("Generating project");

      await templateService.generate({
        template,
        folder,
        generatorId: META.GENERATOR_ID,
      });

      console.success("Project generated");

      const $$ = $.quiet({ cwd: folderPath });

      if (options.git) {
        console.start("Creating git repository");

        await $$`git init`;
        // NOTE: git commit -am failed, not sure why
        await $$`git add . && git commit -m "initial commit"`;

        console.success("Git repository created");
      }
    } catch (error) {
      console.error(error);
      process.exit(1);
    }
  })
  .addHelpText("afterAll", "\nUnder the hood, this command uses Plop.js to generate the project.");
