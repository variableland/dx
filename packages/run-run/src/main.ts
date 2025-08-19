import { isProcessOutput } from "@vlandoss/clibuddy";
import { createProgram, type Options } from "./program";
import { parseArgs } from "./program/parse-args";
import { logger } from "./services/logger";

export async function main(options: Options) {
  try {
    const { program } = await createProgram(options);
    await program.parseAsync(parseArgs(), { from: "user" });
  } catch (error) {
    if (!isProcessOutput(error)) {
      logger.error("Cannot run main successfully", error);
    }
    process.exit(1);
  }
}
