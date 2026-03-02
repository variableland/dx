import { createCommand } from "commander";
import { BiomeService } from "#/services/biome";
import type { Context } from "#/services/ctx";
import type { StaticChecker } from "#/types/tool";

type ActionOptions = {
  fix?: boolean;
  fixStaged?: boolean;
};

export function createJsCheckCommand(ctx: Context) {
  const checkerService: StaticChecker = new BiomeService(ctx.shell);

  return createCommand("jsc")
    .alias("jscheck")
    .alias("check")
    .summary(`check format and lint 🔍 (${checkerService.ui})`)
    .description(
      "Checks the code for formatting and linting issues, ensuring it adheres to the defined style and quality standards.",
    )
    .option("--fix", "try to fix issues automatically")
    .option("--fix-staged", "try to fix staged files only")
    .action(async function checkAction(options: ActionOptions) {
      await checkerService.check(options);
    })
    .addHelpText("afterAll", `\nUnder the hood, this command uses the ${checkerService.ui} CLI to check the code.`);
}
