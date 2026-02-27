import type { ShellService } from "@vlandoss/clibuddy";
import { gracefullBinDir } from "#/utils/gracefullBinDir";

type CreateOptions = {
  cmd: string;
  shellService: ShellService;
};

export abstract class ToolService {
  #shellService: ShellService;
  #cmd: string;

  constructor({ cmd, shellService }: CreateOptions) {
    this.#cmd = cmd;
    this.#shellService = shellService;
  }

  abstract getBinDir(): string;

  get $() {
    return this.#shellService.child({
      preferLocal: gracefullBinDir(() => this.getBinDir()),
    }).$;
  }

  async execute(args: string[]): Promise<void> {
    this.$`${this.#cmd} ${args.join(" ")}`;
  }
}
