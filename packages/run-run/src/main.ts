import { Log } from "@variableland/console";
import { createProgram } from "./program";
import { createStore, runContext } from "./store";

async function main(argv = process.argv) {
  try {
    const program = createProgram();

    const store = await createStore();

    await runContext(store, async () => {
      await program.parseAsync(argv);
    });
  } catch (error) {
    Log.error("Cannot run main successfully", error);
    process.exit(1);
  }
}

main();
