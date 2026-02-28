import { colors } from "@vlandoss/clibuddy";
import { createCommand } from "commander";
import type { Context } from "#/services/ctx";

export function createConfigCommand(ctx: Context) {
  return createCommand("config")
    .alias("cfg")
    .description("display the current config 🛠️")
    .action(async function configAction() {
      const { config, meta } = ctx.config;
      console.log(colors.muted("Config:"));
      console.log(config);
      console.log(colors.muted(`Loaded from ${meta.filepath ? colors.link(meta.filepath) : "n/a"}`));
    });
}
