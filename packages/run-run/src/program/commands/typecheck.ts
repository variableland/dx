import { createCommand } from "commander";
import type { Context } from "~/services/ctx";
import { logger } from "~/services/logger";

export function createTypecheckCommand(ctx: Context) {
  return createCommand("typecheck")
    .alias("tsc")
    .description("check if TypeScript code is well typed 🎨")
    .action(async function typecheckAction() {
      const { appPkg } = ctx;
      const $ = ctx.shell.$;

      try {
        if (appPkg?.hasFile("tsconfig.json")) {
          await $`tsc --noEmit`;
        } else {
          logger.info("No tsconfig.json found. Skipping type checking.");
        }
      } catch (error) {
        logger.error(error);
        process.exit(1);
      }
    })
    .addHelpText("afterAll", "\nUnder the hood, this command uses the TSC CLI to check the code.");
}
