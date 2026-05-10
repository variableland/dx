import { createCommand } from "commander";
import type { Context } from "#src/services/ctx.ts";

export function createXCommand(ctx: Context) {
  return createCommand("x")
    .summary("run multiple rr subcommands concurrently")
    .description("Run multiple rr subcommands concurrently (e.g. `rr x jsc tsc`).")
    .argument("<cmds...>", "rr subcommands to execute concurrently")
    .action(async function runXAction(cmds: string[]) {
      const { $ } = ctx.shell;
      const results = await Promise.allSettled(cmds.map((cmd) => $`rr ${cmd}`));
      if (results.some((r) => r.status === "rejected")) {
        process.exitCode = 1;
      }
    });
}
