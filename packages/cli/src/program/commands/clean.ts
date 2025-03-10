import { createCommand } from "commander";
import { $ } from "~/shell";

export const cleanCommand = createCommand("clean")
  .description("delete dirty folders or files such as node_modules, etc 🗑️")
  .option("--only-dist", "delete 'dist' folders only")
  .action(async function cleanCommandAction(options) {
    try {
      if (options.onlyDist) {
        console.log("Cleaning only 'dist' folders... ⌛");
        await $`npx --yes rimraf -g **/dist`;
        console.log("Done ✅");
        return;
      }

      console.log("Cleaning all... ⌛");

      const dirtyPaths = ["**/.turbo", "**/dist", "**/node_modules", "pnpm-lock.yaml"];

      console.log(dirtyPaths.join("\n"));

      await $`npx --yes rimraf -g ${dirtyPaths.join(" ")}`;
      console.log("Done ✅");
    } catch {
      process.exit(1);
    }
  })
  .addHelpText(
    "afterAll",
    "\nUnder the hood, this command uses the rimraf CLI to delete dirty folders or files.",
  );
