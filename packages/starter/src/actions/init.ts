import fs from "node:fs";
import { basename } from "node:path";
import { $ } from "@variableland/clibuddy";
import type { DebugInstance } from "@variableland/console";
import { console } from "~/services/console";
import type { TemplateService } from "~/services/types";
import type { AnyAction } from "./types";

type ExecuteOptions = {
  template: string;
  folderPath: string;
  git: boolean;
};

type CreateOptions = {
  templateService: TemplateService;
};

const GENERATOR_ID = "init";

export class InitAction implements AnyAction<ExecuteOptions> {
  #templateService: TemplateService;
  #debug: DebugInstance;

  constructor({ templateService }: CreateOptions) {
    this.#templateService = templateService;
    this.#debug = console.subdebug("init-action");
  }

  async execute(options: ExecuteOptions) {
    const { template, folderPath, git } = options;

    this.#debug("execute options: %O", options);

    if (!(await Bun.file(folderPath).exists())) {
      await fs.promises.mkdir(folderPath, { recursive: true });
    }

    console.start("Generating project");

    await this.#templateService.generate({
      generatorId: GENERATOR_ID,
      bypassArr: [template, basename(folderPath)],
    });

    console.success("Project generated");

    const $$ = $.quiet({ cwd: folderPath });

    if (git) {
      console.start("Creating git repository");

      await $$`git init`;
      // NOTE: git commit -am failed, not sure why
      await $$`git add . && git commit -m "initial commit"`;

      console.success("Git repository created");
    }
  }
}
