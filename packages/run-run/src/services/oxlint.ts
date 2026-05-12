import { resolveBinPath, type ShellService } from "@vlandoss/clibuddy";
import { TOOL_LABELS } from "#src/program/ui.ts";
import type { Linter, LintOptions } from "#src/types/tool.ts";
import { ToolService } from "./tool.ts";

export class OxlintService extends ToolService implements Linter {
  constructor(shellService: ShellService) {
    super({ bin: "oxlint", ui: TOOL_LABELS.OXLINT, shellService });
  }

  override getBinDir() {
    return resolveBinPath("oxlint", { from: import.meta.url });
  }

  async lint(options: LintOptions) {
    await this.exec(["--report-unused-disable-directives", options.fix ? "--fix" : "--check"]);
  }
}
