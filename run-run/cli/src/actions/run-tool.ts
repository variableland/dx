import { reportTask, runBoard } from "#src/render/board.ts";
import { type Provider, targetLabel } from "#src/render/labels.ts";
import type { ContextValue } from "#src/services/context.ts";
import type { RunReport } from "#src/types/tool.ts";

type RunToolActionOptions<P extends Provider> = {
  ctx: ContextValue;
  name: string;
  provider: P;
  run: (provider: P) => Promise<RunReport>;
};

/**
 * The shared action for a single-provider tool command (lint, format, jsc,
 * pack): run the provider's verb as one board row labelled `<name> (<tool>) ·
 * <pkg>`, and aggregate the exit code. The command resolves the provider and
 * throws MissingPluginError when it's absent, so the provider is required here.
 * Commands that fan out (tsc) or compose siblings (check) drive the board themselves.
 */
export async function runToolAction<P extends Provider>({ ctx, name, provider, run }: RunToolActionOptions<P>): Promise<void> {
  const result = await runBoard([reportTask(targetLabel(name, provider, ctx.appPkg), () => run(provider))]);
  if (!result.ok) process.exitCode = 1;
}
