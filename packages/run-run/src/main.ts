import { run } from "@vlandoss/clibuddy";
import { createProgram, type Options } from "./program/index.ts";
import { parseArgs } from "./program/parse-args.ts";
import { logger } from "./services/logger.ts";

export async function main(options: Options) {
  await run(async () => {
    const { program } = await createProgram(options);
    await program.parseAsync(parseArgs(), { from: "user" });
  }, logger);
}
