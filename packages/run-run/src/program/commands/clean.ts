import { cwd } from "@variableland/clibuddy";
import { createCommand } from "commander";
import { rimraf } from "rimraf";
import { logger } from "~/services/logger";

export function createCleanCommand() {
  return createCommand("clean")
    .description("delete dirty folders or files such as node_modules, etc 🗑️")
    .option("--only-dist", "delete 'dist' folders only")
    .action(async function cleanCommandAction(options) {
      try {
        if (options.onlyDist) {
          logger.info("Cleaning only 'dist' folders... ⌛");

          await rimraf("**/dist", {
            glob: {
              cwd,
              ignore: ["**/node_modules/**"],
            },
          });

          logger.info("Done ✅");

          return;
        }

        logger.info("Cleaning all... ⌛");

        const dirtyPaths = ["**/.turbo", "**/dist", "**/node_modules", "pnpm-lock.yaml", "bun.lock"];

        logger.info(dirtyPaths.join("\n"));

        await rimraf(dirtyPaths, {
          glob: {
            cwd,
          },
        });

        logger.info("Done ✅");
      } catch (error) {
        logger.error(error);
        process.exit(1);
      }
    })
    .addHelpText("afterAll", "\nUnder the hood, this command uses the rimraf.js to delete dirty folders or files.");
}
