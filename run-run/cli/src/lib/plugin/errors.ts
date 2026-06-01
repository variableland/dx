/**
 * Thrown by `PluginRegistry.get` when more than one plugin provides the same
 * capability. The message is load-bearing for the "ambiguity → user narrows
 * config" UX (decision 003) — `registry.test.ts` asserts the plugin names appear.
 */
export class MultipleProvidersError extends Error {
  constructor(kind: string, pluginNames: readonly string[]) {
    const names = pluginNames.join(", ");
    const example = pluginNames.map((name) => `${name}({ only: ['${kind}'] })`).join(" or ");
    super(
      `Multiple plugins provide capability '${kind}': ${names}. ` +
        `Narrow each plugin's capabilities in run-run.config.ts using the 'only' option — e.g. ${example}.`,
    );
  }
}
