import { Log } from "@variableland/console";
import { createCommand } from "commander";
import { useStore } from "~/store";
import { get } from "~/utils/get";

export const infoPkgCommand = createCommand("info:pkg")
  .description("display run-run package.json ℹ️")
  .option("-f, --filter <filter>", "lodash get id like to filter info by")
  .option("-c, --current", "display package.json where run-run will be executed")
  .action(async function pkgAction(options) {
    const store = useStore();

    try {
      const infoObject = options.current ? store.appPkg?.info() : store.rrPkg.info();

      if (!infoObject) {
        Log.error("No information found");
        return;
      }

      if (!options.filter) {
        Log.info("%O", infoObject);
        return;
      }

      const { filter } = options;
      const subInfoObject = get(infoObject.packageJson, filter);

      if (!subInfoObject) {
        Log.info("No info found");
        return;
      }

      Log.info("%O", { [filter]: subInfoObject });
    } catch {
      process.exit(1);
    }
  });
