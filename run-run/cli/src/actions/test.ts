import type { ContextValue } from "#src/services/context.ts";
import type { Doctor, TestRunner } from "#src/types/tool.ts";

export type TestActionConfig = {
  ctx: ContextValue;
  runner: TestRunner & Doctor;
  options: { envFile?: string };
  args: string[];
};

/**
 * The action for the `test` passthrough. Unlike the captured verbs (lint, pack,
 * …) it doesn't drive the task-board: the runner streams straight to the
 * terminal and resolves with the tool's exit code, which we mirror onto
 * `process.exitCode` so `rr test` fails when the suite fails.
 */
export async function testAction({ runner, options, args }: TestActionConfig): Promise<void> {
  const code = await runner.test({ envFile: options.envFile, args });
  if (code !== 0) process.exitCode = code;
}
