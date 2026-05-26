import type { Doctor, Formatter, Linter, RunReport, StaticChecker, StaticCheckerOptions } from "#src/plugin/types.ts";

/**
 * Synthesises a `StaticChecker & Doctor` (the `jsc` capability) by composing
 * a separately-registered linter and formatter. Used when the user's plugin
 * set provides `lint` and `format` independently (e.g. oxc, or eslint +
 * prettier) but no single plugin claims `jsc`.
 *
 * The check runs lint then format sequentially — interleaved stdout from a
 * parallel run is hard to read for the user — and merges their reports into one
 * so the board renders the pair as a single row. `fixStaged` is dropped because
 * the underlying tools don't have a uniform staged-aware mode.
 */
export function composedJscProvider(linter: Linter & Doctor, formatter: Formatter & Doctor): StaticChecker & Doctor {
  return {
    bin: `${linter.bin}+${formatter.bin}`,
    ui: `${linter.ui} + ${formatter.ui}`,
    async check({ fix }: StaticCheckerOptions): Promise<RunReport> {
      const lintReport = await linter.lint({ fix });
      const formatReport = await formatter.format({ fix });
      return mergeReports([
        { ui: linter.ui, report: lintReport },
        { ui: formatter.ui, report: formatReport },
      ]);
    },
    async doctor(): Promise<RunReport> {
      const [lintRes, fmtRes] = await Promise.all([linter.doctor(), formatter.doctor()]);
      return mergeReports([
        { ui: linter.ui, report: lintRes },
        { ui: formatter.ui, report: fmtRes },
      ]);
    },
  };
}

/**
 * Folds the lint + format reports into one so the composed `jsc` renders as a
 * single board row: ok only when both passed, with each tool's output kept
 * under its own header so the flushed detail stays attributable.
 */
function mergeReports(parts: Array<{ ui: string; report: RunReport }>): RunReport {
  const sections = parts
    .filter((part) => part.report.output.trim())
    .map((part) => `${part.ui}:\n${part.report.output}`)
    .join("\n\n");
  return { ok: parts.every((part) => part.report.ok), output: sections };
}
