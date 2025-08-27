import path from "node:path";
import { createPkgService, getVersion } from "@vlandoss/clibuddy";
import { createCommand } from "commander";
import { createCleanCommand } from "./commands/clean";
import { createSetupCommand } from "./commands/setup";
import { createStartCommand } from "./commands/start";
import { createStatusCommand } from "./commands/status";
import { createStopCommand } from "./commands/stop";
import { logger } from "./services/logger";
import type { Context, ProgramOptions } from "./types";
import { BANNER_TEXT, CREDITS_TEXT } from "./ui";

async function createContext({ binDir, installDir }: ProgramOptions) {
  const binPkg = await createPkgService(binDir);

  if (!binPkg) {
    throw new Error("Could not find bin package.json");
  }

  return {
    installDir,
    caddyfilePath: path.join(installDir, "Caddyfile"),
    binDir,
    binPkg,
  } satisfies Context;
}

async function createProgram(options: ProgramOptions) {
  const ctx = await createContext(options);

  return createCommand("localproxy")
    .alias("localp")
    .version(getVersion(ctx.binPkg), "-v, --version")
    .addHelpText("before", BANNER_TEXT)
    .addHelpText("after", CREDITS_TEXT)
    .addCommand(createSetupCommand(ctx))
    .addCommand(createStatusCommand(ctx))
    .addCommand(createStartCommand(ctx))
    .addCommand(createStopCommand(ctx))
    .addCommand(createCleanCommand(ctx));
}

export async function main(options: ProgramOptions) {
  try {
    const program = await createProgram(options);
    await program.parseAsync();
  } catch (error) {
    logger.error("Cannot run main successfully", error);
    process.exit(1);
  }
}
