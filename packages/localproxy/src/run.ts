import { homedir } from "node:os";
import path from "node:path";
import { createPkg, dirnameOf } from "@vlandoss/clibuddy";
import { createCommand } from "commander";
import { createCleanCommand } from "./commands/clean.ts";
import { createSetupCommand } from "./commands/setup.ts";
import { createStartCommand } from "./commands/start.ts";
import { createStatusCommand } from "./commands/status.ts";
import { createStopCommand } from "./commands/stop.ts";
import { logger } from "./services/logger.ts";
import type { Context, ProgramOptions } from "./types.ts";
import { BANNER_TEXT, CREDITS_TEXT } from "./ui.ts";

const BIN_DIR = path.dirname(dirnameOf(import.meta));
const INSTALL_DIR = path.join(homedir(), ".localproxy");

async function createContext({ binDir, installDir }: ProgramOptions) {
  const binPkg = await createPkg(binDir);

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
  const version = ctx.binPkg.version;

  return createCommand("localproxy")
    .alias("localp")
    .version(version, "-v, --version")
    .addHelpText("before", BANNER_TEXT)
    .addHelpText("after", CREDITS_TEXT)
    .addCommand(createSetupCommand(ctx))
    .addCommand(createStatusCommand(ctx))
    .addCommand(createStartCommand(ctx))
    .addCommand(createStopCommand(ctx))
    .addCommand(createCleanCommand(ctx));
}

try {
  const program = await createProgram({ binDir: BIN_DIR, installDir: INSTALL_DIR });
  await program.parseAsync();
} catch (error) {
  if (error instanceof Error && error.name === "ExitPromptError") {
    logger.success("👋 cancelled, until next time!");
  } else {
    logger.error(error);
    process.exit(1);
  }
}
