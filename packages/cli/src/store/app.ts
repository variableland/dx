import fs from "node:fs";
import path from "node:path";
import { readPackageUp } from "read-package-up";
import { Log } from "~/logger";
import { cwd } from "~/utils/cwd";
import { Store } from "./store";

export async function createStore() {
  const d = Log.subdebug("create-store");

  if (!process.env.RR_BIN_PATH) {
    throw new Error("Required RR_BIN_PATH env var");
  }

  const rrBinPath = fs.realpathSync(process.env.RR_BIN_PATH);

  d("process cwd %s", process.cwd());
  if (process.env.RR_PWD) {
    d("RR_PWD %s", process.env.RR_PWD);
  }
  d("RR_BIN_PATH %s", process.env.RR_BIN_PATH);
  d("cwd used to search app package.json %s", cwd);
  d("cwd used to search run-run package.json %s", rrBinPath);

  const [appResult, rrResult] = await Promise.all([
    await readPackageUp({ cwd }),
    await readPackageUp({ cwd: rrBinPath }),
  ]);

  if (!appResult) {
    throw new Error("Could not find app package.json");
  }

  if (!rrResult) {
    throw new Error("Could not find run-run package.json");
  }

  const { packageJson: appPkg, path: appPkgPath } = appResult;
  const { packageJson: rrPkg, path: rrPkgPath } = rrResult;

  const appPath = path.dirname(appPkgPath);
  const rrPath = path.dirname(rrPkgPath);

  d("appPkg %O", appPkg);
  d("appPath %s", appPath);
  d("rrPkg %O", rrPkg);
  d("rrPath %s", rrBinPath);

  return new Store(appPkg, appPath, rrPkg, rrPath);
}
