import { createCommand } from "commander";
import type { Context } from "~/services/ctx";
import { logger } from "~/services/logger";

export function createFormatCommand(ctx: Context) {
  return createCommand("format")
    .alias("fmt")
    .description("format the code 🎨")
    .option("-c, --check", "check if the code is formatted", true)
    .option("-f, --fix", "format all the code")
    .action(async function formatAction(options) {
      const $ = ctx.shell.$;
      const toolCmd = "biome format --no-errors-on-unmatched --colors=force";

      if (options.fix) {
        await $`${toolCmd} --fix`;
        return;
      }

      if (options.check) {
        await $`${toolCmd}`;
      }
    })
    .addHelpText("afterAll", "\nUnder the hood, this command uses the biome CLI to format the code.");
}
