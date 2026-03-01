import type { Shell, ShellService } from "@vlandoss/clibuddy";
import memoize from "memoize";
import { gracefullBinDir } from "#/utils/gracefullBinDir";

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

  abstract getBinDir(): string;

  exec(args: string | string[]) {
    const $ = this.#shell();
    return this.#run($, args);
  }

  #shell = memoize((cwd?: string) => {
    return this.#shellService.child({
      cwd,
      preferLocal: gracefullBinDir(() => this.getBinDir()),
    }).$;
  });

  #run(shell: Shell, args: string | string[]) {
    return shell`${this.#bin} ${typeof args === "string" ? args : args.join(" ")}`;
  }

  get bin() {
    return this.#bin;
  }

  get ui() {
    return this.#ui;
  }
}
