import { join } from "node:path";
import type { NodePlopAPI } from "node-plop";
import nodePlop from "node-plop";
import { logger } from "./logger";
import type { GenerateOptions, TemplateService } from "./types";

type CreateOptions = {
  basePath: string;
  destBasePath: string;
  force: boolean;
};

export class PlopTemplateService implements TemplateService {
  #plop: NodePlopAPI;

  constructor(plop: NodePlopAPI) {
    this.#plop = plop;
  }

  async generate(options: GenerateOptions) {
    const { generatorId, bypassArr } = options;

    const debug = logger.subdebug("plop-template-service:generate");

    debug("generate options: %O", options);

    const generator = this.#plop.getGenerator(generatorId);

    const answers = await generator.runPrompts(bypassArr);

    debug("generator answers: %O", answers);

    const results = await generator.runActions(answers);

    debug("generator results: %O", results);

    if (results.failures.length > 0) {
      throw new Error("Can't generate files");
    }

    return { answers };
  }
}

const PLOP_CONFIG_PATH = join("plopfiles", "plopfile.ts");

export async function createPlopTemplateService(options: CreateOptions) {
  const { force, destBasePath } = options;

  const debug = logger.subdebug("create-plop-template-service");

  debug("options: %O", options);

  const configPath = join(options.basePath, PLOP_CONFIG_PATH);

  debug("plop config path:", configPath);

  const plop = await nodePlop(configPath, {
    force,
    destBasePath,
  });

  return new PlopTemplateService(plop);
}
