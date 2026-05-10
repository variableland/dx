import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import { dirnameOf } from "@vlandoss/clibuddy";

export function createTestCli(mode: "dev" | "prod" = "prod") {
  const bin = resolve(dirnameOf(import.meta), "../bin");

  // NODE_ENV=test and TEST=true (injected by vitest) cause consola to suppress
  // all output. Override them so the subprocess behaves like a real invocation.
  return function cli(cmd: string) {
    return spawnSync(bin, cmd.split(" "), {
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
