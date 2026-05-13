import type { ShellService } from "@vlandoss/clibuddy";
import { TOOL_LABELS } from "#src/program/ui.ts";
import type { FormatOptions, Formatter } from "#src/types/tool.ts";
import { ToolService } from "./tool.ts";

export class OxfmtService extends ToolService implements Formatter {
  constructor(shellService: ShellService) {
    super({ pkg: "oxfmt", ui: TOOL_LABELS.OXFMT, shellService });
  }

  async format(options: FormatOptions) {
    await this.exec(["--no-error-on-unmatched-pattern", options.fix ? "--fix" : "--check"]);
  }
}
