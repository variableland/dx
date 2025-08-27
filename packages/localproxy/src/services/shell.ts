import { createShellService } from "@vlandoss/clibuddy";

export const quietShell = createShellService({
  quiet: true,
  verbose: false,
});

export const silentShell = quietShell.child({
  stdio: ["ignore", "ignore", "ignore"],
});

export const verboseShell = quietShell.child({
  quiet: false,
  verbose: true,
});
