import type { Shell } from "@vlandoss/clibuddy";

export interface ToolService {
  $: Shell;
  execute(args: string[]): Promise<void>;
}
