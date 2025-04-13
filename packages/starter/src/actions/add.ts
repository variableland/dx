import { logger } from "~/services/logger";
import type { TemplateService } from "~/services/types";
import type { AnyAction } from "./types";

type CreateOptions = {
  templateService: TemplateService;
};

type ExecuteOptions = {
  slugs: string[];
};

const GENERATOR_ID = "add";

export class AddAction implements AnyAction<ExecuteOptions> {
  #templateService: TemplateService;

  constructor({ templateService }: CreateOptions) {
    this.#templateService = templateService;
  }

  async execute(options: ExecuteOptions) {
    const debug = logger.subdebug("add-action");

    debug("execute options: %O", options);

    const bypassArr = this.#getBypassArr(options);

    await this.#templateService.generate({
      bypassArr,
      generatorId: GENERATOR_ID,
    });

    logger.success("Added successfully 🎉");
  }

  #getBypassArr(options: ExecuteOptions) {
    const { slugs } = options;

    const bypassArr: string[] = [];

    if (slugs.length) {
      bypassArr[0] = slugs.join(",");
    }

    return bypassArr;
  }
}
