import { type Options as ZxOptions, type Shell as ZxShell, $ as make$ } from "zx";

type ShellOptions = Partial<ZxOptions>;

export type Shell = ZxShell & { quiet: ZxShell };

export class ShellService {
  #shell: Shell;

  constructor(options: ShellOptions) {
    this.#shell = Object.assign(make$(options), {
      quiet: make$({ ...options, verbose: false }),
    });
  }

  get $() {
    return this.#shell;
  }
}
