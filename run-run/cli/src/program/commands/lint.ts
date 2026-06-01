import { doctorOneAction } from "#src/actions/doctor.ts";
import { lintAction } from "#src/actions/lint.ts";
import type { ContextValue } from "#src/services/context.ts";
import { createCommand } from "../base.ts";

type ActionOptions = {
  fix?: boolean;
};

export function createLintCommand(ctx: ContextValue) {
  return createCommand("lint")
    .addCapabilities(["lint"])
    .summary("check & fix lint issues")
    .description(
      "Checks the code for linting issues and optionally fixes them, ensuring it adheres to the defined quality standards.",
    )
    .option("-c, --check", "check if the code is valid", true)
    .option("--fix", "try to fix all the code")
    .action(async (options: ActionOptions = {}) => {
      const linter = ctx.plugins.getServiceOrThrow("lint");
      await lintAction({ ctx, linter, options: { fix: options.fix } });
    })
    .addHelpTextAfter(ctx)
    .addDoctorCommand(async () => {
      const linter = ctx.plugins.getServiceOrThrow("lint");
      await doctorOneAction({ ctx, service: linter });
    });
}
