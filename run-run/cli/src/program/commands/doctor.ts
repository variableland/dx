import type { Pkg } from "@vlandoss/clibuddy";
import { createCommand } from "commander";
import type { Doctor } from "#src/plugin/types.ts";
import { PLUGIN_KINDS } from "#src/plugin/types.ts";
import type { Context } from "#src/services/ctx.ts";
import { logger } from "#src/services/logger.ts";
import { fanoutTitle, reportTask, runBoard, targetLabel } from "../board.ts";

/**
 * Subcommand factory used by every plugin-backed command (lint, format, jsc,
 * tsc, pack) to expose a `doctor` subcommand that verifies the underlying tool
 * is wired correctly. Renders the canonical `doctor (<tool>) · <pkg>` row like
 * every other single-target command — `doctor()` returns a `RunReport`.
 */
export function createDoctorSubcommand(service: Doctor, appPkg: Pkg) {
  return createCommand("doctor")
    .summary("check if the underlying tool is working correctly")
    .action(async function doctorAction() {
      const result = await runBoard([reportTask(targetLabel("doctor", service, appPkg), () => service.doctor())]);
      if (!result.ok) process.exitCode = 1;
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

      // Each tool's health check is one parallel board row — a fan-out across
      // tools, so the rows carry the tool name and the title omits a single tool.
      const tasks = services.map((svc) => reportTask(svc.ui, () => svc.doctor()));
      const result = await runBoard(tasks, { title: fanoutTitle("doctor", undefined, services.length, "tools") });
      if (!result.ok) process.exitCode = 1;
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
