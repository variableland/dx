import { $ } from "@variableland/clibuddy";
import { createCommand } from "commander";
import { console } from "~/services/console";

export const lintCommand = createCommand("lint")
  .description("lint the code 🧹")
  .option("-c, --check", "check if the code is valid", true)
  .option("-f, --fix", "try to fix all the code")
  .action(async function lintAction(options) {
    const toolCmd = "biome check --colors=force --formatter-enabled=false";

    try {
      if (options.fix) {
        await $`${toolCmd} --fix --unsafe`;
        return;
      }

      if (options.check) {
        await $`${toolCmd}`;
      }
    } catch (error) {
      console.error(error);
      process.exit(1);
    }
  })
  .addHelpText("afterAll", "\nUnder the hood, this command uses the biome CLI to lint the code.");
