import { Argument } from "commander";
import { addPluginAction } from "#src/actions/plugins/add.ts";
import { listPluginsAction } from "#src/actions/plugins/list.ts";
import { removePluginAction } from "#src/actions/plugins/remove.ts";
import type { AddOptions, RemoveOptions } from "#src/actions/plugins/shared.ts";
import { allPluginNames, type PluginName } from "#src/lib/plugin/directory.ts";
import type { ContextValue } from "#src/services/context.ts";
import { runRunColor } from "#src/ui/theme.ts";
import { createCommand } from "../base.ts";

export function createPluginsCommand(ctx: ContextValue) {
  const cmd = createCommand("plugins").description(`manage ${runRunColor("@rrlab")} plugins`);

  cmd
    .command("list")
    .description("list plugins configured in run-run.config.{ts,mts}")
    .action(() => listPluginsAction({ ctx }));

  cmd
    .command("add")
    .description("install and configure an @rrlab plugin")
    .addArgument(
      new Argument("<name>", `plugin alias (${allPluginNames().join("|")}), optionally with @<spec> e.g. biome@pr-226`),
    )
    .option("--force", "re-run install even if the plugin is already configured")
    .option("--yes", "skip prompts and use defaults (non-interactive)")
    .option("--dry-run", "show what would happen, without applying changes")
    .action((name: PluginName, options: AddOptions) => addPluginAction({ ctx, args: { name }, options }));

  cmd
    .command("remove")
    .description("uninstall an @rrlab plugin and undo its config files + deps")
    .addArgument(new Argument("<name>", "plugin alias to remove").choices(allPluginNames()))
    .option("--yes", "skip the confirmation prompt")
    .option("--dry-run", "print the plan without applying changes")
    .action((name: PluginName, options: RemoveOptions) => removePluginAction({ ctx, args: { name }, options }));

  return cmd;
}
