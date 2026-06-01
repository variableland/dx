import { colorize } from "@vlandoss/clibuddy";
import { Argument } from "commander";
import { createCommand } from "../base.ts";

const SHELLS = ["bash", "zsh", "fish"] as const;
const usageColor = colorize("#24C55E");

// Ghost command: registered with Commander purely for discoverability — it surfaces
// in `rr --help` and is baked into dist/cli.usage.kdl so the completion itself can
// suggest "completion" after `rr <TAB>`. The actual handler lives in the bash bin
// dispatcher, which intercepts `rr completion <shell>` before reaching Node.
export function createCompletionCommand() {
  return createCommand("completion")
    .summary(`print shell completion script`)
    .description(
      `Prints a shell completion script for rr. Add to your shell rc file:

  bash: eval "$(rr completion bash)"
  zsh:  eval "$(rr completion zsh)"
  fish: rr completion fish | source`,
    )
    .addArgument(new Argument("<shell>", `target shell`).choices(SHELLS))
    .addHelpText(
      "afterAll",
      `\nUnder the hood, this command uses ${usageColor("usage")} (https://usage.jdx.dev).
Make sure to have it installed and available in your PATH.`,
    );
}
