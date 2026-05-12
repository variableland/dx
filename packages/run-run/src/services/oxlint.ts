import type { ShellService } from "@vlandoss/clibuddy";
import { TOOL_LABELS } from "#src/program/ui.ts";
import type { Linter, LintOptions } from "#src/types/tool.ts";
import { ToolService } from "./tool.ts";

export class OxlintService extends ToolService implements Linter {
  constructor(shellService: ShellService) {
    super({ pkg: "oxlint", ui: TOOL_LABELS.OXLINT, shellService });
  }

  async lint(options: LintOptions) {
    await this.exec(["--report-unused-disable-directives", options.fix ? "--fix" : "--check"]);
  }
}
