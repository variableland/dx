import { palette } from "@vlandoss/clibuddy";
import { createCommand } from "commander";
import type { Context } from "#/services/ctx";

export function createConfigCommand(ctx: Context) {
  return createCommand("config")
    .alias("cfg")
    .description("display the current config 🛠️")
    .action(async function configAction() {
      const { config, meta } = ctx.config;
      console.log(palette.muted("Config:"));
      console.log(config);
      console.log(palette.muted(`Loaded from ${meta.filepath ? palette.link(meta.filepath) : "n/a"}`));
    });
}
