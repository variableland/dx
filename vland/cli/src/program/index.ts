import { generateToStdout } from "@usage-spec/commander";
import { palette } from "@vlandoss/clibuddy";
import { Command, Option } from "commander";
import { createContext } from "#src/services/ctx.ts";
import { createCompletionCommand } from "./commands/completion.ts";
import { createInitCommand } from "./commands/init.ts";
import { getBannerText } from "./ui.ts";

export type Options = {
  binDir: string;
};

export async function createProgram(options: Options) {
  const ctx = await createContext(options.binDir);
  const version = ctx.binPkg.version;

  return new Command("vland")
    .version(version, "-v, --version")
    .addOption(new Option("--usage", `print KDL spec for this CLI (${palette.dim(palette.link("https://kdl.dev"))})`))
    .on("option:usage", function onUsage(this: Command) {
      generateToStdout(this);
      process.exit(0);
    })
    .addHelpText("before", getBannerText(version))
    .addCommand(createCompletionCommand())
    .addCommand(createInitCommand(ctx));
}
