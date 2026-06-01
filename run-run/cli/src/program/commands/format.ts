import { doctorOneAction } from "#src/actions/doctor.ts";
import { formatAction } from "#src/actions/format.ts";
import type { ContextValue } from "#src/services/context.ts";
import { createCommand } from "../base.ts";

type ActionOptions = {
  fix?: boolean;
};

export function createFormatCommand(ctx: ContextValue) {
  return createCommand("format")
    .addCapabilities(["format"])
    .summary("check & fix format issues")
    .description(
      "Checks the code for formatting issues and optionally fixes them, ensuring it adheres to the defined style standards.",
    )
    .option("--fix", "format all the code")
    .action(async (options: ActionOptions = {}) => {
      const formatter = ctx.plugins.getServiceOrThrow("format");
      await formatAction({ ctx, formatter, options: { fix: options.fix } });
    })
    .addHelpTextAfter(ctx)
    .addDoctorCommand(async () => {
      const formatter = ctx.plugins.getServiceOrThrow("format");
      await doctorOneAction({ ctx, service: formatter });
    });
}
