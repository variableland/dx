import fs from "node:fs";
import { createPkg, createShellService, type Pkg, type ShellService } from "@vlandoss/clibuddy";
import { logger } from "./logger.ts";

export type Context = {
  binPkg: Pkg;
  shell: ShellService;
};

export async function createContext(binDir: string): Promise<Context> {
  const debug = logger.subdebug("create-context");

  const binPath = fs.realpathSync(binDir);

  debug("bin path:", binPath);

  const binPkg = await createPkg(binPath);

  if (!binPkg) {
    throw new Error("Could not find bin package.json");
  }

  debug("bin pkg info: %O", binPkg.info());

  const shell = createShellService();

  debug("shell service options: %O", shell.options);

  return { binPkg, shell };
}
