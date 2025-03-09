import { createCommand } from "commander";
import { $ } from "~/shell";
import { flags } from "~/utils/flags";

export const testStaticCommand = createCommand("test:static")
  .description("check format and lint issues over all the code 🎨")
  .action(async function formatAction() {
    try {
      const cmdFlags = flags(
        "--colors=force",
        "--formatter-enabled=true",
        "--linter-enabled=true",
        "--organize-imports-enabled=true",
      );

      await $`biome ci ${cmdFlags}`;
    } catch {
      process.exit(1);
    }
  })
  .addHelpText("afterAll", "\nUnder the hood, this command uses the biome CLI to format the code.");
