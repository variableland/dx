import { getVersion } from "@vlandoss/clibuddy";
import { createCommand } from "commander";
import { createContext } from "#/services/ctx";
import { createBuildLibCommand } from "./commands/build-lib";
import { createCheckCommand } from "./commands/check";
import { createCleanCommand } from "./commands/clean";
import { createConfigCommand } from "./commands/config";
import { createFormatCommand } from "./commands/format";
import { createLintCommand } from "./commands/lint";
import { createPkgsCommand } from "./commands/pkgs";
import { createRunCommand } from "./commands/run";
import { createToolsCommand } from "./commands/tools";
import { createTypecheckCommand } from "./commands/typecheck";
import { CREDITS_TEXT, getBannerText } from "./ui";

export type Options = {
  binDir: string;
};

export async function createProgram(options: Options) {
  const ctx = await createContext(options.binDir);
  const version = getVersion(ctx.binPkg);

  const program = createCommand("rr")
    .alias("run-run")
    .usage("[options] <command...>")
    .helpCommand(false)
    .version(version, "-v, --version")
    .addHelpText("before", getBannerText(version))
    .addHelpText("after", CREDITS_TEXT)
    // build
    .addCommand(createBuildLibCommand(ctx))
    // check
    .addCommand(createLintCommand(ctx))
    .addCommand(createFormatCommand(ctx))
    .addCommand(createCheckCommand(ctx))
    .addCommand(createTypecheckCommand(ctx))
    // misc
    .addCommand(createCleanCommand())
    .addCommand(createPkgsCommand(ctx))
    // config
    .addCommand(createConfigCommand(ctx))
    // hidden
    .addCommand(createRunCommand(ctx), { hidden: true })
    .addCommand(createToolsCommand(ctx), { hidden: true });

  return { program, ctx };
}
