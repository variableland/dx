import { type Mock, mock } from "bun:test";
import { exec } from "node:child_process";
import { promisify } from "node:util";
import { createProgram } from "../src/program";
import { createContextValue, ctx } from "../src/services/ctx";

const execAsync = promisify(exec);

export function createTestProgram() {
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
    program,
    exitFn,
    writeOutFn,
    writeErrFn,
  };
}

export async function parseProgram(argv: string[]) {
  const { program, ...other } = createTestProgram();

  const store = await createContextValue();

  await ctx.runContext(store, async () => {
    await program.parseAsync(argv, {
      from: "user",
    });
  });

  return { program, ...other };
}

export function execCli(cmd: string) {
  return execAsync(`bun run src/main.ts ${cmd}`);
}

// @ts-expect-error bun:test doesn't have a mocked helper function
export const mocked = <T extends (...args: unknown[]) => unknown>(v: T): Mock<T> => v;
