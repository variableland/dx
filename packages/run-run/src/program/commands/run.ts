import { createCommand } from "commander";
import type { Context } from "#/services/ctx";

export function createRunCommand(ctx: Context) {
  return createCommand("run")
    .argument("<cmds...>", "commands to execute concurrently (e.g. 'check tsc')")
    .action(async function runRunAction(cmds: string[]) {
      const { $ } = ctx.shell;
      const commands = cmds.map((cmd) => $`rr ${cmd}`);
      await Promise.all(commands);
    });
}
