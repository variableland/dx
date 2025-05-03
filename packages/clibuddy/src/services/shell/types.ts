import type { Options as ZxOptions, Shell as ZxShell } from "zx";

export type Shell = ZxShell;

export type ShellOptions = Partial<ZxOptions>;

export type CreateOptions = ShellOptions & {
  localBaseBinPath?: string | Array<string>;
};
