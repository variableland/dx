import { createCommand } from "commander";
import { TOOL_LABELS } from "#/program/ui";
import type { Context } from "#/services/ctx";

export function createBuildLibCommand(ctx: Context) {
  return createCommand("build:lib")
    .summary(`build a ts library 🏗️ (${TOOL_LABELS.TSDOWN})`)
    .description(
      "Compiles TypeScript code into JavaScript and generates type declaration files, making it ready for distribution.",
    )
    .action(async function buildAction() {
      await ctx.shell.$`tsdown`;
    })
    .addHelpText("afterAll", `\nUnder the hood, this command uses the ${TOOL_LABELS.TSDOWN} CLI to build the project.`);
}
