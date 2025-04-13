import util from "node:util";
import type { FormatOptions, Formatters } from "./types";

export const DEFAULT_FORMAT_OPTIONS: FormatOptions = {
  colors: true,
  depth: 3,
  maxArrayLength: 50,
  breakLength: 80,
};

export const DEFAULT_FORMATTERS: Formatters = {
  o: (arg: unknown) => {
    return util
      .inspect(arg, DEFAULT_FORMAT_OPTIONS)
      .split("\n")
      .map((str) => str.trim())
      .join(" ");
  },
  O: (arg: unknown) => {
    return util.inspect(arg, DEFAULT_FORMAT_OPTIONS);
  },
};
