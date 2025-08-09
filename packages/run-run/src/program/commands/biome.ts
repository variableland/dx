import { createCommand } from "commander";
import type { Context } from "~/services/ctx";

export function createBiomeCommand(ctx: Context) {
  return createCommand("biome")
    .description("expose the biome binary 🛠️")
    .helpCommand(false)
    .helpOption(false)
    .allowExcessArguments(true)
    .allowUnknownOption(true)
    .action(async function biomeAction(_, { args }) {
      await ctx.shell.$`biome ${args.join(" ")}`;
    });
}
