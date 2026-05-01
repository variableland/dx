import { createCommand } from "commander";
import { CaddyService } from "#/services/caddy.ts";
import { logger } from "#/services/logger.ts";
import type { Context } from "#/types.ts";

type CommandOptions = {
  verbose: boolean;
};

export function createStopCommand({ caddyfilePath }: Context) {
  return createCommand("stop")
    .description("stop caddy server")
    .option("--verbose", "verbose mode, show background output", false)
    .action(async function stopAction(options: CommandOptions) {
      const caddyService = new CaddyService(caddyfilePath);
      await caddyService.stop(options);

      logger.success("Stop completed!");
    });
}
