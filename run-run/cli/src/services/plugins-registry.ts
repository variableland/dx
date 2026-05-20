/**
 * Map from short aliases the user types (`rr plugins add ts`) to the
 * full npm package name and the canonical local binding the plugin file
 * is imported as inside `run-run.config.{ts,mts}`.
 *
 * Third-party plugins use their full package name; the binding is derived
 * by stripping a `@scope/plugin-` (or `@scope/run-run-plugin-`) prefix.
 */
export const OFFICIAL_PLUGINS = {
  ts: { pkg: "@rrlab/plugin-ts", exportName: "ts" },
  eslint: { pkg: "@rrlab/plugin-eslint", exportName: "eslint" },
  biome: { pkg: "@rrlab/plugin-biome", exportName: "biome" },
  oxc: { pkg: "@rrlab/plugin-oxc", exportName: "oxc" },
  tsdown: { pkg: "@rrlab/plugin-tsdown", exportName: "tsdown" },
} as const;

export type OfficialAlias = keyof typeof OFFICIAL_PLUGINS;

export function officialAliases(): readonly OfficialAlias[] {
  return Object.keys(OFFICIAL_PLUGINS) as OfficialAlias[];
}
