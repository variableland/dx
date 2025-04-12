import { cwd } from "@variableland/clibuddy";
import { createCommand } from "commander";
import { rimraf } from "rimraf";
import { console } from "~/services/console";

export const cleanCommand = createCommand("clean")
  .description("delete dirty folders or files such as node_modules, etc 🗑️")
  .option("--only-dist", "delete 'dist' folders only")
  .action(async function cleanCommandAction(options) {
    try {
      if (options.onlyDist) {
        console.info("Cleaning only 'dist' folders... ⌛");

        await rimraf("**/dist", {
          glob: {
            cwd,
            ignore: ["**/node_modules/**"],
          },
        });

        console.info("Done ✅");

        return;
      }

      console.info("Cleaning all... ⌛");

      const dirtyPaths = ["**/.turbo", "**/dist", "**/node_modules", "pnpm-lock.yaml", "bun.lock"];

      console.info(dirtyPaths.join("\n"));

      await rimraf(dirtyPaths, {
        glob: {
          cwd,
        },
      });

      console.info("Done ✅");
    } catch (error) {
      console.error(error);
      process.exit(1);
    }
  })
  .addHelpText("afterAll", "\nUnder the hood, this command uses the rimraf.js to delete dirty folders or files.");
