import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

const require = createRequire(import.meta.url);

export type PluginMeta = {
  /** Plugin npm package name, e.g. `@rrlab/biome-plugin`. */
  pkgName: string;
  /** Plugin npm package version, e.g. `1.1.0`. `undefined` when not resolvable. */
  pluginVersion?: string;
};

/** Resolves the installed version of a plugin's npm package from the host's `node_modules`. */
export function readPluginMeta(pkgName: string, fromDir: string): PluginMeta {
  const result: PluginMeta = { pkgName };
  const manifest = readPackageJson(pkgName, fromDir);
  if (!manifest) return result;

  result.pluginVersion = typeof manifest.version === "string" ? manifest.version : undefined;
  return result;
}

type Manifest = {
  version?: string;
};

function readPackageJson(pkgName: string, fromDir: string): Manifest | undefined {
  try {
    const resolved = require.resolve(`${pkgName}/package.json`, { paths: [fromDir] });
    return JSON.parse(fs.readFileSync(resolved, "utf8")) as Manifest;
  } catch {
    // Some packages don't export `./package.json`. Fall back to walking up from
    // the main entry.
    try {
      const entry = require.resolve(pkgName, { paths: [fromDir] });
      const found = findPackageJsonUpwards(entry, pkgName);
      return found ? (JSON.parse(fs.readFileSync(found, "utf8")) as Manifest) : undefined;
    } catch {
      return undefined;
    }
  }
}

function findPackageJsonUpwards(file: string, pkgName: string): string | undefined {
  let dir = path.dirname(file);
  // Walk up until we find a package.json whose `name` matches `pkgName`.
  for (let i = 0; i < 12; i += 1) {
    const candidate = path.join(dir, "package.json");
    if (fs.existsSync(candidate)) {
      try {
        const manifest = JSON.parse(fs.readFileSync(candidate, "utf8")) as { name?: string };
        if (manifest.name === pkgName) return candidate;
      } catch {
        // ignore malformed package.json and keep walking
      }
    }
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return undefined;
}
