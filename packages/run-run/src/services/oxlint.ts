import type { ShellService } from "@vlandoss/clibuddy";
import { TOOL_LABELS } from "#src/program/ui.ts";
import type { Linter, LintOptions } from "#src/types/tool.ts";
import { ToolService } from "./tool.ts";

export class OxlintService extends ToolService implements Linter {
  constructor(shellService: ShellService) {
    super({ bin: "oxlint", ui: TOOL_LABELS.OXLINT, shellService });
  }

  override getBinDir() {
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
