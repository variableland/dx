/**
 * The outcome of running a check-family tool (lint / format / static check /
 * type check) captured rather than streamed. `ok` is the tool's own verdict —
 * its exit code, never a guess parsed from output — and `output` is the
 * combined captured stdout+stderr (color preserved), flushed verbatim grouped
 * under the package label. We deliberately do NOT parse tool summaries for
 * warning/error counts: the formats are unstable and not uniform across tools
 * (tsc and oxfmt have no machine output at all). See decisions/013.
 */
export type RunReport = {
  ok: boolean;
  output: string;
};

export type FormatOptions = {
  fix?: boolean;
};

export type LintOptions = {
  fix?: boolean;
};

export type StaticCheckerOptions = {
  fix?: boolean;
  fixStaged?: boolean;
};

export type Doctor = {
  ui: string;
  /**
   * Verifies the tool is wired correctly. Returns a `RunReport` like every
   * other verb so the board renders it identically — `output` leads with the
   * `$ <bin> --help` liveness command, plus the error if the bin won't run.
   */
  doctor: () => Promise<RunReport>;
};

export type Formatter = {
  bin: string;
  ui: string;
  format: (options: FormatOptions) => Promise<RunReport>;
};

export type Linter = {
  bin: string;
  ui: string;
  lint: (options: LintOptions) => Promise<RunReport>;
};

export type StaticChecker = {
  bin: string;
  ui: string;
  check: (options: StaticCheckerOptions) => Promise<RunReport>;
};

export type TypeCheckOptions = {
  /** Where to run the type checker. Defaults to the kernel's `cwd`. */
  cwd?: string;
};

export type TypeChecker = {
  bin: string;
  ui: string;
  check: (options?: TypeCheckOptions) => Promise<RunReport>;
};
