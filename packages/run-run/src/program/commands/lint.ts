import { createCommand } from "commander";
import { BiomeService } from "#/services/biome";
import type { Context } from "#/services/ctx";
import { OxlintService } from "#/services/oxlint";
import type { Linter } from "#/types/tool";

type ActionOptions = {
  check?: boolean;
  fix?: boolean;
};

function getToolService(ctx: Context): Linter {
  const { config } = ctx.config;

  if (config.future?.oxc) {
    return new OxlintService(ctx.shell);
  }

  return new BiomeService(ctx.shell);
}

export function createLintCommand(ctx: Context) {
  const toolService = getToolService(ctx);

  return createCommand("lint")
    .summary(`check & fix lint errors 🔍 (${toolService.ui})`)
    .description(
      "Checks the code for linting issues and optionally fixes them, ensuring it adheres to the defined quality standards.",
    )
    .option("-c, --check", "check if the code is valid", true)
    .option("--fix", "try to fix all the code")
    .action(async function lintAction(options: ActionOptions) {
      await toolService.lint(options);
    })
    .addHelpText("afterAll", `\nUnder the hood, this command uses the ${toolService.ui} CLI to lint the code.`);
}
