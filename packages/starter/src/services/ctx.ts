import fs from "node:fs";
import { type PkgService, createContextService, createPkgService } from "@variableland/clibuddy";
import { Logger } from "./logger";

export interface ContextValue {
  binPkg: PkgService;
}

export const ctx = createContextService<ContextValue>();

export async function createContextValue(): Promise<ContextValue> {
  const d = Logger.subdebug("create-context-value");

  if (!process.env.BIN_PATH) {
    throw new Error("Required BIN_PATH env var");
  }

  const binPath = fs.realpathSync(process.env.BIN_PATH);

  d("bin path %s", binPath);

  const binPkg = await createPkgService(binPath);

  if (!binPkg) {
    throw new Error("Could not find bin package.json");
  }

  d("bin pkg info %O", binPkg.info());

  return {
    binPkg,
  };
}
