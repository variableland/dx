import { exec } from "node:child_process";
import { promisify } from "node:util";
import { vi } from "vitest";
import { createProgram } from "../src/program";
import { createStore, runContext } from "../src/store";

const execAsync = promisify(exec);

export function createTestProgram() {
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

  const store = await createStore();

  await runContext(store, async () => {
    await program.parseAsync(argv, {
      from: "user",
    });
  });

  return { program, ...other };
}

export function execCli(cmd: string) {
  return execAsync(`bun run src/main.ts ${cmd}`);
}
