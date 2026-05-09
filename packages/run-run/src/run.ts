import path from "node:path";
import { dirnameOf, run } from "@vlandoss/clibuddy";
import { createProgram } from "./program/index.ts";
import { logger } from "./services/logger.ts";

const BIN_DIR = path.dirname(dirnameOf(import.meta));

await run(async () => {
  const { program } = await createProgram({ binDir: BIN_DIR });
  await program.parseAsync(process.argv, { from: "node" });
}, logger);
