import { resolvePackageBin, type ShellService } from "@vlandoss/clibuddy";
import type { DoctorResult } from "#src/types/tool.ts";

export type ToolServiceOptions = {
  pkg: string;
  bin?: string;
  ui: string;
  shellService: ShellService;
  /**
   * Module URL the resolver walks up from when looking for `pkg` in
   * `node_modules`. Plugins MUST pass their own `import.meta.url` so the
   * binary is resolved from the plugin's own dependency graph (peer-installed
   * by the host project), not the kernel's. Kernel-internal services pass
   * `import.meta.url` of their own module file.
   */
  from: string;
};

export type ExecOptions = {
  cwd?: string;
  verbose?: boolean;
};

export class ToolService {
  #shellService: ShellService;
  #pkg: string;
  #bin: string;
  #ui: string;
  #from: string;

  get bin() {
    return this.#bin;
  }

  get ui() {
    return this.#ui;
  }

  get pkg() {
    return this.#pkg;
  }

  constructor({ pkg, bin, ui, shellService, from }: ToolServiceOptions) {
    this.#pkg = pkg;
    this.#bin = bin ?? pkg;
    this.#ui = ui;
    this.#shellService = shellService;
    this.#from = from;
  }

  async getBinDir() {
    return resolvePackageBin(this.#pkg, {
      from: this.#from,
      binName: this.#bin,
    });
  }

  async exec(args: string[] = [], options: ExecOptions = {}) {
    const { cwd, verbose } = options;
    const sh = cwd ? this.#shellService.at(cwd) : this.#shellService;
    return sh.run(await this.getBinDir(), args, { display: this.#bin, verbose });
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
