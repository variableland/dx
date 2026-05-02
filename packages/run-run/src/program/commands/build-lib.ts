import { createCommand } from "commander";
import type { Context } from "#src/services/ctx.ts";
import { TsdownService } from "#src/services/tsdown.ts";
import { createDoctorSubcommand } from "./doctor.ts";

export function createBuildLibCommand(ctx: Context) {
  const tsdownService = new TsdownService(ctx.shell);

  return createCommand("build:lib")
    .summary(`build a ts library 🏗️ (${tsdownService.ui})`)
    .description(
      "Compiles TypeScript code into JavaScript and generates type declaration files, making it ready for distribution.",
    )
    .addCommand(createDoctorSubcommand(tsdownService))
    .action(async function buildAction() {
      await tsdownService.buildLib();
    })
    .addHelpText("afterAll", `\nUnder the hood, this command uses the ${tsdownService.ui} CLI to build the project.`);
}
