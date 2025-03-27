import { createCommand } from "commander";
import { ctx } from "~/services/ctx";
import { Logger } from "~/services/logger";
import { get } from "~/utils/get";

export const infoPkgCommand = createCommand("info:pkg")
  .description("display run-run package.json ℹ️")
  .option("-f, --filter <filter>", "lodash get id like to filter info by")
  .option("-c, --current", "display package.json where run-run will be executed")
  .action(async function pkgAction(options) {
    const { appPkg, rrPkg } = ctx.value;

    try {
      const infoObject = options.current ? appPkg?.info() : rrPkg.info();

      if (!infoObject) {
        Logger.error("No information found");
        return;
      }

      if (!options.filter) {
        Logger.info("%O", infoObject);
        return;
      }

      const { filter } = options;
      const subInfoObject = get(infoObject.packageJson, filter);

      if (!subInfoObject) {
        Logger.info("No info found");
        return;
      }

      Logger.info("%O", { [filter]: subInfoObject });
    } catch {
      process.exit(1);
    }
  });
