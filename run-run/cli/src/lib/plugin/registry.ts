import { MissingPluginError } from "#src/errors/missing-plugin.ts";
import { MultipleProvidersError } from "./errors.ts";
import type { Plugin, PluginCapability, PluginServices } from "./types.ts";

type RegistryEntry = {
  plugin: Plugin;
  services: PluginServices;
};

type Provider<K extends PluginCapability> = {
  plugin: Plugin;
  service: NonNullable<PluginServices[K]>;
};

export class PluginRegistry {
  #entries: RegistryEntry[] = [];

  register(plugin: Plugin, services: PluginServices) {
    this.#entries.push({ plugin, services });
  }

  getServiceOrThrow<K extends PluginCapability>(capability: K) {
    const provider = this.providerOf(capability);
    if (!provider) {
      throw new MissingPluginError(capability);
    }
    return provider.service;
  }

  getService<K extends PluginCapability>(capability: K) {
    const provider = this.providerOf(capability);
    return provider?.service;
  }

  getAllServices() {
    const seen = new Set<NonNullable<PluginServices[PluginCapability]>>();

    for (const { services } of this.#entries) {
      for (const service of Object.values(services)) {
        if (service) seen.add(service);
      }
    }

    return [...seen];
  }

  providersOf<K extends PluginCapability>(capability: K) {
    const providers: Array<Provider<K>> = [];

    for (const { plugin, services } of this.#entries) {
      const service = services[capability];

      if (service) {
        providers.push({
          plugin,
          service: service as NonNullable<PluginServices[K]>,
        });
      }
    }

    return providers;
  }

  providerOf<K extends PluginCapability>(capability: K) {
    const providers = this.providersOf(capability);

    const [first, ...rest] = providers;

    if (!first) {
      return undefined;
    }

    if (rest.length > 0) {
      throw new MultipleProvidersError(
        capability,
        providers.map(({ plugin }) => plugin.name),
      );
    }

    return first;
  }
}
