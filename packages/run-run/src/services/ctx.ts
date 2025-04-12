import fs from "node:fs";
import { type PkgService, createContextService, createPkgService, cwd } from "@variableland/clibuddy";
import { console } from "./console";

export type ContextValue = {
  binPkg: PkgService;
  appPkg: PkgService;
};

export const ctx = createContextService<ContextValue>();

export async function createContextValue(): Promise<ContextValue> {
  const debug = console.subdebug("create-context-value");

  if (!Bun.env.BIN_PATH) {
    throw new Error("Required BIN_PATH env var");
  }

  const binPath = fs.realpathSync(Bun.env.BIN_PATH);

  debug("bin path:", binPath);
  debug("process cwd:", process.cwd());

  const [appPkg, binPkg] = await Promise.all([createPkgService(cwd), createPkgService(binPath)]);

  if (!binPkg) {
    throw new Error("Could not find bin package.json");
  }

  if (!appPkg) {
    throw new Error("Could not find app package.json");
  }

  debug("app pkg info: %O", appPkg.info());
  debug("bin pkg info: %O", binPkg.info());

  return {
    appPkg,
    binPkg,
  };
}
