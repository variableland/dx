import { type Options, createProgram } from "./program";
import { logger } from "./services/logger";

export async function main(options: Options) {
  try {
    const program = await createProgram(options);
    await program.parseAsync();
  } catch (error) {
    logger.error("Cannot run main successfully", error);
    process.exit(1);
  }
}
