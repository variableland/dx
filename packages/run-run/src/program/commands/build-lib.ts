import { createCommand } from "commander";
import { TOOL_LABELS } from "#src/program/ui.ts";
import type { Context } from "#src/services/ctx.ts";
import { TsdownService } from "#src/services/tsdown.ts";
import { createDoctorSubcommand } from "./doctor.ts";

export function createBuildLibCommand(ctx: Context) {
  const tsdownService = new TsdownService(ctx.shell);

  return createCommand("build:lib")
    .summary(`build a ts library 🏗️ (${TOOL_LABELS.TSDOWN})`)
    .description(
      "Compiles TypeScript code into JavaScript and generates type declaration files, making it ready for distribution.",
    )
    .addCommand(createDoctorSubcommand(tsdownService))
    .action(async function buildAction() {
      await ctx.shell.$`tsdown`;
    })
    .addHelpText("afterAll", `\nUnder the hood, this command uses the ${TOOL_LABELS.TSDOWN} CLI to build the project.`);
}
