import type { ShellService } from "@vlandoss/clibuddy";
import { TOOL_LABELS } from "#/program/ui";
import type { FormatOptions, Formatter } from "#/types/tool";
import { ToolService } from "./tool";

export class OxfmtService extends ToolService implements Formatter {
  constructor(shellService: ShellService) {
    super({ bin: "oxfmt", ui: TOOL_LABELS.OXFMT, shellService });
  }

  getBinDir() {
    return require.resolve("oxfmt/bin/oxfmt");
  }

  async format(options: FormatOptions) {
    const commonOptions = "--no-error-on-unmatched-pattern";

    if (options.fix) {
      await this.exec(`${commonOptions} --fix`);
    } else if (options.check) {
      await this.exec(`${commonOptions} --check`);
    }
  }
}
