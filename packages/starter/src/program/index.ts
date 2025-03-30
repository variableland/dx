import { Command } from "commander";
import { BANNER_TEXT } from "../services/ui";
import { initCommand } from "./commands/init";
import { getVersion } from "./version";

export function createProgram() {
  return new Command("vland")
    .version(getVersion(), "-v, --version")
    .addHelpText("before", BANNER_TEXT)
    .addCommand(initCommand);
}
