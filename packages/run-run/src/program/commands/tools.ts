import { createCommand } from "commander";
import type { Context } from "~/services/ctx";

export function createToolsCommand(ctx: Context) {
  function createToolCommandAction(toolBin: string) {
    return async function toolAction(_: unknown, { args }: { args: string[] }) {
      const { $ } = ctx.shell.child({
        preferLocal: false,
      });

      await $`${toolBin} ${args.join(" ")}`;
    };
  }

  function createToolCommand(toolBin: string) {
    return createCommand(toolBin)
      .helpCommand(false)
      .helpOption(false)
      .allowExcessArguments(true)
      .allowUnknownOption(true)
      .action(createToolCommandAction(toolBin));
  }

  return createCommand("tools")
    .description("expose the internal tools 🛠️")
    .addCommand(createToolCommand("biome"))
    .addCommand(createToolCommand("tsc"))
    .addCommand(createToolCommand("rimraf"));
}
