import { getVersion } from "@variableland/clibuddy";
import { Command } from "commander";
import { ctx } from "~/services/ctx";
import { addCommand } from "./commands/add";
import { initCommand } from "./commands/init";
import { BANNER_TEXT } from "./ui";

export function createProgram() {
  const version = getVersion(ctx.value.binPkg);

  return new Command("vland")
    .version(version, "-v, --version")
    .addHelpText("before", BANNER_TEXT)
    .addCommand(initCommand)
    .addCommand(addCommand);
}
