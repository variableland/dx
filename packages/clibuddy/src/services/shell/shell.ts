import { $ as make$ } from "zx";
import type { Shell, ShellOptions } from "./types";
import { getPreferLocal } from "./utils";

export class ShellService {
  #shell: Shell;
  #options: ShellOptions;

  constructor(options: ShellOptions) {
    this.#options = Object.freeze(options);
    this.#shell = make$(options);
  }

  get options() {
    return this.#options;
  }

  get $() {
    return this.#shell;
  }

  child(options: ShellOptions) {
    return new ShellService({
      ...this.#options,
      ...options,
    });
  }

  quiet(options?: ShellOptions) {
    return this.child({
      ...options,
      verbose: false,
    });
  }

  at(cwd: string, options?: ShellOptions) {
    const getLocals = (locals: boolean | string | string[] | undefined) =>
      // NOTE: the boolean handling is done outside when determining preferLocal
      typeof locals === "boolean" ? [] : typeof locals === "undefined" ? [] : Array.isArray(locals) ? locals : [locals];

    const cwdPreferLocal = getPreferLocal(cwd);

    const preferLocal =
      options?.preferLocal === false
        ? false
        : [
            ...getLocals(this.#options.preferLocal),
            ...getLocals(options?.preferLocal),
            ...(cwdPreferLocal ? cwdPreferLocal : []),
          ];

    return this.child({
      ...options,
      cwd,
      preferLocal,
    });
  }
}
