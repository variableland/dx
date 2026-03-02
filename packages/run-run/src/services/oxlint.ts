import type { ShellService } from "@vlandoss/clibuddy";
import { TOOL_LABELS } from "#/program/ui";
import type { Linter, LintOptions } from "#/types/tool";
import { ToolService } from "./tool";

export class OxlintService extends ToolService implements Linter {
  constructor(shellService: ShellService) {
    super({ bin: "oxlint", ui: TOOL_LABELS.OXLINT, shellService });
  }

  getBinDir() {
    return require.resolve("oxlint/bin/oxlint");
  }

  async lint(options: LintOptions) {
    const commonOptions = "--report-unused-disable-directives";

    if (options.fix) {
      await this.exec(`${commonOptions} --fix`);
    } else {
      await this.exec(`${commonOptions} --check`);
    }
  }
}
