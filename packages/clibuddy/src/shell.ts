import fs from "node:fs";
import { $ as make$ } from "zx";

export const isRaw = (arg: unknown): arg is { stdout: string } =>
  typeof arg === "object" && arg !== null && "stdout" in arg && typeof arg.stdout === "string";

export const cwd = fs.realpathSync(process.cwd());

// Inspired by https://dub.sh/6tiHVgn
export function quote(arg: string) {
  if (/^[\w./:=@-]+$/i.test(arg) || arg === "") {
    return arg;
  }

  return arg
    .replace(/\\/g, "\\\\")
    .replace(/'/g, "\\'")
    .replace(/\f/g, "\\f")
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r")
    .replace(/\t/g, "\\t")
    .replace(/\v/g, "\\v")
    .replace(/\0/g, "\\0");
}

const shell = make$({
  cwd,
  verbose: true,
  quote: (arg: unknown) => {
    if (typeof arg === "string") {
      return quote(arg);
    }

    if (isRaw(arg)) {
      return arg.stdout;
    }

    throw TypeError(`Unsupported argument type: ${typeof arg}`);
  },
});

export const $ = Object.assign(shell, {
  quiet: shell({ verbose: false }),
});
