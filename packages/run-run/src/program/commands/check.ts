import { createCommand } from "commander";
import { TOOL_LABELS } from "#src/program/ui.ts";
import type { Context } from "#src/services/ctx.ts";

export function createCheckCommand(ctx: Context) {
  return createCommand("check")
    .summary(`run static checks 🔬 (${TOOL_LABELS.RUN_RUN})`)
    .description(
      "Runs static checks, including linting, formatting checks, and TypeScript type checking, to ensure code quality and correctness without executing the code.",
    )
    .action(async function checkAction() {
      await ctx.shell.run("rr", ["x", "jscheck", "tscheck"]);
    });
}
