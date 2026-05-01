import os from "node:os";
import { type AsyncSearcher, lilconfig } from "lilconfig";
import type { ExportedConfig, UserConfig } from "#src/types/config.ts";
import { logger } from "./logger.ts";

const DEFAULT_CONFIG: UserConfig = {
  future: {
    oxc: false,
  },
};

export class ConfigService {
  #searcher: AsyncSearcher;

  constructor() {
    this.#searcher = lilconfig("run-run", {
      searchPlaces: ["run-run.config.ts", "run-run.config.mts"],
      cache: true,
      stopDir: os.homedir(),
      loaders: {
        ".ts": (filepath: string) => import(filepath).then((mod) => mod.default),
        ".mts": (filepath: string) => import(filepath).then((mod) => mod.default),
      },
    });
  }

  async load(): Promise<ExportedConfig> {
    const debug = logger.subdebug("load-config");

    const searchResult = await this.#searcher.search();

    if (!searchResult || searchResult?.isEmpty) {
      debug("loaded default config: %O", DEFAULT_CONFIG);
      return {
        config: DEFAULT_CONFIG,
        meta: {
          isDefault: true,
          filepath: undefined,
        },
      };
    }

    const config = searchResult.config as UserConfig;

    debug("loaded config: %O", config);
    debug("config file: %s", searchResult.filepath);

    return {
      config,
      meta: {
        isDefault: false,
        filepath: searchResult.filepath,
      },
    };
  }
}
