import util from "node:util";
import { type ConsolaInstance, createConsola } from "consola";
import createDebug from "debug";
import { DEFAULT_FORMATTERS, DEFAULT_FORMAT_OPTIONS } from "./const";
import type { AnyConsole, ConsoleOptions, CreateOptions, DebugInstance } from "./types";

export class Console implements AnyConsole {
  #options: ConsoleOptions;
  #debug: DebugInstance;
  #consola: ConsolaInstance;

  constructor(options: ConsoleOptions) {
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

export function createConsole(options: CreateOptions) {
  return new Console({
    debugLabel: options.debugLabel,
    formatOptions: {
      ...DEFAULT_FORMAT_OPTIONS,
      ...options.formatOptions,
    },
    formatters: {
      ...DEFAULT_FORMATTERS,
      ...options.formatters,
    },
  });
}
