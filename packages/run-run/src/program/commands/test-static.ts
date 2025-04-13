import { createCommand } from "commander";
import isCI from "is-ci";
import type { Context } from "~/services/ctx";
import { logger } from "~/services/logger";

export function createTestStaticCommand(ctx: Context) {
  return createCommand("test:static")
    .description("check format and lint issues ✅")
    .option("-f, --fix", "try to fix issues automatically")
    .option("--fix-staged", "try to fix staged files only")
    .action(async function testStaticAction(options) {
      const $ = ctx.shell.$;
      const toolCmd = (cmd = "check") => `biome ${cmd} --colors=force`;

      try {
        if (options.fix) {
          await $`${toolCmd()} --fix --unsafe`;
          return;
        }

        if (options.fixStaged) {
          await $`${toolCmd()} --no-errors-on-unmatched --fix --unsafe --staged`;
          return;
        }

        await $`${toolCmd(isCI ? "ci" : "check")}`;
      } catch (error) {
        logger.error(error);
        process.exit(1);
      }
    })
    .addHelpText("afterAll", "\nUnder the hood, this command uses the biome CLI to check the code.");
}
