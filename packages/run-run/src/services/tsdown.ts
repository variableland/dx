import type { ShellService } from "@vlandoss/clibuddy";
import { TOOL_LABELS } from "#/program/ui";
import { ToolService } from "./tool";

export class TsdownService extends ToolService {
  constructor(shellService: ShellService) {
    super({ bin: "tsdown", ui: TOOL_LABELS.TSDOWN, shellService });
  }
}
