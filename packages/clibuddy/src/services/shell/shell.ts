import { type Options, type Shell, $ as make$ } from "zx";

type ShellOptions = Partial<Options>;

export class ShellService {
  #shell: Shell & { quiet: Shell };

  constructor(options: ShellOptions) {
    this.#shell = Object.assign(make$(options), {
      quiet: make$({ ...options, verbose: false }),
    });
  }

  get $() {
    return this.#shell;
  }
}
