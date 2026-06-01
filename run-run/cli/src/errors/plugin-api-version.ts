/** Thrown when a configured plugin targets an apiVersion the kernel doesn't support. */
export class PluginApiVersionError extends Error {
  constructor(pluginName: string, got: number) {
    super(`Plugin '${pluginName}' targets apiVersion ${got}, but this kernel supports only apiVersion 1.`);
  }
}
