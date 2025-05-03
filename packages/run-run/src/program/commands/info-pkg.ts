import { createCommand } from "commander";
import type { Context } from "~/services/ctx";
import { logger } from "~/services/logger";
import { get } from "~/utils/get";

export function createInfoPkgCommand(ctx: Context) {
  return createCommand("info:pkg")
    .description("display run-run package.json ℹ️")
    .option("-f, --filter <filter>", "lodash get id like to filter info by")
    .option("-c, --current", "display package.json where run-run will be executed")
    .action(async function pkgAction(options) {
      const { appPkg, binPkg } = ctx;

      const infoObject = options.current ? appPkg.info() : binPkg.info();

      if (!options.filter) {
        logger.info("%O", infoObject);
        return;
      }

      const { filter } = options;
      const subInfoObject = get(infoObject.packageJson, filter);

      if (!subInfoObject) {
        logger.info("No info found");
        return;
      }

      logger.info("%O", { [filter]: subInfoObject });
    });
}
