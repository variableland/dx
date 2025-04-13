import type { ShellService } from "@variableland/clibuddy";
import type { DebugInstance } from "@variableland/console";
import { console } from "~/services/console";
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
  #debug: DebugInstance;
  #templateService: TemplateService;
  #shellService: ShellService;

  constructor({ templateService, shellService }: CreateOptions) {
    this.#templateService = templateService;
    this.#shellService = shellService;
    this.#debug = console.subdebug("init-action");
  }

  async execute(options: ExecuteOptions) {
    const { destBasePath, git } = options;

    this.#debug("execute options: %O", options);

    const bypassArr = this.#getBypassArr(options);

    await this.#templateService.generate({
      bypassArr,
      generatorId: GENERATOR_ID,
    });

    console.success("Project generated 🎉");

    const $ = this.#shellService.$;
    const $$ = $.quiet({ cwd: destBasePath });

    if (git) {
      console.start("Creating git repository");

      await $$`git init`;
      // NOTE: git commit -am failed, not sure why
      await $$`git add . && git commit -m "initial commit"`;

      console.success("Git repository created");
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
