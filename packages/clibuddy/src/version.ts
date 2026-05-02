import type { PkgService } from "./services/index.ts";

export function getVersion(pkg: PkgService) {
  return process.env.VERSION || pkg.packageJson.version;
}
