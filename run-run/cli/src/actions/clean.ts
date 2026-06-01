import { cwd } from "@vlandoss/clibuddy";
import { type GlobOptions, glob } from "glob";
import { rimraf } from "rimraf";
import { logger } from "#src/services/logger.ts";

export type CleanOptions = {
  onlyDist: boolean;
  dryRun: boolean;
};

export type CleanActionConfig = {
  options: CleanOptions;
};

export async function cleanAction({ options }: CleanActionConfig): Promise<void> {
  async function run(paths: string[], globOptions: GlobOptions) {
    if (options.dryRun) {
      const toDelete = await glob(paths, globOptions);
      logger.info("Paths that would be deleted: %O", toDelete);
      return;
    }

    logger.start("Clean started");
    await rimraf(paths, { glob: globOptions });
    logger.success("Clean completed");
  }

  const BUILD_PATHS = ["**/dist"];
  const ALL_DIRTY_PATHS = ["**/.turbo", "**/node_modules", "pnpm-lock.yaml", "bun.lock", ...BUILD_PATHS];

  if (options.onlyDist) {
    await run(BUILD_PATHS, { cwd, ignore: ["**/node_modules/**"] });
  } else {
    await run(ALL_DIRTY_PATHS, { cwd });
  }
}
