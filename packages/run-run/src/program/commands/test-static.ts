import { createCommand } from "commander";
import { TOOL_LABELS } from "#/program/ui";
import type { Context } from "#/services/ctx";

export function createTestStaticCommand(ctx: Context) {
  return createCommand("test:static")
    .summary(`run static tests 🔬 (${TOOL_LABELS.RUN_RUN})`)
    .description(
      "Runs static tests, including linting, formatting checks, and TypeScript type checking, to ensure code quality and correctness without executing the code.",
    )
    .action(async function testStaticAction() {
      await ctx.shell.$`rr jscheck tscheck`;
    });
}
