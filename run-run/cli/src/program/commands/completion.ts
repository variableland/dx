import { colorize } from "@variablelab/clibuddy";
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
      `Prints a shell completion script for rr. Add your shell's line to its rc file:

    # bash — ~/.bashrc
    command -v rr >/dev/null 2>&1 && eval "$(rr completion bash 2>/dev/null)"

    # zsh — ~/.zshrc
    command -v rr >/dev/null 2>&1 && eval "$(rr completion zsh 2>/dev/null)"

    # fish — ~/.config/fish/config.fish
    command -v rr >/dev/null 2>&1; and rr completion fish 2>/dev/null | source`,
    )
    .configureHelp({
      // Commander hard-wraps help at the terminal width; a wrapped rc line breaks when pasted.
      helpWidth: Number.POSITIVE_INFINITY,
    })
    .addArgument(new Argument("<shell>", `target shell`).choices(SHELLS))
    .addHelpText(
      "afterAll",
      `\nUnder the hood, this command uses ${usageColor("usage")} (https://usage.jdx.dev).
Make sure to have it installed and available in your PATH.`,
    );
}
