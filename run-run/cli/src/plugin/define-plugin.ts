import type { Plugin } from "./types.ts";

export function definePlugin<T = void>(factory: (options: T) => Plugin): (options: T) => Plugin {
  return factory;
}
