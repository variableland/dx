import { createProgram } from "./program";
import { console } from "./services/console";
import { createContextValue, ctx } from "./services/ctx";

async function main(argv = process.argv) {
  try {
    const ctxValue = await createContextValue();

    await ctx.runContext(ctxValue, async () => {
      const program = createProgram();
      await program.parseAsync(argv);
    });
  } catch (error) {
    console.error("Cannot run main successfully", error);
    process.exit(1);
  }
}

main();
