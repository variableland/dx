import { createCommand } from "commander";
import { CaddyService } from "~/services/caddy";
import { HostsService } from "~/services/hosts";
import { logger } from "~/services/logger";
import type { Context } from "~/types";

type CommandOptions = {
  verbose: boolean;
};

export function createCleanCommand({ caddyfilePath }: Context) {
  return createCommand("clean")
    .description("clean up config files")
    .option("--verbose", "verbose mode, show background output", false)
    .action(async (options: CommandOptions) => {
      const caddyService = new CaddyService(caddyfilePath);
      await caddyService.stop(options);

      const localDomains = caddyService.getLocalDomains();
      const hosts = localDomains.map((d) => d.host);

      const hostsService = new HostsService(hosts);
      await hostsService.clean(options);

      logger.success("localproxy clean completed");
    });
}
