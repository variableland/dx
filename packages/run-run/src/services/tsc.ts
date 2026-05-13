import type { ShellService } from "@vlandoss/clibuddy";
import { TOOL_LABELS } from "#src/program/ui.ts";
import { ToolService } from "./tool.ts";

export class TscService extends ToolService {
  constructor(shellService: ShellService) {
    super({ pkg: "typescript", bin: "tsc", ui: TOOL_LABELS.TSC, shellService });
  }
}
