import type { DebugInstance } from "@variableland/console";
import { console } from "~/services/console";
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
  #debug: DebugInstance;

  constructor({ templateService }: CreateOptions) {
    this.#templateService = templateService;
    this.#debug = console.subdebug("add-action");
  }

  async execute(options: ExecuteOptions) {
    this.#debug("execute options: %O", options);

    const bypassArr = this.#getBypassArr(options);

    await this.#templateService.generate({
      bypassArr,
      generatorId: GENERATOR_ID,
    });

    console.success("Added successfully 🎉");
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
