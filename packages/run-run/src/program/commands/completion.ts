import { Argument, createCommand } from "commander";
import { TOOL_LABELS } from "../ui.ts";

const SHELLS = ["bash", "zsh", "fish"] as const;

// Ghost command: registered with Commander purely for discoverability — it surfaces
// in `rr --help` and is baked into dist/cli.usage.kdl so the completion itself can
// suggest "completion" after `rr <TAB>`. The actual handler lives in the bash bin
// dispatcher, which intercepts `rr completion <shell>` before reaching Node.
export function createCompletionCommand() {
  return createCommand("completion")
    .summary(`print shell completion script 🐚 (${TOOL_LABELS.USAGE})`)
    .description(
      `Prints a shell completion script for rr. Add to your shell rc file:

  bash: eval "$(rr completion bash)"
  zsh:  eval "$(rr completion zsh)"
  fish: rr completion fish | source`,
    )
    .addArgument(new Argument("<shell>", `target shell`).choices(SHELLS))
    .addHelpText(
      "afterAll",
      `\nUnder the hood, this command uses ${TOOL_LABELS.USAGE} (https://usage.jdx.dev).
Make sure to have it installed and available in your PATH.`,
    );
}
