import { createCommand } from "commander";
import type { Context } from "#src/services/ctx.ts";
import { missingPluginError } from "../missing-plugin.ts";
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
    cmd.addCommand(createDoctorSubcommand(formatter));
  }

  cmd.action(async (options: ActionOptions = {}) => {
    if (!formatter) throw missingPluginError("format");
    await formatter.format(options);
  });

  if (formatter) {
    cmd.addHelpText("afterAll", `\nUnder the hood, this command uses the ${formatter.ui} CLI to format the code.`);
  }

  return cmd;
}
