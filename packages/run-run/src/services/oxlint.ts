import type { ShellService } from "@vlandoss/clibuddy";
import { ToolService } from "./tool";

export class OxlintService extends ToolService {
  constructor(shellService: ShellService) {
    super({ cmd: "oxlint", shellService });
  }

  getBinDir() {
    return require.resolve("oxlint/bin/oxlint");
  }
}
