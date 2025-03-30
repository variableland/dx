import util from "node:util";
import { type ConsolaInstance, type FormatOptions, createConsola } from "consola";
import createDebug from "debug";

type DebugInstance = ReturnType<typeof createDebug>;
type AnyLogFn = (message: string, ...args: unknown[]) => void;
type Formatters = Record<string, (arg: unknown) => string>;

export type AnyLogger = {
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

export type LoggerOptions = {
  debugLabel: string;
  formatOptions: FormatOptions;
  formatters: Formatters;
};

export class Logger implements AnyLogger {
  #options: LoggerOptions;
  #debug: DebugInstance;
  #consola: ConsolaInstance;

  constructor(options: LoggerOptions) {
    this.#options = options;
    this.#debug = createDebug(`${options.debugLabel}:root`);
    this.#consola = createConsola({
      formatOptions: options.formatOptions,
    });
  }

  info(message: string, ...args: unknown[]) {
    this.#consola.info(this.#format(message, ...args));
  }

  start(message: string, ...args: unknown[]) {
    this.#consola.start(this.#format(message, ...args));
  }

  success(message: string, ...args: unknown[]) {
    this.#consola.success(this.#format(message, ...args));
  }

  error(messageOrError: string | unknown, ...args: unknown[]) {
    this.#consola.error(messageOrError, ...args);
  }

  warn(message: string, ...args: unknown[]) {
    this.#consola.warn(this.#format(message, ...args));
  }

  subdebug(label: string) {
    return createDebug(`${this.#options.debugLabel}:${label}`);
  }

  get debug() {
    return this.#debug;
  }

  #format(...args: unknown[]) {
    const formattedArgs = [...args];

    if (typeof formattedArgs[0] !== "string") {
      formattedArgs.unshift("%O");
    }

    const [message, ...replacements] = formattedArgs;
    let replacementIndex = -1;

    // @ts-expect-error - we're sure that message is a string due to the above check
    const formattedMessage = message
      .replace(
        /%([a-zA-Z%])/g, // matches %o, %O, %%, etc.
        (match: string, formatKey: string) => {
          if (formatKey === "%") {
            return "%";
          }

          replacementIndex++;

          const formatter = this.#options.formatters[formatKey];

          if (typeof formatter !== "function") {
            return match;
          }

          const replacement = replacements[replacementIndex];
          const formattedMatch = formatter(replacement);

          replacements.splice(replacementIndex, 1);
          replacementIndex--;

          return formattedMatch;
        },
      )
      .split("\n")
      .join(`\n${" ".repeat(2)}`);

    return util.formatWithOptions(this.#options.formatOptions, formattedMessage, ...replacements);
  }
}

export const DEFAULT_FORMAT_OPTIONS: FormatOptions = {
  colors: true,
  depth: 3,
  maxArrayLength: 50,
  breakLength: 80,
};

export function createLogger(options: CreateOptions) {
  const formatOptions = {
    ...DEFAULT_FORMAT_OPTIONS,
    ...options.formatOptions,
  };

  const formatters = {
    o: (arg: unknown) => {
      return util
        .inspect(arg, formatOptions)
        .split("\n")
        .map((str) => str.trim())
        .join(" ");
    },
    O: (arg: unknown) => {
      return util.inspect(arg, formatOptions);
    },
    ...options.formatters,
  };

  return new Logger({
    ...options,
    formatOptions,
    formatters,
  });
}
