import { getVersion } from "@vlandoss/clibuddy";
import { createCommand } from "commander";
import { createContext } from "#/services/ctx";
import { createBuildLibCommand } from "./commands/build-lib";
import { createCleanCommand } from "./commands/clean";
import { createConfigCommand } from "./commands/config";
import { createFormatCommand } from "./commands/format";
import { createJsCheckCommand } from "./commands/jscheck";
import { createLintCommand } from "./commands/lint";
import { createPkgsCommand } from "./commands/pkgs";
import { createRunCommand } from "./commands/run";
import { createTestStaticCommand } from "./commands/test-static";
import { createToolsCommand } from "./commands/tools";
import { createTsCheckCommand } from "./commands/tscheck";
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
    .addCommand(createJsCheckCommand(ctx))
    .addCommand(createTsCheckCommand(ctx))
    .addCommand(createLintCommand(ctx))
    .addCommand(createFormatCommand(ctx))
    // test
    .addCommand(createTestStaticCommand(ctx))
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
