import { createCommand } from "commander";
import { CaddyService } from "#src/services/caddy.ts";
import { CaddyfileService } from "#src/services/caddyfile/index.ts";
import { HostsService } from "#src/services/hosts.ts";
import { logger } from "#src/services/logger.ts";
import type { Context } from "#src/types.ts";

type CommandOptions = {
  verbose: boolean;
};

export function createCleanCommand({ caddyfilePath }: Context) {
  return createCommand("clean")
    .description("clean up config files")
    .option("--verbose", "verbose mode, show background output", false)
    .action(async function cleanAction(options: CommandOptions) {
      const { verbose } = options;

      const caddyService = new CaddyService(caddyfilePath);
      await caddyService.stop({ verbose });

      const caddyfileService = new CaddyfileService(caddyfilePath);
      const localDomains = await caddyfileService.getLocalDomains();
      const hostnames = localDomains.map((d) => d.hostname);

      const hostsService = new HostsService();
      await hostsService.clean({ verbose, hostnames });

      logger.success("Clean completed!");
    });
}
