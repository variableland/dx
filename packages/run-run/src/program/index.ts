import { createCommand } from "commander";
import { createContext } from "#src/services/ctx.ts";
import { createBuildLibCommand } from "./commands/build-lib.ts";
import { createCheckCommand } from "./commands/check.ts";
import { createCleanCommand } from "./commands/clean.ts";
import { createCompletionCommand } from "./commands/completion.ts";
import { createConfigCommand } from "./commands/config.ts";
import { createFormatCommand } from "./commands/format.ts";
import { createJsCheckCommand } from "./commands/jscheck.ts";
import { createLintCommand } from "./commands/lint.ts";
import { createPkgsCommand } from "./commands/pkgs.ts";
import { createToolsCommand } from "./commands/tools.ts";
import { createTsCheckCommand } from "./commands/tscheck.ts";
import { addUsage } from "./commands/usage.ts";
import { createXCommand } from "./commands/x.ts";
import { CREDITS_TEXT, getBannerText } from "./ui.ts";

export type Options = {
  binDir: string;
};

export async function createProgram(options: Options) {
  const ctx = await createContext(options.binDir);
  const version = ctx.binPkg.version;

  const program = addUsage(
    createCommand("rr")
      .usage("[options] <command...>")
      .enablePositionalOptions()
      .version(version, "-v, --version")
      .addHelpText("before", getBannerText(version))
      .addHelpText("after", CREDITS_TEXT)
      // completion
      .addCommand(createCompletionCommand())
      // build
      .addCommand(createBuildLibCommand(ctx))
      // check
      .addCommand(createJsCheckCommand(ctx))
      .addCommand(createTsCheckCommand(ctx))
      .addCommand(createLintCommand(ctx))
      .addCommand(createFormatCommand(ctx))
      .addCommand(createCheckCommand(ctx))
      // misc
      .addCommand(createCleanCommand())
      .addCommand(createPkgsCommand(ctx))
      .addCommand(createXCommand(ctx))
      // config
      .addCommand(createConfigCommand(ctx))
      // hidden
      .addCommand(createToolsCommand(ctx), { hidden: true }),
  );

  return { program, ctx };
}
