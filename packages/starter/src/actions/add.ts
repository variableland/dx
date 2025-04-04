import type { DebugInstance } from "@variableland/console";
import { console } from "~/services/console";
import type { TemplateService } from "~/services/types";
import type { AnyAction } from "./types";

type CreateOptions = {
  templateService: TemplateService;
};

type ExecuteOptions = {
  configSlug: string;
};

const GENERATOR_ID = "add";

export class AddAction implements AnyAction<ExecuteOptions> {
  #templateService: TemplateService;
  #debug: DebugInstance;

  constructor({ templateService }: CreateOptions) {
    this.#templateService = templateService;
    this.#debug = console.subdebug("add-action");
  }

  async execute(options: ExecuteOptions) {
    const { configSlug } = options;

    this.#debug("execute options: %O", options);

    console.start(`Adding '${configSlug}' config`);

    await this.#templateService.generate({
      generatorId: GENERATOR_ID,
      bypassArr: [configSlug],
    });

    console.success(`Added '${configSlug}' successfully`);
  }
}
