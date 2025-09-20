import { createCommand } from "commander";
import { CaddyService } from "#/services/caddy";
import { logger } from "#/services/logger";
import type { Context } from "#/types";

type CommandOptions = {
  verbose: boolean;
};

export function createStartCommand({ caddyfilePath }: Context) {
  return createCommand("start")
    .description("start caddy server")
    .option("--verbose", "verbose mode, show background output", false)
    .action(async function startAction(options: CommandOptions) {
      const caddyService = new CaddyService(caddyfilePath);
      await caddyService.start(options);

      logger.success("Start completed!");
    });
}
