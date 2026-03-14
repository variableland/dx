import { run } from "@vlandoss/clibuddy";
import { createProgram, type Options } from "./program";
import { parseArgs } from "./program/parse-args";
import { logger } from "./services/logger";

export async function main(options: Options) {
  await run(async () => {
    const { program } = await createProgram(options);
    await program.parseAsync(parseArgs(), { from: "user" });
  }, logger);
}
