import type { ShellService } from "@vlandoss/clibuddy";
import { createCommand } from "commander";
import { BiomeService } from "#/services/biome";
import type { Context } from "#/services/ctx";
import { OxfmtService } from "#/services/oxfmt";
import { OxlintService } from "#/services/oxlint";
import type { ToolService } from "#/services/tool";
import { TsdownService } from "#/services/tsdown";

type ActionParams = {
  args: string[];
};

function getToolService(bin: string, shell: ShellService): ToolService {
  switch (bin) {
    case "biome":
      return new BiomeService(shell);
    case "oxfmt":
      return new OxfmtService(shell);
    case "oxlint":
      return new OxlintService(shell);
    case "tsdown":
      return new TsdownService(shell);
    default:
      throw new Error(`Unknown tool: ${bin}`);
  }
}

function createToolCommand(bin: string, shell: ShellService) {
  const tool = getToolService(bin, shell);

  return createCommand(tool.bin)
    .helpCommand(false)
    .helpOption(false)
    .allowExcessArguments(true)
    .allowUnknownOption(true)
    .action(async (_: unknown, { args }: ActionParams) => {
      await tool.exec(args);
    });
}

export function createToolsCommand(ctx: Context) {
  return createCommand("tools")
    .description("expose the internal tools 🛠️")
    .addCommand(createToolCommand("biome", ctx.shell))
    .addCommand(createToolCommand("oxfmt", ctx.shell))
    .addCommand(createToolCommand("oxlint", ctx.shell))
    .addCommand(createToolCommand("tsdown", ctx.shell));
}
