import { createRequire } from "node:module";
import path from "node:path";
import memoize from "memoize";
import { readPackageJSON, resolvePackageJSON } from "pkg-types";

type Options = { from: string; binName?: string };

// pkg-types covers any package whose `.` entry is in `exports` (including
// restrictive ones like oxlint). The fallback handles packages without
// `main`/`exports` at all (e.g. @biomejs/biome).
async function _resolvePackageBin(pkg: string, { from, binName }: Options): Promise<string> {
  let pkgJsonPath: string;
  try {
    pkgJsonPath = await resolvePackageJSON(pkg, { from });
  } catch {
    pkgJsonPath = createRequire(from).resolve(`${pkg}/package.json`);
  }
  const { bin } = await readPackageJSON(pkgJsonPath);
  const rel = typeof bin === "string" ? bin : bin?.[binName ?? pkg.replace(/^@[^/]+\//, "")];
  if (!rel) throw new Error(`No bin "${binName ?? pkg}" in ${pkg}`);
  return path.join(path.dirname(pkgJsonPath), rel);
}

export const resolvePackageBin = memoize(_resolvePackageBin, {
  cacheKey: ([pkg, opts]) => `${pkg}|${opts.from}|${opts.binName ?? ""}`,
});
