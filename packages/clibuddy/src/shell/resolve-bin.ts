import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

export function resolveBinPath(pkg: string, options: { from: string; binPath?: string; binName?: string }): string {
  const require = createRequire(options.from);
  const pkgRoot = findPackageRoot(require, pkg);

  if (options.binPath) {
    return path.join(pkgRoot, options.binPath);
  }

  const pkgJson = JSON.parse(fs.readFileSync(path.join(pkgRoot, "package.json"), "utf8")) as {
    bin?: string | Record<string, string>;
  };
  const bin = pkgJson.bin;
  if (!bin) throw new Error(`Package ${pkg} has no "bin" field`);

  if (typeof bin === "string") return path.join(pkgRoot, bin);

  const wantName = options.binName ?? pkg.replace(/^@[^/]+\//, "");
  const rel = bin[wantName] ?? Object.values(bin)[0];
  if (!rel) throw new Error(`No bin entry found for ${pkg} (asked for ${wantName})`);
  return path.join(pkgRoot, rel);
}

// Two-step lookup tolerates packages that don't expose `./package.json` in
// their `exports` map (e.g. oxlint) and packages with no `main`/`exports` at
// all (e.g. @biomejs/biome) — `require.resolve(pkg)` fails for the latter.
function findPackageRoot(require: NodeJS.Require, pkg: string): string {
  try {
    return path.dirname(require.resolve(`${pkg}/package.json`));
  } catch {
    // fall through to manual walk
  }

  const mainPath = require.resolve(pkg);
  let dir = path.dirname(mainPath);
  const fsRoot = path.parse(dir).root;
  while (dir !== fsRoot) {
    const pkgJsonPath = path.join(dir, "package.json");
    if (fs.existsSync(pkgJsonPath)) {
      try {
        const data = JSON.parse(fs.readFileSync(pkgJsonPath, "utf8")) as { name?: string };
        if (data.name === pkg) return dir;
      } catch {
        // not a valid package.json — keep walking
      }
    }
    dir = path.dirname(dir);
  }
  throw new Error(`Could not find package root for ${pkg} from ${mainPath}`);
}
