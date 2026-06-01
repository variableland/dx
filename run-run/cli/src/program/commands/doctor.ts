import { doctorAction } from "#src/actions/doctor.ts";
import type { ContextValue } from "#src/services/context.ts";
import { createCommand } from "../base.ts";

export function createDoctorCommand(ctx: ContextValue) {
  return createCommand("doctor")
    .summary("run all plugin doctors")
    .description(
      "Runs the `doctor()` of every configured plugin capability. Each plugin reports ok / not working. The exit code is non-zero if any reports not working.",
    )
    .action(() => doctorAction({ ctx }));
}
