import { palette } from "@vlandoss/clibuddy";
import { jscAction } from "#src/actions/jsc.ts";
import { tscAction } from "#src/actions/tsc.ts";
import { runCheckSections } from "#src/render/board.ts";
import type { ContextValue } from "#src/services/context.ts";
import { logger } from "#src/services/logger.ts";
import { createCommand } from "../base.ts";

/**
 * `rr check` — runs jsc then tsc. Rather than dispatch through commander's
 * command tree, it calls the same `jscAction`/`tscAction` directly — each
 * wrapped in its own `runCheckSections` scope so failures are attributed by
 * section name. A blank line separates the sections; `checkVerdict` is the
 * final overall line.
 */
export function createCheckCommand(ctx: ContextValue) {
  return createCommand("check")
    .addCapabilities(["lint", "format", "jscheck", "typecheck"])
    .summary("run static checks")
    .description(
      "Runs `rr jsc` then `rr tsc` in-process, each as its own section. Aggregates their exit codes — non-zero when either subcommand fails.",
    )
    .action(async () => {
      const sections: Array<{ name: string; run: () => Promise<void> }> = [
        {
          name: "jsc",
          run: () => jscAction({ ctx, checker: ctx.plugins.getJsChecker(), options: {} }),
        },
        {
          name: "tsc",
          run: () => tscAction({ ctx, tsc: ctx.plugins.getServiceOrThrow("typecheck") }),
        },
      ];

      // Sequentially, not in parallel: two live boards can't animate the same
      // terminal region at once (decision 012).
      const start = Date.now();
      const failed: string[] = [];
      let rendered = false;
      for (const section of sections) {
        if (rendered) process.stderr.write("\n"); // one blank line between sections
        let threw = false;
        const results = await runCheckSections(async () => {
          try {
            await section.run();
          } catch (reason) {
            logger.error(`rr check (${section.name}): ${reason instanceof Error ? reason.message : String(reason)}`);
            threw = true;
          }
        });
        if (threw || results.some((r) => !r.ok)) failed.push(section.name);
        rendered = true;
      }

      // One overall verdict so the bottom of the scroll always answers "did
      // check pass?" — a green section summary can otherwise be the last line
      // of a run that failed in the section above it.
      process.stderr.write(`\n${checkVerdict(failed, Date.now() - start)}\n`);
      if (failed.length > 0) process.exitCode = 1;
    })
    .addHelpTextAfter(ctx);
}

function checkVerdict(failed: string[], ms: number): string {
  const elapsed = palette.dim(ms < 1000 ? `${Math.round(ms)}ms` : `${(ms / 1000).toFixed(1)}s`);
  const sep = palette.dim(" · ");
  if (failed.length > 0) {
    return `${palette.error("✖")} check failed${sep}${[...new Set(failed)].join(", ")}${sep}${elapsed}`;
  }
  return `${palette.success("✔")} check passed${sep}${elapsed}`;
}
