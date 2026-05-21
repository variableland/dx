/**
 * Map from short aliases the user types (`rr plugins add ts`) to the
 * full npm package name and the canonical local binding the plugin file
 * is imported as inside `run-run.config.{ts,mts}`.
 *
 * Third-party plugins use their full package name; the binding is derived
 * by stripping a `@scope/<tool>-plugin` (or `@scope/<tool>-run-run-plugin`)
 * suffix and using the tool segment.
 */
export const OFFICIAL_PLUGINS = {
  ts: { pkg: "@rrlab/ts-plugin", exportName: "ts" },
  eslint: { pkg: "@rrlab/eslint-plugin", exportName: "eslint" },
  biome: { pkg: "@rrlab/biome-plugin", exportName: "biome" },
  oxc: { pkg: "@rrlab/oxc-plugin", exportName: "oxc" },
  tsdown: { pkg: "@rrlab/tsdown-plugin", exportName: "tsdown" },
} as const;

export type OfficialAlias = keyof typeof OFFICIAL_PLUGINS;

export function officialAliases(): readonly OfficialAlias[] {
  return Object.keys(OFFICIAL_PLUGINS) as OfficialAlias[];
}
