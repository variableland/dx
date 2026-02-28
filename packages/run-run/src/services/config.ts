import { type AsyncSearcher, lilconfig } from "lilconfig";
import type { UserConfig } from "#/types/config";
import { logger } from "./logger";

const DEFAULT_CONFIG: UserConfig = {
  future: {
    oxc: false,
  },
};

export class ConfigService {
  #searcher: AsyncSearcher;

  constructor() {
    this.#searcher = lilconfig("run-run", {
      searchPlaces: ["run-run.config.ts"],
      loaders: {
        ".ts": (filepath: string) => import(filepath).then((mod) => mod.default),
      },
    });
  }

  async load(cwd?: string) {
    const debug = logger.subdebug("load-config");

    if (cwd) {
      debug("config cwd: %s", cwd);
    } else {
      debug("config cwd not provided");
    }

    const searchResult = await this.#searcher.search(cwd);

    if (!searchResult || searchResult?.isEmpty) {
      debug("loaded default config: %O", DEFAULT_CONFIG);
      return DEFAULT_CONFIG;
    }

    const config = searchResult.config as UserConfig;

    debug("loaded config: %O", config);
    debug("config file: %s", searchResult.filepath);

    return config;
  }
}
