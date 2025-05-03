import fs from "node:fs";
import { type PkgService, type ShellService, createPkgService, createShellService, cwd } from "@vlandoss/clibuddy";
import { logger } from "./logger";

export type Context = {
  binPkg: PkgService;
  appPkg: PkgService;
  shell: ShellService;
};

export async function createContext(binDir: string): Promise<Context> {
  const debug = logger.subdebug("create-context-value");

  const binPath = fs.realpathSync(binDir);

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

  const shell = createShellService({
    localBaseBinPath: [binDir],
    stdio: "inherit",
  });

  return {
    appPkg,
    binPkg,
    shell,
  };
}
