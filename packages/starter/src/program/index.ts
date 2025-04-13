import { getVersion } from "@variableland/clibuddy";
import { Command } from "commander";
import { createContext } from "~/services/ctx";
import { createAddCommand } from "./commands/add";
import { createInitCommand } from "./commands/init";
import { BANNER_TEXT } from "./ui";

export type Options = {
  binDir: string;
};

export async function createProgram(options: Options) {
  const ctx = await createContext(options.binDir);

  return new Command("vland")
    .version(getVersion(ctx.binPkg), "-v, --version")
    .addHelpText("before", BANNER_TEXT)
    .addCommand(createInitCommand(ctx))
    .addCommand(createAddCommand(ctx));
}
