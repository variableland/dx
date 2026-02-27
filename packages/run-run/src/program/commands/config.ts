import { createCommand } from "commander";
import type { Context } from "#/services/ctx";

export function createConfigCommand(ctx: Context) {
  return createCommand("config")
    .alias("cfg")
    .description("display the current config 🛠️")
    .action(function configAction() {
      console.log(ctx.config);
    });
}
