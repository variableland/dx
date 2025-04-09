import { createCommand } from "commander";
import isCI from "is-ci";
import { console } from "~/services/console";
import { shell } from "~/services/shell";

export const testStaticCommand = createCommand("test:static")
  .description("check format and lint issues ✅")
  .option("-f, --fix", "try to fix issues automatically")
  .option("--fix-staged", "try to fix staged files only")
  .action(async function testStaticAction(options) {
    const toolCmd = (cmd = "check") => `biome ${cmd} --colors=force`;

    try {
      if (options.fix) {
        await shell.$`${toolCmd()} --fix --unsafe`;
        return;
      }

      if (options.fixStaged) {
        await shell.$`${toolCmd()} --no-errors-on-unmatched --fix --unsafe --staged`;
        return;
      }

      await shell.$`${toolCmd(isCI ? "ci" : "check")}`;
    } catch (error) {
      console.error(error);
      process.exit(1);
    }
  })
  .addHelpText("afterAll", "\nUnder the hood, this command uses the biome CLI to check the code.");
