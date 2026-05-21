import type { Plugin, PluginCapabilities, PluginKind } from "./types.ts";

type Entry = {
  plugin: Plugin;
  capabilities: PluginCapabilities;
};

export class PluginRegistry {
  #entries: Entry[] = [];

  register(plugin: Plugin, capabilities: PluginCapabilities): void {
    this.#entries.push({ plugin, capabilities });
  }

  get<K extends PluginKind>(kind: K): NonNullable<PluginCapabilities[K]> | undefined {
    const providers = this.#providersOf(kind);
    const [first, ...rest] = providers;
    if (!first) return undefined;
    if (rest.length > 0) {
      const names = providers.map(({ plugin }) => plugin.name).join(", ");
      const example = providers.map(({ plugin }) => `${plugin.name}({ only: ['${kind}'] })`).join(" or ");
      throw new Error(
        `Multiple plugins provide capability '${kind}': ${names}. ` +
          `Narrow each plugin's capabilities in run-run.config.ts using the 'only' option — e.g. ${example}.`,
      );
    }
    return first.impl;
  }

  providersOf<K extends PluginKind>(kind: K): Array<{ name: string; impl: NonNullable<PluginCapabilities[K]> }> {
    return this.#providersOf(kind).map(({ plugin, impl }) => ({ name: plugin.name, impl }));
  }

  plugins(): readonly Plugin[] {
    return this.#entries.map(({ plugin }) => plugin);
  }

  #providersOf<K extends PluginKind>(kind: K): Array<{ plugin: Plugin; impl: NonNullable<PluginCapabilities[K]> }> {
    const out: Array<{ plugin: Plugin; impl: NonNullable<PluginCapabilities[K]> }> = [];
    for (const { plugin, capabilities } of this.#entries) {
      const impl = capabilities[kind];
      if (impl != null) {
        out.push({ plugin, impl: impl as NonNullable<PluginCapabilities[K]> });
      }
    }
    return out;
  }
}
