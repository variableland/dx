import { getVersion } from "@vlandoss/clibuddy";
import { Command } from "commander";
import { createContext } from "#src/services/ctx.ts";
import { createAddCommand } from "./commands/add.ts";
import { createInitCommand } from "./commands/init.ts";
import { getBannerText } from "./ui.ts";

export type Options = {
  binDir: string;
};

export async function createProgram(options: Options) {
  const ctx = await createContext(options.binDir);
  const version = getVersion(ctx.binPkg);

  return new Command("vland")
    .version(version, "-v, --version")
    .addHelpText("before", getBannerText(version))
    .addCommand(createInitCommand(ctx))
    .addCommand(createAddCommand(ctx));
}
