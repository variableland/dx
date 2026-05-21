import type { FormatOptions } from "consola";

export type AnyLogFn = (...args: unknown[]) => void;

export type LogFn = (opts: LogFnOptions | string, ...args: unknown[]) => void;

export type Formatters = Record<string, (arg: unknown) => string>;

export type AnyLogger = {
  namespace: string;
  debug: AnyLogFn;
  error: AnyLogFn;
  info: LogFn;
  trace: LogFn;
  warn: LogFn;
  child: (options: CreateOptions) => AnyLogger;
  // { extras
  subdebug: (namespace: string) => AnyLogFn;
  start: LogFn;
  success: LogFn;
  // }
};

export type CreateOptions = {
  namespace: string;
  tag?: string;
  formatOptions?: FormatOptions;
  formatters?: Formatters;
};

export type LoggerOptions = {
  tag?: string;
  namespace: string;
  formatOptions: FormatOptions;
  formatters: Formatters;
};

export type LogFnOptions = {
  tag: string;
  message: string;
};

export type { FormatOptions };
