import fs from "node:fs";
import { createPkg, createShellService, cwd, type Pkg, type ShellService } from "@vlandoss/clibuddy";
import { PluginRegistry } from "#src/plugin/registry.ts";
import type { PluginContext } from "#src/plugin/types.ts";
import type { ExportedConfig } from "#src/types/config.ts";
import { ConfigService } from "./config.ts";
import { logger } from "./logger.ts";

export type Context = {
  binPkg: Pkg;
  appPkg: Pkg;
  shell: ShellService;
  config: ExportedConfig;
  registry: PluginRegistry;
};

export async function createContext(binDir: string): Promise<Context> {
  const debug = logger.subdebug("create-context");

  const binPath = fs.realpathSync(binDir);

  debug("bin path:", binPath);
  debug("process cwd:", process.cwd());

  const [appPkg, binPkg] = await Promise.all([createPkg(cwd), createPkg(binPath)]);

  if (!binPkg) {
    throw new Error("Could not find bin package.json");
  }

  if (!appPkg) {
    throw new Error("Could not find app package.json");
  }

  debug("app pkg info: %O", appPkg.info());
  debug("bin pkg info: %O", binPkg.info());

  const shell = createShellService();

  debug("shell service options: %O", shell.options);

  const configService = new ConfigService();
  const config = await configService.load();

  const registry = new PluginRegistry();
  const pluginContext: PluginContext = {
    shell,
    logger,
    appPkg,
    binPkg,
    cwd,
  };

  for (const plugin of config.config.plugins ?? []) {
    if (plugin.apiVersion !== 1) {
      throw new Error(
        `Plugin '${plugin.name}' targets apiVersion ${plugin.apiVersion}, but this kernel supports only apiVersion 1.`,
      );
    }
    debug("registering plugin: %s", plugin.name);
    const capabilities = await plugin.setup(pluginContext);
    registry.register(plugin, capabilities);
  }

  return {
    appPkg,
    binPkg,
    shell,
    config,
    registry,
  };
}
