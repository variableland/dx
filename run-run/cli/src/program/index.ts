import path from "node:path";
import { dirnameOf } from "@vlandoss/clibuddy";
import { ContextService } from "#src/services/context.ts";
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
import { createTestCommand } from "./commands/test.ts";
import { createTsCheckCommand } from "./commands/tscheck.ts";
import { RunRunCmd } from "./root.ts";

export async function createProgram(meta: ImportMeta) {
  const binDir = path.dirname(dirnameOf(meta));

  const ctxService = new ContextService(binDir);
  const ctx = await ctxService.getContext();

  const cmd = new RunRunCmd(ctx);

  cmd
    .commandsGroup("Code quality:")
    .addCommand(createCheckCommand(ctx))
    .addCommand(createJsCheckCommand(ctx))
    .addCommand(createTsCheckCommand(ctx))
    .addCommand(createLintCommand(ctx))
    .addCommand(createFormatCommand(ctx))
    .commandsGroup("Testing:")
    .addCommand(createTestCommand(ctx))
    .commandsGroup("Build:")
    .addCommand(createPackCommand(ctx))
    .commandsGroup("Maintenance:")
    .addCommand(createCleanCommand())
    .addCommand(createDoctorCommand(ctx))
    .commandsGroup("Meta:")
    .addCommand(createCompletionCommand())
    .addCommand(createPluginsCommand(ctx))
    .addCommand(createConfigCommand(ctx));

  return cmd;
}
