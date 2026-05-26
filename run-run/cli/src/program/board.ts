import { basename } from "node:path";
import { type BoardOptions, type BoardResult, type BoardTask, type Pkg, palette, runTaskBoard } from "@vlandoss/clibuddy";
import type { PluginKind, RunReport } from "#src/plugin/types.ts";
import type { Context } from "#src/services/ctx.ts";
import { missingPluginError } from "./missing-plugin.ts";

export type { BoardResult, BoardTask };

type Provider = { bin?: string; ui: string };

/** `<command> (<tool>)`, deduped to just `<command>` when the tool's binary is the command itself (e.g. `tsc`). */
function commandTool(command: string, provider: Provider): string {
  return provider.bin === command ? command : `${command} (${provider.ui})`;
}

function pkgName(appPkg: Pkg): string {
  return appPkg.packageJson.name ?? basename(appPkg.dirPath);
}

/**
 * The one canonical row label for a single-target run: `<command> (<tool>) · <package>`.
 * Every command/subcommand that acts on one target (lint, format, jsc, pack,
 * single-app tsc, a `doctor` subcommand) builds its row through here so they
 * all read identically.
 */
export function targetLabel(command: string, provider: Provider, appPkg: Pkg): string {
  return `${commandTool(command, provider)} ${palette.dim(`· ${pkgName(appPkg)}`)}`;
}

/**
 * The one canonical section title for a fan-out run: `<command> (<tool>) · <n> <unit>`
 * (e.g. `tsc (oxlint) · 8 packages`). The tool is omitted when the fan-out
 * spans several tools (`rr doctor` → `doctor · 3 tools`); the rows then carry
 * the per-unit name.
 */
export function fanoutTitle(command: string, provider: Provider | undefined, count: number, unit: string): string {
  const head = provider ? commandTool(command, provider) : command;
  return `${head} · ${count} ${unit}`;
}

/**
 * Bridges a check-family verb (which returns a `RunReport`) to a board row.
 * The row's spinner reflects the in-flight run; the captured `output` becomes
 * the detail the board flushes grouped under the label.
 */
export function reportTask(label: string, run: () => Promise<RunReport>): BoardTask {
  return {
    label,
    async run() {
      const report = await run();
      return { ok: report.ok, detail: report.output };
    },
  };
}

// `rr check` runs several single-task sections (jsc, tsc) back to back. On its
// own each would render compactly, but the frame is what visually divides the
// sections — so while check is dispatching, force every board to stay framed.
// While active, the collector also gathers each section's result in run order
// so `check` can print one overall verdict.
let collector: BoardResult[] | null = null;

export async function runCheckSections(run: () => Promise<void>): Promise<BoardResult[]> {
  const previous = collector;
  collector = [];
  try {
    await run();
    return collector;
  } finally {
    collector = previous;
  }
}

/** Runs the rows on the board and returns whether every row passed. */
export async function runBoard(tasks: BoardTask[], options: BoardOptions = {}): Promise<BoardResult> {
  const sink = collector;
  const result = await runTaskBoard(tasks, { ...options, frame: options.frame ?? (sink !== null || undefined) });
  // Record into the active check collector synchronously (we already awaited the
  // board), so it's populated before our caller's `await runBoard(...)` resolves
  // — no microtask race with the section's own continuation.
  if (sink) sink.push(result);
  return result;
}

/**
 * The shared action body for a single-provider tool command (lint, format, jsc,
 * pack): require the provider, run its verb as one board row labelled
 * `<name> (<tool>) · <pkg>`, and aggregate the exit code. Commands that fan out
 * (tsc) or compose siblings (check) call `runBoard` directly instead.
 */
export async function runToolCommand<P extends Provider>(
  ctx: Context,
  spec: { name: string; kind: PluginKind; provider: P | undefined; run: (provider: P) => Promise<RunReport> },
): Promise<void> {
  const { provider } = spec;
  if (!provider) throw missingPluginError(spec.kind);
  const result = await runBoard([reportTask(targetLabel(spec.name, provider, ctx.appPkg), () => spec.run(provider))]);
  if (!result.ok) process.exitCode = 1;
}
