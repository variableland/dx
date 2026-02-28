import type { ShellService } from "@vlandoss/clibuddy";
import type { Linter, LintOptions } from "#/types/tool";
import { ToolService } from "./tool";

export class OxlintService extends ToolService implements Linter {
  constructor(shellService: ShellService) {
    super({ bin: "oxlint", shellService });
  }

  getBinDir() {
    return require.resolve("oxlint/bin/oxlint");
  }

  async lint(options: LintOptions) {
    const commonOptions = "--report-unused-disable-directives";

    if (options.fix) {
      await this.exec(`${commonOptions} --fix`);
    } else if (options.check) {
      await this.exec(`${commonOptions} --check`);
    }
  }
}
