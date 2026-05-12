import fs from "node:fs";
import { ShellService } from "./shell.ts";
import type { ShellOptions } from "./types.ts";

export const cwd = fs.realpathSync(process.cwd());

export function createShellService(options: ShellOptions = {}): ShellService {
  return new ShellService({ cwd, ...options });
}
