import { Command } from "commander";
import { Lines } from "#src/render/lines.ts";
import type { ContextValue } from "#src/services/context.ts";
import type { PluginCapability } from "../lib/plugin/index.ts";

class Cmd extends Command {
  capabilities: PluginCapability[] = [];

  addCapabilities(capabilities: PluginCapability[]) {
    this.capabilities = capabilities;
    return this;
  }

  addHelpTextAfter(ctx: ContextValue) {
    super.addHelpText("after", () => {
      const seeAlso = new Set<string>();

      this.parent?.commands?.forEach((cmd) => {
        if (cmd instanceof Cmd) {
          const sameWork = cmd.capabilities.some((it) => this.capabilities.includes(it));
          if (sameWork && cmd.name() !== this.name()) {
            seeAlso.add(cmd.name());
          }
        }
      });

      const poweredBy = new Set<string>();

      this.capabilities.forEach((it) => {
        const provider = ctx.plugins.providerOf(it);

        if (provider) {
          poweredBy.add(provider.plugin.ui);
        }
      });

      const lines = new Lines();

      if (seeAlso.size > 0) {
        lines.add("See also:").add(
          [...seeAlso].map((it) => `- ${it}`),
          2,
        );
      }

      if (seeAlso.size > 0 && poweredBy.size > 0) {
        lines.newline();
      }

      if (poweredBy.size > 0) {
        lines.add("Powered by:").add(
          [...poweredBy].map((it) => `- ${it}`),
          2,
        );
      }

      if (lines.isEmpty()) {
        return "";
      }

      return lines.newline(true).render();
    });

    return this;
  }

  addDoctorCommand(actionFn: () => Promise<void>) {
    const cmd = new Command("doctor").summary("check if the underlying tool is working correctly").action(actionFn);
    return this.addCommand(cmd);
  }
}

export function createCommand(name: string) {
  return new Cmd(name);
}
