import fs from "node:fs";
import { ShellService } from "./shell";
import type { CreateOptions } from "./types";
import { getPreferLocal } from "./utils";

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

export const isRaw = (arg: unknown): arg is { stdout: string } =>
  typeof arg === "object" && arg !== null && "stdout" in arg && typeof arg.stdout === "string";

function defaultQuote(arg: unknown) {
  if (typeof arg === "string") {
    return quote(arg);
  }

  if (isRaw(arg)) {
    return arg.stdout;
  }

  throw TypeError(`Unsupported argument type: ${typeof arg}`);
}

export function createShellService(options: CreateOptions = {}) {
  const preferLocal = getPreferLocal(options.localBaseBinPath);

  return new ShellService({
    verbose: true,
    cwd,
    preferLocal,
    quote: defaultQuote,
    ...options,
  });
}
