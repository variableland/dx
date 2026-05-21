import { createCommand } from "commander";
import type { Context } from "#src/services/ctx.ts";
import { missingPluginError } from "../missing-plugin.ts";
import { pluginAnnotation } from "../ui.ts";
import { createDoctorSubcommand } from "./doctor.ts";

type ActionOptions = {
  check?: boolean;
  fix?: boolean;
};

export function createLintCommand(ctx: Context) {
  const linter = ctx.registry.get("lint");

  const cmd = createCommand("lint")
    .summary(`check & fix lint errors${pluginAnnotation(linter)}`)
    .description(
      "Checks the code for linting issues and optionally fixes them, ensuring it adheres to the defined quality standards.",
    )
    .option("-c, --check", "check if the code is valid", true)
    .option("--fix", "try to fix all the code");

  if (linter) {
    cmd.addCommand(createDoctorSubcommand(linter));
  }

  cmd.action(async (options: ActionOptions = {}) => {
    if (!linter) throw missingPluginError("lint");
    await linter.lint(options);
  });

  if (linter) {
    cmd.addHelpText("afterAll", `\nUnder the hood, this command uses the ${linter.ui} CLI to lint the code.`);
  }

  return cmd;
}
