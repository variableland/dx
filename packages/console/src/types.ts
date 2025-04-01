import type { FormatOptions } from "consola";
import type createDebug from "debug";

export type DebugInstance = ReturnType<typeof createDebug>;
export type AnyLogFn = (message: string, ...args: unknown[]) => void;
export type Formatters = Record<string, (arg: unknown) => string>;

export type AnyConsole = {
  info: AnyLogFn;
  start: AnyLogFn;
  success: AnyLogFn;
  error: AnyLogFn;
  warn: AnyLogFn;
  debug: DebugInstance;
  subdebug: (label: string) => DebugInstance;
};

export type CreateOptions = {
  debugLabel: string;
  formatOptions?: FormatOptions;
  formatters?: Formatters;
};

export type ConsoleOptions = {
  debugLabel: string;
  formatOptions: FormatOptions;
  formatters: Formatters;
};

export type { FormatOptions };
