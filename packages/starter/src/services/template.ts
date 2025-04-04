import { join } from "node:path";
import type { DebugInstance } from "@variableland/console";
import type { NodePlopAPI } from "node-plop";
import nodePlop from "node-plop";
import { console } from "./console";
import { ctx } from "./ctx";
import type { GenerateOptions, TemplateService } from "./types";

type CreateOptions = {
  destBasePath: string;
};

export class PlopTemplateService implements TemplateService {
  #plop: NodePlopAPI;
  #debug: DebugInstance;

  constructor(plop: NodePlopAPI) {
    this.#plop = plop;
    this.#debug = console.subdebug("plop-template-service");
  }

  async generate(options: GenerateOptions) {
    const { generatorId, bypassArr } = options;

    this.#debug("generate options: %O", options);

    const generator = this.#plop.getGenerator(generatorId);

    const answers = await generator.runPrompts(bypassArr);

    this.#debug("generator answers: %O", answers);

    const results = await generator.runActions(answers);

    this.#debug("generator results: %O", results);

    if (results.failures.length > 0) {
      throw new Error("Can't generate files");
    }
  }
}

const PLOP_CONFIG_PATH = join("plopfiles", "plopfile.js");

export async function createPlopTemplateService(options: CreateOptions) {
  const { destBasePath } = options;

  const debug = console.subdebug("create-plop-template-service");

  debug("options: %O", options);

  const configPath = join(ctx.value.binPkg.dirPath, PLOP_CONFIG_PATH);

  debug("plop config path:", configPath);

  const plop = await nodePlop(configPath, {
    force: false,
    destBasePath: destBasePath,
  });

  return new PlopTemplateService(plop);
}
