import { createCommand } from "commander";
import type { Context } from "#src/services/ctx.ts";
import { runToolCommand } from "../board.ts";
import { pluginAnnotation } from "../ui.ts";
import { createDoctorSubcommand } from "./doctor.ts";

type ActionOptions = {
  fix?: boolean;
};

export function createFormatCommand(ctx: Context) {
  const formatter = ctx.registry.get("format");

  const cmd = createCommand("format")
    .summary(`check & fix format errors${pluginAnnotation(formatter)}`)
    .description(
      "Checks the code for formatting issues and optionally fixes them, ensuring it adheres to the defined style standards.",
    )
    .option("--fix", "format all the code");

  if (formatter) {
    cmd.addCommand(createDoctorSubcommand(formatter, ctx.appPkg));
  }

  cmd.action(async (options: ActionOptions = {}) => {
    await runToolCommand(ctx, { name: "format", kind: "format", provider: formatter, run: (p) => p.format(options) });
  });

  if (formatter) {
    cmd.addHelpText("afterAll", `\nUnder the hood, this command uses the ${formatter.ui} CLI to format the code.`);
  }

  return cmd;
}
