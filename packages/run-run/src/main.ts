import { createProgram } from "./program";
import { createContextValue, ctx } from "./services/ctx";
import { Logger } from "./services/logger";

async function main(argv = process.argv) {
  try {
    const ctxValue = await createContextValue();

    await ctx.runContext(ctxValue, async () => {
      const program = createProgram();
      await program.parseAsync(argv);
    });
  } catch (error) {
    Logger.error("Cannot run main successfully", error);
    process.exit(1);
  }
}

main();
