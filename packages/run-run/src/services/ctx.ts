import fs from "node:fs";
import {
  type PkgService,
  createContextService,
  createPkgService,
  cwd,
} from "@variableland/clibuddy";
import { Logger } from "./logger";

export type ContextValue = {
  binPkg: PkgService;
  appPkg: PkgService;
};

export const ctx = createContextService<ContextValue>();

export async function createContextValue(): Promise<ContextValue> {
  const d = Logger.subdebug("create-context-value");

  if (!process.env.BIN_PATH) {
    throw new Error("Required BIN_PATH env var");
  }

  const binPath = fs.realpathSync(process.env.BIN_PATH);

  d("bin path:", binPath);
  d("process cwd:", process.cwd());

  if (process.env.PWD) {
    d("env.PWD:", process.env.PWD);
  }

  const [appPkg, binPkg] = await Promise.all([createPkgService(cwd), createPkgService(binPath)]);

  if (!binPkg) {
    throw new Error("Could not find bin package.json");
  }

  if (!appPkg) {
    throw new Error("Could not find app package.json");
  }

  d("app pkg info: %O", appPkg.info());
  d("bin pkg info: %O", binPkg.info());

  return {
    appPkg,
    binPkg,
  };
}
