import type { ShellService } from "@vlandoss/clibuddy";
import { TOOL_LABELS } from "#/program/ui";
import type { FormatOptions, Formatter, Linter, LintOptions } from "#/types/tool";
import { ToolService } from "./tool";

export class BiomeService extends ToolService implements Formatter, Linter {
  constructor(shellService: ShellService) {
    super({ bin: "biome", ui: TOOL_LABELS.BIOME, shellService });
  }

  getBinDir() {
    return require.resolve("@biomejs/biome/bin/biome");
  }

  async format(options: FormatOptions) {
    const commonOptions = "format --no-errors-on-unmatched --colors=force";

    if (options.fix) {
      await this.exec(`${commonOptions} --fix`);
    } else if (options.check) {
      await this.exec(`${commonOptions}`);
    }
  }

  async lint(options: LintOptions) {
    const commonOptions = "check --colors=force --formatter-enabled=false";

    if (options.fix) {
      await this.exec(`${commonOptions} --fix --unsafe`);
    } else if (options.check) {
      await this.exec(`${commonOptions}`);
    }
  }
}
