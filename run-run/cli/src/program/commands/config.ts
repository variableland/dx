import { configAction } from "#src/actions/config.ts";
import type { ContextValue } from "#src/services/context.ts";
import { createCommand } from "../base.ts";

export function createConfigCommand(ctx: ContextValue) {
  return createCommand("config")
    .summary("display the current config")
    .description("Displays the current configuration settings, including their source file path and the plugins it registers.")
    .action(() => configAction({ ctx }));
}
