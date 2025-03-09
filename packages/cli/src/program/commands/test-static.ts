import { createCommand } from "commander";
import { $ } from "~/shell";

export const testStaticCommand = createCommand("test:static")
  .description("format and lint the code 🎨")
  .action(async function formatAction() {
    await $`biome ci`;
  })
  .addHelpText("afterAll", "\nUnder the hood, this command uses the biome CLI to format the code.");
