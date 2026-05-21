import { createCommand } from "commander";
import type { Doctor, DoctorResult } from "#src/plugin/types.ts";
import { PLUGIN_KINDS } from "#src/plugin/types.ts";
import type { Context } from "#src/services/ctx.ts";
import { logger } from "#src/services/logger.ts";

/**
 * Subcommand factory used by every plugin-backed command (lint, format, jsc,
 * tsc, pack) to expose a `doctor` subcommand that verifies the underlying
 * tool is wired correctly. Each calls this with its own provider.
 */
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

/**
 * Top-level `rr doctor` — runs the `doctor()` of every distinct capability
 * impl registered with the kernel. Distinct because a single plugin (e.g.
 * biome) often serves multiple kinds (`lint`, `format`, `jsc`) from the same
 * `BiomeService` instance; running its doctor three times is wasteful.
 */
export function createDoctorCommand(ctx: Context) {
  return createCommand("doctor")
    .summary("run all plugin doctors")
    .description(
      "Runs the `doctor()` of every configured plugin capability. Each plugin reports ok / not working. The exit code is non-zero if any reports not working.",
    )
    .action(async () => {
      const services = collectDistinctDoctors(ctx);
      if (services.length === 0) {
        logger.info("No plugins configured. Use `rr plugins add <name>` to install one.");
        return;
      }

      const debug = logger.subdebug("doctor");
      const results = await Promise.all(
        services.map(async (svc) => {
          const result = await svc.doctor();
          return { svc, result };
        }),
      );

      let failures = 0;
      for (const { svc, result } of results) {
        if (result.ok) {
          logger.success(`${svc.ui} ok`);
          debug("%s: %O", svc.ui, result.output);
        } else {
          logger.error(`${svc.ui} not working`);
          debug("%s: %O", svc.ui, result.output);
          failures++;
        }
      }

      if (failures > 0) process.exitCode = 1;
    });
}

function collectDistinctDoctors(ctx: Context): Doctor[] {
  const seen = new Set<Doctor>();
  for (const kind of PLUGIN_KINDS) {
    for (const { impl } of ctx.registry.providersOf(kind)) {
      // Capability impls carry `doctor` via the Doctor intersection; dedup
      // by reference so a single service that backs multiple kinds runs once.
      seen.add(impl as unknown as Doctor);
    }
  }
  return [...seen];
}

export type { Doctor as _Doctor, DoctorResult as _DoctorResult };
