export function parseArgs(argv = process.argv) {
  const args = argv.slice(2);
  const allArgsAreCommands = args.every((arg) => !arg.startsWith("-"));

  if (allArgsAreCommands && args.length > 1) {
    return ["run", ...args];
  }

  return args;
}
