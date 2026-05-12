import { isCI, resolveBinPath, type ShellService } from "@vlandoss/clibuddy";
import { TOOL_LABELS } from "#src/program/ui.ts";
import type { FormatOptions, Formatter, Linter, LintOptions, StaticChecker, StaticCheckerOptions } from "#src/types/tool.ts";
import { ToolService } from "./tool.ts";

const COMMON_FLAGS = ["--colors=force", "--no-errors-on-unmatched"];

export class BiomeService extends ToolService implements Formatter, Linter, StaticChecker {
  constructor(shellService: ShellService) {
    super({ bin: "biome", ui: TOOL_LABELS.BIOME, shellService });
  }

  override getBinDir() {
    return resolveBinPath("@biomejs/biome", { from: import.meta.url, binName: "biome" });
  }

  async format(options: FormatOptions) {
    const args = ["format", ...COMMON_FLAGS];
    if (options.fix) args.push("--fix");
    await this.exec(args);
  }

  async lint(options: LintOptions) {
    const args = ["check", ...COMMON_FLAGS, "--formatter-enabled=false"];
    if (options.fix) args.push("--fix", "--unsafe");
    await this.exec(args);
  }

  async check(options: StaticCheckerOptions): Promise<void> {
    if (options.fix) {
      await this.exec(["check", ...COMMON_FLAGS, "--fix"]);
    } else if (options.fixStaged) {
      await this.exec(["check", ...COMMON_FLAGS, "--fix", "--staged"]);
    } else {
      await this.exec([isCI ? "ci" : "check", ...COMMON_FLAGS]);
    }
  }
}
