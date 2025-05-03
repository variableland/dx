import fs from "node:fs";
import path from "node:path";
import { ShellService } from "./shell";
import type { CreateOptions } from "./types";

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

const getLocalBinPath = (dirPath: string) => path.join(dirPath, "node_modules", ".bin");

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
  const preferLocal = !options.localBaseBinPath
    ? undefined
    : Array.isArray(options.localBaseBinPath)
      ? options.localBaseBinPath.map(getLocalBinPath)
      : [options.localBaseBinPath].map(getLocalBinPath);

  return new ShellService({
    verbose: true,
    cwd,
    preferLocal,
    quote: defaultQuote,
    ...options,
  });
}
