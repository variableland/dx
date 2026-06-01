import { type Output, x as tinyexec } from "tinyexec";
import { palette } from "../colors.ts";
import type { RunOptions, ShellOptions } from "./types.ts";

export class ShellService {
  #options: ShellOptions;

  constructor(options: ShellOptions = {}) {
    this.#options = Object.freeze({
      cwd: options.cwd ?? process.cwd(),
      env: options.env,
      verbose: options.verbose ?? true,
    });
  }

  get options(): ShellOptions {
    return this.#options;
  }

  at(cwd: string): ShellService {
    return this.child({ cwd });
  }

  child(options: ShellOptions): ShellService {
    return new ShellService({
      ...this.#options,
      ...options,
      env: options.env ? { ...this.#options.env, ...options.env } : this.#options.env,
    });
  }

  quiet(): ShellService {
    return this.child({ verbose: false });
  }

  async run(cmd: string, args: string[] = [], opts: RunOptions = {}): Promise<Output> {
    const merged = this.#mergeRunOpts(opts);
    if (merged.verbose) printCmdLine(opts.display ?? cmd, args);
    return tinyexec(cmd, args, {
      throwOnError: opts.throwOnError ?? true,
      ...(opts.stdin !== undefined && { stdin: opts.stdin }),
      nodeOptions: {
        cwd: merged.cwd,
        ...(merged.env && { env: merged.env }),
        stdio: "inherit",
        ...(opts.shell && { shell: true }),
      },
    });
  }

  async runCaptured(cmd: string, args: string[] = [], opts: RunOptions = {}): Promise<Output> {
    const merged = this.#mergeRunOpts(opts);
    return tinyexec(cmd, args, {
      throwOnError: opts.throwOnError ?? true,
      ...(opts.stdin !== undefined && { stdin: opts.stdin }),
      nodeOptions: {
        cwd: merged.cwd,
        ...(merged.env && { env: merged.env }),
        ...(opts.shell && { shell: true }),
      },
    });
  }

  #mergeRunOpts(opts: RunOptions) {
    return {
      cwd: opts.cwd ?? this.#options.cwd ?? process.cwd(),
      env: opts.env ? { ...this.#options.env, ...opts.env } : this.#options.env,
      verbose: opts.verbose ?? this.#options.verbose ?? true,
    };
  }
}

function printCmdLine(cmd: string, args: string[]): void {
  const tail = args.length === 0 ? "" : ` ${args.join(" ")}`;
  process.stderr.write(`${palette.dim("$")} ${palette.highlight(cmd)}${tail}\n`);
}
