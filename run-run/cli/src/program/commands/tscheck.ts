import { doctorOneAction } from "#src/actions/doctor.ts";
import { tscAction } from "#src/actions/tsc.ts";
import type { ContextValue } from "#src/services/context.ts";
import { createCommand } from "../base.ts";

export function createTsCheckCommand(ctx: ContextValue) {
  return createCommand("tsc")
    .alias("tscheck")
    .addCapabilities(["typecheck"])
    .summary("check types errors")
    .description(
      "Checks type errors, ensuring that the code adheres to the defined type constraints and helps catch potential issues before runtime.",
    )
    .action(async () => {
      const tsc = ctx.plugins.getServiceOrThrow("typecheck");
      await tscAction({ ctx, tsc });
    })
    .addHelpTextAfter(ctx)
    .addDoctorCommand(async () => {
      const tsc = ctx.plugins.getServiceOrThrow("typecheck");
      await doctorOneAction({ ctx, service: tsc });
    });
}
