import type { Project } from "@vlandoss/clibuddy";
import { createCommand } from "commander";
import type { Context } from "~/services/ctx";
import { logger } from "~/services/logger";

export function createTypecheckCommand(ctx: Context) {
  return createCommand("tsc")
    .alias("typecheck")
    .description("check if TypeScript code is well typed 🎨")
    .action(async function typecheckAction() {
      const { appPkg, shell } = ctx;

      async function singleTypecheck(dir?: string, options?: { logger?: typeof logger }): Promise<boolean | undefined> {
        const log = options?.logger ?? logger;

        if (!appPkg.hasFile("tsconfig.json", dir)) {
          log.info("No tsconfig.json found, skipping typecheck");
          return;
        }

        if (dir) {
          await shell.at(dir).$`tsc --noEmit`;
        } else {
          await shell.$`tsc --noEmit`;
        }

        return true;
      }

      async function typecheckAtProject(project: Project) {
        const childLogger = logger.child({
          tag: project.manifest.name,
          namespace: "typecheck",
        });

        try {
          childLogger.start("Type checking started");

          const success = await singleTypecheck(project.rootDir, {
            logger: childLogger,
          });

          if (success) {
            childLogger.success("Typecheck completed");
          }
        } catch (error) {
          childLogger.error("Typecheck failed");
          throw error;
        }
      }

      if (!appPkg.isMonorepo()) {
        try {
          await singleTypecheck();
        } catch (error) {
          logger.error("Typecheck failed");
          throw error;
        }
      }

      const projects = await appPkg.getWorkspaceProjects();

      for (const project of projects) {
        await typecheckAtProject(project);
      }
    })
    .addHelpText("afterAll", "\nUnder the hood, this command uses the TypeScript CLI to check the code.");
}
