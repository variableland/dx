import { Command } from "commander";
import { createContext } from "#src/services/ctx.ts";
import { createCompletionCommand } from "./commands/completion.ts";
import { createInitCommand } from "./commands/init.ts";
import { addUsage } from "./commands/usage.ts";
import { getBannerText } from "./ui.ts";

export type Options = {
  binDir: string;
};

export async function createProgram(options: Options) {
  const ctx = await createContext(options.binDir);
  const version = ctx.binPkg.version;

  return addUsage(
    new Command("vland")
      .version(version, "-v, --version")
      .addHelpText("before", getBannerText(version))
      .addCommand(createCompletionCommand())
      .addCommand(createInitCommand(ctx)),
  );
}
