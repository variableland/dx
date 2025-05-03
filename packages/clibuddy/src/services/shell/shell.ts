import { $ as make$ } from "zx";
import type { Shell, ShellOptions } from "./types";

export class ShellService {
  #shell: Shell;
  #options: ShellOptions;

  constructor(options: ShellOptions) {
    this.#options = options;
    this.#shell = make$(options);
  }

  get $() {
    return this.#shell;
  }

  quiet(options?: ShellOptions) {
    return this.child({
      ...options,
      verbose: false,
    });
  }

  at(cwd: string, options?: ShellOptions) {
    return this.child({
      ...options,
      cwd,
    });
  }

  child(options: ShellOptions) {
    return new ShellService({
      ...this.#options,
      ...options,
    });
  }
}
