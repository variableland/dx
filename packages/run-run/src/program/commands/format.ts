import { createCommand } from "commander";
import { BiomeService } from "#/services/biome";
import type { Context } from "#/services/ctx";
import { OxfmtService } from "#/services/oxfmt";
import type { Formatter } from "#/types/tool";

type ActionOptions = {
  fix?: boolean;
};

function getToolService(ctx: Context): Formatter {
  const { config } = ctx.config;

  if (config.future?.oxc) {
    return new OxfmtService(ctx.shell);
  }

  return new BiomeService(ctx.shell);
}

export function createFormatCommand(ctx: Context) {
  const toolService = getToolService(ctx);

  return createCommand("format")
    .summary(`check & fix format errors 🎨 (${toolService.ui})`)
    .description(
      "Checks the code for formatting issues and optionally fixes them, ensuring it adheres to the defined style standards.",
    )
    .option("--fix", "format all the code")
    .action(async function formatAction(options: ActionOptions) {
      await toolService.format(options);
    })
    .addHelpText("afterAll", `\nUnder the hood, this command uses the ${toolService.ui} CLI to format the code.`);
}
