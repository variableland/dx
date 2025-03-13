import path from "node:path";
import { readPackageUp } from "read-package-up";
import { Log } from "~/logger";
import { cwd } from "~/utils/cwd";
import { Store } from "./store";

export async function createStore() {
  const d = Log.subdebug("create-store");

  d("RR_PWD %s", process.env.RR_PWD);
  d("process cwd %s", process.cwd());
  d("cwd used for creating store %s", cwd);

  const result = await readPackageUp({ cwd });

  if (!result) {
    throw new Error("Could not find app package.json");
  }

  const { packageJson: pkg, path: pkgPath } = result;

  d("pkg %O", pkg);
  d("pkgPath %s", pkgPath);

  return new Store(pkg, path.dirname(pkgPath));
}
