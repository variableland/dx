import { generateToStdout } from "@usage-spec/commander";
import { type Command, Option } from "commander";

export function addUsage(program: Command) {
  return program.addOption(new Option("--usage", "print KDL spec for this CLI (https://kdl.dev)")).on("option:usage", () => {
    generateToStdout(program);
    process.exit(0);
  });
}
