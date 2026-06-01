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

export type TypeCheckOptions = {
  cwd?: string;
};

export type Doctor = {
  doctor: () => Promise<RunReport>;
};

export type Formatter = {
  readonly ui: string;
  format: (options: FormatOptions) => Promise<RunReport>;
};

export type Linter = {
  readonly ui: string;
  lint: (options: LintOptions) => Promise<RunReport>;
};

export type StaticChecker = {
  readonly ui: string;
  check: (options: StaticCheckerOptions) => Promise<RunReport>;
};

export type TypeChecker = {
  readonly ui: string;
  check: (options?: TypeCheckOptions) => Promise<RunReport>;
};

export type Packer = {
  readonly ui: string;
  pack: () => Promise<RunReport>;
};
