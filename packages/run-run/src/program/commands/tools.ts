import type { ShellService } from "@vlandoss/clibuddy";
import { createCommand } from "commander";
import { BiomeService } from "#src/services/biome.ts";
import type { Context } from "#src/services/ctx.ts";
import { OxfmtService } from "#src/services/oxfmt.ts";
import { OxlintService } from "#src/services/oxlint.ts";
import type { ToolService } from "#src/services/tool.ts";
import { TsdownService } from "#src/services/tsdown.ts";

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
    .passThroughOptions()
    .addCommand(createToolCommand("biome", ctx.shell))
    .addCommand(createToolCommand("oxfmt", ctx.shell))
    .addCommand(createToolCommand("oxlint", ctx.shell))
    .addCommand(createToolCommand("tsdown", ctx.shell));
}
