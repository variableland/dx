import type { NodePlopAPI } from "node-plop";
import { console } from "./console";

type GenerateOptions = {
  generatorId: string;
  template: string;
  folder: string;
};

export class PlopTemplateService {
  #plop: NodePlopAPI;

  constructor(plop: NodePlopAPI) {
    this.#plop = plop;
  }

  async generate(options: GenerateOptions) {
    const { generatorId, template, folder } = options;

    const debug = console.subdebug("generate");

    const generator = this.#plop.getGenerator(generatorId);

    const answers = await generator.runPrompts([template, folder]);

    const results = await generator.runActions({
      ...answers,
      template,
    });

    debug("plop results: %O", results);

    if (results.failures.length > 0) {
      throw new Error("Can't generate files");
    }
  }
}
