import { createCommand } from "commander";
import { logger } from "#src/services/logger.ts";
import type { Doctor } from "#src/types/tool.ts";

export function createDoctorSubcommand(service: Doctor) {
  return createCommand("doctor")
    .summary("check if the underlying tool is working correctly")
    .action(async function doctorAction() {
      const debug = logger.subdebug("doctor");
      const { ok, output } = await service.doctor();

      if (ok) {
        logger.success(`${service.ui} ok`);
        debug("%O", output);
      } else {
        logger.error(`${service.ui} not working`);
        debug("%O", output);
        process.exit(output.exitCode ?? 1);
      }
    });
}
