export type FormatOptions = {
  check?: boolean;
  fix?: boolean;
};

export type LintOptions = {
  check?: boolean;
  fix?: boolean;
};

export type Formatter = {
  bin: string;
  format(options: FormatOptions): Promise<void>;
};

export type Linter = {
  bin: string;
  lint(options: LintOptions): Promise<void>;
};
