import { cwd } from "@vlandoss/clibuddy";
import type { AnyLogger } from "@vlandoss/loggy";
import { createCommand } from "commander";
import type { Context } from "#/services/ctx";
import { logger } from "#/services/logger";

type TypecheckAtOptions = {
  dir: string;
  scripts: Record<string, string | undefined> | undefined;
  log: AnyLogger;
};

export function createTypecheckCommand(ctx: Context) {
  return createCommand("tsc")
    .alias("typecheck")
    .description("check if TypeScript code is well typed 🎨")
    .action(async function typecheckAction() {
      const { appPkg, shell } = ctx;

      const isTsProject = (dir: string) => appPkg.hasFile("tsconfig.json", dir);

      const getPreScript = (scripts: Record<string, string | undefined> | undefined) => scripts?.pretsc ?? scripts?.pretypecheck;

      async function typecheckAt({ dir, scripts, log }: TypecheckAtOptions) {
        const shellAt = cwd === dir ? shell : shell.at(dir);

        try {
          const preScript = getPreScript(scripts);
          if (preScript) {
            log.start(`Running pre-script: ${preScript}`);
            await shellAt.$`${preScript}`;
            log.success("Pre-script completed");
          }

          log.start("Type checking started");
          await shellAt.$`tsc --noEmit`;
          log.success("Typecheck completed");
        } catch (error) {
          log.error("Typecheck failed");
          throw error;
        }
      }

      if (!appPkg.isMonorepo()) {
        if (!isTsProject(appPkg.dirPath)) {
          logger.info("No tsconfig.json found, skipping typecheck");
          return;
        }

        await typecheckAt({
          dir: appPkg.dirPath,
          scripts: appPkg.packageJson.scripts,
          log: logger,
        });

        return;
      }

      const projects = await appPkg.getWorkspaceProjects();
      const tsProjects = projects.filter((project) => isTsProject(project.rootDir));

      if (!tsProjects.length) {
        logger.warn("No TypeScript projects found in the monorepo, skipping typecheck");
        return;
      }

      await Promise.all(
        tsProjects.map((p) =>
          typecheckAt({
            dir: p.rootDir,
            scripts: p.manifest.scripts,
            log: logger.child({
              tag: p.manifest.name,
              namespace: "typecheck",
            }),
          }),
        ),
      );
    })
    .addHelpText("afterAll", "\nUnder the hood, this command uses the TypeScript CLI to check the code.");
}
