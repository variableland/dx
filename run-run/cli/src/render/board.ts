import { type BoardOptions, type BoardResult, type BoardTask, runTaskBoard } from "@vlandoss/clibuddy";
import type { RunReport } from "#src/types/tool.ts";

export type { BoardResult, BoardTask };

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
