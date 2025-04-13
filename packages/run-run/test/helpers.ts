import { type Mock, mock } from "bun:test";
import { exec } from "node:child_process";
import { promisify } from "node:util";
import { createProgram } from "../src/program";

const execAsync = promisify(exec);

export async function createTestProgram() {
  const { cmd, ctx } = await createProgram({
    binDir: ".", // mocked value
  });

  const exitFn = mock();
  const writeOutFn = mock();
  const writeErrFn = mock();

  cmd.exitOverride(exitFn);

  cmd.configureOutput({
    writeOut: writeOutFn,
    writeErr: writeErrFn,
  });

  return {
    cmd,
    ctx,
    exitFn,
    writeOutFn,
    writeErrFn,
  };
}

export async function parseProgram(argv: string[]) {
  const { cmd } = await createTestProgram();

  await cmd.parseAsync(argv, {
    from: "user",
  });
}

export function execCli(cmd: string) {
  return execAsync(`bun ./bin.ts ${cmd}`);
}

// @ts-expect-error bun:test doesn't have a mocked helper function
export const mocked = <T extends (...args: unknown[]) => unknown>(v: T): Mock<T> => v;
