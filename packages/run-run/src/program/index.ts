import { getVersion } from "@vlandoss/clibuddy";
import { Command } from "commander";
import { createContext } from "~/services/ctx";
import { createCleanCommand } from "./commands/clean";
import { createFormatCommand } from "./commands/format";
import { createInfoPkgCommand } from "./commands/info-pkg";
import { createLintCommand } from "./commands/lint";
import { createTestStaticCommand } from "./commands/test-static";
import { createTypecheckCommand } from "./commands/typecheck";
import { BANNER_TEXT, CREDITS_TEXT } from "./ui";

export type Options = {
  binDir: string;
};

export async function createProgram(options: Options) {
  const ctx = await createContext(options.binDir);

  const cmd = new Command("rr")
    .alias("run-run")
    .version(getVersion(ctx.binPkg), "-v, --version")
    .addHelpText("before", BANNER_TEXT)
    .addHelpText("after", CREDITS_TEXT)
    .addCommand(createFormatCommand(ctx))
    .addCommand(createLintCommand(ctx))
    .addCommand(createTestStaticCommand(ctx))
    .addCommand(createCleanCommand())
    .addCommand(createTypecheckCommand(ctx))
    .addCommand(createInfoPkgCommand(ctx));

  return { cmd, ctx };
}
