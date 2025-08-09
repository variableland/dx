import fs from "node:fs";
import path from "node:path";
import type { Shell } from "@vlandoss/clibuddy";
import { createCommand } from "commander";
import type { Context } from "~/services/ctx";
import { logger } from "~/services/logger";

function gracefullBinDir(binPathResolver: () => string) {
  try {
    const binPath = binPathResolver();
    const isDir = fs.statSync(binPath).isDirectory();
    return isDir ? binPath : path.dirname(binPath);
  } catch (error) {
    logger.error("Error getting bin directory:", error);
    process.exit(1);
  }
}

export function createToolsCommand(ctx: Context) {
  function createToolCommandAction(toolBin: string, binResolver?: () => string) {
    return async function toolAction(_: unknown, { args }: { args: string[] }) {
      let $: Shell;

      if (!binResolver) {
        $ = ctx.shell.$;
      } else {
        $ = ctx.shell.child({
          preferLocal: [gracefullBinDir(binResolver)],
        }).$;
      }

      await $`${toolBin} ${args.join(" ")}`;
    };
  }

  function createToolCommand(toolBin: string, binResolver?: () => string) {
    return createCommand(toolBin)
      .helpCommand(false)
      .helpOption(false)
      .allowExcessArguments(true)
      .allowUnknownOption(true)
      .action(createToolCommandAction(toolBin, binResolver));
  }

  return createCommand("tools")
    .description("expose the internal tools 🛠️")
    .addCommand(createToolCommand("biome", () => require.resolve("@biomejs/biome/bin/biome")))
    .addCommand(createToolCommand("tsc"))
    .addCommand(createToolCommand("rimraf"));
}
