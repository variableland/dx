import type { ContextValue } from "#src/services/context.ts";
import type { Doctor, FormatOptions, Formatter } from "#src/types/tool.ts";
import { runToolAction } from "./run-tool.ts";

export type FormatActionConfig = {
  ctx: ContextValue;
  formatter: Formatter & Doctor;
  options: FormatOptions;
};

export function formatAction({ ctx, formatter, options }: FormatActionConfig) {
  return runToolAction({ ctx, name: "format", provider: formatter, run: (p) => p.format(options) });
}
