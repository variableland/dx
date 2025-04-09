import { createCommand } from "commander";
import { console } from "~/services/console";
import { ctx } from "~/services/ctx";
import { $ } from "~/services/shell";

export const typecheckCommand = createCommand("typecheck")
  .alias("tsc")
  .description("check if TypeScript code is well typed 🎨")
  .action(async function typecheckAction() {
    const { appPkg } = ctx.value;

    try {
      if (appPkg?.hasFile("tsconfig.json")) {
        await $`tsc --noEmit`;
      } else {
        console.info("No tsconfig.json found. Skipping type checking.");
      }
    } catch (error) {
      console.error(error);
      process.exit(1);
    }
  })
  .addHelpText("afterAll", "\nUnder the hood, this command uses the TSC CLI to check the code.");
