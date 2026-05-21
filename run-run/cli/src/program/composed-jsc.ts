import type { Doctor, DoctorResult, Formatter, Linter, StaticChecker, StaticCheckerOptions } from "#src/plugin/types.ts";

/**
 * Synthesises a `StaticChecker & Doctor` (the `jsc` capability) by composing
 * a separately-registered linter and formatter. Used when the user's plugin
 * set provides `lint` and `format` independently (e.g. oxc, or eslint +
 * prettier) but no single plugin claims `jsc`.
 *
 * The check runs lint then format sequentially — interleaved stdout from a
 * parallel run is hard to read for the user. `fixStaged` is dropped because
 * the underlying tools don't have a uniform staged-aware mode.
 */
export function composedJscProvider(linter: Linter & Doctor, formatter: Formatter & Doctor): StaticChecker & Doctor {
  return {
    bin: `${linter.bin}+${formatter.bin}`,
    ui: `${linter.ui} + ${formatter.ui}`,
    async check({ fix }: StaticCheckerOptions) {
      await linter.lint({ fix });
      await formatter.format({ fix });
    },
    async doctor(): Promise<DoctorResult> {
      const [lintRes, fmtRes] = await Promise.all([linter.doctor(), formatter.doctor()]);
      const ok = lintRes.ok && fmtRes.ok;
      const firstFailure = !lintRes.ok ? lintRes : !fmtRes.ok ? fmtRes : undefined;
      return {
        ok,
        output: {
          stdout: `${linter.ui}:\n${lintRes.output.stdout}\n\n${formatter.ui}:\n${fmtRes.output.stdout}`,
          stderr: `${linter.ui}:\n${lintRes.output.stderr}\n\n${formatter.ui}:\n${fmtRes.output.stderr}`,
          exitCode: firstFailure?.output.exitCode ?? 0,
        },
      };
    },
  };
}
