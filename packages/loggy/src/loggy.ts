import util from "node:util";
import { type ConsolaInstance, createConsola } from "consola";
import { colors } from "consola/utils";
import createDebug from "debug";
import { DEFAULT_FORMATTERS, DEFAULT_FORMAT_OPTIONS } from "./const";
import type { AnyLogger, CreateOptions, LogFnOptions, LoggerOptions } from "./types";

function isLogFnOptions(arg: unknown): arg is LogFnOptions {
  try {
    // @ts-expect-error
    return typeof arg.message === "string" && typeof arg.tag === "string";
  } catch {
    return false;
  }
}

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

  error(...args: unknown[]) {
    this.#consola.error(this.#format(...args));
  }

  info(opts: LogFnOptions | unknown, ...args: unknown[]) {
    this.#consola.info(this.#format(opts, ...args));
  }

  trace(opts: LogFnOptions | unknown, ...args: unknown[]) {
    this.#consola.trace(this.#format(opts, ...args));
  }

  warn(opts: LogFnOptions | unknown, ...args: unknown[]) {
    this.#consola.warn(this.#format(opts, ...args));
  }

  child(options: CreateOptions) {
    return new Loggy({
      ...this.#options,
      ...options,
      namespace: `${this.#options.namespace}:${options.namespace}`,
    });
  }

  start(opts: LogFnOptions | unknown, ...args: unknown[]) {
    this.#consola.start(this.#format(opts, ...args));
  }

  success(opts: LogFnOptions | unknown, ...args: unknown[]) {
    this.#consola.success(this.#format(opts, ...args));
  }

  subdebug(namespace: string) {
    return createDebug(`${this.#options.namespace}:${namespace}`);
  }

  #format(...args: unknown[]) {
    const [firstArg, ...restArgs] = args;

    const tag = isLogFnOptions(firstArg) ? firstArg.tag : this.#options.tag;
    const formattedArgs = isLogFnOptions(firstArg) ? [firstArg.message, ...restArgs] : args;

    if (typeof formattedArgs[0] !== "string") {
      formattedArgs.unshift("%O");
    }

    const [message, ...replacements] = formattedArgs;
    let replacementIndex = -1;

    if (typeof message !== "string") {
      throw new TypeError("message must be a string");
    }

    let formattedMessage = message
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

    formattedMessage = !tag ? formattedMessage : `${colors.cyan(`[${tag}]`)} ${formattedMessage}`;

    return util.formatWithOptions(this.#options.formatOptions, formattedMessage, ...replacements);
  }
}

export function createLoggy(options: CreateOptions) {
  return new Loggy({
    namespace: options.namespace,
    tag: options.tag,
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
