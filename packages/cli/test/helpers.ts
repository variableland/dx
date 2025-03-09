import { vi } from "vitest";
import { exec } from "node:child_process";
import { promisify } from "node:util";
import { createProgram } from "~/program";
import { DEV_CMD } from "~/utils/constants";

const execAsync = promisify(exec);

function createTestProgram() {
  const program = createProgram();

  const exitFn = vi.fn();
  const writeOutFn = vi.fn();
  const writeErrFn = vi.fn();

  program.exitOverride(exitFn);

  program.configureOutput({
    writeOut: writeOutFn,
    writeErr: writeErrFn,
  });

  return {
    program,
    exitFn,
    writeOutFn,
    writeErrFn,
  };
}

export async function parseProgram(argv: string[]) {
  const { program, ...other } = createTestProgram();

  await program.parseAsync(argv, {
    from: "user",
  });

  return { program, ...other };
}

export function execCli(cmd: string) {
  return execAsync(`${DEV_CMD} ${cmd}`);
}
