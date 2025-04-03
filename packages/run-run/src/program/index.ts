import { getVersion } from "@variableland/clibuddy";
import { Command } from "commander";
import { ctx } from "~/services/ctx";
import { cleanCommand } from "./commands/clean";
import { formatCommand } from "./commands/format";
import { infoPkgCommand } from "./commands/info-pkg";
import { lintCommand } from "./commands/lint";
import { testStaticCommand } from "./commands/test-static";
import { typecheckCommand } from "./commands/typecheck";
import { BANNER_TEXT, CREDITS_TEXT } from "./ui";

export function createProgram() {
  const version = getVersion(ctx.value.binPkg);

  return new Command("rr")
    .alias("run-run")
    .version(version, "-v, --version")
    .addHelpText("before", BANNER_TEXT)
    .addHelpText("after", CREDITS_TEXT)
    .addCommand(formatCommand)
    .addCommand(lintCommand)
    .addCommand(testStaticCommand)
    .addCommand(cleanCommand)
    .addCommand(typecheckCommand)
    .addCommand(infoPkgCommand);
}
