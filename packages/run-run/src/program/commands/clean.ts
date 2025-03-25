import { Log } from "@variableland/console";
import { createCommand } from "commander";
import { $ } from "~/shell";

export const cleanCommand = createCommand("clean")
  .description("delete dirty folders or files such as node_modules, etc 🗑️")
  .option("--only-dist", "delete 'dist' folders only")
  .action(async function cleanCommandAction(options) {
    try {
      if (options.onlyDist) {
        Log.info("Cleaning only 'dist' folders... ⌛");
        await $`rimraf -g **/dist`;
        Log.info("Done ✅");
        return;
      }

      Log.info("Cleaning all... ⌛");

      const dirtyPaths = ["**/.turbo", "**/dist", "**/node_modules", "pnpm-lock.yaml", "bun.lock"];

      Log.info(dirtyPaths.join("\n"));

      await $`rimraf -g ${dirtyPaths.join(" ")}`;
      Log.info("Done ✅");
    } catch {
      process.exit(1);
    }
  })
  .addHelpText(
    "afterAll",
    "\nUnder the hood, this command uses the rimraf CLI to delete dirty folders or files.",
  );
