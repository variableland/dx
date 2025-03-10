import { createCommand } from "commander";
import isCI from "is-ci";
import { $ } from "~/shell";

export const testStaticCommand = createCommand("test:static")
  .description("check format and lint issues ✅")
  .option("-f, --fix", "try to fix issues automatically")
  .option("--fix-staged", "try to fix staged files only")
  .action(async function testStaticAction(options) {
    try {
      const toolCmd = `biome ${isCI ? "ci" : "check"} --colors=force`;

      if (options.fix) {
        await $`${toolCmd} --fix --unsafe`;
        return;
      }

      if (options.fixStaged) {
        await $`${toolCmd} --no-errors-on-unmatched --fix --unsafe --staged`;
        return;
      }

      await $`${toolCmd}`;
    } catch {
      process.exit(1);
    }
  })
  .addHelpText("afterAll", "\nUnder the hood, this command uses the biome CLI to check the code.");
