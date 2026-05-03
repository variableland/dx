import { logger } from "../services/logger.ts";

const debug = logger.subdebug("parseArgs");

export function parseArgs(argv = process.argv) {
  const args = argv.slice(2);
  const lastArg = args[args.length - 1];
  const allArgsAreValidCommands =
    args.every((arg) => !arg.startsWith("-")) && args.length > 1 && args[0] !== "tools" && lastArg !== "doctor";

  debug("args %O", args);

  if (allArgsAreValidCommands) {
    debug("multiple commands detected, adding 'run' command");
    return ["run", ...args];
  }

  return args;
}
