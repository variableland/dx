import { createCommand } from "commander";
import { BiomeService } from "~/services/biome";
import type { Context } from "~/services/ctx";

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
      createToolCommand("biome").action((_: unknown, { args }: { args: string[] }) => {
        const biomeService = new BiomeService(ctx.shell);
        biomeService.execute(args);
      }),
    );
}
