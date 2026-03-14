import type { ShellService } from "@vlandoss/clibuddy";
import isCI from "is-ci";
import { TOOL_LABELS } from "#/program/ui";
import type { FormatOptions, Formatter, Linter, LintOptions, StaticChecker, StaticCheckerOptions } from "#/types/tool";
import { ToolService } from "./tool";

export class BiomeService extends ToolService implements Formatter, Linter, StaticChecker {
  constructor(shellService: ShellService) {
    super({ bin: "biome", ui: TOOL_LABELS.BIOME, shellService });
  }

  override getBinDir() {
    return require.resolve("@biomejs/biome/bin/biome");
  }

  async format(options: FormatOptions) {
    const commonOptions = "format --colors=force --no-errors-on-unmatched";

    if (options.fix) {
      await this.exec(`${commonOptions} --fix`);
    } else {
      await this.exec(`${commonOptions}`);
    }
  }

  async lint(options: LintOptions) {
    const commonOptions = "check --colors=force --no-errors-on-unmatched --formatter-enabled=false";

    if (options.fix) {
      await this.exec(`${commonOptions} --fix --unsafe`);
    } else {
      await this.exec(`${commonOptions}`);
    }
  }

  async check(options: StaticCheckerOptions): Promise<void> {
    const commonOptions = (cmd = "check") => `${cmd} --colors=force --no-errors-on-unmatched`;

    if (options.fix) {
      await this.exec(`${commonOptions()} --fix`);
    } else if (options.fixStaged) {
      await this.exec(`${commonOptions()}  --fix --staged`);
    } else {
      await this.exec(`${commonOptions(isCI ? "ci" : "check")}`);
    }
  }
}
