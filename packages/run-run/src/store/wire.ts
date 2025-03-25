import fs from "node:fs";
import { Log } from "@variableland/console";
import { createPkgService } from "../services/pkg";
import { cwd } from "../utils/cwd";
import type { Store } from "./type";

export async function createStore(): Promise<Store> {
  const d = Log.subdebug("create-store");

  if (!process.env.BIN_PATH) {
    throw new Error("Required BIN_PATH env var");
  }

  const binPath = fs.realpathSync(process.env.BIN_PATH);

  d("bin path %s", binPath);
  d("process cwd %s", process.cwd());

  if (process.env.RR_PWD) {
    d("RR_PWD %s", process.env.RR_PWD);
  }

  const [appPkg, rrPkg] = await Promise.all([
    createPkgService({ cwd }),
    createPkgService({ cwd: binPath }),
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
