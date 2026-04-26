import { cwd } from "@vlandoss/clibuddy";
import { Argument, createCommand, Option } from "commander";
import { InitAction } from "#src/actions/init.ts";
import type { ContextValue } from "#src/services/ctx.ts";
import { logger } from "#src/services/logger.ts";
import { createPlopTemplateService } from "#src/services/template.ts";

type InitOptions = {
  dest: string;
  git: boolean;
  force: boolean;
};

export function createInitCommand(ctx: ContextValue) {
  return createCommand("init")
    .description("init a new project 🚀")
    .addArgument(new Argument("[template]", "the template to use").choices(ctx.config.getTemplateChoices()))
    .addOption(new Option("-d, --dest [string]", "destination path to create folder (default: cwd)"))
    .addOption(new Option("--no-git", "skip to create a git repository").default(true))
    .addOption(new Option("-f, --force", "override existing files").default(false))
    .action(async function initAction(template: string | undefined, options: InitOptions) {
      try {
        const { dest: destBasePath = cwd, force } = options;

        const templateService = await createPlopTemplateService({
          force,
          destBasePath,
          basePath: ctx.binPkg.dirPath,
        });

        const initAction = new InitAction({
          templateService,
          shellService: ctx.shell,
        });

        await initAction.execute({
          template,
          destBasePath,
          ...options,
        });
      } catch (error) {
        logger.error(error);
        process.exit(1);
      }
    })
    .addHelpText("afterAll", "\nUnder the hood, this command uses Plop.js to generate the project.");
}
