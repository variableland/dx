import { Log } from "@variableland/console";
import { createCommand } from "commander";
import { $ } from "~/shell";
import { useStore } from "~/store";

export const typecheckCommand = createCommand("typecheck")
  .alias("tsc")
  .description("check if TypeScript code is well typed 🎨")
  .action(async function typecheckAction() {
    const store = useStore();

    try {
      if (store.appPkg?.hasFile("tsconfig.json")) {
        await $`tsc --noEmit`;
      } else {
        Log.info("No tsconfig.json found. Skipping type checking.");
      }
    } catch {
      process.exit(1);
    }
  })
  .addHelpText("afterAll", "\nUnder the hood, this command uses the TSC CLI to check the code.");
