import { createCommand } from "commander";
import { UI_LOGO } from "~/program/ui";
import { BiomeService } from "~/services/biome";
import type { Context } from "~/services/ctx";
import { logger } from "~/services/logger";

function createToolCommand(toolBin: string) {
  return createCommand(toolBin)
    .helpCommand(false)
    .helpOption(false)
    .allowExcessArguments(true)
    .allowUnknownOption(true)
    .hook("preAction", (command) => {
      logger.info(`Running ${UI_LOGO} tool: ${command.name()}`);
    });
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
