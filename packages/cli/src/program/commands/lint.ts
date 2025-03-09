import { createCommand } from "commander";
import { $ } from "~/shell";

export const lintCommand = createCommand("lint")
  .description("lint the code 🧹")
  .option("-c, --check", "check if the code is valid", true)
  .option("-f, --fix", "try to fix all the code")
  .option("--fix-staged", "try to fix staged files only")
  .action(async function lintAction(options) {
    const toolCmd = "biome check --colors=force --formatter-enabled=false";

    try {
      if (options.fix) {
        await $`${toolCmd} --fix --unsafe`;
        return;
      }

      if (options.fixStaged) {
        await $`${toolCmd} --no-errors-on-unmatched --fix --unsafe --staged`;
        return;
      }

      if (options.check) {
        await $`${toolCmd}`;
      }
    } catch {
      process.exit(1);
    }
  })
  .addHelpText("afterAll", "\nUnder the hood, this command uses the biome CLI to lint the code.");
