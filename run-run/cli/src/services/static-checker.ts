import type { Doctor, Formatter, Linter, RunReport, StaticChecker, StaticCheckerOptions } from "#src/types/tool.ts";

export class StaticCheckService implements StaticChecker, Doctor {
  #linter: Linter & Doctor;
  #formatter: Formatter & Doctor;

  get ui() {
    return `${this.#linter.ui} + ${this.#formatter.ui}`;
  }

  constructor(linter: Linter & Doctor, formatter: Formatter & Doctor) {
    this.#linter = linter;
    this.#formatter = formatter;
  }

  async check(options: StaticCheckerOptions): Promise<RunReport> {
    const lintReport = await this.#linter.lint(options);
    const formatReport = await this.#formatter.format(options);

    return this.#mergeReports([
      { ui: this.#linter.ui, report: lintReport },
      { ui: this.#formatter.ui, report: formatReport },
    ]);
  }

  async doctor(): Promise<RunReport> {
    const [lintRes, fmtRes] = await Promise.all([this.#linter.doctor(), this.#formatter.doctor()]);

    return this.#mergeReports([
      { ui: this.#linter.ui, report: lintRes },
      { ui: this.#formatter.ui, report: fmtRes },
    ]);
  }

  #mergeReports(parts: Array<{ ui: string; report: RunReport }>): RunReport {
    const sections = parts
      .filter((part) => part.report.output.trim())
      .map((part) => `${part.ui}:\n${part.report.output}`)
      .join("\n\n");

    return {
      ok: parts.every((part) => part.report.ok),
      output: sections,
    };
  }
}
