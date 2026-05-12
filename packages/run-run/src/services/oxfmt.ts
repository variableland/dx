import { resolveBinPath, type ShellService } from "@vlandoss/clibuddy";
import { TOOL_LABELS } from "#src/program/ui.ts";
import type { FormatOptions, Formatter } from "#src/types/tool.ts";
import { ToolService } from "./tool.ts";

export class OxfmtService extends ToolService implements Formatter {
  constructor(shellService: ShellService) {
    super({ bin: "oxfmt", ui: TOOL_LABELS.OXFMT, shellService });
  }

  override getBinDir() {
    return resolveBinPath("oxfmt", { from: import.meta.url });
  }

  async format(options: FormatOptions) {
    await this.exec(["--no-error-on-unmatched-pattern", options.fix ? "--fix" : "--check"]);
  }
}
