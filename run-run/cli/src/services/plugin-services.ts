import { MissingPluginError } from "#src/errors/missing-plugin.ts";
import type { PluginRegistry } from "../lib/plugin/registry.ts";
import type { PluginCapability } from "../lib/plugin/types.ts";
import { StaticCheckService } from "./static-checker.ts";

export class PluginServices {
  #registry: PluginRegistry;

  constructor(registry: PluginRegistry) {
    this.#registry = registry;
  }

  getAllServices() {
    return this.#registry.getAllServices();
  }

  providerOf<K extends PluginCapability>(capability: K) {
    return this.#registry.providerOf(capability);
  }

  getServiceOrThrow<K extends PluginCapability>(capability: K) {
    return this.#registry.getServiceOrThrow(capability);
  }

  getJsChecker() {
    const checker = this.#registry.getService("jscheck");

    if (checker) {
      return checker;
    }

    const linter = this.#registry.getService("lint");
    const formatter = this.#registry.getService("format");

    if (linter && formatter) {
      return new StaticCheckService(linter, formatter);
    }

    throw new MissingPluginError("jscheck");
  }
}
