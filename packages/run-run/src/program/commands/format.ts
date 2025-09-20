import { createCommand } from "commander";
import { BiomeService } from "#/services/biome";
import type { Context } from "#/services/ctx";

export function createFormatCommand(ctx: Context) {
  return createCommand("fmt")
    .alias("format")
    .description("format the code 🎨")
    .option("-c, --check", "check if the code is formatted", true)
    .option("-f, --fix", "format all the code")
    .action(async function formatAction(options) {
      const { $ } = new BiomeService(ctx.shell);
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
