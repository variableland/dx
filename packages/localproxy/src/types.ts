import type { Pkg } from "@vlandoss/clibuddy";

export type ProgramOptions = {
  binDir: string;
  installDir: string;
};

export type Context = {
  binDir: string;
  installDir: string;
  caddyfilePath: string;
  binPkg: Pkg;
};
