import { reportTask, runBoard } from "#src/render/board.ts";
import { fanoutTitle, targetLabel } from "#src/render/labels.ts";
import type { ContextValue } from "#src/services/context.ts";
import { logger } from "#src/services/logger.ts";
import type { Doctor } from "#src/types/tool.ts";

/** A capability impl reduced to what `doctor` needs: its health check plus the label to render it under. */
export type DoctorService = Doctor & { readonly ui: string };

export type DoctorActionConfig = {
  ctx: ContextValue;
};

export type DoctorOneActionConfig = {
  ctx: ContextValue;
  service: DoctorService;
};

/**
 * A single tool's `doctor` as one board row (`doctor (<tool>) · <pkg>`), run in
 * that package — used by the `doctor` subcommand each plugin-backed command
 * exposes, except `tsc doctor`, which checks the packages `tsc` checks
 * (`tscDoctorAction`).
 */
export async function doctorOneAction({ ctx, service }: DoctorOneActionConfig): Promise<void> {
  const { appPkg } = ctx;
  const label = targetLabel("doctor", service, appPkg);
  const result = await runBoard([reportTask(label, () => service.doctor({ cwd: appPkg.dirPath }))]);
  if (!result.ok) process.exitCode = 1;
}

/**
 * Top-level `rr doctor` — runs the `doctor()` of every distinct capability
 * impl registered with the kernel, in the current package. Distinct because a
 * single plugin (e.g. biome) often serves multiple kinds (`lint`, `format`,
 * `jscheck`) from the same `BiomeService` instance; running its doctor three
 * times is wasteful. It stays one row per tool, so in a monorepo it doesn't fan
 * the typecheck provider out over the workspace the way `rr tsc doctor` does.
 */
export async function doctorAction({ ctx }: DoctorActionConfig): Promise<void> {
  const services = ctx.plugins.getAllServices();

  if (services.length === 0) {
    logger.info("No plugins configured. Use `rr plugins add <name>` to install one.");
    return;
  }

  // Each tool's health check is one parallel board row — a fan-out across
  // tools, so the rows carry the tool name and the title omits a single tool.
  const tasks = services.map((svc) => reportTask(svc.ui, () => svc.doctor({ cwd: ctx.appPkg.dirPath })));
  const result = await runBoard(tasks, { title: fanoutTitle("doctor", undefined, services.length, "tools") });
  if (!result.ok) process.exitCode = 1;
}
