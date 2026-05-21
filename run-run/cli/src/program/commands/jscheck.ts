import { createCommand } from "commander";
import type { Context } from "#src/services/ctx.ts";
import { composedJscProvider } from "../composed-jsc.ts";
import { missingPluginError } from "../missing-plugin.ts";
import { pluginAnnotation } from "../ui.ts";
import { createDoctorSubcommand } from "./doctor.ts";

type ActionOptions = {
  fix?: boolean;
  fixStaged?: boolean;
};

export function createJsCheckCommand(ctx: Context) {
  const direct = ctx.registry.get("jsc");
  const linter = ctx.registry.get("lint");
  const formatter = ctx.registry.get("format");
  // Compose only when no plugin claims `jsc` directly and we have both
  // building blocks separately (e.g. oxc, or eslint + prettier).
  const checker = direct ?? (linter && formatter ? composedJscProvider(linter, formatter) : undefined);

  const cmd = createCommand("jsc")
    .alias("jscheck")
    .summary(`check format and lint${pluginAnnotation(checker)}`)
    .description(
      "Checks the code for formatting and linting issues, ensuring it adheres to the defined style and quality standards.",
    )
    .option("--fix", "try to fix issues automatically")
    .option("--fix-staged", "try to fix staged files only");

  if (checker) {
    cmd.addCommand(createDoctorSubcommand(checker));
  }

  cmd.action(async (options: ActionOptions = {}) => {
    if (!checker) throw missingPluginError("jsc");
    await checker.check(options);
  });

  if (checker) {
    cmd.addHelpText("afterAll", `\nUnder the hood, this command uses the ${checker.ui} CLI to check the code.`);
  }

  return cmd;
}
