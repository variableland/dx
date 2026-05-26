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

/** The canonical single-target row label, `<command> (<tool>) · <package>`, so every command reads alike. */
export function targetLabel(command: string, provider: Provider, appPkg: Pkg): string {
  return `${commandTool(command, provider)} ${palette.dim(`· ${pkgName(appPkg)}`)}`;
}

/**
 * The canonical fan-out section title, `<command> (<tool>) · <n> <unit>`. The
 * tool is omitted when the fan-out spans several tools (`rr doctor` → `doctor ·
 * 3 tools`), since the rows then carry the per-tool name.
 */
export function fanoutTitle(command: string, provider: Provider | undefined, count: number, unit: string): string {
  const head = provider ? commandTool(command, provider) : command;
  return `${head} · ${count} ${unit}`;
}

/** Bridges a check-family verb (returns a `RunReport`) to a board row, its `output` becoming the flushed detail. */
export function reportTask(label: string, run: () => Promise<RunReport>): BoardTask {
  return {
    label,
    async run() {
      const report = await run();
      return { ok: report.ok, detail: report.output };
    },
  };
}

// While `rr check` is dispatching, boards stay framed (to divide the sections)
// and their results land in this collector so `check` can print one verdict.
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
