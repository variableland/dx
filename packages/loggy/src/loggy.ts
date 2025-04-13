import util from "node:util";
import { type ConsolaInstance, createConsola } from "consola";
import createDebug from "debug";
import { DEFAULT_FORMATTERS, DEFAULT_FORMAT_OPTIONS } from "./const";
import type { AnyLogger, CreateOptions, LoggerOptions } from "./types";

export class Loggy implements AnyLogger {
  #options: LoggerOptions;
  #debug: ReturnType<typeof createDebug>;
  #consola: ConsolaInstance;

  constructor(options: LoggerOptions) {
    this.#options = options;
    this.#debug = createDebug(`${options.namespace}:root`);
    this.#consola = createConsola({
      formatOptions: options.formatOptions,
    });
  }

  get namespace() {
    return this.#options.namespace;
  }

  debug(...args: unknown[]) {
    // @ts-expect-error - it really accepts this signature
    this.#debug(...args);
  }

  error(messageOrError: string | unknown, ...args: unknown[]) {
    this.#consola.error(messageOrError, ...args);
  }

  info(...args: unknown[]) {
    this.#consola.info(this.#format(...args));
  }

  trace(...args: unknown[]) {
    this.#consola.trace(this.#format(...args));
  }

  warn(...args: unknown[]) {
    this.#consola.warn(this.#format(...args));
  }

  child(namespace: string) {
    return new Loggy({
      ...this.#options,
      namespace: `${this.#options.namespace}:${namespace}`,
    });
  }

  start(...args: unknown[]) {
    this.#consola.start(this.#format(...args));
  }

  success(...args: unknown[]) {
    this.#consola.success(this.#format(...args));
  }

  subdebug(namespace: string) {
    return createDebug(`${this.#options.namespace}:${namespace}`);
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

export function createLoggy(options: CreateOptions) {
  return new Loggy({
    namespace: options.namespace,
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
