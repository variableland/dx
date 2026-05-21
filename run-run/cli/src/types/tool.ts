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

export type DoctorOutput = {
  stdout: string;
  stderr: string;
  exitCode: number | undefined;
};

export type DoctorResult = {
  ok: boolean;
  output: DoctorOutput;
};

export type Doctor = {
  ui: string;
  doctor(): Promise<DoctorResult>;
};

export type Formatter = {
  bin: string;
  ui: string;
  format(options: FormatOptions): Promise<void>;
};

export type Linter = {
  bin: string;
  ui: string;
  lint(options: LintOptions): Promise<void>;
};

export type StaticChecker = {
  bin: string;
  ui: string;
  check(options: StaticCheckerOptions): Promise<void>;
};

export type TypeCheckOptions = {
  /** Where to run the type checker. Defaults to the kernel's `cwd`. */
  cwd?: string;
};

export type TypeChecker = {
  bin: string;
  ui: string;
  check(options?: TypeCheckOptions): Promise<void>;
};
