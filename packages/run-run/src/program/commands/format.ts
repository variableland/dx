import { createCommand } from "commander";
import { BiomeService } from "#/services/biome";
import type { Context } from "#/services/ctx";
import { OxfmtService } from "#/services/oxfmt";

type ActionOptions = {
  check?: boolean;
  fix?: boolean;
};

export function createFormatCommand(ctx: Context) {
  const fmtCommand = createCommand("fmt")
    .alias("format")
    .description("format the code 🎨")
    .option("-c, --check", "check if the code is formatted", true)
    .option("-f, --fix", "format all the code");

  if (ctx.config.future?.oxc) {
    fmtCommand
      .action(async function formatAction(options: ActionOptions) {
        const { $ } = new OxfmtService(ctx.shell);
        const toolCmd = "oxfmt --no-error-on-unmatched-pattern";

        if (options.fix) {
          await $`${toolCmd} --fix`;
          return;
        }

        if (options.check) {
          await $`${toolCmd} --check`;
        }
      })
      .addHelpText("afterAll", "\nUnder the hood, this command uses the oxfmt CLI to format the code.");
  } else {
    fmtCommand
      .action(async function formatAction(options: ActionOptions) {
        const { $ } = new BiomeService(ctx.shell);
        const toolCmd = "biome format --no-errors-on-unmatched --colors=force";

        if (options.fix) {
          await $`${toolCmd} --fix`;
          return;
        }

        if (options.check) {
          await $`${toolCmd}`;
        }
      })
      .addHelpText("afterAll", "\nUnder the hood, this command uses the biome CLI to format the code.");
  }

  return fmtCommand;
}
