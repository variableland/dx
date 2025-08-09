import fs from "node:fs";
import { createPkgService, createShellService, type PkgService, type ShellService } from "@vlandoss/clibuddy";
import { ConfigService } from "./config";
import { logger } from "./logger";

export type ContextValue = {
  binPkg: PkgService;
  config: ConfigService;
  shell: ShellService;
};

export async function createContext(binDir: string): Promise<ContextValue> {
  const debug = logger.subdebug("create-context-value");

  const binPath = fs.realpathSync(binDir);

  debug("bin path %s", binPath);

  const binPkg = await createPkgService(binPath);

  if (!binPkg) {
    throw new Error("Could not find bin package.json");
  }

  debug("bin pkg info %O", binPkg.info());

  const config = new ConfigService(binDir);

  const shell = createShellService({
    localBaseBinPath: [binDir],
  });

  return {
    binPkg,
    config,
    shell,
  };
}
