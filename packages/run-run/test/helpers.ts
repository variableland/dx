import { spawnSync } from "node:child_process";
import { resolve } from "node:path";

export function createTestCli(mode: "dev" | "prod" = "prod") {
  const bin = resolve(import.meta.dirname, mode === "dev" ? "../bin.ts" : "../bin.mjs");

  // NODE_ENV=test and TEST=true (injected by vitest) cause consola to suppress
  // all output. Override them so the subprocess behaves like a real invocation.
  return function cli(cmd: string) {
    return spawnSync("node", [bin, ...cmd.split(" ")], {
      encoding: "utf8",
      env:
        mode === "dev"
          ? process.env
          : {
              ...process.env,
              NODE_ENV: "production",
              TEST: undefined,
            },
    });
  };
}
