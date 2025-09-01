import { createCommand } from "commander";
import { CaddyService } from "~/services/caddy";
import { CaddyfileService } from "~/services/caddyfile";
import { FileService } from "~/services/file";
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

      const fileService = new FileService(caddyfilePath);
      await fileService.print();

      const caddyfileService = new CaddyfileService(caddyfilePath);
      const localDomains = await caddyfileService.getLocalDomains();
      const hosts = localDomains.map((d) => d.host);

      const hostsService = new HostsService(hosts);

      for (const domain of localDomains) {
        const { host, ports } = domain;

        const found = await hostsService.findHost(host);
        const formattedPorts = ports.map((p) => `:${p}`).join(", ");

        if (found) {
          logger.success("`%s` is configured -> %s", host, formattedPorts);
        } else {
          logger.warn("`%s` is not configured -> %s", host, formattedPorts);
        }
      }
    });
}
