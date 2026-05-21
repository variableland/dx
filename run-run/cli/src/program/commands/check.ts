import { type Command, createCommand } from "commander";
import { pluginAnnotation } from "#src/program/ui.ts";
import type { Context } from "#src/services/ctx.ts";
import { logger } from "#src/services/logger.ts";

/**
 * `rr check` is the umbrella that runs the JS check (lint+format) and the
 * TS type check together. Both subcommands are already wired into
 * commander as siblings (`rr jsc`, `rr tsc`), so we reuse the program's
 * command tree as the action registry instead of duplicating it: look the
 * sibling up by name and invoke its action via `parseAsync([])`, which
 * applies its declared option defaults exactly as if the user had typed
 * `rr jsc` directly.
 *
 * Commander binds the running command as `this` inside an action (see
 * `command.js` — `fn.apply(this, actionArgs)`). `this.parent` gives us the
 * parent program without any late-binding ceremony.
 */
export function createCheckCommand(ctx: Context) {
  return createCommand("check")
    .summary(`run static checks${checkAnnotation(ctx)}`)
    .description(
      "Runs `rr jsc` and `rr tsc` concurrently in-process. Aggregates their exit codes — non-zero when either subcommand fails.",
    )
    .action(async function checkAction(this: Command) {
      const program = this.parent;
      if (!program) {
        // Can only happen if this command is invoked detached from the root
        // program — current bin only constructs it as a subcommand.
        throw new Error("`rr check` requires the parent program to dispatch sibling subcommands.");
      }

      const targets = ["jsc", "tsc"];
      const cmds = targets.map((name) => ({ name, cmd: findCommand(program, name) }));

      const missing = cmds.filter(({ cmd }) => !cmd).map(({ name }) => name);
      if (missing.length > 0) {
        for (const name of missing) logger.error(`rr check: subcommand "${name}" is not registered.`);
        process.exitCode = 1;
        return;
      }

      const results = await Promise.allSettled(
        // biome-ignore lint/style/noNonNullAssertion: missing is guarded above
        cmds.map(({ cmd }) => cmd!.parseAsync([], { from: "user" })),
      );

      const failed: Array<{ name: string; reason: unknown }> = [];
      for (const [i, r] of results.entries()) {
        if (r.status === "rejected") failed.push({ name: cmds[i]?.name ?? "?", reason: r.reason });
      }
      if (failed.length > 0) {
        for (const { name, reason } of failed) {
          const msg = reason instanceof Error ? reason.message : String(reason);
          logger.error(`rr check (${name}): ${msg}`);
        }
        process.exitCode = 1;
      }
    });
}

function findCommand(program: Command, name: string): Command | undefined {
  return program.commands.find((c) => c.name() === name || c.aliases().includes(name));
}

/**
 * Mirrors the provider resolution of `jsc` + `tsc` and flattens the
 * underlying tool labels — e.g. biome (composed lint+format) + oxc (tsc)
 * renders as `(biome, oxlint)` rather than `(biome + biome, oxlint)`. When
 * neither sibling has a provider, falls back to the standard `(not
 * configured)` annotation so the help reads consistently with other
 * commands.
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
