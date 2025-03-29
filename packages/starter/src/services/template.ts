import type { NodePlopAPI } from "node-plop";
import { Logger } from "./logger";

type GenerateOptions = {
  generatorId: string;
  template: string;
};

export class PlopTemplateService {
  #plop: NodePlopAPI;

  constructor(plop: NodePlopAPI) {
    this.#plop = plop;
  }

  async generate(options: GenerateOptions) {
    const { generatorId, template } = options;

    const d = Logger.subdebug("generate");

    const generator = this.#plop.getGenerator(generatorId);

    const answers = await generator.runPrompts([template]);

    const results = await generator.runActions({
      ...answers,
      template,
    });

    d("plop results: %O", results);

    // TODO: handle results, print them, fail if any errors
  }
}
