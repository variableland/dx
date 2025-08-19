import { createCommand } from "commander";
import type { Context } from "~/services/ctx";

export function createRunCommand(ctx: Context) {
  const program = createCommand("run")
    .argument("<cmds...>", "commands to execute in sequence (e.g. 'check tsc')")
    .action(async function runRunAction(cmds: string[]) {
      const { $ } = ctx.shell;
      const commands = cmds.map((cmd) => $`rr ${cmd}`);
      await Promise.all(commands);
    });

  return program;
}
