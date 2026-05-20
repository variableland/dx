import { generateToStdout } from "@usage-spec/commander";
import { palette } from "@vlandoss/clibuddy";
import { type Command, createCommand, Option } from "commander";
import { createContext } from "#src/services/ctx.ts";
import { createCheckCommand } from "./commands/check.ts";
import { createCleanCommand } from "./commands/clean.ts";
import { createCompletionCommand } from "./commands/completion.ts";
import { createConfigCommand } from "./commands/config.ts";
import { createDoctorCommand } from "./commands/doctor.ts";
import { createFormatCommand } from "./commands/format.ts";
import { createJsCheckCommand } from "./commands/jscheck.ts";
import { createLintCommand } from "./commands/lint.ts";
import { createPackCommand } from "./commands/pack.ts";
import { createPluginsCommand } from "./commands/plugins.ts";
import { createTsCheckCommand } from "./commands/tscheck.ts";
import { CREDITS_TEXT, getBannerText } from "./ui.ts";

export type Options = {
  binDir: string;
};

export async function createProgram(options: Options) {
  const ctx = await createContext(options.binDir);
  const version = ctx.binPkg.version;

  const program = createCommand("rr")
    .usage("<command...> [options...]")
    .enablePositionalOptions()
    .version(version, "-v, --version")
    .addOption(new Option("--usage", `print KDL spec for this CLI (${palette.muted(palette.link("https://kdl.dev"))})`))
    .on("option:usage", function onUsage(this: Command) {
      generateToStdout(this);
      process.exit(0);
    })
    .addHelpText("before", getBannerText(version))
    .addHelpText("after", CREDITS_TEXT)
    .addCommand(createCompletionCommand())
    .addCommand(createPackCommand(ctx))
    .addCommand(createJsCheckCommand(ctx))
    .addCommand(createTsCheckCommand(ctx))
    .addCommand(createLintCommand(ctx))
    .addCommand(createFormatCommand(ctx))
    .addCommand(createCheckCommand())
    .addCommand(createDoctorCommand(ctx))
    .addCommand(createPluginsCommand(ctx))
    .addCommand(createCleanCommand())
    .addCommand(createConfigCommand(ctx));

  return { program, ctx };
}
