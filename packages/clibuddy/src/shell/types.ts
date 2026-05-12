export type ShellOptions = {
  cwd?: string;
  env?: NodeJS.ProcessEnv;
  verbose?: boolean;
};

export type RunOptions = ShellOptions & {
  throwOnError?: boolean;
  shell?: boolean;
  stdin?: string;
  display?: string;
};
