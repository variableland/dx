import { resolvePackageBin, type ShellService } from "@vlandoss/clibuddy";
import type { DoctorResult } from "#src/types/tool.ts";

type CreateOptions = {
  pkg: string;
  bin?: string;
  ui: string;
  shellService: ShellService;
};

export class ToolService {
  #shellService: ShellService;
  #pkg: string;
  #bin: string;
  #ui: string;

  get bin() {
    return this.#bin;
  }

  get ui() {
    return this.#ui;
  }

  get pkg() {
    return this.#pkg;
  }

  constructor({ pkg, bin, ui, shellService }: CreateOptions) {
    this.#pkg = pkg;
    this.#bin = bin ?? pkg;
    this.#ui = ui;
    this.#shellService = shellService;
  }

  async getBinDir() {
    return resolvePackageBin(this.#pkg, {
      from: import.meta.url,
      binName: this.#bin,
    });
  }

  async exec(args: string[] = []) {
    return this.#shellService.run(await this.getBinDir(), args, { display: this.#bin });
  }

  async doctor(): Promise<DoctorResult> {
    const output = await this.#shellService.runCaptured(await this.getBinDir(), ["--help"], { throwOnError: false });
    const ok = output.exitCode === 0;

    return {
      ok,
      output: {
        stdout: output.stdout,
        stderr: output.stderr,
        exitCode: output.exitCode,
      },
    };
  }
}
