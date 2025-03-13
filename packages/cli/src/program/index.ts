import { Command } from "commander";
import { BANNER_TEXT, CREDITS_TEXT } from "../ui";
import { cleanCommand } from "./commands/clean";
import { formatCommand } from "./commands/format";
import { lintCommand } from "./commands/lint";
import { testStaticCommand } from "./commands/test-static";
import { typecheckCommand } from "./commands/typecheck";
import { getVersion } from "./version";

export function createProgram() {
  return new Command("rr")
    .alias("run-run")
    .version(getVersion(), "-v, --version")
    .addHelpText("before", BANNER_TEXT)
    .addHelpText("after", CREDITS_TEXT)
    .addCommand(formatCommand)
    .addCommand(lintCommand)
    .addCommand(testStaticCommand)
    .addCommand(cleanCommand)
    .addCommand(typecheckCommand);
}
