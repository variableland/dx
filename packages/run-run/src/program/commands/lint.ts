import { createCommand } from "commander";
import { BiomeService } from "#/services/biome";
import type { Context } from "#/services/ctx";
import { OxlintService } from "#/services/oxlint";

type ActionOptions = {
  check?: boolean;
  fix?: boolean;
};

export function createLintCommand(ctx: Context) {
  const lintCommand = createCommand("lint")
    .description("lint the code 🧹")
    .option("-c, --check", "check if the code is valid", true)
    .option("-f, --fix", "try to fix all the code");

  if (ctx.config.future?.oxc) {
    lintCommand
      .action(async function lintAction(options: ActionOptions) {
        const { $ } = new OxlintService(ctx.shell);
        const toolCmd = "oxlint --report-unused-disable-directives";

        if (options.fix) {
          await $`${toolCmd} --fix`;
          return;
        }

        if (options.check) {
          await $`${toolCmd} --check`;
        }
      })
      .addHelpText("afterAll", "\nUnder the hood, this command uses the oxlint CLI to lint the code.");
  } else {
    lintCommand
      .action(async function lintAction(options: ActionOptions) {
        const { $ } = new BiomeService(ctx.shell);
        const toolCmd = "biome check --colors=force --formatter-enabled=false";

        if (options.fix) {
          await $`${toolCmd} --fix --unsafe`;
          return;
        }

        if (options.check) {
          await $`${toolCmd}`;
        }
      })
      .addHelpText("afterAll", "\nUnder the hood, this command uses the biome CLI to lint the code.");
  }

  return lintCommand;
}
