import path from "node:path";
import { palette } from "@vlandoss/clibuddy";
import { allPluginNames, isPluginName, PLUGINS_DIRECTORY } from "#src/lib/plugin/directory.ts";
import type { ContextValue } from "#src/services/context.ts";
import { readPluginMeta } from "#src/services/plugin-meta.ts";
import type { Plugin } from "../lib/plugin/index.ts";

/**
 * The single source of truth for how a plugin renders across the UI. The two
 * plugin screens (the root help footer and `rr config`) stay separate
 * composing functions, but every painted plugin cell comes from here — so a
 * color/dot/version-format change happens in one place.
 */

/** Path of `abs` relative to the host project root, or `abs` itself when already there. */
export function relPath(ctx: ContextValue, abs: string): string {
  const rel = path.relative(ctx.appPkg.dirPath, abs);
  return rel === "" ? abs : rel;
}

/** The plugin names present in the host's `run-run.config`, in config-file order. */
export function configuredPlugins(ctx: ContextValue) {
  return ctx.config.config.plugins ?? [];
}

/**
 * Partition every plugin name into installed (configured) vs available (not yet
 * configured), preserving `PLUGINS_DIRECTORY` declaration order — the order the
 * root footer renders both rows in.
 */
export function partitionPlugins(ctx: ContextValue): { installed: Plugin[]; available: string[] } {
  const configured = configuredPlugins(ctx);

  const present = Object.fromEntries(configured.map((it) => [it.name, true]));

  const available = allPluginNames().filter((name) => !present[name]);

  return {
    available,
    installed: configured,
  };
}

/** `● <name>` — a configured plugin in the root footer. */
export function installedCell(plugin: Plugin): string {
  return `${plugin.color("●")} ${plugin.name}`;
}

/** `○ <name>` (dim) — an available-but-unconfigured plugin in the root footer. */
export function availableCell(label: string): string {
  return `${palette.dim("○")} ${palette.dim(label)}`;
}

/** The npm package for a (kernel-trusted) plugin name — official lookup, else the `@rrlab/<name>-plugin` convention. */
function pkgOf(name: string): string {
  return isPluginName(name) ? PLUGINS_DIRECTORY[name].pkg : `@rrlab/${name}-plugin`;
}

/** The plugin's npm package name (dim) — `rr config` table column. */
export function pkgCell(name: string): string {
  return palette.dim(pkgOf(name));
}

/** `v<plugin-version>` or `v?` — `rr config` table column. */
export function pluginVersionCell(name: string, appDir: string): string {
  const { pluginVersion } = readPluginMeta(pkgOf(name), appDir);
  return pluginVersion ? palette.success(`v${pluginVersion}`) : palette.dim("v?");
}
