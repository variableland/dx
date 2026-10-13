import { createProgram } from "./program/index.ts";
import { reportError } from "./program/report-error.ts";

try {
  const program = await createProgram(import.meta);
  await program.run();
} catch (error) {
  // Both context build-up (createProgram) and command execution (run) can throw
  // domain errors; render them cleanly here rather than letting Node dump a raw
  // stack trace. `process.exitCode` (not `process.exit`) lets the logger's
  // stderr write flush before the process tears down.
  reportError(error);
  process.exitCode = 1;
}
