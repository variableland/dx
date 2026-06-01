import type { ContextValue } from "#src/services/context.ts";
import type { Doctor, StaticChecker, StaticCheckerOptions } from "#src/types/tool.ts";
import { runToolAction } from "./run-tool.ts";

export type JscActionConfig = {
  ctx: ContextValue;
  checker: StaticChecker & Doctor;
  options: StaticCheckerOptions;
};

export function jscAction({ ctx, checker, options }: JscActionConfig) {
  return runToolAction({ ctx, name: "jsc", provider: checker, run: (p) => p.check(options) });
}
