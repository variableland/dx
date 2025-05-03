import { isProcessOutput } from "@vlandoss/clibuddy";
import { type Options, createProgram } from "./program";
import { logger } from "./services/logger";

export async function main(options: Options) {
  try {
    const { cmd } = await createProgram(options);
    await cmd.parseAsync();
  } catch (error) {
    if (!isProcessOutput(error)) {
      logger.error("Cannot run main successfully", error);
    }
    process.exit(1);
  }
}
