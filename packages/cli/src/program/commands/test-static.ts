import { createCommand } from "commander";
import { $ } from "~/shell";

export const testStaticCommand = createCommand("test:static")
  .description("check format and lint issues over all the code 🎨")
  .action(async function formatAction() {
    try {
      await $`biome ci --colors=force`;
    } catch {
      process.exit(1);
    }
  })
  .addHelpText("afterAll", "\nUnder the hood, this command uses the biome CLI to format the code.");
