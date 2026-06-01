import fs from "node:fs";
import { createPkg, createShellService, cwd, type Pkg, type ShellService } from "@vlandoss/clibuddy";
import { PluginApiVersionError } from "#src/errors/plugin-api-version.ts";
import { PluginRegistry } from "#src/lib/plugin/registry.ts";
import type { PluginContext } from "#src/lib/plugin/types.ts";
import type { ExportedConfig } from "#src/types/config.ts";
import { ConfigService } from "./config.ts";
import { logger } from "./logger.ts";
import { PluginServices } from "./plugin-services.ts";

export type ContextValue = {
  binPkg: Pkg;
  appPkg: Pkg;
  shell: ShellService;
  config: ExportedConfig;
  plugins: PluginServices;
};

export class ContextService {
  #binDir: string;

  constructor(binDir: string) {
    this.#binDir = binDir;
  }

  async getContext(): Promise<ContextValue> {
    const debug = logger.subdebug("create-context");

    const binPath = fs.realpathSync(this.#binDir);

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
      const got = plugin.apiVersion as number;
      if (got !== 1) {
        throw new PluginApiVersionError(plugin.name, got);
      }
      debug("registering plugin: %s", plugin.name);
      const services = await plugin.services(pluginContext);
      registry.register(plugin, services);
    }

    const plugins = new PluginServices(registry);

    return {
      appPkg,
      binPkg,
      shell,
      config,
      plugins,
    };
  }
}
