import { providersOf } from "#src/lib/plugin/directory.ts";
import type { PluginCapability } from "../lib/plugin/index.ts";

export class MissingPluginError extends Error {
  constructor(capability: PluginCapability) {
    const plugins = providersOf(capability);

    const pkgList = plugins.map((it) => it.pkg).join(", ");
    const addList = plugins.map((it) => `rr plugins add ${it.name}`).join(" | ");

    super(
      `No plugin provides the '${capability}' capability.` +
        (pkgList ? `\n  Install one of: ${pkgList}.` : "") +
        (addList ? `\n  Try: ${addList}.` : ""),
    );
  }
}
