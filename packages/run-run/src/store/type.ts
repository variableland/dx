import type { PkgService } from "~/services/pkg";

export interface Store {
  rrPkg: PkgService;
  appPkg: PkgService | null;
}
