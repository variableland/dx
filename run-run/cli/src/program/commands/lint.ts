import { createCommand } from "commander";
import type { Context } from "#src/services/ctx.ts";
import { runToolCommand } from "../board.ts";
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
    cmd.addCommand(createDoctorSubcommand(linter, ctx.appPkg));
  }

  cmd.action(async (options: ActionOptions = {}) => {
    await runToolCommand(ctx, { name: "lint", kind: "lint", provider: linter, run: (p) => p.lint(options) });
  });

  if (linter) {
    cmd.addHelpText("afterAll", `\nUnder the hood, this command uses the ${linter.ui} CLI to lint the code.`);
  }

  return cmd;
}
