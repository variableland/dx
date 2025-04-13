import { createContextValue, ctx } from "./services/ctx";
import { logger } from "./services/logger";

async function main(argv = process.argv) {
  try {
    const ctxValue = await createContextValue();

    await ctx.runContext(ctxValue, async () => {
      const { createProgram } = await import("./program");
      const program = createProgram();
      await program.parseAsync(argv);
    });
  } catch (error) {
    logger.error("Cannot run main successfully", error);
    process.exit(1);
  }
}

main();
