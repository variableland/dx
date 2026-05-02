import fs from "node:fs";
import path from "node:path";
import type { ShellService } from "@vlandoss/clibuddy";
import memoize from "memoize";
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

  getBinDir?(): string;

  async exec(args: string | string[]) {
    const shell = this.#shell();
    return this.#run(shell, args);
  }

  async doctor(): Promise<DoctorResult> {
    const shell = this.#shell().mute();

    const output = await this.#run(shell, "--help");
    const ok = output.exitCode === 0;

    return { ok, output };
  }

  #shell = memoize((cwd?: string) => {
    const preferLocal = this.#getPreferLocal();

    return this.#shellService.child({
      ...(cwd && { cwd }),
      ...(preferLocal && { preferLocal }),
    });
  });

  #run(shell: ShellService, args: string | string[]) {
    return shell.$`${this.#bin} ${typeof args === "string" ? args : args.join(" ")}`;
  }

  #getPreferLocal() {
    if (!this.getBinDir) {
      return undefined;
    }

    try {
      const binPath = this.getBinDir();
      const isDir = fs.statSync(binPath).isDirectory();
      return isDir ? binPath : path.dirname(binPath);
    } catch {
      return undefined;
    }
  }

  get bin() {
    return this.#bin;
  }

  get ui() {
    return this.#ui;
  }
}
