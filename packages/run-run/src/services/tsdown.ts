import { resolveBinPath, type ShellService } from "@vlandoss/clibuddy";
import { TOOL_LABELS } from "#src/program/ui.ts";
import { ToolService } from "./tool.ts";

export class TsdownService extends ToolService {
  constructor(shellService: ShellService) {
    super({ bin: "tsdown", ui: TOOL_LABELS.TSDOWN, shellService });
  }

  override getBinDir() {
    return resolveBinPath("tsdown", { from: import.meta.url });
  }

  async buildLib() {
    await this.exec();
  }
}
