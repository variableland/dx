import type { InstallContext } from "./types.ts";

export type ScaffoldDecision = "create" | "patch" | "overwrite" | "skip";

export type DecideScaffoldOptions = {
  /** The config file label shown to the user (e.g. `"biome.json"`, `"tsdown.config.ts"`). */
  label: string;
  /** Whether the file currently exists in the app project. */
  fileExists: boolean;
  /** Short description of what "patch" does, shown in the select option. */
  patchHint: string;
  /**
   * What to return when the file exists and the run is unattended (`--yes` / non-interactive).
   * - `"patch"` (default): assume the user wants to merge our config into theirs (safe for JSON we can edit).
   * - `"skip"`: assume the user owns the file (right for TS modules we'd otherwise rewrite blindly).
   */
  unattendedExistingAction?: "patch" | "skip";
};

export async function decideScaffold(ctx: InstallContext, opts: DecideScaffoldOptions): Promise<ScaffoldDecision> {
  const { label, fileExists, patchHint, unattendedExistingAction = "patch" } = opts;

  if (!fileExists) {
    if (ctx.flags.yes || ctx.flags.nonInteractive) return "create";
    const choice = await ctx.prompts.confirm({
      message: `Scaffold ${label}?`,
      initialValue: true,
    });
    if (ctx.prompts.isCancel(choice)) throw new Error("Cancelled by user.");
    return choice ? "create" : "skip";
  }

  if (ctx.flags.yes || ctx.flags.nonInteractive) return unattendedExistingAction;

  const choice = await ctx.prompts.select<ScaffoldDecision>({
    message: `${label} already exists. What do you want to do?`,
    options: [
      { value: "patch", label: `Patch — ${patchHint}` },
      { value: "skip", label: "Skip — leave it alone" },
      { value: "overwrite", label: "Overwrite — replace with a fresh scaffold" },
    ],
    initialValue: "patch",
  });
  if (ctx.prompts.isCancel(choice)) throw new Error("Cancelled by user.");
  return choice;
}
