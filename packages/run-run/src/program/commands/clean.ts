import { cwd } from "@vlandoss/clibuddy";
import { createCommand } from "commander";
import { type GlobOptions, glob } from "glob";
import { rimraf } from "rimraf";
import { logger } from "~/services/logger";

type Options = {
  onlyDist: boolean;
  dryRun: boolean;
};

export function createCleanCommand() {
  return createCommand("clean")
    .description("delete dirty folders or files such as node_modules, etc 🗑️")
    .option("--only-dist", "delete 'dist' folders only")
    .option("--dry-run", "outputs the paths that would be deleted")
    .action(async function cleanCommandAction(options: Options) {
      async function run(paths: string[], globOptions: GlobOptions) {
        if (options.dryRun) {
          const toDelete = await glob(paths, globOptions);

          logger.info("Paths that would be deleted: %O", toDelete);

          return;
        }

        logger.start("Clean started");

        await rimraf(paths, {
          glob: globOptions,
        });

        logger.success("Clean completed");
      }

      const BUILD_PATHS = ["**/dist"];
      const ALL_DIRTY_PATHS = ["**/.turbo", "**/node_modules", "pnpm-lock.yaml", "bun.lock", ...BUILD_PATHS];

      if (options.onlyDist) {
        await run(BUILD_PATHS, {
          cwd,
          ignore: ["**/node_modules/**"],
        });
      } else {
        await run(ALL_DIRTY_PATHS, {
          cwd,
        });
      }
    })
    .addHelpText("afterAll", "\nUnder the hood, this command uses the rimraf.js to delete dirty folders or files.");
}
