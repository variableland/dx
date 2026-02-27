import type { ShellService } from "@vlandoss/clibuddy";
import { ToolService } from "./tool";

export class OxfmtService extends ToolService {
  constructor(shellService: ShellService) {
    super({ cmd: "oxfmt", shellService });
  }

  getBinDir() {
    return require.resolve("oxfmt/bin/oxfmt");
  }
}
