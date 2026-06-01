import { doctorOneAction } from "#src/actions/doctor.ts";
import { jscAction } from "#src/actions/jsc.ts";
import type { ContextValue } from "#src/services/context.ts";
import { createCommand } from "../base.ts";

type ActionOptions = {
  fix?: boolean;
  fixStaged?: boolean;
};

export function createJsCheckCommand(ctx: ContextValue) {
  return createCommand("jsc")
    .alias("jscheck")
    .addCapabilities(["lint", "format", "jscheck"])
    .summary("check format and lint")
    .description(
      "Checks the code for formatting and linting issues, ensuring it adheres to the defined style and quality standards.",
    )
    .option("--fix", "try to fix issues automatically")
    .option("--fix-staged", "try to fix staged files only")
    .action(async (options: ActionOptions = {}) => {
      const checker = ctx.plugins.getJsChecker();
      await jscAction({ ctx, checker, options: { fix: options.fix, fixStaged: options.fixStaged } });
    })
    .addHelpTextAfter(ctx)
    .addDoctorCommand(async () => {
      const checker = ctx.plugins.getJsChecker();
      await doctorOneAction({ ctx, service: checker });
    });
}
