import { type Mock, mock } from "bun:test";
import { exec } from "node:child_process";
import { promisify } from "node:util";
import { createContextValue, ctx } from "../src/services/ctx";

const execAsync = promisify(exec);

async function createProgram() {
  const { createProgram } = await import("../src/program");
  const { $ } = await import("../src/services/shell");

  const program = createProgram();

  const exitFn = mock();
  const writeOutFn = mock();
  const writeErrFn = mock();

  program.exitOverride(exitFn);

  program.configureOutput({
    writeOut: writeOutFn,
    writeErr: writeErrFn,
  });

  return {
    $,
    program,
    exitFn,
    writeOutFn,
    writeErrFn,
  };
}

export async function createTestProgram() {
  const store = await createContextValue();
  return ctx.runContext(store, createProgram);
}

export async function parseProgram(argv: string[]) {
  const store = await createContextValue();

  return ctx.runContext(store, async () => {
    const result = await createProgram();

    await result.program.parseAsync(argv, {
      from: "user",
    });

    return result;
  });
}

export function execCli(cmd: string) {
  return execAsync(`bun run src/main.ts ${cmd}`);
}

// @ts-expect-error bun:test doesn't have a mocked helper function
export const mocked = <T extends (...args: unknown[]) => unknown>(v: T): Mock<T> => v;
