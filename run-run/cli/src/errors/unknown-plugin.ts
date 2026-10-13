import { allPluginNames } from "#src/lib/plugin/directory.ts";
import { KnownError } from "./known-error.ts";

export class UnknownPluginError extends KnownError {
  constructor(name: string) {
    super(`'${name}' is invalid for argument 'name'. Allowed choices are ${allPluginNames().join(", ")}.`);
  }
}
