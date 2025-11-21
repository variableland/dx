import type { Project } from "@vlandoss/clibuddy";
import { createCommand } from "commander";
import type { Context } from "#/services/ctx";
import { logger } from "#/services/logger";

export function createTypecheckCommand(ctx: Context) {
  return createCommand("tsc")
    .alias("typecheck")
    .description("check if TypeScript code is well typed 🎨")
    .action(async function typecheckAction() {
      const { appPkg, shell } = ctx;

      const isTsProject = (dir: string) => appPkg.hasFile("tsconfig.json", dir);

      async function typecheckTask(dir: string) {
        await shell.at(dir).$`tsc --noEmit`;
      }

      async function typecheckAtProject(project: Project) {
        const childLogger = logger.child({
          tag: project.manifest.name,
          namespace: "typecheck",
        });

        try {
          childLogger.start("Type checking started");
          await typecheckTask(project.rootDir);
          childLogger.success("Typecheck completed");
        } catch (error) {
          childLogger.error("Typecheck failed");
          throw error;
        }
      }

      if (!appPkg.isMonorepo()) {
        try {
          if (!isTsProject(appPkg.dirPath)) {
            logger.info("No tsconfig.json found, skipping typecheck");
            return;
          }

          await typecheckTask(appPkg.dirPath);
        } catch (error) {
          logger.error("Typecheck failed");
          throw error;
        }
      }

      const projects = await appPkg.getWorkspaceProjects();
      const tsProjects = projects.filter((project) => isTsProject(project.rootDir));

      if (!tsProjects.length) {
        logger.warn("No TypeScript projects found in the monorepo, skipping typecheck");
        return;
      }

      await Promise.all(tsProjects.map(typecheckAtProject));
    })
    .addHelpText("afterAll", "\nUnder the hood, this command uses the TypeScript CLI to check the code.");
}
