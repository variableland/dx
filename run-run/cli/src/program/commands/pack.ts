import { createCommand } from "commander";
import type { Context } from "#src/services/ctx.ts";
import { missingPluginError } from "../missing-plugin.ts";
import { pluginAnnotation } from "../ui.ts";
import { createDoctorSubcommand } from "./doctor.ts";

export function createPackCommand(ctx: Context) {
  const packer = ctx.registry.get("pack");

  const cmd = createCommand("pack")
    .summary(`pack a ts library${pluginAnnotation(packer)}`)
    .description(
      "Compiles TypeScript code into JavaScript and generates type declaration files, packaging the library for distribution.",
    );

  if (packer) {
    cmd.addCommand(createDoctorSubcommand(packer));
    cmd.addHelpText("afterAll", `\nUnder the hood, this command uses the ${packer.ui} CLI to pack the project.`);
  }

  cmd.action(async () => {
    if (!packer) throw missingPluginError("pack");
    await packer.pack();
  });

  return cmd;
}
