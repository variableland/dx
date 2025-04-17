import type { ShellService } from "@vlandoss/clibuddy";
import { logger } from "~/services/logger";
import type { TemplateService } from "~/services/types";
import type { AnyAction } from "./types";

type ExecuteOptions = {
  template?: string;
  git: boolean;
  destBasePath: string;
};

type CreateOptions = {
  templateService: TemplateService;
  shellService: ShellService;
};

const GENERATOR_ID = "init";

export class InitAction implements AnyAction<ExecuteOptions> {
  #templateService: TemplateService;
  #shellService: ShellService;

  constructor({ templateService, shellService }: CreateOptions) {
    this.#templateService = templateService;
    this.#shellService = shellService;
  }

  async execute(options: ExecuteOptions) {
    const { destBasePath, git } = options;

    const debug = logger.subdebug("init-action");

    debug("execute options: %O", options);

    const bypassArr = this.#getBypassArr(options);

    await this.#templateService.generate({
      bypassArr,
      generatorId: GENERATOR_ID,
    });

    logger.success("Project generated 🎉");

    const $ = this.#shellService.$;
    const $$ = $.quiet({ cwd: destBasePath });

    if (git) {
      logger.start("Creating git repository");

      await $$`git init`;
      // NOTE: git commit -am failed, not sure why
      await $$`git add . && git commit -m "initial commit"`;

      logger.success("Git repository created");
    }
  }

  #getBypassArr(options: ExecuteOptions) {
    const { template } = options;

    const bypassArr: string[] = [];

    if (template) {
      bypassArr[0] = template;
    }

    return bypassArr;
  }
}
