import { createProgram } from "./program";
import { createStore, runContext } from "./store";

async function main(argv = process.argv) {
  try {
    const program = createProgram();

    const store = await createStore();

    runContext(store, async () => {
      await program.parseAsync(argv);
    });
  } catch (error) {
    console.error("Cannot run main successfully", error);
    process.exit(1);
  }
}

main();
