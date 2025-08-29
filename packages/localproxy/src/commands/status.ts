import { createCommand } from "commander";
import { CaddyService } from "~/services/caddy";
import { HostsService } from "~/services/hosts";
import { logger } from "~/services/logger";
import type { Context } from "~/types";

export function createStatusCommand({ caddyfilePath }: Context) {
  return createCommand("status")
    .description("show configured localhosts")
    .action(async function statusAction() {
      const caddyService = new CaddyService(caddyfilePath);

      if (await caddyService.isRunning()) {
        logger.info("Caddy is running");
      } else {
        logger.warn("Caddy is not running. Use `localp start` to start it.");
      }

      const localDomains = caddyService.getLocalDomains();
      const hosts = localDomains.map((d) => d.host);

      const hostsService = new HostsService(hosts);

      for (const domain of localDomains) {
        const { host, port } = domain;
        const found = await hostsService.findHost(host);

        if (found) {
          logger.success("`%s` is configured -> :%s", host, port);
        } else {
          logger.warn("`%s` is not configured -> :%s", host, port);
        }
      }
    });
}
