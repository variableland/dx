import type { PkgService } from "./services";

export function getVersion(pkg: PkgService) {
  return Bun.env.VERSION || pkg.packageJson.version;
}
