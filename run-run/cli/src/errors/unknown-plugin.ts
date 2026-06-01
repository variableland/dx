import { allPluginNames } from "#src/lib/plugin/directory.ts";

export class UnknownPluginError extends Error {
  constructor(name: string) {
    super(`'${name}' is invalid for argument 'name'. Allowed choices are ${allPluginNames().join(", ")}.`);
  }
}
