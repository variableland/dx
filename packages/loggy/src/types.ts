import type { FormatOptions } from "consola";

export type AnyLogFn = (...args: unknown[]) => void;

export type Formatters = Record<string, (arg: unknown) => string>;

export type AnyLogger = {
  namespace: string;
  debug: AnyLogFn;
  error: AnyLogFn;
  info: AnyLogFn;
  trace: AnyLogFn;
  warn: AnyLogFn;
  child: (namespace: string) => AnyLogger;
  // { extras
  subdebug: (namespace: string) => AnyLogFn;
  start: AnyLogFn;
  success: AnyLogFn;
  // }
};

export type CreateOptions = {
  namespace: string;
  formatOptions?: FormatOptions;
  formatters?: Formatters;
};

export type LoggerOptions = {
  namespace: string;
  formatOptions: FormatOptions;
  formatters: Formatters;
};

export type { FormatOptions };
