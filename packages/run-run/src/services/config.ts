import { loadConfig } from "c12";
import type { UserConfig } from "#/types/config";
import { logger } from "./logger";

const DEFAULT_CONFIG: UserConfig = {
  future: {
    oxc: false,
  },
};

export class ConfigService {
  async load(cwd?: string) {
    const debug = logger.subdebug("load-config");

    const result = await loadConfig<UserConfig>({
      cwd,
      name: "run-run",
      defaultConfig: DEFAULT_CONFIG,
    });

    debug("loaded config: %O", result.config);
    debug("config cwd: %s", result.cwd);
    debug("config file: %s", result.configFile);

    return result.config;
  }
}
