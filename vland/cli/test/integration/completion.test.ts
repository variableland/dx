import { describe, expect, test } from "vitest";
import { createTestCli } from "#test/helpers.ts";

const cli = createTestCli();

// `vland completion <shell>` is served by the bin dispatcher through `usage`; only
// `--help` and unsupported shells fall through to Commander.
describe("vland completion", () => {
  // The rc lines must stay silent where `vland` is only a mise shim with no active version.
  test("--help prints guarded rc lines that discard stderr", () => {
    const r = cli("completion --help");
    expect(r.status).toBe(0);
    expect(r.stdout).toMatchInlineSnapshot(`
      "Usage: vland completion [options] <shell>

      Prints a shell completion script for vland. Add your shell's line to its rc file:

          # bash — ~/.bashrc
          command -v vland >/dev/null 2>&1 && eval "$(vland completion bash 2>/dev/null)"

          # zsh — ~/.zshrc
          command -v vland >/dev/null 2>&1 && eval "$(vland completion zsh 2>/dev/null)"

          # fish — ~/.config/fish/config.fish
          command -v vland >/dev/null 2>&1; and vland completion fish 2>/dev/null | source

      Arguments:
        shell       target shell (choices: "bash", "zsh", "fish")

      Options:
        -h, --help  display help for command

      Under the hood, this command uses usage (https://usage.jdx.dev).
      Make sure to have it installed and available in your PATH.
      "
    `);
  });

  test("an unsupported shell errors with the allowed choices", () => {
    const r = cli("completion powershell");
    expect(r.status).not.toBe(0);
    expect(r.stderr).toContain("Allowed choices are bash, zsh, fish.");
  });
});
