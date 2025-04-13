import fs from "node:fs";
import { type PkgService, type ShellService, createPkgService, createShellService } from "@variableland/clibuddy";
import { ConfigService } from "./config";
import { console } from "./console";

export type ContextValue = {
  binPkg: PkgService;
  config: ConfigService;
  shell: ShellService;
};

export async function createContext(binDir: string): Promise<ContextValue> {
  const debug = console.subdebug("create-context-value");

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
