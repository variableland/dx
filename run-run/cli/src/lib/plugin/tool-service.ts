import { palette, resolvePackageBin, type ShellService } from "@vlandoss/clibuddy";
import type { RunReport } from "#src/types/tool.ts";

export type ToolServiceOptions = {
  pkg?: string;
  bin: string;
  color: (str: string) => string;
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

export type RunReportOptions = {
  cwd?: string;
};

export class ToolService {
  #shellService: ShellService;
  #pkg: string;
  #bin: string;
  #from: string;
  #ui: string;

  get pkg() {
    return this.#pkg;
  }

  get ui() {
    return this.#ui;
  }

  constructor({ pkg, bin, color, shellService, from }: ToolServiceOptions) {
    this.#bin = bin;
    this.#pkg = pkg ?? bin;
    this.#ui = color(bin);
    this.#shellService = shellService;
    this.#from = from;
  }

  async getBinDir() {
    return resolvePackageBin(this.#pkg, {
      from: this.#from,
      binName: this.#bin,
    });
  }

  /**
   * Runs the tool capturing its output instead of streaming it, and reports the
   * verdict straight from the exit code — never a guess parsed from the output.
   * The board needs the capture to attribute each parallel run's output to its
   * package; the non-zero exit is returned (not thrown) so every task settles
   * and the caller can aggregate. See `decisions/013-check-stream-to-capture-contract.md`.
   */
  async runReport(args: string[] = [], options: RunReportOptions = {}): Promise<RunReport> {
    const sh = options.cwd ? this.#shellService.at(options.cwd) : this.#shellService;
    const output = await sh.runCaptured(await this.getBinDir(), args, { throwOnError: false });
    // Lead the captured output with the command line that ran — the same
    // `$ <cmd>` the streaming path prints via `printCmdLine`, so it stays
    // visible even when captured. It's dim so it reads as context, not result.
    const header = palette.dim(`$ ${[this.#bin, ...args].join(" ")}`);
    const body = combine(output.stdout, output.stderr);
    // Strict `=== 0`: a missing exit code (signal-killed, e.g. OOM) is a
    // failure, not a pass — `?? 0` would silently report a crashed tool green.
    return { ok: output.exitCode === 0, output: body ? `${header}\n${body}` : header };
  }

  async doctor(): Promise<RunReport> {
    const output = await this.#shellService.runCaptured(await this.getBinDir(), ["--help"], { throwOnError: false });
    const ok = output.exitCode === 0;
    // Same shape as the other verbs: lead with the `$ <bin> --help` liveness
    // command (the tool's full help text is noise on success, so it's dropped);
    // on failure surface whatever the bin printed — stdout AND stderr — so the
    // reason it won't run is visible.
    const command = palette.dim(`$ ${this.#bin} --help`);
    if (ok) return { ok, output: command };
    const detail = combine(output.stdout, output.stderr);
    return { ok, output: detail ? `${command}\n${detail}` : command };
  }
}

/** Joins the non-empty, trimmed streams of a captured run. */
function combine(stdout: string | undefined, stderr: string | undefined): string {
  return [stdout, stderr]
    .map((stream) => stream?.trim())
    .filter(Boolean)
    .join("\n");
}
