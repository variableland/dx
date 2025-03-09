import { DEV_CMD, IS_DEV } from "~/utils/constants";

const isRunRun = (cmd: string) => cmd === "rr";

export function named(cmd: string) {
  if (!IS_DEV) {
    return cmd;
  }

  return isRunRun(cmd) ? DEV_CMD : cmd;
}
