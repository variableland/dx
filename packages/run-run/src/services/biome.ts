import type { ShellService } from "@vlandoss/clibuddy";
import { gracefullBinDir } from "~/utils/gracefullBinDir";
import type { ToolService } from "./models";

export class BiomeService implements ToolService {
  #shellService: ShellService;

  constructor(shellService: ShellService) {
    this.#shellService = shellService;
  }

  async execute(args: string[]): Promise<void> {
    const { $ } = this.#shellService.child({
      preferLocal: this.#getBinDir(),
    });

    $`biome ${args.join(" ")}`;
  }

  #getBinDir() {
    return gracefullBinDir(() => require.resolve("@biomejs/biome/bin/biome"));
  }
}
