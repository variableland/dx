import type { InstallContext } from "./types.ts";

export type PickPresetOptions<K extends string> = {
  message: string;
  presets: Record<K, { label: string }>;
  defaultPreset: K;
};

export async function pickPreset<K extends string>(ctx: InstallContext, opts: PickPresetOptions<K>): Promise<K> {
  const { message, presets, defaultPreset } = opts;
  if (ctx.flags.yes || ctx.flags.nonInteractive) return defaultPreset;

  const choice = await ctx.prompts.select<K>({
    message,
    options: (Object.entries(presets) as Array<[K, { label: string }]>).map(([value, meta]) => ({
      value,
      label: meta.label,
    })),
    initialValue: defaultPreset,
  });
  if (ctx.prompts.isCancel(choice)) throw new Error("Cancelled by user.");
  return choice;
}
