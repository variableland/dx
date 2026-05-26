import { palette } from "@vlandoss/clibuddy";
import { type Command, createCommand } from "commander";
import { runCheckSections } from "#src/program/board.ts";
import { pluginAnnotation } from "#src/program/ui.ts";
import type { Context } from "#src/services/ctx.ts";
import { logger } from "#src/services/logger.ts";

/**
 * `rr check` runs `jsc` then `tsc`. Rather than keep a parallel action
 * registry, it reuses commander's command tree: it finds each sibling on
 * `this.parent` and runs it via `parseAsync([])`, which applies the sibling's
 * own option defaults. (`this` is the running command inside a non-arrow
 * action — see cli/CLAUDE.md.)
 */
export function createCheckCommand(ctx: Context) {
  return createCommand("check")
    .summary(`run static checks${checkAnnotation(ctx)}`)
    .description(
      "Runs `rr jsc` then `rr tsc` in-process, each as its own section. Aggregates their exit codes — non-zero when either subcommand fails.",
    )
    .action(async function checkAction(this: Command) {
      const program = this.parent;
      if (!program) {
        // Can only happen if this command is invoked detached from the root
        // program — current bin only constructs it as a subcommand.
        throw new Error("`rr check` requires the parent program to dispatch sibling subcommands.");
      }

      // Sequentially, not in parallel: two live boards can't animate the same
      // terminal region at once (decision 012). Each section runs in its own
      // `runCheckSections` scope, which frames it and returns the boards it
      // rendered — so a failure is attributed by section name, not a fragile
      // dispatch-vs-render index.
      const start = Date.now();
      const failed: string[] = [];
      let rendered = false;
      for (const name of ["jsc", "tsc"]) {
        const cmd = findCommand(program, name);
        if (!cmd) {
          logger.error(`rr check: subcommand "${name}" is not registered.`);
          failed.push(name);
          continue;
        }
        if (rendered) process.stderr.write("\n"); // one blank line between sections
        let threw = false;
        const results = await runCheckSections(async () => {
          try {
            await cmd.parseAsync([], { from: "user" });
          } catch (reason) {
            logger.error(`rr check (${name}): ${reason instanceof Error ? reason.message : String(reason)}`);
            threw = true;
          }
        });
        if (threw || results.some((r) => !r.ok)) failed.push(name);
        rendered = true;
      }

      // One overall verdict so the bottom of the scroll always answers "did
      // check pass?" — a green section summary can otherwise be the last line
      // of a run that failed in the section above it.
      process.stderr.write(`\n${checkVerdict(failed, Date.now() - start)}\n`);
      if (failed.length > 0) process.exitCode = 1;
    });
}

function checkVerdict(failed: string[], ms: number): string {
  const elapsed = palette.dim(ms < 1000 ? `${Math.round(ms)}ms` : `${(ms / 1000).toFixed(1)}s`);
  const sep = palette.dim(" · ");
  if (failed.length > 0) {
    return `${palette.error("✖")} check failed${sep}${[...new Set(failed)].join(", ")}${sep}${elapsed}`;
  }
  return `${palette.success("✔")} check passed${sep}${elapsed}`;
}

function findCommand(program: Command, name: string): Command | undefined {
  return program.commands.find((c) => c.name() === name || c.aliases().includes(name));
}

/**
 * Flattens the underlying tool labels of `jsc` + `tsc` for the help summary —
 * e.g. `(biome, oxlint)`, deduped, not `(biome + biome, oxlint)`. Falls back to
 * the standard `(not configured)` when neither sibling has a provider.
 */
function checkAnnotation(ctx: Context): string {
  const directJsc = ctx.registry.get("jsc");
  const linter = ctx.registry.get("lint");
  const formatter = ctx.registry.get("format");
  const tsc = ctx.registry.get("tsc");

  const labels: string[] = [];
  if (directJsc) {
    labels.push(directJsc.ui);
  } else {
    if (linter) labels.push(linter.ui);
    if (formatter) labels.push(formatter.ui);
  }
  if (tsc) labels.push(tsc.ui);

  if (labels.length === 0) return pluginAnnotation(undefined);
  const distinct = [...new Set(labels)];
  return pluginAnnotation({ ui: distinct.join(", ") });
}
