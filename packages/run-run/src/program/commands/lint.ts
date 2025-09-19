import { createCommand } from "commander";
import { BiomeService } from "#/services/biome";
import type { Context } from "#/services/ctx";

export function createLintCommand(ctx: Context) {
  return createCommand("lint")
    .description("lint the code 🧹")
    .option("-c, --check", "check if the code is valid", true)
    .option("-f, --fix", "try to fix all the code")
    .action(async function lintAction(options) {
      const { $ } = new BiomeService(ctx.shell);
      const toolCmd = "biome check --colors=force --formatter-enabled=false";

      if (options.fix) {
        await $`${toolCmd} --fix --unsafe`;
        return;
      }

      if (options.check) {
        await $`${toolCmd}`;
      }
    })
    .addHelpText("afterAll", "\nUnder the hood, this command uses the biome CLI to lint the code.");
}
