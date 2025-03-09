import { createCommand } from "commander";
import isCI from "is-ci";
import { $ } from "~/shell";

export const testStaticCommand = createCommand("test:static")
  .description("check format and lint issues over all the code ✅")
  .option("-f, --fix", "try to fix issues automatically")
  .action(async function testStaticAction(options) {
    try {
      const toolCmd = `biome ${isCI ? "ci" : "check"} --colors=force`;

      if (options.fix) {
        await $`${toolCmd} --fix --unsafe`;
      } else {
        await $`${toolCmd}`;
      }
    } catch {
      process.exit(1);
    }
  })
  .addHelpText("afterAll", "\nUnder the hood, this command uses the biome CLI to format the code.");
