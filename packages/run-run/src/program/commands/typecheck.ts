import { type Project, isProcessOutput } from "@vlandoss/clibuddy";
import { createCommand } from "commander";
import type { Context } from "~/services/ctx";
import { logger } from "~/services/logger";

export function createTypecheckCommand(ctx: Context) {
  return createCommand("typecheck")
    .alias("tsc")
    .description("check if TypeScript code is well typed 🎨")
    .action(async function typecheckAction() {
      const { appPkg, shell } = ctx;

      async function singleTypecheck(dir?: string): Promise<boolean | undefined> {
        if (!appPkg.hasFile("tsconfig.json", dir)) {
          logger.info("No tsconfig.json found, skipping typecheck");
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

          const success = await singleTypecheck(project.rootDir);

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
