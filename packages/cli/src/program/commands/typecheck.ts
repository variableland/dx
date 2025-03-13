import { createCommand } from "commander";
import { Log } from "~/logger";
import { $ } from "~/shell";
import { useStore } from "~/store";

export const typecheckCommand = createCommand("typecheck")
  .alias("tsc")
  .description("check if TypeScript code is well typed 🎨")
  .action(async function typecheckAction() {
    const d = Log.subdebug("typecheck");
    const store = useStore();

    try {
      if (store.hasFile("tsconfig.json")) {
        await $`tsc --noEmit`;
      } else {
        Log.info("No tsconfig.json found. Skipping type checking.");
      }
    } catch {
      process.exit(1);
    }
  })
  .addHelpText("afterAll", "\nUnder the hood, this command uses the TSC CLI to check the code.");
