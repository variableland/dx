import { Argument, createCommand } from "commander";
import { TOOL_LABELS } from "../ui.ts";

const SHELLS = ["bash", "zsh", "fish"] as const;

// Ghost command: registered with Commander purely for discoverability — it surfaces
// in `vland --help` and is baked into dist/cli.usage.kdl so the completion itself can
// suggest "completion" after `vland <TAB>`. The actual handler lives in the bash bin
// dispatcher, which intercepts `vland completion <shell>` before reaching Node.
export function createCompletionCommand() {
  return createCommand("completion")
    .summary(`print shell completion script (${TOOL_LABELS.USAGE})`)
    .description(
      `Prints a shell completion script for vland. Add your shell's line to its rc file:

    # bash — ~/.bashrc
    command -v vland >/dev/null 2>&1 && eval "$(vland completion bash 2>/dev/null)"

    # zsh — ~/.zshrc
    command -v vland >/dev/null 2>&1 && eval "$(vland completion zsh 2>/dev/null)"

    # fish — ~/.config/fish/config.fish
    command -v vland >/dev/null 2>&1; and vland completion fish 2>/dev/null | source`,
    )
    .configureHelp({
      // Commander hard-wraps help at the terminal width; a wrapped rc line breaks when pasted.
      helpWidth: Number.POSITIVE_INFINITY,
    })
    .addArgument(new Argument("<shell>", `target shell`).choices(SHELLS))
    .addHelpText(
      "afterAll",
      `\nUnder the hood, this command uses ${TOOL_LABELS.USAGE} (https://usage.jdx.dev).
Make sure to have it installed and available in your PATH.`,
    );
}
