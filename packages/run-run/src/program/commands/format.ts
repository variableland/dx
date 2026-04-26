import { createCommand } from "commander";
import { BiomeService } from "#src/services/biome.ts";
import type { Context } from "#src/services/ctx.ts";
import { OxfmtService } from "#src/services/oxfmt.ts";
import type { Formatter } from "#src/types/tool.ts";

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
