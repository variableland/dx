import { getVersion } from "@vlandoss/clibuddy";
import { createCommand } from "commander";
import { createContext } from "#/services/ctx";
import { createCheckCommand } from "./commands/check";
import { createCleanCommand } from "./commands/clean";
import { createFormatCommand } from "./commands/format";
import { createLintCommand } from "./commands/lint";
import { createRunCommand } from "./commands/run";
import { createToolsCommand } from "./commands/tools";
import { createTypecheckCommand } from "./commands/typecheck";
import { BANNER_TEXT, CREDITS_TEXT } from "./ui";

export type Options = {
  binDir: string;
};

export async function createProgram(options: Options) {
  const ctx = await createContext(options.binDir);

  const program = createCommand("rr")
    .alias("run-run")
    .usage("[options] <command...>")
    .version(getVersion(ctx.binPkg), "-v, --version")
    .addHelpText("before", BANNER_TEXT)
    .addHelpText("after", CREDITS_TEXT)
    .addCommand(createRunCommand(ctx), {
      hidden: true,
    })
    .addCommand(createCheckCommand(ctx))
    .addCommand(createLintCommand(ctx))
    .addCommand(createFormatCommand(ctx))
    .addCommand(createTypecheckCommand(ctx))
    .addCommand(createCleanCommand())
    .addCommand(createToolsCommand(ctx), {
      hidden: true,
    });

  return { program, ctx };
}
