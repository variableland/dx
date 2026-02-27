import { createCommand } from "commander";
import { BiomeService } from "#/services/biome";
import type { Context } from "#/services/ctx";
import { OxfmtService } from "#/services/oxfmt";
import { OxlintService } from "#/services/oxlint";

type ActionParams = {
  args: string[];
};

function createToolCommand(toolBin: string) {
  // biome-ignore format: I prefer multi-line here
  return createCommand(toolBin)
    .helpCommand(false)
    .helpOption(false)
    .allowExcessArguments(true)
    .allowUnknownOption(true);
}

export function createToolsCommand(ctx: Context) {
  return createCommand("tools")
    .description("expose the internal tools 🛠️")
    .addCommand(
      createToolCommand("biome").action((_: unknown, { args }: ActionParams) => {
        const biomeService = new BiomeService(ctx.shell);
        biomeService.execute(args);
      }),
    )
    .addCommand(
      createToolCommand("oxfmt").action((_: unknown, { args }: ActionParams) => {
        const oxfmtService = new OxfmtService(ctx.shell);
        oxfmtService.execute(args);
      }),
    )
    .addCommand(
      createToolCommand("oxlint").action((_: unknown, { args }: ActionParams) => {
        const oxlintService = new OxlintService(ctx.shell);
        oxlintService.execute(args);
      }),
    );
}
