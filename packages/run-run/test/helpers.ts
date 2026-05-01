import { exec } from "node:child_process";
import { promisify } from "node:util";
import { vi } from "vitest";
import { createProgram } from "../src/program/index.ts";

const execAsync = promisify(exec);

export async function createTestProgram() {
  const { program, ctx } = await createProgram({
    binDir: ".", // mocked value
  });

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
    ctx,
    exitFn,
    writeOutFn,
    writeErrFn,
  };
}

export async function parseProgram(argv: string[]) {
  const { program } = await createTestProgram();

  await program.parseAsync(argv, {
    from: "user",
  });
}

export function execCli(cmd: string) {
  return execAsync(`bun ./bin.ts ${cmd}`);
}
