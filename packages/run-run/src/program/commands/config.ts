import { palette } from "@vlandoss/clibuddy";
import { createCommand } from "commander";
import type { Context } from "#/services/ctx";

export function createConfigCommand(ctx: Context) {
  return createCommand("config")
    .summary("display the current config 🛠️")
    .description("Displays the current configuration settings, including their source file path if available.")
    .action(async function configAction() {
      const { config, meta } = ctx.config;
      console.log(palette.muted("Config:"));
      console.log(config);
      console.log(palette.muted(`Loaded from ${meta.filepath ? palette.link(meta.filepath) : "n/a"}`));
    });
}
