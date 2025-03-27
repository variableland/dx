import { $ } from "@variableland/clibuddy";
import { createCommand } from "commander";
import { Logger } from "~/services/logger";

export const cleanCommand = createCommand("clean")
  .description("delete dirty folders or files such as node_modules, etc 🗑️")
  .option("--only-dist", "delete 'dist' folders only")
  .action(async function cleanCommandAction(options) {
    try {
      if (options.onlyDist) {
        Logger.info("Cleaning only 'dist' folders... ⌛");
        await $`rimraf -g **/dist`;
        Logger.info("Done ✅");
        return;
      }

      Logger.info("Cleaning all... ⌛");

      const dirtyPaths = ["**/.turbo", "**/dist", "**/node_modules", "pnpm-lock.yaml", "bun.lock"];

      Logger.info(dirtyPaths.join("\n"));

      await $`rimraf -g ${dirtyPaths.join(" ")}`;
      Logger.info("Done ✅");
    } catch {
      process.exit(1);
    }
  })
  .addHelpText(
    "afterAll",
    "\nUnder the hood, this command uses the rimraf CLI to delete dirty folders or files.",
  );
