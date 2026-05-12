import type { ShellService } from "@vlandoss/clibuddy";
import type { DoctorResult } from "#src/types/tool.ts";

type CreateOptions = {
  bin: string;
  ui?: string;
  shellService: ShellService;
};

export abstract class ToolService {
  #shellService: ShellService;
  #bin: string;
  #ui: string;

  constructor({ bin, ui, shellService }: CreateOptions) {
    this.#bin = bin;
    this.#ui = ui ?? bin;
    this.#shellService = shellService;
  }

  // Must return an absolute path so we bypass the `node_modules/.bin/<bin>`
  // shims that run-run itself publishes (`tools/biome`, etc) — otherwise
  // calling the friendly name loops back through `rr tools <bin>`.
  abstract getBinDir(): string;

  async exec(args: string[] = []) {
    return this.#shellService.run(this.getBinDir(), args, { display: this.#bin });
  }

  async doctor(): Promise<DoctorResult> {
    const output = await this.#shellService.runCaptured(this.getBinDir(), ["--help"], { throwOnError: false });
    const ok = output.exitCode === 0;
    return {
      ok,
      output: { stdout: output.stdout, stderr: output.stderr, exitCode: output.exitCode },
    };
  }

  get bin() {
    return this.#bin;
  }

  get ui() {
    return this.#ui;
  }
}
