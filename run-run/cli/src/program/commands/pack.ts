import { doctorOneAction } from "#src/actions/doctor.ts";
import { packAction } from "#src/actions/pack.ts";
import type { ContextValue } from "#src/services/context.ts";
import { createCommand } from "../base.ts";

export function createPackCommand(ctx: ContextValue) {
  return createCommand("pack")
    .addCapabilities(["pack"])
    .summary("pack a ts library")
    .description(
      "Compiles TypeScript code into JavaScript and generates type declaration files, packaging the library for distribution.",
    )
    .action(async () => {
      const packer = ctx.plugins.getServiceOrThrow("pack");
      await packAction({ ctx, packer });
    })
    .addHelpTextAfter(ctx)
    .addDoctorCommand(async () => {
      const packer = ctx.plugins.getServiceOrThrow("pack");
      await doctorOneAction({ ctx, service: packer });
    });
}
