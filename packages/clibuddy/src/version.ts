import type { PkgService } from "./services";

export function getVersion(pkg: PkgService) {
  return process.env.VERSION || pkg.packageJson.version;
}
