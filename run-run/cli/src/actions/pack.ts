import type { ContextValue } from "#src/services/context.ts";
import type { Doctor, Packer } from "#src/types/tool.ts";
import { runToolAction } from "./run-tool.ts";

export type PackActionConfig = {
  ctx: ContextValue;
  packer: Packer & Doctor;
};

export function packAction({ ctx, packer }: PackActionConfig) {
  return runToolAction({ ctx, name: "pack", provider: packer, run: (p) => p.pack() });
}
