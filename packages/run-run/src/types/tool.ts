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

export type TypeChecker = {
  check(): Promise<void>;
};
