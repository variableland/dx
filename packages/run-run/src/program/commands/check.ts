import { createCommand } from "commander";
import isCI from "is-ci";
import { BiomeService } from "#/services/biome";
import type { Context } from "#/services/ctx";

export function createCheckCommand(ctx: Context) {
  return createCommand("check")
    .alias("test:static")
    .description("check format and lint issues 🔍")
    .option("-f, --fix", "try to fix issues automatically")
    .option("--fix-staged", "try to fix staged files only")
    .action(async function checkAction(options) {
      const biome = new BiomeService(ctx.shell);
      const toolCmd = (cmd = "check") => `${cmd} --colors=force`;

      if (options.fix) {
        await biome.exec(`${toolCmd()} --fix`);
      } else if (options.fixStaged) {
        await biome.exec(`${toolCmd()} --no-errors-on-unmatched --fix --staged`);
      } else {
        await biome.exec(`${toolCmd(isCI ? "ci" : "check")}`);
      }
    })
    .addHelpText("afterAll", "\nUnder the hood, this command uses the biome CLI to check the code.");
}
