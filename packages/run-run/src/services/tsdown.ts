import type { ShellService } from "@vlandoss/clibuddy";
import { TOOL_LABELS } from "#src/program/ui.ts";
import { ToolService } from "./tool.ts";

export class TsdownService extends ToolService {
  constructor(shellService: ShellService) {
    super({ pkg: "tsdown", ui: TOOL_LABELS.TSDOWN, shellService });
  }

  async buildLib() {
    await this.exec();
  }
}
