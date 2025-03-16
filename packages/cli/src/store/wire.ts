import fs from "node:fs";
import { Log } from "~/logger";
import { createPkgService } from "~/services/pkg";
import { cwd } from "~/utils/cwd";
import type { Store } from "./type";

export async function createStore(): Promise<Store> {
  const d = Log.subdebug("create-store");

  if (!process.env.RR_BIN_PATH) {
    throw new Error("Required RR_BIN_PATH env var");
  }

  const rrBinPath = fs.realpathSync(process.env.RR_BIN_PATH);

  d("rr bin path %s", rrBinPath);
  d("process cwd %s", process.cwd());

  if (process.env.RR_PWD) {
    d("RR_PWD %s", process.env.RR_PWD);
  }

  const [appPkg, rrPkg] = await Promise.all([
    createPkgService({ cwd }),
    createPkgService({ cwd: rrBinPath }),
  ]);

  if (!rrPkg) {
    throw new Error("Could not find run-run package.json");
  }

  if (appPkg) {
    d("app pkg info %O", appPkg.info());
  }

  d("rr pkg info %O", rrPkg.info());

  return {
    appPkg,
    rrPkg,
  };
}
