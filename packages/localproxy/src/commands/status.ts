import { createCommand } from "commander";
import { CaddyService } from "#src/services/caddy.ts";
import { CaddyfileService } from "#src/services/caddyfile/index.ts";
import { FileService } from "#src/services/file.ts";
import { HostsService } from "#src/services/hosts.ts";
import { logger } from "#src/services/logger.ts";
import type { Context } from "#src/types.ts";

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

      const hostsService = new HostsService();
      const enabledHosts = await hostsService.getEnabledHosts();

      localDomains.forEach(({ hostname, ports }) => {
        const enabled = enabledHosts.some((h) => h.hostname === hostname);
        const formattedPorts = ports.map((p) => `:${p}`).join(", ");

        if (enabled) {
          logger.success("`%s` is configured -> %s", hostname, formattedPorts);
        } else {
          logger.warn("`%s` is not configured -> %s", hostname, formattedPorts);
        }
      });
    });
}
