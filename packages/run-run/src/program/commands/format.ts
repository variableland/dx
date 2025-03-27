import { $ } from "@variableland/clibuddy";
import { createCommand } from "commander";

export const formatCommand = createCommand("format")
  .alias("fmt")
  .description("format the code 🎨")
  .option("-c, --check", "check if the code is formatted", true)
  .option("-f, --fix", "format all the code")
  .action(async function formatAction(options) {
    const toolCmd = "biome format --no-errors-on-unmatched --colors=force";

    try {
      if (options.fix) {
        await $`${toolCmd} --fix`;
        return;
      }

      if (options.check) {
        await $`${toolCmd}`;
      }
    } catch {
      process.exit(1);
    }
  })
  .addHelpText("afterAll", "\nUnder the hood, this command uses the biome CLI to format the code.");
