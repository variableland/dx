import type { ContextValue } from "#src/services/context.ts";
import type { Doctor, Linter, LintOptions } from "#src/types/tool.ts";
import { runToolAction } from "./run-tool.ts";

export type LintActionConfig = {
  ctx: ContextValue;
  linter: Linter & Doctor;
  options: LintOptions;
};

export function lintAction({ ctx, linter, options }: LintActionConfig) {
  return runToolAction({ ctx, name: "lint", provider: linter, run: (p) => p.lint(options) });
}
